// แกนกลางของการ index คู่มือ: อ่าน markdown_content -> ตัด chunk -> สร้าง embedding
// -> เขียนลง manual_chunks -> อัปเดตสถานะในตาราง manuals
//
// ใช้ร่วมกันสองที่ ห้ามคัดลอกโค้ดนี้ไปไว้ที่อื่น:
//   - CLI สำหรับ index ทั้งคลัง: backend/scripts/index-manuals.ts
//   - endpoint สำหรับ index รายเล่ม: POST /api/manuals/:id/index (routes/manuals.ts)
// ถ้าสองทางนี้ตัด chunk หรือ normalize เวกเตอร์ไม่เหมือนกัน ดัชนีจะปนกันสองมาตรฐาน
// และคุณภาพผลค้นหาจะตกโดยไม่มี error ใด ๆ ให้เห็น
//
// ต่างจากไฟล์อื่นในโฟลเดอร์นี้: ฟังก์ชันในไฟล์นี้ "โยน error ได้" โดยตั้งใจ การ index
// ที่ล้มเหลวต้องรู้ตัวและแก้ ไม่ใช่กลืนเงียบ (ตรงข้ามกับ manualRetrieval.ts ซึ่งอยู่ใน
// เส้นทางการตอบแชตและต้องไม่ทำให้แชตล่ม)

import { createHash } from "node:crypto";
import { supabase } from "./supabase.js";
import { chunkManualMarkdown, buildEmbeddingText, type ManualChunk } from "./manualChunker.js";
import { embedBatch, toVectorLiteral, EMBED_BATCH_SIZE } from "./embeddings.js";

// จำนวนแถวต่อการ insert หนึ่งครั้ง — แต่ละแถวมีเวกเตอร์ 768 ตัวเลข (~15KB เมื่อส่งเป็น
// ข้อความผ่าน PostgREST) บวกเนื้อหาอีกราว 2KB การ insert ทีละมาก ๆ จะชน payload limit
const INSERT_BATCH_SIZE = 50;

export interface ManualSummary {
  id: string;
  title: string;
  machine_model: string | null;
  category: string | null;
  has_markdown: boolean | null;
  indexed_content_hash: string | null;
  indexing_content_hash: string | null;
  chunk_count: number | null;
}

export const MANUAL_SUMMARY_COLUMNS =
  "id,title,machine_model,category,has_markdown,indexed_content_hash,indexing_content_hash,chunk_count" as const;

export type IndexStatus = "indexed" | "would-index" | "skipped-unchanged" | "skipped-no-content";

export interface IndexResult {
  id: string;
  title: string;
  machineModel: string | null;
  contentChars: number;
  chunks: number;
  /** จำนวน chunk ที่สร้าง embedding จริงในรอบนี้ (น้อยกว่า chunks ได้ถ้าทำต่อจากของค้าง) */
  embeddedChunks: number;
  /** จำนวน chunk ที่ข้ามเพราะรอบก่อนทำไว้แล้ว */
  resumedFrom: number;
  status: IndexStatus;
}

export interface IndexOptions {
  /** ตัด chunk และรายงานผลเท่านั้น ไม่เรียก embedding API และไม่เขียนฐานข้อมูล */
  dryRun?: boolean;
  /** index ใหม่แม้ hash ของเนื้อหาจะไม่เปลี่ยนจากรอบก่อน */
  force?: boolean;
  /** จำกัดจำนวน chunk ต่อเล่ม (โหมดทดสอบ — จะไม่บันทึก hash เพราะ index ไม่ครบเล่ม) */
  maxChunks?: number | null;
  /** callback รายงานความคืบหน้าให้ CLI แสดงผล (endpoint ไม่ต้องส่งมา) */
  onProgress?: (message: string) => void;
}

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export async function fetchManualSummaries(): Promise<ManualSummary[]> {
  const { data, error } = await supabase
    .from("manuals")
    .select(MANUAL_SUMMARY_COLUMNS)
    .order("title", { ascending: true });
  if (error) throw new Error(`ดึงรายชื่อคู่มือไม่สำเร็จ: ${error.message}`);
  return (data ?? []) as ManualSummary[];
}

export async function fetchManualSummary(manualId: string): Promise<ManualSummary | null> {
  const { data, error } = await supabase
    .from("manuals")
    .select(MANUAL_SUMMARY_COLUMNS)
    .eq("id", manualId)
    .maybeSingle();
  if (error) throw new Error(`ดึงข้อมูลคู่มือไม่สำเร็จ: ${error.message}`);
  return (data as ManualSummary | null) ?? null;
}

// จำนวน chunk ที่ index ไว้แล้วของคู่มือเล่มนี้ ใช้หาจุดที่จะทำต่อเมื่อรอบก่อนค้างกลางทาง
// นับจาก chunk_index สูงสุด + 1 (ไม่ใช่ count) เพราะ chunk ถูกเขียนเรียงตาม index เสมอ
// ค่าที่ได้จึงเป็น "จุดที่ควรเริ่มต่อ" ตรง ๆ
async function countExistingChunks(manualId: string): Promise<number> {
  const { data, error } = await supabase
    .from("manual_chunks")
    .select("chunk_index")
    .eq("manual_id", manualId)
    .order("chunk_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`ตรวจสอบ chunk ที่มีอยู่ไม่สำเร็จ: ${error.message}`);
  const highest = (data as { chunk_index: number } | null)?.chunk_index;
  return typeof highest === "number" ? highest + 1 : 0;
}

// สร้าง embedding แล้วบันทึกทีละ batch สลับกันไป (ไม่ใช่สร้างให้ครบทั้งเล่มก่อนค่อย
// บันทึก) เพื่อให้ความคืบหน้าถูกเก็บลงฐานข้อมูลตลอดทาง งานนี้ยาวระดับชั่วโมงเพราะ
// โควตา 100 ชิ้น/นาที ถ้าเก็บ embedding ไว้ในหน่วยความจำจนจบเล่มแล้วค่อยเขียน
// เล่มใหญ่สุด (2,258 chunk ≈ 23 นาที) จะสูญเปล่าทั้งหมดหากล้มตอนใกล้จบ
async function embedAndStoreChunks(
  manual: ManualSummary,
  chunks: ManualChunk[],
  startAt: number,
  onProgress?: (message: string) => void
): Promise<number> {
  let embedded = 0;
  for (let i = startAt; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const slice = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const texts = slice.map((chunk) =>
      buildEmbeddingText({ manualTitle: manual.title, machineModel: manual.machine_model, chunk })
    );
    const embeddings = await embedBatch(texts, "RETRIEVAL_DOCUMENT");
    embedded += embeddings.length;

    for (let j = 0; j < slice.length; j += INSERT_BATCH_SIZE) {
      const rows = slice.slice(j, j + INSERT_BATCH_SIZE).map((chunk, k) => ({
        manual_id: manual.id,
        chunk_index: chunk.chunkIndex,
        heading: chunk.heading,
        page_label: chunk.pageLabel,
        content: chunk.content,
        char_count: chunk.charCount,
        // pgvector รับค่าเป็นข้อความรูปแบบ "[0.1,0.2,...]" เมื่อส่งผ่าน PostgREST
        embedding: toVectorLiteral(embeddings[j + k]),
      }));
      const { error: insertError } = await supabase.from("manual_chunks").insert(rows);
      if (insertError) throw new Error(`บันทึก chunk ไม่สำเร็จ (เริ่มที่ index ${i + j}): ${insertError.message}`);
    }

    onProgress?.(`${Math.min(i + slice.length, chunks.length)}/${chunks.length} chunk`);
  }
  return embedded;
}

/**
 * index คู่มือหนึ่งเล่ม โยน error เมื่อทำไม่สำเร็จ
 * ตั้ง ai_indexed = true เฉพาะเมื่อบันทึก chunk ครบแล้วเท่านั้น — ถ้าล้มกลางทาง
 * สถานะเดิมต้องคงอยู่ เพื่อให้รอบถัดไปรู้ว่ายังต้อง index เล่มนี้
 */
export async function indexManual(manual: ManualSummary, options: IndexOptions = {}): Promise<IndexResult> {
  const { dryRun = false, force = false, maxChunks = null, onProgress } = options;

  const base = { id: manual.id, title: manual.title, machineModel: manual.machine_model };

  // ดึง markdown_content ทีละเล่ม — เล่มใหญ่สุดในคลังนี้มี 2.6 ล้านตัวอักษร การ select
  // เนื้อหาทั้งคลังพร้อมกันจะกินหน่วยความจำหลายสิบ MB โดยไม่จำเป็น
  const { data, error } = await supabase.from("manuals").select("markdown_content").eq("id", manual.id).maybeSingle();
  if (error) throw new Error(`อ่านเนื้อหาคู่มือไม่สำเร็จ: ${error.message}`);

  const content = (data?.markdown_content as string | null) ?? "";
  if (content.trim().length === 0) {
    return { ...base, contentChars: 0, chunks: 0, embeddedChunks: 0, resumedFrom: 0, status: "skipped-no-content" };
  }

  const hash = sha256(content);
  if (!force && manual.indexed_content_hash === hash && (manual.chunk_count ?? 0) > 0) {
    return {
      ...base,
      contentChars: content.length,
      chunks: manual.chunk_count ?? 0,
      embeddedChunks: 0,
      resumedFrom: 0,
      status: "skipped-unchanged",
    };
  }

  let chunks = chunkManualMarkdown(content);
  if (maxChunks !== null && chunks.length > maxChunks) {
    onProgress?.(`จำกัดจาก ${chunks.length} chunk เหลือ ${maxChunks} chunk (โหมดทดสอบ)`);
    chunks = chunks.slice(0, maxChunks);
  }
  onProgress?.(`เนื้อหา ${content.length.toLocaleString()} ตัวอักษร -> ${chunks.length} chunk`);

  if (chunks.length === 0) {
    return { ...base, contentChars: content.length, chunks: 0, embeddedChunks: 0, resumedFrom: 0, status: "skipped-no-content" };
  }
  if (dryRun) {
    return {
      ...base,
      contentChars: content.length,
      chunks: chunks.length,
      embeddedChunks: 0,
      resumedFrom: 0,
      status: "would-index",
    };
  }

  // ตัดสินใจว่าจะ "ทำต่อ" หรือ "เริ่มใหม่" — ดูเหตุผลของ indexing_content_hash ใน
  // migration 0016_manual_indexing_resume.sql
  // --force สั่งให้เริ่มใหม่เสมอ แม้จะมีของค้างที่ hash ตรงกัน
  const canResume = !force && manual.indexing_content_hash === hash;
  let startAt = 0;
  if (canResume) {
    startAt = await countExistingChunks(manual.id);
    if (startAt >= chunks.length) {
      // ของค้างครบแล้ว (ล้มตอนอัปเดตสถานะรอบก่อน) — ไม่ต้องสร้าง embedding ใหม่เลย
      startAt = chunks.length;
    } else if (startAt > 0) {
      onProgress?.(`ทำต่อจาก chunk ที่ ${startAt} (รอบก่อนค้างไว้)`);
    }
  } else {
    // เนื้อหาเปลี่ยนไปจากรอบก่อน (หรือสั่ง --force): ลบ chunk เดิมทิ้งทั้งหมดก่อน
    // ถ้าจำนวน chunk รอบใหม่น้อยกว่ารอบก่อน การเขียนทับเฉย ๆ จะทิ้ง chunk ส่วนเกินของ
    // เนื้อหาเวอร์ชันเก่าไว้ในดัชนี แล้ว AI จะอ้างอิงเนื้อหาที่ถูกแก้ไป/ลบไปแล้ว
    const { error: deleteError } = await supabase.from("manual_chunks").delete().eq("manual_id", manual.id);
    if (deleteError) throw new Error(`ลบ chunk เดิมไม่สำเร็จ: ${deleteError.message}`);
  }

  // ปักธง "กำลัง index เนื้อหาเวอร์ชันนี้" ก่อนเริ่มยิง embedding — ต้องเขียนก่อนเสมอ
  // ไม่ใช่หลัง ไม่งั้นถ้าล้มกลางทางรอบถัดไปจะมองว่าเป็นเนื้อหาที่ไม่เคยเริ่ม แล้วลบ
  // chunk ที่ทำไว้แล้วทิ้งทั้งหมดและเริ่มจากศูนย์
  if (!canResume) {
    const { error: markError } = await supabase
      .from("manuals")
      .update({ indexing_content_hash: hash })
      .eq("id", manual.id);
    if (markError) throw new Error(`ปักธงสถานะกำลัง index ไม่สำเร็จ: ${markError.message}`);
  }

  const embeddedChunks = await embedAndStoreChunks(manual, chunks, startAt, onProgress);

  // โหมด --max-chunks index ไม่ครบเล่ม จึงห้ามบันทึก hash ว่า "เสร็จแล้ว" ไม่งั้นรอบ
  // ถัดไปจะเข้าใจผิดว่าเล่มนี้ index ครบและข้ามไป ทำให้เนื้อหาที่เหลือไม่เคยเข้าดัชนี
  const partial = maxChunks !== null;
  const { error: updateError } = await supabase
    .from("manuals")
    .update({
      ai_indexed: true,
      indexed_at: new Date().toISOString(),
      indexed_content_hash: partial ? null : hash,
      // ล้างธง "กำลังทำ" เมื่อจบครบเล่มแล้ว (โหมดทดสอบยังถือว่าไม่ครบ จึงคงธงไว้ให้
      // รอบถัดไปทำต่อจากจุดที่ค้าง)
      indexing_content_hash: partial ? hash : null,
      chunk_count: chunks.length,
    })
    .eq("id", manual.id);
  if (updateError) throw new Error(`อัปเดตสถานะคู่มือไม่สำเร็จ: ${updateError.message}`);

  return {
    ...base,
    contentChars: content.length,
    chunks: chunks.length,
    embeddedChunks,
    resumedFrom: startAt,
    status: "indexed",
  };
}
