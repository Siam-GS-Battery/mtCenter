import type { FloorAisle, FloorLayout, FloorRoad } from "./floorLayout";

/**
 * ===========================================================================
 * FLOOR NAV GRAPH — โครงข่ายทางเดินของโรงงาน (สำหรับเดินตามถนน ไม่ตัดตรง)
 * ===========================================================================
 *
 * ผัง (`FloorLayout`) บอกไว้แล้วว่าที่ไหนเป็น "ที่ว่างที่เดินได้จริง":
 *   • `layout.aisles` — ทางเดินภายในโรง (แถบระหว่างไลน์ผลิต + ช่องว่าง
 *     ระหว่างคอลัมน์ที่ใช้เป็นทางหลักของ AGV)
 *   • `layout.roads`  — ถนนภายในไซต์ระหว่างอาคาร
 * ทั้งสองอย่างถูกวางไว้ให้ไม่ทับเครื่องจักรหรือ prop อยู่แล้ว (ดูคอมเมนต์ใน
 * floorLayout.ts) โมดูลนี้จึงแปลง "แถบ" เหล่านั้นเป็น "เส้นกลางทาง" แล้ว
 * ประกอบเป็นกราฟที่หาเส้นทางสั้นสุดได้ ผลลัพธ์คือหุ่นยนต์ตรวจเดินเลี้ยว
 * เป็นมุมฉากไปตามทางเดิน เหมือนคนเดินในโรงงานจริง ไม่ใช่ลากเส้นตรงทะลุ
 * แท่นเครื่องไปหาเป้าหมาย
 *
 * ข้อจำกัดที่ยอมรับไว้อย่างตั้งใจ (POC):
 *   • กราฟนี้ไม่รู้จักตัวเครื่องจักรเป็นสิ่งกีดขวาง — ความปลอดภัยมาจากการที่
 *     เส้นกลางทางอยู่บนแถบทางเดินซึ่งโล่งอยู่แล้ว ไม่ได้มาจากการตรวจการชน
 *   • ช่วงต่อสุดท้ายจากทางเดินเข้าไปยืนหน้าเครื่อง (ประมาณ 1–3 เมตร) ยังเป็น
 *     เส้นตรง ซึ่งตรงกับความจริงว่าคนต้องก้าวออกจากทางเดินเข้าไปหาเครื่อง
 */

// ---------------------------------------------------------------------------
// ชนิดข้อมูล
// ---------------------------------------------------------------------------

export interface NavPoint {
  x: number;
  z: number;
}

interface NavEdge {
  to: number;
  /** ระยะทาง (เมตร) */
  w: number;
}

export interface NavGraph {
  nodes: NavPoint[];
  edges: NavEdge[][];
  /** ดัชนี node ที่ใกล้พิกัดนี้สุด (-1 เมื่อกราฟว่าง) */
  nearest(x: number, z: number): number;
  /** ดัชนี node เรียงตามเส้นทางสั้นสุดจาก a ไป b (รวมปลายทั้งสอง) — [] เมื่อไปไม่ถึง */
  path(a: number, b: number): number[];
}

/** เส้นกลางทางหนึ่งเส้น (แนวนอน = ขนานแกน X, แนวตั้ง = ขนานแกน Z) */
interface Centreline {
  horizontal: boolean;
  /** พิกัดคงที่ของเส้น: z ของเส้นแนวนอน / x ของเส้นแนวตั้ง */
  fixed: number;
  /** ช่วงที่เส้นทอดไป (ค่าน้อย → ค่ามาก) บนแกนที่เปลี่ยน */
  from: number;
  to: number;
}

// ---------------------------------------------------------------------------
// ค่าคงที่
// ---------------------------------------------------------------------------

/** ระยะห่างระหว่าง node ที่ปักไว้ตามความยาวทาง (เมตร) */
const NODE_SPACING = 4;
/** ความยาวต่ำสุดที่ยังนับเป็นทางเดินได้ (เมตร) — ตัดแถบสั้นจู๋ที่เป็นเศษผังทิ้ง */
const MIN_LENGTH = 2;
/** ความละเอียดในการรวม node ที่ทับกัน (เมตร) */
const MERGE_GRID = 0.5;

// ---------------------------------------------------------------------------
// ตัวช่วย
// ---------------------------------------------------------------------------

/** คีย์รวม node ที่อยู่ตำแหน่งเดียวกัน (ปัดเข้าตาราง 0.5 ม.) */
function nodeKey(x: number, z: number): string {
  return `${Math.round(x / MERGE_GRID)},${Math.round(z / MERGE_GRID)}`;
}

/** แปลงแถบทางเดิน/ถนนหนึ่งแถบเป็นเส้นกลางทาง */
function toCentreline(strip: FloorAisle | FloorRoad): Centreline | null {
  const length = strip.horizontal ? strip.width : strip.depth;
  if (length < MIN_LENGTH) return null;
  const half = length / 2;
  return strip.horizontal
    ? { horizontal: true, fixed: strip.z, from: strip.x - half, to: strip.x + half }
    : { horizontal: false, fixed: strip.x, from: strip.z - half, to: strip.z + half };
}

/** จุดตัดของเส้นแนวนอนกับเส้นแนวตั้ง (null เมื่อไม่ตัดกัน) */
function crossing(h: Centreline, v: Centreline): NavPoint | null {
  if (v.fixed < h.from || v.fixed > h.to) return null;
  if (h.fixed < v.from || h.fixed > v.to) return null;
  return { x: v.fixed, z: h.fixed };
}

// ---------------------------------------------------------------------------
// การประกอบกราฟ
// ---------------------------------------------------------------------------

/**
 * ประกอบโครงข่ายทางเดินจากผัง
 *
 * ขั้นตอน
 *   1. แปลงทางเดินในโรงและถนนในไซต์ทุกเส้นเป็นเส้นกลางทาง
 *   2. หาจุดตัดระหว่างเส้นแนวนอนกับแนวตั้งทุกคู่ (นี่คือ "สี่แยก" ที่ทำให้
 *      เลี้ยวจากทางเดินหนึ่งไปอีกทางหนึ่งได้)
 *   3. ปัก node ตามความยาวทางทุก ๆ 4 เมตร บวกปลายทางและจุดตัด แล้วเชื่อม
 *      node ที่อยู่ติดกันบนเส้นเดียวกันเป็น edge
 *   4. เชื่อมส่วนของกราฟที่ยังขาดจากกัน (เช่น ทางเดินในโรงกับถนนนอกโรง ซึ่ง
 *      ผังไม่ได้ให้ประตูไว้เป็นเรขาคณิต) ด้วยสะพานสั้นสุดระหว่างสองส่วน —
 *      ถ้าไม่ทำ การเดินข้ามโรงจะหาเส้นทางไม่ได้เลยและต้องถอยไปตัดตรง
 */
export function buildNavGraph(layout: FloorLayout): NavGraph {
  const lines: Centreline[] = [];
  for (const aisle of layout.aisles) {
    const line = toCentreline(aisle);
    if (line) lines.push(line);
  }
  for (const road of layout.roads) {
    const line = toCentreline(road);
    if (line) lines.push(line);
  }

  const nodes: NavPoint[] = [];
  const edges: NavEdge[][] = [];
  const index = new Map<string, number>();

  function addNode(x: number, z: number): number {
    const key = nodeKey(x, z);
    const existing = index.get(key);
    if (existing !== undefined) return existing;
    const id = nodes.length;
    nodes.push({ x, z });
    edges.push([]);
    index.set(key, id);
    return id;
  }

  function addEdge(a: number, b: number) {
    if (a === b) return;
    const w = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].z - nodes[b].z);
    // แถบทางเดินสองแถบที่ทับกันพอดีอาจให้ node คู่เดียวกันซ้ำ — กัน edge ซ้ำ
    if (edges[a].some((e) => e.to === b)) return;
    edges[a].push({ to: b, w });
    edges[b].push({ to: a, w });
  }

  // จุดตัดของทุกคู่แนวนอน/แนวตั้ง — เก็บแยกตามเส้นเพื่อนำไปปักบนเส้นนั้น
  const extraOnLine: number[][] = lines.map(() => []);
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].horizontal) continue;
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].horizontal) continue;
      const point = crossing(lines[i], lines[j]);
      if (!point) continue;
      extraOnLine[i].push(point.x);
      extraOnLine[j].push(point.z);
    }
  }

  // ปัก node ตามความยาวทาง + ปลายทาง + จุดตัด แล้วร้อยเป็นโซ่
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stations = new Set<number>([line.from, line.to, ...extraOnLine[i]]);
    for (let t = line.from + NODE_SPACING; t < line.to; t += NODE_SPACING) {
      stations.add(t);
    }
    const sorted = [...stations].sort((a, b) => a - b);
    let previous = -1;
    for (const t of sorted) {
      const id = line.horizontal ? addNode(t, line.fixed) : addNode(line.fixed, t);
      if (previous >= 0) addEdge(previous, id);
      previous = id;
    }
  }

  bridgeComponents(nodes, edges);

  return {
    nodes,
    edges,
    nearest(x, z) {
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].x - x;
        const dz = nodes[i].z - z;
        const d = dx * dx + dz * dz;
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    },
    path(a, b) {
      return dijkstra(nodes, edges, a, b);
    },
  };
}

/**
 * เชื่อมส่วนของกราฟที่ขาดจากกันให้ต่อถึงกันทั้งหมด
 *
 * ทางเดินในโรงกับถนนนอกโรงไม่ได้แตะกันในเรขาคณิตของผัง (ผังไม่ได้วางประตู
 * เป็นแถบทางเดิน) ถ้าไม่ต่อสะพานให้ การเดินข้ามโรงจะหาเส้นทางไม่ได้เลย
 * ทุกครั้ง แล้วต้องถอยไปใช้เส้นตรงซึ่งเป็นอาการที่โมดูลนี้มีไว้เพื่อกำจัด
 *
 * วิธีต่อ: จับส่วน (component) ที่เล็กกว่าไปเชื่อมกับส่วนที่ใกล้ที่สุด ทำซ้ำ
 * จนเหลือส่วนเดียว โดยเทียบเฉพาะคู่ node ที่ใกล้กันที่สุดระหว่างสองส่วน
 */
function bridgeComponents(nodes: NavPoint[], edges: NavEdge[][]): void {
  if (nodes.length === 0) return;

  const componentOf = new Int32Array(nodes.length).fill(-1);
  const components: number[][] = [];
  const stack: number[] = [];

  for (let start = 0; start < nodes.length; start++) {
    if (componentOf[start] >= 0) continue;
    const id = components.length;
    const members: number[] = [];
    stack.length = 0;
    stack.push(start);
    componentOf[start] = id;
    while (stack.length > 0) {
      const current = stack.pop() as number;
      members.push(current);
      for (const edge of edges[current]) {
        if (componentOf[edge.to] >= 0) continue;
        componentOf[edge.to] = id;
        stack.push(edge.to);
      }
    }
    components.push(members);
  }

  if (components.length <= 1) return;

  // ต่อทีละส่วนเข้ากับ "ส่วนหลัก" ที่โตขึ้นเรื่อย ๆ เริ่มจากส่วนที่ใหญ่สุด
  components.sort((a, b) => b.length - a.length);
  const merged = [...components[0]];
  for (let c = 1; c < components.length; c++) {
    const other = components[c];
    let bestA = -1;
    let bestB = -1;
    let bestDist = Infinity;
    for (const a of merged) {
      for (const b of other) {
        const d = (nodes[a].x - nodes[b].x) ** 2 + (nodes[a].z - nodes[b].z) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestA = a;
          bestB = b;
        }
      }
    }
    if (bestA >= 0 && bestB >= 0) {
      const w = Math.hypot(nodes[bestA].x - nodes[bestB].x, nodes[bestA].z - nodes[bestB].z);
      edges[bestA].push({ to: bestB, w });
      edges[bestB].push({ to: bestA, w });
    }
    merged.push(...other);
  }
}

/**
 * เส้นทางสั้นสุดแบบ Dijkstra
 *
 * ไม่ใช้ priority queue: กราฟนี้มีขนาดหลักพัน node และเรียกแค่ครั้งละจุดตรวจ
 * (ประมาณ 24 ครั้งต่อรอบ ตอนวางแผน ไม่ใช่ต่อเฟรม) การสแกนหา node ที่ถูกสุด
 * แบบเชิงเส้นจึงเร็วพอและอ่านง่ายกว่ามาก
 */
function dijkstra(nodes: NavPoint[], edges: NavEdge[][], from: number, to: number): number[] {
  if (from < 0 || to < 0 || from >= nodes.length || to >= nodes.length) return [];
  if (from === to) return [from];

  const dist = new Float64Array(nodes.length).fill(Infinity);
  const previous = new Int32Array(nodes.length).fill(-1);
  const done = new Uint8Array(nodes.length);
  dist[from] = 0;

  for (;;) {
    let current = -1;
    let best = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      if (done[i]) continue;
      if (dist[i] < best) {
        best = dist[i];
        current = i;
      }
    }
    if (current < 0) break;
    if (current === to) break;
    done[current] = 1;
    for (const edge of edges[current]) {
      const next = dist[current] + edge.w;
      if (next >= dist[edge.to]) continue;
      dist[edge.to] = next;
      previous[edge.to] = current;
    }
  }

  if (!Number.isFinite(dist[to])) return [];

  const out: number[] = [];
  for (let at = to; at >= 0; at = previous[at]) {
    out.push(at);
    if (at === from) break;
  }
  return out.reverse();
}

/**
 * ตัด node ที่อยู่กลางทางตรงออก
 *
 * กราฟปัก node ทุก 4 เมตร ถ้าส่งทั้งชุดให้ตัวเดินก็ได้ผลเหมือนกัน แต่ชุด
 * waypoint ที่เหลือแค่ "หัวมุมที่ต้องเลี้ยว" ทำให้การเดินอ่านเป็นเส้นตรงยาว
 * ตามทางเดินแล้วเลี้ยวมุมฉาก ซึ่งคือสิ่งที่ต้องการให้ผู้ดูเห็น
 */
export function collapseCollinear(points: NavPoint[]): NavPoint[] {
  if (points.length <= 2) return [...points];
  const out: NavPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = out[out.length - 1];
    const b = points[i];
    const c = points[i + 1];
    // พื้นที่สามเหลี่ยม (cross product) ใกล้ศูนย์ = สามจุดอยู่บนเส้นเดียวกัน
    const cross = (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
    if (Math.abs(cross) > 0.01) out.push(b);
  }
  out.push(points[points.length - 1]);
  return out;
}

/**
 * เส้นทางเดินจากพิกัดหนึ่งไปอีกพิกัดหนึ่งตามโครงข่ายทางเดิน
 *
 * คืนชุด waypoint ที่ "ไม่รวมจุดตั้งต้น แต่รวมจุดหมาย" พร้อมส่งให้ตัวเดินใช้
 * ต่อได้ทันที และถอยไปคืนเส้นตรง (`[to]`) เมื่อกราฟว่างหรือหาเส้นทางไม่ได้
 * — เดินตรงยังดีกว่าหุ่นค้างอยู่เฉย ๆ กลางการนำเสนอ
 */
export function routeBetween(
  graph: NavGraph | null,
  from: NavPoint,
  to: NavPoint
): NavPoint[] {
  if (!graph || graph.nodes.length === 0) return [to];

  const a = graph.nearest(from.x, from.z);
  const b = graph.nearest(to.x, to.z);
  const ids = graph.path(a, b);
  if (ids.length === 0) return [to];

  const points = collapseCollinear(ids.map((id) => graph.nodes[id]));

  // จุดขึ้นทางเดินจุดแรกอาจอยู่ด้านหลังหุ่น (เพิ่งก้าวออกมาจากจุดนั้น) —
  // ตัดออกเมื่ออยู่ใกล้มากพอ จะได้ไม่เห็นอาการถอยหลังหนึ่งก้าวก่อนออกเดิน
  if (points.length > 1 && Math.hypot(points[0].x - from.x, points[0].z - from.z) < 1.2) {
    points.shift();
  }

  points.push(to);
  return points;
}
