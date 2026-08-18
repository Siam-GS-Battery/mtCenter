import {
  UserProfile,
  Machine,
  MachineInput,
  WorkOrder,
  WorkOrderAttachment,
  SparePart,
  SparePartInput,
  MachineSparePartsResult,
  ManualDoc,
  UserRole,
  TelemetryMetric,
  TelemetryReading,
  PmPlan,
  PartWithdrawal,
  PartWithdrawalInput,
  MachineStats,
  SparePartStats,
  WorkOrderStats,
  PmPlanStats,
  PartWithdrawalStats,
} from "../types";

// Empty by default: production is single-origin (backend serves the static
// frontend build + /api/* from the same host), so relative "/api/..." paths
// are correct there. In dev, the Vite proxy (see vite.config.ts) forwards
// "/api/*" to the backend at VITE_API_URL / http://localhost:4000.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

// เก็บ id ของผู้ใช้ที่ login อยู่ในหน่วยความจำของโมดูลนี้ — ให้เรียก setCurrentUserId()
// ครั้งเดียวตอนได้ currentUser (ดู App.tsx) แล้วฟังก์ชันที่ต้องแนบ x-user-id ด้านล่าง
// (aiChat/aiDiagnose/createWorkOrder/updateWorkOrder) จะหยิบไปแนบให้เองโดยไม่ต้องแก้
// signature ของทุก call site ที่มีอยู่แล้ว
let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null | undefined): void {
  currentUserId = id ?? null;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

/** Pagination envelope carried alongside `data` on paginated list responses. */
export interface ApiListMeta {
  total: number;
  limit: number;
  offset: number;
}

/** Result of a paginated list call: the page of rows plus (when present) `meta`. */
export interface PaginatedResult<T> {
  data: T[];
  meta?: ApiListMeta;
}

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiListMeta;
}

interface ApiErrorEnvelope {
  success: false;
  error?: { message?: string } | string;
}

type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

/** Builds a `?a=1&b=2` query string, skipping undefined/null/empty-string values. */
function buildQuery(params: object): string {
  const qs = new URLSearchParams();
  Object.entries(params as Record<string, string | number | boolean | undefined | null>).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        qs.set(key, String(value));
      }
    }
  );
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function extractErrorMessage(error: ApiErrorEnvelope["error"], fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
}

/**
 * แปลงข้อผิดพลาดที่ดักได้เป็นข้อความสำหรับผู้ใช้ (ภาษาไทย)
 * ข้อความ exception จากเบราว์เซอร์/เครือข่าย (เช่น TypeError "Failed to fetch")
 * เป็นภาษาอังกฤษเสมอและไม่เหมาะแสดงให้ผู้ใช้เห็น จึงคืนค่า err.message
 * เฉพาะกรณีที่ข้อความนั้นดูเหมือนตั้งใจเขียนให้ผู้ใช้อ่าน (มีตัวอักษรไทยอยู่)
 * มิฉะนั้นจะคืนค่า fallback ภาษาไทยเสมอ
 */
export function toUserMessage(
  err: unknown,
  fallback = "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง"
): string {
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  if (message && /[฀-๿]/.test(message)) {
    return message;
  }
  return fallback;
}

/**
 * Typed fetch helper for endpoints that use the standard
 * {success:true, data} / {success:false, error:{message}} envelope.
 *
 * `base` defaults to API_BASE (the remote backend). Pass "" to hit a
 * same-origin path instead — used by the manual admin mutations, which are
 * proxied through this app's own server so it can attach a server-side
 * secret that must never reach the browser bundle.
 */
async function requestEnvelope<T>(
  path: string,
  options?: RequestInit,
  base: string = API_BASE
): Promise<ApiSuccessEnvelope<T>> {
  let res: Response;
  try {
    const { headers, ...restOptions } = options || {};
    res = await fetch(`${base}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      ...restOptions,
    });
  } catch {
    throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
  }

  let json: ApiEnvelope<T> | undefined;
  try {
    json = await res.json();
  } catch {
    throw new Error(`เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (HTTP ${res.status})`);
  }

  if (!res.ok || !json || json.success !== true) {
    const message = extractErrorMessage(
      (json as ApiErrorEnvelope | undefined)?.error,
      `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (HTTP ${res.status})`
    );
    throw new Error(message);
  }

  return json;
}

/**
 * Typed fetch helper for endpoints that use the standard
 * {success:true, data} / {success:false, error:{message}} envelope.
 *
 * `base` defaults to API_BASE (the remote backend). Pass "" to hit a
 * same-origin path instead — used by the manual admin mutations, which are
 * proxied through this app's own server so it can attach a server-side
 * secret that must never reach the browser bundle.
 */
async function request<T>(path: string, options?: RequestInit, base: string = API_BASE): Promise<T> {
  const envelope = await requestEnvelope<T>(path, options, base);
  return envelope.data;
}

/**
 * Typed fetch helper for the paginated list endpoints — same envelope as
 * `request`, but also surfaces `meta` ({total, limit, offset}) when the
 * backend includes it, instead of discarding it.
 */
async function requestPaginated<T>(
  path: string,
  options?: RequestInit,
  base: string = API_BASE
): Promise<PaginatedResult<T>> {
  const envelope = await requestEnvelope<T[]>(path, options, base);
  return { data: envelope.data, meta: envelope.meta };
}

// ---- Users ----
export function getUsers(): Promise<UserProfile[]> {
  return request<UserProfile[]>("/api/users");
}

// ---- Machines ----
export interface MachineListParams {
  limit?: number;
  offset?: number;
  search?: string;
  factoryGroup?: string;
  department?: string;
  status?: string;
}

export function getMachines(params: MachineListParams = {}): Promise<PaginatedResult<Machine>> {
  return requestPaginated<Machine>(`/api/machines${buildQuery(params)}`);
}

/** Aggregate counts for the whole `machines` table — use for dashboards/KPIs
 * instead of computing `.filter().length` over a (now paginated) list. */
export function getMachineStats(): Promise<MachineStats> {
  return request<MachineStats>("/api/machines/stats");
}

export function getMachineReadings(
  machineId: string,
  metric: TelemetryMetric,
  hours: number = 24,
): Promise<TelemetryReading[]> {
  const query = new URLSearchParams({ metric, hours: String(hours) });
  return request<TelemetryReading[]>(
    `/api/machines/${encodeURIComponent(machineId)}/readings?${query.toString()}`,
  );
}

// สร้าง/แก้ไข/ลบเครื่องจักร — backend อนุญาตเฉพาะผู้ใช้ที่มีสิทธิ์
// หัวหน้างาน/วิศวกร เท่านั้น (ตรวจสอบผ่านเฮดเดอร์ x-user-id)
export function createMachine(payload: MachineInput, actorId: string): Promise<Machine> {
  return request<Machine>("/api/machines", {
    method: "POST",
    headers: { "x-user-id": actorId },
    body: JSON.stringify(payload),
  });
}

export function updateMachine(
  id: string,
  payload: Partial<MachineInput>,
  actorId: string
): Promise<Machine> {
  return request<Machine>(`/api/machines/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "x-user-id": actorId },
    body: JSON.stringify(payload),
  });
}

export function deleteMachine(id: string, actorId: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/machines/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-user-id": actorId },
  });
}

// ---- Work Orders ----
export interface WorkOrderListParams {
  limit?: number;
  offset?: number;
  machineCode?: string;
  status?: string;
  priority?: string;
  from?: string;
  to?: string;
  /** Exact match against work_orders.assigned_to, which stores profiles.id
   * (`usr-...`) — see App.tsx's currentAssigneeKey (currentUser.id), which
   * WorkOrderForm/App.tsx now populate it with when creating a work order. */
  assignedTo?: string;
  /** Free-text search across id/code/title/description/machine_code/machine_name_std.
   * Does NOT cover technician_name — see backend/src/routes/workOrders.ts. */
  search?: string;
  /** "เลยกำหนด" — date-based, so it isn't a plain `status` value. Server applies
   * due_date < today (Bangkok time) AND status != completed; see
   * isOverdueRow in backend/src/routes/workOrders.ts. */
  overdue?: boolean;
}

export function getWorkOrders(params: WorkOrderListParams = {}): Promise<PaginatedResult<WorkOrder>> {
  return requestPaginated<WorkOrder>(`/api/work-orders${buildQuery(params)}`);
}

export interface WorkOrderStatsParams {
  assignedTo?: string;
  machineCode?: string;
}

/** Aggregate counts for the whole `work_orders` table — use for
 * dashboards/KPIs/reports instead of aggregating over a (now paginated) list.
 * Pass `assignedTo`/`machineCode` to scope the counts the same way
 * `getWorkOrders` scopes its list (e.g. for a "my work orders" badge). */
export function getWorkOrderStats(params: WorkOrderStatsParams = {}): Promise<WorkOrderStats> {
  return request<WorkOrderStats>(`/api/work-orders/stats${buildQuery(params)}`);
}

// ต้อง login แล้ว (ตรวจสอบผ่านเฮดเดอร์ x-user-id ฝั่ง backend) — actorId เป็น optional
// เพื่อไม่ต้องแก้ signature ของ call site เดิมทุกที่ ถ้าไม่ส่งมาจะใช้ id ที่ set ไว้ล่าสุด
// ผ่าน setCurrentUserId() แทน
export function createWorkOrder(payload: Partial<WorkOrder>, actorId?: string): Promise<WorkOrder> {
  return request<WorkOrder>("/api/work-orders", {
    method: "POST",
    headers: { "x-user-id": actorId ?? currentUserId ?? "" },
    body: JSON.stringify(payload),
  });
}

export function updateWorkOrder(
  id: string,
  payload: Partial<WorkOrder>,
  actorId?: string
): Promise<WorkOrder> {
  return request<WorkOrder>(`/api/work-orders/${id}`, {
    method: "PATCH",
    headers: { "x-user-id": actorId ?? currentUserId ?? "" },
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkOrder(id: string, actorId?: string): Promise<void> {
  await request<{ id: string }>(`/api/work-orders/${id}`, {
    method: "DELETE",
    headers: { "x-user-id": actorId ?? currentUserId ?? "" },
  });
}

export function approveWorkOrder(
  id: string,
  payload?: { engineerReviewer?: string },
  actorId?: string
): Promise<WorkOrder> {
  return request<WorkOrder>(`/api/work-orders/${id}/approve`, {
    method: "POST",
    headers: { "x-user-id": actorId ?? currentUserId ?? "" },
    body: JSON.stringify(payload || {}),
  });
}

// ---- Work Order Attachments ----
export function getWorkOrderAttachments(workOrderId: string): Promise<WorkOrderAttachment[]> {
  return request<{ items: WorkOrderAttachment[] }>(
    `/api/work-orders/${encodeURIComponent(workOrderId)}/attachments`
  ).then((res) => res.items);
}

export interface WorkOrderAttachmentUploadTicket {
  path: string;
  signedUrl: string;
  token: string;
}

export function requestWorkOrderAttachmentUploadUrl(
  workOrderId: string,
  input: { fileName: string; fileSize: number; contentType?: string }
): Promise<WorkOrderAttachmentUploadTicket> {
  return request<WorkOrderAttachmentUploadTicket>(
    `/api/work-orders/${encodeURIComponent(workOrderId)}/attachments/upload-url`,
    {
      method: "POST",
      headers: { "x-user-id": currentUserId ?? "" },
      body: JSON.stringify(input),
    }
  );
}

export function createWorkOrderAttachment(
  workOrderId: string,
  payload: {
    fileName: string;
    filePath: string;
    fileSize?: number;
    contentType?: string;
    note?: string;
  }
): Promise<WorkOrderAttachment> {
  return request<WorkOrderAttachment>(
    `/api/work-orders/${encodeURIComponent(workOrderId)}/attachments`,
    {
      method: "POST",
      headers: { "x-user-id": currentUserId ?? "" },
      body: JSON.stringify(payload),
    }
  );
}

export function getWorkOrderAttachmentUrl(
  workOrderId: string,
  attachmentId: string
): Promise<string> {
  return request<{ url: string }>(
    `/api/work-orders/${encodeURIComponent(workOrderId)}/attachments/${encodeURIComponent(
      attachmentId
    )}/file`
  ).then((res) => res.url);
}

export function deleteWorkOrderAttachment(
  workOrderId: string,
  attachmentId: string
): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/api/work-orders/${encodeURIComponent(workOrderId)}/attachments/${encodeURIComponent(
      attachmentId
    )}`,
    {
      method: "DELETE",
      headers: { "x-user-id": currentUserId ?? "" },
    }
  );
}

/** นามสกุลไฟล์ที่อนุญาตให้แนบกับใบงาน — ใช้ตรวจฝั่ง UI ก่อนอัปโหลด */
export const WORK_ORDER_ATTACHMENT_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];

export const WORK_ORDER_ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024;

export function uploadWorkOrderAttachmentFile(
  signedUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return uploadFileToSignedUrl(signedUrl, file, file.type || "application/octet-stream", onProgress);
}

/** ทางลัด: ขอ signed URL → อัปโหลดไฟล์ → บันทึกเมทาดาทาไฟล์แนบ ในคำเรียกเดียว */
export async function uploadWorkOrderAttachment(
  workOrderId: string,
  file: File,
  note?: string,
  onProgress?: (percent: number) => void
): Promise<WorkOrderAttachment> {
  const ticket = await requestWorkOrderAttachmentUploadUrl(workOrderId, {
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type || undefined,
  });
  await uploadFileToSignedUrl(ticket.signedUrl, file, file.type || "application/octet-stream", onProgress);
  return createWorkOrderAttachment(workOrderId, {
    fileName: file.name,
    filePath: ticket.path,
    fileSize: file.size,
    contentType: file.type || undefined,
    note,
  });
}

// ---- Spare Parts ----
export interface SparePartListParams {
  limit?: number;
  offset?: number;
  search?: string;
  stockStatus?: string;
  groupCode?: string;
}

export function getSpareParts(params: SparePartListParams = {}): Promise<PaginatedResult<SparePart>> {
  return requestPaginated<SparePart>(`/api/spare-parts${buildQuery(params)}`);
}

/** Aggregate counts/value for the whole `spare_parts` table — use for
 * dashboards/KPIs instead of computing `.filter()/.reduce()` over a (now
 * paginated) list. */
export interface MachineSparePartsParams {
  machineCode: string;
  workOrderId?: string;
  limit?: number;
}

/**
 * อะไหล่ที่เกี่ยวข้องกับเครื่องจักรเครื่องหนึ่ง (ประวัติการเบิก/เข้ากันได้)
 * — ผู้เรียกควรใช้ `toUserMessage(err, "ไม่สามารถโหลดรายการอะไหล่ของเครื่องจักรได้")`
 * เมื่อ catch ข้อผิดพลาดจากฟังก์ชันนี้
 */
export function getSparePartsForMachine(
  params: MachineSparePartsParams
): Promise<MachineSparePartsResult> {
  return request<MachineSparePartsResult>(`/api/spare-parts/for-machine${buildQuery(params)}`);
}

export function getSparePartStats(): Promise<SparePartStats> {
  return request<SparePartStats>("/api/spare-parts/stats");
}

export function createSparePart(payload: SparePartInput, actorId: string): Promise<SparePart> {
  return request<SparePart>("/api/spare-parts", {
    method: "POST",
    headers: { "x-user-id": actorId },
    body: JSON.stringify(payload),
  });
}

export function updateSparePart(
  id: string,
  payload: Partial<SparePartInput>,
  actorId: string
): Promise<SparePart> {
  return request<SparePart>(`/api/spare-parts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "x-user-id": actorId },
    body: JSON.stringify(payload),
  });
}

export function adjustSparePartStock(
  id: string,
  delta: number,
  actorId: string,
  note?: string
): Promise<SparePart> {
  const body: { delta: number; note?: string } = { delta };
  if (note && note.trim()) {
    body.note = note;
  }
  return request<SparePart>(`/api/spare-parts/${encodeURIComponent(id)}/stock`, {
    method: "POST",
    headers: { "x-user-id": actorId },
    body: JSON.stringify(body),
  });
}

export function deleteSparePart(id: string, actorId: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/api/spare-parts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-user-id": actorId },
  });
}

// ---- PM Plans ----
// New entity from the Excel import (docs/data-import-spec.md Section 5).
// Read-only for now — no create/update/delete endpoint exists yet.
export interface PmPlanListParams {
  limit?: number;
  offset?: number;
  machineCode?: string;
  statusCode?: string;
  planYear?: number;
  isOverdue?: boolean;
  q?: string;
}

export function getPmPlans(params: PmPlanListParams = {}): Promise<PaginatedResult<PmPlan>> {
  return requestPaginated<PmPlan>(`/api/pm-plans${buildQuery(params)}`);
}

export function getPmPlan(id: string): Promise<PmPlan> {
  return request<PmPlan>(`/api/pm-plans/${encodeURIComponent(id)}`);
}

export function getPmPlanStats(): Promise<PmPlanStats> {
  return request<PmPlanStats>("/api/pm-plans/stats");
}

// ---- Part Withdrawals ----
// New entity from the Excel import (docs/data-import-spec.md Section 5).
// Read-only — one row per historical withdrawal transaction.
export interface PartWithdrawalListParams {
  limit?: number;
  offset?: number;
  codeNo?: string;
  machineCode?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  workOrderId?: string;
}

export function getPartWithdrawals(
  params: PartWithdrawalListParams = {}
): Promise<PaginatedResult<PartWithdrawal>> {
  return requestPaginated<PartWithdrawal>(`/api/part-withdrawals${buildQuery(params)}`);
}

export function getPartWithdrawalStats(): Promise<PartWithdrawalStats> {
  return request<PartWithdrawalStats>("/api/part-withdrawals/stats");
}

export function createPartWithdrawal(
  input: PartWithdrawalInput,
  actorId: string
): Promise<PartWithdrawal> {
  return request<PartWithdrawal>("/api/part-withdrawals", {
    method: "POST",
    headers: { "x-user-id": actorId },
    body: JSON.stringify(input),
  });
}

// ---- Manuals ----
export function getManuals(): Promise<ManualDoc[]> {
  return request<ManualDoc[]>("/api/manuals");
}

// createManual/updateManual/deleteManual hit the backend directly (base "",
// same-origin relative path — see API_BASE above). The backend now guards
// these routes the same way as every other admin route: x-user-id resolved
// to profiles.role (engineer/supervisor) — see withActor() below.
export function createManual(payload: Partial<ManualDoc>, actorId?: string): Promise<ManualDoc> {
  return request<ManualDoc>(
    "/api/manuals",
    {
      method: "POST",
      headers: withActor(actorId),
      body: JSON.stringify(payload),
    },
    ""
  );
}

export function deleteManual(id: string, actorId?: string): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/api/manuals/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: withActor(actorId),
    },
    ""
  );
}

/**
 * ฟิลด์ที่ PATCH /api/manuals/:id ยอมรับจริงเท่านั้น (ตรงกับ backend ที่ตอนนี้
 * ปฏิเสธคีย์ที่ไม่รู้จักด้วย HTTP 400) — ไม่รวม filePath เพราะการเปลี่ยนไฟล์ PDF
 * ผ่าน PATCH ถูกยกเลิกไปแล้ว
 */
export function updateManual(
  id: string,
  payload: { title?: string; machineModel?: string; category?: string; tags?: string[] },
  actorId?: string
): Promise<ManualDoc> {
  return request<ManualDoc>(
    `/api/manuals/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: withActor(actorId),
      body: JSON.stringify(payload),
    },
    ""
  );
}

export interface ManualUploadTicket {
  path: string;
  signedUrl: string;
  token: string;
}

export function requestManualUploadUrl(
  payload: {
    fileName: string;
    fileSize: number;
  },
  actorId?: string
): Promise<ManualUploadTicket> {
  return request<ManualUploadTicket>("/api/manuals/upload-url", {
    method: "POST",
    headers: withActor(actorId),
    body: JSON.stringify(payload),
  });
}

/**
 * อัปโหลดไฟล์ PDF ไปยัง signed URL ของ Supabase Storage โดยตรง
 * ใช้ XMLHttpRequest แทน request()/fetch เพราะ (1) ต้องรายงานความคืบหน้าการอัปโหลด
 * ผ่าน upload.onprogress ซึ่ง fetch ทำไม่ได้ และ (2) ปลายทางนี้ไม่ใช่ API ของเรา
 * และไม่ได้ตอบกลับด้วย envelope {success, data}
 */
export function uploadManualFile(
  signedUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return uploadFileToSignedUrl(signedUrl, file, "application/pdf", onProgress);
}

/**
 * ตัวช่วยกลางสำหรับอัปโหลดไฟล์ไปยัง signed URL ของ Supabase Storage โดยตรง
 * ใช้ XMLHttpRequest แทน request()/fetch เพราะ (1) ต้องรายงานความคืบหน้าการอัปโหลด
 * ผ่าน upload.onprogress ซึ่ง fetch ทำไม่ได้ และ (2) ปลายทางนี้ไม่ใช่ API ของเรา
 * และไม่ได้ตอบกลับด้วย envelope {success, data}
 */
function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);
    // ไฟล์ 50MB บนไวไฟโรงงานอาจใช้เวลานาน จึงตั้ง timeout ไว้นานพอ (10 นาที)
    // เพื่อไม่ให้ผู้ใช้ค้างอยู่ที่ "กำลังส่งไฟล์ขึ้นคลัง..." ตลอดไปเมื่อการอัปโหลดสะดุด
    xhr.timeout = 10 * 60 * 1000;

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(Math.min(100, Math.max(0, percent)));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`อัปโหลดไฟล์ไม่สำเร็จ (HTTP ${xhr.status})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("อัปโหลดไฟล์ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย"));
    };

    xhr.onabort = () => {
      reject(new Error("การอัปโหลดไฟล์ถูกยกเลิก"));
    };

    xhr.ontimeout = () => {
      reject(
        new Error(
          "การอัปโหลดไฟล์ใช้เวลานานเกินไป กรุณาตรวจสอบการเชื่อมต่อเครือข่ายแล้วลองใหม่อีกครั้ง"
        )
      );
    };

    xhr.send(file);
  });
}

export function getManualFileUrl(id: string): Promise<{ url: string }> {
  return request<{ url: string }>(`/api/manuals/${encodeURIComponent(id)}/file`);
}

export async function getManualContent(id: string): Promise<string | null> {
  const { markdownContent } = await request<{ markdownContent: string | null }>(
    `/api/manuals/${encodeURIComponent(id)}/content`
  );
  return markdownContent ?? null;
}

// ---- AI ----
// Note: /api/ai/chat and /api/ai/diagnose do NOT use the {success, data}
// envelope — they return their payload at the top level.

export interface AiChatHistoryItem {
  role: string;
  content: string;
}

export interface AiChatPayload {
  prompt: string;
  machineContext: Machine;
  role: UserRole;
  history: AiChatHistoryItem[];
}

/**
 * โหมดที่เซิร์ฟเวอร์ใช้ตอบคำถามนี้ (ดู AiMode ใน backend/src/config.ts)
 * - "mock"     ตอบด้วยกฎ + ข้อมูลจริงจากฐานข้อมูล ไม่เรียกโมเดลภาษา
 * - "live"     ตอบด้วยโมเดลภาษาจริง
 * - "fallback" โมเดลเรียกไม่สำเร็จ ตกไปใช้คำตอบสำรองแบบออฟไลน์
 */
export type AiMode = "mock" | "live" | "fallback";

export interface AiChatResponse {
  success: boolean;
  reply: string;
  timestamp: string;
  error?: string;
  /** true = ทุกโมเดล AI เรียกไม่สำเร็จ คำตอบนี้เป็นข้อความสำรองแบบออฟไลน์ ไม่ได้อ้างอิงข้อมูลเครื่องจักรจริง */
  fallback?: boolean;
  /** โหมดที่ใช้ตอบ — undefined ได้ถ้าเซิร์ฟเวอร์เป็นเวอร์ชันก่อนที่จะมีฟิลด์นี้ */
  mode?: AiMode;
  /** เจตนาที่ระบบตีความได้ (โหมด mock) — "unknown" = ตอบไม่ได้ จึงเสนอเมนูแทน */
  intent?: string;
  /** id ของแถว log สำหรับผูกปุ่มให้ผลตอบรับ — null เมื่อบันทึก log ไม่สำเร็จ */
  logId?: number | null;
}

/**
 * โหมดที่เซิร์ฟเวอร์ตั้งไว้ ใช้แสดงป้ายบอกผู้ใช้ก่อนเริ่มถาม
 * (ไม่ใช่โหมดของคำตอบข้อใดข้อหนึ่ง — ค่านั้นอยู่ที่ AiChatResponse.mode)
 */
export function getAiMode(): Promise<{ mode: "mock" | "live" }> {
  return request<{ mode: "mock" | "live" }>("/api/ai/mode");
}

/**
 * ส่งผลตอบรับของผู้ใช้ต่อคำตอบหนึ่งข้อ (Frame 4 ของ UX Storyboard)
 * `logId` ต้องมาจาก AiChatResponse.logId ของคำตอบนั้นเท่านั้น
 */
export function aiFeedback(logId: number, feedback: 1 | -1): Promise<{ logId: number; feedback: number }> {
  return request<{ logId: number; feedback: number }>("/api/ai/feedback", {
    method: "POST",
    body: JSON.stringify({ logId, feedback }),
  });
}

export async function aiChat(payload: AiChatPayload, actorId?: string): Promise<AiChatResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": actorId ?? currentUserId ?? "",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ AI ได้");
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`เซิร์ฟเวอร์ AI ตอบกลับไม่ถูกต้อง (HTTP ${res.status})`);
  }

  if (!res.ok || !json?.success) {
    throw new Error(
      extractErrorMessage(json?.error, "ไม่สามารถดึงข้อมูลจาก AI ได้")
    );
  }

  return json as AiChatResponse;
}

export interface AiDiagnosePayload {
  machineCode: string;
  errorText: string;
  imageBase64?: string;
}

export interface AiDiagnoseResponse {
  success: boolean;
  result: unknown;
}

export async function aiDiagnose(
  payload: AiDiagnosePayload,
  actorId?: string
): Promise<AiDiagnoseResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/ai/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": actorId ?? currentUserId ?? "",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ AI ได้");
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`เซิร์ฟเวอร์ AI ตอบกลับไม่ถูกต้อง (HTTP ${res.status})`);
  }

  if (!res.ok || !json?.success) {
    throw new Error(
      extractErrorMessage(json?.error, "ไม่สามารถวิเคราะห์ปัญหาด้วย AI ได้")
    );
  }

  return json as AiDiagnoseResponse;
}

// ---- Knowledge (UX Storyboard Scenario C: ดูแลคลังความรู้หลังปิดงาน) ----
//
// ทุก endpoint ต้องแนบ x-user-id เพราะฝั่ง backend ใช้ requireAuthenticated/requireRole
// (ดู backend/src/routes/knowledge.ts) — ตัว request() ไม่ได้แนบให้เองเหมือน aiChat()
// จึงต้องส่ง actorId เข้ามาทุกครั้ง ค่าเริ่มต้นดึงจาก currentUserId ที่ตั้งไว้ตอน login

function withActor(actorId?: string): Record<string, string> {
  return { "x-user-id": actorId ?? currentUserId ?? "" };
}

/** Frame 1 — ใบงานรอรีวิว จัดลำดับด้วยกฎ (พร้อมเหตุผลที่อธิบายได้) */
export interface ReviewQueueItem {
  workOrderId: string;
  workOrderCode: string;
  title: string;
  machineId: string | null;
  machineCode: string | null;
  machineName: string | null;
  technicianName: string | null;
  priority: string | null;
  assignedDate: string | null;
  closedAt: string | null;
  downtimeMinutes: number | null;
  machineLevel: "normal" | "warning" | "critical" | null;
  daysWaiting: number | null;
  rankScore: number;
  rankReasons: string[];
  hasKnowledge: boolean;
}

export interface ReviewQueueResponse {
  items: ReviewQueueItem[];
  pendingCount: number;
  totalCount: number;
}

export function getReviewQueue(actorId?: string): Promise<ReviewQueueResponse> {
  return request<ReviewQueueResponse>("/api/knowledge/review-queue", { headers: withActor(actorId) });
}

/** Frame 2 — ร่างองค์ความรู้จากสิ่งที่ช่างบันทึกไว้ (ยังไม่เข้าคลัง) */
export interface KnowledgeDraft {
  title: string;
  category: string;
  machineModel: string | null;
  machineCode: string | null;
  tags: string[];
  summary: string;
  content: string;
  technicianReport: {
    symptoms: string;
    cause: string;
    repairAction: string;
    solutionSteps: string | null;
    technicianNote: string;
    partsUsed: string | null;
    downtimeMinutes: number | null;
  };
  gaps: string[];
}

export function getKnowledgeDraft(
  workOrderId: string,
  actorId?: string
): Promise<{ draft: KnowledgeDraft; saved: boolean }> {
  return request<{ draft: KnowledgeDraft; saved: boolean }>(
    `/api/knowledge/draft/${encodeURIComponent(workOrderId)}`,
    { headers: withActor(actorId) }
  );
}

export interface ConfirmKnowledgePayload {
  workOrderId: string;
  title: string;
  category?: string | null;
  machineModel?: string | null;
  machineCode?: string | null;
  tags?: string[];
  summary?: string | null;
  content: string;
  /** ร่างเดิมที่ระบบสร้าง ส่งไปเก็บคู่กันเพื่อให้รู้ว่า Engineer แก้อะไร */
  draftContent?: string | null;
  confirmedByName?: string | null;
}

/** Frame 2 — ยืนยันความรู้เข้าคลัง (เฉพาะ engineer/supervisor) */
export function confirmKnowledge(
  payload: ConfirmKnowledgePayload,
  actorId?: string
): Promise<{ id: string }> {
  return request<{ id: string }>("/api/knowledge/confirm", {
    method: "POST",
    headers: withActor(actorId),
    body: JSON.stringify(payload),
  });
}

/** Frame 4 — ภาพรวมคลังความรู้ พร้อมสถิติการถูกนำไปใช้จริง */
export interface KnowledgeUsageRow {
  id: string;
  title: string;
  category: string | null;
  machineCode: string | null;
  sourceWorkOrderCode: string | null;
  confirmedByName: string | null;
  confirmedAt: string;
  citedCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  editedFromDraft: boolean;
}

export interface KnowledgeOverview {
  totalArticles: number;
  neverCitedCount: number;
  totalCitations: number;
  totalHelpful: number;
  totalNotHelpful: number;
  pendingReviewCount: number;
  articles: KnowledgeUsageRow[];
}

export function getKnowledgeOverview(actorId?: string): Promise<KnowledgeOverview> {
  return request<KnowledgeOverview>("/api/knowledge/overview", { headers: withActor(actorId) });
}

export function getKnowledgeContent(
  id: string,
  actorId?: string
): Promise<{
  id: string;
  title: string;
  content: string;
  draft_content: string | null;
  confirmed_by_name: string | null;
  confirmed_at: string;
  source_work_order_code: string | null;
}> {
  return request(`/api/knowledge/${encodeURIComponent(id)}/content`, { headers: withActor(actorId) });
}
