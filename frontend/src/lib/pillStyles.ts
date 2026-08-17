// Single source of truth for status/priority pill styling and Thai labels.
// Flat, borderless color classes on the parchment/ink palette — no borders, no animation.

import type { Machine, WorkOrder } from "../types";

export type WorkOrderStatus = WorkOrder["status"];
export type WorkOrderPriority = WorkOrder["priority"];
export type MachineStatus = Machine["status"];

export const pillBase =
  'whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0';

/* ---------------------------------------------------------------- */
/* Work-order status                                                */
/* ---------------------------------------------------------------- */

export const WO_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังซ่อม",
  review: "รอตรวจสอบ",
  completed: "ปิดงานแล้ว",
};

const WO_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  review: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export function woStatusLabel(status: string): string {
  return WO_STATUS_LABELS[status as WorkOrderStatus] ?? status;
}

export function woStatusPillClass(status: string): string {
  const colorClasses =
    WO_STATUS_COLORS[status as WorkOrderStatus] ?? "bg-amber-100 text-amber-800";
  return pillBase + " " + colorClasses;
}

/** Backward-compatible alias — prefer woStatusPillClass. */
export function statusPillClass(status: string): string {
  return woStatusPillClass(status);
}

/* ---------------------------------------------------------------- */
/* Work-order priority                                              */
/* ---------------------------------------------------------------- */

export const PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  high: "ด่วน",
  medium: "ปกติ",
  low: "ตามแผน",
};

/**
 * One priority ramp for the whole app: urgent reads red, normal reads amber,
 * planned reads neutral. The three must never share a swatch — a list where
 * "ปกติ" and "ตามแผน" look identical tells the reader nothing.
 */
const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  high: "bg-rose-100 text-rose-900",
  medium: "bg-amber-100 text-amber-900",
  low: "bg-parchment text-ink-muted",
};

/** Filled version of the same ramp, for a selected choice in a form. */
const PRIORITY_SELECTED_COLORS: Record<WorkOrderPriority, string> = {
  high: "bg-rose-600 text-white border-rose-700",
  medium: "bg-amber-500 text-white border-amber-600",
  low: "bg-ink-muted text-white border-ink",
};

export function priorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority as WorkOrderPriority] ?? priority;
}

export function priorityPillClass(priority: string): string {
  const colorClasses =
    PRIORITY_COLORS[priority as WorkOrderPriority] ?? PRIORITY_COLORS.medium;
  return pillBase + " " + colorClasses;
}

/**
 * Classes for a priority option button in a form — the same ramp as the pill,
 * so the choice a person makes looks like the pill they will see afterwards.
 * Layout (width, height, min tap target) belongs to the call site.
 */
export function priorityChoiceClass(priority: string, isSelected: boolean): string {
  if (!isSelected) {
    return "bg-white text-ink-muted border-hairline hover:bg-parchment";
  }
  const colorClasses =
    PRIORITY_SELECTED_COLORS[priority as WorkOrderPriority] ??
    PRIORITY_SELECTED_COLORS.medium;
  return colorClasses + " ring-2 ring-offset-1 ring-primary-focus";
}

/* ---------------------------------------------------------------- */
/* Machine status                                                   */
/* ---------------------------------------------------------------- */

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  normal: "ทำงานปกติ",
  warning: "ต้องเฝ้าระวัง",
  error: "ขัดข้อง",
  maintenance: "กำลังซ่อมบำรุง",
};

const MACHINE_STATUS_DOTS: Record<MachineStatus, string> = {
  normal: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
  maintenance: "bg-blue-500",
};

/** Container classes for the interactive machine chip (background, hover, border). */
const MACHINE_STATUS_CHIPS: Record<MachineStatus, string> = {
  normal: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200",
  warning: "bg-amber-50 hover:bg-amber-100/80 border-amber-200",
  error: "bg-rose-50 hover:bg-rose-100/80 border-rose-200",
  maintenance: "bg-blue-50 hover:bg-blue-100/80 border-blue-200",
};

/** Foreground text classes matching the chip surface. */
const MACHINE_STATUS_TEXT: Record<MachineStatus, string> = {
  normal: "text-emerald-800",
  warning: "text-amber-800",
  error: "text-rose-800",
  maintenance: "text-blue-800",
};

/** Non-interactive status badge (dropdown rows, lists). */
const MACHINE_STATUS_BADGES: Record<MachineStatus, string> = {
  normal: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-rose-100 text-rose-700",
  maintenance: "bg-blue-100 text-blue-700",
};

export function machineStatusLabel(status: string): string {
  return MACHINE_STATUS_LABELS[status as MachineStatus] ?? status;
}

/** Static status dot — no animation by design. */
export function machineStatusDotClass(status: string): string {
  const color = MACHINE_STATUS_DOTS[status as MachineStatus] ?? "bg-rose-500";
  return "w-2 h-2 rounded-full shrink-0 " + color;
}

export function machineStatusChipClass(status: string): string {
  return MACHINE_STATUS_CHIPS[status as MachineStatus] ?? MACHINE_STATUS_CHIPS.error;
}

export function machineStatusTextClass(status: string): string {
  return MACHINE_STATUS_TEXT[status as MachineStatus] ?? MACHINE_STATUS_TEXT.error;
}

export function machineStatusBadgeClass(status: string): string {
  const color =
    MACHINE_STATUS_BADGES[status as MachineStatus] ?? MACHINE_STATUS_BADGES.error;
  return "px-1.5 py-0.5 rounded text-[10px] font-semibold " + color;
}

/* ---------------------------------------------------------------- */
/* Spare part stock status                                          */
/* ---------------------------------------------------------------- */

export type SparePartStatus = "in_stock" | "low_stock" | "out_of_stock";

const SPARE_PART_STATUS_COLORS: Record<SparePartStatus, string> = {
  in_stock: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-rose-100 text-rose-800",
};

export function sparePartStatusPillClass(status: SparePartStatus): string {
  const colorClasses = SPARE_PART_STATUS_COLORS[status] ?? SPARE_PART_STATUS_COLORS.in_stock;
  return pillBase + " " + colorClasses;
}
