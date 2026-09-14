import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PlantLayout } from "../../../../lib/plantLayout";
import { SHELL } from "./palette";
import { mergeAll } from "./geometryKit";
import {
  VAULT_MAX_SPAN,
  type VaultGeom,
  computeVault,
  vaultPatch,
  archTopChord,
  vaultYAt,
} from "./vaultGeometry";

/**
 * ===========================================================================
 * HALL ROOF — หลังคาโค้งบาร์เรลวอลต์คลุมทั้งโรงงาน
 * ===========================================================================
 *
 * หลังคาระดับ "ทั้งโรง" ที่ครอบอยู่เหนือโครงหลังคาย่อยรายไลน์ผลิต
 * (`siteIndoorInfra.ts`'s `buildLineHalls`, สันสูงสุด ~0.90×hall.h) และเหนือ
 * ผนังเตี้ยรอบอาคาร (`PlantShell.tsx`, `wallH = hall.h * 0.26`) — เริ่มขึ้นที่
 * `hall.h` (ความสูงจริงของอาคารตามผัง) พอดี จึงไม่มีทางชนกับโครงสร้างใดที่มี
 * อยู่ก่อนแล้วในฉาก
 *
 * รูปทรง: หลังคาโค้งบาร์เรลวอลต์ (barrel vault) หลายช่วงขนานกัน (multi-bay)
 * พาดยาวตามแกน X (ด้านกว้างของโรง) แบ่งช่วงตามแกน Z (ด้านลึก) ไม่เกิน
 * `VAULT_MAX_SPAN` ต่อช่วง — เหตุผลเดียวกับ `MAX_ROOF_SPAN` ใน
 * `siteShared.ts`: ช่วงพาดเดียวกว้างเท่าอาคารทั้งหลัง (74 ม.) ไม่มีจริงในงาน
 * โครงสร้าง จึงซอยเป็นหลายช่วงแบบหลังคา "M" (north-light / multi-vault roof)
 * ที่โรงงานอุตสาหกรรมขนาดใหญ่ใช้จริง รอยต่อระหว่างช่วง (และขอบนอกสองข้าง)
 * เป็นแนวรางน้ำ/ชายคาที่ระดับสปริงกิ้ง (springing line, y = hall.h)
 *
 * โหมด "เปิดหลังคา" (`roofOpen`) เอาทั้งแผ่นหลังคา/ครีบสัน/สกายไลต์/หน่วย
 * ดาดฟ้า **และ** เหล็กโครงหลังคา (โครงถักโค้ง คานอกไก่ แป โครงหน้าต่าง
 * ระบายอากาศสันหลังคา ท่อรับน้ำฝน ทางเดิน/ราวกันตกบนสันหลังคา) ออกทั้งหมด
 * เหลือแค่ชายคา/รางน้ำที่ระดับสปริงกิ้งไลน์ (`eave`) ให้ยังอ่านเป็นเค้าโครง
 * อาคาร — ตรงกับพฤติกรรมของ `SiteEnvironment.tsx`/`buildLineHalls` ทุกประการ
 * (ทั้งสองที่ซ่อน `truss` ทั้งก้อนตอนเปิดหลังคา เหลือแค่ `eave`): สร้างเรขาคณิต
 * ทั้งหมดครั้งเดียวใน `useMemo` แล้วแค่ "เลือกไม่เรนเดอร์" ก้อนที่ไม่ต้องการ
 * ไม่ rebuild/dispose ตอนสลับปุ่ม
 */

export interface HallRoofProps {
  layout: PlantLayout;
  /** true = เปิดหลังคา (ซ่อนทั้งแผ่นหลังคาและโครงถักเหล็ก เหลือแต่ชายคา) เพื่อมองเห็นเครื่องจักรข้างใน */
  roofOpen?: boolean;
  /** false = โหมดประหยัด — ลดรายละเอียดที่แพง */
  highQuality?: boolean;
}

/** คีย์วัสดุของหลังคาทั้งโรง — 7 ก้อน = 7 draw call รวมทั้งไฟล์นี้ */
type RoofKey = "truss" | "eave" | "roofDeck" | "rib" | "skylight" | "unit" | "extra";

const MATERIAL_SPECS: Record<RoofKey, { color: string; roughness: number; metalness: number; transparent?: boolean; opacity?: number }> = {
  // เหล็กโครงสร้าง (โครงถักโค้ง คานอกไก่ แป โครงหน้าต่างระบายอากาศสันหลังคา)
  truss: { color: SHELL.beam, roughness: 0.6, metalness: 0.15 },
  // ชายคา/รางน้ำ — สีเดียวกับคานขอบหลังคาที่ใช้ทั่วฉาก (`SHELL.roofEdge`)
  eave: { color: SHELL.roofEdge, roughness: 0.55, metalness: 0.1 },
  // แผ่นหลังคาเมทัลชีต + ฝาครอบหน้าต่างระบายอากาศ — คนละก้อนกับ `roofDeck` ใน
  // `siteShared.ts` โดยเจตนา (ไฟล์นั้นเป็นของโครงอาคารไลน์ย่อย ไฟล์นี้เป็น
  // หลังคาทั้งโรงชั้นบนสุด) แต่ใช้โทนสีเดียวกัน (`SHELL.wallAlt`) ให้เข้าชุด
  roofDeck: { color: SHELL.wallAlt, roughness: 0.6, metalness: 0.15 },
  // ครีบยืนตะเข็บ (standing seam rib) — เหล็กเคลือบสีเดียวกับแผ่นหลังคา
  rib: { color: SHELL.wallAlt, roughness: 0.5, metalness: 0.2 },
  // แถบสกายไลต์ — โปร่งแสง ใช้สเปกกระจกเดียวกับ `PlantShell.tsx`
  skylight: { color: SHELL.buildingGlass, roughness: 0.08, metalness: 0.02, transparent: true, opacity: 0.45 },
  // หน่วยระบบบนดาดฟ้า (เครื่องปรับอากาศ/พัดลมระบายอากาศ)
  unit: { color: SHELL.tank, roughness: 0.6, metalness: 0.15 },
  // ท่อรับน้ำฝน + ราวกันตกทางเดินซ่อมบำรุง
  extra: { color: SHELL.fence, roughness: 0.6, metalness: 0.15 },
};

const ROOF_KEYS = Object.keys(MATERIAL_SPECS) as RoofKey[];

type Buckets = Record<RoofKey, THREE.BufferGeometry[]>;

function emptyBuckets(): Buckets {
  const out = {} as Buckets;
  for (const key of ROOF_KEYS) out[key] = [];
  return out;
}

/** กล่องฐานอยู่ที่ y (เหมือน `box()` ของ `PlantShell.tsx`) */
function box(x: number, y: number, z: number, w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

/** กล่องจุดศูนย์กลางอยู่ที่ (x, y, z) ตรง ๆ — ใช้กับคานแนวนอนที่รู้จุดกลางอยู่แล้ว */
function boxC(x: number, y: number, z: number, w: number, h: number, d: number): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

// หมายเหตุ: สูตรโค้งวอลต์ (`VAULT_MAX_SPAN`/`RISE_RATIO`/`VaultGeom`/
// `computeVault`/`vaultPatch`/`archTopChord`/`vaultYAt`) ย้ายไปอยู่
// `./vaultGeometry.ts` แล้ว (import ด้านบน) — `buildLineHalls` ใน
// `siteIndoorInfra.ts` ใช้สูตรชุดเดียวกันนี้กับโครงหลังคาย่อยรายไลน์ผลิต

function buildHallRoof(layout: PlantLayout): Partial<Record<RoofKey, THREE.BufferGeometry>> {
  const b = emptyBuckets();
  const hall = layout.hall;
  const springY = hall.h;
  const bayPitch = layout.scale.structuralBays.pitch;

  const vaultBays = Math.max(1, Math.ceil(hall.d / VAULT_MAX_SPAN));
  const spanZ = hall.d / vaultBays;

  const frameCount = Math.max(2, Math.round(hall.w / bayPitch));

  const chordR = 0.09;
  const strutT = 0.1;
  const ridgeBeamSize = 0.3;
  const purlinH = 0.14;
  const purlinW = 0.12;
  const monitorHalfWidth = 1.6;
  const monitorHeight = 1.2;
  const ribSpacing = 3.4;
  const skylightSpacing = bayPitch * 3;
  const skylightLen = 2.2;

  for (let vi = 0; vi < vaultBays; vi += 1) {
    const zCenter = -hall.d / 2 + spanZ * (vi + 0.5);
    const v = computeVault(spanZ, springY);

    // --- แผ่นหลังคาเมทัลชีตหลัก (ซ่อนเมื่อเปิดหลังคา) ------------------------
    b.roofDeck.push(vaultPatch(v, 0, v.alpha, hall.w, 0, zCenter, 56));

    // --- ครีบยืนตะเข็บ (standing seam) วิ่งลงตามลาด เว้นระยะตาม X -----------
    const ribCount = Math.max(2, Math.round(hall.w / ribSpacing));
    for (let r = 0; r <= ribCount; r += 1) {
      const x = -hall.w / 2 + (hall.w * r) / ribCount;
      b.rib.push(vaultPatch(v, 0.045, v.alpha, 0.14, x, zCenter, 40));
    }

    // --- แถบสกายไลต์ใกล้สัน เว้นระยะห่างกว่าครีบมาก ให้อ่านเป็นช่องแสง -------
    const skyCount = Math.max(1, Math.floor(hall.w / skylightSpacing));
    for (let s = 0; s < skyCount; s += 1) {
      const x = -hall.w / 2 + skylightSpacing * (s + 0.5) + (hall.w - skylightSpacing * skyCount) / 2;
      b.skylight.push(vaultPatch(v, 0.02, v.alpha * 0.4, skylightLen, x, zCenter, 24));
    }

    // --- โครงถักโค้งต่อเฟรม (ยังคงอยู่เมื่อเปิดหลังคา) ------------------------
    for (let f = 0; f <= frameCount; f += 1) {
      const x = -hall.w / 2 + (hall.w * f) / frameCount;
      b.truss.push(archTopChord(v, x, zCenter, chordR));
      // คานล่าง (bottom chord) ตรงระดับสปริงกิ้งไลน์
      b.truss.push(boxC(x, springY, zCenter, chordR * 1.6, chordR * 1.6, spanZ));
      // เสาค้ำ/เว็บสมาชิก 5 จุดเชื่อมคานล่างกับส่วนโค้งบน
      for (let w = 1; w <= 5; w += 1) {
        const zRel = -v.halfSpan + (2 * v.halfSpan * w) / 6;
        const topY = vaultYAt(v, zRel);
        b.truss.push(box(x, springY, zCenter + zRel, strutT, Math.max(0.05, topY - springY), strutT));
      }
    }

    // --- คานอกไก่ (ridge beam) ตลอดความยาวโรง -------------------------------
    b.truss.push(boxC(0, v.crownY, zCenter, hall.w, ridgeBeamSize, ridgeBeamSize));

    // --- แปพาดขวางโครงถัก 4 ระดับ ให้อ่านเป็นตะแกรงหลังคา -------------------
    for (let p = 1; p <= 4; p += 1) {
      const frac = p / 5;
      const zRel = -v.halfSpan + 2 * v.halfSpan * frac;
      const y = vaultYAt(v, zRel);
      b.truss.push(boxC(0, y, zCenter + zRel, hall.w, purlinH, purlinW));
    }

    // --- หน้าต่างระบายอากาศสันหลังคา (ridge monitor) + ครีบระแนง ------------
    // โครง/ผนังไปอยู่ bucket `truss` (ยังเห็นตอนเปิดหลังคา) ส่วนฝาครอบด้านบน
    // ไปอยู่ `roofDeck` (ซ่อนตอนเปิดหลังคา ให้มองทะลุลงไปเห็นเครื่องจักรได้)
    for (const side of [-1, 1] as const) {
      b.truss.push(box(0, v.crownY, zCenter + side * monitorHalfWidth, hall.w, monitorHeight, 0.1));
    }
    const louvreCount = Math.max(4, Math.round(hall.w / 2.4));
    for (let l = 0; l < louvreCount; l += 1) {
      const x = -hall.w / 2 + (hall.w * (l + 0.5)) / louvreCount;
      for (const ly of [0.32, 0.62, 0.9]) {
        b.truss.push(boxC(x, v.crownY + monitorHeight * ly, zCenter, 0.1, 0.06, monitorHalfWidth * 2));
      }
    }
    const monitorCap = new THREE.CylinderGeometry(monitorHalfWidth, monitorHalfWidth, hall.w, 20, 1, true, 0, Math.PI);
    monitorCap.rotateZ(Math.PI / 2);
    monitorCap.translate(0, v.crownY + monitorHeight, zCenter);
    b.roofDeck.push(monitorCap);

    // --- ชายคา/รางน้ำที่ขอบล่างวอลต์ทั้งสองข้าง (รวมแนวรอยต่อ/รางน้ำหุบเขา) --
    // ขอบนอกสุด (vi=0 ด้าน -Z, vi สุดท้าย ด้าน +Z) และรอยต่อภายในทุกจุดล้วน
    // เป็นแนวเชิงชาย/รางน้ำจริง — สร้างเฉพาะขอบ -Z ของทุกช่วง แล้วปิดขอบ +Z
    // สุดท้ายเพิ่มอีกเส้นเดียว กันรางน้ำที่รอยต่อซ้ำสองชั้น
    const zEdge = zCenter - v.halfSpan;
    b.eave.push(box(0, springY, zEdge, hall.w + 0.6, 0.14, 0.34));
    const gutter = new THREE.CylinderGeometry(0.14, 0.14, hall.w, 12, 1, true, 0, Math.PI);
    gutter.rotateZ(Math.PI / 2);
    gutter.translate(0, springY - 0.1, zEdge);
    b.eave.push(gutter);

    if (vi === vaultBays - 1) {
      const zFar = zCenter + v.halfSpan;
      b.eave.push(box(0, springY, zFar, hall.w + 0.6, 0.14, 0.34));
      const gutterFar = new THREE.CylinderGeometry(0.14, 0.14, hall.w, 12, 1, true, 0, Math.PI);
      gutterFar.rotateZ(Math.PI / 2);
      gutterFar.translate(0, springY - 0.1, zFar);
      b.eave.push(gutterFar);
    }

    // --- ท่อรับน้ำฝน (downpipe) เฉพาะขอบนอกสุดสองข้าง ลงถึงพื้น --------------
    if (vi === 0 || vi === vaultBays - 1) {
      const zPipe = vi === 0 ? zEdge : zCenter + v.halfSpan;
      const pipeCount = Math.max(3, Math.round(hall.w / 16));
      for (let dp = 0; dp <= pipeCount; dp += 1) {
        const x = -hall.w / 2 + (hall.w * dp) / pipeCount;
        const pipe = new THREE.CylinderGeometry(0.07, 0.07, springY, 10);
        pipe.translate(x, springY / 2, zPipe);
        b.extra.push(pipe);
      }
    }

    // --- หน่วยระบบบนดาดฟ้า (HVAC/พัดลมระบายอากาศ) ใกล้สันของบางช่วง ---------
    if (vi % 2 === 0) {
      const ux = (vi / Math.max(1, vaultBays - 1) - 0.5) * hall.w * 0.4;
      const unitY = v.crownY + monitorHeight + 0.05;
      b.unit.push(box(ux - 2.2, unitY, zCenter, 1.6, 0.9, 1.4));
      const fan = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 16);
      fan.translate(ux + 1.4, unitY + 0.25, zCenter);
      b.unit.push(fan);
      const fanCap = new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      fanCap.translate(ux + 1.4, unitY + 0.5, zCenter);
      b.unit.push(fanCap);
    }

    // --- ทางเดินซ่อมบำรุงข้างหน้าต่างระบายอากาศ + ราวกันตกบาง ๆ --------------
    const walkZ = zCenter + monitorHalfWidth + 0.55;
    b.extra.push(box(0, v.crownY, walkZ, hall.w, 0.06, 0.9));
    for (const side of [-1, 1] as const) {
      b.extra.push(box(0, v.crownY + 0.06, walkZ + (side * 0.9) / 2, hall.w, 0.9, 0.04));
    }
  }

  const merged: Partial<Record<RoofKey, THREE.BufferGeometry>> = {};
  for (const key of ROOF_KEYS) {
    const geometry = mergeAll(b[key]);
    if (geometry) merged[key] = geometry;
  }
  return merged;
}

export function HallRoof({ layout, roofOpen = false, highQuality = true }: HallRoofProps) {
  const merged = useMemo(() => buildHallRoof(layout), [layout]);

  useEffect(
    () => () => {
      for (const geometry of Object.values(merged)) geometry?.dispose();
    },
    [merged]
  );

  // เกณฑ์การเลือกเรนเดอร์ต่อก้อน — สร้างเรขาคณิตทั้งหมดไว้แล้วใน `merged`
  // (ไม่ rebuild ตอนสลับปุ่ม) แค่เลือกไม่ใส่เมชลง scene graph
  //   - eave: อยู่เสมอ ทั้งเปิด/ปิดหลังคา (ชายคา/รางน้ำที่ระดับสปริงกิ้งไลน์ —
  //     ระดับเดียวกับยอดผนัง จึงยังอ่านเป็นเค้าโครงอาคารได้แม้หลังคาเปิด)
  //   - truss (โครงถักโค้ง คานอกไก่ แป โครงหน้าต่างระบายอากาศสันหลังคา):
  //     หายเมื่อเปิดหลังคา — เป็นเหล็กโครงหลังคาล้วน ๆ ไม่มีอะไรที่ไม่ใช่
  //     ชิ้นส่วนหลังคาปนอยู่ในก้อนนี้
  //   - roofDeck/skylight: หายเมื่อเปิดหลังคา
  //   - rib: หายเมื่อเปิดหลังคา หรือปิด highQuality
  //   - unit: หายเมื่อเปิดหลังคา หรือปิด highQuality
  //   - extra (ท่อรับน้ำฝน/ทางเดินซ่อมบำรุง/ราวกันตกบนสันหลังคา): หายเมื่อ
  //     เปิดหลังคา (ทั้งคู่เป็นของที่ติดอยู่บนหลังคา ลอยค้างกลางอากาศถ้าปล่อย
  //     ให้เห็นตอนหลังคาเปิด) หรือปิด highQuality
  const visible: Record<RoofKey, boolean> = {
    truss: !roofOpen,
    eave: true,
    roofDeck: !roofOpen,
    skylight: !roofOpen,
    rib: !roofOpen && highQuality,
    unit: !roofOpen && highQuality,
    extra: !roofOpen && highQuality,
  };

  return (
    <group>
      {ROOF_KEYS.map((key) => {
        if (!visible[key]) return null;
        const geometry = merged[key];
        if (!geometry) return null;
        const spec = MATERIAL_SPECS[key];
        return (
          <mesh key={key} geometry={geometry} castShadow receiveShadow raycast={() => null}>
            <meshStandardMaterial
              color={spec.color}
              roughness={spec.roughness}
              metalness={spec.metalness}
              transparent={spec.transparent}
              opacity={spec.opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default HallRoof;
