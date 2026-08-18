import { authenticateRequest } from "./authenticate.js";
import { ApiError, asyncHandler } from "./errorHandler.js";
import type { RequestWithProfile } from "./requireSupervisor.js";

export type { RequestWithProfile };

export type AppRole = "technician" | "engineer" | "supervisor";

/**
 * ตรวจสอบ Bearer token (JWT) แล้วดึง profile ปัจจุบัน (id, role) จาก Supabase — ใช้ร่วมกันโดย
 * requireRole/requireAuthenticated/requireSupervisor เพื่อไม่ให้ logic การ lookup ซ้ำกันหลายที่
 * ดึง role สดจาก DB เสมอ (ไม่เชื่อ role ที่ฝังอยู่ใน token เฉย ๆ) เผื่อ role ถูกเปลี่ยนหลังออก token แล้ว
 * ตรรกะจริงอยู่ที่ middleware/authenticate.ts (แหล่งเดียวของกฎความปลอดภัย) fail closed เสมอ:
 * ไม่มี/token ผิด/หมดอายุ/ถูกยกเลิกเพราะเปลี่ยนรหัสผ่าน/ไม่พบ profile → 401
 * และยังไม่เปลี่ยนรหัสผ่านเริ่มต้น → 403 + code PASSWORD_CHANGE_REQUIRED
 */
export async function lookupProfileFromHeader(
  req: { header(name: string): string | undefined }
): Promise<{ id: string; role: string }> {
  const { profile } = await authenticateRequest(req);
  return { id: profile.id, role: profile.role };
}

/**
 * สร้าง middleware ตรวจสิทธิ์ตามบทบาทผู้ใช้ (อ่านจาก Bearer token / JWT)
 *
 * @param allowedRoles รายการบทบาทที่อนุญาตให้เข้าถึง
 * @param forbiddenMessage ข้อความแจ้งเตือนเมื่อผู้ใช้มีสิทธิ์แต่ role ไม่ตรงกับที่อนุญาต
 */
export function requireRole(allowedRoles: AppRole[], forbiddenMessage: string) {
  return asyncHandler(async (req, _res, next) => {
    const profile = await lookupProfileFromHeader(req);

    if (!allowedRoles.includes(profile.role as AppRole)) {
      throw new ApiError(403, forbiddenMessage);
    }

    (req as RequestWithProfile).profile = profile;

    next();
  });
}

/**
 * Middleware ที่อนุญาตผู้ใช้ที่ login แล้ว "ทุก role" (technician/engineer/supervisor)
 * ต่างจาก requireRole ที่จำกัดเฉพาะ role ที่กำหนด — ใช้กับ endpoint ที่ทุกคนที่มีสิทธิ์
 * เข้าระบบใช้ได้ (เช่น AI chat, สร้าง/แก้ใบงาน) แต่ยังต้อง fail closed เหมือนกันทุกอย่าง
 * (ไม่มี/token ผิด → 401/403)
 */
export const requireAuthenticated = asyncHandler(async (req, _res, next) => {
  const profile = await lookupProfileFromHeader(req);
  (req as RequestWithProfile).profile = profile;
  next();
});
