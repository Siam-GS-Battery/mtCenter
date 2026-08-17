import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import {
  mapWorkOrder,
  type RequestedPart,
  type WorkOrderPartRow,
  type WorkOrderRow,
} from "../lib/mappers.js";
import {
  buildIlikeOrClause,
  fetchAllRows,
  incrementCount,
  parsePaging,
  round2,
  toNumberOrZero,
} from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";

const router = Router();

// NOTE: do NOT select "*, machines(code, name)" here (or anywhere in this file).
// That's a PostgREST embedded-resource join, resolved only via the FK in the schema
// cache. 0011_alter_work_orders.sql drops work_orders_machine_id_fkey (required
// because none of the 8,589 imported rows have machine_id set), so once that
// migration lands, any query using the embed 400s with PGRST200 ("Could not find a
// relationship..."), which asyncHandler/errorHandler then surfaces as a 500 — on
// every list/create/update/approve call. Use plain "*" and rely on
// work_orders.machine_code / machine_name_std (imported text columns, no join
// needed) instead; see mapWorkOrder in lib/mappers.ts.
const WORK_ORDER_SELECT = "*";
const PAGING_DEFAULTS = { defaultLimit: 200, maxLimit: 1000 };
const PARTS_PAGE_SIZE = 1000;
// GET / is called with up to PAGING_DEFAULTS.maxLimit (1000) ids at once
// (frontend/src/App.tsx calls getWorkOrders({limit: 1000}) on every app load), and
// a `.in("work_order_id", ids)` built from 1000 real Work_Order_No values measures
// ~9.8KB — over nginx/Kong's default 8KB large_client_header_buffers ceiling, so the
// request 500s outright. Chunking at 500 ids keeps each request at ~5.0KB, same
// headroom as DELETE_CHUNK_SIZE in backend/scripts/import-excel.ts, which hit this
// exact limit from the other direction (deleting work_order_parts by id list) and
// settled on the same chunk size independently.
const WORK_ORDER_IDS_CHUNK_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchPartsForOrders(workOrderIds: string[]): Promise<Map<string, WorkOrderPartRow[]>> {
  const map = new Map<string, WorkOrderPartRow[]>();
  if (workOrderIds.length === 0) return map;

  for (const idsChunk of chunk(workOrderIds, WORK_ORDER_IDS_CHUNK_SIZE)) {
    // Paginate within each chunk too: up to 500 work orders per chunk, some with 2
    // parts each, so a single chunk's result set can still exceed the ~1000-row
    // PostgREST default cap. Without .range() here, PostgREST silently truncates
    // and requestedParts goes missing for the tail with no error. .order("id")
    // keeps each page's boundary deterministic across calls.
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("work_order_parts")
        .select("*")
        .in("work_order_id", idsChunk)
        .order("id", { ascending: true })
        .range(from, from + PARTS_PAGE_SIZE - 1);
      if (error) throw new ApiError(500, error.message);

      const batch = (data ?? []) as WorkOrderPartRow[];
      for (const row of batch) {
        const list = map.get(row.work_order_id) ?? [];
        list.push(row);
        map.set(row.work_order_id, list);
      }
      if (batch.length < PARTS_PAGE_SIZE) break;
      from += PARTS_PAGE_SIZE;
    }
  }
  return map;
}

async function fetchFullWorkOrder(id: string): Promise<WorkOrderRow | null> {
  const { data, error } = await supabase
    .from("work_orders")
    .select(WORK_ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) return null;

  const row = data as unknown as WorkOrderRow;

  // Single-record lookup only (never in the list endpoint — that would be N+1).
  // Imported rows already carry machine_name_std/machine_code from Excel and never
  // hit this; all 8,589 of them also have machine_id = null, so they're skipped
  // below regardless. This only fires for manually-created work orders
  // (POST /api/work-orders with machineId) that would otherwise show a blank
  // machineName/machineCode now that the "*, machines(code, name)" embed is gone.
  if (!row.machine_name_std && row.machine_id) {
    const { data: machine, error: machineError } = await supabase
      .from("machines")
      .select("code, name")
      .eq("id", row.machine_id)
      .maybeSingle();
    // Best-effort: a lookup failure or miss must not fail the request — just
    // fall back to mapWorkOrder's existing "" behavior.
    if (!machineError && machine) {
      row.machines = { code: machine.code, name: machine.name };
    }
  }

  return row;
}

async function respondWithWorkOrder(res: import("express").Response, id: string, status = 200) {
  const row = await fetchFullWorkOrder(id);
  if (!row) throw new ApiError(404, "Work order not found");

  const partsMap = await fetchPartsForOrders([id]);
  sendSuccess(res, mapWorkOrder(row, partsMap.get(id) ?? []), status);
}

function fourDigit(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const CAMEL_TO_SNAKE: Record<string, string> = {
  title: "title",
  machineId: "machine_id",
  priority: "priority",
  status: "status",
  technicianName: "technician_name",
  engineerReviewer: "engineer_reviewer",
  assignedDate: "assigned_date",
  dueDate: "due_date",
  description: "description",
  symptoms: "symptoms",
  stepsCompleted: "steps_completed",
  totalSteps: "total_steps",
  aiVerificationScore: "ai_verification_score",
  requestedBy: "requested_by",
  assignedTo: "assigned_to",
  estimatedHours: "estimated_hours",
  actionPlan: "action_plan",
  partsRequested: "parts_requested",
  solutionSteps: "solution_steps",
  technicianNote: "technician_note",
  revisionNote: "revision_note",
  actionPlanSteps: "action_plan_steps",
};

function toWorkOrderUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  for (const [camelKey, snakeKey] of Object.entries(CAMEL_TO_SNAKE)) {
    if (camelKey in body) {
      update[snakeKey] = body[camelKey];
    }
  }
  return update;
}

async function replaceRequestedParts(workOrderId: string, requestedParts: RequestedPart[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from("work_order_parts")
    .delete()
    .eq("work_order_id", workOrderId);
  if (deleteError) throw new ApiError(500, deleteError.message);

  if (requestedParts.length === 0) return;

  const rows = requestedParts.map((part) => ({
    id: randomUUID(),
    work_order_id: workOrderId,
    part_id: part.partId,
    part_code: part.partCode,
    part_name: part.partName,
    quantity: part.quantity,
    status: part.status,
  }));

  const { error: insertError } = await supabase.from("work_order_parts").insert(rows);
  if (insertError) throw new ApiError(500, insertError.message);
}

// IMPORTANT: /stats must be registered before any GET "/:id" is ever added to this
// router, otherwise Express would match "stats" as an :id param.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const { count: total, error: totalError } = await supabase
      .from("work_orders")
      .select("*", { count: "exact", head: true });
    if (totalError) throw new ApiError(500, totalError.message);

    const rows = await fetchAllRows<{
      status: string | null;
      priority: string | null;
      repair_category: string | null;
      mtloss_min: number | string | null;
      repair_duration_min: number | string | null;
      assigned_date: string | null;
    }>("work_orders", "status, priority, repair_category, mtloss_min, repair_duration_min, assigned_date");

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byRepairCategory: Record<string, number> = {};
    const byMonthMap: Record<string, number> = {};
    let totalMtlossMin = 0;
    let durationSum = 0;
    let durationCount = 0;

    for (const row of rows) {
      incrementCount(byStatus, row.status);
      incrementCount(byPriority, row.priority);
      incrementCount(byRepairCategory, row.repair_category);

      totalMtlossMin += toNumberOrZero(row.mtloss_min);

      if (row.repair_duration_min !== null && row.repair_duration_min !== undefined) {
        durationSum += toNumberOrZero(row.repair_duration_min);
        durationCount += 1;
      }

      if (row.assigned_date && /^\d{4}-\d{2}/.test(row.assigned_date)) {
        const month = row.assigned_date.slice(0, 7);
        byMonthMap[month] = (byMonthMap[month] ?? 0) + 1;
      }
    }

    const byMonth = Object.entries(byMonthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    sendSuccess(res, {
      total: total ?? 0,
      byStatus,
      byPriority,
      byRepairCategory,
      totalMtlossMin: round2(totalMtlossMin),
      avgRepairDurationMin: durationCount > 0 ? round2(durationSum / durationCount) : 0,
      byMonth,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, PAGING_DEFAULTS);

    let query = supabase.from("work_orders").select(WORK_ORDER_SELECT, { count: "exact" });

    const machineCode = typeof req.query.machineCode === "string" ? req.query.machineCode : undefined;
    if (machineCode) query = query.eq("machine_code", machineCode);

    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    if (status) query = query.eq("status", status);

    const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;
    if (priority) query = query.eq("priority", priority);

    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    if (from) query = query.gte("assigned_date", from);

    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    if (to) query = query.lte("assigned_date", to);

    // work_orders.assigned_to (plain text column, see 0001_init.sql) — lets "my work
    // orders" filter server-side by technician/user id instead of the frontend
    // filtering a client-side page of up to 100-1000 rows.
    const assignedTo = typeof req.query.assignedTo === "string" ? req.query.assignedTo : undefined;
    if (assignedTo) query = query.eq("assigned_to", assignedTo);

    // Free-text search across the WO number, both title/description fields, and
    // both machine-identifying columns (machine_code for imported rows,
    // machine_name_std as the human-readable name). id and code are always equal
    // for every row (see mapWorkOrder/import spec), but both are included in case
    // that ever changes.
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      query = query.or(
        buildIlikeOrClause(
          ["id", "code", "title", "description", "machine_code", "machine_name_std"],
          search
        )
      );
    }

    // Order by assigned_date (the actual repair-report date), not created_at: all
    // 8,589 imported rows were inserted in ~18 batches sharing the same now()
    // transaction timestamp, so created_at has only ~18 distinct values across the
    // whole table. That both sorts the list by "import batch order" instead of
    // repair date, and — worse — makes .range() paging unstable: Postgres doesn't
    // guarantee a stable row order for ties, so two requests for the same page can
    // return duplicated or skipped rows. id is the PK, so it's always unique and
    // gives every page a deterministic tiebreaker.
    const { data, error, count } = await query
      // nullsFirst: false — Postgres puts NULLs FIRST for a DESC sort by default,
      // which would park the work orders that have no assigned_date at the very
      // top of a "newest first" list, where they read as the most recent work.
      // A missing date is unknown, not newest: those rows sort last.
      .order("assigned_date", { ascending: false, nullsFirst: false })
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new ApiError(500, error.message);

    const rows = data as unknown as WorkOrderRow[];
    const partsMap = await fetchPartsForOrders(rows.map((row) => row.id));

    sendPaginated(
      res,
      rows.map((row) => mapWorkOrder(row, partsMap.get(row.id) ?? [])),
      { total: count ?? 0, limit, offset }
    );
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};

    const hasMachineRef =
      Boolean(String(body.machineId ?? "").trim()) ||
      Boolean(String(body.machineName ?? "").trim()) ||
      Boolean(String(body.machineCode ?? "").trim());
    if (!String(body.title ?? "").trim() || !hasMachineRef) {
      throw new ApiError(400, "title and machineId (or machineName/machineCode) are required");
    }

    let machineId: string | undefined = body.machineId;
    let resolvedMachineCode: string | null = null;
    let resolvedMachineName: string | null = null;

    if (machineId) {
      const { data: matchedMachine, error: machineLookupError } = await supabase
        .from("machines")
        .select("id, code, name")
        .eq("id", machineId)
        .maybeSingle();
      if (machineLookupError) throw new ApiError(500, machineLookupError.message);
      if (!matchedMachine) {
        throw new ApiError(400, `No machine found matching machineId: ${machineId}`);
      }
      machineId = matchedMachine.id;
      resolvedMachineCode = matchedMachine.code ?? null;
      resolvedMachineName = matchedMachine.name ?? null;
    } else if (body.machineName || body.machineCode) {
      const lookupValue = body.machineName ?? body.machineCode;
      const { data: matchedMachine, error: machineLookupError } = await supabase
        .from("machines")
        .select("id, code, name")
        .or(`name.eq.${lookupValue},code.eq.${lookupValue}`)
        .maybeSingle();
      if (machineLookupError) throw new ApiError(500, machineLookupError.message);
      if (!matchedMachine) {
        throw new ApiError(400, `No machine found matching machineName/machineCode: ${lookupValue}`);
      }
      machineId = matchedMachine.id;
      resolvedMachineCode = matchedMachine.code ?? null;
      resolvedMachineName = matchedMachine.name ?? null;
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const year = new Date().getFullYear();

    const baseRow = {
      id,
      title: body.title,
      machine_id: machineId,
      priority: body.priority ?? "medium",
      status: body.status ?? "pending",
      technician_name: body.technicianName ?? "",
      engineer_reviewer: body.engineerReviewer ?? null,
      assigned_date: body.assignedDate ?? now,
      due_date: body.dueDate ?? now,
      description: body.description ?? "",
      machine_code: resolvedMachineCode,
      machine_name_std: resolvedMachineName,
      symptoms: body.symptoms ?? null,
      steps_completed: body.stepsCompleted ?? 0,
      total_steps: body.totalSteps ?? null,
      ai_verification_score: body.aiVerificationScore ?? null,
      requested_by: body.requestedBy ?? null,
      assigned_to: body.assignedTo ?? null,
      estimated_hours: body.estimatedHours ?? null,
      action_plan: body.actionPlan ?? null,
      parts_requested: body.partsRequested ?? null,
      solution_steps: body.solutionSteps ?? null,
      technician_note: body.technicianNote ?? null,
      revision_note: body.revisionNote ?? null,
      action_plan_steps: body.actionPlanSteps ?? null,
      created_at: now,
      updated_at: now,
    };

    let inserted = false;
    let lastError: { message: string; code?: string } | null = null;

    for (let attempt = 0; attempt < 2 && !inserted; attempt++) {
      const code = `WO-${year}-${fourDigit()}`;
      const { error } = await supabase.from("work_orders").insert({ ...baseRow, code });

      if (!error) {
        inserted = true;
      } else if (error.code === "23505") {
        // unique violation on code, retry once with a new random code
        lastError = error;
      } else {
        throw new ApiError(500, error.message);
      }
    }

    if (!inserted) {
      throw new ApiError(500, lastError?.message ?? "Failed to generate a unique work order code");
    }

    const requestedParts: RequestedPart[] = Array.isArray(body.requestedParts) ? body.requestedParts : [];
    if (requestedParts.length > 0) {
      await replaceRequestedParts(id, requestedParts);
    }

    await respondWithWorkOrder(res, id, 201);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const update = toWorkOrderUpdate(body);
    update.updated_at = new Date().toISOString();

    const { error, count } = await supabase
      .from("work_orders")
      .update(update, { count: "exact" })
      .eq("id", req.params.id);
    if (error) throw new ApiError(500, error.message);
    if (!count) throw new ApiError(404, "Work order not found");

    if (Array.isArray(body.requestedParts)) {
      await replaceRequestedParts(req.params.id, body.requestedParts as RequestedPart[]);
    }

    await respondWithWorkOrder(res, req.params.id);
  })
);

router.post(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const update: Record<string, unknown> = {
      status: "completed",
      updated_at: new Date().toISOString(),
    };
    if (body.engineerReviewer) {
      update.engineer_reviewer = body.engineerReviewer;
    }

    const { error, count } = await supabase
      .from("work_orders")
      .update(update, { count: "exact" })
      .eq("id", req.params.id);
    if (error) throw new ApiError(500, error.message);
    if (!count) throw new ApiError(404, "Work order not found");

    await respondWithWorkOrder(res, req.params.id);
  })
);

export default router;
