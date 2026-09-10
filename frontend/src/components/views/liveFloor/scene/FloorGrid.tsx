import { useMemo } from "react";
import { Grid } from "@react-three/drei";
import type { PlantLayout } from "../../../../lib/plantLayout";
import { GRID } from "./palette";

/**
 * ===========================================================================
 * FLOOR GRID — blueprint reference grid on the factory floor
 * ===========================================================================
 *
 * The single most recognisable "digital twin" cue (NVIDIA Omniverse / Siemens
 * Plant Simulation) was still missing: a faint metric grid on the floor that
 * lets a viewer read scale/distance at a glance. `LIVE_FLOOR_THEME.gridLine`
 * / `gridSection` existed for exactly this purpose and were unused until now
 * — see `GRID` in `palette.ts`.
 *
 * FOOTPRINT: sized to `layout.hall.w` x `layout.hall.d` — the factory
 * building's own slab (see `PlantShell.tsx`, `b.slab.push(slabGeometry(0, 0,
 * hall.w, hall.d, ...))`), NOT `siteWidth`/`siteDepth` (the `FloorScene`
 * props). Those also cover the outdoor roads/parking/grass around the hall
 * (the real DB-driven site can run roughly 655 x 1224 m per `FloorScene.tsx`
 * comments), where a metric grid would read as noise over asphalt/grass/site
 * props instead of as a factory-floor reference. `hall` is content-driven
 * (`plantLayout.ts` derives it from what's actually placed) so this sizes
 * itself off the real layout every render, never a hardcoded constant.
 *
 * CELL SIZE: aligned to the real structural bay pitch (`layout.site.hall.bay`
 * = 8.5 m, `plantSite.ts` `REF_HALL.bay` — a fixed, never-scaled survey
 * constant, see its "bay" comments) rather than an arbitrary round metric
 * number. `PlantShell.tsx` already spaces its roof beams along X at exactly
 * this pitch (`colsX` loop) — a hall built from real 8.5 m bays reads far
 * more like an actual engineering-twin reference grid at that spacing than
 * at an arbitrary 5 m, and the beam lines above now visually land on grid
 * lines below. Section lines every 4 bays (34 m) stay legible/uncluttered at
 * the wide "plant"/"top" camera presets the same way the old 25 m tier did.
 * (Only the X axis has a physical beam counterpart — `PlantShell.tsx`
 * deliberately has no interior columns, see its "ไม่มีเสาในอาคาร" comment —
 * so the Z-axis lines are still a plain metric reference, not a structural
 * one; that's an acceptable half-win over a fully arbitrary grid.)
 *
 * Y LAYERING: `PlantShell.tsx` stacks the floor bottom-up to avoid
 * z-fighting between overlapping slabs — slab top lands at y=0.26, zone
 * platforms on top of that at y=0.29, and zone-edge stripes on top of that at
 * y=0.33..0.35 (see its "buildShell" comment). This grid is one large flat
 * overlay above the *entire* floor stack, so it sits at y=0.295 — just above
 * the zone platforms (reads as a reference on top of the raw floor/zone
 * colour) but strictly *below* both the contact-shadow quads
 * (`MachineInstances.tsx`, y=0.31) and the zone-edge stripes. Painted safety
 * markings and a machine's own ground shadow must always occlude the grid,
 * never the other way around — a grid line drawn over a shadow blob or a
 * safety stripe would read as broken compositing. (Previously this sat at
 * y=0.34, *above* the stripes at the old y=0.30..0.32 — exactly that bug.)
 */
const GRID_Y = 0.295;
const DEFAULT_CELL_SIZE = 8.5;
const SECTION_BAYS = 4;

export interface FloorGridProps {
  layout: PlantLayout;
  /** false = cheap path: one coarse tier only, no dense minor lines */
  highQuality?: boolean;
}

export function FloorGrid({ layout, highQuality = true }: FloorGridProps) {
  const hall = layout.hall;
  // `layout.site.hall.bay` is the real, never-scaled 8.5 m structural bay
  // pitch (see the header comment); fall back to the reference constant if
  // a layout somehow lacks it rather than rendering a gridless floor.
  const cellSize = layout.site?.hall?.bay > 0 ? layout.site.hall.bay : DEFAULT_CELL_SIZE;
  const sectionSize = cellSize * SECTION_BAYS;
  const args = useMemo<[number, number]>(() => [hall.w, hall.d], [hall.w, hall.d]);
  // Fade to nothing well before the hall's own far edge so it never reads as
  // a hard-clipped rectangle floating on the floor, and falls off toward the
  // near-white fog instead of fighting it (see `FloorScene.tsx`'s fog setup).
  const fadeDistance = useMemo(() => Math.hypot(hall.w, hall.d) * 0.75, [hall.w, hall.d]);

  if (!highQuality) {
    // Cheap path: skip the finer per-bay minor grid (most fragments touched
    // per frame) and draw only the coarse section tier, thin and faint —
    // still reads as "this is a digital twin floor" without the extra
    // shader cost of a second line frequency on low-end hardware.
    return (
      <Grid
        position={[0, GRID_Y, 0]}
        args={args}
        cellSize={sectionSize}
        cellThickness={0.5}
        cellColor={GRID.section}
        sectionSize={sectionSize}
        sectionThickness={0.5}
        sectionColor={GRID.section}
        fadeDistance={fadeDistance}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
    );
  }

  return (
    <Grid
      position={[0, GRID_Y, 0]}
      args={args}
      cellSize={cellSize}
      cellThickness={0.4}
      cellColor={GRID.line}
      sectionSize={sectionSize}
      sectionThickness={0.8}
      sectionColor={GRID.section}
      fadeDistance={fadeDistance}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
    />
  );
}

export default FloorGrid;
