import {
  UserProfile,
  Machine,
  MachineInput,
  WorkOrder,
  SparePart,
  SparePartInput,
  ManualDoc,
  UserRole,
  TelemetryMetric,
  TelemetryReading,
  PmPlan,
  PartWithdrawal,
  MachineStats,
  SparePartStats,
  WorkOrderStats,
  PmPlanStats,
  PartWithdrawalStats,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
  /** Exact match against work_orders.assigned_to (a name, not a user id — see
   * WorkOrderForm/App.tsx, which populate it from the assignee's display name). */
  assignedTo?: string;
  /** Free-text search across id/code/title/description/machine_code/machine_name_std.
   * Does NOT cover technician_name — see backend/src/routes/workOrders.ts. */
  search?: string;
}

export function getWorkOrders(params: WorkOrderListParams = {}): Promise<PaginatedResult<WorkOrder>> {
  return requestPaginated<WorkOrder>(`/api/work-orders${buildQuery(params)}`);
}

/** Aggregate counts for the whole `work_orders` table — use for
 * dashboards/KPIs/reports instead of aggregating over a (now paginated) list. */
export function getWorkOrderStats(): Promise<WorkOrderStats> {
  return request<WorkOrderStats>("/api/work-orders/stats");
}

export function createWorkOrder(payload: Partial<WorkOrder>): Promise<WorkOrder> {
  return request<WorkOrder>("/api/work-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWorkOrder(id: string, payload: Partial<WorkOrder>): Promise<WorkOrder> {
  return request<WorkOrder>(`/api/work-orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function approveWorkOrder(
  id: string,
  payload?: { engineerReviewer?: string }
): Promise<WorkOrder> {
  return request<WorkOrder>(`/api/work-orders/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
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
}

export function getPartWithdrawals(
  params: PartWithdrawalListParams = {}
): Promise<PaginatedResult<PartWithdrawal>> {
  return requestPaginated<PartWithdrawal>(`/api/part-withdrawals${buildQuery(params)}`);
}

export function getPartWithdrawalStats(): Promise<PartWithdrawalStats> {
  return request<PartWithdrawalStats>("/api/part-withdrawals/stats");
}

// ---- Manuals ----
export function getManuals(): Promise<ManualDoc[]> {
  return request<ManualDoc[]>("/api/manuals");
}

// createManual/updateManual/deleteManual go through this app's own server
// (base "") instead of API_BASE, so the server can inject the manual admin
// secret without ever shipping it to the browser. See server.ts.
export function createManual(payload: Partial<ManualDoc>): Promise<ManualDoc> {
  return request<ManualDoc>(
    "/api/manuals",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    ""
  );
}

export function deleteManual(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/api/manuals/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
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
  payload: { title?: string; machineModel?: string; category?: string; tags?: string[] }
): Promise<ManualDoc> {
  return request<ManualDoc>(
    `/api/manuals/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
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

export function requestManualUploadUrl(payload: {
  fileName: string;
  fileSize: number;
}): Promise<ManualUploadTicket> {
  return request<ManualUploadTicket>("/api/manuals/upload-url", {
    method: "POST",
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
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", "application/pdf");
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

export interface AiChatResponse {
  success: boolean;
  reply: string;
  timestamp: string;
  error?: string;
  /** true = ทุกโมเดล AI เรียกไม่สำเร็จ คำตอบนี้เป็นข้อความสำรองแบบออฟไลน์ ไม่ได้อ้างอิงข้อมูลเครื่องจักรจริง */
  fallback?: boolean;
}

export async function aiChat(payload: AiChatPayload): Promise<AiChatResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

export async function aiDiagnose(payload: AiDiagnosePayload): Promise<AiDiagnoseResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/ai/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
