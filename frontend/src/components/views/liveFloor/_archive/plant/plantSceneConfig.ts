/**
 * plantSceneConfig.ts
 *
 * Single source of truth for every literal that reproduces the look of
 * `Model_3D/nittan-plant-3d.html` (three.js r128), as documented in
 * `Model_3D/REFERENCE-LOOK.md` ("the spec"). Section numbers below (§N)
 * refer to that spec; line numbers refer to `Model_3D/dist/nt-app.js`.
 *
 * Two kinds of numbers live here (see spec §11 "Scaling relationships"):
 *  - ABSOLUTE: reproduced verbatim regardless of site size (light
 *    intensities/colors, tone mapping, shadow map resolution, pixel-ratio
 *    cap, material constants for ground/apron).
 *  - PROPORTIONAL: the reference hall/site was 94.3x74.3 m holding 19
 *    machines; the real layout scales the same plan up to hold ~931
 *    machines, so these are expressed as functions of the *new* site's
 *    width/depth rather than hardcoded reference numbers. See the
 *    `compute*` functions at the bottom of this file.
 *
 * Ported from three r128 -> three 0.180 per spec §12. Every conversion
 * needed is called out inline where it applies.
 */
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Renderer (spec §1, nt-app.js:8-12)
// ---------------------------------------------------------------------------

/** `renderer.setPixelRatio(Math.min(devicePixelRatio, PIXEL_RATIO_CAP))` verbatim. */
export const PIXEL_RATIO_CAP = 1.75;

export const ANTIALIAS = true;

/** r128 used `renderer.shadowMap.type = T.PCFSoftShadowMap`; unchanged enum in 0.180. */
export const SHADOW_MAP_TYPE = THREE.PCFSoftShadowMap;

/**
 * r128: `renderer.outputEncoding = T.sRGBEncoding`.
 * `outputEncoding`/`sRGBEncoding` were removed from three (~r165). Per spec
 * §12 row 1 the 0.180 equivalent is `renderer.outputColorSpace`, set
 * unconditionally (no `if (T.sRGBEncoding)` guard needed/possible).
 */
export const OUTPUT_COLOR_SPACE = THREE.SRGBColorSpace;

export const TONE_MAPPING = THREE.LinearToneMapping;
export const TONE_MAPPING_EXPOSURE = 1.6;

// ---------------------------------------------------------------------------
// Scene background + fog (spec §2, nt-app.js:13-15)
// ---------------------------------------------------------------------------

export const BACKGROUND_COLOR = 0x1b2430;
export const FOG_COLOR = 0x1b2430;

/**
 * Reference fog density at the reference site's scale, `FogExp2(FOG_COLOR, 0.0019)`.
 * ABSOLUTE only at the reference site size — see `computeFogDensity` below for
 * the proportional value used at production scale (spec §11 row 1).
 */
export const REFERENCE_FOG_DENSITY = 0.0011;

// No GridHelper, no post-processing/EffectComposer, no scene.environment/PMREM
// anywhere in the reference (spec §2, §12 row "Scene.environment / PMREM").
// Deliberately not added here.

// ---------------------------------------------------------------------------
// Reference site dimensions (spec §11) — used only to derive scaling ratios
// ---------------------------------------------------------------------------

/** Reference hall footprint, metres (spec §11). */
export const REFERENCE_HALL_SIZE: [number, number] = [94.3, 74.3];

/**
 * Reference developed-site bounding box, metres: x:[-60,130] x z:[-70,100]
 * => width 190 x depth 170 (spec §11).
 */
export const REFERENCE_SITE_SIZE: [number, number] = [190, 170];

export const REFERENCE_SITE_DIAGONAL = Math.hypot(
  REFERENCE_SITE_SIZE[0],
  REFERENCE_SITE_SIZE[1],
);

// ---------------------------------------------------------------------------
// Camera + OrbitControls (spec §3, nt-app.js:16-22) — ABSOLUTE shape, but see
// compute* helpers for how position/target/distance limits scale with site size.
// ---------------------------------------------------------------------------

export const CAMERA_FOV = 44;
export const CAMERA_NEAR = 0.5;
export const CAMERA_FAR = 1400;

/** Reference camera position/target at the reference site scale (nt-app.js:17,22). */
export const REFERENCE_CAMERA_POSITION: [number, number, number] = [96, 72, 132];
export const REFERENCE_CAMERA_TARGET: [number, number, number] = [6, 0, 10];

// ---------------------------------------------------------------------------
// Camera PRESETS (restored feature, not in the reference demo — the demo has
// exactly one fixed camera, reproduced above as the "line" preset). These are
// NEW reference-scale literals, chosen by us, not values traced from the spec;
// every one of them is scaled into the real (post site-scaling) world by
// `computeCameraPlacementForPreset` below using the exact same k-scaling
// approach `computeCameraPlacement` already used for "line".
//
// Reference site bounding box (spec §11): x:[-60,130] z:[-70,100] -> centre
// (35, 15), independent of REFERENCE_CAMERA_TARGET (which centres on the
// reference HALL, not the whole site).
// ---------------------------------------------------------------------------

export type PlantCameraPreset = "line" | "plant" | "top" | "eye";

/** Centre of the reference developed site's bounding box (spec §11), not the hall. */
export const REFERENCE_SITE_CENTER: [number, number, number] = [35, 0, 15];

/** "ดูทั้งโรงงาน" -- pulls back far enough to frame the whole fenced site (every
 *  building, road, yard) rather than just the production hall. Same viewing
 *  direction as "line" (a 3/4 elevated look), just scaled out from the SITE
 *  centre instead of the hall centre. */
export const REFERENCE_PLANT_CAMERA_POSITION: [number, number, number] = [197, 130, 235];
export const REFERENCE_PLANT_CAMERA_TARGET: [number, number, number] = REFERENCE_SITE_CENTER;

/** "มุมบนสุด" -- near-vertical plan view of the whole site. A small horizontal
 *  offset (not perfectly overhead) avoids the OrbitControls near-gimbal-lock
 *  wobble a camera placed exactly on the target's +Y axis would have. */
export const REFERENCE_TOP_CAMERA_POSITION: [number, number, number] = [40, 310, 20];
export const REFERENCE_TOP_CAMERA_TARGET: [number, number, number] = REFERENCE_SITE_CENTER;

/** "ระดับสายตา" -- human eye level (~1.7 m) just outside the production hall,
 *  looking in. The 1.7 m height is a HUMAN scale and must NOT grow with site
 *  size (see `computeCameraPlacementForPreset`'s special-case for this preset) --
 *  only the horizontal offset scales, same as every other preset. */
export const EYE_HEIGHT = 1.7;
export const REFERENCE_EYE_CAMERA_POSITION: [number, number, number] = [-24, EYE_HEIGHT, 45];
export const REFERENCE_EYE_CAMERA_TARGET: [number, number, number] = REFERENCE_CAMERA_TARGET;

const PRESET_REFERENCE: Record<
  PlantCameraPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  line: { position: REFERENCE_CAMERA_POSITION, target: REFERENCE_CAMERA_TARGET },
  plant: { position: REFERENCE_PLANT_CAMERA_POSITION, target: REFERENCE_PLANT_CAMERA_TARGET },
  top: { position: REFERENCE_TOP_CAMERA_POSITION, target: REFERENCE_TOP_CAMERA_TARGET },
  eye: { position: REFERENCE_EYE_CAMERA_POSITION, target: REFERENCE_EYE_CAMERA_TARGET },
};

/** Presets that frame the whole site regardless of any zone focus request
 *  (mirrors the pre-swap scene's "wide" presets, which always showed the
 *  whole plant even while a building was focused in the HUD). */
export function isWideCameraPreset(preset: PlantCameraPreset): boolean {
  return preset === "plant" || preset === "top";
}

/** Widest window (metres) a zone fly-to is allowed to frame -- prevents a
 *  tiny zone from producing a camera absurdly close to the geometry. */
const FOCUS_FIT_FACTOR = 1.35;
const FOCUS_MIN_DISTANCE = 18;
const FOCUS_MAX_DISTANCE = 260;

export interface CameraFocusBox {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export const DAMPING_FACTOR = 0.06;
/** `Math.PI * .488` (nt-app.js:20) ~= 87.8 deg. */
export const MAX_POLAR_ANGLE = Math.PI * 0.488;
export const ZOOM_SPEED = 1.25;
export const PAN_SPEED = 0.9;
export const SCREEN_SPACE_PANNING = false;

/** Reference zoom limits (nt-app.js:20); see `computeDistanceLimits` for scaling. */
export const REFERENCE_MIN_DISTANCE = 2.5;
export const REFERENCE_MAX_DISTANCE = 900;

// ---------------------------------------------------------------------------
// Lights (spec §4, nt-app.js:25-33) — ABSOLUTE, do NOT scale with site area.
//
// Per spec §12 row "Light intensities as authored": r128 never had a
// "physically correct lighting" toggle affecting Directional/Hemisphere
// units, and three 0.180's removal of `useLegacyLights` (always
// physically-correct since ~r155) never changed Directional/Hemisphere
// intensity semantics either (only Point/Spot, via decay). So these four
// values port to three 0.180 completely unchanged -- do not re-scale them.
// ---------------------------------------------------------------------------

export const HEMI_SKY_COLOR = 0x86a8cc;
export const HEMI_GROUND_COLOR = 0x25303a;
export const HEMI_INTENSITY = 1.6;

/** Flat base fill applied via `<ambientLight>` so nothing in the scene ever
 *  reads as pure black, regardless of directional/hemi coverage. */
export const AMBIENT_INTENSITY = 0.55;

export const SUN_COLOR = 0xffeedd;
export const SUN_INTENSITY = 2.6;
/**
 * Reference sun position (nt-app.js:27), at the REFERENCE site's scale.
 * A `DirectionalLight`'s position carries no falloff/attenuation, so leaving
 * this literal un-scaled would NOT dim the light itself -- the light's
 * *direction* (target - position, target defaulting to world origin same as
 * the reference) is unchanged by uniformly scaling position by any positive
 * `k`. What DOES break if this stays a bare reference-scale literal: the
 * shadow camera three.js attaches to a `DirectionalLight` is centred AT
 * `light.position` in world space. At production scale the real site's
 * depth alone can run into the thousands of metres (see
 * `computeSiteScaleFactor`'s doc comment / spec §11), while this literal's
 * magnitude is only `hypot(150,190,120) ~= 270`m -- a shadow camera anchored
 * there sits essentially in a corner of the real site rather than above it,
 * so even a correctly-sized ortho box (see `computeShadowCameraBox`) is
 * centred on the wrong point and the near/far clip (also site-scaled) is
 * measured from the wrong stand-off distance. Scale this by the same
 * diagonal `k` as every other proportional quantity in this file (see
 * `computeLightPosition`) so the shadow camera's local origin stays
 * anchored above the actual (scaled) site, not at the reference's own
 * corner.
 */
export const REFERENCE_SUN_POSITION: [number, number, number] = [150, 190, 120];
export const SUN_SHADOW_BIAS = -0.0004;
export const SUN_SHADOW_NORMAL_BIAS = 0.05;

/**
 * `sun.shadow.mapSize.set(4096, 4096)` in the reference — ABSOLUTE per §11's
 * texel-density row, but cut to 2048 here (not a spec value) because this
 * scene's shadow load is far beyond what the reference demo ever cast: the
 * detailed machine kit, an 883-instance far tier, AND the full outdoor site
 * apron/roads/buildings share this single sun shadow pass, and
 * `PlantMachines.tsx` already renders its own kit with `shadows:false` (an
 * explicit signal from that team that per-machine shadow detail is not
 * worth its cost at this instance count). Halving the map resolution quarters
 * the shadow-pass pixel cost; the resolution-collapse remedy below (the
 * texel-density floor/cap) is computed FROM this constant, so it keeps
 * working unchanged at 2048 -- it just settles on a smaller `MAX_SHADOW_*`
 * envelope, which is the correct outcome (this scene was always going to
 * need a smaller usable frustum than the 19-machine reference demo).
 */
export const SUN_SHADOW_MAP_SIZE = 2048;

/** Quality toggle: shadow map size used when the operator picks "ประหยัด"
 *  (low quality). Halves the already-reduced 2048 map again; combined with
 *  not casting shadows at all in that mode (see `PlantSceneShellProps.highQuality`
 *  in PlantSceneShell.tsx) this constant only matters if some future caller
 *  keeps `castShadow` on while `highQuality` is false -- kept here rather
 *  than inlined so the low-quality budget has one named source of truth. */
export const SUN_SHADOW_MAP_SIZE_LOW = 1024;

/** `Canvas`'s `dpr` ceiling when the operator picks "ประหยัด" (low quality). */
export const PIXEL_RATIO_CAP_LOW = 1;

/**
 * Reference (off-center) shadow-camera ortho box (nt-app.js:29), asymmetric
 * top/bottom by design to cover the +Z-heavy reference site. PROPORTIONAL —
 * see `computeShadowCameraBox`.
 */
export const REFERENCE_SUN_SHADOW_BOX = {
  left: -150,
  right: 150,
  top: 130,
  bottom: -120,
  near: 20,
  far: 620,
} as const;

export const FILL_COLOR = 0x5f8ccc;
export const FILL_INTENSITY = 1.0;
/** Reference position (nt-app.js:32), reference-scale — see `REFERENCE_SUN_POSITION`'s
 *  doc comment; scaled the same way by `computeLightPosition`. No shadow on
 *  this light so only its (non-)effect on shadow coverage is moot, but keeping
 *  it geometrically consistent with the sun/rim avoids an oddly-close fill
 *  light direction relative to a much bigger scene. */
export const REFERENCE_FILL_POSITION: [number, number, number] = [-140, 60, -100];

export const RIM_COLOR = 0x2ec4b6;
export const RIM_INTENSITY = 0.35;
/** Reference position (nt-app.js:33), reference-scale — see `REFERENCE_SUN_POSITION`. */
export const REFERENCE_RIM_POSITION: [number, number, number] = [-60, 30, 150];

// ---------------------------------------------------------------------------
// Ground + apron (spec §6, nt-app.js:40-45)
// ---------------------------------------------------------------------------

export const GROUND_COLOR = 0x39424c;
export const GROUND_ROUGHNESS = 0.97;
export const GROUND_METALNESS = 0.04;
/** `PlaneGeometry(900, 700)` at the reference site scale; see `computeGroundSize`. */
export const REFERENCE_GROUND_SIZE: [number, number] = [900, 700];

/** `site.apron(...)` -> `M.slab` = `mk(0x161b21,.10,.96)` (spec §10); lifted from
 *  the spec's 0x161b21 to 0x454f5a (previously 0x2e3640) to keep the apron
 *  readable at the higher scene exposure/lighting used here. */
export const APRON_COLOR = 0x454f5a;
export const APRON_METALNESS = 0.1;
export const APRON_ROUGHNESS = 0.96;
/** Reference `site.apron(285, 235, 'slab')`; see `computeApronSize`. */
export const REFERENCE_APRON_SIZE: [number, number] = [285, 235];
/** Reference `apron.position.set(20, .025, 10)`; see `computeApronPosition`. */
export const REFERENCE_APRON_POSITION: [number, number, number] = [20, 0.025, 10];

// ---------------------------------------------------------------------------
// Shadow-frustum resolution-collapse remedy (spec §11 row "Sun shadow.mapSize")
//
// The spec flags that a single ortho shadow frustum scaled linearly with site
// size loses texel density (mapSize is fixed at 4096^2 but the frustum area
// grows), and recommends cascaded/split shadow maps as the "real fix" while
// noting a single-frustum port does not scale to 931 machines without visibly
// blocky shadows. Implementing true cascades is out of scope for this scene
// shell (no new dependencies, single ortho light). The sane remedy adopted
// here: cap the shadow frustum's growth once texel density would fall below
// half of the reference density, rather than letting it grow unbounded.
// Beyond that cap the frustum stays centred on the (scaled) reference box and
// simply stops covering the whole site -- the far edges lose sun shadowing
// (fill/rim/hemi lights still shade them) and FogExp2's own proportional
// growth (see computeFogDensity) means those distant areas are increasingly
// obscured by fog anyway, so the loss of shadow detail there is not visually
// jarring.
// ---------------------------------------------------------------------------

const REFERENCE_SHADOW_WIDTH =
  REFERENCE_SUN_SHADOW_BOX.right - REFERENCE_SUN_SHADOW_BOX.left; // 300
const REFERENCE_SHADOW_HEIGHT =
  REFERENCE_SUN_SHADOW_BOX.top - REFERENCE_SUN_SHADOW_BOX.bottom; // 250

/** Reference texel density (texels/metre) the reference frustum achieves. */
const REFERENCE_SHADOW_TEXEL_DENSITY_X = SUN_SHADOW_MAP_SIZE / REFERENCE_SHADOW_WIDTH;
const REFERENCE_SHADOW_TEXEL_DENSITY_Y = SUN_SHADOW_MAP_SIZE / REFERENCE_SHADOW_HEIGHT;

/**
 * Floor: never let texel density fall below half of the reference density.
 * Chosen by us (not specified numerically by the spec) as a "visibly softer
 * but not blocky" degradation threshold.
 */
const MIN_SHADOW_TEXEL_DENSITY_X = REFERENCE_SHADOW_TEXEL_DENSITY_X / 2;
const MIN_SHADOW_TEXEL_DENSITY_Y = REFERENCE_SHADOW_TEXEL_DENSITY_Y / 2;

/** Max frustum extents (metres) before texel density drops below the floor above. */
const MAX_SHADOW_WIDTH = SUN_SHADOW_MAP_SIZE / MIN_SHADOW_TEXEL_DENSITY_X; // 600
const MAX_SHADOW_HEIGHT = SUN_SHADOW_MAP_SIZE / MIN_SHADOW_TEXEL_DENSITY_Y; // 500

// ---------------------------------------------------------------------------
// Ground/apron coverage margins, derived from the reference site so the
// formulas reproduce the reference numbers exactly when siteWidth/siteDepth
// equal REFERENCE_SITE_SIZE.
// ---------------------------------------------------------------------------

const GROUND_MARGIN_W = REFERENCE_GROUND_SIZE[0] / REFERENCE_SITE_SIZE[0];
const GROUND_MARGIN_D = REFERENCE_GROUND_SIZE[1] / REFERENCE_SITE_SIZE[1];
const APRON_MARGIN_W = REFERENCE_APRON_SIZE[0] / REFERENCE_SITE_SIZE[0];
const APRON_MARGIN_D = REFERENCE_APRON_SIZE[1] / REFERENCE_SITE_SIZE[1];
const APRON_OFFSET_X_RATIO = REFERENCE_APRON_POSITION[0] / REFERENCE_SITE_SIZE[0];
const APRON_OFFSET_Z_RATIO = REFERENCE_APRON_POSITION[2] / REFERENCE_SITE_SIZE[1];

// ---------------------------------------------------------------------------
// Proportional-quantity helpers (spec §11) — every value here is a function
// of the *new* site's width/depth, not a hardcoded literal.
// ---------------------------------------------------------------------------

/** Linear scale factor `k = newDiag / oldDiag` used throughout (spec §11). */
export function computeSiteScaleFactor(siteWidth: number, siteDepth: number): number {
  const newDiagonal = Math.hypot(siteWidth, siteDepth);
  return newDiagonal / REFERENCE_SITE_DIAGONAL;
}

/**
 * `density_new = density_old / k` (spec §11 row 1) so the fraction of the
 * scene lost to fog at the new far edge matches the reference.
 */
export function computeFogDensity(siteWidth: number, siteDepth: number): number {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  return REFERENCE_FOG_DENSITY / k;
}

/**
 * Camera position + target scaled so the same fraction of the plant is
 * framed on load (spec §11 row 3). The offset vector (position - target) is
 * scaled by k and re-applied to the new target, rather than reusing the
 * reference's raw numbers, which sidesteps needing a separately-stated
 * "current distance" constant.
 */
export function computeCameraPlacement(
  siteWidth: number,
  siteDepth: number,
  target: [number, number, number] = scaleTarget(siteWidth, siteDepth),
): { position: [number, number, number]; target: [number, number, number] } {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  const offset: [number, number, number] = [
    (REFERENCE_CAMERA_POSITION[0] - REFERENCE_CAMERA_TARGET[0]) * k,
    (REFERENCE_CAMERA_POSITION[1] - REFERENCE_CAMERA_TARGET[1]) * k,
    (REFERENCE_CAMERA_POSITION[2] - REFERENCE_CAMERA_TARGET[2]) * k,
  ];
  return {
    position: [target[0] + offset[0], target[1] + offset[1], target[2] + offset[2]],
    target,
  };
}

/** Default target: reference target scaled by k (keeps the same relative site offset). */
function scaleTarget(siteWidth: number, siteDepth: number): [number, number, number] {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  return [
    REFERENCE_CAMERA_TARGET[0] * k,
    REFERENCE_CAMERA_TARGET[1] * k,
    REFERENCE_CAMERA_TARGET[2] * k,
  ];
}

/**
 * OrbitControls min/max distance, scaled by k (spec §11 row 3: "Zoom limits
 * ... should scale the same way"), with maxDistance additionally floored so
 * it always exceeds the new site diagonal (users must be able to zoom out
 * far enough to see the whole plant).
 */
export function computeDistanceLimits(
  siteWidth: number,
  siteDepth: number,
): { minDistance: number; maxDistance: number } {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  const diagonal = Math.hypot(siteWidth, siteDepth);
  return {
    minDistance: REFERENCE_MIN_DISTANCE * k,
    maxDistance: Math.max(REFERENCE_MAX_DISTANCE * k, diagonal * 1.5),
  };
}

/**
 * Camera far-clip distance, scaled by k -- NOT the fixed `CAMERA_FAR` literal.
 *
 * BUG THIS FIXES: `CAMERA_FAR` (1400) is the reference demo's far plane,
 * authored for a camera whose offset from its own look-at target
 * (`REFERENCE_CAMERA_POSITION` - `REFERENCE_CAMERA_TARGET`) has length
 * ~167.8 m -- comfortably inside 1400. `computeCameraPlacement` /
 * `computeCameraPlacementForPreset` scale that offset by `k` (spec §11 row
 * 3, "camera position/target ... scaled by k"), so the camera-to-target
 * distance grows to `167.8 * k` at production scale, but nothing scaled
 * `CAMERA_FAR` alongside it -- every other proportional quantity in this file
 * (fog density, zoom limits, ground/apron/shadow-frustum sizing) has its own
 * `compute*` scaler; the far plane was the one left as a bare constant.
 *
 * At the real ~973-machine dataset's scale (k ~= 8.36 on the depth axis),
 * `167.8 * k ~= 1402` -- the camera ends up FARTHER from its own look-at
 * target than the far clip plane, so the entire plant (which sits at/near
 * that target) is behind `far` and gets clipped to nothing: a fully black
 * canvas with zero renderer errors, because this is correct WebGL behaviour
 * for an out-of-frustum scene, not a crash. Confirmed with
 * `buildPlantLayout()` against the real DB export: camera-to-target distance
 * 1402.5 m vs the old fixed far of 1400 m.
 *
 * Fix: scale `CAMERA_FAR` by the same `k` used for the camera offset itself,
 * which preserves the reference's ~8.3x margin (1400 / 167.8) between
 * camera-to-target distance and the far plane at every site size, the same
 * way `computeFogDensity`/`computeDistanceLimits` already preserve their own
 * reference ratios. This is provably always >= `computeDistanceLimits`'s
 * `maxDistance` too (1400k > max(900k, diagonal*1.5) for every k > 0, since
 * diagonal = k * REFERENCE_SITE_DIAGONAL and 1400 > 900 and
 * 1400 > 1.5 * REFERENCE_SITE_DIAGONAL), so the far plane never clips the
 * plant even when the operator zooms all the way out to the orbit limit.
 */
export function computeCameraFar(siteWidth: number, siteDepth: number): number {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  return CAMERA_FAR * k;
}

export interface ShadowCameraBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
}

/**
 * Scales a reference-scale light position (`REFERENCE_SUN_POSITION` etc) by
 * the same uniform diagonal `k` used for camera placement (spec §11 row
 * "Camera initial distance"). A `DirectionalLight`'s illumination direction
 * is unaffected by uniformly scaling its position (direction = target -
 * position, and target defaults to the world origin same as the reference
 * -- see `REFERENCE_SUN_POSITION`'s doc comment for why the shadow camera
 * anchor is what actually needs this, not the light's own brightness).
 */
export function computeLightPosition(
  refPosition: [number, number, number],
  siteWidth: number,
  siteDepth: number,
): [number, number, number] {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  return [refPosition[0] * k, refPosition[1] * k, refPosition[2] * k];
}

/**
 * Sun shadow-camera ortho box, scaled linearly with site size (spec §11 row
 * 2) but capped once texel density would fall below half the reference
 * density (see the "resolution-collapse remedy" block above). Capping keeps
 * `left`/`right` and `top`/`bottom` in the same ratio as the ideal (uncapped)
 * box so the asymmetric top/bottom bias is preserved at any scale.
 *
 * `left`/`right` (the X/width axis) and `top`/`bottom` (the Z/depth axis) are
 * scaled by SEPARATE factors, `kx`/`kz`, rather than one uniform diagonal
 * `k`. The real site is highly anisotropic (per the task's own example: hall
 * width grows ~3.7x, hall depth ~11.8x from the reference), so a single
 * diagonal-derived `k` (~8.4x here) over-scales the width axis (wasting
 * texel budget the cap then discards anyway) while under-scaling the depth
 * axis relative to what the site actually needs covered -- at the example
 * numbers this left ~83% of the site's depth completely outside the shadow
 * frustum (still fully LIT -- DirectionalLight has no falloff -- but with no
 * shadow contact at all past that line). `near`/`far` stay on the uniform
 * `k` since they scale with the light's own (now `computeLightPosition`-
 * scaled) stand-off distance along its fixed diagonal direction, not with
 * either ground-plane axis independently.
 */
export function computeShadowCameraBox(siteWidth: number, siteDepth: number): ShadowCameraBox {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  const kx = siteWidth / REFERENCE_SITE_SIZE[0];
  const kz = siteDepth / REFERENCE_SITE_SIZE[1];

  const idealLeft = REFERENCE_SUN_SHADOW_BOX.left * kx;
  const idealRight = REFERENCE_SUN_SHADOW_BOX.right * kx;
  const idealTop = REFERENCE_SUN_SHADOW_BOX.top * kz;
  const idealBottom = REFERENCE_SUN_SHADOW_BOX.bottom * kz;
  const idealNear = REFERENCE_SUN_SHADOW_BOX.near * k;
  const idealFar = REFERENCE_SUN_SHADOW_BOX.far * k;

  const idealWidth = idealRight - idealLeft;
  const idealHeight = idealTop - idealBottom;

  // Each axis is capped independently now that they can scale by different
  // factors -- no longer a single shared capFactor, since over-capping the
  // width axis to match a depth-driven ratio (or vice versa) would reproduce
  // the same anisotropy bug this function exists to fix.
  const capFactorW = idealWidth > MAX_SHADOW_WIDTH ? MAX_SHADOW_WIDTH / idealWidth : 1;
  const capFactorH = idealHeight > MAX_SHADOW_HEIGHT ? MAX_SHADOW_HEIGHT / idealHeight : 1;

  return {
    left: idealLeft * capFactorW,
    right: idealRight * capFactorW,
    top: idealTop * capFactorH,
    bottom: idealBottom * capFactorH,
    // near/far affect only depth precision, not xy texel density, so they
    // are not subject to the same cap -- scale linearly, floor near at 1.
    near: Math.max(1, idealNear),
    far: idealFar,
  };
}

/**
 * Background ground plane, sized to always exceed the new site bounding box
 * (spec §11 row "Ground plane / apron"). Margins are derived from the
 * reference (900x700 plane over a 190x170 site) so this reproduces the
 * reference numbers exactly at reference scale.
 */
export function computeGroundSize(siteWidth: number, siteDepth: number): [number, number] {
  return [siteWidth * GROUND_MARGIN_W, siteDepth * GROUND_MARGIN_D];
}

/** Paved apron slab, sized/positioned the same way as `computeGroundSize`. */
export function computeApronSize(siteWidth: number, siteDepth: number): [number, number] {
  return [siteWidth * APRON_MARGIN_W, siteDepth * APRON_MARGIN_D];
}

export function computeApronPosition(
  siteWidth: number,
  siteDepth: number,
): [number, number, number] {
  return [
    siteWidth * APRON_OFFSET_X_RATIO,
    REFERENCE_APRON_POSITION[1],
    siteDepth * APRON_OFFSET_Z_RATIO,
  ];
}

// ---------------------------------------------------------------------------
// Camera preset placement (restored feature -- see the "Camera PRESETS"
// block above for how each preset's reference numbers were chosen).
// ---------------------------------------------------------------------------

export interface CameraPlacement {
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Scaled camera position/target for one of the 4 presets, following the same
 * k-scaling approach as `computeCameraPlacement` (which this function
 * subsumes for the "line" case -- kept separate only because `PlantSceneShell`
 * still calls it directly for the zero-preset-prop default).
 *
 * "eye" is special-cased: its height is a HUMAN scale (eye level), not a
 * site-relative one, so only the horizontal (x/z) component of its offset is
 * scaled by k -- the y component stays the literal `EYE_HEIGHT` at any site size.
 */
export function computeCameraPlacementForPreset(
  preset: PlantCameraPreset,
  siteWidth: number,
  siteDepth: number,
): CameraPlacement {
  const k = computeSiteScaleFactor(siteWidth, siteDepth);
  const { position: refPos, target: refTarget } = PRESET_REFERENCE[preset];

  const target: [number, number, number] = [
    refTarget[0] * k,
    preset === "eye" ? refTarget[1] : refTarget[1] * k,
    refTarget[2] * k,
  ];

  const offsetX = (refPos[0] - refTarget[0]) * k;
  const offsetZ = (refPos[2] - refTarget[2]) * k;
  const offsetY = preset === "eye" ? EYE_HEIGHT - refTarget[1] : (refPos[1] - refTarget[1]) * k;

  return {
    position: [target[0] + offsetX, target[1] + offsetY, target[2] + offsetZ],
    target,
  };
}

/**
 * Camera framing for a zone (or any other axis-aligned area) the operator
 * flies to via the building/zone navigator. Unlike the presets above, the box
 * here is ALREADY in final world coordinates (site.zones are produced by
 * `scaleSiteTo()` against the real DB-driven hall, not the reference one), so
 * no k-scaling is applied -- only the box's own size drives the fit distance.
 *
 * Reuses the "line" preset's viewing direction (normalized reference offset)
 * for every zone, so flying between zones never spins the camera around --
 * only the distance and the look-at point change.
 */
const LINE_OFFSET: [number, number, number] = [
  REFERENCE_CAMERA_POSITION[0] - REFERENCE_CAMERA_TARGET[0],
  REFERENCE_CAMERA_POSITION[1] - REFERENCE_CAMERA_TARGET[1],
  REFERENCE_CAMERA_POSITION[2] - REFERENCE_CAMERA_TARGET[2],
];
const LINE_OFFSET_LENGTH = Math.hypot(LINE_OFFSET[0], LINE_OFFSET[1], LINE_OFFSET[2]);
const LINE_DIRECTION: [number, number, number] = [
  LINE_OFFSET[0] / LINE_OFFSET_LENGTH,
  LINE_OFFSET[1] / LINE_OFFSET_LENGTH,
  LINE_OFFSET[2] / LINE_OFFSET_LENGTH,
];

export function computeFocusPlacement(box: CameraFocusBox): CameraPlacement {
  const diagonal = Math.hypot(box.width, box.depth);
  const distance = Math.min(
    FOCUS_MAX_DISTANCE,
    Math.max(FOCUS_MIN_DISTANCE, diagonal * FOCUS_FIT_FACTOR),
  );
  const target: [number, number, number] = [box.x, 0, box.z];
  return {
    position: [
      target[0] + LINE_DIRECTION[0] * distance,
      target[1] + LINE_DIRECTION[1] * distance,
      target[2] + LINE_DIRECTION[2] * distance,
    ],
    target,
  };
}
