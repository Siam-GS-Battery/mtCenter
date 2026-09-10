/**
 * ===========================================================================
 * INDOOR LANES — เรขาคณิตเลนรถในอาคาร ใช้ร่วมกันหลายไฟล์
 * ===========================================================================
 *
 * แยกออกมาจาก `SiteEnvironment.tsx` (ที่นี่เป็นจุดกำเนิดเดิม) เพราะ
 * `FloorMarkings.tsx` ต้องรู้ตำแหน่งเลนรถในอาคารเดียวกันเพื่อวางลูกศร
 * ทิศทางฟอร์คลิฟท์ — ทั้งสองไฟล์ต้องอ่านสูตร/ระยะเดียวกัน ไม่ใช่คัดลอกพิกัด
 * ไปคำนวณซ้ำสองที่ (ซึ่งจะเลื่อนไม่ตรงกันทันทีที่ใครขยับค่าใดค่าหนึ่ง)
 */

export interface LaneRun {
  x: number;
  z: number;
  w: number;
  d: number;
  alongX: boolean;
  len: number;
}

/** ความกว้างถนนรถในอาคาร (เมตร) */
export const INDOOR_ROAD_W = 6.0;
/** ระยะจากผนังโรงถึงกึ่งกลางถนนรถในอาคาร (เมตร) */
export const INDOOR_ROAD_OFFSET = 8.4;

/**
 * ตีแถบยาวขนานไปตามขอบสี่เหลี่ยม (ใช้ทั้งด้านในและด้านนอกอาคาร)
 *
 * ทั้งสี่ด้านคิดจากระยะ `offset` จากขอบเดียวกัน จึงได้แถบที่ **ขนานกับผนัง
 * และขนานกันเอง** ทุกด้านโดยโครงสร้างของสูตร ไม่ใช่จากการไล่ใส่ตัวเลขทีละด้าน
 * (ซึ่งเป็นวิธีที่เผลอแล้วเบี้ยวทันที)
 *
 * `inward` = true ตีเข้าด้านในกรอบ, false ตีออกด้านนอก
 * มุมทั้งสี่จะทับกันเล็กน้อยโดยเจตนา — แถบจึงต่อกันเป็นวงปิด ไม่ขาดที่มุม
 */
export function ringStrip(hallW: number, hallD: number, offset: number, width: number, inward: boolean): LaneRun[] {
  const sign = inward ? -1 : 1;
  const cx = hallW / 2 + sign * offset;
  const cz = hallD / 2 + sign * offset;
  // ด้านที่วิ่งตามแกน X ยาวเต็มความกว้าง ส่วนด้านที่วิ่งตามแกน Z ถูกหักหัวท้าย
  // ออกเท่ากับความกว้างของแถบ เพื่อไม่ให้ซ้อนกันหนาสองชั้นที่มุม
  const lenX = hallW + sign * 2 * offset + width;
  const lenZ = hallD + sign * 2 * offset - width;
  return [
    { x: 0, z: cz, w: lenX, d: width, alongX: true, len: lenX },
    { x: 0, z: -cz, w: lenX, d: width, alongX: true, len: lenX },
    { x: cx, z: 0, w: width, d: lenZ, alongX: false, len: lenZ },
    { x: -cx, z: 0, w: width, d: lenZ, alongX: false, len: lenZ },
  ];
}
