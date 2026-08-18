import type { Request } from "express";
import { authenticateRequest } from "./authenticate.js";
import { ApiError, asyncHandler } from "./errorHandler.js";

export interface SupervisorProfile {
  id: string;
  role: string;
}

// local interface สำหรับ cast req ที่แนบ profile ไว้แล้ว (ไม่แก้ global Express types
// เพื่อไม่ให้กระทบไฟล์อื่นที่ import express อยู่)
export interface RequestWithProfile extends Request {
  profile?: SupervisorProfile;
}

// fail closed เสมอ: ต้องมี Bearer token ที่ verify ผ่าน, บัญชียังอยู่, โทเคนยังไม่ถูกยกเลิก,
// เปลี่ยนรหัสผ่านเริ่มต้นแล้ว และมี profile ที่ role = supervisor เท่านั้น จึงจะจัดการคลังอะไหล่ได้
// (ตรรกะการตรวจโทเคน/รหัสผ่านอยู่ที่ middleware/authenticate.ts แหล่งเดียว)
export const requireSupervisor = asyncHandler(async (req, _res, next) => {
  const { profile } = await authenticateRequest(req);

  if (profile.role !== "supervisor") {
    throw new ApiError(403, "เฉพาะหัวหน้างานเท่านั้นที่สามารถจัดการคลังอะไหล่ได้");
  }

  (req as RequestWithProfile).profile = { id: profile.id, role: profile.role };

  next();
});
