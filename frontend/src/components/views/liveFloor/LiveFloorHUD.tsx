import { memo, useEffect, useMemo, useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Boxes,
  Building2,
  Eye,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { Machine, MachineStats, MachineStatus, WorkOrder } from "../../../types";
import type { FloorBuilding } from "../../../lib/floorLayout";
import { machineStatusLabel } from "../../../lib/pillStyles";
import { formatDecimal, formatWithUnit } from "../../../lib/format";
import { computeReadyRate, deriveMachineCounts } from "../../../lib/machineAvailability";
import {
  ACTIVITY_LABELS,
  type FloorSimulationSnapshot,
  type MachineActivity,
  type MachineRuntime,
} from "../../../lib/floorSimulation";
import { LIVE_FLOOR_THEME } from "./liveFloorTheme";

/** Keep in sync with the same union in `LiveFloor4DScene.tsx`. */
export type FloorCameraPreset = "line" | "plant" | "top" | "eye";

export interface LiveFloorHUDProps {
  machines: Machine[]; // unfiltered, for counts
  /**
   * Aggregate machine counts from GET /api/machines/stats — same source of
   * truth as the classic Supervisor Dashboard's KPI tiles. `machines` above
   * is the parent's own (paginated, up to 1000 rows) list and can no longer
   * be trusted for the fleet-wide total, so "พร้อมใช้งาน %" prefers this when
   * present and only falls back to counting `machines` while stats haven't
   * loaded yet.
   */
  machineStats?: MachineStats | null;
  workOrders: WorkOrder[]; // for the open-job KPI
  statusFilter: MachineStatus | "all";
  onStatusFilterChange: (next: MachineStatus | "all") => void;
  selectedMachine: Machine | null;
  onOpenDetail: (machine: Machine) => void; // open the existing detail modal
  onClearSelection: () => void;
  cameraPreset: FloorCameraPreset;
  onCameraPresetChange: (next: FloorCameraPreset) => void;
  highQuality: boolean;
  onToggleQuality: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExit: () => void; // back to the classic dashboard
  onAskAI?: (prompt: string) => void;
  simSnapshot: FloorSimulationSnapshot;
  selectedRuntime: MachineRuntime | null;
  /** every building on the site, for the building navigator */
  buildings: FloorBuilding[];
  /** currently focused building; null = whole-site view */
  focusBuildingId: string | null;
  /** pick a building to fly to, or null to return to the whole-site view */
  onFocusBuilding: (buildingId: string | null) => void;
}

/* ------------------------------------------------------------------ */
/* Shared status metadata — single source for colour + Thai label     */
/* ------------------------------------------------------------------ */

const STATUS_ORDER: MachineStatus[] = ["normal", "warning", "error", "maintenance"];

/** error > warning > maintenance > normal — the layout's own severity ordering. */
const STATUS_SEVERITY: Record<MachineStatus, number> = {
  error: 3,
  warning: 2,
  maintenance: 1,
  normal: 0,
};

const STATUS_META: Record<MachineStatus, { color: string; label: string }> = {
  normal: { color: LIVE_FLOOR_THEME.status.normal, label: machineStatusLabel("normal") },
  warning: { color: LIVE_FLOOR_THEME.status.warning, label: machineStatusLabel("warning") },
  error: { color: LIVE_FLOOR_THEME.status.error, label: machineStatusLabel("error") },
  maintenance: {
    color: LIVE_FLOOR_THEME.status.maintenance,
    label: machineStatusLabel("maintenance"),
  },
};

const ACTIVITY_ORDER: MachineActivity[] = ["running", "idle", "setup", "down"];

const ACTIVITY_COLORS: Record<MachineActivity, string> = {
  running: LIVE_FLOOR_THEME.status.normal,
  idle: LIVE_FLOOR_THEME.hud.textMuted,
  setup: LIVE_FLOOR_THEME.status.warning,
  down: LIVE_FLOOR_THEME.status.error,
  maintenance: LIVE_FLOOR_THEME.status.maintenance,
};

/** Clamp a percentage into [0, 100] so a bar/progress fill never overshoots the track. */
function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

const CAMERA_PRESETS: Array<{ id: FloorCameraPreset; label: string; icon: typeof Eye }> = [
  { id: "line", label: "ซูมเข้าไลน์", icon: Boxes },
  { id: "plant", label: "ดูทั้งโรงงาน", icon: Building2 },
  { id: "top", label: "มุมบนสุด", icon: LayoutGrid },
  { id: "eye", label: "ระดับสายตา", icon: Eye },
];

/** Presets that frame the whole building rather than a single hall. */
function isWideCameraPreset(preset: FloorCameraPreset): boolean {
  return preset === "plant" || preset === "top";
}

const PANEL_CLASS =
  "bg-[var(--lf-panel-bg)] backdrop-blur-md border border-[var(--lf-panel-border)] rounded-[18px] shadow-[0_8px_24px_-12px_var(--lf-panel-glow)] text-[var(--lf-text)]";

/**
 * Scrollbar-hiding pattern shared by the left rail, the building list inside
 * it and the mobile building chip row — the HUD floats over a 3D scene, so a
 * native scrollbar gutter would read as a rendering artefact.
 */
const HIDE_SCROLLBAR_CLASS =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useFadeAfter(delayMs: number): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setVisible(false), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);
  return visible;
}

/**
 * Leaf node that owns the 1Hz clock tick itself, so re-rendering it every
 * second no longer forces a reconciliation of the whole HUD tree (which sits
 * alongside a heavy 3D canvas and a 2Hz simulation snapshot). Markup and Thai
 * formatting are byte-identical to the inline block this replaced.
 */
const FloorClock = memo(function FloorClock(): ReactElement {
  const now = useNow();
  return (
    <div className="hidden @min-[1088px]:block shrink-0 border-l border-[var(--lf-panel-border)] pl-3 ml-1 text-right">
      <div className="text-[11px] font-mono tabular-nums tracking-wide">
        {now.toLocaleTimeString("th-TH", { hour12: false })}
      </div>
      <div className="text-[9px] text-[var(--lf-text-muted)] leading-tight">
        {now.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
    </div>
  );
});

function LiveFloorHUD(props: LiveFloorHUDProps): ReactElement {
  const {
    machines,
    machineStats,
    workOrders,
    statusFilter,
    onStatusFilterChange,
    selectedMachine,
    onOpenDetail,
    onClearSelection,
    cameraPreset,
    onCameraPresetChange,
    highQuality,
    onToggleQuality,
    isFullscreen,
    onToggleFullscreen,
    onExit,
    onAskAI,
    simSnapshot,
    selectedRuntime,
    buildings,
    focusBuildingId,
    onFocusBuilding,
  } = props;

  const hintVisible = useFadeAfter(8000);

  // "พร้อมใช้งาน %" และยอดนับรายสถานะต้องใช้สูตร/แหล่งข้อมูลเดียวกับ Supervisor
  // Dashboard เสมอ — `machines` ที่หน้านี้ได้รับอาจเป็นแค่ส่วนหนึ่งของ fleet
  // (แบ่งหน้าสูงสุด 1000 แถวจาก parent) จึงต้องใช้ machineStats (aggregate จาก
  // server) เป็นหลัก และนับจาก machines เป็นตัวสำรองเมื่อ machineStats ยังไม่โหลด
  const {
    total: totalMachines,
    normal: normalCount,
    warning: warningCount,
    error: errorCount,
    maintenance: maintenanceCount,
  } = useMemo(() => deriveMachineCounts(machines, machineStats), [machines, machineStats]);

  const statusCounts: Record<MachineStatus, number> = {
    normal: normalCount,
    warning: warningCount,
    error: errorCount,
    maintenance: maintenanceCount,
  };

  const readyRatePct = computeReadyRate({
    total: totalMachines,
    normal: normalCount,
    warning: warningCount,
  });

  const openWorkOrders = useMemo(
    () => workOrders.filter((wo) => wo.status !== "completed").length,
    [workOrders]
  );

  const avgHealth = useMemo(() => {
    const present = machines
      .map((m) => m.healthScore)
      .filter((v): v is number => v !== null && Number.isFinite(v));
    if (present.length === 0) return null;
    const sum = present.reduce((acc, v) => acc + v, 0);
    return sum / present.length;
  }, [machines]);

  const attentionCount = warningCount + errorCount;

  const selectedMeta = selectedMachine ? STATUS_META[selectedMachine.status] : null;

  const simTotals = simSnapshot.totals;
  const runningMachineCount = simTotals.running;

  /** Worst-status first, then the busiest building — the supervisor's triage order. */
  const sortedBuildings = useMemo(
    () =>
      [...buildings].sort((a, b) => {
        const severity = STATUS_SEVERITY[b.worstStatus] - STATUS_SEVERITY[a.worstStatus];
        if (severity !== 0) return severity;
        return b.machineCount - a.machineCount;
      }),
    [buildings]
  );

  const viewIsWide = isWideCameraPreset(cameraPreset);
  const scaleTogglePreset: FloorCameraPreset = viewIsWide ? "line" : "plant";
  const scaleToggleLabel = viewIsWide ? "ซูมเข้าไลน์" : "ดูทั้งโรงงาน";

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* LEFT RAIL — ONE vertical column holding every left-hand panel, so the
          overview, the building navigator and the KPI strip can never overlap
          each other at any container size. Anchored top-to-bottom and gated on
          the CONTAINER's inline size (the 4D canvas often sits in a dashboard
          column far narrower than the viewport, so viewport breakpoints lie).
          The rail itself scrolls when the content outgrows the height budget;
          the KPI strip is pushed to the bottom by `mt-auto` whenever there is
          slack, which reproduces the previous bottom-left placement. */}
      <div
        className={`hidden @min-[640px]:flex absolute top-4 left-4 bottom-4 z-10 w-64 max-w-[calc(100%-2rem)] flex-col gap-3 pointer-events-none overflow-y-auto overflow-x-hidden overscroll-contain min-h-0 ${HIDE_SCROLLBAR_CLASS}`}
      >
        {/* overview / status filters — natural height, never shrinks */}
        <div
          className={`shrink-0 ${PANEL_CLASS} p-4 pointer-events-auto`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lf-text-muted)]">
              ภาพรวมสายการผลิต
            </span>
            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => onStatusFilterChange("all")}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lf-accent-26)] text-[var(--lf-accent)] hover:bg-[var(--lf-panel-border)] transition-colors"
              >
                แสดงทั้งหมด
              </button>
            )}
          </div>
          <div className="text-2xl font-semibold tracking-[0.02em] mb-3">
            {totalMachines.toLocaleString("th-TH")}
            <span className="text-xs font-normal text-[var(--lf-text-muted)] ml-1.5">เครื่องทั้งหมด</span>
          </div>
          <div className="space-y-1.5">
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              const count = statusCounts[status];
              const pct = totalMachines > 0 ? (count / totalMachines) * 100 : 0;
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onStatusFilterChange(isActive ? "all" : status)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[10px] transition-colors text-left ${
                    isActive
                      ? "bg-[var(--lf-accent-26)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
                      : "hover:bg-[var(--lf-accent-14)]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs flex-1 truncate">{meta.label}</span>
                  <span className="text-xs font-semibold" style={{ color: meta.color }}>
                    {count.toLocaleString("th-TH")}
                  </span>
                  <span className="text-[10px] text-[var(--lf-text-muted)] w-10 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--lf-accent-26)] my-3" />

          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lf-text-muted)] mb-2">
            กำลังทำงานจริง
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_ORDER.map((activity) => {
              const color = ACTIVITY_COLORS[activity];
              const count = simTotals[activity];
              return (
                <span
                  key={activity}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: `${color}26`, color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {ACTIVITY_LABELS[activity]} {count.toLocaleString("th-TH")}
                </span>
              );
            })}
          </div>
        </div>

        {/* camera / quality controls — moved OUT of the top-right cluster: as
            edge content they competed with the centred title bar for the same
            pixels, and the rail is a scrolling column with slack to spare.
            Placed directly under the overview panel rather than lower down,
            because the building navigator's height changes with the site while
            these controls are clicked repeatedly — above the navigator they
            keep one stable position no matter how many buildings there are.
            A 2x2 grid of labelled buttons: the 16rem rail gives each cell
            ~7rem, which holds the longest Thai label at 10px without
            truncating, whereas a 4-across strip would only fit bare icons. */}
        <div className={`shrink-0 ${PANEL_CLASS} p-3 pointer-events-auto`}>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lf-text-muted)] mb-2">
            มุมกล้อง
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CAMERA_PRESETS.map(({ id, label, icon: Icon }) => {
              const isActive = cameraPreset === id;
              return (
                <button
                  key={id}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={isActive}
                  onClick={() => onCameraPresetChange(id)}
                  className={`min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-[10px] transition-colors text-left ${
                    isActive
                      ? "bg-[var(--lf-accent)] text-white"
                      : "bg-[var(--lf-box-bg)] text-[var(--lf-text-muted)] hover:bg-[var(--lf-accent-14)] hover:text-[var(--lf-text)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-semibold truncate">{label}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            title={highQuality ? "กราฟิกสูง" : "ประหยัด"}
            aria-label={highQuality ? "กราฟิกสูง" : "ประหยัด"}
            onClick={onToggleQuality}
            className={`mt-1.5 w-full min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-[10px] transition-colors text-left ${
              highQuality
                ? "bg-[var(--lf-accent-26)] text-[var(--lf-accent)] hover:bg-[var(--lf-panel-border)]"
                : "bg-[var(--lf-box-bg)] text-[var(--lf-text-muted)] hover:bg-[var(--lf-accent-14)] hover:text-[var(--lf-text)]"
            }`}
          >
            {highQuality ? (
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Zap className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="text-[10px] font-semibold truncate">
              {highQuality ? "กราฟิกสูง" : "ประหยัด"}
            </span>
          </button>
        </div>

        {/* building navigator — own panel inside the rail. It is the flexible
            child: it grows into spare height up to `max-h`, and it is the first
            thing to shrink when the rail runs short, so the KPI strip below can
            never be pushed out of the rail or covered. On a short container the
            cap tightens further via a container HEIGHT query. The cap is 10rem
            rather than 14rem because the camera panel above now takes ~8.5rem of
            the rail budget — it keeps the KPI strip on screen without scrolling
            on a tall container. */}
        {sortedBuildings.length > 0 && (
          <div
            className={`min-h-24 flex-1 max-h-40 [@container_(max-height:639px)]:max-h-32 flex flex-col overflow-hidden ${PANEL_CLASS} p-3 pointer-events-auto`}
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lf-text-muted)]">
                อาคารในไซต์
              </span>
              {focusBuildingId !== null && (
                <button
                  type="button"
                  onClick={() => onFocusBuilding(null)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lf-accent-26)] text-[var(--lf-accent)] hover:bg-[var(--lf-panel-border)] transition-colors"
                >
                  ดูทั้งไซต์
                </button>
              )}
            </div>
            <div
              className={`min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-0.5 ${HIDE_SCROLLBAR_CLASS}`}
            >
              {sortedBuildings.map((building) => {
                const meta = STATUS_META[building.worstStatus];
                const isActive = focusBuildingId === building.id;
                return (
                  <button
                    key={building.id}
                    type="button"
                    title={`${building.label} · ${building.machineCount.toLocaleString("th-TH")} เครื่อง · ${meta.label}`}
                    aria-pressed={isActive}
                    onClick={() => onFocusBuilding(isActive ? null : building.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[10px] transition-colors text-left ${
                      isActive
                        ? "bg-[var(--lf-accent-26)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
                        : "hover:bg-[var(--lf-accent-14)]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <Building2 className="w-3 h-3 shrink-0 text-[var(--lf-text-muted)]" />
                    <span className="text-xs flex-1 truncate">{building.label}</span>
                    <span className="text-[10px] text-[var(--lf-text-muted)] whitespace-nowrap">
                      {building.machineCount.toLocaleString("th-TH")} เครื่อง
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI strip — last child of the rail, `mt-auto` so it sits flush with
            the rail's bottom edge exactly where it used to be. On a container
            shorter than 640px the three secondary tiles (ชิ้นงานสะสม / อัตราผลิต /
            โหลดเฉลี่ย) drop out rather than letting anything overlap; their data is
            still summarised by the "กำลังทำงานจริง" chips in the overview panel. */}
        <div className="mt-auto shrink-0 grid grid-cols-2 gap-2 pointer-events-auto">
          <div className={`${PANEL_CLASS} p-3`}>
            <div className="text-[10px] text-[var(--lf-text-muted)] mb-1">พร้อมใช้งาน %</div>
            <div className="text-lg font-semibold" style={{ color: STATUS_META.normal.color }}>
              {readyRatePct !== null ? `${readyRatePct.toFixed(1)}%` : "—"}
            </div>
          </div>
          <div className={`${PANEL_CLASS} p-3`}>
            <div className="text-[10px] text-[var(--lf-text-muted)] mb-1">เฝ้าระวัง + เสีย</div>
            <div className="text-lg font-semibold" style={{ color: STATUS_META.error.color }}>
              {attentionCount.toLocaleString("th-TH")}
            </div>
          </div>
          <div className={`${PANEL_CLASS} p-3`}>
            <div className="text-[10px] text-[var(--lf-text-muted)] mb-1">งานซ่อมค้าง</div>
            <div className="text-lg font-semibold text-[var(--lf-accent)]">
              {openWorkOrders.toLocaleString("th-TH")}
            </div>
          </div>
          <div className={`${PANEL_CLASS} p-3`}>
            <div className="text-[10px] text-[var(--lf-text-muted)] mb-1">สุขภาพเฉลี่ย</div>
            <div className="text-lg font-semibold text-[var(--lf-text)]">
              {avgHealth !== null ? formatDecimal(avgHealth, 1) : "—"}
            </div>
          </div>
          <div className={`${PANEL_CLASS} p-3 min-w-0 [@container_(max-height:639px)]:hidden`}>
            <div className="text-[10px] text-[var(--lf-text-muted)] mb-1 truncate">ชิ้นงานสะสม</div>
            <div className="text-lg font-semibold text-[var(--lf-accent-soft)] truncate">
              {Math.trunc(simTotals.output).toLocaleString("th-TH")}
            </div>
          </div>
          <div className={`${PANEL_CLASS} p-3 min-w-0 [@container_(max-height:639px)]:hidden`}>
            <div className="text-[10px] text-[var(--lf-text-muted)] mb-1 truncate">อัตราผลิต</div>
            <div className="text-lg font-semibold text-[var(--lf-accent-soft)] truncate">
              {simTotals.throughputPerMin.toFixed(1)}
              <span className="text-[10px] font-normal text-[var(--lf-text-muted)] ml-1">ชิ้น/นาที</span>
            </div>
          </div>
          <div
            className={`${PANEL_CLASS} p-3 col-span-2 min-w-0 [@container_(max-height:639px)]:hidden`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--lf-text-muted)]">โหลดเฉลี่ย</span>
              <span className="text-[10px] font-semibold text-[var(--lf-text)]">
                {clampPct(simTotals.avgLoad * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--lf-box-bg)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--lf-accent)]"
                style={{ width: `${clampPct(simTotals.avgLoad * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* end left rail */}

      {/* COMPACT — building navigator chip row. The rail (with the desktop
          building list) is hidden while the CONTAINER is narrower than 640px,
          so below that this row is the only way to switch buildings. Sits just
          under the title bar and never reaches the bottom-right inspector
          card or the top-centre title bar. */}
      {sortedBuildings.length > 0 && (
        <div className="@min-[640px]:hidden absolute top-[88px] left-2 right-2 z-10 pointer-events-none">
          <div
            className={`flex items-center gap-1.5 overflow-x-auto pointer-events-auto py-0.5 ${HIDE_SCROLLBAR_CLASS}`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {focusBuildingId !== null && (
              <button
                type="button"
                aria-pressed={false}
                aria-label="ดูทั้งไซต์"
                title="ดูทั้งไซต์"
                onClick={() => onFocusBuilding(null)}
                className="shrink-0 min-h-9 flex items-center gap-1.5 px-3 py-2 rounded-full border backdrop-blur-md shadow-[0_4px_12px_-6px_var(--lf-panel-glow)] transition-colors bg-[var(--lf-accent-26)] border-[var(--lf-accent-80)] text-[var(--lf-accent)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
              >
                <span className="text-xs font-semibold whitespace-nowrap">ทั้งไซต์</span>
              </button>
            )}
            {sortedBuildings.map((building) => {
              const meta = STATUS_META[building.worstStatus];
              const isActive = focusBuildingId === building.id;
              return (
                <button
                  key={building.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${building.label} · ${building.machineCount.toLocaleString("th-TH")} เครื่อง · ${meta.label}`}
                  title={`${building.label} · ${building.machineCount.toLocaleString("th-TH")} เครื่อง · ${meta.label}`}
                  onClick={() => onFocusBuilding(isActive ? null : building.id)}
                  className={`shrink-0 min-h-9 flex items-center gap-1.5 px-3 py-2 rounded-full border backdrop-blur-md shadow-[0_4px_12px_-6px_var(--lf-panel-glow)] transition-colors ${
                    isActive
                      ? "bg-[var(--lf-accent-26)] border-[var(--lf-accent-80)] text-[var(--lf-accent)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
                      : "bg-[var(--lf-panel-bg)] border-[var(--lf-panel-border)] text-[var(--lf-text)]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs font-semibold max-w-[88px] truncate">
                    {building.label}
                  </span>
                  <span className="text-[10px] text-[var(--lf-text-muted)] whitespace-nowrap">
                    {building.machineCount.toLocaleString("th-TH")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPACT — camera presets + quality. Below COMPACT the rail that hosts
          these controls is hidden, so rather than lose two of the four camera
          angles they get their own horizontally scrollable row, in the same chip
          idiom as the building row and directly beneath it (offset drops to the
          building row's own slot when the site has no buildings to list). It is
          width-bounded by `left-2 right-2` so it cannot bleed, its bottom edge
          (~172px) stays far above the inspector card, and the action cluster
          above it ends at ~66px — so it cannot overlap either. */}
      <div
        className={`@min-[640px]:hidden absolute left-2 right-2 z-10 pointer-events-none ${
          sortedBuildings.length > 0 ? "top-[132px]" : "top-[88px]"
        }`}
      >
        <div
          className={`flex items-center gap-1.5 overflow-x-auto pointer-events-auto py-0.5 ${HIDE_SCROLLBAR_CLASS}`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {CAMERA_PRESETS.map(({ id, label, icon: Icon }) => {
            const isActive = cameraPreset === id;
            return (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={isActive}
                onClick={() => onCameraPresetChange(id)}
                className={`shrink-0 min-h-9 flex items-center gap-1.5 px-3 py-2 rounded-full border backdrop-blur-md shadow-[0_4px_12px_-6px_var(--lf-panel-glow)] transition-colors ${
                  isActive
                    ? "bg-[var(--lf-accent-26)] border-[var(--lf-accent-80)] text-[var(--lf-accent)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
                    : "bg-[var(--lf-panel-bg)] border-[var(--lf-panel-border)] text-[var(--lf-text)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            title={highQuality ? "กราฟิกสูง" : "ประหยัด"}
            aria-label={highQuality ? "กราฟิกสูง" : "ประหยัด"}
            onClick={onToggleQuality}
            className={`shrink-0 min-h-9 flex items-center gap-1.5 px-3 py-2 rounded-full border backdrop-blur-md shadow-[0_4px_12px_-6px_var(--lf-panel-glow)] transition-colors ${
              highQuality
                ? "bg-[var(--lf-accent-26)] border-[var(--lf-accent-80)] text-[var(--lf-accent)]"
                : "bg-[var(--lf-panel-bg)] border-[var(--lf-panel-border)] text-[var(--lf-text)]"
            }`}
          >
            {highQuality ? (
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Zap className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="text-xs font-semibold whitespace-nowrap">
              {highQuality ? "กราฟิกสูง" : "ประหยัด"}
            </span>
          </button>
        </div>
      </div>

      {/* TOP-CENTER — title bar. It is centred on the CONTAINER, so the only
          way it can never touch the left rail or the right action cluster is to
          reserve their lanes in CSS: `max-w-[calc(100%-45rem)]` keeps the bar
          inside a centred lane with 22.5rem (360px) clear on each side. That is
          88px more than the rail needs (272px) and 24px more than the cluster's
          21rem cap needs (336px), so no-overlap is geometric — it does not
          depend on how wide the Thai/branding text happens to measure, because
          `min-w-0` + `truncate` inside force the bar to honour the cap. Now
          that the camera presets have moved to the rail, one reserve covers
          every container width and the bar can return at 1024px (lane 304px,
          comfortably more than the branding + subtitle block needs). Below that
          a centred bar cannot coexist with the rail and the cluster, so it is
          hidden rather than allowed to collide — it is read-only decoration and
          no control lives in it. */}
      <div className="hidden @min-[1024px]:block absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-[calc(100%-45rem)] pointer-events-none">
        <div className={`${PANEL_CLASS} px-6 py-2.5 flex items-center gap-3 pointer-events-auto`}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--lf-accent)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--lf-accent)]" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] leading-tight truncate">
              MT CENTER LIVE FLOOR
            </div>
            <div className="text-[10px] text-[var(--lf-text-muted)] leading-tight truncate">
              ผังโรงงานเสมือน 4 มิติ · อัปเดตสด
            </div>
            <div className="text-[9px] text-[var(--lf-accent-soft)] leading-tight truncate">
              กำลังจำลองการเดินเครื่อง · {runningMachineCount.toLocaleString("th-TH")} เครื่องทำงาน
            </div>
          </div>
          {/* clock — only once the container is wide enough that the bar's own
              lane can hold it without truncating the branding line. Owns its
              own 1Hz tick (see `FloorClock`) so this timer no longer
              re-renders the whole HUD tree every second. */}
          <FloorClock />
        </div>
      </div>

      {/* TOP-RIGHT — action cluster. Every control here is visible at every
          CONTAINER size: the scale toggle, the fullscreen toggle (CSS-based, and
          it covers the dashboard's own mode toggle, so a touch user must always
          have a way out without a keyboard) and the exit button. The camera
          presets and the quality toggle used to live here and had to be hidden
          on anything but a very wide container, because as EDGE content they
          collided with the centred title bar; they now live in the left rail
          instead, which costs nothing and makes all four presets available from
          640px up. What is left is ~19rem wide, so the cap below is never
          reached in practice — it exists as the geometric guarantee: capped at
          21rem, the cluster's left edge is always >= 288px (clear of the rail's
          272px edge) and always >= 24px clear of the title bar's reserved lane.
          Labels truncate if the cap ever bites; the fullscreen and exit hit
          targets are shrink-0 and can never be squeezed. */}
      <div
        className={`absolute top-4 right-4 z-30 ${PANEL_CLASS} p-2 flex items-center gap-1.5 max-w-[calc(100%-2rem)] @min-[640px]:max-w-[min(calc(100%-19rem),21rem)] pointer-events-auto`}
      >
        {/* Scale toggle — the rail's preset grid sets an absolute camera
            angle; this pill is the one-tap way to swap between the two very
            different SCALES, and it is the only camera control that survives
            below COMPACT (where the rail is hidden). Visible at every CONTAINER
            size; its label collapses to the icon below COMPACT. */}
        <button
          type="button"
          title={scaleToggleLabel}
          aria-label={scaleToggleLabel}
          onClick={() => onCameraPresetChange(scaleTogglePreset)}
          className="flex min-w-0 items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full bg-[var(--lf-accent-26)] text-[var(--lf-accent)] hover:bg-[var(--lf-panel-border)] transition-colors pointer-events-auto"
        >
          {viewIsWide ? (
            <Boxes className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="text-xs font-semibold hidden @min-[640px]:inline truncate">
            {scaleToggleLabel}
          </span>
        </button>

        <button
          type="button"
          title={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
          aria-label={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
          onClick={onToggleFullscreen}
          className="shrink-0 p-2 rounded-full text-[var(--lf-text-muted)] hover:text-[var(--lf-text)] transition-colors pointer-events-auto"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          title="ออกจากโหมด 4D"
          aria-label="ออกจากโหมด 4D"
          onClick={onExit}
          className="flex min-w-0 items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full bg-[var(--lf-danger-26)] text-[var(--lf-danger)] hover:bg-[var(--lf-danger-40)] transition-colors ml-1 pointer-events-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs font-semibold hidden @min-[640px]:inline truncate">ออกจากโหมด 4D</span>
          <span className="text-xs font-semibold @min-[640px]:hidden shrink-0">ออก</span>
        </button>
      </div>

      {/* BOTTOM-CENTER — control hint. It used to be `whitespace-nowrap`, which
          made it far wider than a narrow container and pushed it under the
          frame's rounded border. It now wraps inside a lane capped to the
          CONTAINER (`max-w-[calc(100%-2rem)]`, plus a readable 44rem ceiling),
          and it is bottom-anchored so extra lines grow upward — never outside
          the frame. `z-0` keeps it under the rail and the inspector, and it is
          still pointer-transparent and still fades on the same 8s timer. */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-0 max-w-[calc(100%-2rem)] @min-[704px]:max-w-[44rem] transition-opacity duration-700 ${
          hintVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-[11px] text-[var(--lf-text-muted)] text-center px-3 py-1.5 rounded-full bg-[var(--lf-hint-bg)] backdrop-blur-sm text-balance">
          {/* Below COMPACT there is no left rail, so the full hint's advice to
              pick a building "ในแผงซ้าย" would point at nothing — the compact
              hint points at the chip row above instead, and drops the
              mouse-only gestures that a touch container cannot perform. */}
          <span className="@min-[640px]:hidden">
            ลากเพื่อหมุน · สกอร์ลเพื่อซูม · แตะเครื่องจักรเพื่อดูข้อมูล ·
            เลือกชื่ออาคารด้านบนเพื่อบินไปที่อาคารนั้น
          </span>
          <span className="hidden @min-[640px]:inline">
            ลากเพื่อหมุน · สกอร์ลเพื่อซูม · คลิกขวาลากเพื่อเลื่อน · คลิกเครื่องจักรเพื่อดูข้อมูล ·
            ดับเบิลคลิกเพื่อเปิดรายละเอียด · เลือกชื่ออาคารในแผงซ้ายเพื่อบินไปที่อาคารนั้น ·
            กด “ดูทั้งโรงงาน” เพื่อถอยออกดูผังรวมทั้งไซต์
          </span>
        </div>
      </div>

      {/* BOTTOM-RIGHT — selected machine inspector */}
      <AnimatePresence>
        {selectedMachine && selectedMeta && (
          <motion.div
            key={selectedMachine.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-4 right-4 z-30 w-72 ${PANEL_CLASS} p-4 pointer-events-auto`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold">
                  {selectedMachine.code ?? "—"}
                </div>
                <div className="text-xs text-[var(--lf-text-muted)] truncate max-w-[180px]">
                  {selectedMachine.name}
                </div>
              </div>
              <button
                type="button"
                title="ปิด"
                aria-label="ปิด"
                onClick={onClearSelection}
                className="p-1 rounded-full text-[var(--lf-text-muted)] hover:text-[var(--lf-text)] hover:bg-[var(--lf-accent-26)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-2"
              style={{
                backgroundColor: `${selectedMeta.color}26`,
                color: selectedMeta.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: selectedMeta.color }}
              />
              {selectedMeta.label}
            </span>

            {selectedMachine.activeErrorCode && (
              <div className="text-[11px] text-[var(--lf-danger)] bg-[var(--lf-danger-14)] rounded-[10px] px-2.5 py-1.5 mb-2">
                {selectedMachine.activeErrorCode}
                {selectedMachine.activeErrorDesc
                  ? ` · ${selectedMachine.activeErrorDesc}`
                  : ""}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[var(--lf-box-bg)] rounded-[10px] p-2">
                <div className="text-[9px] text-[var(--lf-text-muted)]">สุขภาพเครื่อง</div>
                <div className="text-sm font-semibold text-[var(--lf-text)]">
                  {formatDecimal(selectedMachine.healthScore, 1)}
                </div>
              </div>
              <div className="bg-[var(--lf-box-bg)] rounded-[10px] p-2">
                <div className="text-[9px] text-[var(--lf-text-muted)]">อุณหภูมิสปินเดิล</div>
                <div className="text-sm font-semibold text-[var(--lf-text)]">
                  {formatWithUnit(selectedMachine.spindleTemp, "°C", 1)}
                </div>
              </div>
              <div className="bg-[var(--lf-box-bg)] rounded-[10px] p-2">
                <div className="text-[9px] text-[var(--lf-text-muted)]">ความสั่นสะเทือน</div>
                <div className="text-sm font-semibold text-[var(--lf-text)]">
                  {formatWithUnit(selectedMachine.vibrationMms, "mm/s", 2)}
                </div>
              </div>
              <div className="bg-[var(--lf-box-bg)] rounded-[10px] p-2">
                <div className="text-[9px] text-[var(--lf-text-muted)]">พื้นที่/ไลน์</div>
                <div className="text-sm font-semibold text-[var(--lf-text)] truncate">
                  {selectedMachine.section ?? selectedMachine.location ?? "—"}
                </div>
              </div>
            </div>

            {selectedRuntime && (
              <div className="bg-[var(--lf-box-bg)] rounded-[10px] p-2.5 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${ACTIVITY_COLORS[selectedRuntime.activity]}26`,
                      color: ACTIVITY_COLORS[selectedRuntime.activity],
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: ACTIVITY_COLORS[selectedRuntime.activity] }}
                    />
                    {ACTIVITY_LABELS[selectedRuntime.activity]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[var(--lf-accent-soft)]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--lf-accent-soft)] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--lf-accent-soft)]" />
                    </span>
                    สด
                  </span>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-[9px] text-[var(--lf-text-muted)] mb-1">
                    <span>รอบการผลิต</span>
                    <span>รอบละ {formatDecimal(selectedRuntime.cycleSeconds, 1)} วิ</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--lf-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--lf-accent-soft)]"
                      style={{ width: `${clampPct(selectedRuntime.cycleProgress * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <div className="text-[9px] text-[var(--lf-text-muted)]">รอบ/นาที</div>
                    <div className="text-xs font-semibold text-[var(--lf-text)]">
                      {formatDecimal(selectedRuntime.spindleRpm, 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[var(--lf-text-muted)]">°C (สด)</div>
                    <div className="text-xs font-semibold text-[var(--lf-text)]">
                      {formatDecimal(selectedRuntime.tempC, 1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[var(--lf-text-muted)]">มม./วินาที (สด)</div>
                    <div className="text-xs font-semibold text-[var(--lf-text)]">
                      {formatDecimal(selectedRuntime.vibration, 2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenDetail(selectedMachine)}
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-full bg-[var(--lf-accent)] text-white hover:bg-[var(--lf-accent-hover)] transition-colors"
              >
                ดูรายละเอียดเต็ม
              </button>
              {onAskAI && (
                <button
                  type="button"
                  onClick={() =>
                    onAskAI(
                      `ช่วยวิเคราะห์เครื่องจักร ${selectedMachine.code ?? selectedMachine.name} ที่มีสถานะ${selectedMeta.label}ให้หน่อย`
                    )
                  }
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-[var(--lf-accent-26)] text-[var(--lf-accent)] hover:bg-[var(--lf-panel-border)] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  ให้ AI วิเคราะห์
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Memoized so a parent re-render that leaves every prop reference unchanged
 * (e.g. an unrelated sibling state update) skips reconciling this whole
 * heavy tree. Most props are event-handler callbacks and arrays that the
 * caller only recreates when their underlying data actually changes, so the
 * default shallow-prop comparator is safe here; `simSnapshot` legitimately
 * changes every simulation tick and will still trigger a re-render then, as
 * intended.
 */
export default memo(LiveFloorHUD);
