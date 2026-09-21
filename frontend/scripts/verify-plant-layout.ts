import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPlantLayout } from "../src/lib/plantLayout";
import type { Machine } from "../src/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../backend/backups/2026-08-17T06-02-46Z/machines.json"), "utf8")
);

function toMachine(r: any): Machine {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    model: r.model,
    location: r.location,
    status: r.status,
    lastMaintenance: r.last_maintenance,
    nextMaintenance: r.next_maintenance,
    healthScore: r.health_score,
    spindleTemp: r.spindle_temp,
    vibrationMms: r.vibration_mms,
    operatingHours: r.operating_hours,
    qrPrefix: r.qr_prefix,
    dupQrCount: r.dup_qr_count,
    sourceNo: r.source_no,
    factoryGroup: r.factory_group,
    departmentCode: r.department_code,
    deptPrefix: r.dept_prefix,
    section: r.section,
    responsibleGroup: r.responsible_group,
    costCenter: r.cost_center,
    category: r.category,
    productionName: r.production_name,
    relatedQrCode: r.related_qr_code,
    lifecycleStatus: r.lifecycle_status,
  } as Machine;
}

const machines: Machine[] = raw.map(toMachine);
console.log("input rows:", machines.length);

const layout = buildPlantLayout(machines);

console.log("\n--- scale ---");
console.log(JSON.stringify(layout.scale, null, 2));
console.log("hall:", layout.hall);
console.log("site.hall.bay (must stay 8.5):", layout.site.hall.bay);

console.log("\n--- counts ---");
console.log("placed machines:", layout.machines.length);
console.log("skipped:", layout.skipped.length);
console.log("placed+skipped === input:", layout.machines.length + layout.skipped.length === machines.length);
console.log("conveyors:", layout.conveyors.length);
console.log("lines:", layout.lines.length);

console.log("\n--- zone sizes ---");
for (const z of layout.site.zones) {
  console.log(z.id, "w:", z.w.toFixed(1), "d:", z.d.toFixed(1), "area:", (z.w * z.d).toFixed(0));
}
const totalZoneArea = layout.site.zones.reduce((s, z) => s + z.w * z.d, 0);
const hallArea = layout.hall.w * layout.hall.d;
console.log("total zone area:", totalZoneArea.toFixed(0), "hall area:", hallArea.toFixed(0), "zone/hall ratio:", (totalZoneArea / hallArea).toFixed(3));

function aabb(m: { x: number; z: number; width: number; depth: number }) {
  return { x0: m.x - m.width / 2, x1: m.x + m.width / 2, z0: m.z - m.depth / 2, z1: m.z + m.depth / 2 };
}
function overlaps(a: ReturnType<typeof aabb>, b: ReturnType<typeof aabb>, eps = 1e-6) {
  return a.x0 < b.x1 - eps && a.x1 > b.x0 + eps && a.z0 < b.z1 - eps && a.z1 > b.z0 + eps;
}

let machineOverlaps = 0;
const byZone = new Map<string, typeof layout.machines>();
for (const m of layout.machines) {
  (byZone.get(m.zoneId) ?? byZone.set(m.zoneId, []).get(m.zoneId)!).push(m);
}
for (const [, list] of byZone) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (overlaps(aabb(list[i]!), aabb(list[j]!))) {
        machineOverlaps++;
        if (machineOverlaps <= 5) console.log("OVERLAP:", list[i]!.id, "<->", list[j]!.id);
      }
    }
  }
}
console.log("\nmachine-machine overlaps:", machineOverlaps);

let machineInRoom = 0;
for (const m of layout.machines) {
  const mb = aabb(m);
  for (const r of layout.site.rooms) {
    const rb = { x0: r.x - r.w / 2, x1: r.x + r.w / 2, z0: r.z - r.d / 2, z1: r.z + r.d / 2 };
    if (overlaps(mb, rb)) machineInRoom++;
  }
}
console.log("machines overlapping a room:", machineInRoom);

let machineOnRoad = 0;
for (const m of layout.machines) {
  const mb = aabb(m);
  for (const r of layout.site.roads) {
    const half = r.len / 2;
    const rb =
      r.dir === "x"
        ? { x0: r.x - half, x1: r.x + half, z0: r.z - r.w / 2, z1: r.z + r.w / 2 }
        : { x0: r.x - r.w / 2, x1: r.x + r.w / 2, z0: r.z - half, z1: r.z + half };
    if (overlaps(mb, rb)) machineOnRoad++;
  }
}
console.log("machines overlapping a road:", machineOnRoad);

let conveyorBad = 0;
for (const c of layout.conveyors) {
  const horiz = c.rot % 180 === 0;
  const halfLen = c.len / 2;
  const e1 = horiz ? { x: c.x - halfLen, z: c.z } : { x: c.x, z: c.z - halfLen };
  const e2 = horiz ? { x: c.x + halfLen, z: c.z } : { x: c.x, z: c.z + halfLen };
  const touches = (pt: { x: number; z: number }) =>
    layout.machines.some((m) => {
      const b = aabb(m);
      const pad = 0.15;
      return pt.x >= b.x0 - pad && pt.x <= b.x1 + pad && pt.z >= b.z0 - pad && pt.z <= b.z1 + pad;
    });
  if (!touches(e1) || !touches(e2)) conveyorBad++;
}
console.log("conveyors with a dangling endpoint:", conveyorBad, "of", layout.conveyors.length);

const whZone = layout.site.zones.find((z) => z.id === "WH")!;
const ht1Zone = layout.site.zones.find((z) => z.id === "HT-1")!;
const linesZone = layout.site.zones.find((z) => z.id === "LINES")!;
function fitsIn(list: typeof layout.machines, zone: typeof whZone) {
  if (list.length === 0) return true;
  const xs = list.flatMap((m) => [m.x - m.width / 2, m.x + m.width / 2]);
  const zs = list.flatMap((m) => [m.z - m.depth / 2, m.z + m.depth / 2]);
  const zb = { x0: zone.x - zone.w / 2, x1: zone.x + zone.w / 2, z0: zone.z - zone.d / 2, z1: zone.z + zone.d / 2 };
  return Math.min(...xs) >= zb.x0 - 0.01 && Math.max(...xs) <= zb.x1 + 0.01 && Math.min(...zs) >= zb.z0 - 0.01 && Math.max(...zs) <= zb.z1 + 0.01;
}
console.log("\nWH content fits WH zone:", fitsIn(layout.machines.filter((m) => m.zoneId === "WH"), whZone));
console.log("HT-1 content fits HT-1 zone:", fitsIn(layout.machines.filter((m) => m.zoneId === "HT-1"), ht1Zone));
console.log("LINES content fits LINES zone:", fitsIn(layout.machines.filter((m) => m.zoneId === "LINES"), linesZone));
