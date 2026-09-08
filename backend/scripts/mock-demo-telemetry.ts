/**
 * mock-demo-telemetry.ts — seed 30 วันของ telemetry ให้ "สองเครื่องสาธิต" พร้อมกัน
 * เพื่อให้กราฟแนวโน้ม (TelemetryTrendCard) มีข้อมูลครบทั้งช่วง 24 ชม. / 7 วัน / 30 วัน
 *
 * ⚠️  สคริปต์นี้เขียนค่าที่จำลองขึ้น (ไม่ใช่ค่าจากเซนเซอร์จริง) ลงในระบบซ่อมบำรุง ⚠️
 * มีไว้เพื่อสาธิต UI เท่านั้น ห้ามใช้ตัดสินใจซ่อมบำรุงจริง
 *
 * TARGET:
 *   - GR-1141 "INNER RING RACEWAY GRINDING MACHINE" — เครื่องกำลังเสื่อมสภาพเข้าสู่ error
 *   - ALL-000 "OUTER RING RACEWAY GRINDING"          — เครื่องทำงานปกติ มีความผันผวนเล็กน้อย
 *
 * ระเบียบ:
 *   - source ทุกแถวเป็น 'seed' (ค่าที่อนุญาตใน 0003_telemetry_readings.sql)
 *   - id กำหนดแน่นอน (deterministic) รูปแบบ seed-demo-<code>-<metric>-<isoHour> เพื่อให้
 *     รันซ้ำได้ (upsert onConflict: "id") และลบแถว "เดิม" ที่ไม่อยู่ใน set ที่สร้างใหม่
 *     (orphan cleanup) — จำกัดเฉพาะ source='seed' และ machine_id ของสองเครื่องนี้เท่านั้น
 *     ไม่แตะ 'iot' หรือ 'manual' เด็ดขาด
 *   - อัปเดตคอลัมน์สดของ machines (spindle_temp, vibration_mms, health_score,
 *     operating_hours) ให้ตรงกับค่าสุดท้ายที่ seed — มิฉะนั้น readingAvailability()
 *     (frontend/src/lib/thresholds.ts) จะยังซ่อนแท็บ metric อยู่ดี เพราะมันเช็คคอลัมน์
 *     สดของ machines ไม่ใช่ประวัติ telemetry
 *
 * Usage:
 *   npm run mock:demo-telemetry -- --dry-run   # พิมพ์สรุป ไม่เขียนอะไรลง DB
 *   npm run mock:demo-telemetry                # เขียนจริง (idempotent, รันซ้ำได้)
 */

import { supabase } from "../src/lib/supabase.js";

/* ------------------------------------------------------------------ */
/* Targets                                                             */
/* ------------------------------------------------------------------ */

interface TargetSpec {
  code: string;
  name: string;
  story: "degrading" | "healthy";
}

const TARGETS: TargetSpec[] = [
  { code: "GR-1141", name: "INNER RING RACEWAY GRINDING MACHINE", story: "degrading" },
  { code: "ALL-000", name: "OUTER RING RACEWAY GRINDING", story: "healthy" },
];

const TELEMETRY_SOURCE = "seed";

/** 30 วันของประวัติ ราย 1 ชั่วโมงต่อ metric — ต่ำกว่า MAX_READINGS_ROWS (2000) ของ endpoint มาก */
const WINDOW_HOURS = 24 * 30;
const POINTS = WINDOW_HOURS + 1; // 721 จุด

type Metric = "spindle_temp" | "vibration_mms" | "health_score";
const METRICS: Metric[] = ["spindle_temp", "vibration_mms", "health_score"];

/** เป้าหมายค่าปัจจุบัน (จุดสุดท้ายของกราฟ) — อ้างอิงเกณฑ์จาก frontend/src/lib/thresholds.ts
 *  (warning: spindle 75°C / vibration 2.8 mm/s / health 60 ; error: 85°C / 7.1 mm/s / 30) */
const CURRENT: Record<TargetSpec["story"], Record<Metric, number>> = {
  degrading: { spindle_temp: 92.6, vibration_mms: 8.9, health_score: 24 }, // ERROR ทั้งสามค่า
  healthy: { spindle_temp: 68.4, vibration_mms: 2.35, health_score: 74 }, // NORMAL ทั้งสามค่า
};

const OPERATING_HOURS: Record<TargetSpec["story"], number> = {
  degrading: 57_840,
  healthy: 41_260,
};

/* ------------------------------------------------------------------ */
/* Deterministic signal generation (mulberry32 + Box-Muller)           */
/* ------------------------------------------------------------------ */

/** mulberry32 — seed เดียวกันให้ผลลัพธ์เดิมทุกครั้ง จึงรันซ้ำได้ผลตรงกัน */
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

/** Gaussian noise — อ่านเหมือนความคลาดเคลื่อนของเครื่องมือวัด ไม่เหมือน noise สุ่มแบบ uniform */
function makeGaussian(seed: number) {
  const rand = rng(seed);
  return () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
}

/** duty cycle ของโรงงาน 0..1 — กะเช้า/กะดึกโหลดเต็ม, วันอาทิตย์เบาลง (ให้เห็นจังหวะรายวัน/รายสัปดาห์) */
function dutyCycle(date: Date): number {
  const h = date.getHours() + date.getMinutes() / 60;
  const inShiftA = h >= 8 && h < 17;
  const inShiftB = h >= 20 || h < 5;
  let load = inShiftA || inShiftB ? 1 : 0.3;
  if (date.getDay() === 0) load *= 0.4;
  return load;
}

/** เส้นตรงเป็นช่วง ๆ ผ่านจุดเช็คพอยต์ (fraction-of-window, value) — ใช้บอกเรื่องราวการเสื่อมสภาพ
 *  แบบมี "จุดหักเหน" ที่กำหนดวันได้ชัดเจน แทนที่จะเป็นความชันเดียวตลอด 30 วัน */
function piecewiseLinear(p: number, points: ReadonlyArray<readonly [number, number]>): number {
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, v0] = points[i];
    const [p1, v1] = points[i + 1];
    if (p <= p1) {
      const t = p1 === p0 ? 1 : (p - p0) / (p1 - p0);
      return v0 + (v1 - v0) * t;
    }
  }
  return points[points.length - 1][1];
}

const DAY = (d: number) => d / 30;

/* เช็คพอยต์ของสายเสื่อมสภาพ (GR-1141): ปกติช่วงต้น -> ข้ามเส้นเฝ้าระวัง -> ข้ามเส้นวิกฤต
 * ในช่วงท้ายของหน้าต่าง 30 วัน */
const DEGRADING_TEMP: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 66],
  [DAY(12), 68],
  [DAY(16), 75], // warning
  [DAY(27), 85], // error
  [DAY(30), 92.6],
];
const DEGRADING_VIB: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 2.1],
  [DAY(12), 2.25],
  [DAY(14), 2.8], // warning
  [DAY(28), 7.1], // error
  [DAY(30), 8.9],
];
const DEGRADING_HEALTH: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 66],
  [DAY(13), 60], // warning
  [DAY(28), 30], // error
  [DAY(30), 24],
];

/* เช็คพอยต์ของสายปกติ (ALL-000): ค่อนข้างคงที่ ผันผวนเล็กน้อยตามโหลด ไม่เข้าใกล้เส้นเฝ้าระวัง */
const HEALTHY_TEMP: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 64],
  [DAY(15), 66],
  [DAY(30), 68.4],
];
const HEALTHY_VIB: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 2.1],
  [DAY(15), 2.2],
  [DAY(30), 2.35],
];
const HEALTHY_HEALTH: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 76],
  [DAY(15), 75],
  [DAY(30), 74],
];

const CHECKPOINTS: Record<TargetSpec["story"], Record<Metric, ReadonlyArray<readonly [number, number]>>> = {
  degrading: { spindle_temp: DEGRADING_TEMP, vibration_mms: DEGRADING_VIB, health_score: DEGRADING_HEALTH },
  healthy: { spindle_temp: HEALTHY_TEMP, vibration_mms: HEALTHY_VIB, health_score: HEALTHY_HEALTH },
};

interface Point {
  recordedAt: Date;
  value: number;
}

/**
 * สร้างชุดข้อมูล 3 metric ของเครื่องหนึ่งเครื่อง สิ้นสุดที่ endAt
 *  - spindle_temp / vibration_mms: checkpoint trend + load-driven rise + sawtooth รายวัน + noise
 *  - health_score: checkpoint trend, clamp ไม่ให้กระเด้งขึ้นเกิน ~1 แต้มต่อจุด (ยกเว้นสายปกติที่
 *    ผันผวนได้ทั้งขึ้นลงเล็กน้อยสมจริงกว่า)
 * ปักจุดสุดท้ายให้ตรงกับ CURRENT.* เพื่อให้การ์ดเครื่องกับกราฟตรงกัน
 */
function buildSeries(story: TargetSpec["story"], endAt: Date): Record<Metric, Point[]> {
  const seedBase = story === "degrading" ? 0xab0000 : 0xcd0000;
  const gTemp = makeGaussian(seedBase + 1);
  const gVib = makeGaussian(seedBase + 2);
  const gHealth = makeGaussian(seedBase + 3);

  const series: Record<Metric, Point[]> = { spindle_temp: [], vibration_mms: [], health_score: [] };
  let prevHealth: number | null = null;
  const cp = CHECKPOINTS[story];
  const healthClamp = story === "degrading" ? 1 : 2.5; // สายปกติผันผวนขึ้นลงได้มากกว่าเล็กน้อย

  for (let i = 0; i < POINTS; i++) {
    const hoursAgo = WINDOW_HOURS - i;
    const at = new Date(endAt.getTime() - hoursAgo * 3_600_000);
    const p = i / (POINTS - 1);
    const load = dutyCycle(at);
    const spike = i % 137 === 0 ? gTemp() * 1.2 : 0; // spike สั้น ๆ เป็นครั้งคราว

    series.spindle_temp.push({
      recordedAt: at,
      value:
        piecewiseLinear(p, cp.spindle_temp) +
        2.6 * load +
        0.7 * Math.sin((2 * Math.PI * i) / 24) +
        gTemp() * 0.45 +
        spike,
    });

    const dressPhase = (i % 120) / 120;
    series.vibration_mms.push({
      recordedAt: at,
      value: piecewiseLinear(p, cp.vibration_mms) + 0.15 * load + 0.1 * dressPhase + gVib() * 0.04,
    });

    let h = piecewiseLinear(p, cp.health_score) + gHealth() * 0.35;
    if (prevHealth !== null) {
      h = story === "degrading" ? Math.min(h, prevHealth + healthClamp) : h;
    }
    h = Math.max(0, Math.min(100, h));
    prevHealth = h;
    series.health_score.push({ recordedAt: at, value: h });
  }

  // ปักจุดสุดท้ายให้ตรงกับค่าปัจจุบันของเครื่อง (การ์ด vs กราฟต้องตรงกัน)
  const decimals: Record<Metric, number> = { spindle_temp: 1, vibration_mms: 2, health_score: 0 };
  for (const metric of METRICS) {
    const pts = series[metric];
    const target = CURRENT[story][metric];
    const offset = target - pts[pts.length - 1].value;
    for (const pt of pts) pt.value = Number((pt.value + offset).toFixed(decimals[metric]));
    if (metric === "health_score") {
      for (const pt of pts) pt.value = Math.max(0, Math.min(100, pt.value));
    }
  }

  return series;
}

/* ------------------------------------------------------------------ */
/* Deterministic id                                                    */
/* ------------------------------------------------------------------ */

function isoHour(d: Date): string {
  return d.toISOString().slice(0, 13).replace(/[:T]/g, "-") + "h"; // 2026-09-08-07h
}

function readingId(code: string, metric: Metric, at: Date): string {
  return `seed-demo-${code}-${metric}-${isoHour(at)}`;
}

/* ------------------------------------------------------------------ */
/* Machine lookup                                                      */
/* ------------------------------------------------------------------ */

interface MachineRow {
  id: string;
  code: string;
  name: string;
}

async function resolveTargets(): Promise<MachineRow[]> {
  const codes = TARGETS.map((t) => t.code);
  const { data, error } = await supabase.from("machines").select("id, code, name").in("code", codes);
  if (error) throw new Error(`Machine lookup failed: ${error.message}`);
  const rows = (data ?? []) as MachineRow[];

  const resolved: MachineRow[] = [];
  const missing: string[] = [];
  for (const target of TARGETS) {
    const row = rows.find((r) => r.code === target.code);
    if (!row) {
      missing.push(`code="${target.code}" (คาดว่าชื่อ "${target.name}")`);
      continue;
    }
    if (row.name !== target.name) {
      missing.push(
        `code="${target.code}" พบแล้วแต่ชื่อไม่ตรง: ได้ "${row.name}" ต้องการ "${target.name}"`
      );
      continue;
    }
    resolved.push(row);
  }

  if (missing.length > 0) {
    throw new Error(
      `ไม่พบเครื่องจักรเป้าหมายครบตามที่ต้องการ:\n` +
        missing.map((m) => `  - ${m}`).join("\n") +
        `\nยกเลิกโดยไม่เขียนอะไรลง DB`
    );
  }

  return resolved;
}

/* ------------------------------------------------------------------ */
/* Command                                                             */
/* ------------------------------------------------------------------ */

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  let machines: MachineRow[];
  try {
    machines = await resolveTargets();
  } catch (e) {
    console.error(String((e as Error).message));
    process.exit(1);
    return;
  }

  const now = new Date();
  now.setMinutes(0, 0, 0); // ปัดเป็นชั่วโมงตรง ให้ timestamp เรียบร้อย

  console.log(`เวลาปัจจุบัน (ปัดชั่วโมง): ${now.toISOString()}`);
  console.log(`หน้าต่างข้อมูล: ${WINDOW_HOURS} ชม. (${POINTS} จุด/metric) ราย 1 ชม.\n`);

  type Built = {
    machine: MachineRow;
    story: TargetSpec["story"];
    series: Record<Metric, Point[]>;
  };
  const built: Built[] = machines.map((machine) => {
    const target = TARGETS.find((t) => t.code === machine.code)!;
    const series = buildSeries(target.story, now);
    return { machine, story: target.story, series };
  });

  for (const b of built) {
    console.log(`--- ${b.machine.code} (${b.machine.name}) — ${b.story === "degrading" ? "เสื่อมสภาพ -> error" : "ปกติ"} ---`);
    for (const metric of METRICS) {
      const pts = b.series[metric];
      const vals = pts.map((p) => p.value);
      console.log(
        `  ${metric}: ${pts.length} จุด  ช่วงเวลา ${pts[0].recordedAt.toISOString()} .. ${pts[pts.length - 1].recordedAt.toISOString()}  ` +
          `min=${Math.min(...vals)} max=${Math.max(...vals)} last=${vals[vals.length - 1]}`
      );
    }
    console.log("");
  }

  if (dryRun) {
    console.log("[dry-run] ไม่มีการเขียนข้อมูลลง DB");
    return;
  }

  // อัปเดตคอลัมน์สดของ machines ก่อน (ให้ readingAvailability() เห็นค่าไม่เป็น null)
  for (const b of built) {
    const patch = {
      spindle_temp: CURRENT[b.story].spindle_temp,
      vibration_mms: CURRENT[b.story].vibration_mms,
      health_score: CURRENT[b.story].health_score,
      operating_hours: OPERATING_HOURS[b.story],
    };
    const { error } = await supabase.from("machines").update(patch).eq("id", b.machine.id);
    if (error) throw new Error(`อัปเดต machines (${b.machine.code}) ล้มเหลว: ${error.message}`);
    console.log(`machines.${b.machine.code} อัปเดตค่าปัจจุบันแล้ว: ${JSON.stringify(patch)}`);
  }

  // สร้างแถว telemetry_readings ทั้งหมด แล้ว upsert เป็นชุด (batch) เพื่อความเร็ว
  const allRows: {
    id: string;
    machine_id: string;
    metric: Metric;
    value: number;
    source: string;
    recorded_at: string;
  }[] = [];
  const idsByMachine = new Map<string, Set<string>>();

  for (const b of built) {
    const ids = new Set<string>();
    idsByMachine.set(b.machine.id, ids);
    for (const metric of METRICS) {
      for (const pt of b.series[metric]) {
        const id = readingId(b.machine.code, metric, pt.recordedAt);
        ids.add(id);
        allRows.push({
          id,
          machine_id: b.machine.id,
          metric,
          value: pt.value,
          source: TELEMETRY_SOURCE,
          recorded_at: pt.recordedAt.toISOString(),
        });
      }
    }
  }

  const BATCH_SIZE = 500;
  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("telemetry_readings").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`upsert telemetry_readings ล้มเหลว (batch ${i}): ${error.message}`);
  }
  console.log(`\nเขียน/อัปเดต telemetry_readings รวม ${allRows.length} แถว`);

  // Orphan cleanup: ลบแถวเดิมที่เคย seed ไว้ (source='seed') ของสองเครื่องนี้ ที่ไม่อยู่ใน set ใหม่
  for (const b of built) {
    const ids = idsByMachine.get(b.machine.id)!;
    const { data: existingRows, error: selErr } = await supabase
      .from("telemetry_readings")
      .select("id")
      .eq("machine_id", b.machine.id)
      .eq("source", TELEMETRY_SOURCE);
    if (selErr) throw new Error(`ตรวจสอบแถวเดิม (${b.machine.code}) ล้มเหลว: ${selErr.message}`);

    const orphanIds = (existingRows ?? []).map((r) => r.id as string).filter((id) => !ids.has(id));
    if (orphanIds.length === 0) continue;

    for (let i = 0; i < orphanIds.length; i += BATCH_SIZE) {
      const chunk = orphanIds.slice(i, i + BATCH_SIZE);
      const { error: delErr } = await supabase
        .from("telemetry_readings")
        .delete()
        .eq("machine_id", b.machine.id)
        .eq("source", TELEMETRY_SOURCE)
        .in("id", chunk);
      if (delErr) throw new Error(`ลบแถว orphan (${b.machine.code}) ล้มเหลว: ${delErr.message}`);
    }
    console.log(`${b.machine.code}: ลบแถว seed เดิมที่ไม่ใช้แล้ว ${orphanIds.length} แถว`);
  }

  console.log("\nเสร็จสิ้น");
}

main().catch((e) => {
  console.error("เกิดข้อผิดพลาด:", e);
  process.exit(1);
});
