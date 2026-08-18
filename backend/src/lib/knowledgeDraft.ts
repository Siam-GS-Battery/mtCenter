// UX Storyboard Scenario C — Frame 2 ("รีวิวและเติมความรู้")
//
// สเปกของ Frame 2:
//   "LLM สรุปร่าง + Human-in-the-loop (scb10x/typhoon2.1-gemma3-12b)
//    เหตุผล: ให้ AI จัดสิ่งที่ช่างเล่าเป็นร่างองค์ความรู้ Engineer แค่ตรวจและเติม
//    — ความรู้จะเข้าคลังต่อเมื่อคนกดยืนยันเท่านั้น ห้าม AI เขียนความรู้เข้าคลังเอง"
//
// ในโหมด mock ตัว "LLM สรุปร่าง" ถูกแทนด้วยการจัดรูปแบบตามกฎจากฟิลด์จริงของใบงาน
// (อาการ/สาเหตุ/การแก้ไข/ขั้นตอนที่ช่างบันทึก) ซึ่ง "ไม่แต่งเนื้อหาใหม่เลย" — เรียบเรียง
// เฉพาะสิ่งที่ช่างเขียนไว้จริง ข้อดีเทียบกับ LLM ในบริบท POC คือร่างไม่มีทางกุข้อมูล
// ที่ช่างไม่ได้พูด ซึ่งเป็นความเสี่ยงหลักของขั้นตอนนี้ (Engineer อาจกดยืนยันผ่าน ๆ)
//
// สิ่งที่ยังไม่ทำและตั้งใจไม่ทำในโหมด mock: การสรุปเชิงภาษา (เช่นย่อความ เรียบเรียงใหม่
// เชื่อมโยงกับเคสอื่น) — เพราะทำได้แค่ด้วยโมเดลจริง ถ้าจะเปลี่ยนไปใช้ typhoon ให้แทนที่
// buildKnowledgeDraft() ทั้งฟังก์ชัน โดยคงสัญญาเดิม: คืน "ร่าง" ที่ยังไม่ถูกบันทึกที่ใด

import { randomUUID } from "node:crypto";
import { supabase } from "./supabase.js";
import type { WorkOrderRow } from "./mappers.js";

/** ค่าที่ไม่มีข้อมูลต้องเขียนว่าไม่มี ไม่ใช่เว้นว่างให้ดูเหมือนช่างไม่ได้เล่า */
const MISSING = "— ช่างไม่ได้บันทึกไว้ —";

function text(value: unknown): string {
  if (value === null || value === undefined) return MISSING;
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean);
    return items.length > 0 ? items.join("\n") : MISSING;
  }
  const s = String(value).trim();
  return s.length > 0 ? s : MISSING;
}

function bulletList(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const items = value.map((v) => String(v).trim()).filter(Boolean);
  if (items.length === 0) return null;
  return items.map((item) => `- ${item}`).join("\n");
}

export interface KnowledgeDraft {
  /** ร่างหัวเรื่อง — Engineer แก้ได้ */
  title: string;
  category: string;
  machineModel: string | null;
  machineCode: string | null;
  tags: string[];
  summary: string;
  /** ร่างเนื้อหา Markdown — Engineer แก้ได้ นี่คือสิ่งที่จะถูกเทียบกับฉบับยืนยัน */
  content: string;
  /** ฟิลด์ดิบที่ช่างบันทึกไว้ ให้หน้าจอแสดงเทียบข้าง ๆ ร่าง (Frame 2: "แสดงสิ่งที่ช่างเล่าไว้") */
  technicianReport: {
    symptoms: string;
    cause: string;
    repairAction: string;
    solutionSteps: string | null;
    technicianNote: string;
    partsUsed: string | null;
    downtimeMinutes: number | null;
  };
  /** ช่องที่ยังขาดในบันทึกของช่าง ใช้ชี้ให้ Engineer เติมตรงจุด */
  gaps: string[];
}

const DEFAULT_CATEGORY = "บทเรียนจากงานซ่อมจริง";

/**
 * สร้างร่างองค์ความรู้จากใบงานที่ปิดแล้ว
 *
 * ไม่บันทึกอะไรลงฐานข้อมูล — คืนร่างออกไปให้คนตรวจเท่านั้น (ข้อบังคับของ Frame 2)
 * โยน error เมื่อไม่พบใบงาน
 */
export async function buildKnowledgeDraft(workOrderId: string): Promise<{ draft: KnowledgeDraft; workOrder: WorkOrderRow }> {
  const { data, error } = await supabase.from("work_orders").select("*").eq("id", workOrderId).maybeSingle();
  if (error) throw new Error(`อ่านใบงานไม่สำเร็จ: ${error.message}`);
  if (!data) throw new Error("ไม่พบใบงานที่ระบุ");

  const wo = data as WorkOrderRow;

  const symptoms = text(wo.symptoms);
  const cause = text(wo.cause);
  const repairAction = text(wo.repair_action);
  const solutionSteps = bulletList(wo.solution_steps);
  const technicianNote = text(wo.technician_note);
  const partsUsed = bulletList(wo.parts_requested);

  // ชี้ช่องว่างให้ Engineer เติมตรงจุด — Frame 2 ของ storyboard ยกตัวอย่างสถานการณ์นี้
  // ไว้ตรง ๆ ("เห็นว่าขั้นตอนถูกแต่ตกเรื่อง backup พารามิเตอร์ก่อนเปลี่ยนบอร์ด")
  // คือ Engineer ต้องหาสิ่งที่ "ขาด" ให้เจอ ไม่ใช่แค่ตรวจสิ่งที่มี
  const gaps: string[] = [];
  if (cause === MISSING) gaps.push("ยังไม่มีสาเหตุที่แท้จริง (root cause)");
  if (repairAction === MISSING) gaps.push("ยังไม่มีวิธีแก้ไขที่ทำจริง");
  if (!solutionSteps) gaps.push("ยังไม่มีขั้นตอนการซ่อมแบบเรียงลำดับ");
  if (!partsUsed) gaps.push("ยังไม่ระบุอะไหล่ที่ใช้");
  gaps.push("ตรวจว่ามีขั้นตอนเตรียมการที่ต้องทำก่อนลงมือหรือไม่ (เช่น backup พารามิเตอร์ก่อนเปลี่ยนบอร์ด) ซึ่งมักไม่ถูกบันทึกไว้");

  const machineLabel = wo.machine_code ?? wo.machine_name_std ?? wo.machine_name_raw ?? "ไม่ระบุเครื่อง";

  const contentParts = [
    `## อาการที่พบ`,
    symptoms,
    ``,
    `## สาเหตุที่ตรวจพบ`,
    cause,
    ``,
    `## วิธีแก้ไขที่ทำจริง`,
    repairAction,
  ];

  if (solutionSteps) {
    contentParts.push(``, `## ขั้นตอนที่ช่างบันทึกไว้`, solutionSteps);
  }
  if (partsUsed) {
    contentParts.push(``, `## อะไหล่ที่ใช้`, partsUsed);
  }
  if (technicianNote !== MISSING) {
    contentParts.push(``, `## บันทึกเพิ่มเติมจากช่าง`, technicianNote);
  }
  contentParts.push(
    ``,
    `## ข้อมูลอ้างอิง`,
    `- เลขที่ใบงานต้นทาง: ${text(wo.code)}`,
    `- เครื่องจักร: ${machineLabel}`,
    `- ช่างผู้ดำเนินการ: ${text(wo.technician_name)}`,
    `- เวลาสูญเสียการผลิต: ${typeof wo.mtloss_min === "number" ? `${wo.mtloss_min} นาที` : MISSING}`
  );

  // tag จากค่าจริงเท่านั้น ไม่เดา tag เชิงความหมายขึ้นมาเอง
  const tags = [wo.machine_code, wo.repair_category, wo.machine_name_std]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);

  const draft: KnowledgeDraft = {
    title: `${machineLabel}: ${text(wo.title)}`,
    category: typeof wo.repair_category === "string" && wo.repair_category.trim() ? wo.repair_category.trim() : DEFAULT_CATEGORY,
    machineModel: wo.machine_variant ?? wo.machine_name_std ?? null,
    machineCode: wo.machine_code ?? null,
    tags: Array.from(new Set(tags)),
    summary:
      cause !== MISSING && repairAction !== MISSING
        ? `สาเหตุ: ${cause.slice(0, 160)} | แก้ไขโดย: ${repairAction.slice(0, 160)}`
        : "ยังสรุปไม่ได้จากบันทึกของช่าง — Engineer ต้องเติมสาเหตุและวิธีแก้ก่อนยืนยัน",
    content: contentParts.join("\n"),
    technicianReport: {
      symptoms,
      cause,
      repairAction,
      solutionSteps,
      technicianNote,
      partsUsed,
      downtimeMinutes: typeof wo.mtloss_min === "number" ? wo.mtloss_min : null,
    },
    gaps,
  };

  return { draft, workOrder: wo };
}

export interface ConfirmKnowledgeInput {
  workOrderId: string;
  title: string;
  category?: string | null;
  machineModel?: string | null;
  machineCode?: string | null;
  tags?: string[];
  summary?: string | null;
  /** ฉบับที่ Engineer ตรวจ/แก้แล้ว — นี่คือสิ่งที่เข้าคลัง */
  content: string;
  /** ร่างเดิมที่ระบบสร้าง เก็บไว้เทียบว่าคนแก้อะไรบ้าง */
  draftContent?: string | null;
  confirmedBy: string;
  confirmedByName?: string | null;
}

/**
 * บันทึกความรู้เข้าคลัง — เรียกได้จากเส้นทางที่มี "คนกดยืนยัน" เท่านั้น
 *
 * confirmedBy ถูกบังคับให้ไม่ว่างทั้งที่นี่และที่ระดับ schema (confirmed_by NOT NULL
 * ใน migration 0018) เป็นสองชั้น เพราะข้อบังคับ "ห้าม AI เขียนความรู้เข้าคลังเอง"
 * ต้องอยู่รอดแม้โค้ดชั้นนี้ถูกข้าม
 */
export async function confirmKnowledge(input: ConfirmKnowledgeInput): Promise<{ id: string }> {
  const title = input.title?.trim();
  const content = input.content?.trim();
  const confirmedBy = input.confirmedBy?.trim();

  if (!title) throw new Error("ต้องระบุหัวเรื่องความรู้");
  if (!content) throw new Error("ต้องระบุเนื้อหาความรู้");
  if (!confirmedBy) throw new Error("ต้องระบุผู้ยืนยัน — ความรู้เข้าคลังได้เฉพาะเมื่อมีคนยืนยัน");

  const row = {
    id: randomUUID(),
    title,
    category: input.category?.trim() || DEFAULT_CATEGORY,
    machine_model: input.machineModel?.trim() || null,
    machine_code: input.machineCode?.trim() || null,
    tags: input.tags ?? [],
    summary: input.summary?.trim() || null,
    content,
    source_work_order_id: input.workOrderId,
    source_work_order_code: null as string | null,
    draft_content: input.draftContent ?? null,
    confirmed_by: confirmedBy,
    confirmed_by_name: input.confirmedByName?.trim() || null,
  };

  // เก็บรหัสใบงานไว้ในแถวความรู้ด้วย เพื่อให้อ่านที่มาได้แม้ใบงานต้นทางถูกลบไปแล้ว
  const { data: woData } = await supabase.from("work_orders").select("code").eq("id", input.workOrderId).maybeSingle();
  row.source_work_order_code = (woData as { code?: string } | null)?.code ?? null;

  const { error } = await supabase.from("knowledge_articles").insert(row);
  if (error) {
    // unique index บน source_work_order_id (migration 0018) กันการกดยืนยันซ้ำ
    if (/duplicate key|unique/i.test(error.message)) {
      throw new Error("ใบงานนี้มีความรู้ที่ยืนยันแล้วในคลังอยู่ก่อนหน้า");
    }
    throw new Error(`บันทึกความรู้เข้าคลังไม่สำเร็จ: ${error.message}`);
  }

  return { id: row.id };
}
