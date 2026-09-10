/**
 * mock-machine-metrics.ts — ใส่ค่าจำลอง (demo values) ให้คอลัมน์ spindle_temp,
 * vibration_mms และ operating_hours ของตาราง machines ซึ่งเป็น NULL ทั้งหมดในทุกแถว
 * (~973 เครื่อง) เพราะโรงงานจริงยังไม่มีเซนเซอร์ติดตั้ง
 *
 * ⚠️  ค่าที่สคริปต์นี้เขียนเป็นข้อมูลจำลองล้วน ๆ ไม่ได้มาจากเซนเซอร์จริง สร้างขึ้นเพื่อให้
 *     หน้า UI (การ์ด/ตารางเครื่องจักร) มีตัวเลขให้แสดงผลระหว่างสาธิตเท่านั้น
 *     ห้ามใช้อ้างอิงเป็นข้อมูลสภาพเครื่องจักรจริงเด็ดขาด
 *
 * วิธีคำนวณ: แต่ละเครื่องได้ค่า deterministic จาก hash ของ machines.code (เครื่องเดียวกัน
 * รันกี่ครั้งก็ได้ค่าเดิมเสมอ ไม่ใช้ Math.random()) แล้ว map เข้าแถบค่าตามสถานะเครื่อง
 * (status) โดยอิงขีดจำกัดจริงจาก backend/src/lib/thresholds.ts:
 *   - normal      -> แถบปกติ      (spindle_temp < 75°C, vibration_mms < 2.8 mm/s)
 *   - warning     -> แถบเฝ้าระวัง (75-84.9°C, 2.8-7.09 mm/s)
 *   - error       -> แถบวิกฤต     (>= 85°C, >= 7.1 mm/s)
 *   - maintenance -> แถบเฝ้าระวัง (เครื่องหยุดซ่อม ค่าที่เห็นก่อนหยุดจึงมักอยู่ระดับเฝ้าระวัง)
 * operating_hours เป็นชั่วโมงทำงานสะสมแบบสมเหตุสมผล (~2,000-60,000 ชม.) จาก hash คนละตัว
 * ไม่ผูกกับ temp/vibration เพื่อไม่ให้ค่าทั้งสามกลุ่มสัมพันธ์กันแบบเทียม
 *
 * ปัดเศษ: spindle_temp ทศนิยม 1 ตำแหน่ง, vibration_mms ทศนิยม 2 ตำแหน่ง, operating_hours
 * เป็นจำนวนเต็ม
 *
 * วิธีรัน (ตรวจก่อนด้วย --dry-run เสมอ):
 *   npm run mock:machine-metrics -- --dry-run   # พิมพ์ตัวอย่าง ~10 แถว + min/max/avg ต่อฟิลด์ ไม่เขียนอะไร
 *   npm run mock:machine-metrics                # เขียนจริง (idempotent, รันซ้ำได้ค่าเดิม)
 *
 * การเขียน: ใช้ UPDATE ทีละแถว (ไม่ใช่ upsert) เพราะแถวเหล่านี้มีอยู่แล้วในตาราง — upsert
 * จะสร้าง phantom insert row ที่ขาดคอลัมน์ NOT NULL อื่น ๆ (เช่น name) ทำให้ทั้ง batch ล้มเหลว
 * รันแบบ bounded concurrency (chunk ละ ~20 คำขอพร้อมกัน) และนับผลสำเร็จ/ล้มเหลวรายแถว
 * ไม่ abort ทั้งรันเมื่อแถวใดแถวหนึ่ง error
 */

import { supabase } from "../src/lib/supabase.js";
import { SPINDLE_TEMP, VIBRATION } from "../src/lib/thresholds.js";

const PAGE_SIZE = 1000;
const UPDATE_CONCURRENCY = 20;

type MachineStatus = "normal" | "warning" | "error" | "maintenance";

interface MachineRow {
  id: string;
  code: string | null;
  status: string;
}

interface MetricValues {
  spindleTemp: number;
  vibrationMms: number;
  operatingHours: number;
}

/* ------------------------------------------------------------------ */
/* Deterministic hash — no Math.random(), same code always -> same value */
/* ------------------------------------------------------------------ */

/**
 * FNV-1a 32-bit hash of a string, salted so the same machine code produces
 * independent-looking values for each of the three fields.
 */
function hashToUnit(input: string, salt: string): number {
  let h = 0x811c9dc5;
  const s = `${salt}:${input}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // >>> 0 forces unsigned; dividing by 2^32 maps to [0, 1)
  return (h >>> 0) / 4294967296;
}

function lerp(unit: number, min: number, max: number): number {
  return min + unit * (max - min);
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Machine statuses that are not one of the four handled bands fall back to "normal". */
function normalizeStatus(status: string): MachineStatus {
  return status === "warning" || status === "error" || status === "maintenance" ? status : "normal";
}

/**
 * Bands per status, using the real cut-offs from thresholds.ts:
 *   normal      -> below SPINDLE_TEMP.warning / VIBRATION.warning
 *   warning     -> [warning, critical)
 *   error       -> [critical, critical + margin]
 *   maintenance -> same band as warning (machine parked, last readings were pre-fault)
 */
const TEMP_BANDS: Record<MachineStatus, [number, number]> = {
  normal: [42, SPINDLE_TEMP.warning - 0.1],
  warning: [SPINDLE_TEMP.warning, SPINDLE_TEMP.critical - 0.1],
  error: [SPINDLE_TEMP.critical, SPINDLE_TEMP.critical + 10],
  maintenance: [SPINDLE_TEMP.warning, SPINDLE_TEMP.critical - 0.1],
};

const VIBRATION_BANDS: Record<MachineStatus, [number, number]> = {
  normal: [0.4, VIBRATION.warning - 0.05],
  warning: [VIBRATION.warning, VIBRATION.critical - 0.05],
  error: [VIBRATION.critical, VIBRATION.critical + 2.4],
  maintenance: [VIBRATION.warning, VIBRATION.critical - 0.05],
};

/** Cumulative runtime: a few thousand up to ~60,000 hours, independent of status. */
const OPERATING_HOURS_RANGE: [number, number] = [2000, 60000];

function deriveMetrics(machine: MachineRow): MetricValues {
  const key = machine.code ?? machine.id;
  const status = normalizeStatus(machine.status);

  const tempBand = TEMP_BANDS[status];
  const vibBand = VIBRATION_BANDS[status];

  const spindleTemp = round(lerp(hashToUnit(key, "spindle_temp"), tempBand[0], tempBand[1]), 1);
  const vibrationMms = round(lerp(hashToUnit(key, "vibration_mms"), vibBand[0], vibBand[1]), 2);
  const operatingHours = Math.round(lerp(hashToUnit(key, "operating_hours"), OPERATING_HOURS_RANGE[0], OPERATING_HOURS_RANGE[1]));

  return { spindleTemp, vibrationMms, operatingHours };
}

/* ------------------------------------------------------------------ */
/* Fetch                                                              */
/* ------------------------------------------------------------------ */

async function fetchAllMachines(): Promise<MachineRow[]> {
  const rows: MachineRow[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("machines")
      .select("id, code, status")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`fetch machines failed: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...(data as MachineRow[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Bounded-concurrency update                                          */
/* ------------------------------------------------------------------ */

interface UpdateFailure {
  id: string;
  code: string | null;
  errorCode: string | undefined;
  message: string;
}

interface UpdateResult {
  succeeded: number;
  failures: UpdateFailure[];
}

/** Runs `task` over `items` with at most `concurrency` in flight at once. */
async function runWithConcurrency<T>(items: T[], concurrency: number, task: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const current = index++;
      if (current >= items.length) return;
      await task(items[current]);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
}

async function updateAllMetrics(computed: { machine: MachineRow; metrics: MetricValues }[]): Promise<UpdateResult> {
  let succeeded = 0;
  const failures: UpdateFailure[] = [];

  await runWithConcurrency(computed, UPDATE_CONCURRENCY, async ({ machine, metrics }) => {
    const { error } = await supabase
      .from("machines")
      .update({
        spindle_temp: metrics.spindleTemp,
        vibration_mms: metrics.vibrationMms,
        operating_hours: metrics.operatingHours,
      })
      .eq("id", machine.id);
    if (error) {
      failures.push({ id: machine.id, code: machine.code, errorCode: error.code, message: error.message });
    } else {
      succeeded++;
    }
  });

  return { succeeded, failures };
}

/* ------------------------------------------------------------------ */
/* Summary helpers                                                    */
/* ------------------------------------------------------------------ */

interface FieldStats {
  min: number;
  max: number;
  avg: number;
}

function statsFor(values: number[]): FieldStats {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return { min: round(min, 2), max: round(max, 2), avg: round(avg, 2) };
}

function bandCounts(machines: MachineRow[]): Record<MachineStatus, number> {
  const counts: Record<MachineStatus, number> = { normal: 0, warning: 0, error: 0, maintenance: 0 };
  for (const m of machines) counts[normalizeStatus(m.status)]++;
  return counts;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const unknown = args.filter((a) => a !== "--dry-run");
  if (unknown.length > 0) throw new Error(`Unknown argument(s): ${unknown.join(", ")}`);

  console.log("Loading machines...");
  const machines = await fetchAllMachines();
  console.log(`Loaded ${machines.length} machine(s).`);

  const computed = machines.map((m) => ({ machine: m, metrics: deriveMetrics(m) }));

  if (dryRun) {
    console.log("\n[dry-run] sample rows (first 10):");
    for (const { machine, metrics } of computed.slice(0, 10)) {
      console.log(
        `  ${String(machine.code ?? machine.id).padEnd(12)} status=${machine.status.padEnd(11)} ` +
          `spindle_temp=${metrics.spindleTemp.toFixed(1)}°C  vibration_mms=${metrics.vibrationMms.toFixed(2)}  operating_hours=${metrics.operatingHours}`
      );
    }

    const tempStats = statsFor(computed.map((c) => c.metrics.spindleTemp));
    const vibStats = statsFor(computed.map((c) => c.metrics.vibrationMms));
    const hoursStats = statsFor(computed.map((c) => c.metrics.operatingHours));
    console.log("\n[dry-run] min/max/avg:");
    console.log(`  spindle_temp:    min=${tempStats.min} max=${tempStats.max} avg=${tempStats.avg}`);
    console.log(`  vibration_mms:   min=${vibStats.min} max=${vibStats.max} avg=${vibStats.avg}`);
    console.log(`  operating_hours: min=${hoursStats.min} max=${hoursStats.max} avg=${hoursStats.avg}`);
    console.log(`\n[dry-run] band counts: ${JSON.stringify(bandCounts(machines))}`);
    console.log("\n[dry-run] nothing written.");
    return;
  }

  console.log(`Updating ${computed.length} row(s), up to ${UPDATE_CONCURRENCY} concurrent...`);
  const { succeeded, failures } = await updateAllMetrics(computed);

  const tempStats = statsFor(computed.map((c) => c.metrics.spindleTemp));
  const vibStats = statsFor(computed.map((c) => c.metrics.vibrationMms));
  const hoursStats = statsFor(computed.map((c) => c.metrics.operatingHours));

  console.log(`\nDone. Rows succeeded: ${succeeded}/${computed.length}. Failed: ${failures.length}`);
  if (failures.length > 0) {
    console.log("Failures:");
    for (const f of failures) {
      console.log(`  id=${f.id} code=${f.code ?? "?"} errorCode=${f.errorCode ?? "?"} message=${f.message}`);
    }
  }
  console.log(`  spindle_temp:    min=${tempStats.min} max=${tempStats.max} avg=${tempStats.avg}`);
  console.log(`  vibration_mms:   min=${vibStats.min} max=${vibStats.max} avg=${vibStats.avg}`);
  console.log(`  operating_hours: min=${hoursStats.min} max=${hoursStats.max} avg=${hoursStats.avg}`);
  console.log(`  band counts: ${JSON.stringify(bandCounts(machines))}`);
}

main().catch((err) => {
  console.error(`\n${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
