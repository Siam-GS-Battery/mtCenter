// ค้นหาเนื้อหาคู่มือที่เกี่ยวข้องกับคำถาม เพื่อส่งต่อให้ buildKnowledgeContext ใส่ลง
// ใน system prompt ของ AI (backend/src/lib/aiContext.ts)
//
// สัญญาเดียวกับ buildKnowledgeContext: ฟังก์ชันในไฟล์นี้ "ต้องไม่ throw" ไม่ว่ากรณีใด
// คลังคู่มือที่ล่ม/ยังไม่ได้ index ต้องไม่ทำให้ตอบแชตไม่ได้ — คืนอาร์เรย์ว่างแทน
//
// ใช้การค้นหาสองแบบผสมกัน (hybrid search):
//   1) semantic — เวกเตอร์ความหมาย ตอบคำถามเชิงบรรยายได้ดี ("สปินเดิลร้อนต้องทำยังไง")
//   2) keyword  — ILIKE ตรงตัว จำเป็นสำหรับรหัส alarm/error/พารามิเตอร์ ซึ่ง embedding
//      มักจับไม่ติดเพราะรหัสสั้นและแทบไม่มีความหมายเชิงภาษา ("AL. 32", "E039")
// คำถามหน้างานส่วนใหญ่ของช่างซ่อมบำรุงเป็นแบบที่ 2 การมีแต่ semantic จึงไม่พอ

import { supabase } from "./supabase.js";
import { embedOne, toVectorLiteral } from "./embeddings.js";

export interface ManualSearchHit {
  chunkId: number;
  manualId: string;
  manualTitle: string;
  machineModel: string | null;
  category: string | null;
  heading: string | null;
  pageLabel: string | null;
  content: string;
  /** คะแนนความใกล้เคียง 0-1 จาก semantic search — null ถ้ามาจาก keyword search */
  similarity: number | null;
  source: "semantic" | "keyword";
}

// เกณฑ์คะแนนขั้นต่ำ: ต่ำกว่านี้ถือว่าไม่เกี่ยวข้องพอที่จะกิน budget ของ prompt
// ตั้งไว้ค่อนข้างต่ำโดยตั้งใจ เพราะคำถามภาษาไทยที่ไปค้นคู่มือภาษาอังกฤษ (ซึ่งเป็น
// กรณีปกติของคลังนี้) ได้คะแนน cross-lingual ต่ำกว่าคำถาม-เอกสารภาษาเดียวกันเสมอ
const MIN_SIMILARITY = 0.35;
const MAX_SEMANTIC_HITS = 6;
const MAX_KEYWORD_HITS = 3;
// จำนวนรหัสที่หยิบจากคำถามมาค้นแบบ keyword — ผู้ใช้ที่ถามพร้อมกันหลายรหัสพบได้น้อย
// และแต่ละรหัสคือ query เพิ่มอีกหนึ่งครั้ง
const MAX_CODE_TERMS = 2;

// รหัส alarm/error ในคู่มือชุดนี้มีหลายรูปแบบ: "E001" (Panasonic laser marker),
// "AL. 32" / "AL.032" (Mitsubishi servo), "ALM52", "Error 401"
// จับกลุ่มตัวอักษรนำหน้า + ตัวเลข โดยยอมให้มีจุด/ช่องว่าง/ขีดคั่นตรงกลาง
const CODE_REGEX = /\b(AL|ALM|ALARM|ERR|ERROR|WNG|WARNING|E|A|F|P)[\s.\-]?(\d{1,4})\b/gi;

/**
 * ดึงรหัส alarm/error จากคำถามของผู้ใช้ คืนรูปแบบที่พร้อมใช้กับ ILIKE
 * คืนทั้งรูปที่มีตัวคั่นและไม่มี เพราะคู่มือแต่ละยี่ห้อพิมพ์คนละแบบ ("AL. 32" vs "AL32")
 */
export function extractCodeTerms(prompt: string): string[] {
  if (typeof prompt !== "string") return [];
  const terms: string[] = [];
  const seen = new Set<string>();
  // ตัว regex เป็น /g และถูกใช้ซ้ำข้ามการเรียก — รีเซ็ต lastIndex ทุกครั้ง ไม่งั้นการ
  // เรียกครั้งถัดไปจะเริ่มค้นจากตำแหน่งค้างของครั้งก่อนและพลาดรหัสที่อยู่ต้นข้อความ
  CODE_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CODE_REGEX.exec(prompt)) !== null) {
    const prefix = match[1].toUpperCase();
    const digits = match[2];
    // ตัวอักษรเดี่ยว (E/A/F/P) ที่ตามด้วยเลขหลักเดียวสั้นเกินไป จะไป match ข้อความ
    // ทั่วไปมั่วไปหมด (เช่น "P1" ในประโยคธรรมดา) จึงข้ามไป
    if (prefix.length === 1 && digits.length < 3) continue;
    for (const variant of [`${prefix}${digits}`, `${prefix}. ${digits}`, `${prefix} ${digits}`]) {
      const key = variant.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      terms.push(variant);
    }
    if (terms.length >= MAX_CODE_TERMS * 3) break;
  }
  return terms;
}

interface RpcRow {
  chunk_id: number;
  manual_id: string;
  manual_title: string;
  machine_model: string | null;
  category: string | null;
  heading: string | null;
  page_label: string | null;
  chunk_index: number;
  content: string;
  similarity?: number;
}

function toHit(row: RpcRow, source: ManualSearchHit["source"]): ManualSearchHit {
  return {
    chunkId: row.chunk_id,
    manualId: row.manual_id,
    manualTitle: row.manual_title,
    machineModel: row.machine_model,
    category: row.category,
    heading: row.heading,
    pageLabel: row.page_label,
    content: row.content,
    similarity: typeof row.similarity === "number" ? row.similarity : null,
    source,
  };
}

/**
 * กรองรายชื่อรุ่นเครื่องที่ "มีคู่มืออยู่จริง" ในคลัง
 *
 * machines.model (เช่นรุ่นเครื่อง CNC) กับ manuals.machine_model (เช่น "MR-J5",
 * "LP-RF200P" ซึ่งเป็นรุ่นของ servo amp / laser marker ที่ติดตั้งอยู่ในเครื่อง) เป็น
 * คนละชุดค่ากัน ถ้าเอา model ของเครื่องไปกรองตรง ๆ ผลลัพธ์จะว่างเปล่าเกือบทุกครั้ง
 * จึงกรองเฉพาะเมื่อค่านั้นมีคู่มือตรงรุ่นอยู่จริงเท่านั้น กรณีอื่นค้นทั้งคลัง
 */
async function resolveExistingModels(candidates: string[]): Promise<string[] | null> {
  const cleaned = Array.from(new Set(candidates.map((c) => c.trim()).filter((c) => c.length > 0)));
  if (cleaned.length === 0) return null;
  const { data, error } = await supabase.from("manuals").select("machine_model").in("machine_model", cleaned);
  if (error) throw error;
  const found = Array.from(new Set((data ?? []).map((r: { machine_model: string | null }) => r.machine_model).filter((m): m is string => Boolean(m))));
  return found.length > 0 ? found : null;
}

export interface ManualSearchParams {
  prompt: string;
  /** รุ่นเครื่องที่เกี่ยวข้องกับคำถาม (ใช้เป็นตัวกรองเฉพาะเมื่อมีคู่มือตรงรุ่นจริง) */
  candidateModels?: string[];
  maxHits?: number;
}

/**
 * ค้นคู่มือแบบผสม semantic + keyword — ไม่ throw ทุกกรณี (คืน [] เมื่อพลาด)
 * ผลลัพธ์เรียง keyword ก่อน semantic เพราะการที่คำถามมีรหัส alarm แล้วเจอรหัสนั้น
 * ตรงตัวในคู่มือ คือหลักฐานที่หนักแน่นกว่าคะแนนความใกล้เคียงเชิงความหมาย
 */
export async function searchManualChunks(params: ManualSearchParams): Promise<ManualSearchHit[]> {
  try {
    const prompt = typeof params?.prompt === "string" ? params.prompt.trim() : "";
    if (prompt.length === 0) return [];

    // ยังไม่มีคู่มือใน index เลย: ออกก่อนที่จะเสียคำขอ embedding ไปเปล่า ๆ
    if (!(await hasIndexedManuals())) return [];

    const maxHits = params.maxHits ?? MAX_SEMANTIC_HITS + MAX_KEYWORD_HITS;
    const modelFilter = await resolveExistingModels(params.candidateModels ?? []);

    const codeTerms = extractCodeTerms(prompt).slice(0, MAX_CODE_TERMS * 3);
    // ค้น keyword ทุกรูปแบบของรหัสพร้อมกัน แล้วค่อยตัดซ้ำทีหลัง — เร็วกว่าค้นทีละรูป
    // และจำนวน query ยังคงน้อย (อย่างมาก MAX_CODE_TERMS * 3)
    const keywordPromise = Promise.all(
      codeTerms.map((term) =>
        supabase.rpc("keyword_manual_chunks", {
          search_term: term,
          match_count: MAX_KEYWORD_HITS,
          filter_machine_models: modelFilter,
        })
      )
    );

    const semanticPromise = (async () => {
      const embedding = await embedOne(prompt, "RETRIEVAL_QUERY");
      return supabase.rpc("match_manual_chunks", {
        query_embedding: toVectorLiteral(embedding),
        match_count: MAX_SEMANTIC_HITS,
        min_similarity: MIN_SIMILARITY,
        filter_machine_models: modelFilter,
        filter_manual_ids: null,
      });
    })();

    // allSettled: ถ้าฝั่งใดฝั่งหนึ่งล้ม (เช่นโควตา embedding หมด) อีกฝั่งยังใช้ได้
    // การตอบด้วยผล keyword อย่างเดียวดีกว่าไม่ตอบอะไรเลย
    const [keywordResult, semanticResult] = await Promise.allSettled([keywordPromise, semanticPromise]);

    const hits: ManualSearchHit[] = [];
    const seenChunkIds = new Set<number>();

    const addRows = (rows: RpcRow[] | null | undefined, source: ManualSearchHit["source"]): void => {
      for (const row of rows ?? []) {
        if (seenChunkIds.has(row.chunk_id)) continue;
        seenChunkIds.add(row.chunk_id);
        hits.push(toHit(row, source));
      }
    };

    if (keywordResult.status === "fulfilled") {
      for (const response of keywordResult.value) {
        if (response.error) {
          console.error("keyword_manual_chunks failed:", response.error.message);
          continue;
        }
        addRows(response.data as RpcRow[] | null, "keyword");
      }
    } else {
      console.error("keyword manual search failed:", keywordResult.reason);
    }

    if (semanticResult.status === "fulfilled") {
      if (semanticResult.value.error) {
        console.error("match_manual_chunks failed:", semanticResult.value.error.message);
      } else {
        addRows(semanticResult.value.data as RpcRow[] | null, "semantic");
      }
    } else {
      console.error("semantic manual search failed:", semanticResult.reason);
    }

    return hits.slice(0, maxHits);
  } catch (error) {
    console.error("searchManualChunks failed:", error);
    return [];
  }
}

// แคชผลว่า "คลังมี chunk อยู่หรือยัง" — ดูเหตุผลที่ต้องมีในหมายเหตุของ
// hasIndexedManuals() ด้านล่าง TTL สั้น ๆ พอให้ระบบที่เพิ่ง index เสร็จเริ่มค้นเจอ
// ภายในไม่กี่นาทีโดยไม่ต้อง restart เซิร์ฟเวอร์
const INDEX_PRESENCE_TTL_MS = 60_000;
let indexPresenceCache: { hasChunks: boolean; expiresAt: number } | null = null;

/**
 * มีคู่มือที่ index แล้วอยู่ในระบบหรือไม่
 *
 * ใช้เป็นประตูด่านแรกของ searchManualChunks เพื่อไม่ให้ทุกข้อความในแชตยิง embedding
 * API ทิ้งเปล่าเมื่อยังไม่เคยรัน `npm run index:manuals` เลย (คำถามหนึ่งครั้ง = หนึ่ง
 * คำขอ embedding + หน่วงเวลาอีกหลายร้อยมิลลิวินาที เพื่อค้นตารางที่ว่างเปล่า)
 *
 * แคชผลไว้ทั้งกรณี true และ false: กรณี false คือกรณีที่ต้องกันการยิงซ้ำมากที่สุด
 * ถ้าแคชเฉพาะ true จะยังเหลือ query นับแถวทุกครั้งบนระบบที่ยังไม่ได้ index
 * คืน false เมื่อเกิดข้อผิดพลาด (ไม่แคช เพื่อให้ครั้งถัดไปลองใหม่)
 */
export async function hasIndexedManuals(): Promise<boolean> {
  const now = Date.now();
  if (indexPresenceCache && indexPresenceCache.expiresAt > now) {
    return indexPresenceCache.hasChunks;
  }
  try {
    // head + count exact: ไม่ดึงแถวจริงกลับมาเลย นับอย่างเดียว
    const { count, error } = await supabase
      .from("manual_chunks")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    const hasChunks = (count ?? 0) > 0;
    indexPresenceCache = { hasChunks, expiresAt: Date.now() + INDEX_PRESENCE_TTL_MS };
    return hasChunks;
  } catch (error) {
    console.error("hasIndexedManuals failed:", error);
    return false;
  }
}
