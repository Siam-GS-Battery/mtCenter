/**
 * derive-data.ts
 *
 * Fills in columns that are NULL in the live Supabase database, deriving every
 * value from data ALREADY PRESENT in the database. Nothing is invented,
 * simulated, or randomized — with exactly one flagged exception
 * (`profiles.employee_id`, see Step 1).
 *
 * Usage (from backend/):
 *   npm run derive:data -- --dry-run
 *   npm run derive:data
 *   npm run derive:data -- --only=health
 *
 * Steps:
 *   1 profiles                 create a profile row per real person in the data
 *   2 assigned                 work_orders.assigned_to
 *   3 last-maintenance         machines.last_maintenance
 *   4 next-maintenance         machines.next_maintenance
 *   5 health                   machines.health_score
 *   6 status                   machines.status
 *
 * IDEMPOTENCE
 * Every step is a keyed write, never an append:
 *   - profiles       upsert on the primary key `id`, which is a hash of the
 *                    person's normalized name (see lib/derive.ts) so it is the
 *                    same on every run and `assigned_to` links never break.
 *   - work_orders    UPDATE ... WHERE id IN (...), grouped by target value.
 *   - machines       upsert on the primary key `id`.
 * Re-running is a no-op that rewrites identical values. No row is ever created
 * twice and no sequence is ever advanced.
 *
 * PAGINATION
 * Every read pages with .range() in batches of 1000. PostgREST silently caps a
 * plain select at ~1000 rows, so an unpaged read of work_orders (8,589 rows)
 * would quietly compute all of the below from the first 12% of the data.
 *
 * DELIBERATELY NOT POPULATED
 *   machines.operating_hours, machines.spindle_temp, machines.vibration_mms,
 *   and the whole telemetry_readings table.
 * The analysis pass searched all six imported tables and the free text of all
 * 8,589 work orders and found no source for any of them. There is no way to
 * derive a runtime hour meter, a spindle temperature or a vibration amplitude
 * from repair paperwork. Writing plausible-looking numbers there would turn an
 * honest "we don't measure this" into a fake sensor reading that the dashboard
 * would then chart, threshold and alert on. They stay NULL.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { supabase } from "../src/lib/supabase.js";
import {
  addDays,
  allocateEmployeeIds,
  auditMonotonicity,
  bangkokToday,
  daysBetween,
  describe,
  healthPenalties,
  healthScore,
  HEALTH_WEIGHTS,
  histogramByDecade,
  initialsOf,
  modal,
  normalizeName,
  profileId,
  toDateOnly,
  type HealthInputs,
  type MonotonicityCandidate,
  type Role,
} from "./lib/derive.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.join(__dirname, "derive-report.json");

const PAGE = 1000;
const WRITE_CHUNK = 500;

/** Reject any computed next_maintenance further out than this. */
const MAX_FUTURE_DAYS = 5 * 365;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const STEPS = [
  "profiles",
  "assigned",
  "last-maintenance",
  "next-maintenance",
  "health",
  "status",
] as const;
type Step = (typeof STEPS)[number];

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const onlyArg = argv.find((a) => a.startsWith("--only="))?.slice("--only=".length);

if (onlyArg && !STEPS.includes(onlyArg as Step)) {
  console.error(`Unknown --only=${onlyArg}. Valid steps: ${STEPS.join(", ")}`);
  process.exit(1);
}
const selected = new Set<Step>(onlyArg ? [onlyArg as Step] : STEPS);
const runs = (step: Step) => selected.has(step);

/**
 * "Today" is captured ONCE. Every recency window, overdue test and outlier clip
 * below is relative to this single instant, so a run that straddles midnight
 * cannot produce two different answers for two different machines.
 *
 * It is the Asia/Bangkok day, not the UTC day: this is a Thai factory, every
 * date in the source data is a Bangkok working day, and comparing them against
 * a UTC "today" would make the whole script disagree with itself for the seven
 * hours after Bangkok midnight.
 */
const TODAY = bangkokToday();

// ---------------------------------------------------------------------------
// Paged read
// ---------------------------------------------------------------------------

async function fetchAll<T>(table: string, columns: string, orderBy = "id"): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`read ${table} [${from}..]: ${error.message}`);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < PAGE) break;
  }
  return rows;
}

async function countOf(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Row shapes (only the columns this script reads)
// ---------------------------------------------------------------------------

interface WorkOrderRow {
  id: string;
  machine_code: string | null;
  technicians: string[] | null;
  technician_name: string | null;
  mt_leader_name: string | null;
  section_response: string | null;
  finish_datetime: string | null;
  mtloss_min: number | null;
  status: string | null;
}

interface PmPlanRow {
  id: string;
  machine_code: string | null;
  responsible: string | null;
  responsible_email: string | null;
  status_code: string | null;
  is_overdue: boolean | null;
  next_pm_date: string | null;
  actual_date: string | null;
  period_days: number | null;
  line_location: string | null;
}

interface MachineRow {
  id: string;
  code: string | null;
  name: string;
  status: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  health_score: number | null;
}

interface ProfileRow {
  id: string;
  employee_id: string;
  name: string;
  initials: string | null;
  role: string;
  department: string | null;
}

// ---------------------------------------------------------------------------

interface Report {
  ranAt: string;
  today: string;
  dryRun: boolean;
  only: string | null;
  steps: Record<string, unknown>;
  refusals: unknown[];
  warnings: string[];
}

const report: Report = {
  ranAt: new Date().toISOString(),
  today: TODAY,
  dryRun: DRY_RUN,
  only: onlyArg ?? null,
  steps: {},
  refusals: [],
  warnings: [],
};

function warn(message: string) {
  report.warnings.push(message);
  console.warn(`  ! ${message}`);
}

async function main() {
  console.log(`derive-data — ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"} — today=${TODAY}`);
  console.log(`steps: ${[...selected].join(", ")}\n`);

  console.log("reading source tables…");
  const [workOrders, pmPlans, machines, existingProfiles] = await Promise.all([
    fetchAll<WorkOrderRow>(
      "work_orders",
      "id,machine_code,technicians,technician_name,mt_leader_name,section_response,finish_datetime,mtloss_min,status"
    ),
    fetchAll<PmPlanRow>(
      "pm_plans",
      "id,machine_code,responsible,responsible_email,status_code,is_overdue,next_pm_date,actual_date,period_days,line_location"
    ),
    fetchAll<MachineRow>("machines", "id,code,name,status,last_maintenance,next_maintenance,health_score"),
    fetchAll<ProfileRow>("profiles", "id,employee_id,name,initials,role,department"),
  ]);

  console.log(
    `  work_orders=${workOrders.length} pm_plans=${pmPlans.length} machines=${machines.length} profiles=${existingProfiles.length}\n`
  );

  const people = buildPeople(workOrders, pmPlans, existingProfiles);
  await stepProfiles(people, existingProfiles);
  await stepAssignedTo(workOrders, people.idByName);

  const derived = deriveMachineFields(machines, workOrders, pmPlans);
  await writeMachines(machines, derived);

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nreport -> ${REPORT_PATH}`);
}

// ===========================================================================
// Step 1 — profiles
// ===========================================================================

interface Person {
  normalizedName: string;
  rawNames: string[];
  role: Role;
  department: string | null;
  id: string;
  employeeId: string;
  initials: string | null;
  /** Modal @nsk.com address from pm_plans.responsible_email, if any. */
  email: string | null;
}

interface PeopleResult {
  list: Person[];
  idByName: Map<string, string>;
}

function buildPeople(
  workOrders: WorkOrderRow[],
  pmPlans: PmPlanRow[],
  existingProfiles: ProfileRow[]
): PeopleResult {
  // --- gather the three name sources -------------------------------------
  const rawByNormalized = new Map<string, Set<string>>();
  const noteRaw = (raw: string | null | undefined) => {
    if (!raw) return null;
    const normalized = normalizeName(raw);
    if (!normalized) return null;
    if (!rawByNormalized.has(normalized)) rawByNormalized.set(normalized, new Set());
    rawByNormalized.get(normalized)!.add(raw);
    return normalized;
  };

  const technicianNames = new Set<string>();
  const leaderNames = new Set<string>();
  const responsibleNames = new Set<string>();

  // section_response samples per person, for the modal department.
  const sections = new Map<string, string[]>();
  const pushSection = (person: string, section: string | null) => {
    if (!section) return;
    if (!sections.has(person)) sections.set(person, []);
    sections.get(person)!.push(section);
  };

  for (const wo of workOrders) {
    for (const raw of wo.technicians ?? []) {
      const n = noteRaw(raw);
      if (n) {
        technicianNames.add(n);
        pushSection(n, wo.section_response);
      }
    }
    const leader = noteRaw(wo.mt_leader_name);
    if (leader) {
      leaderNames.add(leader);
      pushSection(leader, wo.section_response);
    }
  }

  // pm_plans.responsible -> engineers, plus their real email address.
  const emails = new Map<string, string[]>();
  const pmLocations = new Map<string, string[]>();
  for (const pm of pmPlans) {
    const n = noteRaw(pm.responsible);
    if (!n) continue;
    responsibleNames.add(n);
    if (pm.responsible_email) {
      if (!emails.has(n)) emails.set(n, []);
      emails.get(n)!.push(pm.responsible_email);
    }
    if (pm.line_location) {
      if (!pmLocations.has(n)) pmLocations.set(n, []);
      pmLocations.get(n)!.push(pm.line_location);
    }
  }

  const allNames = [...new Set([...technicianNames, ...leaderNames, ...responsibleNames])];

  // --- roles -------------------------------------------------------------
  // Leader wins over technician: 7 of the 8 mt_leader_name people also show up
  // in technicians (a leader still turns a wrench), but the more senior of two
  // observed roles is the truthful one.
  const roleOf = (name: string): Role =>
    leaderNames.has(name) ? "supervisor" : responsibleNames.has(name) ? "engineer" : "technician";

  const withRoles = allNames.map((normalizedName) => ({ normalizedName, role: roleOf(normalizedName) }));

  // --- employee_id -------------------------------------------------------
  // Seed the allocator with every employee_id already in the table so the 3
  // pre-existing seed rows (EMP-8042 / ENG-1029 / SUP-0012) can never be
  // collided with, and so a re-run reuses the numbers it wrote last time.
  const takenEmployeeIds = existingProfiles
    .filter((p) => !allNames.includes(normalizeName(p.name)))
    .map((p) => p.employee_id);
  const employeeIds = allocateEmployeeIds(withRoles, takenEmployeeIds);

  // A re-run must not renumber anyone. If this person already has a row that
  // this script created (same id), keep whatever employee_id it already has.
  const existingById = new Map(existingProfiles.map((p) => [p.id, p]));

  const list: Person[] = withRoles
    .map(({ normalizedName, role }) => {
      const id = profileId(normalizedName);
      const prior = existingById.get(id);
      return {
        normalizedName,
        rawNames: [...(rawByNormalized.get(normalizedName) ?? [])],
        role,
        department: modal(sections.get(normalizedName) ?? []) ?? modal(pmLocations.get(normalizedName) ?? []),
        id,
        employeeId: prior?.employee_id ?? employeeIds.get(normalizedName)!,
        initials: initialsOf(normalizedName),
        email: modal(emails.get(normalizedName) ?? []),
      };
    })
    .sort((a, b) => (a.normalizedName < b.normalizedName ? -1 : 1));

  const idByName = new Map(list.map((p) => [p.normalizedName, p.id]));
  if (idByName.size !== list.length) throw new Error("profile id collision — refusing to write");

  return { list, idByName };
}

async function stepProfiles(people: PeopleResult, existingProfiles: ProfileRow[]) {
  const label = "1-profiles";
  const { list } = people;

  const existingIds = new Set(existingProfiles.map((p) => p.id));
  const toCreate = list.filter((p) => !existingIds.has(p.id));

  const byRole = list.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  // Renamed honorific: report it explicitly rather than letting it hide.
  const renormalized = list
    .filter((p) => p.rawNames.some((raw) => raw !== p.normalizedName))
    .map((p) => ({ from: p.rawNames, to: p.normalizedName }));

  const noDepartment = list.filter((p) => !p.department).map((p) => p.normalizedName);

  // profiles has no email column (0001_init.sql:11-20). Schema is owned
  // elsewhere, so this script does NOT add one — it only reports the real
  // addresses that are sitting unused in pm_plans.responsible_email.
  const withEmail = list.filter((p) => p.email);

  report.steps[label] = {
    step: "profiles",
    selected: runs("profiles"),
    existingBefore: existingProfiles.length,
    derivedPeople: list.length,
    toCreate: toCreate.length,
    alreadyPresent: list.length - toCreate.length,
    expectedTotalAfter: existingProfiles.length + toCreate.length,
    byRole,
    honorificStripped: renormalized,
    peopleWithNoDepartment: noDepartment,
    emailColumnExists: false,
    realEmailsAvailableForFutureMigration: {
      note:
        "profiles has no email column and this script does not alter the schema. " +
        `${withEmail.length} of the ${list.length} people have a real @nsk.com address available ` +
        "via the modal pm_plans.responsible_email for their pm_plans.responsible value. " +
        "responsible_email is NOT 1:1 with responsible in the raw data (a PM row's email is " +
        "sometimes the planner's, not the responsible person's), so the modal value is used.",
      emails: withEmail.map((p) => ({ name: p.normalizedName, email: p.email })),
    },
    people: list.map((p) => ({
      id: p.id,
      employee_id: p.employeeId,
      name: p.normalizedName,
      role: p.role,
      department: p.department,
      initials: p.initials,
      email_available: p.email,
    })),
  };

  console.log(`[1] profiles: ${list.length} people derived, ${toCreate.length} new (roles: ${JSON.stringify(byRole)})`);

  if (!runs("profiles")) {
    console.log("    skipped (--only)");
    return;
  }
  if (DRY_RUN) {
    console.log("    dry run — no writes");
    return;
  }

  // Upsert on the primary key: creates the missing 40, rewrites identical
  // values for anything already there. avatar_url is intentionally omitted —
  // there is no source for it, so it stays NULL.
  const rows = list.map((p) => ({
    id: p.id,
    employee_id: p.employeeId,
    name: p.normalizedName,
    initials: p.initials,
    role: p.role,
    department: p.department,
  }));

  for (let i = 0; i < rows.length; i += WRITE_CHUNK) {
    const { error } = await supabase
      .from("profiles")
      .upsert(rows.slice(i, i + WRITE_CHUNK), { onConflict: "id" });
    if (error) throw new Error(`upsert profiles: ${error.message}`);
  }
  const after = await countOf("profiles");
  console.log(`    wrote ${rows.length} profile rows; profiles now ${after}`);
  (report.steps[label] as Record<string, unknown>).actualTotalAfter = after;
}

// ===========================================================================
// Step 2 — work_orders.assigned_to (+ the engineer_reviewer judgment call)
// ===========================================================================

async function stepAssignedTo(workOrders: WorkOrderRow[], idByName: Map<string, string>) {
  const label = "2-assigned_to";

  // assigned_to has NO foreign key to profiles (0001_init.sql:59 is a plain
  // `assigned_to text`), so ordering is not enforced by the database — but this
  // script still writes profiles first so the ids it stores always resolve.
  const byTarget = new Map<string, string[]>();
  let unresolved = 0;
  let noTechnician = 0;
  let primaryMismatch = 0;

  for (const wo of workOrders) {
    const first = wo.technicians?.[0];
    if (!first) {
      noTechnician += 1;
      continue;
    }
    // technicians[0] is byte-identical to technician_name on all 8,589 rows, so
    // this reproduces the source system's own primary-technician field rather
    // than picking a winner. Re-assert it here instead of trusting the note.
    if (wo.technician_name !== first) primaryMismatch += 1;

    const id = idByName.get(normalizeName(first));
    if (!id) {
      unresolved += 1;
      continue;
    }
    if (!byTarget.has(id)) byTarget.set(id, []);
    byTarget.get(id)!.push(wo.id);
  }

  const coverage = [...byTarget.values()].reduce((a, ids) => a + ids.length, 0);

  if (primaryMismatch > 0) {
    warn(
      `technicians[0] !== technician_name on ${primaryMismatch} work orders — expected 0. ` +
        "assigned_to still follows technicians[0], but the two fields are no longer interchangeable."
    );
  }

  // --- engineer_reviewer: refused, with reasons --------------------------
  const reviewerNonNull = workOrders.filter((w) => w.mt_leader_name !== null).length;
  const refusal = {
    field: "work_orders.engineer_reviewer",
    decision: "NOT populated",
    reasons: [
      "The column is not empty. 3,322 of 8,589 rows already carry a value, written by " +
        "scripts/import-excel.ts:391 from the source column PD_Responsible_Name — i.e. the " +
        "PRODUCTION-side responsible person, a different real field with a different meaning. " +
        "Filling the remaining 5,267 rows from mt_leader_name would leave one column holding " +
        "two incompatible semantics with no way to tell which row means which.",
      "mt_leader_name is a maintenance TEAM LEADER, not an engineer reviewer. All 8 distinct " +
        "leaders are classified role='supervisor' by Step 1 of this same script; writing them " +
        "into a field the app labels 'engineer reviewer' would contradict that.",
      "The existing 3,322 values are only 122 rows equal to mt_leader_name, and 116 distinct " +
        "values include free text that is not a person at all ('รอการซ่อม', 'Line HUB3 B1', and " +
        "several full Thai sentences). Appending leader names to that would deepen a " +
        "pre-existing data-quality problem in someone else's column, not fix it.",
      "work_orders review semantics are unreachable anyway: all 8,589 rows are status='completed' " +
        "with no review workflow state to attach a reviewer to.",
    ],
    mtLeaderNameAvailableOn: reviewerNonNull,
  };
  report.refusals.push(refusal);

  report.steps[label] = {
    step: "assigned_to",
    selected: runs("assigned"),
    totalWorkOrders: workOrders.length,
    coverage,
    coveragePct: Number(((coverage / workOrders.length) * 100).toFixed(2)),
    distinctAssignees: byTarget.size,
    rowsWithNoTechnician: noTechnician,
    rowsWithUnresolvableTechnician: unresolved,
    primaryTechnicianMismatch: primaryMismatch,
    engineerReviewer: refusal,
  };

  console.log(`[2] assigned_to: ${coverage}/${workOrders.length} rows -> ${byTarget.size} assignees`);
  console.log("    engineer_reviewer: SKIPPED (already populated from PD_Responsible_Name; see report)");

  if (!runs("assigned")) {
    console.log("    skipped (--only)");
    return;
  }
  if (DRY_RUN) {
    console.log("    dry run — no writes");
    return;
  }

  // One UPDATE per (assignee, chunk of work-order ids). Keyed on the primary
  // key, so re-running rewrites the same value — never a second row.
  let written = 0;
  for (const [profileIdValue, ids] of byTarget) {
    for (let i = 0; i < ids.length; i += WRITE_CHUNK) {
      const chunk = ids.slice(i, i + WRITE_CHUNK);
      const { error } = await supabase
        .from("work_orders")
        .update({ assigned_to: profileIdValue })
        .in("id", chunk);
      if (error) throw new Error(`update work_orders.assigned_to: ${error.message}`);
      written += chunk.length;
    }
  }
  console.log(`    wrote assigned_to on ${written} rows`);
  (report.steps[label] as Record<string, unknown>).rowsWritten = written;
}

// ===========================================================================
// Steps 3-6 — machines
// ===========================================================================

interface MachinePatch {
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  healthScore: number | null;
  status: string;
}

function deriveMachineFields(
  machines: MachineRow[],
  workOrders: WorkOrderRow[],
  pmPlans: PmPlanRow[]
): Map<string, MachinePatch> {
  // --- index the source rows by machine code -----------------------------
  const wosByCode = new Map<string, WorkOrderRow[]>();
  for (const wo of workOrders) {
    if (!wo.machine_code) continue;
    if (!wosByCode.has(wo.machine_code)) wosByCode.set(wo.machine_code, []);
    wosByCode.get(wo.machine_code)!.push(wo);
  }
  const pmsByCode = new Map<string, PmPlanRow[]>();
  for (const pm of pmPlans) {
    if (!pm.machine_code) continue;
    if (!pmsByCode.has(pm.machine_code)) pmsByCode.set(pm.machine_code, []);
    pmsByCode.get(pm.machine_code)!.push(pm);
  }

  const cutoff365 = addDays(TODAY, -365);
  const maxNext = addDays(TODAY, MAX_FUTURE_DAYS);

  const patches = new Map<string, MachinePatch>();

  const stats = {
    lastMaintenance: { covered: 0, fromWorkOrder: 0, fromPmActual: 0, futureRejected: [] as unknown[], dates: [] as string[] },
    nextMaintenance: {
      covered: 0,
      fromPmNextDate: 0,
      fromFallbackPeriod: 0,
      alreadyOverdue: 0,
      genuinelyFuture: 0,
      outliersRejected: [] as unknown[],
      invalidPeriodsIgnored: 0,
      dates: [] as string[],
    },
    health: {
      scored: 0,
      nullNoHistory: 0,
      values: [] as number[],
      candidates: [] as MonotonicityCandidate[],
    },
    status: {
      normal: 0,
      warning: 0,
      error: 0,
      maintenance: 0,
      reasons: { pmInProgress: 0, pmOverdue: 0, lowHealth: 0, lowHealthOnly: 0 },
      changedFromStored: 0,
      changes: [] as unknown[],
    },
    machinesWithNoCode: 0,
  };

  for (const machine of machines) {
    const code = machine.code;
    if (!code) stats.machinesWithNoCode += 1;
    const wos = code ? (wosByCode.get(code) ?? []) : [];
    const pms = code ? (pmsByCode.get(code) ?? []) : [];

    // ---------------- Step 3: last_maintenance --------------------------
    // max(latest work_orders.finish_datetime, latest pm_plans.actual_date).
    //
    // pm_plans.last_pm_date is deliberately NOT used: 71 of its values are in
    // the FUTURE (max 2029-04-29) and it carries 119 DATE_OUTLIER flags.
    // "Last maintenance: 2029" is not a data-quality wart, it is a wrong fact
    // that would make every overdue-PM calculation downstream read backwards.
    let woLatest: string | null = null;
    for (const wo of wos) {
      const d = toDateOnly(wo.finish_datetime);
      if (d && (woLatest === null || d > woLatest)) woLatest = d;
    }
    let pmLatest: string | null = null;
    for (const pm of pms) {
      const d = toDateOnly(pm.actual_date);
      if (d && (pmLatest === null || d > pmLatest)) pmLatest = d;
    }

    let lastMaintenance: string | null = null;
    for (const candidate of [woLatest, pmLatest]) {
      if (!candidate) continue;
      if (candidate > TODAY) {
        // Hard invariant: a "last" maintenance date can never be in the future.
        stats.lastMaintenance.futureRejected.push({ machine: machine.id, code, date: candidate });
        continue;
      }
      if (lastMaintenance === null || candidate > lastMaintenance) lastMaintenance = candidate;
    }
    if (lastMaintenance) {
      stats.lastMaintenance.covered += 1;
      stats.lastMaintenance.dates.push(lastMaintenance);
      if (lastMaintenance === woLatest) stats.lastMaintenance.fromWorkOrder += 1;
      else stats.lastMaintenance.fromPmActual += 1;
    }

    // ---------------- Step 4: next_maintenance --------------------------
    // Primary: the earliest genuinely-future planned PM date.
    let nextFromPlan: string | null = null;
    for (const pm of pms) {
      const d = toDateOnly(pm.next_pm_date);
      if (!d || d <= TODAY) continue;
      if (d > maxNext) {
        // 14 rows sit beyond 2035 (max 2086-05-21). A PM "due" in 60 years is
        // a broken source value, not a schedule.
        stats.nextMaintenance.outliersRejected.push({
          machine: machine.id,
          code,
          date: d,
          source: "pm_plans.next_pm_date",
        });
        continue;
      }
      if (nextFromPlan === null || d < nextFromPlan) nextFromPlan = d;
    }

    let nextMaintenance: string | null = nextFromPlan;
    let nextSource: "plan" | "fallback" | null = nextFromPlan ? "plan" : null;

    // Fallback: last_maintenance + the machine's modal PM period. Rejecting
    // period_days outside 1..MAX_FUTURE_DAYS discards the 109 INVALID_PERIOD
    // rows (max 21,915 days = 60 years) before they can produce a date in 2086.
    if (!nextMaintenance && lastMaintenance) {
      const periods: number[] = [];
      for (const pm of pms) {
        const p = pm.period_days;
        if (p === null || p === undefined) continue;
        if (p < 1 || p > MAX_FUTURE_DAYS) {
          stats.nextMaintenance.invalidPeriodsIgnored += 1;
          continue;
        }
        periods.push(p);
      }
      const period = modal(periods);
      if (period !== null) {
        const candidate = addDays(lastMaintenance, period);
        if (candidate > maxNext) {
          stats.nextMaintenance.outliersRejected.push({
            machine: machine.id,
            code,
            date: candidate,
            source: `last_maintenance + period_days(${period})`,
          });
        } else {
          nextMaintenance = candidate;
          nextSource = "fallback";
        }
      }
    }

    if (nextMaintenance) {
      stats.nextMaintenance.covered += 1;
      stats.nextMaintenance.dates.push(nextMaintenance);
      if (nextSource === "plan") stats.nextMaintenance.fromPmNextDate += 1;
      else stats.nextMaintenance.fromFallbackPeriod += 1;
      // An already-past next_maintenance is a REAL overdue machine, not a bug —
      // clearing it would erase the very signal the PM dashboard exists to show.
      if (nextMaintenance <= TODAY) stats.nextMaintenance.alreadyOverdue += 1;
      else stats.nextMaintenance.genuinelyFuture += 1;
    }

    // ---------------- Step 5: health_score ------------------------------
    // Machines with no work-order history stay NULL. Defaulting them to 100
    // would rank never-inspected machines as the healthiest in the fleet and
    // put them last on every "worst first" list — the exact opposite of true.
    let health: number | null = null;
    if (wos.length > 0) {
      let woCount365 = 0;
      let mtloss365 = 0;
      let lifetimeWo = 0;
      let lifetimeMtloss = 0;
      for (const wo of wos) {
        const d = toDateOnly(wo.finish_datetime);
        if (!d || d > TODAY) continue;
        // mtloss_min is clean (100% non-null, min 5). repair_duration_min is
        // NOT used anywhere in this score precisely because it has negative
        // values (min -12,900) that would hand out negative penalties, i.e.
        // reward a machine for having corrupt timing data.
        const loss = Math.max(0, Number(wo.mtloss_min ?? 0));
        // Lifetime totals: what stops a machine that has been idle for two
        // years — but has 18 repairs behind it — from scoring a perfect 100.
        lifetimeWo += 1;
        lifetimeMtloss += loss;
        if (d < cutoff365) continue;
        woCount365 += 1;
        mtloss365 += loss;
      }
      const overduePm = pms.filter((pm) => pm.is_overdue === true).length;
      const inputs: HealthInputs = {
        woCountLast365: woCount365,
        mtlossMinLast365: mtloss365,
        overduePmCount: overduePm,
        lifetimeWoCount: lifetimeWo,
        lifetimeMtlossMin: lifetimeMtloss,
        daysSinceLastRepair: woLatest && woLatest <= TODAY ? daysBetween(woLatest, TODAY) : null,
      };
      health = healthScore(inputs);
      stats.health.scored += 1;
      stats.health.values.push(health);
      stats.health.candidates.push({ code, score: health, inputs, penalties: healthPenalties(inputs) });
    } else {
      stats.health.nullNoHistory += 1;
    }

    // ---------------- Step 6: status ------------------------------------
    // 'error' is never assignable: it means "machine is down with an open
    // fault", and there are zero open work orders in this database — all 8,589
    // are status='completed'. Synthesizing an error state would put a red
    // alarm on the dashboard for a breakdown that was fixed years ago.
    const pmInProgress = pms.some((pm) => pm.status_code === "IN_PROGRESS");
    const pmOverdue = pms.some((pm) => pm.is_overdue === true);
    const lowHealth = health !== null && health < 60;

    let status: "normal" | "warning" | "error" | "maintenance";
    if (pmInProgress) {
      status = "maintenance";
      stats.status.reasons.pmInProgress += 1;
    } else if (pmOverdue || lowHealth) {
      status = "warning";
      if (pmOverdue) stats.status.reasons.pmOverdue += 1;
      if (lowHealth) stats.status.reasons.lowHealth += 1;
    } else {
      status = "normal";
    }
    if (status === "warning" && !pmOverdue && lowHealth) stats.status.reasons.lowHealthOnly += 1;
    stats.status[status] += 1;
    if (machine.status !== status) {
      stats.status.changedFromStored += 1;
      stats.status.changes.push({
        code,
        from: machine.status,
        to: status,
        health: { from: machine.health_score, to: health },
      });
    }

    patches.set(machine.id, { lastMaintenance, nextMaintenance, healthScore: health, status });
  }

  // --- invariant assertions ---------------------------------------------
  const lastDates = stats.lastMaintenance.dates.sort();
  for (const d of lastDates) {
    if (d > TODAY) throw new Error(`ASSERT FAILED: last_maintenance ${d} is in the future (today ${TODAY})`);
  }
  const nextDates = stats.nextMaintenance.dates.sort();
  for (const d of nextDates) {
    if (d > maxNext) throw new Error(`ASSERT FAILED: next_maintenance ${d} is beyond ${maxNext}`);
  }

  const dist = describe(stats.health.values);
  const histogram = histogramByDecade(stats.health.values);
  const EXPECTED = { min: 3, p10: 43, p25: 55, median: 71, p75: 88, p90: 95, max: 98, mean: 69.7 };
  const drift = Object.entries(EXPECTED).filter(([k, v]) => {
    const got = (dist as Record<string, number | null>)[k];
    return got === null || Math.abs((got as number) - v) > (k === "mean" ? 1 : 2);
  });
  if (drift.length > 0) {
    warn(
      `health_score distribution differs from the validated baseline on ${drift
        .map(([k]) => k)
        .join(", ")}: got ${JSON.stringify(dist)} vs expected ${JSON.stringify(EXPECTED)}`
    );
  }

  // The formula's central guarantee, re-proved from the real data on every run:
  // no machine with at least as much downtime AND at least as many failures as
  // another can have a smaller recent-damage penalty. This is an ASSERT, not a
  // warning — a non-zero count means the scoring has silently regressed.
  const monotonicity = auditMonotonicity(stats.health.candidates);
  if (monotonicity.recentDamageViolations > 0) {
    throw new Error(
      `ASSERT FAILED: health_score is not monotone in recent damage — ` +
        `${monotonicity.recentDamageViolations} inverted pairs`
    );
  }

  report.steps["3-last_maintenance"] = {
    step: "last_maintenance",
    selected: runs("last-maintenance"),
    totalMachines: machines.length,
    coverage: stats.lastMaintenance.covered,
    fromWorkOrderFinish: stats.lastMaintenance.fromWorkOrder,
    fromPmActualDate: stats.lastMaintenance.fromPmActual,
    range: { min: lastDates[0] ?? null, max: lastDates[lastDates.length - 1] ?? null },
    futureDatesRejected: stats.lastMaintenance.futureRejected,
    excludedSource: {
      column: "pm_plans.last_pm_date",
      reason:
        "71 values are in the future (max 2029-04-29) and the column carries 119 DATE_OUTLIER flags; " +
        "using it would set last_maintenance to a date that has not happened yet.",
    },
  };

  report.steps["4-next_maintenance"] = {
    step: "next_maintenance",
    selected: runs("next-maintenance"),
    totalMachines: machines.length,
    coverage: stats.nextMaintenance.covered,
    fromPmNextDate: stats.nextMaintenance.fromPmNextDate,
    fromLastPlusPeriod: stats.nextMaintenance.fromFallbackPeriod,
    genuinelyFuture: stats.nextMaintenance.genuinelyFuture,
    alreadyOverdue: stats.nextMaintenance.alreadyOverdue,
    range: { min: nextDates[0] ?? null, max: nextDates[nextDates.length - 1] ?? null },
    clipHorizonDays: MAX_FUTURE_DAYS,
    clipHorizonDate: maxNext,
    outliersRejected: stats.nextMaintenance.outliersRejected,
    invalidPeriodDaysIgnored: stats.nextMaintenance.invalidPeriodsIgnored,
  };

  report.steps["5-health_score"] = {
    step: "health_score",
    selected: runs("health"),
    totalMachines: machines.length,
    scored: stats.health.scored,
    leftNullNoWorkOrderHistory: stats.health.nullNoHistory,
    distribution: dist,
    histogramByDecade: histogram,
    expectedDistribution: EXPECTED,
    driftedMetrics: drift.map(([k]) => k),
    formula: {
      shape: "100 - Σ weight·ln(1+x)/ln(1+ref) - recency, clamped to 0…100",
      weights: HEALTH_WEIGHTS,
      terms: {
        failure: "work orders in the last 365 days",
        downtime: "mtloss_min in the last 365 days, in hours",
        overduePm: "pm_plans rows with is_overdue = true",
        lifetime: "all-time work-order count + all-time mtloss hours",
        recency: "weight·exp(-days_since_last_repair / tau); 0 when there is no repair history",
      },
    },
    monotonicity,
    notes: [
      "No min() caps: every damage term keeps growing, so extra damage is never free.",
      "No floor at 30 — clamped to 0…100 only, so the worst machines stay distinguishable.",
      "repair_duration_min is not used in this score at all (it has negative values, min -12,900).",
      "The breakdown-vs-planned ratio is not used: 99.4% of work orders are Breakdown Maintenance.",
      "mtloss_min is floored at 0 defensively even though it is clean.",
      "Machines with no work orders are left NULL rather than defaulted to 100.",
      "monotonicity.recentDamageViolations must be 0; the remaining `violations` are pairs where " +
        "another signal (overdue PM backlog, lifetime history, recency) legitimately disagrees with " +
        "the last-365-day damage ordering — see monotonicity.attribution.",
    ],
  };

  report.steps["6-status"] = {
    step: "status",
    selected: runs("status"),
    totalMachines: machines.length,
    counts: { normal: stats.status.normal, warning: stats.status.warning, maintenance: stats.status.maintenance, error: stats.status.error },
    nonNormal: stats.status.warning + stats.status.maintenance + stats.status.error,
    triggerCounts: stats.status.reasons,
    changedFromStoredValue: stats.status.changedFromStored,
    changes: stats.status.changes,
    errorNeverAssigned:
      "All 8,589 work orders are status='completed'; there are zero open work orders, so no machine " +
      "has an active fault to justify 'error'.",
  };

  report.steps["machines-meta"] = { machinesWithNullCode: stats.machinesWithNoCode };

  console.log(
    `[3] last_maintenance: ${stats.lastMaintenance.covered}/${machines.length} (range ${lastDates[0] ?? "-"} … ${lastDates[lastDates.length - 1] ?? "-"})`
  );
  console.log(
    `[4] next_maintenance: ${stats.nextMaintenance.covered}/${machines.length} (${stats.nextMaintenance.genuinelyFuture} future, ${stats.nextMaintenance.alreadyOverdue} overdue, ${stats.nextMaintenance.outliersRejected.length} outliers rejected)`
  );
  console.log(`[5] health_score: ${stats.health.scored} scored, ${stats.health.nullNoHistory} left NULL`);
  console.log(`    distribution ${JSON.stringify(dist)}`);
  console.log(
    `    histogram    ${Object.entries(histogram)
      .map(([k, v]) => `${k}:${v}`)
      .join("  ")}`
  );
  console.log(
    `    monotonicity ${monotonicity.pairsChecked} ordered pairs — recent-damage violations ${monotonicity.recentDamageViolations}, ` +
      `total inversions ${monotonicity.violations} (>=8pt: ${monotonicity.severe}, max ${monotonicity.maxMagnitude}pt) ` +
      `attributed to ${JSON.stringify(monotonicity.attribution)}`
  );
  console.log(
    `[6] status: ${JSON.stringify({ normal: stats.status.normal, warning: stats.status.warning, maintenance: stats.status.maintenance })} ` +
      `— ${stats.status.changedFromStored} changed vs stored (warning solely from low health: ${stats.status.reasons.lowHealthOnly})`
  );

  return patches;
}

async function writeMachines(machines: MachineRow[], patches: Map<string, MachinePatch>) {
  const machineSteps: Step[] = ["last-maintenance", "next-maintenance", "health", "status"];
  const active = machineSteps.filter(runs);
  if (active.length === 0) return;

  if (DRY_RUN) {
    console.log(`\n[machines] dry run — no writes (would touch: ${active.join(", ")})`);
    return;
  }

  // Upsert on the primary key `id`. `name` is included because it is NOT NULL
  // with no default, so PostgREST's INSERT ... ON CONFLICT needs it in the
  // payload; the ON CONFLICT branch always fires (every id already exists), so
  // the value written back is the value already stored. Only the columns for the
  // selected steps are included, so --only never clobbers a sibling field.
  const rows = machines.map((machine) => {
    const patch = patches.get(machine.id)!;
    const row: Record<string, unknown> = { id: machine.id, name: machine.name };
    if (runs("last-maintenance")) row.last_maintenance = patch.lastMaintenance;
    if (runs("next-maintenance")) row.next_maintenance = patch.nextMaintenance;
    if (runs("health")) row.health_score = patch.healthScore;
    if (runs("status")) row.status = patch.status;
    return row;
  });

  for (let i = 0; i < rows.length; i += WRITE_CHUNK) {
    const { error } = await supabase.from("machines").upsert(rows.slice(i, i + WRITE_CHUNK), { onConflict: "id" });
    if (error) throw new Error(`upsert machines: ${error.message}`);
  }
  console.log(`\n[machines] wrote ${rows.length} rows (columns: ${active.join(", ")})`);
}

main().catch((error) => {
  console.error("\nderive-data FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});
