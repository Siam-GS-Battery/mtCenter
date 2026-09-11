import * as THREE from "three";
import {
  box,
  pillar,
  insideCorridor,
  hash01,
  TREE_ROWS,
  TREE_SPACING,
  OUTDOOR_CURB_OFFSET,
  type Corridor,
  type Buckets,
} from "./siteShared";
import { officeEntryCorridors, officeSites, LINK_WIDTH } from "./siteOffice";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — GREENERY
 * ===========================================================================
 *
 * ต้นไม้/พุ่มรอบไซต์ — แยกจาก `SiteEnvironment.tsx` เดิม (ดูคอมเมนต์หัวไฟล์
 * นั้นสำหรับพื้นหลังของทั้งระบบ)
 */

/**
 * ต้นไม้เรียงตามถนน + พุ่มรอบอาคาร
 *
 * `site.trees` จากแบบมีแค่ 15 ต้น ซึ่งเห็นเป็นจุด ๆ บนไซต์ขนาดนี้ ที่เพิ่มคือ
 * แถวต้นไม้เรียงระยะสม่ำเสมอตามถนนวงรอบ และแนวพุ่มเตี้ยรอบอาคารประกอบ
 *
 * ต้นไม้หนึ่งต้น = ลำต้น + พุ่มสามชั้น สลับขนาดตาม index เพื่อไม่ให้ทุกต้น
 * เหมือนกันเป๊ะ (ไม่ใช้ Math.random — ฉากต้องเหมือนเดิมทุกครั้งที่เปิด
 * เหมือนที่ `plantLayout.ts` ยืนยันว่า pure/deterministic)
 *
 * `extraCorridors` — ช่องทางเข้าเพิ่มเติมนอกเหนือจากอาคารสำนักงาน (ปัจจุบันมี
 * แค่ท่ารับ-ส่งของ, `buildLoadingDock`) เว้นต้นไม้ให้เหมือนช่องอาคารสำนักงาน
 */
export function buildGreenery(hallW: number, hallD: number, b: Buckets, extraCorridors: Corridor[] = []) {
  const spacing = TREE_SPACING;
  // ช่องที่ทางเดินสำนักงาน/ท่ารับ-ส่งของตัดผ่าน — ห้ามปลูกทับ
  const corridors = [...officeEntryCorridors(hallW, hallD), ...extraCorridors];
  let skippedForPath = 0;

  // ระยะจิตเตอร์ตำแหน่งปลูกสูงสุด (ม.) — พอทำลายความสม่ำเสมอของแถวไม่ให้ดู
  // "ปั๊มตราประทับ" โดยไม่เสี่ยงชนแถวข้างเคียง (TREE_ROWS ห่างกัน 9 ม., ถนน
  // บริการจบที่ +17 ม. ส่วนแถวในสุดเริ่มที่ +22 ม. — เหลือช่องว่าง 5 ม. ก่อน
  // ต้นไม้แถวแรก จิตเตอร์ 1.2 ม. จึงห่างไกลจากทั้งสองขอบเขตนั้นมาก)
  const PLANT_JITTER = 1.2;

  const addTree = (x: number, z: number, index: number) => {
    // แฮชคงที่ 4 ตัวแยกอิสระจาก index เดียวกัน (offset ต่างกันกันไม่ให้
    // ค่าออกมาซ้ำ/สัมพันธ์กัน) — ไม่ใช้ Math.random เพื่อให้ฉากเหมือนเดิมทุก
    // ครั้งที่เปิด (กฎเดียวกับที่ `plantLayout.ts` ยืนยันว่า pure/deterministic)
    const shapeSeed = hash01(index * 3.17 + 11);
    const sizeSeed = hash01(index * 7.71 + 5);
    const jxSeed = hash01(index * 5.31 + 2);
    const jzSeed = hash01(index * 9.13 + 8);

    const jx = x + (jxSeed - 0.5) * 2 * PLANT_JITTER;
    const jz = z + (jzSeed - 0.5) * 2 * PLANT_JITTER;

    // เช็คกันชนด้วยตำแหน่งที่จิตเตอร์แล้วจริง ไม่ใช่ตำแหน่งกริดเดิม — ไม่งั้น
    // ต้นที่ขยับเข้าไปในช่องทางเข้าจะหลุดผ่านการเช็คนี้ไปได้
    if (insideCorridor(jx, jz, corridors)) {
      skippedForPath += 1;
      return;
    }

    const s = 0.82 + sizeSeed * 0.5; // สเกลรวม 0.82 - 1.32 เท่า
    const shape = Math.floor(shapeSeed * 3) % 3;

    if (shape === 0) {
      // ทรง 1: พุ่มกว้าง (broad canopy) — ไม้ยืนต้นทรงกลมทั่วไป
      b.trunk.push(pillar(jx, 0.12, jz, 0.18 * s, 2.4 * s, 7));
      const crowns: Array<[number, number]> = [
        [2.2 * s, 1.7 * s],
        [3.2 * s, 1.3 * s],
        [4.0 * s, 0.95 * s],
      ];
      for (const [y, r] of crowns) {
        const crown = new THREE.SphereGeometry(r, 9, 6);
        crown.translate(jx, 0.12 + y, jz);
        b.foliage.push(crown);
      }
    } else if (shape === 1) {
      // ทรง 2: ตั้งชะลูด (narrow upright) — เช่นสน/ไม้ยืนต้นทรงแหลม แคบและสูง
      // กว่าทรงพุ่มกว้าง
      b.trunk.push(pillar(jx, 0.12, jz, 0.14 * s, 3.2 * s, 7));
      const tiers: Array<[number, number]> = [
        [3.0 * s, 0.95 * s],
        [4.1 * s, 0.72 * s],
        [5.0 * s, 0.45 * s],
      ];
      for (const [y, r] of tiers) {
        const cone = new THREE.ConeGeometry(r, 1.6 * s, 8);
        cone.translate(jx, 0.12 + y, jz);
        b.foliage.push(cone);
      }
    } else {
      // ทรง 3: ปาล์ม — ลำต้นสูงเรียวไม่มีพุ่มระหว่างทาง ใบกระจุกเฉพาะปลายยอด
      const trunkH = 4.6 * s;
      b.trunk.push(pillar(jx, 0.12, jz, 0.12 * s, trunkH, 7));
      const crownY = 0.12 + trunkH;
      const frondCount = 6;
      const frondLen = 1.6 * s;
      for (let f = 0; f < frondCount; f += 1) {
        const angle = (f / frondCount) * Math.PI * 2;
        const frond = new THREE.BoxGeometry(frondLen, 0.08 * s, 0.5 * s);
        // เลื่อนให้ปลายด้านหนึ่งอยู่ที่จุดหมุน (ยอดลำต้น) ก่อนหมุน ไม่งั้นใบจะ
        // จมกึ่งกลางลำต้นแทนที่จะแผ่ออกจากยอด
        frond.translate(frondLen / 2, 0, 0);
        frond.rotateZ(0.35);
        frond.rotateY(angle);
        frond.translate(jx, crownY, jz);
        b.foliage.push(frond);
      }
      const bud = new THREE.SphereGeometry(0.4 * s, 8, 6);
      bud.translate(jx, crownY, jz);
      b.foliage.push(bud);
    }
  };

  /**
   * เดินรอบสี่เหลี่ยมหนึ่งวงแล้วปลูกต้นไม้ตามระยะ รวมมุมทั้งสี่
   *
   * เดิมปลูกด้านตามแกน X กับด้านตามแกน Z แยกกัน โดยแต่ละด้านไล่แค่ในช่วง
   * ความกว้าง/ความลึกของตัวโรง ผลคือ **มุมทั้งสี่โหลงไม่มีต้นไม้เลย** และแนว
   * ไม่ได้ล้อมอาคาร มันเป็นแค่เส้นสี่เส้นที่ไม่บรรจบกัน
   *
   * ตัวนี้ไล่ตามขอบวงจริง: ด้านตามแกน X ไล่เต็มความกว้างของวง (รวมมุม) แล้ว
   * ด้านตามแกน Z ไล่เฉพาะช่วงที่เหลือ จึงไม่ปลูกซ้ำที่มุมและปิดวงครบ
   */
  const plantRing = (off: number, phase: number, startIndex: number): number => {
    const hx = hallW / 2 + off;
    const hz = hallD / 2 + off;
    let i = startIndex;

    const stepsX = Math.max(4, Math.round((hx * 2) / spacing));
    for (let k = 0; k <= stepsX; k += 1) {
      const x = -hx + phase + ((hx * 2 - phase) * k) / stepsX;
      addTree(x, hz, i++);
      addTree(x, -hz, i++);
    }

    const stepsZ = Math.max(4, Math.round((hz * 2) / spacing));
    // เริ่มที่ k=1 และจบก่อน stepsZ เพื่อไม่ปลูกทับต้นที่มุมจากรอบด้าน X
    for (let k = 1; k < stepsZ; k += 1) {
      const z = -hz + phase + ((hz * 2 - phase) * k) / stepsZ;
      addTree(hx, z, i++);
      addTree(-hx, z, i++);
    }
    return i;
  };

  /**
   * ปลูกเป็น "แนวต้นไม้ล้อมอาคาร" หลายแถว ไม่ใช่แถวเดียว
   *
   * แถบว่างระหว่างขอบนอกถนนบริการ (ผนัง +17 ม.) กับขอบลานของไซต์ กว้างราว
   * 40 ม. ทางด้าน X และ 60 ม. ทางด้าน Z — แถวเดียวห่าง 16 ม. ทำให้แถบนั้นดู
   * โหลงทั้งแถบ (ตรงกับบริเวณที่ผู้ใช้วงไว้) จึงปลูกสามแถวคร่อมแถบนั้น และ
   * เหลื่อมเฟสแถวละ 1/3 ของระยะปลูก เพื่อให้เห็นเป็นดงไม้ ไม่ใช่ตารางหมากรุก
   */
  let i = 0;
  for (let row = 0; row < TREE_ROWS.length; row += 1) {
    i = plantRing(TREE_ROWS[row], (spacing * row) / TREE_ROWS.length, i);
  }

  // แนวพุ่มเตี้ยขนานแถวต้นไม้ในสุด ด้านที่หันเข้าโรง — เดินรอบครบทั้งสี่ด้าน
  const hedgeX = hallW / 2 + TREE_ROWS[0] - 4;
  const hedgeZ = hallD / 2 + TREE_ROWS[0] - 4;
  for (const side of [-1, 1] as const) {
    // ด้าน -z (ฝั่งเดียวกับ WH/ท่ารับ-ส่งของ) เป็นด้านเดียวที่มีช่องทางเข้านอก
    // เหนือกลุ่มอาคารสำนักงาน (`officeSites` ไม่มีด้าน "-z") — ตัดเฉพาะด้านนี้
    // ตามช่อง `extraCorridors` ที่คาบเกี่ยวระดับ z นี้จริง ด้านอื่นวาดเหมือนเดิม
    // เป๊ะ ไม่กระทบของเดิม (ไม่มีช่องใดคาบเกี่ยว hedgeZ ของด้านอื่นอยู่แล้ว)
    if (side === -1 && extraCorridors.length > 0) {
      const cuts = extraCorridors
        .filter((c) => c.z0 <= side * hedgeZ && c.z1 >= side * hedgeZ)
        .map((c) => ({ x0: c.x0, x1: c.x1 }));
      for (const seg of excludeRanges(-hedgeX, hedgeX, cuts)) {
        const w = seg.x1 - seg.x0;
        if (w <= 0.05) continue;
        b.hedge.push(box((seg.x0 + seg.x1) / 2, 0.12, side * hedgeZ, w, 0.9, 1.2));
      }
    } else {
      b.hedge.push(box(0, 0.12, side * hedgeZ, hedgeX * 2, 0.9, 1.2));
    }
    b.hedge.push(box(side * hedgeX, 0.12, 0, 1.2, 0.9, hedgeZ * 2));
  }

  // --- พุ่มขนาบสองข้างช่องทางเข้า ---------------------------------------
  //
  // ช่องที่เว้นไว้ให้ทางเดินกว้าง 10 ม. แต่ตัวทางกว้าง 2.8 ม. ถ้าปล่อยเปล่า
  // จะเห็นเป็นรอยโหว่ในดงไม้ พุ่มเตี้ยสองแนวขนาบทางทำให้อ่านเป็น "ทางเข้าที่
  // จัดไว้" และปิดขอบช่องพอดี
  for (const c of corridors) {
    const alongX = c.x1 - c.x0 > c.z1 - c.z0;
    const cx = (c.x0 + c.x1) / 2;
    const cz = (c.z0 + c.z1) / 2;
    const runLen = alongX ? c.x1 - c.x0 : c.z1 - c.z0;
    // ขนาบชิดขอบทางเดิน (ไม่ใช่ขอบช่อง) จึงเห็นเป็นแนวประกบทาง
    const offset = LINK_WIDTH / 2 + 1.3;
    for (const sideSign of [-1, 1]) {
      b.hedge.push(
        alongX
          ? box(cx, 0.12, cz + sideSign * offset, runLen, 0.75, 1.0)
          : box(cx + sideSign * offset, 0.12, cz, 1.0, 0.75, runLen)
      );
    }
  }

  // ถ้าไม่มีต้นไหนถูกเว้นเลย แปลว่าช่องทางเข้ากับแถวต้นไม้คำนวณไม่ตรงกัน
  // อีกแล้ว (มีใครขยับ TREE_ROWS / OFFICE_SPINE_OFFSET แล้วช่องเลื่อนหลุด) —
  // ผลที่เห็นคือทางเดินโผล่ทะลุพุ่มไม้เหมือนเดิม เตือนไว้ตอน dev ให้จับได้เร็ว
  if (skippedForPath === 0 && import.meta.env?.DEV) {
    console.warn(
      `[SiteEnvironment] ไม่มีต้นไม้ถูกเว้นให้ช่องทางเดินเลย — ` +
        `ตรวจ officeEntryCorridors กับ TREE_ROWS ว่ายังตรงกันอยู่`
    );
  }
}

/**
 * แนวพุ่มเตี้ยเลียบถนนบริการวงรอบ ด้านในสุด (ระหว่างคันหินทางเดินแดง
 * `OUTDOOR_CURB_OFFSET`=+5 ม. กับถนนบริการ `RING_ROAD_GAP`=+9 ม.)
 *
 * **ต้องเว้นหัวจ่ายน้ำดับเพลิงด้วย** — `buildFireHydrants`
 * (`siteUtilities.ts`) วางหัวจ่ายที่ `HYDRANT_OFFSET = OUTDOOR_CURB_OFFSET +
 * 1.4 = 6.4` ม. ทุก ๆ 55 ม. รอบวง ตัวหัวจ่าย+ท่อจ่ายสองข้างกินแนวรัศมี
 * (แกนเดียวกับความหนาของแถบพุ่มนี้) ราว ±0.205 ม. จากศูนย์กลาง (เสารัศมี 0.11,
 * ฝาครอบครึ่งกว้าง 0.1, ท่อจ่าย offset 0.16+รัศมี 0.045) จึงกินพื้นที่จริง
 * **6.195-6.605 ม.** จากผนัง — เดิมแถบพุ่มนี้ปลูกที่กึ่งกลาง 5-9 ม. (+7 ม. กว้าง
 * 1.6 ม. = ช่วง 6.2-7.8 ม.) ซึ่งซ้อนทับช่วงหัวจ่ายเกือบเต็ม เพราะหัวจ่ายกับ
 * แนวพุ่มนี้เป็นการวางตามคาบ (periodic) คนละชุดที่ไม่เคยตรวจกันมาก่อน — จุดที่
 * ไม่ได้อยู่ในกล่องกันชน (`corridors`) ใด ๆ จะมีพุ่มไม้งอกทับหัวจ่ายพอดี
 *
 * `HYDRANT_OFFSET`/`HYDRANT_SPACING` เป็นค่าคงที่ภายใน `siteUtilities.ts` ไม่
 * ได้ export ออกมา (ห้ามแก้ไฟล์นั้น) จึงเลี่ยงปัญหาด้วยการ **ขยับแถบพุ่มไม้ทั้ง
 * แถบให้พ้นช่วงหัวจ่ายไปเลย** แทนที่จะไล่ตัดตำแหน่งหัวจ่ายทีละจุด (ซึ่งต้อง
 * รู้ตำแหน่งจริงที่ export ไม่ได้อยู่ดี) — วิธีนี้พ้นกันโดยโครงสร้าง (ระยะจาก
 * ผนังคงที่ทุกจุดรอบวง) ไม่ต้องรู้ว่าหัวจ่ายอยู่ตรงไหนตามแนวเส้นรอบวงเลย
 *
 * **ต้องเลือกฝั่งให้ถูกด้วย ไม่ใช่แค่ไม่ชนตัวหัวจ่าย** — รถดับเพลิงจอดบนถนน
 * บริการวงรอบ (+9 ถึง +17 ม.) แล้วลากสายฉีดเข้าหาหัวจ่ายที่ +6.4 ม. ฝั่งที่
 * ต้องว่างจริงคือ **ฝั่งถนน** (6.605 ถึง 9 ม.) ถ้าปลูกพุ่มขวางช่วงนั้นแม้จะไม่
 * ชนตัวหัวจ่าย ก็ยังกันไม่ให้ลากสายจากถนนเข้าหาหัวจ่ายได้อยู่ดี จึงย้ายพุ่มไป
 * ไว้ **ฝั่งผนัง/ทางเดิน** แทน (ทางเดินแดงจบที่ +4.6 ม., คันหิน 4.8-5.2 ม. —
 * ฝั่งนี้เป็นฝั่งคนเดิน ไม่ใช่ฝั่งที่รถ/สายฉีดต้องเข้าถึง)
 *
 * ศูนย์กลางแถบคำนวณจาก `OUTDOOR_CURB_OFFSET` (ค่ากลางที่ export จริง ไม่ใช่
 * ตัวเลขลอย) บวกครึ่งความกว้างคันหิน บวกระยะเผื่อที่ตั้งชื่อไว้ บวกครึ่งความ
 * หนาแถบ — ถ้าใครขยับ `OUTDOOR_CURB_OFFSET` ทีหลัง แถบนี้เลื่อนตามคันหินไปเอง
 * โดยอัตโนมัติ ไม่ใช่ค้างที่ตัวเลขเดิมจนระยะเผื่อหายไปเงียบ ๆ (ชนกับ
 * `eaveYOf()`/`EAVE_Y_FACTOR`, `BUILDING_EAVE_OVERHANG`, ค่าคงที่ชั้นวางของ
 * คลังสินค้า, `DOCK_DOOR_W` — ทุกตัวเคยเป็นบั๊ก "ค่าคงที่สองจุดเพี้ยนตามกันไม่
 * ทัน" มาแล้วในเซสชันนี้ ไม่อยากให้เป็นตัวที่ห้า):
 *   off = `OUTDOOR_CURB_OFFSET`(5) + `CURB_HALF_W`(0.2) + `HEDGE_CURB_CLEARANCE`(0.15)
 *       + `thick`(0.7)/2(0.35) = **5.7 ม.** (ตัวเลขเดิมเป๊ะ ไม่ได้ย้ายอะไร)
 * ช่วงที่ได้ยังเป็น **5.35-6.05 ม.** เหมือนเดิม: เผื่อฝั่งคันหิน
 * 5.35-5.2=0.15 ม., เผื่อฝั่งหัวจ่าย 6.195-6.05=0.145 ม. (ทั้งสอง ≥0.05 ม.
 * ตามเกณฑ์) ฝั่งถนน (6.605-9 ม.) ว่างเต็มที่เหมือนเดิม
 *
 * **ข้อสมมติที่ยังต้องคงไว้ (คัดลอกจาก `siteUtilities.ts` เพราะไฟล์นั้นห้ามแก้
 * และ `HYDRANT_OFFSET`/หัวจ่ายไม่ได้ export)**: ขอบนอกของแถบนี้ (`off + thick/2`
 * = 6.05 ม.) ต้องอยู่ต่ำกว่า `HYDRANT_OFFSET`(6.4) ลบระยะเข้าถึงตัวหัวจ่ายตาม
 * แนวรัศมี (±0.205 ม. — เสารัศมี 0.11, ฝาครอบครึ่งกว้าง 0.1, ท่อจ่าย offset
 * 0.16+รัศมี 0.045) เสมอ กล่าวคือ 6.4-0.205=**6.195 ม.** — ค่าคงที่ทั้งสองฝั่ง
 * (`OUTDOOR_CURB_OFFSET` ในไฟล์นี้ กับ `HYDRANT_OFFSET`/รูปทรงหัวจ่ายใน
 * `siteUtilities.ts:667-694`) ไม่ได้ผูกกันด้วยโค้ด มีแค่คอมเมนต์นี้เป็นสัญญา —
 * ใครแก้ `OUTDOOR_CURB_OFFSET`, `HEDGE_CURB_CLEARANCE`/`thick` ที่นี่ หรือ
 * `HYDRANT_OFFSET`/ขนาดหัวจ่ายที่นั่น ต้องเช็คเลข 6.05 < 6.195 นี้ใหม่เอง
 *
 * โรงเก็บของ/ถังแก๊สจริงเริ่มที่ผนัง+10.7 ม.เป็นต้นไป (พ้นถนนบริการเข้าไปแล้ว
 * — ดู comment ที่ `buildRingRoad`, `siteRoads.ts`) แถบนี้จึงว่างจากสิ่งเหล่านั้น
 * โดยธรรมชาติ ไม่ต้องอิงข้อมูล shed/building/tankFarm เพิ่ม
 *
 * ที่ยังต้องเว้นจริงคือ `corridors` เดียวกับที่ท่ารับ-ส่งของ/สถานีไฟฟ้า/ประตู/
 * ทางเข้าอาคารสำนักงานใช้ (ผู้เรียกส่งชุดเดียวกับ `fireExclusions` ใน
 * `SiteEnvironment.tsx` มาให้ — ไม่ได้คิดกลไกกันชนใหม่)
 */
export function buildRoadsideHedges(hallW: number, hallD: number, b: Buckets, corridors: Corridor[]) {
  // ครึ่งความกว้างคันหินทาลาย — คัดลอกมาจากขนาดกล่องคันหินจริงใน
  // `siteRoads.ts` (`box(..., 0.4, 0.3, seg)`, ไม่ได้ export) แค่ "ความกว้าง"
  // เฉยๆ ส่วนตำแหน่งยังอิง `OUTDOOR_CURB_OFFSET` ที่ export จริงเสมอ
  const CURB_HALF_W = 0.2;
  // ระยะเผื่อจากขอบคันหินถึงขอบแถบพุ่มไม้ (≥0.05 ม. ตามเกณฑ์)
  const HEDGE_CURB_CLEARANCE = 0.15;
  const thick = 0.7;
  const off = OUTDOOR_CURB_OFFSET + CURB_HALF_W + HEDGE_CURB_CLEARANCE + thick / 2; // = 5.7 ม.
  const hx = hallW / 2 + off;
  const hz = hallD / 2 + off;

  for (const side of [-1, 1] as const) {
    // ด้านที่ Z คงที่ (เหนือ/ใต้)
    const cutsZ = corridors
      .filter((c) => c.z0 <= side * hz && c.z1 >= side * hz)
      .map((c) => ({ x0: c.x0, x1: c.x1 }));
    for (const seg of excludeRanges(-hx, hx, cutsZ)) {
      const w = seg.x1 - seg.x0;
      if (w <= 0.3) continue;
      b.hedge.push(box((seg.x0 + seg.x1) / 2, 0.12, side * hz, w, 0.55, thick));
    }
    // ด้านที่ X คงที่ (ซ้าย/ขวา)
    const cutsX = corridors
      .filter((c) => c.x0 <= side * hx && c.x1 >= side * hx)
      .map((c) => ({ x0: c.z0, x1: c.z1 }));
    for (const seg of excludeRanges(-hz, hz, cutsX)) {
      const w = seg.x1 - seg.x0;
      if (w <= 0.3) continue;
      b.hedge.push(box(side * hx, 0.12, (seg.x0 + seg.x1) / 2, thick, 0.55, w));
    }
  }
}

/**
 * แนวพุ่มเตี้ยรอบลานปูหน้าอาคารสำนักงาน — ปลูกห่างขอบลานปูออกไป 1.2 ม.
 * (ลานปูจริงกว้าง `w+16`/`d+16` — ดู `buildOfficeBuildings`) กันรอยต่อขอบลาน/
 * หญ้าดูเป็นเส้นตรงแข็งทื่อ
 *
 * เว้นด้าน **+z โลก** ของทุกอาคารเสมอ — โถงทางเข้า (`buildOfficeBuildings`)
 * ยื่นออกด้าน +z โลกเสมอไม่ว่าอาคารจะอยู่ด้านไหนของไซต์ (ดู comment ที่
 * `buildOfficeBuildings`: `az = z + d/2 + 7`) ด้านนั้นจึงมีทั้งโถง+ทางเดินเชื่อม
 * อยู่แล้ว ไม่ใช่ที่ว่างให้พุ่มไม้
 *
 * อีกสามด้านเว้นตาม `officeEntryCorridors` (ช่องเดียวกับที่ `buildGreenery`
 * เว้นให้ต้นไม้ตรงทางเข้า) กันพุ่มโผล่ทับทางเชื่อมสายหลัก
 */
export function buildOfficeFrontageHedges(hallW: number, hallD: number, b: Buckets) {
  const sites = officeSites(hallW, hallD);
  const entryCorridors = officeEntryCorridors(hallW, hallD);
  const marginOut = 1.2;

  for (const o of sites) {
    const px = o.w / 2 + 8 + marginOut; // ครึ่งลานปูจริง (w+16)/2 = w/2+8 บวกระยะเว้น
    const pz = o.d / 2 + 8 + marginOut;

    // ด้าน -z เท่านั้น (ด้าน +z มีโถงทางเข้า+ทางเชื่อมเสมอ — ข้าม)
    const z = o.z - pz;
    const cutsZ = entryCorridors
      .filter((c) => c.z0 <= z && c.z1 >= z)
      .map((c) => ({ x0: c.x0, x1: c.x1 }));
    for (const seg of excludeRanges(o.x - px, o.x + px, cutsZ)) {
      const w = seg.x1 - seg.x0;
      if (w <= 0.3) continue;
      b.hedge.push(box((seg.x0 + seg.x1) / 2, 0.12, z, w, 0.5, 0.8));
    }

    // ด้าน -x/+x ทั้งคู่
    for (const side of [-1, 1] as const) {
      const x = o.x + side * px;
      const cutsX = entryCorridors
        .filter((c) => c.x0 <= x && c.x1 >= x)
        .map((c) => ({ x0: c.z0, x1: c.z1 }));
      for (const seg of excludeRanges(o.z - pz, o.z + pz, cutsX)) {
        const w = seg.x1 - seg.x0;
        if (w <= 0.3) continue;
        b.hedge.push(box(x, 0.12, (seg.x0 + seg.x1) / 2, 0.8, 0.5, w));
      }
    }
  }
}

/** ตัดช่วง [lo, hi] ออกเป็นชิ้น ๆ ที่เว้นทุกช่วงใน `cuts` — ใช้เว้นแนวพุ่มไม้ตรง
 *  ที่ท่ารับ-ส่งของทับอยู่ โดยไม่ต้องแก้ทุกด้านที่ไม่เกี่ยวข้อง */
export function excludeRanges(lo: number, hi: number, cuts: Array<{ x0: number; x1: number }>): Array<{ x0: number; x1: number }> {
  let segments: Array<{ x0: number; x1: number }> = [{ x0: lo, x1: hi }];
  for (const cut of cuts) {
    const next: Array<{ x0: number; x1: number }> = [];
    for (const seg of segments) {
      if (cut.x1 <= seg.x0 || cut.x0 >= seg.x1) {
        next.push(seg);
        continue;
      }
      if (cut.x0 > seg.x0) next.push({ x0: seg.x0, x1: cut.x0 });
      if (cut.x1 < seg.x1) next.push({ x0: cut.x1, x1: seg.x1 });
    }
    segments = next;
  }
  return segments;
}
