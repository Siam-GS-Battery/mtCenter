// UX Storyboard Scenario C — Frame 1 ("เข้าวันถัดมา" / หน้าจอ: รายการใบงานรอรีวิว)
// และ Frame 2 ("รีวิวและเติมความรู้" / หน้าจอ: รีวิวใบงานซ่อม)
//
// Frame 1 ระบุไว้ว่า "— ไม่ใช้ AI — ดึงรายการจาก DB + จัดลำดับด้วย rule
// (เครื่องวิกฤต/เวลา downtime)" พร้อมเหตุผลว่า "เกณฑ์จัดลำดับความสำคัญต้องอธิบายได้
// กับผู้จัดการ ใช้ rule โปร่งใสกว่า AI ranking ที่อธิบายไม่ได้"
//
// ข้อนั้นกำหนดรูปของโค้ดนี้ตรง ๆ: ทุกใบงานที่ถูกจัดอันดับต้องคืน "คะแนน" พร้อม
// "รายการเหตุผลที่ทำให้ได้คะแนนนั้น" ออกไปด้วย ไม่ใช่แค่ลำดับ — ถ้าอธิบายไม่ได้ว่า
// ทำไมใบนี้มาก่อน ก็ถือว่าไม่ผ่านเกณฑ์ที่ storyboard ตั้งไว้

import { supabase } from "./supabase.js";
import { evaluateMachine } from "./thresholds.js";
import type { MachineRow, WorkOrderRow } from "./mappers.js";

/* ------------------------------------------------------------------ */
/* น้ำหนักการจัดลำดับ                                                  */
/* ------------------------------------------------------------------ */
//
// ค่าเหล่านี้ตั้งเป็นค่าคงที่ที่มีชื่อ ไม่ใช่ตัวเลขลอยในสูตร เพราะเหตุผลของ Frame 1 คือ
// "ต้องอธิบายได้กับผู้จัดการ" — ผู้จัดการต้องอ่านตารางนี้แล้วเข้าใจได้ว่าอะไรสำคัญกว่าอะไร
// และเถียง/ปรับได้โดยไม่ต้องอ่านโค้ด

/** เครื่องอยู่ในระดับวิกฤตตามเกณฑ์ (อุณหภูมิ/แรงสั่น/ดัชนีสุขภาพ) */
const W_MACHINE_CRITICAL = 100;
/** เครื่องอยู่ในระดับเฝ้าระวัง */
const W_MACHINE_WARNING = 40;
/** ใบงานถูกตั้งความสำคัญเป็น high/urgent ตอนเปิดงาน */
const W_PRIORITY_HIGH = 30;
/** คะแนนต่อเวลาสูญเสียการผลิต 1 ชั่วโมง (mtloss_min เป็นนาที) */
const W_PER_DOWNTIME_HOUR = 10;
/** เพดานคะแนนจาก downtime — กันใบงานเดียวที่ downtime ผิดปกติ (เช่นคีย์ผิดเป็นหลักหมื่นนาที)
 *  กวาดทุกใบอื่นตกอันดับไปหมด ซึ่งจะทำให้ลำดับอธิบายไม่ได้แทนที่จะช่วยให้ชัดขึ้น */
const CAP_DOWNTIME_SCORE = 80;
/** คะแนนต่อวันที่ใบงานค้างรอรีวิว — ของเก่าค้างนานต้องไม่จมหายไปใต้ของใหม่ตลอดไป */
const W_PER_DAY_WAITING = 3;
const CAP_WAITING_SCORE = 30;

/** สถานะใบงานที่ถือว่า "รอ Engineer รีวิว" (ดู types.ts ฝั่งหน้าจอ: pending | in_progress | review | completed) */
export const REVIEW_STATUS = "review" as const;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ReviewQueueItem {
  workOrderId: string;
  workOrderCode: string;
  title: string;
  machineId: string | null;
  machineCode: string | null;
  machineName: string | null;
  technicianName: string | null;
  priority: string | null;
  assignedDate: string | null;
  closedAt: string | null;
  downtimeMinutes: number | null;
  /** ระดับของเครื่องตามเกณฑ์ ณ ตอนนี้ — null ถ้าจับคู่เครื่องในระบบไม่ได้ */
  machineLevel: "normal" | "warning" | "critical" | null;
  /** จำนวนวันที่ใบงานนี้ค้างรอรีวิว */
  daysWaiting: number | null;
  rankScore: number;
  /** เหตุผลที่ได้คะแนนนี้ — Frame 1 บังคับว่าลำดับต้องอธิบายได้ */
  rankReasons: string[];
  /** true = ใบนี้ถูกรีวิวและมีความรู้เข้าคลังแล้ว (ไม่ควรค้างในคิว) */
  hasKnowledge: boolean;
}

/* ------------------------------------------------------------------ */
/* Ranking                                                             */
/* ------------------------------------------------------------------ */

function daysBetween(fromIso: string | null, now: number): number | null {
  if (!fromIso) return null;
  const t = Date.parse(fromIso);
  if (Number.isNaN(t)) return null;
  const days = Math.floor((now - t) / 86_400_000);
  return days < 0 ? 0 : days;
}

/**
 * ให้คะแนนความสำคัญของใบงานหนึ่งใบ พร้อมเหตุผลทุกข้อที่ทำให้ได้คะแนนนั้น
 * ไม่มีน้ำหนักลับหรือการปรับจูนที่ไม่ปรากฏใน rankReasons — ถ้ามีอะไรบวกคะแนน
 * มันต้องมีบรรทัดอธิบายคู่กันเสมอ
 */
function scoreItem(
  wo: WorkOrderRow,
  machine: MachineRow | undefined,
  now: number
): { score: number; reasons: string[]; machineLevel: ReviewQueueItem["machineLevel"]; daysWaiting: number | null } {
  const reasons: string[] = [];
  let score = 0;

  let machineLevel: ReviewQueueItem["machineLevel"] = null;
  if (machine) {
    const evaluation = evaluateMachine({
      status: machine.status ?? undefined,
      healthScore: machine.health_score ?? undefined,
      spindleTemp: machine.spindle_temp ?? undefined,
      vibrationMms: machine.vibration_mms ?? undefined,
      activeErrorCode: machine.active_error_code ?? undefined,
      activeErrorDesc: machine.active_error_desc ?? undefined,
    });
    machineLevel = evaluation.level;
    if (evaluation.level === "critical") {
      score += W_MACHINE_CRITICAL;
      reasons.push(`เครื่องอยู่ในระดับวิกฤตตามเกณฑ์ (+${W_MACHINE_CRITICAL})`);
    } else if (evaluation.level === "warning") {
      score += W_MACHINE_WARNING;
      reasons.push(`เครื่องอยู่ในระดับเฝ้าระวังตามเกณฑ์ (+${W_MACHINE_WARNING})`);
    }
  } else {
    // ไม่พบเครื่องในระบบ = ไม่รู้สภาพเครื่อง ไม่ใช่ "เครื่องปกติ" — บอกไว้ให้เห็น
    // ไม่บวกและไม่หักคะแนน เพราะการไม่มีข้อมูลไม่ใช่หลักฐานทั้งสองทาง
    reasons.push("จับคู่เครื่องจักรในระบบไม่ได้ จึงไม่ได้นำสภาพเครื่องมาคิดคะแนน");
  }

  const priority = (wo.priority ?? "").toLowerCase();
  if (priority === "high" || priority === "urgent" || priority === "critical") {
    score += W_PRIORITY_HIGH;
    reasons.push(`ใบงานถูกตั้งความสำคัญเป็น ${wo.priority} (+${W_PRIORITY_HIGH})`);
  }

  const downtime = typeof wo.mtloss_min === "number" ? wo.mtloss_min : null;
  if (downtime !== null && downtime > 0) {
    const raw = (downtime / 60) * W_PER_DOWNTIME_HOUR;
    const capped = Math.min(CAP_DOWNTIME_SCORE, Math.round(raw));
    score += capped;
    reasons.push(
      capped < Math.round(raw)
        ? `เวลาสูญเสียการผลิต ${downtime} นาที (+${capped} ถึงเพดาน ${CAP_DOWNTIME_SCORE})`
        : `เวลาสูญเสียการผลิต ${downtime} นาที (+${capped})`
    );
  }

  const daysWaiting = daysBetween(wo.updated_at ?? wo.assigned_date ?? null, now);
  if (daysWaiting !== null && daysWaiting > 0) {
    const capped = Math.min(CAP_WAITING_SCORE, daysWaiting * W_PER_DAY_WAITING);
    score += capped;
    reasons.push(`ค้างรอรีวิวมา ${daysWaiting} วัน (+${capped})`);
  }

  if (reasons.length === 0) reasons.push("ไม่มีปัจจัยใดเพิ่มความสำคัญ");
  return { score, reasons, machineLevel, daysWaiting };
}

/**
 * ดึงใบงานที่รอ Engineer รีวิว แล้วจัดลำดับด้วยกฎ
 *
 * โยน error เมื่ออ่านฐานข้อมูลไม่สำเร็จ — หน้าจอนี้ "คือ" รายการงานที่ต้องทำวันนี้
 * การคืนลิสต์ว่างเงียบ ๆ ตอนฐานข้อมูลล้ม จะทำให้ Engineer เข้าใจว่าไม่มีงานค้าง
 * ซึ่งอันตรายกว่าการเห็นข้อความแจ้งข้อผิดพลาด
 */
export async function getReviewQueue(): Promise<ReviewQueueItem[]> {
  const { data: woData, error: woError } = await supabase
    .from("work_orders")
    .select("*")
    .eq("status", REVIEW_STATUS)
    .order("updated_at", { ascending: true, nullsFirst: false });
  if (woError) throw new Error(`ดึงรายการใบงานรอรีวิวไม่สำเร็จ: ${woError.message}`);

  const workOrders = (woData ?? []) as WorkOrderRow[];
  if (workOrders.length === 0) return [];

  // ดึงเครื่องจักรที่เกี่ยวข้องรอบเดียว (ไม่ยิงต่อใบงาน) — จับคู่ด้วย id ก่อนเสมอ
  // แล้วค่อย fallback เป็น code เพราะ machines.code ซ้ำกันได้ในฐานข้อมูลนี้
  // (migration 0009 ถอด unique constraint ออก) การจับด้วย code จึงอาจได้ผิดเครื่อง
  const machineIds = Array.from(new Set(workOrders.map((wo) => wo.machine_id).filter((v): v is string => Boolean(v))));
  const machineCodes = Array.from(new Set(workOrders.map((wo) => wo.machine_code).filter((v): v is string => Boolean(v))));

  const machineById = new Map<string, MachineRow>();
  const machineByCode = new Map<string, MachineRow>();
  const columns =
    "id,code,name,status,health_score,spindle_temp,vibration_mms,active_error_code,active_error_desc" as const;

  if (machineIds.length > 0) {
    const { data, error } = await supabase.from("machines").select(columns).in("id", machineIds);
    if (error) throw new Error(`ดึงข้อมูลเครื่องจักรไม่สำเร็จ: ${error.message}`);
    for (const row of (data ?? []) as MachineRow[]) machineById.set(row.id, row);
  }
  if (machineCodes.length > 0) {
    const { data, error } = await supabase.from("machines").select(columns).in("code", machineCodes);
    if (error) throw new Error(`ดึงข้อมูลเครื่องจักรตามรหัสไม่สำเร็จ: ${error.message}`);
    for (const row of (data ?? []) as MachineRow[]) {
      // เก็บเฉพาะตัวแรกของแต่ละรหัส และจำไว้ว่านี่เป็นการจับคู่แบบไม่การันตี
      if (row.code && !machineByCode.has(row.code)) machineByCode.set(row.code, row);
    }
  }

  // ใบงานที่มีความรู้เข้าคลังแล้ว — ใช้ทำเครื่องหมายว่ารีวิวเสร็จแล้ว
  const woIds = workOrders.map((wo) => wo.id);
  const { data: kbData, error: kbError } = await supabase
    .from("knowledge_articles")
    .select("source_work_order_id")
    .in("source_work_order_id", woIds);
  if (kbError) throw new Error(`ตรวจสอบความรู้ที่ยืนยันแล้วไม่สำเร็จ: ${kbError.message}`);
  const reviewed = new Set(
    (kbData ?? []).map((r: { source_work_order_id: string | null }) => r.source_work_order_id).filter(Boolean)
  );

  const now = Date.now();
  const items: ReviewQueueItem[] = workOrders.map((wo) => {
    const machine =
      (wo.machine_id ? machineById.get(wo.machine_id) : undefined) ??
      (wo.machine_code ? machineByCode.get(wo.machine_code) : undefined);
    const { score, reasons, machineLevel, daysWaiting } = scoreItem(wo, machine, now);
    return {
      workOrderId: wo.id,
      workOrderCode: wo.code,
      title: wo.title,
      machineId: wo.machine_id ?? null,
      machineCode: wo.machine_code ?? machine?.code ?? null,
      machineName: machine?.name ?? wo.machine_name_std ?? wo.machine_name_raw ?? null,
      technicianName: wo.technician_name ?? null,
      priority: wo.priority ?? null,
      assignedDate: wo.assigned_date ?? null,
      closedAt: wo.updated_at ?? null,
      downtimeMinutes: typeof wo.mtloss_min === "number" ? wo.mtloss_min : null,
      machineLevel,
      daysWaiting,
      rankScore: score,
      rankReasons: reasons,
      hasKnowledge: reviewed.has(wo.id),
    };
  });

  // เรียงคะแนนมากไปน้อย แล้วใช้ code เป็นตัวตัดสินให้ลำดับคงที่ข้ามการเรียกซ้ำ
  // (ถ้าไม่ตัดสินให้แน่นอน รายการจะสลับตำแหน่งเองทุกครั้งที่ refresh ซึ่งผู้ใช้อ่านว่าเป็นบั๊ก)
  items.sort((a, b) => (b.rankScore - a.rankScore) || a.workOrderCode.localeCompare(b.workOrderCode));
  return items;
}
