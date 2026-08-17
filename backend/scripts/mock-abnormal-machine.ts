/**
 * mock-abnormal-machine.ts — fill ONE machine with clearly-marked MOCK data that
 * looks LIKE A MACHINE FAILING, not a healthy demo unit.
 *
 * ⚠️  THIS SCRIPT WRITES FABRICATED SENSOR READINGS INTO A MAINTENANCE SYSTEM. ⚠️
 *
 * It is the mirror image of scripts/mock-machine.ts: that script makes a machine
 * look healthy, this one makes a DIFFERENT machine look like it is in an active
 * error state with a 30-day degradation trend behind it. Every value it writes is
 * invented; none of it comes from a sensor. Technicians must never act on it. That
 * is why:
 *   • `machines.info_notes` gets a `MOCK_DATA` entry plus a Thai warning,
 *   • `machines.model` carries a visible `[MOCK]` suffix (model is rendered in the
 *     machine selector, the scan view and the registry detail modal, so the marker
 *     is visible on screen and not just in the DB),
 *   • every telemetry row it creates has a primary key prefixed `MOCK-`,
 *   • the pre-change state is captured to backend/backups/mock-machine/ so
 *     `--revert` restores the row byte-for-byte and deletes exactly the rows this
 *     script created.
 *
 * SCOPE: exactly one machine — name "INNER RING RACEWAY GRINDING MACHINE", code
 * "GR-1141" (id "GR-1141#0815"). Nothing else in the database is read-modified-written.
 *
 * Usage:
 *   npm run mock:abnormal -- --dry-run    # print the plan, touch nothing
 *   npm run mock:abnormal                 # apply (idempotent, safe to re-run)
 *   npm run mock:abnormal -- --revert     # restore previous values + delete mock telemetry
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { supabase } from "../src/lib/supabase.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = resolve(__dirname, "../backups/mock-machine");

/* ------------------------------------------------------------------ */
/* Target                                                             */
/* ------------------------------------------------------------------ */

const TARGET_NAME = "INNER RING RACEWAY GRINDING MACHINE";
const TARGET_CODE = "GR-1141";
const TARGET_ID = "GR-1141#0815";

/**
 * Machines this script must NEVER write to, whatever the lookup returns.
 *
 * The one that matters is mock-machine.ts's healthy demo target: id "1#0802",
 * name "OUTER RING RACEWAY GRINDING". Its `code` was "1" when that script was
 * written and is "ALL-000" in this database now — which is exactly why the id and
 * the name are denied here as well as the code. A guard written against `code`
 * alone stops protecting the row the moment somebody renumbers it, and the failure
 * mode is silent: the script would happily stamp status='error' and a fabricated
 * alarm onto the machine that is supposed to be the healthy half of the demo.
 */
const OFF_LIMITS_IDS = ["1#0802"];
const OFF_LIMITS_NAMES = ["OUTER RING RACEWAY GRINDING"];

/** Marker written into machines.info_notes. */
const MOCK_MARKER = "MOCK_DATA";
const MOCK_NOTE_TH = "ข้อมูลจำลองสำหรับสาธิต (เครื่องจักรผิดปกติ) - ห้ามใช้อ้างอิงงานจริง";

/**
 * telemetry_readings.source is constrained by 0003_telemetry_readings.sql to
 * ('iot','manual','seed') — 'mock' is NOT an allowed value and the insert would be
 * rejected. 'iot' would be an outright lie (it claims a real sensor produced the
 * reading), so 'seed' is used, same as mock-machine.ts. The unambiguous marker is
 * carried on the primary key instead (see mockReadingId).
 */
const TELEMETRY_SOURCE = "seed";

/** Every row this script creates has an id starting with this — the delete key. */
const idPrefix = (machineId: string) => `MOCK-${machineId}-`;
const mockReadingId = (machineId: string, metric: string, index: number) =>
  `${idPrefix(machineId)}${metric}-${String(index).padStart(4, "0")}`;

/* ------------------------------------------------------------------ */
/* The mock values                                                    */
/* ------------------------------------------------------------------ */

/**
 * Current-value targets. The generated time series is offset so its LAST point
 * equals these exactly — otherwise the number on the machine card and the number
 * at the right-hand end of the trend chart would disagree.
 *
 * Bands chosen against frontend/src/lib/thresholds.ts — all three MUST land in the
 * ERROR band, on purpose, unlike mock-machine.ts's healthy counterpart:
 *   spindle_temp 92.6 °C   → ERROR (warning 75, error 85).
 *   vibration    8.9 mm/s  → ERROR (warning 2.8, error 7.1).
 *   health_score 24        → ERROR (warning 60, error 30).
 * A non-null active_error_code also forces at least "warning" on its own, so
 * status='error' agrees with every signal evaluateMachine() looks at.
 */
const CURRENT = {
  spindle_temp: 92.6,
  vibration_mms: 8.9,
  health_score: 24,
};

/** 30 days of history, one reading per hour, per metric — same window as mock-machine.ts. */
const WINDOW_HOURS = 720;
const POINTS = WINDOW_HOURS + 1; // 721 — under the route's MAX_READINGS_ROWS (2000)

/* Tiny self-contained SVG placeholders. Data URIs, not external URLs — same technique
 * as mock-machine.ts, but red/warning accents instead of the healthy grey-blue, so the
 * marker reads as "abnormal" even before anyone opens machines.status. */
const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

const IMAGE_URL = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">` +
    `<rect width="320" height="200" fill="#fbeaea"/>` +
    `<rect x="52" y="66" width="216" height="84" rx="8" fill="#e6b3b3"/>` +
    `<rect x="76" y="90" width="60" height="36" rx="4" fill="#c94f4f"/>` +
    `<circle cx="212" cy="108" r="22" fill="#c94f4f"/>` +
    `<text x="160" y="42" font-family="sans-serif" font-size="14" font-weight="bold" fill="#7a1f1f" text-anchor="middle">INNER RING RACEWAY GRINDING (GR-1141)</text>` +
    `<text x="160" y="178" font-family="sans-serif" font-size="12" fill="#a33" text-anchor="middle">MOCK IMAGE - ภาพจำลอง (ผิดปกติ)</text>` +
    `</svg>`
);

const QR_CODE_URL = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200" viewBox="0 0 180 200">` +
    `<rect width="180" height="200" fill="#ffffff"/>` +
    `<g fill="#7a1f1f">` +
    `<rect x="14" y="14" width="42" height="42"/><rect x="22" y="22" width="26" height="26" fill="#fff"/><rect x="28" y="28" width="14" height="14"/>` +
    `<rect x="124" y="14" width="42" height="42"/><rect x="132" y="22" width="26" height="26" fill="#fff"/><rect x="138" y="28" width="14" height="14"/>` +
    `<rect x="14" y="124" width="42" height="42"/><rect x="22" y="132" width="26" height="26" fill="#fff"/><rect x="28" y="138" width="14" height="14"/>` +
    `<rect x="70" y="14" width="10" height="10"/><rect x="90" y="24" width="10" height="10"/><rect x="70" y="44" width="10" height="10"/>` +
    `<rect x="14" y="70" width="10" height="10"/><rect x="34" y="90" width="10" height="10"/><rect x="70" y="70" width="10" height="10"/>` +
    `<rect x="90" y="90" width="10" height="10"/><rect x="110" y="70" width="10" height="10"/><rect x="130" y="90" width="10" height="10"/>` +
    `<rect x="70" y="110" width="10" height="10"/><rect x="110" y="130" width="10" height="10"/><rect x="90" y="150" width="10" height="10"/>` +
    `<rect x="130" y="150" width="10" height="10"/><rect x="150" y="110" width="10" height="10"/>` +
    `</g>` +
    `<text x="90" y="186" font-family="sans-serif" font-size="11" fill="#a33" text-anchor="middle">MOCK QR - รหัส GR-1141</text>` +
    `</svg>`
);

/** ISO date (YYYY-MM-DD) N days from `from`. format.ts parses this exactly. */
function isoDate(from: Date, offsetDays: number): string {
  const d = new Date(from.getTime() + offsetDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * The columns this script writes. Unlike mock-machine.ts's healthy target, this
 * patch DOES set status/active_error_code/active_error_desc — the whole point of
 * this script is a machine that is actively alarming, not a quiet outlier.
 */
function buildMachinePatch(now: Date, existingNotes: string[]) {
  const lastMaintenance = isoDate(now, -132); // overdue on purpose
  const nextMaintenance = isoDate(now, -42); //  already past due — the story is a
  //                                             missed PM window, not a fresh one
  return {
    status: "error",
    // Realistic bearing-raceway grinder designation, visible "[MOCK]" suffix for the
    // same reason as mock-machine.ts: model is rendered on screen (TopBar selector,
    // ScanMachineView, registry detail modal).
    model: "IRG-260CNC [MOCK]",
    health_score: CURRENT.health_score,
    spindle_temp: CURRENT.spindle_temp,
    vibration_mms: CURRENT.vibration_mms,
    operating_hours: 57_840,
    last_maintenance: lastMaintenance,
    next_maintenance: nextMaintenance,
    active_error_code: "ALM-1042",
    active_error_desc:
      "SPINDLE VIBRATION OVER LIMIT - ตรวจพบการสั่นสะเทือนเกินพิกัดที่หัวจับ (Work Head) ร่วมกับอุณหภูมิ Spindle สูงผิดปกติ คาดว่าตลับลูกปืน Spindle เสื่อมสภาพ",
    lifecycle_status: "APPROVED",
    qr_code_url: QR_CODE_URL,
    image_url: IMAGE_URL,
    info_notes: [...existingNotes, MOCK_MARKER, MOCK_NOTE_TH],
  };
}

/* ------------------------------------------------------------------ */
/* Deterministic signal generation                                    */
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

/**
 * Plant duty cycle at a given instant, 0..1. Same shape as mock-machine.ts: two
 * production shifts (08:00–17:00, 20:00–05:00) with a lighter Sunday, giving a
 * visible daily rhythm in the 24 h view and a weekly rhythm in the 7 d / 30 d views.
 */
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
 * Piecewise-linear trend through a small set of (fraction-of-window, value)
 * checkpoints. Used instead of a single drift formula because the story this
 * script has to tell is not a gentle slope — it is "fine, then a knee, then a
 * failure" — and a checkpoint table lets each metric's knee/error crossing land at
 * an explicit, named day instead of being an accident of a curve-fit exponent.
 * `points` must be sorted ascending by fraction, with the first at 0 and the last
 * at 1.
 */
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

/**
 * Checkpoints below are all expressed as "day N of 30" ÷ 30, so the comments and
 * the numbers can be checked against each other directly.
 */
const DAY = (d: number) => d / 30;

/** Flat ~2.1 for 12 days, knee at day 12, watch-line crossing (2.8) at day 14,
 *  error-line crossing (7.1) inside the last 2 days, pinned to 8.9 at day 30. */
const VIB_CHECKPOINTS: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 2.1],
  [DAY(12), 2.25],
  [DAY(14), 2.8],
  [DAY(28), 7.1],
  [DAY(30), 8.9],
];

/** Correlated with vibration: slow drift while healthy, warning line (75) around
 *  day 16, error line (85) inside the last 3 days, pinned to 92.6 at day 30. */
const TEMP_CHECKPOINTS: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 66],
  [DAY(12), 68],
  [DAY(16), 75],
  [DAY(27), 85],
  [DAY(30), 92.6],
];

/** Decaying health index: warning line (60) around day 13, error line (30) inside
 *  the last 2 days, pinned to 24 at day 30. */
const HEALTH_CHECKPOINTS: ReadonlyArray<readonly [number, number]> = [
  [DAY(0), 66],
  [DAY(13), 60],
  [DAY(28), 30],
  [DAY(30), 24],
];

/**
 * Build all three series ending at `endAt`, oldest first — a degradation story, not
 * flat noise:
 *  • vibration follows VIB_CHECKPOINTS plus load + a wheel-dress-style sawtooth,
 *  • spindle_temp follows TEMP_CHECKPOINTS plus load + daily sawtooth, correlated
 *    with vibration because both are driven by the same failing bearing,
 *  • health_score follows HEALTH_CHECKPOINTS and is clamped so it never rises more
 *    than ~1 point step to step — small noise is allowed, a recovering machine is not.
 * Each series is then offset so its final point lands exactly on CURRENT.*, keeping
 * the chart and the machine card in agreement.
 */
function buildSeries(endAt: Date): Series[] {
  const gTemp = makeGaussian(0xab0001);
  const gVib = makeGaussian(0xab0002);
  const gHealth = makeGaussian(0xab0003);

  const temp: Series = { metric: "spindle_temp", points: [] };
  const vib: Series = { metric: "vibration_mms", points: [] };
  const health: Series = { metric: "health_score", points: [] };

  let prevHealth: number | null = null;

  for (let i = 0; i < POINTS; i++) {
    const hoursAgo = WINDOW_HOURS - i;
    const at = new Date(endAt.getTime() - hoursAgo * 3_600_000);
    const p = i / (POINTS - 1); // 0 = 30 days ago, 1 = now
    const load = dutyCycle(at);

    // Spindle: checkpoint trend + load-driven rise + daily sawtooth + noise.
    const tempTrend = piecewiseLinear(p, TEMP_CHECKPOINTS);
    temp.points.push({
      recordedAt: at,
      value: tempTrend + 2.6 * load + 0.7 * Math.sin((2 * Math.PI * i) / 24) + gTemp() * 0.45,
    });

    // Vibration: checkpoint trend + load + wheel-dress sawtooth (period 120 h) + noise.
    const dressPhase = (i % 120) / 120;
    vib.points.push({
      recordedAt: at,
      value: piecewiseLinear(p, VIB_CHECKPOINTS) + 0.15 * load + 0.1 * dressPhase + gVib() * 0.04,
    });

    // Health index is derived, not measured: monotonically-ish decaying. Clamp so a
    // noisy sample can never look like the machine recovering by more than ~1 point.
    let h = piecewiseLinear(p, HEALTH_CHECKPOINTS) + gHealth() * 0.35;
    if (prevHealth !== null) h = Math.min(h, prevHealth + 1);
    h = Math.max(0, Math.min(100, h));
    prevHealth = h;
    health.points.push({ recordedAt: at, value: h });
  }

  // Pin each series' final value to the machine card's value.
  const pin = (s: Series, target: number, decimals: number) => {
    const offset = target - s.points[s.points.length - 1].value;
    for (const pt of s.points) {
      pt.value = Number((pt.value + offset).toFixed(decimals));
    }
  };
  pin(temp, CURRENT.spindle_temp, 1);
  pin(vib, CURRENT.vibration_mms, 2);
  pin(health, CURRENT.health_score, 0);
  // Re-clamp health after the pin offset (offset is small and constant, but 0-100
  // is a hard domain boundary the chart and cards both assume).
  for (const pt of health.points) pt.value = Math.max(0, Math.min(100, pt.value));

  return [temp, vib, health];
}

/* ------------------------------------------------------------------ */
/* Machine lookup                                                     */
/* ------------------------------------------------------------------ */

async function resolveTarget() {
  const { data, error } = await supabase.from("machines").select("*").eq("code", TARGET_CODE);
  if (error) throw new Error(`Machine lookup failed: ${error.message}`);
  const rows = data ?? [];
  if (rows.length !== 1) {
    throw new Error(`Expected exactly one machine with code "${TARGET_CODE}", found ${rows.length}.`);
  }
  const row = rows[0] as any;
  if (row.name !== TARGET_NAME) {
    throw new Error(`Machine code "${TARGET_CODE}" has name "${row.name}", expected "${TARGET_NAME}". Refusing to touch it.`);
  }
  if (row.id !== TARGET_ID) {
    throw new Error(`Machine code "${TARGET_CODE}" resolved to id "${row.id}", expected "${TARGET_ID}". Refusing to touch it.`);
  }

  // SAFETY GUARD: this script must never be able to touch mock-machine.ts's target or
  // a bulk/"ALL-" pseudo-machine, no matter what the lookup above returns. Belt and
  // braces on top of the code/name/id checks already done — and deliberately keyed on
  // all three of id, name and code, because the code is the one of the three that has
  // already changed once (see OFF_LIMITS_IDS above).
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

  return row;
}

/* ------------------------------------------------------------------ */
/* Backup of the pre-change state                                     */
/* ------------------------------------------------------------------ */

interface BackupFile {
  capturedAt: string;
  machineId: string;
  machineCode: string | null;
  machineName: string;
  /** The complete machines row exactly as it was before the first apply. */
  machineRowBefore: Record<string, unknown>;
  /** telemetry_readings ids that existed for this machine before the first apply. */
  telemetryIdsBefore: string[];
}

const backupPath = (machineId: string) =>
  resolve(BACKUP_DIR, `${machineId.replace(/[^A-Za-z0-9_-]/g, "_")}.before.json`);

function readBackup(machineId: string): BackupFile | null {
  const p = backupPath(machineId);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as BackupFile;
}

/* ------------------------------------------------------------------ */
/* Commands                                                           */
/* ------------------------------------------------------------------ */

/** Columns this script owns. Revert resets exactly these and nothing else. */
const OWNED_COLUMNS = [
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
  "qr_code_url",
  "image_url",
  "lifecycle_status",
  "info_notes",
] as const;

async function apply(dryRun: boolean) {
  const machine = await resolveTarget();
  console.log(`Target: id=${machine.id}  code=${machine.code}  name=${machine.name}`);

  const existing = readBackup(machine.id);
  if (existing) {
    console.log(`Backup already exists (${backupPath(machine.id)}) — keeping the original pre-change state.`);
  }

  // The very first apply captures the pristine row. Later applies must NOT overwrite
  // it, or the "before" state would become the mocked state and revert would be a no-op.
  const backup: BackupFile = existing ?? {
    capturedAt: new Date().toISOString(),
    machineId: machine.id,
    machineCode: machine.code,
    machineName: machine.name,
    machineRowBefore: { ...machine },
    telemetryIdsBefore: await telemetryIds(machine.id, false),
  };

  const notesBefore: string[] = (backup.machineRowBefore.info_notes as string[] | null) ?? [];
  const now = new Date();
  now.setMinutes(0, 0, 0); // anchor on the hour so timestamps are tidy
  const patch = buildMachinePatch(now, notesBefore);
  const series = buildSeries(now);

  console.log("\n--- machines patch ---");
  for (const [k, v] of Object.entries(patch)) {
    const before = backup.machineRowBefore[k];
    const show = (x: unknown) =>
      typeof x === "string" && x.length > 70 ? `${x.slice(0, 67)}… (${x.length} chars)` : JSON.stringify(x);
    console.log(`  ${k}: ${show(before)}  ->  ${show(v)}`);
  }

  console.log("\n--- telemetry_readings ---");
  for (const s of series) {
    const vals = s.points.map((p) => p.value);
    console.log(
      `  ${s.metric}: ${s.points.length} rows  min=${Math.min(...vals)} max=${Math.max(...vals)} ` +
        `first=${vals[0]} last=${vals[vals.length - 1]}  source='${TELEMETRY_SOURCE}'`
    );
  }
  console.log(
    `  window: ${series[0].points[0].recordedAt.toISOString()} .. ${now.toISOString()} (${WINDOW_HOURS} h, hourly)`
  );
  console.log(`  id prefix: ${idPrefix(machine.id)}`);
  console.log(`  pre-existing telemetry rows for this machine: ${backup.telemetryIdsBefore.length}`);

  if (dryRun) {
    console.log("\n[dry-run] nothing written.");
    return;
  }

  mkdirSync(BACKUP_DIR, { recursive: true });
  if (!existing) {
    writeFileSync(backupPath(machine.id), JSON.stringify(backup, null, 2), "utf8");
    console.log(`\nWrote pre-change backup: ${backupPath(machine.id)}`);
  }

  const { error: upErr } = await supabase.from("machines").update(patch).eq("id", machine.id);
  if (upErr) throw new Error(`machines update failed: ${upErr.message}`);
  console.log("machines row updated.");

  // Deterministic ids + upsert = re-running replaces rows in place instead of
  // appending a second copy of the series.
  const rows = series.flatMap((s) =>
    s.points.map((p, i) => ({
      id: mockReadingId(machine.id, s.metric, i),
      machine_id: machine.id,
      metric: s.metric,
      value: p.value,
      source: TELEMETRY_SOURCE,
      recorded_at: p.recordedAt.toISOString(),
    }))
  );
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await supabase.from("telemetry_readings").upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`telemetry upsert failed at row ${i}: ${error.message}`);
  }
  console.log(`telemetry_readings upserted: ${rows.length} rows.`);

  // Drop any stale mock rows from a previous run that used a longer window.
  const stale = await telemetryIds(machine.id, true);
  const keep = new Set(rows.map((r) => r.id));
  const orphans = stale.filter((id) => !keep.has(id));
  if (orphans.length > 0) {
    await supabase.from("telemetry_readings").delete().in("id", orphans);
    console.log(`removed ${orphans.length} stale mock rows from an earlier run.`);
  }

  console.log("\nDone. Revert with:  npm run mock:abnormal -- --revert");
}

/**
 * Fetch every telemetry id for a machine, optionally only the mock ones.
 *
 * MUST page: PostgREST caps an unpaged select at 1000 rows, and this script writes
 * 2,163. An unpaged read here silently returned the first 1000 only, which made
 * --revert delete 1000 rows and leave 1,163 orphans behind — a revert that reports
 * success while the data is still there is worse than no revert at all.
 */
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
    const { data, error } = await query;
    if (error) throw new Error(`telemetry lookup failed: ${error.message}`);
    const page = (data ?? []).map((r: any) => r.id as string);
    ids.push(...page);
    if (page.length < PAGE) return ids;
  }
}

async function revert(dryRun: boolean) {
  const machine = await resolveTarget();
  const backup = readBackup(machine.id);
  if (!backup) {
    throw new Error(
      `No backup at ${backupPath(machine.id)} — refusing to guess the previous state. ` +
        `Restore machines.json from backend/backups/<timestamp>/ instead.`
    );
  }
  console.log(`Reverting id=${machine.id} using backup captured ${backup.capturedAt}`);

  // Restore the exact captured value for every column this script owns — not a blind
  // "set everything to NULL", so a column that had a real value before stays intact.
  const restore: Record<string, unknown> = {};
  for (const col of OWNED_COLUMNS) {
    restore[col] = backup.machineRowBefore[col] ?? null;
  }
  console.log("--- restore ---");
  for (const [k, v] of Object.entries(restore)) console.log(`  ${k} -> ${JSON.stringify(v)}`);

  const before = new Set(backup.telemetryIdsBefore);
  const toDelete = (await telemetryIds(machine.id, true))
    // Belt and braces: never delete a row that already existed before the first apply.
    .filter((id) => !before.has(id));
  console.log(`--- telemetry rows to delete: ${toDelete.length} ---`);

  if (dryRun) {
    console.log("[dry-run] nothing written.");
    return;
  }

  const { error: upErr } = await supabase.from("machines").update(restore).eq("id", machine.id);
  if (upErr) throw new Error(`machines revert failed: ${upErr.message}`);

  for (let i = 0; i < toDelete.length; i += 500) {
    const { error } = await supabase
      .from("telemetry_readings")
      .delete()
      .in("id", toDelete.slice(i, i + 500));
    if (error) throw new Error(`telemetry delete failed: ${error.message}`);
  }
  console.log(`Reverted. Deleted ${toDelete.length} mock telemetry rows.`);
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
