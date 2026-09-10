/**
 * plantBuildingsKit.js — vendored ES module build of the procedural factory
 * BUILDING + site kit.
 * ---------------------------------------------------------------------------
 * Source of truth: Model_3D/dist/plant-buildings.js (UMD, 439 lines, validated
 * with `node --check`). See Model_3D/README.md for the full API contract.
 * Companion to plantMachinesKit.js (frontend/src/lib/vendor/plantMachinesKit.js) —
 * everything the machines stand in and on: building shells with column grids
 * and roof trusses, interior rooms, pallet racking, utility sheds, gas-tank
 * farms, roads, parking bays, kerbs, poles, trees, perimeter fence.
 *
 * Extraction: the UMD wrapper `(function (root, factory) { ... }(...))` was
 * removed and replaced with a plain ES module that exports `createPlantBuildings`
 * as a named export. The body of `createPlantBuildings(T, options)` (materials,
 * geometry helpers, building/site primitives, public API) is otherwise
 * byte-identical to the source — no restyling, no behavior changes beyond the
 * one three.js r180 compatibility fix below. To re-derive this file: take
 * Model_3D/dist/plant-buildings.js, drop the UMD wrapper, and re-apply this fix.
 *
 * Fix 1 — canvas texture color space (zoneLabel(), the only canvas texture in
 * this kit):
 *   The kit sets `t.encoding = T.sRGBEncoding` guarded by a feature check (this
 *   API was removed in three r152+). Added a second guarded branch that sets
 *   the modern `t.colorSpace = T.SRGBColorSpace` when it exists, alongside the
 *   legacy branch, so the zone-label texture renders in the correct color space
 *   on three 0.180.
 *
 * Fix 2 — PointLight decay: NOT APPLIED. Unlike plantMachinesKit.js, this kit
 * constructs no `THREE.PointLight` anywhere (grepped the source to confirm),
 * so there is nothing to patch for the r155 decay-default change.
 */

export function createPlantBuildings(T, options) {
  if (!T || !T.BufferGeometry) throw new Error('plant-buildings: pass the THREE namespace first');
  const opt = Object.assign({ shadows: true }, options || {});
  const mk = (c, m, r, x) => new T.MeshStandardMaterial(Object.assign({ color: c, metalness: m, roughness: r }, x || {}));

  const M = {
    wall:    mk(0x3c4650, .20, .80),
    wallIn:  mk(0x2b333c, .12, .88),
    steel:   mk(0x71808d, .88, .32),
    frame:   mk(0x323b45, .55, .48),
    roof:    mk(0x333c46, .38, .68),
    parapet: mk(0x2e3741, .32, .70),
    glass:   mk(0x9fd8ff, .10, .05, { transparent: true, opacity: .18 }),
    door:    mk(0x353d46, .40, .60),
    slab:    mk(0x323b44, .10, .96),
    slabIn:  mk(0x3c444d, .08, .95),
    road:    mk(0x30353b, .05, .96),
    kerb:    mk(0x4a525b, .10, .88),
    paint:   mk(0xd9b400, .06, .70),
    paintW:  mk(0xcfd6dd, .06, .70),
    grass:   mk(0x18291b, .02, .98),
    trunk:   mk(0x2a2118, .05, .95),
    leaf:    mk(0x24422a, .03, .90),
    rack:    mk(0xd97706, .40, .55),
    pallet:  mk(0x4a3c2a, .05, .92),
    tank:    mk(0xb9c4cd, .90, .26),
    lamp:    mk(0xdfeaf5, .00, .40, { emissive: 0xcfe0f0, emissiveIntensity: .9 }),
    signGrn: mk(0x0f766e, .20, .60, { emissive: 0x0f766e, emissiveIntensity: .35 }),
  };

  const owned = [];
  const shade = m => { m.castShadow = m.receiveShadow = opt.shadows; return m; };
  function boxG(w, h, d) { const g = new T.BoxGeometry(w, h, d); owned.push(g); return g; }
  /** box with its BASE on y=0, centred in x/z */
  function box(w, h, d, mat) { const m = shade(new T.Mesh(boxG(w, h, d), mat)); m.position.y = h / 2; return m; }
  function at(o, x, y, z) { o.position.set(x, o.position.y + (y || 0), z); return o; }
  function put(o, x, y, z) { o.position.set(x, y, z); return o; }
  function cyl(rt, rb, h, mat, seg) { const g = new T.CylinderGeometry(rt, rb, h, seg || 20); owned.push(g); return shade(new T.Mesh(g, mat)); }
  function plane(w, d, mat) { const g = new T.PlaneGeometry(w, d); owned.push(g);
    const m = new T.Mesh(g, mat); m.rotation.x = -Math.PI / 2; m.receiveShadow = opt.shadows; return m; }
  function merged(geoms, mat) {
    if (!geoms || !geoms.length) return new T.Group();   // merging nothing is not an error
    const U = T.BufferGeometryUtils;
    if (U && U.mergeBufferGeometries) { const g = U.mergeBufferGeometries(geoms);
      if (g) { owned.push(g); return shade(new T.Mesh(g, mat)); } }
    const grp = new T.Group(); geoms.forEach(g => { owned.push(g); grp.add(shade(new T.Mesh(g, mat))); }); return grp;
  }

  /* ------------------------------------------------------------ building shell */
  /**
   * Building shell with PER-FLOOR groups, so each storey can be shown alone.
   *
   * @param {object} o { w, d, h, floors=1, floorH, bay, clerestory, roof,
   *                     roofStyle:'flat'|'pitched', columns, stairs,
   *                     doors:[{side:'N'|'S'|'E'|'W', at, w}], name }
   * @returns {THREE.Group} userData.roof = roof group,
   *                        userData.floorGroups = [floor1, floor2, ...]
   */
  function shell(o) {
    o = Object.assign({ w: 60, d: 40, h: 9.5, floors: 1, bay: 8, clerestory: true,
                        roof: true, roofStyle: 'flat', columns: true, stairs: true,
                        doors: [], name: '' }, o);
    const W = o.w, D = o.d, N = Math.max(1, o.floors | 0);
    const fh = o.floorH || o.h / N, H = fh * N, t = .35;
    const g = new T.Group();
    const floorGroups = [];
    g.userData = { kind: 'building', name: o.name, w: W, d: D, h: H, floors: N, floorH: fh, floorGroups };

    const gaps = { N: [], S: [], E: [], W: [] };
    o.doors.forEach(d => (gaps[d.side] || gaps.N).push(d));

    /** one wall run on one floor: dado + glazing band + door openings */
    function wallRun(parent, side, len, fixed, horiz, y0, hgt, withDoors) {
      const dado = o.clerestory ? hgt * .62 : hgt;
      const cler = hgt - dado;
      const holes = withDoors ? (gaps[side] || []).slice().sort((a, b) => a.at - b.at) : [];
      const doorH = Math.min(hgt * .55, 5);
      let cursor = -len / 2; const runs = [];
      holes.forEach(h => { const a = h.at - h.w / 2, b = h.at + h.w / 2;
        if (a > cursor) runs.push([cursor, a]); cursor = Math.max(cursor, b); });
      if (cursor < len / 2) runs.push([cursor, len / 2]);
      runs.forEach(r => {
        const Lr = r[1] - r[0], c = (r[0] + r[1]) / 2;
        if (Lr <= .01) return;
        const w1 = horiz ? box(Lr, dado, t, M.wall) : box(t, dado, Lr, M.wall);
        parent.add(horiz ? put(w1, c, y0 + dado / 2, fixed) : put(w1, fixed, y0 + dado / 2, c));
      });
      holes.forEach(h => {
        const hh = dado - doorH;
        if (hh > .05) {
          const head = horiz ? box(h.w, hh, t, M.wall) : box(t, hh, h.w, M.wall);
          parent.add(horiz ? put(head, h.at, y0 + doorH + hh / 2, fixed)
                           : put(head, fixed, y0 + doorH + hh / 2, h.at));
        }
        const dr = horiz ? box(h.w - .3, doorH, .12, M.door) : box(.12, doorH, h.w - .3, M.door);
        parent.add(horiz ? put(dr, h.at, y0 + doorH / 2, fixed) : put(dr, fixed, y0 + doorH / 2, h.at));
      });
      if (cler > .1) {
        const gl = horiz ? box(len, cler * .8, .1, M.glass) : box(.1, cler * .8, len, M.glass);
        parent.add(horiz ? put(gl, 0, y0 + dado + cler * .45, fixed)
                         : put(gl, fixed, y0 + dado + cler * .45, 0));
        const mull = [];
        for (let p = -len / 2; p <= len / 2; p += 3) {
          const b = boxG(horiz ? .12 : t, cler * .82, horiz ? t : .12);
          b.translate(horiz ? p : fixed, y0 + dado + cler * .45, horiz ? fixed : p); mull.push(b);
        }
        parent.add(merged(mull, M.frame));
      }
    }

    for (let f = 0; f < N; f++) {
      const fg = new T.Group(); fg.name = 'floor' + (f + 1);
      fg.userData = { kind: 'floor', level: f + 1, name: o.name };
      g.add(fg); floorGroups.push(fg);
      const y0 = f * fh;
      fg.add(put(plane(W - .6, D - .6, f ? M.slab : M.slabIn), 0, y0 + .06, 0));
      if (f) {                                        // structural floor plate + edge beam
        fg.add(put(box(W, .28, D, M.frame), 0, y0 - .28, 0));
        for (const sz of [-1, 1]) {
          fg.add(put(box(W, .5, .3, M.parapet), 0, y0 + .25, sz * (D / 2 - .15)));
          fg.add(put(box(.3, .5, D, M.parapet), sz * (W / 2 - .15), y0 + .25, 0));
        }
      }
      wallRun(fg, 'N', W, -D / 2 + t / 2, true,  y0, fh, f === 0);
      wallRun(fg, 'S', W,  D / 2 - t / 2, true,  y0, fh, f === 0);
      wallRun(fg, 'W', D, -W / 2 + t / 2, false, y0, fh, f === 0);
      wallRun(fg, 'E', D,  W / 2 - t / 2, false, y0, fh, f === 0);
      // stair core links the floors — every level stays reachable
      if (o.stairs && f < N - 1) fg.add(put(stair(fh), W / 2 - 3.2, y0, -D / 2 + 3.0));
    }

    if (o.columns) {
      const cols = [], nx = Math.max(1, Math.round(W / o.bay)), nz = Math.max(1, Math.round(D / o.bay));
      for (let i = 1; i < nx; i++) for (let j = 1; j < nz; j++) {
        const cx = -W / 2 + i * W / nx, cz = -D / 2 + j * D / nz;
        const b = boxG(.42, H, .42); b.translate(cx, H / 2, cz); cols.push(b);
        const cap = boxG(.9, .25, .9); cap.translate(cx, H - .12, cz); cols.push(cap);
      }
      g.add(merged(cols, M.frame));
    }

    if (o.roof) {
      const rg = new T.Group(); rg.name = 'roof'; g.add(rg); g.userData.roof = rg;
      for (const sz of [-1, 1]) {                     // parapet cap all round
        rg.add(put(box(W + t, .55, t * 1.6, M.parapet), 0, H + .27, sz * (D / 2 - t / 2)));
        rg.add(put(box(t * 1.6, .55, D + t, M.parapet), sz * (W / 2 - t / 2), H + .27, 0));
      }
      if (o.roofStyle === 'pitched') {
        // gable roof: two sloped planes + ridge + eaves fascia
        const slope = Math.min(D * .22, 4.2), half = D / 2 + .6;
        const rl = Math.sqrt(half * half + slope * slope);
        for (const sz of [-1, 1]) {
          const pane = box(W + 1.4, .22, rl, M.roof);
          put(pane, 0, H + .3 + slope / 2, sz * half / 2);
          pane.rotation.x = sz * Math.atan2(slope, half);
          rg.add(pane);
        }
        rg.add(put(box(W + 1.6, .45, .5, M.parapet), 0, H + .3 + slope, 0));
        for (const sz of [-1, 1]) rg.add(put(box(W + 1.6, .35, .25, M.parapet), 0, H + .34, sz * half));
      } else {
        const tr = [], nz = Math.max(1, Math.round(D / o.bay));
        for (let j = 0; j <= nz; j++) {
          const z = -D / 2 + j * D / nz;
          const ch = boxG(W, .30, .22); ch.translate(0, H + .5, z); tr.push(ch);
          const cb = boxG(W, .18, .18); cb.translate(0, H - .55, z); tr.push(cb);
          for (let x = -W / 2; x < W / 2; x += 2.4) {
            const w1 = boxG(.12, 1.5, .12); w1.rotateZ(.62); w1.translate(x + 1.2, H - .02, z); tr.push(w1);
          }
        }
        for (let x = -W / 2 + 3; x < W / 2; x += 6) { const p = boxG(.16, .16, D);
          p.translate(x, H + .78, 0); tr.push(p); }
        rg.add(merged(tr, M.steel));
        const deck = plane(W, D, M.roof); deck.rotation.x = Math.PI / 2; put(deck, 0, H + .95, 0); rg.add(deck);
        rg.add(put(box(W, 1.1, D * .18, M.roof), 0, H + .95, 0));
        const vent = [];
        for (let x = -W / 2 + 5; x < W / 2; x += 10) { const v = boxG(1.6, .9, 1.6);
          v.translate(x, H + 1.6, 0); vent.push(v); }
        rg.add(merged(vent, M.steel));
        for (let x = -W / 2 + 8; x < W / 2 - 4; x += 12) for (let z = -D / 2 + 9; z < D / 2 - 6; z += 14) {
          rg.add(put(cyl(.5, .38, .26, M.lamp, 14), x, H - 1.1, z));
          rg.add(put(cyl(.05, .05, .9, M.frame, 8), x, H - .6, z));
        }
      }
    }
    return g;
  }

  /** straight stair flight + landing, rises exactly one floor */
  function stair(h, w) {
    const g = new T.Group(); w = w || 1.6;
    const n = Math.max(6, Math.round(h / .18)), rise = h / n, run = .28;
    const steps = [];
    for (let i = 0; i < n; i++) { const b = boxG(w, rise, run);
      b.translate(0, rise * (i + .5), -run * (n / 2) + run * (i + .5)); steps.push(b); }
    g.add(merged(steps, M.slab));
    g.add(put(box(w + .3, .2, run * n + .6, M.frame), 0, -.1, 0));
    for (const sz of [-1, 1]) {                       // handrail
      const rail = [];
      for (let i = 0; i <= n; i += 3) { const b = boxG(.06, 1.0, .06);
        b.translate(sz * w / 2, rise * i + .5, -run * (n / 2) + run * i); rail.push(b); }
      g.add(merged(rail, M.steel));
    }
    g.add(put(box(w + .4, .18, 1.4, M.slab), 0, h, run * (n / 2) + .7));
    return g;
  }

  /** covered walkway linking two zones/buildings, runs along +X */
  function walkway(len, w) {
    const g = new T.Group(); w = w || 2.6;
    g.add(put(plane(len, w, M.slab), 0, .06, 0));
    const posts = [];
    for (let x = -len / 2; x <= len / 2; x += 4) for (const sz of [-1, 1]) {
      const b = boxG(.14, 2.9, .14); b.translate(x, 1.45, sz * (w / 2 - .2)); posts.push(b);
    }
    g.add(merged(posts, M.frame));
    g.add(put(box(len, .16, w + .5, M.roof), 0, 2.9, 0));
    for (const sz of [-1, 1]) g.add(put(box(len, .22, .12, M.parapet), 0, 2.95, sz * (w + .5) / 2));
    return g;
  }

  /** flower bed: kerb ring, soil, and blossom clusters in 3 colours */
  function flowerBed(w, d) {
    const g = new T.Group(); w = w || 6; d = d || 3;
    g.add(put(box(w, .34, d, M.kerb), 0, .17, 0));
    g.add(put(plane(w - .5, d - .5, M.grass), 0, .36, 0));
    const cols = [0xd94f7a, 0xf0b429, 0xe8ecef];
    const buckets = [[], [], []];
    const nx = Math.max(2, Math.round((w - 1) / .55)), nz = Math.max(2, Math.round((d - 1) / .55));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const s = new T.SphereGeometry(.16 + Math.random() * .07, 6, 5);
      s.translate(-w / 2 + .6 + i * .55 + (Math.random() - .5) * .18, .52 + Math.random() * .1,
                  -d / 2 + .6 + j * .55 + (Math.random() - .5) * .18);
      buckets[(i + j + (Math.random() * 3 | 0)) % 3].push(s);
    }
    buckets.forEach((bk, i) => { if (bk.length) g.add(merged(bk, mk(cols[i], .05, .75))); });
    g.userData = { kind: 'flowerbed', w: w, d: d };
    return g;
  }

  /** interior room: low partition walls + glazing above + floor tint + name plate */
  function room(o) {
    o = Object.assign({ w: 8, d: 6, h: 3.2, glass: true, name: '' }, o);
    const g = new T.Group(), t = .16, dado = o.glass ? o.h * .45 : o.h;
    g.userData = { kind: 'room', name: o.name, w: o.w, d: o.d };
    g.add(put(plane(o.w, o.d, M.slab), 0, .04, 0));
    [[o.w, t, 0, -o.d / 2], [o.w, t, 0, o.d / 2]].forEach(p => {
      g.add(put(box(p[0], dado, t, M.wallIn), p[2], dado / 2, p[3]));
      if (o.glass) g.add(put(box(p[0], o.h - dado, .06, M.glass), p[2], dado + (o.h - dado) / 2, p[3]));
    });
    [[-o.w / 2, 0], [o.w / 2, 0]].forEach(p => {
      g.add(put(box(t, dado, o.d, M.wallIn), p[0], dado / 2, 0));
      if (o.glass) g.add(put(box(.06, o.h - dado, o.d, M.glass), p[0], dado + (o.h - dado) / 2, 0));
    });
    g.add(put(box(o.w, .12, o.d, M.frame), 0, o.h, 0));           // ceiling band
    return g;
  }

  /** pallet racking: uprights, beams, pallets — merged into 3 draw calls */
  function rack(o) {
    o = Object.assign({ bays: 6, levels: 4, bayW: 2.7, depth: 1.1, levelH: 1.6, fill: .75 }, o);
    const g = new T.Group(), W = o.bays * o.bayW, H = o.levels * o.levelH;
    const up = [], bm = [], pl = [];
    for (let i = 0; i <= o.bays; i++) for (const sz of [-1, 1]) {
      const b = boxG(.1, H, .1); b.translate(-W / 2 + i * o.bayW, H / 2, sz * o.depth / 2); up.push(b);
      for (let l = 1; l <= o.levels; l++) { const d = boxG(.06, .5, .06);
        d.rotateX(.9); d.translate(-W / 2 + i * o.bayW, l * o.levelH - .8, sz * o.depth / 2); up.push(d); }
    }
    for (let l = 1; l <= o.levels; l++) for (const sz of [-1, 1]) {
      const b = boxG(W, .12, .08); b.translate(0, l * o.levelH, sz * o.depth / 2); bm.push(b);
    }
    for (let i = 0; i < o.bays; i++) for (let l = 0; l < o.levels; l++) {
      if (Math.random() > o.fill) continue;
      const b = boxG(o.bayW * .82, o.levelH * .62, o.depth * .92);
      b.translate(-W / 2 + (i + .5) * o.bayW, l * o.levelH + o.levelH * .38, 0); pl.push(b);
    }
    g.add(merged(up, M.rack)); g.add(merged(bm, M.rack));
    if (pl.length) g.add(merged(pl, M.pallet));
    g.userData = { kind: 'rack', w: W, d: o.depth, h: H };
    return g;
  }

  /** utility shed / annex: flat-roof block with door and louvre */
  function shed(o) {
    o = Object.assign({ w: 6, d: 4, h: 3.4, louvre: true, name: '' }, o);
    const g = new T.Group();
    g.add(box(o.w, o.h, o.d, M.wall));
    g.add(put(box(o.w + .4, .35, o.d + .4, M.parapet), 0, o.h, 0));
    g.add(put(box(Math.min(2.2, o.w * .4), 2.4, .1, M.door), 0, 1.2, o.d / 2 + .05));
    if (o.louvre) { const lv = [];
      for (let i = 0; i < 6; i++) { const b = boxG(o.w * .5, .1, .06);
        b.translate(o.w * .22, o.h * .55 + i * .18, o.d / 2 + .06); lv.push(b); }
      g.add(merged(lv, M.frame));
    }
    g.userData = { kind: 'shed', name: o.name, w: o.w, d: o.d, h: o.h };
    return g;
  }

  /** gas / water tank farm: horizontal or vertical vessels on saddles, in a bund */
  function tankFarm(o) {
    o = Object.assign({ n: 3, r: .8, h: 4.5, gap: 2.4, vertical: true }, o);
    const g = new T.Group(), W = o.n * o.gap;
    g.add(put(box(W + 1.6, .3, o.r * 4 + 1.2, M.slab), 0, 0, 0));
    for (let i = 0; i < o.n; i++) {
      const x = -W / 2 + (i + .5) * o.gap;
      if (o.vertical) {
        g.add(put(cyl(o.r, o.r, o.h, M.tank, 24), x, .3 + o.h / 2, 0));
        const cap = new T.SphereGeometry(o.r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); owned.push(cap);
        g.add(put(shade(new T.Mesh(cap, M.tank)), x, .3 + o.h, 0));
        g.add(put(cyl(.07, .07, 1.0, M.steel, 8), x, .3 + o.h + o.r + .4, 0));
      } else {
        const v = cyl(o.r, o.r, o.gap * .85, M.tank, 24); v.rotation.z = Math.PI / 2;
        g.add(put(v, x, .3 + o.r + .5, 0));
        for (const sz of [-1, 1]) g.add(put(box(.5, o.r + .5, .3, M.frame), x, 0, sz * o.gap * .28));
      }
    }
    for (const sz of [-1, 1]) g.add(put(box(W + 1.6, .5, .25, M.kerb), 0, .25, sz * (o.r * 2 + .6)));
    return g;
  }

  /** road slab with optional centre line and kerbs. Runs along +X. */
  function road(o) {
    o = Object.assign({ len: 40, w: 7, dash: true, kerb: true }, o);
    const g = new T.Group();
    g.add(put(plane(o.len, o.w, M.road), 0, .03, 0));
    if (o.dash) { const d = [];
      for (let x = -o.len / 2 + 1; x < o.len / 2; x += 4) { const b = boxG(2, .02, .18); b.translate(x, .05, 0); d.push(b); }
      g.add(merged(d, M.paintW));
    }
    if (o.kerb) for (const sz of [-1, 1]) g.add(put(box(o.len, .18, .3, M.kerb), 0, .03, sz * (o.w / 2 + .15)));
    return g;
  }

  /** parking bays in a row along +X, stalls facing +Z (or -Z with flip) */
  function parking(o) {
    o = Object.assign({ n: 10, stall: 2.5, depth: 5, flip: false, moto: false }, o);
    const g = new T.Group(), W = o.n * o.stall, s = o.flip ? -1 : 1;
    g.add(put(plane(W, o.depth, M.road), 0, .035, 0));
    const ln = [];
    for (let i = 0; i <= o.n; i++) { const b = boxG(.12, .02, o.depth * .92);
      b.translate(-W / 2 + i * o.stall, .06, 0); ln.push(b); }
    const b2 = boxG(W, .02, .14); b2.translate(0, .06, s * o.depth / 2); ln.push(b2);
    g.add(merged(ln, M.paint));
    if (o.moto) { const mk2 = [];
      for (let i = 0; i < o.n; i++) { const b = boxG(.5, .35, 1.4);
        b.translate(-W / 2 + (i + .5) * o.stall, .2, 0); mk2.push(b); }
      g.add(merged(mk2, M.frame));
    }
    return g;
  }

  /** yellow floor lane marking (walkway) along +X */
  function lane(len, w) {
    const g = new T.Group();
    for (const sz of [-1, 1]) g.add(put(box(len, .015, .16, M.paint), 0, .05, sz * (w || 2) / 2));
    return g;
  }

  /** area fill: apron concrete, grass, or hatched yard */
  function apron(w, d, kind) {
    return put(plane(w, d, kind === 'grass' ? M.grass : kind === 'road' ? M.road : M.slab), 0, .025, 0);
  }

  /** yard light pole */
  function pole(h) {
    const g = new T.Group(); h = h || 9;
    g.add(box(.22, h, .22, M.frame));
    g.add(put(box(1.4, .2, .5, M.frame), .6, h, 0));
    g.add(put(box(1.0, .18, .42, M.lamp), 1.0, h - .12, 0));
    return g;
  }

  /** simple tree: trunk + two leaf spheres (cheap, reads fine at site scale) */
  function tree(h) {
    const g = new T.Group(); h = h || 6;
    g.add(put(cyl(.16, .26, h * .55, M.trunk, 10), 0, h * .275, 0));
    const s1 = new T.SphereGeometry(h * .34, 12, 9); owned.push(s1);
    g.add(put(shade(new T.Mesh(s1, M.leaf)), 0, h * .68, 0));
    const s2 = new T.SphereGeometry(h * .24, 10, 8); owned.push(s2);
    g.add(put(shade(new T.Mesh(s2, M.leaf)), h * .16, h * .5, h * .1));
    return g;
  }

  /** perimeter fence along +X: posts + mesh + top rail */
  function fenceLine(len, h) {
    const g = new T.Group(); h = h || 2.4;
    const parts = [];
    for (let x = -len / 2; x <= len / 2; x += 3) { const b = boxG(.12, h, .12); b.translate(x, h / 2, 0); parts.push(b); }
    for (const y of [.4, h - .1]) { const b = boxG(len, .08, .08); b.translate(0, y, 0); parts.push(b); }
    g.add(merged(parts, M.frame));
    const mesh = [];
    for (let x = -len / 2; x <= len / 2; x += .4) { const b = boxG(.03, h - .5, .03); b.translate(x, (h - .5) / 2 + .4, 0); mesh.push(b); }
    g.add(merged(mesh, M.steel));
    return g;
  }

  /** floor-standing zone label, always readable from above */
  function zoneLabel(text, w) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96;
    const x = cv.getContext('2d');
    x.fillStyle = 'rgba(8,12,16,.85)'; x.fillRect(0, 0, 512, 96);
    x.fillStyle = '#5eead4'; x.font = 'bold 56px sans-serif'; x.textBaseline = 'middle';
    x.textAlign = 'center'; x.fillText(text, 256, 50);
    const tex = new T.CanvasTexture(cv);
    if (T.sRGBEncoding) tex.encoding = T.sRGBEncoding;
    if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace; // modern three (r152+) equivalent of the encoding above
    owned.push(tex);
    const g = new T.PlaneGeometry(w || 10, (w || 10) * 96 / 512); owned.push(g);
    const m = new T.Mesh(g, new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = .07; return m;
  }

  function dispose() { owned.forEach(o => o.dispose && o.dispose()); Object.keys(M).forEach(k => M[k].dispose()); owned.length = 0; }

  return { materials: M, shell, room, rack, shed, tankFarm, road, parking, lane,
           apron, pole, tree, fenceLine, zoneLabel, stair, walkway, flowerBed, dispose,
           parts: { box, cyl, plane, merged, put } };
}
