/**
 * backup-db.ts
 *
 * Safety dump of the live Supabase database, taken before wiping/replacing
 * data with the Excel import. Read-only — SELECT only, never writes/updates/deletes.
 *
 * Usage (from backend/):
 *   npx tsx scripts/backup-db.ts
 *
 * For every known table, this script:
 *   1. Determines which tables actually exist by querying the PostgREST
 *      OpenAPI root (GET /rest/v1/) ONCE per run and reading the schema's
 *      table list from it. This is the only reliable signal for table
 *      existence — see "Why not infer existence from count/select errors"
 *      below for why per-table probing is NOT used for this.
 *   2. For tables that exist: pages through all rows in batches of 1000 via
 *      .range() (PostgREST caps a plain select("*") at ~1000 rows, so a
 *      naive select would silently truncate large tables like
 *      telemetry_readings), writes them to backend/backups/<timestamp>/<table>.json,
 *      then re-counts the table and asserts the number of rows written
 *      matches exactly. Any mismatch fails the whole run loudly.
 *   3. For tables that don't exist: marked "skipped" with a note, backed by
 *      the OpenAPI table list — never inferred by treating a missing/null
 *      count as zero rows.
 *   4. Writes a manifest.json with per-table status/counts + timestamp.
 *   5. Prints a summary table.
 *
 * Why not infer existence from count/select errors:
 * A `.select("*", { count: "exact", head: true })` call issues an HTTP HEAD
 * request. Per HTTP semantics, HEAD responses have NO body — but PostgREST's
 * "table not found" signal (error code PGRST205) is only ever delivered in
 * the response body. So for a HEAD request against a missing table,
 * supabase-js observes `{ count: null, error: null, status: 204 }`: no error
 * at all. Treating `count ?? 0` in that situation silently turns "table does
 * not exist" into "table exists with 0 rows" — which is exactly the bug this
 * script previously had for `pm_plans` / `part_withdrawals`. A plain GET
 * select (used by fetchAllRows) DOES get PGRST205 in its body, but by then
 * it's one table too late and one signal too fragile to build correctness
 * on — hence the single upfront OpenAPI existence check instead.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supabase } from "../src/lib/supabase.js";
import { config } from "../src/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_ROOT = path.join(__dirname, "..", "backups");

const PAGE_SIZE = 1000;

const REQUIRED_TABLES = [
  "profiles",
  "machines",
  "work_orders",
  "work_order_parts",
  "spare_parts",
  "manuals",
  "telemetry_readings",
] as const;

const OPTIONAL_TABLES = ["pm_plans", "part_withdrawals"] as const;

const MISSING_TABLE_ERROR_CODE = "PGRST205";

type TableStatus = "ok" | "skipped" | "failed";

interface TableResult {
  table: string;
  status: TableStatus;
  // null = table does not exist / unknown. A real number (including 0) means
  // the table exists and this is its row count. Never conflate the two.
  dbCount: number | null;
  dumpedCount: number | null;
  note?: string;
}

function timestampSlug(date: Date): string {
  // Filesystem-safe ISO-ish timestamp, e.g. 2026-08-14T10-30-00Z
  return date.toISOString().replace(/:/g, "-").replace(/\.\d+Z$/, "Z");
}

/**
 * Queries the PostgREST OpenAPI root once to get the authoritative set of
 * tables that actually exist in the exposed schema. This is the single
 * source of truth for table existence used by the rest of the script.
 */
async function getExistingTables(): Promise<Set<string>> {
  const url = `${config.supabaseUrl.replace(/\/+$/, "")}/rest/v1/`;
  const res = await fetch(url, {
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch PostgREST OpenAPI root at ${url} to determine existing tables: HTTP ${res.status} ${res.statusText}`
    );
  }

  const spec: unknown = await res.json();
  const names = new Set<string>();

  const addKeys = (obj: unknown) => {
    if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj as Record<string, unknown>)) {
        names.add(key);
      }
    }
  };

  if (spec && typeof spec === "object") {
    const s = spec as Record<string, unknown>;
    // OpenAPI 2 (Swagger) shape, used by PostgREST.
    addKeys(s.definitions);
    // OpenAPI 3 shape, in case of a newer PostgREST version.
    const components = s.components as Record<string, unknown> | undefined;
    if (components) {
      addKeys(components.schemas);
    }
    // Fallback: derive names from top-level resource paths ("/table_name").
    const paths = s.paths as Record<string, unknown> | undefined;
    if (paths) {
      for (const p of Object.keys(paths)) {
        const trimmed = p.replace(/^\//, "");
        if (trimmed && !trimmed.startsWith("rpc/")) {
          names.add(trimmed);
        }
      }
    }
  }

  if (names.size === 0) {
    throw new Error(
      `PostgREST OpenAPI root at ${url} returned no recognizable table definitions — cannot safely determine which tables exist.`
    );
  }

  return names;
}

/** Exact row count for a table that is already known to exist. */
async function getExactCount(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to count "${table}": ${error.message} (code ${error.code})`);
  }
  if (count === null) {
    throw new Error(`Count query for "${table}" returned null unexpectedly (table was expected to exist).`);
  }
  return count;
}

/** Pages through the full table in batches of PAGE_SIZE using .range(). */
async function fetchAllRows(table: string): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  for (;;) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, to);

    if (error) {
      if (error.code === MISSING_TABLE_ERROR_CODE) {
        // We only ever call fetchAllRows for tables already confirmed to
        // exist via the OpenAPI check, so hitting this is a real anomaly
        // (e.g. dropped mid-run) — surface it loudly, never silently [].
        throw new Error(
          `Table "${table}" was confirmed to exist via the OpenAPI check but disappeared during fetch (PGRST205). Aborting rather than reporting a false empty/complete backup.`
        );
      }
      throw new Error(`Failed to fetch "${table}" rows [${from}-${to}]: ${error.message} (code ${error.code})`);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < PAGE_SIZE) {
      // Last page was partial — we've reached the end of the table.
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

async function backupTable(table: string, exists: boolean, outDir: string): Promise<TableResult> {
  if (!exists) {
    const note = `Table "${table}" is not present in the PostgREST schema (confirmed via GET /rest/v1/ OpenAPI root) — skipped.`;
    console.log(`  [skip] ${note}`);
    return { table, status: "skipped", dbCount: null, dumpedCount: null, note };
  }

  let rows: Record<string, unknown>[];
  try {
    rows = await fetchAllRows(table);
  } catch (err) {
    return {
      table,
      status: "failed",
      dbCount: null,
      dumpedCount: null,
      note: err instanceof Error ? err.message : String(err),
    };
  }

  const filePath = path.join(outDir, `${table}.json`);
  await writeFile(filePath, JSON.stringify(rows, null, 2), "utf8");

  // Re-count after writing to verify nothing changed underneath us / nothing was lost.
  let verifyCount: number;
  try {
    verifyCount = await getExactCount(table);
  } catch (err) {
    return {
      table,
      status: "failed",
      dbCount: null,
      dumpedCount: rows.length,
      note: `Post-write verification count failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (verifyCount !== rows.length) {
    return {
      table,
      status: "failed",
      dbCount: verifyCount,
      dumpedCount: rows.length,
      note: `MISMATCH: dumped ${rows.length} rows but DB re-count is ${verifyCount}.`,
    };
  }

  return { table, status: "ok", dbCount: verifyCount, dumpedCount: rows.length };
}

async function main() {
  const startedAt = new Date();
  const stamp = timestampSlug(startedAt);
  const outDir = path.join(BACKUP_ROOT, stamp);

  await mkdir(outDir, { recursive: true });

  console.log(`Starting DB backup -> ${outDir}\n`);

  console.log("Determining existing tables via PostgREST OpenAPI root (GET /rest/v1/)...");
  const existingTables = await getExistingTables();
  console.log(`  Found ${existingTables.size} table(s) in schema: ${[...existingTables].sort().join(", ")}\n`);

  const results: TableResult[] = [];

  console.log("Required tables:");
  for (const table of REQUIRED_TABLES) {
    const result = await backupTable(table, existingTables.has(table), outDir);
    if (result.status === "ok") {
      console.log(`  [ok]   ${table}: ${result.dumpedCount} rows`);
    } else if (result.status === "failed") {
      console.log(`  [FAIL] ${table}: ${result.note}`);
    }
    results.push(result);
  }

  console.log("\nOptional tables:");
  for (const table of OPTIONAL_TABLES) {
    const result = await backupTable(table, existingTables.has(table), outDir);
    if (result.status === "ok") {
      console.log(`  [ok]   ${table}: ${result.dumpedCount} rows`);
    } else if (result.status === "failed") {
      console.log(`  [FAIL] ${table}: ${result.note}`);
    }
    results.push(result);
  }

  const manifest = {
    timestamp: stamp,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    existingTablesPerOpenApi: [...existingTables].sort(),
    tables: results.map((r) => ({
      table: r.table,
      status: r.status,
      rowCount: r.dumpedCount,
      note: r.note ?? null,
    })),
  };

  await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  // Print summary table.
  console.log("\n=== Backup Summary ===");
  console.log(`Output directory: ${outDir}`);
  const colTable = "Table".padEnd(22);
  const colStatus = "Status".padEnd(8);
  const colCount = "Rows".padEnd(8);
  console.log(`${colTable}${colStatus}${colCount}Note`);
  for (const r of results) {
    const rowStr = (r.dumpedCount ?? "-").toString().padEnd(8);
    console.log(
      `${r.table.padEnd(22)}${r.status.padEnd(8)}${rowStr}${r.note ?? ""}`
    );
  }

  const failed = results.filter((r) => r.status === "failed");
  if (failed.length > 0) {
    console.error(
      `\nBackup FAILED for ${failed.length} table(s): ${failed.map((r) => r.table).join(", ")}`
    );
    process.exit(1);
  }

  console.log("\nBackup completed successfully. All row counts verified against the database.");
}

main().catch((err) => {
  console.error("Backup script crashed:", err);
  process.exit(1);
});
