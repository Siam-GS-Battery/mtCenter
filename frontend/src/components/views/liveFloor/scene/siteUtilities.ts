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
  const maxMachineH = rowMachines.reduce((mx, m) => Math.max(mx, m.height), 0);
  const rowZCenter = zones.reduce((s, z) => s + z.z, 0) / zones.length;

  // ทางเดินข้างแถวเครื่อง ถ้ามีจริง — ไม่มีก็ fallback กลับไปพาดเหนือเครื่อง
  // (`aisleZ === null`) เหมือนรุ่นก่อนหน้า พร้อมยก headerY ชนความสูงเครื่อง
  const aisleZ = pickAisleZ(zones, rowMachines);
  const rowZ = aisleZ ?? rowZCenter;
  // เครื่องจักรต้องเผื่อความสูง header ก็ต่อเมื่อท่อยังพาดอยู่เหนือเครื่องจริง
  // (ไม่มีทางเดินให้ใช้) — พอย้ายไปทางเดินแล้วไม่ต้องเผื่อเตาสูงอีกต่อไป
  const machineConstrainsHeader = aisleZ === null && maxMachineH > 0;

  const eaveY = hallHeight * 0.78;
  const baseY = WAREHOUSE_RACKING_H + AIR_HEADER_CLEARANCE_ABOVE_RACKING;
  // `headerY` คือ "แกนกลางท่อ" เสมอ (ดู comment ที่ `box(x0+len/2, headerY -
  // AIR_HEADER_R, ...)` ข้างล่าง) — ระยะเผื่อทุกจุดจึงต้องคิดจาก "ผิวท่อ" ไม่ใช่
  // แกนกลาง: ผิวบน = headerY + AIR_HEADER_R (เทียบกับ eave), ผิวล่าง =
  // headerY - AIR_HEADER_R (เทียบกับหลังคาเครื่องจักรที่สูงสุดในแถว ถ้ายังพาด
  // เหนือเครื่องอยู่จริง)
  const desiredY = machineConstrainsHeader
    ? Math.max(baseY, maxMachineH + AIR_HEADER_R + AIR_HEADER_MACHINE_CLEARANCE)
    : baseY;
  const eaveCap = eaveY - AIR_HEADER_R - AIR_HEADER_MIN_EAVE_MARGIN;
  const headerY = Math.min(desiredY, eaveCap);
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
  farZ = pushOutFrom(sheds, farZ, clusterX, halfSpanX, SUBSTATION_CLEARANCE);
  farZ = pushOutFrom(buildings, farZ, clusterX, halfSpanX, SUBSTATION_CLEARANCE);

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
