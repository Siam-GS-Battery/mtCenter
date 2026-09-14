import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ConveyorSegment, LineInfo, PlantLayout } from "../../../../lib/plantLayout";
import { mergeAll } from "./geometryKit";
import { CONVEYOR, FLOOR, PROCESS } from "./palette";

/**
 * ===========================================================================
 * PRODUCTION LINES — สายพานลำเลียงที่ร้อยเครื่องจักรเข้าเป็นไลน์
 * ===========================================================================
 *
 * `plantLayout.ts` คำนวณ `conveyors: ConveyorSegment[]` ให้แล้ว — แต่ละท่อน
 * คือช่วงสายพานที่พาดไปตามไลน์ (`x`, `z` จุดกลาง, `rot` องศา, `len` ความยาว,
 * `width` ความกว้าง, `parts` จำนวนลูกกลิ้งในท่อนนั้น) วางต่อกันไม่มีช่องว่าง
 * ระหว่างเครื่องจักรที่ติดกันอยู่แล้วโดย `layoutSerpentineLine`/`layoutStackedBlock`
 * (ดูคอมเมนต์ที่นั่น) — ไฟล์นี้จึงไม่ต้องแก้ routing อีก แค่ทำให้สิ่งที่มีอยู่
 * "อ่านออกว่ากำลังวิ่ง"
 *
 * ทำไม merge ทั้งหมดเป็นก้อนเดียว
 * -------------------------------
 * สายพานเป็นของนิ่ง (โครง/ลูกกลิ้ง/ขา ไม่ขยับ) และมีหลายร้อยท่อน ท่อนละ
 * 10-20 ชิ้นส่วน การ merge ทุกท่อนที่ใช้วัสดุเดียวกันเป็น BufferGeometry ก้อน
 * เดียวจึงเหลือ draw call คงที่ทั้งผัง ไม่ว่าจะมีสายพานกี่ท่อน หน้าสายพาน
 * (`belt`) แยกเป็นสองก้อนตามว่าไลน์นั้น "วิ่ง" หรือไม่ (`beltRunning` /
 * `beltIdle`) เพื่อให้เฉพาะไลน์ที่วิ่งจริงมีพื้นผิวเลื่อน — ยังคงเหลือแค่
 * ก้อนเดียวต่อกลุ่มสถานะ ไม่ใช่ก้อนต่อท่อน
 *
 * เส้นตีพื้นไลน์ (`lines`) วาดแยกเป็นอีกก้อน — เป็นแถบสีบนพื้นตามกล่องขอบเขต
 * ของแต่ละไลน์ ช่วยให้เห็นว่าเครื่องกลุ่มไหนเป็นไลน์เดียวกันแม้ซูมออกไกล
 */

/**
 * วัสดุของสายพาน — คงที่ทั้งผัง ไม่มีสถานะรายท่อน (ยกเว้น `belt` ที่แยกโทน
 * เดียวกันออกเป็นสองวัสดุ วิ่ง/นิ่ง — ดูคอมเมนต์ด้านบน)
 *
 * `frame`/`leg` เป็นโครงเหล็กทาสี (satin painted metal) ส่วน `roller` เป็น
 * โลหะเปลือยที่หมุนจริง จึงคมกว่าเล็กน้อยให้ฉากมีวัสดุหลากหลาย ไม่ใช่
 * พลาสติกก้อนเดียวทั้งสายพาน
 */
const MATERIAL_SPECS = {
  frame: { color: CONVEYOR.frame, roughness: 0.55, metalness: 0.12 },
  roller: { color: CONVEYOR.roller, roughness: 0.4, metalness: 0.35 },
  leg: { color: CONVEYOR.leg, roughness: 0.55, metalness: 0.12 },
} as const;

type ConveyorMaterialKey = keyof typeof MATERIAL_SPECS;
type BucketKey = ConveyorMaterialKey | "beltIdle" | "beltRunning";

const BELT_SPEC = { color: CONVEYOR.belt, roughness: 0.9, metalness: 0.0 } as const;

/** ความสูงของหน้าสายพานจากพื้น (เมตร) — ระดับเอวคนทำงาน */
const BELT_HEIGHT = 0.85;

/** ระยะขอบขยายกล่องขอบเขตไลน์ตอนจับคู่ท่อนสายพานเข้ากับไลน์ — เผื่อท่อนที่
 *  โผล่พ้น bounding box ของตัวเครื่องเล็กน้อย (ความกว้างสายพาน + ช่องว่างเผื่อ) */
const LINE_MATCH_MARGIN = 2.2;

/** ไลน์หนึ่งถือว่า "วิ่ง" ตราบใดที่มีเครื่องจักรอย่างน้อยหนึ่งเครื่องสุขภาพดี
 *  ("run" หรือ "warn" — เครื่องเตือนก็ยังทำงาน/ผลิตอยู่จริง) — เดิมเคยใช้กติกา
 *  "ตัวเดียวพัง ทั้งไลน์หยุด" (มีเครื่อง stop/idle เครื่องเดียวก็บล็อกทั้งไลน์)
 *  แต่ข้อมูลจริงมีเครื่องสถานะ idle (maintenance) ถึง ~21% กระจายอยู่ทั่วไลน์
 *  ต่าง ๆ (203/931 เครื่อง คิดเป็น 27 จาก 53 ไลน์ในข้อมูลจริง) กติกาเดิมจึงทำ
 *  ให้ครึ่งหนึ่งของไลน์ทั้งโรงงานดูเหมือน "ไม่ทำงานเลย" ทั้งที่มีเครื่องจักร
 *  ส่วนใหญ่ในไลน์นั้นทำงานปกติอยู่ — เครื่องพังตัวเดียวไม่ควรหยุดทั้งไลน์
 *  (ดู `buildMovingParts` ที่กรองเครื่อง stop/idle ออกเป็นรายเครื่องแทน ไม่ให้
 *  มันปล่อยชิ้นงานเอง แต่เครื่องข้างเคียงที่ยังดีอยู่ก็ยังปล่อยได้ตามปกติ) */
function computeLineRunning(layout: PlantLayout): Map<string, boolean> {
  const statusById = new Map<string, string>();
  for (const m of layout.machines) statusById.set(m.id, m.status);

  const running = new Map<string, boolean>();
  for (const line of layout.lines) {
    const hasHealthyMachine = line.machineIds.some((id) => {
      const s = statusById.get(id);
      return s === "run" || s === "warn";
    });
    running.set(line.id, hasHealthyMachine);
  }
  return running;
}

/** `ConveyorSegment` ไม่ได้เก็บ `lineId` ไว้ จึงจับคู่ท่อนสายพานเข้ากับไลน์
 *  ด้วยตำแหน่ง: ท่อนอยู่ในกล่องขอบเขตของไลน์ไหน (ขยายขอบเผื่อระยะเล็กน้อย)
 *  ก็ถือว่าเป็นของไลน์นั้น */
function findLineForSegment(segment: ConveyorSegment, layout: PlantLayout): LineInfo | undefined {
  return layout.lines.find(
    (l) =>
      segment.x >= l.x0 - LINE_MATCH_MARGIN &&
      segment.x <= l.x1 + LINE_MATCH_MARGIN &&
      segment.z >= l.z0 - LINE_MATCH_MARGIN &&
      segment.z <= l.z1 + LINE_MATCH_MARGIN
  );
}

/**
 * ปั้นสายพานหนึ่งท่อน แล้วหย่อนชิ้นส่วนลงถังตามวัสดุ
 *
 * ทุกชิ้นปั้นในพิกัดของท่อน (ยาวตามแกน x) แล้วหมุน/ย้ายไปตำแหน่งจริงทีเดียว
 * ตอนท้าย — ถูกกว่าการคำนวณพิกัดโลกให้ทุกชิ้นเอง และอ่านง่ายกว่า
 */
function buildSegment(
  segment: ConveyorSegment,
  buckets: Record<BucketKey, THREE.BufferGeometry[]>,
  running: boolean
) {
  const { len, width } = segment;
  if (len <= 0 || width <= 0) return;

  const local: Array<{ g: THREE.BufferGeometry; key: BucketKey }> = [];

  // โครงข้างสองราง
  for (const side of [-1, 1]) {
    const rail = new THREE.BoxGeometry(len, 0.16, 0.09);
    rail.translate(0, BELT_HEIGHT, (side * width) / 2);
    local.push({ g: rail, key: "frame" });
  }

  // หน้าสายพาน — เข้าถังตามว่าไลน์นี้ "วิ่ง" หรือไม่ (สองก้อนแยกวัสดุ ดูหัว
  // ไฟล์) เฉพาะก้อน running เท่านั้นที่ได้ลาย texture ที่ไถลใน useFrame
  const belt = new THREE.BoxGeometry(len, 0.03, width * 0.92);
  belt.translate(0, BELT_HEIGHT + 0.07, 0);
  local.push({ g: belt, key: running ? "beltRunning" : "beltIdle" });

  // ลูกกลิ้ง — จำนวนตาม `parts` ที่ผังคำนวณมา แต่กันไม่ให้ถี่เกิน 0.35 ม.
  // ต่อลูก ไม่งั้นท่อนยาว ๆ จะได้ลูกกลิ้งหลายพันชิ้นโดยตาแทบแยกไม่ออก
  const rollerCount = Math.max(2, Math.min(segment.parts, Math.floor(len / 0.35)));
  for (let i = 0; i < rollerCount; i += 1) {
    const t = rollerCount === 1 ? 0 : -len / 2 + (len * i) / (rollerCount - 1);
    const roller = new THREE.CylinderGeometry(0.055, 0.055, width * 0.9, 10);
    roller.rotateX(Math.PI / 2);
    roller.translate(t, BELT_HEIGHT + 0.07, 0);
    local.push({ g: roller, key: "roller" });
  }

  // ขาตั้งทุก ๆ 2 ม. พร้อมคานขวางใต้สายพาน
  const legPairs = Math.max(2, Math.round(len / 2));
  for (let i = 0; i < legPairs; i += 1) {
    const t = legPairs === 1 ? 0 : -len / 2 + (len * i) / (legPairs - 1);
    for (const side of [-1, 1]) {
      const leg = new THREE.CylinderGeometry(0.05, 0.055, BELT_HEIGHT, 8);
      leg.translate(t, BELT_HEIGHT / 2, (side * width) / 2);
      local.push({ g: leg, key: "leg" });
    }
    const brace = new THREE.BoxGeometry(0.05, 0.05, width);
    brace.translate(t, BELT_HEIGHT * 0.35, 0);
    local.push({ g: brace, key: "leg" });
  }

  // ย้ายทุกชิ้นของท่อนนี้ไปตำแหน่ง/มุมจริงบนผัง
  const transform = new THREE.Matrix4()
    .makeRotationY(THREE.MathUtils.degToRad(segment.rot))
    .setPosition(segment.x, 0, segment.z);
  // makeRotationY แล้ว setPosition ให้ผลเป็น "หมุนก่อน แล้วเลื่อน" ซึ่งตรงกับ
  // ที่ต้องการ (ท่อนหมุนรอบจุดกลางตัวเอง ไม่ใช่รอบจุดกำเนิดของผัง)
  for (const { g, key } of local) {
    g.applyMatrix4(transform);
    buckets[key].push(g);
  }
}

/** ลาย canvas texture เล็ก ๆ สำหรับหน้าสายพานของไลน์ที่ "วิ่ง" — ลายทางเข้ม/
 *  อ่อนสลับ ให้ offset.x ไถลได้ (ดู useFrame ใน `ProductionLines`) วิธีนี้
 *  ถูกที่สุดที่ยังมองเห็นได้จริง: ยังเป็น merged mesh ก้อนเดียวต่อสถานะ (ไม่
 *  แยกท่อนเป็น mesh ของใครของมัน) มีแค่ material เดียวที่ขยับ offset ทุกเฟรม
 *  ไม่มีการจัดสรร geometry ใหม่ต่อเฟรม */
function createBeltScrollTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = CONVEYOR.belt;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ลายทางหนาขึ้น + ใช้ roller (โทนโลหะอ่อนกว่าเดิม) ที่ contrast ชัดกว่าเดิม
  // มาก (แถบเดิม 6px ต่อ 22px บน canvas 64x8 บางเกินจะสังเกตได้ที่ระยะกล้อง
  // ปกติ) แถบใหม่หนา+ถี่ขึ้นให้ตาจับการไถลได้ชัดโดยไม่ต้องซูมเข้า
  ctx.fillStyle = CONVEYOR.roller;
  for (let x = 0; x < canvas.width; x += 32) ctx.fillRect(x, 0, 14, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(6, 1);
  return texture;
}

// ---------------------------------------------------------------------------
// กล่อง/ชิ้นงานเคลื่อนที่บนสายพาน — spawn ที่จุดออกของเครื่องจักร แล้วไถลไป
// ตามสายพานจนสุดปลายไลน์ ก่อนวนกลับมาเกิดที่เครื่องเดิมใหม่
// ---------------------------------------------------------------------------
//
// ท่อนสายพานของไลน์เดียวกันต่อกันเป็นเส้นเดียว (serpentine, ดู
// `plantLayout.ts`) แต่ `layout.conveyors` เป็น array แบนไม่รับประกันลำดับ
// ทางเรขาคณิตที่สมบูรณ์ (ท่อน "ทางเลี้ยวกลับ" ของแต่ละ fold ถูก push หลังท่อน
// ตรงของ pass ถัดไป) — `buildLinePath` จึงต่อท่อนของแต่ละไลน์เป็นเส้นทางเดียว
// เองจากตำแหน่งจริง (จับคู่ปลายท่อนที่ชนกัน) แทนที่จะเชื่อถือลำดับ array ตรง ๆ
//
// ชิ้นงานแต่ละชิ้นผูกกับเครื่องจักรหนึ่งเครื่อง: จุดเกิด = ตำแหน่งเครื่องนั้น
// โปรเจกต์ลงบนเส้นทางของไลน์ (ระยะทางสะสมตามเส้นทาง) แล้ววิ่งไปทาง "ปลายไลน์"
// เท่านั้น (ทิศทางเดียว ไม่สลับไปมาเหมือนเดิม) วนกลับมาเกิดใหม่ที่จุดเดิมเมื่อ
// ถึงปลาย — อ่านว่า "สินค้าไหลออกจากเครื่องนี้ไปตามสายพาน" ตามที่โจทย์ขอ
//
// งบชิ้นงาน: สูงสุด `MAX_MOVING_PARTS` ชิ้นทั้งผัง คงที่เสมอ — ไล่ตามลำดับ
// ไลน์ (`layout.lines`) แล้วไล่เครื่องภายในไลน์ (`line.machineIds`) จนกว่าจะ
// เต็มงบ deterministic เสมอ ไม่ใช่การสุ่ม
const MAX_MOVING_PARTS = 480;
/** ความเร็วไถลของกล่องบนสายพาน (ม./วินาที) — จังหวะสายพานลำเลียงจริง มองออก
 *  ชัดว่ากำลังไหล แต่ไม่เร็วจนดูตลก */
const PART_SPEED = 0.6;
/** ระยะห่างเป้าหมายระหว่างชิ้นงานบนสายพานเดียวกัน (ม.) — ใช้คำนวณว่าแต่ละ
 *  เครื่องควรปล่อยกี่ชิ้นต่อช่วงที่มันรับผิดชอบ (`span`) แทนที่จะปล่อยทีละชิ้น
 *  ต่อเครื่องแบบเดิม ยิ่งไลน์ยาว ยิ่งเห็นชิ้นงานเรียงกันไหลต่อเนื่องเป็นสาย
 *  ไม่ใช่จุดเดียวโดด ๆ ต่อเครื่อง (งบรวมยังถูกกันด้วย `MAX_MOVING_PARTS`) */
const PART_SPACING = 3.2;
// ขนาดชิ้นงาน — ใหญ่กว่ากล่องเดิม (0.34 x 0.16 -> 0.46 x 0.3) เพราะฉากซูม
// ออกไกลมาก (มุมกล้องเริ่มต้น "line" ตอนยังไม่เลือกโซนเล็งทั้งไซต์ ~325x535 ม.
// ระยะกล้องร้อยเมตรขึ้นไป) แม้ 0.46 ม. ก็ยังจมกับพื้นหลังที่ระยะนั้น จึงขยับ
// ขึ้นอีกขั้นให้อ่านออกจริงจากมุมกล้องเริ่มต้น โดยยังเป็นสัดส่วนกล่อง/ลังของ
// สมจริงเทียบหน้าสายพาน 0.85 ม.
const PART_LEN = 0.62;
const PART_HEIGHT = 0.36;
/** สัดส่วนความกว้างชิ้นงานเทียบความกว้างสายพาน (หน้าสายพานเองใช้ 0.92) —
 *  กว้างขึ้นจากเดิม (0.55 -> 0.72) ให้ชิ้นงานดูเต็มหน้าสายพานขึ้น อ่านง่ายขึ้นจากที่ไกล */
const PART_WIDTH_RATIO = 0.78;
/** ระยะเผื่อจับคู่ปลายท่อนสายพานตอนต่อเป็นเส้นทางเดียว (ม.) — เดิมตั้งไว้ที่
 *  0.75 ม. โดยเข้าใจผิดว่าท่อนที่ติดกันแทบไม่มีช่องว่าง แต่วัดจริงจากผังที่คำนวณ
 *  แล้วพบว่าท่อนสายพานสองท่อนของไลน์เดียวกันห่างกันเต็ม "ความกว้างเครื่องจักร
 *  หนึ่งตัว" (footprint กว้างสุด 9.6 ม. ของ `coater` + `MACHINE_PITCH_GAP` 1.75
 *  ม. ใน `plantLayout.ts` = ~11.35 ม. เป็นเคสแย่สุด) ค่าเดิม 0.75 ม. จึงไม่เคย
 *  จับคู่ปลายท่อนได้เลยสักคู่ (0/13 ท่อนในตัวอย่างที่ตรวจ) โค้ดต่อเส้นทางจึง
 *  กลายเป็น dead code ที่ fallback ไปต่อท้ายตามลำดับ array ดิบเงียบ ๆ ทุกครั้ง
 *  แก้โดยยกค่าให้ครอบคลุมเคสแย่สุดจริง (ปัดขึ้นเป็น 12 ม.) และเปลี่ยนอัลกอริทึม
 *  ให้ fallback ไปจับคู่กับท่อนที่ใกล้ที่สุดเสมอ (ดู `buildLinePath`) แทนการ
 *  หยุดค้นหาเมื่อไม่มีท่อนไหนอยู่ในระยะ — เพราะ segment ที่ส่งเข้ามาถูกกรองตาม
 *  ไลน์มาก่อนแล้ว (`segmentsByLine`) การจับคู่ใกล้สุดจึงถูกต้องเสมอไม่ต้องกลัว
 *  หลุดไปเชื่อมท่อนของไลน์อื่น */
const CHAIN_TOLERANCE = 12;
const CHAIN_TOLERANCE_SQ = CHAIN_TOLERANCE * CHAIN_TOLERANCE;

/** ความเร็วไถลของลายบนหน้าสายพาน (หน่วย repeat/วินาที) — ผูกกับ `PART_SPEED`
 *  (คูณด้วยค่าคงที่) แทนการตั้งเลขลอย ๆ แยกกัน เพื่อให้ลายบนหน้าสายพานกับ
 *  กล่องที่ไถลอยู่บนมันดูเป็นความเร็วเดียวกันจริง ๆ ไม่ใช่คนละจังหวะกัน */
const BELT_SCROLL_SPEED = PART_SPEED * 2;

/** seed -> [0,1) แบบ deterministic (sine hash เดียวกับ `FloorActivity.tsx`) */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** ท่อนสายพานหนึ่งท่อนที่ถูกวางลงบนเส้นทางเดียวของไลน์แล้ว — `cumStart` คือ
 *  ระยะสะสมตามเส้นทางที่จุดเริ่มท่อนนี้ (ทิศ "เดินหน้าตามเส้นทาง"), `reversed`
 *  บอกว่าทิศเดินหน้าของเส้นทางตรงข้ามกับทิศ p0->p1 เดิมของท่อนนี้หรือไม่ */
interface PathSeg {
  x: number;
  z: number;
  cos: number;
  sin: number;
  len: number;
  width: number;
  cumStart: number;
  reversed: boolean;
}

interface LinePath {
  segs: PathSeg[];
  totalLen: number;
}

/** ต่อท่อนสายพานที่จับคู่กับไลน์เดียวกัน (ลำดับใน array ไม่รับประกันเรียงตาม
 *  เรขาคณิต) ให้เป็นเส้นทางเดียวต่อเนื่อง ด้วยการจับคู่ปลายท่อนที่ตำแหน่งชนกัน
 *  จริง (greedy nearest-endpoint chaining จากท่อนเริ่มต้นทั้งสองด้าน) ท่อนที่
 *  หาปลายที่ชนกันไม่เจอ (ไม่ควรเกิดกับข้อมูลจริงที่ต่อกันสนิทอยู่แล้ว) จะถูก
 *  ต่อท้ายเส้นทางไว้เฉย ๆ แทนการหายไปจากงบชิ้นงานเงียบ ๆ */
function buildLinePath(segments: ConveyorSegment[]): LinePath {
  if (segments.length === 0) return { segs: [], totalLen: 0 };

  const items = segments.map((s) => {
    const rad = THREE.MathUtils.degToRad(s.rot);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const half = s.len / 2;
    return {
      s,
      cos,
      sin,
      p0x: s.x - half * cos,
      p0z: s.z + half * sin,
      p1x: s.x + half * cos,
      p1z: s.z - half * sin,
      used: false,
    };
  });

  type Item = (typeof items)[number];
  type ChainEntry = { item: Item; reversed: boolean };
  type Candidate = { item: Item; reversed: boolean; d: number };
  const chain: ChainEntry[] = [{ item: items[0]!, reversed: false }];
  items[0]!.used = true;

  const distSq = (ax: number, az: number, bx: number, bz: number) => {
    const dx = ax - bx;
    const dz = az - bz;
    return dx * dx + dz * dz;
  };

  const extend = (atFront: boolean) => {
    for (;;) {
      const edge = atFront ? chain[0]! : chain[chain.length - 1]!;
      const openX = atFront
        ? edge.reversed
          ? edge.item.p1x
          : edge.item.p0x
        : edge.reversed
          ? edge.item.p0x
          : edge.item.p1x;
      const openZ = atFront
        ? edge.reversed
          ? edge.item.p1z
          : edge.item.p0z
        : edge.reversed
          ? edge.item.p0z
          : edge.item.p1z;

      // `best` = ผู้เข้าชิงที่อยู่ในระยะ CHAIN_TOLERANCE (เคสปกติ) — `nearest`
      // = ผู้เข้าชิงที่ใกล้ที่สุดไม่ว่าจะไกลแค่ไหน ใช้เป็น fallback กันไม่ให้
      // ท่อนไหนหลุดจากเส้นทางไปเงียบ ๆ (ปลอดภัยเพราะ `items` ที่ส่งเข้ามาถูก
      // กรองเป็นของไลน์เดียวกันไว้แล้วที่ `segmentsByLine`)
      const candidates: Candidate[] = [];
      for (const it of items) {
        if (it.used) continue;
        if (atFront) {
          // ต้องการปลาย "ออก" ของท่อนใหม่มาชนปลาย "เข้า" ของท่อนแรกปัจจุบัน:
          // reversed=false ปลายออกคือ p1, reversed=true ปลายออกคือ p0
          candidates.push({ item: it, reversed: false, d: distSq(openX, openZ, it.p1x, it.p1z) });
          candidates.push({ item: it, reversed: true, d: distSq(openX, openZ, it.p0x, it.p0z) });
        } else {
          // ต้องการปลาย "เข้า" ของท่อนใหม่มาชนปลาย "ออก" ของท่อนสุดท้ายปัจจุบัน
          candidates.push({ item: it, reversed: false, d: distSq(openX, openZ, it.p0x, it.p0z) });
          candidates.push({ item: it, reversed: true, d: distSq(openX, openZ, it.p1x, it.p1z) });
        }
      }
      // เลือกผู้เข้าชิงที่อยู่ในระยะ CHAIN_TOLERANCE ก่อน (เคสปกติ) ถ้าไม่มีเลย
      // ให้ fallback ไปเอาตัวที่ใกล้ที่สุดไม่ว่าจะไกลแค่ไหน (ปลอดภัยเพราะ
      // `items` ถูกกรองเป็นของไลน์เดียวกันไว้แล้วที่ `segmentsByLine`)
      const inTolerance = candidates.filter((c) => c.d <= CHAIN_TOLERANCE_SQ);
      const pool = inTolerance.length > 0 ? inTolerance : candidates;
      let chosen: Candidate | undefined;
      for (const c of pool) {
        if (!chosen || c.d < chosen.d) chosen = c;
      }
      if (!chosen) break;
      chosen.item.used = true;
      if (atFront) chain.unshift({ item: chosen.item, reversed: chosen.reversed });
      else chain.push({ item: chosen.item, reversed: chosen.reversed });
    }
  };
  extend(false);
  extend(true);

  // เศษท่อนที่หาปลายชนกันไม่เจอ (ควรไม่มีในข้อมูลจริง) — ต่อท้ายไว้เฉย ๆ
  for (const it of items) {
    if (!it.used) {
      it.used = true;
      chain.push({ item: it, reversed: false });
    }
  }

  const segs: PathSeg[] = [];
  let cum = 0;
  for (const c of chain) {
    const { s, cos, sin } = c.item;
    segs.push({ x: s.x, z: s.z, cos, sin, len: s.len, width: s.width, cumStart: cum, reversed: c.reversed });
    cum += s.len;
  }
  return { segs, totalLen: cum };
}

/** หาท่อนที่ระยะสะสม `d` ตกอยู่ใน (linear scan — เส้นทางของหนึ่งไลน์มีท่อน
 *  น้อย จึงถูกกว่า/ง่ายกว่า binary search และไม่จัดสรรอะไรเพิ่ม) */
function findSegmentAt(path: LinePath, d: number): PathSeg | undefined {
  const segs = path.segs;
  for (let i = 0; i < segs.length; i += 1) {
    const seg = segs[i]!;
    if (d <= seg.cumStart + seg.len || i === segs.length - 1) return seg;
  }
  return undefined;
}

/** โปรเจกต์ตำแหน่งเครื่องจักร (mx, mz) ลงบนเส้นทางของไลน์ตัวเอง คืนระยะสะสม
 *  ตามเส้นทางที่จุดใกล้ที่สุด — นี่คือ "จุดออก" ของเครื่องนั้นบนหน้าสายพาน */
function projectOntoPath(path: LinePath, mx: number, mz: number): number {
  let bestDistSq = Infinity;
  let bestD = 0;
  for (const seg of path.segs) {
    const half = seg.len / 2;
    const dx = mx - seg.x;
    const dz = mz - seg.z;
    const rawT = dx * seg.cos - dz * seg.sin;
    const t = Math.max(-half, Math.min(half, rawT));
    const px = seg.x + t * seg.cos;
    const pz = seg.z - t * seg.sin;
    const ddx = mx - px;
    const ddz = mz - pz;
    const d2 = ddx * ddx + ddz * ddz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      bestD = seg.reversed ? seg.cumStart + (half - t) : seg.cumStart + (t + half);
    }
  }
  return bestD;
}

interface MovingPart {
  /** เส้นทางของไลน์ที่ชิ้นงานนี้วิ่งอยู่ — อ้างอิงร่วมกันข้ามชิ้นงานของไลน์
   *  เดียวกัน (ไม่ clone) เพื่อไม่จัดสรรอะไรเพิ่มต่อเฟรม */
  path: LinePath;
  /** ระยะสะสมตามเส้นทางที่จุดเกิด (ตำแหน่งเครื่องจักรที่ผูกด้วย) */
  startDist: number;
  /** ระยะที่เหลือจากจุดเกิดถึงปลายเส้นทาง — คาบของการวน (ไม่วนกลับไปเกิดใหม่
   *  ก่อนจุดเกิดของตัวเอง) */
  span: number;
  phase: number;
}

function buildMovingParts(layout: PlantLayout): MovingPart[] {
  const lineRunning = computeLineRunning(layout);
  if (layout.lines.length === 0 || layout.conveyors.length === 0) return [];

  const segmentsByLine = new Map<string, ConveyorSegment[]>();
  for (const segment of layout.conveyors) {
    if (segment.len <= 0 || segment.width <= 0) continue;
    const line = findLineForSegment(segment, layout);
    if (!line || !lineRunning.get(line.id)) continue;
    let list = segmentsByLine.get(line.id);
    if (!list) {
      list = [];
      segmentsByLine.set(line.id, list);
    }
    list.push(segment);
  }

  const pathByLine = new Map<string, LinePath>();
  for (const [lineId, segs] of segmentsByLine) {
    const path = buildLinePath(segs);
    if (path.totalLen > PART_LEN) pathByLine.set(lineId, path);
  }

  const positionById = new Map<string, { x: number; z: number }>();
  const statusById = new Map<string, string>();
  for (const m of layout.machines) {
    positionById.set(m.id, { x: m.x, z: m.z });
    statusById.set(m.id, m.status);
  }

  const parts: MovingPart[] = [];
  for (const line of layout.lines) {
    if (parts.length >= MAX_MOVING_PARTS) break;
    const path = pathByLine.get(line.id);
    if (!path) continue;
    for (const machineId of line.machineIds) {
      if (parts.length >= MAX_MOVING_PARTS) break;
      // เครื่องพัง/ซ่อมบำรุงตัวนี้เองไม่ปล่อยชิ้นงาน — แต่ไม่กระทบเครื่อง
      // ข้างเคียงในไลน์เดียวกันที่ยังทำงานปกติอยู่ (ดูคอมเมนต์
      // `computeLineRunning`)
      const status = statusById.get(machineId);
      if (status === "stop" || status === "idle") continue;
      const pos = positionById.get(machineId);
      if (!pos) continue;
      const startDist = projectOntoPath(path, pos.x, pos.z);
      const span = path.totalLen - startDist;
      // เครื่องอยู่ท้ายสุด (หรือเกือบท้ายสุด) ของไลน์แล้ว — ไม่มีระยะให้เห็น
      // ชิ้นงานไหลออกจากมัน ข้ามไปแทนการยัดชิ้นงานที่แทบไม่ขยับ
      if (span <= PART_LEN * 0.5) continue;
      // แต่ก่อนปล่อยชิ้นงานเดียวต่อเครื่อง (จุดเดียวโดด ๆ ไหลไปตามช่วงว่าง
      // ยาว ๆ) ตอนนี้เรียงชิ้นงานหลายชิ้นตามระยะ `PART_SPACING` ตลอดช่วงที่
      // เครื่องนี้รับผิดชอบ (`span`) แล้ว offset phase ของแต่ละชิ้นให้ห่างกัน
      // เท่า ๆ กันบวก jitter เล็กน้อยกันดูเป็นแถวตรงเป๊ะเกินจริง — ทำให้สายพาน
      // อ่านออกว่า "มีของไหลต่อเนื่องเป็นสาย" แทนที่จะเป็นจุดเดียวห่าง ๆ
      const spacedCount = Math.max(1, Math.floor(span / PART_SPACING));
      for (let k = 0; k < spacedCount; k += 1) {
        if (parts.length >= MAX_MOVING_PARTS) break;
        const jitter = (hash01(parts.length * 7.13 + 1) - 0.5) * PART_SPACING * 0.4;
        const phase = ((k * PART_SPACING + jitter) % span + span) % span;
        parts.push({ path, startDist, span, phase });
      }
    }
  }
  return parts;
}

const SCRATCH_POS = new THREE.Vector3();
const SCRATCH_QUAT = new THREE.Quaternion();
const SCRATCH_SCALE = new THREE.Vector3();
const SCRATCH_MATRIX = new THREE.Matrix4();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

/** กล่อง/ชิ้นงานเล็ก ๆ ที่เกิดที่ตำแหน่งเครื่องจักรบนไลน์ที่ "วิ่ง" จริง แล้ว
 *  ไถลไปตามเส้นทางสายพานของไลน์นั้นทางเดียว (ไม่สลับทิศ) จนถึงปลายไลน์ ก่อน
 *  วนกลับมาเกิดที่จุดเดิมใหม่ */
function MovingBeltParts({ layout }: { layout: PlantLayout }) {
  const parts = useMemo(() => buildMovingParts(layout), [layout]);
  const count = parts.length;

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // emissive อ่อน ๆ ช่วยให้ชิ้นงานอ่านออกง่ายขึ้นตอนซูมออกไกล (กล่องเล็กบน
  // สายพานสีเข้ม แสงส่องธรรมดาอาจจมกับพื้นหลัง) ไม่ได้ทำให้ดู "เรืองแสง"
  // เกินจริง แค่ยกความสว่างขึ้นเล็กน้อยจากสีเดิม
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PROCESS.beltCargo,
        emissive: PROCESS.beltCargo,
        emissiveIntensity: 0.12,
        roughness: 0.8,
        metalness: 0.02,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);

  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const p = parts[i]!;
      const raw = (t * PART_SPEED + p.phase) % p.span;
      const d = p.startDist + (raw < 0 ? raw + p.span : raw);
      const seg = findSegmentAt(p.path, d);
      if (!seg) continue;

      const half = seg.len / 2;
      const localD = d - seg.cumStart;
      const tLocal = seg.reversed ? half - localD : localD - half;
      const worldX = seg.x + tLocal * seg.cos;
      const worldZ = seg.z - tLocal * seg.sin;
      const dirX = seg.reversed ? -seg.cos : seg.cos;
      const dirZ = seg.reversed ? seg.sin : -seg.sin;

      SCRATCH_POS.set(worldX, BELT_HEIGHT + 0.07 + 0.015 + PART_HEIGHT / 2, worldZ);
      SCRATCH_QUAT.setFromAxisAngle(Y_AXIS, Math.atan2(dirZ, dirX));
      SCRATCH_SCALE.set(PART_LEN, PART_HEIGHT, Math.max(0.24, seg.width * PART_WIDTH_RATIO));
      SCRATCH_MATRIX.compose(SCRATCH_POS, SCRATCH_QUAT, SCRATCH_SCALE);
      mesh.setMatrixAt(i, SCRATCH_MATRIX);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  // ผังไม่มีไลน์ที่วิ่ง/ไม่มีสายพานเลย -> ไม่มีชิ้นงานให้ไถล ปล่อยว่างแทนการ crash
  if (count === 0) return null;

  return (
    <instancedMesh
      ref={(node: THREE.InstancedMesh | null) => {
        meshRef.current = node;
        if (node) node.raycast = () => null;
      }}
      args={[geometry, material, count]}
      castShadow
    />
  );
}

export interface ProductionLinesProps {
  layout: PlantLayout;
}

/**
 * สายพานทั้งผัง + แถบสีบนพื้นบอกขอบเขตของแต่ละไลน์
 */
export function ProductionLines({ layout }: ProductionLinesProps) {
  const built = useMemo(() => {
    const lineRunning = computeLineRunning(layout);
    const buckets: Record<BucketKey, THREE.BufferGeometry[]> = {
      frame: [],
      beltIdle: [],
      beltRunning: [],
      roller: [],
      leg: [],
    };
    for (const segment of layout.conveyors) {
      const line = findLineForSegment(segment, layout);
      const running = !!line && !!lineRunning.get(line.id);
      buildSegment(segment, buckets, running);
    }

    const merged: Partial<Record<BucketKey, THREE.BufferGeometry>> = {};
    for (const key of Object.keys(buckets) as BucketKey[]) {
      const geometry = mergeAll(buckets[key]);
      if (geometry) merged[key] = geometry;
    }

    // แถบพื้นของแต่ละไลน์ — กล่องขอบเขตที่ plantLayout คำนวณไว้ เผื่อขอบ
    // ออกไปเล็กน้อยให้เห็นเป็นพื้นของไลน์ ไม่ใช่เส้นชนตัวเครื่องพอดี
    const lineSlabs: THREE.BufferGeometry[] = [];
    for (const line of layout.lines) {
      const w = Math.abs(line.x1 - line.x0);
      const d = Math.abs(line.z1 - line.z0);
      if (w <= 0 || d <= 0) continue;
      const slab = new THREE.BoxGeometry(w + 1.6, 0.02, d + 1.6);
      slab.translate((line.x0 + line.x1) / 2, 0.055, (line.z0 + line.z1) / 2);
      lineSlabs.push(slab);
    }

    return { merged, lineFloor: mergeAll(lineSlabs) };
  }, [layout]);

  useEffect(
    () => () => {
      for (const geometry of Object.values(built.merged)) geometry?.dispose();
      built.lineFloor?.dispose();
    },
    [built]
  );

  const runningBeltTexture = useMemo(() => createBeltScrollTexture(), []);
  useEffect(() => () => runningBeltTexture.dispose(), [runningBeltTexture]);
  // ไถลลายบนหน้าสายพานของไลน์ที่วิ่ง — วัสดุเดียว ก้อนเดียว ขยับแค่ offset
  // ต่อเฟรม ไม่มีการจัดสรร geometry/material ใหม่
  useFrame(({ clock }) => {
    runningBeltTexture.offset.x = -clock.elapsedTime * BELT_SCROLL_SPEED;
  });

  return (
    <group>
      {built.lineFloor ? (
        // แถบสีพื้นบอกขอบเขตไลน์ — จัดเป็นงานทาสีพื้น (floor marking) ของนิ่ง
        // ไม่ใช่ของที่คลิกได้ ปิด raycast เหมือนเมชอื่นทั้งไฟล์นี้/ทั้งฉาก
        <mesh geometry={built.lineFloor} receiveShadow raycast={() => null}>
          <meshStandardMaterial color={FLOOR.aisle} roughness={0.65} metalness={0.04} />
        </mesh>
      ) : null}
      {(Object.keys(MATERIAL_SPECS) as ConveyorMaterialKey[]).map((key) => {
        const geometry = built.merged[key];
        if (!geometry) return null;
        const spec = MATERIAL_SPECS[key];
        return (
          <mesh key={key} geometry={geometry} castShadow receiveShadow raycast={() => null}>
            <meshStandardMaterial
              color={spec.color}
              roughness={spec.roughness}
              metalness={spec.metalness}
            />
          </mesh>
        );
      })}
      {built.merged.beltIdle ? (
        <mesh geometry={built.merged.beltIdle} castShadow receiveShadow raycast={() => null}>
          <meshStandardMaterial color={BELT_SPEC.color} roughness={BELT_SPEC.roughness} metalness={BELT_SPEC.metalness} />
        </mesh>
      ) : null}
      {built.merged.beltRunning ? (
        <mesh geometry={built.merged.beltRunning} castShadow receiveShadow raycast={() => null}>
          <meshStandardMaterial
            color={BELT_SPEC.color}
            roughness={BELT_SPEC.roughness}
            metalness={BELT_SPEC.metalness}
            map={runningBeltTexture}
          />
        </mesh>
      ) : null}
      <MovingBeltParts layout={layout} />
    </group>
  );
}

export default ProductionLines;
