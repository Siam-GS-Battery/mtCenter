import { useEffect, useMemo, useRef, type ReactElement } from "react";
import type { MachineStatus } from "../../../types";
import type { PlantLayout } from "../../../lib/plantLayout";
import type { PlantZoneSummary } from "./LiveFloorHUD";
import { statusColorOf } from "./scene/palette";

/**
 * ===========================================================================
 * MINIMAP — ผังย่อมุมจอ (roadmap step 5)
 * ===========================================================================
 *
 * PRE-CHECK done before writing this file: grepped the whole `liveFloor`
 * tree for minimap/overview/radar/ZoneNavigator/orthographic/createPortal/
 * RenderTexture — nothing exists except `LiveFloorHUD.tsx`'s DOM "zone
 * navigator" list (`PlantZoneSummary[]`, a text list that flies the camera
 * to a zone on click) and `sceneConfig.ts`'s camera presets. Neither is a
 * spatial top-down view with a live camera-position indicator, so this is a
 * genuinely new panel, not a rebuild.
 *
 * DELIBERATELY a 2D SVG DOM overlay, not a second `<Canvas>`/render-to-target
 * — a decorative panel with ~8 zone rects and up to ~900 machine dots is
 * nearly free as SVG and does not double the GPU's per-frame render-pass
 * cost the way a second WebGL viewport or RenderTexture would.
 *
 * NO REACT STATE IN THE HOT PATH: the live camera position/heading is
 * written every animation frame straight onto an SVG `<g>`'s `transform`
 * attribute via a plain `requestAnimationFrame` loop (the DOM equivalent of
 * the `useFrame` pattern `FloorScene.tsx`'s `CameraRig` and
 * `SceneAnnotations.tsx`'s `ZoneLabel` already use to write directly to
 * refs/DOM every frame instead of calling `setState`) — see the effect
 * below. The camera's raw per-frame numbers themselves come from
 * `cameraTrackRef`, a plain mutable ref object that `FloorScene.tsx`'s
 * `CameraRig` writes into every `useFrame` tick (see that file's
 * `onCameraFrame` callback) — never a React state value, so neither side of
 * the Canvas boundary re-renders 60x/second over this.
 *
 * Machine dots are the one thing that DOESN'T move every frame, so they (and
 * the static zone/hall outlines) are built once into a memoized SVG layer,
 * only recomputed when `layout` or `statusFilter` actually change — never
 * per animation frame.
 *
 * Click-to-navigate reuses the EXISTING fly-to mechanism end to end: each
 * populated zone is rendered as an interactive `<rect>` whose `onClick`
 * calls the same `onFocusZone` callback the HUD's own zone navigator already
 * calls (`LiveFloorView.tsx`'s `handleFocusZone` -> `focusZoneId` state ->
 * `focusBox` -> `FloorScene`'s `focusBox` prop -> `CameraRig`'s
 * `computePlacement`/ease-to-target loop). No second camera animation is
 * written here.
 */

/** SVG viewBox is a fixed 0-100 square; all world coordinates are mapped
 *  into it once per `layout` change (see `useWorldToSvg`). */
const VB = 100;
/** Extra breathing room around the world bounds so edge zones/machines
 *  don't touch the panel's own border. */
const PAD_RATIO = 0.08;

/**
 * Camera "you are here" wedge — length AND half-angle are now DERIVED every
 * frame from the live camera (horizontal half-FOV, camera-to-target
 * distance), so the wedge actually reflects how much ground the camera
 * currently covers: zoomed into one line draws a small wedge, "ดูทั้งโรงงาน"
 * draws one that spans most of the panel. These two constants are only the
 * FALLBACK used for the very first paint (before the rAF loop's first tick
 * has run) and whenever `halfFovDeg` comes back non-positive (camera isn't a
 * `THREE.PerspectiveCamera` yet — see `FloorScene.tsx`'s `CameraRig`).
 */
const CAM_WEDGE_DEFAULT_LEN = 22;
const CAM_WEDGE_DEFAULT_HALF_ANGLE_DEG = 26;
/** Wedge length is `distance * scale` (world metres -> svg units), clamped
 *  so an extreme zoom-out reads as "covers most of the site" instead of a
 *  wedge many times bigger than the 100-unit panel. */
const CAM_WEDGE_MIN_LEN = 4;
const CAM_WEDGE_MAX_LEN = 60;

function wedgePolygonPoints(len: number, halfAngleDeg: number): string {
  const h = len * Math.tan((halfAngleDeg * Math.PI) / 180);
  return `0,0 ${len},${-h} ${len},${h}`;
}

/** World (x,z, metres) -> SVG (0-100 square) mapping, uniform-scaled so
 *  circles/rects never distort, centred + padded on the layout's own bounds.
 *  Recomputed only when the bounds box itself changes (new `layout`). */
function useWorldToSvg(bounds: PlantLayout["bounds"]) {
  return useMemo(() => {
    const worldW = Math.max(1, bounds.maxX - bounds.minX);
    const worldD = Math.max(1, bounds.maxZ - bounds.minZ);
    const scale = Math.min(
      VB / (worldW * (1 + 2 * PAD_RATIO)),
      VB / (worldD * (1 + 2 * PAD_RATIO))
    );
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cz = (bounds.minZ + bounds.maxZ) / 2;
    const toSvg = (x: number, z: number): [number, number] => [
      VB / 2 + (x - cx) * scale,
      VB / 2 + (z - cz) * scale,
    ];
    return { toSvg, scale };
  }, [bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ]);
}

/** Same panel look as `LiveFloorHUD.tsx`'s own `PANEL_CLASS` — duplicated
 *  (not imported) on purpose: this file is a sibling floating panel rendered
 *  directly by `LiveFloorView.tsx` (like the "หุ่นยนต์เดินตรวจ"/roof-toggle
 *  buttons already are), not a child of the HUD tree, so it doesn't need to
 *  couple to the HUD module's internals for a one-line class string. */
const MINIMAP_PANEL_CLASS =
  "bg-[var(--lf-panel-bg)] backdrop-blur-md border border-[var(--lf-panel-border)] rounded-[18px] shadow-[0_8px_24px_-12px_var(--lf-panel-glow)] text-[var(--lf-text)]";

export interface MinimapCameraSample {
  x: number;
  z: number;
  dirX: number;
  dirZ: number;
  /** Horizontal half-field-of-view, in degrees — 0 (falsy-for-clamp) until
   *  the first `CameraRig` frame reports a real `THREE.PerspectiveCamera`. */
  halfFovDeg: number;
  /** Camera-to-target distance, world metres — 0 until the first frame. */
  distance: number;
}

export interface MinimapProps {
  /** ผังโรงงานจริง — โซน, เครื่องจักร, ขอบเขตไซต์ */
  layout: PlantLayout;
  /** ตัวกรองสถานะของ HUD — จุดเครื่องที่ถูกกรองออกต้องไม่แสดงในผังย่อด้วย */
  statusFilter: MachineStatus | "all";
  /** โซนที่มีเครื่องจักรจริง (เหมือนกับที่ zone navigator ของ HUD ใช้) —
   *  เป็นเป้าหมายคลิก-เพื่อ-บินไปเพียงชนิดเดียวที่ผังย่อนี้รองรับ */
  zones: PlantZoneSummary[];
  /** โซนที่กำลังโฟกัสอยู่ — ไฮไลต์กรอบในผังย่อให้ตรงกับ zone navigator */
  focusZoneId: string | null;
  /** เรียกกลไกบินกล้องเดิม (เหมือนปุ่มในแผงซ้าย) — ไม่มีระบบเคลื่อนกล้องใหม่ */
  onFocusZone: (zoneId: string | null) => void;
  /** อ่านค่าตำแหน่ง/ทิศ/ระยะกล้องแบบสด — เขียนโดย `FloorScene.tsx`'s
   *  CameraRig ทุกเฟรม (mutable ref เดียวกัน ไม่ผ่าน React state) */
  cameraTrackRef: React.RefObject<MinimapCameraSample>;
}

/**
 * Positioning note: this component renders ONLY the panel itself (no
 * `absolute`/corner classes) — the caller (`LiveFloorHUD.tsx`) mounts it
 * inside the same `flex flex-col-reverse` bottom-right stack as the
 * selected-machine inspector card, so the two panels can never overlap no
 * matter how tall the inspector card's content gets (a fixed pixel offset
 * here would have had to guess that height — rejected on purpose, see the
 * git history of this file).
 */
export function Minimap({
  layout,
  statusFilter,
  zones,
  focusZoneId,
  onFocusZone,
  cameraTrackRef,
}: MinimapProps): ReactElement {
  const { toSvg, scale } = useWorldToSvg(layout.bounds);

  /** เส้นขอบฮอลล์ + โซนทั้งหมด (รวมโซนว่าง) — ของตกแต่งอย่างเดียว ไม่คลิกได้
   *  (เฉพาะโซนที่มีเครื่องจักรจริงใน `zones` ด้านล่างเท่านั้นที่คลิกได้) */
  const staticLayer = useMemo(() => {
    const hallHalfW = layout.hall.w * scale;
    const hallHalfD = layout.hall.d * scale;
    const [hcx, hcy] = toSvg(0, 0);
    const zoneRects = layout.site.zones.map((z) => {
      const [zcx, zcy] = toSvg(z.x, z.z);
      const w = z.w * scale;
      const d = z.d * scale;
      return (
        <rect
          key={z.id}
          x={zcx - w / 2}
          y={zcy - d / 2}
          width={w}
          height={d}
          fill="none"
          stroke="var(--lf-panel-border)"
          strokeWidth={0.4}
          pointerEvents="none"
        />
      );
    });
    return (
      <>
        <rect
          x={hcx - hallHalfW / 2}
          y={hcy - hallHalfD / 2}
          width={hallHalfW}
          height={hallHalfD}
          fill="none"
          stroke="var(--lf-text-muted)"
          strokeWidth={0.6}
          pointerEvents="none"
        />
        {zoneRects}
      </>
    );
  }, [layout.hall.w, layout.hall.d, layout.site.zones, scale, toSvg]);

  /** จุดเครื่องจักรทุกตัว ระบายสีจากแหล่งเดียวกับ HUD/ตัวเครื่องในฉาก —
   *  `statusColorOf` (`scene/palette.ts`) รับ `KitStatus` ตรงตัวจาก
   *  `PlacedMachine.status` โดยไม่แปลง ไม่มีการ map สีซ้ำที่นี่เลย สร้างครั้ง
   *  เดียว/เมื่อ layout หรือตัวกรองเปลี่ยน ไม่ใช่ทุกเฟรม (เครื่องจักรไม่ขยับ) */
  const machineDots = useMemo(() => {
    const nodes: ReactElement[] = [];
    for (const pm of layout.machines) {
      if (statusFilter !== "all" && pm.machine.status !== statusFilter) continue;
      const [sx, sy] = toSvg(pm.x, pm.z);
      nodes.push(<circle key={pm.id} cx={sx} cy={sy} r={0.55} fill={statusColorOf(pm.status)} pointerEvents="none" />);
    }
    return nodes;
  }, [layout.machines, statusFilter, toSvg]);

  /** กล้อง — เขียนตำแหน่ง/ทิศทางลง `transform` ของ `<g>` นี้ตรง ๆ ทุกเฟรมผ่าน
   *  requestAnimationFrame (DOM version ของ `useFrame`, ใช้เพราะ `Minimap` อยู่
   *  นอก `<Canvas>` เรียก useFrame ของ R3F ไม่ได้) — ไม่มี setState ในลูปนี้เลย */
  const cameraGroupRef = useRef<SVGGElement | null>(null);
  const cameraWedgeRef = useRef<SVGPolygonElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const cam = cameraTrackRef.current;
      const g = cameraGroupRef.current;
      if (cam && g) {
        const [sx, sy] = toSvg(cam.x, cam.z);
        const angleDeg = (Math.atan2(cam.dirZ, cam.dirX) * 180) / Math.PI;
        g.setAttribute("transform", `translate(${sx.toFixed(2)} ${sy.toFixed(2)}) rotate(${angleDeg.toFixed(1)})`);

        const wedge = cameraWedgeRef.current;
        if (wedge) {
          // Wedge reach = how far the camera currently sits from what it's
          // looking at, converted from world metres to svg units with the
          // SAME uniform scale everything else on this panel uses — clamped
          // so "ดูทั้งโรงงาน" reads as "covers most of the site" instead of
          // overflowing the 100-unit panel.
          const len = Math.min(CAM_WEDGE_MAX_LEN, Math.max(CAM_WEDGE_MIN_LEN, cam.distance * scale));
          const halfAngle = cam.halfFovDeg > 0 ? cam.halfFovDeg : CAM_WEDGE_DEFAULT_HALF_ANGLE_DEG;
          wedge.setAttribute("points", wedgePolygonPoints(len, halfAngle));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [toSvg, scale, cameraTrackRef]);

  return (
    <div className={`${MINIMAP_PANEL_CLASS} w-48 p-2.5 pointer-events-auto`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lf-text-muted)] mb-1.5 px-0.5">
        แผนผังย่อ
      </div>
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="w-full aspect-square rounded-[10px]"
        style={{ background: "var(--lf-box-bg)" }}
      >
        {staticLayer}
        {machineDots}
        {/* โซนที่มีเครื่องจักรจริง — เป้าหมายคลิก/คีย์บอร์ดเพื่อบินกล้องไป
            ใช้กลไก onFocusZone เดียวกับตัวนำทางโซนในแผงซ้าย */}
        {zones.map((zone) => {
          const [zcx, zcy] = toSvg(zone.x, zone.z);
          const w = Math.max(2, zone.width * scale);
          const d = Math.max(2, zone.depth * scale);
          const active = focusZoneId === zone.id;
          return (
            <rect
              key={zone.id}
              x={zcx - w / 2}
              y={zcy - d / 2}
              width={w}
              height={d}
              tabIndex={0}
              role="button"
              aria-label={`บินกล้องไปที่โซน ${zone.name}`}
              aria-pressed={active}
              onClick={() => onFocusZone(active ? null : zone.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onFocusZone(active ? null : zone.id);
                }
              }}
              fill={active ? "var(--lf-accent-26)" : "transparent"}
              stroke={active ? "var(--lf-accent)" : "transparent"}
              strokeWidth={1}
              style={{ cursor: "pointer", outline: "none" }}
            />
          );
        })}
        {/* ตำแหน่ง/ทิศกล้องปัจจุบัน — ดูคอมเมนต์ effect ด้านบน */}
        <g ref={cameraGroupRef} pointerEvents="none">
          <polygon
            ref={cameraWedgeRef}
            points={wedgePolygonPoints(CAM_WEDGE_DEFAULT_LEN, CAM_WEDGE_DEFAULT_HALF_ANGLE_DEG)}
            fill="var(--lf-accent-26)"
            stroke="var(--lf-accent)"
            strokeWidth={0.6}
          />
          <circle cx={0} cy={0} r={1.6} fill="var(--lf-accent)" stroke="white" strokeWidth={0.4} />
        </g>
      </svg>
      <div className="text-[9px] text-[var(--lf-text-muted)] leading-tight mt-1 px-0.5">
        คลิกโซนเพื่อบินกล้องไปดู
      </div>
    </div>
  );
}

export default Minimap;
