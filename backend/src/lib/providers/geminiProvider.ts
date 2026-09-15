// Extracted from the previous inline Gemini calls in routes/ai.ts so that file has
// a single call site (through getLlmProvider()) instead of two branches inline.
// Behavior is unchanged from before this refactor: same FALLBACK_MODELS list,
// same temperature/responseMimeType handling, same silent per-model fallback.
//
// Kept as the AI_PROVIDER=gemini escape hatch until it is deleted (see config.ts
// — the decision is to move to Claude; gemini stays only as a fallback for now).
// Embeddings (embeddings.ts / manualIndexer.ts / manualRetrieval.ts) are a
// separate, untouched use of @google/genai — this file does not affect them.

import { GoogleGenAI } from "@google/genai";
import { config } from "../../config.js";
import type { ChatContentPart, ChatMessage, GenerateOptions, LlmProvider, LlmResponse } from "../llmProvider.js";

// เดิมลิสต์นี้ชี้ไปที่ gemini-2.0-flash / gemini-1.5-flash / gemini-2.0-flash-lite
// ซึ่งถูก Google ยกเลิก (retired) ไปแล้ว เรียก generateContent แล้วได้ HTTP 404
// เสมอ ทำให้ทุก request หลุดไปใช้ generateOfflineAnswer() แบบเงียบๆโดยไม่มีใคร
// รู้ตัว — ตรวจสอบแล้วว่า model ID ด้านล่างนี้เรียก generateContent ได้จริง
// (สถานะ 200 พร้อมคำตอบ) กับ GEMINI_API_KEY ของโปรเจกต์นี้ ณ วันที่ตรวจสอบ
const GEMINI_FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];

function getGenAI(): GoogleGenAI | null {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing from environment");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// `@google/genai`'s content-part type isn't re-exported in a convenient shape for
// this generic mapping — `any` here mirrors the pre-existing `contents as any` /
// `parts: any[]` casts that were already in routes/ai.ts before this refactor.
function mapContentPart(part: ChatContentPart): any {
  if (part.type === "image") {
    return { inlineData: { mimeType: part.mimeType, data: part.base64Data } };
  }
  return { text: part.text };
}

function mapMessage(message: ChatMessage): { role: string; parts: any[] } {
  return {
    role: message.role === "assistant" ? "model" : "user",
    parts: typeof message.content === "string" ? [{ text: message.content }] : message.content.map(mapContentPart),
  };
}

export const geminiProvider: LlmProvider = {
  name: "gemini",

  async generate(options: GenerateOptions): Promise<LlmResponse> {
    const ai = getGenAI();
    if (!ai) {
      return { text: "", stopReason: "error", modelUsed: "", usage: { inputTokens: 0, outputTokens: 0 } };
    }

    const contents = options.messages.map(mapMessage);

    // Gemini has no per-block cache_control (unlike Claude) — a segment array
    // is just joined into one string, so behavior here is unchanged regardless
    // of which `cacheable` flags a caller sets.
    const systemInstruction =
      typeof options.systemInstruction === "string"
        ? options.systemInstruction
        : options.systemInstruction.map((segment) => segment.text).join("\n");

    for (const modelName of GEMINI_FALLBACK_MODELS) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents as any,
          config: {
            systemInstruction,
            // Mirrors the previous behavior exactly: /chat passed temperature: 0.3
            // and no responseMimeType; /diagnose passed responseMimeType:
            // "application/json" and no temperature.
            ...(options.forceJson ? { responseMimeType: "application/json" } : { temperature: 0.3 }),
          },
        });

        if (response && response.text) {
          const usageMetadata = (response as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } })
            .usageMetadata;
          return {
            text: response.text,
            stopReason: "end_turn",
            modelUsed: modelName,
            usage: {
              inputTokens: usageMetadata?.promptTokenCount ?? 0,
              outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
            },
          };
        }
      } catch {
        // Model quota or rate limit reached; try next or fall back silently
      }
    }

    return { text: "", stopReason: "error", modelUsed: "", usage: { inputTokens: 0, outputTokens: 0 } };
  },
};
