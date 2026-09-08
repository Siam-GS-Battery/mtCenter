// Display helpers for values the real factory data may simply not have.
//
// Background: the Excel import that replaced the mock fixtures has no source
// column for a number of fields (all machine telemetry, ~9% of spare-part
// prices, and so on), so the API legitimately returns `null`. Rendering that
// straight into JSX prints the literal text "null"; running it through
// `.toLocaleString()` throws; and `?? 0` is worse than either, because a
// missing reading then masquerades as a real measurement of zero.
//
// Rule of thumb used throughout the UI: **missing data is "unknown", never a
// value.** It renders as an em dash (or a Thai "ไม่มีข้อมูล" where a dash would
// be ambiguous), it is skipped in charts rather than plotted at zero, it sorts
// last in "worst first" lists rather than first, and it never raises an alarm.

/** What every "no data" slot renders as. Keep this the single source. */
export const NO_DATA = "—";

/** Thai wording for places where a bare dash reads as ambiguous. */
export const NO_DATA_TH = "ไม่มีข้อมูล";

/** Truncates long, unspaced strings (filenames, titles) so UI like toasts stays
 *  a sane width — SweetAlert2/flex layouts can only wrap on spaces, so a single
 *  long word still overflows unless it's shortened first. Appends "…" when cut. */
export function truncateText(value: string, maxLength: number = 40): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Why a machine has no condition index.
 *
 * `healthScore` is derived from the machine's own repair history, so 232 of the
 * 973 machines will never have one — they have simply never been repaired. That
 * is the opposite of bad health, and "ไม่มีข้อมูล" invites the reader to assume
 * a broken pipeline. Name the actual reason instead.
 */
export const NO_REPAIR_HISTORY_TH = "ยังไม่มีประวัติซ่อม";

/** True when a value carries no information (null/undefined/NaN/blank string). */
export function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "number") return !Number.isFinite(value);
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/** Render any value, falling back to a placeholder when it is missing. */
export function orDash(value: string | number | null | undefined, placeholder = NO_DATA): string {
  return isMissing(value) ? placeholder : String(value);
}

/** Thousands-separated number, or a placeholder — never `NaN`, never `0`. */
export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  placeholder = NO_DATA
): string {
  if (isMissing(value)) return placeholder;
  return (value as number).toLocaleString("th-TH", options);
}

/** Fixed-decimal number, or a placeholder. */
export function formatDecimal(
  value: number | null | undefined,
  digits = 1,
  placeholder = NO_DATA
): string {
  if (isMissing(value)) return placeholder;
  return (value as number).toFixed(digits);
}

/** Thai baht amount, or a placeholder. Never renders "฿0" for missing data. */
export function formatTHB(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  placeholder = NO_DATA
): string {
  if (isMissing(value)) return placeholder;
  return `฿${(value as number).toLocaleString("th-TH", options)}`;
}

/** A measurement with its unit, or a bare placeholder (no dangling unit). */
export function formatWithUnit(
  value: number | null | undefined,
  unit: string,
  digits?: number,
  placeholder = NO_DATA
): string {
  if (isMissing(value)) return placeholder;
  const n = value as number;
  return `${digits == null ? n.toLocaleString("th-TH") : n.toFixed(digits)} ${unit}`;
}

/** Date string as stored (YYYY-MM-DD), or a placeholder. */
export function formatDate(value: string | null | undefined, placeholder = NO_DATA): string {
  return isMissing(value) ? placeholder : (value as string);
}

/* ---------------------------------------------------------------- */
/* Dates that are late                                              */
/* ---------------------------------------------------------------- */

/** Today as YYYY-MM-DD in the *local* (factory) timezone, not UTC. */
function todayIsoDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * True when a planned date has already passed.
 *
 * 106 of the 587 machines that have a `nextMaintenance` date carry one in the
 * past — those PMs are genuinely overdue, and rendering them in the same
 * neutral grey as a date next month hides the only thing a supervisor needed to
 * see. A missing date is *not* overdue: nothing was ever scheduled.
 */
export function isOverdueDate(value: string | null | undefined): boolean {
  if (isMissing(value)) return false;
  const day = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  return day < todayIsoDate();
}

/** Whole days a planned date is late by, or `null` when it is not overdue. */
export function daysOverdue(value: string | null | undefined): number | null {
  if (!isOverdueDate(value)) return null;
  const planned = Date.parse(`${String(value).slice(0, 10)}T00:00:00`);
  const today = Date.parse(`${todayIsoDate()}T00:00:00`);
  if (Number.isNaN(planned)) return null;
  return Math.round((today - planned) / 86_400_000);
}

/** "เมื่อ 55 วันก่อน" for a past date, "วันนี้" for today, `null` when missing. */
export function daysSinceLabel(value: string | null | undefined): string | null {
  if (isMissing(value)) return null;
  const day = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const then = Date.parse(`${day}T00:00:00`);
  const today = Date.parse(`${todayIsoDate()}T00:00:00`);
  if (Number.isNaN(then)) return null;
  const days = Math.round((today - then) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return "วันนี้";
  return `เมื่อ ${days.toLocaleString("th-TH")} วันก่อน`;
}

/** "เกินกำหนด 12 วัน" — the overdue badge text, or `null` when on schedule. */
export function overdueLabel(value: string | null | undefined): string | null {
  const days = daysOverdue(value);
  if (days == null) return null;
  return days > 0 ? `เกินกำหนด ${days.toLocaleString("th-TH")} วัน` : "เกินกำหนด";
}

// `compareWithMissingLast`, `withoutMissing` and `averageOfPresent` used to live
// here. They were written for the sensor charts and "worst machines first" lists
// that are now gated off (no instrumentation exists to feed them) and had no
// remaining callers. Deleted rather than kept as dead code — the rules they
// encoded are stated at the top of this file, so they can be rewritten from that
// if telemetry ever arrives.
