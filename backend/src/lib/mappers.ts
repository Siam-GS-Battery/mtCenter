// Maps snake_case Supabase rows to the camelCase API shapes defined in
// frontend/src/types.ts. Keep these in sync with that file.

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  role: "technician" | "engineer" | "supervisor";
  employeeId: string;
  avatarUrl?: string;
  department: string;
}

// The imported factory data (973 rows) has no Excel source for model,
// last/next maintenance, health score, spindle temp, vibration or operating
// hours — every one of those columns is null for every row. Declaring them
// non-nullable made TypeScript hide the fact from every consumer.
export interface Machine {
  id: string;
  code: string | null;
  name: string;
  model: string | null;
  location: string | null;
  status: "normal" | "warning" | "error" | "maintenance";
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  healthScore: number | null;
  spindleTemp: number | null;
  vibrationMms: number | null;
  operatingHours: number | null;
  qrCodeUrl?: string;
  imageUrl?: string;
  activeErrorCode?: string;
  activeErrorDesc?: string;
  // --- imported from Machine_Database.xlsx (Section 5 of data-import-spec.md) ---
  qrPrefix?: string;
  dupQrCount?: number;
  sourceNo?: string;
  factoryGroup?: string;
  departmentCode?: string;
  deptPrefix?: string;
  section?: string;
  responsibleGroup?: string;
  costCenter?: string;
  category?: string;
  productionName?: string;
  relatedQrCode?: string;
  lifecycleStatus?: string;
  qualityFlags?: string[];
  infoNotes?: string[];
}

export interface RequestedPart {
  partId: string | null;
  partCode: string | null;
  partName: string | null;
  quantity: number;
  status: string | null;
  // --- imported from Machine Repaire History.xlsx (Part1/Part2 columns) ---
  partPosition?: string;
  partModelRaw?: string;
}

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  /** null for every one of the 8,589 imported rows — the import never resolves a machine FK. */
  machineId: string | null;
  machineCode?: string;
  machineName: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "review" | "completed";
  technicianName: string;
  engineerReviewer?: string;
  assignedDate: string | null;
  dueDate: string;
  description: string;
  symptoms?: string[];
  stepsCompleted?: number;
  totalSteps?: number;
  aiVerificationScore?: number;
  requestedBy?: string;
  assignedTo?: string;
  estimatedHours?: number;
  createdAt?: string;
  updatedAt?: string;
  requestedParts?: RequestedPart[];
  actionPlan?: string[];
  actionPlanSteps?: { text: string; addedBy?: string; addedAt?: string }[];
  attachments?: WorkOrderAttachment[];
  partsRequested?: string[];
  solutionSteps?: string[];
  technicianNote?: string;
  revisionNote?: string;
  // --- imported from Machine Repaire History.xlsx (Section 5 of data-import-spec.md) ---
  fy?: number;
  shift?: string;
  sectionResponse?: string;
  lineLocation?: string;
  machineNameRaw?: string;
  machineNameStd?: string;
  machineVariant?: string;
  repairCategory?: string;
  damageSource?: string;
  pdNickname?: string;
  technicians?: string[];
  technicianCount?: number;
  cause?: string;
  repairAction?: string;
  mtLeaderName?: string;
  finishDatetime?: string;
  timeRefProduction?: string;
  mtlossMin?: number;
  repairDurationMin?: number;
  mtlossDiffMin?: number;
  dataQualityFlags?: string[];
}

export interface SparePart {
  id: string;
  code: string;
  name: string;
  category: string | null;
  compatibleMachines: string[];
  stockQuantity: number;
  stockQty?: number;
  unit?: string;
  minThreshold: number;
  locationRack: string | null;
  unitPriceTHB: number | null;
  status: "in_stock" | "low_stock" | "out_of_stock";
  imageUrl?: string;
  // --- imported from Inventory_Spare_Items.xlsx (Section 5 of data-import-spec.md) ---
  partNumber?: string;
  hasValidPartNumber?: boolean;
  movementStatus?: string;
  agingBucket?: string;
  brand?: string;
  groupCode?: string;
  inventoryValue?: number;
  maxInventory?: number;
  reorderPoint?: number;
  safetyStockQuantity?: number;
  safetyLeadTimeDays?: number;
  lifecycleStatus?: string;
  extraDescription?: string;
  areaCode?: string;
  sourceModifiedDate?: string;
  stockStatusLabel?: string;
  qualityFlags?: string[];
}

export interface ManualDoc {
  id: string;
  title: string;
  machineModel: string;
  category: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  pagesCount: number;
  aiIndexed: boolean;
  tags: string[];
  /** true if the manual has non-empty markdown_content in the DB, without shipping the content itself in list payloads. */
  hasMarkdown: boolean;
  markdownContent?: string;
  filePath?: string;
}

export interface TelemetryReading {
  id: string;
  machineId: string;
  metric: "spindleTemp" | "vibrationMms" | "healthScore";
  value: number;
  source: string;
  recordedAt: string;
}

// --- DB row types (snake_case, as returned by supabase-js) ---

export interface ProfileRow {
  id: string;
  employee_id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  avatar_url: string | null;
}

export interface MachineRow {
  id: string;
  code: string | null;
  name: string;
  model: string | null;
  location: string | null;
  status: string;
  last_maintenance: string | null;
  next_maintenance: string | null;
  health_score: number | null;
  spindle_temp: number | null;
  vibration_mms: number | null;
  operating_hours: number | null;
  qr_code_url: string | null;
  image_url: string | null;
  active_error_code: string | null;
  active_error_desc: string | null;
  // --- imported from Machine_Database.xlsx (backend/supabase/migrations/0009_alter_machines.sql) ---
  qr_prefix?: string | null;
  dup_qr_count?: number | null;
  source_no?: string | null;
  factory_group?: string | null;
  department_code?: string | null;
  dept_prefix?: string | null;
  section?: string | null;
  responsible_group?: string | null;
  cost_center?: string | null;
  category?: string | null;
  production_name?: string | null;
  related_qr_code?: string | null;
  lifecycle_status?: string | null;
  quality_flags?: string[] | null;
  info_notes?: string[] | null;
}

export interface WorkOrderRow {
  id: string;
  code: string;
  title: string;
  machine_id: string | null;
  priority: string;
  status: string;
  technician_name: string;
  engineer_reviewer: string | null;
  assigned_date: string | null;
  due_date: string;
  description: string;
  symptoms: string[] | null;
  steps_completed: number | null;
  total_steps: number | null;
  ai_verification_score: number | null;
  requested_by: string | null;
  assigned_to: string | null;
  estimated_hours: number | null;
  action_plan: string[] | null;
  parts_requested: string[] | null;
  solution_steps: string[] | null;
  technician_note?: string | null;
  revision_note?: string | null;
  action_plan_steps?: { text: string; addedBy?: string; addedAt?: string }[] | null;
  created_at: string;
  updated_at: string;
  // optional join fields (added by routes, not part of the base table)
  machines?: { code?: string | null; name?: string | null } | null;
  // --- imported from Machine Repaire History.xlsx (backend/supabase/migrations/0011_alter_work_orders.sql) ---
  machine_code?: string | null;
  fy?: number | null;
  shift?: string | null;
  section_response?: string | null;
  line_location?: string | null;
  machine_name_raw?: string | null;
  machine_name_std?: string | null;
  machine_variant?: string | null;
  repair_category?: string | null;
  damage_source?: string | null;
  pd_nickname?: string | null;
  technicians?: string[] | null;
  technician_count?: number | null;
  cause?: string | null;
  repair_action?: string | null;
  mt_leader_name?: string | null;
  finish_datetime?: string | null;
  time_ref_production?: string | null;
  mtloss_min?: number | string | null;
  repair_duration_min?: number | string | null;
  mtloss_diff_min?: number | string | null;
  data_quality_flags?: string[] | null;
}

export interface WorkOrderPartRow {
  id: string;
  work_order_id: string;
  part_id: string | null;
  part_code: string | null;
  part_name: string | null;
  quantity: number;
  status: string | null;
  // --- imported from Machine Repaire History.xlsx (Part1/Part2 columns) ---
  part_position?: string | null;
  part_model_raw?: string | null;
}

export interface WorkOrderAttachmentRow {
  id: string;
  work_order_id: string;
  file_name: string;
  file_path: string;
  file_size: number | string | null;
  content_type: string | null;
  note: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface WorkOrderAttachment {
  id: string;
  workOrderId: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  contentType?: string;
  note?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface SparePartRow {
  id: string;
  code: string;
  name: string;
  category: string | null;
  compatible_machines: string[] | null;
  stock_quantity: number;
  unit: string | null;
  min_threshold: number;
  location_rack: string | null;
  unit_price_thb: number | null;
  status: string;
  image_url: string | null;
  // --- imported from Inventory_Spare_Items.xlsx (backend/supabase/migrations/0010_alter_spare_parts.sql) ---
  part_number?: string | null;
  has_valid_part_number?: boolean | null;
  movement_status?: string | null;
  aging_bucket?: string | null;
  brand?: string | null;
  group_code?: string | null;
  inventory_value?: number | string | null;
  max_inventory?: number | null;
  reorder_point?: number | null;
  safety_stock_quantity?: number | null;
  safety_lead_time_days?: number | string | null;
  lifecycle_status?: string | null;
  extra_description?: string | null;
  area_code?: string | null;
  source_modified_date?: string | null;
  stock_status_label?: string | null;
  quality_flags?: string[] | null;
}

export interface ManualRow {
  id: string;
  title: string;
  machine_model: string | null;
  category: string | null;
  upload_date: string | null;
  uploaded_by: string | null;
  file_size: string | null;
  pages_count: number | null;
  ai_indexed: boolean | null;
  tags: string[] | null;
  // ไม่ select ใน list endpoint (GET /api/manuals) เพราะอาจมีขนาดหลาย MB ต่อแถว
  // จึงเป็น optional — ใช้ has_markdown (generated column) แทนในกรณีนั้น
  markdown_content?: string | null;
  has_markdown?: boolean | null;
  file_path: string | null;
}

export interface TelemetryReadingRow {
  id: string;
  machine_id: string;
  metric: string;
  value: number | string;
  source: string;
  recorded_at: string;
  created_at: string;
}

// แปลงชื่อ metric ระหว่างรูปแบบ DB (snake_case) และ API (camelCase)
export const METRIC_DB_TO_API: Record<string, TelemetryReading["metric"]> = {
  spindle_temp: "spindleTemp",
  vibration_mms: "vibrationMms",
  health_score: "healthScore",
};

export const METRIC_API_TO_DB: Record<string, string> = {
  spindleTemp: "spindle_temp",
  vibrationMms: "vibration_mms",
  healthScore: "health_score",
};

// --- Mappers ---

export function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    role: row.role as UserProfile["role"],
    employeeId: row.employee_id,
    avatarUrl: row.avatar_url ?? undefined,
    department: row.department,
  };
}

export function mapMachine(row: MachineRow): Machine {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    model: row.model,
    location: row.location,
    status: row.status as Machine["status"],
    lastMaintenance: row.last_maintenance,
    nextMaintenance: row.next_maintenance,
    healthScore: row.health_score,
    spindleTemp: row.spindle_temp,
    vibrationMms: row.vibration_mms,
    operatingHours: row.operating_hours,
    qrCodeUrl: row.qr_code_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    activeErrorCode: row.active_error_code ?? undefined,
    activeErrorDesc: row.active_error_desc ?? undefined,
    qrPrefix: row.qr_prefix ?? undefined,
    dupQrCount: row.dup_qr_count ?? undefined,
    sourceNo: row.source_no ?? undefined,
    factoryGroup: row.factory_group ?? undefined,
    departmentCode: row.department_code ?? undefined,
    deptPrefix: row.dept_prefix ?? undefined,
    section: row.section ?? undefined,
    responsibleGroup: row.responsible_group ?? undefined,
    costCenter: row.cost_center ?? undefined,
    category: row.category ?? undefined,
    productionName: row.production_name ?? undefined,
    relatedQrCode: row.related_qr_code ?? undefined,
    lifecycleStatus: row.lifecycle_status ?? undefined,
    qualityFlags: row.quality_flags ?? [],
    infoNotes: row.info_notes ?? [],
  };
}

export function mapWorkOrderPart(row: WorkOrderPartRow): RequestedPart {
  return {
    partId: row.part_id,
    partCode: row.part_code,
    partName: row.part_name,
    quantity: row.quantity,
    status: row.status,
    partPosition: row.part_position ?? undefined,
    partModelRaw: row.part_model_raw ?? undefined,
  };
}

export function mapWorkOrderAttachment(row: WorkOrderAttachmentRow): WorkOrderAttachment {
  return {
    id: row.id,
    workOrderId: row.work_order_id,
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: toNullableNumber(row.file_size),
    contentType: row.content_type ?? undefined,
    note: row.note ?? undefined,
    uploadedBy: row.uploaded_by ?? undefined,
    uploadedAt: row.uploaded_at ?? undefined,
  };
}

function toNullableNumber(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function mapWorkOrder(
  row: WorkOrderRow,
  parts: WorkOrderPartRow[] = [],
  attachments?: WorkOrderAttachmentRow[]
): WorkOrder {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    machineId: row.machine_id,
    // The `machines(...)` PostgREST embed was removed from every query (see
    // workOrders.ts) because it depends on the machine_id FK, which
    // 0011_alter_work_orders.sql drops — all 8,589 imported rows have
    // machine_id = null (the import never resolves one; see import-excel.ts). The
    // "31 rows" figure elsewhere in this codebase is a different count — rows with a
    // blank source QR_Code — not related to machine_id. Prefer the imported
    // machine_name_std text column; row.machines is only ever populated by
    // fetchFullWorkOrder's single-record machines lookup (manually-created work
    // orders) or stays undefined.
    machineName: row.machine_name_std ?? row.machines?.name ?? "",
    priority: row.priority as WorkOrder["priority"],
    status: row.status as WorkOrder["status"],
    technicianName: row.technician_name,
    engineerReviewer: row.engineer_reviewer ?? undefined,
    assignedDate: row.assigned_date,
    dueDate: row.due_date,
    description: row.description,
    symptoms: row.symptoms ?? undefined,
    stepsCompleted: row.steps_completed ?? undefined,
    totalSteps: row.total_steps ?? undefined,
    aiVerificationScore: row.ai_verification_score ?? undefined,
    requestedBy: row.requested_by ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    estimatedHours: row.estimated_hours ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requestedParts: parts.map(mapWorkOrderPart),
    actionPlan: row.action_plan ?? undefined,
    partsRequested: row.parts_requested ?? undefined,
    solutionSteps: row.solution_steps ?? undefined,
    technicianNote: row.technician_note ?? undefined,
    revisionNote: row.revision_note ?? undefined,
    actionPlanSteps: row.action_plan_steps ?? undefined,
    attachments: attachments ? attachments.map(mapWorkOrderAttachment) : undefined,
    machineCode: row.machine_code ?? row.machines?.code ?? undefined,
    fy: row.fy ?? undefined,
    shift: row.shift ?? undefined,
    sectionResponse: row.section_response ?? undefined,
    lineLocation: row.line_location ?? undefined,
    machineNameRaw: row.machine_name_raw ?? undefined,
    machineNameStd: row.machine_name_std ?? undefined,
    machineVariant: row.machine_variant ?? undefined,
    repairCategory: row.repair_category ?? undefined,
    damageSource: row.damage_source ?? undefined,
    pdNickname: row.pd_nickname ?? undefined,
    technicians: row.technicians ?? undefined,
    technicianCount: row.technician_count ?? undefined,
    cause: row.cause ?? undefined,
    repairAction: row.repair_action ?? undefined,
    mtLeaderName: row.mt_leader_name ?? undefined,
    finishDatetime: row.finish_datetime ?? undefined,
    timeRefProduction: row.time_ref_production ?? undefined,
    mtlossMin: toNullableNumber(row.mtloss_min),
    repairDurationMin: toNullableNumber(row.repair_duration_min),
    mtlossDiffMin: toNullableNumber(row.mtloss_diff_min),
    dataQualityFlags: row.data_quality_flags ?? undefined,
  };
}

export function mapSparePart(row: SparePartRow): SparePart {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    compatibleMachines: row.compatible_machines ?? [],
    stockQuantity: row.stock_quantity,
    stockQty: row.stock_quantity,
    unit: row.unit ?? undefined,
    minThreshold: row.min_threshold,
    locationRack: row.location_rack,
    unitPriceTHB: row.unit_price_thb,
    status: row.status as SparePart["status"],
    imageUrl: row.image_url ?? undefined,
    partNumber: row.part_number ?? undefined,
    hasValidPartNumber: row.has_valid_part_number ?? undefined,
    movementStatus: row.movement_status ?? undefined,
    agingBucket: row.aging_bucket ?? undefined,
    brand: row.brand ?? undefined,
    groupCode: row.group_code ?? undefined,
    inventoryValue: toNullableNumber(row.inventory_value),
    maxInventory: row.max_inventory ?? undefined,
    reorderPoint: row.reorder_point ?? undefined,
    safetyStockQuantity: row.safety_stock_quantity ?? undefined,
    safetyLeadTimeDays: toNullableNumber(row.safety_lead_time_days),
    lifecycleStatus: row.lifecycle_status ?? undefined,
    extraDescription: row.extra_description ?? undefined,
    areaCode: row.area_code ?? undefined,
    sourceModifiedDate: row.source_modified_date ?? undefined,
    stockStatusLabel: row.stock_status_label ?? undefined,
    qualityFlags: row.quality_flags ?? undefined,
  };
}

export function mapTelemetryReading(row: TelemetryReadingRow): TelemetryReading {
  return {
    id: row.id,
    machineId: row.machine_id,
    metric: METRIC_DB_TO_API[row.metric] ?? (row.metric as TelemetryReading["metric"]),
    // Supabase อาจส่ง numeric กลับมาเป็น string จึงต้องแปลงเป็นตัวเลขเสมอ
    value: Number(row.value),
    source: row.source,
    recordedAt: row.recorded_at,
  };
}

export function mapManual(row: ManualRow): ManualDoc {
  return {
    id: row.id,
    title: row.title,
    machineModel: row.machine_model ?? "",
    category: row.category ?? "",
    uploadDate: row.upload_date ?? "",
    uploadedBy: row.uploaded_by ?? "",
    fileSize: row.file_size ?? "",
    pagesCount: row.pages_count ?? 0,
    aiIndexed: row.ai_indexed ?? false,
    tags: row.tags ?? [],
    // has_markdown มาจาก generated column ของ DB โดยตรงเมื่อ query select มันมา
    // (เช่น list endpoint) แต่ fallback ไปตรวจ markdown_content เองกรณีที่ caller
    // select markdown_content มาแทน (เช่น GET /:id/content) เพื่อให้ค่านี้ถูกต้อง
    // ไม่ว่าจะ select คอลัมน์ไหนมา
    hasMarkdown: row.has_markdown ?? (typeof row.markdown_content === "string" && row.markdown_content.length > 0),
    markdownContent: row.markdown_content ?? undefined,
    filePath: row.file_path ?? undefined,
  };
}

// --- pm_plans (from `PM PLAN (แผนการทำ PM).xlsx`, backend/supabase/migrations/0007_pm_plans.sql) ---

export interface PmPlanRow {
  id: string;
  ref_work_order_no: string | null;
  machine_code: string | null;
  machine_base_name: string | null;
  machine_code_in_name: string | null;
  line_location: string | null;
  position_name: string | null;
  pm_type: string | null;
  pm_type_code: string | null;
  status_th: string | null;
  status_code: string | null;
  work_type: string | null;
  action: string | null;
  priority: string | null;
  item_description: string | null;
  part_name: string | null;
  part_model: string | null;
  spare_id: string | null;
  qty: number | string | null;
  cost: number | string | null;
  period_days: number | null;
  plan_date: string | null;
  actual_date: string | null;
  last_pm_date: string | null;
  next_pm_date: string | null;
  remark1: string | null;
  remark2: string | null;
  responsible_email: string | null;
  planner: string | null;
  responsible: string | null;
  cdb_before_value: number | string | null;
  cdb_before_unit: string | null;
  cdb_after_value: number | string | null;
  cdb_after_unit: string | null;
  plan_year: number | null;
  plan_year_month: string | null;
  is_overdue: boolean | null;
  quality_flags: string[] | null;
  has_cost: boolean | null;
  created_at?: string;
}

export interface PmPlan {
  id: string;
  refWorkOrderNo: string | null;
  machineCode: string | null;
  machineBaseName: string | null;
  machineCodeInName: string | null;
  lineLocation: string | null;
  positionName: string | null;
  pmType: string | null;
  pmTypeCode: string | null;
  statusTh: string | null;
  statusCode: string | null;
  workType: string | null;
  action: string | null;
  priority: string | null;
  itemDescription: string | null;
  partName: string | null;
  partModel: string | null;
  spareId: string | null;
  qty: number | null;
  cost: number | null;
  periodDays: number | null;
  planDate: string | null;
  actualDate: string | null;
  lastPmDate: string | null;
  nextPmDate: string | null;
  remark1: string | null;
  remark2: string | null;
  responsibleEmail: string | null;
  planner: string | null;
  responsible: string | null;
  cdbBeforeValue: number | null;
  cdbBeforeUnit: string | null;
  cdbAfterValue: number | null;
  cdbAfterUnit: string | null;
  planYear: number | null;
  planYearMonth: string | null;
  isOverdue: boolean | null;
  qualityFlags: string[];
  hasCost: boolean | null;
}

export function mapPmPlan(row: PmPlanRow): PmPlan {
  return {
    id: row.id,
    refWorkOrderNo: row.ref_work_order_no,
    machineCode: row.machine_code,
    machineBaseName: row.machine_base_name,
    machineCodeInName: row.machine_code_in_name,
    lineLocation: row.line_location,
    positionName: row.position_name,
    pmType: row.pm_type,
    pmTypeCode: row.pm_type_code,
    statusTh: row.status_th,
    statusCode: row.status_code,
    workType: row.work_type,
    action: row.action,
    priority: row.priority,
    itemDescription: row.item_description,
    partName: row.part_name,
    partModel: row.part_model,
    spareId: row.spare_id,
    qty: toNullableNumber(row.qty) ?? null,
    cost: toNullableNumber(row.cost) ?? null,
    periodDays: row.period_days,
    planDate: row.plan_date,
    actualDate: row.actual_date,
    lastPmDate: row.last_pm_date,
    nextPmDate: row.next_pm_date,
    remark1: row.remark1,
    remark2: row.remark2,
    responsibleEmail: row.responsible_email,
    planner: row.planner,
    responsible: row.responsible,
    cdbBeforeValue: toNullableNumber(row.cdb_before_value) ?? null,
    cdbBeforeUnit: row.cdb_before_unit,
    cdbAfterValue: toNullableNumber(row.cdb_after_value) ?? null,
    cdbAfterUnit: row.cdb_after_unit,
    planYear: row.plan_year,
    planYearMonth: row.plan_year_month,
    isOverdue: row.is_overdue,
    qualityFlags: row.quality_flags ?? [],
    hasCost: row.has_cost,
  };
}

// --- part_withdrawals (from `ประวัติการเบิกอะไหล่ (SparePart).xlsx`, backend/supabase/migrations/0008_part_withdrawals.sql) ---

export interface PartWithdrawalRow {
  id: string;
  withdraw_date: string | null;
  withdraw_month: string | null;
  code_no: string | null;
  code_no_raw: string | null;
  part_name: string | null;
  part_number: string | null;
  pack_info: string | null;
  condition_status: string | null;
  movement_status: string | null;
  shelf_number: string | null;
  shelf_type: string | null;
  brand: string | null;
  brand_note: string | null;
  qty: number | string | null;
  price_per_unit: number | string | null;
  total_value: number | string | null;
  group_line_location: string | null;
  line_location: string | null;
  factory: string | null;
  machine_code: string | null;
  machine_note_raw: string | null;
  machine_code_alt: string | null;
  process_detail: string | null;
  machine_name: string | null;
  user_name: string | null;
  department: string | null;
  is_aggregate: boolean | null;
  quality_flags: string[] | null;
  work_order_id: string | null;
  spare_part_id: string | null;
  note: string | null;
  withdrawn_by: string | null;
  created_at?: string;
}

export interface PartWithdrawal {
  id: string;
  withdrawDate: string | null;
  withdrawMonth: string | null;
  codeNo: string | null;
  codeNoRaw: string | null;
  partName: string | null;
  partNumber: string | null;
  packInfo: string | null;
  conditionStatus: string | null;
  movementStatus: string | null;
  shelfNumber: string | null;
  shelfType: string | null;
  brand: string | null;
  brandNote: string | null;
  qty: number | null;
  pricePerUnit: number | null;
  totalValue: number | null;
  groupLineLocation: string | null;
  lineLocation: string | null;
  factory: string | null;
  machineCode: string | null;
  machineNoteRaw: string | null;
  machineCodeAlt: string | null;
  processDetail: string | null;
  machineName: string | null;
  userName: string | null;
  department: string | null;
  isAggregate: boolean | null;
  qualityFlags: string[];
  workOrderId: string | null;
  sparePartId: string | null;
  note: string | null;
  withdrawnBy: string | null;
}

export function mapPartWithdrawal(row: PartWithdrawalRow): PartWithdrawal {
  return {
    id: row.id,
    withdrawDate: row.withdraw_date,
    withdrawMonth: row.withdraw_month,
    codeNo: row.code_no,
    codeNoRaw: row.code_no_raw,
    partName: row.part_name,
    partNumber: row.part_number,
    packInfo: row.pack_info,
    conditionStatus: row.condition_status,
    movementStatus: row.movement_status,
    shelfNumber: row.shelf_number,
    shelfType: row.shelf_type,
    brand: row.brand,
    brandNote: row.brand_note,
    qty: toNullableNumber(row.qty) ?? null,
    pricePerUnit: toNullableNumber(row.price_per_unit) ?? null,
    totalValue: toNullableNumber(row.total_value) ?? null,
    groupLineLocation: row.group_line_location,
    lineLocation: row.line_location,
    factory: row.factory,
    machineCode: row.machine_code,
    machineNoteRaw: row.machine_note_raw,
    machineCodeAlt: row.machine_code_alt,
    processDetail: row.process_detail,
    machineName: row.machine_name,
    userName: row.user_name,
    department: row.department,
    isAggregate: row.is_aggregate,
    qualityFlags: row.quality_flags ?? [],
    workOrderId: row.work_order_id,
    sparePartId: row.spare_part_id,
    note: row.note,
    withdrawnBy: row.withdrawn_by ?? null,
  };
}
