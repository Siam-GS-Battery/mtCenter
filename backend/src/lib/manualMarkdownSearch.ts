// ค้นเนื้อหาคู่มือแบบ keyword ตรงบน manuals.markdown_content (ไม่ผ่าน manual_chunks /
// embedding เลย) — ดูเหตุผลทั้งหมดในหมายเหตุของ backend/supabase/migrations/
// 0024_manual_markdown_search.sql: มีคู่มือ 26 เล่มแต่ index เป็น embedding แล้วแค่
// 4-5 เล่ม เพราะโควตา Gemini embedding โดน 429 เส้นทางนี้ทำให้ AI ตอบจากคู่มือได้
// "วันนี้เลย" โดยไม่ต้องพึ่ง embedding provider ใด ๆ
//
// Contract เหมือน manualRetrieval.ts ทุกประการ: ฟังก์ชันนี้ "ต้องไม่ throw" ไม่ว่า
// กรณีใด (RPC ล้ม, ขยายคำถามล้ม, ฯลฯ) — คืน [] แทนเสมอเมื่อพลาด เพราะคลังคู่มือ/AI
// ที่ล่มต้องไม่ทำให้ตอบแชตไม่ได้

import { supabase } from "./supabase.js";
import { extractCodeTerms, type ManualSearchHit } from "./manualRetrieval.js";
import { expandManualQueryTerms } from "./manualQueryExpansion.js";
import { sanitizeManualExcerpt } from "./manualSanitize.js";

const MAX_HITS_PER_MANUAL = 2;
const SNIPPET_CHARS = 2500;
// ตัดซ้ำอีกชั้นฝั่งแอป (นอกเหนือจาก hard cap 12 แถวใน RPC — แต่ hard cap นั้นเป็น "ต่อ
// การเรียก RPC หนึ่งครั้ง/หนึ่งคำ" เท่านั้น ส่วนนี่คือเพดานรวมหลัง merge ผลจากทุกคำแล้ว
// จึงเป็นคนละเพดานกัน ไม่จำเป็นต้องเท่ากัน) กันเนื้อหาบวมงบ prompt
//
// เดิมตั้งไว้ที่ 12 (เท่ากับ hard cap ของ RPC ต่อคำ) แต่พิสูจน์แล้วว่ายังไม่พอ: คำถามกว้าง ๆ
// ที่ไม่เจาะจงเครื่อง/รุ่น (เช่น "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง PM") ค้นด้วยหลายคำ
// พร้อมกัน (ดู allTerms — คำไทยทั่วไปจากคำถามผู้ใช้ + คำขยายจาก Claude) แล้วมีคู่มือหลายเล่ม
// (~9 เล่ม) แมตช์คำไทยทั่วไปในลำดับต้น ๆ (คู่มือ/บำรุง/รักษา/ทั่วไป/PM) ก่อนแล้ว — แค่หนึ่ง
// hit ต่อเล่ม (หลัง dedupe) ก็กิน slot ไปเกือบหมดเพดานเดิม (12) แล้ว ทำให้ hit ที่ "เจาะจง
// กว่า" ของเล่มเดียวกัน (เช่น คำขยาย "checklist" ที่แมตช์ตรงหัวข้อ "## ... (PM Checklist)"
// ของ ALL-000 ซึ่งมีเนื้อหา PM Checklist รายวัน/สัปดาห์/เดือนจริง ต่างจาก hit แรกที่เป็นแค่
// ส่วนเกริ่นนำ/ขอบเขตของคู่มือ) ถูกตัดทิ้งไปเพราะมาทีหลังในลำดับคำและเกินเพดานรวมไปแล้ว —
// ยืนยันแล้วด้วยการเรียก RPC ตรง ๆ ทีละคำว่า hit ของ "checklist" มีอยู่จริงและมีเนื้อหาที่
// ตรงประเด็นกว่า แต่ไม่เคยไปถึงชั้น aiContext.ts เลยเพราะถูกตัดที่นี่ก่อน
//
// aiContext.ts (buildManualSection) มีตรรกะจัดสรรงบ prompt ที่ฉลาดกว่าอยู่แล้ว (ให้คะแนน
// ความเกี่ยวข้องต่อ hit + round-robin ต่อคู่มือ ก่อนตัดตามงบตัวอักษรจริง) เพดานที่นี่จึงไม่
// จำเป็นต้องแคบเท่าเดิม เพราะการตัดจริงเพื่อคุมขนาด prompt เกิดที่ชั้นนั้นอยู่แล้ว — ยกเพดาน
// ขึ้นให้กว้างพอสำหรับ ~2 hit/เล่ม ครอบคลุมแทบทุกเล่มในระบบ (มีคู่มือทั้งหมด ~26 เล่ม ดู
// หมายเหตุใน 0024_manual_markdown_search.sql) แทนที่จะผูกกับ hard cap ของ RPC ต่อคำซึ่งเป็น
// ค่าคนละความหมายกัน
const MAX_TOTAL_HITS = 48;
// ความยาว excerpt สูงสุดหลัง sanitize ต่อหนึ่งผลลัพธ์ — เท่ากับ MAX_MANUAL_EXCERPT_CHARS
// ใน aiContext.ts (คุมโดยไฟล์นั้นอีกชั้นอยู่แล้ว แต่ตัดตั้งแต่ต้นทางเพื่อไม่ส่งข้อความ
// ยาวเปล่าประโยชน์ผ่านเครือข่ายและหน่วยความจำโดยไม่จำเป็น)
const MAX_EXCERPT_CHARS = 1800;

// คำสั้นเกินไป (ทั้งไทย/อังกฤษ) แทบไม่มีความหมายเชิงค้นหาและมักเป็นคำเชื่อม — ข้ามทิ้ง
// เดิมตั้งไว้ที่ 2 แต่พบว่าคำ 2 ตัวอักษรที่หลุดมาจากการตัดคำที่มี "-" (เช่น "MR-J5" ถูก
// tokenize แยกเป็น "MR" และ "J5" เพราะ "-" ไม่ใช่ \p{L}/\p{M}/\p{N}) กลายเป็นคำค้นกว้าง
// เกินจริง (เช่น "MR" เป็น prefix รุ่นเครื่องเกือบทุกรุ่นของ Mitsubishi) ไป ILIKE แมตช์คู่มือ
// ที่ไม่เกี่ยวข้องจำนวนมาก แย่งที่ hard cap (12 แถว) ของ RPC จากคำที่ตรงประเด็นจริง — คำ
// ประกอบแบบนี้ถูกคืนค่าครบรูปอยู่แล้วจากการขยายคำถามด้วย Claude (expandManualQueryTerms
// เช่น "MR-J5") จึงไม่จำเป็นต้องพึ่งเศษคำ 2 ตัวอักษรจากการตัดคำแบบง่ายเลย
const MIN_TERM_LENGTH = 3;

// ข้อยกเว้นของ MIN_TERM_LENGTH: คำศัพท์เทคนิคงานซ่อมบำรุงจำนวนมากสั้นแค่ 2 ตัวอักษร
// (PM, WO, AL, LD, CM, TP, IO, NG, OK เป็นต้น) — ถ้ากรองทิ้งด้วยความยาวอย่างเดียวคำถามที่
// ถามถึงคำเหล่านี้ตรง ๆ (เช่น "...เรื่อง PM") จะไม่เหลือคำค้นที่ตรงประเด็นเลย ยืนยันแล้วว่า
// "PM" ที่หายไปทำให้ค้นเจอแต่ส่วนเกริ่นนำของคู่มือแทนที่จะเจอหัวข้อ "PM Checklist" จริง ๆ
// เกณฑ์ที่ใช้แยก "คำย่อทางเทคนิค" ออกจาก "เศษคำ/particle 2 ตัวอักษร": ตัวอักษรละติน
// ตัวพิมพ์ใหญ่ล้วน (เช่น PM, WO, NG) หรือ ละติน+เลข (เช่น J5, E4) — คำเชื่อมภาษาไทย/อังกฤษ
// ที่พิมพ์เล็กหรือเป็นอักษรไทย 2 ตัวจะไม่ผ่านเกณฑ์นี้ (isStopword ยังคัดคำเชื่อมภาษาอังกฤษ
// ที่บังเอิญพิมพ์ใหญ่ทั้งคำ เช่น "IN"/"TO"/"IS" ออกอีกชั้นอยู่ดี เพราะเทียบแบบ lowercase)
const SHORT_TECHNICAL_TOKEN_RE = /^(?:[A-Z]{2}|[A-Z][0-9]|[0-9][A-Z])$/;

function isShortTechnicalTerm(token: string): boolean {
  return token.length === 2 && SHORT_TECHNICAL_TOKEN_RE.test(token);
}

// คำค้นสั้น (2 ตัวอักษร) ที่ยอมให้ผ่าน MIN_TERM_LENGTH ข้างต้นเสี่ยง "แมตช์กว้างเกินจริง"
// เพราะ search_manual_markdown (0024_manual_markdown_search.sql) ใช้ ILIKE '%term%' แบบ
// substring ตรง ๆ — คำเช่น "PM" จะแมตช์แม้เป็นส่วนหนึ่งของคำอื่นที่ไม่เกี่ยวข้องเลย (เช่น
// "equipment" มี "pm" ซ้อนอยู่) ทำให้ hard cap ของ RPC ต่อคำ (12 แถว) ถูกคำทั่วไปที่แมตช์
// โดยบังเอิญแย่งไปจากคำที่ตรงประเด็นจริง ไม่สามารถแก้ที่ RPC ได้ (ห้ามแตะ migrations) จึง
// กรองซ้ำฝั่งแอปแทน: คำ 2 ตัวอักษรต้องปรากฏใน snippet แบบเป็น "คำเดี่ยว" (มีขอบเขตคำ
// ล้อมทั้งสองด้าน ไม่ใช่ตัวอักษร/ตัวเลขติดกัน) ถึงจะนับเป็นผลลัพธ์จริง — ตัดกรณี "equipment"
// ทิ้งเพราะ "pm" ในนั้นติดกับ "i" และ "e" ทั้งสองข้าง ไม่ใช่ขอบเขตคำ
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWordBoundaryMatch(snippet: string, term: string): boolean {
  try {
    const escaped = escapeRegExp(term);
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu");
    return re.test(snippet);
  } catch {
    // Unicode property escapes/lookaround ควรใช้ได้ใน runtime ที่รองรับ ES2018+ อยู่แล้ว
    // (Node ปัจจุบันทุกเวอร์ชันที่ใช้รัน backend นี้) แต่กันไว้เผื่อพลาด — ปฏิเสธผลลัพธ์แทน
    // ที่จะปล่อยผ่านแบบไม่ตรวจ (fail-closed สำหรับคำสั้นเสี่ยง false-positive)
    return false;
  }
}
// จำนวนคำค้น "ทั่วไป" (ไม่ใช่รหัส) สูงสุดที่ดึงจากคำถามไปค้น/ส่งให้ Claude ขยายคำ —
// คำถามหน้างานยาว ๆ มีคำจำนวนมาก แต่ยิ่งค้นหลายคำยิ่งช้าและเสี่ยง match กว้างเกินไป
const MAX_RAW_TERMS = 8;

// คำเชื่อม/คำถามภาษาไทยที่พบบ่อยในคำถามหน้างาน — กรองทิ้งก่อนนำไปค้น ไม่งั้นคำถามจะ
// เจือจางลงเหลือแต่คำว่า "ที่"/"การ"/"ไม่" ซึ่งไปแมตช์ทุกหน้าในทุกคู่มือ
const THAI_STOPWORDS = new Set([
  "ที่", "การ", "และ", "ของ", "ใน", "เป็น", "มี", "ให้", "จะ", "ได้", "ไม่", "กับ",
  "ว่า", "นี้", "นั้น", "ก็", "แต่", "หรือ", "ไป", "มา", "ครับ", "ค่ะ", "คะ", "อยู่",
  "ต้อง", "ทำ", "อย่าง", "เพื่อ", "แล้ว", "จาก", "ซึ่ง", "คือ", "ยัง", "ทาง", "ด้วย",
  "เมื่อ", "โดย", "วิธี", "อะไร", "ทำไม", "อย่างไร", "ยังไง", "หน่อย", "ช่วย", "บอก",
  "เครื่อง", "เครื่องจักร", "ปัญหา", "คือ", "ใช่", "ครับผม", "หนึ่ง", "สอง", "สาม",
]);

// คำเชื่อมภาษาอังกฤษที่พบได้เมื่อคำถามปนคำอังกฤษมา (เช่นชื่อรุ่นเครื่อง/ยี่ห้อ)
const ENGLISH_STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "to", "of", "in", "on", "for",
  "and", "or", "how", "what", "why", "do", "does", "it", "this", "that", "with",
]);

function isStopword(token: string): boolean {
  const lower = token.toLowerCase();
  return THAI_STOPWORDS.has(token) || ENGLISH_STOPWORDS.has(lower);
}

// ภาษาไทยเขียนติดกันไม่มีช่องว่างระหว่างคำในประโยค (ต่างจากภาษาอังกฤษ) การตัดคำด้วย
// regex รวมอักษรที่ติดกันเป็นก้อนเดียว (แนวทางเดิมของไฟล์นี้) จึงได้ "หนึ่งก้อนคำยาวทั้ง
// ประโยค" แทนที่จะได้คำแยก เช่น "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง" กลายเป็น token
// เดียวที่แทบไม่มีทางไป ILIKE แมตช์อะไรได้เลย (ไม่มีคู่มือเล่มไหนมีข้อความยาวขนาดนี้ติดกัน
// พอดี) ทำให้คำถามภาษาไทยล้วน (ไม่มีคำอังกฤษ/ตัวเลขปนที่บังเอิญมีช่องว่างคั่น) แทบไม่เคย
// สกัดคำค้นที่ใช้งานได้จริงออกมาเลย พึ่งได้แต่ expandManualQueryTerms (Claude) ล้วน ๆ ซึ่ง
// พลาดได้ (ดู contract "ต้องไม่ throw" ของฟังก์ชันนั้น)
//
// ใช้ Intl.Segmenter('th', { granularity: 'word' }) แทน — เป็น API มาตรฐานในตัว Node/V8
// (ICU dictionary-based word breaking) ไม่ต้องเพิ่ม dependency ใหม่ ตัดคำไทยได้ถูกต้องแม้
// ไม่มีช่องว่าง (ยืนยันแล้วว่า "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง PM" ตัดได้เป็น
// "คู่มือ"/"บำรุง"/"รักษา"/"ทั่วไป"/...​/"PM" ถูกต้อง) กันไว้ด้วย try/catch คืนกลับไปใช้
// regex เดิมถ้า runtime ใดไม่รองรับ (เช่น build แบบ small-icu ที่ไม่มีข้อมูล locale th)
function tokenizePrompt(prompt: string): string[] {
  try {
    const segmenter = new Intl.Segmenter("th", { granularity: "word" });
    const tokens: string[] = [];
    for (const { segment, isWordLike } of segmenter.segment(prompt)) {
      if (!isWordLike) continue;
      tokens.push(segment);
    }
    if (tokens.length > 0) return tokens;
  } catch {
    // ตกไปใช้ fallback ด้านล่าง
  }
  // \p{L} ครอบทั้งอักษรไทยและละติน, \p{N} ครอบตัวเลข, \p{M} ครอบวรรณยุกต์/สระลอยของภาษาไทย
  // (เช่น ่ ้ ๊ ๋ ั ็ ์ ซึ่งเป็น Unicode category Mn ไม่ใช่ L) — ถ้าไม่รวม \p{M} คำไทยที่มี
  // วรรณยุกต์/สระเหล่านี้จะถูกตัดกลางคำ ใช้เฉพาะเมื่อ Intl.Segmenter ใช้ไม่ได้เท่านั้น
  return prompt.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
}

/**
 * ดึงคำค้น "ทั่วไป" (ไม่ใช่รหัส alarm/error ซึ่งมี extractCodeTerms ใน
 * manualRetrieval.ts จัดการแยกอยู่แล้ว) จากคำถามผู้ใช้ — กรองคำสั้นเกินไปและ
 * คำเชื่อม/stopword ภาษาไทย-อังกฤษทิ้ง เพื่อไม่ให้การค้น ILIKE เจือจางไปกับคำที่
 * เจอในแทบทุกหน้าของทุกคู่มือ
 */
export function extractSignificantTerms(prompt: string): string[] {
  if (typeof prompt !== "string") return [];
  const tokens = tokenizePrompt(prompt);
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const token of tokens) {
    if (token.length < MIN_TERM_LENGTH && !isShortTechnicalTerm(token)) continue;
    if (isStopword(token)) continue;
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push(token);
    if (terms.length >= MAX_RAW_TERMS) break;
  }
  return terms;
}

interface RpcRow {
  manual_id: string;
  title: string;
  machine_model: string | null;
  page_label: string | null;
  snippet: string;
  match_term: string;
}

function toHit(row: RpcRow): ManualSearchHit {
  return {
    chunkId: null,
    manualId: row.manual_id,
    manualTitle: row.title,
    machineModel: row.machine_model,
    category: null,
    heading: null,
    pageLabel: row.page_label,
    content: sanitizeManualExcerpt(row.snippet, MAX_EXCERPT_CHARS),
    similarity: null,
    source: "markdown",
  };
}

// Options for the manualId-scoped path added in aiContext.ts (POST /api/ai/chat's
// optional manualId field): when the caller already knows exactly which manual it
// wants covered, it can (a) restrict the RPC to that manual only via `manualIds`
// (passed through as filter_manual_ids — see backend/supabase/migrations/
// 0025_search_manual_markdown_by_id.sql) and (b) raise `maxHitsPerManual` so a
// broad/generic prompt like "สรุปคู่มือนี้" still returns several snippets spread
// across that one manual instead of the default 2-per-manual cap meant for the
// many-manuals-at-once case.
export interface SearchManualMarkdownOptions {
  manualIds?: string[];
  maxHitsPerManual?: number;
}

/**
 * ค้นเนื้อหาคู่มือแบบ keyword ตรงบน manuals.markdown_content — ไม่ throw ทุกกรณี
 * (คืน [] เมื่อพลาด) คืนผลลัพธ์รูปแบบเดียวกับ manualRetrieval.ts's ManualSearchHit
 * เพื่อให้ aiContext.ts ประกอบ prompt ได้โดยไม่ต้องแก้โค้ดส่วนนั้น
 */
export async function searchManualMarkdown(
  query: string,
  machineModel?: string,
  options?: SearchManualMarkdownOptions
): Promise<ManualSearchHit[]> {
  try {
    const prompt = typeof query === "string" ? query.trim() : "";
    if (prompt.length === 0) return [];

    const manualIds = options?.manualIds && options.manualIds.length > 0 ? options.manualIds : null;
    const maxHitsPerManual = options?.maxHitsPerManual ?? MAX_HITS_PER_MANUAL;

    const codeTerms = extractCodeTerms(prompt);
    const rawSignificantTerms = extractSignificantTerms(prompt);

    // ขยายคำถามเป็นคำค้นภาษาอังกฤษ/เทคนิคด้วย Claude — คืน rawSignificantTerms กลับมา
    // เองเมื่อล้มเหลว (ดู contract ใน manualQueryExpansion.ts) จึงปลอดภัยเสมอ
    const expandedTerms =
      rawSignificantTerms.length > 0
        ? await expandManualQueryTerms(prompt, rawSignificantTerms)
        : [];

    // ลำดับความสำคัญของคำค้น (มีผลจริงเพราะ merged.slice(0, MAX_TOTAL_HITS) ด้านล่างตัด
    // จาก "ท้าย" รายการที่สะสมมา — คำที่มาก่อนจึงมีโอกาสติด budget สุดท้ายมากกว่า):
    //   1) codeTerms — รหัส alarm/error ที่สกัดจากคำถามตรง ๆ หลักฐานหนักแน่นที่สุด
    //   2) rawSignificantTerms — คำจากคำถามผู้ใช้ตรง ๆ (หลัง Intl.Segmenter ตัดคำแล้ว)
    //      เช่น "คู่มือ" ซึ่งมักตรงกับคู่มือที่ผู้ใช้ตั้งใจถามถึงจริง ๆ
    //   3) expandedTerms — คำขยายจาก Claude (เดา/แปลเป็นศัพท์เทคนิคภาษาอังกฤษ) มีประโยชน์
    //      มากเมื่อคำถามเจาะจงรุ่น/อาการเป็นภาษาไทยที่ไม่มีในคู่มือ (ซึ่งเป็นภาษาอังกฤษ) แต่
    //      เป็นการเดา ความเชื่อมั่นต่ำกว่าคำที่ผู้ใช้พิมพ์เองเสมอ
    //
    // เดิมให้ expandedTerms มาก่อน rawSignificantTerms (และเดิม slice ทั้งชุดเหลือแค่ 8 คำ
    // โดยไม่ได้นับรวม expandedTerms ที่มีเพดานของตัวเอง 6 คำอยู่แล้ว) ผลคือคำถามกว้าง ๆ ที่
    // ไม่เจาะจงรุ่นเครื่อง (เช่น "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง PM") ให้ Claude ขยาย
    // เป็นศัพท์เทคนิคเฉพาะทาง (servo amplifier maintenance ฯลฯ) ซึ่งไปตรงกับคู่มือเฉพาะทาง
    // (FANUC/Mitsubishi/Yaskawa) ก่อน แล้วคำที่ตรงกับคู่มือทั่วไปที่ผู้ใช้ถามถึงจริง (ALL-000
    // ผ่านคำว่า "คู่มือ" — ยืนยันแล้วด้วย search_manual_markdown(['คู่มือ']) ตรง ๆ ว่าเจอ) ถูก
    // ตัดทิ้งไปเพราะอยู่ท้ายรายการเกินงบ MAX_TOTAL_HITS ทั้งที่ตรงประเด็นกว่า
    let allTerms = Array.from(new Set([...codeTerms, ...rawSignificantTerms, ...expandedTerms]));

    // เมื่อค้นแบบจำกัดเฉพาะคู่มือเล่มเดียว (manualId ที่ผู้ใช้เลือกเอง — ดู aiContext.ts)
    // คำถามอาจกว้างมาก (เช่น "สรุปคู่มือนี้") จนสกัดคำค้นเฉพาะเจาะจงไม่ได้เลย หรือได้แต่
    // คำที่ไม่ค่อยปรากฏในเนื้อหาคู่มือจริง (เช่น "คู่มือ", "สรุป") ทำให้ได้ผลลัพธ์น้อยหรือ
    // ไม่ครอบคลุม จึงเติมคำค้น "หน้า" เพิ่มเข้าไปเสมอในกรณีนี้ (ต่อท้าย = ความสำคัญต่ำสุด
    // ไม่แย่งที่คำเจาะจงจากคำถามจริง) — คำนี้ตรงกับหัวข้อ "## หน้า N" ที่คั่นทุกหน้าของ
    // markdown_content (ดู 0024_manual_markdown_search.sql) จึงแมตช์กระจายทั่วทั้งเล่ม
    // รับประกันว่าเมื่อจำกัดคู่มือเหลือเล่มเดียวแล้ว การค้นยังได้ snippet กระจายครอบคลุม
    // เล่มนั้นแทนที่จะได้ 0-2 รายการแคบ ๆ จากคำถามอย่างเดียว
    if (manualIds && !allTerms.includes("หน้า")) {
      allTerms = [...allTerms, "หน้า"];
    }
    if (allTerms.length === 0) return [];

    // เดิมส่งทุกคำใน allTerms เข้า RPC เดียวกัน (search_terms เป็น text[]) แต่ตัว RPC
    // (0024_manual_markdown_search.sql) จำกัดผลรวม "ทุกคำที่ส่งไปพร้อมกัน" ไว้ที่ hard cap
    // 12 แถว โดยเรียงตาม manual_id (UUID) ซึ่งไม่เกี่ยวกับความตรงประเด็นของคำค้นเลย —
    // คำทั่วไปที่แมตช์แทบทุกคู่มือ (เช่น "alarm", "troubleshooting", "error") จึงเบียดคำที่
    // เจาะจงจริง (เช่นรหัส/ชื่อรุ่นเครื่อง "MR-J5") ออกจากผลลัพธ์ไปตามดวง UUID ล้วน ๆ ไม่ใช่
    // ตามความเกี่ยวข้อง — ทำให้คำถามที่เจาะจงเครื่อง/รุ่นชัดเจนกลับหาคู่มือของเครื่องนั้นไม่เจอ
    //
    // แก้โดยยิง RPC แยกทีละคำ (ขนานกันด้วย Promise.allSettled) ให้แต่ละคำมี hard cap 12
    // แถวเป็นของตัวเอง ไม่ต้องแย่งกับคำอื่น แล้วนำผลมารวม/ตัดซ้ำ/จำกัดจำนวนต่อคู่มือเองที่นี่
    // โดยให้ "ลำดับคำ" ใน allTerms (codeTerms ก่อน แล้ว expandedTerms แล้ว rawSignificantTerms
    // — ดูการประกอบด้านบน ซึ่งเรียงจากเจาะจงไปทั่วไป) เป็นตัวกำหนดความสำคัญ: คู่มือที่แมตช์จาก
    // คำที่มาก่อนถูกเก็บไว้ก่อนเสมอ ส่วนคำที่มาทีหลังจะถูกข้ามถ้าคู่มือนั้นถูกเก็บครบ
    // MAX_HITS_PER_MANUAL แถวไปแล้ว
    const perTermResults = await Promise.allSettled(
      allTerms.map((term) =>
        supabase.rpc("search_manual_markdown", {
          search_terms: [term],
          filter_machine_models: machineModel ? [machineModel] : null,
          max_hits_per_manual: maxHitsPerManual,
          snippet_chars: SNIPPET_CHARS,
          filter_manual_ids: manualIds,
        })
      )
    );

    const rows: RpcRow[] = [];
    for (const result of perTermResults) {
      if (result.status !== "fulfilled") {
        console.error("search_manual_markdown RPC call rejected:", result.reason);
        continue;
      }
      const { data, error } = result.value;
      if (error) {
        console.error("search_manual_markdown RPC failed for one term:", error.message);
        continue;
      }
      rows.push(...((data ?? []) as RpcRow[]));
    }

    const perManualCount = new Map<string, number>();
    const seenKeys = new Set<string>();
    const merged: RpcRow[] = [];
    for (const row of rows) {
      // คำค้นสั้น (2 ตัวอักษร เช่น "PM") เสี่ยงแมตช์แบบ substring กว้างเกินจริง (ดูหมายเหตุ
      // ที่ hasWordBoundaryMatch ด้านบน) — ต้องปรากฏเป็นคำเดี่ยวใน snippet จริง ๆ ก่อนนับ
      if (row.match_term.length === 2 && !hasWordBoundaryMatch(row.snippet, row.match_term)) {
        continue;
      }
      // คีย์ตัดซ้ำ: คู่มือ + หน้า + ช่วงต้นของ snippet (คำค้นต่างกันอาจโดนตำแหน่งเดียวกัน
      // ในคู่มือเดียวกัน ได้ snippet ซ้ำหรือเกือบซ้ำ)
      const key = `${row.manual_id}::${row.page_label ?? ""}::${row.snippet.slice(0, 80)}`;
      if (seenKeys.has(key)) continue;
      const count = perManualCount.get(row.manual_id) ?? 0;
      if (count >= maxHitsPerManual) continue;
      seenKeys.add(key);
      perManualCount.set(row.manual_id, count + 1);
      merged.push(row);
    }

    // MAX_TOTAL_HITS is sized for the "many manuals at once" case (keep the overall
    // prompt budget sane across up to MAX_TOTAL_HITS/MAX_HITS_PER_MANUAL manuals).
    // When scoped to one manual via manualIds with a raised maxHitsPerManual, that
    // same cap would defeat the point of raising it — allow the total to grow with
    // maxHitsPerManual in that case instead.
    const totalCap = Math.max(MAX_TOTAL_HITS, maxHitsPerManual);
    return merged.slice(0, totalCap).map(toHit);
  } catch (error) {
    console.error("searchManualMarkdown failed:", error);
    return [];
  }
}
