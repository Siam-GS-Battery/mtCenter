import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { mapProfile, type ProfileRow } from "../lib/mappers.js";
import { ApiError, asyncHandler, sendSuccess } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    // เรียงตาม employee_id ให้ผลลัพธ์คงที่ — frontend ใช้แถวสุดท้ายของแต่ละ role เป็นผู้ใช้ที่แสดงบน sidebar
    const { data, error } = await supabase
      .from("profiles")
      // ระบุคอลัมน์ชัดเจน ห้าม select("*") — ไม่เช่นนั้นจะลาก password_hash ของผู้ใช้ทุกคน
      // เข้ามาใน process โดยไม่จำเป็น และเสี่ยงรั่วถ้าวันหนึ่งมีใครเลิกใช้ mapProfile
      .select("id, employee_id, name, initials, role, department, avatar_url")
      .order("employee_id", { ascending: true });
    if (error) throw new ApiError(500, error.message);

    const users = (data as ProfileRow[]).map(mapProfile);
    sendSuccess(res, users);
  })
);

export default router;
