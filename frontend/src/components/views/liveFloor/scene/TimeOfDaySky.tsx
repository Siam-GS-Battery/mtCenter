import React, { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { officeSites } from "./siteOffice";
import { RING_ROAD_GAP, RING_ROAD_W, TREE_ROWS } from "./siteShared";
import { NIGHT } from "./palette";
import type { PlantLayout } from "../../../../lib/plantLayout";

/**
 * ===========================================================================
 * TIME OF DAY SKY — roadmap step 16 (sky, sun, night mode, grounding)
 * ===========================================================================
 *
 * ผังนี้จำลองกะการทำงานจริง (เช้า/บ่าย/เย็น/กลางคืน) — สีท้องฟ้า สีหมอก และ
 * ทิศทาง/ความเข้มของดวงอาทิตย์เปลี่ยนตามเวลานาฬิกาจริงของเครื่องผู้ใช้
 * (`Date`) ไม่ใช่ตามเวลาในฉาก
 *
 * ทำไมไม่ใช้ `useFrame` สำหรับส่วนนี้
 * ------------------------------------
 * เวลาของวันเปลี่ยนช้ามาก (ครบรอบใน 24 ชม.) คำนวณทุกเฟรม (60 ครั้ง/วินาที)
 * จึงเปลืองโดยไม่มีประโยชน์ ที่นี่ใช้ `setInterval` คำนวณค่าเป้าหมายทุก 30
 * วินาทีแล้วเขียนตรงลง object ของ three.js (`scene.background`,
 * `scene.fog.color`, light refs, material refs) — ไม่มี React state และไม่มี
 * การจัดสรรหน่วยความจำต่อเฟรมเลย (ตรงตามแพทเทิร์นเดียวกับ `Forklifts.tsx` /
 * `FloorActivity.tsx` / `CameraRig`)
 *
 * ความชัดเจนของสีสถานะ (status legibility) ตอนกลางคืน
 * ------------------------------------------------------
 * ไฟล์นี้จงใจ "ไม่แตะ" `STATUS`/`STACK_LIGHT` ใน `palette.ts` เลย และไม่แตะ
 * `gl.toneMappingExposure` ด้วย — วัสดุ emissive ของโคมสัญญาณ/สถานะเครื่องจักร
 * (ดู `MachineInstances.tsx`) เรนเดอร์อิสระจากไฟในฉากและ exposure คงที่ สีที่
 * ผู้ใช้เห็นตอนกลางวันกับกลางคืนจึงเป็นค่าเดียวกันทุกบิต ต่างกันแค่พื้นหลังรอบ ๆ
 * มืดลง (ซึ่งทำให้ contrast ของสถานะยิ่งเด่นขึ้น ไม่ใช่ด้อยลง — ดูหมายเหตุข้อ 1
 * ที่หัวไฟล์ `liveFloorTheme.ts`)
 */

const UPDATE_INTERVAL_MS = 30_000;

interface SkyKeyframe {
  hour: number;
  sky: string;
  fog: string;
  sunColor: string;
  sunElevDeg: number;
  sunAzimuthDeg: number;
  sunIntensity: number;
  ambient: number;
  hemi: number;
  /** 0 = กลางวัน (ไฟไซต์ดับ) .. 1 = กลางคืนเต็มที่ (โคมไฟ/หน้าต่างติดเต็มที่) */
  nightGlow: number;
}

// จุดยึดตลอด 24 ชม. — ไล่เชิงเส้นระหว่างสองจุดที่ใกล้ที่สุด (ดู `sampleSky`)
// กะเช้า/บ่าย/ดึกของโรงงานจริง: มืดสนิทดึก, รุ่งสาง ~06:00, สว่างเต็มที่ตอน
// เที่ยง, บ่ายแก่ ๆ อุ่นขึ้น ~16:00, พลบค่ำ ~18:00-19:30 แล้วมืดอีกครั้ง
const KEYFRAMES: SkyKeyframe[] = [
  { hour: 0, sky: NIGHT.skyNight, fog: NIGHT.fogNight, sunColor: NIGHT.sunDawn, sunElevDeg: -70, sunAzimuthDeg: -90, sunIntensity: 0.02, ambient: 0.12, hemi: 0.14, nightGlow: 1 },
  { hour: 5, sky: NIGHT.skyNight, fog: NIGHT.fogNight, sunColor: NIGHT.sunDawn, sunElevDeg: -20, sunAzimuthDeg: -100, sunIntensity: 0.05, ambient: 0.14, hemi: 0.16, nightGlow: 1 },
  { hour: 6.5, sky: NIGHT.skyDawn, fog: NIGHT.fogNight, sunColor: NIGHT.sunDawn, sunElevDeg: 3, sunAzimuthDeg: -105, sunIntensity: 0.55, ambient: 0.26, hemi: 0.34, nightGlow: 0.45 },
  { hour: 8, sky: NIGHT.skyDay, fog: NIGHT.fogDay, sunColor: NIGHT.sunDay, sunElevDeg: 26, sunAzimuthDeg: -70, sunIntensity: 1.3, ambient: 0.4, hemi: 0.58, nightGlow: 0 },
  { hour: 12, sky: NIGHT.skyDay, fog: NIGHT.fogDay, sunColor: NIGHT.sunDay, sunElevDeg: 68, sunAzimuthDeg: 0, sunIntensity: 1.6, ambient: 0.48, hemi: 0.7, nightGlow: 0 },
  { hour: 16, sky: NIGHT.skyDay, fog: NIGHT.fogDay, sunColor: NIGHT.sunDusk, sunElevDeg: 30, sunAzimuthDeg: 70, sunIntensity: 1.4, ambient: 0.42, hemi: 0.62, nightGlow: 0 },
  { hour: 18, sky: NIGHT.skyDusk, fog: NIGHT.fogNight, sunColor: NIGHT.sunDusk, sunElevDeg: 5, sunAzimuthDeg: 100, sunIntensity: 0.5, ambient: 0.28, hemi: 0.36, nightGlow: 0.5 },
  { hour: 19.5, sky: NIGHT.skyNight, fog: NIGHT.fogNight, sunColor: NIGHT.sunDusk, sunElevDeg: -15, sunAzimuthDeg: 105, sunIntensity: 0.05, ambient: 0.16, hemi: 0.18, nightGlow: 0.9 },
  { hour: 21, sky: NIGHT.skyNight, fog: NIGHT.fogNight, sunColor: NIGHT.sunDawn, sunElevDeg: -50, sunAzimuthDeg: -90, sunIntensity: 0.02, ambient: 0.12, hemi: 0.14, nightGlow: 1 },
  { hour: 24, sky: NIGHT.skyNight, fog: NIGHT.fogNight, sunColor: NIGHT.sunDawn, sunElevDeg: -70, sunAzimuthDeg: -90, sunIntensity: 0.02, ambient: 0.12, hemi: 0.14, nightGlow: 1 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** ไล่เชิงเส้นระหว่างจุดยึดที่ใกล้ที่สุดสองจุดสำหรับชั่วโมง (0-24) ที่ให้มา */
function sampleSky(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  let lo = KEYFRAMES[0];
  let hi = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i += 1) {
    if (h >= KEYFRAMES[i].hour && h <= KEYFRAMES[i + 1].hour) {
      lo = KEYFRAMES[i];
      hi = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = hi.hour - lo.hour || 1;
  const t = (h - lo.hour) / span;
  return {
    sky: new THREE.Color(lo.sky).lerp(new THREE.Color(hi.sky), t),
    fog: new THREE.Color(lo.fog).lerp(new THREE.Color(hi.fog), t),
    sunColor: new THREE.Color(lo.sunColor).lerp(new THREE.Color(hi.sunColor), t),
    sunElevDeg: lerp(lo.sunElevDeg, hi.sunElevDeg, t),
    sunAzimuthDeg: lerp(lo.sunAzimuthDeg, hi.sunAzimuthDeg, t),
    sunIntensity: lerp(lo.sunIntensity, hi.sunIntensity, t),
    ambient: lerp(lo.ambient, hi.ambient, t),
    hemi: lerp(lo.hemi, hi.hemi, t),
    nightGlow: lerp(lo.nightGlow, hi.nightGlow, t),
  };
}

/**
 * โคมไฟถนน — instanced 2 draw call รวม (เสา + หัวโคม) ไม่ว่าจะมีกี่ต้น วางเป็น
 * วงรอบขอบไซต์ (นอกโรงจริง) ระยะห่างคงที่ — ตำแหน่งเดาโดยประมาณจากขนาดไซต์
 * เท่านั้น (ไม่ผูกกับพิกัดถนนจริงใน `siteRoads.ts` ซึ่งไฟล์นี้ห้ามแก้/อาจถูก
 * แก้พร้อมกันโดยเอเจนต์อื่น) — เป็นแค่ไฟประดับบรรยากาศกลางคืน ไม่ใช่ระบบไฟถนน
 * จริงที่ต้องล็อกตำแหน่งกับผังถนน
 */
const POLE_SPACING = 55;
/**
 * ระยะจากผนังโรง (เมตร) ที่ต้องเคลียร์ **สองอย่างพร้อมกัน**:
 *   1. ถนนวงรอบ (`siteRoads.ts`) — ขอบนอกจริงอยู่ที่ผนัง +
 *      `RING_ROAD_GAP + RING_ROAD_W` = 9 + 8 = 17 ม.
 *   2. แนวต้นไม้แถวแรก (`siteShared.ts`, `TREE_ROWS[0]` = 22 ม.)
 *
 * บั๊กที่แก้: ค่าเดิม (26 ม.) เดาเอาเองโดยไม่เช็คกับ `TREE_ROWS` เลย ดันเสาไฟ
 * ไปยืนแทรกอยู่ *ระหว่าง* แถวต้นไม้แถวแรกกับแถวที่สอง (31 ม.) — อยู่ในระยะ
 * ทรงพุ่มของทั้งสองแถว
 *
 * ช่องว่างจริงที่เคลียร์ทั้งถนนและต้นไม้คือ 17-22 ม. — ใช้ margin คงที่ 2 ม.
 * เหนือขอบถนน (แทนสัดส่วนตายตัวของ `TREE_ROWS[0]`) ให้เสาไฟยืนอยู่บนไหล่ถนน
 * (ตำแหน่งที่ไฟถนนจริงควรอยู่) และยังเหลือช่องว่าง 3 ม. ก่อนถึงแนวต้นไม้แถวแรก
 * ถ้า `RING_ROAD_GAP`/`RING_ROAD_W`/`TREE_ROWS[0]` เปลี่ยน ค่านี้ขยับตามอัตโนมัติ
 * — ไม่ hardcode ตัวเลขไว้ตรงนี้เหมือนบั๊กเดิม
 */
const RING_ROAD_OUTER_EDGE = RING_ROAD_GAP + RING_ROAD_W; // 9 + 8 = 17
const POLE_MARGIN = RING_ROAD_OUTER_EDGE + 2; // 19 — เคลียร์ถนน (17) และสั้นกว่า TREE_ROWS[0] (22) อยู่ 3 ม.
const POLE_HEIGHT = 8;

function buildPolePositions(siteWidth: number, siteDepth: number): Array<[number, number]> {
  const hw = siteWidth / 2 + POLE_MARGIN;
  const hd = siteDepth / 2 + POLE_MARGIN;
  const positions: Array<[number, number]> = [];
  const stepsX = Math.max(1, Math.round((hw * 2) / POLE_SPACING));
  const stepsZ = Math.max(1, Math.round((hd * 2) / POLE_SPACING));
  for (let i = 0; i <= stepsX; i += 1) {
    const x = -hw + (i * (hw * 2)) / stepsX;
    positions.push([x, -hd]);
    positions.push([x, hd]);
  }
  for (let i = 1; i < stepsZ; i += 1) {
    const z = -hd + (i * (hd * 2)) / stepsZ;
    positions.push([-hw, z]);
    positions.push([hw, z]);
  }
  return positions;
}

const _dummy = new THREE.Object3D();

function PoleLights({ siteWidth, siteDepth }: { siteWidth: number; siteDepth: number }) {
  const positions = useMemo(() => buildPolePositions(siteWidth, siteDepth), [siteWidth, siteDepth]);
  const shaftRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);

  // ปั้น geometry/material ครั้งเดียวด้วย useMemo แล้วส่งผ่าน `args` เหมือน
  // แพทเทิร์นเดียวกับ `ArchetypeInstances`/`ContactShadowInstances` ใน
  // `MachineInstances.tsx` (ไม่ใช้ JSX children ปั้น geometry/material)
  const shaftGeometry = useMemo(() => new THREE.CylinderGeometry(0.08, 0.1, POLE_HEIGHT, 6), []);
  const shaftMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: NIGHT.poleShaft, roughness: 0.7, metalness: 0.4 }),
    []
  );
  const lampGeometry = useMemo(() => new THREE.SphereGeometry(0.35, 8, 8), []);
  const lampMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: NIGHT.poleLampLit,
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
    []
  );

  useEffect(() => {
    const shaft = shaftRef.current;
    const lamp = lampRef.current;
    if (!shaft || !lamp) return;
    positions.forEach(([x, z], i) => {
      _dummy.position.set(x, POLE_HEIGHT / 2, z);
      _dummy.updateMatrix();
      shaft.setMatrixAt(i, _dummy.matrix);
      _dummy.position.set(x, POLE_HEIGHT, z);
      _dummy.updateMatrix();
      lamp.setMatrixAt(i, _dummy.matrix);
    });
    shaft.instanceMatrix.needsUpdate = true;
    lamp.instanceMatrix.needsUpdate = true;
  }, [positions]);

  useEffect(() => {
    return () => {
      shaftGeometry.dispose();
      shaftMaterial.dispose();
      lampGeometry.dispose();
      lampMaterial.dispose();
    };
  }, [shaftGeometry, shaftMaterial, lampGeometry, lampMaterial]);

  const lampMatRef = useRef<THREE.MeshBasicMaterial | null>(lampMaterial);

  return (
    <group>
      <instancedMesh ref={shaftRef} args={[shaftGeometry, shaftMaterial, positions.length]} raycast={() => null} />
      <instancedMesh ref={lampRef} args={[lampGeometry, lampMaterial, positions.length]} raycast={() => null} />
      <NightGlowBinding target={lampMatRef} name="pole" />
    </group>
  );
}

/**
 * หน้าต่างสำนักงานตอนกลางคืน — ใช้ตำแหน่งจาก `officeSites()` ของ
 * `siteOffice.ts` (อ่านอย่างเดียว ไม่แก้ไฟล์นั้น) วางแผ่นเรืองแสงจาง ๆ แนบผิว
 * กระจกเดิม 4 ด้านต่ออาคาร แทนแสงจริง — ถูกกว่าและควบคุมง่ายกว่าไฟจริงต่อชั้น
 */
interface WindowFace {
  key: string;
  position: [number, number, number];
  rotationY: number;
  width: number;
}

function buildWindowFaces(sites: ReturnType<typeof officeSites>): WindowFace[] {
  const glowY = 6;
  const o = 0.12;
  const faces: WindowFace[] = [];
  sites.forEach((site, i) => {
    faces.push({ key: `${i}-n`, position: [site.x, glowY, site.z + site.d / 2 + o], rotationY: 0, width: site.w * 0.86 });
    faces.push({ key: `${i}-s`, position: [site.x, glowY, site.z - site.d / 2 - o], rotationY: Math.PI, width: site.w * 0.86 });
    faces.push({ key: `${i}-e`, position: [site.x + site.w / 2 + o, glowY, site.z], rotationY: Math.PI / 2, width: site.d * 0.86 });
    faces.push({ key: `${i}-w`, position: [site.x - site.w / 2 - o, glowY, site.z], rotationY: -Math.PI / 2, width: site.d * 0.86 });
  });
  return faces;
}

const WINDOW_GLOW_H = 9;

function OfficeWindowGlow({ siteWidth, siteDepth }: { siteWidth: number; siteDepth: number }) {
  const faces = useMemo(() => buildWindowFaces(officeSites(siteWidth, siteDepth)), [siteWidth, siteDepth]);
  const matRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);

  return (
    <group>
      {faces.map((face, i) => (
        <mesh key={face.key} position={face.position} rotation={[0, face.rotationY, 0]} raycast={() => null}>
          <planeGeometry args={[face.width, WINDOW_GLOW_H]} />
          <meshBasicMaterial
            ref={(m) => {
              matRefs.current[i] = m;
            }}
            color={NIGHT.windowLit}
            transparent
            opacity={0}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <NightGlowBinding target={matRefs} name="windows" multi />
    </group>
  );
}

/**
 * ป้อมยาม/ประตูหน้าไซต์ — จุดเรืองแสงเดียวที่ตำแหน่งจริงของ "MAIN GATE road"
 *
 * บั๊กที่แก้: เดิมเดา `x=0, z=siteDepth/2+34` ล้วน ๆ โดยไม่อ้างอิงข้อมูลจริง
 * เลย ป้อมยาม/ประตูจริงอยู่คนละตำแหน่งกับกึ่งกลางไซต์ (แนวขวางไม่ใช่ 0)
 *
 * `siteEntrance.ts` (ห้ามแก้/import ค่าคงที่ภายใน) เองก็ยึด
 * `layout.site.roads.find(r => r.name === "MAIN GATE road")` เป็นจุดยึดหลัก
 * ของทั้งกลุ่มป้อมยาม/ประตู/ตาชั่ง (ระยะ along/across ที่มันคำนวณต่อจากจุดนี้
 * ล้วนอยู่ในหลักหน่วยเมตร) จุดยึดเดียวกันนี้จึงเพียงพอสำหรับ "จุดสว่างบริเวณ
 * ประตู" — ไม่ต้อง reproduce ค่าคงที่ offset ภายในไฟล์นั้น
 */
function GateGlow({ siteWidth, siteDepth, gateX, gateZ }: { siteWidth: number; siteDepth: number; gateX: number; gateZ: number }) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  return (
    <group>
      <mesh position={[gateX, 4.5, gateZ]} raycast={() => null}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshBasicMaterial ref={matRef} color={NIGHT.gateLit} transparent opacity={0} toneMapped={false} />
      </mesh>
      <NightGlowBinding target={matRef} name="gate" />
    </group>
  );
}

/**
 * หาตำแหน่งจริงของ "MAIN GATE road" จาก `layout.site.roads` — ถ้าหาไม่เจอ
 * (ผังไม่มีถนนชื่อนี้) ใช้ค่าประมาณเดิมเป็น fallback แทนที่จะพัง
 */
function findGatePosition(layout: PlantLayout, siteDepth: number): { x: number; z: number } {
  const gateRoad = layout.site.roads.find((r) => r.name === "MAIN GATE road");
  if (!gateRoad) return { x: 0, z: siteDepth / 2 + 34 };
  return { x: gateRoad.x, z: gateRoad.z };
}

/**
 * สะพานเขียน `nightGlow` (0..1) ลงวัสดุ emissive โดยไม่ผ่าน React re-render —
 * `TimeOfDaySky` เขียน `sharedNightGlow` (ตัวแปรระดับโมดูลตรงนี้ ไม่ใช่ React
 * state) ทุก 30 วิ ในตัวเดียวกับที่คำนวณท้องฟ้า/แสง ส่วน component นี้แค่ poll
 * ค่านั้นทุก 1 วิ (ไม่ใช่ทุกเฟรม) แล้วเขียน `.opacity` ทับก็ต่อเมื่อค่าจริง
 * เปลี่ยน — ไม่มี `useFrame`, ไม่มี React state, ไม่มีการจัดสรรหน่วยความจำ
 * ต่อเฟรมเลยในทั้งสามจุด (เสาไฟ/หน้าต่าง/ประตู) ที่ใช้สะพานนี้
 */
let sharedNightGlow = 0;

function NightGlowBinding({
  target,
  multi,
}: {
  target:
    | React.RefObject<THREE.MeshBasicMaterial | null>
    | React.RefObject<Array<THREE.MeshBasicMaterial | null>>;
  name: string;
  multi?: boolean;
}) {
  const lastRef = useRef(-1);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (sharedNightGlow === lastRef.current) return;
      lastRef.current = sharedNightGlow;
      if (multi) {
        const mats = (target as React.RefObject<Array<THREE.MeshBasicMaterial | null>>).current;
        mats?.forEach((m) => {
          if (m) m.opacity = sharedNightGlow * 0.85;
        });
      } else {
        const m = (target as React.RefObject<THREE.MeshBasicMaterial | null>).current;
        if (m) m.opacity = sharedNightGlow * 0.85;
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [target, multi]);
  return null;
}

export interface TimeOfDaySkyProps {
  /** ใช้เฉพาะ `layout.site.roads` เพื่อหาตำแหน่งจริงของ "MAIN GATE road" (ดู `findGatePosition`) */
  layout: PlantLayout;
  siteWidth: number;
  siteDepth: number;
  sunRef: React.RefObject<THREE.DirectionalLight | null>;
  ambientRef: React.RefObject<THREE.AmbientLight | null>;
  hemiRef: React.RefObject<THREE.HemisphereLight | null>;
}

/**
 * เจ้าของ interval หลัก — คำนวณ keyframe จากเวลาจริง แล้วเขียนลง:
 *  - `scene.background` / `scene.fog.color` (สีท้องฟ้า/หมอก)
 *  - แสงคีย์ (`sunRef`) ตำแหน่ง/สี/ความเข้ม
 *  - ไฟเติม (`ambientRef`/`hemiRef`) ความเข้ม
 *  - `sharedNightGlow` (โมดูลตัวแปรเดียว ไม่ใช่ React state) ที่ `NightGlowBinding`
 *    ของลูกทุกตัวอ่านทุก 1 วิ
 */
export function TimeOfDaySky({ layout, siteWidth, siteDepth, sunRef, ambientRef, hemiRef }: TimeOfDaySkyProps) {
  const scene = useThree((s) => s.scene);
  const reach = Math.hypot(siteWidth, siteDepth);
  const gatePos = useMemo(() => findGatePosition(layout, siteDepth), [layout, siteDepth]);

  useEffect(() => {
    const apply = () => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      const kf = sampleSky(hour);

      scene.background = kf.sky;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.copy(kf.fog);
      }

      const sun = sunRef.current;
      if (sun) {
        sun.intensity = kf.sunIntensity;
        sun.color.copy(kf.sunColor);
        const elev = THREE.MathUtils.degToRad(kf.sunElevDeg);
        const az = THREE.MathUtils.degToRad(kf.sunAzimuthDeg);
        const dist = reach * 0.75;
        // กันดวงอาทิตย์ลงต่ำกว่าระนาบพื้นมากไป ไม่งั้น shadow frustum จะเสื่อม
        // สภาพ (แสงเงย/มุมเงาบิดเบี้ยว) ตอนดึกที่ intensity ต่ำมากอยู่แล้ว จึง
        // ไม่กระทบภาพที่มองเห็น
        const height = Math.max(dist * Math.sin(elev), reach * 0.08);
        sun.position.set(dist * Math.cos(elev) * Math.sin(az), height, dist * Math.cos(elev) * Math.cos(az));
      }
      const amb = ambientRef.current;
      if (amb) amb.intensity = kf.ambient;
      const hemi = hemiRef.current;
      if (hemi) hemi.intensity = kf.hemi;

      sharedNightGlow = kf.nightGlow;
    };

    apply();
    const id = window.setInterval(apply, UPDATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [scene, sunRef, ambientRef, hemiRef, reach]);

  return (
    <>
      <PoleLights siteWidth={siteWidth} siteDepth={siteDepth} />
      <OfficeWindowGlow siteWidth={siteWidth} siteDepth={siteDepth} />
      <GateGlow siteWidth={siteWidth} siteDepth={siteDepth} gateX={gatePos.x} gateZ={gatePos.z} />
    </>
  );
}

export default TimeOfDaySky;
