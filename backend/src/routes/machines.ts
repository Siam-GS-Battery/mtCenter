import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import {
  mapMachine,
  mapTelemetryReading,
  METRIC_API_TO_DB,
  type MachineRow,
  type TelemetryReadingRow,
} from "../lib/mappers.js";
import { buildIlikeOrClause, fetchAllRows, incrementCount, parsePaging } from "../lib/queryHelpers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

const MAX_READINGS_HOURS = 720;
const DEFAULT_READINGS_HOURS = 24;
const MAX_READINGS_ROWS = 2000;
const PAGING_DEFAULTS = { defaultLimit: 200, maxLimit: 1000 };

const MACHINE_ADMIN_ROLES = ["supervisor", "engineer"] as const;
const MACHINE_ADMIN_MESSAGE = "เฉพาะหัวหน้างานและวิศวกรเท่านั้นที่สามารถจัดการข้อมูลเครื่องจักรได้";
const requireMachineAdmin = requireRole([...MACHINE_ADMIN_ROLES], MACHINE_ADMIN_MESSAGE);

const CAMEL_TO_SNAKE: Record<string, string> = {
  code: "code",
  name: "name",
  model: "model",
  location: "location",
  status: "status",
  lastMaintenance: "last_maintenance",
  nextMaintenance: "next_maintenance",
  healthScore: "health_score",
  spindleTemp: "spindle_temp",
  vibrationMms: "vibration_mms",
  operatingHours: "operating_hours",
  qrCodeUrl: "qr_code_url",
  imageUrl: "image_url",
  activeErrorCode: "active_error_code",
  activeErrorDesc: "active_error_desc",
  // --- เพิ่มจาก backend/supabase/migrations/0009_alter_machines.sql ---
  // หมายเหตุ: dupQrCount, qualityFlags, infoNotes "ไม่" ถูกเพิ่มในนี้โดยตั้งใจ เพราะเป็นค่าที่
  // คำนวณ/ตรวจสอบมาจากตัวนำเข้าไฟล์ Excel (import-excel.ts) เท่านั้น ไม่ควรให้ผู้ใช้แก้ไขเองผ่าน API
  factoryGroup: "factory_group",
  departmentCode: "department_code",
  deptPrefix: "dept_prefix",
  section: "section",
  responsibleGroup: "responsible_group",
  costCenter: "cost_center",
  category: "category",
  productionName: "production_name",
  relatedQrCode: "related_qr_code",
  lifecycleStatus: "lifecycle_status",
  qrPrefix: "qr_prefix",
  sourceNo: "source_no",
};

const ALLOWED_MACHINE_KEYS = Object.keys(CAMEL_TO_SNAKE);

const MACHINE_STATUSES = ["normal", "warning", "error", "maintenance"] as const;

// ฟิลด์ที่ตรวจสอบด้วยกฎเฉพาะ (นอกเหนือจากนี้คือ "ต้องเป็นข้อความหรือ null")
const TEXT_DATE_FIELDS = new Set(["lastMaintenance", "nextMaintenance"]);
const SPECIAL_FIELDS = new Set([
  "name",
  "code",
  "status",
  "healthScore",
  "operatingHours",
  "spindleTemp",
  "vibrationMms",
  "lastMaintenance",
  "nextMaintenance",
]);

function assertNoUnknownKeys(body: Record<string, unknown>, allowedKeys: string[]): void {
  for (const key of Object.keys(body)) {
    if (!allowedKeys.includes(key)) {
      throw new ApiError(400, `ไม่รู้จักฟิลด์ "${key}" ที่ส่งมา (ฟิลด์ที่แก้ไขได้: ${allowedKeys.join(", ")})`);
    }
  }
}

function mapPostgresError(error: { code?: string; message: string }): ApiError {
  if (error.code === "23505") {
    return new ApiError(409, "รหัสเครื่องจักรนี้มีอยู่ในระบบแล้ว");
  }
  return new ApiError(500, error.message);
}

// ตรวจสอบ + แปลงค่าจาก body (camelCase) เป็น object แบบ snake_case ที่พร้อม insert/update
// partial = true สำหรับ PATCH (เฉพาะ key ที่ส่งมาเท่านั้นถูกตรวจ), false สำหรับ POST (name บังคับ,
// status ตั้งค่าเริ่มต้นให้ถ้าไม่ส่งมา)
function validateMachineFields(body: Record<string, unknown>, { partial }: { partial: boolean }): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  // name: บังคับตอนสร้างใหม่ ต้องไม่ว่างเปล่าหลัง trim ทั้งตอนสร้างและตอนแก้ไข (ถ้าส่งมา)
  if (!partial || "name" in body) {
    if (partial && body.name === undefined) {
      // ไม่ได้ส่ง name มาใน PATCH ไม่ต้องแตะ
    } else {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length === 0) {
        throw new ApiError(400, "กรุณาระบุชื่อเครื่องจักร");
      }
      update.name = name;
    }
  }

  // code: nullable เสมอ เพราะ unique constraint + not null ถูกถอดออกใน 0009 แล้ว
  if ("code" in body) {
    if (body.code === null) {
      update.code = null;
    } else if (typeof body.code === "string") {
      const trimmed = body.code.trim();
      update.code = trimmed.length === 0 ? null : trimmed;
    } else {
      throw new ApiError(400, "รหัสเครื่องจักรต้องเป็นข้อความ");
    }
  }

  // status: ตอนสร้างใหม่ default เป็น "normal" ถ้าไม่ส่งมา
  if ("status" in body) {
    if (typeof body.status !== "string" || !(MACHINE_STATUSES as readonly string[]).includes(body.status)) {
      throw new ApiError(400, "สถานะเครื่องจักรไม่ถูกต้อง (normal, warning, error, maintenance)");
    }
    update.status = body.status;
  } else if (!partial) {
    update.status = "normal";
  }

  // healthScore: null หรือจำนวนเต็ม 0-100
  if ("healthScore" in body) {
    const v = body.healthScore;
    if (v !== null && (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 100)) {
      throw new ApiError(400, "healthScore ต้องเป็นจำนวนเต็ม 0-100");
    }
    update.health_score = v;
  }

  // operatingHours: null หรือจำนวนเต็มไม่ติดลบ
  if ("operatingHours" in body) {
    const v = body.operatingHours;
    if (v !== null && (typeof v !== "number" || !Number.isInteger(v) || v < 0)) {
      throw new ApiError(400, "operatingHours ต้องเป็นจำนวนเต็มไม่ติดลบ");
    }
    update.operating_hours = v;
  }

  // spindleTemp: null หรือตัวเลข (finite) ใด ๆ
  if ("spindleTemp" in body) {
    const v = body.spindleTemp;
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v))) {
      throw new ApiError(400, "spindleTemp ต้องเป็นตัวเลข");
    }
    update.spindle_temp = v;
  }

  // vibrationMms: null หรือตัวเลข (finite) ที่ไม่ติดลบ
  if ("vibrationMms" in body) {
    const v = body.vibrationMms;
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v) || v < 0)) {
      throw new ApiError(400, "vibrationMms ต้องเป็นตัวเลขไม่ติดลบ");
    }
    update.vibration_mms = v;
  }

  // lastMaintenance / nextMaintenance: เป็นคอลัมน์ text ในฐานข้อมูล จึงตรวจแบบผ่อนปรนแค่ว่า
  // เป็น null หรือข้อความเท่านั้น (ไม่บังคับ format วันที่)
  for (const field of TEXT_DATE_FIELDS) {
    if (field in body) {
      const v = body[field];
      if (v !== null && typeof v !== "string") {
        throw new ApiError(400, `${field} ต้องเป็นข้อความวันที่`);
      }
      update[CAMEL_TO_SNAKE[field]] = typeof v === "string" ? v.trim() : v;
    }
  }

  // ฟิลด์ที่เหลือทั้งหมดใน whitelist: null หรือข้อความเท่านั้น
  for (const camelKey of ALLOWED_MACHINE_KEYS) {
    if (SPECIAL_FIELDS.has(camelKey)) continue;
    if (!(camelKey in body)) continue;

    const v = body[camelKey];
    if (v !== null && typeof v !== "string") {
      throw new ApiError(400, `${camelKey} ต้องเป็นข้อความ`);
    }
    update[CAMEL_TO_SNAKE[camelKey]] = typeof v === "string" ? v.trim() : v;
  }

  return update;
}

// ตรวจสอบรหัสเครื่องจักรซ้ำในระดับแอปพลิเคชัน เนื่องจาก unique constraint ของ machines.code
// ถูกถอดออกใน migration 0009 แล้ว (เพื่อรองรับข้อมูลนำเข้าที่มีรหัสซ้ำ/ว่างเปล่าได้) การตรวจสอบ
// แบบ read-then-write นี้จึงมีช่องโหว่ race condition เล็กน้อย (สอง request สร้าง/แก้ไขพร้อมกัน
// ด้วยรหัสเดียวกันอาจหลุดผ่านการตรวจได้ทั้งคู่) แต่ยอมรับได้ในระยะนี้เพราะ endpoint นี้ใช้งานโดย
// หัวหน้างาน/วิศวกรเท่านั้น ความถี่ในการสร้าง/แก้ไขพร้อมกันจึงต่ำมาก
async function assertCodeNotTaken(code: string, excludeId?: string): Promise<void> {
  let query = supabase.from("machines").select("id").eq("code", code);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.limit(1);
  if (error) throw new ApiError(500, error.message);
  if (data && data.length > 0) {
    throw new ApiError(409, "รหัสเครื่องจักรนี้มีอยู่ในระบบแล้ว");
  }
}

// IMPORTANT: /stats must be registered before /:id, otherwise Express matches
// "stats" as an :id param and this route is never reached.
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const { count: total, error: totalError } = await supabase
      .from("machines")
      .select("*", { count: "exact", head: true });
    if (totalError) throw new ApiError(500, totalError.message);

    const rows = await fetchAllRows<{
      status: string | null;
      factory_group: string | null;
      department_code: string | null;
      category: string | null;
    }>("machines", "status, factory_group, department_code, category");

    const byStatus: Record<string, number> = {};
    const byFactoryGroup: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const row of rows) {
      incrementCount(byStatus, row.status);
      incrementCount(byFactoryGroup, row.factory_group);
      incrementCount(byDepartment, row.department_code);
      incrementCount(byCategory, row.category);
    }

    sendSuccess(res, {
      total: total ?? 0,
      byStatus,
      byFactoryGroup,
      byDepartment,
      byCategory,
    });
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, PAGING_DEFAULTS);

    let query = supabase.from("machines").select("*", { count: "exact" });

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      query = query.or(buildIlikeOrClause(["name", "code"], search));
    }

    const factoryGroup = typeof req.query.factoryGroup === "string" ? req.query.factoryGroup : undefined;
    if (factoryGroup) query = query.eq("factory_group", factoryGroup);

    const department = typeof req.query.department === "string" ? req.query.department : undefined;
    if (department) query = query.eq("department_code", department);

    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query
      .order("code", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new ApiError(500, error.message);

    sendPaginated(res, (data as MachineRow[]).map(mapMachine), { total: count ?? 0, limit, offset });
  })
);

router.post(
  "/",
  requireMachineAdmin,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    assertNoUnknownKeys(body, ALLOWED_MACHINE_KEYS);

    const update = validateMachineFields(body, { partial: false });

    if (typeof update.code === "string" && update.code.length > 0) {
      await assertCodeNotTaken(update.code);
    }

    // id เป็นคอลัมน์ text (ไม่ใช่ uuid) แถวที่นำเข้าจาก Excel ใช้รูปแบบ `code#sourceRow`
    // (ดู import-excel.ts) แต่แถวที่สร้างเองผ่าน API นี้ไม่มี sourceRow ให้อ้างอิง จึงใช้ UUID
    // แบบสุ่มแทนเพื่อการันตีว่าไม่ซ้ำกับ id เดิมและ id ที่นำเข้าในอนาคต
    const row = { id: randomUUID(), ...update };

    const { data, error } = await supabase.from("machines").insert(row).select("*").single();
    if (error) throw mapPostgresError(error);

    sendSuccess(res, mapMachine(data as MachineRow), 201);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("machines")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "Machine not found");

    sendSuccess(res, mapMachine(data as MachineRow));
  })
);

// จริง ๆ แล้ว route นี้ถูกลงทะเบียนหลัง GET "/:id" (ไม่ใช่ก่อน) แต่ปลอดภัยเพราะ
// Express จับคู่ path ตามจำนวน segment: "/:id" มีแค่ 1 segment จึงไม่จับ path
// "/:id/readings" ที่มี 2 segment ไปโดยไม่ตั้งใจ
router.get(
  "/:id/readings",
  asyncHandler(async (req, res) => {
    const metricParam = typeof req.query.metric === "string" ? req.query.metric : undefined;
    const dbMetric = metricParam ? METRIC_API_TO_DB[metricParam] : undefined;
    if (!dbMetric) {
      throw new ApiError(
        400,
        "Query param 'metric' is required and must be one of: spindleTemp, vibrationMms, healthScore"
      );
    }

    let hours = DEFAULT_READINGS_HOURS;
    if (req.query.hours !== undefined) {
      const parsedHours = Number(req.query.hours);
      if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
        throw new ApiError(400, "Query param 'hours' must be a positive number");
      }
      hours = Math.min(parsedHours, MAX_READINGS_HOURS);
    }

    // ข้อมูล telemetry ถูก seed ไว้ล่วงหน้า ไม่ได้เขียนต่อเนื่องแบบ real-time
    // ดังนั้นแถวล่าสุดอาจเก่ากว่าปัจจุบันหลายชั่วโมง หากใช้ Date.now() เป็นจุดอ้างอิง
    // ช่วงเวลาที่คำนวณได้อาจไม่ครอบคลุมข้อมูลใด ๆ เลย จึงต้องยึดจุดอ้างอิง (anchor)
    // จากเวลาของแถวล่าสุดที่มีอยู่จริงแทน
    const { data: latestReadingRow, error: latestReadingError } = await supabase
      .from("telemetry_readings")
      .select("recorded_at")
      .eq("machine_id", req.params.id)
      .eq("metric", dbMetric)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestReadingError) throw new ApiError(500, latestReadingError.message);

    const latestRecordedAt = latestReadingRow?.recorded_at;
    const anchorMs = latestRecordedAt ? new Date(latestRecordedAt).getTime() : Date.now();
    const sinceIso = new Date(anchorMs - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("telemetry_readings")
      .select("*")
      .eq("machine_id", req.params.id)
      .eq("metric", dbMetric)
      .gte("recorded_at", sinceIso)
      // เรียงใหม่สุดก่อนแล้วค่อย limit เพื่อไม่ให้ตัดข้อมูลล่าสุดทิ้งเมื่อ
      // จำนวนแถวในช่วงเวลาเกิน MAX_READINGS_ROWS จากนั้นกลับลำดับให้เป็นเก่า -> ใหม่
      // ตามที่ frontend คาดหวัง
      .order("recorded_at", { ascending: false })
      .limit(MAX_READINGS_ROWS);
    if (error) throw new ApiError(500, error.message);

    const readings = (data as TelemetryReadingRow[]).map(mapTelemetryReading).reverse();
    sendSuccess(res, readings);
  })
);

router.patch(
  "/:id",
  requireMachineAdmin,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    assertNoUnknownKeys(body, ALLOWED_MACHINE_KEYS);

    const update = validateMachineFields(body, { partial: true });

    if (typeof update.code === "string" && update.code.length > 0) {
      await assertCodeNotTaken(update.code, req.params.id);
    }

    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "ไม่มีข้อมูลที่ต้องแก้ไข");
    }

    // ดึงค่าปัจจุบัน (ก่อนอัปเดต) ไว้เทียบว่าเมทริกใดเปลี่ยนแปลงจริง
    const { data: priorData, error: priorError } = await supabase
      .from("machines")
      .select("spindle_temp, vibration_mms, health_score")
      .eq("id", req.params.id)
      .maybeSingle();
    if (priorError) throw new ApiError(500, priorError.message);
    if (!priorData) throw new ApiError(404, "Machine not found");
    const previousValues: Record<string, number | null> = {
      spindle_temp: priorData.spindle_temp,
      vibration_mms: priorData.vibration_mms,
      health_score: priorData.health_score,
    };

    const { data, error } = await supabase
      .from("machines")
      .update(update)
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();
    if (error) throw mapPostgresError(error);
    if (!data) throw new ApiError(404, "Machine not found");

    // บันทึกค่าที่เปลี่ยนแปลงลง telemetry_readings เพื่อสะสมข้อมูลไว้ทำกราฟแนวโน้ม
    // ถ้า insert ไม่สำเร็จ ไม่ควรทำให้ทั้ง request ล้มเหลว จึงแค่ log แล้วปล่อยผ่าน
    const telemetryMetrics: Array<{ metric: string; body: string }> = [
      { metric: "spindle_temp", body: "spindleTemp" },
      { metric: "vibration_mms", body: "vibrationMms" },
      { metric: "health_score", body: "healthScore" },
    ];
    const rowsToInsert = telemetryMetrics
      .filter(({ body: bodyKey }) => bodyKey in (req.body ?? {}))
      .map(({ metric, body: bodyKey }) => ({
        machine_id: req.params.id,
        metric,
        // แปลงเป็นตัวเลขให้ชัดเจนก่อน insert เพราะคอลัมน์ value เป็น numeric not null
        // ค่าที่แปลงไม่ได้ (null, string ที่ไม่ใช่ตัวเลข ฯลฯ) จะถูกกรองทิ้งด้านล่าง
        value: Number((req.body as Record<string, unknown>)[bodyKey]),
        previous: previousValues[metric],
        source: "manual",
        recorded_at: new Date().toISOString(),
      }))
      // เก็บเฉพาะค่าที่เป็นตัวเลขจริง และต้องเปลี่ยนไปจากค่าที่บันทึกไว้ก่อนหน้าเท่านั้น
      // ไม่เช่นนั้น PATCH ที่ส่ง field เดิมมาซ้ำ ๆ จะสร้างจุดข้อมูลซ้ำที่ไม่มีความหมาย
      .filter((row) => Number.isFinite(row.value) && row.value !== row.previous)
      .map(({ previous, ...row }) => row);

    if (rowsToInsert.length > 0) {
      const { error: telemetryError } = await supabase.from("telemetry_readings").insert(rowsToInsert);
      if (telemetryError) {
        console.error("Failed to insert telemetry_readings on machine update:", telemetryError);
      }
    }

    sendSuccess(res, mapMachine(data as MachineRow));
  })
);

router.delete(
  "/:id",
  requireMachineAdmin,
  asyncHandler(async (req, res) => {
    // ความเชื่อมโยงจริงระหว่างเครื่องจักรกับตารางอื่น ๆ ไม่ได้ใช้ machines(id) อีกต่อไปแล้ว
    // work_orders.machine_id เคยมี FK อ้างถึง machines แต่ถูกถอดออกใน migration
    // 0011_alter_work_orders.sql (เพราะข้อมูลนำเข้ามีแถวที่ QR_Code ว่างเปล่า 31 แถว) และในข้อมูลจริง
    // ที่นำเข้าทั้งหมด work_orders.machine_id เป็น null ทุกแถว ความเชื่อมโยงตัวจริงคือ
    // work_orders.machine_code (text ธรรมดา ไม่มี FK) ส่วน pm_plans.machine_code (ดู
    // backend/supabase/migrations/0007_pm_plans.sql) และ part_withdrawals.machine_code (ดู
    // backend/supabase/migrations/0008_part_withdrawals.sql) ก็เป็น text ธรรมดาไม่มี FK เช่นกัน
    // จึงต้องตรวจสอบเองด้วยมือก่อนลบ ไม่เช่นนั้นจะทำให้แถวในตารางเหล่านี้กลายเป็นข้อมูลกำพร้า (orphan)
    //
    // telemetry_readings.machine_id มี "on delete cascade" จริง (ดู
    // backend/supabase/migrations/0003_telemetry_readings.sql) จึงลบตามได้อัตโนมัติ ไม่ต้องเช็คก่อน
    const { data: machine, error: machineError } = await supabase
      .from("machines")
      .select("id, code")
      .eq("id", req.params.id)
      .maybeSingle();
    if (machineError) throw new ApiError(500, machineError.message);
    if (!machine) throw new ApiError(404, "ไม่พบเครื่องจักรที่ระบุ");

    const code = typeof machine.code === "string" && machine.code.length > 0 ? machine.code : undefined;

    // นับ work_orders ที่อ้างอิงผ่าน machine_id (สำหรับแถวในอนาคตที่อาจมีค่านี้จริง) หรือผ่าน
    // machine_code (ความเชื่อมโยงตัวจริงของข้อมูลที่นำเข้าอยู่ในปัจจุบัน)
    //
    // เดิมใช้ .or(`machine_id.eq.${req.params.id},machine_code.eq.${code}`) แต่ .or() ตีความ
    // ค่าที่ต่อ string เข้าไปตามไวยากรณ์ filter ของ PostgREST เอง ( , ( ) " มีความหมายพิเศษ) ตอนนี้
    // ผู้ใช้กรอก code เองผ่านฟอร์มจัดการเครื่องจักรได้ ถ้า code มีอักขระเหล่านี้จะได้ filter ที่ผิดรูป
    // ทำให้นับแถวผิดพลาด (เสี่ยงปล่อยให้ลบเครื่องจักรที่ยังถูกอ้างอิงอยู่) จึงเปลี่ยนมาใช้ .eq() สอง
    // คำสั่งแยกกันแทน ซึ่งค่าจะถูกส่งผ่าน query-string encoder ไม่ต้องผ่านตัวแยกวิเคราะห์ไวยากรณ์ filter
    // แล้วรวมรายการ id ด้วย Set เพื่อไม่ให้แถวที่ตรงทั้งสองเงื่อนไข (เท่าที่จะเป็นไปได้กับแถวในอนาคต
    // เพราะ machine_id เป็น null ทุกแถวในข้อมูลที่นำเข้าอยู่ในปัจจุบัน) ถูกนับซ้ำสองครั้ง
    const [machineIdMatches, machineCodeMatches] = await Promise.all([
      supabase.from("work_orders").select("id").eq("machine_id", req.params.id),
      code
        ? supabase.from("work_orders").select("id").eq("machine_code", code)
        : Promise.resolve({ data: [] as { id: string }[], error: null }),
    ]);
    if (machineIdMatches.error) throw new ApiError(500, machineIdMatches.error.message);
    if (machineCodeMatches.error) throw new ApiError(500, machineCodeMatches.error.message);

    const workOrderIds = new Set<string>();
    for (const row of machineIdMatches.data ?? []) workOrderIds.add(row.id as string);
    for (const row of machineCodeMatches.data ?? []) workOrderIds.add(row.id as string);
    const workOrderCount = workOrderIds.size;

    let pmPlanCount = 0;
    let partWithdrawalCount = 0;
    if (code) {
      const [pmPlanResult, partWithdrawalResult] = await Promise.all([
        supabase.from("pm_plans").select("*", { count: "exact", head: true }).eq("machine_code", code),
        supabase.from("part_withdrawals").select("*", { count: "exact", head: true }).eq("machine_code", code),
      ]);
      if (pmPlanResult.error) throw new ApiError(500, pmPlanResult.error.message);
      if (partWithdrawalResult.error) throw new ApiError(500, partWithdrawalResult.error.message);
      pmPlanCount = pmPlanResult.count ?? 0;
      partWithdrawalCount = partWithdrawalResult.count ?? 0;
    }

    const blockers: string[] = [];
    if (workOrderCount && workOrderCount > 0) blockers.push(`ใบงานซ่อมบำรุง ${workOrderCount} ใบ`);
    if (pmPlanCount > 0) blockers.push(`แผน PM ${pmPlanCount} รายการ`);
    if (partWithdrawalCount > 0) blockers.push(`การเบิกอะไหล่ ${partWithdrawalCount} รายการ`);
    if (blockers.length > 0) {
      throw new ApiError(409, `ไม่สามารถลบได้ เครื่องจักรนี้ถูกอ้างอิงอยู่: ${blockers.join(", ")}`);
    }

    const { data, error } = await supabase.from("machines").delete().eq("id", req.params.id).select("id");
    if (error) throw mapPostgresError(error);
    if (!data || data.length === 0) throw new ApiError(404, "ไม่พบเครื่องจักรที่ระบุ");

    sendSuccess(res, { id: req.params.id });
  })
);

export default router;
