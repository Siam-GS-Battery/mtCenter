import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PlantLayout } from "../../../../lib/plantLayout";
import {
  buildNavGraph,
  routeBetween,
  type NavGraph,
  type NavPoint,
  type NavStrip,
} from "../../../../lib/floorNavGraph";
import { box, pillar, machineHalfExtents } from "./siteShared";
import { INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, ringStrip } from "./indoorLanes";
import { FORKLIFT } from "./palette";
import {
  WH_CROSS_AISLE_WIDTH,
  WH_MACHINE_CLEARANCE,
  computeWhZoneAxes,
  computeWhTwoBlockSplit,
} from "./warehouseRackingLayout";

/**
 * ===========================================================================
 * FORKLIFTS — รถยกวิ่งวนในโรงงาน (roadmap step 13, "make it feel alive")
 * ===========================================================================
 *
 * สิ่งที่ใช้ซ้ำจากโครงสร้างเดิม (ไม่สร้างระบบคู่ขนาน)
 * -----------------------------------------------------
 *   • `lib/floorNavGraph.ts` (`buildNavGraph`/`routeBetween`) — ตัวหาเส้นทาง
 *     เดียวกับที่หุ่นยนต์ตรวจใช้ ไม่แก้ไฟล์นั้นเลย เรียกตรง ๆ ตามสัญญาเดิม
 *   • `./siteShared.ts`'s `box`/`pillar`/`machineHalfExtents` — เรขาคณิตกล่อง/
 *     เสา และสูตร AABB เครื่องจักรหลังหมุน (ใช้เช็คว่าทางเดินขวางในคลังไม่ชน
 *     เครื่องจักรจริง เหมือนที่ `WarehouseRacking.tsx`/`FloorMarkings.tsx` ทำ)
 *   • `./indoorLanes.ts`'s `ringStrip`/`INDOOR_ROAD_OFFSET`/`INDOOR_ROAD_W` —
 *     เรขาคณิต **เลนรถในอาคารจริง** ที่ `SiteEnvironment`/`FloorMarkings` ใช้
 *     วาดถนน+ลูกศรฟอร์คลิฟท์อยู่แล้ว จึงเดินตามเลนที่ "มีอยู่จริงในภาพ" แทนที่
 *     จะประมาณทางเดินเอาเองใหม่
 *
 * สิ่งที่ไม่ใช้ซ้ำ และเหตุผล
 * ---------------------------
 *   • `lib/inspectionAgent.ts` ทั้งไฟล์ผูกกับความหมาย "ตรวจเครื่องจักร" แน่น
 *     เกินกว่าจะยืมได้ตรง ๆ: `step()` เป็น state machine 5 เฟส
 *     (walking/inspecting/reporting/done/idle) ที่มี dwell timer + ประเมินผล
 *     เครื่อง + สร้างรายงานผูกอยู่ในตัว, และ `navStripsFor` (private, ไม่
 *     export) ประมาณทางเดินในโรงด้วย "กากบาทกลางโรง" หยาบ ๆ ซึ่งพอสำหรับคน
 *     เดินตรวจแต่ไม่ใช่เลนรถจริงที่รถยกต้องวิ่งตาม — รถยกจึงต้องมีกราฟทางเดิน
 *     ของตัวเอง (`buildForkliftNavGraph` ด้านล่าง) ที่สร้างจากเลนรถจริง ไม่ใช่
 *     กากบาทประมาณ แต่ยังคงเรียก `buildNavGraph`/`routeBetween` ตัวเดิมเป๊ะ
 *   • การเดินตามเส้นทาง (`advanceVehicle` ด้านล่าง) เป็นสูตรเดียวกับ
 *     `inspectionAgent.ts`'s `advanceAlongLegs` (หันตัวจำกัดอัตรา + เดินตาม
 *     ระยะ dt) แต่ฟังก์ชันนั้น private และปิดทับ closure ตัวแปรของหุ่นยนต์
 *     ตรวจโดยเฉพาะ (x/z/yaw/legs ระดับโมดูล) จึง import ไม่ได้ ต้องเขียนสูตร
 *     เดียวกันใหม่แบบรับพารามิเตอร์เป็น state object ทั่วไป (รองรับวนลูปไม่รู้
 *     จบด้วย ซึ่งหุ่นตรวจไม่ต้องใช้เพราะเดินจบเส้นทางแล้วหยุด)
 *
 * เส้นทางที่วิ่ง
 * --------------
 *   1. วงในอาคาร (2 คัน) — วิ่งตามเลนรถในอาคารจริงรอบขอบโรง (`ringStrip` ที่
 *      `INDOOR_ROAD_OFFSET`=8.4 ม. จากผนัง กว้าง `INDOOR_ROAD_W`=6 ม. จึงอยู่ใน
 *      แถบ 5.4-11.4 ม.จากผนัง) ผ่านหน้าทุกโซนที่เรียงชิดผนัง (WH/FRG-A/FRG-B,
 *      HT-1..4, LINES) — คันหนึ่งวิ่งตามเข็ม อีกคันวิ่งทวนเข็ม (มุมกลับกัน) ให้
 *      ฉากดูมีการจราจรสวนทาง ไม่ใช่ขบวนเดียวกัน
 *   2. วงคลัง-ท่ารับส่งของ (1 คัน) — จากเลนในอาคาร เข้าไปในทางเดินขวางกลาง
 *      ชั้นวางพาเลทของโซน WH จริง (คำนวณจากสูตรเดียวกับ `WarehouseRacking.tsx`'s
 *      `buildRackingPlan`, ดู `computeWhCrossAisle` — คัดลอกค่าคงที่ผังชั้นวาง
 *      มาเพราะไฟล์นั้นห้ามแก้และไม่ export ค่าเหล่านี้ เหมือนที่ไฟล์นั้นเองก็
 *      คัดลอก `machineHalfExtents` มาจาก `FloorMarkings.tsx` ด้วยเหตุผลเดียวกัน)
 *      แล้ววิ่งต่อออกไปยังถนนบริการนอกอาคารฝั่งเดียวกับ WH (ประมาณตำแหน่งท่า
 *      รับส่งของ — ดูคอมเมนต์ที่ `computeDockTarget`) แล้ววิ่งกลับสลับไป-มา
 *      (ไม่วนเป็นวง) บรรทุกพาเลทขาออก (อาคาร -> ท่า) ว่างเปล่าขากลับ
 *
 * ความปลอดภัยของเส้นทาง (เช็คจริง ไม่ใช่แค่กะ)
 * ---------------------------------------------
 *   • เลนในอาคารอยู่ในแถบ 5.4-11.4 ม.จากผนัง ซึ่งอยู่ใน "ขอบเขตรอบอาคาร" 15 ม.
 *     ที่ผังบังคับให้โซนร่นเข้ามาเสมอ (`HALL_PERIMETER` ใน `plantLayout.ts`,
 *     ดูคอมเมนต์ที่ `siteShared.ts`'s `INDOOR_WALK_W`/`OUTDOOR_WALK_W` กลุ่ม) —
 *     11.4 < 15 จึงไม่มีทางชนเครื่องจักรได้เลยไม่ว่าผังจริงจะมีเครื่องกี่ตัว
 *     (บังคับโดยโครงสร้างผัง ไม่ใช่แค่ประมาณ)
 *   • ทางเดินขวางในคลัง (`computeWhCrossAisle`) ตรวจชนกับเครื่องจักรจริงทุกตัว
 *     ที่อยู่ใน zoneId "WH" ด้วย `machineHalfExtents` (สูตรเดียวกับที่
 *     `FloorMarkings.tsx`/`WarehouseRacking.tsx` ใช้ตรวจชนอยู่แล้ว) — ถ้าชน
 *     คืน `null` แล้วรถคันที่ 3 จะวิ่งวนรอบในแทน (ไม่วิ่งเข้าคลังเลย) แทนที่จะ
 *     เดาว่า "คงไม่ชนหรอก"
 *   • ท่อลมอัดหลัก (`siteUtilities.ts`'s `buildAirHeaderRun`) พาดเฉพาะเหนือแถว
 *     โซนตีเหล็ก (`forgingZones` — HT-1..4 กลุ่มเดียว) ไม่ใช่ WH และไม่ใช่แถบ
 *     เลนรถรอบขอบโรง จึงไม่มีจุดตัดกับเส้นทางรถยกเลยไม่ว่าจะสูงเท่าไร (เช็คจาก
 *     ซอร์สจริง ไม่ใช่คาดเดา) — เสาไฟฟ้า/มาสต์รถยกจึงไม่ต้องเทียบความสูงกับ
 *     ท่อนี้เลย
 *   • มาสต์รถยกสูง 2.79 ม. (`MAST_HEIGHT` 2.7 + คานบนหนา 0.09) ต่ำกว่าประตูท่า
 *     รับส่งของจริง (`siteLogistics.ts`'s `DOCK_DOOR_H` = 3.4 ม.) อยู่ 0.61 ม.
 *     — ผ่านช่องประตูท่าได้ถ้าเส้นทางบังเอิญพาดผ่านแนวประตู
 *   • เส้นทางในอาคาร<->นอกอาคารต่อกันด้วยสะพานอัตโนมัติของ `buildNavGraph`
 *     (`bridgeComponents`) — จุดต่อนี้ "ตัดผ่านผนัง" โดยไม่รู้จักตำแหน่งประตู
 *     จริง ซึ่งเป็นข้อจำกัดเดิมที่ `floorNavGraph.ts`'s หัวไฟล์ยอมรับไว้แล้ว
 *     (หุ่นยนต์ตรวจเองก็อาศัยกลไกเดียวกันนี้เดินจากจุดตั้งต้นนอกโรงเข้ามาในโรง)
 *     ไม่ใช่ความเสี่ยงใหม่ที่ไฟล์นี้เพิ่ม — สืบทอดพฤติกรรมเดิมของกราฟทางเดิน
 *
 * ประสิทธิภาพ (ตามกฎเดียวกับ `InspectorRobot.tsx`/`CameraRig`)
 * -------------------------------------------------------------
 *   • ไม่มี React state เลย — ตำแหน่ง/มุมของรถทุกคันเป็น mutable object ใน
 *     `useRef` เขียนทับใน `useFrame` แล้วคำนวณ matrix เขียนตรงลง
 *     `InstancedMesh.instanceMatrix` ไม่มีการ re-render จากการขยับรถแม้เฟรม
 *     เดียว (เหมือน `CameraRig`/`SceneAnnotations`/`Minimap` ที่ระบุไว้ในโจทย์)
 *   • ไม่ allocate ต่อเฟรม — Vector3/Quaternion/Euler/Matrix4 สร้างครั้งเดียว
 *     ที่ระดับโมดูล (เหมือน `RING_ROTATION` ใน `InspectorRobot.tsx`) แล้วใช้ซ้ำ
 *     ทุกเฟรมทุกคัน
 *   • ตัวรถทั้งคันปั้นเป็น geometry เดียวต่อกลุ่มวัสดุ (เหลือง/เหล็ก/ยาง) ด้วย
 *     `mergeGeometries` (ตัวเดียวกับที่ `geometryKit.ts`/`WarehouseRacking.tsx`
 *     ใช้ ไม่ใช่ dependency ใหม่ — เป็นส่วนหนึ่งของแพ็กเกจ `three` เอง) แล้วทำ
 *     `InstancedMesh` ก้อนเดียวต่อกลุ่มสำหรับรถทุกคัน — **4 draw call รวม**
 *     (เหลือง/เหล็ก/ยาง/พาเลท) ไม่ว่าจะมีรถกี่คัน (2-4) หรือฉากมีเครื่องจักร
 *     กี่ร้อยตัว
 *   • ตำแหน่งเริ่มต้น/ใครถือพาเลทตอนไหน ใช้แฮชไซน์คงที่ (`hash01`, สูตรเดียว
 *     กับ `WarehouseRacking.tsx`'s ตัวมันเอง — ห้ามแก้/ไม่ export จึงต้อง
 *     คัดลอก) ไม่ใช่ `Math.random()` ฉากจึงเหมือนเดิมทุกครั้งที่เปิด
 *   • `raycast = () => null` ทุก `InstancedMesh` — ไม่บังคลิก/hover เครื่องจักร
 *     หรือพื้นข้างใต้ เหมือนของตกแต่งอื่นทั้งฉาก
 *
 * กรณีขอบ
 * --------
 *   • กราฟทางเดินว่าง (โรงเล็กจนเลนสั้นกว่า `MIN_LENGTH`) — คืน `null` ทั้ง
 *     component ไม่วาดอะไรเลย ไม่ throw
 *   • ไม่มีโซน "WH" หรือหาทางไปท่าไม่ได้ — คันที่ 3 วิ่งวนรอบในแทน (import
 *     `dockPath.length` ไม่พอ = ไม่ crash)
 */

// ---------------------------------------------------------------------------
// ค่าคงที่ — ทางเดิน/เส้นทาง
// ---------------------------------------------------------------------------

const FORKLIFT_COUNT = 3;
/** ความเร็ววิ่งจริง (เมตร/วินาที) — รถยกในโรงงานจริงวิ่งช้ากว่าคนเดินเร็ว */
const FORKLIFT_SPEED = 2.6;
/** ความเร็วหันตัวสูงสุด (เรเดียน/วินาที) — ช้ากว่าหุ่นยนต์ตรวจ (รถยกเลี้ยวอืด) */
const TURN_RATE = 2.6;
const ARRIVE_EPS = 0.15;
const MAX_DT = 0.25;
/** เพดานจำนวนรอบวนต่อเฟรมของ `advanceVehicle` — กัน path ที่มีจุดซ้ำ/ระยะศูนย์
 *  ทำให้ลูปไม่รู้จบ (ป้องกันค้างทั้งเฟรม ไม่ใช่แค่หวังว่าข้อมูลจะสะอาดเสมอ) */
const MAX_STEPS_PER_FRAME = 8;
/** ระยะที่ถือว่า "ไปแล้ว" ตอนต่อ leg เข้าด้วยกัน (กันจุดซ้ำจาก routeBetween ต่อ ๆ กัน) */
const DEDUP_EPS = 0.05;
/** ระยะทางสะสม (เมตร) หนึ่งรอบของการสลับ "ถือพาเลท / ว่าง" ของรถวิ่งวนรอบใน */
const LOOP_CARRY_PERIOD = 70;

// ค่าคงที่ผังชั้นวางพาเลทโซน WH (`WH_EDGE_MARGIN`/`WH_BAY_WIDTH`/
// `WH_CROSS_AISLE_WIDTH`/`WH_MACHINE_CLEARANCE`) และสูตรแบ่งบล็อกชั้นวาง 2
// บล็อกคั่นทางเดินขวาง ย้ายไปอยู่ใน `./warehouseRackingLayout.ts` ให้ไฟล์นี้
// กับ `WarehouseRacking.tsx` import ร่วมกัน (เดิมคัดลอกค่าคงที่/สูตรแยกกันคนละ
// ไฟล์ — ถ้าผังชั้นวางถูกจูนใหม่แล้วลืมแก้ค่าที่คัดลอกไว้ ทางเดินขวางที่คำนวณ
// ได้จะผิดตำแหน่งโดย "ไม่ null" ด้วย ดูรายละเอียดที่หัวไฟล์นั้น)

// ---------------------------------------------------------------------------
// ค่าคงที่ — สัดส่วนตัวรถ (เมตร)
// ---------------------------------------------------------------------------

const BODY_H = 1.0;
const MAST_HEIGHT = 2.7;
const MAST_TOP_BAR_H = 0.09;
/** ความสูงมาสต์รวมคานบน — ใช้เทียบกับความสูงประตูท่ารับส่งของในคอมเมนต์หัวไฟล์ */
export const FORKLIFT_MAST_TOP_Y = MAST_HEIGHT + MAST_TOP_BAR_H;
const CAGE_ROOF_Y = 2.15;

const PALLET_W = 1.0;
const PALLET_H = 0.4;
const PALLET_D = 0.9;
/** ระยะจากศูนย์กลางรถถึงตำแหน่งพาเลทที่ปลายส้อม (แนวหน้ารถ) */
const PALLET_OFFSET = 1.55;
const PALLET_Y = 0.14 + PALLET_H / 2;

// ---------------------------------------------------------------------------
// ตัวช่วยที่คัดลอกมาจากไฟล์พี่น้อง (private ในไฟล์ต้นทาง จึง import ไม่ได้)
// ---------------------------------------------------------------------------

/** seed -> [0,1) แบบ deterministic — สูตรเดียวกับ `WarehouseRacking.tsx`'s `hash01` */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** ผลต่างมุมสองค่าในช่วง -PI..PI — สูตรเดียวกับ `inspectionAgent.ts`'s `shortestAngle` */
function shortestAngle(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ---------------------------------------------------------------------------
// กราฟทางเดินของรถยก
// ---------------------------------------------------------------------------

interface WhCrossAisle {
  strip: NavStrip;
  stop: NavPoint;
}

/**
 * ทางเดินขวางกลางชั้นวางพาเลทของโซน WH จริง — คำนวณด้วยสูตรเดียวกับ
 * `WarehouseRacking.tsx`'s `buildRackingPlan` (เฉพาะส่วนที่กำหนดตำแหน่งทางเดิน
 * ขวาง ไม่จำลองเสา/คาน/พาเลททั้งผังซ้ำ) แล้วตรวจชนกับเครื่องจักรจริงในโซนนี้
 * ด้วย `machineHalfExtents` — `buildRackingPlan` เองตรวจชนแค่ตอน "จะวางเสา/
 * คาน" ไม่ได้รับประกันว่าทางเดินขวางว่างจริง จึงต้องเช็คแยกตรงนี้ ไม่ใช่เชื่อ
 * ว่า "คงว่างอยู่แล้ว"
 *
 * คืน `null` เมื่อไม่มีโซน WH, โซนเล็กเกินกว่าจะแบ่งเป็น 2 บล็อกได้ (ผังชั้นวาง
 * บล็อกเดียวไม่มีทางเดินขวางให้วิ่ง), หรือทางเดินขวางที่คำนวณได้ไปชนเครื่องจักร
 * จริงเข้า — ทุกกรณีนี้ผู้เรียกจะไม่พารถยกเข้าไปในคลังเลย (ปลอดภัยกว่าเดา)
 */
function computeWhCrossAisle(layout: PlantLayout): WhCrossAisle | null {
  const zone = layout.site.zones.find((z) => z.id === "WH");
  if (!zone || zone.w <= 0 || zone.d <= 0) return null;

  const axes = computeWhZoneAxes(zone);
  if (!axes) return null;
  const { alongX, usableBay, usableRow } = axes;

  const split = computeWhTwoBlockSplit(usableBay);
  if (!split) return null; // ผังบล็อกเดียว — ไม่มีทางเดินขวางให้ใช้
  const { crossAisleBayLocal } = split;

  const stripX = alongX ? zone.x + crossAisleBayLocal : zone.x;
  const stripZ = alongX ? zone.z : zone.z + crossAisleBayLocal;
  const stripWidth = alongX ? WH_CROSS_AISLE_WIDTH : usableRow;
  const stripDepth = alongX ? usableRow : WH_CROSS_AISLE_WIDTH;
  const horizontal = !alongX;

  const halfW = stripWidth / 2 + WH_MACHINE_CLEARANCE;
  const halfD = stripDepth / 2 + WH_MACHINE_CLEARANCE;
  for (const m of layout.machines) {
    if (m.zoneId !== "WH") continue;
    const { extX, extZ } = machineHalfExtents(m);
    if (Math.abs(m.x - stripX) < halfW + extX && Math.abs(m.z - stripZ) < halfD + extZ) {
      return null;
    }
  }

  return {
    strip: { x: stripX, z: stripZ, width: stripWidth, depth: stripDepth, horizontal },
    stop: { x: stripX, z: stripZ },
  };
}

/** แปลง `layout.site.roads` (ถนนบริการรอบไซต์) เป็น `NavStrip[]` — โค้ดเดียวกับ
 *  ที่ `inspectionAgent.ts`'s (private) `navStripsFor` ใช้กับ `site.roads` */
function outdoorRoadStrips(layout: PlantLayout): NavStrip[] {
  return layout.site.roads.map((road) =>
    road.dir === "x"
      ? { x: road.x, z: road.z, width: road.len, depth: road.w, horizontal: true }
      : { x: road.x, z: road.z, width: road.w, depth: road.len, horizontal: false }
  );
}

interface ForkliftNavData {
  graph: NavGraph;
  crossAisle: WhCrossAisle | null;
}

/**
 * กราฟทางเดินของรถยก — ใช้เลนรถในอาคารจริง (`ringStrip`) + ถนนบริการรอบไซต์
 * จริง (`site.roads`) + ทางเดินขวางกลางคลัง (ถ้าว่างจากเครื่องจักรจริง) แล้ว
 * ส่งเข้า `buildNavGraph` ตัวเดียวกับที่หุ่นยนต์ตรวจใช้ — ไม่ใช่กราฟคู่ขนาน
 * ใหม่ทั้งระบบ แค่ "แถบทางเดิน" ที่ป้อนเข้าไปต่างชุดกัน (เลนรถจริง แทนกากบาท
 * ประมาณของหุ่นยนต์ตรวจ) ดูคอมเมนต์หัวไฟล์หัวข้อ "สิ่งที่ไม่ใช้ซ้ำ"
 */
function buildForkliftNavData(layout: PlantLayout): ForkliftNavData {
  const crossAisle = computeWhCrossAisle(layout);
  const strips: NavStrip[] = [];

  for (const r of ringStrip(layout.hall.w, layout.hall.d, INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, true)) {
    strips.push({ x: r.x, z: r.z, width: r.w, depth: r.d, horizontal: r.alongX });
  }
  strips.push(...outdoorRoadStrips(layout));
  if (crossAisle) strips.push(crossAisle.strip);

  return { graph: buildNavGraph(strips), crossAisle };
}

/** ต่อ waypoint ของหลายช่วง (`routeBetween` ทีละคู่จุด) เป็นเส้นเดียว ตัด
 *  จุดซ้ำที่ใกล้กันเกินไประหว่างรอยต่อ (`routeBetween` แต่ละครั้งอาจคืนจุด
 *  ปลายที่ใกล้เคียงจุดเริ่มของช่วงถัดไป) */
function concatWaypoints(graph: NavGraph, stops: NavPoint[]): NavPoint[] {
  const pts: NavPoint[] = [];
  let prev = stops[0];
  pts.push(prev);
  for (let i = 1; i < stops.length; i++) {
    const seg = routeBetween(graph, prev, stops[i]);
    for (const p of seg) {
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(last.x - p.x, last.z - p.z) > DEDUP_EPS) pts.push(p);
    }
    prev = stops[i];
  }
  return pts;
}

/** ต่อจุดแวะเป็น "วงปิด" — จุดสุดท้ายวนกลับไปจุดแรกด้วย (สำหรับรถวิ่งวนรอบใน) */
function buildClosedLoop(graph: NavGraph, stops: NavPoint[]): NavPoint[] {
  if (stops.length < 2) return [];
  return concatWaypoints(graph, [...stops, stops[0]]);
}

interface VehiclePlan {
  path: NavPoint[];
  /** true = วนกลับจุดแรกไม่รู้จบ, false = วิ่งสลับไป-กลับ (ping-pong) */
  loop: boolean;
  seed: number;
}

/**
 * กำหนดเส้นทางของรถยกแต่ละคัน — ดูคอมเมนต์หัวไฟล์หัวข้อ "เส้นทางที่วิ่ง"
 *
 * คืนได้ 0-3 แผน (สั้นกว่า `FORKLIFT_COUNT` เมื่อผังว่าง/หาทางไม่ได้) —
 * ผู้เรียกซ่อน instance ที่เหลือแทนการวางไว้ที่จุดกำเนิด
 */
function buildVehiclePlans(nav: ForkliftNavData, layout: PlantLayout): VehiclePlan[] {
  const { graph, crossAisle } = nav;
  if (graph.nodes.length === 0) return [];

  const { w, d } = layout.hall;
  const halfX = w / 2 - INDOOR_ROAD_OFFSET;
  const halfZ = d / 2 - INDOOR_ROAD_OFFSET;
  const rawCorners: NavPoint[] = [
    { x: -halfX, z: -halfZ },
    { x: halfX, z: -halfZ },
    { x: halfX, z: halfZ },
    { x: -halfX, z: halfZ },
  ];
  const corners = rawCorners.map((c) => {
    const idx = graph.nearest(c.x, c.z);
    return idx >= 0 ? graph.nodes[idx] : c;
  });

  const plans: VehiclePlan[] = [];

  const loopA = buildClosedLoop(graph, corners);
  if (loopA.length >= 2) plans.push({ path: loopA, loop: true, seed: 11 });

  const loopB = buildClosedLoop(graph, [...corners].reverse());
  if (loopB.length >= 2) plans.push({ path: loopB, loop: true, seed: 47 });

  const whZone = layout.site.zones.find((z) => z.id === "WH") ?? null;
  let dockPath: NavPoint[] = [];
  if (whZone) {
    // ท่ารับส่งของอยู่ที่ผนังฝั่งใต้ (-Z) เสมอ ไม่ขึ้นกับ z จริงของโซน WH เลย —
    // `siteLogistics.ts`'s `buildLoadingDock` ปัก `wallZ = -hallD / 2` ตรงๆ
    // และ `PlantShell.tsx` เจาะช่องผนังไว้ที่ผนังฝั่งใต้เท่านั้นเช่นกัน (ดู
    // คอมเมนต์ที่นั่น) เดิมโค้ดนี้คำนวณฝั่งจาก `whZone.z >= 0` ซึ่งบังเอิญตรงกับ
    // ผังปัจจุบัน (WH อยู่ฝั่งใต้จริง) แต่ผิดหลักการ — ถ้าผังขยับจน WH.z เป็นบวก
    // รถยกจะวิ่งออกผนังฝั่งเหนือซึ่งไม่มีช่องประตูเลย จึงยึดผนังฝั่งใต้ตรงๆ
    // เหมือนสองไฟล์ข้างต้นแทน แล้วยื่นออกไปนอกผนัง ~12 ม. ซึ่งอยู่ในแถบถนน
    // บริการวงรอบจริง (9-17 ม.จากผนัง ตามคอมเมนต์ `siteShared.ts`'s
    // `OUTDOOR_WALK_OFFSET`/`RING_ROAD_GAP` กลุ่ม) — สแนปเข้าโหนดจริงบนกราฟ
    // ทันที จึงอยู่บนถนนจริงเสมอ ไม่ใช่จุดลอย
    const dockDoorZ = -d / 2;
    const dockTargetZ = -(d / 2 + 12);
    const dockIdx = graph.nearest(whZone.x, dockTargetZ);
    const dockStop = dockIdx >= 0 ? graph.nodes[dockIdx] : null;
    if (dockStop) {
      // จุดกึ่งกลางช่องประตูผนังจริงที่ `PlantShell.tsx` เจาะไว้ (x = whZone.x,
      // z = ผนังฝั่งใต้) — แทรกเป็น waypoint ตรงๆ (ไม่ใช่แค่ปล่อยให้กราฟหา
      // สะพานข้ามผนังเอาเอง) เพราะสะพานอัตโนมัติของ `buildNavGraph`
      // (`bridgeComponents`, ดูคอมเมนต์หัวไฟล์หัวข้อ "ความปลอดภัยของเส้นทาง")
      // เชื่อมสองฝั่งด้วยคู่โหนดที่ใกล้กันที่สุดเฉยๆ ไม่รู้จักตำแหน่งช่องประตู
      // จริง จุดนี้บังคับให้รถยกเดินผ่านกึ่งกลางช่องเป๊ะก่อนออกไปถนนนอกอาคาร
      // ไม่ว่ากราฟจะสะพานข้ามผนังไว้ตรงไหนก็ตาม
      const gateWaypoint: NavPoint = { x: whZone.x, z: dockDoorZ };
      const stops = crossAisle
        ? [corners[0], crossAisle.stop, gateWaypoint, dockStop]
        : [corners[0], gateWaypoint, dockStop];
      dockPath = concatWaypoints(graph, stops);
    }
  }

  if (dockPath.length >= 2) {
    plans.push({ path: dockPath, loop: false, seed: 83 });
  } else if (loopA.length >= 2) {
    // ไม่มีโซน WH หรือหาทางไปท่าไม่ได้ — ให้คันที่สามวิ่งวนรอบในแทนที่จะค้าง
    // อยู่เฉย ๆ กลางฉาก (ผังว่าง/ท่ายังไม่ถูกวางในบางกรณีขอบ)
    plans.push({ path: loopA, loop: true, seed: 83 });
  }

  return plans;
}

// ---------------------------------------------------------------------------
// การเดินตามเส้นทาง — สูตรเดียวกับ `inspectionAgent.ts`'s `advanceAlongLegs`
// (ไฟล์นั้น private จึง copy มาปรับให้รับ state ทั่วไปและวนลูปไม่รู้จบได้)
// ---------------------------------------------------------------------------

interface VehicleState {
  path: NavPoint[];
  loop: boolean;
  index: number;
  dir: 1 | -1;
  x: number;
  z: number;
  yaw: number;
  /** ระยะทางสะสม (เมตร) — ใช้สลับ "ถือพาเลท/ว่าง" ของรถวิ่งวนรอบใน */
  travelled: number;
}

function initVehicleState(plan: VehiclePlan): VehicleState {
  const path = plan.path;
  const startFrac = hash01(plan.seed);
  const outbound = startFrac < 0.5;
  const startIndex = plan.loop
    ? Math.floor(startFrac * path.length) % path.length
    : outbound
    ? 0
    : path.length - 1;
  const start = path[startIndex] ?? path[0];

  return {
    path,
    loop: plan.loop,
    index: plan.loop ? (startIndex + 1) % path.length : outbound ? 1 : path.length - 2,
    dir: plan.loop ? 1 : outbound ? 1 : -1,
    x: start.x,
    z: start.z,
    yaw: 0,
    travelled: hash01(plan.seed * 7) * LOOP_CARRY_PERIOD,
  };
}

function advanceVehicle(v: VehicleState, dt: number, speed: number): void {
  let budget = speed * dt;
  let guard = 0;
  while (budget > 0 && guard < MAX_STEPS_PER_FRAME) {
    guard += 1;
    const target = v.path[v.index];
    if (!target) return;
    const dx = target.x - v.x;
    const dz = target.z - v.z;
    const dist = Math.hypot(dx, dz);

    if (dist <= ARRIVE_EPS) {
      if (v.loop) {
        v.index = (v.index + 1) % v.path.length;
      } else {
        v.index += v.dir;
        if (v.index >= v.path.length) {
          v.index = v.path.length - 2;
          v.dir = -1;
        } else if (v.index < 0) {
          v.index = 1;
          v.dir = 1;
        }
      }
      continue;
    }

    const want = Math.atan2(dx, dz);
    const delta = shortestAngle(v.yaw, want);
    const maxTurn = TURN_RATE * dt;
    v.yaw += clamp(delta, -maxTurn, maxTurn);

    const move = Math.min(budget, dist);
    v.x += (dx / dist) * move;
    v.z += (dz / dist) * move;
    v.travelled += move;
    budget -= move;
  }
}

/** true = คันนี้กำลังบรรทุกพาเลทอยู่ ณ ขณะนี้ — วนรอบในสลับตามระยะสะสม, วง
 *  ไป-กลับท่ารับส่งของบรรทุกขาออก (อาคาร -> ท่า) ว่างเปล่าขากลับ */
function isCarrying(v: VehicleState): boolean {
  if (v.loop) return (v.travelled % LOOP_CARRY_PERIOD) < LOOP_CARRY_PERIOD / 2;
  return v.dir === 1;
}

// ---------------------------------------------------------------------------
// เรขาคณิตตัวรถ — ปั้นครั้งเดียว รวมเป็น geometry เดียวต่อกลุ่มวัสดุ
// ---------------------------------------------------------------------------

/** ล้อหนึ่งวง — ทรงกระบอกแกนนอน (หมุน 90° จากแนวตั้งเริ่มต้นของ three.js) */
function wheel(x: number, z: number, radius: number, width: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(radius, radius, width, 14);
  g.rotateZ(Math.PI / 2);
  g.translate(x, radius, z);
  return g;
}

interface ForkliftGeometry {
  body: THREE.BufferGeometry;
  steel: THREE.BufferGeometry;
  tire: THREE.BufferGeometry;
  pallet: THREE.BufferGeometry;
}

/**
 * ปั้นรถยกหนึ่งคัน (พิกัดท้องถิ่น หันหน้า +Z ตาม convention เดียวกับ
 * `inspectionAgent.ts` — `atan2(dx,dz)` แล้วตั้ง `rotation.y = yaw` ตรง ๆ)
 * แยกเป็น 3 กลุ่มวัสดุ (ตัวถังเหลือง/โครงเหล็ก/ยาง) merge เป็น geometry เดียว
 * ต่อกลุ่ม — `InstancedMesh` ด้านล่างจึงมีแค่ 3 ก้อนสำหรับรถทุกคันรวมกัน
 * (บวกพาเลทอีก 1 ก้อน = 4 draw call รวม)
 */
function buildForkliftGeometry(): ForkliftGeometry {
  const bodyParts: THREE.BufferGeometry[] = [];
  const steelParts: THREE.BufferGeometry[] = [];
  const tireParts: THREE.BufferGeometry[] = [];

  // ตัวถัง + ถ่วงน้ำหนักท้าย (counterweight) — เหลืองนิรภัย
  bodyParts.push(box(0, 0, -0.2, 1.3, BODY_H, 1.6));
  bodyParts.push(box(0, 0, -0.95, 1.05, 0.85, 0.45));
  // หลังคากันแดด/กันของหล่น (overhead guard) เหนือที่นั่งคนขับ
  bodyParts.push(box(0, CAGE_ROOF_Y, -0.15, 1.25, 0.06, 0.95));

  // เสาโครงกันสาดสี่ต้น (driver cage)
  for (const cx of [-0.55, 0.55]) {
    for (const cz of [-0.55, 0.25]) {
      steelParts.push(pillar(cx, BODY_H, cz, 0.035, CAGE_ROOF_Y - BODY_H, 6));
    }
  }

  // มาสต์สองราง + คานบน
  for (const mx of [-0.42, 0.42]) {
    steelParts.push(box(mx, 0, 0.75, 0.09, MAST_HEIGHT, 0.12));
  }
  steelParts.push(box(0, MAST_HEIGHT, 0.75, 0.95, MAST_TOP_BAR_H, 0.12));

  // แผงหลังส้อม (fork carriage) + ส้อมสองข้าง
  steelParts.push(box(0, 0.15, 0.72, 0.95, 0.5, 0.06));
  for (const fx of [-0.28, 0.28]) {
    steelParts.push(box(fx, 0.14, 1.275, 0.09, 0.06, 1.05));
  }

  // ล้อ — คู่หน้า (ใต้มาสต์) ใหญ่กว่าคู่หลัง (ล้อเลี้ยวใต้ถ่วงน้ำหนักท้าย)
  tireParts.push(wheel(-0.62, 0.65, 0.42, 0.28));
  tireParts.push(wheel(0.62, 0.65, 0.42, 0.28));
  tireParts.push(wheel(-0.5, -0.85, 0.3, 0.22));
  tireParts.push(wheel(0.5, -0.85, 0.3, 0.22));

  const body = mergeGeometries(bodyParts, false) ?? new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const steel = mergeGeometries(steelParts, false) ?? new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const tire = mergeGeometries(tireParts, false) ?? new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const pallet = box(0, 0, 0, PALLET_W, PALLET_H, PALLET_D);

  for (const g of bodyParts) g.dispose();
  for (const g of steelParts) g.dispose();
  for (const g of tireParts) g.dispose();

  return { body, steel, tire, pallet };
}

// ---------------------------------------------------------------------------
// scratch objects ที่ใช้ซ้ำทุกเฟรม — สร้างครั้งเดียวตอนโหลดโมดูล (ไม่ allocate
// ต่อเฟรม เหมือน `RING_ROTATION` ใน `InspectorRobot.tsx`/`cameraDirRef` ใน
// `FloorScene.tsx`'s `CameraRig`)
// ---------------------------------------------------------------------------

const SCRATCH_POS = new THREE.Vector3();
const SCRATCH_QUAT = new THREE.Quaternion();
const SCRATCH_EULER = new THREE.Euler();
const SCRATCH_MATRIX = new THREE.Matrix4();
const SCALE_ONE = new THREE.Vector3(1, 1, 1);
const SCALE_ZERO = new THREE.Vector3(0, 0, 0);

// ---------------------------------------------------------------------------
// component
// ---------------------------------------------------------------------------

export interface ForkliftsProps {
  layout: PlantLayout;
}

/**
 * รถยกวิ่งวนในโรงงาน — ดูคอมเมนต์หัวไฟล์สำหรับที่มาของเส้นทาง/เกณฑ์ความ
 * ปลอดภัย/รูปแบบ performance ทั้งหมด
 */
export function Forklifts({ layout }: ForkliftsProps) {
  const nav = useMemo(() => buildForkliftNavData(layout), [layout]);
  const plans = useMemo(() => buildVehiclePlans(nav, layout), [nav, layout]);

  const statesRef = useRef<VehicleState[]>([]);
  useEffect(() => {
    statesRef.current = plans.map(initVehicleState);
  }, [plans]);

  const geo = useMemo(() => buildForkliftGeometry(), []);
  useEffect(
    () => () => {
      geo.body.dispose();
      geo.steel.dispose();
      geo.tire.dispose();
      geo.pallet.dispose();
    },
    [geo]
  );

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: FORKLIFT.body, roughness: 0.5, metalness: 0.2 }),
      steel: new THREE.MeshStandardMaterial({ color: FORKLIFT.steel, roughness: 0.5, metalness: 0.3 }),
      tire: new THREE.MeshStandardMaterial({ color: FORKLIFT.tire, roughness: 0.9, metalness: 0.0 }),
      cargo: new THREE.MeshStandardMaterial({ color: FORKLIFT.cargo, roughness: 0.85, metalness: 0.02 }),
    }),
    []
  );
  useEffect(
    () => () => {
      materials.body.dispose();
      materials.steel.dispose();
      materials.tire.dispose();
      materials.cargo.dispose();
    },
    [materials]
  );

  const bodyRef = useRef<THREE.InstancedMesh | null>(null);
  const steelRef = useRef<THREE.InstancedMesh | null>(null);
  const tireRef = useRef<THREE.InstancedMesh | null>(null);
  const palletRef = useRef<THREE.InstancedMesh | null>(null);

  useFrame((_, deltaRaw) => {
    const bodyMesh = bodyRef.current;
    const steelMesh = steelRef.current;
    const tireMesh = tireRef.current;
    const palletMesh = palletRef.current;
    if (!bodyMesh || !steelMesh || !tireMesh || !palletMesh) return;

    const delta = clamp(deltaRaw, 0, MAX_DT);
    const states = statesRef.current;

    for (let i = 0; i < FORKLIFT_COUNT; i++) {
      const v = states[i];
      if (!v || v.path.length < 2) {
        // ไม่มีแผนสำหรับ instance นี้ (ผังว่าง/หาทางไม่ได้) — ซ่อนด้วย scale
        // ศูนย์ แทนปล่อยเป็น matrix เอกลักษณ์ (จะโผล่เป็นรถผีที่จุดกำเนิดโลก)
        SCRATCH_POS.set(0, 0, 0);
        SCRATCH_QUAT.identity();
        SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ZERO);
        bodyMesh.setMatrixAt(i, SCRATCH_MATRIX);
        steelMesh.setMatrixAt(i, SCRATCH_MATRIX);
        tireMesh.setMatrixAt(i, SCRATCH_MATRIX);
        palletMesh.setMatrixAt(i, SCRATCH_MATRIX);
        continue;
      }

      advanceVehicle(v, delta, FORKLIFT_SPEED);

      SCRATCH_POS.set(v.x, 0, v.z);
      SCRATCH_EULER.set(0, v.yaw, 0);
      SCRATCH_QUAT.setFromEuler(SCRATCH_EULER);
      SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ONE);
      bodyMesh.setMatrixAt(i, SCRATCH_MATRIX);
      steelMesh.setMatrixAt(i, SCRATCH_MATRIX);
      tireMesh.setMatrixAt(i, SCRATCH_MATRIX);

      if (isCarrying(v)) {
        const fwdX = Math.sin(v.yaw);
        const fwdZ = Math.cos(v.yaw);
        SCRATCH_POS.set(v.x + fwdX * PALLET_OFFSET, PALLET_Y, v.z + fwdZ * PALLET_OFFSET);
        SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ONE);
      } else {
        SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ZERO);
      }
      palletMesh.setMatrixAt(i, SCRATCH_MATRIX);
    }

    bodyMesh.instanceMatrix.needsUpdate = true;
    steelMesh.instanceMatrix.needsUpdate = true;
    tireMesh.instanceMatrix.needsUpdate = true;
    palletMesh.instanceMatrix.needsUpdate = true;
  });

  // กราฟทางเดินว่าง (ไม่มีเลนรถ/ถนนใด ๆ ในผัง) — ไม่วาดอะไรเลย แทนที่จะ crash
  // หรือโผล่รถลอยอยู่กลางความว่างเปล่า
  if (nav.graph.nodes.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={(node: THREE.InstancedMesh | null) => {
          bodyRef.current = node;
          if (node) node.raycast = () => null;
        }}
        args={[geo.body, materials.body, FORKLIFT_COUNT]}
        castShadow={false}
      />
      <instancedMesh
        ref={(node: THREE.InstancedMesh | null) => {
          steelRef.current = node;
          if (node) node.raycast = () => null;
        }}
        args={[geo.steel, materials.steel, FORKLIFT_COUNT]}
        castShadow={false}
      />
      <instancedMesh
        ref={(node: THREE.InstancedMesh | null) => {
          tireRef.current = node;
          if (node) node.raycast = () => null;
        }}
        args={[geo.tire, materials.tire, FORKLIFT_COUNT]}
        castShadow={false}
      />
      <instancedMesh
        ref={(node: THREE.InstancedMesh | null) => {
          palletRef.current = node;
          if (node) node.raycast = () => null;
        }}
        args={[geo.pallet, materials.cargo, FORKLIFT_COUNT]}
        castShadow={false}
      />
    </group>
  );
}

export default Forklifts;
