import type { Request } from "express";
import { passwordTokenVersion, verifyToken, type AuthTokenPayload } from "../lib/auth.js";
import { supabase } from "../lib/supabase.js";
import { ApiError, asyncHandler } from "./errorHandler.js";

/**
 * แกนกลางของการตรวจสิทธิ์ทั้งระบบ — middleware ทุกตัว (requireAuth / requireAuthenticated /
 * requireRole / requireSupervisor) เรียกใช้ฟังก์ชันนี้ที่เดียว เพื่อไม่ให้กฎความปลอดภัย
 * (token version, ผู้ใช้ถูกลบ, must_change_password) หลุดหายไปในเส้นทางใดเส้นทางหนึ่ง
 *
 * fail closed เสมอ:
 *  - ไม่มี/ผิดรูปแบบ/หมดอายุ token → 401
 *  - sub ไม่ตรงกับ profile ที่มีอยู่จริง (ผู้ใช้ถูกลบ) → 401
 *  - token version (pv) ไม่ตรงกับ password_updated_at ใน DB → 401 (โทเคนถูกยกเลิกแล้ว)
 *  - must_change_password = true → 403 + code PASSWORD_CHANGE_REQUIRED
 */

export const PASSWORD_CHANGE_REQUIRED_CODE = "PASSWORD_CHANGE_REQUIRED";
export const PASSWORD_CHANGE_REQUIRED_MESSAGE =
  "ต้องเปลี่ยนรหัสผ่านก่อนใช้งานระบบ กรุณาตั้งรหัสผ่านใหม่ที่หน้าเปลี่ยนรหัสผ่าน";

export interface AuthenticatedProfile {
  id: string;
  role: string;
  mustChangePassword: boolean;
  passwordUpdatedAt: string | null;
}

// local interfaces สำหรับ cast req (ไม่แก้ global Express types)
export interface RequestWithAuth extends Request {
  auth?: AuthTokenPayload;
}

export function extractBearerToken(req: {
  header(name: string): string | undefined;
}): string | null {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

interface ProfileAuthLookupRow {
  id: string;
  role: string;
  must_change_password: boolean | null;
  password_updated_at: string | null;
}

export interface AuthenticateOptions {
  /**
   * ปิดการบังคับเปลี่ยนรหัสผ่านได้เฉพาะ endpoint ที่จำเป็นต้องเข้าถึงได้ระหว่างถูกบังคับ
   * เท่านั้น (GET /api/auth/me และ POST /api/auth/change-password) ห้ามใช้ที่อื่น
   */
  enforcePasswordChange?: boolean;
}

export async function authenticateRequest(
  req: { header(name: string): string | undefined },
  options: AuthenticateOptions = {}
): Promise<{ payload: AuthTokenPayload; profile: AuthenticatedProfile }> {
  const enforcePasswordChange = options.enforcePasswordChange !== false;

  const token = extractBearerToken(req);
  if (!token) {
    throw new ApiError(401, "ไม่พบโทเคนสำหรับเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
  }

  let payload: AuthTokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "โทเคนไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  // อ่าน role / สถานะรหัสผ่านสดจาก DB เสมอ ไม่เชื่อค่าที่ฝังใน token
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, must_change_password, password_updated_at")
    .eq("id", payload.sub)
    .maybeSingle();
  if (error) throw new ApiError(500, error.message);

  const row = data as ProfileAuthLookupRow | null;
  if (!row) {
    // ผู้ใช้ถูกลบ/ปิดบัญชีไปแล้ว แต่โทเคนยังไม่หมดอายุ → ต้องไม่ผ่าน
    throw new ApiError(401, "ไม่พบบัญชีผู้ใช้ของโทเคนนี้ กรุณาเข้าสู่ระบบใหม่");
  }

  if (passwordTokenVersion(row.password_updated_at) !== String(payload.pv ?? "")) {
    throw new ApiError(401, "โทเคนนี้ถูกยกเลิกแล้วเนื่องจากมีการเปลี่ยนรหัสผ่าน กรุณาเข้าสู่ระบบใหม่");
  }

  const profile: AuthenticatedProfile = {
    id: row.id,
    role: row.role,
    mustChangePassword: Boolean(row.must_change_password),
    passwordUpdatedAt: row.password_updated_at,
  };

  if (enforcePasswordChange && profile.mustChangePassword) {
    throw new ApiError(403, PASSWORD_CHANGE_REQUIRED_MESSAGE, PASSWORD_CHANGE_REQUIRED_CODE);
  }

  return { payload, profile };
}

function attach(req: Request, payload: AuthTokenPayload, profile: AuthenticatedProfile): void {
  (req as RequestWithAuth).auth = payload;
  // ใช้ shape เดิมของ RequestWithProfile (id, role) เพื่อไม่กระทบ handler ที่มีอยู่
  (req as Request & { profile?: { id: string; role: string } }).profile = {
    id: profile.id,
    role: profile.role,
  };
}

/**
 * Middleware ตรวจสิทธิ์มาตรฐาน — ต้อง login แล้ว, บัญชียังอยู่, โทเคนยังไม่ถูกยกเลิก
 * และต้องเปลี่ยนรหัสผ่านเริ่มต้นแล้ว ใช้เป็น router-level guard ของทุก /api/* (ยกเว้น /api/auth)
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const { payload, profile } = await authenticateRequest(req);
  attach(req, payload, profile);
  next();
});

/**
 * เหมือน authenticate แต่ยอมให้ผู้ใช้ที่ยังต้องเปลี่ยนรหัสผ่านผ่านได้
 * ใช้เฉพาะ GET /api/auth/me และ POST /api/auth/change-password เท่านั้น
 */
export const authenticateAllowPasswordChange = asyncHandler(async (req, _res, next) => {
  const { payload, profile } = await authenticateRequest(req, { enforcePasswordChange: false });
  attach(req, payload, profile);
  next();
});
