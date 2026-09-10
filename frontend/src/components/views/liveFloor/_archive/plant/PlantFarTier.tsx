/**
 * PlantFarTier.tsx — real, merged/instanced machine geometry for every
 * machine NOT currently held at full detail by KitMachinePool.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS CHANGED (was: one coloured box per archetype): a single
 * `InstancedMesh` box per archetype (10 draw calls total, independent of
 * machine count) was a deliberate earlier performance decision — but it read
 * as coloured boxes at any zoom level except the ~24 machines KitMachinePool
 * held at full kit detail near the camera. The user's complaint ("zoom out
 * and I see boxes, not machines") is correct: shape fidelity was traded away
 * when it didn't need to be. Machine COUNT was never actually the expensive
 * part — a fixed, small vertex/draw-call budget IS, and that budget doesn't
 * grow with instance count either way (a box costs one draw call per
 * archetype; so does the real shape, once built as described below).
 *
 * THE FIX — build each archetype's real geometry ONCE, not per machine:
 *   1. `kit.create(archetype, ...)` builds one representative group per
 *      archetype (the same procedural geometry KitMachinePool uses for the
 *      near tier — same materials, same silhouette).
 *   2. `bakeAndMergeByMaterial` (lodInstancing.ts) walks that group, bakes
 *      each mesh's FULL ACCUMULATED WORLD MATRIX (relative to the group,
 *      via `root.updateMatrixWorld(true)` then `mesh.matrixWorld` — never
 *      `mesh.matrix` alone, which ignores intermediate sub-group offsets/
 *      rotations and scatters parts; see that file's header and
 *      `frontend/scratch` for a throwaway Node script that caught exactly
 *      this class of bug against a synthetic nested-group case before this
 *      was wired into R3F) into a CLONE of its geometry, then merges same-
 *      material clones into one geometry per material via three's
 *      `BufferGeometryUtils.mergeGeometries` (through the `threeWithMerge.ts`
 *      shim already required elsewhere in this folder for the SAME
 *      three-0.180-vs-r128-API-name reason).
 *   3. One `InstancedMesh` per (archetype, material) bucket is instanced
 *      once per machine of that archetype — real silhouette, not a box,
 *      genuinely independent of machine count (931 machines cost the exact
 *      same draw-call count as 1 would).
 *
 * MERGE FAILURE IS NOT SILENTLY DROPPED: `mergeGeometries` requires every
 * input geometry to agree on indexed-ness, and the kit mixes indexed
 * builtins (Cylinder/Sphere/Torus/TubeGeometry) with ExtrudeGeometry-based
 * rounded boxes — verified against the real vendored kit that this mismatch
 * actually happens for every one of the 10 archetypes. `bakeAndMergeByMaterial`
 * normalises to non-indexed first (fixes the overwhelming majority), and if a
 * merge still fails for a genuinely incompatible attribute set, falls back to
 * one bucket per source mesh rather than dropping the geometry — a machine
 * part vanishing from the far tier would be a much worse regression than a
 * few extra draw calls for the rare archetype that hits this path.
 *
 * REAL ARITHMETIC (measured against the actual vendored kit, not guessed —
 * see the verification script run during this change; not committed, it was
 * a throwaway `node` check, output captured in the PR description /
 * conversation instead): building all 10 archetypes and running the exact
 * bake+normalize+merge path above yields 438 total source meshes across the
 * 10 templates, collapsing to 118 merged draw-call buckets total (furnace 12,
 * mixer 11, coater 12, oven 10, press 11, robot 13, cell 12, filler 12,
 * charger 12, packer 13 — driven by how many DISTINCT materials each
 * archetype's meshes use, not mesh count). That is the fixed, one-time,
 * per-session cost: it does NOT change whether 1 or 931 machines exist. Per
 * machine, only one 4x4 instance-matrix write (and, for the one beacon
 * bucket, one instance-colour write) is added — no new draw call.
 *   Compare: the old box tier was 10 draw calls (1/archetype) forever, at
 *   the cost of looking like boxes. The impossible ceiling this replaces
 *   (full per-machine kit geometry, no sharing) would be roughly
 *   931 machines x ~44 meshes/machine (the measured per-archetype average
 *   above) ~= ~41,000 draw calls — not quite the "~140,000" figure floated
 *   before this was measured (that guess assumed ~150 meshes/machine, this
 *   file's own measured average is ~44), but still obviously unrenderable.
 *   118 real draw calls, independent of machine count, is the number that
 *   actually shipped.
 *
 * Never-both/never-neither guarantee (UNCHANGED from the box-tier version):
 * every PlacedMachine is a member of exactly one archetype's fixed-size
 * InstancedMesh set (one array index per bucket, shared across every
 * material-bucket of that archetype, assigned once at mount from the stable
 * layout order). A machine currently in the detailed pool's active set gets
 * every one of its bucket instances collapsed to a zero-scale (degenerate)
 * transform every time `activeIds` changes — zero-scale geometry has zero
 * triangle area, so it neither renders nor raycasts, and every machine NOT in
 * `activeIds` always has a live, full-scale instance in every one of its
 * archetype's buckets. There is no third state.
 *
 * Per-instance status colour (item 4): the kit colours status via the
 * control cabinet's beacon mesh (named 'beacon' in plantMachinesKit.js's
 * `cabinet()`), which the kit itself recolours by swapping the beacon's
 * MATERIAL (`setStatus()`). That doesn't work for an InstancedMesh (one
 * shared material for every instance in the mesh) — so the beacon mesh is
 * bucketed separately (`isBeacon`, see lodInstancing.ts) under one dedicated,
 * shared, instance-colourable material, and this component drives its real
 * DB status via `InstancedMesh.setColorAt` (see `createBeaconMaterial`'s
 * doc comment for why plain `setColorAt` alone is not enough — the material
 * also needs an `onBeforeCompile` patch so instance colour multiplies
 * EMISSIVE too, not just the base/diffuse colour three patches by default).
 *
 * Failure modes (explicit, not hidden):
 *  - `activeIds` and this component's matrix rebuild must land in the same
 *    pre-paint commit as KitMachinePool's own group mount/unmount — both are
 *    driven by the SAME `onActiveChange` callback from the SAME
 *    `useLayoutEffect` tick in KitMachinePool, and this component's matrix
 *    rebuild is likewise a `useLayoutEffect`, not a passive `useEffect`. If a
 *    future change moves either side to a plain `useEffect`, a single-frame
 *    flash of unit-scale geometry at the origin becomes possible again. Keep
 *    both consumers of `onActiveChange` synchronous/layout-effect-driven.
 *  - Per-instance beacon colour updates (on a live DB status change for a
 *    machine that is currently far-tier, not pooled) are applied on every
 *    render of this component, not via a dedicated per-machine watcher —
 *    acceptable because this component already re-renders whenever
 *    `machines` or `activeIds` changes; a far machine's status updates
 *    within one such tick, not instantly.
 *  - InstancedMesh raycasting is O(instance count) per bucket per pointer
 *    move; with ~900 far instances spread over ~118 buckets this is fine,
 *    but if machine count grows another order of magnitude, hover-picking on
 *    the far tier should drop to click/dblclick only.
 *  - The archetype templates (and the shared beacon material) are built once
 *    per mount via `useArchetypeTemplates`, guarded with the same
 *    "mount-count ref + deferred dispose, cancelled by a synchronous
 *    remount" pattern `PlantMachines.tsx`'s `usePlantKit` already uses for
 *    React 19 StrictMode's dev-only synchronous mount->cleanup->mount replay
 *    — a naive `useEffect` cleanup would dispose the templates after the
 *    first synthetic unmount and leave the real mount rendering disposed
 *    geometry.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { toKitStatus } from "../../../../lib/plantKit";
import type { PlacedMachine } from "../../../../lib/plantLayout";
import { MACHINE_ARCHETYPES, type Archetype } from "../../../../lib/plantArchetypes";
import type { PlantMachinesKit } from "../../../../lib/vendor/plantMachinesKit.d.ts";
import { bakeAndMergeByMaterial, createBeaconMaterial, type BakedBucket } from "./lodInstancing";

export interface PlantFarTierProps {
  kit: PlantMachinesKit;
  machines: PlacedMachine[];
  /** Machine ids currently rendered at full detail elsewhere (KitMachinePool). */
  activeIds: ReadonlySet<string>;
  onHover?: (machineId: string | null) => void;
  onSelect?: (machineId: string) => void;
  onOpen?: (machineId: string) => void;
}

interface ArchetypeBucket {
  archetype: Archetype;
  ids: string[]; // index -> machineId, stable for the mesh's lifetime
  entries: PlacedMachine[]; // parallel to ids
}

const ZERO_SCALE_MATRIX = new THREE.Matrix4().makeScale(0, 0, 0);
const IDENTITY_SCALE = new THREE.Vector3(1, 1, 1);

function buildBuckets(machines: PlacedMachine[]): ArchetypeBucket[] {
  const byArchetype = new Map<Archetype, PlacedMachine[]>();
  for (const m of machines) {
    const list = byArchetype.get(m.type);
    if (list) list.push(m);
    else byArchetype.set(m.type, [m]);
  }
  return [...byArchetype.entries()].map(([archetype, entries]) => ({
    archetype,
    ids: entries.map((e) => e.id),
    entries,
  }));
}

/**
 * Builds the 10 archetype templates (real kit geometry, baked + merged by
 * material) ONCE for this component's lifetime, and disposes them exactly
 * once on a genuine unmount — mirrors `PlantMachines.tsx`'s `usePlantKit`
 * StrictMode-safe pattern (see that file's own doc comment for the full
 * rationale: a synchronous dev-mode mount->cleanup->mount replay must not
 * dispose geometry the remounted component is still rendering).
 */
function useArchetypeTemplates(kit: PlantMachinesKit): {
  templates: Map<Archetype, BakedBucket[]>;
} {
  const stateRef = useRef<{ templates: Map<Archetype, BakedBucket[]>; beaconMaterial: THREE.Material } | null>(null);
  if (!stateRef.current) {
    const beaconMaterial = createBeaconMaterial();
    const templates = new Map<Archetype, BakedBucket[]>();
    for (const archetype of MACHINE_ARCHETYPES) {
      const root = kit.create(archetype, {
        id: `__far_template__${archetype}`,
        status: "run",
        cabinet: true,
        sign: false, // per-machine label text can't be baked into shared geometry
      });
      root.updateMatrixWorld(true); // populate matrixWorld for every nested mesh BEFORE baking
      templates.set(archetype, bakeAndMergeByMaterial(root, beaconMaterial));
      kit.release(root); // frees the throwaway template's own non-shared resources (its animation-registry entries included)
    }
    stateRef.current = { templates, beaconMaterial };
  }

  const mountCountRef = useRef(0);
  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      mountCountRef.current -= 1;
      const captured = stateRef.current;
      setTimeout(() => {
        if (mountCountRef.current === 0 && stateRef.current === captured && captured) {
          for (const buckets of captured.templates.values()) {
            for (const b of buckets) b.geometry.dispose();
          }
          captured.beaconMaterial.dispose();
          stateRef.current = null;
        }
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return stateRef.current;
}

function ArchetypeInstances({
  kit,
  archetypeBuckets,
  bucket,
  activeIds,
  onHover,
  onSelect,
  onOpen,
}: {
  kit: PlantMachinesKit;
  archetypeBuckets: BakedBucket[];
  bucket: ArchetypeBucket;
  activeIds: ReadonlySet<string>;
  onHover?: (machineId: string | null) => void;
  onSelect?: (machineId: string) => void;
  onOpen?: (machineId: string) => void;
}) {
  const meshRefs = useRef<Array<THREE.InstancedMesh | null>>([]);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Rebuild every instance's transform (+ colour, for the beacon bucket only)
  // whenever the active set changes (machines entering/leaving the detailed
  // pool) — see the never-both/never-neither guarantee in the file header.
  // MUST be a useLayoutEffect, not a passive useEffect — see file header.
  useLayoutEffect(() => {
    for (let bi = 0; bi < archetypeBuckets.length; bi++) {
      const mesh = meshRefs.current[bi];
      if (!mesh) continue;
      const isBeacon = archetypeBuckets[bi]!.isBeacon;
      for (let i = 0; i < bucket.entries.length; i++) {
        const m = bucket.entries[i]!;
        if (activeIds.has(m.id)) {
          mesh.setMatrixAt(i, ZERO_SCALE_MATRIX);
        } else {
          // Real baked geometry already has the archetype's true footprint —
          // unlike the old box stand-in, no per-machine width/height/depth
          // scale is needed, only placement (position + yaw).
          matrix.compose(
            new THREE.Vector3(m.x, 0, m.z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, m.rotationY, 0)),
            IDENTITY_SCALE,
          );
          mesh.setMatrixAt(i, matrix);
        }
        if (isBeacon) {
          const kitStatus = toKitStatus(m.userData.dbStatus);
          color.setHex(kit.statusColors[kitStatus] ?? 0x64748b);
          mesh.setColorAt(i, color);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (isBeacon && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [archetypeBuckets, bucket, activeIds, kit, matrix, color]);

  const resolveId = (event: ThreeEvent<PointerEvent | MouseEvent>): string | undefined => {
    const instanceId = event.instanceId;
    if (instanceId === undefined) return undefined;
    return bucket.ids[instanceId];
  };

  return (
    <>
      {archetypeBuckets.map((b, bi) => (
        <instancedMesh
          key={bi}
          ref={(el) => {
            meshRefs.current[bi] = el;
          }}
          args={[b.geometry, b.material, bucket.entries.length]}
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            const id = resolveId(e);
            if (id) onHover?.(id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover?.(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            const id = resolveId(e);
            if (id) onSelect?.(id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            const id = resolveId(e);
            if (id) onOpen?.(id);
          }}
        />
      ))}
    </>
  );
}

/** Renders the real, merged/instanced archetype geometry for every machine
 *  that is not currently in `activeIds` (the detailed pool's active set). */
export default function PlantFarTier({ kit, machines, activeIds, onHover, onSelect, onOpen }: PlantFarTierProps) {
  const buckets = useMemo(() => buildBuckets(machines), [machines]);
  const { templates } = useArchetypeTemplates(kit);

  return (
    <group>
      {buckets.map((bucket) => (
        <ArchetypeInstances
          key={bucket.archetype}
          kit={kit}
          archetypeBuckets={templates.get(bucket.archetype) ?? []}
          bucket={bucket}
          activeIds={activeIds}
          onHover={onHover}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </group>
  );
}
