// ข้อมูลจำลอง (mock/demo) สำหรับตัวชี้วัดรายละเอียดของเครื่องจักร
//
// ค่าทั้งหมด "สุ่มแบบ deterministic" — คำนวณจาก hash ของ machine.id ผ่าน seeded PRNG
// (mulberry32) จึงได้ตัวเลขชุดเดิมทุกครั้งที่ render เครื่องเดิม ไม่มีการสุ่มจริงที่
// เปลี่ยนไปมาระหว่าง render ซึ่งจะทำให้กราฟ/ตัวเลขกระพริบโดยไม่มีเหตุผล
//
// ใช้สำหรับหน้าตัวอย่าง/สาธิต (demo) เท่านั้น เมื่อ backend มี endpoint จริงสำหรับ
// ค่า OEE / cycle time / energy / ประวัติ error แล้ว ให้เปลี่ยนมาดึงจาก API แทนไฟล์นี้

import type { Machine } from "../types";

/* ---------------------------------------------------------------- */
/* Seeded PRNG                                                       */
/* ---------------------------------------------------------------- */

/** แปลง string เป็นตัวเลข 32-bit สำหรับใช้เป็น seed (djb2-ish hash) */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: PRNG ขนาดเล็ก กำหนดผลลัพธ์ได้แน่นอนจาก seed เดียวกัน */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** สร้างฟังก์ชันสุ่ม (deterministic) จาก machine id + ป้ายกำกับ (เพื่อแยก stream) */
function rngFor(machineId: string, label: string): () => number {
  return mulberry32(hashString(machineId + "::" + label));
}

/** สุ่มเลขในช่วง [min, max] แบบ deterministic */
function randRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/* ---------------------------------------------------------------- */
/* ประเภทข้อมูล (contract)                                            */
/* ---------------------------------------------------------------- */

export type MetricRange = "24h" | "7d";

export interface OeeMetrics {
  availability: number; // 0-100 percent
  performance: number; // 0-100
  quality: number; // 0-100
  oee: number; // availability*performance*quality/10000, 0-100
}

export interface CycleTimeMetrics {
  actualSec: number; // เวลารอบจริง (วินาที)
  standardSec: number; // เวลารอบมาตรฐาน/เป้าหมาย (วินาที)
  deviationPct: number; // (actual-standard)/standard*100, ติดลบได้
  partsPerHour: number;
}

export type EnergyKind = "electrical" | "ro" | "coolant" | "air";

export interface EnergyMetric {
  kind: EnergyKind;
  label: string; // ป้ายภาษาไทย
  value: number; // ปริมาณการใช้ปัจจุบัน
  unit: string; // "kWh" | "L/h" | "m³/h"
  changePct: number; // เทียบช่วงก่อนหน้า, +/-
}

export interface ErrorHistoryEntry {
  id: string;
  code: string; // เช่น "ALM-1042"
  description: string; // คำอธิบายภาษาไทย
  severity: "critical" | "warning" | "info";
  occurredAt: string; // ISO string
  durationMin: number; // เวลาที่เครื่องหยุด (นาที)
  resolved: boolean;
}

export interface TrendPoint {
  t: string; // ISO timestamp
  label: string; // ป้ายแกนสั้นๆ เช่น "14:00" (24h) หรือ "จ. 8/9" (7d)
  value: number;
}

export interface MachineMetricsMock {
  oee: OeeMetrics;
  cycleTime: CycleTimeMetrics;
  energy: EnergyMetric[]; // เสมอ 4 รายการ ตามลำดับ: electrical, ro, coolant, air
  errorHistory: ErrorHistoryEntry[]; // 5-8 รายการ ใหม่สุดอยู่บน
}

/* ---------------------------------------------------------------- */
/* OEE / cycle time / energy — ผูกกับ machine.status                  */
/* ---------------------------------------------------------------- */

/** ช่วงคะแนน OEE โดยประมาณ ตามสถานะเครื่อง */
const OEE_RANGE_BY_STATUS: Record<Machine["status"], [number, number]> = {
  normal: [78, 88],
  warning: [62, 75],
  error: [35, 55],
  maintenance: [50, 65],
};

function buildOee(machine: Machine, rng: () => number): OeeMetrics {
  const [lo, hi] = OEE_RANGE_BY_STATUS[machine.status];
  const target = randRange(rng, lo, hi);
  // กระจาย target ให้เป็น 3 องค์ประกอบที่คูณกันได้ใกล้เคียงเป้าหมาย
  const availability = round1(Math.min(99, Math.max(40, target + randRange(rng, -4, 8))));
  const performance = round1(Math.min(99, Math.max(40, target + randRange(rng, -8, 6))));
  const quality = round1(Math.min(100, Math.max(60, target + randRange(rng, -2, 10))));
  const oee = round1((availability * performance * quality) / 10000);
  return { availability, performance, quality, oee };
}

function buildCycleTime(machine: Machine, rng: () => number): CycleTimeMetrics {
  const standardSec = Math.round(randRange(rng, 25, 90));
  // เครื่องที่สถานะไม่ดีมักจะรอบทำงานช้ากว่ามาตรฐานมากขึ้น
  const worseFactor =
    machine.status === "error" ? 0.25 : machine.status === "warning" ? 0.12 : machine.status === "maintenance" ? 0.08 : 0.03;
  const deviationPct = round1(randRange(rng, -5, 5) + worseFactor * 100);
  const actualSec = Math.round(standardSec * (1 + deviationPct / 100));
  const partsPerHour = Math.round(3600 / Math.max(actualSec, 1));
  return { actualSec, standardSec, deviationPct, partsPerHour };
}

const ENERGY_DEFS: Array<{ kind: EnergyKind; label: string; unit: string; base: [number, number] }> = [
  { kind: "electrical", label: "ไฟฟ้า (Electrical)", unit: "kWh", base: [40, 120] },
  { kind: "ro", label: "น้ำ RO", unit: "L/h", base: [50, 200] },
  { kind: "coolant", label: "น้ำหล่อเย็น (Coolant)", unit: "L/h", base: [30, 150] },
  { kind: "air", label: "ลมอัด (Air Compressor)", unit: "m³/h", base: [10, 60] },
];

function buildEnergy(rng: () => number): EnergyMetric[] {
  return ENERGY_DEFS.map((def) => ({
    kind: def.kind,
    label: def.label,
    value: Math.round(randRange(rng, def.base[0], def.base[1])),
    unit: def.unit,
    changePct: round1(randRange(rng, -15, 15)),
  }));
}

/* ---------------------------------------------------------------- */
/* ประวัติ error                                                      */
/* ---------------------------------------------------------------- */

const MOCK_ERROR_CODES: Array<{ code: string; description: string; severity: ErrorHistoryEntry["severity"] }> = [
  { code: "ALM-1042", description: "สปินเดิลอุณหภูมิสูงเกินกำหนด", severity: "critical" },
  { code: "ALM-2210", description: "ค่าการสั่นสะเทือนเกินเกณฑ์", severity: "warning" },
  { code: "ALM-0087", description: "เซนเซอร์ตรวจจับตำแหน่งขัดข้อง", severity: "critical" },
  { code: "ALM-3305", description: "แรงดันลมอัดต่ำกว่าเกณฑ์", severity: "warning" },
  { code: "ALM-4410", description: "ระบบหล่อเย็นระดับน้ำต่ำ", severity: "warning" },
  { code: "ALM-5520", description: "มอเตอร์เกินกระแสไฟ", severity: "critical" },
  { code: "ALM-0099", description: "แจ้งเตือนถึงกำหนดบำรุงรักษา", severity: "info" },
  { code: "ALM-6633", description: "ประตูนิรภัยเปิดขณะทำงาน", severity: "critical" },
];

function buildErrorHistory(machine: Machine, rng: () => number): ErrorHistoryEntry[] {
  const count = Math.round(randRange(rng, 5, 8));
  const criticalBias = machine.status === "error" ? 3 : machine.status === "warning" ? 1 : 0;
  const entries: ErrorHistoryEntry[] = [];
  const now = Date.now();

  // ถ้าเครื่องมีรหัส error ที่กำลังเกิดอยู่ ให้เป็นรายการล่าสุดสุดและยังไม่ resolved
  if (machine.activeErrorCode) {
    entries.push({
      id: `${machine.id}-active`,
      code: machine.activeErrorCode,
      description: machine.activeErrorDesc ?? "ข้อผิดพลาดที่กำลังเกิดขึ้น",
      severity: "critical",
      occurredAt: new Date(now - randRange(rng, 5, 120) * 60_000).toISOString(),
      durationMin: Math.round(randRange(rng, 5, 240)),
      resolved: false,
    });
  }

  for (let i = entries.length; i < count; i++) {
    const idx = Math.floor(rng() * MOCK_ERROR_CODES.length);
    const def = MOCK_ERROR_CODES[idx];
    const daysAgo = i + randRange(rng, 0, 1.5) + criticalBias * 0.2;
    const severity: ErrorHistoryEntry["severity"] =
      criticalBias > 0 && rng() < 0.4 ? "critical" : def.severity;
    entries.push({
      id: `${machine.id}-err-${i}`,
      code: def.code,
      description: def.description,
      severity,
      occurredAt: new Date(now - daysAgo * 86_400_000).toISOString(),
      durationMin: Math.round(randRange(rng, 5, 300)),
      resolved: true,
    });
  }

  entries.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  return entries;
}

/* ---------------------------------------------------------------- */
/* API หลัก                                                           */
/* ---------------------------------------------------------------- */

/** สร้างข้อมูลตัวชี้วัด mock ทั้งหมดของเครื่องจักรหนึ่งเครื่อง (deterministic ตาม machine.id) */
export function getMachineMetricsMock(machine: Machine): MachineMetricsMock {
  const oeeRng = rngFor(machine.id, "oee");
  const cycleRng = rngFor(machine.id, "cycle");
  const energyRng = rngFor(machine.id, "energy");
  const errorRng = rngFor(machine.id, "errors");

  return {
    oee: buildOee(machine, oeeRng),
    cycleTime: buildCycleTime(machine, cycleRng),
    energy: buildEnergy(energyRng),
    errorHistory: buildErrorHistory(machine, errorRng),
  };
}

/* ---------------------------------------------------------------- */
/* กราฟแนวโน้ม (trend)                                                */
/* ---------------------------------------------------------------- */

export type TrendMetric = "oee" | "cycleTime" | "energyElectrical" | "spindleTemp" | "vibration";

export const TREND_METRIC_LABELS: Record<TrendMetric, { label: string; unit: string }> = {
  oee: { label: "OEE", unit: "%" },
  cycleTime: { label: "รอบเวลาทำงาน (Cycle Time)", unit: "วินาที" },
  energyElectrical: { label: "การใช้ไฟฟ้า", unit: "kWh" },
  spindleTemp: { label: "อุณหภูมิสปินเดิล", unit: "°C" },
  vibration: { label: "ค่าการสั่นสะเทือน", unit: "mm/s" },
};

const THAI_DAY_LABELS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

/** ค่าปัจจุบัน (จุดสิ้นสุดของ trend) สำหรับ metric ที่กำหนด อ้างอิงจาก mock metrics หลัก */
function currentValueFor(machine: Machine, metric: TrendMetric, mock: MachineMetricsMock): number {
  switch (metric) {
    case "oee":
      return mock.oee.oee;
    case "cycleTime":
      return mock.cycleTime.actualSec;
    case "energyElectrical":
      return mock.energy.find((e) => e.kind === "electrical")?.value ?? 60;
    case "spindleTemp":
      return machine.spindleTemp ?? 55;
    case "vibration":
      return machine.vibrationMms ?? 1.5;
  }
}

/** ขนาดของความผันผวนตามรอบ (smooth walk) สำหรับแต่ละ metric */
function noiseAmplitudeFor(metric: TrendMetric): number {
  switch (metric) {
    case "oee":
      return 3;
    case "cycleTime":
      return 4;
    case "energyElectrical":
      return 6;
    case "spindleTemp":
      return 2;
    case "vibration":
      return 0.3;
  }
}

/**
 * สร้างชุดข้อมูลแนวโน้ม (trend) สำหรับกราฟ — ค่าเปลี่ยนแปลงแบบ smooth (random walk
 * ที่ถูกดึงกลับเข้าหาค่าปัจจุบันทีละน้อย) ไม่ใช่สุ่มล้วนๆ แบบ noise สูงๆ ระหว่างจุด
 * และจุดสุดท้ายจะใกล้เคียงกับค่าปัจจุบันจาก getMachineMetricsMock เสมอ
 */
export function getMachineTrendSeries(
  machine: Machine,
  metric: TrendMetric,
  range: MetricRange
): TrendPoint[] {
  const mock = getMachineMetricsMock(machine);
  const target = currentValueFor(machine, metric, mock);
  const amplitude = noiseAmplitudeFor(metric);
  const rng = rngFor(machine.id, `trend-${metric}-${range}`);

  const pointCount = range === "24h" ? 24 : 7;
  const stepMs = range === "24h" ? 3_600_000 : 86_400_000;
  const now = new Date();

  // เดินย้อนกลับจากค่าปัจจุบัน (index สุดท้าย) ไปยังอดีต ด้วย smooth random walk
  // แล้วกลับลำดับ เพื่อให้จุดสุดท้ายตรงกับค่าปัจจุบันเป๊ะ
  const valuesReversed: number[] = [target];
  let cur = target;
  for (let i = 1; i < pointCount; i++) {
    const drift = (rng() - 0.5) * amplitude;
    cur = cur - drift;
    valuesReversed.push(cur);
  }
  const values = valuesReversed.slice().reverse();

  const points: TrendPoint[] = [];
  for (let i = 0; i < pointCount; i++) {
    const offsetSteps = pointCount - 1 - i;
    const t = new Date(now.getTime() - offsetSteps * stepMs);
    let label: string;
    if (range === "24h") {
      label = `${String(t.getHours()).padStart(2, "0")}:00`;
    } else {
      label = `${THAI_DAY_LABELS[t.getDay()]} ${t.getDate()}/${t.getMonth() + 1}`;
    }
    const rawValue = values[i];
    const value = metric === "vibration" ? round1(Math.max(0, rawValue)) : Math.round(Math.max(0, rawValue) * 10) / 10;
    points.push({ t: t.toISOString(), label, value });
  }

  return points;
}
