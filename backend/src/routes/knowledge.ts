// API ของ UX Storyboard Scenario C (ดูแลคลังความรู้หลังปิดงาน)
//
//   GET  /api/knowledge/review-queue        Frame 1 — ใบงานรอรีวิว จัดลำดับด้วย rule
//   GET  /api/knowledge/draft/:workOrderId  Frame 2 — ร่างองค์ความรู้จากสิ่งที่ช่างเล่า
//   POST /api/knowledge/confirm             Frame 2 — Engineer ยืนยันเข้าคลัง
//   GET  /api/knowledge/overview            Frame 4 — ภาพรวม + สถิติการถูกนำไปใช้
//   GET  /api/knowledge                     รายการความรู้ที่ยืนยันแล้ว (ให้หน้าคลังความรู้ใช้)
//
// ทุก endpoint ต้องผ่าน requireAuthenticated เพราะทั้งหมดเป็นข้อมูลการทำงานภายใน
// และ /confirm ต้องรู้ว่า "ใคร" ยืนยันเพื่อบันทึกลง knowledge_articles.confirmed_by

import { Router } from "express";
import { ApiError, asyncHandler, sendSuccess } from "../middleware/errorHandler.js";
import { requireAuthenticated, requireRole } from "../middleware/requireRole.js";
import type { RequestWithProfile } from "../middleware/requireSupervisor.js";
import { supabase } from "../lib/supabase.js";
import { getReviewQueue } from "../lib/reviewQueue.js";
import { buildKnowledgeDraft, confirmKnowledge } from "../lib/knowledgeDraft.js";
import { getKnowledgeOverview } from "../lib/knowledgeStats.js";
import { parsePaging } from "../lib/queryHelpers.js";

const router = Router();

// คิวรีวิวมักมีจำนวนน้อย (ใบงานที่ยังรอ Engineer ตรวจ) แต่เดิมไม่มี limit เลย —
// ป้องกันไม่ให้กลายเป็น query ไม่จำกัดขนาดถ้าใบงานค้างสะสมมาก
const REVIEW_QUEUE_PAGING_DEFAULTS = { defaultLimit: 20, maxLimit: 100 };
const KNOWLEDGE_OVERVIEW_PAGING_DEFAULTS = { defaultLimit: 20, maxLimit: 100 };

// Frame 1 — รายการใบงานรอรีวิว
router.get(
  "/review-queue",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, REVIEW_QUEUE_PAGING_DEFAULTS);
    // getReviewQueue() ต้องจัดลำดับความสำคัญข้ามทั้งคิวก่อนเสมอ (คะแนนขึ้นกับสภาพเครื่อง/
    // ความสำคัญ/เวลาสูญเสีย/วันที่ค้าง) จึงตัดหน้าเฉพาะตอนส่งกลับ ไม่ใช่ตอน query
    const items = await getReviewQueue();
    const total = items.length;
    const page = items.slice(offset, offset + limit);
    res.json({
      success: true,
      data: {
        items: page,
        // ป้ายจำนวนงานค้างที่ storyboard ระบุไว้ใน Frame 1 ("มีป้ายจำนวนงานค้างอยู่") —
        // นับจากทั้งคิว ไม่ใช่แค่หน้าที่ส่งกลับ
        pendingCount: items.filter((i) => !i.hasKnowledge).length,
        totalCount: total,
      },
      meta: { total, limit, offset },
    });
  })
);

// Frame 2 — ร่างองค์ความรู้ (ไม่บันทึกอะไร คืนร่างให้คนตรวจเท่านั้น)
router.get(
  "/draft/:workOrderId",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const workOrderId = typeof req.params.workOrderId === "string" ? req.params.workOrderId.trim() : "";
    if (workOrderId.length === 0) throw new ApiError(400, "กรุณาระบุ id ของใบงาน");

    try {
      const { draft } = await buildKnowledgeDraft(workOrderId);
      // แจ้งชัดว่านี่เป็นร่างที่ยังไม่เข้าคลัง เพื่อให้ผู้เรียกไม่เข้าใจผิดว่าบันทึกแล้ว
      sendSuccess(res, { draft, saved: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(message.includes("ไม่พบใบงาน") ? 404 : 500, message);
    }
  })
);

// Frame 2 — ยืนยันเข้าคลัง
//
// จำกัดเป็น engineer/supervisor เท่านั้น: storyboard ระบุ Persona ของ Scenario นี้ว่า
// "Engineer แผนก MT" และเหตุผลของ Frame 2 คือความรู้ต้องผ่านคนที่ตรวจได้ว่าถูกต้อง
// ปล่อยให้ช่างยืนยันความรู้ของตัวเองเข้าคลังได้ = ข้ามขั้นตอนรีวิวไปทั้งขั้น
router.post(
  "/confirm",
  requireRole(["engineer", "supervisor"], "เฉพาะวิศวกรหรือหัวหน้างานเท่านั้นที่ยืนยันความรู้เข้าคลังได้"),
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const profile = (req as RequestWithProfile).profile;

    if (typeof body.workOrderId !== "string" || body.workOrderId.trim().length === 0) {
      throw new ApiError(400, "กรุณาระบุ workOrderId");
    }
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      throw new ApiError(400, "กรุณาระบุหัวเรื่องความรู้");
    }
    if (typeof body.content !== "string" || body.content.trim().length === 0) {
      throw new ApiError(400, "กรุณาระบุเนื้อหาความรู้");
    }
    if (body.tags !== undefined && body.tags !== null && !Array.isArray(body.tags)) {
      throw new ApiError(400, "tags ต้องเป็น array");
    }
    // ผู้ยืนยันมาจาก profile ที่ผ่าน middleware แล้วเท่านั้น ไม่รับจาก body
    // ไม่งั้น client จะอ้างชื่อคนอื่นเป็นผู้ยืนยันความรู้ได้
    if (!profile?.id) throw new ApiError(401, "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");

    try {
      const result = await confirmKnowledge({
        workOrderId: body.workOrderId.trim(),
        title: body.title,
        category: body.category ?? null,
        machineModel: body.machineModel ?? null,
        machineCode: body.machineCode ?? null,
        tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t)) : [],
        summary: body.summary ?? null,
        content: body.content,
        draftContent: typeof body.draftContent === "string" ? body.draftContent : null,
        confirmedBy: profile.id,
        confirmedByName: typeof body.confirmedByName === "string" ? body.confirmedByName : null,
      });
      sendSuccess(res, result, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiError(message.includes("มีความรู้ที่ยืนยันแล้ว") ? 409 : 400, message);
    }
  })
);

// Frame 4 — ภาพรวมคลังความรู้
router.get(
  "/overview",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const { limit, offset } = parsePaging(req.query as Record<string, unknown>, KNOWLEDGE_OVERVIEW_PAGING_DEFAULTS);
    const { overview, total } = await getKnowledgeOverview(limit, offset);
    res.json({ success: true, data: overview, meta: { total, limit, offset } });
  })
);

// รายการความรู้ที่ยืนยันแล้ว — จงใจไม่ส่ง content เต็มในรายการ เพราะเนื้อหาแต่ละเรื่อง
// อาจยาวหลายพันตัวอักษร (แนวเดียวกับที่ manuals list ไม่ส่ง markdown_content)
router.get(
  "/",
  requireAuthenticated,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("id,title,category,machine_model,machine_code,tags,summary,source_work_order_code,confirmed_by_name,confirmed_at")
      .order("confirmed_at", { ascending: false })
      .limit(200);
    if (error) throw new ApiError(500, error.message);
    sendSuccess(res, data ?? []);
  })
);

// เนื้อหาเต็มของความรู้หนึ่งเรื่อง
router.get(
  "/:id/content",
  requireAuthenticated,
  asyncHandler(async (req, res) => {
    const id = typeof req.params.id === "string" ? req.params.id.trim() : "";
    if (id.length === 0) throw new ApiError(400, "กรุณาระบุ id ของความรู้");

    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("id,title,content,draft_content,confirmed_by_name,confirmed_at,source_work_order_code")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);
    if (!data) throw new ApiError(404, "ไม่พบความรู้ที่ระบุ");

    sendSuccess(res, data);
  })
);

export default router;
