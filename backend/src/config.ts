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
 * JWT_SECRET ต้องผ่าน required() เหมือน env var อื่นทุกตัว (เดิม lib/auth.ts อ่าน
 * process.env เองจึงข้ามการตรวจของ required() ไป) และต้องยาวพอที่จะ brute-force ไม่ได้
 * — HS256 ที่ secret สั้นเดาได้เท่ากับไม่มี auth เลย จึงบังคับอย่างน้อย 32 ตัวอักษร
 * fail closed: ถ้าไม่ผ่านให้ throw ตอน startup ทันที
 */
const MIN_JWT_SECRET_LENGTH = 32;

function requiredSecret(name: string): string {
  const value = required(name).trim();
  if (value.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `ค่า "${name}" สั้นเกินไป (${value.length} ตัวอักษร) ต้องมีอย่างน้อย ${MIN_JWT_SECRET_LENGTH} ตัวอักษร / ` +
        `Env var "${name}" is too short (${value.length} chars); it must be at least ${MIN_JWT_SECRET_LENGTH} characters. ` +
        `Generate one with: openssl rand -base64 48`
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

/**
 * ผู้ให้บริการโมเดลภาษาที่ใช้ในเส้นทาง chat/diagnose (ดู src/lib/providers/)
 *
 * - "claude": เรียก Anthropic Claude (ค่าเริ่มต้น) — การตัดสินใจคือย้ายมาใช้ Claude
 *   เป็นหลัก
 * - "gemini": เรียก Google Gemini เหมือนเดิม — เก็บไว้เป็นทางหนีทีไล่ (escape hatch)
 *   จนกว่าจะลบออกทั้งหมด ไม่ใช่เส้นทางที่แนะนำให้ใช้ต่อ
 *
 * หมายเหตุ: Embeddings (ค้นคู่มือ) ยังใช้ Gemini อยู่เสมอไม่ว่าค่านี้จะเป็นอะไร —
 * ค่านี้มีผลเฉพาะเส้นทาง chat/diagnose เท่านั้น (ดู src/lib/embeddings.ts)
 */
export type AiProvider = "gemini" | "claude";

function parseAiProvider(raw: string | undefined): AiProvider {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "gemini") return "gemini";
  if (value === "claude" || value === "") return "claude";
  throw new Error(`ค่า AI_PROVIDER ไม่ถูกต้อง: "${raw}" รองรับเฉพาะ "claude" หรือ "gemini"`);
}

export interface AppConfig {
  port: number;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  jwtSecret: string;
  geminiApiKey: string | undefined;
  anthropicApiKey: string | undefined;
  corsOrigins: string[];
  aiMode: AiMode;
  aiProvider: AiProvider;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  jwtSecret: requiredSecret("JWT_SECRET"),
  geminiApiKey: process.env.GEMINI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  aiMode: parseAiMode(process.env.AI_MODE),
  aiProvider: parseAiProvider(process.env.AI_PROVIDER),
};
