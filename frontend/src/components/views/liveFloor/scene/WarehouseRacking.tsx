import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PlacedMachine, PlantLayout } from "../../../../lib/plantLayout";
import { RACKING } from "./palette";

/**
 * ===========================================================================
 * WAREHOUSE RACKING — ชั้นวางพาเลทในโซน WH (roadmap step 8)
 * ===========================================================================
 *
 * โซน `WH` ("Warehouse / Racking") เดิมเป็นแค่แผ่นพื้นเปล่า
 * (`PlantShell.tsx`'s `zone` slab) — ไฟล์นี้เพิ่ม "ชั้นวางพาเลท" 3 มิติทับ
 * ลงไปเพื่อให้อ่านเป็นคลังสินค้าจริง: เสาโครง (upright) + คานราง (beam) หลาย
 * ระดับ + พาเลท/สินค้าบางช่อง (ไม่ใช่ทุกช่อง — คลังเต็มทุกช่องดูปลอม)
 *
 * ที่มาของตำแหน่ง — ทุกอย่างอ่านจาก `layout.site.zones` ("WH") จริง ไม่มี
 * พิกัดสัมบูรณ์คงที่ในไฟล์นี้เลย (`plantLayout.ts`'s `WH.x` เป็นค่าคงที่โดย
 * บังเอิญในผังปัจจุบันเพราะ `FRG-A`/`FRG-B` ยังว่างเสมอ — ไฟล์นี้ไม่พึ่งพา
 * ข้อเท็จจริงนั้นเลย อ่านแค่ zone rect ที่ได้จริง ณ ตอนนั้น)
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
 * ชั้นบนสุดที่มีอยู่เดิมคือ `FloorMarkings.tsx`'s `Y_ZONE_MARK = 0.37` (เส้นตี
 * ขอบโซน/ลานพาเลท 2D) ซึ่งเองก็อยู่เหนือ `PlantShell.tsx`'s zone platform top
 * (0.29) และ zone-edge stripe top (0.35) แล้ว ฐานของชั้นวางในไฟล์นี้
 * (`BASE_Y = 0.40`) จึงเผื่อระยะจริง 0.03 ม. เหนือ 0.37 — ไม่ชนกับพื้นทาสีใด ๆ
 * ในสแตกเดิมเลย
 *
 * การเรนเดอร์ — ต้อง instance เท่านั้น
 * -------------------------------------
 * ชั้นวางเป็นของซ้ำมหาศาล (เสา/คาน/พาเลทนับพันชิ้นได้ง่าย ๆ) จึงทำ 3
 * `InstancedMesh` (เสา/คาน/พาเลท) ก้อนเดียวต่อชนิด แชร์ geometry/material กัน
 * ทุก instance เหมือนแพทเทิร์นของ `MachineInstances.tsx` — ได้ **สูงสุด 3 draw
 * call** (1-3 จริง ๆ: `RackInstances` คืน `null` ทิ้งก้อนที่ไม่มี instance เลย
 * เช่นถ้าทุกช่วงชั้นชนเครื่องจักรจนไม่มีคาน/พาเลทเหลือ) ไม่ว่าจะมีชั้นวางกี่
 * ร้อยช่วงชั้นก็ตาม ไม่ใช่ mesh ต่อกล่อง
 *
 * เป็นฉากประกอบ ไม่ใช่ของที่คลิกได้ — ปิด `raycast` ทั้งสามก้อนเหมือนของ
 * ตกแต่งอื่นในฉากนี้ (`FloorMarkings.tsx`, contact shadow ใน
 * `MachineInstances.tsx`)
 */

/** ระยะเผื่อขอบโซนก่อนเริ่มวางชั้นวางแถวแรก (เมตร) */
const EDGE_MARGIN = 2;
/** ความลึกของเสาโครงหนึ่งต้น/ชั้นวางหนึ่งแถว (เมตร) */
const RACK_DEPTH = 1.1;
/** ความกว้างช่วงชั้นหนึ่งช่วง (เมตร) */
const BAY_WIDTH = 2.7;
/** ช่องว่างเล็กน้อยระหว่างหลังชั้นวางคู่ back-to-back (เมตร) */
const BACK_TO_BACK_GAP = 0.2;
/** ทางเดินฟอร์คลิฟท์ระหว่างคู่แถว back-to-back (เมตร) */
const AISLE_WIDTH = 3.5;
/** ทางเดินขวางที่ตัดกลางแนวช่วงชั้น กันไม่ให้เป็นบล็อกทึบตันข้ามไม่ได้ (เมตร) */
const CROSS_AISLE_WIDTH = 3.5;
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
/** ระยะเผื่อรอบเครื่องจักรที่ชั้นวางต้องไม่ล้ำเข้าไป (เมตร) */
const MACHINE_CLEARANCE = 0.6;

/** ฐานชั้นวาง — ดูคอมเมนต์หัวไฟล์ "ระดับความสูง (y)" */
const BASE_Y = 0.4;

/** สัดส่วนช่วงชั้น+ระดับที่ "มีพาเลทวางอยู่" — ไม่ใช่ทุกช่องเพื่อให้ดูสมจริง */
const PALLET_OCCUPANCY = 0.45;
const PALLET_HASH_SEED = 4231;

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
 * ประกอบแผนตำแหน่งชั้นวางทั้งหมดในโซน `WH` — ฟังก์ชันบริสุทธิ์ (ไม่ใช่ hook)
 * เหมือนแพทเทิร์น `buildShell`/`buildMarkings` ของไฟล์พี่น้อง คืน `null` เมื่อ
 * ไม่มีโซน `WH` หรือโซนเล็กเกินกว่าจะใส่ชั้นวางได้แม้แถวเดียว
 */
function buildRackingPlan(layout: PlantLayout): RackingPlan | null {
  const zone = layout.site.zones.find((z) => z.id === "WH");
  if (!zone) return null;
  if (zone.w <= 0 || zone.d <= 0) return null;

  // แกนที่ยาวกว่าเป็นแกน "ช่วงชั้น" (bay axis) แกนสั้นกว่าเป็นแกน "แถว" (row
  // axis) — บรรจุแถวได้มากที่สุดเท่าที่ zone จริงจะรับได้ ไม่ว่า zone จะกว้าง
  // หรือลึกกว่า
  const alongX = zone.w >= zone.d;
  const bayAxisLen = alongX ? zone.w : zone.d;
  const rowAxisLen = alongX ? zone.d : zone.w;

  const usableBay = bayAxisLen - 2 * EDGE_MARGIN;
  const usableRow = rowAxisLen - 2 * EDGE_MARGIN;
  if (usableBay <= 0 || usableRow <= 0) return null;

  const pairDepth = RACK_DEPTH * 2 + BACK_TO_BACK_GAP;
  const rowPitch = pairDepth + AISLE_WIDTH;
  if (usableRow < pairDepth) return null;
  const rowPairCount = 1 + Math.floor((usableRow - pairDepth) / rowPitch);
  if (rowPairCount < 1) return null;

  // ลองแบ่งเป็น 2 บล็อกคั่นด้วยทางเดินขวางก่อน (กันบล็อกทึบตัน) — ถ้าโซนแคบ
  // เกินไปสำหรับ 2 บล็อก ถอยไปเป็นบล็อกเดียว
  const twoBlockWidth = (usableBay - CROSS_AISLE_WIDTH) / 2;
  let blocks = 2;
  let baysPerBlock = Math.floor(twoBlockWidth / BAY_WIDTH);
  if (baysPerBlock < 1) {
    blocks = 1;
    baysPerBlock = Math.floor(usableBay / BAY_WIDTH);
  }
  if (baysPerBlock < 1) return null;

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
          const seed = PALLET_HASH_SEED + bayGlobalIndex * 97 + rowIdx * 13 + tierIdx * 7 + b * 31;
          if (hash01(seed) < PALLET_OCCUPANCY) {
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

export interface WarehouseRackingProps {
  layout: PlantLayout;
}

/**
 * ชั้นวางพาเลทในโซน `WH` — ดูคอมเมนต์หัวไฟล์
 */
export function WarehouseRacking({ layout }: WarehouseRackingProps) {
  const plan = useMemo(() => buildRackingPlan(layout), [layout]);

  const uprightGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(UPRIGHT_SIZE, RACK_HEIGHT, UPRIGHT_SIZE);
    g.translate(0, RACK_HEIGHT / 2, 0);
    return g;
  }, []);

  const beamGeometry = useMemo(() => {
    if (!plan) return null;
    const g = new THREE.BoxGeometry(plan.beamW, BEAM_THICKNESS, plan.beamD);
    g.translate(0, BEAM_THICKNESS / 2, 0);
    return g;
  }, [plan]);

  const palletGeometry = useMemo(() => {
    if (!plan) return null;
    const g = new THREE.BoxGeometry(plan.palletW, PALLET_H, plan.palletD);
    g.translate(0, PALLET_H / 2, 0);
    return g;
  }, [plan]);

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
  useEffect(() => () => beamGeometry?.dispose(), [beamGeometry]);
  useEffect(() => () => palletGeometry?.dispose(), [palletGeometry]);
  useEffect(
    () => () => {
      uprightMaterial.dispose();
      beamMaterial.dispose();
      palletMaterial.dispose();
    },
    [uprightMaterial, beamMaterial, palletMaterial]
  );

  if (!plan || !beamGeometry || !palletGeometry) return null;

  return (
    <group>
      <RackInstances placements={plan.uprights} geometry={uprightGeometry} material={uprightMaterial} castShadow />
      <RackInstances placements={plan.beams} geometry={beamGeometry} material={beamMaterial} castShadow />
      <RackInstances placements={plan.pallets} geometry={palletGeometry} material={palletMaterial} castShadow />
    </group>
  );
}

export default WarehouseRacking;
