import type { Request } from "express";
import { supabase } from "../lib/supabase.js";
import { ApiError, asyncHandler } from "./errorHandler.js";

const USER_HEADER = "x-user-id";

export interface SupervisorProfile {
  id: string;
  role: string;
}

// local interface สำหรับ cast req ที่แนบ profile ไว้แล้ว (ไม่แก้ global Express types
// เพื่อไม่ให้กระทบไฟล์อื่นที่ import express อยู่)
export interface RequestWithProfile extends Request {
  profile?: SupervisorProfile;
}

// TODO: การเชื่อ header x-user-id ที่ client ส่งมาเป็นเพียง stopgap ชั่วคราว ยังไม่ใช่
// การพิสูจน์ตัวตนจริง (client ปลอมค่านี้ได้) ต้องเปลี่ยนไปใช้ session/JWT จริงก่อนขึ้น production
// fail closed เสมอ: ต้องมี x-user-id ที่ตรงกับ profile ที่มี role = supervisor เท่านั้น
// จึงจะจัดการคลังอะไหล่ได้ ไม่เช่นนั้นปฏิเสธ request
export const requireSupervisor = asyncHandler(async (req, _res, next) => {
  const userId = req.header(USER_HEADER);
  if (!userId || userId.trim().length === 0) {
    throw new ApiError(401, "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(403, "ไม่พบสิทธิ์ผู้ใช้งานนี้");

  if (data.role !== "supervisor") {
    throw new ApiError(403, "เฉพาะหัวหน้างานเท่านั้นที่สามารถจัดการคลังอะไหล่ได้");
  }

  (req as RequestWithProfile).profile = { id: data.id, role: data.role };

  next();
});
