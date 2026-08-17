import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Bell,
  AlertTriangle,
  AlertOctagon,
  CalendarClock,
  ClipboardCheck,
} from "lucide-react";
import { Machine, WorkOrder } from "../types";
import { evaluateMachine } from "../lib/thresholds";
import {
  machineStatusChipClass,
  machineStatusDotClass,
  machineStatusLabel,
  machineStatusTextClass,
} from "../lib/pillStyles";
import { NO_DATA } from "../lib/format";

/** Where a notification sends the user when it is activated. */
export interface NotificationTarget {
  tab: string;
  machineId?: string;
  workOrderCode?: string;
}

interface TopBarProps {
  pageTitle: string;
  activeMachine: Machine;
  /** @deprecated เครื่องจักรถูกเลือกจากแท็บหลักของช่างแล้ว TopBar ใช้เป็นตัวบ่งชี้เท่านั้น */
  allMachines?: Machine[];
  onSelectMachine: (machine: Machine) => void;
  onOpenMobileSidebar: () => void;
  /** ใบงานจริงทั้งหมด — ใช้หาใบงานเกินกำหนดและใบงานรอตรวจสอบ */
  workOrders?: WorkOrder[];
  /** เปิดหน้าที่เกี่ยวข้องกับรายการแจ้งเตือน */
  onNavigate?: (target: NotificationTarget) => void;
}

type AlertKind = "machine-error" | "machine-warning" | "overdue" | "review";

interface DerivedAlert {
  id: string;
  kind: AlertKind;
  title: string;
  detail: string;
  machine?: Machine;
  target?: NotificationTarget;
}

const ALERT_ICONS: Record<AlertKind, React.ComponentType<{ className?: string }>> = {
  "machine-error": AlertOctagon,
  overdue: CalendarClock,
  review: ClipboardCheck,
  "machine-warning": AlertTriangle,
};

const ALERT_ICON_COLORS: Record<AlertKind, string> = {
  "machine-error": "text-rose-600",
  overdue: "text-rose-600",
  review: "text-purple-600",
  "machine-warning": "text-amber-700",
};

/** วันที่วันนี้แบบตัดเวลาออก ใช้เทียบกับ dueDate รูปแบบ YYYY-MM-DD */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysOverdue(dueDate: string, today: Date): number | null {
  const parsed = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const diff = Math.floor((today.getTime() - parsed.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

/**
 * รายการแจ้งเตือนทั้งหมดมาจากข้อมูลจริงเท่านั้น
 * (สถานะเครื่องที่ประเมินจากค่าเซนเซอร์ + ใบงานที่เกินกำหนด + ใบงานที่รอตรวจสอบ)
 * เรียงตามความรุนแรง: เครื่องขัดข้อง → ใบงานเกินกำหนด → ใบงานรอตรวจสอบ → เครื่องที่ต้องเฝ้าระวัง
 */
function deriveAlerts(machines: Machine[], workOrders: WorkOrder[]): DerivedAlert[] {
  const today = startOfToday();

  const machineErrors: DerivedAlert[] = [];
  const machineWarnings: DerivedAlert[] = [];

  machines.forEach((m) => {
    const { status, reasons } = evaluateMachine(m);
    if (status !== "error" && status !== "warning") return;
    const alert: DerivedAlert = {
      id: `machine-${m.id}`,
      kind: status === "error" ? "machine-error" : "machine-warning",
      title: `${m.code ?? NO_DATA} ${machineStatusLabel(status)}`,
      detail: reasons[0] ?? m.name,
      machine: m,
      target: { tab: "scan", machineId: m.id },
    };
    if (status === "error") machineErrors.push(alert);
    else machineWarnings.push(alert);
  });

  const overdue: DerivedAlert[] = [];
  const review: DerivedAlert[] = [];

  workOrders.forEach((wo) => {
    if (wo.status === "review") {
      review.push({
        id: `review-${wo.id}`,
        kind: "review",
        title: `${wo.code} รอตรวจสอบอนุมัติ`,
        detail: `${wo.title} · ${wo.machineName}`,
        target: { tab: "review", workOrderCode: wo.code },
      });
      return;
    }
    if (wo.status === "completed") return;
    const late = daysOverdue(wo.dueDate, today);
    if (late === null) return;
    overdue.push({
      id: `overdue-${wo.id}`,
      kind: "overdue",
      title: `${wo.code} เกินกำหนด ${late} วัน`,
      detail: `${wo.title} · ครบกำหนด ${wo.dueDate}`,
      target: { tab: "all_work_orders", workOrderCode: wo.code },
    });
  });

  overdue.sort((a, b) => b.title.localeCompare(a.title));

  return [...machineErrors, ...overdue, ...review, ...machineWarnings];
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  activeMachine,
  allMachines,
  onSelectMachine,
  onOpenMobileSidebar,
  workOrders,
  onNavigate,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close the notifications dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const alerts = useMemo(
    () => deriveAlerts(allMachines ?? [], workOrders ?? []),
    [allMachines, workOrders]
  );

  const handleAlertActivate = (alert: DerivedAlert) => {
    if (alert.machine) onSelectMachine(alert.machine);
    if (alert.target) onNavigate?.(alert.target);
    setIsNotificationsOpen(false);
  };

  /** แถวที่กดแล้วไม่เกิดอะไรขึ้นจะไม่ทำเป็นปุ่ม */
  const isActionable = (alert: DerivedAlert) =>
    Boolean(alert.machine) || (Boolean(alert.target) && Boolean(onNavigate));

  return (
    <header className="h-14 bg-parchment/80 backdrop-blur-xl border-b border-hairline flex items-center justify-between px-2.5 sm:px-4 md:px-6 shrink-0 sticky top-0 z-30 select-none w-full max-w-full">
      {/* Left side: Hamburger (Mobile) + Current Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger icon (mobile < 1024px only) */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden min-w-11 min-h-11 -ml-1.5 flex items-center justify-center rounded-lg text-ink-muted hover:bg-parchment active:scale-95 transition-all cursor-pointer shrink-0"
          title="เปิดเมนูด้านข้าง"
          id="mobile-hamburger-btn"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm sm:text-base md:text-lg font-semibold text-ink tracking-[-0.01em] truncate max-w-[120px] min-[420px]:max-w-[160px] sm:max-w-[240px] md:max-w-none">
          {pageTitle}
        </h1>
      </div>

      {/* Right side: Machine Status Chip + Notification Bell */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Machine Status Chip — read-only indicator of the active machine.
            Selection now happens from the technician's main tab. */}
        <div
          className={`flex items-center px-3 min-h-11 rounded-full border select-none ${machineStatusChipClass(activeMachine.status)}`}
          id="machine-switcher-chip"
          title={`เครื่องจักรที่กำลังตรวจสอบ: ${activeMachine.code ?? NO_DATA} ${activeMachine.name}`}
          aria-label={`เครื่องจักรที่กำลังตรวจสอบ: ${activeMachine.code ?? NO_DATA} ${activeMachine.name}`}
        >
          <span className={`${machineStatusDotClass(activeMachine.status)} mr-1.5`} />
          <span
            className={`text-xs sm:text-sm font-semibold truncate max-w-[90px] min-[420px]:max-w-[120px] sm:max-w-[200px] mr-1 ${machineStatusTextClass(activeMachine.status)}`}
          >
            {activeMachine.code ?? NO_DATA}
            <span className="hidden sm:inline"> · {activeMachine.name}</span>
          </span>
        </div>

        {/* Notification Bell — count and rows come from live machine and work-order data */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="min-w-11 min-h-11 flex items-center justify-center rounded-full bg-chip-translucent/60 hover:bg-chip-translucent active:scale-95 transition-all text-ink cursor-pointer relative"
            aria-label={
              alerts.length > 0
                ? `รายการที่ต้องดำเนินการ ${alerts.length} รายการ`
                : "รายการที่ต้องดำเนินการ"
            }
            aria-expanded={isNotificationsOpen}
            title="รายการที่ต้องดำเนินการ"
            id="notification-bell-btn"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] bg-white rounded-[18px] shadow-2xl border border-hairline py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-divider">
                <span className="text-sm font-semibold text-ink">
                  รายการที่ต้องดำเนินการ
                </span>
              </div>

              {alerts.length === 0 ? (
                <p className="px-3 py-6 text-sm text-ink-faint text-center">
                  ไม่มีรายการที่ต้องดำเนินการ
                </p>
              ) : (
                <div className="divide-y divide-divider max-h-72 overflow-y-auto">
                  {alerts.map((alert) => {
                    const Icon = ALERT_ICONS[alert.kind];
                    const iconColor = ALERT_ICON_COLORS[alert.kind];
                    const body = (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink font-semibold leading-snug">
                            {alert.title}
                          </p>
                          <span className="text-xs text-ink-faint mt-0.5 block">
                            {alert.detail}
                          </span>
                        </div>
                      </>
                    );

                    return isActionable(alert) ? (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => handleAlertActivate(alert)}
                        className="w-full text-left p-3 min-h-11 hover:bg-parchment transition-colors flex items-start gap-2.5 cursor-pointer"
                      >
                        {body}
                      </button>
                    ) : (
                      <div
                        key={alert.id}
                        className="p-3 flex items-start gap-2.5"
                      >
                        {body}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
