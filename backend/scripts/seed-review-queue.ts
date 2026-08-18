// เตรียมข้อมูลสำหรับสาธิต UX Storyboard Scenario C Frame 1 (รายการใบงานรอรีวิว)
//
// ทำไมต้องมี: ฐานข้อมูลจริงไม่มีใบงานสถานะ "review" เลยแม้ใบเดียว (มี completed 8,605,
// pending 3, in_progress 1) หน้า "รีวิวความรู้" จึงว่างเปล่าและสาธิตไม่ได้
// สคริปต์นี้ย้ายใบงานที่ปิดแล้วจำนวนน้อย ๆ มาเป็นสถานะ "review" ชั่วคราว
//
// **แก้ไขข้อมูลจริง** — จึงออกแบบให้ย้อนกลับได้เสมอ:
//   - บันทึกสถานะเดิมของทุกใบที่แตะไว้ในไฟล์รายงาน ก่อนเปลี่ยนค่า
//   - `--revert` อ่านไฟล์นั้นแล้วคืนค่าเดิมให้ครบทุกใบ (ไม่ใช่เดาว่าเดิมเป็น completed)
//   - ค่าเริ่มต้นเป็น --dry-run เพื่อไม่ให้เผลอรันแล้วแก้ข้อมูลโดยไม่ตั้งใจ
//
// การเลือกใบงาน: คละเครื่องจักรและระดับสภาพเครื่อง ไม่เอาเครื่องเดียวซ้ำ ๆ เพราะถ้า
// ทุกใบมาจากเครื่องเดียวกัน คะแนนจัดลำดับจะเท่ากันหมดและมองไม่ออกว่ากฎทำงาน —
// จุดประสงค์ของ Frame 1 คือแสดงว่า "จัดลำดับได้และอธิบายได้" ข้อมูลสาธิตต้องโชว์ตรงนั้น
//
// วิธีใช้ (รันจากโฟลเดอร์ backend/):
//   npm run seed:review-queue                  ดูว่าจะเปลี่ยนใบไหน (ไม่เขียน DB)
//   npm run seed:review-queue -- --apply       เปลี่ยนจริง (ค่าเริ่มต้น 5 ใบ)
//   npm run seed:review-queue -- --apply --count=8
//   npm run seed:review-queue -- --revert      คืนสถานะเดิมทุกใบที่เคยเปลี่ยน

import fs from "node:fs";
import path from "node:path";
import { supabase } from "../src/lib/supabase.js";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const REVERT = args.includes("--revert");

const countArg = args.find((a) => a.startsWith("--count="));
const COUNT = countArg ? Number.parseInt(countArg.slice("--count=".length), 10) : 5;
if (countArg && (!Number.isFinite(COUNT) || COUNT <= 0 || COUNT > 50)) {
  console.error(`ค่า --count ไม่ถูกต้อง: ต้องเป็นจำนวนเต็ม 1-50 (ได้รับ "${countArg}")`);
  process.exit(1);
}

const unknown = args.filter(
  (a) => !["--apply", "--revert"].includes(a) && !a.startsWith("--count=")
);
if (unknown.length > 0) {
  console.error(`ไม่รู้จักอาร์กิวเมนต์: ${unknown.join(", ")}`);
  process.exit(1);
}
if (APPLY && REVERT) {
  console.error("ใช้ --apply กับ --revert พร้อมกันไม่ได้");
  process.exit(1);
}

const REPORT_PATH = path.join(process.cwd(), "scripts", "seed-review-queue-report.json");

interface TouchedRow {
  id: string;
  code: string;
  machineCode: string | null;
  previousStatus: string;
}

interface Report {
  appliedAt: string;
  touched: TouchedRow[];
}

/* ------------------------------------------------------------------ */
/* revert                                                              */
/* ------------------------------------------------------------------ */

async function revert(): Promise<void> {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`ไม่พบไฟล์รายงานที่ ${REPORT_PATH} — ไม่มีข้อมูลว่าเคยเปลี่ยนใบไหนไว้ จึงคืนค่าไม่ได้`);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8")) as Report;
  if (!Array.isArray(report.touched) || report.touched.length === 0) {
    console.log("ไฟล์รายงานไม่มีรายการที่ต้องคืนค่า");
    return;
  }

  console.log(`คืนสถานะเดิมให้ ${report.touched.length} ใบงาน (จากรอบที่รันเมื่อ ${report.appliedAt})\n`);
  let reverted = 0;
  let failed = 0;
  for (const row of report.touched) {
    // คืนค่าเฉพาะใบที่ยังเป็น review อยู่ — ถ้ามีคนเปลี่ยนสถานะไปแล้วหลังจากนั้น
    // การเขียนทับจะทำลายงานของเขา ปล่อยไว้และรายงานให้เห็นดีกว่า
    const { data, error } = await supabase
      .from("work_orders")
      .update({ status: row.previousStatus })
      .eq("id", row.id)
      .eq("status", "review")
      .select("id");
    if (error) {
      failed++;
      console.error(`  [ล้มเหลว] ${row.code}: ${error.message}`);
      continue;
    }
    if ((data ?? []).length === 0) {
      console.log(`  [ข้าม]    ${row.code} — สถานะไม่ใช่ review แล้ว (มีคนเปลี่ยนต่อ) ไม่เขียนทับ`);
      continue;
    }
    reverted++;
    console.log(`  [คืนค่า]  ${row.code} -> ${row.previousStatus}`);
  }

  // ลบความรู้ที่ถูกยืนยันจากใบงานชุดนี้ด้วย ไม่งั้นคลังความรู้จะเหลือของจากการสาธิตค้างไว้
  const ids = report.touched.map((r) => r.id);
  const { data: kb, error: kbError } = await supabase
    .from("knowledge_articles")
    .delete()
    .in("source_work_order_id", ids)
    .select("id");
  if (kbError) console.error(`  ลบความรู้จากการสาธิตไม่สำเร็จ: ${kbError.message}`);
  else if ((kb ?? []).length > 0) console.log(`  ลบความรู้ที่ยืนยันจากการสาธิต ${(kb ?? []).length} เรื่อง`);

  fs.unlinkSync(REPORT_PATH);
  console.log(`\nคืนค่าสำเร็จ ${reverted} ใบ | ล้มเหลว ${failed} ใบ | ลบไฟล์รายงานแล้ว`);
  if (failed > 0) process.exit(1);
}

/* ------------------------------------------------------------------ */
/* seed                                                                */
/* ------------------------------------------------------------------ */

interface Candidate {
  id: string;
  code: string;
  machine_code: string | null;
  status: string;
  priority: string | null;
  mtloss_min: number | null;
  cause: string | null;
  repair_action: string | null;
}

async function seed(): Promise<void> {
  if (fs.existsSync(REPORT_PATH)) {
    console.error(
      `มีไฟล์รายงานค้างอยู่ที่ ${REPORT_PATH}\n` +
        `แปลว่ารอบก่อนยังไม่ได้คืนค่า — รัน "npm run seed:review-queue -- --revert" ก่อน\n` +
        `(กันการเปลี่ยนสถานะซ้อนกันจนไม่รู้ว่าค่าเดิมของใบไหนคืออะไร)`
    );
    process.exit(1);
  }

  // ดึงผู้สมัครเกินที่ต้องใช้ แล้วค่อยคัดให้คละเครื่องฝั่งแอป
  // (PostgREST ทำ "distinct on" ไม่ได้ตรง ๆ จึงคัดเองหลังดึงมา)
  const { data, error } = await supabase
    .from("work_orders")
    .select("id,code,machine_code,status,priority,mtloss_min,cause,repair_action")
    .eq("status", "completed")
    .not("cause", "is", null)
    .not("repair_action", "is", null)
    .gt("mtloss_min", 0)
    .order("mtloss_min", { ascending: false })
    .limit(400);
  if (error) throw new Error(`ดึงผู้สมัครไม่สำเร็จ: ${error.message}`);

  const candidates = ((data ?? []) as Candidate[]).filter(
    (c) => (c.cause ?? "").trim() !== "" && (c.repair_action ?? "").trim() !== ""
  );

  // คัดหนึ่งใบต่อหนึ่งเครื่อง เพื่อให้คะแนนจัดลำดับต่างกันจริง (ดูหมายเหตุหัวไฟล์)
  const picked: Candidate[] = [];
  const seenMachines = new Set<string>();
  for (const c of candidates) {
    if (picked.length >= COUNT) break;
    const key = c.machine_code ?? `__no_machine_${picked.length}`;
    if (seenMachines.has(key)) continue;
    seenMachines.add(key);
    picked.push(c);
  }

  if (picked.length === 0) {
    console.error("ไม่พบใบงานที่เข้าเกณฑ์ (ต้องมีสาเหตุ วิธีแก้ และ downtime > 0)");
    process.exit(1);
  }

  console.log(`${APPLY ? "จะเปลี่ยน" : "[dry-run] จะเปลี่ยน"} ${picked.length} ใบงานเป็นสถานะ "review":\n`);
  console.log("ใบงาน".padEnd(12), "เครื่อง".padEnd(12), "ความสำคัญ".padEnd(10), "downtime(นาที)".padStart(14));
  for (const c of picked) {
    console.log(
      c.code.padEnd(12),
      (c.machine_code ?? "-").padEnd(12),
      (c.priority ?? "-").padEnd(10),
      String(c.mtloss_min ?? "-").padStart(14)
    );
  }

  if (!APPLY) {
    console.log(`\n(dry-run: ยังไม่ได้เขียนฐานข้อมูล) รันซ้ำด้วย --apply เพื่อเปลี่ยนจริง`);
    return;
  }

  // เขียนไฟล์รายงาน "ก่อน" เปลี่ยนค่า — ถ้าเขียน DB สำเร็จบางส่วนแล้วโปรเซสตาย
  // ต้องยังมีข้อมูลพอให้ย้อนกลับได้ การเขียนรายงานทีหลังคือรอวันที่ย้อนกลับไม่ได้
  const report: Report = {
    appliedAt: new Date().toISOString(),
    touched: picked.map((c) => ({
      id: c.id,
      code: c.code,
      machineCode: c.machine_code,
      previousStatus: c.status,
    })),
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nบันทึกสถานะเดิมไว้ที่ ${REPORT_PATH} แล้ว (ใช้สำหรับ --revert)`);

  let changed = 0;
  for (const c of picked) {
    const { error: updateError } = await supabase
      .from("work_orders")
      .update({ status: "review" })
      .eq("id", c.id)
      .eq("status", c.status); // กันการเขียนทับถ้ามีคนเปลี่ยนสถานะไปก่อนหน้าเสี้ยววินาที
    if (updateError) {
      console.error(`  [ล้มเหลว] ${c.code}: ${updateError.message}`);
      continue;
    }
    changed++;
  }

  console.log(`\nเปลี่ยนสถานะสำเร็จ ${changed}/${picked.length} ใบ`);
  console.log(`คืนค่าเดิมได้ด้วย: npm run seed:review-queue -- --revert`);
}

async function main(): Promise<void> {
  if (REVERT) await revert();
  else await seed();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
