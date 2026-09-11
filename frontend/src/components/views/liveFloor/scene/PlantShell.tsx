import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PlantLayout } from "../../../../lib/plantLayout";
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
 * เครื่องจักรทั้งโรงจนมองไม่เห็นอะไรเลย ที่วาดแทนคือ "ขอบหลังคา" (คานขอบ
 * รอบอาคาร) กับเสาโครงสร้างตามระยะ bay จริง ซึ่งให้ความรู้สึกว่าอยู่ในอาคาร
 * และให้ความลึกจากเงาเสา โดยยังเห็นไลน์การผลิตข้างใน
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
  const siteW = hall.w * 1.9;
  const siteD = hall.d * 1.9;
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

  // คานขอบหลังคาที่ความสูงจริงของอาคาร — บอกความสูงโรงโดยไม่ปิดทับ
  const beamT = 0.7;
  b.beam.push(box(0, hall.h, hall.d / 2, hall.w + beamT, beamT, beamT));
  b.beam.push(box(0, hall.h, -hall.d / 2, hall.w + beamT, beamT, beamT));
  b.beam.push(box(hall.w / 2, hall.h, 0, beamT, beamT, hall.d + beamT));
  b.beam.push(box(-hall.w / 2, hall.h, 0, beamT, beamT, hall.d + beamT));

  // คานพาดตามแนว z ทุกระยะ bay จริง (`site.hall.bay`, 8.5 ม. — ค่าคงที่
  // โครงสร้างที่ plantSite.ts ยืนยันว่าไม่เคยถูกสเกล)
  //
  // ไม่มีเสาในอาคาร โดยเจตนา
  // ---------------------------
  // เดิมปลูกเสาตามตาราง bay ทั่วพื้นโรง ซึ่งถูกตามหลักโครงสร้าง แต่ในการใช้งาน
  // จริงมันพัง: เสาสูง 10.5 ม. หลายร้อยต้นยืนขึ้นมาบังเครื่องจักรจนมองจากมุม
  // ระดับสายตา/ระดับไลน์แล้วเห็นแต่เสา ไม่เห็นเครื่อง — ซึ่งเป็นสิ่งเดียวที่
  // หน้านี้มีไว้ให้ดู
  //
  // เหลือไว้แค่คานพาดด้านบนกับคานขอบหลังคา: ยังบอกความสูงและระยะ bay ของโรง
  // ได้ และยังทอดเงาเป็นแถบซ้ำ ๆ ลงบนพื้นซึ่งช่วยให้อ่านสเกลออก แต่ไม่มี
  // อะไรมาขวางสายตาที่ระดับเครื่องจักรเลย
  const bay = site.hall.bay > 0 ? site.hall.bay : 8.5;
  const colsX = Math.max(2, Math.floor(hall.w / bay));
  for (let i = 0; i <= colsX; i += 1) {
    const x = -hall.w / 2 + (hall.w * i) / colsX;
    b.beam.push(box(x, hall.h, 0, beamT * 0.7, beamT * 0.7, hall.d));
  }

  // --- ห้องบริการในอาคาร --------------------------------------------------
  for (const room of site.rooms) {
    b.wall.push(box(room.x, 0.26, room.z, room.w, Math.min(6, hall.h * 0.55), room.d));
  }

  // --- อาคารภายนอก (สำนักงาน ฯลฯ) พร้อมแถบกระจกต่อชั้น -------------------
  for (const building of site.buildings) {
    b.building.push(box(building.x, 0.14, building.z, building.w, building.h, building.d));
    const floors = Math.max(1, building.floors);
    for (let f = 0; f < floors; f += 1) {
      const y = 0.14 + (building.h * (f + 0.55)) / floors;
      const bandH = (building.h / floors) * 0.4;
      // แถบกระจกยื่นออกจากผนัง 6 ซม. กัน z-fighting กับตัวอาคาร
      b.glass.push(box(building.x, y, building.z + building.d / 2 + 0.03, building.w * 0.88, bandH, 0.06));
      b.glass.push(box(building.x, y, building.z - building.d / 2 - 0.03, building.w * 0.88, bandH, 0.06));
      b.glass.push(box(building.x + building.w / 2 + 0.03, y, building.z, 0.06, bandH, building.d * 0.88));
      b.glass.push(box(building.x - building.w / 2 - 0.03, y, building.z, 0.06, bandH, building.d * 0.88));
    }
    // ฝาหลังคายื่น
    b.beam.push(box(building.x, 0.14 + building.h, building.z, building.w + 0.8, 0.4, building.d + 0.8));
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
          <mesh key={key} geometry={geometry} castShadow={!isFloor} receiveShadow>
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
