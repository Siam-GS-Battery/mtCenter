/**
 * mock-repair-history.ts — seed MOCK repair history (work_orders + work_order_parts)
 * for TWO machines so they can be shown side by side in a demo.
 *
 * ⚠️  THIS SCRIPT WRITES FABRICATED REPAIR RECORDS INTO A MAINTENANCE SYSTEM. ⚠️
 *
 * It exists for demo/UI purposes only. Every work order it creates is invented.
 * Technicians must never act on it. That is why every row carries "MOCK_DATA" in
 * data_quality_flags, and why the pre-change state (the ids already present for
 * each machine) is captured to backend/backups/mock-machine/repair-history.before.json
 * so `--revert` deletes exactly the ids this script created.
 *
 * SCOPE: exactly two machines, identified by id (see resolveMachine() below for why
 * id is the primary key used, not code) —
 *   A) id "GR-1141#0815" (code "GR-1141") — INNER RING RACEWAY GRINDING MACHINE
 *      9 work orders telling an escalating spindle-bearing failure story.
 *   B) id "1#0802"       (code was "1" at spec time, is "ALL-000" in this DB)
 *      — OUTER RING RACEWAY GRINDING — 7 healthy/routine work orders.
 * Nothing else in the database is read-modified-written.
 *
 * Usage:
 *   npm run mock:history -- --dry-run    # print the plan, touch nothing
 *   npm run mock:history                 # apply (idempotent, safe to re-run)
 *   npm run mock:history -- --revert     # delete exactly the mock rows this created
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { supabase } from "../src/lib/supabase.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = resolve(__dirname, "../backups/mock-machine");
const BACKUP_PATH = resolve(BACKUP_DIR, "repair-history.before.json");

const MOCK_FLAG = "MOCK_DATA";

/* ------------------------------------------------------------------ */
/* Targets                                                            */
/* ------------------------------------------------------------------ */

// `id` is the fallback lookup key: it is the true primary key of `machines` and
// never drifts. `expectedCode` is what the task brief states the code should be —
// checked by exact lookup first, but if the live row's code has since changed
// (verified against this DB: id "1#0802" now carries code "ALL-000", not "1"),
// this script falls back to the id lookup rather than throwing, and uses the
// row's ACTUAL current code for work_orders.machine_code. Using a stale code here
// would silently break `GET /api/work-orders?machineCode=...`, which is exactly
// how the frontend fetches this history.
const MACHINE_A = { id: "GR-1141#0815", expectedCode: "GR-1141", expectedName: "INNER RING RACEWAY GRINDING MACHINE" };
const MACHINE_B = { id: "1#0802", expectedCode: "1", expectedName: "OUTER RING RACEWAY GRINDING" };

const MT_LEADER = "สมชาย ใจดี";
const PD_NICKNAME = "ต้น";
const TECHS = ["สมศักดิ์ พากเพียร", "วิชัย มั่นคง", "ธีระ ตั้งใจ", "อนันต์ สุขสันต์"];

/* ------------------------------------------------------------------ */
/* Seed types                                                         */
/* ------------------------------------------------------------------ */

interface PartSeed {
  code: string;
  name: string;
  quantity: number;
  position: string;
}

interface WorkOrderSeed {
  /** Numeric suffix — id = code = `WO${num}`. Reserved high block, never reused by real data. */
  num: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "review" | "completed";
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  finishHourUtc: string | null; // "HH:MM" on assignedDate, or null if not finished
  symptoms: string[] | null;
  actionPlan: string[] | null;
  partsRequested: string[] | null;
  solutionSteps: string[] | null;
  stepsCompleted: number | null;
  totalSteps: number | null;
  estimatedHours: number | null;
  sectionResponse: "Breakdown Maintenance" | "Preventive Maintenance";
  shift: "DAY" | "NIGHT";
  /**
   * The two unions below are the live domains, read off all 8,589 imported rows —
   * NOT a plausible-looking taxonomy of our own. repair_category is only ever
   * Mechanical / Electrical / Other (a "Hydraulic" row would have invented a fourth
   * category, and repair_category is aggregated fleet-wide by
   * GET /api/work-orders/stats → byRepairCategory, so the fabricated bucket would
   * show up in a real report). damage_source is the plant's 4M classification:
   * Material / Machine / Method / Man — "Age" and "Maintenance" are not values this
   * column has ever held.
   */
  repairCategory: "Mechanical" | "Electrical" | "Other";
  damageSource: "Material" | "Machine" | "Method" | "Man";
  mtlossMin: number | null;
  repairDurationMin: number | null;
  technicians: string[];
  cause: string;
  repairAction: string | null;
  technicianNote: string | null;
  parts?: PartSeed[];
}

/* ------------------------------------------------------------------ */
/* A) GR-1141 — escalating spindle-bearing failure story              */
/* ------------------------------------------------------------------ */

const MACHINE_A_ORDERS: WorkOrderSeed[] = [
  {
    num: 95001,
    title: "ซ่อม Limit Switch หลวมที่ตำแหน่ง Work Head",
    description: "พบ Limit Switch หลวมทำให้ตรวจจับตำแหน่งแกน Work Head ไม่แม่นยำ",
    priority: "low",
    status: "completed",
    assignedDate: "2025-11-05",
    dueDate: "2025-11-05",
    finishHourUtc: "10:30",
    symptoms: ["Limit Switch หลวม", "ตำแหน่งแกนเคลื่อนเล็กน้อย"],
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["ตรวจสอบตำแหน่ง Limit Switch", "ขันแน่นสกรูยึด", "ทดสอบการทำงาน"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 1,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 15,
    repairDurationMin: 20,
    technicians: [TECHS[0]],
    cause: "สกรูยึด Limit Switch คลายตัวจากการสั่นสะเทือนสะสม",
    repairAction: "ขันแน่นสกรูยึดและปรับตั้งตำแหน่ง Limit Switch ใหม่",
    technicianNote: null,
  },
  {
    num: 95002,
    title: "ซ่อมปั๊มคูลแลนท์ทำงานไม่ต่อเนื่อง",
    description: "ปั๊มคูลแลนท์ตัด-ต่อไม่สม่ำเสมอระหว่างการเจียร",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-01-20",
    dueDate: "2026-01-20",
    finishHourUtc: "13:15",
    symptoms: ["ปั๊มคูลแลนท์ตัด-ต่อไม่สม่ำเสมอ"],
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["ตรวจสอบหน้าสัมผัสรีเลย์", "ทำความสะอาดหน้าสัมผัส", "เปลี่ยนฟิวส์ป้องกัน"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Machine",
    mtlossMin: 25,
    repairDurationMin: 35,
    technicians: [TECHS[1]],
    cause: "หน้าสัมผัสรีเลย์ควบคุมปั๊มคูลแลนท์เกิดออกไซด์",
    repairAction: "ทำความสะอาดหน้าสัมผัสรีเลย์และเปลี่ยนฟิวส์ป้องกัน",
    technicianNote: null,
  },
  {
    num: 95003,
    title: "ปรับตั้งฝาครอบป้องกัน (Guard Cover) หลวม",
    description: "ฝาครอบป้องกันบริเวณหัวเจียรมีเสียงสั่นขณะเดินเครื่อง",
    priority: "low",
    status: "completed",
    assignedDate: "2026-04-10",
    dueDate: "2026-04-10",
    finishHourUtc: "09:45",
    symptoms: ["ฝาครอบป้องกันสั่นมีเสียง"],
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["ตรวจสอบสกรูยึดฝาครอบ", "เปลี่ยนสกรูที่หลุด", "ขันแน่นทุกจุด"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 1,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 40,
    repairDurationMin: 30,
    technicians: [TECHS[2]],
    cause: "สกรูยึดฝาครอบป้องกันหลุดจากการสั่นสะเทือน",
    repairAction: "ขันแน่นและเปลี่ยนสกรูยึดฝาครอบใหม่",
    technicianNote: null,
  },
  {
    num: 95004,
    title: "ตรวจพบการสั่นสะเทือนผิดปกติที่ Work Head",
    description: "ผู้ควบคุมเครื่องรายงานความสั่นสะเทือนที่ Work Head สูงกว่าปกติ",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-05-15",
    dueDate: "2026-05-16",
    finishHourUtc: "11:00",
    symptoms: ["สั่นสะเทือนที่ Work Head", "เสียงดังผิดปกติเล็กน้อย"],
    actionPlan: ["ตรวจวัดค่าความสั่นสะเทือน", "หยอดน้ำมันหล่อลื่น Spindle", "นัดติดตามผลใน 30 วัน"],
    partsRequested: null,
    solutionSteps: ["วัดค่าความสั่นสะเทือนด้วยเครื่องวัด", "หยอดน้ำมันหล่อลื่นเพิ่มเติม", "บันทึกค่าไว้เทียบรอบถัดไป"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 60,
    repairDurationMin: 75,
    technicians: [TECHS[0], TECHS[3]],
    cause: "ลูกปืนแกนหมุน (Spindle Bearing) เริ่มมีการสึกหรอ",
    repairAction: "ตรวจสอบค่าความสั่นสะเทือนด้วยเครื่องวัด และหยอดน้ำมันหล่อลื่นเพิ่มเติม",
    technicianNote: "ค่าความสั่นสะเทือนสูงกว่าเกณฑ์ปกติเล็กน้อย แนะนำติดตามตรวจสอบต่อเนื่อง",
    parts: [{ code: "GRS-1042", name: "Spindle Grease", quantity: 2, position: "Spindle Housing" }],
  },
  {
    num: 95005,
    title: "เสียงดังผิดปกติจาก Spindle เพิ่มขึ้น",
    description: "เสียงดังจาก Spindle เพิ่มขึ้นชัดเจนเมื่อเทียบกับรอบก่อน",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-06-20",
    dueDate: "2026-06-21",
    finishHourUtc: "14:20",
    symptoms: ["เสียงดังจาก Spindle", "สั่นสะเทือนที่ Work Head เพิ่มขึ้น"],
    actionPlan: [
      "ถอดตรวจสอบลูกปืน Spindle",
      "อัดจารบีใหม่",
      "ปรับตั้งความตึงสายพาน",
      "วางแผนเปลี่ยนลูกปืนในรอบถัดไป",
    ],
    partsRequested: ["Spindle Bearing", "Drive Belt"],
    solutionSteps: ["ถอดตรวจสอบลูกปืน Spindle เบื้องต้น", "อัดจารบีใหม่", "ปรับตั้งความตึงสายพาน"],
    stepsCompleted: 4,
    totalSteps: 4,
    estimatedHours: 4,
    sectionResponse: "Breakdown Maintenance",
    shift: "NIGHT",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 120,
    repairDurationMin: 150,
    technicians: [TECHS[1], TECHS[2]],
    cause: "ลูกปืนแกนหมุน (Spindle Bearing) สึกหรอเพิ่มขึ้นจากรอบการทำงานสะสม",
    repairAction: "ถอดตรวจสอบลูกปืน Spindle เบื้องต้น อัดจารบีใหม่ และปรับตั้งความตึงสายพาน",
    technicianNote: "แนวโน้มความสั่นสะเทือนสูงขึ้นต่อเนื่อง คาดว่าลูกปืนใกล้หมดอายุการใช้งาน",
    parts: [
      { code: "BRG-6210", name: "Spindle Bearing", quantity: 1, position: "Spindle Shaft" },
      { code: "BLT-A38", name: "Drive Belt", quantity: 1, position: "Spindle Motor" },
    ],
  },
  {
    num: 95006,
    title: "Spindle มีความร้อนสูงผิดปกติร่วมกับการสั่นสะเทือน",
    description: "Spindle ร้อนผิดปกติร่วมกับความสั่นสะเทือนสูงขึ้นต่อเนื่อง",
    priority: "high",
    status: "completed",
    assignedDate: "2026-07-15",
    dueDate: "2026-07-16",
    finishHourUtc: "16:00",
    symptoms: ["Spindle ร้อนผิดปกติ", "สั่นสะเทือนสูงกว่าเกณฑ์", "เสียงดังต่อเนื่อง"],
    actionPlan: [
      "วัดอุณหภูมิ Spindle",
      "เปลี่ยนน้ำมันหล่อลื่น",
      "ปรับตั้งระบบระบายความร้อนชั่วคราว",
      "สั่งซื้ออะไหล่ลูกปืน Spindle เร่งด่วน",
    ],
    partsRequested: ["Spindle Bearing", "Spindle Oil"],
    solutionSteps: ["วัดอุณหภูมิ Spindle ด้วยกล้องความร้อน", "เปลี่ยนน้ำมันหล่อลื่น Spindle", "ปรับตั้งระบบระบายความร้อนชั่วคราว"],
    stepsCompleted: 4,
    totalSteps: 4,
    estimatedHours: 6,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 240,
    repairDurationMin: 280,
    technicians: [TECHS[0], TECHS[1], TECHS[3]],
    cause: "ลูกปืนแกนหมุน (Spindle Bearing) เสื่อมสภาพรุนแรง ทำให้เกิดความร้อนสะสม",
    repairAction: "เปลี่ยนน้ำมันหล่อลื่น Spindle และปรับตั้งระบบระบายความร้อนชั่วคราวจนกว่าจะได้อะไหล่เปลี่ยนลูกปืน",
    technicianNote: "ต้องเฝ้าระวังใกล้ชิด มีความเสี่ยงเครื่องเสียหายหนักถ้าไม่เปลี่ยนลูกปืนโดยเร็ว",
    parts: [{ code: "OIL-SP68", name: "Spindle Oil", quantity: 4, position: "Spindle Housing" }],
  },
  {
    num: 95007,
    title: "Spindle สั่นสะเทือนรุนแรงใกล้จุดวิกฤต",
    description: "ความสั่นสะเทือนของ Spindle รุนแรงขึ้นจนใกล้จุดวิกฤต ระหว่างรออะไหล่เปลี่ยนลูกปืน",
    priority: "high",
    status: "completed",
    assignedDate: "2026-08-12",
    dueDate: "2026-08-13",
    finishHourUtc: "18:40",
    symptoms: ["สั่นสะเทือนรุนแรงที่ Work Head", "เสียงกระแทกเป็นจังหวะ", "อุณหภูมิ Spindle สูงต่อเนื่อง"],
    actionPlan: [
      "ปรับลดความเร็วรอบชั่วคราว",
      "เปลี่ยนซีลกันน้ำมันที่รั่ว",
      "ติดตั้งเซนเซอร์ตรวจวัดความสั่นสะเทือนเพิ่มเติม",
      "เร่งติดตามอะไหล่ลูกปืน Spindle",
    ],
    partsRequested: ["Oil Seal", "Vibration Sensor"],
    solutionSteps: [
      "ปรับลดความเร็วรอบ Spindle ชั่วคราวเพื่อลดความเสี่ยง",
      "เปลี่ยนซีลกันน้ำมันที่รั่วซึม",
      "ติดตั้งเซนเซอร์ตรวจวัดความสั่นสะเทือนเพิ่มเติมเพื่อเฝ้าระวัง",
    ],
    stepsCompleted: 4,
    totalSteps: 4,
    estimatedHours: 5,
    sectionResponse: "Breakdown Maintenance",
    shift: "NIGHT",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 420,
    repairDurationMin: 300,
    technicians: [TECHS[2], TECHS[3]],
    cause: "ลูกปืนแกนหมุน (Spindle Bearing) เสื่อมสภาพขั้นวิกฤต รออะไหล่เปลี่ยนทดแทน",
    repairAction:
      "ปรับลดความเร็วรอบชั่วคราว เปลี่ยนซีลกันน้ำมันที่รั่ว และติดตั้งเซนเซอร์ตรวจวัดความสั่นสะเทือนเพิ่มเติมเพื่อเฝ้าระวัง",
    technicianNote: "อาการรุนแรงขึ้นต่อเนื่อง ประเมินว่าลูกปืนจะเสียหายสมบูรณ์ในไม่ช้าหากไม่เปลี่ยน ต้องเร่งจัดหาอะไหล่",
    parts: [
      { code: "SEAL-OR45", name: "Oil Seal", quantity: 2, position: "Spindle Shaft" },
      { code: "SNS-VIB01", name: "Vibration Sensor", quantity: 1, position: "Spindle Housing" },
    ],
  },
  {
    num: 95008,
    title: "BREAKDOWN: SPINDLE VIBRATION OVER LIMIT (ALM-1042)",
    description:
      "เครื่องหยุดทำงานอัตโนมัติจาก Error Code ALM-1042 เนื่องจากค่าความสั่นสะเทือนของ Spindle เกินค่าที่กำหนด",
    priority: "high",
    status: "in_progress",
    assignedDate: "2026-08-16",
    dueDate: "2026-08-18",
    finishHourUtc: null,
    symptoms: [
      "Error Code ALM-1042",
      "สั่นสะเทือนเกินค่ากำหนดจนเครื่องหยุดอัตโนมัติ",
      "เสียงกระแทกดังจาก Spindle",
    ],
    actionPlan: [
      "ตรวจสอบ Alarm ALM-1042",
      "ถอดฝาครอบตรวจสอบ Spindle",
      "ตรวจสอบสภาพลูกปืน",
      "สั่งอะไหล่ลูกปืน Spindle ด่วน",
      "รออะไหล่มาส่ง",
      "เปลี่ยนลูกปืน Spindle",
      "ทดสอบเดินเครื่องและวัดค่าความสั่นสะเทือน",
    ],
    partsRequested: ["Spindle Bearing", "Oil Seal", "Spindle Grease"],
    solutionSteps: ["ตรวจสอบ Alarm ALM-1042", "ถอดฝาครอบตรวจสอบสภาพ Spindle", "ยืนยันลูกปืนเสียหาย สั่งอะไหล่ด่วน"],
    stepsCompleted: 3,
    totalSteps: 7,
    estimatedHours: 16,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: null,
    repairDurationMin: null,
    technicians: [TECHS[0], TECHS[1]],
    cause: "ลูกปืนแกนหมุน (Spindle Bearing) เสียหายจนระบบ Safety สั่งหยุดเครื่องอัตโนมัติ",
    repairAction: null,
    technicianNote: "อยู่ระหว่างรออะไหล่ลูกปืน Spindle จาก Supplier คาดว่าจะได้รับภายใน 2 วัน",
  },
  {
    num: 95009,
    title: "รอเปลี่ยนลูกปืน Spindle (Spindle Bearing Replacement)",
    description:
      "รองานเปลี่ยนลูกปืนแกนหมุนตามแผน หลังพบความเสียหายจาก WO95008 (ALM-1042) กำลังรออะไหล่จากคลัง/Supplier",
    priority: "high",
    status: "pending",
    assignedDate: "2026-08-17",
    dueDate: "2026-08-19",
    finishHourUtc: null,
    symptoms: null,
    actionPlan: ["ยืนยันอะไหล่มาส่ง", "หยุดเครื่องตามแผน", "เปลี่ยนลูกปืน Spindle", "ทดสอบเดินเครื่อง"],
    partsRequested: ["Spindle Bearing", "Oil Seal"],
    solutionSteps: null,
    stepsCompleted: 0,
    totalSteps: 4,
    estimatedHours: 8,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: null,
    repairDurationMin: null,
    technicians: [TECHS[2]],
    cause: "ลูกปืนแกนหมุน (Spindle Bearing) เสียหายจาก WO95008 รอเปลี่ยนตามแผน",
    repairAction: null,
    technicianNote: null,
  },
];

/* ------------------------------------------------------------------ */
/* B) machine code "1" — healthy / routine                            */
/* ------------------------------------------------------------------ */

const MACHINE_B_ORDERS: WorkOrderSeed[] = [
  {
    num: 95010,
    title: "PM หยอดน้ำมันหล่อลื่นระบบเฟือง Outer Ring",
    description: "งาน PM ตามรอบ หยอดน้ำมันหล่อลื่นจุดเฟืองขับและราง Outer Ring",
    priority: "low",
    status: "completed",
    assignedDate: "2025-09-10",
    dueDate: "2025-09-10",
    finishHourUtc: "09:00",
    symptoms: null,
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["หยอดน้ำมันหล่อลื่นตามจุดที่กำหนด", "ตรวจสอบระดับน้ำมัน"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 15,
    repairDurationMin: 25,
    technicians: [TECHS[0]],
    cause: "ครบกำหนดตามแผน PM หยอดน้ำมันหล่อลื่น",
    repairAction: "หยอดน้ำมันหล่อลื่นตามจุดที่กำหนดและตรวจสอบระดับน้ำมัน",
    technicianNote: null,
  },
  {
    num: 95011,
    title: "เปลี่ยนเซนเซอร์ตรวจจับตำแหน่งชิ้นงาน (Proximity Sensor)",
    description: "Proximity Sensor อ่านค่าตำแหน่งชิ้นงานไม่แม่นยำเป็นระยะ",
    priority: "low",
    status: "completed",
    assignedDate: "2025-11-02",
    dueDate: "2025-11-02",
    finishHourUtc: "11:30",
    symptoms: ["ตรวจจับตำแหน่งชิ้นงานไม่แม่นยำเป็นระยะ"],
    actionPlan: null,
    partsRequested: ["Proximity Sensor"],
    solutionSteps: ["ตรวจสอบ Proximity Sensor", "เปลี่ยนตัวใหม่", "ปรับตั้งระยะตรวจจับ"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 1,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Machine",
    mtlossMin: 20,
    repairDurationMin: 30,
    technicians: [TECHS[1]],
    cause: "Proximity Sensor เสื่อมสภาพ อ่านค่าตำแหน่งชิ้นงานไม่แม่นยำ",
    repairAction: "เปลี่ยน Proximity Sensor ตัวใหม่และปรับตั้งระยะตรวจจับ",
    technicianNote: null,
    parts: [{ code: "SNS-PRX12", name: "Proximity Sensor", quantity: 1, position: "Workpiece Feed" }],
  },
  {
    num: 95012,
    title: "PM เปลี่ยนไส้กรองคูลแลนท์ (Coolant Filter)",
    description: "งาน PM ตามรอบเปลี่ยนไส้กรองคูลแลนท์และล้างถัง",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-01-15",
    dueDate: "2026-01-15",
    finishHourUtc: "10:15",
    symptoms: null,
    actionPlan: null,
    partsRequested: ["Coolant Filter"],
    solutionSteps: ["เปลี่ยนไส้กรองคูลแลนท์ใหม่", "ล้างถังคูลแลนท์"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 2,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 30,
    repairDurationMin: 40,
    technicians: [TECHS[2]],
    cause: "ไส้กรองคูลแลนท์อุดตันตามรอบการใช้งาน",
    repairAction: "เปลี่ยนไส้กรองคูลแลนท์ใหม่และล้างถังคูลแลนท์",
    technicianNote: null,
    parts: [{ code: "FLT-CL20", name: "Coolant Filter", quantity: 1, position: "Coolant Tank" }],
  },
  {
    num: 95013,
    title: "ปรับตั้ง Dresser หัวเจียรใหม่",
    description: "ผิวงานเจียรหยาบขึ้นเล็กน้อย ตรวจพบ Dresser สึกหรอตามรอบ",
    priority: "low",
    status: "completed",
    assignedDate: "2026-03-08",
    dueDate: "2026-03-08",
    finishHourUtc: "08:50",
    symptoms: ["ผิวงานเจียรหยาบขึ้นเล็กน้อย"],
    actionPlan: null,
    partsRequested: ["Diamond Dresser Tip"],
    solutionSteps: ["ปรับตั้งตำแหน่ง Dresser", "เปลี่ยนหัว Diamond Dresser", "ทดสอบเจียรตัวอย่าง"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 10,
    repairDurationMin: 20,
    technicians: [TECHS[3]],
    cause: "Dresser สึกหรอเล็กน้อยตามรอบการใช้งาน ทำให้ผิวเจียรหยาบขึ้นเล็กน้อย",
    repairAction: "ปรับตั้งตำแหน่ง Dresser และเปลี่ยนหัว Diamond Dresser",
    technicianNote: null,
    parts: [{ code: "DRS-DIA05", name: "Diamond Dresser Tip", quantity: 1, position: "Dresser Head" }],
  },
  {
    num: 95014,
    title: "เติมน้ำมันไฮดรอลิกระบบป้อนชิ้นงาน",
    description: "ระดับน้ำมันไฮดรอลิกต่ำกว่าเกณฑ์จากการรั่วซึมเล็กน้อยที่ข้อต่อ",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-05-02",
    dueDate: "2026-05-02",
    finishHourUtc: "13:00",
    symptoms: ["ระดับน้ำมันไฮดรอลิกต่ำกว่าเกณฑ์"],
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["เติมน้ำมันไฮดรอลิก", "ขันแน่นข้อต่อที่รั่วซึม"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 35,
    repairDurationMin: 30,
    technicians: [TECHS[0], TECHS[2]],
    cause: "ระดับน้ำมันไฮดรอลิกต่ำกว่าเกณฑ์จากการรั่วซึมเล็กน้อยที่ข้อต่อ",
    repairAction: "เติมน้ำมันไฮดรอลิกและขันแน่นข้อต่อที่รั่วซึม",
    technicianNote: null,
  },
  {
    num: 95015,
    title: "PM เปลี่ยนไส้กรองอากาศตู้คอนโทรล",
    description: "งาน PM ตามรอบเปลี่ยนไส้กรองอากาศตู้คอนโทรลและทำความสะอาดพัดลม",
    priority: "low",
    status: "completed",
    assignedDate: "2026-06-25",
    dueDate: "2026-06-25",
    finishHourUtc: "09:30",
    symptoms: null,
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["เปลี่ยนไส้กรองอากาศตู้คอนโทรล", "ทำความสะอาดพัดลมระบายความร้อน"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Method",
    mtlossMin: 12,
    repairDurationMin: 15,
    technicians: [TECHS[1]],
    cause: "ครบกำหนดตามแผน PM เปลี่ยนไส้กรองอากาศ",
    repairAction: "เปลี่ยนไส้กรองอากาศตู้คอนโทรลและทำความสะอาดพัดลมระบายความร้อน",
    technicianNote: null,
  },
  {
    num: 95016,
    title: "PM สอบเทียบเซนเซอร์วัดขนาดชิ้นงาน (Gauge Sensor)",
    description: "งาน PM ตามรอบสอบเทียบเซนเซอร์วัดขนาดชิ้นงานตามมาตรฐาน",
    priority: "low",
    status: "completed",
    assignedDate: "2026-08-10",
    dueDate: "2026-08-10",
    finishHourUtc: "10:00",
    symptoms: null,
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["สอบเทียบเซนเซอร์วัดขนาดชิ้นงาน", "บันทึกผลตามมาตรฐาน"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Method",
    mtlossMin: 18,
    repairDurationMin: 20,
    technicians: [TECHS[3]],
    cause: "ครบกำหนดสอบเทียบตามรอบ Calibration",
    repairAction: "สอบเทียบเซนเซอร์วัดขนาดชิ้นงานตามมาตรฐานและบันทึกผล",
    technicianNote: null,
  },
];

/* ------------------------------------------------------------------ */
/* Machine target descriptors                                        */
/* ------------------------------------------------------------------ */

interface MachineTarget {
  id: string;
  expectedCode: string;
  expectedName: string;
  nameRaw: string;
  lineLocation: string;
  orders: WorkOrderSeed[];
}

const TARGETS: MachineTarget[] = [
  {
    id: MACHINE_A.id,
    expectedCode: MACHINE_A.expectedCode,
    expectedName: MACHINE_A.expectedName,
    nameRaw: "Inner Ring Raceway Grinding Machine",
    lineLocation: "CR1",
    orders: MACHINE_A_ORDERS,
  },
  {
    id: MACHINE_B.id,
    expectedCode: MACHINE_B.expectedCode,
    expectedName: MACHINE_B.expectedName,
    nameRaw: "Outer Ring Raceway Grinding",
    lineLocation: "TOOLING",
    orders: MACHINE_B_ORDERS,
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function isoAt(dateStr: string, hourMin: string): string {
  return new Date(`${dateStr}T${hourMin}:00.000Z`).toISOString();
}

/**
 * work_orders.fy is the plant's FISCAL year, not the calendar year: verified against
 * all 8,589 imported rows, every January/February/March report carries fy = year - 1
 * and every April..December report carries fy = year (1,797 rows sit on the -1 side,
 * exactly the Jan-Mar population). So the fiscal year starts in April.
 *
 * Taking `assignedDate.slice(0, 4)` instead would have filed the three Jan/Mar mock
 * orders (WO95002, WO95012, WO95013) one fiscal year later than every real row from
 * the same months, i.e. into a year-on-year comparison they do not belong in.
 */
function fiscalYear(dateStr: string): number {
  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(5, 7));
  return month <= 3 ? year - 1 : year;
}

function minusHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() - hours * 3_600_000).toISOString();
}

function workOrderId(seed: WorkOrderSeed): string {
  return `WO${seed.num}`;
}

function partId(seed: WorkOrderSeed, index: number): string {
  return `${workOrderId(seed)}-P${index + 1}`;
}

/* ------------------------------------------------------------------ */
/* Machine lookup                                                     */
/* ------------------------------------------------------------------ */

/**
 * Resolve a target by expected code first (as the task spec states); if that code
 * no longer exists, fall back to the id (the machines PK, which never drifts) and
 * warn loudly. Either way, `name` must match exactly or this throws — it never
 * silently returns a different machine.
 */
async function resolveMachine(
  id: string,
  expectedCode: string,
  expectedName: string
): Promise<{ id: string; code: string; name: string }> {
  let row: { id: string; code: string; name: string } | null = null;

  const byCode = await supabase.from("machines").select("id, code, name").eq("code", expectedCode).maybeSingle();
  if (byCode.error) throw new Error(`Machine lookup failed for code "${expectedCode}": ${byCode.error.message}`);
  if (byCode.data) row = byCode.data as { id: string; code: string; name: string };

  if (!row) {
    const byId = await supabase.from("machines").select("id, code, name").eq("id", id).maybeSingle();
    if (byId.error) throw new Error(`Machine lookup failed for id "${id}": ${byId.error.message}`);
    if (!byId.data) throw new Error(`No machine found with code "${expectedCode}" or id "${id}".`);
    row = byId.data as { id: string; code: string; name: string };
    console.warn(
      `  [warn] code "${expectedCode}" no longer exists; resolved by id "${id}" instead ` +
        `(current code is "${row.code}"). Using the current code for machine_code.`
    );
  }

  if (row.id !== id) {
    throw new Error(`Machine with code "${expectedCode}" has id "${row.id}", expected "${id}". Refusing to touch it.`);
  }
  if (row.name !== expectedName) {
    throw new Error(`Machine "${row.id}" has name "${row.name}", expected "${expectedName}". Refusing to touch it.`);
  }
  return row;
}

/* ------------------------------------------------------------------ */
/* Row builders                                                       */
/* ------------------------------------------------------------------ */

function buildWorkOrderRow(seed: WorkOrderSeed, machine: { id: string; code: string }, target: MachineTarget) {
  const id = workOrderId(seed);
  const finishDatetime = seed.finishHourUtc ? isoAt(seed.assignedDate, seed.finishHourUtc) : null;
  const timeRefProduction = finishDatetime ? minusHours(finishDatetime, 8) : null;
  const nowIso = new Date().toISOString();

  return {
    id,
    code: id,
    title: seed.title,
    machine_id: machine.id,
    priority: seed.priority,
    status: seed.status,
    technician_name: seed.technicians[0] ?? "",
    engineer_reviewer: null,
    assigned_date: seed.assignedDate,
    due_date: seed.dueDate,
    description: seed.description,
    symptoms: seed.symptoms,
    steps_completed: seed.stepsCompleted,
    total_steps: seed.totalSteps,
    ai_verification_score: null,
    requested_by: PD_NICKNAME,
    assigned_to: seed.technicians[0] ?? null,
    estimated_hours: seed.estimatedHours,
    action_plan: seed.actionPlan,
    parts_requested: seed.partsRequested,
    solution_steps: seed.solutionSteps,
    machine_code: machine.code,
    fy: fiscalYear(seed.assignedDate),
    shift: seed.shift,
    section_response: seed.sectionResponse,
    line_location: target.lineLocation,
    machine_name_raw: target.nameRaw,
    machine_name_std: target.expectedName,
    machine_variant: null,
    repair_category: seed.repairCategory,
    damage_source: seed.damageSource,
    pd_nickname: PD_NICKNAME,
    technicians: seed.technicians,
    technician_count: seed.technicians.length,
    cause: seed.cause,
    repair_action: seed.repairAction,
    mt_leader_name: MT_LEADER,
    finish_datetime: finishDatetime,
    time_ref_production: timeRefProduction,
    mtloss_min: seed.mtlossMin,
    repair_duration_min: seed.repairDurationMin,
    mtloss_diff_min: null,
    data_quality_flags: [MOCK_FLAG],
    technician_note: seed.technicianNote,
    revision_note: null,
    action_plan_steps: null,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

function buildPartRows(seed: WorkOrderSeed) {
  if (!seed.parts || seed.parts.length === 0) return [];
  return seed.parts.map((p, i) => ({
    id: partId(seed, i),
    work_order_id: workOrderId(seed),
    part_id: null,
    part_code: p.code,
    part_name: p.name,
    quantity: p.quantity,
    status: "requested",
    part_position: p.position,
    part_model_raw: null,
    source: "manual",
  }));
}

/* ------------------------------------------------------------------ */
/* Backup                                                             */
/* ------------------------------------------------------------------ */

interface BackupFile {
  capturedAt: string;
  machines: {
    id: string;
    code: string;
    /** work_order ids for this machine_code that already existed before this script ran. */
    preExistingWorkOrderIds: string[];
  }[];
  insertedWorkOrderIds: string[];
  insertedPartIds: string[];
}

function readBackup(): BackupFile | null {
  if (!existsSync(BACKUP_PATH)) return null;
  return JSON.parse(readFileSync(BACKUP_PATH, "utf8")) as BackupFile;
}

/** All work_order ids currently stored for a machine_code (paged past PostgREST's 1000-row cap). */
async function workOrderIdsForCode(machineCode: string): Promise<string[]> {
  const PAGE = 1000;
  const ids: string[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("work_orders")
      .select("id")
      .eq("machine_code", machineCode)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`work_orders lookup failed for machine_code "${machineCode}": ${error.message}`);
    const page = (data ?? []).map((r: any) => r.id as string);
    ids.push(...page);
    if (page.length < PAGE) return ids;
  }
}

/* ------------------------------------------------------------------ */
/* Commands                                                            */
/* ------------------------------------------------------------------ */

function printSummary(target: MachineTarget, machine: { id: string; code: string }) {
  console.log(`\n=== ${target.expectedName}  id=${machine.id}  machine_code="${machine.code}" ===`);
  console.log(
    "  id".padEnd(10) +
      "date".padEnd(12) +
      "status".padEnd(13) +
      "priority".padEnd(9) +
      "mtloss".padEnd(8) +
      "title"
  );
  for (const seed of target.orders) {
    const id = workOrderId(seed);
    const mtloss = seed.mtlossMin === null ? "-" : String(seed.mtlossMin);
    console.log(
      `  ${id.padEnd(8)}${seed.assignedDate.padEnd(12)}${seed.status.padEnd(13)}${seed.priority.padEnd(9)}${mtloss.padEnd(8)}${seed.title}`
    );
  }
}

async function apply(dryRun: boolean) {
  const backup = readBackup();
  const allowedExisting = new Set(backup?.insertedWorkOrderIds ?? []);

  const resolved: { target: MachineTarget; machine: { id: string; code: string; name: string } }[] = [];
  for (const target of TARGETS) {
    const machine = await resolveMachine(target.id, target.expectedCode, target.expectedName);
    console.log(`Resolved id=${machine.id}: code="${machine.code}" name="${machine.name}"`);
    resolved.push({ target, machine });
  }

  // Collision guard: any chosen id that already exists in work_orders and was NOT
  // created by a previous run of this script means we'd be clobbering real data.
  const allIds = TARGETS.flatMap((t) => t.orders.map(workOrderId));
  const { data: collisionRows, error: collisionErr } = await supabase
    .from("work_orders")
    .select("id")
    .in("id", allIds);
  if (collisionErr) throw new Error(`Collision check failed: ${collisionErr.message}`);
  const collisions = (collisionRows ?? []).map((r: any) => r.id as string).filter((id) => !allowedExisting.has(id));
  if (collisions.length > 0) {
    throw new Error(
      `Refusing to proceed: the following reserved ids already exist and were not created by a previous ` +
        `run of this script: ${collisions.join(", ")}`
    );
  }

  for (const { target, machine } of resolved) {
    printSummary(target, machine);
  }

  if (dryRun) {
    console.log("\n[dry-run] nothing written.");
    return;
  }

  // Capture pre-existing state on the very first apply only.
  const finalBackup: BackupFile = backup ?? {
    capturedAt: new Date().toISOString(),
    machines: await Promise.all(
      resolved.map(async ({ machine }) => ({
        id: machine.id,
        code: machine.code,
        preExistingWorkOrderIds: await workOrderIdsForCode(machine.code),
      }))
    ),
    insertedWorkOrderIds: [],
    insertedPartIds: [],
  };

  mkdirSync(BACKUP_DIR, { recursive: true });

  const workOrderRows: Record<string, unknown>[] = [];
  const partRows: Record<string, unknown>[] = [];
  for (const { target, machine } of resolved) {
    for (const seed of target.orders) {
      workOrderRows.push(buildWorkOrderRow(seed, machine, target));
      partRows.push(...buildPartRows(seed));
    }
  }

  // Record the ids we are ABOUT to write, and flush the backup to disk, BEFORE the
  // first write goes out.
  //
  // Writing it afterwards (as this did) loses the whole set if any chunk fails: the
  // work_orders upsert lands, the work_order_parts upsert errors, the process exits
  // before writeFileSync — and now there is no backup file at all, so `--revert`
  // reports "nothing to revert" while 16 mock work orders sit in the table, and a
  // retry of `apply` is refused by the collision guard (those ids exist and no
  // backup vouches for them). That is an unrecoverable state reachable by a single
  // transient network error.
  //
  // Recording an id that never got inserted is harmless in the other direction:
  // revert deletes by `.in("id", ...)`, and deleting an id that is not there is a
  // no-op, not an error.
  finalBackup.insertedWorkOrderIds = Array.from(
    new Set([...finalBackup.insertedWorkOrderIds, ...workOrderRows.map((r) => r.id as string)])
  );
  finalBackup.insertedPartIds = Array.from(
    new Set([...finalBackup.insertedPartIds, ...partRows.map((r) => r.id as string)])
  );
  writeFileSync(BACKUP_PATH, JSON.stringify(finalBackup, null, 2), "utf8");
  console.log(`Wrote backup: ${BACKUP_PATH}`);

  for (let i = 0; i < workOrderRows.length; i += 500) {
    const chunkRows = workOrderRows.slice(i, i + 500);
    const { error } = await supabase.from("work_orders").upsert(chunkRows, { onConflict: "id" });
    if (error) throw new Error(`work_orders upsert failed at row ${i}: ${error.message}`);
  }
  console.log(`\nwork_orders upserted: ${workOrderRows.length} rows.`);

  for (let i = 0; i < partRows.length; i += 500) {
    const chunkRows = partRows.slice(i, i + 500);
    const { error } = await supabase.from("work_order_parts").upsert(chunkRows, { onConflict: "id" });
    if (error) throw new Error(`work_order_parts upsert failed at row ${i}: ${error.message}`);
  }
  console.log(`work_order_parts upserted: ${partRows.length} rows.`);

  console.log("\nDone. Revert with:  npm run mock:history -- --revert");
}

async function revert(dryRun: boolean) {
  const backup = readBackup();
  if (!backup) {
    console.log(`No backup at ${BACKUP_PATH} — nothing to revert.`);
    return;
  }

  // Belt and braces: never delete a work order that already existed for either
  // machine before the first apply. The collision guard in apply() should already
  // make this impossible, but `preExistingWorkOrderIds` was captured precisely so
  // the delete path does not have to take that on trust — an id that is in both
  // lists means something upstream went wrong, and the safe reading of "went wrong"
  // is "leave the row alone".
  const preExisting = new Set(backup.machines.flatMap((m) => m.preExistingWorkOrderIds));
  const workOrderIdsToDelete = backup.insertedWorkOrderIds.filter((id) => !preExisting.has(id));
  const skipped = backup.insertedWorkOrderIds.length - workOrderIdsToDelete.length;

  console.log(`Reverting using backup captured ${backup.capturedAt}`);
  console.log(`  work_order_parts to delete: ${backup.insertedPartIds.length}`);
  console.log(`  work_orders to delete: ${workOrderIdsToDelete.length}`);
  if (skipped > 0) {
    console.log(`  [warn] skipping ${skipped} id(s) that pre-date this script — not ours to delete.`);
  }

  if (dryRun) {
    console.log("[dry-run] nothing written.");
    return;
  }

  for (let i = 0; i < backup.insertedPartIds.length; i += 500) {
    const { error } = await supabase
      .from("work_order_parts")
      .delete()
      .in("id", backup.insertedPartIds.slice(i, i + 500));
    if (error) throw new Error(`work_order_parts delete failed: ${error.message}`);
  }

  for (let i = 0; i < workOrderIdsToDelete.length; i += 500) {
    const { error } = await supabase
      .from("work_orders")
      .delete()
      .in("id", workOrderIdsToDelete.slice(i, i + 500));
    if (error) throw new Error(`work_orders delete failed: ${error.message}`);
  }

  console.log(
    `Reverted. Deleted ${backup.insertedPartIds.length} work_order_parts and ${workOrderIdsToDelete.length} work_orders.`
  );
}

/* ------------------------------------------------------------------ */

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const doRevert = args.includes("--revert");
  const unknown = args.filter((a) => a !== "--dry-run" && a !== "--revert");
  if (unknown.length > 0) throw new Error(`Unknown argument(s): ${unknown.join(", ")}`);

  if (doRevert) await revert(dryRun);
  else await apply(dryRun);
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
