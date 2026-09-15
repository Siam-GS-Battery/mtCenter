// รันชุดทดสอบคุณภาพคำตอบของ MT Center AI Assistant แบบอัตโนมัติ (ไม่ต้อง curl มือทีละคำถาม)
//
// ทำไมต้องมี: ก่อนหน้านี้ทุกการเปลี่ยนแปลงของ AI ถูกตรวจด้วยการ curl คำถามไม่กี่ข้อด้วยมือ
// — ช้า ไม่คงเส้นคงวา และลืมเช็กง่าย บั๊กที่ทำให้คุณภาพคำตอบแย่ลง (ไม่ใช่ error ที่ระบบ
// จับได้เอง) จึงไม่มีทางถูกจับได้เลยจนกว่าจะมีคนมาถามเจอเอง สคริปต์นี้รันชุดคำถามจริงใน
// backend/tests/fixtures/ai-eval-set.json ซ้ำได้ทุกครั้ง ตรวจ assertion อัตโนมัติ และให้
// exit code ที่ CI เอาไปใช้ gate ได้ในอนาคต
//
// วิธีใช้ (รันจากโฟลเดอร์ backend/ เพื่อให้ dotenv อ่าน backend/.env ได้ — backend ต้อง
// รันอยู่แล้วที่ --base-url ก่อนเรียกสคริปต์นี้):
//   npm run eval:ai                              รันทั้งชุดกับ http://localhost:4000
//   npm run eval:ai -- --base-url=http://localhost:5000
//   npm run eval:ai -- --only=q10-regression-all000-pm-2char
//   npm run eval:ai -- --category=manual_lookup
//   npm run eval:ai -- --concurrency=4           ค่าเริ่มต้น 2 (สุภาพกับ API/โควตาโมเดล)
//
// exit code 0 = ผ่านทุกเคส, non-zero = มีเคสไม่ผ่าน (เอาไปต่อ CI gate ได้ในอนาคต)
// เขียนรายงานละเอียดไปที่ backend/scripts/eval-ai-report.json เสมอ (รูปแบบเดียวกับ
// backend/scripts/import-manuals-report.json ที่มีอยู่แล้ว)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import { config } from "../src/config.js";
import { supabase } from "../src/lib/supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CLI args (ตามธรรมเนียมของ index-manuals.ts: --flag=value, ไม่รู้จักอะไรก็ error ทิ้ง)
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function argValue(flag: string): string | null {
  const found = args.find((a) => a.startsWith(`--${flag}=`));
  return found ? found.slice(flag.length + 3) : null;
}

const BASE_URL = (argValue("base-url") ?? "http://localhost:4000").replace(/\/+$/, "");
const ONLY = argValue("only");
const CATEGORY = argValue("category");
const CONCURRENCY = (() => {
  const raw = argValue("concurrency");
  if (!raw) return 2;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    console.error(`ค่า --concurrency ไม่ถูกต้อง: "${raw}" ต้องเป็นจำนวนเต็มบวก`);
    process.exit(1);
  }
  return n;
})();

const unknownArgs = args.filter(
  (a) => !a.startsWith("--base-url=") && !a.startsWith("--only=") && !a.startsWith("--category=") && !a.startsWith("--concurrency=")
);
if (unknownArgs.length > 0) {
  console.error(`ไม่รู้จักอาร์กิวเมนต์: ${unknownArgs.join(", ")}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Fixture types (โครงเดียวกับ backend/tests/fixtures/ai-eval-set.json)
// ---------------------------------------------------------------------------

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface CaseExpect {
  mustNotFallback?: boolean;
  mustCiteManual?: boolean;
  mustCiteOnlyManualTitle?: string;
  mustMentionAny?: string[];
  mustNotFabricateCitation?: boolean;
  mustReturnParseableJson?: boolean;
  maxLatencyMs?: number;
  note?: string;
}

interface EvalCase {
  id: string;
  question: string;
  category: string;
  manualId?: string;
  history?: HistoryMessage[];
  target?: "chat" | "diagnose";
  diagnose?: { machineCode: string; errorText: string };
  regression?: boolean;
  regressionNote?: string;
  expect: CaseExpect;
}

interface EvalFixtureFile {
  cases: EvalCase[];
}

// ---------------------------------------------------------------------------
// Result types — เก็บทุกอย่างที่ต้องใช้ debug ได้จากรายงานเดียว ไม่ต้องรัน curl ซ้ำ
// ---------------------------------------------------------------------------

interface AssertionResult {
  name: string;
  passed: boolean;
  detail: string;
}

interface CaseResult {
  id: string;
  category: string;
  regression: boolean;
  question: string;
  target: "chat" | "diagnose";
  passed: boolean;
  httpStatus: number | null;
  latencyMs: number;
  reply: string | null;
  fallback: boolean | null;
  mode: string | null;
  citedManualTitle: string | null;
  hasCitationTag: boolean;
  diagnoseResult: unknown;
  assertions: AssertionResult[];
  error: string | null;
}

// ---------------------------------------------------------------------------
// Auth: mint our own JWT for a real, unlocked profile — same payload shape as
// src/lib/auth.ts signToken (sub/employeeId/role/pv/jti). We sign directly with
// jsonwebtoken instead of importing signToken to avoid any coupling to files
// under active edit elsewhere; the payload contract is copied verbatim from
// src/lib/auth.ts (read-only reference, not modified).
// ---------------------------------------------------------------------------

function passwordTokenVersion(passwordUpdatedAt: string | null | undefined): string {
  if (!passwordUpdatedAt) return "0";
  const parsed = Date.parse(passwordUpdatedAt);
  return Number.isNaN(parsed) ? String(passwordUpdatedAt) : String(parsed);
}

interface ProfileForToken {
  id: string;
  employee_id: string;
  role: string;
  must_change_password: boolean | null;
  password_updated_at: string | null;
}

async function mintTestToken(): Promise<{ token: string; profile: ProfileForToken }> {
  // usr-tech-01 / EMP-8042 is documented as a known-good profile with
  // must_change_password: false — but re-verify against live DB rather than
  // trusting that blindly (accounts can change), and fall back to querying for
  // any technician-role profile that isn't locked behind a forced password
  // change if that specific one is ever missing.
  const preferredEmployeeId = "EMP-8042";

  const { data: preferred, error: preferredError } = await supabase
    .from("profiles")
    .select("id, employee_id, role, must_change_password, password_updated_at")
    .eq("employee_id", preferredEmployeeId)
    .maybeSingle();
  if (preferredError) throw new Error(`อ่าน profile ไม่สำเร็จ: ${preferredError.message}`);

  let profile = preferred as ProfileForToken | null;
  if (!profile || profile.must_change_password) {
    const { data: fallbackRows, error: fallbackError } = await supabase
      .from("profiles")
      .select("id, employee_id, role, must_change_password, password_updated_at")
      .eq("must_change_password", false)
      .limit(1);
    if (fallbackError) throw new Error(`อ่าน profile สำรองไม่สำเร็จ: ${fallbackError.message}`);
    profile = (fallbackRows ?? [])[0] as ProfileForToken | undefined ?? null;
  }

  if (!profile) {
    throw new Error(
      "ไม่พบ profile ที่ must_change_password=false สักตัวในระบบ — ไม่มีบัญชีให้ eval script ใช้ล็อกอินแทนได้ " +
        '(ลองรัน "npm run seed:passwords" ก่อน)'
    );
  }

  const token = jwt.sign(
    {
      sub: profile.id,
      employeeId: profile.employee_id,
      role: profile.role,
      pv: passwordTokenVersion(profile.password_updated_at),
      jti: `eval-${Date.now()}`,
    },
    config.jwtSecret,
    { algorithm: "HS256", expiresIn: "1h" }
  );

  return { token, profile };
}

// ---------------------------------------------------------------------------
// HTTP calls against the running backend
// ---------------------------------------------------------------------------

const CITATION_TAG_RE = /\(อ้างอิง:\s*([^,)]+),?\s*([^)]*)\)/;

interface ChatApiResponse {
  success?: boolean;
  reply?: string;
  fallback?: boolean;
  mode?: string;
  logId?: number;
  error?: { message?: string };
}

interface DiagnoseApiResponse {
  success?: boolean;
  result?: unknown;
  error?: { message?: string };
}

async function callChat(
  token: string,
  question: string,
  history: HistoryMessage[] | undefined,
  manualId: string | undefined
): Promise<{ status: number; body: ChatApiResponse; latencyMs: number }> {
  const started = Date.now();
  const res = await fetch(`${BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      prompt: question,
      machineContext: {},
      role: "technician",
      history: history ?? [],
      ...(manualId ? { manualId } : {}),
    }),
  });
  const latencyMs = Date.now() - started;
  const body = (await res.json().catch(() => ({}))) as ChatApiResponse;
  return { status: res.status, body, latencyMs };
}

async function callDiagnose(
  token: string,
  machineCode: string,
  errorText: string
): Promise<{ status: number; body: DiagnoseApiResponse; latencyMs: number }> {
  const started = Date.now();
  const res = await fetch(`${BASE_URL}/api/ai/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ machineCode, errorText }),
  });
  const latencyMs = Date.now() - started;
  const body = (await res.json().catch(() => ({}))) as DiagnoseApiResponse;
  return { status: res.status, body, latencyMs };
}

// ---------------------------------------------------------------------------
// Assertion evaluation
// ---------------------------------------------------------------------------

function evaluateChatCase(testCase: EvalCase, reply: string, fallback: boolean, latencyMs: number): AssertionResult[] {
  const results: AssertionResult[] = [];
  const expect = testCase.expect;

  const citationMatch = CITATION_TAG_RE.exec(reply);
  const hasCitation = citationMatch !== null;
  const citedTitle = citationMatch ? citationMatch[1].trim() : null;

  if (expect.mustNotFallback !== undefined) {
    // mustNotFallback: true means fallback must be false
    const ok = expect.mustNotFallback ? fallback === false : true;
    results.push({
      name: "mustNotFallback",
      passed: ok,
      detail: ok ? "ไม่ใช้คำตอบสำรอง (fallback=false) ตามที่คาด" : `คำตอบตกไปใช้ fallback (fallback=${fallback}) ทั้งที่ต้องไม่ใช้`,
    });
  }

  if (expect.mustCiteManual !== undefined) {
    const ok = expect.mustCiteManual ? hasCitation : !hasCitation;
    results.push({
      name: "mustCiteManual",
      passed: ok,
      detail: ok
        ? expect.mustCiteManual
          ? `พบแท็ก (อ้างอิง: ...) ตามที่คาด (${citedTitle ?? "?"})`
          : "ไม่มีแท็ก (อ้างอิง: ...) ตามที่คาด"
        : expect.mustCiteManual
          ? "ต้องมีแท็ก (อ้างอิง: ...) แต่ไม่พบในคำตอบ"
          : `ไม่ควรมีแท็ก (อ้างอิง: ...) แต่พบ (${citedTitle ?? "?"})`,
    });
  }

  if (expect.mustNotFabricateCitation) {
    const ok = !hasCitation;
    results.push({
      name: "mustNotFabricateCitation",
      passed: ok,
      detail: ok
        ? "ไม่มีการแต่งแท็กอ้างอิงคู่มือขึ้นเอง"
        : `พบแท็ก (อ้างอิง: ${citedTitle ?? "?"}) ทั้งที่คำถามนี้ไม่ควรมีข้อมูลคู่มือมารองรับ (สงสัยว่าโมเดลแต่งอ้างอิงขึ้นเอง)`,
    });
  }

  if (expect.mustCiteOnlyManualTitle) {
    const expected = expect.mustCiteOnlyManualTitle;
    const ok = hasCitation && citedTitle !== null && citedTitle.includes(expected.split(" – ")[0]);
    results.push({
      name: "mustCiteOnlyManualTitle",
      passed: ok,
      detail: ok
        ? `อ้างอิงเฉพาะคู่มือ "${expected}" ตามที่คาด`
        : `คาดว่าจะอ้างอิงเฉพาะ "${expected}" แต่พบแท็กอ้างอิงเป็น "${citedTitle ?? "(ไม่มีแท็กเลย)"}"`,
    });
  }

  if (expect.mustMentionAny && expect.mustMentionAny.length > 0) {
    const found = expect.mustMentionAny.filter((needle) => reply.includes(needle));
    const ok = found.length > 0;
    results.push({
      name: "mustMentionAny",
      passed: ok,
      detail: ok
        ? `พบข้อความที่คาด: ${found.join(", ")}`
        : `ไม่พบข้อความใด ๆ ที่คาดไว้ในคำตอบ (คาด: ${expect.mustMentionAny.join(", ")})`,
    });
  }

  if (expect.maxLatencyMs !== undefined) {
    const ok = latencyMs <= expect.maxLatencyMs;
    results.push({
      name: "maxLatencyMs",
      passed: ok,
      detail: ok
        ? `ตอบภายใน ${latencyMs}ms (ไม่เกิน ${expect.maxLatencyMs}ms)`
        : `ตอบช้าเกินกำหนด: ${latencyMs}ms > ${expect.maxLatencyMs}ms`,
    });
  }

  return results;
}

function evaluateDiagnoseCase(expect: CaseExpect, parsed: unknown, parseError: string | null, latencyMs: number): AssertionResult[] {
  const results: AssertionResult[] = [];

  if (expect.mustReturnParseableJson) {
    const ok = parsed !== null && parseError === null;
    results.push({
      name: "mustReturnParseableJson",
      passed: ok,
      detail: ok
        ? "ได้ผลลัพธ์ JSON ที่ parse ได้จาก /api/ai/diagnose"
        : `ไม่ได้ JSON ที่ใช้งานได้จาก /api/ai/diagnose${parseError ? ` (${parseError})` : ""}`,
    });
  }

  if (expect.maxLatencyMs !== undefined) {
    const ok = latencyMs <= expect.maxLatencyMs;
    results.push({
      name: "maxLatencyMs",
      passed: ok,
      detail: ok
        ? `ตอบภายใน ${latencyMs}ms (ไม่เกิน ${expect.maxLatencyMs}ms)`
        : `ตอบช้าเกินกำหนด: ${latencyMs}ms > ${expect.maxLatencyMs}ms`,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Run one case — never throws; any failure (network, 500, timeout) is recorded
// as a failed case so a single bad question can never abort the whole suite.
// ---------------------------------------------------------------------------

async function runCase(token: string, testCase: EvalCase): Promise<CaseResult> {
  const target = testCase.target ?? "chat";
  const base: Omit<CaseResult, "passed" | "assertions"> = {
    id: testCase.id,
    category: testCase.category,
    regression: testCase.regression === true,
    question: testCase.question,
    target,
    httpStatus: null,
    latencyMs: 0,
    reply: null,
    fallback: null,
    mode: null,
    citedManualTitle: null,
    hasCitationTag: false,
    diagnoseResult: null,
    error: null,
  };

  try {
    if (target === "diagnose") {
      if (!testCase.diagnose) {
        throw new Error('เคสนี้ target="diagnose" แต่ไม่มีฟิลด์ diagnose ในไฟล์ fixture');
      }
      const { status, body, latencyMs } = await callDiagnose(token, testCase.diagnose.machineCode, testCase.diagnose.errorText);
      let parsed: unknown = null;
      let parseError: string | null = null;
      if (status === 200 && body?.success && body.result !== undefined) {
        parsed = body.result;
      } else {
        parseError = body?.error?.message ?? `HTTP ${status}`;
      }
      const assertions = evaluateDiagnoseCase(testCase.expect, parsed, parseError, latencyMs);
      return {
        ...base,
        httpStatus: status,
        latencyMs,
        diagnoseResult: parsed,
        error: parseError,
        assertions,
        passed: assertions.every((a) => a.passed),
      };
    }

    const { status, body, latencyMs } = await callChat(token, testCase.question, testCase.history, testCase.manualId);
    if (status !== 200 || !body?.success) {
      const errorMsg = body?.error?.message ?? `HTTP ${status}`;
      return {
        ...base,
        httpStatus: status,
        latencyMs,
        error: errorMsg,
        assertions: [{ name: "http", passed: false, detail: `เรียก /api/ai/chat ไม่สำเร็จ: ${errorMsg}` }],
        passed: false,
      };
    }

    const reply = body.reply ?? "";
    const fallback = body.fallback === true;
    const citationMatch = CITATION_TAG_RE.exec(reply);
    const assertions = evaluateChatCase(testCase, reply, fallback, latencyMs);

    return {
      ...base,
      httpStatus: status,
      latencyMs,
      reply,
      fallback,
      mode: body.mode ?? null,
      citedManualTitle: citationMatch ? citationMatch[1].trim() : null,
      hasCitationTag: citationMatch !== null,
      assertions,
      passed: assertions.every((a) => a.passed),
    };
  } catch (error) {
    // Network error, timeout, unexpected exception — record as a failed case,
    // never let it escape and abort the rest of the suite.
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...base,
      error: message,
      assertions: [{ name: "exception", passed: false, detail: `เกิดข้อผิดพลาดระหว่างเรียกทดสอบ: ${message}` }],
      passed: false,
    };
  }
}

// ---------------------------------------------------------------------------
// Small concurrency-limited runner (no extra dependency — this repo has none of
// the usual p-limit-style packages installed, and the need here is trivial).
// ---------------------------------------------------------------------------

async function runWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const fixturePath = path.join(__dirname, "..", "tests", "fixtures", "ai-eval-set.json");
  if (!fs.existsSync(fixturePath)) {
    console.error(`ไม่พบไฟล์ fixture: ${fixturePath}`);
    process.exit(1);
  }
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8")) as EvalFixtureFile;

  let cases = fixture.cases;
  if (ONLY) cases = cases.filter((c) => c.id === ONLY);
  if (CATEGORY) cases = cases.filter((c) => c.category === CATEGORY);

  if (cases.length === 0) {
    console.error("ไม่มีเคสให้รัน (ตรวจ --only / --category ว่าตรงกับ id/category ในไฟล์ fixture หรือไม่)");
    process.exit(1);
  }

  console.log(`MT Center AI Eval — เริ่มรัน ${cases.length} เคส กับ ${BASE_URL} (concurrency=${CONCURRENCY})\n`);

  let token: string;
  let profileEmployeeId: string;
  try {
    const minted = await mintTestToken();
    token = minted.token;
    profileEmployeeId = minted.profile.employee_id;
    console.log(`ล็อกอินแทนบัญชี: ${profileEmployeeId} (role=${minted.profile.role})\n`);
  } catch (error) {
    console.error(`สร้าง token สำหรับทดสอบไม่สำเร็จ: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
    return;
  }

  const results = await runWithConcurrency(cases, CONCURRENCY, (c) => runCase(token, c));

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  // --- Thai console summary table --------------------------------------------
  console.log("=== สรุปผลการทดสอบ AI Assistant ===");
  console.log(`ทั้งหมด: ${results.length} เคส | ผ่าน: ${passed.length} | ไม่ผ่าน: ${failed.length}\n`);

  console.log("รายละเอียดแต่ละเคส:");
  for (const r of results) {
    const mark = r.passed ? "✅" : "❌";
    const regressionTag = r.regression ? " [regression]" : "";
    console.log(`${mark} ${r.id}${regressionTag} (${r.category}) — ${r.latencyMs}ms`);
    if (!r.passed) {
      for (const a of r.assertions.filter((x) => !x.passed)) {
        console.log(`    - ${a.name}: ${a.detail}`);
      }
      if (r.error) console.log(`    - error: ${r.error}`);
    }
  }

  if (failed.length > 0) {
    console.log("\n=== เคสที่ไม่ผ่าน (สรุปเหตุผล) ===");
    for (const r of failed) {
      const reasons = r.assertions.filter((a) => !a.passed).map((a) => a.name).join(", ");
      console.log(`- ${r.id}: ${reasons || r.error || "ไม่ทราบสาเหตุ"}`);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    testAccount: profileEmployeeId,
    concurrency: CONCURRENCY,
    filters: { only: ONLY, category: CATEGORY },
    summary: { total: results.length, passed: passed.length, failed: failed.length },
    results,
  };
  const reportPath = path.join(__dirname, "eval-ai-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nรายงานฉบับเต็มถูกเขียนไปที่: ${reportPath}`);

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("eval-ai: เกิดข้อผิดพลาดที่ไม่คาดคิด:", error);
  process.exit(1);
});
