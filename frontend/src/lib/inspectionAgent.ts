import { useEffect, useMemo, useRef, useState } from "react";
import type { PlacedMachine, PlantLayout } from "./plantLayout";
import { buildNavGraph, routeBetween, type NavGraph, type NavPoint, type NavStrip } from "./floorNavGraph";
import {
  SPINDLE_TEMP_ERROR,
  SPINDLE_TEMP_WARNING,
  VIBRATION_ERROR,
  VIBRATION_WARNING,
} from "./thresholds";
import type { Machine, MachineStatus } from "../types";

/**
 * ===========================================================================
 * INSPECTOR AGENT — หุ่นยนต์ตรวจสายการผลิต (POC / โหมดจำลอง)
 * ===========================================================================
 *
 * โมดูลนี้คือ "สมอง" ของหุ่นยนต์ตรวจเครื่องจักรใน Live Floor 4D:
 * รับผังโรงงาน (`FloorLayout`) + การจำลองการเดินเครื่อง (`FloorSimulation`)
 * แล้ว
 *   1. วางแผนเส้นทางตรวจ (patrol route) เรียงตามโซน -> ไลน์ -> ลำดับในไลน์
 *   2. เดินไปตามเส้นทางแบบ deterministic (ก้าวด้วย `step(dt)` เหมือน
 *      floorSimulation — ไม่มี Math.random / setInterval อยู่ข้างใน)
 *   3. หยุดหน้าเครื่องแต่ละตัว อ่านค่าจาก simulation + ข้อมูลจริงของเครื่อง
 *      แล้วสรุปเป็น "ผลตรวจ" (finding) ทีละจุด
 *   4. จบรอบแล้วประกอบเป็น "รายงาน" (report) พร้อมข้อความไทยสำหรับขึ้นแชต
 *
 * ขอบเขตของ POC: การประเมินทั้งหมดใช้เกณฑ์จริงจาก `lib/thresholds` แต่
 * "ผู้ตรวจ" เป็นกฎ (rule-based) ไม่ใช่ LLM — ตัวรายงานที่ได้ถูกออกแบบให้
 * ส่งต่อเข้า AI Assistant ได้ทันที (ดู `reportToPrompt`) ซึ่งจะเป็นทางเชื่อม
 * ไปสู่เวอร์ชันจริงที่ให้โมเดลเขียนสรุปจาก snapshot ชุดเดียวกันนี้
 */

// ---------------------------------------------------------------------------
// ชนิดข้อมูลสาธารณะ
// ---------------------------------------------------------------------------

/** ช่วงเวลาของรายงานที่ผู้ใช้สั่ง */
export type InspectionScope = "hourly" | "daily" | "custom";

export const SCOPE_LABELS: Record<InspectionScope, string> = {
  hourly: "รายชั่วโมง",
  daily: "รายวัน",
  custom: "ตามสั่ง",
};

/** สถานะของหุ่นยนต์ในขณะหนึ่ง */
export type InspectorPhase =
  /** ยังไม่เริ่มรอบตรวจ */
  | "idle"
  /** กำลังเดินไปยังจุดตรวจถัดไป */
  | "walking"
  /** ยืนอยู่หน้าเครื่องและกำลังอ่านค่า */
  | "inspecting"
  /** เดินกลับจุดตั้งต้นเพื่อเรียบเรียงรายงาน */
  | "reporting"
  /** จบรอบแล้ว (รอรอบถัดไปหรือรอผู้ใช้สั่งใหม่) */
  | "done";

/** ระดับความรุนแรงของผลตรวจหนึ่งจุด */
export type FindingSeverity = "ok" | "watch" | "alert";

export const SEVERITY_LABELS: Record<FindingSeverity, string> = {
  ok: "ปกติ",
  watch: "เฝ้าระวัง",
  alert: "ต้องเข้าตรวจ",
};

/** จุดตรวจหนึ่งจุดบนเส้นทาง — พิกัดโลกสัมบูรณ์ (เมตร) เหมือน FloorLayout */
export interface InspectionStop {
  machine: Machine;
  zoneId: string;
  zoneLabel: string;
  /** จุดที่หุ่นยนต์ยืนตรวจ (ข้างทางเดิน ไม่ทับตัวเครื่อง) */
  standX: number;
  standZ: number;
  /** จุดพักบนแนวทางเดินก่อนเลี้ยวเข้าหาเครื่อง (กันเดินทะลุเครื่องอื่น) */
  laneX: number;
  laneZ: number;
  /** มุมหันหน้า (เรเดียน) ให้หุ่นยนต์มองเข้าหาตัวเครื่องขณะตรวจ */
  facing: number;
}

/** ผลตรวจของเครื่องหนึ่งตัว — ทุกค่ามาจากฟิลด์จริงของเครื่องในฐานข้อมูล
 *  (ไม่มี "activity"/"load" จำลองอีกต่อไป — ผังใหม่ไม่มีการจำลองการเดินเครื่อง) */
export interface InspectionFinding {
  machineId: string;
  machineCode: string;
  machineName: string;
  zoneLabel: string;
  severity: FindingSeverity;
  status: MachineStatus;
  /** ค่าที่บันทึกไว้ล่าสุดในฐานข้อมูล (องศาเซลเซียส) */
  tempC: number;
  /** mm/s RMS ที่บันทึกไว้ล่าสุดในฐานข้อมูล */
  vibration: number;
  healthScore: number | null;
  /** เหตุผลประกอบ (ภาษาไทย) — ว่างเมื่อทุกอย่างปกติ */
  notes: string[];
}

/** รายงานหนึ่งฉบับ (หนึ่งรอบตรวจ) */
export interface InspectionReport {
  id: string;
  scope: InspectionScope;
  /** หัวเรื่อง เช่น "รายงานตรวจสายการผลิต รายชั่วโมง" */
  title: string;
  /** ช่วงเวลาที่ตรวจ */
  periodLabel: string;
  /** เวลาที่ปิดรายงาน (ISO) */
  finishedAt: string;
  /** ใช้เวลาตรวจ (วินาที ตามเวลาจำลอง) */
  durationSec: number;
  checked: number;
  okCount: number;
  watchCount: number;
  alertCount: number;
  /** จำนวนเครื่องทั้งหมดในผัง (จุดตรวจอาจน้อยกว่าเมื่อสุ่มตัวอย่าง) */
  totalMachines: number;
  zones: {
    label: string;
    checked: number;
    watch: number;
    alert: number;
  }[];
  /** เฉพาะจุดที่ไม่ปกติ เรียงจากหนักไปเบา */
  findings: InspectionFinding[];
  /** พาดหัวหนึ่งบรรทัด */
  headline: string;
  /** ข้อเสนอแนะ */
  recommendations: string[];
}

/** บรรทัดหนึ่งในบันทึกการเดินตรวจ (แสดงเป็นแชตสด) */
export interface InspectorLogEntry {
  id: string;
  /** วินาทีตามเวลาจำลองนับจากเริ่มรอบ */
  at: number;
  kind: "route" | "check" | "watch" | "alert" | "report";
  text: string;
}

/** ภาพนิ่งของหุ่นยนต์ + บันทึก + รายงาน ณ ขณะหนึ่ง */
export interface InspectorSnapshot {
  phase: InspectorPhase;
  running: boolean;
  /** พิกัดหุ่นยนต์ (เมตร) */
  x: number;
  z: number;
  /** มุมหันหน้า (เรเดียน) */
  yaw: number;
  /** 0..1 เฟสแอนิเมชันการก้าวเดิน (ใช้ขยับขา/ตัว) */
  stride: number;
  /** ระยะทางรวมที่เดินไปแล้ว (เมตร) */
  distance: number;
  /** ลำดับจุดตรวจปัจจุบัน (1-based, 0 = ยังไม่เริ่ม) */
  stopNumber: number;
  totalStops: number;
  currentMachine: Machine | null;
  /** 0..1 ความคืบหน้าของการตรวจจุดปัจจุบัน */
  dwellProgress: number;
  /** ข้อความในบอลลูนเหนือหัวหุ่นยนต์ (null = ไม่แสดง) */
  bubble: string | null;
  /**
   * ชุด waypoint ของช่วงที่กำลังเดินอยู่ (ตามโครงข่ายทางเดิน) สำหรับวาดเส้น
   * เส้นทางบนพื้น — identity ของอาร์เรย์เปลี่ยนเมื่อเปลี่ยนจุดหมายเท่านั้น
   * ผู้วาดจึงเช็ค identity เพื่อรู้ว่าต้องอัปเดตรูปเส้นได้เลย
   */
  plannedPath: readonly NavPoint[];
  /** ดัชนี waypoint ที่กำลังมุ่งหน้าไปใน `plannedPath` */
  pathIndex: number;
  /** วินาทีตามเวลาจำลองนับจากเริ่มรอบ */
  elapsed: number;
  log: InspectorLogEntry[];
  /** ผลตรวจของรอบที่กำลังเดิน */
  findings: InspectionFinding[];
  /** รายงานที่ปิดแล้ว ใหม่สุดอยู่ท้าย */
  reports: InspectionReport[];
  scope: InspectionScope;
}

export interface InspectionAgent {
  /** เดินเวลาไป dt วินาที (จำกัดค่าภายใน) — ให้ scene เรียกจาก render loop */
  step(dt: number): void;
  /** ภาพนิ่งภายใน — อ่านได้เท่านั้น ห้ามแก้ */
  snapshot(): InspectorSnapshot;
  /** เริ่มรอบตรวจใหม่ */
  start(scope?: InspectionScope): void;
  /** หยุดกลางทาง (คงบันทึกและรายงานเดิมไว้) */
  stop(): void;
  /** ล้างบันทึก/รายงานทั้งหมดกลับไปที่จุดตั้งต้น */
  reset(): void;
  /** ตัวคูณความเร็ว (1 = ปกติ) */
  setSpeedScale(scale: number): void;
  /** true = จบรอบแล้วเริ่มรอบใหม่เองอัตโนมัติ */
  setAutoLoop(auto: boolean): void;
  /** ผังเปลี่ยน (ข้อมูลเครื่องจักรรีเฟรช) — วางแผนเส้นทางใหม่ */
  setLayout(layout: PlantLayout): void;
  /** เส้นทางที่วางไว้ (อ่านเท่านั้น) */
  route(): readonly InspectionStop[];
}

export interface InspectionAgentOptions {
  /** จำนวนจุดตรวจสูงสุดต่อรอบ (กันรอบยาวเกินไปบนผังใหญ่) */
  maxStops?: number;
  /** ความเร็วเดิน (เมตร/วินาที) ที่ตัวคูณ 1 */
  walkSpeed?: number;
  /** เวลายืนตรวจต่อเครื่อง (วินาที) ที่ตัวคูณ 1 */
  dwellSeconds?: number;
  /** ระยะพักระหว่างจบรอบกับเริ่มรอบใหม่ (วินาที) เมื่อเปิด autoLoop */
  loopPauseSeconds?: number;
}

// ---------------------------------------------------------------------------
// ค่าคงที่
// ---------------------------------------------------------------------------

const DEFAULT_MAX_STOPS = 24;
/**
 * เดิมตั้งไว้ 7 ม./วินาที (ดูคอมเมนต์ `layoutSpeedScale` ใน
 * `createInspectionAgent` — ค่านี้คือ "ความเร็วอ้างอิง" ก่อนคูณด้วย
 * `layoutSpeedScale` ตามขนาดผังจริง) ผู้ใช้แจ้งว่าหลังแก้บั๊กแล้วเดินเร็วไป
 * นิดหน่อย จึงลดลงเหลือ 5.5 (~21%) เป็นการลดทอนคงที่ ไม่ผูกกับขนาดผัง — คูณ
 * กับ `layoutSpeedScale` เหมือนเดิม จึงยังคงสัดส่วนความเร็วระหว่างปุ่ม x1/x2/x4
 * (`speedScale`) และระหว่างผังเล็ก/ใหญ่ไว้เท่าเดิม เปลี่ยนแค่ "ฐาน" ที่ทุกอย่าง
 * คูณทับ
 */
const DEFAULT_WALK_SPEED = 5.5;
const DEFAULT_DWELL = 1.7;
const DEFAULT_LOOP_PAUSE = 6;

/** ระยะจากขอบเครื่องถึงจุดที่หุ่นยนต์ยืน (เมตร) */
const STAND_CLEARANCE = 1.15;
/** ระยะจากขอบเครื่องถึงแนวทางเดินที่ใช้สัญจร (เมตร) */
const LANE_CLEARANCE = 2.9;
/** ระยะที่ถือว่าถึงจุดหมายแล้ว (เมตร) */
const ARRIVE_EPS = 0.12;
/** ความเร็วหันตัวสูงสุด (เรเดียน/วินาที) */
const TURN_RATE = 4.2;
/** เพดาน dt ต่อหนึ่ง step กัน tab-switch แล้วหุ่นกระโดดข้ามผัง */
const MAX_DT = 0.25;
/** จำนวนบรรทัดบันทึกที่เก็บไว้ (เก่าสุดถูกตัดออก) */
const LOG_LIMIT = 120;
/** จำนวนรายงานที่เก็บไว้ */
const REPORT_LIMIT = 12;
/** ความหนาของ "กากบาททางเดินกลางโรง" ที่ใช้ประมาณทางเดินในโรง (ดู `navStripsFor`) */
const HALL_CROSS_THICKNESS = 4;
/** ความหนาของทางเดินนอกอาคาร (`site.walkways`) — คงที่ตามที่ `PlantEnvironment.tsx` ใช้วาด (`kit.walkway(len, 2.8)`) */
const WALKWAY_THICKNESS = 2.8;

const STATUS_LABELS: Record<MachineStatus, string> = {
  normal: "ปกติ",
  warning: "เฝ้าระวัง",
  error: "ขัดข้อง",
  maintenance: "ซ่อมบำรุง",
};

/** ลำดับความสำคัญในการเลือกจุดตรวจ: ขัดข้องก่อน แล้วซ่อมบำรุง แล้วเฝ้าระวัง */
const STATUS_PRIORITY: Record<MachineStatus, number> = {
  error: 0,
  maintenance: 1,
  warning: 2,
  normal: 3,
};

const SEVERITY_ORDER: Record<FindingSeverity, number> = { alert: 0, watch: 1, ok: 2 };

/** อาร์เรย์ว่างก้อนเดียวที่ใช้ร่วมกัน — ไม่ allocate ทุก step ตอนไม่มีเส้นทาง */
const EMPTY_PATH: readonly NavPoint[] = [];

// ---------------------------------------------------------------------------
// ตัวช่วย
// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** ผลต่างมุมสองค่าในช่วง -PI..PI (สำหรับหันตัวทางที่สั้นสุด) */
function shortestAngle(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function machineLabel(machine: Machine): string {
  return machine.code || machine.name || "ไม่ระบุรหัส";
}

function fmt(value: number, digits = 1): string {
  return value.toFixed(digits);
}

const TH_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** "19 ส.ค. 2569 14:32" — ปี พ.ศ. */
function thaiDateTime(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543} ${hh}:${mm}`;
}

/** ป้ายช่วงเวลาของรายงานตาม scope */
function periodLabelFor(scope: InspectionScope, now: Date): string {
  const datePart = `${now.getDate()} ${TH_MONTHS[now.getMonth()]} ${now.getFullYear() + 543}`;
  if (scope === "hourly") {
    const from = new Date(now);
    from.setMinutes(0, 0, 0);
    const to = new Date(from);
    to.setHours(to.getHours() + 1);
    const hh = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:00`;
    return `${datePart} ${hh(from)}–${hh(to)}`;
  }
  if (scope === "daily") {
    return `${datePart} (สรุปทั้งวัน)`;
  }
  return `ณ ${thaiDateTime(now)}`;
}

// ---------------------------------------------------------------------------
// การวางแผนเส้นทาง
// ---------------------------------------------------------------------------

/**
 * จุดยืนตรวจของเครื่องหนึ่งตัว
 *
 * `machine.rotationY` ทำให้เครื่องหันหน้าไปทางหนึ่งเสมอ (ตาม `buildPlantLayout`)
 * ดังนั้นทิศ "ด้านหน้าเครื่อง" คือ (sin, cos) ของมุมนั้น และด้านตรงข้ามคือด้าน
 * ที่หุ่นยนต์ควรยืน — หุ่นยนต์จึงยืนด้านหลังแล้วหันหน้ากลับเข้าหาเครื่อง
 * เพื่อไม่ไปยืนทับตัวเครื่อง
 */
function standPointFor(machine: PlacedMachine): {
  standX: number;
  standZ: number;
  laneX: number;
  laneZ: number;
  facing: number;
} {
  const nx = -Math.sin(machine.rotationY);
  const nz = -Math.cos(machine.rotationY);
  const half = Math.max(machine.depth, machine.width) / 2;
  return {
    standX: machine.x + nx * (half + STAND_CLEARANCE),
    standZ: machine.z + nz * (half + STAND_CLEARANCE),
    laneX: machine.x + nx * (half + LANE_CLEARANCE),
    laneZ: machine.z + nz * (half + LANE_CLEARANCE),
    // หันกลับเข้าหาเครื่อง = ทิศตรงข้ามกับ normal ที่ใช้ถอยออกมา
    facing: Math.atan2(-nx, -nz),
  };
}

/**
 * เลือกจุดตรวจและจัดลำดับเส้นทาง
 *
 * ผังจริงมีเครื่องหลายร้อยตัว ถ้าเดินทุกตัวรอบหนึ่งจะยาวเกินกว่าจะดูรู้เรื่อง
 * ในการนำเสนอ จึงเลือกแบบ "ของสำคัญต้องครบ": ทุกเครื่องที่สถานะไม่ปกติเข้า
 * เส้นทางก่อนทั้งหมด แล้วเติมเครื่องปกติแบบกระจายทุกโซนจนครบโควตา จากนั้น
 * จัดลำดับเดินตามโซน -> ไลน์ -> รหัสเครื่อง เพื่อให้เส้นทางดูเป็นระบบ
 * ไม่ใช่วิ่งข้ามโรงไปกลับ (ผังใหม่ไม่มี `indexInLine` — ใช้รหัสเครื่อง/ชื่อ
 * แทนเป็นตัวจัดลำดับรอง)
 */
function planRoute(layout: PlantLayout, maxStops: number): InspectionStop[] {
  const machines = layout.machines;
  if (machines.length === 0) return [];

  const zoneLabel = new Map(layout.site.zones.map((z) => [z.id, z.name]));

  const abnormal: PlacedMachine[] = [];
  const normalByZone = new Map<string, PlacedMachine[]>();
  for (const pm of machines) {
    if (pm.machine.status === "normal") {
      const list = normalByZone.get(pm.zoneId);
      if (list) list.push(pm);
      else normalByZone.set(pm.zoneId, [pm]);
    } else {
      abnormal.push(pm);
    }
  }

  abnormal.sort((a, b) => {
    const p = STATUS_PRIORITY[a.machine.status] - STATUS_PRIORITY[b.machine.status];
    if (p !== 0) return p;
    return machineLabel(a.machine).localeCompare(machineLabel(b.machine), "th");
  });

  const picked: PlacedMachine[] = abnormal.slice(0, maxStops);

  // เติมเครื่องปกติแบบวนรอบทุกโซน (round-robin) ให้รายงานครอบคลุมทุกโรง
  // ไม่ใช่กระจุกอยู่โซนแรก
  if (picked.length < maxStops) {
    const zoneIds = [...normalByZone.keys()].sort();
    let cursor = 0;
    let exhausted = 0;
    while (picked.length < maxStops && zoneIds.length > 0 && exhausted < zoneIds.length) {
      const zoneId = zoneIds[cursor % zoneIds.length];
      const list = normalByZone.get(zoneId);
      if (list && list.length > 0) {
        picked.push(list.shift() as PlacedMachine);
        exhausted = 0;
      } else {
        exhausted += 1;
      }
      cursor += 1;
    }
  }

  // จัดลำดับการเดินให้เป็นระบบ: โซน -> ไลน์ -> รหัส/ชื่อเครื่อง
  picked.sort((a, b) => {
    if (a.zoneId !== b.zoneId) return a.zoneId.localeCompare(b.zoneId);
    if (a.lineId !== b.lineId) return a.lineId.localeCompare(b.lineId);
    return machineLabel(a.machine).localeCompare(machineLabel(b.machine), "th");
  });

  return picked.map((pm) => ({
    machine: pm.machine,
    zoneId: pm.zoneId,
    zoneLabel: zoneLabel.get(pm.zoneId) ?? pm.zoneId,
    ...standPointFor(pm),
  }));
}

/**
 * แปลง `PlantLayout` ให้เป็นแถบที่เดินได้จริง (`NavStrip[]`) สำหรับ
 * `buildNavGraph` — ผังใหม่ (`buildPlantLayout`) ไม่มี aisle/road ที่เป็น
 * "แถบพื้นที่เดินได้" ล้วนๆ เหมือน `FloorLayout` เดิม (ทางเดินในโรงจริงตาม
 * แนวไลน์ผลิตถูกวาดตรงใน `PlantEnvironment.tsx` เท่านั้น ไม่ได้ส่งออกมาเป็น
 * ข้อมูล) จึงประมาณทางเดินภายในโรงด้วย "กากบาททางเดินกลางโรง" หนึ่งคู่
 * (แนวนอน+แนวตั้งผ่านกึ่งกลางโรงพอดี) แล้วต่อกับถนน/ทางเดินจริงของไซต์
 * (`site.roads`, `site.walkways`) ด้วยสะพานอัตโนมัติของ `buildNavGraph`
 *
 * ข้อจำกัดที่ยอมรับไว้ (เทียบกับผังเดิม): หุ่นยนต์อาจเดินตัดพื้นที่โล่งระหว่าง
 * กากบาทกลางโรงกับจุดยืนตรวจเครื่อง แทนที่จะเดินตามทางเดินจริงข้างไลน์ผลิต
 * ทุกช่วง — ยังคงเลี้ยวเป็นมุมฉากและไม่ทะลุกำแพง/ถนนนอกไซต์ แต่ความสมจริง
 * ของเส้นทางในโรงต่ำกว่าผังเดิมเล็กน้อย
 */
function navStripsFor(layout: PlantLayout): NavStrip[] {
  const strips: NavStrip[] = [];
  const { w, d } = layout.hall;
  strips.push({ x: 0, z: 0, width: w, depth: HALL_CROSS_THICKNESS, horizontal: true });
  strips.push({ x: 0, z: 0, width: HALL_CROSS_THICKNESS, depth: d, horizontal: false });
  for (const road of layout.site.roads) {
    strips.push(
      road.dir === "x"
        ? { x: road.x, z: road.z, width: road.len, depth: road.w, horizontal: true }
        : { x: road.x, z: road.z, width: road.w, depth: road.len, horizontal: false }
    );
  }
  for (const wk of layout.site.walkways) {
    strips.push(
      wk.dir === "x"
        ? { x: wk.x, z: wk.z, width: wk.len, depth: WALKWAY_THICKNESS, horizontal: true }
        : { x: wk.x, z: wk.z, width: WALKWAY_THICKNESS, depth: wk.len, horizontal: false }
    );
  }
  return strips;
}

// ---------------------------------------------------------------------------
// การประเมินผลตรวจ
// ---------------------------------------------------------------------------

/**
 * ประเมินเครื่องหนึ่งตัวจากค่าที่บันทึกไว้ล่าสุดในฐานข้อมูล
 *
 * ผังใหม่ไม่มีการจำลองการเดินเครื่อง (`floorSimulation.ts` ถูกลบทิ้งไปพร้อม
 * ผังเก่า) จึงอ่านค่าอุณหภูมิ/ความสั่นจากฟิลด์จริงของเครื่องโดยตรง แทนที่จะ
 * มีค่า "สด" ที่วิ่งอยู่ในฉากให้ถอยกลับไปใช้ — เกณฑ์ตัดสินทุกตัวยังคงมาจาก
 * `lib/thresholds` ตัวเดียวกับที่หน้าอื่นใช้ จะได้ไม่เกิดกรณี
 * "หน้านี้ว่าเฝ้าระวัง หน้านั้นว่าปกติ"
 */
function evaluate(stop: InspectionStop): InspectionFinding {
  const machine = stop.machine;
  const tempC = machine.spindleTemp ?? 0;
  const vibration = machine.vibrationMms ?? 0;

  const notes: string[] = [];
  let severity: FindingSeverity = "ok";
  const raise = (level: FindingSeverity) => {
    if (SEVERITY_ORDER[level] < SEVERITY_ORDER[severity]) severity = level;
  };

  if (machine.activeErrorCode) {
    raise("alert");
    notes.push(
      `มีรหัสข้อผิดพลาดค้างอยู่ ${machine.activeErrorCode}${
        machine.activeErrorDesc ? ` — ${machine.activeErrorDesc}` : ""
      }`
    );
  }

  if (machine.status === "error") {
    raise("alert");
    notes.push("สถานะในระบบเป็น ขัดข้อง");
  } else if (machine.status === "maintenance") {
    raise("watch");
    notes.push("อยู่ระหว่างซ่อมบำรุง — ยังไม่กลับเข้าสายการผลิต");
  } else if (machine.status === "warning") {
    raise("watch");
    notes.push("สถานะในระบบเป็น เฝ้าระวัง");
  }

  if (tempC >= SPINDLE_TEMP_ERROR) {
    raise("alert");
    notes.push(`อุณหภูมิสปินเดิล ${fmt(tempC)}°C เกินขีดหยุดเครื่อง (${SPINDLE_TEMP_ERROR}°C)`);
  } else if (tempC >= SPINDLE_TEMP_WARNING) {
    raise("watch");
    notes.push(`อุณหภูมิสปินเดิล ${fmt(tempC)}°C เข้าเขตเฝ้าระวัง (${SPINDLE_TEMP_WARNING}°C)`);
  }

  if (vibration >= VIBRATION_ERROR) {
    raise("alert");
    notes.push(`ความสั่น ${fmt(vibration, 2)} mm/s อยู่ในโซน D ตาม ISO 10816-3`);
  } else if (vibration >= VIBRATION_WARNING) {
    raise("watch");
    notes.push(`ความสั่น ${fmt(vibration, 2)} mm/s หลุดโซน A/B ตาม ISO 10816-3`);
  }

  return {
    machineId: machine.id,
    machineCode: machineLabel(machine),
    machineName: machine.name,
    zoneLabel: stop.zoneLabel,
    severity,
    status: machine.status,
    tempC,
    vibration,
    healthScore: machine.healthScore,
    notes,
  };
}

// ---------------------------------------------------------------------------
// การประกอบรายงาน
// ---------------------------------------------------------------------------

function buildReport(
  scope: InspectionScope,
  findings: InspectionFinding[],
  totalMachines: number,
  durationSec: number,
  serial: number
): InspectionReport {
  const now = new Date();
  const alerts = findings.filter((f) => f.severity === "alert");
  const watches = findings.filter((f) => f.severity === "watch");
  const okCount = findings.length - alerts.length - watches.length;

  const zoneMap = new Map<string, { label: string; checked: number; watch: number; alert: number }>();
  for (const f of findings) {
    const entry = zoneMap.get(f.zoneLabel) ?? {
      label: f.zoneLabel,
      checked: 0,
      watch: 0,
      alert: 0,
    };
    entry.checked += 1;
    if (f.severity === "alert") entry.alert += 1;
    else if (f.severity === "watch") entry.watch += 1;
    zoneMap.set(f.zoneLabel, entry);
  }
  const zones = [...zoneMap.values()].sort(
    (a, b) => b.alert - a.alert || b.watch - a.watch || b.checked - a.checked
  );

  const headline =
    alerts.length > 0
      ? `พบ ${alerts.length} เครื่องที่ต้องเข้าตรวจทันที จากที่ตรวจ ${findings.length} จุด`
      : watches.length > 0
      ? `ไม่พบเครื่องที่ต้องหยุด แต่มี ${watches.length} เครื่องที่ต้องเฝ้าระวัง`
      : `ตรวจ ${findings.length} จุด ทุกจุดอยู่ในเกณฑ์ปกติ`;

  const recommendations: string[] = [];
  if (alerts.length > 0) {
    const top = alerts
      .slice(0, 3)
      .map((f) => f.machineCode)
      .join(", ");
    recommendations.push(
      `เปิดใบสั่งซ่อมด่วนให้ ${top}${alerts.length > 3 ? ` และอีก ${alerts.length - 3} เครื่อง` : ""}`
    );
  }
  const hot = findings.filter((f) => f.tempC >= SPINDLE_TEMP_WARNING);
  if (hot.length > 0) {
    recommendations.push(
      `ตรวจระบบระบายความร้อน/หล่อเย็นของ ${hot.length} เครื่องที่อุณหภูมิสปินเดิลเข้าเขตเฝ้าระวัง`
    );
  }
  const shaky = findings.filter((f) => f.vibration >= VIBRATION_WARNING);
  if (shaky.length > 0) {
    recommendations.push(
      `นัดวัดความสั่นซ้ำและตรวจแบริ่ง/สมดุลของ ${shaky.length} เครื่องที่ค่าความสั่นหลุดเกณฑ์`
    );
  }
  const stuck = findings.filter((f) => f.status === "maintenance");
  if (stuck.length > 0) {
    recommendations.push(`ติดตามงานซ่อมของ ${stuck.length} เครื่องที่ยังไม่กลับเข้าสายการผลิต`);
  }
  if (recommendations.length === 0) {
    recommendations.push("ไม่มีรายการที่ต้องดำเนินการ — เดินตรวจตามรอบปกติต่อไป");
  }

  return {
    id: `report-${serial}`,
    scope,
    title: `รายงานตรวจสายการผลิต ${SCOPE_LABELS[scope]}`,
    periodLabel: periodLabelFor(scope, now),
    finishedAt: now.toISOString(),
    durationSec: Math.round(durationSec),
    checked: findings.length,
    okCount,
    watchCount: watches.length,
    alertCount: alerts.length,
    totalMachines,
    zones,
    findings: [...alerts, ...watches],
    headline,
    recommendations,
  };
}

/**
 * แปลงรายงานเป็นข้อความสำหรับส่งต่อให้ AI Assistant
 *
 * นี่คือจุดต่อไปสู่เวอร์ชันจริง: ตัวเลขทุกตัวในข้อความนี้มาจากผลตรวจจริง
 * (ไม่ได้ให้โมเดลเดา) โมเดลมีหน้าที่แค่เรียบเรียง/ตีความและเสนอขั้นถัดไป
 */
export function reportToPrompt(report: InspectionReport): string {
  const lines: string[] = [];
  lines.push(`ช่วยสรุปและให้คำแนะนำจาก${report.title} ช่วง ${report.periodLabel}`);
  lines.push(
    `ผลรวม: ตรวจ ${report.checked} จุด จากทั้งหมด ${report.totalMachines} เครื่อง — ปกติ ${report.okCount}, เฝ้าระวัง ${report.watchCount}, ต้องเข้าตรวจ ${report.alertCount}`
  );
  if (report.findings.length > 0) {
    lines.push("รายการที่ไม่ปกติ:");
    for (const f of report.findings) {
      lines.push(
        `- ${f.machineCode} (${f.zoneLabel}) ระดับ${SEVERITY_LABELS[f.severity]} สถานะ${
          STATUS_LABELS[f.status]
        } อุณหภูมิ ${fmt(f.tempC)}°C ความสั่น ${fmt(f.vibration, 2)} mm/s${
          f.notes.length > 0 ? ` — ${f.notes.join("; ")}` : ""
        }`
      );
    }
  } else {
    lines.push("ไม่พบรายการที่ไม่ปกติในรอบนี้");
  }
  return lines.join("\n");
}

/** แปลงรายงานเป็นข้อความล้วน (สำหรับปุ่มคัดลอก) */
export function reportToText(report: InspectionReport): string {
  const lines: string[] = [
    report.title,
    `ช่วงเวลา: ${report.periodLabel}`,
    report.headline,
    "",
    `ตรวจ ${report.checked} จุด — ปกติ ${report.okCount} / เฝ้าระวัง ${report.watchCount} / ต้องเข้าตรวจ ${report.alertCount}`,
    "",
    "แยกตามโซน:",
    ...report.zones.map(
      (z) => `- ${z.label}: ตรวจ ${z.checked} จุด, เฝ้าระวัง ${z.watch}, ต้องเข้าตรวจ ${z.alert}`
    ),
  ];
  if (report.findings.length > 0) {
    lines.push("", "รายการที่ไม่ปกติ:");
    for (const f of report.findings) {
      lines.push(
        `- [${SEVERITY_LABELS[f.severity]}] ${f.machineCode} · ${f.zoneLabel} · ${fmt(
          f.tempC
        )}°C · ${fmt(f.vibration, 2)} mm/s`
      );
      for (const note of f.notes) lines.push(`    · ${note}`);
    }
  }
  lines.push("", "ข้อเสนอแนะ:", ...report.recommendations.map((r) => `- ${r}`));
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// ตัวหุ่นยนต์
// ---------------------------------------------------------------------------

/**
 * สร้างหุ่นยนต์ตรวจหนึ่งตัว
 *
 * ออกแบบตามแบบเดียวกับ `createFloorSimulation`: state ก้อนเดียวที่ถูกแก้ในที่,
 * `step(dt)` ที่ไม่ allocate ต่อเฟรม และ `snapshot()` ที่คืนอ็อบเจกต์เดิมเสมอ
 * ผู้เรียกจึงต้องอ่านผ่าน `snapshot().<field>` ทุกครั้ง ไม่ใช่เก็บ reference
 * ของ field ไว้ใช้ข้ามเฟรม
 */
export function createInspectionAgent(
  layout: PlantLayout,
  options?: InspectionAgentOptions
): InspectionAgent {
  const maxStops = Math.max(1, options?.maxStops ?? DEFAULT_MAX_STOPS);
  const baseWalk = options?.walkSpeed ?? DEFAULT_WALK_SPEED;
  const baseDwell = options?.dwellSeconds ?? DEFAULT_DWELL;
  const loopPause = options?.loopPauseSeconds ?? DEFAULT_LOOP_PAUSE;

  let currentLayout = layout;
  /**
   * โครงข่ายทางเดินของผังปัจจุบัน — สร้างครั้งเดียวต่อผัง (ไม่ใช่ต่อรอบตรวจ
   * และไม่ใช่ต่อเฟรม) หุ่นยนต์เดินตามกราฟนี้เท่านั้น จึงเลี้ยวเป็นมุมฉากไป
   * ตามทางเดิน/ถนน ไม่ตัดตรงทะลุแท่นเครื่อง (ดู `navStripsFor` — ผังใหม่
   * ประมาณทางเดินในโรงด้วยกากบาทกลางโรง แทนแถบทางเดินจริงตามแนวไลน์)
   */
  let navGraph: NavGraph | null = buildNavGraph(navStripsFor(currentLayout));
  let route: InspectionStop[] = planRoute(currentLayout, maxStops);
  let totalMachines = currentLayout.machines.length;
  /**
   * ตัวคูณความเร็วเดินตามขนาดผังจริง — เหตุผลที่หุ่นยนต์ "ดูเหมือนไม่ขยับเลย"
   * บนฐานข้อมูลจริง (973 เครื่องจักร) ทั้งที่ `phase === "walking"` และพิกัด
   * เปลี่ยนทุกเฟรมจริง (ยืนยันด้วยการจำลอง step() ตรงๆ): `DEFAULT_WALK_SPEED`
   * (7 ม./วินาที) ถูกตั้งไว้สำหรับผังอ้างอิง (94.3x74.3 ม.) แต่
   * `buildPlantLayout` ขยายห้องโถงตามจำนวน/ความหนาแน่นเครื่องจักรจริงแบบไม่
   * เท่ากันทั้งสองแกน (ดูคอมเมนต์ที่ `LiveFloorView.tsx` เรียก `plantLayout.ts`
   * — ผัง 973 เครื่องจริงขยายเป็นหลักร้อยถึงเกือบพันเมตรต่อแกน) เดินด้วย
   * ความเร็วอ้างอิงเฉยๆ แปลว่าไปจุดตรวจแรกจุดเดียวอาจกินเวลาเป็นนาที —
   * ระยะที่ขยับต่อเฟรมเล็กจนมองไม่ออกเทียบกับพื้นที่ทั้งไซต์ที่กล้องเห็น จึง
   * คูณความเร็วเดินตามอัตราขยายจริงของผัง (`scale.factor`) ให้รอบตรวจยังคง
   * ใช้เวลาใกล้เคียงกับผังอ้างอิงไม่ว่าฐานข้อมูลจะมีเครื่องจักรกี่ตัว —
   * สอดคล้องกับที่ความเร็วอ้างอิงเองก็ไม่ใช่ความเร็วเดินจริงของคนอยู่แล้ว
   * (คนเดินจริง ~1.4 ม./วินาที) นี่คือแอนิเมชันของ digital twin ไม่ใช่การ
   * จำลองฟิสิกส์ตรงตัว
   */
  let layoutSpeedScale = currentLayout.scale.factor;

  /**
   * จุดตั้งต้น/จุดกลับมาสรุปรายงาน — ผังใหม่ไม่มีอาคาร/ป้ายชื่อโรงเป็นข้อมูล
   * แยกต่างหาก (ไม่มี `FloorBuilding`/prop "sign" อีกต่อไป) จึงใช้ขอบของโซน
   * ที่มีเครื่องจักรมากที่สุด (`site.zones`) แทน — ยืนอยู่ริมโซนนั้น หันเข้า
   * หาตัวโซน
   */
  let homeX = 0;
  let homeZ = 0;
  /** ทิศที่หุ่นหันตอนอยู่บ้าน */
  let homeYaw = 0;
  function recomputeHome() {
    // โซนที่มีเครื่องจักรเยอะที่สุดในผังปัจจุบัน
    const counts = new Map<string, number>();
    for (const m of currentLayout.machines) {
      counts.set(m.zoneId, (counts.get(m.zoneId) ?? 0) + 1);
    }
    let bestZoneId: string | null = null;
    let bestCount = 0;
    for (const [id, count] of counts) {
      if (count > bestCount) {
        bestCount = count;
        bestZoneId = id;
      }
    }
    const zone = bestZoneId
      ? currentLayout.site.zones.find((z) => z.id === bestZoneId) ?? null
      : null;

    if (zone) {
      homeX = zone.x;
      homeZ = zone.z + zone.d / 2 + 3; // ยืนถัดจากขอบโซนเล็กน้อย
      homeYaw = Math.PI; // หันกลับเข้าหาโซน
    } else {
      // ไม่มีเครื่องจักรเลย (ผังว่าง) — สำรองกลับไปที่ขอบโรงหน้าประตูเหมือนเดิม
      homeX = 0;
      homeZ = currentLayout.hall.d / 2 + 6;
      homeYaw = Math.PI;
    }
    // ดึงจุดตั้งต้นเข้ามาอยู่บนโครงข่ายทางเดิน (ถนน/ทางเดินหน้าโรง) — ถ้าปล่อยให้
    // ลอยอยู่กลางลานหญ้า ทั้งขาออกและขากลับจะเริ่ม/จบด้วยการเดินตัดพื้นที่
    // ที่ไม่ใช่ทางเดิน ซึ่งเป็นอาการเดียวกับที่กราฟนี้มีไว้เพื่อกำจัด
    const node = navGraph?.nearest(homeX, homeZ) ?? -1;
    if (node >= 0 && navGraph) {
      homeX = navGraph.nodes[node].x;
      homeZ = navGraph.nodes[node].z;
    }
  }
  recomputeHome();

  // สถานะภายใน
  let phase: InspectorPhase = "idle";
  let running = false;
  let scope: InspectionScope = "hourly";
  let speedScale = 1;
  let autoLoop = false;

  let x = homeX;
  let z = homeZ;
  let yaw = homeYaw;
  let stride = 0;
  let distance = 0;

  let stopIndex = -1;
  let legs: { x: number; z: number }[] = [];
  let legIndex = 0;
  let dwellLeft = 0;
  let pauseLeft = 0;
  let elapsed = 0;
  let bubble: string | null = null;

  let log: InspectorLogEntry[] = [];
  let findings: InspectionFinding[] = [];
  let reports: InspectionReport[] = [];
  let logSerial = 0;
  let reportSerial = 0;

  // อ็อบเจกต์ snapshot เดียวที่ถูกเขียนทับทุก step (ไม่ allocate ต่อเฟรม)
  const snap: InspectorSnapshot = {
    phase,
    running,
    x,
    z,
    yaw,
    stride,
    distance,
    stopNumber: 0,
    totalStops: route.length,
    currentMachine: null,
    dwellProgress: 0,
    bubble: null,
    plannedPath: legs,
    pathIndex: 0,
    elapsed: 0,
    log,
    findings,
    reports,
    scope,
  };

  function writeSnapshot(): void {
    snap.phase = phase;
    snap.running = running;
    snap.x = x;
    snap.z = z;
    snap.yaw = yaw;
    snap.stride = stride;
    snap.distance = distance;
    snap.stopNumber = stopIndex >= 0 ? stopIndex + 1 : 0;
    snap.totalStops = route.length;
    snap.currentMachine =
      stopIndex >= 0 && stopIndex < route.length ? route[stopIndex].machine : null;
    snap.dwellProgress =
      phase === "inspecting" && baseDwell > 0 ? clamp(1 - dwellLeft / baseDwell, 0, 1) : 0;
    snap.bubble = bubble;
    // เส้นเส้นทางแสดงเฉพาะตอนที่ยังเดินอยู่ — ระหว่างยืนตรวจหรือจบรอบแล้ว
    // เส้นค้างอยู่บนพื้นจะอ่านว่า "ยังจะไปที่นั่น" ซึ่งไม่จริง
    const showPath = phase === "walking" || phase === "reporting";
    snap.plannedPath = showPath ? legs : EMPTY_PATH;
    snap.pathIndex = showPath ? legIndex : 0;
    snap.elapsed = elapsed;
    snap.log = log;
    snap.findings = findings;
    snap.reports = reports;
    snap.scope = scope;
  }

  function pushLog(kind: InspectorLogEntry["kind"], text: string) {
    logSerial += 1;
    log.push({ id: `log-${logSerial}`, at: elapsed, kind, text });
    if (log.length > LOG_LIMIT) log = log.slice(log.length - LOG_LIMIT);
  }

  /**
   * ตั้งเส้นทางเดินไปยังจุดตรวจลำดับ `index`
   *
   * เส้นทางมาจากโครงข่ายทางเดิน (`navGraph`) แล้วต่อท้ายด้วยสองจุดสุดท้าย:
   * จุดขึ้นจากทางเดินเข้าหาเครื่อง (`lane*`) และจุดยืนตรวจ (`stand*`) —
   * ช่วงสั้น ๆ นี้ตั้งใจให้เป็นเส้นตรง เพราะตรงกับความจริงที่คนต้องก้าวออก
   * จากทางเดินเข้าไปหาแผงควบคุม
   */
  function routeToStop(index: number) {
    const stop = route[index];
    const lane: NavPoint = { x: stop.laneX, z: stop.laneZ };
    legs = [...routeBetween(navGraph, { x, z }, lane), { x: stop.standX, z: stop.standZ }];
    legIndex = 0;
    phase = "walking";
    bubble = `กำลังไป ${machineLabel(stop.machine)}`;
  }

  function beginRound() {
    log = [];
    logSerial = 0;
    findings = [];
    elapsed = 0;
    distance = 0;
    stopIndex = -1;
    dwellLeft = 0;
    pauseLeft = 0;
    route = planRoute(currentLayout, maxStops);
    totalMachines = currentLayout.machines.length;

    if (route.length === 0) {
      // ผังยังไม่มีเครื่องจักร (เช่น ข้อมูลจาก DB ยังโหลดไม่เสร็จตอนกดเริ่ม) —
      // ค้างไว้ที่ "idle" แทน "done" โดยตั้งใจไม่แตะ `running`: setLayout()
      // ด้านล่างจะเห็น phase "idle" + running ค้างจริง แล้วเรียก beginRound()
      // ซ้ำเองทันทีที่ผังจริงมาถึง ไม่ต้องให้ผู้ใช้กดเริ่มซ้ำ — ถ้าเซ็ต "done"
      // เหมือนเดิม รอบจะค้างตายถาวรเพราะ setLayout() วางแผนใหม่ให้เฉพาะตอน
      // phase เป็น "idle" เท่านั้น
      phase = "idle";
      bubble = "รอข้อมูลเครื่องจักร…";
      pushLog("route", "ยังไม่มีข้อมูลเครื่องจักรในผัง — รอข้อมูลก่อนเริ่มตรวจ");
      return;
    }

    pushLog(
      "route",
      `เริ่มรอบตรวจ${SCOPE_LABELS[scope]} — วางแผน ${route.length} จุดตรวจ จากเครื่องจักรทั้งหมด ${totalMachines} เครื่อง`
    );
    const zoneCount = new Set(route.map((s) => s.zoneId)).size;
    pushLog("route", `ครอบคลุม ${zoneCount} โซน เรียงลำดับตามโซนและไลน์ผลิต`);
    stopIndex = 0;
    routeToStop(0);
  }

  /** ตรวจเครื่องที่จุดปัจจุบันแล้วบันทึกผล */
  function inspectCurrent() {
    const stop = route[stopIndex];
    const finding = evaluate(stop);
    findings.push(finding);

    const head = `${finding.machineCode} · ${stop.zoneLabel}`;
    if (finding.severity === "alert") {
      pushLog("alert", `${head} — ต้องเข้าตรวจ: ${finding.notes[0] ?? "พบความผิดปกติ"}`);
      bubble = `${finding.machineCode} ต้องเข้าตรวจ`;
    } else if (finding.severity === "watch") {
      pushLog("watch", `${head} — เฝ้าระวัง: ${finding.notes[0] ?? "ค่าเข้าเขตเฝ้าระวัง"}`);
      bubble = `${finding.machineCode} เฝ้าระวัง`;
    } else {
      pushLog(
        "check",
        `${head} — ปกติ (${fmt(finding.tempC)}°C, ${fmt(finding.vibration, 2)} mm/s)`
      );
      bubble = `${finding.machineCode} ปกติ`;
    }
  }

  function finishRound() {
    reportSerial += 1;
    const report = buildReport(scope, findings, totalMachines, elapsed, reportSerial);
    reports.push(report);
    if (reports.length > REPORT_LIMIT) reports = reports.slice(reports.length - REPORT_LIMIT);
    pushLog("report", `ปิดรอบตรวจ — ${report.headline}`);
    phase = "done";
    bubble = null;
    if (autoLoop) {
      pauseLeft = loopPause;
    } else {
      running = false;
    }
  }

  /** เดินเข้าหาเป้าหมายปัจจุบัน คืน true เมื่อถึงจุดสุดท้ายของ legs แล้ว */
  function advanceAlongLegs(dt: number): boolean {
    const speed = baseWalk * speedScale * layoutSpeedScale;
    let budget = speed * dt;

    while (budget > 0 && legIndex < legs.length) {
      const target = legs[legIndex];
      const dx = target.x - x;
      const dz = target.z - z;
      const dist = Math.hypot(dx, dz);

      // เป้าหมายพัง (NaN/Infinity จากผังเสื่อมสภาพ) หรือถึงจุดหมายแล้ว —
      // ข้ามไปเลยแทนที่จะปล่อยให้เดินค้าง เดินตรวจต้องไม่มีวันหยุดกลางทาง
      if (!Number.isFinite(dist) || dist <= ARRIVE_EPS) {
        legIndex += 1;
        continue;
      }

      // หันตัวไปทางที่จะเดินก่อน (จำกัดความเร็วหัน จะได้ไม่หมุนติ้ว)
      const want = Math.atan2(dx, dz);
      const delta = shortestAngle(yaw, want);
      const maxTurn = TURN_RATE * dt * Math.max(1, speedScale);
      yaw += clamp(delta, -maxTurn, maxTurn);

      const move = Math.min(budget, dist);
      x += (dx / dist) * move;
      z += (dz / dist) * move;
      distance += move;
      stride = (stride + move / 1.6) % 1;
      budget -= move;
    }

    return legIndex >= legs.length;
  }

  function step(dt: number) {
    const d = clamp(dt, 0, MAX_DT);
    if (d <= 0 || !running) {
      writeSnapshot();
      return;
    }

    elapsed += d * speedScale;

    switch (phase) {
      case "walking": {
        if (advanceAlongLegs(d)) {
          phase = "inspecting";
          dwellLeft = baseDwell;
          const stop = route[stopIndex];
          yaw = stop.facing;
          bubble = `กำลังอ่านค่า ${machineLabel(stop.machine)}`;
        }
        break;
      }
      case "inspecting": {
        dwellLeft -= d * speedScale;
        stride = 0;
        if (dwellLeft <= 0) {
          inspectCurrent();
          if (stopIndex + 1 < route.length) {
            stopIndex += 1;
            routeToStop(stopIndex);
          } else {
            phase = "reporting";
            legs = routeBetween(navGraph, { x, z }, { x: homeX, z: homeZ });
            legIndex = 0;
            bubble = "ตรวจครบทุกจุด — กำลังเรียบเรียงรายงาน";
          }
        }
        break;
      }
      case "reporting": {
        if (advanceAlongLegs(d)) finishRound();
        break;
      }
      case "done": {
        stride = 0;
        if (autoLoop) {
          pauseLeft -= d * speedScale;
          if (pauseLeft <= 0) beginRound();
        }
        break;
      }
      case "idle":
      default:
        break;
    }

    writeSnapshot();
  }

  return {
    step,
    snapshot: () => snap,
    start(nextScope) {
      if (nextScope) scope = nextScope;
      running = true;
      beginRound();
      writeSnapshot();
    },
    stop() {
      running = false;
      phase = findings.length > 0 ? "done" : "idle";
      bubble = null;
      pushLog("route", "หยุดรอบตรวจกลางทางตามคำสั่งผู้ใช้");
      writeSnapshot();
    },
    reset() {
      running = false;
      phase = "idle";
      log = [];
      findings = [];
      reports = [];
      logSerial = 0;
      elapsed = 0;
      distance = 0;
      stopIndex = -1;
      bubble = null;
      x = homeX;
      z = homeZ;
      yaw = homeYaw;
      writeSnapshot();
    },
    setSpeedScale(scale) {
      speedScale = clamp(scale, 0.25, 8);
    },
    setAutoLoop(auto) {
      autoLoop = auto;
    },
    setLayout(nextLayout) {
      currentLayout = nextLayout;
      navGraph = buildNavGraph(navStripsFor(currentLayout));
      recomputeHome();
      totalMachines = nextLayout.machines.length;
      layoutSpeedScale = currentLayout.scale.factor;
      // รอบที่เดินอยู่ยังใช้เส้นทางเดิม (ไม่ยกหุ่นไปวางที่ใหม่กลางรอบ);
      // รอบถัดไปจึงจะวางแผนใหม่จากผังใหม่
      if (phase === "idle") {
        if (running) {
          // ผู้ใช้กดเริ่มไว้ตอนผังยังไม่มีเครื่องจักร (ดู beginRound) —
          // ผังจริงมาถึงแล้ว เริ่มรอบทันทีโดยไม่ต้องให้กดเริ่มซ้ำ
          beginRound();
        } else {
          route = planRoute(currentLayout, maxStops);
          x = homeX;
          z = homeZ;
          yaw = homeYaw;
        }
      }
      writeSnapshot();
    },
    route: () => route,
  };
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * สร้าง (และ memoise) หุ่นยนต์ตรวจหนึ่งตัวสำหรับผังที่ให้มา และรีเฟรช
 * snapshot ให้ฝั่ง UI `hz` ครั้งต่อวินาที
 *
 * ฉาก 3 มิติเป็นผู้เรียก `agent.step(dt)` จาก render loop ของตัวเอง (ให้การ
 * เดินลื่นตามเฟรมจริง) hook นี้จึงไม่ก้าวเวลาเองเลย — หน้าที่มีอย่างเดียวคือ
 * ปลุก React ให้ re-render พาเนลรายงานเป็นจังหวะที่อ่านได้สบายตา
 */
export function useInspectionAgent(
  layout: PlantLayout,
  options?: InspectionAgentOptions & { hz?: number }
): { agent: InspectionAgent; snapshot: InspectorSnapshot; tick: number } {
  const hz = clamp(options?.hz ?? 4, 1, 15);

  // หุ่นยนต์ตัวเดียวตลอดอายุของหน้านี้ — `layout` ถูกสร้างใหม่ทุกครั้งที่
  // ข้อมูลเครื่องจักรรีเฟรช ถ้าผูกอายุหุ่นไว้กับมัน รายงานที่เดินสะสมมาจะ
  // หายไปพร้อมการรีเฟรชเบื้องหลังหนึ่งครั้ง จึงส่งของใหม่เข้าไปแทนที่ผ่าน
  // setLayout ด้านล่างแทน
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const agent = useMemo(() => createInspectionAgent(layout, options), []);

  const layoutRef = useRef(layout);
  useEffect(() => {
    if (layoutRef.current === layout) return;
    layoutRef.current = layout;
    agent.setLayout(layout);
  }, [agent, layout]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000 / hz);
    return () => clearInterval(id);
  }, [hz]);

  return { agent, snapshot: agent.snapshot(), tick };
}
