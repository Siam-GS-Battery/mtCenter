import Anthropic from "@anthropic-ai/sdk";
import { config } from "../../config.js";
import type {
  ChatContentPart,
  ChatMessage,
  GenerateOptions,
  LlmProvider,
  LlmResponse,
  LlmStopReason,
  SystemPromptSegment,
} from "../llmProvider.js";

// Model chain: try the cheap/fast model first, fall back to the more capable one
// on rate-limit/5xx/transient errors. Mirrors the FALLBACK_MODELS retry style in
// routes/ai.ts (try each model in order, silently move to the next on failure).
// Exported as a named const so changing the chain is a one-line edit.
export const CLAUDE_FALLBACK_MODELS = ["claude-haiku-4-5", "claude-sonnet-5"] as const;

// Explicit ALLOW-list (opt-in), not a deny-list: `temperature` is sent ONLY for
// models listed here as confirmed to accept it. claude-haiku-4-5 accepts it;
// claude-sonnet-5 and claude-opus-5 REJECT an explicit `temperature` with HTTP
// 400 (the installed SDK's own MessageCreateParams.temperature doc confirms
// this: "Deprecated. Models released after Claude Opus 4.6 do not support
// setting temperature."). RULE: a model added to CLAUDE_FALLBACK_MODELS that is
// NOT also added here simply won't receive `temperature` (safe/no-op) instead
// of silently sending an unsupported param and getting a hard 400 — inverted
// from a deny-list on purpose so forgetting to update this set fails safe.
const MODELS_WITH_TEMPERATURE_SUPPORT = new Set<string>(["claude-haiku-4-5"]);
const DEFAULT_TEMPERATURE = 0.2;

// Claude has no direct equivalent of Gemini's `responseMimeType: "application/json"`.
// The installed SDK (@anthropic-ai/sdk 0.120.0) exposes a stable (non-beta)
// `output_config.format` structured-output field (`JSONOutputFormat`, type
// "json_schema") — see MessageCreateParams in the SDK's messages.d.ts. We do NOT
// use it here: verified live against the real API, a schema-less/"any object"
// json_schema is fundamentally impossible on this endpoint —
//   - `{type:"object", additionalProperties: true}` → HTTP 400
//     ("For 'object' type, 'additionalProperties: true' is not supported")
//   - `{type:"object", additionalProperties: false}` with no `properties` →
//     200 OK but the model is forced to emit the empty object "{}" every time
//     (no properties are declared as allowed, so none can appear) — this
//     "succeeds" but silently returns a useless empty diagnosis to /diagnose,
//     which is worse than a request failure since ai.ts never validates the
//     parsed shape before returning it to the client
//   - `{}` (empty schema) → HTTP 400 ("Empty schema... not supported")
// GenerateOptions.forceJson is a plain boolean with no schema parameter (kept
// generic on purpose — this provider must not hardcode /diagnose's fields), so
// there is no concrete schema available to pass here. Instead we rely on the
// caller's system prompt to instruct JSON-only output (already the case for
// both /chat's forceJson-free path and /diagnose's forceJson path) and strip
// markdown code fences below — Claude frequently wraps JSON in ```json ... ```
// even when told not to, and that fencing (not malformed JSON) is the actual
// cause of JSON.parse failures observed in testing.
const JSON_CODE_FENCE_RE = /^\s*```(?:json)?\s*\n?([\s\S]*?)\n?\s*```\s*$/i;

function stripJsonCodeFence(text: string): string {
  const match = JSON_CODE_FENCE_RE.exec(text);
  return match ? match[1] : text;
}

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!config.anthropicApiKey) return null;
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

function mapContentPart(part: ChatContentPart): Anthropic.TextBlockParam | Anthropic.ImageBlockParam {
  if (part.type === "image") {
    return {
      type: "image",
      source: {
        type: "base64",
        // Claude's Base64ImageSource only accepts these four MIME types. Any other
        // value passed in from a caller is narrowed to jpeg as a safe default —
        // /diagnose today always sends image/jpeg.
        media_type: (["image/jpeg", "image/png", "image/gif", "image/webp"] as const).includes(
          part.mimeType as never
        )
          ? (part.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
          : "image/jpeg",
        data: part.base64Data,
      },
    };
  }
  return { type: "text", text: part.text };
}

function mapMessage(message: ChatMessage): Anthropic.MessageParam {
  return {
    role: message.role,
    content: typeof message.content === "string" ? message.content : message.content.map(mapContentPart),
  };
}

function mapStopReason(stopReason: Anthropic.Message["stop_reason"]): LlmStopReason {
  switch (stopReason) {
    case "end_turn":
    case "stop_sequence":
    case "pause_turn":
      return "end_turn";
    case "max_tokens":
      return "max_tokens";
    case "tool_use":
      return "tool_use";
    case "refusal":
      return "refusal";
    default:
      // "model_context_window_exceeded" or any future value — never seen today
      // since we don't yet send tools/long histories, but never silently claim a
      // successful end_turn for an unrecognized reason.
      return "error";
  }
}

function extractText(content: Anthropic.Message["content"]): string {
  const parts: string[] = [];
  for (const block of content) {
    if (block.type === "text") parts.push(block.text);
  }
  return parts.join("");
}

// Errors worth trying the next model in the chain for: rate limits, server
// errors/transient network failures. Anything else (e.g. a genuine 400 from a
// malformed request) still just moves to the next model — we have no better
// recovery within this call, and the caller (ai.ts) already has its own
// generateOfflineAnswer() safety net for when every model fails.
// Builds the `system` blocks Anthropic expects from either a plain string
// (backward-compatible: treated as one cacheable block, same as the previous
// behavior) or an ordered list of segments. cache_control is placed ONLY on
// the LAST segment marked cacheable — not blindly on the last block — so a
// prompt built as [static/cacheable, dynamic/per-request] caches just the
// stable prefix and never caches (or invalidates on) the per-request part. If
// no segment is cacheable, no cache_control is emitted at all.
function buildSystemBlocks(systemInstruction: GenerateOptions["systemInstruction"]): Anthropic.TextBlockParam[] {
  const segments: SystemPromptSegment[] =
    typeof systemInstruction === "string" ? [{ text: systemInstruction, cacheable: true }] : systemInstruction;

  let lastCacheableIndex = -1;
  segments.forEach((segment, index) => {
    if (segment.cacheable) lastCacheableIndex = index;
  });

  return segments.map((segment, index) => ({
    type: "text",
    text: segment.text,
    // Prompt caching: cache_control is stable (non-beta) in the installed SDK
    // — see CacheControlEphemeral usage on TextBlockParam in messages.d.ts.
    ...(index === lastCacheableIndex ? { cache_control: { type: "ephemeral" as const } } : {}),
  }));
}

async function tryModel(
  anthropic: Anthropic,
  modelName: string,
  options: GenerateOptions
): Promise<LlmResponse | null> {
  try {
    const systemBlocks = buildSystemBlocks(options.systemInstruction);

    const response = await anthropic.messages.create({
      model: modelName,
      // 4096 is a safety-net default only — every real call site (ai.ts /chat
      // and /diagnose) now passes an explicit maxOutputTokens. A silent 2048
      // cap previously truncated long Thai replies and, worse, truncated
      // /diagnose's structured JSON mid-output (JSON.parse then throws and the
      // route 502s instead of returning a diagnosis).
      max_tokens: options.maxOutputTokens ?? 4096,
      system: systemBlocks,
      messages: options.messages.map(mapMessage),
      ...(MODELS_WITH_TEMPERATURE_SUPPORT.has(modelName) ? { temperature: DEFAULT_TEMPERATURE } : {}),
    });

    const rawText = extractText(response.content);
    const text = options.forceJson ? stripJsonCodeFence(rawText) : rawText;
    if (!text) return null;

    return {
      text,
      stopReason: mapStopReason(response.stop_reason),
      modelUsed: modelName,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? undefined,
      },
    };
  } catch {
    // Rate limit / 5xx / transient network error / anything else — try the next
    // model in the chain (or exhaust it, see generate() below).
    return null;
  }
}

// Streams a single model attempt. Yields text deltas as they arrive; RETURNS
// (generator return value, not a yield) either the finished LlmResponse, or
// null to tell the caller "this model produced nothing usable, try the next
// one in the chain" — mirrors tryModel()'s null-means-try-next-model contract.
//
// Falling back to the next model mid-stream is only safe BEFORE any delta has
// already reached the caller (and therefore the end user) — once text has
// been emitted, silently retrying on another model would make the client see
// a second, unrelated reply appended after a partial first one. So: an error
// with zero deltas yielded so far returns null (try next model); an error
// after at least one delta was yielded stops the chain and resolves with
// stopReason "error" instead of throwing, same as generate()'s contract.
async function* streamModel(
  anthropic: Anthropic,
  modelName: string,
  options: GenerateOptions
): AsyncGenerator<string, LlmResponse | null, void> {
  let yieldedAny = false;
  try {
    const systemBlocks = buildSystemBlocks(options.systemInstruction);
    const stream = anthropic.messages.stream(
      {
        model: modelName,
        max_tokens: options.maxOutputTokens ?? 4096,
        system: systemBlocks,
        messages: options.messages.map(mapMessage),
        ...(MODELS_WITH_TEMPERATURE_SUPPORT.has(modelName) ? { temperature: DEFAULT_TEMPERATURE } : {}),
      },
      options.signal ? { signal: options.signal } : undefined
    );

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
        yieldedAny = true;
        yield event.delta.text;
      }
    }

    const finalMessage = await stream.finalMessage();
    const rawText = extractText(finalMessage.content);
    const text = options.forceJson ? stripJsonCodeFence(rawText) : rawText;
    if (!text) return yieldedAny ? { text: "", stopReason: "error", modelUsed: modelName, usage: { inputTokens: 0, outputTokens: 0 } } : null;

    return {
      text,
      stopReason: mapStopReason(finalMessage.stop_reason),
      modelUsed: modelName,
      usage: {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
        cacheReadTokens: finalMessage.usage.cache_read_input_tokens ?? undefined,
      },
    };
  } catch {
    // Rate limit / 5xx / transient network / stream aborted (e.g. client
    // disconnected — see AbortController usage at the call site in ai.ts).
    if (yieldedAny) {
      return { text: "", stopReason: "error", modelUsed: modelName, usage: { inputTokens: 0, outputTokens: 0 } };
    }
    return null;
  }
}

export const claudeProvider: LlmProvider = {
  name: "claude",

  async *generateStream(options: GenerateOptions): AsyncGenerator<string, LlmResponse, void> {
    const anthropic = getClient();
    if (!anthropic) {
      return { text: "", stopReason: "error", modelUsed: "", usage: { inputTokens: 0, outputTokens: 0 } };
    }

    for (const modelName of CLAUDE_FALLBACK_MODELS) {
      const gen = streamModel(anthropic, modelName, options);
      let result: LlmResponse | null = null;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const step = await gen.next();
        if (step.done) {
          result = step.value;
          break;
        }
        yield step.value;
      }
      if (result) return result;
    }

    return { text: "", stopReason: "error", modelUsed: "", usage: { inputTokens: 0, outputTokens: 0 } };
  },

  async generate(options: GenerateOptions): Promise<LlmResponse> {
    const anthropic = getClient();
    if (!anthropic) {
      // No ANTHROPIC_API_KEY configured — behave like the existing missing-key
      // case: never throw, let ai.ts fall through to generateOfflineAnswer().
      return {
        text: "",
        stopReason: "error",
        modelUsed: "",
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    }

    for (const modelName of CLAUDE_FALLBACK_MODELS) {
      // eslint-disable-next-line no-await-in-loop
      const result = await tryModel(anthropic, modelName, options);
      if (result) return result;
    }

    // Every model in the chain failed — map to stopReason "error" with empty
    // text rather than throwing, so ai.ts's existing offline fallback kicks in.
    return {
      text: "",
      stopReason: "error",
      modelUsed: "",
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  },
};
