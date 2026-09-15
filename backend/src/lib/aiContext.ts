// Builds a Thai plain-text "knowledge block" from live data in the DB, meant to be
// embedded in the Gemini system prompt (see backend/src/routes/ai.ts) so the AI
// assistant answers from real machines/work-orders instead of guessing.
//
// Contract: buildKnowledgeContext MUST NEVER THROW. Every DB call in this file is
// wrapped by the outer try/catch in buildKnowledgeContext, and any failure just
// returns "" (the caller falls back to whatever it already sends without this
// block) — a broken knowledge block must never break the chat endpoint.

import { supabase } from "./supabase.js";
import { evaluateMachine, thresholdSummaryText } from "./thresholds.js";
import { searchManualChunks, extractCodeTerms, type ManualSearchHit } from "./manualRetrieval.js";
import { searchManualMarkdown, extractSignificantTerms } from "./manualMarkdownSearch.js";
import { TRUSTED_BLOCK_DELIMITER_RE, sanitizeManualExcerpt } from "./manualSanitize.js";
import type { MachineRow, TelemetryReadingRow, WorkOrderRow } from "./mappers.js";

export interface AiContextInput {
  prompt: string;
  // `id` is optional and preferred over `code` when the caller has it: machine
  // codes are NOT unique in this DB (see byNormalizedCode below), so resolving by
  // id is the only way to guarantee the UI-selected machine is the one described.
  machineContext?: { id?: string | null; code?: string | null; name?: string | null; status?: string | null } | null;
  // Manual the user explicitly picked in the UI (e.g. opened a specific manual and
  // asked "สรุปคู่มือนี้") — see buildSelectedManualSection below. Optional and
  // backward compatible: omitting it behaves exactly as before this field existed.
  manualId?: string;
  // Optional progress callback for the streaming chat route (POST /api/ai/chat/stream)
  // so the UI can show what is actually happening while this function runs. Fired at
  // real stage boundaries below — never a fake/timed step. Omitting it (the existing
  // POST /api/ai/chat path) leaves behavior byte-identical to before this field existed.
  // `manualHitCount` is populated only on the "manuals" event, for callers (see
  // routes/ai.ts) that want the real retrieved-hit count for observability
  // logging (ai_interaction_logs.manual_hit_count) without re-parsing `detail`.
  // Not part of the public SSE event contract — routes/ai.ts strips it before
  // forwarding this event to the client.
  onProgress?: (ev: { id: string; status: "start" | "done" | "skip"; detail?: string; manualHitCount?: number }) => void;
}

// Wraps onProgress so a misbehaving caller-supplied callback can never break this
// module's "must never throw" contract.
function emitProgress(
  onProgress: AiContextInput["onProgress"],
  ev: { id: string; status: "start" | "done" | "skip"; detail?: string; manualHitCount?: number }
): void {
  if (!onProgress) return;
  try {
    onProgress(ev);
  } catch (error) {
    console.error(`[aiContext] onProgress callback threw for step "${ev.id}":`, error);
  }
}

const FLEET_CACHE_TTL_MS = 60_000;
// เดิมงบรวมอยู่ที่ 7,000 ตัวอักษร ซึ่งพอดีกับข้อมูลเครื่องจักร/ใบงานเท่านั้น การเพิ่ม
// ส่วนเนื้อหาคู่มือ (ดู MAX_MANUAL_CONTEXT_CHARS ด้านล่าง) ต้องการที่อีกก้อนหนึ่ง
// จึงขยายงบรวมขึ้น — โมเดลที่ใช้อยู่ (ดู FALLBACK_MODELS ใน routes/ai.ts) รับ context
// ได้ระดับแสน token ตัวเลขนี้จึงยังถือว่าอนุรักษ์นิยมมาก และคุมไว้เพื่อความเร็ว/ค่าใช้จ่าย
// ไม่ใช่เพราะขีดจำกัดของโมเดล
const MAX_CONTEXT_CHARS = 14000;
// งบเฉพาะของส่วน "เนื้อหาจากคู่มือ" การให้งบแยกทำให้เนื้อหาคู่มือไม่ไปเบียดข้อมูล
// เครื่องจักร และกลับกันข้อมูลเครื่องจักรก็เบียดคู่มือไม่ได้
//
// เดิม 6000 ตัวอักษร พอสำหรับ ~1 excerpt เต็มขนาด (MAX_MANUAL_EXCERPT_CHARS = 1800)
// บวกอีก 1-2 excerpt สั้น ๆ เท่านั้น — ไม่พอการันตีว่าเมื่อมี 3 เล่มที่ตรงประเด็นจริง
// (ดู buildManualSection's round-robin ด้านล่าง ซึ่งต้องเว้นที่ให้อย่างน้อย 3 เล่ม
// เล่มละ 1 excerpt เต็มขนาด) จะได้ที่ครบทั้ง 3 เล่ม ปรับเป็น 8000 ตัวอักษร (~header
// 450 + footer 120 + 3 excerpt เต็มขนาด ~1900 ตัวอักษร/เล่ม = ~6150 พอดีมีเหลือ) ยัง
// ต่ำกว่า 10,000 ตามเกณฑ์ที่ตั้งไว้ ต้นทุนเพิ่มขึ้นจริง ~2000 ตัวอักษร (~500 token) ต่อ
// คำขอ — ที่ราคา claude-haiku-4-5 $1/1M input token คือ ~$0.0005/คำขอ เพิ่มขึ้น และ
// เนื้อหาคู่มือนี้อยู่ใน DYNAMIC segment เสมอ (ไม่เข้า prompt cache ของ system prompt
// คงที่ — ดูคอมเมนต์ระดับไฟล์) จึงเสียทุกครั้งจริง แต่คุ้มค่าเพราะเป็นเงื่อนไขจำเป็นเพื่อ
//
// ยืนยันแล้วว่า 8000 ยังไม่พอ: คำถามกว้าง ๆ ที่มี 4-5 เล่มตรงประเด็นพร้อมกัน (เช่น
// "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง PM") round-robin (ด้านล่าง) แจก excerpt แรก
// ให้ครบทุกเล่มก่อนเสมอ (breadth) กิน budget ไปเกือบหมด (4 เล่ม × ~1800 ตัวอักษร/เล่ม =
// ~7200) เหลือที่ไม่พอให้ excerpt ที่สอง (depth) ของเล่มที่ตรงประเด็นที่สุด (คะแนนสูงสุด
// อันดับ 1 ในลำดับ round-robin — ดู manualOrder) แม้จะเป็น excerpt ที่มีคำตอบจริง ๆ
// (เช่น หัวข้อ "PM Checklist" ของ ALL-000) ก็ตาม — ปรับเป็น 10000 เพื่อเผื่อที่ให้
// excerpt ที่สองของเล่มอันดับ 1 ได้จริง (header 450 + footer 120 + 4 เล่ม×1 excerpt
// ~7200 + 1 excerpt เพิ่มของเล่มอันดับ 1 ~1800 = ~9570) ยังต่ำกว่า MAX_CONTEXT_CHARS
// (14000) พอเหลือที่ให้ข้อมูลเครื่องจักรเมื่อจำเป็น (ส่วนนั้นถูกตัดจาก overview/abnormal
// list ก่อนเสมอเมื่อเกินงบรวม — ดู buildKnowledgeContext)
const MAX_MANUAL_CONTEXT_CHARS = 11500;
// ตัดเนื้อหาต่อหนึ่ง chunk ไม่ให้ยาวเกินนี้ กัน chunk เดียวกินงบทั้งส่วน
const MAX_MANUAL_EXCERPT_CHARS = 1800;
// งบสำหรับใส่เนื้อหา "ทั้งเล่ม" ของคู่มือที่ผู้ใช้เลือกเจาะจงในหน้าจอ (manualId — ดู
// AiContextInput ด้านบนและ buildSelectedManualSection ด้านล่าง) ~15k token คู่มือที่
// markdown_content สั้นกว่างบนี้จะถูกใส่เข้า context ทั้งเล่มตรง ๆ เพื่อรองรับคำถามกว้าง
// อย่าง "สรุปคู่มือนี้" ที่การค้นด้วยคำ (keyword) จากคำถามอย่างเดียวจะครอบคลุมไม่พอ ส่วน
// คู่มือที่ยาวเกินงบนี้ (เช่น MR-J3-A ~1.73M ตัวอักษร) จะไม่ถูกใส่ทั้งเล่ม แต่ใช้การค้น
// keyword จำกัดเฉพาะเล่มนั้นแทน (ดู buildKnowledgeContext ที่ส่ง manualIds เข้า
// searchManualChunks/searchManualMarkdown เมื่อ manualId ถูกระบุ)
const MAX_SELECTED_MANUAL_CHARS = 60000;
// Row cap for the fleet-wide abnormal-machine list. When the prompt already
// resolved a specific machine (the question is about GR-1141, not the other 167
// abnormal machines), that list is background noise for this turn — shrink it
// aggressively so its budget goes to the question-relevant detail section
// instead. MAX_ABNORMAL_ROWS_TIGHT is a further fallback used only if the block
// is still over budget after that first shrink (see buildKnowledgeContext).
const MAX_ABNORMAL_ROWS = 15;
const MAX_ABNORMAL_ROWS_FOCUSED = 5;
const MAX_ABNORMAL_ROWS_TIGHT = 2;
const MAX_RESOLVED_MACHINES = 3;
const MAX_WORK_ORDERS_PER_MACHINE = 5;
const MAX_FIELD_CHARS = 300;

// Codes in this DB look like "GR-1141", "ALL-000": 2-5 letters, optional dash/space,
// 3-4 digits.
const MACHINE_CODE_REGEX = /[A-Za-z]{2,5}[-\s]?\d{3,4}/g;

// TRUSTED_BLOCK_DELIMITER_RE (used by sanitizeField below) and sanitizeManualExcerpt
// now live in manualSanitize.ts, shared with manualMarkdownSearch.ts's keyword path
// — see that file's header comment for why the sanitizer must not be duplicated.

// --- fleet-wide cache (steps 2+3 raw rows) — 60s TTL so repeated chat turns in the
// same minute don't each re-query the whole machines table. Per-machine detail
// queries (work_orders / telemetry_readings) below are intentionally NOT cached.
let fleetCache: { rows: MachineRow[]; expiresAt: number } | null = null;
// Shared in-flight promise so N concurrent chats on a cold cache issue exactly one
// `machines` query instead of one each (cache-stampede protection). Cleared in
// `finally` regardless of success/failure so a failed fetch never poisons future
// calls and a fresh request is made next time.
let fleetInFlight: Promise<MachineRow[]> | null = null;

// Only the columns this file actually renders (see backend/supabase/migrations/
// 0001_init.sql and 0009_alter_machines.sql) — avoids pulling the whole ~973-row
// table with every free-text column (e.g. info_notes, quality_flags) on every call.
const FLEET_SELECT_COLUMNS =
  "id,code,name,model,location,status,last_maintenance,next_maintenance,health_score,spindle_temp,vibration_mms,operating_hours,active_error_code,active_error_desc,category,department_code,section" as const;

async function getFleetRows(): Promise<MachineRow[]> {
  const now = Date.now();
  if (fleetCache && fleetCache.expiresAt > now) {
    return fleetCache.rows;
  }
  if (fleetInFlight) {
    return fleetInFlight;
  }
  fleetInFlight = (async () => {
    try {
      const { data, error } = await supabase.from("machines").select(FLEET_SELECT_COLUMNS);
      if (error) throw error;
      const rows = (data ?? []) as MachineRow[];
      fleetCache = { rows, expiresAt: Date.now() + FLEET_CACHE_TTL_MS };
      return rows;
    } finally {
      fleetInFlight = null;
    }
  })();
  return fleetInFlight;
}

// Neutralizes a single free-text DB value before it is interpolated into the
// system prompt. Free-text columns (name, location, title, symptoms, cause,
// repair_action, active_error_desc, ...) come from tables writable via endpoints
// that may have no auth (e.g. POST /api/work-orders), so they are treated as
// untrusted input here, not merely as display strings. Three things are
// neutralized:
//  1) Newlines/control characters — otherwise a value can inject what looks like
//     an entire extra rendered row (e.g. a fake "· เลขที่ใบงาน: ..." line).
//  2) The literal trusted-data delimiter text ai.ts wraps this block with —
//     otherwise a value can forge a close/reopen of the trusted block.
//  3) The "|" / "·" separators this file's renderer uses between columns/bullets
//     — otherwise a value can forge extra columns within a single line.
// Finally each field is hard-clamped to a sane length so no single free-text
// value can dominate the (small) character budget on its own.
function sanitizeField(raw: string): string {
  let s = raw.replace(/[\x00-\x1F\x7F]/g, " ");
  s = s.replace(TRUSTED_BLOCK_DELIMITER_RE, " ");
  s = s.replace(/\|/g, "/").replace(/·/g, "-");
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > MAX_FIELD_CHARS) {
    s = s.slice(0, MAX_FIELD_CHARS) + "…";
  }
  return s;
}

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "ไม่มีข้อมูล";
  if (typeof value === "string") {
    if (value.trim() === "") return "ไม่มีข้อมูล";
    return sanitizeField(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "ไม่มีข้อมูล";
    return sanitizeField(value.map((v) => String(v)).join(", "));
  }
  return sanitizeField(String(value));
}

// รวมผลค้นคู่มือจากสองแหล่ง (semantic/embedding บน manual_chunks + keyword บน
// markdown_content เต็มเล่ม) แล้วตัดซ้ำด้วยคีย์ "คู่มือ + หน้า" — ไม่ใช้ chunkId เพราะ
// hit จาก markdown search ไม่มี chunk id (ดู ManualSearchHit.chunkId ใน
// manualRetrieval.ts) เนื้อหาเดียวกันจากสองแหล่งจึงมักมีหน้าเดียวกัน การตัดซ้ำด้วยหน้า
// จึงกันไม่ให้เนื้อหาเดียวกันถูกยัดเข้า prompt สองครั้ง โดย `primary` (ผล semantic)
// ชนะเสมอเมื่อชนกัน เพราะผ่านการคัดกรองด้วยคะแนนความใกล้เคียงแล้ว
//
// สลับ (interleave) ผลจากสองแหล่งทีละรายการ แทนที่จะต่อ [...primary, ...secondary]
// ตรง ๆ — เดิมการต่อแบบนั้นทำให้ semantic hits (ซึ่งมีผลลัพธ์ให้เสมอแม้ embedding จะครอบ
// คลุมแค่ ~4 จาก 26 เล่ม เพราะ semantic search คืน top-k โดยไม่สนว่าเกี่ยวข้องจริงแค่ไหน)
// ครองลำดับต้นทั้งหมด แล้วกิน MAX_MANUAL_CONTEXT_CHARS ทั้งก้อนใน buildManualSection
// (ซึ่งเติมเนื้อหาตามลำดับอาร์เรย์จนกว่าจะชนงบ) ก่อนที่ markdown hits (ผลลัพธ์จาก
// migration 0024 ที่ครอบคลุมคู่มือครบ 26 เล่ม — ดูเหตุผลทั้งหมดในคอมเมนต์ของไฟล์นั้น)
// จะมีโอกาสถูกใส่เข้าไปเลยแม้แต่รายการเดียว ทำให้คำถามที่มีคำตอบอยู่ในคู่มือที่ไม่ได้ index
// embedding (22 จาก 26 เล่ม) ตอบไม่ได้อยู่ดี ทั้งที่ migration 0024 มีไว้แก้ปัญหานี้โดยตรง
function mergeManualHits(primary: ManualSearchHit[], secondary: ManualSearchHit[]): ManualSearchHit[] {
  // คู่มือบางเล่ม (เช่น ALL-000, GR-1141 — เขียนขึ้นเองไม่ได้ผ่าน OCR ที่คั่นหน้าด้วย
  // "## หน้า N") ไม่มี pageLabel เลย (null ทุก hit จาก markdown search — ดู
  // search_manual_markdown ใน 0024_manual_markdown_search.sql ที่คืน null เมื่อหา
  // "## หน้า N" ก่อนตำแหน่งที่เจอไม่พบ) — เดิม dedupe ด้วย manualId+pageLabel อย่างเดียว
  // ทำให้ทุก hit ที่ไม่มีหน้า (ต่างตำแหน่ง/ต่างเนื้อหากันจริง เช่น ส่วนเกริ่นนำ vs. ส่วน
  // "PM Checklist") ชนกันเป็นคีย์เดียวกันหมด (`manualId::""`) เหลือ hit เดียวจากคู่มือ
  // นั้นเสมอไม่ว่าจะค้นเจอกี่ตำแหน่งจริง ๆ ก็ตาม — ยืนยันแล้วว่านี่คือสาเหตุที่ ALL-000 ไม่
  // เคยได้ excerpt ของ "PM Checklist" (บทที่มีรายการตรวจสอบรายวัน/สัปดาห์/เดือนจริง) เข้า
  // prompt เลย ทั้งที่ manualMarkdownSearch.ts ค้นเจอและส่งมาให้แล้ว จึงเติมช่วงต้นของ
  // เนื้อหา (content prefix) เข้าไปในคีย์ด้วยเมื่อไม่มี pageLabel กันไม่ให้ hit ที่ไม่มีหน้า
  // แต่เนื้อหาต่างกันจริงถูกทิ้งไปทั้งที่ไม่ใช่ duplicate จริง (ยังคง dedupe hit ที่ pageLabel
  // และเนื้อหาต้นตรงกันจริง ๆ ไว้เหมือนเดิม)
  const dedupeKey = (hit: ManualSearchHit): string =>
    hit.pageLabel
      ? `${hit.manualId}::${hit.pageLabel}`
      : `${hit.manualId}::nopage::${hit.content.slice(0, 80)}`;
  const seen = new Set<string>();
  const merged: ManualSearchHit[] = [];
  const maxLen = Math.max(primary.length, secondary.length);
  for (let i = 0; i < maxLen; i++) {
    for (const hit of [primary[i], secondary[i]]) {
      if (!hit) continue;
      const key = dedupeKey(hit);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(hit);
    }
  }
  return merged;
}

// ให้คะแนนความเกี่ยวข้องของแต่ละ hit เทียบกับคำถามผู้ใช้ (queryTerms = รหัส alarm +
// คำสำคัญที่สกัดจากคำถามตรง ๆ ด้วย Intl.Segmenter — ดู extractCodeTerms/
// extractSignificantTerms) เพื่อใช้จัดลำดับก่อนตัดงบใน buildManualSection แทนที่จะ
// เรียงตามลำดับที่ merge มา (ซึ่งไม่สะท้อนความเกี่ยวข้องเลย — เป็น root cause ของบั๊ก
// "ค้นเจอแต่ไม่ถึงโมเดล" ที่เกิดซ้ำ 3 ครั้งแล้วในไฟล์นี้)
//
// ชื่อคู่มือ/รุ่นเครื่องที่ตรงกับคำในคำถามคือหลักฐานที่หนักแน่นที่สุด — หนักแน่นกว่าคะแนน
// ความใกล้เคียงเชิงความหมาย (similarity) เสียอีก เพราะ semantic search คืน top-k เสมอ
// แม้เล่มที่ได้คะแนนสูงสุดจะไม่เกี่ยวข้องจริงเลยก็ตาม (ดูคอมเมนต์ mergeManualHits ด้านบน)
// นี่คือสิ่งที่ทำให้เคส ALL-000 ("คู่มือบำรุงรักษาทั่วไป" ตรงกับคำถาม "คู่มือบำรุงรักษา
// ทั่วไปบอกอะไรบ้างเรื่อง PM" ตรงตัวหลายคำ) ขึ้นไปอยู่บนสุดเสมอ ไม่ว่าเล่มอื่นจะมี
// semantic similarity สูงแค่ไหน
function scoreManualHit(hit: ManualSearchHit, queryTerms: string[]): number {
  const titleLower = hit.manualTitle.toLowerCase();
  const modelLower = (hit.machineModel ?? "").toLowerCase();
  const contentLower = hit.content.toLowerCase();

  let score = 0;
  for (const term of queryTerms) {
    if (term.length < 2) continue;
    if (titleLower.includes(term)) score += 200;
    if (modelLower.length > 0 && modelLower.includes(term)) score += 150;
    if (contentLower.includes(term)) score += 5;
  }

  if (hit.similarity !== null) {
    score += hit.similarity * 30;
  } else {
    // keyword/markdown hit ที่ไม่มี similarity ต้องแมตช์คำตรงตัวมาแล้วถึงมีอยู่ในลิสต์
    // นี้ — ให้คะแนนพื้นฐานเล็กน้อยกันไม่ให้ตกไปที่ 0 เวลาไม่ตรงชื่อ/รุ่นเลย
    score += 10;
  }

  return score;
}

// ประกอบส่วน "เนื้อหาจากคู่มือ" จากผลค้นหา พร้อมเลขอ้างอิง [1], [2], ... ที่ระบุชื่อ
// คู่มือและหน้า เพื่อให้ AI อ้างอิงกลับได้และผู้ใช้เปิดคู่มือหน้านั้นตรวจสอบเองได้
//
// สองขั้นตอนแก้บั๊ก "ค้นเจอแต่ไม่ถึงโมเดล" ที่นี่:
//   1) จัดอันดับ hits ด้วย scoreManualHit ก่อนเสมอ ไม่ใช้ลำดับที่ merge มาตรง ๆ —
//      เนื้อหาที่เกี่ยวข้องที่สุด (ชื่อคู่มือ/รุ่นตรงคำถาม, similarity สูง) จึงมีสิทธิ์ถูก
//      เลือกก่อนเวลาต้องตัดงบ
//   2) เติมแบบ round-robin ทีละเล่ม (เล่มที่คะแนนสูงสุดก่อน) แทนที่จะไล่ตามลำดับ
//      array เดิม — กันไม่ให้เล่มเดียวกินงบทั้งหมดจนเล่มอื่นไม่มีที่เหลือเลย แม้เล่มนั้น
//      จะมีหลาย hit คะแนนสูงก็ตาม เล่มอื่นที่ยังมี hit เหลือจะได้คิวก่อนเสมอในแต่ละรอบ
//      ผลคือเมื่อมี 2-3 เล่มที่เกี่ยวข้องจริง ทั้งหมดมีโอกาสปรากฏใน context อย่างน้อย 1
//      excerpt ต่อเล่ม แทนที่จะมีแค่เล่มแรกที่ผ่านมากินงบทั้งก้อน (ดูการขยาย
//      MAX_MANUAL_CONTEXT_CHARS ด้านบนที่เว้นที่ไว้พอสำหรับ ~3 เล่ม เต็มขนาด)
function buildManualSection(hits: ManualSearchHit[], queryTerms: string[]): string {
  if (hits.length === 0) return "";

  // หัวส่วนใช้ \n ระหว่างบรรทัด ส่วนแต่ละ chunk คั่นด้วย \n\n — เก็บแยกกันเพื่อให้การ
  // นับงบตัวอักษรตรงกับสตริงที่คืนออกไปจริง
  const header = [
    "[เนื้อหาจากคู่มือเครื่องจักรในระบบ]",
    "- ข้อความด้านล่างคัดมาจากคู่มือจริงที่อัปโหลดไว้ในระบบ (ค้นด้วยความหมายของคำถามและรหัสที่พบในคำถาม)",
    "- แต่ละข้อความมีแท็ก (อ้างอิง: ชื่อคู่มือ, หน้า) แนบไว้ทั้งก่อนและหลังตัวข้อความ — เมื่อนำข้อความใดไปตอบ ต้องคัดลอกแท็กนั้นมาใส่ต่อท้ายคำตอบเสมอ ห้ามตอบโดยไม่มีแท็กเมื่อใช้เนื้อหาจากส่วนนี้ และห้ามแต่งแท็กขึ้นเอง",
    "- ห้ามสรุปเกินกว่าที่ข้อความระบุ หากข้อความที่ค้นเจอด้านล่างไม่ได้กล่าวถึงสิ่งที่ผู้ใช้ถาม ให้บอกว่าไม่พบเรื่องนี้ในข้อความคู่มือที่ดึงมาแสดง (นี่คือผลการค้นหาที่เกี่ยวข้องกับคำถามนี้เท่านั้น ไม่ใช่รายชื่อคู่มือทั้งหมดที่มีในระบบ ห้ามสรุปว่าคู่มือเล่มอื่นไม่มีอยู่ในระบบ)",
  ].join("\n");

  const lines = [header];
  let used = header.length;
  let shown = 0;
  const budgetLimit = MAX_MANUAL_CONTEXT_CHARS - 120; // เว้นที่ให้บรรทัดหมายเหตุท้ายส่วนเสมอ

  const scored = hits.map((hit, idx) => ({ hit, score: scoreManualHit(hit, queryTerms), idx }));
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);

  // จัดกลุ่มเป็นคิวต่อเล่ม เรียงเล่มตามคะแนนสูงสุดของ hit แรกที่เจอ (เพราะ scored ถูก
  // เรียงมาก่อนแล้ว เล่มที่ hit คะแนนสูงสุดของมันมาถึงก่อนจะถูกเพิ่มเข้า manualOrder ก่อน)
  const manualOrder: string[] = [];
  const queues = new Map<string, typeof scored>();
  for (const item of scored) {
    let queue = queues.get(item.hit.manualId);
    if (!queue) {
      queue = [];
      queues.set(item.hit.manualId, queue);
      manualOrder.push(item.hit.manualId);
    }
    queue.push(item);
  }

  // จำกัดจำนวน "เล่ม" ที่เข้าคิว round-robin ด้วย — ไม่ใช่แค่จำกัดตัวอักษรรวม
  // (MAX_MANUAL_CONTEXT_CHARS) พิสูจน์แล้วว่าคำถามกว้าง ๆ ที่คำขยาย/คำทั่วไปดันไปแมตช์
  // เล่มที่ไม่เกี่ยวข้องนัก 15-20+ เล่มพร้อมกัน (แค่แมตช์คำทั่วไปคำเดียวก็ติด manualOrder
  // แล้ว) ทำให้ while-loop ด้านล่างวน pass แรก (breadth: 1 excerpt/เล่ม) จนหมด budget
  // ก่อนจะถึง pass ที่สอง (depth: excerpt ที่ 2 ของเล่มที่ตรงประเด็นที่สุด) เสมอ ไม่ว่าจะ
  // ยก MAX_MANUAL_CONTEXT_CHARS สูงแค่ไหนก็ตาม เพราะจำนวนเล่มที่แย่งคิวรอบแรกมีมากกว่า
  // budget ที่เพิ่มมาเสมอ — ยืนยันแล้วด้วยคำถาม "คู่มือบำรุงรักษาทั่วไปบอกอะไรบ้างเรื่อง PM"
  // ที่ ALL-000 (คะแนนสูงสุด ตรงประเด็นที่สุด) ไม่เคยได้ excerpt ที่สอง (หัวข้อ PM
  // Checklist ซึ่งมีคำตอบจริง) เพราะเล่มอื่นอีก 15-20 เล่มที่แมตช์คำทั่วไป/คำขยายที่ไม่ได้
  // เจาะจงจริงกินคิวรอบแรกไปหมดก่อน — ตัดเหลือเฉพาะเล่มที่คะแนนสูงสุด MAX_MANUALS_IN_SECTION
  // เล่มแรก (manualOrder เรียงตามคะแนนมาแล้ว) ก่อนเข้า round-robin เพื่อให้เล่มที่ตรงประเด็น
  // จริงมีโอกาสได้ excerpt ที่สอง/สามก่อนที่เล่มที่ไม่ค่อยเกี่ยวข้องเลยจะมาแย่งคิวรอบแรก
  const MAX_MANUALS_IN_SECTION = 4;
  const limitedManualOrder = manualOrder.slice(0, MAX_MANUALS_IN_SECTION);
  const droppedManualIds = new Set(manualOrder.slice(MAX_MANUALS_IN_SECTION));
  for (const id of droppedManualIds) queues.delete(id);

  const includedManualIds = new Set<string>();
  let progress = true;
  while (progress && used < budgetLimit) {
    progress = false;
    for (const manualId of limitedManualOrder) {
      const queue = queues.get(manualId);
      if (!queue || queue.length === 0) continue;
      const { hit } = queue[0];

      // แท็กอ้างอิงพร้อมใช้ตรงตามรูปแบบที่บังคับในระบบ prompt (ดู staticSystemSegment ใน
      // routes/ai.ts) — วางไว้ทั้งก่อนและหลังตัวข้อความ (ไม่ใช่แค่หัวบล็อกแยกต่างหาก) เพื่อ
      // ให้ "ชื่อคู่มือ+หน้า" ติดไปกับเนื้อหาโดยตรง โมเดลจึงคัดลอกแท็กมาใช้ได้ทันทีโดยไม่ต้อง
      // เชื่อมโยงกลับไปหาหัวข้อ/ป้ายกำกับที่อยู่แยกกันเอง (ดูสาเหตุที่ระบุใน task ของบั๊กนี้)
      const pageText = hit.pageLabel ? fmt(hit.pageLabel) : "ไม่ระบุหน้า";
      const titleText = fmt(hit.manualTitle);
      const citationTag = `(อ้างอิง: ${titleText}, ${pageText})`;
      const meta = [
        hit.machineModel ? `รุ่น: ${fmt(hit.machineModel)}` : null,
        hit.similarity !== null ? `ความเกี่ยวข้อง: ${hit.similarity.toFixed(2)}` : "พบรหัสตรงตัวในคู่มือ",
      ]
        .filter(Boolean)
        .join(" | ");

      const excerpt = sanitizeManualExcerpt(hit.content, MAX_MANUAL_EXCERPT_CHARS);
      if (excerpt.length === 0) {
        queue.shift();
        progress = true;
        continue;
      }

      const block =
        `[${shown + 1}] ${citationTag}${meta ? ` — ${meta}` : ""}\n${excerpt}\n` +
        `(ใช้แท็กนี้ต่อท้ายคำตอบถ้านำข้อความข้างบนไปตอบ: ${citationTag})`;
      if (used + block.length + 2 > budgetLimit) {
        // hit นี้ใหญ่เกินที่เหลือ — ตัดทิ้งแล้วให้รอบถัดไปลอง hit ถัดไปของเล่มนี้ (อาจ
        // สั้นกว่า) หรือเล่มอื่นในลิสต์แทน ไม่หยุดทั้งฟังก์ชันทันที เพื่อให้ hit เล็กกว่า
        // จากเล่มอื่นยังมีโอกาสได้ที่ที่เหลืออยู่
        queue.shift();
        progress = true;
        continue;
      }

      lines.push(block);
      used += block.length + 2;
      shown += 1;
      includedManualIds.add(manualId);
      queue.shift();
      progress = true;
    }
  }

  if (shown === 0) return "";

  const totalManuals = manualOrder.length;
  if (hits.length > shown) {
    lines.push(`- (แสดง ${shown} จากทั้งหมด ${hits.length} ข้อความที่ค้นเจอ ส่วนที่เหลือถูกตัดออกเพราะเกินงบเนื้อหา)`);
  }

  // Diagnostic เฉพาะฝั่งเซิร์ฟเวอร์ (ไม่ส่งให้ผู้ใช้เห็น ไม่มีข้อมูลลับ) — กันบั๊กคลาสนี้
  // (ค้นเจอแต่ไม่ถึงโมเดลเพราะงบ) ไม่ให้เงียบเหมือนที่ผ่านมา
  if (shown < hits.length || includedManualIds.size < totalManuals) {
    const droppedManuals = manualOrder.filter((id) => !includedManualIds.has(id));
    console.warn(
      `[aiContext] manual context budget: found ${hits.length} hit(s) across ${totalManuals} manual(s), ` +
        `included ${shown} hit(s) across ${includedManualIds.size} manual(s)` +
        (droppedManuals.length > 0 ? `; manual(s) fully dropped: ${droppedManuals.join(", ")}` : "")
    );
  }

  return lines.join("\n\n");
}

interface SelectedManualRow {
  id: string;
  title: string;
  machine_model: string | null;
  markdown_content: string | null;
}

async function fetchSelectedManual(manualId: string): Promise<SelectedManualRow | null> {
  const { data, error } = await supabase
    .from("manuals")
    .select("id,title,machine_model,markdown_content")
    .eq("id", manualId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as SelectedManualRow | null;
}

// เมื่อผู้ใช้เลือกคู่มือเจาะจงในหน้าจอ (manualId ใน AiContextInput) ต้องมั่นใจว่าเนื้อหา
// คู่มือเล่มนั้นถูกใส่เข้า context เสมอ ไม่ใช่พึ่งผลค้นหา keyword/semantic ที่ค้นด้วยคำจาก
// คำถามอย่างเดียว ซึ่งไม่พอสำหรับคำถามกว้าง ๆ อย่าง "สรุปคู่มือนี้" (ไม่มีคำเทคนิคให้สกัด)
//
// ถ้าเนื้อหาทั้งเล่มสั้นพอ (<= MAX_SELECTED_MANUAL_CHARS) คืนส่วนที่ใส่เนื้อหาทั้งเล่มไป
// ตรง ๆ เป็นส่วนแยกต่างหาก (ดูการใช้งานใน buildKnowledgeContext — ใส่ "เพิ่มเติม" จากผล
// ค้นหาปกติ ไม่แทนที่) มีป้ายชื่อคู่มือชัดเจนไม่ปนกับผลค้นหาอื่น ๆ กันโมเดลอ้างชื่อคู่มือผิด
// เล่มเมื่อบล็อกข้อมูลมีคู่มือมากกว่าหนึ่งเล่มปรากฏอยู่ (เช่น จากผลการค้น semantic/keyword
// ที่ยังคงค้นคู่ขนานไปตามปกติ) ถ้ายาวเกินงบ คืนสตริงว่าง — กรณีนี้ต้องพึ่งผลค้นหา
// keyword/semantic ที่ buildKnowledgeContext จำกัดขอบเขตไว้ที่ manualId นี้อยู่แล้ว
// (ดู searchManualChunks/searchManualMarkdown calls ที่ส่ง manualIds เข้าไป และ
// manualMarkdownSearch.ts ที่เติมคำค้นกว้าง "หน้า" ให้อัตโนมัติเมื่อจำกัดด้วย manualIds)
//
// ต้องไม่ throw (เหมือนทุกฟังก์ชันใน buildKnowledgeContext) — คืนค่าว่างเมื่อพลาด
async function buildSelectedManualSection(manualId: string): Promise<string> {
  try {
    const manual = await fetchSelectedManual(manualId);
    if (!manual || !manual.markdown_content || manual.markdown_content.length === 0) {
      return "";
    }
    if (manual.markdown_content.length > MAX_SELECTED_MANUAL_CHARS) {
      return "";
    }

    const sanitized = sanitizeManualExcerpt(manual.markdown_content, MAX_SELECTED_MANUAL_CHARS);
    const titleText = fmt(manual.title);
    const header = [
      `[เนื้อหาคู่มือที่ผู้ใช้เลือกโดยตรง: ${titleText}]`,
      manual.machine_model ? `- รุ่นเครื่องจักรของคู่มือนี้: ${fmt(manual.machine_model)}` : null,
      "- ข้อความด้านล่างคือเนื้อหาเต็มของคู่มือเล่มนี้ ผู้ใช้เลือกเล่มนี้เจาะจงจากหน้าจอ ให้ใช้เป็นแหล่งอ้างอิงหลักสำหรับคำถามนี้",
      `- เมื่ออ้างอิงเนื้อหาส่วนนี้ ต้องใส่แท็ก (อ้างอิง: ${titleText}, หน้า N) ต่อท้ายคำตอบเสมอ โดยหา "N" จากหัวข้อ "## หน้า N" ที่อยู่ใกล้ข้อความที่นำมาใช้ที่สุด (หาไม่เจอให้ใส่ "ไม่ระบุหน้า" แทน N) ห้ามใช้ชื่อคู่มืออื่นนอกจาก "${titleText}" แม้จะมีคู่มือเล่มอื่นปรากฏในส่วน "[เนื้อหาจากคู่มือเครื่องจักรในระบบ]" ด้านล่างก็ตาม`,
    ]
      .filter(Boolean)
      .join("\n");
    return `${header}\n\n${sanitized}`;
  } catch (error) {
    console.error("buildSelectedManualSection failed:", error);
    return "";
  }
}

function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, "");
}

function evaluateRow(row: MachineRow): { level: "normal" | "warning" | "critical"; reasons: string[] } {
  return evaluateMachine({
    status: row.status ?? undefined,
    healthScore: row.health_score ?? undefined,
    spindleTemp: row.spindle_temp ?? undefined,
    vibrationMms: row.vibration_mms ?? undefined,
    activeErrorCode: row.active_error_code ?? undefined,
  });
}

// Resolves at most MAX_RESOLVED_MACHINES machines that the user's prompt is about:
// 1) the machine currently selected in the UI (by id if supplied, else by code),
// 2) machine codes scanned out of the prompt text via regex, 3) a case-insensitive
// substring match of the prompt against every machine's code/name, ranked by
// specificity. Never fabricates a match — rows that don't exist in `rows` are
// simply skipped. Also returns human-readable notes disclosing anything that was
// resolved ambiguously or dropped, so the AI (and anyone reading the transcript)
// never mistakes a partial/ambiguous resolution for a complete one.
function resolveMachines(
  prompt: string,
  machineContext: AiContextInput["machineContext"],
  rows: MachineRow[]
): { machines: MachineRow[]; notes: string[] } {
  const resolved: MachineRow[] = [];
  const seenIds = new Set<string>();
  const notes: string[] = [];

  const addRow = (row: MachineRow | undefined): void => {
    if (!row || seenIds.has(row.id) || resolved.length >= MAX_RESOLVED_MACHINES) return;
    seenIds.add(row.id);
    resolved.push(row);
  };

  const addRows = (matchRows: MachineRow[] | undefined): void => {
    if (!matchRows) return;
    for (const row of matchRows) {
      if (resolved.length >= MAX_RESOLVED_MACHINES) break;
      addRow(row);
    }
  };

  // Codes are NOT unique in this DB — backend/supabase/migrations/0009_alter_machines.sql
  // explicitly drops the unique constraint on machines.code and adds dup_qr_count to
  // document that duplicates are expected. A normalized code can therefore map to
  // more than one row; never silently pick one (last-write-wins from an unordered
  // `select` would make the AI describe the wrong machine).
  const byNormalizedCode = new Map<string, MachineRow[]>();
  for (const row of rows) {
    if (!row.code) continue;
    const key = normalizeCode(row.code);
    const list = byNormalizedCode.get(key);
    if (list) list.push(row);
    else byNormalizedCode.set(key, [row]);
  }

  const noteAmbiguousCode = (rawCode: string, matches: MachineRow[] | undefined): void => {
    if (matches && matches.length > 1) {
      notes.push(
        `- รหัส "${sanitizeField(rawCode)}" พบเครื่องจักรมากกว่า 1 เครื่องในระบบ (รหัสซ้ำ, ${matches.length} เครื่อง) แสดงข้อมูลทั้งหมดที่พบด้านล่าง`
      );
    }
  };

  // 1) The machine currently selected in the UI. Resolve by row id when the
  // caller supplies one — the only unambiguous key — and only fall back to code
  // (which may be duplicated) when no id is available.
  if (machineContext?.id) {
    addRow(rows.find((row) => row.id === machineContext.id));
  } else if (machineContext?.code) {
    const key = normalizeCode(machineContext.code);
    const matches = byNormalizedCode.get(key);
    noteAmbiguousCode(machineContext.code, matches);
    addRows(matches);
  }

  // 2) Machine codes scanned out of the prompt text via regex.
  const promptMatches = prompt.match(MACHINE_CODE_REGEX) ?? [];
  for (const match of promptMatches) {
    if (resolved.length >= MAX_RESOLVED_MACHINES) break;
    const key = normalizeCode(match);
    const matches = byNormalizedCode.get(key);
    noteAmbiguousCode(match, matches);
    addRows(matches);
  }

  // 3) Case-insensitive substring match of the prompt against every machine's
  // code/name. Ranked by specificity (exact match, then longest matched string)
  // rather than DB row order, and honestly discloses how many matched in total
  // vs. how many are actually shown — mirroring the disclosure the abnormal
  // section already gives ("แสดง 15 จากทั้งหมด N").
  const promptLower = prompt.toLowerCase();
  const candidates: { row: MachineRow; score: number }[] = [];
  for (const row of rows) {
    const codeLower = row.code?.toLowerCase() ?? "";
    const nameLower = row.name?.toLowerCase() ?? "";
    const codeHit =
      codeLower.length >= 2 &&
      (promptLower.includes(codeLower) || (promptLower.length >= 3 && codeLower.includes(promptLower)));
    const nameHit =
      nameLower.length >= 3 &&
      (promptLower.includes(nameLower) || (promptLower.length >= 3 && nameLower.includes(promptLower)));
    if (!codeHit && !nameHit) continue;
    let score = 0;
    if (codeHit) score = Math.max(score, codeLower === promptLower ? codeLower.length + 1000 : codeLower.length);
    if (nameHit) score = Math.max(score, nameLower === promptLower ? nameLower.length + 1000 : nameLower.length);
    candidates.push({ row, score });
  }
  candidates.sort((a, b) => b.score - a.score);

  let addedFromSubstringMatch = 0;
  for (const { row } of candidates) {
    if (resolved.length >= MAX_RESOLVED_MACHINES) break;
    if (seenIds.has(row.id)) continue; // already resolved above; don't count twice
    addRow(row);
    addedFromSubstringMatch += 1;
  }
  if (candidates.length > addedFromSubstringMatch) {
    notes.push(
      `- คำถามนี้ตรงกับชื่อ/รหัสเครื่องจักรทั้งหมด ${candidates.length} เครื่อง ` +
        `แสดงเพียง ${addedFromSubstringMatch} เครื่องแรกที่ตรงประเด็นที่สุด`
    );
  }

  return { machines: resolved, notes };
}

function buildOverviewSection(rows: MachineRow[]): string {
  const byStatus: Record<string, number> = { normal: 0, warning: 0, error: 0, maintenance: 0 };
  let other = 0;
  for (const row of rows) {
    if (row.status && row.status in byStatus) {
      byStatus[row.status] += 1;
    } else {
      other += 1;
    }
  }

  const lines = [
    "[ภาพรวมเครื่องจักรทั้งโรงงาน]",
    `- จำนวนเครื่องจักรทั้งหมด: ${rows.length} เครื่อง`,
    `- ปกติ (normal): ${byStatus.normal}`,
    `- เตือน (warning): ${byStatus.warning}`,
    `- ผิดปกติ/เสีย (error): ${byStatus.error}`,
    `- อยู่ระหว่างซ่อมบำรุง (maintenance): ${byStatus.maintenance}`,
  ];
  if (other > 0) lines.push(`- อื่นๆ/ไม่ระบุสถานะ: ${other}`);
  return lines.join("\n");
}

// `maxRows` is a parameter (not the module constant directly) so the caller can
// shrink this fleet-wide, generally-irrelevant-to-the-question list when a
// specific machine was already resolved from the prompt, or shrink it further
// still if the block is over budget — see buildKnowledgeContext. The "แสดง N
// จากทั้งหมด M" disclosure always reflects whatever cap was actually used, so it
// stays honest regardless of which cap was passed in.
function buildAbnormalSection(rows: MachineRow[], maxRows: number): string {
  const abnormal = rows
    .map((row) => ({ row, evaluation: evaluateRow(row) }))
    .filter(({ row, evaluation }) => row.status === "warning" || row.status === "error" || evaluation.level !== "normal");

  const lines = ["[รายการเครื่องจักรที่ผิดปกติ]"];
  if (abnormal.length === 0) {
    lines.push("- ไม่มีเครื่องจักรที่ผิดปกติในขณะนี้ (ทุกเครื่องอยู่ในเกณฑ์ปกติ)");
    return lines.join("\n");
  }

  const shown = abnormal.slice(0, maxRows);
  for (const { row, evaluation } of shown) {
    const reasons = evaluation.reasons.length > 0 ? evaluation.reasons.join("; ") : "ไม่มีเหตุผลเพิ่มเติม";
    lines.push(
      `- ${fmt(row.code)} | ${fmt(row.name)} | สถานที่: ${fmt(row.location)} | สถานะ: ${fmt(row.status)} | ` +
        `Health: ${fmt(row.health_score)} | Spindle: ${fmt(row.spindle_temp)} | Vibration: ${fmt(row.vibration_mms)} | ` +
        `Error: ${fmt(row.active_error_code)} (${fmt(row.active_error_desc)}) | เหตุผล: ${reasons}`
    );
  }
  if (abnormal.length > shown.length) {
    lines.push(`- (แสดง ${shown.length} จากทั้งหมด ${abnormal.length} เครื่องที่ผิดปกติ)`);
  }
  return lines.join("\n");
}

async function fetchMachineWorkOrders(machineCode: string | null): Promise<WorkOrderRow[]> {
  if (!machineCode) return [];
  // Mirrors the ordering used by GET /api/work-orders (workOrders.ts): newest
  // assigned_date first, id as a deterministic tiebreaker.
  const { data, error } = await supabase
    .from("work_orders")
    .select("*")
    .eq("machine_code", machineCode)
    .order("assigned_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(MAX_WORK_ORDERS_PER_MACHINE);
  if (error) throw error;
  return (data ?? []) as WorkOrderRow[];
}

async function fetchLatestTelemetry(machineId: string): Promise<TelemetryReadingRow | null> {
  const { data, error } = await supabase
    .from("telemetry_readings")
    .select("*")
    .eq("machine_id", machineId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as TelemetryReadingRow | null;
}

// Returns both a full rendering (all resolved work orders) and a compact rendering
// (work-order count only, no per-order detail) so the top-level assembler can drop
// the least important part first if the whole context block is over budget.
async function buildMachineDetail(
  row: MachineRow
): Promise<{ full: string; compact: string; workOrderCount: number; hasTelemetry: boolean }> {
  const [workOrders, telemetry] = await Promise.all([
    fetchMachineWorkOrders(row.code ?? null),
    fetchLatestTelemetry(row.id),
  ]);

  const evaluation = evaluateRow(row);
  const reasons = evaluation.reasons.length > 0 ? evaluation.reasons.join("; ") : "ไม่มีเหตุผลเพิ่มเติม";

  const baseLines = [
    `* เครื่อง ${fmt(row.code)} - ${fmt(row.name)}`,
    `  - สถานที่: ${fmt(row.location)} | สถานะ: ${fmt(row.status)} | Health: ${fmt(row.health_score)} | ` +
      `Spindle: ${fmt(row.spindle_temp)} | Vibration: ${fmt(row.vibration_mms)} | Error: ${fmt(row.active_error_code)} (${fmt(row.active_error_desc)})`,
    `  - รุ่น: ${fmt(row.model)} | ชั่วโมงใช้งาน: ${fmt(row.operating_hours)} | บำรุงล่าสุด: ${fmt(row.last_maintenance)} | ` +
      `บำรุงครั้งต่อไป: ${fmt(row.next_maintenance)} | หมวดหมู่: ${fmt(row.category)} | แผนก: ${fmt(row.department_code)} | ส่วน: ${fmt(row.section)}`,
    `  - ผลประเมิน: ${evaluation.level} | เหตุผล: ${reasons}`,
  ];

  const telemetryLine = telemetry
    ? `  - ข้อมูล telemetry ล่าสุด: ${fmt(telemetry.metric)} = ${fmt(telemetry.value)} | แหล่งข้อมูล: ${fmt(telemetry.source)} | เวลา: ${fmt(telemetry.recorded_at)}`
    : "  - ข้อมูล telemetry ล่าสุด: ไม่มีข้อมูลในระบบ";

  let woFullLines: string[];
  let woCompactLine: string;
  if (workOrders.length === 0) {
    woFullLines = ["  - ใบงานซ่อมบำรุงล่าสุด: ไม่มีข้อมูลในระบบ"];
    woCompactLine = "  - ใบงานซ่อมบำรุงล่าสุด: ไม่มีข้อมูลในระบบ";
  } else {
    woFullLines = [`  - ใบงานซ่อมบำรุงล่าสุด (${workOrders.length} รายการ):`];
    for (const wo of workOrders) {
      woFullLines.push(
        `    · เลขที่ใบงาน: ${fmt(wo.code)} | ชื่องาน: ${fmt(wo.title)} | สถานะ: ${fmt(wo.status)} | ความสำคัญ: ${fmt(wo.priority)} | ` +
          `วันที่สร้าง: ${fmt(wo.created_at)} | อาการ: ${fmt(wo.symptoms)} | สาเหตุ: ${fmt(wo.cause)} | ` +
          `การซ่อม: ${fmt(wo.repair_action)} | ประเภทงานซ่อม: ${fmt(wo.repair_category)} | เวลาสูญเสียการผลิต(นาที): ${fmt(wo.mtloss_min)}`
      );
    }
    woCompactLine = `  - ใบงานซ่อมบำรุงล่าสุด: ${workOrders.length} รายการ (รายละเอียดถูกตัดออกเนื่องจากข้อมูลยาวเกินไป)`;
  }

  const full = [...baseLines, ...woFullLines, telemetryLine].join("\n");
  const compact = [...baseLines, woCompactLine, telemetryLine].join("\n");
  return { full, compact, workOrderCount: workOrders.length, hasTelemetry: telemetry !== null };
}

// Drops WHOLE trailing lines (never a partial line) until `text` fits within
// `maxChars` including `note`, then appends `note`. Used only as the last-resort
// safety net below — the compact-detail branch above already avoids ever needing
// this by dropping whole per-work-order lines first.
function dropWholeLinesToFit(text: string, maxChars: number, note: string): string {
  if (text.length <= maxChars) return text;
  const budget = Math.max(0, maxChars - note.length);
  const lines = text.split("\n");
  while (lines.length > 0 && lines.join("\n").length > budget) {
    lines.pop();
  }
  return lines.join("\n") + note;
}

/**
 * Builds a Thai plain-text knowledge block from the live database,
 * to be embedded in the Gemini system prompt.
 * MUST NEVER THROW — returns "" on any failure.
 */
export async function buildKnowledgeContext(input: AiContextInput): Promise<string> {
  const onProgress = input?.onProgress;
  try {
    const prompt = typeof input?.prompt === "string" ? input.prompt : "";

    emitProgress(onProgress, { id: "machine", status: "start" });
    const rows = await getFleetRows();

    const { machines: resolvedMachines, notes: resolveNotes } = resolveMachines(
      prompt,
      input?.machineContext ?? null,
      rows
    );

    if (resolvedMachines.length === 0) {
      emitProgress(onProgress, {
        id: "machine",
        status: "skip",
        detail: "ไม่พบเครื่องจักรที่ระบุหรือเกี่ยวข้องกับคำถามนี้",
      });
      emitProgress(onProgress, { id: "workorders", status: "skip", detail: "ไม่มีเครื่องจักรที่ระบุ" });
      emitProgress(onProgress, { id: "telemetry", status: "skip", detail: "ไม่มีเครื่องจักรที่ระบุ" });
    } else {
      emitProgress(onProgress, {
        id: "machine",
        status: "done",
        detail: `พบ ${resolvedMachines.length} เครื่องจักรที่เกี่ยวข้องกับคำถามนี้`,
      });
      emitProgress(onProgress, { id: "workorders", status: "start" });
      emitProgress(onProgress, { id: "telemetry", status: "start" });
    }

    const promptHasContent = prompt.trim().length > 0;
    if (promptHasContent) {
      emitProgress(onProgress, { id: "expand", status: "start" });
    } else {
      emitProgress(onProgress, { id: "expand", status: "skip", detail: "ไม่มีคำถามให้ตีความ" });
    }
    emitProgress(onProgress, { id: "manuals", status: "start" });

    // ค้นคู่มือขนานไปกับการดึงรายละเอียดเครื่องจักร — การค้นต้องเรียก embedding API หนึ่ง
    // ครั้ง (หลายร้อยมิลลิวินาที) ถ้ารอต่อคิวกันจะยืดเวลาตอบแชตโดยไม่จำเป็น
    // ส่ง "รุ่น" ของเครื่องที่ resolve ได้ไปเป็นตัวกรองรุ่นคู่มือ (manualRetrieval จะใช้
    // จริงเฉพาะเมื่อมีคู่มือตรงรุ่นนั้นอยู่ในคลัง — ดูหมายเหตุใน resolveExistingModels)
    //
    // ค้นสองแหล่งขนานกันเสมอ: searchManualChunks (semantic/embedding บน manual_chunks
    // ที่ index แล้ว — ปัจจุบันครอบคลุมแค่ 4-5 เล่มจาก 26 เล่ม เพราะโควตา embedding
    // หมดระหว่าง index) และ searchManualMarkdown (keyword ตรงบน markdown_content เต็ม
    // เล่ม ไม่พึ่ง embedding เลย ใช้งานได้กับคู่มือทั้ง 26 เล่มทันที) ทั้งสองเป็นอิสระต่อ
    // กัน: ถ้าฝั่ง embedding ใช้ไม่ได้ (ยังไม่ index / ไม่มี Gemini key) ฝั่ง markdown
    // ยังคงทำงานได้ตามปกติ
    const candidateModels = resolvedMachines
      .map((row) => row.model)
      .filter((model): model is string => typeof model === "string" && model.trim().length > 0);

    // คู่มือที่ผู้ใช้เลือกเจาะจง (เช่นกดปุ่ม "ถามAI" บนการ์ดคู่มือเล่มหนึ่งในหน้า Manuals) —
    // จำกัดผลค้นหาทั้งสองแหล่งด้านล่างให้อยู่ในเล่มนี้เล่มเดียว (manualIds) และดึงเนื้อหา
    // ทั้งเล่มแยกต่างหากผ่าน buildSelectedManualSection เสมอ เพื่อไม่ให้การตอบพึ่งแค่ผล
    // ค้นหาด้วยคำจากคำถามอย่างเดียว (ดูหมายเหตุเหนือฟังก์ชันนั้น)
    const manualId =
      typeof input?.manualId === "string" && input.manualId.trim().length > 0
        ? input.manualId.trim()
        : undefined;

    const [details, semanticChunkHits, markdownHits, selectedManualSection] = await Promise.all([
      Promise.all(resolvedMachines.map((row) => buildMachineDetail(row))),
      searchManualChunks({ prompt, candidateModels, manualIds: manualId ? [manualId] : undefined }),
      searchManualMarkdown(
        prompt,
        candidateModels[0],
        manualId ? { manualIds: [manualId], maxHitsPerManual: 6 } : undefined
      ),
      manualId ? buildSelectedManualSection(manualId) : Promise.resolve(""),
    ]);

    if (resolvedMachines.length > 0) {
      const totalWorkOrders = details.reduce((sum, d) => sum + d.workOrderCount, 0);
      emitProgress(onProgress, {
        id: "workorders",
        status: "done",
        detail: `พบ ${totalWorkOrders} ใบงานซ่อมบำรุงจาก ${resolvedMachines.length} เครื่องจักร`,
      });
      const machinesWithTelemetry = details.filter((d) => d.hasTelemetry).length;
      emitProgress(onProgress, {
        id: "telemetry",
        status: "done",
        detail: `พบค่าเซนเซอร์ล่าสุดจาก ${machinesWithTelemetry}/${resolvedMachines.length} เครื่องจักร`,
      });
    }
    if (promptHasContent) {
      emitProgress(onProgress, { id: "expand", status: "done" });
    }

    const manualHits = mergeManualHits(semanticChunkHits, markdownHits);

    if (manualHits.length === 0 && !selectedManualSection) {
      emitProgress(onProgress, { id: "manuals", status: "skip", detail: "ไม่พบเนื้อหาที่เกี่ยวข้องในคู่มือ" });
    } else {
      const uniqueManualCount = new Set(manualHits.map((h) => h.manualId)).size;
      emitProgress(onProgress, {
        id: "manuals",
        status: "done",
        detail: `พบ ${manualHits.length} ท่อนจากคู่มือ ${uniqueManualCount} เล่ม`,
        manualHitCount: manualHits.length,
      });
    }

    const header =
      "ข้อมูลต่อไปนี้เป็นข้อมูลจริงที่อ่านจากฐานข้อมูลระบบ ณ เวลาที่ประมวลผลคำถามนี้ " +
      "(ทั้งข้อมูลเครื่องจักร/ใบงาน และเนื้อหาที่คัดมาจากคู่มือที่อัปโหลดไว้ในระบบ) " +
      "ตอบโดยอ้างอิงเฉพาะข้อมูลนี้เท่านั้น ห้ามแต่งตัวเลขหรือชื่อเครื่องขึ้นเอง หากไม่มีข้อมูลให้บอกว่าไม่มีข้อมูลในระบบ";

    // คำค้นเดียวกับที่ใช้ค้นคู่มือ (รหัส alarm + คำสำคัญจากคำถามตรง ๆ) นำมาใช้ซ้ำเพื่อจัด
    // อันดับความเกี่ยวข้องของ hits ก่อนตัดงบใน buildManualSection — ดูคอมเมนต์ที่
    // scoreManualHit ว่าทำไมชื่อคู่มือที่ตรงกับคำเหล่านี้จึงต้องได้คะแนนสูงสุด
    const manualQueryTerms = Array.from(
      new Set([...extractCodeTerms(prompt), ...extractSignificantTerms(prompt)].map((t) => t.toLowerCase()))
    );

    const thresholdSection = `[เกณฑ์การประเมิน]\n${thresholdSummaryText()}`;
    const manualSection = buildManualSection(manualHits, manualQueryTerms);
    const overviewSection = buildOverviewSection(rows);
    const matchNotesSection =
      resolveNotes.length > 0 ? ["[หมายเหตุการค้นหาเครื่องจักร]", ...resolveNotes].join("\n") : "";

    const fullDetailSection =
      details.length > 0
        ? ["[เครื่องจักรที่เกี่ยวข้องกับคำถาม (รายละเอียดเต็ม)]", ...details.map((d) => d.full)].join("\n\n")
        : "";

    // เนื้อหาคู่มือทั้งเล่มที่ผู้ใช้เลือกเจาะจง (ถ้ามี — ดู buildSelectedManualSection)
    // ต้องไม่ถูกตัดออกเหมือนส่วนอื่น เพราะเป็นสิ่งที่ผู้ใช้ตั้งใจเลือกมาโดยตรง จึงขยาย
    // งบรวมขึ้นเท่ากับขนาดของส่วนนี้พอดี (แทนที่จะไปแย่งงบกับข้อมูลเครื่องจักร/คู่มือที่ค้น
    // เจอทั่วไป) ส่วนอื่นทั้งหมดยังคงถูกตัด/ยุบตามลำดับความสำคัญปกติภายในงบเดิม
    const effectiveMaxContextChars = MAX_CONTEXT_CHARS + selectedManualSection.length;

    // The fleet-wide abnormal list (up to MAX_ABNORMAL_ROWS machines the user did
    // NOT ask about) is background noise once a specific machine was already
    // resolved from the prompt — shrink its row cap so its budget goes to the
    // question-relevant detail section instead of crowding it out.
    const focusedOnMachine = details.length > 0;
    const abnormalSection = buildAbnormalSection(rows, focusedOnMachine ? MAX_ABNORMAL_ROWS_FOCUSED : MAX_ABNORMAL_ROWS);

    // Assembly order matters: sections are listed from "last dropped" to "first
    // dropped" priority. The question-relevant detail (what the user actually
    // asked about), the threshold rules, and the manual excerpts retrieved for
    // this specific question come first/early so dropWholeLinesToFit — which only
    // ever trims whole lines off the END of the string — sacrifices the generic
    // fleet-wide overview/abnormal-list rows before ever touching them.
    // (The manual section is additionally capped on its own by
    // MAX_MANUAL_CONTEXT_CHARS inside buildManualSection, so it can neither be
    // crowded out by, nor crowd out, the machine data.)
    // selectedManualSection is placed right after the question-relevant machine
    // detail — never dropped by the shrink steps below, only ever traded off
    // against manualSection/matchNotesSection/overviewSection/abnormal (which sit
    // after it in the join order and are what dropWholeLinesToFit trims from the
    // end). effectiveMaxContextChars already grew by exactly its length above.
    const buildResult = (abnormal: string, detail: string): string =>
      [header, thresholdSection, detail, selectedManualSection, manualSection, matchNotesSection, overviewSection, abnormal]
        .filter(Boolean)
        .join("\n\n");

    let result = buildResult(abnormalSection, fullDetailSection);

    // Over budget even after shrinking the abnormal-list row cap above: shed the
    // fleet-wide abnormal list further still — it is generic data the user did not
    // ask about, so it is sacrificed before the question-relevant machine detail.
    if (result.length > effectiveMaxContextChars && abnormalSection.length > 0) {
      const tightAbnormalSection = buildAbnormalSection(rows, MAX_ABNORMAL_ROWS_TIGHT);
      result = buildResult(tightAbnormalSection, fullDetailSection);
    }

    // Still over budget: only now drop the least important part of the detail
    // itself — per-work-order detail — and keep just a count per machine. This
    // is the last resort before line-dropping and only fires when the fleet-wide
    // sections above have already been shrunk as far as they go.
    if (result.length > effectiveMaxContextChars && details.length > 0) {
      const tightAbnormalSection = buildAbnormalSection(rows, MAX_ABNORMAL_ROWS_TIGHT);
      const compactDetailSection = [
        "[เครื่องจักรที่เกี่ยวข้องกับคำถาม]",
        ...details.map((d) => d.compact),
        "- หมายเหตุ: รายละเอียดใบงานซ่อมบำรุงบางส่วนถูกตัดออกเนื่องจากข้อมูลยาวเกินไป",
      ].join("\n\n");
      result = buildResult(tightAbnormalSection, compactDetailSection);
    }

    // Still over budget (e.g. an enormous abnormal-machine list): drop whole
    // trailing lines (never slice mid-line — see dropWholeLinesToFit) as a last
    // resort, and say so, rather than silently/partially truncating a line.
    if (result.length > effectiveMaxContextChars) {
      const note = "\n\n- หมายเหตุ: เนื้อหาบางส่วนถูกตัดออกเนื่องจากข้อมูลยาวเกินขนาดที่กำหนด";
      result = dropWholeLinesToFit(result, effectiveMaxContextChars, note);
    }

    return result;
  } catch (error) {
    console.error("buildKnowledgeContext failed:", error);
    // Make sure no step is left stuck on "start" in the UI forever if this
    // function fails partway through — a real failure, reported honestly.
    for (const id of ["machine", "workorders", "telemetry", "expand", "manuals"]) {
      emitProgress(onProgress, { id, status: "skip", detail: "เกิดข้อผิดพลาดระหว่างอ่านข้อมูล" });
    }
    return "";
  }
}
