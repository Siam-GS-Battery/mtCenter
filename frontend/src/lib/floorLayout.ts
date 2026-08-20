import type { Machine, MachineStatus } from "../types";

/**
 * ประเภทเครื่องจักรเชิงรูปทรง (archetype) ใช้เลือกโมเดล 3D ให้เครื่องแต่ละตัว
 * — cnc: ศูนย์เครื่องจักรกล (กล่อง + หัวสปินเดิลหมุน)
 * — press: เครื่องปั๊ม (โครงสูง + แกนกระทุ้งขึ้นลง)
 * — furnace: เตาอบ (ตัวยาวเตี้ย + ประตูเรืองแสง)
 * — assembly: สถานีประกอบ (โต๊ะ + แขนเครื่องมือ)
 * — robot: เซลล์หุ่นยนต์ (ฐาน + แขนหลายท่อน)
 * — tank: ถังผสม/ชุบ (ทรงกระบอก + ใบกวน)
 * — inspection: สถานีตรวจสอบ (แกนทรี + บาร์สแกน)
 * — packing: สถานีบรรจุ (โต๊ะ + แขนดัน)
 */
export type MachineArchetype =
  | "cnc"
  | "press"
  | "furnace"
  | "assembly"
  | "robot"
  | "tank"
  | "inspection"
  | "packing";

/** ชื่อภาษาไทยของ archetype แต่ละแบบ (ใช้แสดงใน HUD / ป้ายกำกับ) */
export const ARCHETYPE_LABELS: Record<MachineArchetype, string> = {
  cnc: "เครื่องกัด/กลึง CNC",
  press: "เครื่องปั๊มขึ้นรูป",
  furnace: "เตาอบ/อบชุบ",
  assembly: "สถานีประกอบ",
  robot: "หุ่นยนต์แขนกล",
  tank: "ถังผสม/ชุบ",
  inspection: "สถานีตรวจสอบ",
  packing: "สถานีบรรจุ",
};

/** ตำแหน่งของเครื่องจักรหนึ่งตัวบนผังโรงงาน (พิกัดโลกสัมบูรณ์ หน่วยเมตร) */
export interface FloorSlot {
  machine: Machine;
  /** พิกัด X สัมบูรณ์ (เมตร) */
  x: number;
  /** พิกัด Z สัมบูรณ์ (เมตร) */
  z: number;
  /** การหมุนรอบแกน Y (เรเดียน) — หันหน้าเข้าหาสายพานกลางของไลน์เสมอ */
  rotationY: number;
  /** ขนาดฐานตามแกน X ก่อนหมุน */
  width: number;
  /** ขนาดฐานตามแกน Z ก่อนหมุน */
  depth: number;
  height: number;
  zoneId: string;
  /** ลำดับภายในโซน (เสถียร เรียงตาม code ?? name) */
  indexInZone: number;
  archetype: MachineArchetype;
  lineId: string;
  indexInLine: number;
  /** ฝั่งของสายพาน: -1 = ฝั่งลบ, 1 = ฝั่งบวก */
  side: -1 | 1;
}

/** ไลน์ผลิตหนึ่งไลน์ = สายพานกลางหนึ่งเส้น มีเครื่องจักรขนาบสองข้าง */
export interface FloorLine {
  id: string;
  zoneId: string;
  /** ป้ายชื่อไลน์ภาษาไทย เช่น "ไลน์ 3" */
  label: string;
  /** ปลายสายพานด้านที่ 1 (พิกัดโลกสัมบูรณ์ ระดับพื้น) */
  x1: number;
  z1: number;
  /** ปลายสายพานด้านที่ 2 */
  x2: number;
  z2: number;
  /** true เมื่อสายพานทอดตามแกน X, false เมื่อทอดตามแกน Z */
  horizontal: boolean;
  machineCount: number;
  worstStatus: MachineStatus;
}

/** โซน = โรงผลิตหนึ่งหลัง (hall) ซึ่งบรรจุหลายไลน์ */
export interface FloorZone {
  id: string;
  label: string;
  /** จุดศูนย์กลางของโรง */
  x: number;
  z: number;
  width: number;
  depth: number;
  machineCount: number;
  /** สถานะแย่สุดในโซน: error > warning > maintenance > normal */
  worstStatus: MachineStatus;
  counts: Record<MachineStatus, number>;
  lineIds: string[];
}

/**
 * ชนิดของวัตถุประกอบฉาก (prop) บนผังโรงงาน
 * — ระดับอาคาร: rack, pillar, dock, office, crate, tank, sign
 * — ระดับพื้นที่โรงงาน (site): fence, gate, guardhouse, parking, yard, tree
 *   (`fence` ใช้ทั้งรั้วรอบพื้นที่โรงงาน และแนวกั้นเขตอันตรายรอบโรงที่มีสถานะ error)
 */
export type FloorPropKind =
  | "rack"
  | "pillar"
  | "dock"
  | "office"
  | "crate"
  | "tank"
  | "fence"
  | "sign"
  /** แผงประตูรั้วเลื่อนที่ทางเข้าโรงงาน */
  | "gate"
  /** ป้อมยามข้างประตูทางเข้า */
  | "guardhouse"
  /** ลานจอดรถ (แผ่นพื้นราบ) */
  | "parking"
  /** ลานวางวัสดุ/พาเลทกลางแจ้ง */
  | "yard"
  /** ต้นไม้ริมรั้วและช่องว่างระหว่างอาคาร */
  | "tree"
  /** อาคารสำนักงานหน้าโรงงาน (ของประดับฉากล้วนๆ ไม่มีเครื่องจักร/โซน) */
  | "officeBlock"
  /** ลานพลาซ่า/ลานหน้าอาคารสำนักงาน */
  | "officePlaza"
  /** เสาธงหน้าลานพลาซ่า */
  | "flagpole"
  /** แนวรั้วต้นไม้เตี้ยขอบลานพลาซ่า */
  | "hedge"
  /** ป้ายชื่อไลน์ผลิตที่หัวไลน์ ยกสูงให้อ่านได้ หันหน้าตามแนวสายพาน */
  | "lineSign"
  /** อาคารเสริมขนาดเล็ก (โรงอาหาร/ธุรการ) ข้างอาคารสำนักงานหลัก ของประดับฉากล้วนๆ */
  | "officeAnnex"
  /** ทางเดินมีหลังคา/ที่จอดรถคลุมหน้าอาคารสำนักงาน */
  | "carPorch"
  /** เสาไฟถนนริมถนนหลักในพื้นที่โรงงาน */
  | "lightPole";

/** วัตถุประกอบฉากหนึ่งชิ้น (พิกัดโลกสัมบูรณ์) */
export interface FloorProp {
  id: string;
  kind: FloorPropKind;
  x: number;
  z: number;
  rotationY: number;
  width: number;
  depth: number;
  height: number;
}

/** ทางเดิน/ถนนภายในโรงงาน (วาดเป็นแถบบนพื้น) */
export interface FloorAisle {
  id: string;
  /** จุดศูนย์กลาง */
  x: number;
  z: number;
  width: number;
  depth: number;
  /** true = ถนนหลักทอดตามแกน X */
  horizontal: boolean;
  /** true = ถนนหลักระหว่างโรง, false = ทางเดินแคบภายในโรง */
  main: boolean;
}

/** อาคารโรงงานหนึ่งหลังบนพื้นที่โรงงาน (หนึ่งหลังต่อหนึ่ง factoryGroup) */
export interface FloorBuilding {
  /** slug ของ factoryGroup */
  id: string;
  /** ชื่อที่แสดงผล (ภาษาไทย) มาจากค่า factoryGroup จริงในฐานข้อมูล */
  label: string;
  /** จุดศูนย์กลางอาคาร (พิกัดโลกสัมบูรณ์) */
  x: number;
  z: number;
  width: number;
  depth: number;
  wallHeight: number;
  /** ตำแหน่ง X สัมบูรณ์ของแนวโครงถักหลังคาของอาคารหลังนี้ */
  trussX: number[];
  /** id ของโซน (โรงผลิต) ที่อยู่ในอาคารหลังนี้ */
  zoneIds: string[];
  machineCount: number;
  worstStatus: MachineStatus;
}

/** ประเภทถนนภายในพื้นที่โรงงาน: main = ถนนหลัก, service = ถนนบริการ */
export type FloorRoadKind = "main" | "service";

/** ถนนระหว่างอาคารในพื้นที่โรงงาน (อยู่นอกตัวอาคาร ไม่ใช่ทางเดินในโรง) */
export interface FloorRoad {
  id: string;
  /** จุดศูนย์กลาง */
  x: number;
  z: number;
  width: number;
  depth: number;
  horizontal: boolean;
  kind: FloorRoadKind;
}

/** ผลลัพธ์ผังโรงงานทั้งหมด — ทุกพิกัดเป็นพิกัดโลกสัมบูรณ์ และจัดกึ่งกลางที่จุดกำเนิด */
export interface FloorLayout {
  zones: FloorZone[];
  lines: FloorLine[];
  slots: FloorSlot[];
  props: FloorProp[];
  aisles: FloorAisle[];
  /** อาคารทุกหลังบนพื้นที่โรงงาน */
  buildings: FloorBuilding[];
  /** ถนนภายในพื้นที่โรงงาน */
  roads: FloorRoad[];
  /** ขอบเขตพื้นที่ที่ล้อมด้วยรั้ว (อาคาร + ถนน + ลาน + ระยะเผื่อรั้ว) */
  site: { width: number; depth: number; fencePadding: number };
  /** = site.width / site.depth */
  width: number;
  depth: number;
  /** ระยะกล้องเริ่มต้นที่กรอบผังได้พอดี */
  suggestedCameraDistance: number;
  /**
   * id ของโรงที่กล้องควรเล็งเป็นค่าเริ่มต้น (null เมื่อไม่มีเครื่องจักร)
   * เลือกแบบกำหนดผลได้แน่นอนด้วย `pickFocusZoneId`
   */
  focusZoneId: string | null;
  /** id ของอาคารที่บรรจุ `focusZoneId` (null เมื่อไม่มี) */
  focusBuildingId: string | null;
}

// ---------------------------------------------------------------------------
// ค่าคงที่เชิงเรขาคณิต
// ---------------------------------------------------------------------------

/** จำนวนเครื่องสูงสุดต่อไลน์ (7 ตัวต่อฝั่ง) */
const LINE_CAPACITY = 14;
/** ระยะพิตช์ตามแนวสายพาน (เมตร) */
const LINE_PITCH = 3.0;
/** ช่องว่างขั้นต่ำระหว่างเครื่องที่อยู่ติดกันในฝั่งเดียวกัน */
const MIN_MACHINE_GAP = 0.6;
/** ระยะจากแกนสายพานถึงจุดศูนย์กลางเครื่อง */
const SPINE_OFFSET = 2.3;
/** ระยะระหว่างแกนสายพานของไลน์ที่อยู่ติดกัน */
const LINE_SPACING = 7.5;
/** ความกว้างสูงสุดของทางเดินภายในโรงระหว่างไลน์ (ถูกบีบตามที่ว่างจริง) */
const WALKWAY_WIDTH = 2.2;
/** ระยะยื่นของสายพานเลยเครื่องตัวแรก/ตัวสุดท้าย */
const SPINE_LEAD = 1.5;
/** ช่องว่างระหว่างคอลัมน์ของไลน์ภายในโรงเดียวกัน */
const COLUMN_GAP = 4.0;
/** ขอบว่างรอบเนื้อหาภายในโรง */
const HALL_PADDING = 3.0;
/** แถบว่างภายในอาคารระหว่างผนังกับขอบโรงผลิต (ที่อยู่ของชั้นวาง/ท่าขึ้นสินค้า/ออฟฟิศ) */
const BUILDING_INNER_CLEARANCE = 6.0;
/** ความสูงผนังอาคาร */
const WALL_HEIGHT = 12;
/** ระยะห่างโดยประมาณของแนวโครงถักหลังคา */
const TRUSS_SPACING = 14;
/** ระยะห่างของตะแกรงเสาโครงสร้าง */
const PILLAR_SPACING = 12;
/** ความกว้างถนนหลักระหว่างแถวอาคาร */
const MAIN_ROAD_WIDTH = 14;
/** ความกว้างถนนบริการระหว่างคอลัมน์อาคาร */
const SERVICE_ROAD_WIDTH = 8;
/** ระยะจากเนื้อหาในพื้นที่โรงงานถึงแนวรั้ว */
const FENCE_PADDING = 10;
/** ขอบว่างด้านหน้า (ลานวัสดุ + ลานจอดรถ) วัดจากถนนหลักด้านหน้าถึงขอบเนื้อหา */
const APRON_MARGIN = 3;
/** ความลึกของแถบลานวางวัสดุกลางแจ้ง */
const YARD_DEPTH = 12;
/** ความกว้างของลานวางวัสดุกลางแจ้ง */
const YARD_WIDTH = 18;
/** ช่องว่างระหว่างแถบลานวัสดุกับแถบลานจอดรถ */
const APRON_GAP = 4;
/** ความลึกของแผ่นพื้นลานจอดรถ */
const PARKING_DEPTH = 14;
/** ความกว้างของแผ่นพื้นลานจอดรถ */
const PARKING_WIDTH = 26;
/** ความลึกรวมของลานด้านหน้า */
const APRON_DEPTH = APRON_MARGIN + YARD_DEPTH + APRON_GAP + PARKING_DEPTH + APRON_MARGIN;
/** ระยะห่างระหว่างต้นไม้ริมรั้ว */
const TREE_SPACING = 9;
/** ขนาดฐานของต้นไม้หนึ่งต้น */
const TREE_SIZE = 3;
/** ความยาวของแผงรั้วหนึ่งแผง */
const FENCE_SEGMENT = 12;
/** ความกว้างอาคารสำนักงาน (ของประดับฉาก): กว้างพอให้ดูเป็นอาคารบริหารจริงจัง */
const OFFICE_BLOCK_WIDTH = 34;
/** ความลึกอาคารสำนักงาน */
const OFFICE_BLOCK_DEPTH = 18;
/** ความสูงอาคารสำนักงาน: สูงกว่า WALL_HEIGHT (12 ม.) ของโรงผลิตและป้อมยาม
 * เพื่อให้ดูเป็นตึกสำนักงาน 3–4 ชั้น แยกออกจากอาคารผลิตอย่างชัดเจน */
const OFFICE_BLOCK_HEIGHT = 14;
/** ความลึกลานพลาซ่าหน้าอาคารสำนักงาน (กว้างเท่าตัวอาคาร) */
const OFFICE_PLAZA_DEPTH = 10;
/** ระยะเว้นจากถนนทางเข้า/ประตูถึงขอบอาคารสำนักงาน กันไม่ให้ล้ำเขตประตู */
const OFFICE_SIDE_CLEARANCE = 4;
/** ความสูงเสาธงหน้าลานพลาซ่า */
const FLAGPOLE_HEIGHT = 9;
/** ความสูงแนวรั้วต้นไม้เตี้ยขอบลานพลาซ่า */
const HEDGE_HEIGHT = 0.8;
/** ความกว้างป้ายชื่อไลน์ผลิต (ข้ามแนวสายพาน) */
const LINE_SIGN_WIDTH = 2.2;
/** ความหนาแผ่นป้ายชื่อไลน์ */
const LINE_SIGN_DEPTH = 0.3;
/** ความสูงป้ายชื่อไลน์ (รวมเสา) — ยกพ้นหัวคนเดินและมองเห็นข้ามเครื่องจักรได้ */
const LINE_SIGN_HEIGHT = 3.6;
/** ระยะจากปลายสายพาน (spineX1) ถึงป้าย กันไม่ให้ทับเครื่องจักรตัวแรก */
const LINE_SIGN_GAP = 0.9;
/** จำนวนป้ายไลน์สูงสุดทั้งผัง กันโรงงานใหญ่มากไม่ให้มีป้ายเป็นร้อย */
const LINE_SIGN_MAX = 60;
/** ความกว้างอาคารเสริม (โรงอาหาร/ธุรการ) ข้างอาคารสำนักงานหลัก — เล็กกว่าตึกหลักชัดเจน */
const OFFICE_ANNEX_WIDTH = 16;
/** ความลึกอาคารเสริม */
const OFFICE_ANNEX_DEPTH = 12;
/** ความสูงอาคารเสริม — เตี้ยกว่าตึกสำนักงานหลัก (ชั้นเดียว-สองชั้น) */
const OFFICE_ANNEX_HEIGHT = 6;
/** ช่องว่างระหว่างอาคารสำนักงานหลักกับอาคารเสริม */
const OFFICE_ANNEX_GAP = 5;
/** ความกว้างทางเดิน/ที่จอดรถมีหลังคาหน้าอาคารสำนักงาน */
const CAR_PORCH_WIDTH = 10;
/** ความลึกทางเดินมีหลังคา (ยื่นจากตัวอาคาร) */
const CAR_PORCH_DEPTH = 4;
/** ความสูงหลังคาทางเดิน — เตี้ยพอดีรถวิ่งลอด */
const CAR_PORCH_HEIGHT = 2.8;
/** ระยะห่างเสาไฟถนนตามแนวถนนหลัก */
const LIGHT_POLE_SPACING = 20;
/** ขนาดฐานเสาไฟ */
const LIGHT_POLE_SIZE = 0.35;
/** ความสูงเสาไฟถนน */
const LIGHT_POLE_HEIGHT = 6.5;
/** ระยะเสาไฟจากขอบถนนหลัก กันไม่ให้ล้ำเข้าไปในผิวถนน */
const LIGHT_POLE_OFFSET = 1.0;
/**
 * เพดานจำนวน prop รวม เพื่อให้ฉาก 3D ไม่หนักเกินไป
 * ถ้าโรงงานใหญ่มากจะบางต้นไม้ (tree) ลังสินค้า (crate) และเสา (pillar) ตามลำดับ
 */
const PROP_CAP = 900;
const UNASSIGNED_LABEL = "ไม่ระบุโซน";
const UNASSIGNED_ID = "UNASSIGNED";
/** ตัวอักษรใช้ตั้งชื่ออาคารที่ไม่มีชื่อ factoryGroup ("โรง A", "โรง B", …) */
const BUILDING_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * สัดส่วนกว้าง:ลึก ที่ผังโรงงานเล็งไว้ (≈3:2) กล้อง FOV 50° จะกรอบได้พอดี
 * ไม่เหลือขอบว่างมาก
 */
const TARGET_ASPECT = 1.5;

// ค่าอ้างอิงสำหรับจัดกรอบกล้อง ฉากจะคำนวณใหม่ตาม viewport จริง
// ค่าเหล่านี้ทำให้ `suggestedCameraDistance` สมจริงสำหรับพรีเซ็ต "iso" ที่ 16:9
const CAMERA_FOV_DEG = 50;
const CAMERA_ASPECT = 16 / 9;
const CAMERA_MARGIN = 1.1;
/** ทิศจากศูนย์กลางผังไปยังกล้องของพรีเซ็ต "iso" */
const ISO_DIR: readonly [number, number, number] = [0.9, 0.78, 0.9];
/** ความสูงเนื้อหาบนพื้นที่ใช้จัดกรอบกล้อง (คงค่าเดิมไว้ ไม่ให้กรอบภาพเปลี่ยน) */
const FLOOR_CONTENT_HEIGHT = 3.2;

/**
 * ระยะกล้องที่น้อยสุดตามทิศ `dir` ที่กล่อง `width × height × depth`
 * ซึ่งวางกึ่งกลางจุดกำเนิด (ฐานที่ y = 0) ยังอยู่ในกรวยภาพครบ คูณด้วย `margin`
 *
 * คำนวณจากมุมกล่องที่ฉายจริง ไม่ใช่ทรงกลมล้อม เพราะทรงกลมล้อมผัง 3:2
 * จะเกินไปเกือบสองเท่า ทำให้เครื่องจักรเล็กเป็นจุดที่ขอบฟ้า
 */
function fitCameraDistance(
  width: number,
  depth: number,
  height: number,
  dir: readonly [number, number, number],
  fovDeg: number,
  aspect: number,
  margin: number
): number {
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const zx = dir[0] / len;
  const zy = dir[1] / len;
  const zz = dir[2] / len;

  // ฐานพิกัดกล้อง: z ชี้จากเป้าหมายไปทางกล้อง
  const horiz = Math.hypot(zx, zz);
  const xx = horiz > 1e-4 ? zz / horiz : 1;
  const xy = 0;
  const xz = horiz > 1e-4 ? -zx / horiz : 0;
  // up' = z × x
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const tanV = Math.tan((fovDeg * Math.PI) / 360);
  const tanH = tanV * aspect;

  const hw = width / 2;
  const hd = depth / 2;
  let needed = 0;

  for (let sx = -1; sx <= 1; sx += 2) {
    for (let sz = -1; sz <= 1; sz += 2) {
      for (let sy = 0; sy <= 1; sy += 1) {
        const px = sx * hw;
        const py = sy * height;
        const pz = sz * hd;
        const cx = px * xx + py * xy + pz * xz;
        const cy = px * yx + py * yy + pz * yz;
        const cz = px * zx + py * zy + pz * zz;
        const byH = cz + Math.abs(cx) / tanH;
        const byV = cz + Math.abs(cy) / tanV;
        if (byH > needed) needed = byH;
        if (byV > needed) needed = byV;
      }
    }
  }

  return needed * margin;
}

const STATUS_RANK: Record<MachineStatus, number> = {
  error: 3,
  warning: 2,
  maintenance: 1,
  normal: 0,
};

/**
 * เลือกโรงที่ "สำคัญที่สุด" เพื่อใช้เป็นเป้าหมายกล้องเริ่มต้น
 *
 * ลำดับการตัดสิน (กำหนดผลได้แน่นอน ไม่พึ่งเวลา/สุ่ม):
 * 1. โรงที่มีเครื่องสถานะ `error` มากที่สุด
 * 2. ถ้าไม่มีโรงใดมี error เลย → โรงที่มีเครื่องสถานะ `warning` มากที่สุด
 * 3. ถ้าไม่มีทั้งสองอย่าง → โรงที่มีเครื่องจักรมากที่สุด
 * เสมอกันตัดสินด้วย id (เรียงตัวอักษร) เพื่อให้ผลลัพธ์ซ้ำได้ทุกครั้ง
 */
export function pickFocusZoneId(zones: readonly FloorZone[]): string | null {
  if (zones.length === 0) return null;

  const bestBy = (score: (zone: FloorZone) => number): FloorZone | null => {
    let best: FloorZone | null = null;
    let bestScore = 0;
    for (const zone of zones) {
      const value = score(zone);
      if (value <= 0) continue;
      if (value > bestScore || (value === bestScore && best !== null && zone.id < best.id)) {
        best = zone;
        bestScore = value;
      }
    }
    return best;
  };

  const zone =
    bestBy((z) => z.counts.error ?? 0) ??
    bestBy((z) => z.counts.warning ?? 0) ??
    bestBy((z) => z.machineCount);
  return zone?.id ?? zones[0]?.id ?? null;
}

/** แฮชสตริงแบบ djb2 ที่กำหนดผลได้แน่นอน (ไม่ติดลบ) */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33 + value.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function slugify(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9฀-๿]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** ตัดช่องว่างหัวท้ายและยุบช่องว่างภายใน ให้ป้ายที่เกือบเหมือนกันคีย์เป็นโซนเดียว */
function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** ป้ายชื่อโซนของเครื่องจักร (export ไว้ให้ HUD เรียกใช้ซ้ำ) */
export function zoneKeyForMachine(machine: Machine): { id: string; label: string } {
  const raw =
    machine.factoryGroup ??
    machine.section ??
    machine.departmentCode ??
    machine.location ??
    machine.category ??
    null;

  const trimmed = raw?.trim();
  if (!trimmed) {
    return { id: UNASSIGNED_ID, label: UNASSIGNED_LABEL };
  }

  const id = slugify(trimmed) || UNASSIGNED_ID;
  return { id, label: trimmed };
}

// ---------------------------------------------------------------------------
// การจำแนก archetype
// ---------------------------------------------------------------------------

interface Footprint {
  width: number;
  depth: number;
  height: number;
}

/** ขนาดฐานอ้างอิงของแต่ละ archetype (จะสุ่มแปรผันเล็กน้อยจากแฮช id) */
const ARCHETYPE_FOOTPRINTS: Record<MachineArchetype, Footprint> = {
  cnc: { width: 2.4, depth: 2.0, height: 2.6 },
  press: { width: 2.2, depth: 2.2, height: 4.2 },
  furnace: { width: 3.4, depth: 2.0, height: 2.6 },
  assembly: { width: 2.6, depth: 1.6, height: 1.5 },
  robot: { width: 1.6, depth: 1.6, height: 2.2 },
  tank: { width: 2.0, depth: 2.0, height: 3.0 },
  inspection: { width: 2.2, depth: 2.0, height: 2.4 },
  packing: { width: 2.4, depth: 2.0, height: 2.0 },
};

/**
 * คีย์เวิร์ดจำแนกประเภท (ไทย + อังกฤษ) เรียงจากเฉพาะเจาะจงไปกว้าง
 * — "assembly" อยู่ท้ายสุดเพราะคำว่า "line" กว้างเกินไป
 */
const ARCHETYPE_PATTERNS: ReadonlyArray<{ archetype: MachineArchetype; pattern: RegExp }> = [
  { archetype: "cnc", pattern: /cnc|mill|lathe|machining|grind|กัด|กลึง|เจียร/i },
  { archetype: "press", pattern: /press|stamp|punch|ปั๊ม|อัด|เพรส/i },
  // "อบ" เดี่ยว ๆ กว้างเกินไป (คำว่า "เคลือบ" ก็มี "อบ" อยู่ข้างใน)
  // จึงจับเฉพาะรูปที่ชัดเจน
  { archetype: "furnace", pattern: /furnace|oven|heat|dry|เตา|อบชุบ|อบแห้ง|อบสี|ตู้อบ/i },
  { archetype: "robot", pattern: /robot|arm|weld|หุ่นยนต์|แขนกล|เชื่อม/i },
  { archetype: "tank", pattern: /tank|plating|coat|mix|paint|ถัง|ชุบ|เคลือบ|ผสม|พ่นสี/i },
  { archetype: "inspection", pattern: /inspect|test|qc|measure|ตรวจ|วัด|ทดสอบ/i },
  { archetype: "packing", pattern: /pack|pallet|wrap|บรรจุ|แพ็ค|ห่อ|ซีล/i },
  { archetype: "assembly", pattern: /assembly|assemble|line|ประกอบ|ติดตั้ง/i },
];

/**
 * ตารางถ่วงน้ำหนักสำหรับเครื่องที่ไม่เข้าคีย์เวิร์ดใดเลย
 * เอียงไปทาง cnc และ assembly เพื่อให้ผังที่ไม่มีป้ายกำกับยังดูหลากหลาย
 */
const FALLBACK_ARCHETYPES: readonly MachineArchetype[] = [
  "cnc",
  "cnc",
  "cnc",
  "cnc",
  "assembly",
  "assembly",
  "assembly",
  "assembly",
  "press",
  "robot",
  "inspection",
  "packing",
];

/** จำแนก archetype จากข้อมูลจริงของเครื่อง (กำหนดผลได้แน่นอน) */
function archetypeFor(machine: Machine): MachineArchetype {
  const haystack = [machine.category, machine.productionName, machine.model, machine.name]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ");

  for (const { archetype, pattern } of ARCHETYPE_PATTERNS) {
    if (pattern.test(haystack)) return archetype;
  }

  const hash = hashString(machine.id);
  return FALLBACK_ARCHETYPES[hash % FALLBACK_ARCHETYPES.length] ?? "cnc";
}

/** ขนาดฐานของเครื่องหนึ่งตัว = ขนาดอ้างอิงของ archetype + ความแปรผันจากแฮช id */
function footprintFor(archetype: MachineArchetype, id: string): Footprint {
  const base = ARCHETYPE_FOOTPRINTS[archetype];
  const hash = hashString(`${id}|dim`);
  const planScale = 1 + (((hash % 7) - 3) * 0.02);
  const heightScale = 1 + ((((hash >>> 3) % 9) - 4) * 0.03);
  return {
    width: round3(base.width * planScale),
    depth: round3(base.depth * planScale),
    height: round3(base.height * heightScale),
  };
}

// ---------------------------------------------------------------------------
// ตัวช่วยตรวจการทับซ้อน
// ---------------------------------------------------------------------------

interface Rect {
  x: number;
  z: number;
  width: number;
  depth: number;
}

function rectsOverlap(a: Rect, b: Rect, pad: number): boolean {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 + pad &&
    Math.abs(a.z - b.z) < (a.depth + b.depth) / 2 + pad
  );
}

/** ตะแกรงเชิงพื้นที่แบบง่าย ใช้ตรวจการทับซ้อนของสี่เหลี่ยมจำนวนมากอย่างรวดเร็ว */
class RectIndex {
  private readonly cell: number;
  private readonly buckets = new Map<string, Rect[]>();

  constructor(cell = 10) {
    this.cell = cell;
  }

  insert(rect: Rect): void {
    const minCx = Math.floor((rect.x - rect.width / 2) / this.cell);
    const maxCx = Math.floor((rect.x + rect.width / 2) / this.cell);
    const minCz = Math.floor((rect.z - rect.depth / 2) / this.cell);
    const maxCz = Math.floor((rect.z + rect.depth / 2) / this.cell);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const key = `${cx}|${cz}`;
        const bucket = this.buckets.get(key);
        if (bucket) bucket.push(rect);
        else this.buckets.set(key, [rect]);
      }
    }
  }

  /** true เมื่อ `rect` (ขยายด้วย `pad`) ทับกับสี่เหลี่ยมที่เคยใส่ไว้ */
  hits(rect: Rect, pad: number): boolean {
    const minCx = Math.floor((rect.x - rect.width / 2 - pad) / this.cell);
    const maxCx = Math.floor((rect.x + rect.width / 2 + pad) / this.cell);
    const minCz = Math.floor((rect.z - rect.depth / 2 - pad) / this.cell);
    const maxCz = Math.floor((rect.z + rect.depth / 2 + pad) / this.cell);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const bucket = this.buckets.get(`${cx}|${cz}`);
        if (!bucket) continue;
        for (const other of bucket) {
          if (rectsOverlap(rect, other, pad)) return true;
        }
      }
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// โครงสร้างชั่วคราวระหว่างจัดผัง
// ---------------------------------------------------------------------------

interface ZoneAccumulator {
  id: string;
  label: string;
  machines: Machine[];
  counts: Record<MachineStatus, number>;
}

function emptyCounts(): Record<MachineStatus, number> {
  return { normal: 0, warning: 0, maintenance: 0, error: 0 };
}

interface LocalSlot {
  machine: Machine;
  localX: number;
  localZ: number;
  rotationY: number;
  width: number;
  depth: number;
  height: number;
  archetype: MachineArchetype;
  indexInZone: number;
  indexInLine: number;
  side: -1 | 1;
}

interface LineBuild {
  id: string;
  label: string;
  indexInHall: number;
  slots: LocalSlot[];
  /** ปลายสายพานในพิกัดภายในโรง */
  spineX1: number;
  spineX2: number;
  spineLocalZ: number;
  /** ครึ่งความลึกสูงสุดของเครื่องแต่ละฝั่ง (ใช้วางทางเดินให้ไม่ทับเครื่อง) */
  halfDepthMinus: number;
  halfDepthPlus: number;
  counts: Record<MachineStatus, number>;
}

interface HallBuild {
  zone: ZoneAccumulator;
  lines: LineBuild[];
  width: number;
  depth: number;
  /** ทางเดินภายในโรงในพิกัดภายใน */
  walkways: Array<{
    x: number;
    z: number;
    width: number;
    depth: number;
    horizontal: boolean;
    /** true = ถนนหลัก (ทางหลักของ AGV) เช่น ช่องว่างระหว่างคอลัมน์ไลน์ */
    main: boolean;
  }>;
}

/**
 * จัดไลน์ทั้งหมดของโรงหนึ่งหลัง แล้วคืนขนาดโรง
 * พิกัดภายในมีจุดกำเนิดที่มุมซ้าย-หน้าของ "เนื้อหา" แล้วถูกเลื่อนให้กึ่งกลางทีหลัง
 */
function buildHall(zone: ZoneAccumulator): HallBuild {
  const chunks: Machine[][] = [];
  for (let i = 0; i < zone.machines.length; i += LINE_CAPACITY) {
    chunks.push(zone.machines.slice(i, i + LINE_CAPACITY));
  }

  // จัดไลน์เป็นคอลัมน์ เพื่อให้โรงหนึ่งหลังไม่ยาวลึกผิดสัดส่วน
  // aspect ≈ (cols * cellW) / ((n/cols) * LINE_SPACING) → cols = sqrt(aspect * n * LINE_SPACING / cellW)
  const estimatedLineWidth = 7 * LINE_PITCH + 2 * SPINE_LEAD;
  const lineCount = chunks.length;
  const columns = Math.max(
    1,
    Math.min(
      lineCount,
      Math.round(Math.sqrt((TARGET_ASPECT * lineCount * LINE_SPACING) / estimatedLineWidth)) || 1
    )
  );
  const perColumn = Math.ceil(lineCount / columns);

  // สร้างไลน์ในพิกัดตั้งต้น (สายพานเริ่มที่ x = 0, แกนสายพานที่ z = 0)
  const lines: LineBuild[] = [];
  let machineIndexInZone = 0;
  chunks.forEach((chunk, lineIndex) => {
    const lineId = `${zone.id}_L${lineIndex + 1}`;
    let cursorMinus = 0;
    let cursorPlus = 0;
    const slots: LocalSlot[] = [];
    const counts = emptyCounts();
    let halfDepthMinus = 0;
    let halfDepthPlus = 0;
    let maxRight = 0;

    chunk.forEach((machine, indexInLine) => {
      const side: -1 | 1 = indexInLine % 2 === 0 ? -1 : 1;
      const archetype = archetypeFor(machine);
      const { width, depth, height } = footprintFor(archetype, machine.id);
      const localX = (side === -1 ? cursorMinus : cursorPlus) + width / 2;
      // เครื่องยาวกว่าพิตช์ (เช่น เตาอบ 3.4 ม.) ต้องกินระยะเพิ่ม ไม่งั้นทับตัวถัดไป
      const step = Math.max(LINE_PITCH, width + MIN_MACHINE_GAP);
      if (side === -1) cursorMinus += step;
      else cursorPlus += step;
      maxRight = Math.max(maxRight, localX + width / 2);
      // หันหน้าเข้าหาสายพาน: ฝั่งลบหันไป +Z (rotationY 0), ฝั่งบวกหันไป -Z (rotationY π)
      const rotationY = side === -1 ? 0 : Math.PI;
      const localZ = side * SPINE_OFFSET;
      if (side === -1) halfDepthMinus = Math.max(halfDepthMinus, depth / 2);
      else halfDepthPlus = Math.max(halfDepthPlus, depth / 2);
      counts[machine.status] = (counts[machine.status] ?? 0) + 1;
      slots.push({
        machine,
        localX,
        localZ,
        rotationY,
        width,
        depth,
        height,
        archetype,
        indexInZone: machineIndexInZone,
        indexInLine,
        side,
      });
      machineIndexInZone += 1;
    });

    lines.push({
      id: lineId,
      label: `ไลน์ ${lineIndex + 1}`,
      indexInHall: lineIndex,
      slots,
      spineX1: -SPINE_LEAD,
      spineX2: maxRight + SPINE_LEAD,
      spineLocalZ: 0,
      halfDepthMinus,
      halfDepthPlus,
      counts,
    });
  });

  // ความกว้างของแต่ละคอลัมน์ = ความยาวสายพานที่มากสุดในคอลัมน์นั้น
  const columnWidths: number[] = [];
  for (const line of lines) {
    const col = Math.floor(line.indexInHall / perColumn);
    const span = line.spineX2 - line.spineX1;
    columnWidths[col] = Math.max(columnWidths[col] ?? 0, span);
  }
  const columnOriginX: number[] = [];
  let cursorX = 0;
  for (let col = 0; col < columnWidths.length; col++) {
    columnOriginX[col] = cursorX;
    cursorX += (columnWidths[col] ?? 0) + COLUMN_GAP;
  }
  const contentWidth = cursorX - COLUMN_GAP;

  // วางไลน์ลงคอลัมน์/แถว
  for (const line of lines) {
    const col = Math.floor(line.indexInHall / perColumn);
    const row = line.indexInHall % perColumn;
    const shiftX = (columnOriginX[col] ?? 0) + SPINE_LEAD;
    const spineZ = row * LINE_SPACING;
    line.spineX1 += shiftX;
    line.spineX2 += shiftX;
    line.spineLocalZ = spineZ;
    for (const slot of line.slots) {
      slot.localX += shiftX;
      slot.localZ += spineZ;
    }
  }

  let minZ = 0;
  let maxZ = 0;
  for (const line of lines) {
    minZ = Math.min(minZ, line.spineLocalZ - SPINE_OFFSET - line.halfDepthMinus);
    maxZ = Math.max(maxZ, line.spineLocalZ + SPINE_OFFSET + line.halfDepthPlus);
  }

  // ทางเดินภายในโรง: ระหว่างไลน์ที่ติดกันในคอลัมน์เดียวกัน + ช่องว่างระหว่างคอลัมน์
  const walkways: HallBuild["walkways"] = [];
  for (const line of lines) {
    const col = Math.floor(line.indexInHall / perColumn);
    const row = line.indexInHall % perColumn;
    if (row === 0) continue;
    const previous = lines[line.indexInHall - 1];
    if (!previous) continue;
    const lo = previous.spineLocalZ + SPINE_OFFSET + previous.halfDepthPlus;
    const hi = line.spineLocalZ - SPINE_OFFSET - line.halfDepthMinus;
    if (hi - lo < 0.3) continue;
    walkways.push({
      x: (columnOriginX[col] ?? 0) + (columnWidths[col] ?? 0) / 2,
      z: (lo + hi) / 2,
      width: columnWidths[col] ?? 0,
      // สเปคขอทางเดิน 2.2 ม. แต่ระยะไลน์ 7.5 ม. หัก offset 2.3 ม. สองข้าง
      // เหลือที่ว่างจริงไม่ถึง — บีบให้พอดีที่ว่างเพื่อไม่ให้แถบทางเดินทับเครื่อง
      depth: Math.min(WALKWAY_WIDTH, hi - lo),
      horizontal: true,
      // ทางเดินระหว่างไลน์ในคอลัมน์เดียวกัน — ทางเดินคนงานแคบ ไม่ใช่ทางหลัก AGV
      main: false,
    });
  }
  // ช่องว่างระหว่างคอลัมน์ (COLUMN_GAP) คือทางเดินโล่งจริงที่ไม่มีเครื่องจักรวางทับ
  // ใช้เป็นทางหลักของ AGV (main: true) ต่างจากทางเดินคนงานแคบระหว่างไลน์ในคอลัมน์เดียวกัน
  for (let col = 1; col < columnWidths.length; col++) {
    walkways.push({
      x: (columnOriginX[col] ?? 0) - COLUMN_GAP / 2,
      z: (minZ + maxZ) / 2,
      width: COLUMN_GAP,
      depth: maxZ - minZ,
      horizontal: false,
      main: true,
    });
  }
  // โรงคอลัมน์เดียว: ไม่มีช่องว่างระหว่างคอลัมน์ให้เป็นทางหลัก — แทนที่ด้วยทางเดินขวาง
  // ปลายไลน์ (end-of-line cross walkway) ที่ใช้ระยะโล่งจริงหลังเครื่องตัวสุดท้าย
  // (SPINE_LEAD) ต่อกับขอบว่างภายในโรง (HALL_PADDING) ซึ่งไม่มีเครื่องจักร/prop วางทับ
  // แน่นอนอยู่แล้ว จึงไม่มีความเสี่ยงทับเครื่อง
  if (columnWidths.length <= 1 && lines.length > 1) {
    const lastColWidth = columnWidths[0] ?? 0;
    const clearStart = lastColWidth - SPINE_LEAD; // ขอบขวาสุดของเครื่องจักรจริง (ทุกไลน์)
    const clearEnd = contentWidth + HALL_PADDING; // ขอบโรงหลัง HALL_PADDING (ไม่มีเครื่อง/prop)
    const clearMargin = clearEnd - clearStart;
    if (clearMargin >= WALKWAY_WIDTH) {
      const artWidth = Math.min(COLUMN_GAP, clearMargin);
      walkways.push({
        x: clearStart + artWidth / 2,
        z: (minZ + maxZ) / 2,
        width: artWidth,
        depth: maxZ - minZ,
        horizontal: false,
        main: true,
      });
    }
  }

  // เลื่อนพิกัดภายในให้กึ่งกลางโรงอยู่ที่ (0, 0)
  const centreX = contentWidth / 2;
  const centreZ = (minZ + maxZ) / 2;
  for (const line of lines) {
    line.spineX1 -= centreX;
    line.spineX2 -= centreX;
    line.spineLocalZ -= centreZ;
    for (const slot of line.slots) {
      slot.localX -= centreX;
      slot.localZ -= centreZ;
    }
  }
  for (const walkway of walkways) {
    walkway.x -= centreX;
    walkway.z -= centreZ;
  }

  return {
    zone,
    lines,
    width: contentWidth + HALL_PADDING * 2,
    depth: maxZ - minZ + HALL_PADDING * 2,
    walkways,
  };
}

// ---------------------------------------------------------------------------
// การจัดวางอาคารบนพื้นที่โรงงาน
// ---------------------------------------------------------------------------

/** อาคารหนึ่งหลังระหว่างคำนวณ (ยังไม่รู้พิกัดบนพื้นที่) */
interface BuildingBuild {
  hall: HallBuild;
  /** ขนาดเปลือกอาคาร = ขนาดโรง + แถบว่างภายใน 6 ม. รอบด้าน */
  width: number;
  depth: number;
}

/** ผลของการจัดตะแกรงอาคาร */
interface GridPlan {
  cols: number;
  rows: number;
  colWidths: number[];
  rowDepths: number[];
  /** ความกว้าง/ลึกของตะแกรงอาคารรวมถนนคั่น */
  width: number;
  depth: number;
}

/**
 * จัดอาคารลงตะแกรง `cols × rows` โดยคอลัมน์คั่นด้วยถนนบริการ 8 ม.
 * และแถวคั่นด้วยถนนหลัก 14 ม.
 */
function planGrid(buildings: readonly BuildingBuild[], cols: number): GridPlan {
  const rows = Math.ceil(buildings.length / cols);
  const colWidths: number[] = new Array<number>(cols).fill(0);
  const rowDepths: number[] = new Array<number>(rows).fill(0);
  buildings.forEach((building, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    colWidths[col] = Math.max(colWidths[col] ?? 0, building.width);
    rowDepths[row] = Math.max(rowDepths[row] ?? 0, building.depth);
  });
  const width =
    colWidths.reduce((sum, value) => sum + value, 0) + (cols - 1) * SERVICE_ROAD_WIDTH;
  const depth = rowDepths.reduce((sum, value) => sum + value, 0) + (rows - 1) * MAIN_ROAD_WIDTH;
  return { cols, rows, colWidths, rowDepths, width, depth };
}

/**
 * ค้นหาจำนวนคอลัมน์ที่ทำให้สัดส่วนพื้นที่โรงงานรวม (ตะแกรง + ถนนหน้า + ลานหน้า)
 * ใกล้ `TARGET_ASPECT` ที่สุด — วัดด้วยผลต่างเชิงลอการิทึมเหมือนเดิม
 */
function chooseGrid(buildings: readonly BuildingBuild[]): GridPlan {
  let best: GridPlan | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let cols = 1; cols <= buildings.length; cols++) {
    const plan = planGrid(buildings, cols);
    const totalDepth = plan.depth + MAIN_ROAD_WIDTH + APRON_DEPTH;
    const aspect = plan.width / Math.max(1, totalDepth);
    const score = Math.abs(Math.log(aspect / TARGET_ASPECT));
    if (score < bestScore - 1e-9) {
      bestScore = score;
      best = plan;
    }
  }
  return best ?? planGrid(buildings, 1);
}

/** ลดจำนวนสมาชิกให้ไม่เกิน `budget` โดยเลือกแบบเว้นระยะสม่ำเสมอ (กำหนดผลได้แน่นอน) */
function thin<T>(items: T[], budget: number): T[] {
  if (budget <= 0) return [];
  if (items.length <= budget) return items;
  const stride = Math.ceil(items.length / budget);
  const kept: T[] = [];
  for (let i = 0; i < items.length && kept.length < budget; i += stride) {
    const item = items[i];
    if (item !== undefined) kept.push(item);
  }
  return kept;
}

function emptyLayout(): FloorLayout {
  return {
    zones: [],
    lines: [],
    slots: [],
    props: [],
    aisles: [],
    buildings: [],
    roads: [],
    site: { width: 60, depth: 40, fencePadding: FENCE_PADDING },
    width: 60,
    depth: 40,
    suggestedCameraDistance: 40,
    focusZoneId: null,
    focusBuildingId: null,
  };
}

/** ตำแหน่ง X ของแนวโครงถักหลังคา ทุก ~14 ม. ตลอดความกว้างอาคาร (พิกัดสัมพัทธ์กับกลางอาคาร) */
function trussPositions(buildingWidth: number): number[] {
  const bays = Math.max(2, Math.round(buildingWidth / TRUSS_SPACING));
  const step = buildingWidth / bays;
  const positions: number[] = [];
  for (let i = 0; i <= bays; i++) {
    positions.push(round3(-buildingWidth / 2 + i * step));
  }
  return positions;
}

/**
 * สร้างผังพื้นที่โรงงานเสมือนจากรายการเครื่องจักร
 * — หนึ่ง `factoryGroup` = หนึ่งอาคาร วางบนพื้นที่ที่มีถนน รั้ว ป้อมยาม ลานจอดรถ และลานวัสดุ
 *
 * ทุกอย่างกำหนดผลได้แน่นอน (ไม่มี Math.random / เวลา) — ความแปรผันทั้งหมด
 * มาจากแฮชของ id ที่เสถียร ผลลัพธ์จัดกึ่งกลางที่จุดกำเนิดของโลก
 */
export function buildFloorLayout(machines: Machine[]): FloorLayout {
  if (machines.length === 0) return emptyLayout();

  // ---- 1. จับกลุ่มเครื่องเป็นโซน (คีย์ด้วยป้ายที่ normalize แล้ว) --------------
  // ใช้ป้ายดิบที่ตัดช่องว่างแล้วเป็นคีย์ ไม่ใช้ slug เพราะ "Line 1" กับ "Line-1"
  // slug เป็น "LINE_1" เหมือนกัน แต่ต้องไม่ยุบเป็นโซนเดียว
  const zoneMap = new Map<string, ZoneAccumulator>();
  for (const machine of machines) {
    const { label } = zoneKeyForMachine(machine);
    const key = normalizeLabel(label);
    let zone = zoneMap.get(key);
    if (!zone) {
      zone = { id: "", label, machines: [], counts: emptyCounts() };
      zoneMap.set(key, zone);
    }
    zone.machines.push(machine);
    zone.counts[machine.status] = (zone.counts[machine.status] ?? 0) + 1;
  }

  // กำหนด id ต่อโซนตามลำดับที่พบ และแก้การชนกันของ slug ให้ React key ไม่ซ้ำ
  const usedZoneIds = new Set<string>();
  for (const zone of zoneMap.values()) {
    const baseId = zone.label === UNASSIGNED_LABEL ? UNASSIGNED_ID : slugify(zone.label) || UNASSIGNED_ID;
    let candidateId = baseId;
    let suffix = 2;
    while (usedZoneIds.has(candidateId)) {
      candidateId = `${baseId}_${suffix}`;
      suffix += 1;
    }
    usedZoneIds.add(candidateId);
    zone.id = candidateId;
  }

  for (const zone of zoneMap.values()) {
    zone.machines.sort((a, b) => (a.code ?? a.name).localeCompare(b.code ?? b.name));
  }

  // ---- 2. จัดไลน์ภายในแต่ละโรง แล้วห่อเป็นอาคารหลังละหนึ่งโซน ------------------
  const halls = Array.from(zoneMap.values()).map(buildHall);
  const buildingBuilds: BuildingBuild[] = halls.map((hall) => ({
    hall,
    width: hall.width + BUILDING_INNER_CLEARANCE * 2,
    depth: hall.depth + BUILDING_INNER_CLEARANCE * 2,
  }));

  // เรียงอาคารใหญ่ไปเล็ก (เสมอกันตัดสินด้วย id) ให้ผังเสถียร
  buildingBuilds.sort((a, b) => {
    const diff = b.hall.zone.machines.length - a.hall.zone.machines.length;
    if (diff !== 0) return diff;
    return a.hall.zone.id.localeCompare(b.hall.zone.id);
  });

  // ---- 3. วางอาคารบนพื้นที่: ตะแกรงแถว/คอลัมน์ + ถนนหลัก/ถนนบริการ --------------
  const grid = chooseGrid(buildingBuilds);
  const colOriginX: number[] = [];
  {
    let cursor = 0;
    for (let col = 0; col < grid.cols; col++) {
      colOriginX[col] = cursor;
      cursor += (grid.colWidths[col] ?? 0) + SERVICE_ROAD_WIDTH;
    }
  }
  const rowOriginZ: number[] = [];
  {
    let cursor = 0;
    for (let row = 0; row < grid.rows; row++) {
      rowOriginZ[row] = cursor;
      cursor += (grid.rowDepths[row] ?? 0) + MAIN_ROAD_WIDTH;
    }
  }

  const gridWidth = grid.width;
  const gridDepth = grid.depth;
  /** ขอบบนของถนนหลักด้านหน้า */
  const frontRoadZ = gridDepth;
  /** ขอบบนของลานด้านหน้า */
  const apronTopZ = frontRoadZ + MAIN_ROAD_WIDTH;
  const contentWidth = gridWidth;
  const contentDepth = apronTopZ + APRON_DEPTH;

  const zones: FloorZone[] = [];
  const lines: FloorLine[] = [];
  const slots: FloorSlot[] = [];
  const aisles: FloorAisle[] = [];
  const roads: FloorRoad[] = [];
  const buildings: FloorBuilding[] = [];
  /** ข้อมูลอาคารระหว่างวาง prop (พิกัดก่อนจัดกึ่งกลาง) */
  const buildingRects: Array<
    Rect & { id: string; row: number; col: number; hall: HallBuild; hallRect: Rect }
  > = [];
  const hallRects: Array<Rect & { id: string; worstStatus: MachineStatus }> = [];

  let unnamedIndex = 0;
  buildingBuilds.forEach((build, index) => {
    const col = index % grid.cols;
    const row = Math.floor(index / grid.cols);
    const cellWidth = grid.colWidths[col] ?? build.width;
    const cellDepth = grid.rowDepths[row] ?? build.depth;
    const centreX = (colOriginX[col] ?? 0) + cellWidth / 2;
    // ชิดขอบล่างของเซลล์เสมอ เพื่อให้ทุกอาคารติดถนนหลักที่อยู่ใต้แถวนั้น
    // (แถวสุดท้ายติดถนนหลักด้านหน้า) และให้ท่าขึ้นลงสินค้าหันออกถนนพอดี
    const centreZ = (rowOriginZ[row] ?? 0) + cellDepth - build.depth / 2;
    const hall = build.hall;
    const worstStatus = worstStatusOf(hall.zone.counts);
    const label =
      hall.zone.label === UNASSIGNED_LABEL
        ? `โรง ${BUILDING_LETTERS[unnamedIndex] ?? String(unnamedIndex + 1)}`
        : hall.zone.label;
    if (hall.zone.label === UNASSIGNED_LABEL) unnamedIndex += 1;

    zones.push({
      id: hall.zone.id,
      label: hall.zone.label,
      x: centreX,
      z: centreZ,
      width: hall.width,
      depth: hall.depth,
      machineCount: hall.zone.machines.length,
      worstStatus,
      counts: hall.zone.counts,
      lineIds: hall.lines.map((line) => line.id),
    });
    hallRects.push({
      id: hall.zone.id,
      x: centreX,
      z: centreZ,
      width: hall.width,
      depth: hall.depth,
      worstStatus,
    });
    buildings.push({
      id: hall.zone.id,
      label,
      x: centreX,
      z: centreZ,
      width: round3(build.width),
      depth: round3(build.depth),
      wallHeight: WALL_HEIGHT,
      trussX: [],
      zoneIds: [hall.zone.id],
      machineCount: hall.zone.machines.length,
      worstStatus,
    });
    buildingRects.push({
      id: hall.zone.id,
      x: centreX,
      z: centreZ,
      width: build.width,
      depth: build.depth,
      row,
      col,
      hall,
      hallRect: { x: centreX, z: centreZ, width: hall.width, depth: hall.depth },
    });

    for (const line of hall.lines) {
      lines.push({
        id: line.id,
        zoneId: hall.zone.id,
        label: line.label,
        x1: round3(centreX + line.spineX1),
        z1: round3(centreZ + line.spineLocalZ),
        x2: round3(centreX + line.spineX2),
        z2: round3(centreZ + line.spineLocalZ),
        horizontal: true,
        machineCount: line.slots.length,
        worstStatus: worstStatusOf(line.counts),
      });
      for (const slot of line.slots) {
        slots.push({
          machine: slot.machine,
          x: round3(centreX + slot.localX),
          z: round3(centreZ + slot.localZ),
          rotationY: slot.rotationY,
          width: slot.width,
          depth: slot.depth,
          height: slot.height,
          zoneId: hall.zone.id,
          indexInZone: slot.indexInZone,
          archetype: slot.archetype,
          lineId: line.id,
          indexInLine: slot.indexInLine,
          side: slot.side,
        });
      }
    }

    hall.walkways.forEach((walkway, walkwayIndex) => {
      aisles.push({
        id: `${hall.zone.id}_W${walkwayIndex + 1}`,
        x: round3(centreX + walkway.x),
        z: round3(centreZ + walkway.z),
        width: round3(walkway.width),
        depth: round3(walkway.depth),
        horizontal: walkway.horizontal,
        main: walkway.main,
      });
    });
  });

  // ถนนหลักแนวนอนระหว่างแถวอาคาร + ถนนหลักด้านหน้าที่คั่นตะแกรงกับลานหน้า
  for (let row = 1; row < grid.rows; row++) {
    roads.push({
      id: `ROAD_MAIN_H${row}`,
      x: round3(gridWidth / 2),
      z: round3((rowOriginZ[row] ?? 0) - MAIN_ROAD_WIDTH / 2),
      width: round3(gridWidth),
      depth: MAIN_ROAD_WIDTH,
      horizontal: true,
      kind: "main",
    });
  }
  roads.push({
    id: "ROAD_MAIN_FRONT",
    x: round3(gridWidth / 2),
    z: round3(frontRoadZ + MAIN_ROAD_WIDTH / 2),
    width: round3(gridWidth),
    depth: MAIN_ROAD_WIDTH,
    horizontal: true,
    kind: "main",
  });

  // ถนนบริการแนวตั้งระหว่างคอลัมน์อาคาร (ทอดตลอดความลึกของตะแกรง)
  for (let col = 1; col < grid.cols; col++) {
    roads.push({
      id: `ROAD_SERVICE_V${col}`,
      x: round3((colOriginX[col] ?? 0) - SERVICE_ROAD_WIDTH / 2),
      z: round3(gridDepth / 2),
      width: SERVICE_ROAD_WIDTH,
      depth: round3(gridDepth),
      horizontal: false,
      kind: "service",
    });
  }

  // ถนนหลักทางเข้า: จากถนนหน้าลงไปจนถึงแนวรั้วด้านหน้า ปลายถนนคือประตูทางเข้า
  const gateX = gridWidth / 2;
  const entranceTopZ = frontRoadZ;
  const entranceBottomZ = contentDepth + FENCE_PADDING;
  roads.push({
    id: "ROAD_MAIN_ENTRANCE",
    x: round3(gateX),
    z: round3((entranceTopZ + entranceBottomZ) / 2),
    width: MAIN_ROAD_WIDTH,
    depth: round3(entranceBottomZ - entranceTopZ),
    horizontal: false,
    kind: "main",
  });

  const roadIndex = new RectIndex(16);
  for (const road of roads) {
    roadIndex.insert({ x: road.x, z: road.z, width: road.width, depth: road.depth });
  }
  const buildingIndex = new RectIndex(24);
  for (const rect of buildingRects) {
    buildingIndex.insert({ x: rect.x, z: rect.z, width: rect.width, depth: rect.depth });
  }

  // ---- 4. วัตถุประกอบฉาก (props) ทั้งหมดอยู่ในพิกัดก่อนจัดกึ่งกลาง ------------
  const machineIndex = new RectIndex(10);
  for (const slot of slots) {
    // rotationY เป็น 0 หรือ π เท่านั้น ดังนั้น AABB = width × depth
    machineIndex.insert({ x: slot.x, z: slot.z, width: slot.width, depth: slot.depth });
  }
  const propIndex = new RectIndex(10);
  const props: FloorProp[] = [];

  /** AABB ของ prop หลังหมุน (rotationY เป็น 0 หรือ π/2 เท่านั้น) */
  const propRect = (prop: FloorProp): Rect => {
    const swapped = Math.abs(Math.sin(prop.rotationY)) > 0.5;
    return {
      x: prop.x,
      z: prop.z,
      width: swapped ? prop.depth : prop.width,
      depth: swapped ? prop.width : prop.depth,
    };
  };

  interface PushOptions {
    /** ปฏิเสธถ้าทับตัวอาคาร (ใช้กับ prop ระดับพื้นที่โรงงาน) */
    avoidBuildings?: boolean;
    /** ปฏิเสธถ้าทับถนน */
    avoidRoads?: boolean;
  }

  /** ใส่ prop ถ้าไม่ทับเครื่องจักร/prop อื่น (และไม่ทับอาคาร/ถนน ตามที่ระบุ) */
  const tryPush = (prop: FloorProp, options: PushOptions = {}): boolean => {
    const rect = propRect(prop);
    if (machineIndex.hits(rect, 0.3)) return false;
    if (propIndex.hits(rect, 0.2)) return false;
    if (options.avoidBuildings === true && buildingIndex.hits(rect, 0.5)) return false;
    if (options.avoidRoads === true && roadIndex.hits(rect, 0.5)) return false;
    propIndex.insert(rect);
    props.push({ ...prop, x: round3(prop.x), z: round3(prop.z) });
    return true;
  };

  // ---- 4a. prop ภายในอาคารแต่ละหลัง (อยู่ในแถบว่าง 6 ม. เท่านั้น ไม่ล้นออกถนน) --
  for (const building of buildingRects) {
    const northZ = building.z - building.depth / 2;
    const southZ = building.z + building.depth / 2;
    const westX = building.x - building.width / 2;
    const hallNorthZ = building.hallRect.z - building.hallRect.depth / 2;
    const hallSouthZ = building.hallRect.z + building.hallRect.depth / 2;

    // office: บล็อกกว้าง 14 ม. ในแถบว่างด้านเหนือของอาคาร (ลึกไม่เกินแถบ 6 ม.)
    for (const depth of [5.2, 4.6, 4.0]) {
      let placed = false;
      for (let step = 0; step < 10; step++) {
        const candidate: FloorProp = {
          id: `OFFICE_${building.id}`,
          kind: "office",
          x: westX + 2 + 7 + step * 6,
          z: northZ + 0.6 + depth / 2,
          rotationY: 0,
          width: 14,
          depth,
          height: 4,
        };
        if (candidate.x + 7 > building.x + building.width / 2 - 2) break;
        if (candidate.z + depth / 2 > hallNorthZ - 0.5) break;
        if (tryPush(candidate)) {
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    // dock: 3–5 ท่าขึ้นลงสินค้าเรียงห่างเท่ากันบนขอบอาคารด้านใต้ (ฝั่งลานวัสดุ)
    const dockCount = Math.max(3, Math.min(5, Math.round(building.width / 45)));
    for (let i = 0; i < dockCount; i++) {
      const t = (i + 1) / (dockCount + 1);
      tryPush({
        id: `DOCK_${building.id}_${i + 1}`,
        kind: "dock",
        x: westX + t * building.width,
        z: southZ - 1.8,
        rotationY: 0,
        width: 4,
        depth: 3,
        height: 1.2,
      });
    }

    // rack: ชั้นวางเรียงชิดผนังด้านเหนือและด้านใต้ ทุก 7 ม.
    const rackStep = 7;
    const rackCount = Math.max(1, Math.floor((building.width - 6) / rackStep));
    const rackNorthZ = Math.min(northZ + 1.2, hallNorthZ - 1.0);
    const rackSouthZ = Math.max(southZ - 1.2, hallSouthZ + 1.0);
    for (let i = 0; i < rackCount; i++) {
      const x = westX + 3 + i * rackStep + 3;
      tryPush({
        id: `RACK_${building.id}_N${i + 1}`,
        kind: "rack",
        x,
        z: rackNorthZ,
        rotationY: 0,
        width: 6,
        depth: 1.2,
        height: 4.5,
      });
      tryPush({
        id: `RACK_${building.id}_S${i + 1}`,
        kind: "rack",
        x,
        z: rackSouthZ,
        rotationY: 0,
        width: 6,
        depth: 1.2,
        height: 4.5,
      });
    }
  }

  // sign: ป้ายชื่อโรงหนึ่งป้ายที่ทางเข้า (ขอบด้าน -Z ของโรง)
  for (const hall of hallRects) {
    tryPush({
      id: `SIGN_${hall.id}`,
      kind: "sign",
      x: hall.x,
      z: hall.z - hall.depth / 2 + 0.6,
      rotationY: 0,
      width: 3,
      depth: 0.35,
      height: 6,
    });
  }

  // fence (ในอาคาร): แนวกั้นเขตอันตรายล้อมโรงที่มีสถานะแย่สุดเป็น "error"
  for (const hall of hallRects) {
    if (hall.worstStatus !== "error") continue;
    const halfW = hall.width / 2;
    const halfD = hall.depth / 2;
    const alongX = Math.max(1, Math.round(hall.width / FENCE_SEGMENT));
    const alongZ = Math.max(1, Math.round(hall.depth / FENCE_SEGMENT));
    const segW = hall.width / alongX;
    const segD = hall.depth / alongZ;
    for (let i = 0; i < alongX; i++) {
      const x = hall.x - halfW + segW * (i + 0.5);
      tryPush({
        id: `FENCE_${hall.id}_N${i}`,
        kind: "fence",
        x,
        z: hall.z - halfD,
        rotationY: 0,
        width: segW - 0.2,
        depth: 0.2,
        height: 1.8,
      });
      tryPush({
        id: `FENCE_${hall.id}_S${i}`,
        kind: "fence",
        x,
        z: hall.z + halfD,
        rotationY: 0,
        width: segW - 0.2,
        depth: 0.2,
        height: 1.8,
      });
    }
    for (let i = 0; i < alongZ; i++) {
      const z = hall.z - halfD + segD * (i + 0.5);
      tryPush({
        id: `FENCE_${hall.id}_W${i}`,
        kind: "fence",
        x: hall.x - halfW,
        z,
        // width/depth คือขนาดก่อนหมุน — หมุน 90° แล้วจะได้แผงยาวตามแกน Z
        rotationY: Math.PI / 2,
        width: segD - 0.2,
        depth: 0.2,
        height: 1.8,
      });
      tryPush({
        id: `FENCE_${hall.id}_E${i}`,
        kind: "fence",
        x: hall.x + halfW,
        z,
        rotationY: Math.PI / 2,
        width: segD - 0.2,
        depth: 0.2,
        height: 1.8,
      });
    }
  }

  // lineSign: ป้ายชื่อไลน์หนึ่งป้ายต่อไลน์ผลิต วางเลยปลายสายพาน (spineX1) ออกไป
  // เล็กน้อยกันทับเครื่องจักรตัวแรก หมุนหน้าป้ายให้ขวางแนวสายพาน (อ่านได้เมื่อมองลงไลน์)
  // จำกัดจำนวนรวมด้วย LINE_SIGN_MAX ก่อนตัด (เว้นระยะสม่ำเสมอ) กันโรงงานใหญ่มากมีป้ายเป็นร้อย
  for (const line of thin(lines, LINE_SIGN_MAX)) {
    tryPush({
      id: `LINESIGN_${line.id}`,
      kind: "lineSign",
      x: line.horizontal ? line.x1 - LINE_SIGN_GAP : line.x1,
      z: line.horizontal ? line.z1 : line.z1 - LINE_SIGN_GAP,
      rotationY: line.horizontal ? Math.PI / 2 : 0,
      width: LINE_SIGN_WIDTH,
      depth: LINE_SIGN_DEPTH,
      height: LINE_SIGN_HEIGHT,
    });
  }

  // ---- 4b. prop ระดับพื้นที่โรงงาน: ประตู ป้อมยาม ลานจอด ลานวัสดุ รั้ว ต้นไม้ ----
  const fenceWestX = -FENCE_PADDING;
  const fenceEastX = contentWidth + FENCE_PADDING;
  const fenceNorthZ = -FENCE_PADDING;
  const fenceSouthZ = contentDepth + FENCE_PADDING;

  // gate: แผงประตูเลื่อนสองแผงที่ปลายถนนทางเข้า กลางขอบพื้นที่ด้านหน้า
  const gatePanelWidth = MAIN_ROAD_WIDTH / 2 - 0.6;
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    tryPush({
      id: `GATE_${i + 1}`,
      kind: "gate",
      x: gateX + side * (gatePanelWidth / 2 + 0.3),
      z: fenceSouthZ,
      rotationY: 0,
      width: gatePanelWidth,
      depth: 0.4,
      height: 2.6,
    });
  }

  // guardhouse: ป้อมยาม 5 × 4 ม. ข้างประตู (อยู่ในรั้ว ไม่ทับถนนทางเข้า)
  tryPush(
    {
      id: "GUARDHOUSE_1",
      kind: "guardhouse",
      x: gateX + MAIN_ROAD_WIDTH / 2 + 5,
      z: fenceSouthZ - 3.5,
      rotationY: 0,
      width: 5,
      depth: 4,
      height: 3.2,
    },
    { avoidBuildings: true, avoidRoads: true }
  );

  // yard: ลานวางวัสดุกลางแจ้งในแถบหน้าของลาน ตรงกับอาคารที่มีท่าขึ้นลงสินค้า
  const yardZ = apronTopZ + APRON_MARGIN + YARD_DEPTH / 2;
  const yardTargets = [...buildingRects]
    .sort((a, b) => (b.row - a.row) || a.x - b.x)
    .slice(0, 5);
  const yardBudget = Math.max(2, Math.min(5, yardTargets.length));
  let yardPlaced = 0;
  for (const target of yardTargets) {
    if (yardPlaced >= yardBudget) break;
    const x = Math.min(
      Math.max(target.x, YARD_WIDTH / 2),
      contentWidth - YARD_WIDTH / 2
    );
    const placed = tryPush(
      {
        id: `YARD_${target.id}`,
        kind: "yard",
        x,
        z: yardZ,
        rotationY: 0,
        width: YARD_WIDTH,
        depth: YARD_DEPTH,
        height: 0.15,
      },
      { avoidBuildings: true, avoidRoads: true }
    );
    if (placed) yardPlaced += 1;
  }
  // ถ้าลานวัสดุยังน้อยกว่า 2 (พื้นที่แคบ) ลองเลื่อนไปตำแหน่งอื่นในแถบเดียวกัน
  if (yardPlaced < 2) {
    const stride = YARD_WIDTH + 4;
    for (let x = YARD_WIDTH / 2; x <= contentWidth - YARD_WIDTH / 2 && yardPlaced < 2; x += stride) {
      const placed = tryPush(
        {
          id: `YARD_X${round3(x)}`,
          kind: "yard",
          x,
          z: yardZ,
          rotationY: 0,
          width: YARD_WIDTH,
          depth: YARD_DEPTH,
          height: 0.15,
        },
        { avoidBuildings: true, avoidRoads: true }
      );
      if (placed) yardPlaced += 1;
    }
  }

  // parking: ลานจอดรถ 2–4 แผ่นในแถบท้ายของลานหน้า ใกล้ประตูทางเข้าที่สุดก่อน
  const parkingZ = apronTopZ + APRON_MARGIN + YARD_DEPTH + APRON_GAP + PARKING_DEPTH / 2;
  const parkingSlots: number[] = [];
  const parkingStride = PARKING_WIDTH + 4;
  for (
    let x = PARKING_WIDTH / 2;
    x <= Math.max(PARKING_WIDTH / 2, contentWidth - PARKING_WIDTH / 2);
    x += parkingStride
  ) {
    parkingSlots.push(x);
  }
  parkingSlots.sort((a, b) => Math.abs(a - gateX) - Math.abs(b - gateX) || a - b);
  const parkingBudget = Math.max(2, Math.min(4, Math.round(contentWidth / 70)));
  let parkingPlaced = 0;
  for (const x of parkingSlots) {
    if (parkingPlaced >= parkingBudget) break;
    const placed = tryPush(
      {
        id: `PARKING_${round3(x)}`,
        kind: "parking",
        x,
        z: parkingZ,
        rotationY: 0,
        width: PARKING_WIDTH,
        depth: PARKING_DEPTH,
        height: 0.12,
      },
      { avoidBuildings: true, avoidRoads: true }
    );
    if (placed) parkingPlaced += 1;
  }

  // warehouse: ลังสินค้าทั้งหมดรวมเป็นคลัสเตอร์เดียว (เดิมกระจายอยู่ปลายไลน์ในโรง
  // ซึ่งทับทางเดินหลักของ AGV ที่ปลายไลน์พอดี — ย้ายออกมารวมกันเป็นลานพักสินค้า
  // จุดเดียวกลางแจ้งในแถบ APRON_GAP ที่ไม่มีถนน/อาคาร/ทางเดิน AGV ผ่าน และเสียบ
  // ก่อนต้นไม้ริมลาน (apron tree) เพื่อให้คลัสเตอร์นี้ได้พื้นที่แน่นอนก่อน)
  {
    const cols = 3;
    const rows = 2;
    const spacing = 1.8;
    const footprint = (cols - 1) * spacing + 1.6;
    const whX = Math.min(
      Math.max(contentWidth - footprint, footprint / 2),
      contentWidth - footprint / 2
    );
    const whZ = apronTopZ + APRON_MARGIN + YARD_DEPTH + APRON_GAP / 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const size = 1.2 + (hashString(`warehouse|${idx}|size`) % 4) * 0.1;
        const stack = 1 + (hashString(`warehouse|${idx}|stack`) % 3);
        tryPush(
          {
            id: `CRATE_WH_${idx}`,
            kind: "crate",
            x: whX + col * spacing,
            z: whZ + (row - (rows - 1) / 2) * spacing,
            rotationY: 0,
            width: size,
            depth: size,
            height: size * stack,
          },
          { avoidBuildings: true, avoidRoads: true }
        );
      }
    }
  }

  // officeBlock: อาคารสำนักงาน (ของประดับฉากล้วนๆ) วางข้างแนวแกนประตูฝั่งที่มีที่ว่างมากกว่า
  // พร้อมลานพลาซ่าคั่นระหว่างตัวอาคารกับถนนทางเข้า และเสาธง/แนวรั้วต้นไม้รอบลาน
  {
    const officeHalfW = OFFICE_BLOCK_WIDTH / 2;
    const westCenterX = gateX - MAIN_ROAD_WIDTH / 2 - OFFICE_SIDE_CLEARANCE - officeHalfW;
    const eastCenterX = gateX + MAIN_ROAD_WIDTH / 2 + OFFICE_SIDE_CLEARANCE + officeHalfW;
    const westFree = westCenterX - officeHalfW;
    const eastFree = contentWidth - (eastCenterX + officeHalfW);
    const westValid = westFree >= 2;
    const eastValid = eastFree >= 2;
    let officeCenterX: number | null = null;
    if (westValid && eastValid) {
      officeCenterX = westFree >= eastFree ? westCenterX : eastCenterX;
    } else if (westValid) {
      officeCenterX = westCenterX;
    } else if (eastValid) {
      officeCenterX = eastCenterX;
    }

    if (officeCenterX !== null) {
      const officeZ = apronTopZ + APRON_MARGIN + OFFICE_BLOCK_DEPTH / 2;
      const plazaZ = apronTopZ + APRON_MARGIN + OFFICE_BLOCK_DEPTH + OFFICE_PLAZA_DEPTH / 2;
      const officePlaced = tryPush(
        {
          id: "OFFICE_BLOCK_1",
          kind: "officeBlock",
          x: officeCenterX,
          z: officeZ,
          rotationY: 0,
          width: OFFICE_BLOCK_WIDTH,
          depth: OFFICE_BLOCK_DEPTH,
          height: OFFICE_BLOCK_HEIGHT,
        },
        { avoidBuildings: true, avoidRoads: true }
      );
      if (officePlaced) {
        const plazaPlaced = tryPush(
          {
            id: "OFFICE_PLAZA_1",
            kind: "officePlaza",
            x: officeCenterX,
            z: plazaZ,
            rotationY: 0,
            width: OFFICE_BLOCK_WIDTH,
            depth: OFFICE_PLAZA_DEPTH,
            height: 0.15,
          },
          { avoidBuildings: true, avoidRoads: true }
        );
        if (plazaPlaced) {
          // hedge: แนวรั้วต้นไม้เตี้ยขอบซ้าย-ขวาของลานพลาซ่า
          tryPush({
            id: "HEDGE_1_W",
            kind: "hedge",
            x: officeCenterX - OFFICE_BLOCK_WIDTH / 2 + 0.3,
            z: plazaZ,
            rotationY: Math.PI / 2,
            width: OFFICE_PLAZA_DEPTH - 1,
            depth: 0.6,
            height: HEDGE_HEIGHT,
          });
          tryPush({
            id: "HEDGE_1_E",
            kind: "hedge",
            x: officeCenterX + OFFICE_BLOCK_WIDTH / 2 - 0.3,
            z: plazaZ,
            rotationY: Math.PI / 2,
            width: OFFICE_PLAZA_DEPTH - 1,
            depth: 0.6,
            height: HEDGE_HEIGHT,
          });
          // flagpole: 3 เสาธงเรียงกึ่งกลางแนวขอบลานด้านที่ใกล้ถนนทางเข้าที่สุด
          const flagZ = plazaZ + OFFICE_PLAZA_DEPTH / 2 - 1;
          for (const offset of [-8, 0, 8]) {
            tryPush({
              id: `FLAGPOLE_1_${offset}`,
              kind: "flagpole",
              x: officeCenterX + offset,
              z: flagZ,
              rotationY: 0,
              width: 0.4,
              depth: 0.4,
              height: FLAGPOLE_HEIGHT,
            });
          }

          // carPorch: ทางเดิน/ที่จอดรถมีหลังคายื่นจากหน้าอาคารสำนักงานหลักลงมาคลุมลานพลาซ่า
          tryPush(
            {
              id: "CARPORCH_1",
              kind: "carPorch",
              x: officeCenterX,
              z: officeZ + OFFICE_BLOCK_DEPTH / 2 + CAR_PORCH_DEPTH / 2,
              rotationY: 0,
              width: CAR_PORCH_WIDTH,
              depth: CAR_PORCH_DEPTH,
              height: CAR_PORCH_HEIGHT,
            },
            { avoidBuildings: true, avoidRoads: true }
          );

          // officeAnnex: อาคารเสริมเล็ก (โรงอาหาร/ธุรการ) ต่อข้างอาคารสำนักงานหลัก
          // ลองทั้งสองด้าน (ตะวันออก/ตะวันตก) เลือกด้านแรกที่วางได้ไม่ทับสิ่งใด
          const annexHalfW = OFFICE_ANNEX_WIDTH / 2;
          const annexZ = officeZ + OFFICE_BLOCK_DEPTH / 2 - OFFICE_ANNEX_DEPTH / 2;
          for (const annexSide of [1, -1]) {
            const annexX =
              officeCenterX + annexSide * (OFFICE_BLOCK_WIDTH / 2 + OFFICE_ANNEX_GAP + annexHalfW);
            const placedAnnex = tryPush(
              {
                id: "OFFICE_ANNEX_1",
                kind: "officeAnnex",
                x: annexX,
                z: annexZ,
                rotationY: 0,
                width: OFFICE_ANNEX_WIDTH,
                depth: OFFICE_ANNEX_DEPTH,
                height: OFFICE_ANNEX_HEIGHT,
              },
              { avoidBuildings: true, avoidRoads: true }
            );
            if (placedAnnex) break;
          }
        }
      }
    }
  }

  // fence: รั้วรอบพื้นที่โรงงานทั้งผืน เว้นช่องตรงประตูทางเข้า
  const gateOpening = MAIN_ROAD_WIDTH / 2 + 1;
  const pushFenceRun = (
    tag: string,
    from: number,
    to: number,
    fixed: number,
    horizontal: boolean
  ): void => {
    const span = to - from;
    const count = Math.max(1, Math.round(span / FENCE_SEGMENT));
    const seg = span / count;
    for (let i = 0; i < count; i++) {
      const along = from + seg * (i + 0.5);
      if (horizontal && tag === "S" && Math.abs(along - gateX) < gateOpening + seg / 2) continue;
      tryPush({
        id: `FENCE_SITE_${tag}${i}`,
        kind: "fence",
        x: horizontal ? along : fixed,
        z: horizontal ? fixed : along,
        rotationY: horizontal ? 0 : Math.PI / 2,
        width: seg - 0.2,
        depth: 0.25,
        height: 2.6,
      });
    }
  };
  pushFenceRun("N", fenceWestX, fenceEastX, fenceNorthZ, true);
  pushFenceRun("S", fenceWestX, fenceEastX, fenceSouthZ, true);
  pushFenceRun("W", fenceNorthZ, fenceSouthZ, fenceWestX, false);
  pushFenceRun("E", fenceNorthZ, fenceSouthZ, fenceEastX, false);

  const fixedPropCount = props.length;

  // tree: แนวต้นไม้ด้านในรั้ว + ต้นไม้ในช่องว่างเหลือระหว่างอาคาร
  const treeInset = FENCE_PADDING / 2;
  const treeCandidates: FloorProp[] = [];
  const ringWestX = fenceWestX + treeInset;
  const ringEastX = fenceEastX - treeInset;
  const ringNorthZ = fenceNorthZ + treeInset;
  const ringSouthZ = fenceSouthZ - treeInset;
  const pushTreeRun = (
    tag: string,
    from: number,
    to: number,
    fixed: number,
    horizontal: boolean
  ): void => {
    const span = to - from;
    const count = Math.max(1, Math.floor(span / TREE_SPACING));
    const step = span / count;
    for (let i = 0; i <= count; i++) {
      const along = from + step * i;
      const x = horizontal ? along : fixed;
      const z = horizontal ? fixed : along;
      treeCandidates.push({
        id: `TREE_${tag}${i}`,
        kind: "tree",
        x,
        z,
        rotationY: 0,
        width: TREE_SIZE,
        depth: TREE_SIZE,
        height: 5 + (hashString(`tree|${tag}|${i}`) % 4) * 0.6,
      });
    }
  };
  pushTreeRun("RN", ringWestX, ringEastX, ringNorthZ, true);
  pushTreeRun("RS", ringWestX, ringEastX, ringSouthZ, true);
  pushTreeRun("RW", ringNorthZ, ringSouthZ, ringWestX, false);
  pushTreeRun("RE", ringNorthZ, ringSouthZ, ringEastX, false);

  // ต้นไม้ในช่องว่างที่เหลือของเซลล์ตะแกรง (อาคารแคบกว่าเซลล์) และช่องกลางลานหน้า
  buildingRects.forEach((building, index) => {
    const cellWidth = grid.colWidths[building.col] ?? building.width;
    const leftover = cellWidth - building.width;
    if (leftover < TREE_SIZE + 3) return;
    const stripX = building.x + building.width / 2 + leftover / 4;
    const count = Math.max(1, Math.floor(building.depth / TREE_SPACING));
    for (let i = 0; i <= count; i++) {
      const z = building.z - building.depth / 2 + (building.depth / count) * i;
      treeCandidates.push({
        id: `TREE_G${index}_${i}`,
        kind: "tree",
        x: stripX,
        z,
        rotationY: 0,
        width: TREE_SIZE,
        depth: TREE_SIZE,
        height: 5 + (hashString(`tree|g${index}|${i}`) % 4) * 0.6,
      });
    }
  });
  {
    const gapZ = apronTopZ + APRON_MARGIN + YARD_DEPTH + APRON_GAP / 2;
    const count = Math.max(1, Math.floor(contentWidth / TREE_SPACING));
    for (let i = 0; i <= count; i++) {
      const x = (contentWidth / count) * i;
      treeCandidates.push({
        id: `TREE_APRON_${i}`,
        kind: "tree",
        x,
        z: gapZ,
        rotationY: 0,
        width: TREE_SIZE,
        depth: TREE_SIZE,
        height: 5 + (hashString(`tree|apron|${i}`) % 4) * 0.6,
      });
    }
  }

  // pillar: เสาโครงสร้างบนตะแกรงทุก ~12 ม. ภายในอาคารแต่ละหลัง
  // ข้ามจุดที่ทับสายพาน (ตัวเครื่องถูกกันด้วย machineIndex ใน tryPush อยู่แล้ว)
  const spineRects: Rect[] = lines.map((line) => ({
    x: (line.x1 + line.x2) / 2,
    z: line.z1,
    width: Math.abs(line.x2 - line.x1),
    depth: 2.4,
  }));
  const spineIndex = new RectIndex(12);
  for (const rect of spineRects) spineIndex.insert(rect);
  const pillarCandidates: FloorProp[] = [];
  for (const building of buildingRects) {
    const cols = Math.max(1, Math.floor(building.width / PILLAR_SPACING));
    const rows = Math.max(1, Math.floor(building.depth / PILLAR_SPACING));
    const stepX = building.width / cols;
    const stepZ = building.depth / rows;
    for (let cx = 0; cx <= cols; cx++) {
      for (let cz = 0; cz <= rows; cz++) {
        const x = building.x - building.width / 2 + cx * stepX;
        const z = building.z - building.depth / 2 + cz * stepZ;
        const rect: Rect = { x, z, width: 0.7, depth: 0.7 };
        if (spineIndex.hits(rect, 0.4)) continue;
        pillarCandidates.push({
          id: `PILLAR_${building.id}_${cx}_${cz}`,
          kind: "pillar",
          x,
          z,
          rotationY: 0,
          width: 0.7,
          depth: 0.7,
          height: WALL_HEIGHT,
        });
      }
    }
  }

  // lightPole: เสาไฟเรียงสองฝั่งถนนหลักทุกเส้น (kind "main") ห่างกัน LIGHT_POLE_SPACING
  // ระยะจากขอบถนน = LIGHT_POLE_OFFSET กันไม่ให้ล้ำผิวถนน
  const lightPoleCandidates: FloorProp[] = [];
  for (const road of roads) {
    if (road.kind !== "main") continue;
    const length = road.horizontal ? road.width : road.depth;
    const count = Math.max(1, Math.floor(length / LIGHT_POLE_SPACING));
    const step = length / count;
    const start = -length / 2;
    for (let i = 0; i <= count; i++) {
      const along = start + step * i;
      for (const side of [-1, 1] as const) {
        const offset = side * (road.horizontal ? road.depth : road.width) / 2 + side * LIGHT_POLE_OFFSET;
        const x = road.horizontal ? road.x + along : road.x + offset;
        const z = road.horizontal ? road.z + offset : road.z + along;
        lightPoleCandidates.push({
          id: `LIGHTPOLE_${road.id}_${i}_${side}`,
          kind: "lightPole",
          x,
          z,
          rotationY: 0,
          width: LIGHT_POLE_SIZE,
          depth: LIGHT_POLE_SIZE,
          height: LIGHT_POLE_HEIGHT,
        });
      }
    }
  }

  // ---- เพดานจำนวน prop: บาง tree → pillar → lightPole ตามลำดับ -------
  const budget = Math.max(0, PROP_CAP - fixedPropCount);
  const treeBudget = Math.min(treeCandidates.length, Math.round(budget * 0.28));
  for (const tree of thin(treeCandidates, treeBudget)) {
    tryPush(tree, { avoidBuildings: true, avoidRoads: true });
  }
  const pillarBudget = Math.max(
    0,
    Math.round(Math.max(0, PROP_CAP - props.length) * 0.7)
  );
  for (const pillar of thin(pillarCandidates, pillarBudget)) tryPush(pillar);
  const lightPoleBudget = Math.max(0, PROP_CAP - props.length);
  for (const pole of thin(lightPoleCandidates, lightPoleBudget)) {
    tryPush(pole, { avoidBuildings: true, avoidRoads: true });
  }

  // ---- 5. จัดทุกอย่างให้กึ่งกลางจุดกำเนิด ------------------------------------
  const offsetX = contentWidth / 2;
  const offsetZ = contentDepth / 2;
  for (const zone of zones) {
    zone.x = round3(zone.x - offsetX);
    zone.z = round3(zone.z - offsetZ);
  }
  for (const line of lines) {
    line.x1 = round3(line.x1 - offsetX);
    line.x2 = round3(line.x2 - offsetX);
    line.z1 = round3(line.z1 - offsetZ);
    line.z2 = round3(line.z2 - offsetZ);
  }
  for (const slot of slots) {
    slot.x = round3(slot.x - offsetX);
    slot.z = round3(slot.z - offsetZ);
  }
  for (const aisle of aisles) {
    aisle.x = round3(aisle.x - offsetX);
    aisle.z = round3(aisle.z - offsetZ);
  }
  for (const prop of props) {
    prop.x = round3(prop.x - offsetX);
    prop.z = round3(prop.z - offsetZ);
  }
  for (const road of roads) {
    road.x = round3(road.x - offsetX);
    road.z = round3(road.z - offsetZ);
  }
  for (const building of buildings) {
    building.x = round3(building.x - offsetX);
    building.z = round3(building.z - offsetZ);
    building.trussX = trussPositions(building.width).map((value) => round3(building.x + value));
  }

  // ---- 6. ขอบเขตพื้นที่ + กล้อง ---------------------------------------------
  const site = {
    width: round3(contentWidth + FENCE_PADDING * 2),
    depth: round3(contentDepth + FENCE_PADDING * 2),
    fencePadding: FENCE_PADDING,
  };
  const width = site.width;
  const depth = site.depth;
  const suggestedCameraDistance = Math.max(
    18,
    fitCameraDistance(
      width,
      depth,
      FLOOR_CONTENT_HEIGHT,
      ISO_DIR,
      CAMERA_FOV_DEG,
      CAMERA_ASPECT,
      CAMERA_MARGIN
    )
  );

  const focusZoneId = pickFocusZoneId(zones);
  const focusBuildingId =
    focusZoneId === null
      ? null
      : buildings.find((building) => building.zoneIds.includes(focusZoneId))?.id ?? null;

  return {
    zones,
    lines,
    slots,
    props,
    aisles,
    buildings,
    roads,
    site,
    width,
    depth,
    suggestedCameraDistance,
    focusZoneId,
    focusBuildingId,
  };
}

function worstStatusOf(counts: Record<MachineStatus, number>): MachineStatus {
  let worst: MachineStatus = "normal";
  let worstRank = -1;
  for (const status of Object.keys(counts) as MachineStatus[]) {
    const count = counts[status] ?? 0;
    if (count <= 0) continue;
    // กันสถานะที่อยู่นอก union (เช่นค่าที่ API ส่งมาผิดคาด) ให้นับเป็นระดับ normal
    // แทนที่จะทำให้การจัดอันดับเพี้ยนหรือ crash
    const rank = STATUS_RANK[status] ?? STATUS_RANK.normal;
    if (rank > worstRank) {
      worst = status in STATUS_RANK ? status : "normal";
      worstRank = rank;
    }
  }
  return worst;
}
