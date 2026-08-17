// Shared helpers for the paginated list + stats endpoints added on top of the
// imported Excel data (see docs/data-import-spec.md Section 5/B/C). Kept here so the
// 5 route files (machines, spare-parts, work-orders, pm-plans, part-withdrawals)
// don't each reimplement paging/aggregation.

import { supabase } from "./supabase.js";
import { ApiError } from "../middleware/errorHandler.js";

// Supabase/PostgREST silently caps unpaginated selects at ~1000 rows, so any
// full-table aggregation done in Node must page through with .range().
const PAGE_SIZE = 1000;

export interface PagingDefaults {
  defaultLimit: number;
  maxLimit: number;
}

export function parsePaging(query: Record<string, unknown>, defaults: PagingDefaults): { limit: number; offset: number } {
  let limit = defaults.defaultLimit;
  if (query.limit !== undefined) {
    const n = Number(query.limit);
    if (Number.isFinite(n) && n > 0) {
      limit = Math.min(Math.floor(n), defaults.maxLimit);
    }
  }

  let offset = 0;
  if (query.offset !== undefined) {
    const n = Number(query.offset);
    if (Number.isFinite(n) && n >= 0) {
      offset = Math.floor(n);
    }
  }

  return { limit, offset };
}

// Pages through an entire table selecting only the given columns (never "*"), for
// use by /stats endpoints that need to aggregate across all rows in Node.
//
// Always orders by "id": Postgres does not guarantee row order across separate
// queries without an ORDER BY, and these tables get concurrent UPDATEs in normal
// operation (stock adjustments, work-order status changes, ...). Without a stable
// sort, a row that moves in the heap between two .range() calls in this loop can be
// counted twice or skipped entirely, silently corrupting the /stats aggregates.
export async function fetchAllRows<T>(table: string, columns: string): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new ApiError(500, error.message);

    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

// Increments a { label: count } bucket map, folding null/blank values into "Unknown"
// so the `by*` stats objects never contain an empty-string key.
export function incrementCount(map: Record<string, number>, key: string | null | undefined, fallback = "Unknown"): void {
  const k = key && key.trim() !== "" ? key : fallback;
  map[k] = (map[k] ?? 0) + 1;
}

export function toNumberOrZero(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Escapes a raw user-typed search string for safe use inside a PostgREST ilike
// pattern that will itself be embedded in an .or()/.and() clause. Order matters:
// backslash must be escaped first, so the escapes added after it (for the ilike
// wildcard chars, then the wrapping double quote) aren't themselves re-escaped.
function escapeIlikeValue(raw: string): string {
  return raw
    .replace(/\\/g, "\\\\")
    .replace(/[%_]/g, (m) => `\\${m}`)
    .replace(/"/g, '\\"');
}

// Builds a PostgREST `.or()` clause doing a case-insensitive substring match for
// `raw` across every column in `columns`.
//
// Wrapping each pattern in double quotes is required, not cosmetic: PostgREST's
// or()/and() mini-language uses a bare `,` to separate conditions and `.`/`(`/`)`
// as its own syntax. Verified against the live imported dataset (see
// docs/data-import-spec.md) that a naive backslash-escape of just `,` is NOT
// enough — e.g. `name.ilike.%abc\,def%` still 500s with PostgREST error
// "failed to parse logic tree". Quoting the value (`name.ilike."%abc,def%"`)
// makes PostgREST treat everything inside the quotes as a literal, which does
// work for `,`, `.`, `(` and `)`.
export function buildIlikeOrClause(columns: string[], raw: string): string {
  const escaped = escapeIlikeValue(raw);
  return columns.map((col) => `${col}.ilike."%${escaped}%"`).join(",");
}
