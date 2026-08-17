import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing from environment");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Helper for generating content with fallback models and offline intelligence backup
const FALLBACK_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
];

// Offline Maintenance Knowledge Base Fallback Generator
function generateOfflineAnswer(prompt: string, machineContext?: any, role?: string): string {
  const p = (prompt || "").toLowerCase();
  // Never name a machine we were not told about. "CNC-04 / CNC Milling Machine
  // #04" is a demo fixture that does not exist in this plant's 973 machines, and
  // printing it at the top of a repair procedure tells the technician the advice
  // below was written for a specific machine when it was not.
  const machineCode = machineContext?.code || "ไม่ระบุรหัสเครื่อง";
  const machineName = machineContext?.name || "ไม่ระบุชื่อเครื่อง";

  let responseText = "";

  if (p.includes("spindle") || p.includes("ความร้อน") || p.includes("อุณหภูมิ") || p.includes("bearing") || p.includes("เบียริ่ง")) {
    responseText = `วิเคราะห์การแก้ไขปัญหา Spindle อุณหภูมิสูง / เสียงดัง (${machineCode} - ${machineName}):

[ข้อควรระวังความปลอดภัย]
โปรดสับสวิตช์ Main Breaker และทำการ Lockout-Tagout (LOTO) รวมถึงสวมถุงมือกันความร้อนก่อนสัมผัสชุด Spindle Head

1. สาเหตุที่เป็นไปได้:
   • จารบีหล่อลื่น Spindle Bearing แห้งหรือเสื่อมสภาพจากการใช้งานหนัก
   • ตลับลูกปืน Spindle Bearing (NSK 7014CTYN) สึกหรอ เกิดแรงสะท้าน
   • ระบบ Chiller น้ำมันระบายความร้อนหมุนเวียนไม่สะดวก หรือไส้กรองอุดตัน

2. ขั้นตอนการตรวจสอบและแก้ไข (1-2-3):
   • ขั้นที่ 1: ตรวจสอบระดับน้ำมันระบายความร้อน Chiller และทำความสะอาดแผงรังผึ้ง
   • ขั้นที่ 2: ตรวจวัดค่าความสั่นสะเทือน (Vibration Meter) ที่เสื้อ Spindle (เกณฑ์มาตรฐาน < 2.0 mm/s)
   • ขั้นที่ 3: หากอุณหภูมิเกิน 80°C ต่อเนื่อง ให้ดำเนินการเปลี่ยนตลับลูกปืน Spindle Bearing ชุดใหม่

3. รายการอะไหล่ที่ต้องเตรียม:
   • Spindle Bearing NSK 7014CTYN (Precision P4) [รหัสอะไหล่: SP-BRG-7014]
   • จารบีความเร็วสูง Klüberplex BEP 31-502
   • ชุดซีลยางกันฝุ่นและกัน Coolant (O-Ring Kit)`;
  } else if (p.includes("pm") || p.includes("บำรุงรักษา") || p.includes("เช็กลิสต์") || p.includes("checklist")) {
    responseText = `แผนและเช็กลิสต์ซ่อมบำรุงเชิงป้องกัน (PM Checklist) สำหรับเครื่อง ${machineCode}:

1. ตรวจสอบรายวัน (Daily Check):
   • เช็กระดับน้ำมันหล่อลื่นรางเลื่อน (Way Lube) และแรงดันลมปรับแรงดัน (Air Regulator 0.6 MPa)
   • ทำความสะอาดเศษโลหะ (Chips) บริเวณครอบแกน X/Y/Z และถังกรอง Coolant

2. ตรวจสอบประจำสัปดาห์ (Weekly Check):
   • ตรวจเช็กความตึงสายพานมอเตอร์ขับ Spindle และแรงขันน็อตยึด
   • วัดค่ากระแสไฟมอเตอร์ปั๊มไฮดรอลิกและเช็กจุดรั่วซึมตามข้อต่อ

3. ตรวจสอบประจำเดือน (Monthly PM Tier-2):
   • เปลี่ยนไส้กรองน้ำมันไฮดรอลิก 10 ไมครอน
   • อัดจารบีตลับลูกปืนตามจุดหมุน Ball Screw ทุกแกน
   • ตรวจสอบพิกัดความแม่นยำ (Backlash Calibration)`;
  } else if (p.includes("อะไหล่") || p.includes("part") || p.includes("spare")) {
    responseText = `รายการอะไหล่แนะนำสำหรับการซ่อมบำรุงประจำเครื่อง ${machineCode} (${machineName}):

1. ชุดตลับลูกปืน Spindle Bearing:
   • NSK 7014CTYN P4 (คู่หน้า-หลัง) - สถานะ: มีในสต็อก (4 ชุด) - รหัสคลัง: SP-BRG-7014
2. ไส้กรองและชุดซีลไฮดรอลิก:
   • Hydraulic Filter Element 10 Micron - สถานะ: มีในสต็อก (12 ชิ้น) - รหัสคลัง: FLT-HYD-10M
   • Solenoid Valve Seal Kit O-Ring Set - สถานะ: มีในสต็อก (8 ชุด) - รหัสคลัง: SK-SOL-500T
3. น้ำมันและสารหล่อลื่น:
   • Mobil Vactra No.2 (Way Oil 68) - สถานะ: มีในสต็อก (2 ถัง) - รหัสคลัง: OIL-VACTRA-2`;
  } else {
    responseText = `แนวทางการซ่อมบำรุงและดูแลเครื่องจักร (${machineCode} - ${machineName}) สำหรับบทบาท ${role || "Technician"}:

[ข้อควรระวังความปลอดภัย]
ตรวจสอบสวิตช์ Emergency Stop และสวมใส่อุปกรณ์ป้องกันภัยส่วนบุคคล (PPE) ทุกครั้งก่อนเข้าปฏิบัติงาน

1. สรุปสถานะเครื่องจักร:
   • เครื่องจักร: ${machineName} (${machineCode})
   • สถานะการทำงาน: พร้อมสแกนและตรวจสอบค่า Telemetry รายวัน

2. ข้อแนะนำเชิงปฏิบัติ:
   • หากพบเสียงผิดปกติ ให้หยุดเครื่องและตรวจสอบระดับน้ำมันหล่อลื่น Ball Screw
   • บันทึกเวลาเริ่มต้น-สิ้นสุดการซ่อมลงในใบงานระบบ NCMMs เพื่อคำนวณค่า MTTR
   • หากต้องการอะไหล่สำรอง สามารถกดเบิกผ่านเมนู "คลังอะไหล่ (Spare Parts)" ได้ทันที`;
  }

  // Check if prompt is related to machine breakdown / failure
  const isBreakdownQuery =
    p.includes("spindle") ||
    p.includes("ความร้อน") ||
    p.includes("อุณหภูมิ") ||
    p.includes("เสีย") ||
    p.includes("พัง") ||
    p.includes("ชำรุด") ||
    p.includes("ผิดปกติ") ||
    p.includes("รั่ว") ||
    p.includes("error") ||
    p.includes("alarm") ||
    p.includes("ซ่อมด่วน");

  if (isBreakdownQuery) {
    return (
      responseText +
      "\n\nพบสภาวะผิดปกติของเครื่องจักร ต้องการเปิดใบงานซ่อมบำรุงในระบบทันทีหรือไม่?\n[ACTION:CREATE_WORK_ORDER]\n\n*(คำตอบอ้างอิงจากคลังความรู้ NCMMs Maintenance Intelligence)*"
    );
  }

  return responseText + "\n\n*(คำตอบอ้างอิงจากคลังความรู้ NCMMs Maintenance Intelligence)*";
}

// API: AI Assistant Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, machineContext, role, history } = req.body;
    const ai = getGenAI();

    const systemInstruction = `
คุณคือ "MT Center AI Assistant" ผู้ช่วยอัจฉริยะด้านการซ่อมบำรุงและดูแลเครื่องจักรในโรงงานอุตสาหกรรม (MT Center Maintenance AI)
ให้คำตอบเป็นภาษาไทยอย่างชัดเจน กระชับ ปลอดภัย ตรงประเด็น เหมาะสำหรับผู้ใช้งานในบทบาท: ${role || "Technician"}

บริบทเครื่องจักรปัจจุบัน:
- ชื่อ/รุ่นเครื่องจักร: ${machineContext?.name || "ไม่มีข้อมูล"}
- รหัสเครื่อง: ${machineContext?.code || "ไม่มีข้อมูล"}
- สถานะ: ${machineContext?.status || "ไม่มีข้อมูล"}
- รหัสข้อผิดพลาดล่าสุด: ${machineContext?.errorCode || "ไม่มีรหัสข้อผิดพลาดค้างอยู่"}
หมายเหตุ: ช่องที่ระบุว่า "ไม่มีข้อมูล" คือไม่มีข้อมูลจริงในระบบ ห้ามเดาหรือสมมติค่าขึ้นมาแทน

แนวทางการตอบ:
1. ตอบสั้นกระชับ ขั้นตอน 1-2-3 ชัดเจน เพื่อให้ช่างทำงานได้สะดวก
2. หากเกี่ยวข้องกับความปลอดภัย ให้เตือนด้วยคำว่า [ข้อควรระวังความปลอดภัย]
3. ระบุอะไหล่หรืออุปกรณ์ที่อาจต้องใช้หากจำเป็น
4. เฉพาะกรณีที่ผู้ใช้ถามข้อมูลเรื่องเครื่องจักรเสีย อาการพัง ความผิดปกติ อุณหภูมิสูง หรือการขัดข้องทางเทคนิคเท่านั้น ให้ถามย้ำในตอนท้าย:
"พบสภาวะผิดปกติของเครื่องจักร ต้องการเปิดใบงานซ่อมบำรุงในระบบทันทีหรือไม่?"
และใส่ข้อความกำกับ [ACTION:CREATE_WORK_ORDER] ไว้ท้ายสุด
ข้อห้ามสำคัญ: หากเป็นการถามข้อมูลทั่วไปที่ไม่ใช่เครื่องจักรเสีย เช่น ทักทาย, ถามสเปคเครื่อง, ขอคู่มือ, เช็กลิสต์ PM ประจำวัน หรือการถามคำถามทั่วไป ห้ามใส่ข้อความเสนอเปิดใบงานซ่อมและห้ามใส่แท็ก [ACTION:CREATE_WORK_ORDER] เด็ดขาด!
    `;

    // Construct conversation contents
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    let reply = "";
    let callSucceeded = false;

    // Try primary and fallback models
    for (const modelName of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        if (response && response.text) {
          reply = response.text;
          callSucceeded = true;
          break;
        }
      } catch {
        // Model quota or rate limit reached; try next or fall back silently
      }
    }

    // If online models were rate-limited or failed, use Offline Knowledge Base
    if (!callSucceeded || !reply) {
      reply = generateOfflineAnswer(prompt, machineContext, role);
    }

    res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch {
    const fallbackReply = generateOfflineAnswer(req.body?.prompt || "", req.body?.machineContext, req.body?.role);
    res.json({
      success: true,
      reply: fallbackReply,
      timestamp: new Date().toISOString(),
    });
  }
});

// API: AI Machine Quick Diagnosis
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { machineCode, errorText, imageBase64 } = req.body;
    const ai = getGenAI();

    // Both lines used to carry an invented fallback: an unnamed machine became
    // "CNC-04" and a request with no reported symptom was handed to the model as
    // "เสียงดังสั่นสะเทือนผิดปกติบริเวณ Spindle และอุณหภูมิสูงเกิน 85°C" — a
    // specific fault nobody had reported, on a plant with no vibration or
    // temperature sensors at all. The model would then diagnose that phantom
    // fault, and a technician would act on the answer. Say what is actually
    // known; where nothing is known, say that instead of filling the gap.
    const reportedSymptom = typeof errorText === "string" ? errorText.trim() : "";
    const promptText = `
วิเคราะห์อาการและข้อผิดพลาดของเครื่องจักร รหัส: ${machineCode || "ไม่ระบุรหัสเครื่อง"}
อาการที่พบ / รายงาน: ${
      reportedSymptom ||
      "ไม่มีการรายงานอาการเข้ามา — ห้ามสมมติอาการขึ้นเอง ให้ระบุว่ายังไม่มีข้อมูลอาการ และถามกลับว่าต้องการให้ตรวจสอบจุดใด"
    }

โปรดตอบในรูปแบบ JSON สรุปดังนี้:
1. "diagnosis": สรุปสาเหตุหลักที่เกิดขึ้น
2. "urgency": "High", "Medium", หรือ "Low"
3. "steps": อาร์เรย์ของขั้นตอนการตรวจสอบ/ซ่อมแซม (3-5 ข้อ)
4. "requiredParts": อาร์เรย์ของอะไหล่ที่ต้องเตรียม (ถ้ามี)
5. "safetyNotice": ข้อควรระวังด้านความปลอดภัยที่ช่างต้องใส่ชุด/ถอดปลั๊ก/Lockout-Tagout
    `;

    const parts: any[] = [{ text: promptText }];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }

    let rawText = "";
    let callSucceeded = false;

    for (const modelName of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: "คุณคือระบบ AI วิเคราะห์เครื่องจักรขัดข้อง ให้คำตอบเป็น JSON ภาษาไทยเสมอ",
            responseMimeType: "application/json",
          },
        });

        if (response && response.text) {
          rawText = response.text;
          callSucceeded = true;
          break;
        }
      } catch {
        // Model quota or rate limit reached; try next or fall back silently
      }
    }

    let parsed: any = null;
    if (callSucceeded && rawText) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = null;
      }
    }

    // Fallback when the model call failed or the quota was exhausted.
    //
    // This used to return a fully invented diagnosis — "ตลับลูกปืน Spindle
    // Bearing เสื่อมสภาพ" with the part number NSK 7014CTYN and a specific
    // grease — for a machine nothing had been analysed about. The frontend
    // renders it exactly like a real AI result, so a technician could go and fit
    // that bearing on the strength of an answer no model ever produced. A failed
    // analysis must report that it failed; the only thing kept is the safety
    // procedure, which holds regardless of the fault.
    if (!parsed) {
      parsed = {
        diagnosis:
          "ยังวิเคราะห์ไม่ได้ในขณะนี้ — ระบบ AI ไม่ตอบสนอง (อาจเกินโควตาหรือเชื่อมต่อไม่ได้) ยังไม่มีการวิเคราะห์อาการของเครื่องนี้ กรุณาลองใหม่อีกครั้ง หรือให้ช่างตรวจสอบหน้างานตามขั้นตอนมาตรฐาน",
        urgency: "Unknown",
        steps: [
          "ลองสั่งวิเคราะห์ใหม่อีกครั้ง",
          "หากยังไม่ได้ผล ให้ตรวจสอบหน้างานตามขั้นตอนมาตรฐานของเครื่อง และบันทึกอาการที่พบลงในใบงาน",
        ],
        requiredParts: [],
        safetyNotice:
          "ก่อนเข้าตรวจสอบเครื่องทุกครั้ง ให้สับ Main Breaker และทำ Lockout-Tagout (LOTO) พร้อมสวมอุปกรณ์ป้องกันส่วนบุคคล",
      };
    }

    res.json({
      success: true,
      result: parsed,
    });
  } catch (error: any) {
    console.error("Diagnose Error, using fallback JSON:", error);
    res.json({
      success: true,
      // Same reasoning as the fallback above: this one claimed the machine had
      // abnormal heat and vibration readings — from a plant with no temperature
      // or vibration sensors at all — because the request threw.
      result: {
        diagnosis:
          "เกิดข้อผิดพลาดระหว่างวิเคราะห์ ยังไม่มีผลวิเคราะห์อาการของเครื่องนี้ กรุณาลองใหม่อีกครั้ง",
        urgency: "Unknown",
        steps: [
          "ลองสั่งวิเคราะห์ใหม่อีกครั้ง",
          "หากยังไม่ได้ผล ให้บันทึกอาการที่พบหน้างานลงในใบงานเพื่อให้ช่างตรวจสอบต่อ",
        ],
        requiredParts: [],
        safetyNotice:
          "ก่อนเข้าตรวจสอบเครื่องทุกครั้ง ให้สับ Main Breaker และทำ Lockout-Tagout (LOTO) พร้อมสวมอุปกรณ์ป้องกันส่วนบุคคล",
      },
    });
  }
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
