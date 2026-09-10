import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { toKitStatus } from "../../../lib/plantKit";
import type {
  PlantArchetype,
  PlantMachinesKit,
} from "../../../lib/vendor/plantMachinesKit.d.ts";
import type { MachineStatus } from "../../../types";

/** One machine slot the pool can render at full detail. */
export interface KitMachineSlot {
  machineId: string;
  archetype: PlantArchetype;
  code?: string;
  name?: string;
  status: MachineStatus;
  position: [number, number, number];
  rotationY: number;
}

export interface KitMachinePoolProps {
  kit: PlantMachinesKit;
  slots: KitMachineSlot[];
  /** Max number of full-detail groups kept alive at once. Default 32. */
  maxDetailed?: number;
  /** Machine ids that must always be detailed regardless of distance/frustum
   *  (hovered, selected, every machine in a focused line/section). */
  pinnedIds?: ReadonlySet<string> | readonly string[];
  onHover?: (machineId: string | null) => void;
  onSelect?: (machineId: string) => void;
  /** Fired on double-click, mirroring the instanced tier's select-vs-open split. */
  onOpen?: (machineId: string) => void;
  /**
   * Fired whenever the pool's authoritative active set actually changes
   * (never on every evaluation tick, only on a real add/remove). Consumers
   * should use this instead of re-deriving the same nearest/frustum/pinned
   * set themselves.
   */
  onActiveChange?: (activeIds: ReadonlySet<string>) => void;
}

/** Internal bookkeeping for one live (mounted) machine group. */
interface ActiveEntry {
  machineId: string;
  archetype: PlantArchetype;
  group: THREE.Group;
}

const RE_EVAL_INTERVAL_MS = 200;
const CAMERA_MOVE_THRESHOLD = 0.75; // metres — re-evaluate sooner if the camera moved a lot
/**
 * Per-archetype free-list cap, as a multiple of `maxDetailed`. Free-listed
 * groups aren't visible, but they still sit in the kit's tick-driven animation
 * registries (spin/swing/pulse) until released, and hold their own geometry/
 * material until then too — so the list can't be allowed to grow with session
 * history the way the un-bounded original did. A small multiple of the visible
 * pool size comfortably covers "the same archetypes keep coming back into
 * view" without accumulating groups from every archetype the tour has ever
 * passed near.
 */
const FREE_LIST_CAP_MULTIPLIER = 2;

/**
 * Marks (or replaces) the signage plaque child of a kit-built group so a
 * reused group can be re-labelled for a different machine without rebuilding
 * the rest of its geometry. Kit-internal convention: `create()` adds the
 * cabinet first (if enabled), then the sign gantry last (if `label` given),
 * so the sign is reliably the LAST child right after create() returns.
 */
const SIGN_MARKER = "__kitSign";
const SIGN_LABEL_KEY = "__kitSignLabel";
const SIGN_SUB_KEY = "__kitSignSub";

function tagInitialSign(kit: PlantMachinesKit, group: THREE.Group, hadLabel: boolean, label?: string, sub?: string): void {
  void kit;
  group.userData[SIGN_LABEL_KEY] = hadLabel ? label : undefined;
  group.userData[SIGN_SUB_KEY] = hadLabel ? sub : undefined;
  if (!hadLabel) return;
  const last = group.children[group.children.length - 1];
  if (last) last.userData[SIGN_MARKER] = true;
}

function restyleSign(kit: PlantMachinesKit, group: THREE.Group, label?: string, sub?: string): void {
  // A reused group often gets a different machine, but not always — skip
  // rebuilding (and thus re-allocating a CanvasTexture + geometry + material)
  // when the label text hasn't actually changed.
  const prevLabel = group.userData[SIGN_LABEL_KEY] as string | undefined;
  const prevSub = group.userData[SIGN_SUB_KEY] as string | undefined;
  if (label === prevLabel && (sub ?? "") === (prevSub ?? "")) return;

  const old = group.children.find((c) => c.userData[SIGN_MARKER]);
  if (old) {
    group.remove(old);
    // Permanently discarded — free this specific plaque's CanvasTexture,
    // PlaneGeometry and material now instead of waiting for kit-wide dispose().
    kit.release(old);
  }
  group.userData[SIGN_LABEL_KEY] = label;
  group.userData[SIGN_SUB_KEY] = sub;
  if (!label) return;
  const footprint = (group.userData.footprint as [number, number] | undefined) ?? [6, 5];
  const signGroup = kit.parts.sign(label, sub ?? "");
  signGroup.position.set(0, 0, footprint[1] / 2 + 1.4);
  signGroup.userData[SIGN_MARKER] = true;
  group.add(signGroup);
}

/** Build a brand-new full-detail group for a slot. */
function buildGroup(kit: PlantMachinesKit, slot: KitMachineSlot): THREE.Group {
  const hasLabel = Boolean(slot.name);
  const group = kit.create(slot.archetype, {
    id: slot.machineId,
    label: slot.name,
    sub: slot.code,
    status: toKitStatus(slot.status),
    sign: hasLabel,
  });
  tagInitialSign(kit, group, hasLabel, slot.name, slot.code);
  return group;
}

/** Re-key a reused (previously freed) group for a different slot. */
function rekeyGroup(kit: PlantMachinesKit, group: THREE.Group, slot: KitMachineSlot): void {
  group.position.set(slot.position[0], slot.position[1], slot.position[2]);
  group.rotation.set(0, slot.rotationY, 0);
  group.userData.machineId = slot.machineId;
  group.userData.id = slot.machineId;
  group.traverse((o) => {
    o.userData.machineId = slot.machineId;
  });
  kit.setStatus(group, toKitStatus(slot.status));
  restyleSign(kit, group, slot.name, slot.code);
}

/**
 * LOD pool for kit machines: keeps at most `maxDetailed` full-detail
 * THREE groups alive at once — the ones nearest the camera and inside the
 * frustum, plus everything in `pinnedIds`. Groups are reused via a per-archetype
 * free list (LRU: most-recently-freed group is reused first) instead of being
 * rebuilt from scratch, so geometry/material churn stays flat as the visible
 * set changes. Re-evaluated on a throttled cadence (every ~200ms, or sooner if
 * the camera moved more than ~0.75m), never every frame.
 *
 * Free lists are capped per archetype (`FREE_LIST_CAP_MULTIPLIER * maxDetailed`)
 * so a long session doesn't accumulate every archetype it has ever built —
 * anything evicted past the cap, and every group left over on unmount, is
 * fully released via `kit.release(group)` (stops it being animated by
 * `kit.tick()` and frees its non-shared geometry/material/texture).
 */
export default function KitMachinePool({
  kit,
  slots,
  maxDetailed = 32,
  pinnedIds,
  onHover,
  onSelect,
  onOpen,
  onActiveChange,
}: KitMachinePoolProps) {
  const { camera } = useThree();

  const slotsById = useMemo(() => {
    const m = new Map<string, KitMachineSlot>();
    for (const s of slots) m.set(s.machineId, s);
    return m;
  }, [slots]);

  const freeListsRef = useRef<Map<PlantArchetype, THREE.Group[]>>(new Map());
  const activeRef = useRef<Map<string, ActiveEntry>>(new Map());
  const [activeEntries, setActiveEntries] = useState<ActiveEntry[]>([]);
  /** Last status applied via kit.setStatus() per machineId — lets us detect a
   *  status change on a machine that never left the active set. */
  const lastStatusRef = useRef<Map<string, MachineStatus>>(new Map());
  /** Last set of ids reported via onActiveChange, to only fire on real change. */
  const lastActiveIdsRef = useRef<ReadonlySet<string>>(new Set());

  const lastEvalRef = useRef(0);
  const lastCameraPosRef = useRef(new THREE.Vector3());
  const frustumRef = useRef(new THREE.Frustum());
  const projScratchRef = useRef(new THREE.Matrix4());

  const pinnedSet = useMemo(() => new Set(pinnedIds ?? []), [pinnedIds]);

  const evaluate = () => {
    const frustum = frustumRef.current;
    projScratchRef.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScratchRef.current);

    const camPos = camera.position;
    const point = new THREE.Vector3();

    const pinned: string[] = [];
    const candidates: { id: string; dist: number }[] = [];
    for (const slot of slots) {
      point.set(slot.position[0], slot.position[1], slot.position[2]);
      if (pinnedSet.has(slot.machineId)) {
        pinned.push(slot.machineId);
        continue;
      }
      if (!frustum.containsPoint(point)) continue;
      candidates.push({ id: slot.machineId, dist: camPos.distanceTo(point) });
    }
    candidates.sort((a, b) => a.dist - b.dist);

    const desired = new Set<string>(pinned);
    for (const c of candidates) {
      if (desired.size >= maxDetailed) break;
      desired.add(c.id);
    }

    const active = activeRef.current;
    const freeLists = freeListsRef.current;

    // Release machines no longer desired back to their archetype's free list.
    for (const [machineId, entry] of active) {
      if (desired.has(machineId)) continue;
      entry.group.parent?.remove(entry.group);
      const list = freeLists.get(entry.archetype) ?? [];
      list.push(entry.group);
      freeLists.set(entry.archetype, list);
      active.delete(machineId);
      lastStatusRef.current.delete(machineId);
    }

    // Trim each archetype's free list back to a small multiple of maxDetailed:
    // fully destroy (kit.release) anything evicted beyond the cap instead of
    // letting parked-but-never-reused groups accumulate for the whole session.
    // Evict oldest-first (index 0) — the list is reused LRU (freshest, at the
    // end, popped first), so the newest entries are the most likely to be
    // reused soon and are the ones worth keeping.
    const freeListCap = Math.max(4, maxDetailed * FREE_LIST_CAP_MULTIPLIER);
    for (const list of freeLists.values()) {
      while (list.length > freeListCap) {
        const stale = list.shift();
        if (stale) kit.release(stale);
      }
    }

    // Fill in newly desired machines (reusing a free group of the same
    // archetype when available — LRU: pop the most recently freed), and
    // refresh the status of machines that were ALREADY active: a machine
    // that never leaves the active set (pinned/selected/always-near) must
    // still pick up a live status change without being rebuilt or remounted.
    for (const machineId of desired) {
      const slot = slotsById.get(machineId);
      if (!slot) continue;

      const existing = active.get(machineId);
      if (existing) {
        if (lastStatusRef.current.get(machineId) !== slot.status) {
          kit.setStatus(existing.group, toKitStatus(slot.status));
          lastStatusRef.current.set(machineId, slot.status);
        }
        continue;
      }

      const list = freeLists.get(slot.archetype);
      const reused = list?.pop();
      const group = reused ?? buildGroup(kit, slot);
      if (reused) rekeyGroup(kit, group, slot);
      active.set(machineId, { machineId, archetype: slot.archetype, group });
      lastStatusRef.current.set(machineId, slot.status);
    }

    setActiveEntries(Array.from(active.values()));

    // Only notify the owner when the active set actually changed.
    if (onActiveChange) {
      const prev = lastActiveIdsRef.current;
      const changed = prev.size !== desired.size || [...desired].some((id) => !prev.has(id));
      if (changed) {
        lastActiveIdsRef.current = desired;
        onActiveChange(desired);
      }
    }
  };

  // Re-evaluate whenever the slot list, pool size, or pinned set changes.
  // useLayoutEffect (not useEffect): onActiveChange must propagate to the
  // scene's far-tier suppression BEFORE paint, so the kit group and the
  // far-tier instanced copy of a machine are never both visible in the same
  // committed frame on mount / on every hover / on every select.
  useLayoutEffect(() => {
    evaluate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, maxDetailed, pinnedSet, kit]);

  useFrame(() => {
    const now = performance.now();
    const moved = camera.position.distanceTo(lastCameraPosRef.current);
    if (now - lastEvalRef.current < RE_EVAL_INTERVAL_MS && moved < CAMERA_MOVE_THRESHOLD) return;
    lastEvalRef.current = now;
    lastCameraPosRef.current.copy(camera.position);
    evaluate();
  });

  // Detach AND fully release every group (active + free-listed) when the pool
  // itself unmounts — every group here is permanently discarded (the pool is
  // gone, nothing will ever reuse them), so this must release like any other
  // permanent eviction (item 1/3), not just detach. kit.dispose() (the
  // scene/Canvas owner's job, once) still frees the shared M.*/lampMat/rbGeom
  // banks that release() intentionally leaves alone.
  useEffect(() => {
    return () => {
      for (const entry of activeRef.current.values()) {
        entry.group.parent?.remove(entry.group);
        kit.release(entry.group);
      }
      activeRef.current.clear();
      for (const list of freeListsRef.current.values()) {
        for (const group of list) kit.release(group);
      }
      freeListsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover?.(event.object.userData.machineId as string);
  };
  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover?.(null);
  };
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect?.(event.object.userData.machineId as string);
  };
  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onOpen?.(event.object.userData.machineId as string);
  };

  return (
    <group>
      {activeEntries.map((entry) => (
        <primitive
          key={entry.machineId}
          object={entry.group}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        />
      ))}
    </group>
  );
}
