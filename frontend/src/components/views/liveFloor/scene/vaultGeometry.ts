import * as THREE from "three";

/**
 * ===========================================================================
 * VAULT GEOMETRY — เรขาคณิตหลังคาโค้งบาร์เรลวอลต์ (barrel vault) ร่วม
 * ===========================================================================
 *
 * ดึงออกมาจาก `HallRoof.tsx` (หลังคาระดับทั้งโรง) ให้ `siteIndoorInfra.ts`'s
 * `buildLineHalls` (โครงหลังคาย่อยรายไลน์ผลิต) เรียกใช้สูตรโค้งชุดเดียวกันได้
 * — ก่อนหน้านี้ `buildLineHalls` ใช้จันทัน/แผ่นหลังคาตรง (gable pitch คงที่)
 * ทำให้หลังคาที่เห็นเป็นเส้นตรง ไม่โค้งไปตามโครงเหล็กแบบโรงงานอุตสาหกรรมจริง
 *
 * `computeVault`/`vaultYAt`/`archTopChord` ใช้แกนอ้างอิงเดิม (extrusion ตาม
 * X, ส่วนโค้งพาดข้าม Z) เหมือนใน `HallRoof.tsx` ทุกประการ — เพิ่ม
 * `vaultPatchZ`/`archTopChordZ` เป็นเวอร์ชัน "สลับแกน" (extrusion ตาม Z,
 * ส่วนโค้งพาดข้าม X) ให้ `buildLineHalls` ใช้กับกรณี `spanAlongX = true`
 * (โซนที่ด้านสั้นอยู่แนว X) โดยไม่ต้องมีเวอร์ชันโค้งซ้ำสองชุดที่คำนวณต่างกัน
 */

/**
 * ช่วงพาดกว้างสุดของบาร์เรลวอลต์หนึ่งช่วง (เมตร) — เหตุผลเดียวกับ
 * `MAX_ROOF_SPAN` ใน `siteShared.ts`: ช่วงพาดจริงของโรงงานอุตสาหกรรมไม่เกิน
 * ราว 40 ม. ต่อช่วง
 */
export const VAULT_MAX_SPAN = 40;
/** ความสูงยกโค้ง (rise) เทียบกับช่วงพาด — "รูปทรงโค้งมน" แต่ยังอ่านเป็น
 *  หลังคาอุตสาหกรรม ไม่ใช่อุโมงค์ (12-18% ของช่วงพาด) */
export const RISE_RATIO = 0.15;

/** พารามิเตอร์เรขาคณิตของส่วนโค้งวอลต์หนึ่งช่วง */
export interface VaultGeom {
  /** รัศมีวงกลมของส่วนโค้ง */
  R: number;
  /** ครึ่งมุมที่ส่วนโค้งกวาด (จากสันลงไปหาสปริงกิ้งไลน์ทั้งสองข้าง) */
  alpha: number;
  /** ความสูงสปริงกิ้งไลน์ (ขอบล่างของส่วนโค้ง — ที่ตั้งของเชิงชาย/รางน้ำ) */
  springY: number;
  /** ความสูงสันหลังคา (จุดสูงสุด) */
  crownY: number;
  /** ครึ่งช่วงพาด */
  halfSpan: number;
}

export function computeVault(span: number, springY: number): VaultGeom {
  // กันช่วงพาดเสีย (ศูนย์/ติดลบ) หาร 0 ตอนคำนวณ R (rise=0 -> 2*rise=0) ซึ่งจะ
  // ได้ NaN ทั้งก้อน — โซนที่ถูกส่งเข้ามาปกติมีขนาดเป็นบวกเสมอ แต่กันไว้เผื่อ
  // ข้อมูลผังผิดพลาดไม่ให้ทั้งฉากล่ม (mergeAll เจอ NaN geometry จะพังทั้งก้อน)
  const safeSpan = Math.max(span, 0.01);
  const rise = safeSpan * RISE_RATIO;
  const halfSpan = safeSpan / 2;
  const R = (halfSpan * halfSpan + rise * rise) / (2 * rise);
  const alpha = Math.asin(Math.min(1, halfSpan / R));
  return { R, alpha, springY, crownY: springY + rise, halfSpan };
}

/**
 * แผ่นโค้ง (patch) หนึ่งชิ้นของวอลต์ — ทรงกระบอกแนวนอนพาดตามแกน X ตัด
 * เอาเฉพาะส่วนโค้งบน (`thetaHalf` ควบคุมมุมกวาดรอบสัน)
 *
 * ทรงกระบอกมาตรฐานของ three.js วางแกนตาม Y โดยเริ่มมุม theta ที่ทิศ +X แล้ว
 * กวาดผ่าน +Z — หมุน 90° รอบแกน Z ก่อน จะได้แกนกระบอกไปอยู่ที่ X และมุม
 * theta=0 (เดิมคือ +X) ไปอยู่ที่ +Y (จุดสูงสุด/สัน) พอดี ส่วน Z ไม่ถูกหมุน
 * จึงยังเป็นแกนข้าม (spanwise) เหมือนเดิม — ผลคือ thetaStart=-alpha,
 * thetaLength=2*alpha ให้ส่วนโค้งสมมาตรรอบสันตามต้องการ
 *
 * `radiusOffset` ใช้ยกส่วนโค้งขึ้นเล็กน้อยเหนือแผ่นหลังคาหลัก (ครีบ/สกายไลต์)
 * โดยยังอ้างอิงสปริงกิ้งไลน์เดียวกัน (`v.R` เดิม ไม่ใช่รัศมีที่ยกแล้ว) เพื่อให้
 * ทุกแผ่นในวอลต์เดียวกันใช้จุดอ้างอิงแนวตั้งเดียวกัน
 */
export function vaultPatch(
  v: VaultGeom,
  radiusOffset: number,
  thetaHalf: number,
  length: number,
  xCenter: number,
  zCenter: number,
  radialSegments: number
): THREE.BufferGeometry {
  const r = v.R + radiusOffset;
  const g = new THREE.CylinderGeometry(r, r, length, radialSegments, 1, true, -thetaHalf, thetaHalf * 2);
  g.rotateZ(Math.PI / 2);
  g.translate(xCenter, v.springY - v.R * Math.cos(v.alpha), zCenter);
  return g;
}

/**
 * เหมือน `vaultPatch` ทุกประการ แต่สลับแกน: ทรงกระบอกพาดตามแกน Z แทน (ส่วน
 * โค้งพาดข้ามแกน X) — ใช้กับกรณีที่ด้านสั้น (span) ของอาคารอยู่แนว X แทน Z
 * (`buildLineHalls`'s `spanAlongX = true`) โดยไม่ต้องคำนวณสูตรโค้งแยกชุดใหม่
 *
 * หมุนต่อจาก `vaultPatch` อีกที (`rotateZ(90°)` เดิม แล้ว `rotateY(90°)`
 * เพิ่ม) — `rotateY` ไม่แตะแกน Y (สัน/ความสูงยังถูกต้องเหมือนเดิม) แต่สลับ
 * แกนพาด (เดิมอยู่ X) ไปอยู่ Z และสลับแกนข้าม (เดิมอยู่ Z) ไปอยู่ X พอดี
 */
export function vaultPatchZ(
  v: VaultGeom,
  radiusOffset: number,
  thetaHalf: number,
  length: number,
  xCenter: number,
  zCenter: number,
  radialSegments: number
): THREE.BufferGeometry {
  const r = v.R + radiusOffset;
  const g = new THREE.CylinderGeometry(r, r, length, radialSegments, 1, true, -thetaHalf, thetaHalf * 2);
  g.rotateZ(Math.PI / 2);
  g.rotateY(Math.PI / 2);
  g.translate(xCenter, v.springY - v.R * Math.cos(v.alpha), zCenter);
  return g;
}

/** ท่อโค้งของโครงถักบน (top chord) หนึ่งเฟรม — สุ่มจุดตามส่วนโค้งจริงแล้วลาก
 *  ท่อผ่าน (`THREE.TubeGeometry`) ให้ได้โครงถักโค้งสมจริงแทนกล่องเหลี่ยม
 *  เฟรมอยู่ที่ตำแหน่ง X คงที่ (`xPos`) ส่วนโค้งพาดข้ามแกน Z รอบ `zCenter` */
export function archTopChord(v: VaultGeom, xPos: number, zCenter: number, radius: number, segments = 16): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const theta = -v.alpha + (2 * v.alpha * i) / segments;
    const y = v.R * Math.cos(theta) + (v.springY - v.R * Math.cos(v.alpha));
    const z = zCenter + v.R * Math.sin(theta);
    pts.push(new THREE.Vector3(xPos, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, segments, radius, 8, false);
}

/** เหมือน `archTopChord` แต่สลับแกน: เฟรมอยู่ที่ตำแหน่ง Z คงที่ (`zPos`)
 *  ส่วนโค้งพาดข้ามแกน X รอบ `xCenter` — คู่กับ `vaultPatchZ` */
export function archTopChordZ(v: VaultGeom, zPos: number, xCenter: number, radius: number, segments = 16): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const theta = -v.alpha + (2 * v.alpha * i) / segments;
    const y = v.R * Math.cos(theta) + (v.springY - v.R * Math.cos(v.alpha));
    const x = xCenter + v.R * Math.sin(theta);
    pts.push(new THREE.Vector3(x, y, zPos));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, segments, radius, 8, false);
}

/** ความสูงที่จุดใดจุดหนึ่งบนส่วนโค้ง เทียบจากระยะข้าม (สัมพัทธ์จากกลางวอลต์
 *  ไม่ว่าจะเป็นแกน Z หรือ X ก็ใช้สูตรเดียวกันนี้ได้ — เป็นแค่ระยะสเกลาร์) */
export function vaultYAt(v: VaultGeom, crossRel: number): number {
  const theta = Math.asin(Math.min(1, Math.max(-1, crossRel / v.R)));
  return v.R * Math.cos(theta) + (v.springY - v.R * Math.cos(v.alpha));
}
