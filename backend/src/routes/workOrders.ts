import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import {
  mapWorkOrder,
  mapWorkOrderAttachment,
  type RequestedPart,
  type WorkOrderAttachmentRow,
  type WorkOrderPartRow,
  type WorkOrderRow,
} from "../lib/mappers.js";
import {
  buildIlikeOrClause,
  incrementCount,
  parsePaging,
  round2,
  toNumberOrZero,
} from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";
import { requireAuthenticated, requireRole } from "../middleware/requireRole.js";
import type { RequestWithProfile } from "../middleware/requireSupervisor.js";

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

const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;
const ATTACHMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx"];

// path ที่เซิร์ฟเวอร์ออกให้เองจาก POST /:id/attachments/upload-url จะมีรูปแบบนี้
// เท่านั้น (${randomUUID()}.<ext>) ห้ามรับ filePath ที่ผู้เรียกส่งมาแบบอื่นเด็ดขาด
// เพราะจะถูกเซ็นด้วย service-role key ตรงใน GET /:id/attachments/:attachmentId/file
const ATTACHMENT_FILE_PATH_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|jpeg|png|webp|doc|docx|xls|xlsx)$/i;

// "เลยกำหนด" (overdue) is date-based, not a plain status column, so it can't be
// expressed with a plain .eq() like the other filters. The factory floor works
// Bangkok-local days (see workOrderStatus.ts on the frontend, "the factory
// floor's own day"), so "today" is computed in Asia/Bangkok (UTC+7, no DST)
// rather than the server's own timezone — otherwise a server running in UTC
// would flip a work order due today into "overdue" up to 7 hours early.
function bangkokTodayStr(): string {
  const bangkokMs = Date.now() + 7 * 60 * 60 * 1000;
  const d = new Date(bangkokMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// "overdue" = has a due_date, that due_date is strictly before today (Bangkok
// time), and the work order is not completed (a closed job is never overdue,
// see isClosed in frontend/src/lib/workOrderStatus.ts). `.lt()` against a NULL
// due_date evaluates to unknown/false in Postgres, so undated rows are
// excluded for free — no separate "is not null" check needed. Applied
// identically in GET /stats (in-Node, over fetchAllWorkOrderStatRows) and
// GET / (as a query filter below) — keep both in sync if this predicate ever
// changes.
function isOverdueRow(row: { due_date: string | null; status: string | null }, today: string): boolean {
  return Boolean(row.due_date) && (row.due_date as string) < today && row.status !== "completed";
}

// due_date is stored as a plain YYYY-MM-DD calendar date (see 0001_init.sql) and
// compared lexically against bangkokTodayStr() in isOverdueRow/the SQL filter
// above. Any full ISO timestamp (e.g. new Date().toISOString(), or a timestamp a
// client might send) sorts differently from a calendar date around the
// Bangkok/UTC offset, so both the "no due date supplied" default and any
// caller-supplied value must be coerced to the same YYYY-MM-DD shape before
// being written.
function normalizeDueDate(value: unknown): string {
  if (value === undefined || value === null || value === "") return bangkokTodayStr();
  const str = String(value);
  const tIndex = str.indexOf("T");
  return tIndex === -1 ? str : str.slice(0, tIndex);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchAttachmentCountsForOrders(workOrderIds: string[]): Promise<Map<string, WorkOrderAttachmentRow[]>> {
  // List-page badge only needs a count, so fetch a minimal column set (not "*")
  // to keep this batch query cheap. Cast to WorkOrderAttachmentRow[] (same
  // partial-select-cast pattern as fetchAllWorkOrderStatRows above) since
  // mapWorkOrder/mapWorkOrderAttachment aren't used on these rows for
  // anything besides .length in the list view.
  const map = new Map<string, WorkOrderAttachmentRow[]>();
  if (workOrderIds.length === 0) return map;

  for (const idsChunk of chunk(workOrderIds, WORK_ORDER_IDS_CHUNK_SIZE)) {
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("work_order_attachments")
        .select("id, work_order_id, file_name, uploaded_at")
        .in("work_order_id", idsChunk)
        .order("id", { ascending: true })
        .range(from, from + PARTS_PAGE_SIZE - 1);
      if (error) throw new ApiError(500, error.message);

      const batch = (data ?? []) as unknown as WorkOrderAttachmentRow[];
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

type WorkOrderOwnershipRow = {
  id: string;
  status: string | null;
  assigned_to: string | null;
  requested_by: string | null;
};

// ตรวจสิทธิ์แก้ไข/ลบใบงาน: engineer/supervisor แก้ได้ทุกใบ, technician แก้ได้เฉพาะใบที่
// ตนถูก assign หรือเป็นผู้ขอเท่านั้น ใช้ร่วมกันโดย PATCH "/:id" และ DELETE "/:id"
export async function assertCanMutateWorkOrder(
  req: RequestWithProfile,
  workOrderId: string
): Promise<WorkOrderOwnershipRow> {
  const { data, error } = await supabase
    .from("work_orders")
    .select("id, status, assigned_to, requested_by")
    .eq("id", workOrderId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, "Work order not found");

  const row = data as WorkOrderOwnershipRow;
  const profile = req.profile;
  if (!profile) throw new ApiError(401, "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");

  if (profile.role === "engineer" || profile.role === "supervisor") {
    return row;
  }

  // technician
  if (row.assigned_to === profile.id || row.requested_by === profile.id) {
    return row;
  }

  throw new ApiError(403, "คุณไม่มีสิทธิ์แก้ไขใบงานนี้");
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

type WorkOrderStatRow = {
  status: string | null;
  priority: string | null;
  repair_category: string | null;
  mtloss_min: number | string | null;
  repair_duration_min: number | string | null;
  assigned_date: string | null;
  due_date: string | null;
};

// Same pagination shape as fetchAllRows (lib/queryHelpers.ts) — pages through in
// batches of PAGE_SIZE, ordered by "id" for a stable row order across separate
// .range() calls — but with machineCode/assignedTo filtering added, which
// fetchAllRows does not support. Keep the filter predicates in sync with the
// GET / handler below (.eq("machine_code", ...) / .eq("assigned_to", ...)).
async function fetchAllWorkOrderStatRows(filters: {
  machineCode?: string;
  assignedTo?: string;
}): Promise<WorkOrderStatRow[]> {
  const PAGE_SIZE = 1000;
  const rows: WorkOrderStatRow[] = [];
  let from = 0;
  for (;;) {
    let query = supabase
      .from("work_orders")
      .select("status, priority, repair_category, mtloss_min, repair_duration_min, assigned_date, due_date");
    if (filters.machineCode) query = query.eq("machine_code", filters.machineCode);
    if (filters.assignedTo) query = query.eq("assigned_to", filters.assignedTo);

    const { data, error } = await query.order("id", { ascending: true }).range(from, from + PAGE_SIZE - 1);
    if (error) throw new ApiError(500, error.message);

    const batch = (data ?? []) as unknown as WorkOrderStatRow[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

// IMPORTANT: /stats must be registered before any GET "/:id" is ever added to this
// router, otherwise Express would match "stats" as an :id param.
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    // keep in sync with filters in GET / handler below
    const machineCode = typeof req.query.machineCode === "string" ? req.query.machineCode : undefined;
    const assignedTo = typeof req.query.assignedTo === "string" ? req.query.assignedTo : undefined;

    let totalQuery = supabase.from("work_orders").select("*", { count: "exact", head: true });
    if (machineCode) totalQuery = totalQuery.eq("machine_code", machineCode);
    if (assignedTo) totalQuery = totalQuery.eq("assigned_to", assignedTo);
    const { count: total, error: totalError } = await totalQuery;
    if (totalError) throw new ApiError(500, totalError.message);

    // fetchAllRows (lib/queryHelpers.ts) has no filter support, so the
    // machineCode/assignedTo filters here are applied via a local paged fetch that
    // otherwise mirrors fetchAllRows's pagination behavior (ordered by "id", paged in
    // batches, to avoid the same ~1000-row PostgREST cap and row-order pitfalls).
    const rows = await fetchAllWorkOrderStatRows({ machineCode, assignedTo });

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byRepairCategory: Record<string, number> = {};
    const byMonthMap: Record<string, number> = {};
    let totalMtlossMin = 0;
    let durationSum = 0;
    let durationCount = 0;
    let overdue = 0;
    const today = bangkokTodayStr();

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

      if (isOverdueRow(row, today)) overdue += 1;
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
      overdue,
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

    // work_orders.assigned_to (plain text column, see 0001_init.sql) stores
    // profiles.id (`usr-...`), not a display name — lets "my work orders"
    // filter server-side by user id instead of the frontend filtering a
    // client-side page of up to 100-1000 rows.
    const assignedTo = typeof req.query.assignedTo === "string" ? req.query.assignedTo : undefined;
    if (assignedTo) query = query.eq("assigned_to", assignedTo);

    // "เลยกำหนด" tab (MyWorkOrdersView) — see isOverdueRow's predicate above,
    // applied here as query filters instead of an in-Node row check so the
    // list can page/count it like any other filter.
    const overdue = req.query.overdue === "true" || req.query.overdue === "1";
    if (overdue) {
      query = query.lt("due_date", bangkokTodayStr()).neq("status", "completed");
    }

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
    const ids = rows.map((row) => row.id);
    const partsMap = await fetchPartsForOrders(ids);
    const attachmentsMap = await fetchAttachmentCountsForOrders(ids);

    sendPaginated(
      res,
      rows.map((row) => mapWorkOrder(row, partsMap.get(row.id) ?? [], attachmentsMap.get(row.id))),
      { total: count ?? 0, limit, offset }
    );
  })
);

router.post(
  "/",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const profile = (req as RequestWithProfile).profile!;

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
      due_date: normalizeDueDate(body.dueDate),
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
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const profile = (req as RequestWithProfile).profile;
    const row = await assertCanMutateWorkOrder(req as RequestWithProfile, req.params.id);

    const body = req.body ?? {};
    const update = toWorkOrderUpdate(body);

    // ช่างแก้ไขได้เฉพาะใบงานที่ยังไม่เสร็จสิ้น และห้ามปิดงานเองโดยไม่ผ่าน
    // POST /:id/approve (สิทธิ์ engineer/supervisor เท่านั้น) — ป้องกันการยกระดับ
    // สิทธิ์ผ่าน PATCH status ตรงๆ การ "ส่งตรวจสอบ" (status: "review") ยังคง
    // เป็นขั้นตอนปกติของช่างและต้องอนุญาตต่อไป
    if (profile?.role === "technician") {
      if (row.status === "completed") {
        throw new ApiError(403, "ไม่สามารถแก้ไขใบงานที่เสร็จสิ้นแล้วได้");
      }
      if (update.status === "completed") {
        throw new ApiError(403, "ช่างไม่สามารถเปลี่ยนสถานะใบงานเป็นเสร็จสิ้นได้");
      }
    }

    if ("due_date" in update) {
      update.due_date = normalizeDueDate(update.due_date);
    }
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

router.delete(
  "/:id",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const workOrderId = req.params.id;
    const profile = (req as RequestWithProfile).profile;
    const row = await assertCanMutateWorkOrder(req as RequestWithProfile, workOrderId);

    if (profile?.role === "technician" && row.status === "completed") {
      throw new ApiError(403, "ไม่สามารถลบใบงานที่เสร็จสิ้นแล้วได้");
    }

    // เก็บ path ไฟล์แนบไว้ก่อนลบแถวแม่ (work_order_parts และ
    // work_order_attachments มี FK "on delete cascade" ไปยัง work_orders
    // อยู่แล้ว — ดู 0001_init.sql:70 และ 0018_work_order_attachments.sql:9 —
    // จึงไม่ต้องลบแถวลูกเองและต้องลบแถวแม่ก่อน เพื่อไม่ให้ข้อมูลลูก/ไฟล์แนบ
    // ถูกทำลายไปแล้วในกรณีที่การลบใบงานหลักไม่สำเร็จ)
    const { data: attachments, error: attachmentsFetchError } = await supabase
      .from("work_order_attachments")
      .select("file_path")
      .eq("work_order_id", workOrderId);
    if (attachmentsFetchError) throw new ApiError(500, attachmentsFetchError.message);

    const { error: deleteError, count } = await supabase
      .from("work_orders")
      .delete({ count: "exact" })
      .eq("id", workOrderId);
    if (deleteError) throw new ApiError(500, deleteError.message);
    if (!count) throw new ApiError(404, "Work order not found");

    const filePaths = (attachments ?? [])
      .map((a) => a.file_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);
    if (filePaths.length > 0) {
      try {
        const { error: rmError } = await supabase.storage.from("work-order-attachments").remove(filePaths);
        if (rmError) console.error("Failed to clean up attachment objects:", filePaths, rmError);
      } catch (e) {
        console.error("Failed to clean up attachment objects:", filePaths, e);
      }
    }

    sendSuccess(res, { id: workOrderId });
  })
);

router.post(
  "/:id/approve",
  requireRole(["engineer", "supervisor"], "เฉพาะวิศวกรหรือหัวหน้างานเท่านั้นที่ปิดใบงานได้"),
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

// --- Work order attachments (files/photos attached to a work order) ---
// สร้าง/ลบ/ดูไฟล์แนบ เก็บใน private storage bucket "work-order-attachments"
// ตามแพทเทิร์นเดียวกับ manuals.ts (upload-url แบบ signed upload, POST บันทึกแถว,
// GET /file ออก signed download url, DELETE ลบแถวก่อนแล้วค่อยลบไฟล์ best-effort)
//
// คำเตือน: route ตัวอักษร "/:id/attachments/upload-url" ต้องลงทะเบียนก่อน route
// "/:id/attachments/:attachmentId/file" และ "/:id/attachments/:attachmentId" เสมอ
// (ทั้งสามอยู่ใต้ path เดียวกันแค่ segment ท้ายต่างกัน แต่ Express จับ path ตามลำดับ
// ที่ประกาศ ไม่ใช่ตามความเฉพาะเจาะจง — ประกาศ literal segment ก่อน dynamic segment
// เสมอเพื่อกัน shadowing เหมือนที่ทำใน manuals.ts)

router.get(
  "/:id/attachments",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("work_order_attachments")
      .select("*")
      .eq("work_order_id", req.params.id)
      .order("uploaded_at", { ascending: true });
    if (error) throw new ApiError(500, error.message);

    sendSuccess(res, { items: (data as WorkOrderAttachmentRow[]).map(mapWorkOrderAttachment) });
  })
);

router.post(
  "/:id/attachments/upload-url",
  requireRole(["engineer", "supervisor"], "เฉพาะวิศวกรหรือหัวหน้างานเท่านั้นที่แนบไฟล์ได้"),
  asyncHandler(async (req, res) => {
    await assertCanMutateWorkOrder(req as RequestWithProfile, req.params.id);

    const body = req.body ?? {};
    const { fileName, fileSize, contentType } = body;

    if (typeof fileName !== "string" || fileName.trim().length === 0) {
      throw new ApiError(400, "กรุณาระบุชื่อไฟล์ให้ถูกต้อง");
    }
    const extMatch = /\.([a-z0-9]+)$/i.exec(fileName.trim());
    const ext = extMatch ? extMatch[1].toLowerCase() : "";
    if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
      throw new ApiError(
        400,
        `นามสกุลไฟล์ไม่รองรับ (รองรับเฉพาะ ${ATTACHMENT_EXTENSIONS.join(", ")})`
      );
    }

    if (typeof fileSize !== "number" || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_ATTACHMENT_BYTES) {
      throw new ApiError(400, "ขนาดไฟล์ไม่ถูกต้อง ไฟล์ต้องมีขนาดมากกว่า 0 และไม่เกิน 50MB");
    }

    if (contentType !== undefined && contentType !== null && typeof contentType !== "string") {
      throw new ApiError(400, "contentType ต้องเป็นข้อความ");
    }

    const path = `${randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage.from("work-order-attachments").createSignedUploadUrl(path);
    if (error) throw new ApiError(500, error.message);

    sendSuccess(res, {
      path,
      signedUrl: data.signedUrl,
      token: data.token,
    });
  })
);

router.post(
  "/:id/attachments",
  requireRole(["engineer", "supervisor"], "เฉพาะวิศวกรหรือหัวหน้างานเท่านั้นที่แนบไฟล์ได้"),
  asyncHandler(async (req, res) => {
    await assertCanMutateWorkOrder(req as RequestWithProfile, req.params.id);

    const body = req.body ?? {};
    const { fileName, filePath, fileSize, contentType, note } = body;

    if (typeof fileName !== "string" || fileName.trim().length === 0) {
      throw new ApiError(400, "กรุณาระบุชื่อไฟล์ให้ถูกต้อง");
    }
    if (typeof filePath !== "string" || !ATTACHMENT_FILE_PATH_RE.test(filePath)) {
      throw new ApiError(400, "filePath ไม่ถูกต้อง (ต้องเป็น path ที่ออกโดย /attachments/upload-url)");
    }
    if (fileSize !== undefined && fileSize !== null && typeof fileSize !== "number") {
      throw new ApiError(400, "fileSize ต้องเป็นตัวเลข");
    }
    if (contentType !== undefined && contentType !== null && typeof contentType !== "string") {
      throw new ApiError(400, "contentType ต้องเป็นข้อความ");
    }
    if (note !== undefined && note !== null && typeof note !== "string") {
      throw new ApiError(400, "note ต้องเป็นข้อความ");
    }

    // uploaded_by: ใช้ชื่อที่แสดงผลได้ถ้ามี (profiles.name) ไม่เช่นนั้น fallback เป็น id
    const profile = (req as import("../middleware/requireRole.js").RequestWithProfile).profile;
    let uploadedBy = profile?.id ?? null;
    if (profile?.id) {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", profile.id)
        .maybeSingle();
      if (profileRow?.name) uploadedBy = profileRow.name;
    }

    const row = {
      id: randomUUID(),
      work_order_id: req.params.id,
      file_name: fileName.trim(),
      file_path: filePath,
      file_size: fileSize ?? null,
      content_type: contentType ?? null,
      note: note ?? null,
      uploaded_by: uploadedBy,
    };

    const { data, error } = await supabase.from("work_order_attachments").insert(row).select("*").single();
    if (error) {
      // best-effort: อย่าปล่อยไฟล์ที่เพิ่งอัปโหลดค้างอยู่ใน storage เหมือนกับ
      // manuals.ts (ห่อ try/catch เพราะ handleOperation ของ storage-js rethrow
      // error ที่ไม่ใช่ StorageError ตรง ๆ)
      try {
        const { error: rmError } = await supabase.storage.from("work-order-attachments").remove([filePath]);
        if (rmError) console.error("Failed to clean up orphaned attachment object:", filePath, rmError);
      } catch (e) {
        console.error("Failed to clean up orphaned attachment object:", filePath, e);
      }
      throw new ApiError(500, error.message);
    }

    sendSuccess(res, mapWorkOrderAttachment(data as WorkOrderAttachmentRow), 201);
  })
);

router.get(
  "/:id/attachments/:attachmentId/file",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("work_order_attachments")
      .select("file_path")
      .eq("id", req.params.attachmentId)
      .eq("work_order_id", req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "ไม่พบไฟล์แนบที่ระบุ");

    const { data: signedData, error: signedError } = await supabase.storage
      .from("work-order-attachments")
      .createSignedUrl(data.file_path, 300);
    if (signedError) {
      // storage API คืน status 404 ทั้งกรณี "object not found" และ "bucket not
      // found" (bucket หายไปทั้งบัคเก็ต ซึ่งเป็นปัญหาการตั้งค่าเซิร์ฟเวอร์) ต้องกัน
      // bucket ออกจาก message ก่อน จึงจะถือว่าเป็น "ไม่พบไฟล์" จริง ๆ เหมือนกับ
      // manuals.ts GET /:id/file
      const bucketMissing = /bucket/i.test(signedError.message);
      const notFound = signedError.status === 404 && !bucketMissing;
      throw new ApiError(notFound ? 404 : 500, notFound ? "ไม่พบไฟล์แนบนี้ใน storage" : signedError.message);
    }

    sendSuccess(res, { url: signedData.signedUrl });
  })
);

router.delete(
  "/:id/attachments/:attachmentId",
  requireRole(["engineer", "supervisor"], "เฉพาะวิศวกรหรือหัวหน้างานเท่านั้นที่ลบไฟล์แนบได้"),
  asyncHandler(async (req, res) => {
    await assertCanMutateWorkOrder(req as RequestWithProfile, req.params.id);

    const { data, error } = await supabase
      .from("work_order_attachments")
      .select("file_path")
      .eq("id", req.params.attachmentId)
      .eq("work_order_id", req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "ไม่พบไฟล์แนบที่ระบุ");

    // ลบแถวในฐานข้อมูลก่อนเสมอ แล้วจึงลบไฟล์ใน storage ทีหลัง (เหตุผลเดียวกับ
    // manuals.ts DELETE /:id — เลี่ยงแถว "มีชีวิต" ที่ชี้ไฟล์ที่ถูกลบไปแล้ว)
    const { data: deletedRows, error: deleteError } = await supabase
      .from("work_order_attachments")
      .delete()
      .eq("id", req.params.attachmentId)
      .eq("work_order_id", req.params.id)
      .select("id");
    if (deleteError) throw new ApiError(500, deleteError.message);
    if (!deletedRows || deletedRows.length === 0) throw new ApiError(404, "ไม่พบไฟล์แนบที่ระบุ");

    try {
      const { error: rmError } = await supabase.storage.from("work-order-attachments").remove([data.file_path]);
      if (rmError) console.error("Failed to clean up attachment object:", data.file_path, rmError);
    } catch (e) {
      console.error("Failed to clean up attachment object:", data.file_path, e);
    }

    sendSuccess(res, { id: req.params.attachmentId });
  })
);

export default router;
