import type { Machine } from "../types";
import { archetypeFor, isRenderableMachine, statusToKitStatus, type Archetype, type KitStatus } from "./plantArchetypes";
import { PLANT_SITE, scaleSiteTo, type PlantSite } from "./plantSite";

/**
 * Deterministic 3D-plant layout builder — REVISION 3.
 *
 * Earlier revisions invented a section-packed floor plan from scratch (see
 * git history / the old LAYOUT-PLAN.md). That approach is discarded. This
 * revision instead makes the output BE the real traced NITTAN plant plan
 * (`Model_3D/dist/nt-layout.js` -> `frontend/src/lib/plantSite.ts`),
 * enlarged just enough that the 931 renderable DB machines genuinely fit at
 * their real footprint sizes, with the whole surrounding site (rooms,
 * outdoor buildings, roads, parking, tank farms, trees, ...) carried through
 * unchanged in shape, only scaled.
 *
 * See Model_3D/LAYOUT-PLAN.md for the full design writeup (scale-factor
 * derivation, section -> zone-kind mapping, verification methodology).
 *
 * Pure & deterministic: no `Math.random()`, no `Date.now()`, no dependency
 * on input array order — every grouping/ordering key is a stable DB field
 * (`section`, `departmentCode`, `code`, `id`).
 */

export const LAYOUT_VERSION = "5.0.0";

// ---------------------------------------------------------------------------
// Real per-archetype footprint / height (metres), read directly out of
// `Model_3D/dist/plant-machines.js` (`group.userData.footprint`) — machines
// are NEVER scaled; only the surrounding plan grows to fit them.
// ---------------------------------------------------------------------------

const FOOTPRINT: Record<Archetype, [number, number]> = {
  furnace: [7.4, 5.0],
  mixer: [7.0, 6.4],
  coater: [9.6, 3.6],
  oven: [9.4, 6.2],
  press: [5.6, 6.4],
  robot: [6.4, 6.6],
  cell: [6.2, 5.0],
  filler: [7.2, 4.2],
  charger: [9.0, 7.4],
  packer: [7.6, 4.6],
};

const HEIGHT: Record<Archetype, number> = {
  furnace: 7.6,
  mixer: 6.4,
  coater: 4.6,
  oven: 6.6,
  press: 7.3,
  robot: 2.6,
  cell: 5.7,
  filler: 5.8,
  charger: 3.6,
  packer: 4.2,
};

// ---------------------------------------------------------------------------
// Tunable spacing constants (metres)
// ---------------------------------------------------------------------------

/** Gap left between two machines' real footprints along the flow direction. */
const MACHINE_PITCH_GAP = 1.75;
/** Gap between two parallel rows within the same packed block. */
const ROW_GAP = 2;
/** Gap between two successive department lines stacked in the same block/bay. */
const LINE_GAP = 3;
/** Gap between the 2 physical lanes that share one named line bay (e.g. the
 *  "1" and "2" lanes inside "LINE 1-2"). */
/** Wider aisle marking a shelf-row wrap inside the LINES zone packer (i.e.
 *  crossing from one visual row of department lines into the next) — bigger
 *  than `LINE_GAP` so that boundary reads as crossing into a new area, not
 *  just another line on the same row. */
const BAY_AISLE = 6;
/** Real service gap between two adjacent zone rectangles sitting in the same
 *  row of the hall's own content-driven arrangement (e.g. `WH` next to
 *  `FRG-A`). */
const ZONE_GAP = 8;
/** Real internal aisle/corridor between the hall's 3 major zone rows (the
 *  `WH`/`FRG-A`/`FRG-B` row, the `HT-1..4` row, and the `LINES` row) — wider
 *  than `ZONE_GAP` since it separates whole functional areas, not two
 *  buildings sharing a row. */
const ZONE_ROW_AISLE = 12;
/** Real clearance kept between the arranged zone content's outer edge and
 *  the hall's own perimeter wall — generous enough that the traced service
 *  rooms sitting flush against that wall (real depth ~6 m, see
 *  `plantSite.ts`'s `RAW_ROOMS`) land inside this margin, never inside a
 *  zone's packed machine content. */
const HALL_PERIMETER = 15;
/** Wall-clearance margin kept between a populated zone's real, packed
 *  content and that zone's own (content-fitted) rectangle edge. */
const ZONE_MARGIN = 3;
/** The reference plan's true structural column pitch (metres) — see
 *  Model_3D/LAYOUT-PLAN.md "Absolute vs proportional". A bigger hall gets
 *  MORE of these, never a wider one; `plantSite.ts#scaleSiteTo` already
 *  keeps `hall.bay` fixed at this value, this constant is only used here to
 *  report how many bays the final hall spans. */
const STRUCTURAL_BAY = 8.5;

const ROW_CAPACITY_MIN = 3;
const ROW_CAPACITY_MAX = 16;

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface PlacedMachineUserData {
  machineId: string;
  code: string | null;
  section: string | null;
  department: string | null;
  category: string | null;
  dbStatus: Machine["status"];
}

export interface PlacedMachine {
  id: string;
  type: Archetype;
  x: number;
  z: number;
  /** Rotation around Y, in degrees (matches plant-machines.js `place()`, `degrees:true`). */
  rot: number;
  rotationY: number;
  width: number;
  depth: number;
  height: number;
  /** The plan zone id this machine was placed in (WH / HT-1.. / LINES / ...). */
  zoneId: string;
  /** The department_code production line this machine belongs to. */
  lineId: string;
  status: KitStatus;
  /** ALWAYS the DB `code` (falls back to `id` only if `code` is null) — never invented. */
  label: string;
  /** ALWAYS the DB `name` — never invented. */
  sub: string;
  userData: PlacedMachineUserData;
  machine: Machine;
}

export interface ConveyorSegment {
  x: number;
  z: number;
  rot: number;
  len: number;
  width: number;
  parts: number;
}

export interface LineInfo {
  id: string;
  section: string;
  zoneId: string;
  machineIds: string[];
  /** Bounding box of this line's machines, scene space. */
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export interface SkippedMachine {
  machineId: string;
  code: string | null;
  name: string;
  reason: string;
}

export interface ScaleReport {
  /** Final uniform scale factor applied to the reference NT plan's overall
   *  envelope (zone/hall extents only — never the structural bay pitch,
   *  room/building/shed/tank/road-width real dimensions, which stay fixed). */
  factor: number;
  referenceHall: { w: number; d: number };
  hall: { w: number; d: number };
  /** The scale each driver alone would have required — the largest one wins. */
  drivers: {
    area: number;
    racks: number;
    heat: number;
    lines: number;
  };
  /** Structural column count spanning the final hall at the fixed 8.5 m
   *  pitch (informational — the pitch itself never changes, only this count). */
  structuralBays: { x: number; z: number; pitch: number };
  /** Which of the 8 in-hall zones ended up holding at least one machine. */
  populatedZones: string[];
  emptyZones: string[];
}

export interface PlantLayout {
  unit: "m";
  degrees: true;
  machines: PlacedMachine[];
  conveyors: ConveyorSegment[];
  hall: { w: number; d: number; h: number };
  /** The fully scaled reference site — zones, rooms, lineBays, buildings,
   *  roads, parking, tank farms, trees, poles, fences, everything the scene
   *  needs to draw the whole reference plan, not just machine positions. */
  site: PlantSite;
  lines: LineInfo[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  skipped: SkippedMachine[];
  scale: ScaleReport;
}

// ---------------------------------------------------------------------------
// Grouping helpers
// ---------------------------------------------------------------------------

const UNSPECIFIED = "UNSPECIFIED";

function sectionKey(m: Machine): string {
  return m.section && m.section.trim() ? m.section.trim() : UNSPECIFIED;
}

function deptKey(m: Machine): string {
  return m.departmentCode && m.departmentCode.trim() ? m.departmentCode.trim() : `${sectionKey(m)}::${UNSPECIFIED}`;
}

function byCodeThenId(a: Machine, b: Machine): number {
  const ac = a.code ?? "";
  const bc = b.code ?? "";
  if (ac !== bc) return ac < bc ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

interface Entry {
  machine: Machine;
  archetype: Archetype;
}

/** Which reference plan zone-kind a DB `section` belongs on.
 *
 *  - "HT" is the only section literally named for heat treatment -> the
 *    plan's HT-1..4 zones ('heat').
 *  - "TOOLING" and "PACKING" read as storage/staging, not a production
 *    line -> the plan's warehouse/racking zone ('racks', id "WH").
 *  - Every other section (18 of the 21 — the bulk of the plant, G1, MCB,
 *    HUB, CR, WP, SB, KWD, BWD, NB, TP, SNAPRING, YMQ, WT, SR, UT, KWDL,
 *    "ALL FACTORY", and unspecified) is a genuine production line/cell and
 *    maps onto the plan's "Production Line 1-16" zone and its 8 line bays
 *    ('lines') — exactly the zone kind that already dominates the reference
 *    plan's floor area.
 *  - No DB section maps to 'forging': the real dataset has no forging-named
 *    section. FRG-A/FRG-B stay in the exported site (so the scene still
 *    draws them, matching the real building), just with zero machines
 *    placed inside — reported explicitly, not silently dropped.
 */
function zoneKindForSection(section: string): "heat" | "racks" | "lines" {
  const s = section.trim().toUpperCase();
  if (s === "HT") return "heat";
  if (s === "TOOLING" || s === "PACKING") return "racks";
  return "lines";
}

/** Picks a per-line row capacity that keeps a line's block of parallel rows
 *  roughly square, given its machines' average real footprint. */
function computeRowCapacity(entries: Entry[]): number {
  if (entries.length <= 1) return 1;
  const avgPitchX = entries.reduce((s, e) => s + FOOTPRINT[e.archetype][0] + MACHINE_PITCH_GAP, 0) / entries.length;
  const avgPitchZ = entries.reduce((s, e) => s + FOOTPRINT[e.archetype][1] + ROW_GAP, 0) / entries.length;
  const cols = Math.round(Math.sqrt((entries.length * avgPitchZ) / avgPitchX));
  return Math.min(entries.length, Math.max(ROW_CAPACITY_MIN, Math.min(ROW_CAPACITY_MAX, cols)));
}

interface RowBuild {
  machines: Entry[];
  width: number;
  depth: number;
}

function buildRows(entries: Entry[], capacity: number): RowBuild[] {
  const rows: RowBuild[] = [];
  for (let i = 0; i < entries.length; i += capacity) {
    const chunk = entries.slice(i, i + capacity);
    const width = chunk.reduce((sum, e) => sum + FOOTPRINT[e.archetype][0] + MACHINE_PITCH_GAP, 0) - MACHINE_PITCH_GAP;
    const depth = Math.max(...chunk.map((e) => FOOTPRINT[e.archetype][1]));
    rows.push({ machines: chunk, width, depth });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// "Stacked block" packer — used for the 'racks' and 'heat' zone kinds: a
// handful of department lines, each wrapped into square-ish parallel rows
// (flow along +X, rot=0), the lines themselves stacked along Z. Returns the
// content's own bounding box plus every machine/conveyor placement, all in
// LOCAL coordinates centred on the block's own centre (0,0) — the caller
// offsets by the destination zone's real centre.
// ---------------------------------------------------------------------------

interface LocalPlacement {
  entry: Entry;
  x: number;
  z: number;
  rot: number;
  lineId: string;
  section: string;
}

interface LocalConveyor {
  x: number;
  z: number;
  rot: number;
  len: number;
}

interface StackedBlock {
  width: number;
  depth: number;
  placements: LocalPlacement[];
  conveyors: LocalConveyor[];
}

function layoutStackedBlock(deptGroups: Array<{ id: string; section: string; entries: Entry[] }>): StackedBlock {
  const placements: LocalPlacement[] = [];
  const conveyors: LocalConveyor[] = [];
  const blockDepths: number[] = [];
  const blockWidths: number[] = [];
  // First pass: compute each dept's own block (rows), so we know the overall
  // content width up front and can left/right-centre every row consistently.
  const deptBlocks = deptGroups.map((g) => {
    const sorted = [...g.entries].sort((a, b) => byCodeThenId(a.machine, b.machine));
    const capacity = computeRowCapacity(sorted);
    const rows = buildRows(sorted, capacity);
    const width = rows.length ? Math.max(...rows.map((r) => r.width)) : 0;
    const depth = rows.length ? rows.reduce((s, r) => s + r.depth, 0) + (rows.length - 1) * ROW_GAP : 0;
    blockWidths.push(width);
    blockDepths.push(depth);
    return { ...g, rows, width, depth };
  });

  const contentWidth = Math.max(0, ...blockWidths);
  const contentDepth = deptBlocks.reduce((s, b) => s + b.depth, 0) + Math.max(0, deptBlocks.length - 1) * LINE_GAP;

  let zCursor = -contentDepth / 2;
  for (const block of deptBlocks) {
    let rowZ = zCursor;
    for (const row of block.rows) {
      const rz = rowZ + row.depth / 2;
      let cursorX = -contentWidth / 2;
      let prev: { x: number; archetype: Archetype } | null = null;
      for (const e of row.machines) {
        const span = FOOTPRINT[e.archetype][0];
        const x = cursorX + span / 2;
        placements.push({ entry: e, x, z: rz, rot: 0, lineId: block.id, section: block.section });
        if (prev) {
          const prevSpan = FOOTPRINT[prev.archetype][0];
          const prevRight = prev.x + prevSpan / 2;
          const currLeft = x - span / 2;
          const gap = currLeft - prevRight;
          // Centre the conveyor on the GAP between the two machine faces, not
          // on the midpoint of their centres -- those only coincide when both
          // machines share the same footprint width.
          conveyors.push({ x: (prevRight + currLeft) / 2, z: rz, rot: 0, len: Math.max(0.5, gap) });
        }
        cursorX += span + MACHINE_PITCH_GAP;
        prev = { x, archetype: e.archetype };
      }
      rowZ += row.depth + ROW_GAP;
    }
    zCursor += block.depth + LINE_GAP;
  }

  return { width: contentWidth, depth: contentDepth, placements, conveyors };
}

// ---------------------------------------------------------------------------
// 'lines' zone kind packer — REVISION 4: each department line now runs as a
// single-file flow along scene Z (`layoutSerpentineLine`, matching
// `plant-line-3d.html`'s single-file "stations strung along the flow
// direction with conveyors between consecutive stations"), folding into a
// handful of `computeRowCapacity`-wide parallel passes connected by a
// return-leg conveyor at each fold when it's too long for one pass — a
// visible serpentine, never a disconnected grid of independently-stacked
// rows (which is what revision 3 did: rows with no conveyor between them).
//
// All 49 lines are then shelf-packed by `packLinesZone`, biggest-first
// WITHIN each DB section but never re-sorted ACROSS sections — see that
// function's own doc comment for why, and for the numeric cost this pays
// for guaranteeing every section stays visibly contiguous (§4 in
// LAYOUT-PLAN.md has the full before/after comparison against a fully
// free, section-blind sort, and against a literal fixed-bay-grid attempt
// that was tried and rejected for being worse on every axis).
// ---------------------------------------------------------------------------

interface DeptGroup {
  section: string;
  dept: string;
  entries: Entry[];
}

/** Lays out ONE department line as a single-file run along scene Z (the
 *  flow axis), folding into a small number of `computeRowCapacity`-wide
 *  parallel passes (columns share one fixed grid so every fold-to-fold
 *  "return leg" lands exactly on the two machines it connects — see the
 *  column-mapping note below) rather than running arrow-straight for
 *  hundreds of metres or bin-packing into a disconnected grid. Returns the
 *  block's own bounding box + placements/conveyors in LOCAL coordinates
 *  centred on (0,0), same convention as `layoutStackedBlock`. */
function layoutSerpentineLine(entries: Entry[], lineId: string, section: string): StackedBlock {
  if (entries.length === 0) return { width: 0, depth: 0, placements: [], conveyors: [] };
  const sorted = [...entries].sort((a, b) => byCodeThenId(a.machine, b.machine));

  const capacity = computeRowCapacity(sorted);
  const rows: Entry[][] = [];
  for (let i = 0; i < sorted.length; i += capacity) rows.push(sorted.slice(i, i + capacity));

  // A fixed column GRID for the whole line (every row places its machines
  // against the same `capacity` column x-positions) is what guarantees every
  // fold's "return leg" conveyor lands exactly on a real machine centre at
  // both ends (see the entry/exit-column argument below). But each column's
  // PITCH only needs to be as wide as what actually lands in that column
  // across all rows — not the widest machine anywhere in the whole line —
  // so a line mixing e.g. one wide `charger` with many narrower `press`
  // machines doesn't pay that charger's width on every column.
  const colPitch: number[] = new Array(capacity).fill(0);
  rows.forEach((row, ri) => {
    const leftToRight = ri % 2 === 0;
    row.forEach((e, k) => {
      const col = leftToRight ? k : capacity - 1 - k;
      colPitch[col] = Math.max(colPitch[col]!, FOOTPRINT[e.archetype][0] + MACHINE_PITCH_GAP);
    });
  });
  const width = colPitch.reduce((s, w) => s + w, 0);
  const colStart: number[] = [];
  {
    let acc = -width / 2;
    for (const w of colPitch) {
      colStart.push(acc);
      acc += w;
    }
  }
  const rowDepths = rows.map((row) => Math.max(...row.map((e) => FOOTPRINT[e.archetype][1])));
  const depth = rowDepths.reduce((s, d) => s + d, 0) + Math.max(0, rows.length - 1) * ROW_GAP;
  const colX = (k: number) => colStart[k]! + colPitch[k]! / 2;

  const placements: LocalPlacement[] = [];
  const conveyors: LocalConveyor[] = [];
  let zCursor = -depth / 2;
  let prevRz = 0;
  rows.forEach((row, ri) => {
    const rz = zCursor + rowDepths[ri]! / 2;
    // Even passes flow +X (left->right), odd passes flow -X — a real
    // serpentine/boustrophedon line, alternating direction pass to pass.
    const leftToRight = ri % 2 === 0;
    let prev: { x: number; archetype: Archetype } | null = null;
    row.forEach((e, k) => {
      // All rows share the SAME `capacity` column grid. A row's k=0 machine
      // (the one immediately continuing the flow from the previous pass) is
      // ALWAYS placed at column 0 (odd passes) or column capacity-1 (even
      // passes) — i.e. exactly the column the previous FULL pass ended on
      // (every pass except possibly the last is full, by construction of
      // the chunking above), so the return-leg conveyor's far end always
      // lands on a real machine, never a floating waypoint.
      const col = leftToRight ? k : capacity - 1 - k;
      const x = colX(col);
      placements.push({ entry: e, x, z: rz, rot: 0, lineId, section });
      if (prev) {
        const prevSpan = FOOTPRINT[prev.archetype][0];
        const span = FOOTPRINT[e.archetype][0];
        const a = leftToRight ? prev.x + prevSpan / 2 : prev.x - prevSpan / 2;
        const b = leftToRight ? x - span / 2 : x + span / 2;
        conveyors.push({ x: (a + b) / 2, z: rz, rot: 0, len: Math.max(0.5, Math.abs(b - a)) });
      }
      prev = { x, archetype: e.archetype };
    });
    if (ri > 0) {
      // Return-leg conveyor connecting the previous pass's exit machine to
      // this pass's entry machine — both are, by the column argument above,
      // centred at the SAME x (`colX` of the shared turn column), so a
      // single vertical (rot 90) segment between the two rows' z-centres
      // touches a real machine at both ends.
      const turnCol = leftToRight ? 0 : capacity - 1;
      conveyors.push({ x: colX(turnCol), z: (prevRz + rz) / 2, rot: 90, len: Math.max(0.5, Math.abs(rz - prevRz)) });
    }
    prevRz = rz;
    zCursor += rowDepths[ri]! + ROW_GAP;
  });

  return { width, depth, placements, conveyors };
}

/** Shelf-packs a list of pre-built rectangular blocks, sorted by their own
 *  area descending (ties by `id`, so it never depends on input order) —
 *  sorting by size is what keeps a shelf packer area-efficient: mixing
 *  wildly different heights on one row is what wastes floor (a row's depth
 *  is its tallest occupant, stranding the shorter ones' unused headroom).
 *  Wraps to a new shelf row once the current row would exceed a
 *  roughly-square target width. `LINE_GAP` separates consecutive blocks on
 *  the same shelf; `BAY_AISLE` (wider) separates one shelf row from the
 *  next. Returns the content's bounding box + every placement in LOCAL
 *  coordinates centred on (0,0) — same convention as `layoutStackedBlock`. */
function shelfPack(items: Array<{ id: string; block: StackedBlock }>, preserveOrder = false): StackedBlock {
  const withContent = items.filter((it) => it.block.placements.length > 0);
  if (withContent.length === 0) return { width: 0, depth: 0, placements: [], conveyors: [] };

  const totalArea = withContent.reduce((s, it) => s + it.block.width * it.block.depth, 0);
  const maxWidth = Math.max(...withContent.map((it) => it.block.width));
  const rowMaxWidth = Math.max(Math.sqrt(totalArea * 1.3), maxWidth);
  const ordered = preserveOrder
    ? withContent
    : [...withContent].sort((a, b) => {
        const diff = b.block.width * b.block.depth - a.block.width * a.block.depth;
        if (diff !== 0) return diff;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });

  const placements: LocalPlacement[] = [];
  const conveyors: LocalConveyor[] = [];
  let cursorX = 0;
  let cursorZ = 0;
  let rowDepth = 0;
  let maxX = 0;
  let firstInRow = true;
  for (const it of ordered) {
    if (!firstInRow && cursorX + it.block.width > rowMaxWidth) {
      cursorX = 0;
      cursorZ += rowDepth + BAY_AISLE;
      rowDepth = 0;
      firstInRow = true;
    }
    if (!firstInRow) cursorX += LINE_GAP;
    const offsetX = cursorX + it.block.width / 2;
    const offsetZ = cursorZ + it.block.depth / 2;
    for (const p of it.block.placements) placements.push({ ...p, x: p.x + offsetX, z: p.z + offsetZ });
    for (const c of it.block.conveyors) conveyors.push({ ...c, x: c.x + offsetX, z: c.z + offsetZ });
    cursorX += it.block.width;
    rowDepth = Math.max(rowDepth, it.block.depth);
    maxX = Math.max(maxX, cursorX);
    firstInRow = false;
  }
  const width = maxX;
  const depth = cursorZ + rowDepth;
  const shiftX = width / 2;
  const shiftZ = depth / 2;
  for (const p of placements) {
    p.x -= shiftX;
    p.z -= shiftZ;
  }
  for (const c of conveyors) {
    c.x -= shiftX;
    c.z -= shiftZ;
  }
  return { width, depth, placements, conveyors };
}

/** Packs every department line into the LINES zone with DB sections kept
 *  visibly CONTIGUOUS: sections are taken in the order the caller already
 *  produced them in (`buildPlantLayout` sorts `bySection` keys, then dept
 *  keys within each section, before building `linesDepts`) and are NEVER
 *  re-sorted relative to each other — `shelfPack(..., preserveOrder=true)`
 *  can therefore only ever place a section's lines next to each other or,
 *  if a shelf row wraps mid-section, spill onto the immediately following
 *  row, never scatter them. WITHIN a section, its own lines ARE sorted
 *  biggest-first before being hand to the packer — that reordering never
 *  crosses a section boundary, so contiguity is untouched, but it recovers
 *  most of the row-fill quality a full biggest-first sort would give
 *  (mixing a 3-machine line and a 43-machine line on the same shelf row
 *  wastes the row's leftover height; sorting within each section keeps that
 *  mixing local and small).
 *
 *  Two rejected alternatives, both measured against this dataset (973 rows,
 *  49 lines, 21 sections spanning 3 to 43 machines each — see
 *  LAYOUT-PLAN.md §4 for the full numbers):
 *  - Preserving the RAW (section, dept) order with no size-sorting at all:
 *    ~15% more packed area than this.
 *  - Forcing every line onto one of 16 fixed-width parallel lanes (2 per
 *    named `PLANT_SITE.lineBays` bay), each reserving its own width across
 *    its FULL run length regardless of that lane's actual content: ~15-70%
 *    more area depending on lane width, because reserving a lane's width
 *    for its entire length wastes floor whenever that lane's real content
 *    is shorter than the busiest lane — and with lines this size-varied,
 *    that waste is large. */
function packLinesZone(deptGroups: DeptGroup[]): StackedBlock {
  const bySectionOrdered: Array<{ section: string; groups: DeptGroup[] }> = [];
  for (const g of deptGroups) {
    const last = bySectionOrdered[bySectionOrdered.length - 1];
    if (last && last.section === g.section) last.groups.push(g);
    else bySectionOrdered.push({ section: g.section, groups: [g] });
  }

  const orderedLines: Array<{ id: string; block: StackedBlock }> = [];
  for (const s of bySectionOrdered) {
    const lineItems = s.groups
      .map((g) => ({ id: g.dept, block: layoutSerpentineLine(g.entries, g.dept, g.section) }))
      .filter((it) => it.block.placements.length > 0)
      .sort((a, b) => b.block.width * b.block.depth - a.block.width * a.block.depth);
    orderedLines.push(...lineItems);
  }

  return shelfPack(orderedLines, true);
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export function buildPlantLayout(machines: Machine[]): PlantLayout {
  const skipped: SkippedMachine[] = [];
  const renderable: Entry[] = [];

  for (const m of machines) {
    const archetype = archetypeFor(m);
    if (archetype === null || !isRenderableMachine(m)) {
      skipped.push({
        machineId: m.id,
        code: m.code,
        name: m.name,
        reason: "no matching category or keyword — administrative/placeholder row, not real equipment",
      });
      continue;
    }
    renderable.push({ machine: m, archetype });
  }

  // ---- 1. group by section -> department_code, then bucket by zone-kind ---
  const bySection = new Map<string, Map<string, Entry[]>>();
  for (const entry of renderable) {
    const sKey = sectionKey(entry.machine);
    const dKey = deptKey(entry.machine);
    let depts = bySection.get(sKey);
    if (!depts) {
      depts = new Map();
      bySection.set(sKey, depts);
    }
    (depts.get(dKey) ?? depts.set(dKey, []).get(dKey)!).push(entry);
  }

  const racksDepts: Array<{ id: string; section: string; entries: Entry[] }> = [];
  const heatDepts: Array<{ id: string; section: string; entries: Entry[] }> = [];
  const linesDepts: DeptGroup[] = [];

  for (const sKey of [...bySection.keys()].sort()) {
    const depts = bySection.get(sKey)!;
    const kind = zoneKindForSection(sKey);
    for (const dKey of [...depts.keys()].sort()) {
      const entries = depts.get(dKey)!;
      if (kind === "racks") racksDepts.push({ id: dKey, section: sKey, entries });
      else if (kind === "heat") heatDepts.push({ id: dKey, section: sKey, entries });
      else linesDepts.push({ section: sKey, dept: dKey, entries });
    }
  }

  // ---- 2. pack each kind's content at REAL scale (machines never scale) ---
  const racksBlock = layoutStackedBlock(racksDepts);
  const heatBlock = layoutStackedBlock(heatDepts);
  // All 49 department lines bin-packed directly against real footprints --
  // no fixed bay count, no artificial pitch (see `packLinesZone`'s doc comment).
  const linesBlock = packLinesZone(linesDepts);

  // ---- 3. size each zone to its own real content (or true reference size
  //          for the 5 zones the DB cannot populate), arrange them preserving
  //          the reference plan's own RELATIVE arrangement (which row each
  //          zone sits in, west-to-east order within a row), then make the
  //          hall the bounding box of that arrangement plus a real perimeter
  //          margin.
  //
  //          This deliberately does NOT reuse the reference plan's own
  //          zone-AREA proportions (revision 3/4's approach: stretch the
  //          whole reference envelope by whichever zone needed the most
  //          room, `sx`/`sz` derived from `content / referenceZoneRect`).
  //          That reference plan's zones are proportioned for a DIFFERENT
  //          plant's product mix: its `LINES` zone is a comparatively thin
  //          band relative to `WH`/`FRG-A`/`FRG-B`/`HT-*`. Our real data is
  //          overwhelmingly production lines (18 of 21 DB sections map to
  //          `LINES`, see §2), so forcing our content into that reference's
  //          proportions meant inflating the ENTIRE envelope just to make
  //          one thin reference band big enough — producing a hall roughly
  //          3x bigger, on its own bounding area, than the zones actually
  //          packed inside it (measured: 119,559 m² of zone content in a
  //          376,742 m² hall, ratio 0.317). Sizing each zone to its own real
  //          content instead fixes this at the source; see LAYOUT-PLAN.md §3
  //          for the full before/after.
  const refZones = PLANT_SITE.zones;
  const findRef = (id: string) => refZones.find((z) => z.id === id)!;

  const racksNeed = { w: racksBlock.width + 2 * ZONE_MARGIN, d: racksBlock.depth + 2 * ZONE_MARGIN };
  const heatNeed = { w: heatBlock.width + 2 * ZONE_MARGIN, d: heatBlock.depth + 2 * ZONE_MARGIN };
  const linesNeed = { w: linesBlock.width + 2 * ZONE_MARGIN, d: linesBlock.depth + 2 * ZONE_MARGIN };

  const populatedZones: string[] = [];
  const emptyZones: string[] = [];
  /** A zone with real DB content is sized to that content + margin; a zone
   *  the DB cannot populate (§8: `FRG-A`/`FRG-B`/`HT-2..4`) stays at its
   *  TRUE reference size (Option A — visibly empty, never stretched, never
   *  deleted). */
  const zoneSize = (id: string, need: { w: number; d: number } | null): { w: number; d: number } => {
    if (need) {
      populatedZones.push(id);
      return { w: Math.max(need.w, 1), d: Math.max(need.d, 1) };
    }
    emptyZones.push(id);
    const ref = findRef(id);
    return { w: ref.w, d: ref.d };
  };

  const whSize = zoneSize("WH", racksBlock.placements.length > 0 ? racksNeed : null);
  const frgASize = zoneSize("FRG-A", null);
  const frgBSize = zoneSize("FRG-B", null);
  const ht1Size = zoneSize("HT-1", heatBlock.placements.length > 0 ? heatNeed : null);
  const ht2Size = zoneSize("HT-2", null);
  const ht3Size = zoneSize("HT-3", null);
  const ht4Size = zoneSize("HT-4", null);
  const linesSize = zoneSize("LINES", linesBlock.placements.length > 0 ? linesNeed : null);

  interface ZoneSlot {
    id: string;
    size: { w: number; d: number };
  }
  // Three rows, preserving the reference plan's own relative arrangement:
  // row A (`WH`, `FRG-A`, `FRG-B`, west to east) sits closest to the
  // reference's own north wall; row B (`HT-1..4`, west to east) sits
  // between row A and `LINES`; row C (`LINES` alone) sits at the reference's
  // south side, matching `RAW_ZONES`' own y-ordering (WH/FRG-A/FRG-B:
  // y0=56.7-58.6; HT-1..4: y0=36.3; LINES: y0=7.7 — decreasing y = row A,
  // then B, then C in that order).
  const rowA: ZoneSlot[] = [
    { id: "WH", size: whSize },
    { id: "FRG-A", size: frgASize },
    { id: "FRG-B", size: frgBSize },
  ];
  const rowB: ZoneSlot[] = [
    { id: "HT-1", size: ht1Size },
    { id: "HT-2", size: ht2Size },
    { id: "HT-3", size: ht3Size },
    { id: "HT-4", size: ht4Size },
  ];
  const rowC: ZoneSlot[] = [{ id: "LINES", size: linesSize }];

  function layoutRow(row: ZoneSlot[]): { width: number; depth: number; positions: Map<string, number> } {
    const width = row.reduce((s, z) => s + z.size.w, 0) + Math.max(0, row.length - 1) * ZONE_GAP;
    const depth = Math.max(...row.map((z) => z.size.d));
    const positions = new Map<string, number>();
    let cursor = -width / 2;
    for (const z of row) {
      positions.set(z.id, cursor + z.size.w / 2);
      cursor += z.size.w + ZONE_GAP;
    }
    return { width, depth, positions };
  }

  const rowALayout = layoutRow(rowA);
  const rowBLayout = layoutRow(rowB);
  const rowCLayout = layoutRow(rowC);

  const contentWidth = Math.max(rowALayout.width, rowBLayout.width, rowCLayout.width);
  const contentDepth = rowALayout.depth + ZONE_ROW_AISLE + rowBLayout.depth + ZONE_ROW_AISLE + rowCLayout.depth;

  const rowAZ = -contentDepth / 2 + rowALayout.depth / 2;
  const rowBZ = -contentDepth / 2 + rowALayout.depth + ZONE_ROW_AISLE + rowBLayout.depth / 2;
  const rowCZ = -contentDepth / 2 + rowALayout.depth + ZONE_ROW_AISLE + rowBLayout.depth + ZONE_ROW_AISLE + rowCLayout.depth / 2;

  const zonePositions = new Map<string, { x: number; z: number; w: number; d: number }>();
  for (const z of rowA) zonePositions.set(z.id, { x: rowALayout.positions.get(z.id)!, z: rowAZ, w: z.size.w, d: z.size.d });
  for (const z of rowB) zonePositions.set(z.id, { x: rowBLayout.positions.get(z.id)!, z: rowBZ, w: z.size.w, d: z.size.d });
  for (const z of rowC) zonePositions.set(z.id, { x: rowCLayout.positions.get(z.id)!, z: rowCZ, w: z.size.w, d: z.size.d });

  const hallW = contentWidth + 2 * HALL_PERIMETER;
  const hallD = contentDepth + 2 * HALL_PERIMETER;
  // `scaleSiteTo` is still exactly the right tool for everything OUTSIDE the
  // 8 in-hall zones (rooms/buildings/sheds/tanks/roads/parking/grass/trees/
  // poles/fences): it independently maps position by (targetW/refW,
  // targetD/refD) while holding real fixed dimensions fixed, which is
  // agnostic to WHY `hallW`/`hallD` were chosen — it works the same whether
  // they came from a proportional stretch (revision 3/4) or, as here, a
  // content-driven bounding box. Only its ZONE rectangles are discarded
  // below and replaced with the arrangement just computed.
  const site = scaleSiteTo({ w: hallW, d: hallD });

  for (const z of site.zones) {
    const p = zonePositions.get(z.id)!;
    z.x = p.x;
    z.z = p.z;
    z.w = p.w;
    z.d = p.d;
  }
  // The LINES zone's own line-band (used for HUD/reference display) tracks
  // that zone's real content depth.
  const linesZoneRect = site.zones.find((z) => z.id === "LINES")!;
  site.lineBand.z0 = linesZoneRect.z - linesZoneRect.d / 2;
  site.lineBand.z1 = linesZoneRect.z + linesZoneRect.d / 2;
  // The 8 named line-bay labels are cosmetic-only (the real packing doesn't
  // use a fixed bay grid, see `packLinesZone`'s doc comment) -- spread them
  // evenly across the zone's actual width so they still read as sensible
  // label positions.
  site.lineBays.forEach((bay, i) => {
    bay.x = linesZoneRect.x - linesZoneRect.w / 2 + ((i + 0.5) * linesZoneRect.w) / site.lineBays.length;
  });

  // `factor`/`referenceHall`/`hall` keep their EXISTING contract: a couple
  // of scene components still read them (`PlantEnvironment.tsx` scales its
  // 5 hardcoded hall-door literals by `.scale.factor`; `LiveFloorView.tsx`
  // derives its own independent `hall.w/referenceHall.w` and
  // `hall.d/referenceHall.d`). Both formulas are agnostic to HOW `hallW`/
  // `hallD` were derived -- `factor` is simply "how much bigger our hall
  // ended up than the reference survey, on whichever axis grew more."
  const sx = hallW / PLANT_SITE.hall.w;
  const sz = hallD / PLANT_SITE.hall.d;
  const factor = Math.max(sx, sz);

  // `drivers` is now purely INFORMATIONAL (not used to size the hall): what
  // a naive isotropic/per-zone stretch of the traced reference rectangles
  // would have required, kept so the gap between "reference plan's implied
  // proportions" and "our real product mix" stays visible for diagnosis —
  // see LAYOUT-PLAN.md §3 for the numbers this produces.
  const refProdArea = refZones.reduce((s, z) => s + z.w * z.d, 0);
  const totalPaddedArea = renderable.reduce((sum, e) => {
    const [w, d] = FOOTPRINT[e.archetype];
    return sum + (w + MACHINE_PITCH_GAP) * (d + ROW_GAP);
  }, 0);
  const sArea = Math.sqrt(totalPaddedArea / Math.max(1, refProdArea));
  const whRef = findRef("WH");
  const ht1Ref = findRef("HT-1");
  const linesRef = findRef("LINES");
  const sRacks = racksBlock.placements.length > 0 ? Math.max(racksNeed.w / whRef.w, racksNeed.d / whRef.d) : 0;
  const sHeat = heatBlock.placements.length > 0 ? Math.max(heatNeed.w / ht1Ref.w, heatNeed.d / ht1Ref.d) : 0;
  const sLines = linesBlock.placements.length > 0 ? Math.max(linesNeed.w / linesRef.w, linesNeed.d / linesRef.d) : 0;

  const scale: ScaleReport = {
    factor,
    referenceHall: { w: PLANT_SITE.hall.w, d: PLANT_SITE.hall.d },
    hall: { w: hallW, d: hallD },
    drivers: { area: sArea, racks: sRacks, heat: sHeat, lines: sLines },
    structuralBays: { x: Math.round(hallW / STRUCTURAL_BAY), z: Math.round(hallD / STRUCTURAL_BAY), pitch: STRUCTURAL_BAY },
    populatedZones,
    emptyZones,
  };

  // ---- 4. place machines against the (zone-fitted) site --------------------
  const placedMachines: PlacedMachine[] = [];
  const conveyors: ConveyorSegment[] = [];
  const lineAgg = new Map<string, { section: string; zoneId: string; ids: string[]; minX: number; maxX: number; minZ: number; maxZ: number }>();

  const addLineAgg = (id: string, section: string, zoneId: string, machineId: string, x: number, z: number, w: number, d: number) => {
    let agg = lineAgg.get(id);
    if (!agg) {
      agg = { section, zoneId, ids: [], minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
      lineAgg.set(id, agg);
    }
    agg.ids.push(machineId);
    agg.minX = Math.min(agg.minX, x - w / 2);
    agg.maxX = Math.max(agg.maxX, x + w / 2);
    agg.minZ = Math.min(agg.minZ, z - d / 2);
    agg.maxZ = Math.max(agg.maxZ, z + d / 2);
  };

  const emitMachine = (
    p: { entry: Entry; x: number; z: number; rot: number },
    zoneId: string,
    lineId: string,
    section: string
  ) => {
    const { machine: m, archetype } = p.entry;
    const [fw, fd] = FOOTPRINT[archetype];
    const rotated = p.rot % 180 !== 0;
    const width = rotated ? fd : fw;
    const depth = rotated ? fw : fd;
    placedMachines.push({
      id: m.id,
      type: archetype,
      x: p.x,
      z: p.z,
      rot: p.rot,
      rotationY: (p.rot * Math.PI) / 180,
      width,
      depth,
      height: HEIGHT[archetype],
      zoneId,
      lineId,
      status: statusToKitStatus(m.status),
      label: m.code ?? m.id,
      sub: m.name,
      userData: {
        machineId: m.id,
        code: m.code,
        section: m.section ?? null,
        department: m.departmentCode ?? null,
        category: m.category ?? null,
        dbStatus: m.status,
      },
      machine: m,
    });
    addLineAgg(lineId, section, zoneId, m.id, p.x, p.z, width, depth);
  };

  // racks -> WH zone
  const wh = site.zones.find((z) => z.id === "WH")!;
  for (const p of racksBlock.placements) {
    emitMachine({ entry: p.entry, x: wh.x + p.x, z: wh.z + p.z, rot: p.rot }, wh.id, p.lineId, p.section);
  }
  for (const c of racksBlock.conveyors) {
    conveyors.push({ x: wh.x + c.x, z: wh.z + c.z, rot: c.rot, len: c.len, width: 1.5, parts: c.len > 1 ? 2 : 0 });
  }

  // heat -> HT-1 zone (only DB section mapped here; HT-2..4 stay empty,
  // still exported as site geometry).
  const ht1 = site.zones.find((z) => z.id === "HT-1")!;
  for (const p of heatBlock.placements) {
    emitMachine({ entry: p.entry, x: ht1.x + p.x, z: ht1.z + p.z, rot: p.rot }, ht1.id, p.lineId, p.section);
  }
  for (const c of heatBlock.conveyors) {
    conveyors.push({ x: ht1.x + c.x, z: ht1.z + c.z, rot: c.rot, len: c.len, width: 1.5, parts: c.len > 1 ? 2 : 0 });
  }

  // lines -> the LINES zone, centred on that zone's own (content-fitted) centre.
  for (const p of linesBlock.placements) {
    emitMachine({ entry: p.entry, x: linesZoneRect.x + p.x, z: linesZoneRect.z + p.z, rot: p.rot }, "LINES", p.lineId, p.section);
  }
  for (const c of linesBlock.conveyors) {
    conveyors.push({ x: linesZoneRect.x + c.x, z: linesZoneRect.z + c.z, rot: c.rot, len: c.len, width: 1.5, parts: c.len > 1 ? 2 : 0 });
  }

  const lines: LineInfo[] = [...lineAgg.entries()].map(([id, agg]) => ({
    id,
    section: agg.section,
    zoneId: agg.zoneId,
    machineIds: agg.ids,
    x0: agg.minX,
    x1: agg.maxX,
    z0: agg.minZ,
    z1: agg.maxZ,
  }));

  // ---- 5. bounds -----------------------------------------------------------
  const xs = placedMachines.map((m) => m.x);
  const zs = placedMachines.map((m) => m.z);
  const bounds =
    placedMachines.length > 0
      ? {
          minX: Math.min(...xs, -site.hall.w / 2),
          maxX: Math.max(...xs, site.hall.w / 2),
          minZ: Math.min(...zs, -site.hall.d / 2),
          maxZ: Math.max(...zs, site.hall.d / 2),
        }
      : { minX: -site.hall.w / 2, maxX: site.hall.w / 2, minZ: -site.hall.d / 2, maxZ: site.hall.d / 2 };

  return {
    unit: "m",
    degrees: true,
    machines: placedMachines,
    conveyors,
    hall: site.hall,
    site,
    lines,
    bounds,
    skipped,
    scale,
  };
}
