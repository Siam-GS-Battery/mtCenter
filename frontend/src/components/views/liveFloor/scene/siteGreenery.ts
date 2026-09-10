import * as THREE from "three";
import { box, pillar, insideCorridor, TREE_ROWS, TREE_SPACING, type Corridor, type Buckets } from "./siteShared";
import { officeEntryCorridors, LINK_WIDTH } from "./siteOffice";

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

  const addTree = (x: number, z: number, index: number) => {
    if (insideCorridor(x, z, corridors)) {
      skippedForPath += 1;
      return;
    }
    // สลับ 3 ขนาดตามลำดับ — ต้นไม้แถวจริงก็ไม่ได้สูงเท่ากันหมด
    // (ไม่ใช้ Math.random เพื่อให้ฉากเหมือนเดิมทุกครั้งที่เปิด)
    const s = [1, 0.82, 1.14][index % 3];
    b.trunk.push(pillar(x, 0.12, z, 0.18 * s, 2.4 * s, 7));
    const crowns: Array<[number, number]> = [
      [2.2 * s, 1.7 * s],
      [3.2 * s, 1.3 * s],
      [4.0 * s, 0.85 * s],
    ];
    for (const [y, r] of crowns) {
      const crown = new THREE.SphereGeometry(r, 9, 6);
      crown.translate(x, 0.12 + y, z);
      b.foliage.push(crown);
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
