/**
 * plantSite.ts — typed TS data module derived from Model_3D/dist/nt-layout.js
 * ---------------------------------------------------------------------------
 * Source: NITTAN (Thailand) NT-26-04-1 "LAYOUT GREEN AREA FLOOR PLAN", scale
 * 1:500 — traced from the DWG (PDF-underlay geometry) and converted to
 * metres. This is static traced survey data, so it is inlined below as a
 * typed const rather than fetched or parsed at runtime.
 *
 * `machines[]` from the original nt-layout.js (19 demo entries) is
 * intentionally NOT reproduced here — real machines come from the database
 * via another module (see plantLayout.ts / floorLayout.ts), and the demo
 * entries would only be a source of confusion if left lying around.
 *
 * COORDINATE CONVENTION — read this before touching any number below
 * ---------------------------------------------------------------------------
 * The source DWG trace mixes two shapes:
 *   - `zones[]` was already pre-computed to CENTRE + EXTENT scene coordinates
 *     ({x, z, w, d}, x/z already relative to the hall's own centre) by a
 *     `zone()` helper baked into the original nt-layout.js;
 *   - everything else (`rooms[]`, `site.buildings`, `site.sheds`,
 *     `site.parking`, `site.grass`) was left as raw PLAN-SPACE corners
 *     ({x0, x1, y0, y1}, metres from the hall's SW corner, plan Y increasing
 *     north), and the remaining `site.*` point features (`walkways`,
 *     `flowerBeds`, `tankFarms`, `trees`, `poles`, `fences`, `roads`,
 *     `lineBays`) were left as raw plan-space CENTRE points ({x, y}).
 *
 * This module normalises ALL of the above into exactly ONE shape: CENTRE +
 * EXTENT in THREE.js SCENE space — `{ x, z, w, d }` (or just `{ x, z }` for
 * point features), computed with the same transform the original zone()
 * helper used:
 *
 *   sceneX = planX - hall.w / 2         (scene X is plan X, hall-centred)
 *   sceneZ = hall.d / 2 - planY         (plan Y axis BECOMES scene Z, and is
 *                                         flipped: plan north, +Y, is -Z)
 *
 * Every exported rect/point below is already in this normalised scene space,
 * hall-centred on the origin, base on y = 0 (y itself is not part of this
 * plan — callers place it). `PLANT_SITE.hall` gives the reference hall size
 * ({w, d, h, bay}) this data was traced at; use `scaleSiteTo()` to remap the
 * whole plan proportionally onto a different hall footprint (the DB-driven
 * layout computes its own hall dimensions, which will not exactly match this
 * reference survey).
 */

// ---------------------------------------------------------------------------
// Raw traced data (plan space, metres, as measured off the 1:500 drawing).
// Kept close to the original nt-layout.js shapes so this file can be diffed
// against a re-trace of the DWG.
// ---------------------------------------------------------------------------

/** Reference hall footprint this survey was traced against. */
const REF_HALL = { w: 94.3, d: 74.3, h: 10.5, bay: 8.5 } as const;

interface RawZone {
  id: string;
  name: string;
  kind: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const RAW_ZONES: RawZone[] = [
  { id: "WH", name: "Warehouse / Racking", kind: "racks", x0: 7.9, x1: 23.6, y0: 58.6, y1: 71.5 },
  { id: "FRG-A", name: "Forging 14–18", kind: "forging", x0: 36.5, x1: 55.7, y0: 56.7, y1: 71.5 },
  { id: "FRG-B", name: "Forging 10–13", kind: "forging", x0: 76.1, x1: 94.3, y0: 56.7, y1: 71.5 },
  { id: "HT-1", name: "Heat Treatment 1", kind: "heat", x0: 12.6, x1: 26.2, y0: 36.3, y1: 55.1 },
  { id: "HT-2", name: "Heat Treatment 2", kind: "heat", x0: 36.4, x1: 55.7, y0: 36.3, y1: 55.1 },
  { id: "HT-3", name: "Heat Treatment 3", kind: "heat", x0: 57.1, x1: 71.2, y0: 36.3, y1: 55.1 },
  { id: "HT-4", name: "Heat Treatment 4", kind: "heat", x0: 75.9, x1: 94.3, y0: 36.3, y1: 55.1 },
  { id: "LINES", name: "Production Line 1–16", kind: "lines", x0: 17.2, x1: 94.3, y0: 7.7, y1: 35.3 },
];

interface RawLineBay {
  id: string;
  cx: number;
}

const RAW_LINE_BAYS: RawLineBay[] = [
  { id: "LINE 1-2", cx: 21.2 },
  { id: "LINE 3-4", cx: 29.9 },
  { id: "LINE 5-6", cx: 40.8 },
  { id: "LINE 7-8", cx: 50.3 },
  { id: "LINE 09-10", cx: 61.5 },
  { id: "LINE 11-12", cx: 70.4 },
  { id: "LINE 13-14", cx: 79.2 },
  { id: "LINE 15-16", cx: 88.0 },
];

const RAW_LINE_BAND = { y0: 7.7, y1: 35.3, bayW: 8.0 } as const;

interface RawRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface RawRoom extends RawRect {
  name: string;
}

const RAW_ROOMS: RawRoom[] = [
  { name: "INFIRMARY", x0: 0.1, x1: 8.0, y0: 0.4, y1: 6.6 },
  { name: "INTERNET RM", x0: 8.0, x1: 15.7, y0: 0.4, y1: 6.6 },
  { name: "ISONITE", x0: 20.5, x1: 33.5, y0: 0.4, y1: 6.6 },
  { name: "STORE S/P", x0: 38.4, x1: 55.7, y0: 0.4, y1: 6.6 },
  { name: "CHEM", x0: 56.0, x1: 59.9, y0: 0.4, y1: 6.6 },
  { name: "QC LAB", x0: 60.2, x1: 67.7, y0: 0.4, y1: 6.6 },
  { name: "C.LB", x0: 68.0, x1: 71.0, y0: 0.4, y1: 3.4 },
  { name: "QC", x0: 74.2, x1: 82.0, y0: 0.4, y1: 6.6 },
  { name: "PD", x0: 82.5, x1: 94.2, y0: 0.4, y1: 6.6 },
  { name: "M. RELAXATION", x0: 95.4, x1: 108.0, y0: 24.0, y1: 32.0 },
  { name: "M. TOILET", x0: 95.4, x1: 108.0, y0: 19.5, y1: 23.5 },
  { name: "W. TOILET", x0: 95.4, x1: 108.0, y0: 15.5, y1: 19.0 },
  { name: "W. RELAXATION", x0: 95.4, x1: 108.0, y0: 11.5, y1: 15.0 },
  { name: "NCR", x0: 95.4, x1: 101.0, y0: 8.0, y1: 11.0 },
  { name: "FLUORESCENT", x0: 101.5, x1: 108.0, y0: 8.0, y1: 11.0 },
  { name: "OFFICE MT", x0: 95.0, x1: 107.5, y0: 70.0, y1: 78.0 },
  { name: "SHOP MT", x0: 95.0, x1: 107.5, y0: 61.0, y1: 69.0 },
  { name: "SCRAP RM.", x0: 95.0, x1: 107.5, y0: 53.0, y1: 60.0 },
  { name: "SCRAP YARD", x0: 95.0, x1: 107.5, y0: 45.0, y1: 52.0 },
  { name: "HR STORE", x0: 95.0, x1: 107.5, y0: 40.0, y1: 44.0 },
  { name: "TC STORE", x0: 95.0, x1: 107.5, y0: 35.0, y1: 39.0 },
];

interface RawBuilding extends RawRect {
  name: string;
  h: number;
  floors: number;
  roofStyle?: "flat" | "pitched";
  /** Which axes this feature is genuinely traced WALL-ADJACENT on — i.e. its
   *  real-world position is "N metres from the nearest hall wall on this
   *  axis", so `anchorAxis` should preserve that clearance as the hall grows.
   *  `undefined` AND `[]` both mean "both axes anchored" (the default,
   *  correct for anything traced square-on next to a wall) — an empty array
   *  is treated the same as omitting the field entirely, not as "anchor
   *  neither axis". Set to a single axis (e.g. `["z"]`) for a feature traced
   *  DIAGONALLY offset from the hall, where only one axis has a real wall
   *  clearance and the other axis's reference-hall coordinate is coincidental
   *  (see `TRAINING / ENGINEERING` below for why this matters). */
  wallAxes?: ReadonlyArray<"x" | "z">;
}

const RAW_BUILDINGS: RawBuilding[] = [
  { name: "TRAINING CENTER", x0: -32.9, x1: -16.7, y0: 54.4, y1: 74.4, h: 7.6, floors: 2, roofStyle: "pitched" },
  { name: "OFFICE / STORE F/G", x0: -4.7, x1: 38.1, y0: -54.0, y1: -21.5, h: 9.6, floors: 2, roofStyle: "pitched" },
  // Traced DIAGONALLY south-east of the reference hall, not square-on to any
  // one wall: at REF_HALL scale its scene X (45.6) sits only 1.6 m short of
  // the hall's own X half-extent (47.15) — that is NOT a real "1.6 m
  // clearance from the east wall", it's just where a 56.3 m-wide building
  // traced far to the south happens to land in X. Its Z clearance (28.5 m,
  // comfortably bigger than its own 7 m half-depth) IS real: this building is
  // genuinely wall-adjacent only on Z. Anchoring X too (the old behaviour)
  // reapplied that coincidental ~0 clearance against the hall's OWN growing
  // X wall, so at runtime scale (hall ~325 m wide) it got pinned to within
  // ~1.6 m of the east wall — 29.7 m of its width landing inside the hall's
  // X span. `wallAxes: ["z"]` anchors Z only and leaves X at its traced
  // reference-scale value (fixed, never re-projected onto the growing wall).
  {
    name: "TRAINING / ENGINEERING",
    x0: 64.6,
    x1: 120.9,
    y0: -35.5,
    y1: -21.5,
    h: 8.0,
    floors: 2,
    roofStyle: "pitched",
    wallAxes: ["z"],
  },
  { name: "GUARD HOUSE", x0: -36.7, x1: -32.6, y0: -37.7, y1: -32.3, h: 3.4, floors: 1, roofStyle: "pitched" },
  { name: "WATER PUMP", x0: 3.9, x1: 14.0, y0: -69.1, y1: -61.5, h: 4.2, floors: 1 },
  { name: "MOB.", x0: 15.0, x1: 26.7, y0: -69.1, y1: -61.5, h: 4.2, floors: 1 },
];

interface RawWalkway {
  x: number;
  y: number;
  len: number;
  dir: "x" | "y";
  name: string;
}

const RAW_WALKWAYS: RawWalkway[] = [
  { x: -8.0, y: -16.0, len: 44, dir: "x", name: "hall -> office" },
  { x: 16.0, y: -19.0, len: 26, dir: "y", name: "road -> office" },
  { x: -14.0, y: 50.0, len: 30, dir: "y", name: "hall -> training" },
  { x: -24.0, y: 44.0, len: 22, dir: "x", name: "training -> car park" },
  { x: 50.0, y: -18.0, len: 34, dir: "x", name: "office -> engineering" },
  { x: 100.0, y: 30.0, len: 22, dir: "y", name: "hall -> east annex" },
];

interface RawFlowerBed {
  x: number;
  y: number;
  w: number;
  d: number;
}

const RAW_FLOWER_BEDS: RawFlowerBed[] = [
  { x: -12.0, y: 70.0, w: 8, d: 3 },
  { x: -12.0, y: 60.0, w: 8, d: 3 },
  { x: -40.0, y: 52.0, w: 10, d: 3.2 },
  { x: 16.0, y: -17.0, w: 14, d: 3 },
  { x: 16.0, y: -58.0, w: 14, d: 3 },
  { x: -56.0, y: 8.0, w: 3.2, d: 22 },
  { x: -56.0, y: -16.0, w: 3.2, d: 16 },
  { x: 44.0, y: -44.0, w: 12, d: 4 },
  { x: -30.0, y: -30.0, w: 9, d: 3 },
  { x: 60.0, y: 82.0, w: 12, d: 3 },
];

interface RawShed extends RawRect {
  name: string;
  h: number;
}

const RAW_SHEDS: RawShed[] = [
  { name: "INVERTER", x0: 17.0, x1: 26.0, y0: 85.0, y1: 92.0, h: 3.8 },
  { name: "MOB.", x0: 28.0, x1: 35.0, y0: 85.0, y1: 92.0, h: 3.8 },
  { name: "AIR COMP", x0: 37.0, x1: 52.0, y0: 85.0, y1: 93.0, h: 4.6 },
  { name: "TR", x0: 56.0, x1: 63.0, y0: 85.0, y1: 92.0, h: 4.0 },
  { name: "MOB.", x0: 64.5, x1: 71.0, y0: 85.0, y1: 92.0, h: 3.8 },
  { name: "AIR COMP", x0: 72.5, x1: 81.0, y0: 85.0, y1: 92.5, h: 4.6 },
  { name: "WATER PUMP", x0: 82.5, x1: 92.0, y0: 85.0, y1: 92.5, h: 4.2 },
  { name: "PACKING", x0: 112.0, x1: 121.0, y0: 85.0, y1: 93.0, h: 4.4 },
  { name: "OIL ROOM", x0: 122.0, x1: 129.0, y0: 85.0, y1: 93.0, h: 4.0 },
];

interface RawTankFarm {
  name: string;
  x: number;
  y: number;
  n: number;
  r: number;
  h: number;
}

const RAW_TANK_FARMS: RawTankFarm[] = [
  { name: "C2H2", x: 96.5, y: 89.0, n: 3, r: 0.55, h: 3.2 },
  { name: "N2", x: 103.0, y: 89.0, n: 2, r: 0.9, h: 4.6 },
  { name: "O2", x: 108.5, y: 89.0, n: 2, r: 0.9, h: 4.6 },
];

interface RawParking extends RawRect {
  name: string;
  rows: number;
  moto?: boolean;
}

const RAW_PARKING: RawParking[] = [
  { name: "CAR PARK A", x0: -35.0, x1: -20.0, y0: 2.0, y1: 64.0, rows: 2 },
  // x1 nudged from -5.0 to -7.0 (2 m narrower, real fixed size — see
  // scaleParkingRect, this stays untouched by scaleSiteTo): at runtime scale
  // the untouched traced rect clipped 1 m into "RC.ROAD west" over a 62 m
  // run (x -167.5 vs road's -168.5). Trimming from the east edge only keeps
  // the west edge fixed, so the pre-existing 1 m gap to CAR PARK A is
  // unaffected — final gaps: 1.0 m clear of the road, 1.0 m clear of A.
  { name: "CAR PARK B", x0: -19.0, x1: -7.0, y0: 2.0, y1: 64.0, rows: 2 },
  { name: "MOTORCYCLE", x0: -45.9, x1: -36.5, y0: 0.0, y1: 42.5, rows: 1, moto: true },
];

interface RawRoad {
  x: number;
  y: number;
  len: number;
  w: number;
  dir: "x" | "y";
  name: string;
}

const RAW_ROADS: RawRoad[] = [
  { x: 20.0, y: 80.0, len: 130, w: 8, dir: "x", name: "RC.ROAD north" },
  { x: 20.0, y: -13.0, len: 150, w: 9, dir: "x", name: "RC.ROAD south" },
  { x: -2.0, y: 25.0, len: 100, w: 8, dir: "y", name: "RC.ROAD west" },
  { x: 101.0, y: 20.0, len: 60, w: 8, dir: "y", name: "RC.ROAD east" },
  { x: -40.0, y: -40.0, len: 70, w: 9, dir: "x", name: "MAIN GATE road" },
];

const RAW_GRASS: RawRect[] = [
  { x0: -16.0, x1: -6.0, y0: 66.0, y1: 76.0 },
  { x0: 40.0, x1: 60.0, y0: -56.0, y1: -46.0 },
  { x0: -60.0, x1: -48.0, y0: -20.0, y1: 20.0 },
];

const RAW_TREES: Array<[number, number]> = [
  [-13, 70], [-9, 72], [-13, 62], [-9, 58], [44, -50], [50, -52], [56, -48],
  [-54, -10], [-54, 0], [-54, 10], [-54, -20], [-50, 15], [-2, 78], [30, 78], [70, 78],
];

const RAW_POLES: Array<[number, number]> = [
  [-38, 20], [-38, 50], [-2, -16], [40, -16], [80, -16], [100, 50], [100, 10], [-6, 80], [60, 80],
];

interface RawFence {
  x: number;
  y: number;
  len: number;
  dir: "x" | "y";
}

const RAW_FENCES: RawFence[] = [{ x: 20, y: 100, len: 150, dir: "x" }];

// ---------------------------------------------------------------------------
// Normalised (scene-space, centre + extent) public types
// ---------------------------------------------------------------------------

/** Centre + extent, in three.js scene space (metres), hall-centred, y not included. */
export interface PlantRect {
  x: number;
  z: number;
  w: number;
  d: number;
}

/** A single point in scene space (metres), hall-centred. */
export interface PlantPoint {
  x: number;
  z: number;
}

export interface PlantHall {
  w: number;
  d: number;
  h: number;
  bay: number;
}

export interface PlantZone extends PlantRect {
  id: string;
  name: string;
  kind: string;
}

export interface PlantLineBay extends PlantPoint {
  id: string;
}

export interface PlantLineBand {
  /** production-line band extent along scene Z (converted from plan y0/y1). */
  z0: number;
  z1: number;
  bayW: number;
}

export interface PlantRoom extends PlantRect {
  name: string;
}

export interface PlantBuilding extends PlantRect {
  name: string;
  h: number;
  floors: number;
  roofStyle?: "flat" | "pitched";
  /** See `RawBuilding.wallAxes` — carried through so `scaleSiteTo` knows
   *  which axes to anchor vs. leave at their fixed reference position. */
  wallAxes?: ReadonlyArray<"x" | "z">;
}

export interface PlantWalkway extends PlantPoint {
  len: number;
  dir: "x" | "y";
  name: string;
}

export interface PlantFlowerBed extends PlantRect {}

export interface PlantShed extends PlantRect {
  name: string;
  h: number;
}

export interface PlantTankFarm extends PlantPoint {
  name: string;
  n: number;
  r: number;
  h: number;
}

export interface PlantParking extends PlantRect {
  name: string;
  rows: number;
  moto?: boolean;
}

export interface PlantRoad extends PlantPoint {
  len: number;
  w: number;
  dir: "x" | "y";
  name: string;
}

export type PlantGrassPatch = PlantRect;

export interface PlantFence extends PlantPoint {
  len: number;
  dir: "x" | "y";
}

export interface PlantSite {
  meta: {
    plant: string;
    drawing: string;
    title: string;
    scale: string;
    units: string;
  };
  /** the reference hall footprint this whole plan was traced at */
  hall: PlantHall;
  zones: PlantZone[];
  lineBays: PlantLineBay[];
  lineBand: PlantLineBand;
  rooms: PlantRoom[];
  buildings: PlantBuilding[];
  walkways: PlantWalkway[];
  flowerBeds: PlantFlowerBed[];
  sheds: PlantShed[];
  tankFarms: PlantTankFarm[];
  parking: PlantParking[];
  roads: PlantRoad[];
  grass: PlantGrassPatch[];
  trees: PlantPoint[];
  poles: PlantPoint[];
  fences: PlantFence[];
}

// ---------------------------------------------------------------------------
// Plan-space -> scene-space transform (see "COORDINATE CONVENTION" above)
// ---------------------------------------------------------------------------

function planToScene(hall: PlantHall, planX: number, planY: number): PlantPoint {
  return { x: planX - hall.w / 2, z: hall.d / 2 - planY };
}

function rectToScene(hall: PlantHall, r: RawRect): PlantRect {
  const a = planToScene(hall, r.x0, r.y0);
  const b = planToScene(hall, r.x1, r.y1);
  return {
    x: (a.x + b.x) / 2,
    z: (a.z + b.z) / 2,
    w: Math.abs(r.x1 - r.x0),
    d: Math.abs(r.y1 - r.y0),
  };
}

/** Builds the fully-normalised PlantSite from the raw traced data, against `hall`. */
function buildPlantSite(hall: PlantHall): PlantSite {
  const zones: PlantZone[] = RAW_ZONES.map((z) => ({
    id: z.id,
    name: z.name,
    kind: z.kind,
    ...rectToScene(hall, z),
  }));

  const lineBays: PlantLineBay[] = RAW_LINE_BAYS.map((b) => ({
    id: b.id,
    ...planToScene(hall, b.cx, 0),
    // lineBays only carry an X centreline in the source data; z is meaningless
    // here and left at the transform's z-intercept (z=0 plan row) on purpose.
  }));

  const bandA = planToScene(hall, 0, RAW_LINE_BAND.y0);
  const bandB = planToScene(hall, 0, RAW_LINE_BAND.y1);
  const lineBand: PlantLineBand = {
    z0: Math.min(bandA.z, bandB.z),
    z1: Math.max(bandA.z, bandB.z),
    bayW: RAW_LINE_BAND.bayW,
  };

  const rooms: PlantRoom[] = RAW_ROOMS.map((r) => ({ name: r.name, ...rectToScene(hall, r) }));

  const buildings: PlantBuilding[] = RAW_BUILDINGS.map((b) => ({
    name: b.name,
    h: b.h,
    floors: b.floors,
    roofStyle: b.roofStyle,
    wallAxes: b.wallAxes,
    ...rectToScene(hall, b),
  }));

  const walkways: PlantWalkway[] = RAW_WALKWAYS.map((w) => ({
    name: w.name,
    len: w.len,
    dir: w.dir,
    ...planToScene(hall, w.x, w.y),
  }));

  const flowerBeds: PlantFlowerBed[] = RAW_FLOWER_BEDS.map((f) => ({
    w: f.w,
    d: f.d,
    ...planToScene(hall, f.x, f.y),
  }));

  const sheds: PlantShed[] = RAW_SHEDS.map((s) => ({ name: s.name, h: s.h, ...rectToScene(hall, s) }));

  const tankFarms: PlantTankFarm[] = RAW_TANK_FARMS.map((t) => ({
    name: t.name,
    n: t.n,
    r: t.r,
    h: t.h,
    ...planToScene(hall, t.x, t.y),
  }));

  const parking: PlantParking[] = RAW_PARKING.map((p) => ({
    name: p.name,
    rows: p.rows,
    moto: p.moto,
    ...rectToScene(hall, p),
  }));

  const roads: PlantRoad[] = RAW_ROADS.map((r) => ({
    name: r.name,
    len: r.len,
    w: r.w,
    dir: r.dir,
    ...planToScene(hall, r.x, r.y),
  }));

  const grass: PlantGrassPatch[] = RAW_GRASS.map((g) => rectToScene(hall, g));

  const trees: PlantPoint[] = RAW_TREES.map(([x, y]) => planToScene(hall, x, y));
  const poles: PlantPoint[] = RAW_POLES.map(([x, y]) => planToScene(hall, x, y));

  const fences: PlantFence[] = RAW_FENCES.map((f) => ({
    len: f.len,
    dir: f.dir,
    ...planToScene(hall, f.x, f.y),
  }));

  return {
    meta: {
      plant: "NITTAN (Thailand) Co.,Ltd.",
      drawing: "NT-26-04-1",
      title: "Layout Overall Floor Plan",
      scale: "1:500",
      units: "m",
    },
    hall,
    zones,
    lineBays,
    lineBand,
    rooms,
    buildings,
    walkways,
    flowerBeds,
    sheds,
    tankFarms,
    parking,
    roads,
    grass,
    trees,
    poles,
    fences,
  };
}

/**
 * The traced NT plan, normalised to scene space at its OWN reference hall
 * size (94.3 x 74.3 x 10.5 m). Use this directly when placing geometry
 * against that exact hall footprint; use `scaleSiteTo()` when the caller's
 * hall does not match this reference (the common case — the DB-driven
 * layout computes its own hall dimensions from the machines actually on
 * record).
 */
export const PLANT_SITE: PlantSite = buildPlantSite(REF_HALL);

/**
 * Proportionally remaps the traced NT plan onto a different hall footprint —
 * but ONLY for things that are genuinely part of the site's overall
 * envelope (positions, and spans that legitimately grow with the site: hall
 * extents, zone rectangle extents, the line band, road/walkway/fence
 * LENGTHS). Real-world fixed dimensions never scale here, no matter how
 * much bigger `target` is than the reference hall:
 *
 *   - `hall.bay` (the 8.5 m structural column pitch) — a bigger hall gets
 *     MORE bays of the same true spacing, never a wider one. This function
 *     always returns the reference `bay` value unchanged.
 *   - `hall.h` — unscaled unless `target.h` is explicitly given (unchanged
 *     behaviour from before).
 *   - `rooms[].w/d` — an infirmary or a QC lab is the size it is regardless
 *     of how big the factory around it gets. Room CENTRES still move with
 *     the proportional site scaling (so they stay against the growing
 *     hall's actual wall), only their real size is preserved.
 *   - `buildings[].w/d/h`, `sheds[].w/d/h`, `tankFarms[].r/h` — same
 *     reasoning: the training centre, the engineering block, a utility
 *     shed, a gas tank are real, fixed-size structures.
 *   - `flowerBeds[].w/d` — a planter doesn't grow either.
 *   - `roads[].w` — real paved width; only `len` (the road reaching further
 *     across a bigger site) is a genuine envelope span and scales.
 *
 * Positions (`x`/`z` on every feature) and the genuinely-envelope spans
 * (`zones[].w/d`, `lineBand`, `walkways[].len`, `fences[].len`,
 * `roads[].len`) still scale proportionally — but `walkways[].len`,
 * `roads[].len` and `fences[].len` are then clamped (`clampSpanToGround`) so
 * a scaled span can never run past the ground slab `PlantShell.tsx` actually
 * draws (`SITE_GROUND_MARGIN`); only the overshooting end is trimmed; the
 * feature's anchored centre only shifts if trimming requires it.
 * `grass[].w/d` is NOT proportional (see `grass:` below) — like `parking`,
 * it is anchored position + real fixed size.
 *
 * `parking[].w/d` are BOTH kept at their real, fixed traced size (position
 * wall-anchored, same as `rooms`/`buildings`/`sheds`/`tankFarms`) — this used
 * to stretch `d` proportionally on the theory that a bigger site should get
 * MORE stalls at real size rather than bigger stalls, but at a hall ~25x the
 * reference floor area that turned a 42.5 m MOTORCYCLE row into an
 * unbroken 306 m strip that swallowed the MAIN GATE road ~40 m away in the
 * original survey (they were never meant to be anywhere near each other).
 * A real parking lot doesn't grow with the plant either, so it now behaves
 * like every other discrete traced fixture: anchored in place, real size
 * kept as traced (fewer/more visible bay lines is just what a fixed-size lot
 * looks like at a different hall size, not a bug).
 *
 * X is scaled by `target.w / referenceHall.w`, Z by `target.d / referenceHall.d`
 * independently — the plan is not forced to a single uniform scale, since a
 * DB-driven hall's aspect ratio need not match the surveyed one.
 *
 * The returned site keeps the exact same shape as `PLANT_SITE`, just
 * re-centred on `target`'s own hall size; `hall` in the result is replaced
 * with the caller's target hall (except `bay`, which never changes).
 */
/** Preserves a feature's REAL (unscaled) clearance from whichever reference
 *  hall wall it sits nearest to on this axis (the wall on the same side as
 *  `refCenter`'s own sign), rather than proportionally scaling its distance
 *  from hall CENTRE.
 *
 *  Plain proportional position scaling (`refCenter * scale`) only keeps a
 *  real-world feature "in the right place relative to the hall" when the
 *  hall grows by uniformly stretching the WHOLE reference envelope from its
 *  centre — a feature's distance from the (also-moving) wall scales by the
 *  same factor as its distance from hall centre, so the two stay in sync.
 *  Once the hall's size is instead derived from each zone's own real content
 *  (this revision — see LAYOUT-PLAN.md §3), that coupling breaks: a service
 *  room can end up stranded deep inside a zone's packed content instead of
 *  against the actual wall, and an outdoor building/road/shed/tank/parking
 *  lot traced a real ~20-40 m from the hall can end up hundreds of metres
 *  away — "nothing floating inside the hall or stranded far from it" is the
 *  requirement this function exists to satisfy, for every outdoor feature,
 *  not just rooms. */
function anchorAxis(refCenter: number, refHalfExtent: number, targetHalfExtent: number): number {
  const sign = refCenter >= 0 ? 1 : -1;
  const realClearance = refCenter - sign * refHalfExtent; // negative when refCenter sits inside the reference hall
  return sign * targetHalfExtent + realClearance;
}

/** Anchors both axes of a rect's position (size untouched) against the
 *  reference hall's own half-extents. */
function anchorRectPosition<T extends PlantRect>(r: T, target: { w: number; d: number }): T {
  const ref = REF_HALL;
  return { ...r, x: anchorAxis(r.x, ref.w / 2, target.w / 2), z: anchorAxis(r.z, ref.d / 2, target.d / 2) };
}

/** Same as `anchorRectPosition`, but only anchors the axes listed in
 *  `wallAxes` — any axis NOT listed keeps its raw reference-scale coordinate
 *  exactly as traced, instead of being re-projected onto the target hall's
 *  (possibly much bigger) wall. `wallAxes` being `undefined` OR `[]` both
 *  mean "anchor both axes" (same as `anchorRectPosition`) — an empty array
 *  is never treated as "anchor neither axis". Use a single-axis `wallAxes`
 *  for a feature traced diagonally offset from the hall, where only one axis
 *  is a real wall clearance (see `RawBuilding.wallAxes`). */
function anchorRectPositionAxes<T extends PlantRect & { wallAxes?: ReadonlyArray<"x" | "z"> }>(
  r: T,
  target: { w: number; d: number },
): T {
  const ref = REF_HALL;
  const axes = r.wallAxes?.length ? r.wallAxes : ["x", "z"];
  return {
    ...r,
    x: axes.includes("x") ? anchorAxis(r.x, ref.w / 2, target.w / 2) : r.x,
    z: axes.includes("z") ? anchorAxis(r.z, ref.d / 2, target.d / 2) : r.z,
  };
}

/** Anchors both axes of a point feature's position against the reference
 *  hall's own half-extents. */
function anchorPoint<T extends PlantPoint>(p: T, target: { w: number; d: number }): T {
  const ref = REF_HALL;
  return { ...p, x: anchorAxis(p.x, ref.w / 2, target.w / 2), z: anchorAxis(p.z, ref.d / 2, target.d / 2) };
}

/**
 * Multiplier `PlantShell.tsx` uses for the base grass ground slab
 * (`siteW = hall.w * SITE_GROUND_MARGIN`, likewise for `d`) — the single
 * source of truth for "how far past the hall the ground actually extends",
 * shared here so `scaleSiteTo` can clamp any line feature (`roads`,
 * `walkways`, `fences`) whose scaled length would otherwise run past the
 * edge of that slab and hang in empty space. Keep this in sync with
 * `PlantShell.tsx`'s `siteW`/`siteD` — it imports this constant rather than
 * repeating the `1.9` literal.
 */
export const SITE_GROUND_MARGIN = 1.9;

/**
 * Shrinks a centred line span (`center` ± `len/2` along one scene axis) so
 * both ends stay within `[-groundHalf, groundHalf]`, trimming only the
 * end(s) that actually overshoot — the in-bounds end (if any) keeps its
 * exact original position, so a road that only oversteps on one side (the
 * common case here: the anchored centre sits well inside the ground, only
 * the far end runs off) loses just the floating tail instead of being
 * symmetrically shortened from both ends around its centre.
 */
function clampSpanToGround(center: number, len: number, groundHalf: number): { center: number; len: number } {
  const end1 = Math.min(center + len / 2, groundHalf);
  const end2 = Math.max(center - len / 2, -groundHalf);
  if (end2 >= end1) return { center, len: 0 };
  return { center: (end1 + end2) / 2, len: end1 - end2 };
}

export function scaleSiteTo(target: { w: number; d: number; h?: number }): PlantSite {
  const ref = REF_HALL;
  const sx = target.w / ref.w;
  const sz = target.d / ref.d;
  const groundHalfX = (target.w * SITE_GROUND_MARGIN) / 2;
  const groundHalfZ = (target.d * SITE_GROUND_MARGIN) / 2;

  /** Position AND size scale — the only genuinely-proportional envelope
   *  rectangle left: `grass` (deliberately proportional, see below; zones
   *  are recomputed entirely by `plantLayout.ts` and this mapping's zone
   *  output is discarded). */
  const scaleRect = <T extends PlantRect>(r: T): T => ({
    ...r,
    x: r.x * sx,
    z: r.z * sz,
    w: r.w * sx,
    d: r.d * sz,
  });
  /** Real, fixed-size structures: position is WALL-ANCHORED (see
   *  `anchorAxis`), size is left exactly as traced. */
  const anchorRectPositionOnly = <T extends PlantRect>(r: T): T => anchorRectPosition(r, target);
  /** Buildings only: honours a per-building `wallAxes` override (see
   *  `RawBuilding.wallAxes`) instead of always anchoring both axes. */
  const anchorBuildingPosition = (b: PlantBuilding): PlantBuilding => anchorRectPositionAxes(b, target);
  const anchorPointPosition = <T extends PlantPoint>(p: T): T => anchorPoint(p, target);
  /** Parking: same treatment as buildings/sheds/tankFarms — position
   *  wall-anchored, `w`/`d` both kept at their real, fixed traced size (was
   *  proportionally stretching `d`, which at a hall ~25x the reference floor
   *  area turned MOTORCYCLE's 42.5 m row into an unbroken 306 m strip that
   *  swallowed the MAIN GATE road ~40 m away in the original survey — see
   *  the doc block above this function). */
  const scaleParkingRect = <T extends PlantRect>(r: T): T => anchorRectPosition(r, target);

  const hall: PlantHall = {
    w: target.w,
    d: target.d,
    h: target.h ?? ref.h,
    // Structural bay pitch is real, fixed geometry — never stretched. A
    // bigger hall simply has more of these (hall.w / hall.bay bays), not
    // wider ones.
    bay: ref.bay,
  };

  return {
    meta: PLANT_SITE.meta,
    hall,
    // `zones` here is discarded/overwritten entirely by `plantLayout.ts`
    // (which computes its own content-driven arrangement) — this mapping is
    // only ever used transiently before that overwrite.
    zones: PLANT_SITE.zones.map(scaleRect),
    // Cosmetic-only (`plantLayout.ts` repositions every bay's `x` after
    // packing) — plain proportional is fine here, never read before that.
    lineBays: PLANT_SITE.lineBays.map((b) => ({ ...b, x: b.x * sx, z: b.z * sz })),
    lineBand: {
      z0: PLANT_SITE.lineBand.z0 * sz,
      z1: PLANT_SITE.lineBand.z1 * sz,
      bayW: PLANT_SITE.lineBand.bayW,
    },
    rooms: PLANT_SITE.rooms.map(anchorRectPositionOnly),
    buildings: PLANT_SITE.buildings.map(anchorBuildingPosition),
    walkways: PLANT_SITE.walkways.map((w) => {
      const anchored = anchorPointPosition(w);
      const isX = w.dir === "x";
      const scaledLen = w.len * (isX ? sx : sz);
      const span = clampSpanToGround(isX ? anchored.x : anchored.z, scaledLen, isX ? groundHalfX : groundHalfZ);
      return { ...anchored, [isX ? "x" : "z"]: span.center, len: span.len } as PlantWalkway;
    }),
    flowerBeds: PLANT_SITE.flowerBeds.map(anchorRectPositionOnly),
    sheds: PLANT_SITE.sheds.map(anchorRectPositionOnly),
    tankFarms: PLANT_SITE.tankFarms.map(anchorPointPosition),
    parking: PLANT_SITE.parking.map(scaleParkingRect),
    roads: PLANT_SITE.roads.map((r) => {
      const anchored = anchorPointPosition(r);
      const isX = r.dir === "x";
      const scaledLen = r.len * (isX ? sx : sz);
      const span = clampSpanToGround(isX ? anchored.x : anchored.z, scaledLen, isX ? groundHalfX : groundHalfZ);
      return { ...anchored, [isX ? "x" : "z"]: span.center, len: span.len } as PlantRoad;
    }),
    // Real, fixed-size ground cover (a lawn/garden patch), same treatment as
    // `rooms`/`buildings`/`sheds`/`parking`: position wall-anchored, size left
    // exactly as traced. Used to be fully proportional (`scaleRect`) on the
    // theory that a bigger plant plausibly has more open lawn — but that
    // stretches BOTH axes independently (X by `sx`, Z by `sz`), and at a hall
    // this anisotropic (`sx` ~3.45, `sz` ~7.2 for the real ~325x535 m hall)
    // that turns a 10x10 m / 20x10 m / 12x40 m patch into wildly distorted
    // rectangles whose anchored-adjacent corner can end up far outside the
    // ground slab (`PlantShell.tsx`'s `siteW`/`siteD`) — reading on screen as
    // a green rectangle floating off the plot. A patch of grass doesn't grow
    // with the plant any more than a parking lot does.
    grass: PLANT_SITE.grass.map(anchorRectPositionOnly),
    trees: PLANT_SITE.trees.map(anchorPointPosition),
    poles: PLANT_SITE.poles.map(anchorPointPosition),
    fences: PLANT_SITE.fences.map((f) => {
      const anchored = anchorPointPosition(f);
      const isX = f.dir === "x";
      const scaledLen = f.len * (isX ? sx : sz);
      const span = clampSpanToGround(isX ? anchored.x : anchored.z, scaledLen, isX ? groundHalfX : groundHalfZ);
      return { ...anchored, [isX ? "x" : "z"]: span.center, len: span.len } as PlantFence;
    }),
  };
}
