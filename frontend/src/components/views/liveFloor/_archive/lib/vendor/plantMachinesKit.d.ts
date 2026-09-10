/**
 * Hand-written type declarations for plantMachinesKit.js (vendored from
 * Model_3D/dist/plant-machines.js). Kept in sync manually — if the vendored
 * .js changes, update this file too.
 */
import type * as THREE from "three";

/** The 10 procedural machine archetypes the kit knows how to build. */
export type PlantArchetype =
  | "furnace"
  | "mixer"
  | "coater"
  | "oven"
  | "press"
  | "robot"
  | "cell"
  | "filler"
  | "charger"
  | "packer";

/** Kit-native status vocabulary (distinct from the app's MachineStatus). */
export type KitStatus = "run" | "warn" | "stop" | "idle";

/** Options accepted by createPlantMachines(THREE, options). */
export interface PlantMachinesKitOptions {
  /** Enable castShadow/receiveShadow on generated meshes. Default true. */
  shadows?: boolean;
  /** Reserved for future use by the kit; currently unused by the implementation. Default true. */
  textures?: boolean;
  /**
   * Attach a THREE.PointLight to each status beacon / glow source.
   * REQUIRED false past ~10 machines to avoid blowing the WebGL uniform budget.
   * Default true.
   */
  beaconLights?: boolean;
}

/** Options accepted by kit.create(type, opts). */
export interface PlantMachineOptions {
  /** Machine id, stored on group.userData.id (and every mesh's userData.machineId). Defaults to `type`. */
  id?: string;
  /** Label rendered on the canvas plaque; omit (or sign:false) to skip signage. */
  label?: string;
  /** Sub-label rendered under the label on the plaque. */
  sub?: string;
  /** Initial kit status; also colours the control cabinet beacon at build time. Default 'run'. */
  status?: KitStatus;
  /** Build the control cabinet + status beacon. Default true. */
  cabinet?: boolean;
  /** Build the signage gantry (only if `label` is also set). Default true. */
  sign?: boolean;
  /** Rotation around Y, in radians. */
  rot?: number;
  /** World position; missing components default to 0. */
  position?: { x?: number; y?: number; z?: number };
  /** Extra fields merged into the resulting group's userData. */
  userData?: Record<string, unknown>;
}

/** One machine entry in a place() layout. */
export interface PlantLayoutMachine {
  id?: string;
  type: PlantArchetype;
  x?: number;
  y?: number;
  z?: number;
  /** Radians, or degrees when the layout's `degrees` flag is true. */
  rot?: number;
  status?: KitStatus;
  label?: string;
  sub?: string;
  cabinet?: boolean;
  sign?: boolean;
  userData?: Record<string, unknown>;
}

/** One conveyor entry in a place() layout. */
export interface PlantLayoutConveyor {
  x?: number;
  y?: number;
  z?: number;
  /** Radians, or degrees when the layout's `degrees` flag is true. */
  rot?: number;
  len: number;
  width?: number;
  /** Number of work pieces to place on the belt; 0 means none. Default 3 when omitted. */
  parts?: number;
}

/** The layout document accepted by kit.place(parent, layout). */
export interface PlantLayoutInput {
  unit?: string;
  /** When true, every `rot` in the layout is degrees; otherwise radians. */
  degrees?: boolean;
  machines?: PlantLayoutMachine[];
  conveyors?: PlantLayoutConveyor[];
}

/** Result of kit.place(). */
export interface PlantPlaceResult {
  machines: Record<string, THREE.Group>;
  conveyors: THREE.Group[];
}

/** userData shape the kit stamps on conveyor groups (kit.conveyor()). */
export interface ConveyorUserData {
  kind: "conveyor";
  len: number;
  width: number;
  beltTop: number;
  speed: number;
}

/** Geometry-building primitives exposed via kit.parts, for building custom machine types. */
export interface PlantMachinesParts {
  /** Rounded box; BASE sits on y = 0. */
  box(w: number, h: number, d: number, mat: THREE.Material, r?: number): THREE.Mesh;
  /** Cylinder; CENTRED on its own origin. */
  cyl(rt: number, rb: number, h: number, mat: THREE.Material, seg?: number): THREE.Mesh;
  /** Tube swept along a Catmull-Rom curve through the given points. */
  tube(pts: Array<[number, number, number]>, r: number, mat: THREE.Material): THREE.Mesh;
  torus(R: number, r: number, mat: THREE.Material): THREE.Mesh;
  sph(r: number, mat: THREE.Material): THREE.Mesh;
  /** Vertical tank with rounded (lathe-profile) heads. */
  tank(R: number, H: number, mat: THREE.Material): THREE.Mesh;
  /** Electric motor: body, cooling fins, shaft. */
  motor(R: number, L: number, mat?: THREE.Material): THREE.Group;
  /** 4-leg machine frame with base skirt. */
  frame(w: number, d: number, h: number, mat?: THREE.Material): THREE.Group;
  /** Safety fence: posts, rails, wire mesh. */
  fence(len: number, mat?: THREE.Material): THREE.Group;
  /** Control cabinet: HMI screen, pilot lamps, status beacon (+ point light). */
  cabinet(status?: KitStatus): THREE.Group;
  /** Signage gantry with a canvas-rendered plaque. */
  sign(label: string, sub?: string): THREE.Group;
}

/** Named materials shared across all machines built by one kit instance. */
export interface PlantMachinesMaterials {
  body: THREE.MeshStandardMaterial;
  body2: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  warn: THREE.MeshStandardMaterial;
  belt: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  copper: THREE.MeshStandardMaterial;
  lead: THREE.MeshStandardMaterial;
  acid: THREE.MeshStandardMaterial;
  battery: THREE.MeshStandardMaterial;
  hot: THREE.MeshStandardMaterial;
  screen: THREE.MeshStandardMaterial;
}

/**
 * Status -> hex colour map, keyed by KitStatus. Read LIVE by both kit.create()
 * (via the control cabinet beacon) and kit.setStatus() — mutate this object's
 * values in place to re-theme the kit before or after any create() call.
 */
export type PlantStatusColors = Record<KitStatus, number>;

/** The kit returned by createPlantMachines(THREE, options). */
export interface PlantMachinesKit {
  /** The 10 known archetypes: ['furnace','mixer','coater','oven','press','robot','cell','filler','charger','packer'] */
  types: PlantArchetype[];
  materials: PlantMachinesMaterials;
  /** Status -> hex colour map; read live, see PlantStatusColors. */
  statusColors: PlantStatusColors;
  /** Shared conveyor/belt/part surface speed in m/s (1.2). */
  beltSpeed: number;
  /** Build one machine. Footprint centred on origin, base on y = 0. */
  create(type: PlantArchetype, opts?: PlantMachineOptions): THREE.Group;
  /** Build a roller conveyor running along +X, centred on the group origin. */
  conveyor(len: number, width?: number): THREE.Group;
  /** Add sliding work pieces to a conveyor built by kit.conveyor(). */
  workpieces(conv: THREE.Group, count?: number): THREE.Group;
  /** Instantiate a whole layout under `parent`. */
  place(parent: THREE.Object3D, layout: PlantLayoutInput): PlantPlaceResult;
  /** Recolour a machine's beacon + update its stored status. */
  setStatus(machine: THREE.Group, status: KitStatus): void;
  /** Drive every animation (belts, rollers, swings, pulses). Call once per frame with delta seconds. */
  tick(dtSeconds: number): void;
  /** Free every geometry/texture/material this kit instance created. Frees resources SHARED across all machines built by this kit — never call this while any built machine is still in use. */
  dispose(): void;
  /**
   * Permanently discard one group previously built by create()/conveyor(), or a
   * signage/cabinet subtree built via kit.parts. Removes every spin/swing/pulse/
   * belt/traveller entry tagged as owned by `group` (so tick() stops touching it)
   * and disposes every non-shared geometry/material/texture found in its subtree
   * (geometry cached by size and the shared material banks are left untouched,
   * since other still-live groups may reference the same instances). Call this
   * whenever a group is evicted for good — never for a group merely parked in a
   * reuse free list, since a parked group is expected to be re-keyed and reused.
   */
  release(group: THREE.Object3D): void;
  parts: PlantMachinesParts;
}

export function createPlantMachines(
  THREE_NS: typeof THREE,
  options?: PlantMachinesKitOptions
): PlantMachinesKit;
