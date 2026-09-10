/**
 * Hand-written type declarations for plantBuildingsKit.js (vendored from
 * Model_3D/dist/plant-buildings.js). Kept in sync manually — if the vendored
 * .js changes, update this file too.
 */
import type * as THREE from "three";

/** Options accepted by createPlantBuildings(THREE, options). */
export interface PlantBuildingsKitOptions {
  /** Enable castShadow/receiveShadow on generated meshes. Default true. */
  shadows?: boolean;
}

/** One door opening on a building wall run, in kit.shell()'s `doors` list. */
export interface ShellDoor {
  side: "N" | "S" | "E" | "W";
  /** Position along the wall run, metres from its centre. */
  at: number;
  /** Opening width, metres. */
  w: number;
}

/** Options accepted by kit.shell(o). */
export interface ShellOptions {
  /** Footprint width (X). Default 60. */
  w?: number;
  /** Footprint depth (Z). Default 40. */
  d?: number;
  /** Total building height (all floors). Default 9.5. */
  h?: number;
  /** Number of storeys; each gets its own floor group. Default 1. */
  floors?: number;
  /** Per-floor height; defaults to h / floors when omitted. */
  floorH?: number;
  /** Column-grid / roof-truss bay spacing, metres. Default 8. */
  bay?: number;
  /** Add a glazing band above a solid dado on every wall run. Default true. */
  clerestory?: boolean;
  /** Build a roof (flat truss+deck, or pitched gable). Default true. */
  roof?: boolean;
  roofStyle?: "flat" | "pitched";
  /** Build the interior column grid (merged into one mesh). Default true. */
  columns?: boolean;
  /** Build a stair core linking every floor below the top one. Default true. */
  stairs?: boolean;
  /** Door openings cut into the ground-floor walls. */
  doors?: ShellDoor[];
  /** Building name, stored on group.userData.name. */
  name?: string;
}

/** userData shape stamped on kit.shell()'s returned group. */
export interface ShellUserData {
  kind: "building";
  name: string;
  w: number;
  d: number;
  h: number;
  floors: number;
  floorH: number;
  /** One group per storey, index 0 = ground floor. */
  floorGroups: THREE.Group[];
  /** Present only when `roof: true` (the default). */
  roof?: THREE.Group;
}

/** Options accepted by kit.room(o) — an interior partitioned room. */
export interface RoomOptions {
  /** Room width (X). Default 8. */
  w?: number;
  /** Room depth (Z). Default 6. */
  d?: number;
  /** Wall height. Default 3.2. */
  h?: number;
  /** Glaze the upper half of every partition wall. Default true. */
  glass?: boolean;
  /** Room name, stored on group.userData.name. */
  name?: string;
}

/** userData shape stamped on kit.room()'s returned group. */
export interface RoomUserData {
  kind: "room";
  name: string;
  w: number;
  d: number;
}

/** Options accepted by kit.rack(o) — pallet racking. */
export interface RackOptions {
  /** Number of bays along the row. Default 6. */
  bays?: number;
  /** Number of shelf levels. Default 4. */
  levels?: number;
  /** Bay width, metres. Default 2.7. */
  bayW?: number;
  /** Rack depth, metres. Default 1.1. */
  depth?: number;
  /** Level height, metres. Default 1.6. */
  levelH?: number;
  /** Fraction of bay/level slots that get a pallet, 0..1. Default .75. */
  fill?: number;
}

/** userData shape stamped on kit.rack()'s returned group. */
export interface RackUserData {
  kind: "rack";
  w: number;
  d: number;
  h: number;
}

/** Options accepted by kit.shed(o) — a small utility annex. */
export interface ShedOptions {
  w?: number;
  d?: number;
  h?: number;
  /** Add louvre slats to the front face. Default true. */
  louvre?: boolean;
  name?: string;
}

/** userData shape stamped on kit.shed()'s returned group. */
export interface ShedUserData {
  kind: "shed";
  name: string;
  w: number;
  d: number;
  h: number;
}

/** Options accepted by kit.tankFarm(o) — gas/water tank farm. */
export interface TankFarmOptions {
  /** Number of vessels. Default 3. */
  n?: number;
  /** Vessel radius, metres. Default .8. */
  r?: number;
  /** Vessel height (vertical) or length factor (horizontal). Default 4.5. */
  h?: number;
  /** Centre-to-centre spacing between vessels. Default 2.4. */
  gap?: number;
  /** Vertical vessels on saddles vs horizontal. Default true. */
  vertical?: boolean;
}

/** Options accepted by kit.road(o). */
export interface RoadOptions {
  /** Road length, runs along +X. Default 40. */
  len?: number;
  /** Road width. Default 7. */
  w?: number;
  /** Draw a dashed centre line. Default true. */
  dash?: boolean;
  /** Draw kerbs on both edges. Default true. */
  kerb?: boolean;
}

/** Options accepted by kit.parking(o) — a row of parking bays along +X. */
export interface ParkingOptions {
  /** Number of stalls. Default 10. */
  n?: number;
  /** Stall width, metres. Default 2.5. */
  stall?: number;
  /** Stall depth, metres. Default 5. */
  depth?: number;
  /** Flip stalls to face -Z. Default false. */
  flip?: boolean;
  /** Draw motorcycle-bay markings instead of car stalls. Default false. */
  moto?: boolean;
}

/** Geometry-building primitives exposed via kit.parts, for custom site pieces. */
export interface PlantBuildingsParts {
  /** Box with its BASE on y = 0, centred in x/z. */
  box(w: number, h: number, d: number, mat: THREE.Material): THREE.Mesh;
  /** Cylinder, centred on its own origin. */
  cyl(rt: number, rb: number, h: number, mat: THREE.Material, seg?: number): THREE.Mesh;
  /** Ground plane, rotated flat (-X90); pass through `put` to position it. */
  plane(w: number, d: number, mat: THREE.Material): THREE.Mesh;
  /** Merge an array of BufferGeometry into one mesh (falls back to one mesh per geometry if merging is unavailable). */
  merged(geoms: THREE.BufferGeometry[], mat: THREE.Material): THREE.Mesh | THREE.Group;
  /** Set an object's absolute position and return it (chainable). */
  put<T extends THREE.Object3D>(o: T, x: number, y: number, z: number): T;
}

/** Named materials shared across everything built by one kit instance. */
export interface PlantBuildingsMaterials {
  wall: THREE.MeshStandardMaterial;
  wallIn: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  parapet: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  door: THREE.MeshStandardMaterial;
  slab: THREE.MeshStandardMaterial;
  slabIn: THREE.MeshStandardMaterial;
  road: THREE.MeshStandardMaterial;
  kerb: THREE.MeshStandardMaterial;
  paint: THREE.MeshStandardMaterial;
  paintW: THREE.MeshStandardMaterial;
  grass: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  leaf: THREE.MeshStandardMaterial;
  rack: THREE.MeshStandardMaterial;
  pallet: THREE.MeshStandardMaterial;
  tank: THREE.MeshStandardMaterial;
  lamp: THREE.MeshStandardMaterial;
  signGrn: THREE.MeshStandardMaterial;
}

/** The kit returned by createPlantBuildings(THREE, options). */
export interface PlantBuildingsKit {
  materials: PlantBuildingsMaterials;
  /** Building shell: walls (with clerestory glazing + door openings), column grid, roof/trusses, per-floor stairs. */
  shell(o?: ShellOptions): THREE.Group;
  /** Interior partitioned room: dado + glazing, floor tint, ceiling band. */
  room(o?: RoomOptions): THREE.Group;
  /** Pallet racking: uprights, beams, pallets — merged into up to 3 draw calls. */
  rack(o?: RackOptions): THREE.Group;
  /** Utility shed / annex block with door and optional louvre. */
  shed(o?: ShedOptions): THREE.Group;
  /** Gas / water tank farm on saddles, in a bund. */
  tankFarm(o?: TankFarmOptions): THREE.Group;
  /** Road slab with optional centre line + kerbs, runs along +X. */
  road(o?: RoadOptions): THREE.Group;
  /** Parking bays in a row along +X. */
  parking(o?: ParkingOptions): THREE.Group;
  /** Yellow floor lane marking (walkway), runs along +X. */
  lane(len: number, w?: number): THREE.Group;
  /** Area fill: apron concrete ("slab" kind, default), grass, or road surface. */
  apron(w: number, d: number, kind?: "slab" | "grass" | "road"): THREE.Mesh;
  /** Yard light pole. */
  pole(h?: number): THREE.Group;
  /** Simple tree: trunk + two leaf spheres. */
  tree(h?: number): THREE.Group;
  /** Perimeter fence along +X: posts + mesh + top rail. */
  fenceLine(len: number, h?: number): THREE.Group;
  /** Floor-standing canvas-texture zone label, always readable from above. */
  zoneLabel(text: string, w?: number): THREE.Mesh;
  /** Straight stair flight + landing that rises exactly one floor. */
  stair(h: number, w?: number): THREE.Group;
  /** Covered walkway linking two zones/buildings, runs along +X. */
  walkway(len: number, w?: number): THREE.Group;
  /** Flower bed: kerb ring, soil, and blossom clusters in 3 colours. */
  flowerBed(w?: number, d?: number): THREE.Group;
  /** Free every geometry/texture/material this kit instance created. Never call while any built object is still in use. */
  dispose(): void;
  parts: PlantBuildingsParts;
}

export function createPlantBuildings(
  THREE_NS: typeof THREE,
  options?: PlantBuildingsKitOptions
): PlantBuildingsKit;
