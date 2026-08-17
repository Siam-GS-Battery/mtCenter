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
} from "lucide-react";
import { Machine, WorkOrder, UserRole } from "../../types";
import { WorkOrderDetailModal } from "../WorkOrderDetailModal";
import { MachineSelect } from "../MachineSelect";
import {
  woStatusLabel,
  woStatusPillClass,
  priorityLabel,
  priorityPillClass,
} from "../../lib/pillStyles";
import {
  compareByUrgency,
  countOverdue,
  dueLabel,
  duePillClass,
  dueState,
  isOverdue,
  overdueCardClass,
} from "../../lib/workOrderStatus";
import { getWorkOrders, toUserMessage } from "../../services/apiService";
import { Pagination } from "../ui/Pagination";

interface MyWorkOrdersViewProps {
  currentUserRole?: UserRole;
  /**
   * ชื่อผู้ใช้ปัจจุบัน — ใช้ประทับชื่อผู้เพิ่มขั้นตอนในใบงาน และใช้กรองใบงาน
   * "ของฉัน" จาก server ด้วย ?assignedTo= (work_orders.assigned_to เก็บเป็น
   * ชื่อ ไม่ใช่ user id — ดู WorkOrderForm/App.tsx ตอนสร้างใบงาน)
   */
  currentUserName?: string;
  /** เครื่องจักรที่กำลังทำงานอยู่ (จาก TopBar) — เปิดใช้ตัวกรองเฉพาะเครื่องนี้ */
  activeMachine?: Machine;
  /** รายการเครื่องจักรทั้งหมด — ใช้กับดรอปดาวน์เลือกเครื่องจักร */
  machines?: Machine[];
  /** เปลี่ยนเครื่องจักรที่กำลังใช้งาน (sync กับ TopBar/หน้าหลัก) */
  onSelectMachine?: (machine: Machine) => void;
  onUpdateWorkOrder: (updatedWO: WorkOrder) => Promise<void>;
  onAskAI: (prompt: string) => void;
}

// ใบงานของช่างคนเดียวไม่ควรมีจำนวนมากเท่าใบงานทั้งระบบ แต่กันเผื่อไว้ด้วยการแบ่งหน้า
const PAGE_SIZE = 200;

const FILTER_TABS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "overdue", label: "เลยกำหนด" },
  { id: "in_progress", label: "กำลังซ่อม" },
  { id: "pending", label: "รอดำเนินการ" },
  { id: "review", label: "รอวิศวกรอนุมัติ" },
] as const;

const EMPTY_STATES: Record<
  string,
  { icon: React.ElementType; message: string; hint: string }
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
};

export const MyWorkOrdersView: React.FC<MyWorkOrdersViewProps> = ({
  currentUserRole = "technician",
  currentUserName,
  activeMachine,
  machines = [],
  onSelectMachine,
  onUpdateWorkOrder,
  onAskAI,
}) => {
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onlyActiveMachine, setOnlyActiveMachine] = useState(false);

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

  useEffect(() => {
    setOffset(0);
  }, [currentUserName]);

  const fetchPage = useCallback(() => {
    if (!currentUserName) {
      setWorkOrders([]);
      setTotal(0);
      setIsLoading(false);
      return () => {};
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getWorkOrders({ assignedTo: currentUserName, limit: PAGE_SIZE, offset })
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
  }, [currentUserName, offset]);

  useEffect(() => fetchPage(), [fetchPage]);

  const handleModalUpdate = async (updatedWO: WorkOrder) => {
    await onUpdateWorkOrder(updatedWO);
    // สถานะที่เปลี่ยน (เช่น กำลังซ่อม -> รอวิศวกรอนุมัติ) ต้องย้ายแท็บ/หายไปจริง
    fetchPage();
  };

  // wo.machineCode is `string | undefined` and activeMachine.code is `string | null`
  // — under strict equality `undefined === null` is already `false`, so a code-less
  // work order cannot accidentally match a code-less machine today. The explicit
  // `Boolean(activeMachine.code)` guard below makes that safety a visible
  // invariant rather than an accident of the two types never lining up.
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
  const overdueCount = useMemo(() => countOverdue(machineScoped), [machineScoped]);

  const filteredOrders = useMemo(
    () =>
      machineScoped
        .filter((wo) => {
          if (activeFilter === "all") return true;
          if (activeFilter === "overdue") return isOverdue(wo);
          return wo.status === activeFilter;
        })
        .slice()
        .sort((a, b) => compareByUrgency(a, b)),
    [machineScoped, activeFilter]
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
                ซ่อนใบงานของเครื่องอื่นอยู่ {hiddenByMachineFilter} ใบงาน
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
          <div className="bg-white rounded-[18px] border border-hairline p-10 flex flex-col items-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-ink-muted">กำลังโหลดใบงานของคุณ...</p>
          </div>
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
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </>
        )}
      </div>

      {/* แบ่งหน้า — ใบงานของช่างคนเดียวปกติไม่ควรเกินหน้าเดียว แต่กันเผื่อไว้ */}
      {total > 0 && (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={total}
          onOffsetChange={setOffset}
          isLoading={isLoading}
          itemLabel="ใบงาน"
        />
      )}

      {/* Work Order Detail Modal */}
      <WorkOrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workOrder={selectedWO}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        onUpdateWorkOrder={handleModalUpdate}
        onAskAI={onAskAI}
      />
    </div>
  );
};
