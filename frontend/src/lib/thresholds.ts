// Single source of truth for machine condition limits.
//
// Why these numbers:
//   • Vibration uses the ISO 10816-3 zone boundaries for medium-sized machines on
//     a rigid mount — zone A/B ends at 2.8 mm/s (still acceptable for continuous
//     running) and zone C/D ends at 7.1 mm/s (damage risk, stop the machine).
//   • Spindle temperature: the SpeedMill maintenance manual raises alarm ALM-302
//     for spindle over-temperature above 80°C, so 75°C is the watch point that
//     gives a technician time to react before the alarm, and 85°C is the point
//     where running on is no longer acceptable.
//   • Health score is the plant's own rolling condition index: below 80 the
//     machine needs watching, below 50 it must not stay in production.
// A machine reporting an active error code is never "normal" — the code itself is
// evidence something is wrong even when every sensor still reads inside its band.
//
// These constants replace the per-view magic numbers that used to disagree with
// each other. Import them instead of hard-coding a limit anywhere in the UI.

import type { Machine } from "../types";

/* ---------------------------------------------------------------- */
/* Limits                                                           */
/* ---------------------------------------------------------------- */

/** °C — at or above this the spindle needs watching. */
export const SPINDLE_TEMP_WARNING = 75;
/** °C — at or above this the machine must not keep running. */
export const SPINDLE_TEMP_ERROR = 85;

/** mm/s RMS — at or above this vibration is out of ISO 10816-3 zone A/B. */
export const VIBRATION_WARNING = 2.8;
/** mm/s RMS — at or above this vibration is in ISO 10816-3 zone D. */
export const VIBRATION_ERROR = 7.1;

/* ---- Health score ------------------------------------------------
 *
 * CALIBRATED AGAINST THE LIVE DISTRIBUTION — RE-CALIBRATE IF THE FORMULA CHANGES.
 *
 * `health_score` is not a physical measurement on a fixed scale; it is a derived
 * index whose distribution moves whenever backend changes the formula. Limits
 * picked for one distribution silently become wrong for the next. The previous
 * limits (80 / 50) were calibrated against a formula whose median was 86; when
 * the formula was rebuilt (to fix non-monotonicity and an artificial floor) the
 * median dropped to 71, and those same limits would have marked 64% of every
 * scored machine as abnormal — an alarm that loud is one technicians learn to
 * ignore, which is the failure mode this whole screen exists to avoid.
 *
 * Both limits below are read off the real distribution rather than chosen as
 * round numbers:
 *
 * • WARNING = 60 is not a percentile — it is the boundary already present in the
 *   data. Across every scored machine, no machine that backend classifies as
 *   `status: "normal"` scores below 60, and contradictions appear immediately
 *   above it (8 at a cutoff of 62, 29 at 65). Sitting exactly on that edge is
 *   what guarantees the health colour can never contradict the status badge
 *   rendered beside it: everything this colours amber or red is already
 *   `warning` or `maintenance` by status, so the health band adds detail to that
 *   verdict instead of arguing with it.
 *
 * • ERROR = 30 is where the old formula's artificial floor sat. Every machine
 *   below it is one the previous scale could not even rank, because it clamped
 *   them all to the same value; the new formula's whole purpose is to spread
 *   that cohort out. It selects a small, genuinely actionable group — a few
 *   percent of scored machines — rather than a queue no team could work through.
 *
 * HOW TO RE-CALIBRATE (do this whenever the formula changes):
 *   1. Pull the live scores: GET /api/machines?limit=1000.
 *   2. Set WARNING to the highest cutoff that still yields ZERO machines with
 *      `status === "normal"` below it. That keeps the two signals consistent.
 *   3. Set ERROR so the "stop the machine" group stays small enough for the
 *      maintenance team to actually clear.
 * Deliberately no machine counts are recorded here — they go stale on the next
 * derivation run, and a stale number reads as a fact.
 */

/** % — below this the condition index needs watching. */
export const HEALTH_SCORE_WARNING = 60;
/** % — below this the machine must not stay in production. */
export const HEALTH_SCORE_ERROR = 30;

/* ---------------------------------------------------------------- */
/* Per-parameter evaluation                                         */
/* ---------------------------------------------------------------- */

/** Severity of a single sensor reading. */
export type SensorLevel = "normal" | "warning" | "error";

// Machine's telemetry fields are typed as plain `number` (matching the mock
// fixtures every one of these functions was originally written against), but
// real imported machines have NO Excel source for spindle_temp/vibration_mms/
// health_score at all (see docs/data-import-spec.md) and come back as `null`
// from the API for all 973 of them. Without the `== null` guards below,
// `null < HEALTH_SCORE_ERROR` evaluates to `true` (JS coerces null to 0 for
// relational operators) — every real machine was reporting a false "error"
// condition ("ดัชนีสุขภาพเครื่อง null% ต่ำกว่าขีดหยุดเครื่องที่ 50%") on the
// technician home screen. Missing data is not evidence of a problem, so it
// reads as "normal" (no alarm), not as the worst possible reading.
export function spindleTempLevel(spindleTemp: number | null | undefined): SensorLevel {
  if (spindleTemp == null) return "normal";
  if (spindleTemp >= SPINDLE_TEMP_ERROR) return "error";
  if (spindleTemp >= SPINDLE_TEMP_WARNING) return "warning";
  return "normal";
}

export function vibrationLevel(vibrationMms: number | null | undefined): SensorLevel {
  if (vibrationMms == null) return "normal";
  if (vibrationMms >= VIBRATION_ERROR) return "error";
  if (vibrationMms >= VIBRATION_WARNING) return "warning";
  return "normal";
}

/**
 * Severity band of a condition index.
 *
 * `null` returns "normal" meaning **"raises no alarm"**, NOT "is healthy" — 232
 * machines have never been repaired, so no score can be derived for them, and
 * that is not evidence of good condition any more than of bad. The distinction
 * matters at every call site: anything that *displays* or *counts* a band must
 * branch on `healthScore == null` FIRST and render/bucket it as "no data", so
 * un-scored machines land in no band at all. Only alarm logic (evaluateMachine)
 * may treat a missing score as quiet.
 */
export function healthScoreLevel(healthScore: number | null | undefined): SensorLevel {
  if (healthScore == null) return "normal";
  if (healthScore < HEALTH_SCORE_ERROR) return "error";
  if (healthScore < HEALTH_SCORE_WARNING) return "warning";
  return "normal";
}

/* ---------------------------------------------------------------- */
/* Which readings actually exist                                    */
/* ---------------------------------------------------------------- */

// The UI was built around an IoT feed the plant has not installed. Verified
// against the live tables: operating_hours 0/973, spindle_temp 0/973,
// vibration_mms 0/973, telemetry_readings 0 rows — there is no source column
// for any of them anywhere in the import, and inventing values for a screen
// technicians act on is more dangerous than showing nothing.
//
// So the sensor sections are *hidden while their data is absent*, never
// deleted: the gate below is purely "did any real value arrive?". Wire up real
// sensors and the same cards, chart and metric tabs come back on their own,
// with no code change.

/** The four numeric readings whose UI is gated on real data existing. */
export type GatedReading = "spindleTemp" | "vibrationMms" | "operatingHours" | "healthScore";

type ReadingSource = Partial<Pick<Machine, GatedReading>>;

export interface ReadingAvailability {
  spindleTemp: boolean;
  vibrationMms: boolean;
  operatingHours: boolean;
  healthScore: boolean;
  /**
   * True when at least one *sensor-only* reading exists (spindle temperature,
   * vibration or operating hours). `healthScore` is deliberately excluded — it
   * is derived from repair history, not measured, so its presence must not
   * resurrect the IoT sections.
   */
  anySensor: boolean;
}

/**
 * Which readings are present across a set of machines.
 *
 * Pass the whole fleet for fleet-wide sections (the dashboard trend card, the
 * repeated metric cells in the machine registry — those must all agree or the
 * grid goes ragged), or `[machine]` for a single machine's detail cards.
 */
export function readingAvailability(machines: readonly ReadingSource[]): ReadingAvailability {
  const present = (key: GatedReading) => machines.some((m) => m[key] != null);
  const spindleTemp = present("spindleTemp");
  const vibrationMms = present("vibrationMms");
  const operatingHours = present("operatingHours");
  return {
    spindleTemp,
    vibrationMms,
    operatingHours,
    healthScore: present("healthScore"),
    anySensor: spindleTemp || vibrationMms || operatingHours,
  };
}

/* ---------------------------------------------------------------- */
/* Whole-machine evaluation                                         */
/* ---------------------------------------------------------------- */

/** The readings `evaluateMachine` needs — a Machine satisfies this. */
export type MachineReadings = Pick<
  Machine,
  "spindleTemp" | "vibrationMms" | "healthScore"
> &
  Partial<Pick<Machine, "status" | "activeErrorCode" | "activeErrorDesc">>;

export interface MachineEvaluation {
  /** Derived machine status, one of the Machine status union values. */
  status: Machine["status"];
  /** Thai explanations naming the parameter and the limit it breached. */
  reasons: string[];
}

/**
 * Derive a machine's status from its readings.
 *
 * A machine explicitly parked in `maintenance` keeps that status: being on the
 * bench is an operational decision, not something a sensor can report.
 */
export function evaluateMachine(machine: MachineReadings): MachineEvaluation {
  if (machine.status === "maintenance") {
    return {
      status: "maintenance",
      reasons: ["เครื่องอยู่ระหว่างการซ่อมบำรุงตามแผน"],
    };
  }

  const reasons: string[] = [];
  let status: Machine["status"] = "normal";

  const escalate = (level: SensorLevel) => {
    if (level === "error") status = "error";
    else if (level === "warning" && status !== "error") status = "warning";
  };

  const tempLevel = spindleTempLevel(machine.spindleTemp);
  if (tempLevel === "error") {
    reasons.push(
      `อุณหภูมิ Spindle ${machine.spindleTemp}°C ถึงขีดหยุดเครื่องที่ ${SPINDLE_TEMP_ERROR}°C`
    );
  } else if (tempLevel === "warning") {
    reasons.push(
      `อุณหภูมิ Spindle ${machine.spindleTemp}°C เกินขีดเฝ้าระวังที่ ${SPINDLE_TEMP_WARNING}°C`
    );
  }
  escalate(tempLevel);

  const vibLevel = vibrationLevel(machine.vibrationMms);
  if (vibLevel === "error") {
    reasons.push(
      `ค่าแรงสั่นสะเทือน ${machine.vibrationMms} mm/s ถึงขีดหยุดเครื่องที่ ${VIBRATION_ERROR} mm/s`
    );
  } else if (vibLevel === "warning") {
    reasons.push(
      `ค่าแรงสั่นสะเทือน ${machine.vibrationMms} mm/s เกินขีดเฝ้าระวังที่ ${VIBRATION_WARNING} mm/s`
    );
  }
  escalate(vibLevel);

  const healthLevel = healthScoreLevel(machine.healthScore);
  if (healthLevel === "error") {
    reasons.push(
      `ดัชนีสุขภาพเครื่อง ${machine.healthScore}% ต่ำกว่าขีดหยุดเครื่องที่ ${HEALTH_SCORE_ERROR}%`
    );
  } else if (healthLevel === "warning") {
    reasons.push(
      `ดัชนีสุขภาพเครื่อง ${machine.healthScore}% ต่ำกว่าขีดเฝ้าระวังที่ ${HEALTH_SCORE_WARNING}%`
    );
  }
  escalate(healthLevel);

  if (machine.activeErrorCode) {
    reasons.push(
      machine.activeErrorDesc
        ? `มีรหัสข้อผิดพลาดค้างอยู่ ${machine.activeErrorCode}: ${machine.activeErrorDesc}`
        : `มีรหัสข้อผิดพลาดค้างอยู่ ${machine.activeErrorCode}`
    );
    if (status === "normal") status = "warning";
  }

  if (reasons.length === 0) {
    // "ทุกค่าที่วัดได้อยู่ในเกณฑ์ปกติ" is only true if something was actually
    // measured. The imported machines have no spindleTemp/vibrationMms at all,
    // and 232 of 973 have no healthScore either (no repair history to derive one
    // from), so claiming their readings are within spec would be as misleading
    // as the false critical alarm this replaced — it just errs in the other
    // direction. Say plainly that there is nothing to judge the machine on.
    const measuredCount = [
      machine.spindleTemp,
      machine.vibrationMms,
      machine.healthScore,
    ].filter((value) => value != null).length;

    reasons.push(
      measuredCount === 0
        ? "ยังไม่มีข้อมูลที่ใช้ประเมินสภาพเครื่องนี้ (ยังไม่มีประวัติซ่อม และไม่มีค่าจากเซนเซอร์)"
        : "ทุกค่าที่วัดได้อยู่ในเกณฑ์ปกติ"
    );
  }

  return { status, reasons };
}
