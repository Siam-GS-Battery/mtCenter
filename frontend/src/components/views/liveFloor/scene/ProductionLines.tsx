import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ConveyorSegment, PlantLayout } from "../../../../lib/plantLayout";
import { mergeAll } from "./geometryKit";
import { CONVEYOR, FLOOR, PROCESS } from "./palette";

/**
 * ===========================================================================
 * PRODUCTION LINES — สายพานลำเลียงที่ร้อยเครื่องจักรเข้าเป็นไลน์
 * ===========================================================================
 *
 * `plantLayout.ts` คำนวณ `conveyors: ConveyorSegment[]` ให้แล้ว — แต่ละท่อน
 * คือช่วงสายพานที่พาดไปตามไลน์ (`x`, `z` จุดกลาง, `rot` องศา, `len` ความยาว,
 * `width` ความกว้าง, `parts` จำนวนลูกกลิ้งในท่อนนั้น)
 *
 * ทำไม merge ทั้งหมดเป็นก้อนเดียว
 * -------------------------------
 * สายพานเป็นของนิ่ง ไม่มีตัวไหนขยับหรือเปลี่ยนสีรายท่อน และมีหลายร้อยท่อน
 * ท่อนละ 10-20 ชิ้นส่วน (โครง สายพาน ลูกกลิ้ง ขา) การ merge ทุกท่อนที่ใช้
 * วัสดุเดียวกันเป็น BufferGeometry ก้อนเดียวจึงเหลือ 4 draw call ทั้งผัง
 * ไม่ว่าจะมีสายพานกี่ท่อน
 *
 * เส้นตีพื้นไลน์ (`lines`) วาดแยกเป็นอีกก้อน — เป็นแถบสีบนพื้นตามกล่องขอบเขต
 * ของแต่ละไลน์ ช่วยให้เห็นว่าเครื่องกลุ่มไหนเป็นไลน์เดียวกันแม้ซูมออกไกล
 */

/**
 * วัสดุของสายพาน — คงที่ทั้งผัง ไม่มีสถานะรายท่อน
 *
 * `frame`/`leg` เป็นโครงเหล็กทาสี (satin painted metal) ส่วน `roller` เป็น
 * โลหะเปลือยที่หมุนจริง จึงคมกว่าเล็กน้อยให้ฉากมีวัสดุหลากหลาย ไม่ใช่
 * พลาสติกก้อนเดียวทั้งสายพาน — `belt` เป็นยางจึงยังด้านและไม่มีความเป็นโลหะ
 */
const MATERIAL_SPECS = {
  frame: { color: CONVEYOR.frame, roughness: 0.55, metalness: 0.12 },
  belt: { color: CONVEYOR.belt, roughness: 0.9, metalness: 0.0 },
  roller: { color: CONVEYOR.roller, roughness: 0.4, metalness: 0.35 },
  leg: { color: CONVEYOR.leg, roughness: 0.55, metalness: 0.12 },
} as const;

type ConveyorMaterialKey = keyof typeof MATERIAL_SPECS;

/** ความสูงของหน้าสายพานจากพื้น (เมตร) — ระดับเอวคนทำงาน */
const BELT_HEIGHT = 0.85;

/**
 * ปั้นสายพานหนึ่งท่อน แล้วหย่อนชิ้นส่วนลงถังตามวัสดุ
 *
 * ทุกชิ้นปั้นในพิกัดของท่อน (ยาวตามแกน x) แล้วหมุน/ย้ายไปตำแหน่งจริงทีเดียว
 * ตอนท้าย — ถูกกว่าการคำนวณพิกัดโลกให้ทุกชิ้นเอง และอ่านง่ายกว่า
 */
function buildSegment(
  segment: ConveyorSegment,
  buckets: Record<ConveyorMaterialKey, THREE.BufferGeometry[]>
) {
  const { len, width } = segment;
  if (len <= 0 || width <= 0) return;

  const local: Array<{ g: THREE.BufferGeometry; key: ConveyorMaterialKey }> = [];

  // โครงข้างสองราง
  for (const side of [-1, 1]) {
    const rail = new THREE.BoxGeometry(len, 0.16, 0.09);
    rail.translate(0, BELT_HEIGHT, (side * width) / 2);
    local.push({ g: rail, key: "frame" });
  }

  // หน้าสายพาน
  const belt = new THREE.BoxGeometry(len, 0.03, width * 0.92);
  belt.translate(0, BELT_HEIGHT + 0.07, 0);
  local.push({ g: belt, key: "belt" });

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

// ---------------------------------------------------------------------------
// กล่อง/ชิ้นงานเคลื่อนที่บนสายพาน — roadmap step 15 ("process motion")
// ---------------------------------------------------------------------------
//
// สายพานเป็น merged geometry ก้อนเดียว (ดูคอมเมนต์บนสุดของไฟล์) จึงเปลี่ยน
// สีรายท่อนไม่ได้ — ให้ "อ่านว่ากำลังวิ่ง" ด้วยกล่องเล็ก ๆ ไถลไปตามหน้าสายพาน
// แทน (ทางเลือกที่โจทย์อนุญาตไว้แทนการ scroll UV เพราะห้ามใช้ texture ไฟล์
// และ CanvasTexture ยังต้องผูกกับ merged mesh เดียวกันทั้งผังอยู่ดี)
//
// สถานะ "ไลน์นี้วิ่งจริงไหม" มาจาก `layout.machines[].status` (ที่เดียวกับที่
// HUD/minimap ใช้) ไม่ได้คิดสถานะใหม่: ไลน์หนึ่งวิ่งก็ต่อเมื่อทุกเครื่องใน
// ไลน์นั้น status === "run" — มีเครื่องเดียวหยุด/เตือน/idle ก็ถือว่าทั้งไลน์นิ่ง
// (ตรงตามโจทย์ "a line with a stopped machine should be still")
//
// `ConveyorSegment` ไม่ได้เก็บ `lineId` ไว้ (ดู `plantLayout.ts`) จึงจับคู่ท่อน
// สายพานเข้ากับไลน์ด้วยตำแหน่ง: ท่อนอยู่ในกล่องขอบเขตของไลน์ไหน (ขยายขอบ
// เผื่อระยะเล็กน้อย) ก็ถือว่าเป็นของไลน์นั้น — ยังคงเป็น "อ่านจากสถานะเดิม"
// ไม่ใช่แหล่งสถานะที่สอง เพียงแค่แม็ปตำแหน่งเข้ากับสถานะที่มีอยู่แล้ว
//
// งบชิ้นงาน: สูงสุด `MAX_MOVING_PARTS` ชิ้นทั้งผัง คงที่เสมอ ไม่ผูกกับจำนวน
// เครื่องจักร/ท่อนสายพาน — ถ้าท่อนที่ "วิ่ง" มีมากกว่างบ ก็หยุดรับเพิ่มที่
// `MAX_MOVING_PARTS` ท่อนแรกตามลำดับ `layout.conveyors` (deterministic เสมอ
// ไม่ใช่การสุ่ม)
const MAX_MOVING_PARTS = 48;
/** ความเร็วไถลของกล่องบนสายพาน (ม./วินาที) — ช้าและนุ่ม ไม่ใช่แถบวิ่งเร็วจี๋ */
const PART_SPEED = 0.45;
const PART_LEN = 0.34;
const PART_HEIGHT = 0.16;
/** ระยะขอบขยายกล่องขอบเขตไลน์ตอนจับคู่ท่อนสายพาน — เผื่อท่อนที่โผล่พ้น
 *  bounding box ของตัวเครื่องเล็กน้อย (ความกว้างสายพาน + ช่องว่างเผื่อ) */
const LINE_MATCH_MARGIN = 2.2;

/** seed -> [0,1) แบบ deterministic (sine hash เดียวกับ `FloorActivity.tsx`) */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

interface MovingPart {
  /** ตำแหน่งกึ่งกลางท่อนสายพาน (world) */
  x: number;
  z: number;
  /** cos/sin ของมุมหมุนท่อน — ทิศ "หน้าสายพาน" ในพิกัดโลก ตามท่อนจริง ไม่ใช่แกนตายตัว */
  cos: number;
  sin: number;
  len: number;
  width: number;
  phase: number;
}

function buildMovingParts(layout: PlantLayout): MovingPart[] {
  const statusById = new Map<string, string>();
  for (const m of layout.machines) statusById.set(m.id, m.status);

  const lineRunning = new Map<string, boolean>();
  for (const line of layout.lines) {
    const running =
      line.machineIds.length > 0 && line.machineIds.every((id) => statusById.get(id) === "run");
    lineRunning.set(line.id, running);
  }
  if (layout.lines.length === 0 || layout.conveyors.length === 0) return [];

  const parts: MovingPart[] = [];
  for (const segment of layout.conveyors) {
    if (parts.length >= MAX_MOVING_PARTS) break;
    if (segment.len <= PART_LEN || segment.width <= 0) continue;

    // หาไลน์ที่ท่อนนี้ตกอยู่ในขอบเขต (ขยายเผื่อ) — ท่อนแรกที่ตรงเงื่อนไขพอ
    const line = layout.lines.find(
      (l) =>
        segment.x >= l.x0 - LINE_MATCH_MARGIN &&
        segment.x <= l.x1 + LINE_MATCH_MARGIN &&
        segment.z >= l.z0 - LINE_MATCH_MARGIN &&
        segment.z <= l.z1 + LINE_MATCH_MARGIN
    );
    if (!line || !lineRunning.get(line.id)) continue;

    const rad = THREE.MathUtils.degToRad(segment.rot);
    parts.push({
      x: segment.x,
      z: segment.z,
      cos: Math.cos(rad),
      sin: Math.sin(rad),
      len: segment.len,
      width: segment.width,
      phase: hash01(parts.length * 7.13 + 1) * segment.len,
    });
  }
  return parts;
}

const SCRATCH_POS = new THREE.Vector3();
const SCRATCH_QUAT = new THREE.Quaternion();
const SCRATCH_SCALE = new THREE.Vector3();
const SCRATCH_MATRIX = new THREE.Matrix4();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

/** กล่อง/ชิ้นงานเล็ก ๆ ไถลไปตามท่อนสายพานของไลน์ที่ "วิ่ง" จริง */
function MovingBeltParts({ layout }: { layout: PlantLayout }) {
  const parts = useMemo(() => buildMovingParts(layout), [layout]);
  const count = parts.length;

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: PROCESS.beltCargo, roughness: 0.8, metalness: 0.02 }),
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
      // ตำแหน่งไถล วนรอบท่อนระหว่าง -len/2..+len/2 ตามแกน x ท้องถิ่นของท่อน
      const span = p.len - PART_LEN;
      const raw = (t * PART_SPEED + p.phase) % p.len;
      const local = (raw < 0 ? raw + p.len : raw) - p.len / 2;
      const clamped = Math.max(-span / 2, Math.min(span / 2, local));
      // แปลงกลับเป็นพิกัดโลกด้วย cos/sin ของท่อนนั้น (ทิศจริงของท่อน ไม่ใช่แกนตายตัว)
      const worldX = p.x + clamped * p.cos;
      const worldZ = p.z - clamped * p.sin;
      SCRATCH_POS.set(worldX, BELT_HEIGHT + 0.07 + 0.015 + PART_HEIGHT / 2, worldZ);
      SCRATCH_QUAT.setFromAxisAngle(Y_AXIS, Math.atan2(-p.sin, p.cos));
      SCRATCH_SCALE.set(PART_LEN, PART_HEIGHT, Math.max(0.2, p.width * 0.55));
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
    const buckets: Record<ConveyorMaterialKey, THREE.BufferGeometry[]> = {
      frame: [],
      belt: [],
      roller: [],
      leg: [],
    };
    for (const segment of layout.conveyors) buildSegment(segment, buckets);

    const merged: Partial<Record<ConveyorMaterialKey, THREE.BufferGeometry>> = {};
    for (const key of Object.keys(buckets) as ConveyorMaterialKey[]) {
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
  }, [layout.conveyors, layout.lines]);

  useEffect(
    () => () => {
      for (const geometry of Object.values(built.merged)) geometry?.dispose();
      built.lineFloor?.dispose();
    },
    [built]
  );

  return (
    <group>
      {built.lineFloor ? (
        <mesh geometry={built.lineFloor} receiveShadow>
          {/* แถบสีพื้นบอกขอบเขตไลน์ — จัดเป็นงานทาสีพื้น (floor marking) */}
          <meshStandardMaterial color={FLOOR.aisle} roughness={0.65} metalness={0.04} />
        </mesh>
      ) : null}
      {(Object.keys(MATERIAL_SPECS) as ConveyorMaterialKey[]).map((key) => {
        const geometry = built.merged[key];
        if (!geometry) return null;
        const spec = MATERIAL_SPECS[key];
        return (
          <mesh key={key} geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={spec.color}
              roughness={spec.roughness}
              metalness={spec.metalness}
            />
          </mesh>
        );
      })}
      <MovingBeltParts layout={layout} />
    </group>
  );
}

export default ProductionLines;
