import { LIVE_FLOOR_THEME } from "../liveFloorTheme";
import type { KitStatus } from "../../../../lib/plantArchetypes";

/**
 * ===========================================================================
 * PALETTE — สีของฉากเครื่องจักรใหม่
 * ===========================================================================
 *
 * แยกออกมาเป็นไฟล์เดียวโดยเจตนา: ทุกสีในฉากอ่านจากที่นี่ที่เดียว การปรับโทน
 * ทั้งฉากจึงแก้ไฟล์นี้ไฟล์เดียว ไม่ต้องไล่แก้ไฟล์เรขาคณิตทีละตัว
 *
 * เจตนาของโทน — "Clean Digital Twin" กลาง นิ่ง แม่นยำแบบซอฟต์แวร์วิศวกรรม
 * มืออาชีพ (NVIDIA Omniverse / Siemens Plant Simulation) ไม่ใช่ dark sci-fi
 * และไม่ใช่ diorama อบอุ่นแบบของเล่น
 *   • ตัวเครื่องจักร/โครงสร้าง ใช้เทาโลหะกลาง (neutral grey) แม่นยำแบบเครื่องจักร
 *     จริง มีมิติจากการไล่น้ำหนักเทา ไม่ใช่จากสีอุ่น/คอนทราสต์ต่ำแบบ clay
 *   • พื้นสแลบ/ผนัง/ไซต์ภายนอก ใช้โทนสว่างเทากลางจาก `liveFloorTheme.ts`
 *     ตามเดิม ซึ่งค่าสถานะทุกตัวในนั้นถูกเลือกให้อ่านชัดทั้งบนพื้นสว่างและ
 *     บนตัวเครื่องจักรสีเทาแล้ว (ดูคอมเมนต์ `status` ใน liveFloorTheme.ts)
 *
 * ถ้าต้องการ "ฉากมืดทั้งฉาก" (พื้น/ผนัง/ท้องฟ้ามืด) ให้แก้ `FLOOR`, `SHELL`
 * และ `BACKGROUND` ที่นี่ — แต่ต้องรีวิวคอนทราสต์ของ `STATUS` ใหม่ทั้งชุด
 * เพราะค่าพวกนั้นถูกจูนมาสำหรับพื้นสว่าง
 */

/** สีพื้นหลังฉาก + หมอก */
export const BACKGROUND = LIVE_FLOOR_THEME.background;
export const FOG = LIVE_FLOOR_THEME.fog;

/** พื้นและการตีเส้นบนพื้น */
export const FLOOR = {
  /** พื้นนอกอาคาร (ลานคอนกรีต) */
  apron: LIVE_FLOOR_THEME.site.asphalt,
  /** สแลบพื้นในอาคาร */
  slab: LIVE_FLOOR_THEME.slab,
  /** พื้นโซนการผลิต — เข้มกว่าสแลบเล็กน้อยให้เห็นขอบโซน */
  zone: LIVE_FLOOR_THEME.zonePlatform,
  /** ทางเดิน/ช่องเดินระหว่างไลน์ */
  aisle: LIVE_FLOOR_THEME.aisleWalk,
  /** เส้นตีขอบช่องทางเดิน */
  aisleStripe: LIVE_FLOOR_THEME.aisleStripe,
  /** แถบเตือนสีเหลืองรอบฐานเครื่อง */
  hazard: LIVE_FLOOR_THEME.hazard,
  grass: LIVE_FLOOR_THEME.site.grass,
  road: LIVE_FLOOR_THEME.site.asphalt,
  roadLine: LIVE_FLOOR_THEME.site.roadLine,
};

/** เปลือกอาคาร โครงสร้าง และของประกอบไซต์ */
export const SHELL = {
  column: LIVE_FLOOR_THEME.concrete,
  beam: LIVE_FLOOR_THEME.facilitySteel,
  wall: LIVE_FLOOR_THEME.structure,
  wallAlt: LIVE_FLOOR_THEME.structureAlt,
  roofEdge: LIVE_FLOOR_THEME.site.officeRoof,
  building: LIVE_FLOOR_THEME.site.officeWall,
  buildingGlass: LIVE_FLOOR_THEME.site.officeGlass,
  shed: LIVE_FLOOR_THEME.structureAlt,
  tank: LIVE_FLOOR_THEME.facilitySteel,
  foliage: LIVE_FLOOR_THEME.site.foliage,
  trunk: LIVE_FLOOR_THEME.site.trunk,
  pole: LIVE_FLOOR_THEME.site.flagpole,
  fence: LIVE_FLOOR_THEME.facilitySteel,
};

/**
 * ตัวเครื่องจักร — โทนเทาโลหะกลาง (neutral engineering grey) ตั้งใจ hardcode
 * ไว้ในไฟล์นี้ (จงใจไม่อ่านจาก `liveFloorTheme.machineSteel*` เพื่อให้ปรับตัว
 * เครื่องแยกจากธีมพื้น/ผนังได้อิสระ) — อ้างอิงสเปก "Clean Digital Twin":
 * body/bodyDark เป็นเทาโลหะแม่นยำ, trim/dark-detail เป็นเทาเข้มสำหรับชิ้นส่วน
 * เคลื่อนไหว/ยาง/ปะเก็น
 */
export const MACHINE = {
  /** ตัวถังหลัก — เทาโลหะกลาง; deepened so machines read as solid objects against the floor */
  body: "#8d99a6",
  /** ฝาครอบ/แผงข้าง — เข้มกว่าตัวถัง ใช้ไล่ระดับให้เห็นรูปทรง */
  bodyDark: "#6d7885",
  /** โครงเหล็ก ขา แป๊บ ราวกันตก — เทาเข้ม (trim) */
  frame: "#4e5a67",
  /** ชิ้นส่วนเคลื่อนไหว/แผงสว่าง (ลูกกลิ้ง แกน แขนหุ่น) — เทาอ่อนกว่า body */
  steel: "#a8b3bd",
  /** ยาง/สายพาน/ปะเก็น — เข้มสุดในกลุ่ม */
  rubber: "#39424c",
  /** ท่อ/สายไฟร้อยราง — เทาโลหะกลาง ให้ดูเป็นงานระบบ */
  conduit: "#616d7a",
  /** กระจกตู้คอนโทรล/ช่องมอง — ฟ้าเทานุ่ม */
  glass: "#8fa2b4",
  /** จอ HMI — เข้มโดยตั้งใจ (เป็น emissive อื่นในโค้ด) เพื่อให้แสงเรืองอ่านชัด
   *  บนจอที่มืด ไม่ใช่จอที่สว่างอยู่แล้ว */
  screen: "#1e2a38",
  /** แถบเตือนคาดตัวเครื่อง — จงใจแยกจาก status.warning เพื่อไม่ให้สับสนกับ
   *  สถานะเตือนจริงของเครื่อง (สีคาดหมายถึง "มีจุดอันตราย" ไม่ใช่ "สถานะ") */
  hazard: "#c47d12",
};

/** สีสถานะเครื่องจักร — ใช้ชุดเดียวกับ HUD และแถบสถานะ ไม่นิยามใหม่ */
export const STATUS: Record<KitStatus, string> = {
  run: LIVE_FLOOR_THEME.status.normal,
  warn: LIVE_FLOOR_THEME.status.warning,
  stop: LIVE_FLOOR_THEME.status.error,
  idle: LIVE_FLOOR_THEME.status.maintenance,
};

/**
 * สี "หลอดไฟติดจริง" (lit lamp) ของ PLC stack light — อิ่มตัว/สว่างกว่า
 * `STATUS` โดยเจตนา (ดูคอมเมนต์ที่ `LIVE_FLOOR_THEME.stackLight`) ใช้เฉพาะกับ
 * วัสดุ emissive ที่ต้อง "ดูเหมือนไฟติด" จริง ๆ — โคมสัญญาณบนตัวเครื่องและ
 * status marker ลอย (ดู `MachineInstances.tsx`) ห้ามใช้กับ 2D/HUD หรือพื้นผิว
 * ที่อ่านบนพื้นสว่าง (ใช้ `STATUS`/`statusColorOf` สำหรับกรณีนั้นแทน)
 */
export const STACK_LIGHT: Record<KitStatus, string> = {
  run: LIVE_FLOOR_THEME.stackLight.greenLit,
  warn: LIVE_FLOOR_THEME.stackLight.yellowLit,
  stop: LIVE_FLOOR_THEME.stackLight.redLit,
  idle: LIVE_FLOOR_THEME.stackLight.blueLit,
};

export function stackLightColorOf(status: KitStatus): string {
  return STACK_LIGHT[status] ?? STATUS_FALLBACK;
}

/**
 * ทางเดินคนตามมาตรฐานความปลอดภัยโรงงาน (pedestrian walkway)
 *
 * กฎที่ฉากต้องสื่อออกมาให้เห็น: **คนเดินได้แค่ในพื้นที่สีที่กำหนด ห้ามข้าม
 * เส้นขอบทางเดินออกไปในเลนรถ** สีจึงไม่ใช่เรื่องตกแต่ง มันคือความหมาย
 *
 *   • ในอาคาร  — พื้นทางเดินเขียวเทาอมฟ้าอ่อน (walkway fill) ตีเส้นขอบสองข้าง
 *   • นอกอาคาร — ทางเดินโทนสนิมแดง-ส้ม ตีเส้นขอบริมด้านเลนรถ และมีคันหินทาลาย
 *                สลับกันคั่นจากถนน
 *
 * พื้นฉากนี้เป็นเทากลางสว่าง (slab/zonePlatform/aisleWalk) ดังนั้นเครื่องหมาย
 * ต้องต่าง "เฉด" (hue) จากพื้นเทา ไม่ใช่แค่ต่างความสว่าง — ทุกค่าด้านล่าง
 * ตรวจสอบแล้วว่าต่างจาก slab (#e2e6ea), zonePlatform (#d5dae0) และ aisleWalk
 * (#c8cfd6) อย่างชัดเจน (re-verified after the 2026-09 tonal-hierarchy pass
 * that deepened those three floor surfaces)
 */
export const WALKWAY = {
  /** พื้นทางเดินในอาคาร — เขียวเทาอมฟ้า desaturate ต่างเฉดจากพื้นเทากลางชัดเจน */
  epoxyGreen: "#5f8f78",
  /** ทางเดินนอกอาคาร — สนิมแดง-ส้มอิ่มตัว ต่างเฉดจากพื้นเทาและมืดกว่าอย่างเห็นได้ชัด */
  outdoorRed: "#a4523a",
  /** เส้นขอบทางเดิน — เส้นที่ห้ามข้าม เหลืองอุ่นอิ่มตัวพอให้อ่านเป็น "เส้นเหลือง
   *  เซฟตี้" ได้ชัดบนพื้นเทา */
  edgeYellow: "#d9ae4a",
  /** ทางม้าลาย/จุดข้าม — kept near-white on purpose, it is a deliberate marking */
  crossingWhite: "#f4f6f8",
  /** ผิวถนนในอาคารและถนนบริการ — เทากลางให้แยกจากพื้นสแลบชัด */
  roadway: "#a9b3bd",
  /** เส้นแบ่งเลนรถ */
  laneWhite: "#e6ebef",
  /** คันหิน: แถบเหลือง (hatch) / แถบขาว / หัวคันหินสีแดง (status.error) */
  curbYellow: "#d9ae4a",
  curbWhite: "#dbe2e8",
  curbRed: "#b23227",
};

/** เส้นตารางอ้างอิงบนพื้นโรงงาน (blueprint reference grid) — ดู `FloorGrid.tsx`
 *  ที่เดียวที่ใช้สีชุดนี้ อ่านจาก `liveFloorTheme.ts` (`gridLine`/`gridSection`)
 *  ที่มีไว้ตั้งแต่ต้นแต่ยังไม่เคยถูกใช้จริง */
export const GRID = {
  /** เส้นตารางย่อย (minor/cell) */
  line: LIVE_FLOOR_THEME.gridLine,
  /** เส้นตารางหลัก (major/section) — เข้มกว่าเส้นย่อยเล็กน้อยให้อ่านระยะได้ */
  section: LIVE_FLOOR_THEME.gridSection,
};

/** สีของสายพานลำเลียงที่เชื่อมเครื่องเป็นไลน์การผลิต — hardcode ค่าของตัวเอง
 *  (ไม่ derive จาก MACHINE) เพราะสเปกกำหนดโทนเทาโลหะ + ลูกกลิ้งเข้มเฉพาะของสายพาน */
export const CONVEYOR = {
  frame: "#4e5a67",
  belt: "#4a525c",
  roller: "#8b96a1",
  leg: "#6d7885",
};

/** ชั้นวางพาเลทในโซน WH (`WarehouseRacking.tsx`) — โทนสีมาตรฐานชั้นวางพาเลท
 *  อุตสาหกรรมจริง (เสาส้มนิรภัย + คานน้ำเงิน) ต่างเฉดชัดจากทั้งพื้นเทากลาง
 *  และตัวเครื่องจักรสีเทา จึงอ่านแยกเป็น "โครงสร้างคลัง" ได้ทันที ไม่ปนกับ
 *  เครื่องจักรหรือพื้น */
export const RACKING = {
  /** เสาโครงชั้นวาง — ส้มนิรภัยมาตรฐานชั้นวางพาเลทอุตสาหกรรม */
  upright: "#c66a1f",
  /** คานรางแนวนอน — น้ำเงินเข้ม คู่สีมาตรฐานกับเสาส้ม */
  beam: "#2f6fae",
  /** พาเลท/สินค้ากอง — โทนไม้/กระดาษลูกฟูกอุ่น */
  pallet: "#b08968",
};

/** รถยกที่วิ่งอยู่ในฉาก (`Forklifts.tsx`, roadmap step 13) — โทนนิรภัย
 *  อุตสาหกรรมมาตรฐาน derive จาก `MACHINE`/`RACKING` ที่มีอยู่แล้ว ไม่ประกาศ
 *  ฮาร์ดโค้ดสีใหม่ซ้ำซ้อน */
export const FORKLIFT = {
  /** ตัวถัง/ถ่วงน้ำหนักท้าย — เหลืองนิรภัยเดียวกับแถบเตือนคาดตัวเครื่องจักร */
  body: MACHINE.hazard,
  /** มาสต์/ส้อม/เสากันสาด — เทาเข้มเดียวกับโครงเหล็กเครื่องจักร */
  steel: MACHINE.frame,
  /** ยาง — เข้มสุดในกลุ่มเดียวกับยาง/สายพานเครื่องจักร */
  tire: MACHINE.rubber,
  /** พาเลทที่บรรทุก — สีเดียวกับพาเลทในชั้นวาง `WarehouseRacking.tsx` */
  cargo: RACKING.pallet,
};

/** สีไฮไลต์ตอน hover / เลือกเครื่อง — derive จาก liveFloorTheme.ts จุดเดียว
 *  (ไม่ hardcode ที่นี่) selected ใช้ accent (น้ำเงินวิศวกรรม เข้มกว่า) และ
 *  hover ใช้ accentAlt (ฟ้าอมเขียว/cyan สว่างกว่า) ทั้งสองค่าต่างเฉด+ความสว่าง
 *  พอให้แยกออกจากกันชัดบนพื้นเทาอ่อนและบนตัวเครื่องจักรสีเทา */
export const HIGHLIGHT = {
  hover: LIVE_FLOOR_THEME.accentAlt,
  selected: LIVE_FLOOR_THEME.accent,
};

/** แสงในฉาก */
export const LIGHT = {
  ambient: LIVE_FLOOR_THEME.light.ambient,
  key: LIVE_FLOOR_THEME.light.key,
  rimA: LIVE_FLOOR_THEME.light.rimA,
  rimB: LIVE_FLOOR_THEME.light.rimB,
  /** hemisphere light "ground" tint (bounce colour) — reuses the building
   *  structure tone instead of a bespoke hex literal, so the sky/ground
   *  hemisphere light still traces back to liveFloorTheme.ts */
  hemisphereGround: LIVE_FLOOR_THEME.structure,
};

/** สีสถานะสำหรับเครื่องที่ไม่รู้สถานะ */
export const STATUS_FALLBACK = LIVE_FLOOR_THEME.statusFallback;

/**
 * เส้นตีพื้นเพิ่มเติม (`FloorMarkings.tsx`) — เส้นทางเดินคนตาม
 * `site.walkways`, กรอบขอบเขตเครื่องจักร, ลานพาเลทมีลาย hatch, ลูกศรทิศทาง
 * ฟอร์คลิฟท์ตามถนน ทุกค่าอ้างจากโทนที่มีอยู่แล้ว (`WALKWAY`/`FLOOR`) ไม่
 * ประกาศสีใหม่ซ้ำซ้อน
 */
export const MARKINGS = {
  /** เส้นเหลืองขนาบทางเดินคน — สีเดียวกับเส้นขอบทางเดินที่ใช้ทั่วฉาก */
  walkwayStripe: WALKWAY.edgeYellow,
  /** กรอบขอบเขตเครื่องจักร — ขาวเทาอ่อนเหมือนเส้นแบ่งเลนถนน อ่านต่างจากพื้น
   *  แต่ไม่แย่งความสนใจจากตัวเครื่อง */
  footprintOutline: WALKWAY.laneWhite,
  /** ลานพาเลท (hatched staging bay) — สีแถบเตือนเดียวกับพื้น (`FLOOR.hazard`) */
  palletBay: FLOOR.hazard,
  /** ลูกศรทิศทางฟอร์คลิฟท์ — ขาวเดียวกับเส้นแบ่งเลนถนน */
  forkliftArrow: WALKWAY.laneWhite,
};

/** เทาเย็นเป็นกลาง (ไม่ใช่ดำ) สำหรับ contact-shadow blob ใต้ฐานเครื่องจักร —
 *  ดู `MachineInstances.tsx` (`ContactShadowInstances`) ที่เดียวที่ใช้สีนี้ */
export const GROUND_SHADOW = LIVE_FLOOR_THEME.shadowColor;

/** โทนกล่องป้ายลอย 3D (data label) ของเครื่องที่เลือก/ชี้อยู่ — สไตล์เดียวกับ
 *  HUD (frosted glass สว่าง) อ่านจาก liveFloorTheme.hud ที่เดียว ไม่ hardcode ซ้ำ */
export const LABEL = {
  panelBg: LIVE_FLOOR_THEME.hud.panelBg,
  panelBorder: LIVE_FLOOR_THEME.hud.panelBorder,
  text: LIVE_FLOOR_THEME.hud.text,
  textMuted: LIVE_FLOOR_THEME.hud.textMuted,
};

export function statusColorOf(status: KitStatus): string {
  return STATUS[status] ?? STATUS_FALLBACK;
}

/** คนงานประจำสถานี (`FloorActivity.tsx`, roadmap step 14) — เสื้อกั๊กใช้โทน
 *  hazard เดียวกับที่ `InspectorRobot.tsx` ใช้เป็นเสื้อกั๊กอยู่แล้ว (สไตล์
 *  เดียวกัน ไม่ประกาศสีเสื้อกั๊กใหม่ซ้ำซ้อน) หมวกนิรภัยใช้ขาวเดียวกับเส้น
 *  แบ่งเลนถนน (ต่างเฉด/ความสว่างจากเสื้อกั๊กชัดเจน อ่านได้จากระยะไกล) */
export const WORKER = {
  vest: MACHINE.hazard,
  hat: WALKWAY.laneWhite,
};

/** พาเลท/กองของ WIP + ถังเหล็ก (`FloorActivity.tsx`, roadmap step 14) — พาเลท
 *  ใช้สีเดียวกับพาเลทในชั้นวาง/บนรถยก (`RACKING.pallet`) ไม่ประกาศไม้พาเลทสี
 *  ใหม่ซ้ำซ้อน กองของบนพาเลทใช้โทนกระดาษลูกฟูกอุ่นกว่าไม้พาเลทเล็กน้อยให้แยก
 *  ชั้นได้ ถังเหล็ก/stillage ใช้โทนเหล็กเดียวกับโครงเครื่องจักร */
export const STOCK = {
  pallet: RACKING.pallet,
  crate: "#c9a06a",
  bin: MACHINE.frame,
};

/** กระบวนการ/บรรยากาศเคลื่อนไหว (`ProcessEffects.tsx`, roadmap step 15) —
 *  ไอร้อน/ควันจากปล่องอบชุบใช้เทาอมฟ้าอ่อนโปร่งแสงที่ยังไม่มีใครใช้ ส่วนประกาย
 *  ที่โซนตีขึ้นรูปใช้โทน hazard เดียวกับไฟเตือน/เสื้อกั๊ก แต่ทำให้อิ่มตัว/
 *  สว่างขึ้นเป็น emissive ember แยกออกมาต่างหาก
 *
 *  `beltCargo` เดิม derive มาจาก `STOCK.crate` (ไม้/กระดาษลูกฟูกอุ่น) ซึ่งกลืน
 *  กับโทนสายพาน/พื้นเทากลางของฉากมากเกินไปตอนซูมออกไกล (ผู้ใช้รายงานว่ามอง
 *  ไม่เห็นเครื่องจักรทำงานเลย) จึงแยกเป็นสีของตัวเอง — ส้มอิ่มตัวสว่าง ต่างเฉด
 *  ชัดเจนจากทั้งสายพานเข้ม (`CONVEYOR.belt` #4a525c), พื้นเทากลาง และกล่อง WIP
 *  นิ่งบนพาเลท (`STOCK.crate`) เพื่อให้ "ของที่กำลังไหล" อ่านแยกออกจาก "ของที่
 *  วางนิ่งอยู่" ได้ทันทีจากระยะกล้องปกติ */
export const PROCESS = {
  beltCargo: "#e2822f",
  plume: "#c9d2da",
  ember: "#ff8a3d",
};

/** Roadmap step 16 — real-time day/night cycle (`scene/TimeOfDaySky.tsx`).
 *  Additive re-export of `LIVE_FLOOR_THEME.night`, same pattern as every
 *  other block in this file: colours live in `liveFloorTheme.ts`, this file
 *  just groups them for the scene code that consumes them. */
export const NIGHT = {
  skyNight: LIVE_FLOOR_THEME.night.skyNight,
  skyDawn: LIVE_FLOOR_THEME.night.skyDawn,
  skyDusk: LIVE_FLOOR_THEME.night.skyDusk,
  skyDay: LIVE_FLOOR_THEME.night.skyDay,
  fogNight: LIVE_FLOOR_THEME.night.fogNight,
  fogDay: FOG,
  sunDawn: LIVE_FLOOR_THEME.night.sunDawn,
  sunDay: LIVE_FLOOR_THEME.night.sunDay,
  sunDusk: LIVE_FLOOR_THEME.night.sunDusk,
  poleLampLit: LIVE_FLOOR_THEME.night.poleLampLit,
  windowLit: LIVE_FLOOR_THEME.night.windowLit,
  gateLit: LIVE_FLOOR_THEME.night.gateLit,
  /** pole shaft colour — reuses the existing site pole/fence steel tone, no new hex */
  poleShaft: SHELL.pole,
};
