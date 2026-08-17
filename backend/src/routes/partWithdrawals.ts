import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { mapPartWithdrawal, type PartWithdrawalRow } from "../lib/mappers.js";
import { fetchAllRows, parsePaging, round2, toNumberOrZero } from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";

const router = Router();

const PAGING_DEFAULTS = { defaultLimit: 100, maxLimit: 500 };
const TOP_PARTS_LIMIT = 20;

// No GET "/:id" is defined for this resource, but /stats is still registered first
// to match the convention used by pm-plans/machines and to stay safe if a
// GET "/:id" is added here later.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const { count: total, error: totalError } = await supabase
      .from("part_withdrawals")
      .select("*", { count: "exact", head: true });
    if (totalError) throw new ApiError(500, totalError.message);

    const rows = await fetchAllRows<{
      withdraw_month: string | null;
      code_no: string | null;
      part_name: string | null;
      qty: number | string | null;
      total_value: number | string | null;
    }>("part_withdrawals", "withdraw_month, code_no, part_name, qty, total_value");

    let totalValue = 0;
    const byMonthMap: Record<string, { count: number; value: number }> = {};
    const byPartMap: Record<string, { code: string; name: string; qty: number; value: number }> = {};

    for (const row of rows) {
      const value = toNumberOrZero(row.total_value);
      const qty = toNumberOrZero(row.qty);
      totalValue += value;

      if (row.withdraw_month) {
        const bucket = byMonthMap[row.withdraw_month] ?? { count: 0, value: 0 };
        bucket.count += 1;
        bucket.value += value;
        byMonthMap[row.withdraw_month] = bucket;
      }

      if (row.code_no) {
        const bucket = byPartMap[row.code_no] ?? { code: row.code_no, name: row.part_name ?? "", qty: 0, value: 0 };
        bucket.qty += qty;
        bucket.value += value;
        if (!bucket.name && row.part_name) bucket.name = row.part_name;
        byPartMap[row.code_no] = bucket;
      }
    }

    const byMonth = Object.entries(byMonthMap)
      .map(([month, { count, value }]) => ({ month, count, value: round2(value) }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const topParts = Object.values(byPartMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_PARTS_LIMIT)
      .map((p) => ({ code: p.code, name: p.name, qty: p.qty, value: round2(p.value) }));

    sendSuccess(res, {
      total: total ?? 0,
      totalValue: round2(totalValue),
      byMonth,
      topParts,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, PAGING_DEFAULTS);

    let query = supabase.from("part_withdrawals").select("*", { count: "exact" });

    const codeNo = typeof req.query.codeNo === "string" ? req.query.codeNo : undefined;
    if (codeNo) query = query.eq("code_no", codeNo);

    const machineCode = typeof req.query.machineCode === "string" ? req.query.machineCode : undefined;
    if (machineCode) query = query.eq("machine_code", machineCode);

    const department = typeof req.query.department === "string" ? req.query.department : undefined;
    if (department) query = query.eq("department", department);

    const dateFrom = typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined;
    if (dateFrom) query = query.gte("withdraw_date", dateFrom);

    const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo : undefined;
    if (dateTo) query = query.lte("withdraw_date", dateTo);

    const { data, error, count } = await query
      .order("id", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new ApiError(500, error.message);

    sendPaginated(res, (data as PartWithdrawalRow[]).map(mapPartWithdrawal), {
      total: count ?? 0,
      limit,
      offset,
    });
  })
);

export default router;
