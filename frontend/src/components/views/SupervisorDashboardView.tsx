import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  FileText,
  History,
  Cpu,
  MapPin,
  X,
  Loader2,
  CalendarClock,
  LayoutGrid,
  Boxes,
  Gauge,
  Timer,
  Zap,
  Droplet,
  Wind,
  ArrowUp,
  ArrowDown,
  BookOpen,
  ExternalLink,
  FileCode,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "./ManualsView";
import { MANUAL_CATEGORIES } from "../../lib/manualCategories";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Machine, WorkOrder, MachineStats, WorkOrderStats, UserProfile, ManualDoc } from "../../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { SkeletonCardGrid, SkeletonList } from "../ui/Skeleton";
import { MachineSelect } from "../MachineSelect";
import { TelemetryTrendCard } from "./TelemetryTrendCard";
import { MachineMetricsChart } from "./MachineMetricsChart";
import LiveFloorView from "./liveFloor/LiveFloorView";
import {
  getMachines,
  getWorkOrders,
  getWorkOrderStatsByMachine,
  getManuals,
  getManualFileUrl,
  getManualContent,
  toUserMessage,
  type MachineWorkOrderStats,
  type MachineWorkOrderStatsMap,
} from "../../services/apiService";
import { getMachineMetricsMock } from "../../lib/machineMetricsMock";
import {
  machineStatusLabel,
  machineStatusBadgeClass,
} from "../../lib/pillStyles";
import { workOrderDisplayDate } from "../../lib/workOrderStatus";
import { computeReadyRate, deriveMachineCounts } from "../../lib/machineAvailability";
import {
  SPINDLE_TEMP_WARNING,
  VIBRATION_WARNING,
  HEALTH_SCORE_WARNING,
  HEALTH_SCORE_ERROR,
  spindleTempLevel,
  vibrationLevel,
  healthScoreLevel,
  readingAvailability,
  evaluateMachine,
  type ReadingAvailability,
} from "../../lib/thresholds";
import {
  NO_DATA,
  NO_REPAIR_HISTORY_TH,
  isMissing,
  orDash,
  formatDate,
  formatNumber,
  formatWithUnit,
  isOverdueDate,
  overdueLabel,
} from "../../lib/format";

// จำนวนรายการประวัติซ่อมต่อหน้า (ต่อเครื่อง)
const MACHINE_HISTORY_PAGE_SIZE = 50;

/**
 * Tailwind needs whole class names — no template literals for column counts.
 * The grid now holds 3 always-on cells (กลุ่มโรงงาน/แผนก-หน่วยงาน/สุขภาพเครื่อง)
 * plus up to 3 sensor cells (spindleTemp/vibrationMms/operatingHours, gated on
 * `fleetReadings`) plus up to 3 work-order stat cells (ใบซ่อมค้าง/เวลาสูญเสีย
 * รวม/เวลาซ่อมเฉลี่ย, always on once the per-machine fetch resolves) — so every
 * count from 1 to 9 is reachable and needs a real class. The outer card grid
 * (see `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2` below) never exceeds
 * 2 columns, so each card stays roughly half the viewport width no matter how
 * wide the screen gets. Widening the metric grid past 3 columns on a fixed
 * ~half-viewport card only shrinks the cells further, so we cap at 3 columns
 * and let extra cells wrap into more rows instead.
 */
const METRIC_GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3",
  5: "grid-cols-2 sm:grid-cols-3",
  6: "grid-cols-2 sm:grid-cols-3",
  7: "grid-cols-2 sm:grid-cols-3",
  8: "grid-cols-2 sm:grid-cols-3",
  9: "grid-cols-2 sm:grid-cols-3",
};

/** Same idea for the machine-detail modal, whose card count is 2–5. */
const MODAL_GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
};

/** สีตามเกณฑ์ OEE/องค์ประกอบ (>=85 เขียว, >=60 เหลือง, ต่ำกว่า แดง) — ใช้กับ OEE/Availability/Performance/Quality */
function oeeTextClass(value: number): string {
  if (value >= 85) return "text-emerald-600";
  if (value >= 60) return "text-amber-600";
  return "text-rose-600";
}

function oeeBarClass(value: number): string {
  if (value >= 85) return "bg-emerald-500";
  if (value >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

/**
 * Health score colour.
 *
 * A `null` score means the machine has never been repaired (232 of 973), so it
 * must never borrow the critical ramp — a grey dash is the truth, red would be
 * an accusation. Present scores follow the same emerald/amber/rose ramp as
 * every other condition indicator in the app.
 */
function healthScoreTextClass(healthScore: number | null): string {
  if (healthScore == null) return "text-ink-faint";
  const level = healthScoreLevel(healthScore);
  return level === "error"
    ? "text-rose-600"
    : level === "warning"
      ? "text-amber-700"
      : "text-emerald-700";
}

interface SupervisorDashboardViewProps {
  machines: Machine[];
  workOrders: WorkOrder[];
  /**
   * Aggregate machine counts from GET /api/machines/stats. `machines` is now a
   * paginated list (max 1000 rows) and can no longer be trusted for exact
   * totals — the KPI tiles and the status pie chart read from here instead.
   * `null` while stats are still loading / failed to load, in which case the
   * tiles fall back to the local array so the page doesn't come up blank.
   */
  machineStats: MachineStats | null;
  /** Same idea as `machineStats`, for GET /api/work-orders/stats. */
  workOrderStats: WorkOrderStats | null;
  onAskAI: (prompt: string) => void;
  /**
   * Optional — this view has no work-order detail modal of its own today
   * (the machine-detail modal above only lists repair history rows), so
   * these are accepted purely to satisfy App.tsx's prop contract and are
   * currently unused here. Kept optional so existing callers are unaffected.
   */
  onDeleteWorkOrder?: (id: string) => Promise<void>;
  currentUser?: UserProfile | null;
}

/**
 * `attention` is the combined warning+error filter behind the "เครื่องเตือน/ขัดข้อง"
 * tile. The tile counts both, so filtering to `warning` alone (as it used to)
 * showed fewer machines than the number the supervisor had just clicked on —
 * invisible while every machine was `normal`, wrong the moment the derivation
 * job starts returning `warning`.
 */
type MachineStatusFilter = Machine["status"] | "all" | "attention";

const STATUS_DOT_COLORS: Record<Machine["status"], string> = {
  normal: "#10B981",
  warning: "#F59E0B",
  error: "#F43F5E",
  maintenance: "#3B82F6",
};

interface MachineCardProps {
  machine: Machine;
  fleetReadings: ReadingAvailability;
  metricCellCount: number;
  /** This machine's work-order stats, keyed by `machine.code` — `undefined`
   * while the follow-up fetch is still in flight (or the machine has no
   * code), in which case the three work-order cells fall back to `NO_DATA`
   * rather than blocking the rest of the card. */
  workOrderStats: MachineWorkOrderStats | undefined;
  onSelect: (machine: Machine) => void;
}

/**
 * One registry card. Extracted and memoized so that a filter click or a
 * modal open/close — which changes state on the parent — doesn't force React
 * to re-render every card in a registry that can hold up to 1000 machines;
 * only the cards whose own props actually changed re-render. Visual output is
 * unchanged from the inline version this replaces.
 */
const MachineCard = React.memo(function MachineCard({
  machine: m,
  fleetReadings,
  metricCellCount,
  workOrderStats,
  onSelect,
}: MachineCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(m)}
      className="text-left p-5 rounded-[18px] border border-hairline bg-white hover:border-primary transition-all cursor-pointer group relative overflow-hidden focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    >
      {/* Top Row: Code, Name, Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-[11px] bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-ink text-base leading-tight group-hover:text-primary transition-colors">
              {orDash(m.code)}
            </div>
            <div className="text-xs text-ink-faint font-normal">{m.name}</div>
          </div>
        </div>

        <span className={machineStatusBadgeClass(m.status)}>
          {machineStatusLabel(m.status)}
        </span>
      </div>

      {/* Location & Active Error Alert */}
      <div className="text-xs text-ink-faint mb-3 flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{orDash(m.location)}</span>
      </div>

      {m.activeErrorCode && (
        <div className="mb-3 p-2.5 rounded-[18px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-normal">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="truncate">
            {m.activeErrorCode}: {m.activeErrorDesc}
          </span>
        </div>
      )}

      {/* PM ที่เลยกำหนดมาแล้ว — a past nextMaintenance date is the one
          thing on this card that needs acting on today, so it gets a
          badge of its own instead of sitting in the footer as plain grey
          text indistinguishable from a date next month. */}
      {isOverdueDate(m.nextMaintenance) && (
        <div className="mb-3 p-2.5 rounded-[18px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-normal">
          <CalendarClock className="w-4 h-4 shrink-0 text-amber-700" />
          <span className="truncate">
            PM {overdueLabel(m.nextMaintenance)} (กำหนด {formatDate(m.nextMaintenance)})
          </span>
        </div>
      )}

      {/* Metrics Grid — the plant has no spindle/vibration sensors installed
          (spindleTemp/vibrationMms are null for essentially every machine),
          so the first two cells use registry fields the Excel import
          actually populates for ~99% of rows (factoryGroup/departmentCode)
          instead of showing a permanent "—". Sensor cells still appear
          automatically once real readings exist. */}
      <div
        className={`grid ${METRIC_GRID_COLS[metricCellCount]} gap-2 bg-divider p-3 rounded-[11px] border border-divider text-xs mb-3`}
      >
        <div>
          <span className="text-xs text-ink-faint font-normal block">กลุ่มโรงงาน</span>
          <span className="font-semibold text-ink">{orDash(m.factoryGroup)}</span>
        </div>
        <div>
          <span className="text-xs text-ink-faint font-normal block">แผนก/หน่วยงาน</span>
          <span className="font-semibold text-ink">{orDash(m.departmentCode)}</span>
        </div>
        {fleetReadings.spindleTemp && (
          <div>
            <span className="text-xs text-ink-faint font-normal block">อุณหภูมิ Spindle</span>
            <span
              className={`font-semibold ${
                spindleTempLevel(m.spindleTemp) !== "normal" ? "text-rose-600" : "text-ink"
              }`}
            >
              {isMissing(m.spindleTemp) ? NO_DATA : `${m.spindleTemp}°C`}
            </span>
          </div>
        )}
        {fleetReadings.vibrationMms && (
          <div>
            <span className="text-xs text-ink-faint font-normal block">ความสั่นสะเทือน</span>
            <span
              className={`font-semibold ${
                vibrationLevel(m.vibrationMms) !== "normal" ? "text-rose-600" : "text-ink"
              }`}
            >
              {isMissing(m.vibrationMms) ? NO_DATA : `${m.vibrationMms} mm/s`}
            </span>
          </div>
        )}
        {fleetReadings.operatingHours && (
          <div>
            <span className="text-xs text-ink-faint font-normal block">ชั่วโมงทำงาน</span>
            <span className="font-semibold text-ink">
              {formatWithUnit(m.operatingHours, "ชม.")}
            </span>
          </div>
        )}
        <div>
          <span className="text-xs text-ink-faint font-normal block">คะแนนสุขภาพเครื่อง</span>
          {/* Never blue-on-null: a machine with no repair history has no
              score to show, and that is not a low score. */}
          <span className={`font-semibold ${healthScoreTextClass(m.healthScore)}`}>
            {m.healthScore == null ? NO_REPAIR_HISTORY_TH : `${m.healthScore}%`}
          </span>
        </div>
        {/* Per-machine work-order stats — fetched separately for the current
            registry page (see the follow-up effect below). `workOrderStats`
            is `undefined` on fetch failure or while still loading, and every
            field renders NO_DATA/"—" rather than 0/null in that case, so the
            card never implies "zero repairs" for a machine that simply has
            no data back yet. */}
        <div>
          <span className="text-xs text-ink-faint font-normal block">ใบซ่อมค้าง</span>
          <span className="font-semibold text-ink">
            {formatNumber(workOrderStats?.open)}
          </span>
        </div>
        <div>
          <span className="text-xs text-ink-faint font-normal block">เวลาสูญเสียรวม</span>
          <span className="font-semibold text-ink">
            {formatWithUnit(workOrderStats?.totalMtlossMin, "นาที")}
          </span>
        </div>
        <div>
          <span className="text-xs text-ink-faint font-normal block">เวลาซ่อมเฉลี่ย</span>
          <span className="font-semibold text-ink">
            {formatWithUnit(workOrderStats?.avgRepairDurationMin, "นาที")}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-ink-faint text-xs">
          ซ่อมล่าสุด: {formatDate(m.lastMaintenance)}
        </span>
        <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>ดูรายละเอียดและประวัติ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
});

export const SupervisorDashboardView: React.FC<SupervisorDashboardViewProps> = ({
  machines,
  workOrders,
  machineStats,
  workOrderStats,
  onAskAI,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDeleteWorkOrder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentUser,
}) => {
  // Live Floor 4D is a separate rendering mode for the same data — switching
  // to it swaps out the KPI/graphical/registry sections below for the 3D
  // scene, but the machine-detail modal (driven by `selectedMachine`) stays
  // shared so opening a machine from either mode behaves identically.
  const [viewMode, setViewMode] = useState<"classic" | "floor4d">("classic");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  // Displayed value of the MachineSelect dropdown — deliberately separate from
  // `selectedMachine` (which doubles as "which machine's modal is open").
  // Closing the modal (setSelectedMachine(null)) must not blank the dropdown.
  const [pickedMachine, setPickedMachine] = useState<Machine | null>(null);
  const [statusFilter, setStatusFilter] = useState<MachineStatusFilter>("all");

  // The registry used to render straight off the `machines` prop, itself capped
  // at App.tsx's getMachines({limit:1000}) snapshot — fine only while the fleet
  // stays under 1000 rows. Real server-side paging replaces that hard cap: the
  // grid below fetches its own page directly from GET /api/machines.
  const REGISTRY_PAGE_SIZE = 24;
  const [registryOffset, setRegistryOffset] = useState(0);
  const [registryMachines, setRegistryMachines] = useState<Machine[]>([]);
  const [registryTotal, setRegistryTotal] = useState(0);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState<string | null>(null);

  // เปลี่ยนตัวกรองสถานะ -> กลับไปหน้าแรกของทะเบียนเครื่องจักรเสมอ
  useEffect(() => {
    setRegistryOffset(0);
  }, [statusFilter]);

  // Prefer /api/machines/stats and /api/work-orders/stats for every KPI tile
  // and the pie chart below — `machines`/`workOrders` are now paginated (max
  // 1000 rows each) and no longer guaranteed to hold the whole table (973
  // machines / 8,589 work orders), so counting over those arrays directly
  // would silently under-report once the real dataset exceeds a page. Fall
  // back to the local array only while stats haven't loaded yet (or failed),
  // so the page still shows something rather than going blank.
  // KPI tiles fall back to counting the local (paginated, up to 1000-row)
  // `machines`/`workOrders` arrays when the aggregate stats endpoints haven't
  // loaded yet. Those fallback `.filter()` passes re-scanned every row on
  // every render (each a KPI-tile render, a status-filter click, a modal
  // open/close...); memoizing keeps them to once per actual data change.
  const {
    totalMachines,
    normalMachines,
    warningMachines,
    errorMachines,
    maintenanceMachines,
    readyRate,
    totalWorkOrders,
    completedWorkOrders,
    pendingWorkOrders,
    reviewWorkOrders,
    completionRate,
  } = useMemo(() => {
    const {
      total: totalMachines,
      normal: normalMachines,
      warning: warningMachines,
      error: errorMachines,
      maintenance: maintenanceMachines,
    } = deriveMachineCounts(machines, machineStats);

    const readyRate = computeReadyRate({
      total: totalMachines,
      normal: normalMachines,
      warning: warningMachines,
    });

    const totalWorkOrders = workOrderStats?.total ?? workOrders.length;
    const completedWorkOrders =
      workOrderStats?.byStatus?.completed ?? workOrders.filter((wo) => wo.status === "completed").length;
    const pendingWorkOrders =
      workOrderStats?.byStatus?.pending ?? workOrders.filter((wo) => wo.status === "pending").length;
    const reviewWorkOrders =
      workOrderStats?.byStatus?.review ?? workOrders.filter((wo) => wo.status === "review").length;
    const completionRate =
      totalWorkOrders > 0 ? Math.round((completedWorkOrders / totalWorkOrders) * 100) : null;

    return {
      totalMachines,
      normalMachines,
      warningMachines,
      errorMachines,
      maintenanceMachines,
      readyRate,
      totalWorkOrders,
      completedWorkOrders,
      pendingWorkOrders,
      reviewWorkOrders,
      completionRate,
    };
  }, [machines, workOrders, machineStats, workOrderStats]);

  // แถวทะเบียนเครื่องจักร — ดึงเองแยกจาก `machines` prop เพื่อไม่ให้ถูกจำกัดที่
  // 1000 แถวจาก App.tsx อีกต่อไป "attention" (เตือน+ขัดข้องรวมกัน) เป็นตัวกรอง
  // เดียวที่ backend ทำ OR สถานะให้ในคำขอเดียวไม่ได้ (GET /api/machines รับ
  // status เดี่ยวเท่านั้น) จึงขอทั้งสองสถานะแยกกัน คนละคำขอ โดยจำกัดจำนวนตาม
  // ยอดจริงจาก machineStats/การนับสำรองด้านบน (ไม่ทะลุ 1000 ทั้งคู่ตามปกติ)
  // แล้วรวม/ตัดหน้าแบบฝั่ง client เพื่อให้ยังใช้ <Pagination> ตัวเดียวกันได้
  useEffect(() => {
    let cancelled = false;
    setRegistryLoading(true);
    setRegistryError(null);

    const load = async () => {
      try {
        if (statusFilter === "attention") {
          const [warningRes, errorRes] = await Promise.all([
            getMachines({ limit: Math.max(warningMachines, 1), offset: 0, status: "warning" }),
            getMachines({ limit: Math.max(errorMachines, 1), offset: 0, status: "error" }),
          ]);
          if (cancelled) return;
          const merged = [...warningRes.data, ...errorRes.data].sort((a, b) =>
            (a.code ?? "").localeCompare(b.code ?? "")
          );
          setRegistryTotal(merged.length);
          setRegistryMachines(merged.slice(registryOffset, registryOffset + REGISTRY_PAGE_SIZE));
        } else {
          const res = await getMachines({
            limit: REGISTRY_PAGE_SIZE,
            offset: registryOffset,
            status: statusFilter === "all" ? undefined : statusFilter,
          });
          if (cancelled) return;
          setRegistryMachines(res.data);
          setRegistryTotal(res.meta?.total ?? res.data.length);
        }
      } catch (err) {
        if (!cancelled) setRegistryError(toUserMessage(err, "ไม่สามารถโหลดทะเบียนเครื่องจักรได้"));
      } finally {
        if (!cancelled) setRegistryLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, registryOffset, warningMachines, errorMachines]);

  // สถิติใบงานรายเครื่อง (ใบซ่อมค้าง/เวลาสูญเสียรวม/เวลาซ่อมเฉลี่ย) สำหรับการ์ด
  // ในหน้านี้ — ดึงแยกต่อจาก registryMachines ด้านบนเพราะ endpoint เป็นคนละตัว
  // (GET /api/work-orders/stats/by-machine) คีย์ด้วย code เดิม ทำครั้งเดียวต่อ
  // การเปลี่ยนหน้า/ตัวกรอง ไม่ยิงทีละเครื่อง (N+1) เก็บผลไว้แบบสะสม (merge) เพื่อ
  // ให้การ์ดหน้าที่เคยโหลดแล้วไม่กลับไปว่างเปล่าเมื่อสลับกลับมา
  const [machineWorkOrderStats, setMachineWorkOrderStats] = useState<MachineWorkOrderStatsMap>({});

  useEffect(() => {
    const codes = registryMachines
      .map((m) => m.code)
      .filter((code): code is string => !!code);
    if (codes.length === 0) return;

    let cancelled = false;
    getWorkOrderStatsByMachine(codes)
      .then((stats) => {
        if (cancelled) return;
        setMachineWorkOrderStats((prev) => ({ ...prev, ...stats }));
      })
      .catch(() => {
        // การ์ดยัง render ได้ตามปกติโดยแสดง "—" ที่ช่องสถิติใบงาน (ดู formatNumber/
        // formatWithUnit กับ workOrderStats undefined ใน MachineCard) — ไม่ต้อง
        // ตั้ง error state แยกเพราะไม่ใช่ข้อมูลหลักของหน้านี้ ไม่ควรบล็อกทั้งหน้า
      });

    return () => {
      cancelled = true;
    };
  }, [registryMachines]);

  const handleAskDailySummary = () => {
    const errorList = machines.filter((m) => m.status === "error");
    const warningList = machines.filter((m) => m.status === "warning");

    const overdueList = machines.filter((m) => isOverdueDate(m.nextMaintenance));

    const parts: string[] = ["ช่วยสรุปสถานะโรงงานประจำวันจากข้อมูลต่อไปนี้:"];
    parts.push(
      errorList.length > 0
        ? `เครื่องจักรขัดข้อง ${errorList.length} เครื่อง (${errorList.map((m) => orDash(m.code)).join(", ")})`
        : "ไม่มีเครื่องจักรขัดข้องในขณะนี้"
    );
    parts.push(
      warningList.length > 0
        ? `เครื่องจักรต้องเฝ้าระวัง ${warningList.length} เครื่อง (${warningList.map((m) => orDash(m.code)).join(", ")})`
        : "ไม่มีเครื่องจักรในสถานะเฝ้าระวัง"
    );
    parts.push(
      overdueList.length > 0
        ? `เครื่องจักรที่เลยกำหนด PM แล้ว ${overdueList.length} เครื่อง`
        : "ไม่มีเครื่องจักรที่เลยกำหนด PM"
    );
    parts.push(
      `ใบงานรอดำเนินการ ${pendingWorkOrders} งาน และรอตรวจสอบอนุมัติ ${reviewWorkOrders} งาน จากทั้งหมด ${totalWorkOrders} งาน`
    );
    parts.push("ช่วยแนะนำลำดับความสำคัญที่ควรจัดการก่อนสำหรับหัวหน้างานวันนี้");

    onAskAI(parts.join(" "));
  };

  // Status distribution — one representation of counts, driven by real machine.status.
  const statusDistribution: { key: Machine["status"]; name: string; value: number; color: string }[] = useMemo(
    () => [
      { key: "normal", name: "ทำงานปกติ", value: normalMachines, color: STATUS_DOT_COLORS.normal },
      { key: "warning", name: "ต้องเฝ้าระวัง", value: warningMachines, color: STATUS_DOT_COLORS.warning },
      { key: "error", name: "ขัดข้อง", value: errorMachines, color: STATUS_DOT_COLORS.error },
      { key: "maintenance", name: "กำลังซ่อมบำรุง", value: maintenanceMachines, color: STATUS_DOT_COLORS.maintenance },
    ],
    [normalMachines, warningMachines, errorMachines, maintenanceMachines]
  );
  const statusDistributionNonZero = useMemo(
    () => statusDistribution.filter((item) => item.value > 0),
    [statusDistribution]
  );

  // Which readings actually exist across the fleet. The repeated metric cells in
  // the registry below must all agree — gating them per machine would leave a
  // ragged grid of half-empty boxes — so the gate is fleet-wide here.
  const fleetReadings = useMemo(() => readingAvailability(machines), [machines]);

  // The trend card plots telemetry_readings — a table with zero rows, fed by
  // sensors the plant has not installed. Show it only once a real sensor reading
  // exists on a machine, which is also what guarantees the card has at least one
  // metric tab to draw and never renders itself away inside a live grid slot.
  const showTelemetryTrend = fleetReadings.spindleTemp || fleetReadings.vibrationMms;

  // Cells inside the registry metric grid. กลุ่มโรงงาน/แผนก-หน่วยงาน and
  // คะแนนสุขภาพเครื่อง are always shown (3 base cells) — the first two come
  // from the Excel import and are populated for ~99% of machines, the third
  // is derived from repair history and its absence ("never repaired") is
  // itself information. Sensor cells (spindleTemp/vibrationMms/operatingHours)
  // are added on top only once a real reading exists somewhere in the fleet.
  // The 3 work-order stat cells (ใบซ่อมค้าง/เวลาสูญเสียรวม/เวลาซ่อมเฉลี่ย) are
  // always shown too — a missing per-machine fetch renders "—" per cell
  // (see MachineCard), it never removes the cell itself.
  const metricCellCount =
    3 +
    3 +
    (fleetReadings.spindleTemp ? 1 : 0) +
    (fleetReadings.vibrationMms ? 1 : 0) +
    (fleetReadings.operatingHours ? 1 : 0);

  // เดิม machineHistory กรอง `wo.machineId === selectedMachine.id` จาก
  // workOrders ที่โหลดมาแล้ว — ใช้ไม่ได้กับข้อมูลจริงเลย เพราะใบงานที่นำเข้าจาก
  // Excel ทั้ง 8,589 แถวไม่มี machine_id (ดู docs/data-import-spec.md) มีแต่
  // machine_code จึงต้องดึงจาก server ด้วย ?machineCode= โดยตรง ซึ่งแก้ทั้งบั๊กนี้
  // และปัญหาการแบ่งหน้า (workOrders ที่ใช้ร่วมกันตอนนี้มีแค่ ~100 แถว) พร้อมกัน
  const [machineHistory, setMachineHistory] = useState<WorkOrder[]>([]);
  const [machineHistoryTotal, setMachineHistoryTotal] = useState(0);
  const [machineHistoryOffset, setMachineHistoryOffset] = useState(0);
  const [machineHistoryLoading, setMachineHistoryLoading] = useState(false);
  const [machineHistoryError, setMachineHistoryError] = useState<string | null>(null);

  // เปิดเครื่องใหม่ -> กลับไปหน้าแรกของประวัติซ่อมเสมอ
  useEffect(() => {
    setMachineHistoryOffset(0);
  }, [selectedMachine?.id]);

  // คู่มือเครื่องจักรที่ตรงกับเครื่องที่เลือก — ดึงเฉพาะตอนเปิด modal เพื่อไม่ให้โหลดคู่มือทั้งคลัง
  // ทุกครั้งที่ dashboard เปิด คู่มือบางเล่มระบุ machineModel เป็น "รุ่น" (model) ปกติ แต่บางเล่ม
  // (นำเข้าใหม่) ระบุเป็น "รหัสเครื่อง" (code) แทน และมีคู่มือทั่วไปประจำโรงงานที่ผูกกับค่าคงที่
  // "ALL-000" จึงต้องยิง getManuals แยกทีละค่าแล้วรวมผลลัพธ์ ไม่ใช่ยิงครั้งเดียวด้วย model อย่างเดียว
  const GENERAL_MANUAL_MACHINE_MODEL = "ALL-000";
  const [machineManuals, setMachineManuals] = useState<ManualDoc[]>([]);
  const [machineManualsLoading, setMachineManualsLoading] = useState(false);
  const [machineManualsError, setMachineManualsError] = useState<string | null>(null);
  // กลุ่มหมวดหมู่คู่มือที่กำลังกางอยู่ (แบบ accordion — เปิดได้ทีละกลุ่ม)
  const [expandedManualCategory, setExpandedManualCategory] = useState<string | null>(null);
  const UNCATEGORIZED_MANUAL_LABEL = "อื่นๆ";
  const getManualCategoryLabel = (category?: string | null) => {
    const trimmed = category?.trim();
    if (!trimmed) return UNCATEGORIZED_MANUAL_LABEL;
    return MANUAL_CATEGORIES.find((c) => c.value === trimmed)?.label ?? trimmed;
  };
  const machineManualGroups = useMemo(() => {
    const groups = new Map<string, ManualDoc[]>();
    for (const doc of machineManuals) {
      const label = getManualCategoryLabel(doc.category);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(doc);
    }
    return Array.from(groups.entries()).map(([label, docs]) => ({ label, docs }));
  }, [machineManuals]);

  // เปิดเครื่องใหม่ (หรือคู่มือโหลดเสร็จ) -> กางกลุ่มหมวดหมู่แรกให้อัตโนมัติ
  useEffect(() => {
    setExpandedManualCategory(machineManualGroups[0]?.label ?? null);
  }, [selectedMachine?.id, machineManualGroups]);

  useEffect(() => {
    const candidates = Array.from(
      new Set(
        [selectedMachine?.model, selectedMachine?.code, GENERAL_MANUAL_MACHINE_MODEL]
          .map((v) => v?.trim())
          .filter((v): v is string => !!v)
      )
    );
    if (candidates.length === 0) {
      setMachineManuals([]);
      setMachineManualsError(null);
      setMachineManualsLoading(false);
      return;
    }
    let cancelled = false;
    setMachineManualsLoading(true);
    setMachineManualsError(null);
    Promise.all(candidates.map((machineModel) => getManuals({ machineModel, limit: 10 })))
      .then((results) => {
        if (cancelled) return;
        const merged = new Map<string, ManualDoc>();
        // เก็บลำดับที่ยิงมา (model, code, ALL-000) ไว้ก่อน แล้วค่อยจัดเรียงคู่มือเฉพาะเครื่อง
        // (model/code) มาก่อนคู่มือทั่วไป (ALL-000) ทีหลัง เพื่อให้ผู้ใช้เห็นของเครื่องนี้ก่อนเสมอ
        for (const res of results) {
          for (const doc of res.data) {
            if (!merged.has(doc.id)) merged.set(doc.id, doc);
          }
        }
        const sorted = Array.from(merged.values()).sort((a, b) => {
          const aGeneral = a.machineModel === GENERAL_MANUAL_MACHINE_MODEL ? 1 : 0;
          const bGeneral = b.machineModel === GENERAL_MANUAL_MACHINE_MODEL ? 1 : 0;
          return aGeneral - bGeneral;
        });
        setMachineManuals(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        setMachineManualsError(toUserMessage(err, "ไม่สามารถโหลดคู่มือเครื่องจักรได้"));
      })
      .finally(() => {
        if (!cancelled) setMachineManualsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedMachine?.model, selectedMachine?.code]);

  const handleOpenManualFile = async (doc: ManualDoc) => {
    const win = window.open("", "_blank");
    if (!win) return;
    try {
      const { url } = await getManualFileUrl(doc.id);
      win.opener = null;
      win.location.replace(url);
    } catch {
      win.close();
    }
  };

  // คู่มือที่นำเข้าใหม่บางเล่มมีแต่ Markdown ไม่มีไฟล์ PDF (filePath เป็น null) — เปิดในหน้าต่างนี้แทน
  // การเปิดแท็บใหม่ (ซึ่งใช้ไม่ได้เพราะไม่มีไฟล์ให้เปิด)
  const [manualMarkdownDoc, setManualMarkdownDoc] = useState<ManualDoc | null>(null);
  const [manualMarkdownContent, setManualMarkdownContent] = useState<string | null>(null);
  const [manualMarkdownLoading, setManualMarkdownLoading] = useState(false);
  const [manualMarkdownError, setManualMarkdownError] = useState<string | null>(null);

  useEffect(() => {
    if (!manualMarkdownDoc) return;
    let cancelled = false;
    setManualMarkdownLoading(true);
    setManualMarkdownError(null);
    setManualMarkdownContent(null);
    getManualContent(manualMarkdownDoc.id)
      .then((content) => {
        if (cancelled) return;
        setManualMarkdownContent(content ?? "");
      })
      .catch((err) => {
        if (cancelled) return;
        setManualMarkdownError(toUserMessage(err, "ไม่สามารถโหลดเนื้อหาคู่มือได้"));
      })
      .finally(() => {
        if (!cancelled) setManualMarkdownLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [manualMarkdownDoc]);

  const handleOpenManual = (doc: ManualDoc) => {
    if (doc.hasMarkdown) {
      setManualMarkdownDoc(doc);
      return;
    }
    if (doc.filePath) {
      handleOpenManualFile(doc);
    }
  };

  // `machineCode` is the ONLY thing narrowing this query, and `buildQuery` drops
  // params that are undefined (see services/apiService.ts). Passing
  // `selectedMachine.code ?? undefined` for one of the 3 machines with no code on
  // record therefore sent `GET /api/work-orders?limit=50&offset=0` — no filter at
  // all — and the modal filled with the 50 most recent work orders belonging to
  // *other* machines, counted as ~8,589 repairs on a machine that has none.
  // A missing filter value must mean "no results", never "no filter": skip the
  // request entirely, exactly as ScanMachineView already does.
  const selectedMachineCode = selectedMachine?.code ?? null;

  useEffect(() => {
    if (!selectedMachine || !selectedMachineCode) {
      setMachineHistory([]);
      setMachineHistoryTotal(0);
      setMachineHistoryLoading(false);
      setMachineHistoryError(null);
      return;
    }
    let cancelled = false;
    setMachineHistoryLoading(true);
    setMachineHistoryError(null);

    getWorkOrders({
      machineCode: selectedMachineCode,
      limit: MACHINE_HISTORY_PAGE_SIZE,
      offset: machineHistoryOffset,
    })
      .then((res) => {
        if (cancelled) return;
        // ผลลัพธ์จาก server เรียงตาม assigned_date ล่าสุดก่อนอยู่แล้ว (ดู
        // backend/src/routes/workOrders.ts) — ตรงกับที่ต้องการพอดี ไม่ต้องเรียงซ้ำ
        setMachineHistory(res.data);
        setMachineHistoryTotal(res.meta?.total ?? res.data.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setMachineHistoryError(toUserMessage(err, "ไม่สามารถโหลดประวัติการซ่อมได้"));
      })
      .finally(() => {
        if (!cancelled) setMachineHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedMachine?.id, selectedMachineCode, machineHistoryOffset]);

  const selectedEvaluation = selectedMachine ? evaluateMachine(selectedMachine) : null;

  // ตัวชี้วัด OEE / cycle time / พลังงาน / ประวัติ error — ข้อมูลตัวอย่าง (mock)
  // deterministic ตาม machine.id ดู frontend/src/lib/machineMetricsMock.ts
  const selectedMetrics = useMemo(
    () => (selectedMachine ? getMachineMetricsMock(selectedMachine) : null),
    [selectedMachine]
  );

  // Cards in the detail modal: health score and the maintenance dates always
  // render (both derived from real repair history); the three sensor cards join
  // only when that machine reports a real reading. Drives the column count so the
  // row stays flush instead of trailing empty grid cells.
  const detailCardCount =
    2 +
    (selectedMachine?.spindleTemp != null ? 1 : 0) +
    (selectedMachine?.vibrationMms != null ? 1 : 0) +
    (selectedMachine?.operatingHours != null ? 1 : 0);

  // Opening a machine's modal via its card must also update what the dropdown
  // shows. A stable callback (not a fresh inline arrow) so MachineCard's
  // React.memo isn't defeated on every parent render.
  const handleCardSelect = useCallback((m: Machine) => {
    setPickedMachine(m);
    setSelectedMachine(m);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-hairline">
        {/* Mode switch — classic dashboard vs. the 3D Live Floor. Kept as a
            segmented pill so both options read as views of the same data,
            not a navigation away from this page. */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-pearl border border-divider self-start">
          <button
            type="button"
            onClick={() => setViewMode("classic")}
            aria-pressed={viewMode === "classic"}
            className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              viewMode === "classic"
                ? "bg-primary text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>มุมมองปกติ</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("floor4d")}
            aria-pressed={viewMode === "floor4d"}
            className={`min-h-9 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all relative ${
              viewMode === "floor4d"
                ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>MT Center Live Floor · 4D</span>
          </button>
        </div>

        <button
          onClick={handleAskDailySummary}
          className="min-h-[44px] px-4 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>ให้ AI สรุปรายงานประจำวัน</span>
        </button>
      </div>

      {viewMode === "floor4d" && (
        <LiveFloorView
          machines={machines}
          machineStats={machineStats}
          workOrders={workOrders}
          onOpenMachineDetail={handleCardSelect}
          onExit={() => setViewMode("classic")}
          onAskAI={onAskAI}
          detailOpen={selectedMachine !== null}
        />
      )}

      {viewMode === "classic" && (
        <>
      {/* Key Metric KPI Cards — clickable to filter the registry below */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Machines ready to run (not a filter — composite metric) */}
        <div className="bg-white p-5 rounded-[18px] border border-hairline">
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-xs font-normal">เครื่องพร้อมเดินงาน</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {readyRate !== null ? `${readyRate.toFixed(1)}%` : "—"}
          </div>
          <span className="text-xs text-ink-faint block mt-1">
            ปกติ {normalMachines} · เฝ้าระวัง {warningMachines} จาก {totalMachines} เครื่อง
          </span>
        </div>

        {/* Normal Machines Count — filter toggle */}
        <button
          type="button"
          onClick={() => setStatusFilter((f) => (f === "normal" ? "all" : "normal"))}
          aria-pressed={statusFilter === "normal"}
          className={`text-left min-h-[44px] p-5 rounded-[18px] border transition-colors ${
            statusFilter === "normal"
              ? "border-emerald-400 bg-emerald-50"
              : "border-hairline bg-white hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-xs font-normal">เครื่องจักรปกติ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {normalMachines} / {totalMachines} <span className="text-xs font-normal">เครื่อง</span>
          </div>
          <span className="text-xs text-ink-faint block mt-1">
            พร้อมเดินสายการผลิตเต็มรูปแบบ
          </span>
        </button>

        {/* Warning / Error — filter toggle (defaults to warning) */}
        <button
          type="button"
          onClick={() =>
            setStatusFilter((f) =>
              f === "attention" || f === "warning" || f === "error" ? "all" : "attention"
            )
          }
          aria-pressed={statusFilter === "attention"}
          className={`text-left min-h-[44px] p-5 rounded-[18px] border transition-colors ${
            statusFilter === "attention"
              ? "border-amber-400 bg-amber-50"
              : "border-hairline bg-white hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-xs font-normal">เครื่องเตือน/ขัดข้อง</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-amber-700">
            {warningMachines + errorMachines} <span className="text-xs font-normal">เครื่อง</span>
          </div>
          <span className="text-xs text-amber-700 font-semibold block mt-1">
            เฝ้าระวัง {warningMachines} · ขัดข้อง {errorMachines}
          </span>
        </button>

        {/* Work order completion (not a machine-status filter) */}
        <div className="bg-white p-5 rounded-[18px] border border-hairline">
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-xs font-normal">ใบงานปิดแล้ว</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {completedWorkOrders} / {totalWorkOrders} <span className="text-xs font-normal">งาน</span>
          </div>
          <span className="text-xs text-ink-faint block mt-1">
            {completionRate !== null
              ? `อัตราปิดงาน ${completionRate}% · รอดำเนินการ ${pendingWorkOrders} งาน`
              : "ยังไม่มีใบงานในระบบ"}
          </span>
        </div>
      </div>

      {/* GRAPHICAL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical trend chart for one machine at a time, picked via the dropdown
            inside the card, spanning 2 of the 3 columns beside the status donut.
            The plant has no sensors wired up and telemetry_readings is empty, so the
            card renders nothing today — mounting it anyway would leave a two-column
            hole beside the donut, hence the gate here as well as inside the card.
            Both come back automatically once any real reading arrives. */}
        {showTelemetryTrend && (
          <TelemetryTrendCard machines={machines} className="lg:col-span-2" />
        )}

        {/* Machine Status Breakdown — single chart representation, clickable slices.
            Takes the full row when the trend card has nothing to show, so the grid
            never renders an empty two-column gap. */}
        <div
          className={`bg-white rounded-[18px] border border-hairline p-5 md:p-6 space-y-4 flex flex-col h-full ${
            showTelemetryTrend
              ? ""
              : // Full-width: put the legend beside the donut instead of under it,
                // so the row reads as one deliberate card rather than a chart
                // marooned in empty space where the trend card used to be.
                "lg:col-span-3 lg:flex-row lg:items-stretch lg:gap-6 lg:space-y-0"
          }`}
        >
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-ink">
                สัดส่วนสถานะเครื่องจักร
              </h3>
              {statusFilter !== "all" && (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>ล้างตัวกรอง</span>
                </button>
              )}
            </div>
            <p className="text-xs text-ink-faint mb-3">
              คลิกที่รายการเพื่อกรองรายการเครื่องจักรด้านล่าง
            </p>

            <div className="flex-1 min-h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionNonZero}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistributionNonZero.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className={`space-y-1.5 pt-2 border-t border-divider ${
              showTelemetryTrend
                ? ""
                : "lg:w-80 lg:shrink-0 lg:self-center lg:pt-0 lg:border-t-0 lg:border-l lg:pl-6"
            }`}
            role="group"
            aria-label="กรองตามสถานะเครื่องจักร"
          >
            {statusDistribution.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={statusFilter === item.key}
                onClick={() => setStatusFilter((f) => (f === item.key ? "all" : item.key))}
                disabled={item.value === 0}
                className={`w-full min-h-[36px] flex items-center justify-between text-xs px-2 py-1.5 rounded-[11px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  statusFilter === item.key ? "bg-primary/10" : "hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-ink-muted font-normal">{item.name}</span>
                </div>
                <span className="font-semibold text-ink">{item.value} เครื่อง</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ALL MACHINES HEALTH REGISTRY (Clickable to view modal) */}
      <div className="bg-white rounded-[18px] border border-hairline p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-3">
          <div>
            <h3 className="text-base font-semibold text-ink">
              สถานะเครื่องจักรทุกเครื่อง
            </h3>
            <p className="text-xs text-ink-faint">
              คลิกที่การ์ดเครื่องจักรเพื่อดูรายละเอียดและประวัติการซ่อม
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="text-xs font-semibold text-ink-muted bg-pearl hover:bg-primary/5 px-3 py-1.5 rounded-full border border-divider cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            )}
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              แสดง {registryMachines.length} จาก {statusFilter !== "all" ? registryTotal : totalMachines} เครื่อง
            </span>
          </div>
        </div>

        {/* Machine dropdown — same picker as the technician (ScanMachineView) page.
            Jumping to a machine here opens the same detail modal the cards below
            open, without needing to scroll/paginate through the registry. Fed the
            full `machines` list (not the paginated registry page) because
            MachineSelect has its own status filter chips + search box — feeding
            it a pre-filtered/paginated list would make its own chip counts
            wrongly show "(0)". */}
        {machines.length > 0 && (
          <div className="max-w-md mb-4">
            <MachineSelect
              machines={machines}
              activeMachine={pickedMachine}
              onSelectMachine={(m) => {
                setPickedMachine(m);
                setSelectedMachine(m);
              }}
              label="ค้นหา / เลือกเครื่องจักร"
            />
          </div>
        )}

        {registryError && (
          <div className="p-3.5 rounded-[11px] bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{registryError}</span>
          </div>
        )}

        {registryLoading && registryMachines.length === 0 ? (
          <SkeletonCardGrid count={REGISTRY_PAGE_SIZE} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2" />
        ) : registryMachines.length === 0 ? (
          <p className="text-sm text-ink-faint text-center py-8">ไม่มีเครื่องจักรในสถานะนี้</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {registryMachines.map((m) => (
                <MachineCard
                  key={m.id}
                  machine={m}
                  fleetReadings={fleetReadings}
                  metricCellCount={metricCellCount}
                  workOrderStats={m.code ? machineWorkOrderStats[m.code] : undefined}
                  onSelect={handleCardSelect}
                />
              ))}
            </div>

            {registryTotal > 0 && (
              <Pagination
                offset={registryOffset}
                limit={REGISTRY_PAGE_SIZE}
                total={registryTotal}
                onOffsetChange={setRegistryOffset}
                isLoading={registryLoading}
                itemLabel="เครื่อง"
                className="pt-2"
              />
            )}
          </>
        )}
      </div>
        </>
      )}

      {/* MACHINE DETAIL & HISTORY MODAL */}
      {selectedMachine && selectedEvaluation && (
        <Modal size="xl" onClose={() => setSelectedMachine(null)}>
          <ModalHeader onClose={() => setSelectedMachine(null)}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[11px] bg-primary/10 text-primary flex items-center justify-center font-semibold text-xl shrink-0 border border-primary/20">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-semibold text-ink">
                    {orDash(selectedMachine.code)} · {selectedMachine.name}
                  </h3>
                  <span className={machineStatusBadgeClass(selectedMachine.status)}>
                    {machineStatusLabel(selectedMachine.status)}
                  </span>
                </div>
                <p className="text-xs text-ink-faint">
                  รุ่น: {orDash(selectedMachine.model)} · ตำแหน่ง: {orDash(selectedMachine.location)}
                </p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-6">
            {/* Active Alert Banner if exists */}
            {selectedMachine.activeErrorCode && (
              <div className="p-4 rounded-[18px] bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-sm text-rose-700">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>การแจ้งเตือนความผิดปกติ ({selectedMachine.activeErrorCode})</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed pl-7">
                  {selectedMachine.activeErrorDesc}
                </p>
              </div>
            )}

            {/* Why this status — real reasons from evaluateMachine */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-ink-faint">เหตุผลของสถานะปัจจุบัน</h4>
              <ul className="text-xs text-ink-muted space-y-1 list-disc pl-5">
                {selectedEvaluation.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>

            {/* Condition cards. The two sensor cards and the operating-hours card
                render only when a real reading exists — with no sensors installed
                they were three boxes of dashes, and a technician cannot tell a box
                of dashes from an instrument reading zero. The maintenance-dates
                card always renders (it is derived from repair history), so the row
                is never empty and the grid never leaves a hole. */}
            <div className="space-y-2">
              <div className={`grid grid-cols-2 gap-3 ${MODAL_GRID_COLS[detailCardCount]}`}>
                {selectedMachine.spindleTemp != null && (
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">
                      อุณหภูมิ Spindle
                    </span>
                    <span
                      className={`text-xl font-semibold tracking-[-0.02em] ${
                        spindleTempLevel(selectedMachine.spindleTemp) !== "normal" ? "text-rose-600" : "text-ink"
                      }`}
                    >
                      {isMissing(selectedMachine.spindleTemp) ? NO_DATA : `${selectedMachine.spindleTemp}°C`}
                    </span>
                    <span className="text-xs text-ink-faint block mt-1">
                      เกณฑ์เฝ้าระวัง: ≥ {SPINDLE_TEMP_WARNING}°C
                    </span>
                  </div>
                )}

                {selectedMachine.vibrationMms != null && (
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">
                      ความสั่นสะเทือน
                    </span>
                    <span
                      className={`text-xl font-semibold tracking-[-0.02em] ${
                        vibrationLevel(selectedMachine.vibrationMms) !== "normal" ? "text-rose-600" : "text-ink"
                      }`}
                    >
                      {isMissing(selectedMachine.vibrationMms) ? NO_DATA : `${selectedMachine.vibrationMms} mm/s`}
                    </span>
                    <span className="text-xs text-ink-faint block mt-1">
                      เกณฑ์เฝ้าระวัง: ≥ {VIBRATION_WARNING} mm/s
                    </span>
                  </div>
                )}

                <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                  <span className="text-xs font-semibold text-ink-faint block mb-1">
                    คะแนนสุขภาพเครื่อง
                  </span>
                  <span
                    className={`text-xl font-semibold tracking-[-0.02em] ${healthScoreTextClass(
                      selectedMachine.healthScore
                    )}`}
                  >
                    {selectedMachine.healthScore == null
                      ? NO_REPAIR_HISTORY_TH
                      : `${selectedMachine.healthScore}%`}
                  </span>
                  <span className="text-xs text-ink-faint block mt-1">
                    {selectedMachine.healthScore == null
                      ? "คำนวณจากประวัติซ่อมของเครื่อง — เครื่องนี้ยังไม่มีประวัติ"
                      : `เกณฑ์เฝ้าระวัง: < ${HEALTH_SCORE_WARNING}% · หยุดเครื่อง: < ${HEALTH_SCORE_ERROR}%`}
                  </span>
                </div>

                {selectedMachine.operatingHours != null && (
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">
                      ชั่วโมงการทำงาน
                    </span>
                    <span className="text-xl font-semibold tracking-[-0.02em] text-ink">
                      {selectedMachine.operatingHours.toLocaleString("th-TH")} ชม.
                    </span>
                  </div>
                )}

                {/* Maintenance dates used to be a footnote under the operating-hours
                    card and would have disappeared with it. An overdue PM is the
                    most actionable fact on this modal, so it gets its own card and
                    the amber treatment. */}
                <div
                  className={`p-3.5 rounded-[18px] border ${
                    isOverdueDate(selectedMachine.nextMaintenance)
                      ? "bg-amber-50 border-amber-200"
                      : "bg-divider border-hairline"
                  }`}
                >
                  <span className="text-xs font-semibold text-ink-faint block mb-1">
                    รอบบำรุงรักษา
                  </span>
                  <span
                    className={`text-xl font-semibold tracking-[-0.02em] ${
                      isOverdueDate(selectedMachine.nextMaintenance) ? "text-amber-800" : "text-ink"
                    }`}
                  >
                    {formatDate(selectedMachine.nextMaintenance)}
                  </span>
                  {isOverdueDate(selectedMachine.nextMaintenance) && (
                    <span className="text-xs font-semibold text-amber-800 flex items-center gap-1 mt-1">
                      <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                      {overdueLabel(selectedMachine.nextMaintenance)}
                    </span>
                  )}
                  <span className="text-xs text-ink-faint block mt-1">
                    ซ่อมล่าสุด: {formatDate(selectedMachine.lastMaintenance)}
                  </span>
                </div>
              </div>
            </div>

            {/* ประสิทธิภาพ — OEE + Cycle Time (mock/demo) */}
            {selectedMetrics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <span>ประสิทธิภาพ (OEE)</span>
                  </h4>
                  <span className="text-[10px] text-ink-faint font-medium">ข้อมูลตัวอย่าง</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline sm:col-span-1 col-span-2">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">OEE รวม</span>
                    <span className={`text-2xl font-bold tracking-[-0.02em] ${oeeTextClass(selectedMetrics.oee.oee)}`}>
                      {selectedMetrics.oee.oee}%
                    </span>
                  </div>
                  {[
                    { label: "Availability", value: selectedMetrics.oee.availability },
                    { label: "Performance", value: selectedMetrics.oee.performance },
                    { label: "Quality", value: selectedMetrics.oee.quality },
                  ].map((item) => (
                    <div key={item.label} className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                      <span className="text-xs font-semibold text-ink-faint block mb-1">{item.label}</span>
                      <span className={`text-lg font-semibold tracking-[-0.02em] ${oeeTextClass(item.value)}`}>
                        {item.value}%
                      </span>
                      <div className="h-1.5 rounded-full bg-white/60 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${oeeBarClass(item.value)}`}
                          style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cycle Time */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint mb-1 flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" /> รอบเวลาจริง
                    </span>
                    <span className="text-lg font-semibold text-ink">{selectedMetrics.cycleTime.actualSec} วิ</span>
                  </div>
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">รอบเวลามาตรฐาน</span>
                    <span className="text-lg font-semibold text-ink">{selectedMetrics.cycleTime.standardSec} วิ</span>
                  </div>
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">ส่วนต่างจากมาตรฐาน</span>
                    <span
                      className={`text-lg font-semibold ${
                        selectedMetrics.cycleTime.deviationPct > 5 ? "text-rose-600" : "text-ink"
                      }`}
                    >
                      {selectedMetrics.cycleTime.deviationPct > 0 ? "+" : ""}
                      {selectedMetrics.cycleTime.deviationPct}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                    <span className="text-xs font-semibold text-ink-faint block mb-1">ชิ้นงาน/ชม.</span>
                    <span className="text-lg font-semibold text-ink">{selectedMetrics.cycleTime.partsPerHour}</span>
                  </div>
                </div>
              </div>
            )}

            {/* การใช้พลังงาน (mock/demo) */}
            {selectedMetrics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>การใช้พลังงาน</span>
                  </h4>
                  <span className="text-[10px] text-ink-faint font-medium">ข้อมูลตัวอย่าง</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedMetrics.energy.map((e) => {
                    const ENERGY_ICONS: Record<string, React.ReactNode> = {
                      electrical: <Zap className="w-3.5 h-3.5" />,
                      ro: <Droplet className="w-3.5 h-3.5" />,
                      coolant: <Droplet className="w-3.5 h-3.5" />,
                      air: <Wind className="w-3.5 h-3.5" />,
                    };
                    const worse = e.changePct > 0;
                    return (
                      <div key={e.kind} className="p-3.5 rounded-[18px] bg-divider border border-hairline">
                        <span className="text-xs font-semibold text-ink-faint mb-1 flex items-center gap-1">
                          {ENERGY_ICONS[e.kind]}
                          {e.label}
                        </span>
                        <span className="text-lg font-semibold text-ink block">
                          {e.value} {e.unit}
                        </span>
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 mt-1 ${
                            worse ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {worse ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(e.changePct)}% จากช่วงก่อนหน้า
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* กราฟแนวโน้ม 24 ชม. / 7 วัน (mock/demo) */}
            {selectedMachine && (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>กราฟแนวโน้ม</span>
                  </h4>
                  <span className="text-[10px] text-ink-faint font-medium">ข้อมูลตัวอย่าง</span>
                </div>
                <MachineMetricsChart machine={selectedMachine} />
              </div>
            )}

            {/* ประวัติ Error / Error code (mock/demo) */}
            {selectedMetrics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <span>ประวัติ Error / Error code</span>
                  </h4>
                  <span className="text-[10px] text-ink-faint font-medium">ข้อมูลตัวอย่าง</span>
                </div>
                <div className="overflow-x-auto rounded-[11px] border border-hairline">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-divider text-ink-faint font-semibold border-b border-hairline">
                      <tr>
                        <th className="p-3">Error code</th>
                        <th className="p-3">รายละเอียด</th>
                        <th className="p-3">ความรุนแรง</th>
                        <th className="p-3">เวลาที่เกิด</th>
                        <th className="p-3">หยุดเครื่อง (นาที)</th>
                        <th className="p-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                      {selectedMetrics.errorHistory.map((err) => {
                        const isActive = selectedMachine?.activeErrorCode === err.code && !err.resolved;
                        const severityClass =
                          err.severity === "critical"
                            ? "bg-rose-100 text-rose-800"
                            : err.severity === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800";
                        const severityLabel =
                          err.severity === "critical" ? "วิกฤต" : err.severity === "warning" ? "เฝ้าระวัง" : "แจ้งเตือน";
                        return (
                          <tr key={err.id} className={isActive ? "bg-rose-50" : "hover:bg-primary/5"}>
                            <td className="p-3 font-mono font-semibold text-ink">{err.code}</td>
                            <td className="p-3 text-ink">{err.description}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${severityClass}`}>
                                {severityLabel}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-ink-muted whitespace-nowrap">
                              {new Date(err.occurredAt).toLocaleString("th-TH", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="p-3 text-ink-muted">{err.durationMin}</td>
                            <td className="p-3">
                              {err.resolved ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                  แก้ไขแล้ว
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                                  ยังไม่แก้ไข
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* HISTORICAL RECORD LOGS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-divider pb-2">
                <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <span>ประวัติการซ่อมบำรุงย้อนหลัง</span>
                  {machineHistoryLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-ink-faint animate-spin" aria-label="กำลังโหลด" />
                  )}
                </h4>
                <span className="text-xs text-ink-faint">{machineHistoryTotal} รายการ</span>
              </div>

              {machineHistoryError && (
                <div className="p-3.5 rounded-[11px] bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>{machineHistoryError}</span>
                </div>
              )}

              {machineHistoryLoading && machineHistory.length === 0 && !machineHistoryError ? (
                <div className="p-3.5 rounded-[11px] border border-hairline">
                  <SkeletonList count={5} />
                </div>
              ) : machineHistory.length === 0 && !machineHistoryError ? (
                // Distinguish "this machine has no repairs" from "we cannot look
                // its repairs up" — the second is a data-quality problem on the
                // machine record, not a fact about how often it has been fixed.
                <p className="p-6 text-center text-ink-faint text-xs rounded-[11px] border border-hairline">
                  {selectedMachineCode
                    ? "ยังไม่มีประวัติการซ่อม"
                    : "เครื่องนี้ไม่มีรหัสเครื่องในระบบ จึงยังค้นประวัติซ่อมย้อนหลังให้ไม่ได้"}
                </p>
              ) : machineHistory.length > 0 ? (
                <>
                  {/* Table for desktop */}
                  <div className="hidden md:block overflow-x-auto rounded-[11px] border border-hairline">
                    <table className="w-full min-w-[640px] text-left text-xs">
                      <thead className="bg-divider text-ink-faint font-semibold border-b border-hairline">
                        <tr>
                          <th className="p-3">วันที่</th>
                          <th className="p-3">รหัสใบงาน</th>
                          <th className="p-3">รายการที่ดำเนินการ</th>
                          <th className="p-3">ช่างผู้รับผิดชอบ</th>
                          <th className="p-3">ผลการตรวจ AI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-divider">
                        {machineHistory.map((wo) => (
                          <tr key={wo.id} className="hover:bg-primary/5">
                            {/* The repair date, not the import timestamp — see
                                workOrderDisplayDate. Also the field the server
                                sorts these rows by, so date and order agree. */}
                            <td className="p-3 font-mono text-ink-muted">
                              {orDash(workOrderDisplayDate(wo))}
                            </td>
                            <td className="p-3 font-mono font-semibold text-primary">{wo.code}</td>
                            <td className="p-3 font-normal text-ink">{wo.title}</td>
                            <td className="p-3 text-ink-muted">{wo.technicianName || "—"}</td>
                            <td className="p-3">
                              {typeof wo.aiVerificationScore === "number" ? (
                                <span className="font-semibold text-emerald-600">
                                  {wo.aiVerificationScore}%
                                </span>
                              ) : (
                                <span className="text-ink-faint">ยังไม่ประเมิน</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card list for mobile */}
                  <div className="md:hidden divide-y divide-divider rounded-[11px] border border-hairline overflow-hidden">
                    {machineHistory.map((wo) => (
                      <div key={wo.id} className="p-3.5 space-y-1.5 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">{wo.code}</span>
                          <span className="font-mono text-xs text-ink-faint">
                            {orDash(workOrderDisplayDate(wo))}
                          </span>
                        </div>
                        <p className="text-sm text-ink font-normal">{wo.title}</p>
                        <div className="flex items-center justify-between text-xs text-ink-muted">
                          <span>ช่าง: {wo.technicianName || "—"}</span>
                          {typeof wo.aiVerificationScore === "number" ? (
                            <span className="font-semibold text-emerald-600">
                              ตรวจ AI {wo.aiVerificationScore}%
                            </span>
                          ) : (
                            <span className="text-ink-faint">ยังไม่ประเมิน</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {/* แบ่งหน้าประวัติซ่อมของเครื่องนี้ — ใช้ total จริงจาก server
                  (เครื่องที่ซ่อมบ่อยอาจมีประวัติเกิน 50 รายการต่อหน้า) */}
              {machineHistoryTotal > 0 && (
                <Pagination
                  offset={machineHistoryOffset}
                  limit={MACHINE_HISTORY_PAGE_SIZE}
                  total={machineHistoryTotal}
                  onOffsetChange={setMachineHistoryOffset}
                  isLoading={machineHistoryLoading}
                  itemLabel="รายการ"
                />
              )}
            </div>

            {/* คู่มือเครื่องจักร */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-divider pb-2">
                <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>คู่มือเครื่องจักร</span>
                  {machineManualsLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-ink-faint animate-spin" aria-label="กำลังโหลด" />
                  )}
                </h4>
              </div>

              {machineManualsError ? (
                <div className="p-3.5 rounded-[11px] bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>{machineManualsError}</span>
                </div>
              ) : machineManualsLoading && machineManuals.length === 0 ? (
                <div className="p-3.5 rounded-[11px] border border-hairline">
                  <SkeletonList count={2} />
                </div>
              ) : machineManuals.length === 0 ? (
                <p className="p-6 text-center text-ink-faint text-xs rounded-[11px] border border-hairline">
                  ยังไม่มีคู่มือสำหรับรุ่นนี้
                </p>
              ) : (
                <div className="space-y-2">
                  {machineManualGroups.map((group) => {
                    const isExpanded = expandedManualCategory === group.label;
                    return (
                      <div key={group.label} className="rounded-[11px] border border-hairline overflow-hidden">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() =>
                            setExpandedManualCategory((prev) => (prev === group.label ? null : group.label))
                          }
                          className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between gap-3 bg-pearl hover:bg-primary/5 cursor-pointer transition-all"
                        >
                          <span className="text-sm font-semibold text-ink truncate">{group.label}</span>
                          <span className="shrink-0 flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-ink-faint bg-divider px-2 py-0.5 rounded-full">
                              {group.docs.length} เล่ม
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-ink-faint transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="divide-y divide-divider border-t border-hairline">
                            {group.docs.map((doc) => {
                              const isGeneral = doc.machineModel === GENERAL_MANUAL_MACHINE_MODEL;
                              const canOpen = doc.hasMarkdown || !!doc.filePath;
                              return (
                                <div key={doc.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                                  <div className="min-w-0">
                                    <p className="text-sm text-ink font-medium truncate flex items-center gap-1.5">
                                      <span className="truncate">{doc.title}</span>
                                      {isGeneral && (
                                        <span className="shrink-0 text-[11px] font-semibold text-ink-faint bg-divider px-2 py-0.5 rounded-full">
                                          คู่มือทั่วไป
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-xs text-ink-faint">
                                      {doc.pagesCount > 0 ? `${doc.pagesCount} หน้า` : ""}
                                      {doc.aiIndexed ? " · จัดทำดัชนี AI แล้ว" : ""}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleOpenManual(doc)}
                                    disabled={!canOpen}
                                    className="shrink-0 min-h-[36px] px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>เปิดคู่มือ</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ModalBody>

          {/* Action Footer */}
          <ModalFooter className="sm:justify-between">
            <button
              onClick={() => {
                // Only send readings that exist. "อุณหภูมิ ไม่มีข้อมูล ค่าสั่นสะเทือน
                // ไม่มีข้อมูล" told the model nothing and invited it to invent the
                // numbers back; the facts we do have (condition index, overdue PM)
                // are what the analysis should be built on.
                const m = selectedMachine;
                const facts: string[] = [];
                if (!isMissing(m.spindleTemp)) facts.push(`อุณหภูมิ Spindle ${m.spindleTemp}°C`);
                if (!isMissing(m.vibrationMms)) facts.push(`ค่าสั่นสะเทือน ${m.vibrationMms} mm/s`);
                facts.push(
                  m.healthScore == null
                    ? `คะแนนสุขภาพเครื่อง: ${NO_REPAIR_HISTORY_TH}`
                    : `คะแนนสุขภาพเครื่อง ${m.healthScore}%`
                );
                if (isOverdueDate(m.nextMaintenance)) {
                  facts.push(`PM ${overdueLabel(m.nextMaintenance)} (กำหนด ${m.nextMaintenance})`);
                }
                onAskAI(
                  `ขอรายงานวิเคราะห์สถานะเชิงลึกสำหรับเครื่อง ${orDash(m.code)} (${m.name}) — ${facts.join(" · ")} โดยอ้างอิงจากประวัติการซ่อมของเครื่องนี้`
                );
              }}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>ให้ MT Center AI วิเคราะห์เครื่องนี้</span>
            </button>

            <button
              onClick={() => setSelectedMachine(null)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-[11px] bg-pearl hover:bg-primary/5 text-ink-muted text-xs font-semibold border border-divider cursor-pointer active:scale-95"
            >
              ปิดหน้าต่าง
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* หน้าต่างอ่านคู่มือที่มีแต่ Markdown (ไม่มีไฟล์ PDF ให้เปิดแท็บใหม่) — เรนเดอร์ด้วย
          markdownComponents ชุดเดียวกับหน้าคลังคู่มือ (ManualsView) เพื่อให้สไตล์ตรงกัน */}
      {manualMarkdownDoc && (
        <Modal size="xl" onClose={() => setManualMarkdownDoc(null)}>
          <ModalHeader onClose={() => setManualMarkdownDoc(null)}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                {manualMarkdownDoc.category}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-ink leading-snug">
                {manualMarkdownDoc.title}
              </h3>
            </div>
          </ModalHeader>
          <ModalBody>
            {manualMarkdownLoading ? (
              <div className="bg-divider text-ink-muted p-8 rounded-[18px] text-center space-y-3 my-4 border border-hairline">
                <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                <p className="text-sm text-ink-muted">กำลังโหลดเนื้อหาคู่มือ…</p>
              </div>
            ) : manualMarkdownError ? (
              <div className="bg-rose-50 border border-rose-200 p-8 rounded-[18px] text-center space-y-3 my-4">
                <AlertTriangle className="w-10 h-10 text-rose-700 mx-auto" />
                <p className="text-sm font-semibold text-rose-900">{manualMarkdownError}</p>
              </div>
            ) : (
              <div className="text-xs sm:text-sm leading-relaxed text-ink-muted">
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                  {manualMarkdownContent ?? ""}
                </ReactMarkdown>
              </div>
            )}
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};
