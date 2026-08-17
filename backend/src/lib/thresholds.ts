// Backend-side port of frontend/src/lib/thresholds.ts — same limits, same Thai
// wording style. Kept dependency-free (no imports) so this file can be
// embedded anywhere in the AI backend, including inside an LLM system prompt
// builder, without dragging in DB/API types.
//
// Why these numbers:
//   • Vibration uses the ISO 10816-3 zone boundaries for medium-sized machines
//     on a rigid mount — zone A/B ends at 2.8 mm/s (still acceptable for
//     continuous running) and zone C/D ends at 7.1 mm/s (damage risk, stop the
//     machine). This basis is stated directly in frontend/src/lib/thresholds.ts.
//   • Spindle temperature (75/85°C) and health score (60/30%) are not
//     re-derived or re-justified here. They simply mirror
//     frontend/src/lib/thresholds.ts, which is the single source of truth for
//     all four limits in this file — see that file for its own reasoning and
//     calibration notes. This file does not repeat or independently verify
//     them, to avoid the two files drifting apart with different stories for
//     the same numbers.
//
// An active error code escalates a machine from "normal" to "warning" (it
// never forces "critical" by itself) — matching the frontend's rule exactly.
// See evaluateMachine() below for where the two files necessarily differ due
// to this file's narrower MachineLevel type.

/* ---------------------------------------------------------------- */
/* Limits                                                            */
/* ---------------------------------------------------------------- */

/** °C — warning at or above 75, critical at or above 85. */
export const SPINDLE_TEMP = { warning: 75, critical: 85 };

/** mm/s RMS, ISO 10816-3 zones — warning at or above 2.8, critical at or above 7.1. */
export const VIBRATION = { warning: 2.8, critical: 7.1 };

/** condition score % — warning below 60, critical below 30. */
export const HEALTH = { warning: 60, critical: 30 };

/* ---------------------------------------------------------------- */
/* Evaluation                                                        */
/* ---------------------------------------------------------------- */

export type MachineLevel = "normal" | "warning" | "critical";

export interface EvaluationInput {
  status?: string | null;
  healthScore?: number | null;
  spindleTemp?: number | null;
  vibrationMms?: number | null;
  activeErrorCode?: string | null;
  activeErrorDesc?: string | null;
}

export interface Evaluation {
  level: MachineLevel;
  reasons: string[];
}

/**
 * Derive a machine's overall level from its telemetry.
 *
 * Missing values (null/undefined) never produce a reason and never get
 * fabricated as "normal by default" — a value we did not measure is not
 * evidence of anything. Only values that are actually present are checked
 * against the thresholds above.
 */
export function evaluateMachine(input: EvaluationInput): Evaluation {
  // The frontend short-circuits on `status === "maintenance"`: it returns
  // immediately with `status: "maintenance"` and a single reason, without
  // evaluating any sensor reading or activeErrorCode at all (being parked for
  // maintenance is an operational decision, not something a sensor reports).
  // MachineLevel here has no "maintenance" value — normal | warning | critical
  // only — so we cannot reproduce that literal status. We mirror the
  // short-circuit behavior instead (skip sensors/activeErrorCode entirely,
  // return only the maintenance reason) and map the level to "normal", the
  // closest non-alarming value, so this never reports a false warning/critical
  // for a machine that is deliberately offline for planned work.
  if (input.status === "maintenance") {
    return {
      level: "normal",
      reasons: ["เครื่องอยู่ระหว่างการซ่อมบำรุงตามแผน"],
    };
  }

  const reasons: string[] = [];
  let level: MachineLevel = "normal";

  const escalate = (next: MachineLevel) => {
    if (next === "critical") level = "critical";
    else if (next === "warning" && level !== "critical") level = "warning";
  };

  if (input.spindleTemp != null) {
    if (input.spindleTemp >= SPINDLE_TEMP.critical) {
      reasons.push(
        `อุณหภูมิ Spindle ${input.spindleTemp}°C ถึงขีดหยุดเครื่องที่ ${SPINDLE_TEMP.critical}°C`
      );
      escalate("critical");
    } else if (input.spindleTemp >= SPINDLE_TEMP.warning) {
      reasons.push(
        `อุณหภูมิ Spindle ${input.spindleTemp}°C เกินขีดเฝ้าระวังที่ ${SPINDLE_TEMP.warning}°C`
      );
      escalate("warning");
    }
  }

  if (input.vibrationMms != null) {
    if (input.vibrationMms >= VIBRATION.critical) {
      reasons.push(
        `ค่าแรงสั่นสะเทือน ${input.vibrationMms} mm/s ถึงขีดหยุดเครื่องที่ ${VIBRATION.critical} mm/s`
      );
      escalate("critical");
    } else if (input.vibrationMms >= VIBRATION.warning) {
      reasons.push(
        `ค่าแรงสั่นสะเทือน ${input.vibrationMms} mm/s เกินขีดเฝ้าระวังที่ ${VIBRATION.warning} mm/s`
      );
      escalate("warning");
    }
  }

  if (input.healthScore != null) {
    if (input.healthScore < HEALTH.critical) {
      reasons.push(
        `ดัชนีสุขภาพเครื่อง ${input.healthScore}% ต่ำกว่าขีดหยุดเครื่องที่ ${HEALTH.critical}%`
      );
      escalate("critical");
    } else if (input.healthScore < HEALTH.warning) {
      reasons.push(
        `ดัชนีสุขภาพเครื่อง ${input.healthScore}% ต่ำกว่าขีดเฝ้าระวังที่ ${HEALTH.warning}%`
      );
      escalate("warning");
    }
  }

  // Matches the frontend exactly: an active error code only escalates a
  // machine that is otherwise "normal" up to "warning". It does NOT force
  // "critical", and it does not touch a level already at "warning" or
  // "critical" from a sensor reading.
  if (input.activeErrorCode) {
    reasons.push(
      input.activeErrorDesc
        ? `มีรหัสข้อผิดพลาดค้างอยู่ ${input.activeErrorCode}: ${input.activeErrorDesc}`
        : `มีรหัสข้อผิดพลาดค้างอยู่ ${input.activeErrorCode}`
    );
    if (level === "normal") level = "warning";
  }

  if (reasons.length === 0) {
    // "ทุกค่าที่วัดได้อยู่ในเกณฑ์ปกติ" is only true if something was actually
    // measured. The imported machines have no spindleTemp/vibrationMms at all,
    // and 232 of 973 have no healthScore either (no repair history to derive one
    // from), so claiming their readings are within spec would be as misleading
    // as a false critical alarm — it just errs in the other direction. Say
    // plainly that there is nothing to judge the machine on.
    const measuredCount = [
      input.spindleTemp,
      input.vibrationMms,
      input.healthScore,
    ].filter((value) => value != null).length;

    reasons.push(
      measuredCount === 0
        ? "ยังไม่มีข้อมูลที่ใช้ประเมินสภาพเครื่องนี้ (ยังไม่มีประวัติซ่อม และไม่มีค่าจากเซนเซอร์)"
        : "ทุกค่าที่วัดได้อยู่ในเกณฑ์ปกติ"
    );
  }

  return { level, reasons };
}

/**
 * Thai plain-text block describing the threshold rules, for embedding in an
 * LLM system prompt (e.g. Gemini). No markdown headers — dashes only — so it
 * stays cheap to tokenize and unambiguous to quote back to a technician.
 */
export function thresholdSummaryText(): string {
  return [
    "เกณฑ์ประเมินสภาพเครื่องจักร (ปกติ / เฝ้าระวัง / วิกฤต):",
    `- อุณหภูมิ Spindle: ปกติ < ${SPINDLE_TEMP.warning}°C, เฝ้าระวัง ${SPINDLE_TEMP.warning}-${SPINDLE_TEMP.critical}°C, วิกฤต >= ${SPINDLE_TEMP.critical}°C`,
    `- แรงสั่นสะเทือน (ISO 10816-3): ปกติ < ${VIBRATION.warning} mm/s, เฝ้าระวัง ${VIBRATION.warning}-${VIBRATION.critical} mm/s, วิกฤต >= ${VIBRATION.critical} mm/s`,
    `- ดัชนีสุขภาพเครื่อง: ปกติ >= ${HEALTH.warning}%, เฝ้าระวัง ${HEALTH.critical}-${HEALTH.warning}%, วิกฤต < ${HEALTH.critical}%`,
    "- ระดับ normal = ไม่มีค่าใดเกินเกณฑ์ (หรือไม่มีข้อมูล) และไม่มีรหัสข้อผิดพลาดค้างอยู่",
    "- ระดับ warning = มีค่าอย่างน้อยหนึ่งค่าอยู่ในช่วงเฝ้าระวัง แต่ยังไม่ถึงวิกฤต",
    "- ระดับ critical = มีค่าอย่างน้อยหนึ่งค่าเกินพิกัดวิกฤต",
    "- มีรหัสข้อผิดพลาดค้างอยู่ (activeErrorCode) จะยกระดับจาก normal ขึ้นเป็น warning เท่านั้น ไม่ทำให้เป็น critical และไม่ลดระดับ warning/critical ที่เกิดจากเซนเซอร์อยู่แล้ว",
    "- status = maintenance จะคืนค่าระดับ normal พร้อมเหตุผลเดียวคือกำลังซ่อมบำรุงตามแผน โดยไม่นำค่าเซนเซอร์หรือรหัสข้อผิดพลาดมาประเมินเพิ่ม (สะท้อนพฤติกรรม short-circuit ของฝั่ง frontend)",
    "- ค่าที่ไม่มีข้อมูล (null/undefined) จะไม่ถูกนำมาประเมิน ไม่ถือว่าปกติหรือผิดปกติ",
    "- ถ้าไม่มีค่าที่วัดได้เลยสักค่า (spindleTemp, vibrationMms, healthScore เป็น null ทั้งหมด) ระดับจะยังเป็น normal แต่เหตุผลจะระบุว่ายังไม่มีข้อมูลที่ใช้ประเมินสภาพเครื่องนี้ ไม่ใช่ว่าอยู่ในเกณฑ์ปกติ",
  ].join("\n");
}
