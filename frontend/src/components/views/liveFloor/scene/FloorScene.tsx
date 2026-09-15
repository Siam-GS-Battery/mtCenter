import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { PlantLayout } from "../../../../lib/plantLayout";
import { isWideCameraPreset, type CameraFocusBox, type PlantCameraPreset } from "./sceneConfig";
import { BACKGROUND, FOG, LIGHT } from "./palette";
import FloorGrid from "./FloorGrid";
import FloorActivity from "./FloorActivity";
import FloorMarkings from "./FloorMarkings";
import Forklifts from "./Forklifts";
import { HallRoof } from "./HallRoof";
import MachineInstances from "./MachineInstances";
import PlantShell from "./PlantShell";
import ProcessEffects from "./ProcessEffects";
import ProductionLines from "./ProductionLines";
import SceneAnnotations from "./SceneAnnotations";
import SiteEnvironment from "./SiteEnvironment";
import TimeOfDaySky from "./TimeOfDaySky";
import WarehouseRacking from "./WarehouseRacking";

/**
 * ===========================================================================
 * FLOOR SCENE — ฉาก Three.js ตัวใหม่ของผังโรงงาน
 * ===========================================================================
 *
 * แทนที่ `_archive/plant/PlantSceneShell.tsx` + `PlantEnvironment` +
 * `PlantMachines` + kit ที่ generate มา (~6,100 บรรทัด) ที่ยกไปเก็บไว้ที่
 * `../_archive/` ทั้งชุด
 *
 * ฉากประกอบจากสามชั้น ทุกชั้นปั้นจากเรขาคณิต Three.js ล้วน ไม่มีภาพและไม่มี
 * ไฟล์โมเดลจากภายนอก
 *   1. `PlantShell` — พื้น โซน เสาโครงสร้างตามระยะ bay จริง ผนัง และไซต์
 *      ภายนอก (ถนน ลานจอด อาคาร ต้นไม้ ถังเก็บ รั้ว)
 *   2. `MachineInstances` — เครื่องจักร 10 ชนิดที่ปั้นเป็นรูปทรงโค้งมนใน
 *      `machineModels.ts` วางตามตำแหน่ง/มุมที่ `lib/plantLayout.ts` แพ็คไว้
 *   3. `ProductionLines` — สายพานลำเลียงที่ร้อยเครื่องเข้าเป็นไลน์การผลิต
 *   4. `SiteEnvironment` — เลนคน/เลนรถ อาคารคลุมไลน์ต่อโซน (หลังคาเปิด-ปิด
 *      ได้) ถนนวงรอบ แนวต้นไม้ อาคารสำนักงาน ป้อมยาม ประตูรั้ว บ่อบำบัด
 *   5. `FloorMarkings` — เส้นตีพื้นโรงงาน: เส้นเหลืองขนาบทางเดิน กรอบขอบเขต
 *      เครื่องจักร ลานพาเลท ลูกศรทิศทางฟอร์คลิฟท์ ทั้งหมดวางเหนือชั้นพื้น
 *      ของ `PlantShell`/`SiteEnvironment`/`FloorGrid`
 *
 * สิ่งที่ยังคงเป็นสัญญาเดิมทั้งหมด (แผงและรายละเอียดรอบ ๆ จึงไม่ต้องแก้):
 *   • props ชุดเดียวกับ `PlantSceneShell` — `siteWidth`/`siteDepth`,
 *     `cameraPreset`, `focusBox`, `followPoint`, `highQuality`,
 *     `onContextLost`/`onContextRestored`, `children`
 *   • `children` ยังเป็น subtree ของ R3F ตามเดิม จึงเสียบ `InspectorRobot`
 *     (หุ่นยนต์เดินตรวจ) เข้ามาได้เหมือนเดิม
 *   • สัญญาณ context หาย/คืน ยังส่งออกไปให้ LiveFloorView แสดง
 *     `ContextLostPanel` ได้ตามเดิม
 */

/** เพดาน devicePixelRatio — คุมค่าเรนเดอร์บนจอความละเอียดสูง */
const DPR_CAP_HIGH = 1.75;
const DPR_CAP_LOW = 1;

/** ระยะซูมเข้าใกล้สุด (เมตร) — ยืนชิดตัวเครื่องได้ */
const MIN_DISTANCE = 3;
/** พื้นระยะซูมออก (เมตร) — ค่าจริงโตตามขนาดไซต์ ดู `maxDistance` ใน CameraRig */
const MAX_DISTANCE = 900;

/** กันกล้องมุดลงใต้พื้น */
const MAX_POLAR_ANGLE = Math.PI * 0.488;

const CAMERA_FOV = 45;
/** เผื่อไว้เหนือ `MIN_DISTANCE` (3) พอสมควร กัน depth buffer แม่นยำหายตอนซูมเข้าใกล้ */
const CAMERA_NEAR = 1.5;
/** ค่าเริ่มต้นของ frustum ก่อน `CameraRig` คำนวณจากขนาดไซต์จริง */
const CAMERA_FAR_FALLBACK = 1400;

/** ระดับสายตาคนเดินในโรงงาน (เมตร) — ใช้กับมุม "eye" */
const EYE_HEIGHT = 1.7;

/** สัดส่วนที่กล้อง/เป้าเลื่อนเข้าหาค่าเป้าหมายต่อเฟรม (ยิ่งน้อยยิ่งนวล) */
const CAMERA_EASE = 0.08;

/**
 * ระยะ/ความสูงกล้องตอน "ตามหุ่น" (เมตร) — มุมเฉียงหลังไหล่ (over-the-shoulder)
 *
 * ค่าคงที่ตายตัว "ไม่" สเกลตาม `scale.factor` ของ `buildPlantLayout` โดยตั้งใจ
 * — factor นั้นแค่ขยาย "ระยะห่างระหว่างเครื่อง" ในผังให้พอดีจำนวนเครื่องจริง
 * (ดูคอมเมนต์ sx/sz ใน LiveFloorView.tsx) ไม่มี <group scale> ห่อฉากทั้งก้อน
 * เมช/หุ่นยนต์ยังเรนเดอร์ 1:1 เมตรเสมอ หุ่นสูงจริงราว 1.8 ม. จึงใช้ระยะคงที่
 * ที่เฟรมพอดีกับ fov 45 ได้ทุกไซต์ ไม่ว่าโรงงานจะใหญ่แค่ไหน
 */
const FOLLOW_DISTANCE = 14;
const FOLLOW_HEIGHT = 7.5;

interface CameraPlacement {
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * วางกล้องจากขนาดไซต์ + มุมที่เลือก + กล่องที่โฟกัส
 *
 * ตั้งใจให้เป็นเลขคณิตไม่กี่บรรทัด แทน `plantSceneConfig.ts` เดิมที่มีฟังก์ชัน
 * คำนวณกล้อง/เงา/หมอกสิบกว่าตัวผูกกับรูปทรงฉากเก่า: กรอบกล่องเป้าหมายด้วย
 * ระยะที่พอดีกับเส้นทแยงมุมของมัน สูตรเดียวใช้ได้ทั้งไซต์ทั้งผืนและ zone เดี่ยว
 */
function computePlacement(
  siteWidth: number,
  siteDepth: number,
  preset: PlantCameraPreset,
  focusBox: CameraFocusBox | null
): CameraPlacement {
  // มุมกว้าง ("plant"/"top") กรอบทั้งไซต์เสมอ จึงเมิน focusBox ทิ้ง —
  // การซูมเข้า zone ขัดกับความหมายของมุมนี้ (ดู `isWideCameraPreset`)
  const wide = isWideCameraPreset(preset);
  const box: CameraFocusBox =
    !wide && focusBox ? focusBox : { x: 0, z: 0, width: siteWidth, depth: siteDepth };

  const target: [number, number, number] = [box.x, 0, box.z];
  // ระยะที่ทำให้กล่องกว้างเท่าเส้นทแยงมุมพอดีเฟรมที่ fov นี้ (+ เผื่อขอบ 15%)
  const diagonal = Math.hypot(box.width, box.depth);
  const fit = ((diagonal / 2) / Math.tan((CAMERA_FOV * Math.PI) / 360)) * 1.15;

  switch (preset) {
    case "top":
      // เยื้อง z เล็กน้อย ไม่ให้กล้องกับ up-vector ขนานกันจนหมุนไม่ได้
      return { position: [box.x, fit * 1.05, box.z + 0.001], target };
    case "eye":
      return {
        position: [box.x - box.width * 0.5, EYE_HEIGHT, box.z + box.depth * 0.55],
        target: [box.x, EYE_HEIGHT, box.z],
      };
    case "plant":
      return { position: [box.x + fit * 0.62, fit * 0.55, box.z + fit * 0.72], target };
    case "line":
    default:
      return { position: [box.x + fit * 0.45, fit * 0.32, box.z + fit * 0.62], target };
  }
}

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>;

/**
 * ขับกล้องและ OrbitControls
 *
 * เลื่อนกล้องเข้าหาค่าเป้าหมายแบบ ease ทุกเฟรมแทนการ set ทันที เพื่อให้การ
 * สลับมุมจาก HUD หรือกดเลือก zone ดูเป็นการบินไป ไม่ใช่การกระโดด
 *
 * ห้ามมี React state ในนี้ — ทุกอย่างเขียนลง ref/object ของ three.js ตรง ๆ
 * (กฎเดียวกับ `InspectorRobot.tsx`) ไม่งั้นได้ re-render 60 ครั้งต่อวินาที
 */
function CameraRig({
  siteWidth,
  siteDepth,
  cameraPreset,
  focusBox,
  followPoint,
  onCameraFrame,
}: {
  siteWidth: number;
  siteDepth: number;
  cameraPreset: PlantCameraPreset;
  focusBox: CameraFocusBox | null;
  followPoint?: (() => { x: number; z: number } | null) | null;
  onCameraFrame?:
    | ((x: number, z: number, dirX: number, dirZ: number, halfFovDeg: number, distance: number) => void)
    | null;
}) {
  const camera = useThree((s) => s.camera);
  const controlsRef = useRef<OrbitControlsRef | null>(null);
  // Reused scratch vector for the minimap's frustum indicator (roadmap step
  // 5, `Minimap.tsx`) -- never reallocated per frame.
  const cameraDirRef = useRef(new THREE.Vector3());

  const placement = useMemo(
    () => computePlacement(siteWidth, siteDepth, cameraPreset, focusBox),
    [siteWidth, siteDepth, cameraPreset, focusBox]
  );

  // ระยะไกลสุดของ frustum โตตามไซต์ ไม่ใช่ค่าคงที่ — ไซต์จริงสเกลตามจำนวน
  // เครื่องในฐานข้อมูล จึงใหญ่กว่าไซต์อ้างอิงได้หลายเท่า (ดูคอมเมนต์เรื่อง
  // sx/sz ใน LiveFloorView.tsx) ถ้า far ตายตัวไว้ ไซต์ใหญ่จะถูก clip หายไป
  const cameraFar = useMemo(
    () => Math.max(CAMERA_FAR_FALLBACK, Math.hypot(siteWidth, siteDepth) * 4),
    [siteWidth, siteDepth]
  );

  /**
   * ระยะซูมออกไกลสุด ต้องโตตามไซต์ ไม่ใช่ค่าคงที่
   *
   * บั๊กที่แก้: เดิมตั้งไว้ตายตัว 900 ม. แต่ไซต์จริงที่สเกลจากฐานข้อมูลคือราว
   * 655 x 1,224 ม. ระยะกล้องที่มุม "plant"/"top" ต้องใช้เพื่อกรอบทั้งไซต์จึง
   * เป็นราว 2,100 ม. — เกินเพดานไปกว่าเท่าตัว
   *
   * ผลคือ OrbitControls บีบกล้องกลับเข้ามาที่ 900 ม. ทุกเฟรม ขณะที่ตัว ease
   * ดันออกไปหา 2,100 ม. ทุกเฟรม กล้องจึงสั่นค้างอยู่กับที่และซูมออกไม่ได้เลย
   * (อาการเดียวกับที่รายงานว่า "ขยับอะไรไม่ได้") เผื่อไว้ 2.2 เท่าของเส้น
   * ทแยงมุมไซต์ ซึ่งครอบระยะที่ทุก preset ต้องใช้
   */
  const maxDistance = useMemo(
    () => Math.max(MAX_DISTANCE, Math.hypot(siteWidth, siteDepth) * 2.2),
    [siteWidth, siteDepth]
  );

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = CAMERA_FOV;
    camera.near = CAMERA_NEAR;
    camera.far = cameraFar;
    camera.updateProjectionMatrix();
  }, [camera, cameraFar]);

  // กระโดดไปตำแหน่งเริ่มต้นทันทีในเฟรมแรก ไม่ให้เห็นกล้อง ease มาจากตำแหน่ง
  // ตั้งต้นของ Canvas ตอนเปิดฉาก — เฉพาะครั้งแรก การสลับมุมทีหลังยัง ease
  const primedRef = useRef(false);
  useEffect(() => {
    if (primedRef.current) return;
    primedRef.current = true;
    camera.position.set(...placement.position);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(...placement.target);
      controls.update();
    }
  }, [camera, placement]);

  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  /**
   * true = กล้องกำลังบินไปยัง `placement` อยู่ / false = ผู้ใช้เป็นเจ้าของกล้อง
   *
   * ตัวนี้คือหัวใจของการไม่แย่งกล้องกับ OrbitControls
   *
   * เดิมโค้ดนี้ lerp กล้องเข้าหา `placement` ทุกเฟรมไม่มีเงื่อนไข ผลคือทุกครั้ง
   * ที่ผู้ใช้ลากหมุน/แพน/ซูม เฟรมถัดไปกล้องก็ถูกดึงกลับเข้าหาตำแหน่งของ preset
   * ทันที — อาการที่เห็นคือ "หมุนแล้ววนกลับมาที่เดิม ขยับอะไรไม่ได้เลย"
   *
   * กฎใหม่: ease เฉพาะตอนที่มีเหตุให้ย้ายกล้องจริง ๆ เท่านั้น (สลับมุมจาก HUD,
   * กดเลือก zone, หรือกำลังตามหุ่นยนต์) นอกจากนั้นปล่อยให้ OrbitControls ถือ
   * กล้องไปเลย ไม่แตะ — drei เรียก `controls.update()` ให้เองทุกเฟรมอยู่แล้ว
   * ตอนเปิด damping จึงไม่ต้องเรียกซ้ำที่นี่
   */
  const flyingRef = useRef(false);

  // มุมกล้อง/zone เปลี่ยน = มีเหตุให้บิน (ข้าม priming เฟรมแรกซึ่งกระโดดไปเลย)
  useEffect(() => {
    if (!primedRef.current) return;
    flyingRef.current = true;
  }, [placement]);

  // จำไว้ว่าเฟรมก่อนหน้า "ตามหุ่น" อยู่หรือไม่ — ใช้จับจังหวะเปลี่ยนจาก
  // ปิด→เปิด follow (transition) เพื่อบังคับระยะซูมใกล้แค่ครั้งเดียวตอนเข้าโหมด
  // ไม่ใช่ทุกเฟรม ไม่งั้นจะไปแย่งกล้องจากมือผู้ใช้ที่ซูม/หมุนเองอยู่ระหว่างตามหุ่น
  const followEngagedRef = useRef(false);

  // ตำแหน่งหุ่นยนต์ (target) เมื่อเฟรมก่อนหน้า — ใช้คำนวณ "delta" ที่หุ่น
  // ขยับไปในเฟรมนี้ เพื่อแปลกล้อง+เป้าด้วยระยะเท่ากันเป๊ะ (ดูคอมเมนต์ที่จุดใช้
  // งานด้านล่าง เรื่อง chase camera)
  const followTargetPrev = useRef(new THREE.Vector3());

  useFrame(() => {
    const controls = controlsRef.current;

    // Minimap camera-position/heading/coverage report — written every frame
    // straight to the caller's ref (no React state), regardless of who
    // currently owns the camera (user-orbiting or mid-fly), so the minimap's
    // "you are here" wedge never lags. `halfFovDeg` (horizontal half-FOV) and
    // `distance` (camera-to-target) are what let `Minimap.tsx` size the wedge
    // to actual on-screen coverage instead of drawing an identical shape at
    // every zoom level — see that file's doc comment for the DOM side of
    // this (a requestAnimationFrame loop reading the same ref).
    if (onCameraFrame) {
      camera.getWorldDirection(cameraDirRef.current);
      let halfFovDeg = 0;
      if (camera instanceof THREE.PerspectiveCamera) {
        const halfVFovRad = (camera.fov * Math.PI) / 360;
        halfFovDeg = (Math.atan(Math.tan(halfVFovRad) * camera.aspect) * 180) / Math.PI;
      }
      const distance = controls ? camera.position.distanceTo(controls.target) : camera.position.y;
      onCameraFrame(
        camera.position.x,
        camera.position.z,
        cameraDirRef.current.x,
        cameraDirRef.current.z,
        halfFovDeg,
        distance
      );
    }

    if (!controls) return;

    // `followPoint` เป็น callback (ไม่ใช่ค่า) โดยเจตนา — จุดที่ตามอยู่
    // (หุ่นยนต์เดินตรวจ) ขยับทุกเฟรม ถ้าเป็น prop ที่เป็นค่าจะ re-render
    // subtree ทั้งก้อนทุกเฟรม
    const follow = followPoint?.() ?? null;
    // follow ปิดแล้ว (ไม่ว่ากำลังบินกลับ preset หรือผู้ใช้ถือกล้องอยู่เฉย ๆ)
    // — เคลียร์ธงไว้ เพื่อให้ครั้งหน้าที่กดตามหุ่นใหม่ถือเป็น transition
    //
    // บั๊กที่แก้: ถ้าผู้ใช้คว้ากล้องเอง (ลาก/ซูม) ระหว่างตามหุ่นอยู่ —
    // onStart จะเซ็ต flyingRef เป็น false ไปแล้วตอนนั้น — แล้วค่อยกดปิด
    // ตามหุ่นทีหลัง จะเข้า branch `else { return; }` ด้านล่างทันที (ข้าม
    // `else if (flyingRef.current)` ที่บินกลับ preset ไปเฉย ๆ) ผลคือกล้อง
    // ค้างอยู่ที่เดิม และ `controls.target` ค้างอยู่ที่ตำแหน่งสุดท้ายของ
    // หุ่นยนต์ตลอดไป ไม่มีอะไรมาบังคับให้บินกลับ preset อีกเลย จึงต้อง
    // บังคับ flyingRef กลับเป็น true ตรงจังหวะปิด follow เสมอ (เฉพาะตอนที่
    // เพิ่ง engaged จริง ไม่ใช่ทุกเฟรมที่ follow ปิดอยู่แล้ว)
    if (!follow) {
      if (followEngagedRef.current) flyingRef.current = true;
      followEngagedRef.current = false;
    }

    if (follow) {
      // ตามจุดที่กำลังเคลื่อน: เป้าเลื่อนตามหุ่นทุกเฟรมเสมอ (แม้ผู้ใช้กำลังลาก
      // หมุนกล้องเองอยู่) เพื่อให้การหมุนด้วยเมาส์วนรอบตัวหุ่น ไม่ใช่วนรอบจุด
      // เก่าที่หุ่นเดินจากไปแล้ว — ปิดโหมดนี้ได้จากปุ่ม "ตามหุ่น" ใน
      // InspectorPanel
      desiredTarget.current.set(follow.x, 0, follow.z);

      // ทิศ (azimuth) เอามาจาก offset ของมุมกล้อง preset ที่เลือกอยู่ (เหมือน
      // เดิม) กดตามหุ่นแล้วมุมมองจึงไม่สะบัดไปทิศอื่น แค่ดึงระยะเข้าใกล้แบบ
      // over-the-shoulder ด้วย FOLLOW_DISTANCE/FOLLOW_HEIGHT แทนระยะไกลของ
      // preset เดิม
      const offX = placement.position[0] - placement.target[0];
      const offZ = placement.position[2] - placement.target[2];
      const offLen = Math.hypot(offX, offZ) || 1;

      // บังคับระยะใกล้เฉพาะ "ตอนเพิ่งเปิด follow" หรือระหว่างที่ rig ยังถือ
      // กล้องบินเข้าหาอยู่ (flyingRef true) — ถ้าผู้ใช้คว้ากล้องเอง onStart
      // จะเซ็ต flyingRef เป็น false ทันที เฟรมถัดไปเราก็จะเลิกบังคับระยะ ปล่อย
      // ให้ผู้ใช้ซูม/หมุนรอบหุ่นได้อิสระ โดยเป้ายังคงเลื่อนตามหุ่นต่อไปด้านบน
      if (flyingRef.current || !followEngagedRef.current) {
        desiredPos.current.set(
          follow.x + (offX / offLen) * FOLLOW_DISTANCE,
          FOLLOW_HEIGHT,
          follow.z + (offZ / offLen) * FOLLOW_DISTANCE
        );
        flyingRef.current = true;
        // เพิ่งเข้าโหมด (หรือยังบินเข้าเฟรมอยู่) — รีเซ็ตตำแหน่งหุ่นเฟรมก่อนหน้า
        // ไว้ที่ตำแหน่งปัจจุบัน กัน chase branch ด้านล่างคำนวณ delta เพี้ยนจาก
        // ตำแหน่งหุ่นก่อนเข้าโหมด/ก่อนบินถึง ในเฟรมแรกที่ผู้ใช้คว้ากล้อง
        followTargetPrev.current.copy(desiredTarget.current);
      } else {
        // CHASE CAMERA แท้ ๆ — ผู้ใช้คว้ากล้องเอง (หมุน/ซูม/แพน) อยู่ระหว่าง
        // ตามหุ่น: แปล "ทั้งกล้องและเป้า" ด้วย delta ที่หุ่นขยับในเฟรมนี้
        // ตรง ๆ (ไม่ lerp) เพื่อรักษา offset (ระยะ/มุม/ซูมที่ผู้ใช้ปรับเอง)
        // ให้คงที่เป๊ะทุกเฟรม — เท่ากับลาก "กรอบ" ทั้งกรอบตามหุ่นไปเรื่อย ๆ
        //
        // บั๊กที่แก้: เดิม branch นี้ขยับแค่ controls.target (lerp เข้าหาหุ่น
        // 8%/เฟรม ที่ท้ายฟังก์ชัน) แต่ปล่อย camera.position นิ่งอยู่กับที่
        // (โค้ดเดิม copy ตัวเอง = no-op) OrbitControls.update() คำนวณ
        // spherical (ระยะ/มุม) ใหม่จาก position-target ทุกเฟรมอยู่แล้ว พอเป้า
        // คืบออกจากกล้องไปเรื่อย ๆ (หุ่นเดินต่อเนื่อง) ระยะ/มุมที่เห็นจึงเพี้ยน
        // สะสมไม่มีที่สิ้นสุด สุดท้ายหุ่นหลุดเฟรมไปเลย — แก้โดยย้ายกล้องตาม
        // เป้าด้วย delta เดียวกันเป๊ะทุกเฟรมแทน
        //
        // ผลคือ: หมุน (orbit) และซูมยังทำได้อิสระ เพราะ OrbitControls แก้ไข
        // camera.position ของมันเองระหว่างลาก ส่วนที่นี่แค่ "เลื่อน" กรอบที่
        // ผู้ใช้ปรับไว้ตามหุ่นทุกเฟรม ไม่ไปยุ่งกับระยะ/มุมที่ผู้ใช้ตั้ง —
        // ส่วนการแพน (pan) จะถูกโหมดตามหุ่นดึงเป้ากลับไปที่ตัวหุ่นทุกเฟรม
        // เสมอ (ตั้งใจ: การแพนขณะตามหุ่นไม่ทำให้หลุดจากหุ่น ถือเป็นพฤติกรรม
        // ที่คาดเดาง่ายที่สุด)
        const dx = follow.x - followTargetPrev.current.x;
        const dz = follow.z - followTargetPrev.current.z;
        camera.position.x += dx;
        camera.position.z += dz;
        controls.target.copy(desiredTarget.current);
        followTargetPrev.current.copy(desiredTarget.current);
        // ให้บรรทัด lerp ท้ายฟังก์ชันเป็น no-op (ค่าตรงกันอยู่แล้ว จากที่ตั้ง
        // ตรง ๆ ไปข้างบน) — การแปลของ chase camera ต้องเป๊ะ ไม่ผ่าน ease อีกชั้น
        desiredPos.current.copy(camera.position);
      }
      followEngagedRef.current = true;
    } else if (flyingRef.current) {
      desiredPos.current.set(...placement.position);
      desiredTarget.current.set(...placement.target);
      // ถึงที่แล้ว (ใกล้พอเมื่อเทียบกับสเกลของไซต์) — คืนกล้องให้ผู้ใช้
      const reach = Math.hypot(siteWidth, siteDepth);
      if (
        camera.position.distanceTo(desiredPos.current) < reach * 0.004 &&
        controls.target.distanceTo(desiredTarget.current) < reach * 0.004
      ) {
        flyingRef.current = false;
        return;
      }
    } else {
      // ผู้ใช้เป็นเจ้าของกล้อง — ห้ามแตะ
      return;
    }

    camera.position.lerp(desiredPos.current, CAMERA_EASE);
    controls.target.lerp(desiredTarget.current, CAMERA_EASE);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      screenSpacePanning={false}
      minDistance={MIN_DISTANCE}
      maxDistance={maxDistance}
      maxPolarAngle={MAX_POLAR_ANGLE}
      zoomSpeed={1.25}
      panSpeed={0.9}
      // ผู้ใช้เริ่มลาก/ซูม = ยกเลิกการบินที่ค้างอยู่ทันที ไม่ต้องรอให้ถึงเป้า
      onStart={() => {
        flyingRef.current = false;
      }}
    />
  );
}

/**
 * ENVIRONMENT MAP — สิ่งที่ผิวโลหะเอาไปสะท้อน
 *
 * บั๊กที่แก้: เครื่องจักรทุกตัวออกมา "ดำทึบ" ทั้งฉาก
 *
 * `MeshStandardMaterial` ที่ `metalness` สูงจะเอาสีเกือบทั้งหมดมาจาก
 * **สิ่งที่มันสะท้อน** ไม่ใช่จาก `color` ของตัวเอง — นั่นคือความหมายของโลหะ
 * ในโมเดล PBR ถ้าฉากไม่มี `scene.environment` ก็ไม่มีอะไรให้สะท้อน ผิวโลหะ
 * จึงคืนค่าเป็นดำ ยิ่ง metalness สูงยิ่งดำ ตัวถังเครื่อง (metalness 0.45) กับ
 * เหล็กขัดเงา (0.85) จึงกลายเป็นก้อนดำหมด ทั้งที่ค่า `color` เป็นสีกรมท่า
 *
 * ไฟ (directional/ambient/hemisphere) ช่วยไม่ได้ในกรณีนี้ เพราะไฟส่องเข้าไป
 * ที่ส่วน diffuse ซึ่งผิวโลหะแทบไม่มี
 *
 * ที่ใช้แก้คือ `RoomEnvironment` ของ three — ห้องสี่เหลี่ยมที่มีแผงไฟจำลอง
 * แล้วอบเป็น cubemap ด้วย `PMREMGenerator` เป็นการคำนวณในเครื่องล้วน **ไม่
 * โหลดไฟล์ HDR หรือรูปจากภายนอกเลย** (ข้อจำกัดเดิมของงานนี้: ห้ามใช้ภาพ)
 *
 * อบครั้งเดียวตอน mount แล้วปล่อย texture ทิ้งตอน unmount — PMREM ที่ไม่ปล่อย
 * จะค้างอยู่ใน GPU ทุกครั้งที่เข้า-ออกโหมด 4D
 */
function SceneEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envMap = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envMap;

    return () => {
      scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
      room.dispose?.();
    };
  }, [gl, scene]);

  return null;
}

/**
 * สะพานเหตุการณ์ context หาย/คืนของ WebGL
 *
 * ฉากยัง MOUNT อยู่ตอน context หาย (ไม่ unmount) เพื่อให้เบราว์เซอร์ยิง
 * `webglcontextrestored` กลับมาได้และเรนเดอร์ต่อโดยไม่ต้องสร้างฉากใหม่ —
 * LiveFloorView เอาสัญญาณนี้ไปแสดง `ContextLostPanel` คลุมทับไว้ระหว่างนั้น
 */
function ContextLossBridge({
  onContextLost,
  onContextRestored,
}: {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      // ต้อง preventDefault เบราว์เซอร์จึงจะยิง `webglcontextrestored` กลับมา
      event.preventDefault();
      onContextLost?.();
    };
    const handleRestored = () => onContextRestored?.();
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [gl, onContextLost, onContextRestored]);

  return null;
}

/**
 * แสงพื้นฐาน — เงาเปิดเฉพาะโหมดคุณภาพสูง
 *
 * Neutral studio lighting for a clean digital-twin read: even fill + defined
 * key, no colour cast — โทนแบบซอฟต์แวร์อุตสาหกรรม (Omniverse/Plant
 * Simulation) ไม่ใช่แสงอบอุ่นแบบ diorama หรือแสงจัดจ้านแบบซีนีมา
 */
function Lights({
  siteWidth,
  siteDepth,
  highQuality,
  sunRef,
  ambientRef,
  hemiRef,
}: {
  siteWidth: number;
  siteDepth: number;
  highQuality: boolean;
  /**
   * ref สามตัวนี้ให้ `TimeOfDaySky` (roadmap step 16) เขียนสี/ความเข้ม/ทิศทาง
   * ทับทุก ~30 วิ ตามเวลานาฬิกาจริง — ตัว JSX ด้านล่างยังกำหนดค่าเริ่มต้น
   * (ตำแหน่ง/ความเข้ม) ไว้เหมือนเดิมทุกอย่าง `TimeOfDaySky` แค่ mutate ทับหลัง
   * mount เท่านั้น ไม่มีอะไรเปลี่ยนถ้าไม่ mount มัน (เช่นตอนที่ยังไม่พร้อม)
   */
  sunRef?: React.RefObject<THREE.DirectionalLight | null>;
  ambientRef?: React.RefObject<THREE.AmbientLight | null>;
  hemiRef?: React.RefObject<THREE.HemisphereLight | null>;
}) {
  // ดวงอาทิตย์ต้องถอยตามขนาดไซต์ ไม่ใช่ตำแหน่งตายตัว ไม่งั้นไซต์ใหญ่จะมีแสง
  // ส่องถึงแค่มุมเดียว
  const reach = Math.hypot(siteWidth, siteDepth);
  const shadowMapSize = highQuality ? 2048 : 1024;

  /**
   * กรอบเงาต้องครอบไซต์จริง
   *
   * ค่าเริ่มต้นของ `DirectionalLightShadow` คือกล้อง ortho ขนาด -5..5 ซึ่ง
   * เล็กกว่าโรงงานหลายร้อยเท่า ผลคือมีเงาเฉพาะหยดเล็ก ๆ กลางฉากแล้วหายหมด
   * ต้องกางตามครึ่งหนึ่งของไซต์ (+ เผื่อขอบ) ไม่งั้น "แสงเงา" ที่เป็นสิ่งที่
   * ทำให้ฉากมีความลึกจะไม่ปรากฏเลยบนผังขนาดจริง
   */
  // กว้างขึ้นเล็กน้อยจากเดิม (0.62 → 0.72) กันเงาถูก clip ตอนขอบไซต์ตอนนี้
  // แผ่กว้างขึ้นจากแสงคีย์ที่ soften แล้ว
  const half = Math.max(siteWidth, siteDepth) * 0.72;
  const shadowFrustum = {
    "shadow-camera-left": -half,
    "shadow-camera-right": half,
    "shadow-camera-top": half,
    "shadow-camera-bottom": -half,
    "shadow-camera-near": 1,
    "shadow-camera-far": reach * 2.4,
  };

  return (
    <>
      {/* sky/ground tint pulled from the palette, not a bespoke hex literal.
          Cut further (0.82→0.7, 0.6→0.48) from the prior "Clean Digital
          Twin" pass — a real screenshot showed the whole plant reading flat
          and washed out with no visible light-and-shade on any machine body.
          Un-shadowed ambient/hemisphere fill was still strong enough to
          nearly match the key light's contribution, so surfaces read the
          same brightness regardless of their angle to the sun. Keeping the
          key light's 1.6 intensity untouched (that's what shapes the
          machines) while cutting the flat fill further gives faces turned
          away from the key light room to actually go darker, which is what
          "shape" looks like. The floor is being deepened in parallel
          (#f4f5f7→#e2e6ea), so this isn't fighting for contrast alone. */}
      <hemisphereLight ref={hemiRef} args={[LIGHT.ambient, LIGHT.hemisphereGround, 0.7]} />
      <ambientLight ref={ambientRef} intensity={0.48} />
      <directionalLight
        ref={sunRef}
        // มุมบนซ้ายด้านหน้า สูง ให้เป็นแหล่งแสงหลักเดียวที่ทอดเงา ความเข้ม
        // สูงพอให้รูปทรงเครื่องจักรอ่านออกชัดเจน (แยกด้านสว่าง/มืด) แทนการ
        // ล้างแบนแบบ diorama เดิม — ค่าเริ่มต้นนี้คือกลางวัน `TimeOfDaySky`
        // จะ mutate ตำแหน่ง/สี/ความเข้มทับตามเวลาจริงหลัง mount
        position={[-reach * 0.45, reach * 0.75, reach * 0.35]}
        intensity={1.6}
        color={LIGHT.key}
        castShadow={highQuality}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        {...shadowFrustum}
      />
      {/* ไฟขอบสองดวง ไม่ทอดเงา — เป็นแค่ fill เบามาก ๆ ให้ขอบโค้งของตัวเครื่อง
          อ่านออกในด้านที่แสงคีย์ไม่ถึง ไม่ใช่ rim สีนีออนแบบเดิม */}
      <directionalLight position={[-reach * 0.4, reach * 0.3, reach * 0.5]} intensity={0.12} color={LIGHT.rimA} />
      <directionalLight position={[reach * 0.2, reach * 0.25, -reach * 0.5]} intensity={0.1} color={LIGHT.rimB} />
    </>
  );
}

export interface FloorSceneProps {
  /**
   * ผังโรงงานจริงจากฐานข้อมูล (`lib/plantLayout.ts`) — ตำแหน่ง/มุม/ขนาดของ
   * เครื่องทุกตัว สายพาน โซน และไซต์ภายนอก ฉากนี้ไม่คำนวณผังเอง มันแค่วาด
   */
  layout: PlantLayout;
  /** เครื่องที่ถูกเลือกอยู่ — วาดกรอบไฮไลต์รอบตัวในฉาก */
  selectedMachineId?: string | null;
  /** คลิกหนึ่งครั้งบนเครื่อง — ส่ง machine id ดิบออกไป */
  onSelectMachine?: (machineId: string) => void;
  /** ดับเบิลคลิกบนเครื่อง — เปิด modal รายละเอียดของ dashboard */
  onOpenMachine?: (machineId: string) => void;
  /** ความกว้างไซต์หลังสเกล (เมตร) — ไซต์อ้างอิงกว้าง 190 ม. */
  siteWidth: number;
  /** ความลึกไซต์หลังสเกล (เมตร) — ไซต์อ้างอิงลึก 170 ม. */
  siteDepth: number;
  /** มุมกล้องที่ผู้ควบคุมเลือกจาก HUD ค่าเริ่มต้น "line" */
  cameraPreset?: PlantCameraPreset;
  /** zone ที่กล้องควรบินไปเล็ง — มุมกว้าง ("plant"/"top") จะเมินค่านี้ */
  focusBox?: CameraFocusBox | null;
  /**
   * เรียกทุกเฟรม คืนจุดที่กล้องควรตาม (เช่นตำแหน่งสด ๆ ของหุ่นยนต์เดินตรวจ)
   * หรือ `null` เพื่อคืนการควบคุมให้มุมที่เลือกอยู่
   */
  followPoint?: (() => { x: number; z: number } | null) | null;
  /**
   * เรียกทุกเฟรมด้วยตำแหน่ง (x,z), ทิศทางมอง (dirX,dirZ), ครึ่งมุมมองแนวนอน
   * (halfFovDeg) และระยะกล้องถึงเป้า (distance) ของกล้องสด ๆ — ให้
   * `Minimap.tsx` (roadmap step 5) วาดตัวชี้ตำแหน่ง/มุมมองกล้องที่ขนาดตรงกับ
   * พื้นที่ที่กล้องครอบคลุมจริง ไม่ผูกกับ React state ฝั่งไหนเลย (ดูคอมเมนต์ที่
   * `CameraRig`'s `useFrame`)
   */
  onCameraFrame?:
    | ((x: number, z: number, dirX: number, dirZ: number, halfFovDeg: number, distance: number) => void)
    | null;
  /** false = โหมดประหยัด: ไม่ทอดเงา และลดเพดาน dpr */
  highQuality?: boolean;
  /**
   * true = "เปิดหลังคา" — ไม่วาดแผ่นหลังคาอาคารไลน์ผลิต เหลือแต่โครงถัก
   * จึงมองลงไปเห็นเครื่องจักรข้างในได้ แบบมุมมองบ้านในเกม The Sims
   */
  roofOpen?: boolean;
  /** WebGL context ของ canvas หาย (กู้คืนได้ — ดู `ContextLossBridge`) */
  onContextLost?: () => void;
  /** เบราว์เซอร์คืน context แล้ว เรนเดอร์ต่อได้ */
  onContextRestored?: () => void;
  /** subtree ของ R3F ที่วางในฉาก (ตอนนี้มีแค่ `InspectorRobot`) */
  children?: React.ReactNode;
}

/**
 * เปลือกฉาก: `<Canvas>` + แสง + พื้น + กล้อง แล้ว render `children` ทับ
 */
export function FloorScene({
  layout,
  selectedMachineId = null,
  onSelectMachine,
  onOpenMachine,
  siteWidth,
  siteDepth,
  cameraPreset = "line",
  focusBox = null,
  followPoint = null,
  onCameraFrame = null,
  highQuality = true,
  roofOpen = false,
  onContextLost,
  onContextRestored,
  children,
}: FloorSceneProps) {
  // ให้ `TimeOfDaySky` (roadmap step 16) เขียนทับแสงคีย์/ไฟเติมตามเวลานาฬิกา
  // จริง — สร้าง ref ที่นี่แทนใน `Lights` เพราะทั้งสองคอมโพเนนต์ต้องแชร์กัน
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  return (
    <Canvas
      dpr={[1, highQuality ? DPR_CAP_HIGH : DPR_CAP_LOW]}
      shadows={highQuality}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        logarithmicDepthBuffer: true,
      }}
      camera={{ fov: CAMERA_FOV, near: CAMERA_NEAR, far: CAMERA_FAR_FALLBACK }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color(BACKGROUND);
        // พื้นหลัง/หมอกเป็นเกือบขาวทั้งคู่แล้ว (clean digital-twin) — ดันระยะ
        // หมอกให้ไกลขึ้นอีกจากเดิม ไม่งั้นหมอกจะเริ่มจางเครื่องจักรกลางไซต์
        // ให้ดูลอยเป็นสีเทาทั้งที่ยังไม่ไกลจริง ผังทั้งไซต์ควรยังอ่านคมชัด
        // แทบไม่รู้สึกว่ามีหมอกเลยจนกว่าจะสุดขอบ
        const far = Math.hypot(siteWidth, siteDepth);
        scene.fog = new THREE.Fog(FOG, far * 0.9, far * 3.2);
        // เดิมพึ่ง PMREM envMap อย่างเดียวเพื่อไม่ให้ผิวโลหะดำ ตอนนี้แสงคีย์แรง
        // ขึ้นมากแล้ว ลด environmentIntensity ลงอีกให้ IBL ทำหน้าที่แค่ fill
        // เงาเบา ๆ ไม่เติมสีของตัวเองทับพาเลตต์ที่เป็นกลาง — ลดต่ออีกขั้น
        // (0.5→0.4) คู่กับ ambient/hemisphere ที่ตัดลง เพราะ IBL แบบ
        // MeshStandardMaterial ก็เป็นแหล่ง fill ที่ไม่ถูก shadow-map เหมือนกัน
        scene.environmentIntensity = 0.4;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        // Neutral tone mapping: ให้ค่าสีตรงไปตรงมา ไม่มี contrast curve แบบ
        // ACES ที่ถูกออกแบบมาให้จัดจ้านแบบซีนีมา ตรงกับโทนสตูดิโอที่เป็นกลาง
        // ของ digital twin มากกว่า
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        // เงานุ่มกว้าง แทนเงาคมแบบ PCF เดิม — คู่กับ shadow-normalBias ที่ขยับ
        // ขึ้นเล็กน้อยแทนการพึ่ง shadow-radius (radius ใช้ไม่ได้กับ PCFSoft)
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      className="absolute inset-0"
    >
      <SceneEnvironment />
      <ContextLossBridge onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <CameraRig
        siteWidth={siteWidth}
        siteDepth={siteDepth}
        cameraPreset={cameraPreset}
        focusBox={focusBox}
        followPoint={followPoint}
        onCameraFrame={onCameraFrame}
      />
      <Lights
        siteWidth={siteWidth}
        siteDepth={siteDepth}
        highQuality={highQuality}
        sunRef={sunRef}
        ambientRef={ambientRef}
        hemiRef={hemiRef}
      />
      <TimeOfDaySky layout={layout} siteWidth={siteWidth} siteDepth={siteDepth} sunRef={sunRef} ambientRef={ambientRef} hemiRef={hemiRef} />
      <PlantShell layout={layout} />
      <FloorGrid layout={layout} highQuality={highQuality} />
      <FloorMarkings layout={layout} />
      <SiteEnvironment layout={layout} roofOpen={roofOpen} />
      <HallRoof layout={layout} roofOpen={roofOpen} highQuality={highQuality} />
      <ProductionLines layout={layout} />
      <MachineInstances
        layout={layout}
        selectedMachineId={selectedMachineId}
        onSelectMachine={onSelectMachine}
        onOpenMachine={onOpenMachine}
        highQuality={highQuality}
      />
      <WarehouseRacking layout={layout} />
      <Forklifts layout={layout} />
      <FloorActivity layout={layout} />
      <ProcessEffects layout={layout} />
      <SceneAnnotations layout={layout} />
      {children}
    </Canvas>
  );
}

export default FloorScene;
