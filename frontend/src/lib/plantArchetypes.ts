import type { Machine, MachineStatus } from "../types";

/**
 * The 10 archetypes offered by the `plant-machines.js` kit (see
 * `Model_3D/README.md`). This module maps every real DB `Machine` row onto
 * one of these, deterministically (same machine -> same result, always --
 * no randomness, no Date.now(), no Math.random()) or onto `null` when the
 * row genuinely cannot be classified as a piece of shop-floor equipment.
 */
export const MACHINE_ARCHETYPES = [
  "furnace",
  "mixer",
  "coater",
  "oven",
  "press",
  "robot",
  "cell",
  "filler",
  "charger",
  "packer",
] as const;

export type Archetype = (typeof MACHINE_ARCHETYPES)[number];

/**
 * Mapping table (documented here, not just in code, per the task spec):
 *
 * ── 1) By `category` (10 DB values incl. null) ──────────────────────────
 *   GRINDING                     -> press     (grinding = a forming/cutting
 *                                               station, closest kit shape)
 *   ASSEMBLY                     -> robot     (multi-step manual/robot cell)
 *   CHECK                        -> packer    (end-of-line inspection/test,
 *                                               same footprint as a packer)
 *   DEMAGNETIZING MACHINE        -> cell      (enclosed single-purpose cell)
 *   MAGNET FILTER COOLANT TANK   -> mixer     (tank + circulation = mixer)
 *   WASHER                       -> filler    (wet-process station, closest
 *                                               kit shape to a washer)
 *   TOOL, SUPPORT, OTHER, null   -> fall through to (2) below; these
 *                                    categories are too generic to map on
 *                                    their own (828/973 rows are "OTHER").
 *
 * ── 2) By keyword match on `name` / `production_name` (case-insensitive,
 *      first match wins) -- used whenever (1) doesn't resolve a category.
 *      Widened against the real 973-row dataset: every bearing-plant
 *      process word actually seen in `name` (super-finish, radial/axial
 *      clearance, eddy-current tester, anti-rust, feeder, matching,
 *      insertion, laser marker, ...) has an explicit rule below, not just
 *      the generic terms from the kit's own README table. ────────────────
 *   furnace|kiln|heat treat|induction                    -> furnace
 *   mixer|agitat|blend|coolant|tank|hopper                -> mixer
 *   anti-rust/antrust/rust prevention|coat|paint|spray|
 *     plating|plate|deoil|centrifugal                    -> coater
 *   oven|dry(er/ing)|cure|bake|anneal                     -> oven
 *   press|punch|stamp|form|grind|(super)?finish|lathe|
 *     mill|cnc|drill|cut|polish|deburr|turn|roll|shear|
 *     saw|broach                                         -> press
 *   robot|assy|assembl|pick&place|manual line|feeder|
 *     supply|matching|insertion|separat(e/ion)|conveyor  -> robot
 *   weld|seal|demag|enclosure                            -> cell
 *   wash|fill|dose|inject|rinse|degreas|grease|oil|lube  -> filler
 *   charge|battery|rack|cabinet                          -> charger
 *   pack|wrap|label|palletiz|check|inspect|test(er/ing)|
 *     scale|gauge|mark(er/ing)|eddy current|clearance|
 *     measurement|selection|torque|magnetic particle     -> packer
 *
 * ── 3) Unclassifiable -> `null` ─────────────────────────────────────────
 *   Nothing above matched. In practice this is the ~1-3% of rows that are
 *   administrative/rollup placeholders from the Excel import (`ALL-0xx`
 *   codes whose `name` is just a section/department code, e.g. "ALL
 *   MACHINE", "G1", "HT", "MCB") rather than real equipment. These are
 *   NEVER hash-guessed into a fake shape -- `archetypeFor` returns `null`
 *   and `isRenderableMachine` excludes them from the 3D scene entirely
 *   (see `buildPlantLayout`'s `skipped[]` output in plantLayout.ts).
 */

const CATEGORY_MAP: Record<string, Archetype> = {
  GRINDING: "press",
  ASSEMBLY: "robot",
  CHECK: "packer",
  "DEMAGNETIZING MACHINE": "cell",
  "MAGNET FILTER COOLANT TANK": "mixer",
  WASHER: "filler",
};

// Ordered: first matching keyword wins. More specific process words are
// listed ahead of generic ones only where a real collision was observed
// against the actual dataset (see Model_3D/LAYOUT-PLAN.md).
const KEYWORD_MAP: Array<[RegExp, Archetype]> = [
  [/furnace|kiln|heat\s*treat|induction/i, "furnace"],
  [/mixer|agitat|blend|coolant|tank|hopper/i, "mixer"],
  [/anti[-\s]?rust|antriust|rust\s*prevention|coat|paint|spray|plating|plate|deoil|centrifugal/i, "coater"],
  [/oven|dry(er|ing)?|cure|bake|anneal/i, "oven"],
  [
    /press|punch|stamp|\bform(ing)?\b|grind|super\s*finish|\bfinish(ing)?\b|lathe|mill|cnc|drill|\bcut(ting)?\b|polish|deburr|turn(ing)?|roll(ing)?|shear|\bsaw\b|broach/i,
    "press",
  ],
  [
    /robot|assy|assembl|pick\s*&?\s*place|manual\s*line|feeder|\bsupply\b|matching|insertion|separat(e|ion)?|seperat(e|ion)?|conveyor/i,
    "robot",
  ],
  [/weld|seal|demag|enclosure/i, "cell"],
  [/wash|fill|dose|inject|rinse|degreas|grease|\boil\b|lube/i, "filler"],
  [/charge|charging|battery|rack\b|cabinet/i, "charger"],
  [
    /pack|wrap|label|palletiz|check|inspect|\btest(er|ing)?\b|scale|gauge|mark(er|ing)?|eddy\s*current|clearance|measurement|selection|torque|magnetic\s*particle/i,
    "packer",
  ],
];

/**
 * Deterministically maps a DB machine row to one of the 10 kit archetypes,
 * or `null` when it cannot be genuinely classified (see mapping table
 * above). Pure function: same input always yields the same output. Never
 * hash-guesses -- a `null` here means "not real, classifiable equipment".
 */
export function archetypeFor(
  machine: Pick<Machine, "id" | "code" | "name" | "category" | "productionName">
): Archetype | null {
  const category = machine.category ? machine.category.trim().toUpperCase() : "";
  const fromCategory = CATEGORY_MAP[category];
  if (fromCategory) return fromCategory;

  const haystack = `${machine.name ?? ""} ${machine.productionName ?? ""}`;
  for (const [re, archetype] of KEYWORD_MAP) {
    if (re.test(haystack)) return archetype;
  }

  return null;
}

/**
 * True when a DB row is real, classifiable shop-floor equipment that should
 * appear in the 3D scene. False for administrative/rollup rows (an `ALL-0xx`
 * placeholder, a row whose `name` is just a section code, etc.) -- anything
 * `archetypeFor` could not genuinely classify. Pure, deterministic.
 */
export function isRenderableMachine(
  machine: Pick<Machine, "id" | "code" | "name" | "category" | "productionName">
): boolean {
  return archetypeFor(machine) !== null;
}

/** Kit status vocabulary is 'run'|'warn'|'stop'|'idle'; the DB uses different words. */
export type KitStatus = "run" | "warn" | "stop" | "idle";

const STATUS_MAP: Record<MachineStatus, KitStatus> = {
  normal: "run",
  warning: "warn",
  error: "stop",
  maintenance: "idle",
};

export function statusToKitStatus(dbStatus: MachineStatus): KitStatus {
  return STATUS_MAP[dbStatus];
}
