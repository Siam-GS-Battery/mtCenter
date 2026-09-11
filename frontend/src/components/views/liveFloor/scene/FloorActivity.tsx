import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlacedMachine, PlantLayout } from "../../../../lib/plantLayout";
import { INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, ringStrip, type LaneRun } from "./indoorLanes";
import { machineHalfExtents } from "./siteShared";
import { STOCK, WORKER } from "./palette";

/**
 * ===========================================================================
 * FLOOR ACTIVITY — คนงานประจำสถานี + วัตถุดิบ/พาเลทระหว่างผลิต (roadmap step 14)
 * ===========================================================================
 *
 * โรงงานมีเครื่องจักร (`MachineInstances.tsx`) และรถยกที่วิ่งอยู่แล้ว
 * (`Forklifts.tsx`) แต่ยังไม่มี "คน" หรือ "ของ" เลย ไฟล์นี้เติมสองอย่าง:
 *   1. คนงานยืนประจำสถานี — แคปซูลลำตัว (เสื้อกั๊กสะท้อนแสง) + หัว/หมวก
 *      ทรงเดียวกับ `InspectorRobot.tsx` (แคปซูลขา/ลำตัว, สีเสื้อกั๊กจากโทน
 *      hazard เดียวกัน) แต่เป็นรุ่นย่อประหยัดที่สุดสำหรับ instancing เพราะ
 *      ต้องมีคนงานได้หลายสิบคนพร้อมกัน (ต่างจาก `InspectorRobot` ที่มีตัวเดียว
 *      จึงปั้นละเอียดเป็น mesh หลายชิ้นต่อชิ้นได้)
 *   2. พาเลทวัตถุดิบ/กล่องซ้อน (WIP) วางข้างเครื่องจักรในโซนการผลิต และถัง
 *      เหล็ก/stillage ไม่กี่ใบใกล้โซนตีขึ้นรูป
 *
 * ขอบเขตที่ตั้งใจไม่ทำ (ดูคอมเมนต์แต่ละจุดว่าทำไม):
 *   - ไม่แตะโซน `WH` เลย — มีชั้นวางพาเลทจริงแล้ว (`WarehouseRacking.tsx`) และ
 *     ทางเดินขวางฟอร์คลิฟท์ (`Forklifts.tsx`'s WH cross-aisle) อยู่ในนั้น
 *   - ไม่แตะโซน `FRG-A`/`FRG-B`/`HT-*` เลย — โซนพวกนี้มีท่อลมอัดหลักพาดพร้อม
 *     ท่อหย่อน (drop-leg) ลงมาถึง ~1.8 ม. เหนือเครื่อง (`siteUtilities.ts`'s
 *     `buildAirHeaderRun`, เรียกจาก `SiteEnvironment.tsx` เฉพาะสองกลุ่มนี้) —
 *     คนยืน/พาเลทวางอยู่ใต้ท่อหย่อนคือบั๊กคลาสเดียวกับที่โปรเจกต์นี้เจอมาแล้ว
 *     สองครั้ง ทางที่ชัวร์สุดคือไม่เข้าโซนนั้นเลย ไม่ใช่คำนวณเลี่ยงท่อทีละเส้น
 *     ผลข้างเคียง: ลานพาเลทที่ทาสีไว้แล้ว (`FloorMarkings.tsx`'s
 *     `findPalletBaySpot`) ทั้ง 4 จุดตกอยู่ใน FRG-A/FRG-B/HT-1/HT-2 พอดี
 *     (ดูลำดับโซนจริงใน `plantSite.ts`: WH, FRG-A, FRG-B, HT-1..4, LINES —
 *     4 โซนแรกที่ไม่ใช่ WH คือ FRG-A/FRG-B/HT-1/HT-2 ทั้งหมด) ไฟล์นี้จึง
 *     **ไม่วางพาเลทจริงทับลานที่ทาสีไว้เลยสักจุด** เพราะทุกจุดอยู่ในโซนต้องห้าม
 *     — ของจริงไปกระจุกอยู่ในโซน `LINES` แทน (16 ไลน์การผลิตจาก `layout.lines`)
 *     ซึ่งเป็นโซนเดียวที่ปลอดภัยจากทั้งท่อลมอัดและชั้นวางคลัง
 *
 * ตำแหน่ง y (ดู `FloorMarkings.tsx`'s y-stack ก่อนเลือก) — `FloorMarkings.tsx`
 * วาดทับพื้นโซนอยู่สองชั้นที่ทั้งคู่จบที่ `Y_ZONE_MARK = 0.37` หนา
 * `MARK_THICKNESS = 0.02` -> top จริง 0.39 เท่ากันทั้งคู่:
 *   1. ลานพาเลททาสี (`palletBay()`) — เฉพาะ 4 จุดใน FRG-A/FRG-B/HT-1/HT-2
 *      (ไฟล์นี้ไม่วางของจริงทับโซนพวกนั้นเลย ดูข้างบน จึงไม่เจอชั้นนี้จริง)
 *   2. กรอบขอบเขตเครื่องจักร (`machineOutline()`, `FloorMarkings.tsx:317-320`)
 *      — วาด**ทุกเครื่องจักรในผัง รวมถึงใน `LINES`** ที่ไฟล์นี้ใช้งานจริง จึง
 *      เป็นชั้นที่ต้องเคลียร์จริง ไม่ใช่แค่ทฤษฎี (กรอบอยู่ห่างจากขอบเครื่อง
 *      แค่ ~0.2–0.3 ม. ตาม `FOOTPRINT_MARGIN`/`OUTLINE_STRIPE_W` ในไฟล์นั้น
 *      ส่วนของที่นี่ใช้ระยะเผื่อจากเครื่อง ≥1.0 ม. เสมอ — `WORKER_MACHINE_CLEARANCE`/
 *      `PALLET_MACHINE_CLEARANCE` + รัศมี/ครึ่งเสาของแต่ละชิ้น — จึงไม่มีทาง
 *      ไปเหยียบกรอบนี้ได้ แต่เป็นผลจากระยะเผื่อ ไม่ใช่จากค่า y เอง)
 *   พื้นโซน (`PlantShell.tsx`) top = 0.29, ขอบโซน top = 0.35 ชั้นวางพาเลทใน
 *   WH ใช้ฐาน 0.40 — ไฟล์นี้ใช้ `BASE_Y = 0.45` (สูงกว่าฐานชั้นวาง WH เจตนา)
 *   เพื่อเผื่อระยะเคลียร์จริง ≥0.05 ม. เหนือชั้นทาสีบนสุดที่มีจริงในทุกโซนที่
 *   ไฟล์นี้แตะ (0.39): เคลียร์พื้นโซน (0.29) ด้วยระยะ 0.16 ม., เคลียร์ชั้นทาสี
 *   บนสุด (0.39, ทั้งกรอบขอบเขตเครื่องจักรและลานพาเลท) ด้วยระยะ 0.06 ม.
 *
 * ประสิทธิภาพ (กฎเดียวกับ `Forklifts.tsx`):
 *   - `InstancedMesh` หนึ่งก้อนต่อ "ชิ้นส่วน" หนึ่งชนิด (ลำตัวคน/หัวคน/พาเลท/
 *     กองของบนพาเลท/ถังเหล็ก) ไม่ใช่ mesh ต่อชิ้น — สูงสุด 5 draw call รวม
 *     (น้อยกว่านั้นถ้าบางหมวดว่าง — ดูใน component ด้านล่าง)
 *   - พาเลท/กองของ/ถังเหล็กเป็นของนิ่งสนิท: คำนวณ matrix ครั้งเดียวใน
 *     `useEffect` ไม่ใช่ทุกเฟรม
 *   - คนงานมีการแกว่งตัวเบา ๆ (idle sway) เท่านั้น — เขียนตรงลง
 *     `instanceMatrix` ใน `useFrame` จากอาร์เรย์ตำแหน่งฐานที่คำนวณไว้ล่วงหน้า
 *     ครั้งเดียว (`useMemo`) ไม่มี React state ต่อเฟรม ไม่ allocate อ็อบเจกต์
 *     ใหม่ในลูป (ใช้ scratch object ระดับโมดูลเหมือน `Forklifts.tsx`)
 *   - ไม่ใช้ `Math.random()` — ใช้ sine-hash แบบเดียวกับ `FloorMarkings.tsx`
 *   - `raycast = () => null` ทุก `InstancedMesh` — ไม่บังคลิก/hover เครื่องจักร
 *
 * ตำแหน่งที่ตั้ง (ใช้ `machineHalfExtents` เดียวกับ `FloorMarkings.tsx`/
 * `WarehouseRacking.tsx`, import ตรงจาก `siteShared.ts` แทนการคัดลอกสูตร —
 * ไฟล์นั้น export ฟังก์ชันนี้ไว้แล้วต่างจาก `FloorMarkings.tsx` ที่คัดลอกสูตร
 * เพราะไฟล์นั้นถูกล็อกห้ามแก้ก่อน export จะถูกเพิ่ม):
 *   - แต่ละไลน์ (`layout.lines`, กรอง `zoneId === "LINES"`) แบ่งเครื่องจักร
 *     ตามลำดับแกนหลักของไลน์ออกเป็นกลุ่มๆ ละไม่กี่เครื่อง แล้ววางคนงาน/พาเลท
 *     หนึ่งชิ้นต่อกลุ่ม (ไม่ใช่หนึ่งต่อเครื่อง) ข้างเครื่องกลางกลุ่ม ด้านที่ไม่ชน
 *     เครื่องอื่น/ไม่อยู่ในเลนรถ/ไม่ซ้อนกับของที่วางไปแล้ว
 *   - พาเลทเพิ่มอีกหนึ่งจุดใกล้ปลายแต่ละไลน์ ("ปลายไลน์" ตาม `LineInfo`'s
 *     `x0..z1`)
 *   - ถังเหล็ก/stillage ไม่กี่ใบ วางนอกกรอบโซน `FRG-A`/`FRG-B` (นอกช่วง x ของ
 *     กรอบโซนเสมอ — ท่อลมอัดวาดเฉพาะ `t` ที่อยู่ในช่วง x ของโซนเท่านั้น ดู
 *     `siteUtilities.ts`'s `overZone` check ใน `buildAirHeaderRun` จึงพ้นท่อ
 *     โดยโครงสร้างของตำแหน่งเอง ไม่ใช่แค่คำนวณแล้วเชื่อว่าปลอดภัย)
 */

// ---------------------------------------------------------------------------
// ค่าคงที่
// ---------------------------------------------------------------------------

/** สูงกว่าฐานชั้นวางพาเลทใน WH (0.40, `WarehouseRacking.tsx`) โดยเจตนา — ดู
 *  คอมเมนต์หัวไฟล์สำหรับตัวเลขระยะเคลียร์เหนือชั้นทาสีบนสุดที่มีจริง (0.39) */
const BASE_Y = 0.45;

// เดิม 5/3 (ทดสอบกับชุดข้อมูลจริง 926 เครื่อง/21 ไลน์ ได้ 80 คนงาน/185 พาเลท —
// รีวิวชี้ว่านั่นแน่นเกินไป ดูเหมือน "ของอัดแน่น" ไม่ใช่ "โรงงานที่มีคนทำงาน")
// ปรับเป็นคนงานทุก ~12-15 เครื่อง และพาเลททุก ~8-10 เครื่อง (วัดผลจริงแล้วใน
// คอมเมนต์หัวไฟล์ — ดูหัวข้อ "ความหนาแน่น")
const WORKERS_PER_CLUSTER = 13;
const PALLETS_PER_CLUSTER = 9;

const WORKER_RADIUS = 0.3;
const WORKER_MACHINE_CLEARANCE = 0.7;
const WORKER_TORSO_LEN = 0.9;
const WORKER_HEIGHT = WORKER_TORSO_LEN + WORKER_RADIUS * 2;
const WORKER_HAT_Y = WORKER_HEIGHT + 0.16;

const PALLET_HALF_W = 0.6;
const PALLET_HALF_D = 0.55;
const PALLET_MACHINE_CLEARANCE = 0.6;
const PALLET_H = 0.15;
const CRATE_MIN_H = 0.45;
const CRATE_MAX_H = 1.15;
const LINE_END_MARGIN = 1.4;

const BIN_HALF = 0.5;
const BIN_MACHINE_CLEARANCE = 0.8;
const BIN_ZONE_MARGIN = 1.2;
const BIN_HEIGHT = 1.05;

/** ระยะเผื่อเพิ่มเมื่อเทียบกับกรอบเลนรถในอาคาร (`ringStrip`) — วัตถุยืนนิ่งจึง
 *  เผื่อมากกว่ารถวิ่งเล็กน้อย */
const LANE_MARGIN = 0.4;
/** ระยะเข้ามาจากขอบโซนที่ยอมให้วาง (กันวัตถุยื่นออกนอกโซนไปโดนขอบเขตทาสี) */
const ZONE_INSET = 0.6;

// ---------------------------------------------------------------------------
// เรขาคณิต/ตำแหน่งช่วย
// ---------------------------------------------------------------------------

/** seed -> [0,1) แบบ deterministic (sine hash เดียวกับ `FloorMarkings.tsx`) */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

interface Rect {
  x: number;
  z: number;
  w: number;
  d: number;
}

function collidesMachines(
  x: number,
  z: number,
  halfX: number,
  halfZ: number,
  machines: PlacedMachine[],
  clearance: number
): boolean {
  for (const m of machines) {
    const { extX, extZ } = machineHalfExtents(m);
    if (Math.abs(x - m.x) < halfX + extX + clearance && Math.abs(z - m.z) < halfZ + extZ + clearance) return true;
  }
  return false;
}

function collidesLanes(x: number, z: number, halfX: number, halfZ: number, lanes: LaneRun[]): boolean {
  for (const lane of lanes) {
    if (Math.abs(x - lane.x) < lane.w / 2 + halfX + LANE_MARGIN && Math.abs(z - lane.z) < lane.d / 2 + halfZ + LANE_MARGIN)
      return true;
  }
  return false;
}

function collidesPlaced(x: number, z: number, halfX: number, halfZ: number, placed: Rect[]): boolean {
  for (const p of placed) {
    if (Math.abs(x - p.x) < halfX + p.w / 2 && Math.abs(z - p.z) < halfZ + p.d / 2) return true;
  }
  return false;
}

function insideZone(x: number, z: number, zone: Rect, halfX: number, halfZ: number): boolean {
  return (
    Math.abs(x - zone.x) <= zone.w / 2 - ZONE_INSET - halfX && Math.abs(z - zone.z) <= zone.d / 2 - ZONE_INSET - halfZ
  );
}

/** ทดสอบจุดหนึ่งว่าใช้ได้จริงหรือไม่ — เครื่องจักรทั้งผัง (ไม่ใช่แค่ไลน์เดียว),
 *  เลนรถในอาคาร, ขอบเขตโซน, และของที่วางไปแล้วก่อนหน้า (กันคนงาน/พาเลททับกัน) */
function spotIsFree(
  x: number,
  z: number,
  halfX: number,
  halfZ: number,
  clearance: number,
  machines: PlacedMachine[],
  lanes: LaneRun[],
  zone: Rect,
  placed: Rect[]
): boolean {
  if (!insideZone(x, z, zone, halfX, halfZ)) return false;
  if (collidesMachines(x, z, halfX, halfZ, machines, clearance)) return false;
  if (collidesLanes(x, z, halfX, halfZ, lanes)) return false;
  if (collidesPlaced(x, z, halfX, halfZ, placed)) return false;
  return true;
}

interface WorkerSpot {
  x: number;
  z: number;
  yaw: number;
}

interface PalletSpot {
  x: number;
  z: number;
  yaw: number;
  crateH: number;
}

interface BinSpot {
  x: number;
  z: number;
}

interface ActivityData {
  workers: WorkerSpot[];
  pallets: PalletSpot[];
  bins: BinSpot[];
}

const EMPTY_ACTIVITY: ActivityData = { workers: [], pallets: [], bins: [] };

/** มุมหันเข้าหาจุด (target) จากตำแหน่ง (x,z) — ใช้ convention เดียวกับ
 *  `Forklifts.tsx` (`fwdX = sin(yaw)`, `fwdZ = cos(yaw)`) */
function yawTowards(x: number, z: number, targetX: number, targetZ: number): number {
  return Math.atan2(targetX - x, targetZ - z);
}

/**
 * ประกอบตำแหน่งคนงาน/พาเลท/ถังเหล็กทั้งหมด — ฟังก์ชันบริสุทธิ์ ไม่มี React
 * state เข้ามาเกี่ยว รับ layout คืนอาร์เรย์ตำแหน่งล้วน ๆ
 */
export function buildActivity(layout: PlantLayout): ActivityData {
  const linesZone = layout.site.zones.find((z) => z.id === "LINES");
  if (!linesZone || layout.machines.length === 0) return EMPTY_ACTIVITY;

  const lanes = ringStrip(layout.hall.w, layout.hall.d, INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, true);
  const machineById = new Map(layout.machines.map((m) => [m.id, m]));
  const linesInZone = layout.lines.filter((l) => l.zoneId === "LINES");

  const workers: WorkerSpot[] = [];
  const pallets: PalletSpot[] = [];
  const placed: Rect[] = [];

  linesInZone.forEach((line, lineIdx) => {
    const machines = line.machineIds.map((id) => machineById.get(id)).filter((m): m is PlacedMachine => !!m);
    if (machines.length === 0) return;

    const alongX = line.x1 - line.x0 >= line.z1 - line.z0;
    const sorted = [...machines].sort((a, b) => (alongX ? a.x - b.x : a.z - b.z));

    // --- คนงาน: หนึ่งคนต่อกลุ่มเครื่องจักร ---------------------------------
    for (let i = 0; i < sorted.length; i += WORKERS_PER_CLUSTER) {
      const chunk = sorted.slice(i, i + WORKERS_PER_CLUSTER);
      const anchor = chunk[Math.floor(chunk.length / 2)];
      const { extX, extZ } = machineHalfExtents(anchor);
      const perp = (alongX ? extZ : extX) + WORKER_MACHINE_CLEARANCE + WORKER_RADIUS;
      const seed = lineIdx * 977 + i * 31 + 11;
      const firstSign = hash01(seed) < 0.5 ? 1 : -1;
      for (const sign of [firstSign, -firstSign]) {
        const x = alongX ? anchor.x : anchor.x + sign * perp;
        const z = alongX ? anchor.z + sign * perp : anchor.z;
        if (spotIsFree(x, z, WORKER_RADIUS, WORKER_RADIUS, WORKER_MACHINE_CLEARANCE, layout.machines, lanes, linesZone, placed)) {
          workers.push({ x, z, yaw: yawTowards(x, z, anchor.x, anchor.z) });
          placed.push({ x, z, w: WORKER_RADIUS * 2, d: WORKER_RADIUS * 2 });
          break;
        }
      }
    }

    // --- พาเลท WIP: หนึ่งกองต่อกลุ่มเครื่องจักร (กลุ่มถี่กว่าคนงาน) --------
    for (let i = 0; i < sorted.length; i += PALLETS_PER_CLUSTER) {
      const chunk = sorted.slice(i, i + PALLETS_PER_CLUSTER);
      const anchor = chunk[Math.floor(chunk.length / 2)];
      const { extX, extZ } = machineHalfExtents(anchor);
      const perp = (alongX ? extZ : extX) + PALLET_MACHINE_CLEARANCE + (alongX ? PALLET_HALF_D : PALLET_HALF_W);
      const seed = lineIdx * 613 + i * 17 + 5;
      const firstSign = hash01(seed) < 0.5 ? -1 : 1;
      const halfX = alongX ? PALLET_HALF_W : PALLET_HALF_D;
      const halfZ = alongX ? PALLET_HALF_D : PALLET_HALF_W;
      for (const sign of [firstSign, -firstSign]) {
        const x = alongX ? anchor.x : anchor.x + sign * perp;
        const z = alongX ? anchor.z + sign * perp : anchor.z;
        if (spotIsFree(x, z, halfX, halfZ, PALLET_MACHINE_CLEARANCE, layout.machines, lanes, linesZone, placed)) {
          const crateH = CRATE_MIN_H + hash01(seed + 0.5) * (CRATE_MAX_H - CRATE_MIN_H);
          pallets.push({ x, z, yaw: alongX ? 0 : Math.PI / 2, crateH });
          placed.push({ x, z, w: halfX * 2, d: halfZ * 2 });
          break;
        }
      }
    }

    // --- พาเลทใกล้ปลายไลน์ --------------------------------------------------
    const last = sorted[sorted.length - 1];
    const { extX: lastExtX, extZ: lastExtZ } = machineHalfExtents(last);
    const endX = alongX ? last.x + lastExtX + LINE_END_MARGIN + PALLET_HALF_W : last.x;
    const endZ = alongX ? last.z : last.z + lastExtZ + LINE_END_MARGIN + PALLET_HALF_D;
    const endHalfX = alongX ? PALLET_HALF_W : PALLET_HALF_D;
    const endHalfZ = alongX ? PALLET_HALF_D : PALLET_HALF_W;
    if (spotIsFree(endX, endZ, endHalfX, endHalfZ, PALLET_MACHINE_CLEARANCE, layout.machines, lanes, linesZone, placed)) {
      const crateH = CRATE_MIN_H + hash01(lineIdx * 41 + 3) * (CRATE_MAX_H - CRATE_MIN_H);
      pallets.push({ x: endX, z: endZ, yaw: alongX ? 0 : Math.PI / 2, crateH });
      placed.push({ x: endX, z: endZ, w: endHalfX * 2, d: endHalfZ * 2 });
    }
  });

  // --- ถังเหล็ก/stillage ใกล้โซนตีขึ้นรูป — วางนอกช่วง x ของกรอบโซนเสมอ
  //     (พ้นท่อลมอัดโดยโครงสร้างของตำแหน่ง ดูคอมเมนต์หัวไฟล์) -----------------
  const bins: BinSpot[] = [];
  const forgingZones = layout.site.zones.filter((z) => z.id === "FRG-A" || z.id === "FRG-B");
  const hallHalfX = layout.hall.w / 2;
  const hallHalfZ = layout.hall.d / 2;
  forgingZones.forEach((zone, idx) => {
    const towardCenter = zone.x > 0 ? -1 : 1;
    const x = zone.x + towardCenter * (zone.w / 2 + BIN_ZONE_MARGIN + BIN_HALF);
    const z = zone.z;
    if (Math.abs(x) > hallHalfX - ZONE_INSET || Math.abs(z) > hallHalfZ - ZONE_INSET) return;
    if (collidesMachines(x, z, BIN_HALF, BIN_HALF, layout.machines, BIN_MACHINE_CLEARANCE)) return;
    if (collidesLanes(x, z, BIN_HALF, BIN_HALF, lanes)) return;
    if (collidesPlaced(x, z, BIN_HALF, BIN_HALF, placed)) return;
    bins.push({ x, z });
    placed.push({ x, z, w: BIN_HALF * 2, d: BIN_HALF * 2 });
    void idx;
  });

  return { workers, pallets, bins };
}

// ---------------------------------------------------------------------------
// scratch objects ระดับโมดูล — ไม่ allocate ในลูปเฟรม (เหมือน `Forklifts.tsx`)
// ---------------------------------------------------------------------------

const SCRATCH_POS = new THREE.Vector3();
const SCRATCH_EULER = new THREE.Euler();
const SCRATCH_QUAT = new THREE.Quaternion();
const SCRATCH_MATRIX = new THREE.Matrix4();
const SCRATCH_SCALE = new THREE.Vector3(1, 1, 1);
const SCALE_ONE = new THREE.Vector3(1, 1, 1);

/** ความถี่/แอมพลิจูดของการแกว่งตัวเบา ๆ ขณะยืนเฉย ๆ (ไม่ใช่การเดิน) */
const SWAY_RATE = 1.3;
const SWAY_AMPLITUDE = 0.05;

export interface FloorActivityProps {
  layout: PlantLayout;
}

function FloorActivity({ layout }: FloorActivityProps) {
  const data = useMemo(() => buildActivity(layout), [layout]);

  const workerCount = data.workers.length;
  const palletCount = data.pallets.length;
  const binCount = data.bins.length;

  const workerBase = useMemo(() => {
    const pos = new Float32Array(workerCount * 3);
    const yaw = new Float32Array(workerCount);
    const phase = new Float32Array(workerCount);
    data.workers.forEach((w, i) => {
      pos[i * 3] = w.x;
      pos[i * 3 + 1] = BASE_Y;
      pos[i * 3 + 2] = w.z;
      yaw[i] = w.yaw;
      // เฟสต่างกันต่อคนแบบ deterministic — กันไม่ให้ทุกคนแกว่งพร้อมกันเป๊ะ
      phase[i] = hash01(i * 3.11 + 1) * Math.PI * 2;
    });
    return { pos, yaw, phase };
  }, [data, workerCount]);

  const geometry = useMemo(
    () => ({
      torso: new THREE.CapsuleGeometry(WORKER_RADIUS, WORKER_TORSO_LEN, 3, 6),
      hat: new THREE.SphereGeometry(0.22, 8, 6),
      pallet: new THREE.BoxGeometry(PALLET_HALF_W * 2, PALLET_H, PALLET_HALF_D * 2),
      crate: new THREE.BoxGeometry(0.85, 1, 0.85),
      bin: new THREE.CylinderGeometry(BIN_HALF * 0.9, BIN_HALF, BIN_HEIGHT, 10),
    }),
    []
  );
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  const materials = useMemo(
    () => ({
      torso: new THREE.MeshStandardMaterial({ color: WORKER.vest, roughness: 0.55, metalness: 0.05 }),
      hat: new THREE.MeshStandardMaterial({ color: WORKER.hat, roughness: 0.4, metalness: 0.05 }),
      pallet: new THREE.MeshStandardMaterial({ color: STOCK.pallet, roughness: 0.85, metalness: 0.02 }),
      crate: new THREE.MeshStandardMaterial({ color: STOCK.crate, roughness: 0.8, metalness: 0.02 }),
      bin: new THREE.MeshStandardMaterial({ color: STOCK.bin, roughness: 0.5, metalness: 0.4 }),
    }),
    []
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const torsoRef = useRef<THREE.InstancedMesh | null>(null);
  const hatRef = useRef<THREE.InstancedMesh | null>(null);
  const palletRef = useRef<THREE.InstancedMesh | null>(null);
  const crateRef = useRef<THREE.InstancedMesh | null>(null);
  const binRef = useRef<THREE.InstancedMesh | null>(null);

  // --- ของนิ่งสนิท (พาเลท/กองของ/ถังเหล็ก) — ตั้ง matrix ครั้งเดียวเมื่อ
  //     ข้อมูลเปลี่ยน ไม่ใช่ทุกเฟรม ---------------------------------------------
  useEffect(() => {
    const palletMesh = palletRef.current;
    const crateMesh = crateRef.current;
    if (palletMesh && crateMesh) {
      data.pallets.forEach((p, i) => {
        SCRATCH_POS.set(p.x, BASE_Y, p.z);
        SCRATCH_EULER.set(0, p.yaw, 0);
        SCRATCH_QUAT.setFromEuler(SCRATCH_EULER);
        SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ONE);
        palletMesh.setMatrixAt(i, SCRATCH_MATRIX);

        SCRATCH_POS.set(p.x, BASE_Y + PALLET_H + p.crateH / 2, p.z);
        SCRATCH_SCALE.set(1, p.crateH, 1);
        SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCRATCH_SCALE);
        crateMesh.setMatrixAt(i, SCRATCH_MATRIX);
      });
      palletMesh.instanceMatrix.needsUpdate = true;
      crateMesh.instanceMatrix.needsUpdate = true;
    }

    const binMesh = binRef.current;
    if (binMesh) {
      data.bins.forEach((b, i) => {
        SCRATCH_POS.set(b.x, BASE_Y, b.z);
        SCRATCH_QUAT.identity();
        SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ONE);
        binMesh.setMatrixAt(i, SCRATCH_MATRIX);
      });
      binMesh.instanceMatrix.needsUpdate = true;
    }
  }, [data]);

  // --- คนงาน: แกว่งตัวเบา ๆ ทุกเฟรม เขียนตรงลง instanceMatrix ไม่ใช้ state --
  useFrame(({ clock }) => {
    const torsoMesh = torsoRef.current;
    const hatMesh = hatRef.current;
    if (!torsoMesh || !hatMesh || workerCount === 0) return;

    const t = clock.elapsedTime;
    for (let i = 0; i < workerCount; i++) {
      const sway = Math.sin(t * SWAY_RATE + workerBase.phase[i]) * SWAY_AMPLITUDE;
      SCRATCH_EULER.set(0, workerBase.yaw[i] + sway, 0);
      SCRATCH_QUAT.setFromEuler(SCRATCH_EULER);

      SCRATCH_POS.set(workerBase.pos[i * 3], workerBase.pos[i * 3 + 1], workerBase.pos[i * 3 + 2]);
      SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ONE);
      torsoMesh.setMatrixAt(i, SCRATCH_MATRIX);

      SCRATCH_POS.setY(SCRATCH_POS.y + WORKER_HAT_Y);
      SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCALE_ONE);
      hatMesh.setMatrixAt(i, SCRATCH_MATRIX);
    }
    torsoMesh.instanceMatrix.needsUpdate = true;
    hatMesh.instanceMatrix.needsUpdate = true;
  });

  // ผังว่าง/ไม่มีโซน LINES/ไม่มีเครื่องจักรเลย -> ไม่มีอะไรให้วาง ปล่อยว่างแทน
  // การ crash หรือวาด mesh เปล่า
  if (workerCount === 0 && palletCount === 0 && binCount === 0) return null;

  return (
    <group>
      {workerCount > 0 && (
        <>
          <instancedMesh
            ref={(node: THREE.InstancedMesh | null) => {
              torsoRef.current = node;
              if (node) node.raycast = () => null;
            }}
            args={[geometry.torso, materials.torso, workerCount]}
            castShadow={false}
          />
          <instancedMesh
            ref={(node: THREE.InstancedMesh | null) => {
              hatRef.current = node;
              if (node) node.raycast = () => null;
            }}
            args={[geometry.hat, materials.hat, workerCount]}
            castShadow={false}
          />
        </>
      )}
      {palletCount > 0 && (
        <>
          <instancedMesh
            ref={(node: THREE.InstancedMesh | null) => {
              palletRef.current = node;
              if (node) node.raycast = () => null;
            }}
            args={[geometry.pallet, materials.pallet, palletCount]}
            castShadow={false}
          />
          <instancedMesh
            ref={(node: THREE.InstancedMesh | null) => {
              crateRef.current = node;
              if (node) node.raycast = () => null;
            }}
            args={[geometry.crate, materials.crate, palletCount]}
            castShadow={false}
          />
        </>
      )}
      {binCount > 0 && (
        <instancedMesh
          ref={(node: THREE.InstancedMesh | null) => {
            binRef.current = node;
            if (node) node.raycast = () => null;
          }}
          args={[geometry.bin, materials.bin, binCount]}
          castShadow={false}
        />
      )}
    </group>
  );
}

export default FloorActivity;
