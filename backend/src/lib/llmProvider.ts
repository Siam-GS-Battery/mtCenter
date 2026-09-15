// Provider-agnostic types + interface for the chat/diagnose LLM call sites in
// backend/src/routes/ai.ts. Keeps ai.ts's business logic (systemInstruction text,
// buildKnowledgeContext, sanitizeForPrompt, JSON parsing for /diagnose, offline
// fallback) unaware of which vendor (Claude, Gemini, ...) actually answered.
//
// Intentionally minimal — no tool-calling types here, that's a later task.

export type ChatRole = "user" | "assistant";

export interface ChatTextPart {
  type: "text";
  text: string;
}

export interface ChatImagePart {
  type: "image";
  mimeType: string;
  base64Data: string;
}

export type ChatContentPart = ChatTextPart | ChatImagePart;

export interface ChatMessage {
  role: ChatRole;
  content: string | ChatContentPart[];
}

// "error" is not a real vendor stop reason — providers map any unrecoverable
// failure (all models in a fallback chain exhausted, network error, etc.) to it
// so callers can treat "no usable answer" uniformly regardless of provider.
export type LlmStopReason = "end_turn" | "max_tokens" | "tool_use" | "refusal" | "error";

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
  // Present only when the provider actually reports a cache read (e.g. Claude's
  // cache_read_input_tokens). Omitted rather than 0 when the provider has no
  // concept of prompt caching, so callers can distinguish "no cache hit" from
  // "caching not applicable here".
  cacheReadTokens?: number;
}

export interface LlmResponse {
  text: string;
  stopReason: LlmStopReason;
  modelUsed: string;
  usage: LlmUsage;
}

// A system prompt segment, used when the caller needs to mark part of the
// prompt as a stable/cacheable prefix (Claude prompt caching) and another part
// as per-request/non-cacheable data. `cacheable` defaults to false when
// omitted — callers must opt a segment in explicitly.
export interface SystemPromptSegment {
  text: string;
  cacheable?: boolean;
}

export interface GenerateOptions {
  // Plain string keeps the old, simple behavior (treated as a single cacheable
  // block by claudeProvider, joined as-is by geminiProvider). Pass an ordered
  // array of segments when the prompt has both an invariant part (safe to
  // cache) and a per-request part (never repeats, must not be cached).
  systemInstruction: string | SystemPromptSegment[];
  messages: ChatMessage[];
  // When true, the provider must do whatever is needed on its own API surface to
  // reliably return parseable JSON (used by /diagnose).
  forceJson?: boolean;
  maxOutputTokens?: number;
  // Optional: lets the caller cancel an in-flight request (e.g. the streaming
  // chat route stops work when the client disconnects — see req.on("close")
  // in routes/ai.ts). Providers that don't support cancellation may ignore it.
  signal?: AbortSignal;
}

// `name` is intentionally a union of every provider this app supports (not just
// "claude") so both claudeProvider and geminiProvider can implement this same
// interface and ai.ts can have a single call site selected via config.aiProvider.
export type LlmProviderName = "claude" | "gemini";

export interface LlmProvider {
  readonly name: LlmProviderName;
  generate(options: GenerateOptions): Promise<LlmResponse>;
  // Optional: streaming variant of generate(). An async generator that yields
  // plain text deltas as they arrive and, once the model finishes, RETURNS
  // (not yields) the same LlmResponse shape generate() resolves with — so a
  // caller can do:
  //   const gen = provider.generateStream(options);
  //   let step = await gen.next();
  //   while (!step.done) { useDelta(step.value); step = await gen.next(); }
  //   const finalResponse = step.value; // LlmResponse
  // Same "never throw" contract as generate(): any unrecoverable failure must
  // be surfaced as the returned LlmResponse's stopReason: "error", never as a
  // thrown/rejected error. Providers without a streaming API (e.g. Gemini,
  // for now) simply omit this method — callers must check for its presence
  // and fall back to generate() when absent.
  generateStream?(options: GenerateOptions): AsyncGenerator<string, LlmResponse, void>;
}
