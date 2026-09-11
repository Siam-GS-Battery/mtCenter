import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PlantLayout } from "../../../../lib/plantLayout";
import { mergeAll } from "./geometryKit";
import { emptyBuckets, ENV_KEYS, MATERIAL_SPECS, type Corridor, type EnvKey } from "./siteShared";
import { buildLineWalkways, buildIndoorRoads, buildLineHalls } from "./siteIndoorInfra";
import { buildOutdoorWalkway, buildRingRoad, buildLineToPerimeterLinks } from "./siteRoads";
import { buildLoadingDock } from "./siteLogistics";
import {
  buildAirHeaderRun,
  buildSubstation,
  buildCompressorRoom,
  buildFireHydrants,
  buildFireCabinets,
  coolingExtractionAnchor,
  buildCoolingExtractionPlant,
  buildExtractionDucting,
  buildExhaustStacks,
  fireWaterAnchor,
  buildFireWaterPlant,
} from "./siteUtilities";
import { buildGreenery, buildRoadsideHedges, buildOfficeFrontageHedges } from "./siteGreenery";
import { buildOfficeBuildings, buildOfficeLinks, officeSites, officeEntryCorridors } from "./siteOffice";
import { buildSiteBuildings } from "./siteEntrance";

/**
 * ===========================================================================
 * SITE ENVIRONMENT — เลนคน/เลนรถ อาคารคลุมไลน์ ต้นไม้ ถนน อาคารประกอบ
 * ===========================================================================
 *
 * ชั้นนี้เพิ่มสิ่งแวดล้อมรอบเครื่องจักร ต่อจาก `PlantShell.tsx` (ที่วาดพื้น
 * โซน เสา ผนัง และไซต์พื้นฐาน) — แยกไฟล์เพราะที่มาของข้อมูลต่างกัน:
 * `PlantShell` วาดตาม `layout.site` ที่ trace มาจากแบบ ส่วนไฟล์นี้ *อนุมาน*
 * ของที่แบบไม่ได้ให้มาเป็นรูปเรขาคณิต จากผังที่แอปแพ็คเครื่องไว้จริง
 *
 * เรื่องพิกัดกับไฟล์ DWG/DXF — ต้องอ่านก่อนแก้
 * -------------------------------------------
 * `Model_3D/NT-26-04 Layout NT.dxf` มีชั้นข้อมูลของจริงครบ (COLUMN, OUT-WALL,
 * GATE, GUARD HOUSE, TREATMENT TANK, CAR PACKING LINE, GUTTER AND CURB,
 * MANHOLE, SIGN BOARD) แต่ **พิกัดของมันใช้ตรง ๆ ไม่ได้**: `plantLayout.ts`
 * rev.5 ตั้งใจไม่ใช้สัดส่วนของแบบอ้างอิง มันขยายโรงจาก 94.3 x 74.3 ม. ของ
 * แบบ เป็นราว 325 x 535 ม. เพื่อให้พอกับเครื่อง 931 ตัวจากฐานข้อมูล (18 จาก
 * 21 section ลงโซน LINES — ดู `Model_3D/LAYOUT-PLAN.md` §3) ถ้าเอาเส้นจาก
 * DXF มาวาง มันจะเล็กกว่าโรงที่ generate ไว้ 3.5-7 เท่า และไม่ตรงกับตำแหน่ง
 * เครื่องแม้แต่ตัวเดียว
 *
 * ที่ทำแทนคือใช้ DXF เป็น **สารบัญว่าโรงนี้มีอะไรอยู่จริง** แล้วสร้างของ
 * เหล่านั้นตามพิกัดของผังที่แอปใช้ — ทางเดินจึงเกาะไปกับไลน์จริง อาคารคลุม
 * ไลน์จึงคลุมโซนจริง ต้นไม้จึงเรียงตามถนนจริง
 *
 * ทุกอย่างเป็นของนิ่ง จึง merge ตามวัสดุเหมือนชั้นอื่น
 *
 * ภาษาสีของเลนเดิน — สื่อกฎความปลอดภัย ไม่ใช่การตกแต่ง
 * ---------------------------------------------------
 * ฉากนี้ต้องอ่านออกว่า **คนเดินได้แค่ในแถบสีที่กำหนด ห้ามข้ามเส้นเหลืองออกไป
 * ในเลนรถ** จึงใช้รหัสสีเดียวกับที่ทาไว้ในโรงงานจริง
 *   • ในอาคาร  — แถบอีพ็อกซี "เขียว" ตีเส้นเหลืองสองข้าง ขนานไปกับเลนรถสีเทา
 *   • นอกอาคาร — ทางเดิน "แดงอิฐ" ตีเส้นเหลือง คั่นจากถนนด้วยคันหินทาลาย
 *                เหลือง/ขาวสลับ ปลายแนวทาแดง
 *   • ข้ามเลนรถได้เฉพาะที่ทางม้าลาย ซึ่งตีไว้เป็นระยะตลอดแนว
 * ค่าสีทั้งชุดอยู่ที่ `palette.ts` (`WALKWAY`) ไฟล์เดียว
 *
 * โครงสร้างไฟล์ (หลังแยกโมดูล)
 * ----------------------------
 * ไฟล์นี้ยาวเกินจะแก้ไหวเป็นไฟล์เดียว (159 KB+ / 2500+ บรรทัด หลังผ่านฟีเจอร์
 * ห้ารอบ) จึงถูกซอยเป็นโมดูลย่อยตามหน้าที่ ไฟล์นี้เหลือแค่ orchestration
 * (`useMemo` เรียก builder ทุกตัว, merge ตาม `EnvKey`, และ render loop):
 *   - `siteShared.ts`      — EnvKey/MATERIAL_SPECS/Buckets, ค่าคงที่ระดับ y,
 *                            Corridor/insideCorridor/pushOutFrom,
 *                            machineHalfExtents, ตัวช่วยวาดทางเดินร่วม
 *   - `siteIndoorInfra.ts` — ทางเดิน/ถนนในอาคาร + อาคารคลุมไลน์ผลิต
 *   - `siteRoads.ts`       — ถนนบริการวงรอบ, ทางเดินแดงรอบนอก,
 *                            ทางเชื่อมไลน์เข้าวงเลียบผนังใน
 *   - `siteLogistics.ts`   — ท่ารับ-ส่งของ
 *   - `siteUtilities.ts`   — สถานีไฟฟ้าย่อย, ห้องปั๊มลม, ท่อลมอัดหลัก,
 *                            หัวจ่ายน้ำ/ตู้ดับเพลิง
 *   - `siteOffice.ts`      — อาคารสำนักงานตั้งเดี่ยว + ทางเดินเชื่อม
 *   - `siteGreenery.ts`    — ต้นไม้/พุ่มรอบไซต์
 *   - `siteEntrance.ts`    — ประตูรั้ว/ป้อมยาม/ตาชั่ง/ไม้กั้น/บ่อบำบัด
 *
 * ทุกโมดูลย่อยยังคง push เข้า `Buckets` เดียวกัน — merge ยังเกิดครั้งเดียวต่อ
 * `EnvKey` ที่นี่ (ดู loop `for (const key of ENV_KEYS)` ข้างล่าง) สถาปัตยกรรม
 * "รวมบัฟเฟอร์เดียว/หนึ่ง draw call ต่อวัสดุ" จึงเหมือนเดิมทุกประการ ไม่ได้
 * กลายเป็นหนึ่ง mesh ต่อโมดูล
 */

export interface SiteEnvironmentProps {
  layout: PlantLayout;
  /**
   * true = "เปิดหลังคา" ไม่วาดแผ่นหลังคาของอาคารไลน์ผลิต เหลือแต่โครงถัก
   * จึงมองลงไปเห็นเครื่องจักรข้างในได้ แบบมุมมองบ้านในเกม The Sims
   *
   * เรขาคณิตหลังคาถูกสร้างไว้เสมอและ cache ตาม `layout` — การสลับค่านี้แค่
   * เลือกไม่ render mesh ก้อนนั้น ไม่ได้สร้างไซต์ใหม่ จึงสลับได้ทันทีไม่กระตุก
   */
  roofOpen?: boolean;
}

export function SiteEnvironment({ layout, roofOpen = false }: SiteEnvironmentProps) {
  const merged = useMemo(() => {
    const b = emptyBuckets();
    const hall = layout.hall;
    const bay = layout.site.hall.bay > 0 ? layout.site.hall.bay : 8.5;

    buildLineWalkways(layout.lines, b);
    buildIndoorRoads(hall.w, hall.d, b);
    buildOutdoorWalkway(hall.w, hall.d, b);
    buildLineHalls(layout.site.zones, hall.h, bay, b);
    buildRingRoad(hall.w, hall.d, layout.site.sheds, layout.site.buildings, layout.site.tankFarms, b);
    const whZone = layout.site.zones.find((z) => z.id === "WH");
    const dockCorridor = buildLoadingDock(hall.d, whZone, layout.site.sheds, layout.site.buildings, b);
    const substationCorridor = buildSubstation(hall.d, layout.site.sheds, layout.site.buildings, b);

    // --- ห้องปั๊มลม: ยึดโรงเก็บของจริงชื่อ "AIR COMP" ทั้งสองหลัง (มีกี่หลังก็
    // ทำเท่านั้น — ไม่มีเลยก็ข้ามเงียบ ๆ เหมือน `buildSubstation`/`buildLoadingDock`) --
    for (const shed of layout.site.sheds.filter((s) => s.name === "AIR COMP")) {
      buildCompressorRoom(shed, b);
    }
    // --- ท่อลมอัดหลักเหนือแนวโซนตีขึ้นรูป + อบชุบ (คนละท่อต่อแถวโซน) -----------
    const forgingZones = layout.site.zones.filter((z) => z.id === "FRG-A" || z.id === "FRG-B");
    const heatZones = layout.site.zones.filter((z) => z.id.startsWith("HT-"));
    buildAirHeaderRun(forgingZones, hall.h, bay, layout.machines, b);
    buildAirHeaderRun(heatZones, hall.h, bay, layout.machines, b);

    // --- ระบบทำความเย็นและดักฝุ่น/ไอควัน: ยึดโรงเก็บของจริงชื่อ "WATER PUMP"
    // (แถวเดียวกับ TR/AIR COMP — ไม่มีก็ข้ามเงียบ ๆ เหมือนกลุ่มอื่น) — ส่ง
    // `substationCorridor` เข้าไปด้วยให้ `coolingExtractionAnchor` บังคับระยะ
    // เผื่อจากกลุ่มสถานีไฟฟ้าจริง (ไม่ใช่แค่เช็ค sheds/buildings เหมือนเดิม) —
    // ท่อดักฝุ่นยึดเฉพาะแถวตีขึ้นรูปที่ต่อออกไปได้จริง (ดู comment ที่
    // `buildExtractionDucting`) ปล่องระบายไอความร้อนยึดกล่องขอบเขตโซนอบชุบ
    // ตรง ๆ ไม่ต้องมี anchor ---------------------------------------------------
    const coolingAnchor = coolingExtractionAnchor(
      hall.d,
      layout.site.sheds,
      layout.site.buildings,
      substationCorridor ? [substationCorridor] : []
    );
    const coolingCorridor = coolingAnchor ? buildCoolingExtractionPlant(coolingAnchor, b) : null;
    if (coolingAnchor) buildExtractionDucting(forgingZones, hall.h, hall.d, bay, layout.machines, coolingAnchor, b);
    buildExhaustStacks(heatZones, hall.h, b);

    // --- ระบบเก็บสำรองน้ำ/น้ำดับเพลิง: ยึดอาคารจริงชื่อ "WATER PUMP" ใน
    // `layout.site.buildings` (คนละหลังกับโรงเก็บของ "WATER PUMP" ที่กลุ่ม
    // ทำความเย็นยึดไปแล้ว — ดู comment ที่ `fireWaterAnchor`) — ส่ง corridor
    // ของกลุ่มท่ารับ-ส่งของ/สถานีไฟฟ้า/ทำความเย็นเข้าไปด้วยให้บังคับระยะเผื่อ
    // จริงเหมือนที่ `coolingExtractionAnchor` ทำกับ `substationCorridor` -----
    const preFireWaterCorridors = [dockCorridor, substationCorridor, coolingCorridor].filter(
      (c): c is Corridor => c !== null
    );
    const fwAnchor = fireWaterAnchor(hall.d, layout.site.sheds, layout.site.buildings, preFireWaterCorridors);
    const fireWaterCorridor = fwAnchor ? buildFireWaterPlant(fwAnchor, b) : null;

    const extraCorridors = [dockCorridor, substationCorridor, coolingCorridor, fireWaterCorridor].filter(
      (c): c is Corridor => c !== null
    );
    buildGreenery(hall.w, hall.d, b, extraCorridors);
    buildOfficeBuildings(hall.w, hall.d, b);
    buildOfficeLinks(hall.w, hall.d, b);
    buildOfficeFrontageHedges(hall.w, hall.d, b);
    buildLineToPerimeterLinks(layout.lines, hall.w, hall.d, b);
    const gateRoad = layout.site.roads.find((r) => r.name === "MAIN GATE road");
    const gateCorridors = buildSiteBuildings(hall.w, hall.d, b, gateRoad);

    // --- กล่องกันชนรวม สำหรับหัวจ่ายน้ำ/ตู้ดับเพลิง ---------------------------
    // ใช้กลไกเดียวกับ `insideCorridor`/`Corridor` ที่ `buildGreenery` ใช้อยู่แล้ว
    // (ไม่ได้คิดระบบกันชนใหม่) ครอบคลุมท่ารับ-ส่งของ, กลุ่มสถานีไฟฟ้าของเราเอง,
    // กลุ่มประตู/ตาชั่ง/บ่อบำบัด, รอยเท้าอาคารสำนักงาน+ลานปูรอบอาคาร (เท่ากับ
    // `w+16`/`d+16` ที่ `buildOfficeBuildings` ปูจริง) และช่องทางเดินเข้าอาคาร
    const officeFootprints: Corridor[] = officeSites(hall.w, hall.d).map((s) => ({
      x0: s.x - (s.w + 16) / 2,
      x1: s.x + (s.w + 16) / 2,
      z0: s.z - (s.d + 16) / 2,
      z1: s.z + (s.d + 16) / 2,
    }));
    const fireExclusions: Corridor[] = [
      ...extraCorridors,
      ...gateCorridors,
      ...officeFootprints,
      ...officeEntryCorridors(hall.w, hall.d),
    ];
    // `extraCorridors` above already carries `fireWaterCorridor` (see the
    // fire-water block) — no need to add it again here separately.
    buildFireHydrants(hall.w, hall.d, b, fireExclusions);
    buildFireCabinets(hall.w, hall.d, b, fireExclusions);
    // พุ่มเตี้ยเลียบถนนบริการวงรอบ — ใช้ชุดกันชนเดียวกับหัวจ่ายน้ำ/ตู้ดับเพลิง
    // ข้างบน (ท่ารับ-ส่งของ/สถานีไฟฟ้า/ประตู/ทางเข้าอาคารสำนักงานครบ) ไม่ได้คิด
    // กลไกกันชนใหม่
    buildRoadsideHedges(hall.w, hall.d, b, fireExclusions);

    const out: Partial<Record<EnvKey, THREE.BufferGeometry>> = {};
    for (const key of ENV_KEYS) {
      const geometry = mergeAll(b[key]);
      if (geometry) out[key] = geometry;
    }
    return out;
  }, [layout]);

  useEffect(
    () => () => {
      for (const geometry of Object.values(merged)) geometry?.dispose();
    },
    [merged]
  );

  return (
    <group>
      {ENV_KEYS.map((key) => {
        const geometry = merged[key];
        if (!geometry) return null;
        if (key === "roofDeck" && roofOpen) return null;
        const spec = MATERIAL_SPECS[key];
        // แผ่นพื้น/สีตีเส้นไม่ทอดเงา (เงาของแผ่นบางบนแผ่นบางให้แต่ noise)
        // แต่ต้องรับเงาจากเสา คานหลังคา และเครื่องจักร
        const isPaint =
          key === "walkGreen" ||
          key === "walkRed" ||
          key === "walkLine" ||
          key === "zebra" ||
          key === "roadway" ||
          key === "laneLine" ||
          key === "roadLine";
        return (
          <mesh key={key} geometry={geometry} castShadow={!isPaint} receiveShadow raycast={() => null}>
            <meshStandardMaterial
              color={spec.color}
              roughness={spec.roughness}
              metalness={spec.metalness}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default SiteEnvironment;
