// ข้อมูลจำลอง (mock/demo) สำหรับ "สรุปโดย AI" ของรายงานตรวจสายการผลิตหนึ่งรอบ
//
// เนื้อหาทั้งหมดคำนวณจากตัวเลขจริงของ `InspectionReport` (alertCount/watchCount/
// okCount, findings ที่หนักที่สุด, สรุปตามโซน, เวลาที่ใช้ ฯลฯ) แล้วเรียบเรียงเป็น
// ภาษาไทยแบบที่ "อ่านคล้าย AI ตีความรอบนี้จริงๆ" — ไม่ใช่ข้อความคงที่/ทั่วไป
//
// ค่าที่มีความแปรผันของถ้อยคำ (headline/highlight ที่เลือกจากหลายรูปแบบ) ถูกสุ่ม
// แบบ deterministic จาก `report.id` ผ่าน seeded PRNG (hashString + mulberry32 —
// รูปแบบเดียวกับ `machineMetricsMock.ts`) รายงานฉบับเดิมจึงได้สรุปฉบับเดิมเสมอ
// ไม่มีการกระพริบของข้อความเมื่อ re-render
//
// ใช้สำหรับหน้าตัวอย่าง/สาธิต (demo) เท่านั้น เมื่อ backend มี endpoint จริงสำหรับ
// ให้โมเดลสรุปรอบตรวจแล้ว (ดูแนวทางที่ `reportToPrompt` เตรียมไว้) ให้เปลี่ยนมา
// เรียก `POST /api/ai/chat` (ดู `backend/src/routes/ai.ts`) แทนไฟล์นี้

import type { InspectionFinding, InspectionReport } from "./inspectionAgent";

/* ---------------------------------------------------------------- */
/* Seeded PRNG (รูปแบบเดียวกับ machineMetricsMock.ts)                  */
/* ---------------------------------------------------------------- */

/** แปลง string เป็นตัวเลข 32-bit สำหรับใช้เป็น seed (djb2-ish hash) */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: PRNG ขนาดเล็ก กำหนดผลลัพธ์ได้แน่นอนจาก seed เดียวกัน */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** เลือกสมาชิกหนึ่งตัวจากอาร์เรย์แบบ deterministic ผ่าน rng ที่ให้มา */
function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function fmt(value: number, digits = 1): string {
  return value.toFixed(digits);
}

/* ---------------------------------------------------------------- */
/* ประเภทข้อมูล (contract)                                            */
/* ---------------------------------------------------------------- */

export interface RoundAiRisk {
  label: string;
  detail: string;
  severity: "alert" | "watch" | "info";
}

export interface RoundAiSummary {
  /** หนึ่งประโยคเด่น สรุปใจความของรอบนี้ */
  headline: string;
  /** ข้อสังเกต 2-4 ข้อ */
  highlights: string[];
  /** จุดเสี่ยงที่ AI หยิบขึ้นมาเน้น (ว่างได้เมื่อรอบนี้ไม่มีอะไรผิดปกติ) */
  risks: RoundAiRisk[];
  /** สิ่งที่ควรทำต่อ 2-4 ข้อ */
  nextActions: string[];
  /** 0-1 ความมั่นใจของ AI (จำลอง) */
  confidence: number;
  /** เวลาที่ "สรุปเสร็จ" (ISO) */
  generatedAt: string;
}

/* ---------------------------------------------------------------- */
/* ตัวช่วยอ่านความหนักของรอบ                                          */
/* ---------------------------------------------------------------- */

function worstFindings(report: InspectionReport, count: number): InspectionFinding[] {
  // findings ใน report เรียง alert ก่อน watch อยู่แล้ว (ดู buildReport) — ตัดตามจำนวนที่ขอ
  return report.findings.slice(0, count);
}

function findingLine(f: InspectionFinding): string {
  return `${f.machineCode} (${f.zoneLabel}) — ${fmt(f.tempC)}°C, ${fmt(f.vibration, 2)} mm/s`;
}

/* ---------------------------------------------------------------- */
/* หัวข้อ (headline)                                                  */
/* ---------------------------------------------------------------- */

function buildHeadline(report: InspectionReport, rng: () => number): string {
  if (report.alertCount > 0) {
    const worst = worstFindings(report, 1)[0];
    const templates = [
      `รอบนี้ต้องรีบดู ${worst?.machineCode ?? "เครื่องที่แจ้งเตือน"} ก่อน — เป็นจุดที่เสี่ยงสุดจาก ${report.alertCount} เครื่องที่ต้องเข้าตรวจ`,
      `พบความผิดปกติชัดเจนใน ${report.alertCount} เครื่อง โดยเฉพาะ ${worst?.machineCode ?? ""} ที่ค่าออกนอกเกณฑ์มากที่สุด`,
      `ไม่ควรปล่อยผ่าน: ${report.alertCount} เครื่องเข้าเกณฑ์ต้องเข้าตรวจทันที นำโดย ${worst?.machineCode ?? ""}`,
    ];
    return pick(rng, templates);
  }
  if (report.watchCount > 0) {
    const templates = [
      `ภาพรวมยังคุมได้ แต่มี ${report.watchCount} เครื่องเริ่มส่งสัญญาณที่ควรจับตา`,
      `ยังไม่ถึงขั้นวิกฤต แต่ ${report.watchCount} เครื่องเข้าเขตเฝ้าระวัง ควรวางแผนตรวจซ้ำ`,
      `รอบนี้ไม่มีจุดหยุดฉุกเฉิน ทว่ามีแนวโน้มที่ควรติดตามใน ${report.watchCount} เครื่อง`,
    ];
    return pick(rng, templates);
  }
  const templates = [
    `รอบนี้สะอาดหมดจด ทุกจุดที่ตรวจอยู่ในเกณฑ์ปกติ ไม่มีสัญญาณผิดปกติให้ต้องกังวล`,
    `ผลตรวจออกมาดี — ${report.checked} จุดผ่านเกณฑ์ทั้งหมด สายการผลิตเดินหน้าได้ตามปกติ`,
    `ไม่พบความเสี่ยงในรอบนี้ ข้อมูลอุณหภูมิและความสั่นทุกจุดอยู่ในช่วงที่ยอมรับได้`,
  ];
  return pick(rng, templates);
}

/* ---------------------------------------------------------------- */
/* ข้อสังเกต (highlights)                                             */
/* ---------------------------------------------------------------- */

function buildHighlights(report: InspectionReport, rng: () => number): string[] {
  const lines: string[] = [];

  lines.push(
    `ตรวจครบ ${report.checked} จุด จากเครื่องจักรทั้งหมด ${report.totalMachines} เครื่อง ใช้เวลาเดินตรวจประมาณ ${Math.max(
      1,
      Math.round(report.durationSec / 60)
    )} นาที`
  );

  if (report.zones.length > 0) {
    const worstZone = report.zones[0];
    if (worstZone.alert > 0 || worstZone.watch > 0) {
      lines.push(
        `โซนที่น่าเป็นห่วงที่สุดคือ "${worstZone.label}" — ${worstZone.alert > 0 ? `${worstZone.alert} เครื่องต้องเข้าตรวจ` : ""}${
          worstZone.alert > 0 && worstZone.watch > 0 ? " และ " : ""
        }${worstZone.watch > 0 ? `${worstZone.watch} เครื่องเฝ้าระวัง` : ""}`
      );
    } else {
      lines.push(`ทุกโซนที่ตรวจในรอบนี้อยู่ในเกณฑ์ปกติ ไม่มีโซนใดโดดเด่นด้านความเสี่ยง`);
    }
  }

  const hot = report.findings.filter((f) => f.tempC >= 60);
  if (hot.length > 0) {
    lines.push(
      `พบ ${hot.length} เครื่องที่อุณหภูมิสปินเดิลสูงผิดสังเกต เด่นสุดคือ ${findingLine(hot[0])}`
    );
  }

  const shaky = report.findings.filter((f) => f.vibration >= 4.5);
  if (shaky.length > 0) {
    lines.push(`ค่าความสั่นหลุดเกณฑ์ใน ${shaky.length} เครื่อง อาจเป็นสัญญาณแบริ่งหรือความไม่สมดุลของโรเตอร์`);
  }

  const lowHealth = report.findings.filter((f) => f.healthScore !== null && f.healthScore < 60);
  if (lowHealth.length > 0) {
    lines.push(`มี ${lowHealth.length} เครื่องที่คะแนนสุขภาพเครื่อง (health score) ต่ำกว่า 60 ควรอยู่ในคิวบำรุงรักษาเชิงป้องกันรอบถัดไป`);
  }

  if (report.alertCount === 0 && report.watchCount === 0) {
    const filler = [
      `แนวโน้มค่าที่บันทึกไว้ในรอบนี้ยังคงตัว ไม่มีสัญญาณเบี่ยงเบนที่ชวนกังวล`,
      `เทียบกับเกณฑ์ ISO 10816-3 และขีดจำกัดอุณหภูมิสปินเดิลแล้ว ทุกจุดยังมีระยะห่างที่ปลอดภัย`,
    ];
    lines.push(pick(rng, filler));
  }

  return lines.slice(0, 4);
}

/* ---------------------------------------------------------------- */
/* จุดเสี่ยง (risks)                                                  */
/* ---------------------------------------------------------------- */

function buildRisks(report: InspectionReport): RoundAiRisk[] {
  const risks: RoundAiRisk[] = [];

  for (const f of worstFindings(report, 3)) {
    risks.push({
      label: `${f.machineCode} · ${f.zoneLabel}`,
      detail:
        f.notes[0] ??
        (f.severity === "alert" ? "พบความผิดปกติที่ต้องเข้าตรวจ" : "ค่าที่วัดได้เข้าเขตเฝ้าระวัง"),
      severity: f.severity === "alert" ? "alert" : "watch",
    });
  }

  if (risks.length === 0) {
    risks.push({
      label: "ไม่มีจุดเสี่ยงเด่น",
      detail: "รอบตรวจนี้ไม่พบเครื่องจักรที่เข้าเกณฑ์เฝ้าระวังหรือแจ้งเตือน",
      severity: "info",
    });
  }

  return risks;
}

/* ---------------------------------------------------------------- */
/* ขั้นถัดไป (next actions)                                           */
/* ---------------------------------------------------------------- */

function buildNextActions(report: InspectionReport, rng: () => number): string[] {
  // ใช้ recommendations จริงของรายงานเป็นฐาน (คำนวณจากตัวเลขจริงอยู่แล้ว)
  // แล้วเสริมมุมมอง "AI" เพิ่มอีก 1 ข้อให้ต่างจากของหุ่นยนต์ตรงๆ
  const actions = [...report.recommendations];

  if (report.alertCount > 0) {
    actions.push("แจ้งหัวหน้าไลน์และทีมซ่อมบำรุงให้รับทราบก่อนเริ่มกะถัดไป");
  } else if (report.watchCount > 0) {
    const templates = [
      "ตั้งรอบตรวจซ้ำถี่ขึ้นสำหรับเครื่องที่เฝ้าระวัง เพื่อดูแนวโน้มก่อนลุกลาม",
      "บันทึกเครื่องที่เฝ้าระวังไว้ในรายการติดตามของกะถัดไป",
    ];
    actions.push(pick(rng, templates));
  }
  // รอบที่สะอาดหมดจด (alertCount และ watchCount เป็น 0) ไม่ต้องเสริมข้อความ
  // เพิ่ม — report.recommendations มีข้อความ "ไม่มีรายการที่ต้องดำเนินการ..."
  // อยู่แล้ว การเสริมอีกข้อความจะซ้ำความหมายเดิมโดยไม่ให้ข้อมูลใหม่

  return [...new Set(actions)].slice(0, 4);
}

/* ---------------------------------------------------------------- */
/* ความมั่นใจ (confidence)                                            */
/* ---------------------------------------------------------------- */

function buildConfidence(report: InspectionReport, rng: () => number): number {
  // ยิ่งตรวจได้ครอบคลุมเทียบกับเครื่องทั้งหมด และยิ่งมีจุดข้อมูล (notes) มาก
  // ยิ่งดันความมั่นใจจำลองขึ้น — แต่คงสุ่มเล็กน้อยให้ดูเป็นธรรมชาติ ไม่ใช่สูตรตายตัว
  const coverage = report.totalMachines > 0 ? report.checked / report.totalMachines : 1;
  const base = 0.72 + coverage * 0.18;
  const jitter = (rng() - 0.5) * 0.08;
  return Math.min(0.97, Math.max(0.55, Math.round((base + jitter) * 100) / 100));
}

/* ---------------------------------------------------------------- */
/* API หลัก                                                           */
/* ---------------------------------------------------------------- */

/** สร้างสรุป AI จำลองจากรายงานตรวจรอบหนึ่ง (deterministic ตาม report.id) */
export function buildRoundAiSummaryMock(report: InspectionReport): RoundAiSummary {
  const rng = mulberry32(hashString(report.id + "::ai-summary"));

  return {
    headline: buildHeadline(report, rng),
    highlights: buildHighlights(report, rng),
    risks: buildRisks(report),
    nextActions: buildNextActions(report, rng),
    confidence: buildConfidence(report, rng),
    generatedAt: new Date().toISOString(),
  };
}

/** คำเรียกระดับความรุนแรงของจุดเสี่ยง เป็นภาษาไทย (สำหรับ markdown) */
const RISK_SEVERITY_LABEL: Record<RoundAiRisk["severity"], string> = {
  alert: "ต้องเข้าตรวจ",
  watch: "เฝ้าระวัง",
  info: "ข้อมูล",
};

/**
 * แปลงสรุป AI จำลองเป็น markdown สำหรับแสดงในฟองแชต (AI Assistant)
 *
 * โครงสร้าง: หัวข้อเด่น → ข้อสังเกต → จุดเสี่ยง (พร้อมระดับความรุนแรง) →
 * สิ่งที่ควรทำต่อ → ความมั่นใจ → บรรทัดปิดท้ายบอกว่าเป็นข้อมูลจำลอง (กันสับสนว่า
 * เป็นคำตอบจากโมเดลจริง)
 *
 * ระดับความรุนแรงของแต่ละจุดเสี่ยงใช้ label ตัวหนาในวงเล็บเหลี่ยม (เช่น
 * "**[ต้องเข้าตรวจ]**") แทนอีโมจิสี (เดิมใช้ 🔴/🟡/⚪) — markdown นี้ผ่าน
 * `formatChatMarkdown`/`stripPictographs` (ดู `aiActions.ts`) ก่อนแสดงในฟองแชต
 * ฝั่ง sidebar ซึ่งจงใจลบพิกโตกราฟ/อีโมจิทุกตัวทิ้ง อีโมจิสีจึงหายไปเงียบๆ ถ้าใช้
 * ส่วนวงเล็บเหลี่ยม ตัวหนา (markdown ASCII) และข้อความไทยธรรมดา ไม่ตรงกับช่วง
 * unicode ใดที่ถูกลบ จึงแสดงผลได้ครบ
 */
export function roundAiSummaryToMarkdown(summary: RoundAiSummary): string {
  const lines: string[] = [`### ${summary.headline}`, ""];

  if (summary.highlights.length > 0) {
    lines.push("**ข้อสังเกต**");
    lines.push(...summary.highlights.map((h) => `- ${h}`));
    lines.push("");
  }

  if (summary.risks.length > 0) {
    lines.push("**จุดเสี่ยงที่ AI เน้น**");
    lines.push(
      ...summary.risks.map(
        (r) => `- **[${RISK_SEVERITY_LABEL[r.severity]}]** **${r.label}** — ${r.detail}`
      )
    );
    lines.push("");
  }

  if (summary.nextActions.length > 0) {
    lines.push("**สิ่งที่ควรทำต่อ**");
    lines.push(...summary.nextActions.map((a, i) => `${i + 1}. ${a}`));
    lines.push("");
  }

  lines.push(`ความมั่นใจของ AI ในการสรุปรอบนี้: **${Math.round(summary.confidence * 100)}%**`);
  lines.push("");
  lines.push("_ข้อมูลจำลองเพื่อสาธิต — ไม่ใช่คำตอบจากโมเดล AI จริง_");

  return lines.join("\n");
}

/** แปลงสรุป AI จำลองเป็นข้อความล้วน (ต่อท้ายในปุ่มคัดลอกรายงานได้) */
export function roundAiSummaryToText(summary: RoundAiSummary): string {
  const lines: string[] = ["", "สรุปโดย AI (ข้อมูลจำลองเพื่อสาธิต):", summary.headline, ""];
  if (summary.highlights.length > 0) {
    lines.push("ข้อสังเกต:");
    lines.push(...summary.highlights.map((h) => `- ${h}`));
    lines.push("");
  }
  if (summary.risks.length > 0) {
    lines.push("จุดเสี่ยงที่ AI เน้น:");
    lines.push(...summary.risks.map((r) => `- [${r.label}] ${r.detail}`));
    lines.push("");
  }
  if (summary.nextActions.length > 0) {
    lines.push("สิ่งที่ควรทำต่อ:");
    lines.push(...summary.nextActions.map((a) => `- ${a}`));
  }
  return lines.join("\n");
}
