// Expands a user's Thai maintenance question into a handful of English/technical
// search terms likely to appear in an equipment manual (alarm codes, part names,
// symptom terms) — this is what makes manualMarkdownSearch.ts's keyword search
// actually find anything, since the manuals in this DB are almost all in English
// while technicians ask in Thai and plain ILIKE on the raw Thai question would
// almost never match.
//
// Contract: expandManualQueryTerms MUST NEVER THROW and must never stall a chat
// turn. Any failure, timeout, or unparseable model output falls back to the raw
// terms the caller already extracted (see manualMarkdownSearch.ts) and the manual
// search continues with those instead — an LLM call failing here must not break
// keyword search, which has to keep working with zero dependencies beyond the DB.

import { getLlmProvider } from "./providers/index.js";

// TTL + size cap keep this a cheap, best-effort optimization rather than a source
// of unbounded memory growth or staleness — repeated questions in the same chat
// session (or across users asking about the same alarm code) skip the extra LLM
// call, but the cache never grows without bound and never sticks around forever.
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX_ENTRIES = 200;
const EXPANSION_TIMEOUT_MS = 4000;
const MAX_QUERY_CHARS_SENT = 500;

interface CacheEntry {
  terms: string[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function normalizeCacheKey(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 300);
}

function rememberInCache(key: string, terms: string[]): void {
  if (!cache.has(key) && cache.size >= CACHE_MAX_ENTRIES) {
    // Map preserves insertion order — evict the oldest entry (simple FIFO, no need
    // for a real LRU at this scale).
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, { terms, expiresAt: Date.now() + CACHE_TTL_MS });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`manual query expansion timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

const EXPANSION_SYSTEM_INSTRUCTION =
  "คุณคือตัวช่วยแปลงคำถามภาษาไทยของช่างซ่อมบำรุงเครื่องจักรอุตสาหกรรมให้เป็นคำค้น (search terms) " +
  "สำหรับค้นหาในคู่มือเครื่องจักรซึ่งส่วนใหญ่เป็นภาษาอังกฤษ ให้คิดคำศัพท์ภาษาอังกฤษหรือรหัสเทคนิค 3-6 คำ " +
  "ที่น่าจะปรากฏในคู่มือจริง (เช่น รหัส alarm/error, ชื่อชิ้นส่วน/อะไหล่, อาการที่เป็นศัพท์เทคนิค) " +
  "ตอบเป็น JSON array ของ string เท่านั้น ห้ามมีข้อความอธิบายอื่นใดก่อนหรือหลัง เช่น [\"spindle bearing\", \"AL.32\", \"overheat alarm\"]";

/**
 * ขยายคำถามเป็นคำค้นภาษาอังกฤษ/เทคนิคด้วย Claude — คืน fallbackTerms ทันทีเมื่อคำถาม
 * ว่าง หรือเมื่อการเรียกโมเดลล้มเหลว/timeout/parse ไม่ได้ (ดูหมายเหตุ contract ด้านบน)
 */
export async function expandManualQueryTerms(query: string, fallbackTerms: string[]): Promise<string[]> {
  const trimmed = typeof query === "string" ? query.trim() : "";
  if (trimmed.length === 0) return fallbackTerms;

  const cacheKey = normalizeCacheKey(trimmed);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.terms;

  try {
    const provider = getLlmProvider();
    const result = await withTimeout(
      provider.generate({
        systemInstruction: EXPANSION_SYSTEM_INSTRUCTION,
        messages: [{ role: "user", content: trimmed.slice(0, MAX_QUERY_CHARS_SENT) }],
        forceJson: true,
        maxOutputTokens: 200,
      }),
      EXPANSION_TIMEOUT_MS
    );

    if (result.stopReason === "error" || !result.text.trim()) {
      throw new Error(`expansion call returned no usable text (stopReason=${result.stopReason})`);
    }

    const parsed: unknown = JSON.parse(result.text);
    if (!Array.isArray(parsed)) {
      throw new Error("expansion result is not a JSON array");
    }

    const phrases = parsed
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim())
      .slice(0, 6);

    if (phrases.length === 0) {
      throw new Error("expansion result had no usable string terms");
    }

    // search_manual_markdown (0024) แมตช์แต่ละ search_term แบบ ILIKE '%...%' ตรงตัวทั้ง
    // สตริง ไม่ได้ tokenize คำในสตริงนั้นแยกกัน — โมเดลบางครั้งตอบเป็นวลีหลายคำ (เช่น
    // "MR-J5 alarm troubleshooting") ซึ่งแทบไม่มีทางปรากฏตรงตัวแบบนั้นในคู่มือจริง ทำให้
    // คำที่มีค่าจริง ๆ ในวลี (เช่น "MR-J5") ไม่ถูกใช้ค้นเลยทั้งที่โมเดลคิดคำนั้นถูกต้องแล้ว
    // จึงแตกแต่ละวลีเป็นคำย่อยด้วย (คั่นด้วยช่องว่าง — ไม่กระทบคำที่มี "-" อยู่แล้วเช่น
    // "MR-J5" เพราะไม่ได้ตัดที่ตัวคั่นนั้น) แล้วส่งทั้งวลีเต็มและคำย่อยไปค้นพร้อมกัน วลีเต็ม
    // ยังคงอยู่ก่อน (โอกาสตรงประเด็นกว่าถ้าปรากฏจริง) ตามด้วยคำย่อยที่ไม่ซ้ำ
    const words = phrases
      .flatMap((phrase) => phrase.split(/\s+/))
      .map((w) => w.trim())
      .filter((w) => w.length >= 2);

    const terms = Array.from(new Set([...phrases, ...words]));

    rememberInCache(cacheKey, terms);
    return terms;
  } catch (error) {
    console.error("expandManualQueryTerms failed, falling back to raw terms:", error);
    return fallbackTerms;
  }
}
