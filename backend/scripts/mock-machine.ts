/**
 * mock-machine.ts — fill ONE machine with clearly-marked MOCK data.
 *
 * ⚠️  THIS SCRIPT WRITES FABRICATED SENSOR READINGS INTO A MAINTENANCE SYSTEM. ⚠️
 *
 * It exists for demo/UI purposes only. Every value it writes is invented; none of
 * it comes from a sensor. Technicians must never act on it. That is why:
 *   • `machines.info_notes` gets a `MOCK_DATA` entry plus a Thai warning,
 *   • `machines.model` carries a visible `[MOCK]` suffix (model is rendered in the
 *     machine selector, the scan view and the registry detail modal, so the marker
 *     is visible on screen and not just in the DB),
 *   • every telemetry row it creates has a primary key prefixed `MOCK-`,
 *   • the pre-change state is captured to backend/backups/mock-machine/ so
 *     `--revert` restores the row byte-for-byte and deletes exactly the rows this
 *     script created.
 *
 * SCOPE: exactly one machine — name "OUTER RING RACEWAY GRINDING", code "1"
 * (id "1#0802"). Nothing else in the database is read-modified-written.
 *
 * Usage:
 *   npm run mock:machine -- --dry-run    # print the plan, touch nothing
 *   npm run mock:machine                 # apply (idempotent, safe to re-run)
 *   npm run mock:machine -- --revert     # restore NULLs + delete mock telemetry
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

const TARGET_NAME = "OUTER RING RACEWAY GRINDING";
const TARGET_CODE = "1";

/** Marker written into machines.info_notes. */
const MOCK_MARKER = "MOCK_DATA";
const MOCK_NOTE_TH =
  "ข้อมูลจำลองเพื่อสาธิต UI เท่านั้น ไม่ใช่ค่าจริงจากเซนเซอร์ ห้ามใช้ตัดสินใจซ่อมบำรุง (สร้างโดย scripts/mock-machine.ts)";

/**
 * telemetry_readings.source is constrained by 0003_telemetry_readings.sql to
 * ('iot','manual','seed') — 'mock' is NOT an allowed value and the insert would be
 * rejected. 'iot' would be an outright lie (it claims a real sensor produced the
 * reading), so 'seed' is used: it is the value the original DB seed used and is the
 * least likely of the three to be mistaken for a live feed. The unambiguous marker
 * is therefore carried on the primary key instead (see mockReadingId).
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
 * Bands chosen against frontend/src/lib/thresholds.ts:
 *   spindle_temp 68.4 °C  → NORMAL (warning 75, error 85). Warm enough to look like
 *                           a grinder under load, ~6.6 °C of visible headroom.
 *   vibration    2.35 mm/s→ NORMAL, ISO 10816-3 zone B (warning 2.8, error 7.1).
 *                           Deliberately just under the watch line so the 30-day
 *                           upward drift is worth looking at without raising an alarm.
 *   health_score 74       → NORMAL (warning 60, error 30). Live range is 3–98,
 *                           median 71 — 74 is a plausible slightly-above-median
 *                           machine, not an implausible 98.
 * All three land in "normal", which agrees with the machine's existing
 * status = 'normal'; evaluateMachine() therefore returns "normal" and the health
 * colour cannot contradict the status badge next to it.
 */
const CURRENT = {
  spindle_temp: 68.4,
  vibration_mms: 2.35,
  health_score: 74,
};

/** 30 days of history, one reading per hour, per metric. */
const WINDOW_HOURS = 720;
const POINTS = WINDOW_HOURS + 1; // 721 — under the route's MAX_READINGS_ROWS (2000)

/* Tiny self-contained SVG placeholders. Data URIs, not external URLs: the plant is
 * offline and nothing may depend on a CDN. (Verified: no component currently renders
 * either field — there is no <img> in frontend/src at all — so these are inert today,
 * but if an <img> is ever added it will render offline instead of showing a broken
 * image icon. That is the whole reason for not writing an https:// URL here.) */
const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

const IMAGE_URL = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">` +
    `<rect width="320" height="200" fill="#eef2f6"/>` +
    `<rect x="52" y="66" width="216" height="84" rx="8" fill="#c8d3de"/>` +
    `<rect x="76" y="90" width="60" height="36" rx="4" fill="#98a9ba"/>` +
    `<circle cx="212" cy="108" r="22" fill="#98a9ba"/>` +
    `<text x="160" y="42" font-family="sans-serif" font-size="15" font-weight="bold" fill="#5b6b7c" text-anchor="middle">OUTER RING RACEWAY GRINDING</text>` +
    `<text x="160" y="178" font-family="sans-serif" font-size="12" fill="#8a97a5" text-anchor="middle">MOCK IMAGE - ภาพจำลอง</text>` +
    `</svg>`
);

const QR_CODE_URL = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200" viewBox="0 0 180 200">` +
    `<rect width="180" height="200" fill="#ffffff"/>` +
    `<g fill="#111111">` +
    `<rect x="14" y="14" width="42" height="42"/><rect x="22" y="22" width="26" height="26" fill="#fff"/><rect x="28" y="28" width="14" height="14"/>` +
    `<rect x="124" y="14" width="42" height="42"/><rect x="132" y="22" width="26" height="26" fill="#fff"/><rect x="138" y="28" width="14" height="14"/>` +
    `<rect x="14" y="124" width="42" height="42"/><rect x="22" y="132" width="26" height="26" fill="#fff"/><rect x="28" y="138" width="14" height="14"/>` +
    `<rect x="70" y="14" width="10" height="10"/><rect x="90" y="24" width="10" height="10"/><rect x="70" y="44" width="10" height="10"/>` +
    `<rect x="14" y="70" width="10" height="10"/><rect x="34" y="90" width="10" height="10"/><rect x="70" y="70" width="10" height="10"/>` +
    `<rect x="90" y="90" width="10" height="10"/><rect x="110" y="70" width="10" height="10"/><rect x="130" y="90" width="10" height="10"/>` +
    `<rect x="70" y="110" width="10" height="10"/><rect x="110" y="130" width="10" height="10"/><rect x="90" y="150" width="10" height="10"/>` +
    `<rect x="130" y="150" width="10" height="10"/><rect x="150" y="110" width="10" height="10"/>` +
    `</g>` +
    `<text x="90" y="186" font-family="sans-serif" font-size="11" fill="#666" text-anchor="middle">MOCK QR - รหัส 1</text>` +
    `</svg>`
);

/** ISO date (YYYY-MM-DD) N days from `from`. format.ts parses this exactly. */
function isoDate(from: Date, offsetDays: number): string {
  const d = new Date(from.getTime() + offsetDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * The columns this script writes. Every one is currently NULL on the target row.
 *
 * NOT written, deliberately:
 *  • active_error_code / active_error_desc — left NULL. evaluateMachine() escalates
 *    any machine with an error code to "warning", which would contradict this row's
 *    real status = 'normal', and it would be the ONLY machine of 973 showing an
 *    active fault — a fabricated alarm in the one screen technicians act on. The
 *    coherent story here is a healthy machine with a slow vibration drift worth
 *    watching, which is exactly what the readings say.
 *  • related_qr_code — pointing it at another machine's QR would fabricate a
 *    relationship between two real assets.
 *  • quality_flags — currently `[]`, which is not "missing data": it is the importer
 *    stating it found no data-quality problems with this row. Overwriting it would
 *    corrupt an audit trail rather than fill a gap.
 */
function buildMachinePatch(now: Date, existingNotes: string[]) {
  const lastMaintenance = isoDate(now, -66); // in the past — never a future date
  const nextMaintenance = isoDate(now, 24); //  = last + 90 days, the TBM cadence
  //                                            sibling raceway grinders use in pm_plans
  return {
    // Realistic bearing-raceway grinder designation. The visible "[MOCK]" suffix is
    // intentional — `model` is rendered in TopBar's machine selector, ScanMachineView
    // and the registry detail modal, so anyone looking at this machine on screen is
    // told the data is fake without having to open the database.
    model: "ORG-320CNC [MOCK]",
    health_score: CURRENT.health_score,
    spindle_temp: CURRENT.spindle_temp,
    vibration_mms: CURRENT.vibration_mms,
    // ~8.6 years at a 2-shift 4,800 h/year duty — and 1,280 h into the 5,000 h belt
    // interval the sibling machines' UBM plans use, i.e. mid-interval, not suspiciously
    // sitting on a round service boundary.
    operating_hours: 41_280,
    last_maintenance: lastMaintenance,
    next_maintenance: nextMaintenance,
    qr_code_url: QR_CODE_URL,
    image_url: IMAGE_URL,
    // Source Excel had no Status_Clean (hence the existing MISSING_STATUS note). The
    // machine has a cost centre and a responsible group and is in production, so the
    // only coherent value from the live domain {APPROVED, REJECTED} is APPROVED.
    lifecycle_status: "APPROVED",
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
 * Plant duty cycle at a given instant, 0..1.
 * Two production shifts (08:00–17:00, 20:00–05:00) with changeover/break windows
 * between them, and a much lighter Sunday. This is what puts a visible daily rhythm
 * in the 24 h view and a visible weekly rhythm in the 7 d / 30 d views.
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
 * Build all three series ending at `endAt`, oldest first.
 *
 * Shape (deliberately not a flat line and not pure noise):
 *  • a slow 30-day drift — the trend that makes the chart worth opening,
 *  • the daily/weekly duty rhythm above,
 *  • for vibration, a ~5-day sawtooth: roughness creeps up between wheel dresses
 *    and drops sharply after each dress,
 *  • Gaussian measurement noise on top.
 * Each series is then offset so its final point lands exactly on CURRENT.*, keeping
 * the chart and the machine card in agreement.
 */
function buildSeries(endAt: Date): Series[] {
  const gTemp = makeGaussian(0x51ce01);
  const gVib = makeGaussian(0x51ce02);
  const gHealth = makeGaussian(0x51ce03);

  const temp: Series = { metric: "spindle_temp", points: [] };
  const vib: Series = { metric: "vibration_mms", points: [] };
  const health: Series = { metric: "health_score", points: [] };

  for (let i = 0; i < POINTS; i++) {
    const hoursAgo = WINDOW_HOURS - i;
    const at = new Date(endAt.getTime() - hoursAgo * 3_600_000);
    const p = i / (POINTS - 1); // 0 = 30 days ago, 1 = now
    const load = dutyCycle(at);

    // Spindle: cool baseline + load-driven rise + slow thermal drift from bearing wear.
    temp.points.push({
      recordedAt: at,
      value: 63.5 + 2.4 * p + 4.4 * load + 0.9 * Math.sin((2 * Math.PI * i) / 24) + gTemp() * 0.5,
    });

    // Vibration: drift + load + wheel-dress sawtooth (period 120 h) + fine noise.
    const dressPhase = (i % 120) / 120;
    vib.points.push({
      recordedAt: at,
      value: 1.94 + 0.34 * p + 0.2 * load + 0.16 * dressPhase + gVib() * 0.045,
    });

    // Health index is derived, not measured: it moves in small daily steps, not
    // continuously. Sampled hourly so all three metrics share one time axis.
    const day = Math.floor(i / 24);
    health.points.push({
      recordedAt: at,
      value: 79.4 - 5.2 * (day / (POINTS / 24)) + gHealth() * 0.35,
    });
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

  return [temp, vib, health];
}

/* ------------------------------------------------------------------ */
/* Machine lookup                                                     */
/* ------------------------------------------------------------------ */

async function resolveTarget() {
  const { data, error } = await supabase.from("machines").select("*").eq("name", TARGET_NAME);
  if (error) throw new Error(`Machine lookup failed: ${error.message}`);
  const rows = data ?? [];
  if (rows.length === 0) throw new Error(`No machine named "${TARGET_NAME}".`);
  if (rows.length > 1) {
    const exact = rows.filter((r: any) => r.code === TARGET_CODE);
    console.log(`Multiple machines named "${TARGET_NAME}":`);
    for (const r of rows) console.log(`  id=${r.id} code=${r.code}`);
    if (exact.length !== 1) {
      throw new Error(`Cannot disambiguate: ${exact.length} rows have code = "${TARGET_CODE}".`);
    }
    return exact[0] as any;
  }
  const row = rows[0] as any;
  if (row.code !== TARGET_CODE) {
    throw new Error(`Sole match has code "${row.code}", expected "${TARGET_CODE}". Refusing to touch it.`);
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
  "model",
  "health_score",
  "spindle_temp",
  "vibration_mms",
  "operating_hours",
  "last_maintenance",
  "next_maintenance",
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

  console.log("\nDone. Revert with:  npm run mock:machine -- --revert");
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
