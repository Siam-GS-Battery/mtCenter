import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { supabase } from "./lib/supabase.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import machinesRouter from "./routes/machines.js";
import workOrdersRouter from "./routes/workOrders.js";
import sparePartsRouter from "./routes/spareParts.js";
import manualsRouter from "./routes/manuals.js";
import aiRouter from "./routes/ai.js";
import aiHealthRouter from "./routes/aiHealth.js";
import pmPlansRouter from "./routes/pmPlans.js";
import partWithdrawalsRouter from "./routes/partWithdrawals.js";
import knowledgeRouter from "./routes/knowledge.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigins,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } });
});

// --- public routes: เฉพาะ /api/health (ด้านบน) และ /api/auth เท่านั้น ---
app.use("/api/auth", authRouter);

/**
 * Router-level auth guard — ทุก /api/* ที่เหลือต้องมีโทเคนที่ใช้งานได้
 *
 * เดิม endpoint อ่านข้อมูล (เครื่องจักร, ใบงาน, แผน PM, อะไหล่, การเบิกอะไหล่, คู่มือ
 * รวมถึงการดาวน์โหลดไฟล์คู่มือ) เปิดให้เรียกได้โดยไม่ต้อง login เพราะใส่ middleware
 * เฉพาะ handler ที่เป็นการเขียนข้อมูล การกันที่ระดับ router แบบนี้ทำให้ endpoint ใหม่
 * ที่เพิ่มเข้ามาในอนาคต "ปลอดภัยโดยปริยาย" ไม่ต้องหวังว่าจะมีคนจำใส่ middleware ทีละจุด
 * (middleware ที่ handler มีอยู่แล้ว เช่น requireRole/requireSupervisor ยังทำงานซ้อนต่อไป
 * เพื่อคุม role ตามเดิม)
 *
 * authenticate ยังบังคับเรื่อง must_change_password ด้วย: ผู้ใช้ที่ยังไม่เปลี่ยนรหัสผ่าน
 * เริ่มต้นจะถูกปฏิเสธด้วย 403 + code PASSWORD_CHANGE_REQUIRED ทุก endpoint ที่นี่
 */
app.use("/api", authenticate);

app.use("/api/users", usersRouter);
app.use("/api/machines", machinesRouter);
app.use("/api/work-orders", workOrdersRouter);
app.use("/api/spare-parts", sparePartsRouter);
app.use("/api/manuals", manualsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/ai-health", aiHealthRouter);
app.use("/api/pm-plans", pmPlansRouter);
app.use("/api/part-withdrawals", partWithdrawalsRouter);
app.use("/api/knowledge", knowledgeRouter);

const staticDir = process.env.STATIC_DIR || path.resolve(process.cwd(), "public");
const staticDirExists = fs.existsSync(staticDir);

if (staticDirExists) {
  app.use(express.static(staticDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: "Route not found" } });
});

app.use(errorHandler);

/**
 * แจ้งเตือนตอน startup ถ้ายังมีบัญชีที่ไม่มีรหัสผ่าน (password_hash IS NULL)
 *
 * เหตุผล: ถ้า seed-passwords ยังไม่ได้รัน บัญชีเหล่านั้นจะ login ไม่ได้เลย และ API
 * จะตอบเป็น error กลาง ๆ เหมือนกรอกรหัสผ่านผิด (เจตนา — ไม่บอก client ว่าบัญชีไหน
 * ยังไม่ได้ seed เพราะจะกลายเป็น enumeration oracle) การเตือนที่ log ฝั่ง server
 * จึงเป็นทางที่ให้ ops รู้ปัญหาโดยไม่เปิดช่องให้ผู้โจมตี
 *
 * ต้องไม่ทำให้ startup ล้มเหลวเด็ดขาด: ถ้า query ล้ม (DB ล่ม หรือยังไม่ได้ apply
 * migration 0021) ให้แค่ log แล้วเดินหน้าต่อ และ log เฉพาะ "จำนวน" ไม่ log รหัสพนักงาน
 */
async function warnIfAccountsHaveNoPassword(): Promise<void> {
  try {
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("password_hash", null);
    if (error) {
      // head-count query ไม่มี response body ทำให้ Supabase มักคืน error.message ว่าง
      // (สาเหตุที่พบบ่อยที่สุดคือยังไม่ได้ apply migration 0021) จึงใส่คำใบ้ไว้ในข้อความเลย
      const detail = error.message || error.details || error.code || "ไม่มีรายละเอียดจาก Supabase";
      console.warn(
        `[auth] ไม่สามารถตรวจสอบบัญชีที่ยังไม่มีรหัสผ่านได้: ${detail} ` +
          `(ตรวจว่า migration 0021_auth_password.sql ถูก apply แล้วหรือยัง) — server ทำงานต่อตามปกติ`
      );
      return;
    }
    if ((count ?? 0) > 0) {
      console.warn(`⚠ ${count} บัญชียังไม่มีรหัสผ่าน — รัน npm run seed:passwords`);
    }
  } catch (err) {
    console.warn(
      `[auth] ไม่สามารถตรวจสอบบัญชีที่ยังไม่มีรหัสผ่านได้: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

app.listen(config.port, "0.0.0.0", () => {
  console.log(`mtcenter-backend listening on http://0.0.0.0:${config.port}`);
  // ตั้งใจไม่ await — การเตือนต้องไม่หน่วง/ขวางการรับ request
  void warnIfAccountsHaveNoPassword();
});
