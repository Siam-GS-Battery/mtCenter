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
 * สร้าง middleware ตรวจสิทธิ์ตามบทบาทผู้ใช้ (อ่านจาก header x-user-id)
 *
 * @param allowedRoles รายการบทบาทที่อนุญาตให้เข้าถึง
 * @param forbiddenMessage ข้อความแจ้งเตือนเมื่อผู้ใช้มีสิทธิ์แต่ role ไม่ตรงกับที่อนุญาต
 */
export function requireRole(allowedRoles: AppRole[], forbiddenMessage: string) {
  return asyncHandler(async (req, _res, next) => {
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

    if (!allowedRoles.includes(data.role as AppRole)) {
      throw new ApiError(403, forbiddenMessage);
    }

    (req as RequestWithProfile).profile = { id: data.id, role: data.role };

    next();
  });
}
