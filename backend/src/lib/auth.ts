import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { AppRole } from "../middleware/requireRole.js";

// fail closed เสมอ: JWT_SECRET ถูกตรวจใน config.ts (required + ยาวอย่างน้อย 32 ตัวอักษร)
// ห้าม fallback ไปใช้ secret เริ่มต้นใด ๆ — ถ้าไม่ได้ตั้งค่า server จะ throw ตอน startup
const JWT_SECRET: string = config.jwtSecret;

const DEFAULT_EXPIRES_IN = "12h";
const REMEMBER_ME_EXPIRES_IN = "7d";

export interface AuthTokenPayload {
  sub: string;
  employeeId: string;
  role: AppRole;
  /**
   * token version — ผูกกับ profiles.password_updated_at ของผู้ใช้ ณ ตอนออกโทเคน
   * ทุกครั้งที่ verify จะเทียบกับค่าใน DB สด ถ้าไม่ตรง (เช่นเปลี่ยนรหัสผ่านแล้ว) ถือว่า
   * โทเคนถูกยกเลิก → 401 ทำให้ session อื่น ๆ ที่ค้างอยู่ (รวมโทเคนที่ถูกขโมย) ใช้ไม่ได้ทันที
   */
  pv: string;
  /** token id สำหรับ audit/log (ไม่ได้ใช้ตรวจสิทธิ์) */
  jti?: string;
}

/**
 * แปลง profiles.password_updated_at ให้เป็นสตริงเวอร์ชันที่เทียบได้แน่นอน
 * (null = ยังไม่เคยเปลี่ยนรหัสผ่าน → "0")
 */
export function passwordTokenVersion(passwordUpdatedAt: string | null | undefined): string {
  if (!passwordUpdatedAt) return "0";
  const parsed = Date.parse(passwordUpdatedAt);
  return Number.isNaN(parsed) ? String(passwordUpdatedAt) : String(parsed);
}

export function signToken(payload: Omit<AuthTokenPayload, "jti">, rememberMe = false): string {
  return jwt.sign({ ...payload, jti: randomUUID() }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: rememberMe ? REMEMBER_ME_EXPIRES_IN : DEFAULT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  return decoded as unknown as AuthTokenPayload;
}
