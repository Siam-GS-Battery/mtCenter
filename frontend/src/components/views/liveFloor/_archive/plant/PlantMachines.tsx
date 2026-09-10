/**
 * PlantMachines.tsx — renders every DB machine placed by `buildPlantLayout`
 * (frontend/src/lib/plantLayout.ts) plus the conveyor segments between them,
 * reproducing the look of `Model_3D/nittan-plant-3d.html` (see
 * `Model_3D/REFERENCE-LOOK.md`, the authoritative spec).
 *
 * Owns ONLY machines/conveyors. The scene shell (Canvas, lights, fog, camera,
 * ground/apron) and the site/environment (buildings, roads, zones, ...) are
 * owned elsewhere — see PlantSceneShell.tsx / PlantEnvironment.tsx.
 *
 * ---------------------------------------------------------------------------
 * Kit palette finding (task-required to report, not fix):
 * `frontend/src/lib/plantKit.ts`'s `createSharedKit()` calls
 * `applyThemeStatusColors()` immediately after `createPlantMachines()`,
 * overwriting `kit.statusColors` (run/warn/stop/idle) with hex values pulled
 * from `LIVE_FLOOR_THEME.status` (the app's own theme), BEFORE any machine is
 * built. Because `kit.statusColors` is read LIVE by both `kit.create()` and
 * `kit.setStatus()` (see that file's own header comment), this makes every
 * machine's control-cabinet beacon (and, if `beaconLights` were ever true,
 * its point light) use the app theme's colours instead of the reference's
 * `plant-machines.js` STATUS map (`run 0x22c55e, warn 0xf59e0b, stop
 * 0xef4444, idle 0x64748b` — see REFERENCE-LOOK.md §9), diverging from the
 * reference look this task must reproduce exactly.
 * This component therefore calls `createPlantMachines` directly (imported
 * straight from the vendor kit, bypassing `plantKit.ts`'s `createSharedKit`)
 * so the kit's own built-in STATUS palette is used untouched. `toKitStatus`
 * from `plantKit.ts` is still reused (pure status-vocabulary mapping,
 * `normal|warning|error|maintenance` -> `run|warn|stop|idle`; it does not
 * touch colours).
 * ---------------------------------------------------------------------------
 * LOD / far-tier decision — REVISED: real geometry everywhere, not boxes
 * (see PlantFarTier.tsx / PlantConveyors.tsx / lodInstancing.ts for the full
 * writeup). The previous revision of this file rendered every non-pooled
 * machine as one coloured box per archetype — cheap (10 draw calls total)
 * but wrong: it looked like boxes at any zoom level except the handful of
 * machines KitMachinePool held at full kit detail. That was a deliberate
 * earlier call and it was the wrong one.
 *   `PlantFarTier` now builds each of the 10 archetypes' REAL kit geometry
 *   once, bakes every mesh's world transform into its geometry, and merges
 *   same-material meshes into one geometry per (archetype, material) —
 *   measured against the real vendored kit: 438 total meshes across the 10
 *   archetype templates collapse to 118 merged draw-call buckets, a FIXED
 *   cost independent of machine count (931 machines cost exactly the same
 *   118 draw calls as 1 would; only a per-instance 4x4 matrix write, and for
 *   the one beacon bucket a colour write, is added per machine).
 *   `PlantConveyors` does the same for the non-detailed conveyor stand-in
 *   tier, quantised by length (conveyors vary only in length; width is a
 *   constant 1.5m) — measured at 4 draw-call buckets per distinct length,
 *   and `plantLayout.ts`'s dominant conveyor-generating path produces a
 *   CONSTANT segment length (`MACHINE_PITCH_GAP`), so this collapses to a
 *   small handful of length buckets in practice, not one per segment.
 *   `KitMachinePool` still keeps up to `maxDetailed` full-detail (and
 *   ANIMATED) kit groups nearest the camera + inside the frustum, plus
 *   `pinnedIds` — but its job has narrowed (see the governor re-tuning
 *   below): shape fidelity is no longer its responsibility, only motion is.
 *   Never-both/never-neither is guaranteed by construction, unchanged: every
 *   machine is a member of exactly one archetype's fixed-size InstancedMesh
 *   set, collapsed to a zero-scale (degenerate, unrenderable, unraycastable)
 *   matrix exactly when — and only when — it is in the pool's `activeIds`
 *   set; see PlantFarTier.tsx's header for the precise commit-ordering
 *   caveat this relies on.
 * ---------------------------------------------------------------------------
 * Status + labels: both come from the real DB fields already carried on each
 * `PlacedMachine` by `buildPlantLayout` (never from `floorSimulation.ts`):
 *   - `machine.userData.dbStatus` (`MachineStatus`: normal|warning|error|
 *     maintenance) -> `toKitStatus()` -> kit's `run|warn|stop|idle`.
 *   - `machine.label` = DB `code` (falls back to `id` only if `code` is
 *     null), `machine.sub` = DB `name` — both used verbatim, never invented.
 *     (The far tier omits signage entirely — a plaque's text is unique per
 *     machine and baked from a canvas texture, so it cannot be merged into
 *     shared geometry the way the rest of a machine's shape can. Only the
 *     detailed/pooled tier shows labels.)
 * ---------------------------------------------------------------------------
 * Budget re-derivation, now driven by the far tier's REAL fixed cost instead
 * of the box tier's near-zero one:
 *   Far tier (fixed, independent of machine/conveyor count, measured against
 *   the real kit, not guessed): 118 draw calls (machines, all 10 archetypes)
 *   + a handful (~4 x distinct length buckets, typically 1-3 in this layout)
 *   for conveyors. Call it ~130 draw calls, always paid, always real shapes.
 *   Detailed/animated tier (KitMachinePool + PlantConveyors' own per-segment
 *   groups): this is now the ONLY reason to keep any machine in an expensive
 *   per-instance kit group — a far-tier instance already has the exact same
 *   silhouette, materials, and beacon colour; a detailed/pooled group adds
 *   belt scroll, roller/pulley spin, robot joint swing, press ram travel,
 *   agitator spin, and sliding workpieces, nothing else. That is a strictly
 *   smaller job than "make it look like a real machine at all" (the box
 *   tier's failure), so the budget can be smaller too:
 *     - `MAX_DETAILED_MACHINES_CEILING` / `_FLOOR`: 16 / 4 (was 24 / 8) —
 *       enough that every machine within a few tens of metres of the camera
 *       (the range where motion is actually perceptible) animates; the far
 *       tier covers everything else with a correct static shape instead of
 *       "nothing" or "a box".
 *     - `MAX_DETAILED_CONVEYORS_CEILING` / `_FLOOR`: 12 / 4 (was 20 / 6) —
 *       same reasoning: a stand-in conveyor now has real rollers/pulleys/
 *       legs, just not spinning ones.
 *   Per-machine/per-conveyor group cost is unchanged by this task (measured
 *   separately, against the real kit, building one `create()`/`conveyor()`
 *   group and counting meshes before any merge): ~44 meshes/machine group on
 *   average across the 10 archetypes (the earlier pass's "~150 meshes/
 *   machine" was itself an unmeasured guess sourced from README prose, not
 *   this kit — the real number, measured this pass, is well under a third of
 *   that), ~10-15 (avg ~12.5) meshes/conveyor group.
 *   Draw-call estimate at the new numbers:
 *     - Ceiling (16 machines, 12 conveyors): 16*44=704 + 12*12.5=150 + ~130
 *       (far tier, fixed) ~= 984 draw calls.
 *     - Floor (4 machines, 4 conveyors): 4*44=176 + 4*12.5=50 + ~130 ~= 356
 *       draw calls.
 *   Both numbers sit comfortably under the one measured-safe reference point
 *   either of us has (`Model_3D/README.md`: "ten machines plus nine
 *   conveyors is roughly 1,500 meshes ... renders comfortably at 60fps"),
 *   with more headroom than the previous pass's estimate had — expected,
 *   since the detailed tier is smaller AND the real measured per-machine
 *   mesh count is lower than the guess that estimate used.
 *   `usePlantKit()` also now passes `shadows: false` to `createPlantMachines`
 *   (see its own comment) — the kit's construction site is this file's, so
 *   this is applied here rather than reported.
 * ---------------------------------------------------------------------------
 * Adaptive quality governor (`useAdaptiveDetailBudget`, below) — WHAT IT NOW
 * GOVERNS CHANGED: before this task, `maxDetailed*` traded off "does this
 * machine look real" against frame time, because the only alternative was a
 * box. Now the far tier always looks real (fixed ~130 draw call cost,
 * unaffected by these budgets), so `maxDetailed*` trades off ONLY "does this
 * nearby machine/conveyor visibly move" against frame time — a strictly
 * lower-stakes knob than before, which is why the ceiling/floor moved down
 * (see the budget re-derivation above). The governor's MECHANISM is
 * unchanged: neither of us can run a browser to measure real frame times, so
 * a fixed guess for maxDetailed* will be wrong on some hardware in either
 * direction. The governor samples actual per-frame delta time via R3F's
 * `useFrame`, keeps a rolling average over `GOVERNOR_WINDOW_FRAMES` (~1.5s at
 * 60fps — long enough that one GC pause or texture upload can't itself
 * trigger a step), and steps `maxDetailedMachines`/`maxDetailedConveyors`
 * down toward the floor when that average exceeds `GOVERNOR_STEP_DOWN_MS`,
 * or up toward the ceiling when it is comfortably under
 * `GOVERNOR_STEP_UP_MS`. Hysteresis is two-layered: (1) a dead zone between
 * `GOVERNOR_STEP_UP_MS` (15ms, ~67fps) and `GOVERNOR_STEP_DOWN_MS` (26ms,
 * ~38fps) straddling the `GOVERNOR_TARGET_FRAME_MS` (20ms, ~50fps) target,
 * wide enough that ordinary frame-time jitter around the target never
 * crosses either edge; (2) a `GOVERNOR_COOLDOWN_MS` (2s) minimum gap between
 * two steps in either direction, so even a rolling average that does cross a
 * threshold can only move the budget once every 2s and settles instead of
 * hunting. Each step moves both counts by a fixed
 * `GOVERNOR_MACHINE_STEP`/`GOVERNOR_CONVEYOR_STEP` (2 each, down from 4 — a
 * smaller ceiling/floor range means the old step-of-4 could jump from
 * ceiling to floor in a single step with little room left for hysteresis to
 * matter, so the step size shrank along with the range) and resets the
 * sample window, so the next decision is judged against the new budget, not
 * stale samples from the old one.
 * ---------------------------------------------------------------------------
 * Picking (item 6): KitMachinePool already resolves every kit mesh's
 * `e.object.userData.machineId` with `e.stopPropagation()` for the detailed
 * tier. The far tier (InstancedMesh) cannot carry per-mesh `userData` for
 * each instance, so PlantFarTier resolves `e.instanceId` against a stable
 * per-archetype `index -> machineId` array instead — functionally equivalent
 * (one id resolved per pick, propagation stopped) but via `instanceId`
 * rather than `userData`, since that is the only picking primitive
 * InstancedMesh exposes. Both tiers are wired to the same `onSelectMachine`/
 * `onOpenMachine`/`onHoverMachine` props here, so the caller does not need to
 * know which tier produced the id.
 * ---------------------------------------------------------------------------
 * StrictMode double-mount guard: the kit is created once via a lazily-
 * initialized ref (survives React 19 StrictMode's synchronous dev
 * mount->cleanup->mount effect replay) and disposed via a "delayed dispose,
 * cancelled by a synchronous remount" pattern — see `usePlantKit` below.
 *
 * `shadows: false`: this scene already carries a shadow map + frustum owned
 * by PlantSceneShell.tsx (not this file), a full outdoor site, AND an
 * ~900-instance far tier (see PlantFarTier.tsx) whose real merged geometry
 * already casts/receives shadows. The README's "above ~40 machines, pass
 * {shadows:false}" guidance is about the kit's OWN detailed-machine count,
 * which this file keeps well under 40 (new ceiling 16) — but the aggregate
 * shadow-casting load in this scene (detailed machines + the far tier's real
 * geometry + site geometry) is well past what the reference demo (10
 * machines, nothing else) ever cast shadows against. Every detailed-machine
 * shadow-caster is a real cost in the shadow pass regardless of whether the
 * *count* trigger in the README is met, so `shadows: false` is passed here
 * too, on the one construction site this file owns.
 */
import { THREE_WITH_MERGE } from "./threeWithMerge";

const GOVERNOR_TARGET_FRAME_MS = 20; // ~50fps target render budget
const GOVERNOR_STEP_DOWN_MS = 26; // step DOWN once the rolling avg is clearly worse than target (~38fps)
const GOVERNOR_STEP_UP_MS = 15; // step UP only once the rolling avg is clearly better than target (~67fps)
const GOVERNOR_WINDOW_FRAMES = 90; // rolling window, ~1.5s at 60fps
const GOVERNOR_COOLDOWN_MS = 2000; // min gap between two steps, either direction
const GOVERNOR_MACHINE_STEP = 2;
const GOVERNOR_CONVEYOR_STEP = 2;

const MAX_DETAILED_MACHINES_CEILING = 16;
const MAX_DETAILED_MACHINES_FLOOR = 4;
const MAX_DETAILED_CONVEYORS_CEILING = 12;
const MAX_DETAILED_CONVEYORS_FLOOR = 4;

// `THREE_WITH_MERGE` (imported from `./threeWithMerge.ts`, shared with
// PlantEnvironment.tsx -- same rationale: `plantMachinesKit.js`'s `merge()`
// helper — used by `fence()`, in turn used by `mixer`/`press`(x2)/`robot`/
// `charger` — only ever checks `T.BufferGeometryUtils.mergeBufferGeometries`
// (old r128-era name) or a bare `T.mergeBufferGeometries`, both absent on
// three 0.180's plain namespace (which only exports `mergeGeometries`), so
// without this it silently takes its one-mesh-per-geometry fallback for
// every fenced machine — ~20-30 extra draw calls per fence, no error, no
// visual difference to flag it.

/**
 * Adaptive detail-budget governor. See the header comment above for the
 * full rationale (target/step-down/step-up thresholds, rolling window,
 * cooldown). Returns the CURRENT live budgets; starts at the ceiling (the
 * "new defaults" from task 1) and only steps down if real frame time proves
 * that's too optimistic on this hardware, stepping back up if headroom
 * reappears (e.g. camera moves away from a dense zone).
 */
function useAdaptiveDetailBudget(
  machinesCeiling: number,
  machinesFloor: number,
  conveyorsCeiling: number,
  conveyorsFloor: number,
): { maxDetailedMachines: number; maxDetailedConveyors: number } {
  const [maxDetailedMachines, setMaxDetailedMachines] = useState(machinesCeiling);
  const [maxDetailedConveyors, setMaxDetailedConveyors] = useState(conveyorsCeiling);
  const samplesRef = useRef<number[]>([]);
  const lastStepAtRef = useRef(0);

  useFrame((_state, delta) => {
    const samples = samplesRef.current;
    samples.push(delta * 1000);
    if (samples.length > GOVERNOR_WINDOW_FRAMES) samples.shift();
    if (samples.length < GOVERNOR_WINDOW_FRAMES) return; // wait for a full window before judging

    const now = performance.now();
    if (now - lastStepAtRef.current < GOVERNOR_COOLDOWN_MS) return; // hysteresis: cooldown between steps

    const avgMs = samples.reduce((a, b) => a + b, 0) / samples.length;
    if (avgMs <= GOVERNOR_STEP_DOWN_MS && avgMs >= GOVERNOR_STEP_UP_MS) return; // inside the dead zone: no-op

    let stepped = false;
    if (avgMs > GOVERNOR_STEP_DOWN_MS) {
      setMaxDetailedMachines((n) => {
        const next = Math.max(machinesFloor, n - GOVERNOR_MACHINE_STEP);
        stepped = stepped || next !== n;
        return next;
      });
      setMaxDetailedConveyors((n) => {
        const next = Math.max(conveyorsFloor, n - GOVERNOR_CONVEYOR_STEP);
        stepped = stepped || next !== n;
        return next;
      });
    } else {
      setMaxDetailedMachines((n) => {
        const next = Math.min(machinesCeiling, n + GOVERNOR_MACHINE_STEP);
        stepped = stepped || next !== n;
        return next;
      });
      setMaxDetailedConveyors((n) => {
        const next = Math.min(conveyorsCeiling, n + GOVERNOR_CONVEYOR_STEP);
        stepped = stepped || next !== n;
        return next;
      });
    }
    if (stepped) {
      lastStepAtRef.current = now;
      samples.length = 0; // judge the next window against the new budget, not stale samples
    }
  });

  return { maxDetailedMachines, maxDetailedConveyors };
}
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { createPlantMachines } from "../../../../lib/vendor/plantMachinesKit.js";
import type { PlantMachinesKit } from "../../../../lib/vendor/plantMachinesKit.d.ts";
import { toKitStatus } from "../../../../lib/plantKit";
import type { PlantLayout } from "../../../../lib/plantLayout";
import KitMachinePool, { type KitMachineSlot } from "../KitMachinePool";
import { useKitTick } from "../KitMachine";
import PlantFarTier from "./PlantFarTier";
import PlantConveyors from "./PlantConveyors";

/**
 * Lazily creates ONE plant-machines kit for the component's lifetime and
 * disposes it exactly once on a genuine unmount.
 *
 * React 19 StrictMode replays effects synchronously in dev
 * (mount -> cleanup -> mount again) without the component ever leaving the
 * tree, so a naive `useEffect(() => () => kit.dispose(), [])` would dispose
 * the kit after the first synthetic cleanup and leave the second mount
 * holding a disposed kit. Guarded with a mount-count ref: cleanup defers the
 * actual `dispose()` call to a macrotask; if the effect re-mounts
 * synchronously first (StrictMode), the count is back above zero by the
 * time the deferred dispose runs, so it's skipped. A genuine unmount never
 * re-mounts, so the count stays at zero and dispose proceeds.
 */
function usePlantKit(): PlantMachinesKit {
  const kitRef = useRef<PlantMachinesKit | null>(null);
  if (!kitRef.current) {
    kitRef.current = createPlantMachines(THREE_WITH_MERGE, { beaconLights: false, shadows: false });
  }
  const mountCountRef = useRef(0);

  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      mountCountRef.current -= 1;
      setTimeout(() => {
        if (mountCountRef.current === 0 && kitRef.current) {
          kitRef.current.dispose();
          kitRef.current = null;
        }
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return kitRef.current;
}

function slotsFromLayout(layout: PlantLayout): KitMachineSlot[] {
  return layout.machines.map((m) => ({
    machineId: m.id,
    archetype: m.type,
    code: m.label,
    name: m.sub,
    status: m.userData.dbStatus,
    position: [m.x, 0, m.z],
    rotationY: m.rotationY,
  }));
}

export interface PlantMachinesProps {
  layout: PlantLayout;
  /** Ceiling for full-detail kit groups kept alive at once. The adaptive
   *  governor (see file header) starts here and steps down toward
   *  `minDetailedMachines` under measured frame-time pressure. See header
   *  for the draw-call estimate this default is based on. */
  maxDetailedMachines?: number;
  /** Floor the governor will not step below, even under sustained pressure. */
  minDetailedMachines?: number;
  /** Ceiling for full-detail conveyor groups kept alive at once (governed
   *  the same way as `maxDetailedMachines`). */
  maxDetailedConveyors?: number;
  /** Floor the governor will not step below for conveyors. */
  minDetailedConveyors?: number;
  /** Machine ids that must always render at full detail (selected/hovered/
   *  focused-line), regardless of camera distance. */
  pinnedMachineIds?: ReadonlySet<string> | readonly string[];
  onHoverMachine?: (machineId: string | null) => void;
  onSelectMachine?: (machineId: string) => void;
  onOpenMachine?: (machineId: string) => void;
}

export default function PlantMachines({
  layout,
  maxDetailedMachines = MAX_DETAILED_MACHINES_CEILING,
  minDetailedMachines = MAX_DETAILED_MACHINES_FLOOR,
  maxDetailedConveyors = MAX_DETAILED_CONVEYORS_CEILING,
  minDetailedConveyors = MAX_DETAILED_CONVEYORS_FLOOR,
  pinnedMachineIds,
  onHoverMachine,
  onSelectMachine,
  onOpenMachine,
}: PlantMachinesProps) {
  const kit = usePlantKit();
  useKitTick(kit);

  const { maxDetailedMachines: governedMaxMachines, maxDetailedConveyors: governedMaxConveyors } =
    useAdaptiveDetailBudget(maxDetailedMachines, minDetailedMachines, maxDetailedConveyors, minDetailedConveyors);

  const slots = useMemo(() => slotsFromLayout(layout), [layout]);
  const [activeIds, setActiveIds] = useState<ReadonlySet<string>>(() => new Set());

  return (
    <group>
      <KitMachinePool
        kit={kit}
        slots={slots}
        maxDetailed={governedMaxMachines}
        pinnedIds={pinnedMachineIds}
        onHover={onHoverMachine}
        onSelect={onSelectMachine}
        onOpen={onOpenMachine}
        onActiveChange={setActiveIds}
      />
      <PlantFarTier
        kit={kit}
        machines={layout.machines}
        activeIds={activeIds}
        onHover={onHoverMachine}
        onSelect={onSelectMachine}
        onOpen={onOpenMachine}
      />
      <PlantConveyors kit={kit} conveyors={layout.conveyors} maxDetailed={governedMaxConveyors} />
    </group>
  );
}

// toKitStatus is re-exported here only so callers that need to pre-map a
// status for pinning/highlighting logic don't have to import plantKit.ts
// directly for this one pure helper.
export { toKitStatus };
