import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { mapPmPlan, type PmPlanRow } from "../lib/mappers.js";
import { buildIlikeOrClause, fetchAllRows, incrementCount, parsePaging } from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";

const router = Router();

const PAGING_DEFAULTS = { defaultLimit: 100, maxLimit: 500 };

// IMPORTANT: /stats must be registered before /:id, otherwise Express matches
// "stats" as an :id param and this route is never reached.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const { count: total, error: totalError } = await supabase
      .from("pm_plans")
      .select("*", { count: "exact", head: true });
    if (totalError) throw new ApiError(500, totalError.message);

    const { count: overdue, error: overdueError } = await supabase
      .from("pm_plans")
      .select("*", { count: "exact", head: true })
      .eq("is_overdue", true);
    if (overdueError) throw new ApiError(500, overdueError.message);

    const { count: onSchedule, error: onScheduleError } = await supabase
      .from("pm_plans")
      .select("*", { count: "exact", head: true })
      .eq("is_overdue", false);
    if (onScheduleError) throw new ApiError(500, onScheduleError.message);

    const rows = await fetchAllRows<{ pm_type: string | null; plan_year_month: string | null }>(
      "pm_plans",
      "pm_type, plan_year_month"
    );

    const byPmType: Record<string, number> = {};
    const byMonthMap: Record<string, number> = {};
    for (const row of rows) {
      incrementCount(byPmType, row.pm_type);
      if (row.plan_year_month) {
        byMonthMap[row.plan_year_month] = (byMonthMap[row.plan_year_month] ?? 0) + 1;
      }
    }
    const byMonth = Object.entries(byMonthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    sendSuccess(res, {
      total: total ?? 0,
      overdue: overdue ?? 0,
      onSchedule: onSchedule ?? 0,
      byPmType,
      byMonth,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, PAGING_DEFAULTS);

    let query = supabase.from("pm_plans").select("*", { count: "exact" });

    const machineCode = typeof req.query.machineCode === "string" ? req.query.machineCode : undefined;
    if (machineCode) query = query.eq("machine_code", machineCode);

    const statusCode = typeof req.query.statusCode === "string" ? req.query.statusCode : undefined;
    if (statusCode) query = query.eq("status_code", statusCode);

    if (req.query.planYear !== undefined) {
      const planYear = Number(req.query.planYear);
      if (Number.isFinite(planYear)) query = query.eq("plan_year", planYear);
    }

    const isOverdueParam = typeof req.query.isOverdue === "string" ? req.query.isOverdue : undefined;
    if (isOverdueParam === "true") query = query.eq("is_overdue", true);
    else if (isOverdueParam === "false") query = query.eq("is_overdue", false);

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      query = query.or(buildIlikeOrClause(["item_description", "part_name", "machine_base_name"], q));
    }

    const { data, error, count } = await query
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new ApiError(500, error.message);

    sendPaginated(res, (data as PmPlanRow[]).map(mapPmPlan), { total: count ?? 0, limit, offset });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("pm_plans")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "PM plan not found");

    sendSuccess(res, mapPmPlan(data as PmPlanRow));
  })
);

export default router;
