import * as THREE from "three";
import type { PlantBuilding, PlantShed, PlantZone } from "../../../../lib/plantSite";
import {
  box,
  pillar,
  pushOutFrom,
  RING_ROAD_GAP,
  inflateBuildingRects,
  type Corridor,
  type Buckets,
} from "./siteShared";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — LOGISTICS
 * ===========================================================================
 *
 * ท่ารับ-ส่งของ (loading dock) — แยกจาก `SiteEnvironment.tsx` เดิม (ดู
 * คอมเมนต์หัวไฟล์นั้นสำหรับพื้นหลังของทั้งระบบ)
 */

/**
 * ท่ารับ-ส่งของ (loading dock) — แท่นยกระดับ + ประตูม้วน + กันสาด + รถบรรทุก
 * ===========================================================================
 *
 * โรงงานจริงต้องมี "หน้ารับ-ส่งของ" ที่สื่อทิศทางวัตถุดิบเข้า/สินค้าออกได้ ซึ่ง
 * ยังไม่มีจุดไหนในฉากสื่อเรื่องนี้เลย — ผูกไว้กับผนังฝั่งเดียวกับโซน `WH`
 * (คลังพัสดุ/racking) เพราะเป็นจุดที่สมเหตุสมผลที่สุดในผังจริง (คลังอยู่ติด
 * ผนังนอกแถวเดียวกับ FRG-A/FRG-B — ดู `packLinesZone`/แถว A ใน plantLayout.ts)
 *
 * ยึดตำแหน่งจาก `layout.site.zones` (id "WH") ตัวจริงที่คำนวณจากเครื่องจักร
 * ในฐานข้อมูล ไม่เดาพิกัดตายตัว — กว้างของท่าปรับตามความกว้างจริงของโซนคลัง
 * (จำนวนช่องจอด 2-4 ช่อง ตามที่กว้างพอ)
 *
 * เว้นระยะจากโรงเก็บอุปกรณ์ที่มีอยู่จริง (`site.sheds`, y0/y1 ~85-93 ในแบบ ซึ่ง
 * อยู่ฝั่งผนังเดียวกับ WH พอดี) โดยคำนวณจากตำแหน่งจริงของมันที่รันไทม์ ไม่ใช่
 * ค่าประมาณ — ถ้าไม่มีโรงไหนขวางแนว X ของท่า ก็แนบชิดผนังโรงได้เลย (ปกติ);
 * ถ้ามี ก็ดันทั้งชุดออกไปพ้นโรงนั้นเท่าที่จำเป็นเท่านั้น
 *
 * ลึกจากผนังออกมารวม ~15 ม. (ผนังท่า 0.5 + แท่น 6 + รถบรรทุกถอยเทียบ ~9) ซึ่ง
 * ยังไม่ถึงแนวพุ่มไม้ในสุด (+18 ม.) แต่รถที่ "รอคิว" อยู่ไกลออกไปอีกจะไปโดนแนว
 * ต้นไม้ (+22 ม. เป็นต้นไป) จึงลงทะเบียนช่องทางเข้า (Corridor เดียวกับที่
 * `officeEntryCorridors` ใช้) ให้ `buildGreenery` เว้นต้นไม้/พุ่มให้เสมอ แม้ปกติ
 * จะไม่ต้องเบียดก็ตาม — กันพังกรณีข้อมูลจริงทำให้ต้องดันออกไกลกว่าที่คิดไว้
 */
const DOCK_BAY_W = 4.2;
const DOCK_BAYS_MIN = 2;
const DOCK_BAYS_MAX = 4;
const DOCK_PLATFORM_D = 6;
const DOCK_PLATFORM_H = 1.2;
const DOCK_WALL_T = 0.5;
const DOCK_WALL_H = 5.0;
const DOCK_WALL_GAP = 0.3;
const DOCK_DOOR_W = 3.0;
const DOCK_DOOR_H = 3.4;
/**
 * พื้นดินอ้างอิงของกลุ่มนี้ — ต้องสูงกว่าพื้นผิวทุกชั้นที่มันอาจซ้อนทับอยู่จริง:
 * หญ้า (บน 0.06), ลานคอนกรีตกลางไซต์ (บน 0.09+0.05=0.14) และ **แผ่นถนนวงรอบ
 * เอง** (`Y_SITE_ROAD`=0.15 หนา 0.05 จึงบน 0.20 — ตัวรถบรรทุกที่ "รอคิว" อาจไป
 * ยืนคาบเกี่ยวถนนเส้นนี้ในแนว X/Z ได้จริง แม้ตัวโครงสร้างหลักจะเว้นระยะไม่ให้
 * ถึงถนนแล้วก็ตาม) เดิมค่านี้เป็น 0.15 ซึ่งตรงกับ `Y_SITE_ROAD` เป๊ะ — ฐานของ
 * ทุกชิ้นในกลุ่มนี้จึงจะจมอยู่ในเนื้อแผ่นถนน 0.05 ม. พอดี (บั๊ก "วางชนกันที่ y
 * เดียวกับพื้นผิวอื่น" ตัวที่สามของไฟล์นี้) ปรับเป็น 0.24 ให้เผื่อระยะจริงเหนือ
 * ทั้งสามพื้นผิว (0.18 เหนือหญ้า, 0.10 เหนือลานคอนกรีต, 0.04 เหนือถนนวงรอบ)
 */
const DOCK_GROUND_Y = 0.24;
const DOCK_CANOPY_EAVE_Y = DOCK_GROUND_Y + DOCK_WALL_H + 0.7;
const DOCK_TRUCK_LEN = 8.6;
const DOCK_TRUCK_W = 2.4;
const DOCK_TRUCK_BODY_H = 2.5;
const DOCK_TRUCK_WHEEL_H = 0.78;
const DOCK_SHED_CLEARANCE = 2;

/** หนึ่งคันรถบรรทุกกล่องเรียบง่าย (ล้อ + ตัวถัง + ห้องคนขับ) ท้ายรถอยู่ที่ +z
 *  ท้องถิ่น (ชิดแท่น) หัวรถยื่นออกที่ -z ท้องถิ่น (ออกลานจอด) ล้อวางบนพื้นจริง
 *  (`DOCK_GROUND_Y`) ตัวถังวางซ้อนบนล้ออีกที ไม่ใช่แขวนลอย */
function pushTruck(cx: number, cz: number, b: Buckets) {
  const bodyBaseY = DOCK_GROUND_Y + DOCK_TRUCK_WHEEL_H;
  const bodyH = DOCK_TRUCK_BODY_H;
  const bodyLen = DOCK_TRUCK_LEN * 0.7;
  const cabLen = DOCK_TRUCK_LEN - bodyLen;
  const bodyCz = cz + (DOCK_TRUCK_LEN / 2 - bodyLen / 2);
  const cabCz = cz - (DOCK_TRUCK_LEN / 2 - cabLen / 2);
  b.metal.push(box(cx, bodyBaseY, bodyCz, DOCK_TRUCK_W, bodyH, bodyLen));
  b.metal.push(box(cx, bodyBaseY, cabCz, DOCK_TRUCK_W * 0.92, bodyH * 0.82, cabLen));
  b.glass.push(box(cx, bodyBaseY + bodyH * 0.42, cabCz - cabLen / 2 - 0.02, DOCK_TRUCK_W * 0.78, bodyH * 0.3, 0.05));
  for (const sx of [-1, 1]) {
    for (const sz of [bodyCz + bodyLen / 2 - 0.9, bodyCz - bodyLen / 2 + 0.9, cabCz]) {
      b.column.push(box(cx + sx * (DOCK_TRUCK_W / 2 - 0.05), DOCK_GROUND_Y, sz, 0.24, DOCK_TRUCK_WHEEL_H, 0.5));
    }
  }
}

/** ที่ตั้ง+ขนาดของท่ารับ-ส่งของ คำนวณจาก WH zone จริง + เว้นระยะจากโรงเก็บของ
 *  จริง — คืน Corridor (พิกัดโลก) ให้ `buildGreenery` เว้นต้นไม้/พุ่มให้ตรงกัน */
export function buildLoadingDock(
  hallD: number,
  whZone: PlantZone | undefined,
  sheds: PlantShed[],
  buildings: PlantBuilding[],
  b: Buckets
): Corridor | null {
  // ไม่มีโซนคลังพัสดุให้ยึด (ไม่ควรเกิดขึ้นจริง — WH มีอยู่เสมอในผัง) — ข้าม
  // ท่าทั้งชุดแทนที่จะเดาตำแหน่ง ดีกว่าวางลอย ๆ ผิดที่
  if (!whZone) return null;

  const bays = Math.max(DOCK_BAYS_MIN, Math.min(DOCK_BAYS_MAX, Math.floor((whZone.w - 6) / DOCK_BAY_W)));
  const platformW = bays * DOCK_BAY_W;
  const dockX = whZone.x;
  const wallZ = -hallD / 2;

  // --- เว้นระยะจากสิ่งปลูกสร้างจริงฝั่งเดียวกัน (site.sheds + site.buildings) -
  // ค่าเริ่มต้นคือแนบชิดผนังโรงเลย (ปกติไม่มีอะไรขวางแนว X ของ WH พอดี) รวมสอง
  // รายการเข้าด้วยกันแล้วหาระยะที่ดันออกไกลที่สุด (running minimum เดียว ไม่
  // สนใจลำดับ) — วันนี้ FRG-A/FRG-B ไม่มีเครื่องจริง (`zoneSize(id, null)` ใน
  // plantLayout.ts) ทำให้ `whZone.x` แทบคงที่และห่างจาก TRAINING CENTER กว่า
  // 140 ม. โดยบังเอิญ แต่ถ้าวันหนึ่งมีเครื่องลงโซนนั้นจริง WH.x จะขยับได้ จึง
  // ต้องเช็คกับอาคารจริงด้วย ไม่ใช่แค่โรงเก็บของ ไม่งั้นจะพึ่งความบังเอิญเฉย ๆ
  const halfSpan = platformW / 2 + 3;
  let wallFrontZ = wallZ - DOCK_WALL_GAP;
  wallFrontZ = pushOutFrom(sheds, wallFrontZ, dockX, halfSpan, DOCK_SHED_CLEARANCE);
  // อาคารจริงมีชายคายื่น 0.4 ม./ด้าน (`inflateBuildingRects`, siteShared.ts) —
  // ขยายกล่องก่อนเช็คกันชน ไม่งั้นกันสาดท่ารับ-ส่งของจะไปโผล่ทับชายคาจริง
  wallFrontZ = pushOutFrom(inflateBuildingRects(buildings), wallFrontZ, dockX, halfSpan, DOCK_SHED_CLEARANCE);

  const wallBackZ = wallFrontZ - DOCK_WALL_T;
  const platformFrontZ = wallBackZ; // แท่นแนบผนังท่า
  const platformBackZ = platformFrontZ - DOCK_PLATFORM_D; // ขอบแท่นด้านที่รถถอยเทียบ
  const platformCz = (platformFrontZ + platformBackZ) / 2;
  const wallCz = (wallFrontZ + wallBackZ) / 2;

  // --- ผนังท่า (มีช่องประตูม้วนต่อช่องจอด) ------------------------------------
  b.wall.push(box(dockX, DOCK_GROUND_Y, wallCz, platformW + 1.2, DOCK_WALL_H, DOCK_WALL_T));
  for (let i = 0; i < bays; i += 1) {
    const bx = dockX - platformW / 2 + DOCK_BAY_W * (i + 0.5);
    b.metal.push(box(bx, DOCK_GROUND_Y + DOCK_PLATFORM_H, platformFrontZ + 0.03, DOCK_DOOR_W, DOCK_DOOR_H, 0.06));
    for (let k = 1; k < 6; k += 1) {
      b.curb.push(
        box(bx, DOCK_GROUND_Y + DOCK_PLATFORM_H + (DOCK_DOOR_H * k) / 6, platformFrontZ + 0.05, DOCK_DOOR_W * 0.94, 0.05, 0.03)
      );
    }
  }

  // --- แท่นยกระดับเทียบท้ายรถบรรทุก (~1.2 ม. เท่าพื้นรถบรรทุก) ----------------
  b.plaza.push(box(dockX, DOCK_GROUND_Y, platformCz, platformW, DOCK_PLATFORM_H, DOCK_PLATFORM_D));
  b.curb.push(box(dockX, DOCK_GROUND_Y, platformBackZ, platformW, DOCK_PLATFORM_H, 0.12));
  for (const side of [-1, 1]) {
    b.curb.push(box(dockX + (side * platformW) / 2, DOCK_GROUND_Y, platformCz, 0.12, DOCK_PLATFORM_H, DOCK_PLATFORM_D));
  }

  // --- กันชนยางต่อช่องจอด ----------------------------------------------------
  for (let i = 0; i < bays; i += 1) {
    const bx = dockX - platformW / 2 + DOCK_BAY_W * (i + 0.5);
    for (const side of [-1, 1]) {
      b.metal.push(box(bx + side * 1.1, DOCK_GROUND_Y + DOCK_PLATFORM_H, platformBackZ - 0.15, 0.3, 0.35, 0.3));
    }
  }

  // --- ทางลาดขึ้นแท่น ที่ปลายด้านหนึ่ง -----------------------------------------
  const rampX = dockX - platformW / 2 - 1.6;
  const rampLen = 4.4;
  const ramp = new THREE.BoxGeometry(1.8, 0.12, rampLen);
  ramp.rotateX(-Math.atan2(DOCK_PLATFORM_H, rampLen));
  ramp.translate(rampX, DOCK_GROUND_Y + DOCK_PLATFORM_H / 2, platformBackZ + rampLen / 2 - 0.2);
  b.curb.push(ramp);
  b.metal.push(
    box(rampX - 0.85, DOCK_GROUND_Y, platformBackZ + rampLen / 2 - 0.2, 0.06, DOCK_PLATFORM_H + 0.9, rampLen)
  );

  // --- กันสาด: เสา 4 ต้น (ขนาบสองข้าง หัว-ท้าย) + แผ่นเดค ---------------------
  // รถถอยเทียบเต็มคันได้ครอบทั้งความยาว "ถ้ามีที่พอ" แต่โครงสร้าง (เดค+เสา)
  // ห้ามไปโผล่ในเลนถนนวงรอบ (`RING_ROAD_GAP` จากผนัง) — ต่างจากตัวรถบรรทุกที่
  // ข้ามถนนได้จริง (รถใช้ถนนนี้เป็นทางเข้าออก ไม่ใช่ของนิ่งที่ยืนกีดขวางเลน)
  // จึงจำกัดความลึกกันสาดไม่ให้เกินระยะจากผนังท่าไปถึงขอบในถนน (เผื่อ 0.5 ม.)
  const desiredCanopyD = DOCK_PLATFORM_D + 0.5 + DOCK_TRUCK_LEN; // อยากคลุมพ้นรถเต็มคัน
  const reachAtPlatformFront = wallZ - platformFrontZ; // ระยะจากผนังโรงถึงผิวผนังท่า (แนบแท่น)
  const maxCanopyD = RING_ROAD_GAP - 0.5 - reachAtPlatformFront;
  const canopyD = Math.max(1.5, Math.min(desiredCanopyD, maxCanopyD));
  const canopyFrontZ = platformFrontZ - canopyD;
  const canopyCz = (platformFrontZ + canopyFrontZ) / 2;
  b.eave.push(box(dockX, DOCK_CANOPY_EAVE_Y, canopyCz, platformW + 1.6, 0.28, canopyD));
  b.eave.push(box(dockX, DOCK_CANOPY_EAVE_Y - 0.3, platformFrontZ, platformW + 1.6, 0.32, 0.14));
  const postX = platformW / 2 + 0.35;
  for (const side of [-1, 1]) {
    b.column.push(pillar(dockX + side * postX, DOCK_GROUND_Y, platformFrontZ - 0.6, 0.15, DOCK_CANOPY_EAVE_Y - DOCK_GROUND_Y, 8));
    b.column.push(pillar(dockX + side * postX, DOCK_GROUND_Y, canopyFrontZ + 0.6, 0.15, DOCK_CANOPY_EAVE_Y - DOCK_GROUND_Y, 8));
  }

  // --- รถบรรทุกถอยเทียบ 2 คัน + รออีก 1 คัน ------------------------------------
  // `pushTruck` วางท้ายรถ (จุดใกล้แท่นที่สุด) ที่ cz + ครึ่งความยาวรถ — ศูนย์
  // รถจึงต้องถอยจากขอบแท่นออกไปอีกครึ่งคันเพื่อให้ท้ายรถหยุดเว้นระยะหน้าแท่น
  const loadedBays = bays >= 3 ? [0, bays - 1] : [0];
  for (const i of loadedBays) {
    const bx = dockX - platformW / 2 + DOCK_BAY_W * (i + 0.5);
    pushTruck(bx, platformBackZ - 0.3 - DOCK_TRUCK_LEN / 2, b);
  }
  pushTruck(dockX, canopyFrontZ - 5, b);

  // --- ป้ายชื่อจุด (เหมือนป้ายโซนใน buildLineHalls) ---------------------------
  const signW = Math.min(platformW * 0.7, 10);
  const signY = DOCK_CANOPY_EAVE_Y - 1.6;
  b.signPlate.push(box(dockX, signY, wallCz, signW, 1.1, 0.16));
  b.signEdge.push(box(dockX, signY - 0.14, wallCz - 0.1, signW, 0.18, 0.05));

  // --- ช่องทางเข้าให้ buildGreenery เว้นต้นไม้/พุ่มไว้เสมอ ----------------------
  // ขอบไกลสุด (z0) คำนวณจากตำแหน่งจริงของรถที่ "รอคิว" (จุดที่ไกลที่สุดในกลุ่ม
  // นี้ทั้งหมด) ไม่ใช่เลขกะเอา — กันพลาดถ้า `TREE_ROWS`/ระยะรถเปลี่ยนภายหลัง
  // แล้วต้นไม้จะไปงอกทะลุกันชนท้ายรถพอดี
  const waitingTruckFarZ = canopyFrontZ - 5 - DOCK_TRUCK_LEN / 2;
  return {
    x0: dockX - platformW / 2 - 4,
    x1: dockX + platformW / 2 + 4,
    z0: waitingTruckFarZ - 0.5,
    z1: wallFrontZ + 2,
  };
}
