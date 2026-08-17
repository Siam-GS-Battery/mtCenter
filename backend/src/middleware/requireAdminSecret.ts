import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { ApiError } from "./errorHandler.js";

const SECRET_HEADER = "x-manual-admin-secret";

// stopgap ก่อนมีระบบยืนยันตัวตนจริง: กันไม่ให้ผู้เรียกที่ไม่รู้ค่า secret ยิง
// create/edit/delete คู่มือได้ ไม่ใช่การพิสูจน์ตัวตนผู้ใช้ และไม่รู้ว่า "ใคร" เป็นคนทำ
export function requireAdminSecret(req: Request, _res: Response, next: NextFunction): void {
  // fail closed เสมอ: ถ้ายังไม่ตั้งค่า secret ไว้ ต้องปฏิเสธ request ไม่ใช่ปล่อยผ่าน
  if (!config.manualAdminSecret) {
    throw new ApiError(
      503,
      "การแก้ไขคลังคู่มือยังไม่ได้ตั้งค่ารหัสยืนยัน กรุณาตั้งค่า MANUAL_ADMIN_SECRET"
    );
  }

  const provided = req.header(SECRET_HEADER);

  if (!provided || !secretsMatch(provided, config.manualAdminSecret)) {
    throw new ApiError(403, "ไม่มีสิทธิ์แก้ไขคลังคู่มือ");
  }

  next();
}

function secretsMatch(provided: string, expected: string): boolean {
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  // timingSafeEqual throws on length mismatch, ต้องเช็คก่อนเสมอ
  if (providedBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(providedBuf, expectedBuf);
}
