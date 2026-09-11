import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PlacedMachine, PlantLayout } from "../../../../lib/plantLayout";
import { mergeAll, slabGeometry } from "./geometryKit";
import { INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, ringStrip } from "./indoorLanes";
import { MARKINGS } from "./palette";
import { RACKED_ZONE_IDS } from "./WarehouseRacking";

/**
 * ===========================================================================
 * FLOOR MARKINGS — เส้นตีพื้นโรงงาน (ก้าวแรกของ roadmap เส้นตีพื้น)
 * ===========================================================================
 *
 * เพิ่มเส้น/สัญลักษณ์ที่ทาสีจริงบนพื้นโรงงาน เหนือชั้นพื้นทั้งหมดที่
 * `PlantShell.tsx`/`SiteEnvironment.tsx`/`FloorGrid.tsx` ปูไว้แล้ว:
 *   1. เส้นเหลืองขนาบทางเดินคน — จาก `layout.site.walkways` จริง (ไม่คิด
 *      พิกัดใหม่)
 *   2. กรอบขอบเขตเครื่องจักร — สี่เหลี่ยมบางรอบฐานเครื่องทุกตัว ขนาดจาก
 *      width/depth ของเครื่อง + ระยะเผื่อ หมุนตาม rotationY จริง
 *   3. ลานพาเลท — สี่เหลี่ยมลาย hatch ไม่กี่จุด วางในโซนที่มีอยู่จริง
 *      (`layout.site.zones`) ด้วย pseudo-random ที่ seed ตายตัว (ไม่ใช้
 *      `Math.random`) ฉากจึงเหมือนเดิมทุกครั้งที่เปิด — ตรวจชนกับ
 *      `layout.machines` ก่อนวางเสมอ ข้ามช่องนั้นถ้าไม่มีที่ว่างจริง (ดู
 *      `findPalletBaySpot`)
 *   4. ลูกศรทิศทางฟอร์คลิฟท์ — ทั้งบนถนนวงรอบนอกอาคาร (`layout.site.roads`)
 *      และบนเลนรถในอาคาร (`ringStrip`/`indoorLanes.ts` — เส้นทางเดียวกับที่
 *      `SiteEnvironment.tsx`'s `buildIndoorRoads` ใช้ตีถนน ไม่คำนวณพิกัดซ้ำ
 *      เอง) เพราะเลนในอาคารคือเลนที่ฟอร์คลิฟท์ใช้จริงและเห็นได้จากมุมกล้อง
 *      เริ่มต้น ("line"/zone) ต่างจากถนนวงรอบซึ่งอยู่ไกลนอกอาคาร
 *
 * ทุกอย่างเป็นของนิ่ง จึง merge ตามวัสดุเป็นก้อนใหญ่ก้อนเดียวต่อกลุ่มเหมือน
 * `PlantShell.tsx`/`SiteEnvironment.tsx` — ไม่สร้าง mesh ต่อเครื่องแม้จะมี
 * เครื่องนับร้อยตัว ผลคือ **ไม่เกิน** 4 draw call (เท่าจำนวนกลุ่มวัสดุ) —
 * กลุ่มที่ไม่มีเรขาคณิตเลย (bucket ว่าง) ถูกข้ามไปไม่ render เมชเปล่า
 *
 * ระดับความสูง (y) — อ่านจาก y-stack เดิมก่อนเลือกค่า
 * ---------------------------------------------------------------------
 * `PlantShell.tsx` ไล่พื้นจากล่างขึ้นบน: หญ้า(0.06) → ลานคอนกรีต(0.09) →
 * ถนน(0.14, เส้นถนน top 0.16/0.20) → ทางเดินไซต์ apron(0.16, top 0.19) →
 * สแลบใน(0.20) → พื้นโซน(0.26, top 0.29) → ขอบโซน(0.33, top 0.35) ซึ่งเป็น
 * ชั้นบนสุดที่มีอยู่เดิม (ดูคอมเมนต์ "Painted safety markings must always
 * read as the top-most floor decal" ใน `buildShell`) เครื่องหมายในไฟล์นี้
 * จึงต้องอยู่ *เหนือ* ชั้นนั้นเสมอ แยกเป็นสี่ระดับตามบริบทที่มันวางทับ
 * (แทนที่จะใช้ค่าเดียวลอยเหนือทุกอย่างซึ่งจะดูลอยเหนือถนน/ทางเดินเกินจริง):
 *   - เหนือทางเดิน apron (top 0.19)         -> Y_WALK_MARK = 0.20
 *   - เหนือเส้นถนนวงรอบนอกอาคาร (top 0.20)   -> Y_ROAD_MARK = 0.21
 *   - เหนือเส้นเลนในอาคาร (top 0.285, `SiteEnvironment.tsx`'s `Y_INDOOR_PAINT`)
 *     และเหนือพื้นโซน (top 0.29) พร้อมกัน -> Y_INDOOR_ROAD_MARK = 0.30
 *   - เหนือขอบโซน (top 0.35)                -> Y_ZONE_MARK = 0.37
 */

/** ความหนาของทุกเส้น/แผ่นในไฟล์นี้ (เมตร) — บางพอไม่ให้ดูเป็นพื้นซ้อนพื้น */
const MARK_THICKNESS = 0.02;

const Y_WALK_MARK = 0.2;
const Y_ROAD_MARK = 0.21;
// Must clear BOTH the indoor lane paint top (`SiteEnvironment.tsx`'s
// `Y_INDOOR_PAINT` = 0.27, thickness 0.015 -> top 0.285) AND the zone
// platform top (`PlantShell.tsx`: y=0.26 + thickness 0.03 -> top exactly
// 0.29) — 0.29 itself would sit flush with the platform with zero
// clearance. The two only avoid overlapping today because the indoor road
// ring (offset 8.4 + half-width 3 = 11.4 m from the wall) sits inside the
// zones' own 15 m wall setback (`plantLayout.ts`'s `HALL_PERIMETER`), a
// ~3.6 m gap — but the y value itself should still keep real clearance,
// like every other tier in this stack.
const Y_INDOOR_ROAD_MARK = 0.3;
const Y_ZONE_MARK = 0.37;

/** ระยะเผื่อรอบขอบเขตจริงของเครื่องก่อนตีกรอบ (เมตร) */
const FOOTPRINT_MARGIN = 0.3;
/** ความกว้างเส้นกรอบขอบเขตเครื่องจักร (เมตร) */
const OUTLINE_STRIPE_W = 0.1;

/** ความกว้างเส้นเหลืองขนาบทางเดิน + ระยะห่างจากกึ่งกลางทางเดิน (เมตร) —
 *  ทางเดินจาก `site.walkways` กว้าง 1.8 ม. (ดู `PlantShell.tsx`'s apron push) */
const WALK_STRIPE_W = 0.16;
const WALK_STRIPE_OFFSET = 0.75;

/** ขนาดลานพาเลทหนึ่งช่อง + ความกว้างเส้น (เมตร) */
const PALLET_BAY_SIZE = 3;
const PALLET_STRIPE_W = 0.12;
/** จำนวนโซนที่ใช้วางลานพาเลท (หยิบโซนแรกตามลำดับที่ `plantSite.ts` ประกาศไว้
 *  เสมอ — deterministic ไม่ขึ้นกับ input order ใด ๆ) */
const PALLET_ZONE_COUNT = 4;
/** ระยะเผื่อรอบเครื่องจักรที่ลานพาเลทต้องไม่ล้ำเข้าไป (เมตร) */
const PALLET_CLEARANCE = 1.5;
/** จำนวนตำแหน่งสุ่ม (seeded) ที่ลองก่อนจะยอมข้ามช่องนั้นไปเลย */
const PALLET_MAX_ATTEMPTS = 12;

/** ระยะห่างระหว่างลูกศรฟอร์คลิฟท์บนถนนหนึ่งเส้น (เมตร) */
const ARROW_SPACING = 40;
const ARROW_LENGTH = 2.2;
const ARROW_WIDTH = 1.1;

type MarkKey = "walkway" | "footprint" | "pallet" | "arrow";

const MATERIAL_SPECS: Record<MarkKey, { color: string; roughness: number }> = {
  walkway: { color: MARKINGS.walkwayStripe, roughness: 0.65 },
  footprint: { color: MARKINGS.footprintOutline, roughness: 0.65 },
  pallet: { color: MARKINGS.palletBay, roughness: 0.65 },
  arrow: { color: MARKINGS.forkliftArrow, roughness: 0.65 },
};

const MARK_KEYS = Object.keys(MATERIAL_SPECS) as MarkKey[];

type Buckets = Record<MarkKey, THREE.BufferGeometry[]>;

function emptyBuckets(): Buckets {
  const out = {} as Buckets;
  for (const key of MARK_KEYS) out[key] = [];
  return out;
}

/** กล่องบาง ณ พิกัดโลก (ฐานอยู่ที่ `y`) — เหมือน helper เดียวกับไฟล์พี่น้อง */
function box(x: number, y: number, z: number, w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

/**
 * seed -> [0, 1) แบบ deterministic (shader-style sine hash) — ใช้แทน
 * `Math.random()` เพื่อให้ตำแหน่งลานพาเลทเหมือนเดิมทุกครั้งที่เปิดฉาก
 */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * ครึ่งความกว้าง/ลึกของกล่องแนวแกน (AABB) ที่ "ครอบ" รูปสี่เหลี่ยมของ
 * เครื่องจักรหนึ่งตัวหลังหมุนตาม `rotationY` จริง (ไม่ใช่แค่ width/depth
 * ดิบ) — กว้างกว่ารูปทรงจริงเล็กน้อยเมื่อเครื่องหมุนเฉียง แต่ปลอดภัยกว่าเสมอ
 * ไม่มีทางพลาดตรวจไม่เจอของจริง ใช้ร่วมกันทั้ง `collidesWithMachine` (จุด
 * ทดสอบ) และ `machinesNearZone` (กรองเครื่องก่อนเริ่มทดสอบ)
 */
function machineHalfExtents(m: PlacedMachine): { extX: number; extZ: number } {
  const cos = Math.abs(Math.cos(m.rotationY));
  const sin = Math.abs(Math.sin(m.rotationY));
  return {
    extX: (m.width / 2) * cos + (m.depth / 2) * sin,
    extZ: (m.width / 2) * sin + (m.depth / 2) * cos,
  };
}

/**
 * ทดสอบว่าลานพาเลทช่องนี้ (สี่เหลี่ยม `size` x `size` ที่ x,z) ทับกับกล่อง
 * ขอบเขตของเครื่องจักรตัวใดใน `machines` หรือไม่ (รวมระยะเผื่อ `clearance`)
 */
function collidesWithMachine(
  x: number,
  z: number,
  size: number,
  machines: PlacedMachine[],
  clearance: number
): boolean {
  const half = size / 2 + clearance;
  for (const m of machines) {
    const { extX, extZ } = machineHalfExtents(m);
    if (Math.abs(x - m.x) < half + extX && Math.abs(z - m.z) < half + extZ) return true;
  }
  return false;
}

/**
 * กรองเครื่องจักรทุกตัวที่อาจ "ล้ำเข้ามา" ในโซนนี้จริง ๆ — ทดสอบด้วยระยะ
 * (axis-aligned overlap) ระหว่างกล่องขอบเขตของเครื่อง (`machineHalfExtents`)
 * กับกล่องของโซนที่ขยายออกด้วยระยะเผื่อ `clearance` โดยไม่สนใจ `zoneId` ของ
 * เครื่องเลย — เครื่องจากโซนข้าง ๆ ที่หมุนแล้วยื่นข้ามเส้นแบ่งโซนมาจริง ๆ
 * (ซึ่งกรองด้วย `zoneId` แบบเดิมจะมองไม่เห็น) ยังถูกจับได้ที่นี่
 */
function machinesNearZone(
  zone: { x: number; z: number; w: number; d: number },
  machines: PlacedMachine[],
  clearance: number
): PlacedMachine[] {
  const zoneHalfW = zone.w / 2 + clearance;
  const zoneHalfD = zone.d / 2 + clearance;
  return machines.filter((m) => {
    const { extX, extZ } = machineHalfExtents(m);
    return Math.abs(m.x - zone.x) < extX + zoneHalfW && Math.abs(m.z - zone.z) < extZ + zoneHalfD;
  });
}

/**
 * หาตำแหน่งลานพาเลทหนึ่งช่องที่ไม่ทับเครื่องจักรตัวใดใกล้โซนนี้ — ลองตำแหน่ง
 * seeded ภายในขอบเขตโซน (เผื่อระยะให้ทั้งช่องอยู่ในโซนจริง) ทีละจุดจาก
 * `hash01`, คืนจุดแรกที่ไม่ชน หรือ `null` ถ้าลองครบ `PALLET_MAX_ATTEMPTS`
 * แล้วไม่มีที่ว่างเลย (ข้ามช่องนั้นไปทั้งช่อง ดีกว่าไปทาสีทับเครื่อง)
 */
function findPalletBaySpot(
  zone: { x: number; z: number; w: number; d: number },
  zoneMachines: PlacedMachine[],
  seedBase: number
): { x: number; z: number } | null {
  const half = PALLET_BAY_SIZE / 2;
  const marginX = zone.w / 2 - half - 0.5;
  const marginZ = zone.d / 2 - half - 0.5;
  if (marginX <= 0 || marginZ <= 0) return null;

  for (let attempt = 0; attempt < PALLET_MAX_ATTEMPTS; attempt += 1) {
    const fx = hash01(seedBase + attempt * 2 + 1) * 2 - 1;
    const fz = hash01(seedBase + attempt * 2 + 2) * 2 - 1;
    const x = zone.x + fx * marginX;
    const z = zone.z + fz * marginZ;
    if (!collidesWithMachine(x, z, PALLET_BAY_SIZE, zoneMachines, PALLET_CLEARANCE)) return { x, z };
  }
  return null;
}

/**
 * กรอบขอบเขตสี่เหลี่ยมบางรอบเครื่องจักรหนึ่งตัว — ปั้นเป็นสี่แผ่นในกรอบ
 * ท้องถิ่นก่อน (จุดศูนย์กลางที่ 0,0) แล้วหมุนรอบแกน Y ตาม `rotationY` จริง
 * ก่อนย้ายไปตำแหน่งโลก ผลคือกรอบทั้งชิ้นหมุนเป็นก้อนแข็งตามเครื่องพอดี
 */
function machineOutline(m: PlacedMachine): THREE.BufferGeometry[] {
  const w = m.width + FOOTPRINT_MARGIN * 2;
  const d = m.depth + FOOTPRINT_MARGIN * 2;
  const t = OUTLINE_STRIPE_W;
  const pieces = [
    box(0, 0, d / 2 - t / 2, w, MARK_THICKNESS, t),
    box(0, 0, -d / 2 + t / 2, w, MARK_THICKNESS, t),
    box(w / 2 - t / 2, 0, 0, t, MARK_THICKNESS, d),
    box(-w / 2 + t / 2, 0, 0, t, MARK_THICKNESS, d),
  ];
  for (const piece of pieces) {
    piece.rotateY(m.rotationY);
    piece.translate(m.x, Y_ZONE_MARK, m.z);
  }
  return pieces;
}

/** ลานพาเลทหนึ่งช่อง — กรอบสี่เหลี่ยม + ลาย hatch กากบาททแยงมุม */
function palletBay(x: number, z: number): THREE.BufferGeometry[] {
  const size = PALLET_BAY_SIZE;
  const half = size / 2;
  const t = PALLET_STRIPE_W;
  const pieces = [
    box(x, Y_ZONE_MARK, z + half - t / 2, size, MARK_THICKNESS, t),
    box(x, Y_ZONE_MARK, z - half + t / 2, size, MARK_THICKNESS, t),
    box(x + half - t / 2, Y_ZONE_MARK, z, t, MARK_THICKNESS, size),
    box(x - half + t / 2, Y_ZONE_MARK, z, t, MARK_THICKNESS, size),
  ];
  const diagLen = size * Math.SQRT2 * 0.82;
  for (const sign of [1, -1]) {
    const diag = new THREE.BoxGeometry(diagLen, MARK_THICKNESS, t * 0.75);
    diag.rotateY((sign * Math.PI) / 4);
    diag.translate(x, Y_ZONE_MARK + MARK_THICKNESS / 2, z);
    pieces.push(diag);
  }
  return pieces;
}

/**
 * ลูกศรฟอร์คลิฟท์แบบ chevron แบน — ปั้นในระนาบ XY แล้วหมุนราบลงระนาบ XZ
 * ชี้ไปทาง +X ก่อนหมุนตามทิศถนนจริงและย้ายไปตำแหน่ง
 */
function chevronGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = ARROW_WIDTH / 2;
  const half = ARROW_LENGTH / 2;
  shape.moveTo(-half, hw);
  shape.lineTo(half, 0);
  shape.lineTo(-half, -hw);
  shape.lineTo(-half + ARROW_LENGTH * 0.35, 0);
  shape.closePath();
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  return g;
}

/**
 * วางลูกศรฟอร์คลิฟท์เรียงตามแนวเส้นทางหนึ่งเส้น (ถนนวงรอบนอกอาคารหรือเลนรถ
 * ในอาคาร — ทั้งสองแบบเป็น "เส้นตรงยาว `len` ตามแกน x หรือ z" เหมือนกัน) แล้ว
 * ดันเข้า bucket `arrow` — แยกเป็นฟังก์ชันเดียวกันเพื่อไม่ให้ตรรกะการวาง
 * ลูกศรเพี้ยนกันระหว่างสองแหล่งที่มา
 */
function pushArrows(
  bucket: THREE.BufferGeometry[],
  run: { x: number; z: number; len: number; alongX: boolean; laneWidth: number },
  y: number
) {
  const count = Math.max(2, Math.round(run.len / ARROW_SPACING));
  const laneOffset = run.laneWidth / 4;
  for (let i = 0; i < count; i += 1) {
    const t = -run.len / 2 + (run.len * (i + 0.5)) / count;
    const arrow = chevronGeometry();
    if (run.alongX) {
      arrow.translate(run.x + t, y, run.z + laneOffset);
    } else {
      arrow.rotateY(Math.PI / 2);
      arrow.translate(run.x + laneOffset, y, run.z + t);
    }
    bucket.push(arrow);
  }
}

/**
 * ประกอบเรขาคณิตของเครื่องหมายทั้งหมด — แยกเป็นฟังก์ชันบริสุทธิ์เหมือน
 * `PlantShell.tsx`'s `buildShell` เพื่อให้ทดสอบ/อ่านลำดับได้ตรง ๆ
 */
function buildMarkings(layout: PlantLayout): Partial<Record<MarkKey, THREE.BufferGeometry>> {
  const b = emptyBuckets();
  const site = layout.site;

  // --- 1. เส้นเหลืองขนาบทางเดินคน ------------------------------------------
  for (const walk of site.walkways) {
    const isX = walk.dir === "x";
    for (const side of [-1, 1]) {
      b.walkway.push(
        isX
          ? slabGeometry(walk.x, walk.z + side * WALK_STRIPE_OFFSET, walk.len, WALK_STRIPE_W, Y_WALK_MARK, MARK_THICKNESS)
          : slabGeometry(walk.x + side * WALK_STRIPE_OFFSET, walk.z, WALK_STRIPE_W, walk.len, Y_WALK_MARK, MARK_THICKNESS)
      );
    }
  }

  // --- 2. กรอบขอบเขตเครื่องจักรทุกตัว ---------------------------------------
  for (const m of layout.machines) {
    for (const piece of machineOutline(m)) b.footprint.push(piece);
  }

  // --- 3. ลานพาเลท — หยิบโซนแรกตามลำดับที่ประกาศไว้ (deterministic), ต้อง
  //        ไม่ทับเครื่องจักรตัวใดในโซนนั้นเลย (ข้ามช่องนั้นถ้าไม่มีที่ว่าง) --
  // ยกเว้นทุกโซนที่มีชั้นวางพาเลทจริงอยู่แล้ว (`RACKED_ZONE_IDS`, มาจาก
  // `WarehouseRacking.tsx`'s `RACK_ZONE_CONFIGS` โดยตรง ไม่ hardcode id ซ้ำ
  // ไว้ที่นี่ กันสองรายการนี้ไหลตามกันไม่ทันในอนาคต) — "ลานพาเลทว่างที่ทาสี
  // ไว้" มีความหมายเฉพาะในโซนการผลิตที่ยังไม่มีที่เก็บของจริง (จุดพักงาน
  // ระหว่างทำ) แต่โซนที่อยู่ใน `RACKED_ZONE_IDS` มีชั้นวางพาเลทจริง 3 มิติแล้ว
  // (`WarehouseRacking.tsx`, roadmap step 8) — ทาสีลานว่างทับชั้นวางจริงจะขัด
  // กันเอง (ป้ายบอก "ที่ว่างเปล่า" ซ้อนอยู่ใต้ชั้นวางที่เต็มไปด้วยพาเลท) จึง
  // กรองออกก่อนหยิบ `PALLET_ZONE_COUNT` โซนแรก แทนที่จะ slice ดิบ ๆ ตามลำดับ
  // ประกาศ
  const baySeedZones = site.zones.filter((z) => !RACKED_ZONE_IDS.has(z.id)).slice(0, PALLET_ZONE_COUNT);
  baySeedZones.forEach((zone, i) => {
    // Spatial overlap, not `m.zoneId === zone.id` — a rotated machine
    // assigned to the neighbouring zone can still overhang this zone's own
    // rect near the shared boundary, and a zoneId filter would miss it.
    const zoneMachines = machinesNearZone(zone, layout.machines, PALLET_CLEARANCE);
    const spot = findPalletBaySpot(zone, zoneMachines, i * 1000);
    if (!spot) return;
    for (const piece of palletBay(spot.x, spot.z)) b.pallet.push(piece);
  });

  // --- 4a. ลูกศรทิศทางฟอร์คลิฟท์บนถนนวงรอบนอกอาคาร (`site.roads` จริง) -----
  for (const road of site.roads) {
    pushArrows(
      b.arrow,
      { x: road.x, z: road.z, len: road.len, alongX: road.dir === "x", laneWidth: road.w },
      Y_ROAD_MARK
    );
  }

  // --- 4b. ลูกศรทิศทางฟอร์คลิฟท์บนเลนรถในอาคาร — เส้นทางเดียวกับที่
  //         `SiteEnvironment.tsx`'s `buildIndoorRoads` ใช้ตีถนนจริง (ผ่าน
  //         `ringStrip`/`indoorLanes.ts` ที่ใช้ร่วมกัน ไม่คำนวณพิกัดซ้ำเอง) --
  for (const run of ringStrip(layout.hall.w, layout.hall.d, INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, true)) {
    pushArrows(
      b.arrow,
      { x: run.x, z: run.z, len: run.len, alongX: run.alongX, laneWidth: run.alongX ? run.d : run.w },
      Y_INDOOR_ROAD_MARK
    );
  }

  const merged: Partial<Record<MarkKey, THREE.BufferGeometry>> = {};
  for (const key of MARK_KEYS) {
    const geometry = mergeAll(b[key]);
    if (geometry) merged[key] = geometry;
  }
  return merged;
}

export interface FloorMarkingsProps {
  layout: PlantLayout;
}

export function FloorMarkings({ layout }: FloorMarkingsProps) {
  const merged = useMemo(() => buildMarkings(layout), [layout]);

  // R3F already disposes a `<mesh>`'s attached `geometry` on unmount/geometry
  // change, so this is a belt-and-suspenders safety net (idempotent to call
  // twice), not a required fix — kept for parity with `PlantShell.tsx`'s own
  // cleanup effect, which disposes the same way for the same reason.
  useEffect(
    () => () => {
      for (const geometry of Object.values(merged)) geometry?.dispose();
    },
    [merged]
  );

  return (
    <group>
      {MARK_KEYS.map((key) => {
        const geometry = merged[key];
        if (!geometry) return null;
        const spec = MATERIAL_SPECS[key];
        return (
          <mesh
            key={key}
            geometry={geometry}
            castShadow={false}
            receiveShadow={false}
            // เส้นตีพื้นต้อง "โปร่งใส" ต่อ raycast เสมอ — คลิกทะลุไปโดนเครื่อง
            // จักร/พื้นข้างใต้ได้ตามปกติ ไม่แย่ง event ของการเลือกเครื่อง
            // (แพทเทิร์นเดียวกับ `MachineInstances.tsx`'s `raycast = () => null`)
            ref={(node) => {
              if (node) node.raycast = () => null;
            }}
          >
            <meshStandardMaterial
              color={spec.color}
              roughness={spec.roughness}
              metalness={0.02}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default FloorMarkings;
