import type * as THREE from "three";
import type { Archetype } from "../../../../lib/plantArchetypes";
import { PartBuilder, type MaterialKey } from "./geometryKit";

/**
 * ===========================================================================
 * MACHINE MODELS — เครื่องจักร 10 ชนิด ปั้นจากเรขาคณิต Three.js ทั้งหมด
 * ===========================================================================
 *
 * ไม่มีภาพ ไม่มีเท็กซ์เจอร์ ไม่มีไฟล์โมเดลจากภายนอก ทุกตัวคือกล่องมุมโค้ง
 * ทรงกระบอก ทอรัส กรวย ที่ประกอบกันตาม `geometryKit.ts`
 *
 * ขนาดตายตัวจาก `lib/plantLayout.ts`
 * -----------------------------------
 * `FOOTPRINT`/`HEIGHT` ใน plantLayout.ts เป็นขนาดจริงที่อ่านมาจาก
 * `Model_3D/dist/plant-machines.js` และตัวจัดผังใช้ตัวเลขชุดนั้นแพ็คเครื่อง
 * ลงโซน โมเดลในไฟล์นี้จึงต้องพอดีกับกล่องขนาดเดียวกันเป๊ะ ไม่ใช่ขนาดที่คิด
 * เอาเอง — ไม่งั้นเครื่องจะล้นทางเดินหรือทับกันในผังที่แพ็คมาแล้ว
 * ทุก builder รับ `w`/`d`/`h` (กว้าง/ลึก/สูง) เข้ามาแล้วปั้นให้อยู่ในกรอบนั้น
 *
 * ระบบพิกัด: y=0 คือพื้น, +z คือ "ด้านหน้า" ของเครื่อง (ด้านที่ตู้คอนโทรลกับ
 * จอ HMI หันออก), จุดกำเนิดอยู่กลางฐานเครื่อง
 *
 * ต้องอยู่ในกรอบเสมอ
 * -----------------
 * ตัวจัดผังแพ็คเครื่องชิดกันโดยเชื่อว่าเครื่องกินที่แค่ `w` x `d` ชิ้นส่วนที่
 * ยื่นเลยกรอบ (ท่อ แขน หัวจับ ครีบ ปล่อง) จะไปทับทางเดินหรือทับเครื่องข้าง ๆ
 * จริง ๆ บนผัง และความสูงที่เกิน `h` จะทะลุคานอาคาร กฎคือ **ทุกจุดของทุก
 * ชิ้นส่วนต้องอยู่ใน x∈[-w/2, w/2], z∈[-d/2, d/2], y∈[0, h]** โดยยกเว้นแถบ
 * เตือนรอบฐาน (`hazardSkirt`) ที่ตั้งใจให้เสมอขอบกรอบพอดี
 *
 * โคมไฟสัญญาณติดที่ระดับฐานเครื่องทุกตัว (ไม่ใช่บนหลังเครื่อง) เพราะเสาโคม
 * สูงราว 0.6 ม. รวมหัวโคม ถ้าไปตั้งบนตัวถังที่สูงเกือบเท่า `h` แล้วจะทะลุ
 * กรอบทันที — และที่ระดับฐานยังเป็นตำแหน่งที่คนเดินผ่านมองเห็นง่ายกว่าด้วย
 *
 * ทุกตัวต้องมีร่วมกัน 3 อย่าง เพื่อให้อ่านเป็น "เครื่องจักรในโรงงาน" ชุดเดียวกัน
 *   1. ฐานแท่น (`plinth`) — ให้ดูมีน้ำหนักติดพื้น ไม่ลอย
 *   2. ตู้คอนโทรล + จอ HMI (`controlPanel`) — จุดที่คนไปยืนใช้งาน
 *   3. โคมไฟสัญญาณ 3 ชั้น (`stackLight`) — จุดที่สถานะของเครื่องปรากฏบนตัวเครื่อง
 */

export interface MachineModel {
  /** เรขาคณิตที่ merge แล้ว หนึ่งก้อนต่อวัสดุ */
  buckets: Partial<Record<MaterialKey, THREE.BufferGeometry>>;
}

/**
 * เตาอบชุบความร้อน — ตัวถังยาว ปล่องระบาย ประตูหน้าเตา ท่อแก๊สข้างเตา
 */
function buildFurnace(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  const bodyH = h * 0.62;
  b.plinth(w, d, 0.3);
  // ตัวเตาเป็นก้อนหนา มุมโค้งกว้าง ให้ดูเป็นผนังฉนวนหนา ไม่ใช่แผ่นเหล็กบาง
  b.roundedBox("body", [0, 0.3 + bodyH / 2, 0], [w * 0.94, bodyH, d * 0.86], 0.35, 2);
  // ประตูหน้าเตา + วงแหวนขอบประตู
  b.roundedBox("bodyDark", [0, 0.3 + bodyH * 0.5, d * 0.44], [w * 0.5, bodyH * 0.62, 0.22], 0.1);
  b.torus("steel", [0, 0.3 + bodyH * 0.5, d * 0.45], Math.min(w, bodyH) * 0.24, 0.06, "z", 24);
  // ปล่องระบายสองปล่อง + หมวกกันฝน
  b.repeat(2, -w * 0.26, w * 0.26, (x) => {
    // ปล่อง + หมวกกันฝนต้องรวมกันแล้วสูงไม่เกิน h พอดี ไม่ใช่ปล่องสูงถึง h
    // แล้วเอาหมวกไปวางทับข้างบนอีก (ซึ่งทะลุคานอาคาร)
    const capH = 0.28;
    const stackH = h - (0.3 + bodyH) - capH;
    b.cylinder("conduit", [x, 0.3 + bodyH + stackH / 2, -d * 0.2], 0.24, 0.3, stackH, "y", 14);
    b.cone("bodyDark", [x, h - capH / 2, -d * 0.2], 0.36, capH);
  });
  // ครีบระบายความร้อนข้างเตา
  b.repeat(6, -bodyH * 0.34, bodyH * 0.34, (y) => {
    b.box("frame", [-w * 0.475, 0.3 + bodyH / 2 + y, 0], [0.06, 0.07, d * 0.8]);
    b.box("frame", [w * 0.475, 0.3 + bodyH / 2 + y, 0], [0.06, 0.07, d * 0.8]);
  });
  // ท่อแก๊สร้อยจากพื้นขึ้นข้างเตา
  // ท่อแนบข้างเตา ไม่ใช่โก่งออกนอกกรอบ — CatmullRom โก่งเลยจุดควบคุมได้อีก
  // เล็กน้อย จึงเผื่อระยะจากขอบไว้ด้วย (ไม่ใช้ w*0.5 ซึ่งคือขอบพอดี)
  b.pipeThrough(
    "conduit",
    [
      [-w * 0.42, 0.2, d * 0.3],
      [-w * 0.46, bodyH * 0.5, d * 0.1],
      [-w * 0.42, bodyH * 0.9, -d * 0.2],
    ],
    0.08
  );
  b.controlPanel([w * 0.28, 0.3, d * 0.42], 1.0, 1.4);
  b.stackLight([-w * 0.38, 0.3, d * 0.36], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เครื่องผสม — ถังทรงกระบอกใหญ่ ฝาโดม มอเตอร์กวนบนฝา กรวยเติมวัสดุ
 */
function buildMixer(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  const r = Math.min(w, d) * 0.38;
  const drumH = h * 0.48;
  const drumY = 0.28 + drumH / 2;
  b.plinth(w, d, 0.28);
  // ขาถังสี่ขา ให้เห็นว่าถังยกลอยจากพื้น
  b.repeat(2, -r * 0.8, r * 0.8, (x) => {
    b.repeat(2, -r * 0.8, r * 0.8, (z) => {
      b.cylinder("frame", [x, 0.28 + (drumY - 0.28) / 2, z], 0.1, 0.1, drumY - 0.28, "y", 8);
    });
  });
  b.cylinder("body", [0, drumY, 0], r, r, drumH, "y", 28);
  // วงแหวนรัดถังสองวง — ทำให้ทรงกระบอกไม่ดูเป็นท่อเปล่า
  b.torus("steel", [0, drumY - drumH * 0.28, 0], r + 0.02, 0.07, "y", 28);
  b.torus("steel", [0, drumY + drumH * 0.28, 0], r + 0.02, 0.07, "y", 28);
  // ฝาโดมบนถัง + มอเตอร์กวน
  b.sphere("bodyDark", [0, drumY + drumH / 2, 0], r, 24, Math.PI * 2, Math.PI / 2);
  const motorY = drumY + drumH / 2 + r * 0.5;
  b.roundedBox("bodyDark", [0, motorY + 0.3, 0], [r * 0.9, 0.6, r * 0.9], 0.14);
  b.cylinder("steel", [0, motorY + 0.72, 0], 0.16, 0.16, 0.26, "y", 12);
  // กรวยเติมวัสดุด้านหลัง
  b.cone("frame", [0, drumY + drumH * 0.2, -r - 0.35], 0.42, 0.8);
  b.cylinder("conduit", [0, drumY - drumH * 0.1, -r - 0.35], 0.12, 0.12, 0.9, "y", 10);
  // ท่อระบายลงด้านหน้า
  b.pipeThrough(
    "conduit",
    [
      [0, drumY - drumH / 2, 0],
      [0, 0.7, r * 0.7],
      [0, 0.45, d * 0.42],
    ],
    0.11
  );
  b.controlPanel([-w * 0.3, 0.28, d * 0.4], 0.9, 1.25);
  b.stackLight([w * 0.34, 0.28, d * 0.3], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เครื่องเคลือบ — ตัวยาวเตี้ย ลูกกลิ้งเรียงตลอดความยาว ถังน้ำยาด้านบน
 */
function buildCoater(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  const bedY = 0.26 + h * 0.34;
  b.plinth(w, d, 0.26);
  // โครงเครื่องเป็นราง ไม่ใช่กล่องทึบ — ให้เห็นลูกกลิ้งข้างใน
  b.roundedBox("frame", [0, bedY, 0], [w * 0.96, h * 0.2, d * 0.9], 0.1);
  // ลูกกลิ้งเรียงตลอดความยาว วางนอนตามแกน x
  b.repeat(9, -w * 0.42, w * 0.42, (x) => {
    b.cylinder("steel", [x, bedY + h * 0.16, 0], 0.13, 0.13, d * 0.84, "z", 14);
  });
  // ผนังข้างสองด้าน
  b.roundedBox("body", [0, bedY + h * 0.05, d * 0.46], [w * 0.96, h * 0.42, 0.14], 0.06);
  b.roundedBox("body", [0, bedY + h * 0.05, -d * 0.46], [w * 0.96, h * 0.42, 0.14], 0.06);
  // ถังน้ำยาเคลือบวางบนคานเหนือเครื่อง
  // คานแขวนถังอยู่ที่ h*0.62 ไม่ใช่ h*0.78 — ถังสูง 0.74 ม. บวกฝาโดมอีก 0.3
  // ม. ต้องรวมแล้วยังไม่เกิน h (เดิมโดมไปจบที่ 4.68 ม. บนกรอบสูง 4.6 ม.)
  const railY = h * 0.62;
  b.box("frame", [0, railY, 0], [w * 0.5, 0.1, d * 0.6]);
  b.repeat(2, -w * 0.22, w * 0.22, (x) => {
    b.cylinder("body", [x, railY + 0.42, 0], 0.3, 0.3, 0.74, "y", 20);
    b.sphere("bodyDark", [x, railY + 0.79, 0], 0.3, 16, Math.PI * 2, Math.PI / 2);
    // หัวจ่ายน้ำยาลงลูกกลิ้ง
    b.cylinder("conduit", [x, bedY + h * 0.32, 0], 0.05, 0.05, h * 0.24, "y", 8);
  });
  // เสาค้ำคานถัง
  b.repeat(2, -w * 0.42, w * 0.42, (x) => {
    b.cylinder("frame", [x, railY / 2 + 0.2, -d * 0.3], 0.07, 0.07, railY, "y", 8);
  });
  b.controlPanel([w * 0.4, 0.26, d * 0.42], 0.85, 1.15);
  b.stackLight([-w * 0.44, 0.26, d * 0.36], 0.95);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เตาอบต่อเนื่อง — อุโมงค์ยาว สายพานทะลุหัวท้าย ปล่องระบายบนหลัง
 */
function buildOven(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  const tunnelH = h * 0.5;
  const tunnelY = 0.3 + tunnelH / 2;
  b.plinth(w, d, 0.3);
  b.roundedBox("body", [0, tunnelY, 0], [w * 0.92, tunnelH, d * 0.7], 0.3, 2);
  // ช่องเข้า-ออกหัวท้าย + สายพานที่ทะลุออกมา
  // ปากเข้า-ออกและลูกกลิ้งหัวท้ายต้องอยู่ในกรอบ — เดิมลูกกลิ้งอยู่ที่
  // w*0.54 ซึ่งเลยขอบ w/2 ไปแล้วโดยตัวมันเอง
  b.repeat(2, -1, 1, (side) => {
    b.roundedBox("bodyDark", [(w * 0.44) * side, tunnelY, 0], [0.16, tunnelH * 0.5, d * 0.5], 0.06);
    b.cylinder("steel", [(w * 0.47) * side, tunnelY - tunnelH * 0.1, 0], 0.14, 0.14, d * 0.46, "z", 12);
    b.box("rubber", [(w * 0.46) * side, tunnelY - tunnelH * 0.1, 0], [0.14, 0.03, d * 0.44]);
  });
  // ฝาครอบบนหลังเตา + ปล่อง 3 ปล่อง
  b.roundedBox("bodyDark", [0, tunnelY + tunnelH / 2, 0], [w * 0.8, 0.24, d * 0.6], 0.1);
  b.repeat(3, -w * 0.3, w * 0.3, (x) => {
    const stackH = h - (tunnelY + tunnelH / 2) - 0.05;
    b.cylinder("conduit", [x, tunnelY + tunnelH / 2 + stackH / 2, 0], 0.19, 0.22, stackH, "y", 12);
    b.torus("steel", [x, h - 0.12, 0], 0.24, 0.05, "y", 16);
  });
  // ท่อลมร้อนวนข้างเตา
  b.pipeThrough(
    "conduit",
    [
      [-w * 0.46, tunnelY + tunnelH * 0.3, -d * 0.36],
      [0, tunnelY + tunnelH * 0.62, -d * 0.44],
      [w * 0.46, tunnelY + tunnelH * 0.3, -d * 0.36],
    ],
    0.1
  );
  // ครีบระบายบนผนังข้าง
  b.repeat(7, -w * 0.38, w * 0.38, (x) => {
    b.box("frame", [x, tunnelY, d * 0.36], [0.07, tunnelH * 0.7, 0.06]);
  });
  b.controlPanel([-w * 0.3, 0.3, d * 0.38], 0.95, 1.3);
  b.stackLight([w * 0.38, 0.3, d * 0.32], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เครื่องอัด/ปั๊ม — โครงตัว C สูง หัวอัดเลื่อนบนราง แท่นรองด้านล่าง
 */
function buildPress(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  b.plinth(w, d, 0.34);
  // เสาโครงสองต้น + คานบน = โครงตัว C ที่เป็นเอกลักษณ์ของเครื่องอัด
  b.repeat(2, -w * 0.33, w * 0.33, (x) => {
    b.roundedBox("frame", [x, 0.34 + (h - 0.34) / 2, -d * 0.2], [w * 0.2, h - 0.34, d * 0.34], 0.12);
  });
  b.roundedBox("bodyDark", [0, h - 0.42, -d * 0.2], [w * 0.9, 0.84, d * 0.4], 0.16);
  // กระบอกไฮดรอลิกกลางคาน + แกนที่ยื่นลงมา
  b.cylinder("body", [0, h - 1.15, -d * 0.2], 0.34, 0.34, 0.9, "y", 20);
  b.cylinder("steel", [0, h * 0.6, -d * 0.2], 0.14, 0.14, h * 0.36, "y", 14);
  // หัวอัด
  b.roundedBox("steel", [0, h * 0.44, -d * 0.2], [w * 0.5, 0.3, d * 0.3], 0.06);
  // แท่นรองงาน + ราวกันหน้าเครื่อง
  b.roundedBox("bodyDark", [0, 0.34 + 0.3, -d * 0.2], [w * 0.62, 0.6, d * 0.36], 0.08);
  b.repeat(2, -w * 0.36, w * 0.36, (x) => {
    b.cylinder("hazard", [x, 0.34 + 0.55, d * 0.34], 0.05, 0.05, 1.1, "y", 8);
  });
  b.box("hazard", [0, 0.34 + 1.05, d * 0.34], [w * 0.76, 0.06, 0.06]);
  // ท่อไฮดรอลิกจากปั๊มขึ้นกระบอก
  b.roundedBox("body", [w * 0.3, 0.34 + 0.45, d * 0.1], [w * 0.3, 0.9, d * 0.28], 0.1);
  b.pipeThrough(
    "conduit",
    [
      [w * 0.3, 0.34 + 0.9, d * 0.1],
      [w * 0.2, h * 0.72, -d * 0.05],
      [0.2, h - 1.4, -d * 0.18],
    ],
    0.07
  );
  b.controlPanel([-w * 0.26, 0.34, d * 0.3], 0.85, 1.2);
  b.stackLight([w * 0.4, 0.34, d * 0.28], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * หุ่นยนต์แขนกล — ฐานหมุน แขนสองท่อน ข้อมือ กับกรงนิรภัยรอบตัว
 *
 * ตัวนี้เตี้ยสุดในชุด (2.6 ม.) กรงจึงเป็นตัวกำหนดขนาดกล่อง ไม่ใช่ตัวแขน
 */
function buildRobot(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  b.plinth(w * 0.5, d * 0.5, 0.22);
  // ฐานหมุน
  b.cylinder("bodyDark", [0, 0.22 + 0.24, 0], 0.52, 0.6, 0.48, "y", 20);
  b.cylinder("body", [0, 0.22 + 0.62, 0], 0.44, 0.48, 0.32, "y", 20);
  // ท่อนแขนที่ 1 เอียงขึ้น
  b.roundedBox("body", [0.1, 0.22 + 1.3, 0], [0.44, 1.3, 0.5], 0.16);
  b.torus("steel", [0.1, 0.22 + 0.86, 0], 0.28, 0.09, "z", 18);
  // ข้อศอก + ท่อนแขนที่ 2 ยื่นออกด้านหน้า
  //
  // ระยะเอื้อมทั้งหมดต้องจบก่อนซี่กรง ไม่ใช่แค่ก่อนขอบกรอบ — หัวจับที่ทะลุ
  // กรงออกไปคือสิ่งที่ไม่มีอยู่จริงในเซลล์หุ่นยนต์ (เดิมนิ้วจับอยู่ที่
  // d*0.62 = 4.09 ม. จากจุดกลาง บนกรอบที่ลึกครึ่งละ 3.3 ม.)
  b.sphere("steel", [0.1, 0.22 + 1.92, 0], 0.28, 16);
  b.roundedBox("body", [0.1, 0.22 + 1.98, d * 0.2], [0.36, 0.36, d * 0.44], 0.12);
  // ข้อมือ + หัวจับ
  b.cylinder("steel", [0.1, 0.22 + 1.98, d * 0.4], 0.15, 0.15, 0.28, "z", 14);
  b.roundedBox("bodyDark", [0.1, 0.22 + 1.98, d * 0.44], [0.3, 0.22, 0.24], 0.05);
  b.repeat(2, -0.1, 0.1, (x) => {
    b.box("steel", [0.1 + x, 0.22 + 1.9, d * 0.47], [0.05, 0.16, 0.2]);
  });
  // สายไฟร้อยจากฐานขึ้นแขน
  b.pipeThrough(
    "conduit",
    [
      [-0.35, 0.4, 0],
      [-0.4, 1.3, -0.1],
      [-0.1, 0.22 + 1.9, 0.1],
    ],
    0.05
  );
  // กรงนิรภัย — เสามุมกับตะแกรงโปร่ง เห็นแขนข้างในได้
  const cw = w * 0.94;
  const cd = d * 0.94;
  // กรงเป็นตัวที่สูงที่สุดของ archetype นี้ จึงกินความสูงของกรอบเกือบเต็ม
  const cage = h * 0.9;
  b.repeat(2, -cw / 2, cw / 2, (x) => {
    b.repeat(2, -cd / 2, cd / 2, (z) => {
      b.cylinder("frame", [x, cage / 2, z], 0.06, 0.06, cage, "y", 8);
    });
  });
  // ซี่กรงแนวตั้ง เว้นด้านหน้า (+z) ไว้เป็นช่องเข้า
  b.repeat(7, -cw * 0.44, cw * 0.44, (x) => {
    b.cylinder("frame", [x, cage / 2, -cd / 2], 0.022, 0.022, cage, "y", 6);
  });
  b.repeat(2, -1, 1, (side) => {
    b.repeat(6, -cd * 0.42, cd * 0.42, (z) => {
      b.cylinder("frame", [(cw / 2) * side, cage / 2, z], 0.022, 0.022, cage, "y", 6);
    });
  });
  // คานบนกรอบกรง
  b.box("frame", [0, cage, -cd / 2], [cw, 0.05, 0.05]);
  b.box("frame", [0, cage, cd / 2], [cw, 0.05, 0.05]);
  b.box("frame", [-cw / 2, cage, 0], [0.05, 0.05, cd]);
  b.box("frame", [cw / 2, cage, 0], [0.05, 0.05, cd]);
  b.controlPanel([cw * 0.32, 0, cd * 0.46], 0.8, 1.15);
  b.stackLight([-cw * 0.42, 0, -cd * 0.42], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เซลล์ผลิต — ตู้ปิดทึบมีช่องกระจกมองงานข้างใน ตู้ไฟด้านข้าง
 */
function buildCell(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  const bodyH = h * 0.76;
  b.plinth(w, d, 0.24);
  b.roundedBox("body", [0, 0.24 + bodyH / 2, 0], [w * 0.9, bodyH, d * 0.86], 0.28, 2);
  // หน้าต่างกระจกบานใหญ่ด้านหน้า + กรอบ
  b.box("glass", [0, 0.24 + bodyH * 0.62, d * 0.44], [w * 0.56, bodyH * 0.4, 0.03]);
  b.box("frame", [0, 0.24 + bodyH * 0.82, d * 0.44], [w * 0.6, 0.07, 0.06]);
  b.box("frame", [0, 0.24 + bodyH * 0.42, d * 0.44], [w * 0.6, 0.07, 0.06]);
  b.repeat(2, -w * 0.3, w * 0.3, (x) => {
    b.box("frame", [x, 0.24 + bodyH * 0.62, d * 0.44], [0.07, bodyH * 0.42, 0.06]);
  });
  // ประตูบำรุงรักษาด้านข้าง + มือจับ
  b.roundedBox("bodyDark", [-w * 0.46, 0.24 + bodyH * 0.45, 0], [0.1, bodyH * 0.7, d * 0.5], 0.05);
  b.cylinder("steel", [-w * 0.5, 0.24 + bodyH * 0.45, d * 0.16], 0.035, 0.035, 0.3, "y", 8);
  // ตู้ไฟด้านข้างขวา — ตัวตู้ต้องจบก่อนขอบกรอบ และครีบระบายก็ต้องอยู่บน
  // ผิวตู้ ไม่ใช่ลอยพ้นออกไป (เดิมครีบอยู่ที่ w*0.67 = 4.15 ม. บนกรอบที่กว้าง
  // ครึ่งละ 3.10 ม.)
  const cabX = w * 0.5 - 0.19;
  b.roundedBox("bodyDark", [cabX, 0.24 + bodyH * 0.4, -d * 0.1], [0.34, bodyH * 0.72, d * 0.4], 0.08);
  b.repeat(4, -bodyH * 0.24, bodyH * 0.24, (y) => {
    b.box("frame", [cabX + 0.17, 0.24 + bodyH * 0.4 + y, -d * 0.1], [0.02, 0.05, d * 0.34]);
  });
  // ฝาบน + พัดลมระบายสองตัว
  b.roundedBox("bodyDark", [0, 0.24 + bodyH, 0], [w * 0.84, 0.2, d * 0.8], 0.08);
  b.repeat(2, -w * 0.22, w * 0.22, (x) => {
    b.cylinder("frame", [x, 0.24 + bodyH + 0.22, -d * 0.16], 0.28, 0.28, 0.16, "y", 18);
    b.torus("steel", [x, 0.24 + bodyH + 0.3, -d * 0.16], 0.2, 0.03, "y", 16);
  });
  b.controlPanel([w * 0.22, 0.24, d * 0.42], 0.9, 1.25);
  b.stackLight([-w * 0.3, 0.24, d * 0.3], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เครื่องบรรจุ — หัวจ่ายเรียงบนคาน ถังจ่ายด้านบน รางลำเลียงผ่านใต้หัวจ่าย
 */
function buildFiller(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  b.plinth(w, d, 0.24);
  // โครงพอร์ทัลสองเสา + คานบน
  b.repeat(2, -w * 0.4, w * 0.4, (x) => {
    b.roundedBox("frame", [x, 0.24 + (h * 0.72) / 2, 0], [0.24, h * 0.72, d * 0.5], 0.08);
  });
  b.roundedBox("bodyDark", [0, 0.24 + h * 0.72, 0], [w * 0.92, 0.3, d * 0.46], 0.1);
  // ถังจ่ายบนคาน
  // ถังจ่ายวางบนคาน: ตัวถัง 0.9 ม. + ฝาโดม 0.46 ม. ต้องจบใต้ h ไม่ใช่เกิน
  const tankBase = 0.24 + h * 0.66;
  b.cylinder("body", [0, tankBase + 0.45, -d * 0.05], 0.46, 0.46, 0.9, "y", 22);
  b.sphere("bodyDark", [0, tankBase + 0.9, -d * 0.05], 0.46, 18, Math.PI * 2, Math.PI / 2);
  b.torus("steel", [0, tankBase + 0.45, -d * 0.05], 0.48, 0.05, "y", 22);
  // หัวจ่าย 5 หัวห้อยจากคาน
  b.repeat(5, -w * 0.28, w * 0.28, (x) => {
    b.cylinder("steel", [x, 0.24 + h * 0.56, 0], 0.07, 0.07, h * 0.28, "y", 10);
    b.cone("bodyDark", [x, 0.24 + h * 0.4, 0], 0.11, 0.2);
    b.pipeThrough(
      "conduit",
      [
        [0, tankBase + 0.2, -d * 0.05],
        [x * 0.6, 0.24 + h * 0.7, 0],
        [x, 0.24 + h * 0.68, 0],
      ],
      0.04
    );
  });
  // รางลำเลียงผ่านใต้หัวจ่าย
  b.roundedBox("frame", [0, 0.24 + h * 0.24, 0], [w * 0.96, 0.16, d * 0.34], 0.05);
  b.repeat(8, -w * 0.44, w * 0.44, (x) => {
    b.cylinder("steel", [x, 0.24 + h * 0.32, 0], 0.06, 0.06, d * 0.32, "z", 10);
  });
  b.box("rubber", [0, 0.24 + h * 0.35, 0], [w * 0.94, 0.02, d * 0.3]);
  b.controlPanel([w * 0.3, 0.24, d * 0.36], 0.85, 1.2);
  b.stackLight([-w * 0.42, 0.24, d * 0.3], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * แท่นชาร์จ — ตู้เตี้ยกว้าง มีชั้นวางแบตเตอรี่ ตู้ไฟหัวท้าย สายชาร์จห้อย
 */
function buildCharger(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  b.plinth(w, d, 0.22);
  // ชั้นวางสามชั้น — เห็นเป็นแท่นชาร์จ ไม่ใช่กล่องทึบ
  b.repeat(3, 0.5, h * 0.82, (y) => {
    b.roundedBox("frame", [0, y, 0], [w * 0.86, 0.1, d * 0.72], 0.04);
  });
  // เสาโครงสี่มุม
  b.repeat(2, -w * 0.42, w * 0.42, (x) => {
    b.repeat(2, -d * 0.35, d * 0.35, (z) => {
      b.cylinder("frame", [x, 0.22 + (h - 0.22) / 2, z], 0.08, 0.08, h - 0.22, "y", 8);
    });
  });
  // แผงข้างทึบด้านหลัง
  b.roundedBox("bodyDark", [0, 0.22 + (h - 0.22) / 2, -d * 0.42], [w * 0.86, h - 0.22, 0.12], 0.05);
  // ตู้ไฟหัวท้าย
  // ตู้ไฟหัวท้าย — จอบนผิวตู้ ไม่ใช่ลอยพ้นขอบกรอบ
  b.repeat(2, -1, 1, (side) => {
    const cabX = (w * 0.5 - 0.22) * side;
    b.roundedBox("body", [cabX, 0.22 + h * 0.36, -d * 0.16], [0.4, h * 0.66, d * 0.42], 0.1);
    b.box("screen", [cabX + 0.2 * side, 0.22 + h * 0.52, -d * 0.16], [0.02, 0.3, 0.42]);
  });
  // แบตเตอรี่บนชั้น (ก้อนสีเข้ม) + สายชาร์จห้อยลงมา
  b.repeat(3, 0.62, h * 0.94, (y, row) => {
    b.repeat(4, -w * 0.3, w * 0.3, (x) => {
      b.roundedBox("bodyDark", [x, y + 0.16, d * 0.02], [w * 0.14, 0.28, d * 0.4], 0.05);
      if (row === 2) {
        b.pipeThrough(
          "rubber",
          [
            [x, y + 0.3, d * 0.2],
            [x, y + 0.1, d * 0.36],
            [x, y + 0.24, d * 0.44],
          ],
          0.035
        );
      }
    });
  });
  b.controlPanel([w * 0.16, 0.22, d * 0.44], 0.8, 1.1);
  b.stackLight([-w * 0.36, 0.22, -d * 0.3], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

/**
 * เครื่องบรรจุหีบห่อ — ตัวถังกลาง แขนพับกล่อง ม้วนฟิล์มสองม้วน รางออกงาน
 */
function buildPacker(w: number, d: number, h: number): PartBuilder {
  const b = new PartBuilder();
  const bodyH = h * 0.58;
  b.plinth(w, d, 0.24);
  b.roundedBox("body", [-w * 0.1, 0.24 + bodyH / 2, 0], [w * 0.6, bodyH, d * 0.82], 0.22, 2);
  // ช่องมองงานด้านหน้า
  b.box("glass", [-w * 0.1, 0.24 + bodyH * 0.6, d * 0.42], [w * 0.36, bodyH * 0.36, 0.03]);
  b.box("frame", [-w * 0.1, 0.24 + bodyH * 0.79, d * 0.42], [w * 0.4, 0.06, 0.05]);
  // ม้วนฟิล์มสองม้วนบนแกนด้านหลัง
  //
  // แกนวางตามแนว z จึงกินความลึกเท่าความยาวแกน (0.66 ม.) รอบจุดศูนย์ ต้อง
  // ถอยเข้ามาให้ปลายแกนจบก่อนขอบกรอบ ไม่ใช่วางจุดศูนย์ไว้เกือบชิดขอบ
  const rollZ = -(d / 2 - 0.4);
  b.repeat(2, 0.24 + bodyH * 0.35, 0.24 + bodyH * 0.78, (y) => {
    b.cylinder("bodyDark", [-w * 0.1, y, rollZ], 0.3, 0.3, 0.5, "z", 20);
    b.cylinder("steel", [-w * 0.1, y, rollZ], 0.05, 0.05, 0.66, "z", 10);
  });
  // แขนพับกล่องด้านบน
  b.roundedBox("frame", [-w * 0.1, 0.24 + bodyH + 0.2, 0], [w * 0.5, 0.16, d * 0.5], 0.06);
  b.cylinder("steel", [-w * 0.1, 0.24 + bodyH + 0.42, 0], 0.09, 0.09, 0.44, "y", 12);
  b.roundedBox("steel", [-w * 0.1, 0.24 + bodyH + 0.62, d * 0.12], [w * 0.3, 0.14, d * 0.3], 0.05);
  // รางออกงานยื่นออกด้านขวา
  b.roundedBox("frame", [w * 0.3, 0.24 + h * 0.34, 0], [w * 0.4, 0.14, d * 0.42], 0.05);
  b.repeat(5, w * 0.14, w * 0.46, (x) => {
    b.cylinder("steel", [x, 0.24 + h * 0.4, 0], 0.06, 0.06, d * 0.4, "z", 10);
  });
  b.repeat(2, -d * 0.22, d * 0.22, (z) => {
    b.box("frame", [w * 0.3, 0.24 + h * 0.44, z], [w * 0.4, 0.14, 0.05]);
  });
  // ขาค้ำรางออกงาน
  b.repeat(2, w * 0.16, w * 0.44, (x) => {
    b.cylinder("frame", [x, 0.24 + h * 0.17, 0], 0.06, 0.06, h * 0.34, "y", 8);
  });
  b.controlPanel([-w * 0.34, 0.24, d * 0.44], 0.8, 1.15);
  b.stackLight([-w * 0.4, 0.24, -d * 0.3], 1.2);
  b.hazardSkirt(w, d);
  return b;
}

type Builder = (w: number, d: number, h: number) => PartBuilder;

const BUILDERS: Record<Archetype, Builder> = {
  furnace: buildFurnace,
  mixer: buildMixer,
  coater: buildCoater,
  oven: buildOven,
  press: buildPress,
  robot: buildRobot,
  cell: buildCell,
  filler: buildFiller,
  charger: buildCharger,
  packer: buildPacker,
};

/**
 * ปั้นโมเดลของ archetype หนึ่งตัว ให้พอดีกล่อง `w` x `d` x `h`
 *
 * ผลลัพธ์ตั้งใจให้ cache ไว้ที่ชั้นบน (`MachineInstances.tsx` ทำ `useMemo`
 * ต่อ archetype) — ปั้นครั้งเดียวต่อ archetype ไม่ใช่ต่อเครื่อง 900 กว่าตัว
 */
export function buildMachineModel(
  archetype: Archetype,
  w: number,
  d: number,
  h: number
): MachineModel {
  const builder = BUILDERS[archetype];
  return { buckets: builder(w, d, h).build() };
}
