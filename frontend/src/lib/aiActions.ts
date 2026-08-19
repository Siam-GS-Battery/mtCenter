import { Machine, WorkOrder } from "../types";
import { machineStatusLabel } from "./pillStyles";
import { isMissing } from "./format";

/** Token the backend appends to a reply when it suggests opening a work order. */
export const WORK_ORDER_ACTION_TOKEN = "[ACTION:CREATE_WORK_ORDER]";

export function hasWorkOrderAction(text: string): boolean {
  return text.includes(WORK_ORDER_ACTION_TOKEN);
}

export function stripWorkOrderAction(text: string): string {
  return text.split(WORK_ORDER_ACTION_TOKEN).join("").trim();
}

export interface WorkOrderPrefill {
  machineId: string;
  title: string;
  description: string;
  priority: WorkOrder["priority"];
}

/**
 * Build a work-order prefill from the machine's actual state and the
 * assistant reply that suggested it. No invented sensor values or parts.
 */
export function buildWorkOrderPrefill(
  machine: Machine,
  messageText: string
): WorkOrderPrefill {
  const issue = machine.activeErrorCode
    ? `${machine.activeErrorCode}${machine.activeErrorDesc ? ` (${machine.activeErrorDesc})` : ""}`
    : "อาการที่พบจากการสนทนา";

  return {
    machineId: machine.id,
    title: `ซ่อมบำรุง ${machine.code ?? "ไม่มีรหัสเครื่อง"}: ${issue}`,
    description: stripWorkOrderAction(messageText),
    priority:
      machine.status === "error" || machine.status === "warning"
        ? "high"
        : "medium",
  };
}

/**
 * Welcome message built from the machine object's real fields only. `machine`
 * is `null` when no machine is selected (a fleet-wide entry point) — the
 * assistant now also reads the whole fleet and repair history from the
 * database, not just the one machine on screen, so both cases get a greeting.
 */
export function buildWelcomeMessage(machine: Machine | null): string {
  if (!machine) {
    return `สวัสดีครับ ผมคือ MT Center AI ผู้ช่วยด้านงานซ่อมบำรุงเครื่องจักร

ผมดูข้อมูลเครื่องจักรทั้งหมดในระบบได้ ทั้งสถานะปัจจุบัน เครื่องที่ผิดปกติ ค่าตรวจวัด และประวัติการซ่อมของแต่ละเครื่อง

สอบถามภาพรวมเครื่องจักรทั้งหมด เครื่องที่ต้องซ่อมด่วน หรือประวัติการซ่อมย้อนหลังได้เลยครับ`;
  }

  const statusLine = machine.activeErrorCode
    ? `สถานะ: ${machineStatusLabel(machine.status)} — ${machine.activeErrorCode}${machine.activeErrorDesc ? `: ${machine.activeErrorDesc}` : ""}`
    : `สถานะ: ${machineStatusLabel(machine.status)}`;

  // Real machines have no telemetry on file (spindleTemp/vibrationMms are null
  // for all 973) — this text is fed to an AI model, so a missing reading is
  // stated as missing rather than asserted as "null°C", which the model could
  // otherwise repeat back as a real measurement.
  const readingsLine =
    isMissing(machine.spindleTemp) && isMissing(machine.vibrationMms)
      ? "ค่าตรวจวัด Spindle และแรงสั่นสะเทือน: ไม่มีข้อมูล"
      : `อุณหภูมิ Spindle ${isMissing(machine.spindleTemp) ? "ไม่มีข้อมูล" : `${machine.spindleTemp}°C`} · แรงสั่นสะเทือน ${isMissing(machine.vibrationMms) ? "ไม่มีข้อมูล" : `${machine.vibrationMms} mm/s`}`;

  return `สวัสดีครับ ผมคือ MT Center AI ผู้ช่วยด้านงานซ่อมบำรุงเครื่องจักร

เครื่องจักรปัจจุบัน: **${machine.code ?? "ไม่มีรหัสเครื่อง"} (${machine.name})**
${statusLine}
${readingsLine}

สอบถามขั้นตอนการแก้ไข รหัสข้อผิดพลาด ประวัติการซ่อม หรือถามถึงเครื่องจักรเครื่องอื่นในระบบได้เลยครับ`;
}

/**
 * Fleet-level preset questions — offered when no machine is selected, so a
 * technician can still ask something useful. Backed by the assistant's fleet
 * read access (all machines, abnormal status, repair history), not just the
 * one machine on screen.
 */
const FLEET_PRESET_QUESTIONS: string[] = [
  "ตอนนี้มีเครื่องจักรไหนผิดปกติบ้าง",
  "สรุปภาพรวมสถานะเครื่องจักรทั้งหมด",
  "เครื่องไหนต้องเข้าซ่อมด่วนที่สุด",
];

/** Uppercase, trimmed, spaces/dashes collapsed — so "gr-1141", " GR 1141 " etc. all match the same curated entry. */
export function normalizeMachineCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, "-");
}

/**
 * Curated, per-machine preset questions for the POC demo — exactly two machines
 * (GR-1141: escalating spindle-bearing failure story; ALL-000: healthy/preventive
 * story). Every other machine keeps the generic list in buildPresetQuestions().
 * The first item of each list is replaced at call time by buildMachinePresetQuestion()
 * so a live activeErrorCode is always reflected accurately.
 *
 * Every question here contains a keyword matched by INTENT_KEYWORDS in
 * backend/src/lib/mockAssistant.ts — check-intents.ts (npm run check:intents)
 * verifies this for GR-1141.
 */
const MACHINE_PRESET_QUESTIONS: Record<string, string[]> = {
  // Item [0] is always overwritten with buildMachinePresetQuestion(machine) — kept here
  // only so the array's length/order is easy to read; its text is never shown.
  "GR-1141": [
    "แนวทางแก้ไขรหัสข้อผิดพลาดของเครื่องนี้",
    "แนวโน้มอุณหภูมิ Spindle และค่าสั่นสะเทือนของเครื่อง GR-1141 ในช่วง 30 วันที่ผ่านมา เกินพิกัดที่กำหนดหรือไม่",
    "สาเหตุที่แท้จริงของปัญหาตลับลูกปืน Spindle ที่ทรุดตัวลงเรื่อยๆ จากประวัติการซ่อมที่ผ่านมาของเครื่อง GR-1141 คืออะไร",
    "ต้องเตรียมอะไหล่ Spindle Bearing, Oil Seal, Spindle Grease ชิ้นไหนบ้างสำหรับขั้นตอนการเปลี่ยนอะไหล่ครั้งนี้",
    "ขั้นตอนการเปลี่ยนอะไหล่ Spindle Bearing ของเครื่อง GR-1141 อย่างปลอดภัย",
    "ขั้นตอนความปลอดภัย Lockout-Tagout ก่อนเริ่มงานเปลี่ยนลูกปืน Spindle",
    "สรุปประวัติการซ่อมทั้ง 9 ใบงานที่ผ่านมาของเครื่อง GR-1141",
  ],
  "ALL-000": [
    "สรุปสถานะและค่าตรวจวัดล่าสุดของเครื่องนี้",
    "กำหนดซ่อมบำรุงเชิงป้องกันครั้งถัดไปของเครื่อง ALL-000 คือเมื่อไหร่ ขอเช็กลิสต์ PM Checklist ด้วย",
    "ค่าอุณหภูมิและแรงสั่นสะเทือนตอนนี้ของเครื่อง ALL-000 เกินพิกัดที่กำหนดหรือไม่",
    "สรุปประวัติการซ่อมบำรุงตามรอบ (Routine) ของเครื่อง ALL-000 ที่ผ่านมา",
    "ต้องเฝ้าระวังอะไรบ้างเพื่อไม่ให้เครื่อง ALL-000 กลายเป็นเครื่องผิดปกติเหมือน GR-1141",
    "รอบการหยอดน้ำมันหล่อลื่นและตรวจสอบ (Lubrication/Inspection Interval) ของเครื่อง ALL-000 อยู่ในเช็กลิสต์ PM Checklist อย่างไร",
  ],
};

/**
 * The one set of preset questions the assistant offers — the same list on the
 * full page and in the side drawer, so the assistant is one product wherever
 * a technician reaches it. With a machine selected, the first question is
 * derived from that machine's real state and the rest are standing
 * maintenance questions, including ones that exercise the assistant's live
 * telemetry and repair-history access. With no machine selected, the fleet-
 * level set above is offered instead.
 *
 * Exactly two machines (GR-1141, ALL-000) get a curated per-machine list for
 * the POC demo — see MACHINE_PRESET_QUESTIONS above. Every other machine keeps
 * this generic behavior unchanged.
 */
export function buildPresetQuestions(machine: Machine | null): string[] {
  if (!machine) return FLEET_PRESET_QUESTIONS;

  const curated = machine.code ? MACHINE_PRESET_QUESTIONS[normalizeMachineCode(machine.code)] : undefined;
  if (curated) {
    return [buildMachinePresetQuestion(machine), ...curated.slice(1)];
  }

  return [
    buildMachinePresetQuestion(machine),
    `ขั้นตอนการเปลี่ยนอะไหล่ของเครื่อง ${machine.code} อย่างปลอดภัย`,
    "ขอเช็กลิสต์การซ่อมบำรุงเชิงป้องกัน (PM Checklist)",
    "ขั้นตอนความปลอดภัย Lockout-Tagout ก่อนเริ่มงาน",
    "เครื่องนี้ตอนนี้ปกติหรือผิดปกติ เพราะอะไร",
    "ประวัติการซ่อมล่าสุดของเครื่องนี้เป็นอย่างไร",
    "ค่าอุณหภูมิและการสั่นสะเทือนตอนนี้เกินพิกัดไหม",
  ];
}

/** First preset question, derived from the machine's actual error state. */
export function buildMachinePresetQuestion(machine: Machine): string {
  const machineLabel = machine.code ?? "ไม่มีรหัสเครื่อง";
  if (machine.activeErrorCode) {
    return `แนวทางแก้ไข ${machine.activeErrorCode}${machine.activeErrorDesc ? ` (${machine.activeErrorDesc})` : ""} ของเครื่อง ${machineLabel}`;
  }
  return `สรุปสถานะและค่าตรวจวัดล่าสุดของเครื่อง ${machineLabel}`;
}

/**
 * Pictographs and dingbats an assistant reply may carry. The product draws its
 * icons with lucide-react at one stroke weight, so a glyph standing in for an
 * icon is stripped rather than rendered next to the real ones. Deliberately
 * excludes the punctuation and maths this copy actually uses (°, ·, —, ≤, ≥).
 */
const PICTOGRAPH_GLYPHS =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{FE0E}\u{20E3}]+[ \t]?/gu;

/**
 * Remove pictograph glyphs, taking the single space that followed each one so
 * no gap is left mid-sentence. Indentation is untouched, so nested markdown
 * lists and code blocks keep their structure.
 */
export function stripPictographs(text: string): string {
  return text.replace(PICTOGRAPH_GLYPHS, "").trim();
}

/**
 * Prepare an assistant reply for markdown rendering: strip the action token
 * and any pictograph glyphs, then turn single newlines into hard breaks so
 * line structure is preserved.
 */
export function formatChatMarkdown(text: string): string {
  return stripPictographs(stripWorkOrderAction(text)).replace(/\n(?!\n)/g, "  \n");
}
