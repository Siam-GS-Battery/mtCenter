// สร้าง/อัปเดตดัชนีความหมาย (embedding index) ของคู่มือทุกเล่มในตาราง manuals ลงตาราง
// manual_chunks เพื่อให้ AI Assistant ค้นและอ้างอิงคู่มือได้จริง
//
// ทำไมต้องมี: ก่อนหน้านี้คอลัมน์ manuals.ai_indexed เป็นเพียงป้ายแสดงผลบนหน้าจอ
// (frontend/src/components/views/ManualsView.tsx) ไม่มีกระบวนการ index ใด ๆ อยู่จริง
// สคริปต์นี้ (ร่วมกับ POST /api/manuals/:id/index) คือกระบวนการนั้น และเป็นทางเดียว
// ที่ ai_indexed จะถูกตั้งเป็น true
//
// ตรรกะการ index ทั้งหมดอยู่ใน src/lib/manualIndexer.ts — ไฟล์นี้เป็นแค่ CLI ครอบ
//
// วิธีใช้ (รันจากโฟลเดอร์ backend/ เพื่อให้ dotenv อ่าน backend/.env ได้):
//   npm run index:manuals -- --dry-run           ตัด chunk + รายงาน ไม่เรียก API ไม่เขียน DB
//   npm run index:manuals -- --only=MR-J5        กรองด้วยชื่อคู่มือ (substring, ไม่สนตัวพิมพ์)
//   npm run index:manuals -- --category="คู่มือซ่อมบำรุงและแก้ไขปัญหา"   กรองตามหมวดหมู่ (ตรงทั้งค่า)
//   npm run index:manuals -- --max-chunks=50     จำกัด chunk ต่อเล่ม (ทดสอบวงจรจริงแบบถูก ๆ)
//   npm run index:manuals -- --force             index ใหม่แม้เนื้อหาไม่เปลี่ยน
//   npm run index:manuals                        รันจริงทั้งคลัง
//
// ปลอดภัยต่อการรันซ้ำ: ข้ามคู่มือที่ hash ของ markdown_content ตรงกับที่ index ไว้แล้ว
// และเมื่อ index เล่มใดใหม่ จะลบ chunk เดิมของเล่มนั้นทิ้งก่อนเสมอ (ไม่เกิดของซ้อน)

import fs from "node:fs";
import path from "node:path";
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "../src/lib/embeddings.js";
import { fetchManualSummaries, indexManual, type IndexResult } from "../src/lib/manualIndexer.js";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");

const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length).trim().toLowerCase() : null;

// กรองตามหมวดหมู่คู่มือ (manuals.category) — มีไว้เพราะโควตา free tier ทำให้ index
// ทั้งคลังรอบเดียวใช้เวลาหลายชั่วโมง การไล่ index ทีละหมวดตามลำดับความสำคัญ (หมวด
// "คู่มือซ่อมบำรุงและแก้ไขปัญหา" ตอบคำถามหน้างานของช่างได้มากที่สุด) จึงใช้งานได้จริง
// กว่าการรอทั้งคลังให้เสร็จก่อนจึงจะเริ่มใช้ได้
const categoryArg = args.find((a) => a.startsWith("--category="));
const CATEGORY = categoryArg ? categoryArg.slice("--category=".length).trim().toLowerCase() : null;

const maxChunksArg = args.find((a) => a.startsWith("--max-chunks="));
const MAX_CHUNKS: number | null = maxChunksArg
  ? Number.parseInt(maxChunksArg.slice("--max-chunks=".length), 10)
  : null;
if (maxChunksArg && (MAX_CHUNKS === null || !Number.isFinite(MAX_CHUNKS) || MAX_CHUNKS <= 0)) {
  console.error(`ค่า --max-chunks ไม่ถูกต้อง: "${maxChunksArg}" ต้องเป็นจำนวนเต็มบวก`);
  process.exit(1);
}

const unknownArgs = args.filter(
  (a) =>
    !["--dry-run", "--force"].includes(a) &&
    !a.startsWith("--only=") &&
    !a.startsWith("--category=") &&
    !a.startsWith("--max-chunks=")
);
if (unknownArgs.length > 0) {
  console.error(`ไม่รู้จักอาร์กิวเมนต์: ${unknownArgs.join(", ")}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Omit<..., "status"> เพราะ ReportEntry เพิ่มสถานะ "FAILED" ที่ indexManual เองไม่มี
// (indexManual โยน error แทนการคืนสถานะล้มเหลว — ดูหมายเหตุใน lib/manualIndexer.ts)
type ReportEntry = Partial<Omit<IndexResult, "status">> & {
  id: string;
  title: string;
  status: IndexResult["status"] | "FAILED";
  error?: string;
};

const results: ReportEntry[] = [];

async function main(): Promise<void> {
  console.log(
    `เริ่ม index คู่มือ | dryRun=${DRY_RUN} force=${FORCE} only=${ONLY ?? "(ทุกเล่ม)"} category=${CATEGORY ?? "(ทุกหมวด)"} maxChunks=${MAX_CHUNKS ?? "(ไม่จำกัด)"}`
  );
  console.log(`โมเดล embedding: ${EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS} มิติ)\n`);

  const allManuals = await fetchManualSummaries();
  // has_markdown เป็น generated column (migration 0013) เล่มที่ไม่มีเนื้อหา Markdown
  // ไม่มีอะไรให้ index — คัดออกก่อนเพื่อให้ตัวเลข "จะประมวลผล N เล่ม" ตรงความจริง
  const toProcess = allManuals.filter(
    (m) =>
      (!ONLY || m.title.toLowerCase().includes(ONLY)) &&
      (!CATEGORY || (m.category ?? "").toLowerCase() === CATEGORY) &&
      m.has_markdown !== false
  );
  console.log(`พบคู่มือ ${allManuals.length} เล่ม จะประมวลผล ${toProcess.length} เล่ม\n`);

  let failedCount = 0;
  for (const [i, manual] of toProcess.entries()) {
    console.log(`[${i + 1}/${toProcess.length}] ${manual.title}`);
    try {
      const result = await indexManual(manual, {
        dryRun: DRY_RUN,
        force: FORCE,
        maxChunks: MAX_CHUNKS,
        // \r + padEnd: เขียนทับบรรทัดเดิมเพื่อไม่ให้ log ความคืบหน้าหลายร้อยบรรทัด
        // กลบสรุปผลท้ายรอบ (คลังนี้มีราว 15,000 chunk)
        onProgress: (message) => process.stdout.write(`\r    ${message.padEnd(70)}`),
      });
      process.stdout.write("\n");
      const resumeNote = result.resumedFrom > 0 ? ` (ทำต่อจาก chunk ที่ ${result.resumedFrom})` : "";
      console.log(`  [${result.status}] ${result.chunks} chunk | สร้างใหม่รอบนี้ ${result.embeddedChunks}${resumeNote}`);
      results.push(result);
    } catch (err) {
      process.stdout.write("\n");
      failedCount++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  [ล้มเหลว] ${message}`);
      results.push({ id: manual.id, title: manual.title, status: "FAILED", error: message });
    }
  }

  const reportPath = path.join(process.cwd(), "scripts", "index-manuals-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: DRY_RUN,
        force: FORCE,
        only: ONLY,
        category: CATEGORY,
        maxChunksPerManual: MAX_CHUNKS,
        embeddingModel: EMBEDDING_MODEL,
        embeddingDimensions: EMBEDDING_DIMENSIONS,
        totalManuals: allManuals.length,
        processed: toProcess.length,
        results,
      },
      null,
      2
    ),
    "utf-8"
  );

  const indexed = results.filter((r) => r.status === "indexed").length;
  const wouldIndex = results.filter((r) => r.status === "would-index").length;
  const skipped = results.filter((r) => r.status.startsWith("skipped")).length;
  const totalChunks = results
    .filter((r) => r.status === "indexed" || r.status === "would-index")
    .reduce((sum, r) => sum + (r.chunks ?? 0), 0);

  console.log("\n=== สรุปผล ===");
  console.log("คู่มือ".padEnd(60), "chunk".padStart(8), "สถานะ".padStart(20));
  for (const r of results) {
    console.log(r.title.slice(0, 58).padEnd(60), String(r.chunks ?? 0).padStart(8), r.status.padStart(20));
  }
  console.log(
    `\nทั้งหมด: ${allManuals.length}  ประมวลผล: ${toProcess.length}  index สำเร็จ: ${indexed}  (dry-run) จะ index: ${wouldIndex}  ข้าม: ${skipped}  ล้มเหลว: ${failedCount}`
  );
  console.log(`รวม chunk: ${totalChunks.toLocaleString()}`);
  if (DRY_RUN) console.log("(dry-run: ไม่ได้เรียก embedding API และไม่ได้เขียนฐานข้อมูล)");
  console.log(`เขียนรายงานไว้ที่ ${reportPath}`);

  if (failedCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
