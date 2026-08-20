import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Wrench,
  CheckSquare,
  Eye,
  FileText,
  Clock,
  ClipboardCheck,
  AlertTriangle,
  Cpu,
  X,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Machine, WorkOrder, UserRole, WorkOrderStats, SparePart, UserProfile } from "../../types";
import { WorkOrderDetailModal } from "../WorkOrderDetailModal";
import { EditWorkOrderModal } from "../EditWorkOrderModal";
import { MachineSelect } from "../MachineSelect";
import { Pencil, Trash2 } from "lucide-react";
import {
  woStatusLabel,
  woStatusPillClass,
  priorityLabel,
  priorityPillClass,
} from "../../lib/pillStyles";
import {
  compareByUrgency,
  dueLabel,
  duePillClass,
  dueState,
  overdueCardClass,
} from "../../lib/workOrderStatus";
import { getWorkOrders, toUserMessage } from "../../services/apiService";
import { notifyFailed } from "../../lib/swal";
import type { WorkOrderListParams } from "../../services/apiService";
import { Pagination } from "../ui/Pagination";
import { SkeletonCardGrid } from "../ui/Skeleton";

interface MyWorkOrdersViewProps {
  currentUserRole: UserRole;
  /**
   * profiles.id ของผู้ใช้ปัจจุบัน (`usr-...`) — ใช้กรองใบงาน "ของฉัน" จาก
   * server ด้วย ?assignedTo= เพราะ work_orders.assigned_to เก็บ profiles.id
   * จริง ๆ (8,589/8,606 แถว) ไม่ใช่ชื่อคน มีเพียง 17 แถวเก่าที่ยังเป็นชื่อไทย
   * จากก่อนแก้บั๊กนี้ ห้ามใช้ชื่อผู้ใช้เป็นตัวกรองที่นี่
   */
  currentAssigneeKey?: string;
  /**
   * ชื่อผู้ใช้ปัจจุบัน (สำหรับแสดงผลเท่านั้น) — ใช้ประทับชื่อผู้เพิ่มขั้นตอน
   * ในใบงาน (WorkOrderStep.addedBy) เมื่อส่งต่อไปยัง WorkOrderDetailModal
   * ห้ามใช้ค่านี้เป็นตัวกรอง ?assignedTo= (ดู currentAssigneeKey ด้านบน)
   */
  currentUserName?: string;
  /** เครื่องจักรที่กำลังทำงานอยู่ (จาก TopBar) — เปิดใช้ตัวกรองเฉพาะเครื่องนี้ */
  activeMachine?: Machine;
  /** รายการเครื่องจักรทั้งหมด — ใช้กับดรอปดาวน์เลือกเครื่องจักร */
  machines?: Machine[];
  /**
   * สถิติ (นับ/แท็บ) ของใบงานที่ scope ด้วย assignedTo เดียวกับหน้านี้ — มาจาก
   * App.tsx (myWorkOrderStats) แทนที่จะดึงซ้ำเองที่นี่ เพื่อไม่ให้เกิดการ scan
   * ตารางทั้งหมดซ้ำซ้อนทุกครั้งที่สลับแท็บ/เปลี่ยนหน้า และตัวเลขไม่เพี้ยนกัน
   * ระหว่าง badge กับแท็บ (สอง state คนละที่คำนวณ)
   */
  myWorkOrderStats?: WorkOrderStats | null;
  /** เปลี่ยนเครื่องจักรที่กำลังใช้งาน (sync กับ TopBar/หน้าหลัก) */
  onSelectMachine?: (machine: Machine) => void;
  onUpdateWorkOrder: (updatedWO: WorkOrder) => Promise<void>;
  /** ลบใบงาน — ปุ่ม "ลบ" จะแสดงบนการ์ดเฉพาะเมื่อมี prop นี้และผู้ใช้มีสิทธิ์ */
  onDeleteWorkOrder?: (id: string) => Promise<void>;
  /** รายการอะไหล่ — ส่งต่อให้ EditWorkOrderModal เท่านั้น */
  spareParts?: SparePart[];
  /** รายชื่อช่างสำหรับมอบหมายงานใหม่ — ส่งต่อให้ EditWorkOrderModal เท่านั้น */
  technicians?: Pick<UserProfile, "id" | "name">[];
  /** ผู้ใช้ปัจจุบัน (สำหรับ EditWorkOrderModal) */
  currentUser?: UserProfile | null;
  onAskAI: (prompt: string) => void;
  /** เรียกเมื่อมีการเบิกอะไหล่จริงสำเร็จในใบงาน — ให้ App.tsx รีเฟรช spareParts */
  onStockChanged?: () => void;
}

// ใบงานของช่างคนเดียวไม่ควรมีจำนวนมากเท่าใบงานทั้งระบบ แต่กันเผื่อไว้ด้วยการแบ่งหน้า
const PAGE_SIZE = 200;

// แท็บ "ปิดงานแล้ว" มักมีจำนวนมากสะสมตามเวลา (งานเก่าที่ปิดไปแล้วไม่ควร
// รกหน้าจอ) จึงใช้หน้าเล็กกว่าแท็บอื่น ๆ ร่วมกับตัวกรองรายเดือน
const CLOSED_PAGE_SIZE = 20;

const FILTER_TABS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "overdue", label: "เลยกำหนด" },
  { id: "in_progress", label: "กำลังซ่อม" },
  { id: "pending", label: "รอดำเนินการ" },
  { id: "review", label: "รอวิศวกรอนุมัติ" },
  { id: "completed", label: "ปิดงานแล้ว" },
] as const;

/** ตัวเลือกเดือนสำหรับตัวกรองในแท็บ "ปิดงานแล้ว" — ย้อนหลัง 12 เดือนล่าสุด
 * บวกตัวเลือก "ทุกเดือน" เพราะเราไม่มีสถิติจำนวนใบงานปิดต่อเดือนพร้อมใช้
 * ที่ฝั่งนี้ (จะต้องดึงข้อมูลเพิ่มเพียงเพื่อสร้างรายการเดือน ซึ่งไม่คุ้มค่า) */
function buildRecentMonthOptions(count = 12): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, "0")}`;
    const label = d.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
    options.push({ value, label });
  }
  return options;
}

const MONTH_OPTIONS = buildRecentMonthOptions();

/** ช่วงวันที่ (from/to แบบ YYYY-MM-DD) ของเดือนที่เลือก ใช้กรองบน
 * assigned_date ฝั่ง server (เหมือนที่ AllWorkOrdersView ใช้) — คืนค่า
 * undefined ทั้งคู่เมื่อเลือก "ทุกเดือน" */
function monthRange(monthValue: string): { from?: string; to?: string } {
  if (!monthValue) return {};
  const [yearStr, monthStr] = monthValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return {};
  const from = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

/**
 * ตัวกรองฝั่ง server ต่อแท็บ — ต้องดึงจาก server ตามแท็บที่เลือก ไม่ใช่กรอง
 * client-side เฉพาะหน้าที่โหลดมาแล้ว (PAGE_SIZE = 200 แถว) เพราะช่างที่มีใบงาน
 * เกิน 200 ใบจะเห็นแท็บว่างเปล่าทั้งที่ badge บอกว่ามีงานค้างอยู่
 *
 * "overdue" อิงวันที่ (ไม่ใช่ status ธรรมดา) จึงส่งเป็น query param แยก
 * (`overdue=true`) ที่ backend คำนวณด้วย predicate เดียวกับ /stats ทุกประการ
 * (ดู isOverdueRow ใน backend/src/routes/workOrders.ts)
 */
const TAB_QUERY: Record<string, Pick<WorkOrderListParams, "status" | "overdue">> = {
  all: {},
  overdue: { overdue: true },
  in_progress: { status: "in_progress" },
  pending: { status: "pending" },
  review: { status: "review" },
  completed: { status: "completed" },
};

const EMPTY_STATES: Record<
  string,
  { icon: LucideIcon; message: string; hint: string }
> = {
  all: {
    icon: FileText,
    message: "ยังไม่มีใบงานในระบบ",
    hint: "เปิดใบงานใหม่ได้จากหน้าเครื่องจักรหรือปุ่มเปิดใบงานด่วน",
  },
  overdue: {
    icon: AlertTriangle,
    message: "ไม่มีใบงานที่เลยกำหนด",
    hint: "ทุกใบงานที่เปิดอยู่ยังอยู่ในกำหนดเสร็จ",
  },
  in_progress: {
    icon: Wrench,
    message: "ยังไม่มีใบงานที่กำลังซ่อม",
    hint: "เริ่มงานได้จากแท็บ “รอดำเนินการ”",
  },
  pending: {
    icon: Clock,
    message: "ไม่มีใบงานที่รอดำเนินการ",
    hint: "งานใหม่จะแสดงที่นี่เมื่อได้รับมอบหมาย",
  },
  review: {
    icon: ClipboardCheck,
    message: "ยังไม่มีใบงานที่รอตรวจสอบ",
    hint: "เมื่อบันทึกผลการทำงานแล้ว ใบงานจะมารอวิศวกรอนุมัติที่นี่",
  },
  completed: {
    icon: CheckSquare,
    message: "ไม่พบใบงานที่ปิดแล้วในเดือนนี้",
    hint: "ลองเลือกเดือนอื่น หรือดู “ทุกเดือน” เพื่อดูใบงานที่ปิดแล้วทั้งหมด",
  },
};

export const MyWorkOrdersView: React.FC<MyWorkOrdersViewProps> = ({
  currentUserRole,
  currentAssigneeKey,
  currentUserName,
  activeMachine,
  machines = [],
  onSelectMachine,
  myWorkOrderStats = null,
  onUpdateWorkOrder,
  onDeleteWorkOrder,
  spareParts = [],
  technicians = [],
  currentUser = null,
  onAskAI,
  onStockChanged,
}) => {
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  // "" หมายถึง "ทุกเดือน" — ใช้เฉพาะเมื่อ activeFilter === "completed"
  const [closedMonth, setClosedMonth] = useState<string>(MONTH_OPTIONS[0]?.value ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onlyActiveMachine, setOnlyActiveMachine] = useState(false);
  const [editingWO, setEditingWO] = useState<WorkOrder | null>(null);
  const [deletingWO, setDeletingWO] = useState<WorkOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // สิทธิ์แก้ไข/ลบ: engineer/supervisor แก้ไข/ลบได้ทุกใบงาน, technician
  // แก้ไข/ลบได้เฉพาะใบงานที่ตัวเองเป็นผู้รับผิดชอบหรือผู้ขอ (จับคู่ด้วย
  // currentAssigneeKey เพราะ view นี้ไม่มี currentUser.id เป็น prop เดิม —
  // ใช้ prop `currentUser` ใหม่ถ้ามี ไม่งั้น fallback ไปที่ currentAssigneeKey)
  const canMutate = (wo: WorkOrder) =>
    currentUserRole === "engineer" ||
    currentUserRole === "supervisor" ||
    (!!(currentUser?.id ?? currentAssigneeKey) &&
      (wo.assignedTo === (currentUser?.id ?? currentAssigneeKey) ||
        wo.requestedBy === (currentUser?.id ?? currentAssigneeKey)));

  const canDelete = (wo: WorkOrder) =>
    canMutate(wo) && !(currentUserRole === "technician" && wo.status === "completed");

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // เดิมหน้านี้รับ workOrders ทั้งอาเรย์ที่แชร์กับหน้าอื่นมาโดยไม่ได้กรองตาม
  // ผู้ใช้เลย (แสดงใบงานของทุกคนปนกัน) — ทั้งผิดเจตนา ("ใบงานของฉัน") และยิ่ง
  // แย่ลงเมื่ออาเรย์นั้นถูกจำกัดเหลือ ~100 แถวจาก 8,589 แถวจริง ช่างที่มีใบงาน
  // อยู่นอกหน้าแรกจะไม่เห็นงานของตัวเองเลย จึงดึงจาก server เฉพาะใบงานของ
  // ผู้ใช้คนนี้ด้วย ?assignedTo= แทน ครอบคลุมทั้ง 8,589 แถว ไม่ใช่แค่หน้าตัวอย่าง
  const [offset, setOffset] = useState(0);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // เดิม tab (ทั้งหมด/เลยกำหนด/กำลังซ่อม/รอดำเนินการ/รอวิศวกรอนุมัติ) กรอง
  // client-side ทับเฉพาะหน้าที่โหลดมาแล้ว (PAGE_SIZE = 200) — ช่างที่มีใบงาน
  // เกิน 200 ใบจะเห็นบางแท็บว่างเปล่าทั้งที่มีงานค้างอยู่จริง (แค่ไม่อยู่ใน 200
  // แถวแรก) จึงต้องส่งแท็บที่เลือกไปเป็นตัวกรองฝั่ง server (status/overdue) แทน
  // และรีเซ็ต offset กลับหน้าแรกทุกครั้งที่เปลี่ยนแท็บ เช่นเดียวกับตอนเปลี่ยนผู้ใช้
  useEffect(() => {
    setOffset(0);
  }, [currentAssigneeKey, activeFilter, closedMonth]);

  // แท็บ "ปิดงานแล้ว" ใช้หน้าเล็กกว่า (CLOSED_PAGE_SIZE) เพราะสะสมงานเก่าไว้
  // มาก การเทหน้าทั้งหมดแบบแท็บอื่น (PAGE_SIZE = 200) จะรกหน้าจอโดยไม่จำเป็น
  const effectivePageSize = activeFilter === "completed" ? CLOSED_PAGE_SIZE : PAGE_SIZE;

  const fetchPage = useCallback(() => {
    if (!currentAssigneeKey) {
      setWorkOrders([]);
      setTotal(0);
      setIsLoading(false);
      return () => {};
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const tabQuery = TAB_QUERY[activeFilter] ?? {};
    const dateRange = activeFilter === "completed" ? monthRange(closedMonth) : {};
    getWorkOrders({
      assignedTo: currentAssigneeKey,
      limit: effectivePageSize,
      offset,
      ...tabQuery,
      ...dateRange,
    })
      .then((res) => {
        if (cancelled) return;
        setWorkOrders(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(toUserMessage(err, "ไม่สามารถโหลดใบงานของคุณได้"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentAssigneeKey, offset, activeFilter, closedMonth, effectivePageSize]);

  useEffect(() => fetchPage(), [fetchPage]);

  const handleModalUpdate = async (updatedWO: WorkOrder) => {
    // onUpdateWorkOrder is App.tsx's handleUpdateWorkOrder, which already
    // calls refreshWorkOrderStats() — that keeps the myWorkOrderStats prop
    // (passed down from App.tsx) in sync, so the tab counts below update
    // without this view fetching its own copy.
    await onUpdateWorkOrder(updatedWO);
    // สถานะที่เปลี่ยน (เช่น กำลังซ่อม -> รอวิศวกรอนุมัติ) ต้องย้ายแท็บ/หายไปจริง
    fetchPage();
  };

  // wo.machineCode is `string | undefined` and activeMachine.code is `string | null`
  // — under strict equality `undefined === null` is already `false`, so a code-less
  // work order cannot accidentally match a code-less machine today. The explicit
  // `Boolean(activeMachine.code)` guard below makes that safety a visible
  // invariant rather than an accident of the two types never lining up.
  //
  // Kept client-side (not pushed into `?machineCode=` on the server query)
  // deliberately: a work order identifies "its" machine two different ways —
  // imported rows via `machine_code` (machine_id is null for all 8,589 of
  // them), manually-created ones via `machine_id`. The server filter can only
  // do a plain `.eq("machine_code", ...)`, which would silently drop any
  // manually-created order matched here only by `machineId`. That's a
  // behaviour change this task's scope doesn't call for, so machine scoping
  // stays a client-side filter — now applied on top of an already
  // server-scoped (by tab) page, instead of on top of an arbitrary 200-row
  // slice like before.
  const belongsToActiveMachine = (wo: WorkOrder) =>
    !!activeMachine &&
    (wo.machineId === activeMachine.id ||
      (Boolean(activeMachine.code) && wo.machineCode === activeMachine.code));

  const machineScoped = useMemo(
    () =>
      onlyActiveMachine && activeMachine
        ? workOrders.filter(belongsToActiveMachine)
        : workOrders,
    [workOrders, onlyActiveMachine, activeMachine]
  );

  const hiddenByMachineFilter = workOrders.length - machineScoped.length;

  // เลยกำหนด: ตัวเลขบนแท็บมาจาก myWorkOrderStats.overdue (prop จาก App.tsx,
  // scope เดียวกับ badge) ไม่ใช่นับจาก workOrders ที่โหลดมาเฉพาะหน้านี้ —
  // ไม่งั้นตัวเลขจะไม่ตรงกับ badge อีกครั้งเมื่อช่างมีใบงานเกิน PAGE_SIZE
  const overdueCount = myWorkOrderStats?.overdue ?? 0;

  // เรียงตามความเร่งด่วนเท่านั้น — การกรองตามแท็บ (status/overdue) ทำที่ server
  // แล้วใน fetchPage ข้างต้น ไม่ต้องกรองซ้ำที่นี่
  const filteredOrders = useMemo(
    () => machineScoped.slice().sort((a, b) => compareByUrgency(a, b)),
    [machineScoped]
  );

  const handleOpenDetailModal = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setIsModalOpen(true);
  };

  // Roving tabindex: one stop for the whole group, arrows move between tabs.
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = FILTER_TABS.length - 1;
    let next: number | null = null;

    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;

    if (next === null) return;
    e.preventDefault();
    setActiveFilter(FILTER_TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const emptyState = EMPTY_STATES[activeFilter] || EMPTY_STATES.all;
  const EmptyIcon = emptyState.icon;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Filters — the page title itself lives in the top bar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-hairline">
        {machines.length > 0 && (
          <div className="max-w-md">
            <MachineSelect
              machines={machines}
              activeMachine={onlyActiveMachine ? (activeMachine ?? null) : null}
              onSelectMachine={(m) => {
                onSelectMachine?.(m);
                setOnlyActiveMachine(true);
                setOffset(0);
              }}
              label="กรองตามเครื่องจักร"
            />
          </div>
        )}

        <div
          role="tablist"
          aria-label="กรองใบงานตามสถานะ"
          className="flex flex-wrap items-center gap-1 bg-parchment p-1 rounded-full self-start"
        >
          {FILTER_TABS.map((tab, index) => {
            const isActive = activeFilter === tab.id;
            const count = tab.id === "overdue" ? overdueCount : null;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                id={`wo-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="wo-tabpanel"
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                onClick={() => setActiveFilter(tab.id)}
                className={`min-h-11 px-4 py-2 rounded-full text-[13px] inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 ${
                  isActive
                    ? "bg-white text-ink font-semibold"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5.5 px-1.5 h-5.5 rounded-full bg-rose-100 text-rose-900 text-xs font-semibold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeFilter === "completed" && (
          <div className="flex items-center gap-2">
            <label htmlFor="closed-month-filter" className="text-[13px] text-ink-muted">
              เดือนที่ปิดงาน
            </label>
            <select
              id="closed-month-filter"
              value={closedMonth}
              onChange={(e) => setClosedMonth(e.target.value)}
              className="appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-8 py-2 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
            >
              <option value="">ทุกเดือน</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeMachine && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={onlyActiveMachine}
              onClick={() => {
                setOnlyActiveMachine((v) => !v);
                setOffset(0);
              }}
              className={`min-h-11 px-4 py-2 rounded-full text-[13px] font-semibold inline-flex items-center gap-2 border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 ${
                onlyActiveMachine
                  ? "bg-primary/10 border-primary/30 text-ink"
                  : "bg-white border-hairline text-ink-muted hover:border-primary/40"
              }`}
            >
              <Cpu className="w-4 h-4 text-primary shrink-0" />
              <span>เฉพาะเครื่อง {activeMachine.code}</span>
              {onlyActiveMachine && <X className="w-4 h-4 shrink-0" />}
            </button>

            {onlyActiveMachine && hiddenByMachineFilter > 0 && (
              <span className="text-xs text-ink-muted">
                ซ่อนใบงานของเครื่องอื่นอยู่ {hiddenByMachineFilter} ใบงาน (เฉพาะหน้านี้)
              </span>
            )}
          </div>
        )}
      </div>

      {loadError && (
        <div className="bg-rose-50 border border-rose-200 rounded-[18px] p-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">{loadError}</p>
        </div>
      )}

      <div id="wo-tabpanel" role="tabpanel" aria-labelledby={`wo-tab-${activeFilter}`}>
        {/* Loading state — only while there is nothing on screen yet, so a
            background refetch (e.g. after saving progress) doesn't flash. */}
        {isLoading && workOrders.length === 0 && !loadError ? (
          <SkeletonCardGrid count={6} />
        ) : (
          <>
            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-[18px] border border-hairline p-10 flex flex-col items-center text-center space-y-3">
                <div className="p-4 rounded-full bg-parchment text-ink-muted">
                  <EmptyIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-ink">
                  {onlyActiveMachine && activeMachine
                    ? `ไม่มีใบงานของเครื่อง ${activeMachine.code} ในมุมมองนี้`
                    : emptyState.message}
                </p>
                <p className="text-xs text-ink-muted max-w-sm">
                  {onlyActiveMachine && activeMachine
                    ? "ปิดตัวกรองเฉพาะเครื่องเพื่อดูใบงานทั้งหมด"
                    : emptyState.hint}
                </p>
              </div>
            )}

            {/* Work Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((wo) => {
            const isInProgress = wo.status === "in_progress";
            const due = dueState(wo);

            return (
              <div
                key={wo.id}
                className={`rounded-[18px] border p-5 hover:border-primary/40 transition-colors flex flex-col justify-between space-y-4 ${overdueCardClass(due)}`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-mono font-semibold text-ink-muted">
                      {wo.code}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <span className={priorityPillClass(wo.priority)}>
                        {priorityLabel(wo.priority)}
                      </span>
                      <span className={woStatusPillClass(wo.status)}>
                        {woStatusLabel(wo.status)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-ink text-base leading-snug">
                    {wo.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className={duePillClass(due)}>
                      {due === "overdue" && (
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      )}
                      {dueLabel(wo)}
                    </span>
                    <span className="text-[13px] text-ink-muted inline-flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{wo.machineName}</span>
                    </span>
                  </div>

                  <p className="text-[13px] text-ink-muted line-clamp-2 mt-2 bg-parchment/80 p-2.5 rounded-[11px]">
                    {wo.description}
                  </p>
                </div>

                {/* Progress & Actions */}
                <div className="pt-3 border-t border-divider space-y-3">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      ความคืบหน้า: {wo.stepsCompleted}/{wo.totalSteps} ขั้นตอน
                    </span>
                    {due !== "overdue" && wo.dueDate && (
                      <span className="tabular-nums">กำหนดเสร็จ {wo.dueDate}</span>
                    )}
                  </div>

                  <div className="w-full bg-divider rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${((wo.stepsCompleted || 0) / (wo.totalSteps || 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    {isInProgress ? (
                      <button
                        onClick={() => handleOpenDetailModal(wo)}
                        className="flex-1 min-h-11 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>บันทึกผลการทำงาน</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenDetailModal(wo)}
                        className="flex-1 min-h-11 py-2.5 rounded-[11px] bg-pearl hover:bg-parchment text-ink-muted text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 border border-divider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        <Eye className="w-4 h-4 text-primary" />
                        <span>ดูรายละเอียด</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onAskAI(
                          `ขอขั้นตอนและข้อควรระวังสำหรับใบงาน: ${wo.title} (${wo.machineName})`
                        )
                      }
                      aria-label={`ถามผู้ช่วย AI เกี่ยวกับใบงาน ${wo.code}`}
                      className="w-11 h-11 shrink-0 rounded-[11px] bg-pearl hover:bg-parchment text-ink-muted cursor-pointer transition-colors border border-divider flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      title="ถามผู้ช่วย AI สำหรับงานนี้"
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                    </button>

                    {canMutate(wo) && (
                      <button
                        onClick={() => setEditingWO(wo)}
                        aria-label={`แก้ไขใบงาน ${wo.code}`}
                        className="min-h-11 px-3 shrink-0 rounded-[11px] bg-pearl hover:bg-parchment text-ink-muted text-[13px] font-semibold cursor-pointer transition-colors border border-divider flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                        title="แก้ไข"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                        <span>แก้ไข</span>
                      </button>
                    )}

                    {onDeleteWorkOrder && canDelete(wo) && (
                      <button
                        onClick={() => setDeletingWO(wo)}
                        aria-label={`ลบใบงาน ${wo.code}`}
                        className="min-h-11 px-3 shrink-0 rounded-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 text-[13px] font-semibold cursor-pointer transition-colors border border-rose-200 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ลบ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </>
        )}
      </div>

      {/* แบ่งหน้า — ใบงานของช่างคนเดียวปกติไม่ควรเกินหน้าเดียว แต่กันเผื่อไว้
          `total` มาจาก server แบบไม่รู้จักเครื่องจักร (นับทุกเครื่องในแท็บนี้)
          ส่วนตัวกรอง "เฉพาะเครื่อง" ทำงานที่ client (ดู belongsToActiveMachine
          ด้านบนว่าทำไม) — เมื่อเปิดตัวกรองนี้ ตัวเลข/ปุ่มเปลี่ยนหน้าปกติจะอ้างอิง
          จำนวนที่ยังไม่กรอง ทำให้ผู้ใช้กดไปหน้าถัดไปแล้วอาจไม่เจอใบงานของ
          เครื่องนี้เลยทั้งที่ตัวนับบอกว่ายังมีอีก จึงจำกัด total ที่ส่งให้
          Pagination ไว้ที่ขอบเขตของหน้าที่โหลดมาแล้วเมื่อเปิดตัวกรองนี้ —
          ปุ่ม "ถัดไป" จะถูกปิดแทนที่จะโฆษณาหน้าที่กรองแล้วอาจว่างเปล่า */}
      {total > 0 && (
        <div className="space-y-1.5">
          {onlyActiveMachine && activeMachine && (
            <p className="text-xs text-ink-muted">
              ตัวเลขนับและปุ่มเปลี่ยนหน้าด้านล่างนับรวมใบงานทุกเครื่องจักรในแท็บนี้
              ไม่ใช่เฉพาะเครื่อง {activeMachine.code} — ปิดตัวกรอง "เฉพาะเครื่อง" เพื่อดูจำนวน/หน้าถัดไปของเครื่องอื่น
            </p>
          )}
          <Pagination
            offset={offset}
            limit={effectivePageSize}
            total={onlyActiveMachine && activeMachine ? Math.min(total, offset + workOrders.length) : total}
            onOffsetChange={setOffset}
            isLoading={isLoading}
            itemLabel="ใบงาน"
          />
        </div>
      )}

      {/* Work Order Detail Modal */}
      <WorkOrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workOrder={selectedWO}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        currentUserId={currentUser?.id}
        onUpdateWorkOrder={handleModalUpdate}
        onDeleteWorkOrder={onDeleteWorkOrder}
        canDelete={selectedWO ? canDelete(selectedWO) : false}
        onAskAI={onAskAI}
        onStockChanged={onStockChanged}
      />

      {/* Edit Work Order Modal */}
      {editingWO && (
        <EditWorkOrderModal
          isOpen={!!editingWO}
          workOrder={editingWO}
          onClose={() => setEditingWO(null)}
          onSubmit={async (id, draft) => {
            try {
              await onUpdateWorkOrder({ id, ...draft } as WorkOrder);
              setEditingWO(null);
              fetchPage();
            } catch (err) {
              await notifyFailed(
                "แก้ไขใบงานไม่สำเร็จ",
                toUserMessage(err, "ไม่สามารถบันทึกการแก้ไขใบงานนี้ได้ กรุณาลองอีกครั้ง")
              );
            }
          }}
          machines={machines}
          spareParts={spareParts}
          technicians={technicians}
          currentUser={currentUser ?? null}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="bg-white rounded-[18px] border border-hairline p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-semibold text-ink">ยืนยันการลบใบงาน</h3>
            <p className="text-sm text-ink-muted">
              ใบงาน {deletingWO.code} — {deletingWO.title}
              <br />
              การลบไม่สามารถย้อนกลับได้
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingWO(null)}
                disabled={isDeleting}
                className="min-h-11 px-4 rounded-full bg-pearl hover:bg-parchment text-ink-muted text-[13px] font-semibold cursor-pointer transition-colors border border-divider disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                onClick={async () => {
                  if (!onDeleteWorkOrder || !deletingWO) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteWorkOrder(deletingWO.id);
                    setDeletingWO(null);
                    fetchPage();
                  } catch (err) {
                    await notifyFailed(
                      "ลบใบงานไม่สำเร็จ",
                      toUserMessage(err, "ไม่สามารถลบใบงานนี้ได้ กรุณาลองอีกครั้ง")
                    );
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="min-h-11 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>ลบ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
