/**
 * plantKit.ts — the one piece of app<->vendor-kit glue that survives the
 * plant floor rebuild: mapping the app's own `MachineStatus` vocabulary onto
 * the vendored plant-machines kit's `KitStatus` vocabulary.
 *
 * Everything else that used to live here (`createSharedKit`,
 * `applyThemeStatusColors`) is gone: that code built a kit and then
 * overwrote its built-in STATUS palette (run/warn/stop/idle) with the app's
 * Live Floor theme colours, BEFORE any machine was created — which diverged
 * from `Model_3D/nittan-plant-3d.html`'s reference look, the whole point of
 * this rebuild. The new scene (`components/views/liveFloor/plant/PlantMachines.tsx`)
 * calls the vendored `createPlantMachines` directly instead, so the kit's own
 * palette (`run 0x22c55e, warn 0xf59e0b, stop 0xef4444, idle 0x64748b`) is
 * used untouched — see that file's header comment for the full writeup. This
 * module now only keeps the pure status-vocabulary mapping, which is still
 * needed (and safe: it never touches colours).
 */
import type { KitStatus } from "./vendor/plantMachinesKit.d.ts";
import type { MachineStatus } from "../types";

/** App status -> kit status vocabulary. */
const STATUS_MAP: Record<MachineStatus, KitStatus> = {
  normal: "run",
  warning: "warn",
  error: "stop",
  maintenance: "idle",
};

/** Map an app MachineStatus to the kit's own KitStatus vocabulary. */
export function toKitStatus(status: MachineStatus): KitStatus {
  return STATUS_MAP[status];
}
