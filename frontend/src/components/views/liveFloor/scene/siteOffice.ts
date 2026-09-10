import * as THREE from "three";
import { slabGeometry } from "./geometryKit";
import {
  box,
  pillar,
  officeFloors,
  walkRun,
  crossingStripes,
  Y_SITE_ROAD,
  Y_SITE_PAINT,
  OUTDOOR_WALK_OFFSET,
  TREE_ROWS,
  type Corridor,
  type Buckets,
} from "./siteShared";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — OFFICE
 * ===========================================================================
 *
 * อาคารสำนักงานตั้งเดี่ยว + ทางเดินเชื่อม — แยกจาก `SiteEnvironment.tsx` เดิม
 * (ดูคอมเมนต์หัวไฟล์นั้นสำหรับพื้นหลังของทั้งระบบ) ไม่มีในรายการ seam ที่ระบุ
 * ไว้แต่แรก แต่เป็นกลุ่มฟังก์ชันที่แยกจากกลุ่มอื่นได้ชัดเจน (ตำแหน่ง/ทางเดิน
 * ของอาคารสำนักงานทั้งชุด)
 */

/** ความสูงต่อชั้นของอาคารสำนักงาน (เมตร) */
const OFFICE_FLOOR_H = 4.0;

/**
 * ช่องทางเข้าที่ทางเดินสำนักงานตัดผ่านแนวต้นไม้
 *
 * ปัญหาที่แก้: ทางเดินจากสายหลัก (`OFFICE_SPINE_OFFSET`, ผนัง +44 ม.) วิ่งเข้า
 * หาโรงไปบรรจบทางเดินรอบนอกอาคาร (ผนัง +3.1 ม.) — เส้นทางนั้นตัดผ่านแนว
 * ต้นไม้ทั้งสามแถว (`TREE_ROWS` = +22, +31, +40 ม.) ตรง ๆ ผลคือทางเดินโผล่
 * ทะลุกลางพุ่มไม้ ต้นไม้คร่อมทับทาง ดูเหมือนวางซ้อนกันมั่ว ไม่ใช่ไซต์ที่จัด
 *
 * วิธีแก้ที่เลือก: **ให้ต้นไม้เว้นช่องให้ทางเดิน** ไม่ใช่ดัดทางเดินให้อ้อม
 * ดงไม้ — เพราะไซต์จริงก็ทำแบบนี้ ทางเข้าที่ผ่านแนวไม้ประดับจะมีต้นไม้ขนาบ
 * สองข้าง ไม่ใช่ต้นไม้ยืนกลางทาง และการดัดทางเดินให้คดไปมาระหว่างต้นไม้
 * 492 ต้นจะได้ทางที่เดินจริงไม่ได้และคำนวณไม่จบ
 *
 * ฟังก์ชันนี้เป็นแหล่งข้อมูลเดียวของช่องทางเข้า: `buildOfficeLinks` วาด
 * ทางเดินลงในช่องนี้ และ `buildGreenery` อ่านช่องเดียวกันไปเว้นการปลูก
 * ถ้าแยกกันคำนวณ ช่องจะเลื่อนไม่ตรงกันทันทีที่ใครขยับค่าใดค่าหนึ่ง
 */
export function officeEntryCorridors(hallW: number, hallD: number): Corridor[] {
  const sites = officeSites(hallW, hallD);
  const out: Corridor[] = [];
  const halfWidth = LINK_WIDTH / 2 + TREE_PATH_CLEARANCE;

  for (const side of ["-x", "+x", "+z"] as OfficeSide[]) {
    const onSide = sites.filter((o) => o.side === side);
    if (onSide.length === 0) continue;

    const alongZ = side !== "+z";
    const coords = onSide.map((o) => (alongZ ? o.z : o.x));
    const halfSpans = onSide.map((o) => (alongZ ? o.d : o.w) / 2 + 10);
    const lo = Math.min(...coords.map((c, i) => c - halfSpans[i]));
    const hi = Math.max(...coords.map((c, i) => c + halfSpans[i]));
    // ทางแยกเข้าโรงอยู่กลางกลุ่มอาคารของด้านนั้น — ต้องตรงกับ buildOfficeLinks
    const mid = (lo + hi) / 2;

    const wallFace = alongZ ? hallW / 2 : hallD / 2;
    const sign = side === "-x" ? -1 : 1;
    // ช่องกินตั้งแต่ทางเดินรอบนอกอาคารไปจนถึงสายหลัก (คลุมทั้งสามแถวไม้)
    const near = sign * (wallFace + OUTDOOR_WALK_OFFSET);
    const far = sign * (wallFace + OFFICE_SPINE_OFFSET);

    out.push(
      alongZ
        ? {
            x0: Math.min(near, far),
            x1: Math.max(near, far),
            z0: mid - halfWidth,
            z1: mid + halfWidth,
          }
        : {
            x0: mid - halfWidth,
            x1: mid + halfWidth,
            z0: Math.min(near, far),
            z1: Math.max(near, far),
          }
    );
  }
  return out;
}

/** ระยะที่ทางเดินสายหลักฝั่งอาคารสำนักงานวางตัว วัดจากผนังโรง (เมตร) */
/**
 * ระยะที่สายหลักฝั่งอาคารสำนักงานวางตัว วัดจากผนังโรง (เมตร)
 *
 * ต้องมีที่ว่างพอทั้งสองข้าง — เดิมตั้งไว้ 44 ม. ซึ่งเหลือระยะจากขอบพุ่มไม้
 * แถวนอกสุด (ปลูกที่ +40 ม. พุ่มรัศมีถึง 1.94 ม. จึงกินถึง +41.94) แค่
 * **0.66 ม.** ต้นไม้เอนคลุมทางจนดูเบียด
 *
 * ที่ 46 ม. ได้ระยะ 2.66 ม. จากดงไม้ และยังห่างจากขอบอาคารสำนักงาน
 * (ร่น `TREE_ROWS` สุดท้าย + `OFFICE_PLAZA_MARGIN`) อีก 2.6 ม.
 */
const OFFICE_SPINE_OFFSET = 46;

/**
 * ระยะจากแนวต้นไม้แถวนอกสุดถึงขอบอาคารสำนักงาน (เมตร)
 *
 * ต้องกว้างพอให้สายหลักที่ `OFFICE_SPINE_OFFSET` แทรกอยู่ตรงกลางได้ โดยไม่
 * ชนทั้งดงไม้และตัวอาคาร (44 ม. เดิมทำให้สายหลักเบียดดงไม้ ดู comment ข้างบน)
 */
const OFFICE_PLAZA_MARGIN = 10;

/** ความกว้างทางเดินเชื่อมอาคารสำนักงาน (เมตร) */
export const LINK_WIDTH = 2.8;

/**
 * ระยะที่ต้นไม้ต้องถอยห่างจากขอบทางเดิน (เมตร)
 *
 * พุ่มไม้ที่ใหญ่สุดในฉากมีรัศมี ~1.94 ม. (`crowns` ตัวแรก x สเกล 1.14) ถ้า
 * เว้นน้อยกว่านี้ พุ่มจะยังคร่อมทางเดินอยู่แม้ลำต้นจะอยู่นอกทางแล้ว
 */
const TREE_PATH_CLEARANCE = 3.6;

/** ด้านของไซต์ที่อาคารตั้งอยู่ — ใช้บอกทิศที่ทางเดินต้องวิ่งเข้าหาโรง */
type OfficeSide = "-x" | "+x" | "+z";

export interface OfficeSite {
  /** จุดศูนย์อาคาร (เมตร) */
  x: number;
  z: number;
  /** ขนาดอาคาร (เมตร) */
  w: number;
  d: number;
  side: OfficeSide;
}

/**
 * ตำแหน่งและขนาดอาคารสำนักงาน — แหล่งข้อมูลเดียว
 *
 * ทั้งตัวอาคาร (`buildOfficeBuildings`) และทางเดินที่เชื่อมอาคาร
 * (`buildOfficeLinks`) อ่านจากฟังก์ชันนี้ ถ้าแยกกันถือตัวเลขคนละชุด ทางเดิน
 * จะเลื่อนหลุดจากตัวอาคารทันทีที่มีใครขยับด้านใดด้านหนึ่ง
 *
 * ระยะร่นสำคัญ: **ขอบอาคารที่ใกล้โรงที่สุดต้องอยู่พ้นแนวต้นไม้แถวนอกสุด**
 * (`TREE_ROWS` ตัวท้าย = ผนัง +40 ม.) ไม่ใช่แค่จุดศูนย์อาคารพ้น — ไม่งั้น
 * ต้นไม้จะงอกทะลุตัวอาคารออกมา ซึ่งเกิดขึ้นจริงในเวอร์ชันแรก (อาคารกว้าง 62
 * ม. ที่ศูนย์อยู่ +66 ม. มีขอบใกล้อยู่แค่ +35 ม. คือกลางดงไม้)
 *
 * จึงคิดจากขอบเข้าไป: ศูนย์อาคาร = ครึ่งโรง + `setback` + ครึ่งอาคาร
 */
export function officeSites(hallW: number, hallD: number): OfficeSite[] {
  const setback = (halfSpan: number) =>
    TREE_ROWS[TREE_ROWS.length - 1] + OFFICE_PLAZA_MARGIN + halfSpan;
  return [
    { x: -(hallW / 2 + setback(31)), z: -hallD * 0.2, w: 62, d: 30, side: "-x" },
    { x: hallW / 2 + setback(27), z: -hallD * 0.26, w: 54, d: 28, side: "+x" },
    { x: hallW / 2 + setback(34), z: hallD * 0.14, w: 68, d: 32, side: "+x" },
    { x: -hallW * 0.16, z: hallD / 2 + setback(17) + 24, w: 84, d: 34, side: "+z" },
  ];
}

/**
 * อาคารสำนักงานตั้งเดี่ยวรอบไซต์
 *
 * ทรงตามอาคารอ้างอิงที่ผู้ใช้ชี้: กล่องสี่เหลี่ยมผนังทึบสีอ่อน คาดแถบกระจก
 * แนวนอนยาวตลอดด้านทุกชั้น มีแถบพื้นชั้นคั่น หลังคาแบนมีชายยื่น และมีอาคาร
 * เตี้ย (โถงทางเข้า) ยื่นออกมาด้านหน้า
 *
 * ต่างจากอาคารใน `PlantShell` ที่วาดตาม `site.buildings` จากแบบ — ชุดนี้เป็น
 * อาคารตั้งเดี่ยวที่วางเพิ่มตามตำแหน่งที่ผู้ใช้กำหนด ขนาดใหญ่กว่าและสูงกว่า
 *
 * ตำแหน่งทั้งสี่อยู่ *นอก* แนวต้นไม้ (`TREE_ROWS` สุดท้าย +40 ม.) และนอกกลุ่ม
 * ป้อมยาม/ประตู/บ่อบำบัด (+33 ม.) จึงไม่ทับของเดิม
 */
export function buildOfficeBuildings(hallW: number, hallD: number, b: Buckets) {
  const sites = officeSites(hallW, hallD);
  const FLOOR_H = OFFICE_FLOOR_H;

  for (let i = 0; i < sites.length; i += 1) {
    const { x, z, w, d } = sites[i];
    const floors = officeFloors(i);
    const h = floors * FLOOR_H;

    // ลานปูรอบอาคาร — ทำให้ตัวอาคารดูตั้งอยู่บนพื้นที่ของมัน ไม่ลอยบนหญ้า
    b.plaza.push(slabGeometry(x, z, w + 16, d + 16, 0.1, 0.05));

    // ตัวอาคาร
    b.officeWall.push(box(x, 0.15, z, w, h, d));

    // แถบกระจกแนวนอน + แถบพื้นชั้น ทุกชั้น รอบทั้งสี่ด้าน
    for (let f = 0; f < floors; f += 1) {
      const bandY = 0.15 + f * FLOOR_H;
      const glassH = FLOOR_H * 0.46;
      const glassY = bandY + FLOOR_H * 0.42;
      const slabY = bandY + FLOOR_H * 0.06;

      // ยื่นออกจากผิวผนัง 8 ซม. กัน z-fighting กับตัวอาคาร
      const o = 0.08;
      b.glass.push(box(x, glassY, z + d / 2 + o, w * 0.9, glassH, 0.06));
      b.glass.push(box(x, glassY, z - d / 2 - o, w * 0.9, glassH, 0.06));
      b.glass.push(box(x + w / 2 + o, glassY, z, 0.06, glassH, d * 0.88));
      b.glass.push(box(x - w / 2 - o, glassY, z, 0.06, glassH, d * 0.88));

      b.officeBand.push(box(x, slabY, z + d / 2 + o, w * 0.94, FLOOR_H * 0.12, 0.09));
      b.officeBand.push(box(x, slabY, z - d / 2 - o, w * 0.94, FLOOR_H * 0.12, 0.09));
      b.officeBand.push(box(x + w / 2 + o, slabY, z, 0.09, FLOOR_H * 0.12, d * 0.92));
      b.officeBand.push(box(x - w / 2 - o, slabY, z, 0.09, FLOOR_H * 0.12, d * 0.92));
    }

    // หลังคาแบน + ชายยื่นรอบอาคาร
    b.eave.push(box(x, 0.15 + h, z, w + 2.2, 0.55, d + 2.2));
    // ห้องเครื่องบนหลังคา (lift machine room) — ให้ยอดอาคารไม่แบนเรียบเปล่า
    b.officeWall.push(box(x + w * 0.22, 0.15 + h + 0.55, z, w * 0.2, 2.6, d * 0.34));

    // โถงทางเข้าเตี้ยยื่นออกด้านหน้า (+z) สองก้อน ตามอาคารอ้างอิง
    for (const side of [-1, 1]) {
      const ax = x + side * w * 0.2;
      const az = z + d / 2 + 7;
      b.officeWall.push(box(ax, 0.15, az, w * 0.3, FLOOR_H * 1.1, 13));
      b.glass.push(box(ax, 0.15 + FLOOR_H * 0.5, az + 6.5 + 0.08, w * 0.26, FLOOR_H * 0.5, 0.06));
      b.eave.push(box(ax, 0.15 + FLOOR_H * 1.1, az, w * 0.3 + 1.6, 0.4, 14.6));
    }
  }
}

/**
 * ทางเดินเชื่อมอาคารสำนักงานเข้าหากัน และเข้าหาโรงงาน
 *
 * โครงข่ายมีสามส่วน ต่อกันเป็นทางเดียวได้จริง ไม่ใช่เส้นลอย ๆ
 *
 *   1. **สายหลักประจำด้าน** (spine) วิ่งขนานผนังโรงที่ระยะ
 *      `OFFICE_SPINE_OFFSET` (ผนัง +44 ม. — พ้นดงไม้ที่จบ +40 ม. และอยู่บน
 *      ลานปูของอาคาร) ยาวคลุมทุกอาคารที่อยู่ด้านนั้น อาคารด้านเดียวกันจึงเดิน
 *      ถึงกันได้ตรง ๆ
 *   2. **ทางแยกเข้าอาคาร** จากสายหลักไปหาด้านหน้าอาคารแต่ละหลัง
 *   3. **ทางแยกเข้าโรง** จากสายหลักวิ่งเข้าหาผนัง ไปบรรจบ *ทางเดินแดงรอบนอก
 *      อาคาร* (`buildOutdoorWalkway`, ผนัง +3.1 ม.) ซึ่งเดินรอบโรงครบวงและมี
 *      ทางเชื่อมเข้าไปในโรงต่อ — อาคารทุกหลังจึงเดินถึงกันข้ามด้านได้ด้วย
 *      และเดินถึงไลน์การผลิตได้
 *
 * ทางแยกเข้าโรงตัดผ่านถนนบริการวงรอบ (ผนัง +9 ถึง +17 ม.) จึงตีทางม้าลาย
 * คร่อมช่วงนั้นไว้ — จุดข้ามถนนที่อนุญาต ตามกฎเดียวกับเลนเดินอื่นในฉาก
 *
 * และตัดผ่านแนวต้นไม้สามแถวด้วย — ตรงนั้น `buildGreenery` เว้นช่องไว้ให้แล้ว
 * ตาม `officeEntryCorridors` พร้อมพุ่มขนาบสองข้าง จึงไม่มีต้นไม้ยืนกลางทาง
 */
export function buildOfficeLinks(hallW: number, hallD: number, b: Buckets) {
  const sites = officeSites(hallW, hallD);
  const y = Y_SITE_ROAD + 0.02;
  const yPaint = Y_SITE_PAINT + 0.02;

  const ROAD_INNER = 9;
  const ROAD_OUTER = 17;
  const perimeter = OUTDOOR_WALK_OFFSET;

  // --- 1) สายหลักประจำด้าน ------------------------------------------------
  const sides: OfficeSide[] = ["-x", "+x", "+z"];
  for (const side of sides) {
    const onSide = sites.filter((o) => o.side === side);
    if (onSide.length === 0) continue;

    const alongZ = side !== "+z";
    // สายหลักต้องยาวคลุมทุกอาคารด้านนั้น + เผื่อหัวท้ายให้ต่อทางแยกได้
    const coords = onSide.map((o) => (alongZ ? o.z : o.x));
    const halfSpans = onSide.map((o) => (alongZ ? o.d : o.w) / 2 + 10);
    const lo = Math.min(...coords.map((c, i) => c - halfSpans[i]));
    const hi = Math.max(...coords.map((c, i) => c + halfSpans[i]));

    const fixed =
      side === "-x"
        ? -(hallW / 2 + OFFICE_SPINE_OFFSET)
        : side === "+x"
          ? hallW / 2 + OFFICE_SPINE_OFFSET
          : hallD / 2 + OFFICE_SPINE_OFFSET;

    walkRun(alongZ ? "z" : "x", lo, hi, fixed, LINK_WIDTH, y, yPaint, b.walkRed, b);

    // --- 3) ทางแยกเข้าโรง: จากสายหลักวิ่งเข้าไปบรรจบทางเดินรอบนอกอาคาร ---
    // วางที่ตำแหน่งกลางกลุ่มอาคารด้านนั้น หนึ่งเส้นต่อด้าน
    const mid = (lo + hi) / 2;
    const wallFace = side === "+z" ? hallD / 2 : hallW / 2;
    const sign = side === "-x" ? -1 : 1;
    const inner = sign * (wallFace + perimeter);
    const outer = fixed;

    walkRun(alongZ ? "x" : "z", inner, outer, mid, LINK_WIDTH, y, yPaint, b.walkRed, b);

    // ทางม้าลายคร่อมช่วงที่ตัดถนนบริการ
    crossingStripes(
      alongZ ? "x" : "z",
      sign * (wallFace + ROAD_INNER),
      sign * (wallFace + ROAD_OUTER),
      mid,
      LINK_WIDTH,
      yPaint,
      b
    );
  }

  // --- 2) ทางแยกเข้าอาคารแต่ละหลัง ---------------------------------------
  for (const o of sites) {
    const alongZ = o.side !== "+z";
    const spine =
      o.side === "-x"
        ? -(hallW / 2 + OFFICE_SPINE_OFFSET)
        : o.side === "+x"
          ? hallW / 2 + OFFICE_SPINE_OFFSET
          : hallD / 2 + OFFICE_SPINE_OFFSET;

    // ด้านหน้าอาคารคือด้านที่โถงทางเข้ายื่นออก (+z ในพิกัดของตัวอาคาร)
    // ทางแยกจึงวิ่งจากสายหลักไปชนขอบลานด้านที่หันเข้าโรง
    if (alongZ) {
      const face = o.x - Math.sign(o.x) * (o.w / 2 + 8);
      walkRun("x", spine, face, o.z, LINK_WIDTH, y, yPaint, b.walkRed, b);
    } else {
      const face = o.z - (o.d / 2 + 8);
      walkRun("z", spine, face, o.x, LINK_WIDTH, y, yPaint, b.walkRed, b);
    }
  }
}
