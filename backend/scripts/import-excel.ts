// Excel -> Supabase one-time/rerunnable import script.
// See docs/data-import-spec.md (Sections 1, 3, 4, 6) for the full authoritative mapping.
//
// Usage:
//   npm run import:excel -- --dry-run          (parse + validate + write report, NO db writes)
//   npm run import:excel -- --only=machines    (only process one table)
//   npm run import:excel                       (LIVE import — writes to Supabase)
//
// Valid --only values: machines | spare_parts | work_orders | work_order_parts | pm_plans | part_withdrawals

import path from "node:path";
import fs from "node:fs";
import XLSX from "xlsx";
import {
  nullify,
  parseExcelDate,
  parseExcelDateTime,
  parseNumeric,
  parseIntSafe,
  normalizeMachineCode,
  splitFlags,
  splitPipe,
  parseBoolish,
} from "./lib/normalize.js";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length).trim() : null;

const VALID_TABLES = ["machines", "spare_parts", "work_orders", "work_order_parts", "pm_plans", "part_withdrawals"];
if (ONLY && !VALID_TABLES.includes(ONLY)) {
  console.error(`Invalid --only value "${ONLY}". Valid values: ${VALID_TABLES.join(", ")}`);
  process.exit(1);
}

function wants(table: string): boolean {
  return !ONLY || ONLY === table;
}

const DATA_DIR = path.join(process.cwd(), "data");
const BATCH_SIZE = 500;
// Chunk size for the work_order_parts bulk DELETE ... IN (work_order_id, ...) query.
// Measured against real Work_Order_No values (e.g. "WO1000"): 500 ids -> ~5.0KB URL,
// 1000 ids -> ~9.9KB (would risk the same HTTP 414 / large_client_header_buffers issue
// as the removed machines .in() pre-check, whose 8KB request tripped an ~8.09KB URL
// against nginx/Kong's typical 8,192-byte header-buffer ceiling). 500 keeps ~39% margin.
const DELETE_CHUNK_SIZE = 500;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ---------------------------------------------------------------------------
// Lazy Supabase client — only loaded/initialized when actually writing to the DB,
// so --dry-run works even without valid Supabase credentials in backend/.env.
// ---------------------------------------------------------------------------

let _supabase: Awaited<ReturnType<typeof loadSupabase>> | null = null;
async function loadSupabase() {
  const mod = await import("../src/lib/supabase.js");
  return mod.supabase;
}
async function getSupabase() {
  if (!_supabase) _supabase = await loadSupabase();
  return _supabase;
}

// ---------------------------------------------------------------------------
// Reject log
// ---------------------------------------------------------------------------

interface RejectEntry {
  file: string;
  sheet: string;
  row: number; // Excel row number (1 = header, first data row = 2)
  column: string;
  rawValue: unknown;
  reason: string;
}

const rejects: RejectEntry[] = [];

function reject(file: string, sheet: string, row: number, column: string, rawValue: unknown, reason: string): void {
  rejects.push({ file, sheet, row, column, rawValue, reason });
}

interface TableSummary {
  table: string;
  rowsRead: number;
  upserted: number; // rows written via upsert (insert-or-update; the two aren't distinguished — see upsertBatches)
  rejectedRows: number; // rows with >=1 rejected field
  skipped: number; // rows dropped entirely (missing primary key)
}

const summaries: TableSummary[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSheet(file: string, sheet: string): Record<string, unknown>[] {
  const fp = path.join(DATA_DIR, file);
  const wb = XLSX.readFile(fp);
  const ws = wb.Sheets[sheet];
  if (!ws) {
    throw new Error(`Sheet "${sheet}" not found in ${file}. Available sheets: ${wb.SheetNames.join(", ")}`);
  }
  return XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
}

/**
 * Upserts `rows` in batches of BATCH_SIZE, on `onConflict`. Returns the count of rows
 * upserted (insert-or-update aren't distinguished).
 *
 * This used to run a `.select(onConflict).in(onConflict, ids)` pre-check before each
 * upsert just to classify insert vs. update — but that meant a GET request with every
 * id in the batch encoded into the query string. For `machines` (Row_Key values like
 * "AS-955#0001", where every "#" and separator gets percent-encoded) a 500-row batch
 * measured ~8.09KB — a hair under nginx/Kong's typical 8,192-byte
 * large_client_header_buffers ceiling, i.e. one bad batch away from an HTTP 414 that
 * would abort the whole import. The upsert POST body itself has no such limit (body
 * size, not header/query-string size), so dropping the pre-check entirely removes the
 * risk rather than just shrinking it — and it also halves the number of requests.
 */
async function upsertBatches(table: string, rows: Record<string, unknown>[], onConflict: string): Promise<number> {
  if (rows.length === 0) return 0;
  const supabase = await getSupabase();
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`upsert failed for ${table} (batch starting at row ${i}): ${error.message}`);
    upserted += batch.length;
  }
  return upserted;
}

// ---------------------------------------------------------------------------
// 1. machines  <-  Machine_Database.xlsx / Machine_Clean
// ---------------------------------------------------------------------------

const MACHINES_FILE = "Machine_Database.xlsx";
const MACHINES_SHEET = "Machine_Clean";

function transformMachines(raw: Record<string, any>[]) {
  const out: Record<string, unknown>[] = [];
  let rejectedRows = 0;
  let skipped = 0;

  raw.forEach((r, i) => {
    const rowNum = i + 2;
    let rowRejects = 0;

    const id = nullify(r.Row_Key);
    if (!id) {
      reject(MACHINES_FILE, MACHINES_SHEET, rowNum, "Row_Key", r.Row_Key, "missing primary key (Row_Key) — row skipped");
      skipped++;
      return;
    }

    const code = normalizeMachineCode(r.QR_Code_Clean);

    let name = nullify(r.Machine_Desc_Clean);
    if (!name) {
      reject(MACHINES_FILE, MACHINES_SHEET, rowNum, "Machine_Desc_Clean", r.Machine_Desc_Clean, "blank machine name (not-null column); falling back to code/id");
      name = code ?? id;
      rowRejects++;
    }

    out.push({
      id,
      code,
      qr_prefix: nullify(r.QR_Prefix),
      dup_qr_count: parseIntSafe(r.Dup_QR_Count),
      source_no: nullify(r.No_Clean),
      location: nullify(r.Location_Clean),
      factory_group: nullify(r.Factory_Group),
      department_code: nullify(r.Department_Clean),
      dept_prefix: nullify(r.Dept_Prefix),
      section: nullify(r.Section_Clean),
      responsible_group: nullify(r.Responsible_Group),
      cost_center: nullify(r.Cost_Center_Clean),
      category: nullify(r.Category_Clean),
      name,
      production_name: nullify(r.Production_Name_Clean),
      related_qr_code: normalizeMachineCode(r.Related_QR_Ref),
      lifecycle_status: nullify(r.Status_Clean),
      quality_flags: splitFlags(r.Quality_Flag),
      info_notes: splitFlags(r.Info_Note),
    });

    if (rowRejects > 0) rejectedRows++;
  });

  return { rows: out, rejectedRows, skipped };
}

// ---------------------------------------------------------------------------
// 2. spare_parts  <-  Inventory_Spare_Items.xlsx / Data_Clean
// ---------------------------------------------------------------------------

const SPARE_PARTS_FILE = "Inventory_Spare_Items.xlsx";
const SPARE_PARTS_SHEET = "Data_Clean";

function computeStatus(stockQuantity: number, minThreshold: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= minThreshold) return "low_stock";
  return "in_stock";
}

/** Status_Life_Cycle_Clean has a documented typo variant (Cleaning_Rules rule 3): "Discountinued" -> "Discontinued". */
function normalizeLifecycleStatus(v: string | null): string | null {
  if (v === null) return null;
  const upper = v.toUpperCase();
  if (upper === "DISCOUNTINUED" || upper === "DISCONTINUED") return "Discontinued";
  if (upper === "CONTINUED") return "Continued";
  return v;
}

function transformSpareParts(raw: Record<string, any>[]) {
  const out: Record<string, unknown>[] = [];
  let rejectedRows = 0;
  let skipped = 0;

  raw.forEach((r, i) => {
    const rowNum = i + 2;
    let rowRejects = 0;

    const id = nullify(r.ID);
    if (!id) {
      reject(SPARE_PARTS_FILE, SPARE_PARTS_SHEET, rowNum, "ID", r.ID, "missing primary key (ID) — row skipped");
      skipped++;
      return;
    }

    let code = nullify(r.Code_Number);
    if (!code) {
      reject(SPARE_PARTS_FILE, SPARE_PARTS_SHEET, rowNum, "Code_Number", r.Code_Number, "blank code (unique not-null column); falling back to id");
      code = `SP-${id}`;
      rowRejects++;
    }

    let name = nullify(r.Part_Name);
    if (!name) {
      reject(SPARE_PARTS_FILE, SPARE_PARTS_SHEET, rowNum, "Part_Name", r.Part_Name, "blank part name (not-null column); falling back to code");
      name = code;
      rowRejects++;
    }

    const hasValidPartNumber = parseBoolish(r.Has_Valid_PartNumber);
    if (hasValidPartNumber === null && nullify(r.Has_Valid_PartNumber) !== null) {
      reject(SPARE_PARTS_FILE, SPARE_PARTS_SHEET, rowNum, "Has_Valid_PartNumber", r.Has_Valid_PartNumber, "unrecognized boolean token, expected YES/NO");
      rowRejects++;
    }

    const sourceModifiedDate = parseExcelDate(r.Modified);
    if (sourceModifiedDate === null && nullify(r.Modified) !== null) {
      reject(SPARE_PARTS_FILE, SPARE_PARTS_SHEET, rowNum, "Modified", r.Modified, "unparseable date");
      rowRejects++;
    }

    const stockQuantity = parseIntSafe(r.Inventory) ?? 0;
    const reorderPoint = parseIntSafe(r.Reorder_Point);
    const minThreshold = reorderPoint ?? 0;
    const lifecycleStatus = normalizeLifecycleStatus(nullify(r.Status_Life_Cycle_Clean));

    out.push({
      id,
      code,
      name,
      part_number: nullify(r.Part_Number_Clean),
      has_valid_part_number: hasValidPartNumber,
      movement_status: nullify(r.Movement_Status),
      aging_bucket: nullify(r.Aging_Bucket),
      brand: nullify(r.Band_Name_Clean),
      group_code: nullify(r.Group_Code),
      category: nullify(r.Product_Group_Code),
      location_rack: nullify(r.Shelf_Number),
      stock_quantity: stockQuantity,
      unit_price_thb: parseNumeric(r.Unit_Cost),
      inventory_value: parseNumeric(r.Inventory_Value),
      max_inventory: parseIntSafe(r.Maximum_Inventory),
      reorder_point: reorderPoint,
      min_threshold: minThreshold,
      safety_stock_quantity: parseIntSafe(r.Safety_Stock_Quantity),
      safety_lead_time_days: parseNumeric(r.Safety_Lead_Time_Days),
      lifecycle_status: lifecycleStatus,
      extra_description: nullify(r.Original_Description),
      area_code: nullify(r.Area_Code),
      source_modified_date: sourceModifiedDate,
      stock_status_label: nullify(r.Stock_Status),
      quality_flags: splitFlags(r.Data_Quality_Flag),
      status: computeStatus(stockQuantity, minThreshold),
    });

    if (rowRejects > 0) rejectedRows++;
  });

  return { rows: out, rejectedRows, skipped };
}

// ---------------------------------------------------------------------------
// 3. work_orders + work_order_parts  <-  Machine Repaire History.xlsx / Clean_Data
// ---------------------------------------------------------------------------

const WORK_ORDERS_FILE = "Machine Repaire History.xlsx";
const WORK_ORDERS_SHEET = "Clean_Data";

/**
 * Section 7 open question #1 (working default, flagged for lead sign-off):
 * Urgency "ด่วน" -> high; Urgency "ซ่อมตามการวางแผน" -> low;
 * Work_Type "งานซ่อมทั่วไป" -> medium; everything else (ไม่ระบุ / blank / unmapped
 * Work_Type values like "งาน Safety patrol" / "งาน QCD") -> medium.
 * Urgency and Work_Type are two separate source columns whose value sets don't
 * overlap in the data — Urgency never contains "งานซ่อมทั่วไป" and Work_Type never
 * contains "ด่วน"/"ซ่อมตามการวางแผน" (confirmed by direct inspection) — so Urgency is
 * checked first, falling back to Work_Type.
 */
function derivePriority(urgency: string | null, workType: string | null): "high" | "medium" | "low" {
  if (urgency === "ด่วน") return "high";
  if (urgency === "ซ่อมตามการวางแผน") return "low";
  if (workType === "งานซ่อมทั่วไป") return "medium";
  return "medium";
}

function transformWorkOrders(raw: Record<string, any>[]) {
  const workOrders: Record<string, unknown>[] = [];
  const partsByWorkOrder = new Map<string, Record<string, unknown>[]>();
  let rejectedRows = 0;
  let skipped = 0;

  raw.forEach((r, i) => {
    const rowNum = i + 2;
    let rowRejects = 0;

    const id = nullify(r.Work_Order_No);
    if (!id) {
      reject(WORK_ORDERS_FILE, WORK_ORDERS_SHEET, rowNum, "Work_Order_No", r.Work_Order_No, "missing primary key — row skipped");
      skipped++;
      return;
    }

    const assignedDate = parseExcelDate(r.Report_DateTime);
    if (assignedDate === null && nullify(r.Report_DateTime) !== null) {
      reject(WORK_ORDERS_FILE, WORK_ORDERS_SHEET, rowNum, "Report_DateTime", r.Report_DateTime, "unparseable date");
      rowRejects++;
    }

    const finishDatetime = parseExcelDateTime(r.Finish_DateTime);
    if (finishDatetime === null && nullify(r.Finish_DateTime) !== null) {
      reject(WORK_ORDERS_FILE, WORK_ORDERS_SHEET, rowNum, "Finish_DateTime", r.Finish_DateTime, "unparseable datetime");
      rowRejects++;
    }
    const dueDate = parseExcelDate(r.Finish_DateTime);

    const timeRefProduction = parseExcelDateTime(r.TimeRef_Production);
    if (timeRefProduction === null && nullify(r.TimeRef_Production) !== null) {
      reject(WORK_ORDERS_FILE, WORK_ORDERS_SHEET, rowNum, "TimeRef_Production", r.TimeRef_Production, "unparseable datetime");
      rowRejects++;
    }

    const urgency = nullify(r.Urgency);
    const workType = nullify(r.Work_Type);
    const priority = derivePriority(urgency, workType);
    const status: "completed" | "pending" = finishDatetime ? "completed" : "pending";

    let title = nullify(r.Symptom);
    if (!title) {
      reject(WORK_ORDERS_FILE, WORK_ORDERS_SHEET, rowNum, "Symptom", r.Symptom, "blank symptom (feeds not-null title); falling back to work order no");
      title = id;
      rowRejects++;
    }

    const machineCode = normalizeMachineCode(r.QR_Code); // blank -> null; 31 rows expected, not a reject

    workOrders.push({
      id,
      code: id,
      title,
      machine_id: null,
      priority,
      status,
      technician_name: nullify(r.Technician_1),
      engineer_reviewer: nullify(r.PD_Responsible_Name),
      assigned_date: assignedDate,
      due_date: dueDate,
      description: title,
      requested_by: nullify(r.Reporter_Name),
      machine_code: machineCode,
      fy: parseIntSafe(r.FY),
      shift: nullify(r.Shift),
      section_response: nullify(r.Section_Response),
      line_location: nullify(r.Line_Location_Clean),
      machine_name_raw: nullify(r.Machine_Name_Raw),
      machine_name_std: nullify(r.Machine_Name_Std),
      machine_variant: nullify(r.Machine_Variant),
      repair_category: nullify(r.Repair_Category),
      damage_source: nullify(r.Damage_Source),
      pd_nickname: nullify(r.PD_Nickname),
      technicians: splitPipe(r.Technician_List),
      technician_count: parseIntSafe(r.Technician_Count),
      cause: nullify(r.Cause),
      repair_action: nullify(r.Action),
      mt_leader_name: nullify(r.MT_Leader_Name),
      finish_datetime: finishDatetime,
      time_ref_production: timeRefProduction,
      mtloss_min: parseNumeric(r.MTLoss_Min),
      repair_duration_min: parseNumeric(r.Repair_Duration_Min),
      mtloss_diff_min: parseNumeric(r.MTLoss_Diff_Min),
      data_quality_flags: splitFlags(r.Data_Quality_Flag),
    });

    if (rowRejects > 0) rejectedRows++;

    const parts: Record<string, unknown>[] = [];
    const p1Name = nullify(r.Part1_Name);
    const p1Model = nullify(r.Part1_Model_Clean);
    if (p1Name || p1Model) {
      parts.push({
        work_order_id: id,
        part_id: null,
        part_code: p1Model,
        part_name: p1Name,
        quantity: parseIntSafe(r.Part1_Qty) ?? 0,
        status: nullify(r.Part1_Status),
        part_position: nullify(r.Part1_Position),
        part_model_raw: nullify(r.Part1_Model_Raw),
        source: "import",
      });
    }
    const p2Name = nullify(r.Part2_Name);
    const p2Model = nullify(r.Part2_Model_Clean);
    if (p2Name || p2Model) {
      parts.push({
        work_order_id: id,
        part_id: null,
        part_code: p2Model,
        part_name: p2Name,
        quantity: parseIntSafe(r.Part2_Qty) ?? 0,
        status: nullify(r.Part2_Status),
        part_position: nullify(r.Part2_Position),
        part_model_raw: nullify(r.Part2_Model_Raw),
        source: "import",
      });
    }
    if (parts.length > 0) partsByWorkOrder.set(id, parts);
  });

  return { workOrders, partsByWorkOrder, rejectedRows, skipped };
}

// ---------------------------------------------------------------------------
// 4. pm_plans  <-  PM PLAN (แผนการทำ PM).xlsx / Clean_PM_Plan
// ---------------------------------------------------------------------------

const PM_PLANS_FILE = "PM PLAN (แผนการทำ PM).xlsx";
const PM_PLANS_SHEET = "Clean_PM_Plan";

function transformPmPlans(raw: Record<string, any>[]) {
  const out: Record<string, unknown>[] = [];
  let rejectedRows = 0;
  let skipped = 0;

  raw.forEach((r, i) => {
    const rowNum = i + 2;
    let rowRejects = 0;

    const id = nullify(r.ID);
    if (!id) {
      reject(PM_PLANS_FILE, PM_PLANS_SHEET, rowNum, "ID", r.ID, "missing primary key — row skipped");
      skipped++;
      return;
    }

    const dateCols: [string, string][] = [
      ["PlanMonth", "plan_date"],
      ["ActualMonth", "actual_date"],
      ["LastPMDate", "last_pm_date"],
      ["NextPMDate", "next_pm_date"],
    ];
    const parsedDates: Record<string, string | null> = {};
    for (const [srcCol] of dateCols) {
      const parsed = parseExcelDate(r[srcCol]);
      if (parsed === null && nullify(r[srcCol]) !== null) {
        reject(PM_PLANS_FILE, PM_PLANS_SHEET, rowNum, srcCol, r[srcCol], "unparseable date");
        rowRejects++;
      }
      parsedDates[srcCol] = parsed;
    }

    const isOverdue = parseBoolish(r.Is_Overdue);
    if (isOverdue === null && nullify(r.Is_Overdue) !== null) {
      reject(PM_PLANS_FILE, PM_PLANS_SHEET, rowNum, "Is_Overdue", r.Is_Overdue, "unrecognized token, expected OVERDUE/ON_SCHEDULE");
      rowRejects++;
    }
    const hasCost = parseBoolish(r.Has_Cost);
    if (hasCost === null && nullify(r.Has_Cost) !== null) {
      reject(PM_PLANS_FILE, PM_PLANS_SHEET, rowNum, "Has_Cost", r.Has_Cost, "unrecognized token, expected YES/NO");
      rowRejects++;
    }

    out.push({
      id,
      ref_work_order_no: nullify(r.Ref_ID_Work01),
      machine_code: normalizeMachineCode(r.QRCODE_Clean),
      machine_base_name: nullify(r.Machine_Base_Name),
      machine_code_in_name: nullify(r.Machine_Code_In_Name),
      line_location: nullify(r.LineLocation_Clean),
      position_name: nullify(r.PositionName_Clean),
      pm_type: nullify(r.PM_Type),
      pm_type_code: nullify(r.PM_Type_Code),
      status_th: nullify(r.StatusItems_Raw),
      status_code: nullify(r.Status_EN),
      work_type: nullify(r.TypeWork),
      action: nullify(r.Action),
      priority: nullify(r.Priority),
      item_description: nullify(r.Items_Clean),
      part_name: nullify(r.PartName_Clean),
      part_model: nullify(r.Model_Clean),
      spare_id: nullify(r.Spare_ID),
      qty: parseNumeric(r.Qty_Clean),
      cost: parseNumeric(r.Cost),
      period_days: parseIntSafe(r.PeriodDay),
      plan_date: parsedDates.PlanMonth,
      actual_date: parsedDates.ActualMonth,
      last_pm_date: parsedDates.LastPMDate,
      next_pm_date: parsedDates.NextPMDate,
      remark1: nullify(r.Remark1_Clean),
      remark2: nullify(r.Remark2_Clean),
      responsible_email: nullify(r.Responsible_Email),
      planner: nullify(r.Planner),
      responsible: nullify(r.Responsible),
      cdb_before_value: parseNumeric(r.CdB_Before_Value),
      cdb_before_unit: nullify(r.CdB_Before_Unit),
      cdb_after_value: parseNumeric(r.CdB_After_Value),
      cdb_after_unit: nullify(r.CdB_After_Unit),
      plan_year: parseIntSafe(r.Plan_Year),
      plan_year_month: nullify(r.Plan_Year_Month),
      is_overdue: isOverdue,
      quality_flags: splitFlags(r.Data_Quality_Flag),
      has_cost: hasCost,
    });

    if (rowRejects > 0) rejectedRows++;
  });

  return { rows: out, rejectedRows, skipped };
}

// ---------------------------------------------------------------------------
// 5. part_withdrawals  <-  ประวัติการเบิกอะไหล่ (SparePart).xlsx / Data_Clean
// ---------------------------------------------------------------------------

const PART_WITHDRAWALS_FILE = "ประวัติการเบิกอะไหล่ (SparePart).xlsx";
const PART_WITHDRAWALS_SHEET = "Data_Clean";

function transformPartWithdrawals(raw: Record<string, any>[]) {
  const out: Record<string, unknown>[] = [];
  let rejectedRows = 0;
  let skipped = 0;

  raw.forEach((r, i) => {
    const rowNum = i + 2;
    let rowRejects = 0;

    const id = nullify(r.Row_ID);
    if (!id) {
      reject(PART_WITHDRAWALS_FILE, PART_WITHDRAWALS_SHEET, rowNum, "Row_ID", r.Row_ID, "missing primary key — row skipped");
      skipped++;
      return;
    }

    const withdrawDate = parseExcelDate(r.Withdraw_Date);
    if (withdrawDate === null && nullify(r.Withdraw_Date) !== null) {
      reject(PART_WITHDRAWALS_FILE, PART_WITHDRAWALS_SHEET, rowNum, "Withdraw_Date", r.Withdraw_Date, "unparseable date");
      rowRejects++;
    }

    const isAggregate = parseBoolish(r.Is_Aggregate);
    if (isAggregate === null && nullify(r.Is_Aggregate) !== null) {
      reject(PART_WITHDRAWALS_FILE, PART_WITHDRAWALS_SHEET, rowNum, "Is_Aggregate", r.Is_Aggregate, "unrecognized token, expected TRUE/FALSE");
      rowRejects++;
    }

    out.push({
      id,
      withdraw_date: withdrawDate,
      withdraw_month: nullify(r.Withdraw_Month),
      code_no: nullify(r.CodeNO_Clean),
      code_no_raw: nullify(r.CodeNO_Raw),
      part_name: nullify(r.Part_Name_Clean),
      part_number: nullify(r.Part_Number_Clean),
      pack_info: nullify(r.Pack_Info),
      condition_status: nullify(r.Condition_Status),
      movement_status: nullify(r.Movement_Status),
      shelf_number: nullify(r.Shelf_Number_Clean),
      shelf_type: nullify(r.Shelf_Type),
      brand: nullify(r.Brand_Clean),
      brand_note: nullify(r.Brand_Note),
      qty: parseNumeric(r.Qty),
      price_per_unit: parseNumeric(r.Price_Per_Unit),
      total_value: parseNumeric(r.Total_Value),
      group_line_location: nullify(r.Group_Line_Location_Clean),
      line_location: nullify(r.Line_Location_Clean),
      factory: nullify(r.Location_List_Clean),
      machine_code: normalizeMachineCode(r.Number_Machine_Clean),
      machine_note_raw: nullify(r.Machine_Note_Raw),
      machine_code_alt: normalizeMachineCode(r.Machine_No_Alt),
      process_detail: nullify(r.Process_Detail),
      machine_name: nullify(r.Name_Machine_Clean),
      user_name: nullify(r.User_Name_Clean),
      department: nullify(r.Department_Clean),
      is_aggregate: isAggregate,
      quality_flags: splitFlags(r.Quality_Flag),
    });

    if (rowRejects > 0) rejectedRows++;
  });

  return { rows: out, rejectedRows, skipped };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Import starting. dryRun=${DRY_RUN} only=${ONLY ?? "(all tables)"}`);

  // 1. machines
  if (wants("machines")) {
    const raw = readSheet(MACHINES_FILE, MACHINES_SHEET);
    const { rows, rejectedRows, skipped } = transformMachines(raw);
    const upserted = DRY_RUN ? rows.length : await upsertBatches("machines", rows, "id");
    summaries.push({ table: "machines", rowsRead: raw.length, upserted, rejectedRows, skipped });
  }

  // 2. spare_parts
  if (wants("spare_parts")) {
    const raw = readSheet(SPARE_PARTS_FILE, SPARE_PARTS_SHEET);
    const { rows, rejectedRows, skipped } = transformSpareParts(raw);
    const upserted = DRY_RUN ? rows.length : await upsertBatches("spare_parts", rows, "id");
    summaries.push({ table: "spare_parts", rowsRead: raw.length, upserted, rejectedRows, skipped });
  }

  // 3. work_orders + work_order_parts — both derive from the same sheet read/transform,
  // so read it whenever either is wanted; each table is only summarized/written when
  // specifically requested (this is what makes `--only=work_order_parts` work).
  if (wants("work_orders") || wants("work_order_parts")) {
    const raw = readSheet(WORK_ORDERS_FILE, WORK_ORDERS_SHEET);
    const { workOrders, partsByWorkOrder, rejectedRows, skipped } = transformWorkOrders(raw);

    if (wants("work_orders")) {
      const upserted = DRY_RUN ? workOrders.length : await upsertBatches("work_orders", workOrders, "id");
      summaries.push({ table: "work_orders", rowsRead: raw.length, upserted, rejectedRows, skipped });
    }

    if (wants("work_order_parts")) {
      const workOrderIds = [...partsByWorkOrder.keys()];
      const allPartRows = [...partsByWorkOrder.values()].flat();

      let upserted = 0;
      if (!DRY_RUN) {
        const supabase = await getSupabase();
        // Bulk delete, chunked to stay well under the header-buffer URL-length ceiling
        // (see DELETE_CHUNK_SIZE comment above). Filtered to source='import' so manually
        // added parts on an imported work order survive a re-run (fix for a prior bug:
        // deleting by work_order_id alone would wipe app-entered rows too).
        for (const idChunk of chunkArray(workOrderIds, DELETE_CHUNK_SIZE)) {
          const { error: delErr } = await supabase
            .from("work_order_parts")
            .delete()
            .eq("source", "import")
            .in("work_order_id", idChunk);
          if (delErr) throw new Error(`bulk delete work_order_parts failed: ${delErr.message}`);
        }
        // Bulk insert, batched like every other table (all rows already have source: 'import' set).
        for (const rowsChunk of chunkArray(allPartRows, BATCH_SIZE)) {
          const { error: insErr } = await supabase.from("work_order_parts").insert(rowsChunk);
          if (insErr) throw new Error(`bulk insert work_order_parts failed: ${insErr.message}`);
          upserted += rowsChunk.length;
        }
      } else {
        upserted = allPartRows.length;
      }

      summaries.push({
        table: "work_order_parts",
        rowsRead: allPartRows.length,
        upserted,
        rejectedRows: 0,
        skipped: 0,
      });
    }
  }

  // 4. pm_plans
  if (wants("pm_plans")) {
    const raw = readSheet(PM_PLANS_FILE, PM_PLANS_SHEET);
    const { rows, rejectedRows, skipped } = transformPmPlans(raw);
    const upserted = DRY_RUN ? rows.length : await upsertBatches("pm_plans", rows, "id");
    summaries.push({ table: "pm_plans", rowsRead: raw.length, upserted, rejectedRows, skipped });
  }

  // 5. part_withdrawals
  if (wants("part_withdrawals")) {
    const raw = readSheet(PART_WITHDRAWALS_FILE, PART_WITHDRAWALS_SHEET);
    const { rows, rejectedRows, skipped } = transformPartWithdrawals(raw);
    const upserted = DRY_RUN ? rows.length : await upsertBatches("part_withdrawals", rows, "id");
    summaries.push({ table: "part_withdrawals", rowsRead: raw.length, upserted, rejectedRows, skipped });
  }

  // Write report
  const reportPath = path.join(process.cwd(), "scripts", "import-report.json");
  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    only: ONLY,
    summaries,
    rejectCount: rejects.length,
    rejects,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  // Print summary
  console.log("\n=== Import summary ===");
  console.log("table".padEnd(20), "read".padStart(8), "upserted".padStart(10), "rejectedRows".padStart(14), "skipped".padStart(9));
  for (const s of summaries) {
    console.log(
      s.table.padEnd(20),
      String(s.rowsRead).padStart(8),
      String(s.upserted).padStart(10),
      String(s.rejectedRows).padStart(14),
      String(s.skipped).padStart(9)
    );
  }
  console.log(`\nTotal rejected fields logged: ${rejects.length}`);
  if (DRY_RUN) {
    console.log("(dry-run: no DB writes performed; 'upserted' above = rows that would be written)");
  }
  console.log(`Report written to ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
