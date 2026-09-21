/**
 * plant-theme.js — the exact visual theme of the NITTAN plant twin.
 * Every colour, material parameter, light and renderer setting in one place, so
 * a new scene (or Claude Code) can reproduce the look byte for byte.
 *
 *   const theme = PLANT_THEME;
 *   applyPlantTheme(THREE, theme, { renderer, scene, kit, site });
 *
 * Load AFTER three.js and the two kits. Works as <script>, require(), or import.
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = factory();
  else { const a = factory(); root.PLANT_THEME = a.PLANT_THEME; root.applyPlantTheme = a.applyPlantTheme; }
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const PLANT_THEME = {
  name: 'NITTAN dark industrial',

  /* ---------------- renderer + atmosphere ---------------- */
  renderer: {
    pixelRatioCap: 1.75,
    shadows: true, shadowType: 'PCFSoftShadowMap', shadowMapSize: 4096,
    outputEncoding: 'sRGBEncoding',        // three r152+: outputColorSpace = SRGBColorSpace
    toneMapping: 'ACESFilmicToneMapping',
    toneMappingExposure: 0.95,             // >1.05 and the whole plant goes milky
    antialias: true,
  },
  scene: {
    background: '#06080b',
    fog: { type: 'FogExp2', color: '#05070a', density: 0.0019 },
  },
  camera: { fov: 44, near: 0.5, far: 1400,
            home: { pos: [96, 72, 132], target: [6, 0, 10] },
            top:  { pos: [6, 210, 10.5], target: [6, 0, 10] },
            minDistance: 2.5, maxDistance: 900 },

  /* ---------------- lighting rig (4 lights, no more) ---------------- */
  lights: {
    hemi: { sky: '#86a8cc', ground: '#070a0d', intensity: 0.26 },
    sun:  { color: '#ffeedd', intensity: 1.62, position: [150, 190, 120],
            shadow: { bias: -0.0004, normalBias: 0.05,
                      cam: { left: -150, right: 150, top: 130, bottom: -120, near: 20, far: 620 } } },
    fill: { color: '#5f8ccc', intensity: 0.26, position: [-140, 60, -100] },
    rim:  { color: '#2ec4b6', intensity: 0.18, position: [-60, 30, 150] },
    // NOTE: per-machine PointLights are OFF (kit option beaconLights:false).
    // Past ~10 machines they blow the WebGL uniform budget; emissive beacons carry the glow.
  },

  /* ---------------- machine materials (plant-machines.js) ---------------- */
  machine: {
    body:    { color: '#3d4855', metalness: .62, roughness: .38 },  // main housings
    body2:   { color: '#28313a', metalness: .55, roughness: .45 },  // frames, skirts, motors
    steel:   { color: '#94a2ae', metalness: .92, roughness: .24 },  // rollers, shafts, tanks
    dark:    { color: '#1a2027', metalness: .40, roughness: .70 },  // gearboxes, grippers
    accent:  { color: '#14b8a6', metalness: .35, roughness: .35 },  // robot arms — the brand teal
    warn:    { color: '#facc15', metalness: .30, roughness: .50 },  // safety fences
    belt:    { color: '#22282f', metalness: .15, roughness: .85 },
    rubber:  { color: '#14181d', metalness: .10, roughness: .95 },
    glass:   { color: '#8fd6ff', metalness: .10, roughness: .06, transparent: true, opacity: .22 },
    copper:  { color: '#c87941', metalness: .95, roughness: .30 },  // busbars, weld tips
    lead:    { color: '#6b7580', metalness: .85, roughness: .42 },  // dies, moulds, plates
    acid:    { color: '#38bdf8', metalness: .20, roughness: .15, transparent: true, opacity: .55 },
    battery: { color: '#1f2937', metalness: .25, roughness: .55 },  // work pieces
    hot:     { color: '#ff7a2f', metalness: 0, roughness: .60, emissive: '#ff5500', emissiveIntensity: 1.4 },
    screen:  { color: '#0b1220', metalness: 0, roughness: .25, emissive: '#1a9e8f', emissiveIntensity: .9 },
  },

  /* ---------------- building + site materials (plant-buildings.js) ---------------- */
  building: {
    wall:    { color: '#232a33', metalness: .20, roughness: .80 },
    wallIn:  { color: '#2b333c', metalness: .12, roughness: .88 },
    steel:   { color: '#71808d', metalness: .88, roughness: .32 },  // trusses, purlins
    frame:   { color: '#323b45', metalness: .55, roughness: .48 },  // columns, mullions
    roof:    { color: '#171d23', metalness: .38, roughness: .68 },
    parapet: { color: '#2e3741', metalness: .32, roughness: .70 },
    glass:   { color: '#9fd8ff', metalness: .10, roughness: .05, transparent: true, opacity: .18 },
    door:    { color: '#1b222a', metalness: .40, roughness: .60 },
    slab:    { color: '#161b21', metalness: .10, roughness: .96 },  // outdoor apron
    slabIn:  { color: '#232a31', metalness: .08, roughness: .95 },  // factory floor
    road:    { color: '#14181d', metalness: .05, roughness: .96 },
    kerb:    { color: '#4a525b', metalness: .10, roughness: .88 },
    paint:   { color: '#d9b400', metalness: .06, roughness: .70 },  // yellow lane marking
    paintW:  { color: '#cfd6dd', metalness: .06, roughness: .70 },  // white road dashes
    grass:   { color: '#18291b', metalness: .02, roughness: .98 },
    trunk:   { color: '#2a2118', metalness: .05, roughness: .95 },
    leaf:    { color: '#24422a', metalness: .03, roughness: .90 },
    rack:    { color: '#d97706', metalness: .40, roughness: .55 },  // orange pallet racking
    pallet:  { color: '#4a3c2a', metalness: .05, roughness: .92 },
    tank:    { color: '#b9c4cd', metalness: .90, roughness: .26 },
    lamp:    { color: '#dfeaf5', metalness: 0, roughness: .40, emissive: '#cfe0f0', emissiveIntensity: .9 },
    signGrn: { color: '#0f766e', metalness: .20, roughness: .60, emissive: '#0f766e', emissiveIntensity: .35 },
  },
  ground: { color: '#0a0e12', metalness: .04, roughness: .97, size: [900, 700] },
  flowers: ['#d94f7a', '#f0b429', '#e8ecef'],

  /* ---------------- machine status ---------------- */
  status: { run: '#22c55e', warn: '#f59e0b', stop: '#ef4444', idle: '#64748b' },

  /* ---------------- HUD / overlay ---------------- */
  ui: {
    font: '13px/1.55 "Segoe UI", system-ui, sans-serif',
    pageBg: '#06080b',
    panelBg: 'rgba(12,16,21,.88)', panelBlur: 'blur(14px)',
    panelBorder: 'rgba(255,255,255,.09)', panelRadius: '12px',
    panelShadow: '0 18px 50px rgba(0,0,0,.65)',
    text: '#e8edf2', textMuted: '#7d8b9a', textDim: '#6b7a89', textFaint: '#4b5866',
    accent: '#5eead4',
    accentSoft: 'rgba(94,234,212,.11)', accentBorder: 'rgba(94,234,212,.34)',
    buttonBg: 'rgba(255,255,255,.06)', buttonHover: 'rgba(255,255,255,.14)',
    tileBg: 'rgba(255,255,255,.04)',
    labelPlate: { bg: 'rgba(8,12,16,.85)', text: '#5eead4', font: 'bold 56px sans-serif' },
    signPlate:  { bg: '#0e141a', bar: '#14b8a6', text: '#e8edf2', sub: '#7d8b9a' },
  },
};

/** Push the theme into an existing renderer/scene/kit pair. */
function applyPlantTheme(T, theme, ctx) {
  theme = theme || PLANT_THEME; ctx = ctx || {};
  const hex = c => new T.Color(c).getHex();
  const setMat = (mat, spec) => {
    if (!mat || !spec) return;
    if (spec.color !== undefined) mat.color.set(spec.color);
    if (spec.metalness !== undefined) mat.metalness = spec.metalness;
    if (spec.roughness !== undefined) mat.roughness = spec.roughness;
    if (spec.emissive !== undefined && mat.emissive) mat.emissive.set(spec.emissive);
    if (spec.emissiveIntensity !== undefined) mat.emissiveIntensity = spec.emissiveIntensity;
    if (spec.opacity !== undefined) { mat.opacity = spec.opacity; mat.transparent = true; }
    mat.needsUpdate = true;
  };
  if (ctx.renderer) {
    const r = ctx.renderer, t = theme.renderer;
    r.setPixelRatio(Math.min(devicePixelRatio, t.pixelRatioCap));
    r.shadowMap.enabled = t.shadows; r.shadowMap.type = T[t.shadowType];
    if (T[t.outputEncoding] !== undefined) r.outputEncoding = T[t.outputEncoding];
    else if (T.SRGBColorSpace) r.outputColorSpace = T.SRGBColorSpace;   // three r152+
    r.toneMapping = T[t.toneMapping]; r.toneMappingExposure = t.toneMappingExposure;
  }
  if (ctx.scene) {
    ctx.scene.background = new T.Color(theme.scene.background);
    ctx.scene.fog = new T.FogExp2(hex(theme.scene.fog.color), theme.scene.fog.density);
  }
  if (ctx.kit)  Object.keys(theme.machine).forEach(k => setMat(ctx.kit.materials[k], theme.machine[k]));
  if (ctx.site) Object.keys(theme.building).forEach(k => setMat(ctx.site.materials[k], theme.building[k]));
  return theme;
}

/** Build the 4-light rig this theme assumes. Returns {hemi,sun,fill,rim}. */
applyPlantTheme.lights = function (T, scene, theme) {
  theme = theme || PLANT_THEME;
  const L = theme.lights;
  const hemi = new T.HemisphereLight(new T.Color(L.hemi.sky).getHex(),
    new T.Color(L.hemi.ground).getHex(), L.hemi.intensity);
  const sun = new T.DirectionalLight(new T.Color(L.sun.color).getHex(), L.sun.intensity);
  sun.position.fromArray(L.sun.position); sun.castShadow = true;
  sun.shadow.mapSize.set(theme.renderer.shadowMapSize, theme.renderer.shadowMapSize);
  sun.shadow.bias = L.sun.shadow.bias; sun.shadow.normalBias = L.sun.shadow.normalBias;
  Object.assign(sun.shadow.camera, L.sun.shadow.cam); sun.shadow.camera.updateProjectionMatrix();
  const fill = new T.DirectionalLight(new T.Color(L.fill.color).getHex(), L.fill.intensity);
  fill.position.fromArray(L.fill.position);
  const rim = new T.DirectionalLight(new T.Color(L.rim.color).getHex(), L.rim.intensity);
  rim.position.fromArray(L.rim.position);
  scene.add(hemi, sun, fill, rim);
  return { hemi, sun, fill, rim };
};

return { PLANT_THEME: PLANT_THEME, applyPlantTheme: applyPlantTheme };
}));