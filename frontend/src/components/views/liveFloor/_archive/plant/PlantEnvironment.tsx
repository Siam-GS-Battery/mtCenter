/**
 * PlantEnvironment.tsx
 *
 * Faithful reproduction of everything `Model_3D/nittan-plant-3d.html` builds
 * with the BUILDINGS kit (`createPlantBuildings`) -- the hall shell, the
 * zone floors/labels, the interior service rooms, the warehouse racking, the
 * three hardcoded aisle lane markings, and the whole outdoor site (grass,
 * roads, parking, buildings + per-storey interior rooms, sheds, tank farms,
 * walkways, flower beds, trees, poles, fences). See `Model_3D/REFERENCE-LOOK.md`
 * §7 for the exact build order this file follows, and §10/§12 for the
 * buildings-kit material palette and r128 -> 0.180 porting notes.
 *
 * Explicitly OUT of scope here (owned by the machines team): `L.machines`,
 * `L.lineBays` (the 8 line-bay conveyor/station groups and their own
 * per-bay zoneLabel), and any Canvas/lights/camera/ground shell (already
 * built by `PlantSceneShell.tsx`).
 *
 * three r128 -> 0.180 fix applied here (spec §12 last row): `plant-buildings.js`'s
 * `merged()` helper only ever checks `T.BufferGeometryUtils.mergeBufferGeometries`
 * (the old r128-era name). Three 0.180's `BufferGeometryUtils` addon module
 * only exports `mergeGeometries` (renamed, no back-compat alias), so without
 * wiring this up `merged()` would silently take its one-mesh-per-geometry
 * fallback path for EVERY call site in the kit (columns, roof trusses,
 * mullions, racking, fences, walkways, flower-bed blossoms, ...) -- a large,
 * unflagged draw-call regression that would still *look* correct. We pass a
 * THREE-shaped plain object (`THREE_WITH_MERGE`, a copy of THREE's exports --
 * see `./threeWithMerge.ts` for why a copy and not a prototype chain) with
 * `BufferGeometryUtils.mergeBufferGeometries` aliased to the modern
 * `mergeGeometries` into `createPlantBuildings` instead of `THREE` directly.
 */
import { useEffect, useState } from "react";
import * as THREE from "three";
import { THREE_WITH_MERGE } from "./threeWithMerge";
import { createPlantBuildings } from "../../../../lib/vendor/plantBuildingsKit.js";
import type { PlantBuildingsKit } from "../../../../lib/vendor/plantBuildingsKit.d.ts";
import type { PlantLayout } from "../../../../lib/plantLayout";
import type { PlantBuilding, PlantSite } from "../../../../lib/plantSite";
import { REFERENCE_HALL_SIZE } from "./plantSceneConfig";

export interface PlantEnvironmentProps {
  /** The output of `buildPlantLayout(machines)` -- consumed for its `.site`
   *  (the fully-scaled reference plan) and `.scale.factor` (to proportionally
   *  scale the handful of nt-app.js literals that are NOT part of the traced
   *  site data: the hall's 5 door cut-outs and the 3 aisle lane markings). */
  layout: PlantLayout;
}

const [REF_HALL_W, REF_HALL_D] = REFERENCE_HALL_SIZE;

/** nt-app.js:136-138 -- the hall's 5 door cut-outs, authored at the reference
 *  hall's scale (94.3x74.3 m). Not part of NT_LAYOUT/PlantSite data at all
 *  (hardcoded in the app script), so we scale position/width by the layout's
 *  own scale factor to keep them proportionally placed on the enlarged hall. */
function scaledHallDoors(factor: number) {
  return [
    { side: "S" as const, at: -34 * factor, w: 7 * factor },
    { side: "S" as const, at: 6 * factor, w: 8 * factor },
    { side: "S" as const, at: 34 * factor, w: 7 * factor },
    { side: "W" as const, at: 0, w: 6 * factor },
    { side: "E" as const, at: 10 * factor, w: 6 * factor },
  ];
}

/** Builds every mesh this component owns into `root`, using `kit`. Mirrors
 *  nt-app.js's build order (spec §7): outside-site first, then hall shell,
 *  rooms, warehouse racking, zone labels, aisles. */
function buildEnvironment(kit: PlantBuildingsKit, layout: PlantLayout, root: THREE.Group): void {
  const site: PlantSite = layout.site;
  const factor = layout.scale.factor;

  // ---- 1. outside-hall site geometry, in nt-app.js's own order -------------
  site.grass.forEach((g) => {
    const m = kit.apron(g.w, g.d, "grass");
    m.position.set(g.x, 0.03, g.z);
    root.add(m);
  });

  site.roads.forEach((r) => {
    const g = kit.road({ len: r.len, w: r.w });
    g.position.set(r.x, 0, r.z);
    if (r.dir === "y") g.rotation.y = Math.PI / 2;
    root.add(g);
  });

  site.parking.forEach((p) => {
    const stall = p.moto ? 1.0 : 2.5;
    const rows = p.rows || 2;
    const depth = p.moto ? 2.2 : 5;
    const grp = new THREE.Group();
    const n = Math.max(2, Math.floor(p.d / stall));
    for (let r = 0; r < rows; r++) {
      const row = kit.parking({ n, stall, depth, moto: !!p.moto, flip: r % 2 === 1 });
      row.rotation.y = Math.PI / 2;
      row.position.set(-p.w / 2 + depth / 2 + r * (p.w - depth), 0, 0);
      grp.add(row);
    }
    grp.position.set(p.x, 0, p.z);
    root.add(grp);
  });

  const multiFloor: THREE.Group[] = [];
  site.buildings.forEach((b: PlantBuilding) => {
    const g = kit.shell({
      w: b.w,
      d: b.d,
      h: b.h,
      floors: b.floors || 1,
      bay: 9,
      name: b.name,
      clerestory: b.h > 5,
      columns: b.w > 20,
      roofStyle: b.roofStyle || "flat",
      doors: [
        { side: "S", at: 0, w: Math.min(8, b.w * 0.3) },
        { side: "N", at: 0, w: Math.min(6, b.w * 0.22) },
      ],
    });
    g.position.set(b.x, 0, b.z);
    root.add(g);

    const lb = kit.zoneLabel(b.name, Math.min(b.w * 0.5, 17));
    lb.position.set(g.position.x, 0.09, g.position.z + b.d / 2 + 2.5);
    root.add(lb);

    const floors = g.userData.floors;
    if (floors > 1) {
      multiFloor.push(g);
      // rooms per storey so each floor reads as its own model, not a hollow box
      g.userData.floorGroups.forEach((fg, i) => {
        const cols = Math.max(2, Math.round(b.w / 12));
        const rows = Math.max(1, Math.round(b.d / 12));
        for (let cx = 0; cx < cols; cx++) {
          for (let cz = 0; cz < rows; cz++) {
            if ((cx + cz + i) % 3 === 2) continue; // leave circulation gaps
            const rw = b.w / cols - 2.2;
            const rd = b.d / rows - 2.4;
            if (rw < 3 || rd < 3) continue;
            const r = kit.room({ w: rw, d: rd, h: g.userData.floorH - 0.5, glass: true });
            r.position.set(
              -b.w / 2 + (cx + 0.5) * (b.w / cols),
              i * g.userData.floorH + 0.1,
              -b.d / 2 + (cz + 0.5) * (b.d / rows),
            );
            fg.add(r);
          }
        }
      });
    }
  });

  site.sheds.forEach((s) => {
    const g = kit.shed({ w: s.w, d: s.d, h: s.h, name: s.name });
    g.position.set(s.x, 0, s.z);
    root.add(g);
    // Deliberately no visible label: the reference's own shed loop never
    // calls zoneLabel() for sheds (spec §7 "what NT_LAYOUT contains but the
    // app does not render") -- match that omission, don't "fix" it.
  });

  site.tankFarms.forEach((t) => {
    const g = kit.tankFarm({ n: t.n, r: t.r, h: t.h });
    g.position.set(t.x, 0, t.z);
    root.add(g);
    const lb = kit.zoneLabel(t.name, 6);
    lb.position.set(t.x, 0.09, t.z + 3.5);
    root.add(lb);
  });

  site.walkways.forEach((wk) => {
    const g = kit.walkway(wk.len, 2.8);
    g.position.set(wk.x, 0, wk.z);
    if (wk.dir === "y") g.rotation.y = Math.PI / 2;
    root.add(g);
  });

  site.flowerBeds.forEach((fb) => {
    const g = kit.flowerBed(fb.w, fb.d);
    g.position.set(fb.x, 0, fb.z);
    root.add(g);
  });

  site.trees.forEach((p) => {
    const t = kit.tree(5 + Math.random() * 3);
    t.position.set(p.x, 0, p.z);
    root.add(t);
  });

  site.poles.forEach((p) => {
    const q = kit.pole(10);
    q.position.set(p.x, 0, p.z);
    q.rotation.y = Math.PI * Math.random();
    root.add(q);
  });

  site.fences.forEach((f) => {
    const g = kit.fenceLine(f.len, 2.4);
    g.position.set(f.x, 0, f.z);
    if (f.dir === "y") g.rotation.y = Math.PI / 2;
    root.add(g);
  });

  // ---- 2. the production hall shell, 5 door cut-outs (scaled) --------------
  const hall = kit.shell({
    w: layout.hall.w,
    d: layout.hall.d,
    h: layout.hall.h,
    bay: site.hall.bay,
    name: "PRODUCTION HALL",
    doors: scaledHallDoors(factor),
  });
  if (hall.userData.roof) {
    hall.userData.roof.name = "hallRoof";
    // nt-app.js:300-307: `roofOn` starts `true` but `bRoof.onclick()` is
    // called once, synchronously, immediately after wiring the button --
    // "hall roof off by default so the machines are visible" (the reference
    // app's own comment). There is no roof-toggle UI in this port (no
    // `bRoof` equivalent exists anywhere in this codebase -- confirmed by
    // grep), so the reference's ACTUAL default runtime state (roof hidden)
    // must be reproduced directly here rather than left at the kit's own
    // default (visible). This is very likely the single biggest reason the
    // interior read as dark: with the roof mesh visible and opaque, it fully
    // blocks the sun (the only light strong enough to read as "daylight" --
    // hemi is a dim 0.26 ambient-only fill, see plantSceneConfig.ts) from
    // ever reaching the floor/machines inside the hall, which the reference
    // never does by default. Other buildings on site keep their own roofs
    // (nt-app.js's toggle only ever touched the hall's `roof`, never
    // `site.shell()`'s roof for other buildings) -- this only hides the
    // hall's roof, matching that scope exactly.
    hall.userData.roof.visible = false;
  }
  root.add(hall);

  // ---- 3. interior service rooms drawn on the plan --------------------------
  site.rooms.forEach((r) => {
    const g = kit.room({ w: r.w, d: r.d, h: 3.4, name: r.name });
    g.position.set(r.x, 0, r.z);
    root.add(g);
    if (r.w > 5) {
      const lb = kit.zoneLabel(r.name, Math.min(r.w * 0.7, 9));
      lb.position.set(g.position.x, 0.08, g.position.z);
      root.add(lb);
    }
  });

  // ---- 4. warehouse racking fills the WH zone (hardcoded dims, per nt-app.js) --
  const wh = site.zones.find((z) => z.id === "WH");
  if (wh) {
    for (let i = 0; i < 4; i++) {
      const rk = kit.rack({ bays: 5, levels: 4, bayW: 2.7, depth: 1.1 });
      rk.position.set(wh.x, 0, wh.z - wh.d / 2 + 2.2 + i * 3.4);
      root.add(rk);
    }
  }

  // ---- 5. every zone gets a floor zoneLabel (incl. the LINES super-zone;
  //         its 8 individual line bays are the machines team's own labels) ---
  site.zones.forEach((z) => {
    const lb = kit.zoneLabel(z.name, Math.min(z.w * 0.55, 14));
    lb.position.set(z.x, 0.08, z.z + z.d / 2 + 1.2);
    root.add(lb);
  });

  // ---- 6. the 3 hardcoded aisle lane markings (scaled, not from site data) --
  const pz = (planY: number) => (REF_HALL_D / 2 - planY) * factor;
  const px = (planX: number) => (planX - REF_HALL_W / 2) * factor;
  const aisle = kit.lane(layout.hall.w - 6 * factor, 3 * factor);
  aisle.position.set(0, 0, pz(37.0));
  root.add(aisle);
  const aisle2 = kit.lane(layout.hall.w - 6 * factor, 3 * factor);
  aisle2.position.set(0, 0, pz(56.0));
  root.add(aisle2);
  const aisleV = kit.lane(layout.hall.d - 8 * factor, 3 * factor);
  aisleV.rotation.y = Math.PI / 2;
  aisleV.position.set(px(15.0), 0, 0);
  root.add(aisleV);

  void multiFloor; // kept for parity with nt-app.js's floor-isolation bookkeeping; no UI here
}

/**
 * Renders the hall shell, zones/rooms, warehouse racking, and the entire
 * outdoor site via the vendored buildings kit. Purely static geometry: built
 * once per `layout` change (imperative THREE.Group bridged into R3F with
 * `<primitive>`), never rebuilt per frame. Disposes exactly the kit instance
 * (and every geometry/material it allocated) that THIS effect run created,
 * which also makes React 19 StrictMode's dev double-mount safe -- each
 * mount/cleanup/remount pair gets its own kit and disposes its own kit.
 */
export function PlantEnvironment({ layout }: PlantEnvironmentProps) {
  const [group, setGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const kit = createPlantBuildings(THREE_WITH_MERGE, { shadows: true });
    const root = new THREE.Group();
    root.name = "PlantEnvironment";
    buildEnvironment(kit, layout, root);
    setGroup(root);

    return () => {
      setGroup(null);
      root.clear();
      kit.dispose();
    };
  }, [layout]);

  if (!group) return null;
  return <primitive object={group} />;
}
