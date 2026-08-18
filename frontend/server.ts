import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Manual admin proxy — injects the shared secret server-side so it
// never reaches the browser bundle (see frontend/.env.example). The backend
// base URL follows the same convention apiService.ts already uses.
const MANUALS_BACKEND_BASE = process.env.VITE_API_URL || "http://localhost:4000";

function sendManualSecretMissing(res: express.Response) {
  res.status(503).json({
    success: false,
    error: {
      message:
        "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า MANUAL_ADMIN_SECRET กรุณาให้ผู้ดูแลระบบตั้งค่าตัวแปรนี้ก่อนใช้งานคลังคู่มือ",
    },
  });
}

async function proxyManualAdminRequest(
  req: express.Request,
  res: express.Response,
  backendPath: string,
  method: "POST" | "PATCH" | "DELETE"
) {
  const secret = process.env.MANUAL_ADMIN_SECRET;
  if (!secret) {
    sendManualSecretMissing(res);
    return;
  }

  try {
    const backendRes = await fetch(`${MANUALS_BACKEND_BASE}${backendPath}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-manual-admin-secret": secret,
      },
      body: method === "DELETE" ? undefined : JSON.stringify(req.body ?? {}),
    });

    let data: unknown;
    try {
      data = await backendRes.json();
    } catch {
      data = {
        success: false,
        error: { message: `เซิร์ฟเวอร์คลังคู่มือตอบกลับไม่ถูกต้อง (HTTP ${backendRes.status})` },
      };
    }

    res.status(backendRes.status).json(data);
  } catch {
    res.status(502).json({
      success: false,
      error: { message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์คลังคู่มือได้ กรุณาลองใหม่อีกครั้ง" },
    });
  }
}

// Exact path only — must not swallow POST /api/manuals/upload-url, which
// stays unauthenticated and goes straight to the backend from the browser.
app.post("/api/manuals", (req, res) => {
  void proxyManualAdminRequest(req, res, "/api/manuals", "POST");
});

app.patch("/api/manuals/:id", (req, res) => {
  void proxyManualAdminRequest(req, res, `/api/manuals/${encodeURIComponent(req.params.id)}`, "PATCH");
});

app.delete("/api/manuals/:id", (req, res) => {
  void proxyManualAdminRequest(req, res, `/api/manuals/${encodeURIComponent(req.params.id)}`, "DELETE");
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NCMMs AI Assistant Server running on http://localhost:${PORT}`);
  });
}

startServer();
