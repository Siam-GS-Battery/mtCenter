import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Grid,
  ContactShadows,
  RoundedBox,
  AdaptiveDpr,
  AdaptiveEvents,
} from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { buildFloorLayout, ARCHETYPE_LABELS } from "../../../lib/floorLayout";
import type {
  FloorBuilding,
  FloorLayout,
  FloorSlot,
  FloorZone,
  MachineArchetype,
} from "../../../lib/floorLayout";
import { createFloorSimulation } from "../../../lib/floorSimulation";
import type { FloorSimulation, MachineRuntime } from "../../../lib/floorSimulation";
import { FacilityShell, ConveyorSystem, FloorTraffic } from "./LiveFloorFacility";
import { LIVE_FLOOR_THEME, statusColor } from "./liveFloorTheme";
import type { Machine, MachineStatus } from "../../../types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Camera scales the operator can switch between:
 * — "line"  : the default. Frames the focus hall inside the focus BUILDING from
 *             a low 3/4 angle, so machine silhouettes and conveyors read at a
 *             human scale. When a building is explicitly requested it frames
 *             that whole building instead.
 * — "plant" : the whole-SITE fit — every building, road, yard and the fence.
 * — "top"   : the top-down plan view of the whole site.
 * — "eye"   : eye level inside the focus hall / focus building.
 */
export type FloorCameraPreset = "line" | "plant" | "top" | "eye";

export interface LiveFloor4DSceneProps {
  machines: Machine[];
  /** "all" shows everything; otherwise non-matching machines are dimmed, not removed */
  statusFilter: MachineStatus | "all";
  selectedMachineId: string | null;
  onSelectMachine: (machine: Machine) => void; // single click: select + focus
  onOpenMachine: (machine: Machine) => void; // double click: open detail
  cameraPreset: FloorCameraPreset;
  /** false = reduce effects for weak GPUs */
  highQuality?: boolean;
  /** live simulation driving the "machines are working" animation; when omitted the scene creates its own */
  simulation?: FloorSimulation;
  /** id of the building the camera should focus; null = use layout.focusBuildingId */
  focusBuildingId?: string | null;
  /**
   * Pre-built site layout. The view builds it so the HUD's building navigator
   * and the scene share ONE instance; when omitted the scene builds its own so
   * it still works standalone.
   */
  layout?: FloorLayout;
  /**
   * Fired when the canvas loses its WebGL context. The scene stays mounted and
   * the loss event is `preventDefault()`ed, so the browser is still free to
   * restore it — the view only needs to cover the (now frozen) canvas.
   */
  onContextLost?: () => void;
  /** Fired when the browser restores the context and rendering resumes. */
  onContextRestored?: () => void;
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const STATUS_LABEL_TH: Record<MachineStatus, string> = {
  normal: "ปกติ",
  warning: "เฝ้าระวัง",
  error: "ขัดข้อง",
  maintenance: "ซ่อมบำรุง",
};

const BG_COLOR = LIVE_FLOOR_THEME.background;
const FOG_COLOR = LIVE_FLOOR_THEME.fog;
const GROUND_COLOR = LIVE_FLOOR_THEME.ground;
const GRID_COLOR = LIVE_FLOOR_THEME.gridLine;
const GRID_SECTION_COLOR = LIVE_FLOOR_THEME.gridSection;
const ACCENT_COLOR = LIVE_FLOOR_THEME.accent;
const STEEL_COLOR = LIVE_FLOOR_THEME.machineSteel;
const DARK_STEEL_COLOR = LIVE_FLOOR_THEME.machineSteelDark;
/**
 * The plinth is the machine's dark footing. On the old black floor the pale
 * `structureAlt` was the contrasting choice; on a #f2f5fa floor a pale plinth
 * under a pale machine is mush, so the footing now uses the DARK steel token —
 * it reads as a solid base and doubles the grounding cue that <ContactShadows>
 * alone had to carry.
 */
const PLINTH_COLOR = LIVE_FLOOR_THEME.machineSteelDark;

/**
 * ===========================================================================
 * LIGHT-THEME SIGNAL MODEL — read this before touching any brightness number.
 * ===========================================================================
 * On the old black background "signal" meant `colour x brightness` with
 * brightness allowed above 1: anything over white bloomed and read as a glow.
 * Against a #f2f5fa floor there is no headroom above white at all, so that
 * model INVERTS — a value of 2.0 is simply clipped white, i.e. invisible.
 *
 * Every animated accent in this file therefore uses a two-endpoint LERP:
 *
 *     rendered = base + (accent - base) * b,      b in [0, 1]
 *
 * where `base` is the pale colour of whatever the accent sits on (cold steel,
 * the fog) and `accent` is the SATURATED, DARKER-THAN-THE-FLOOR token. b = 0
 * means "off / invisible", b = 1 means "fully saturated". No multiplier in this
 * file may exceed 1 any more.
 *
 * `fade` (the status-filter dim) inverts the same way: multiplying toward black
 * used to hide a machine on black, but on a pale floor near-black is the MOST
 * prominent thing on screen. Filtered machines are therefore lerped toward
 * FADE_COLOR (the fog) instead of multiplied by a small factor.
 */

/** Filtered-out machines are lerped this far toward the fog instead of darkened. */
const FILTER_FADE = 0.8;

/** DERIVED (no token): the fog colour as a THREE.Color, used as the fade target. */
const FADE_COLOR = new THREE.Color(FOG_COLOR);

/**
 * DERIVED (no token): `shadowColor` at 35% alpha (`59` in hex), the drop shadow
 * of every <Html> card in this file. Promote to a `hud.cardShadow` token if the
 * theme grows one.
 */
const HTML_SHADOW = `0 6px 18px ${LIVE_FLOOR_THEME.shadowColor}59`;

/**
 * `density * depth` of the exponential-squared fog at one full SITE diagonal.
 *
 * fogExp2 hides `1 - exp(-(density * d)^2)`, and every preset's fit distance is
 * proportional to the site diagonal, so scaling the density by that diagonal
 * keeps the look identical at both scales.
 *
 * Measured on the 973-machine / 8-building site (site 326 x 194 m, diagonal
 * 379 m, `plant` fit 392 m — i.e. the overview camera sits at 1.03x the
 * diagonal, NOT the 0.7x an older comment assumed).
 *
 * LIGHT-THEME RETUNE: 0.55 -> 0.38. Haze costs far more CONTRAST on a light
 * scene than on a dark one. Blending toward a near-white fog collapses the gap
 * between a pale machine (~0.60 sRGB after shading) and the pale floor (~0.91),
 * so at the old 0.55 the far half of the site turned into a flat white sheet
 * where the dark scene still had plenty of luminance range left below the fog.
 * At 0.38 the same site measures (previous 0.55 numbers in brackets):
 * — nearest building (324 m): 10.0%  [19.8%]
 * — site centre / plant fit (392 m): 14.3%  [27.6%]
 * — far fence corner (559 m): 26.9%  [48.2%]  → aerial perspective, not a wall.
 * — `line` preset (fit 46 m on the focus hall): 0.21%  [0.45%] — stays crisp.
 * The fog COLOUR is also now the theme's own `fog` token (a touch cooler and
 * darker than `background`) rather than the background colour, so the far end
 * separates from the sky instead of dissolving into it.
 */
const FOG_FALLOFF = 0.38;

/** Emissive accent colours of the animated glow parts. */
const FURNACE_GLOW_COLOR = LIVE_FLOOR_THEME.furnaceGlow;
const IMPACT_GLOW_COLOR = LIVE_FLOOR_THEME.impactGlow;
const SCANLINE_COLOR = LIVE_FLOOR_THEME.scanlineGlow;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2;

/** Reusable scratch objects — the animation path must never allocate. */
const DUMMY = new THREE.Object3D();
const SCRATCH_COLOR = new THREE.Color();
const SCRATCH_TINT = new THREE.Color();
/** slot local→world basis (translation + rotationY), rebuilt per instance write. */
const BASE_MAT = new THREE.Matrix4();
/** BASE_MAT * localMatrix */
const OUT_MAT = new THREE.Matrix4();
/**
 * Per-zone (per-hall) visibility culling scratch, reused every decimated tick
 * in `MachineInstancesInner`'s useFrame — a fresh Frustum/Matrix4/Sphere per
 * frame would itself be the kind of per-frame allocation this whole feature
 * exists to avoid.
 */
const CULL_VIEW_PROJ = new THREE.Matrix4();
const CULL_FRUSTUM = new THREE.Frustum();
const CULL_SPHERE = new THREE.Sphere();
/**
 * Fallback hall clear height used to size a zone's bounding sphere ONLY when
 * the zone can't be matched to an owning `FloorBuilding` (should not happen
 * in practice — every zone belongs to exactly one building — but keeps this
 * defensive rather than crashing on an unexpected layout shape). Real halls
 * use their own building's `wallHeight` instead (see the `zoneCull` useMemo
 * below) — a fixed guess previously matched floorLayout's `WALL_HEIGHT` (12m)
 * but a hall taller than that (e.g. a 14m building) would poke its top out of
 * the sphere and get wrongly culled while still visible on screen.
 */
const ZONE_HALL_HEIGHT = 12;
/**
 * Screen-edge safety margin added to each zone's bounding-sphere radius, as a
 * fraction of the sphere's own (footprint + height) radius rather than a
 * fixed metre pad. The frustum test only runs on the decimated tick (see the
 * FPS cap above), so during a fast camera pan an object can be well inside
 * the actual view before the next test executes — an exact-radius sphere
 * would freeze it mid-pan for a frame or more, which reads as a visible
 * stutter. Padding the sphere trades a slightly larger "active" set (a
 * cheap O(zones) test either way) for eliminating that visible freeze,
 * which is the right trade given the hard requirement is no stutter. Scaling
 * off the zone's own radius (not a flat metres value) means a huge hall gets
 * a proportionally huge margin and a small one isn't overpadded.
 */
const ZONE_CULL_MARGIN_FACTOR = 0.35;
/**
 * Beyond this multiple of the layout's own `suggestedCameraDistance` (the
 * distance the camera sits at to frame the whole floor by default), a hall
 * is far enough from the camera that its machines' fine per-part animation
 * (arms, rams, spindles) is visually imperceptible — a few pixels of motion
 * at most. Scaling off `suggestedCameraDistance` means the threshold tracks
 * the actual size of THIS floor instead of a fixed metre value that would be
 * wrong for a small demo layout or a large real one.
 */
const ANIM_LOD_DISTANCE_FACTOR = 1.6;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

interface PresetConfig {
  /** direction from the orbit target toward the camera (normalised on use) */
  dir: readonly [number, number, number];
  /** what the fit distance is computed from: the whole fenced site, or one building/hall */
  frame: "site" | "near";
  /** margin passed to the fit; < 1 deliberately crops into the framed box */
  margin: number;
  /** hard clamp on the resulting distance, in metres */
  minDistance: number;
  maxDistance: number;
  /** height of the orbit target above the floor, in metres */
  targetY: number;
}

/**
 * Per-preset framing. The two "near" presets frame one hall inside the focus
 * building (or the whole building when the operator picked one in the HUD)
 * instead of the whole site: at the site fit distance (~400 m for 973 machines
 * spread over several buildings) a 2.4 m machine is a couple of pixels tall and
 * every animated part is invisible — the "grey speckle field" we avoid.
 */
const PRESET_CONFIG: Record<FloorCameraPreset, PresetConfig> = {
  // low-ish 3/4 over one hall / building: silhouettes read, the rest of the site
  // recedes behind the framed box instead of being cropped away
  line: { dir: [0.62, 0.42, 0.72], frame: "near", margin: 0.86, minDistance: 22, maxDistance: 300, targetY: 2.2 },
  // classic whole-site 3/4 (the previous "iso"/plant view, now the campus)
  plant: { dir: [0.9, 0.78, 0.9], frame: "site", margin: 1.08, minDistance: 24, maxDistance: 4000, targetY: 0 },
  // near-top-down over the whole site, but kept safely above OrbitControls'
  // minPolarAngle (0.05) so the clamp never fights the camera and causes jitter
  top: { dir: [0, Math.cos(0.08), Math.sin(0.08)], frame: "site", margin: 1.05, minDistance: 24, maxDistance: 4000, targetY: 0 },
  // standing on the floor of the focus hall, looking down the lines
  eye: { dir: [0.08, 0.11, 1], frame: "near", margin: 0.42, minDistance: 14, maxDistance: 60, targetY: 1.7 },
};

/** Distance the camera pulls in to when a machine is selected from a wide preset. */
const SELECTION_DISTANCE = 26;

/** Yaw applied to a near preset's outward direction, so it stays a 3/4 view. */
const HALL_VIEW_YAW = 0.5;

/**
 * Viewing direction of a preset.
 *
 * For the near presets the horizontal part is derived from the focus BUILDING's
 * offset from the site centre and swung out by `HALL_VIEW_YAW`: the camera then
 * sits outside that building looking inward, so the framed hall is in the
 * foreground, the rest of the site recedes behind it, and the camera can never
 * end up standing inside a neighbouring building: `line` also carries a ~34°
 * elevation, so at its fit distance the camera sits tens of metres up, well
 * clear of every roof. With the config's fixed direction, a building in the near
 * corner of the site would put the whole rest of the campus behind the camera
 * instead.
 */
function presetDirection(
  config: PresetConfig,
  building: FloorBuilding | null
): readonly [number, number, number] {
  if (config.frame !== "near" || !building) return config.dir;
  const radius = Math.hypot(building.x, building.z);
  if (radius < 1) return config.dir;
  const horizontal = Math.hypot(config.dir[0], config.dir[2]) || 1;
  const ux = building.x / radius;
  const uz = building.z / radius;
  const c = Math.cos(HALL_VIEW_YAW);
  const s = Math.sin(HALL_VIEW_YAW);
  return [(ux * c - uz * s) * horizontal, config.dir[1], (ux * s + uz * c) * horizontal];
}

/** error > warning > maintenance > normal — same ordering the layout uses. */
const STATUS_SEVERITY: Record<MachineStatus, number> = {
  error: 3,
  warning: 2,
  maintenance: 1,
  normal: 0,
};

/** Axis-aligned box the active preset frames, in world metres. */
interface FrameBox {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
}

/**
 * Widest window (metres) a "near" preset is allowed to frame: six production
 * lines across, mirroring `LINE_SPACING` (7.5 m) in `floorLayout` — which is a
 * module-private constant there, hence the literal.
 *
 * Without this clamp the near presets degenerate whenever the grouping is coarse:
 * with all 973 machines in ONE `factoryGroup` (or all `factoryGroup` null) the
 * single hall measures 171.8 x 95.4 m, so the "near" box IS the whole plant —
 * `line` fits at 127.3 m where a 2.4 m machine is ~22 px tall at 1080p, and
 * `eye` pins to its 60 m ceiling. Clamping the box to 45 m brings `line` to
 * 46.8 m (~59 px) and `eye` to 21.1 m. On the well-grouped 8-building dataset the
 * focus hall is 58.6 x 42.7 m, so the clamp only trims the width: `line` 55.0 ->
 * 45.7 m (~51 -> ~61 px) and `eye` 24.0 -> 20.6 m — a mild tightening, not a
 * behaviour change.
 */
const NEAR_FRAME_SPAN = 45;

/**
 * Shrinks a near frame box to at most `NEAR_FRAME_SPAN` per horizontal axis,
 * keeping it centred on the box it came from (the focus hall / building), so the
 * framed window always sits inside real machine rows rather than over empty yard.
 */
function clampNearBox(box: FrameBox): FrameBox {
  const width = Math.min(box.width, NEAR_FRAME_SPAN);
  const depth = Math.min(box.depth, NEAR_FRAME_SPAN);
  if (width === box.width && depth === box.depth) return box;
  return { x: box.x, z: box.z, width, depth, height: box.height };
}

/**
 * Smallest distance along `dir` at which the floor's bounding box still fits
 * inside the frustum, times `margin`. Exact projected-corner fit — a
 * bounding-sphere approximation overshoots a 3:2 floor by nearly 2x, which is
 * what previously left the machines as specks near the horizon.
 */
function fitCameraDistance(
  width: number,
  depth: number,
  height: number,
  dir: readonly [number, number, number],
  fovDeg: number,
  aspect: number,
  margin: number
): number {
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const zx = dir[0] / len;
  const zy = dir[1] / len;
  const zz = dir[2] / len;

  const horiz = Math.hypot(zx, zz);
  const xx = horiz > 1e-4 ? zz / horiz : 1;
  const xy = 0;
  const xz = horiz > 1e-4 ? -zx / horiz : 0;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const tanV = Math.tan((fovDeg * Math.PI) / 360);
  const tanH = tanV * Math.max(0.2, aspect);

  const hw = width / 2;
  const hd = depth / 2;
  let needed = 0;

  for (let sx = -1; sx <= 1; sx += 2) {
    for (let sz = -1; sz <= 1; sz += 2) {
      for (let sy = 0; sy <= 1; sy += 1) {
        const px = sx * hw;
        const py = sy * height;
        const pz = sz * hd;
        const cx = px * xx + py * xy + pz * xz;
        const cy = px * yx + py * yy + pz * yz;
        const cz = px * zx + py * zy + pz * zz;
        const byH = cz + Math.abs(cx) / tanH;
        const byV = cz + Math.abs(cy) / tanV;
        if (byH > needed) needed = byH;
        if (byV > needed) needed = byV;
      }
    }
  }

  return needed * margin;
}

/** Tallest machine silhouette on the floor, plus stack-light mast headroom. */
function contentHeight(layout: FloorLayout): number {
  let max = 0;
  for (const slot of layout.slots) {
    if (slot.height > max) max = slot.height;
  }
  return Math.max(3.2, max + 0.85);
}

// ---------------------------------------------------------------------------
// Ground + grid
// ---------------------------------------------------------------------------

/**
 * EMPTY-LAYOUT ground only — mount it solely when `layout.slots.length === 0`.
 * With machines on the floor the facility draws the site ground itself (grass at
 * y=0.004, asphalt at y=0.008) and this plane at y=-0.06 plus its Grid at y=0
 * would z-fight it site-wide (see the mount site in `SceneContents`).
 *
 * `width`/`depth` are the whole fenced SITE extents, not one building's.
 */
function FloorGround({ width, depth }: { width: number; depth: number }) {
  // Floor at a sane minimum so an empty (zero-machine) layout still renders
  // a visible ground/grid instead of a degenerate zero-size plane. 1.25x the
  // site is enough apron around the fence — the old 1.6x of a single shed is a
  // wasteful plane now that the site itself is much larger.
  const size = Math.max(60, Math.max(width, depth) * 1.25);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={GROUND_COLOR} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Light-theme retune: `gridLine` (#c3d2e6) on `ground` (#f2f5fa) is a much
          narrower contrast step than the old cyan-on-black, so the lines are
          drawn thicker and the fade is pulled IN — a pale line fading over 90%
          of a 60 m+ plane is invisible for most of its length and only added a
          grey smear near the horizon. fadeDistance 0.55x + fadeStrength 1.0
          keeps the readable inner half crisp and lets the rest go to fog. */}
      <Grid
        position={[0, 0, 0]}
        args={[size, size]}
        infiniteGrid
        fadeDistance={size * 0.55}
        fadeStrength={1}
        cellSize={1}
        cellColor={GRID_COLOR}
        sectionSize={5}
        sectionColor={GRID_SECTION_COLOR}
        sectionThickness={1.2}
        cellThickness={0.8}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Zone labels
// ---------------------------------------------------------------------------
//
// NOTE: there is deliberately no zone PLATFORM slab any more. It used to draw a
// box per zone at y=-0.02 with scaleY 0.15, i.e. spanning -0.095…+0.055, which
// buried the facility's whole floor stack (building slab top 0.034, aisle plates
// 0.045, road markings 0.029, prop pads 0.026) and z-fought the hazard stripes
// at their mid-plane. The facility now tints each building's own floor slab by
// `worstStatus`, so the per-zone status signal survives without the slab.

/**
 * Zone name plates. `<Html>` creates real DOM nodes, so the labels are capped:
 * only zones that actually hold machines, and nothing at all once the floor is
 * split into more zones than a viewer could read anyway.
 *
 * The caller must also gate this on `zones.length > buildings.length`: with one
 * hall per building the facility's rooftop signs already carry exactly the same
 * `factoryGroup` string, so mounting both doubles the DOM overlay count while
 * the ground-level plate is a couple of pixels tall at the `line` distance.
 */
const MAX_ZONE_LABELS = 40;

function ZoneLabels({ zones }: { zones: FloorZone[] }) {
  const shown = useMemo(() => {
    const withMachines = zones.filter((z) => z.machineCount > 0);
    return withMachines.length > MAX_ZONE_LABELS ? [] : withMachines;
  }, [zones]);

  return (
    <>
      {shown.map((zone) => (
        <Html
          key={zone.id}
          position={[zone.x - zone.width / 2 + 0.4, 0.4, zone.z - zone.depth / 2 + 0.4]}
          distanceFactor={12}
          occlude={false}
          style={{ pointerEvents: "none" }}
        >
          {/* light card: white glass + app ink, no dark glass and no glow halo */}
          <div
            style={{
              color: LIVE_FLOOR_THEME.labelText,
              fontSize: "11px",
              fontFamily: "sans-serif",
              whiteSpace: "nowrap",
              background: LIVE_FLOOR_THEME.hud.panelBg,
              padding: "2px 6px",
              borderRadius: "3px",
              border: `1px solid ${LIVE_FLOOR_THEME.hud.panelBorder}`,
              boxShadow: HTML_SHADOW,
            }}
          >
            {zone.label} · {zone.machineCount} เครื่อง
          </div>
        </Html>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Archetype machine kits
// ---------------------------------------------------------------------------

const ARCHETYPE_ORDER: readonly MachineArchetype[] = [
  "cnc",
  "press",
  "furnace",
  "assembly",
  "robot",
  "tank",
  "inspection",
  "packing",
];

const ARCHETYPE_CODE: Record<MachineArchetype, number> = {
  cnc: 0,
  press: 1,
  furnace: 2,
  assembly: 3,
  robot: 4,
  tank: 5,
  inspection: 6,
  packing: 7,
};

const ARCHETYPE_SET = new Set<string>(ARCHETYPE_ORDER);

type PartMaterialKind = "steel" | "dark" | "metal" | "flat" | "glow";
type PartGeometryKind = "box" | "cyl" | "sphere" | "torus";

interface PartSpec {
  id: string;
  geom: PartGeometryKind;
  /** raw geometry args; unit-sized for parts that carry their size in the matrix scale */
  args: readonly number[];
  mat: PartMaterialKind;
  /** matrix is patched every frame (gets DynamicDrawUsage) */
  animated?: boolean;
  /** instance colour is patched on the throttled colour tick */
  animatedColor?: boolean;
  /** static parts may draw several instances per machine (e.g. a C-frame) */
  copies?: number;
  /** the pick target of the archetype — receives the pointer handlers */
  pick?: boolean;
  /** dropped in lite mode */
  liteDrop?: boolean;
}

const UNIT_BOX: readonly number[] = [1, 1, 1];

/**
 * Per-archetype part kits. Every machine also gets the shared plinth, status
 * strip and PLC stack light (mast + 3 lamps, all floor-wide instanced meshes,
 * see SHARED_PARTS).
 */
const ARCHETYPE_PARTS: Record<MachineArchetype, readonly PartSpec[]> = {
  cnc: [
    { id: "body", geom: "box", args: UNIT_BOX, mat: "steel", pick: true },
    { id: "console", geom: "box", args: UNIT_BOX, mat: "dark", liteDrop: true },
    { id: "spindle", geom: "cyl", args: [0.1, 0.13, 0.34, 10], mat: "metal", animated: true },
  ],
  press: [
    { id: "body", geom: "box", args: UNIT_BOX, mat: "steel", pick: true },
    { id: "frame", geom: "box", args: UNIT_BOX, mat: "dark", copies: 3 },
    { id: "ram", geom: "box", args: UNIT_BOX, mat: "metal", animated: true },
    { id: "impact", geom: "box", args: UNIT_BOX, mat: "glow", animatedColor: true, liteDrop: true },
  ],
  furnace: [
    { id: "body", geom: "box", args: UNIT_BOX, mat: "steel", pick: true },
    { id: "stack", geom: "cyl", args: [1, 1, 1, 8], mat: "dark", liteDrop: true },
    { id: "door", geom: "box", args: UNIT_BOX, mat: "metal", animated: true },
    { id: "glow", geom: "box", args: UNIT_BOX, mat: "glow", animatedColor: true, liteDrop: true },
  ],
  assembly: [
    { id: "body", geom: "box", args: UNIT_BOX, mat: "steel", pick: true },
    { id: "rack", geom: "box", args: UNIT_BOX, mat: "dark" },
    { id: "arm", geom: "box", args: [0.62, 0.07, 0.07], mat: "metal", animated: true },
  ],
  robot: [
    { id: "body", geom: "cyl", args: [1, 1, 1, 10], mat: "steel", pick: true },
    { id: "lower", geom: "box", args: UNIT_BOX, mat: "metal", animated: true },
    { id: "upper", geom: "box", args: UNIT_BOX, mat: "metal", animated: true },
    { id: "wrist", geom: "cyl", args: [0.09, 0.09, 0.2, 8], mat: "dark", animated: true },
  ],
  tank: [
    { id: "body", geom: "cyl", args: [1, 1, 1, 14], mat: "steel", pick: true },
    { id: "ring", geom: "torus", args: [1, 0.035, 6, 18], mat: "dark", liteDrop: true },
    { id: "paddle", geom: "box", args: [0.78, 0.06, 0.1], mat: "metal", animated: true },
    { id: "liquid", geom: "cyl", args: [1, 1, 1, 14], mat: "flat", animated: true },
  ],
  inspection: [
    { id: "body", geom: "box", args: UNIT_BOX, mat: "steel", pick: true },
    { id: "frame", geom: "box", args: UNIT_BOX, mat: "dark", copies: 3 },
    { id: "scanner", geom: "box", args: UNIT_BOX, mat: "metal", animated: true },
    {
      id: "scanline",
      geom: "box",
      args: UNIT_BOX,
      mat: "glow",
      animated: true,
      animatedColor: true,
      liteDrop: true,
    },
  ],
  packing: [
    { id: "body", geom: "box", args: UNIT_BOX, mat: "steel", pick: true },
    { id: "chute", geom: "box", args: UNIT_BOX, mat: "dark" },
    { id: "pusher", geom: "box", args: UNIT_BOX, mat: "metal", animated: true },
  ],
};

/**
 * Floor-wide parts every machine shares — keeps the draw count at 8 kits + 4.
 *
 * `mast` + `lampGreen`/`lampYellow`/`lampRed` are a real industrial PLC stack
 * light (โคมไฟสัญญาณ 3 ชั้น), replacing the old animated glow beacon. It is a
 * short pole with three small lamp cylinders stacked on it (red on top —
 * alarms should be the highest, most visible lamp — yellow in the middle,
 * green at the base). Every lamp is a SHARED instanced part like the old
 * beacon (fixed draw count, bounded by part count not machine count); the
 * difference is that none of them are `animatedColor` any more — see the
 * "PLC stack light" write-up above `stackLampColor` for why this is now a
 * pure static write.
 */
const SHARED_PARTS: readonly PartSpec[] = [
  { id: "plinth", geom: "box", args: UNIT_BOX, mat: "dark" },
  { id: "strip", geom: "box", args: UNIT_BOX, mat: "flat" },
  { id: "mast", geom: "cyl", args: [0.03, 0.035, 1, 8], mat: "dark" },
  { id: "lampRed", geom: "cyl", args: [0.055, 0.055, 1, 10], mat: "glow" },
  { id: "lampYellow", geom: "cyl", args: [0.055, 0.055, 1, 10], mat: "glow" },
  { id: "lampGreen", geom: "cyl", args: [0.055, 0.055, 1, 10], mat: "glow" },
];

// -- shape factors, shared by the static writer and the animator -------------

/** cnc */
const CNC_SPINDLE_Y = 1.0; // × height
const CNC_TRAVEL = 0.3; // × width, half range
/** press */
const PRESS_RAM_TOP = 0.82; // × height
const PRESS_STROKE = 0.34; // × height
const PRESS_DOWN_FRACTION = 0.22; // portion of the cycle spent going down
/** furnace */
const FURNACE_DOOR_Y = 0.3; // × height (closed)
const FURNACE_DOOR_LIFT = 0.34; // × height
/** assembly */
const ASSEMBLY_ARM_Y = 0.72; // × height
const ASSEMBLY_ARM_R = 0.31; // half of the arm geometry length
const ASSEMBLY_ARM_SWEEP = 1.15; // radians, half range
/** robot */
const ROBOT_PED_H = 0.32; // × height
const ROBOT_L1 = 0.46; // × height
const ROBOT_L2 = 0.38; // × height
/** tank */
const TANK_PADDLE_Y = 0.98; // × height
const TANK_LIQUID_Y = 0.86; // × height
/** inspection */
const INSPECT_RAIL_Y = 0.86; // × height
const INSPECT_TRAVEL = 0.36; // × width, half range
/** packing */
const PACK_PUSHER_Y = 0.64; // × height
const PACK_PUSHER_TRAVEL = 0.34; // × width, full stroke
const PACK_PUSH_FRACTION = 0.32; // portion of the cycle spent pushing out

/** Beacon colour uploads are throttled to ~10 Hz; matrices update every frame. */
const COLOR_INTERVAL = 0.1;
const FLASH_DECAY = 3.2;

// ---------------------------------------------------------------------------
// Sims-style outline ("inverted hull" silhouette rim)
// ---------------------------------------------------------------------------
//
// A true instanced LineSegments outline (EdgesGeometry + per-instance
// transform) turned out to be impractical here: three's built-in line shaders
// (LineBasicMaterial / ShaderLib.line) never got the `USE_INSTANCING` chunk
// that mesh/points shaders have, so an InstancedMesh built from an
// EdgesGeometry silently renders as degenerate triangles instead of lines,
// and driving raw instanced attributes through a hand-rolled ShaderMaterial
// would mean re-deriving lighting/tone-mapping/fade by hand for a single
// visual effect. Instead this uses the classic cheap "inverted hull" trick:
// an enlarged, BACK-FACE-ONLY copy of the body geometry drawn per archetype.
// Where the surface faces the camera the real (smaller) body mesh occludes
// it entirely; only at the silhouette rim does the larger back-facing shell
// peek out, reading as a hard dark outline — exactly the crisp-line ask,
// and it stays a plain InstancedMesh, so it costs nothing beyond one more
// draw call per archetype (bounded by ARCHETYPE_ORDER.length, not by machine
// count) and needs no new npm dependency.
//
// Only the "body" part of each archetype is outlined — the one part every
// archetype marks `pick: true`, i.e. the dominant mass that actually defines
// the machine's read silhouette (frame/console/rack/stack/etc are secondary
// greebles; outlining all ~7 parts per machine at ~1000 machines would be
// noise, the opposite of "readable" per the brief).
/**
 * How much larger (per axis) the outline shell is than the real body, as a
 * multiplier on the body's own UNIT geometry args. Applied to unit-sized
 * geometry BEFORE the shared instance matrix's own w/h/d scale, so the
 * enlargement stays proportional to each machine's own size instead of a
 * fixed metre offset (which would look wrong on both a 0.6 m and 3 m body).
 */
const OUTLINE_SCALE = 1.06;
/**
 * Outline colour. `LIVE_FLOOR_THEME` has no dedicated dark "ink"/outline
 * token yet, so this deliberately reuses the darkest existing token in the
 * theme (`labelText`, the app's near-black HUD text ink) rather than
 * inventing an unreviewed hex here. Promote to a real `machineOutline` token
 * once the theme file grows one.
 */
const OUTLINE_COLOR = LIVE_FLOOR_THEME.labelText;

// ---------------------------------------------------------------------------
// PLC stack light (โคมไฟสัญญาณ 3 ชั้น) — replaces the old animated beacon
// ---------------------------------------------------------------------------
//
// The user found the pulsing/breathing glow beacon distracting and asked for
// a real industrial stack light instead: a short mast carrying three lamps
// (green / yellow / red), where LIT vs UNLIT is decided purely by the
// machine's STATUS. Unlike the old beacon this is NOT re-evaluated every
// frame — the lamp colours are written once per machine inside the existing
// static `writeMachineParts` pass, which already runs once per layout/status
// filter/status change (see the `useLayoutEffect` deps below). There is no
// per-activity modulation, no per-frame colour upload, and no `useFrame` cost
// for this part at all any more — a straight subtraction from the old
// per-machine-per-frame walk (the beacon's write used to live at the very end
// of that loop's body, right after the `switch (arch)` block).
//
// Status -> lamp mapping (three-lamp tower, bottom to top: green, yellow, red):
//   normal      -> green lit only
//   warning     -> yellow lit only
//   error       -> red lit only (steady; NOT blinking — a blink would need a
//                  per-frame colour upload for every machine just to serve
//                  this one status, which is exactly the per-frame cost this
//                  rewrite exists to remove, so it stays static too)
//   maintenance -> yellow + red lit together (a technician is present /
//                  machine is intentionally out of the running state — reads
//                  as "attention", distinct from both a clean run and a hard
//                  fault) — chosen over inventing a 4th lamp colour/token.
// An unlit lamp is not hidden — it is drawn at its own DARK, desaturated
// endpoint (`stackLight.*Dark` in the theme) so the tower always reads as a
// three-lamp fixture, exactly like a real switched-off stack light.
const STACK_LAMP_LIT: Readonly<Record<MachineStatus, readonly [boolean, boolean, boolean]>> = {
  // [green, yellow, red]
  normal: [true, false, false],
  warning: [false, true, false],
  error: [false, false, true],
  maintenance: [false, true, true],
};

/** Mast: short pole the three lamps sit on, in metres. */
const STACK_MAST_HEIGHT = 0.5;
/** Each lamp cylinder's real height, in metres (unit geometry is 1 m tall). */
const STACK_LAMP_HEIGHT = 0.09;
/** Vertical clearance between stacked lamps. */
const STACK_LAMP_GAP = 0.02;

/** Furnace mouth: cold-steel base … fully saturated ember at 100 °C. */
const FURNACE_MIN = 0.35;
const FURNACE_SPAN = 0.65;
/** Press impact plate: a dark bronze at rest, full amber on the strike. */
const IMPACT_MIN = 0.18;
/** Inspection scan line: idle trace vs. the running sweep band. */
const SCANLINE_IDLE = 0.2;
const SCANLINE_MIN = 0.55;
const SCANLINE_SPAN = 0.45;

/**
 * How far a machine BODY is lerped toward its status colour.
 *
 * 0.22 -> 0.42: the body base was a dark steel that a 22% tint visibly stained.
 * `machineSteel` is now #aebbcd, whose luminance is already close to the status
 * colours', so a 22% lerp moves the hue but barely moves the perceived colour.
 * At 42% the status reads off the body itself at the `plant` distance, where the
 * stack light is sub-pixel, while the machine still reads as painted metal.
 */
const BODY_TINT = 0.42;
/** Tank liquid is tinted harder still — it is a fluid, not a painted panel. */
const LIQUID_TINT = 0.52;

// ---------------------------------------------------------------------------
// Instance bookkeeping
// ---------------------------------------------------------------------------

type PartMeshMap = Map<string, THREE.InstancedMesh | null>;

interface MeshRegistry {
  /** key: `${archetype}:${partId}` and `shared:${partId}` */
  meshes: PartMeshMap;
}

/**
 * Per-machine animation scratch state, index-aligned with the *ordered* slot
 * list (slots grouped by archetype). Plain typed arrays plus one pre-resolved
 * `MachineRuntime[]` so the frame loop never touches a Map and never allocates.
 */
interface FloorAnim {
  count: number;
  ordered: FloorSlot[];
  arch: Uint8Array;
  /** index of the slot inside its own archetype group */
  local: Int32Array;
  x: Float32Array;
  z: Float32Array;
  cos: Float32Array;
  sin: Float32Array;
  w: Float32Array;
  d: Float32Array;
  h: Float32Array;
  /** 0, or FILTER_FADE for machines filtered out (lerp amount toward FADE_COLOR) */
  fade: Float32Array;
  runtimes: Array<MachineRuntime | undefined>;
  missing: number;
  /** rgb of the three glow accents at b = 1: furnace, press impact, scan line */
  glowRgb: Float32Array;
  /**
   * rgb of the same three accents at b = 0 — the pale colour of whatever the
   * accent sits on, so "off" means "blends into its surroundings" instead of
   * "goes black", which on a light floor would be the loudest state of all.
   */
  glowBaseRgb: Float32Array;
  /** decaying 0..1 cycle-completion flash */
  flash: Float32Array;
  colorTimer: number;
  /**
   * Index into the per-zone bounding-sphere arrays (see `ZoneCullMeta`), so
   * the frame loop can gate a whole hall's worth of machines with one lookup
   * instead of testing each machine's own position against the frustum.
   */
  zoneOf: Uint16Array;
}

/**
 * Coarse per-zone (per-hall) bounding spheres used to cull the animation walk
 * without ever testing an individual machine's position. One sphere per
 * `FloorZone`, built once from the zone's floor footprint plus a fixed height
 * margin so it fully encloses every machine and part swing inside that hall.
 */
interface ZoneCullMeta {
  /** zone.id -> index into the arrays below, built once per layout */
  indexOf: Map<string, number>;
  cx: Float32Array;
  cy: Float32Array;
  cz: Float32Array;
  radius: Float32Array;
  /** true when the zone's sphere is in the camera frustum AND within LOD range */
  active: Uint8Array;
  /**
   * Real seconds this zone has spent culled (inactive) since it was last
   * active, accumulated on the decimated cull tick. Zeroed the tick a zone
   * goes active again. This is how `flash` decay stays correct in real time
   * even while a zone's machine loop is skipped — see the per-machine loop
   * in `useFrame` for how it's consumed as a one-off catch-up.
   */
  culledElapsed: Float32Array;
  count: number;
}

/** Loads the slot's local→world basis (translate + rotateY) into BASE_MAT. */
function loadBase(anim: FloorAnim, i: number): void {
  const e = BASE_MAT.elements;
  const c = anim.cos[i];
  const s = anim.sin[i];
  e[0] = c;
  e[1] = 0;
  e[2] = -s;
  e[3] = 0;
  e[4] = 0;
  e[5] = 1;
  e[6] = 0;
  e[7] = 0;
  e[8] = s;
  e[9] = 0;
  e[10] = c;
  e[11] = 0;
  e[12] = anim.x[i];
  e[13] = 0;
  e[14] = anim.z[i];
  e[15] = 1;
}

/** Writes a part pose expressed in the machine's LOCAL frame. */
function putPart(
  mesh: THREE.InstancedMesh,
  index: number,
  anim: FloorAnim,
  gi: number,
  px: number,
  py: number,
  pz: number,
  rx: number,
  ry: number,
  rz: number,
  sx: number,
  sy: number,
  sz: number
): void {
  DUMMY.position.set(px, py, pz);
  DUMMY.rotation.set(rx, ry, rz);
  DUMMY.scale.set(sx, sy, sz);
  DUMMY.updateMatrix();
  loadBase(anim, gi);
  OUT_MAT.multiplyMatrices(BASE_MAT, DUMMY.matrix);
  mesh.setMatrixAt(index, OUT_MAT);
}

/**
 * Applies the status-filter fade to SCRATCH_COLOR: a lerp toward the fog, NOT a
 * multiply toward black (see the LIGHT-THEME SIGNAL MODEL note). Allocation-free.
 */
function applyFade(fade: number): void {
  if (fade > 0) SCRATCH_COLOR.lerp(FADE_COLOR, fade);
}

function putColor(mesh: THREE.InstancedMesh, index: number, hex: string, fade: number): void {
  SCRATCH_COLOR.set(hex);
  applyFade(fade);
  mesh.setColorAt(index, SCRATCH_COLOR);
}

function putTintedColor(
  mesh: THREE.InstancedMesh,
  index: number,
  base: string,
  status: string,
  amount: number,
  fade: number
): void {
  SCRATCH_COLOR.set(base).lerp(SCRATCH_TINT.set(status), amount);
  applyFade(fade);
  mesh.setColorAt(index, SCRATCH_COLOR);
}

/** Unpacks a token into one rgb triple of `glowRgb` / `glowBaseRgb`. */
function putAccentEndpoint(target: Float32Array, offset: number, hex: string): void {
  SCRATCH_COLOR.set(hex);
  target[offset] = SCRATCH_COLOR.r;
  target[offset + 1] = SCRATCH_COLOR.g;
  target[offset + 2] = SCRATCH_COLOR.b;
}

// ---------------------------------------------------------------------------
// Static geometry writer — runs once per layout/filter change
// ---------------------------------------------------------------------------

/**
 * Writes every static matrix/colour of one machine, plus the base pose of its
 * animated parts (so a machine with no runtime yet still looks right).
 */
function writeMachineParts(
  meshes: PartMeshMap,
  anim: FloorAnim,
  gi: number,
  lite: boolean
): void {
  const slot = anim.ordered[gi];
  const li = anim.local[gi];
  const w = anim.w[gi];
  const d = anim.d[gi];
  const h = anim.h[gi];
  const fade = anim.fade[gi];
  const status = statusColor(slot.machine.status);
  // taken from the animator's code table, not the raw slot field, so the mesh
  // keys here can never disagree with the archetype grouping
  const archetype = ARCHETYPE_ORDER[anim.arch[gi]];

  const get = (id: string): THREE.InstancedMesh | null =>
    meshes.get(`${archetype}:${id}`) ?? null;

  // -- shared: plinth, status strip, stack-light mast + lamps ---------------
  const plinth = meshes.get("shared:plinth") ?? null;
  if (plinth) {
    putPart(plinth, gi, anim, gi, 0, 0.055, 0, 0, 0, 0, w * 1.16, 0.11, d * 1.16);
    putColor(plinth, gi, PLINTH_COLOR, fade);
  }

  const strip = meshes.get("shared:strip") ?? null;
  if (strip) {
    // The strip rides the tallest solid mass of the archetype so it never
    // floats in mid-air on the open silhouettes (robot, inspection gantry).
    let stripY = h * 0.88;
    let stripW = w * 1.02;
    let stripD = d * 1.02;
    if (archetype === "robot") {
      stripY = h * ROBOT_PED_H * 0.82;
      stripW = w * 0.64;
      stripD = d * 0.64;
    } else if (archetype === "inspection") {
      stripY = h * 0.2;
      stripW = w * 0.92;
      stripD = d * 0.88;
    } else if (archetype === "packing" || archetype === "assembly") {
      stripY = h * 0.52;
    }
    // The strip is a `flat` (untone-mapped basic) material, so it renders the
    // status token EXACTLY — the theme already verifies every status colour at
    // >= 3:1 against the floor, and that saturated band is now the mid-distance
    // status signal. Brightness is a flat 1: there is no "brighter" to go to.
    putPart(strip, gi, anim, gi, 0, stripY, 0, 0, 0, 0, stripW, Math.max(0.05, h * 0.06), stripD);
    putColor(strip, gi, status, fade);
  }

  // PLC stack light: one short mast + three lamp cylinders, all SHARED and
  // all STATIC — see the "PLC stack light" block above `STACK_LAMP_LIT`.
  // Written once here (layout/status-change driven), never touched per frame.
  const mast = meshes.get("shared:mast") ?? null;
  if (mast) {
    putPart(
      mast,
      gi,
      anim,
      gi,
      0,
      h + STACK_MAST_HEIGHT * 0.5,
      0,
      0,
      0,
      0,
      1,
      STACK_MAST_HEIGHT,
      1
    );
    putColor(mast, gi, DARK_STEEL_COLOR, fade);
  }

  const lit = STACK_LAMP_LIT[slot.machine.status] ?? STACK_LAMP_LIT.warning;
  const lampBaseY = h + STACK_MAST_HEIGHT;
  const lampStep = STACK_LAMP_HEIGHT + STACK_LAMP_GAP;
  // bottom -> top: green, yellow, red
  const lampSpecs: readonly [string, boolean, string, string][] = [
    ["shared:lampGreen", lit[0], LIVE_FLOOR_THEME.stackLight.greenLit, LIVE_FLOOR_THEME.stackLight.greenDark],
    ["shared:lampYellow", lit[1], LIVE_FLOOR_THEME.stackLight.yellowLit, LIVE_FLOOR_THEME.stackLight.yellowDark],
    ["shared:lampRed", lit[2], LIVE_FLOOR_THEME.stackLight.redLit, LIVE_FLOOR_THEME.stackLight.redDark],
  ];
  for (let li2 = 0; li2 < lampSpecs.length; li2++) {
    const [key, isLit, litColor, darkColor] = lampSpecs[li2];
    const lamp = meshes.get(key) ?? null;
    if (!lamp) continue;
    const y = lampBaseY + STACK_LAMP_HEIGHT * 0.5 + li2 * lampStep;
    putPart(lamp, gi, anim, gi, 0, y, 0, 0, 0, 0, 1, STACK_LAMP_HEIGHT, 1);
    putColor(lamp, gi, isLit ? litColor : darkColor, fade);
  }

  const body = get("body");

  // Outline shell colour only — its MATRIX is never written here. It shares
  // the exact same instanceMatrix buffer object as `body` (wired up once in
  // the mount effect below), so it moves/rotates/scales in perfect lockstep
  // with the body every frame without this file ever touching it twice.
  // Faded the same way the body's own tint fades, so a filtered-out machine's
  // outline recedes into the haze instead of staying a hard black ring.
  const outline = get("outline");
  if (outline) putColor(outline, li, OUTLINE_COLOR, fade);

  switch (archetype) {
    case "cnc": {
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.45, 0, 0, 0, 0, w * 0.9, h * 0.9, d * 0.9);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const console = lite ? null : get("console");
      if (console) {
        putPart(
          console,
          li,
          anim,
          gi,
          w * 0.53,
          h * 0.36,
          d * 0.2,
          0,
          0,
          0,
          w * 0.2,
          h * 0.5,
          d * 0.32
        );
        putColor(console, li, DARK_STEEL_COLOR, fade);
      }
      const spindle = get("spindle");
      if (spindle) {
        putPart(spindle, li, anim, gi, 0, h * CNC_SPINDLE_Y, 0, 0, 0, 0, 1, 1, 1);
        putColor(spindle, li, STEEL_COLOR, fade);
      }
      break;
    }

    case "press": {
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.2, 0, 0, 0, 0, w * 0.82, h * 0.4, d * 0.86);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const frame = get("frame");
      if (frame) {
        const o = li * 3;
        // two uprights + the top beam make the C-frame
        putPart(frame, o, anim, gi, -w * 0.34, h * 0.55, 0, 0, 0, 0, w * 0.14, h * 0.9, d * 0.6);
        putPart(frame, o + 1, anim, gi, w * 0.34, h * 0.55, 0, 0, 0, 0, w * 0.14, h * 0.9, d * 0.6);
        putPart(frame, o + 2, anim, gi, 0, h * 0.96, 0, 0, 0, 0, w * 0.84, h * 0.14, d * 0.66);
        putColor(frame, o, DARK_STEEL_COLOR, fade);
        putColor(frame, o + 1, DARK_STEEL_COLOR, fade);
        putColor(frame, o + 2, DARK_STEEL_COLOR, fade);
      }
      const ram = get("ram");
      if (ram) {
        putPart(
          ram,
          li,
          anim,
          gi,
          0,
          h * PRESS_RAM_TOP,
          0,
          0,
          0,
          0,
          w * 0.5,
          h * 0.14,
          d * 0.5
        );
        putColor(ram, li, STEEL_COLOR, fade);
      }
      const impact = lite ? null : get("impact");
      if (impact) {
        putPart(impact, li, anim, gi, 0, h * 0.41, 0, 0, 0, 0, w * 0.52, 0.03, d * 0.52);
        // Light theme: the rest state is a DARK BRONZE (the amber token at
        // IMPACT_MIN), not black. Black was invisible on the old background but
        // is the loudest pixel on a pale floor, and it would sit there
        // permanently between strikes. The cycleTick flash lerps it to full amber.
        SCRATCH_COLOR.set(IMPACT_GLOW_COLOR).lerp(SCRATCH_TINT.set(STEEL_COLOR), 1 - IMPACT_MIN);
        applyFade(fade);
        impact.setColorAt(li, SCRATCH_COLOR);
      }
      break;
    }

    case "furnace": {
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.36, 0, 0, 0, 0, w * 0.94, h * 0.72, d * 0.94);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const stack = lite ? null : get("stack");
      if (stack) {
        putPart(
          stack,
          li,
          anim,
          gi,
          w * 0.28,
          h * 1.05,
          -d * 0.3,
          0,
          0,
          0,
          0.11,
          h * 0.66,
          0.11
        );
        putColor(stack, li, DARK_STEEL_COLOR, fade);
      }
      const door = get("door");
      if (door) {
        putPart(
          door,
          li,
          anim,
          gi,
          0,
          h * FURNACE_DOOR_Y,
          d * 0.48,
          0,
          0,
          0,
          w * 0.34,
          h * 0.36,
          0.07
        );
        putColor(door, li, STEEL_COLOR, fade);
      }
      const glow = lite ? null : get("glow");
      if (glow) {
        putPart(
          glow,
          li,
          anim,
          gi,
          0,
          h * 0.26,
          d * 0.5,
          0,
          0,
          0,
          w * 0.28,
          h * 0.26,
          0.03
        );
        // rest state = cold mouth: the ember token pulled almost all the way
        // back to the door's own steel (see IMPACT above for the reasoning)
        SCRATCH_COLOR.set(FURNACE_GLOW_COLOR).lerp(SCRATCH_TINT.set(STEEL_COLOR), 1 - FURNACE_MIN);
        applyFade(fade);
        glow.setColorAt(li, SCRATCH_COLOR);
      }
      break;
    }

    case "assembly": {
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.28, 0, 0, 0, 0, w * 0.9, h * 0.56, d * 0.86);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const rack = get("rack");
      if (rack) {
        putPart(
          rack,
          li,
          anim,
          gi,
          0,
          h * 0.76,
          -d * 0.34,
          0,
          0,
          0,
          w * 0.86,
          h * 0.44,
          d * 0.16
        );
        putColor(rack, li, DARK_STEEL_COLOR, fade);
      }
      const arm = get("arm");
      if (arm) {
        putPart(arm, li, anim, gi, ASSEMBLY_ARM_R, h * ASSEMBLY_ARM_Y, 0, 0, 0, 0, 1, 1, 1);
        putColor(arm, li, STEEL_COLOR, fade);
      }
      break;
    }

    case "robot": {
      const pedH = h * ROBOT_PED_H;
      if (body) {
        // a slightly generous pedestal: it doubles as the archetype's pick target
        putPart(body, li, anim, gi, 0, pedH * 0.5, 0, 0, 0, 0, w * 0.38, pedH, w * 0.38);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const l1 = h * ROBOT_L1;
      const l2 = h * ROBOT_L2;
      const lower = get("lower");
      if (lower) {
        putPart(lower, li, anim, gi, 0, pedH + l1 * 0.5, 0, 0, 0, 0, 0.16, l1, 0.16);
        putColor(lower, li, STEEL_COLOR, fade);
      }
      const upper = get("upper");
      if (upper) {
        putPart(upper, li, anim, gi, 0, pedH + l1 + l2 * 0.5, 0, 0, 0, 0, 0.13, l2, 0.13);
        putColor(upper, li, STEEL_COLOR, fade);
      }
      const wrist = get("wrist");
      if (wrist) {
        putPart(wrist, li, anim, gi, 0, pedH + l1 + l2, 0, 0, 0, 0, 1, 1, 1);
        putColor(wrist, li, DARK_STEEL_COLOR, fade);
      }
      break;
    }

    case "tank": {
      const radius = Math.min(w, d) * 0.42;
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.45, 0, 0, 0, 0, radius, h * 0.8, radius);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const ring = lite ? null : get("ring");
      if (ring) {
        putPart(
          ring,
          li,
          anim,
          gi,
          0,
          h * 0.7,
          0,
          -Math.PI / 2,
          0,
          0,
          radius * 1.15,
          radius * 1.15,
          radius * 1.15
        );
        putColor(ring, li, DARK_STEEL_COLOR, fade);
      }
      const paddle = get("paddle");
      if (paddle) {
        putPart(paddle, li, anim, gi, 0, h * TANK_PADDLE_Y, 0, 0, 0, 0, 1, 1, 1);
        putColor(paddle, li, STEEL_COLOR, fade);
      }
      const liquid = get("liquid");
      if (liquid) {
        putPart(
          liquid,
          li,
          anim,
          gi,
          0,
          h * TANK_LIQUID_Y,
          0,
          0,
          0,
          0,
          radius * 0.9,
          0.04,
          radius * 0.9
        );
        putTintedColor(liquid, li, LIVE_FLOOR_THEME.tankLiquidBase, status, LIQUID_TINT, fade);
      }
      break;
    }

    case "inspection": {
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.1, 0, 0, 0, 0, w * 0.9, h * 0.2, d * 0.86);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const frame = get("frame");
      if (frame) {
        const o = li * 3;
        putPart(frame, o, anim, gi, -w * 0.42, h * 0.5, 0, 0, 0, 0, 0.1, h * 0.86, 0.1);
        putPart(frame, o + 1, anim, gi, w * 0.42, h * 0.5, 0, 0, 0, 0, 0.1, h * 0.86, 0.1);
        putPart(
          frame,
          o + 2,
          anim,
          gi,
          0,
          h * 0.94,
          0,
          0,
          0,
          0,
          w * 0.9,
          0.1,
          d * 0.14
        );
        putColor(frame, o, DARK_STEEL_COLOR, fade);
        putColor(frame, o + 1, DARK_STEEL_COLOR, fade);
        putColor(frame, o + 2, DARK_STEEL_COLOR, fade);
      }
      const scanner = get("scanner");
      if (scanner) {
        putPart(scanner, li, anim, gi, 0, h * INSPECT_RAIL_Y, 0, 0, 0, 0, 0.14, 0.14, d * 0.7);
        putColor(scanner, li, STEEL_COLOR, fade);
      }
      const scanline = lite ? null : get("scanline");
      if (scanline) {
        putPart(
          scanline,
          li,
          anim,
          gi,
          0,
          h * INSPECT_RAIL_Y - 0.1,
          0,
          0,
          0,
          0,
          0.05,
          0.03,
          d * 0.64
        );
        // The scan line hangs in air, so its "off" base is the FOG, not steel:
        // an idle laser should disappear into the scene, and a black hairline on
        // a pale slab would read as a permanent scratch.
        SCRATCH_COLOR.set(SCANLINE_COLOR).lerp(FADE_COLOR, 1 - SCANLINE_IDLE);
        applyFade(fade);
        scanline.setColorAt(li, SCRATCH_COLOR);
      }
      break;
    }

    case "packing": {
      if (body) {
        putPart(body, li, anim, gi, 0, h * 0.28, 0, 0, 0, 0, w * 0.9, h * 0.56, d * 0.86);
        putTintedColor(body, li, STEEL_COLOR, status, BODY_TINT, fade);
      }
      const chute = get("chute");
      if (chute) {
        putPart(
          chute,
          li,
          anim,
          gi,
          -w * 0.34,
          h * 0.78,
          0,
          0,
          0,
          0.42,
          w * 0.3,
          h * 0.3,
          d * 0.42
        );
        putColor(chute, li, DARK_STEEL_COLOR, fade);
      }
      const pusher = get("pusher");
      if (pusher) {
        putPart(
          pusher,
          li,
          anim,
          gi,
          -w * PACK_PUSHER_TRAVEL * 0.5,
          h * PACK_PUSHER_Y,
          0,
          0,
          0,
          0,
          w * 0.16,
          h * 0.2,
          d * 0.3
        );
        putColor(pusher, li, STEEL_COLOR, fade);
      }
      break;
    }

    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// Instanced machine kits + the single animation loop
// ---------------------------------------------------------------------------

interface MachineInstancesProps {
  layout: FloorLayout;
  statusFilter: MachineStatus | "all";
  simulation: FloorSimulation;
  lite: boolean;
  onHoverSlot: (slot: FloorSlot | null) => void;
  onSelectMachine: (machine: Machine) => void;
  onOpenMachine: (machine: Machine) => void;
}

const NULL_RAYCAST = (): null => null;

function PartGeometry({ part }: { part: PartSpec }): ReactElement {
  const a = part.args;
  switch (part.geom) {
    case "cyl":
      return <cylinderGeometry args={[a[0], a[1], a[2], a[3]]} />;
    case "sphere":
      return <sphereGeometry args={[a[0], a[1], a[2]]} />;
    case "torus":
      return <torusGeometry args={[a[0], a[1], a[2], a[3]]} />;
    case "box":
    default:
      return <boxGeometry args={[a[0], a[1], a[2]]} />;
  }
}

/**
 * METALNESS RETUNE FOR DAYLIGHT. The scene has no environment map (no external
 * assets allowed), so a metallic `meshStandardMaterial` has nothing to reflect:
 * its diffuse term is scaled by `1 - metalness` and its specular term returns
 * black. On the dark theme that read as "moody steel"; with pale albedos and a
 * bright fill it reads as flat mud instead, and the whole point of the light
 * rig — visible form shading on the machine bodies — is lost.
 *
 * Every metalness below is therefore roughly halved, so the diffuse gradient the
 * daylight rig produces actually survives to the screen. Roughness rises with
 * it, because a low-roughness dielectric would otherwise show a hard white
 * highlight from the key light on a surface that is already near-white.
 *
 * `flat` and `glow` stay `toneMapped={false}`: their instance colour IS the
 * theme token (or a lerp between two tokens), and the theme verifies those
 * against the floor. Skipping tone mapping is what guarantees the status strip
 * renders the exact contrast-checked colour rather than a compressed version.
 * The difference from the dark theme is that no multiplier feeding them may now
 * exceed 1 — see the LIGHT-THEME SIGNAL MODEL note.
 *
 * SIMS-STYLE FLATTEN (on top of the daylight retune above). The brief asks for
 * form to read from crisp dark OUTLINES + flat saturated colour, NOT from
 * specular highlights — "เห็นเส้นชัดๆ...ไม่ต้องทำให้มีแสงเงามากนัก". Since
 * `SceneEnvironment` now feeds every standard material a procedural IBL
 * (`environmentIntensity` 0.35), metalness is the knob that controls how much
 * of that reflection shows up as a highlight: every kind below has metalness
 * roughly HALVED again and roughness raised to match, so the env light still
 * lightly rounds each part (it isn't removed — that stays out of this file's
 * scope) but no longer produces a readable specular highlight competing with
 * the outline for attention. The outline shell + flat instance-colour tinting
 * (BODY_TINT et al) are what carry form and status now, per the documented
 * luminance budget above `SceneLights` — this retune does not touch that
 * budget, only how much of it a highlight can eat.
 */
function PartMaterial({ kind }: { kind: PartMaterialKind }): ReactElement {
  switch (kind) {
    case "flat":
    case "glow":
      return <meshBasicMaterial color={LIVE_FLOOR_THEME.neutral.white} toneMapped={false} />;
    case "dark":
      return (
        <meshStandardMaterial
          color={LIVE_FLOOR_THEME.neutral.white}
          metalness={0.08}
          roughness={0.85}
        />
      );
    case "metal":
      return (
        <meshStandardMaterial
          color={LIVE_FLOOR_THEME.neutral.white}
          metalness={0.2}
          roughness={0.55}
        />
      );
    case "steel":
    default:
      return (
        <meshStandardMaterial
          color={LIVE_FLOOR_THEME.neutral.white}
          metalness={0.12}
          roughness={0.7}
        />
      );
  }
}

/**
 * Enlarged, unit-sized copy of a body part's geometry for the outline shell
 * (see the "Sims-style outline" block above `OUTLINE_SCALE`). Scaling the
 * geometry's own args (rather than the shared instance matrix) keeps the
 * enlargement proportional to each machine's real w/h/d, since the matrix is
 * reused byte-for-byte from the body mesh and must never be touched here.
 */
function OutlineGeometry({ part }: { part: PartSpec }): ReactElement {
  const a = part.args;
  switch (part.geom) {
    case "cyl":
      return (
        <cylinderGeometry
          args={[a[0] * OUTLINE_SCALE, a[1] * OUTLINE_SCALE, a[2] * OUTLINE_SCALE, a[3]]}
        />
      );
    case "sphere":
      return <sphereGeometry args={[a[0] * OUTLINE_SCALE, a[1], a[2]]} />;
    case "box":
    default:
      return (
        <boxGeometry args={[a[0] * OUTLINE_SCALE, a[1] * OUTLINE_SCALE, a[2] * OUTLINE_SCALE]} />
      );
  }
}

function MachineInstancesInner({
  layout,
  statusFilter,
  simulation,
  lite,
  onHoverSlot,
  onSelectMachine,
  onOpenMachine,
}: MachineInstancesProps) {
  const registryRef = useRef<MeshRegistry>({ meshes: new Map() });
  const animRef = useRef<FloorAnim | null>(null);
  // FPS cap for the per-machine animation walk (~973 machines x 7 parts is not
  // free): accumulate real delta and only run the full update once the
  // budgeted interval has elapsed. `hasRunRef` forces the very first frame
  // through unconditionally so every machine gets a matrix write on mount.
  const frameAccRef = useRef(0);
  const hasRunRef = useRef(false);
  const decimateTickRef = useRef(0);

  // -- one bounding sphere per hall (zone), built once off the layout -------
  // This is the coarse volume the frame loop tests against instead of every
  // individual machine: ~10-30 zone tests per tick versus ~1000 machine
  // tests would defeat the purpose of culling in the first place.
  const zoneCull = useMemo<ZoneCullMeta>(() => {
    const zones = layout.zones;
    const indexOf = new Map<string, number>();
    const cx = new Float32Array(zones.length);
    const cy = new Float32Array(zones.length);
    const cz = new Float32Array(zones.length);
    const radius = new Float32Array(zones.length);
    const active = new Uint8Array(zones.length);
    const culledElapsed = new Float32Array(zones.length);
    // zone.id -> owning building's wallHeight, so each hall's sphere matches
    // its ACTUAL height (buildings vary — e.g. a 14m decorative office block
    // — not the fixed ZONE_HALL_HEIGHT guess). One-time O(buildings+zones)
    // work, not a per-frame cost.
    const wallHeightOf = new Map<string, number>();
    for (const building of layout.buildings) {
      for (const zoneId of building.zoneIds) wallHeightOf.set(zoneId, building.wallHeight);
    }
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      indexOf.set(zone.id, i);
      cx[i] = zone.x;
      const hallHeight = wallHeightOf.get(zone.id) ?? ZONE_HALL_HEIGHT;
      // Sphere is centred mid-height so it exactly circumscribes the hall's
      // floor footprint x hallHeight box, not just the floor plane.
      cy[i] = hallHeight / 2;
      cz[i] = zone.z;
      const exactRadius = 0.5 * Math.hypot(zone.width, zone.depth, hallHeight);
      // Padded by ZONE_CULL_MARGIN_FACTOR — see that constant for why: keeps
      // fast pans from freezing machines that are already back on screen.
      radius[i] = exactRadius * (1 + ZONE_CULL_MARGIN_FACTOR);
      // Every zone starts "active" so the very first executed tick (before
      // any frustum test has run) writes every machine's matrix once — the
      // same guarantee `hasRunRef` gives the FPS cap.
      active[i] = 1;
    }
    return { indexOf, cx, cy, cz, radius, active, culledElapsed, count: zones.length };
  }, [layout]);
  // Beyond this camera distance, a hall's machines are close enough to
  // "far" that the fine per-part articulation (arms/rams/spindles) would be
  // imperceptible — see ANIM_LOD_DISTANCE_FACTOR for why it scales off the
  // layout's own suggested camera distance instead of a fixed metre value.
  const lodDistanceSq = useMemo(() => {
    const d = layout.suggestedCameraDistance * ANIM_LOD_DISTANCE_FACTOR;
    return d * d;
  }, [layout]);

  // -- group slots by archetype, once ---------------------------------------
  const grouped = useMemo(() => {
    const groups = {} as Record<MachineArchetype, FloorSlot[]>;
    for (const arch of ARCHETYPE_ORDER) groups[arch] = [];
    for (const slot of layout.slots) {
      const key: MachineArchetype = ARCHETYPE_SET.has(slot.archetype) ? slot.archetype : "cnc";
      groups[key].push(slot);
    }
    const ordered: FloorSlot[] = [];
    for (const arch of ARCHETYPE_ORDER) {
      for (const slot of groups[arch]) ordered.push(slot);
    }
    return { groups, ordered };
  }, [layout]);

  const ordered = grouped.ordered;
  const count = ordered.length;

  // -- one-time instance setup: matrices + per-instance colours -------------
  useLayoutEffect(() => {
    const meshes = registryRef.current.meshes;
    if (count === 0) {
      animRef.current = null;
      return;
    }

    const anim: FloorAnim = {
      count,
      ordered,
      arch: new Uint8Array(count),
      local: new Int32Array(count),
      x: new Float32Array(count),
      z: new Float32Array(count),
      cos: new Float32Array(count),
      sin: new Float32Array(count),
      w: new Float32Array(count),
      d: new Float32Array(count),
      h: new Float32Array(count),
      fade: new Float32Array(count),
      runtimes: new Array<MachineRuntime | undefined>(count),
      missing: 0,
      glowRgb: new Float32Array(9),
      glowBaseRgb: new Float32Array(9),
      flash: new Float32Array(count),
      colorTimer: 0,
      zoneOf: new Uint16Array(count),
    };

    // b = 1 endpoints: the saturated accent tokens.
    putAccentEndpoint(anim.glowRgb, 0, FURNACE_GLOW_COLOR);
    putAccentEndpoint(anim.glowRgb, 3, IMPACT_GLOW_COLOR);
    putAccentEndpoint(anim.glowRgb, 6, SCANLINE_COLOR);
    // b = 0 endpoints: the surface each accent sits on. Furnace mouth and press
    // impact plate are cut into steel bodies, so their "off" is cold steel; the
    // scan line hangs in air, so its "off" is the fog (it vanishes).
    putAccentEndpoint(anim.glowBaseRgb, 0, STEEL_COLOR);
    putAccentEndpoint(anim.glowBaseRgb, 3, STEEL_COLOR);
    putAccentEndpoint(anim.glowBaseRgb, 6, FOG_COLOR);

    // The ordered list is grouped by archetype, so the local index is just the
    // distance from the group's first element.
    let cursor = 0;
    for (const arch of ARCHETYPE_ORDER) {
      const groupCount = grouped.groups[arch].length;
      for (let k = 0; k < groupCount; k++) {
        const gi = cursor + k;
        const slot = ordered[gi];
        anim.arch[gi] = ARCHETYPE_CODE[arch];
        anim.local[gi] = k;
        anim.x[gi] = slot.x;
        anim.z[gi] = slot.z;
        anim.cos[gi] = Math.cos(slot.rotationY);
        anim.sin[gi] = Math.sin(slot.rotationY);
        anim.w[gi] = slot.width;
        anim.d[gi] = slot.depth;
        anim.h[gi] = slot.height;
        anim.fade[gi] =
          statusFilter !== "all" && slot.machine.status !== statusFilter ? FILTER_FADE : 0;
        anim.zoneOf[gi] = zoneCull.indexOf.get(slot.zoneId) ?? 0;

        const runtime = simulation.getRuntime(slot.machine.id);
        anim.runtimes[gi] = runtime;
        if (!runtime) anim.missing += 1;

        writeMachineParts(meshes, anim, gi, lite);
      }
      cursor += groupCount;
    }

    // -- flag every mesh: usage hints, culling, bounds ----------------------
    const applyFlags = (mesh: THREE.InstancedMesh | null, part: PartSpec): void => {
      if (!mesh) return;
      if (part.animated) mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        if (part.animatedColor) mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
        mesh.instanceColor.needsUpdate = true;
      }
      // Instanced meshes each cover the whole floor — culling them per object
      // buys nothing and a stale bounding sphere would pop the floor away.
      mesh.frustumCulled = false;
      // Still needed on pick targets: InstancedMesh.raycast rejects rays against
      // the bounding sphere before testing individual instances.
      if (part.pick) mesh.computeBoundingSphere();
    };

    for (const part of SHARED_PARTS) applyFlags(meshes.get(`shared:${part.id}`) ?? null, part);
    for (const arch of ARCHETYPE_ORDER) {
      for (const part of ARCHETYPE_PARTS[arch]) {
        applyFlags(meshes.get(`${arch}:${part.id}`) ?? null, part);
      }
    }

    // -- outline shells: share the BODY's instanceMatrix object, don't copy --
    // Reassigning `.instanceMatrix` to the same BufferAttribute instance body
    // already writes into means every future `body.instanceMatrix.needsUpdate`
    // (set every frame the body moves) is ALSO true for the outline, because
    // it is literally the same object — no separate write path, no chance of
    // the outline lagging the body by a frame, and the renderer's WebGL
    // buffer cache (keyed by the attribute object) uploads it only once even
    // though two InstancedMeshes now read it.
    for (const arch of ARCHETYPE_ORDER) {
      const bodyMesh = meshes.get(`${arch}:body`) ?? null;
      const outlineMesh = meshes.get(`${arch}:outline`) ?? null;
      if (!outlineMesh) continue;
      if (bodyMesh) {
        outlineMesh.instanceMatrix = bodyMesh.instanceMatrix;
        outlineMesh.count = bodyMesh.count;
      }
      outlineMesh.frustumCulled = false;
      if (outlineMesh.instanceColor) outlineMesh.instanceColor.needsUpdate = true;
    }

    animRef.current = anim;
  }, [ordered, grouped, count, statusFilter, simulation, lite, zoneCull]);

  // -- the single animation loop for every machine on the floor -------------
  useFrame((state, rawDelta) => {
    const anim = animRef.current;
    if (!anim) return;
    const n = anim.count;
    if (n === 0) return;

    // FPS cap: skip the whole walk until the budgeted interval has elapsed.
    // `lite` (auto-forced once machines.length > 250, i.e. our ~973-machine
    // floor) caps at 30 Hz; the full-quality path caps at 60 Hz — both well
    // above what the eye needs for these slow mechanical animations, and far
    // cheaper than running every render frame.
    frameAccRef.current += rawDelta;
    const interval = lite ? 1 / 30 : 1 / 60;
    if (hasRunRef.current && frameAccRef.current < interval) return;
    const delta = frameAccRef.current;
    frameAccRef.current = 0;
    hasRunRef.current = true;
    decimateTickRef.current = (decimateTickRef.current + 1) % 4;
    const decimateTick = decimateTickRef.current;

    // -- per-zone visibility/LOD gate, same decimated cadence as the walk --
    // One frustum test and one distance test per HALL (not per machine): the
    // camera only moves once per executed tick from this loop's point of
    // view, so recomputing here is exactly as fresh as everything else the
    // walk writes this tick, at a cost of ~10-30 sphere tests instead of the
    // ~1000 a per-machine test would cost.
    {
      const camera = state.camera;
      CULL_VIEW_PROJ.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      CULL_FRUSTUM.setFromProjectionMatrix(CULL_VIEW_PROJ);
      const cx = zoneCull.cx;
      const cy = zoneCull.cy;
      const cz = zoneCull.cz;
      const radius = zoneCull.radius;
      const active = zoneCull.active;
      const culledElapsed = zoneCull.culledElapsed;
      const camX = camera.position.x;
      const camY = camera.position.y;
      const camZ = camera.position.z;
      for (let zi = 0; zi < zoneCull.count; zi++) {
        CULL_SPHERE.center.set(cx[zi], cy[zi], cz[zi]);
        // `radius[zi]` already has ZONE_CULL_MARGIN_FACTOR baked in (see the
        // zoneCull useMemo) — do not pad it again here.
        CULL_SPHERE.radius = radius[zi];
        let zoneIsActive: boolean;
        if (!CULL_FRUSTUM.intersectsSphere(CULL_SPHERE)) {
          zoneIsActive = false;
        } else {
          const dx = cx[zi] - camX;
          const dy = cy[zi] - camY;
          const dz = cz[zi] - camZ;
          zoneIsActive = dx * dx + dy * dy + dz * dz <= lodDistanceSq;
        }
        if (zoneIsActive) {
          // Consumed by the per-machine loop below this tick as a one-off
          // flash catch-up, then must be zeroed for the NEXT tick — done
          // there (not here) because the machine loop still needs this
          // value once more after we overwrite `active[zi]`.
          active[zi] = 1;
        } else {
          // Real time this hall has spent culled, accumulated at this
          // decimated tick's own delta — NOT machine-walked, O(zones) only.
          // This is what lets `flash` decay correctly in real time while
          // the per-machine walk below is skipped for this zone.
          culledElapsed[zi] += delta;
          active[zi] = 0;
        }
      }
    }

    const meshes = registryRef.current.meshes;
    const t = state.clock.elapsedTime;

    anim.colorTimer -= delta;
    const writeColor = anim.colorTimer <= 0;
    if (writeColor) anim.colorTimer = COLOR_INTERVAL;

    // Resolve every animated buffer ONCE per frame (never per machine).
    // (the old beacon dome was resolved here too; it is now a static PLC
    // stack light written once in `writeMachineParts` — see that block above
    // `STACK_LAMP_LIT` — so there is nothing for this frame loop to touch.)
    const cncSpindle = meshes.get("cnc:spindle") ?? null;
    const cncArr = cncSpindle ? cncSpindle.instanceMatrix.array : null;

    const pressRam = meshes.get("press:ram") ?? null;
    const ramArr = pressRam ? pressRam.instanceMatrix.array : null;
    const pressImpact = meshes.get("press:impact") ?? null;
    const impactAttr = pressImpact ? pressImpact.instanceColor : null;
    const impactArr = writeColor && impactAttr ? impactAttr.array : null;

    const furnaceDoor = meshes.get("furnace:door") ?? null;
    const doorArr = furnaceDoor ? furnaceDoor.instanceMatrix.array : null;
    const furnaceGlow = meshes.get("furnace:glow") ?? null;
    const glowAttr = furnaceGlow ? furnaceGlow.instanceColor : null;
    const glowArr = writeColor && glowAttr ? glowAttr.array : null;

    const asmArm = meshes.get("assembly:arm") ?? null;
    const armArr = asmArm ? asmArm.instanceMatrix.array : null;

    const robotLower = meshes.get("robot:lower") ?? null;
    const lowerArr = robotLower ? robotLower.instanceMatrix.array : null;
    const robotUpper = meshes.get("robot:upper") ?? null;
    const upperArr = robotUpper ? robotUpper.instanceMatrix.array : null;
    const robotWrist = meshes.get("robot:wrist") ?? null;
    const wristArr = robotWrist ? robotWrist.instanceMatrix.array : null;

    const tankPaddle = meshes.get("tank:paddle") ?? null;
    const paddleArr = tankPaddle ? tankPaddle.instanceMatrix.array : null;
    const tankLiquid = meshes.get("tank:liquid") ?? null;
    const liquidArr = tankLiquid ? tankLiquid.instanceMatrix.array : null;

    const scanner = meshes.get("inspection:scanner") ?? null;
    const scannerArr = scanner ? scanner.instanceMatrix.array : null;
    const scanline = meshes.get("inspection:scanline") ?? null;
    const scanlineArr = scanline ? scanline.instanceMatrix.array : null;
    const scanlineAttr = scanline ? scanline.instanceColor : null;
    const scanlineColorArr = writeColor && scanlineAttr ? scanlineAttr.array : null;

    const packPusher = meshes.get("packing:pusher") ?? null;
    const pusherArr = packPusher ? packPusher.instanceMatrix.array : null;

    const glowRgb = anim.glowRgb;
    const glowBase = anim.glowBaseRgb;
    const flash = anim.flash;

    // A machine can appear in the layout a tick before the simulation knows
    // about it (an externally owned sim re-syncs in an effect). Refill the
    // index-aligned runtime array on the throttled tick instead of doing a Map
    // lookup for every machine on every frame.
    if (writeColor && anim.missing > 0) {
      let missing = 0;
      for (let i = 0; i < n; i++) {
        if (anim.runtimes[i] === undefined) {
          const rt = simulation.getRuntime(anim.ordered[i].machine.id);
          anim.runtimes[i] = rt;
          if (!rt) missing += 1;
        }
      }
      anim.missing = missing;
    }

    const scanPulse = 0.55 + 0.45 * Math.sin(t * 7.5);

    const zoneActive = zoneCull.active;
    const zoneCulledElapsed = zoneCull.culledElapsed;

    for (let i = 0; i < n; i++) {
      // Visibility/LOD gate: the machine's hall is off-screen or far beyond
      // ANIM_LOD_DISTANCE_FACTOR * suggestedCameraDistance. Its instances stay
      // exactly where they were last written — they are either not rendered
      // at all (frustum case, so nothing is visibly frozen) or too small on
      // screen for the articulation to read (distance case). The moment its
      // zone re-enters `zoneActive`, this same loop resumes writing this
      // machine's CURRENT pose from the simulation's absolute `phase` /
      // `cycleProgress` on the very next executed tick — that part really is
      // stateless and needs no resync. `flash` is the one exception: it is
      // genuinely incremental (only ever decays, or gets re-armed by a
      // cycleTick — never derived fresh from an absolute value), so it is
      // NOT safe to just skip here; a naive `continue` would freeze it at
      // whatever value it had when the hall went out of view and replay it
      // stale + too bright once the hall comes back. We do NOT fix this with
      // a per-machine walk over culled machines (that would defeat the whole
      // point of per-zone culling) — instead the cull-test block above
      // tracks `culledElapsed` per ZONE (O(zones)), and the moment a zone
      // flips back to active we apply that accumulated real time as a single
      // catch-up decay below, once per machine, as part of this same loop
      // pass that was going to touch the machine anyway.
      if (!zoneActive[anim.zoneOf[i]]) continue;

      const runtime = anim.runtimes[i];
      const zi = anim.zoneOf[i];
      // Catch-up: real seconds this machine's zone spent culled since it was
      // last active (0 if it was already active last tick, or on a freshly
      // mounted layout). Folding it into this tick's decay keeps `flash`
      // exactly what it would have been had the zone never been culled.
      const catchUp = zoneCulledElapsed[zi];
      // Zero it right after reading: this loop only reaches a machine whose
      // zone is active, so the first machine of a just-reactivated zone
      // consumes the whole accumulated catch-up and every later machine in
      // the same zone (this tick or any future one) correctly sees 0 —
      // without this the catch-up would be re-applied to every machine in
      // the zone every tick forever, decaying `flash` far too fast.
      if (catchUp !== 0) zoneCulledElapsed[zi] = 0;

      let f = flash[i];
      if (f > 0) {
        f -= (delta + catchUp) * FLASH_DECAY;
        if (f < 0) f = 0;
      }

      // The old beacon read `activity` here to pick an idle-breathe / down-blink
      // / maintenance-pulse curve (`level`). The stack light replacing it is
      // status-driven and static (see `STACK_LAMP_LIT`), so that branch and
      // its four BEACON_* rate/amplitude constants are gone — `activity` below
      // is now only consulted for `running` (door/scan/bob motion) and the
      // furnace/impact `f` flash, both pre-existing and still needed.
      let cp = 0;
      let spin = 0;
      let running = false;
      let temp = 40;

      if (runtime !== undefined) {
        if (runtime.cycleTick) f = 1;
        // `phase` integrates spindleRpm inside the simulation, so it freezes on
        // its own for down/maintenance machines — no extra branch needed.
        spin = runtime.phase * TAU;
        cp = runtime.cycleProgress;
        temp = runtime.tempC;
        if (runtime.activity === "running") running = true;
      }
      flash[i] = f;

      // `vis` scales every accent's lerp position, so a filtered machine's
      // animated parts stay at their pale base colour instead of darkening.
      const vis = 1 - anim.fade[i];

      // Cheap decimation: a machine that is already faded out (filtered by
      // status) is barely visible, so its moving parts only need refreshing
      // on every 4th executed tick rather than every one. Its beacon/base
      // placement was already written once by the layout effect, so skipping
      // frames here never leaves a part unplaced.
      if (vis < 0.5 && (i & 3) !== decimateTick) continue;

      const li = anim.local[i];
      const cx = anim.cos[i];
      const sz = anim.sin[i];
      const wx = anim.x[i];
      const wz = anim.z[i];
      const w = anim.w[i];
      const h = anim.h[i];

      // ping-pong 0..1..0 across the cycle
      const tri = cp < 0.5 ? cp * 2 : 2 - cp * 2;

      switch (anim.arch[i]) {
        case 0: {
          // cnc — spindle spins on Y and traverses along the machine's local X
          if (cncArr !== null) {
            const o = li * 16;
            const lx = (tri * 2 - 1) * w * CNC_TRAVEL;
            const c = Math.cos(spin);
            const s = Math.sin(spin);
            cncArr[o] = c;
            cncArr[o + 2] = -s;
            cncArr[o + 8] = s;
            cncArr[o + 10] = c;
            cncArr[o + 12] = wx + cx * lx;
            cncArr[o + 14] = wz - sz * lx;
          }
          break;
        }

        case 1: {
          // press — sharp down stroke, slow return; local Y only
          if (ramArr !== null) {
            let u = 0;
            if (running || cp > 0) {
              u =
                cp < PRESS_DOWN_FRACTION
                  ? cp / PRESS_DOWN_FRACTION
                  : 1 - (cp - PRESS_DOWN_FRACTION) / (1 - PRESS_DOWN_FRACTION);
            }
            ramArr[li * 16 + 13] = h * (PRESS_RAM_TOP - PRESS_STROKE * u);
          }
          if (impactArr !== null) {
            // was `f * 2.2` (a clipped white flash); now a lerp from the dark
            // bronze rest state to the full amber token, capped at b = 1
            const b = (IMPACT_MIN + (1 - IMPACT_MIN) * f) * vis;
            const j = li * 3;
            impactArr[j] = glowBase[3] + (glowRgb[3] - glowBase[3]) * b;
            impactArr[j + 1] = glowBase[4] + (glowRgb[4] - glowBase[4]) * b;
            impactArr[j + 2] = glowBase[5] + (glowRgb[5] - glowBase[5]) * b;
          }
          break;
        }

        case 2: {
          // furnace — door lifts mid-cycle, glow plate tracks temperature
          if (doorArr !== null) {
            const open = running ? Math.sin(cp * Math.PI) : 0;
            doorArr[li * 16 + 13] = h * (FURNACE_DOOR_Y + FURNACE_DOOR_LIFT * open);
          }
          if (glowArr !== null) {
            const hot = clamp01((temp - 30) / 70);
            // was `0.3 + 1.7 * hot + f * 0.5` — up to 2.5, i.e. white above ~55 °C
            // and the whole temperature range invisible. Now the full 30…100 °C
            // range maps onto FURNACE_MIN…1 of the cold-steel→ember lerp, so a
            // hot furnace is a deep saturated ember and a cold one is grey steel.
            const b = clamp01(FURNACE_MIN + FURNACE_SPAN * hot + f * 0.12) * vis;
            const j = li * 3;
            glowArr[j] = glowBase[0] + (glowRgb[0] - glowBase[0]) * b;
            glowArr[j + 1] = glowBase[1] + (glowRgb[1] - glowBase[1]) * b;
            glowArr[j + 2] = glowBase[2] + (glowRgb[2] - glowBase[2]) * b;
          }
          break;
        }

        case 3: {
          // assembly — tool arm yaws around its pivot at the bench centre
          if (armArr !== null) {
            const a = (tri * 2 - 1) * ASSEMBLY_ARM_SWEEP;
            const ca = Math.cos(a);
            const sa = Math.sin(a);
            // arm centre sits ASSEMBLY_ARM_R out along its own X axis
            const lx = ASSEMBLY_ARM_R * ca;
            const lz = -ASSEMBLY_ARM_R * sa;
            // slot rotation composed with the local yaw (both about Y)
            const cc = cx * ca - sz * sa;
            const ss = sz * ca + cx * sa;
            const o = li * 16;
            armArr[o] = cc;
            armArr[o + 2] = -ss;
            armArr[o + 8] = ss;
            armArr[o + 10] = cc;
            armArr[o + 12] = wx + cx * lx + sz * lz;
            armArr[o + 14] = wz - sz * lx + cx * lz;
          }
          break;
        }

        case 4: {
          // robot — pitching arm pair needs a real compose (position + rotation)
          const pedH = h * ROBOT_PED_H;
          const l1 = h * ROBOT_L1;
          const l2 = h * ROBOT_L2;
          const reach = Math.sin(cp * TAU);
          const p1 = -0.16 + 0.5 * reach;
          const p2 = p1 - (1.05 + 0.45 * reach);
          const c1 = Math.cos(p1);
          const s1 = Math.sin(p1);
          const c2 = Math.cos(p2);
          const s2 = Math.sin(p2);
          const elbowY = pedH + l1 * c1;
          const elbowZ = l1 * s1;

          loadBase(anim, i);

          if (lowerArr !== null) {
            DUMMY.position.set(0, pedH + l1 * 0.5 * c1, l1 * 0.5 * s1);
            DUMMY.rotation.set(p1, 0, 0);
            DUMMY.scale.set(0.16, l1, 0.16);
            DUMMY.updateMatrix();
            OUT_MAT.multiplyMatrices(BASE_MAT, DUMMY.matrix);
            OUT_MAT.toArray(lowerArr, li * 16);
          }
          if (upperArr !== null) {
            DUMMY.position.set(0, elbowY + l2 * 0.5 * c2, elbowZ + l2 * 0.5 * s2);
            DUMMY.rotation.set(p2, 0, 0);
            DUMMY.scale.set(0.13, l2, 0.13);
            DUMMY.updateMatrix();
            OUT_MAT.multiplyMatrices(BASE_MAT, DUMMY.matrix);
            OUT_MAT.toArray(upperArr, li * 16);
          }
          if (wristArr !== null) {
            // wrist only spins about its own vertical axis, so a Y rotation
            // composes with the slot rotation and stays a direct element write
            const lz = elbowZ + l2 * s2;
            const ly = elbowY + l2 * c2;
            const ws = spin + cp * TAU * 2;
            const c = Math.cos(ws);
            const s = Math.sin(ws);
            const cc = cx * c - sz * s;
            const ss = sz * c + cx * s;
            const o = li * 16;
            wristArr[o] = cc;
            wristArr[o + 2] = -ss;
            wristArr[o + 8] = ss;
            wristArr[o + 10] = cc;
            wristArr[o + 12] = wx + sz * lz;
            wristArr[o + 13] = ly;
            wristArr[o + 14] = wz + cx * lz;
          }
          break;
        }

        case 5: {
          // tank — agitator paddle spins, liquid surface bobs
          if (paddleArr !== null) {
            const a = spin * 1.6;
            const c = Math.cos(a);
            const s = Math.sin(a);
            const cc = cx * c - sz * s;
            const ss = sz * c + cx * s;
            const o = li * 16;
            paddleArr[o] = cc;
            paddleArr[o + 2] = -ss;
            paddleArr[o + 8] = ss;
            paddleArr[o + 10] = cc;
          }
          if (liquidArr !== null) {
            const bob = (running ? 0.035 : 0.01) * Math.sin(t * 1.9 + i * 0.31);
            liquidArr[li * 16 + 13] = h * TANK_LIQUID_Y + bob;
          }
          break;
        }

        case 6: {
          // inspection — scanner bar sweeps the gantry, scan line pulses
          const lx = (tri * 2 - 1) * w * INSPECT_TRAVEL;
          const px = wx + cx * lx;
          const pz = wz - sz * lx;
          if (scannerArr !== null) {
            const o = li * 16;
            scannerArr[o + 12] = px;
            scannerArr[o + 14] = pz;
          }
          if (scanlineArr !== null) {
            const o = li * 16;
            scanlineArr[o + 12] = px;
            scanlineArr[o + 14] = pz;
          }
          if (scanlineColorArr !== null) {
            // was `0.6 + 1.5 * scanPulse` (up to 2.1 — a white bar). The sweep
            // now pulses between a mid and a fully saturated deep cyan against
            // the fog base, which is what actually moves on a pale slab.
            const b = (running ? SCANLINE_MIN + SCANLINE_SPAN * scanPulse : SCANLINE_IDLE) * vis;
            const j = li * 3;
            scanlineColorArr[j] = glowBase[6] + (glowRgb[6] - glowBase[6]) * b;
            scanlineColorArr[j + 1] = glowBase[7] + (glowRgb[7] - glowBase[7]) * b;
            scanlineColorArr[j + 2] = glowBase[8] + (glowRgb[8] - glowBase[8]) * b;
          }
          break;
        }

        case 7: {
          // packing — pusher strokes sideways once per cycle (local X)
          if (pusherArr !== null) {
            const u =
              cp < PACK_PUSH_FRACTION
                ? cp / PACK_PUSH_FRACTION
                : 1 - (cp - PACK_PUSH_FRACTION) / (1 - PACK_PUSH_FRACTION);
            const lx = w * PACK_PUSHER_TRAVEL * (u - 0.5);
            const o = li * 16;
            pusherArr[o + 12] = wx + cx * lx;
            pusherArr[o + 14] = wz - sz * lx;
          }
          break;
        }

        default:
          break;
      }
      // No beacon write here any more — the stack light is a static part,
      // written once by `writeMachineParts` and never touched by this loop.
    }

    // Zero the catch-up debt for every zone that is active as of this tick:
    // any machine in it just consumed `zoneCulledElapsed[zi]` above, so the
    // debt is fully paid off and must not be re-applied next tick. O(zones),
    // same cost class as the cull test itself — not a per-machine walk.
    for (let zi = 0; zi < zoneCull.count; zi++) {
      if (zoneActive[zi]) zoneCulledElapsed[zi] = 0;
    }

    // -- flush only what actually changed ----------------------------------
    if (cncSpindle) cncSpindle.instanceMatrix.needsUpdate = true;
    if (pressRam) pressRam.instanceMatrix.needsUpdate = true;
    if (furnaceDoor) furnaceDoor.instanceMatrix.needsUpdate = true;
    if (asmArm) asmArm.instanceMatrix.needsUpdate = true;
    if (robotLower) robotLower.instanceMatrix.needsUpdate = true;
    if (robotUpper) robotUpper.instanceMatrix.needsUpdate = true;
    if (robotWrist) robotWrist.instanceMatrix.needsUpdate = true;
    if (tankPaddle) tankPaddle.instanceMatrix.needsUpdate = true;
    if (tankLiquid) tankLiquid.instanceMatrix.needsUpdate = true;
    if (scanner) scanner.instanceMatrix.needsUpdate = true;
    if (scanline) scanline.instanceMatrix.needsUpdate = true;
    if (packPusher) packPusher.instanceMatrix.needsUpdate = true;
    if (impactArr !== null && impactAttr) impactAttr.needsUpdate = true;
    if (glowArr !== null && glowAttr) glowAttr.needsUpdate = true;
    if (scanlineColorArr !== null && scanlineAttr) scanlineAttr.needsUpdate = true;
  });

  // -- picking: one handler set per archetype, mapped through its own slots --
  const handlers = useMemo(() => {
    const make = (list: FloorSlot[]) => ({
      onPointerMove: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        const index = event.instanceId;
        if (index === undefined) return;
        const slot = list[index];
        if (!slot) return;
        onHoverSlot(slot);
        document.body.style.cursor = "pointer";
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onHoverSlot(null);
        document.body.style.cursor = "auto";
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const index = event.instanceId;
        if (index === undefined) return;
        const slot = list[index];
        if (slot) onSelectMachine(slot.machine);
      },
      onDoubleClick: (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const index = event.instanceId;
        if (index === undefined) return;
        const slot = list[index];
        if (slot) onOpenMachine(slot.machine);
      },
    });
    const out = {} as Record<MachineArchetype, ReturnType<typeof make>>;
    for (const arch of ARCHETYPE_ORDER) out[arch] = make(grouped.groups[arch]);
    return out;
  }, [grouped, onHoverSlot, onSelectMachine, onOpenMachine]);

  if (count === 0) return null;

  return (
    <group>
      {SHARED_PARTS.map((part) => (
        <instancedMesh
          key={`shared-${part.id}-${count}`}
          ref={(mesh) => {
            registryRef.current.meshes.set(`shared:${part.id}`, mesh);
          }}
          args={[undefined, undefined, count]}
          raycast={NULL_RAYCAST}
        >
          <PartGeometry part={part} />
          <PartMaterial kind={part.mat} />
        </instancedMesh>
      ))}

      {ARCHETYPE_ORDER.map((arch) => {
        const groupCount = grouped.groups[arch].length;
        if (groupCount === 0) return null;
        const bodyPart = ARCHETYPE_PARTS[arch].find((part) => part.id === "body");
        const parts = ARCHETYPE_PARTS[arch].map((part) => {
          if (lite && part.liteDrop) return null;
          const instances = groupCount * (part.copies ?? 1);
          const pick = part.pick === true;
          return (
            <instancedMesh
              key={`${arch}-${part.id}-${groupCount}`}
              ref={(mesh) => {
                registryRef.current.meshes.set(`${arch}:${part.id}`, mesh);
              }}
              args={[undefined, undefined, instances]}
              raycast={pick ? undefined : NULL_RAYCAST}
              onPointerMove={pick ? handlers[arch].onPointerMove : undefined}
              onPointerOut={pick ? handlers[arch].onPointerOut : undefined}
              onClick={pick ? handlers[arch].onClick : undefined}
              onDoubleClick={pick ? handlers[arch].onDoubleClick : undefined}
            >
              <PartGeometry part={part} />
              <PartMaterial kind={part.mat} />
            </instancedMesh>
          );
        });
        // One extra draw call per archetype (not per machine) for the
        // Sims-style outline shell — see the block above `OUTLINE_SCALE`.
        // `count` is set to `groupCount` here just so React/three allocate a
        // correctly-sized (if temporary) instanceMatrix on construction; the
        // mount effect above immediately replaces it with the body mesh's own
        // instanceMatrix object, so this initial buffer is discarded and never
        // written to directly.
        //
        // PERFORMANCE: dropped entirely in `lite` mode (auto-on above 250
        // machines, i.e. exactly the ~973-machine floor the user is reporting
        // stutter on). This is the single biggest win in this pass — the
        // outline is a second full-geometry InstancedMesh per archetype with
        // its own vertex + fill cost, roughly DOUBLING the vertex/fill load
        // for every machine body it shadows. `lite` is also where every other
        // "small decorative extra" part (`liteDrop`) already gets cut, so this
        // keeps the outline consistent with the floor's existing quality knob
        // instead of adding a second one. It stays on by default below the
        // 250-machine threshold, where the crisp-outline look this file was
        // built for is essentially free.
        if (bodyPart && !lite) {
          parts.push(
            <instancedMesh
              key={`${arch}-outline-${groupCount}`}
              ref={(mesh) => {
                registryRef.current.meshes.set(`${arch}:outline`, mesh);
              }}
              args={[undefined, undefined, groupCount]}
              raycast={NULL_RAYCAST}
            >
              <OutlineGeometry part={bodyPart} />
              <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} toneMapped={false} />
            </instancedMesh>
          );
        }
        return parts;
      })}
    </group>
  );
}

const MachineInstances = memo(MachineInstancesInner);

// ---------------------------------------------------------------------------
// Highlight group: the detailed geometry, at most two copies on screen
// ---------------------------------------------------------------------------

/**
 * The "pretty" non-instanced machine, shaped to roughly match the hovered
 * machine's archetype. Rendered slightly oversized so it cleanly hides the
 * instanced kit underneath instead of z-fighting with it.
 *
 * LIGHT-THEME HIGHLIGHT. The dark-theme version separated itself by EMISSIVE:
 * `emissive={color} emissiveIntensity={0.32…0.45}` on a body that then glowed
 * out of the black. On a #f2f5fa floor an already-pale `detailBody` plus an
 * emissive term simply climbs to white — the hovered machine became the LEAST
 * defined object on screen. The highlight is now built from three things that
 * all work by contrast instead:
 *   1. the body is TINTED toward the highlight colour (`highlight` amount), so a
 *      hovered machine is a visibly coloured object, not a brighter one;
 *   2. a dark contact ring on the floor at its footprint, which gives the
 *      silhouette a hard edge against the pale slab;
 *   3. the existing solid-colour cap plate on top, unchanged.
 * A trace of emissive (HIGHLIGHT_EMISSIVE) is kept purely so the highlight does
 * not go dead in a shadowed corner of a building interior.
 */
const HIGHLIGHT_EMISSIVE = 0.06;
/** Accent parts are tinted at this fraction of the body's tint amount. */
const HIGHLIGHT_ACCENT_RATIO = 0.7;
/** Body tint on hover (status colour) and on selection (accent blue). */
const HOVER_TINT = 0.5;
const SELECT_TINT = 0.68;

function DetailedMachine({
  slot,
  color,
  lite,
  highlight,
}: {
  slot: FloorSlot;
  color: string;
  lite: boolean;
  /** 0..1 — how far body/accent are lerped toward `color` */
  highlight: number;
}) {
  const { width: w, height: h, depth: d } = slot;
  const arch: MachineArchetype = ARCHETYPE_SET.has(slot.archetype) ? slot.archetype : "cnc";

  // Render-time (not per-frame) allocation, memoised on the two inputs.
  const tints = useMemo(() => {
    const target = new THREE.Color(color);
    const body = new THREE.Color(LIVE_FLOOR_THEME.detailBody).lerp(target, highlight);
    const accentTint = new THREE.Color(LIVE_FLOOR_THEME.detailAccent).lerp(
      target,
      highlight * HIGHLIGHT_ACCENT_RATIO
    );
    return { body, accent: accentTint };
  }, [color, highlight]);

  const bodyMaterial = (
    <meshStandardMaterial
      color={tints.body}
      metalness={0.24}
      roughness={0.46}
      emissive={color}
      emissiveIntensity={HIGHLIGHT_EMISSIVE}
    />
  );
  const accentMaterial = (
    <meshStandardMaterial color={tints.accent} metalness={0.3} roughness={0.5} />
  );
  const footprint = Math.max(w, d) * 0.62;

  let shape: ReactElement;
  switch (arch) {
    case "robot":
      shape = (
        <>
          <mesh position={[0, h * ROBOT_PED_H * 0.55, 0]}>
            <cylinderGeometry args={[w * 0.34, w * 0.38, h * ROBOT_PED_H * 1.1, 12]} />
            {bodyMaterial}
          </mesh>
          <mesh position={[0, h * (ROBOT_PED_H + ROBOT_L1 * 0.5), 0]}>
            <boxGeometry args={[0.2, h * ROBOT_L1, 0.2]} />
            {accentMaterial}
          </mesh>
          <mesh position={[0, h * (ROBOT_PED_H + ROBOT_L1 + ROBOT_L2 * 0.4), d * 0.12]}>
            <boxGeometry args={[0.16, h * ROBOT_L2, 0.16]} />
            {accentMaterial}
          </mesh>
        </>
      );
      break;
    case "tank":
      shape = (
        <>
          <mesh position={[0, h * 0.46, 0]}>
            <cylinderGeometry args={[Math.min(w, d) * 0.46, Math.min(w, d) * 0.46, h * 0.84, 16]} />
            {bodyMaterial}
          </mesh>
          {!lite && (
            <mesh position={[0, h * TANK_PADDLE_Y, 0]}>
              <boxGeometry args={[w * 0.8, 0.08, 0.12]} />
              {accentMaterial}
            </mesh>
          )}
        </>
      );
      break;
    case "inspection":
      shape = (
        <>
          <RoundedBox
            args={[w * 1.02, h * 0.24, d * 0.94]}
            radius={0.05}
            smoothness={2}
            position={[0, h * 0.12, 0]}
          >
            {bodyMaterial}
          </RoundedBox>
          <mesh position={[-w * 0.44, h * 0.52, 0]}>
            <boxGeometry args={[0.14, h * 0.9, 0.14]} />
            {accentMaterial}
          </mesh>
          <mesh position={[w * 0.44, h * 0.52, 0]}>
            <boxGeometry args={[0.14, h * 0.9, 0.14]} />
            {accentMaterial}
          </mesh>
          <mesh position={[0, h * 0.96, 0]}>
            <boxGeometry args={[w * 0.96, 0.14, d * 0.18]} />
            {accentMaterial}
          </mesh>
        </>
      );
      break;
    case "press":
      shape = (
        <>
          <RoundedBox
            args={[w * 0.9, h * 0.46, d * 0.94]}
            radius={0.06}
            smoothness={2}
            position={[0, h * 0.23, 0]}
          >
            {bodyMaterial}
          </RoundedBox>
          <mesh position={[-w * 0.36, h * 0.58, 0]}>
            <boxGeometry args={[w * 0.18, h * 0.94, d * 0.66]} />
            {accentMaterial}
          </mesh>
          <mesh position={[w * 0.36, h * 0.58, 0]}>
            <boxGeometry args={[w * 0.18, h * 0.94, d * 0.66]} />
            {accentMaterial}
          </mesh>
          <mesh position={[0, h * 1.0, 0]}>
            <boxGeometry args={[w * 0.9, h * 0.16, d * 0.72]} />
            {accentMaterial}
          </mesh>
        </>
      );
      break;
    case "furnace":
      shape = (
        <>
          <RoundedBox
            args={[w * 1.0, h * 0.78, d * 1.0]}
            radius={0.07}
            smoothness={2}
            position={[0, h * 0.39, 0]}
          >
            {bodyMaterial}
          </RoundedBox>
          {!lite && (
            <mesh position={[w * 0.28, h * 1.08, -d * 0.3]}>
              <cylinderGeometry args={[0.13, 0.13, h * 0.7, 10]} />
              {accentMaterial}
            </mesh>
          )}
        </>
      );
      break;
    case "packing":
    case "assembly":
      shape = (
        <>
          <RoundedBox
            args={[w * 0.96, h * 0.62, d * 0.92]}
            radius={0.06}
            smoothness={2}
            position={[0, h * 0.31, 0]}
          >
            {bodyMaterial}
          </RoundedBox>
          <mesh
            position={
              arch === "assembly" ? [0, h * 0.8, -d * 0.34] : [-w * 0.34, h * 0.8, 0]
            }
          >
            <boxGeometry args={[w * (arch === "assembly" ? 0.9 : 0.34), h * 0.4, d * 0.2]} />
            {accentMaterial}
          </mesh>
        </>
      );
      break;
    case "cnc":
    default:
      shape = (
        <>
          <RoundedBox
            args={[w * 1.0, h * 0.98, d * 1.0]}
            radius={0.07}
            smoothness={2}
            position={[0, h * 0.49, 0]}
          >
            {bodyMaterial}
          </RoundedBox>
          {!lite && (
            <mesh position={[w * 0.56, h * 0.36, d * 0.2]}>
              <boxGeometry args={[w * 0.22, h * 0.52, d * 0.34]} />
              {accentMaterial}
            </mesh>
          )}
        </>
      );
      break;
  }

  return (
    <>
      {shape}
      {/* solid-colour cap plate: brightness 1, exact token, reads at any distance */}
      <mesh position={[0, h * 1.04, 0]}>
        <boxGeometry args={[w * 0.5, h * 0.05, d * 0.5]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* dark contact ring — the outline that replaces the old emissive bloom.
          y=0.075 sits just above the facility's floor stack, like ContactShadows. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.075, 0]}>
        <ringGeometry args={[footprint, footprint * 1.12, 40]} />
        <meshBasicMaterial
          color={DARK_STEEL_COLOR}
          toneMapped={false}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function HoverHighlight({ slot, lite }: { slot: FloorSlot; lite: boolean }) {
  const { machine, height } = slot;
  const color = statusColor(machine.status);
  const archLabel = ARCHETYPE_LABELS[slot.archetype] ?? "";
  return (
    <group position={[slot.x, 0, slot.z]} rotation={[0, slot.rotationY, 0]}>
      <DetailedMachine slot={slot} color={color} lite={lite} highlight={HOVER_TINT} />
      <Html
        position={[0, height + 0.6, 0]}
        distanceFactor={10}
        occlude={false}
        style={{ pointerEvents: "none" }}
      >
        {/* light card: white glass, app ink, hairline status border, soft shadow */}
        <div
          style={{
            background: LIVE_FLOOR_THEME.hud.panelBg,
            border: `1px solid ${color}`,
            borderRadius: "4px",
            padding: "4px 8px",
            color: LIVE_FLOOR_THEME.labelText,
            fontFamily: "sans-serif",
            fontSize: "11px",
            whiteSpace: "nowrap",
            boxShadow: HTML_SHADOW,
          }}
        >
          <div style={{ fontWeight: 600 }}>{machine.code ?? machine.id}</div>
          <div>{machine.name}</div>
          {archLabel && (
            <div style={{ color: LIVE_FLOOR_THEME.hud.textMuted }}>ประเภท: {archLabel}</div>
          )}
          <div style={{ color, fontWeight: 600 }}>{STATUS_LABEL_TH[machine.status]}</div>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Selection marker: detailed body + rotating ring + light column + callout
// ---------------------------------------------------------------------------

function SelectionMarker({ slot, lite }: { slot: FloorSlot; lite: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const { machine, height } = slot;
  const color = statusColor(machine.status);
  const archLabel = ARCHETYPE_LABELS[slot.archetype] ?? "";
  const ringInner = Math.max(slot.width, slot.depth) * 0.62;

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.2;
    }
  });

  return (
    <group position={[slot.x, 0, slot.z]} rotation={[0, slot.rotationY, 0]}>
      <DetailedMachine slot={slot} color={ACCENT_COLOR} lite={lite} highlight={SELECT_TINT} />

      {/* Ring and column are already DARKER than the floor (`accent` is #0066cc),
          so they need no glow — only enough opacity to stay saturated. Both were
          semi-transparent to fake additive bloom on black; on a pale floor
          transparency only washes them out, so the ring is now opaque and the
          column's alpha is raised from 0.35 to 0.55. `toneMapped={false}` keeps
          them at the exact accent token, matching the 2D HUD's accent. */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.14, 0]}>
        <ringGeometry args={[ringInner, ringInner * 1.13, 32]} />
        <meshBasicMaterial color={ACCENT_COLOR} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, height * 1.5, 0]}>
        <cylinderGeometry args={[0.035, 0.035, height * 3, 8]} />
        <meshBasicMaterial color={ACCENT_COLOR} toneMapped={false} transparent opacity={0.55} />
      </mesh>

      <Html
        position={[0, height + 1.1, 0]}
        distanceFactor={9}
        occlude={false}
        style={{ pointerEvents: "none" }}
      >
        {/* light card: the dark-glass panel + outer cyan glow become white glass,
            an accent hairline and a soft grey drop shadow (HTML_SHADOW) */}
        <div
          style={{
            background: LIVE_FLOOR_THEME.hud.panelBg,
            border: `1px solid ${ACCENT_COLOR}`,
            boxShadow: HTML_SHADOW,
            borderRadius: "6px",
            padding: "8px 12px",
            color: LIVE_FLOOR_THEME.labelText,
            fontFamily: "sans-serif",
            fontSize: "12px",
            minWidth: "160px",
          }}
        >
          <div style={{ fontWeight: 700, color: ACCENT_COLOR }}>{machine.code ?? machine.id}</div>
          <div>{machine.name}</div>
          {archLabel && (
            <div style={{ color: LIVE_FLOOR_THEME.hud.textMuted }}>ประเภทเครื่อง: {archLabel}</div>
          )}
          <div style={{ color, fontWeight: 600 }}>{STATUS_LABEL_TH[machine.status]}</div>
          <div style={{ marginTop: "4px", color: LIVE_FLOOR_THEME.hud.textMuted }}>
            {machine.healthScore !== null && <div>คะแนนสุขภาพ: {machine.healthScore}</div>}
            {machine.spindleTemp !== null && <div>อุณหภูมิสปินเดิล: {machine.spindleTemp}°C</div>}
            {machine.vibrationMms !== null && <div>ความสั่นสะเทือน: {machine.vibrationMms} mm/s</div>}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------

// -- daylight rig numbers -----------------------------------------------------
//
// Budget, not taste: a top-facing surface receives HEMI_INTENSITY (full sky) +
// KEY_INTENSITY * NdotL (~0.79 at this sun elevation) + AMBIENT_INTENSITY +
// a little bounce = ~0.98. The floor's albedo (#f2f5fa) is ~0.887 in linear
// space, so the brightest pixel in the scene lands near 0.87 linear — under
// NeutralToneMapping that maps to ~0.90 sRGB: a bright overcast concrete, with
// real headroom left before white. Raising any of these blows the floor out and
// every pale machine merges into it.
/** Uniform lift so deep interiors are never crushed; deliberately small. */
const AMBIENT_INTENSITY = 0.08;
/** Sky dome (pale blue above) over ground bounce (the floor colour below). */
const HEMI_INTENSITY = 0.36;
/** Warm sun. Direction only — a directionalLight ignores the distance. */
const KEY_INTENSITY = 0.38;
/** Cool counter-fill from the opposite, low side: keeps away-faces from flattening. */
const FILL_INTENSITY = 0.12;
/**
 * scene.environmentIntensity multiplier for the procedural room-IBL below.
 * This is what actually buys the reflections: it feeds `envMap` on every
 * PBR material (metalness > 0), giving steel/chrome parts a directional,
 * many-highlight look instead of the flat matte a light rig alone can ever
 * produce. It ALSO adds diffuse IBL to everything else, which is why
 * AMBIENT/HEMI/KEY/FILL above were all trimmed from their pre-IBL values —
 * same total budget (brightest pixel still ~0.90 sRGB under
 * NeutralToneMapping), just redistributed from four flat lights into one
 * lit environment.
 */
const ENVIRONMENT_INTENSITY = 0.35;

/**
 * Daylight rig. THE DARK-THEME RIG IS GONE: it was a 0.35 ambient plus two neon
 * POINT lights (intensity 30 / 18 in candela) whose only job was to peel dark
 * machine silhouettes off a black void. There is no void any more — a pale
 * machine against a pale floor separates by SHADING, not by rim light — and two
 * point lights at ±8 m from the origin lit a ~20 m bubble on a 326 x 194 m site,
 * so they were also a per-fragment cost that most of the plant never saw.
 *
 * What replaces them:
 * — `hemisphereLight`  : the actual daylight fill. Sky = `light.rimA` (the pale
 *                        blue that used to be a rim light, now correctly used as
 *                        sky), ground = the floor colour, so upward-facing faces
 *                        get sky and downward-facing faces get floor bounce.
 *                        This is what makes pale surfaces read as LIT concrete
 *                        rather than washed-out mud: it is directional in Y, so
 *                        it produces a gradient instead of a flat wash.
 * — `directionalLight` : the warm key, from a believable mid-morning sun —
 *                        ~50° elevation, from the front-right. Infinite, so it
 *                        lights the whole campus identically.
 * — `directionalLight` : a weak cool counter-fill, low on the opposite side.
 *                        This is the only survivor of the rim-light idea, at a
 *                        third of the old ambient's strength.
 *
 * The key still deliberately does NOT cast shadows. three.js's default shadow
 * camera covers ±5 units, so on a 326 x 194 m site only a 10 x 10 m patch at the
 * origin could ever receive one — and nothing there does: the facility's static
 * layer, grass and asphalt all opt out of `receiveShadow`. The whole shadow pass
 * rendered a full depth map for zero visible pixels. `<ContactShadows>` under
 * the machines provides the grounding cue instead.
 *
 * drei's `<Environment preset=...>` was considered and rejected: every preset
 * resolves to an HDR fetched from the pmndrs assets CDN, which this app cannot
 * reach at all. Instead, `SceneEnvironment` below renders three's built-in
 * `RoomEnvironment` (a small procedural room of soft-lit panels — no network,
 * no extra dependency, ships inside `three/examples/jsm`) through a
 * `PMREMGenerator`, ONCE, into `scene.environment`. That is what gives the
 * metal/steel PartMaterial surfaces real reflections and depth instead of a
 * flat metalness response — see ENVIRONMENT_INTENSITY above for how its
 * contribution was budgeted against the four lights below.
 */
function SceneLights() {
  return (
    <>
      <ambientLight intensity={AMBIENT_INTENSITY} color={LIVE_FLOOR_THEME.light.ambient} />
      <hemisphereLight
        intensity={HEMI_INTENSITY}
        color={LIVE_FLOOR_THEME.light.rimA}
        groundColor={LIVE_FLOOR_THEME.ground}
      />
      <directionalLight
        position={[42, 60, 30]}
        intensity={KEY_INTENSITY}
        color={LIVE_FLOOR_THEME.light.key}
      />
      <directionalLight
        position={[-40, 14, -26]}
        intensity={FILL_INTENSITY}
        color={LIVE_FLOOR_THEME.light.rimB}
      />
    </>
  );
}

/**
 * Procedural IBL: renders three's `RoomEnvironment` through a `PMREMGenerator`
 * once, on mount, and assigns the resulting cube-mip texture to
 * `scene.environment`. No network fetch (unlike drei's `<Environment preset>`,
 * see the block comment above `SceneLights`) and no new npm dependency —
 * `RoomEnvironment` ships inside the already-installed `three` package.
 *
 * This runs exactly once per mount, not per frame: `fromScene()` renders the
 * small room offscreen a single time, and the resulting PMREM texture is then
 * just sampled by materials like any other envMap for free. Both the
 * generator and its render target's texture are disposed on unmount/cleanup
 * so this never leaks GPU memory across route changes or hot reloads.
 */
function SceneEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envRenderTarget = pmrem.fromScene(room, 0.04);
    scene.environment = envRenderTarget.texture;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;

    // `fromScene()` renders synchronously, so `room` has already been
    // consumed by the time it returns — safe to dispose immediately. `room`
    // is a real THREE.Scene full of box meshes with their own geometries and
    // materials; `pmrem.dispose()` only frees the PMREM generator's internal
    // render targets, NOT a caller-supplied scene, so without this traversal
    // every one of RoomEnvironment's meshes leaks on every mount (StrictMode
    // double-mount, remount, or HMR).
    room.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    return () => {
      scene.environment = null;
      envRenderTarget.texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

// ---------------------------------------------------------------------------
// Simulation stepper — mounted first so its useFrame runs before the animators
// ---------------------------------------------------------------------------

function SimulationStepper({ simulation }: { simulation: FloorSimulation }) {
  useFrame((_, delta) => {
    simulation.step(delta);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Camera rig: smoothly lerps position/target toward preset + selection
// ---------------------------------------------------------------------------

function CameraRig({
  focusKey,
  desiredPos,
  focusTarget,
  minDistance,
  maxDistance,
}: {
  /** changes only on an explicit user intent (preset switch / new selection) */
  focusKey: string;
  desiredPos: THREE.Vector3;
  focusTarget: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  // Whether the camera rig is still driving the camera toward the preset.
  // Once the camera arrives, or the user takes over the controls, this goes
  // false and OrbitControls is left fully in charge (no more lerping).
  const animatingRef = useRef(true);

  // A new preset or a new selection should trigger a fresh fly-to animation.
  // Deliberately NOT keyed on `desiredPos`/`focusTarget`: those also change on
  // a viewport resize (the fit distance depends on the aspect ratio) and on a
  // data refresh that moves the focus hall, and re-arming the animation there
  // would yank the camera away from the user.
  useEffect(() => {
    animatingRef.current = true;
  }, [focusKey]);

  // The FIRST user interaction (drag/scroll/pan) cancels any in-flight
  // animation so the rig never fights the user afterwards.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const handleStart = () => {
      animatingRef.current = false;
    };
    controls.addEventListener("start", handleStart);
    return () => {
      controls.removeEventListener("start", handleStart);
    };
  }, []);

  // Priority -2: drei's <OrbitControls> runs its own controls.update() at
  // priority -1 (it has to, for enableDamping), so the rig lerps FIRST and that
  // single update picks up the new camera position + target in the same frame.
  // The rig used to call controls.update() itself as well, which applied the
  // damping twice for every frame of a fly-to. Negative priorities do not switch
  // R3F to manual rendering (only priority > 0 does), so the loop is unchanged.
  useFrame((_, delta) => {
    if (!animatingRef.current) return;
    const lerpFactor = Math.min(1, delta * 2.2);
    camera.position.lerp(desiredPos, lerpFactor);
    const controls = controlsRef.current;
    if (controls) controls.target.lerp(focusTarget, lerpFactor);
    if (
      camera.position.distanceTo(desiredPos) < 0.05 &&
      (!controls || controls.target.distanceTo(focusTarget) < 0.05)
    ) {
      animatingRef.current = false;
    }
  }, -2);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enablePan
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={minDistance}
      maxDistance={maxDistance}
    />
  );
}

// ---------------------------------------------------------------------------
// Scene contents (inside <Canvas>)
// ---------------------------------------------------------------------------

function SceneContents({
  machines,
  statusFilter,
  selectedMachineId,
  onSelectMachine,
  onOpenMachine,
  cameraPreset,
  highQuality,
  simulation,
  focusBuildingId,
  layout: providedLayout,
  lite,
}: LiveFloor4DSceneProps & { lite: boolean }) {
  // ONE layout instance per `machines` change: the caller's when supplied (the
  // view builds it so its HUD can list the buildings), otherwise built here so
  // the scene keeps working standalone. `buildFloorLayout` is never called when
  // a layout is provided.
  const layout = useMemo(
    () => providedLayout ?? buildFloorLayout(machines),
    [providedLayout, machines]
  );
  const [hoveredSlot, setHoveredSlot] = useState<FloorSlot | null>(null);

  // Own the simulation only when the caller does not supply one.
  const sim = useMemo(
    () => simulation ?? createFloorSimulation(machines),
    [simulation, machines]
  );

  // The instanced mesh can unmount while it is still hovered (data refresh
  // drops the machine, the scene unmounts on exit/Escape). R3F fires no
  // pointerout in that case, so the "pointer" cursor set on hover would stick
  // to the whole document. Always hand the cursor back on unmount.
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    []
  );

  // A layout refresh invalidates the cached hover slot.
  useEffect(() => {
    setHoveredSlot(null);
  }, [layout]);

  const handleHoverSlot = useCallback((slot: FloorSlot | null) => {
    setHoveredSlot(slot);
  }, []);

  const selectedSlot = useMemo(
    () => layout.slots.find((s) => s.machine.id === selectedMachineId) ?? null,
    [layout.slots, selectedMachineId]
  );

  const siteWidth = Math.max(60, layout.site.width);
  const siteDepth = Math.max(60, layout.site.depth);
  const siteDiagonal = Math.hypot(siteWidth, siteDepth);

  /**
   * Building the near presets work in: an explicit HUD request wins over the
   * layout's own pick, which in turn wins over "the first building".
   */
  const focusBuilding = useMemo<FloorBuilding | null>(() => {
    const buildings = layout.buildings;
    if (buildings.length === 0) return null;
    const wanted = focusBuildingId ?? layout.focusBuildingId;
    if (wanted) {
      const found = buildings.find((building) => building.id === wanted);
      if (found) return found;
    }
    return buildings[0];
  }, [layout, focusBuildingId]);

  /**
   * true when the operator picked a building in the HUD. The near presets then
   * frame that whole building (its own fit distance) rather than diving into a
   * single hall inside it.
   */
  const buildingRequested = useMemo(() => {
    if (!focusBuildingId) return false;
    return layout.buildings.some((building) => building.id === focusBuildingId);
  }, [focusBuildingId, layout]);

  /**
   * The hall the near presets frame — always one INSIDE `focusBuilding`, so the
   * camera never dives into a neighbouring building: the layout's own pick when
   * it belongs to that building, otherwise its worst-status / busiest hall.
   */
  const focusZone = useMemo<FloorZone | null>(() => {
    if (!focusBuilding) {
      if (!layout.focusZoneId) return null;
      return layout.zones.find((zone) => zone.id === layout.focusZoneId) ?? null;
    }
    const ids = new Set(focusBuilding.zoneIds);
    let best: FloorZone | null = null;
    for (const zone of layout.zones) {
      if (!ids.has(zone.id)) continue;
      if (zone.id === layout.focusZoneId) return zone;
      if (best === null) {
        best = zone;
        continue;
      }
      const severity = STATUS_SEVERITY[zone.worstStatus] - STATUS_SEVERITY[best.worstStatus];
      if (severity > 0 || (severity === 0 && zone.machineCount > best.machineCount)) {
        best = zone;
      }
    }
    return best;
  }, [layout, focusBuilding]);

  const camera = useThree((state) => state.camera);
  const viewport = useThree((state) => state.size);
  const aspect = viewport.height > 0 ? viewport.width / viewport.height : 16 / 9;
  const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;

  // The far plane has to clear a fully zoomed-out site (maxDistance is 2.2x the
  // site fit), which now scales with the campus rather than one shed.
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const far = Math.max(2000, siteDiagonal * 12);
    if (camera.far === far) return;
    camera.far = far;
    camera.updateProjectionMatrix();
  }, [camera, siteDiagonal]);

  // Whole-site fit — used by the wide presets and, for every preset, as the
  // zoom-out ceiling so the operator can always reach the full campus plan.
  const siteFit = useMemo(() => {
    if (layout.slots.length === 0) return layout.suggestedCameraDistance;
    return Math.max(
      14,
      fitCameraDistance(
        siteWidth,
        siteDepth,
        contentHeight(layout),
        PRESET_CONFIG.plant.dir,
        fov,
        aspect,
        PRESET_CONFIG.plant.margin
      )
    );
  }, [layout, siteWidth, siteDepth, fov, aspect]);

  const viewDir = useMemo(
    () => presetDirection(PRESET_CONFIG[cameraPreset], focusBuilding),
    [cameraPreset, focusBuilding]
  );

  /**
   * The box the active preset frames: the fenced site for the wide presets, the
   * requested building or the focus hall for the near ones — with the site as
   * the last resort so an empty/one-building layout still frames something.
   *
   * Every near box is passed through `clampNearBox`, so `line`/`eye` read at
   * machine scale however coarse the grouping is (see NEAR_FRAME_SPAN). The one
   * exception is a building the operator explicitly picked in the HUD: that is a
   * request to see the whole building, so it is framed as asked.
   */
  const frameBox = useMemo<FrameBox>(() => {
    const machineHeight = contentHeight(layout);
    const siteBox: FrameBox = {
      x: 0,
      z: 0,
      width: siteWidth,
      depth: siteDepth,
      height: machineHeight,
    };
    if (PRESET_CONFIG[cameraPreset].frame === "site") return siteBox;
    const buildingBox = focusBuilding
      ? {
          x: focusBuilding.x,
          z: focusBuilding.z,
          width: focusBuilding.width,
          depth: focusBuilding.depth,
          height: Math.max(machineHeight, focusBuilding.wallHeight),
        }
      : null;
    if (buildingRequested && buildingBox) return buildingBox;
    if (focusZone) {
      return clampNearBox({
        x: focusZone.x,
        z: focusZone.z,
        width: focusZone.width,
        depth: focusZone.depth,
        height: machineHeight,
      });
    }
    return clampNearBox(buildingBox ?? siteBox);
  }, [layout, cameraPreset, focusBuilding, buildingRequested, focusZone, siteWidth, siteDepth]);

  /**
   * Fit distance of the active preset: the framed box's own fit, clamped into
   * the preset's band — and, for the near presets, never further out than the
   * whole-site fit, so a tiny site cannot end up framed from outside its fence.
   */
  const fitDistance = useMemo(() => {
    if (layout.slots.length === 0) return layout.suggestedCameraDistance;
    const config = PRESET_CONFIG[cameraPreset];
    const fit = fitCameraDistance(
      frameBox.width,
      frameBox.depth,
      frameBox.height,
      viewDir,
      fov,
      aspect,
      config.margin
    );
    const clamped = Math.min(config.maxDistance, Math.max(config.minDistance, fit));
    return config.frame === "site" ? clamped : Math.min(clamped, siteFit);
  }, [layout, cameraPreset, frameBox, viewDir, siteFit, fov, aspect]);

  /**
   * Orbit target: a selected machine wins over everything, otherwise the centre
   * of the framed box (site centre / building centre / focus hall centre).
   */
  const focusTarget = useMemo(() => {
    if (selectedSlot) {
      return new THREE.Vector3(selectedSlot.x, selectedSlot.height / 2, selectedSlot.z);
    }
    return new THREE.Vector3(frameBox.x, PRESET_CONFIG[cameraPreset].targetY, frameBox.z);
  }, [selectedSlot, cameraPreset, frameBox]);

  // Selecting a machine from a wide preset used to leave the camera 280 m away,
  // where the selection marker is a pixel. Pull in to an inspection distance
  // while keeping the preset's viewing direction.
  const targetDistance = selectedSlot ? Math.min(fitDistance, SELECTION_DISTANCE) : fitDistance;

  // The camera sits `targetDistance` from the orbit target along the preset
  // direction — the target is not the world origin any more, so the offset has
  // to be added rather than assumed away.
  const desiredPos = useMemo(() => {
    const len = Math.hypot(viewDir[0], viewDir[1], viewDir[2]) || 1;
    return new THREE.Vector3(
      focusTarget.x + (viewDir[0] / len) * targetDistance,
      focusTarget.y + (viewDir[1] / len) * targetDistance,
      focusTarget.z + (viewDir[2] / len) * targetDistance
    );
  }, [viewDir, targetDistance, focusTarget]);

  // Fixed floor on the zoom-in so a single 2.4 m machine can always be filled
  // to the frame, whichever preset the operator arrived from.
  const minDistance = 1.6;
  const maxDistance = Math.max(minDistance + 1, siteFit * 2.2);

  // Fog has to hold two very different scales: at the near building/line view
  // the framed machines must stay crisp, while the far end of the site should
  // fade into the background instead of standing out as a hard edge. Density is
  // scaled by the SITE diagonal (see FOG_FALLOFF), which every preset's fit
  // distance is proportional to — so the haze reads the same at both scales.
  const fogDensity = useMemo(() => FOG_FALLOFF / siteDiagonal, [siteDiagonal]);

  return (
    <>
      {/* first child: its useFrame subscribes before every animator below */}
      <SimulationStepper simulation={sim} />

      <color attach="background" args={[BG_COLOR]} />
      {/* Fog density scales with the floor extent (see FOG_FALLOFF): crisp at
          the close hall view, an attractive fade at the far end of the plant. */}
      <fogExp2 attach="fog" args={[FOG_COLOR, fogDensity]} />
      <SceneLights />
      <SceneEnvironment />
      {/* The facility owns the site ground (grass at y=0.004, asphalt at 0.008)
          whenever there is anything to draw. FloorGround's own plane sits at
          y=-0.06 and its infinite Grid at y=0, and at the plant fit distance the
          depth buffer resolves ~32 mm (~160 mm fully zoomed out) — far coarser
          than the 4 mm gap — so the two grounds z-fought site-wide, with the
          polygon-offset grass letting the Grid punch through in shimmering
          patches. Inside the fence the Grid is invisible anyway. It is kept for
          the EMPTY layout, where it is the only thing under the Thai message. */}
      {layout.slots.length === 0 && <FloorGround width={siteWidth} depth={siteDepth} />}

      {/* One hall per building means the facility's rooftop signs already show
          this exact string — only label halls when a building really holds more
          than one. */}
      {layout.zones.length > layout.buildings.length && <ZoneLabels zones={layout.zones} />}

      {/* building shell, racks/pillars/docks/office, painted aisles */}
      <FacilityShell layout={layout} lite={lite} cameraPreset={cameraPreset} />
      <ConveyorSystem layout={layout} simulation={sim} lite={lite} />
      <FloorTraffic layout={layout} lite={lite} />

      <MachineInstances
        layout={layout}
        statusFilter={statusFilter}
        simulation={sim}
        lite={lite}
        onHoverSlot={handleHoverSlot}
        onSelectMachine={onSelectMachine}
        onOpenMachine={onOpenMachine}
      />

      {hoveredSlot && hoveredSlot.machine.id !== selectedMachineId && (
        <HoverHighlight slot={hoveredSlot} lite={lite} />
      )}
      {selectedSlot && <SelectionMarker slot={selectedSlot} lite={lite} />}

      {highQuality !== false && !lite && (
        <ContactShadows
          // y=0.07 clears the whole facility floor stack (building slab 0.034,
          // aisle plates 0.045, hazard stripes up to 0.065). At the old y=0 the
          // opaque building slab drew over it, so the ONLY grounding cue left in
          // the scene was hidden exactly where the machines are.
          position={[0, 0.07, 0]}
          opacity={0.5}
          scale={Math.max(60, Math.max(siteWidth, siteDepth) * 1.1)}
          blur={2}
          far={4}
          color={LIVE_FLOOR_THEME.shadowColor}
        />
      )}

      <CameraRig
        // Re-armed only on explicit operator intent: a preset switch, a new
        // building picked in the HUD, or a new selection. Deliberately NOT the
        // layout's own focus ids — a data refresh must not yank the camera.
        focusKey={`${cameraPreset}|${focusBuildingId ?? ""}|${selectedMachineId ?? ""}`}
        desiredPos={desiredPos}
        focusTarget={focusTarget}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />

      {machines.length === 0 && (
        <Html center occlude={false} style={{ pointerEvents: "none" }}>
          {/* light card, same recipe as the hover/selection callouts */}
          <div
            style={{
              color: LIVE_FLOOR_THEME.placeholderText,
              fontFamily: "sans-serif",
              fontSize: "14px",
              background: LIVE_FLOOR_THEME.hud.panelBg,
              padding: "10px 16px",
              borderRadius: "6px",
              border: `1px solid ${LIVE_FLOOR_THEME.hud.panelBorder}`,
              boxShadow: HTML_SHADOW,
              whiteSpace: "nowrap",
            }}
          >
            ยังไม่มีข้อมูลเครื่องจักรสำหรับแสดงผัง
          </div>
        </Html>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Default export: Canvas wrapper
// ---------------------------------------------------------------------------

/**
 * Initial `far` for a typical site; `SceneContents` then raises it to clear the
 * actual fenced site (12x the site diagonal, i.e. well past `maxDistance`,
 * which is 2.2x the site fit) as soon as the layout is known.
 *
 * `near` is 0.8, not 0.3: depth precision scales with far/near, so this is a
 * ~2.7x win across the whole site — which the facility's 4 mm floor stack
 * (grass 0.004 / asphalt 0.008 / prop pads 0.026 / markings 0.029 / building
 * slab 0.034 / aisles 0.045) needs at the 392 m plant fit. OrbitControls'
 * `minDistance` is 1.6 m, so the camera can never get close enough to clip.
 */
const CAMERA_INIT = { fov: 50, near: 0.8, far: 3000 } as const;

/**
 * Bridges the drawing canvas' own `webglcontextlost` / `webglcontextrestored`
 * events out to the view.
 *
 * `event.preventDefault()` on the loss is REQUIRED: without it the browser
 * never even attempts restoration, so `webglcontextrestored` can never fire and
 * the canvas is dead for good — which is how a transient GPU hiccup turned into
 * a permanently blank 4D mode.
 *
 * Lives INSIDE <Canvas> so it can read the real `gl.domElement` and so its
 * listeners are torn down with the rest of the R3F tree. Renders nothing.
 */
function ContextLossBridge({
  onContextLost,
  onContextRestored,
}: {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}): null {
  const canvas = useThree((s) => s.gl.domElement);
  const loggedRef = useRef(false);

  useEffect(() => {
    function handleLost(event: Event) {
      event.preventDefault();
      if (!loggedRef.current) {
        loggedRef.current = true;
        console.warn("[LiveFloor4DScene] WebGL context lost — waiting for restore");
      }
      onContextLost?.();
    }
    function handleRestored() {
      loggedRef.current = false;
      console.info("[LiveFloor4DScene] WebGL context restored");
      onContextRestored?.();
    }
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [canvas, onContextLost, onContextRestored]);

  return null;
}

export default function LiveFloor4DScene(props: LiveFloor4DSceneProps): ReactElement {
  const { highQuality, machines, onContextLost, onContextRestored } = props;
  // Single source of truth for the auto-lite path: an explicit highQuality
  // override, or an automatic downgrade once the floor gets heavy. Computed
  // here (outside SceneContents) so the Canvas wrapper's dpr and the inner
  // scene's per-part lite drops always agree.
  const lite = highQuality === false || machines.length > 250;

  // Note: `antialias` only takes effect at WebGL context creation, so
  // toggling highQuality at runtime cannot retroactively change MSAA. That is
  // acceptable here — we deliberately avoid remounting the Canvas for it.
  //
  // TONE MAPPING: explicitly NeutralToneMapping (the Khronos PBR-neutral curve),
  // at exposure 1.0. R3F's default is ACESFilmic, which is a FILM curve: it lifts
  // the toe, rolls the shoulder off early and desaturates as it goes. On the dark
  // theme that was free — everything lived in the toe. On this palette almost
  // every pixel lives in ACES' shoulder, where it (a) pulls the #f2f5fa floor
  // toward flat white, and (b) bleeds the saturation out of exactly the colours
  // the status language depends on: the four status tokens were measured at
  // >= 3:1 against the floor in sRGB, and ACES was quietly spending part of that
  // ratio. NeutralToneMapping is linear up to ~0.8 and only compresses above it,
  // so every token renders at (or within a percent of) its authored value and
  // hue/saturation are preserved by construction.
  //
  // Verified against the light rig's own budget (see SceneLights): the brightest
  // surface in the scene is the floor at ~0.87 linear, which is still inside the
  // curve's linear region — the pale floor cannot clip to pure white, and the
  // `toneMapped={false}` accents (status strip, stack light, furnace, scan line) are
  // untouched by the curve either way. Exposure stays 1.0: the rig is already
  // budgeted to land the brightest surface below 1, and any exposure above 1
  // would simply undo that.
  const gl = useMemo(
    () => ({
      // `lite` already folds in `highQuality === false`, so `!lite` alone
      // implies highQuality wasn't explicitly turned off — no need to repeat
      // the check (and TS's aliased-condition narrowing flags it as redundant).
      antialias: !lite,
      powerPreference: "high-performance" as const,
      stencil: false,
      depth: true,
      toneMapping: THREE.NeutralToneMapping,
      toneMappingExposure: 1,
    }),
    [lite, highQuality]
  );
  const dpr = useMemo<[number, number]>(() => [1, lite ? 1.25 : 2], [lite]);

  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      dpr={dpr}
      gl={gl}
      frameloop="always"
      // No `shadows`: nothing in the scene casts or receives one (see
      // SceneLights). <ContactShadows> renders its own off-screen pass and does
      // not need the renderer's shadow map enabled.
      camera={CAMERA_INIT}
    >
      {/* CONTEXT LIFECYCLE: no explicit `gl.dispose()` / `forceContextLoss()`
          cleanup is needed here — verified against the installed
          @react-three/fiber@9.7.0: `Canvas`'s unmount effect calls
          `unmountComponentAtNode(canvas)`, which disposes the render lists,
          calls `gl.forceContextLoss()`, disposes the scene graph and drops the
          root (dist/events-*.esm.js, `unmountComponentAtNode`). It does so in a
          `setTimeout(…, 500)` after the reconciler flush, so leaving and
          re-entering 4D mode inside that window can briefly hold two contexts —
          but nothing keeps a stale renderer alive past it. */}
      <ContextLossBridge
        onContextLost={onContextLost}
        onContextRestored={onContextRestored}
      />
      {/* Drops resolution/event sampling while the camera is moving so the
          ~973-machine floor doesn't have to redo full-res raster + hit-testing
          mid-orbit; both restore automatically once the camera settles. */}
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
      <SceneContents {...props} lite={lite} />
    </Canvas>
  );
}
