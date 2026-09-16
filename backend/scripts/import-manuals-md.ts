// One-off importer: inserts the curated markdown manuals under
// docs/Manual_MD/ into the Supabase `manuals` table.
//
// Why this exists: the 23 manuals were converted from PDF to Markdown out of
// band (see docs/Manual_MD/**), and need a one-time (but re-runnable) path
// into the `manuals` table so the app can serve them without a real PDF file
// (file_path stays null — there is no PDF for these in the repo).
//
// Every source .md file carries a small pipe-table metadata header (see
// convertMetadataTable() below) produced by the PDF->MD conversion tool. The
// frontend renders manual content with plain react-markdown (CommonMark, NO
// remark-gfm plugin), so a pipe table would render as literal `| | |` text
// instead of a table. This script rewrites that header into a plain bullet
// list before inserting, and is tolerant of files that don't match the
// expected shape (it leaves such files' content untouched rather than
// failing the whole import).
//
// Usage (run from backend/, so dotenv.config() in ../src/config.js picks up
// backend/.env):
//   npm run import:manuals -- --dry-run                    (parse + validate + write report, NO db writes)
//   npm run import:manuals -- --only=laser_mark             (case-insensitive substring filter on file path)
//   npm run import:manuals -- --upload-date=2026-08-01      (override upload_date, default = today)
//   npm run import:manuals -- --uploaded-by="ชื่อผู้ใช้"     (override uploaded_by)
//   npm run import:manuals -- --update                      (push edited markdown into existing rows instead of skipping)
//   npm run import:manuals                                  (LIVE import — writes to Supabase, one row at a time)
//
// Idempotent: existing `manuals` rows are matched by exact `title`; a manual
// whose title already exists is skipped (logged [skip]), so re-running is safe.
// Pass --update to instead push the catalogued file's current markdown_content
// (and derived file_size/pages_count) into that existing row. This does NOT
// touch manual_chunks (the AI search index) — see the warning the script
// prints when --update touches a row that had already been indexed.

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { supabase } from "../src/lib/supabase.js";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const UPDATE = args.includes("--update");

const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length).trim().toLowerCase() : null;

const uploadDateArg = args.find((a) => a.startsWith("--upload-date="));
const UPLOAD_DATE_RAW = uploadDateArg ? uploadDateArg.slice("--upload-date=".length).trim() : null;
if (UPLOAD_DATE_RAW && !/^\d{4}-\d{2}-\d{2}$/.test(UPLOAD_DATE_RAW)) {
  console.error(`Invalid --upload-date value "${UPLOAD_DATE_RAW}". Expected format: YYYY-MM-DD`);
  process.exit(1);
}

function todayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const UPLOAD_DATE = UPLOAD_DATE_RAW ?? todayYYYYMMDD();

const uploadedByArg = args.find((a) => a.startsWith("--uploaded-by="));
const UPLOADED_BY = uploadedByArg ? uploadedByArg.slice("--uploaded-by=".length).trim() : "ระบบนำเข้าเอกสาร";
if (uploadedByArg && UPLOADED_BY === "") {
  console.error(`Invalid --uploaded-by value: must not be empty.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Manual catalog (curated metadata, hardcoded — see task spec for source table)
// ---------------------------------------------------------------------------

type ManualCategory =
  | "General"
  | "คู่มือซ่อมบำรุงและแก้ไขปัญหา"
  | "ไดอะแกรมไฟฟ้าและไฮดรอลิก"
  | "ขั้นตอนการเปลี่ยนอะไหล่และตั้งศูนย์";

const ALLOWED_CATEGORIES: readonly ManualCategory[] = [
  "General",
  "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
  "ไดอะแกรมไฟฟ้าและไฮดรอลิก",
  "ขั้นตอนการเปลี่ยนอะไหล่และตั้งศูนย์",
];

interface ManualSpec {
  file: string; // path relative to docs/Manual_MD/, forward-slash separated
  title: string;
  machineModel: string;
  category: ManualCategory;
  tags: string[];
}

const MANUALS: readonly ManualSpec[] = [
  {
    file: "FANUC SERVO AMPLIFIER.md",
    title: "FANUC Servo Amplifier αi Series – Maintenance Manual",
    machineModel: "FANUC αi",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["FANUC", "servo amplifier", "ซ่อมบำรุง", "alarm", "diagnostics"],
  },
  {
    file: "FR-E700.md",
    title: "Mitsubishi FR-E700 Inverter – Instruction Manual",
    machineModel: "FR-E700",
    category: "General",
    tags: ["Mitsubishi", "inverter", "VFD", "อินเวอร์เตอร์", "parameters"],
  },
  {
    file: "MR-C10A.md",
    title: "Mitsubishi MR-C10A AC Servo Amplifier – Instruction Manual",
    machineModel: "MR-C10A",
    category: "General",
    tags: ["Mitsubishi", "servo amplifier", "เซอร์โว", "OCR"],
  },
  {
    file: "MR-J2S.md",
    title: "Mitsubishi MR-J2S AC Servo Amplifier – Instruction Manual",
    machineModel: "MR-J2S",
    category: "General",
    tags: ["Mitsubishi", "servo amplifier", "เซอร์โว", "parameters"],
  },
  {
    file: "MR-J3 Manual.md",
    title: "Mitsubishi MR-J3-A AC Servo Amplifier – Instruction Manual",
    machineModel: "MR-J3-A",
    category: "General",
    tags: ["Mitsubishi", "servo amplifier", "เซอร์โว", "parameters", "alarm"],
  },
  {
    file: "MR-J4_A.md",
    title: "Mitsubishi MR-J4-A AC Servo Amplifier – Instruction Manual",
    machineModel: "MR-J4-A",
    category: "General",
    tags: ["Mitsubishi", "servo amplifier", "เซอร์โว", "parameters"],
  },
  {
    file: "MR-J5 Function.md",
    title: "Mitsubishi MR-J5 Servo Amplifier – Function & Parameters",
    machineModel: "MR-J5",
    category: "General",
    tags: ["Mitsubishi", "servo amplifier", "เซอร์โว", "parameters", "function"],
  },
  {
    file: "MR-J5 Hardware.md",
    title: "Mitsubishi MR-J5 Servo Amplifier – Hardware & Wiring",
    machineModel: "MR-J5",
    category: "ไดอะแกรมไฟฟ้าและไฮดรอลิก",
    tags: ["Mitsubishi", "servo amplifier", "wiring", "ไดอะแกรม", "installation"],
  },
  {
    file: "MR-J5 Troubleshooting.md",
    title: "Mitsubishi MR-J5 Servo Amplifier – Troubleshooting",
    machineModel: "MR-J5",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["Mitsubishi", "servo amplifier", "troubleshooting", "alarm", "แก้ไขปัญหา"],
  },
  {
    file: "SGD7S.md",
    title: "Yaskawa Σ-7 SGD7S SERVOPACK – Product Manual",
    machineModel: "SGD7S",
    category: "General",
    tags: ["Yaskawa", "SERVOPACK", "sigma-7", "เซอร์โว"],
  },
  {
    file: "Laser_Mark/LP-RF200P_Alarm_List.md",
    title: "Panasonic LP-RF200P Laser Marker – Alarm List",
    machineModel: "LP-RF200P",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["Panasonic", "laser marker", "alarm", "error code", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/LP-RF200P_Installation_Maintenance_TH.md",
    title: "Panasonic LP-RF200P Laser Marker – Installation & Maintenance",
    machineModel: "LP-RF200P",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["Panasonic", "laser marker", "installation", "ซ่อมบำรุง", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/LP-RF200P_Laser_Safety_TH.md",
    title: "Panasonic LP-RF200P Laser Marker – Laser Safety",
    machineModel: "LP-RF200P",
    category: "General",
    tags: ["Panasonic", "laser marker", "safety", "ความปลอดภัย", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/LP-RF200P_NAVI_Smart_Basic_TH.md",
    title: "Panasonic Laser Marker NAVI Smart – Basic Guide",
    machineModel: "LP-RF200P",
    category: "General",
    tags: ["Panasonic", "NAVI smart", "software", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/LP-RF200P_NAVI_Smart_Detailed_TH.md",
    title: "Panasonic Laser Marker NAVI Smart – Detailed Operation",
    machineModel: "LP-RF200P",
    category: "General",
    tags: ["Panasonic", "NAVI smart", "software", "operation", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/MD-F3000_E.md",
    title: "KEYENCE MD-F3000 Fiber Laser Marker – User's Manual",
    machineModel: "MD-F3000",
    category: "General",
    tags: ["KEYENCE", "laser marker", "fiber", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/MD-F3100_5100_S_222010_J.md",
    title: "KEYENCE MD-F3100/5100 Fiber Laser Marker – Specifications (JP)",
    machineModel: "MD-F3100/5100",
    category: "General",
    tags: ["KEYENCE", "laser marker", "specification", "仕様書", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/MD-F3200_TH.md",
    title: "KEYENCE MD-F3200/5200 Fiber Laser Marker – คู่มือติดตั้งและแก้ไขปัญหา",
    machineModel: "MD-F3200/5200",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["KEYENCE", "laser marker", "ภาษาไทย", "troubleshooting", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/MD-V9900_TH.md",
    title: "KEYENCE MD-V9900A YVO4 Laser Marker – คู่มือการใช้งาน",
    machineModel: "MD-V9900A",
    category: "General",
    tags: ["KEYENCE", "laser marker", "YVO4", "ภาษาไทย", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/MD-X_EN.md",
    title: "KEYENCE MD-X1000/1500 Laser Marker – User's Manual (EN)",
    machineModel: "MD-X1000/1500",
    category: "General",
    tags: ["KEYENCE", "laser marker", "3-axis", "เลเซอร์"],
  },
  {
    file: "Laser_Mark/MD-X_TH.md",
    title: "KEYENCE MD-X2000/2500 Laser Marker – คู่มือการใช้งาน",
    machineModel: "MD-X2000/2500",
    category: "General",
    tags: ["KEYENCE", "laser marker", "3-axis", "ภาษาไทย", "เลเซอร์"],
  },
  {
    file: "Robot/Maintenance IAI non.md",
    title: "IAI Actuator & Controller – Maintenance Course",
    machineModel: "IAI",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["IAI", "actuator", "controller", "robot", "ซ่อมบำรุง"],
  },
  {
    file: "Robot/OmniCore - Basic Programming.md",
    title: "ABB OmniCore Robot Controller – Basic Programming",
    machineModel: "ABB OmniCore",
    category: "General",
    tags: ["ABB", "OmniCore", "robot", "RAPID", "programming"],
  },
  {
    file: "all-000-machine-manual.md",
    title: "คู่มือบำรุงรักษาทั่วไป (All Machines) ALL-000",
    machineModel: "ALL-000",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["ทุกเครื่องจักร", "บำรุงรักษาเชิงป้องกัน", "PM", "ความปลอดภัย", "LOTO"],
  },
  {
    file: "gr-1141-machine-manual.md",
    title: "คู่มือเครื่องจักร GR-1141",
    machineModel: "GR-1141",
    category: "คู่มือซ่อมบำรุงและแก้ไขปัญหา",
    tags: ["GR-1141", "บำรุงรักษาเชิงป้องกัน", "แก้ไขปัญหา", "อะไหล่"],
  },
];

// Sanity-check the hardcoded catalog against the allowed category set —
// catches a typo'd category value loudly instead of letting a bad value
// reach the database.
for (const m of MANUALS) {
  if (!ALLOWED_CATEGORIES.includes(m.category)) {
    console.error(`Manual catalog bug: "${m.file}" has invalid category "${m.category}". Allowed: ${ALLOWED_CATEGORIES.join(", ")}`);
    process.exit(1);
  }
}

const MANUAL_MD_DIR = path.resolve(process.cwd(), "..", "docs", "Manual_MD");

function resolveManualPath(relFile: string): string {
  return path.resolve(MANUAL_MD_DIR, ...relFile.split("/"));
}

function wants(relFile: string): boolean {
  return !ONLY || relFile.toLowerCase().includes(ONLY);
}

// ---------------------------------------------------------------------------
// Metadata-table -> bullet-list transform
// ---------------------------------------------------------------------------
//
// Every source file has (near the top) a 2-column pipe table like:
//   | | |
//   |---|---|
//   | **ไฟล์ต้นฉบับ** | `D:\...\<name>.pdf` |
//   | **จำนวนหน้า** | <N> |
//   | **วิธีสกัดข้อความ** | <method> |
// which react-markdown (no remark-gfm) can't render as a table. This
// rewrites it into a plain bullet list, preserving the same key/value pairs.
// Tolerant: if the file doesn't match this exact shape, content is returned
// unchanged and `converted: false` is reported for that file.

interface MetadataTransformResult {
  content: string;
  converted: boolean;
  pagesFromHeader: number | null;
}

function convertMetadataTable(content: string): MetadataTransformResult {
  const lines = content.split(/\r\n|\n/);
  const searchLimit = Math.min(lines.length, 15);

  let headerIdx = -1;
  for (let i = 0; i < searchLimit; i++) {
    if (lines[i].trim() === "| | |") {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    return { content, converted: false, pagesFromHeader: null };
  }

  const sepIdx = headerIdx + 1;
  if (sepIdx >= lines.length || !/^\|\s*-{2,}\s*\|\s*-{2,}\s*\|\s*$/.test(lines[sepIdx].trim())) {
    return { content, converted: false, pagesFromHeader: null };
  }

  const rowPattern = /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*$/;
  const bulletLines: string[] = [];
  let pagesFromHeader: number | null = null;
  let i = sepIdx + 1;
  for (; i < lines.length; i++) {
    const m = lines[i].trim().match(rowPattern);
    if (!m) break;
    const key = m[1].trim();
    const value = m[2].trim();
    bulletLines.push(`- **${key}:** ${value}`);
    if (key === "จำนวนหน้า") {
      const numMatch = value.match(/\d+/);
      if (numMatch) pagesFromHeader = parseInt(numMatch[0], 10);
    }
  }

  if (bulletLines.length === 0) {
    return { content, converted: false, pagesFromHeader: null };
  }

  const newLines = [...lines.slice(0, headerIdx), ...bulletLines, ...lines.slice(i)];
  return { content: newLines.join("\n"), converted: true, pagesFromHeader };
}

function countPageHeadingsFallback(content: string): number {
  const matches = content.match(/^## หน้า /gm);
  return matches ? matches.length : 0;
}

// Files under 1 MB round to "0.0 MB" / "0.1 MB" in the MB-only format, which
// reads like an empty file in the UI — express those in KB instead.
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

interface FileReportEntry {
  file: string;
  title: string;
  machineModel: string;
  category: ManualCategory;
  pagesCount: number;
  fileSizeBytes: number;
  fileSize: string;
  metadataTableConverted: boolean;
  status: "would-insert" | "inserted" | "skipped-existing" | "would-update" | "updated" | "FAILED";
  error?: string;
}

const results: FileReportEntry[] = [];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Import starting. dryRun=${DRY_RUN} only=${ONLY ?? "(all files)"} update=${UPDATE} uploadDate=${UPLOAD_DATE} uploadedBy="${UPLOADED_BY}"`);
  console.log(`Manual_MD dir: ${MANUAL_MD_DIR}`);

  // Verify every catalogued file exists BEFORE doing anything else — fail
  // loudly listing all missing files rather than partially importing.
  const missing: string[] = [];
  for (const m of MANUALS) {
    const abs = resolveManualPath(m.file);
    if (!fs.existsSync(abs)) missing.push(`${m.file}  (resolved: ${abs})`);
  }
  if (missing.length > 0) {
    console.error(`\n[FAIL] ${missing.length} manual file(s) from the catalog were not found:`);
    for (const f of missing) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`All ${MANUALS.length} catalogued files found on disk.`);

  // Fetch existing titles once, for idempotency (skip-if-already-imported).
  // Done even in --dry-run so the report accurately reflects what a real run
  // would do; if this fails (env/network), surface the failure rather than
  // silently pretending nothing exists yet.
  console.log("Fetching existing manuals (id, title, chunk_count) for idempotency check...");
  const { data: existingRows, error: fetchErr } = await supabase
    .from("manuals")
    .select("id,title,chunk_count");
  if (fetchErr) {
    throw new Error(`Failed to fetch existing manuals titles: ${fetchErr.message}`);
  }
  type ExistingRow = { id: string; title: string; chunk_count: number | null };
  const existingByTitle = new Map<string, ExistingRow>(
    (existingRows ?? []).map((r: ExistingRow) => [r.title, r])
  );
  console.log(`Found ${existingByTitle.size} existing manual row(s) in the database.\n`);

  const toProcess = MANUALS.filter((m) => wants(m.file));
  let failedCount = 0;
  let staleIndexCount = 0;

  for (const m of toProcess) {
    const abs = resolveManualPath(m.file);
    try {
      const rawContent = fs.readFileSync(abs, "utf-8");
      const { content, converted, pagesFromHeader } = convertMetadataTable(rawContent);
      const pagesCount = pagesFromHeader ?? countPageHeadingsFallback(content);
      const fileSizeBytes = fs.statSync(abs).size;
      const fileSize = formatFileSize(fileSizeBytes);

      const existing = existingByTitle.get(m.title);
      if (existing && !UPDATE) {
        console.log(`[skip] "${m.title}" (${m.file}) — already exists in manuals table`);
        results.push({
          file: m.file,
          title: m.title,
          machineModel: m.machineModel,
          category: m.category,
          pagesCount,
          fileSizeBytes,
          fileSize,
          metadataTableConverted: converted,
          status: "skipped-existing",
        });
        continue;
      }

      if (existing && UPDATE) {
        const wasIndexed = existing.chunk_count != null;
        if (DRY_RUN) {
          console.log(
            `[ok]   (dry-run) would update "${m.title}" | id=${existing.id} | pages=${pagesCount} | size=${fileSize} | metadataTableConverted=${converted}`
          );
          results.push({
            file: m.file,
            title: m.title,
            machineModel: m.machineModel,
            category: m.category,
            pagesCount,
            fileSizeBytes,
            fileSize,
            metadataTableConverted: converted,
            status: "would-update",
          });
          continue;
        }

        console.log(`Updating "${m.title}" (${m.file}, ${fileSize})...`);
        const { error: updErr } = await supabase
          .from("manuals")
          .update({
            markdown_content: content,
            file_size: fileSize,
            pages_count: pagesCount,
          })
          .eq("id", existing.id);
        if (updErr) throw new Error(updErr.message);

        console.log(`[ok]   "${m.title}" updated (id=${existing.id}).`);
        if (wasIndexed) {
          staleIndexCount++;
          console.warn(
            `[warn] "${m.title}" (id=${existing.id}) had an existing AI index (chunk_count=${existing.chunk_count}) that is now STALE — markdown_content changed. Rebuild it via POST /api/manuals/${existing.id}/index.`
          );
        }
        results.push({
          file: m.file,
          title: m.title,
          machineModel: m.machineModel,
          category: m.category,
          pagesCount,
          fileSizeBytes,
          fileSize,
          metadataTableConverted: converted,
          status: "updated",
        });
        continue;
      }

      if (DRY_RUN) {
        console.log(
          `[ok]   (dry-run) "${m.title}" | model=${m.machineModel} | category=${m.category} | pages=${pagesCount} | size=${fileSize} | metadataTableConverted=${converted}`
        );
        results.push({
          file: m.file,
          title: m.title,
          machineModel: m.machineModel,
          category: m.category,
          pagesCount,
          fileSizeBytes,
          fileSize,
          metadataTableConverted: converted,
          status: "would-insert",
        });
        continue;
      }

      const row = {
        id: randomUUID(),
        title: m.title,
        machine_model: m.machineModel,
        category: m.category,
        upload_date: UPLOAD_DATE,
        uploaded_by: UPLOADED_BY,
        file_size: fileSize,
        pages_count: pagesCount,
        ai_indexed: false,
        tags: [...m.tags],
        markdown_content: content,
        file_path: null,
      };

      console.log(`Inserting "${m.title}" (${m.file}, ${fileSize})...`);
      const { error: insErr } = await supabase.from("manuals").insert(row);
      if (insErr) throw new Error(insErr.message);

      console.log(`[ok]   "${m.title}" inserted.`);
      results.push({
        file: m.file,
        title: m.title,
        machineModel: m.machineModel,
        category: m.category,
        pagesCount,
        fileSizeBytes,
        fileSize,
        metadataTableConverted: converted,
        status: "inserted",
      });
    } catch (err) {
      failedCount++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] "${m.title}" (${m.file}): ${message}`);
      results.push({
        file: m.file,
        title: m.title,
        machineModel: m.machineModel,
        category: m.category,
        pagesCount: 0,
        fileSizeBytes: 0,
        fileSize: "0.0 MB",
        metadataTableConverted: false,
        status: "FAILED",
        error: message,
      });
    }
  }

  // Write report
  const reportPath = path.join(process.cwd(), "scripts", "import-manuals-report.json");
  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    only: ONLY,
    uploadDate: UPLOAD_DATE,
    uploadedBy: UPLOADED_BY,
    totalCatalogued: MANUALS.length,
    totalProcessed: toProcess.length,
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  // Print summary
  const inserted = results.filter((r) => r.status === "inserted").length;
  const wouldInsert = results.filter((r) => r.status === "would-insert").length;
  const skipped = results.filter((r) => r.status === "skipped-existing").length;
  const updated = results.filter((r) => r.status === "updated").length;
  const wouldUpdate = results.filter((r) => r.status === "would-update").length;

  console.log("\n=== Import Summary ===");
  console.log(
    "file".padEnd(55),
    "pages".padStart(6),
    "size".padStart(10),
    "tableConv".padStart(10),
    "status".padStart(16)
  );
  for (const r of results) {
    console.log(
      r.file.padEnd(55),
      String(r.pagesCount).padStart(6),
      r.fileSize.padStart(10),
      String(r.metadataTableConverted).padStart(10),
      r.status.padStart(16)
    );
  }
  console.log(
    `\nCatalogued: ${MANUALS.length}  Processed: ${toProcess.length}  Inserted: ${inserted}  WouldInsert(dry-run): ${wouldInsert}  Skipped(existing): ${skipped}  Updated: ${updated}  WouldUpdate(dry-run): ${wouldUpdate}  Failed: ${failedCount}`
  );
  if (DRY_RUN) {
    console.log("(dry-run: no DB writes performed; 'would-insert'/'would-update' rows above are what a real run would do)");
  }
  if (staleIndexCount > 0) {
    console.log(
      `\n[warn] ${staleIndexCount} manual(s) updated above had an existing AI index that is now STALE. Rebuild each via POST /api/manuals/:id/index (see [warn] lines above for the affected ids).`
    );
  }
  console.log(`Report written to ${reportPath}`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
