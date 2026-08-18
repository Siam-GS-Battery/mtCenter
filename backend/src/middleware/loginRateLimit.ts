import type { Request, Response } from "express";
import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";
import { sendError } from "./errorHandler.js";

/**
 * Rate limit สำหรับ POST /api/auth/login
 *
 * ทำไมต้องมี: รหัสพนักงานเป็น namespace สั้นและเรียงลำดับ + รหัสผ่านเริ่มต้นเท่ากับรหัสพนักงาน
 * ทำให้เดารหัสได้ง่ายมากถ้ายิงได้ไม่จำกัด และ bcrypt cost 10 ยังทำให้การยิงถล่มเป็น
 * CPU exhaustion ได้ด้วย จึงจำกัดทั้ง
 *   1) ต่อ IP        — กัน attacker เครื่องเดียวไล่รหัสพนักงานหลายคน
 *   2) ต่อรหัสพนักงาน — กัน distributed/botnet ที่เปลี่ยน IP แต่ยิงบัญชีเดิมซ้ำ ๆ
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 นาที
const MAX_PER_IP = 20;
const MAX_PER_EMPLOYEE_ID = 8;

const TOO_MANY_REQUESTS_CODE = "TOO_MANY_LOGIN_ATTEMPTS";
const TOO_MANY_REQUESTS_MESSAGE =
  "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอประมาณ 15 นาทีแล้วลองอีกครั้ง";

// ใช้ error envelope มาตรฐานของโปรเจกต์: { success:false, error:{ message, code } }
function rejectHandler(_req: Request, res: Response): void {
  sendError(res, 429, TOO_MANY_REQUESTS_MESSAGE, TOO_MANY_REQUESTS_CODE);
}

const shared: Partial<Options> = {
  windowMs: WINDOW_MS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rejectHandler,
};

export const loginRateLimitByIp = rateLimit({
  ...shared,
  limit: MAX_PER_IP,
  // ipKeyGenerator normalize IPv6 ให้ถูกต้อง (ต้องใช้เมื่อ override keyGenerator เอง)
  keyGenerator: (req) => `ip:${ipKeyGenerator(req.ip ?? "")}`,
});

export const loginRateLimitByEmployeeId = rateLimit({
  ...shared,
  limit: MAX_PER_EMPLOYEE_ID,
  keyGenerator: (req) => {
    const body = (req.body ?? {}) as { employeeId?: unknown };
    const employeeId = typeof body.employeeId === "string" ? body.employeeId.trim() : "";
    // ถ้าไม่ส่ง employeeId มาเลย ให้ตกไปนับตาม IP เพื่อไม่ให้เลี่ยง limit ได้ด้วยการเว้นว่าง
    return employeeId
      ? `eid:${employeeId.toLowerCase()}`
      : `eid-missing:${ipKeyGenerator(req.ip ?? "")}`;
  },
});
