import * as THREE from "three";
import type { LineInfo } from "../../../../lib/plantLayout";
import type { PlantZone } from "../../../../lib/plantSite";
import { slabGeometry } from "./geometryKit";
import { INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, ringStrip } from "./indoorLanes";
import {
  box,
  paintWalkEdges,
  MAX_ROOF_SPAN,
  Y_LINE_WALKWAY,
  Y_LINE_PAINT,
  Y_INDOOR_ROAD,
  Y_INDOOR_WALK,
  Y_INDOOR_PAINT,
  INDOOR_WALK_W,
  INDOOR_WALK_OFFSET,
  WALKWAY_WIDTH,
  WALKWAY_CLEARANCE,
  type Buckets,
} from "./siteShared";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — INDOOR INFRASTRUCTURE
 * ===========================================================================
 *
 * ทางเดินคน/เลนรถในอาคาร และอาคารคลุมไลน์การผลิต (เสา/คานเชิงชาย/โครงถัก
 * หลังคา) — แยกจาก `SiteEnvironment.tsx` เดิม (ดูคอมเมนต์หัวไฟล์นั้น) ไม่มีใน
 * รายการ seam ที่ระบุไว้แต่แรก แต่เป็นกลุ่มฟังก์ชันที่แยกจากกลุ่มอื่นได้ชัดเจน
 * (จัดการเฉพาะเรื่อง "ในอาคาร" — ต่างจาก `siteRoads.ts` ที่จัดการถนน/ทางเดิน
 * นอกอาคาร)
 */

/**
 * ทางเดินคนรอบไลน์การผลิต
 *
 * ตีทางเดินขนาบไปตาม **ด้านยาว** ของกล่องขอบเขตแต่ละไลน์ (`LineInfo.x0..x1`,
 * `z0..z1` ที่ plantLayout คำนวณจากเครื่องที่อยู่ในไลน์นั้นจริง) พร้อมเส้นขอบ
 * สีเหลืองสองข้างตามงานเซฟตี้โรงงาน
 *
 * เลือกด้านยาวเพราะไลน์ผลิตถูกแพ็คเป็นแถวยาว (serpentine — ดู LAYOUT-PLAN §4)
 * คนเดินตรวจจึงเดินขนานแนวไลน์ ไม่ใช่ตัดขวาง และการตีทั้งสี่ด้านของทุกไลน์
 * จะทำให้ทางเดินของไลน์ที่อยู่ติดกันทับกันเป็นลานกว้างจนไม่อ่านเป็นทางเดิน
 */
export function buildLineWalkways(lines: LineInfo[], b: Buckets) {
  for (const line of lines) {
    const w = Math.abs(line.x1 - line.x0);
    const d = Math.abs(line.z1 - line.z0);
    if (w <= 0 || d <= 0) continue;

    const cx = (line.x0 + line.x1) / 2;
    const cz = (line.z0 + line.z1) / 2;
    const alongX = w >= d;
    // ระยะจากจุดกลางไลน์ถึงกลางทางเดิน = ครึ่งความหนาไลน์ + ระยะเว้น + ครึ่งทาง
    const across = (alongX ? d : w) / 2 + WALKWAY_CLEARANCE + WALKWAY_WIDTH / 2;
    const along = (alongX ? w : d) / 2;

    // --- ด้านยาวสองเส้น: ยืดออกเท่าความกว้างทาง ให้ไปชนกับเส้นเชื่อมหัวท้าย
    for (const side of [-1, 1]) {
      const len = 2 * along + WALKWAY_WIDTH;
      const px = alongX ? cx : cx + side * across;
      const pz = alongX ? cz + side * across : cz;
      b.walkGreen.push(
        slabGeometry(
          px,
          pz,
          alongX ? len : WALKWAY_WIDTH,
          alongX ? WALKWAY_WIDTH : len,
          Y_LINE_WALKWAY,
          0.03
        )
      );
      paintWalkEdges(
        { x: px, z: pz, w: 0, d: 0, alongX, len },
        WALKWAY_WIDTH,
        Y_LINE_PAINT,
        b
      );
    }

    // --- เส้นเชื่อมหัวท้าย: ปิดวงให้ทางเดินครบรอบไลน์ ---------------------
    //
    // ตัวนี้คือส่วนที่ขาดไปในเวอร์ชันก่อน: ทางเดินมีแต่สองเส้นขนานลอยอยู่
    // คนละฝั่งของไลน์ แล้วจบด้วน ๆ ที่ปลาย — เดินจากฝั่งหนึ่งไปอีกฝั่งไม่ได้
    // เลยนอกจากลุยข้ามตัวไลน์ ตอนนี้ปลายทั้งสองข้างถูกเชื่อมเป็นวงปิด
    //
    // หักหัวท้ายออกเท่าความกว้างทาง (สูตรเดียวกับ `ringStrip`) มุมจึงชนกันพอดี
    // ไม่ขาดและไม่ซ้อนหนาสองชั้น
    const crossLen = 2 * across - WALKWAY_WIDTH;
    for (const end of [-1, 1]) {
      const px = alongX ? cx + end * along : cx;
      const pz = alongX ? cz : cz + end * along;
      b.walkGreen.push(
        slabGeometry(
          px,
          pz,
          alongX ? WALKWAY_WIDTH : crossLen,
          alongX ? crossLen : WALKWAY_WIDTH,
          Y_LINE_WALKWAY,
          0.03
        )
      );
      paintWalkEdges(
        { x: px, z: pz, w: 0, d: 0, alongX: !alongX, len: crossLen },
        WALKWAY_WIDTH,
        Y_LINE_PAINT,
        b
      );

      // --- ทางม้าลายบนเส้นเชื่อม — "รอยต่อที่ต้องเดินข้าม" --------------
      //
      // เส้นเชื่อมนี้พาดข้ามหัว/ท้ายของไลน์การผลิต (ข้ามสายพาน) จึงเป็นจุดที่
      // คนต้อง "ข้ามไปอีกฝั่ง" เหมือนข้ามถนน — ตีทางม้าลายทับตลอดช่วงที่พาด
      // ข้ามตัวไลน์ ไม่ใช่แค่แต้มสั้น ๆ ที่ปลายเหมือนเวอร์ชันก่อน
      const lineThickness = alongX ? d : w;
      const stripes = Math.max(3, Math.round(lineThickness / 0.9));
      for (let i = 0; i < stripes; i += 1) {
        const t = -lineThickness / 2 + (lineThickness * (i + 0.5)) / stripes;
        const stripeLen = (lineThickness / stripes) * 0.55;
        b.zebra.push(
          alongX
            ? slabGeometry(px, pz + t, WALKWAY_WIDTH * 0.86, stripeLen, Y_LINE_PAINT, 0.015)
            : slabGeometry(px + t, pz, stripeLen, WALKWAY_WIDTH * 0.86, Y_LINE_PAINT, 0.015)
        );
      }
    }
  }
}

/**
 * ถนนรถในอาคาร + ทางเดินคนสีเขียวขนานไปข้าง ๆ
 *
 * นี่คือสิ่งที่รูปตัวอย่างที่สอง (พื้นอีพ็อกซีเขียวขอบเหลืองในโรงงาน) สื่อ:
 * เลนรถกับเลนคนอยู่ในทางเดียวกันแต่แยกกันด้วยเส้นเหลือง คนเดินได้แค่ในแถบ
 * เขียว ห้ามล้ำเส้นเหลืองออกไปในเลนรถ
 *
 * ตีเป็นวงรอบด้านในผนังทั้งสี่ด้าน — ตรงกับกรอบสี่ด้านที่ผู้ใช้มาร์คไว้ และ
 * ตรงกับผังโรงงานจริงที่มีทางเดินเลียบผนังรอบอาคาร (perimeter aisle)
 */
export function buildIndoorRoads(hallW: number, hallD: number, b: Buckets) {
  // --- เลนรถ: ผิวถนน + เส้นแบ่งกลางเลน ---------------------------------
  for (const run of ringStrip(hallW, hallD, INDOOR_ROAD_OFFSET, INDOOR_ROAD_W, true)) {
    b.roadway.push(slabGeometry(run.x, run.z, run.w, run.d, Y_INDOOR_ROAD, 0.03));

    const dashes = Math.max(6, Math.round(run.len / 10));
    for (let i = 0; i < dashes; i += 1) {
      const t = -run.len / 2 + (run.len * (i + 0.5)) / dashes;
      const dash = (run.len / dashes) * 0.45;
      b.laneLine.push(
        run.alongX
          ? slabGeometry(run.x + t, run.z, dash, 0.18, Y_INDOOR_PAINT, 0.015)
          : slabGeometry(run.x, run.z + t, 0.18, dash, Y_INDOOR_PAINT, 0.015)
      );
    }
  }

  // --- เลนคน: อีพ็อกซีเขียว + เส้นเหลืองสองข้าง ------------------------
  for (const run of ringStrip(hallW, hallD, INDOOR_WALK_OFFSET, INDOOR_WALK_W, true)) {
    b.walkGreen.push(slabGeometry(run.x, run.z, run.w, run.d, Y_INDOOR_WALK, 0.03));
    paintWalkEdges(run, INDOOR_WALK_W, Y_INDOOR_PAINT, b);

    // ทางม้าลายข้ามเลนรถทุก ๆ 70 ม. — จุดเดียวที่อนุญาตให้ข้ามเส้นเหลือง
    const crossings = Math.max(2, Math.round(run.len / 70));
    for (let i = 0; i < crossings; i += 1) {
      const t = -run.len / 2 + (run.len * (i + 0.5)) / crossings;
      // ทางม้าลายพาดจากขอบนอกของเลนคน ข้ามเลนรถไปจนสุด
      const spanFrom = INDOOR_WALK_OFFSET - INDOOR_WALK_W / 2;
      const spanTo = INDOOR_ROAD_OFFSET + INDOOR_ROAD_W / 2;
      const mid = (spanFrom + spanTo) / 2;
      const span = spanTo - spanFrom;
      const sideSign = Math.sign(run.alongX ? run.z : run.x) || 1;
      const base = (run.alongX ? hallD : hallW) / 2 - mid;

      for (let k = 0; k < 6; k += 1) {
        const u = t - 1.5 + (3 * k) / 5;
        b.zebra.push(
          run.alongX
            ? slabGeometry(run.x + u, sideSign * base, 0.3, span, Y_INDOOR_PAINT, 0.015)
            : slabGeometry(sideSign * base, run.z + u, span, 0.3, Y_INDOOR_PAINT, 0.015)
        );
      }
    }
  }
}

/**
 * อาคารคลุมไลน์ผลิต — เสา คานเชิงชาย และโครงถักหลังคาต่อโซน
 *
 * ทำเป็น "อาคารเปิดข้าง" ต่อโซน (multi-bay factory) ไม่ใช่หลังคาทึบ:
 * เห็นโครงหลังคาและได้เงาคานตกลงบนเครื่อง ซึ่งเป็นสิ่งที่ทำให้ฉากมีความลึก
 * แต่ยังมองเห็นเครื่องจักรและไลน์ข้างในจากมุมสูงได้ (เหตุผลเดียวกับที่
 * `PlantShell` ไม่ปิดหลังคาโรงใหญ่ — ดูคอมเมนต์ที่นั่น)
 *
 * ความสูงเชิงชาย = 0.78 ของความสูงโรง ต่ำกว่าคานขอบโรงที่ `PlantShell` วาง
 * ไว้ที่ระดับ `hall.h` พอดี จึงอ่านเป็นอาคารย่อยอยู่ *ใน* โรง ไม่ใช่ชนกัน
 */
export function buildLineHalls(zones: PlantZone[], hallHeight: number, bay: number, b: Buckets) {
  const eaveY = hallHeight * 0.78;
  const ridgeRise = hallHeight * 0.12;

  for (const zone of zones) {
    const x0 = zone.x - zone.w / 2;
    const x1 = zone.x + zone.w / 2;
    const z0 = zone.z - zone.d / 2;
    const z1 = zone.z + zone.d / 2;

    // ไม่มีเสาอาคารไลน์ โดยเจตนา — ดูเหตุผลเดียวกันที่ `PlantShell.tsx`
    // (เสาสูงเท่าเชิงชายหลายร้อยต้นบังเครื่องจักรจนมองจากระดับไลน์ไม่เห็นอะไร)
    // โครงหลังคากับคานเชิงชายยังอยู่ครบ จึงยังอ่านเป็นอาคารคลุมไลน์และยังได้
    // เงาคานตกลงบนเครื่อง แต่ไม่มีอะไรขวางสายตาที่ระดับพื้น

    // --- คานเชิงชายรอบอาคาร -------------------------------------------
    const t = 0.42;
    b.eave.push(box(zone.x, eaveY, z0, zone.w + t, t, t));
    b.eave.push(box(zone.x, eaveY, z1, zone.w + t, t, t));
    b.eave.push(box(x0, eaveY, zone.z, t, t, zone.d + t));
    b.eave.push(box(x1, eaveY, zone.z, t, t, zone.d + t));

    // --- โครงถักหลังคา: หลังคาหลายช่วง (multi-bay) --------------------
    //
    // จันทันพาดตาม **ด้านสั้น** ของโซน แต่ห้ามพาดเต็มด้านนั้นทีเดียว: โซน
    // LINES จริงกว้าง 295 x 408 ม. ช่วงพาดเดียว 295 ม. ไม่มีอยู่จริงในงาน
    // โครงสร้าง (โรงงานพาดไกลสุดราว 40-60 ม.) และจะเรนเดอร์ออกมาเป็นเต็นท์
    // ยักษ์หลังเดียวคลุมทั้งโรง
    //
    // จึงซอยด้านสั้นเป็นช่วงพาดย่อยกว้างไม่เกิน `MAX_ROOF_SPAN` แต่ละช่วงมี
    // จันทัน/อกไก่/แปของตัวเอง — ได้หลังคาลูกฟูกหลายลูกเหมือนโรงงานหลายช่วง
    // จริง และได้เงาคานตกเป็นแถบซ้ำ ๆ ซึ่งช่วยให้อ่านสเกลของโรงออก
    const spanAlongX = zone.w <= zone.d;
    const shortLen = spanAlongX ? zone.w : zone.d;
    const runLen = spanAlongX ? zone.d : zone.w;
    const roofBays = Math.max(1, Math.ceil(shortLen / MAX_ROOF_SPAN));
    const spanLen = shortLen / roofBays;
    const frames = Math.max(2, Math.round(runLen / bay));
    const shortStart = spanAlongX ? x0 : z0;
    const runStart = spanAlongX ? z0 : x0;

    for (let bayIndex = 0; bayIndex < roofBays; bayIndex += 1) {
      // จุดกลางของช่วงพาดย่อยนี้ บนแกนด้านสั้น
      const c = shortStart + spanLen * (bayIndex + 0.5);

      for (let f = 0; f <= frames; f += 1) {
        const u = runStart + (runLen * f) / frames;

        // จันทันสองท่อนเอียงขึ้นหาอกไก่ของช่วงนี้
        for (const side of [-1, 1]) {
          const rafter = new THREE.BoxGeometry(spanLen / 2, 0.2, 0.2);
          // เอียงตามความชันจริงของหลังคา (rise / ครึ่งช่วงพาด)
          const pitch = Math.atan2(ridgeRise, spanLen / 2) * -side;
          if (spanAlongX) {
            rafter.rotateZ(pitch);
            rafter.translate(c + (side * spanLen) / 4, eaveY + ridgeRise / 2, u);
          } else {
            rafter.rotateX(-pitch);
            rafter.translate(u, eaveY + ridgeRise / 2, c + (side * spanLen) / 4);
          }
          b.truss.push(rafter);
        }

        // เสาค้ำอกไก่ — สั้น อยู่บนโครงหลังคา ไม่ลงถึงพื้น จึงไม่บังเครื่อง
        b.truss.push(
          spanAlongX
            ? box(c, eaveY, u, 0.16, ridgeRise, 0.16)
            : box(u, eaveY, c, 0.16, ridgeRise, 0.16)
        );
        // เดิมมีเสารับปลายจันทันที่รอยต่อระหว่างช่วงหลังคาลงถึงพื้นด้วย —
        // ตัดออกพร้อมเสาอื่นทั้งหมด (399 ต้นเฉพาะรอยต่อ) ตามเหตุผลข้างบน
        // รอยต่อระหว่างช่วงยังอ่านออกจากแนวจันทันที่หักลงมาบรรจบกัน
      }

      // อกไก่ตลอดความยาวสันหลังคาของช่วงนี้
      b.truss.push(
        spanAlongX
          ? box(c, eaveY + ridgeRise, zone.z, 0.24, 0.24, runLen)
          : box(zone.x, eaveY + ridgeRise, c, runLen, 0.24, 0.24)
      );

      // แปพาดขวางจันทัน 4 เส้นต่อช่วง — ให้โครงหลังคาอ่านเป็นตะแกรง
      for (let i = 1; i <= 4; i += 1) {
        const frac = i / 5;
        const drop = ridgeRise * (1 - Math.abs(frac - 0.5) * 2);
        const p = -spanLen / 2 + spanLen * frac;
        b.truss.push(
          spanAlongX
            ? box(c + p, eaveY + drop, zone.z, 0.12, 0.12, runLen)
            : box(zone.x, eaveY + drop, c + p, runLen, 0.12, 0.12)
        );
      }

      // --- แผ่นหลังคาเมทัลชีต: สองผืนลาดจากเชิงชายขึ้นหาอกไก่ ----------
      //
      // ผืนละครึ่งช่วงพาด เอียงด้วยความชันเดียวกับจันทัน จึงวางแนบบนโครงพอดี
      // ยกขึ้นจากจันทัน 0.12 ม. กัน z-fighting กับตัวจันทันที่อยู่ใต้แผ่น
      //
      // ผืนนี้ไปอยู่ bucket `roofDeck` ซึ่งเป็นก้อนเดียวที่โหมด "เปิดหลังคา"
      // เลือกไม่เรนเดอร์ ตัวโครงถัก/เชิงชายยังอยู่ จึงยังเห็นเป็นโครงอาคาร
      for (const side of [-1, 1]) {
        const pitch = Math.atan2(ridgeRise, spanLen / 2) * -side;
        // ความยาวแผ่นวัดตามความลาด (ด้านตรงข้ามมุมฉาก) ไม่ใช่ระยะราบ ไม่งั้น
        // แผ่นจะสั้นกว่าจันทันและเปิดช่องโหว่ที่อกไก่
        const sheetLen = Math.hypot(spanLen / 2, ridgeRise);
        // สร้างให้แกนกว้าง/ลึกตรงกับทิศที่ช่วงพาดวางตัวตั้งแต่แรก แล้วหมุน
        // รอบเดียว — หมุนสองรอบ (rotateX แล้ว rotateY) ทำให้ระนาบแผ่นเพี้ยน
        const sheet = spanAlongX
          ? new THREE.BoxGeometry(sheetLen, 0.1, runLen)
          : new THREE.BoxGeometry(runLen, 0.1, sheetLen);
        if (spanAlongX) {
          sheet.rotateZ(pitch);
          sheet.translate(c + (side * spanLen) / 4, eaveY + ridgeRise / 2 + 0.12, zone.z);
        } else {
          sheet.rotateX(-pitch);
          sheet.translate(zone.x, eaveY + ridgeRise / 2 + 0.12, c + (side * spanLen) / 4);
        }
        b.roofDeck.push(sheet);
      }
    }

    // --- ป้ายชื่อโซนแขวนที่เชิงชายด้านหน้า (DXF: SIGN BOARD) ----------
    const signW = Math.min(zone.w * 0.4, 14);
    const signY = eaveY - 1.9;
    b.signPlate.push(box(zone.x, signY, z1 + 0.3, signW, 1.5, 0.18));
    b.signEdge.push(box(zone.x, signY - 0.16, z1 + 0.42, signW, 0.22, 0.06));
    for (const side of [-1, 1]) {
      b.metal.push(box(zone.x + (side * signW) / 2.4, signY + 1.5, z1 + 0.3, 0.09, 0.4, 0.09));
    }
  }
}
