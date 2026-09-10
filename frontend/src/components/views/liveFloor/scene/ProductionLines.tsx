import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ConveyorSegment, PlantLayout } from "../../../../lib/plantLayout";
import { mergeAll } from "./geometryKit";
import { CONVEYOR, FLOOR } from "./palette";

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
    </group>
  );
}

export default ProductionLines;
