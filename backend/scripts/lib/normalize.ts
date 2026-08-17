// Pure, unit-testable normalization helpers for the Excel -> Supabase import.
// Implements docs/data-import-spec.md Section 4 exactly, extended where the actual
// source files disagree with the spec's stated assumptions (see comments below —
// confirmed by direct inspection of backend/data/*.xlsx and their own Cleaning_Rules
// sheets, which are the spec's own cited source of truth for the sentinel list).

// ---------------------------------------------------------------------------
// Sentinel -> NULL
// ---------------------------------------------------------------------------
//
// Section 4 lists: UNKNOWN, NOT_SPECIFIED, NOT FLAGGED, NEW, "" (empty), DELETE***,
// plus "-", "." (bare dash/period) and N/A (any casing).
//
// Direct inspection of every workbook's own Cleaning_Rules sheet ("Invalid
// Placeholders" / "ค่า placeholder ที่ถือว่าไม่มีข้อมูล" blocks) shows the actual
// placeholder set used across the 5 files is larger than what Section 4 spells out:
//   Machine_Database.xlsx      Cleaning_Rules rule 1: . - N/A NA TBD NULL
//   Machine Repaire History.xlsx rule 2:              . - N/A NA TBD NONE ไม่มี
//   Inventory_Spare_Items.xlsx  rule 2 (Part_Number):  N/A NA -
//   ประวัติการเบิกอะไหล่ (SparePart).xlsx block C:      - N/A NA TBD
//   PM PLAN (...).xlsx block 3:                        - N/A NA TBD NULL .
//
// Unioned with Section 4's own list, this is the full sentinel set:
const SENTINEL_TOKENS = [
  "UNKNOWN",
  "NOT_SPECIFIED",
  "NOT FLAGGED",
  "NEW",
  "DELETE***",
  "-",
  ".",
  "N/A",
  "NA",
  "TBD",
  "NULL",
  "NONE",
  "ไม่มี",
];

const SENTINEL_SET = new Set(SENTINEL_TOKENS.map((s) => s.toUpperCase()));

function toTrimmedString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s;
}

/** Sentinel -> NULL. Case-insensitive exact match on the trimmed value. */
export function nullify(v: unknown): string | null {
  const s = toTrimmedString(v);
  if (s === null || s === "") return null;
  if (SENTINEL_SET.has(s.toUpperCase())) return null;
  return s;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------
//
// Section 4 describes the source date columns as plain text in `M/D/YY` or
// `M/D/YYYY` format (no zero-padding), with 2-digit years always meaning 20xx.
// That pattern IS what's actually in the PM PLAN sheet's PlanMonth/ActualMonth/
// LastPMDate/NextPMDate columns (e.g. "9/2/25", "3/9/26").
//
// However, direct inspection of the other files shows their date/datetime columns
// (Report_DateTime, Finish_DateTime, TimeRef_Production, Modified, Withdraw_Date)
// are native Excel date-time cells, and when read via SheetJS's default (raw:false)
// formatting they come back as pre-formatted ISO-ish strings, e.g.
// "2023-08-24 15:30" or "2026-06-26" (SheetJS applies the cell's own number
// format). Both parsers below are kept so a single pure function handles every
// real date string this import will see; unparseable input -> null.

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;
const US_DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;

function normalizeYear(yy: string): number | null {
  if (yy.length === 4) return Number(yy);
  if (yy.length === 2) return 2000 + Number(yy); // 2-digit year ALWAYS maps to 20xx
  return null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Returns an ISO `YYYY-MM-DD` date string, or null if unparseable.
 * Handles: `M/D/YY` / `M/D/YYYY` (Section 4 spec format, no zero-padding required
 * on input) and ISO `YYYY-MM-DD` (optionally with a time suffix, which is dropped).
 */
export function parseExcelDate(v: unknown): string | null {
  const s = toTrimmedString(v);
  if (s === null || s === "") return null;
  if (SENTINEL_SET.has(s.toUpperCase())) return null;

  const iso = s.match(ISO_DATE_RE);
  if (iso) {
    const [, y, m, d] = iso;
    const year = Number(y);
    const month = Number(m);
    const day = Number(d);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${y}-${m}-${d}`;
  }

  const us = s.match(US_DATE_RE);
  if (us) {
    const [, mm, dd, yy] = us;
    const year = normalizeYear(yy);
    const month = Number(mm);
    const day = Number(dd);
    if (year === null || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  return null;
}

/**
 * Returns a full ISO datetime string, with an explicit `+07:00` (Asia/Bangkok) offset,
 * for `timestamptz` columns (Finish_DateTime, TimeRef_Production). Falls back to
 * midnight when only a date is present. Unparseable input -> null.
 *
 * The source workbook's date/time values are the factory's local wall-clock time
 * (Thailand), with no timezone info attached. Returning a naive string like
 * "2023-08-24T16:10:00" into a `timestamptz` column would have PostgREST/Postgres
 * interpret it as UTC, silently shifting every imported Finish_DateTime /
 * TimeRef_Production by -7 hours from the real local time. Appending the offset
 * here — once, in the shared parser — makes Postgres store/convert it correctly
 * everywhere this function is used.
 */
export function parseExcelDateTime(v: unknown): string | null {
  const s = toTrimmedString(v);
  if (s === null || s === "") return null;
  if (SENTINEL_SET.has(s.toUpperCase())) return null;

  const BANGKOK_OFFSET = "+07:00";

  const iso = s.match(ISO_DATE_RE);
  if (iso) {
    const [, y, m, d, hh, mm, ss] = iso;
    const month = Number(m);
    const day = Number(d);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const time = hh ? `${hh}:${mm}:${ss ?? "00"}` : "00:00:00";
    return `${y}-${m}-${d}T${time}${BANGKOK_OFFSET}`;
  }

  const us = s.match(US_DATE_RE);
  if (us) {
    const [, mm, dd, yy] = us;
    const year = normalizeYear(yy);
    const month = Number(mm);
    const day = Number(dd);
    if (year === null || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${pad2(month)}-${pad2(day)}T00:00:00${BANGKOK_OFFSET}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Numeric
// ---------------------------------------------------------------------------
//
// Money/quantity columns are Excel-formula-derived and carry repeating-decimal
// artifacts (e.g. "61866.66667") -> round to 4dp. Real data also has thousands
// separators ("10,900.00") and accounting-style negative numbers in parentheses
// ("(1,440)" -> -1440), observed in Machine Repaire History's MTLoss_Diff_Min.

const PAREN_NEGATIVE_RE = /^\((.*)\)$/;

/** Parses a numeric cell, rounding to 4 decimal places. Sentinel/blank/unparseable -> null. */
export function parseNumeric(v: unknown): number | null {
  const s = toTrimmedString(v);
  if (s === null || s === "") return null;
  if (SENTINEL_SET.has(s.toUpperCase())) return null;

  let body = s;
  let negative = false;
  const parenMatch = body.match(PAREN_NEGATIVE_RE);
  if (parenMatch) {
    negative = true;
    body = parenMatch[1];
  }
  body = body.replace(/,/g, "").trim();
  if (body === "") return null;

  const num = Number(body);
  if (!Number.isFinite(num)) return null;

  const signed = negative ? -num : num;
  return Math.round(signed * 10000) / 10000;
}

/** Parses a numeric cell as an integer (truncates any fractional part). Sentinel/blank/unparseable -> null. */
export function parseIntSafe(v: unknown): number | null {
  const n = parseNumeric(v);
  if (n === null) return null;
  return Math.trunc(n);
}

// ---------------------------------------------------------------------------
// Machine / spare code normalization
// ---------------------------------------------------------------------------

/** Trim, collapse spaces around a dash ("GR - 309" -> "GR-309"), uppercase. Sentinel/blank -> null. */
export function normalizeMachineCode(v: unknown): string | null {
  const s = nullify(v);
  if (s === null) return null;
  return s.replace(/\s*-\s*/g, "-").toUpperCase().trim();
}

// ---------------------------------------------------------------------------
// Flag / list columns -> text[]
// ---------------------------------------------------------------------------

/** Splits a "; "-joined flag column into a trimmed, empty-dropped string array. Blank -> []. */
export function splitFlags(v: unknown): string[] {
  if (v === null || v === undefined) return [];
  const s = String(v).trim();
  if (s === "") return [];
  return s
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

/** Splits a " | "-joined column (e.g. Technician_List) into a trimmed, empty-dropped string array. */
export function splitPipe(v: unknown): string[] {
  if (v === null || v === undefined) return [];
  const s = String(v).trim();
  if (s === "") return [];
  return s
    .split("|")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

// ---------------------------------------------------------------------------
// Boolean-ish columns
// ---------------------------------------------------------------------------

/**
 * Case-insensitive exact match across all three boolean-ish token pairs used in
 * the source data: YES/NO, TRUE/FALSE, OVERDUE/ON_SCHEDULE. Blank -> null (expected,
 * not a reject). Any other non-blank value -> null (caller should log a reject).
 */
export function parseBoolish(v: unknown): boolean | null {
  const s = toTrimmedString(v);
  if (s === null || s === "") return null;
  const upper = s.toUpperCase();
  if (upper === "YES" || upper === "TRUE" || upper === "OVERDUE") return true;
  if (upper === "NO" || upper === "FALSE" || upper === "ON_SCHEDULE") return false;
  return null;
}
