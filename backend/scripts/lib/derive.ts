/**
 * Pure, side-effect-free helpers for scripts/derive-data.ts.
 *
 * Everything here is deterministic: given the same inputs it produces the same
 * outputs on every run. That is the whole point — derive-data.ts must be
 * idempotent, and the two things that MUST NOT drift between runs are
 * `profiles.id` (work_orders.assigned_to points at it) and
 * `profiles.employee_id` (a UNIQUE column, so a renumber would either collide
 * or silently reassign a number to a different human).
 */

import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// Name normalization
// ---------------------------------------------------------------------------

/**
 * The ONLY name normalization applied.
 *
 * The analysis pass verified the 39 distinct `work_orders.technicians` values
 * have zero whitespace variants and zero junk values, so no trimming/collapsing
 * heuristics are needed or wanted — inventing them would risk merging two real
 * people. The single real defect is one row carrying the Thai honorific prefix
 * "นาย" (Mr.) on "นายสายธาร บุพชาติ" while every other name is bare. Strip that
 * one prefix and nothing else.
 *
 * `นาย` is only stripped when it is a prefix of a LONGER name — a name that is
 * exactly "นาย" would be junk, not an honorific, and there is no such value.
 */
export function normalizeName(raw: string): string {
  const value = raw.trim();
  if (value.length > "นาย".length && value.startsWith("นาย")) {
    return value.slice("นาย".length).trim();
  }
  return value;
}

/**
 * Deterministic, stable profile id.
 *
 * Derived from a SHA-1 of the normalized name rather than a slug: these are Thai
 * names, and slugifying them would either produce unreadable percent-escapes or
 * (if transliterated) a lossy mapping where two different people can collide.
 * A hash prefix is stable across runs, machines, Node versions and locales,
 * which is the only property that actually matters here.
 *
 * 40 people over a 40-bit space — collision probability ~7e-10. The caller
 * asserts uniqueness anyway.
 */
export function profileId(normalizedName: string): string {
  const hash = createHash("sha1").update(normalizedName, "utf8").digest("hex");
  return `usr-${hash.slice(0, 10)}`;
}

/**
 * "สมชาย ชาญช่าง" -> "ส.ช." — first character of each whitespace-separated
 * token, each followed by a period. Matches the style of the 3 pre-existing
 * seed rows exactly.
 *
 * Uses Array.from so the first "character" is a full code point, not half a
 * surrogate pair (Thai is in the BMP so this is belt-and-braces, but a
 * half-surrogate would corrupt the string).
 */
export function initialsOf(normalizedName: string): string | null {
  const tokens = normalizedName.split(/\s+/u).filter(Boolean);
  if (tokens.length === 0) return null;
  return tokens.map((t) => `${Array.from(t)[0]}.`).join("");
}

export type Role = "technician" | "engineer" | "supervisor";

export const ROLE_PREFIX: Record<Role, string> = {
  technician: "EMP",
  engineer: "ENG",
  supervisor: "SUP",
};

/**
 * Sequential employee_id generator.
 *
 * `employee_id` is the one synthetic field in this whole script: 36 of the 40
 * real people have no employee number anywhere in the source data. It follows
 * the existing rows' format (EMP-#### / ENG-#### / SUP-####) and is allocated
 * per role in a fixed name order, so a re-run hands every person the exact same
 * number. `taken` seeds the allocator with employee_ids already in the table
 * (EMP-8042 / ENG-1029 / SUP-0012 from the seed rows, plus anything a previous
 * run of this script wrote) so numbers are never reused.
 *
 * Ordering is by UTF-16 code point (plain `<`), NOT `localeCompare`: collation
 * for Thai depends on the host's ICU build, and an ICU upgrade silently
 * reordering the list would renumber real people on the next run.
 */
export function allocateEmployeeIds(
  people: { normalizedName: string; role: Role }[],
  taken: Iterable<string>
): Map<string, string> {
  const used = new Set(taken);
  const counters: Record<string, number> = {};
  const result = new Map<string, string>();

  const sorted = [...people].sort((a, b) =>
    a.normalizedName < b.normalizedName ? -1 : a.normalizedName > b.normalizedName ? 1 : 0
  );

  for (const person of sorted) {
    const prefix = ROLE_PREFIX[person.role];
    let n = counters[prefix] ?? 0;
    let candidate: string;
    do {
      n += 1;
      candidate = `${prefix}-${String(n).padStart(4, "0")}`;
    } while (used.has(candidate));
    counters[prefix] = n;
    used.add(candidate);
    result.set(person.normalizedName, candidate);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Modal value
// ---------------------------------------------------------------------------

/**
 * Most frequent value in a list, with deterministic tie-breaking (lowest value
 * by code point wins) so a re-run cannot flip between two equally common
 * departments.
 */
export function modal<T extends string | number>(values: T[]): T | null {
  if (values.length === 0) return null;
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = -1;
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && best !== null && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/**
 * Asia/Bangkok is UTC+7 with no DST and no historical offset change in any year
 * this data covers, so a fixed offset is exact — no ICU/tz database dependency,
 * and therefore no way for a host's tz data to silently move a date.
 */
export const BANGKOK_UTC_OFFSET_MIN = 7 * 60;

/**
 * "YYYY-MM-DD" — the **Asia/Bangkok calendar day** of a date or timestamp.
 *
 * The previous version sliced the first 10 characters raw. `finish_datetime` is
 * `timestamptz` and PostgREST renders it in UTC, e.g. "2023-08-23T19:40:00+00:00",
 * whose real Bangkok day is 2023-08-24. Slicing gave the UTC day, which was
 * wrong for 1,755 of the 8,589 work orders (20.4%) — every repair finished
 * between 17:00 and 23:59 Bangkok time landed on the previous day. That pushed
 * 132 machines' `last_maintenance` one day early and moved work orders across
 * the 365-day health cutoff.
 *
 * Values with no time-of-day ("2026-04-01", a `date` column such as
 * pm_plans.actual_date) and values with a time but no offset are already local
 * days and are returned unchanged — converting them would re-introduce the same
 * class of bug in the opposite direction.
 */
export function toDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = String(value).trim();
  const match =
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?\s*(Z|z|[+-]\d{2}:?\d{2})?)?/.exec(text);
  if (!match) return null;

  const [, datePart, hour, , offset] = match;
  // No time component, or a naive timestamp: already a local calendar day.
  if (hour === undefined || offset === undefined) return datePart;

  const instant = Date.parse(text);
  if (Number.isNaN(instant)) return datePart;
  return new Date(instant + BANGKOK_UTC_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

/** Today's date in Asia/Bangkok, "YYYY-MM-DD". */
export function bangkokToday(now: Date = new Date()): string {
  return new Date(now.getTime() + BANGKOK_UTC_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
}

/** Whole days between two "YYYY-MM-DD" strings (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Health score
// ---------------------------------------------------------------------------

export interface HealthInputs {
  woCountLast365: number;
  mtlossMinLast365: number;
  overduePmCount: number;
  /** Every dated work order for this machine, not just the last 365 days. */
  lifetimeWoCount: number;
  lifetimeMtlossMin: number;
  /** null when the machine has no repair history at all. */
  daysSinceLastRepair: number | null;
}

/**
 * Every penalty except recency uses the same shape:
 *
 *   penalty(x) = weight × ln(1 + x) / ln(1 + ref)
 *
 * i.e. a machine sitting exactly at `ref` loses exactly `weight` points, and
 * beyond `ref` the penalty keeps growing — more slowly, but it NEVER stops.
 * That last property is the whole point. The previous formula used `min()`
 * caps, so once a machine passed 10 work orders or 600 minutes of downtime in a
 * year, every further breakdown was free; 17 machines were pinned against both
 * caps at once and literally could not score worse. Because ln(1+x) is strictly
 * increasing on x ≥ 0, this version is strictly monotone in every input, with
 * no cap to invert the ranking.
 *
 * `ref` values are "a plainly bad machine" reference points read off the real
 * fleet, not tuned to hit a target distribution.
 */
export const HEALTH_WEIGHTS = {
  /** Breakdowns per year. 12/yr = one a month = 26 points. */
  failure: { weight: 26, ref: 12 },
  /** Production time lost per year, in HOURS. 10 h/yr = 24 points. */
  downtime: { weight: 24, ref: 10 },
  /**
   * Overdue PM plan rows. Deliberately the smallest structural term: it is a
   * scheduling-backlog fact rather than a measurement of the machine, it is
   * counted per PM *plan row* (so it partly measures paperwork volume), and
   * `status` already flags any machine with an overdue PM as 'warning'
   * independently of health_score. It was worth up to 20 points before, which
   * made it the single biggest cause of a damaged machine outscoring a
   * healthier one.
   */
  overduePm: { weight: 6, ref: 3 },
  /**
   * Lifetime damage = (all-time breakdown count) + (all-time downtime hours).
   * Fixes the "idle machine scores 100" defect: the 365-day window let a
   * machine with 18 lifetime repairs whose last one was 702 days ago look
   * pristine. Weighted well below the recent terms — old damage matters, but
   * much less than this year's.
   */
  lifetime: { weight: 12, ref: 40 },
  /**
   * A breakdown that happened days ago is a live risk (re-failure, incomplete
   * repair). Decays smoothly instead of stepping at 30/90 days, and is kept
   * small because it is the only term that can move against total damage.
   * A machine with NO repair history gets 0 here — but it also cannot be
   * scored at all, and a machine that has simply been quiet for years is now
   * caught by the lifetime term instead of being rewarded with a 100.
   */
  recency: { weight: 5, tauDays: 60 },
} as const;

/** weight × ln(1+x) / ln(1+ref) — unbounded, diminishing, strictly increasing. */
function saturating(value: number, weight: number, ref: number): number {
  return (weight * Math.log1p(Math.max(0, value))) / Math.log1p(ref);
}

export interface HealthPenalties {
  failure: number;
  downtime: number;
  overduePm: number;
  lifetime: number;
  recency: number;
  /** failure + downtime — the part that must be monotone in recent damage. */
  recentDamage: number;
  total: number;
  raw: number;
}

/** The individual penalty terms, exposed so callers can audit/monotonicity-test. */
export function healthPenalties(inputs: HealthInputs): HealthPenalties {
  const W = HEALTH_WEIGHTS;
  const failure = saturating(inputs.woCountLast365, W.failure.weight, W.failure.ref);
  const downtime = saturating(inputs.mtlossMinLast365 / 60, W.downtime.weight, W.downtime.ref);
  const overduePm = saturating(inputs.overduePmCount, W.overduePm.weight, W.overduePm.ref);
  const lifetime = saturating(
    inputs.lifetimeWoCount + Math.max(0, inputs.lifetimeMtlossMin) / 60,
    W.lifetime.weight,
    W.lifetime.ref
  );
  const recency =
    inputs.daysSinceLastRepair === null
      ? 0
      : W.recency.weight * Math.exp(-Math.max(0, inputs.daysSinceLastRepair) / W.recency.tauDays);

  const recentDamage = failure + downtime;
  const total = recentDamage + overduePm + lifetime + recency;
  return { failure, downtime, overduePm, lifetime, recency, recentDamage, total, raw: 100 - total };
}

/**
 * health = 100
 *        − 26·ln(1 + wo_count_365d)      / ln(13)
 *        − 24·ln(1 + mtloss_hours_365d)  / ln(11)
 *        −  6·ln(1 + overdue_pm_count)   / ln(4)
 *        − 12·ln(1 + lifetime_wo + lifetime_hours) / ln(41)
 *        −  5·exp(−days_since_last_repair / 60)
 *        clamped to 0…100
 *
 * Clamped only, never floored at 30. The old floor collapsed 21 genuinely
 * different machines (raw 15…29) onto an identical 30, destroying the ordering
 * exactly among the worst machines in the plant — the ones a technician sorts
 * for first.
 *
 * repair_duration_min is still not used anywhere (negative values, min −12,900),
 * and neither is the breakdown-vs-planned ratio (99.4% of work orders are
 * Breakdown Maintenance, so it carries no signal).
 */
export function healthScore(inputs: HealthInputs): number {
  return Math.max(0, Math.min(100, Math.round(healthPenalties(inputs).raw)));
}

export function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.ceil((p / 100) * sortedAsc.length) - 1));
  return sortedAsc[idx];
}

export function describe(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: sorted.length ? sorted[0] : null,
    p10: percentile(sorted, 10),
    p25: percentile(sorted, 25),
    median: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    max: sorted.length ? sorted[sorted.length - 1] : null,
    mean: sorted.length ? Number((sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2)) : null,
  };
}

/**
 * Counts per 0-9, 10-19, … 90-99, 100.
 *
 * Keys are zero-padded ("000-009") so they are not integer-like: a plain "100"
 * key would be reordered to the front of the object by JS property ordering and
 * print the histogram backwards.
 */
export function histogramByDecade(values: number[]): Record<string, number> {
  const buckets = new Array(11).fill(0) as number[];
  for (const v of values) buckets[Math.min(10, Math.max(0, Math.floor(v / 10)))] += 1;
  const pad = (n: number) => String(n).padStart(3, "0");
  const out: Record<string, number> = {};
  buckets.forEach((count, i) => {
    out[i === 10 ? "100-100" : `${pad(i * 10)}-${pad(i * 10 + 9)}`] = count;
  });
  return out;
}

// ---------------------------------------------------------------------------
// Monotonicity audit
// ---------------------------------------------------------------------------

export interface MonotonicityCandidate {
  code: string | null;
  score: number;
  inputs: HealthInputs;
  penalties: HealthPenalties;
}

/**
 * Brute-force O(n²) scan over every ordered pair: if A has at least as much
 * downtime AND at least as many failures as B in the last 365 days (and
 * strictly more of one), A must not score better than B.
 *
 * `recentDamageViolations` is the count that MUST be 0 — it is the guarantee
 * the formula makes and the exact thing the old capped formula broke.
 * `violations` also lets the other three signals disagree, so a machine with
 * more downtime can still outscore one with an overdue PM backlog or a longer
 * lifetime history; those are reported with attribution rather than hidden.
 */
export function auditMonotonicity(list: MonotonicityCandidate[]) {
  let violations = 0;
  let severe = 0;
  let recentDamageViolations = 0;
  let maxMagnitude = 0;
  const attribution = { recentDamage: 0, overduePm: 0, lifetime: 0, recency: 0, rounding: 0 };
  const worst: { a: string | null; b: string | null; delta: number; cause: string }[] = [];

  for (let i = 0; i < list.length; i += 1) {
    for (let j = 0; j < list.length; j += 1) {
      if (i === j) continue;
      const a = list[i];
      const b = list[j];
      const heavier =
        a.inputs.mtlossMinLast365 >= b.inputs.mtlossMinLast365 &&
        a.inputs.woCountLast365 >= b.inputs.woCountLast365 &&
        (a.inputs.mtlossMinLast365 > b.inputs.mtlossMinLast365 ||
          a.inputs.woCountLast365 > b.inputs.woCountLast365);
      if (!heavier) continue;

      if (a.penalties.recentDamage < b.penalties.recentDamage) recentDamageViolations += 1;
      if (a.score <= b.score) continue;

      violations += 1;
      const delta = a.score - b.score;
      if (delta >= 8) severe += 1;
      let cause: keyof typeof attribution;
      if (a.penalties.recentDamage < b.penalties.recentDamage) cause = "recentDamage";
      else if (b.penalties.overduePm > a.penalties.overduePm) cause = "overduePm";
      else if (b.penalties.lifetime > a.penalties.lifetime) cause = "lifetime";
      else if (b.penalties.recency > a.penalties.recency) cause = "recency";
      else cause = "rounding";
      attribution[cause] += 1;

      if (delta > maxMagnitude) {
        maxMagnitude = delta;
        worst.unshift({ a: a.code, b: b.code, delta, cause });
        worst.length = Math.min(worst.length, 5);
      }
    }
  }

  return { pairsChecked: list.length * (list.length - 1), violations, severe, recentDamageViolations, maxMagnitude, attribution, worst };
}
