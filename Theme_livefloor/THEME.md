# NITTAN Plant 3D — Visual Theme Spec

ทุกค่าสีและค่าแสงที่ใช้จริงในฉาก ดึงออกมาจากโค้ดโดยตรง (ไม่ได้พิมพ์จากความจำ)
ใช้คู่กับ `plant-theme.js` ซึ่งเก็บค่าทั้งหมดเป็น token + ฟังก์ชัน apply

> ตรวจสอบแล้ว: `applyPlantTheme()` เขียนค่าทับ material ของ kit แล้วได้ค่าเดิมเป๊ะ
> (`accent #14b8a6` → `#14b8a6`, `rack #d97706` → `#d97706`, exposure 0.95, fog 0.0019)

---

## 1. หลักการของธีม — 5 ข้อที่ทำให้ภาพออกมาแบบนี้

| # | กฎ | ทำไม |
|---|---|---|
| 1 | **พื้นหลังเข้ม ตัวอาคารเข้ม เครื่องจักรสว่างกว่าพื้นหลังนิดเดียว** | ทำให้เครื่องจักรเด่นโดยไม่ต้องใช้สีจัด |
| 2 | **สีจัดมีแค่ 3 ที่** — teal `#14b8a6` (แขนหุ่นยนต์/accent), เหลือง `#facc15` (รั้วนิรภัย), ส้ม `#d97706` (ชั้นวาง) | ถ้าใส่สีจัดมากกว่านี้ภาพจะเละ |
| 3 | **แสง 4 ดวงเท่านั้น** — hemi + sun (มีเงา) + fill + rim ห้ามเพิ่ม PointLight ต่อเครื่อง | เกิน ~10 ดวงจะชน uniform limit ของ WebGL แล้วจอดำ |
| 4 | **ACESFilmic tone mapping + exposure 0.95** | ถ้าเกิน 1.05 ภาพจะซีดเป็นหมอกทันที |
| 5 | **โลหะแยกด้วย roughness ไม่ใช่สี** — เหล็ก `.24`, บอดี้ `.38`, พื้น `.96` | ได้ความลึกจากการสะท้อนแสง ไม่ใช่จากสีที่ต่างกัน |

---

## 2. Renderer + บรรยากาศ

```js
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled  = true;
renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
renderer.outputEncoding     = THREE.sRGBEncoding;      // three r152+ : outputColorSpace = SRGBColorSpace
renderer.toneMapping        = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

scene.background = new THREE.Color(0x06080b);
scene.fog        = new THREE.FogExp2(0x05070a, 0.0019);

camera = new THREE.PerspectiveCamera(44, aspect, 0.5, 1400);
camera.position.set(96, 72, 132);   controls.target.set(6, 0, 10);
controls.minDistance = 2.5;  controls.maxDistance = 900;  controls.enableDamping = true;
```

มุมบน: `camera.position.set(6, 210, 10.5)` target เดิม

---

## 3. ชุดไฟ (4 ดวง — ห้ามเกิน)

```js
new THREE.HemisphereLight(0x86a8cc, 0x070a0d, 0.26);              // ฟ้า/พื้น

const sun = new THREE.DirectionalLight(0xffeedd, 1.62);           // ดวงเดียวที่ทำเงา
sun.position.set(150, 190, 120);  sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.bias = -0.0004;  sun.shadow.normalBias = 0.05;
Object.assign(sun.shadow.camera,
  { left: -150, right: 150, top: 130, bottom: -120, near: 20, far: 620 });

new THREE.DirectionalLight(0x5f8ccc, 0.26).position.set(-140, 60, -100);   // fill ฟ้าเย็น
new THREE.DirectionalLight(0x2ec4b6, 0.18).position.set(-60, 30, 150);     // rim teal
```

`normalBias 0.05` สำคัญ — ถ้าไม่ใส่ เงาจะเกิด acne เป็นลายทางบนผนัง

---

## 4. สีเครื่องจักร (`kit.materials`)

| key | hex | metal | rough | ใช้กับ |
|---|---|---|---|---|
| `body` | `#3d4855` | .62 | .38 | ตัวถังหลักของเครื่อง |
| `body2` | `#28313a` | .55 | .45 | โครง ขา มอเตอร์ ฐาน |
| `steel` | `#94a2ae` | .92 | .24 | ลูกกลิ้ง เพลา ถัง ท่อ |
| `dark` | `#1a2027` | .40 | .70 | เกียร์บ็อกซ์ gripper |
| **`accent`** | **`#14b8a6`** | .35 | .35 | **แขนหุ่นยนต์ — สีหลักของแบรนด์** |
| `warn` | `#facc15` | .30 | .50 | รั้วนิรภัย |
| `belt` | `#22282f` | .15 | .85 | สายพาน |
| `rubber` | `#14181d` | .10 | .95 | ยาง |
| `glass` | `#8fd6ff` | .10 | .06 | กระจก · `opacity .22` |
| `copper` | `#c87941` | .95 | .30 | บัสบาร์ หัวเชื่อม |
| `lead` | `#6b7580` | .85 | .42 | แม่พิมพ์ แผ่นธาตุ |
| `acid` | `#38bdf8` | .20 | .15 | ของเหลว · `opacity .55` |
| `battery` | `#1f2937` | .25 | .55 | ชิ้นงานบนสายพาน |
| `hot` | `#ff7a2f` | 0 | .60 | เตาหลอม · `emissive #ff5500` @ **1.4** |
| `screen` | `#0b1220` | 0 | .25 | จอ HMI · `emissive #1a9e8f` @ **0.9** |

## 5. สีอาคาร + ไซต์ (`site.materials`)

| key | hex | metal | rough | ใช้กับ |
|---|---|---|---|---|
| `wall` | `#232a33` | .20 | .80 | ผนังนอก |
| `wallIn` | `#2b333c` | .12 | .88 | ผนังกั้นห้อง |
| `steel` | `#71808d` | .88 | .32 | truss purlin |
| `frame` | `#323b45` | .55 | .48 | เสา เฟรมกระจก |
| `roof` | `#171d23` | .38 | .68 | หลังคา |
| `parapet` | `#2e3741` | .32 | .70 | ขอบหลังคา สันจั่ว |
| `glass` | `#9fd8ff` | .10 | .05 | กระจกอาคาร · `opacity .18` |
| `door` | `#1b222a` | .40 | .60 | ประตูม้วน |
| `slab` | `#161b21` | .10 | .96 | ลานคอนกรีตนอกอาคาร |
| `slabIn` | `#232a31` | .08 | .95 | พื้นโรงงาน |
| `road` | `#14181d` | .05 | .96 | ถนน |
| `kerb` | `#4a525b` | .10 | .88 | คันหิน ขอบแปลง |
| `paint` | `#d9b400` | .06 | .70 | เส้นเหลืองทางเดิน/ที่จอด |
| `paintW` | `#cfd6dd` | .06 | .70 | เส้นประขาวกลางถนน |
| `grass` | `#18291b` | .02 | .98 | สนามหญ้า |
| `trunk` | `#2a2118` | .05 | .95 | ลำต้นไม้ |
| `leaf` | `#24422a` | .03 | .90 | พุ่มใบ |
| **`rack`** | **`#d97706`** | .40 | .55 | **ชั้นวางพาเลท — สีส้มที่เห็นในคลัง** |
| `pallet` | `#4a3c2a` | .05 | .92 | พาเลทสินค้า |
| `tank` | `#b9c4cd` | .90 | .26 | ถังแก๊ส/น้ำ |
| `lamp` | `#dfeaf5` | 0 | .40 | โคมไฟ · `emissive #cfe0f0` @ .9 |
| `signGrn` | `#0f766e` | .20 | .60 | ป้ายเขียว · `emissive` @ .35 |

**พื้นดินรอบไซต์**: `#0a0e12`, metal .04, rough .97, ขนาด 900 × 700 m
**ดอกไม้ในแปลง** (3 สี): `#d94f7a` · `#f0b429` · `#e8ecef`

## 6. สีสถานะเครื่องจักร

| สถานะ | hex | ใช้ที่ |
|---|---|---|
| `run` | `#22c55e` | ไฟ beacon, จุดในลิสต์, ข้อความในพาเนล |
| `warn` | `#f59e0b` | |
| `stop` | `#ef4444` | |
| `idle` | `#64748b` | |

## 7. ธีม UI (พาเนลลอย)

```css
--font:          13px/1.55 "Segoe UI", system-ui, sans-serif;
--page-bg:       #06080b;
--panel-bg:      rgba(12,16,21,.88);   backdrop-filter: blur(14px);
--panel-border:  rgba(255,255,255,.09); border-radius: 12px;
--panel-shadow:  0 18px 50px rgba(0,0,0,.65);
--text:          #e8edf2;   --text-muted: #7d8b9a;
--text-dim:      #6b7a89;   --text-faint: #4b5866;
--accent:        #5eead4;                     /* teal อ่อนกว่าของเครื่องจักร 1 สเต็ป */
--accent-soft:   rgba(94,234,212,.11);  --accent-border: rgba(94,234,212,.34);
--button-bg:     rgba(255,255,255,.06); --button-hover: rgba(255,255,255,.14);
--tile-bg:       rgba(255,255,255,.04);
```

**ป้ายบนพื้น** (canvas texture): พื้น `rgba(8,12,16,.85)` ตัวอักษร `#5eead4` `bold 56px sans-serif`
**ป้ายหน้าเครื่อง**: พื้น `#0e141a` แถบซ้าย `#14b8a6` ชื่อ `#e8edf2` คำบรรยาย `#7d8b9a`

---

## 8. สิ่งที่ทำแล้วธีมพัง

- `toneMappingExposure > 1.05` → ซีดเป็นหมอกทั้งฉาก
- เปิด PointLight ต่อเครื่อง (`beaconLights: true`) เมื่อมีเครื่องเกิน ~10 ตัว → uniform overflow
- ลืม `outputEncoding = sRGBEncoding` → สีทุกอย่างจะจมดำ
- ใส่ `MeshBasicMaterial` หรือ `MeshLambertMaterial` → ไม่มี metalness/roughness ธีมนี้ก็หายไป
- fog density > 0.004 ที่ระยะกล้อง 130 m → มองไม่เห็นอะไรเลย
- `.translateZ()` บน plane ที่หมุน `-Math.PI/2` → ลอยขึ้นแกน Y ให้ใช้ `.position.set()`

---

## 9. ใช้งาน

```html
<script src="three.min.js"></script>
<script src="plant-machines.js"></script>
<script src="plant-buildings.js"></script>
<script src="plant-theme.js"></script>
<script>
  const kit  = createPlantMachines(THREE, { beaconLights: false });
  const site = createPlantBuildings(THREE);

  applyPlantTheme(THREE, PLANT_THEME, { renderer, scene, kit, site });  // สี + renderer + fog
  const lights = applyPlantTheme.lights(THREE, scene);                  // ชุดไฟ 4 ดวง
</script>
```

เปลี่ยนธีมทั้งฉาก: แก้ค่าใน `PLANT_THEME` แล้วเรียก `applyPlantTheme()` ใหม่ — material
เป็น instance เดียวที่ทุก mesh ใช้ร่วมกัน เปลี่ยนที่เดียวเปลี่ยนทั้งฉาก

---

## 10. PROMPT สำหรับ Claude Code — คัดลอกทั้งบล็อกไปวาง

````text
Build a three.js factory scene that matches the "NITTAN dark industrial" theme EXACTLY.
Do not improvise colours, lights or tone mapping — every value below is fixed.

FILES YOU ALREADY HAVE (use them, do not rewrite the geometry):
  plant-machines.js   createPlantMachines(THREE, {beaconLights:false})  -> kit
  plant-buildings.js  createPlantBuildings(THREE)                        -> site
  plant-theme.js      PLANT_THEME + applyPlantTheme(THREE, theme, ctx)
  nt-layout.js        window.NT_LAYOUT — the NITTAN plant as data

RENDERER (exact):
  pixelRatio  = min(devicePixelRatio, 1.75)
  shadowMap   = enabled, THREE.PCFSoftShadowMap
  outputEncoding = THREE.sRGBEncoding   (r152+: outputColorSpace = THREE.SRGBColorSpace)
  toneMapping = THREE.ACESFilmicToneMapping, toneMappingExposure = 0.95
  scene.background = 0x06080b
  scene.fog = new THREE.FogExp2(0x05070a, 0.0019)
  camera = PerspectiveCamera(44, aspect, 0.5, 1400) at (96,72,132) looking at (6,0,10)
  OrbitControls: enableDamping true, dampingFactor .06,
                 minDistance 2.5, maxDistance 900, maxPolarAngle PI*0.488

LIGHTS — exactly four, never more (per-machine PointLights overflow the WebGL
uniform budget past ~10 machines; emissive beacons carry the glow instead):
  HemisphereLight(0x86a8cc, 0x070a0d, 0.26)
  DirectionalLight(0xffeedd, 1.62) at (150,190,120), castShadow,
     shadow.mapSize 4096, bias -0.0004, normalBias 0.05,
     shadow.camera {left:-150,right:150,top:130,bottom:-120,near:20,far:620}
  DirectionalLight(0x5f8ccc, 0.26) at (-140,60,-100)
  DirectionalLight(0x2ec4b6, 0.18) at (-60,30,150)

MATERIALS — all MeshStandardMaterial. Machine kit (kit.materials):
  body #3d4855 m.62 r.38 | body2 #28313a m.55 r.45 | steel #94a2ae m.92 r.24
  dark #1a2027 m.40 r.70 | accent #14b8a6 m.35 r.35 | warn #facc15 m.30 r.50
  belt #22282f m.15 r.85 | rubber #14181d m.10 r.95
  glass #8fd6ff m.10 r.06 opacity .22 | copper #c87941 m.95 r.30
  lead #6b7580 m.85 r.42 | acid #38bdf8 m.20 r.15 opacity .55
  battery #1f2937 m.25 r.55
  hot #ff7a2f r.60 emissive #ff5500 @1.4 | screen #0b1220 r.25 emissive #1a9e8f @0.9

Building/site kit (site.materials):
  wall #232a33 m.20 r.80 | wallIn #2b333c m.12 r.88 | steel #71808d m.88 r.32
  frame #323b45 m.55 r.48 | roof #171d23 m.38 r.68 | parapet #2e3741 m.32 r.70
  glass #9fd8ff m.10 r.05 opacity .18 | door #1b222a m.40 r.60
  slab #161b21 m.10 r.96 | slabIn #232a31 m.08 r.95 | road #14181d m.05 r.96
  kerb #4a525b m.10 r.88 | paint #d9b400 m.06 r.70 | paintW #cfd6dd m.06 r.70
  grass #18291b m.02 r.98 | trunk #2a2118 m.05 r.95 | leaf #24422a m.03 r.90
  rack #d97706 m.40 r.55 | pallet #4a3c2a m.05 r.92 | tank #b9c4cd m.90 r.26
  lamp #dfeaf5 r.40 emissive #cfe0f0 @0.9 | signGrn #0f766e r.60 emissive @0.35
  ground plane #0a0e12 m.04 r.97, 900x700 m
  flower colours: #d94f7a, #f0b429, #e8ecef

STATUS COLOURS: run #22c55e | warn #f59e0b | stop #ef4444 | idle #64748b

HUD / OVERLAY PANELS:
  font 13px/1.55 "Segoe UI", system-ui, sans-serif
  page background #06080b
  panel rgba(12,16,21,.88) + backdrop-filter blur(14px),
        1px border rgba(255,255,255,.09), radius 12px,
        box-shadow 0 18px 50px rgba(0,0,0,.65)
  text #e8edf2 / muted #7d8b9a / dim #6b7a89 / faint #4b5866
  accent #5eead4, selected row rgba(94,234,212,.11) with border rgba(94,234,212,.34)
  buttons rgba(255,255,255,.06), hover rgba(255,255,255,.14), tiles rgba(255,255,255,.04)
  floor labels: canvas texture, bg rgba(8,12,16,.85), text #5eead4, bold 56px sans-serif
  machine signs: bg #0e141a, left bar #14b8a6, title #e8edf2, subtitle #7d8b9a

SCENE CONVENTIONS (the kits assume these — breaking them makes parts float):
  metres; +X = product flow; +Z = plan south; every machine footprint is CENTRED
  on its group origin and its BASE sits on y = 0.
  kit's box() puts its base on y=0 but cyl() is CENTRED — never mix them up.
  A rotated plane must be positioned with .position.set(), never .translateZ().
  Call kit.tick(deltaSeconds) once per frame or nothing animates.

DO NOT: add extra lights, raise exposure above 1.05, use MeshBasic/MeshLambert,
switch to a light background, add more saturated colours than the teal/yellow/
orange already specified, or load any external image, texture or model file —
the whole scene is procedural geometry plus canvas-drawn text.
````

ใช้ prompt นี้แล้ว Claude Code จะได้ธีมเป๊ะทุกค่า — หรือถ้าจะให้ง่ายกว่านั้น
บอกสั้น ๆ ว่า *"ใช้ธีมจาก plant-theme.js เรียก applyPlantTheme() และ applyPlantTheme.lights() ห้ามแก้ค่าสีหรือแสงเอง"*
