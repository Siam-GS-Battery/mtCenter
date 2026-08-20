import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Loader2, MonitorX, RotateCcw } from "lucide-react";
import { Machine, MachineStatus, WorkOrder } from "../../../types";
import { buildFloorLayout } from "../../../lib/floorLayout";
import { useFloorSimulation } from "../../../lib/floorSimulation";
import { useInspectionAgent } from "../../../lib/inspectionAgent";
import PixelAILogo from "../../PixelAILogo";
import LiveFloorHUD, { FloorCameraPreset } from "./LiveFloorHUD";
import InspectorPanel from "./InspectorPanel";
import { LIVE_FLOOR_THEME } from "./liveFloorTheme";

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

const LiveFloor4DScene = React.lazy(() => import("./LiveFloor4DScene"));

export interface LiveFloorViewProps {
  machines: Machine[];
  workOrders: WorkOrder[];
  onOpenMachineDetail: (machine: Machine) => void;
  onExit: () => void;
  onAskAI?: (prompt: string) => void;
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
 * `SceneErrorBoundary` covers render-time three.js crashes and the canvas'
 * own `webglcontextlost` covers a context dying mid-session.
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
    console.error("[LiveFloor4DScene] render error", error, info);
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
 * so the browser can still fire `webglcontextrestored` and we can resume
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
        การแสดงผล 3 มิติหยุดทำงานชั่วคราว
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
  workOrders,
  onOpenMachineDetail,
  onExit,
  onAskAI,
}: LiveFloorViewProps) {
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "all">("all");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  // Default to the close production-line view: at the whole-plant fit distance
  // the machines are a few pixels tall and none of the archetype detail or
  // animation reads. "ดูทั้งโรงงาน" in the HUD switches to the plant overview.
  const [cameraPreset, setCameraPreset] = useState<FloorCameraPreset>("line");
  const [highQuality, setHighQuality] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // null = no explicit pick; the scene falls back to `layout.focusBuildingId`.
  const [focusBuildingId, setFocusBuildingId] = useState<string | null>(null);
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
   * true = กล้องเกาะติดตัวหุ่นไปตลอด (เปิดอัตโนมัติเมื่อคลิกที่ตัวหุ่นในฉาก)
   * โหมดนี้ขยับเฉพาะ "จุดที่กล้องเล็ง" ไปพร้อมหุ่น ไม่ยึดมุม/ระยะซูมที่ผู้ใช้
   * ตั้งไว้ — จะหมุนดูรอบตัวหุ่นระหว่างที่มันเดินอยู่ก็ยังได้
   */
  const [inspectorFollow, setInspectorFollow] = useState(false);

  // Bumped by "ลองอีกครั้ง" to bust the memoised probe result: a context limit
  // that was temporarily full, or a GPU process that has since restarted, must
  // not be a permanent verdict for the rest of the session.
  const [probeNonce, setProbeNonce] = useState(0);
  // Bumped by the same button to force a FRESH scene mount (and to reset
  // `SceneErrorBoundary`, which is keyed on it).
  const [sceneNonce, setSceneNonce] = useState(0);
  const [contextLost, setContextLost] = useState(false);

  const webglSupported = useMemo(() => {
    void probeNonce;
    return detectWebGLSupport();
  }, [probeNonce]);

  // Built HERE, not inside the Canvas, so the scene and the HUD's building
  // navigator share ONE instance — `buildFloorLayout` runs exactly once per
  // `machines` change and the scene's internal fallback stays unused.
  const layout = useMemo(() => buildFloorLayout(machines), [machines]);

  // The 3D scene steps the simulation itself (once mounted) from its own
  // render loop; this hook only re-renders HUD consumers at `hz` — it never
  // steps on its own.
  const { sim, snapshot } = useFloorSimulation(machines, { hz: 2, autoStep: false });

  // หุ่นยนต์ตรวจสายการผลิต: ฉากเป็นผู้ก้าวเวลาให้ (เหมือน `sim`) hook นี้แค่
  // รีเฟรช snapshot ให้พาเนลแชตที่ 4Hz — อ่านค่าเซนเซอร์จาก `sim` ตัวเดียวกับ
  // ที่ฉากใช้ ผลตรวจจึงตรงกับสิ่งที่ผู้ชมเห็นวิ่งอยู่บนจอ
  const { agent: inspector, snapshot: inspectorSnapshot } = useInspectionAgent(layout, sim, {
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
      setSelectedMachine(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleSelectMachine = useCallback((machine: Machine) => {
    setSelectedMachine(machine);
  }, []);

  const handleOpenMachine = useCallback(
    (machine: Machine) => {
      setSelectedMachine(machine);
      onOpenMachineDetail(machine);
    },
    [onOpenMachineDetail]
  );

  const handleOpenDetail = useCallback(
    (machine: Machine) => {
      onOpenMachineDetail(machine);
    },
    [onOpenMachineDetail]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedMachine(null);
  }, []);

  const handleToggleQuality = useCallback(() => {
    setHighQuality((q) => !q);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  /**
   * The canvas lost its context. The scene stays mounted (so the browser's own
   * restore can still land), we just cover it with a Thai notice + retry.
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
   * Building navigator: picking a building flies the near view into it, and
   * clearing the pick ("ดูทั้งไซต์" / clicking the active row) pulls back out to
   * the whole-site overview.
   */
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

  const handleFocusBuilding = useCallback((buildingId: string | null) => {
    setFocusBuildingId(buildingId);
    setCameraPreset(buildingId === null ? "plant" : "line");
  }, []);

  const selectedRuntime = selectedMachine
    ? snapshot.runtimes.get(selectedMachine.id) ?? null
    : null;

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
                <LiveFloor4DScene
                  machines={machines}
                  statusFilter={statusFilter}
                  selectedMachineId={selectedMachine?.id ?? null}
                  onSelectMachine={handleSelectMachine}
                  onOpenMachine={handleOpenMachine}
                  cameraPreset={cameraPreset}
                  highQuality={highQuality}
                  simulation={sim}
                  focusBuildingId={focusBuildingId}
                  layout={layout}
                  inspector={inspector}
                  inspectorActive={inspectorMode}
                  inspectorFollow={inspectorFollow}
                  onSelectInspector={handleSelectInspector}
                  onContextLost={handleContextLost}
                  onContextRestored={handleContextRestored}
                />
              </Suspense>
            </SceneErrorBoundary>
            {contextLost ? (
              <ContextLostPanel onRetry={handleRetry} onExit={onExit} />
            ) : null}
          </>
        ) : (
          <WebGLUnavailablePanel onRetry={handleRetry} onExit={onExit} />
        )}

        <LiveFloorHUD
          machines={machines}
          workOrders={workOrders}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedMachine={selectedMachine}
          onOpenDetail={handleOpenDetail}
          onClearSelection={handleClearSelection}
          cameraPreset={cameraPreset}
          onCameraPresetChange={setCameraPreset}
          highQuality={highQuality}
          onToggleQuality={handleToggleQuality}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onExit={onExit}
          onAskAI={onAskAI}
          simSnapshot={snapshot}
          selectedRuntime={selectedRuntime}
          buildings={layout.buildings}
          focusBuildingId={focusBuildingId}
          onFocusBuilding={handleFocusBuilding}
        />

        {/* โหมด Agent — ปุ่มเปิด และพาเนลแชตรายงาน ใช้จุดยึดเดียวกัน
            (ใต้แถบควบคุมกล้องมุมขวาบน) จึงไม่ทับพาเนลไหนของ HUD */}
        {inspectorMode && inspectorPanelOpen ? (
          <InspectorPanel
            agent={inspector}
            snapshot={inspectorSnapshot}
            onAskAI={onAskAI}
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
