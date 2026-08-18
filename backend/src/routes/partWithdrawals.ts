import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { mapPartWithdrawal, type PartWithdrawalRow, type SparePartRow } from "../lib/mappers.js";
import { fetchAllRows, parsePaging, round2, toNumberOrZero } from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";
import { requireAuthenticated, type RequestWithProfile } from "../middleware/requireRole.js";

// status ต้องถูกคำนวณฝั่งเซิร์ฟเวอร์เสมอ เหมือนกับ spareParts.ts POST /:id/stock
function computeStatus(stockQuantity: number, minThreshold: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= minThreshold) return "low_stock";
  return "in_stock";
}

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

    const workOrderId = typeof req.query.workOrderId === "string" ? req.query.workOrderId : undefined;
    if (workOrderId) query = query.eq("work_order_id", workOrderId);

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

router.post(
  "/",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};

    const partId = typeof body.partId === "string" ? body.partId.trim() : "";
    if (partId.length === 0) {
      throw new ApiError(400, "กรุณาระบุ partId เป็นข้อความที่ไม่ว่างเปล่า");
    }

    if (typeof body.qty !== "number" || !Number.isFinite(body.qty) || body.qty <= 0) {
      throw new ApiError(400, "qty ต้องเป็นตัวเลขที่มากกว่า 0");
    }
    if (!Number.isInteger(body.qty)) {
      throw new ApiError(400, "qty ต้องเป็นจำนวนเต็ม ไม่รองรับทศนิยม");
    }
    const qty: number = body.qty;

    const workOrderId: string | null =
      typeof body.workOrderId === "string" && body.workOrderId.trim().length > 0 ? body.workOrderId.trim() : null;

    const note: string | null = typeof body.note === "string" && body.note.trim().length > 0 ? body.note.trim() : null;

    const { data: part, error: partError } = await supabase
      .from("spare_parts")
      .select("*")
      .eq("id", partId)
      .maybeSingle();
    if (partError) throw new ApiError(500, partError.message);
    if (!part) throw new ApiError(404, "ไม่พบอะไหล่ที่ระบุ");
    const partRow = part as SparePartRow;

    let workOrder: { id: string; code: string; machine_code: string | null; machine_name_std: string | null } | null =
      null;
    if (workOrderId) {
      const { data: wo, error: woError } = await supabase
        .from("work_orders")
        .select("id, code, machine_code, machine_name_std")
        .eq("id", workOrderId)
        .maybeSingle();
      if (woError) throw new ApiError(500, woError.message);
      if (!wo) throw new ApiError(404, "ไม่พบใบงานที่ระบุ");
      workOrder = wo;
    }

    if (qty > partRow.stock_quantity) {
      throw new ApiError(409, `จำนวนคงเหลือไม่พอ (คงเหลือ ${partRow.stock_quantity} ${partRow.unit ?? "หน่วย"})`);
    }

    const next = partRow.stock_quantity - qty;
    // optimistic concurrency: เช็ค stock_quantity ปัจจุบันตอน update ด้วย เพื่อกันกรณี
    // มีคำขอเบิกพร้อมกันสองอันแล้ว read-then-write ทับกัน (lost update) เหมือนกับ
    // spareParts.ts POST /:id/stock
    const { data: updated, error: updateError } = await supabase
      .from("spare_parts")
      .update({ stock_quantity: next, status: computeStatus(next, partRow.min_threshold ?? 0) })
      .eq("id", partId)
      .eq("stock_quantity", partRow.stock_quantity)
      .select("*")
      .maybeSingle();
    if (updateError) throw new ApiError(500, updateError.message);
    if (!updated) {
      throw new ApiError(409, "จำนวนคงเหลือถูกแก้ไขโดยผู้ใช้อื่น กรุณาลองใหม่อีกครั้ง");
    }

    const now = new Date();
    const withdrawDate = now.toISOString().slice(0, 10);
    const withdrawMonth = withdrawDate.slice(0, 7);
    const unitPrice = partRow.unit_price_thb ?? 0;

    const profileId = (req as RequestWithProfile).profile?.id ?? null;
    let userName: string | null = profileId;
    if (profileId) {
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", profileId)
        .maybeSingle();
      if (profileRow && typeof (profileRow as { name?: string | null }).name === "string" && (profileRow as { name: string }).name.trim().length > 0) {
        userName = (profileRow as { name: string }).name;
      }
    }

    const row = {
      id: randomUUID(),
      withdraw_date: withdrawDate,
      withdraw_month: withdrawMonth,
      code_no: partRow.code,
      part_name: partRow.name,
      part_number: partRow.part_number ?? null,
      brand: partRow.brand ?? null,
      shelf_number: partRow.location_rack ?? null,
      qty,
      price_per_unit: unitPrice,
      total_value: qty * unitPrice,
      machine_code: workOrder?.machine_code ?? null,
      machine_name: workOrder?.machine_name_std ?? null,
      user_name: userName,
      withdrawn_by: profileId,
      spare_part_id: partRow.id,
      work_order_id: workOrder?.id ?? null,
      note,
      is_aggregate: false,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("part_withdrawals")
      .insert(row)
      .select("*")
      .single();
    if (insertError) {
      // rollback สต๊อกแบบ best-effort เพราะ insert ล้มเหลวหลังตัดสต๊อกไปแล้ว
      await supabase
        .from("spare_parts")
        .update({ stock_quantity: partRow.stock_quantity, status: partRow.status })
        .eq("id", partId)
        .eq("stock_quantity", next);
      throw new ApiError(500, insertError.message);
    }

    sendSuccess(res, mapPartWithdrawal(inserted as PartWithdrawalRow), 201);
  })
);

export default router;
