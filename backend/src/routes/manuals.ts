import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { mapManual, type ManualRow } from "../lib/mappers.js";
import { ApiError, asyncHandler, sendPaginated, sendSuccess } from "../middleware/errorHandler.js";
import { requireRole } from "../middleware/requireRole.js";
import { fetchManualSummary, indexManual } from "../lib/manualIndexer.js";
import { buildIlikeOrClause, parsePaging } from "../lib/queryHelpers.js";

const router = Router();

const MAX_FILE_BYTES = 50 * 1024 * 1024;

// คลังคู่มือกำลังจะมี ~26 เล่มขึ้นไปเรื่อย ๆ ตามที่อัปโหลดเพิ่ม — list เดิมไม่มี
// limit/offset เลยและจะกลายเป็น query ไม่จำกัดขนาดเมื่อคลังโตขึ้น ใช้แพทเทิร์นเดียวกับ
// spare-parts/machines: limit/offset + exact count + { data, meta }
const MANUALS_PAGING_DEFAULTS = { defaultLimit: 20, maxLimit: 100 };

const MANUAL_ADMIN_ROLES = ["engineer", "supervisor"] as const;
const MANUAL_ADMIN_MESSAGE = "เฉพาะวิศวกรและหัวหน้างานเท่านั้นที่สามารถจัดการคลังคู่มือได้";
const requireManualAdmin = requireRole([...MANUAL_ADMIN_ROLES], MANUAL_ADMIN_MESSAGE);

// รายชื่อคอลัมน์ที่ใช้กับ endpoint ที่คืนเป็น "รายการ/สรุป" ของคู่มือ (list, create,
// update) โดยตั้งใจ "ไม่" รวม markdown_content เพราะคู่มือแต่ละเล่มอาจมีเนื้อหา
// หลาย MB (กำลังจะ import ~20MB รวม 26 เล่ม) การ select("*") แบบเดิมจะทำให้ payload
// ของ list บวมขึ้นโดยไม่จำเป็น ฝั่ง client ที่ต้องการเนื้อหาจริงให้ดึงแยกผ่าน
// GET /api/manuals/:id/content แทน
const MANUAL_LIST_COLUMNS =
  "id,title,machine_model,category,upload_date,uploaded_by,file_size,pages_count,ai_indexed,tags,created_at,file_path,has_markdown";

// path ที่เซิร์ฟเวอร์ออกให้เองจาก POST /upload-url จะมีรูปแบบนี้เท่านั้น
// (${randomUUID()}.pdf) ห้ามรับ filePath ที่ผู้เรียกส่งมาแบบอื่นเด็ดขาด เพราะจะถูก
// เซ็นด้วย service-role key ตรงใน GET /:id/file
const FILE_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/i;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, MANUALS_PAGING_DEFAULTS);

    let query = supabase.from("manuals").select(MANUAL_LIST_COLUMNS, { count: "exact" });

    // ค้นหาที่ server ครอบคลุมคู่มือทั้งคลัง (เหมือน spare-parts) แทนการกรองแค่ใน
    // batch ที่โหลดมาแล้วฝั่ง client — ครอบคลุมชื่อคู่มือและรุ่นเครื่องจักร
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      query = query.or(buildIlikeOrClause(["title", "machine_model"], search));
    }

    const machineModel = typeof req.query.machineModel === "string" ? req.query.machineModel.trim() : "";
    if (machineModel) query = query.eq("machine_model", machineModel);

    // เรียงผลลัพธ์ให้ deterministic เสมอ (group ตามรุ่นเครื่อง แล้วตามชื่อคู่มือ)
    // เพราะ heap order ของ PostgREST ไม่คงที่ข้ามการ PATCH/reload และจะทำให้กริดการ์ด
    // สลับตำแหน่งโดยไม่มีเหตุผลให้ผู้ใช้เห็น
    const { data, error, count } = await query
      .order("machine_model", { ascending: true, nullsFirst: false })
      .order("title", { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw new ApiError(500, error.message);

    sendPaginated(res, (data as ManualRow[]).map(mapManual), { total: count ?? 0, limit, offset });
  })
);

// คำเตือน: route "/upload-url" ต้องลงทะเบียนก่อนเสมอ route ที่เป็น "/:id" แบบ
// dynamic segment ตัวเดียว (ปัจจุบันคือ GET "/:id/file", DELETE "/:id" และ
// PATCH "/:id" ด้านล่าง) ต้องลงทะเบียนไว้ *หลัง* route ตัวอักษร "/upload-url"
// นี้เสมอ ไม่เช่นนั้น "/:id" จะจับ path "/upload-url" ไปโดยไม่ตั้งใจ (shadowing)
router.post(
  "/upload-url",
  requireManualAdmin,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const { fileName, fileSize } = body;

    if (typeof fileName !== "string" || fileName.trim().length === 0 || !/\.pdf$/i.test(fileName)) {
      throw new ApiError(400, "กรุณาระบุชื่อไฟล์ PDF ให้ถูกต้อง (นามสกุลไฟล์ต้องเป็น .pdf)");
    }

    if (typeof fileSize !== "number" || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_BYTES) {
      throw new ApiError(400, "ขนาดไฟล์ไม่ถูกต้อง ไฟล์ต้องมีขนาดมากกว่า 0 และไม่เกิน 50MB");
    }

    const path = `${randomUUID()}.pdf`;

    const { data, error } = await supabase.storage.from("manuals").createSignedUploadUrl(path);
    if (error) throw new ApiError(500, error.message);

    sendSuccess(res, {
      path,
      signedUrl: data.signedUrl,
      token: data.token,
    });
  })
);

// จุดนี้เป็นต้นไป (POST "/", DELETE "/:id", PATCH "/:id") ต้องผ่าน requireManualAdmin
// (เฉพาะ engineer/supervisor) เพราะเป็น route ที่แก้ไข/ลบข้อมูลถาวร ส่วน GET "/" และ
// GET "/:id/file" ด้านบนไม่ถูกป้องกัน (การอ่าน/เปิดไฟล์ต้องใช้งานได้กับทุกคน)
router.post(
  "/",
  requireManualAdmin,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const machineModel = typeof body.machineModel === "string" ? body.machineModel.trim() : "";
    if (title.length === 0 || machineModel.length === 0) {
      throw new ApiError(400, "กรุณาระบุ title และ machineModel เป็นข้อความที่ไม่ว่างเปล่า");
    }

    if (body.filePath !== undefined && body.filePath !== null) {
      if (typeof body.filePath !== "string" || !FILE_PATH_RE.test(body.filePath)) {
        throw new ApiError(400, "filePath ไม่ถูกต้อง (ต้องเป็น path ที่ออกโดย /upload-url)");
      }
    }

    if (body.tags !== undefined && body.tags !== null && !Array.isArray(body.tags)) {
      throw new ApiError(400, "tags ต้องเป็น array");
    }

    if (body.fileSize !== undefined && body.fileSize !== null && typeof body.fileSize !== "string") {
      throw new ApiError(400, "fileSize ต้องเป็นข้อความ");
    }

    if (body.pagesCount !== undefined && body.pagesCount !== null && typeof body.pagesCount !== "number") {
      throw new ApiError(400, "pagesCount ต้องเป็นตัวเลข");
    }

    if (body.aiIndexed !== undefined && body.aiIndexed !== null && typeof body.aiIndexed !== "boolean") {
      throw new ApiError(400, "aiIndexed ต้องเป็นค่า true/false");
    }

    if (body.category !== undefined && body.category !== null && typeof body.category !== "string") {
      throw new ApiError(400, "category ต้องเป็นข้อความ");
    }

    if (body.uploadedBy !== undefined && body.uploadedBy !== null && typeof body.uploadedBy !== "string") {
      throw new ApiError(400, "uploadedBy ต้องเป็นข้อความ");
    }

    if (body.markdownContent !== undefined && body.markdownContent !== null && typeof body.markdownContent !== "string") {
      throw new ApiError(400, "markdownContent ต้องเป็นข้อความ");
    }

    const row = {
      id: randomUUID(),
      title,
      machine_model: machineModel,
      category: body.category ?? "General",
      // date-only (YYYY-MM-DD) to match the seeded rows in 0002_seed.sql, which
      // are date-only strings, not full ISO timestamps
      upload_date: new Date().toISOString().slice(0, 10),
      uploaded_by: body.uploadedBy ?? "system",
      file_size: body.fileSize ?? "0 KB",
      pages_count: body.pagesCount ?? 0,
      ai_indexed: body.aiIndexed ?? false,
      tags: body.tags ?? [],
      markdown_content: body.markdownContent ?? null,
      file_path: body.filePath ?? null,
    };

    const { data, error } = await supabase.from("manuals").insert(row).select(MANUAL_LIST_COLUMNS).single();
    if (error) {
      if (row.file_path) {
        // best-effort: อย่าปล่อยไฟล์ที่เพิ่งอัปโหลดค้างอยู่ใน storage
        // ห่อด้วย try/catch เพราะ handleOperation ของ storage-js จะ rethrow
        // ข้อผิดพลาดที่ไม่ใช่ StorageError ตรง ๆ (ไม่ห่อเป็น {error}) ต้องกันไว้ไม่ให้
        // การ cleanup ที่ล้มเหลวไปบัง error การ insert ที่แท้จริงข้างล่างนี้
        try {
          const { error: rmError } = await supabase.storage.from("manuals").remove([row.file_path]);
          if (rmError) console.error("Failed to clean up orphaned manual object:", row.file_path, rmError);
        } catch (e) {
          console.error("Failed to clean up orphaned manual object:", row.file_path, e);
        }
      }
      throw new ApiError(500, error.message);
    }

    // TODO: ไฟล์ที่ถูก upload ไปยัง storage แล้วแต่ถูกทิ้งไว้ *ก่อน* เรียก
    // POST /api/manuals (เช่น ปิดแท็บ, เน็ตหลุด) จะยังรั่วอยู่เสมอ เพราะไม่มีแถวใน
    // ตาราง manuals ให้ตรวจสอบตอน insert ล้มเหลว จำเป็นต้องมี scheduled sweep
    // แยกต่างหาก: list object ทั้งหมดใน bucket "manuals" แล้วลบ object ที่มีอายุ
    // เกิน 24 ชม. และชื่อไม่ตรงกับ manuals.file_path ใด ๆ ในตาราง

    sendSuccess(res, mapManual(data as ManualRow), 201);
  })
);

router.delete(
  "/:id",
  requireManualAdmin,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("manuals")
      .select("file_path")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "ไม่พบคู่มือที่ระบุ");

    // ลบแถวในฐานข้อมูลก่อนเสมอ แล้วจึงลบไฟล์ใน storage ทีหลัง เพราะถ้าลบไฟล์สำเร็จ
    // แต่ลบแถวไม่สำเร็จ จะเหลือแถว "มีชีวิต" ที่ชี้ไปยังไฟล์ที่ถูกลบไปแล้ว (ผู้ใช้จะ
    // เจอปัญหานี้ตอนพยายามเปิดไฟล์) ส่วนกรณีลบแถวสำเร็จแต่ลบไฟล์ไม่สำเร็จ จะเหลือแค่
    // ไฟล์ orphan ที่ log ไว้เท่านั้น ซึ่งถูกครอบคลุมด้วย sweep งานที่ยังต้องทำ (ดู TODO
    // ใน POST / ข้างบน) อยู่แล้ว
    const { data: deletedRows, error: deleteError } = await supabase
      .from("manuals")
      .delete()
      .eq("id", req.params.id)
      .select("id");
    if (deleteError) throw new ApiError(500, deleteError.message);
    if (!deletedRows || deletedRows.length === 0) throw new ApiError(404, "ไม่พบคู่มือที่ระบุ");

    if (data.file_path) {
      // best-effort: อย่าปล่อยให้การลบไฟล์ล้มเหลวไปทำให้ request นี้ fail เพราะคู่มือ
      // ถูกลบออกจากมุมมองผู้ใช้ไปแล้ว ห่อด้วย try/catch เพราะ handleOperation ของ
      // storage-js จะ rethrow ข้อผิดพลาดที่ไม่ใช่ StorageError ตรง ๆ (ไม่ห่อเป็น {error})
      try {
        const { error: rmError } = await supabase.storage.from("manuals").remove([data.file_path]);
        if (rmError) console.error("Failed to clean up manual object:", data.file_path, rmError);
      } catch (e) {
        console.error("Failed to clean up manual object:", data.file_path, e);
      }
    }

    sendSuccess(res, { id: req.params.id });
  })
);

router.patch(
  "/:id",
  requireManualAdmin,
  asyncHandler(async (req, res) => {
    const { data: existingData, error: fetchError } = await supabase
      .from("manuals")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fetchError) throw new ApiError(500, fetchError.message);
    if (!existingData) throw new ApiError(404, "ไม่พบคู่มือที่ระบุ");

    const body = req.body ?? {};
    const update: Record<string, unknown> = {};

    const ALLOWED_PATCH_KEYS = ["title", "machineModel", "category", "tags"];
    for (const key of Object.keys(body)) {
      if (!ALLOWED_PATCH_KEYS.includes(key)) {
        throw new ApiError(400, `ไม่รู้จักฟิลด์ "${key}" ที่ส่งมา (ฟิลด์ที่แก้ไขได้: title, machineModel, category, tags)`);
      }
    }

    if (body.title !== undefined) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (title.length === 0) {
        throw new ApiError(400, "กรุณาระบุ title และ machineModel เป็นข้อความที่ไม่ว่างเปล่า");
      }
      update.title = title;
    }

    if (body.machineModel !== undefined) {
      const machineModel = typeof body.machineModel === "string" ? body.machineModel.trim() : "";
      if (machineModel.length === 0) {
        throw new ApiError(400, "กรุณาระบุ title และ machineModel เป็นข้อความที่ไม่ว่างเปล่า");
      }
      update.machine_model = machineModel;
    }

    if (body.category !== undefined) {
      if (typeof body.category !== "string") {
        throw new ApiError(400, "category ต้องเป็นข้อความ");
      }
      update.category = body.category;
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        throw new ApiError(400, "tags ต้องเป็น array");
      }
      update.tags = body.tags;
    }

    // หมายเหตุ: PATCH นี้ยังไม่รองรับการแทนที่ไฟล์ PDF (filePath) โดยตั้งใจ เพราะ
    // filePath ถูกตรวจสอบแค่รูปแบบ (${uuid}.pdf) ไม่ได้ตรวจว่าซ้ำกับแถวอื่นหรือไม่
    // การรับ filePath ตรงนี้จะทำให้แถวสองแถวชี้ไฟล์เดียวกันได้ และเมื่อมีการ DELETE
    // แถวหนึ่ง จะลบไฟล์ที่แถวอีกอันยังอ้างอิงอยู่ไปด้วย การจะเพิ่มฟีเจอร์นี้ในอนาคตต้อง
    // (ก) ปฏิเสธ path ที่มีแถวอื่นอ้างอิงอยู่แล้ว และ (ข) เช็คซ้ำว่าไม่มีแถวอื่นอ้างอิง
    // ไฟล์เดิมก่อนจะลบ object ทิ้ง

    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "ไม่มีข้อมูลที่ต้องแก้ไข");
    }

    const { data, error } = await supabase
      .from("manuals")
      .update(update)
      .eq("id", req.params.id)
      .select(MANUAL_LIST_COLUMNS)
      .single();
    if (error) throw new ApiError(500, error.message);

    sendSuccess(res, mapManual(data as ManualRow));
  })
);

router.get(
  "/:id/file",
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from("manuals")
      .select("file_path")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "ไม่พบคู่มือที่ระบุ");
    if (!data.file_path) throw new ApiError(404, "คู่มือเล่มนี้ยังไม่มีไฟล์ PDF แนบอยู่ในระบบ");

    const { data: signedData, error: signedError } = await supabase.storage
      .from("manuals")
      .createSignedUrl(data.file_path, 300);
    if (signedError) {
      // signedError.status เป็น number | undefined ที่ประกาศตรงบน StorageError
      // ฐาน (@supabase/storage-js@2.112.3) จึงเข้าถึงได้แบบ type-safe โดยไม่ต้อง
      // narrow แต่ storage API คืน status 404 ทั้งกรณี "object not found" และ
      // "bucket not found" (bucket "manuals" หายไปทั้งบัคเก็ต ซึ่งเป็นปัญหาการตั้งค่า
      // เซิร์ฟเวอร์) ตัว status เพียงอย่างเดียวจึงแยกสองกรณีนี้ไม่ได้ ต้องกัน bucket
      // ออกจาก message ก่อน จึงจะถือว่าเป็น "ไม่พบไฟล์" ของคู่มือเล่มนี้จริง ๆ
      const bucketMissing = /bucket/i.test(signedError.message);
      const notFound = signedError.status === 404 && !bucketMissing;
      throw new ApiError(notFound ? 404 : 500, notFound ? "ไม่พบไฟล์ PDF ของคู่มือเล่มนี้ใน storage" : signedError.message);
    }

    sendSuccess(res, { url: signedData.signedUrl });
  })
);

router.get(
  "/:id/content",
  asyncHandler(async (req, res) => {
    const id = typeof req.params.id === "string" ? req.params.id.trim() : "";
    if (id.length === 0) throw new ApiError(400, "กรุณาระบุ id ของคู่มือ");

    const { data, error } = await supabase
      .from("manuals")
      .select("id,markdown_content")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "ไม่พบคู่มือที่ระบุ");

    // เนื้อหา Markdown ของคู่มือถือว่า immutable หลังอัปโหลด (filePath/เนื้อหาไม่ได้
    // อยู่ใน ALLOWED_PATCH_KEYS ของ PATCH /:id ด้านบน — ดูคอมเมนต์ราว L246-251) จึง
    // cache ฝั่ง client ได้อย่างปลอดภัยแบบสั้น ๆ เพื่อลดการดึงซ้ำของ payload ที่อาจมี
    // ขนาดหลาย MB
    res.setHeader("Cache-Control", "private, max-age=300");

    sendSuccess(res, { markdownContent: data.markdown_content ?? null });
  })
);

// สร้าง/อัปเดตดัชนีความหมายของคู่มือเล่มเดียว เพื่อให้ AI ค้นเนื้อหาเล่มนี้เจอ
// (ตรรกะการ index อยู่ใน lib/manualIndexer.ts ใช้ร่วมกับ `npm run index:manuals`
// ซึ่งเป็นวิธี index ทั้งคลังในคราวเดียว)
//
// ป้องกันด้วย requireManualAdmin เช่นเดียวกับ POST/PATCH/DELETE ด้านบน เพราะ endpoint
// นี้ทั้งเขียนข้อมูลถาวรและใช้โควตา embedding API จริง — เล่มขนาดหลายล้านตัวอักษรอาจกิน
// เวลาหลายนาทีและหลายพันคำขอ ปล่อยให้เรียกได้อิสระเท่ากับเปิดช่องให้ถล่มโควตาได้
router.post(
  "/:id/index",
  requireManualAdmin,
  asyncHandler(async (req, res) => {
    const id = typeof req.params.id === "string" ? req.params.id.trim() : "";
    if (id.length === 0) throw new ApiError(400, "กรุณาระบุ id ของคู่มือ");

    const force = req.body?.force === true;

    const manual = await fetchManualSummary(id);
    if (!manual) throw new ApiError(404, "ไม่พบคู่มือที่ระบุ");

    // indexManual โยน error เมื่อทำไม่สำเร็จโดยตั้งใจ (ต่างจากเส้นทางตอบแชตที่ต้องไม่ล่ม)
    // ปล่อยให้ asyncHandler/errorHandler จัดการเป็น 500 พร้อมข้อความจริง
    const result = await indexManual(manual, { force });

    sendSuccess(res, result);
  })
);

export default router;
