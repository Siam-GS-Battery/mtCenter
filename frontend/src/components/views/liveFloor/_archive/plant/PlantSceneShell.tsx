/**
 * PlantSceneShell.tsx
 *
 * Faithful reproduction of everything in `Model_3D/nittan-plant-3d.html`
 * that is NOT machines, buildings, or layout data: the `<Canvas>`/renderer
 * config, scene background + fog, the 4 lights, the camera + OrbitControls,
 * and the ground/apron planes. Machines, buildings and layout are supplied
 * by the caller via `children` -- this component owns none of that.
 *
 * Every literal used here comes from `plantSceneConfig.ts`, which is the
 * single source of truth (see that file's header for how each value maps
 * back to `Model_3D/REFERENCE-LOOK.md`).
 *
 * Deliberately absent, per the spec: no GridHelper, no post-processing /
 * EffectComposer, no environment map / PMREM. Do not add any of these.
 *
 * BEYOND THE SPEC -- restored, pre-swap features owned by this shell:
 *  - `cameraPreset` (line/plant/top/eye) + `focusBox` (zone/building fly-to):
 *    a `CameraRig` lerps the camera there and yields to the user on the
 *    first drag/scroll/pan, same as the pre-swap `LiveFloor4DScene.tsx`.
 *  - `followPoint`: continuous camera-follow (e.g. the inspector robot),
 *    which wins over any in-flight preset animation while active.
 *  - `highQuality`: shadow casting is the actual quality knob here (this
 *    shell has no post-processing/AO to toggle) -- "ประหยัด" turns off
 *    `castShadow`/`receiveShadow` entirely and drops the dpr ceiling.
 *  - `onContextLost` / `onContextRestored`: bridges the canvas's own
 *    `webglcontextlost`/`webglcontextrestored` DOM events out to the caller.
 */
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  AMBIENT_INTENSITY,
  ANTIALIAS,
  APRON_COLOR,
  APRON_METALNESS,
  APRON_ROUGHNESS,
  BACKGROUND_COLOR,
  CAMERA_FOV,
  CAMERA_NEAR,
  DAMPING_FACTOR,
  FILL_COLOR,
  FILL_INTENSITY,
  FOG_COLOR,
  GROUND_COLOR,
  GROUND_METALNESS,
  GROUND_ROUGHNESS,
  HEMI_GROUND_COLOR,
  HEMI_INTENSITY,
  HEMI_SKY_COLOR,
  MAX_POLAR_ANGLE,
  OUTPUT_COLOR_SPACE,
  PAN_SPEED,
  PIXEL_RATIO_CAP,
  PIXEL_RATIO_CAP_LOW,
  REFERENCE_FILL_POSITION,
  REFERENCE_RIM_POSITION,
  REFERENCE_SUN_POSITION,
  RIM_COLOR,
  RIM_INTENSITY,
  SCREEN_SPACE_PANNING,
  SUN_COLOR,
  SUN_INTENSITY,
  SUN_SHADOW_BIAS,
  SUN_SHADOW_MAP_SIZE,
  SUN_SHADOW_NORMAL_BIAS,
  TONE_MAPPING,
  TONE_MAPPING_EXPOSURE,
  ZOOM_SPEED,
  computeApronPosition,
  computeApronSize,
  computeCameraFar,
  computeCameraPlacement,
  computeCameraPlacementForPreset,
  computeDistanceLimits,
  computeFocusPlacement,
  computeFogDensity,
  computeGroundSize,
  computeLightPosition,
  computeShadowCameraBox,
  isWideCameraPreset,
  type CameraFocusBox,
  type PlantCameraPreset,
} from "./plantSceneConfig";

export type { PlantCameraPreset } from "./plantSceneConfig";
export type { CameraFocusBox } from "./plantSceneConfig";

/**
 * Optional numbers the caller already has (from `PlantLayout`) that this
 * shell does not otherwise see -- passed through purely so the one-shot
 * scene diagnostics group below (see `SceneDiagnostics`) can report the full
 * picture the caller needs to trace a black-canvas/mis-framed-camera report
 * without a browser: the real hall/bounds the geometry was actually built
 * against, next to the camera numbers this shell computed FROM `siteWidth`/
 * `siteDepth`. If those two disagree with `hall`/`bounds` here, that alone is
 * the bug (see `LiveFloorView.tsx`'s `siteWidth`/`siteDepth` derivation for
 * the one case this already caught).
 */
export interface PlantSceneDebugLayoutInfo {
  hall: { w: number; d: number; h: number };
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  machineCount: number;
  conveyorCount: number;
  skippedCount: number;
}

export interface PlantSceneShellProps {
  /** New (post-scaling) site width, metres. Reference site width is 190 m. */
  siteWidth: number;
  /** New (post-scaling) site depth, metres. Reference site depth is 170 m. */
  siteDepth: number;
  /** See `PlantSceneDebugLayoutInfo` -- optional, only feeds the diagnostics log. */
  debugLayoutInfo?: PlantSceneDebugLayoutInfo;
  /**
   * Optional explicit OrbitControls target / camera look-at point. Defaults
   * to the reference target scaled proportionally to the new site (see
   * `computeCameraPlacement` in plantSceneConfig.ts). Ignored whenever
   * `followPoint` is actively returning a point.
   */
  cameraTarget?: [number, number, number];
  /**
   * Camera scale the operator can switch between (restored feature). Defaults
   * to "line", the reference demo's one fixed camera. "plant"/"top" always
   * frame the WHOLE site regardless of `focusBox` (see `isWideCameraPreset`).
   */
  cameraPreset?: PlantCameraPreset;
  /**
   * A zone/building to fly the camera to, honoured only by the "line"/"eye"
   * (near) presets. `null`/undefined falls back to each preset's own default
   * framing (the reference hall for "line"/"eye", the whole site for
   * "plant"/"top").
   */
  focusBox?: CameraFocusBox | null;
  /**
   * Called every frame; return the world point the camera should keep
   * centred (e.g. the inspector robot's live position) or `null` to hand
   * control back to the active preset/`cameraTarget`. A callback (not a
   * value) so a followed point can move every frame without re-rendering
   * this component -- read a live mutable snapshot inside it, don't close
   * over React state.
   */
  followPoint?: (() => { x: number; z: number } | null) | null;
  /** false = "ประหยัด" (low quality): no shadow casting, lower dpr ceiling. Default true. */
  highQuality?: boolean;
  /** Fired when the canvas's WebGL context is lost (survivable -- see `ContextLossBridge`). */
  onContextLost?: () => void;
  /** Fired when the browser restores a lost context and rendering resumes. */
  onContextRestored?: () => void;
  /** Machines, buildings, and any other layout content supplied by other teams. */
  children?: ReactNode;
}

/**
 * Bridges the drawing canvas' own `webglcontextlost` / `webglcontextrestored`
 * events out to the caller.
 *
 * `event.preventDefault()` on the loss is REQUIRED: without it the browser
 * never even attempts restoration, so `webglcontextrestored` can never fire
 * and the canvas is dead for good -- turning a transient GPU hiccup into a
 * permanently blank scene.
 *
 * Lives INSIDE <Canvas> so it can read the real `gl.domElement` and so its
 * listeners are torn down with the rest of the R3F tree. Renders nothing.
 */
function ContextLossBridge({
  onContextLost,
  onContextRestored,
}: {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}): null {
  const canvas = useThree((s) => s.gl.domElement);

  useEffect(() => {
    function handleLost(event: Event) {
      event.preventDefault();
      console.warn("[PlantSceneShell] WebGL context lost — waiting for restore");
      onContextLost?.();
    }
    function handleRestored() {
      console.info("[PlantSceneShell] WebGL context restored");
      onContextRestored?.();
    }
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
    };
  }, [canvas, onContextLost, onContextRestored]);

  return null;
}

/**
 * One-shot, mount-time diagnostics: logs a single tidy `console.info` group
 * reporting every number that matters for "why is the canvas black" /
 * "why is the camera looking at nothing" -- site size actually received,
 * the real hall/bounds the geometry was built against (if the caller passed
 * `debugLayoutInfo`), camera position/target/near/far, fog density, a scene
 * traversal count of what actually got attached (not what SHOULD have been
 * attached -- this would also catch an effect that silently produced an
 * empty group), and `renderer.info.render.calls` after the first real frame.
 *
 * Fires exactly ONCE per scene mount (guarded by a ref), not once per frame
 * or once per prop change -- this is meant to be read once in the console
 * right after the view loads, not to become a stream. Waits a couple of
 * frames before reading `gl.info` so the first render has actually happened
 * (immediately after mount `renderer.info.render.calls` can still be 0).
 */
function SceneDiagnostics({
  siteWidth,
  siteDepth,
  fogDensity,
  near,
  far,
  cameraPosition,
  cameraTarget,
  debugLayoutInfo,
}: {
  siteWidth: number;
  siteDepth: number;
  fogDensity: number;
  near: number;
  far: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  debugLayoutInfo?: PlantSceneDebugLayoutInfo;
}) {
  const loggedRef = useRef(false);
  const frameCountRef = useRef(0);

  useFrame(({ scene, gl, camera }) => {
    if (loggedRef.current) return;
    frameCountRef.current += 1;
    // Wait for the 3rd frame: the 1st frame's `gl.info.render.calls` reflects
    // work queued BEFORE this frame even executes, so reading it too early
    // under-reports (sometimes reads exactly 0 even though geometry is
    // present and about to draw).
    if (frameCountRef.current < 3) return;
    loggedRef.current = true;

    let meshCount = 0;
    let instancedMeshCount = 0;
    let groupCount = 0;
    scene.traverse((obj) => {
      if ((obj as THREE.InstancedMesh).isInstancedMesh) instancedMeshCount += 1;
      else if ((obj as THREE.Mesh).isMesh) meshCount += 1;
      else if ((obj as THREE.Group).isGroup) groupCount += 1;
    });

    // eslint-disable-next-line no-console
    console.groupCollapsed("[PlantSceneShell] scene diagnostics (one-shot, mount)");
    console.info("siteWidth/siteDepth received:", { siteWidth, siteDepth });
    if (debugLayoutInfo) {
      console.info("plantLayout.hall (real, what PlantEnvironment actually built):", debugLayoutInfo.hall);
      console.info("plantLayout.bounds:", debugLayoutInfo.bounds);
      console.info("machine/conveyor/skipped counts (from PlantLayout):", {
        machines: debugLayoutInfo.machineCount,
        conveyors: debugLayoutInfo.conveyorCount,
        skipped: debugLayoutInfo.skippedCount,
      });
    }
    console.info("camera position/target:", { position: cameraPosition, target: cameraTarget });
    console.info("camera near/far:", { near, far });
    console.info(
      "camera-to-target distance:",
      Math.hypot(
        cameraPosition[0] - cameraTarget[0],
        cameraPosition[1] - cameraTarget[1],
        cameraPosition[2] - cameraTarget[2],
      ),
      "(if this exceeds `far`, the look-at point itself is clipped -- black canvas with no console errors)",
    );
    console.info("fog density:", fogDensity);
    console.info("scene graph (actually attached, traversed live):", {
      groups: groupCount,
      meshes: meshCount,
      instancedMeshes: instancedMeshCount,
      topLevelChildren: scene.children.length,
    });
    console.info("renderer.info.render (after first real frame):", {
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    });
    console.info("renderer.info.memory:", gl.info.memory);
    console.info("actual camera fov/aspect:", {
      fov: (camera as THREE.PerspectiveCamera).fov,
      aspect: (camera as THREE.PerspectiveCamera).aspect,
    });
    console.groupEnd();
  });

  return null;
}

/** Scratch vector for the follow-cam delta -- one instance, never per frame. */
const FOLLOW_DELTA = new THREE.Vector3();

/**
 * Smoothly lerps the camera + OrbitControls target toward the active preset's
 * (or `focusBox`'s) placement, and yields control to `followPoint` whenever it
 * returns a point. Ported from the pre-swap `LiveFloor4DScene.tsx`'s
 * `CameraRig` -- see that file (recovered via `git show HEAD:...` on this
 * branch, since it was deleted uncommitted alongside the rest of the old
 * scene) for the original.
 */
function CameraRig({
  focusKey,
  desiredPos,
  focusTarget,
  minDistance,
  maxDistance,
  followPoint,
}: {
  /** Changes only on an explicit user intent (preset switch / new focus/selection). */
  focusKey: string;
  desiredPos: THREE.Vector3;
  focusTarget: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  followPoint?: (() => { x: number; z: number } | null) | null;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  // Whether the rig is still driving the camera toward the preset. Once the
  // camera arrives, or the user takes over the controls, this goes false and
  // OrbitControls is left fully in charge (no more lerping).
  const animatingRef = useRef(true);

  // A new preset/focus/selection re-arms the fly-to. Deliberately NOT keyed on
  // `desiredPos`/`focusTarget` themselves: those also change on a viewport
  // resize or a data refresh that moves the site, and re-arming there would
  // yank the camera away from the user mid-orbit.
  useEffect(() => {
    animatingRef.current = true;
  }, [focusKey]);

  // The FIRST user interaction (drag/scroll/pan) cancels any in-flight
  // animation so the rig never fights the user afterwards.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const handleStart = () => {
      animatingRef.current = false;
    };
    controls.addEventListener("start", handleStart);
    return () => {
      controls.removeEventListener("start", handleStart);
    };
  }, []);

  // Priority -2: drei's <OrbitControls> runs its own controls.update() at
  // priority -1 (required for enableDamping), so the rig lerps FIRST and that
  // single update picks up the new camera position/target in the same frame.
  useFrame((_, delta) => {
    /**
     * FOLLOW MODE -- wins over the preset fly-to while it is on. The camera
     * is moved by the SAME delta as the orbit target (not placed at a
     * computed position), which keeps whatever angle/height/zoom the
     * operator has dialled in -- following never fights a drag or snaps to a
     * canned angle.
     */
    const followed = followPoint?.();
    if (followed) {
      const controls = controlsRef.current;
      if (controls) {
        FOLLOW_DELTA.set(followed.x, controls.target.y, followed.z).sub(controls.target);
        FOLLOW_DELTA.multiplyScalar(Math.min(1, delta * 3));
        controls.target.add(FOLLOW_DELTA);
        camera.position.add(FOLLOW_DELTA);
      }
      // An in-flight preset animation must not drag the camera off the followed point.
      animatingRef.current = false;
      return;
    }

    if (!animatingRef.current) return;
    const lerpFactor = Math.min(1, delta * 2.2);
    camera.position.lerp(desiredPos, lerpFactor);
    const controls = controlsRef.current;
    if (controls) controls.target.lerp(focusTarget, lerpFactor);
    if (
      camera.position.distanceTo(desiredPos) < 0.05 &&
      (!controls || controls.target.distanceTo(focusTarget) < 0.05)
    ) {
      animatingRef.current = false;
    }
  }, -2);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={DAMPING_FACTOR}
      maxPolarAngle={MAX_POLAR_ANGLE}
      minDistance={minDistance}
      maxDistance={maxDistance}
      zoomSpeed={ZOOM_SPEED}
      panSpeed={PAN_SPEED}
      screenSpacePanning={SCREEN_SPACE_PANNING}
    />
  );
}

/**
 * Renders the Canvas, lights, fog, camera, controls and ground/apron for the
 * plant floor scene. Accepts `children` for the machines/environment content
 * that other teams own.
 */
export function PlantSceneShell({
  siteWidth,
  siteDepth,
  debugLayoutInfo,
  cameraTarget,
  cameraPreset = "line",
  focusBox,
  followPoint,
  highQuality = true,
  onContextLost,
  onContextRestored,
  children,
}: PlantSceneShellProps) {
  const fogDensity = useMemo(
    () => computeFogDensity(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );

  // See `computeCameraFar`'s doc comment: `CAMERA_FAR` alone (a fixed
  // reference-scale constant) is NOT enough once the site's scale factor `k`
  // grows past ~8.3x -- the camera ends up farther from its own look-at
  // target than the far plane, clipping the whole plant to nothing. This
  // scales the far plane by the same `k` every other proportional quantity
  // here already uses.
  const cameraFar = useMemo(
    () => computeCameraFar(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );

  // Initial (mount-only -- R3F's `camera` prop is only read once) camera
  // position. `CameraRig` immediately flies from here to whatever the active
  // preset/focus/target actually resolves to, so this only has to avoid an
  // absurd starting point, not match the target preset exactly.
  const initialPosition = useMemo(
    () => computeCameraPlacement(siteWidth, siteDepth, cameraTarget).position,
    [siteWidth, siteDepth, cameraTarget],
  );

  // Precedence: an explicit `cameraTarget` always wins (back-compat escape
  // hatch); otherwise the near presets ("line"/"eye") honour an explicit
  // zone/building focus; the wide presets ("plant"/"top") always show the
  // whole site regardless of focus (see `isWideCameraPreset`'s doc comment).
  const placement = useMemo(() => {
    if (cameraTarget) return computeCameraPlacement(siteWidth, siteDepth, cameraTarget);
    if (focusBox && !isWideCameraPreset(cameraPreset)) return computeFocusPlacement(focusBox);
    return computeCameraPlacementForPreset(cameraPreset, siteWidth, siteDepth);
  }, [cameraTarget, cameraPreset, focusBox, siteWidth, siteDepth]);

  const desiredPos = useMemo(
    () => new THREE.Vector3(...placement.position),
    [placement.position],
  );
  const focusTarget = useMemo(
    () => new THREE.Vector3(...placement.target),
    [placement.target],
  );

  const { minDistance, maxDistance } = useMemo(
    () => computeDistanceLimits(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );

  const shadowBox = useMemo(
    () => computeShadowCameraBox(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );

  // Scaled light positions -- see `REFERENCE_SUN_POSITION`'s doc comment in
  // plantSceneConfig.ts for why these must scale with site size even though
  // a DirectionalLight's own brightness/direction does not: leaving these at
  // the reference-scale literal anchors the shadow camera at a point that is
  // effectively inside/at the corner of a much bigger scene.
  const sunPosition = useMemo(
    () => computeLightPosition(REFERENCE_SUN_POSITION, siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );
  const fillPosition = useMemo(
    () => computeLightPosition(REFERENCE_FILL_POSITION, siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );
  const rimPosition = useMemo(
    () => computeLightPosition(REFERENCE_RIM_POSITION, siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );

  const groundSize = useMemo(
    () => computeGroundSize(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );
  const apronSize = useMemo(
    () => computeApronSize(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );
  const apronPosition = useMemo(
    () => computeApronPosition(siteWidth, siteDepth),
    [siteWidth, siteDepth],
  );

  const dprCap = highQuality ? PIXEL_RATIO_CAP : PIXEL_RATIO_CAP_LOW;
  const castsShadows = highQuality;

  // Re-arms the CameraRig's fly-to only on an explicit intent change, not on
  // every render (which would happen if `placement` itself were the key --
  // it also changes on resize-driven recomputation upstream).
  const focusKey = `${cameraPreset}|${focusBox ? `${focusBox.x},${focusBox.z},${focusBox.width},${focusBox.depth}` : ""}|${cameraTarget ? cameraTarget.join(",") : ""}`;

  return (
    <Canvas
      dpr={[1, dprCap]}
      shadows="soft"
      gl={{ antialias: ANTIALIAS }}
      camera={{
        fov: CAMERA_FOV,
        near: CAMERA_NEAR,
        far: cameraFar,
        position: initialPosition,
      }}
      onCreated={({ gl }) => {
        // r128 `renderer.outputEncoding = T.sRGBEncoding` -> 0.180
        // `outputColorSpace` (spec §12 row 1), set unconditionally.
        gl.outputColorSpace = OUTPUT_COLOR_SPACE;
        gl.toneMapping = TONE_MAPPING;
        gl.toneMappingExposure = TONE_MAPPING_EXPOSURE;
        // `shadows="soft"` above already selects PCFSoftShadowMap and
        // enables shadow.enabled; set explicitly too so intent is not
        // implicit in a string prop.
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <ContextLossBridge onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <SceneDiagnostics
        siteWidth={siteWidth}
        siteDepth={siteDepth}
        fogDensity={fogDensity}
        near={CAMERA_NEAR}
        far={cameraFar}
        cameraPosition={placement.position}
        cameraTarget={placement.target}
        debugLayoutInfo={debugLayoutInfo}
      />

      <color attach="background" args={[BACKGROUND_COLOR]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, fogDensity]} />

      <hemisphereLight
        args={[HEMI_SKY_COLOR, HEMI_GROUND_COLOR, HEMI_INTENSITY]}
      />

      {/* Flat base fill so nothing in the scene ever reads as pure black. */}
      <ambientLight intensity={AMBIENT_INTENSITY} />

      <directionalLight
        color={SUN_COLOR}
        intensity={SUN_INTENSITY}
        position={sunPosition}
        castShadow={castsShadows}
        shadow-mapSize={[SUN_SHADOW_MAP_SIZE, SUN_SHADOW_MAP_SIZE]}
        shadow-bias={SUN_SHADOW_BIAS}
        shadow-normalBias={SUN_SHADOW_NORMAL_BIAS}
        shadow-camera-left={shadowBox.left}
        shadow-camera-right={shadowBox.right}
        shadow-camera-top={shadowBox.top}
        shadow-camera-bottom={shadowBox.bottom}
        shadow-camera-near={shadowBox.near}
        shadow-camera-far={shadowBox.far}
      />

      <directionalLight color={FILL_COLOR} intensity={FILL_INTENSITY} position={fillPosition} />
      <directionalLight color={RIM_COLOR} intensity={RIM_INTENSITY} position={rimPosition} />

      <CameraRig
        focusKey={focusKey}
        desiredPos={desiredPos}
        focusTarget={focusTarget}
        minDistance={minDistance}
        maxDistance={maxDistance}
        followPoint={followPoint}
      />

      {/* Distant background ground plane -- keeps the floor from running out under fog. */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow={castsShadows}>
        <planeGeometry args={groundSize} />
        <meshStandardMaterial
          color={GROUND_COLOR}
          roughness={GROUND_ROUGHNESS}
          metalness={GROUND_METALNESS}
        />
      </mesh>

      {/* Paved apron slab covering the developed site footprint. */}
      <mesh rotation-x={-Math.PI / 2} position={apronPosition} receiveShadow={castsShadows}>
        <planeGeometry args={apronSize} />
        <meshStandardMaterial
          color={APRON_COLOR}
          roughness={APRON_ROUGHNESS}
          metalness={APRON_METALNESS}
        />
      </mesh>

      {children}
    </Canvas>
  );
}
