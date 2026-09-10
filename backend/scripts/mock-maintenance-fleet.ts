/**
 * mock-maintenance-fleet.ts — fill FIVE machines that a separate task already set to
 * status='maintenance' with the same depth of MOCK data that mock-machine.ts (id
 * "1#0802" / code "ALL-000") and mock-abnormal-machine.ts (id "GR-1141#0815") already
 * carry: machine detail columns, 30-day hourly telemetry, and a work order history
 * with parts.
 *
 * ⚠️  THIS SCRIPT WRITES FABRICATED SENSOR READINGS AND REPAIR RECORDS INTO A
 *     MAINTENANCE SYSTEM. ⚠️
 *
 * It exists for demo/UI purposes only. Every value it writes is invented; none of it
 * comes from a sensor or a real repair. Technicians must never act on it. That is
 * why, exactly as in the two scripts it mirrors:
 *   • `machines.info_notes` gets a `MOCK_DATA` entry plus a Thai warning,
 *   • `machines.model` carries a visible `[MOCK]` suffix,
 *   • every telemetry row's id is prefixed `MOCK-<machineId>-`,
 *   • every work_orders row carries `data_quality_flags = ["MOCK_DATA"]`,
 *   • the pre-change state is captured to backend/backups/mock-machine/ so
 *     `--revert` restores byte-for-byte and deletes exactly the rows this script
 *     created.
 *
 * SCOPE: exactly five machines, already status='maintenance' (set by a separate
 * task — this script does NOT change status on anything):
 *   AR-1031#0576  code AR-1031  RUST PREVENTION MACHINE
 *   AS-1009#0284  code AS-1009  SLINGER PRESS M/C
 *   MA-602#0083   code MA-602   LASER MARKER MACHINE
 *   PK-1502#0892  code PK-1502  PACKING TABLE M/C
 *   WA-107#0269   code WA-107   OUTER RING PART WASH EQUIPMENT M/C
 * Nothing else in the database is read-modified-written.
 *
 * Work order id/code block: mock-repair-history.ts already reserves WO95001-WO95016.
 * This script reserves a NEW, non-overlapping block, WO95101-WO95120 (4 per
 * machine), verified at runtime to not already exist as non-mock data.
 *
 * Usage:
 *   npm run mock:maintenance-fleet -- --dry-run   # print the plan, touch nothing
 *   npm run mock:maintenance-fleet                # apply (idempotent, safe to re-run)
 *   npm run mock:maintenance-fleet -- --revert    # restore + delete exactly our rows
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { supabase } from "../src/lib/supabase.js";
import { addDays } from "./lib/derive.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = resolve(__dirname, "../backups/mock-machine");
const HISTORY_BACKUP_PATH = resolve(BACKUP_DIR, "maintenance-fleet-history.before.json");

/* ------------------------------------------------------------------ */
/* Safety guard — machines this script must NEVER write to            */
/* ------------------------------------------------------------------ */

/**
 * Same guard as mock-abnormal-machine.ts, kept here independently rather than
 * imported: this script must refuse to touch mock-machine.ts's healthy demo target
 * (id "1#0802", code "ALL-000" today) or mock-abnormal-machine.ts's target
 * (id "GR-1141#0815"), no matter what a future rename does to their codes.
 */
const OFF_LIMITS_IDS = ["1#0802", "GR-1141#0815"];
const OFF_LIMITS_NAMES = ["OUTER RING RACEWAY GRINDING", "INNER RING RACEWAY GRINDING MACHINE"];

function assertNotOffLimits(row: { id: string; code: string; name: string }): void {
  if (
    row.code === "1" ||
    String(row.code).startsWith("ALL-") ||
    OFF_LIMITS_IDS.includes(row.id) ||
    OFF_LIMITS_NAMES.includes(row.name)
  ) {
    throw new Error(
      `SAFETY GUARD: refusing to touch machine id="${row.id}" code="${row.code}" name="${row.name}" — off-limits.`
    );
  }
}

/* ------------------------------------------------------------------ */
/* Shared markers / constants                                         */
/* ------------------------------------------------------------------ */

const MOCK_MARKER = "MOCK_DATA";
const MOCK_NOTE_TH =
  "ข้อมูลจำลองสำหรับสาธิต (เครื่องอยู่ระหว่างซ่อมบำรุง) - ห้ามใช้อ้างอิงงานจริง (สร้างโดย scripts/mock-maintenance-fleet.ts)";

/**
 * telemetry_readings.source is constrained by 0003_telemetry_readings.sql to
 * ('iot','manual','seed') — 'mock' is NOT allowed. 'seed' is used, same as the two
 * scripts this mirrors; the unambiguous marker lives on the primary key instead.
 */
const TELEMETRY_SOURCE = "seed";

const idPrefix = (machineId: string) => `MOCK-${machineId}-`;
const mockReadingId = (machineId: string, metric: string, index: number) =>
  `${idPrefix(machineId)}${metric}-${String(index).padStart(4, "0")}`;

const WINDOW_HOURS = 720;
const POINTS = WINDOW_HOURS + 1; // 721 — under the route's MAX_READINGS_ROWS (2000)

const MT_LEADER = "สมชาย ใจดี";
const PD_NICKNAME = "ต้น";
const TECHS = ["สมศักดิ์ พากเพียร", "วิชัย มั่นคง", "ธีระ ตั้งใจ", "อนันต์ สุขสันต์", "ประยุทธ์ แข็งขัน"];

function isoDate(from: Date, offsetDays: number): string {
  const d = new Date(from.getTime() + offsetDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoAt(dateStr: string, hourMin: string): string {
  return new Date(`${dateStr}T${hourMin}:00.000Z`).toISOString();
}

function minusHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() - hours * 3_600_000).toISOString();
}

/**
 * Fiscal year starts in April (verified against the real import in
 * scripts/lib/derive... callers / mock-repair-history.ts: every Jan-Mar row carries
 * fy = calendar_year - 1). Reused here for consistency with every other work order
 * in the table.
 */
function fiscalYear(dateStr: string): number {
  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(5, 7));
  return month <= 3 ? year - 1 : year;
}

const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

function buildImageUrl(label: string): string {
  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">` +
      `<rect width="320" height="200" fill="#fdf2e3"/>` +
      `<rect x="52" y="66" width="216" height="84" rx="8" fill="#f0ce9c"/>` +
      `<rect x="76" y="90" width="60" height="36" rx="4" fill="#d99a3f"/>` +
      `<circle cx="212" cy="108" r="22" fill="#d99a3f"/>` +
      `<text x="160" y="42" font-family="sans-serif" font-size="13" font-weight="bold" fill="#8a5a12" text-anchor="middle">${label}</text>` +
      `<text x="160" y="178" font-family="sans-serif" font-size="12" fill="#a3781f" text-anchor="middle">MOCK IMAGE - ภาพจำลอง (ซ่อมบำรุง)</text>` +
      `</svg>`
  );
}

function buildQrUrl(code: string): string {
  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200" viewBox="0 0 180 200">` +
      `<rect width="180" height="200" fill="#ffffff"/>` +
      `<g fill="#8a5a12">` +
      `<rect x="14" y="14" width="42" height="42"/><rect x="22" y="22" width="26" height="26" fill="#fff"/><rect x="28" y="28" width="14" height="14"/>` +
      `<rect x="124" y="14" width="42" height="42"/><rect x="132" y="22" width="26" height="26" fill="#fff"/><rect x="138" y="28" width="14" height="14"/>` +
      `<rect x="14" y="124" width="42" height="42"/><rect x="22" y="132" width="26" height="26" fill="#fff"/><rect x="28" y="138" width="14" height="14"/>` +
      `<rect x="70" y="14" width="10" height="10"/><rect x="90" y="24" width="10" height="10"/><rect x="70" y="44" width="10" height="10"/>` +
      `<rect x="14" y="70" width="10" height="10"/><rect x="34" y="90" width="10" height="10"/><rect x="70" y="70" width="10" height="10"/>` +
      `<rect x="90" y="90" width="10" height="10"/><rect x="110" y="70" width="10" height="10"/><rect x="130" y="90" width="10" height="10"/>` +
      `<rect x="70" y="110" width="10" height="10"/><rect x="110" y="130" width="10" height="10"/><rect x="90" y="150" width="10" height="10"/>` +
      `<rect x="130" y="150" width="10" height="10"/><rect x="150" y="110" width="10" height="10"/>` +
      `</g>` +
      `<text x="90" y="186" font-family="sans-serif" font-size="11" fill="#a3781f" text-anchor="middle">MOCK QR - รหัส ${code}</text>` +
      `</svg>`
  );
}

/* ------------------------------------------------------------------ */
/* Deterministic signal generation (same technique as mock-machine.ts) */
/* ------------------------------------------------------------------ */

/** mulberry32 — same seed gives the same series, so re-running writes identical values. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller — Gaussian noise reads as instrument scatter; uniform noise does not. */
function makeGaussian(seed: number) {
  const rand = rng(seed);
  return () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
}

/** Plant duty cycle at a given instant, 0..1 — same two-shift + light-Sunday shape as mock-machine.ts. */
function dutyCycle(date: Date): number {
  const h = date.getHours() + date.getMinutes() / 60;
  const inShiftA = h >= 8 && h < 17;
  const inShiftB = h >= 20 || h < 5;
  let load = inShiftA || inShiftB ? 1 : 0.3;
  if (date.getDay() === 0) load *= 0.4; // Sunday — maintenance/idle day
  return load;
}

interface Series {
  metric: "spindle_temp" | "vibration_mms" | "health_score";
  points: { recordedAt: Date; value: number }[];
}

/**
 * One 30-day hourly series per metric, drifting from a healthier `start` value
 * toward the machine's current (under-maintenance) value, plus load rhythm and
 * Gaussian noise — the same "slow drift + duty cycle + noise, pinned to the current
 * value" shape as mock-machine.ts, parameterized so all five machines can share it
 * with distinct seeds (so their series don't repeat identically).
 */
function buildSeries(endAt: Date, seedBase: number, current: { spindle_temp: number; vibration_mms: number; health_score: number }): Series[] {
  const gTemp = makeGaussian(seedBase + 1);
  const gVib = makeGaussian(seedBase + 2);
  const gHealth = makeGaussian(seedBase + 3);

  const startTemp = current.spindle_temp - 6;
  const startVib = current.vibration_mms - 1.1;
  const startHealth = Math.min(100, current.health_score + 14);

  const temp: Series = { metric: "spindle_temp", points: [] };
  const vib: Series = { metric: "vibration_mms", points: [] };
  const health: Series = { metric: "health_score", points: [] };

  for (let i = 0; i < POINTS; i++) {
    const hoursAgo = WINDOW_HOURS - i;
    const at = new Date(endAt.getTime() - hoursAgo * 3_600_000);
    const p = i / (POINTS - 1); // 0 = 30 days ago, 1 = now
    const load = dutyCycle(at);

    temp.points.push({
      recordedAt: at,
      value: startTemp + (current.spindle_temp - startTemp) * p + 2.4 * load + 0.6 * Math.sin((2 * Math.PI * i) / 24) + gTemp() * 0.4,
    });

    vib.points.push({
      recordedAt: at,
      value: startVib + (current.vibration_mms - startVib) * p + 0.15 * load + gVib() * 0.05,
    });

    const day = Math.floor(i / 24);
    health.points.push({
      recordedAt: at,
      value: startHealth + (current.health_score - startHealth) * (day / (POINTS / 24)) + gHealth() * 0.4,
    });
  }

  const pin = (s: Series, target: number, decimals: number) => {
    const offset = target - s.points[s.points.length - 1].value;
    for (const pt of s.points) pt.value = Number((pt.value + offset).toFixed(decimals));
  };
  pin(temp, current.spindle_temp, 1);
  pin(vib, current.vibration_mms, 2);
  pin(health, current.health_score, 0);
  for (const pt of health.points) pt.value = Math.max(0, Math.min(100, pt.value));

  return [temp, vib, health];
}

/* ------------------------------------------------------------------ */
/* Work order seed shape (same fields as mock-repair-history.ts)      */
/* ------------------------------------------------------------------ */

interface PartSeed {
  code: string;
  name: string;
  quantity: number;
  position: string;
}

interface WorkOrderSeed {
  num: number; // id = code = `WO${num}`, reserved block WO95101-WO95120
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "review" | "completed";
  assignedDate: string;
  dueDate: string;
  finishHourUtc: string | null;
  symptoms: string[] | null;
  actionPlan: string[] | null;
  partsRequested: string[] | null;
  solutionSteps: string[] | null;
  stepsCompleted: number | null;
  totalSteps: number | null;
  estimatedHours: number | null;
  sectionResponse: "Breakdown Maintenance" | "Preventive Maintenance";
  shift: "DAY" | "NIGHT";
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

/**
 * A per-machine, per-metric watch threshold, used to build the condition-monitoring
 * readout (24h / 7d / 30d) that goes into each machine's most recent work order.
 * `label` and `unit` are machine-specific: e.g. "spindle_temp" reads as bearing/spindle
 * heat on a grinder but is repurposed here as dip-tank oil temp, hydraulic oil temp,
 * laser diode temp, drive-motor temp or wash-pump temp depending on the machine — a
 * laser marker and a washing machine must NOT share a spindle-temp limit.
 */
interface MetricThreshold {
  metric: "spindle_temp" | "vibration_mms" | "health_score";
  label: string;
  unit: string;
  decimals: number;
  warn: number;
  critical: number;
  /** "high": values AT/ABOVE warn/critical are worse (temp, vibration). "low":
   *  values AT/BELOW warn/critical are worse (health_score). */
  worseDirection: "high" | "low";
}

interface MachineTarget {
  id: string;
  expectedCode: string;
  expectedName: string;
  nameRaw: string;
  lineLocation: string;
  seedBase: number;
  current: { spindle_temp: number; vibration_mms: number; health_score: number };
  healthScorePatch: number;
  model: string;
  operatingHours: number;
  /** next_maintenance is derived as last_maintenance + 90 days (the TBM cadence used
   *  elsewhere in this codebase, e.g. mock-machine.ts) — NOT an independent offset
   *  from `now`, which previously produced unrealistic gaps as small as 10 days. */
  lastMaintenanceOffsetDays: number;
  activeErrorCode: string | null;
  activeErrorDesc: string | null;
  thresholds: MetricThreshold[];
  orders: WorkOrderSeed[];
}

/* ------------------------------------------------------------------ */
/* Condition-monitoring readout: measured values vs watch thresholds  */
/* across 24h / 7d / 30d, computed FROM the generated telemetry series */
/* so the text always matches the chart.                               */
/* ------------------------------------------------------------------ */

/** Mean of the series points that fall within `windowHours` of `now` (falls back to
 *  the whole series if the window would otherwise be empty — never happens at 24h
 *  since the series is hourly, kept only as a defensive floor). */
function windowAverage(points: { recordedAt: Date; value: number }[], now: Date, windowHours: number): number {
  const cutoff = now.getTime() - windowHours * 3_600_000;
  const inWindow = points.filter((p) => p.recordedAt.getTime() >= cutoff);
  const use = inWindow.length > 0 ? inWindow : points;
  return use.reduce((sum, p) => sum + p.value, 0) / use.length;
}

function classifyStatus(value: number, t: MetricThreshold): "ปกติ" | "เฝ้าระวัง" | "เกินเกณฑ์" {
  if (t.worseDirection === "high") {
    if (value >= t.critical) return "เกินเกณฑ์";
    if (value >= t.warn) return "เฝ้าระวัง";
    return "ปกติ";
  }
  if (value <= t.critical) return "เกินเกณฑ์";
  if (value <= t.warn) return "เฝ้าระวัง";
  return "ปกติ";
}

/** เพิ่มขึ้น/ทรงตัว/ลดลง + signed percent change of `recent` vs `older`. A ±2% band
 *  around zero reads as "ทรงตัว" so hourly noise does not flip the label. */
function trendVsBaseline(recent: number, older: number): { label: "เพิ่มขึ้น" | "ทรงตัว" | "ลดลง"; pct: number } {
  if (older === 0) return { label: "ทรงตัว", pct: 0 };
  const pct = ((recent - older) / Math.abs(older)) * 100;
  if (pct > 2) return { label: "เพิ่มขึ้น", pct };
  if (pct < -2) return { label: "ลดลง", pct };
  return { label: "ทรงตัว", pct };
}

interface ConditionReadout {
  symptomsLines: string[];
  technicianNote: string;
}

/**
 * Builds the Thai condition-monitoring lines for one machine's most recent work
 * order: for each threshold metric, the 24h/7d/30d averages computed straight from
 * `series` (never hardcoded), the watch threshold, the trend of 24h vs 30d, and an
 * explicit ปกติ/เฝ้าระวัง/เกินเกณฑ์ classification — plus a one-line overall summary
 * for `technician_note`.
 */
function buildConditionReadout(target: MachineTarget, series: Series[], now: Date): ConditionReadout {
  const lines: string[] = [];
  const statuses: Array<"ปกติ" | "เฝ้าระวัง" | "เกินเกณฑ์"> = [];

  for (const threshold of target.thresholds) {
    const s = series.find((x) => x.metric === threshold.metric);
    if (!s) continue;
    const avg24h = windowAverage(s.points, now, 24);
    const avg7d = windowAverage(s.points, now, 24 * 7);
    const avg30d = windowAverage(s.points, now, 24 * 30);
    const fmt = (v: number) => v.toFixed(threshold.decimals);
    const status = classifyStatus(avg24h, threshold);
    const trend = trendVsBaseline(avg24h, avg30d);
    const pctStr = `${trend.pct >= 0 ? "+" : ""}${trend.pct.toFixed(1)}%`;
    statuses.push(status);
    lines.push(
      `${threshold.label}: 24 ชม. ${fmt(avg24h)}${threshold.unit} / 7 วัน ${fmt(avg7d)}${threshold.unit} / 30 วัน ${fmt(avg30d)}${threshold.unit}` +
        ` — เกณฑ์เฝ้าระวัง ${fmt(threshold.warn)}${threshold.unit}, แนวโน้ม${trend.label} ${pctStr} เทียบ 30 วัน (${status})`
    );
  }

  const overall = statuses.includes("เกินเกณฑ์") ? "เกินเกณฑ์" : statuses.includes("เฝ้าระวัง") ? "เฝ้าระวัง" : "ปกติ";
  const technicianNote =
    `สรุปการเฝ้าระวังสภาพเครื่อง (เทียบค่าเฉลี่ย 24 ชม. / 7 วัน / 30 วัน จากข้อมูล Telemetry จริงของเครื่องนี้): ` +
    `ภาพรวมอยู่ในระดับ ${overall} — ดูค่าตรวจวัดแต่ละพารามิเตอร์ในช่องอาการ (symptoms)`;

  return { symptomsLines: lines, technicianNote };
}

/* ------------------------------------------------------------------ */
/* A) AR-1031#0576 — RUST PREVENTION MACHINE (scheduled PM, no fault) */
/* ------------------------------------------------------------------ */

const AR1031_ORDERS: WorkOrderSeed[] = [
  {
    num: 95101,
    title: "PM เปลี่ยนน้ำมันกันสนิม (Rust Preventive Oil) ในบ่อจุ่ม",
    description: "งาน PM ตามรอบเปลี่ยนน้ำมันกันสนิมในบ่อจุ่มชิ้นงานและกรองตะกอน",
    priority: "low",
    status: "completed",
    assignedDate: "2026-06-02",
    dueDate: "2026-06-02",
    finishHourUtc: "09:20",
    symptoms: null,
    actionPlan: null,
    partsRequested: ["Rust Preventive Oil"],
    solutionSteps: ["ระบายน้ำมันเก่าออกจากบ่อจุ่ม", "กรองตะกอนและทำความสะอาดบ่อ", "เติมน้ำมันกันสนิมใหม่"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 30,
    repairDurationMin: 45,
    technicians: [TECHS[0]],
    cause: "ครบกำหนดตามแผน PM เปลี่ยนน้ำมันกันสนิม",
    repairAction: "ระบายน้ำมันเก่า กรองตะกอน และเติมน้ำมันกันสนิมใหม่",
    technicianNote: null,
    parts: [{ code: "OIL-RP30", name: "Rust Preventive Oil", quantity: 20, position: "Dip Tank" }],
  },
  {
    num: 95102,
    title: "ซ่อมปั๊มหมุนเวียนน้ำมันกันสนิมทำงานไม่ต่อเนื่อง",
    description: "ปั๊มหมุนเวียนน้ำมันในบ่อจุ่มตัด-ต่อไม่สม่ำเสมอ ทำให้การเคลือบผิวไม่สม่ำเสมอ",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-07-11",
    dueDate: "2026-07-11",
    finishHourUtc: "14:05",
    symptoms: ["ปั๊มหมุนเวียนตัด-ต่อไม่สม่ำเสมอ", "ผิวเคลือบชิ้นงานไม่สม่ำเสมอ"],
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["ตรวจสอบมอเตอร์ปั๊ม", "เปลี่ยนคาปาซิเตอร์สตาร์ท", "ทดสอบเดินปั๊ม"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Machine",
    mtlossMin: 50,
    repairDurationMin: 60,
    technicians: [TECHS[1]],
    cause: "คาปาซิเตอร์สตาร์ทมอเตอร์ปั๊มเสื่อมสภาพ",
    repairAction: "เปลี่ยนคาปาซิเตอร์สตาร์ทมอเตอร์ปั๊ม",
    technicianNote: null,
  },
  {
    num: 95103,
    title: "ตรวจพบคราบตะกรันสะสมในบ่อจุ่มและรางระบาย",
    description: "พบคราบตะกรันสะสมในบ่อจุ่มและรางระบายน้ำมัน ส่งผลต่อคุณภาพการเคลือบ",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-08-05",
    dueDate: "2026-08-06",
    finishHourUtc: "16:30",
    symptoms: ["คราบตะกรันสะสมในบ่อจุ่ม", "รางระบายน้ำมันอุดตันบางส่วน"],
    actionPlan: ["ล้างทำความสะอาดบ่อจุ่มทั้งระบบ", "ตรวจสอบรางระบาย", "วางแผนหยุดเครื่องเพื่อ Overhaul บ่อจุ่ม"],
    partsRequested: null,
    solutionSteps: ["ล้างทำความสะอาดบ่อจุ่มเบื้องต้น", "เปิดทางระบายที่อุดตัน"],
    stepsCompleted: 2,
    totalSteps: 3,
    estimatedHours: 4,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 90,
    repairDurationMin: 120,
    technicians: [TECHS[2], TECHS[0]],
    cause: "ตะกรันสะสมจากน้ำมันกันสนิมเสื่อมคุณภาพตามรอบการใช้งานยาวนาน",
    repairAction: "ล้างทำความสะอาดบ่อจุ่มบางส่วนและเปิดทางระบายที่อุดตัน รอ Overhaul เต็มระบบ",
    technicianNote: "ต้องหยุดเครื่องเต็มวันเพื่อ Overhaul บ่อจุ่มทั้งระบบ วางแผนไว้ในรอบถัดไป",
  },
  {
    num: 95104,
    title: "หยุดเครื่อง Overhaul บ่อจุ่มน้ำมันกันสนิมทั้งระบบ",
    description: "ดำเนินการ Overhaul บ่อจุ่มน้ำมันกันสนิมทั้งระบบตามแผนจาก WO95103 เปลี่ยนน้ำมันและซีลรางระบายทั้งหมด",
    priority: "high",
    status: "in_progress",
    assignedDate: "2026-09-08",
    dueDate: "2026-09-12",
    finishHourUtc: null,
    symptoms: ["คราบตะกรันสะสมทั้งระบบ", "คุณภาพการเคลือบผิวต่ำกว่ามาตรฐาน"],
    actionPlan: [
      "ระบายน้ำมันกันสนิมเก่าออกทั้งหมด",
      "ล้างทำความสะอาดบ่อจุ่มและรางระบายทั้งระบบ",
      "เปลี่ยนซีลรางระบาย",
      "เติมน้ำมันกันสนิมใหม่ทั้งระบบ",
      "ทดสอบเคลือบชิ้นงานตัวอย่าง",
    ],
    partsRequested: ["Rust Preventive Oil", "Drain Seal Kit"],
    solutionSteps: ["ระบายน้ำมันกันสนิมเก่าออกทั้งหมด", "ล้างทำความสะอาดบ่อจุ่มและรางระบาย"],
    stepsCompleted: 2,
    totalSteps: 5,
    estimatedHours: 24,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: null,
    repairDurationMin: null,
    technicians: [TECHS[0], TECHS[2], TECHS[3]],
    cause: "ตะกรันสะสมทั้งระบบจากน้ำมันกันสนิมเสื่อมคุณภาพ ต้อง Overhaul เต็มระบบ",
    repairAction: null,
    technicianNote: "อยู่ระหว่าง Overhaul เต็มระบบ คาดว่าจะแล้วเสร็จภายในกำหนด",
  },
];

/* ------------------------------------------------------------------ */
/* B) AS-1009#0284 — SLINGER PRESS M/C (active hydraulic fault)       */
/* ------------------------------------------------------------------ */

const AS1009_ORDERS: WorkOrderSeed[] = [
  {
    num: 95105,
    title: "PM ตรวจสอบความดันระบบไฮดรอลิก Slinger Press",
    description: "งาน PM ตามรอบตรวจสอบความดันระบบไฮดรอลิกและเปลี่ยนไส้กรองน้ำมัน",
    priority: "low",
    status: "completed",
    assignedDate: "2026-06-14",
    dueDate: "2026-06-14",
    finishHourUtc: "09:40",
    symptoms: null,
    actionPlan: null,
    partsRequested: ["Hydraulic Oil Filter"],
    solutionSteps: ["ตรวจสอบความดันไฮดรอลิก", "เปลี่ยนไส้กรองน้ำมันไฮดรอลิก"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 20,
    repairDurationMin: 30,
    technicians: [TECHS[1]],
    cause: "ครบกำหนดตามแผน PM ตรวจสอบระบบไฮดรอลิก",
    repairAction: "ตรวจสอบความดันไฮดรอลิกและเปลี่ยนไส้กรองน้ำมัน",
    technicianNote: null,
    parts: [{ code: "FLT-HYD14", name: "Hydraulic Oil Filter", quantity: 1, position: "Hydraulic Unit" }],
  },
  {
    num: 95106,
    title: "ปรับตั้งแม่พิมพ์ (Die) แนวดิ่งใหม่หลังพบขอบชิ้นงานเยื้อง",
    description: "พบขอบชิ้นงานเยื้องเล็กน้อยหลังปั๊มขึ้นรูป ตรวจพบแม่พิมพ์เยื้องแนวดิ่ง",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-07-03",
    dueDate: "2026-07-03",
    finishHourUtc: "11:10",
    symptoms: ["ขอบชิ้นงานเยื้องเล็กน้อย"],
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["ตรวจสอบแนวศูนย์แม่พิมพ์", "ปรับตั้งแนวดิ่งแม่พิมพ์ใหม่", "ทดสอบปั๊มชิ้นงานตัวอย่าง"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 45,
    repairDurationMin: 60,
    technicians: [TECHS[2]],
    cause: "แม่พิมพ์ (Die) เยื้องแนวดิ่งจากการสึกหรอของแท่นยึด",
    repairAction: "ปรับตั้งแนวดิ่งแม่พิมพ์ใหม่และทดสอบปั๊มชิ้นงานตัวอย่าง",
    technicianNote: null,
  },
  {
    num: 95107,
    title: "ความดันไฮดรอลิกตกขณะกดขึ้นรูปเพิ่มความถี่มากขึ้น",
    description: "ความดันไฮดรอลิกตกขณะกดขึ้นรูปเกิดถี่ขึ้นในรอบสัปดาห์ที่ผ่านมา",
    priority: "high",
    status: "completed",
    assignedDate: "2026-08-14",
    dueDate: "2026-08-15",
    finishHourUtc: "17:20",
    symptoms: ["ความดันไฮดรอลิกตกขณะกดขึ้นรูป", "เสียงปั๊มไฮดรอลิกดังผิดปกติ"],
    actionPlan: [
      "ตรวจสอบปั๊มไฮดรอลิกหลัก",
      "ตรวจสอบวาล์วควบคุมความดัน",
      "เปลี่ยนซีลกระบอกไฮดรอลิกที่รั่วซึม",
      "นัดติดตามผลใน 14 วัน",
    ],
    partsRequested: ["Cylinder Seal Kit"],
    solutionSteps: ["ตรวจสอบปั๊มไฮดรอลิกหลักและวาล์วควบคุมความดัน", "เปลี่ยนซีลกระบอกไฮดรอลิกที่รั่วซึม"],
    stepsCompleted: 2,
    totalSteps: 4,
    estimatedHours: 5,
    sectionResponse: "Breakdown Maintenance",
    shift: "NIGHT",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 150,
    repairDurationMin: 180,
    technicians: [TECHS[0], TECHS[3]],
    cause: "ซีลกระบอกไฮดรอลิกหลักเสื่อมสภาพ ทำให้ความดันตกขณะรับภาระสูง",
    repairAction: "เปลี่ยนซีลกระบอกไฮดรอลิกที่รั่วซึมและปรับตั้งวาล์วควบคุมความดันใหม่",
    technicianNote: "ความดันยังไม่นิ่งเต็มที่หลังซ่อม แนะนำเฝ้าระวังต่อเนื่อง",
    parts: [{ code: "SEAL-CY60", name: "Cylinder Seal Kit", quantity: 1, position: "Main Hydraulic Cylinder" }],
  },
  {
    num: 95108,
    title: "BREAKDOWN: HYDRAULIC PRESSURE OVER LIMIT (ALM-2210)",
    description: "เครื่องหยุดทำงานอัตโนมัติจาก Error Code ALM-2210 ความดันระบบไฮดรอลิกเกินค่าที่กำหนดขณะกดขึ้นรูป",
    priority: "high",
    status: "in_progress",
    assignedDate: "2026-09-09",
    dueDate: "2026-09-11",
    finishHourUtc: null,
    symptoms: ["Error Code ALM-2210", "ความดันไฮดรอลิกเกินค่ากำหนด", "เครื่องหยุดกลางรอบการปั๊ม"],
    actionPlan: [
      "ตรวจสอบ Alarm ALM-2210",
      "ตรวจสอบวาล์วนิรภัย (Relief Valve)",
      "ถอดตรวจสอบปั๊มไฮดรอลิกหลัก",
      "สั่งอะไหล่ปั๊มไฮดรอลิกด่วน",
      "เปลี่ยนปั๊มและทดสอบเดินเครื่อง",
    ],
    partsRequested: ["Hydraulic Pump", "Relief Valve"],
    solutionSteps: ["ตรวจสอบ Alarm ALM-2210", "ตรวจสอบวาล์วนิรภัย พบวาล์วค้างที่ตำแหน่งเปิด"],
    stepsCompleted: 2,
    totalSteps: 5,
    estimatedHours: 12,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: null,
    repairDurationMin: null,
    technicians: [TECHS[1], TECHS[2]],
    cause: "วาล์วนิรภัย (Relief Valve) ค้างที่ตำแหน่งเปิด ทำให้ความดันไฮดรอลิกเกินค่าที่กำหนดจนระบบ Safety สั่งหยุดเครื่อง",
    repairAction: null,
    technicianNote: "อยู่ระหว่างรออะไหล่ปั๊มไฮดรอลิกจาก Supplier คาดว่าจะได้รับภายใน 2 วัน",
  },
];

/* ------------------------------------------------------------------ */
/* C) MA-602#0083 — LASER MARKER MACHINE (active laser fault)         */
/* ------------------------------------------------------------------ */

const MA602_ORDERS: WorkOrderSeed[] = [
  {
    num: 95109,
    title: "PM ทำความสะอาดเลนส์โฟกัสหัวเลเซอร์",
    description: "งาน PM ตามรอบทำความสะอาดเลนส์โฟกัสและตรวจสอบแนวลำแสงเลเซอร์",
    priority: "low",
    status: "completed",
    assignedDate: "2026-06-20",
    dueDate: "2026-06-20",
    finishHourUtc: "08:50",
    symptoms: null,
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["ทำความสะอาดเลนส์โฟกัส", "ตรวจสอบแนวลำแสงเลเซอร์", "ทดสอบมาร์คชิ้นงานตัวอย่าง"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 10,
    repairDurationMin: 20,
    technicians: [TECHS[3]],
    cause: "ครบกำหนดตามแผน PM ทำความสะอาดเลนส์โฟกัส",
    repairAction: "ทำความสะอาดเลนส์โฟกัสและตรวจสอบแนวลำแสง",
    technicianNote: null,
  },
  {
    num: 95110,
    title: "ซ่อมพัดลมระบายความร้อนหัวเลเซอร์เสียงดังผิดปกติ",
    description: "พัดลมระบายความร้อนหัวเลเซอร์มีเสียงดังผิดปกติและรอบหมุนไม่คงที่",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-07-08",
    dueDate: "2026-07-08",
    finishHourUtc: "10:35",
    symptoms: ["พัดลมระบายความร้อนเสียงดังผิดปกติ", "รอบหมุนพัดลมไม่คงที่"],
    actionPlan: null,
    partsRequested: ["Cooling Fan"],
    solutionSteps: ["ถอดตรวจสอบพัดลมระบายความร้อน", "เปลี่ยนพัดลมตัวใหม่", "ทดสอบระบบระบายความร้อน"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 1,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Machine",
    mtlossMin: 25,
    repairDurationMin: 40,
    technicians: [TECHS[0]],
    cause: "ตลับลูกปืนพัดลมระบายความร้อนสึกหรอ",
    repairAction: "เปลี่ยนพัดลมระบายความร้อนตัวใหม่",
    technicianNote: null,
    parts: [{ code: "FAN-CL80", name: "Cooling Fan", quantity: 1, position: "Laser Head Housing" }],
  },
  {
    num: 95111,
    title: "กำลังเลเซอร์ตกและงานมาร์คจางลงเป็นบางจุด",
    description: "พบกำลังเลเซอร์ตกและงานมาร์คจางลงเป็นบางจุดโดยเฉพาะช่วงเดินเครื่องต่อเนื่องนาน",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-08-11",
    dueDate: "2026-08-12",
    finishHourUtc: "15:10",
    symptoms: ["กำลังเลเซอร์ตกเป็นบางช่วง", "งานมาร์คจางลง"],
    actionPlan: [
      "ตรวจสอบอุณหภูมิ Laser Diode",
      "ตรวจสอบระบบระบายความร้อน",
      "ปรับตั้งกำลังเลเซอร์ชดเชย",
      "นัดติดตามผลใน 14 วัน",
    ],
    partsRequested: null,
    solutionSteps: ["ตรวจสอบอุณหภูมิ Laser Diode พบสูงกว่าเกณฑ์เล็กน้อย", "ปรับตั้งกำลังเลเซอร์ชดเชยชั่วคราว"],
    stepsCompleted: 2,
    totalSteps: 4,
    estimatedHours: 3,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Machine",
    mtlossMin: 80,
    repairDurationMin: 100,
    technicians: [TECHS[1], TECHS[2]],
    cause: "Laser Diode เริ่มเสื่อมสภาพ อุณหภูมิทำงานสูงกว่าเกณฑ์ปกติเล็กน้อย",
    repairAction: "ปรับตั้งกำลังเลเซอร์ชดเชยชั่วคราวระหว่างเฝ้าระวัง",
    technicianNote: "แนวโน้มกำลังเลเซอร์ลดลงต่อเนื่อง คาดว่า Laser Diode ใกล้หมดอายุการใช้งาน",
  },
  {
    num: 95112,
    title: "BREAKDOWN: LASER DIODE TEMPERATURE FAULT (ALM-3305)",
    description: "เครื่องหยุดทำงานอัตโนมัติจาก Error Code ALM-3305 อุณหภูมิ Laser Diode เกินค่าที่กำหนด",
    priority: "high",
    status: "pending",
    assignedDate: "2026-09-09",
    dueDate: "2026-09-12",
    finishHourUtc: null,
    symptoms: ["Error Code ALM-3305", "อุณหภูมิ Laser Diode เกินค่ากำหนดจนเครื่องหยุดอัตโนมัติ"],
    actionPlan: [
      "ตรวจสอบ Alarm ALM-3305",
      "ถอดตรวจสอบชุด Laser Diode",
      "สั่งอะไหล่ Laser Diode ด่วน",
      "รออะไหล่มาส่ง",
      "เปลี่ยน Laser Diode และคาลิเบรตกำลังเลเซอร์ใหม่",
    ],
    partsRequested: ["Laser Diode Module"],
    solutionSteps: null,
    stepsCompleted: 0,
    totalSteps: 5,
    estimatedHours: 10,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Electrical",
    damageSource: "Machine",
    mtlossMin: null,
    repairDurationMin: null,
    technicians: [TECHS[3]],
    cause: "Laser Diode เสื่อมสภาพจนระบบ Safety สั่งหยุดเครื่องอัตโนมัติจากอุณหภูมิเกินค่ากำหนด",
    repairAction: null,
    technicianNote: "รออะไหล่ Laser Diode Module จาก Supplier",
  },
];

/* ------------------------------------------------------------------ */
/* D) PK-1502#0892 — PACKING TABLE M/C (scheduled PM, no fault)       */
/* ------------------------------------------------------------------ */

const PK1502_ORDERS: WorkOrderSeed[] = [
  {
    num: 95113,
    title: "PM หยอดน้ำมันหล่อลื่นโซ่ลำเลียงโต๊ะบรรจุ",
    description: "งาน PM ตามรอบหยอดน้ำมันหล่อลื่นโซ่ลำเลียงและตรวจสอบความตึงสายพาน",
    priority: "low",
    status: "completed",
    assignedDate: "2026-06-05",
    dueDate: "2026-06-05",
    finishHourUtc: "08:15",
    symptoms: null,
    actionPlan: null,
    partsRequested: null,
    solutionSteps: ["หยอดน้ำมันหล่อลื่นโซ่ลำเลียง", "ตรวจสอบความตึงสายพาน"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 10,
    repairDurationMin: 15,
    technicians: [TECHS[2]],
    cause: "ครบกำหนดตามแผน PM หยอดน้ำมันหล่อลื่นโซ่ลำเลียง",
    repairAction: "หยอดน้ำมันหล่อลื่นโซ่ลำเลียงและตรวจสอบความตึงสายพาน",
    technicianNote: null,
  },
  {
    num: 95114,
    title: "ซ่อมลูกกลิ้งลำเลียง (Conveyor Roller) สึกหรอเสียงดัง",
    description: "ลูกกลิ้งลำเลียงบริเวณจุดบรรจุมีเสียงดังผิดปกติและหมุนฝืด",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-07-14",
    dueDate: "2026-07-14",
    finishHourUtc: "13:40",
    symptoms: ["ลูกกลิ้งลำเลียงเสียงดังผิดปกติ", "หมุนฝืดเป็นบางจุด"],
    actionPlan: null,
    partsRequested: ["Conveyor Roller"],
    solutionSteps: ["ถอดตรวจสอบลูกกลิ้งลำเลียง", "เปลี่ยนลูกกลิ้งที่สึกหรอ", "ทดสอบเดินสายพาน"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 40,
    repairDurationMin: 55,
    technicians: [TECHS[0], TECHS[1]],
    cause: "ตลับลูกปืนลูกกลิ้งลำเลียงสึกหรอตามรอบการใช้งาน",
    repairAction: "เปลี่ยนลูกกลิ้งลำเลียงที่สึกหรอและทดสอบเดินสายพาน",
    technicianNote: null,
    parts: [{ code: "ROL-CV25", name: "Conveyor Roller", quantity: 3, position: "Packing Table Infeed" }],
  },
  {
    num: 95115,
    title: "สายพานลำเลียงลื่นไถลบ่อยขึ้นระหว่างบรรจุ",
    description: "สายพานลำเลียงลื่นไถลบ่อยขึ้นระหว่างบรรจุ ทำให้จังหวะบรรจุคลาดเคลื่อน",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-08-07",
    dueDate: "2026-08-08",
    finishHourUtc: "11:55",
    symptoms: ["สายพานลื่นไถลบ่อยขึ้น", "จังหวะบรรจุคลาดเคลื่อน"],
    actionPlan: ["ตรวจสอบความตึงสายพาน", "ทำความสะอาดลูกกลิ้งขับ", "วางแผนเปลี่ยนสายพานในรอบถัดไป"],
    partsRequested: ["Conveyor Belt"],
    solutionSteps: ["ปรับตั้งความตึงสายพานชั่วคราว", "ทำความสะอาดลูกกลิ้งขับ"],
    stepsCompleted: 2,
    totalSteps: 3,
    estimatedHours: 3,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 70,
    repairDurationMin: 90,
    technicians: [TECHS[3]],
    cause: "สายพานลำเลียงยืดตัวและลูกกลิ้งขับสกปรกจากฝุ่นผงสะสม",
    repairAction: "ปรับตั้งความตึงสายพานชั่วคราวและทำความสะอาดลูกกลิ้งขับ",
    technicianNote: "สายพานยืดตัวมากแล้ว แนะนำเปลี่ยนสายพานใหม่ทั้งเส้นในรอบถัดไป",
  },
  {
    num: 95116,
    title: "หยุดเครื่องเปลี่ยนสายพานลำเลียงโต๊ะบรรจุทั้งเส้น",
    description: "ดำเนินการเปลี่ยนสายพานลำเลียงทั้งเส้นตามแผนจาก WO95115 พร้อมปรับตั้งศูนย์ลูกกลิ้งใหม่ทั้งระบบ",
    priority: "high",
    status: "in_progress",
    assignedDate: "2026-09-08",
    dueDate: "2026-09-10",
    finishHourUtc: null,
    symptoms: ["สายพานยืดตัวเกินเกณฑ์", "จังหวะบรรจุคลาดเคลื่อนต่อเนื่อง"],
    actionPlan: [
      "ถอดสายพานเก่าออกทั้งเส้น",
      "ตรวจสอบและปรับตั้งศูนย์ลูกกลิ้งทั้งระบบ",
      "ติดตั้งสายพานใหม่",
      "ทดสอบเดินสายพานและปรับตั้งความตึง",
    ],
    partsRequested: ["Conveyor Belt"],
    solutionSteps: ["ถอดสายพานเก่าออกทั้งเส้น", "ตรวจสอบและปรับตั้งศูนย์ลูกกลิ้งทั้งระบบ"],
    stepsCompleted: 2,
    totalSteps: 4,
    estimatedHours: 10,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: null,
    repairDurationMin: null,
    technicians: [TECHS[0], TECHS[2]],
    cause: "สายพานลำเลียงยืดตัวเกินเกณฑ์การใช้งาน ต้องเปลี่ยนทั้งเส้น",
    repairAction: null,
    technicianNote: "อยู่ระหว่างเปลี่ยนสายพานทั้งเส้น คาดว่าจะแล้วเสร็จภายในกำหนด",
    parts: [{ code: "BLT-CV180", name: "Conveyor Belt", quantity: 1, position: "Packing Table Main Line" }],
  },
];

/* ------------------------------------------------------------------ */
/* E) WA-107#0269 — OUTER RING PART WASH EQUIPMENT M/C (sched. PM)    */
/* ------------------------------------------------------------------ */

const WA107_ORDERS: WorkOrderSeed[] = [
  {
    num: 95117,
    title: "PM เปลี่ยนไส้กรองน้ำยาล้างชิ้นงาน (Washing Fluid Filter)",
    description: "งาน PM ตามรอบเปลี่ยนไส้กรองน้ำยาล้างชิ้นงานและตรวจสอบความดันหัวฉีด",
    priority: "low",
    status: "completed",
    assignedDate: "2026-06-18",
    dueDate: "2026-06-18",
    finishHourUtc: "09:05",
    symptoms: null,
    actionPlan: null,
    partsRequested: ["Washing Fluid Filter"],
    solutionSteps: ["เปลี่ยนไส้กรองน้ำยาล้างชิ้นงาน", "ตรวจสอบความดันหัวฉีด"],
    stepsCompleted: 2,
    totalSteps: 2,
    estimatedHours: 1,
    sectionResponse: "Preventive Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Method",
    mtlossMin: 15,
    repairDurationMin: 20,
    technicians: [TECHS[1]],
    cause: "ครบกำหนดตามแผน PM เปลี่ยนไส้กรองน้ำยาล้าง",
    repairAction: "เปลี่ยนไส้กรองน้ำยาล้างชิ้นงานและตรวจสอบความดันหัวฉีด",
    technicianNote: null,
    parts: [{ code: "FLT-WSH10", name: "Washing Fluid Filter", quantity: 2, position: "Wash Tank Circulation" }],
  },
  {
    num: 95118,
    title: "หัวฉีดน้ำยาล้างบางจุดอุดตัน ล้างไม่ทั่วถึงชิ้นงาน",
    description: "พบหัวฉีดน้ำยาล้างบางจุดอุดตันจากตะกอนโลหะ ทำให้ล้างชิ้นงานไม่ทั่วถึง",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-07-20",
    dueDate: "2026-07-20",
    finishHourUtc: "10:50",
    symptoms: ["หัวฉีดบางจุดอุดตัน", "ชิ้นงานล้างไม่ทั่วถึง"],
    actionPlan: null,
    partsRequested: ["Nozzle Set"],
    solutionSteps: ["ถอดตรวจสอบหัวฉีดทั้งชุด", "ทำความสะอาด/เปลี่ยนหัวฉีดที่อุดตัน", "ทดสอบล้างชิ้นงานตัวอย่าง"],
    stepsCompleted: 3,
    totalSteps: 3,
    estimatedHours: 2,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 35,
    repairDurationMin: 50,
    technicians: [TECHS[2]],
    cause: "ตะกอนโลหะสะสมอุดตันหัวฉีดน้ำยาล้างบางจุด",
    repairAction: "ทำความสะอาดและเปลี่ยนหัวฉีดที่อุดตัน",
    technicianNote: null,
    parts: [{ code: "NZL-SET08", name: "Nozzle Set", quantity: 1, position: "Wash Chamber" }],
  },
  {
    num: 95119,
    title: "ปั๊มหมุนเวียนน้ำยาล้างมีเสียงดังและแรงดันลดลง",
    description: "ปั๊มหมุนเวียนน้ำยาล้างมีเสียงดังผิดปกติและแรงดันน้ำยาล้างลดลงต่อเนื่อง",
    priority: "medium",
    status: "completed",
    assignedDate: "2026-08-13",
    dueDate: "2026-08-14",
    finishHourUtc: "14:30",
    symptoms: ["ปั๊มหมุนเวียนเสียงดังผิดปกติ", "แรงดันน้ำยาล้างลดลงต่อเนื่อง"],
    actionPlan: [
      "ตรวจสอบใบพัดปั๊มหมุนเวียน",
      "ตรวจสอบซีลกันรั่วซึมของปั๊ม",
      "วางแผนเปลี่ยนซีลปั๊มในรอบถัดไป",
    ],
    partsRequested: ["Pump Seal Kit"],
    solutionSteps: ["ตรวจสอบใบพัดปั๊มหมุนเวียน พบสภาพปกติ", "ตรวจพบซีลกันรั่วซึมเสื่อมสภาพ"],
    stepsCompleted: 2,
    totalSteps: 3,
    estimatedHours: 3,
    sectionResponse: "Breakdown Maintenance",
    shift: "DAY",
    repairCategory: "Mechanical",
    damageSource: "Machine",
    mtlossMin: 60,
    repairDurationMin: 80,
    technicians: [TECHS[0], TECHS[3]],
    cause: "ซีลกันรั่วซึมของปั๊มหมุนเวียนน้ำยาล้างเสื่อมสภาพตามรอบการใช้งาน",
    repairAction: null,
    technicianNote: "แรงดันยังต่ำกว่ามาตรฐานเล็กน้อย รอเปลี่ยนซีลปั๊มในรอบถัดไป",
  },
  {
    num: 95120,
    title: "หยุดเครื่องเปลี่ยนซีลปั๊มหมุนเวียนน้ำยาล้างทั้งชุด",
    description: "ดำเนินการเปลี่ยนซีลปั๊มหมุนเวียนน้ำยาล้างทั้งชุดตามแผนจาก WO95119 พร้อมล้างทำความสะอาดถังพักน้ำยา",
    priority: "high",
    status: "pending",
    assignedDate: "2026-09-10",
    dueDate: "2026-09-13",
    finishHourUtc: null,
    symptoms: ["ซีลกันรั่วซึมของปั๊มหมุนเวียนน้ำยาล้างเสื่อมสภาพตามที่พบใน WO95119", "แรงดันน้ำยาล้างยังต่ำกว่ามาตรฐานเล็กน้อยระหว่างรอหยุดเครื่องเปลี่ยนซีล"],
    actionPlan: [
      "ถอดปั๊มหมุนเวียนออกจากระบบ",
      "เปลี่ยนซีลกันรั่วซึมทั้งชุด",
      "ล้างทำความสะอาดถังพักน้ำยา",
      "ประกอบและทดสอบเดินระบบ",
    ],
    partsRequested: ["Pump Seal Kit"],
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
    technicians: [TECHS[1]],
    cause: "ซีลกันรั่วซึมของปั๊มหมุนเวียนน้ำยาล้างเสื่อมสภาพ รอเปลี่ยนตามแผนจาก WO95119",
    repairAction: null,
    technicianNote: "อยู่ระหว่างหยุดเครื่องเปลี่ยนซีลปั๊มหมุนเวียนน้ำยาล้างทั้งชุดตามแผน คาดว่าจะแล้วเสร็จภายในกำหนด",
    parts: [{ code: "SEAL-PM40", name: "Pump Seal Kit", quantity: 1, position: "Circulation Pump" }],
  },
];

/* ------------------------------------------------------------------ */
/* Machine targets                                                    */
/* ------------------------------------------------------------------ */

const TARGETS: MachineTarget[] = [
  {
    id: "AR-1031#0576",
    expectedCode: "AR-1031",
    expectedName: "RUST PREVENTION MACHINE",
    nameRaw: "Rust Prevention Machine",
    lineLocation: "RUST-PREV",
    seedBase: 0xa10001,
    current: { spindle_temp: 71.5, vibration_mms: 3.2, health_score: 58 },
    healthScorePatch: 58,
    model: "RPM-450 [MOCK]",
    operatingHours: 38_460,
    lastMaintenanceOffsetDays: -6,
    activeErrorCode: null,
    activeErrorDesc: null,
    thresholds: [
      { metric: "spindle_temp", label: "อุณหภูมิบ่อน้ำมันกันสนิม", unit: "°C", decimals: 1, warn: 70, critical: 82, worseDirection: "high" },
      { metric: "vibration_mms", label: "ความสั่นสะเทือนปั๊มหมุนเวียนน้ำมัน", unit: " mm/s", decimals: 2, warn: 3.0, critical: 6.5, worseDirection: "high" },
      { metric: "health_score", label: "ดัชนีสุขภาพเครื่องจักร", unit: "", decimals: 0, warn: 60, critical: 40, worseDirection: "low" },
    ],
    orders: AR1031_ORDERS,
  },
  {
    id: "AS-1009#0284",
    expectedCode: "AS-1009",
    expectedName: "SLINGER PRESS M/C",
    nameRaw: "Slinger Press M/C",
    lineLocation: "SLINGER",
    seedBase: 0xa20001,
    current: { spindle_temp: 79.8, vibration_mms: 6.4, health_score: 47 },
    healthScorePatch: 47,
    model: "SLP-620 [MOCK]",
    operatingHours: 51_120,
    lastMaintenanceOffsetDays: -2,
    activeErrorCode: "ALM-2210",
    activeErrorDesc:
      "HYDRAULIC PRESSURE OVER LIMIT - ความดันระบบไฮดรอลิกเกินค่าที่กำหนดขณะกดขึ้นรูป คาดว่าวาล์วนิรภัย (Relief Valve) ค้างที่ตำแหน่งเปิด อยู่ระหว่างรออะไหล่ปั๊มไฮดรอลิก",
    thresholds: [
      { metric: "spindle_temp", label: "อุณหภูมิน้ำมันไฮดรอลิก", unit: "°C", decimals: 1, warn: 75, critical: 90, worseDirection: "high" },
      { metric: "vibration_mms", label: "ความสั่นสะเทือนกระบอกไฮดรอลิกหลัก", unit: " mm/s", decimals: 2, warn: 4.0, critical: 6.0, worseDirection: "high" },
      { metric: "health_score", label: "ดัชนีสุขภาพเครื่องจักร", unit: "", decimals: 0, warn: 55, critical: 35, worseDirection: "low" },
    ],
    orders: AS1009_ORDERS,
  },
  {
    id: "MA-602#0083",
    expectedCode: "MA-602",
    expectedName: "LASER MARKER MACHINE",
    nameRaw: "Laser Marker Machine",
    lineLocation: "LASER-MARK",
    seedBase: 0xa30001,
    current: { spindle_temp: 68.0, vibration_mms: 3.8, health_score: 45 },
    healthScorePatch: 45,
    model: "LMK-310 [MOCK]",
    operatingHours: 29_760,
    lastMaintenanceOffsetDays: -1,
    activeErrorCode: "ALM-3305",
    activeErrorDesc:
      "LASER DIODE TEMPERATURE FAULT - อุณหภูมิ Laser Diode เกินค่าที่กำหนดจนระบบ Safety สั่งหยุดเครื่องอัตโนมัติ อยู่ระหว่างรออะไหล่ Laser Diode Module",
    thresholds: [
      { metric: "spindle_temp", label: "อุณหภูมิ Laser Diode", unit: "°C", decimals: 1, warn: 60, critical: 67, worseDirection: "high" },
      { metric: "vibration_mms", label: "ความสั่นสะเทือนหัวเลเซอร์", unit: " mm/s", decimals: 2, warn: 3.5, critical: 5.5, worseDirection: "high" },
      { metric: "health_score", label: "ดัชนีสุขภาพเครื่องจักร", unit: "", decimals: 0, warn: 55, critical: 35, worseDirection: "low" },
    ],
    orders: MA602_ORDERS,
  },
  {
    id: "PK-1502#0892",
    expectedCode: "PK-1502",
    expectedName: "PACKING TABLE M/C",
    nameRaw: "Packing Table M/C",
    lineLocation: "PACKING",
    seedBase: 0xa40001,
    // vibration_mms raised from 3.0 to 3.6: the belt is visibly worn (that is the
    // whole reason WO95116 exists — high priority, in_progress, machine stopped for
    // belt replacement), so the vibration reading must not look untouched. Still well
    // under the vibration critical threshold below — this is a scheduled repair, not
    // an active fault.
    current: { spindle_temp: 65.0, vibration_mms: 3.6, health_score: 63 },
    healthScorePatch: 63,
    model: "PKT-210 [MOCK]",
    operatingHours: 44_280,
    lastMaintenanceOffsetDays: -3,
    activeErrorCode: null,
    activeErrorDesc: null,
    thresholds: [
      { metric: "spindle_temp", label: "อุณหภูมิมอเตอร์ขับสายพานลำเลียง", unit: "°C", decimals: 1, warn: 68, critical: 82, worseDirection: "high" },
      // warn tightened from 3.5 to 3.0 so the worn-belt vibration story (see `current`
      // above) actually lands at เฝ้าระวัง instead of reading as ปกติ on a machine
      // that is stopped, high-priority, and in_progress for a belt swap.
      { metric: "vibration_mms", label: "ความสั่นสะเทือนลูกกลิ้งลำเลียง", unit: " mm/s", decimals: 2, warn: 3.0, critical: 6.0, worseDirection: "high" },
      { metric: "health_score", label: "ดัชนีสุขภาพเครื่องจักร", unit: "", decimals: 0, warn: 60, critical: 40, worseDirection: "low" },
    ],
    orders: PK1502_ORDERS,
  },
  {
    id: "WA-107#0269",
    expectedCode: "WA-107",
    expectedName: "OUTER RING PART WASH EQUIPMENT M/C",
    nameRaw: "Outer Ring Part Wash Equipment M/C",
    lineLocation: "WASH",
    seedBase: 0xa50001,
    current: { spindle_temp: 73.0, vibration_mms: 4.5, health_score: 55 },
    healthScorePatch: 55,
    model: "WSH-540 [MOCK]",
    operatingHours: 33_900,
    lastMaintenanceOffsetDays: -8,
    activeErrorCode: null,
    activeErrorDesc: null,
    thresholds: [
      { metric: "spindle_temp", label: "อุณหภูมิปั๊มหมุนเวียนน้ำยาล้าง", unit: "°C", decimals: 1, warn: 70, critical: 85, worseDirection: "high" },
      { metric: "vibration_mms", label: "ความสั่นสะเทือนปั๊มหมุนเวียนน้ำยาล้าง", unit: " mm/s", decimals: 2, warn: 4.0, critical: 6.5, worseDirection: "high" },
      { metric: "health_score", label: "ดัชนีสุขภาพเครื่องจักร", unit: "", decimals: 0, warn: 60, critical: 40, worseDirection: "low" },
    ],
    orders: WA107_ORDERS,
  },
];

/* ------------------------------------------------------------------ */
/* Machine lookup                                                     */
/* ------------------------------------------------------------------ */

async function resolveMachine(target: MachineTarget): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from("machines").select("*").eq("id", target.id).maybeSingle();
  if (error) throw new Error(`Machine lookup failed for id "${target.id}": ${error.message}`);
  if (!data) throw new Error(`No machine found with id "${target.id}".`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST row shape, checked field-by-field below
  const row = data as any;

  if (row.code !== target.expectedCode) {
    throw new Error(`Machine id "${target.id}" has code "${row.code}", expected "${target.expectedCode}". Refusing to touch it.`);
  }
  if (row.name !== target.expectedName) {
    throw new Error(`Machine id "${target.id}" has name "${row.name}", expected "${target.expectedName}". Refusing to touch it.`);
  }
  if (row.status !== "maintenance") {
    console.warn(`  [warn] machine id="${target.id}" has status "${row.status}", expected "maintenance" — proceeding, but this was supposed to already be set by a separate task.`);
  }
  assertNotOffLimits({ id: row.id, code: row.code, name: row.name });
  return row as Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Machine patch builder                                              */
/* ------------------------------------------------------------------ */

function buildMachinePatch(target: MachineTarget, now: Date, existingNotes: string[]) {
  const lastMaintenance = isoDate(now, target.lastMaintenanceOffsetDays);
  // next_maintenance = last_maintenance + 90 days, the same TBM cadence
  // mock-machine.ts uses — NOT an independent offset from `now`.
  const nextMaintenance = addDays(lastMaintenance, 90);
  return {
    // status intentionally NOT included here beyond keeping it 'maintenance' —
    // a separate task already set it and this script must not fight that task or
    // any other machine's status.
    status: "maintenance",
    model: target.model,
    health_score: target.healthScorePatch,
    spindle_temp: target.current.spindle_temp,
    vibration_mms: target.current.vibration_mms,
    operating_hours: target.operatingHours,
    last_maintenance: lastMaintenance,
    next_maintenance: nextMaintenance,
    active_error_code: target.activeErrorCode,
    active_error_desc: target.activeErrorDesc,
    lifecycle_status: "APPROVED",
    qr_code_url: buildQrUrl(target.expectedCode),
    image_url: buildImageUrl(`${target.expectedName} (${target.expectedCode})`),
    info_notes: [...existingNotes, MOCK_MARKER, MOCK_NOTE_TH],
  };
}

const OWNED_MACHINE_COLUMNS = [
  "status",
  "model",
  "health_score",
  "spindle_temp",
  "vibration_mms",
  "operating_hours",
  "last_maintenance",
  "next_maintenance",
  "active_error_code",
  "active_error_desc",
  "lifecycle_status",
  "qr_code_url",
  "image_url",
  "info_notes",
] as const;

/* ------------------------------------------------------------------ */
/* Per-machine backup (machines + telemetry) — same shape as          */
/* mock-abnormal-machine.ts, one file per machine id.                  */
/* ------------------------------------------------------------------ */

interface MachineBackupFile {
  capturedAt: string;
  machineId: string;
  machineCode: string | null;
  machineName: string;
  machineRowBefore: Record<string, unknown>;
  telemetryIdsBefore: string[];
}

const machineBackupPath = (machineId: string) =>
  resolve(BACKUP_DIR, `${machineId.replace(/[^A-Za-z0-9_-]/g, "_")}.before.json`);

function readMachineBackup(machineId: string): MachineBackupFile | null {
  const p = machineBackupPath(machineId);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as MachineBackupFile;
}

/** Paged telemetry id fetch — PostgREST caps an unpaged select at 1000 rows. */
async function telemetryIds(machineId: string, mockOnly: boolean): Promise<string[]> {
  const PAGE = 1000;
  const ids: string[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = supabase
      .from("telemetry_readings")
      .select("id")
      .eq("machine_id", machineId)
      .order("id")
      .range(from, from + PAGE - 1);
    if (mockOnly) query = query.like("id", `${idPrefix(machineId)}%`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST row shape
    const { data, error } = await query;
    if (error) throw new Error(`telemetry lookup failed: ${error.message}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST row shape
    const page = (data ?? []).map((r: any) => r.id as string);
    ids.push(...page);
    if (page.length < PAGE) return ids;
  }
}

/* ------------------------------------------------------------------ */
/* Work order history backup — one shared file, same shape as         */
/* mock-repair-history.ts.                                             */
/* ------------------------------------------------------------------ */

interface HistoryBackupFile {
  capturedAt: string;
  machines: { id: string; code: string; preExistingWorkOrderIds: string[] }[];
  insertedWorkOrderIds: string[];
  insertedPartIds: string[];
}

function readHistoryBackup(): HistoryBackupFile | null {
  if (!existsSync(HISTORY_BACKUP_PATH)) return null;
  return JSON.parse(readFileSync(HISTORY_BACKUP_PATH, "utf8")) as HistoryBackupFile;
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST row shape
    const page = (data ?? []).map((r: any) => r.id as string);
    ids.push(...page);
    if (page.length < PAGE) return ids;
  }
}

function workOrderId(seed: WorkOrderSeed): string {
  return `WO${seed.num}`;
}

function partId(seed: WorkOrderSeed, index: number): string {
  return `${workOrderId(seed)}-P${index + 1}`;
}

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
    data_quality_flags: [MOCK_MARKER],
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
/* apply / revert                                                     */
/* ------------------------------------------------------------------ */

async function apply(dryRun: boolean) {
  const resolved: { target: MachineTarget; machine: Record<string, unknown> }[] = [];
  for (const target of TARGETS) {
    const machine = await resolveMachine(target);
    console.log(`Resolved id=${machine.id}  code=${machine.code}  name=${machine.name}`);
    resolved.push({ target, machine });
  }

  // --- collision guard for the reserved WO95101-WO95120 block --------------
  const historyBackup = readHistoryBackup();
  const allowedExisting = new Set(historyBackup?.insertedWorkOrderIds ?? []);
  const allWoIds = TARGETS.flatMap((t) => t.orders.map(workOrderId));
  const { data: collisionRows, error: collisionErr } = await supabase.from("work_orders").select("id").in("id", allWoIds);
  if (collisionErr) throw new Error(`Collision check failed: ${collisionErr.message}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PostgREST row shape
  const collisions = (collisionRows ?? []).map((r: any) => r.id as string).filter((id) => !allowedExisting.has(id));
  if (collisions.length > 0) {
    throw new Error(
      `Refusing to proceed: the following reserved ids already exist and were not created by a previous ` +
        `run of this script: ${collisions.join(", ")}`
    );
  }

  console.log("\n--- plan: machines + telemetry ---");
  const nowsAndSeries: { target: MachineTarget; machine: Record<string, unknown>; patch: Record<string, unknown>; series: Series[]; now: Date }[] = [];
  for (const { target, machine } of resolved) {
    const existingBackup = readMachineBackup(target.id);
    const notesBefore: string[] = existingBackup
      ? (existingBackup.machineRowBefore.info_notes as string[] | null) ?? []
      : ((machine.info_notes as string[] | null) ?? []);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const patch = buildMachinePatch(target, now, notesBefore);
    const series = buildSeries(now, target.seedBase, target.current);
    nowsAndSeries.push({ target, machine, patch, series, now });

    console.log(`\n${target.expectedName} (${target.id}):`);
    for (const [k, v] of Object.entries(patch)) {
      const before = machine[k];
      const show = (x: unknown) => (typeof x === "string" && x.length > 70 ? `${x.slice(0, 67)}… (${x.length} chars)` : JSON.stringify(x));
      console.log(`    ${k}: ${show(before)}  ->  ${show(v)}`);
    }
    for (const s of series) {
      const vals = s.points.map((p) => p.value);
      console.log(`    telemetry ${s.metric}: ${s.points.length} rows  min=${Math.min(...vals)} max=${Math.max(...vals)} last=${vals[vals.length - 1]}`);
    }
  }

  // --- build work_orders + work_order_parts rows now (pure, no DB writes) so the
  // condition-monitoring readout can be computed and printed even in --dry-run. ---
  const workOrderRows: Record<string, unknown>[] = [];
  const partRows: Record<string, unknown>[] = [];
  for (const { target, machine } of resolved) {
    const lastSeed = target.orders[target.orders.length - 1];
    const seriesEntry = nowsAndSeries.find((e) => e.target.id === target.id);
    for (const seed of target.orders) {
      const row = buildWorkOrderRow(seed, { id: target.id, code: machine.code as string }, target);
      if (seed === lastSeed && seriesEntry) {
        // The most recent (in_progress/pending) work order carries the
        // condition-monitoring readout, computed from THIS machine's own generated
        // telemetry series so the numbers always match the chart.
        const readout = buildConditionReadout(target, seriesEntry.series, seriesEntry.now);
        row.symptoms = [...((row.symptoms as string[] | null) ?? []), ...readout.symptomsLines];
        row.technician_note = row.technician_note ? `${row.technician_note as string} ${readout.technicianNote}` : readout.technicianNote;
      }
      workOrderRows.push(row);
      partRows.push(...buildPartRows(seed));
    }
  }

  console.log("\n--- plan: work orders ---");
  for (const target of TARGETS) {
    console.log(`\n${target.expectedName} (${target.expectedCode}):`);
    for (const seed of target.orders) {
      console.log(`    ${workOrderId(seed)}  ${seed.assignedDate}  ${seed.status.padEnd(11)} ${seed.priority.padEnd(6)} ${seed.title}`);
    }
    const lastRow = workOrderRows.find((r) => r.machine_id === target.id && r.id === workOrderId(target.orders[target.orders.length - 1]));
    if (lastRow) {
      console.log(`    -- condition-monitoring readout on ${lastRow.id} --`);
      for (const line of (lastRow.symptoms as string[]) ?? []) console.log(`      ${line}`);
      console.log(`      technician_note: ${lastRow.technician_note as string}`);
    }
  }
  const totalOrders = TARGETS.reduce((sum, t) => sum + t.orders.length, 0);
  const totalParts = TARGETS.reduce((sum, t) => sum + t.orders.reduce((s, o) => s + (o.parts?.length ?? 0), 0), 0);
  console.log(`\nTotals: ${resolved.length} machines, ${totalOrders} work orders, ${totalParts} parts, ${resolved.length * 3 * POINTS} telemetry rows.`);

  if (dryRun) {
    console.log("\n[dry-run] nothing written.");
    return;
  }

  mkdirSync(BACKUP_DIR, { recursive: true });

  // --- machines + telemetry, one machine at a time (matches mock-abnormal-machine.ts) ---
  for (const { target, machine, patch, series } of nowsAndSeries) {
    const existing = readMachineBackup(target.id);
    const backup: MachineBackupFile = existing ?? {
      capturedAt: new Date().toISOString(),
      machineId: target.id,
      machineCode: machine.code as string | null,
      machineName: machine.name as string,
      machineRowBefore: { ...machine },
      telemetryIdsBefore: await telemetryIds(target.id, false),
    };
    if (!existing) {
      writeFileSync(machineBackupPath(target.id), JSON.stringify(backup, null, 2), "utf8");
      console.log(`Wrote pre-change backup: ${machineBackupPath(target.id)}`);
    }

    const { error: upErr } = await supabase.from("machines").update(patch).eq("id", target.id);
    if (upErr) throw new Error(`machines update failed for ${target.id}: ${upErr.message}`);

    const rows = series.flatMap((s) =>
      s.points.map((p, i) => ({
        id: mockReadingId(target.id, s.metric, i),
        machine_id: target.id,
        metric: s.metric,
        value: p.value,
        source: TELEMETRY_SOURCE,
        recorded_at: p.recordedAt.toISOString(),
      }))
    );
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error } = await supabase.from("telemetry_readings").upsert(chunk, { onConflict: "id" });
      if (error) throw new Error(`telemetry upsert failed for ${target.id} at row ${i}: ${error.message}`);
    }
    console.log(`${target.id}: machines row updated, ${rows.length} telemetry rows upserted.`);
  }

  // --- work orders + parts, one shared backup/collision domain -------------
  const finalHistoryBackup: HistoryBackupFile = historyBackup ?? {
    capturedAt: new Date().toISOString(),
    machines: await Promise.all(
      resolved.map(async ({ target, machine }) => ({
        id: target.id,
        code: machine.code as string,
        preExistingWorkOrderIds: await workOrderIdsForCode(machine.code as string),
      }))
    ),
    insertedWorkOrderIds: [],
    insertedPartIds: [],
  };

  // workOrderRows / partRows were already built above (before the --dry-run gate),
  // condition-monitoring readout included, so they're reused here as-is.

  // Record ids about to be written, and flush to disk, BEFORE the first write —
  // same reasoning as mock-repair-history.ts: losing the backup after a partial
  // write would leave orphan mock rows with no vouching record.
  finalHistoryBackup.insertedWorkOrderIds = Array.from(new Set([...finalHistoryBackup.insertedWorkOrderIds, ...workOrderRows.map((r) => r.id as string)]));
  finalHistoryBackup.insertedPartIds = Array.from(new Set([...finalHistoryBackup.insertedPartIds, ...partRows.map((r) => r.id as string)]));
  writeFileSync(HISTORY_BACKUP_PATH, JSON.stringify(finalHistoryBackup, null, 2), "utf8");
  console.log(`Wrote backup: ${HISTORY_BACKUP_PATH}`);

  for (let i = 0; i < workOrderRows.length; i += 500) {
    const { error } = await supabase.from("work_orders").upsert(workOrderRows.slice(i, i + 500), { onConflict: "id" });
    if (error) throw new Error(`work_orders upsert failed at row ${i}: ${error.message}`);
  }
  console.log(`work_orders upserted: ${workOrderRows.length} rows.`);

  for (let i = 0; i < partRows.length; i += 500) {
    const { error } = await supabase.from("work_order_parts").upsert(partRows.slice(i, i + 500), { onConflict: "id" });
    if (error) throw new Error(`work_order_parts upsert failed at row ${i}: ${error.message}`);
  }
  console.log(`work_order_parts upserted: ${partRows.length} rows.`);

  console.log("\nDone. Revert with:  npm run mock:maintenance-fleet -- --revert");
}

async function revert(dryRun: boolean) {
  // --- machines + telemetry ---
  for (const target of TARGETS) {
    const machine = await resolveMachine(target);
    const backup = readMachineBackup(target.id);
    if (!backup) {
      console.log(`${target.id}: no machine backup at ${machineBackupPath(target.id)} — skipping machine/telemetry revert.`);
      continue;
    }
    const restore: Record<string, unknown> = {};
    for (const col of OWNED_MACHINE_COLUMNS) restore[col] = backup.machineRowBefore[col] ?? null;

    const before = new Set(backup.telemetryIdsBefore);
    const toDelete = (await telemetryIds(target.id, true)).filter((id) => !before.has(id));

    console.log(`${target.id}: restore ${Object.keys(restore).length} columns, delete ${toDelete.length} telemetry rows.`);
    if (dryRun) continue;

    const { error: upErr } = await supabase.from("machines").update(restore).eq("id", target.id);
    if (upErr) throw new Error(`machines revert failed for ${target.id}: ${upErr.message}`);
    for (let i = 0; i < toDelete.length; i += 500) {
      const { error } = await supabase.from("telemetry_readings").delete().in("id", toDelete.slice(i, i + 500));
      if (error) throw new Error(`telemetry delete failed for ${target.id}: ${error.message}`);
    }
    console.log(`${target.id}: reverted (machine ${machine.name}).`);
  }

  // --- work orders + parts ---
  const historyBackup = readHistoryBackup();
  if (!historyBackup) {
    console.log(`No history backup at ${HISTORY_BACKUP_PATH} — nothing to revert.`);
    return;
  }
  const preExisting = new Set(historyBackup.machines.flatMap((m) => m.preExistingWorkOrderIds));
  const workOrderIdsToDelete = historyBackup.insertedWorkOrderIds.filter((id) => !preExisting.has(id));
  const skipped = historyBackup.insertedWorkOrderIds.length - workOrderIdsToDelete.length;

  console.log(`Reverting work order history using backup captured ${historyBackup.capturedAt}`);
  console.log(`  work_order_parts to delete: ${historyBackup.insertedPartIds.length}`);
  console.log(`  work_orders to delete: ${workOrderIdsToDelete.length}`);
  if (skipped > 0) console.log(`  [warn] skipping ${skipped} id(s) that pre-date this script — not ours to delete.`);

  if (dryRun) {
    console.log("[dry-run] nothing written.");
    return;
  }

  for (let i = 0; i < historyBackup.insertedPartIds.length; i += 500) {
    const { error } = await supabase.from("work_order_parts").delete().in("id", historyBackup.insertedPartIds.slice(i, i + 500));
    if (error) throw new Error(`work_order_parts delete failed: ${error.message}`);
  }
  for (let i = 0; i < workOrderIdsToDelete.length; i += 500) {
    const { error } = await supabase.from("work_orders").delete().in("id", workOrderIdsToDelete.slice(i, i + 500));
    if (error) throw new Error(`work_orders delete failed: ${error.message}`);
  }
  console.log(`Reverted. Deleted ${historyBackup.insertedPartIds.length} work_order_parts and ${workOrderIdsToDelete.length} work_orders.`);
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
