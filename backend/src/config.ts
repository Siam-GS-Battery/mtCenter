import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill in the value.`
    );
  }
  if (/[^\x00-\xFF]/.test(value)) {
    throw new Error(
      `Env var "${name}" contains non-Latin-1 characters at index ${value.search(/[^\x00-\xFF]/)} — check for text accidentally pasted onto the value line in .env`
    );
  }
  return value;
}

/**
 * โหมดการทำงานของผู้ช่วย AI
 *
 * - "mock": ตอบด้วยกฎ + ข้อมูลจริงจากฐานข้อมูล (src/lib/mockAssistant.ts) ไม่เรียก
 *   โมเดลภาษาเลย ตรงตาม UX Storyboard Frame 1 ที่ระบุว่า "ยังไม่ใช้ AI — query DB +
 *   rule" เหมาะกับการสาธิต POC เพราะคำตอบคงที่ ตรวจสอบย้อนกลับได้ทุกตัวเลข และไม่
 *   ผูกกับโควตา/คีย์ของผู้ให้บริการภายนอก
 * - "live": เรียก Gemini จริงพร้อมบล็อกข้อมูลจากฐานข้อมูลและคู่มือ (เส้นทางเดิม)
 *
 * ค่าเริ่มต้นเป็น "mock" โดยเจตนา: การสาธิตต้องทำงานได้ทันทีบนเครื่องที่ยังไม่ได้ตั้ง
 * GEMINI_API_KEY และต้องไม่มีวันล้มเพราะโควตาภายนอกหมด ตั้ง AI_MODE=live เมื่อพร้อม
 * ใช้โมเดลจริง
 */
export type AiMode = "mock" | "live";

function parseAiMode(raw: string | undefined): AiMode {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "live") return "live";
  if (value === "mock" || value === "") return "mock";
  throw new Error(`ค่า AI_MODE ไม่ถูกต้อง: "${raw}" รองรับเฉพาะ "mock" หรือ "live"`);
}

export interface AppConfig {
  port: number;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  geminiApiKey: string | undefined;
  corsOrigins: string[];
  aiMode: AiMode;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  geminiApiKey: process.env.GEMINI_API_KEY,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  aiMode: parseAiMode(process.env.AI_MODE),
};
