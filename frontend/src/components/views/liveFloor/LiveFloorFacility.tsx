import {
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
} from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
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
  metalness = 0.35,
  roughness = 0.7,
  opacity = 1,
  doubleSided = false,
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
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
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

interface ShellBatches {
  slab: Batch;
  /** per-instance floor tint, one hex string per `slab` instance */
  slabColor: string[];
  wall: Batch;
  trim: Batch;
  truss: Batch;
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

  return { slab, slabColor, wall, trim, truss, zoneDecal, zoneDecalColor };
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
}

const RACK_SHELVES = 3;
const OFFICE_WINDOWS = 2;
const GATE_SLATS = 5;
const YARD_CRATES = 3;
const YARD_KERBS = 4;
const TREE_FOLIAGE = 2;
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

export function FacilityShell({ layout, lite }: FacilityShellProps): ReactElement | null {
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
      <StaticLayer
        count={shell.wall.count}
        source={shell}
        color={WALL_GLASS}
        roughness={0.32}
        metalness={0.28}
        opacity={0.52}
        doubleSided
        write={(i) => applyBatch(shell.wall, i)}
      />
      {/* cap band + grounding skirt, one mesh: solid accent, no glow */}
      <StaticLayer
        count={shell.trim.count}
        source={shell}
        color={ACCENT_CYAN}
        roughness={0.5}
        metalness={0.3}
        write={(i) => applyBatch(shell.trim, i)}
      />
      <StaticLayer
        count={shell.truss.count}
        source={shell}
        color={STRUCTURE_COLOR}
        roughness={0.6}
        metalness={0.55}
        write={(i) => applyBatch(shell.truss, i)}
      />

      <RooftopSigns buildings={buildings} />

      {/* painted in-hall floor markings */}
      <AislePlates aisles={mainAisles} main />
      <AislePlates aisles={walkAisles} main={false} />
      <AisleStripes spec={stripes} />

      {/* --- racks: dark steel frame + shelf slabs --- */}
      <PropLayer
        items={byKind.rack}
        color={STRUCTURE_COLOR}
        metalness={0.6}
        roughness={0.55}
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
        metalness={0.5}
        roughness={0.6}
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
        metalness={0.45}
        roughness={0.5}
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
        metalness={0.7}
        roughness={0.35}
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
        metalness={0.65}
        roughness={0.5}
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
        metalness={0.7}
        roughness={0.45}
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
        metalness={0.45}
        roughness={0.4}
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
        for (let i = 0; i < data.chevronLine.length; i++) {
          const l = data.chevronLine[i];
          let p = data.chevronPos[i] + data.speed[l] * moveDt;
          const L = data.len[l];
          if (p >= L) p -= L;
          data.chevronPos[i] = p;
          const base = i * 16;
          arr[base + 12] = data.originX[l] + data.dirX[l] * p;
          arr[base + 14] = data.originZ[l] + data.dirZ[l] * p;
        }
        if (data.chevronLine.length > 0) chevron.instanceMatrix.needsUpdate = true;
      }

      const cargo = cargoRef.current;
      if (cargo) {
        const arr = cargo.instanceMatrix.array as Float32Array;
        for (let i = 0; i < data.cargoLine.length; i++) {
          const l = data.cargoLine[i];
          let p = data.cargoPos[i] + data.speed[l] * moveDt;
          const L = data.len[l];
          if (p >= L) p -= L;
          data.cargoPos[i] = p;
          const base = i * 16;
          arr[base + 12] = data.originX[l] + data.dirX[l] * p;
          arr[base + 14] = data.originZ[l] + data.dirZ[l] * p;
        }
        if (data.cargoLine.length > 0) cargo.instanceMatrix.needsUpdate = true;
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
}

function buildLanes(aisles: FloorAisle[], main: boolean, margin: number): TrafficLane[] {
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
    lanes.push({
      x: a.horizontal ? a.x - len / 2 : a.x,
      z: a.horizontal ? a.z : a.z - len / 2,
      dx,
      dz,
      len,
      lateral: Math.max(0, across / 2 - 0.7),
      yaw: yawFor(dx, dz),
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
  for (const r of roads) {
    if (r.width <= 0 || r.depth <= 0) continue;
    const travel = r.horizontal ? r.width : r.depth;
    const across = r.horizontal ? r.depth : r.width;
    const len = travel - ROAD_END_MARGIN * 2;
    if (len <= 4) continue;
    const dx = r.horizontal ? 1 : 0;
    const dz = r.horizontal ? 0 : 1;
    lanes.push({
      x: r.horizontal ? r.x - len / 2 : r.x,
      z: r.horizontal ? r.z : r.z - len / 2,
      dx,
      dz,
      len,
      lateral: clamp(across / 4, 0, Math.max(0, across / 2 - TRUCK_W / 2 - 0.2)),
      yaw: yawFor(dx, dz),
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
}

function buildTrafficData(layout: FloorLayout, lite: boolean): TrafficData {
  const agvLanes = buildLanes(layout.aisles, true, 1.6);
  const workerLanes = buildLanes(layout.aisles, false, 1.0);
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
      for (let i = 0; i < data.agvCount; i++) {
        const lane = data.agvLanes[i % data.agvLanes.length];
        const speed = 2.4 + hash01(i, 31) * 2.2;
        let phase = data.agvPhase[i] + (dt * speed) / lane.len;
        if (phase >= 2) phase -= 2;
        data.agvPhase[i] = phase;

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
      }
      agv.instanceMatrix.needsUpdate = true;
      if (lamp) lamp.instanceMatrix.needsUpdate = true;
    }

    // --- workers on the walkways ---
    const worker = workerRef.current;
    const helmet = helmetRef.current;
    if (worker && data.workerCount > 0 && data.workerLanes.length > 0) {
      for (let i = 0; i < data.workerCount; i++) {
        const lane = data.workerLanes[i % data.workerLanes.length];
        const baseSpeed = 0.9 + hash01(i, 53) * 0.7;
        // deterministic pauses: a slow sine per worker gates its motion
        const gate = Math.sin(t * 0.55 + hash01(i, 67) * 6.283);
        const speed = gate > 0.86 ? 0 : baseSpeed;
        let phase = data.workerPhase[i] + (dt * speed) / lane.len;
        if (phase >= 2) phase -= 2;
        data.workerPhase[i] = phase;

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
      }
      worker.instanceMatrix.needsUpdate = true;
      if (helmet) helmet.instanceMatrix.needsUpdate = true;
    }

    // --- delivery trucks on the site roads ---
    const cab = cabRef.current;
    const trailer = trailerRef.current;
    const tail = tailRef.current;
    if (cab && data.truckCount > 0 && data.roadLanes.length > 0) {
      for (let i = 0; i < data.truckCount; i++) {
        const lane = data.roadLanes[i % data.roadLanes.length];
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
      }
      cab.instanceMatrix.needsUpdate = true;
      if (trailer) trailer.instanceMatrix.needsUpdate = true;
      if (tail) tail.instanceMatrix.needsUpdate = true;
    }
    } // end throttled AGV/worker/truck block

    // --- overhead gantry crane, bound to the largest building ---
    const bridge = bridgeRef.current;
    if (bridge && crane) {
      const bx = crane.x + Math.sin(t * 0.06) * crane.travelX;
      bridge.position.x = bx;
      const trolley = trolleyRef.current;
      if (trolley) {
        const tz = crane.z + Math.sin(t * 0.13) * crane.travelZ;
        trolley.position.x = bx;
        trolley.position.z = tz;
        const cable = cableRef.current;
        const hook = hookRef.current;
        if (cable && hook) {
          const drop = 1.5 + (Math.sin(t * 0.29) * 0.5 + 0.5) * (crane.y - 2.6);
          cable.position.set(bx, crane.y - 0.35 - drop / 2, tz);
          cable.scale.y = drop;
          hook.position.set(bx, crane.y - 0.35 - drop, tz);
        }
      }
    }
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
