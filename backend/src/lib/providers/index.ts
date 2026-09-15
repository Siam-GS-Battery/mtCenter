import { config } from "../../config.js";
import type { LlmProvider } from "../llmProvider.js";
import { claudeProvider } from "./claudeProvider.js";
import { geminiProvider } from "./geminiProvider.js";

// Single call site for routes/ai.ts to get whichever LLM provider is configured
// (see config.aiProvider / AI_PROVIDER). Each provider already handles its own
// missing-API-key case by returning stopReason: "error" instead of throwing.
export function getLlmProvider(): LlmProvider {
  return config.aiProvider === "gemini" ? geminiProvider : claudeProvider;
}
