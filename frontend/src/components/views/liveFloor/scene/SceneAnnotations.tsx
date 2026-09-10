import { useMemo, useRef, type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlantLayout } from "../../../../lib/plantLayout";
import type { PlantZone } from "../../../../lib/plantSite";
import { HIGHLIGHT, LABEL } from "./palette";

/**
 * ===========================================================================
 * SCENE ANNOTATIONS — ป้ายชื่อโซน เข็มทิศทิศเหนือ แถบสเกล
 * ===========================================================================
 *
 * Roadmap step 3: ก่อนหน้านี้ผู้ใช้รู้ว่ายืนอยู่โซนไหนได้แค่จาก "zone
 * navigator" ใน HUD (`LiveFloorHUD.tsx`) — ยืนอยู่ในฉาก 3D จริงต้องเดาเอาเอง
 * ไฟล์นี้เติมสามอย่างที่ยังไม่มีในฉากเลย (ตรวจแล้วก่อนเขียน — ดูคอมเมนต์
 * แต่ละส่วนด้านล่าง):
 *   1. ป้ายชื่อโซนลอยเหนือแผ่นพื้นแต่ละโซน จาง/ซ่อนเมื่อกล้องเข้าใกล้เกินไป
 *      (มุมสายตา/ไลน์) กันไม่ให้เกะกะ แต่อ่านชัดที่มุมโรงงาน/บนสุด
 *   2. เข็มทิศทิศเหนือ — ลูกศรวางบนพื้นนอกอาคาร ชี้ไปทาง -Z ตามอนุสัญญาแกน
 *      ของ `plantSite.ts` ("plan north, +Y, is -Z")
 *   3. แถบสเกล 0-50 ม. — เรขาคณิตจริงยาว 50 หน่วยฉาก ซึ่งคือ 50 เมตรจริงตาม
 *      หน่วยที่ `plantLayout.ts` ใช้ทั้งไฟล์ (`unit: "m"`) ไม่ต้องคำนวณใหม่
 *      เพราะเป็นวัตถุจริงในฉาก ไม่ใช่ป้าย DOM ที่ต้องคอยรีเฟรชตามซูม
 *
 * ใช้ drei `Html` แบบเดียวกับ `MachineInstances.tsx`'s `MachineDataLabel` —
 * ชื่อโซนทั้งหมดเป็นภาษาอังกฤษ (`plantSite.ts`'s `RAW_ZONES`) แต่ยังเลือก
 * `Html` แทน `Billboard`+`Text` ของ drei เพราะ (ก) ไม่มีไฟล์ฟอนต์ในโปรเจกต์
 * ให้ `Text` ใช้ — ต้องพึ่งฟอนต์เริ่มต้นที่ดึงจาก CDN ตอน runtime ซึ่งขัดกับ
 * กฎ "ห้าม asset ภายนอก" ของงานนี้ (ข) `Html` เป็น pattern ที่มีอยู่แล้วในไฟล์
 * นี้พอดี ได้ฟอนต์เว็บของแอปมาฟรี และรองรับข้อความไทยได้ทันทีถ้าชื่อโซนหรือ
 * ป้ายในอนาคตเป็นไทย
 *
 * ทุกเมชในไฟล์นี้ `raycast={() => null}` (ห้ามบังคลิกเครื่องจักร) และ
 * `castShadow={false}` (ป้าย/สัญลักษณ์ไม่ทอดเงา) ตามกฎเดียวกับ
 * `MachineInstances.tsx`
 */

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/* ------------------------------------------------------------------ */
/* 1. Zone name labels                                                 */
/* ------------------------------------------------------------------ */

const ZONE_LABEL_STYLE: CSSProperties = {
  background: LABEL.panelBg,
  border: `1px solid ${LABEL.panelBorder}`,
  borderRadius: 999,
  padding: "3px 11px",
  fontSize: 12,
  fontWeight: 700,
  color: LABEL.text,
  whiteSpace: "nowrap",
  boxShadow: "0 6px 16px -8px rgba(11, 33, 58, 0.35)",
  fontFamily: "inherit",
};

/**
 * ป้ายชื่อโซนหนึ่งใบ — จาง/ซ่อนตามระยะกล้อง ไม่ใช่ตามมุมกล้อง (preset) ตรง ๆ
 * เพราะผู้ใช้ซูมอิสระได้แม้อยู่ใน preset เดียวกัน (OrbitControls) ระยะอ้างอิง
 * ใช้เส้นทแยงมุมของ "โซนนั้นเอง" ไม่ใช่ค่าคงที่ตายตัว เพราะขนาดโซนต่างกัน
 * มาก (WH เล็กกว่า LINES หลายเท่า — ดู `plantSite.ts`) โซนใหญ่จึงอ่านป้ายได้
 * จากระยะไกลกว่าโซนเล็กตามสัดส่วนจริงของมัน
 *
 * เขียน opacity ลง DOM ตรง ๆ ผ่าน ref ทุกเฟรม (ไม่ผ่าน React state) — กฎ
 * เดียวกับ `CameraRig` ใน `FloorScene.tsx`: การ re-render ทุกเฟรมของแปด
 * ป้ายจะไม่หนักอะไร แต่การเขียนตรงคือ pattern ที่ไฟล์นี้ยึดอยู่แล้ว
 */
function ZoneLabel({ zone }: { zone: PlantZone }) {
  const divRef = useRef<HTMLDivElement>(null);
  const center = useMemo(() => new THREE.Vector3(zone.x, 0, zone.z), [zone.x, zone.z]);
  const diagonal = Math.hypot(zone.w, zone.d);
  // ใกล้กว่านี้ (มุมสายตา/เดินเข้าไลน์) = ป้ายเกะกะบังของจริง ซ่อนทิ้ง
  const nearHide = diagonal * 0.55;
  // ไกลกว่านี้ (มุมทั้งโรงงาน/มุมบนสุด) = อ่านชัดเต็มความทึบ
  const farShow = diagonal * 1.4;

  useFrame(({ camera }) => {
    const el = divRef.current;
    if (!el) return;
    const dist = camera.position.distanceTo(center);
    const opacity = clamp01((dist - nearHide) / Math.max(1, farShow - nearHide));
    el.style.opacity = opacity.toFixed(2);
  });

  return (
    <Html
      position={[zone.x, 1.6, zone.z]}
      center
      distanceFactor={22}
      pointerEvents="none"
      occlude={false}
      zIndexRange={[12, 0]}
    >
      <div ref={divRef} style={ZONE_LABEL_STYLE}>
        {zone.name}
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* 2. North indicator                                                  */
/* ------------------------------------------------------------------ */

/** สีลูกศร/แถบสเกล — ยืมโทน accent เดียวกับไฮไลต์ที่เลือกอยู่ในฉาก (ไม่ตั้ง
 *  hex ใหม่) ให้อ่านต่างจากพื้นเทากลางชัดแต่ไม่แย่งซีนจากเครื่องจักร */
const MARKER_COLOR = HIGHLIGHT.selected;

const NORTH_ARROW_LEN = 8;
const NORTH_ARROW_HEAD_LEN = 2.4;
const NORTH_ARROW_HEAD_R = 0.9;
const NORTH_ARROW_SHAFT_W = 0.45;

/**
 * ลูกศรทิศเหนือวางบนพื้นนอกอาคาร ชี้ไปทาง -Z ตามอนุสัญญาแกนของ `plantSite.ts`
 * ("sceneZ = hall.d/2 - planY" -> ทิศเหนือของผังจริงคือ -Z ในพิกัดฉาก)
 *
 * เลือกวางเป็นวัตถุในฉาก (ไม่ใช่ DOM overlay มุมจอ) เพราะลูกศรที่หมุนตาม
 * กล้องจริงต้องคำนวณมุม yaw ของกล้องทุกเฟรมแล้วหมุน DOM element กลับด้าน —
 * ในขณะที่วัตถุในฉากเป็นส่วนหนึ่งของโลก 3D อยู่แล้ว หมุนตามที่ผู้ใช้หมุนกล้อง
 * เองโดยอัตโนมัติ ไม่ต้องเขียนโค้ดติดตามกล้องเลย
 */
function NorthIndicator({ layout }: { layout: PlantLayout }) {
  // วางไว้มุมตะวันออกเฉียงเหนือนอกอาคาร ห่างจากผนังพอไม่ชนถนน/ลานจอดที่ตี
  // ไว้ในระยะเผื่อรอบฮอลล์ (`plantLayout.ts`'s `HALL_PERIMETER` = 15 ม.)
  const x = layout.hall.w / 2 + 30;
  const z = -layout.hall.d / 2 - 30;

  const headCenterZ = -NORTH_ARROW_LEN / 2 + NORTH_ARROW_HEAD_LEN / 2;
  const shaftLen = NORTH_ARROW_LEN - NORTH_ARROW_HEAD_LEN;
  const shaftCenterZ = headCenterZ + NORTH_ARROW_HEAD_LEN / 2 + shaftLen / 2;

  return (
    <group position={[x, 0, z]}>
      {/* ด้าม */}
      <mesh
        castShadow={false}
        receiveShadow={false}
        raycast={() => null}
        position={[0, 0.09, shaftCenterZ]}
      >
        <boxGeometry args={[NORTH_ARROW_SHAFT_W, 0.1, shaftLen]} />
        <meshStandardMaterial color={MARKER_COLOR} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* หัวลูกศร — apex ของกรวยชี้ -Z พอดีหลังหมุน -90° รอบแกน X */}
      <mesh
        castShadow={false}
        receiveShadow={false}
        raycast={() => null}
        position={[0, 0.09, headCenterZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={[NORTH_ARROW_HEAD_R, NORTH_ARROW_HEAD_LEN, 16]} />
        <meshStandardMaterial color={MARKER_COLOR} roughness={0.5} metalness={0.1} />
      </mesh>
      <Html
        position={[0, 1.3, -NORTH_ARROW_LEN / 2 - 1.1]}
        center
        distanceFactor={22}
        pointerEvents="none"
        occlude={false}
        zIndexRange={[12, 0]}
      >
        <div
          style={{
            ...ZONE_LABEL_STYLE,
            color: MARKER_COLOR,
            fontSize: 14,
            padding: "2px 9px",
          }}
        >
          N
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Scale bar                                                        */
/* ------------------------------------------------------------------ */

/** ความยาวจริงของแถบสเกล (หน่วยฉาก = เมตร ตาม `layout.unit`) — เป็นเรขาคณิต
 *  จริงในโลก ไม่ใช่เลขที่พิมพ์ลอย ๆ จึงไม่มีทาง "โกหก" สเกล */
const SCALE_BAR_LENGTH = 50;

/**
 * แถบวัดระยะ "0 ─── 50 ม." — วางเป็นวัตถุจริงยาว 50 หน่วยฉากพอดี (=50 เมตร
 * จริง ตาม `layout.unit`) ผู้ใช้จึงกะระยะจริงในฉากได้จากการเทียบสายตากับ
 * แถบนี้ ไม่ต้องคำนวณ/รีเฟรชเลขใด ๆ ตอนซูม เพราะมันคือวัตถุจริงในโลกอยู่แล้ว
 * (ต่างจากแถบสเกลของแผนที่ 2D ที่ต้องคิดเลขใหม่ทุกครั้งที่ซูม เนื่องจากพิกเซล
 * ไม่ผูกกับระยะจริง แต่ในฉาก 3D นี้หน่วยฉากคือเมตรจริงตรง ๆ)
 */
function ScaleBar({ layout }: { layout: PlantLayout }) {
  const x = -layout.hall.w / 2 - SCALE_BAR_LENGTH / 2 - 12;
  const z = layout.hall.d / 2 + 20;
  const barY = 0.09;
  const ticks = [0, 0.5, 1];

  return (
    <group position={[x, 0, z]}>
      <mesh castShadow={false} receiveShadow={false} raycast={() => null} position={[0, barY, 0]}>
        <boxGeometry args={[SCALE_BAR_LENGTH, 0.06, 0.4]} />
        <meshStandardMaterial color={MARKER_COLOR} roughness={0.5} metalness={0.1} />
      </mesh>
      {ticks.map((t) => {
        const tx = -SCALE_BAR_LENGTH / 2 + t * SCALE_BAR_LENGTH;
        return (
          <mesh
            key={t}
            castShadow={false}
            receiveShadow={false}
            raycast={() => null}
            position={[tx, barY + 0.18, 0]}
          >
            <boxGeometry args={[0.12, 0.42, 0.4]} />
            <meshStandardMaterial color={MARKER_COLOR} roughness={0.5} metalness={0.1} />
          </mesh>
        );
      })}
      <Html
        position={[-SCALE_BAR_LENGTH / 2, 0.65, 0]}
        center
        distanceFactor={22}
        pointerEvents="none"
        occlude={false}
        zIndexRange={[12, 0]}
      >
        <div style={ZONE_LABEL_STYLE}>0</div>
      </Html>
      <Html
        position={[SCALE_BAR_LENGTH / 2, 0.65, 0]}
        center
        distanceFactor={22}
        pointerEvents="none"
        occlude={false}
        zIndexRange={[12, 0]}
      >
        <div style={ZONE_LABEL_STYLE}>
          {SCALE_BAR_LENGTH} {layout.unit}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export interface SceneAnnotationsProps {
  layout: PlantLayout;
}

/** รวมป้ายชื่อโซน + เข็มทิศ + แถบสเกล เป็น subtree เดียวให้ `FloorScene.tsx`
 *  เสียบเข้าไปได้ในบรรทัดเดียว */
export function SceneAnnotations({ layout }: SceneAnnotationsProps) {
  return (
    <>
      {layout.site.zones.map((zone) => (
        <ZoneLabel key={zone.id} zone={zone} />
      ))}
      <NorthIndicator layout={layout} />
      <ScaleBar layout={layout} />
    </>
  );
}

export default SceneAnnotations;
