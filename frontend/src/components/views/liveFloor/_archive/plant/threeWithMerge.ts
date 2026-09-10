/**
 * threeWithMerge.ts
 *
 * Shared `THREE` namespace patched with a modern `BufferGeometryUtils.
 * mergeBufferGeometries` alias, so the vendored `plantBuildingsKit.js` /
 * `plantMachinesKit.js`'s internal `merged()`/`merge()` helpers (which only
 * ever check the old r128-era `T.BufferGeometryUtils.mergeBufferGeometries`
 * name) actually merge instead of silently falling back to one mesh per
 * geometry on three 0.180 (whose `BufferGeometryUtils` addon module only
 * exports the renamed `mergeGeometries`, no back-compat alias).
 *
 * WHY NOT `Object.create(THREE)`: `THREE`, as imported via `import * as THREE
 * from "three"`, is an ES module namespace object -- a spec-defined exotic
 * object whose own `[[Set]]` internal method unconditionally returns `false`.
 * `Object.create(THREE)` builds a plain object whose PROTOTYPE is that
 * namespace object; the new object itself has no own properties yet, so
 * `Object.assign(Object.create(THREE), {...})` tries to set a property that
 * is not yet own on the new object. Per the `OrdinarySet` spec algorithm,
 * when a property isn't own, `[[Set]]` walks up to the prototype and defers
 * to ITS `[[Set]]` -- which is the module namespace's `[[Set]]`, i.e. always
 * `false`. In strict mode (all ESM is strict) a failed `[[Set]]` throws
 * `TypeError: Cannot assign to property '...' of [object Module]`. There is
 * no way to add an own, writable property to an object whose prototype is a
 * module namespace object using assignment -- it will always delegate up and
 * fail. (`Object.defineProperty` would work, since it bypasses `[[Set]]`
 * entirely, but a plain copy is simpler and cheaper here.)
 *
 * THE FIX: copy `THREE`'s (enumerable) exports into a brand-new, ordinary,
 * writable object via spread, instead of prototype-chaining onto it. Do NOT
 * reintroduce `Object.create(THREE)` (or any `Object.assign`/property write
 * that lands on an object whose prototype is a module namespace) here.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Built once at module scope (pure, stateless): a plain copy of every THREE
 * export plus a `BufferGeometryUtils.mergeBufferGeometries` alias for the
 * modern `mergeGeometries`. `mergeGeometries` does not use `this`, so a bare
 * function alias is safe even where callers invoke it as
 * `U.mergeBufferGeometries(geoms)`.
 */
export const THREE_WITH_MERGE: typeof THREE = {
  ...THREE,
  BufferGeometryUtils: { mergeBufferGeometries: mergeGeometries },
} as typeof THREE;
