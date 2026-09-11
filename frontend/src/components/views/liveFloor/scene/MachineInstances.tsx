import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Archetype, KitStatus } from "../../../../lib/plantArchetypes";
import type { PlacedMachine, PlantLayout } from "../../../../lib/plantLayout";
import { machineStatusLabel } from "../../../../lib/pillStyles";
import { statusColor as machineStatusColor } from "../liveFloorTheme";
import { buildMachineModel } from "./machineModels";
import { MATERIAL_KEYS, type MaterialKey } from "./geometryKit";
import { GROUND_SHADOW, HIGHLIGHT, LABEL, MACHINE, stackLightColorOf, statusColorOf } from "./palette";
import { createContactShadowTexture } from "./contactShadow";

/**
 * ===========================================================================
 * MACHINE INSTANCES — วางเครื่องจักรกว่า 900 ตัวลงผังจริง
 * ===========================================================================
 *
 * วิธีเรนเดอร์
 * ------------
 * `machineModels.ts` ปั้นเครื่องหนึ่งตัวต่อ archetype แล้ว merge เป็น
 * BufferGeometry ก้อนเดียวต่อวัสดุ ที่นี่เอาแต่ละก้อนไปทำ `InstancedMesh`
 * หนึ่งตัว แล้ววางเครื่องทุกตัวของ archetype นั้นเป็น instance
 *
 * draw call = ผลรวมของ (จำนวนวัสดุที่แต่ละ archetype ใช้) ราว 40-50 ก้อน
 * ไม่ว่าจะมีเครื่อง 900 หรือ 9,000 ตัว — ต่างจากการทำ mesh ต่อชิ้นส่วนซึ่งจะ
 * ได้ 20,000+ draw call และค้างแน่นอน
 *
 * สีสถานะ
 * -------
 * วัสดุ `status` (แถบสถานะ + โคมไฟสัญญาณบนตัวเครื่อง) ใช้ `instanceColor`
 * ให้แต่ละ instance ถือสีของตัวเอง จึงได้สถานะรายเครื่องโดยยังเป็น draw call
 * เดียว วัสดุอื่นเป็นสีคงที่ร่วมกันทั้ง archetype
 *
 * การคลิก
 * -------
 * R3F ให้ `instanceId` มาใน event ของ InstancedMesh — แปลงกลับเป็น machine id
 * ผ่าน `ids[]` ของ archetype นั้น แล้วส่งออกทาง `onSelectMachine` /
 * `onOpenMachine` ซึ่งเป็นสัญญาเดิมของ `LiveFloorView` (id ดิบตัวเดียว)
 *
 * เหตุที่ raycast เฉพาะก้อน "body"
 * --------------------------------
 * ถ้าเปิดรับ event ทุกวัสดุ การ raycast หนึ่งครั้งต้องไล่ทุก instance ของทุก
 * ก้อน (50 ก้อน x 900 instance) ทุกครั้งที่เมาส์ขยับ ก้อน `body` เป็นตัวถัง
 * หลักซึ่งครอบรูปทรงเครื่องเกือบทั้งตัวอยู่แล้ว จึงใช้ก้อนเดียวเป็นตัวรับคลิก
 * และปิด raycast ก้อนที่เหลือทิ้ง (`raycast = () => null`)
 */

/** ค่าวัสดุจริงต่อคีย์ — สร้างครั้งเดียวทั้งฉาก ไม่ใช่ต่อ archetype */
function createMaterial(key: MaterialKey): THREE.MeshStandardMaterial {
  switch (key) {
    case "body":
      // ตัวถังเครื่องจักร — โลหะทาสี satin ให้อ่านเป็นอุปกรณ์อุตสาหกรรมที่
      // เรนเดอร์แม่นยำ (แนว digital twin) ไม่ใช่ก้อนด้านแบบดินน้ำมันเดิม
      return new THREE.MeshStandardMaterial({ color: MACHINE.body, roughness: 0.55, metalness: 0.12 });
    case "bodyDark":
      return new THREE.MeshStandardMaterial({ color: MACHINE.bodyDark, roughness: 0.55, metalness: 0.12 });
    case "frame":
      return new THREE.MeshStandardMaterial({ color: MACHINE.frame, roughness: 0.55, metalness: 0.12 });
    case "steel":
      // ผิวโลหะเปลือย/เคลื่อนไหว — คมกว่าตัวถังทาสีเล็กน้อยเพื่อให้ฉากมี
      // ความหลากหลายของวัสดุจริง ไม่ใช่พลาสติกก้อนเดียวทั้งเครื่อง
      return new THREE.MeshStandardMaterial({ color: MACHINE.steel, roughness: 0.4, metalness: 0.35 });
    case "rubber":
      return new THREE.MeshStandardMaterial({ color: MACHINE.rubber, roughness: 0.9, metalness: 0.0 });
    case "conduit":
      return new THREE.MeshStandardMaterial({ color: MACHINE.conduit, roughness: 0.55, metalness: 0.12 });
    case "glass":
      // โปร่งแสงเล็กน้อย ให้อ่านเป็นกระจก แต่ไม่ถึงกับต้องเรียง transparency
      return new THREE.MeshStandardMaterial({
        color: MACHINE.glass,
        roughness: 0.08,
        metalness: 0.02,
        transparent: true,
        opacity: 0.72,
      });
    case "screen":
      // จอเรืองอ่อน ๆ ไม่จ้า — emissive ต่ำพอให้เห็นว่าเปิดอยู่
      return new THREE.MeshStandardMaterial({
        color: MACHINE.screen,
        roughness: 0.3,
        metalness: 0.1,
        emissive: new THREE.Color(MACHINE.screen),
        emissiveIntensity: 0.45,
      });
    case "hazard":
      return new THREE.MeshStandardMaterial({ color: MACHINE.hazard, roughness: 0.55, metalness: 0.12 });
    case "status":
      // สีจริงมาจาก instanceColor ต่อเครื่อง — ตัว material ต้องเป็นขาวไว้
      // ไม่งั้นสีฐานจะไปคูณทับสีสถานะจนเพี้ยน
      // เลนส์โคมไฟสัญญาณเป็นพลาสติกใส ไม่ใช่โลหะ — metalness 0 (เดิม 0.1)
      //
      // instanceColor ตอนนี้มาจาก `stackLightColorOf()` (สี "ไฟติดจริง" ที่
      // อิ่มตัว/สว่าง จาก `liveFloorTheme.stackLight.*Lit` — ดูคอมเมนต์ที่
      // `palette.ts`) ไม่ใช่ `statusColorOf()` (สีนุ่มสำหรับ 2D/HUD) อีกต่อไป
      // — เดิม `stackLight.*Lit` เป็น dead code เพราะไม่มีอะไรอ่านมันเลย ทั้งที่
      // นี่คือจุดเดียวในฉากที่ควรอ่านมัน (โคมไฟสัญญาณที่ต้อง "ดูเหมือนไฟติด")
      // ยก emissiveIntensity ขึ้นจากเดิม (0.35 → 0.9) ให้สมกับสีอิ่มตัวขึ้น
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.9,
      });
    default:
      return new THREE.MeshStandardMaterial({ color: MACHINE.body });
  }
}

/** ข้อมูลที่ต้องใช้เรนเดอร์ archetype หนึ่งตัว */
interface ArchetypeGroup {
  archetype: Archetype;
  /** machine id เรียงตามลำดับ instance — ใช้แปลง instanceId กลับเป็นเครื่อง */
  ids: string[];
  placed: PlacedMachine[];
  buckets: Partial<Record<MaterialKey, THREE.BufferGeometry>>;
}

/**
 * เรนเดอร์ archetype หนึ่งตัวเป็นชุด InstancedMesh
 *
 * เขียน matrix/สี ลง instance ใน `useEffect` (ไม่ใช่ตอน render) เพราะต้องรอ
 * ให้ ref ของ InstancedMesh มีตัวจริงก่อน และเขียนใหม่เมื่อชุดเครื่องหรือ
 * สถานะเปลี่ยนเท่านั้น — ไม่ใช่ทุกเฟรม
 */
const ArchetypeInstances = memo(function ArchetypeInstances({
  group,
  onSelectMachine,
  onOpenMachine,
  onHoverMachine,
  materials,
}: {
  group: ArchetypeGroup;
  onSelectMachine?: (machineId: string) => void;
  onOpenMachine?: (machineId: string) => void;
  /** เมาส์ชี้เครื่องใด (สำหรับ tier-1 outline + ป้ายลอย) — `null` เมื่อออกจาก
   *  ก้อนนี้ทั้งหมด ดูคอมเมนต์ที่ `MachineInstances` (ตัวถือ state จริง) */
  onHoverMachine?: (machineId: string | null) => void;
  materials: Record<MaterialKey, THREE.MeshStandardMaterial>;
}) {
  const meshRefs = useRef<Partial<Record<MaterialKey, THREE.InstancedMesh | null>>>({});
  const { placed, ids, buckets } = group;

  // คีย์สถานะรวมของทั้งกลุ่ม — เปลี่ยนเมื่อมีเครื่องใดเปลี่ยนสถานะ ใช้เป็น
  // dependency ให้ effect เขียนสีใหม่ โดยไม่ต้องเทียบทีละตัวทุก render
  const statusKey = useMemo(() => placed.map((m) => m.status).join(""), [placed]);

  useEffect(() => {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3(1, 1, 1);
    const color = new THREE.Color();

    for (const key of MATERIAL_KEYS) {
      const mesh = meshRefs.current[key];
      if (!mesh) continue;

      for (let i = 0; i < placed.length; i += 1) {
        const m = placed[i];
        position.set(m.x, 0, m.z);
        // `rotationY` เป็นเรเดียนอยู่แล้ว (plantLayout เก็บ `rot` เป็นองศา
        // ควบคู่กันไว้สำหรับฝั่งที่ต้องการองศา) — ใช้ตัวเรเดียนตรง ๆ
        quaternion.setFromAxisAngle(UP, m.rotationY);
        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(i, matrix);

        if (key === "status") {
          // โคมไฟสัญญาณ — ใช้สี "ไฟติดจริง" (bright/saturated), ไม่ใช่สีนุ่ม
          // ของ `statusColorOf()` (ซึ่งยังใช้กับ status marker 2D/HUD ที่อื่น
          // ตามเดิม) ดูคอมเมนต์ที่ `createMaterial` ("status" case) ด้านบน
          color.set(stackLightColorOf(m.status));
          mesh.setColorAt(i, color);
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (key === "status" && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      // bounding sphere ของ InstancedMesh คิดจาก instance จริง ไม่ใช่จาก
      // geometry ก้อนเดียว ถ้าไม่สั่งคำนวณใหม่ frustum culling จะตัดทั้งก้อน
      // หายตอนกล้องอยู่นอกขอบเขตของ geometry ต้นแบบ
      mesh.computeBoundingSphere();
    }
  }, [placed, statusKey]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const index = event.instanceId;
    if (index === undefined) return;
    const id = ids[index];
    if (!id) return;
    event.stopPropagation();
    onSelectMachine?.(id);
  };

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    const index = event.instanceId;
    if (index === undefined) return;
    const id = ids[index];
    if (!id) return;
    event.stopPropagation();
    onOpenMachine?.(id);
  };

  // ย้ายเมาส์ข้ามหลาย instance ของ InstancedMesh ก้อนเดียวกัน "ไม่" ยิง
  // onPointerOver/onPointerOut ใหม่ (ยังนับเป็นอยู่บน object เดิม) จึงต้องอ่าน
  // `instanceId` จาก onPointerMove เองเพื่อรู้ว่าเมาส์ย้ายไปเครื่องไหนแล้ว
  //
  // Throttle: R3F raycasts against this InstancedMesh on every native
  // `pointermove` DOM event (not once per rendered frame), and this handler
  // used to call `onHoverMachine` (→ React state → re-render) unthrottled on
  // every single one of those. Gate state updates to ~20/s — plenty
  // responsive for a hover label/outline, but caps the React churn a
  // high-frequency mouse/trackpad would otherwise cause across ~10
  // archetypes worth of pickable meshes.
  const lastHoverAtRef = useRef(0);
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const now = performance.now();
    if (now - lastHoverAtRef.current < HOVER_THROTTLE_MS) return;
    lastHoverAtRef.current = now;
    const index = event.instanceId;
    if (index === undefined) return;
    const id = ids[index];
    if (!id) return;
    onHoverMachine?.(id);
  };

  const handlePointerOut = () => {
    onHoverMachine?.(null);
  };

  return (
    <>
      {MATERIAL_KEYS.map((key) => {
        const geometry = buckets[key];
        if (!geometry) return null;
        // ไม่มีก้อนใดใน `ArchetypeInstances` รับ event อีกต่อไป — ตัวรับคลิก
        // จริงย้ายไปเป็นก้อนแยกต่างหาก `PickProxyInstances` (กล่องโปร่งใสที่
        // ขยายคลุมทั้งฐาน+ความสูงเครื่องเสมอ ไม่ขึ้นกับรูปทรง `body` จริงซึ่ง
        // บางแบบ archetype อาจไม่ครอบเต็มฐาน/เต็มความสูง) ดูคอมเมนต์ที่
        // `PickProxyInstances` ด้านล่าง
        const pickable = false;
        return (
          <instancedMesh
            key={key}
            ref={(node: THREE.InstancedMesh | null) => {
              meshRefs.current[key] = node;
              if (node && !pickable) node.raycast = () => null;
            }}
            args={[geometry, materials[key], placed.length]}
            castShadow={key !== "status" && key !== "glass"}
            receiveShadow
            onClick={pickable ? handleClick : undefined}
            onDoubleClick={pickable ? handleDoubleClick : undefined}
            onPointerMove={pickable ? handlePointerMove : undefined}
            onPointerOut={pickable ? handlePointerOut : undefined}
          />
        );
      })}
    </>
  );
});

/** ดูคอมเมนต์ที่ `handlePointerMove` — จำกัดความถี่การอัปเดต hover state */
const HOVER_THROTTLE_MS = 48;

const UP = new THREE.Vector3(0, 1, 0);

/** ตำแหน่ง Y ของ quad เงาติดพื้น — ค่าสัมบูรณ์ในพิกัดโลกเดียวกับพื้น
 *  (`PlantShell.tsx`) ไม่ใช่ระยะยกจาก "ฐานเครื่อง" (เครื่องทุกตัววาง
 *  `position.set(m.x, 0, m.z)` แต่พื้นจริงที่เครื่องยืนอยู่คือสแลบ/พื้นโซน
 *  ของ `PlantShell.tsx` ซึ่งผิวบนอยู่ที่ y=0.26/0.29 — ค่าเดิม 0.015 จึงอยู่
 *  ต่ำกว่าผิวพื้นจริงและถูกสแลบทึบบังจนมองไม่เห็นเลยทั้ง feature)
 *
 *  0.31 วางไว้เหนือพื้นโซน (0.29) และเหนือกริดอ้างอิง (`FloorGrid.tsx`,
 *  0.295) — เงาจึงทาบทับกริดได้ถูกลำดับ (เงาเครื่องบังเส้นกริดใต้เครื่อง
 *  เหมือนของจริง) แต่ยังต่ำกว่าแถบตีเส้นขอบโซน (`PlantShell.tsx`, 0.33-0.35)
 *  ให้เครื่องหมายเซฟตี้ที่ทาสีไว้อ่านชัดเสมอ ไม่ถูกเงาทับ */
const SHADOW_LIFT_Y = 0.31;

/** วงเงินรอบฐานเครื่องกว้างกว่ารอยฐานจริงเล็กน้อย ให้อ่านเป็น "เงานุ่มแผ่ออก"
 *  ไม่ใช่เงาที่ตัดขอบพอดีเป๊ะกับตัวเครื่อง (ซึ่งจะดูเหมือนโปสเตอร์ตัดปะ) */
const SHADOW_SPREAD = 1.18;

/**
 * เงาติดพื้น (contact shadow) ใต้ฐานเครื่องทั้ง archetype — ดูเหตุผลที่เลือก
 * วิธีนี้แทน drei `ContactShadows` ที่หัวไฟล์ `contactShadow.ts`
 *
 * ใช้ quad เดียว (`shadowGeometry`, สร้างครั้งเดียวทั้งฉาก) ต่อ archetype
 * แล้ว instance ทับตำแหน่ง/มุมเดียวกับตัวเครื่องใน `ArchetypeInstances` แค่ยก
 * ขึ้นเล็กน้อยเหนือฐานและสเกลกว้างกว่ารอยเครื่องจริงเล็กน้อย (`SHADOW_SPREAD`)
 * — ระนาบเดียวกับพื้น ไม่ใช่ทรงสูง จึงเพิ่ม draw call แค่ 1 ต่อ archetype
 * (ราว 10 ก้อนทั้งไซต์ ไม่ว่าจะมีเครื่อง 931 หรือมากกว่านั้น)
 */
const ContactShadowInstances = memo(function ContactShadowInstances({
  placed,
  geometry,
  material,
}: {
  placed: PlacedMachine[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    for (let i = 0; i < placed.length; i += 1) {
      const m = placed[i];
      position.set(m.x, SHADOW_LIFT_Y, m.z);
      quaternion.setFromAxisAngle(UP, m.rotationY);
      // ไม่ใช่วงกลม แต่เป็นวงรีตามสัดส่วนฐานจริง (width x depth) คูณระยะแผ่
      // ขอบ — เครื่องทรงยาวจึงได้เงาทรงยาวตาม ไม่ใช่วงกลมเดียวกันหมด
      scale.set(m.width * SHADOW_SPREAD, 1, m.depth * SHADOW_SPREAD);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placed]);

  return (
    <instancedMesh
      ref={(node: THREE.InstancedMesh | null) => {
        meshRef.current = node;
        // ไม่รับคลิก — เป็นแค่ decal เงา ไม่ใช่ hit target (เหมือน `body` ที่
        // ปิด raycast ของก้อนที่ไม่ใช่ตัวรับคลิกใน `ArchetypeInstances`)
        if (node) node.raycast = () => null;
      }}
      args={[geometry, material, placed.length]}
      castShadow={false}
      receiveShadow={false}
    />
  );
});

/** สัดส่วนขยายพื้นที่รับคลิกในแนวราบ (X/Z) เทียบกับฐานเครื่องจริง — เผื่อ
 *  คลิก/ชี้เฉียดขอบเครื่องเล็กน้อยโดยไม่ทำให้เครื่องข้างเคียงชนกัน ระยะห่าง
 *  จริงที่แคบที่สุดระหว่างแนวเครื่องคือ 1.75 ม. (`plantLayout.ts`'s
 *  `MACHINE_PITCH_GAP`) — ต่อให้เครื่องกว้างสุดในผัง (archetype ใหญ่สุด ~5-6 ม.)
 *  ขยาย 10% ต่อด้าน (5% ต่อฝั่ง) ก็ยังเหลือช่องว่างมากกว่าครึ่งของช่องว่างจริง
 *  เสมอ เครื่องสองตัวจึงไม่มีทางที่กล่องรับคลิกทับกันเอง */
const PICK_MARGIN_XZ = 1.1;
/** แนวตั้งเผื่อมากกว่าแนวราบได้ (1.2 = ขยาย 20%) เพราะไม่มีเครื่องเรียงซ้อน
 *  กันในแนว Y — ไม่กระทบเพื่อนบ้านเลย แค่กันคลิกใกล้ยอด/ฐานเครื่องพลาดจาก
 *  ขอบกล่องจริง */
const PICK_MARGIN_Y = 1.2;

/**
 * กล่องรับคลิกโปร่งใส (invisible pick proxy) ต่อ archetype — คลุมฐาน
 * (width x depth) และความสูงเต็มของเครื่องเสมอ ไม่ขึ้นกับรูปทรงจริงของก้อน
 * `body` ใน `ArchetypeInstances` (บาง archetype ตัวถังจริงแคบกว่ากรอบเครื่อง
 * ทั้งหมด เช่น ขาตั้ง/แขนยื่น ทำให้คลิกพลาดบ่อย) นี่คือตัวรับ
 * onClick/onDoubleClick/onPointerMove/Out จริงตอนนี้ — ดูคอมเมนต์ที่ตั้งค่า
 * `pickable` ใน `ArchetypeInstances` ด้านบน
 *
 * วัสดุ: `transparent, opacity: 0, depthWrite: false` (ไม่ใช้ `visible={false}`
 * ซึ่งจะปิด raycast ไปด้วย) จึงมองไม่เห็นและไม่ยุ่งกับ depth buffer แต่ยังรับ
 * ray ได้ตามปกติ — เพิ่ม draw call คงที่ 1 ก้อนต่อ archetype (สเกลแบบเดียวกับ
 * `ContactShadowInstances` ไม่ใช่ต่อเครื่อง)
 */
const PickProxyInstances = memo(function PickProxyInstances({
  group,
  geometry,
  material,
  onSelectMachine,
  onOpenMachine,
  onHoverMachine,
}: {
  group: ArchetypeGroup;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  onSelectMachine?: (machineId: string) => void;
  onOpenMachine?: (machineId: string) => void;
  onHoverMachine?: (machineId: string | null) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const { placed, ids } = group;

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    for (let i = 0; i < placed.length; i += 1) {
      const m = placed[i];
      position.set(m.x, 0, m.z);
      quaternion.setFromAxisAngle(UP, m.rotationY);
      scale.set(m.width * PICK_MARGIN_XZ, m.height * PICK_MARGIN_Y, m.depth * PICK_MARGIN_XZ);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    // ดูคอมเมนต์เดียวกันที่ `ArchetypeInstances`/`ContactShadowInstances` —
    // ต้องคำนวณ bounding sphere ใหม่จาก instance จริง ไม่งั้น frustum culling
    // ใช้ทรงของ geometry ต้นแบบ (กว้าง 1x1x1 ที่จุดกำเนิด) แล้วตัดทั้งก้อนทิ้ง
    mesh.computeBoundingSphere();
  }, [placed]);

  // ดูคอมเมนต์ที่ `handlePointerMove` ของ `ArchetypeInstances` — throttle
  // เดียวกัน เหตุผลเดียวกัน (ก้อนนี้แทนที่ก้อนนั้นเป็นตัวรับ pointer event)
  const lastHoverAtRef = useRef(0);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const index = event.instanceId;
    if (index === undefined) return;
    const id = ids[index];
    if (!id) return;
    event.stopPropagation();
    onSelectMachine?.(id);
  };

  const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
    const index = event.instanceId;
    if (index === undefined) return;
    const id = ids[index];
    if (!id) return;
    event.stopPropagation();
    onOpenMachine?.(id);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const now = performance.now();
    if (now - lastHoverAtRef.current < HOVER_THROTTLE_MS) return;
    lastHoverAtRef.current = now;
    const index = event.instanceId;
    if (index === undefined) return;
    const id = ids[index];
    if (!id) return;
    onHoverMachine?.(id);
  };

  const handlePointerOut = () => {
    onHoverMachine?.(null);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, placed.length]}
      castShadow={false}
      receiveShadow={false}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    />
  );
});

/**
 * ===========================================================================
 * STATUS MARKERS — beacon ลอยเหนือเครื่องแต่ละตัว อ่านสถานะได้ทุกระยะซูม
 * ===========================================================================
 *
 * ปัญหาที่แก้: โคมไฟสัญญาณจริง (`geometryKit.ts` `stackLight()`) มีรัศมีแค่
 * 0.085 ม. บนไซต์กว้าง 655x1,224 ม. — ที่มุมกล้อง "plant"/"top" (กรอบทั้ง
 * ไซต์) โคมเล็กกว่า 1 พิกเซล สถานะจึงมีอยู่จริงแต่มองไม่เห็นเลยที่ระยะใช้งาน
 * จริงส่วนใหญ่ marker นี้คือ "ป้ายสถานะ" เสริมที่ลอยเหนือเครื่อง มองเห็นได้
 * ทุกระยะ แทนการพึ่งขนาดจริงของโคม
 *
 * ทำไม instance ต่อ "สถานะ" ไม่ใช่ต่อ archetype (เหมือน `ArchetypeInstances`)
 * -----------------------------------------------------------------------
 * แต่ละสถานะต้องเป็นรูปทรงต่างกัน (อ่านได้แม้ตาบอดสี ไม่ใช่แค่สี) — ก้อน
 * geometry จึงต้องแยกตามสถานะ ไม่ใช่ตามรูปร่างเครื่อง ผลข้างเคียงที่ดีคือ
 * เมื่อเครื่องเปลี่ยนสถานะ เครื่องนั้นแค่ "ย้ายกลุ่ม" จาก InstancedMesh หนึ่ง
 * ไปอีกอัน — เขียนสีใหม่แค่ 2 ก้อนที่มีเครื่องเปลี่ยนจริง ไม่ต้องไล่เขียน
 * instanceColor ของทั้ง 931 เครื่องทุกครั้งที่มีเครื่องเดียวเปลี่ยนสถานะ
 * ต้นทุนคือ draw call เพิ่มคงที่ 4 ก้อน (จำนวนสถานะ) ไม่ว่าไซต์จะโต 931 หรือ
 * 9,310 เครื่อง — สเกลแบบเดียวกับ `ContactShadowInstances`
 *
 * ทรง = สถานะ (ต้องตรงกับ legend ใน LiveFloorHUD.tsx เป๊ะ):
 *   run  -> ทรงกลม (sphere)
 *   warn -> ทรงสามเหลี่ยม/tetrahedron
 *   stop -> ทรงลูกบาศก์ (box)
 *   idle -> ทรงแปดหน้า/เพชร (octahedron)
 *
 * สี = `stackLightColorOf()` (โทน "ไฟติดจริง" อิ่มตัว — เดียวกับที่ตอนนี้ใช้
 * กับโคมไฟสัญญาณบนตัวเครื่อง ดูคอมเมนต์ที่ `createMaterial`) ไม่ใช่
 * `statusColorOf()` — marker นี้คือ "ไฟสัญญาณลอย" ต้องอ่านเป็นไฟติด ไม่ใช่ผิว
 * ที่อ่านบนพื้นสว่าง
 *
 * ตำแหน่ง Y: ยึดจาก `PlacedMachine.height` (ความสูงจริงของเครื่อง จาก
 * `HEIGHT[archetype]` ใน `plantLayout.ts`) ไม่ใช่ตำแหน่งโคมไฟสัญญาณ (ซึ่งเป็น
 * ค่าภายในของ `machineModels.ts`/`geometryKit.ts` ที่ `PlacedMachine` ไม่รู้จัก
 * เลย) — ตรวจสอบแล้วว่ายอดโคม (poleHeight สูงสุดในทุก archetype ~1.2 ม. +
 * lamp cap ~0.585 ม. = ราว 2.1 ม. เหนือฐานเครื่อง) ยังต่ำกว่าความสูงเครื่องที่
 * เตี้ยที่สุด (robot, `HEIGHT.robot = 2.6`) มาก การยึดแค่ `m.height` +
 * ระยะเผื่อคงที่จึงลอยพ้นทุกชิ้นส่วน/หลังคาของทุก archetype เสมอ โดยไม่ต้อง
 * รู้ตำแหน่งโคมจริงเลย
 *
 * ขนาดตามระยะกล้อง — เลือกทำในเวอร์เท็กซ์เชดเดอร์ ไม่ใช่ useFrame ต่อเฟรม
 * ------------------------------------------------------------------------
 * ไซต์กว้างมาก (655x1,224 ม.) แปลว่าที่มุมกล้องเดียวกัน เครื่องที่อยู่ใกล้
 * กล้องกับเครื่องที่อยู่ไกลสุดไซต์มีระยะห่างจากกล้องต่างกันมหาศาล — สเกล
 * เดียว (`mesh.scale`) ที่คำนวณจากระยะกล้อง-ศูนย์ไซต์ใน `useFrame` แล้วทาทั้ง
 * ก้อน (ตามที่โจทย์แนะนำเป็นตัวเลือกที่ถูกกว่า) จะพอดีแค่เครื่องกลางไซต์ ผิด
 * ทั้งเครื่องใกล้กล้อง (ป่องเกินจริง) และเครื่องไกลกล้อง (เล็กเกินจนจมอีก) ใน
 * ภาพเดียวกัน
 *
 * เลือกฝัง `onBeforeCompile` แทน: เพิ่มโค้ดเล็ก ๆ ก่อน `#include <project_vertex>`
 * คำนวณระยะจากกล้องถึง "จุดกำเนิดของแต่ละ instance" (`instanceMatrix *
 * vec4(0,0,0,1)` ในปริภูมิ view) แล้วคูณ `transformed` (ตำแหน่งเวอร์เท็กซ์ใน
 * พิกัดท้องถิ่นของ marker ก่อนถูก instanceMatrix ย้ายไปตำแหน่งจริง) ด้วยสเกล
 * ที่ได้ ผลคือ marker แต่ละตัวโตตามระยะห่างจากกล้อง "ของตัวเอง" ไม่ใช่ค่าเฉลี่ย
 * ของทั้งก้อน — คำนวณนี้เป็นต่อเวอร์เท็กซ์บน GPU (marker มีแค่ไม่กี่สิบ
 * เวอร์เท็กซ์ต่อก้อน) ไม่ใช่ต่อเฟรมบน CPU จึงถูกกว่าการ setMatrixAt() ใหม่ทั้ง
 * ก้อนทุกเฟรม (ซึ่งเป็นสิ่งที่โจทย์เตือนว่าแพง) มาก
 *
 * `clamp(dist * distFactor, minScale, maxScale)` — โตตามระยะ (คงขนาดบนจอ
 * ให้ใกล้เคียงเดิมในช่วงกลาง) แต่ถูกตรึงทั้งสองขอบ: ใกล้สุด (`minScale`) กัน
 * marker ป่องเป็นลูกบอลยักษ์ตอนซูมชิดเครื่อง, ไกลสุด (`maxScale`) กัน marker
 * โตจนกลืนเครื่องข้างเคียงตอนซูมออกสุดที่มุม "plant"
 *
 * โหมดประหยัด (`highQuality=false`): ข้าม `onBeforeCompile` ไปเลย (marker
 * ใช้ขนาดคงที่ตามเรขาคณิตต้นแบบ ไม่มีการปรับตามระยะ) — ยังคง marker ไว้
 * เพราะนี่คือฟีเจอร์เพื่อการมองเห็น ไม่ใช่ของตกแต่งที่ตัดได้เหมือน contact
 * shadow texture แต่ตัดต้นทุนการคอมไพล์/รันเชดเดอร์ที่ซับซ้อนกว่าออกไป
 * เหมือนที่ `ContactShadowInstances` ตัด texture (ไม่ใช่ตัวเงา) ทิ้งในโหมดนี้
 */

const STATUS_KEYS: KitStatus[] = ["run", "warn", "stop", "idle"];

/** รัศมี/ครึ่งขนาดของ marker แต่ละทรง (เมตร, ที่สเกล 1x ก่อนปรับตามระยะกล้อง) */
const MARKER_SIZE: Record<KitStatus, number> = {
  run: 0.34,
  warn: 0.42,
  stop: 0.5,
  idle: 0.4,
};

function createMarkerGeometry(status: KitStatus): THREE.BufferGeometry {
  switch (status) {
    case "run":
      return new THREE.SphereGeometry(MARKER_SIZE.run, 14, 10);
    case "warn":
      return new THREE.TetrahedronGeometry(MARKER_SIZE.warn);
    case "stop":
      return new THREE.BoxGeometry(MARKER_SIZE.stop, MARKER_SIZE.stop, MARKER_SIZE.stop);
    case "idle":
    default:
      return new THREE.OctahedronGeometry(MARKER_SIZE.idle);
  }
}

/** ระยะยก marker เหนือความสูงจริงของเครื่อง — ดูคอมเมนต์หัวบล็อกด้านบน */
const MARKER_CLEARANCE_Y = 0.55;

/** ค่าคุมสเกลตามระยะกล้อง (ดูคอมเมนต์หัวบล็อก) — จูนหยาบ ยังไม่เคยเห็นผลจริง
 *  บนจอ ต้องปรับละเอียดอีกทีตอนรีวิวภาพจริงบนมุมกล้องทุกแบบ */
const MARKER_MIN_SCALE = 1;
const MARKER_MAX_SCALE = 9;
const MARKER_DIST_FACTOR = 0.035;

/** ฝัง vertex shader ปรับสเกล marker ตามระยะกล้องต่อ-instance — ดูคอมเมนต์
 *  หัวบล็อก "STATUS MARKERS" ด้านบนสำหรับเหตุผลที่เลือกทำในเชดเดอร์ */
function applyPerInstanceDistanceScale(material: THREE.Material): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMrkMinScale = { value: MARKER_MIN_SCALE };
    shader.uniforms.uMrkMaxScale = { value: MARKER_MAX_SCALE };
    shader.uniforms.uMrkDistFactor = { value: MARKER_DIST_FACTOR };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uMrkMinScale;\nuniform float uMrkMaxScale;\nuniform float uMrkDistFactor;"
      )
      .replace(
        "#include <project_vertex>",
        `
#ifdef USE_INSTANCING
  vec4 mrkInstanceOrigin = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float mrkCamDist = -mrkInstanceOrigin.z;
  float mrkDistScale = clamp(mrkCamDist * uMrkDistFactor, uMrkMinScale, uMrkMaxScale);
  transformed *= mrkDistScale;
#endif
#include <project_vertex>
`
      );
  };
  // กัน three.js ใช้โปรแกรม shader ที่ cache ไว้ก่อนแก้ (ก้อนนี้แก้ vertex
  // shader ต่างจาก MeshStandardMaterial เดิม จึงต้อง cache key ของตัวเอง)
  material.customProgramCacheKey = () => "statusMarkerDistanceScale";
}

function createMarkerMaterial(status: KitStatus, highQuality: boolean): THREE.MeshStandardMaterial {
  const colorHex = stackLightColorOf(status);
  const material = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.35,
    metalness: 0.05,
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 1.1,
  });
  if (highQuality) applyPerInstanceDistanceScale(material);
  return material;
}

const MARKER_QUATERNION = new THREE.Quaternion();
const MARKER_SCALE = new THREE.Vector3(1, 1, 1);

/**
 * beacon ของสถานะหนึ่งตัว (ทุกเครื่องที่มีสถานะนี้ตอนนี้) — ดูคอมเมนต์หัวบล็อก
 * "STATUS MARKERS" ด้านบน ไม่รับ pointer event ใด ๆ (เป็นแค่ตัวช่วยมองเห็น
 * ไม่ใช่ hit target — คลิก/ชี้เครื่องยังต้องผ่านก้อน `body` ของ
 * `ArchetypeInstances` ตามเดิม)
 */
const StatusMarkerInstances = memo(function StatusMarkerInstances({
  placed,
  geometry,
  material,
}: {
  placed: PlacedMachine[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    for (let i = 0; i < placed.length; i += 1) {
      const m = placed[i];
      position.set(m.x, m.height + MARKER_CLEARANCE_Y, m.z);
      matrix.compose(position, MARKER_QUATERNION, MARKER_SCALE);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placed]);

  if (placed.length === 0) return null;

  return (
    <instancedMesh
      ref={(node: THREE.InstancedMesh | null) => {
        meshRef.current = node;
        if (node) node.raycast = () => null;
      }}
      args={[geometry, material, placed.length]}
      castShadow={false}
      receiveShadow={false}
    />
  );
});

/**
 * หมายเหตุ: เดิมมี tier-2 "inverted hull" edge outline ตรงนี้ (InstancedMesh
 * ที่ใช้เรขาคณิตขยายตามแนว vertex normal + `side: BackSide`) — ถอดออกแล้ว
 * หลังตรวจสอบพบว่าไม่คุ้ม: โมเดลเครื่องส่วนใหญ่ (`machineModels.ts`,
 * `geometryKit.ts`) ประกอบจาก `THREE.BoxGeometry`/`box()` ธรรมดา ซึ่งมี
 * hard/split normal ที่มุม (แต่ละหน้าไม่ใช้ vertex ร่วมกัน) การดันจุดออกตาม
 * normal ของตัวเองจึงทำให้จุดที่เคยซ้อนทับกันพอดีที่มุมกล่องแยกออกจากกันคนละ
 * ทิศ กลายเป็นรอยแหว่ง/ช่องว่างที่ทุกมุมกล่องของทุกชิ้นส่วนที่ merge เข้าด้วยกัน
 * — เห็นชัดเมื่อซูมเข้า ยิ่งกว่านั้นการดันเป็นระยะคงที่ในหน่วยเมตร (โลก) ทำให้
 * เครื่องเล็ก/ใหญ่ได้เส้นขอบหนาไม่เท่ากันตามสัดส่วน ที่ opacity 0.12 ผลลัพธ์คือ
 * มองแทบไม่เห็นในสภาพใช้งานจริงอยู่แล้ว แต่ยังเสียทั้ง draw call, GPU memory
 * (merge geometry ทุก archetype ซ้ำอีกชุด) และเวลา build ต่อครั้งที่ layout
 * เปลี่ยน — ฉากที่สะอาดกว่าดีกว่าเอฟเฟกต์ที่ทำครบสเปกแต่มีรอยตำหนิ
 */

/**
 * กรอบไฮไลต์รอบเครื่องที่ถูกเลือกหรือถูกชี้ (tier 1 — เส้นขอบคมชัด)
 *
 * เป็น mesh เดี่ยว ๆ ตัวเดียวในฉาก (ไม่ใช่ instanced) เพราะมีได้ทีละ 1-2 ตัว
 * เท่านั้น (เลือกอยู่ + ชี้อยู่) — วาดเป็นกรงเส้นรอบกล่องขอบเขตของเครื่อง
 * ไม่ใช่กล่องทึบ เพื่อไม่ให้บังตัวเครื่อง เดิมมีแค่กรณี "เลือกอยู่" ตัวเดียว
 * (`HIGHLIGHT.selected`) ที่นี่ทำให้ใช้ร่วมกับกรณี "ชี้อยู่" (`HIGHLIGHT.hover`)
 * ได้ด้วยเพียงส่ง `color` ต่างกัน
 */
function MachineHighlightCage({ machine, color }: { machine: PlacedMachine; color: string }) {
  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(machine.width * 1.06, machine.height * 1.04, machine.depth * 1.06);
    return new THREE.EdgesGeometry(g);
  }, [machine.width, machine.height, machine.depth]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments
      geometry={geometry}
      position={[machine.x, (machine.height * 1.04) / 2, machine.z]}
      rotation={[0, machine.rotationY, 0]}
      raycast={() => null}
    >
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}

/**
 * ป้ายลอย 3D ของเครื่องที่ "เลือกอยู่" หรือ "ชี้อยู่" — ไม่ใช่ทุกเครื่อง
 *
 * ใช้ drei `Html` (1-2 DOM node ในฉากทั้งหมด ไม่ใช่ 931) แทน `Billboard`+`Text`
 * เพราะต้องอ่านสไตล์ frosted-glass เดียวกับ HUD (`InspectorPanel.tsx` /
 * `LiveFloorHUD.tsx`) ตรง ๆ — ทำง่ายกว่ามากด้วย CSS จริงกว่าปั้นพื้นหลัง/เงา/
 * มุมโค้งด้วยเรขาคณิต WebGL ปริมาณนี้ (แค่ 1-2 ป้าย ไม่กระทบ draw call)
 *
 * ข้อมูลที่แสดงมีแค่สิ่งที่มีอยู่จริงใน `PlacedMachine` (`lib/plantLayout.ts`):
 * `label` (= DB `code`), `sub` (= DB `name`), `machine.status` (สีสถานะ/ป้าย
 * ข้อความยืมจากที่เดียวกับ HUD — `liveFloorTheme.statusColor` /
 * `lib/pillStyles.machineStatusLabel`) — ไม่มีการสร้างข้อมูลใหม่ขึ้นมาเอง
 *
 * `pointerEvents="none"` กันไม่ให้ป้ายไปดักคลิก/hover ที่ควรตกไปถึงฉากด้านหลัง
 */
function MachineDataLabel({
  machine,
  emphasis,
}: {
  machine: PlacedMachine;
  emphasis: "selected" | "hover";
}) {
  const color = machineStatusColor(machine.machine.status);
  const statusText = machineStatusLabel(machine.machine.status);
  const selected = emphasis === "selected";

  return (
    <Html
      position={[machine.x, machine.height + 0.9, machine.z]}
      center
      distanceFactor={16}
      pointerEvents="none"
      occlude={false}
      zIndexRange={[20, 0]}
    >
      <div
        style={{
          background: LABEL.panelBg,
          border: `1px solid ${LABEL.panelBorder}`,
          borderRadius: 10,
          padding: "5px 9px",
          minWidth: 108,
          maxWidth: 220,
          boxShadow: "0 8px 20px -10px rgba(11, 33, 58, 0.35)",
          opacity: selected ? 1 : 0.82,
          transform: selected ? undefined : "scale(0.92)",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: LABEL.text }}>{machine.label}</span>
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: LABEL.textMuted,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 200,
          }}
        >
          {machine.sub}
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 600, color, marginTop: 2 }}>{statusText}</div>
      </div>
    </Html>
  );
}

export interface MachineInstancesProps {
  layout: PlantLayout;
  /** เครื่องที่ถูกเลือกอยู่ — วาดกรอบไฮไลต์รอบตัว */
  selectedMachineId?: string | null;
  onSelectMachine?: (machineId: string) => void;
  onOpenMachine?: (machineId: string) => void;
  /** false = โหมดประหยัด — ใช้ contact shadow แบบสีล้วนไม่มีเท็กซ์เจอร์ไล่จาง
   *  (ดูคอมเมนต์ที่ `shadowMaterial` ด้านล่าง) */
  highQuality?: boolean;
}

/**
 * วางเครื่องจักรทั้งผังลงฉาก จัดกลุ่มตาม archetype
 */
export function MachineInstances({
  layout,
  selectedMachineId,
  onSelectMachine,
  onOpenMachine,
  highQuality = true,
}: MachineInstancesProps) {
  // วัสดุชุดเดียวใช้ร่วมทุก archetype — สร้างครั้งเดียวตลอดอายุฉาก
  const materials = useMemo(() => {
    const out = {} as Record<MaterialKey, THREE.MeshStandardMaterial>;
    for (const key of MATERIAL_KEYS) out[key] = createMaterial(key);
    return out;
  }, []);

  useEffect(
    () => () => {
      for (const key of MATERIAL_KEYS) materials[key].dispose();
    },
    [materials]
  );

  /**
   * จัดเครื่องเข้ากลุ่มตาม archetype แล้วปั้นโมเดลของกลุ่มนั้นครั้งเดียว
   *
   * ขนาดที่ส่งให้ builder เอามาจาก `PlacedMachine.width/depth/height` ของ
   * เครื่องตัวแรกในกลุ่ม ซึ่ง plantLayout ตั้งจากตาราง FOOTPRINT/HEIGHT ของ
   * archetype นั้น — เครื่อง archetype เดียวกันขนาดเท่ากันหมดโดยนิยาม
   * (plantLayout ไม่ scale เครื่องรายตัว) จึงใช้โมเดลก้อนเดียวร่วมกันได้
   */
  const groups = useMemo(() => {
    const byArchetype = new Map<Archetype, PlacedMachine[]>();
    for (const m of layout.machines) {
      const list = byArchetype.get(m.type);
      if (list) list.push(m);
      else byArchetype.set(m.type, [m]);
    }

    const out: ArchetypeGroup[] = [];
    for (const [archetype, placed] of byArchetype) {
      const first = placed[0];
      const model = buildMachineModel(archetype, first.width, first.depth, first.height);
      out.push({
        archetype,
        placed,
        ids: placed.map((m) => m.id),
        buckets: model.buckets,
      });
    }
    return out;
  }, [layout.machines]);

  // ปล่อยเรขาคณิตของชุดก่อนหน้าเมื่อผังเปลี่ยน (เครื่องเข้า/ออกจากฐานข้อมูล)
  useEffect(
    () => () => {
      for (const group of groups) {
        for (const key of MATERIAL_KEYS) group.buckets[key]?.dispose();
      }
    },
    [groups]
  );

  const selected = useMemo(
    () => (selectedMachineId ? layout.machines.find((m) => m.id === selectedMachineId) ?? null : null),
    [layout.machines, selectedMachineId]
  );

  /**
   * เครื่องทั้งไซต์จัดกลุ่มใหม่ตาม "สถานะ" (ข้ามพ้น archetype) — ป้อนให้
   * `StatusMarkerInstances` (ดูคอมเมนต์หัวบล็อก "STATUS MARKERS") ใช้ dependency
   * เดียวกับ `groups` ด้านบน (`layout.machines`) จึงได้ผลเดียวกัน: rebuild
   * เมื่อผังเปลี่ยนหรือสถานะเครื่องเปลี่ยน ไม่ใช่ทุก render
   */
  const markerGroups = useMemo(() => {
    const out: Record<KitStatus, PlacedMachine[]> = { run: [], warn: [], stop: [], idle: [] };
    for (const m of layout.machines) out[m.status]?.push(m);
    return out;
  }, [layout.machines]);

  const markerGeometries = useMemo(() => {
    const out = {} as Record<KitStatus, THREE.BufferGeometry>;
    for (const status of STATUS_KEYS) out[status] = createMarkerGeometry(status);
    return out;
  }, []);
  useEffect(
    () => () => {
      for (const status of STATUS_KEYS) markerGeometries[status].dispose();
    },
    [markerGeometries]
  );

  const markerMaterials = useMemo(() => {
    const out = {} as Record<KitStatus, THREE.MeshStandardMaterial>;
    for (const status of STATUS_KEYS) out[status] = createMarkerMaterial(status, highQuality);
    return out;
  }, [highQuality]);
  useEffect(
    () => () => {
      for (const status of STATUS_KEYS) markerMaterials[status].dispose();
    },
    [markerMaterials]
  );

  // เครื่องที่เมาส์ชี้อยู่ — state เฉพาะใน component นี้เพราะใช้แค่ทำ tier-1
  // outline + ป้ายลอย 3D ของฉาก ไม่ใช่สัญญาที่ `LiveFloorView` ต้องรู้ด้วย
  // (`selectedMachineId` เท่านั้นที่เป็น prop เดิม/สัญญาเดิม)
  const [hoveredMachineId, setHoveredMachineId] = useState<string | null>(null);
  const handleHoverMachine = useCallback((id: string | null) => {
    setHoveredMachineId((prev) => (prev === id ? prev : id));
  }, []);
  const hovered = useMemo(
    () =>
      hoveredMachineId && hoveredMachineId !== selectedMachineId
        ? layout.machines.find((m) => m.id === hoveredMachineId) ?? null
        : null,
    [layout.machines, hoveredMachineId, selectedMachineId]
  );

  // เคอร์เซอร์เป็น "pointer" ตอนชี้เครื่อง — เขียน DOM ตรงผ่าน ref ของ canvas
  // ไม่ผ่าน React re-render (ผูกกับ `hoveredMachineId` ซึ่งอัปเดตเฉพาะตอน
  // เครื่องที่ชี้เปลี่ยนจริงอยู่แล้ว ดู `handleHoverMachine` ด้านบน — ไม่ใช่
  // การอ่าน state ใหม่ต่อ pointermove)
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.style.cursor = hoveredMachineId ? "pointer" : "auto";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [gl, hoveredMachineId]);

  // quad แผ่นเดียว แชร์ร่วมกันทุก archetype — ทรง/ขนาดจริงมาจาก matrix ต่อ
  // instance (ดู `ContactShadowInstances`) จึงไม่ต้องปั้นเรขาคณิตต่อ archetype
  const shadowGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2); // นอนราบบนระนาบ XZ (แนวเดียวกับพื้น) แทนตั้งฉากแบบ default
    return g;
  }, []);
  useEffect(() => () => shadowGeometry.dispose(), [shadowGeometry]);

  // กล่อง 1x1x1 ยกฐานให้อยู่ที่ y=0 (แทนกึ่งกลางที่จุดกำเนิดแบบ default) —
  // ให้ตรงกับ position.set(m.x, 0, m.z) ที่เครื่องจริงใช้ ก่อนสเกลด้วย
  // width/height/depth x margin ต่อ instance ใน `PickProxyInstances`
  const pickGeometry = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  useEffect(() => () => pickGeometry.dispose(), [pickGeometry]);

  // โปร่งใสสนิท (opacity 0) แต่ยัง raycast ได้ปกติ — `depthWrite: false` กัน
  // ไม่ให้กล่องที่มองไม่เห็นนี้ไปตัดเครื่อง/พื้นหลังมันใน depth buffer
  const pickMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    []
  );
  useEffect(() => () => pickMaterial.dispose(), [pickMaterial]);

  /**
   * เท็กซ์เจอร์ไล่จางสร้างจาก canvas ครั้งเดียว — เฉพาะโหมด high quality
   * โหมดประหยัด (`highQuality=false`) ตัด texture sampling ทิ้ง เหลือ quad
   * โปร่งแสงสีล้วน ยังให้เงาแผ่กว้างถูกต้อง แค่ไม่มีขอบไล่จางนุ่ม — ถูกกว่า
   * แต่ยังคงเงาไว้ (ปิดเงาทิศทางแล้วในโหมดนี้อยู่แล้ว ดู `Lights` ใน
   * `FloorScene.tsx`, `castShadow={highQuality}` — ถ้าตัด contact shadow
   * ทิ้งด้วยจะไม่เหลือ grounding cue ใด ๆ เลยในโหมดประหยัด)
   */
  const shadowTexture = useMemo(
    () => (highQuality ? createContactShadowTexture() : null),
    [highQuality]
  );
  useEffect(() => () => shadowTexture?.dispose(), [shadowTexture]);

  const shadowMaterial = useMemo(() => {
    const material = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      color: GROUND_SHADOW,
      transparent: true,
      opacity: highQuality ? 0.42 : 0.24,
      depthWrite: false,
      // กัน z-fight กับพื้นเพิ่มอีกชั้นนอกจาก `SHADOW_LIFT_Y` — ทั้งสองวิธี
      // ทำงานร่วมกัน ไม่ทับซ้อนกัน (ยกจริงด้วย Y, ปรับ depth test ด้วย offset)
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      // ไม่ให้ tone mapping/exposure ของฉากดันสีเงาให้อ่อนขึ้นหรือเพี้ยน —
      // เงานี้คือ decal ที่ตั้งใจให้มีความเข้มคงที่ ไม่ใช่พื้นผิวที่ถูกแสงตี
      toneMapped: false,
    });
    // Blending: was CustomBlending with MaxEquation on the *colour* channel
    // (`max(srcColor*srcAlpha, dstColor*dstAlpha)`). That is a hard bug, not
    // a stylistic choice — the shadow texture's RGB is pure black (the
    // radial gradient in `contactShadow.ts` is `rgba(0,0,0,a)`, and
    // `MeshBasicMaterial` multiplies `color` by the map's RGB, so the actual
    // src colour fed into blending is always (0,0,0) regardless of
    // `GROUND_SHADOW`). With an opaque floor behind it (dst alpha ≈ 1),
    // `max((0,0,0), floorColor*1)` is *always* the floor colour, unchanged —
    // the quad could never darken anything, at any opacity. That is why no
    // contact shadow was visible anywhere in the scene, independent of
    // `SHADOW_LIFT_Y`.
    //
    // Reverted to standard "over" alpha compositing (`NormalBlending`, the
    // three.js default for `transparent: true`). The known trade-off this
    // was trying to avoid — overlapping 1.18x shadow quads on closely-packed
    // machines compounding darker (`1-(1-a)^n`) — is a minor, realistic
    // cosmetic effect (dense rows read as one merged dark patch, which is
    // what real contact shadows do) and is vastly preferable to zero
    // grounding cues anywhere in the scene.
    return material;
  }, [shadowTexture, highQuality]);
  useEffect(() => () => shadowMaterial.dispose(), [shadowMaterial]);

  return (
    <group>
      {groups.map((group) => (
        <ArchetypeInstances
          key={group.archetype}
          group={group}
          materials={materials}
          onSelectMachine={onSelectMachine}
          onOpenMachine={onOpenMachine}
          onHoverMachine={handleHoverMachine}
        />
      ))}
      {groups.map((group) => (
        <PickProxyInstances
          key={`pick-${group.archetype}`}
          group={group}
          geometry={pickGeometry}
          material={pickMaterial}
          onSelectMachine={onSelectMachine}
          onOpenMachine={onOpenMachine}
          onHoverMachine={handleHoverMachine}
        />
      ))}
      {groups.map((group) => (
        <ContactShadowInstances
          key={`shadow-${group.archetype}`}
          placed={group.placed}
          geometry={shadowGeometry}
          material={shadowMaterial}
        />
      ))}
      {/* status marker — beacon ลอยเหนือเครื่อง อ่านสถานะได้ทุกระยะซูม ดู
          คอมเมนต์หัวบล็อก "STATUS MARKERS" ด้านบน */}
      {STATUS_KEYS.map((status) => (
        <StatusMarkerInstances
          key={`marker-${status}`}
          placed={markerGroups[status]}
          geometry={markerGeometries[status]}
          material={markerMaterials[status]}
        />
      ))}
      {/* tier 1 — เส้นขอบคมชัดของเครื่อง "เลือกอยู่" (`HIGHLIGHT.selected`) และ
          "ชี้อยู่" (`HIGHLIGHT.hover`, ถ้าต่างจากตัวที่เลือกอยู่) */}
      {selected ? <MachineHighlightCage machine={selected} color={HIGHLIGHT.selected} /> : null}
      {hovered ? <MachineHighlightCage machine={hovered} color={HIGHLIGHT.hover} /> : null}
      {/* ป้ายลอย 3D ของเครื่องสองกรณีเดียวกัน — ไม่ใช่ทุกเครื่อง */}
      {selected ? <MachineDataLabel machine={selected} emphasis="selected" /> : null}
      {hovered ? <MachineDataLabel machine={hovered} emphasis="hover" /> : null}
    </group>
  );
}

export default MachineInstances;
