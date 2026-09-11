import type { MachineStatus } from "../../../types";

/*
 * ============================================================================
 * LIGHT THEME ("Clean Digital Twin") — neutral engineering-software look.
 * ============================================================================
 * The Live Floor 4D mode reads like professional industrial-twin software
 * (NVIDIA Omniverse / Siemens Plant Simulation style): a neutral light studio,
 * accurate grey machinery, crisp thin outlines, and small but unmistakable
 * status colours. Precise and technical — NOT dark sci-fi, NOT a warm toy
 * diorama.
 *
 * 2026-09 tonal-hierarchy pass: the first real screenshot showed the whole
 * scene sitting in the top 10% of the value range — floor, machines and
 * structure were all near-white and indistinguishable. Every surface family
 * below was deepened so VALUE (not just hue) separates them: floor lightest,
 * machines clearly mid-tone, structure/frames dark. Do not walk these back
 * toward near-white "for cleanliness" — that is the bug this pass fixed.
 *
 * WHAT A FUTURE EDITOR MUST KEEP IN MIND
 * -------------------------------------
 * 1. Emissive materials in three.js do NOT read on a pale background the way
 *    they do on black. An emissive colour only appears "lit" when it is
 *    brighter than its surroundings — against a light floor there is limited
 *    headroom, so a bright emissive can wash out and the signal disappears.
 *    In this theme, status signalling therefore relies on SATURATED DIFFUSE
 *    COLOUR + LUMINANCE CONTRAST against the floor, not on glow.
 * 2. Consequently every "glow" token here (furnaceGlow, impactGlow,
 *    scanlineGlow, signGlow, tankLiquidBase) is DARKER and MORE SATURATED than
 *    its dark-theme ancestor. If you brighten one back up "so it glows more",
 *    it will visually vanish. Prefer raising saturation, lowering lightness, or
 *    adding geometry/animation over raising emissiveIntensity.
 * 3. Keep light-theme accents darker than the surface they sit on. Every status
 *    colour below is verified against both `slab` (#e2e6ea) and the grey
 *    machine body (`machineSteel` #8d99a6), and every HUD text token at >= 4.5:1
 *    against the composited panel background.
 * 4. This file is DATA ONLY (plus the `statusColor` helper). Do not add
 *    behaviour, three.js imports, or per-component logic here.
 * 5. Every key name is consumed by LiveFloorScene / LiveFloorFacility /
 *    LiveFloorHUD. Renaming or removing a key breaks them — recolour values,
 *    keep the shape.
 */

/** Single source of truth for the Live Floor 4D palette. Recolour the mode by editing this file only. */
export const LIVE_FLOOR_THEME = {
  /** scene background + fog colour (fog slightly cooler than the floor so depth still reads) —
   *  deepened so the plant reads as an object in a frame, not white-on-white */
  background: "#cfd6de",
  fog: "#d5dbe2",
  /** floor surfaces */
  ground: "#c9d2da",
  slab: "#e2e6ea",
  gridLine: "#b6c0ca",
  gridSection: "#93a1ae",
  /** building + props */
  structure: "#b9c2cb",
  structureAlt: "#9aa5b1",
  /** crisp technical outline ink used by the inverted-hull outline meshes in
   *  LiveFloorFacility.tsx (building shells, office cluster, and a handful of
   *  larger props), and reused as the floating 3D-label text colour. A cool
   *  slate ink rather than near-black so it still reads as a thin technical
   *  line, not a heavy silhouette. */
  outlineInk: "#33404c",
  /** primary accent (engineering blue) and secondary accent (hover cyan) —
   *  accentAlt was brightened from #00a6b8 to #00bcd4: the original sat too
   *  close in hue/lightness to `accent` (RGB distance ~50, luminance-contrast
   *  ~1.4:1) to read as a clearly different colour for hover vs selected on
   *  thin outline meshes. #00bcd4 keeps the same teal-cyan family but is
   *  brighter and shifted enough to be unmistakable next to `accent`, while
   *  staying far from `status.normal` green so it never reads as a status. */
  accent: "#0d7fd4",
  accentAlt: "#00bcd4",
  /** hazard / safety markings — deep amber; a bright amber disappears on a pale floor */
  hazard: "#c47d12",
  /** cargo + crates — muted warm-grey (invented: fits the neutral-technical family, distinct from steel/floor); deepened alongside structure/concrete */
  cargo: "#8f8371",
  /** machine body steel tint, lerped toward the status colour */
  machineSteel: "#8d99a6",
  /** darker steel used for machine trim/frame parts (consoles, frames, wrists) */
  machineSteelDark: "#6d7885",
  /** lighter structural steel used by the facility shell (racks, rails, crane) */
  facilitySteel: "#a4aeb9",
  /** bare concrete pillars */
  concrete: "#c3ccd5",
  /** zone floor slab base colour, lerped toward the zone's worst status */
  zonePlatform: "#d5dae0",
  /** secondary (walkway) aisle plate colour */
  aisleWalk: "#c8cfd6",
  /** conveyor belt body — deepened to match the CONVEYOR palette family */
  belt: "#4a525c",
  /** dashed centre-line stripe on main aisles — kept near-white on purpose, it is a
   *  deliberate marking, not a resting surface */
  aisleStripe: "#f4f6f8",
  /** hanging sign plate body (invented: matches site.signPlate for consistency) */
  signPlate: "#dbe2e8",
  /** conveyor roller colour — deepened to match the CONVEYOR palette family */
  roller: "#8b96a1",
  /** AGV body colour (invented: steel grey, consistent with machineSteelDark family) */
  agvBody: "#6d7885",
  /** worker capsule body colour (invented: muted slate, distinct from machine steel) */
  workerBody: "#4f5966",
  /** furnace door glow accent — saturated dark ember (invented, must stay darker than the floor) */
  furnaceGlow: "#a3400d",
  /** press impact flash accent — deep amber (invented, not a near-white flash) */
  impactGlow: "#946609",
  /** inspection scan-line accent — deep teal so the sweep reads on a pale slab (invented) */
  scanlineGlow: "#006e78",
  /** base tint of the tank liquid surface, lerped toward the status colour (invented: muted steel blue) */
  tankLiquidBase: "#5c7f9c",
  /** fallback machine body colour for the "pretty" hover/selection silhouette — matches MACHINE.body */
  detailBody: "#8d99a6",
  /** fallback machine trim colour for the "pretty" hover/selection silhouette — matches MACHINE.bodyDark */
  detailAccent: "#6d7885",
  /** floating 3D-label text colour (hover/selection callouts) — reuses outlineInk */
  labelText: "#33404c",
  /** contact-shadow tint under machines — a neutral cool grey, never black, on a light floor */
  shadowColor: "#6b7683",
  /** "no data" placeholder text colour (invented: muted slate, close to but distinct from labelText) */
  placeholderText: "#4a5563",
  /** fallback colour for an unrecognised machine status — reuses the idle/neutral status tone */
  statusFallback: "#6b7683",
  /**
   * PLC stack light (โคมไฟสัญญาณ 3 ชั้น) lamp endpoints. Every machine carries
   * a STATIC 3-lamp tower (green / yellow / red) and only the LIT/UNLIT set
   * changes, on a status change, never per frame. `*Lit` values are saturated
   * so the lamp glow reads clearly. `*Dark` is a muted, grey-tinted version of
   * the same hue — not a pale tint — so an unlit lamp still reads as "a lamp
   * that is off" (frosted, dim glass) rather than disappearing into the pale
   * floor the way a fully-desaturated grey would.
   */
  stackLight: {
    greenLit: "#1fbf74",
    greenDark: "#6b7a72",
    yellowLit: "#ffb020",
    yellowDark: "#8a7a5f",
    redLit: "#e8453c",
    redDark: "#8a6560",
    /** 4th lamp colour for `idle`/maintenance — no real PLC stack light has a
     *  blue lamp, but this scene needs one lit tone per `KitStatus`. Picked
     *  to match `status.maintenance` (#5f6f8c) in hue/intent while being
     *  saturated/bright enough to actually read as "lit" (see the emissive
     *  note above `stackLight`). */
    blueLit: "#2f8fe0",
    blueDark: "#6b7480",
  },
  /** shared neutral endpoints for materials whose actual colour comes from instance tinting */
  neutral: {
    white: "#ffffff",
    black: "#000000",
  },
  /**
   * machine status colours — the product's status language. Verified
   * unmistakable against both the light floor (`slab` #e2e6ea) and the grey
   * machine body (`machineSteel` #8d99a6).
   */
  status: {
    normal: "#147a4f",
    warning: "#a8650a",
    error: "#b23227",
    maintenance: "#4d5f7d",
  },
  /** scene lighting tints — neutral white studio light, not warm or neon */
  light: {
    ambient: "#ffffff",
    key: "#ffffff",
    rimA: "#eaf1fb",
    rimB: "#f5f7fa",
  },
  /**
   * โทนสีของ "ไซต์โรงงาน" ภายนอกอาคาร — ถนน ลานจอด ลานวัสดุ ต้นไม้ รถบรรทุก
   * และป้ายชื่อโรงบนหลังคา (ใช้โดย LiveFloorFacility เท่านั้น)
   */
  site: {
    /** ลานคอนกรีต/ยางมะตอยทั่วไซต์ */
    asphalt: "#9aa4ae",
    /** เส้นจราจรบนถนน + เส้นแบ่งช่องจอด — deepened to match WALKWAY.laneWhite family */
    roadLine: "#e6ebef",
    /** พื้นหญ้า/แปลงปลูกรอบไซต์ */
    grass: "#7fa877",
    /** ขอบคันหินของลานวัสดุ (invented: neutral structural grey) — matches structureAlt */
    kerb: "#9aa5b1",
    /** หัวลากรถบรรทุก (invented: steel frame grey) — matches MACHINE.frame family */
    truckBody: "#4e5a67",
    /** ตู้พ่วงรถบรรทุก (invented: light concrete grey) */
    truckTrailer: "#c3ccd5",
    /** ไฟท้ายรถบรรทุก */
    truckLight: "#b23227",
    /** ประตูรั้วเลื่อน (ซี่ประตู) */
    gateAccent: "#0d7fd4",
    /** แผ่นป้ายชื่อโรงบนหลังคา */
    signPlate: "#dbe2e8",
    /** สีตัวอักษร/ขอบป้ายชื่อโรง (ค่าเริ่มต้นเมื่อสถานะปกติ) — สีทึบเข้มที่อ่าน
     *  ได้บนแผ่นป้ายสีขาว ไม่ใช่ "แสงเรือง" */
    signGlow: "#33404c",
    /** พุ่มใบไม้ */
    foliage: "#5d8757",
    /** ลำต้นไม้ */
    trunk: "#6f6355",
    /** ผนังหลักอาคารสำนักงาน */
    officeWall: "#c3ccd5",
    /** แถบกระจกโค้งอาคารสำนักงาน (curtain wall) */
    officeGlass: "#8fa2b4",
    /** แถบพื้นชั้น (floor-slab band) คั่นระหว่างชั้นของอาคารสำนักงาน */
    officeBand: "#a4aeb9",
    /** ฝาหลังคายื่นของอาคารสำนักงาน — เข้มสุดในกลุ่มให้ดูมีน้ำหนักด้านบน */
    officeRoof: "#5a656f",
    /** ผิวลานพลาซ่าหน้าอาคารสำนักงาน (invented: matches zonePlatform family) */
    plazaPaving: "#d5dae0",
    /** เสาธง (invented: steel grey) — matches facilitySteel */
    flagpole: "#a4aeb9",
    /** ผืนธง */
    flag: "#0d7fd4",
    /** แนวรั้วต้นไม้เตี้ย (hedge) */
    hedge: "#6b9464",
    /** เรือนไฟของเสาไฟถนน — สีทึบอิ่มตัว (ไม่ใช่ emissive จ้า) ให้เห็นชัดกลางวัน
     *  (reuses hazard amber) */
    lampHousing: "#c47d12",
  },
  /** 2D HUD tokens — Tailwind-arbitrary-value strings, used by LiveFloorHUD.
   *  Light frosted-glass panel (matches the Clean Digital Twin light scene). */
  hud: {
    panelBg: "#ffffffe6",
    panelBorder: "#0d7fd433",
    panelGlow: "#0b213a1a",
    text: "#16202b",
    textMuted: "#5b6472",
    accent: "#0d7fd4",
    accentSoft: "#178a5a",
    danger: "#c0392b",
    boxBg: "#f4f5f7",
    accentHover: "#0a6cb5",
  },
  /**
   * NIGHT MODE (roadmap step 16) — additive block, does not touch any
   * existing key above. Sky/fog/sun/ambient tokens for the real-time day/night
   * cycle in `scene/TimeOfDaySky.tsx`, plus emissive tokens for the plant's own
   * night lighting (pole lights, office windows, gate/guard house).
   *
   * Deliberately NOT touching `status`/`stackLight` above: those are emissive
   * materials that render independent of scene light intensity (see note 1 at
   * the top of this file) and the night sky is DARKER than the day background,
   * so status legibility only improves after dark — it never needs a separate
   * night variant.
   */
  night: {
    /** deep-night sky/background */
    skyNight: "#0b1220",
    /** dawn/dusk horizon band — warm, low-saturation so it doesn't compete with status colours */
    skyDawn: "#6b7f9e",
    skyDusk: "#7a6a5a",
    /** midday sky — brighter, cooler than the daytime background/fog above (those stay a neutral studio grey) */
    skyDay: "#bcd2e8",
    /** fog tint at night — cool dark grey, never pure black so distant shapes still separate from it */
    fogNight: "#1a2333",
    /** sun disc colour through the day arc */
    sunDawn: "#ffb37a",
    sunDay: "#ffffff",
    sunDusk: "#ff9a5c",
    /** plant's own night lighting — pole lamp + office window + gate glow (all emissive, unlit materials) */
    poleLampLit: "#ffdca0",
    windowLit: "#ffd9a0",
    gateLit: "#ffe2ad",
  },
} as const;

export type LiveFloorTheme = typeof LIVE_FLOOR_THEME;

/** Thai-labelled status colour lookup for scene code. */
export function statusColor(status: MachineStatus): string {
  return LIVE_FLOOR_THEME.status[status] ?? LIVE_FLOOR_THEME.statusFallback;
}
