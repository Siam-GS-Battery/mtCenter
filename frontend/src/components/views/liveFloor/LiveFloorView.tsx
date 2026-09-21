import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, MonitorX, RotateCcw } from "lucide-react";
import { Machine, MachineStats, MachineStatus, WorkOrder } from "../../../types";
import { buildPlantLayout } from "../../../lib/plantLayout";
import { useInspectionAgent, type InspectionReport } from "../../../lib/inspectionAgent";
import PixelAILogo from "../../PixelAILogo";
import LiveFloorHUD, { type PlantZoneSummary } from "./LiveFloorHUD";
import { type MinimapCameraSample } from "./Minimap";
import InspectorPanel from "./InspectorPanel";
import InspectorRobot from "./InspectorRobot";
import { LIVE_FLOOR_THEME } from "./liveFloorTheme";
import FloorScene from "./scene/FloorScene";
import {
  REFERENCE_SITE_SIZE,
  isWideCameraPreset,
  type CameraFocusBox,
  type PlantCameraPreset,
} from "./scene/sceneConfig";

/**
 * CSS custom properties for the Live Floor dark palette, applied once on the
 * outermost container so both this file's own Tailwind arbitrary-value
 * classes and LiveFloorHUD's (a child, via CSS inheritance) can reference
 * `var(--lf-*)` instead of hardcoded hex literals. Tailwind v4 scans source
 * text at build time, so these must stay literal `var(--lf-*)` strings in
 * className — never template-interpolated.
 */
const LIVE_FLOOR_THEME_VARS = {
  "--lf-bg": LIVE_FLOOR_THEME.background,
  "--lf-border": `${LIVE_FLOOR_THEME.accent}33`,
  "--lf-panel-bg": LIVE_FLOOR_THEME.hud.panelBg,
  "--lf-panel-border": LIVE_FLOOR_THEME.hud.panelBorder,
  "--lf-panel-glow": LIVE_FLOOR_THEME.hud.panelGlow,
  "--lf-text": LIVE_FLOOR_THEME.hud.text,
  "--lf-text-muted": LIVE_FLOOR_THEME.hud.textMuted,
  "--lf-accent": LIVE_FLOOR_THEME.hud.accent,
  "--lf-accent-soft": LIVE_FLOOR_THEME.hud.accentSoft,
  "--lf-danger": LIVE_FLOOR_THEME.hud.danger,
  "--lf-warning": LIVE_FLOOR_THEME.status.warning,
  "--lf-maintenance": LIVE_FLOOR_THEME.status.maintenance,
  // Derived from `hud.accent` (not the top-level scene `accent`) so every
  // tint/ring/badge in the HUD stays consistent with the solid `--lf-accent`
  // text/icon colour it's paired with, regardless of what the scene's own
  // accent is tuned to.
  "--lf-accent-14": `${LIVE_FLOOR_THEME.hud.accent}1f`,
  "--lf-accent-26": `${LIVE_FLOOR_THEME.hud.accent}33`,
  "--lf-accent-80": `${LIVE_FLOOR_THEME.hud.accent}80`,
  "--lf-accent-hover": LIVE_FLOOR_THEME.hud.accentHover,
  "--lf-box-bg": LIVE_FLOOR_THEME.hud.boxBg,
  // `panelBg` is a translucent WHITE now (was translucent black), so the hint
  // pill needs a higher alpha floor to stay legible over the palest part of
  // the scene (the concrete floor) instead of the old 60% (`99`).
  "--lf-hint-bg": `${LIVE_FLOOR_THEME.hud.panelBg.slice(0, 7)}e6`,
  // Danger tints bumped up (8%/15%/25% -> 12%/24%/38%) — a rose wash this
  // faint was visible against black but reads as almost nothing on the new
  // white panels; the exit button in particular needs enough saturation to
  // still read as the danger action.
  "--lf-danger-14": `${LIVE_FLOOR_THEME.hud.danger}1f`,
  "--lf-danger-26": `${LIVE_FLOOR_THEME.hud.danger}3d`,
  "--lf-danger-40": `${LIVE_FLOOR_THEME.hud.danger}61`,
} as React.CSSProperties;

/**
 * error > warning > maintenance > normal — the zone navigator's "worst
 * status wins" triage order. Kept in sync with the identical map in
 * `LiveFloorHUD.tsx`; duplicated (not imported) because it is a two-line
 * constant and importing it would couple this file's zone-summarising logic
 * to the HUD's internal module layout for no real benefit.
 */
const STATUS_SEVERITY: Record<MachineStatus, number> = {
  error: 3,
  warning: 2,
  maintenance: 1,
  normal: 0,
};

export interface LiveFloorViewProps {
  machines: Machine[];
  /**
   * Aggregate machine counts from GET /api/machines/stats, same source of
   * truth the classic dashboard uses. `machines` here is the parent's own
   * (paginated, up to 1000 rows) list, so the HUD's "พร้อมใช้งาน %" KPI must
   * prefer this over counting `machines` directly to avoid drifting from the
   * dashboard's number. `null`/omitted falls back to counting `machines`.
   */
  machineStats?: MachineStats | null;
  workOrders: WorkOrder[];
  onOpenMachineDetail: (machine: Machine) => void;
  onExit: () => void;
  onAskAI?: (prompt: string) => void;
  /**
   * ปุ่ม "ให้ AI สรุป" บนการ์ดรายงานรอบตรวจของหุ่นยนต์ — เปิดแชต AI ด้านข้าง
   * ทันทีพร้อมสรุปผล (จำลอง) ของรอบนั้น ส่งต่อเข้า InspectorPanel เท่านั้น
   */
  onAskAIRoundSummary?: (report: InspectionReport) => void;
  /**
   * true while the machine-detail modal (owned by the parent dashboard) is
   * open. The old scene used this to hide floating `<Html>` name labels so
   * they wouldn't paint on top of the modal — the new reference-look kit
   * (`plantMachinesKit.js`) bakes machine names into plaque meshes instead of
   * DOM `<Html>` overlays, so there is nothing left in the scene that needs
   * hiding. Kept in the prop type only so the call site doesn't need editing.
   */
  detailOpen?: boolean;
}

/**
 * Cheap PRE-CHECK for WebGL support, on a throwaway 1x1 canvas that is never
 * mounted into the DOM. Wrapped in try/catch because some locked-down browsers
 * throw rather than return null from `getContext`.
 *
 * WHY A PROBE AT ALL, given the error boundary below: R3F 9.7 builds the
 * `THREE.WebGLRenderer` inside `Canvas`'s async `configure()` call, which is
 * awaited in a floating `run()` — a renderer-construction throw ("Error
 * creating WebGL context.") therefore surfaces as an unhandled promise
 * rejection, NOT as a React render error the boundary can catch. So the probe
 * stays as the gate for "this browser genuinely cannot do WebGL", while
 * `SceneErrorBoundary` covers render-time three.js crashes.
 *
 * CRITICAL: the probe context MUST be handed back. Browsers cap the number of
 * LIVE WebGL contexts per page (Chrome ~16) and only reclaim an abandoned one
 * on GC, which is not deterministic. Every probe that keeps its context
 * permanently burns one of the user's slots, so after enough toggles into and
 * out of 4D mode `getContext` starts returning null — and a perfectly capable
 * browser gets told it does not support 3D. `WEBGL_lose_context.loseContext()`
 * releases it immediately; the extension is optional, hence the guards.
 */
function detectWebGLSupport(): boolean {
  let canvas: HTMLCanvasElement | null = null;
  let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  try {
    canvas = document.createElement("canvas");
    // The probe never draws, so a 1-pixel drawing buffer is all the driver
    // needs to allocate (the canvas default is 300x150).
    canvas.width = 1;
    canvas.height = 1;
    gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return gl !== null;
  } catch {
    return false;
  } finally {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    // Drop every reference so both the context and the canvas are immediately
    // collectible instead of pinned by this frame's locals.
    gl = null;
    canvas = null;
  }
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

interface SceneErrorBoundaryProps {
  onExit: () => void;
  children: React.ReactNode;
}

/**
 * Local error boundary around the 3D scene. A three.js crash must not blank
 * the whole supervisor dashboard — it should fall back to a Thai error
 * panel with a way back to the classic view.
 */
class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[LiveFloorView] plant scene render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--lf-bg)]">
          <div className="max-w-sm text-center space-y-4 p-6 rounded-[18px] border border-[var(--lf-panel-border)] bg-[var(--lf-panel-bg)] backdrop-blur-md shadow-[0_8px_24px_-12px_var(--lf-panel-glow)]">
            <MonitorX className="w-10 h-10 text-[var(--lf-danger)] mx-auto" />
            <p className="text-sm text-[var(--lf-danger)] font-semibold">
              เกิดข้อผิดพลาดในการแสดงผลผังโรงงาน 4 มิติ
            </p>
            <p className="text-xs text-[var(--lf-text-muted)]">
              กรุณากลับไปยังมุมมองปกติ แล้วลองเข้าใช้งานอีกครั้ง
            </p>
            <button
              type="button"
              onClick={this.props.onExit}
              className="min-h-10 px-4 py-2 rounded-full bg-[var(--lf-accent)] hover:bg-[var(--lf-accent-hover)] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              กลับไปมุมมองปกติ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Shared shell of every non-scene state (light glass card, `--lf-*` colours
 * only). Tailwind v4 scans source text, so the class strings stay literal here
 * rather than being composed from variables.
 */
function FallbackCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--lf-bg)]">
      <div className="max-w-sm text-center space-y-4 p-6 rounded-[18px] border border-[var(--lf-panel-border)] bg-[var(--lf-panel-bg)] backdrop-blur-md shadow-[0_8px_24px_-12px_var(--lf-panel-glow)]">
        {children}
      </div>
    </div>
  );
}

/** Retry (primary) + back-to-classic-view (secondary), used by both panels. */
function FallbackActions({
  onRetry,
  onExit,
}: {
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onRetry}
        className="min-h-10 px-4 py-2 rounded-full bg-[var(--lf-accent)] hover:bg-[var(--lf-accent-hover)] text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        ลองอีกครั้ง
      </button>
      <button
        type="button"
        onClick={onExit}
        className="min-h-10 px-4 py-2 rounded-full border border-[var(--lf-panel-border)] hover:bg-[var(--lf-accent-14)] text-[var(--lf-text-muted)] text-xs font-semibold cursor-pointer active:scale-95 transition-all"
      >
        กลับไปมุมมองปกติ
      </button>
    </div>
  );
}

/**
 * Shown when the probe could not get a context. Deliberately does NOT claim the
 * browser lacks WebGL — by far the most common causes are a disabled GPU and a
 * hit context limit, both of which the supervisor can fix and then retry.
 */
function WebGLUnavailablePanel({
  onRetry,
  onExit,
}: {
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <FallbackCard>
      <MonitorX className="w-10 h-10 text-[var(--lf-warning)] mx-auto" />
      <p className="text-sm text-[var(--lf-warning)] font-semibold">
        เริ่มการแสดงผล 3 มิติไม่สำเร็จ
      </p>
      <ul className="text-xs text-[var(--lf-text-muted)] text-left space-y-2 list-disc pl-4">
        <li>
          การเร่งด้วยฮาร์ดแวร์ถูกปิดอยู่ — Chrome/Edge: ตั้งค่า → ระบบ → เปิด “ใช้การเร่งด้วยฮาร์ดแวร์เมื่อพร้อมใช้งาน”
          แล้วเปิดเบราว์เซอร์ใหม่ (ตรวจสถานะได้ที่ chrome://gpu)
        </li>
        <li>เปิดแท็บหรือหน้าต่างที่ใช้กราฟิก 3 มิติพร้อมกันมากเกินไป — ปิดบางส่วน แล้วกดลองอีกครั้ง</li>
      </ul>
      <FallbackActions onRetry={onRetry} onExit={onExit} />
    </FallbackCard>
  );
}

/**
 * Shown while the canvas' context is lost. The scene stays MOUNTED underneath
 * (see `PlantSceneShell`'s `onContextLost`/`onContextRestored`) so the
 * browser can still fire `webglcontextrestored` and rendering can resume
 * without rebuilding anything; retry is the manual escape hatch.
 */
function ContextLostPanel({
  onRetry,
  onExit,
}: {
  onRetry: () => void;
  onExit: () => void;
}) {
  return (
    <FallbackCard>
      <MonitorX className="w-10 h-10 text-[var(--lf-warning)] mx-auto" />
      <p className="text-sm text-[var(--lf-warning)] font-semibold">
        การแสดงผลหยุดชั่วคราว
      </p>
      <p className="text-xs text-[var(--lf-text-muted)]">
        เบราว์เซอร์คืนหน่วยความจำกราฟิกไป มักเกิดเมื่อเปิดงาน 3 มิติพร้อมกันหลายหน้าต่าง ระบบจะกู้คืนให้เองเมื่อพร้อม
        หรือกดลองอีกครั้งเพื่อเริ่มใหม่ทันที
      </p>
      <FallbackActions onRetry={onRetry} onExit={onExit} />
    </FallbackCard>
  );
}

function SceneLoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--lf-bg)]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[var(--lf-accent)] mx-auto animate-spin" />
        <p className="text-xs text-[var(--lf-accent)] font-semibold tracking-wide">
          กำลังเรนเดอร์ผังโรงงาน 4 มิติ…
        </p>
      </div>
    </div>
  );
}

export default function LiveFloorView({
  machines,
  machineStats,
  workOrders,
  onOpenMachineDetail,
  onExit,
  onAskAI,
  onAskAIRoundSummary,
  // Unused — see the prop's own doc comment. Kept so the call site (which
  // passes it based on the parent's own modal state) doesn't need editing.
  detailOpen: _detailOpen = false,
}: LiveFloorViewProps) {
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "all">("all");
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /**
   * โหมด Agent (POC): เปิดแล้วจะมีหุ่นยนต์เดินไล่ตรวจเครื่องจักรในผัง และมี
   * พาเนลแชตรายงานด้านขวา ปิดไว้เป็นค่าเริ่มต้นเพราะโหมดปกติของหน้านี้คือ
   * "ดูผังโรงงาน" — และเมื่อปิด ตัวหุ่นจะไม่ถูก mount เลย ฉากจึงไม่มี
   * useFrame ส่วนเกินวิ่งอยู่
   */
  const [inspectorMode, setInspectorMode] = useState(false);
  /**
   * true = พาเนลคำสั่ง/แชตรายงานกำลังแสดงอยู่ แยกจาก `inspectorMode` โดย
   * เจตนา: ผู้ใช้ต้องซ่อนพาเนลได้โดยไม่หยุดหุ่น (หุ่นยังเดินตรวจต่อเบื้องหลัง)
   * ปิดหุ่นจริงต้องกดปุ่ม "ปิดหุ่นยนต์" ในพาเนล ซึ่งเรียก handleStopInspector
   */
  const [inspectorPanelOpen, setInspectorPanelOpen] = useState(false);

  /**
   * "เปิดหลังคา" — ซ่อนแผ่นหลังคาอาคารไลน์ผลิต เหลือแต่โครงถัก
   *
   * ค่าเริ่มต้นเป็น true (เปิด) เหมือนพฤติกรรมเดิม แต่ตอนนี้ผู้ใช้สลับเองได้
   * ผ่านปุ่มไอคอนตาใน HUD (ดู handleToggleRoof)
   */
  const [roofOpen, setRoofOpen] = useState(true);
  /**
   * true = กล้องเกาะติดตัวหุ่นไปตลอด (เปิดอัตโนมัติเมื่อคลิกที่ตัวหุ่นในฉาก)
   *
   * `PlantSceneShell` now exposes a `followPoint` callback the CameraRig reads
   * every frame (see that file) -- the callback below reads the inspector
   * agent's own live (mutable, never-reallocated) `snapshot()` object rather
   * than the React `inspectorSnapshot` state, so the camera tracks the robot
   * smoothly every frame instead of only re-centring on the ~250ms cadence
   * the HUD's own re-render happens at.
   */
  const [inspectorFollow, setInspectorFollow] = useState(false);

  /** ค่าเริ่มต้น "line" (ซูมเข้าไลน์) — เหมือนพฤติกรรมเดิมก่อนถูกรื้อออก */
  const [cameraPreset, setCameraPreset] = useState<PlantCameraPreset>("line");
  /** false = "ประหยัด" (ปิดเงา + ลด dpr ceiling) */
  const [highQuality, setHighQuality] = useState(true);
  /** โซนที่ผู้ใช้เลือกจากตัวนำทางอาคาร/โซน — null = มุมมองเริ่มต้นของพรีเซ็ต */
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null);
  /** true = canvas เพิ่งแจ้ง `webglcontextlost` และยังไม่ได้ `webglcontextrestored` */
  const [contextLost, setContextLost] = useState(false);

  // Bumped by "ลองอีกครั้ง" to bust the memoised probe result: a context limit
  // that was temporarily full, or a GPU process that has since restarted, must
  // not be a permanent verdict for the rest of the session.
  const [probeNonce, setProbeNonce] = useState(0);
  // Bumped by the same button to force a FRESH scene mount (and to reset
  // `SceneErrorBoundary`, which is keyed on it).
  const [sceneNonce, setSceneNonce] = useState(0);

  const webglSupported = useMemo(() => {
    void probeNonce;
    return detectWebGLSupport();
  }, [probeNonce]);

  // Built HERE, not inside the Canvas, so the scene, the HUD and the
  // inspector agent all share ONE instance — this build runs exactly once per
  // `machines` change.
  const plantLayout = useMemo(() => buildPlantLayout(machines), [machines]);

  // O(1) id -> Machine lookup for PlantMachines' pick callbacks, which report
  // a bare machine id (see PlantMachines.tsx's picking scheme for both the
  // detailed and far-tier draw paths) rather than a whole Machine object.
  const machineById = useMemo(() => {
    const map = new Map<string, Machine>();
    for (const m of machines) map.set(m.id, m);
    return map;
  }, [machines]);

  /**
   * ตัวนำทางอาคาร/โซน — ข้อจำกัดของผังใหม่: ก่อนหน้านี้ `FloorLayout.buildings`
   * เป็นอาคาร/โรงหลายหลังแยกกัน แต่ละหลังมีเครื่องจักรของตัวเอง ผังใหม่
   * (`PlantLayout.site`, จาก `plantSite.ts`) มีเครื่องจักรอยู่ใน "โซนการผลิต"
   * เดียว 8 โซน (WH/FRG-A/FRG-B/HT-1..4/LINES) ภายในโรงหลังเดียว ส่วน
   * `site.buildings` (TRAINING CENTER, OFFICE/STORE, GUARD HOUSE, ...) เป็น
   * อาคารบริหาร/สนับสนุนรอบไซต์ที่ไม่เคยมีเครื่องจักรอยู่เลย — จึงไม่มีอะไร
   * ให้นำทางไปหา (นับเครื่อง/สถานะ) อย่างมีความหมาย
   *
   * ตัวนำทางนี้จึงผูกกับ 8 โซนการผลิตแทน (เฉพาะโซนที่มีเครื่องจักรอยู่จริง —
   * โซนว่างถูกข้ามเพราะไม่มีอะไรให้บินไปดู) ให้ผลลัพธ์เทียบเท่าของเดิม: รายชื่อ
   * พื้นที่ + จำนวนเครื่อง + สถานะแย่สุด + บินกล้องไปยังพื้นที่นั้น
   */
  const zoneSummaries = useMemo<PlantZoneSummary[]>(() => {
    const machinesByZone = new Map<string, Machine[]>();
    for (const pm of plantLayout.machines) {
      const list = machinesByZone.get(pm.zoneId);
      if (list) list.push(pm.machine);
      else machinesByZone.set(pm.zoneId, [pm.machine]);
    }
    const summaries: PlantZoneSummary[] = [];
    for (const zone of plantLayout.site.zones) {
      const zoneMachines = machinesByZone.get(zone.id);
      if (!zoneMachines || zoneMachines.length === 0) continue;
      let worstStatus: MachineStatus = "normal";
      for (const m of zoneMachines) {
        if (STATUS_SEVERITY[m.status] > STATUS_SEVERITY[worstStatus]) worstStatus = m.status;
      }
      summaries.push({
        id: zone.id,
        name: zone.name,
        x: zone.x,
        z: zone.z,
        width: zone.w,
        depth: zone.d,
        machineCount: zoneMachines.length,
        worstStatus,
      });
    }
    return summaries;
  }, [plantLayout]);

  const focusZone = useMemo(
    () => (focusZoneId ? zoneSummaries.find((z) => z.id === focusZoneId) ?? null : null),
    [focusZoneId, zoneSummaries]
  );

  // ponytail: ตัวคูณ/ขั้นต่ำของกล่องโฟกัสเครื่องจักรที่เลือก — จูนได้ตรงนี้จุดเดียว
  const SELECTED_MACHINE_FOCUS_PADDING = 2.2;
  const SELECTED_MACHINE_FOCUS_MIN_SIZE = 10;

  const selectedMachineFocusBox = useMemo<CameraFocusBox | null>(() => {
    if (!selectedMachineId) return null;
    const placed = plantLayout.machines.find((m) => m.id === selectedMachineId);
    if (!placed) return null;
    const size = Math.max(
      placed.width,
      placed.depth,
      SELECTED_MACHINE_FOCUS_MIN_SIZE / SELECTED_MACHINE_FOCUS_PADDING
    );
    return {
      x: placed.x,
      z: placed.z,
      width: size * SELECTED_MACHINE_FOCUS_PADDING,
      depth: size * SELECTED_MACHINE_FOCUS_PADDING,
    };
  }, [selectedMachineId, plantLayout]);

  // เครื่องจักรที่เลือกมาก่อน zone ที่นำทางไว้เสมอ — เลือกเครื่องแล้วต้องบิน
  // เข้าไปหาเครื่องนั้น ไม่ใช่ค้างที่กรอบ zone เดิม กลับไปกรอบ zone (หรือ null)
  // เมื่อเคลียร์การเลือก (Escape/handleClearSelection)
  const focusBox = useMemo<CameraFocusBox | null>(
    () =>
      selectedMachineFocusBox ??
      (focusZone
        ? { x: focusZone.x, z: focusZone.z, width: focusZone.width, depth: focusZone.depth }
        : null),
    [selectedMachineFocusBox, focusZone]
  );

  // ตัวกรองสถานะใน HUD ซ่อน/แสดงเฉพาะ "เครื่องจักร" — เปลือกอาคาร โซน และ
  // ไซต์ภายนอกที่ `PlantShell` วาดไม่ขึ้นกับสถานะของเครื่องตัวใดตัวหนึ่ง จึง
  // narrow แค่รายการเครื่อง ส่วนที่เหลือของผังส่งไปเต็ม
  const layoutForScene = useMemo(() => {
    if (statusFilter === "all") return plantLayout;
    return {
      ...plantLayout,
      machines: plantLayout.machines.filter((m) => m.machine.status === statusFilter),
    };
  }, [plantLayout, statusFilter]);

  // Post-scaling site footprint for PlantSceneShell (fog density, camera
  // placement, ground/apron sizing, shadow-camera box): the reference site is
  // 190x170 m at the reference hall's 94.3x74.3 m.
  //
  // IMPORTANT: `plantLayout.ts#buildPlantLayout` (and `plantSite.ts#scaleSiteTo`,
  // which it calls) grow the hall/site with INDEPENDENT per-axis factors —
  // `sx` (width) and `sz` (depth) — not a single uniform scalar, precisely
  // because a real DB-driven floor plan is rarely square (see
  // `plantLayout.ts`'s "A single uniform scalar ... forces the SHORT axis to
  // balloon" comment on `sx`/`sz`). `scale.factor` is only the LARGER of the
  // two, kept around as an informational summary (and for the couple of
  // legacy call sites that still position things against one scalar) — using
  // it here for BOTH axes reintroduces the exact bug that comment warns
  // about, one level up: it stretches whichever axis is smaller far beyond
  // what `PlantEnvironment`'s actual (per-axis-scaled) geometry occupies.
  //
  // For the real ~973-machine dataset this is not a cosmetic mismatch: sx
  // ≈ 3.75, sz ≈ 11.81 (hall grows to 353x878 m), so the old uniform
  // `scale.factor` (11.81) applied to BOTH axes produced a fictitious
  // 2244x2008 m "site" — 3.2x the real site's diagonal. Every proportional
  // quantity `PlantSceneShell`/`plantSceneConfig.ts` derives from
  // siteWidth/siteDepth (fog density, camera position/target, zoom limits,
  // ground/apron size, shadow frustum) was computed for that phantom site
  // instead of the real one, which put the initial camera literally beyond
  // its own look-at target by nearly 2x `CAMERA_FAR` — see
  // `plantSceneConfig.ts`'s `computeCameraFar` doc comment for the rest of
  // that story. Re-deriving `sx`/`sz` here (same formula `scaleSiteTo` used)
  // keeps this in lock-step with whatever `PlantEnvironment` actually drew.
  const siteWidthScaleX = plantLayout.scale.hall.w / plantLayout.scale.referenceHall.w;
  const siteDepthScaleZ = plantLayout.scale.hall.d / plantLayout.scale.referenceHall.d;
  const siteWidth = REFERENCE_SITE_SIZE[0] * siteWidthScaleX;
  const siteDepth = REFERENCE_SITE_SIZE[1] * siteDepthScaleZ;

  // หุ่นยนต์ตรวจสายการผลิต: วางแผนเส้นทางจากผังจริง (DB) ล้วนๆ ไม่ผูกกับ
  // สถานะ filter ของ HUD — ผังเก่ามีการจำลองการเดินเครื่อง (`floorSimulation.ts`)
  // ที่หุ่นเคยอ่านค่า "สด" จากมัน ผังใหม่ไม่มีการจำลองนั้นแล้ว หุ่นจึงอ่าน
  // อุณหภูมิ/ความสั่นจากฟิลด์จริงของเครื่องในฐานข้อมูลโดยตรง (ดู
  // lib/inspectionAgent.ts's evaluate())
  const { agent: inspector, snapshot: inspectorSnapshot } = useInspectionAgent(plantLayout, {
    hz: 4,
  });

  // Real CSS-based fullscreen (not the browser Fullscreen API) so it keeps
  // working inside the app shell. Lock body scroll while active and always
  // restore it — both on toggle-off and on unmount.
  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Modal.tsx already handles Escape for whichever dialog is on top of
      // its own stack. Without this guard, one Escape press both closes the
      // shared machine-detail modal AND clears the 3D selection / exits
      // fullscreen underneath it.
      if (document.querySelector("[role=dialog]")) return;
      if (isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      setSelectedMachineId(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  /**
   * เลือก/เปิดเครื่องจักรจากการคลิกในฉาก
   *
   * `MachineInstances` raycast โดน instance ไหนก็ส่ง machine id ดิบตัวนั้น
   * กลับมา แล้วที่นี่แปลงเป็น Machine ผ่าน `machineById`
   *   • คลิกหนึ่งครั้ง = ไฮไลต์ในฉาก + ขึ้นการ์ดรายละเอียดใน HUD
   *   • ดับเบิลคลิก = เด้ง modal รายละเอียด/ประวัติของ dashboard
   */
  const handleSelectMachine = useCallback(
    (machineId: string) => {
      setSelectedMachineId(machineId);
      // ผู้ใช้กำลังดูมุมกว้าง (plant/top) แล้วกดเลือกเครื่อง — ต้องสลับมามุม
      // "line" ก่อน ไม่งั้น computePlacement จะเมิน focusBox ทิ้ง (ดู
      // isWideCameraPreset) กล้องเลยไม่ซูมเข้าอย่างที่ผู้ใช้เห็น ไม่แตะมุมที่
      // ไม่ใช่มุมกว้างอยู่แล้ว (เช่น "eye" ที่ผู้ใช้ตั้งใจเลือกเอง)
      if (isWideCameraPreset(cameraPreset)) setCameraPreset("line");
    },
    [cameraPreset]
  );

  const handleOpenMachine = useCallback(
    (machineId: string) => {
      setSelectedMachineId(machineId);
      if (isWideCameraPreset(cameraPreset)) setCameraPreset("line");
      const machine = machineById.get(machineId);
      if (machine) onOpenMachineDetail(machine);
    },
    [machineById, onOpenMachineDetail, cameraPreset]
  );

  const handleOpenDetail = useCallback(
    (machine: Machine) => {
      onOpenMachineDetail(machine);
    },
    [onOpenMachineDetail]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedMachineId(null);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  const handleToggleQuality = useCallback(() => {
    setHighQuality((q) => !q);
  }, []);

  const handleToggleRoof = useCallback(() => {
    setRoofOpen((open) => !open);
  }, []);

  /** เลือกโซนจากตัวนำทาง (หรือ null = "ดูทั้งไซต์"/กลับพรีเซ็ตปกติ). */
  const handleFocusZone = useCallback((zoneId: string | null) => {
    setFocusZoneId(zoneId);
  }, []);

  /**
   * The canvas lost its context (`PlantSceneShell`'s `onContextLost`). The
   * scene stays mounted (so the browser's own restore can still land), we
   * just cover it with the Thai notice + retry.
   */
  const handleContextLost = useCallback(() => {
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
  }, []);

  /**
   * "ลองอีกครั้ง": re-probe (busting the memo) AND remount the scene from
   * scratch, which also resets `SceneErrorBoundary`. Unmounting the old
   * `<Canvas>` is what actually frees its context, so a retry that happens
   * because the limit was full has a slot to claim.
   */
  const handleRetry = useCallback(() => {
    setContextLost(false);
    setProbeNonce((n) => n + 1);
    setSceneNonce((n) => n + 1);
  }, []);

  /**
   * เปิดโหมด Agent (mount หุ่น + เปิดพาเนล) หรือ "ซ่อน" พาเนลเฉยๆ — การซ่อนไม่
   * หยุดรอบตรวจ หุ่นยังเดินต่อเบื้องหลัง ผู้ใช้กดปุ่มลอยเพื่อเรียกพาเนลกลับมา
   * ดูได้ทุกเมื่อ ปิดหุ่นจริงต้องใช้ handleStopInspector
   */
  const handleToggleInspector = useCallback(() => {
    setInspectorMode((on) => {
      if (on) {
        // พาเนลเปิดอยู่แล้ว → ปุ่มนี้แปลว่า "ซ่อน" ไม่ใช่ปิดหุ่น
        setInspectorPanelOpen(false);
        return on;
      }
      setInspectorPanelOpen(true);
      return true;
    });
  }, []);

  /**
   * ปิดหุ่นยนต์จริง: หยุดรอบตรวจ, เลิกกล้องตาม, เลิก mount ตัวหุ่น และซ่อน
   * พาเนล (บันทึก/รายงานเดิมยังอยู่ เปิดกลับมาแล้วดูรายงานรอบก่อนได้)
   */
  const handleStopInspector = useCallback(() => {
    inspector.stop();
    setInspectorFollow(false);
    setInspectorPanelOpen(false);
    setInspectorMode(false);
  }, [inspector]);

  /**
   * ซ่อนพาเนลเฉยๆ โดยไม่แตะหุ่น (ใช้จากปุ่ม "ซ่อน" ในพาเนล)
   */
  const handleHideInspectorPanel = useCallback(() => {
    setInspectorPanelOpen(false);
  }, []);

  /**
   * เรียกพาเนลกลับมาแสดง ใช้กับปุ่มลอย "หุ่นยนต์กำลังตรวจ" ตอนหุ่นวิ่งอยู่
   * แต่พาเนลถูกซ่อนไว้ (handleToggleInspector ใช้ไม่ได้ตรงนี้ เพราะมันจะตี
   * ความว่าเปิดอยู่แล้ว = สั่งซ่อนซ้ำ กลายเป็นกดแล้วไม่มีอะไรเกิดขึ้น)
   */
  const handleReopenInspectorPanel = useCallback(() => {
    setInspectorPanelOpen(true);
  }, []);

  /**
   * คลิกที่ตัวหุ่นในฉาก = "จับตัวหุ่น": เปิดพาเนลรายงานถ้ายังปิดอยู่ แล้วให้
   * กล้องเกาะติดตัวมันไป คลิกซ้ำที่ตัวเดิม (หรือกดปุ่มในพาเนล) เป็นการปล่อย
   */
  const handleSelectInspector = useCallback(() => {
    setInspectorMode(true);
    setInspectorPanelOpen(true);
    setInspectorFollow((following) => !following);
  }, []);

  const handleToggleFollow = useCallback(() => {
    setInspectorFollow((following) => !following);
  }, []);

  const selectedMachine = selectedMachineId ? machineById.get(selectedMachineId) ?? null : null;

  /**
   * Passed to `PlantSceneShell`'s `followPoint` prop, which its internal
   * CameraRig calls every animation frame (see that component's own doc
   * comment). Reads `inspector.snapshot()` -- the agent's own mutable,
   * never-reallocated snapshot object -- directly, NOT the `inspectorSnapshot`
   * React state above (which only updates at the hook's 4 Hz React-render
   * cadence): a per-frame follow has to see the robot's position at 60 Hz,
   * same as `InspectorRobot.tsx` reads it for the mesh transform itself.
   */
  const inspectorFollowPoint = useCallback(() => {
    if (!inspectorFollow) return null;
    const snap = inspector.snapshot();
    return { x: snap.x, z: snap.z };
  }, [inspectorFollow, inspector]);

  /**
   * ผังย่อ (`Minimap.tsx`, roadmap step 5) — ตำแหน่ง/ทิศ/มุมมอง/ระยะกล้องสด ๆ
   *
   * เก็บเป็น mutable ref เดียวกันตลอดอายุ component (ไม่ใช่ React state):
   * `FloorScene`'s `CameraRig` เขียนทับ 6 ตัวเลขนี้ทุกเฟรมผ่าน
   * `handleCameraFrame` ด้านล่าง แล้ว `Minimap` เองอ่านมันด้วย
   * requestAnimationFrame loop ของตัวเอง (ดูคอมเมนต์ที่ไฟล์นั้น) — ทั้งคู่ไม่
   * เคยเรียก setState เลย จึงไม่มีการ re-render ของ HUD/ผังย่อ 60 ครั้งต่อวินาที
   */
  const cameraTrackRef = useRef<MinimapCameraSample>({
    x: 0,
    z: 0,
    dirX: 0,
    dirZ: 1,
    halfFovDeg: 0,
    distance: 0,
  });
  const handleCameraFrame = useCallback(
    (x: number, z: number, dirX: number, dirZ: number, halfFovDeg: number, distance: number) => {
      const sample = cameraTrackRef.current;
      sample.x = x;
      sample.z = z;
      sample.dirX = dirX;
      sample.dirZ = dirZ;
      sample.halfFovDeg = halfFovDeg;
      sample.distance = distance;
    },
    []
  );

  /**
   * `container-type: size` makes THIS box the query container for the HUD.
   * The HUD floats over the canvas inside a dashboard column that is often far
   * narrower than the viewport, so viewport breakpoints (`md:`) would claim
   * "desktop" in a 300px-wide box. Container queries (`@min-[640px]:` for the
   * inline axis, `@container (max-height: …)` for the block axis) ask the box
   * itself instead. `size` rather than `inline-size` because the HUD's left
   * rail also needs the HEIGHT to decide how many KPI tiles fit; both axes are
   * definite here (`h-screen` / `h-[68vh] min-h-[520px]`), so size containment
   * cannot collapse the box. Declared on this element — the shared ancestor of
   * both the canvas and the HUD — so the HUD panels' `backdrop-blur` still
   * samples the 3D scene behind them.
   *
   * Height: this view replaces the entire classic dashboard body (KPI cards,
   * charts, registry) when active — SupervisorDashboardView renders nothing
   * else below it in `floor4d` mode — so instead of a fixed `68vh` guess that
   * left a lot of unused white space under it on tall screens, it fills the
   * viewport down to its own top offset. That offset is the sum of the app
   * shell's sticky header (`h-14` = 56px, see App.tsx), the page's own
   * top+bottom padding (`p-4 md:p-8` = 32px/64px), the mode-switch header row
   * above this view (~60px including its bottom border), and the `space-y-6`
   * gap before this element (24px) — ~236px on desktop, a bit less on mobile
   * where the calc simply leaves a little more slack. `min-h` keeps a 1366x768
   * laptop (768 - 236 = 532px) usable without the container collapsing.
   */
  const containerClassName = isFullscreen
    ? "fixed inset-0 z-50 h-screen rounded-none overflow-hidden bg-[var(--lf-bg)] border border-[var(--lf-border)] [container-type:size]"
    : "relative w-full h-[calc(100vh-236px)] min-h-[560px] overflow-hidden rounded-[18px] border border-[var(--lf-border)] bg-[var(--lf-bg)] [container-type:size]";

  return (
    <div
      className={isFullscreen ? "fixed inset-0 z-50" : "relative w-full"}
      style={LIVE_FLOOR_THEME_VARS}
    >
      <div className={containerClassName}>
        {webglSupported ? (
          <>
            {/* Keyed on `sceneNonce` so "ลองอีกครั้ง" fully unmounts the old
                Canvas (R3F then releases its context) and clears any latched
                error-boundary state before the fresh mount. */}
            <SceneErrorBoundary key={sceneNonce} onExit={onExit}>
              <Suspense fallback={<SceneLoadingFallback />}>
                <FloorScene
                  layout={layoutForScene}
                  selectedMachineId={selectedMachineId}
                  onSelectMachine={handleSelectMachine}
                  onOpenMachine={handleOpenMachine}
                  siteWidth={siteWidth}
                  siteDepth={siteDepth}
                  cameraPreset={cameraPreset}
                  focusBox={focusBox}
                  followPoint={inspectorFollowPoint}
                  onCameraFrame={handleCameraFrame}
                  highQuality={highQuality}
                  roofOpen={roofOpen}
                  onContextLost={handleContextLost}
                  onContextRestored={handleContextRestored}
                >
                  {inspectorMode ? (
                    <InspectorRobot
                      agent={inspector}
                      active={inspectorMode}
                      selected={inspectorFollow}
                      onSelect={handleSelectInspector}
                    />
                  ) : null}
                </FloorScene>
              </Suspense>
            </SceneErrorBoundary>
            {contextLost ? <ContextLostPanel onRetry={handleRetry} onExit={onExit} /> : null}
          </>
        ) : (
          <WebGLUnavailablePanel onRetry={handleRetry} onExit={onExit} />
        )}

        <LiveFloorHUD
          machines={machines}
          machineStats={machineStats}
          workOrders={workOrders}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          cameraPreset={cameraPreset}
          onCameraPresetChange={setCameraPreset}
          highQuality={highQuality}
          onToggleQuality={handleToggleQuality}
          roofOpen={roofOpen}
          onToggleRoof={handleToggleRoof}
          zones={zoneSummaries}
          focusZoneId={focusZoneId}
          onFocusZone={handleFocusZone}
          selectedMachine={selectedMachine}
          onOpenDetail={handleOpenDetail}
          onClearSelection={handleClearSelection}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onExit={onExit}
          onAskAI={onAskAI}
          minimapLayout={plantLayout}
          cameraTrackRef={cameraTrackRef}
          minimapEnabled={webglSupported}
        />

        {/* โหมด Agent — ปุ่มเปิด และพาเนลแชตรายงาน ใช้จุดยึดเดียวกัน
            (ใต้แถบควบคุมกล้องมุมขวาบน) จึงไม่ทับพาเนลไหนของ HUD */}
        {inspectorMode && inspectorPanelOpen ? (
          <InspectorPanel
            agent={inspector}
            snapshot={inspectorSnapshot}
            onAskAI={onAskAI}
            onAskAIRoundSummary={onAskAIRoundSummary}
            follow={inspectorFollow}
            onToggleFollow={handleToggleFollow}
            onClose={handleHideInspectorPanel}
            onStop={handleStopInspector}
          />
        ) : (
          <button
            type="button"
            onClick={inspectorMode ? handleReopenInspectorPanel : handleToggleInspector}
            className="absolute right-4 top-[76px] z-40 flex items-center gap-2 rounded-[14px] border border-[var(--lf-panel-border)] bg-[var(--lf-panel-bg)] px-3 py-2 text-[11.5px] font-bold text-[var(--lf-text)] shadow-[0_8px_24px_-12px_var(--lf-panel-glow)] backdrop-blur-md hover:bg-[var(--lf-accent-14)] transition-colors pointer-events-auto"
          >
            <PixelAILogo className="w-4 h-4 text-[var(--lf-accent)]" />
            {inspectorMode ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lf-accent)] animate-pulse" />
                หุ่นยนต์กำลังตรวจ
              </span>
            ) : (
              "หุ่นยนต์เดินตรวจ"
            )}
          </button>
        )}

      </div>
    </div>
  );
}
