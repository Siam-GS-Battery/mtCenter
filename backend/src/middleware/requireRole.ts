import { supabase } from "../lib/supabase.js";
import { ApiError, asyncHandler } from "./errorHandler.js";
import type { RequestWithProfile } from "./requireSupervisor.js";

export type { RequestWithProfile };

const USER_HEADER = "x-user-id";

export type AppRole = "technician" | "engineer" | "supervisor";

// TODO: การเชื่อ header x-user-id ที่ client ส่งมาเป็นเพียง stopgap ชั่วคราว ยังไม่ใช่
// การพิสูจน์ตัวตนจริง (client ปลอมค่านี้ได้) ต้องเปลี่ยนไปใช้ session/JWT จริงก่อนขึ้น production
// fail closed เสมอ: ต้องมี x-user-id ที่ตรงกับ profile ที่มี role อยู่ใน allowedRoles เท่านั้น
// จึงจะเข้าถึงทรัพยากรได้ ไม่เช่นนั้นปฏิเสธ request

/**
 * อ่าน header x-user-id แล้วดึง profile (id, role) จาก Supabase — ใช้ร่วมกันโดย
 * requireRole/requireAuthenticated/requireSupervisor เพื่อไม่ให้ logic การ lookup
 * ซ้ำกันหลายที่ fail closed เสมอ: ไม่มี header หรือไม่พบ profile → throw ApiError
 */
export async function lookupProfileFromHeader(
  req: { header(name: string): string | undefined }
): Promise<{ id: string; role: string }> {
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

  return { id: data.id, role: data.role };
}

/**
 * สร้าง middleware ตรวจสิทธิ์ตามบทบาทผู้ใช้ (อ่านจาก header x-user-id)
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
 * (ไม่มี/ไม่ตรง x-user-id → 401/403)
 */
export const requireAuthenticated = asyncHandler(async (req, _res, next) => {
  const profile = await lookupProfileFromHeader(req);
  (req as RequestWithProfile).profile = profile;
  next();
});
