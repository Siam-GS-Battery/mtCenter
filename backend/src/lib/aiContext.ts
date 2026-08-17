// Builds a Thai plain-text "knowledge block" from live data in the DB, meant to be
// embedded in the Gemini system prompt (see backend/src/routes/ai.ts) so the AI
// assistant answers from real machines/work-orders instead of guessing.
//
// Contract: buildKnowledgeContext MUST NEVER THROW. Every DB call in this file is
// wrapped by the outer try/catch in buildKnowledgeContext, and any failure just
// returns "" (the caller falls back to whatever it already sends without this
// block) — a broken knowledge block must never break the chat endpoint.

import { supabase } from "./supabase.js";
import { evaluateMachine, thresholdSummaryText } from "./thresholds.js";
import type { MachineRow, TelemetryReadingRow, WorkOrderRow } from "./mappers.js";

export interface AiContextInput {
  prompt: string;
  // `id` is optional and preferred over `code` when the caller has it: machine
  // codes are NOT unique in this DB (see byNormalizedCode below), so resolving by
  // id is the only way to guarantee the UI-selected machine is the one described.
  machineContext?: { id?: string | null; code?: string | null; name?: string | null; status?: string | null } | null;
}

const FLEET_CACHE_TTL_MS = 60_000;
const MAX_CONTEXT_CHARS = 7000;
// Row cap for the fleet-wide abnormal-machine list. When the prompt already
// resolved a specific machine (the question is about GR-1141, not the other 167
// abnormal machines), that list is background noise for this turn — shrink it
// aggressively so its budget goes to the question-relevant detail section
// instead. MAX_ABNORMAL_ROWS_TIGHT is a further fallback used only if the block
// is still over budget after that first shrink (see buildKnowledgeContext).
const MAX_ABNORMAL_ROWS = 15;
const MAX_ABNORMAL_ROWS_FOCUSED = 5;
const MAX_ABNORMAL_ROWS_TIGHT = 2;
const MAX_RESOLVED_MACHINES = 3;
const MAX_WORK_ORDERS_PER_MACHINE = 5;
const MAX_FIELD_CHARS = 300;

// Codes in this DB look like "GR-1141", "ALL-000": 2-5 letters, optional dash/space,
// 3-4 digits.
const MACHINE_CODE_REGEX = /[A-Za-z]{2,5}[-\s]?\d{3,4}/g;

// The literal delimiter text ai.ts wraps this whole block with (see
// "=== ข้อมูลจริงจากระบบ (เริ่ม) ===" / "(จบ)" in backend/src/routes/ai.ts). A DB
// free-text field must never be able to reproduce this text, or an attacker could
// forge a fake close/reopen of the trusted-data block. Matches with or without the
// surrounding "===" and with either the เริ่ม or จบ variant (or neither).
const TRUSTED_BLOCK_DELIMITER_RE = /=*\s*ข้อมูลจริงจากระบบ\s*(\(\s*(?:เริ่ม|จบ)\s*\))?\s*=*/g;

// --- fleet-wide cache (steps 2+3 raw rows) — 60s TTL so repeated chat turns in the
// same minute don't each re-query the whole machines table. Per-machine detail
// queries (work_orders / telemetry_readings) below are intentionally NOT cached.
let fleetCache: { rows: MachineRow[]; expiresAt: number } | null = null;
// Shared in-flight promise so N concurrent chats on a cold cache issue exactly one
// `machines` query instead of one each (cache-stampede protection). Cleared in
// `finally` regardless of success/failure so a failed fetch never poisons future
// calls and a fresh request is made next time.
let fleetInFlight: Promise<MachineRow[]> | null = null;

// Only the columns this file actually renders (see backend/supabase/migrations/
// 0001_init.sql and 0009_alter_machines.sql) — avoids pulling the whole ~973-row
// table with every free-text column (e.g. info_notes, quality_flags) on every call.
const FLEET_SELECT_COLUMNS =
  "id,code,name,model,location,status,last_maintenance,next_maintenance,health_score,spindle_temp,vibration_mms,operating_hours,active_error_code,active_error_desc,category,department_code,section" as const;

async function getFleetRows(): Promise<MachineRow[]> {
  const now = Date.now();
  if (fleetCache && fleetCache.expiresAt > now) {
    return fleetCache.rows;
  }
  if (fleetInFlight) {
    return fleetInFlight;
  }
  fleetInFlight = (async () => {
    try {
      const { data, error } = await supabase.from("machines").select(FLEET_SELECT_COLUMNS);
      if (error) throw error;
      const rows = (data ?? []) as MachineRow[];
      fleetCache = { rows, expiresAt: Date.now() + FLEET_CACHE_TTL_MS };
      return rows;
    } finally {
      fleetInFlight = null;
    }
  })();
  return fleetInFlight;
}

// Neutralizes a single free-text DB value before it is interpolated into the
// system prompt. Free-text columns (name, location, title, symptoms, cause,
// repair_action, active_error_desc, ...) come from tables writable via endpoints
// that may have no auth (e.g. POST /api/work-orders), so they are treated as
// untrusted input here, not merely as display strings. Three things are
// neutralized:
//  1) Newlines/control characters — otherwise a value can inject what looks like
//     an entire extra rendered row (e.g. a fake "· เลขที่ใบงาน: ..." line).
//  2) The literal trusted-data delimiter text ai.ts wraps this block with —
//     otherwise a value can forge a close/reopen of the trusted block.
//  3) The "|" / "·" separators this file's renderer uses between columns/bullets
//     — otherwise a value can forge extra columns within a single line.
// Finally each field is hard-clamped to a sane length so no single free-text
// value can dominate the (small) character budget on its own.
function sanitizeField(raw: string): string {
  let s = raw.replace(/[\x00-\x1F\x7F]/g, " ");
  s = s.replace(TRUSTED_BLOCK_DELIMITER_RE, " ");
  s = s.replace(/\|/g, "/").replace(/·/g, "-");
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > MAX_FIELD_CHARS) {
    s = s.slice(0, MAX_FIELD_CHARS) + "…";
  }
  return s;
}

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "ไม่มีข้อมูล";
  if (typeof value === "string") {
    if (value.trim() === "") return "ไม่มีข้อมูล";
    return sanitizeField(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "ไม่มีข้อมูล";
    return sanitizeField(value.map((v) => String(v)).join(", "));
  }
  return sanitizeField(String(value));
}

function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, "");
}

function evaluateRow(row: MachineRow): { level: "normal" | "warning" | "critical"; reasons: string[] } {
  return evaluateMachine({
    status: row.status ?? undefined,
    healthScore: row.health_score ?? undefined,
    spindleTemp: row.spindle_temp ?? undefined,
    vibrationMms: row.vibration_mms ?? undefined,
    activeErrorCode: row.active_error_code ?? undefined,
  });
}

// Resolves at most MAX_RESOLVED_MACHINES machines that the user's prompt is about:
// 1) the machine currently selected in the UI (by id if supplied, else by code),
// 2) machine codes scanned out of the prompt text via regex, 3) a case-insensitive
// substring match of the prompt against every machine's code/name, ranked by
// specificity. Never fabricates a match — rows that don't exist in `rows` are
// simply skipped. Also returns human-readable notes disclosing anything that was
// resolved ambiguously or dropped, so the AI (and anyone reading the transcript)
// never mistakes a partial/ambiguous resolution for a complete one.
function resolveMachines(
  prompt: string,
  machineContext: AiContextInput["machineContext"],
  rows: MachineRow[]
): { machines: MachineRow[]; notes: string[] } {
  const resolved: MachineRow[] = [];
  const seenIds = new Set<string>();
  const notes: string[] = [];

  const addRow = (row: MachineRow | undefined): void => {
    if (!row || seenIds.has(row.id) || resolved.length >= MAX_RESOLVED_MACHINES) return;
    seenIds.add(row.id);
    resolved.push(row);
  };

  const addRows = (matchRows: MachineRow[] | undefined): void => {
    if (!matchRows) return;
    for (const row of matchRows) {
      if (resolved.length >= MAX_RESOLVED_MACHINES) break;
      addRow(row);
    }
  };

  // Codes are NOT unique in this DB — backend/supabase/migrations/0009_alter_machines.sql
  // explicitly drops the unique constraint on machines.code and adds dup_qr_count to
  // document that duplicates are expected. A normalized code can therefore map to
  // more than one row; never silently pick one (last-write-wins from an unordered
  // `select` would make the AI describe the wrong machine).
  const byNormalizedCode = new Map<string, MachineRow[]>();
  for (const row of rows) {
    if (!row.code) continue;
    const key = normalizeCode(row.code);
    const list = byNormalizedCode.get(key);
    if (list) list.push(row);
    else byNormalizedCode.set(key, [row]);
  }

  const noteAmbiguousCode = (rawCode: string, matches: MachineRow[] | undefined): void => {
    if (matches && matches.length > 1) {
      notes.push(
        `- รหัส "${sanitizeField(rawCode)}" พบเครื่องจักรมากกว่า 1 เครื่องในระบบ (รหัสซ้ำ, ${matches.length} เครื่อง) แสดงข้อมูลทั้งหมดที่พบด้านล่าง`
      );
    }
  };

  // 1) The machine currently selected in the UI. Resolve by row id when the
  // caller supplies one — the only unambiguous key — and only fall back to code
  // (which may be duplicated) when no id is available.
  if (machineContext?.id) {
    addRow(rows.find((row) => row.id === machineContext.id));
  } else if (machineContext?.code) {
    const key = normalizeCode(machineContext.code);
    const matches = byNormalizedCode.get(key);
    noteAmbiguousCode(machineContext.code, matches);
    addRows(matches);
  }

  // 2) Machine codes scanned out of the prompt text via regex.
  const promptMatches = prompt.match(MACHINE_CODE_REGEX) ?? [];
  for (const match of promptMatches) {
    if (resolved.length >= MAX_RESOLVED_MACHINES) break;
    const key = normalizeCode(match);
    const matches = byNormalizedCode.get(key);
    noteAmbiguousCode(match, matches);
    addRows(matches);
  }

  // 3) Case-insensitive substring match of the prompt against every machine's
  // code/name. Ranked by specificity (exact match, then longest matched string)
  // rather than DB row order, and honestly discloses how many matched in total
  // vs. how many are actually shown — mirroring the disclosure the abnormal
  // section already gives ("แสดง 15 จากทั้งหมด N").
  const promptLower = prompt.toLowerCase();
  const candidates: { row: MachineRow; score: number }[] = [];
  for (const row of rows) {
    const codeLower = row.code?.toLowerCase() ?? "";
    const nameLower = row.name?.toLowerCase() ?? "";
    const codeHit =
      codeLower.length >= 2 &&
      (promptLower.includes(codeLower) || (promptLower.length >= 3 && codeLower.includes(promptLower)));
    const nameHit =
      nameLower.length >= 3 &&
      (promptLower.includes(nameLower) || (promptLower.length >= 3 && nameLower.includes(promptLower)));
    if (!codeHit && !nameHit) continue;
    let score = 0;
    if (codeHit) score = Math.max(score, codeLower === promptLower ? codeLower.length + 1000 : codeLower.length);
    if (nameHit) score = Math.max(score, nameLower === promptLower ? nameLower.length + 1000 : nameLower.length);
    candidates.push({ row, score });
  }
  candidates.sort((a, b) => b.score - a.score);

  let addedFromSubstringMatch = 0;
  for (const { row } of candidates) {
    if (resolved.length >= MAX_RESOLVED_MACHINES) break;
    if (seenIds.has(row.id)) continue; // already resolved above; don't count twice
    addRow(row);
    addedFromSubstringMatch += 1;
  }
  if (candidates.length > addedFromSubstringMatch) {
    notes.push(
      `- คำถามนี้ตรงกับชื่อ/รหัสเครื่องจักรทั้งหมด ${candidates.length} เครื่อง ` +
        `แสดงเพียง ${addedFromSubstringMatch} เครื่องแรกที่ตรงประเด็นที่สุด`
    );
  }

  return { machines: resolved, notes };
}

function buildOverviewSection(rows: MachineRow[]): string {
  const byStatus: Record<string, number> = { normal: 0, warning: 0, error: 0, maintenance: 0 };
  let other = 0;
  for (const row of rows) {
    if (row.status && row.status in byStatus) {
      byStatus[row.status] += 1;
    } else {
      other += 1;
    }
  }

  const lines = [
    "[ภาพรวมเครื่องจักรทั้งโรงงาน]",
    `- จำนวนเครื่องจักรทั้งหมด: ${rows.length} เครื่อง`,
    `- ปกติ (normal): ${byStatus.normal}`,
    `- เตือน (warning): ${byStatus.warning}`,
    `- ผิดปกติ/เสีย (error): ${byStatus.error}`,
    `- อยู่ระหว่างซ่อมบำรุง (maintenance): ${byStatus.maintenance}`,
  ];
  if (other > 0) lines.push(`- อื่นๆ/ไม่ระบุสถานะ: ${other}`);
  return lines.join("\n");
}

// `maxRows` is a parameter (not the module constant directly) so the caller can
// shrink this fleet-wide, generally-irrelevant-to-the-question list when a
// specific machine was already resolved from the prompt, or shrink it further
// still if the block is over budget — see buildKnowledgeContext. The "แสดง N
// จากทั้งหมด M" disclosure always reflects whatever cap was actually used, so it
// stays honest regardless of which cap was passed in.
function buildAbnormalSection(rows: MachineRow[], maxRows: number): string {
  const abnormal = rows
    .map((row) => ({ row, evaluation: evaluateRow(row) }))
    .filter(({ row, evaluation }) => row.status === "warning" || row.status === "error" || evaluation.level !== "normal");

  const lines = ["[รายการเครื่องจักรที่ผิดปกติ]"];
  if (abnormal.length === 0) {
    lines.push("- ไม่มีเครื่องจักรที่ผิดปกติในขณะนี้ (ทุกเครื่องอยู่ในเกณฑ์ปกติ)");
    return lines.join("\n");
  }

  const shown = abnormal.slice(0, maxRows);
  for (const { row, evaluation } of shown) {
    const reasons = evaluation.reasons.length > 0 ? evaluation.reasons.join("; ") : "ไม่มีเหตุผลเพิ่มเติม";
    lines.push(
      `- ${fmt(row.code)} | ${fmt(row.name)} | สถานที่: ${fmt(row.location)} | สถานะ: ${fmt(row.status)} | ` +
        `Health: ${fmt(row.health_score)} | Spindle: ${fmt(row.spindle_temp)} | Vibration: ${fmt(row.vibration_mms)} | ` +
        `Error: ${fmt(row.active_error_code)} (${fmt(row.active_error_desc)}) | เหตุผล: ${reasons}`
    );
  }
  if (abnormal.length > shown.length) {
    lines.push(`- (แสดง ${shown.length} จากทั้งหมด ${abnormal.length} เครื่องที่ผิดปกติ)`);
  }
  return lines.join("\n");
}

async function fetchMachineWorkOrders(machineCode: string | null): Promise<WorkOrderRow[]> {
  if (!machineCode) return [];
  // Mirrors the ordering used by GET /api/work-orders (workOrders.ts): newest
  // assigned_date first, id as a deterministic tiebreaker.
  const { data, error } = await supabase
    .from("work_orders")
    .select("*")
    .eq("machine_code", machineCode)
    .order("assigned_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(MAX_WORK_ORDERS_PER_MACHINE);
  if (error) throw error;
  return (data ?? []) as WorkOrderRow[];
}

async function fetchLatestTelemetry(machineId: string): Promise<TelemetryReadingRow | null> {
  const { data, error } = await supabase
    .from("telemetry_readings")
    .select("*")
    .eq("machine_id", machineId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as TelemetryReadingRow | null;
}

// Returns both a full rendering (all resolved work orders) and a compact rendering
// (work-order count only, no per-order detail) so the top-level assembler can drop
// the least important part first if the whole context block is over budget.
async function buildMachineDetail(row: MachineRow): Promise<{ full: string; compact: string }> {
  const [workOrders, telemetry] = await Promise.all([
    fetchMachineWorkOrders(row.code ?? null),
    fetchLatestTelemetry(row.id),
  ]);

  const evaluation = evaluateRow(row);
  const reasons = evaluation.reasons.length > 0 ? evaluation.reasons.join("; ") : "ไม่มีเหตุผลเพิ่มเติม";

  const baseLines = [
    `* เครื่อง ${fmt(row.code)} - ${fmt(row.name)}`,
    `  - สถานที่: ${fmt(row.location)} | สถานะ: ${fmt(row.status)} | Health: ${fmt(row.health_score)} | ` +
      `Spindle: ${fmt(row.spindle_temp)} | Vibration: ${fmt(row.vibration_mms)} | Error: ${fmt(row.active_error_code)} (${fmt(row.active_error_desc)})`,
    `  - รุ่น: ${fmt(row.model)} | ชั่วโมงใช้งาน: ${fmt(row.operating_hours)} | บำรุงล่าสุด: ${fmt(row.last_maintenance)} | ` +
      `บำรุงครั้งต่อไป: ${fmt(row.next_maintenance)} | หมวดหมู่: ${fmt(row.category)} | แผนก: ${fmt(row.department_code)} | ส่วน: ${fmt(row.section)}`,
    `  - ผลประเมิน: ${evaluation.level} | เหตุผล: ${reasons}`,
  ];

  const telemetryLine = telemetry
    ? `  - ข้อมูล telemetry ล่าสุด: ${fmt(telemetry.metric)} = ${fmt(telemetry.value)} | แหล่งข้อมูล: ${fmt(telemetry.source)} | เวลา: ${fmt(telemetry.recorded_at)}`
    : "  - ข้อมูล telemetry ล่าสุด: ไม่มีข้อมูลในระบบ";

  let woFullLines: string[];
  let woCompactLine: string;
  if (workOrders.length === 0) {
    woFullLines = ["  - ใบงานซ่อมบำรุงล่าสุด: ไม่มีข้อมูลในระบบ"];
    woCompactLine = "  - ใบงานซ่อมบำรุงล่าสุด: ไม่มีข้อมูลในระบบ";
  } else {
    woFullLines = [`  - ใบงานซ่อมบำรุงล่าสุด (${workOrders.length} รายการ):`];
    for (const wo of workOrders) {
      woFullLines.push(
        `    · เลขที่ใบงาน: ${fmt(wo.code)} | ชื่องาน: ${fmt(wo.title)} | สถานะ: ${fmt(wo.status)} | ความสำคัญ: ${fmt(wo.priority)} | ` +
          `วันที่สร้าง: ${fmt(wo.created_at)} | อาการ: ${fmt(wo.symptoms)} | สาเหตุ: ${fmt(wo.cause)} | ` +
          `การซ่อม: ${fmt(wo.repair_action)} | ประเภทงานซ่อม: ${fmt(wo.repair_category)} | เวลาสูญเสียการผลิต(นาที): ${fmt(wo.mtloss_min)}`
      );
    }
    woCompactLine = `  - ใบงานซ่อมบำรุงล่าสุด: ${workOrders.length} รายการ (รายละเอียดถูกตัดออกเนื่องจากข้อมูลยาวเกินไป)`;
  }

  const full = [...baseLines, ...woFullLines, telemetryLine].join("\n");
  const compact = [...baseLines, woCompactLine, telemetryLine].join("\n");
  return { full, compact };
}

// Drops WHOLE trailing lines (never a partial line) until `text` fits within
// `maxChars` including `note`, then appends `note`. Used only as the last-resort
// safety net below — the compact-detail branch above already avoids ever needing
// this by dropping whole per-work-order lines first.
function dropWholeLinesToFit(text: string, maxChars: number, note: string): string {
  if (text.length <= maxChars) return text;
  const budget = Math.max(0, maxChars - note.length);
  const lines = text.split("\n");
  while (lines.length > 0 && lines.join("\n").length > budget) {
    lines.pop();
  }
  return lines.join("\n") + note;
}

/**
 * Builds a Thai plain-text knowledge block from the live database,
 * to be embedded in the Gemini system prompt.
 * MUST NEVER THROW — returns "" on any failure.
 */
export async function buildKnowledgeContext(input: AiContextInput): Promise<string> {
  try {
    const prompt = typeof input?.prompt === "string" ? input.prompt : "";
    const rows = await getFleetRows();

    const { machines: resolvedMachines, notes: resolveNotes } = resolveMachines(
      prompt,
      input?.machineContext ?? null,
      rows
    );
    const details = await Promise.all(resolvedMachines.map((row) => buildMachineDetail(row)));

    const header =
      "ข้อมูลต่อไปนี้เป็นข้อมูลจริงที่อ่านจากฐานข้อมูลระบบ ณ เวลาที่ประมวลผลคำถามนี้ " +
      "ตอบโดยอ้างอิงเฉพาะข้อมูลนี้เท่านั้น ห้ามแต่งตัวเลขหรือชื่อเครื่องขึ้นเอง หากไม่มีข้อมูลให้บอกว่าไม่มีข้อมูลในระบบ";

    const thresholdSection = `[เกณฑ์การประเมิน]\n${thresholdSummaryText()}`;
    const overviewSection = buildOverviewSection(rows);
    const matchNotesSection =
      resolveNotes.length > 0 ? ["[หมายเหตุการค้นหาเครื่องจักร]", ...resolveNotes].join("\n") : "";

    const fullDetailSection =
      details.length > 0
        ? ["[เครื่องจักรที่เกี่ยวข้องกับคำถาม (รายละเอียดเต็ม)]", ...details.map((d) => d.full)].join("\n\n")
        : "";

    // The fleet-wide abnormal list (up to MAX_ABNORMAL_ROWS machines the user did
    // NOT ask about) is background noise once a specific machine was already
    // resolved from the prompt — shrink its row cap so its budget goes to the
    // question-relevant detail section instead of crowding it out.
    const focusedOnMachine = details.length > 0;
    const abnormalSection = buildAbnormalSection(rows, focusedOnMachine ? MAX_ABNORMAL_ROWS_FOCUSED : MAX_ABNORMAL_ROWS);

    // Assembly order matters: sections are listed from "last dropped" to "first
    // dropped" priority. The question-relevant detail (what the user actually
    // asked about) and the threshold rules come first/early so dropWholeLinesToFit
    // — which only ever trims whole lines off the END of the string — sacrifices
    // the generic fleet-wide overview/abnormal-list rows before ever touching them.
    const buildResult = (abnormal: string, detail: string): string =>
      [header, thresholdSection, detail, matchNotesSection, overviewSection, abnormal].filter(Boolean).join("\n\n");

    let result = buildResult(abnormalSection, fullDetailSection);

    // Over budget even after shrinking the abnormal-list row cap above: shed the
    // fleet-wide abnormal list further still — it is generic data the user did not
    // ask about, so it is sacrificed before the question-relevant machine detail.
    if (result.length > MAX_CONTEXT_CHARS && abnormalSection.length > 0) {
      const tightAbnormalSection = buildAbnormalSection(rows, MAX_ABNORMAL_ROWS_TIGHT);
      result = buildResult(tightAbnormalSection, fullDetailSection);
    }

    // Still over budget: only now drop the least important part of the detail
    // itself — per-work-order detail — and keep just a count per machine. This
    // is the last resort before line-dropping and only fires when the fleet-wide
    // sections above have already been shrunk as far as they go.
    if (result.length > MAX_CONTEXT_CHARS && details.length > 0) {
      const tightAbnormalSection = buildAbnormalSection(rows, MAX_ABNORMAL_ROWS_TIGHT);
      const compactDetailSection = [
        "[เครื่องจักรที่เกี่ยวข้องกับคำถาม]",
        ...details.map((d) => d.compact),
        "- หมายเหตุ: รายละเอียดใบงานซ่อมบำรุงบางส่วนถูกตัดออกเนื่องจากข้อมูลยาวเกินไป",
      ].join("\n\n");
      result = buildResult(tightAbnormalSection, compactDetailSection);
    }

    // Still over budget (e.g. an enormous abnormal-machine list): drop whole
    // trailing lines (never slice mid-line — see dropWholeLinesToFit) as a last
    // resort, and say so, rather than silently/partially truncating a line.
    if (result.length > MAX_CONTEXT_CHARS) {
      const note = "\n\n- หมายเหตุ: เนื้อหาบางส่วนถูกตัดออกเนื่องจากข้อมูลยาวเกินขนาดที่กำหนด";
      result = dropWholeLinesToFit(result, MAX_CONTEXT_CHARS, note);
    }

    return result;
  } catch (error) {
    console.error("buildKnowledgeContext failed:", error);
    return "";
  }
}
