import { useFrame } from "@react-three/fiber";
import type { PlantMachinesKit } from "../../../lib/vendor/plantMachinesKit.d.ts";

/**
 * Drives every kit animation (belts, rollers, swings, robot joints, beacon
 * pulses, furnace glow) for ALL machines/conveyors built by `kit`. Call this
 * hook exactly ONCE at the scene root — `kit.tick(dt)` is shared, kit-wide
 * state, not per-machine. Omitting this hook means nothing in the kit
 * animates (groups stay static, but still render).
 *
 * (This file used to also export a single-machine `<KitMachine>` R3F bridge
 * component. It was dead code — KitMachinePool builds and rekeys every group
 * directly via kit.create()/kit.release(), so nothing ever imported the
 * default export except this hook. Removed; re-add it if a single-machine,
 * non-pooled entry point is ever actually needed.)
 */
export function useKitTick(kit: PlantMachinesKit): void {
  useFrame((_state, delta) => {
    kit.tick(delta);
  });
}
