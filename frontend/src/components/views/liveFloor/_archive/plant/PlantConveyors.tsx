/**
 * PlantConveyors.tsx — full-detail kit conveyors (`kit.conveyor` + `kit.workpieces`)
 * for the `maxDetailed` segments nearest the camera, and real merged/instanced
 * conveyor geometry (not a flat box) for every other segment.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS CHANGED (was: one flat box InstancedMesh for every non-detailed
 * segment): the same reasoning that applied to `PlantFarTier.tsx`'s machine
 * boxes applies here — a conveyor's SHAPE (belt + rails + rollers + pulleys +
 * legs) doesn't need to cost more than a flat box once it is built ONCE per
 * distinct shape and instanced, rather than once per segment. The only thing
 * that actually varies a conveyor's real geometry is its LENGTH (width is a
 * constant 1.5m for every segment `plantLayout.ts` produces; rollers every
 * .55m, support legs every 3m, and the belt texture's UV repeat all depend on
 * length). So this component quantises each segment's length to the nearest
 * 5cm (`LENGTH_BUCKET_STEP`) and builds ONE real kit conveyor per distinct
 * quantised length, baked + merged by material exactly like
 * `PlantFarTier.tsx`'s archetype templates (see `lodInstancing.ts`).
 *
 * MEASURED against the real vendored kit (`kit.conveyor(len, 1.5)` at
 * len=1.75/3/6, the same bake+normalize+merge path this file uses): each
 * length bucket merges down to exactly 4 draw-call buckets (belt tread,
 * side-rail body, steel rollers/pulleys — the belt material is unique per
 * length build since its canvas-texture UV repeat is baked to that length, so
 * it can never be shared across buckets of different length; the others
 * reuse the kit's own shared `M.steel`/`M.body` materials across every
 * length). `plantLayout.ts`'s row-packing path (its dominant source of
 * conveyor segments) produces a CONSTANT gap of exactly `MACHINE_PITCH_GAP`
 * (1.75m) between every pair of adjacent machines in a row (see that file's
 * `cursorX += span + MACHINE_PITCH_GAP` accumulation — the gap between
 * consecutive machines' facing edges is that same constant every time), so
 * in practice this collapses to a small handful of length buckets, not one
 * per segment — 4 draw calls x (a handful of buckets) for potentially
 * hundreds of far-tier segments, independent of segment count past that.
 *
 * Never-both/never-neither: unchanged from the box-stand-in version — a
 * conveyor outside the `maxDetailed` nearest set gets a live real-geometry
 * instance across every one of its length-bucket's material buckets; every
 * conveyor IN the detailed set gets a zero-scale (degenerate) instance in
 * all of them instead. `evaluate()` writes BOTH the detailed-tier group
 * mount/unmount AND every stand-in InstancedMesh's matrices, imperatively,
 * in the same synchronous pass — deliberately NOT routed through React state
 * for the stand-in tier (an earlier draft of this file did that, which would
 * have reintroduced exactly the "one paint at unit-scale/origin before the
 * real transforms land" race the original box-based version's own header
 * warned against, since a `setState` from inside `useFrame` is not
 * guaranteed to flush synchronously before the next paint). `evaluate()`
 * itself runs from a `useLayoutEffect` on mount (synchronous, pre-paint) and
 * directly from `useFrame` afterward (already inside the render loop, so
 * "same frame" is automatic) — never a passive `useEffect`.
 *
 * Failure mode: a conveyor outside `maxDetailed` briefly shows only the real
 * static stand-in (no belt tread/roller/pulley motion, no workpieces sliding
 * along it) until the next evaluation tick promotes it to the animated
 * detailed tier — not "no belt at all" (the old box-based failure mode this
 * replaced), and now not "a flat box" either.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ConveyorSegment } from "../../../../lib/plantLayout";
import type { PlantMachinesKit } from "../../../../lib/vendor/plantMachinesKit.d.ts";
import { bakeAndMergeByMaterial, type BakedBucket } from "./lodInstancing";

export interface PlantConveyorsProps {
  kit: PlantMachinesKit;
  conveyors: ConveyorSegment[];
  /** Max number of full-detail conveyor groups kept alive at once. Every
   *  other conveyor renders as real, merged/instanced static geometry
   *  instead (see header). */
  maxDetailed?: number;
}

const RE_EVAL_INTERVAL_MS = 200;
const CAMERA_MOVE_THRESHOLD = 0.75;
const ZERO_SCALE_MATRIX = new THREE.Matrix4().makeScale(0, 0, 0);
const IDENTITY_SCALE = new THREE.Vector3(1, 1, 1);
/** Quantisation step (metres) for grouping segments into shared-template
 *  length buckets — see file header for why this collapses to a handful of
 *  distinct buckets in practice rather than one per segment. */
const LENGTH_BUCKET_STEP = 0.05;

function quantizeLength(len: number): number {
  return Math.round(len / LENGTH_BUCKET_STEP) * LENGTH_BUCKET_STEP;
}

interface LengthBucketGroup {
  /** Quantised length + width this bucket's template was built at. */
  key: string;
  bucketLen: number;
  bucketWidth: number;
  ids: number[]; // index -> conveyor index in `conveyors`, stable for this bucket's InstancedMeshes
  entries: ConveyorSegment[]; // parallel to ids
}

function buildLengthGroups(conveyors: ConveyorSegment[]): LengthBucketGroup[] {
  const byKey = new Map<string, LengthBucketGroup>();
  for (let i = 0; i < conveyors.length; i++) {
    const seg = conveyors[i]!;
    const bucketLen = Math.max(0.5, quantizeLength(seg.len));
    const bucketWidth = seg.width || 1.5;
    const key = `${bucketLen}|${bucketWidth}`;
    let group = byKey.get(key);
    if (!group) {
      group = { key, bucketLen, bucketWidth, ids: [], entries: [] };
      byKey.set(key, group);
    }
    group.ids.push(i);
    group.entries.push(seg);
  }
  return [...byKey.values()];
}

/**
 * Builds one real kit conveyor template per distinct (quantised length,
 * width) pair found in `conveyors`, baked + merged by material, ONCE per
 * `conveyors` identity change (the layout is effectively static per
 * session) — mirrors `PlantFarTier.tsx`'s `useArchetypeTemplates`.
 */
function useLengthTemplates(kit: PlantMachinesKit, groups: LengthBucketGroup[]): Map<string, BakedBucket[]> {
  const templatesRef = useRef<Map<string, BakedBucket[]>>(new Map());
  const groupsKeyRef = useRef<string>("");

  const groupsKey = groups.map((g) => g.key).join(",");
  if (groupsKeyRef.current !== groupsKey) {
    for (const buckets of templatesRef.current.values()) {
      for (const b of buckets) b.geometry.dispose();
    }
    const next = new Map<string, BakedBucket[]>();
    for (const group of groups) {
      const conv = kit.conveyor(group.bucketLen, group.bucketWidth);
      conv.updateMatrixWorld(true);
      next.set(group.key, bakeAndMergeByMaterial(conv));
      kit.release(conv);
    }
    templatesRef.current = next;
    groupsKeyRef.current = groupsKey;
  }

  useEffect(() => {
    return () => {
      for (const buckets of templatesRef.current.values()) {
        for (const b of buckets) b.geometry.dispose();
      }
      templatesRef.current = new Map();
    };
  }, []);

  return templatesRef.current;
}

interface StandInSlot {
  group: LengthBucketGroup;
  bucket: BakedBucket;
}

export default function PlantConveyors({ kit, conveyors, maxDetailed = 20 }: PlantConveyorsProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const activeRef = useRef<Map<number, THREE.Group>>(new Map());
  const [, forceRender] = useState(0);
  const lastEvalRef = useRef(0);
  const lastCameraPosRef = useRef(new THREE.Vector3());

  const lengthGroups = useMemo(() => buildLengthGroups(conveyors), [conveyors]);
  const lengthTemplates = useLengthTemplates(kit, lengthGroups);

  // Flattened (group, materialBucket) render slots — one <instancedMesh> per
  // slot. Order is stable across renders as long as `lengthGroups` /
  // `lengthTemplates` don't change (both keyed/ordered off `conveyors`,
  // effectively static per session), so `standInRefs`'s index assignment
  // below stays valid without needing per-slot identity tracking.
  const standInSlots = useMemo<StandInSlot[]>(() => {
    const slots: StandInSlot[] = [];
    for (const group of lengthGroups) {
      for (const bucket of lengthTemplates.get(group.key) ?? []) slots.push({ group, bucket });
    }
    return slots;
  }, [lengthGroups, lengthTemplates]);
  const standInRefs = useRef<Array<THREE.InstancedMesh | null>>([]);
  const scratchMatrix = useMemo(() => new THREE.Matrix4(), []);

  const positions = useMemo(() => conveyors.map((c) => new THREE.Vector3(c.x, 0, c.z)), [conveyors]);

  const evaluate = () => {
    const camPos = camera.position;
    const ranked = positions
      .map((p, i) => ({ i, dist: camPos.distanceTo(p) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, maxDetailed);
    const desired = new Set(ranked.map((r) => r.i));

    const active = activeRef.current;
    const group = groupRef.current;
    let changed = false;

    for (const [idx, g] of active) {
      if (desired.has(idx)) continue;
      group?.remove(g);
      kit.release(g);
      active.delete(idx);
      changed = true;
    }

    for (const idx of desired) {
      if (active.has(idx)) continue;
      const seg = conveyors[idx]!;
      const conv = kit.conveyor(seg.len, seg.width);
      conv.position.set(seg.x, 0, seg.z);
      conv.rotation.y = (seg.rot * Math.PI) / 180;
      if (seg.parts > 0) kit.workpieces(conv, seg.parts);
      group?.add(conv);
      active.set(idx, conv);
      changed = true;
    }

    // Stand-in tier: every conveyor NOT in `desired` gets a live real-geometry
    // instance across all of its length-bucket's material buckets; every
    // conveyor IN `desired` gets a zero-scale (degenerate) instance instead —
    // written directly here, imperatively, in the same pass as the detailed-
    // tier mutation above (see file header for why this must not go through
    // React state).
    for (let si = 0; si < standInSlots.length; si++) {
      const mesh = standInRefs.current[si];
      if (!mesh) continue;
      const { group: bucketGroup } = standInSlots[si]!;
      for (let i = 0; i < bucketGroup.entries.length; i++) {
        const convIdx = bucketGroup.ids[i]!;
        if (desired.has(convIdx)) {
          mesh.setMatrixAt(i, ZERO_SCALE_MATRIX);
        } else {
          const seg = bucketGroup.entries[i]!;
          scratchMatrix.compose(
            new THREE.Vector3(seg.x, 0, seg.z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (seg.rot * Math.PI) / 180, 0)),
            IDENTITY_SCALE,
          );
          mesh.setMatrixAt(i, scratchMatrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }

    if (changed) forceRender((n) => n + 1);
  };

  useLayoutEffect(() => {
    evaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conveyors, maxDetailed, kit, standInSlots]);

  useFrame(() => {
    const now = performance.now();
    const moved = camera.position.distanceTo(lastCameraPosRef.current);
    if (now - lastEvalRef.current < RE_EVAL_INTERVAL_MS && moved < CAMERA_MOVE_THRESHOLD) return;
    lastEvalRef.current = now;
    lastCameraPosRef.current.copy(camera.position);
    evaluate();
  });

  useEffect(() => {
    return () => {
      const group = groupRef.current;
      for (const g of activeRef.current.values()) {
        group?.remove(g);
        kit.release(g);
      }
      activeRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group ref={groupRef}>
      {standInSlots.map((slot, si) => (
        <instancedMesh
          key={si}
          ref={(el) => {
            standInRefs.current[si] = el;
          }}
          args={[slot.bucket.geometry, slot.bucket.material, slot.group.entries.length]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
