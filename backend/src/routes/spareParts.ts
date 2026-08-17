import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { mapSparePart, type SparePartRow } from "../lib/mappers.js";
import { buildIlikeOrClause, fetchAllRows, incrementCount, parsePaging, round2, toNumberOrZero } from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";
import { requireSupervisor } from "../middleware/requireSupervisor.js";

const router = Router();

const PAGING_DEFAULTS = { defaultLimit: 200, maxLimit: 1000 };

const ALLOWED_CREATE_KEYS = [
  "code",
  "name",
  "category",
  "compatibleMachines",
  "stockQuantity",
  "unit",
  "minThreshold",
  "locationRack",
  "unitPriceTHB",
  "imageUrl",
];

const ALLOWED_PATCH_KEYS = ALLOWED_CREATE_KEYS;

// status ต้องถูกคำนวณฝั่งเซิร์ฟเวอร์เสมอ ห้ามรับค่าจาก client โดยตรง
function computeStatus(stockQuantity: number, minThreshold: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= minThreshold) return "low_stock";
  return "in_stock";
}

function mapPostgresError(error: { code?: string; message: string }): ApiError {
  if (error.code === "23505") {
    return new ApiError(409, "รหัสอะไหล่นี้มีอยู่ในระบบแล้ว");
  }
  if (error.code === "23503") {
    // หมายเหตุ: work_order_parts.part_id ยังไม่มี FK อ้างถึง spare_parts (ดู
    // backend/supabase/migrations/0001_init.sql) จึง branch นี้ยังไม่มีทางเกิดขึ้นจริง
    // ในปัจจุบัน แต่คงไว้เผื่ออนาคตเพิ่ม FK แล้ว
    return new ApiError(409, "อะไหล่นี้ถูกอ้างอิงอยู่ในใบงาน ไม่สามารถลบได้");
  }
  return new ApiError(500, error.message);
}

function assertNoUnknownKeys(body: Record<string, unknown>, allowedKeys: string[]): void {
  for (const key of Object.keys(body)) {
    if (!allowedKeys.includes(key)) {
      throw new ApiError(400, `ไม่รู้จักฟิลด์ "${key}" ที่ส่งมา (ฟิลด์ที่แก้ไขได้: ${allowedKeys.join(", ")})`);
    }
  }
}

// IMPORTANT: /stats must be registered before any GET "/:id" is ever added to this
// router, otherwise Express would match "stats" as an :id param.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const { count: total, error: totalError } = await supabase
      .from("spare_parts")
      .select("*", { count: "exact", head: true });
    if (totalError) throw new ApiError(500, totalError.message);

    const { count: outOfStock, error: oosError } = await supabase
      .from("spare_parts")
      .select("*", { count: "exact", head: true })
      .eq("status", "out_of_stock");
    if (oosError) throw new ApiError(500, oosError.message);

    const rows = await fetchAllRows<{
      status: string | null;
      movement_status: string | null;
      stock_quantity: number | null;
      reorder_point: number | null;
      inventory_value: number | string | null;
      unit_price_thb: number | string | null;
    }>("spare_parts", "status, movement_status, stock_quantity, reorder_point, inventory_value, unit_price_thb");

    const byStockStatus: Record<string, number> = {};
    const byMovementStatus: Record<string, number> = {};
    let totalInventoryValue = 0;
    let belowReorderPoint = 0;

    for (const row of rows) {
      incrementCount(byStockStatus, row.status);
      incrementCount(byMovementStatus, row.movement_status);

      const invValue =
        row.inventory_value !== null && row.inventory_value !== undefined
          ? toNumberOrZero(row.inventory_value)
          : toNumberOrZero(row.stock_quantity) * toNumberOrZero(row.unit_price_thb);
      totalInventoryValue += invValue;

      if (row.reorder_point !== null && row.reorder_point !== undefined && (row.stock_quantity ?? 0) <= row.reorder_point) {
        belowReorderPoint += 1;
      }
    }

    sendSuccess(res, {
      total: total ?? 0,
      totalInventoryValue: round2(totalInventoryValue),
      belowReorderPoint,
      outOfStock: outOfStock ?? 0,
      byStockStatus,
      byMovementStatus,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, PAGING_DEFAULTS);

    let query = supabase.from("spare_parts").select("*", { count: "exact" });

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      query = query.or(buildIlikeOrClause(["name", "code"], search));
    }

    const stockStatus = typeof req.query.stockStatus === "string" ? req.query.stockStatus : undefined;
    if (stockStatus) query = query.eq("status", stockStatus);

    const groupCode = typeof req.query.groupCode === "string" ? req.query.groupCode : undefined;
    if (groupCode) query = query.eq("group_code", groupCode);

    const { data, error, count } = await query
      .order("code", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new ApiError(500, error.message);

    sendPaginated(res, (data as SparePartRow[]).map(mapSparePart), { total: count ?? 0, limit, offset });
  })
);

router.post(
  "/",
  requireSupervisor,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    assertNoUnknownKeys(body, ALLOWED_CREATE_KEYS);

    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (code.length === 0) {
      throw new ApiError(400, "กรุณาระบุ code เป็นข้อความที่ไม่ว่างเปล่า");
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length === 0) {
      throw new ApiError(400, "กรุณาระบุ name เป็นข้อความที่ไม่ว่างเปล่า");
    }

    if (body.category !== undefined && body.category !== null && typeof body.category !== "string") {
      throw new ApiError(400, "category ต้องเป็นข้อความ");
    }

    let compatibleMachines: string[] = [];
    if (body.compatibleMachines !== undefined && body.compatibleMachines !== null) {
      if (!Array.isArray(body.compatibleMachines) || body.compatibleMachines.some((m: unknown) => typeof m !== "string")) {
        throw new ApiError(400, "compatibleMachines ต้องเป็น array ของข้อความ");
      }
      compatibleMachines = body.compatibleMachines;
    }

    if (
      typeof body.stockQuantity !== "number" ||
      !Number.isFinite(body.stockQuantity) ||
      !Number.isInteger(body.stockQuantity) ||
      body.stockQuantity < 0
    ) {
      throw new ApiError(400, "stockQuantity ต้องเป็นจำนวนเต็มไม่ติดลบ");
    }

    if (body.unit !== undefined && body.unit !== null && typeof body.unit !== "string") {
      throw new ApiError(400, "unit ต้องเป็นข้อความ");
    }

    let minThreshold = 0;
    if (body.minThreshold !== undefined && body.minThreshold !== null) {
      if (
        typeof body.minThreshold !== "number" ||
        !Number.isFinite(body.minThreshold) ||
        !Number.isInteger(body.minThreshold) ||
        body.minThreshold < 0
      ) {
        throw new ApiError(400, "minThreshold ต้องเป็นจำนวนเต็มไม่ติดลบ");
      }
      minThreshold = body.minThreshold;
    }

    if (body.locationRack !== undefined && body.locationRack !== null && typeof body.locationRack !== "string") {
      throw new ApiError(400, "locationRack ต้องเป็นข้อความ");
    }

    if (
      body.unitPriceTHB !== undefined &&
      body.unitPriceTHB !== null &&
      (typeof body.unitPriceTHB !== "number" || !Number.isFinite(body.unitPriceTHB) || body.unitPriceTHB < 0)
    ) {
      throw new ApiError(400, "unitPriceTHB ต้องเป็นตัวเลขไม่ติดลบ");
    }

    if (body.imageUrl !== undefined && body.imageUrl !== null && typeof body.imageUrl !== "string") {
      throw new ApiError(400, "imageUrl ต้องเป็นข้อความ");
    }

    const row = {
      id: randomUUID(),
      code,
      name,
      category: body.category ?? null,
      compatible_machines: compatibleMachines,
      stock_quantity: body.stockQuantity,
      unit: body.unit ?? null,
      min_threshold: minThreshold,
      location_rack: body.locationRack ?? null,
      unit_price_thb: body.unitPriceTHB ?? null,
      status: computeStatus(body.stockQuantity, minThreshold),
      image_url: body.imageUrl ?? null,
    };

    const { data, error } = await supabase.from("spare_parts").insert(row).select("*").single();
    if (error) throw mapPostgresError(error);

    sendSuccess(res, mapSparePart(data as SparePartRow), 201);
  })
);

router.post(
  "/:id/stock",
  requireSupervisor,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    assertNoUnknownKeys(body, ["delta", "note"]);

    if (
      typeof body.delta !== "number" ||
      !Number.isFinite(body.delta) ||
      !Number.isInteger(body.delta) ||
      body.delta === 0
    ) {
      throw new ApiError(400, "delta ต้องเป็นจำนวนเต็มที่ไม่เท่ากับ 0");
    }
    // note ถูกรับไว้เพื่อความเข้ากันได้ของ API แต่ยังไม่ได้ใช้งานจริง (ยังไม่มีตาราง
    // บันทึกประวัติการเบิก/รับเข้า) จึงไม่ตรวจสอบและไม่ error หากส่งมา (รับไว้เฉยๆ แล้วไม่ใช้งาน)

    const { data: current, error: fetchError } = await supabase
      .from("spare_parts")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fetchError) throw new ApiError(500, fetchError.message);
    if (!current) throw new ApiError(404, "ไม่พบอะไหล่ที่ระบุ");

    const currentRow = current as SparePartRow;
    const next = currentRow.stock_quantity + body.delta;
    if (next < 0) {
      throw new ApiError(400, `จำนวนคงเหลือไม่พอ (คงเหลือ ${currentRow.stock_quantity} ชิ้น)`);
    }

    // optimistic concurrency: เช็ค stock_quantity ปัจจุบันตอน update ด้วย เพื่อกันกรณี
    // มีคำขอปรับสต๊อกพร้อมกันสองอันแล้ว read-then-write ทับกัน (lost update) ซึ่งอาจ
    // ทำให้ delta หายไปหนึ่งค่า หรือหลุดผ่านการเช็คห้ามติดลบ
    const { data, error } = await supabase
      .from("spare_parts")
      .update({ stock_quantity: next, status: computeStatus(next, currentRow.min_threshold ?? 0) })
      .eq("id", req.params.id)
      .eq("stock_quantity", currentRow.stock_quantity)
      .select("*")
      .maybeSingle();
    if (error) throw mapPostgresError(error);
    if (!data) {
      throw new ApiError(409, "จำนวนคงเหลือถูกแก้ไขโดยผู้ใช้อื่น กรุณาลองใหม่อีกครั้ง");
    }

    sendSuccess(res, mapSparePart(data as SparePartRow));
  })
);

router.patch(
  "/:id",
  requireSupervisor,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    assertNoUnknownKeys(body, ALLOWED_PATCH_KEYS);

    const update: Record<string, unknown> = {};

    if (body.code !== undefined) {
      const code = typeof body.code === "string" ? body.code.trim() : "";
      if (code.length === 0) {
        throw new ApiError(400, "กรุณาระบุ code เป็นข้อความที่ไม่ว่างเปล่า");
      }
      update.code = code;
    }

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length === 0) {
        throw new ApiError(400, "กรุณาระบุ name เป็นข้อความที่ไม่ว่างเปล่า");
      }
      update.name = name;
    }

    if (body.category !== undefined) {
      if (body.category !== null && typeof body.category !== "string") {
        throw new ApiError(400, "category ต้องเป็นข้อความ");
      }
      update.category = body.category;
    }

    if (body.compatibleMachines !== undefined) {
      if (
        !Array.isArray(body.compatibleMachines) ||
        body.compatibleMachines.some((m: unknown) => typeof m !== "string")
      ) {
        throw new ApiError(400, "compatibleMachines ต้องเป็น array ของข้อความ");
      }
      update.compatible_machines = body.compatibleMachines;
    }

    if (body.stockQuantity !== undefined) {
      if (
        typeof body.stockQuantity !== "number" ||
        !Number.isFinite(body.stockQuantity) ||
        !Number.isInteger(body.stockQuantity) ||
        body.stockQuantity < 0
      ) {
        throw new ApiError(400, "stockQuantity ต้องเป็นจำนวนเต็มไม่ติดลบ");
      }
      update.stock_quantity = body.stockQuantity;
    }

    if (body.unit !== undefined) {
      if (body.unit !== null && typeof body.unit !== "string") {
        throw new ApiError(400, "unit ต้องเป็นข้อความ");
      }
      update.unit = body.unit;
    }

    if (body.minThreshold !== undefined) {
      if (
        typeof body.minThreshold !== "number" ||
        !Number.isFinite(body.minThreshold) ||
        !Number.isInteger(body.minThreshold) ||
        body.minThreshold < 0
      ) {
        throw new ApiError(400, "minThreshold ต้องเป็นจำนวนเต็มไม่ติดลบ");
      }
      update.min_threshold = body.minThreshold;
    }

    if (body.locationRack !== undefined) {
      if (body.locationRack !== null && typeof body.locationRack !== "string") {
        throw new ApiError(400, "locationRack ต้องเป็นข้อความ");
      }
      update.location_rack = body.locationRack;
    }

    if (body.unitPriceTHB !== undefined) {
      if (
        body.unitPriceTHB !== null &&
        (typeof body.unitPriceTHB !== "number" || !Number.isFinite(body.unitPriceTHB) || body.unitPriceTHB < 0)
      ) {
        throw new ApiError(400, "unitPriceTHB ต้องเป็นตัวเลขไม่ติดลบ");
      }
      update.unit_price_thb = body.unitPriceTHB;
    }

    if (body.imageUrl !== undefined) {
      if (body.imageUrl !== null && typeof body.imageUrl !== "string") {
        throw new ApiError(400, "imageUrl ต้องเป็นข้อความ");
      }
      update.image_url = body.imageUrl;
    }

    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "ไม่มีข้อมูลที่ต้องแก้ไข");
    }

    // ถ้ามีการเปลี่ยน stockQuantity หรือ minThreshold ต้องคำนวณ status ใหม่จากค่าล่าสุด
    // เสมอ (ไม่ใช่แค่ค่าที่ส่งมาใน request นี้) จึงต้องดึงแถวปัจจุบันมา merge ก่อน
    if ("stock_quantity" in update || "min_threshold" in update) {
      const { data: current, error: fetchError } = await supabase
        .from("spare_parts")
        .select("stock_quantity, min_threshold")
        .eq("id", req.params.id)
        .maybeSingle();
      if (fetchError) throw new ApiError(500, fetchError.message);
      if (!current) throw new ApiError(404, "ไม่พบอะไหล่ที่ระบุ");

      const stockQuantity = (update.stock_quantity as number | undefined) ?? current.stock_quantity;
      const minThreshold = (update.min_threshold as number | undefined) ?? current.min_threshold ?? 0;
      update.status = computeStatus(stockQuantity, minThreshold);
    }

    const { data, error } = await supabase
      .from("spare_parts")
      .update(update)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();
    if (error) throw mapPostgresError(error);
    if (!data) throw new ApiError(404, "ไม่พบอะไหล่ที่ระบุ");

    sendSuccess(res, mapSparePart(data as SparePartRow));
  })
);

router.delete(
  "/:id",
  requireSupervisor,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from("spare_parts").delete().eq("id", req.params.id).select("id");
    if (error) throw mapPostgresError(error);
    if (!data || data.length === 0) throw new ApiError(404, "ไม่พบอะไหล่ที่ระบุ");

    sendSuccess(res, { id: req.params.id });
  })
);

export default router;
