// Single source of truth for "is this work order late?".
//
// A maintenance centre exists to not miss a due date, so the due state is a
// first-class piece of information — not small grey print. Every view that
// lists work orders should read the state from here so "เลยกำหนด" means the
// same thing everywhere.
//
// Rules:
// - dueDate is a plain "YYYY-MM-DD" calendar day; comparison is day-granular
//   in the browser's local timezone (the factory floor's own day).
// - A closed work order (status "completed") is never overdue — the work
//   landed, whenever it landed.
// - "review" is NOT closed: the technician submitted, but the job is not
//   signed off, so a late review still reads as late for the supervisor.

import type { WorkOrder } from "../types";
import { pillBase } from "./pillStyles";

/** How many days ahead still counts as "ครบกำหนดเร็ว ๆ นี้". */
export const DUE_SOON_DAYS = 1;

/**
 * ค่าเริ่มต้นของกำหนดเสร็จเมื่อเปิดใบงานใหม่ (วัน).
 *
 * The rule lives here and nowhere else: App writes the due date with
 * `defaultDueDate()` and the assistant's confirmation panel shows the same
 * call, so the number a person confirms can never disagree with the number
 * that gets saved.
 */
export const DEFAULT_DUE_DAYS = 2;

/** กำหนดเสร็จเริ่มต้นในรูปแบบ "YYYY-MM-DD" นับจากวันนี้. */
export function defaultDueDate(): string {
  return new Date(Date.now() + 86400000 * DEFAULT_DUE_DAYS)
    .toISOString()
    .slice(0, 10);
}

/* ---------------------------------------------------------------- */
/* Which date a list shows for a work order                         */
/* ---------------------------------------------------------------- */

/**
 * The date to print for a work order in a list, timeline or history table.
 *
 * History views used to print `updatedAt`. Every one of the 8,589 imported work
 * orders was written by the same migration, so `updated_at` (and `created_at`)
 * hold one identical import timestamp — "2026-08-14T02:44:…" — and three years
 * of repair history rendered as one repeated date. Those two columns describe
 * when the *row* was written, not when the work happened, so they are the last
 * resort here, kept only for tickets created through the app.
 *
 * `assignedDate` is the field to show. Measured against the live table:
 *
 *   • It is what the server sorts by (`assigned_date DESC`, see
 *     backend/src/routes/workOrders.ts): 0 ordering violations across a
 *     1,000-row page, so the printed date always agrees with the row order.
 *     `finishDatetime` violates that order on 481 of 999 adjacent pairs —
 *     within one assigned day the finish times come back in arbitrary order, so
 *     showing it would make the dates visibly jump up and down the list.
 *   • `finishDatetime` is stored in UTC. Read as a raw date it disagrees with
 *     `assignedDate` on 18% of rows, always by one day, because the night shift
 *     finishes after 17:00 Bangkok — i.e. the previous UTC day. Converted to
 *     factory-local time the two agree on 98.5% of rows, so `assignedDate` is
 *     already the same calendar day without any timezone handling to get wrong.
 *   • Every other list in the app (AllWorkOrdersView, SupervisorReportsView)
 *     already prints `assignedDate`; matching it means one ticket shows one date
 *     everywhere instead of a third convention.
 *
 * `finishDatetime` is the fallback because it is the only field present on all
 * 8,589 rows (`assignedDate` is null on 2), and it is converted to the factory's
 * local day, never sliced as raw UTC.
 */
export function workOrderDisplayDate(
  wo: Pick<WorkOrder, "assignedDate" | "finishDatetime" | "updatedAt">
): string | null {
  if (wo.assignedDate) return wo.assignedDate.slice(0, 10);
  const finishedLocal = toLocalDay(wo.finishDatetime);
  if (finishedLocal) return finishedLocal;
  // Created in the app rather than imported: `updatedAt` is a real edit time.
  return toLocalDay(wo.updatedAt);
}

/** "YYYY-MM-DD" in the factory's own timezone, from a date or ISO timestamp. */
function toLocalDay(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

/**
 * "22:40" — when the repair actually finished, in factory-local time.
 *
 * Extra detail for the technician's timeline only. It never drives ordering, so
 * the UTC-vs-local subtlety above cannot reorder anything through it.
 */
export function workOrderFinishTime(
  wo: Pick<WorkOrder, "finishDatetime">
): string | null {
  if (!wo.finishDatetime) return null;
  const parsed = new Date(wo.finishDatetime);
  if (Number.isNaN(parsed.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export type DueState =
  /** เลยกำหนดแล้วและยังไม่ปิดงาน */
  | "overdue"
  /** ครบกำหนดวันนี้ */
  | "due_today"
  /** ครบกำหนดภายใน DUE_SOON_DAYS วัน */
  | "due_soon"
  /** ยังมีเวลา */
  | "scheduled"
  /** ปิดงานแล้ว — ไม่นับว่าเลยกำหนด */
  | "closed"
  /** ไม่มีวันครบกำหนดในข้อมูล */
  | "no_due_date";

/** A work order that no longer accrues lateness. */
export function isClosed(wo: Pick<WorkOrder, "status">): boolean {
  return wo.status === "completed";
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Parse a "YYYY-MM-DD" due date as a local calendar day. Null when absent/invalid. */
export function parseDueDate(dueDate?: string): Date | null {
  if (!dueDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dueDate.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const parsed = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Whole days from today to the due date.
 * Negative = late, 0 = due today, positive = days remaining.
 * Null when there is no usable due date.
 */
export function daysUntilDue(
  wo: Pick<WorkOrder, "dueDate">,
  now: Date = new Date()
): number | null {
  const due = parseDueDate(wo.dueDate);
  if (!due) return null;
  const msPerDay = 86400000;
  return Math.round((due.getTime() - startOfDay(now).getTime()) / msPerDay);
}

/** Whole days past the due date. 0 when on time, closed, or undated. */
export function daysOverdue(
  wo: Pick<WorkOrder, "dueDate" | "status">,
  now: Date = new Date()
): number {
  if (isClosed(wo)) return 0;
  const days = daysUntilDue(wo, now);
  if (days === null || days >= 0) return 0;
  return -days;
}

export function isOverdue(
  wo: Pick<WorkOrder, "dueDate" | "status">,
  now: Date = new Date()
): boolean {
  return daysOverdue(wo, now) > 0;
}

/** Due today or within DUE_SOON_DAYS days, and not yet late or closed. */
export function isDueSoon(
  wo: Pick<WorkOrder, "dueDate" | "status">,
  now: Date = new Date()
): boolean {
  if (isClosed(wo)) return false;
  const days = daysUntilDue(wo, now);
  return days !== null && days >= 0 && days <= DUE_SOON_DAYS;
}

export function dueState(
  wo: Pick<WorkOrder, "dueDate" | "status">,
  now: Date = new Date()
): DueState {
  if (isClosed(wo)) return "closed";
  const days = daysUntilDue(wo, now);
  if (days === null) return "no_due_date";
  if (days < 0) return "overdue";
  if (days === 0) return "due_today";
  if (days <= DUE_SOON_DAYS) return "due_soon";
  return "scheduled";
}

/** Thai one-liner describing the due state, e.g. "เลยกำหนด 3 วัน". */
export function dueLabel(
  wo: Pick<WorkOrder, "dueDate" | "status">,
  now: Date = new Date()
): string {
  const state = dueState(wo, now);
  const days = daysUntilDue(wo, now);

  switch (state) {
    case "overdue":
      return `เลยกำหนด ${daysOverdue(wo, now)} วัน`;
    case "due_today":
      return "ครบกำหนดวันนี้";
    case "due_soon":
      return days === 1 ? "ครบกำหนดพรุ่งนี้" : `ครบกำหนดในอีก ${days} วัน`;
    case "scheduled":
      return `กำหนดเสร็จ ${wo.dueDate}`;
    case "closed":
      return "ปิดงานแล้ว";
    default:
      return "ไม่ระบุกำหนดเสร็จ";
  }
}

/** True for the states that deserve visual weight in a list. */
export function isDueStateUrgent(state: DueState): boolean {
  return state === "overdue" || state === "due_today" || state === "due_soon";
}

/** Pill classes for the due badge, sharing the pill geometry from pillStyles. */
export function duePillClass(state: DueState): string {
  const colors: Record<DueState, string> = {
    overdue: "bg-rose-100 text-rose-900",
    due_today: "bg-amber-100 text-amber-900",
    due_soon: "bg-amber-50 text-amber-900",
    scheduled: "bg-parchment text-ink-muted",
    closed: "bg-parchment text-ink-muted",
    no_due_date: "bg-parchment text-ink-muted",
  };
  return pillBase + " " + colors[state];
}

/** Restrained card treatment for a late work order — background/text, no stripe. */
export function overdueCardClass(state: DueState): string {
  return state === "overdue" ? "bg-rose-50/60 border-rose-200" : "bg-white border-hairline";
}

/**
 * Sort comparator: overdue first (longest late first), then by due date
 * ascending, undated next, and closed work orders last.
 */
export function compareByUrgency(
  a: Pick<WorkOrder, "dueDate" | "status">,
  b: Pick<WorkOrder, "dueDate" | "status">,
  now: Date = new Date()
): number {
  const rank = (wo: Pick<WorkOrder, "dueDate" | "status">) => {
    if (isClosed(wo)) return 3;
    return parseDueDate(wo.dueDate) ? 1 : 2;
  };

  const rankDiff = rank(a) - rank(b);
  if (rankDiff !== 0) return rankDiff;

  const da = daysUntilDue(a, now);
  const db = daysUntilDue(b, now);
  if (da === null && db === null) return 0;
  if (da === null) return 1;
  if (db === null) return -1;
  return da - db;
}

/** How many open work orders are past their due date. */
export function countOverdue(
  workOrders: Array<Pick<WorkOrder, "dueDate" | "status">>,
  now: Date = new Date()
): number {
  return workOrders.filter((wo) => isOverdue(wo, now)).length;
}
