import * as THREE from "three";
import type { LineInfo, PlacedMachine } from "../../../../lib/plantLayout";
import type { PlantBuilding, PlantShed, PlantZone } from "../../../../lib/plantSite";
import { slabGeometry } from "./geometryKit";
import { ringStrip } from "./indoorLanes";
import {
  box,
  pillar,
  machineHalfExtents,
  insideCorridor,
  pushOutFrom,
  RING_ROAD_GAP,
  RING_ROAD_W,
  Y_SITE_ROAD,
  OUTDOOR_CURB_OFFSET,
  eaveYOf,
  inflateBuildingRects,
  type Corridor,
  type Buckets,
} from "./siteShared";
import { officeSites } from "./siteOffice";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — UTILITIES
 * ===========================================================================
 *
 * สถานีไฟฟ้าย่อย, ห้องปั๊มลม, ท่อลมอัดหลัก, หัวจ่ายน้ำ/ตู้ดับเพลิง — แยกจาก
 * `SiteEnvironment.tsx` เดิม (ดูคอมเมนต์หัวไฟล์นั้นสำหรับพื้นหลังของทั้งระบบ)
 */


/**
 * ท่อลมอัดหลัก (overhead compressed-air header) เหนือ "ทางเดิน/ช่องว่าง" ข้าง
 * แนวโซนตีขึ้นรูป/อบชุบ — ไม่ใช่เหนือตัวเครื่องจักรเอง
 * ===========================================================================
 *
 * เครื่องตีขึ้นรูป (FRG-A/FRG-B) และเครื่องอบชุบ (HT-1..4) ใช้ลมอัดควบคุม
 * กระบอกสูบ/วาล์วนิวเมติกทุกตัว แต่ในฉากไม่มีอะไรสื่อว่าลมอัดมาจากไหนเลย —
 * ฟังก์ชันนี้ตีท่อหลักแนวราบพาดตาม "แนว bay โครงสร้าง" (ระยะ `bay` เดียวกับที่
 * `buildLineHalls` ใช้ตีจันทัน — ข้อมูลจริงจาก `layout.site.hall.bay`) ของแต่ละ
 * แถวโซน แล้วหย่อนท่อแยก (drop-leg) ลงหาเครื่องจริงที่อยู่ในแถวนั้น
 *
 * ทำไมแขวนที่ "แนวจันทัน" ไม่ใช่ "เสา": `buildLineHalls`/`PlantShell` ทั้งคู่
 * ตั้งใจไม่ปลูกเสาอาคารไลน์ถึงพื้น (เหตุผลเดียวกันทั้งสองที่ — เสาหลายร้อยต้น
 * จะบังเครื่องจักรจนมองจากมุมไลน์ไม่เห็นอะไร ดูคอมเมนต์ที่ทั้งสองฟังก์ชัน) จึง
 * ไม่มี "เสาโครงสร้าง" ถึงพื้นให้แขวนจริงในไฟล์นี้ — ใช้จันทัน/คานเชิงชายที่
 * `eaveY` (โครงสร้างเดียวที่มีอยู่จริงระดับสูง ตรงตาม "แนว bay" ที่โจทย์ขอ)
 * เป็นจุดแขวนแทน ซึ่งเป็นวิธีที่ทำได้จริงในโรงงานจริงเช่นกัน (แขวนใต้จันทัน)
 *
 * ทำไมท่อหลักไม่พาดผ่าน "เหนือเครื่องจักร" (รุ่นก่อนหน้าของฟังก์ชันนี้ทำแบบนั้น):
 * เครื่องจักร "heat treat" ใน HT-1 (แถวเดียวที่มีเครื่องจริงวันนี้ — ดูล่าง)
 * แม็ปเป็น archetype "furnace" สูงถึง 7.6 ม. (`HEIGHT.furnace` ใน
 * `plantLayout.ts`) ส่วน eave อยู่ที่ `hall.h*0.78` = 8.19 ม. — เหลือช่องว่าง
 * แค่ 0.59 ม. ระหว่างหลังคาเตากับเชิงชาย ไม่พอทั้งใส่ท่อ (เส้นผ่านศูนย์กลาง
 * 0.28 ม.) และเผื่อระยะสองฝั่งพร้อมกันอย่างสบาย ๆ — ยิ่งไปกว่านั้น ท่อลมอัดจริง
 * ก็ไม่มีใครเดินแนบหลังคาเตาความร้อนสูงและซ่อมบำรุงไม่ถึงแบบนั้น จึงย้ายแนวท่อ
 * ออกไป "ข้างแถวเครื่องจักร" (ช่องว่างที่ `ZONE_MARGIN` เผื่อไว้รอบบล็อกเครื่อง
 * จริงใน `plantLayout.ts` — ไม่ใช่ตำแหน่งที่เดาเอง แต่คำนวณสดจากกล่องขอบเขต
 * เครื่องจักรจริง `rowMachines` เทียบกับกล่องขอบเขตโซนจริง `zones` ทุกครั้ง)
 * แล้วให้ `headerY` กลับไปใช้ความสูงสบาย ๆ เดิม (racking+เผื่อ) เพราะไม่ต้อง
 * เผื่อเตาสูงอีกต่อไป — ท่อหย่อนจึงกลาย "ลง แล้วเลี้ยวขวางไปหาเครื่อง" แทนที่
 * จะ "ลงตรงทับเครื่อง" (`pickAisleRow` คำนวณแนวและ margin จริงด้านล่าง)
 *
 * ถ้าแถวไหนไม่มีระยะข้างเครื่องพอ (`AISLE_MIN_MARGIN`) จริง ๆ — เช่นข้อมูล DB
 * เปลี่ยนจนเครื่องจริงเต็มเกือบทั้งโซนไม่เหลือ margin — จะ fallback กลับไปพาด
 * เหนือเครื่องแบบเดิมพร้อมยก `headerY` ชนเตา (เหมือนรุ่นก่อนหน้า) แทนที่จะ
 * เดาตำแหน่งทางเดินที่ไม่มีอยู่จริง (ดู `pickAisleRow`/การใช้งานด้านล่าง)
 *
 * ระยะสูงคำนวณสดจาก `hallHeight` เสมอ ไม่ hardcode:
 *   racking (`WAREHOUSE_RACKING_H`=6.4 ม. — ข้อเท็จจริงจาก WarehouseRacking.tsx)
 *   header = racking+0.8 = 7.2 ม. (ที่ hall.h=10.5)
 *   eave = hall.h*0.78 = 8.19 ม. → header ต่ำกว่า eave 0.99 ม. (วัดจากผิวท่อ)
 *   ทุกระยะเผื่อข้างต้น ≥0.05 ม. ของไฟล์นี้เสมอ
 */
const WAREHOUSE_RACKING_H = 6.4;
const AIR_HEADER_CLEARANCE_ABOVE_RACKING = 0.8;
const AIR_HEADER_MIN_EAVE_MARGIN = 0.05;
const AIR_HEADER_R = 0.14;
const AIR_DROP_R = 0.09;
const AIR_HEADER_OVERHANG = 2;
/** ท่อหย่อนลงจบที่สัดส่วนนี้ของความสูงท่อหลัก เมื่อจุดนั้นไม่มีเครื่องจักรจริง
 *  ให้ชน (แถวว่าง หรือช่องว่างระหว่างโซนในแถวเดียวกัน) */
const AIR_DROP_BOTTOM_FRAC = 0.55;
/** ระยะเผื่อแนวราบ (x/z) รอบกล่องขอบเขตเครื่องจักรตอนทดสอบชนกับท่อหย่อน — คง
 *  ไว้เป็น guard แม้จะแทบไม่ทำงานแล้วตอนท่อหลักอยู่ในทางเดิน (ดู comment หัวไฟล์) */
const AIR_DROP_XZ_CLEARANCE = 1.0;
/** ระยะเผื่อแนวดิ่งเหนือหลังคาเครื่องจักรตัวที่สูงสุดตรงจุดนั้น */
const AIR_DROP_MACHINE_CLEARANCE = 0.5;
/** ระยะเผื่อแนวดิ่งเหนือเครื่องจักรตัวที่สูงสุดในทั้งแถว — ใช้เฉพาะตอน fallback
 *  พาดเหนือเครื่อง (ไม่มีทางเดินให้ใช้จริง ๆ) เท่านั้น */
const AIR_HEADER_MACHINE_CLEARANCE = 0.4;
/** ความยาวขั้นต่ำที่ตัวแขวนยังอ่านออกว่าเป็น "ตัวแขวน" (ไม่ใช่ปุ่มเล็ก ๆ) —
 *  คงไว้เป็น guard สำหรับกรณี fallback (ท่อปกติในทางเดินมีความยาวตัวแขวนปกติ) */
const AIR_HANGER_MIN_LEN = 0.15;
/** ระยะจากขอบกล่องเครื่องจักรจริงถึง "แกนกลางท่อหลัก" เมื่อวางในทางเดิน */
const AISLE_CLEARANCE = 1.0;
/** margin ขั้นต่ำ (เกินกว่า `AISLE_CLEARANCE` พร้อมกันชนอีกชั้น) ที่นับว่า
 *  "มีทางเดินให้ใช้จริง" — ต่ำกว่านี้ fallback กลับไปพาดเหนือเครื่อง */
const AISLE_MIN_MARGIN = 1.8;
/** ระยะเบี่ยงแกน X สูงสุดที่ยังนับว่า "เครื่องจักรตัวนี้อยู่ตรงจุดหย่อนท่อนี้
 *  จริง" — เกินนี้แปลว่าไม่มีเครื่องให้แขนงไปหาที่ตำแหน่งนี้ (ดู `nearestMachineAt`) */
const AIR_BRANCH_X_TOLERANCE = 0.5;
/** ระยะเผื่อพ้นผิวหน้าเครื่องจักรที่แขนงพาดไปหา — วาล์วปิดปลายอยู่นอกกล่อง
 *  ขอบเขตเครื่องจริงเท่านี้ ไม่ใช่แนบชิดผิวพอดี */
const AIR_BRANCH_FACE_CLEARANCE = 0.3;
/** ความสูงใช้งานจริงของวาล์ว/ชุดกรองลม (FRL) ที่คนเอื้อมถึง — ใช้แทนสัดส่วน
 *  คงที่ของ headerY เดิม (ซึ่งเคยลงเอยกลางความสูงเตาโดยบังเอิญ) เมื่อแขนงมี
 *  เครื่องจริงให้ไปหา (clamp ไม่ให้สูงเกินหลังคาเครื่องเตี้ยด้วย `target.height`) */
const AIR_DROP_SERVICE_Y = 1.8;

/**
 * หาตำแหน่ง Z ของ "ทางเดิน" ข้างแถวเครื่องจักรจริง (ไม่ทับเครื่องตัวไหนเลย)
 * — ใช้กล่องขอบเขตโซนจริง (`zones`, อาจไม่เท่ากันทุกโซนถ้าโซนถูกขยายตามเนื้อหา)
 * รวมเป็นกล่องเดียว แล้วเทียบกับกล่องขอบเขตเครื่องจักรจริงที่หมุนแล้ว
 * (`machineHalfExtents`) เพื่อหา margin ที่เหลือจริงทั้งสองฝั่ง (เหนือ/ใต้
 * แถวเครื่อง) ไม่ได้สมมติค่า `ZONE_MARGIN` ของ `plantLayout.ts` ตรง ๆ (จะพัง
 * ถ้าใครแก้ค่านั้นทีหลัง) แต่คำนวณจากข้อมูลจริงเสมอ
 *
 * คืน `null` เมื่อไม่มีเครื่องจักรในแถว (ไม่ต้องมีทางเดิน — พาดกลางแถวได้เลย)
 * หรือเมื่อไม่มี margin ฝั่งไหนพอ (`AISLE_MIN_MARGIN`) — ผู้เรียก fallback
 * กลับไปพาดเหนือเครื่องแทน
 */
function pickAisleZ(zones: PlantZone[], rowMachines: PlacedMachine[]): number | null {
  if (rowMachines.length === 0) return null;

  const zoneZ0 = Math.min(...zones.map((z) => z.z - z.d / 2));
  const zoneZ1 = Math.max(...zones.map((z) => z.z + z.d / 2));

  let maxZ = -Infinity;
  let minZ = Infinity;
  for (const m of rowMachines) {
    const { extZ } = machineHalfExtents(m);
    maxZ = Math.max(maxZ, m.z + extZ);
    minZ = Math.min(minZ, m.z - extZ);
  }
  const marginFar = zoneZ1 - maxZ; // ที่ว่างระหว่างขอบเครื่องฝั่ง +Z กับขอบโซน
  const marginNear = minZ - zoneZ0; // ที่ว่างระหว่างขอบเครื่องฝั่ง -Z กับขอบโซน

  if (marginFar >= AISLE_MIN_MARGIN && marginFar >= marginNear) return maxZ + AISLE_CLEARANCE;
  if (marginNear >= AISLE_MIN_MARGIN) return minZ - AISLE_CLEARANCE;
  return null;
}

/**
 * คำนวณ "แกนกลางท่อลมอัดหลัก" จริงตามแถวโซนที่ให้มา — จุดเดียวที่คิดสูตรนี้
 * (`buildAirHeaderRun` และ `ductRunY` เรียกตัวเดียวกันนี้ทั้งคู่) เพราะเดิม
 * `ductRunY` มีสูตรคู่ขนานแยกจากกัน (`WAREHOUSE_RACKING_H + ...` ล้วน ๆ) ที่
 * บังเอิญตรงกับ `baseY` ตรงนี้เฉพาะตอนแถวไม่มีเครื่องจักรจริง (`FRG-A/FRG-B`
 * ว่างอยู่วันนี้) — ถ้ามีเครื่องจริงมาลงแถวนี้แล้วดัน headerY จริงขึ้นผ่าน
 * `machineConstrainsHeader`, สูตรคู่ขนานจะไม่รู้เรื่องและท่อดักฝุ่นจะวิ่งต่ำ
 * กว่าท่อลมอัดจริงจนชนกันแบบเงียบ ๆ — บั๊กคลาสเดียวกับที่ `eaveY` เพิ่งรวมจุด
 * เดียวไปเหมือนกัน จึงรวมจุดเดียวตรงนี้ด้วย
 */
function computeAirHeaderY(
  zones: PlantZone[],
  hallHeight: number,
  machines: PlacedMachine[]
): { headerY: number; aisleZ: number | null; maxMachineH: number; machineConstrainsHeader: boolean } {
  const zoneIds = new Set(zones.map((z) => z.id));
  const rowMachines = machines.filter((m) => zoneIds.has(m.zoneId));
  const maxMachineH = rowMachines.reduce((mx, m) => Math.max(mx, m.height), 0);
  const aisleZ = pickAisleZ(zones, rowMachines);
  const machineConstrainsHeader = aisleZ === null && maxMachineH > 0;

  const eaveY = eaveYOf(hallHeight);
  const baseY = WAREHOUSE_RACKING_H + AIR_HEADER_CLEARANCE_ABOVE_RACKING;
  const desiredY = machineConstrainsHeader
    ? Math.max(baseY, maxMachineH + AIR_HEADER_R + AIR_HEADER_MACHINE_CLEARANCE)
    : baseY;
  const eaveCap = eaveY - AIR_HEADER_R - AIR_HEADER_MIN_EAVE_MARGIN;
  const headerY = Math.min(desiredY, eaveCap);
  return { headerY, aisleZ, maxMachineH, machineConstrainsHeader };
}

export function buildAirHeaderRun(
  zones: PlantZone[],
  hallHeight: number,
  bay: number,
  machines: PlacedMachine[],
  b: Buckets
) {
  if (zones.length === 0) return;

  const zoneIds = new Set(zones.map((z) => z.id));
  const rowMachines = machines.filter((m) => zoneIds.has(m.zoneId));
  const rowZCenter = zones.reduce((s, z) => s + z.z, 0) / zones.length;

  // `headerY`/`aisleZ`/`maxMachineH`/`machineConstrainsHeader` มาจาก
  // `computeAirHeaderY` จุดเดียว (ดู comment ที่ฟังก์ชันนั้น) — `ductRunY`
  // เรียกฟังก์ชันเดียวกันนี้แทนสูตรคู่ขนาน จึงรับประกันว่าไม่มีทางเพี้ยนกัน
  const { headerY, aisleZ, maxMachineH, machineConstrainsHeader } = computeAirHeaderY(zones, hallHeight, machines);
  const rowZ = aisleZ ?? rowZCenter;
  const eaveY = eaveYOf(hallHeight);
  // ระยะเผื่อผิวล่างท่อ-หลังคาเครื่องจริงที่ได้ ณ `headerY` สุดท้าย (เฉพาะกรณี
  // fallback พาดเหนือเครื่อง — ปกติ (`aisleZ` มีค่า) ท่อไม่อยู่เหนือเครื่องเลย
  // จึงไม่ต้องเช็คนี้) อาจน้อยกว่า `AIR_HEADER_MACHINE_CLEARANCE` ที่ตั้งใจไว้
  // ถ้าเพดาน eave บีบลงมาก่อน — ถ้าระยะที่เหลือจริงแทบไม่มีเลย ข้ามทั้งแถวไปเลย
  // ดีกว่าวาดท่อทะลุเครื่องจักร
  const machineClearance = machineConstrainsHeader ? headerY - AIR_HEADER_R - maxMachineH : Infinity;
  if (machineConstrainsHeader && machineClearance < 0.02) return;
  const defaultDropBottomY = headerY * AIR_DROP_BOTTOM_FRAC;

  const minX = Math.min(...zones.map((z) => z.x - z.w / 2));
  const maxX = Math.max(...zones.map((z) => z.x + z.w / 2));

  const x0 = minX - AIR_HEADER_OVERHANG;
  const x1 = maxX + AIR_HEADER_OVERHANG;
  const len = x1 - x0;
  if (len <= 0) return;

  // --- ท่อหลักแนวราบ (`box()` วางจากฐานขึ้นบน จึงต้องยกฐานลงครึ่งความหนาท่อ
  //     เพื่อให้ "แกนกลางท่อ" อยู่ที่ `headerY` จริง ไม่ใช่ท้องท่อ) -------------
  b.metal.push(box(x0 + len / 2, headerY - AIR_HEADER_R, rowZ, len, AIR_HEADER_R * 2, AIR_HEADER_R * 2));

  // --- หาความสูงที่ท่อหย่อนตรงจุด (t, rowZ) ต้องจบ — ใช้เฉพาะ fallback (พาด
  //     เหนือเครื่องจริง ไม่มีทางเดินให้ใช้) ที่ `aisleZ === null` เท่านั้น —
  //     `null` แปลว่าไม่มีระยะปลอดภัยพอ ให้ข้ามท่อหย่อนจุดนี้ไปเลย -------------
  const dropTerminusY = (t: number): number | null => {
    let hit = false;
    let topMost = 0;
    for (const m of rowMachines) {
      const { extX, extZ } = machineHalfExtents(m);
      if (Math.abs(t - m.x) < AIR_DROP_XZ_CLEARANCE + extX && Math.abs(rowZ - m.z) < AIR_DROP_XZ_CLEARANCE + extZ) {
        hit = true;
        topMost = Math.max(topMost, m.height);
      }
    }
    if (!hit) return defaultDropBottomY;
    const y = topMost + AIR_DROP_MACHINE_CLEARANCE;
    return headerY - y >= 0.05 ? y : null;
  };

  // --- หาเครื่องจักรจริงตัวที่ท่อหย่อนตำแหน่ง `t` (แกน X) ควรไปหา — เฉพาะตัวที่
  //     กล่องขอบเขต X ของมันคาบเกี่ยว `t` จริง ๆ (ระยะเผื่อเล็กน้อย) ไม่ใช่
  //     "ตัวไหนก็ได้ในแถว" — กันไม่ให้แขนงวิ่งไปหาเครื่องที่ไม่ได้อยู่ใต้ตำแหน่ง
  //     นี้จริง (ซึ่งจะทำให้ปลายแขนงลอยอยู่กลางอากาศข้างเครื่องผิดตัว) ----------
  const nearestMachineAt = (t: number): PlacedMachine | null => {
    let best: PlacedMachine | null = null;
    let bestDist = Infinity;
    for (const m of rowMachines) {
      const { extX } = machineHalfExtents(m);
      const dist = Math.max(0, Math.abs(t - m.x) - extX);
      if (dist < bestDist) {
        bestDist = dist;
        best = m;
      }
    }
    return bestDist <= AIR_BRANCH_X_TOLERANCE ? best : null;
  };

  // --- ทดสอบชนจริงของ "เส้นทางแขนง" (ไม่ใช่แค่ปลายทาง) กับกล่องขอบเขตเครื่อง
  //     จักรทุกตัวในแถว — แขนงที่ตำแหน่ง X คงที่ `t` พาดจาก `z0` ถึง `z1` ที่
  //     ความสูง `y` คงที่ ตัดผ่านเครื่องตัวไหนก็ตามที่ (ก) แกน X ของเครื่อง
  //     คาบเกี่ยว `t`, (ข) แกน Z ของแขนงคาบเกี่ยวกล่องเครื่อง และ (ค) `y` ยัง
  //     ต่ำกว่าหลังคาเครื่องนั้น (แขนงที่อยู่สูงกว่าหลังคาเครื่องผ่านทับได้โดย
  //     ไม่ชนจริง) ------------------------------------------------------------
  const branchHitsAnyMachine = (t: number, z0: number, z1: number, y: number): boolean => {
    const zLo = Math.min(z0, z1);
    const zHi = Math.max(z0, z1);
    for (const m of rowMachines) {
      if (y > m.height) continue;
      const { extX, extZ } = machineHalfExtents(m);
      if (Math.abs(t - m.x) >= extX) continue;
      if (zLo < m.z + extZ && zHi > m.z - extZ) return true;
    }
    return false;
  };

  // --- แขวน + หย่อนท่อ ตามระยะ bay จริงตลอดความยาวท่อหลัก --------------------
  // ตัวแขวนต้องเริ่มจาก "ผิวบนท่อ" (headerY + AIR_HEADER_R) ไม่ใช่แกนกลาง —
  // guard ความยาวขั้นต่ำ/ไม่ติดลบ นี้เดิมมีไว้ให้กรณี fallback ที่ headerY ถูก
  // ดันขึ้นชิด eave แต่พอกลับมาใช้ `baseY` ปกติแล้ว (ทางเดินมีจริง) ความยาว
  // ตัวแขวนกลับมาเป็นค่าปกติสบาย ๆ (~0.85 ม.) เหมือนแถวว่าง — guard ยังอยู่
  // เผื่อกรณี fallback แต่ไม่ได้ตัดตัวแขวนออกในเส้นทางปกติอีกต่อไป -----------
  const hangerBaseY = headerY + AIR_HEADER_R;
  const hangerLen = eaveY - hangerBaseY;
  const frames = Math.max(2, Math.round(len / bay));
  for (let f = 0; f <= frames; f += 1) {
    const t = x0 + (len * f) / frames;

    // ตัวแขวน (hanger) จากจันทัน/คานเชิงชายลงมาที่ผิวบนท่อหลัก — มีทุกเฟรม
    if (hangerLen >= AIR_HANGER_MIN_LEN) {
      b.metal.push(box(t, hangerBaseY, rowZ, 0.06, hangerLen, 0.06));
    }

    // ท่อหย่อน (drop-leg) เฉพาะเฟรมที่ตกอยู่ในโซนที่มีเครื่องจริงอยู่ด้านล่าง
    const overZone = zones.some((z) => t >= z.x - z.w / 2 && t <= z.x + z.w / 2);
    if (!overZone) continue;

    if (aisleZ === null) {
      // --- fallback: ไม่มีทางเดินให้ใช้ — พาดเหนือเครื่องเหมือนเดิม (จบท่อ
      //     เหนือหลังคาเครื่องที่สูงสุดตรงจุดนั้น, ทดสอบด้วย `dropTerminusY`) --
      const dropBottomY = dropTerminusY(t);
      if (dropBottomY === null) continue;
      const dropH = headerY - dropBottomY;
      if (dropH <= 0.05) continue;
      b.metal.push(box(t, dropBottomY, rowZ, AIR_DROP_R * 2, dropH, AIR_DROP_R * 2));
      const valve = new THREE.CylinderGeometry(AIR_DROP_R * 1.8, AIR_DROP_R * 1.8, 0.18, 10);
      valve.translate(t, dropBottomY, rowZ);
      b.metal.push(valve);
      continue;
    }

    // --- ท่อหลักอยู่ในทางเดิน: หาเครื่องจริงตัวที่ตำแหน่งนี้ควรไปหา -----------
    const target = nearestMachineAt(t);
    if (!target) {
      // ไม่มีเครื่องให้ไปหาตรงนี้ (ช่องว่างระหว่างเครื่อง/โซนว่าง) — เว้นแขนง
      // ไว้เฉย ๆ ปล่อยแค่ขาตั้งแนวดิ่งที่ปิดจุกไว้เหนือทางเดิน (จุดต่อสำรอง
      // ในอนาคต) แทนที่จะเดาว่าต้องไปหาเครื่องไหน
      const dropH = headerY - defaultDropBottomY;
      if (dropH <= 0.05) continue;
      b.metal.push(box(t, defaultDropBottomY, rowZ, AIR_DROP_R * 2, dropH, AIR_DROP_R * 2));
      const cap = new THREE.CylinderGeometry(AIR_DROP_R * 1.8, AIR_DROP_R * 1.8, 0.18, 10);
      cap.translate(t, defaultDropBottomY, rowZ);
      b.metal.push(cap);
      continue;
    }

    // จบแขนงที่ "ผิวหน้า" ของเครื่องเป้าหมายฝั่งที่หันเข้าหาทางเดิน (ไม่ใช่
    // กึ่งกลางเครื่อง) บวกระยะเผื่อเล็กน้อยให้วาล์วอยู่นอกกล่องเครื่องจริง
    const { extZ } = machineHalfExtents(target);
    const dir = Math.sign(rowZ - target.z) || 1; // +1 = ทางเดินอยู่ฝั่ง +Z ของเครื่อง
    const faceZ = target.z + dir * extZ;
    const targetZ = faceZ + dir * AIR_BRANCH_FACE_CLEARANCE;

    // ความสูงปลายท่อ: ระดับใช้งานจริงของวาล์ว/FRL ที่คนเอื้อมถึง (~1.5-2 ม.)
    // ไม่ใช่สัดส่วนคงที่ของ headerY อีกต่อไป (ของเดิม 0.55*headerY เคยลงเอย
    // กลางความสูงเตาโดยบังเอิญ) — เผื่อกันไว้ไม่ให้สูงเกินหลังคาเครื่องเตี้ย
    const dropBottomY = Math.max(1.0, Math.min(AIR_DROP_SERVICE_Y, target.height - 0.3));
    const dropH = headerY - dropBottomY;
    if (dropH <= 0.05) continue;

    // ทดสอบเส้นทางแขนงจริง (ไม่ใช่แค่ปลายทาง) กับกล่องเครื่องจักรทุกตัวในแถว
    if (branchHitsAnyMachine(t, rowZ, targetZ, dropBottomY)) continue;

    b.metal.push(box(t, dropBottomY, rowZ, AIR_DROP_R * 2, dropH, AIR_DROP_R * 2));
    const branchCenterZ = (rowZ + targetZ) / 2;
    b.metal.push(
      box(t, dropBottomY - AIR_DROP_R, branchCenterZ, AIR_DROP_R * 2, AIR_DROP_R * 2, Math.abs(targetZ - rowZ))
    );
    const valve = new THREE.CylinderGeometry(AIR_DROP_R * 1.8, AIR_DROP_R * 1.8, 0.18, 10);
    valve.translate(t, dropBottomY, targetZ);
    b.metal.push(valve);
  }
}

/**
 * สถานีไฟฟ้าย่อย (ลานหม้อแปลง + อาคาร MDB) + เครื่องปั่นไฟสำรอง
 * ===========================================================================
 *
 * โรงงานซ่อมบำรุงจริงต้องมี "แนวไฟฟ้าหลัก" ที่มองเห็นได้ — หม้อแปลง ตู้ MDB
 * เครื่องปั่นไฟสำรอง ล้วนเป็นของที่ทีมซ่อมบำรุงต้องดูแลโดยตรง (ตรงกับหัวข้อ
 * งานของแอปนี้พอดี) ยึดแกน X จาก `site.sheds` ชื่อ "TR" จริง (ใน RAW_SHEDS —
 * แถวเดียวกับ INVERTER/MOB./AIR COMP/WATER PUMP ทางทิศเหนือของโรง คือแถว
 * โรงเก็บอุปกรณ์ไฟฟ้า/ระบบของแบบสำรวจจริง "TR" ย่อจาก "หม้อแปลง (Transformer)")
 * ไม่ได้เดาตำแหน่งขึ้นมาเอง — ดู `RAW_SHEDS` ใน `plantSite.ts`
 *
 * ทำไมไม่วางทับตัวโรง "TR" ตรง ๆ: ระยะจริงของโรงนั้นจากผนัง (ตามสัดส่วนแบบ
 * สำรวจ REF_HALL: y0=85,y1=92 ตกห่างผนังเหนือของโรง — REF_HALL.d=74.3 —
 * ราว 10.7-17.7 ม.) บังเอิญตกอยู่ *ในแถบถนนบริการวงรอบพอดี*
 * (`RING_ROAD_GAP`=9 ถึง +`RING_ROAD_W`=8 ม. = แถบ 9-17 ม.) เพราะ
 * `anchorAxis` รักษาระยะจริงจากผนังไว้คงที่ไม่ว่าโรงจะขยายสเกลแค่ไหน — ถ้าปั้น
 * รั้ว/แท่นคอนกรีตทับตำแหน่งโรงเป๊ะจะไปโผล่กลางถนนวงรอบ (กฎห้ามเด็ดขาดของไฟล์
 * นี้ที่เพิ่งแก้บั๊กเสาไปแล้วรอบก่อน) จึงยึดแค่แกน X จากโรงเก็บของจริง (แนว
 * เดียวกับ "TR") แล้วดันแกน Z ออกไปพ้นถนนวงรอบเสมอด้วย `pushOutFrom` ตัวเดียว
 * กับที่ `buildLoadingDock` ใช้ (ดันพ้นถนนวงรอบก่อน แล้วดันต่อถ้ายังทับโรงเก็บ
 * ของ/อาคารจริงตัวอื่นในแนว X เดียวกัน — รวมถึง "TR" เอง)
 *
 * คืน Corridor (พิกัดโลก) ให้ `buildGreenery` เว้นต้นไม้แถวแรก (`TREE_ROWS[0]`
 * = ผนัง +22 ม.) ที่พาดผ่านความลึกของกลุ่มนี้พอดี — เหมือนที่ `buildLoadingDock`
 * ทำกับรถที่ "รอคิว"
 */
const SUBSTATION_SETBACK_MARGIN = 3; // เผื่อพ้นขอบนอกถนนวงรอบ (ม.)
const SUBSTATION_CLEARANCE = 2; // เผื่อพ้นโรงเก็บของ/อาคารจริงที่คาบเกี่ยวแกน X เดียวกัน (ม.)
const YARD_W = 9;
const YARD_D = 8;
const YARD_FENCE_H = 1.8;
/**
 * พื้นแท่นคอนกรีตของลานหม้อแปลง — บั๊กเดียวกับที่ `DOCK_GROUND_Y` เคยแก้แล้ว
 * (คอมเมนต์บรรทัด 677-686): ลานคอนกรีตกลางไซต์ (`PlantShell.tsx` บรรทัด 121,
 * `slabGeometry(0,0,hall.w*1.35,hall.d*1.3,0.09,0.05)`) มีบน = 0.14 และกว้าง
 * ถึง `hall.d*1.3` ในแกน Z (ครึ่งหนึ่ง = `hall.d*0.65`) — ที่ hall ขนาดจริง
 * (~535 ม.) นั่นคือ ±347.75 ม. จากศูนย์กลาง ซึ่งกินพื้นที่เลยตำแหน่งของกลุ่มนี้
 * (ผนัง +20 ถึง +28 ม.) เข้าไปมาก ลานนี้จึง **มีจริงอยู่ใต้แท่นของเรา** ไม่ใช่
 * แค่เลขบังเอิญตรงกัน — เดิมตั้งไว้ 0.15 (เหนือ 0.14 แค่ 0.01 ม.) ทำให้แท่น
 * บางจนภาพสั่น/กะพริบ (z-fighting) เหมือนบั๊กตัวที่สามที่ไฟล์นี้เคยบันทึกไว้
 * ปรับเป็น 0.24 ให้เผื่อระยะจริงเหมือน `DOCK_GROUND_Y` (0.10 ม. เหนือลาน 0.14)
 */
const YARD_PAD_Y = 0.24;
const YARD_PAD_T = 0.05;
const XFMR_TANK_W = 2.6;
const XFMR_TANK_D = 1.6;
const XFMR_TANK_H = 1.7;
const MDB_W = 6;
const MDB_D = 6;
const MDB_H = 4.2;
const MDB_GAP = 4; // ช่องว่างจากขอบลานหม้อแปลงถึงอาคาร MDB ตามแกน X
const GENSET_W = 2.6;
const GENSET_LEN = 7.2;
const GENSET_H = 2.5;
const GENSET_GAP = 4; // ช่องว่างจากขอบลานหม้อแปลงถึงเครื่องปั่นไฟ ตามแกน X

/** ลานหม้อแปลง: รั้วราวกันคอมพาวด์ + แท่นคอนกรีต + หม้อแปลง 2 ลูก (ถังตัวถัง
 *  + บุชชิ่งพอร์ซเลน 3 เฟส + แผงระบายความร้อน) */
function buildTransformerYard(cx: number, cz: number, b: Buckets) {
  // --- รั้วราวกันคอมพาวด์: เสา + ราวบน-ล่าง รอบสี่ด้าน ----------------------
  const rw = YARD_W / 2 - 0.15;
  const rd = YARD_D / 2 - 0.15;
  const corners: Array<[number, number]> = [
    [cx - rw, cz - rd],
    [cx + rw, cz - rd],
    [cx + rw, cz + rd],
    [cx - rw, cz + rd],
  ];
  for (const [px, pz] of corners) b.metal.push(pillar(px, 0.14, pz, 0.06, YARD_FENCE_H, 6));
  const midposts: Array<[number, number]> = [
    [cx, cz - rd],
    [cx, cz + rd],
    [cx - rw, cz],
    [cx + rw, cz],
  ];
  for (const [px, pz] of midposts) b.metal.push(pillar(px, 0.14, pz, 0.05, YARD_FENCE_H, 6));
  for (const railY of [YARD_FENCE_H * 0.42, YARD_FENCE_H * 0.92]) {
    b.metal.push(box(cx, 0.14 + railY, cz - rd, rw * 2 + 0.12, 0.05, 0.05));
    b.metal.push(box(cx, 0.14 + railY, cz + rd, rw * 2 + 0.12, 0.05, 0.05));
    b.metal.push(box(cx - rw, 0.14 + railY, cz, 0.05, 0.05, rd * 2 + 0.12));
    b.metal.push(box(cx + rw, 0.14 + railY, cz, 0.05, 0.05, rd * 2 + 0.12));
  }

  // --- แท่นคอนกรีต (เหนือลานกลางไซต์ 0.01 ม.) -------------------------------
  b.plaza.push(slabGeometry(cx, cz, YARD_W - 1, YARD_D - 1, YARD_PAD_Y, YARD_PAD_T));
  const padTopY = YARD_PAD_Y + YARD_PAD_T;

  // --- หม้อแปลง 2 ลูก เรียงตามแกน X บนแท่น ----------------------------------
  for (const side of [-1, 1]) {
    const tx = cx + side * (YARD_W / 2 - XFMR_TANK_W / 2 - 1.1);
    // ถังตัวถังหม้อแปลง
    b.metal.push(box(tx, padTopY, cz, XFMR_TANK_W, XFMR_TANK_H, XFMR_TANK_D));
    // บุชชิ่งพอร์ซเลนสามเฟส (สีขาวครีมต่างจากตัวถังโลหะ)
    for (let ph = -1; ph <= 1; ph += 1) {
      b.curbWhite.push(pillar(tx + ph * (XFMR_TANK_W * 0.28), padTopY + XFMR_TANK_H, cz, 0.09, 0.55, 8));
    }
    // แผงระบายความร้อน (radiator bank) แนบข้างถังฝั่งนอกลาน
    const radX = tx + side * (XFMR_TANK_W / 2 + 0.22);
    b.metal.push(box(radX, padTopY + 0.15, cz, 0.22, XFMR_TANK_H * 0.72, XFMR_TANK_D * 0.92));
  }
}

/** อาคาร MDB / ห้องสวิตช์: กล่องผนังทึบ หลังคาแบน แผงระบายอากาศบานเกล็ด
 *  (louvre) + บานประตู */
function buildMdbAnnex(cx: number, cz: number, b: Buckets) {
  b.wall.push(box(cx, 0.14, cz, MDB_W, MDB_H, MDB_D));
  b.eave.push(box(cx, 0.14 + MDB_H, cz, MDB_W + 0.6, 0.25, MDB_D + 0.6));

  // --- บานประตูด้านหน้า (หันเข้าหาโรง คือฝั่ง +Z) --------------------------
  const doorW = 1.1;
  b.metal.push(box(cx - MDB_W / 2 + doorW / 2 + 0.4, 0.14, cz + MDB_D / 2 + 0.02, doorW, 2.1, 0.06));

  // --- แผงระบายอากาศบานเกล็ด (louvre) ด้านข้าง ----------------------------
  const louvreX = cx + MDB_W / 2 + 0.03;
  for (let i = 0; i < 6; i += 1) {
    const ly = 0.14 + MDB_H * 0.35 + i * 0.28;
    b.metal.push(box(louvreX, ly, cz, 0.05, 0.05, MDB_D * 0.55));
  }
}

/** เครื่องปั่นไฟสำรองแบบตู้คอนเทนเนอร์ + ปล่องไอเสีย + ถังเชื้อเพลิงประจำวัน */
function buildGenset(cx: number, cz: number, b: Buckets) {
  b.metal.push(box(cx, 0.14, cz, GENSET_LEN, GENSET_H, GENSET_W));
  // ปล่องไอเสียตั้งขึ้นจากหลังคาตู้คอนเทนเนอร์
  b.metal.push(pillar(cx - GENSET_LEN * 0.32, 0.14 + GENSET_H, cz, 0.14, GENSET_H * 0.75, 8));
  // ถังเชื้อเพลิงประจำวัน (day tank) วางเคียงข้างตู้
  const tankX = cx + GENSET_LEN / 2 + 0.9;
  const tank = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 12);
  tank.rotateX(Math.PI / 2);
  tank.translate(tankX, 0.14 + 0.55, cz);
  b.metal.push(tank);
  for (const capX of [tankX - 0.7, tankX + 0.7]) {
    b.metal.push(pillar(capX, 0.14, cz + 0.6, 0.06, 0.3, 6));
    b.metal.push(pillar(capX, 0.14, cz - 0.6, 0.06, 0.3, 6));
  }
}

export function buildSubstation(
  hallD: number,
  sheds: PlantShed[],
  buildings: PlantBuilding[],
  b: Buckets
): Corridor | null {
  // ไม่มีโรงเก็บของ "TR" ให้ยึด (ไม่ควรเกิดขึ้นจริง — มีอยู่เสมอในผังสำรวจ) —
  // ข้ามทั้งกลุ่มแทนที่จะเดาตำแหน่ง ดีกว่าวางลอย ๆ ผิดที่
  const trShed = sheds.find((s) => s.name === "TR");
  if (!trShed) return null;

  const clusterX = trShed.x;
  // กว้างสุดของทั้งกลุ่ม (ลาน + ช่องว่าง + MDB ฝั่งหนึ่ง, ช่องว่าง + ปั่นไฟอีกฝั่ง)
  const halfSpanX = Math.max(
    YARD_W / 2 + MDB_GAP + MDB_W,
    YARD_W / 2 + GENSET_GAP + GENSET_W
  );

  // --- ดันออกพ้นถนนวงรอบก่อน (ขอบนอกถนน = ผนัง + RING_ROAD_GAP + RING_ROAD_W) -
  let farZ = -(hallD / 2 + RING_ROAD_GAP + RING_ROAD_W + SUBSTATION_SETBACK_MARGIN);
  // แล้วดันต่อถ้ายังทับโรงเก็บของ/อาคารจริงตัวอื่นในแนวแกน X เดียวกัน (รวมถึง
  // "TR" เอง ซึ่งระยะจริงจากผนังตกอยู่ในถนนวงรอบพอดี — ดูคอมเมนต์ข้างบนฟังก์ชัน)
  // อาคารจริงมีชายคายื่น 0.4 ม./ด้าน (`inflateBuildingRects`, siteShared.ts)
  // ต่างจากโรงเก็บของที่หลังคาเท่าฐาน — ขยายกล่องอาคารก่อนเช็คกันชน ไม่งั้น
  // ระยะเผื่อที่โค้ดคิดว่าได้จะเหลือน้อยกว่าจริง 0.4 ม. ต่อด้าน (ชายคาไปโผล่ทับ)
  farZ = pushOutFrom(sheds, farZ, clusterX, halfSpanX, SUBSTATION_CLEARANCE);
  farZ = pushOutFrom(inflateBuildingRects(buildings), farZ, clusterX, halfSpanX, SUBSTATION_CLEARANCE);

  const clusterZ = farZ - YARD_D / 2;

  buildTransformerYard(clusterX, clusterZ, b);
  buildMdbAnnex(clusterX + YARD_W / 2 + MDB_GAP + MDB_W / 2, clusterZ, b);
  buildGenset(clusterX - YARD_W / 2 - GENSET_GAP - GENSET_W / 2, clusterZ, b);

  return {
    x0: clusterX - halfSpanX - 1,
    x1: clusterX + halfSpanX + 1,
    z0: farZ - YARD_D - 1,
    z1: farZ + 1,
  };
}

/**
 * ห้องปั๊มลม (compressor room) — คอมเพรสเซอร์ + ถังพักลม + ชุดกรอง/เครื่องอบลม
 * + ผนังระบายอากาศบานเกล็ด
 * ===========================================================================
 *
 * โรงตีขึ้นรูป/อบชุบใช้ลมอัดควบคุมกระบอกสูบ/วาล์วนิวเมติกทุกตัว แต่ฉากเดิมไม่มี
 * อะไรสื่อระบบนี้เลย — `site.sheds` ใน `plantSite.ts` มีโรงเก็บของจริงชื่อ
 * "AIR COMP" อยู่แล้วสองหลัง (แถวเดียวกับ TR ที่ `buildSubstation` ยึด — ทิศ
 * เหนือของโรง) จึงยึดตำแหน่งจากโรงจริงสองหลังนั้นตรง ๆ ไม่ได้เดาขึ้นมาเอง
 *
 * ต่างจาก `buildSubstation` ตรงที่ **ไม่ต้องดันพ้นถนนวงรอบ**: `PlantShell`
 * วาดโรงเก็บของ (4 เสา + หลังคาเอียง) ทับตำแหน่งจริงของ "AIR COMP" อยู่แล้ว
 * และ `buildRingRoad` ก็ตัดช่องถนนเว้นรอบโรงเก็บของทุกหลังอยู่แล้ว (ดู
 * `ringRoadCuts`/`obstacles = [...sheds, ...]`) — ของในฟังก์ชันนี้แค่ตกแต่ง
 * *ข้างใน* โรงที่มีอยู่แล้ว ไม่ได้สร้างที่ตั้งใหม่ จึงไม่ทับถนนซ้ำอีกที และไม่
 * ต้องคืน `Corridor` ให้ `buildGreenery` เว้นด้วย (แนวต้นไม้แถวแรก `TREE_ROWS[0]`
 * เริ่มที่ผนัง +22 ม. — ไกลกว่าระยะจริงของโรงเก็บของแถวนี้ทั้งแถว ~10.7-18.7 ม.
 * จากผนังอยู่แล้ว ต้นไม้จึงตกไม่ถึงตรงนี้ไม่ว่ากรณีใด)
 *
 * จัดของเรียงตาม "แกนยาว" ของโรงเก็บของแต่ละหลัง (`spanAlongX`) แล้วเว้น
 * ระยะจากมุมเข้ามา 20-22% กันโผล่ทับเสาทั้งสี่ต้นที่ `PlantShell` ปักไว้ที่
 * `shed.w/2.4`, `shed.d/2.4` จากศูนย์กลาง — ขนาดของทุกชิ้นเป็นเมตรจริงคงที่
 * (ไม่ผูกกับสเกลไซต์) แต่ตำแหน่งวางเรียงคำนวณเป็นสัดส่วนของขนาดโรงเก็บของจริง
 * แต่ละหลัง จึงพอดีทั้งหลังใหญ่ (15x8 ม.) และหลังเล็ก (8.5x7.5 ม.)
 */
const COMPRESSOR_W = 1.1;
const COMPRESSOR_D = 1.0;
const COMPRESSOR_H = 1.35;
const RECEIVER_R = 0.55;
const RECEIVER_H = 3.0;
const DRYER_W = 1.3;
const DRYER_D = 0.9;
const DRYER_H = 1.6;
const COMP_ROW_GAP = 0.4;

export function buildCompressorRoom(shed: PlantShed, b: Buckets) {
  const spanAlongX = shed.w >= shed.d;
  const longHalf = (spanAlongX ? shed.w : shed.d) / 2;
  const shortHalf = (spanAlongX ? shed.d : shed.w) / 2;
  // เว้นพ้นเสาสี่ต้นของ `PlantShell` (อยู่ที่ ±longHalf/1.2, ±shortHalf/1.2
  // จากศูนย์กลางโดยประมาณ — สูตรเดียวกับ `pillar(shed.x + sx*shed.w/2.4,...)`)
  const alongHalf = longHalf * 0.78;
  const acrossHalf = shortHalf * 0.62;

  // --- เรียงอุปกรณ์ตามแกนยาวแบบ cursor (การันตีไม่ทับกันด้วยลำดับ ไม่ใช่
  //     ตำแหน่งเดา) แล้วปรับสเกลลงถ้าผลรวมกว้างเกินซองที่มีจริง (โรงเล็ก 8.5x7.5
  //     ม. เหลือที่แคบกว่าโรงใหญ่ 15x8 ม. มาก) ---------------------------------
  const items = [
    { key: "receiver" as const, w: RECEIVER_R * 2 },
    { key: "comp1" as const, w: COMPRESSOR_W },
    { key: "comp2" as const, w: COMPRESSOR_W },
    { key: "dryer" as const, w: DRYER_W },
  ];
  const naturalSpan = items.reduce((s, it) => s + it.w, 0) + COMP_ROW_GAP * (items.length - 1);
  const available = alongHalf * 2 * 0.92;
  const scale = naturalSpan > available ? available / naturalSpan : 1;
  const gap = COMP_ROW_GAP * scale;

  const centers: Record<string, number> = {};
  let cursor = -(naturalSpan * scale) / 2;
  for (const it of items) {
    const w = it.w * scale;
    centers[it.key] = cursor + w / 2;
    cursor += w + gap;
  }

  const toWorld = (along: number, across: number): [number, number] =>
    spanAlongX ? [shed.x + along, shed.z + across] : [shed.x + across, shed.z + along];

  const y = 0.14; // พื้นระดับเดียวกับของประกอบไซต์อื่นทุกชิ้น (genset/MDB/หม้อแปลง)

  // --- ถังพักลม (air receiver) — ทรงกระบอกตั้ง + ฝาโค้งบน + แถบเตือนเหลือง ---
  {
    const [cx, cz] = toWorld(centers.receiver, 0);
    const h = Math.min(RECEIVER_H, shed.h - 1.2); // เผื่อพ้นหลังคาโรง ≥1.2 ม.
    const tank = new THREE.CylinderGeometry(RECEIVER_R, RECEIVER_R, h, 12);
    tank.translate(cx, y + h / 2, cz);
    b.metal.push(tank);
    const cap = new THREE.CylinderGeometry(0.05, RECEIVER_R, 0.4, 12);
    cap.translate(cx, y + h, cz);
    b.metal.push(cap);
    const band = new THREE.CylinderGeometry(RECEIVER_R + 0.01, RECEIVER_R + 0.01, 0.22, 12);
    band.translate(cx, y + h * 0.7, cz);
    b.curbYellow.push(band);
  }

  // --- คอมเพรสเซอร์ 2 ชุด (ตัวถัง + ถังมอเตอร์ทรงกระบอกด้านหลัง) ------------
  for (const key of ["comp1", "comp2"] as const) {
    const [cx, cz] = toWorld(centers[key], 0);
    b.metal.push(box(cx, y, cz, COMPRESSOR_W, COMPRESSOR_H, COMPRESSOR_D));
    const motor = new THREE.CylinderGeometry(0.22, 0.22, COMPRESSOR_D * 0.9, 10);
    motor.rotateX(Math.PI / 2);
    motor.translate(cx, y + COMPRESSOR_H * 0.62, cz);
    b.metal.push(motor);
  }

  // --- ชุดกรอง/เครื่องอบลม (dryer/filter skid) — แท่นฐาน + กระบอกกรอง 2 ใบ --
  {
    const [cx, cz] = toWorld(centers.dryer, 0);
    b.metal.push(box(cx, y, cz, DRYER_W, DRYER_H * 0.55, DRYER_D));
    for (const side of [-1, 1]) {
      // offset ตามแกน "ยาว" ของโรงเสมอ (ผ่าน `toWorld`) ไม่ใช่แกน world X ตรง ๆ
      // — ถ้า `spanAlongX` เป็น false (โรงยาวตามแกน Z) offset ต้องไปแกน Z แทน
      const [fx, fz] = toWorld(centers.dryer + side * DRYER_W * 0.22, 0);
      const filter = new THREE.CylinderGeometry(0.16, 0.16, DRYER_H * 0.85, 10);
      filter.translate(fx, y + (DRYER_H * 0.85) / 2, fz);
      b.metal.push(filter);
    }
  }

  // --- ผนังระบายอากาศบานเกล็ด (louvre) — แผงหลังของชุดกรอง ให้ลมร้อนระบาย ---
  {
    const [cx, cz] = toWorld(alongHalf * 0.94, 0);
    const wallH = shed.h * 0.8;
    const wallSpan = acrossHalf * 1.7;
    for (let i = 0; i < 7; i += 1) {
      const ly = y + wallH * 0.12 + (i * wallH * 0.76) / 6;
      const slat = spanAlongX
        ? box(cx, ly, cz, 0.05, 0.05, wallSpan)
        : box(cx, ly, cz, wallSpan, 0.05, 0.05);
      b.metal.push(slat);
    }
  }
}

/**
 * หัวจ่ายน้ำดับเพลิง (fire hydrant) เรียงตามระยะรอบถนนบริการวงรอบ
 * ===========================================================================
 *
 * วางที่แนวเดียวกับคันหินทาลาย (`OUTDOOR_CURB_OFFSET` = ผนัง +5.0 ม.) แต่เยื้อง
 * ออกอีก 1.4 ม. (ผนัง +6.4 ม.) กันซ้อนทับเส้นคันหิน — ยังอยู่ในแถบทางเดินนอก
 * อาคาร/ก่อนถนนวงรอบ (ถนนวงรอบเริ่มที่ +9 ม.) จึงไม่มีทางไปยืนกลางถนนได้
 * ระยะซ้ำหลายสิบต้นรอบไซต์ จึงรวมเข้า bucket เดียวกับของนิ่งอื่น (merged-buffer
 * pattern เดียวกับทั้งไฟล์) ไม่ใช่ mesh แยกต่อต้น
 *
 * เส้นตรงเส้นเดียวรอบไซต์นี้ (offset คงที่ทุกด้าน) พาดผ่านโครงสร้างจริงได้ —
 * ฝั่ง -Z พาดผ่านความลึกของท่ารับ-ส่งของ (ผนัง ~0.8-8.5 ม.) พอดี จึงต้องรับ
 * `exclusions: Corridor[]` แบบเดียวกับที่ `buildGreenery`/`insideCorridor` ใช้
 * กันต้นไม้ทับทางเดิน (ไม่ได้คิดกลไกใหม่) แล้วข้ามจุดที่ตกอยู่ในกล่องกันชนใด ๆ
 */
const HYDRANT_OFFSET = OUTDOOR_CURB_OFFSET + 1.4;
const HYDRANT_SPACING = 55;
const HYDRANT_H = 0.65;

export function buildFireHydrants(hallW: number, hallD: number, b: Buckets, exclusions: Corridor[]) {
  const y = Y_SITE_ROAD + 0.02;
  for (const run of ringStrip(hallW, hallD, HYDRANT_OFFSET, 0.3, false)) {
    const count = Math.max(2, Math.round(run.len / HYDRANT_SPACING));
    for (let i = 0; i < count; i += 1) {
      const t = -run.len / 2 + (run.len * (i + 0.5)) / count;
      const hx = run.alongX ? run.x + t : run.x;
      const hz = run.alongX ? run.z : run.z + t;
      if (insideCorridor(hx, hz, exclusions)) continue;
      b.curbRed.push(pillar(hx, y, hz, 0.11, HYDRANT_H, 8));
      b.curbRed.push(box(hx, y + HYDRANT_H, hz, 0.2, 0.09, 0.2));
      // ท่อจ่ายสองข้าง (hose outlet) ยื่นออกแนวขวางถนน
      const outletAxis = run.alongX ? "z" : "x";
      for (const side of [-1, 1]) {
        const nub = new THREE.CylinderGeometry(0.045, 0.045, 0.22, 6);
        nub.rotateZ(Math.PI / 2);
        if (outletAxis === "x") nub.rotateY(Math.PI / 2);
        nub.translate(
          outletAxis === "x" ? hx + side * 0.16 : hx,
          y + HYDRANT_H * 0.55,
          outletAxis === "z" ? hz + side * 0.16 : hz
        );
        b.metal.push(nub);
      }
    }
  }
  // จำนวนหัวจ่ายที่วางจริงขึ้นกับ hall.w/hall.d รันไทม์ (ระยะห่างคงที่ที่
  // `HYDRANT_SPACING` รอบเส้นรอบวง) ไม่ใช่ค่าคงที่ที่ต้องรายงานทุกครั้งที่
  // เปลี่ยนผัง — เดิมมี `console.info` log ทุกครั้งที่ layout เปลี่ยน ตัดออก
  // เพราะเป็น noise ในโปรดักชัน (ฟังก์ชันนี้ถูกเรียกใน `useMemo` ทุกครั้งที่
  // `layout` เปลี่ยน ไม่ใช่แค่ตอน mount ครั้งเดียว)
}

/**
 * ตู้ถังดับเพลิง/สายฉีดน้ำดับเพลิง (extinguisher / hose-reel cabinet) ใกล้ทาง
 * เข้าอาคารสำนักงาน — ยึดตำแหน่งจาก `officeSites()` (แหล่งข้อมูลเดียวกับที่
 * `buildOfficeBuildings` ใช้วางตัวอาคาร) ไม่เดาตำแหน่งเอง วางเพียงสองจุด
 * ("a couple") ที่หน้าโถงทางเข้าเตี้ยของอาคารนั้น (จุดเดียวกับที่
 * `buildOfficeBuildings` ยื่นโถงกระจกออกมาที่ `az = z + d/2 + 7`, ด้าน
 * `side = 1`) — ไม่ใช่กลางตัวอาคารหลัก จึงอยู่นอกกล่องกันชนของอาคารเอง
 * (`officeFootprints` ที่ผู้เรียกส่งมาใน `exclusions`) และไม่ล้างตัวเองทิ้ง
 */
export function buildFireCabinets(hallW: number, hallD: number, b: Buckets, exclusions: Corridor[]) {
  const sites = officeSites(hallW, hallD);
  const picks = [0, sites.length - 1].filter((i, idx, arr) => arr.indexOf(i) === idx);
  /**
   * เดิมตั้งไว้ 0.16 — เหนือลานปูรอบอาคารสำนักงาน (`b.plaza` ใน
   * `buildOfficeBuildings`, บน 0.15) แค่ 0.01 ม. ซึ่งเป็นบั๊ก "วางชนกันที่ y
   * เดียวกับพื้นผิวอื่น" ตัวที่สี่ของไฟล์นี้ (ตัวที่สามคือ `DOCK_GROUND_Y`/
   * `YARD_PAD_Y` ที่แก้ไปแล้วด้วยระยะเผื่อ 0.10 ม.) ปรับให้เผื่อ 0.10 ม.
   * เท่ากันเพื่อไม่ให้ตู้จมกะพริบ (z-fighting) กับลานปูนี้อีก
   */
  const y = 0.25;

  for (const i of picks) {
    const site = sites[i];
    if (!site) continue;
    // จุดยึด: ข้างโถงทางเข้าเตี้ยฝั่ง side=1 ของอาคารนั้น (ดู `buildOfficeBuildings`
    // — โถงยื่นที่ ax = x + w*0.2, az = z + d/2 + 7, ลึก 13 ม., กระจกหน้าโถงที่
    // az + 6.5) วางตู้ให้พ้นหน้าโถง+กระจกออกไปอีกเล็กน้อย ชัดเจนว่าอยู่นอก
    // ตัวอาคารหลักและนอกโถงทางเข้าเอง
    const cx = site.x + site.w * 0.2 + 1.6;
    const cz = site.z + site.d / 2 + 7 + 6.5 + 0.8;
    if (insideCorridor(cx, cz, exclusions)) continue;
    b.curbRed.push(box(cx, y, cz, 0.7, 1.0, 0.28));
    b.curbWhite.push(box(cx, y + 0.72, cz + 0.15, 0.4, 0.12, 0.03));
    b.curbWhite.push(box(cx, y + 0.5, cz + 0.15, 0.12, 0.4, 0.03));
  }
}

/**
 * ===========================================================================
 * ระบบทำความเย็นและดักฝุ่น/ไอควัน (COOLING & EXTRACTION PLANT)
 * ===========================================================================
 *
 * โรงตีขึ้นรูป/อบชุบระบายความร้อนและฝุ่น/ไอควันออกมาจริง แต่ฉากเดิมไม่มีอะไร
 * สื่อระบบนี้เลย — ตรวจ `RAW_SHEDS`/`RAW_BUILDINGS`/`RAW_TANK_FARMS` ใน
 * `plantSite.ts` ทั้งหมดแล้วไม่มีโรงเก็บของ/อาคารจริงหลังไหนตรงกับ "หอผึ่ง
 * น้ำ (cooling tower)" หรือ "ระบบดักฝุ่น" เลยสักหลัง (ไฟฟ้า/ลมอัด/เก็บของถูก
 * `buildSubstation`/`buildCompressorRoom` ยึดไปหมดแล้ว) — ที่ใกล้เคียงที่สุด
 * คือโรงเก็บของจริงชื่อ "WATER PUMP" ใน `RAW_SHEDS` (แถวเดียวกับ TR/AIR COMP
 * ทางทิศเหนือของโรง, ยังไม่มีฟังก์ชันไหนยึดใช้) — เป็น "โรงปั๊มน้ำ" จริงตามแบบ
 * สำรวจ ตรงกับบทบาทปั๊มน้ำหล่อเย็น/น้ำหมุนเวียนของกลุ่มนี้ (ไม่ใช่ "หอผึ่งน้ำ"
 * ตรงตัว แต่เป็นโรงเก็บของจริงหลังเดียวที่เข้ากับธีม "น้ำ" ของกลุ่มทำความเย็น)
 * จึงยึดกลุ่มนี้จากโรง "WATER PUMP" แทนที่จะเดาตำแหน่งลอย ๆ — ถ้าผังสำรวจไม่มี
 * โรง "WATER PUMP" (ไม่ควรเกิดขึ้นจริง) ข้ามทั้งกลุ่มเงียบ ๆ เหมือน
 * `buildSubstation` ทำตอนไม่มี "TR"
 *
 * ท่อดักฝุ่น/ไอควันหลัก (`buildExtractionDucting`) ยึดเฉพาะแถวตีขึ้นรูป
 * (FRG-A/FRG-B) ไม่ใช่แถวอบชุบ (HT-1..4) — ดู comment ที่ฟังก์ชันนั้นว่าทำไม
 * แถวอบชุบรับบทบาทที่มองเห็นได้ผ่าน `buildExhaustStacks` แทน
 */

const CT_CELL_COUNT = 2; // โจทย์ขอ "2-3 induced-draft cells" — เลือก 2 เซลล์
const CT_CELL_W = 2.6;
const CT_CELL_D = 2.6;
const CT_CELL_GAP = 0.7;
const CT_BASIN_H = 0.3;
const CT_BASIN_OVERHANG = 0.5;
const CT_PLINTH_H = 0.5;
const CT_BODY_H = 3.0;
const CT_FAN_R_BOTTOM = 0.75;
const CT_FAN_R_TOP = 0.95;
const CT_FAN_H = 0.6;
const CT_LOUVRE_SLATS = 6;

const CHILLER_W = 4.5;
const CHILLER_D = 2.0;
const CHILLER_H = 2.0;
const CHILLER_PUMP_R = 0.24;
const CHILLER_PUMP_H = 0.8;
const CHILLER_PIPE_R = 0.14;
const CHILLER_PIPE_LEN = 0.7;

const COLLECTOR_R = 1.0;
const COLLECTOR_HOPPER_H = 1.6;
const COLLECTOR_HOPPER_BOTTOM_R = 0.2;
const COLLECTOR_BODY_H = 2.8;
const COLLECTOR_INLET_FRAC = 0.85; // สัดส่วนความสูงตัวถังที่จุดต่อท่อดักฝุ่นเข้า
const FAN_HOUSING_W = 1.6;
const FAN_HOUSING_D = 1.4;
const FAN_HOUSING_H = 1.5;
const FAN_HOUSING_GAP = 0.6;

const CE_CLUSTER_GAP = 2.0; // ช่องว่างระหว่างกลุ่มย่อยทั้งสาม (หอผึ่ง/ชิลเลอร์/ตัวดักฝุ่น)
const CE_SETBACK_MARGIN = 3; // เผื่อพ้นขอบนอกถนนวงรอบ (ม.) — สูตรเดียวกับ `SUBSTATION_SETBACK_MARGIN`
const CE_CLEARANCE = 2; // เผื่อพ้นโรงเก็บของ/อาคารจริงที่คาบเกี่ยวแกน X เดียวกัน

/** ผลลัพธ์ตำแหน่งของกลุ่มทำความเย็น/ดักฝุ่น — คำนวณครั้งเดียว ใช้ทั้งฟังก์ชัน
 *  วาดกลุ่มเองและฟังก์ชันเดินท่อดักฝุ่นที่ต้องรู้ว่าจะไปจบที่ไหน */
export interface CoolingExtractionAnchor {
  towerX: number;
  chillerX: number;
  collectorX: number;
  clusterZ: number;
  corridor: Corridor;
}

/**
 * หาตำแหน่งกลุ่มทำความเย็น/ดักฝุ่น — ยึดแกน X จากโรงเก็บของจริง "WATER PUMP"
 * (ดู comment หัวบล็อกข้างบน) แล้วดันพ้นถนนวงรอบ + โรงเก็บของ/อาคารจริงอื่น ๆ
 * ที่คาบเกี่ยวแกน X เดียวกัน (รวมถึงโรง "AIR COMP" หลังที่สอง ซึ่งระยะจริงจาก
 * "WATER PUMP" ใกล้กว่าครึ่งความกว้างกลุ่มนี้) ด้วย `pushOutFrom` ตัวเดียวกับที่
 * `buildSubstation`/`buildLoadingDock` ใช้ (ไม่ได้คิดกลไกกันชนใหม่)
 *
 * `otherCorridors` (เช่น `Corridor` ของ `buildSubstation`) ก็ผ่าน
 * `pushOutFrom` ตัวเดียวกันนี้ด้วย — แปลงจาก `{x0,x1,z0,z1}` เป็น rect
 * `{x,z,w,d}` ที่ `pushOutFrom` ต้องการก่อน (`z0` ของ corridor คือขอบไกลสุด
 * จากโรงอยู่แล้ว ตรงกับที่ `pushOutFrom` ใช้ `r.z - r.d/2` พอดี) เดิมฟังก์ชัน
 * นี้เช็คแค่ `sheds`/`buildings` เท่านั้น ระยะห่างจากกลุ่มสถานีไฟฟ้าที่ได้จึง
 * เป็นเรื่องบังเอิญ ไม่ใช่ระยะที่โค้ดการันตี — ผ่าน `otherCorridors` มาแล้ว
 * บังคับระยะเผื่อ `CE_CLEARANCE` จริงเหมือนกับ sheds/buildings ทุกประการ
 */
export function coolingExtractionAnchor(
  hallD: number,
  sheds: PlantShed[],
  buildings: PlantBuilding[],
  otherCorridors: Corridor[] = []
): CoolingExtractionAnchor | null {
  const wpShed = sheds.find((s) => s.name === "WATER PUMP");
  if (!wpShed) return null;

  const clusterX = wpShed.x;
  const towerBankW = CT_CELL_COUNT * CT_CELL_W + (CT_CELL_COUNT - 1) * CT_CELL_GAP;
  const collectorFanW = COLLECTOR_R * 2 + FAN_HOUSING_GAP + FAN_HOUSING_W;
  const naturalSpan = towerBankW + CE_CLUSTER_GAP + CHILLER_W + CE_CLUSTER_GAP + collectorFanW;
  const halfSpanX = naturalSpan / 2 + CT_BASIN_OVERHANG;
  const clusterD = Math.max(CT_CELL_D + CT_BASIN_OVERHANG * 2, CHILLER_D, COLLECTOR_R * 2);

  const otherRects = otherCorridors.map((c) => ({
    x: (c.x0 + c.x1) / 2,
    z: (c.z0 + c.z1) / 2,
    w: c.x1 - c.x0,
    d: c.z1 - c.z0,
  }));

  // --- ดันออกพ้นถนนวงรอบก่อน แล้วดันต่อถ้ายังทับโรงเก็บของ/อาคารจริง/กลุ่ม
  // สิ่งปลูกสร้างอื่นที่ผู้เรียกส่งมา (เช่นกลุ่มสถานีไฟฟ้า) — กรณี X ทับกันจริง
  // (`pushOutFrom` เช็ค overlap แกน X ก่อนดันแกน Z) ---------------------------
  let farZ = -(hallD / 2 + RING_ROAD_GAP + RING_ROAD_W + CE_SETBACK_MARGIN);
  farZ = pushOutFrom(sheds, farZ, clusterX, halfSpanX, CE_CLEARANCE);
  // อาคารจริงมีชายคายื่น 0.4 ม./ด้าน (`inflateBuildingRects`, siteShared.ts) —
  // ขยายกล่องก่อนเช็คกันชนเหมือนที่ `buildSubstation`/`fireWaterAnchor` ทำ
  farZ = pushOutFrom(inflateBuildingRects(buildings), farZ, clusterX, halfSpanX, CE_CLEARANCE);
  farZ = pushOutFrom(otherRects, farZ, clusterX, halfSpanX, CE_CLEARANCE);
  const clusterZ = farZ - clusterD / 2;

  // --- ดันแกน X ออกจากกลุ่มอื่น (เช่นสถานีไฟฟ้า) ถ้าแนว Z ของทั้งสองกลุ่มคาบ
  // เกี่ยวกันจริงและระยะห่างแกน X ปัจจุบันน้อยกว่า `CE_CLEARANCE` — เดิมกลุ่มนี้
  // เช็คแค่แกน Z (`pushOutFrom` ข้างบน) ระยะห่างจริงจากกลุ่มสถานีไฟฟ้าที่เคย
  // วัดได้ (~3.45 ม. ขอบต่อขอบ) จึงเป็นเรื่องบังเอิญของตำแหน่งโรงเก็บของสอง
  // หลัง ("WATER PUMP" กับ "TR") ไม่ใช่ระยะที่โค้ดการันตี — เพิ่มเช็คแกน X นี้
  // เพื่อบังคับระยะเผื่อขั้นต่ำจริง ไม่ว่าตำแหน่งโรงเก็บของจะขยับแค่ไหนทีหลัง
  const finalClusterX = pushOutFromX(otherRects, clusterX, halfSpanX + 1, clusterZ, clusterD / 2 + 1, CE_CLEARANCE);

  let cursor = -naturalSpan / 2;
  const towerX = finalClusterX + cursor + towerBankW / 2;
  cursor += towerBankW + CE_CLUSTER_GAP;
  const chillerX = finalClusterX + cursor + CHILLER_W / 2;
  cursor += CHILLER_W + CE_CLUSTER_GAP;
  const collectorX = finalClusterX + cursor + collectorFanW / 2;

  return {
    towerX,
    chillerX,
    collectorX,
    clusterZ,
    corridor: {
      x0: finalClusterX - halfSpanX - 1,
      x1: finalClusterX + halfSpanX + 1,
      z0: clusterZ - clusterD / 2 - 1,
      z1: clusterZ + clusterD / 2 + 1,
    },
  };
}

/**
 * ดันแกน X ออกจากกลุ่มสิ่งปลูกสร้างอื่น (`rects`) ถ้าแนว Z ของทั้งสองฝั่ง
 * คาบเกี่ยวกันจริง (`overlapsZ`) และระยะห่างแกน X ปัจจุบันน้อยกว่า
 * `clearance` — คู่กับ `pushOutFrom` ที่ดันแกน Z เมื่อ X คาบเกี่ยว ฟังก์ชันนี้
 * ดันแกน X เมื่อ Z คาบเกี่ยวแทน (สถานการณ์ที่วัดได้จริงของกลุ่มนี้กับกลุ่ม
 * สถานีไฟฟ้า — ทั้งคู่ตกอยู่ในแถบ Z ใกล้เคียงกันเพราะสูตรร่นระยะจากถนนวงรอบ
 * เดียวกัน แต่ห่างกันแค่แกน X เพราะยึดจากคนละโรงเก็บของ) — ไม่ได้คิดกลไกกันชน
 * ใหม่ทั้งหมด แค่สลับแกนของ `pushOutFrom` เดิม
 */
function pushOutFromX(
  rects: Array<{ x: number; z: number; w: number; d: number }>,
  centerX: number,
  halfSpanX: number,
  centerZ: number,
  halfSpanZ: number,
  clearance: number
): number {
  let x = centerX;
  for (const r of rects) {
    const overlapsZ = centerZ - halfSpanZ < r.z + r.d / 2 && centerZ + halfSpanZ > r.z - r.d / 2;
    if (!overlapsZ) continue;
    const gap = Math.abs(x - r.x) - halfSpanX - r.w / 2;
    if (gap >= clearance) continue;
    const dir = Math.sign(x - r.x) || 1;
    x = r.x + dir * (r.w / 2 + halfSpanX + clearance);
  }
  return x;
}

/** หอผึ่งน้ำหนึ่งเซลล์ (induced-draft cooling tower cell) — บ่อรับน้ำ (basin)
 *  + แท่นคอนกรีต (plinth) + ตัวเรือนผนังบานเกล็ดระบายลม (louvre) + พัดลมดูด
 *  อากาศปากบานบนหลังคา */
function buildCoolingTowerCell(cx: number, cz: number, b: Buckets) {
  const basinY = 0.14;
  b.metal.push(box(cx, basinY, cz, CT_CELL_W + CT_BASIN_OVERHANG * 2, CT_BASIN_H, CT_CELL_D + CT_BASIN_OVERHANG * 2));
  const plinthY = basinY + CT_BASIN_H;
  b.metal.push(box(cx, plinthY, cz, CT_CELL_W, CT_PLINTH_H, CT_CELL_D));
  const bodyY = plinthY + CT_PLINTH_H;
  b.wall.push(box(cx, bodyY, cz, CT_CELL_W, CT_BODY_H, CT_CELL_D));
  // แผงบานเกล็ด (louvre) สองด้านยาวของตัวเรือน
  for (const side of [-1, 1]) {
    const lx = cx + (side * CT_CELL_W) / 2 + side * 0.03;
    for (let i = 0; i < CT_LOUVRE_SLATS; i += 1) {
      const ly = bodyY + (CT_BODY_H * (i + 0.5)) / CT_LOUVRE_SLATS;
      b.metal.push(box(lx, ly, cz, 0.05, 0.12, CT_CELL_D * 0.85));
    }
  }
  const fanY = bodyY + CT_BODY_H;
  const cowl = new THREE.CylinderGeometry(CT_FAN_R_TOP, CT_FAN_R_BOTTOM, CT_FAN_H, 12);
  cowl.translate(cx, fanY + CT_FAN_H / 2, cz);
  b.metal.push(cowl);
  // ใบพัดดูดอากาศ (fan) มองเห็นลอดปากบาน
  const blade = new THREE.CylinderGeometry(CT_FAN_R_BOTTOM * 0.7, 0.05, 0.06, 8);
  blade.translate(cx, fanY + 0.06, cz);
  b.metal.push(blade);
}

function buildCoolingTowerBank(bankCx: number, cz: number, b: Buckets) {
  const bankW = CT_CELL_COUNT * CT_CELL_W + (CT_CELL_COUNT - 1) * CT_CELL_GAP;
  let cursor = bankCx - bankW / 2;
  for (let i = 0; i < CT_CELL_COUNT; i += 1) {
    const cx = cursor + CT_CELL_W / 2;
    buildCoolingTowerCell(cx, cz, b);
    cursor += CT_CELL_W + CT_CELL_GAP;
  }
}

/** ชุดชิลเลอร์/น้ำหมุนเวียน (packaged chiller + process-water skid) — ตัวถัง
 *  แพ็กเกจ + ครีบคอนเดนเซอร์ + ปั๊มน้ำ 2 ชุด + ตอท่อ (pipe stub) หันเข้าหา
 *  หอผึ่งน้ำ */
function buildChillerSkid(cx: number, cz: number, b: Buckets) {
  const y = 0.14;
  b.metal.push(box(cx, y, cz, CHILLER_W, CHILLER_H, CHILLER_D));
  for (let i = -2; i <= 2; i += 1) {
    b.metal.push(box(cx + i * (CHILLER_W / 6), y + CHILLER_H, cz, 0.05, 0.15, CHILLER_D * 0.9));
  }
  const pumpZ = cz + CHILLER_D / 2 + CHILLER_PUMP_R + 0.15;
  for (const side of [-1, 1]) {
    const px = cx + side * CHILLER_W * 0.22;
    const pump = new THREE.CylinderGeometry(CHILLER_PUMP_R, CHILLER_PUMP_R, CHILLER_PUMP_H, 10);
    pump.translate(px, y + CHILLER_PUMP_H / 2, pumpZ);
    b.metal.push(pump);
  }
  // ตอท่อ (pipe stub) ยื่นออกฝั่งหอผึ่งน้ำ (-X) — supply/return
  for (const dz of [-0.4, 0.4]) {
    const stub = new THREE.CylinderGeometry(CHILLER_PIPE_R, CHILLER_PIPE_R, CHILLER_PIPE_LEN, 8);
    stub.rotateZ(Math.PI / 2);
    stub.translate(cx - CHILLER_W / 2 - CHILLER_PIPE_LEN / 2, y + CHILLER_H * 0.4, cz + dz);
    b.metal.push(stub);
  }
}

/** ตัวดักฝุ่น/ไอควัน (cyclone/baghouse) — ฮอปเปอร์กรวยล่าง + ตัวถังทรงกระบอก
 *  + ฝาโค้งบน + เรือนพัดลมดูดข้างตัว (พร้อมตอท่อเชื่อมตัวถัง) */
function buildDustCollector(cx: number, cz: number, b: Buckets) {
  const y = 0.14;
  const hopper = new THREE.CylinderGeometry(COLLECTOR_R, COLLECTOR_HOPPER_BOTTOM_R, COLLECTOR_HOPPER_H, 12);
  hopper.translate(cx, y + COLLECTOR_HOPPER_H / 2, cz);
  b.metal.push(hopper);
  const bodyY = y + COLLECTOR_HOPPER_H;
  const body = new THREE.CylinderGeometry(COLLECTOR_R, COLLECTOR_R, COLLECTOR_BODY_H, 14);
  body.translate(cx, bodyY + COLLECTOR_BODY_H / 2, cz);
  b.metal.push(body);
  const cap = new THREE.CylinderGeometry(0.06, COLLECTOR_R, 0.35, 14);
  cap.translate(cx, bodyY + COLLECTOR_BODY_H, cz);
  b.metal.push(cap);

  const fanCx = cx + COLLECTOR_R + FAN_HOUSING_GAP + FAN_HOUSING_W / 2;
  b.metal.push(box(fanCx, y, cz, FAN_HOUSING_W, FAN_HOUSING_H, FAN_HOUSING_D));
  const snout = new THREE.CylinderGeometry(0.22, 0.22, FAN_HOUSING_GAP + 0.1, 8);
  snout.rotateZ(Math.PI / 2);
  snout.translate(cx + COLLECTOR_R + FAN_HOUSING_GAP / 2, y + FAN_HOUSING_H * 0.6, cz);
  b.metal.push(snout);
}

/** ความสูงจุดต่อท่อดักฝุ่นจริงบนตัวถังตัวดักฝุ่น (ดู `buildDustCollector`) —
 *  แยกฟังก์ชันจากตัวเลขคงที่ เพราะ `buildExtractionDucting` ต้องคำนวณจุดจบ
 *  ท่อให้ตรงกับที่ `buildDustCollector` วาดจริงเป๊ะ ไม่ใช่เดาตัวเลขซ้ำ */
function collectorInletY(): number {
  const bodyY = 0.14 + COLLECTOR_HOPPER_H;
  return bodyY + COLLECTOR_BODY_H * COLLECTOR_INLET_FRAC;
}

/** วาดกลุ่มทำความเย็น/ดักฝุ่นทั้งชุดจากตำแหน่งที่ `coolingExtractionAnchor`
 *  คำนวณไว้ คืน `Corridor` เดียวกับที่เก็บไว้ใน anchor ให้ผู้เรียกรวมเข้ากับ
 *  รายการกันชนของต้นไม้/หัวจ่ายน้ำดับเพลิง เหมือน `buildSubstation` */
export function buildCoolingExtractionPlant(anchor: CoolingExtractionAnchor, b: Buckets): Corridor {
  buildCoolingTowerBank(anchor.towerX, anchor.clusterZ, b);
  buildChillerSkid(anchor.chillerX, anchor.clusterZ, b);
  buildDustCollector(anchor.collectorX, anchor.clusterZ, b);
  return anchor.corridor;
}

/**
 * ท่อดักฝุ่น/ไอควันหลัก (large-diameter extraction duct) จากแถวตีขึ้นรูป
 * (FRG-A/FRG-B) ออกไปหาตัวดักฝุ่นนอกอาคาร (`coolingExtractionAnchor`)
 * ===========================================================================
 *
 * ยึดเฉพาะแถวตีขึ้นรูป ไม่ใช่แถวอบชุบ (HT-1..4): แถวตีขึ้นรูปอยู่ใน "row A"
 * ของ `plantLayout.ts` — แถวเดียวกับ WH ที่ติดผนังทิศเหนือจริง (แถวเดียวกับ
 * โรงเก็บของ "WATER PUMP"/"TR"/"AIR COMP" ที่กลุ่มนี้และกลุ่มไฟฟ้า/ลมอัดยึด
 * อยู่แล้ว) จึงเดินท่อออกจากแถวนี้ตรงไปผนังได้โดยพิสูจน์ได้ว่าไม่ทับเครื่อง
 * ส่วนแถวอบชุบ (row B) ถูกคั่นด้วยช่องทางเดินระหว่างแถวและแถวตีขึ้นรูปเองก่อน
 * ถึงผนัง — จะลากท่อจากแถวอบชุบทะลุแถวตีขึ้นรูปไปผนังได้ต้องเช็คชนกับเครื่อง
 * จักรในแถวตีขึ้นรูปด้วย ซึ่งไม่มีข้อมูล aisle ของแถวนั้นให้ใช้ตรงนี้อย่าง
 * ปลอดภัย (คนละเรียกกับ `buildAirHeaderRun` ที่ยึดทีละแถวอิสระ) — ข้ามการ
 * เชื่อมตรงจากแถวอบชุบไปเลยดีกว่าเดาเส้นทางทะลุเครื่อง แถวอบชุบรับบทบาทที่
 * มองเห็นได้ผ่าน `buildExhaustStacks` แทน (ปล่องทะลุหลังคาเหนือโซนอบชุบ
 * โดยตรง ไม่ต้องเดินท่อผ่านแถวอื่น)
 *
 * เส้นทาง: หา "ทางเดินฝั่งกำแพง" ข้างแถวเครื่องจักรจริงด้วย
 * `pickWallSideAisleZ` (คนละฟังก์ชันกับ `pickAisleZ` ที่ `buildAirHeaderRun`
 * ใช้ — `pickAisleZ` เลือกฝั่งที่ margin กว้างกว่าซึ่งอาจเป็นฝั่งลึกเข้าไปใน
 * โรงก็ได้ ใช้ไม่ได้กับงานนี้ที่ต้อง "ออกฝั่งกำแพงเสมอ" จึงเขียนใหม่เฉพาะ
 * ฝั่งกำแพง (`zoneZ0`/`minZ` เท่านั้น) แต่ยังใช้ค่าคงที่ `AISLE_CLEARANCE`/
 * `AISLE_MIN_MARGIN` ชุดเดียวกัน — ไม่มี margin ฝั่งกำแพงพอจริง ก็ข้ามทั้งท่อ
 * แทนเดาเส้นทางทะลุเครื่อง) แล้ววิ่งออกจากแถว (-Z) ทะลุเขตขอบอาคาร
 * (`HALL_PERIMETER` ว่างเสมอ — ดู plantLayout.ts) ผ่านถนนวงรอบ (ยกสูงพ้น
 * ถนน ไม่ใช่โครงสร้างยืนพื้นในถนน) ไปเลี้ยวแกน X เข้าหาตัวดักฝุ่น แล้วลด
 * ระดับลงจุดต่อจริง (`collectorInletY`)
 *
 * ความสูงคำนวณสดจาก `hallHeight` เสมอ (`ductRunY`) — ไม่ชนท่อลมอัด (เผื่อ
 * `DUCT_VERTICAL_SEP` เหนือผิวบนท่อลมอัดจริง) ไม่ชนเชิงชาย (เผื่อ
 * `DUCT_EAVE_MARGIN`) ไม่ชนราวเก็บของ/เครื่องจักร (อยู่ข้างแถว ไม่ใช่เหนือแถว
 * — เหตุผลเดียวกับที่ `buildAirHeaderRun` เลือกใช้ทางเดินแทนการพาดเหนือเครื่อง)
 * ไม่ผ่านเหนือกลุ่มทำความเย็น/ดักฝุ่นชนอะไร — โครงสร้างพื้นดินสูงสุดของกลุ่ม
 * นั้น (ตัวดักฝุ่น ~4.9 ม.) ต่ำกว่าระดับท่อ (~7.7 ม.) มาก ก่อนจะลดระดับลง
 * แนวดิ่งตรงจุดต่อจริงเท่านั้น
 *
 * ขาตั้งพื้น (trestle leg) ช่วงนอกอาคาร 2 ต้น ยึดจาก `RING_ROAD_GAP`/
 * `RING_ROAD_W` เสมอ (ไม่ hardcode ตำแหน่ง) — ต้นแรกกึ่งกลางช่วงผนัง-ขอบถนน
 * ใกล้ (~9 ม.), ต้นสองกึ่งกลางช่วงขอบถนนไกล-กลุ่มดักฝุ่น (~5 ม. ถ้ามีช่วงจริง)
 * ทั้งคู่จึงตกนอกแถบถนนวงรอบเสมอไม่ว่า `RING_ROAD_GAP`/`RING_ROAD_W` จะเปลี่ยน
 * ทีหลังแค่ไหน ตัวท่อเองยังคงลอยพ้นแถบถนนตลอดเส้นทาง (ขาไม่ได้ปักกลางถนน)
 * ช่วงในอาคาร (aisleZ ถึงผนัง) มีตัวแขวนจากเชิงชายทุกระยะ `bay` เหมือน
 * `buildAirHeaderRun` เพื่อความสม่ำเสมอ (ดูโค้ดด้านล่าง)
 */
const DUCT_R = 0.28; // เส้นผ่านศูนย์กลาง 0.56 ม. — 2 เท่าของท่อลมอัด (0.28 ม. Ø) ให้อ่านออกว่า "ใหญ่กว่า"
const DUCT_VERTICAL_SEP = 0.1;
const DUCT_EAVE_MARGIN = 0.05;

/**
 * เพดานท่อดักฝุ่น — ดึง `headerY` จริงของแถวตีขึ้นรูปจาก `computeAirHeaderY`
 * ตัวเดียวกับที่ `buildAirHeaderRun` ใช้จริง (ไม่ใช่สูตรคู่ขนานแยกจากกันอีก
 * ต่อไป — ของเดิมคำนวณจาก `WAREHOUSE_RACKING_H`/`AIR_HEADER_CLEARANCE_ABOVE_RACKING`
 * ตรง ๆ ซึ่งบังเอิญตรงกับ `headerY` จริงเฉพาะตอนแถวว่างเครื่องจักร — ถ้ามี
 * เครื่องจริงมาลงจนดัน `headerY` สูงขึ้นผ่าน `machineConstrainsHeader` สูตรนี้
 * จะตามไม่ทันและท่อดักฝุ่นจะวิ่งต่ำกว่าท่อลมอัดจริงจนชนกัน — ดูรอยเดียวกับที่
 * `eaveYOf()` แก้ไปแล้ว) วัดจาก "ผิวบนท่อลมอัดจริง" (`headerY + AIR_HEADER_R`)
 * เผื่อ `DUCT_VERTICAL_SEP` แล้วบวกรัศมีท่อดักฝุ่นเอง ก่อน cap ไม่ให้ทะลุเชิงชาย
 */
function ductRunY(forgingZones: PlantZone[], hallHeight: number, machines: PlacedMachine[]): number {
  const { headerY } = computeAirHeaderY(forgingZones, hallHeight, machines);
  const headerTop = headerY + AIR_HEADER_R;
  const desired = headerTop + DUCT_VERTICAL_SEP + DUCT_R;
  const eaveY = eaveYOf(hallHeight);
  const cap = eaveY - DUCT_R - DUCT_EAVE_MARGIN;
  return Math.min(desired, cap);
}

/** เช็คชนจริงของช่วงท่อดักฝุ่นที่ตำแหน่ง X คงที่ `x` พาดจาก `z0` ถึง `z1` ที่
 *  ความสูง `y` กับกล่องขอบเขตเครื่องจักรจริงทุกตัวในแถว (สูตรเดียวกับ
 *  `branchHitsAnyMachine` ใน `buildAirHeaderRun` — คัดลอกมาเพราะฟังก์ชันนั้น
 *  เป็น closure ภายในไม่ export) วันนี้แถวตีขึ้นรูปว่างเครื่องจักรจึงไม่มีอะไร
 *  ให้ชน (inert) แต่ต้องมีเช็คจริงไว้เผื่อมีเครื่องมาลงแถวนี้ในอนาคต — ไม่ใช่
 *  แค่ "เชื่อว่าอยู่เหนือเครื่อง" ลอย ๆ */
function ductRunHitsAnyMachine(x: number, z0: number, z1: number, y: number, rowMachines: PlacedMachine[]): boolean {
  const zLo = Math.min(z0, z1);
  const zHi = Math.max(z0, z1);
  for (const m of rowMachines) {
    if (y > m.height) continue; // ท่อผ่านเหนือหลังคาเครื่องจริง ไม่ชน
    const { extX, extZ } = machineHalfExtents(m);
    if (Math.abs(x - m.x) >= extX) continue;
    if (zLo < m.z + extZ && zHi > m.z - extZ) return true;
  }
  return false;
}

/** หาตำแหน่ง Z ของ "ทางเดินฝั่งกำแพง" (เสมอฝั่ง `zoneZ0`/มินิมัม Z ของโซน —
 *  ฝั่งเดียวกับที่แถวตีขึ้นรูปติดผนังจริง) ที่ไม่ทับเครื่องจักรตัวไหนเลยจริง
 *  (margin ≥ `AISLE_MIN_MARGIN` เหมือนกฎเดียวกับ `pickAisleZ`) คืน `null`
 *  เมื่อไม่มี margin พอจริง ๆ ให้ผู้เรียกข้ามทั้งระบบแทนเดา */
function pickWallSideAisleZ(zones: PlantZone[], rowMachines: PlacedMachine[]): number | null {
  const zoneZ0 = Math.min(...zones.map((z) => z.z - z.d / 2));
  if (rowMachines.length === 0) return zoneZ0 + AISLE_CLEARANCE;
  let minZ = Infinity;
  for (const m of rowMachines) {
    const { extZ } = machineHalfExtents(m);
    minZ = Math.min(minZ, m.z - extZ);
  }
  const marginNear = minZ - zoneZ0;
  if (marginNear < AISLE_MIN_MARGIN) return null;
  return minZ - AISLE_CLEARANCE;
}

const DUCT_LEG_W = 0.14;
const DUCT_HANGER_W = 0.06;

export function buildExtractionDucting(
  forgingZones: PlantZone[],
  hallHeight: number,
  hallD: number,
  bay: number,
  machines: PlacedMachine[],
  anchor: CoolingExtractionAnchor,
  b: Buckets
) {
  if (forgingZones.length === 0) return;
  const zoneIds = new Set(forgingZones.map((z) => z.id));
  const rowMachines = machines.filter((m) => zoneIds.has(m.zoneId));
  const aisleZ = pickWallSideAisleZ(forgingZones, rowMachines);
  if (aisleZ === null) return; // ไม่มีทางเดินฝั่งกำแพงให้ใช้จริง — ข้ามดีกว่าเดาเส้นทางทะลุเครื่อง

  const zoneMinX = Math.min(...forgingZones.map((z) => z.x - z.w / 2));
  const zoneMaxX = Math.max(...forgingZones.map((z) => z.x + z.w / 2));
  const exitX = Math.min(Math.max(anchor.collectorX, zoneMinX), zoneMaxX);

  const y = ductRunY(forgingZones, hallHeight, machines);
  const collectorZ = anchor.clusterZ;

  // เช็คชนจริงกับกล่องขอบเขตเครื่องจักรทุกตัวในแถว (ไม่ใช่แค่ "เชื่อว่าอยู่
  // เหนือเครื่อง") ก่อนวาดท่อนที่ 1 — วันนี้แถวว่างเครื่องจักรจึง inert แต่ต้อง
  // เช็คไว้เผื่อมีเครื่องมาลงแถวนี้ในอนาคตแล้วดัน `y` ให้ต่ำกว่าหลังคาเครื่อง
  if (ductRunHitsAnyMachine(exitX, aisleZ, collectorZ, y, rowMachines)) return;

  // ท่อนที่ 1: จากทางเดินฝั่งกำแพงในแถวตีขึ้นรูป วิ่งออก -Z ทะลุขอบอาคาร +
  // ถนนวงรอบ ไปจนถึงแนว Z ของกลุ่มดักฝุ่น
  const runLen1 = aisleZ - collectorZ;
  if (runLen1 > 0.1) {
    b.metal.push(box(exitX, y - DUCT_R, (aisleZ + collectorZ) / 2, DUCT_R * 2, DUCT_R * 2, runLen1));
  }

  // --- ตัวแขวนช่วงในอาคาร (aisleZ -> ผนัง) จากจันทัน/เชิงชาย เหมือนที่
  // `buildAirHeaderRun` ทำกับท่อลมอัด (ตัวแขวนทุกระยะ `bay` จริง) — ของเดิม
  // ไม่มีตัวแขวนเลยทั้งช่วงในอาคาร ในขณะที่ท่อลมอัดข้าง ๆ มี ทำให้ไม่สอดคล้อง
  // กัน (ระบุใน review) เพิ่มให้เหมือนกันเพื่อความสม่ำเสมอ -----------------------
  const wallZ = -hallD / 2;
  const eaveY = eaveYOf(hallHeight);
  const hangerBaseY = y + DUCT_R;
  const hangerLen = eaveY - hangerBaseY;
  const indoorLen = aisleZ - wallZ;
  if (hangerLen >= AIR_HANGER_MIN_LEN && indoorLen > 0.1) {
    const frames = Math.max(1, Math.round(indoorLen / bay));
    for (let f = 0; f <= frames; f += 1) {
      const z = aisleZ - (indoorLen * f) / frames;
      b.metal.push(box(exitX, hangerBaseY, z, DUCT_HANGER_W, hangerLen, DUCT_HANGER_W));
    }
  }

  // --- ขาตั้งพื้น (trestle leg) ช่วงนอกอาคาร — ยึดตำแหน่งจาก `RING_ROAD_GAP`/
  // `RING_ROAD_W` เสมอ (ไม่ hardcode) ให้ตกนอกแถบถนนวงรอบเสมอไม่ว่าค่าคงที่
  // สองตัวนั้นจะเปลี่ยนทีหลังแค่ไหน: ขาที่ 1 กึ่งกลางช่วงผนัง-ขอบถนนใกล้
  // (~`RING_ROAD_GAP`/2 พ้นผนัง) ขาที่ 2 กึ่งกลางช่วงขอบถนนไกล-กลุ่มดักฝุ่น
  // (มีก็ต่อเมื่อช่วงนั้นเป็นบวกจริง — ไม่มีก็ข้ามขาที่ 2 ไปเฉย ๆ) -------------
  const roadNearZ = wallZ - RING_ROAD_GAP;
  const roadFarZ = wallZ - RING_ROAD_GAP - RING_ROAD_W;
  const legH = y - DUCT_R - 0.14;
  if (legH > 0.1) {
    const legAZ = (wallZ + roadNearZ) / 2;
    b.metal.push(box(exitX, 0.14, legAZ, DUCT_LEG_W, legH, DUCT_LEG_W));
    if (anchor.corridor.z1 < roadFarZ) {
      const legBZ = (roadFarZ + anchor.corridor.z1) / 2;
      b.metal.push(box(exitX, 0.14, legBZ, DUCT_LEG_W, legH, DUCT_LEG_W));
    }
  }

  // ท่อนที่ 2: เลี้ยวแกน X ที่ระดับความสูงเดียวกัน เข้าหาตัวดักฝุ่น
  const runLen2 = Math.abs(anchor.collectorX - exitX);
  if (runLen2 > 0.1) {
    b.metal.push(box((anchor.collectorX + exitX) / 2, y - DUCT_R, collectorZ, runLen2, DUCT_R * 2, DUCT_R * 2));
  }

  // ท่อนที่ 3: ลดระดับลงจุดต่อจริงบนตัวถังตัวดักฝุ่น
  const inletY = collectorInletY();
  const dropH = y - inletY;
  if (dropH > 0.1) {
    b.metal.push(box(anchor.collectorX, inletY, collectorZ, DUCT_R * 2, dropH, DUCT_R * 2));
  }
}

/**
 * ปล่องระบายไอความร้อน/ไอน้ำ (exhaust stack) ทะลุแนวหลังคาเหนือโซนอบชุบ
 * (HT-1..4) โดยตรง — ไม่ต้องเดินท่อผ่านผนัง (ดู comment ที่
 * `buildExtractionDucting` ว่าทำไม): ฐานปล่องเริ่มที่ระดับเชิงชาย
 * (`eaveYOf`) แล้วชูขึ้นไปอีก `STACK_RISE` พ้นสันหลังคา (`ridgeRise` ของ
 * `buildLineHalls` ที่ `siteIndoorInfra.ts`, ~0.12 ของความสูงโรง — งานนี้
 * ขอ extract แค่ `eaveY` เท่านั้น จึงไม่ดึงค่านั้นมาใช้ตรง ๆ) ที่ hall.h=10.5
 * (ค่าคงที่จริงเสมอ — `scaleSiteTo` ใน plantSite.ts ไม่ scale ความสูงตาม
 * ขนาดโรง ดู `REF_HALL`): eave=8.19 ม., สันหลังคา≈8.19+10.5*0.12=9.45 ม.
 * ฐานปล่อง (เหนือปลอกคอ `STACK_COLLAR_H`=0.25 ม.) = 8.19+0.25=8.44 ม., ยอด
 * ปล่อง = 8.44+`STACK_RISE`(3.5)=11.94 ม. → พ้นสันหลังคา 11.94-9.45=2.49 ม.
 * (เดิมเขียนไว้ 11.69/2.24 ม. โดยลืมบวกความสูงปลอกคอ 0.25 ม. — แก้เป็นตัวเลข
 * ที่ตรงกับโค้ดจริงแล้ว) ชัดเจนว่า "ทะลุหลังคา"
 * ไม่ใช่แค่ชนสัน — ช่วงล่างของปล่อง (8.19-8.94 ม. ตามช่วงที่แผ่นหลังคาจริง
 * อยู่) ซ้อนทับเนื้อแผ่นหลังคาที่มีอยู่แล้วโดยเจตนา (อ่านเป็น "ปล่องยื่นทะลุ
 * แผ่นหลังคาจริง" เหมือนของจริง ไม่ใช่บั๊ก — เรขาคณิตทั้งสองไม่ใช่ระนาบขนาน
 * กันจึงไม่มี z-fighting) ตำแหน่ง X/Z ยึดจากกล่องขอบเขตโซนอบชุบจริงเสมอ
 *
 * ความสูงเครื่องจักรสูงสุดในแถวนี้ (เตาอบชุบ `HEIGHT.furnace`=7.6 ม.) ต่ำกว่า
 * ฐานปล่อง (8.19 ม.) อยู่ 0.59 ม. เสมอ (ตัวเลขเดียวกับที่ `buildAirHeaderRun`
 * บันทึกไว้ตอนเลือกย้ายท่อลมอัดออกจากเหนือแถวนี้) — ปล่องจึงไม่มีทางชนหลังคา
 * เตาไม่ว่าจะยืนตรง X ไหนในแถว
 */
const STACK_R = 0.4;
const STACK_RISE = 3.5;
const STACK_COLLAR_R = 0.55;
const STACK_COLLAR_H = 0.25;
const STACK_CAP_H = 0.5;
const STACK_COUNT = 2;

export function buildExhaustStacks(heatZones: PlantZone[], hallHeight: number, b: Buckets) {
  if (heatZones.length === 0) return;
  const eaveY = eaveYOf(hallHeight);
  const zoneMinX = Math.min(...heatZones.map((z) => z.x - z.w / 2));
  const zoneMaxX = Math.max(...heatZones.map((z) => z.x + z.w / 2));
  const zCenter = heatZones.reduce((s, z) => s + z.z, 0) / heatZones.length;

  for (let i = 0; i < STACK_COUNT; i += 1) {
    const frac = (i + 1) / (STACK_COUNT + 1);
    const x = zoneMinX + (zoneMaxX - zoneMinX) * frac;

    const collar = new THREE.CylinderGeometry(STACK_COLLAR_R, STACK_COLLAR_R, STACK_COLLAR_H, 12);
    collar.translate(x, eaveY + STACK_COLLAR_H / 2, zCenter);
    b.metal.push(collar);

    const stackTop = eaveY + STACK_COLLAR_H + STACK_RISE;
    b.metal.push(pillar(x, eaveY + STACK_COLLAR_H, zCenter, STACK_R, STACK_RISE, 12));

    const cap = new THREE.CylinderGeometry(0.06, STACK_COLLAR_R, STACK_CAP_H, 12);
    cap.translate(x, stackTop + STACK_CAP_H / 2, zCenter);
    b.metal.push(cap);
  }
}

/**
 * ===========================================================================
 * ระบบเก็บสำรองน้ำ/น้ำดับเพลิง (WATER STORAGE & FIRE-WATER SUPPLY)
 * ===========================================================================
 *
 * ไซต์มีบ่อบำบัด (`siteEntrance.ts`, ปลายทางน้ำทิ้ง) และวงแหวนหัวจ่ายน้ำ
 * ดับเพลิง (`buildFireHydrants`, wall+6.4 ม.) อยู่แล้ว แต่ไม่มีอะไรสื่อว่าน้ำ
 * ที่จ่ายเข้าหัวจ่ายเหล่านั้น "มาจากไหน" เลย — ตรวจ `RAW_SHEDS`/
 * `RAW_BUILDINGS`/`RAW_TANK_FARMS` ทั้งหมดใน `plantSite.ts` อีกครั้งแล้วพบว่า
 * มีโรงเก็บของจริงชื่อ "WATER PUMP" อยู่ **สองหลัง**:
 *   1. ใน `RAW_SHEDS` (แถวเดียวกับ TR/AIR COMP ทางทิศเหนือ) — หลังนี้ถูก
 *      `coolingExtractionAnchor`/`buildCoolingExtractionPlant` ยึดไปแล้วตั้งแต่
 *      ฟีเจอร์ก่อนหน้า (ปั๊มน้ำหล่อเย็น/น้ำหมุนเวียนของระบบทำความเย็น) — **ห้าม
 *      ยึดซ้ำ** ตามที่โจทย์เตือนไว้ชัดเจน
 *   2. ใน `RAW_BUILDINGS` (x0=3.9,x1=14.0,y0=-69.1,y1=-61.5 — คนละตำแหน่งกับ
 *      หลังแรกโดยสิ้นเชิง อยู่ฝั่งใต้ของโรง ใกล้ป้อมยาม/บ่อบำบัด/ตาชั่งรถบรรทุก
 *      ไม่ใช่แถวเหนือ) — หลังนี้ถูก `PlantShell.tsx` วาดเป็นกล่องอาคารทั่วไป
 *      (จาก `site.buildings`) อยู่แล้วเหมือน GUARD HOUSE/TRAINING CENTER แต่
 *      **ไม่มีฟังก์ชันไหนในไฟล์นี้ยึดใช้เลย** — grep "WATER PUMP" ทั้งโปรเจกต์
 *      ก่อนแก้ (ดูรายงาน PR) ยืนยันว่ามีแค่หลังแรกเท่านั้นที่ถูกอ้างถึง
 * จึงยึดกลุ่มนี้จากอาคารจริงหลังที่สอง — สมเหตุสมผลกับบทบาท "โรงปั๊มน้ำ" ของ
 * ระบบเก็บสำรองน้ำ/น้ำดับเพลิงพอดี (คนละบทบาทกับปั๊มน้ำหล่อเย็นของหลังแรก) ไม่
 * ต้องเดาตำแหน่งลอย ๆ เหมือนบ่อบำบัดที่ทำก่อนหน้า
 *
 * อาคารนี้อยู่ **ฝั่งใต้ของโรง (+Z)** ตรงข้ามกับกลุ่มสถานีไฟฟ้า/ทำความเย็นที่
 * ยึดโรงเก็บของฝั่งเหนือ (-Z) — พ้นถนนวงรอบฝั่งใต้อยู่แล้วจริงตามข้อมูลสำรวจ
 * (ระยะจริงจากผนัง ~65 ม. > wall+17 ที่ถนนวงรอบจบ) แต่ยังคำนวณ clamp พ้นถนน
 * วงรอบซ้ำใน `fireWaterAnchor` ด้วย (เหมือน `buildSubstation`) กันกรณีข้อมูล
 * สำรวจเปลี่ยนทีหลังจนระยะจริงนั้นสั้นลง — ไม่ใช่แค่เชื่อว่า "คงไกลพอ" เฉย ๆ
 *
 * `pushOutFrom`/`pushOutFromX` เดิมดันแกน Z ไปทาง **ลบ** (ฝั่งเหนือ) เท่านั้น
 * — กลุ่มนี้อยู่ฝั่งใต้ (Z เป็นบวก มากขึ้น = ออกนอกไซต์มากขึ้น) จึงต้องมีตัวดัน
 * แกน Z ไปทาง **บวก** แทน (`pushOutFromFarZ` ด้านล่าง — สลับทิศของ
 * `pushOutFrom` เดิมเท่านั้น เหมือนที่ `pushOutFromX` สลับแกนไปแล้วก่อนหน้านี้
 * ไม่ได้คิดกลไกกันชนใหม่ทั้งหมด)
 */

const FW_SETBACK_MARGIN = 3; // เผื่อพ้นขอบนอกถนนวงรอบ (ม.) — สูตรเดียวกับ `SUBSTATION_SETBACK_MARGIN`
const FW_CLUSTER_GAP = 2.5; // ช่องว่างระหว่างกลุ่มย่อยสามกลุ่มตามแกน Z (ม.)
const FW_CLEARANCE = 2; // เผื่อพ้นโรงเก็บของ/อาคารจริง/กลุ่มอื่นที่คาบเกี่ยวแกน X

// --- ถังเก็บน้ำดิบ/น้ำใช้กระบวนการ (raw/process water storage tanks) --------
const WT_TANK_COUNT = 3;
const WT_TANK_R = 1.3;
const WT_TANK_H = 5.0;
const WT_TANK_GAP = 1.3;
const WT_PLINTH_H = 0.35;
const WT_LADDER_RUNGS = 9;
const WT_LADDER_W = 0.4;
const WT_LADDER_STANDOFF = 0.14;
const WT_CAGE_HOOPS = 3;
const WT_BUND_MARGIN = 0.9; // ระยะจากผิวถังวงนอกสุดถึงผนังบ่อกันรั่ว (bund)
const WT_BUND_H = 0.45;
const WT_BUND_T = 0.14;

// --- ถังสำรองน้ำดับเพลิง + โรงปั๊ม (fire-water tank + pump house) ----------
const FW_TANK_R = 1.9;
const FW_TANK_H = 6.5;
const FW_TANK_PLINTH_H = 0.35;
const FW_GAP = 2; // ช่องว่างจากถังสำรองน้ำดับเพลิงถึงโรงปั๊ม ตามแกน X
const PH_W = 3.6;
const PH_D = 3.0;
const PH_H = 2.8;

// --- หอถังน้ำยกสูง (elevated water tower) -----------------------------------
const TW_LEG_SPAN = 3.0; // ด้านสี่เหลี่ยมของฐานขาตั้ง
const TW_LEG_R = 0.16;
const TW_LEG_H = 8.0;
const TW_BRACE_LEVELS = [0.4, 0.78]; // สัดส่วนความสูงขาที่มีคานยึดขวาง (X-brace แบบกรอบ)
const TW_TANK_R_BOTTOM = 0.55;
const TW_TANK_R_TOP = 1.9;
const TW_TANK_H = 3.2;
const TW_CAP_H = 0.6;

// --- ท่อเชื่อมกลุ่ม (connecting pipework) ------------------------------------
const PIPE_R = 0.14;
const PIPE_Y = 0.55;
const VALVE_LEN = 0.22;
const HYDRANT_TIE_LEN = 6; // ความยาวท่อแยกไปทางวงแหวนหัวจ่ายน้ำ (สัญลักษณ์ ไม่ได้ต่อยาวจริงถึง)

/**
 * เหมือน `pushOutFrom` (`siteShared.ts`) ทุกประการ แต่ดันแกน Z ไปทาง "ออกนอก
 * ไซต์ฝั่งใต้" (+Z, ค่ามากขึ้น) แทนฝั่งเหนือ (-Z) — กลุ่มนี้ยึดจากอาคาร
 * "WATER PUMP" (RAW_BUILDINGS) ที่อยู่ฝั่งใต้ของโรง ตรงข้ามกับกลุ่มสถานีไฟฟ้า/
 * ทำความเย็นที่ยึดจากโรงเก็บของฝั่งเหนือ — ไม่ได้คิดกลไกกันชนใหม่ แค่สลับทิศ
 * ของ `pushOutFrom` เดิม (เหมือนที่ `pushOutFromX` สลับแกนไปแล้วรอบก่อน)
 */
function pushOutFromFarZ(
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
    const far = r.z + r.d / 2; // ขอบไกลจากโรงที่สุดของสิ่งปลูกสร้างนั้น (ฝั่งใต้)
    const candidate = far + clearance;
    if (candidate > z) z = candidate;
  }
  return z;
}

/** ผลลัพธ์ตำแหน่งของกลุ่มเก็บสำรองน้ำ/น้ำดับเพลิง — คำนวณครั้งเดียว ใช้ทั้ง
 *  ฟังก์ชันวาดกลุ่มเองและ Corridor กันชนที่ต้องคืนออกไป */
export interface FireWaterAnchor {
  tankBankX: number;
  tankBankZ: number;
  fireTankX: number;
  fireTankZ: number;
  pumpHouseX: number;
  towerX: number;
  towerZ: number;
  corridor: Corridor;
}

/**
 * หาตำแหน่งกลุ่มเก็บสำรองน้ำ/น้ำดับเพลิง — ยึดแกน X จากอาคารจริง "WATER PUMP"
 * ใน `RAW_BUILDINGS` (ดู comment หัวบล็อกข้างบน) แต่ **ไม่ยึดแกน Z ตามอาคารนั้น**
 * (ของเดิมเอา `Math.max(...,wpBuilding.z+wpBuilding.d/2+margin)` ทำให้กลุ่ม
 * ทั้งชุดถูกลากออกไปถึง wall+71 ม. เพราะอาคารจริงหลังนี้อยู่ไกลผิดปกติ — ไกล
 * กว่าแนวถนนวงรอบ/แถวต้นไม้/กลุ่มอื่นทุกกลุ่มเกือบสองเท่า จนเดี่ยวโดดออกไปนอก
 * ลานคอนกรีตบางส่วน ไม่ใช่ทางแก้ที่ถูก): แกน Z จึงคำนวณจากถนนวงรอบ + margin
 * ตรง ๆ แบบเดียวกับ `buildSubstation` (`farZ = wall + RING_ROAD_GAP +
 * RING_ROAD_W + margin`) ให้กลุ่มนี้ตกอยู่แถบเดียวกับกลุ่มอื่น (wall+20 ม.
 * ขึ้นไป) แทนที่จะไล่ตามอาคารที่อยู่ไกลเกินไป
 *
 * ที่แถบ wall+20 นี้ อาคารจริง "OFFICE / STORE F/G" (คาบเกี่ยว Z ตั้งแต่
 * wall+21.5 ถึง wall+54) ดันบังเอิญอยู่ X ใกล้เคียงกับอาคาร "WATER PUMP" มาก —
 * ถ้าดันแกน Z ต่อให้พ้นอาคารนี้ (เหมือนที่เคยทำกับตัวอาคาร "WATER PUMP" เอง)
 * กลุ่มจะถูกลากออกไปไกลเกินแถบ wall+20-40 อีกครั้ง จึง **ไม่ดันแกน Z ผ่าน
 * `buildings` เลย** ปล่อยให้ `pushOutFromX` ด้านล่าง (เดียวกับที่
 * `coolingExtractionAnchor` ใช้) จัดการกรณีนี้แทนด้วยการดันแกน X หนีออกจาก
 * อาคารที่คาบเกี่ยวแทน — ระยะห่างจากอาคารทุกหลังในแถบนี้จึงมาจากการ "เลี่ยง
 * ข้าง" ไม่ใช่ "ถอยหลัง" (`sheds`/`otherCorridors` ยังผ่าน `pushOutFromFarZ`
 * อยู่เพื่อความสมบูรณ์ แต่ทั้งคู่อยู่ฝั่งเหนือของโรง (Z ติดลบ) จึงเป็นแค่การ
 * เผื่อไว้เฉย ๆ ไม่มีผลจริงที่แถบ Z บวกนี้ — ดูตัวเลขจริงในรายงาน PR)
 *
 * อาคาร (`RAW_BUILDINGS`) มีชายคายื่นเกินกล่องขอบเขตจริง 0.4 ม. ทุกด้าน
 * (`BUILDING_EAVE_OVERHANG`, siteShared.ts — ที่มาคือ `PlantShell.tsx:235`:
 * `box(...,building.w+0.8,...,building.d+0.8)` ผ่าน `b.beam`) ต่างจากโรงเก็บของ
 * (`RAW_SHEDS`) ที่หลังคาเท่าฐานเป๊ะไม่มียื่น — จึงขยายกล่องอาคารทุกหลังด้วย
 * `inflateBuildingRects` (`buildingRects` ด้านล่าง) ก่อนส่งเข้า `pushOutFromX`
 * กันชนคำนวณตัดที่ตัวอาคารเปลือย ๆ แล้วชายคาไปโผล่ทับจริง
 */
export function fireWaterAnchor(
  hallD: number,
  sheds: PlantShed[],
  buildings: PlantBuilding[],
  otherCorridors: Corridor[] = []
): FireWaterAnchor | null {
  const wpBuilding = buildings.find((bd) => bd.name === "WATER PUMP" && bd.z > 0);
  if (!wpBuilding) return null;

  const clusterX = wpBuilding.x;

  const bankW = WT_TANK_COUNT * WT_TANK_R * 2 + (WT_TANK_COUNT - 1) * WT_TANK_GAP;
  const bankHalfW = bankW / 2 + WT_BUND_MARGIN + WT_BUND_T;
  const bankD = WT_TANK_R * 2 + (WT_BUND_MARGIN + WT_BUND_T) * 2;

  const fireGroupHalfW = Math.max(FW_GAP / 2 + FW_TANK_R * 2, FW_GAP / 2 + PH_W);
  const fireGroupD = Math.max(FW_TANK_R * 2, PH_D);

  const towerHalfW = TW_LEG_SPAN / 2 + TW_LEG_R + 0.3;
  const towerD = TW_LEG_SPAN + TW_LEG_R * 2 + 0.6;

  const halfSpanX = Math.max(bankHalfW, fireGroupHalfW, towerHalfW);
  const clusterD = bankD + FW_CLUSTER_GAP + fireGroupD + FW_CLUSTER_GAP + towerD;

  const otherRects = otherCorridors.map((c) => ({
    x: (c.x0 + c.x1) / 2,
    z: (c.z0 + c.z1) / 2,
    w: c.x1 - c.x0,
    d: c.z1 - c.z0,
  }));
  // อาคารจริงมีชายคายื่น 0.4 ม./ด้าน (ดู comment ข้างบน) — ขยายกล่องก่อนใช้
  // เช็คกันชนทุกที่ (สเหด "RAW_SHEDS" ไม่มียื่น จึงไม่ต้องขยาย)
  const buildingRects = inflateBuildingRects(buildings);

  // --- ดันออกพ้นถนนวงรอบฝั่งใต้เท่านั้น (สูตรเดียวกับ `buildSubstation`) —
  // ไม่ไล่ตามตำแหน่ง Z ของอาคาร "WATER PUMP" เอง (ดู comment หัวฟังก์ชัน) ---
  let nearZ = hallD / 2 + RING_ROAD_GAP + RING_ROAD_W + FW_SETBACK_MARGIN;
  // `sheds`/`otherRects` (ท่ารับ-ส่งของ/สถานีไฟฟ้า/ทำความเย็น) อยู่ฝั่งเหนือ
  // (Z ติดลบ) ทั้งหมดที่ scale จริงวันนี้ — สองบรรทัดนี้จึงเป็น no-op เสมอที่
  // ตำแหน่งปัจจุบัน (`far = r.z + r.d/2` ติดลบ ไม่มีทาง > nearZ ที่เป็นบวก) แต่
  // คงไว้เผื่อข้อมูลสำรวจเปลี่ยนทีหลังจนมีอะไรมาอยู่ฝั่งใต้ใกล้แถบนี้จริง
  nearZ = pushOutFromFarZ(sheds, nearZ, clusterX, halfSpanX, FW_CLEARANCE);
  nearZ = pushOutFromFarZ(otherRects, nearZ, clusterX, halfSpanX, FW_CLEARANCE);

  const clusterZ = nearZ + clusterD / 2;

  // --- ดันแกน X หนีอาคารจริงอื่นที่คาบเกี่ยวแกน Z เดียวกัน (ใช้งานจริงที่นี่ —
  // "OFFICE / STORE F/G" คาบเกี่ยวทั้ง X และ Z กับตำแหน่งตั้งต้น ดู comment
  // หัวฟังก์ชัน) — `sheds`/`otherRects` ยังผ่านด้วยเพื่อความสมบูรณ์ (no-op ที่
  // ตำแหน่งปัจจุบัน เหตุผลเดียวกับข้างบน) -----------------------------------
  const finalClusterX = pushOutFromX(
    [...sheds, ...buildingRects, ...otherRects],
    clusterX,
    halfSpanX + 1,
    clusterZ,
    clusterD / 2 + 1,
    FW_CLEARANCE
  );

  let cursor = nearZ;
  const tankBankZ = cursor + bankD / 2;
  cursor += bankD + FW_CLUSTER_GAP;
  const fireGroupZ = cursor + fireGroupD / 2;
  cursor += fireGroupD + FW_CLUSTER_GAP;
  const towerZ = cursor + towerD / 2;

  return {
    tankBankX: finalClusterX,
    tankBankZ,
    fireTankX: finalClusterX - (FW_GAP / 2 + FW_TANK_R),
    fireTankZ: fireGroupZ,
    pumpHouseX: finalClusterX + (FW_GAP / 2 + PH_W / 2),
    towerX: finalClusterX,
    towerZ,
    corridor: {
      x0: finalClusterX - halfSpanX - 1,
      x1: finalClusterX + halfSpanX + 1,
      z0: nearZ - 1,
      z1: nearZ + clusterD + 1,
    },
  };
}

/** ถังเก็บน้ำดิบ/น้ำใช้กระบวนการ 2-3 ใบ บนแท่นคอนกรีต + บันได/กรงบันไดบนถัง
 *  ใบแรก + หัวต่อ/ช่องเปิดบนหลังคาถังทุกใบ + ผนังบ่อกันรั่ว (bund) ล้อมกลุ่ม */
function buildWaterStorageTanks(cx: number, cz: number, b: Buckets) {
  const y = 0.14;
  const bankW = WT_TANK_COUNT * WT_TANK_R * 2 + (WT_TANK_COUNT - 1) * WT_TANK_GAP;
  const start = cx - bankW / 2 + WT_TANK_R;

  for (let i = 0; i < WT_TANK_COUNT; i += 1) {
    const tx = start + i * (WT_TANK_R * 2 + WT_TANK_GAP);

    const plinth = new THREE.CylinderGeometry(WT_TANK_R + 0.08, WT_TANK_R + 0.08, WT_PLINTH_H, 16);
    plinth.translate(tx, y + WT_PLINTH_H / 2, cz);
    b.metal.push(plinth);

    const bodyY = y + WT_PLINTH_H;
    const tank = new THREE.CylinderGeometry(WT_TANK_R, WT_TANK_R, WT_TANK_H, 16);
    tank.translate(tx, bodyY + WT_TANK_H / 2, cz);
    b.metal.push(tank);

    const dome = new THREE.CylinderGeometry(0.08, WT_TANK_R, 0.5, 16);
    dome.translate(tx, bodyY + WT_TANK_H, cz);
    b.metal.push(dome);

    // หัวต่อ/ช่องเปิดบนหลังคาถัง (top nozzle/manway)
    for (const nOff of [-WT_TANK_R * 0.35, WT_TANK_R * 0.35]) {
      const nozzle = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 8);
      nozzle.translate(tx + nOff, bodyY + WT_TANK_H + 0.35, cz);
      b.metal.push(nozzle);
    }

    // แถบเตือนเหลืองรอบตัวถัง (เหมือนถังพักลมที่ `buildCompressorRoom`)
    const band = new THREE.CylinderGeometry(WT_TANK_R + 0.01, WT_TANK_R + 0.01, 0.22, 16);
    band.translate(tx, bodyY + WT_TANK_H * 0.15, cz);
    b.curbYellow.push(band);

    // ถังใบแรก (i===0) มีบันได + กรงบันได ด้านหน้ากลุ่ม (+Z) ให้ปีนขึ้นตรวจ
    if (i === 0) {
      const ladderZ = cz + WT_TANK_R + WT_LADDER_STANDOFF;
      for (const rOff of [-WT_LADDER_W / 2, WT_LADDER_W / 2]) {
        const rail = box(tx + rOff, bodyY, ladderZ, 0.05, WT_TANK_H, 0.05);
        b.metal.push(rail);
      }
      for (let r = 0; r < WT_LADDER_RUNGS; r += 1) {
        const ry = bodyY + (WT_TANK_H * (r + 0.5)) / WT_LADDER_RUNGS;
        b.metal.push(box(tx, ry, ladderZ, WT_LADDER_W, 0.04, 0.04));
      }
      for (let h = 0; h < WT_CAGE_HOOPS; h += 1) {
        const hy = bodyY + (WT_TANK_H * (h + 1)) / (WT_CAGE_HOOPS + 1);
        const hoop = new THREE.TorusGeometry(WT_LADDER_W / 2 + 0.05, 0.025, 6, 12, Math.PI);
        hoop.rotateY(Math.PI / 2);
        hoop.translate(tx, hy, ladderZ + WT_LADDER_W / 2 + 0.05);
        b.metal.push(hoop);
      }
    }
  }

  // --- ผนังบ่อกันรั่ว (bund wall) ล้อมกลุ่มถังต่ำ ๆ สี่ด้าน --------------------
  const bundHalfW = bankW / 2 + WT_BUND_MARGIN;
  const bundHalfD = WT_TANK_R + WT_BUND_MARGIN;
  for (const side of [-1, 1]) {
    b.wall.push(box(cx, y, cz + side * bundHalfD, bundHalfW * 2 + WT_BUND_T * 2, WT_BUND_H, WT_BUND_T));
    b.wall.push(box(cx + side * bundHalfW, y, cz, WT_BUND_T, WT_BUND_H, bundHalfD * 2 + WT_BUND_T * 2));
  }
}

/** ถังสำรองน้ำดับเพลิงหนึ่งใบ (dedicated fire-water reserve) — ใหญ่กว่าถังน้ำ
 *  ใช้กระบวนการ ทาแถบแดงรอบตัวถังให้อ่านออกว่าเป็น "สำรองน้ำดับเพลิง" ต่างจาก
 *  น้ำดิบ/น้ำใช้กระบวนการ + ตอท่อยื่นเข้าหาโรงปั๊มข้าง ๆ */
function buildFireWaterTank(cx: number, cz: number, b: Buckets) {
  const y = 0.14;
  const plinth = new THREE.CylinderGeometry(FW_TANK_R + 0.1, FW_TANK_R + 0.1, FW_TANK_PLINTH_H, 18);
  plinth.translate(cx, y + FW_TANK_PLINTH_H / 2, cz);
  b.metal.push(plinth);

  const bodyY = y + FW_TANK_PLINTH_H;
  const tank = new THREE.CylinderGeometry(FW_TANK_R, FW_TANK_R, FW_TANK_H, 18);
  tank.translate(cx, bodyY + FW_TANK_H / 2, cz);
  b.metal.push(tank);

  const dome = new THREE.CylinderGeometry(0.08, FW_TANK_R, 0.55, 18);
  dome.translate(cx, bodyY + FW_TANK_H, cz);
  b.metal.push(dome);

  const nozzle = new THREE.CylinderGeometry(0.1, 0.1, 0.32, 8);
  nozzle.translate(cx, bodyY + FW_TANK_H + 0.35, cz);
  b.metal.push(nozzle);

  // แถบแดง "น้ำสำรองดับเพลิง" — สองแถบ (บน/ล่างตัวถัง) ต่างจากแถบเหลืองเดี่ยว
  // ของถังน้ำใช้กระบวนการ ให้อ่านออกว่าเป็นคนละบทบาทกันตั้งแต่ไกล
  for (const frac of [0.2, 0.8]) {
    const band = new THREE.CylinderGeometry(FW_TANK_R + 0.01, FW_TANK_R + 0.01, 0.22, 18);
    band.translate(cx, bodyY + FW_TANK_H * frac, cz);
    b.curbRed.push(band);
  }
}

/** โรงปั๊มขนาดเล็กข้างถังสำรองน้ำดับเพลิง — ผนังทึบ หลังคาแบน บานประตูหน้า +
 *  แผงระบายอากาศบานเกล็ด (louvre) ข้าง — โครงเดียวกับ `buildMdbAnnex` */
function buildPumpHouse(cx: number, cz: number, b: Buckets) {
  const y = 0.14;
  b.wall.push(box(cx, y, cz, PH_W, PH_H, PH_D));
  b.eave.push(box(cx, y + PH_H, cz, PH_W + 0.6, 0.25, PH_D + 0.6));

  // บานประตูหน้า (หันเข้าหากลุ่มถัง คือฝั่ง -X)
  const doorW = 1.1;
  b.metal.push(box(cx - PH_W / 2 - 0.02, y, cz - PH_D / 2 + doorW / 2 + 0.4, 0.06, 2.1, doorW));

  // แผงระบายอากาศบานเกล็ด (louvre) ด้านข้าง (+Z)
  const louvreZ = cz + PH_D / 2 + 0.03;
  for (let i = 0; i < 6; i += 1) {
    const ly = y + PH_H * 0.35 + i * 0.28;
    b.metal.push(box(cx, ly, louvreZ, PH_W * 0.55, 0.05, 0.05));
  }
}

/** หอถังน้ำยกสูง (elevated water tower) — ทรงกระบอก/กรวยบนขาตั้งสี่ขา พร้อม
 *  คานยึดขวางสองระดับ — เรียบง่ายตามที่โจทย์ขอ ("a cylinder or frustum on
 *  4 braced legs") ให้เป็นซิลูเอตคลาสสิกของโรงงานที่มองเห็นพ้นหลังคา */
function buildWaterTower(cx: number, cz: number, b: Buckets) {
  const y = 0.14;
  const half = TW_LEG_SPAN / 2;
  const legCorners: Array<[number, number]> = [
    [cx - half, cz - half],
    [cx + half, cz - half],
    [cx + half, cz + half],
    [cx - half, cz + half],
  ];
  for (const [lx, lz] of legCorners) b.metal.push(pillar(lx, y, lz, TW_LEG_R, TW_LEG_H, 10));

  // คานยึดขวาง (bracing frame) สองระดับ รอบสี่ด้าน กันขาโยก
  for (const frac of TW_BRACE_LEVELS) {
    const by = y + TW_LEG_H * frac;
    b.metal.push(box(cx, by, cz - half, TW_LEG_SPAN + 0.1, 0.08, 0.08));
    b.metal.push(box(cx, by, cz + half, TW_LEG_SPAN + 0.1, 0.08, 0.08));
    b.metal.push(box(cx - half, by, cz, 0.08, 0.08, TW_LEG_SPAN + 0.1));
    b.metal.push(box(cx + half, by, cz, 0.08, 0.08, TW_LEG_SPAN + 0.1));
  }

  // ตัวถังทรงกรวยคว่ำ (frustum) บนขาตั้ง + ฝาปิดบน
  const tankY = y + TW_LEG_H;
  const tank = new THREE.CylinderGeometry(TW_TANK_R_TOP, TW_TANK_R_BOTTOM, TW_TANK_H, 18);
  tank.translate(cx, tankY + TW_TANK_H / 2, cz);
  b.metal.push(tank);
  const cap = new THREE.CylinderGeometry(0.1, TW_TANK_R_TOP, TW_CAP_H, 18);
  cap.translate(cx, tankY + TW_TANK_H, cz);
  b.metal.push(cap);
}

/** ท่อเชื่อมกลุ่ม (connecting pipework) — ท่อหลักลอยเหนือพื้นเล็กน้อยพาดตาม
 *  แนวแกน Z ผ่านทั้งสามกลุ่มย่อย (ถังน้ำใช้กระบวนการ -> ถังสำรองน้ำดับเพลิง/
 *  โรงปั๊ม -> หอถังน้ำ) พร้อมวาล์ว/หน้าแปลนที่จุดต่อ แล้วมีท่อแยกสั้น ๆ จากโรง
 *  ปั๊มมุ่งเข้าหาตัวโรง (ทิศทางของวงแหวนหัวจ่ายน้ำดับเพลิง) — ไม่ได้ลากยาวจริง
 *  ถึงวงแหวน (~60 ม.) แค่สื่อทิศทางเชื่อมต่อ ("Keep it modest" ตามโจทย์) */
function buildConnectingPipework(anchor: FireWaterAnchor, b: Buckets) {
  const runZ = (z0: number, z1: number, x: number) => {
    const len = Math.abs(z1 - z0);
    if (len < 0.05) return;
    const pipe = new THREE.CylinderGeometry(PIPE_R, PIPE_R, len, 10);
    pipe.rotateX(Math.PI / 2);
    pipe.translate(x, PIPE_Y, (z0 + z1) / 2);
    b.metal.push(pipe);
  };
  const jointAt = (x: number, z: number) => {
    const valve = new THREE.CylinderGeometry(PIPE_R * 1.7, PIPE_R * 1.7, VALVE_LEN, 10);
    valve.rotateX(Math.PI / 2);
    valve.translate(x, PIPE_Y, z);
    b.metal.push(valve);
    const flange = new THREE.CylinderGeometry(PIPE_R * 1.35, PIPE_R * 1.35, 0.04, 10);
    flange.rotateX(Math.PI / 2);
    flange.translate(x, PIPE_Y, z + VALVE_LEN / 2 + 0.03);
    b.metal.push(flange);
  };

  // ท่อหลักตามแนวกลุ่ม (ถังน้ำใช้กระบวนการ -> กลุ่มถังดับเพลิง/โรงปั๊ม -> หอถังน้ำ)
  runZ(anchor.tankBankZ, anchor.fireTankZ, anchor.tankBankX);
  jointAt(anchor.tankBankX, anchor.fireTankZ - (anchor.fireTankZ - anchor.tankBankZ) / 2);
  runZ(anchor.fireTankZ, anchor.towerZ, anchor.towerX);
  jointAt(anchor.towerX, anchor.fireTankZ + (anchor.towerZ - anchor.fireTankZ) / 2);

  // ท่อขวางสั้น ๆ จากแนวหลักไปหาถังสำรองน้ำดับเพลิง/โรงปั๊ม (ที่เยื้องแกน X)
  const crossPipe = new THREE.CylinderGeometry(PIPE_R, PIPE_R, Math.abs(anchor.pumpHouseX - anchor.fireTankX), 10);
  crossPipe.rotateZ(Math.PI / 2);
  crossPipe.translate((anchor.fireTankX + anchor.pumpHouseX) / 2, PIPE_Y, anchor.fireTankZ);
  b.metal.push(crossPipe);

  // ท่อแยกสั้น ๆ จากโรงปั๊มมุ่งเข้าหาตัวโรง (-Z ทิศทางวงแหวนหัวจ่ายน้ำดับเพลิง)
  const tieZ0 = anchor.fireTankZ - PH_D / 2;
  const tieZ1 = tieZ0 - HYDRANT_TIE_LEN;
  runZ(tieZ0, tieZ1, anchor.pumpHouseX);
  jointAt(anchor.pumpHouseX, tieZ1);
}

/** วาดกลุ่มเก็บสำรองน้ำ/น้ำดับเพลิงทั้งชุดจากตำแหน่งที่ `fireWaterAnchor`
 *  คำนวณไว้ คืน `Corridor` เดียวกับที่เก็บไว้ใน anchor ให้ผู้เรียกรวมเข้ากับ
 *  รายการกันชนของต้นไม้/หัวจ่ายน้ำดับเพลิง เหมือน `buildCoolingExtractionPlant` */
export function buildFireWaterPlant(anchor: FireWaterAnchor, b: Buckets): Corridor {
  buildWaterStorageTanks(anchor.tankBankX, anchor.tankBankZ, b);
  buildFireWaterTank(anchor.fireTankX, anchor.fireTankZ, b);
  buildPumpHouse(anchor.pumpHouseX, anchor.fireTankZ, b);
  buildWaterTower(anchor.towerX, anchor.towerZ, b);
  buildConnectingPipework(anchor, b);
  return anchor.corridor;
}
