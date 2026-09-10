import * as THREE from "three";
import type { PlacedMachine } from "../../../../lib/plantLayout";
import { slabGeometry } from "./geometryKit";
import { FLOOR, SHELL, MACHINE, WALKWAY } from "./palette";
import { LIVE_FLOOR_THEME } from "../liveFloorTheme";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — SHARED
 * ===========================================================================
 *
 * ค่ากลาง/ชนิดข้อมูล/ฟังก์ชันช่วยที่ใช้ร่วมกันระหว่างโมดูลย่อยของ
 * `SiteEnvironment.tsx` (แยกไฟล์นี้ออกมาจาก `SiteEnvironment.tsx` เดิม —
 * ดูคอมเมนต์หัวไฟล์นั้นสำหรับพื้นหลังของทั้งระบบ) เก็บ:
 *   - `EnvKey`/`MATERIAL_SPECS`/`Buckets` — ระบบวัสดุ/ก้อนเรขาคณิตร่วม
 *   - `box`/`pillar`/`emptyBuckets` — ตัวช่วยสร้างเรขาคณิตพื้นฐาน
 *   - ค่าคงที่ระดับ y ทุกชั้น, ค่าคงที่ระยะทางเดิน/ถนนที่ใช้ข้ามหลายโมดูล
 *   - `Corridor`/`insideCorridor`/`pushOutFrom` — กลไกกันชน/เว้นระยะร่วม
 *   - `machineHalfExtents` — สูตร AABB เครื่องจักรที่ใช้ร่วมกับ
 *     `FloorMarkings.tsx`/`WarehouseRacking.tsx` (ห้ามแก้สูตร)
 *   - `paintWalkEdges`/`walkRun`/`crossingStripes` — ตัวช่วยวาดทางเดิน/เส้น
 *     เหลืองที่ใช้ซ้ำในหลายโมดูล
 *   - `officeFloors` — แฮชคงที่ (deterministic) สำหรับจำนวนชั้นอาคารสำนักงาน
 */

export type EnvKey =
  | "walkGreen"
  | "walkRed"
  | "walkLine"
  | "zebra"
  | "roadway"
  | "laneLine"
  | "curbYellow"
  | "curbWhite"
  | "curbRed"
  | "curb"
  | "truss"
  | "column"
  | "eave"
  | "signPlate"
  | "signEdge"
  | "foliage"
  | "hedge"
  | "trunk"
  | "wall"
  | "glass"
  | "metal"
  | "roofDeck"
  | "officeWall"
  | "officeBand"
  | "plaza"
  | "roadLine";

export const MATERIAL_SPECS: Record<EnvKey, { color: string; roughness: number; metalness: number }> = {
  /**
   * ทางเดินคนในอาคาร — งานทาสีพื้นแบบ "Clean Digital Twin": พื้นผิวอ่านเป็น
   * งานทาสีจริง (ไม่ใช่ก้อนด้านแบบดินน้ำมัน) ผิวมัน satin เบา ๆ ให้คีย์ไลต์
   * ไล้ผ่านแล้วเห็นเป็นเส้นทาสีต่างจากพื้นสแลบรอบข้าง — จัดเป็นกลุ่ม "เส้น/แถบ
   * ทาสีพื้น" เดียวกับเส้นเหลือง/ทางม้าลาย/เส้นเลน
   */
  walkGreen: { color: WALKWAY.epoxyGreen, roughness: 0.65, metalness: 0.04 },
  /** ทางเดินคนนอกอาคาร — แดงอิฐ งานทาสีพื้นกลางแจ้ง */
  walkRed: { color: WALKWAY.outdoorRed, roughness: 0.65, metalness: 0.04 },
  /** เส้นเหลืองขอบทางเดิน — เส้นที่ห้ามข้าม */
  walkLine: { color: WALKWAY.edgeYellow, roughness: 0.65, metalness: 0.04 },
  /** ทางม้าลาย/จุดข้ามถนน */
  zebra: { color: WALKWAY.crossingWhite, roughness: 0.65, metalness: 0.04 },
  /** ผิวเลนรถ — ทั้งถนนในอาคารและถนนบริการรอบโรง (คอนกรีตผนึกผิวมันเบา) */
  roadway: { color: WALKWAY.roadway, roughness: 0.75, metalness: 0.03 },
  /** เส้นแบ่งเลนรถ */
  laneLine: { color: WALKWAY.laneWhite, roughness: 0.65, metalness: 0.04 },
  /** คันหินแถบเหลือง (DXF: GUTTER AND CURB) */
  curbYellow: { color: WALKWAY.curbYellow, roughness: 0.65, metalness: 0.04 },
  /** คันหินแถบขาว สลับกับแถบเหลือง */
  curbWhite: { color: WALKWAY.curbWhite, roughness: 0.65, metalness: 0.04 },
  /** หัวคันหินสีแดง — ปลายแนวและจุดห้ามจอด */
  curbRed: { color: WALKWAY.curbRed, roughness: 0.65, metalness: 0.04 },
  /** คันหินเปลือย/รางระบายที่ไม่ได้ทาสี — จัดเป็นคอนกรีตผนึกผิวเหมือนพื้น/ถนน */
  curb: { color: LIVE_FLOOR_THEME.site.kerb, roughness: 0.75, metalness: 0.03 },
  /** โครงถักหลังคาอาคารไลน์ — เหล็กโครงสร้างทาสี */
  truss: { color: SHELL.beam, roughness: 0.6, metalness: 0.15 },
  /** เสาอาคารไลน์ (DXF: COLUMN) — เหล็กโครงสร้างทาสี */
  column: { color: SHELL.column, roughness: 0.6, metalness: 0.15 },
  /** คานเชิงชายรอบอาคารไลน์ — เหล็กโครงสร้างทาสี */
  eave: { color: SHELL.roofEdge, roughness: 0.6, metalness: 0.15 },
  /** แผ่นป้ายชื่อโซน (DXF: SIGN BOARD) — แผ่นป้ายโลหะทาสี จัดกลุ่มเดียวกับ
   *  ตัวถัง/แผงเครื่องจักร (satin painted) ไม่ใช่งานเหล็กโครงสร้าง */
  signPlate: { color: LIVE_FLOOR_THEME.site.signPlate, roughness: 0.55, metalness: 0.12 },
  /** แถบสีขอบป้าย — ใช้แทนตัวอักษร (ไม่โหลดฟอนต์เข้าฉาก) จึงต้องอ่านชัดบนแผ่น
   *  ป้ายครีมสว่าง (`site.signPlate`) ใช้ `site.signGlow` (สเลทเข้ม) แทน
   *  `accent` เดิม — accent (#ffd9a0) จางเกินกว่าจะอ่านออกบนป้ายครีมนี้ */
  signEdge: { color: LIVE_FLOOR_THEME.site.signGlow, roughness: 0.55, metalness: 0.12 },
  foliage: { color: SHELL.foliage, roughness: 0.9, metalness: 0.0 },
  hedge: { color: LIVE_FLOOR_THEME.site.hedge, roughness: 0.9, metalness: 0.0 },
  trunk: { color: SHELL.trunk, roughness: 0.9, metalness: 0.0 },
  /** ผนังอาคารประกอบ (ป้อมยาม โรงบำบัด) — ผิวสถาปัตยกรรมด้าน */
  wall: { color: SHELL.building, roughness: 0.8, metalness: 0.05 },
  glass: { color: SHELL.buildingGlass, roughness: 0.08, metalness: 0.02 },
  /** งานเหล็ก — ประตูรั้ว ราวกัน ฝาท่อ ถังบำบัด — จัดเป็นเหล็กโครงสร้างทาสี */
  metal: { color: MACHINE.frame, roughness: 0.6, metalness: 0.15 },
  /**
   * แผ่นหลังคาเมทัลชีตของอาคารไลน์ผลิต
   *
   * แยกเป็นวัสดุ (และ bucket) ของตัวเอง เพราะเป็นชิ้นเดียวในฉากที่ต้อง
   * เปิด-ปิดได้ตอนรันไทม์ (โหมด "เปิดหลังคา" แบบเกม The Sims) — เก็บแยกก้อน
   * แล้วเลือกไม่เรนเดอร์ ถูกกว่าการสร้างเรขาคณิตทั้งไซต์ใหม่ทุกครั้งที่กดสลับ
   */
  roofDeck: { color: SHELL.wallAlt, roughness: 0.6, metalness: 0.15 },
  /** ผนังทึบอาคารสำนักงาน — ผิวสถาปัตยกรรมด้าน */
  officeWall: { color: LIVE_FLOOR_THEME.site.officeWall, roughness: 0.8, metalness: 0.05 },
  /** แถบพื้นชั้น (floor-slab band) คั่นระหว่างชั้น — ผิวสถาปัตยกรรมด้าน */
  officeBand: { color: LIVE_FLOOR_THEME.site.officeBand, roughness: 0.8, metalness: 0.05 },
  /** ลานปูหน้าอาคารสำนักงาน — คอนกรีตผนึกผิวมันเบา */
  plaza: { color: LIVE_FLOOR_THEME.site.plazaPaving, roughness: 0.75, metalness: 0.03 },
  roadLine: { color: FLOOR.roadLine, roughness: 0.65, metalness: 0.04 },
};

export const ENV_KEYS = Object.keys(MATERIAL_SPECS) as EnvKey[];

export type Buckets = Record<EnvKey, THREE.BufferGeometry[]>;

export function emptyBuckets(): Buckets {
  const out = {} as Buckets;
  for (const key of ENV_KEYS) out[key] = [];
  return out;
}

export function box(x: number, y: number, z: number, w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

export function pillar(x: number, y: number, z: number, r: number, h: number, seg = 10): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(r, r * 1.06, h, seg);
  g.translate(x, y + h / 2, z);
  return g;
}

// ---------------------------------------------------------------------------
// ระดับความสูงของแผ่นพื้นแต่ละชั้น
//
// PlantShell ปูพื้นไล่ y ขึ้นทีละ 1-3 ซม. (หญ้า 0.06 → ลานคอนกรีต 0.09 →
// ถนน 0.14 → ทางเดินไซต์ 0.16 → สแลบใน 0.20 → พื้นโซน 0.26 → ขอบโซน 0.30)
// ของในไฟล์นี้จึงต้องอยู่ *เหนือ* ชั้นเหล่านั้น ไม่งั้นจะจมหายหรือกะพริบ
// สลับกับพื้น (z-fighting) — ห้ามลดค่าพวกนี้ลงมาชนของ PlantShell
// ---------------------------------------------------------------------------
export const Y_LINE_WALKWAY = 0.32;
export const Y_LINE_PAINT = 0.35;
export const Y_SITE_ROAD = 0.15;
export const Y_SITE_PAINT = 0.19;
/** ถนนในอาคาร — อยู่บนสแลบใน (0.20) แต่ต่ำกว่าพื้นโซน (0.26) */
export const Y_INDOOR_ROAD = 0.22;
/** ทางเดินเขียวในอาคาร — ทับบนสแลบเดียวกัน สูงกว่าถนนเล็กน้อย */
export const Y_INDOOR_WALK = 0.24;
export const Y_INDOOR_PAINT = 0.27;

/**
 * ความกว้างของแนวทางเดิน/ถนนรอบอาคาร (เมตร)
 *
 * โรงมี "ขอบเขตรอบอาคาร" ว่างอยู่ 15 ม. ทุกด้าน (`HALL_PERIMETER` ใน
 * plantLayout.ts — โซนถูกร่นเข้ามาจากผนังเท่านั้นพอดี) เลนพวกนี้จึงวางลงใน
 * ช่องว่างนั้นได้โดยไม่ทับเครื่องจักรแม้แต่ตัวเดียว
 *
 * ระยะวัดจากผนัง เข้าไปในอาคาร:
 *   1.4 - 4.0   ทางเดินคนสีเขียว (2.6 ม.)
 *   5.4 - 11.4  ถนนรถในอาคาร (6.0 ม.)
 *   15.0        ขอบโซนการผลิต
 *
 * ระยะวัดจากผนัง ออกไปนอกอาคาร:
 *   1.6 - 4.6   ทางเดินคนสีแดงอิฐ (3.0 ม.)
 *   5.0         คันหินทาลายเหลือง/ขาว
 *   9.0 - 17.0  ถนนบริการวงรอบ (`buildRingRoad`)
 */
export const INDOOR_WALK_W = 2.6;
export const INDOOR_WALK_OFFSET = 2.7;
// `INDOOR_ROAD_W`/`INDOOR_ROAD_OFFSET` moved to `indoorLanes.ts` — `FloorMarkings.tsx`
// needs the same indoor lane geometry for its forklift arrows, and duplicating
// these constants in two files would only drift out of sync.
export const OUTDOOR_WALK_W = 3.0;
export const OUTDOOR_WALK_OFFSET = 3.1;
export const OUTDOOR_CURB_OFFSET = 5.0;

/**
 * ช่วงพาดหลังคากว้างสุดต่อหนึ่งช่วง (เมตร)
 *
 * โรงงานจริงพาดไกลสุดราว 40-60 ม. โซนที่กว้างกว่านี้จะถูกซอยเป็นหลายช่วง
 * (ดู `buildLineHalls`) ไม่ใช่พาดทีเดียว — โซน LINES กว้าง 295 ม.
 */
export const MAX_ROOF_SPAN = 34;

/**
 * ระยะของแถวต้นไม้ที่ล้อมอาคาร วัดจากผนังโรงออกไป (เมตร)
 *
 * ต้องเริ่มหลังขอบนอกของถนนบริการ (ผนัง +17 ม. — ดู `buildRingRoad`) ไม่งั้น
 * ต้นไม้จะไปยืนกลางถนน แถวสุดท้ายต้องไม่เกินขอบลานของไซต์ที่ `PlantShell` ปู
 * ไว้ (ลานคอนกรีต 1.35 เท่าของโรง, หญ้า 1.9 เท่า)
 */
export const TREE_ROWS = [22, 31, 40];
/** ระยะปลูกในแถว (เมตร) */
export const TREE_SPACING = 12;

/** ความกว้างทางเดินคนในไลน์ (เมตร) — พอให้รถเข็นของสวนกันได้ */
export const WALKWAY_WIDTH = 2.4;
/** ระยะเว้นจากขอบกลุ่มเครื่องถึงขอบทางเดิน */
export const WALKWAY_CLEARANCE = 1.1;

/** กล่องพื้นที่หวงห้าม (พิกัดโลก, เมตร) — ห้ามปลูกต้นไม้ทับ */
export interface Corridor {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

/** จุดนี้อยู่ในช่องทางเข้าช่องใดช่องหนึ่งหรือไม่ */
export function insideCorridor(x: number, z: number, corridors: Corridor[]): boolean {
  for (const c of corridors) {
    if (x >= c.x0 && x <= c.x1 && z >= c.z0 && z <= c.z1) return true;
  }
  return false;
}

/**
 * เดินระยะ `start` (แกน Z) ออกจากโรงต่อไปเรื่อย ๆ (ค่าลบมากขึ้น = ไกลออกไป)
 * จนพ้นทุกกล่องใน `rects` ที่คาบเกี่ยวช่วง `[centerX-halfSpanX, centerX+halfSpanX]`
 * บนแกน X — สกัดออกมาเป็นฟังก์ชันระดับโมดูล (เดิมเป็น closure ในตัว
 * `buildLoadingDock` เท่านั้น) เพราะ `buildSubstation` ต้องดันตัวเองพ้นถนน
 * วงรอบ + โรงเก็บของ/อาคารจริงแบบเดียวกันทุกประการ มีจุดเดียวจึงพังไม่ได้ไม่
 * ตรงกันไม่ว่าใครแก้สูตรทีหลัง
 */
export function pushOutFrom(
  rects: Array<{ x: number; z: number; w: number; d: number }>,
  start: number,
  centerX: number,
  halfSpanX: number,
  clearance: number
): number {
  let z = start;
  for (const r of rects) {
    const overlapsX = centerX - halfSpanX < r.x + r.w / 2 && centerX + halfSpanX > r.x - r.w / 2;
    if (!overlapsX) continue;
    const far = r.z - r.d / 2; // ขอบไกลจากโรงที่สุดของสิ่งปลูกสร้างนั้น
    const candidate = far - clearance;
    if (candidate < z) z = candidate;
  }
  return z;
}

/**
 * ระยะ/ความกว้างถนนบริการวงรอบ — ดึงเป็นค่ากลางตรงนี้ (แทนตัวเลขฝังในฟังก์ชัน
 * เดิม) เพราะ `buildLoadingDock` ต้องรู้ขอบในของถนนเส้นนี้ด้วย เพื่อกันไม่ให้
 * เสากันสาดไปโผล่กลางเลนรถ — มีจุดเดียวจึงชนกันไม่ได้ไม่ว่าใครแก้ค่าไหนทีหลัง
 */
export const RING_ROAD_GAP = 9;
export const RING_ROAD_W = 8;

/**
 * ครึ่งความกว้าง/ลึกของกล่องแนวแกน (AABB) ที่ "ครอบ" เครื่องจักรหนึ่งตัวหลัง
 * หมุนตาม `rotationY` จริง — คัดลอกสูตรเดียวกับ `FloorMarkings.tsx`/
 * `WarehouseRacking.tsx`'s `machineHalfExtents` (ทั้งสองไฟล์ห้ามแก้และไม่
 * export ฟังก์ชันนี้ จึงต้องคัดลอกสูตร ไม่ใช่คิดสูตรใหม่)
 */
export function machineHalfExtents(m: PlacedMachine): { extX: number; extZ: number } {
  const cos = Math.abs(Math.cos(m.rotationY));
  const sin = Math.abs(Math.sin(m.rotationY));
  return {
    extX: (m.width / 2) * cos + (m.depth / 2) * sin,
    extZ: (m.width / 2) * sin + (m.depth / 2) * cos,
  };
}


/**
 * เส้นเหลืองสองข้างแถบทางเดิน — "เส้นที่ห้ามข้าม"
 */
export function paintWalkEdges(
  run: { x: number; z: number; w: number; d: number; alongX: boolean; len: number },
  width: number,
  y: number,
  b: Buckets
) {
  for (const side of [-1, 1]) {
    b.walkLine.push(
      run.alongX
        ? slabGeometry(run.x, run.z + (side * width) / 2, run.len, 0.16, y, 0.015)
        : slabGeometry(run.x + (side * width) / 2, run.z, 0.16, run.len, y, 0.015)
    );
  }
}

/**
 * ตีแถบทางเดินหนึ่งช่วง (ตรง) พร้อมเส้นเหลืองสองข้าง
 *
 * `from`/`to` เป็นพิกัดบนแกนที่ทางเดินวิ่ง (`axis`) ส่วนอีกแกนคงที่ที่ `fixed`
 * คืนกล่องของช่วงนั้นออกมา เพื่อให้ผู้เรียกเอาไปคำนวณจุดต่อช่วงถัดไปได้
 */
export function walkRun(
  axis: "x" | "z",
  from: number,
  to: number,
  fixed: number,
  width: number,
  y: number,
  yPaint: number,
  bucket: THREE.BufferGeometry[],
  b: Buckets
): { center: number; len: number } {
  const len = Math.abs(to - from);
  if (len <= 0) return { center: (from + to) / 2, len: 0 };
  const center = (from + to) / 2;
  const alongX = axis === "x";

  bucket.push(
    slabGeometry(
      alongX ? center : fixed,
      alongX ? fixed : center,
      alongX ? len : width,
      alongX ? width : len,
      y,
      0.04
    )
  );
  paintWalkEdges(
    { x: alongX ? center : fixed, z: alongX ? fixed : center, w: 0, d: 0, alongX, len },
    width,
    yPaint,
    b
  );
  return { center, len };
}

/** ตีทางม้าลายพาดขวางทางเดิน ณ ช่วงหนึ่งบนแกนที่ทางเดินวิ่ง */
export function crossingStripes(
  axis: "x" | "z",
  from: number,
  to: number,
  fixed: number,
  width: number,
  yPaint: number,
  b: Buckets
) {
  const span = Math.abs(to - from);
  if (span <= 0) return;
  const alongX = axis === "x";
  const stripes = Math.max(3, Math.round(span / 1.1));
  for (let i = 0; i < stripes; i += 1) {
    const t = Math.min(from, to) + (span * (i + 0.5)) / stripes;
    const stripeLen = (span / stripes) * 0.55;
    b.zebra.push(
      alongX
        ? slabGeometry(t, fixed, stripeLen, width * 0.86, yPaint, 0.015)
        : slabGeometry(fixed, t, width * 0.86, stripeLen, yPaint, 0.015)
    );
  }
}

/**
 * จำนวนชั้นของอาคารสำนักงาน — "สุ่ม" แบบคงที่ (deterministic)
 *
 * ใช้แฮชจากลำดับอาคาร ไม่ใช่ `Math.random()` โดยเจตนา: ฉากนี้ต้องออกมา
 * เหมือนเดิมทุกครั้งที่เปิด (กฎเดียวกับที่ `plantLayout.ts` ยืนยันไว้ว่า
 * pure/deterministic) ถ้าสุ่มจริง อาคารจะเปลี่ยนความสูงทุกครั้งที่รีเฟรช และ
 * ทุกครั้งที่ React re-render ผังใหม่ ซึ่งอ่านเป็นบั๊กมากกว่าเป็นความหลากหลาย
 *
 * ผลลัพธ์ยังกระจาย 3-6 ชั้นไม่ซ้ำแบบกันตามที่ต้องการ
 */
export function officeFloors(index: number): number {
  const h = Math.sin(index * 12.9898) * 43758.5453;
  return 3 + Math.floor(Math.abs(h - Math.floor(h)) * 4);
}
