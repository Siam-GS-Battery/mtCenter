import * as THREE from "three";
import type { PlantRoad } from "../../../../lib/plantSite";
import { box, pillar, type Corridor, type Buckets } from "./siteShared";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — ENTRANCE
 * ===========================================================================
 *
 * ประตูรั้ว/ป้อมยาม/ตาชั่ง/ไม้กั้น/ป้ายทางเข้า/บ่อบำบัด — แยกจาก
 * `SiteEnvironment.tsx` เดิม (ดูคอมเมนต์หัวไฟล์นั้นสำหรับพื้นหลังของทั้งระบบ)
 */

/**
 * อาคารประกอบไซต์ — ประตูรั้ว ป้าย ตาชั่ง ไม้กั้น และบ่อบำบัด
 * (DXF: GATE, FENCE AND GATE, SIGN BOARD, TREATMENT TANK)
 *
 * ป้อมยาม (GUARD HOUSE) มีอยู่แล้วจริงใน `RAW_BUILDINGS` และถูก `PlantShell.tsx`
 * วาดจาก `site.buildings` — ไฟล์นี้จึง **ไม่ปั้นป้อมยามซ้ำ** อีกต่อไป (ของเดิม
 * เคยปั้นป้อมยามสังเคราะห์ที่นี่ ซึ่งกลายเป็นป้อมยามสองหลังซ้อนกันพอดึงจุดยึด
 * ไปตรงกับตำแหน่งจริง) เหลือแค่คำนวณตำแหน่งของป้อมยามจริงเพื่อวางประตูให้
 * ติดกับมันเท่านั้น
 *
 * วางที่ขอบไซต์ด้านหน้า (+z) ซึ่งเป็นด้านที่ `site.roads`/`site.parking` จาก
 * แบบกระจุกอยู่ จึงเป็นด้านทางเข้าโรงตามแบบจริง
 */
export function buildSiteBuildings(
  hallW: number,
  hallD: number,
  b: Buckets,
  gateRoad: PlantRoad | undefined
): Corridor[] {
  // จุดยึดของ "ทางเข้า" ทั้งชุด (ประตู/ป้าย/ตาชั่ง/ไม้กั้น) ผูกกับถนน
  // site.roads ชื่อ "MAIN GATE road" จริง (ค่าหลัง scaleSiteTo — พิกัดเดียวกับ
  // ที่ PlantShell.tsx เอาไปวาดเป็นแผ่นถนน) ไม่ใช่สัดส่วน hallW/hallD แบบเดา ๆ
  // อีกต่อไป — ของเดิมสองจุดนี้ไม่ผูกกัน ที่ hall ขนาดจริง (~325x535 ม.) ประตู
  // ที่เดาไว้ห่างจากถนนจริงถึง ~235 ม. ในแกน X ถ้าไม่พบถนนชื่อนี้ (ข้อมูลเปลี่ยน)
  // fallback กลับไปใช้ค่าประมาณเดิมแทนที่จะพังทั้งฉาก — ค่าประมาณนี้ *ไม่ตรง*
  // กับตำแหน่งเดิมทุกจุดทศนิยม (ป้อมยามใช้ตำแหน่งจริงคงที่แทนสัดส่วน hallW แล้ว)
  // เป็นแค่ทางไม่ให้พังเฉย ๆ เพราะในทางปฏิบัติ "MAIN GATE road" มีอยู่ใน
  // RAW_ROADS เสมอ เส้นทางนี้จึงแทบไม่ถูกใช้จริง
  //
  // ระบบพิกัดท้องถิ่นด้านล่าง: "along" = แนวที่รถวิ่งผ่านถนน (ยาวตามถนน, ค่า
  // บวก = ออกจากไซต์/ไกลจากโรงงานมากขึ้น), "across" = แนวขวางถนน (กว้างของ
  // ถนน, ที่ประตู/ไม้กั้น/ป้อมยามเรียงคร่อมกัน) ถนน dir "y" วิ่งตามแกน Z ของ
  // ฉาก (along=Z, across=X); ถนน dir "x" วิ่งตามแกน X ของฉาก (along=X,
  // across=Z)
  const roadAlongsZ = !gateRoad || gateRoad.dir === "y";
  const anchorAlong = gateRoad ? (roadAlongsZ ? gateRoad.z : gateRoad.x) : hallD / 2 + 9 + 8 + 16;
  const anchorAcross = gateRoad ? (roadAlongsZ ? gateRoad.x : gateRoad.z) : hallW * 0.1;
  // ทิศ "ออกนอกไซต์" ของแกน along — ยิ่งไกลจากศูนย์กลางโรงงาน (0) คือยิ่งออกนอก
  const outSign = anchorAlong >= 0 ? 1 : -1;

  /** (along, across) ท้องถิ่น -> (x, z) จริงในฉาก ตามทิศทางถนนที่หามาได้ */
  const at = (along: number, across: number): [number, number] =>
    roadAlongsZ
      ? [anchorAcross + across, anchorAlong + along * outSign]
      : [anchorAlong + along * outSign, anchorAcross + across];
  /** ขนาด (alongSize, acrossSize) ท้องถิ่น -> (w, d) ของ box() ตามแกนจริง */
  const size = (alongSize: number, acrossSize: number): [number, number] =>
    roadAlongsZ ? [acrossSize, alongSize] : [alongSize, acrossSize];

  // ตำแหน่งจริงของ GUARD HOUSE (RAW_BUILDINGS) เทียบกับจุดยึดถนน — คำนวณจาก
  // ข้อมูลสำรวจจริงครั้งเดียว (ดูรายละเอียดการคำนวณใน PR) แล้ว hardcode เป็น
  // ค่าคงที่ตรงนี้ได้อย่างปลอดภัย เพราะ GUARD HOUSE กับถนนนี้ anchor ด้วย
  // เครื่องหมาย sign เดียวกันทั้งสองแกน (`anchorAxis` เป็นเชิงเส้นใน
  // targetHalfExtent ด้วยสัมประสิทธิ์ sign เท่ากัน) ผลต่าง along/across ของทั้ง
  // สองจุดจึง **คงที่ไม่ขึ้นกับขนาด hall ที่สเกลจริง** — ไม่ใช่ตัวเลขเดา
  const GUARDHOUSE_ALONG = -5.35;
  // ป้อมยามจริงกินแถบ across ประมาณ [-7.7,-2.3] รอบจุดนี้ (ครึ่งความลึกจริง
  // 2.7 ม.) — ถ้าวางเสาประตูกึ่งกลางถนน (across=0, เสาที่ ±7) เสาฝั่งลบจะจิ้ม
  // เข้าไปในตัวป้อมยามจริงพอดี (ไม่ใช่เรื่องที่จอดรถ — parking กับ MAIN GATE
  // road ไม่คาบเกี่ยวกันเลยหลังแก้ `scaleParkingRect`) จึงเลื่อนกึ่งกลางประตู
  // ทั้งชุดไปฝั่งตรงข้ามป้อมยามเล็กน้อยแทน ให้เสา/ซี่ประตูไม่ทับตัวอาคาร
  const GUARDHOUSE_ACROSS = -5.0;
  const gateAlong = GUARDHOUSE_ALONG + 2; // ชิดป้อมยามจริง ไม่ต้องบีบแคบแล้ว
  const gateAcross = 6; // พ้นขอบป้อมยาม (ถึง -2.3) ด้วยระยะเผื่อ >1 ม.

  // --- ประตูรั้วเลื่อน: เสาสองต้น + ซี่ประตู — แนบชิดป้อมยามจริง -----------
  for (const side of [-1, 1]) {
    const [x, z] = at(gateAlong, gateAcross + side * 7);
    const [w, d] = size(1.1, 1.1);
    b.wall.push(box(x, 0.14, z, w, 4.2, d));
  }
  {
    const [x, z] = at(gateAlong, gateAcross);
    const [w, d] = size(0.16, 12.6);
    b.metal.push(box(x, 0.14 + 2.0, z, w, 0.16, d));
    b.metal.push(box(x, 0.14 + 0.4, z, w, 0.16, d));
  }
  for (let i = 0; i < 15; i += 1) {
    const across = gateAcross - 6 + (12 * i) / 14;
    const [x, z] = at(gateAlong, across);
    const [w, d] = size(0.09, 0.09);
    b.metal.push(box(x, 0.14 + 0.4, z, w, 1.7, d));
  }

  // --- ตาชั่งรถบรรทุก (weighbridge) + บูธคนคุมตาชั่ง ----------------------
  // เลนชั่งเดียว (across=0) อยู่ไกลออกไปทาง "นอกไซต์" กว่าประตู (along ใหญ่กว่า
  // gateAlong มาก) — รถต้องผ่านตาชั่งก่อนถึงไม้กั้น/ประตู เรียงจากนอกสุดเข้าไป:
  // ป้าย -> ไม้กั้น (นอก) -> ตาชั่ง -> ไม้กั้น (ใน) -> ประตู -> ป้อมยาม
  // ระยะห่างจากประตูเลือกให้พอดีอ่านเป็นลำดับ ไม่ใช่เพื่อเลี่ยงที่จอดรถ (parking
  // กับถนนเส้นนี้ไม่คาบเกี่ยวกันอีกแล้วหลังแก้ `scaleParkingRect` ให้ไม่ยืด `d`)
  const wbW = 3.2;
  const wbLen = 16;
  const wbAlong = 20;
  const wbHalfLen = wbLen / 2;
  {
    const [x, z] = at(wbAlong, 0);
    const [w, d] = size(wbLen, wbW);
    b.metal.push(box(x, 0.14, z, w, 0.08, d));
  }
  for (const side of [-1, 1]) {
    const [x, z] = at(wbAlong, side * (wbW / 2 + 0.14));
    const [w, d] = size(wbLen, 0.28);
    b.curb.push(box(x, 0.14, z, w, 0.16, d));
  }
  // บูธคนคุมตาชั่ง — อาคารเล็กข้างแท่น มีกระจกด้านหันเข้าหาแท่นชั่ง
  const boothAcross = wbW / 2 + 0.28 + 1.9;
  {
    const [x, z] = at(wbAlong, boothAcross);
    const [w, d] = size(3.2, 3.2);
    b.wall.push(box(x, 0.14, z, w, 2.6, d));
    const [gx, gz] = at(wbAlong, boothAcross - 1.44);
    const [gw, gd] = size(2.6, 0.08);
    b.glass.push(box(gx, 0.14 + 1.5, gz, gw, 1.0, gd));
    const [ex, ez] = at(wbAlong, boothAcross);
    const [ew, ed] = size(3.8, 3.8);
    b.eave.push(box(ex, 0.14 + 2.6, ez, ew, 0.3, ed));
  }

  // --- ไม้กั้นเข้า/ออก (boom barrier) 2 จุด (ก่อน/หลังตาชั่ง) x เลนเข้า+ออก --
  // มีที่ว่างพอ (สิบกว่าเมตรรอบข้าง ไม่ติดอะไร) จึงกลับไปทำสองเลนข้างกันตามที่
  // โจทย์แรกต้องการ แทนที่จะบีบเหลือเลนเดียวแบบตอนช่องว่างยังแคบ
  //
  // ความกว้างผิวจราจรจริงมาจาก gateRoad.w (ไม่ hardcode 4.5 ม. ไว้เอง — ถ้า
  // ข้อมูลถนนเปลี่ยนความกว้าง ค่านี้ต้องขยับตาม) — เดิม laneOffset=4.2 +
  // ครึ่งความยาวแขนไม้กั้น 1.6 ม. รวมยื่นถึง 5.8 ม. เกินขอบถนนจริง (ครึ่งความ
  // กว้าง 4.5 ม.) ไป 1.3 ม. ทำให้ปลายแขนลอยเหนือพื้นดินนอกถนน วางเลนให้แคบลง
  // แทน (roadHalfW/2) ปลายแขนจึงยังอยู่ในผิวจราจรด้วยระยะเผื่อ
  const roadHalfW = (gateRoad?.w ?? 9) / 2;
  const barrierInnerAlong = wbAlong - wbHalfLen - 3; // ฝั่งประตู (ใกล้โรงงาน)
  const barrierOuterAlong = wbAlong + wbHalfLen + 3; // ฝั่งป้าย (ไกลโรงงาน)
  const laneOffset = roadHalfW / 2;
  for (const barrierAlong of [barrierInnerAlong, barrierOuterAlong]) {
    for (const side of [-1, 1]) {
      const laneAcross = side * laneOffset;
      const postAcross = laneAcross - side * 1.6; // เสาอยู่ฝั่งเกาะกลาง แขนยื่นคร่อมเลน
      const [px, pz] = at(barrierAlong, postAcross);
      b.metal.push(pillar(px, 0.14, pz, 0.11, 1.1, 10));
      const [ax, az] = at(barrierAlong, laneAcross);
      const [aw, ad] = size(0.08, 3.2);
      b.metal.push(box(ax, 0.14 + 0.95, az, aw, 0.08, ad));
    }
  }

  // --- ป้ายทางเข้าไซต์: สองเสา + แผ่นป้าย — นอกสุดของลำดับทางเข้า ----------
  // (DXF: SIGN BOARD) ไกลออกไปจากไม้กั้นฝั่งนอกอีกชั้น ให้เห็นป้ายก่อนถึงจุด
  // ควบคุมใด ๆ
  const signAlong = barrierOuterAlong + 7;
  const signW = 3.6;
  const signPostH = 2.4;
  for (const side of [-1, 1]) {
    const [x, z] = at(signAlong, ((side * signW) / 2) - side * 0.3);
    b.metal.push(pillar(x, 0.14, z, 0.09, signPostH, 8));
  }
  {
    const [x, z] = at(signAlong, 0);
    const [w1, d1] = size(0.14, signW);
    b.signPlate.push(box(x, 0.14 + signPostH - 1.0, z, w1, 1.0, d1));
    const [w2, d2] = size(0.05, signW);
    b.signEdge.push(box(x, 0.14 + signPostH - 1.14, z, w2, 0.16, d2));
  }

  // --- บ่อบำบัด: ผนังบ่อสี่ด้าน + ราวกันตก + เครื่องกวนกลางบ่อ -----------
  // ไม่ใช่ส่วนของ "ทางเข้า" ที่ต้องเกาะกับ MAIN GATE road จึงยังใช้ค่าประมาณ
  // เดิม (สัดส่วน hallW/hallD) เหมือนก่อนหน้านี้ ไม่เกี่ยวกับจุดยึดด้านบน
  const legacyFrontZ = hallD / 2 + 9 + 8 + 16;
  const tx = hallW * 0.34;
  const tz = legacyFrontZ + 2;
  for (let p = 0; p < 2; p += 1) {
    const px = tx + p * 13;
    const r = 5.2;
    // ผนังบ่อทรงกลม 16 แผ่นเรียงเป็นวง — ถูกกว่าท่อกลวงและได้เงาเป็นซี่
    for (let s = 0; s < 16; s += 1) {
      const a = (Math.PI * 2 * s) / 16;
      const seg = new THREE.BoxGeometry(2.1, 1.9, 0.4);
      seg.rotateY(-a);
      seg.translate(px + Math.cos(a) * r, 0.14 + 0.95, tz + Math.sin(a) * r);
      b.wall.push(seg);
    }
    b.metal.push(box(px, 0.14 + 2.0, tz, r * 2.1, 0.14, 0.35));
    b.metal.push(pillar(px, 0.14 + 2.0, tz, 0.45, 1.4, 8));
  }

  // --- กล่องกันชน (corridor) คืนออกไปให้ `buildFireHydrants`/`buildFireCabinets`
  // เว้น ไม่ให้หัวจ่ายน้ำ/ตู้ดับเพลิงไปโผล่ในกลุ่มประตู/ตาชั่ง/บ่อบำบัดนี้ —
  // คำนวณจากพิกัดจริงที่วางของแต่ละกลุ่มไว้ข้างบน ไม่ใช่เลขกะเอา
  const gateCorners: Array<[number, number]> = [
    at(gateAlong - 3, -15),
    at(gateAlong - 3, 15),
    at(signAlong + 5, -15),
    at(signAlong + 5, 15),
  ];
  const gateXs = gateCorners.map((c) => c[0]);
  const gateZs = gateCorners.map((c) => c[1]);
  const gateCorridor: Corridor = {
    x0: Math.min(...gateXs),
    x1: Math.max(...gateXs),
    z0: Math.min(...gateZs),
    z1: Math.max(...gateZs),
  };
  const tankMargin = 3;
  const tankCorridor: Corridor = {
    x0: tx - 5.2 - tankMargin,
    x1: tx + 13 + 5.2 + tankMargin,
    z0: tz - 5.2 - tankMargin,
    z1: tz + 5.2 + tankMargin,
  };
  return [gateCorridor, tankCorridor];
}
