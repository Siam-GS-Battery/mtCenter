// ผู้ช่วยแบบ rule-based (โหมด mock) — ตอบคำถามเรื่องสภาพเครื่องจักร "ปกติ/ไม่ปกติ"
// จากข้อมูลจริงในฐานข้อมูล โดยไม่เรียกโมเดลภาษาใด ๆ
//
// ทำไมโหมดนี้ไม่ใช่การลดคุณภาพ: UX Storyboard (Scenario C) กำหนดเองว่า Frame 1 คือ
// "ยังไม่ใช้ AI — query DB + rule (เกณฑ์/downtime)" แล้วค่อยเติม AI ranking ทีหลัง
// ไฟล์นี้คือ Frame 1 ตามสเปกนั้น และเพราะทุกคำตอบมาจากแถวจริงในตาราง machines /
// work_orders บวกเกณฑ์ใน thresholds.ts คำตอบจึงตรวจสอบย้อนกลับได้ทุกตัวเลข —
// ต่างจากคำตอบของโมเดลภาษาที่ต้องเชื่อว่ามันไม่แต่งเลขขึ้นมา
//
// ขอบเขตที่ตั้งใจจำกัด: เรื่องเครื่องจักรและงานซ่อมบำรุงเท่านั้น คำถามที่ตีความเจตนา
// ไม่ได้จะไม่ถูกเดาคำตอบ แต่จะบอกตรง ๆ ว่าตอบไม่ได้แล้วเสนอเมนูคำถามที่ตอบได้
// (ดู INTENT_MENU ด้านล่าง) — การเดาคำตอบใน POC คือการสร้างความเชื่อผิด ๆ ให้ผู้ใช้
//
// Frame 3 ของ storyboard (อ้างอิงคู่มือ/WI ประกอบคำตอบ) ใช้การค้นแบบ keyword เท่านั้น
// ผ่าน keyword_manual_chunks — จงใจไม่ใช้ embedding เพราะโควตา embedding ของ Gemini
// free tier จำกัดที่ 1,000 ชิ้น/วัน การ demo จึงต้องไม่ผูกกับโควตานั้น

import { supabase } from "./supabase.js";
import { evaluateMachine, thresholdSummaryText, SPINDLE_TEMP, VIBRATION, HEALTH } from "./thresholds.js";
import { WORK_ORDER_ACTION_TOKEN } from "./aiActionTokens.js";
import type { MachineRow, WorkOrderRow } from "./mappers.js";

/* ------------------------------------------------------------------ */
/* Intents                                                             */
/* ------------------------------------------------------------------ */

export const INTENTS = [
  "machine_status",
  "sensor_readings",
  "error_code",
  "repair_history",
  "abnormal_fleet",
  "fleet_overview",
  "urgent_repair",
  "pm_checklist",
  "safety_loto",
  "part_replacement",
  "unknown",
] as const;

export type Intent = (typeof INTENTS)[number];

// คำสำคัญของแต่ละเจตนา เรียงจาก "เจาะจงที่สุด" ไป "กว้างที่สุด" เพราะการให้คะแนนด้าน
// ล่างจะบวกน้ำหนักตามความยาวคำที่ตรง คำที่เจาะจงกว่าจึงชนะคำกว้างเองโดยไม่ต้องจัดลำดับ
// ด้วยมือ (เช่น "เกินพิกัด" ควรชนะ "เครื่อง")
//
// ข้อผูกมัดที่ต้องรักษา: ทุกคำถามใน buildPresetQuestions() ของ
// frontend/src/lib/aiActions.ts ต้องถูก detectIntent() จับได้ (ไม่คืน "unknown")
// ไม่งั้นผู้ใช้กดปุ่มคำถามสำเร็จรูปแล้วได้เมนู "ตอบไม่ได้" กลับมา ซึ่งพังที่สุดในสายตาคนดู
// เพิ่ม preset ใหม่ = ต้องเพิ่มคำสำคัญที่นี่ด้วย ตรวจได้ด้วย `npm run check:intents`
const INTENT_KEYWORDS: Record<Exclude<Intent, "unknown">, string[]> = {
  sensor_readings: [
    "เกินพิกัด",
    "อุณหภูมิและการสั่น",
    "ค่าตรวจวัด",
    "ค่าอุณหภูมิ",
    "สั่นสะเทือน",
    "vibration",
    "spindle",
    "อุณหภูมิ",
    "ความร้อน",
    "ร้อนเกิน",
    "ร้อนไป",
    "telemetry",
  ],
  error_code: ["แนวทางแก้ไข", "error code", "รหัสข้อผิดพลาด", "alarm", "error", "รหัส error", "แก้ไขรหัส"],
  repair_history: [
    "ประวัติการซ่อมล่าสุด",
    "ประวัติการซ่อม",
    "ประวัติซ่อม",
    "ซ่อมล่าสุด",
    "ใบงานล่าสุด",
    "ประวัติ",
    "เคยซ่อม",
  ],
  urgent_repair: ["ซ่อมด่วนที่สุด", "ซ่อมด่วน", "ด่วนที่สุด", "เร่งด่วน", "ควรซ่อมก่อน", "ลำดับความสำคัญ"],
  abnormal_fleet: ["เครื่องจักรไหนผิดปกติ", "เครื่องไหนผิดปกติ", "เครื่องไหนเสีย", "มีเครื่องไหน", "รายการเครื่องผิดปกติ"],
  fleet_overview: [
    "ภาพรวมสถานะเครื่องจักร",
    "ภาพรวมเครื่องจักร",
    "ภาพรวมสถานะ",
    "ภาพรวม",
    "สรุปสถานะทั้งหมด",
    "ทั้งโรงงาน",
    "ทั้งหมดกี่เครื่อง",
  ],
  pm_checklist: ["เช็กลิสต์", "เช็คลิสต์", "checklist", "ซ่อมบำรุงเชิงป้องกัน", "preventive", "pm"],
  safety_loto: ["lockout", "tagout", "loto", "ความปลอดภัย", "ก่อนเริ่มงาน", "ppe"],
  part_replacement: ["เปลี่ยนอะไหล่", "ถอดอะไหล่", "อะไหล่", "spare part", "ขั้นตอนการเปลี่ยน"],
  // ข้อควรระวังของการให้คะแนนด้วยความยาว: ความยาวเป็นเพียง "ตัวแทน" ของความเจาะจง
  // วลีที่ยาวแต่กว้าง (เช่น "เครื่องนี้เป็นอย่างไร") จะได้คะแนนสูงเกินความเจาะจงจริง แล้วไป
  // ชนะวลีที่เจาะจงกว่าของเจตนาอื่น ("ประวัติการซ่อมล่าสุด") ในประโยคที่มีทั้งสองวลี
  // จึงต้องเขียนวลีกว้างให้อยู่ในรูปที่สั้นที่สุดเท่าที่ยังสื่อความ แล้วย้ายไปไว้ใน
  // WEAK_KEYWORDS ด้านล่าง ซึ่งนับเฉพาะเมื่อคำถามอยู่ในโดเมนนี้จริง
  machine_status: ["ปกติหรือผิดปกติ", "สถานะและค่าตรวจวัด", "สถานะเครื่อง", "สรุปสถานะ", "สถานะ", "ผิดปกติ"],
};

// คำสำคัญ "อ่อน": วลีที่กว้างพอจะโผล่ในคำถามนอกโดเมนได้ ("วันนี้อากาศเป็นอย่างไร")
// จะถูกนับเป็นคะแนนเฉพาะเมื่อคำถามมีคำที่บอกว่าอยู่ในโดเมนงานซ่อมบำรุงจริงด้วย
// (ดู DOMAIN_MARKERS) — ถ้าไม่มี ให้ตกเป็น "unknown" แล้วเสนอเมนู ดีกว่าตอบเรื่อง
// เครื่องจักรให้คนที่ถามเรื่องอากาศ
const WEAK_KEYWORDS: Partial<Record<Exclude<Intent, "unknown">, string[]>> = {
  machine_status: ["เป็นอย่างไร"],
};

// คำที่ยืนยันว่าคำถามอยู่ในโดเมนเครื่องจักร/งานซ่อมบำรุง ใช้เป็นประตูให้ WEAK_KEYWORDS
const DOMAIN_MARKERS = [
  "เครื่อง",
  "machine",
  "spindle",
  "ซ่อม",
  "บำรุง",
  "อะไหล่",
  "เซนเซอร์",
  "ใบงาน",
  "โรงงาน",
  "สายการผลิต",
];

// เจตนาที่เป็นคำถาม "ระดับทั้งฟลีต" (ไม่ใช่รายเครื่อง)
const FLEET_INTENTS: Intent[] = ["abnormal_fleet", "fleet_overview", "urgent_repair"];

// คำที่บ่งชี้ "ขอบเขตของคำถาม" ว่าเป็นทั้งฟลีต ไม่ใช่เครื่องเดียว
//
// ทำไมต้องมีแยกจากการนับความยาวคำ: คำถาม "สรุปภาพรวมสถานะเครื่องจักรทั้งหมด" มีทั้ง
// วลีของ fleet_overview ("ภาพรวม") และของ machine_status ("สถานะเครื่อง") อยู่ในประโยค
// เดียวกัน การนับความยาวล้วน ๆ ตัดสินผิดได้ง่ายเพราะขึ้นกับว่าวลีไหนบังเอิญยาวกว่า
// แต่คำว่า "ภาพรวม"/"ทั้งหมด" เป็นตัวกำหนด "ขอบเขต" ซึ่งควรมีน้ำหนักมากกว่าความยาว
// ค่าโบนัสตั้งไว้สูงพอจะพลิกผลได้ แต่ไม่สูงจนคำถามรายเครื่องที่มีคำว่า "ทั้งหมด"
// ติดมาโดยไม่ตั้งใจกลายเป็นคำถามระดับฟลีตทันทีถ้าวลีรายเครื่องเจาะจงกว่ามาก
const FLEET_SCOPE_MARKERS = ["ภาพรวม", "ทั้งหมด", "ทั้งโรงงาน", "เครื่องไหน", "เครื่องจักรไหน", "มีเครื่อง"];
const FLEET_SCOPE_BONUS = 10;

/**
 * ตีความเจตนาของคำถามจากคำสำคัญ
 *
 * ให้คะแนนด้วย "ความยาวของคำที่ตรง" ไม่ใช่จำนวนคำที่ตรง เพื่อให้วลีเจาะจงยาว ๆ
 * ("ค่าอุณหภูมิและการสั่นสะเทือนตอนนี้เกินพิกัดไหม") ชนะคำกว้างคำเดียว ("สถานะ")
 * ที่บังเอิญโผล่อยู่ในประโยคเดียวกัน แล้วบวกโบนัสให้เจตนาระดับฟลีตเมื่อคำถามมีคำบ่งชี้
 * ขอบเขต (ดู FLEET_SCOPE_MARKERS)
 *
 * คืน "unknown" เมื่อไม่มีคำสำคัญใดตรงเลย — ผู้เรียกต้องเสนอเมนูแทนการเดาคำตอบ
 */
export function detectIntent(prompt: string): Intent {
  if (typeof prompt !== "string") return "unknown";
  const p = prompt.toLowerCase();
  if (p.trim().length === 0) return "unknown";

  const isFleetScoped = FLEET_SCOPE_MARKERS.some((marker) => p.includes(marker));
  const inDomain = DOMAIN_MARKERS.some((marker) => p.includes(marker));

  let best: Intent = "unknown";
  let bestScore = 0;
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Exclude<Intent, "unknown">, string[]][]) {
    let score = 0;
    for (const keyword of keywords) {
      if (p.includes(keyword.toLowerCase())) {
        score = Math.max(score, keyword.length);
      }
    }
    // คำสำคัญอ่อนนับเฉพาะเมื่อคำถามอยู่ในโดเมนนี้จริง (ดู WEAK_KEYWORDS)
    if (inDomain) {
      for (const keyword of WEAK_KEYWORDS[intent] ?? []) {
        if (p.includes(keyword.toLowerCase())) {
          score = Math.max(score, keyword.length);
        }
      }
    }
    // โบนัสให้เฉพาะเจตนาที่ "ตรงคำสำคัญอยู่แล้ว" เท่านั้น (score > 0) — ไม่ใช่ยกระดับ
    // เจตนาที่ไม่ตรงอะไรเลยให้ชนะเพราะคำถามมีคำว่า "ทั้งหมด" อยู่คำเดียว
    if (score > 0 && isFleetScoped && FLEET_INTENTS.includes(intent)) {
      score += FLEET_SCOPE_BONUS;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Rendering helpers                                                   */
/* ------------------------------------------------------------------ */

const LEVEL_LABEL: Record<string, string> = {
  normal: "ปกติ",
  warning: "เฝ้าระวัง",
  critical: "วิกฤต",
};

const STATUS_LABEL: Record<string, string> = {
  normal: "ปกติ",
  warning: "เตือน",
  error: "ผิดปกติ/เสีย",
  maintenance: "อยู่ระหว่างซ่อมบำรุง",
};

/** ค่าที่ไม่มีข้อมูลต้องแสดงว่า "ไม่มีข้อมูล" ไม่ใช่ 0 หรือ "-" ซึ่งอ่านเหมือนค่าที่วัดได้จริง */
function val(value: unknown, unit = ""): string {
  if (value === null || value === undefined || value === "") return "ไม่มีข้อมูล";
  return `${value}${unit}`;
}

function machineLabel(row: MachineRow): string {
  return `${row.code ?? "ไม่มีรหัสเครื่อง"}${row.name ? ` (${row.name})` : ""}`;
}

function evaluateRow(row: MachineRow) {
  return evaluateMachine({
    status: row.status ?? undefined,
    healthScore: row.health_score ?? undefined,
    spindleTemp: row.spindle_temp ?? undefined,
    vibrationMms: row.vibration_mms ?? undefined,
    activeErrorCode: row.active_error_code ?? undefined,
    activeErrorDesc: row.active_error_desc ?? undefined,
  });
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */

const FLEET_COLUMNS =
  "id,code,name,model,location,status,health_score,spindle_temp,vibration_mms,active_error_code,active_error_desc,last_maintenance,next_maintenance,operating_hours" as const;

// จำนวนแถวสูงสุดที่แสดงในคำตอบเดียว — คำตอบในแชตที่ยาวเป็นร้อยบรรทัดไม่มีใครอ่าน
// และคลังนี้มีเครื่องผิดปกติหลักร้อยเครื่อง จำนวนจริงถูกบอกไว้ในบรรทัดสรุปเสมอ
const MAX_LIST_ROWS = 8;
const MAX_HISTORY_ROWS = 5;

async function fetchMachineById(machineId: string): Promise<MachineRow | null> {
  const { data, error } = await supabase.from("machines").select(FLEET_COLUMNS).eq("id", machineId).maybeSingle();
  if (error) throw error;
  return (data as MachineRow | null) ?? null;
}

async function fetchFleet(): Promise<MachineRow[]> {
  const { data, error } = await supabase.from("machines").select(FLEET_COLUMNS);
  if (error) throw error;
  return (data ?? []) as MachineRow[];
}

async function fetchWorkOrders(machineCode: string): Promise<WorkOrderRow[]> {
  const { data, error } = await supabase
    .from("work_orders")
    .select("*")
    .eq("machine_code", machineCode)
    .order("assigned_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(MAX_HISTORY_ROWS);
  if (error) throw error;
  return (data ?? []) as WorkOrderRow[];
}

/* ------------------------------------------------------------------ */
/* Manual citations (Frame 3)                                          */
/* ------------------------------------------------------------------ */

export interface ManualCitation {
  manualTitle: string;
  pageLabel: string | null;
  excerpt: string;
}

const MAX_CITATIONS = 2;
const MAX_CITATION_CHARS = 320;

/**
 * ค้นคู่มืออ้างอิงประกอบคำตอบด้วย keyword เท่านั้น (ไม่ใช้ embedding — ดูหมายเหตุหัวไฟล์)
 *
 * สำคัญ: `terms` ต้องเป็น "รหัสเฉพาะ" เท่านั้น (รหัส alarm/error/พารามิเตอร์) ห้ามส่งคำ
 * ทั่วไปอย่าง "vibration" / "temperature" / "maintenance" เข้ามาเด็ดขาด
 *
 * เหตุผล (เคยเกิดจริงและถูกแก้): คลังคู่มือที่ index แล้วมีแค่คู่มือ laser marker /
 * servo amplifier / robot ส่วนเครื่องจักรจำนวนมากในระบบเป็นเครื่องเจียร-เครื่องประกอบ
 * การค้นด้วยคำทั่วไปจึงเจอข้อความจากคู่มือของอุปกรณ์คนละชนิดเสมอ แล้วถูกแสดงเป็น
 * "อ้างอิงจากคู่มือ" ต่อท้ายคำตอบ — ผู้ใช้เห็นเป็นหลักฐานที่น่าเชื่อถือทั้งที่ไม่เกี่ยวกัน
 * การไม่มีคู่มืออ้างอิงเลยซื่อสัตย์กว่าการอ้างอิงผิดเล่ม
 *
 * ไม่ throw: คู่มือเป็นของเสริมประกอบคำตอบ ถ้าค้นไม่ได้ก็ตอบจากข้อมูลเครื่องจักรไปตามปกติ
 */
async function findManualCitations(terms: string[]): Promise<ManualCitation[]> {
  const cleaned = terms.map((t) => t.trim()).filter((t) => t.length >= 3);
  if (cleaned.length === 0) return [];

  const citations: ManualCitation[] = [];
  const seen = new Set<string>();
  for (const term of cleaned.slice(0, 3)) {
    if (citations.length >= MAX_CITATIONS) break;
    try {
      const { data, error } = await supabase.rpc("keyword_manual_chunks", {
        search_term: term,
        match_count: MAX_CITATIONS,
        filter_machine_models: null,
      });
      if (error) throw new Error(error.message);
      for (const row of (data ?? []) as { manual_title: string; page_label: string | null; content: string }[]) {
        const key = `${row.manual_title}|${row.page_label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        citations.push({
          manualTitle: row.manual_title,
          pageLabel: row.page_label,
          excerpt: row.content.replace(/\s+/g, " ").trim().slice(0, MAX_CITATION_CHARS),
        });
        if (citations.length >= MAX_CITATIONS) break;
      }
    } catch (err) {
      console.error(`findManualCitations("${term}") failed:`, err);
    }
  }
  return citations;
}

function renderCitations(citations: ManualCitation[], matchedCode: string): string {
  if (citations.length === 0) return "";
  const lines = [`**คู่มือในระบบที่พบรหัส "${matchedCode}"**`];
  for (const c of citations) {
    lines.push(`- ${c.manualTitle}${c.pageLabel ? ` — ${c.pageLabel}` : ""}\n  "${c.excerpt}…"`);
  }
  // ข้อความกำกับนี้จำเป็น ไม่ใช่ส่วนเกิน: การค้นทำด้วยรหัสตรงตัวโดยไม่กรองรุ่นเครื่อง
  // คู่มือที่เจอจึงอาจเป็นของอุปกรณ์ประกอบ (อินเวอร์เตอร์/เซอร์โว/เลเซอร์มาร์ค) ที่ติดตั้ง
  // อยู่ในเครื่อง ไม่ใช่คู่มือของตัวเครื่องเอง ผู้ใช้ต้องรู้ข้อนี้ก่อนนำไปใช้
  lines.push(
    "",
    "_พบจากการค้นรหัสตรงตัวในคลังคู่มือ อาจเป็นคู่มือของอุปกรณ์ประกอบในเครื่อง ไม่ใช่คู่มือของตัวเครื่องโดยตรง — ตรวจสอบรุ่นให้ตรงก่อนใช้งาน_"
  );
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Answer builders — one per intent                                    */
/* ------------------------------------------------------------------ */

function renderMachineStatus(row: MachineRow): string {
  const evaluation = evaluateRow(row);
  const lines = [
    `**สถานะเครื่อง ${machineLabel(row)}**`,
    "",
    `- ผลประเมินตามเกณฑ์: **${LEVEL_LABEL[evaluation.level] ?? evaluation.level}**`,
    `- สถานะในระบบ: ${STATUS_LABEL[row.status ?? ""] ?? val(row.status)}`,
    `- ตำแหน่งติดตั้ง: ${val(row.location)}`,
    `- รุ่น: ${val(row.model)} · ชั่วโมงใช้งาน: ${val(row.operating_hours)}`,
    "",
    "**เหตุผลของผลประเมิน**",
    ...evaluation.reasons.map((r) => `- ${r}`),
  ];

  if (row.active_error_code) {
    lines.push(
      "",
      `**รหัสข้อผิดพลาดที่ค้างอยู่:** ${row.active_error_code}${row.active_error_desc ? ` — ${row.active_error_desc}` : ""}`
    );
  }
  return lines.join("\n");
}

function renderSensorReadings(row: MachineRow): string {
  const evaluation = evaluateRow(row);
  const lines = [
    `**ค่าตรวจวัดล่าสุดของเครื่อง ${machineLabel(row)}**`,
    "",
    `- อุณหภูมิ Spindle: ${val(row.spindle_temp, "°C")} (เฝ้าระวัง ≥ ${SPINDLE_TEMP.warning}°C, วิกฤต ≥ ${SPINDLE_TEMP.critical}°C)`,
    `- แรงสั่นสะเทือน: ${val(row.vibration_mms, " mm/s")} (เฝ้าระวัง ≥ ${VIBRATION.warning} mm/s, วิกฤต ≥ ${VIBRATION.critical} mm/s)`,
    `- ดัชนีสุขภาพเครื่อง: ${val(row.health_score, "%")} (เฝ้าระวัง < ${HEALTH.warning}%, วิกฤต < ${HEALTH.critical}%)`,
    "",
    `**สรุป: ${LEVEL_LABEL[evaluation.level] ?? evaluation.level}**`,
    ...evaluation.reasons.map((r) => `- ${r}`),
  ];
  return lines.join("\n");
}

function renderErrorCode(row: MachineRow): string {
  if (!row.active_error_code) {
    return [
      `**เครื่อง ${machineLabel(row)} ไม่มีรหัสข้อผิดพลาดค้างอยู่ในระบบ**`,
      "",
      "ถ้าพบอาการผิดปกติหน้างานที่ระบบยังไม่บันทึก แจ้งอาการมาได้ หรือเปิดใบงานเพื่อให้ช่างเข้าตรวจสอบ",
    ].join("\n");
  }

  const evaluation = evaluateRow(row);
  return [
    `**รหัสข้อผิดพลาดของเครื่อง ${machineLabel(row)}**`,
    "",
    `- รหัส: **${row.active_error_code}**`,
    `- คำอธิบายในระบบ: ${val(row.active_error_desc)}`,
    `- ผลประเมินรวมของเครื่อง: ${LEVEL_LABEL[evaluation.level] ?? evaluation.level}`,
    "",
    "**ขั้นตอนที่แนะนำ**",
    "1. หยุดเครื่องและทำ Lockout-Tagout (LOTO) ก่อนเข้าตรวจสอบทุกครั้ง",
    // ไม่อ้างถึง "ส่วนอ้างอิงคู่มือด้านล่าง" เพราะบล็อกนั้นมีเฉพาะเมื่อค้นรหัสในคลังคู่มือเจอ
    // การชี้ไปยังสิ่งที่มักไม่มีอยู่ทำให้ผู้ใช้เข้าใจว่าคำตอบแสดงไม่ครบ
    "2. เปิดคู่มือของเครื่อง/อุปกรณ์ประกอบเพื่อดูรายละเอียดรหัสนี้ (เมนูคลังคู่มือ)",
    "3. บันทึกอาการที่พบและเปิดใบงานซ่อมเพื่อให้มีประวัติสำหรับคำนวณ MTTR",
  ].join("\n");
}

function renderRepairHistory(row: MachineRow, workOrders: WorkOrderRow[]): string {
  if (workOrders.length === 0) {
    return `**ยังไม่มีประวัติใบงานซ่อมของเครื่อง ${machineLabel(row)} ในระบบ**\n\nเมื่อมีการเปิดใบงานและปิดงาน ประวัติจะปรากฏที่นี่และนำไปคำนวณดัชนีสุขภาพเครื่องได้`;
  }

  const lines = [`**ประวัติใบงานซ่อมล่าสุดของเครื่อง ${machineLabel(row)}** (${workOrders.length} รายการ)`, ""];
  for (const wo of workOrders) {
    lines.push(
      `- **${val(wo.code)}** — ${val(wo.title)}`,
      `  สถานะ: ${val(wo.status)} · ความสำคัญ: ${val(wo.priority)} · เวลาสูญเสียการผลิต: ${val(wo.mtloss_min, " นาที")}`,
      `  อาการ: ${val(wo.symptoms)}`,
      `  สาเหตุ: ${val(wo.cause)} · การซ่อม: ${val(wo.repair_action)}`
    );
  }
  return lines.join("\n");
}

interface RankedMachine {
  row: MachineRow;
  level: string;
  reasons: string[];
}

// เรียงลำดับความรุนแรง: วิกฤตก่อนเฝ้าระวัง แล้วเรียงตามดัชนีสุขภาพจากต่ำไปสูง
// (สุขภาพต่ำ = ใกล้เสียกว่า) เครื่องที่ไม่มีค่าสุขภาพถูกจัดไว้ท้ายกลุ่มของตัวเอง
// เพราะ "ไม่รู้" ไม่ใช่หลักฐานว่าแย่ — จะดันขึ้นมาก่อนเครื่องที่วัดได้ว่าแย่จริงไม่ได้
function rankBySeverity(rows: MachineRow[]): RankedMachine[] {
  const ranked = rows
    .map((row) => {
      const evaluation = evaluateRow(row);
      return { row, level: evaluation.level, reasons: evaluation.reasons };
    })
    .filter(({ row, level }) => level !== "normal" || row.status === "warning" || row.status === "error");

  const levelWeight = (level: string): number => (level === "critical" ? 0 : level === "warning" ? 1 : 2);
  ranked.sort((a, b) => {
    const byLevel = levelWeight(a.level) - levelWeight(b.level);
    if (byLevel !== 0) return byLevel;
    const aHealth = a.row.health_score ?? Number.POSITIVE_INFINITY;
    const bHealth = b.row.health_score ?? Number.POSITIVE_INFINITY;
    return aHealth - bHealth;
  });
  return ranked;
}

function renderAbnormalFleet(rows: MachineRow[], urgentOnly: boolean): string {
  const ranked = rankBySeverity(rows);
  if (ranked.length === 0) {
    return "**ขณะนี้ไม่มีเครื่องจักรที่ผิดปกติ**\n\nทุกเครื่องที่มีข้อมูลอยู่ในเกณฑ์ปกติทั้งหมด";
  }

  const shown = ranked.slice(0, urgentOnly ? 3 : MAX_LIST_ROWS);
  const heading = urgentOnly
    ? `**เครื่องที่ควรเข้าซ่อมก่อนที่สุด ${shown.length} อันดับ**`
    : `**เครื่องจักรที่ผิดปกติ (แสดง ${shown.length} จากทั้งหมด ${ranked.length} เครื่อง)**`;

  const lines = [heading, "", "เรียงตามความรุนแรง: วิกฤตก่อนเฝ้าระวัง แล้วเรียงตามดัชนีสุขภาพจากต่ำไปสูง", ""];
  for (const [i, { row, level, reasons } ] of shown.entries()) {
    lines.push(
      `${i + 1}. **${machineLabel(row)}** — ${LEVEL_LABEL[level] ?? level}`,
      `   ตำแหน่ง: ${val(row.location)} · Health: ${val(row.health_score, "%")} · Spindle: ${val(row.spindle_temp, "°C")} · Vibration: ${val(row.vibration_mms, " mm/s")}`,
      `   เหตุผล: ${reasons.join("; ")}`
    );
  }
  if (!urgentOnly && ranked.length > shown.length) {
    lines.push("", `_ยังมีอีก ${ranked.length - shown.length} เครื่องที่ผิดปกติ ดูทั้งหมดได้ในหน้ารายการเครื่องจักร_`);
  }
  return lines.join("\n");
}

function renderFleetOverview(rows: MachineRow[]): string {
  const byStatus: Record<string, number> = { normal: 0, warning: 0, error: 0, maintenance: 0 };
  let other = 0;
  for (const row of rows) {
    if (row.status && row.status in byStatus) byStatus[row.status] += 1;
    else other += 1;
  }

  const byLevel = { normal: 0, warning: 0, critical: 0 };
  for (const row of rows) byLevel[evaluateRow(row).level] += 1;

  const lines = [
    "**ภาพรวมเครื่องจักรทั้งโรงงาน**",
    "",
    `- จำนวนเครื่องจักรทั้งหมด: **${rows.length}** เครื่อง`,
    "",
    "**แยกตามสถานะในระบบ**",
    `- ปกติ: ${byStatus.normal}`,
    `- เตือน: ${byStatus.warning}`,
    `- ผิดปกติ/เสีย: ${byStatus.error}`,
    `- อยู่ระหว่างซ่อมบำรุง: ${byStatus.maintenance}`,
  ];
  if (other > 0) lines.push(`- อื่นๆ/ไม่ระบุสถานะ: ${other}`);

  lines.push(
    "",
    "**แยกตามผลประเมินเกณฑ์ (อุณหภูมิ/แรงสั่น/ดัชนีสุขภาพ)**",
    `- ปกติ: ${byLevel.normal}`,
    `- เฝ้าระวัง: ${byLevel.warning}`,
    `- วิกฤต: ${byLevel.critical}`
  );
  return lines.join("\n");
}

function renderPmChecklist(row: MachineRow | null): string {
  const header = row
    ? `**เช็กลิสต์ซ่อมบำรุงเชิงป้องกัน (PM) — เครื่อง ${machineLabel(row)}**`
    : "**เช็กลิสต์ซ่อมบำรุงเชิงป้องกัน (PM)**";

  const lines = [
    header,
    "",
    "**รายวัน**",
    "- ตรวจระดับน้ำมันหล่อลื่นและแรงดันลม",
    "- ทำความสะอาดเศษโลหะและถังกรองน้ำหล่อเย็น",
    "- ฟังเสียงผิดปกติขณะเดินเครื่องเปล่า",
    "",
    "**รายสัปดาห์**",
    "- ตรวจความตึงสายพานและแรงขันน็อตยึด",
    "- ตรวจจุดรั่วซึมตามข้อต่อระบบไฮดรอลิก/ลม",
    "",
    "**รายเดือน**",
    "- เปลี่ยนไส้กรองตามรอบที่กำหนด",
    "- อัดจารบีจุดหมุนและตรวจความแม่นยำแกนเคลื่อนที่",
  ];

  if (row) {
    lines.push(
      "",
      "**ข้อมูลรอบบำรุงรักษาของเครื่องนี้จากระบบ**",
      `- บำรุงรักษาครั้งล่าสุด: ${val(row.last_maintenance)}`,
      `- กำหนดครั้งถัดไป: ${val(row.next_maintenance)}`
    );
  }
  lines.push(
    "",
    "_เช็กลิสต์นี้เป็นแนวทางกลางของระบบ ไม่ใช่เนื้อหาจากคู่มือของเครื่องรุ่นนี้โดยเฉพาะ — ตรวจสอบกับคู่มือเครื่องก่อนใช้งานจริง_"
  );
  return lines.join("\n");
}

function renderSafetyLoto(): string {
  return [
    "**ขั้นตอนความปลอดภัย Lockout-Tagout (LOTO) ก่อนเริ่มงาน**",
    "",
    "1. แจ้งหัวหน้างานและผู้ควบคุมเครื่องก่อนหยุดเครื่อง",
    "2. หยุดเครื่องตามขั้นตอนปกติ (ไม่ใช้ Emergency Stop เว้นกรณีฉุกเฉิน)",
    "3. ตัดแหล่งพลังงานทุกทาง: ไฟฟ้าเมน ลมอัด ไฮดรอลิก และพลังงานสะสม",
    "4. ใส่กุญแจล็อก (Lockout) และป้ายแจ้ง (Tagout) ที่สวิตช์ตัดตอน โดยผู้ปฏิบัติงานถือกุญแจเอง",
    "5. ระบายแรงดันค้างในระบบและรอให้ชิ้นส่วนที่ยังหมุนหยุดสนิท",
    "6. ทดสอบยืนยันว่าไฟดับจริงด้วยเครื่องมือวัด ก่อนสัมผัสชิ้นส่วนใด ๆ",
    "7. สวม PPE ให้ครบตามลักษณะงาน",
    "",
    "**ห้ามให้ผู้อื่นถอดกุญแจล็อกของคนอื่นเด็ดขาด** — ผู้ที่ใส่ล็อกเท่านั้นที่ถอดได้",
  ].join("\n");
}

function renderPartReplacement(row: MachineRow | null): string {
  const lines = [
    row ? `**ขั้นตอนการเปลี่ยนอะไหล่อย่างปลอดภัย — เครื่อง ${machineLabel(row)}**` : "**ขั้นตอนการเปลี่ยนอะไหล่อย่างปลอดภัย**",
    "",
    "1. ทำ Lockout-Tagout ให้ครบก่อนเริ่มถอดชิ้นส่วนทุกครั้ง",
    "2. ตรวจสอบรหัสอะไหล่ให้ตรงรุ่นจากคู่มือเครื่อง และเบิกผ่านเมนูคลังอะไหล่เพื่อให้ยอดคงเหลือถูกต้อง",
    "3. ถ่ายรูปสภาพก่อนถอด เพื่อใช้อ้างอิงตอนประกอบคืนและแนบในใบงาน",
    "4. ถอด/ประกอบตามลำดับและค่าแรงขัน (torque) ที่คู่มือกำหนด",
    "5. เดินเครื่องทดสอบเปล่า ตรวจค่าอุณหภูมิและแรงสั่นสะเทือนเทียบกับเกณฑ์ก่อนส่งคืนการผลิต",
    "6. บันทึกอะไหล่ที่ใช้และเวลาที่ใช้ลงในใบงาน เพื่อให้คำนวณ MTTR และต้นทุนได้",
  ];
  if (row?.model) lines.push("", `_รุ่นเครื่องในระบบ: ${row.model} — ใช้รหัสอะไหล่ให้ตรงรุ่นนี้เท่านั้น_`);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Unknown-intent menu                                                 */
/* ------------------------------------------------------------------ */

// เมนูคำถามที่ระบบตอบได้จริง แสดงเมื่อตีความเจตนาไม่ได้
// ข้อความต้องบอกตรง ๆ ว่านี่เป็น POC ที่ตอบได้เฉพาะเรื่องเครื่องจักร ไม่ใช่ผู้ช่วยทั่วไป
// เพื่อไม่ให้ผู้ใช้เข้าใจผิดว่าถามอะไรก็ได้แล้วระบบแค่ตอบพลาด
function renderUnknown(hasMachine: boolean): string {
  const lines = [
    "**ยังตอบคำถามนี้ไม่ได้ครับ**",
    "",
    "ระบบตัวอย่างนี้ตอบได้เฉพาะเรื่องสภาพเครื่องจักรและงานซ่อมบำรุง ลองเลือกคำถามด้านล่าง หรือพิมพ์คำถามในลักษณะเดียวกัน:",
    "",
  ];
  if (hasMachine) {
    lines.push(
      "- เครื่องนี้ตอนนี้ปกติหรือผิดปกติ เพราะอะไร",
      "- ค่าอุณหภูมิและการสั่นสะเทือนตอนนี้เกินพิกัดไหม",
      "- ประวัติการซ่อมล่าสุดของเครื่องนี้เป็นอย่างไร",
      "- แนวทางแก้ไขรหัสข้อผิดพลาดของเครื่องนี้",
      "- ขอเช็กลิสต์การซ่อมบำรุงเชิงป้องกัน (PM Checklist)",
      "- ขั้นตอนความปลอดภัย Lockout-Tagout ก่อนเริ่มงาน",
      "- ขั้นตอนการเปลี่ยนอะไหล่อย่างปลอดภัย"
    );
  } else {
    lines.push(
      "- ตอนนี้มีเครื่องจักรไหนผิดปกติบ้าง",
      "- สรุปภาพรวมสถานะเครื่องจักรทั้งหมด",
      "- เครื่องไหนต้องเข้าซ่อมด่วนที่สุด",
      "- ขอเช็กลิสต์การซ่อมบำรุงเชิงป้องกัน (PM Checklist)",
      "- ขั้นตอนความปลอดภัย Lockout-Tagout ก่อนเริ่มงาน"
    );
  }
  if (!hasMachine) {
    lines.push("", "_ถ้าต้องการถามเจาะจงรายเครื่อง ให้เลือกเครื่องจักรจากหน้ารายการก่อน_");
  }
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export interface MockAssistantInput {
  prompt: string;
  machineContext?: { id?: string | null; code?: string | null } | null;
}

export interface MockAssistantResult {
  reply: string;
  intent: Intent;
  /** true เมื่อคำตอบเสนอให้เปิดใบงานซ่อม (Frame 2 human-in-the-loop) */
  suggestsWorkOrder: boolean;
  manualCitations: number;
}

// เจตนาที่ควรแนบคู่มืออ้างอิง (Frame 3)
//
// จำกัดไว้ที่ error_code เท่านั้นโดยเจตนา: การอ้างอิงคู่มือทำด้วยการค้น "รหัสตรงตัว"
// (ดูหมายเหตุใน findManualCitations) มีแต่คำถามเรื่องรหัสข้อผิดพลาดที่มีรหัสจริงให้ค้น
// ส่วนคำถามอย่าง PM/อะไหล่/ค่าตรวจวัด ไม่มีรหัสเฉพาะ จะเหลือแค่คำทั่วไปซึ่งค้นแล้วได้
// คู่มือคนละชนิดมาอ้างอิงผิด ๆ — เคยเกิดจริงและเป็นเหตุผลที่ตัดออก
const CITATION_INTENTS: Intent[] = ["error_code"];

/**
 * ตอบคำถามด้วยกฎและข้อมูลจริง — โยน error ได้ ผู้เรียก (routes/ai.ts) รับผิดชอบ
 * แปลงเป็นคำตอบสำรอง เพื่อให้ความล้มเหลวของฐานข้อมูลไม่ถูกกลืนเป็นคำตอบที่ดูปกติ
 */
export async function answerWithRules(input: MockAssistantInput): Promise<MockAssistantResult> {
  const prompt = typeof input?.prompt === "string" ? input.prompt : "";
  const intent = detectIntent(prompt);

  // หาเครื่องจักรที่เป็นบริบท: ใช้ id ก่อนเสมอ เพราะ machines.code ซ้ำกันได้ในฐานข้อมูลนี้
  // (migration 0009 ถอด unique constraint ออกและเพิ่ม dup_qr_count เพื่อบันทึกว่าซ้ำได้)
  let machine: MachineRow | null = null;
  if (input.machineContext?.id) {
    machine = await fetchMachineById(input.machineContext.id);
  }

  const needsFleet = intent === "abnormal_fleet" || intent === "fleet_overview" || intent === "urgent_repair";
  const needsMachine = !needsFleet && machine !== null;

  let reply: string;
  let suggestsWorkOrder = false;
  const citationTerms: string[] = [];

  if (needsFleet) {
    const fleet = await fetchFleet();
    reply =
      intent === "fleet_overview"
        ? renderFleetOverview(fleet)
        : renderAbnormalFleet(fleet, intent === "urgent_repair");
    // คำถามระดับฟลีตไม่เสนอเปิดใบงาน เพราะยังไม่รู้ว่าจะเปิดให้เครื่องไหน — ผู้ใช้ต้อง
    // เลือกเครื่องก่อน (แผงยืนยันฝั่งหน้าจอต้องมี machine ที่เจาะจงจึง prefill ได้)
  } else if (needsMachine && machine) {
    const evaluation = evaluateRow(machine);
    suggestsWorkOrder = evaluation.level !== "normal" || machine.status === "error" || machine.status === "warning";

    switch (intent) {
      case "sensor_readings":
        reply = renderSensorReadings(machine);
        break;
      case "error_code":
        reply = renderErrorCode(machine);
        if (machine.active_error_code) citationTerms.push(machine.active_error_code);
        break;
      case "repair_history":
        reply = renderRepairHistory(machine, await fetchWorkOrders(machine.code ?? ""));
        break;
      case "pm_checklist":
        reply = renderPmChecklist(machine);
        break;
      case "safety_loto":
        reply = renderSafetyLoto();
        // คำถามความปลอดภัยไม่ควรพ่วงข้อเสนอเปิดใบงาน — ผู้ใช้กำลังถามวิธีทำงานให้
        // ปลอดภัย ไม่ได้แจ้งว่าเครื่องเสีย
        suggestsWorkOrder = false;
        break;
      case "part_replacement":
        reply = renderPartReplacement(machine);
        break;
      case "machine_status":
        reply = renderMachineStatus(machine);
        break;
      default:
        reply = renderUnknown(true);
        suggestsWorkOrder = false;
        break;
    }
  } else {
    // ไม่มีเครื่องจักรเป็นบริบท: ตอบได้เฉพาะเจตนาที่ไม่ต้องอ้างอิงเครื่องเจาะจง
    switch (intent) {
      case "safety_loto":
        reply = renderSafetyLoto();
        break;
      case "pm_checklist":
        reply = renderPmChecklist(null);
        break;
      case "part_replacement":
        reply = renderPartReplacement(null);
        break;
      default:
        reply = renderUnknown(false);
        break;
    }
  }

  const citations = CITATION_INTENTS.includes(intent) ? await findManualCitations(citationTerms) : [];
  const citationBlock = citations.length > 0 ? renderCitations(citations, citationTerms[0]) : "";
  if (citationBlock) reply = `${reply}\n\n---\n\n${citationBlock}`;

  if (suggestsWorkOrder) {
    reply = `${reply}\n\nพบสภาวะผิดปกติของเครื่องจักร ต้องการเปิดใบงานซ่อมบำรุงในระบบทันทีหรือไม่?\n${WORK_ORDER_ACTION_TOKEN}`;
  }

  return { reply, intent, suggestsWorkOrder, manualCitations: citations.length };
}

/** เกณฑ์การประเมินที่โหมดนี้ใช้ — ให้ผู้เรียกเอาไปแสดงหรือทดสอบได้โดยไม่ต้องนำเข้า thresholds เอง */
export function ruleSummary(): string {
  return thresholdSummaryText();
}
