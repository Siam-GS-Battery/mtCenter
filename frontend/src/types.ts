export type UserRole = "technician" | "engineer" | "supervisor";

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  role: UserRole;
  employeeId: string;
  avatarUrl?: string;
  department: string;
}

export interface NavItemDef {
  id: string;
  label: string;
  iconName: string;
  badge?: number;
}

/**
 * เครื่องจักรหนึ่งรายการ
 *
 * ฟิลด์ที่เป็น `| null` คือฟิลด์ที่ข้อมูลจริงจากโรงงานอาจไม่มีค่าให้ —
 * ไม่ใช่ "ศูนย์" และไม่ใช่ "ค่าที่แย่ที่สุด" แต่คือ "ไม่มีข้อมูล"
 *
 * แต่ละฟิลด์ว่างด้วยเหตุผลต่างกัน และสัดส่วนเปลี่ยนได้เมื่อ backend ปรับสูตร
 * จึงไม่ระบุตัวเลขไว้ที่นี่ (เดี๋ยวล้าสมัย) — ให้ถือว่า "บางแถวเป็น null" เสมอ:
 *   • healthScore / lastMaintenance / nextMaintenance — คำนวณจากประวัติซ่อมจริง
 *     เครื่องที่ไม่เคยมีใบซ่อมจะเป็น null ถาวรโดยตั้งใจ ไม่ใช่ข้อมูลหาย
 *   • spindleTemp / vibrationMms / operatingHours — ไม่มีคอลัมน์ต้นทางเลย
 *     (โรงงานยังไม่ได้ติดเซนเซอร์) UI ที่ใช้ค่าเหล่านี้ถูกซ่อนไว้จนกว่าจะมีค่าจริง
 *   • model / location / code — ข้อมูลทะเบียนเครื่องไม่ครบบางแถว
 *
 * ห้ามใช้ `?? 0` หรือเปรียบเทียบ (`<`, `>`) กับค่าเหล่านี้โดยไม่เช็ค null ก่อน
 * เพราะ JS จะแปลง null เป็น 0 แล้วทำให้เครื่องที่ "ไม่มีข้อมูล" ถูกแจ้งเตือนผิด
 * และห้ามส่ง `code` ที่เป็น null เข้าไปเป็น query filter (buildQuery จะตัดทิ้ง
 * แล้วกลายเป็น "ไม่กรอง" = ได้ข้อมูลของเครื่องอื่นทั้งโรงงาน)
 */
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
  spindleTemp: number | null; // °C
  vibrationMms: number | null; // mm/s
  operatingHours: number | null;
  qrCodeUrl?: string;
  imageUrl?: string;
  activeErrorCode?: string;
  activeErrorDesc?: string;
  // --- Fields added by the Excel import (see docs/data-import-spec.md Section 5) ---
  qrPrefix?: string | null;
  dupQrCount?: number | null;
  sourceNo?: string | null;
  factoryGroup?: string | null;
  departmentCode?: string | null;
  deptPrefix?: string | null;
  section?: string | null;
  responsibleGroup?: string | null;
  costCenter?: string | null;
  category?: string | null;
  productionName?: string | null;
  relatedQrCode?: string | null;
  lifecycleStatus?: string | null;
  qualityFlags?: string[];
  infoNotes?: string[];
}

/** สถานะการทำงานของเครื่องจักร (alias ของ Machine["status"]) */
export type MachineStatus = Machine["status"];

/**
 * ข้อมูลที่ผู้ใช้กรอกได้เมื่อเพิ่ม/แก้ไขเครื่องจักร
 * (ฟิลด์ที่มาจากการนำเข้า Excel เช่น dupQrCount, qualityFlags, infoNotes ไม่ให้แก้ไขผ่าน UI)
 */
export interface MachineInput {
  code: string | null;
  name: string;
  model: string | null;
  location: string | null;
  status: MachineStatus;
  factoryGroup: string | null;
  departmentCode: string | null;
  section: string | null;
  category: string | null;
  costCenter: string | null;
  productionName: string | null;
  responsibleGroup: string | null;
  lifecycleStatus: string | null;
  healthScore: number | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  operatingHours: number | null;
  qrCodeUrl: string | null;
  imageUrl: string | null;
}

export type TelemetryMetric = "spindleTemp" | "vibrationMms" | "healthScore";
export type TelemetrySource = "iot" | "manual" | "seed";

/**
 * ข้อมูลย้อนหลังแบบอนุกรมเวลา (time-series) ของเครื่องจักรหนึ่งรายการ
 * ต่างจาก Machine ที่เก็บค่าปัจจุบันเพียงจุดเดียว (current snapshot)
 */
export interface TelemetryReading {
  id: string;
  machineId: string;
  metric: TelemetryMetric;
  value: number;
  source: TelemetrySource;
  recordedAt: string; // ISO timestamp
}

/**
 * ขั้นตอนปฏิบัติงานหนึ่งบรรทัดของใบงาน พร้อมร่องรอยว่าใครเป็นผู้เพิ่ม
 * ใช้เมื่อช่างเพิ่มขั้นตอนเองหน้างาน (ใบงานที่ไม่มีแผนงานมาแต่แรก)
 */
export interface WorkOrderStep {
  text: string;
  /** ชื่อผู้เพิ่มขั้นตอนนี้ — ว่างได้เมื่อขั้นตอนมาจากแผนงานเดิมของใบงาน */
  addedBy?: string;
  /** วันที่เพิ่มขั้นตอน (YYYY-MM-DD) */
  addedAt?: string;
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

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  /**
   * FK ไปยัง machines — ใบงานที่นำเข้าจาก Excel ทั้ง 8,589 แถวมีค่าเป็น null
   * (การนำเข้าไม่เคย resolve machine_id) ใช้ `machineCode`/`machineName` แทน
   */
  machineId: string | null;
  machineCode?: string;
  machineName: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "review" | "completed";
  technicianName: string;
  engineerReviewer?: string;
  /** วันที่มอบหมาย — ข้อมูลจริง 2/8,589 แถวไม่มีค่า */
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
  // อะไหล่ที่ขอเบิกในใบงาน — ข้อมูลจริง 5,553 แถวใน work_order_parts:
  //   partId → null ทั้งหมด (import ไม่ผูกกับตาราง spare_parts)
  //   status → null 5,390 แถว, partName → null 7 แถว, partCode → null 1 แถว
  requestedParts?: Array<{
    partId: string | null;
    partCode: string | null;
    partName: string | null;
    quantity: number;
    status: string | null;
    // --- work_order_parts fields added by the Excel import ---
    partPosition?: string | null;
    partModelRaw?: string | null;
  }>;
  actionPlan?: string[];
  /**
   * ขั้นตอนปฏิบัติงานพร้อมผู้เพิ่ม — ใช้แทน actionPlan เมื่อมีข้อมูลนี้
   * (ใบงานเดิมที่มีแต่ actionPlan ยังใช้งานได้ตามปกติ)
   */
  actionPlanSteps?: WorkOrderStep[];
  partsRequested?: string[];
  solutionSteps?: string[];
  /** บันทึกข้อสังเกตจากช่างเทคนิค (เก็บจากหน้ารายละเอียดใบงาน) */
  technicianNote?: string;
  /** เหตุผลที่วิศวกรส่งงานกลับให้แก้ไข */
  revisionNote?: string;
  /** ไฟล์แนบของใบงาน (เอกสาร/รูปภาพ) — ดึงแยกผ่าน getWorkOrderAttachments(id) */
  attachments?: WorkOrderAttachment[];
  // --- Fields added by the Excel import (see docs/data-import-spec.md Section 5) ---
  // (machineCode is already declared above)
  fy?: number | null;
  shift?: string | null;
  sectionResponse?: string | null;
  lineLocation?: string | null;
  machineNameRaw?: string | null;
  machineNameStd?: string | null;
  machineVariant?: string | null;
  repairCategory?: string | null;
  damageSource?: string | null;
  pdNickname?: string | null;
  technicians?: string[];
  technicianCount?: number | null;
  cause?: string | null;
  repairAction?: string | null;
  mtLeaderName?: string | null;
  finishDatetime?: string | null;
  timeRefProduction?: string | null;
  mtlossMin?: number | null;
  repairDurationMin?: number | null;
  mtlossDiffMin?: number | null;
  dataQualityFlags?: string[];
}

/**
 * อะไหล่หนึ่งรายการ
 * นับจากฐานข้อมูลจริง (8,588 แถว): unitPriceTHB → null 810 แถว,
 * locationRack → null 602 แถว, category → null 133 แถว,
 * unit และ compatibleMachines → ไม่มีข้อมูลเลยทั้งตาราง
 */
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
  // --- Fields added by the Excel import (see docs/data-import-spec.md Section 5) ---
  partNumber?: string | null;
  hasValidPartNumber?: boolean | null;
  movementStatus?: string | null;
  agingBucket?: string | null;
  brand?: string | null;
  groupCode?: string | null;
  inventoryValue?: number | null;
  maxInventory?: number | null;
  reorderPoint?: number | null;
  safetyStockQuantity?: number | null;
  safetyLeadTimeDays?: number | null;
  lifecycleStatus?: string | null;
  extraDescription?: string | null;
  areaCode?: string | null;
  sourceModifiedDate?: string | null;
  stockStatusLabel?: string | null;
  qualityFlags?: string[];
}

/** อะไหล่ที่เกี่ยวข้องกับเครื่องจักรเครื่องหนึ่ง (จาก GET /api/spare-parts/for-machine) */
export interface MachineSparePart extends SparePart {
  usageCount: number;
  totalQtyUsed: number;
  lastUsedDate: string | null;
  suggestedQuantity: number;
  matchReason: "history" | "work_order" | "compatible";
}

export interface MachineSparePartsResult {
  machineCode: string;
  items: MachineSparePart[];
}

export interface SparePartInput {
  code: string;
  name: string;
  category: string;
  compatibleMachines: string[];
  stockQuantity: number;
  unit?: string;
  minThreshold: number;
  locationRack: string;
  unitPriceTHB: number;
  imageUrl?: string;
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
  /** true เมื่อคู่มือเล่มนี้มีเนื้อหาข้อความ — เนื้อหาจริงต้องดึงแยกต่างหาก
   * ผ่าน getManualContent(id) เพราะไม่ถูกส่งมากับรายการคู่มือ (อาจใหญ่ถึง 2.5MB ต่อเล่ม) */
  hasMarkdown?: boolean;
  markdownContent?: string;
  filePath?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isAiDiagnostic?: boolean;
  diagnosticData?: {
    urgency?: string;
    steps?: string[];
    requiredParts?: string[];
    safetyNotice?: string;
  };
}

// ---------------------------------------------------------------------------
// New entities from the Excel import (docs/data-import-spec.md Section 5).
// Neither table has a mutation endpoint yet — these are read-only, list/stats only.
// ---------------------------------------------------------------------------

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
}

export interface PartWithdrawalInput {
  workOrderId?: string | null;
  partId: string;
  qty: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// /stats endpoints — use these for dashboards/KPIs instead of aggregating over
// full (and now paginated) lists on the client.
// ---------------------------------------------------------------------------

export interface MachineStats {
  total: number;
  byStatus: Record<string, number>;
  byFactoryGroup: Record<string, number>;
  byDepartment: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface SparePartStats {
  total: number;
  totalInventoryValue: number;
  belowReorderPoint: number;
  outOfStock: number;
  byStockStatus: Record<string, number>;
  byMovementStatus: Record<string, number>;
}

export interface WorkOrderStatsByMonth {
  month: string; // "YYYY-MM"
  count: number;
}

export interface WorkOrderStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byRepairCategory: Record<string, number>;
  totalMtlossMin: number;
  avgRepairDurationMin: number;
  byMonth: WorkOrderStatsByMonth[];
  /** Count matching the "เลยกำหนด" predicate (due_date < today, not completed) —
   * date-based, so it can't live in `byStatus`. Scoped by the same
   * assignedTo/machineCode params as the rest of this response. */
  overdue: number;
}

export interface PmPlanStats {
  total: number;
  overdue: number;
  onSchedule: number;
  byPmType: Record<string, number>;
  byMonth: WorkOrderStatsByMonth[];
}

export interface PartWithdrawalTopPart {
  code: string;
  name: string;
  qty: number;
  value: number;
}

export interface PartWithdrawalStats {
  total: number;
  totalValue: number;
  byMonth: WorkOrderStatsByMonth[];
  topParts: PartWithdrawalTopPart[];
}
