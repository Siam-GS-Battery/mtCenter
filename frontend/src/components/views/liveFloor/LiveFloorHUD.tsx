import { memo, useEffect, useMemo, useState, type CSSProperties, type ReactElement } from "react";
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
import type { PlantLayout } from "../../../lib/plantLayout";
import { machineStatusLabel } from "../../../lib/pillStyles";
import { formatDecimal, formatWithUnit } from "../../../lib/format";
import { computeReadyRate, deriveMachineCounts } from "../../../lib/machineAvailability";
import { LIVE_FLOOR_THEME } from "./liveFloorTheme";
import Minimap, { type MinimapCameraSample } from "./Minimap";
import { isWideCameraPreset, type PlantCameraPreset } from "./scene/sceneConfig";

/**
 * One production zone (`PlantLayout.site.zones`) that holds at least one
 * machine, summarised for the building/zone navigator. See `LiveFloorView.tsx`'s
 * `zoneSummaries` doc comment for why this replaces the pre-swap
 * `FloorBuilding[]` navigator: the new site model has ONE hall with 8 named
 * production zones inside it (WH/FRG-A/FRG-B/HT-1..4/LINES), not several
 * separate multi-hall buildings — the site's OTHER `buildings` (training
 * centre, offices, guard house, ...) are administrative structures that never
 * hold machines, so there is nothing meaningful to navigate to on them.
 */
export interface PlantZoneSummary {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  machineCount: number;
  worstStatus: MachineStatus;
}

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
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExit: () => void; // back to the classic dashboard
  onAskAI?: (prompt: string) => void;
  cameraPreset: PlantCameraPreset;
  onCameraPresetChange: (next: PlantCameraPreset) => void;
  highQuality: boolean;
  onToggleQuality: () => void;
  /** every populated production zone on the site, for the building/zone navigator */
  zones: PlantZoneSummary[];
  /** currently focused zone; null = whole-site/preset-default view */
  focusZoneId: string | null;
  /** pick a zone to fly to, or null to return to the preset's default view */
  onFocusZone: (zoneId: string | null) => void;
  /**
   * ผังโรงงานจริงสำหรับผังย่อ (`Minimap.tsx`, roadmap step 5) — โซน,
   * เครื่องจักร, ขอบเขตไซต์ ผ่านตรงมาจาก `LiveFloorView.tsx`'s `plantLayout`
   */
  minimapLayout: PlantLayout;
  /** ตำแหน่ง/ทิศ/มุมมอง/ระยะกล้องสด ๆ — mutable ref ที่ `FloorScene.tsx`'s
   *  `CameraRig` เขียนทับทุกเฟรม (ไม่ผ่าน React state) ให้ `Minimap` อ่านเอง
   *  ด้วย requestAnimationFrame loop ของมัน */
  cameraTrackRef: React.RefObject<MinimapCameraSample>;
  /** false เมื่อ WebGL ใช้ไม่ได้ (ไม่มี `<FloorScene>`/`CameraRig` mount เลย) —
   *  ผังย่อต้องไม่ mount ตอนนั้น ไม่งั้น requestAnimationFrame loop ของมันจะวน
   *  เขียนค่ากล้องค้าง (0,0) ไปเรื่อย ๆ อยู่เบื้องหลังแผง WebGLUnavailablePanel
   *  โดยไม่มีประโยชน์อะไร */
  minimapEnabled: boolean;
}

/* ------------------------------------------------------------------ */
/* Shared status metadata — single source for colour + Thai label     */
/* ------------------------------------------------------------------ */

const STATUS_ORDER: MachineStatus[] = ["normal", "warning", "error", "maintenance"];

/** error > warning > maintenance > normal — the zone navigator's triage order. */
const STATUS_SEVERITY: Record<MachineStatus, number> = {
  error: 3,
  warning: 2,
  maintenance: 1,
  normal: 0,
};

const CAMERA_PRESETS: Array<{ id: PlantCameraPreset; label: string; icon: typeof Eye }> = [
  { id: "line", label: "ซูมเข้าไลน์", icon: Boxes },
  { id: "plant", label: "ดูทั้งโรงงาน", icon: Building2 },
  { id: "top", label: "มุมบนสุด", icon: LayoutGrid },
  { id: "eye", label: "ระดับสายตา", icon: Eye },
];

/**
 * `color` = the MUTED tone (`LIVE_FLOOR_THEME.status.*`) — used for all text,
 * counts, and badge fills/dots, where it must stay legible on the light
 * frosted panel. `lit` = the SATURATED "lamp lit" tone
 * (`LIVE_FLOOR_THEME.stackLight.*Lit`) — the same colour the scene actually
 * paints onto the physical stack-light lamp and the floating status marker
 * (see `scene/MachineInstances.tsx` / `stackLightColorOf()`). Reading
 * `LIVE_FLOOR_THEME.stackLight.*` directly here (not `scene/palette.ts`)
 * follows the existing import pattern of this file — it only ever pulls raw
 * values from `liveFloorTheme.ts`, never from `scene/`.
 *
 * `lit` is used ONLY for the small legend/status-row glyph fill
 * (`StatusShapeGlyph`), so that glyph's hue matches what the user sees
 * floating over the machines — that match is the entire point of the legend.
 * Contrast of each `lit` fill against the panel background (`#ffffffe6`,
 * effectively white) computed via WCAG relative luminance:
 *   normal (green #1fbf74):  ~2.40:1
 *   warning (yellow #ffb020): ~1.83:1
 *   error (red #e8453c):     ~3.93:1
 *   maintenance (blue #2f8fe0): ~3.43:1
 * Green and warning fall short of the 3:1 non-text-contrast guideline on
 * their own — that is why `StatusShapeGlyph` always rings every shape in the
 * corresponding MUTED `color` (1px solid): the ring carries the legibility
 * (edge definition against white), the fill carries the hue-match. None of
 * the four is so low-contrast that the ring can't rescue it, so no status
 * falls back to the muted fill.
 */
const STATUS_META: Record<MachineStatus, { color: string; lit: string; label: string }> = {
  normal: {
    color: LIVE_FLOOR_THEME.status.normal,
    lit: LIVE_FLOOR_THEME.stackLight.greenLit,
    label: machineStatusLabel("normal"),
  },
  warning: {
    color: LIVE_FLOOR_THEME.status.warning,
    lit: LIVE_FLOOR_THEME.stackLight.yellowLit,
    label: machineStatusLabel("warning"),
  },
  error: {
    color: LIVE_FLOOR_THEME.status.error,
    lit: LIVE_FLOOR_THEME.stackLight.redLit,
    label: machineStatusLabel("error"),
  },
  maintenance: {
    color: LIVE_FLOOR_THEME.status.maintenance,
    lit: LIVE_FLOOR_THEME.stackLight.blueLit,
    label: machineStatusLabel("maintenance"),
  },
};

/**
 * Shape carried by each status's floating marker above the machine in the 3D
 * scene — kept in sync with the mapping the scene side (MachineInstances.tsx
 * / `createMarkerGeometry`) builds its markers from: normal→sphere,
 * warning→tetrahedron, error→box, maintenance→octahedron. RESOLVED
 * cross-agent note: this used to say "warning→cone" (stale) and the glyph
 * fill used to read the MUTED `status` colour while the scene marker used the
 * new saturated `stackLight.*Lit` colour, so the legend didn't match what it
 * was explaining — see the `lit` field on `STATUS_META` above and
 * `StatusShapeGlyph` below for the fix. This file does not touch `scene/`,
 * so if the marker geometry mapping ever changes again the shape kinds below
 * need a matching follow-up edit here.
 */
type StatusShapeKind = "circle" | "triangle" | "square" | "diamond";

const STATUS_SHAPE: Record<MachineStatus, StatusShapeKind> = {
  normal: "circle",
  warning: "triangle",
  error: "square",
  maintenance: "diamond",
};

/** Thai name of each shape, for title/aria-label text — not the glyph itself. */
const STATUS_SHAPE_NAME_TH: Record<MachineStatus, string> = {
  normal: "วงกลม",
  warning: "สามเหลี่ยม",
  error: "สี่เหลี่ยม",
  maintenance: "สี่เหลี่ยมข้าวหลามตัด",
};

/**
 * Short, code-backed gloss of what each status means for availability — not
 * invented copy. Sourced from `computeReadyRate` (machineAvailability.ts),
 * which folds `normal` + `warning` into "พร้อมใช้งาน %" and excludes `error`
 * and `maintenance`; the "เตือนแต่ยังทำงานได้" phrasing for `warning` mirrors
 * that function's own doc comment.
 */
const STATUS_GLOSS: Record<MachineStatus, string> = {
  normal: "นับเป็นเครื่องพร้อมใช้งาน",
  warning: "เตือนแต่ยังทำงานได้ นับเป็นเครื่องพร้อมใช้งาน",
  error: "ไม่นับเป็นเครื่องพร้อมใช้งาน",
  maintenance: "ไม่นับเป็นเครื่องพร้อมใช้งาน อยู่ระหว่างซ่อมบำรุง",
};

/**
 * Small CSS-drawn glyph matching the floating marker shape AND colour for a
 * status — deliberately not an emoji/unicode glyph (font coverage on this app
 * is not guaranteed), so each shape is a styled `<span>`. Fill is the
 * saturated `lit` tone (matches the scene marker's hue exactly); a thin 1px
 * ring in the muted `color` tone keeps the shape's edge defined against the
 * light frosted panel even where the lit fill alone has weak contrast (see
 * the contrast figures in the `STATUS_META` doc comment above). Colours
 * always come from `STATUS_META`, never a hardcoded hex. `size` is the box
 * the shape is drawn inside, in px.
 */
function StatusShapeGlyph({
  status,
  size = 10,
  className = "",
  "aria-label": ariaLabel,
}: {
  status: MachineStatus;
  size?: number;
  className?: string;
  "aria-label"?: string;
}): ReactElement {
  const { color: ring, lit: fill } = STATUS_META[status];
  const shape = STATUS_SHAPE[status];
  const commonStyle: CSSProperties = { width: size, height: size };
  // hidden from the accessibility tree only when no explicit label is given —
  // callers that pass aria-label want the shape announced (e.g. the legend).
  const a11yProps = ariaLabel ? { role: "img" as const, "aria-label": ariaLabel } : { "aria-hidden": true as const };

  if (shape === "circle") {
    return (
      <span
        {...a11yProps}
        className={`inline-block rounded-full shrink-0 ${className}`}
        style={{ ...commonStyle, backgroundColor: fill, border: `1px solid ${ring}` }}
      />
    );
  }
  if (shape === "square") {
    return (
      <span
        {...a11yProps}
        className={`inline-block rounded-xs shrink-0 ${className}`}
        style={{ ...commonStyle, backgroundColor: fill, border: `1px solid ${ring}` }}
      />
    );
  }
  if (shape === "diamond") {
    return (
      <span
        {...a11yProps}
        className={`inline-block rounded-[1px] shrink-0 ${className}`}
        style={{
          ...commonStyle,
          backgroundColor: fill,
          border: `1px solid ${ring}`,
          transform: "rotate(45deg)",
        }}
      />
    );
  }
  // triangle — two stacked CSS border-triangles (a slightly larger muted one
  // behind, a slightly smaller lit one on top) fake the 1px ring, since a
  // border-trick triangle has no box to put a real CSS `border` on.
  return (
    <span
      {...a11yProps}
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${ring}`,
        }}
      />
      <span
        className="absolute"
        style={{
          top: 1,
          left: 1,
          width: 0,
          height: 0,
          borderLeft: `${size / 2 - 1}px solid transparent`,
          borderRight: `${size / 2 - 1}px solid transparent`,
          borderBottom: `${size - 1}px solid ${fill}`,
        }}
      />
    </span>
  );
}

const PANEL_CLASS =
  "bg-[var(--lf-panel-bg)] backdrop-blur-md border border-[var(--lf-panel-border)] rounded-[18px] shadow-[0_8px_24px_-12px_var(--lf-panel-glow)] text-[var(--lf-text)]";

/**
 * Scrollbar-hiding pattern shared by the left rail and its status list — the
 * HUD floats over a 3D scene, so a native scrollbar gutter would read as a
 * rendering artefact.
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
 * alongside a heavy 3D canvas). Markup and Thai formatting are byte-identical
 * to the inline block this replaced.
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
    isFullscreen,
    onToggleFullscreen,
    onExit,
    onAskAI,
    cameraPreset,
    onCameraPresetChange,
    highQuality,
    onToggleQuality,
    zones,
    focusZoneId,
    onFocusZone,
    minimapLayout,
    cameraTrackRef,
    minimapEnabled,
  } = props;

  const hintVisible = useFadeAfter(8000);
  /** "สัญลักษณ์สถานะเครื่องจักร" gloss row — collapsed by default so the panel
      stays a compact stat list; expands into the shape/colour/meaning legend
      that matches the markers floating over machines in the 3D scene. */
  const [legendOpen, setLegendOpen] = useState(false);

  /** Worst-status first, then the busiest zone — the supervisor's triage order. */
  const sortedZones = useMemo(
    () =>
      [...zones].sort((a, b) => {
        const severity = STATUS_SEVERITY[b.worstStatus] - STATUS_SEVERITY[a.worstStatus];
        if (severity !== 0) return severity;
        return b.machineCount - a.machineCount;
      }),
    [zones]
  );

  const viewIsWide = isWideCameraPreset(cameraPreset);
  const scaleTogglePreset: PlantCameraPreset = viewIsWide ? "line" : "plant";
  const scaleToggleLabel = viewIsWide ? "ซูมเข้าไลน์" : "ดูทั้งโรงงาน";

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

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* LEFT RAIL — ONE vertical column holding the overview panel and the KPI
          strip, so they can never overlap each other at any container size.
          Anchored top-to-bottom and gated on the CONTAINER's inline size (the
          4D canvas often sits in a dashboard column far narrower than the
          viewport, so viewport breakpoints lie). The rail itself scrolls when
          the content outgrows the height budget; the KPI strip is pushed to
          the bottom by `mt-auto` whenever there is slack. */}
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
                  title={`${meta.label} · สัญลักษณ์บนเครื่องจักร: ${STATUS_SHAPE_NAME_TH[status]}สี${meta.label}`}
                  onClick={() => onStatusFilterChange(isActive ? "all" : status)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[10px] transition-colors text-left ${
                    isActive
                      ? "bg-[var(--lf-accent-26)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
                      : "hover:bg-[var(--lf-accent-14)]"
                  }`}
                >
                  <StatusShapeGlyph
                    status={status}
                    aria-label={`สัญลักษณ์สถานะ ${meta.label}`}
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

          {/* คำอธิบายสัญลักษณ์ — collapsible so the panel stays a compact stat
              list by default; expands to spell out shape+colour+meaning for
              each status, matching the markers floating over machines in the
              3D scene (see STATUS_SHAPE doc comment above). */}
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            aria-expanded={legendOpen}
            className="w-full mt-2 pt-2 border-t border-[var(--lf-panel-border)] flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-[var(--lf-text-muted)] hover:text-[var(--lf-text)] transition-colors"
          >
            <span>คำอธิบายสัญลักษณ์สถานะ</span>
            <span aria-hidden="true">{legendOpen ? "▴" : "▾"}</span>
          </button>
          {legendOpen && (
            <div className="mt-1.5 space-y-1.5">
              {STATUS_ORDER.map((status) => {
                const meta = STATUS_META[status];
                return (
                  <div key={status} className="flex items-start gap-2 px-2 py-1">
                    <span
                      title={`สัญลักษณ์: ${STATUS_SHAPE_NAME_TH[status]} สี${meta.label}`}
                      aria-label={`สัญลักษณ์: ${STATUS_SHAPE_NAME_TH[status]} สี${meta.label}`}
                      className="mt-0.5"
                    >
                      <StatusShapeGlyph status={status} size={11} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold" style={{ color: meta.color }}>
                        {meta.label}
                      </div>
                      <div className="text-[10px] text-[var(--lf-text-muted)] leading-snug">
                        {STATUS_GLOSS[status]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* camera / quality controls — moved OUT of the top-right cluster: as
            edge content they competed with the centred title bar for the same
            pixels, and the rail is a scrolling column with slack to spare. A
            2x2 grid of labelled buttons: the 16rem rail gives each cell ~7rem,
            which holds the longest Thai label at 10px without truncating. */}
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

        {/* building/zone navigator — own panel inside the rail. It is the
            flexible child: grows into spare height up to `max-h`, and is the
            first thing to shrink when the rail runs short, so the KPI strip
            below can never be pushed out of the rail or covered. */}
        {sortedZones.length > 0 && (
          <div
            className={`min-h-24 flex-1 max-h-40 [@container_(max-height:639px)]:max-h-32 flex flex-col overflow-hidden ${PANEL_CLASS} p-3 pointer-events-auto`}
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lf-text-muted)]">
                โซนการผลิตในไซต์
              </span>
              {focusZoneId !== null && (
                <button
                  type="button"
                  onClick={() => onFocusZone(null)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lf-accent-26)] text-[var(--lf-accent)] hover:bg-[var(--lf-panel-border)] transition-colors"
                >
                  ดูทั้งไซต์
                </button>
              )}
            </div>
            <div
              className={`min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-0.5 ${HIDE_SCROLLBAR_CLASS}`}
            >
              {sortedZones.map((zone) => {
                const meta = STATUS_META[zone.worstStatus];
                const isActive = focusZoneId === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    title={`${zone.name} · ${zone.machineCount.toLocaleString("th-TH")} เครื่อง · ${meta.label}`}
                    aria-pressed={isActive}
                    onClick={() => onFocusZone(isActive ? null : zone.id)}
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
                    <span className="text-xs flex-1 truncate">{zone.name}</span>
                    <span className="text-[10px] text-[var(--lf-text-muted)] whitespace-nowrap">
                      {zone.machineCount.toLocaleString("th-TH")} เครื่อง
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* KPI strip — last child of the rail, `mt-auto` so it sits flush with
            the rail's bottom edge. Every tile here is real DB data. */}
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
        </div>
      </div>
      {/* end left rail */}

      {/* COMPACT — building/zone navigator chip row. The rail (with the
          desktop zone list) is hidden while the CONTAINER is narrower than
          640px, so below that this row is the only way to switch zones. Sits
          just under the title bar and never reaches the bottom-right
          inspector card or the top-centre title bar. */}
      {sortedZones.length > 0 && (
        <div className="@min-[640px]:hidden absolute top-[88px] left-2 right-2 z-10 pointer-events-none">
          <div
            className={`flex items-center gap-1.5 overflow-x-auto pointer-events-auto py-0.5 ${HIDE_SCROLLBAR_CLASS}`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {focusZoneId !== null && (
              <button
                type="button"
                aria-pressed={false}
                aria-label="ดูทั้งไซต์"
                title="ดูทั้งไซต์"
                onClick={() => onFocusZone(null)}
                className="shrink-0 min-h-9 flex items-center gap-1.5 px-3 py-2 rounded-full border backdrop-blur-md shadow-[0_4px_12px_-6px_var(--lf-panel-glow)] transition-colors bg-[var(--lf-accent-26)] border-[var(--lf-accent-80)] text-[var(--lf-accent)] ring-2 ring-inset ring-[var(--lf-accent-80)]"
              >
                <span className="text-xs font-semibold whitespace-nowrap">ทั้งไซต์</span>
              </button>
            )}
            {sortedZones.map((zone) => {
              const meta = STATUS_META[zone.worstStatus];
              const isActive = focusZoneId === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${zone.name} · ${zone.machineCount.toLocaleString("th-TH")} เครื่อง · ${meta.label}`}
                  title={`${zone.name} · ${zone.machineCount.toLocaleString("th-TH")} เครื่อง · ${meta.label}`}
                  onClick={() => onFocusZone(isActive ? null : zone.id)}
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
                  <span className="text-xs font-semibold max-w-[88px] truncate">{zone.name}</span>
                  <span className="text-[10px] text-[var(--lf-text-muted)] whitespace-nowrap">
                    {zone.machineCount.toLocaleString("th-TH")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPACT — camera presets + quality. Below COMPACT the rail that hosts
          these controls is hidden, so rather than lose two of the four camera
          angles they get their own horizontally scrollable row, in the same
          chip idiom as the zone row and directly beneath it (offset drops to
          the zone row's own slot when the site has no populated zones). */}
      <div
        className={`@min-[640px]:hidden absolute left-2 right-2 z-10 pointer-events-none ${
          sortedZones.length > 0 ? "top-[132px]" : "top-[88px]"
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
          way it can never touch the left rail or the right action cluster is
          to reserve their lanes in CSS: `max-w-[calc(100%-45rem)]` keeps the
          bar inside a centred lane with 22.5rem (360px) clear on each side.
          Below 1024px a centred bar cannot coexist with the rail and the
          cluster, so it is hidden rather than allowed to collide — it is
          read-only decoration and no control lives in it. */}
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
          </div>
          {/* clock — only once the container is wide enough that the bar's own
              lane can hold it without truncating the branding line. Owns its
              own 1Hz tick (see `FloorClock`) so this timer no longer
              re-renders the whole HUD tree every second. */}
          <FloorClock />
        </div>
      </div>

      {/* TOP-RIGHT — action cluster: the scale toggle, fullscreen toggle
          (CSS-based, and it covers the dashboard's own mode toggle, so a
          touch user must always have a way out without a keyboard) and the
          exit button. */}
      <div
        className={`absolute top-4 right-4 z-30 ${PANEL_CLASS} p-2 flex items-center gap-1.5 max-w-[calc(100%-2rem)] @min-[640px]:max-w-[min(calc(100%-19rem),21rem)] pointer-events-auto`}
      >
        {/* Scale toggle — the rail's preset grid sets an absolute camera
            angle; this pill is the one-tap way to swap between the two very
            different SCALES, and it is the only camera control that survives
            below COMPACT (where the rail is hidden). */}
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
              pick a zone "ในแผงซ้าย" would point at nothing — the compact
              hint points at the chip row above instead. */}
          <span className="@min-[640px]:hidden">
            ลากเพื่อหมุน · สกอร์ลเพื่อซูม · แตะเครื่องจักรเพื่อดูข้อมูล ·
            เลือกชื่อโซนด้านบนเพื่อบินไปที่โซนนั้น
          </span>
          <span className="hidden @min-[640px]:inline">
            ลากเพื่อหมุน · สกอร์ลเพื่อซูม · คลิกขวาลากเพื่อเลื่อน · คลิกเครื่องจักรเพื่อดูข้อมูล ·
            ดับเบิลคลิกเพื่อเปิดรายละเอียด · เลือกชื่อโซนในแผงซ้ายเพื่อบินไปที่โซนนั้น
          </span>
        </div>
      </div>

      {/* BOTTOM-RIGHT — selected machine inspector + ผังย่อ (roadmap step 5)
          รวมกันเป็น flex stack เดียว (แทนที่จะ absolute-position ผังย่อแยก
          แล้วเดาความสูงการ์ดผู้ตรวจสอบด้วยเลขพิกเซลตายตัว — การ์ดนี้สูงไม่คงที่
          จริง เนื้อหา activeErrorCode/activeErrorDesc ยาวได้ ตัวเลขตายตัวจะ
          ผิดพลาดได้ในบางกรณี) `flex-col-reverse` + DOM order [การ์ด, ผังย่อ]
          ทำให้การ์ดชิดขอบล่างเสมอ (bottom-4 ของ container) และผังย่อวางซ้อน
          ขึ้นไปด้านบนโดยอัตโนมัติไม่ว่าการ์ดจะสูงแค่ไหน — ไม่มีการ์ด (ไม่ได้
          เลือกเครื่อง) ผังย่อก็เลื่อนลงมาชิดขอบล่างเองเพราะเป็น flex child
          เดียวที่เหลือ ไม่ต้องมีตัวแปร/พร็อพ "มีการ์ดอยู่ไหม" คอยติดตามเลย */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col-reverse items-end gap-3 max-w-[calc(100%-2rem)] pointer-events-none">
        <AnimatePresence>
          {selectedMachine && selectedMeta && (
            <motion.div
              key={selectedMachine.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className={`w-72 ${PANEL_CLASS} p-4 pointer-events-auto`}
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
        {minimapEnabled && (
          <Minimap
            layout={minimapLayout}
            statusFilter={statusFilter}
            zones={zones}
            focusZoneId={focusZoneId}
            onFocusZone={onFocusZone}
            cameraTrackRef={cameraTrackRef}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Memoized so a parent re-render that leaves every prop reference unchanged
 * (e.g. an unrelated sibling state update) skips reconciling this whole
 * heavy tree. Every prop is now either an event-handler callback or data that
 * only changes when the underlying DB data actually changes (no simulation
 * snapshot ticking every frame any more), so the default shallow-prop
 * comparator is a good fit here.
 */
export default memo(LiveFloorHUD);
