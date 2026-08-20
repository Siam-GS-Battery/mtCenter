/**
 * machineParts.ts — reusable greeble/detail library for Live Floor 4D machines.
 *
 * PURPOSE
 * Each machine archetype (cnc, press, furnace, assembly, robot, tank,
 * inspection, packing) is described by a small array of `PartSpec` objects in
 * `ARCHETYPE_PARTS` (LiveFloor4DScene.tsx). The renderer turns every PartSpec
 * into exactly ONE InstancedMesh shared by every machine of that archetype, so
 * draw calls scale with (archetype x part count), never with machine count —
 * adding detail parts here is cheap. This module supplies small pure factory
 * functions that build individual "real equipment" details (motor blocks,
 * hoppers, roller rows, guard rails, etc.) instead of the plain box bodies the
 * archetypes started with.
 *
 * FRACTION-OF-FOOTPRINT CONVENTION
 * A PartSpec's `args` describe an UNSCALED unit-space shape:
 *   - box parts always use UNIT_BOX ([1, 1, 1]); actual footprint size comes
 *     from the PER-INSTANCE matrix scale applied in the archetype switch
 *     (e.g. `w * 0.9, h * 0.9, d * 0.9`).
 *   - cyl/torus parts in the existing code use a unit-ish shape too (radius
 *     ~1, height ~1) and rely on the same per-instance scale to reach their
 *     final size — see e.g. `tank.body` (args [1,1,1,14]) or `furnace.stack`.
 * This module follows that exact convention: every factory function returns
 * `args`/geometry ratios in unit space (a taper ratio, a segment count, a
 * relative radius), and returns the intended placement/size as a SEPARATE
 * `PlacementFraction` — { x, y, z, rx, ry, rz, sx, sy, sz } — expressed as
 * FRACTIONS OF THE MACHINE'S w/h/d (mirroring the literal `w * 0.34` style
 * already used throughout `ARCHETYPE_PARTS`'s companion switch statement).
 *
 * IMPORTANT CONTRACT GAP: `PartSpec` itself carries no position/rotation/scale
 * fields — placement is written entirely by hand in the per-archetype switch
 * (via a `putPart(part, index, anim, gi, x, y, z, rx, ry, rz, sx, sy, sz)`
 * call, one per archetype case). This module CANNOT bake placement into a
 * PartSpec. The `placement` / `placements` values returned alongside each
 * `spec` are ADVISORY fraction values only — the agent wiring this into
 * LiveFloor4DScene.tsx must still write the actual `putPart(...)` call(s) in
 * the archetype switch, using these fractions as the x/y/z/rx/ry/rz/sx/sy/sz
 * arguments (multiplied by the machine's real w/h/d, exactly like the
 * existing code does for e.g. `w * PRESS_STROKE`).
 *
 * PICK / LITEDROP RULES (do not break these when editing this file)
 * - Every part here sets `pick: false` (or omits it) and NEVER `pick: true`.
 *   Exactly one part per archetype — the existing "body" — carries
 *   `pick: true`, because pointer hit-testing (`event.instanceId`) and the
 *   Sims-style outline shell both target that single part. A second
 *   `pick: true` part would silently break hover/click and the outline.
 * - Every decorative part here defaults `liteDrop: true` so it is dropped
 *   automatically in the scene's `lite` mode (auto-on above 250 machines, or
 *   under high-DPI pixel-budget pressure — the mitigation for the freeze bug
 *   fixed in commit 81cb3c0). Only parts that replace/extend an existing
 *   STRUCTURAL, always-rendered part (e.g. `taperedLink` replacing the robot
 *   arm's `lower`/`upper` links, or `jointSphere` replacing an arm elbow)
 *   default `liteDrop` to false/omitted, matching how those existing parts
 *   behave today. All defaults can be overridden via `opts.liteDrop` if the
 *   wiring agent decides otherwise for a specific archetype.
 *
 * OTHER RULES FOLLOWED HERE
 * - No castShadow/receiveShadow props (not part of PartSpec, and shadows are
 *   handled elsewhere in the scene).
 * - No `new THREE.Color()` or any per-frame allocation — this module only
 *   returns plain data (numbers/strings), never React elements or objects
 *   touched on every frame.
 * - No React components — pure data/geometry-math module, hence `.ts`.
 * - Every dimension/offset is a FRACTION (never an absolute metre value), so
 *   machines never overflow the footprint the floor-layout packer in
 *   `frontend/src/lib/floorLayout.ts` reserved for them.
 */

// ---------------------------------------------------------------------------
// PartSpec contract, imported from the scene so the two files cannot drift
// apart (LiveFloor4DScene.tsx exports these three types alongside its own
// module-private usage).
// ---------------------------------------------------------------------------

import type { PartSpec, PartGeometryKind, PartMaterialKind } from "./LiveFloor4DScene";

export type { PartSpec, PartGeometryKind, PartMaterialKind };

const UNIT_BOX: readonly number[] = [1, 1, 1];

/**
 * Advisory placement, expressed as FRACTIONS of the machine's own w/h/d.
 * Mirrors the arguments of the scene's `putPart(part, index, anim, gi, x, y,
 * z, rx, ry, rz, sx, sy, sz)` helper. The wiring agent multiplies these by the
 * real w/h/d at the call site (e.g. `w * placement.x`), exactly as every
 * existing archetype case already does with its own inline fraction constants.
 */
export interface PlacementFraction {
  /** position offsets, as fractions of width / height / depth */
  x: number;
  y: number;
  z: number;
  /** rotation in radians (not fractional — angles carry over as-is) */
  rx?: number;
  ry?: number;
  rz?: number;
  /** scale, as fractions of width / height / depth */
  sx: number;
  sy: number;
  sz: number;
}

const DEFAULT_ROT = { rx: 0, ry: 0, rz: 0 } as const;

export interface PlacedPart {
  spec: PartSpec;
  placement: PlacementFraction;
}

export interface RepeatedPart {
  /** single PartSpec with `copies` set — one InstancedMesh, N slots per machine */
  spec: PartSpec;
  /** one PlacementFraction per copy; wiring agent loops `o = li * copies` */
  placements: readonly PlacementFraction[];
}

// ---------------------------------------------------------------------------
// Individual part factories
// ---------------------------------------------------------------------------

/**
 * Thin wide plinth under a machine body — grounds the silhouette so the
 * machine doesn't look like it's floating on the floor tile.
 */
export function basePlate(opts: {
  id?: string;
  widthFrac?: number;
  depthFrac?: number;
  heightFrac?: number;
  yFrac?: number;
  liteDrop?: boolean;
}): PlacedPart {
  const widthFrac = opts.widthFrac ?? 1.06;
  const depthFrac = opts.depthFrac ?? 1.06;
  const heightFrac = opts.heightFrac ?? 0.06;
  const yFrac = opts.yFrac ?? heightFrac / 2;
  return {
    spec: {
      id: opts.id ?? "basePlate",
      geom: "box",
      args: UNIT_BOX,
      mat: "dark",
      liteDrop: opts.liteDrop ?? true,
    },
    placement: {
      x: 0,
      y: yFrac,
      z: 0,
      ...DEFAULT_ROT,
      sx: widthFrac,
      sy: heightFrac,
      sz: depthFrac,
    },
  };
}

/**
 * Flat recessed dark panel for cabinet sides/tops — reads as a vent grille or
 * a recessed access panel.
 */
export function ventGrille(opts: {
  id?: string;
  widthFrac: number;
  heightFrac: number;
  /** how far it stands proud of/recessed into the host face, as a depth fraction */
  depthFrac?: number;
  xFrac?: number;
  yFrac?: number;
  zFrac?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  liteDrop?: boolean;
}): PlacedPart {
  return {
    spec: {
      id: opts.id ?? "ventGrille",
      geom: "box",
      args: UNIT_BOX,
      mat: "dark",
      liteDrop: opts.liteDrop ?? true,
    },
    placement: {
      x: opts.xFrac ?? 0,
      y: opts.yFrac ?? 0.5,
      z: opts.zFrac ?? 0.5,
      rx: opts.rx ?? 0,
      ry: opts.ry ?? 0,
      rz: opts.rz ?? 0,
      sx: opts.widthFrac,
      sy: opts.heightFrac,
      sz: opts.depthFrac ?? 0.02,
    },
  };
}

/**
 * A bolt-on motor: small box housing + a short cylinder shaft stub. Returns
 * both parts; the wiring agent places them adjacently (shaft offset along the
 * housing's forward axis).
 */
export function motorBlock(opts: {
  id?: string;
  bodyWidthFrac?: number;
  bodyHeightFrac?: number;
  bodyDepthFrac?: number;
  shaftRadiusFrac?: number;
  shaftLengthFrac?: number;
  xFrac?: number;
  yFrac?: number;
  zFrac?: number;
  /** shaft axis: cylinderGeometry's local axis is Y, rotate to align with X or Z */
  axis?: "x" | "y" | "z";
  liteDrop?: boolean;
}): [PlacedPart, PlacedPart] {
  const bw = opts.bodyWidthFrac ?? 0.16;
  const bh = opts.bodyHeightFrac ?? 0.14;
  const bd = opts.bodyDepthFrac ?? 0.16;
  const x = opts.xFrac ?? 0;
  const y = opts.yFrac ?? 0.5;
  const z = opts.zFrac ?? 0;
  const axis = opts.axis ?? "z";
  const liteDrop = opts.liteDrop ?? true;
  const rot =
    axis === "x" ? { rx: 0, ry: 0, rz: Math.PI / 2 } : axis === "z" ? { rx: Math.PI / 2, ry: 0, rz: 0 } : DEFAULT_ROT;
  const shaftLen = opts.shaftLengthFrac ?? 0.1;
  const shaftOffset = (bd + shaftLen) / 2;
  const shaftPos =
    axis === "x"
      ? { x: x + shaftOffset, y, z }
      : axis === "z"
        ? { x, y, z: z + shaftOffset }
        : { x, y: y + shaftOffset, z };
  return [
    {
      spec: { id: opts.id ? `${opts.id}Housing` : "motorHousing", geom: "box", args: UNIT_BOX, mat: "metal", liteDrop },
      placement: { x, y, z, ...DEFAULT_ROT, sx: bw, sy: bh, sz: bd },
    },
    {
      spec: {
        id: opts.id ? `${opts.id}Shaft` : "motorShaft",
        geom: "cyl",
        args: [opts.shaftRadiusFrac ?? 0.4, opts.shaftRadiusFrac ?? 0.4, 1, 8],
        mat: "dark",
        liteDrop,
      },
      placement: { ...shaftPos, ...rot, sx: bw * 0.5, sy: shaftLen, sz: bd * 0.5 },
    },
  ];
}

/**
 * A thin cylinder segment for ducting/hydraulics/piping, running along a
 * chosen axis at a given offset. cylinderGeometry's local axis is Y by
 * default; `axis` rotates it to run along X or Z instead.
 */
export function pipeRun(opts: {
  id?: string;
  radiusFrac?: number;
  lengthFrac: number;
  axis?: "x" | "y" | "z";
  xFrac?: number;
  yFrac?: number;
  zFrac?: number;
  mat?: PartMaterialKind;
  liteDrop?: boolean;
}): PlacedPart {
  const axis = opts.axis ?? "y";
  const rot =
    axis === "x" ? { rx: 0, ry: 0, rz: Math.PI / 2 } : axis === "z" ? { rx: Math.PI / 2, ry: 0, rz: 0 } : DEFAULT_ROT;
  const r = opts.radiusFrac ?? 0.03;
  return {
    spec: {
      id: opts.id ?? "pipeRun",
      geom: "cyl",
      args: [1, 1, 1, 8],
      mat: opts.mat ?? "metal",
      liteDrop: opts.liteDrop ?? true,
    },
    placement: {
      x: opts.xFrac ?? 0,
      y: opts.yFrac ?? 0.5,
      z: opts.zFrac ?? 0,
      ...rot,
      sx: r,
      sy: opts.lengthFrac,
      sz: r,
    },
  };
}

/**
 * Tapered cylinder (wide top, narrow bottom) for feed hoppers. Taper is baked
 * into `args` as a top:bottom radius ratio in unit space (radiusTop = 1); the
 * placement's uniform x/z scale then sets the actual top radius as a fraction
 * of the machine's width/depth, and the bottom radius scales with it,
 * preserving the ratio.
 */
export function hopperCone(opts: {
  id?: string;
  topRadiusFrac?: number;
  /** 0..1, bottom radius as a fraction of the top radius; smaller = pointier */
  taperRatio?: number;
  heightFrac?: number;
  xFrac?: number;
  yFrac?: number;
  zFrac?: number;
  segments?: number;
  liteDrop?: boolean;
}): PlacedPart {
  const taperRatio = opts.taperRatio ?? 0.35;
  const topR = opts.topRadiusFrac ?? 0.3;
  return {
    spec: {
      id: opts.id ?? "hopperCone",
      geom: "cyl",
      args: [1, taperRatio, 1, opts.segments ?? 10],
      mat: "steel",
      liteDrop: opts.liteDrop ?? true,
    },
    placement: {
      x: opts.xFrac ?? 0,
      y: opts.yFrac ?? 0.9,
      z: opts.zFrac ?? 0,
      ...DEFAULT_ROT,
      sx: topR,
      sy: opts.heightFrac ?? 0.3,
      sz: topR,
    },
  };
}

/**
 * A row of short cylinders reading as conveyor rollers. Uses the shared
 * PartSpec's `copies` field (the renderer sizes the InstancedMesh to
 * `groupCount * copies`); per-copy placement is NOT automatic — the wiring
 * agent must loop `o = li * copies` and call `putPart` once per entry in
 * `placements`, exactly like the existing `press.frame` (copies: 3) case.
 */
export function rollerRow(opts: {
  id?: string;
  count?: number;
  radiusFrac?: number;
  rollerLengthFrac?: number;
  /** total span the row occupies along the machine's width, as a fraction */
  spanFrac?: number;
  yFrac?: number;
  zFrac?: number;
  liteDrop?: boolean;
}): RepeatedPart {
  const count = Math.max(2, opts.count ?? 5);
  const span = opts.spanFrac ?? 0.8;
  const r = opts.radiusFrac ?? 0.045;
  const len = opts.rollerLengthFrac ?? 0.5;
  const step = count > 1 ? span / (count - 1) : 0;
  const start = -span / 2;
  const placements: PlacementFraction[] = Array.from({ length: count }, (_, i) => ({
    x: start + step * i,
    y: opts.yFrac ?? 0.08,
    z: opts.zFrac ?? 0,
    rx: 0,
    ry: 0,
    rz: Math.PI / 2, // roller axis runs across width (X), cyl default axis is Y
    sx: len,
    sy: r,
    sz: r,
  }));
  return {
    spec: {
      id: opts.id ?? "roller",
      geom: "cyl",
      args: [1, 1, 1, 10],
      mat: "metal",
      copies: count,
      liteDrop: opts.liteDrop ?? true,
    },
    placements,
  };
}

/**
 * Thin box rails at floor/edge level (front + back), reading as a guard
 * rail / kick rail around the machine's footprint. Uses `copies: 2`.
 */
export function guardRail(opts: {
  id?: string;
  widthFrac?: number;
  heightFrac?: number;
  thicknessFrac?: number;
  yFrac?: number;
  /** how far toward the front/back edge, as a depth fraction from centre */
  edgeFrac?: number;
  liteDrop?: boolean;
}): RepeatedPart {
  const w = opts.widthFrac ?? 1.0;
  const h = opts.heightFrac ?? 0.12;
  const t = opts.thicknessFrac ?? 0.02;
  const y = opts.yFrac ?? 0.06;
  const edge = opts.edgeFrac ?? 0.52;
  return {
    spec: {
      id: opts.id ?? "guardRail",
      geom: "box",
      args: UNIT_BOX,
      mat: "dark",
      copies: 2,
      liteDrop: opts.liteDrop ?? true,
    },
    placements: [
      { x: 0, y, z: -edge, ...DEFAULT_ROT, sx: w, sy: h, sz: t },
      { x: 0, y, z: edge, ...DEFAULT_ROT, sx: w, sy: h, sz: t },
    ],
  };
}

/**
 * A few thin horizontal boxes ("rungs") against a vertical surface, reading
 * as a maintenance ladder. Uses `copies` sized to `rungCount`.
 */
export function ladderRungs(opts: {
  id?: string;
  rungCount?: number;
  widthFrac?: number;
  thicknessFrac?: number;
  /** vertical span the rungs occupy, as a height fraction */
  spanFrac?: number;
  startYFrac?: number;
  xFrac?: number;
  zFrac?: number;
  liteDrop?: boolean;
}): RepeatedPart {
  const count = Math.max(2, opts.rungCount ?? 4);
  const span = opts.spanFrac ?? 0.5;
  const startY = opts.startYFrac ?? 0.15;
  const step = count > 1 ? span / (count - 1) : 0;
  const w = opts.widthFrac ?? 0.18;
  const t = opts.thicknessFrac ?? 0.02;
  const x = opts.xFrac ?? 0.48;
  const z = opts.zFrac ?? 0.48;
  const placements: PlacementFraction[] = Array.from({ length: count }, (_, i) => ({
    x,
    y: startY + step * i,
    z,
    ...DEFAULT_ROT,
    sx: t,
    sy: t,
    sz: w,
  }));
  return {
    spec: {
      id: opts.id ?? "ladderRung",
      geom: "box",
      args: UNIT_BOX,
      mat: "dark",
      copies: count,
      liteDrop: opts.liteDrop ?? true,
    },
    placements,
  };
}

/**
 * Sphere for an articulated-arm elbow/shoulder joint. Defaults `liteDrop` to
 * false because it replaces/extends a structural joint (like the robot's
 * `wrist`), which is not dropped in lite mode today.
 */
export function jointSphere(opts: {
  id?: string;
  radiusFrac?: number;
  xFrac?: number;
  yFrac?: number;
  zFrac?: number;
  mat?: PartMaterialKind;
  animated?: boolean;
  liteDrop?: boolean;
}): PlacedPart {
  const r = opts.radiusFrac ?? 0.1;
  return {
    spec: {
      id: opts.id ?? "jointSphere",
      geom: "sphere",
      args: [1, 12, 10],
      mat: opts.mat ?? "dark",
      animated: opts.animated,
      liteDrop: opts.liteDrop ?? false,
    },
    placement: { x: opts.xFrac ?? 0, y: opts.yFrac ?? 0.5, z: opts.zFrac ?? 0, ...DEFAULT_ROT, sx: r, sy: r, sz: r },
  };
}

/**
 * Slanted control box with a darker recessed screen face — an operator
 * console/HMI panel. Returns [housing, screen]; screen sits a hair proud of
 * the housing's slanted face so it doesn't z-fight.
 */
export function controlConsole(opts: {
  id?: string;
  widthFrac?: number;
  heightFrac?: number;
  depthFrac?: number;
  /** forward tilt, radians */
  tiltRad?: number;
  xFrac?: number;
  yFrac?: number;
  zFrac?: number;
  liteDrop?: boolean;
}): [PlacedPart, PlacedPart] {
  const w = opts.widthFrac ?? 0.2;
  const h = opts.heightFrac ?? 0.28;
  const d = opts.depthFrac ?? 0.14;
  const tilt = opts.tiltRad ?? 0.35;
  const x = opts.xFrac ?? 0;
  const y = opts.yFrac ?? 0.5;
  const z = opts.zFrac ?? 0.4;
  const liteDrop = opts.liteDrop ?? true;
  return [
    {
      spec: { id: opts.id ? `${opts.id}Housing` : "consoleHousing", geom: "box", args: UNIT_BOX, mat: "dark", liteDrop },
      placement: { x, y, z, rx: tilt, ry: 0, rz: 0, sx: w, sy: h, sz: d },
    },
    {
      spec: { id: opts.id ? `${opts.id}Screen` : "consoleScreen", geom: "box", args: UNIT_BOX, mat: "flat", liteDrop },
      placement: {
        x,
        y: y + Math.sin(tilt) * d * 0.55,
        z: z + Math.cos(tilt) * d * 0.55,
        rx: tilt,
        ry: 0,
        rz: 0,
        sx: w * 0.7,
        sy: h * 0.55,
        sz: d * 0.06,
      },
    },
  ];
}

/**
 * Tapered cylinder for a robot-arm segment, replacing a plain box "link" with
 * a mechanically plausible shape (wide at the joint end, narrower at the
 * far end). Defaults `liteDrop` to false/undefined because it is meant to
 * REPLACE a structural, always-rendered part (e.g. the robot's `lower` /
 * `upper` links), which are not dropped in lite mode today. `animated` is
 * exposed because the existing links this replaces are `animated: true`
 * (their matrix is patched every frame by the arm-sweep animator, not by the
 * static writer) — placement fractions are therefore NOT meaningful for the
 * animated case and are omitted from the return; the wiring agent's animator
 * computes the transform directly, as it already does for `lower`/`upper`.
 */
export function taperedLink(opts: {
  id?: string;
  /** near-joint radius, far-end radius as a ratio of it (0..1) */
  farRadiusRatio?: number;
  mat?: PartMaterialKind;
  animated?: boolean;
  liteDrop?: boolean;
  segments?: number;
}): PartSpec {
  return {
    id: opts.id ?? "taperedLink",
    geom: "cyl",
    // CylinderGeometry's radiusTop sits at local +Y, radiusBottom at local -Y.
    // Every call site (see LiveFloor4DScene.tsx's arm-sweep animator and the
    // static writer) positions/pitches these links so local +Y is the far/tip
    // end (away from the pedestal/previous joint) and local -Y is the
    // near/joint end. A real arm link is thick at the joint and tapers toward
    // the tip, so the WIDE radius (1) belongs at radiusBottom (-Y, joint end)
    // and the NARROW radius (farRadiusRatio) at radiusTop (+Y, tip end).
    args: [opts.farRadiusRatio ?? 0.85, 1, 1, opts.segments ?? 8],
    mat: opts.mat ?? "metal",
    animated: opts.animated ?? true,
    liteDrop: opts.liteDrop,
  };
}
