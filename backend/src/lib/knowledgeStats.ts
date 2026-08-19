// UX Storyboard Scenario C — Frame 4 ("เห็นว่าถูกใช้จริง" / หน้าจอ: ภาพรวมคลังความรู้)
//
// สเปกของ Frame 4:
//   "— ไม่ใช้โมเดล — Analytics / Telemetry จาก log การใช้งานจริง
//    เหตุผล: นับจำนวนครั้งที่ความรู้ถูกอ้างอิง + คะแนน feedback จากช่าง
//    ข้อมูลชุดนี้คือ input หลักที่ใช้ปรับ retrieval ให้แม่นขึ้นในรอบถัดไป"
//
// และ User Goal ของ Frame 4 คือ "มั่นใจว่าความรู้ของตัวเองถูกส่งต่อได้จริง" — ตัวเลข
// ที่ต้องแสดงจึงเป็นตัวเลขต่อ "เรื่องความรู้" ไม่ใช่ยอดรวมของระบบ เพราะ Engineer
// ต้องเห็นว่า "เคสที่ตัวเองรีวิวไว้" ถูกใช้ ไม่ใช่ว่าระบบโดยรวมมีคนใช้เยอะ

import { supabase } from "./supabase.js";

export interface KnowledgeUsageRow {
  id: string;
  title: string;
  category: string | null;
  machineCode: string | null;
  sourceWorkOrderCode: string | null;
  confirmedByName: string | null;
  confirmedAt: string;
  /** จำนวนครั้งที่ความรู้เรื่องนี้ถูกอ้างอิงในคำตอบที่ส่งให้ช่าง */
  citedCount: number;
  /** จำนวนครั้งที่ช่างกดพอใจ / ไม่พอใจ กับคำตอบที่อ้างอิงความรู้เรื่องนี้ */
  helpfulCount: number;
  notHelpfulCount: number;
  /** true = Engineer แก้ร่างที่ระบบสร้างจริง (draft ต่างจากฉบับยืนยัน) */
  editedFromDraft: boolean;
}

export interface KnowledgeOverview {
  totalArticles: number;
  /** เรื่องที่ยังไม่เคยถูกอ้างอิงเลย — คือรายการที่ retrieval ยังหาไม่เจอ ต้องปรับ */
  neverCitedCount: number;
  totalCitations: number;
  totalHelpful: number;
  totalNotHelpful: number;
  /** ใบงานที่ยังรอรีวิวอยู่ (ค้างในคิว Frame 1) */
  pendingReviewCount: number;
  articles: KnowledgeUsageRow[];
}

interface ArticleRow {
  id: string;
  title: string;
  category: string | null;
  machine_code: string | null;
  source_work_order_code: string | null;
  confirmed_by_name: string | null;
  confirmed_at: string;
  content: string;
  draft_content: string | null;
}

interface LogRow {
  knowledge_article_ids: string[] | null;
  feedback: number | null;
}

/**
 * สรุปภาพรวมคลังความรู้พร้อมสถิติการถูกนำไปใช้จริง
 *
 * โยน error เมื่ออ่านฐานข้อมูลไม่สำเร็จ — หน้านี้มีหน้าที่ "ยืนยันว่าความรู้ถูกใช้จริง"
 * การแสดงเลข 0 เพราะอ่านฐานข้อมูลไม่ได้ จะสื่อผิดว่าไม่มีใครใช้ความรู้เลย ซึ่งตรงข้าม
 * กับความจริงและทำให้ Engineer สรุปผลผิด
 *
 * `limit`/`offset` แบ่งหน้ารายการ `articles` ที่คืนออกไป (เดิม hardcode .limit(200)
 * ซึ่งเป็น query ไม่จำกัดขนาดจริงเมื่อคลังความรู้โตเกิน 200 เรื่อง) — `totalArticles`
 * ยังคงเป็นจำนวนทั้งหมดจริง (จาก exact count) แต่ neverCitedCount/totalCitations/
 * totalHelpful/totalNotHelpful คำนวณจากเฉพาะหน้าที่ส่งกลับไปเท่านั้น ไม่ใช่ทั้งคลังแล้ว
 * (การคำนวณสถิติเหล่านี้ข้ามทั้งคลังจะย้อนกลับไปเป็น query ไม่จำกัดขนาดแบบเดิม)
 */
export async function getKnowledgeOverview(
  limit: number,
  offset: number
): Promise<{ overview: KnowledgeOverview; total: number }> {
  const { count: total, error: countError } = await supabase
    .from("knowledge_articles")
    .select("id", { count: "exact", head: true });
  if (countError) throw new Error(`นับจำนวนความรู้ไม่สำเร็จ: ${countError.message}`);

  const { data: articleData, error: articleError } = await supabase
    .from("knowledge_articles")
    .select("id,title,category,machine_code,source_work_order_code,confirmed_by_name,confirmed_at,content,draft_content")
    .order("confirmed_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (articleError) throw new Error(`ดึงรายการความรู้ไม่สำเร็จ: ${articleError.message}`);
  const articles = (articleData ?? []) as ArticleRow[];

  // ดึง log ที่อ้างอิงความรู้อย่างน้อยหนึ่งเรื่อง แล้วนับฝั่งแอป
  // (แทนการยิง count ต่อเรื่อง ซึ่งจะกลายเป็น N query สำหรับ N เรื่องความรู้)
  const { data: logData, error: logError } = await supabase
    .from("ai_interaction_logs")
    .select("knowledge_article_ids,feedback")
    .not("knowledge_article_ids", "eq", "{}");
  if (logError) throw new Error(`ดึงสถิติการใช้งานไม่สำเร็จ: ${logError.message}`);
  const logs = (logData ?? []) as LogRow[];

  const cited = new Map<string, { count: number; helpful: number; notHelpful: number }>();
  for (const log of logs) {
    for (const id of log.knowledge_article_ids ?? []) {
      const entry = cited.get(id) ?? { count: 0, helpful: 0, notHelpful: 0 };
      entry.count += 1;
      if (log.feedback === 1) entry.helpful += 1;
      else if (log.feedback === -1) entry.notHelpful += 1;
      cited.set(id, entry);
    }
  }

  const { count: pendingCount, error: pendingError } = await supabase
    .from("work_orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "review");
  if (pendingError) throw new Error(`นับใบงานรอรีวิวไม่สำเร็จ: ${pendingError.message}`);

  const rows: KnowledgeUsageRow[] = articles.map((a) => {
    const stat = cited.get(a.id) ?? { count: 0, helpful: 0, notHelpful: 0 };
    return {
      id: a.id,
      title: a.title,
      category: a.category,
      machineCode: a.machine_code,
      sourceWorkOrderCode: a.source_work_order_code,
      confirmedByName: a.confirmed_by_name,
      confirmedAt: a.confirmed_at,
      citedCount: stat.count,
      helpfulCount: stat.helpful,
      notHelpfulCount: stat.notHelpful,
      // เทียบร่างกับฉบับยืนยัน: ถ้าไม่มีร่างเก็บไว้ ถือว่า "ไม่รู้" ไม่ใช่ "ไม่ได้แก้"
      editedFromDraft: a.draft_content !== null && a.draft_content.trim() !== a.content.trim(),
    };
  });

  return {
    overview: {
      totalArticles: total ?? rows.length,
      neverCitedCount: rows.filter((r) => r.citedCount === 0).length,
      totalCitations: rows.reduce((sum, r) => sum + r.citedCount, 0),
      totalHelpful: rows.reduce((sum, r) => sum + r.helpfulCount, 0),
      totalNotHelpful: rows.reduce((sum, r) => sum + r.notHelpfulCount, 0),
      pendingReviewCount: pendingCount ?? 0,
      articles: rows,
    },
    total: total ?? rows.length,
  };
}
