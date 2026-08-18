import bcrypt from "bcryptjs";
import { Router } from "express";
import { passwordTokenVersion, signToken } from "../lib/auth.js";
import { supabase } from "../lib/supabase.js";
import { mapProfile, type ProfileRow } from "../lib/mappers.js";
import { ApiError, asyncHandler, sendSuccess } from "../middleware/errorHandler.js";
import {
  loginRateLimitByEmployeeId,
  loginRateLimitByIp,
} from "../middleware/loginRateLimit.js";
import { requireAuthAllowPasswordChange, type RequestWithAuth } from "../middleware/requireAuth.js";

const router = Router();

type ProfileAuthRow = ProfileRow & {
  password_hash: string | null;
  must_change_password: boolean | null;
  password_updated_at: string | null;
};

/**
 * คอลัมน์ที่ดึงจาก profiles อย่างชัดเจน (ห้ามใช้ select("*") เพราะจะลาก password_hash
 * ติดมาทั้งแถว — วันหนึ่งถ้ามีใครเผลอ sendSuccess(res, profile) hash จะรั่วออกไปทันที)
 */
const PROFILE_PUBLIC_COLUMNS =
  "id, employee_id, name, initials, role, department, avatar_url, must_change_password, password_updated_at";
const PROFILE_LOGIN_COLUMNS = `${PROFILE_PUBLIC_COLUMNS}, password_hash`;

const INVALID_CREDENTIALS_MESSAGE = "รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง";

/**
 * hash หลอกสำหรับ "เผาเวลา" ให้เท่ากับกรณีรหัสผ่านถูก/ผิด
 *
 * ถ้าไม่มีบรรทัดนี้ กรณีไม่พบรหัสพนักงาน (หรือบัญชียังไม่ได้ seed รหัสผ่าน) จะตอบกลับทันที
 * ขณะที่รหัสพนักงานที่มีจริงต้องรอ bcrypt ~50–100ms — ต่างกันพอให้ผู้โจมตีไล่หา
 * รหัสพนักงานที่มีอยู่จริงได้จากเวลา (user enumeration) จึงบังคับให้ทุกเส้นทางจ่าย
 * bcrypt.compare หนึ่งรอบเท่ากันเสมอ
 */
const DUMMY_PASSWORD_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8FdMKDMkKCkKMKF6nJQKY9x1cKqQ7u";

async function burnPasswordCompareTime(password: string): Promise<void> {
  try {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
  } catch {
    // ไม่สนใจผล — จุดประสงค์คือใช้เวลาให้เท่ากันเท่านั้น
  }
}

router.post(
  "/login",
  loginRateLimitByIp,
  loginRateLimitByEmployeeId,
  asyncHandler(async (req, res) => {
    const { employeeId, password } = (req.body ?? {}) as {
      employeeId?: string;
      password?: string;
    };

    if (!employeeId || !password) {
      throw new ApiError(400, "กรุณากรอกรหัสพนักงานและรหัสผ่าน");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_LOGIN_COLUMNS)
      .eq("employee_id", employeeId)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);

    const profile = data as ProfileAuthRow | null;
    if (!profile || !profile.password_hash) {
      if (profile && !profile.password_hash) {
        // log ฝั่ง server เท่านั้น เพื่อให้ ops วินิจฉัยได้ว่า "บัญชีนี้ยังไม่ได้ seed รหัสผ่าน"
        // ไม่ใช่ "กรอกรหัสผ่านผิด" — response ที่ส่งกลับต้องเหมือนกันทุก byte กับเส้นทางอื่น
        // (ห้ามบอก client ว่าบัญชีมีอยู่จริง เพราะนั่นคือ enumeration oracle)
        console.warn(
          `[auth] login attempt for employee_id=${employeeId} but password_hash is NULL — run "npm run seed:passwords"`
        );
      }
      // จ่ายเวลา bcrypt เท่ากับเส้นทางปกติก่อนตอบ error กลาง ๆ (กัน timing enumeration)
      await burnPasswordCompareTime(password);
      throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await bcrypt.compare(password, profile.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const token = signToken({
      sub: profile.id,
      employeeId: profile.employee_id,
      role: profile.role as "technician" | "engineer" | "supervisor",
      pv: passwordTokenVersion(profile.password_updated_at),
    });

    sendSuccess(res, {
      token,
      user: mapProfile(profile),
      mustChangePassword: Boolean(profile.must_change_password),
    });
  })
);

router.get(
  "/me",
  // ต้องเข้าถึงได้แม้ยังต้องเปลี่ยนรหัสผ่าน เพื่อให้ client รู้สถานะของตัวเอง
  requireAuthAllowPasswordChange,
  asyncHandler(async (req, res) => {
    const auth = (req as RequestWithAuth).auth!;

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_PUBLIC_COLUMNS)
      .eq("id", auth.sub)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);

    const profile = data as ProfileAuthRow | null;
    if (!profile) {
      throw new ApiError(404, "ไม่พบข้อมูลผู้ใช้งานนี้");
    }

    sendSuccess(res, {
      user: mapProfile(profile),
      mustChangePassword: Boolean(profile.must_change_password),
    });
  })
);

router.post(
  "/change-password",
  // ต้องเข้าถึงได้แม้ยังต้องเปลี่ยนรหัสผ่าน — นี่คือทางเดียวที่จะปลดล็อกบัญชีได้
  requireAuthAllowPasswordChange,
  asyncHandler(async (req, res) => {
    const auth = (req as RequestWithAuth).auth!;
    const { currentPassword, newPassword } = (req.body ?? {}) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่");
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, employee_id, role, password_hash")
      .eq("id", auth.sub)
      .maybeSingle();
    if (error) throw new ApiError(500, error.message);

    const profile = data as {
      id: string;
      employee_id: string;
      role: string;
      password_hash: string | null;
    } | null;
    if (!profile || !profile.password_hash) {
      await burnPasswordCompareTime(currentPassword);
      throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const currentMatches = await bcrypt.compare(currentPassword, profile.password_hash);
    if (!currentMatches) {
      throw new ApiError(401, INVALID_CREDENTIALS_MESSAGE);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const passwordUpdatedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        password_hash: newHash,
        must_change_password: false,
        password_updated_at: passwordUpdatedAt,
      })
      .eq("id", auth.sub);
    if (updateError) throw new ApiError(500, updateError.message);

    // การอัปเดต password_updated_at ทำให้โทเคนเดิม "ทุกใบ" (รวมใบที่ถูกขโมย) ใช้ไม่ได้ทันที
    // จึงออกโทเคนใหม่ให้ session ปัจจุบันใช้ต่อ เพื่อไม่ต้องบังคับ login ใหม่
    const token = signToken({
      sub: profile.id,
      employeeId: profile.employee_id,
      role: profile.role as "technician" | "engineer" | "supervisor",
      pv: passwordTokenVersion(passwordUpdatedAt),
    });

    sendSuccess(res, { ok: true, token });
  })
);

export default router;
