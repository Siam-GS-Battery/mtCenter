import {
  authenticate,
  authenticateAllowPasswordChange,
  type RequestWithAuth,
} from "./authenticate.js";

export type { RequestWithAuth };

/**
 * ตรวจสอบ Authorization: Bearer <token> และแนบ payload ที่ verify แล้วไว้ที่ req.auth
 * ตรรกะทั้งหมดอยู่ใน middleware/authenticate.ts (แหล่งเดียว) — fail closed เสมอ:
 * ไม่มี header, token ผิดรูปแบบ/หมดอายุ/signature ไม่ตรง, ผู้ใช้ถูกลบ หรือโทเคนถูกยกเลิก
 * เพราะเปลี่ยนรหัสผ่าน → 401 และถ้ายังต้องเปลี่ยนรหัสผ่านเริ่มต้น → 403 PASSWORD_CHANGE_REQUIRED
 */
export const requireAuth = authenticate;

/**
 * ใช้ได้เฉพาะ endpoint ที่ต้องเข้าถึงได้ระหว่างถูกบังคับเปลี่ยนรหัสผ่าน
 * (GET /api/auth/me, POST /api/auth/change-password) ห้ามนำไปใช้กับ endpoint อื่น
 */
export const requireAuthAllowPasswordChange = authenticateAllowPasswordChange;
