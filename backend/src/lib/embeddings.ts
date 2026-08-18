// Embedding helper สำหรับคลังความรู้คู่มือ (semantic search / RAG)
// ใช้ร่วมกันระหว่างตัว indexer (backend/scripts/index-manuals.ts) และตัวค้นหาตอนตอบ
// คำถาม (backend/src/lib/manualRetrieval.ts) — ทั้งสองฝั่ง "ต้อง" ใช้โมเดล มิติ และ
// การ normalize ชุดเดียวกัน ไม่งั้นเวกเตอร์คำถามกับเวกเตอร์ในฐานข้อมูลจะอยู่คนละปริภูมิ
// และผลค้นหาจะมั่วโดยไม่มี error ใด ๆ ปรากฏ

import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

// ตรวจสอบแล้วว่าเรียก embedContent ได้จริงกับ GEMINI_API_KEY ของโปรเจกต์นี้
// (text-embedding-004 และ gemini-embedding-exp-03-07 ให้ HTTP 404 กับคีย์นี้แล้ว
//  ห้ามเปลี่ยนกลับไปใช้ — ดูหมายเหตุแบบเดียวกันเรื่องโมเดล chat ใน routes/ai.ts)
export const EMBEDDING_MODEL = "gemini-embedding-001";

// 768 มิติ (จาก 3072 มิติเต็มของโมเดล) แลกความแม่นยำที่ลดลงเล็กน้อยกับขนาดดัชนีที่
// เล็กลง 4 เท่า — คลังนี้มีประมาณ 15,000 chunk การใช้ 3072 มิติจะกินพื้นที่เกือบ 200MB
// ค่านี้ต้องตรงกับ vector(768) ใน migration 0015_manual_chunks.sql เสมอ
// เปลี่ยนค่านี้ = ต้อง migrate คอลัมน์ embedding และ re-index ใหม่ทั้งคลัง
export const EMBEDDING_DIMENSIONS = 768;

// Gemini batchEmbedContents รับได้สูงสุด 100 รายการต่อคำขอ
export const MAX_BATCH_SIZE = 100;

// taskType บอกโมเดลว่าเวกเตอร์นี้จะถูกใช้เป็น "เอกสารที่ถูกค้นหา" หรือ "คำค้น"
// โมเดลสร้างเวกเตอร์คนละแบบสำหรับสองบทบาทนี้ และการใช้สลับกันทำให้คุณภาพผลค้นหาตก
export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment — cannot create embeddings");
  }
  if (!client) {
    client = new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return client;
}

// Google "ไม่" คืนเวกเตอร์ที่ normalize แล้วเมื่อ outputDimensionality != 3072
// (วัดจริงกับคีย์ของโปรเจกต์นี้ได้ norm ประมาณ 0.58) ถ้าเก็บดิบ ๆ ระยะ cosine จะยังพอ
// ใช้ได้ แต่ inner-product/สูตรคะแนนใด ๆ ที่สมมติว่าเป็นเวกเตอร์หน่วยจะเพี้ยนทันที
// จึง normalize ที่นี่ที่เดียวให้ทั้งระบบมั่นใจได้ว่าเวกเตอร์ทุกตัวยาว 1 เสมอ
function l2Normalize(values: number[]): number[] {
  let sumSquares = 0;
  for (const v of values) sumSquares += v * v;
  const norm = Math.sqrt(sumSquares);
  // เวกเตอร์ศูนย์ (ไม่ควรเกิด แต่ถ้าเกิดแล้วหารด้วย 0 จะได้ NaN ทั้งแถวและ Postgres
  // จะปฏิเสธการ insert แบบงง ๆ) — คืนค่าเดิมไปให้ผู้เรียกตรวจเจอเองดีกว่า
  if (norm === 0 || !Number.isFinite(norm)) return values;
  return values.map((v) => v / norm);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- ตัวจำกัดอัตราฝั่งเรา (client-side rate limiter) -------------------------
//
// โควตา free tier ของ Gemini นับ "ชิ้นข้อความ" ไม่ใช่ "จำนวนคำขอ" — ยืนยันด้วยการ
// ทดลองจริง: หลังใช้ไป 6 ชิ้น การส่ง batch ที่มี 100 รายการครั้งเดียวถูกปฏิเสธ 429
// ทันที (6 + 100 > 100) แต่ batch 2 รายการถัดมายังผ่าน การส่ง batch ใหญ่ ๆ รัว ๆ จึง
// ชนโควตาแน่นอน ไม่ว่าจะ retry กี่รอบก็ตาม
//
// ทำไมต้องกันฝั่งเราแทนที่จะพึ่ง retry อย่างเดียว: การ index ทั้งคลัง (~15,700 chunk)
// ใช้เวลาระดับชั่วโมง ถ้าปล่อยให้ชน 429 แล้วค่อยถอย จะเสียเวลาไปกับการรอสุ่ม ๆ และ
// เสี่ยงโดนมองว่าเป็น abuse — การเดินให้พอดีโควตาตั้งแต่แรกเร็วกว่าและสุภาพกว่า
//
// ใช้หน้าต่างเลื่อน (sliding window) 60 วินาที เพราะโควตาเป็นแบบต่อนาที
const RATE_WINDOW_MS = 60_000;
// ตั้งต่ำกว่าเพดานจริง (100) โดยตั้งใจ เผื่อไว้สองอย่าง: (1) เวลาของเครื่องเรากับของ
// Google ไม่ตรงกันเป๊ะ ขอบหน้าต่างจึงคลาดกันได้ (2) เส้นทางตอบแชตก็ใช้โควตาก้อน
// เดียวกันนี้ (ค้นคู่มือ = 1 ชิ้นต่อข้อความ) การ index ไม่ควรกินจนผู้ใช้แชตไม่ได้
// ปรับได้ผ่าน env GEMINI_EMBED_RPM หากอัปเกรดเป็น paid tier (เพดานสูงกว่ามาก)
export const RATE_LIMIT_UNITS = Number(process.env.GEMINI_EMBED_RPM) || 90;

// ขนาด batch ที่ผู้เรียกควรใช้ — ต้องไม่เกินเพดานต่อนาที ไม่ใช่แค่ไม่เกิน MAX_BATCH_SIZE
//
// บั๊กที่เคยเกิด: ตัวจำกัดอัตราตั้งเพดานไว้ 90 ชิ้น/นาที แต่ indexer ส่ง batch ละ 100 ชิ้น
// (MAX_BATCH_SIZE) คำขอเดียวจึงใหญ่เกินเพดานทั้งนาทีตั้งแต่ต้น ทำให้ทางออกกัน deadlock
// ใน reserveRateBudget ทำงานทุกครั้งและ "ปิดการหน่วงทั้งหมดโดยไม่มีใครรู้" — ผลคือชน
// 429 ทุกรอบเหมือนไม่มี rate limiter อยู่เลย ค่านี้ผูกสองตัวเลขให้สอดคล้องกันเสมอ
export const EMBED_BATCH_SIZE = Math.max(1, Math.min(MAX_BATCH_SIZE, RATE_LIMIT_UNITS));

interface RateEntry {
  at: number;
  units: number;
}
let rateWindow: RateEntry[] = [];
// คิวแบบต่อกันเป็นทอด ๆ: การเรียก embedBatch พร้อมกันหลายจุด (เช่น indexer กับการ
// ตอบแชต) ต้องจองโควตาทีละรายไม่ทับกัน ไม่งั้นสองฝ่ายจะอ่านยอดคงเหลือค่าเดียวกัน
// แล้วจองเกินพร้อมกันทั้งคู่ (race condition)
let rateGate: Promise<void> = Promise.resolve();

async function reserveRateBudget(units: number): Promise<void> {
  const previous = rateGate;
  let release!: () => void;
  rateGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const now = Date.now();
      rateWindow = rateWindow.filter((entry) => now - entry.at < RATE_WINDOW_MS);
      const used = rateWindow.reduce((sum, entry) => sum + entry.units, 0);
      // ไม่มีทางออกกัน deadlock ที่นี่โดยเจตนา: คำขอที่ใหญ่เกินเพดานถูกปฏิเสธไปแล้วใน
      // embedBatch (ดู EMBED_BATCH_SIZE) ทางออกแบบเดิมคือต้นเหตุที่ทำให้การหน่วงถูก
      // ปิดเงียบ ๆ ทั้งระบบ — ถ้าเงื่อนไขนี้ค้างวน แปลว่ามีผู้เรียกเลี่ยงการตรวจนั้นไปได้
      // ซึ่งควรเห็นเป็นอาการค้างที่สังเกตได้ ดีกว่าการยิงชนโควตาเงียบ ๆ
      if (used + units <= RATE_LIMIT_UNITS) {
        rateWindow.push({ at: now, units });
        return;
      }
      // รอจนรายการที่เก่าที่สุดหลุดออกจากหน้าต่าง แล้วค่อยประเมินใหม่
      const oldest = rateWindow[0];
      await sleep(Math.max(250, RATE_WINDOW_MS - (now - oldest.at) + 250));
    }
  } finally {
    release();
  }
}

// ลองใหม่เมื่อเจอ error ชั่วคราว (429 rate limit / 5xx) — การ index คู่มือทั้งคลังยิง
// คำขอหลายร้อยครั้งติดกัน โดนจำกัดอัตราเป็นเรื่องปกติและไม่ควรทำให้งานทั้งชุดล้ม
// ส่วน error ถาวร (400 = ข้อมูลเข้าไม่ถูกต้อง, 403 = คีย์ผิด) โยนออกทันทีไม่ต้องลองซ้ำ
const MAX_ATTEMPTS = 6;
const BASE_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 90_000;

function isRetryable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(429|500|502|503|504)\b/.test(message) || /RESOURCE_EXHAUSTED|UNAVAILABLE|DEADLINE_EXCEEDED|ETIMEDOUT|ECONNRESET|fetch failed/i.test(message);
}

// คำตอบ 429 ของ Gemini แนบเวลาที่ควรรอมาให้ในรูป RetryInfo เช่น "retryDelay":"23s"
// (บางครั้งอยู่ในข้อความว่า "Please retry in 23.529003206s") การใช้ค่านี้ตรง ๆ ดีกว่า
// เดาเอง — รอบก่อนหน้านี้ backoff แบบทวีคูณขึ้นไปได้สูงสุดแค่ 16 วินาที ขณะที่ API
// ขอให้รอ 23 วินาที ทุก retry จึงล้มเหลวซ้ำจนหมดจำนวนครั้งที่ยอมให้ลอง
function parseRetryDelayMs(error: unknown): number | null {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/) ?? message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (!match) return null;
  const seconds = Number.parseFloat(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  // เผื่อเวลาอีกเล็กน้อยกันขอบหน้าต่างคลาดกัน
  return Math.min(MAX_BACKOFF_MS, Math.ceil(seconds * 1000) + 1000);
}

async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === MAX_ATTEMPTS) break;
      const delay = parseRetryDelayMs(error) ?? Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** (attempt - 1));
      console.warn(
        `[embeddings] ${label} ล้มเหลว (ครั้งที่ ${attempt}/${MAX_ATTEMPTS}) รอ ${Math.round(delay / 1000)}s แล้วลองใหม่: ${
          lastError instanceof Error ? lastError.message.slice(0, 200) : String(lastError).slice(0, 200)
        }`
      );
      await sleep(delay);
      // โดน 429 แปลว่าหน้าต่างโควตาฝั่ง Google ยังไม่ว่างตามที่เราคิด ล้างหน้าต่างฝั่งเรา
      // ให้ตรงกับความจริงหลังรอครบ ไม่งั้นเราจะยังเชื่อยอดคงเหลือเดิมที่ผิดอยู่
      if (/\b429\b|RESOURCE_EXHAUSTED/.test(lastError instanceof Error ? lastError.message : String(lastError))) {
        rateWindow = [];
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * สร้าง embedding ให้ข้อความหลายชิ้นพร้อมกัน (สูงสุด MAX_BATCH_SIZE ต่อการเรียก)
 * คืนอาร์เรย์ที่เรียงตรงกับ `texts` และ normalize แล้วทุกตัว
 * โยน error เมื่อจำนวนหรือมิติที่ได้กลับมาไม่ตรงกับที่ขอ — การปล่อยให้ผลลัพธ์ที่
 * ไม่ครบ/ผิดมิติไหลต่อไปจะทำให้ chunk ถูกจับคู่กับเวกเตอร์ของข้อความอื่นแบบเงียบ ๆ
 */
export async function embedBatch(texts: string[], taskType: EmbeddingTaskType): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.length > MAX_BATCH_SIZE) {
    throw new Error(`embedBatch รับได้สูงสุด ${MAX_BATCH_SIZE} รายการต่อครั้ง (ได้รับ ${texts.length})`);
  }
  // คำขอเดียวที่ใหญ่กว่าเพดานต่อนาทีเป็นไปไม่ได้ที่จะสำเร็จ — ปฏิเสธเสียงดังตรงนี้
  // ผู้เรียกควรใช้ EMBED_BATCH_SIZE เป็นขนาด batch เสมอ
  if (texts.length > RATE_LIMIT_UNITS) {
    throw new Error(
      `batch ขนาด ${texts.length} รายการเกินเพดานโควตาต่อนาที (${RATE_LIMIT_UNITS}) — ใช้ EMBED_BATCH_SIZE (${EMBED_BATCH_SIZE}) เป็นขนาด batch`
    );
  }

  // จองโควตาก่อนยิงจริงเสมอ — โควตานับเป็นรายชิ้น จึงจองเท่ากับจำนวนข้อความใน batch
  await reserveRateBudget(texts.length);

  const ai = getClient();
  const response = await withRetry(`embedBatch(${texts.length} รายการ, ${taskType})`, () =>
    ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts,
      config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
    })
  );

  const embeddings = response.embeddings ?? [];
  if (embeddings.length !== texts.length) {
    throw new Error(`จำนวน embedding ที่ได้ (${embeddings.length}) ไม่ตรงกับจำนวนข้อความที่ส่งไป (${texts.length})`);
  }

  return embeddings.map((embedding, i) => {
    const values = embedding.values;
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `embedding ลำดับที่ ${i} มี ${Array.isArray(values) ? values.length : "ไม่ใช่อาร์เรย์"} มิติ แต่ต้องการ ${EMBEDDING_DIMENSIONS} มิติ`
      );
    }
    return l2Normalize(values);
  });
}

/** สร้าง embedding ให้ข้อความชิ้นเดียว (ใช้กับคำค้นตอนตอบคำถาม) */
export async function embedOne(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
  const [embedding] = await embedBatch([text], taskType);
  return embedding;
}

/**
 * แปลงเวกเตอร์เป็นรูปแบบข้อความที่ pgvector รับ เช่น "[0.1,0.2,...]"
 * ต้องส่งเป็นสตริงเสมอเมื่อเรียกผ่าน PostgREST (supabase.rpc) — การส่งเป็นอาร์เรย์
 * JSON ตรง ๆ จะโดนตีความเป็น json ไม่ใช่ vector และ cast ไม่ผ่าน
 */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
