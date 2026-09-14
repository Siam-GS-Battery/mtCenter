import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { PlantLayout } from "../../../../lib/plantLayout";
import { SITE_GROUND_MARGIN, type PlantBuilding } from "../../../../lib/plantSite";
import { mergeAll, slabGeometry } from "./geometryKit";
import { FLOOR, SHELL } from "./palette";
// อ่าน (ไม่แก้) `excludeRanges` ตัวเดียวกับที่ `buildGreenery`/`buildRingRoad`
// ใช้เจาะช่องให้ท่ารับ-ส่งของ/ถนนวงรอบอยู่แล้ว — ดูคอมเมนต์ที่จุดเจาะผนังด้านล่าง
import { excludeRanges } from "./siteGreenery";
// อ่าน (ไม่แก้ นอกจาก export ค่านี้) `DOCK_DOOR_W` ตัวเดียวกับที่ `siteLogistics.ts`'s
// `buildLoadingDock` วาดประตูม้วนท่ารับ-ส่งของจริง — ใช้ตัดสินความกว้างช่องผนัง
// ตรงหน้าท่า แทนที่จะคัดลอกค่าคงที่แยกไว้อีกชุด (เดิมชื่อ `DOOR_W_REF`)
import { DOCK_DOOR_W } from "./siteLogistics";

/**
 * ===========================================================================
 * PLANT SHELL — พื้น โครงสร้างอาคาร และไซต์ภายนอก
 * ===========================================================================
 *
 * วาดทุกอย่างที่ไม่ใช่เครื่องจักรและไม่ใช่สายพาน โดยอ่านจาก `layout.site`
 * (`PlantSite`) ที่ `plantSite.ts` สเกลตามผังจริงไว้แล้ว — โซน ห้อง อาคาร
 * ถนน ลานจอด ลานหญ้า ต้นไม้ เสาไฟ รั้ว โรงเก็บ ถังเก็บ ทางเดิน แปลงปลูก
 *
 * ทุกอย่างในนี้เป็นของนิ่ง จึง merge ตามวัสดุเป็นก้อนใหญ่ก้อนเดียวเหมือน
 * `ProductionLines.tsx` เหลือราว 12 draw call สำหรับทั้งไซต์
 *
 * ไม่มีหลังคาปิดทับโดยเจตนา
 * ------------------------
 * ผังนี้ถูกดูจากมุมสูงเป็นหลัก (มุม "plant"/"top" ใน HUD) หลังคาทึบจะบัง
 * เครื่องจักรทั้งโรงจนมองไม่เห็นอะไรเลย — เดิมเคยมีทั้งคานขอบหลังคารอบอาคาร
 * และคานพาดกลางโรงตามแนว bay แต่เอาออกทั้งคู่แล้ว (ดูคอมเมนต์ที่จุดสร้างผนัง/
 * คานด้านล่าง) เพราะคานพาดกลางโรงยาวข้ามพื้นที่เครื่องจักรทั้งผืนและไปบังการ
 * คลิกเลือกเครื่องจักร ไม่ใช่แค่บังสายตา ส่วนคานขอบหลังคาก็เป็นโครงลอยเหนือหัว
 * ที่ผู้ใช้ขอให้ไม่เหลือไว้ — ตอนนี้จึงไม่มีสิ่งใดพาดผ่านเหนือพื้นที่เครื่องจักร
 * หรือลอยอยู่เหนืออาคารเลย เหลือแค่ผนังเตี้ยรอบอาคาร (`wallH`) บอกขอบเขต
 *
 * ทุกเมชในไฟล์นี้ปิด raycast (`raycast={() => null}`) — ก้อนพวกนี้เป็นฉาก
 * นิ่งอย่างเดียว ไม่ใช่ของที่คลิกได้ ตัวรับคลิกเครื่องจักรจริงอยู่ที่
 * `MachineInstances.tsx` (`PickProxyInstances`) เท่านั้น
 */

/** คีย์วัสดุของเปลือกอาคาร/ไซต์ */
type ShellKey =
  | "apron"
  | "slab"
  | "zone"
  | "grass"
  | "road"
  | "roadLine"
  | "column"
  | "beam"
  | "wall"
  | "building"
  | "roof"
  | "glass"
  | "foliage"
  | "trunk"
  | "metal";

const MATERIAL_SPECS: Record<ShellKey, { color: string; roughness: number; metalness: number }> = {
  // พื้น/คอนกรีต — คอนกรีตผนึกผิว (sealed concrete) ให้คีย์ไลต์ไล้เป็นเงานุ่ม
  // แทนก้อนด้านแบบดินน้ำมันเดิม
  apron: { color: FLOOR.apron, roughness: 0.75, metalness: 0.03 },
  slab: { color: FLOOR.slab, roughness: 0.75, metalness: 0.03 },
  zone: { color: FLOOR.zone, roughness: 0.75, metalness: 0.03 },
  grass: { color: FLOOR.grass, roughness: 0.9, metalness: 0.0 },
  road: { color: FLOOR.road, roughness: 0.75, metalness: 0.03 },
  roadLine: { color: FLOOR.roadLine, roughness: 0.65, metalness: 0.04 },
  // เหล็กโครงสร้างทาสี (เสา/คาน)
  column: { color: SHELL.column, roughness: 0.6, metalness: 0.15 },
  beam: { color: SHELL.beam, roughness: 0.6, metalness: 0.15 },
  // ผิวสถาปัตยกรรมด้าน (ผนัง/อาคาร)
  wall: { color: SHELL.wall, roughness: 0.8, metalness: 0.05 },
  building: { color: SHELL.building, roughness: 0.8, metalness: 0.05 },
  // หลังคาอาคารไซต์ (พาราเปต/หลังคาลาด/สันหลังคา/ชายคา) — สีเดียวกับ
  // `SHELL.roofEdge` ที่มีอยู่แล้วในพาเลท (ใช้คู่กับ "eave" ใน siteShared.ts)
  // จึงไม่ต้องเพิ่มโทนสีใหม่ในไฟล์ palette.ts
  roof: { color: SHELL.roofEdge, roughness: 0.55, metalness: 0.1 },
  glass: { color: SHELL.buildingGlass, roughness: 0.08, metalness: 0.02 },
  foliage: { color: SHELL.foliage, roughness: 0.9, metalness: 0.0 },
  trunk: { color: SHELL.trunk, roughness: 0.9, metalness: 0.0 },
  // ถังเก็บ/เสาไฟ/รั้ว — จัดเป็นเหล็กโครงสร้างทาสีเช่นกัน
  metal: { color: SHELL.tank, roughness: 0.6, metalness: 0.15 },
};

const SHELL_KEYS = Object.keys(MATERIAL_SPECS) as ShellKey[];

type Buckets = Record<ShellKey, THREE.BufferGeometry[]>;

function emptyBuckets(): Buckets {
  const out = {} as Buckets;
  for (const key of SHELL_KEYS) out[key] = [];
  return out;
}

/** กล่องหนึ่งใบ ณ พิกัดโลก (ฐานอยู่ที่ `y`) */
function box(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
}

/** ทรงกระบอกตั้ง ณ พิกัดโลก (ฐานอยู่ที่ `y`) */
function pillar(
  x: number,
  y: number,
  z: number,
  radius: number,
  height: number,
  segments = 12
): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(radius, radius * 1.08, height, segments);
  g.translate(x, y + height / 2, z);
  return g;
}

/**
 * หลังคาจั่ว (gable) สำหรับอาคาร `roofStyle: "pitched"` — สันหลังคาโค้งมน
 * (ทรงกระบอก) + แผ่นลาดสองผืน + ชายคายื่นโค้งมนรอบขอบ + เส้นรางน้ำใต้ชายคา
 *
 * เลือกแนวสันหลังคาไปตามด้านที่ยาวกว่าของอาคาร (`w` หรือ `d`) ให้ลาดข้ามด้าน
 * สั้นเสมอ — สัดส่วนสมจริงกว่าตายตัวว่าลาดไปทาง Z เสมอแบบเดิม
 */
function addPitchedRoof(b: Buckets, building: PlantBuilding, topY: number): void {
  const ridgeAlongX = building.w >= building.d;
  const span = ridgeAlongX ? building.d : building.w; // ด้านที่หลังคาลาดข้าม
  const ridgeLen = (ridgeAlongX ? building.w : building.d) + 1.0; // ยื่นเลยแนวสันเล็กน้อย
  const overhang = 0.6;
  const rise = Math.min(span * 0.22, 3.0); // "รูปทรงโค้งมน/นุ่มนวล" — จั่วเตี้ย ไม่ชันแหลม
  const run = span / 2 + overhang;
  const paneLen = Math.sqrt(run * run + rise * rise);
  const angle = Math.atan2(rise, run);
  const eaveY = topY + 0.15;

  // แผ่นลาดหลังคาสองผืน
  for (const sign of [-1, 1] as const) {
    const g = ridgeAlongX
      ? new THREE.BoxGeometry(ridgeLen, 0.22, paneLen)
      : new THREE.BoxGeometry(paneLen, 0.22, ridgeLen);
    if (ridgeAlongX) {
      g.rotateX(sign * angle);
      g.translate(building.x, eaveY + rise / 2, building.z + sign * (run / 2));
    } else {
      g.rotateZ(-sign * angle);
      g.translate(building.x + sign * (run / 2), eaveY + rise / 2, building.z);
    }
    b.roof.push(g);
  }

  // สันหลังคา — ทรงกระบอกนอน (โค้งมนโดยธรรมชาติ แทนกล่องเหลี่ยมแบบเดิม)
  const ridgeCap = new THREE.CylinderGeometry(0.26, 0.26, ridgeLen, 12);
  if (ridgeAlongX) ridgeCap.rotateZ(Math.PI / 2);
  else ridgeCap.rotateX(Math.PI / 2);
  ridgeCap.translate(building.x, eaveY + rise + 0.02, building.z);
  b.roof.push(ridgeCap);

  // ชายคายื่นโค้งมน (eave fascia) + เส้นรางน้ำ รอบขอบชายคาทั้งสองฝั่ง
  const fasciaLen = ridgeLen - 0.6;
  for (const sign of [-1, 1] as const) {
    const fx = ridgeAlongX ? building.x : building.x + sign * (run - 0.1);
    const fz = ridgeAlongX ? building.z + sign * (run - 0.1) : building.z;
    const fascia = ridgeAlongX
      ? new RoundedBoxGeometry(fasciaLen, 0.3, 0.32, 1, 0.08)
      : new RoundedBoxGeometry(0.32, 0.3, fasciaLen, 1, 0.08);
    fascia.translate(fx, eaveY - 0.18, fz);
    b.roof.push(fascia);

    const gutter = new THREE.CylinderGeometry(0.06, 0.06, fasciaLen, 8);
    if (ridgeAlongX) gutter.rotateZ(Math.PI / 2);
    else gutter.rotateX(Math.PI / 2);
    gutter.translate(fx, eaveY - 0.36, fz);
    b.metal.push(gutter);
  }
}

/**
 * หลังคาราบ (`roofStyle` ว่าง/"flat") — พาราเปตบางรอบดาดฟ้าแทนคานยื่นก้อน
 * ใหญ่แบบเดิม ("ฝาหลังคายื่น") พร้อมหน่วยงานระบบเล็ก ๆ บนดาดฟ้าของอาคารใหญ่
 */
function addFlatRoofDetail(b: Buckets, building: PlantBuilding, topY: number, isLarge: boolean): void {
  const parapetH = 0.5;
  const t = 0.28;
  const ow = building.w + 0.4;
  const od = building.d + 0.4;
  b.roof.push(box(building.x, topY, building.z + od / 2 - t / 2, ow, parapetH, t));
  b.roof.push(box(building.x, topY, building.z - od / 2 + t / 2, ow, parapetH, t));
  b.roof.push(box(building.x + ow / 2 - t / 2, topY, building.z, t, parapetH, od));
  b.roof.push(box(building.x - ow / 2 + t / 2, topY, building.z, t, parapetH, od));

  if (isLarge) {
    // หน่วยระบบบนดาดฟ้า (เช่น เครื่องปรับอากาศ) — เพิ่มรายละเอียดให้อาคารใหญ่
    b.metal.push(box(building.x - building.w * 0.18, topY, building.z + building.d * 0.15, 1.6, 0.8, 1.2));
    b.metal.push(box(building.x + building.w * 0.15, topY, building.z - building.d * 0.1, 1.4, 0.7, 1.4));
  }
}

/**
 * ประกอบเรขาคณิตของทั้งไซต์
 *
 * แยกเป็นฟังก์ชันบริสุทธิ์ (ไม่ใช่ hook) เพื่อให้ทดสอบ/อ่านลำดับการวาดได้ตรง ๆ
 * ลำดับความสูง y ไล่จากล่างขึ้นบนทีละ 1-2 ซม. เพื่อกัน z-fighting ระหว่าง
 * แผ่นพื้นที่ทับกัน (หญ้า → ลานคอนกรีต → ถนน → สแลบใน → พื้นโซน → เส้นตี)
 */
function buildShell(layout: PlantLayout): Partial<Record<ShellKey, THREE.BufferGeometry>> {
  const b = emptyBuckets();
  const site = layout.site;
  const hall = layout.hall;

  // --- พื้นไซต์: หญ้าคลุมทั้งผืน แล้วปูลานคอนกรีตทับ ------------------------
  const siteW = hall.w * SITE_GROUND_MARGIN;
  const siteD = hall.d * SITE_GROUND_MARGIN;
  b.grass.push(slabGeometry(0, 0, siteW, siteD, 0, 0.06));
  for (const g of site.grass) b.grass.push(slabGeometry(g.x, g.z, g.w, g.d, 0.06, 0.03));
  b.apron.push(slabGeometry(0, 0, hall.w * 1.35, hall.d * 1.3, 0.09, 0.05));

  // --- ถนนและเส้นจราจร -----------------------------------------------------
  for (const road of site.roads) {
    const isX = road.dir === "x";
    const w = isX ? road.len : road.w;
    const d = isX ? road.w : road.len;
    b.road.push(slabGeometry(road.x, road.z, w, d, 0.14, 0.04));
    // เส้นประกลางถนน — 9 ขีดต่อช่วง พอให้อ่านเป็นถนนโดยไม่เพิ่มชิ้นส่วนเยอะ
    const dashes = 9;
    for (let i = 0; i < dashes; i += 1) {
      const t = -road.len / 2 + (road.len * (i + 0.5)) / dashes;
      const dashLen = road.len / dashes * 0.45;
      b.roadLine.push(
        isX
          ? slabGeometry(road.x + t, road.z, dashLen, 0.18, 0.18, 0.02)
          : slabGeometry(road.x, road.z + t, 0.18, dashLen, 0.18, 0.02)
      );
    }
  }

  // --- ลานจอดรถ + เส้นแบ่งช่อง --------------------------------------------
  for (const park of site.parking) {
    b.road.push(slabGeometry(park.x, park.z, park.w, park.d, 0.14, 0.04));
    const bays = Math.max(2, Math.round(park.w / 2.6));
    for (let i = 0; i <= bays; i += 1) {
      const x = park.x - park.w / 2 + (park.w * i) / bays;
      b.roadLine.push(slabGeometry(x, park.z, 0.12, park.d * 0.9, 0.18, 0.02));
    }
  }

  // --- ทางเดินและแปลงปลูก --------------------------------------------------
  for (const walk of site.walkways) {
    const isX = walk.dir === "x";
    b.apron.push(
      slabGeometry(walk.x, walk.z, isX ? walk.len : 1.8, isX ? 1.8 : walk.len, 0.16, 0.03)
    );
  }
  for (const bed of site.flowerBeds) b.foliage.push(slabGeometry(bed.x, bed.z, bed.w, bed.d, 0.16, 0.22));

  // --- สแลบพื้นในอาคาร + พื้นโซนการผลิต -----------------------------------
  b.slab.push(slabGeometry(0, 0, hall.w, hall.d, 0.2, 0.06));
  for (const zone of site.zones) {
    b.zone.push(slabGeometry(zone.x, zone.z, zone.w, zone.d, 0.26, 0.03));
    // ขอบโซน — แถบบางรอบสี่ด้าน อ่านเป็นเส้นแบ่งพื้นที่ทำงาน
    //
    // Y = 0.33 (top 0.35), not 0.30 — bumped up to leave room below for the
    // blueprint reference grid (`FloorGrid.tsx`, y=0.295) and the instanced
    // contact shadows (`MachineInstances.tsx`, y=0.31) to both sit strictly
    // between the zone platform (top 0.29) and these stripes. Painted safety
    // markings must always read as the top-most floor decal — never crossed
    // by a grid line or dimmed by a machine's contact shadow.
    const t = 0.35;
    b.roadLine.push(slabGeometry(zone.x, zone.z + zone.d / 2, zone.w, t, 0.33, 0.02));
    b.roadLine.push(slabGeometry(zone.x, zone.z - zone.d / 2, zone.w, t, 0.33, 0.02));
    b.roadLine.push(slabGeometry(zone.x + zone.w / 2, zone.z, t, zone.d, 0.33, 0.02));
    b.roadLine.push(slabGeometry(zone.x - zone.w / 2, zone.z, t, zone.d, 0.33, 0.02));
  }

  // --- ผนังเตี้ยรอบอาคาร + คานขอบหลังคา + เสาโครงสร้าง --------------------
  // ผนังสูงแค่ 1/4 ของอาคารจริง เพื่อให้เห็นขอบเขตโรงงานแต่ไม่บังของข้างใน
  const wallH = hall.h * 0.26;
  const wallT = 0.5;

  // ผนังฝั่งใต้ (-Z) เป็นฝั่งเดียวกับท่ารับ-ส่งของเสมอ — `siteLogistics.ts`'s
  // `buildLoadingDock` ปักผนังท่าไว้ที่ `wallZ = -hallD / 2` ตรงๆ ไม่ขึ้นกับ
  // ตำแหน่งจริงของโซน WH บนแกน Z เลย (ไฟล์นั้นห้ามแก้จึงอ้างอิงจากพฤติกรรม
  // ของมัน ไม่ใช่เดา) เดิมผนังฝั่งนี้เป็นกล่องทึบตันยาวเต็มผนัง ทำให้ประตูม้วน
  // ของท่า (ภาพวาดทับผนังอีกชั้นใน `siteLogistics.ts`) เป็นแค่ลวดลาย — รถยก
  // (roadmap step 13, `Forklifts.tsx`) ที่วิ่งออกไปท่ารับ-ส่งของจึงต้องมุดทะลุ
  // กล่องทึบนี้ทุกรอบ เจาะช่องกว้างเท่าประตูท่าจริงตรงตำแหน่ง X ของโซน WH จริง
  // ด้วย `excludeRanges` (เทคนิคเดียวกับที่ `buildGreenery` เจาะแนวพุ่มไม้ และ
  // `buildRingRoad` เจาะถนนวงรอบให้สิ่งปลูกสร้างจริง) แทนที่จะวาดกล่องทึบเดียว
  //
  // `DOCK_DOOR_W` import ตรงจาก `siteLogistics.ts` (export ไว้ให้ไฟล์นี้โดยเฉพาะ
  // — เดิมคัดลอกค่าเป็น `DOOR_W_REF` แยกไว้ต่างหากเพราะไฟล์นั้นไม่ export ค่านี้
  // มาก่อน ถ้าใครขยับ `DOCK_DOOR_W` แล้วลืมขยับค่าที่คัดลอกไว้ ผนังกับประตูจะไม่
  // ตรงกันเงียบๆ จึง import ตัวเดียวกันแทน)
  //
  // เผื่อระยะขับผ่านจริงอีก 0.4 ม. ต่อข้าง (รถยก 1.3 ม. + กระจกมองข้าง/ระยะ
  // เลี้ยว) ไม่ใช่ตัดแค่พอดีความกว้างประตู — ไม่มีเสาโครงสร้างใดในอาคารเลย
  // ("ไม่มีเสาในอาคาร โดยเจตนา" ด้านล่าง) และคานขอบหลังคา/คานพาดของไฟล์นี้
  // อยู่ที่ y = hall.h เท่านั้น (10.5 ม. — สูงกว่าผนังเตี้ยนี้เกือบ 4 เท่า)
  // ช่องที่เจาะจึงไม่มีทางไปชนคาน/เสาใด ๆ เลยไม่ว่าจะกว้างแค่ไหน
  //
  // ผนังนี้เป็นกล่องทึบเต็มความสูง `wallH` (ไม่ใช่แค่ครึ่งล่าง) ช่องที่เจาะจึง
  // เปิดโล่งทั้งความสูง — ไม่ต้องเทียบกับความสูงมาสต์รถยกเลยเพราะไม่มีวัสดุ
  // เหลืออยู่ในช่องนั้นให้ชน (ต่างจาก `DOCK_DOOR_H` = 3.4 ม. ของประตูม้วนจริง
  // ที่ `siteLogistics.ts` วาดไว้ ซึ่งเผื่อไว้มากกว่ามาสต์รถยก `FORKLIFT_MAST_TOP_Y`
  // ≈ 2.79 ม. อยู่แล้ว 0.61 ม. — สอดคล้องกัน ไม่ใช่ผนังนี้แคบกว่า)
  const whZone = site.zones.find((z) => z.id === "WH");
  const southWallZ = -hall.d / 2;
  if (whZone) {
    const doorHalf = DOCK_DOOR_W / 2 + 0.4;
    const segments = excludeRanges(-hall.w / 2, hall.w / 2, [
      { x0: whZone.x - doorHalf, x1: whZone.x + doorHalf },
    ]);
    for (const seg of segments) {
      const segLen = seg.x1 - seg.x0;
      if (segLen <= 0.05) continue;
      b.wall.push(box((seg.x0 + seg.x1) / 2, 0.2, southWallZ, segLen, wallH, wallT));
    }
  } else {
    // ไม่มีโซน WH ในผัง (ไม่ควรเกิดขึ้นจริง) — คงผนังทึบเดิมไว้ ไม่เดาตำแหน่งช่อง
    b.wall.push(box(0, 0.2, southWallZ, hall.w, wallH, wallT));
  }

  b.wall.push(box(0, 0.2, hall.d / 2, hall.w, wallH, wallT));
  b.wall.push(box(hall.w / 2, 0.2, 0, wallT, wallH, hall.d));
  b.wall.push(box(-hall.w / 2, 0.2, 0, wallT, wallH, hall.d));

  // ไม่มีคานขอบหลังคารอบอาคาร (perimeter roof-edge beam) อีกต่อไป
  // -------------------------------------------------------------
  // เดิมมีคานกรอบสี่ด้านที่ y = hall.h (ความสูงจริงของอาคาร) ไว้บอกขนาด/ความสูง
  // โรงแบบคร่าว ๆ — เอาออกตามที่ผู้ใช้ขอให้ไม่เหลือโครงหลังคาเลย ผนังเตี้ยรอบ
  // อาคาร (`wallH = hall.h * 0.26` ด้านบน) เดิมก็จบที่ราว 1 ใน 4 ของความสูงจริง
  // อยู่แล้ว เหนือผนังขึ้นไปเป็นที่โล่งเสมอ (ไม่เคยมีอะไรเติมเต็มถึง hall.h)
  // การเอาคานกรอบนี้ออกจึงไม่ทำให้ผนังดูขาดตอนเพิ่มขึ้นจากเดิม — แค่เอากรอบ
  // เส้นลอยเหนือหัวออกไปเท่านั้น

  // ไม่มีเสาในอาคาร โดยเจตนา
  // ---------------------------
  // เดิมปลูกเสาตามตาราง bay ทั่วพื้นโรง ซึ่งถูกตามหลักโครงสร้าง แต่ในการใช้งาน
  // จริงมันพัง: เสาสูง 10.5 ม. หลายร้อยต้นยืนขึ้นมาบังเครื่องจักรจนมองจากมุม
  // ระดับสายตา/ระดับไลน์แล้วเห็นแต่เสา ไม่เห็นเครื่อง — ซึ่งเป็นสิ่งเดียวที่
  // หน้านี้มีไว้ให้ดู
  //
  // ไม่มีคานพาดกลางโรงตามแนว bay อีกต่อไป (ลบออกทั้งหมด)
  // ------------------------------------------------------
  // เดิมมีคานพาดตามแนว z ทุกระยะ bay จริง (`site.hall.bay`) พาดยาวเต็มความลึก
  // อาคาร (`hall.d`) ที่ y = hall.h ข้ามพื้นที่เครื่องจักรทั้งผืน — ผู้ใช้แจ้งว่า
  // คลิกเลือกเครื่องจักรติด ๆ ดับ ๆ ("ทำงานบ้างไม่ทำงานบ้าง") และสงสัยว่าโครง
  // หลังคาบัง ตรวจสอบแล้วพบว่าเมชทุกก้อนในไฟล์นี้ (รวมคานชุดนี้) ไม่เคยปิด
  // `raycast` เลย — คานพาดยาวเหล่านี้ซึ่งวางตัดผ่านเหนือเครื่องจักรแทบทุกแถว
  // คือตัวรับ ray ปลอมที่สุ่มบังทางคลิกไปยังเครื่องจักรจริงเบื้องล่าง (ตรงกับ
  // อาการ "บางทีติด บางทีไม่ติด" ขึ้นกับมุมยิง ray พอดีหรือไม่) แก้สองชั้น:
  // (1) ปิด raycast ทุกเมชในไฟล์นี้ด้านล่าง (2) เอาคานชุดนี้ออกทั้งหมดตามที่
  // ผู้ใช้ขอให้ลดโครงสร้างหลังคาลง — เหลือไว้แค่คานขอบหลังคารอบอาคาร (ด้านบน)
  // ซึ่งอยู่ที่ขอบเขตอาคารเท่านั้น ไม่พาดผ่านพื้นที่เครื่องจักรตรงกลางเลย

  // --- ห้องบริการในอาคาร --------------------------------------------------
  for (const room of site.rooms) {
    b.wall.push(box(room.x, 0.26, room.z, room.w, Math.min(6, hall.h * 0.55), room.d));
  }

  // --- อาคารภายนอก (สำนักงาน ฯลฯ) พร้อมแถบกระจกต่อชั้น -------------------
  //
  // เดิมทุกอาคารเป็นกล่องเทาทึบ + คานยื่นแบนบนหัว ไม่เคยอ่าน `roofStyle`
  // เลยแม้ข้อมูลจะระบุไว้ ("dead data") — ตอนนี้แยกสองทาง: อาคารที่ตั้งใจ
  // ให้เป็นหลังคาจั่ว (`addPitchedRoof`) กับอาคารหลังคาราบ (`addFlatRoofDetail`)
  // นอกจากนี้เพิ่มฐานคาดตีนอาคาร เสาเหลี่ยมมุมอาคาร มุลเลียนคั่นจังหวะแถบกระจก
  // และกันสาดทางเข้าของอาคารหลังใหญ่ ให้อ่านเป็นอาคารจริงมากขึ้น
  for (const building of site.buildings) {
    const baseY = 0.14;
    const topY = baseY + building.h;
    const isLarge = building.w * building.d > 150;

    // ฐานคาดตีนอาคาร (plinth) — ยื่นเล็กน้อยจากผนัง บอกน้ำหนักที่ติดพื้น
    b.wall.push(box(building.x, baseY, building.z, building.w + 0.5, 0.3, building.d + 0.5));

    // ตัวอาคาร (เริ่มเหนือฐานคาดตีน)
    b.building.push(box(building.x, baseY + 0.3, building.z, building.w, building.h - 0.3, building.d));

    // เสาเหลี่ยมมุมอาคาร (pilaster) 4 ต้น — เน้นมุมอาคารให้ดูมีโครงสร้าง
    const pilasterW = 0.32;
    for (const cx of [-1, 1] as const) {
      for (const cz of [-1, 1] as const) {
        b.wall.push(
          box(
            building.x + cx * (building.w / 2 - pilasterW / 2),
            baseY + 0.3,
            building.z + cz * (building.d / 2 - pilasterW / 2),
            pilasterW,
            building.h - 0.3,
            pilasterW
          )
        );
      }
    }

    const floors = Math.max(1, building.floors);
    for (let f = 0; f < floors; f += 1) {
      const y = baseY + (building.h * (f + 0.55)) / floors;
      const bandH = (building.h / floors) * 0.4;
      const bandW = building.w * 0.82;
      const bandD = building.d * 0.82;
      // แถบกระจกยื่นออกจากผนัง 6 ซม. กัน z-fighting กับตัวอาคาร
      b.glass.push(box(building.x, y, building.z + building.d / 2 + 0.03, bandW, bandH, 0.06));
      b.glass.push(box(building.x, y, building.z - building.d / 2 - 0.03, bandW, bandH, 0.06));
      b.glass.push(box(building.x + building.w / 2 + 0.03, y, building.z, 0.06, bandH, bandD));
      b.glass.push(box(building.x - building.w / 2 - 0.03, y, building.z, 0.06, bandH, bandD));

      // มุลเลียนคั่นจังหวะแถบกระจกหน้า/หลัง — ให้จังหวะผนังกระจกอ่านเป็นแนวเสา
      // ไม่ใช่แผ่นกระจกเรียบแผ่นเดียว
      const mullions = 3;
      for (let m = 1; m < mullions; m += 1) {
        const mx = building.x - bandW / 2 + (bandW * m) / mullions;
        b.wall.push(box(mx, y - bandH / 2, building.z + building.d / 2 + 0.02, 0.06, bandH, 0.08));
        b.wall.push(box(mx, y - bandH / 2, building.z - building.d / 2 - 0.02, 0.06, bandH, 0.08));
      }
    }

    // กันสาดทางเข้า (entrance canopy) — เฉพาะอาคารหลังใหญ่ ด้านหน้า (+z)
    if (isLarge) {
      const canopyY = baseY + building.h * 0.32;
      b.beam.push(box(building.x, canopyY, building.z + building.d / 2 + 1.1, building.w * 0.5, 0.18, 2.2));
      for (const cx of [-1, 1] as const) {
        b.metal.push(pillar(building.x + cx * building.w * 0.2, baseY, building.z + building.d / 2 + 2.1, 0.1, canopyY - baseY, 8));
      }
    }

    // หลังคา — จั่วโค้งมนสำหรับ `roofStyle: "pitched"`, ราบ+พาราเปตสำหรับที่เหลือ
    if (building.roofStyle === "pitched") {
      addPitchedRoof(b, building, topY);
    } else {
      addFlatRoofDetail(b, building, topY, isLarge);
    }
  }

  // --- โรงเก็บของ (หลังคาลาดบนเสาสี่ต้น) ----------------------------------
  for (const shed of site.sheds) {
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        b.metal.push(
          pillar(shed.x + (sx * shed.w) / 2.4, 0.14, shed.z + (sz * shed.d) / 2.4, 0.14, shed.h, 8)
        );
      }
    }
    const roof = new THREE.BoxGeometry(shed.w, 0.22, shed.d);
    roof.rotateZ(0.06);
    roof.translate(shed.x, 0.14 + shed.h, shed.z);
    b.beam.push(roof);
  }

  // --- ถังเก็บ (tank farm) — ถังทรงกระบอกพร้อมฝาโดมและวงแหวนรัด ----------
  for (const farm of site.tankFarms) {
    for (let i = 0; i < farm.n; i += 1) {
      const x = farm.x + (i - (farm.n - 1) / 2) * (farm.r * 2.6);
      b.metal.push(pillar(x, 0.14, farm.z, farm.r, farm.h, 20));
      const dome = new THREE.SphereGeometry(farm.r, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2);
      dome.translate(x, 0.14 + farm.h, farm.z);
      b.metal.push(dome);
      for (const ry of [0.35, 0.7]) {
        const ring = new THREE.TorusGeometry(farm.r + 0.04, 0.06, 6, 20);
        ring.rotateX(Math.PI / 2);
        ring.translate(x, 0.14 + farm.h * ry, farm.z);
        b.metal.push(ring);
      }
    }
  }

  // --- ต้นไม้ (ลำต้น + พุ่มสามชั้น) ---------------------------------------
  for (const tree of site.trees) {
    b.trunk.push(pillar(tree.x, 0.12, tree.z, 0.16, 2.2, 8));
    const crowns: Array<[number, number]> = [
      [2.1, 1.5],
      [3.0, 1.15],
      [3.7, 0.75],
    ];
    for (const [y, r] of crowns) {
      const crown = new THREE.SphereGeometry(r, 10, 7);
      crown.translate(tree.x, 0.12 + y, tree.z);
      b.foliage.push(crown);
    }
  }

  // --- เสาไฟถนน (เสา + แขนยื่น + เรือนโคม) --------------------------------
  for (const pole of site.poles) {
    b.metal.push(pillar(pole.x, 0.14, pole.z, 0.12, 7, 8));
    b.metal.push(box(pole.x + 0.6, 0.14 + 6.9, pole.z, 1.3, 0.12, 0.12));
    b.metal.push(box(pole.x + 1.2, 0.14 + 6.7, pole.z, 0.6, 0.18, 0.35));
  }

  // --- รั้วรอบไซต์ (เสา + คานบน-ล่าง) -------------------------------------
  for (const fence of site.fences) {
    const isX = fence.dir === "x";
    const posts = Math.max(2, Math.round(fence.len / 3));
    for (let i = 0; i <= posts; i += 1) {
      const t = -fence.len / 2 + (fence.len * i) / posts;
      b.metal.push(
        pillar(isX ? fence.x + t : fence.x, 0.12, isX ? fence.z : fence.z + t, 0.07, 2.1, 6)
      );
    }
    for (const railY of [0.9, 1.9]) {
      b.metal.push(
        isX
          ? box(fence.x, railY, fence.z, fence.len, 0.07, 0.07)
          : box(fence.x, railY, fence.z, 0.07, 0.07, fence.len)
      );
    }
  }

  const merged: Partial<Record<ShellKey, THREE.BufferGeometry>> = {};
  for (const key of SHELL_KEYS) {
    const geometry = mergeAll(b[key]);
    if (geometry) merged[key] = geometry;
  }
  return merged;
}

export interface PlantShellProps {
  layout: PlantLayout;
}

export function PlantShell({ layout }: PlantShellProps) {
  const merged = useMemo(() => buildShell(layout), [layout]);

  useEffect(
    () => () => {
      for (const geometry of Object.values(merged)) geometry?.dispose();
    },
    [merged]
  );

  return (
    <group>
      {SHELL_KEYS.map((key) => {
        const geometry = merged[key];
        if (!geometry) return null;
        const spec = MATERIAL_SPECS[key];
        // พื้นราบไม่ต้องทอดเงา (เงาของแผ่นบางบนแผ่นบางให้แต่ noise) แต่ต้อง
        // รับเงาจากเครื่องจักรและเสา ซึ่งคือสิ่งที่ทำให้ฉากมีความลึก
        const isFloor =
          key === "apron" || key === "slab" || key === "zone" || key === "grass" || key === "road" || key === "roadLine";
        return (
          <mesh
            key={key}
            geometry={geometry}
            castShadow={!isFloor}
            receiveShadow
            raycast={() => null}
          >
            <meshStandardMaterial
              color={spec.color}
              roughness={spec.roughness}
              metalness={spec.metalness}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default PlantShell;
