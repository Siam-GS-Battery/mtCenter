/**
 * plantMachinesKit.js — vendored ES module build of the procedural factory-machine kit.
 * ---------------------------------------------------------------------------
 * Source of truth: Model_3D/dist/plant-machines.js (UMD, 540 lines, validated with
 * `node --check`). See Model_3D/README.md for the full API contract.
 *
 * Extraction: the UMD wrapper `(function (root, factory) { ... }(...))` was removed
 * and replaced with a plain ES module that exports `createPlantMachines` as a named
 * export. The body of `createPlantMachines(T, options)` (materials, geometry helpers,
 * machine archetypes, public API) is otherwise byte-identical to the source — no
 * restyling, no behavior changes beyond the two three.js r180 compatibility fixes
 * below. To re-derive this file: take Model_3D/dist/plant-machines.js, drop the UMD
 * wrapper, and re-apply these two fixes.
 *
 * Fix 1 — canvas texture color space (textTex(), used by the label plaques):
 *   The kit sets `t.encoding = T.sRGBEncoding` guarded by a feature check (this API
 *   was removed in three r152+). Added a second guarded branch that sets the modern
 *   `t.colorSpace = T.SRGBColorSpace` when it exists, alongside the legacy branch,
 *   so the plaque textures render in the correct color space on three 0.180.
 *
 * Fix 2 — PointLight decay (three beacon/glow lights: cabinet(), furnace(), cell()):
 *   PointLight is constructed as `new T.PointLight(color, intensity, distance)`.
 *   Three's default `decay` changed from 1 to 2 in r155, which makes these lights
 *   noticeably dimmer than the kit was originally tuned for. Each PointLight now has
 *   `.decay = 1` set explicitly right after construction to preserve the original look.
 *
 * Fix 3 — bounded animation registries + full release path (scale: 931 machines,
 *   32 live at once via KitMachinePool). The animation registries (`spin`, `swing`,
 *   `pulse`, `belts`, `travellers`) are session-wide arrays that every create() call
 *   appends to, with no removal path — every entry (and every traveller mesh's
 *   userData) is now tagged with the top-level owning group via an `owner` field,
 *   passed down explicitly by the caller (create() passes its own `g` into
 *   cabinet(status, owner); conveyor()/workpieces() tag with their own group).
 *   `release(group)` removes every entry tagged with `group` from all five
 *   registries, then disposes every NON-shared geometry/material/texture found in
 *   `group`'s subtree — geometries cached by rbGeom() (shared across every
 *   rounded-box of the same size) and materials in the `M` bank or the
 *   colour-keyed `lampMat()` cache are tagged `__kitShared` and are never disposed
 *   by release(), since other still-live groups reference the same instances.
 *   Callers (the pool) must call `kit.release(group)` whenever a group is
 *   permanently discarded (evicted past a free-list cap, or the pool unmounts) —
 *   never merely when it is parked in a reuse free list. tick()'s hot loops stay
 *   allocation-free; release() only runs at (de)construction time, never per frame.
 *
 * Fix 4 — status-beacon material leak: setStatus() used to build a brand-new
 *   MeshStandardMaterial on every call (every rekey, every real status change) and
 *   never disposed the one it replaced. `lampMat(hex)` is now cached by colour
 *   (`lampMatCache`) and tagged `__kitShared`, so both cabinet()'s initial beacon
 *   and setStatus() reuse the SAME material instance for every lamp/beacon of a
 *   given colour — there are only 4 status colours plus a handful of fixed
 *   decorative lamp colours, so this caps the material count at a small constant
 *   regardless of machine count, and release() never frees a shared lamp material
 *   still in use by another live machine.
 *
 * Fix 5 — signage plaque leak: `sign()`'s PlaneGeometry/material (and cabinet()'s and
 *   conveyor()'s ad hoc materials) are now pushed to `owned` so kit.dispose() frees
 *   them too, and `lampMat()` itself pushes into `owned` so every pilot lamp / beacon
 *   / indicator light material built anywhere in the kit is tracked. The pool's
 *   restyleSign() calls `kit.release(oldSignGroup)` instead of a bare
 *   `group.remove()`, which frees that specific plaque's texture/geometry/material
 *   immediately on re-key instead of only at kit-wide teardown.
 */

export function createPlantMachines(T, options) {
  if (!T || !T.BufferGeometry) throw new Error('plant-machines: pass the THREE namespace as the first argument');
  const opt = Object.assign({ shadows: true, textures: true, beaconLights: true }, options || {});
  // beaconLights:false — REQUIRED past ~10 machines: one PointLight per cabinet
  // blows the WebGL uniform budget. The emissive beacon still glows without it.

  /* ---------------------------------------------------------- materials */
  const mkMat = (c, m, r, extra) =>
    new T.MeshStandardMaterial(Object.assign({ color: c, metalness: m, roughness: r }, extra || {}));
  const M = {
    body:    mkMat(0x3d4855, .62, .38),
    body2:   mkMat(0x3a444f, .55, .45),
    steel:   mkMat(0x94a2ae, .92, .24),
    dark:    mkMat(0x333b44, .40, .70),
    accent:  mkMat(0x14b8a6, .35, .35),
    warn:    mkMat(0xfacc15, .30, .50),
    belt:    mkMat(0x353c44, .15, .85),
    rubber:  mkMat(0x2c3036, .10, .95),
    glass:   mkMat(0x8fd6ff, .10, .06, { transparent: true, opacity: .22 }),
    copper:  mkMat(0xc87941, .95, .30),
    lead:    mkMat(0x6b7580, .85, .42),
    acid:    mkMat(0x38bdf8, .20, .15, { transparent: true, opacity: .55 }),
    battery: mkMat(0x1f2937, .25, .55),
    hot:     mkMat(0xff7a2f, .00, .60, { emissive: 0xff5500, emissiveIntensity: 1.4 }),
    screen:  mkMat(0x0b1220, .00, .25, { emissive: 0x1a9e8f, emissiveIntensity: .9 }),
  };
  // Every material above is shared, kit-wide, by every machine this kit instance
  // builds — release(group) (see below) must never dispose one of these just
  // because the ONE group that happened to trigger the sweep is being torn down.
  Object.keys(M).forEach(k => { M[k].__kitShared = true; });
  const STATUS = { run: 0x22c55e, warn: 0xf59e0b, stop: 0xef4444, idle: 0x64748b };
  // Beacon/lamp materials are cached by colour and SHARED across every machine
  // (there are only ever a handful of distinct hex values in play: the 4 status
  // colours + a few fixed decorative lamp colours). This is required, not just
  // an optimisation: `setStatus()` reassigns `.material` on every call, and an
  // uncached `lampMat()` would allocate — and leak — a brand-new
  // MeshStandardMaterial on every single status change. Tagged `__kitShared` so
  // release(group) never frees one still used by another live machine; tracked
  // in `owned` (once, the first time each colour is built) so a full
  // kit.dispose() still frees them all at kit-wide teardown.
  const lampMatCache = new Map();
  function lampMat(hex) {
    let m = lampMatCache.get(hex);
    if (!m) {
      m = mkMat(hex, .0, .35, { emissive: hex, emissiveIntensity: 1.6 });
      m.__kitShared = true;
      lampMatCache.set(hex, m);
      owned.push(m);
    }
    return m;
  }

  /* ------------------------------------------------- animation registry */
  const spin = [], swing = [], pulse = [], belts = [];
  const BELT_V = 1.2;                                  // m/s, shared by belt+rollers+parts
  const travellers = [];
  /**
   * Every registry entry above is tagged with the machine/conveyor GROUP it
   * animates (`entry.owner`), set by the caller at push time. `release(group)`
   * sweeps all four arrays (+ travellers) for entries owned by that group, so
   * a caller that permanently discards a built group (never reuses it again)
   * can stop it from being animated/computed forever, THEN disposes every
   * non-shared geometry/material/texture still attached under `group` (skipping
   * anything tagged `__kitShared` — the rbGeom()-cached box geometry and the `M`/
   * lampMat() material banks, all of which are referenced by other still-live
   * groups too). Without this the registries only ever grow and per-instance
   * GPU resources (signage plaques, conveyor belts, one-off geometry) never
   * free until the whole kit is torn down. Callers: whenever a group is
   * permanently discarded (evicted past a free-list cap, replaced in place —
   * e.g. a re-keyed signage plaque, or the pool unmounting) — never merely
   * parked in a reuse free list, since a parked group is still expected to be
   * re-keyed and reused later.
   */
  function release(group) {
    if (!group) return;
    const sweep = arr => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i].owner === group) arr.splice(i, 1); };
    sweep(spin); sweep(swing); sweep(pulse); sweep(belts);
    for (let i = travellers.length - 1; i >= 0; i--) {
      const t = travellers[i];
      if (t.userData && t.userData.owner === group) travellers.splice(i, 1);
    }
    if (group.traverse) {
      group.traverse(node => {
        if (!node.isMesh) return;
        const geo = node.geometry;
        if (geo && !geo.__kitShared) geo.dispose();
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(mat => {
          if (!mat || mat.__kitShared) return;
          if (mat.map && mat.map.dispose) mat.map.dispose();
          mat.dispose();
        });
      });
    }
  }

  /* ------------------------------------------------------ geometry kit */
  const rbCache = {}, owned = [];
  function rbGeom(w, h, d, r, bev) {
    const key = [w, h, d, r, bev].join('|');
    if (rbCache[key]) return rbCache[key];
    r = Math.min(r, w / 2 - .001, d / 2 - .001);
    bev = Math.min(bev === undefined ? Math.min(r, h / 2, .06) : bev, h / 2 - .001);
    const s = new T.Shape(), x = w / 2 - r, z = d / 2 - r;
    s.moveTo(-x - r, -z);
    s.lineTo(-x - r, z);  s.quadraticCurveTo(-x - r, z + r, -x, z + r);
    s.lineTo(x, z + r);   s.quadraticCurveTo(x + r, z + r, x + r, z);
    s.lineTo(x + r, -z);  s.quadraticCurveTo(x + r, -z - r, x, -z - r);
    s.lineTo(-x, -z - r); s.quadraticCurveTo(-x - r, -z - r, -x - r, -z);
    const g = new T.ExtrudeGeometry(s, { depth: h - bev * 2, bevelEnabled: bev > .002,
      bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 8 });
    g.rotateX(-Math.PI / 2);
    // measure, don't trust the extrude offset: base lands exactly on y=0
    g.computeBoundingBox(); g.translate(0, -g.boundingBox.min.y, 0);
    g.computeVertexNormals();
    g.__kitShared = true; // cached by size key — reused by every box() call with the same dimensions; release() must never dispose it
    rbCache[key] = g; owned.push(g); return g;
  }
  function shade(m) { m.castShadow = m.receiveShadow = opt.shadows; return m; }
  /** rounded box, BASE on y=0 */
  function box(w, h, d, mat, r) {
    return shade(new T.Mesh(rbGeom(w, h, d, r === undefined ? Math.min(w, d) * .06 : r), mat));
  }
  /** cylinder, CENTRED on its origin (unlike box) */
  function cyl(rt, rb, h, mat, seg) {
    const g = new T.CylinderGeometry(rt, rb, h, seg || 28); owned.push(g);
    return shade(new T.Mesh(g, mat));
  }
  function tube(pts, r, mat) {
    const c = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2])));
    const g = new T.TubeGeometry(c, pts.length * 8, r, 12, false); owned.push(g);
    return shade(new T.Mesh(g, mat));
  }
  function torus(R, r, mat) { const g = new T.TorusGeometry(R, r, 12, 32); owned.push(g); return shade(new T.Mesh(g, mat)); }
  function sph(r, mat)      { const g = new T.SphereGeometry(r, 20, 16);   owned.push(g); return shade(new T.Mesh(g, mat)); }
  function at(o, x, y, z)   { o.position.set(x, y, z); return o; }
  function merge(geoms, mat) {                    // BufferGeometryUtils is optional
    if (!geoms || !geoms.length) return [];
    const U = T.BufferGeometryUtils || (T.mergeBufferGeometries ? T : null);
    // call as a METHOD: three's BufferGeometryUtils uses `this` internally
    if (U) { const g = U.mergeBufferGeometries ? U.mergeBufferGeometries(geoms) : U.mergeGeometries(geoms);
      if (g) { owned.push(g); return [shade(new T.Mesh(g, mat))]; } }
    return geoms.map(g => { owned.push(g); return shade(new T.Mesh(g, mat)); });
  }

  /** vertical tank with rounded heads (lathe profile) */
  function tank(R, H, mat) {
    const p = [], n = 12, cap = R * .42;
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI / 2 * i / n;
      p.push(new T.Vector2(Math.cos(a) * R, cap + Math.sin(a) * cap)); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 * i / n;
      p.push(new T.Vector2(Math.cos(a) * R, cap + H + Math.sin(a) * cap)); }
    const g = new T.LatheGeometry(p, 44); owned.push(g);
    return shade(new T.Mesh(g, mat));
  }
  /** electric motor: body, cooling fins, shaft */
  function motor(R, L, mat) {
    const g = new T.Group();
    const b = cyl(R, R, L, mat || M.body2, 24); b.rotation.z = Math.PI / 2; g.add(b);
    for (let i = 0; i < 7; i++) { const f = torus(R * 1.06, R * .07, M.body2);
      f.rotation.y = Math.PI / 2; f.position.x = -L / 2 + L * (i + .5) / 7; g.add(f); }
    g.add(at(cyl(R * .5, R * .5, R * .5, M.dark, 16), L / 2 + R * .2, 0, 0).rotateZ(Math.PI / 2));
    g.add(at(cyl(R * .16, R * .16, L * .35, M.steel, 14), -L / 2 - L * .16, 0, 0).rotateZ(Math.PI / 2));
    return g;
  }
  /** 4-leg machine frame with base skirt */
  function frame(w, d, h, mat) {
    const g = new T.Group(), lg = .22;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p =>
      g.add(at(box(lg, h, lg, mat || M.body2, .05), p[0] * (w / 2 - lg), 0, p[1] * (d / 2 - lg))));
    g.add(at(box(w, .14, d, M.dark, .03), 0, h - .14, 0));
    return g;
  }
  /** safety fence: posts, rails, wire mesh */
  function fence(len, mat) {
    const g = new T.Group(), H = 1.9, n = Math.max(2, Math.round(len / 2.2));
    for (let i = 0; i <= n; i++) g.add(at(cyl(.055, .055, H, mat || M.warn, 12), -len / 2 + len * i / n, H / 2, 0));
    [.35, H - .12].forEach(y => g.add(at(cyl(.035, .035, len, M.warn, 10), 0, y, 0).rotateZ(Math.PI / 2)));
    const wire = [];
    for (let i = 0; i <= Math.round(len / .28); i++) {
      const g2 = new T.CylinderGeometry(.012, .012, H - .5, 6);
      g2.translate(-len / 2 + i * .28, (H - .5) / 2 + .35, 0); wire.push(g2);
    }
    merge(wire, M.body2).forEach(m => g.add(m));
    return g;
  }
  /**
   * control cabinet: HMI screen, pilot lamps, status beacon (+ its point light)
   * @param {string} [status]
   * @param {object} [owner] the top-level machine group this cabinet belongs
   *   to (create() passes its own `g`) — tags the beacon pulse registry entry
   *   so `kit.release(owner)` can find and remove it. Optional: `kit.parts.cabinet()`
   *   called standalone (no owner) just never gets auto-released, same as before.
   */
  function cabinet(status, owner) {
    const g = new T.Group(), col = STATUS[status] || STATUS.idle;
    g.add(box(1.5, 2.1, .75, M.body, .09));
    g.add(at(box(.92, .62, .06, M.screen, .02), 0, 1.42, .4));
    g.add(at(box(1.2, .05, .09, M.accent, .02), 0, .72, .4));
    [0x22c55e, 0xf59e0b, 0xef4444].forEach((c, i) => g.add(at(sph(.045, lampMat(c)), -.5 + i * .16, 1.0, .41)));
    g.add(at(cyl(.035, .035, .7, M.steel, 10), .55, 2.45, 0));
    const bulb = at(sph(.15, lampMat(col)), .55, 2.9, 0); bulb.name = 'beacon'; g.add(bulb);
    if (opt.beaconLights) {
      const lt = new T.PointLight(col, .9, 7);
      lt.decay = 1; // three r155+ default decay 1 -> 2 made this beacon dimmer than tuned; pin it back to 1.
      lt.position.set(.55, 2.9, 0); g.add(lt);
    }
    pulse.push({ o: bulb.material, key: 'emissiveIntensity', base: 1.5, amp: .5, sp: 3, owner: owner });
    return g;
  }
  /** signage gantry with canvas-rendered plaque */
  function textTex(txt, sub) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const x = cv.getContext('2d');
    x.fillStyle = '#0e141a'; x.fillRect(0, 0, 512, 128);
    x.fillStyle = '#14b8a6'; x.fillRect(0, 0, 10, 128);
    x.fillStyle = '#e8edf2'; x.font = 'bold 54px sans-serif'; x.textBaseline = 'middle';
    x.fillText(txt, 32, 50);
    if (sub) { x.fillStyle = '#7d8b9a'; x.font = '30px sans-serif'; x.fillText(sub, 32, 98); }
    const t = new T.CanvasTexture(cv);
    if (T.sRGBEncoding) t.encoding = T.sRGBEncoding;
    if (T.SRGBColorSpace) t.colorSpace = T.SRGBColorSpace; // modern three (r152+) equivalent of the encoding above
    t.anisotropy = 4; owned.push(t); return t;
  }
  function sign(label, sub) {
    const g = new T.Group();
    [-1, 1].forEach(sx => g.add(at(cyl(.055, .055, 2.5, M.body2, 10), sx * 1.15, 1.25, 0)));
    g.add(at(box(2.6, .1, .16, M.body2, .03), 0, 2.5, 0));
    // The plaque's geometry + material (+ its baked-text CanvasTexture inside
    // textTex()) are UNIQUE per sign() call — never cached/shared like the
    // posts/bars above. Track both in `owned` (so a full kit.dispose() frees
    // them even if nobody freed them individually first) AND tag the mesh
    // `plaque:true` so a caller that regenerates a plaque (e.g. re-labelling a
    // reused machine group) can find and dispose THIS specific mesh's
    // resources immediately, without touching the shared cyl()/box() parts.
    const plaqueGeo = new T.PlaneGeometry(2.2, .55); owned.push(plaqueGeo);
    const plaqueMat = mkMat(0xffffff, 0, .6, { map: textTex(label, sub), emissive: 0xffffff, emissiveIntensity: .18 });
    owned.push(plaqueMat);
    const p = new T.Mesh(plaqueGeo, plaqueMat);
    p.userData.plaque = true;
    p.position.set(0, 2.12, .09); g.add(p);
    g.add(at(box(2.3, .66, .07, M.dark, .03), 0, 1.79, 0));
    return g;
  }

  /* ------------------------------------------------------- conveyor */
  function beltTex() {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 16;
    const x = cv.getContext('2d');
    x.fillStyle = '#22282f'; x.fillRect(0, 0, 64, 16);
    x.fillStyle = '#2f3841'; x.fillRect(0, 0, 64, 3);
    x.fillStyle = '#3a444e'; for (let i = 0; i < 64; i += 16) x.fillRect(i, 4, 9, 12);
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.NearestFilter; owned.push(t); return t;
  }
  /**
   * Roller conveyor running along +X, centred on the group origin.
   * The belt tread scrolls, rollers and pulleys roll about their own axis,
   * all at the same surface speed — no orbiting, no sliding mismatch.
   */
  function conveyor(len, width) {
    const w = width || 1.5, g = new T.Group(), H = 1.05, RR = .085;
    const tex = beltTex(); tex.repeat.set(len / .8, 1);
    const bm = mkMat(0xffffff, .15, .85, { map: tex }); owned.push(bm); // was never tracked — leaked at kit.dispose()
    g.add(at(box(len, .1, w, bm, .03), 0, H, 0));
    belts.push({ tex: tex, per: .8, owner: g });
    [-1, 1].forEach(s => g.add(at(box(len, .26, .1, M.body, .03), 0, H + .06, s * (w / 2 + .05))));
    const n = Math.floor(len / .55);
    for (let i = 0; i < n; i++) {
      const holder = new T.Group(); holder.rotation.x = Math.PI / 2;   // holder tilts...
      const r = cyl(RR, RR, w - .06, M.steel, 14); r.name = 'roller';  // ...roller spins on local Y
      holder.add(r); holder.position.set(-len / 2 + .3 + i * .55, H + .13, 0); g.add(holder);
      spin.push({ o: r, ax: 'y', sp: BELT_V / RR, owner: g });
    }
    [-1, 1].forEach(s => {                                             // drive + tail pulley
      const hp = new T.Group(); hp.rotation.x = Math.PI / 2;
      const p = cyl(.16, .16, w + .02, M.body2, 20); hp.add(p);
      hp.position.set(s * (len / 2 - .16), H + .06, 0); g.add(hp);
      spin.push({ o: p, ax: 'y', sp: BELT_V / .16, owner: g });
    });
    for (let i = 0; i <= Math.floor(len / 3); i++) [-1, 1].forEach(s =>
      g.add(at(cyl(.06, .06, H, M.body2, 10), -len / 2 + .4 + i * 3, H / 2, s * (w / 2 - .05))));
    g.userData = { kind: 'conveyor', len: len, width: w, beltTop: H + .1, speed: BELT_V };
    return g;
  }
  /** work pieces that slide along a conveyor at belt speed */
  function workpieces(conv, count) {
    const N = count === undefined ? 3 : count, out = new T.Group();
    const len = conv.userData.len, top = conv.userData.beltTop;
    for (let k = 0; k < N; k++) {
      const wip = at(box(.85, .5, .62, M.battery, .06), 0, top, 0);
      wip.add(at(box(.7, .06, .5, M.accent, .02), 0, .28, 0));
      wip.userData.trav = { x0: -len / 2 + .5, x1: len / 2 - .5, t: k / N };
      wip.userData.owner = conv;
      out.add(wip); travellers.push(wip);
    }
    conv.add(out); return out;
  }

  /* ------------------------------------------------ machine archetypes */
  const MACHINES = {
    /** lead grid casting: furnace shell, glowing pot, cooling drum, fume hood */
    furnace(g) {
      g.add(frame(6.4, 4.4, 1.0));
      g.add(at(box(6.2, 2.6, 4.2, M.body, .28), 0, 1.0, 0));
      g.add(at(cyl(1.15, .95, 1.1, M.body2, 28), -1.6, 3.6, 0));
      g.add(at(cyl(1.02, 1.02, .12, M.hot, 28), -1.6, 4.12, 0));
      if (opt.beaconLights) {
        const pl = new T.PointLight(0xff6a1f, 2.2, 10);
        pl.decay = 1; // see Fix 2 in the header comment
        pl.position.set(-1.6, 4.4, 0); g.add(pl);
        pulse.push({ o: pl, key: 'intensity', base: 2.2, amp: .55, sp: 2.1, owner: g });
      }
      g.add(at(box(3.0, .9, 2.6, M.body2, .2), -1.6, 5.2, 0));
      g.add(tube([[-1.6,6.1,0],[-1.6,7.2,0],[1.2,7.6,0],[3.4,7.2,0]], .34, M.steel));
      const drum = at(cyl(1.05, 1.05, 2.9, M.steel, 30), 1.9, 4.2, 0);
      drum.rotation.x = Math.PI / 2; g.add(drum); spin.push({ o: drum, ax: 'y', sp: .9, owner: g });
      g.add(at(motor(.34, 1.0), 3.6, 4.2, 0));
      g.add(tube([[1.9,4.2,1.6],[1.9,5.4,2.3],[1.9,5.4,3.4]], .11, M.copper));
      return { footprint: [7.4, 5.0] };
    },
    /** paste mixer: twin agitator tanks, drives, product piping */
    mixer(g) {
      g.add(at(box(7.0, .5, 5.0, M.body2, .1), 0, 0, 0));
      [-1.75, 1.75].forEach(x => {
        g.add(at(tank(1.5, 3.4, M.steel), x, .5, 0));
        const drv = at(motor(.42, 1.2), x, 6.35, 0); drv.rotation.y = Math.PI / 2; g.add(drv);
        g.add(at(cyl(.11, .11, 3.4, M.steel, 12), x, 3.4, 0));
        const bl = new T.Group();
        for (let k = 0; k < 3; k++) { const b = at(box(1.9, .09, .42, M.steel, .03), 0, 1.5 + k * .55, 0);
          b.rotation.y = k * Math.PI * 2 / 3; bl.add(b); }
        bl.position.set(x, .9, 0); g.add(bl); spin.push({ o: bl, ax: 'y', sp: 1.8, owner: g });
        g.add(at(torus(1.55, .09, M.body), x, 4.9, 0).rotateX(Math.PI / 2));
      });
      g.add(tube([[-1.75,1.0,1.5],[-.8,.8,2.4],[.8,.8,2.4],[1.75,1.0,1.5]], .16, M.steel));
      g.add(tube([[0,.8,2.4],[0,.8,3.6],[3.0,1.4,3.6]], .16, M.steel));
      g.add(at(fence(6.6), 0, 0, -3.1));
      return { footprint: [7.0, 6.4] };
    },
    /** plate pasting: hopper, coating rollers, belt, drying tunnel */
    coater(g) {
      g.add(frame(9.0, 3.4, 1.1));
      g.add(at(box(8.8, 1.5, 3.2, M.body, .22), 0, 1.1, 0));
      const hg = new T.CylinderGeometry(1.5, .42, 1.9, 4, 1); owned.push(hg);
      const hop = shade(new T.Mesh(hg, M.steel)); hop.rotation.y = Math.PI / 4;
      hop.position.set(-2.6, 3.6, 0); g.add(hop);
      g.add(at(box(2.4, .18, 2.4, M.body2, .05), -2.6, 4.6, 0));
      for (let i = 0; i < 5; i++) { const r = cyl(.34, .34, 3.0, M.steel, 20);
        r.rotation.x = Math.PI / 2; r.position.set(-.9 + i * 1.5, 2.95, 0); g.add(r);
        spin.push({ o: r, ax: 'y', sp: BELT_V / .34, owner: g }); }
      g.add(at(box(7.4, .07, 2.5, M.rubber, .02), .3, 2.68, 0));
      g.add(at(box(4.0, 1.6, 3.0, M.body2, .24), 2.4, 3.1, 0));
      for (let i = 0; i < 3; i++) g.add(at(box(.1, 1.0, .06, lampMat(0xff8a3d), .02), 1.2 + i * 1.2, 3.6, 1.52));
      g.add(at(motor(.4, 1.3), -4.9, 2.9, 0));
      return { footprint: [9.6, 3.6] };
    },
    /** curing chamber: insulated box, twin glazed doors, roof fans, ducting */
    oven(g) {
      const W = 8.6, H = 5.2, D = 5.4;
      g.add(at(box(W, H, D, M.body, .3), 0, 0, 0));
      g.add(at(box(W * 1.02, .3, D * 1.02, M.body2, .12), 0, H, 0));
      [-1, 1].forEach(s => {
        g.add(at(box(W * .44, H * .78, .16, M.body2, .08), s * W * .24, .3, D / 2 + .02));
        g.add(at(box(.5, .09, .13, M.steel, .03), s * W * .24 + (s > 0 ? -1.2 : 1.2), H * .42, D / 2 + .14));
        g.add(at(box(W * .3, .9, .05, M.glass, .02), s * W * .24, H * .55, D / 2 + .12));
      });
      for (let i = 0; i < 4; i++) {
        const x = -W / 2 + 1.4 + i * 2;
        g.add(at(torus(.42, .1, M.steel), x, H + .9, 0).rotateX(Math.PI / 2));
        const fan = new T.Group();
        for (let k = 0; k < 4; k++) { const bl = box(.7, .03, .2, M.steel, .01); bl.rotation.y = k * Math.PI / 2; fan.add(bl); }
        fan.position.set(x, H + .95, 0); g.add(fan); spin.push({ o: fan, ax: 'y', sp: 6, owner: g });
        g.add(at(cyl(.44, .44, .9, M.body2, 20), x, H + .45, 0));
      }
      g.add(tube([[-W/2-.4,4.4,-D/2],[-W/2-.4,6.6,-D/2],[W/2+.4,6.6,-D/2],[W/2+.4,3.0,-D/2]], .3, M.steel));
      return { footprint: [W + .8, D + .8] };
    },
    /** hydraulic press: tie-bars, moving crown, die table with plate stack */
    press(g) {
      g.add(at(box(5.6, .7, 5.0, M.body2, .12), 0, 0, 0));
      const H = 6.2;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p => g.add(at(cyl(.19, .19, H, M.steel, 16), p[0] * 2.1, .7 + H / 2, p[1] * 1.9)));
      g.add(at(box(5.2, 1.1, 4.4, M.body, .2), 0, H + .2, 0));
      const ram = at(box(3.6, 1.4, 3.2, M.body2, .16), 0, 4.2, 0); g.add(ram);
      swing.push({ o: ram, axis: 'y', base: 4.2, amp: .85, sp: 1.15, owner: g });
      g.add(at(cyl(.55, .55, 1.6, M.steel, 20), 0, H - .2, 0));
      g.add(at(box(3.8, .5, 3.0, M.lead, .06), 0, .7, 0));
      for (let i = 0; i < 6; i++)
        g.add(at(box(1.6, .035, 1.1, M.lead, .01), -.6 + (i % 2) * 1.4, 1.2 + i * .05, -.7 + Math.floor(i / 2) * .7));
      g.add(at(fence(5.4), 0, 0, -3.0));
      g.add(at(fence(5.4), 0, 0, 3.0));
      return { footprint: [5.6, 6.4] };
    },
    /** 6-axis robot cell with mould index table (COS assembly) */
    robot(g) {
      g.add(at(box(6.4, .55, 5.8, M.body2, .1), 0, 0, 0));
      g.add(at(cyl(.95, 1.15, 1.2, M.body, 26), -1.4, 1.15, 0));
      g.add(at(torus(.98, .1, M.dark), -1.4, 1.72, 0).rotateX(Math.PI / 2));
      const j1 = new T.Group(); j1.position.set(-1.4, 1.75, 0); g.add(j1);
      swing.push({ o: j1, axis: 'rotY', base: 0, amp: .95, sp: .5, owner: g });
      j1.add(at(cyl(.74, .8, .7, M.accent, 26), 0, .35, 0));
      j1.add(at(box(1.2, 1.3, 1.4, M.accent, .3), 0, .7, 0));
      [-1, 1].forEach(sz => j1.add(at(torus(.4, .15, M.body2), 0, 1.9, sz * .66).rotateY(Math.PI / 2)));
      const j2 = new T.Group(); j2.position.set(0, 1.9, 0); j1.add(j2);
      swing.push({ o: j2, axis: 'rotZ', base: -.55, amp: .28, sp: .7, owner: g });
      j2.add(at(box(.7, 2.5, .92, M.accent, .22), 0, 0, 0));
      j2.add(at(box(.28, 2.1, 1.02, M.body2, .08), 0, .2, 0));
      const j3 = new T.Group(); j3.position.set(0, 2.5, 0); j2.add(j3);
      swing.push({ o: j3, axis: 'rotZ', base: 1.15, amp: .4, sp: .9, owner: g });
      j3.add(at(torus(.4, .19, M.body2), 0, 0, 0).rotateY(Math.PI / 2));
      j3.add(at(box(2.3, .55, .66, M.accent, .18), 1.15, -.275, 0));
      j3.add(at(cyl(.15, .15, 1.6, M.steel, 12), 1.1, -.42, 0).rotateZ(Math.PI / 2));
      j3.add(tube([[0,.3,.36],[.9,.55,.4],[1.8,.2,.36],[2.3,-.1,.26]], .065, M.dark));
      const w = new T.Group(); w.position.set(2.3, 0, 0); j3.add(w);
      swing.push({ o: w, axis: 'rotZ', base: 0, amp: .45, sp: 1.25, owner: g });
      w.add(at(cyl(.26, .26, .5, M.steel, 18), 0, 0, 0).rotateZ(Math.PI / 2));
      w.add(at(box(.5, .4, .6, M.dark, .08), .3, -.2, 0));
      [-1, 1].forEach(sz => {
        w.add(at(box(.11, .46, .11, M.steel, .03), .62, -.5, sz * .18));
        w.add(at(box(.2, .09, .13, M.dark, .03), .74, -.55, sz * .18));
      });
      const car = new T.Group(); car.position.set(2.1, .55, 0); g.add(car);
      car.add(at(cyl(1.7, 1.85, .5, M.body, 36), 0, .25, 0));
      car.add(at(cyl(1.4, 1.4, .08, M.dark, 32), 0, .54, 0));
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3, R = 1.15, cell = new T.Group();
        cell.position.set(Math.cos(a) * R, .5, Math.sin(a) * R); cell.rotation.y = -a;
        cell.add(box(.8, .34, .56, M.lead, .05));
        cell.add(at(box(.62, .09, .42, M.copper, .02), 0, .34, 0));
        [-1, 1].forEach(sz => cell.add(at(cyl(.05, .05, .28, M.steel, 8), .3, .5, sz * .14)));
        car.add(cell);
      }
      spin.push({ o: car, ax: 'y', sp: .45, owner: g });
      g.add(at(motor(.28, .85), 2.1, .85, 2.2));
      g.add(at(fence(6.0), 0, 0, -3.3));
      return { footprint: [6.4, 6.6] };
    },
    /** sealing / heat-weld cell: guarded enclosure, travelling weld head, fume duct */
    cell(g) {
      const W = 6.2, H = 4.6, D = 5.0;
      g.add(at(box(W, .5, D, M.body2, .1), 0, 0, 0));
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(p => g.add(at(box(.22, H, .22, M.body, .05), p[0] * (W / 2 - .15), .5, p[1] * (D / 2 - .15))));
      g.add(at(box(W, .3, D, M.body, .1), 0, H + .5, 0));
      [-1, 1].forEach(s => g.add(at(box(W - .7, H - .9, .05, M.glass, .02), 0, 1.0, s * (D / 2 - .12))));
      g.add(at(box(.3, .3, D - 1.0, M.steel, .06), 0, H + .1, 0));
      const head = new T.Group(); head.position.set(0, H - .3, 0); g.add(head);
      head.add(at(box(.7, .9, .7, M.body2, .1), 0, -.9, 0));
      head.add(at(cyl(.13, .05, 1.1, M.copper, 16), 0, -1.45, 0));
      head.add(at(sph(.1, lampMat(0x7dd3fc)), 0, -2.05, 0));
      swing.push({ o: head, axis: 'z', base: 0, amp: 1.5, sp: .8, owner: g });
      swing.push({ o: head, axis: 'y', base: H - .3, amp: .35, sp: 1.6, owner: g });
      if (opt.beaconLights) {
        const wl = new T.PointLight(0x9ad6ff, 1.6, 8);
        wl.decay = 1; // see Fix 2 in the header comment
        wl.position.set(0, 2.0, 0); g.add(wl);
        pulse.push({ o: wl, key: 'intensity', base: 1.0, amp: .9, sp: 5.5, owner: g });
      }
      g.add(tube([[0,H+.8,0],[0,H+2.2,0],[W/2+1.6,H+2.6,0]], .32, M.steel));
      return { footprint: [W, D] };
    },
    /** acid filling: dosing gantry, acid tank, nozzle bar */
    filler(g) {
      g.add(frame(7.2, 4.0, 1.1));
      g.add(at(box(7.0, .9, 3.8, M.body, .18), 0, 1.1, 0));
      g.add(at(tank(1.25, 2.6, M.steel), -2.8, 2.0, 0));
      g.add(at(cyl(1.1, 1.1, 1.8, M.acid, 26), -2.8, 3.0, 0));
      g.add(tube([[-2.8,4.9,0],[-1.0,5.4,0],[1.6,5.4,0]], .14, M.steel));
      [-1, 1].forEach(s => g.add(at(cyl(.14, .14, 4.2, M.steel, 14), 1.6, 3.1, s * 1.6)));
      const gantry = new T.Group(); gantry.position.set(1.6, 4.6, 0); g.add(gantry);
      gantry.add(at(box(2.2, .4, 3.6, M.body2, .1), 0, -.2, 0));
      for (let i = 0; i < 6; i++) gantry.add(at(cyl(.06, .04, .85, M.steel, 10), -.7 + (i % 3) * .7, -.6, -.9 + Math.floor(i / 3) * 1.8));
      swing.push({ o: gantry, axis: 'y', base: 4.6, amp: .5, sp: 1.05, owner: g });
      for (let i = 0; i < 3; i++) g.add(at(box(.7, .45, .5, M.battery, .05), 1.0 + i * .9, 2.0, 0));
      return { footprint: [7.2, 4.2] };
    },
    /** charging bank: cabinet rows, battery racks, copper busbars */
    charger(g) {
      g.add(at(box(9.0, .4, 6.2, M.body2, .08), 0, 0, 0));
      for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
        const x = -3.2 + i * 1.6, z = r ? -1.8 : 1.8, f = r ? -.68 : .68;
        g.add(at(box(1.5, 2.5, 1.3, M.body, .1), x, .4, z));
        g.add(at(box(1.0, .5, .05, M.screen, .02), x, 2.2, z + f));
        for (let k = 0; k < 4; k++) g.add(at(box(1.15, .12, 1.1, M.battery, .03), x, .55 + k * .42, z));
        g.add(at(sph(.06, lampMat(i === 4 && r === 1 ? 0xf59e0b : 0x22c55e)), x, 2.62, z + f));
      }
      [-1, 1].forEach(s => g.add(at(box(8.4, .14, .14, M.copper, .03), 0, 3.2, s * 1.8)));
      for (let i = 0; i < 5; i++) [-1, 1].forEach(s => g.add(at(cyl(.04, .04, .6, M.copper, 8), -3.2 + i * 1.6, 2.9, s * 1.8)));
      g.add(at(fence(8.8), 0, 0, -3.6));
      return { footprint: [9.0, 7.4] };
    },
    /** testing + palletising: scanner arch, pick-and-place arm, pallet stack */
    packer(g) {
      g.add(at(box(7.0, .4, 4.6, M.body2, .09), 0, 0, 0));
      [-1, 1].forEach(s => g.add(at(box(.35, 3.4, .5, M.body, .08), -1.6, .4, s * 1.5)));
      g.add(at(box(.35, .5, 3.5, M.body, .08), -1.6, 3.8, 0));
      for (let i = 0; i < 5; i++) g.add(at(box(.07, .22, .1, lampMat(0x38bdf8), .02), -1.55, 3.4, -1.2 + i * .6));
      const rob = new T.Group(); rob.position.set(2.0, .4, 0); g.add(rob);
      rob.add(at(cyl(.75, .9, 1.0, M.body, 22), 0, .5, 0));
      const ar = new T.Group(); ar.position.set(0, 1.0, 0); rob.add(ar);
      swing.push({ o: ar, axis: 'rotY', base: 0, amp: 1.35, sp: .42, owner: g });
      ar.add(at(box(2.6, .42, .52, M.accent, .12), 1.1, 0, 0));
      ar.add(at(box(.7, .55, .9, M.dark, .08), 2.3, -.2, 0));
      for (let i = 0; i < 3; i++) g.add(at(box(1.4, .16, 1.1, M.warn, .03), 3.1, .4 + i * .2, 1.5));
      for (let i = 0; i < 4; i++) g.add(at(box(1.2, .42, .95, M.battery, .05), 3.1, 1.0 + i * .44, 1.5));
      return { footprint: [7.6, 4.6] };
    },
  };

  /* --------------------------------------------------------- public API */
  const TYPES = Object.keys(MACHINES);

  /**
   * Build one machine.
   * @param {string} type   one of kit.types
   * @param {object} [o]    { id, label, sub, status:'run'|'warn'|'stop'|'idle',
   *                          cabinet:true, sign:true, rot (radians), position:{x,y,z} }
   * @returns {THREE.Group} footprint centred on origin, base on y=0
   */
  function create(type, o) {
    if (!MACHINES[type]) throw new Error('plant-machines: unknown type "' + type + '". Known: ' + TYPES.join(', '));
    o = o || {};
    const g = new T.Group();
    const meta = MACHINES[type](g) || {};
    const fp = meta.footprint || [6, 5];
    if (o.cabinet !== false) g.add(at(cabinet(o.status || 'run', g), fp[0] / 2 + .9, 0, fp[1] / 2 - 1.2));
    if (o.sign !== false && o.label) g.add(at(sign(o.label, o.sub || ''), 0, 0, fp[1] / 2 + 1.4));
    g.userData = Object.assign({ machineType: type, id: o.id || type, status: o.status || 'run',
      footprint: fp }, o.userData || {});
    g.traverse(m => { if (m.isMesh) m.userData.machineId = g.userData.id; });
    if (o.rot) g.rotation.y = o.rot;
    if (o.position) g.position.set(o.position.x || 0, o.position.y || 0, o.position.z || 0);
    return g;
  }

  /**
   * Instantiate a whole layout. Coordinates are METRES, +X = flow, y is up.
   * @param {THREE.Object3D} parent
   * @param {object} layout  { machines:[{id,type,x,z,rot,status,label,sub}],
   *                           conveyors:[{x,z,rot,len,width,parts}] }
   * @returns {{machines:Object, conveyors:Array}} lookup by id
   */
  function place(parent, layout) {
    const out = { machines: {}, conveyors: [] };
    (layout.machines || []).forEach(m => {
      const g = create(m.type, m);
      g.position.set(m.x || 0, m.y || 0, m.z || 0);
      g.rotation.y = (m.rot || 0) * (layout.degrees ? Math.PI / 180 : 1);
      parent.add(g); out.machines[g.userData.id] = g;
    });
    (layout.conveyors || []).forEach(c => {
      const g = conveyor(c.len, c.width);
      g.position.set(c.x || 0, c.y || 0, c.z || 0);
      g.rotation.y = (c.rot || 0) * (layout.degrees ? Math.PI / 180 : 1);
      if (c.parts !== 0) workpieces(g, c.parts);
      parent.add(g); out.conveyors.push(g);
    });
    return out;
  }

  /** recolour a machine's beacon + stored status */
  function setStatus(machine, status) {
    machine.userData.status = status;
    const col = STATUS[status] || STATUS.idle;
    machine.traverse(o => {
      if (o.name === 'beacon') { o.material = lampMat(col); }
      if (o.isPointLight && o.parent && o.parent.children.some(c => c.name === 'beacon')) o.color.setHex(col);
    });
  }

  /** drive every animation. Call once per frame with the frame delta in seconds. */
  let tSec = 0;
  function tick(dt) {
    dt = Math.min(dt || 0, .05); tSec += dt;
    for (let i = 0; i < spin.length; i++) spin[i].o.rotation[spin[i].ax] += spin[i].sp * dt;
    for (let i = 0; i < swing.length; i++) {
      const s = swing[i], v = Math.sin(tSec * s.sp) * s.amp;
      if (s.axis === 'rotY') s.o.rotation.y = s.base + v;
      else if (s.axis === 'rotZ') s.o.rotation.z = s.base + v;
      else if (s.axis === 'y') s.o.position.y = s.base + Math.abs(v);
      else s.o.position[s.axis] = s.base + v;
    }
    for (let i = 0; i < pulse.length; i++) { const p = pulse[i];
      p.o[p.key] = p.base + Math.sin(tSec * p.sp) * p.amp; }
    for (let i = 0; i < belts.length; i++) { const b = belts[i];
      b.tex.offset.x = (b.tex.offset.x - dt * BELT_V / b.per) % 1; }
    for (let i = 0; i < travellers.length; i++) {
      const w = travellers[i], d = w.userData.trav, L = d.x1 - d.x0;
      d.t = (d.t + dt * BELT_V / L) % 1; w.position.x = d.x0 + L * d.t;
    }
  }

  /** free every geometry/texture/material this kit created (incl. the cached lampMat()s) */
  function dispose() {
    owned.forEach(o => o.dispose && o.dispose());
    Object.keys(M).forEach(k => M[k].dispose());
    lampMatCache.forEach(m => m.dispose());
    lampMatCache.clear();
    owned.length = spin.length = swing.length = pulse.length = belts.length = travellers.length = 0;
  }

  return { types: TYPES, materials: M, statusColors: STATUS, beltSpeed: BELT_V,
           create, conveyor, workpieces, place, setStatus, tick, dispose, release,
           parts: { box, cyl, tube, torus, sph, tank, motor, frame, fence, cabinet, sign } };
}
