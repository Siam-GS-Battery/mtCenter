# plant-machines.js

Procedural factory-machine kit for three.js. Ten battery-plant machine types plus
conveyors, built entirely from three.js geometry at runtime — **no images, no .glb,
no texture files, nothing to host**. Drop it into an existing three.js scene and
place the machines on your own layout coordinates.

```
plant-machines.js          the kit (UMD: <script> or require)   ~29 KB
plant-machines.mjs         ESM entry, re-exports the UMD global
layout.example.json        a 10-station line, the format place() eats
demo.html                  minimal working scene, read this first
```

## Install

Copy `plant-machines.js` (and `.mjs` if you use ESM) into your assets. It does
**not** bundle three — you pass your own `THREE` in, so it works with whatever
three version your site already ships (tested r128 → r160).

```html
<script src="/js/three.min.js"></script>
<script src="/js/plant-machines.js"></script>
<script>
  const kit = createPlantMachines(THREE);
</script>
```

```js
// ESM / bundler
import * as THREE from 'three';
import { createPlantMachines } from './plant-machines.mjs';
const kit = createPlantMachines(THREE);
```

Optional: if `THREE.BufferGeometryUtils` is loaded, fence wire-mesh is merged into
one draw call. Without it the kit still works, just with a few more meshes.

## Placement conventions — read before positioning anything

| Rule | Why it matters |
|---|---|
| A machine's **footprint is centred** on its group origin | `mesh.position.x/z` is the machine centre, not a corner |
| A machine's **base sits on y = 0** | never offset y to "drop it onto the floor"; y = 0 *is* the floor |
| **+X is the direction of product flow** | rotate around Y to turn a machine; conveyors run along +X too |
| Units are **metres**, roughly to scale | a press is ~5.6 × 6.4 m, the charging bank ~9 × 7.4 m |

`group.userData.footprint` is `[width, depth]` in metres — use it for collision
checks or to auto-space a row.

## API

```js
kit.types                      // ['furnace','mixer','coater','oven','press',
                               //  'robot','cell','filler','charger','packer']

kit.create(type, opts)         // -> THREE.Group
//   opts: { id, label, sub, status:'run'|'warn'|'stop'|'idle',
//           cabinet:true, sign:true, rot:<radians>, position:{x,y,z}, userData:{} }
//   label/sub render on a canvas plaque; pass sign:false to skip the signage.
//   cabinet:false drops the control cabinet + status beacon.

kit.conveyor(len, width)       // -> THREE.Group, runs along +X, centred
kit.workpieces(conv, count)    // -> parts that slide along that conveyor
kit.place(parent, layout)      // -> { machines: {id: Group}, conveyors: [Group] }
kit.setStatus(group, 'warn')   // recolours the beacon + updates userData.status
kit.tick(dtSeconds)            // drives EVERY animation — call once per frame
kit.dispose()                  // frees all geometry/textures this kit made
kit.parts                      // { box, cyl, tube, torus, sph, tank, motor,
                               //   frame, fence, cabinet, sign } to build your own
kit.materials, kit.statusColors, kit.beltSpeed
```

`kit.tick(dt)` is required, or nothing moves: it scrolls belt treads, rolls
conveyor rollers and pulleys on their own axes at matching surface speed, slides
work pieces along the belt, swings the robot joints and press ram, spins agitators
and oven fans, and pulses the furnace glow and status beacons.

```js
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  kit.tick(clock.getDelta());
  renderer.render(scene, camera);
});
```

## Layout format

```json
{
  "unit": "m",
  "degrees": true,
  "machines":  [{ "id":"COS-ASSY", "type":"robot", "x":6.5, "z":0, "rot":0,
                  "status":"run", "label":"06  COS-ASSY", "sub":"COS Assembly" }],
  "conveyors": [{ "x":0, "z":0, "rot":0, "len":5.8, "width":1.5, "parts":3 }]
}
```

- `degrees: true` → `rot` is degrees; omit it and `rot` is radians.
- `parts: 0` on a conveyor means no work pieces on it.
- Extra keys are ignored, so you can keep your own fields (asset tag, PLC id,
  sensor topic) in the same records and read them back off `group.userData`.

## Wiring it to an existing layout

If your site already has machine positions (a DXF export, a DB table, a JS
array), map each of your machine names to the closest archetype and feed
`kit.place()`:

| Your machine | `type` |
|---|---|
| lead furnace, grid caster, melting pot | `furnace` |
| paste mixer, agitator tank, slurry tank | `mixer` |
| pasting machine, coater, roll coater | `coater` |
| curing chamber, drying oven, kiln | `oven` |
| press, punch, cutter, stacker | `press` |
| robot cell, COS, pick-and-place | `robot` |
| welder, sealing cell, enclosed cell | `cell` |
| filler, doser, acid filling | `filler` |
| charging bank, rack room, cabinet row | `charger` |
| tester, packer, palletiser | `packer` |

```js
const layout = {
  degrees: true,
  machines: myPlant.map(m => ({
    id: m.tag, type: TYPE_MAP[m.kind] || 'press',
    x: m.x, z: m.y, rot: m.angle,          // note: your plan's Y becomes Z
    status: m.running ? 'run' : 'stop',
    label: m.tag, sub: m.name,
    userData: { plc: m.plcId }
  }))
};
const built = kit.place(scene, layout);
built.machines['MC-014'].position.x += 2;  // still an ordinary THREE.Group
```

A 2D plan gives x/z and rotation only — heights and shapes come from the
archetype, which is the point of this kit.

### Picking

Every mesh carries `userData.machineId`, so one raycast resolves to a machine
without walking parents:

```js
const hit = raycaster.intersectObjects(scene.children, true)[0];
if (hit) console.log(hit.object.userData.machineId);
```

### Live status from your backend

```js
socket.on('machine', ({ id, state }) => {
  const g = built.machines[id];
  if (g) kit.setStatus(g, state);   // 'run' | 'warn' | 'stop' | 'idle'
});
```

## Scene settings that make it look right

The kit ships geometry and materials only — lights, tone mapping and shadows are
your scene's job. What the reference scene uses:

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.outputEncoding    = THREE.sRGBEncoding;   // r152+: outputColorSpace = SRGBColorSpace
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
scene.fog = new THREE.FogExp2(0x080b0f, 0.0032);
scene.add(new THREE.HemisphereLight(0x8fb0d0, 0x090c10, 0.30));
const sun = new THREE.DirectionalLight(0xffeedd, 1.85);
sun.position.set(48, 62, 42); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = 0.03;
```

Without tone mapping and a low-key ambient the machines look flat and washed out.

## Performance

Ten machines + nine conveyors is roughly 1,500 meshes and renders comfortably at
60 fps on integrated graphics. Above ~40 machines: pass `{ shadows: false }` as
the second argument to `createPlantMachines`, cut the shadow map to 1024, and
reuse one kit instance (geometry is cached and shared across machines of the
same size).

## Adding your own machine type

Use `kit.parts` — same helpers, same conventions:

```js
const g = new THREE.Group();
const { box, cyl, tank, motor, frame } = kit.parts;
g.add(frame(6, 4, 1.1));                    // legs + skirt
g.add(box(5.8, 1.6, 3.6, kit.materials.body, 0.22));  // base at y=0
g.add(tank(1.2, 2.4, kit.materials.steel).translateY(2.7));
scene.add(g);
```

`box()` puts its **base** on y = 0; `cyl()` is **centred** on its origin. Mixing
those two up is what makes parts float — the kit measures its own bounding boxes
rather than trusting the extrude offset, and you should too.


---

# plant-buildings.js

The building and site half of the kit: shells with per-storey models, interior
rooms, pallet racking, sheds, tank farms, roads, parking, covered walkways,
flower beds, poles, trees, fences. Same conventions (footprint centred, base on
y = 0, metres, +X = flow).

```js
const site = createPlantBuildings(THREE);
const hall = site.shell({ w: 94.3, d: 74.3, h: 10.5, bay: 8.5,
                          doors: [{ side: 'S', at: -34, w: 7 }] });
scene.add(hall);
hall.userData.roof.visible = false;          // look inside
```

## Multi-storey buildings

`floors: n` builds **one group per storey** — that is what makes "show me only
the 2nd floor" possible:

```js
const b = site.shell({ w: 16, d: 20, h: 7.6, floors: 2, roofStyle: 'pitched' });
b.userData.floors        // 2
b.userData.floorH        // 3.8
b.userData.floorGroups   // [floor1Group, floor2Group]  <- toggle .visible
b.userData.roof          // roof group

function showFloor(n) {                       // n = 0 -> every storey
  b.userData.floorGroups.forEach((fg, i) => { fg.visible = (n === 0 || i === n - 1); });
  if (b.userData.roof) b.userData.roof.visible = (n === 0);
}
```

Each storey gets its own slab, edge beams, perimeter walls and glazing band, and
a stair flight up to the next level, so the floors are genuinely connected
rather than stacked boxes. Ground-floor walls carry the doors; upper floors do
not.

`roofStyle: 'pitched'` gives a gabled roof with ridge and eaves (office and
training buildings); `'flat'` gives the industrial version — steel trusses,
purlins, deck, roof monitor, ridge vents and hanging high-bay lamps.

## Site API

```js
site.shell(o)        // building, see above
site.room(o)         // interior room: partition + glazing + ceiling band
site.rack(o)         // pallet racking, merged to ~3 draw calls
site.shed(o)         // utility block with door and louvre
site.tankFarm(o)     // gas/water vessels in a bund
site.road(o)         // slab + dashed centre line + kerbs, along +X
site.parking(o)      // stall row, {moto:true} for motorcycle bays
site.walkway(len, w) // covered link between zones — posts + canopy
site.flowerBed(w, d) // kerb, soil, blossom clusters in 3 colours
site.stair(h, w)     // one-storey flight with landing and handrails
site.lane(len, w)    // painted floor walkway
site.apron(w, d, k)  // ground fill: 'slab' | 'road' | 'grass'
site.pole(h) · site.tree(h) · site.fenceLine(len, h) · site.zoneLabel(text, w)
```

`site.apron()` and `site.lane()` return **rotated planes** — set `.position`,
never `.translateZ()`, or the plane lifts into the air instead of sliding along
the ground.

# nt-layout.js — the NITTAN plant, traced from NT-26-04-1

`window.NT_LAYOUT` holds the real site as data: hall size, production zones,
the eight LINE bays, 21 rooms, machines with archetype + position + status, and
the site (buildings with floor counts, sheds, tank farms, parking, roads,
walkways, flower beds, trees, poles, fences). Coordinates are metres in the
plan's own frame (from the hall's SW corner); the scene converts with

```js
const PX = x => x - HALL_W / 2;      // plan east  -> scene X
const PZ = y => HALL_D / 2 - y;      // plan north -> scene -Z
```

Edit `nt-layout.js` to move a machine, add a zone, or change a status — nothing
else needs touching. `site.tpl.html` + `buildsite.py` rebuild the single-file
viewer (`python3 buildsite.py out.html`), inlining three.js and both kits so it
runs offline.

**Note on the source DWG**: NT2604 Layout NT.dwg is a PDF underlay converted to
geometry — 226,612 POLYLINEs on six layers named `PDF_Geometry`, `PDF_Text`,
`TITLE`… There are no machine blocks or named layers to read, so the layout was
measured off the drawing at its stated 1:500 and written into `nt-layout.js` by
hand. If you can get a native DXF with real layers, `dxf2twin.py` extracts
footprints automatically instead.


---

# plant-theme.js + THEME.md

`THEME.md` is the full visual spec — every hex, metalness, roughness, light,
tone-mapping and HUD colour actually used, pulled out of the source rather than
retyped, plus a copy-paste prompt for Claude Code. `plant-theme.js` is the same
values as data:

```js
applyPlantTheme(THREE, PLANT_THEME, { renderer, scene, kit, site });
const lights = applyPlantTheme.lights(THREE, scene);   // the 4-light rig
```

Materials are shared instances, so re-running `applyPlantTheme` after editing
`PLANT_THEME` restyles the whole scene in one call. The three rules that break
the look if ignored: exposure stays at 0.95, the light rig stays at four lights,
and `outputEncoding` must be sRGB.
