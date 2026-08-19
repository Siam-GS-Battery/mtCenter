import type { MachineStatus } from "../../../types";

/*
 * ============================================================================
 * LIGHT THEME ("daylight factory") — this palette is NO LONGER dark sci-fi.
 * ============================================================================
 * The Live Floor 4D mode now matches the rest of the app's light surfaces
 * (#ffffff / #f5f5f7 cards, #0066cc primary, #1d1d1f ink). Read as: an airy,
 * overcast-daylight factory floor, not a neon night scene.
 *
 * WHAT A FUTURE EDITOR MUST KEEP IN MIND
 * -------------------------------------
 * 1. Emissive materials in three.js do NOT read on a pale background the way
 *    they do on black. An emissive colour only appears "lit" when it is
 *    brighter than its surroundings — against a #f2f5fa floor there is almost
 *    no headroom left, so a bright emissive just washes out to near-white and
 *    the signal disappears. In this theme, status signalling therefore relies
 *    on SATURATED DIFFUSE COLOUR + LUMINANCE CONTRAST against the pale floor,
 *    not on glow.
 * 2. Consequently every "glow" token here (furnaceGlow, impactGlow,
 *    scanlineGlow, signGlow, tankLiquidBase) is DARKER and MORE SATURATED than
 *    its dark-theme ancestor. If you brighten one back up "so it glows more",
 *    it will visually vanish. Prefer raising saturation, lowering lightness, or
 *    adding geometry/animation over raising emissiveIntensity.
 * 3. Keep light-theme accents darker than the surface they sit on. Every status
 *    colour below is verified at >= 3:1 against `ground` (#f2f5fa), and every
 *    HUD text token at >= 4.5:1 against the composited panel background.
 * 4. This file is DATA ONLY (plus the `statusColor` helper). Do not add
 *    behaviour, three.js imports, or per-component logic here.
 * 5. Every key name is consumed by LiveFloorScene / LiveFloorFacility /
 *    LiveFloorHUD. Renaming or removing a key breaks them — recolour values,
 *    keep the shape.
 */

/** Single source of truth for the Live Floor 4D palette. Recolour the mode by editing this file only. */
export const LIVE_FLOOR_THEME = {
  /** scene background + fog colour (fog slightly cooler/darker than the ground so depth still reads) */
  background: "#e8eef7",
  fog: "#dfe8f4",
  /** floor surfaces */
  ground: "#f2f5fa",
  slab: "#f2f5fa",
  gridLine: "#c3d2e6",
  gridSection: "#0066cc",
  /** building + props */
  structure: "#dbe4f0",
  structureAlt: "#c6d3e4",
  /** Sims-style dark silhouette outline ink used by the inverted-hull outline
   *  meshes in LiveFloorFacility.tsx (building shells, office cluster, and a
   *  handful of larger props). Near-black navy rather than pure black so it
   *  still reads as "ink" and not a void against the pale daylight scene. */
  outlineInk: "#12151d",
  /** primary accent (product blue) and secondary violet accent */
  accent: "#0066cc",
  accentAlt: "#6b5bd6",
  /** hazard / safety markings — deep amber; a bright amber disappears on a pale floor */
  hazard: "#bd7d04",
  /** cargo + crates */
  cargo: "#c79a5f",
  /** machine body steel tint, lerped toward the status colour */
  machineSteel: "#aebbcd",
  /** darker steel used for machine trim/frame parts (consoles, frames, wrists) */
  machineSteelDark: "#7c8ba0",
  /** lighter structural steel used by the facility shell (racks, rails, crane) */
  facilitySteel: "#b3c0d1",
  /** bare concrete pillars */
  concrete: "#d5dde8",
  /** zone floor slab base colour, lerped toward the zone's worst status */
  zonePlatform: "#eaf0f8",
  /** secondary (walkway) aisle plate colour */
  aisleWalk: "#e6ecf5",
  /** conveyor belt body */
  belt: "#8a929e",
  /** dashed centre-line stripe on main aisles */
  aisleStripe: "#0066cc",
  /** hanging sign plate body */
  signPlate: "#ffffff",
  /** conveyor roller colour */
  roller: "#9aa7b8",
  /** AGV body colour */
  agvBody: "#8b9db5",
  /** worker capsule body colour */
  workerBody: "#6d7c93",
  /** furnace door glow accent — saturated ember, must stay darker than the floor */
  furnaceGlow: "#e8590c",
  /** press impact flash accent — deep amber, not the old near-white flash */
  impactGlow: "#c98a00",
  /** inspection scan-line accent — deep cyan so the sweep reads on a pale slab */
  scanlineGlow: "#0a86b8",
  /** base tint of the tank liquid surface, lerped toward the status colour */
  tankLiquidBase: "#7db6cf",
  /** fallback machine body colour for the "pretty" hover/selection silhouette */
  detailBody: "#dde5ef",
  /** fallback machine trim colour for the "pretty" hover/selection silhouette */
  detailAccent: "#b9c6d6",
  /** floating 3D-label text colour (hover/selection callouts) — app ink */
  labelText: "#1d1d1f",
  /** contact-shadow tint under machines — a cool grey, never black, on a light floor */
  shadowColor: "#8c9bb0",
  /** "no data" placeholder text colour */
  placeholderText: "#5f6b7d",
  /** fallback colour for an unrecognised machine status */
  statusFallback: "#78859a",
  /**
   * PLC stack light (โคมไฟสัญญาณ 3 ชั้น) lamp endpoints. Replaces the old
   * animated beacon dome — every machine now carries a STATIC 3-lamp tower
   * (green / yellow / red) and only the LIT/UNLIT set changes, on a status
   * change, never per frame. `*Lit` reuses the exact reviewed `status.*`
   * tokens above (same hue, same >=3:1-on-ground guarantee) so the lamp and
   * the status strip always agree. `*Dark` is a DARK, DESATURATED version of
   * the same hue — not a pale tint — so an unlit lamp still reads as "a lamp
   * that is off" (frosted, dim glass) rather than disappearing into the pale
   * floor the way a fully-desaturated grey would.
   */
  stackLight: {
    greenLit: "#0b8163",
    greenDark: "#5c6a63",
    yellowLit: "#b87503",
    yellowDark: "#6b6152",
    redLit: "#d92d4b",
    redDark: "#6b565b",
  },
  /** shared neutral endpoints for materials whose actual colour comes from instance tinting */
  neutral: {
    white: "#ffffff",
    black: "#000000",
  },
  /**
   * machine status colours — the product's status language. Keep the HUES
   * (green / amber / red / blue); these are the light-theme darkenings of the
   * original dark-theme values, chosen so each clears 3:1 against `ground`.
   */
  status: {
    /** was #22d3a5 — 4.43:1 on ground */
    normal: "#0b8163",
    /** was #fbbf24 — 3.44:1 on ground */
    warning: "#b87503",
    /** was #fb4d63 — 4.34:1 on ground */
    error: "#d92d4b",
    /** was #3b82f6 — 4.73:1 on ground */
    maintenance: "#2563eb",
  },
  /** scene lighting tints — daylight now, not neon rim light */
  light: {
    ambient: "#ffffff",
    key: "#fff6e8",
    rimA: "#cfe0ff",
    rimB: "#e8dcff",
  },
  /**
   * โทนสีของ "ไซต์โรงงาน" ภายนอกอาคาร — ถนน ลานจอด ลานวัสดุ ต้นไม้ รถบรรทุก
   * และป้ายชื่อโรงบนหลังคา (ใช้โดย LiveFloorFacility เท่านั้น)
   */
  site: {
    /** ลานคอนกรีต/ยางมะตอยทั่วไซต์ */
    asphalt: "#c9d2df",
    /** เส้นจราจรบนถนน + เส้นแบ่งช่องจอด */
    roadLine: "#ffffff",
    /** พื้นหญ้า/แปลงปลูกรอบไซต์ */
    grass: "#cfe0c4",
    /** ขอบคันหินของลานวัสดุ */
    kerb: "#aab8c9",
    /** หัวลากรถบรรทุก */
    truckBody: "#7d90ad",
    /** ตู้พ่วงรถบรรทุก */
    truckTrailer: "#e3e9f2",
    /** ไฟท้ายรถบรรทุก */
    truckLight: "#d92d4b",
    /** ประตูรั้วเลื่อน (ซี่ประตู) */
    gateAccent: "#0066cc",
    /** แผ่นป้ายชื่อโรงบนหลังคา */
    signPlate: "#ffffff",
    /** สีตัวอักษร/ขอบป้ายชื่อโรง (ค่าเริ่มต้นเมื่อสถานะปกติ) — ในธีมสว่างนี้
     *  ไม่ใช่ "แสงเรือง" อีกต่อไป แต่เป็นสีทึบเข้มที่อ่านได้บนแผ่นป้ายสีขาว */
    signGlow: "#0066cc",
    /** พุ่มใบไม้ (เขียวใบไม้กลางวัน) */
    foliage: "#7fa66f",
    /** ลำต้นไม้ */
    trunk: "#8a7358",
    /** ผนังหลักอาคารสำนักงาน — เข้มกว่าโรงผลิตเล็กน้อยให้ดู "corporate" */
    officeWall: "#c3cee0",
    /** แถบกระจกโค้งอาคารสำนักงาน (curtain wall) */
    officeGlass: "#7ea3c9",
    /** แถบพื้นชั้น (floor-slab band) คั่นระหว่างชั้นของอาคารสำนักงาน */
    officeBand: "#98a7bd",
    /** ฝาหลังคายื่นของอาคารสำนักงาน — เข้มสุดในกลุ่มให้ดูมีน้ำหนักด้านบน */
    officeRoof: "#5f6f88",
    /** ผิวลานพลาซ่าหน้าอาคารสำนักงาน — อ่อนกว่าลาดยางทั่วไซต์เล็กน้อย */
    plazaPaving: "#dbe1ea",
    /** เสาธง */
    flagpole: "#8f97a3",
    /** ผืนธง */
    flag: "#0066cc",
    /** แนวรั้วต้นไม้เตี้ย (hedge) */
    hedge: "#5f8a53",
    /** เรือนไฟของเสาไฟถนน — สีทึบอิ่มตัว (ไม่ใช่ emissive จ้า) ให้เห็นชัดกลางวัน
     *  แม้เปิด emissive อ่อนๆ ก็ยังอ่านได้เพราะฐานสีเข้มกว่าพื้นถนน/ท้องฟ้า */
    lampHousing: "#b9711c",
  },
  /** 2D HUD tokens — Tailwind-arbitrary-value strings, used by LiveFloorHUD */
  hud: {
    /** near-opaque white glass panel (composites to ~#fcfcfe over `background`) */
    panelBg: "#ffffffd9",
    panelBorder: "#0066cc33",
    /** a faint blue wash instead of a dark-theme outer glow */
    panelGlow: "#0066cc1f",
    text: "#1d1d1f",
    textMuted: "#5f6b7d",
    accent: "#0066cc",
    accentSoft: "#0b8163",
    danger: "#d92d4b",
    boxBg: "#f2f5fa",
    accentHover: "#0071e3",
  },
} as const;

export type LiveFloorTheme = typeof LIVE_FLOOR_THEME;

/** Thai-labelled status colour lookup for scene code. */
export function statusColor(status: MachineStatus): string {
  return LIVE_FLOOR_THEME.status[status] ?? LIVE_FLOOR_THEME.statusFallback;
}
