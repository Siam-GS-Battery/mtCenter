import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * ===========================================================================
 * GEOMETRY KIT — เครื่องมือปั้นรูปทรงและรวมเป็นก้อนตามวัสดุ
 * ===========================================================================
 *
 * ทุกอย่างในไฟล์นี้เป็นเรขาคณิต Three.js ล้วน — ไม่มี React, ไม่มีรูปภาพ,
 * ไม่มีโมเดลจากภายนอก เครื่องจักรทุกตัวในฉากปั้นจาก primitive ในนี้
 * (กล่องมุมโค้ง ทรงกระบอก ทอรัส ทรงกลม กรวย) แล้วรวมเป็นก้อนเดียวต่อวัสดุ
 *
 * ทำไมต้องรวมตามวัสดุ (`MaterialKey`):
 *   เครื่องจักรหนึ่งตัวมีชิ้นส่วน 20-40 ชิ้น และผังจริงมีเครื่องกว่า 900 ตัว
 *   ถ้าปล่อยเป็น mesh ต่อชิ้นจะได้ 20,000+ draw call ซึ่งค้างแน่ วิธีที่ใช้คือ
 *     1. ปั้นเครื่องหนึ่งตัวเป็นชิ้นส่วนย่อย โดยแต่ละชิ้นระบุ "วัสดุ" ของมัน
 *     2. merge ทุกชิ้นที่ใช้วัสดุเดียวกันเป็น BufferGeometry ก้อนเดียว
 *     3. ชั้นบน (`MachineInstances.tsx`) เอาก้อนนั้นไปทำ InstancedMesh ก้อนละ
 *        หนึ่งตัว แล้ววางเครื่องทุกตัวของ archetype นั้นเป็น instance
 *   ผลคือ draw call ≈ (จำนวน archetype) x (จำนวนวัสดุที่ archetype นั้นใช้)
 *   ราว 40-50 ก้อน แทนที่จะเป็นหลักหมื่น
 *
 * ระบบพิกัดของชิ้นส่วน: y=0 คือพื้น (เครื่องตั้งบนพื้น ไม่ใช่จุดกลางเครื่อง),
 * x คือด้านกว้าง, z คือด้านลึก, ทุกอย่างหน่วยเมตร ให้ตรงกับ `plantLayout.ts`
 */

/**
 * ชื่อวัสดุ — ต้องมีค่าใน `MATERIAL_KEYS` ครบทุกตัว ชั้นบนสร้าง
 * `THREE.Material` จริงจากคีย์เหล่านี้ (ดู `MachineInstances.tsx`)
 *
 * `status` เป็นวัสดุพิเศษ: สีมาจากสถานะของเครื่องแต่ละตัวผ่าน instanceColor
 * ไม่ใช่ค่าคงที่ — ชิ้นส่วนที่ควรใช้วัสดุนี้คือแถบสถานะและโคมไฟสัญญาณ
 */
export type MaterialKey =
  | "body"
  | "bodyDark"
  | "frame"
  | "steel"
  | "rubber"
  | "conduit"
  | "glass"
  | "screen"
  | "hazard"
  | "status";

export const MATERIAL_KEYS: MaterialKey[] = [
  "body",
  "bodyDark",
  "frame",
  "steel",
  "rubber",
  "conduit",
  "glass",
  "screen",
  "hazard",
  "status",
];

/** ชิ้นส่วนหนึ่งชิ้น: เรขาคณิตในพิกัดของตัวเอง + วัสดุที่ใช้ */
export interface Part {
  geometry: THREE.BufferGeometry;
  material: MaterialKey;
}

/**
 * ตัวสะสมชิ้นส่วน
 *
 * เมธอดทุกตัวรับ "ตำแหน่งกลางชิ้น" กับ "ขนาด" แล้วย้ายเรขาคณิตไปที่นั้นเลย
 * (`applyMatrix4`) ไม่ได้เก็บ transform แยก เพราะปลายทางคือการ merge อยู่แล้ว
 * การ bake ตำแหน่งลงใน vertex ตอนนี้จึงถูกกว่าและทำให้ merge ได้ตรง ๆ
 */
export class PartBuilder {
  private parts: Part[] = [];

  /** กล่องมุมโค้ง — รูปทรงหลักของตัวถังเครื่องจักรทุกตัว */
  roundedBox(
    material: MaterialKey,
    center: [number, number, number],
    size: [number, number, number],
    radius = 0.12,
    segments = 1
  ): this {
    // รัศมีมุมเกินครึ่งของด้านที่สั้นสุดไม่ได้ ไม่งั้น RoundedBoxGeometry
    // จะพลิกด้านในออก — clamp ไว้ที่ 45% ของด้านสั้นสุดเพื่อกันขอบพอดีเป๊ะ
    const minSide = Math.min(size[0], size[1], size[2]);
    const r = Math.max(0.005, Math.min(radius, minSide * 0.45));
    const g = new RoundedBoxGeometry(size[0], size[1], size[2], segments, r);
    return this.push(g, material, center);
  }

  /** กล่องเหลี่ยม — ใช้กับชิ้นบาง ๆ (แผ่นเพลต แถบเตือน) ที่โค้งมุมแล้วไม่เห็น */
  box(
    material: MaterialKey,
    center: [number, number, number],
    size: [number, number, number]
  ): this {
    return this.push(new THREE.BoxGeometry(size[0], size[1], size[2]), material, center);
  }

  /**
   * ทรงกระบอก — ท่อ ลูกกลิ้ง ปล่อง ถัง แกนหมุน
   *
   * `axis` เลือกแกนที่ทรงกระบอกวางตัว: "y" คือตั้ง (ค่าเริ่มต้นของ three),
   * "x"/"z" คือนอนตามแกนนั้น
   */
  cylinder(
    material: MaterialKey,
    center: [number, number, number],
    radiusTop: number,
    radiusBottom: number,
    height: number,
    axis: "x" | "y" | "z" = "y",
    radialSegments = 12
  ): this {
    const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    if (axis === "z") g.rotateX(Math.PI / 2);
    return this.push(g, material, center);
  }

  /** ทอรัส — ปะเก็นรอบท่อ ขอบช่องมอง วงแหวนรอบถัง */
  torus(
    material: MaterialKey,
    center: [number, number, number],
    radius: number,
    tube: number,
    axis: "x" | "y" | "z" = "y",
    segments = 14
  ): this {
    const g = new THREE.TorusGeometry(radius, tube, 6, segments);
    // TorusGeometry วางอยู่บนระนาบ XY — หมุนให้ไปอยู่ระนาบที่ต้องการ
    if (axis === "y") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateY(Math.PI / 2);
    return this.push(g, material, center);
  }

  /** ทรงกลม/โดม — โคมไฟสัญญาณ หัวถัง หัวสกรู */
  sphere(
    material: MaterialKey,
    center: [number, number, number],
    radius: number,
    segments = 10,
    phiLength = Math.PI * 2,
    thetaLength = Math.PI
  ): this {
    const g = new THREE.SphereGeometry(radius, segments, Math.max(6, segments / 2), 0, phiLength, 0, thetaLength);
    return this.push(g, material, center);
  }

  /** กรวย — ปลายหัวฉีด กรวยเติมวัสดุ (hopper) */
  cone(
    material: MaterialKey,
    center: [number, number, number],
    radius: number,
    height: number,
    axis: "x" | "y" | "z" = "y",
    radialSegments = 12
  ): this {
    return this.cylinder(material, center, 0.001, radius, height, axis, radialSegments);
  }

  /**
   * ท่อโค้งตามเส้นทาง — สายไฟ/ท่อลมที่พาดจากจุดหนึ่งไปอีกจุด
   *
   * ใช้ CatmullRom ผ่านจุดที่ให้มา แล้วยกกลางเส้นขึ้นเล็กน้อยเพื่อให้ห้อยเป็น
   * เส้นโค้งจริง ไม่ใช่ท่อตรงที่ดูเป็นกล่อง
   */
  pipeThrough(material: MaterialKey, points: Array<[number, number, number]>, radius = 0.06): this {
    if (points.length < 2) return this;
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const g = new THREE.TubeGeometry(curve, Math.max(6, points.length * 3), radius, 6, false);
    return this.push(g, material, [0, 0, 0]);
  }

  /** วางชิ้นเดิมซ้ำเป็นแถวตามแกน — ลูกกลิ้ง ครีบระบายความร้อน ขาตั้ง */
  repeat(
    count: number,
    from: number,
    to: number,
    fn: (t: number, index: number) => void
  ): this {
    if (count <= 0) return this;
    for (let i = 0; i < count; i += 1) {
      const t = count === 1 ? (from + to) / 2 : from + ((to - from) * i) / (count - 1);
      fn(t, i);
    }
    return this;
  }

  /**
   * โคมไฟสัญญาณ 3 ชั้น (PLC stack light) — ของประจำเครื่องจักรโรงงาน
   *
   * แยกออกมาเป็นเมธอดเพราะเครื่องจักรทุก archetype ต้องมี และมันคือจุดที่
   * สถานะของเครื่องปรากฏบนตัวเครื่องจริง ๆ: เสากับฐานใช้วัสดุคงที่ ส่วนโคม
   * ใช้วัสดุ `status` ซึ่งรับสีจากสถานะของเครื่องแต่ละตัว
   */
  stackLight(base: [number, number, number], poleHeight = 0.9): this {
    const [x, y, z] = base;
    this.cylinder("frame", [x, y + poleHeight / 2, z], 0.045, 0.055, poleHeight, "y", 10);
    // โคมทั้งสามชั้นใช้วัสดุ status ก้อนเดียว จึงติดสีตามสถานะพร้อมกัน —
    // อ่านเป็น "ไฟสถานะของเครื่องนี้" ไม่ใช่ไฟสามดวงที่ต้องไปตีความเอง
    this.repeat(3, poleHeight + 0.09, poleHeight + 0.39, (ly) => {
      this.cylinder("status", [x, y + ly, z], 0.085, 0.085, 0.13, "y", 12);
    });
    this.sphere("status", [x, y + poleHeight + 0.5, z], 0.085, 12, Math.PI * 2, Math.PI / 2);
    return this;
  }

  /**
   * ตู้คอนโทรลพร้อมจอ HMI — ของประจำเครื่องอีกชิ้น ติดที่ด้านหน้าเครื่อง
   *
   * `facing` คือด้านที่จอหันออก (+z คือหน้าเครื่องตามระบบพิกัดของไฟล์นี้)
   */
  controlPanel(center: [number, number, number], width = 0.9, height = 1.3, facing: 1 | -1 = 1): this {
    const [x, y, z] = center;
    this.roundedBox("bodyDark", [x, y + height / 2, z], [width, height, 0.28], 0.06);
    // จอเยื้องออกจากผิวตู้ 0.15 ม. กัน z-fighting กับหน้าตู้
    this.box("screen", [x, y + height * 0.68, z + facing * 0.15], [width * 0.66, height * 0.34, 0.02]);
    this.box("glass", [x, y + height * 0.34, z + facing * 0.15], [width * 0.66, height * 0.12, 0.02]);
    // ปุ่มกดแถวล่าง
    this.repeat(3, -width * 0.2, width * 0.2, (bx) => {
      this.cylinder("steel", [x + bx, y + height * 0.16, z + facing * 0.16], 0.035, 0.035, 0.03, "z", 8);
    });
    return this;
  }

  /** แถบเตือนคาดรอบฐานเครื่อง — บอกขอบเขตพื้นที่เครื่องบนพื้นโรงงาน */
  hazardSkirt(width: number, depth: number, height = 0.12): this {
    const t = 0.06;
    this.box("hazard", [0, height / 2, depth / 2], [width, height, t]);
    this.box("hazard", [0, height / 2, -depth / 2], [width, height, t]);
    this.box("hazard", [width / 2, height / 2, 0], [t, height, depth]);
    this.box("hazard", [-width / 2, height / 2, 0], [t, height, depth]);
    return this;
  }

  /** ฐานแท่นเครื่อง — ทุก archetype ยืนบนแท่นนี้ ให้ดูมีน้ำหนักติดพื้น */
  plinth(width: number, depth: number, height = 0.25): this {
    this.roundedBox("frame", [0, height / 2, 0], [width, height, depth], 0.05);
    return this;
  }

  private push(
    geometry: THREE.BufferGeometry,
    material: MaterialKey,
    center: [number, number, number]
  ): this {
    if (center[0] !== 0 || center[1] !== 0 || center[2] !== 0) {
      geometry.translate(center[0], center[1], center[2]);
    }
    this.parts.push({ geometry: normalizeForMerge(geometry), material });
    return this;
  }

  /**
   * รวมชิ้นส่วนทั้งหมดเป็น BufferGeometry ก้อนเดียวต่อวัสดุ
   *
   * `dispose()` ชิ้นย่อยทุกชิ้นหลัง merge — ข้อมูลถูกคัดลอกเข้าก้อนใหม่แล้ว
   * ถ้าไม่ปล่อย buffer ของชิ้นย่อยจะค้างใน GPU/หน่วยความจำโดยไม่มีใครใช้
   */
  build(): Partial<Record<MaterialKey, THREE.BufferGeometry>> {
    const byMaterial = new Map<MaterialKey, THREE.BufferGeometry[]>();
    for (const part of this.parts) {
      const list = byMaterial.get(part.material);
      if (list) list.push(part.geometry);
      else byMaterial.set(part.material, [part.geometry]);
    }

    const out: Partial<Record<MaterialKey, THREE.BufferGeometry>> = {};
    for (const [material, geometries] of byMaterial) {
      const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);
      if (!merged) continue;
      merged.computeBoundingSphere();
      out[material] = merged;
      if (geometries.length > 1) for (const g of geometries) g.dispose();
    }
    this.parts = [];
    return out;
  }
}

/**
 * ทำให้เรขาคณิตพร้อม merge — บังคับให้ทุกก้อนเป็น non-indexed
 *
 * `mergeGeometries` ยอมรับเฉพาะชุดที่ "มี index ทุกก้อน หรือไม่มีเลยทุกก้อน"
 * ถ้าปนกันมันจะ log error แล้วคืน `null` — ซึ่งแปลว่าชิ้นส่วนทั้งถังหายไปจาก
 * ฉากแบบเงียบ ๆ ไม่ใช่พังให้เห็น
 *
 * ปัญหานี้เกิดจริงเพราะ `RoundedBoxGeometry` (รูปทรงหลักของตัวถังเครื่องจักร
 * ทุกตัว) สร้างเป็น non-indexed ขณะที่ Box/Cylinder/Sphere/Torus/Tube ของ
 * three เป็น indexed ทั้งหมด — เครื่องทุกตัวจึงปนสองแบบอยู่แล้วโดยธรรมชาติ
 *
 * เลือกทางไป non-indexed (ไม่ใช่ไล่ทำ index ให้ RoundedBox) เพราะเป็นทิศที่
 * ทำได้เสมอด้วย API มาตรฐาน ราคาที่จ่ายคือ vertex เพิ่มขึ้นในก้อนต้นแบบซึ่ง
 * มีก้อนเดียวต่อ archetype — ไม่ได้คูณตามจำนวนเครื่อง เพราะปลายทางเป็น
 * InstancedMesh ที่ใช้ geometry ก้อนเดียวร่วมกันทุก instance
 */
function normalizeForMerge(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geometry.index) return geometry;
  const flat = geometry.toNonIndexed();
  geometry.dispose();
  return flat;
}

/** merge เรขาคณิตหลายก้อนเป็นก้อนเดียว (ใช้กับของนิ่งอย่างพื้น/ถนน/สายพาน) */
export function mergeAll(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geometries.length === 0) return null;
  const flat = geometries.map(normalizeForMerge);
  const merged = flat.length === 1 ? flat[0] : mergeGeometries(flat, false);
  if (!merged) return null;
  merged.computeBoundingSphere();
  // ปล่อยเฉพาะก้อนย่อยที่ถูกคัดลอกเข้าก้อนรวมแล้ว — ถ้ามีก้อนเดียว `flat[0]`
  // คือก้อนที่คืนออกไป ปล่อยไม่ได้
  if (flat.length > 1) for (const g of flat) g.dispose();
  return merged;
}

/** แผ่นพื้นแนวนอนหนึ่งแผ่น (ใช้ตีพื้นโซน ถนน ลานจอด ทางเดิน) */
export function slabGeometry(
  x: number,
  z: number,
  width: number,
  depth: number,
  y: number,
  thickness = 0.04
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(width, thickness, depth);
  g.translate(x, y + thickness / 2, z);
  return g;
}
