import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlantLayout } from "../../../../lib/plantLayout";
import { eaveYOf } from "./siteShared";
import { PROCESS } from "./palette";

/**
 * ===========================================================================
 * PROCESS EFFECTS — ไอร้อนจากปล่องอบชุบ + ประกายที่โซนตีขึ้นรูป (roadmap step 15)
 * ===========================================================================
 *
 * ปิดท้ายเฟส "make it feel alive": สายพานไถลกล่องแล้ว (`ProductionLines.tsx`),
 * คนงาน/ฟอร์คลิฟท์เดินแล้ว (`FloorActivity.tsx`/`Forklifts.tsx`) — ที่เหลือคือ
 * บรรยากาศกระบวนการเอง สองอย่างที่ subtle มาก ไม่ใช่ของแต่งฉาก:
 *
 *   1. ไอร้อน/ควันลอยขึ้นจากปล่องระบายเหนือโซนอบชุบ (HT-1..4)
 *   2. ประกาย/แสงเรืองจาง ๆ ที่เครื่องจักรงานตีขึ้นรูป/press
 *
 * ทั้งสองผูกกับสถานะเครื่องจักรจริง (`layout.machines[].status`, ที่เดียวกับ
 * HUD/minimap) ไม่ใช่ของประดับที่ลอย/กะพริบอยู่ตลอดเวลาไม่ว่าเครื่องจะทำงาน
 * หรือไม่
 *
 * **สำคัญ — กุญแจคือ archetype ของเครื่องจักร ไม่ใช่โซนที่มันตกลงไป.**
 * รอบแรกของไฟล์นี้ผูกทั้งสองเอฟเฟกต์กับ `zone.kind` ('heat'/'forging') ซึ่งพัง
 * สองทาง: (ก) ไม่มี DB section ไหน map เข้าโซน 'forging' เลย (ดูคอมเมนต์
 * `zoneKindForSection` ใน `plantLayout.ts`) — FRG-A/FRG-B ยืนเปล่าเสมอ ทำให้
 * เอฟเฟกต์ประกายกลายเป็นโค้ดตายที่ไม่มีวันติด และ (ข) วัดจากข้อมูลจริงจริง
 * (`backend/backups/2026-08-17T06-02-46Z/machines.json` ผ่าน `buildPlantLayout`)
 * พบว่าเครื่อง archetype "furnace" ที่ status "run" ไม่ได้อยู่ในโซน HT-1
 * ทั้งหมด — บางตัวถูกแพ็กเข้าโซน "LINES" ด้วย (section ของมันไม่ใช่ "HT" ตาม
 * `zoneKindForSection`) ดังนั้นเกตแบบ zone-only จะพลาดเครื่องอบชุบที่ทำงานจริง
 * ไปบางส่วน แก้โดยเปลี่ยนเกต ("จะแสดงเอฟเฟกต์ไหม") ให้ดูที่ `PlacedMachine.type`
 * (archetype จาก `plantArchetypes.ts`) ทั่วทั้งผัง แทนที่จะดูว่าเครื่องตกอยู่ใน
 * โซนไหน — ตำแหน่งของปล่องไอยังคงอิงโซน 'heat' เหมือนเดิม (ปล่องเป็นโครงสร้าง
 * จริงเหนือ HT-1..4 เท่านั้น ไม่มีปล่องเหนือ LINES) แต่ "จะให้ไอลอยไหม" ดูจาก
 * archetype ทั่วผัง ส่วนประกายที่งานตีขึ้นรูปไม่มีโครงสร้างปล่อง จึงปล่อยตรง
 * ตำแหน่งเครื่องจักรจริงเลย ไม่ผูกกับโซนอีกต่อไป
 *
 * วัดจากชุดข้อมูลจริง (973 แถวนำเข้า, 931 เครื่องถูกวางจริง): archetype
 * "press" + status "run" = 168 เครื่อง (ในโซน WH และ LINES), archetype
 * "furnace" + status "run" = 7 เครื่อง (ในโซน HT-1 และ LINES) — ทั้งคู่มีจริง
 * เอฟเฟกต์ทั้งสองจึงติดจริงกับชุดข้อมูลปัจจุบัน ไม่ใช่โค้ดตาย
 *
 * ตำแหน่งปล่อง: คำนวณสูตรเดียวกับ `siteUtilities.ts`'s `buildExhaustStacks`
 * (อ่านแล้วคัดลอกค่าคงที่มาแทนที่จะแก้ไฟล์นั้น — อยู่นอกรายการไฟล์ที่แก้ได้)
 * ที่ hall.h=10.5 (ค่าคงที่จริงเสมอ ไม่ scale ตามขนาดโรง): eave=10.5*0.78=8.19 ม.,
 * ฐานปล่อง(เหนือปลอกคอ 0.25 ม.)=8.44 ม., ยอดปล่อง=8.44+3.5=11.94 ม. — พ้นสัน
 * หลังคา (≈9.45 ม.) อยู่ 2.49 ม. ไอร้อนเริ่มลอยจากยอดปล่อง (11.94 ม.) ขึ้นไป
 * เท่านั้น จึงไม่มีทางทะลุ/ซ้อนแนวหลังคาที่ต่ำกว่านั้น
 */

const STACK_COLLAR_H = 0.25;
const STACK_RISE = 3.5;
const STACK_COUNT = 2;

/** seed -> [0,1) แบบ deterministic (sine hash เดียวกับ `FloorActivity.tsx`) */
function hash01(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// ---------------------------------------------------------------------------
// ไอร้อน/ควัน — งบ instance คงที่: `STACK_COUNT` ปล่อง x `PUFFS_PER_STACK`
// ก้อนไอต่อปล่อง = 20 ก้อนทั้งผัง เสมอ ไม่ผูกกับจำนวนเครื่องจักร/โซน
// ---------------------------------------------------------------------------
const PUFFS_PER_STACK = 10;
const PLUME_RISE = 3.2;
const PLUME_PERIOD = 6.5;
const PLUME_BASE_SCALE = 0.55;
const PLUME_DRIFT = 0.35;

interface PlumeStack {
  x: number;
  z: number;
  baseY: number;
}

interface PlumePuff {
  stackIdx: number;
  phase: number;
  seed: number;
}

function buildPlumeStacks(layout: PlantLayout): PlumeStack[] {
  // ตำแหน่งปล่องยังคงอิงโซน 'heat' เสมอ (ปล่องจริงเหนือ HT-1..4 เท่านั้น
  // ตามโครงสร้างอาคาร) แต่ "จะให้ไอลอยไหม" ดูจาก archetype "furnace" ทั่วทั้ง
  // ผัง ไม่ใช่แค่เครื่องที่ตกอยู่ในโซนนี้ — วัดจริงพบว่าเครื่อง furnace บาง
  // ตัวถูกแพ็กเข้าโซน LINES ด้วย (ดูคอมเมนต์บนไฟล์) เกตแบบ zone-only จะพลาด
  // เครื่องเหล่านั้นไป
  const heatZones = layout.site.zones.filter((z) => z.kind === "heat");
  if (heatZones.length === 0) return [];

  const furnaceRunning = layout.machines.some((m) => m.type === "furnace" && m.status === "run");
  if (!furnaceRunning) return [];

  const eaveY = eaveYOf(layout.hall.h);
  const zoneMinX = Math.min(...heatZones.map((z) => z.x - z.w / 2));
  const zoneMaxX = Math.max(...heatZones.map((z) => z.x + z.w / 2));
  const zCenter = heatZones.reduce((s, z) => s + z.z, 0) / heatZones.length;
  const stackTop = eaveY + STACK_COLLAR_H + STACK_RISE;

  const stacks: PlumeStack[] = [];
  for (let i = 0; i < STACK_COUNT; i += 1) {
    const frac = (i + 1) / (STACK_COUNT + 1);
    const x = zoneMinX + (zoneMaxX - zoneMinX) * frac;
    stacks.push({ x, z: zCenter, baseY: stackTop });
  }
  return stacks;
}

const PLUME_SCRATCH_POS = new THREE.Vector3();
const PLUME_SCRATCH_QUAT = new THREE.Quaternion();
const PLUME_SCRATCH_SCALE = new THREE.Vector3();
const PLUME_SCRATCH_MATRIX = new THREE.Matrix4();

function HeatPlume({ layout }: { layout: PlantLayout }) {
  const stacks = useMemo(() => buildPlumeStacks(layout), [layout]);
  const puffs = useMemo<PlumePuff[]>(() => {
    if (stacks.length === 0) return [];
    const out: PlumePuff[] = [];
    for (let s = 0; s < stacks.length; s += 1) {
      for (let i = 0; i < PUFFS_PER_STACK; i += 1) {
        const seed = s * PUFFS_PER_STACK + i;
        out.push({ stackIdx: s, phase: hash01(seed * 3.7 + 2), seed });
      }
    }
    return out;
  }, [stacks]);
  const count = puffs.length;

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: PROCESS.plume,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
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
      const puff = puffs[i]!;
      const stack = stacks[puff.stackIdx]!;
      const local = ((t / PLUME_PERIOD + puff.phase) % 1 + 1) % 1;
      const y = stack.baseY + local * PLUME_RISE;
      const wobble = Math.sin(local * Math.PI * 2 * 1.6 + puff.seed) * PLUME_DRIFT;
      const x = stack.x + wobble;
      const z = stack.z + Math.cos(local * Math.PI * 2 * 1.3 + puff.seed) * PLUME_DRIFT;
      // ก้อนไอ "ก่อตัว-จาง" ด้วยขนาด (ไม่ใช้ opacity ต่ออินสแตนซ์ — InstancedMesh
      // ใช้วัสดุร่วมกันตัวเดียว) เล็กตอนเริ่ม/จบ ใหญ่สุดตอนกลางคาบ
      const scale = PLUME_BASE_SCALE * (0.25 + 0.75 * Math.sin(local * Math.PI)) * (1 + local * 0.6);
      PLUME_SCRATCH_POS.set(x, y, z);
      PLUME_SCRATCH_QUAT.identity();
      PLUME_SCRATCH_SCALE.set(scale, scale, scale);
      PLUME_SCRATCH_MATRIX.compose(PLUME_SCRATCH_POS, PLUME_SCRATCH_QUAT, PLUME_SCRATCH_SCALE);
      mesh.setMatrixAt(i, PLUME_SCRATCH_MATRIX);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  // ไม่มีปล่อง/ไม่มีเครื่องอบชุบที่ "run" จริง -> ไม่มีไอให้ลอย ปล่อยว่าง
  if (count === 0) return null;

  return (
    <instancedMesh
      ref={(node: THREE.InstancedMesh | null) => {
        meshRef.current = node;
        if (node) node.raycast = () => null;
      }}
      args={[geometry, material, count]}
      castShadow={false}
      receiveShadow={false}
    />
  );
}

// ---------------------------------------------------------------------------
// ประกาย/แสงเรืองที่เครื่องจักรงานตีขึ้นรูป (archetype "press" — punch/stamp/
// form/grind/finish ฯลฯ ดู `plantArchetypes.ts`; kit ไม่มี archetype "forge"
// แยกต่างหาก งานตีขึ้นรูปจริงจึงจัดเป็น "press" ในระบบนี้) วางที่ตำแหน่งจริง
// ของเครื่องจักรเลย ไม่อิงโซน — งานตีขึ้นรูปไม่มีโครงสร้างปล่อง/ท่อแบบโซน
// อบชุบให้ยึดตำแหน่งได้ ต่างจาก `buildPlumeStacks` ด้านบน
//
// งบคงที่: สูงสุด `EMBER_BUDGET` จุดทั้งผัง เสมอ ไม่ผูกกับจำนวนเครื่อง press
// ที่ "run" จริง (วัดจากชุดข้อมูลจริง = 168 เครื่อง — มากกว่างบมาก) — คัด
// เครื่องที่จะมีประกายด้วย sine-hash ของรหัสเครื่อง (deterministic, ไม่ใช่
// ตามลำดับที่ผังแพ็กมา จะได้กระจายทั่วผังแทนที่จะกระจุกอยู่บล็อกเดียว) แล้ว
// เรียงจากค่าแฮชน้อยไปมาก ตัดเอาแค่ `EMBER_BUDGET` ตัวแรก
// ---------------------------------------------------------------------------
const EMBER_BUDGET = 8;
const EMBER_FLICKER_RATE = 2.2;
/** ความสูงจุดประกายเหนือพื้น (ม.) — ระดับหน้างาน/แม่พิมพ์ของเครื่อง press */
const EMBER_Y = 1.2;

interface EmberPoint {
  x: number;
  z: number;
  y: number;
  seed: number;
}

/** hash01 ของรหัสเครื่อง (string) — รวมรหัสอักขระเป็นตัวเลขก่อนเข้า sine-hash
 *  เดียวกับที่ใช้ทั้งไฟล์ ให้ผลคงที่ต่อเครื่องเสมอ ไม่ขึ้นกับลำดับในอาร์เรย์ */
function hashOfId(id: string): number {
  let acc = 0;
  for (let i = 0; i < id.length; i += 1) acc = acc * 31 + id.charCodeAt(i);
  return hash01(acc);
}

function buildEmbers(layout: PlantLayout): EmberPoint[] {
  const candidates = layout.machines.filter((m) => m.type === "press" && m.status === "run");
  if (candidates.length === 0) return [];

  const ranked = [...candidates].sort((a, b) => hashOfId(a.id) - hashOfId(b.id));
  const picked = ranked.slice(0, EMBER_BUDGET);

  return picked.map((m, i) => ({ x: m.x, z: m.z, y: EMBER_Y, seed: i }));
}

const EMBER_SCRATCH_POS = new THREE.Vector3();
const EMBER_SCRATCH_QUAT = new THREE.Quaternion();
const EMBER_SCRATCH_SCALE = new THREE.Vector3();
const EMBER_SCRATCH_MATRIX = new THREE.Matrix4();

function ForgingGlow({ layout }: { layout: PlantLayout }) {
  const embers = useMemo(() => buildEmbers(layout), [layout]);
  const count = embers.length;

  const geometry = useMemo(() => new THREE.SphereGeometry(0.22, 8, 6), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PROCESS.ember,
        emissive: PROCESS.ember,
        emissiveIntensity: 1.4,
        roughness: 0.5,
        transparent: true,
        opacity: 0.5,
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
      const e = embers[i]!;
      // กะพริบเป็นช่วง ๆ (intermittent) ไม่ใช่เรืองนิ่งตลอด — ใช้ sine สอง
      // ความถี่ต่างกันคูณกันให้จังหวะไม่สม่ำเสมอแบบ deterministic
      const flicker = Math.max(0, Math.sin(t * EMBER_FLICKER_RATE + e.seed) * Math.sin(t * 0.7 + e.seed * 2));
      const scale = 0.4 + flicker * 0.8;
      EMBER_SCRATCH_POS.set(e.x, e.y, e.z);
      EMBER_SCRATCH_QUAT.identity();
      EMBER_SCRATCH_SCALE.set(scale, scale, scale);
      EMBER_SCRATCH_MATRIX.compose(EMBER_SCRATCH_POS, EMBER_SCRATCH_QUAT, EMBER_SCRATCH_SCALE);
      mesh.setMatrixAt(i, EMBER_SCRATCH_MATRIX);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={(node: THREE.InstancedMesh | null) => {
        meshRef.current = node;
        if (node) node.raycast = () => null;
      }}
      args={[geometry, material, count]}
      castShadow={false}
      receiveShadow={false}
    />
  );
}

export interface ProcessEffectsProps {
  layout: PlantLayout;
}

/** ไอร้อนจากปล่องอบชุบ + ประกายที่เครื่องจักรตีขึ้นรูป (archetype "press")
 *  ทั้งคู่ผูกกับ `PlacedMachine.type`/`status` จริงทั่วผัง ไม่ใช่โซนที่ตกอยู่ */
export function ProcessEffects({ layout }: ProcessEffectsProps) {
  if (!layout.machines.length && !layout.site.zones.length) return null;
  return (
    <group>
      <HeatPlume layout={layout} />
      <ForgingGlow layout={layout} />
    </group>
  );
}

export default ProcessEffects;
