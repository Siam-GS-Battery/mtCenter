import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
} from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type {
  FloorAisle,
  FloorBuilding,
  FloorLayout,
  FloorProp,
  FloorPropKind,
  FloorRoad,
  FloorZone,
} from "../../../lib/floorLayout";
import type { FloorSimulation } from "../../../lib/floorSimulation";
import type { FloorCameraPreset } from "./LiveFloor4DScene";
import { LIVE_FLOOR_THEME, statusColor } from "./liveFloorTheme";

/**
 * Everything on the live floor that is *not* a machine: the factory **site**
 * (ground pads, roads with painted markings, perimeter fence + gate +
 * guardhouse, parking lots, material yards, trees), one building shell per
 * `layout.buildings` entry with a rooftop name sign, the structural and
 * storage props inside them, painted floor markings, conveyor lines with cargo
 * riding them, and traffic (site delivery trucks, in-hall AGVs, workers and an
 * overhead crane).
 *
 * Performance contract for this whole module:
 *  - every visual family is ONE instanced mesh **across all buildings**, so the
 *    added draw-call count is a constant (≤ 54) and does not grow with either
 *    the machine count or the building count;
 *  - static geometry writes its instance matrices exactly once, in
 *    `useLayoutEffect` (no `useFrame` in `FacilityShell` at all);
 *  - the two animated components have a single `useFrame` each, allocation-free:
 *    all scratch objects live at module scope and moving instances patch the
 *    translation columns of `instanceMatrix.array` in place;
 *  - all motion is phase-based off the R3F clock delta — no `Math.random()`,
 *    no `Date.now()`, no `new Date()` anywhere in this file.
 */

// ---------------------------------------------------------------------------
// Palette — every colour in this file comes from `liveFloorTheme.ts`.
//
// The mode is lit as **daylight**: the background and the ground are pale, so
// nothing in here may rely on "glow against black" to be visible. Elements read
// by *contrast* (a saturated diffuse colour, or a darker structural edge)
// instead of by emission; `emissiveIntensity` above ~0.6 is reserved for the
// handful of parts that are genuinely self-luminous even at noon (a vehicle
// lamp, a brake light) — everything else is plain diffuse colour, because a
// value brighter than white simply clips to white once tone mapping runs.
// ---------------------------------------------------------------------------

const FLOOR_COLOR = LIVE_FLOOR_THEME.ground;
const WALL_COLOR = LIVE_FLOOR_THEME.structure;
const STRUCTURE_COLOR = LIVE_FLOOR_THEME.structureAlt;
const STEEL_LIGHT = LIVE_FLOOR_THEME.facilitySteel;
const CONCRETE_COLOR = LIVE_FLOOR_THEME.concrete;
const ACCENT_CYAN = LIVE_FLOOR_THEME.accent;
const HAZARD_AMBER = LIVE_FLOOR_THEME.hazard;
const CARGO_TAN = LIVE_FLOOR_THEME.cargo;
const AISLE_MAIN_COLOR = LIVE_FLOOR_THEME.structureAlt;
const AISLE_WALK_COLOR = LIVE_FLOOR_THEME.aisleWalk;
const BELT_COLOR = LIVE_FLOOR_THEME.belt;
const SITE = LIVE_FLOOR_THEME.site;
/** Sims-style dark silhouette outline ink — see the `backSide` doc on `StaticLayer`. */
const OUTLINE_INK = LIVE_FLOOR_THEME.outlineInk;
/**
 * World-space outline "ink width" added (symmetrically, on every axis) to an
 * outlined shape's scale. Additive rather than multiplicative so one constant
 * gives every silhouette — a 12 m truss bay and a 2 m sign board alike — the
 * same visual line weight, the way a comic/cel outline stays a constant pen
 * width regardless of the object it traces.
 */
const OUTLINE_MARGIN = 0.07;

// ---------------------------------------------------------------------------
// Vertical stacking of the flat plates. The 4D scene puts its ground plane and
// grid at y = 0, so every site layer sits just above it; the order below is
// what keeps the pads, roads, markings and building slabs from z-fighting.
//
//   Y_GRASS < Y_ASPHALT < Y_ROAD < Y_PAD < Y_MARKING(top 0.029) <
//   Y_SLAB(top 0.034) < Y_ZONE_DECAL(0.038, top ~0.041) <
//   aisle plates (y 0.035, top 0.045) < aisle stripes (y 0.055)
//
// `Y_ZONE_DECAL` is the optional per-zone status-tint decal (see
// `buildShellBatches`): it must stay strictly between the building slab's top
// face (0.034) and the aisle plates' top face (0.045) or it z-fights one of
// them.
//
// None of these plate heights changed for the daylight pass. The one new solid
// is the wall skirt (`WALL_SKIRT_H`), which spans y 0 → 0.34 on the building
// perimeter: it is a box, not a plate, so it deliberately buries its bottom edge
// through the grass/asphalt plates instead of sharing a plane with them.
//
// The baked-AO skirt (`AO_SKIRT_H`, see `AoSkirtLayer`) shares that same
// "box, not plate" trick: it spans y 0 → 0.3, strictly inside the solid
// skirt's 0 → 0.34 band, so its top edge never pokes out past the solid trim
// and never sits exactly level with Y_SLAB (0.024) or Y_ZONE_DECAL (0.038) —
// both of which are plates it partially overlaps in plan. Its footprint is
// the wall footprint padded by `AO_SKIRT_MARGIN`, so the gradient is visible
// peeking out from under the opaque skirt instead of being fully hidden by it.
// ---------------------------------------------------------------------------

const Y_GRASS = 0.004;
const Y_ASPHALT = 0.008;
const Y_ROAD = 0.013;
const Y_PAD = 0.016;
const Y_MARKING = 0.019;
const Y_SLAB = 0.024;
const Y_ZONE_DECAL = 0.038;

/**
 * How far the building floor (and, when applicable, the per-zone decal) is
 * lerped from its neutral floor colour toward the zone/building's
 * `worstStatus` colour. Deliberately subtle — a floor tint a supervisor
 * notices while scanning the plant, not a light show.
 */
const STATUS_TINT_FACTOR = 0.15;

// ---------------------------------------------------------------------------
// Module-scope scratch — the animation path must never allocate.
// ---------------------------------------------------------------------------

const DUMMY = new THREE.Object3D();
DUMMY.rotation.order = "YXZ";
const SCRATCH_COLOR = new THREE.Color();
/** second scratch colour — only used to hold a lerp target, never per-frame. */
const SCRATCH_COLOR_B = new THREE.Color();
/** scratch HSL target for the module-scope tint derivations below. */
const SCRATCH_HSL = { h: 0, s: 0, l: 0 };

/**
 * Visibility-gate scratch for `ConveyorSystem` / `FloorTraffic`: a coarse,
 * per-line/per-lane frustum test against a precomputed bounding sphere, used
 * to skip the expensive per-instance matrix writes for motion the camera
 * cannot currently see. All three objects are mutated in place every check —
 * never reallocated — so the gate itself costs nothing extra per frame.
 */
const CULL_FRUSTUM = new THREE.Frustum();
const CULL_PROJ_MATRIX = new THREE.Matrix4();
const CULL_SPHERE = new THREE.Sphere();
/** how often the coarse visibility gate re-evaluates, seconds (~5 Hz) — the
 *  lines/lanes are static in world space, so nothing is lost by checking
 *  rarely, and re-testing every frame would cost more than the writes it saves. */
const CULL_INTERVAL = 0.2;
/**
 * Hysteresis margin applied to every line/lane bounding-sphere radius before
 * the frustum test above, so a lane is marked visible slightly BEFORE it
 * actually enters the screen and stays marked visible slightly AFTER it
 * leaves — instead of the exact-radius test, which lets a fast pan carry a
 * lane across the frustum boundary between two 0.2s checks and leaves its
 * riders/AGVs/trucks frozen on screen at their last-written transform for up
 * to CULL_INTERVAL. Raising the check cadence would "fix" the same symptom
 * but cost more CPU every frame, which is exactly what this gate exists to
 * avoid — a one-off multiply against a radius we already have costs nothing
 * extra. The 50% figure is deliberately proportional to each line's own
 * bounding radius (already sized to that line's world footprint) rather than
 * a fixed metre value, so it scales with layout size the same way the rest
 * of this file's LOD constants do, and is generous enough to absorb a fast
 * drag/zoom's worth of camera travel within one CULL_INTERVAL window.
 *
 * NOTE ON CROSS-FILE CONSISTENCY: LiveFloor4DScene.tsx culls machines with
 * its own per-zone bounding spheres on its FPS-capped decimated tick, using
 * a generous margin of its own for the same reason. If this file's margin
 * were smaller than that one, a fast pan could reveal a running machine
 * next to a conveyor/AGV lane that still reads as offscreen (or vice
 * versa) — a visibly broken mismatch at the frustum edge. Keep this factor
 * at least as generous as the machine-side margin in LiveFloor4DScene.tsx
 * whenever either one changes.
 */
const CULL_MARGIN_FACTOR = 0.5;
/** CULL_MARGIN_FACTOR expressed as a radius multiplier — applied to every
 *  line/lane bounding-sphere radius at the point of the frustum test itself
 *  (not baked into the stored radius) so the derivation stays visible where
 *  it's used. `1 + CULL_MARGIN_FACTOR` = 1.5x radius, i.e. the sphere is
 *  treated as 50% larger than its true world footprint for visibility
 *  purposes only — the underlying geometry/collision data is untouched. */
const CULL_RADIUS_MULTIPLIER = 1 + CULL_MARGIN_FACTOR;
/**
 * Same distance-LOD multiple as `ANIM_LOD_DISTANCE_FACTOR` in
 * LiveFloor4DScene.tsx (kept as a local copy — the two files don't share a
 * module — so both stay in numeric lockstep): beyond this multiple of the
 * layout's own `suggestedCameraDistance`, motion this fine (belt scroll,
 * AGV/worker/truck travel) is a few pixels at most. Applying the same factor
 * here means a zoomed-out `plant`/`top` view freezes distant conveyors and
 * traffic at the same distance it already freezes distant machines, instead
 * of showing frozen machines next to full-speed belts in the same shot.
 */
const CONVEYOR_LOD_DISTANCE_FACTOR = 1.6;

/** `base` lerped `STATUS_TINT_FACTOR` of the way toward the status colour. */
function statusTint(base: string, status: Parameters<typeof statusColor>[0]): string {
  SCRATCH_COLOR.set(base);
  SCRATCH_COLOR_B.set(statusColor(status));
  SCRATCH_COLOR.lerp(SCRATCH_COLOR_B, STATUS_TINT_FACTOR);
  return `#${SCRATCH_COLOR.getHexString()}`;
}

/** Deterministic pseudo-random in [0,1) from an integer index + salt. */
function hash01(index: number, salt: number): number {
  const v = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ---------------------------------------------------------------------------
// Locally derived tints
//
// A few daylight materials need a value the theme has no token for yet. Rather
// than hardcode a literal (this file must contain none) or edit the shared
// theme, they are derived here from an existing token, once, at module scope.
// Each one is a candidate for promotion to a real token later.
// ---------------------------------------------------------------------------

/**
 * Scales a theme hex in **sRGB** space, so `factor` reads as "how much darker it
 * looks". `THREE.Color` stores linear-sRGB, where a plain `multiplyScalar` would
 * darken far less than the number suggests.
 */
function scaleSrgb(hex: string, factor: number): string {
  SCRATCH_COLOR.set(hex);
  const packed = SCRATCH_COLOR.getHex(THREE.SRGBColorSpace);
  const r = clamp(Math.round(((packed >> 16) & 0xff) * factor), 0, 255);
  const g = clamp(Math.round(((packed >> 8) & 0xff) * factor), 0, 255);
  const b = clamp(Math.round((packed & 0xff) * factor), 0, 255);
  SCRATCH_COLOR.setHex((r << 16) | (g << 8) | b, THREE.SRGBColorSpace);
  return `#${SCRATCH_COLOR.getHexString()}`;
}

/**
 * Caps a theme hex at `maxL` sRGB lightness, keeping its hue and saturation.
 * Bodies that move around on a pale floor have to stay mid-tone to be seen; this
 * guarantees that without this file having to know what value the token holds.
 */
function midTone(hex: string, maxL: number): string {
  SCRATCH_COLOR.set(hex);
  SCRATCH_COLOR.getHSL(SCRATCH_HSL, THREE.SRGBColorSpace);
  if (SCRATCH_HSL.l <= maxL) return hex;
  SCRATCH_COLOR.setHSL(SCRATCH_HSL.h, SCRATCH_HSL.s, maxL, THREE.SRGBColorSpace);
  return `#${SCRATCH_COLOR.getHexString()}`;
}

/** Mixes two theme hexes, `t` of the way from `from` to `to`. */
function mixHex(from: string, to: string, t: number): string {
  SCRATCH_COLOR.set(from);
  SCRATCH_COLOR_B.set(to);
  SCRATCH_COLOR.lerp(SCRATCH_COLOR_B, t);
  return `#${SCRATCH_COLOR.getHexString()}`;
}

/**
 * Tinted glass for the hall walls: `structure` is a pale daylight panel, which
 * at low opacity would vanish against a pale sky, so it is taken down to a
 * mid-tone that still lets the machines inside show through.
 */
const WALL_GLASS = scaleSrgb(WALL_COLOR, 0.74);

/**
 * Painted markings on the site tarmac. Real markings are white because tarmac
 * is black; the daylight `site.asphalt` is pale, so white-on-pale reads as
 * nothing. A darkened asphalt is a mid-grey that contrasts either way. Doubles
 * as the galvanised-mesh grey of the perimeter fence panels, which for the same
 * reason can no longer be a pale structural tint.
 */
const MARKING_INK = scaleSrgb(SITE.asphalt, 0.55);

/** Guaranteed-darker-than-the-pad kerb, so pads have a grounding edge. */
const PAD_KERB = scaleSrgb(SITE.kerb, 0.82);

/** Office block curtain-wall glazing, semi-transparent like the hall glass. */
const OFFICE_GLASS = scaleSrgb(SITE.officeGlass, 0.86);

/** Near-black ink for the rooftop sign text, on a near-white plate. */
const SIGN_INK = scaleSrgb(WALL_COLOR, 0.18);

/** Rooftop sign plate — forced near-white so it reads against a pale roof. */
const SIGN_PLATE_BG = mixHex(SITE.signPlate, LIVE_FLOOR_THEME.neutral.white, 0.86);

/** Soft drop shadow under the rooftop sign (blurred, so no alpha is needed). */
const SIGN_SHADOW = mixHex(
  LIVE_FLOOR_THEME.shadowColor,
  LIVE_FLOOR_THEME.neutral.white,
  0.62
);

/**
 * Structural steel (racks, rails, fence and gate posts, tanks, crane) capped so
 * the thin members still draw against a pale floor and a pale roof. The cap only
 * bites if the token itself is pale.
 */
const STEEL_MID = midTone(STEEL_LIGHT, 0.66);

/** Moving bodies, held to a mid-tone so they never wash out on the pale floor. */
const AGV_BODY = midTone(LIVE_FLOOR_THEME.agvBody, 0.46);
const WORKER_BODY = midTone(LIVE_FLOOR_THEME.workerBody, 0.44);
const TRUCK_BODY = midTone(SITE.truckBody, 0.46);
const TRUCK_TRAILER = midTone(SITE.truckTrailer, 0.62);

/** Yaw that turns a local +X-facing mesh toward the given planar direction. */
function yawFor(dx: number, dz: number): number {
  return Math.atan2(-dz, dx);
}

/** Smoothstep, used to ease the back-and-forth turns of traffic. */
function smooth(u: number): number {
  return u * u * (3 - 2 * u);
}

function isEmptyLayout(layout: FloorLayout): boolean {
  if (layout.slots.length === 0) return true;
  const buildings = layout.buildings;
  if (!buildings || buildings.length === 0) return true;
  for (const b of buildings) {
    if (b.width > 0 && b.depth > 0) return false;
  }
  return true;
}

/** Offsets a local +Z displacement into world space for a given yaw. */
function localZOffsetX(yaw: number, k: number): number {
  return Math.sin(yaw) * k;
}
function localZOffsetZ(yaw: number, k: number): number {
  return Math.cos(yaw) * k;
}
/** Offsets a local +X displacement into world space for a given yaw. */
function localXOffsetX(yaw: number, k: number): number {
  return Math.cos(yaw) * k;
}
function localXOffsetZ(yaw: number, k: number): number {
  return -Math.sin(yaw) * k;
}

// ---------------------------------------------------------------------------
// Box batch — a flat, pre-computed list of instance transforms. Building the
// site out of batches keeps every family a single instanced mesh and keeps the
// per-instance maths out of React's render path.
// ---------------------------------------------------------------------------

interface Batch {
  x: number[];
  y: number[];
  z: number[];
  sx: number[];
  sy: number[];
  sz: number[];
  ry: number[];
  rx: number[];
  count: number;
}

function newBatch(): Batch {
  return { x: [], y: [], z: [], sx: [], sy: [], sz: [], ry: [], rx: [], count: 0 };
}

function pushBox(
  b: Batch,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  ry = 0,
  rx = 0
): void {
  b.x.push(x);
  b.y.push(y);
  b.z.push(z);
  b.sx.push(sx);
  b.sy.push(sy);
  b.sz.push(sz);
  b.ry.push(ry);
  b.rx.push(rx);
  b.count += 1;
}

function applyBatch(b: Batch, i: number): void {
  DUMMY.position.set(b.x[i], b.y[i], b.z[i]);
  DUMMY.rotation.set(b.rx[i], b.ry[i], 0);
  DUMMY.scale.set(b.sx[i], b.sy[i], b.sz[i]);
}

/**
 * Same transform as `applyBatch`, inflated by `OUTLINE_MARGIN` on every axis —
 * feeds the `backSide`-rendered outline copy of a batch (see `StaticLayer`'s
 * `backSide` doc for the inverted-hull technique this supports).
 */
function applyOutlineBatch(b: Batch, i: number): void {
  DUMMY.position.set(b.x[i], b.y[i], b.z[i]);
  DUMMY.rotation.set(b.rx[i], b.ry[i], 0);
  DUMMY.scale.set(
    b.sx[i] + OUTLINE_MARGIN * 2,
    b.sy[i] + OUTLINE_MARGIN * 2,
    b.sz[i] + OUTLINE_MARGIN * 2
  );
}

// ---------------------------------------------------------------------------
// Generic static instanced layer
// ---------------------------------------------------------------------------

type LayerShape = "box" | "cylinder" | "cone";

interface StaticLayerProps {
  count: number;
  /** fills `DUMMY` with the transform of instance `index` */
  write: (index: number) => void;
  /**
   * identity that changes whenever the instance data changes — the matrices are
   * re-written only when this (or `count`) changes, never on a plain re-render.
   */
  source: unknown;
  shape?: LayerShape;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  doubleSided?: boolean;
  /**
   * Renders only back faces (`THREE.BackSide`). Combined with an
   * instance-space size inflation baked into `write`, this is the
   * "inverted-hull" outline technique: an enlarged, backface-only copy of a
   * shape drawn behind the normal front-facing copy reads as a crisp dark rim
   * around its silhouette wherever the enlarged shell peeks out from behind
   * the real one. Used instead of literal `THREE.EdgesGeometry` line
   * segments because `THREE.InstancedMesh` only instances triangle meshes —
   * instancing actual line geometry would need a hand-rolled shader/attribute
   * path, which is more moving parts than this single-technique outline
   * needs. Mutually exclusive with `doubleSided`.
   */
  backSide?: boolean;
  /** polygonOffsetFactor — used to order the coplanar flat plates */
  offsetFactor?: number;
}

/** One instanced mesh for one visual family. Static: matrices written once. */
function StaticLayer({
  count,
  write,
  source,
  shape = "box",
  color,
  emissive,
  emissiveIntensity = 0.6,
  metalness = 0.15,
  roughness = 0.85,
  opacity = 1,
  doubleSided = false,
  backSide = false,
  offsetFactor,
}: StaticLayerProps): ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const writeRef = useRef(write);
  writeRef.current = write;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const emit = writeRef.current;
    for (let i = 0; i < count; i++) {
      emit(i);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count, source]);

  if (count === 0) return null;

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      raycast={() => null}
      castShadow={false}
      receiveShadow={false}
    >
      {shape === "cylinder" ? (
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
      ) : shape === "cone" ? (
        <coneGeometry args={[0.5, 1, 10]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={emissive ?? LIVE_FLOOR_THEME.neutral.black}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
        metalness={metalness}
        roughness={roughness}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 1}
        side={backSide ? THREE.BackSide : doubleSided ? THREE.DoubleSide : THREE.FrontSide}
        polygonOffset={offsetFactor !== undefined}
        polygonOffsetFactor={offsetFactor ?? 0}
      />
    </instancedMesh>
  );
}

/** Extra instances emitted per prop, per kind (shelves, bands, windows…). */
interface PropLayerProps {
  items: FloorProp[];
  /** instances per source prop */
  perItem: number;
  /** writes one instance transform into `DUMMY` (position/rotation/scale) */
  write: (prop: FloorProp, sub: number) => void;
  shape?: LayerShape;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  doubleSided?: boolean;
  backSide?: boolean;
  offsetFactor?: number;
}

/** `StaticLayer` specialised for a list of props with a fixed sub-instance count. */
function PropLayer({ items, perItem, write, ...rest }: PropLayerProps): ReactElement | null {
  const count = items.length * perItem;
  return (
    <StaticLayer
      {...rest}
      count={count}
      source={items}
      write={(index) => {
        const prop = items[Math.floor(index / perItem)];
        write(prop, index % perItem);
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Camera-aware wall transparency ("roof cutaway")
// ---------------------------------------------------------------------------

/**
 * The shell has no solid roof (only trusses, above), so the "cutaway" the
 * operator actually wants is the glass wall getting out of the way once the
 * camera commits to a hall or a machine. `plant`/`top` keep today's 0.52 —
 * those presets frame the whole site, where a building should still read as
 * a building. `line` (one hall) drops to 0.18 and `eye` (one machine) drops
 * to 0.10, low enough that the shell stops occluding what the operator
 * zoomed in for while still leaving a faint outline of the hall.
 */
const WALL_OPACITY_BY_PRESET: Record<FloorCameraPreset, number> = {
  plant: 0.52,
  top: 0.52,
  line: 0.18,
  eye: 0.1,
};
/** Preset unset (older call sites, or default prop) — matches the old fixed value. */
const WALL_OPACITY_DEFAULT = 0.52;
/** Seconds to lerp from one preset's wall opacity to the next — no popping. */
const WALL_OPACITY_LERP_SECONDS = 0.4;
/** Below this delta the lerp is considered settled; the `useFrame` below no-ops. */
const WALL_OPACITY_EPSILON = 0.001;

interface WallGlassLayerProps {
  count: number;
  source: unknown;
  write: (index: number) => void;
  targetOpacity: number;
  /**
   * Optional inverted-hull outline for the same wall batch (see
   * `applyOutlineBatch`/`StaticLayer`'s `backSide` doc). Rendered as a second
   * instanced mesh sharing this component's matrices-once effect and its one
   * `useFrame`, rather than a separate `StaticLayer`, because a flat-opaque
   * dark hull behind a wall that is fading toward near-invisible at the
   * `line`/`eye` presets (0.18/0.10 opacity) shows straight through the glass
   * and reads as a dirty, muddy smear instead of the crisp wall the operator
   * zoomed in to see clearly — the whole point of the camera-aware fade. Tying
   * the outline's own opacity to the same lerped value makes it fade out in
   * lockstep with the glass it traces, so at `eye`/`line` the shell reads as
   * a faint, receding hint (matching the glass) instead of a solid dark box
   * sitting inside a see-through one. Caller omits this when `lite` (or
   * outlines are otherwise disabled) so no outline mesh mounts at all.
   */
  outlineWrite?: (index: number) => void;
}

/**
 * `StaticLayer` specialised for the glass wall family only: it needs a
 * `useFrame` to lerp opacity toward whichever camera preset is active, which
 * `StaticLayer` deliberately does not support (its matrices are write-once).
 * The lerp mutates the shared material's `opacity` in place — no per-instance
 * work, no allocation — and bails out once the value has settled within
 * `WALL_OPACITY_EPSILON` of the target, per this file's perf contract. When
 * `outlineWrite` is supplied, the same `useFrame` also drives the wall
 * outline's opacity toward the same target (see `outlineWrite` doc above) —
 * no second `useFrame` is added.
 */
function WallGlassLayer({
  count,
  source,
  write,
  targetOpacity,
  outlineWrite,
}: WallGlassLayerProps): ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const outlineMeshRef = useRef<THREE.InstancedMesh>(null);
  const outlineMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const writeRef = useRef(write);
  writeRef.current = write;
  const outlineWriteRef = useRef(outlineWrite);
  outlineWriteRef.current = outlineWrite;
  const currentOpacity = useRef(targetOpacity);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const emit = writeRef.current;
    for (let i = 0; i < count; i++) {
      emit(i);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count, source]);

  useLayoutEffect(() => {
    const outlineMesh = outlineMeshRef.current;
    const emitOutline = outlineWriteRef.current;
    if (!outlineMesh || !emitOutline || count === 0) return;
    for (let i = 0; i < count; i++) {
      emitOutline(i);
      DUMMY.updateMatrix();
      outlineMesh.setMatrixAt(i, DUMMY.matrix);
    }
    outlineMesh.count = count;
    outlineMesh.instanceMatrix.needsUpdate = true;
    outlineMesh.computeBoundingSphere();
  }, [count, source, outlineWrite]);

  useFrame((_state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const diff = targetOpacity - currentOpacity.current;
    if (Math.abs(diff) < WALL_OPACITY_EPSILON) {
      if (currentOpacity.current !== targetOpacity) {
        currentOpacity.current = targetOpacity;
        material.opacity = targetOpacity;
        if (outlineMaterialRef.current) outlineMaterialRef.current.opacity = targetOpacity;
      }
      return;
    }
    const t = Math.min(1, delta / WALL_OPACITY_LERP_SECONDS);
    currentOpacity.current += diff * t;
    material.opacity = currentOpacity.current;
    if (outlineMaterialRef.current) outlineMaterialRef.current.opacity = currentOpacity.current;
  });

  if (count === 0) return null;

  return (
    <>
      <instancedMesh
        key={count}
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
        raycast={() => null}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color={WALL_GLASS}
          roughness={0.32}
          metalness={0.28}
          transparent
          opacity={currentOpacity.current}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      {outlineWrite && (
        <instancedMesh
          key={`outline-${count}`}
          ref={outlineMeshRef}
          args={[undefined, undefined, count]}
          frustumCulled={false}
          raycast={() => null}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            ref={outlineMaterialRef}
            color={OUTLINE_INK}
            metalness={0}
            roughness={1}
            side={THREE.BackSide}
            transparent
            opacity={currentOpacity.current}
            depthWrite={false}
          />
        </instancedMesh>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Ambient-occlusion grounding at wall bases
// ---------------------------------------------------------------------------

/** Builds the AO gradient once: opaque at the ground edge, transparent by mid-height. */
function buildAoGradientTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Canvas y grows downward and CanvasTexture flips on upload, so canvas
    // y=0 (top) ends up at texture v=1 (the wall's top edge, away from the
    // ground) and canvas y=size (bottom) ends up at v=0 (the ground edge).
    // Opaque at the ground, fading to nothing by just past mid-height.
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Cheap baked-looking AO, no screen-space pass and no new dependency: one
 * instanced mesh reusing the wall footprint (see `AO_SKIRT_MARGIN`/`AO_SKIRT_H`
 * above), skinned with a small procedural `CanvasTexture` (built once here,
 * memoized) used as an `alphaMap` so each box reads as a soft dark pool
 * hugging the wall base instead of a hard-edged plinth. Colour always comes
 * from `LIVE_FLOOR_THEME.shadowColor`, never a hardcoded hex.
 */
function AoSkirtLayer({ batch, color }: { batch: Batch; color: string }): ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const texture = useMemo(() => buildAoGradientTexture(), []);

  // `buildAoGradientTexture()` allocates a `THREE.CanvasTexture` (backed by a
  // real <canvas> and its own GPU texture handle); without an explicit
  // dispose it outlives the component on every unmount/remount, leaking one
  // canvas + GPU texture per batch each time.
  useEffect(() => () => texture.dispose(), [texture]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || batch.count === 0) return;
    for (let i = 0; i < batch.count; i++) {
      applyBatch(batch, i);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    }
    mesh.count = batch.count;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [batch]);

  if (batch.count === 0) return null;

  return (
    <instancedMesh
      key={batch.count}
      ref={meshRef}
      args={[undefined, undefined, batch.count]}
      frustumCulled={false}
      raycast={() => null}
      castShadow={false}
      receiveShadow={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        alphaMap={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Painted in-hall markings (unchanged behaviour)
// ---------------------------------------------------------------------------

/** Aisle plates (one instanced mesh per aisle class). */
function AislePlates({
  aisles,
  main,
}: {
  aisles: FloorAisle[];
  main: boolean;
}): ReactElement | null {
  return (
    <StaticLayer
      count={aisles.length}
      source={aisles}
      color={main ? AISLE_MAIN_COLOR : AISLE_WALK_COLOR}
      roughness={0.95}
      metalness={0.05}
      offsetFactor={-2}
      write={(i) => {
        const a = aisles[i];
        const inset = main ? 0 : 0.35;
        DUMMY.position.set(a.x, 0.035, a.z);
        DUMMY.rotation.set(0, 0, 0);
        DUMMY.scale.set(
          Math.max(0.4, a.width - inset),
          0.02,
          Math.max(0.4, a.depth - inset)
        );
      }}
    />
  );
}

interface StripeSpec {
  x: Float32Array;
  z: Float32Array;
  sx: Float32Array;
  sz: Float32Array;
  amber: Uint8Array;
  count: number;
}

const STRIPE_CAP = 2000;
const STRIPE_CAP_LITE = 650;

/**
 * Painted stripe segments for every aisle in one instanced mesh: dashed centre
 * lines down the main arteries, hazard-yellow edge stripes along the walkways.
 * Density is thinned (never dropped) until the segment budget is met.
 */
function buildStripes(aisles: FloorAisle[], lite: boolean): StripeSpec {
  const cap = lite ? STRIPE_CAP_LITE : STRIPE_CAP;
  const dash = 1.1;

  const measure = (pitch: number): number => {
    let total = 0;
    for (const a of aisles) {
      const len = a.horizontal ? a.width : a.depth;
      const n = Math.max(2, Math.floor(len / pitch));
      total += a.main ? n : n * 2;
    }
    return total;
  };

  let pitch = 2.4;
  let total = measure(pitch);
  if (total > cap) {
    pitch *= total / cap;
    total = measure(pitch);
    // one more safety pass — Math.floor rounding can leave a small overshoot
    if (total > cap) {
      pitch *= 1.1;
      total = measure(pitch);
    }
  }

  const x = new Float32Array(total);
  const z = new Float32Array(total);
  const sx = new Float32Array(total);
  const sz = new Float32Array(total);
  const amber = new Uint8Array(total);

  let i = 0;
  for (const a of aisles) {
    const len = a.horizontal ? a.width : a.depth;
    const n = Math.max(2, Math.floor(len / pitch));
    if (n <= 0) continue;
    const step = len / n;
    const start = (a.horizontal ? a.x : a.z) - len / 2 + step / 2;
    const lateral = a.horizontal ? a.depth : a.width;
    const edge = Math.max(0.25, lateral / 2 - 0.3);

    for (let k = 0; k < n && i < total; k++) {
      const along = start + k * step;
      if (a.main) {
        // dashed centre line
        if (a.horizontal) {
          x[i] = along;
          z[i] = a.z;
          sx[i] = dash;
          sz[i] = 0.16;
        } else {
          x[i] = a.x;
          z[i] = along;
          sx[i] = 0.16;
          sz[i] = dash;
        }
        amber[i] = 0;
        i += 1;
      } else {
        // hazard edge stripes, both sides
        for (let side = -1; side <= 1 && i < total; side += 2) {
          if (a.horizontal) {
            x[i] = along;
            z[i] = a.z + side * edge;
            sx[i] = dash;
            sz[i] = 0.14;
          } else {
            x[i] = a.x + side * edge;
            z[i] = along;
            sx[i] = 0.14;
            sz[i] = dash;
          }
          amber[i] = 1;
          i += 1;
        }
      }
    }
  }

  return { x, z, sx, sz, amber, count: i };
}

function AisleStripes({ spec }: { spec: StripeSpec }): ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || spec.count === 0) return;
    for (let i = 0; i < spec.count; i++) {
      DUMMY.position.set(spec.x[i], 0.055, spec.z[i]);
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.scale.set(spec.sx[i], 0.02, spec.sz[i]);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
      SCRATCH_COLOR.set(spec.amber[i] === 1 ? HAZARD_AMBER : LIVE_FLOOR_THEME.aisleStripe);
      mesh.setColorAt(i, SCRATCH_COLOR);
    }
    mesh.count = spec.count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [spec]);

  if (spec.count === 0) return null;

  return (
    <instancedMesh
      key={spec.count}
      ref={meshRef}
      args={[undefined, undefined, spec.count]}
      frustumCulled={false}
      raycast={() => null}
    >
      <boxGeometry args={[1, 1, 1]} />
      {/*
        White base colour so the per-instance tint (amber hazard / centre-line
        blue) is the final colour. No emissive: in daylight it only washed both
        tints back toward white and killed the very contrast they exist for.
      */}
      <meshStandardMaterial
        color={LIVE_FLOOR_THEME.neutral.white}
        emissive={LIVE_FLOOR_THEME.neutral.black}
        emissiveIntensity={0}
        roughness={0.8}
        metalness={0.05}
        polygonOffset
        polygonOffsetFactor={-3}
      />
    </instancedMesh>
  );
}

/**
 * `StaticLayer`, but each instance gets its own colour from a parallel array
 * instead of one flat material colour — used for the building-slab / zone-
 * decal status tint. The base material colour is white so the instance
 * colour (set via `setColorAt`) is the final colour, same trick as
 * `AisleStripes`. Matrices and colours are both written once.
 */
function TintedBoxLayer({
  batch,
  colors,
  metalness,
  roughness,
  offsetFactor,
}: {
  batch: Batch;
  colors: string[];
  metalness: number;
  roughness: number;
  offsetFactor?: number;
}): ReactElement | null {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = batch.count;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    for (let i = 0; i < count; i++) {
      applyBatch(batch, i);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
      SCRATCH_COLOR.set(colors[i]);
      mesh.setColorAt(i, SCRATCH_COLOR);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [batch, colors, count]);

  if (count === 0) return null;

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      raycast={() => null}
      castShadow={false}
      receiveShadow={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={LIVE_FLOOR_THEME.neutral.white}
        emissive={LIVE_FLOOR_THEME.neutral.black}
        emissiveIntensity={0}
        metalness={metalness}
        roughness={roughness}
        polygonOffset={offsetFactor !== undefined}
        polygonOffsetFactor={offsetFactor ?? 0}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Building shells — one instanced family per part, across ALL buildings
// ---------------------------------------------------------------------------

const WALL_THICKNESS = 0.45;
const TRUSS_PARTS = 4;
/** height of the grounding plinth at the foot of every wall (metres) */
const WALL_SKIRT_H = 0.34;

/**
 * Baked-looking AO at the foot of every wall — see the vertical-stacking
 * comment above for the y-height reasoning. `AO_SKIRT_MARGIN` is how far the
 * gradient box is padded beyond the wall's own footprint on every side, so it
 * reads as a shadow *pooling outward* from the wall rather than a second,
 * slightly-larger plinth stacked on the first.
 */
const AO_SKIRT_H = 0.3;
const AO_SKIRT_MARGIN = 0.9;

interface ShellBatches {
  slab: Batch;
  /** per-instance floor tint, one hex string per `slab` instance */
  slabColor: string[];
  wall: Batch;
  trim: Batch;
  truss: Batch;
  /** baked AO gradient hugging the foot of every wall, see `AoSkirtLayer` */
  aoSkirt: Batch;
  /**
   * Optional per-zone status decal, only populated when a building can hold
   * more than one zone (see `buildShellBatches`); empty otherwise so it costs
   * zero draw calls in the common one-hall-per-building case.
   */
  zoneDecal: Batch;
  zoneDecalColor: string[];
}

/**
 * The layout emits `trussX` in world space, but the field was building-local in
 * the previous shape. Decide per building which one it is by asking whether the
 * run is centred on the building (world) or on the origin (local), then return
 * the world X — so the shell survives either convention.
 */
function trussIsWorld(building: FloorBuilding): boolean {
  const xs = building.trussX;
  if (xs.length === 0) return true;
  let sum = 0;
  for (const x of xs) sum += x;
  const mean = sum / xs.length;
  return Math.abs(mean - building.x) <= Math.abs(mean) + 1e-6;
}

function buildShellBatches(
  buildings: FloorBuilding[],
  zones: FloorZone[],
  lite: boolean
): ShellBatches {
  const slab = newBatch();
  const slabColor: string[] = [];
  const wall = newBatch();
  const trim = newBatch();
  const truss = newBatch();
  const aoSkirt = newBatch();
  const zoneDecal = newBatch();
  const zoneDecalColor: string[] = [];
  const parts = lite ? 1 : TRUSS_PARTS;

  // A building only needs its own per-zone decal layer when it can actually
  // hold more than one hall; when every building maps 1:1 to a zone the
  // building-level slab tint already carries the whole signal, so skip this
  // pass entirely (zero extra instances, zero extra draw call).
  const needsZoneDecals = zones.length !== buildings.length;
  const zoneById = needsZoneDecals
    ? new Map(zones.map((z) => [z.id, z] as const))
    : null;

  for (const b of buildings) {
    if (b.width <= 0 || b.depth <= 0) continue;
    const h = Math.max(1, b.wallHeight);

    pushBox(slab, b.x, Y_SLAB, b.z, b.width, 0.02, b.depth);
    slabColor.push(statusTint(FLOOR_COLOR, b.worstStatus));

    if (zoneById) {
      for (const zoneId of b.zoneIds) {
        const zone = zoneById.get(zoneId);
        if (!zone || zone.width <= 0 || zone.depth <= 0) continue;
        pushBox(zoneDecal, zone.x, Y_ZONE_DECAL, zone.z, zone.width, 0.006, zone.depth);
        zoneDecalColor.push(statusTint(FLOOR_COLOR, zone.worstStatus));
      }
    }

    // Four perimeter glass walls, each framed top and bottom by the same solid
    // accent band (one instanced mesh for both): the cap draws the roofline
    // against a pale sky, and the skirt is what grounds the hall on a pale
    // floor now that nothing casts a real shadow — a plinth darker than the
    // wall face reads as contact, where a soft glow read as fog.
    const sides: ReadonlyArray<readonly [number, number, number, number]> = [
      [b.x, b.z - b.depth / 2, b.width, WALL_THICKNESS],
      [b.x, b.z + b.depth / 2, b.width, WALL_THICKNESS],
      [b.x - b.width / 2, b.z, WALL_THICKNESS, b.depth],
      [b.x + b.width / 2, b.z, WALL_THICKNESS, b.depth],
    ];
    for (const [px, pz, sx, sz] of sides) {
      pushBox(wall, px, h / 2, pz, sx, h, sz);
      pushBox(trim, px, h + 0.06, pz, sx, 0.14, sz * 1.25);
      pushBox(trim, px, WALL_SKIRT_H / 2, pz, sx, WALL_SKIRT_H, sz * 1.3);
      pushBox(
        aoSkirt,
        px,
        AO_SKIRT_H / 2,
        pz,
        sx + AO_SKIRT_MARGIN,
        AO_SKIRT_H,
        sz + AO_SKIRT_MARGIN
      );
    }

    // roof trusses: one beam across the depth per `trussX`, plus cross purlins
    const xs = b.trussX;
    const shift = trussIsWorld(b) ? 0 : b.x;
    for (let t = 0; t < xs.length; t++) {
      const x = xs[t] + shift;
      pushBox(truss, x, h, b.z, 0.34, 0.28, b.depth * 0.99);
      if (parts === 1) continue;
      const next = t + 1 < xs.length ? xs[t + 1] + shift : x;
      const gap = next - x;
      for (let c = 0; c < TRUSS_PARTS - 1; c++) {
        pushBox(
          truss,
          x + gap / 2,
          h - 0.32,
          b.z + (c - 1) * (b.depth / 3),
          Math.max(0.0001, gap),
          0.16,
          0.16
        );
      }
    }
  }

  return { slab, slabColor, wall, trim, truss, aoSkirt, zoneDecal, zoneDecalColor };
}

// ---------------------------------------------------------------------------
// Rooftop building names
// ---------------------------------------------------------------------------

/** Above this many buildings, only the ones holding machines get a name sign. */
const SIGN_BUILDING_CAP = 24;
const SIGN_DISTANCE_FACTOR = 42;

const SIGN_WRAPPER_STYLE: CSSProperties = { pointerEvents: "none", userSelect: "none" };

/**
 * Daylight name plate: a near-white card with near-black ink and a solid
 * status-coloured bar down its left edge. A blurred grey drop shadow lifts it
 * off the roof, so it stays legible whether it happens to sit against the pale
 * sky or against a pale roof — neither of which a glowing dark plate survived.
 */
const SIGN_PLATE_BASE: CSSProperties = {
  padding: "5px 16px 5px 12px",
  borderRadius: 7,
  borderLeftStyle: "solid",
  borderLeftWidth: 7,
  background: SIGN_PLATE_BG,
  color: SIGN_INK,
  boxShadow: `0 5px 16px -5px ${SIGN_SHADOW}`,
  fontSize: 26,
  fontWeight: 800,
  letterSpacing: 0.5,
  lineHeight: 1.15,
  whiteSpace: "nowrap",
  textAlign: "center",
};

/**
 * A name plate floating above each building's roofline, with a status bar tinted
 * by that building's worst machine status so a supervisor spots the bad hall
 * straight from the plant overview. drei `<Text>` cannot be trusted with Thai
 * glyphs (no SDF font shipped for the Thai range), so these are DOM overlays:
 * they cost zero draw calls and always shape Thai correctly.
 */
function RooftopSigns({ buildings }: { buildings: FloorBuilding[] }): ReactElement | null {
  const labelled = useMemo(
    () =>
      buildings.length > SIGN_BUILDING_CAP
        ? buildings.filter((b) => b.machineCount > 0)
        : buildings,
    [buildings]
  );

  if (labelled.length === 0) return null;

  return (
    <>
      {labelled.map((b) => {
        const bar = b.machineCount > 0 ? statusColor(b.worstStatus) : SITE.signGlow;
        return (
          <Html
            key={b.id}
            position={[b.x, Math.max(1, b.wallHeight) + 3.4, b.z]}
            center
            occlude={false}
            distanceFactor={SIGN_DISTANCE_FACTOR}
            zIndexRange={[8, 0]}
            style={SIGN_WRAPPER_STYLE}
          >
            <div style={{ ...SIGN_PLATE_BASE, borderLeftColor: bar }}>{b.label}</div>
          </Html>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Roads
// ---------------------------------------------------------------------------

const ROAD_LINE_CAP = 1200;
const ROAD_LINE_CAP_LITE = 600;

interface RoadBatches {
  plate: Batch;
  line: Batch;
}

/**
 * Asphalt plates for every road plus their painted markings in a single
 * marking batch: `main` roads get a dashed centre line, `service` roads get two
 * solid edge lines. The dash pitch is stretched (markings are never dropped)
 * until the instance budget is met.
 */
function buildRoadBatches(roads: FloorRoad[], lite: boolean): RoadBatches {
  const plate = newBatch();
  const line = newBatch();
  const cap = lite ? ROAD_LINE_CAP_LITE : ROAD_LINE_CAP;

  for (const r of roads) {
    if (r.width <= 0 || r.depth <= 0) continue;
    pushBox(plate, r.x, Y_ROAD, r.z, r.width, 0.02, r.depth);
  }

  const measure = (pitch: number): number => {
    let total = 0;
    for (const r of roads) {
      if (r.width <= 0 || r.depth <= 0) continue;
      if (r.kind === "main") {
        const len = r.horizontal ? r.width : r.depth;
        total += Math.max(2, Math.floor(len / pitch));
      } else {
        total += 2;
      }
    }
    return total;
  };

  let pitch = 3.6;
  let total = measure(pitch);
  if (total > cap) {
    pitch *= total / cap;
    total = measure(pitch);
    if (total > cap) pitch *= 1.15;
  }

  for (const r of roads) {
    if (r.width <= 0 || r.depth <= 0) continue;
    const along = r.horizontal ? r.width : r.depth;
    const across = r.horizontal ? r.depth : r.width;

    if (r.kind === "main") {
      const n = Math.max(2, Math.floor(along / pitch));
      const step = along / n;
      const dash = Math.max(0.6, step * 0.45);
      const start = (r.horizontal ? r.x : r.z) - along / 2 + step / 2;
      for (let k = 0; k < n; k++) {
        const at = start + k * step;
        if (r.horizontal) pushBox(line, at, Y_MARKING, r.z, dash, 0.02, 0.2);
        else pushBox(line, r.x, Y_MARKING, at, 0.2, 0.02, dash);
      }
    } else {
      const edge = Math.max(0.2, across / 2 - 0.4);
      for (let side = -1; side <= 1; side += 2) {
        if (r.horizontal) {
          pushBox(line, r.x, Y_MARKING, r.z + side * edge, along * 0.99, 0.02, 0.16);
        } else {
          pushBox(line, r.x + side * edge, Y_MARKING, r.z, 0.16, 0.02, along * 0.99);
        }
      }
    }
  }

  return { plate, line };
}

// ---------------------------------------------------------------------------
// Parking stall stripes
// ---------------------------------------------------------------------------

const STALL_CAP = 400;
const STALL_CAP_LITE = 200;

/** White stall dividers across every parking pad, thinned to the budget. */
function buildStallBatch(lots: FloorProp[], lite: boolean): Batch {
  const batch = newBatch();
  const cap = lite ? STALL_CAP_LITE : STALL_CAP;

  const measure = (pitch: number): number => {
    let total = 0;
    for (const lot of lots) {
      const along = Math.max(lot.width, lot.depth);
      total += Math.max(2, Math.floor(along / pitch) + 1);
    }
    return total;
  };

  let pitch = 2.7;
  let total = measure(pitch);
  if (total > cap) {
    pitch *= total / cap;
    total = measure(pitch);
    if (total > cap) pitch *= 1.15;
  }

  for (const lot of lots) {
    // stalls divide along the longer side; the stripe runs across the shorter
    const alongX = lot.width >= lot.depth;
    const along = alongX ? lot.width : lot.depth;
    const across = alongX ? lot.depth : lot.width;
    const n = Math.max(2, Math.floor(along / pitch) + 1);
    const step = along / (n - 1);
    const start = -along / 2;
    const yaw = lot.rotationY;
    for (let k = 0; k < n; k++) {
      const at = start + k * step;
      const px = lot.x + (alongX ? localXOffsetX(yaw, at) : localZOffsetX(yaw, at));
      const pz = lot.z + (alongX ? localXOffsetZ(yaw, at) : localZOffsetZ(yaw, at));
      pushBox(
        batch,
        px,
        Y_MARKING,
        pz,
        alongX ? 0.16 : across * 0.9,
        0.02,
        alongX ? across * 0.9 : 0.16,
        yaw
      );
    }
  }

  return batch;
}

// ---------------------------------------------------------------------------
// FacilityShell
// ---------------------------------------------------------------------------

export interface FacilityShellProps {
  layout: FloorLayout;
  lite: boolean;
  /**
   * Active camera preset, used only to fade the glass wall opacity (see
   * `WALL_OPACITY_BY_PRESET`). Optional and defaults to the pre-cutaway
   * fixed 0.52, so existing call sites are unaffected.
   */
  cameraPreset?: FloorCameraPreset;
}

const RACK_SHELVES = 3;
const OFFICE_WINDOWS = 2;
const GATE_SLATS = 5;
const YARD_CRATES = 3;
const YARD_KERBS = 4;
const TREE_FOLIAGE = 2;
/** Horizontal floor-slab bands marking storeys on the office block. */
const OFFICE_FLOOR_BANDS = 3;
/** Vertical share of a line-sign's total height (`FloorProp.height`) that the
 *  board plate itself occupies; the rest below it is the post. */
const LINE_SIGN_BOARD_H = 1.0;
/** One column per corner of a car porch canopy. */
const CAR_PORCH_COLUMNS = 4;
const FENCE_POSTS = 2;

interface FenceSplit {
  /** in-building error cordons — translucent amber */
  cordon: FloorProp[];
  /** site perimeter fence — posts + mesh panel */
  perimeter: FloorProp[];
}

/**
 * The layout emits `fence` props for two different things: the amber safety
 * cordon around a hall in `error`, and the site perimeter fence. They are told
 * apart geometrically — anything sitting inside (or hugging) a building
 * footprint is a cordon, everything else is perimeter — so no id convention has
 * to be agreed with the layout generator.
 */
function splitFences(fences: FloorProp[], buildings: FloorBuilding[]): FenceSplit {
  const cordon: FloorProp[] = [];
  const perimeter: FloorProp[] = [];
  for (const f of fences) {
    let inside = false;
    for (const b of buildings) {
      if (
        Math.abs(f.x - b.x) <= b.width / 2 + 1.5 &&
        Math.abs(f.z - b.z) <= b.depth / 2 + 1.5
      ) {
        inside = true;
        break;
      }
    }
    if (inside) cordon.push(f);
    else perimeter.push(f);
  }
  return { cordon, perimeter };
}

export function FacilityShell({
  layout,
  lite,
  cameraPreset,
}: FacilityShellProps): ReactElement | null {
  const wallTargetOpacity =
    (cameraPreset && WALL_OPACITY_BY_PRESET[cameraPreset]) ?? WALL_OPACITY_DEFAULT;
  const empty = isEmptyLayout(layout);

  const byKind = useMemo(() => {
    const map: Record<FloorPropKind, FloorProp[]> = {
      rack: [],
      pillar: [],
      dock: [],
      office: [],
      crate: [],
      tank: [],
      fence: [],
      sign: [],
      gate: [],
      guardhouse: [],
      parking: [],
      yard: [],
      tree: [],
      officeBlock: [],
      officePlaza: [],
      flagpole: [],
      hedge: [],
      lineSign: [],
      officeAnnex: [],
      carPorch: [],
      lightPole: [],
    };
    for (const prop of layout.props) {
      const bucket = map[prop.kind];
      if (bucket) bucket.push(prop);
    }
    return map;
  }, [layout]);

  const buildings = useMemo(
    () => layout.buildings.filter((b) => b.width > 0 && b.depth > 0),
    [layout]
  );
  const fences = useMemo(() => splitFences(byKind.fence, buildings), [byKind, buildings]);
  const shell = useMemo(
    () => buildShellBatches(buildings, layout.zones, lite),
    [buildings, layout.zones, lite]
  );
  const roads = useMemo(() => buildRoadBatches(layout.roads ?? [], lite), [layout, lite]);
  const stalls = useMemo(() => buildStallBatch(byKind.parking, lite), [byKind, lite]);
  /**
   * Every flat ground pad gets the same low kerb, in ONE instanced mesh: on a
   * pale floor with no cast shadows, a raised edge darker than the pad face is
   * what stops a pad from looking like a decal painted on the tarmac.
   */
  const kerbPads = useMemo(() => [...byKind.yard, ...byKind.parking], [byKind]);

  const mainAisles = useMemo(() => layout.aisles.filter((a) => a.main), [layout]);
  const walkAisles = useMemo(() => layout.aisles.filter((a) => !a.main), [layout]);
  const stripes = useMemo(() => buildStripes(layout.aisles, lite), [layout, lite]);

  const ground = useMemo(() => {
    const site = layout.site;
    const w = Math.max(layout.width, site ? site.width : 0);
    const d = Math.max(layout.depth, site ? site.depth : 0);
    const pad = site ? Math.max(0, site.fencePadding) : 0;
    return { asphaltW: w, asphaltD: d, grassW: w + pad * 2 + 30, grassD: d + pad * 2 + 30 };
  }, [layout]);

  if (empty) return null;

  return (
    <group>
      {/* --- site ground: grass apron under a site-wide asphalt pad --- */}
      <mesh position={[0, Y_GRASS, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[ground.grassW, ground.grassD]} />
        <meshStandardMaterial
          color={SITE.grass}
          roughness={1}
          metalness={0}
          polygonOffset
          polygonOffsetFactor={4}
        />
      </mesh>
      <mesh position={[0, Y_ASPHALT, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[ground.asphaltW, ground.asphaltD]} />
        <meshStandardMaterial
          color={SITE.asphalt}
          roughness={0.98}
          metalness={0.04}
          polygonOffset
          polygonOffsetFactor={3}
        />
      </mesh>

      {/* --- roads: asphalt plates + painted markings --- */}
      <StaticLayer
        count={roads.plate.count}
        source={roads}
        color={SITE.asphalt}
        roughness={0.95}
        metalness={0.08}
        offsetFactor={2}
        write={(i) => applyBatch(roads.plate, i)}
      />
      {/* markings read as a darker grey than the pale tarmac, not as white paint */}
      <StaticLayer
        count={roads.line.count}
        source={roads}
        color={MARKING_INK}
        roughness={0.8}
        metalness={0.05}
        offsetFactor={-4}
        write={(i) => applyBatch(roads.line, i)}
      />

      {/* --- building shells: slabs (status-tinted), glass walls, accent cap + skirt band, roof trusses --- */}
      <TintedBoxLayer
        batch={shell.slab}
        colors={shell.slabColor}
        roughness={0.94}
        metalness={0.08}
        offsetFactor={-1}
      />
      {/* per-hall status decal — only present when a building spans >1 zone */}
      <TintedBoxLayer
        batch={shell.zoneDecal}
        colors={shell.zoneDecalColor}
        roughness={0.92}
        metalness={0.06}
        offsetFactor={-1.5}
      />
      <WallGlassLayer
        count={shell.wall.count}
        source={shell}
        write={(i) => applyBatch(shell.wall, i)}
        targetOpacity={wallTargetOpacity}
        outlineWrite={lite ? undefined : (i) => applyOutlineBatch(shell.wall, i)}
      />
      {/* baked AO pooling at the foot of every wall, see AoSkirtLayer */}
      <AoSkirtLayer batch={shell.aoSkirt} color={LIVE_FLOOR_THEME.shadowColor} />
      {/* cap band + grounding skirt, one mesh: solid accent, no glow */}
      <StaticLayer
        count={shell.trim.count}
        source={shell}
        color={ACCENT_CYAN}
        roughness={0.78}
        metalness={0.12}
        write={(i) => applyBatch(shell.trim, i)}
      />
      <StaticLayer
        count={shell.truss.count}
        source={shell}
        color={STRUCTURE_COLOR}
        roughness={0.82}
        metalness={0.18}
        write={(i) => applyBatch(shell.truss, i)}
      />

      {/* Sims-style shell-silhouette outline is now rendered by
          `WallGlassLayer` itself (via `outlineWrite` above, gated on `lite`),
          because it must fade in lockstep with the glass wall's own
          camera-aware opacity — see the `outlineWrite` doc on
          `WallGlassLayerProps`. Trusses, trim bands and the AO skirt stay
          un-outlined — surface detail inside the silhouette, not the shape
          that defines it. */}

      <RooftopSigns buildings={buildings} />

      {/* painted in-hall floor markings */}
      <AislePlates aisles={mainAisles} main />
      <AislePlates aisles={walkAisles} main={false} />
      <AisleStripes spec={stripes} />

      {/* --- racks: dark steel frame + shelf slabs --- */}
      <PropLayer
        items={byKind.rack}
        color={STRUCTURE_COLOR}
        metalness={0.18}
        roughness={0.8}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.rack}
        color={STEEL_MID}
        metalness={0.15}
        roughness={0.8}
        perItem={RACK_SHELVES}
        write={(p, sub) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, (p.height * (sub + 1)) / (RACK_SHELVES + 0.5), p.z);
          DUMMY.scale.set(p.width * 1.04, 0.09, p.depth * 1.06);
        }}
      />

      {/* --- pillars: concrete + hazard base band --- */}
      <PropLayer
        items={byKind.pillar}
        color={CONCRETE_COLOR}
        metalness={0.1}
        roughness={0.85}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.pillar}
        color={HAZARD_AMBER}
        metalness={0.15}
        roughness={0.7}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, 0.35, p.z);
          DUMMY.scale.set(p.width * 1.12, 0.7, p.depth * 1.12);
        }}
      />

      {/* --- docks: raised platform + painted roll-up door plate --- */}
      <PropLayer
        items={byKind.dock}
        color={STRUCTURE_COLOR}
        metalness={0.3}
        roughness={0.8}
        perItem={1}
        write={(p) => {
          const h = Math.max(0.4, p.height * 0.35);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, h / 2, p.z);
          DUMMY.scale.set(p.width, h, p.depth);
        }}
      />
      <PropLayer
        items={byKind.dock}
        color={ACCENT_CYAN}
        metalness={0.15}
        roughness={0.7}
        perItem={1}
        write={(p) => {
          const k = -p.depth / 2;
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(
            p.x + localZOffsetX(p.rotationY, k),
            p.height * 0.55,
            p.z + localZOffsetZ(p.rotationY, k)
          );
          DUMMY.scale.set(p.width * 0.88, Math.max(0.6, p.height * 0.8), 0.18);
        }}
      />

      {/* --- offices: block + glazed window bands (daylight glass, not lit) --- */}
      <PropLayer
        items={byKind.office}
        color={STRUCTURE_COLOR}
        metalness={0.25}
        roughness={0.75}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.office}
        color={ACCENT_CYAN}
        metalness={0.4}
        roughness={0.22}
        perItem={OFFICE_WINDOWS}
        write={(p, sub) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height * (sub === 0 ? 0.42 : 0.74), p.z);
          DUMMY.scale.set(p.width * 1.01, p.height * 0.16, p.depth * 1.01);
        }}
      />

      {/* --- crates --- */}
      <PropLayer
        items={byKind.crate}
        color={CARGO_TAN}
        metalness={0.08}
        roughness={0.9}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />

      {/* --- tanks --- */}
      <PropLayer
        items={byKind.tank}
        color={STEEL_MID}
        metalness={0.22}
        roughness={0.65}
        shape="cylinder"
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />

      {/* --- in-building safety cordons: translucent amber --- */}
      <PropLayer
        items={fences.cordon}
        color={HAZARD_AMBER}
        metalness={0.2}
        roughness={0.6}
        opacity={0.4}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, Math.max(0.5, p.height) / 2, p.z);
          DUMMY.scale.set(p.width, Math.max(0.5, p.height), p.depth);
        }}
      />

      {/* --- site perimeter fence: steel posts + translucent mesh panel --- */}
      <PropLayer
        items={fences.perimeter}
        color={STEEL_MID}
        metalness={0.2}
        roughness={0.75}
        perItem={FENCE_POSTS}
        write={(p, sub) => {
          const h = Math.max(0.8, p.height);
          const k = (sub === 0 ? -1 : 1) * (p.width / 2);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(
            p.x + localXOffsetX(p.rotationY, k),
            h / 2,
            p.z + localXOffsetZ(p.rotationY, k)
          );
          DUMMY.scale.set(0.16, h * 1.06, 0.16);
        }}
      />
      <PropLayer
        items={fences.perimeter}
        color={MARKING_INK}
        metalness={0.4}
        roughness={0.65}
        opacity={0.4}
        doubleSided
        perItem={1}
        write={(p) => {
          const h = Math.max(0.8, p.height);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, h * 0.56, p.z);
          DUMMY.scale.set(p.width * 0.98, h * 0.78, Math.min(0.08, p.depth));
        }}
      />

      {/* --- gate: two posts + a slatted sliding panel --- */}
      <PropLayer
        items={byKind.gate}
        color={STEEL_MID}
        metalness={0.2}
        roughness={0.75}
        perItem={FENCE_POSTS}
        write={(p, sub) => {
          const h = Math.max(1.5, p.height);
          const k = (sub === 0 ? -1 : 1) * (p.width / 2 + 0.2);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(
            p.x + localXOffsetX(p.rotationY, k),
            h * 0.62,
            p.z + localXOffsetZ(p.rotationY, k)
          );
          DUMMY.scale.set(0.34, h * 1.24, 0.34);
        }}
      />
      <PropLayer
        items={byKind.gate}
        color={SITE.gateAccent}
        metalness={0.2}
        roughness={0.6}
        perItem={GATE_SLATS}
        write={(p, sub) => {
          const h = Math.max(1.5, p.height);
          // the panel is slid ~18% open so the gateway reads as an entrance
          const slide = p.width * 0.18;
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(
            p.x + localXOffsetX(p.rotationY, slide),
            (h * (sub + 0.6)) / (GATE_SLATS + 0.4),
            p.z + localXOffsetZ(p.rotationY, slide)
          );
          DUMMY.scale.set(p.width * 0.9, h / (GATE_SLATS * 2.6), Math.min(0.14, p.depth));
        }}
      />

      {/* --- guardhouse: small block with a glazed window band --- */}
      <PropLayer
        items={byKind.guardhouse}
        color={STRUCTURE_COLOR}
        metalness={0.25}
        roughness={0.8}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.guardhouse}
        color={ACCENT_CYAN}
        metalness={0.4}
        roughness={0.22}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height * 0.66, p.z);
          DUMMY.scale.set(p.width * 1.02, p.height * 0.24, p.depth * 1.02);
        }}
      />

      {/* --- parking lots: flat pad + grey stall stripes (kerbed with the yards below) --- */}
      <PropLayer
        items={byKind.parking}
        color={SITE.asphalt}
        metalness={0.06}
        roughness={0.96}
        offsetFactor={1}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, Y_PAD, p.z);
          DUMMY.scale.set(p.width, 0.02, p.depth);
        }}
      />
      <StaticLayer
        count={stalls.count}
        source={stalls}
        color={MARKING_INK}
        roughness={0.85}
        metalness={0.05}
        offsetFactor={-4}
        write={(i) => applyBatch(stalls, i)}
      />

      {/* --- material yards: flat pad + low kerb + a few stacked crates --- */}
      <PropLayer
        items={byKind.yard}
        color={CONCRETE_COLOR}
        metalness={0.05}
        roughness={0.98}
        opacity={0.85}
        offsetFactor={1}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, Y_PAD, p.z);
          DUMMY.scale.set(p.width, 0.02, p.depth);
        }}
      />
      {/* shared kerb: material yards + parking pads, one mesh */}
      <PropLayer
        items={kerbPads}
        color={PAD_KERB}
        metalness={0.15}
        roughness={0.9}
        perItem={YARD_KERBS}
        write={(p, sub) => {
          const alongX = sub < 2;
          const sign = sub % 2 === 0 ? -1 : 1;
          const k = sign * (alongX ? p.depth / 2 : p.width / 2);
          const ox = alongX ? localZOffsetX(p.rotationY, k) : localXOffsetX(p.rotationY, k);
          const oz = alongX ? localZOffsetZ(p.rotationY, k) : localXOffsetZ(p.rotationY, k);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x + ox, 0.16, p.z + oz);
          DUMMY.scale.set(alongX ? p.width : 0.3, 0.32, alongX ? 0.3 : p.depth);
        }}
      />
      <PropLayer
        items={byKind.yard}
        color={CARGO_TAN}
        metalness={0.08}
        roughness={0.9}
        perItem={YARD_CRATES}
        write={(p, sub) => {
          const seed = sub * 7 + 1;
          const size = 1.3 + hash01(seed, 17) * 0.7;
          const ax = (hash01(seed, 29) - 0.5) * Math.max(0, p.width - size * 2.2);
          const az = (hash01(seed, 37) - 0.5) * Math.max(0, p.depth - size * 2.2);
          const stack = 1 + Math.floor(hash01(seed, 43) * 2);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(
            p.x + localXOffsetX(p.rotationY, ax) + localZOffsetX(p.rotationY, az),
            (size * stack) / 2 + 0.2,
            p.z + localXOffsetZ(p.rotationY, ax) + localZOffsetZ(p.rotationY, az)
          );
          DUMMY.scale.set(size, size * stack, size);
        }}
      />

      {/* --- trees: trunk + one or two foliage cones --- */}
      <PropLayer
        items={byKind.tree}
        color={SITE.trunk}
        metalness={0.05}
        roughness={0.95}
        shape="cylinder"
        perItem={1}
        write={(p) => {
          const h = Math.max(1.5, p.height);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, h * 0.22, p.z);
          DUMMY.scale.set(Math.max(0.24, p.width * 0.16), h * 0.44, Math.max(0.24, p.width * 0.16));
        }}
      />
      <PropLayer
        items={byKind.tree}
        color={SITE.foliage}
        metalness={0.02}
        roughness={0.95}
        shape="cone"
        perItem={lite ? 1 : TREE_FOLIAGE}
        write={(p, sub) => {
          const h = Math.max(1.5, p.height);
          const w = Math.max(1, p.width);
          DUMMY.rotation.set(0, p.rotationY, 0);
          if (sub === 0) {
            DUMMY.position.set(p.x, h * 0.62, p.z);
            DUMMY.scale.set(w, h * 0.52, w);
          } else {
            DUMMY.position.set(p.x, h * 0.88, p.z);
            DUMMY.scale.set(w * 0.66, h * 0.4, w * 0.66);
          }
        }}
      />

      {/* --- office block: solid core + glazed band + floor-slab bands + roof cap --- */}
      <PropLayer
        items={byKind.officeBlock}
        color={SITE.officeWall}
        metalness={0.2}
        roughness={0.75}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.officeBlock}
        color={OFFICE_GLASS}
        metalness={0.4}
        roughness={0.2}
        opacity={0.82}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height * 0.56, p.z);
          DUMMY.scale.set(p.width * 1.005, p.height * 0.42, p.depth * 1.005);
        }}
      />
      <PropLayer
        items={byKind.officeBlock}
        color={SITE.officeBand}
        metalness={0.3}
        roughness={0.55}
        perItem={OFFICE_FLOOR_BANDS}
        write={(p, sub) => {
          const bandY = (p.height * (sub + 1)) / (OFFICE_FLOOR_BANDS + 1);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, bandY, p.z);
          DUMMY.scale.set(p.width * 1.02, Math.max(0.14, p.height * 0.03), p.depth * 1.02);
        }}
      />
      <PropLayer
        items={byKind.officeBlock}
        color={SITE.officeRoof}
        metalness={0.25}
        roughness={0.6}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height + 0.15, p.z);
          DUMMY.scale.set(p.width + 1.2, 0.3, p.depth + 1.2);
        }}
      />
      {/* outline: office cluster core massing only (not the glazed band, floor
          bands or roof cap — those are surface detail on top of the shape the
          outline is meant to trace). Gated behind `lite` for the same reason
          as the machine outlines in LiveFloor4DScene.tsx: a weak machine
          (auto-lite past 250 machines, or an explicit `highQuality={false}`)
          drops every inverted-hull outline at once, machine and site alike. */}
      {!lite && (
        <PropLayer
          items={byKind.officeBlock}
          color={OUTLINE_INK}
          metalness={0}
          roughness={1}
          backSide
          perItem={1}
          write={(p) => {
            DUMMY.rotation.set(0, p.rotationY, 0);
            DUMMY.position.set(p.x, p.height / 2, p.z);
            DUMMY.scale.set(
              p.width + OUTLINE_MARGIN * 2,
              p.height + OUTLINE_MARGIN * 2,
              p.depth + OUTLINE_MARGIN * 2
            );
          }}
        />
      )}

      {/* --- office annex: smaller closed admin/canteen block, same visual
          family as the office block above — solid core, glazed band, roof
          cap. Deliberately no interior: this is decorative massing only. --- */}
      <PropLayer
        items={byKind.officeAnnex}
        color={SITE.officeWall}
        metalness={0.18}
        roughness={0.8}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.officeAnnex}
        color={OFFICE_GLASS}
        metalness={0.35}
        roughness={0.25}
        opacity={0.82}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height * 0.55, p.z);
          DUMMY.scale.set(p.width * 1.005, p.height * 0.36, p.depth * 1.005);
        }}
      />
      <PropLayer
        items={byKind.officeAnnex}
        color={SITE.officeRoof}
        metalness={0.2}
        roughness={0.7}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height + 0.12, p.z);
          DUMMY.scale.set(p.width + 0.8, 0.26, p.depth + 0.8);
        }}
      />
      {!lite && (
        <PropLayer
          items={byKind.officeAnnex}
          color={OUTLINE_INK}
          metalness={0}
          roughness={1}
          backSide
          perItem={1}
          write={(p) => {
            DUMMY.rotation.set(0, p.rotationY, 0);
            DUMMY.position.set(p.x, p.height / 2, p.z);
            DUMMY.scale.set(
              p.width + OUTLINE_MARGIN * 2,
              p.height + OUTLINE_MARGIN * 2,
              p.depth + OUTLINE_MARGIN * 2
            );
          }}
        />
      )}

      {/* --- car porch: slim columns + a flat canopy roof projecting from the
          office front. Columns are thin enough that the outline pass would
          read as noise on them, so only the canopy slab (the part that reads
          as a silhouette from a distance) is outlined below. --- */}
      <PropLayer
        items={byKind.carPorch}
        color={STEEL_MID}
        metalness={0.18}
        roughness={0.78}
        perItem={CAR_PORCH_COLUMNS}
        write={(p, sub) => {
          const cx = (sub % 2 === 0 ? -1 : 1) * (p.width / 2 - 0.4);
          const cz = (sub < 2 ? -1 : 1) * (p.depth / 2 - 0.3);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(
            p.x + localXOffsetX(p.rotationY, cx) + localZOffsetX(p.rotationY, cz),
            p.height / 2,
            p.z + localXOffsetZ(p.rotationY, cx) + localZOffsetZ(p.rotationY, cz)
          );
          DUMMY.scale.set(0.22, p.height, 0.22);
        }}
      />
      <PropLayer
        items={byKind.carPorch}
        color={SITE.officeRoof}
        metalness={0.2}
        roughness={0.65}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height + 0.1, p.z);
          DUMMY.scale.set(p.width, 0.2, p.depth);
        }}
      />
      {!lite && (
        <PropLayer
          items={byKind.carPorch}
          color={OUTLINE_INK}
          metalness={0}
          roughness={1}
          backSide
          perItem={1}
          write={(p) => {
            DUMMY.rotation.set(0, p.rotationY, 0);
            DUMMY.position.set(p.x, p.height + 0.1, p.z);
            DUMMY.scale.set(
              p.width + OUTLINE_MARGIN * 2,
              0.2 + OUTLINE_MARGIN * 2,
              p.depth + OUTLINE_MARGIN * 2
            );
          }}
        />
      )}

      {/* --- production line signs: post + board + a coloured header bar. No
          per-sign <Html> label — geometry/colour only, per this file's DOM
          overlay cap. Outlined (the board only, not the slim post) since this
          is the one prop family whose entire purpose is to be read at a
          glance down the line. --- */}
      <PropLayer
        items={byKind.lineSign}
        color={STEEL_MID}
        metalness={0.18}
        roughness={0.78}
        perItem={1}
        write={(p) => {
          const postH = Math.max(0.4, p.height - LINE_SIGN_BOARD_H);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, postH / 2, p.z);
          DUMMY.scale.set(0.14, postH, 0.14);
        }}
      />
      <PropLayer
        items={byKind.lineSign}
        color={SITE.signPlate}
        metalness={0.05}
        roughness={0.8}
        perItem={1}
        write={(p) => {
          const postH = Math.max(0.4, p.height - LINE_SIGN_BOARD_H);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, postH + LINE_SIGN_BOARD_H / 2, p.z);
          DUMMY.scale.set(p.width, LINE_SIGN_BOARD_H, p.depth);
        }}
      />
      <PropLayer
        items={byKind.lineSign}
        color={ACCENT_CYAN}
        metalness={0.1}
        roughness={0.6}
        perItem={1}
        write={(p) => {
          const headerH = LINE_SIGN_BOARD_H * 0.34;
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height - headerH / 2, p.z);
          DUMMY.scale.set(p.width * 1.01, headerH, p.depth * 1.15);
        }}
      />
      {!lite && (
        <PropLayer
          items={byKind.lineSign}
          color={OUTLINE_INK}
          metalness={0}
          roughness={1}
          backSide
          perItem={1}
          write={(p) => {
            const postH = Math.max(0.4, p.height - LINE_SIGN_BOARD_H);
            DUMMY.rotation.set(0, p.rotationY, 0);
            DUMMY.position.set(p.x, postH + LINE_SIGN_BOARD_H / 2, p.z);
            DUMMY.scale.set(
              p.width + OUTLINE_MARGIN * 2,
              LINE_SIGN_BOARD_H + OUTLINE_MARGIN * 2,
              p.depth + OUTLINE_MARGIN * 2
            );
          }}
        />
      )}

      {/* --- road light poles: pole + arm + lamp head. No outline — thin poles
          in large numbers are exactly the "noise, not signal" case called out
          for this pass, and the lamp housing already reads via saturated
          diffuse colour against the pale road/sky per this file's daylight
          contract. --- */}
      <PropLayer
        items={byKind.lightPole}
        color={STEEL_MID}
        metalness={0.2}
        roughness={0.75}
        shape="cylinder"
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />
      <PropLayer
        items={byKind.lightPole}
        color={STEEL_MID}
        metalness={0.2}
        roughness={0.75}
        perItem={1}
        write={(p) => {
          const armLen = 1.1;
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x + armLen / 2, p.height - 0.15, p.z);
          DUMMY.scale.set(armLen, 0.12, 0.12);
        }}
      />
      <PropLayer
        items={byKind.lightPole}
        color={SITE.lampHousing}
        emissive={SITE.lampHousing}
        emissiveIntensity={0.35}
        metalness={0.1}
        roughness={0.55}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x + 1.1, p.height - 0.32, p.z);
          DUMMY.scale.set(0.4, 0.22, 0.26);
        }}
      />

      {/* --- office plaza: paved forecourt + a narrower entrance walkway --- */}
      <PropLayer
        items={byKind.officePlaza}
        color={SITE.plazaPaving}
        metalness={0.05}
        roughness={0.9}
        offsetFactor={1}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, Y_PAD, p.z);
          DUMMY.scale.set(p.width, 0.02, p.depth);
        }}
      />
      <PropLayer
        items={byKind.officePlaza}
        color={SITE.plazaPaving}
        metalness={0.05}
        roughness={0.9}
        offsetFactor={1}
        perItem={1}
        write={(p) => {
          // narrow walkway continuing from the plaza's far edge toward the
          // entrance road, at the same Y_PAD height as the plaza slab itself
          // (see the vertical-stacking note near Y_GRASS above) so it shares
          // the plaza's plane instead of introducing a new coplanar layer.
          const walkDepth = Math.min(6, p.depth * 0.6);
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, Y_PAD, p.z + p.depth / 2 + walkDepth / 2);
          DUMMY.scale.set(Math.min(4, p.width * 0.18), 0.02, walkDepth);
        }}
      />

      {/* --- flagpoles: thin pole + a small static flag near the top --- */}
      <PropLayer
        items={byKind.flagpole}
        color={SITE.flagpole}
        metalness={0.5}
        roughness={0.4}
        shape="cylinder"
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width * 0.3, p.height, p.depth * 0.3);
        }}
      />
      <PropLayer
        items={byKind.flagpole}
        color={SITE.flag}
        metalness={0.1}
        roughness={0.7}
        doubleSided
        perItem={1}
        write={(p) => {
          const flagH = p.height * 0.18;
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x + p.width * 0.9, p.height - flagH / 2, p.z);
          DUMMY.scale.set(p.width * 1.8, flagH, 0.02);
        }}
      />

      {/* --- hedges: low rounded green boxes along the plaza edges --- */}
      <PropLayer
        items={byKind.hedge}
        color={SITE.hedge}
        metalness={0.02}
        roughness={0.95}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(p.width, p.height, p.depth);
        }}
      />

      {/* --- in-hall hanging signs: post + plate --- */}
      <PropLayer
        items={byKind.sign}
        color={STEEL_MID}
        metalness={0.6}
        roughness={0.5}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height / 2, p.z);
          DUMMY.scale.set(0.16, p.height, 0.16);
        }}
      />
      <PropLayer
        items={byKind.sign}
        color={ACCENT_CYAN}
        metalness={0.3}
        roughness={0.45}
        perItem={1}
        write={(p) => {
          DUMMY.rotation.set(0, p.rotationY, 0);
          DUMMY.position.set(p.x, p.height * 0.86, p.z);
          DUMMY.scale.set(Math.max(0.8, p.width), Math.max(0.35, p.height * 0.3), 0.1);
        }}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2. ConveyorSystem
// ---------------------------------------------------------------------------

export interface ConveyorSystemProps {
  layout: FloorLayout;
  simulation: FloorSimulation;
  lite: boolean;
}

const BELT_TOP = 0.55;
const BELT_WIDTH = 1.4;
const CHEVRON_CAP = 900;
const CHEVRON_CAP_LITE = 0;
const CARGO_CAP = 700;
const CARGO_CAP_LITE = 260;
const ROLLER_CAP = 1200;
const ROLLER_CAP_LITE = 0;
/** how often the per-line target speed is re-aggregated from the sim, seconds */
const SPEED_REFRESH = 0.25;
const MAX_BELT_SPEED = 3.2;

interface ConveyorData {
  lineCount: number;
  originX: Float32Array;
  originZ: Float32Array;
  dirX: Float32Array;
  dirZ: Float32Array;
  len: Float32Array;
  yaw: Float32Array;
  /** machine ids per line, for the 4 Hz speed aggregation */
  machineIds: string[][];
  speed: Float32Array;
  target: Float32Array;
  chevronLine: Int32Array;
  chevronPos: Float32Array;
  cargoLine: Int32Array;
  cargoPos: Float32Array;
  rollerCount: number;
  rollerLine: Int32Array;
  rollerPos: Float32Array;
  /** per-line bounding-sphere centre/radius, computed once — used by the
   *  throttled visibility gate in `useFrame` so it never has to re-derive
   *  geometry from the line endpoints. */
  lineCenterX: Float32Array;
  lineCenterZ: Float32Array;
  lineRadius: Float32Array;
  /** per-line visibility flag, mutated in place by the throttled gate (never
   *  reallocated) — 1 while the line's bounding sphere is in the camera
   *  frustum, 0 while it is fully offscreen. */
  lineVisible: Uint8Array;
}

/** Spread `cap` riders across the lines proportionally to their length. */
function distributeRiders(
  len: Float32Array,
  pitch: number,
  cap: number
): { line: Int32Array; pos: Float32Array } {
  const lineCount = len.length;
  let total = 0;
  for (let l = 0; l < lineCount; l++) {
    total += Math.max(1, Math.floor(len[l] / pitch));
  }
  let effectivePitch = pitch;
  if (cap > 0 && total > cap) {
    effectivePitch = pitch * (total / cap) * 1.05;
  }

  let n = 0;
  for (let l = 0; l < lineCount; l++) {
    n += Math.max(1, Math.floor(len[l] / effectivePitch));
  }
  if (cap === 0) n = 0;
  if (n > cap) n = cap;

  const line = new Int32Array(n);
  const pos = new Float32Array(n);
  let i = 0;
  for (let l = 0; l < lineCount && i < n; l++) {
    const per = Math.max(1, Math.floor(len[l] / effectivePitch));
    const step = len[l] / per;
    for (let k = 0; k < per && i < n; k++) {
      line[i] = l;
      pos[i] = k * step;
      i += 1;
    }
  }
  return { line, pos };
}

function buildConveyorData(layout: FloorLayout, lite: boolean): ConveyorData {
  const lines = layout.lines;
  const lineCount = lines.length;

  const originX = new Float32Array(lineCount);
  const originZ = new Float32Array(lineCount);
  const dirX = new Float32Array(lineCount);
  const dirZ = new Float32Array(lineCount);
  const len = new Float32Array(lineCount);
  const yaw = new Float32Array(lineCount);

  for (let l = 0; l < lineCount; l++) {
    const line = lines[l];
    const dx = line.x2 - line.x1;
    const dz = line.z2 - line.z1;
    const length = Math.max(0.001, Math.hypot(dx, dz));
    originX[l] = line.x1;
    originZ[l] = line.z1;
    dirX[l] = dx / length;
    dirZ[l] = dz / length;
    len[l] = length;
    yaw[l] = yawFor(dx / length, dz / length);
  }

  const machineIds: string[][] = [];
  const indexOfLine = new Map<string, number>();
  for (let l = 0; l < lineCount; l++) {
    indexOfLine.set(lines[l].id, l);
    machineIds.push([]);
  }
  for (const slot of layout.slots) {
    const l = indexOfLine.get(slot.lineId);
    if (l !== undefined) machineIds[l].push(slot.machine.id);
  }

  const chevrons = distributeRiders(len, 3.2, lite ? CHEVRON_CAP_LITE : CHEVRON_CAP);
  const cargo = distributeRiders(len, 6.5, lite ? CARGO_CAP_LITE : CARGO_CAP);
  const rollers = distributeRiders(len, 1.6, lite ? ROLLER_CAP_LITE : ROLLER_CAP);

  // one bounding sphere per line, computed once — the gate in useFrame just
  // tests these against the camera frustum instead of touching geometry.
  const lineCenterX = new Float32Array(lineCount);
  const lineCenterZ = new Float32Array(lineCount);
  const lineRadius = new Float32Array(lineCount);
  const lineVisible = new Uint8Array(lineCount);
  for (let l = 0; l < lineCount; l++) {
    lineCenterX[l] = originX[l] + dirX[l] * (len[l] / 2);
    lineCenterZ[l] = originZ[l] + dirZ[l] * (len[l] / 2);
    // half-length plus belt width/cargo box margin so the sphere fully
    // encloses every rider on the line, not just its centreline
    lineRadius[l] = len[l] / 2 + BELT_WIDTH * 1.5;
    lineVisible[l] = 1; // default visible until the first throttled check runs
  }

  return {
    lineCount,
    originX,
    originZ,
    dirX,
    dirZ,
    len,
    yaw,
    machineIds,
    speed: new Float32Array(lineCount),
    target: new Float32Array(lineCount),
    chevronLine: chevrons.line,
    chevronPos: chevrons.pos,
    cargoLine: cargo.line,
    cargoPos: cargo.pos,
    rollerCount: rollers.line.length,
    rollerLine: rollers.line,
    rollerPos: rollers.pos,
    lineCenterX,
    lineCenterZ,
    lineRadius,
    lineVisible,
  };
}

export function ConveyorSystem({
  layout,
  simulation,
  lite,
}: ConveyorSystemProps): ReactElement | null {
  const empty = isEmptyLayout(layout) || layout.lines.length === 0;
  const data = useMemo(() => buildConveyorData(layout, lite), [layout, lite]);

  const beltRef = useRef<THREE.InstancedMesh>(null);
  const railRef = useRef<THREE.InstancedMesh>(null);
  const rollerRef = useRef<THREE.InstancedMesh>(null);
  const chevronRef = useRef<THREE.InstancedMesh>(null);
  const cargoRef = useRef<THREE.InstancedMesh>(null);
  const refreshAcc = useRef(0);
  const moveAcc = useRef(0); // throttle heavy per-rider update to ~30Hz
  const cullAcc = useRef(0); // throttle the coarse per-line visibility gate to ~5Hz
  const { camera } = useThree();
  // Distance-LOD companion to the frustum gate below (mirrors
  // ANIM_LOD_DISTANCE_FACTOR in LiveFloor4DScene.tsx): beyond this camera
  // distance a conveyor line's belt scroll / rider motion is a few pixels at
  // most, so animating it is wasted work — and it keeps a zoomed-out plant
  // view consistent with the machines, which already freeze at this same
  // multiple of suggestedCameraDistance.
  const conveyorLodDistanceSq = useMemo(() => {
    const d = layout.suggestedCameraDistance * CONVEYOR_LOD_DISTANCE_FACTOR;
    return d * d;
  }, [layout]);

  // static instances: belts, rails, rollers — written once
  useLayoutEffect(() => {
    const belt = beltRef.current;
    const rail = railRef.current;
    if (belt) {
      for (let l = 0; l < data.lineCount; l++) {
        DUMMY.rotation.set(0, data.yaw[l], 0);
        DUMMY.position.set(
          data.originX[l] + (data.dirX[l] * data.len[l]) / 2,
          BELT_TOP - 0.09,
          data.originZ[l] + (data.dirZ[l] * data.len[l]) / 2
        );
        DUMMY.scale.set(data.len[l], 0.18, BELT_WIDTH);
        DUMMY.updateMatrix();
        belt.setMatrixAt(l, DUMMY.matrix);
      }
      belt.instanceMatrix.needsUpdate = true;
      belt.computeBoundingSphere();
    }
    if (rail) {
      let i = 0;
      for (let l = 0; l < data.lineCount; l++) {
        for (let side = -1; side <= 1; side += 2) {
          const lateral = (side * BELT_WIDTH) / 2;
          DUMMY.rotation.set(0, data.yaw[l], 0);
          DUMMY.position.set(
            data.originX[l] +
              (data.dirX[l] * data.len[l]) / 2 +
              localZOffsetX(data.yaw[l], lateral),
            BELT_TOP + 0.09,
            data.originZ[l] +
              (data.dirZ[l] * data.len[l]) / 2 +
              localZOffsetZ(data.yaw[l], lateral)
          );
          DUMMY.scale.set(data.len[l], 0.14, 0.12);
          DUMMY.updateMatrix();
          rail.setMatrixAt(i, DUMMY.matrix);
          i += 1;
        }
      }
      rail.instanceMatrix.needsUpdate = true;
      rail.computeBoundingSphere();
    }
  }, [data]);

  useLayoutEffect(() => {
    const roller = rollerRef.current;
    if (!roller || data.rollerCount === 0) return;
    for (let i = 0; i < data.rollerCount; i++) {
      const l = data.rollerLine[i];
      const p = data.rollerPos[i];
      // tilt the cylinder so its axis lies across the belt, then yaw with the line
      DUMMY.rotation.set(Math.PI / 2, data.yaw[l], 0);
      DUMMY.position.set(
        data.originX[l] + data.dirX[l] * p,
        BELT_TOP - 0.2,
        data.originZ[l] + data.dirZ[l] * p
      );
      DUMMY.scale.set(0.18, BELT_WIDTH * 0.95, 0.18);
      DUMMY.updateMatrix();
      roller.setMatrixAt(i, DUMMY.matrix);
    }
    roller.instanceMatrix.needsUpdate = true;
    roller.computeBoundingSphere();
  }, [data]);

  // moving instances: bake rotation+scale once so the frame loop only has to
  // patch the translation columns of the instance matrices.
  useLayoutEffect(() => {
    const chevron = chevronRef.current;
    if (chevron && data.chevronLine.length > 0) {
      chevron.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < data.chevronLine.length; i++) {
        const l = data.chevronLine[i];
        DUMMY.rotation.set(0, data.yaw[l], 0);
        DUMMY.position.set(
          data.originX[l] + data.dirX[l] * data.chevronPos[i],
          BELT_TOP + 0.02,
          data.originZ[l] + data.dirZ[l] * data.chevronPos[i]
        );
        DUMMY.scale.set(0.85, 0.04, BELT_WIDTH * 0.6);
        DUMMY.updateMatrix();
        chevron.setMatrixAt(i, DUMMY.matrix);
      }
      chevron.instanceMatrix.needsUpdate = true;
    }

    const cargo = cargoRef.current;
    if (cargo && data.cargoLine.length > 0) {
      cargo.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let i = 0; i < data.cargoLine.length; i++) {
        const l = data.cargoLine[i];
        const size = 0.55 + hash01(i, 3) * 0.25;
        DUMMY.rotation.set(0, data.yaw[l], 0);
        DUMMY.position.set(
          data.originX[l] + data.dirX[l] * data.cargoPos[i],
          BELT_TOP + size / 2,
          data.originZ[l] + data.dirZ[l] * data.cargoPos[i]
        );
        DUMMY.scale.set(size, size, size);
        DUMMY.updateMatrix();
        cargo.setMatrixAt(i, DUMMY.matrix);
        // every 9th pallet is a "tracked" one, glowing cyan
        SCRATCH_COLOR.set(i % 9 === 0 ? ACCENT_CYAN : CARGO_TAN);
        cargo.setColorAt(i, SCRATCH_COLOR);
      }
      cargo.instanceMatrix.needsUpdate = true;
      if (cargo.instanceColor) cargo.instanceColor.needsUpdate = true;
    }
  }, [data]);

  useFrame((_, dtRaw) => {
    const dt = dtRaw > 0.1 ? 0.1 : dtRaw;

    // --- coarse per-line visibility gate, re-evaluated at ~5 Hz ---
    // one frustum test per conveyor line (not per instance), against a
    // bounding sphere computed once in buildConveyorData. Lines outside the
    // frustum have their rider matrix WRITES skipped below (see moveAcc
    // block) — the phase itself keeps advancing every frame regardless (a
    // cheap scalar add), so nothing pops or teleports when the line scrolls
    // back into view.
    cullAcc.current += dt;
    if (cullAcc.current >= CULL_INTERVAL) {
      cullAcc.current = 0;
      CULL_PROJ_MATRIX.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      CULL_FRUSTUM.setFromProjectionMatrix(CULL_PROJ_MATRIX);
      const camX = camera.position.x;
      const camY = camera.position.y;
      const camZ = camera.position.z;
      for (let l = 0; l < data.lineCount; l++) {
        const cx = data.lineCenterX[l];
        const cz = data.lineCenterZ[l];
        CULL_SPHERE.center.set(cx, BELT_TOP, cz);
        // dilated radius: see CULL_MARGIN_FACTOR for why (hysteresis against
        // fast pans between 0.2s checks).
        CULL_SPHERE.radius = data.lineRadius[l] * CULL_RADIUS_MULTIPLIER;
        if (!CULL_FRUSTUM.intersectsSphere(CULL_SPHERE)) {
          data.lineVisible[l] = 0;
          continue;
        }
        const dx = cx - camX;
        const dy = BELT_TOP - camY;
        const dz = cz - camZ;
        data.lineVisible[l] =
          dx * dx + dy * dy + dz * dz <= conveyorLodDistanceSq ? 1 : 0;
      }
    }

    // --- per-line target speed, re-aggregated at ~4 Hz ---
    refreshAcc.current += dt;
    if (refreshAcc.current >= SPEED_REFRESH) {
      refreshAcc.current = 0;
      const runtimes = simulation.snapshot().runtimes;
      for (let l = 0; l < data.lineCount; l++) {
        const ids = data.machineIds[l];
        let loadSum = 0;
        let running = 0;
        let n = 0;
        for (let k = 0; k < ids.length; k++) {
          const rt = runtimes.get(ids[k]);
          if (!rt) continue;
          loadSum += rt.load;
          if (rt.activity === "running") running += 1;
          n += 1;
        }
        if (n === 0) {
          data.target[l] = 0;
          continue;
        }
        const avgLoad = loadSum / n;
        const runRatio = running / n;
        data.target[l] = clamp(
          (0.25 + 2.6 * avgLoad) * (0.12 + 0.88 * runRatio),
          0,
          MAX_BELT_SPEED
        );
      }
    }

    // --- ease actual speed toward target ---
    const ease = dt * 1.8 > 1 ? 1 : dt * 1.8;
    for (let l = 0; l < data.lineCount; l++) {
      data.speed[l] += (data.target[l] - data.speed[l]) * ease;
    }

    // --- advance riders, patching translation in place ---
    // throttled to ~30Hz: accumulate dt and use the accumulated amount as the
    // effective step so speed stays identical, we just update less often.
    moveAcc.current += dt;
    const MOVE_STEP = 1 / 30;
    if (moveAcc.current >= MOVE_STEP) {
      const moveDt = moveAcc.current;
      moveAcc.current = 0;

      const chevron = chevronRef.current;
      if (chevron) {
        const arr = chevron.instanceMatrix.array as Float32Array;
        let wrote = false;
        for (let i = 0; i < data.chevronLine.length; i++) {
          const l = data.chevronLine[i];
          // phase always advances — cheap scalar — so a line that scrolls
          // back into view resumes at the correct position instead of
          // jumping back to where it was when it left the frustum.
          let p = data.chevronPos[i] + data.speed[l] * moveDt;
          const L = data.len[l];
          if (p >= L) p -= L;
          data.chevronPos[i] = p;
          if (!data.lineVisible[l]) continue; // skip only the matrix write
          const base = i * 16;
          arr[base + 12] = data.originX[l] + data.dirX[l] * p;
          arr[base + 14] = data.originZ[l] + data.dirZ[l] * p;
          wrote = true;
        }
        if (wrote) chevron.instanceMatrix.needsUpdate = true;
      }

      const cargo = cargoRef.current;
      if (cargo) {
        const arr = cargo.instanceMatrix.array as Float32Array;
        let wrote = false;
        for (let i = 0; i < data.cargoLine.length; i++) {
          const l = data.cargoLine[i];
          let p = data.cargoPos[i] + data.speed[l] * moveDt;
          const L = data.len[l];
          if (p >= L) p -= L;
          data.cargoPos[i] = p;
          if (!data.lineVisible[l]) continue; // skip only the matrix write
          const base = i * 16;
          arr[base + 12] = data.originX[l] + data.dirX[l] * p;
          arr[base + 14] = data.originZ[l] + data.dirZ[l] * p;
          wrote = true;
        }
        if (wrote) cargo.instanceMatrix.needsUpdate = true;
      }
    }
  });

  if (empty) return null;

  const railCount = data.lineCount * 2;
  const chevronCount = data.chevronLine.length;
  const cargoCount = data.cargoLine.length;

  return (
    <group>
      <instancedMesh
        key={`belt-${data.lineCount}`}
        ref={beltRef}
        args={[undefined, undefined, data.lineCount]}
        frustumCulled={false}
        raycast={() => null}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={BELT_COLOR} roughness={0.95} metalness={0.1} />
      </instancedMesh>

      <instancedMesh
        key={`rail-${railCount}`}
        ref={railRef}
        args={[undefined, undefined, railCount]}
        frustumCulled={false}
        raycast={() => null}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.45} metalness={0.7} />
      </instancedMesh>

      {data.rollerCount > 0 ? (
        <instancedMesh
          key={`roller-${data.rollerCount}`}
          ref={rollerRef}
          args={[undefined, undefined, data.rollerCount]}
          frustumCulled={false}
          raycast={() => null}
        >
          <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
          <meshStandardMaterial color={LIVE_FLOOR_THEME.roller} roughness={0.5} metalness={0.6} />
        </instancedMesh>
      ) : null}

      {chevronCount > 0 ? (
        <instancedMesh
          key={`chevron-${chevronCount}`}
          ref={chevronRef}
          args={[undefined, undefined, chevronCount]}
          frustumCulled={false}
          raycast={() => null}
        >
          <boxGeometry args={[1, 1, 1]} />
          {/* painted direction chevrons, not light strips: solid accent, opaque enough to read on a pale belt */}
          <meshStandardMaterial
            color={ACCENT_CYAN}
            roughness={0.55}
            metalness={0.1}
            transparent
            opacity={0.88}
          />
        </instancedMesh>
      ) : null}

      {cargoCount > 0 ? (
        <instancedMesh
          key={`cargo-${cargoCount}`}
          ref={cargoRef}
          args={[undefined, undefined, cargoCount]}
          frustumCulled={false}
          raycast={() => null}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={LIVE_FLOOR_THEME.neutral.white}
            roughness={0.85}
            metalness={0.12}
          />
        </instancedMesh>
      ) : null}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. FloorTraffic
// ---------------------------------------------------------------------------

export interface FloorTrafficProps {
  layout: FloorLayout;
  lite: boolean;
}

const AGV_COUNT = 18;
const AGV_COUNT_LITE = 6;
const WORKER_COUNT = 64;
const WORKER_COUNT_LITE = 20;
const TRUCK_COUNT = 14;
const TRUCK_COUNT_LITE = 5;

/** truck body dimensions (metres) */
const TRUCK_W = 2.5;
const CAB_LEN = 2.8;
const CAB_H = 2.7;
const TRAILER_LEN = 7.4;
const TRAILER_H = 3.0;
/** clearance kept at each end of a road so a whole rig stays on the plate */
const ROAD_END_MARGIN = 7;

interface TrafficLane {
  /** world position of the lane start */
  x: number;
  z: number;
  /** unit direction along the lane */
  dx: number;
  dz: number;
  /** travel length */
  len: number;
  /** half-width available for lateral offset / jitter */
  lateral: number;
  yaw: number;
  /** bounding-sphere centre/radius for the coarse visibility gate, computed
   *  once here so useFrame never has to re-derive geometry from x/z/dx/dz. */
  cx: number;
  cz: number;
  radius: number;
}

function buildLanes(
  aisles: FloorAisle[],
  main: boolean,
  margin: number,
  /** extra sphere padding beyond the lane footprint — covers the size of
   *  whatever rides the lane (AGV body, worker capsule) so the bounding
   *  sphere never clips something that's visually still on-lane. */
  extraRadius: number
): TrafficLane[] {
  const lanes: TrafficLane[] = [];
  const pool = aisles.filter((a) => a.main === main);
  const source = pool.length > 0 ? pool : aisles;
  for (const a of source) {
    const travel = a.horizontal ? a.width : a.depth;
    const across = a.horizontal ? a.depth : a.width;
    const len = travel - margin * 2;
    if (len <= 1) continue;
    const dx = a.horizontal ? 1 : 0;
    const dz = a.horizontal ? 0 : 1;
    const x = a.horizontal ? a.x - len / 2 : a.x;
    const z = a.horizontal ? a.z : a.z - len / 2;
    const lateral = Math.max(0, across / 2 - 0.7);
    lanes.push({
      x,
      z,
      dx,
      dz,
      len,
      lateral,
      yaw: yawFor(dx, dz),
      cx: x + dx * (len / 2),
      cz: z + dz * (len / 2),
      radius: len / 2 + lateral + extraRadius,
    });
  }
  return lanes;
}

/**
 * One driving lane per site road. `lateral` here is the keep-right offset from
 * the road centreline, so opposing trucks pass on their own side of the plate.
 */
function buildRoadLanes(roads: FloorRoad[]): TrafficLane[] {
  const lanes: TrafficLane[] = [];
  // rigs extend a full trailer length beyond their phase point, so the
  // sphere needs to swallow that plus the cab, not just the lane footprint.
  const extraRadius = CAB_LEN + TRAILER_LEN + 2;
  for (const r of roads) {
    if (r.width <= 0 || r.depth <= 0) continue;
    const travel = r.horizontal ? r.width : r.depth;
    const across = r.horizontal ? r.depth : r.width;
    const len = travel - ROAD_END_MARGIN * 2;
    if (len <= 4) continue;
    const dx = r.horizontal ? 1 : 0;
    const dz = r.horizontal ? 0 : 1;
    const x = r.horizontal ? r.x - len / 2 : r.x;
    const z = r.horizontal ? r.z : r.z - len / 2;
    const lateral = clamp(across / 4, 0, Math.max(0, across / 2 - TRUCK_W / 2 - 0.2));
    lanes.push({
      x,
      z,
      dx,
      dz,
      len,
      lateral,
      yaw: yawFor(dx, dz),
      cx: x + dx * (len / 2),
      cz: z + dz * (len / 2),
      radius: len / 2 + lateral + extraRadius,
    });
  }
  return lanes;
}

interface TrafficData {
  agvLanes: TrafficLane[];
  workerLanes: TrafficLane[];
  roadLanes: TrafficLane[];
  agvCount: number;
  workerCount: number;
  truckCount: number;
  agvPhase: Float32Array;
  workerPhase: Float32Array;
  truckPhase: Float32Array;
  /** per-lane visibility flags, mutated in place by the throttled gate. */
  agvLaneVisible: Uint8Array;
  workerLaneVisible: Uint8Array;
  roadLaneVisible: Uint8Array;
}

function buildTrafficData(layout: FloorLayout, lite: boolean): TrafficData {
  // AGV body is ~1.7m long, worker capsule ~0.5m — padding just needs to
  // cover that plus a little slack so the sphere never clips a visible rider.
  const agvLanes = buildLanes(layout.aisles, true, 1.6, 2.5);
  const workerLanes = buildLanes(layout.aisles, false, 1.0, 1.5);
  const roadLanes = buildRoadLanes(layout.roads ?? []);

  const agvCount = agvLanes.length === 0 ? 0 : lite ? AGV_COUNT_LITE : AGV_COUNT;
  const workerCount = workerLanes.length === 0 ? 0 : lite ? WORKER_COUNT_LITE : WORKER_COUNT;
  const truckCount = roadLanes.length === 0 ? 0 : lite ? TRUCK_COUNT_LITE : TRUCK_COUNT;

  const agvPhase = new Float32Array(agvCount);
  for (let i = 0; i < agvCount; i++) agvPhase[i] = hash01(i, 11) * 2;
  const workerPhase = new Float32Array(workerCount);
  for (let i = 0; i < workerCount; i++) workerPhase[i] = hash01(i, 23) * 2;
  const truckPhase = new Float32Array(truckCount);
  for (let i = 0; i < truckCount; i++) truckPhase[i] = hash01(i, 83) * 2;

  // default visible until the first throttled check runs, so nothing
  // is hidden before the gate has had a chance to evaluate it
  const agvLaneVisible = new Uint8Array(agvLanes.length).fill(1);
  const workerLaneVisible = new Uint8Array(workerLanes.length).fill(1);
  const roadLaneVisible = new Uint8Array(roadLanes.length).fill(1);

  return {
    agvLanes,
    workerLanes,
    roadLanes,
    agvCount,
    workerCount,
    truckCount,
    agvPhase,
    workerPhase,
    truckPhase,
    agvLaneVisible,
    workerLaneVisible,
    roadLaneVisible,
  };
}

/**
 * 0 while a rig drives out along its lane, 1 while it drives back, eased
 * smoothly through both turn windows (including the one across the phase wrap)
 * so the heading and the keep-right offset never snap.
 */
const TURN_WINDOW = 0.09;
function reverseBlend(phase: number): number {
  if (phase > 1 - TURN_WINDOW && phase < 1 + TURN_WINDOW) {
    return smooth((phase - 1 + TURN_WINDOW) / (2 * TURN_WINDOW));
  }
  const u = phase < TURN_WINDOW ? phase + 2 : phase;
  if (u > 2 - TURN_WINDOW) {
    return 1 - smooth((u - 2 + TURN_WINDOW) / (2 * TURN_WINDOW));
  }
  return phase < 1 ? 0 : 1;
}

/** Largest building by footprint (ties broken by id) — hosts the gantry crane. */
function pickCraneBuilding(buildings: FloorBuilding[]): FloorBuilding | null {
  let best: FloorBuilding | null = null;
  let bestArea = -1;
  for (const b of buildings) {
    if (b.width <= 0 || b.depth <= 0) continue;
    const area = b.width * b.depth;
    if (area > bestArea || (area === bestArea && best !== null && b.id < best.id)) {
      best = b;
      bestArea = area;
    }
  }
  return best;
}

export function FloorTraffic({ layout, lite }: FloorTrafficProps): ReactElement | null {
  const empty = isEmptyLayout(layout);
  const data = useMemo(() => buildTrafficData(layout, lite), [layout, lite]);

  const agvRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);
  const workerRef = useRef<THREE.InstancedMesh>(null);
  const helmetRef = useRef<THREE.InstancedMesh>(null);
  const cabRef = useRef<THREE.InstancedMesh>(null);
  const trailerRef = useRef<THREE.InstancedMesh>(null);
  const tailRef = useRef<THREE.InstancedMesh>(null);
  const bridgeRef = useRef<THREE.Mesh>(null);
  const trolleyRef = useRef<THREE.Mesh>(null);
  const cableRef = useRef<THREE.Mesh>(null);
  const hookRef = useRef<THREE.Mesh>(null);
  const clock = useRef(0);
  const trafficMoveAcc = useRef(0); // throttle AGV/worker/truck matrix updates to ~30Hz
  const trafficCullAcc = useRef(0); // throttle the coarse per-lane visibility gate to ~5Hz
  const { camera } = useThree();
  // Same distance-LOD companion as ConveyorSystem's conveyorLodDistanceSq —
  // see CONVEYOR_LOD_DISTANCE_FACTOR for the reasoning.
  const trafficLodDistanceSq = useMemo(() => {
    const d = layout.suggestedCameraDistance * CONVEYOR_LOD_DISTANCE_FACTOR;
    return d * d;
  }, [layout]);

  const crane = useMemo(() => {
    const b = pickCraneBuilding(layout.buildings ?? []);
    if (!b) return null;
    return {
      x: b.x,
      z: b.z,
      depth: b.depth,
      y: Math.max(3, b.wallHeight - 1.1),
      travelX: Math.max(1, b.width / 2 - 3),
      travelZ: Math.max(1, b.depth / 2 - 2),
    };
  }, [layout]);

  // Every instance in this component moves every frame, so hint the driver.
  useLayoutEffect(() => {
    for (const ref of [agvRef, lampRef, workerRef, helmetRef, cabRef, trailerRef, tailRef]) {
      const mesh = ref.current;
      if (mesh) mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  }, [data]);

  useFrame((_, dtRaw) => {
    const dt = dtRaw > 0.1 ? 0.1 : dtRaw;
    clock.current += dt;
    const t = clock.current;

    // --- coarse per-lane visibility gate, re-evaluated at ~5 Hz ---
    // one frustum test per lane/route (not per AGV/worker/truck instance),
    // against a bounding sphere computed once in buildTrafficData. Instances
    // on a lane outside the frustum have their matrix WRITE skipped below —
    // their phase keeps advancing every frame (cheap scalar), so re-entering
    // the frustum resumes motion instead of popping to a stale position.
    trafficCullAcc.current += dt;
    if (trafficCullAcc.current >= CULL_INTERVAL) {
      trafficCullAcc.current = 0;
      CULL_PROJ_MATRIX.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      CULL_FRUSTUM.setFromProjectionMatrix(CULL_PROJ_MATRIX);
      const camX = camera.position.x;
      const camY = camera.position.y;
      const camZ = camera.position.z;
      for (let i = 0; i < data.agvLanes.length; i++) {
        const lane = data.agvLanes[i];
        CULL_SPHERE.center.set(lane.cx, 0.5, lane.cz);
        // dilated radius: see CULL_MARGIN_FACTOR for why.
        CULL_SPHERE.radius = lane.radius * CULL_RADIUS_MULTIPLIER;
        if (!CULL_FRUSTUM.intersectsSphere(CULL_SPHERE)) {
          data.agvLaneVisible[i] = 0;
          continue;
        }
        const dx = lane.cx - camX;
        const dy = 0.5 - camY;
        const dz = lane.cz - camZ;
        data.agvLaneVisible[i] = dx * dx + dy * dy + dz * dz <= trafficLodDistanceSq ? 1 : 0;
      }
      for (let i = 0; i < data.workerLanes.length; i++) {
        const lane = data.workerLanes[i];
        CULL_SPHERE.center.set(lane.cx, 0.6, lane.cz);
        CULL_SPHERE.radius = lane.radius * CULL_RADIUS_MULTIPLIER;
        if (!CULL_FRUSTUM.intersectsSphere(CULL_SPHERE)) {
          data.workerLaneVisible[i] = 0;
          continue;
        }
        const dx = lane.cx - camX;
        const dy = 0.6 - camY;
        const dz = lane.cz - camZ;
        data.workerLaneVisible[i] = dx * dx + dy * dy + dz * dz <= trafficLodDistanceSq ? 1 : 0;
      }
      for (let i = 0; i < data.roadLanes.length; i++) {
        const lane = data.roadLanes[i];
        CULL_SPHERE.center.set(lane.cx, CAB_H / 2, lane.cz);
        CULL_SPHERE.radius = lane.radius * CULL_RADIUS_MULTIPLIER;
        if (!CULL_FRUSTUM.intersectsSphere(CULL_SPHERE)) {
          data.roadLaneVisible[i] = 0;
          continue;
        }
        const dx = lane.cx - camX;
        const dy = CAB_H / 2 - camY;
        const dz = lane.cz - camZ;
        data.roadLaneVisible[i] = dx * dx + dy * dy + dz * dz <= trafficLodDistanceSq ? 1 : 0;
      }
    }

    // --- AGVs / workers / trucks: throttled to ~30Hz. accumulate dt and use
    // the accumulated amount as the effective step so speed stays identical,
    // we just skip the (expensive) per-item matrix rebuild on skipped frames.
    trafficMoveAcc.current += dt;
    const TRAFFIC_MOVE_STEP = 1 / 30;
    if (trafficMoveAcc.current >= TRAFFIC_MOVE_STEP) {
      const dt = trafficMoveAcc.current;
      trafficMoveAcc.current = 0;

    // --- AGVs on the main arteries ---
    const agv = agvRef.current;
    const lamp = lampRef.current;
    if (agv && data.agvCount > 0 && data.agvLanes.length > 0) {
      let agvWrote = false;
      for (let i = 0; i < data.agvCount; i++) {
        const laneIdx = i % data.agvLanes.length;
        const lane = data.agvLanes[laneIdx];
        const speed = 2.4 + hash01(i, 31) * 2.2;
        let phase = data.agvPhase[i] + (dt * speed) / lane.len;
        if (phase >= 2) phase -= 2;
        data.agvPhase[i] = phase;
        if (!data.agvLaneVisible[laneIdx]) continue; // phase advanced; skip only the write

        const forward = phase < 1;
        const u = smooth(forward ? phase : 2 - phase);
        const along = u * lane.len;
        const side = (hash01(i, 41) * 2 - 1) * lane.lateral;
        const yaw = lane.yaw + (forward ? 0 : Math.PI);

        // lateral offset is perpendicular to travel
        const px = lane.x + lane.dx * along + (lane.dx === 0 ? side : 0);
        const pz = lane.z + lane.dz * along + (lane.dx === 0 ? 0 : side);

        DUMMY.rotation.set(0, yaw, 0);
        DUMMY.position.set(px, 0.2, pz);
        DUMMY.scale.set(1.7, 0.34, 1.05);
        DUMMY.updateMatrix();
        agv.setMatrixAt(i, DUMMY.matrix);

        if (lamp) {
          DUMMY.position.set(px + Math.cos(yaw) * 0.9, 0.3, pz - Math.sin(yaw) * 0.9);
          DUMMY.scale.set(0.16, 0.14, 0.7);
          DUMMY.updateMatrix();
          lamp.setMatrixAt(i, DUMMY.matrix);
        }
        agvWrote = true;
      }
      if (agvWrote) {
        agv.instanceMatrix.needsUpdate = true;
        if (lamp) lamp.instanceMatrix.needsUpdate = true;
      }
    }

    // --- workers on the walkways ---
    const worker = workerRef.current;
    const helmet = helmetRef.current;
    if (worker && data.workerCount > 0 && data.workerLanes.length > 0) {
      let workerWrote = false;
      for (let i = 0; i < data.workerCount; i++) {
        const laneIdx = i % data.workerLanes.length;
        const lane = data.workerLanes[laneIdx];
        const baseSpeed = 0.9 + hash01(i, 53) * 0.7;
        // deterministic pauses: a slow sine per worker gates its motion
        const gate = Math.sin(t * 0.55 + hash01(i, 67) * 6.283);
        const speed = gate > 0.86 ? 0 : baseSpeed;
        let phase = data.workerPhase[i] + (dt * speed) / lane.len;
        if (phase >= 2) phase -= 2;
        data.workerPhase[i] = phase;
        if (!data.workerLaneVisible[laneIdx]) continue; // phase advanced; skip only the write

        const forward = phase < 1;
        const u = smooth(forward ? phase : 2 - phase);
        const along = u * lane.len;
        const side = (hash01(i, 71) * 2 - 1) * lane.lateral;
        const yaw = lane.yaw + (forward ? 0 : Math.PI);

        const px = lane.x + lane.dx * along + (lane.dx === 0 ? side : 0);
        const pz = lane.z + lane.dz * along + (lane.dx === 0 ? 0 : side);
        const bob = speed > 0 ? Math.sin(t * 6 + i) * 0.03 : 0;

        DUMMY.rotation.set(0, yaw, 0);
        DUMMY.position.set(px, 0.44 + bob, pz);
        DUMMY.scale.set(1, 1, 1);
        DUMMY.updateMatrix();
        worker.setMatrixAt(i, DUMMY.matrix);

        if (helmet) {
          DUMMY.position.set(px, 0.85 + bob, pz);
          DUMMY.scale.set(1, 1, 1);
          DUMMY.updateMatrix();
          helmet.setMatrixAt(i, DUMMY.matrix);
        }
        workerWrote = true;
      }
      if (workerWrote) {
        worker.instanceMatrix.needsUpdate = true;
        if (helmet) helmet.instanceMatrix.needsUpdate = true;
      }
    }

    // --- delivery trucks on the site roads ---
    const cab = cabRef.current;
    const trailer = trailerRef.current;
    const tail = tailRef.current;
    if (cab && data.truckCount > 0 && data.roadLanes.length > 0) {
      let truckWrote = false;
      for (let i = 0; i < data.truckCount; i++) {
        const laneIdx = i % data.roadLanes.length;
        const lane = data.roadLanes[laneIdx];
        const cruise = 1.1 + hash01(i, 131) * 0.9;
        const prev = data.truckPhase[i];
        // ~40% of the rigs are "docking" ones: they hold at the far end of the
        // road (where the docks and yards sit) whenever their slow gate is up,
        // so the site reads as loading rather than an endless shuttle.
        const docking = hash01(i, 97) < 0.4;
        const atEnd = prev > 0.965 && prev < 1.035;
        const holding =
          docking && atEnd && Math.sin(t * 0.12 + hash01(i, 103) * 6.283) > 0;
        const speed = holding ? 0 : cruise;

        let phase = prev + (dt * speed) / lane.len;
        if (phase >= 2) phase -= 2;
        data.truckPhase[i] = phase;
        if (!data.roadLaneVisible[laneIdx]) continue; // phase advanced; skip only the write

        const forward = phase < 1;
        const u = smooth(forward ? phase : 2 - phase);
        const along = u * lane.len;
        const k = reverseBlend(phase);
        const yaw = lane.yaw + k * Math.PI;
        const side = lane.lateral * (1 - 2 * k);
        const px = lane.x + lane.dx * along + (lane.dx === 0 ? side : 0);
        const pz = lane.z + lane.dz * along + (lane.dx === 0 ? 0 : side);
        const hx = Math.cos(yaw);
        const hz = -Math.sin(yaw);

        DUMMY.rotation.set(0, yaw, 0);
        DUMMY.position.set(px, CAB_H / 2, pz);
        DUMMY.scale.set(CAB_LEN, CAB_H, TRUCK_W);
        DUMMY.updateMatrix();
        cab.setMatrixAt(i, DUMMY.matrix);

        if (trailer) {
          const back = CAB_LEN / 2 + TRAILER_LEN / 2 + 0.3;
          DUMMY.position.set(px - hx * back, TRAILER_H / 2 + 0.3, pz - hz * back);
          DUMMY.scale.set(TRAILER_LEN, TRAILER_H, TRUCK_W * 1.02);
          DUMMY.updateMatrix();
          trailer.setMatrixAt(i, DUMMY.matrix);
        }
        if (tail) {
          const back = CAB_LEN / 2 + TRAILER_LEN + 0.42;
          DUMMY.position.set(px - hx * back, 0.95, pz - hz * back);
          DUMMY.scale.set(0.16, 0.3, TRUCK_W * 0.82);
          DUMMY.updateMatrix();
          tail.setMatrixAt(i, DUMMY.matrix);
        }
        truckWrote = true;
      }
      if (truckWrote) {
        cab.instanceMatrix.needsUpdate = true;
        if (trailer) trailer.instanceMatrix.needsUpdate = true;
        if (tail) tail.instanceMatrix.needsUpdate = true;
      }
    }
    } // end throttled AGV/worker/truck block

    // เครนถูกตรึงให้อยู่นิ่งกับที่ตามคำขอ จึงไม่มีการอัปเดตตำแหน่งเครนต่อเฟรมอีกต่อไป
    // (ตั้งค่าตำแหน่งเริ่มต้นครั้งเดียวใน useLayoutEffect ด้านล่างแทน)
  });

  if (empty) return null;

  return (
    <group>
      {data.agvCount > 0 ? (
        <>
          <instancedMesh
            key={`agv-${data.agvCount}`}
            ref={agvRef}
            args={[undefined, undefined, data.agvCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={AGV_BODY} roughness={0.55} metalness={0.5} />
          </instancedMesh>
          <instancedMesh
            key={`lamp-${data.agvCount}`}
            ref={lampRef}
            args={[undefined, undefined, data.agvCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <boxGeometry args={[1, 1, 1]} />
            {/*
              AGV warning lamp — one of the few genuinely self-luminous parts,
              so it keeps a *small* emissive lift. At 2.2 it clipped to a flat
              white blob in daylight; 0.4 leaves a saturated lens that still
              looks switched on.
            */}
            <meshStandardMaterial
              color={ACCENT_CYAN}
              emissive={ACCENT_CYAN}
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.1}
            />
          </instancedMesh>
        </>
      ) : null}

      {data.workerCount > 0 ? (
        <>
          <instancedMesh
            key={`worker-${data.workerCount}`}
            ref={workerRef}
            args={[undefined, undefined, data.workerCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <capsuleGeometry args={[0.17, 0.5, 3, 8]} />
            <meshStandardMaterial color={WORKER_BODY} roughness={0.8} metalness={0.1} />
          </instancedMesh>
          <instancedMesh
            key={`helmet-${data.workerCount}`}
            ref={helmetRef}
            args={[undefined, undefined, data.workerCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <sphereGeometry args={[0.15, 8, 6]} />
            {/* amber hard hat: saturated diffuse reads better in daylight than a glow */}
            <meshStandardMaterial color={HAZARD_AMBER} roughness={0.6} metalness={0.1} />
          </instancedMesh>
        </>
      ) : null}

      {data.truckCount > 0 ? (
        <>
          <instancedMesh
            key={`cab-${data.truckCount}`}
            ref={cabRef}
            args={[undefined, undefined, data.truckCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={TRUCK_BODY} roughness={0.55} metalness={0.45} />
          </instancedMesh>
          <instancedMesh
            key={`trailer-${data.truckCount}`}
            ref={trailerRef}
            args={[undefined, undefined, data.truckCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={TRUCK_TRAILER} roughness={0.7} metalness={0.25} />
          </instancedMesh>
          <instancedMesh
            key={`tail-${data.truckCount}`}
            ref={tailRef}
            args={[undefined, undefined, data.truckCount]}
            frustumCulled={false}
            raycast={() => null}
          >
            <boxGeometry args={[1, 1, 1]} />
            {/* tail light: genuinely self-luminous, but 2.0 clipped to white — 0.55 keeps it red */}
            <meshStandardMaterial
              color={SITE.truckLight}
              emissive={SITE.truckLight}
              emissiveIntensity={0.55}
              roughness={0.35}
              metalness={0.1}
            />
          </instancedMesh>
        </>
      ) : null}

      {/* overhead gantry crane over the largest building */}
      {crane ? (
        <>
          <mesh ref={bridgeRef} position={[crane.x, crane.y, crane.z]} raycast={() => null}>
            <boxGeometry args={[0.7, 0.55, crane.depth * 0.96]} />
            <meshStandardMaterial color={STEEL_MID} roughness={0.45} metalness={0.7} />
          </mesh>
          <mesh
            ref={trolleyRef}
            position={[crane.x, crane.y - 0.2, crane.z]}
            raycast={() => null}
          >
            <boxGeometry args={[1.1, 0.5, 1.1]} />
            <meshStandardMaterial color={HAZARD_AMBER} roughness={0.5} metalness={0.4} />
          </mesh>
          {lite ? null : (
            <>
              <mesh
                ref={cableRef}
                position={[crane.x, crane.y - 2, crane.z]}
                raycast={() => null}
              >
                <boxGeometry args={[0.07, 1, 0.07]} />
                <meshStandardMaterial
                  color={LIVE_FLOOR_THEME.machineSteel}
                  roughness={0.4}
                  metalness={0.8}
                />
              </mesh>
              <mesh
                ref={hookRef}
                position={[crane.x, crane.y - 3, crane.z]}
                raycast={() => null}
              >
                <boxGeometry args={[0.45, 0.35, 0.45]} />
                <meshStandardMaterial color={ACCENT_CYAN} roughness={0.35} metalness={0.8} />
              </mesh>
            </>
          )}
        </>
      ) : null}
    </group>
  );
}
