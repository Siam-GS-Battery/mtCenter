import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PlacedMachine, PlantLayout } from "../../../../lib/plantLayout";
import { RACKING } from "./palette";
import {
  WH_EDGE_MARGIN as EDGE_MARGIN,
  WH_BAY_WIDTH as BAY_WIDTH,
  WH_CROSS_AISLE_WIDTH as CROSS_AISLE_WIDTH,
  WH_MACHINE_CLEARANCE as MACHINE_CLEARANCE,
  computeWhZoneAxes,
  computeWhTwoBlockSplit,
} from "./warehouseRackingLayout";

/**
 * ===========================================================================
 * WAREHOUSE RACKING — ชั้นวางพาเลทในโซน WH / FRG-A / FRG-B / HT-2..4 (roadmap step 8)
 * ===========================================================================
 *
 * โซนเหล่านี้เดิมเป็นแค่แผ่นพื้นเปล่า (`PlantShell.tsx`'s `zone` slab) — ไฟล์
 * นี้เพิ่ม "ชั้นวางพาเลท" 3 มิติทับลงไปเพื่อให้อ่านเป็นคลังสินค้าจริง: เสาโครง
 * (upright) + คานราง (beam) หลายระดับ + พาเลท/สินค้าบางช่อง (ไม่ใช่ทุกช่อง —
 * คลังเต็มทุกช่องดูปลอม)
 *
 * โซนที่เติม (`RACK_ZONE_CONFIGS` ด้านล่าง) — `WH` มีเครื่องจักรจริงอยู่แล้ว
 * (section TOOLING/PACKING) ส่วน `FRG-A`/`FRG-B`/`HT-2`/`HT-3`/`HT-4` คือ 5
 * โซนที่ผู้ใช้ชี้ว่าเป็น "ช่องว่างเปล่า" ทั่วผังเครื่องจักร ขอเติมให้เต็มพื้นที่
 * (วัดจริงแล้ว: ไม่มี DB section ใดแม็ปมาลง `FRG-A`/`FRG-B` เลย และมีแค่
 * `HT-1` ในกลุ่ม `HT-1..4` ที่ได้เครื่องจักรจาก DB จริง — ทั้ง 5 โซนนี้จึงว่าง
 * สนิทเสมอในผังปัจจุบัน แต่แต่ละโซน (ยกเว้น `WH`) ยังคงเช็คทั้ง
 * `config.requireEmptyZone` เทียบ `layout.scale.emptyZones` แบบ data-driven
 * และเช็คชนเครื่องจักรรายชิ้นเผื่อ DB เปลี่ยนในอนาคต) ทั้ง 5 โซนนี้ยังมี
 * "ท่อลมอัด" (air header, ดู `siteUtilities.ts`'s `buildAirHeaderRun`) วิ่งผ่าน
 * กึ่งกลางแนวแถวของตัวเองที่ Y=7.2 ม. พร้อม drop-leg หย่อนลงมา — ผังชั้นวางของ
 * ทั้ง 5 โซนนี้จึงบังคับให้มีช่องทางเดินว่าง (aisle) พาดผ่านจุดกึ่งกลางโซนพอดี
 * (ดูคอมเมนต์ `hasOverheadHeader` ด้านล่าง) กันไม่ให้ท่อ/ขาท่อทะลุชั้นวาง
 *
 * ที่มาของตำแหน่ง — ทุกอย่างอ่านจาก `layout.site.zones` จริง ไม่มีพิกัด
 * สัมบูรณ์คงที่ในไฟล์นี้เลย (`plantLayout.ts`'s zone rect เป็นค่าคงที่โดย
 * บังเอิญในผังปัจจุบันเพราะ `FRG-A`/`FRG-B`/`HT-2..4` ยังว่างเสมอ — ไฟล์นี้ไม่
 * พึ่งพาข้อเท็จจริงนั้นเลย อ่านแค่ zone rect ที่ได้จริง ณ ตอนนั้น)
 *
 * ทิศทางแถว — เลือกแกนที่ยาวกว่าของ zone (`w` หรือ `d`) เป็นแกน "ช่อง" (bay
 * axis, แถวชั้นวางยาวไปตามแกนนี้) แกนที่สั้นกว่าเป็นแกน "แถว" (row axis, ระยะ
 * ที่ชั้นวางเรียงต่อกันเป็นแถว ๆ คั่นด้วยทางเดินฟอร์คลิฟท์) — เพื่อให้บรรจุแถว
 * ได้มากที่สุดเท่าที่ zone จริงจะรับได้ ไม่ว่า zone จะกว้างหรือลึกกว่า
 *
 * ระยะจริง (เมตร) — ตามสเปก
 * ------------------------
 *   - เสาโครง (upright) ลึก 1.1 ม. (สองต้นหน้า-หลังต่อช่วงเสา)
 *   - ช่วงชั้น (bay) กว้าง 2.7 ม.
 *   - คานราง (beam) 4 ระดับ ห่างกันชั้นละ 1.5 ม. รวมสูง 6 ม.
 *   - ทางเดินฟอร์คลิฟท์ระหว่างคู่แถว (back-to-back) กว้าง 3.5 ม.
 *   - ทางเดินขวาง (cross-aisle) แบ่งช่วงชั้นเป็นสองบล็อกตามแกนช่อง กว้าง 3.5 ม.
 *     เช่นกัน — กันไม่ให้ทั้งแถวเป็นบล็อกทึบตันข้ามไม่ได้เลย
 *
 * การชนกับเครื่องจักร
 * -------------------
 * `plantLayout.ts` แพ็คเครื่องจักรบางกลุ่ม (section TOOLING/PACKING) ลงโซน
 * `WH` เองด้วย ก่อนวางชิ้นส่วนใดของชั้นวาง จะทดสอบชนกับกล่องขอบเขตจริงของ
 * เครื่องจักรทุกตัวที่อยู่ใกล้โซนนี้ (แนวทางเดียวกับ `FloorMarkings.tsx`'s
 * `machineHalfExtents`/`machinesNearZone`/`collidesWithMachine` — คัดลอกตรรกะ
 * มาไว้ในไฟล์นี้เอง เพราะฟังก์ชันต้นทางเป็น private ของไฟล์นั้นและห้ามแก้ไฟล์
 * นั้น) ช่วงชั้นที่ชนถูกข้ามไปทั้งช่วง (ไม่วางคาน/พาเลท) — และเสาโครง **แต่ละ
 * ต้น** ก็ทดสอบชนที่ตำแหน่งของตัวเองด้วยเช่นกัน (กล่องเล็กเท่าหน้าตัดเสา
 * จริง, `UPRIGHT_SIZE` x `UPRIGHT_SIZE`) ก่อนวาง ไม่ใช่แค่ปล่อยผ่านเพราะเสา
 * บาง — เสาสูง 6 ม. ที่ทะลุตัวเครื่องจักรเป็นข้อบกพร่องที่เห็นชัดที่สุดในฉาก
 * ถ้าไม่ตรวจจริง ต้นเสาที่ขอบของช่วงชั้นที่ถูกข้ามอาจยังยืนทะลุเครื่องอยู่ก็ได้
 *
 * ระดับความสูง (y) — อ่านจาก y-stack เดิมก่อนเลือกค่า
 * ---------------------------------------------------------------------
 * พื้นผิวที่มีอยู่เดิมเรียงจากต่ำไปสูง: `PlantShell.tsx`'s zone platform top
 * (0.29) → zone-edge stripe top (0.35) → พื้นทาสี (ลานพาเลท/`Y_ZONE_MARK`)
 * ที่ยอดสูงสุด ≈0.39 (`FloorMarkings.tsx`'s `Y_ZONE_MARK = 0.37` บวกความหนา
 * ลานพาเลท ~0.02) `FloorActivity.tsx` เองก็ใช้ 0.45 ด้วยเหตุผลเดียวกัน — โค้ด
 * เบสนี้เคยโดนวางที่ 0.40 (เผื่อแค่ 0.01 ม. เหนือ 0.39) ซึ่งบางเกินไปตาม
 * มาตรฐานของโปรเจกต์ที่กำหนดไว้หลังเจอบั๊ก "วางชิดพื้นผิวอื่นพอดี/แทบพอดี"
 * มาแล้ว 4 ครั้ง (ต้องเผื่อ ≥0.05 ม. เสมอ) จึงยกฐานชั้นวางในไฟล์นี้ขึ้นเป็น
 * `BASE_Y = 0.45` — เผื่อระยะจริง 0.06 ม. เหนือพื้นทาสีที่สูงสุด (0.39), 0.10
 * ม. เหนือ zone-edge stripe (0.35), และ 0.16 ม. เหนือ zone platform top (0.29)
 * ไม่ชนกับพื้นผิวใดในสแตกเดิมเลย — ยอดชั้นวาง (`BASE_Y + RACK_HEIGHT` =
 * 0.45+6 = 6.45 ม.) ยังเหลือระยะห่างจากท่อลมอัด (header centerline 7.2 ม. ลบ
 * รัศมีท่อ 0.14 ม. = ท้องท่อ ≈7.06 ม.) อยู่ 0.61 ม. — แคบลงจาก 0.66 ม. เดิม
 * ตามที่ BASE_Y สูงขึ้น 0.05 ม. แต่ยังห่างเหลือเฟือ ไม่ชนแน่นอน (ดูโซนที่มี
 * `hasOverheadHeader` — ชั้นวางไม่ได้อยู่ตรงกึ่งกลางที่ท่อวิ่งผ่านอยู่แล้วตาม
 * การ์ดในส่วนถัดไป จุดนี้เป็นแค่การเผื่อ worst-case เชิงตัวเลขเท่านั้น)
 *
 * การเรนเดอร์ — ต้อง instance เท่านั้น
 * -------------------------------------
 * ชั้นวางเป็นของซ้ำมหาศาล (เสา/คาน/พาเลทนับพันชิ้นได้ง่าย ๆ) จึงทำ `InstancedMesh`
 * ก้อนเดียวต่อ "ชนิด+ขนาดกล่อง" แชร์ geometry/material กันทุก instance เหมือน
 * แพทเทิร์นของ `MachineInstances.tsx` — เสาโครงทุกโซนขนาดเดียวกันเสมอ (1 ก้อน)
 * ส่วนคาน/พาเลทมีแค่ 2 ขนาดที่เป็นไปได้ทั้งไฟล์ (ขึ้นกับ `alongX` ของโซนนั้น
 * เท่านั้น ไม่ขึ้นกับขนาดโซน — ดู `buildAllRackingPlans`) จึงรวมโซนที่ `alongX`
 * เดียวกันเข้าก้อนเดียวกันได้ — **สูงสุด 5 draw call** (1 เสา + ≤2 คาน + ≤2
 * พาเลท ขึ้นกับว่ามีกี่กลุ่ม `alongX` ที่ไม่ว่างจริง; `RackInstances` คืน `null`
 * ทิ้งก้อนที่ไม่มี instance เลย เช่นถ้าทุกช่วงชั้นชนเครื่องจักรจนไม่มีคาน/พาเลท
 * เหลือ) ไม่ว่าจะมีชั้นวางกี่ร้อยช่วงชั้นในกี่โซนก็ตาม ไม่ใช่ mesh ต่อกล่อง
 *
 * เป็นฉากประกอบ ไม่ใช่ของที่คลิกได้ — ปิด `raycast` ทั้งสามก้อนเหมือนของ
 * ตกแต่งอื่นในฉากนี้ (`FloorMarkings.tsx`, contact shadow ใน
 * `MachineInstances.tsx`)
 */

/** ความลึกของเสาโครงหนึ่งต้น/ชั้นวางหนึ่งแถว (เมตร) */
const RACK_DEPTH = 1.1;
/** ช่องว่างเล็กน้อยระหว่างหลังชั้นวางคู่ back-to-back (เมตร) */
const BACK_TO_BACK_GAP = 0.2;
/** ทางเดินฟอร์คลิฟท์ระหว่างคู่แถว back-to-back (เมตร) — `EDGE_MARGIN`/
 *  `BAY_WIDTH`/`CROSS_AISLE_WIDTH`/`MACHINE_CLEARANCE` ย้ายไป
 *  `./warehouseRackingLayout.ts` แล้ว (ใช้ร่วมกับ `Forklifts.tsx`) */
const AISLE_WIDTH = 3.5;
/** ความสูงรวมของชั้นวาง (เมตร) */
const RACK_HEIGHT = 6;
/** ระดับคานราง 4 ชั้น ห่างกันชั้นละ 1.5 ม. (เมตร, จากฐาน) */
const LEVELS_Y = [1.5, 3, 4.5, 6];
/** ระดับที่วางพาเลทได้ — พื้นชั้นล่างสุด + สามชั้นคานถัดไป (เว้นชั้นบนสุดว่าง
 *  ไว้เป็น reserve เหมือนคลังจริง) */
const PALLET_TIER_Y = [0, 1.5, 3, 4.5];
/** ขนาดหน้าตัดเสาโครง (เมตร) */
const UPRIGHT_SIZE = 0.12;
/** ความหนาคานราง (เมตร) */
const BEAM_THICKNESS = 0.1;
/** ความลึกของคานรางหนึ่งเส้น (หน้า/หลัง) (เมตร) */
const RAIL_DEPTH = 0.1;
const PALLET_W_FRAC = 0.72;
const PALLET_D_FRAC = 0.78;
/** ความสูงพาเลท+สินค้ากอง (เมตร) */
const PALLET_H = 1.05;

/** ฐานชั้นวาง — ดูคอมเมนต์หัวไฟล์ "ระดับความสูง (y)" (เผื่อ ≥0.05 ม. เหนือทุก
 *  พื้นผิวเดิม ตามมาตรฐานของโปรเจกต์หลังบั๊ก "วางชิดพอดี" 4 ครั้ง) */
const BASE_Y = 0.45;

/** สัดส่วนช่วงชั้น+ระดับที่ "มีพาเลทวางอยู่" (ค่าเริ่มต้น/ของ `WH`) — ไม่ใช่ทุก
 *  ช่องเพื่อให้ดูสมจริง แต่ละโซนใน `RACK_ZONE_CONFIGS` แปรค่านี้ต่างกันแบบ
 *  deterministic (ไม่ใช่ `Math.random()`) กันไม่ให้ทุกโซนดูเหมือนก็อปวางซ้ำ */
const PALLET_OCCUPANCY = 0.45;
const PALLET_HASH_SEED = 4231;

/** ค่าคงที่ต่อโซนที่เติมชั้นวาง — เพิ่มโซนใหม่ในนี้แทนการเขียนฟังก์ชันซ้ำ */
interface RackZoneConfig {
  /** id ของ `layout.site.zones` ที่จะเติมชั้นวาง */
  id: string;
  /** true = มีท่อลมอัด (air header) พาดผ่านกึ่งกลางแนวแถวของโซนนี้จริง
   *  (`FRG-A`/`FRG-B`/`HT-1..4` ทุกตัว — ดู `siteUtilities.ts`'s
   *  `buildAirHeaderRun`, เรียกครั้งเดียวต่อแถวคลุมทั้งแถว) — เมื่อ true จะ
   *  บังคับให้สูตรแบ่งบล็อก/แถวของโซนนั้น "ต้องมี" ทางเดินว่างพาดผ่านจุด
   *  กึ่งกลางโซนพอดี (คืน `null` แทนถ้าใส่ไม่ได้จริง ไม่ใช่ปล่อยให้ชั้นวางทึบ
   *  ตันชนท่อ) — ดูคอมเมนต์ `buildZoneRackingPlan` ส่วนแบ่งบล็อก/แถว */
  hasOverheadHeader: boolean;
  /** สัดส่วนช่องที่มีพาเลท (`PALLET_OCCUPANCY` ของโซนนี้) */
  occupancy: number;
  /** เกลือของ hash พาเลท กันไม่ให้ผังพาเลทของแต่ละโซนซ้ำแพทเทิร์นเดียวกัน */
  seedSalt: number;
  /** true = ก่อนสร้างผังชั้นวาง ต้องเช็คก่อนว่า `layout.scale.emptyZones` (ผล
   *  ข้อเท็จจริงจริงจาก `plantLayout.ts`'s `buildPlantLayout`, ไม่ใช่ค่าคงที่
   *  ที่นี่) ยืนยันว่าโซนนี้ "ว่างเปล่าจริง ณ ตอนนี้" (ไม่มี DB section ใดแม็ป
   *  มาลงโซนนี้เลย) ก่อน — ถ้าไม่ยืนยันคืน `null` ทิ้งชั้นวางทั้งโซนไปเลย แทน
   *  ที่จะปล่อยให้วางแล้วพึ่งพาแค่ `collidesWithMachine` รายชิ้นช่วย (ชั้นวาง
   *  ที่โดนข้ามเกือบทุกช่วงเพราะชนเครื่องจักรเกือบทั้งโซนจะดูเป็นบั๊กเชิงภาพ
   *  ไม่ใช่คลังที่ตั้งใจเว้นบางช่อง) — ใช้ `false` เฉพาะ `WH` ที่ตั้งใจเติม
   *  ชั้นวางทับพื้นที่ที่มีเครื่องจักรจริงอยู่แล้วโดยดีไซน์ (ดูคอมเมนต์ต่อจาก
   *  รายการ config ด้านล่าง) */
  requireEmptyZone: boolean;
}

/**
 * `WH` มีเครื่องจักรจริงอยู่แล้วและไม่มีท่อลมอัดพาดผ่าน — พฤติกรรมเดิมไม่
 * เปลี่ยน (`requireEmptyZone: false` เพราะการเติมชั้นวางทับพื้นที่ที่มี
 * เครื่องจักรอยู่แล้วเป็นดีไซน์ที่ตั้งใจของโซนนี้ ไม่ใช่ข้อผิดพลาด)
 *
 * `FRG-A`/`FRG-B`/`HT-2`/`HT-3`/`HT-4` คือ 5 โซนที่ `plantLayout.ts` ยืนยันว่า
 * "ไม่มี DB section ใดแม็ปมาลงเลย" เสมอ (ดู `buildPlantLayout`'s
 * `zoneKindForSection`: ไม่มี section ไหนแม็ปเป็น `forging`, และมีแค่ section
 * `HT` เท่านั้นที่แม็ปเป็น `heat` แล้วก็ไปลงที่ `HT-1` เพียงโซนเดียว) — คือ
 * "ช่องว่างเปล่า" ทั้งหมดฝั่งขวาของผังเครื่องจักรที่ผู้ใช้ชี้ในภาพ ขอเติมชั้น
 * วางให้เต็มพื้นที่ทั้ง 5 โซนนี้ (ไม่รวม `HT-1` เพราะโซนนั้นอาจมีเครื่องจักร
 * จริงจาก DB อยู่แล้ว — `requireEmptyZone: true` เช็คซ้ำแบบ data-driven ทุก
 * โซนในกลุ่มนี้ผ่าน `layout.scale.emptyZones` ก่อนวางเสมอ ไม่ใช่หวังพึ่งแค่
 * ข้อเท็จจริงวันนี้ที่ hardcode ไว้ตรงนี้ — ถ้าในอนาคตมีเครื่องจักรใหม่ถูก
 * แม็ปมาลงโซนใดโซนหนึ่งในกลุ่มนี้ ชั้นวางทั้งโซนนั้นจะหายไปเองโดยอัตโนมัติ
 * แทนที่จะทะลุเครื่องจักร) — สัดส่วนพาเลทตั้งใจให้ต่างกันในแต่ละโซน (โกดังของ
 * แยกที่มักไม่เต็มเท่ากัน ไม่ใช่บังเอิญเท่ากับ WH) เพื่อไม่ให้ทุกโซนดูก็อปวาง
 * ซ้ำกันเป๊ะ
 */
export const RACK_ZONE_CONFIGS: RackZoneConfig[] = [
  { id: "WH", hasOverheadHeader: false, occupancy: PALLET_OCCUPANCY, seedSalt: 0, requireEmptyZone: false },
  { id: "FRG-A", hasOverheadHeader: true, occupancy: 0.5, seedSalt: 2609, requireEmptyZone: true },
  { id: "FRG-B", hasOverheadHeader: true, occupancy: 0.3, seedSalt: 5171, requireEmptyZone: true },
  { id: "HT-2", hasOverheadHeader: true, occupancy: 0.4, seedSalt: 6473, requireEmptyZone: true },
  { id: "HT-3", hasOverheadHeader: true, occupancy: 0.55, seedSalt: 7411, requireEmptyZone: true },
  { id: "HT-4", hasOverheadHeader: true, occupancy: 0.62, seedSalt: 8317, requireEmptyZone: true },
];

/** ชุด id ของทุกโซนที่มีชั้นวางพาเลทจริง (จาก `RACK_ZONE_CONFIGS`) — ให้ไฟล์
 *  อื่น (เช่น `FloorMarkings.tsx`'s painted pallet-staging bays) เช็คแล้ว
 *  "ยกเว้น" โซนกลุ่มนี้ได้จากแหล่งความจริงเดียวกัน แทนที่จะ hardcode id ซ้ำ
 *  ไว้อีกที่ — กันไม่ให้สองรายการนี้ไหลตามกันไม่ทัน (drift) เมื่อมีการเพิ่ม/
 *  ลดโซนที่เติมชั้นวางในอนาคต */
export const RACKED_ZONE_IDS: ReadonlySet<string> = new Set(RACK_ZONE_CONFIGS.map((c) => c.id));

/** seed -> [0,1) แบบ deterministic (shader-style sine hash) — เหมือน
 *  `FloorMarkings.tsx`'s `hash01`, ไม่ใช้ `Math.random()` เพื่อให้ตำแหน่ง
 *  พาเลทเหมือนเดิมทุกครั้งที่เปิดฉาก */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** ครึ่งความกว้าง/ลึกของกล่องแนวแกน (AABB) ที่ "ครอบ" เครื่องจักรหนึ่งตัวหลัง
 *  หมุนตาม `rotationY` จริง — เหมือน `FloorMarkings.tsx`'s `machineHalfExtents`
 *  (คัดลอกมาเพราะไฟล์นั้นห้ามแก้และไม่ export ฟังก์ชันนี้) */
function machineHalfExtents(m: PlacedMachine): { extX: number; extZ: number } {
  const cos = Math.abs(Math.cos(m.rotationY));
  const sin = Math.abs(Math.sin(m.rotationY));
  return {
    extX: (m.width / 2) * cos + (m.depth / 2) * sin,
    extZ: (m.width / 2) * sin + (m.depth / 2) * cos,
  };
}

/** กรองเครื่องจักรที่อาจล้ำเข้ามาในโซนนี้จริง ๆ — ทดสอบเชิงพื้นที่ ไม่สนใจ
 *  `zoneId` (เหมือน `FloorMarkings.tsx`'s `machinesNearZone`) */
function machinesNearZone(
  zone: { x: number; z: number; w: number; d: number },
  machines: PlacedMachine[],
  clearance: number
): PlacedMachine[] {
  const halfW = zone.w / 2 + clearance;
  const halfD = zone.d / 2 + clearance;
  return machines.filter((m) => {
    const { extX, extZ } = machineHalfExtents(m);
    return Math.abs(m.x - zone.x) < extX + halfW && Math.abs(m.z - zone.z) < extZ + halfD;
  });
}

/** ทดสอบว่ากล่อง `w`x`d` ที่ (x,z) ทับกับเครื่องจักรตัวใดใน `machines` หรือไม่ */
function collidesWithMachine(
  x: number,
  z: number,
  w: number,
  d: number,
  machines: PlacedMachine[],
  clearance: number
): boolean {
  const halfW = w / 2 + clearance;
  const halfD = d / 2 + clearance;
  for (const m of machines) {
    const { extX, extZ } = machineHalfExtents(m);
    if (Math.abs(x - m.x) < halfW + extX && Math.abs(z - m.z) < halfD + extZ) return true;
  }
  return false;
}

interface Placement {
  x: number;
  y: number;
  z: number;
}

interface RackingPlan {
  uprights: Placement[];
  beams: Placement[];
  pallets: Placement[];
  /** ขนาดจริง (โลก) ของกล่องคานราง/พาเลทหนึ่งชิ้น — คงที่ทั้งไฟล์ (ไม่มีการ
   *  หมุน instance ใด ๆ เลย ทิศทางถูกอบลงในขนาดกล่องตั้งแต่ตอนสร้าง plan) */
  beamW: number;
  beamD: number;
  palletW: number;
  palletD: number;
}

/**
 * ประกอบแผนตำแหน่งชั้นวางทั้งหมดในโซนหนึ่งโซน (`config.id`, ดู
 * `RACK_ZONE_CONFIGS`) — ฟังก์ชันบริสุทธิ์ (ไม่ใช่ hook) เหมือนแพทเทิร์น
 * `buildShell`/`buildMarkings` ของไฟล์พี่น้อง คืน `null` เมื่อไม่มีโซนนี้ หรือ
 * โซนเล็กเกินกว่าจะใส่ชั้นวางได้แม้แถวเดียว หรือ (เมื่อ `hasOverheadHeader`)
 * เล็กเกินกว่าจะเว้นทางเดินตรงกึ่งกลางให้ท่อลมอัดได้จริง
 */
function buildZoneRackingPlan(layout: PlantLayout, config: RackZoneConfig): RackingPlan | null {
  const zone = layout.site.zones.find((z) => z.id === config.id);
  if (!zone) return null;
  if (zone.w <= 0 || zone.d <= 0) return null;
  // การ์ด data-driven — ดูคอมเมนต์ `RackZoneConfig.requireEmptyZone`: โซนที่
  // ตั้งค่านี้ไว้ true ต้องได้รับการยืนยันจริงจาก `buildPlantLayout` (ไม่ใช่
  // ข้อสันนิษฐานที่ hardcode ไว้ใน config) ว่าไม่มีเครื่องจักร DB ตัวใดแม็ปมา
  // ลงโซนนี้เลย ก่อนจะเติมชั้นวางทับพื้นที่ทั้งโซน
  if (config.requireEmptyZone && !layout.scale.emptyZones.includes(config.id)) return null;

  // แกนที่ยาวกว่าเป็นแกน "ช่วงชั้น" (bay axis) แกนสั้นกว่าเป็นแกน "แถว" (row
  // axis) — บรรจุแถวได้มากที่สุดเท่าที่ zone จริงจะรับได้ ไม่ว่า zone จะกว้าง
  // หรือลึกกว่า (สูตรใน `./warehouseRackingLayout.ts` ใช้ร่วมกับ `Forklifts.tsx`)
  const axes = computeWhZoneAxes(zone);
  if (!axes) return null;
  const { alongX, usableBay, usableRow } = axes;

  const pairDepth = RACK_DEPTH * 2 + BACK_TO_BACK_GAP;
  const rowPitch = pairDepth + AISLE_WIDTH;
  if (usableRow < pairDepth) return null;
  let rowPairCount = 1 + Math.floor((usableRow - pairDepth) / rowPitch);
  if (rowPairCount < 1) return null;

  // ลองแบ่งเป็น 2 บล็อกคั่นด้วยทางเดินขวางก่อน (กันบล็อกทึบตัน) — ถ้าโซนแคบ
  // เกินไปสำหรับ 2 บล็อก ถอยไปเป็นบล็อกเดียว (fallback บล็อกเดียวนี้ใช้เฉพาะ
  // ไฟล์นี้ — `Forklifts.tsx`'s `computeWhCrossAisle` ต้องมีทางเดินขวางเสมอ
  // จึงหยุดที่ `null` ของ `computeWhTwoBlockSplit` ไปเลยแทน)
  const twoBlockSplit = computeWhTwoBlockSplit(usableBay);
  let blocks = 2;
  let baysPerBlock = twoBlockSplit?.baysPerBlock ?? 0;
  if (!twoBlockSplit) {
    blocks = 1;
    baysPerBlock = Math.floor(usableBay / BAY_WIDTH);
  }
  if (baysPerBlock < 1) return null;

  // --- กันท่อลมอัดพาดชนชั้นวาง (เฉพาะโซนที่ `hasOverheadHeader`) ---
  // `buildAirHeaderRun` (siteUtilities.ts) วางท่อคุมทั้งแถวที่ world Z คงที่ =
  // จุดกึ่งกลาง Z ของแถวโซนนั้น (`rowZCenter`, เท่ากับ `zone.z` เพราะทุกโซนใน
  // แถวเดียวกันมี z เท่ากันในผังปัจจุบัน) เมื่อไม่มีเครื่องจักรใกล้ๆให้เลือก
  // aisle จริง (กรณี FRG-B/HT-4 ที่ยังว่างสนิทเสมอ) — จุดกึ่งกลางโซน (bayLocal
  // = 0, rowLocal = 0) จึงตรงกับตำแหน่งท่อพอดีไม่ว่า zone จะวางแนวไหน:
  //   - `alongX` (row axis อยู่บนแกน Z): ท่อสมมูลกับ rowLocal = 0 — ต้องมี
  //     ทางเดินคู่แถว (`AISLE_WIDTH`) พาดผ่านจุดนั้น ⇒ ต้องมี `rowPairCount`
  //     เป็นเลขคู่ (คู่แถวเรียงสมมาตรรอบ 0 มีช่องว่างตรงกลางพอดีเมื่อคู่เท่านั้น)
  //   - ไม่ `alongX` (bay axis อยู่บนแกน Z): ท่อสมมูลกับ bayLocal = 0 — ต้องมี
  //     ทางเดินขวาง 2 บล็อก (`CROSS_AISLE_WIDTH`) พาดผ่านจุดนั้น ⇒ ต้องแบ่ง
  //     ได้ 2 บล็อกจริง (`blocks === 2`) เท่านั้น ห้าม fallback เป็นบล็อกเดียว
  // ทั้งสองเงื่อนไขนี้บังเอิญเป็นจริงอยู่แล้วกับขนาดจริงของ FRG-B/HT-4 วันนี้
  // (`FRG-B`: rowPairCount=2; `HT-4`: blocks=2) แต่ต้อง "บังคับ" ไว้เป็นโค้ด
  // ไม่ใช่ปล่อยผ่านเพราะบังเอิญพอดี — ถ้าขนาดโซนเปลี่ยนในอนาคตจนเงื่อนไขไม่
  // เป็นจริง ต้องคืน `null` ทิ้งชั้นวางทั้งโซนไปเลย ดีกว่าปล่อยให้ท่อทะลุชั้นวาง
  if (config.hasOverheadHeader) {
    if (alongX) {
      if (rowPairCount % 2 !== 0) rowPairCount -= 1;
      if (rowPairCount < 2) return null;
    } else {
      if (blocks !== 2) return null;
    }
  }

  // --- ตำแหน่งตามแกนแถว (คู่แถว back-to-back, กึ่งกลาง) ---
  const totalRowsSpan = rowPairCount * pairDepth + (rowPairCount - 1) * AISLE_WIDTH;
  const rowStart = -totalRowsSpan / 2 + pairDepth / 2;
  const rowLocals: number[] = [];
  for (let i = 0; i < rowPairCount; i += 1) {
    const pairCenter = rowStart + i * (pairDepth + AISLE_WIDTH);
    rowLocals.push(pairCenter - pairDepth / 2 + RACK_DEPTH / 2);
    rowLocals.push(pairCenter + pairDepth / 2 - RACK_DEPTH / 2);
  }

  // --- ตำแหน่งตามแกนช่วงชั้น (บล็อกของช่วงชั้น, กึ่งกลาง) ---
  const blockUsedWidth = baysPerBlock * BAY_WIDTH;
  const totalBlocksSpan = blocks === 2 ? blockUsedWidth * 2 + CROSS_AISLE_WIDTH : blockUsedWidth;
  const blockAxisStart = -totalBlocksSpan / 2;

  const nearbyMachines = machinesNearZone(zone, layout.machines, MACHINE_CLEARANCE);

  const uprights: Placement[] = [];
  const beams: Placement[] = [];
  const pallets: Placement[] = [];

  const toWorld = (bayLocal: number, rowLocal: number): { x: number; z: number } =>
    alongX ? { x: zone.x + bayLocal, z: zone.z + rowLocal } : { x: zone.x + rowLocal, z: zone.z + bayLocal };

  let bayGlobalIndex = 0;
  for (let b = 0; b < blocks; b += 1) {
    const blockStart = blockAxisStart + b * (blockUsedWidth + CROSS_AISLE_WIDTH);

    for (let rowIdx = 0; rowIdx < rowLocals.length; rowIdx += 1) {
      const rowLocal = rowLocals[rowIdx];

      // เสาโครงยืนที่ขอบเขตของทุกช่วงชั้น (ต้นหน้า+ต้นหลังต่อขอบ) — แต่ละต้น
      // ต้องผ่านการทดสอบชนที่ตำแหน่งของตัวเอง (`collidesWithMachine`, กล่อง
      // เล็กเท่าหน้าตัดเสาจริง) ก่อนวางเสมอ เสาสูง 6 ม. ที่ทะลุตัวเครื่องจักร
      // เป็นข้อบกพร่องที่เห็นชัดที่สุดในฉาก จะปล่อยผ่านโดยอ้างว่า "บางจนแทบไม่
      // มีโอกาสชน" โดยไม่ตรวจจริงไม่ได้
      for (let k = 0; k <= baysPerBlock; k += 1) {
        const bayLocal = blockStart + k * BAY_WIDTH;
        for (const postSign of [-1, 1]) {
          const postOffset = (RACK_DEPTH / 2 - UPRIGHT_SIZE / 2) * postSign;
          const { x, z } = toWorld(bayLocal, rowLocal + postOffset);
          if (collidesWithMachine(x, z, UPRIGHT_SIZE, UPRIGHT_SIZE, nearbyMachines, MACHINE_CLEARANCE)) continue;
          uprights.push({ x, y: BASE_Y, z });
        }
      }

      for (let k = 0; k < baysPerBlock; k += 1) {
        const bayCenterLocal = blockStart + k * BAY_WIDTH + BAY_WIDTH / 2;
        const { x: bx, z: bz } = toWorld(bayCenterLocal, rowLocal);
        const footprintW = alongX ? BAY_WIDTH : RACK_DEPTH;
        const footprintD = alongX ? RACK_DEPTH : BAY_WIDTH;

        if (collidesWithMachine(bx, bz, footprintW, footprintD, nearbyMachines, MACHINE_CLEARANCE)) {
          bayGlobalIndex += 1;
          continue;
        }

        for (const levelY of LEVELS_Y) {
          for (const railSign of [-1, 1]) {
            const railOffset = (RACK_DEPTH / 2 - RAIL_DEPTH / 2) * railSign;
            const { x, z } = toWorld(bayCenterLocal, rowLocal + railOffset);
            beams.push({ x, y: BASE_Y + levelY, z });
          }
        }

        PALLET_TIER_Y.forEach((tierY, tierIdx) => {
          const seed = PALLET_HASH_SEED + config.seedSalt + bayGlobalIndex * 97 + rowIdx * 13 + tierIdx * 7 + b * 31;
          if (hash01(seed) < config.occupancy) {
            const restY = tierIdx === 0 ? BASE_Y : BASE_Y + tierY + BEAM_THICKNESS / 2;
            pallets.push({ x: bx, y: restY, z: bz });
          }
        });

        bayGlobalIndex += 1;
      }
    }
  }

  if (uprights.length === 0) return null;

  const beamW = alongX ? BAY_WIDTH : RAIL_DEPTH;
  const beamD = alongX ? RAIL_DEPTH : BAY_WIDTH;
  const palletW = (alongX ? BAY_WIDTH : RACK_DEPTH) * PALLET_W_FRAC;
  const palletD = (alongX ? RACK_DEPTH : BAY_WIDTH) * PALLET_D_FRAC;

  return { uprights, beams, pallets, beamW, beamD, palletW, palletD };
}

/** ผลรวมของทุกโซนที่เติมชั้นวาง — เสาโครงทุกโซนขนาดเดียวกันเสมอ
 *  (`UPRIGHT_SIZE`) เลยรวมเป็นก้อนเดียวได้โดยตรง ส่วนคาน/พาเลทมีแค่ 2 ขนาดที่
 *  เป็นไปได้ (ขึ้นกับ `alongX` ของโซนนั้นเท่านั้น ไม่ขึ้นกับขนาดโซน) จึงจัดกลุ่ม
 *  ตาม `alongX` แล้วรวม placements ของโซนที่ `alongX` เดียวกันเข้า `InstancedMesh`
 *  ก้อนเดียวกันได้ — ยังคง "instance เดียวต่อชนิด/ทิศทาง" ไม่ใช่ mesh ต่อโซน */
interface RackingGroup {
  beamW: number;
  beamD: number;
  palletW: number;
  palletD: number;
  beams: Placement[];
  pallets: Placement[];
}

interface AllRackingPlans {
  uprights: Placement[];
  /** สูงสุด 2 กลุ่ม (alongX=true / alongX=false) — ดูคอมเมนต์ข้างบน */
  groups: RackingGroup[];
}

function buildAllRackingPlans(layout: PlantLayout): AllRackingPlans | null {
  const uprights: Placement[] = [];
  const groupByDims = new Map<string, RackingGroup>();

  for (const config of RACK_ZONE_CONFIGS) {
    const plan = buildZoneRackingPlan(layout, config);
    if (!plan) continue;
    uprights.push(...plan.uprights);
    const key = `${plan.beamW}|${plan.beamD}|${plan.palletW}|${plan.palletD}`;
    let group = groupByDims.get(key);
    if (!group) {
      group = { beamW: plan.beamW, beamD: plan.beamD, palletW: plan.palletW, palletD: plan.palletD, beams: [], pallets: [] };
      groupByDims.set(key, group);
    }
    group.beams.push(...plan.beams);
    group.pallets.push(...plan.pallets);
  }

  if (uprights.length === 0) return null;
  return { uprights, groups: Array.from(groupByDims.values()) };
}

const IDENTITY_QUATERNION = new THREE.Quaternion();
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);

/**
 * `InstancedMesh` เดียวสำหรับตำแหน่งชุดหนึ่ง (เสา/คาน/พาเลท) — geometry มี
 * pivot ที่ฐาน (y=0 ท้องถิ่น = พื้นของชิ้นนั้น) ดังนั้น `Placement.y` คือความ
 * สูงจริงของฐานชิ้นนั้นในโลก ไม่ใช่จุดกึ่งกลาง
 */
function RackInstances({
  placements,
  geometry,
  material,
  castShadow,
}: {
  placements: Placement[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  castShadow: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    for (let i = 0; i < placements.length; i += 1) {
      const p = placements[i];
      position.set(p.x, p.y, p.z);
      matrix.compose(position, IDENTITY_QUATERNION, UNIT_SCALE);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);

  if (placements.length === 0) return null;

  return (
    <instancedMesh
      ref={(node: THREE.InstancedMesh | null) => {
        meshRef.current = node;
        // ของตกแต่งฉาก ไม่ใช่ hit target — เหมือน contact shadow ใน
        // `MachineInstances.tsx` และเครื่องหมายพื้นใน `FloorMarkings.tsx`
        if (node) node.raycast = () => null;
      }}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      receiveShadow
    />
  );
}

/**
 * คาน+พาเลทของกลุ่มเดียว (โซนที่ `alongX` เดียวกัน แชร์ขนาดกล่องเดียวกัน) —
 * แยก geometry ตามกลุ่มเพราะขนาดกล่อง (`beamW`/`beamD`/`palletW`/`palletD`)
 * ขึ้นกับ `alongX` เท่านั้น (สูงสุด 2 ค่าที่เป็นไปได้ทั้งไฟล์) วัสดุ (material)
 * ใช้ร่วมกันทุกกลุ่มอยู่แล้วจากพารามิเตอร์ ไม่สร้างซ้ำ
 */
function RackGroupInstances({
  group,
  beamMaterial,
  palletMaterial,
}: {
  group: RackingGroup;
  beamMaterial: THREE.Material;
  palletMaterial: THREE.Material;
}) {
  const beamGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(group.beamW, BEAM_THICKNESS, group.beamD);
    g.translate(0, BEAM_THICKNESS / 2, 0);
    return g;
  }, [group.beamW, group.beamD]);

  const palletGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(group.palletW, PALLET_H, group.palletD);
    g.translate(0, PALLET_H / 2, 0);
    return g;
  }, [group.palletW, group.palletD]);

  useEffect(() => () => beamGeometry.dispose(), [beamGeometry]);
  useEffect(() => () => palletGeometry.dispose(), [palletGeometry]);

  return (
    <group>
      <RackInstances placements={group.beams} geometry={beamGeometry} material={beamMaterial} castShadow />
      <RackInstances placements={group.pallets} geometry={palletGeometry} material={palletMaterial} castShadow />
    </group>
  );
}

export interface WarehouseRackingProps {
  layout: PlantLayout;
}

/**
 * ชั้นวางพาเลทในโซน `WH`/`FRG-A`/`FRG-B`/`HT-2`/`HT-3`/`HT-4` — ดูคอมเมนต์หัว
 * ไฟล์ และ `RACK_ZONE_CONFIGS` สำหรับรายการโซนที่เติม
 */
export function WarehouseRacking({ layout }: WarehouseRackingProps) {
  const plans = useMemo(() => buildAllRackingPlans(layout), [layout]);

  const uprightGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(UPRIGHT_SIZE, RACK_HEIGHT, UPRIGHT_SIZE);
    g.translate(0, RACK_HEIGHT / 2, 0);
    return g;
  }, []);

  const uprightMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: RACKING.upright, roughness: 0.55, metalness: 0.2 }),
    []
  );
  const beamMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: RACKING.beam, roughness: 0.55, metalness: 0.2 }),
    []
  );
  const palletMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: RACKING.pallet, roughness: 0.85, metalness: 0.02 }),
    []
  );

  useEffect(() => () => uprightGeometry.dispose(), [uprightGeometry]);
  useEffect(
    () => () => {
      uprightMaterial.dispose();
      beamMaterial.dispose();
      palletMaterial.dispose();
    },
    [uprightMaterial, beamMaterial, palletMaterial]
  );

  if (!plans) return null;

  return (
    <group>
      <RackInstances placements={plans.uprights} geometry={uprightGeometry} material={uprightMaterial} castShadow />
      {plans.groups.map((group, i) => (
        // key = ดัชนีกลุ่ม (สูงสุด 2 กลุ่ม, ลำดับคงที่ตาม insertion order ของ
        // `buildAllRackingPlans` ในแต่ละ render ของ `layout` เดียวกัน)
        <RackGroupInstances key={i} group={group} beamMaterial={beamMaterial} palletMaterial={palletMaterial} />
      ))}
    </group>
  );
}

export default WarehouseRacking;
