// Frame 4 ของ UX Storyboard (Scenario C): บันทึกการใช้งานผู้ช่วย + ผลตอบรับของผู้ใช้
// ตารางอยู่ที่ backend/supabase/migrations/0017_ai_interaction_logs.sql
//
// สัญญาสำคัญ: logAiInteraction "ต้องไม่ throw" ไม่ว่ากรณีใด การเก็บสถิติล้มเหลวต้องไม่
// ทำให้ผู้ใช้ถามผู้ช่วยไม่ได้ — log ที่หายไปหนึ่งแถวเสียหายน้อยกว่าแชตที่พัง
// (ต่างจาก setAiFeedback ซึ่งเป็นการกระทำที่ผู้ใช้กดเองและรอผลอยู่ จึงต้องรายงานความ
//  ล้มเหลวให้เห็น ไม่ใช่กลืนเงียบแล้วปล่อยให้ปุ่มดูเหมือนบันทึกสำเร็จ)

import { supabase } from "./supabase.js";

export interface AiInteractionLogInput {
  actorId?: string | null;
  machineId?: string | null;
  machineCode?: string | null;
  role?: string | null;
  prompt: string;
  intent: string;
  /** "mock" = ตอบด้วยกฎ, "live" = ตอบด้วยโมเดลจริง, "fallback" = โมเดลล้มแล้วใช้คำตอบสำรอง */
  mode: "mock" | "live" | "fallback";
  replyChars: number;
  manualCitations?: number;
}

// จำกัดความยาว prompt ที่เก็บ — คำถามจริงยาวไม่เกินไม่กี่ร้อยตัวอักษร ค่าที่ยาวกว่านี้
// คือการวางข้อความยาวหรือความพยายามยัดข้อมูลเข้าตาราง log
const MAX_LOGGED_PROMPT_CHARS = 2000;

/**
 * บันทึกหนึ่งครั้งของการถาม-ตอบ คืน id ของแถวที่บันทึก (ให้ฝั่งหน้าจอใช้ผูกกับปุ่ม
 * feedback) หรือ null ถ้าบันทึกไม่สำเร็จ — ผู้เรียกต้องรับมือกับ null ได้
 */
export async function logAiInteraction(input: AiInteractionLogInput): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("ai_interaction_logs")
      .insert({
        actor_id: input.actorId ?? null,
        machine_id: input.machineId ?? null,
        machine_code: input.machineCode ?? null,
        role: input.role ?? null,
        prompt: (input.prompt ?? "").slice(0, MAX_LOGGED_PROMPT_CHARS),
        intent: input.intent,
        mode: input.mode,
        reply_chars: input.replyChars,
        manual_citations: input.manualCitations ?? 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return (data as { id: number }).id;
  } catch (error) {
    console.error("logAiInteraction failed:", error);
    return null;
  }
}

/**
 * บันทึกผลตอบรับ (นิ้วขึ้น = 1, นิ้วลง = -1) ให้แถว log ที่ระบุ
 * โยน error เมื่อไม่พบแถวหรือบันทึกไม่สำเร็จ — ผู้ใช้กดปุ่มแล้วรอผลอยู่ ต้องรู้ว่าล้มเหลว
 *
 * อนุญาตให้เปลี่ยนใจได้ (เขียนทับค่าเดิม) เพราะผู้ใช้กดผิดปุ่มเป็นเรื่องปกติ และการ
 * ล็อกค่าแรกไว้ตลอดจะทำให้สถิติสะท้อนความผิดพลาดการกดมากกว่าความเห็นจริง
 */
export async function setAiFeedback(logId: number, feedback: 1 | -1): Promise<void> {
  const { data, error } = await supabase
    .from("ai_interaction_logs")
    .update({ feedback, feedback_at: new Date().toISOString() })
    .eq("id", logId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("ไม่พบรายการสนทนาที่ระบุ");
}
