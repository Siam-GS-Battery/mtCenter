import * as THREE from "three";
import type { LineInfo } from "../../../../lib/plantLayout";
import type { PlantBuilding, PlantShed, PlantTankFarm, PlantZone } from "../../../../lib/plantSite";
import { slabGeometry } from "./geometryKit";
import { ringStrip } from "./indoorLanes";
import {
  box,
  pillar,
  paintWalkEdges,
  walkRun,
  crossingStripes,
  Y_SITE_ROAD,
  Y_SITE_PAINT,
  Y_INDOOR_WALK,
  Y_INDOOR_PAINT,
  OUTDOOR_WALK_W,
  OUTDOOR_WALK_OFFSET,
  OUTDOOR_CURB_OFFSET,
  INDOOR_WALK_W,
  INDOOR_WALK_OFFSET,
  WALKWAY_WIDTH,
  WALKWAY_CLEARANCE,
  RING_ROAD_GAP,
  RING_ROAD_W,
  inflateBuildingRects,
  type Buckets,
} from "./siteShared";
import { excludeRanges } from "./siteGreenery";
import { INDOOR_ROAD_OFFSET, INDOOR_ROAD_W } from "./indoorLanes";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — ROADS
 * ===========================================================================
 *
 * ถนน/ทางเดินนอกอาคาร (ถนนบริการวงรอบ, ทางเดินแดงรอบนอก, ทางเชื่อมไลน์เข้า
 * วงเลียบผนังใน) — แยกจาก `SiteEnvironment.tsx` เดิม (ดูคอมเมนต์หัวไฟล์นั้น
 * สำหรับพื้นหลังของทั้งระบบ)
 *
 * หมายเหตุการจัดกลุ่ม: `tankFarmObstacle`/`RingRoadObstacle` ย้ายมาไว้ที่นี่
 * (ไม่ใช่ `siteUtilities.ts`) เพราะเป็นตัวที่ `ringRoadCuts`/`buildRingRoad`
 * ในไฟล์นี้ใช้งานโดยตรง ไม่ได้เกี่ยวกับ `buildAirHeaderRun`
 */

/**
 * ทางเดินคนสีแดงอิฐรอบนอกอาคาร + คันหินทาลายเหลือง/ขาว
 *
 * ตรงกับรูปตัวอย่างที่หนึ่ง: ทางเดินสีแดงอิฐ ตีเส้นเหลืองริมด้านเลนรถ และมี
 * คันหินทาลายเหลือง/ขาวสลับกันคั่นทางเดินออกจากถนน โดยมีหัวคันหินสีแดงที่
 * ปลายแนว
 *
 * วางระหว่างผนังโรงกับถนนบริการวงรอบ (`buildRingRoad`) จึงเป็นทางที่คนเดิน
 * เลียบอาคารได้รอบโดยไม่ต้องลงไปเดินบนถนน
 */
export function buildOutdoorWalkway(hallW: number, hallD: number, b: Buckets) {
  for (const run of ringStrip(hallW, hallD, OUTDOOR_WALK_OFFSET, OUTDOOR_WALK_W, false)) {
    b.walkRed.push(slabGeometry(run.x, run.z, run.w, run.d, Y_SITE_ROAD + 0.02, 0.04));
    paintWalkEdges(run, OUTDOOR_WALK_W, Y_SITE_PAINT + 0.02, b);
  }

  // --- คันหินทาลาย: แถบเหลือง/ขาวสลับทุก 1.2 ม. ปลายแนวเป็นแถบแดง ------
  const stripe = 1.2;
  for (const run of ringStrip(hallW, hallD, OUTDOOR_CURB_OFFSET, 0.4, false)) {
    const count = Math.max(4, Math.round(run.len / stripe));
    for (let i = 0; i < count; i += 1) {
      const t = -run.len / 2 + (run.len * (i + 0.5)) / count;
      const seg = (run.len / count) * 0.98;
      // สองแถบหัวท้ายของทุกด้านทาแดง (จุดห้ามจอด/ปลายแนว) ที่เหลือสลับเหลือง-ขาว
      const atEnd = i < 2 || i >= count - 2;
      const bucket = atEnd ? b.curbRed : i % 2 === 0 ? b.curbYellow : b.curbWhite;
      bucket.push(
        run.alongX
          ? box(run.x + t, Y_SITE_ROAD, run.z, seg, 0.3, 0.4)
          : box(run.x, Y_SITE_ROAD, run.z + t, 0.4, 0.3, seg)
      );
    }
  }
}

/**
 * โครงสร้างจริงที่ถนนบริการวงรอบต้องเว้นให้ (โรงเก็บของ/อาคาร/ถังแก๊ส) — กล่อง
 * ขอบเขตแบบเดียวกับ `PlantShed`/`PlantBuilding` (`x`,`z` ศูนย์กลาง, `w`,`d` ขนาด)
 */
interface RingRoadObstacle {
  x: number;
  z: number;
  w: number;
  d: number;
}

/**
 * ถังแก๊สเป็นทรงกระบอกเรียงแนวแกน X รอบจุด `t.x`,`t.z` (ดูสูตรเดียวกันใน
 * `PlantShell.tsx`: `x = farm.x + (i - (farm.n-1)/2) * farm.r*2.6`) แปลงเป็น
 * กล่องขอบเขตรวมทั้งกลุ่มถัง เพื่อเช็คระยะแบบเดียวกับโรงเก็บของ/อาคาร
 */
function tankFarmObstacle(t: PlantTankFarm): RingRoadObstacle {
  const spread = t.n > 1 ? (t.n - 1) * t.r * 2.6 : 0;
  return { x: t.x, z: t.z, w: spread + t.r * 2, d: t.r * 2 };
}

/**
 * ระยะเผื่อจริงระหว่างขอบโครงสร้างกับขอบถนนที่ถูกตัด (ม.) — เท่ากับระยะเผื่อ
 * โรงเก็บของ/อาคารอื่นในไฟล์นี้ (`DOCK_SHED_CLEARANCE`/`SUBSTATION_CLEARANCE` = 2)
 *
 * `obstacles` (ใน `buildRingRoad` ด้านล่าง) ผ่านกล่องอาคารที่ขยายด้วยชายคาแล้ว
 * (`inflateBuildingRects`, siteShared.ts) ก่อนเข้าฟังก์ชันนี้ ค่าเผื่อ 2 ม. นี้
 * จึงยังเป็นระยะเผื่อ "หลังหักชายคา" จริง (2 - 0.4 = 1.6 ม. เทียบกับกล่องสำรวจ
 * เปลือย ๆ) ไม่ใช่แค่กันชนกับกล่องเปลือยแล้วชายคาไปกินพื้นที่เผื่อจนเหลือ
 * น้อยกว่าที่ตั้งใจ
 */
const RING_ROAD_CLEARANCE = 2;

/**
 * หาช่วงบนแกน "along" ของถนนเส้นหนึ่งที่ต้องตัดออก เพราะมีโครงสร้างจริงคาบเกี่ยว
 * แถบถนน (แกน "across") ตรงนั้น — คืนเป็น cuts ให้ `excludeRanges` (ตัวเดียวกับ
 * ที่ตัดแนวพุ่มไม้ให้ท่ารับ-ส่งของ) ไปหั่นถนนเป็นท่อน ๆ
 */
function ringRoadCuts(
  run: { x: number; z: number; w: number; d: number; alongX: boolean },
  obstacles: RingRoadObstacle[]
): Array<{ x0: number; x1: number }> {
  const thickness = run.alongX ? run.d : run.w;
  const crossFixed = run.alongX ? run.z : run.x;
  const cuts: Array<{ x0: number; x1: number }> = [];
  for (const o of obstacles) {
    const structCross = run.alongX ? o.z : o.x;
    const structCrossHalf = run.alongX ? o.d / 2 : o.w / 2;
    if (Math.abs(structCross - crossFixed) >= thickness / 2 + structCrossHalf) continue;
    const structAlong = run.alongX ? o.x : o.z;
    const structAlongHalf = run.alongX ? o.w / 2 : o.d / 2;
    cuts.push({
      x0: structAlong - structAlongHalf - RING_ROAD_CLEARANCE,
      x1: structAlong + structAlongHalf + RING_ROAD_CLEARANCE,
    });
  }
  return cuts;
}

/**
 * ถนนบริการวงรอบ — เว้นช่วงให้โรงเก็บของ/อาคาร/ถังแก๊สจริงที่ยืนคาบเกี่ยวแถบ
 * ถนน (ผนัง +9 ถึง +17 ม.)
 * ===========================================================================
 *
 * ของเดิมตีถนนตรงยาวทั้งสี่ด้านโดยไม่รู้จัก `sheds`/`buildings`/`tankFarms`
 * เลย — ที่ hall ขนาดจริง (~325x535 ม.) โรงเก็บอุปกรณ์ทั้ง 9 หลังใน
 * `RAW_SHEDS` (ระยะจริงจากผนัง 10.7-18.7 ม.) และถังแก๊สทั้ง 3 กลุ่มใน
 * `RAW_TANK_FARMS` (13.8-15.6 ม., N2/O2 คาบเกี่ยวผนังแกน X ด้วย) ตกอยู่กลาง
 * แถบถนนนี้พอดี ถังแก๊ส N2/O2 ยังอยู่ใกล้มุมจนคาบเกี่ยวถนนฝั่งแกน X ด้วย และ
 * อาคาร TRAINING CENTER / TRAINING-ENGINEERING ใน `RAW_BUILDINGS` ก็คาบเกี่ยว
 * ถนนฝั่งแกน X เช่นกัน (ลึกเข้ามาถึง 33/27 ม. — มากกว่าที่จะขยับช่องว่างถนน
 * เฉพาะด้านนั้นได้โดยไม่ไปชนแนวต้นไม้ `TREE_ROWS[0]` = 22 ม. ซึ่งสมมติว่าถนน
 * จบที่ +17 ม.เสมอ)
 *
 * จึง **ไม่แตะ `RING_ROAD_GAP`/`RING_ROAD_W` เลย** (ทุกอย่างที่อ้างอิงสองค่านี้
 * — `TREE_ROWS`, `HYDRANT_OFFSET`, `OUTDOOR_CURB_OFFSET`, กันสาดท่ารับ-ส่งของ,
 * ระยะร่นสถานีไฟฟ้า — ยังถูกต้องเป๊ะเหมือนเดิม) แต่ตัดถนนเป็นท่อน ๆ แทน ที่
 * ท่อนไหนคาบเกี่ยวโครงสร้างจริงก็เว้นช่วงนั้นไป (เหมือนที่ `buildGreenery` ตัด
 * แนวพุ่มไม้ให้ท่ารับ-ส่งของด้วย `excludeRanges` ตัวเดียวกัน) คำนวณจาก
 * `site.sheds`/`site.buildings`/`site.tankFarms` ที่รันไทม์ จึงตามข้อมูลจริง
 * เสมอไม่ว่าจะย้าย/เพิ่ม/ลดโรงเก็บของภายหลัง
 */
export function buildRingRoad(
  hallW: number,
  hallD: number,
  sheds: PlantShed[],
  buildings: PlantBuilding[],
  tankFarms: PlantTankFarm[],
  b: Buckets
) {
  const roadW = RING_ROAD_W;
  // ห่างจากผนังโรงพอให้เปิดประตูโรงและรถเลี้ยวได้
  const offX = hallW / 2 + RING_ROAD_GAP + roadW / 2;
  const offZ = hallD / 2 + RING_ROAD_GAP + roadW / 2;
  const spanX = hallW + 2 * (RING_ROAD_GAP + roadW);
  const spanZ = hallD + 2 * (RING_ROAD_GAP + roadW);

  // อาคารจริงมีชายคายื่น 0.4 ม./ด้าน (`inflateBuildingRects`, siteShared.ts) —
  // ขยายกล่องก่อนตัดถนน ไม่งั้นถนนจะตัดตามกล่องสำรวจเปลือย ๆ แล้วเว้นน้อยกว่า
  // ที่ `RING_ROAD_CLEARANCE` ตั้งใจไว้จริง 0.4 ม. (สเหด `sheds` ไม่มียื่น จึง
  // ไม่ต้องขยาย)
  const obstacles: RingRoadObstacle[] = [
    ...sheds,
    ...inflateBuildingRects(buildings),
    ...tankFarms.map(tankFarmObstacle),
  ];

  const runs: Array<{ x: number; z: number; w: number; d: number; alongX: boolean; len: number }> = [
    { x: 0, z: offZ, w: spanX, d: roadW, alongX: true, len: spanX },
    { x: 0, z: -offZ, w: spanX, d: roadW, alongX: true, len: spanX },
    { x: offX, z: 0, w: roadW, d: spanZ, alongX: false, len: spanZ },
    { x: -offX, z: 0, w: roadW, d: spanZ, alongX: false, len: spanZ },
  ];

  for (const run of runs) {
    const cuts = ringRoadCuts(run, obstacles);
    const segments = excludeRanges(-run.len / 2, run.len / 2, cuts);

    for (const seg of segments) {
      const segLen = seg.x1 - seg.x0;
      if (segLen <= 0.05) continue;
      const segCenter = (seg.x0 + seg.x1) / 2;
      const segX = run.alongX ? segCenter : run.x;
      const segZ = run.alongX ? run.z : segCenter;
      const segW = run.alongX ? segLen : run.w;
      const segD = run.alongX ? run.d : segLen;

      b.roadway.push(slabGeometry(segX, segZ, segW, segD, Y_SITE_ROAD, 0.05));

      // เส้นประกลางถนน — ระยะขีดคงที่ 6 ม. ต่อช่วง จึงไม่ยืดตามความยาวถนน
      const dashes = Math.max(2, Math.round(segLen / 12));
      for (let i = 0; i < dashes; i += 1) {
        const t = -segLen / 2 + (segLen * (i + 0.5)) / dashes;
        b.laneLine.push(
          run.alongX
            ? slabGeometry(segX + t, segZ, (segLen / dashes) * 0.45, 0.2, Y_SITE_PAINT, 0.02)
            : slabGeometry(segX, segZ + t, 0.2, (segLen / dashes) * 0.45, Y_SITE_PAINT, 0.02)
        );
      }

      // คันหินสองข้างถนน + ฝาท่อระบายทุก ๆ 25 ม. (ต่อท่อน)
      for (const side of [-1, 1]) {
        const cx = run.alongX ? segX : segX + (side * segW) / 2;
        const cz = run.alongX ? segZ + (side * segD) / 2 : segZ;
        b.curb.push(
          run.alongX
            ? box(cx, Y_SITE_ROAD, cz, segLen, 0.16, 0.35)
            : box(cx, Y_SITE_ROAD, cz, 0.35, 0.16, segLen)
        );
      }
      const drains = Math.max(1, Math.round(segLen / 25));
      for (let i = 0; i < drains; i += 1) {
        const t = -segLen / 2 + (segLen * (i + 0.5)) / drains;
        const mx = run.alongX ? segX + t : segX - segW / 2 + 0.6;
        const mz = run.alongX ? segZ - segD / 2 + 0.6 : segZ + t;
        b.metal.push(pillar(mx, Y_SITE_ROAD + 0.02, mz, 0.35, 0.06, 8));
      }
    }
  }
}

/**
 * ทางเดินเชื่อม "วงเดินรอบไลน์การผลิต" เข้ากับ "วงเดินเลียบผนังในอาคาร"
 *
 * เดิมสองระบบนี้ไม่ต่อกันเลย: วงรอบไลน์อยู่ในโซน (ร่นจากผนัง 15 ม.) ส่วนวง
 * เลียบผนังอยู่ที่ผนัง +1.4 ถึง +4.0 ม. คนที่เดินอยู่รอบไลน์หนึ่งจึงออกมาที่
 * ทางเดินเลียบผนังไม่ได้ — และนั่นทำให้ "เชื่อมต่อกับไลน์การผลิต" ไม่เป็นจริง
 *
 * ตัวนี้ยิงทางเชื่อมสั้นที่สุดจากขอบวงของแต่ละไลน์ ออกไปตั้งฉากกับผนังที่
 * ใกล้ที่สุด ไปบรรจบวงเลียบผนัง ทางเชื่อมตัดผ่านเลนรถในอาคาร (ผนัง +5.4 ถึง
 * +11.4 ม.) จึงตีทางม้าลายคร่อมช่วงนั้น
 */
export function buildLineToPerimeterLinks(lines: LineInfo[], hallW: number, hallD: number, b: Buckets) {
  const y = Y_INDOOR_WALK;
  const yPaint = Y_INDOOR_PAINT;
  const ringEdge = INDOOR_WALK_OFFSET + INDOOR_WALK_W / 2;
  const roadInner = INDOOR_ROAD_OFFSET - INDOOR_ROAD_W / 2;
  const roadOuter = INDOOR_ROAD_OFFSET + INDOOR_ROAD_W / 2;

  for (const line of lines) {
    const w = Math.abs(line.x1 - line.x0);
    const d = Math.abs(line.z1 - line.z0);
    if (w <= 0 || d <= 0) continue;

    const cx = (line.x0 + line.x1) / 2;
    const cz = (line.z0 + line.z1) / 2;
    const alongX = w >= d;
    const across = (alongX ? d : w) / 2 + WALKWAY_CLEARANCE + WALKWAY_WIDTH / 2;
    const along = (alongX ? w : d) / 2;

    // ขอบนอกของวงเดินรอบไลน์ ทั้งสี่ทิศ
    const loopMinX = cx - (alongX ? along + WALKWAY_WIDTH / 2 : across + WALKWAY_WIDTH / 2);
    const loopMaxX = cx + (alongX ? along + WALKWAY_WIDTH / 2 : across + WALKWAY_WIDTH / 2);
    const loopMinZ = cz - (alongX ? across + WALKWAY_WIDTH / 2 : along + WALKWAY_WIDTH / 2);
    const loopMaxZ = cz + (alongX ? across + WALKWAY_WIDTH / 2 : along + WALKWAY_WIDTH / 2);

    // ระยะจากขอบวงถึงวงเลียบผนัง ทั้งสี่ด้าน — เลือกด้านที่สั้นสุด
    const options: Array<{ axis: "x" | "z"; from: number; to: number; fixed: number; wall: number; sign: number }> = [
      { axis: "x", from: loopMinX, to: -(hallW / 2 - ringEdge), fixed: cz, wall: hallW / 2, sign: -1 },
      { axis: "x", from: loopMaxX, to: hallW / 2 - ringEdge, fixed: cz, wall: hallW / 2, sign: 1 },
      { axis: "z", from: loopMinZ, to: -(hallD / 2 - ringEdge), fixed: cx, wall: hallD / 2, sign: -1 },
      { axis: "z", from: loopMaxZ, to: hallD / 2 - ringEdge, fixed: cx, wall: hallD / 2, sign: 1 },
    ];
    let best = options[0];
    let bestLen = Math.abs(best.to - best.from);
    for (const opt of options) {
      const len = Math.abs(opt.to - opt.from);
      if (len < bestLen) {
        best = opt;
        bestLen = len;
      }
    }
    if (bestLen <= 0.5) continue;

    walkRun(best.axis, best.from, best.to, best.fixed, WALKWAY_WIDTH, y, yPaint, b.walkGreen, b);

    // ทางม้าลายคร่อมเลนรถในอาคาร (ถ้าทางเชื่อมยาวพอจะตัดผ่านจริง)
    const crossFrom = best.sign * (best.wall - roadOuter);
    const crossTo = best.sign * (best.wall - roadInner);
    const lo = Math.min(best.from, best.to);
    const hi = Math.max(best.from, best.to);
    if (Math.min(crossFrom, crossTo) >= lo && Math.max(crossFrom, crossTo) <= hi) {
      crossingStripes(best.axis, crossFrom, crossTo, best.fixed, WALKWAY_WIDTH, yPaint, b);
    }
  }
}
