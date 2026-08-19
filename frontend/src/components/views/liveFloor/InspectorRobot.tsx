import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { InspectionAgent } from "../../../lib/inspectionAgent";
import { LIVE_FLOOR_THEME } from "./liveFloorTheme";

/**
 * ===========================================================================
 * INSPECTOR ROBOT — ร่างของหุ่นยนต์ตรวจสายการผลิตในฉาก 4 มิติ
 * ===========================================================================
 *
 * ตัวหุ่นออกแบบให้เป็นโลโก้ AI ของ MT Center (ดู components/PixelAILogo.tsx)
 * ที่ลุกขึ้นเดินได้: หัวสี่เหลี่ยมมนพร้อมเสาอากาศและหลอดไฟบนยอด แผงข้างหู
 * สองข้าง ตาสี่เหลี่ยมโตสองดวง — ผู้บริหารที่เห็นโลโก้ในไซด์บาร์อยู่แล้วจะ
 * จำได้ทันทีว่า "ตัวนี้คือ AI ของเรา"
 *
 * หน้าที่ของไฟล์นี้มีสองอย่างเท่านั้น
 *   1. ก้าวเวลาให้ `agent` จาก render loop ของฉาก (`useFrame`) เหมือนที่
 *      `SimulationStepper` ทำกับ `FloorSimulation` — ตรรกะการเดิน/การตรวจ
 *      ทั้งหมดอยู่ใน lib/inspectionAgent.ts ไม่ใช่ที่นี่
 *   2. อ่าน snapshot มาขยับ transform ของ mesh
 *
 * กฎเรื่องประสิทธิภาพ (ฉากนี้เพิ่งแก้อาการค้างบนจอความละเอียดสูงมา):
 *   • ไม่มี React state ในไฟล์นี้เลย — ทุกการเคลื่อนไหวเขียนลง ref ตรงๆ
 *     ใน useFrame ไม่ทำให้ React re-render แม้เฟรมเดียว
 *   • ไม่ allocate อ็อบเจกต์ต่อเฟรม (Vector3/Color สร้างครั้งเดียวไว้ข้างนอก)
 *   • ทั้งตัวหุ่นเป็น mesh ไม่กี่ชิ้นและ `castShadow={false}` ทั้งหมด
 *     เหมือนของเคลื่อนไหวอื่นในฉากนี้
 */

export interface InspectorRobotProps {
  agent: InspectionAgent;
  /** false = ไม่ก้าวเวลาและไม่แสดงตัวหุ่น (ปิดโหมด Agent) */
  active: boolean;
  /** false = ลดรายละเอียด (โหมดคุณภาพต่ำ / จอเล็ก) */
  highQuality?: boolean;
  /** false = ซ่อนบอลลูนข้อความเหนือหัว */
  showBubble?: boolean;
  /** true = ตัวหุ่นถูกเลือกอยู่ (แสดงวงแหวนเลือกและกล้องกำลังตามอยู่) */
  selected?: boolean;
  /** คลิกที่ตัวหุ่น — ผู้เรียกเป็นผู้เปิดพาเนลรายงาน/สั่งกล้องตาม */
  onSelect?: () => void;
}

// ---------------------------------------------------------------------------
// สัดส่วนตัวหุ่น (เมตร) — อ้างอิงคนสูง ~1.75 ม. เพื่อให้เทียบขนาดเครื่องจักรได้
// ---------------------------------------------------------------------------

const LEG_HEIGHT = 0.52;
const TORSO_HEIGHT = 0.62;
const HEAD_SIZE = 0.56;
/** ความสูงสะโพก = โคนขาต่อกับลำตัว */
const HIP_Y = LEG_HEIGHT;
/** จุดกลางลำตัว */
const TORSO_Y = HIP_Y + TORSO_HEIGHT / 2;
/** จุดกลางหัว */
const HEAD_Y = HIP_Y + TORSO_HEIGHT + HEAD_SIZE / 2 + 0.04;
/** ยอดเสาอากาศ (ใช้วางบอลลูนข้อความ) */
const ANTENNA_TOP_Y = HEAD_Y + HEAD_SIZE / 2 + 0.3;

/** องศาการเหวี่ยงขา/แขนสูงสุดขณะเดิน (เรเดียน) */
const SWING = 0.62;
/** ระยะยกตัวขึ้นลงตามจังหวะก้าว (เมตร) */
const BOB = 0.045;

// ---------------------------------------------------------------------------
// สีของตัวหุ่น — ยึดตามกฎธีมสว่างของ Live Floor: ใช้สีทึบอิ่มตัวที่เข้มกว่า
// พื้น ไม่พึ่ง emissive จ้า (ดูหัวไฟล์ liveFloorTheme.ts)
// ---------------------------------------------------------------------------

const SHELL_COLOR = "#f7f9fc";
const SHELL_TRIM = LIVE_FLOOR_THEME.machineSteelDark;
const BODY_COLOR = LIVE_FLOOR_THEME.accent;
const EYE_COLOR = "#1a4b8c";
const EYE_GLASS = "#2997ff";
const ANTENNA_BULB = "#0066cc";
const VEST_COLOR = LIVE_FLOOR_THEME.hazard;

/** สีวงแหวนใต้เท้าตามสิ่งที่หุ่นกำลังทำ */
const RING_WALK = LIVE_FLOOR_THEME.accent;
const RING_INSPECT = LIVE_FLOOR_THEME.scanlineGlow;

// อ็อบเจกต์ที่ใช้ซ้ำทุกเฟรม — สร้างครั้งเดียวตอนโหลดโมดูล ไม่ใช่ต่อเฟรม
const RING_ROTATION: [number, number, number] = [-Math.PI / 2, 0, 0];

/** จำนวน waypoint สูงสุดที่เส้นเส้นทางบนพื้นวาดได้ (บัฟเฟอร์ตายตัว) */
const MAX_PATH_POINTS = 96;
/** ความสูงของเส้นเส้นทางเหนือพื้น — พ้นชั้นแถบทางเดิน/เส้นจราจรของผัง */
const PATH_Y = 0.075;

// ---------------------------------------------------------------------------
// เส้นเส้นทางบนพื้น
// ---------------------------------------------------------------------------

/**
 * เส้นบาง ๆ บนพื้นที่ลากตามเส้นทางที่หุ่นกำลังจะเดิน (ตามโครงข่ายทางเดิน
 * ของผัง) — เป็นตัวยืนยันสายตาว่าหุ่น "เดินตามถนน" ไม่ได้ตัดตรง
 *
 * ใช้บัฟเฟอร์ตายตัวขนาด MAX_PATH_POINTS แล้วขยับ `drawRange` ตามจำนวนจุดจริง
 * จึงไม่มีการสร้าง geometry ใหม่ตอนเปลี่ยนจุดหมาย และไม่มี React state เข้ามา
 * เกี่ยว — อัปเดตเฉพาะเมื่อ identity ของอาร์เรย์เส้นทางเปลี่ยน (คือเปลี่ยน
 * จุดหมาย) ไม่ใช่ทุกเฟรม
 */
function PatrolPath({ agent, visible }: { agent: InspectionAgent; visible: boolean }) {
  // สร้าง THREE.Line ตรง ๆ แล้วเสียบด้วย <primitive> — แท็ก <line> ใน JSX ชน
  // กับ <line> ของ SVG ใน type ของ React จึงเลี่ยงไปทางนี้แทนการฝืน cast
  const { object, geometry } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX_PATH_POINTS * 3), 3)
    );
    g.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(LIVE_FLOOR_THEME.accent),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const created = new THREE.Line(g, material);
    created.visible = false;
    created.raycast = () => null;
    // จุดแรกของเส้นเกาะติดตัวหุ่นซึ่งขยับทุกเฟรม กรอบขอบเขตที่คำนวณไว้จึง
    // ล้าสมัยทันทีและอาจถูกตัดทิ้งผิด ๆ — เส้นนี้มีไม่เกิน 96 จุด การตัด
    // frustum ให้มันจึงไม่ได้อะไรกลับมาเลย ปิดทิ้งง่ายกว่าและถูกต้องกว่า
    created.frustumCulled = false;
    return { object: created, geometry: g };
  }, []);

  useEffect(
    () => () => {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    },
    [object]
  );

  useFrame(() => {
    const snap = agent.snapshot();
    const path = snap.plannedPath;

    // จุดแรกของเส้นคือตำแหน่งหุ่นในขณะนั้น (ขยับทุกเฟรม) จุดที่เหลือคือ
    // waypoint ที่ยังไม่ถึง — เส้นจึง "หดเข้าหาตัวหุ่น" ระหว่างเดิน
    const remaining = Math.max(0, path.length - snap.pathIndex);
    const count = Math.min(MAX_PATH_POINTS, remaining > 0 ? remaining + 1 : 0);
    object.visible = visible && count >= 2;
    if (!object.visible) {
      geometry.setDrawRange(0, 0);
      return;
    }

    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    array[0] = snap.x;
    array[1] = PATH_Y;
    array[2] = snap.z;
    for (let i = 1; i < count; i++) {
      const point = path[snap.pathIndex + i - 1];
      array[i * 3] = point.x;
      array[i * 3 + 1] = PATH_Y;
      array[i * 3 + 2] = point.z;
    }
    attribute.needsUpdate = true;
    geometry.setDrawRange(0, count);
  });

  return <primitive object={object} />;
}

// ---------------------------------------------------------------------------
// ตัวหุ่น
// ---------------------------------------------------------------------------

function InspectorRobotImpl({
  agent,
  active,
  highQuality = true,
  showBubble = true,
  selected = false,
  onSelect,
}: InspectorRobotProps) {
  const root = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const bulb = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const scan = useRef<THREE.Mesh>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  /** ข้อความในบอลลูนที่เขียนไว้ล่าสุด — กันเขียน DOM ซ้ำทุกเฟรม */
  const lastBubble = useRef<string | null>(null);

  const geometry = useMemo(
    () => ({
      leg: new THREE.CapsuleGeometry(0.075, LEG_HEIGHT - 0.15, 3, 6),
      arm: new THREE.CapsuleGeometry(0.062, 0.4, 3, 6),
      ring: new THREE.RingGeometry(0.42, 0.56, highQuality ? 32 : 16),
      scan: new THREE.RingGeometry(0.05, 0.9, highQuality ? 32 : 16),
      /** วงแหวนนอกที่ขึ้นเฉพาะเมื่อตัวหุ่นถูกเลือก */
      select: new THREE.RingGeometry(0.68, 0.8, highQuality ? 32 : 16),
      /** ทรงจับคลิก — ครอบทั้งตัวไว้ก้อนเดียว */
      hit: new THREE.CapsuleGeometry(0.42, 1.25, 3, 8),
    }),
    [highQuality]
  );

  /**
   * ตัวหุ่นเป็นวัตถุเดียวในฉากที่เคลื่อนที่และคลิกได้ ทรงจับคลิกจึงเป็น
   * แคปซูลใสก้อนเดียวครอบทั้งตัว ไม่ใช่ผูก event ไว้กับ mesh ทุกชิ้น (หัว/
   * แขน/ขา) — จำนวนวัตถุที่ raycaster ต้องไล่ต่อการขยับเมาส์หนึ่งครั้งต่างกัน
   * สิบเท่า และผู้ใช้ก็คลิกโดนง่ายกว่าเพราะไม่มีช่องว่างระหว่างชิ้นส่วน
   */
  const handleOver = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!onSelect) return;
      event.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    [onSelect]
  );

  const handleOut = useCallback(() => {
    if (!onSelect) return;
    document.body.style.cursor = "auto";
  }, [onSelect]);

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!onSelect) return;
      // กันคลิกทะลุไปโดนเครื่องจักรที่อยู่ข้างหลังหุ่น (ซึ่งจะเปลี่ยนการเลือก
      // ในหน้าไปเป็นเครื่องนั้นแทน)
      event.stopPropagation();
      onSelect();
    },
    [onSelect]
  );

  // ตัวหุ่นอาจถูกถอดออกจากฉากตอนที่ยังชี้เมาส์อยู่บนตัว (ปิดโหมด Agent /
  // ออกจากโหมด 4 มิติ) ซึ่ง R3F จะไม่ยิง pointerout ให้ — คืนเคอร์เซอร์เสมอ
  useEffect(
    () => () => {
      document.body.style.cursor = "auto";
    },
    []
  );

  /**
   * geometry ที่สร้างเองด้วย `new` ไม่ได้อยู่ในความดูแลของ R3F — ถ้าไม่คืน
   * ทรัพยากรเอง ทุกครั้งที่สลับโหมดคุณภาพหรือออกจากโหมด Agent จะทิ้ง buffer
   * ค้างไว้บน GPU (ฉากนี้เพิ่งแก้อาการค้างบนจอความละเอียดสูงมา — อย่าเพิ่ม
   * ที่รั่วใหม่)
   */
  useEffect(
    () => () => {
      for (const g of Object.values(geometry)) g.dispose();
    },
    [geometry]
  );

  useFrame((_, delta) => {
    if (!active) return;
    agent.step(delta);

    const snap = agent.snapshot();
    const group = root.current;
    if (!group) return;

    // ยืนรออยู่ที่จุดตั้งต้น (หน้าประตูโรงงาน) แม้ยังไม่ได้สั่งเริ่มรอบ —
    // ผู้ชมจะเห็นตัวหุ่นก่อนกดปุ่ม ไม่ใช่โผล่มาจากที่ว่าง
    group.visible = true;
    group.position.x = snap.x;
    group.position.z = snap.z;
    group.rotation.y = snap.yaw;

    const walking = snap.phase === "walking" || snap.phase === "reporting";
    // เฟสก้าวเป็นวงกลม: sin ให้ขาสองข้างสลับกันแบบต่อเนื่องไม่มีรอยกระตุก
    const phase = snap.stride * Math.PI * 2;
    const swing = walking ? Math.sin(phase) * SWING : 0;

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    // แขนแกว่งสวนทางขาเหมือนคนเดินจริง และแนบตัวลงเมื่อหยุดตรวจ
    if (armL.current) armL.current.rotation.x = -swing * 0.7;
    if (armR.current) armR.current.rotation.x = swing * 0.7;

    if (bob.current) {
      // ตัวยกขึ้นลงสองครั้งต่อหนึ่งรอบก้าว (ซ้าย-ขวา) จึงใช้ 2x phase
      bob.current.position.y = walking ? Math.abs(Math.sin(phase * 2)) * BOB : 0;
    }

    // ก้มหัวมองแผงควบคุมขณะอ่านค่า แล้วเงยกลับเมื่อเดินต่อ
    if (head.current) {
      const target = snap.phase === "inspecting" ? 0.26 : 0;
      head.current.rotation.x += (target - head.current.rotation.x) * Math.min(1, delta * 6);
    }

    // หลอดไฟยอดเสาอากาศ: เต้นเร็วขณะอ่านค่า เต้นช้าขณะเดิน
    if (bulb.current) {
      const rate = snap.phase === "inspecting" ? 9 : 3;
      const pulse = 0.86 + Math.sin(snap.elapsed * rate) * 0.14;
      bulb.current.scale.setScalar(pulse);
    }

    // วงแหวนใต้เท้าเปลี่ยนสีตามสิ่งที่ทำ (จุดที่ผู้ดูจับตำแหน่งหุ่นได้ไวสุด)
    if (ringMat.current) {
      ringMat.current.color.set(snap.phase === "inspecting" ? RING_INSPECT : RING_WALK);
      ringMat.current.opacity = snap.phase === "inspecting" ? 0.85 : 0.5;
    }

    // วงสแกนบนพื้น: ขยายออกตามความคืบหน้าของการอ่านค่า เห็นได้ชัดว่า
    // "กำลังตรวจอยู่ และใกล้เสร็จแค่ไหน" โดยไม่ต้องอ่านตัวเลขใน HUD
    if (scan.current) {
      const inspecting = snap.phase === "inspecting";
      scan.current.visible = inspecting;
      if (inspecting) {
        const p = snap.dwellProgress;
        scan.current.scale.setScalar(0.35 + p * 1.15);
        const mat = scan.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.5 * (1 - p * 0.7);
      }
    }

    // บอลลูนข้อความ: เขียน DOM เฉพาะเมื่อข้อความเปลี่ยนจริง
    if (bubbleRef.current && snap.bubble !== lastBubble.current) {
      lastBubble.current = snap.bubble;
      bubbleRef.current.textContent = snap.bubble ?? "";
      bubbleRef.current.style.opacity = snap.bubble ? "1" : "0";
    }
  });

  return (
    <>
      {/* เส้นเส้นทางอยู่นอกกลุ่มตัวหุ่น เพราะพิกัดของมันเป็นพิกัดโลก
          ไม่ใช่พิกัดที่อิงตำแหน่ง/การหันตัวของหุ่น */}
      <PatrolPath agent={agent} visible={active} />

      <group ref={root} visible={false}>
      {/* ทรงจับคลิก — วัสดุโปร่งใสสนิทแต่ยังนับเป็น "มองเห็น" ในสายตาของ
          raycaster (ถ้าใช้ visible={false} จะคลิกไม่โดนเลย) */}
      <mesh
        geometry={geometry.hit}
        position={[0, (LEG_HEIGHT + TORSO_HEIGHT + HEAD_SIZE) / 2, 0]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
        castShadow={false}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* วงแหวนแสดงว่าถูกเลือกอยู่ */}
      {selected && (
        <mesh geometry={geometry.select} rotation={RING_ROTATION} position={[0, 0.085, 0]} castShadow={false}>
          <meshBasicMaterial
            color={LIVE_FLOOR_THEME.accent}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* วงแหวนบอกตำแหน่ง + วงสแกน อยู่นอกกลุ่มที่ยกตัวขึ้นลง จะได้ติดพื้นนิ่ง */}
      <mesh ref={ring} geometry={geometry.ring} rotation={RING_ROTATION} position={[0, 0.09, 0]} castShadow={false}>
        <meshBasicMaterial ref={ringMat} color={RING_WALK} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh
        ref={scan}
        geometry={geometry.scan}
        rotation={RING_ROTATION}
        position={[0, 0.1, 0]}
        visible={false}
        castShadow={false}
      >
        <meshBasicMaterial color={RING_INSPECT} transparent opacity={0.4} depthWrite={false} />
      </mesh>

      <group ref={bob}>
        {/* ---- ขาสองข้าง (หมุนที่สะโพก) ---- */}
        <group ref={legL} position={[-0.14, HIP_Y, 0]}>
          <mesh geometry={geometry.leg} position={[0, -LEG_HEIGHT / 2, 0]} castShadow={false}>
            <meshStandardMaterial color={SHELL_TRIM} roughness={0.55} metalness={0.25} />
          </mesh>
        </group>
        <group ref={legR} position={[0.14, HIP_Y, 0]}>
          <mesh geometry={geometry.leg} position={[0, -LEG_HEIGHT / 2, 0]} castShadow={false}>
            <meshStandardMaterial color={SHELL_TRIM} roughness={0.55} metalness={0.25} />
          </mesh>
        </group>

        {/* ---- ลำตัว ---- */}
        <RoundedBox
          args={[0.46, TORSO_HEIGHT, 0.3]}
          radius={0.09}
          smoothness={highQuality ? 3 : 2}
          position={[0, TORSO_Y, 0]}
          castShadow={false}
        >
          <meshStandardMaterial color={BODY_COLOR} roughness={0.42} metalness={0.15} />
        </RoundedBox>

        {/* เสื้อกั๊กสะท้อนแสงสีส้ม — สัญลักษณ์ "ผู้เดินตรวจ" ที่คนหน้างานอ่านออกทันที */}
        <mesh position={[0, TORSO_Y + 0.06, 0.16]} castShadow={false}>
          <boxGeometry args={[0.48, 0.1, 0.02]} />
          <meshStandardMaterial color={VEST_COLOR} roughness={0.35} />
        </mesh>

        {/* แผงป้ายชื่อบนอก */}
        <mesh position={[0, TORSO_Y - 0.14, 0.155]} castShadow={false}>
          <boxGeometry args={[0.18, 0.12, 0.02]} />
          <meshStandardMaterial color={SHELL_COLOR} roughness={0.5} />
        </mesh>

        {/* ---- แขนสองข้าง (หมุนที่ไหล่) ---- */}
        <group ref={armL} position={[-0.28, TORSO_Y + 0.2, 0]}>
          <mesh geometry={geometry.arm} position={[0, -0.22, 0]} castShadow={false}>
            <meshStandardMaterial color={SHELL_COLOR} roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
        <group ref={armR} position={[0.28, TORSO_Y + 0.2, 0]}>
          <mesh geometry={geometry.arm} position={[0, -0.22, 0]} castShadow={false}>
            <meshStandardMaterial color={SHELL_COLOR} roughness={0.5} metalness={0.1} />
          </mesh>
          {/* แท็บเล็ตในมือขวา — ที่ที่หุ่นจดผลตรวจ */}
          <mesh position={[0.02, -0.44, 0.1]} rotation={[-0.9, 0, 0]} castShadow={false}>
            <boxGeometry args={[0.2, 0.26, 0.02]} />
            <meshStandardMaterial color={SHELL_TRIM} roughness={0.4} metalness={0.3} />
          </mesh>
        </group>

        {/* ---- หัว (ทรงเดียวกับโลโก้ PixelAILogo) ---- */}
        <group ref={head} position={[0, HEAD_Y, 0]}>
          <RoundedBox
            args={[HEAD_SIZE, HEAD_SIZE, HEAD_SIZE * 0.78]}
            radius={0.12}
            smoothness={highQuality ? 4 : 2}
            castShadow={false}
          >
            <meshStandardMaterial color={SHELL_COLOR} roughness={0.38} metalness={0.12} />
          </RoundedBox>

          {/* แผงข้างหูสองข้าง */}
          <mesh position={[-HEAD_SIZE / 2 - 0.03, 0, 0]} castShadow={false}>
            <boxGeometry args={[0.07, 0.2, 0.16]} />
            <meshStandardMaterial color={SHELL_TRIM} roughness={0.45} metalness={0.3} />
          </mesh>
          <mesh position={[HEAD_SIZE / 2 + 0.03, 0, 0]} castShadow={false}>
            <boxGeometry args={[0.07, 0.2, 0.16]} />
            <meshStandardMaterial color={SHELL_TRIM} roughness={0.45} metalness={0.3} />
          </mesh>

          {/* หน้าจอใบหน้า + ตาสี่เหลี่ยมโตสองดวง */}
          <mesh position={[0, 0.02, HEAD_SIZE * 0.39 + 0.005]} castShadow={false}>
            <boxGeometry args={[0.42, 0.26, 0.015]} />
            <meshStandardMaterial color={EYE_COLOR} roughness={0.25} metalness={0.05} />
          </mesh>
          <mesh position={[-0.1, 0.03, HEAD_SIZE * 0.39 + 0.016]} castShadow={false}>
            <boxGeometry args={[0.1, 0.1, 0.012]} />
            <meshStandardMaterial color={EYE_GLASS} roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0.03, HEAD_SIZE * 0.39 + 0.016]} castShadow={false}>
            <boxGeometry args={[0.1, 0.1, 0.012]} />
            <meshStandardMaterial color={EYE_GLASS} roughness={0.2} />
          </mesh>

          {/* เสาอากาศ + หลอดไฟบนยอด */}
          <mesh position={[0, HEAD_SIZE / 2 + 0.1, 0]} castShadow={false}>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 6]} />
            <meshStandardMaterial color={SHELL_TRIM} roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh ref={bulb} position={[0, HEAD_SIZE / 2 + 0.23, 0]} castShadow={false}>
            <sphereGeometry args={[0.062, highQuality ? 12 : 6, highQuality ? 10 : 5]} />
            <meshStandardMaterial
              color={ANTENNA_BULB}
              roughness={0.25}
              // ธีมสว่างไม่มี headroom ให้ glow — ใช้ emissive อ่อนๆ พอให้หลอด
              // ดูติดไฟ แต่ฐานสีเข้มกว่าพื้นจึงยังอ่านออกกลางวัน
              emissive={ANTENNA_BULB}
              emissiveIntensity={0.45}
            />
          </mesh>
        </group>

        {/* บอลลูนข้อความเหนือหัว — ข้อความถูกเขียนผ่าน ref ใน useFrame
            (ไม่ผูกกับ React state) จึงไม่มี re-render จากการเดินตรวจเลย */}
        {showBubble && (
          <Html
            position={[0, ANTENNA_TOP_Y, 0]}
            center
            occlude={false}
            distanceFactor={18}
            style={{ pointerEvents: "none" }}
          >
            <div
              ref={bubbleRef}
              style={{
                opacity: 0,
                transition: "opacity 180ms ease",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 600,
                color: LIVE_FLOOR_THEME.hud.text,
                background: LIVE_FLOOR_THEME.hud.panelBg,
                border: `1px solid ${LIVE_FLOOR_THEME.hud.panelBorder}`,
                borderRadius: "8px",
                padding: "5px 10px",
                boxShadow: "0 6px 18px rgba(15, 30, 60, 0.18)",
              }}
            />
          </Html>
        )}
        </group>
      </group>
    </>
  );
}

const InspectorRobot = memo(InspectorRobotImpl);
export default InspectorRobot;
