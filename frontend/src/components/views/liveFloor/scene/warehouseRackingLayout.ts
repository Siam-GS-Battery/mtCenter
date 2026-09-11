/**
 * ===========================================================================
 * WAREHOUSE RACKING LAYOUT — ค่าคงที่ + สูตรผังชั้นวางพาเลทโซน `WH` ที่ใช้ร่วมกัน
 * ===========================================================================
 *
 * แยกออกมาจาก `WarehouseRacking.tsx` เพราะค่าคงที่กลุ่มนี้ (`WH_EDGE_MARGIN`/
 * `WH_BAY_WIDTH`/`WH_CROSS_AISLE_WIDTH`/`WH_MACHINE_CLEARANCE`) และสูตรแบ่ง
 * บล็อกชั้นวาง 2 บล็อกคั่นทางเดินขวาง ถูก `Forklifts.tsx`'s `computeWhCrossAisle`
 * คัดลอกไปใช้ซ้ำเพื่อหาตำแหน่ง "ทางเดินขวางกลางคลัง" ที่รถยกต้องวิ่งผ่าน — ถ้า
 * ผังชั้นวางถูกปรับจูนใหม่ในอนาคตแต่ลืมแก้ค่าที่คัดลอกไว้ สูตรที่ `Forklifts.tsx`
 * คำนวณจะยัง "ไม่ null" (ไม่ throw ไม่เตือน) แต่คืนตำแหน่งทางเดินขวางที่ผิดไป
 * จากผังชั้นวางจริง แล้วเช็คชนเครื่องจักรที่ตามมาก็ตรวจกับตำแหน่งผิดนั้นด้วย —
 * รถยกอาจถูกส่งให้วิ่งเข้าไปชนชั้นวางจริงโดยไม่มี safety check ใดจับได้เลย
 *
 * โมดูลนี้เป็นแหล่งความจริงเดียว ทั้งสองไฟล์ import จากที่นี่แทน
 */

/** ระยะเผื่อขอบโซนก่อนเริ่มวางชั้นวางแถวแรก (เมตร) */
export const WH_EDGE_MARGIN = 2;
/** ความกว้างช่วงชั้นหนึ่งช่วง (เมตร) */
export const WH_BAY_WIDTH = 2.7;
/** ทางเดินขวางที่ตัดกลางแนวช่วงชั้น กันไม่ให้เป็นบล็อกทึบตันข้ามไม่ได้ (เมตร) —
 *  ค่าเดียวกับทางเดินฟอร์คลิฟท์ระหว่างคู่แถว back-to-back โดยบังเอิญ (ทั้งคู่ 3.5 ม.
 *  ตามสเปก ไม่ใช่ผูกกันทางคณิตศาสตร์) */
export const WH_CROSS_AISLE_WIDTH = 3.5;
/** ระยะเผื่อรอบเครื่องจักรที่ชั้นวาง/ทางเดินขวางต้องไม่ล้ำเข้าไป (เมตร) */
export const WH_MACHINE_CLEARANCE = 0.6;

export interface WhZoneAxes {
  /** true = แกน bay (แถวชั้นวางยาวไปตามแกนนี้) ทอดตามแกน X ของโลก */
  alongX: boolean;
  bayAxisLen: number;
  rowAxisLen: number;
  /** ความยาวแกน bay ที่ใช้งานได้จริงหลังหักขอบเผื่อ (`WH_EDGE_MARGIN`) ทั้งสองข้าง */
  usableBay: number;
  /** ความยาวแกน row ที่ใช้งานได้จริงหลังหักขอบเผื่อทั้งสองข้าง */
  usableRow: number;
}

/**
 * แกน bay/row ของโซน WH จริง — เลือกแกนที่ยาวกว่าของ zone (`w` หรือ `d`) เป็น
 * แกน "ช่อง" (bay axis) แกนที่สั้นกว่าเป็นแกน "แถว" (row axis) แล้วหักขอบเผื่อ
 * (`WH_EDGE_MARGIN`) ทั้งสองด้านออกเป็นระยะใช้งานได้จริง — คืน `null` เมื่อโซน
 * เล็กเกินกว่าจะเหลือพื้นที่ใช้งานได้เลย (หลังหักขอบเผื่อแล้ว <= 0)
 */
export function computeWhZoneAxes(zone: { w: number; d: number }): WhZoneAxes | null {
  const alongX = zone.w >= zone.d;
  const bayAxisLen = alongX ? zone.w : zone.d;
  const rowAxisLen = alongX ? zone.d : zone.w;
  const usableBay = bayAxisLen - 2 * WH_EDGE_MARGIN;
  const usableRow = rowAxisLen - 2 * WH_EDGE_MARGIN;
  if (usableBay <= 0 || usableRow <= 0) return null;
  return { alongX, bayAxisLen, rowAxisLen, usableBay, usableRow };
}

export interface WhTwoBlockSplit {
  baysPerBlock: number;
  blockUsedWidth: number;
  /** ความยาวรวมทั้ง 2 บล็อก + ทางเดินขวางคั่นกลาง ตามแกน bay */
  totalBlocksSpan: number;
  /** จุดเริ่มบล็อกแรก เทียบศูนย์กลางโซนบนแกน bay (bay-local) */
  blockAxisStart: number;
  /** ตำแหน่งกึ่งกลางทางเดินขวาง เทียบศูนย์กลางโซนบนแกน bay (bay-local) */
  crossAisleBayLocal: number;
}

/**
 * ลองแบ่งช่วงชั้นตามแกน bay เป็น 2 บล็อกเท่ากันคั่นด้วยทางเดินขวาง
 * (`WH_CROSS_AISLE_WIDTH`) กันไม่ให้ทั้งแถวเป็นบล็อกทึบตันข้ามไม่ได้ — คืน
 * `null` เมื่อโซนแคบเกินกว่าจะใส่ได้แม้ 1 ช่วงชั้นต่อบล็อก (ผู้เรียกที่ต้องมี
 * ทางเดินขวางจริง เช่น `Forklifts.tsx` ต้องหยุดที่ `null` นี้ ส่วนผู้เรียกที่ยอม
 * ถอยไปเป็นบล็อกเดียวได้ เช่น `WarehouseRacking.tsx` จะจัดการ fallback เอง)
 */
export function computeWhTwoBlockSplit(usableBay: number): WhTwoBlockSplit | null {
  const twoBlockWidth = (usableBay - WH_CROSS_AISLE_WIDTH) / 2;
  const baysPerBlock = Math.floor(twoBlockWidth / WH_BAY_WIDTH);
  if (baysPerBlock < 1) return null;
  const blockUsedWidth = baysPerBlock * WH_BAY_WIDTH;
  const totalBlocksSpan = blockUsedWidth * 2 + WH_CROSS_AISLE_WIDTH;
  const blockAxisStart = -totalBlocksSpan / 2;
  const crossAisleBayLocal = blockAxisStart + blockUsedWidth + WH_CROSS_AISLE_WIDTH / 2;
  return { baysPerBlock, blockUsedWidth, totalBlocksSpan, blockAxisStart, crossAisleBayLocal };
}
