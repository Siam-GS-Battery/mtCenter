// ตรวจว่าคำถามสำเร็จรูปทุกข้อที่ฝั่งหน้าจอเสนอให้ผู้ใช้กด ถูกตีความเจตนาได้จริง
//
// ทำไมต้องมี: ปุ่มคำถามสำเร็จรูป (buildPresetQuestions ใน frontend/src/lib/aiActions.ts)
// คือสิ่งที่ผู้ใช้กดมากที่สุดในการสาธิต ถ้าข้อใดถูก detectIntent() ตีเป็น "unknown"
// ผู้ใช้จะกดปุ่มที่ระบบเสนอเองแล้วได้คำตอบว่า "ยังตอบคำถามนี้ไม่ได้" ซึ่งพังที่สุด
// ในสายตาคนดู สคริปต์นี้จับกรณีนั้นก่อนถึงมือผู้ใช้
//
// รายการคำถามด้านล่างคัดลอกมาจากฝั่งหน้าจอโดยเจตนา (backend import โค้ด frontend ไม่ได้)
// ถ้าแก้ preset ฝั่งหน้าจอแล้วลืมแก้ที่นี่ สคริปต์จะยังผ่าน — จึงต้องแก้ทั้งสองที่พร้อมกัน
// รายการนี้จึงถูกเทียบกับไฟล์ฝั่งหน้าจอด้วย (ดู verifyPresetsInSync ด้านล่าง) เพื่อให้
// การลืมนั้นดังขึ้นมาแทนที่จะเงียบ
//
// วิธีใช้:  npm run check:intents

import fs from "node:fs";
import path from "node:path";
import { detectIntent, type Intent } from "../src/lib/mockAssistant.js";

const MACHINE_CODE = "GR-1141";
const ALL_MACHINE_CODE = "ALL-000";

// คำถามเมื่อ "เลือกเครื่องจักรแล้ว" — ข้อแรกสองแบบตาม buildMachinePresetQuestion()
// (มี/ไม่มีรหัสข้อผิดพลาดค้างอยู่)
const MACHINE_PRESETS: { question: string; expected: Intent }[] = [
  { question: `แนวทางแก้ไข ALM-52 (Spindle overheat) ของเครื่อง ${MACHINE_CODE}`, expected: "error_code" },
  { question: `สรุปสถานะและค่าตรวจวัดล่าสุดของเครื่อง ${MACHINE_CODE}`, expected: "machine_status" },
  { question: `ขั้นตอนการเปลี่ยนอะไหล่ของเครื่อง ${MACHINE_CODE} อย่างปลอดภัย`, expected: "part_replacement" },
  { question: "ขอเช็กลิสต์การซ่อมบำรุงเชิงป้องกัน (PM Checklist)", expected: "pm_checklist" },
  { question: "ขั้นตอนความปลอดภัย Lockout-Tagout ก่อนเริ่มงาน", expected: "safety_loto" },
  { question: "เครื่องนี้ตอนนี้ปกติหรือผิดปกติ เพราะอะไร", expected: "machine_status" },
  { question: "ประวัติการซ่อมล่าสุดของเครื่องนี้เป็นอย่างไร", expected: "repair_history" },
  { question: "ค่าอุณหภูมิและการสั่นสะเทือนตอนนี้เกินพิกัดไหม", expected: "sensor_readings" },
];

// คำถามสำเร็จรูปที่คัดสรรไว้เฉพาะ GR-1141 (POC demo) — MACHINE_PRESET_QUESTIONS ใน
// frontend/src/lib/aiActions.ts ข้อ [0] ถูกแทนที่ด้วย buildMachinePresetQuestion()
// เสมอ จึงตรวจเฉพาะข้อ [1..6] ที่นี่ (ตรงกับ curated[1..6] ที่ buildPresetQuestions ใช้จริง)
const GR1141_CURATED_PRESETS: { question: string; expected: Intent }[] = [
  {
    question:
      "แนวโน้มอุณหภูมิ Spindle และค่าสั่นสะเทือนของเครื่อง GR-1141 ในช่วง 30 วันที่ผ่านมา เกินพิกัดที่กำหนดหรือไม่",
    expected: "sensor_readings",
  },
  {
    question:
      "สาเหตุที่แท้จริงของปัญหาตลับลูกปืน Spindle ที่ทรุดตัวลงเรื่อยๆ จากประวัติการซ่อมที่ผ่านมาของเครื่อง GR-1141 คืออะไร",
    expected: "repair_history",
  },
  {
    question:
      "ต้องเตรียมอะไหล่ Spindle Bearing, Oil Seal, Spindle Grease ชิ้นไหนบ้างสำหรับขั้นตอนการเปลี่ยนอะไหล่ครั้งนี้",
    expected: "part_replacement",
  },
  {
    question: "ขั้นตอนการเปลี่ยนอะไหล่ Spindle Bearing ของเครื่อง GR-1141 อย่างปลอดภัย",
    expected: "part_replacement",
  },
  {
    question: "ขั้นตอนความปลอดภัย Lockout-Tagout ก่อนเริ่มงานเปลี่ยนลูกปืน Spindle",
    expected: "safety_loto",
  },
  {
    question: "สรุปประวัติการซ่อมทั้ง 9 ใบงานที่ผ่านมาของเครื่อง GR-1141",
    expected: "repair_history",
  },
];

// คำถามสำเร็จรูปที่คัดสรรไว้เฉพาะ ALL-000 (POC demo) — เช่นเดียวกับ GR-1141 ข้อ [0]
// ถูกแทนที่ด้วย buildMachinePresetQuestion() เสมอ จึงตรวจเฉพาะข้อ [1..5]
const ALL000_CURATED_PRESETS: { question: string; expected: Intent }[] = [
  {
    question: `กำหนดซ่อมบำรุงเชิงป้องกันครั้งถัดไปของเครื่อง ${ALL_MACHINE_CODE} คือเมื่อไหร่ ขอเช็กลิสต์ PM Checklist ด้วย`,
    expected: "pm_checklist",
  },
  {
    question: `ค่าอุณหภูมิและแรงสั่นสะเทือนตอนนี้ของเครื่อง ${ALL_MACHINE_CODE} เกินพิกัดที่กำหนดหรือไม่`,
    expected: "sensor_readings",
  },
  {
    question: `สรุปประวัติการซ่อมบำรุงตามรอบ (Routine) ของเครื่อง ${ALL_MACHINE_CODE} ที่ผ่านมา`,
    expected: "repair_history",
  },
  {
    question: `ต้องเฝ้าระวังอะไรบ้างเพื่อไม่ให้เครื่อง ${ALL_MACHINE_CODE} กลายเป็นเครื่องผิดปกติเหมือน ${MACHINE_CODE}`,
    expected: "machine_status",
  },
  {
    question: `รอบการหยอดน้ำมันหล่อลื่นและตรวจสอบ (Lubrication/Inspection Interval) ของเครื่อง ${ALL_MACHINE_CODE} อยู่ในเช็กลิสต์ PM Checklist อย่างไร`,
    expected: "pm_checklist",
  },
];

// คำถามเมื่อ "ไม่ได้เลือกเครื่องจักร" — FLEET_PRESET_QUESTIONS
const FLEET_PRESETS: { question: string; expected: Intent }[] = [
  { question: "ตอนนี้มีเครื่องจักรไหนผิดปกติบ้าง", expected: "abnormal_fleet" },
  { question: "สรุปภาพรวมสถานะเครื่องจักรทั้งหมด", expected: "fleet_overview" },
  { question: "เครื่องไหนต้องเข้าซ่อมด่วนที่สุด", expected: "urgent_repair" },
];

// คำถามอิสระที่ผู้ใช้น่าจะพิมพ์เอง (ไม่ได้กดจากปุ่ม) — ต้องจับเจตนาได้เช่นกัน
const FREE_FORM: { question: string; expected: Intent }[] = [
  { question: "เครื่องนี้ร้อนเกินไปไหม", expected: "sensor_readings" },
  { question: "มีเครื่องไหนเสียอยู่บ้าง", expected: "abnormal_fleet" },
  { question: "เคยซ่อมเครื่องนี้ไปแล้วกี่ครั้ง", expected: "repair_history" },
  { question: "ต้องใส่ PPE อะไรบ้าง", expected: "safety_loto" },
];

// คำถามที่ "ต้องตอบว่าไม่รู้" — พิสูจน์ว่าตัวจับคำไม่เดาสุ่มให้ทุกอย่าง
const MUST_BE_UNKNOWN: string[] = [
  "วันนี้อากาศเป็นอย่างไร",
  "ขอสูตรทำอาหารเย็น",
  "แปลประโยคนี้เป็นภาษาอังกฤษให้หน่อย",
  "",
];

/**
 * ยืนยันว่าข้อความคำถามในไฟล์นี้ยังมีอยู่จริงในไฟล์ฝั่งหน้าจอ
 * ตรวจเฉพาะข้อความคงที่ (ข้อที่มีชื่อ/รหัสเครื่องแทรกอยู่ตรวจแบบนี้ไม่ได้)
 */
function verifyPresetsInSync(): string[] {
  const frontendFile = path.resolve(process.cwd(), "..", "frontend", "src", "lib", "aiActions.ts");
  if (!fs.existsSync(frontendFile)) {
    return [`ไม่พบไฟล์ฝั่งหน้าจอที่ ${frontendFile} — ข้ามการตรวจว่า preset ตรงกัน`];
  }
  const source = fs.readFileSync(frontendFile, "utf-8");
  const staticQuestions = [
    ...MACHINE_PRESETS,
    ...FLEET_PRESETS,
    ...GR1141_CURATED_PRESETS,
    ...ALL000_CURATED_PRESETS,
  ]
    .map((c) => c.question)
    .filter((q) => !q.includes(MACHINE_CODE) && !q.includes(ALL_MACHINE_CODE) && !q.includes("ALM-52"));

  const missing = staticQuestions.filter((q) => !source.includes(q));
  return missing.map((q) => `คำถาม "${q}" ไม่พบใน frontend/src/lib/aiActions.ts แล้ว (preset อาจถูกแก้ไปโดยไม่อัปเดตที่นี่)`);
}

function main(): void {
  const failures: string[] = [];
  let checked = 0;

  const runGroup = (label: string, cases: { question: string; expected: Intent }[]): void => {
    console.log(`\n[${label}]`);
    for (const { question, expected } of cases) {
      const actual = detectIntent(question);
      checked += 1;
      const ok = actual === expected;
      console.log(`  ${ok ? "ผ่าน " : "ไม่ผ่าน"} ${actual.padEnd(18)} ${question}`);
      if (!ok) failures.push(`"${question}" → ได้ "${actual}" แต่ต้องการ "${expected}"`);
    }
  };

  runGroup("คำถามสำเร็จรูป: เลือกเครื่องจักรแล้ว", MACHINE_PRESETS);
  runGroup("คำถามสำเร็จรูป: ภาพรวมทั้งฟลีต", FLEET_PRESETS);
  runGroup("คำถามสำเร็จรูปคัดสรร: GR-1141 (POC demo)", GR1141_CURATED_PRESETS);
  runGroup("คำถามสำเร็จรูปคัดสรร: ALL-000 (POC demo)", ALL000_CURATED_PRESETS);
  runGroup("คำถามอิสระที่ควรจับได้", FREE_FORM);

  console.log("\n[คำถามนอกขอบเขต ต้องตอบว่าไม่รู้]");
  for (const question of MUST_BE_UNKNOWN) {
    const actual = detectIntent(question);
    checked += 1;
    const ok = actual === "unknown";
    console.log(`  ${ok ? "ผ่าน " : "ไม่ผ่าน"} ${actual.padEnd(18)} ${question === "" ? "(ข้อความว่าง)" : question}`);
    if (!ok) failures.push(`"${question}" → ได้ "${actual}" แต่ต้องเป็น "unknown"`);
  }

  const syncWarnings = verifyPresetsInSync();
  if (syncWarnings.length > 0) {
    console.log("\n[ตรวจว่า preset ตรงกับฝั่งหน้าจอ]");
    for (const w of syncWarnings) console.log(`  เตือน: ${w}`);
  }

  console.log(`\nตรวจทั้งหมด ${checked} กรณี | ไม่ผ่าน ${failures.length} กรณี`);
  if (failures.length > 0) {
    console.error("\nรายการที่ไม่ผ่าน:");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  // คำเตือนเรื่อง preset ไม่ตรงกันถือว่าร้ายแรงพอที่จะทำให้ล้มเหลว: มันหมายความว่า
  // ปุ่มที่ผู้ใช้เห็นจริงกับที่สคริปต์นี้ตรวจไม่ใช่ชุดเดียวกันแล้ว การตรวจจึงไม่มีความหมาย
  if (syncWarnings.some((w) => w.startsWith("คำถาม"))) {
    console.error("\npreset ฝั่งหน้าจอไม่ตรงกับรายการในสคริปต์นี้ — อัปเดตให้ตรงกันก่อน");
    process.exit(1);
  }
  console.log("ผ่านทั้งหมด");
}

main();
