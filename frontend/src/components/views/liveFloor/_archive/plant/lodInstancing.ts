/**
 * lodInstancing.ts — shared "bake transform into geometry, merge by
 * material" helper used by both PlantFarTier.tsx (machine archetypes) and
 * PlantConveyors.tsx (conveyor length buckets) to turn one kit-built THREE
 * group into a small, fixed number of static InstancedMesh-ready geometries,
 * instead of the flat coloured-box stand-ins this replaced.
 *
 * ---------------------------------------------------------------------------
 * Baking correctness (the one place this is easy to get wrong): a kit group
 * nests meshes under intermediate groups (e.g. `robot()`'s j1/j2/j3/car
 * sub-groups, `mixer()`'s per-tank blade group, `frame()`'s 4 leg meshes
 * added directly but `motor()`'s fins/shaft nested one level under the motor
 * group). Baking `mesh.matrix` (the mesh's OWN local transform) would only be
 * correct for meshes added directly to the root with no intermediate group —
 * everything nested under a moved/rotated sub-group would bake to the WRONG
 * place (typically the origin, ignoring the sub-group's offset) and scatter
 * parts across the plant. The fix: call `root.updateMatrixWorld(true)` once
 * (root has identity local transform and no parent, so this populates every
 * descendant's `matrixWorld` as the FULL accumulated transform relative to
 * root — exactly what "world" means when root itself sits at the world
 * origin), then bake `mesh.matrixWorld`, never `mesh.matrix`. See
 * `frontend/scratch/verify-transform-baking.mjs` (a throwaway Node script,
 * not part of the app) for a standalone check of this against a synthetic
 * nested-group case with a known expected world position.
 * ---------------------------------------------------------------------------
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export interface BakedBucket {
  /** Merged, pre-baked geometry — one instance's worth of real machine/conveyor shape. */
  geometry: THREE.BufferGeometry;
  /** The material this bucket renders with. For most buckets this is one of
   *  the kit's own shared, kit-wide materials (`kit.materials.*` or a cached
   *  `lampMat()` colour) — reused directly, NOT cloned, and never disposed by
   *  this module (the kit still owns and frees those at `kit.dispose()`).
   *  For the one bucket per template flagged `isBeacon`, this is the caller-
   *  supplied dedicated beacon material (see `createBeaconMaterial`) instead
   *  of the kit's own status-coloured lamp material, so per-instance status
   *  colour can be driven via `InstancedMesh.setColorAt`. */
  material: THREE.Material;
  /** True for the bucket built from the mesh named 'beacon' (the control
   *  cabinet's status lamp) — the one submesh whose colour must track a
   *  machine's live DB status per-instance. */
  isBeacon: boolean;
}

/**
 * Walks `root`'s mesh subtree and bakes each mesh's full accumulated
 * `matrixWorld` into a CLONE of its geometry (never mutating the kit's own
 * geometry — including geometry the kit caches and shares across many
 * machines, e.g. `rbGeom()`'s same-size rounded boxes), then merges same-
 * material clones into one geometry per distinct material.
 *
 * REQUIRES `root.updateMatrixWorld(true)` to have been called first (root
 * must have identity local transform and no parent) — see the file header
 * for why `matrix` alone is wrong for nested sub-groups.
 *
 * A mesh named 'beacon' (the kit's control-cabinet status lamp, see
 * `plantMachinesKit.js`'s `cabinet()`) is special-cased into its own bucket
 * keyed by `beaconMaterial` (supplied by the caller) instead of grouping by
 * its own built material — the kit's own beacon material is a STATUS-COLOURED
 * lamp built once at template-build time (this module always builds the
 * template at status 'run'), which would freeze every far-tier machine's
 * beacon at "run" green regardless of its real DB status. Handing the beacon
 * mesh a dedicated, shared, instance-colourable material instead lets the
 * caller drive real per-machine status colour via `InstancedMesh.setColorAt`
 * on just that one bucket.
 */
export function bakeAndMergeByMaterial(root: THREE.Object3D, beaconMaterial?: THREE.Material): BakedBucket[] {
  const byKey = new Map<
    THREE.Material | "beacon",
    { material: THREE.Material; isBeacon: boolean; geoms: THREE.BufferGeometry[] }
  >();

  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const srcGeom = mesh.geometry;
    if (!srcGeom || !srcGeom.attributes || !srcGeom.attributes.position) return;
    const baked = srcGeom.clone();
    baked.applyMatrix4(mesh.matrixWorld);
    // Only machines carry a beacon (conveyors never do); no dedicated beacon
    // material means "this caller has no status-colour concept" — treat any
    // mesh literally named 'beacon' as ordinary in that case rather than
    // reaching for a material that doesn't exist.
    const isBeacon = beaconMaterial !== undefined && mesh.name === "beacon";
    const key: THREE.Material | "beacon" = isBeacon ? "beacon" : (mesh.material as THREE.Material);
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = { material: isBeacon ? beaconMaterial! : (mesh.material as THREE.Material), isBeacon, geoms: [] };
      byKey.set(key, bucket);
    }
    bucket.geoms.push(baked);
  });

  const out: BakedBucket[] = [];
  for (const { material, isBeacon, geoms } of byKey.values()) {
    if (geoms.length === 0) continue;
    if (geoms.length === 1) {
      out.push({ geometry: geoms[0]!, material, isBeacon });
      continue;
    }
    // `mergeGeometries` requires every input to agree on indexed-ness (all
    // indexed or all non-indexed) — the kit's own geometry helpers mix
    // indexed builtins (CylinderGeometry, SphereGeometry, TorusGeometry,
    // TubeGeometry) with ExtrudeGeometry-based rounded boxes (`box()`/
    // `rbGeom()`), and in practice these do NOT always agree, so merging the
    // raw clones fails outright for several archetypes (verified against the
    // real kit: furnace/mixer/coater/oven/press/robot/cell/filler/charger/
    // packer all hit at least one mismatch). Normalising every clone to
    // non-indexed first (a standard `three` BufferGeometryUtils precondition)
    // fixes the overwhelming majority of these.
    const normalized = geoms.map((g) => (g.index ? g.toNonIndexed() : g));
    let merged: THREE.BufferGeometry | null = mergeGeometries(normalized, false);
    if (merged) {
      for (let i = 0; i < geoms.length; i++) {
        if (normalized[i] !== geoms[i]) geoms[i]!.dispose(); // free the intermediate indexed clone
      }
      for (const g of normalized) g.dispose(); // mergeGeometries copies data; frees the pre-merge normalized clones
      out.push({ geometry: merged, material, isBeacon });
      continue;
    }
    // Merge still failed (a genuinely incompatible attribute SET, not just
    // indexed-ness) — never silently drop the geometry (that would delete
    // real machine parts from the far tier). Fall back to one bucket per
    // source mesh instead: correctness over draw-call count.
    for (let i = 0; i < geoms.length; i++) {
      out.push({ geometry: normalized[i]!, material, isBeacon });
      if (normalized[i] !== geoms[i]) geoms[i]!.dispose();
    }
  }
  return out;
}

/**
 * One dedicated status-carrying beacon material, shared by every far-tier
 * archetype's beacon bucket (there is exactly one live instance of this
 * material for the whole far tier, regardless of archetype count).
 *
 * Why not just rely on `InstancedMesh.setColorAt` alone: three's built-in
 * per-instance colour support only multiplies the base/diffuse colour
 * (`diffuseColor.rgb *= vInstanceColor.rgb` in `color_fragment.glsl`, guarded
 * by `USE_INSTANCING_COLOR`) — it does NOT touch `material.emissive`, which
 * is what actually makes the kit's status beacon glow (see `lampMat()` in
 * plantMachinesKit.js: `emissive: hex, emissiveIntensity: 1.6`). Without this
 * patch every far-tier beacon would glow the same fixed colour (whatever this
 * shared material's `emissive` happens to be) no matter what `setColorAt`
 * tints its diffuse to underneath. The `onBeforeCompile` patch below injects
 * one extra line into the standard fragment shader, right after emissive is
 * computed, that also multiplies the emissive radiance by the same per-
 * instance colour — so a red-tinted instance glows red, not just looks
 * reddish under ambient light.
 */
export function createBeaconMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.6,
    roughness: 0.35,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\n#ifdef USE_INSTANCING_COLOR\n\ttotalEmissiveRadiance *= vInstanceColor.rgb;\n#endif",
    );
  };
  return material;
}
