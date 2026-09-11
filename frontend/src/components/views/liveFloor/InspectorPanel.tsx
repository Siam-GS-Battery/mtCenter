import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Crosshair,
  Play,
  Repeat,
  RotateCcw,
  Send,
  Square,
  Video,
} from "lucide-react";
import PixelAILogo from "../../PixelAILogo";
import {
  SCOPE_LABELS,
  SEVERITY_LABELS,
  reportToText,
  type InspectionAgent,
  type InspectionReport,
  type InspectionScope,
  type InspectorLogEntry,
  type InspectorSnapshot,
} from "../../../lib/inspectionAgent";
import { buildRoundAiSummaryMock, roundAiSummaryToText } from "../../../lib/roundAiSummaryMock";

/**
 * ===========================================================================
 * INSPECTOR PANEL — แชตรายงานของหุ่นยนต์ตรวจสายการผลิต
 * ===========================================================================
 *
 * พาเนลลอยด้านขวาของ Live Floor 4D ที่ทำหน้าที่สองอย่าง
 *   • แผงสั่งงาน: เลือกช่วงรายงาน (รายชั่วโมง / รายวัน / ตามสั่ง), เริ่ม-หยุด
 *     รอบตรวจ, ปรับความเร็วเดิน, เปิดโหมดเดินวนอัตโนมัติ
 *   • แชตรายงาน: บันทึกสดทีละจุดที่หุ่นเดินไปตรวจ แล้วปิดท้ายด้วยการ์ด
 *     รายงานสรุปของรอบนั้น พร้อมปุ่มคัดลอกและปุ่มส่งต่อให้ AI Assistant
 *
 * พาเนลนี้ไม่มีตรรกะการตรวจอยู่เลย — อ่านจาก `snapshot` และสั่งงานผ่าน
 * `agent` เท่านั้น (ตรรกะทั้งหมดอยู่ใน lib/inspectionAgent.ts)
 */

const PANEL_CLASS =
  "bg-[var(--lf-panel-bg)] backdrop-blur-md border border-[var(--lf-panel-border)] rounded-[18px] shadow-[0_8px_24px_-12px_var(--lf-panel-glow)] text-[var(--lf-text)]";

const HIDE_SCROLLBAR_CLASS =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const SCOPES: InspectionScope[] = ["hourly", "daily", "custom"];
const SPEEDS = [1, 2, 4] as const;

/** สีของบรรทัดบันทึกตามชนิด — ยึดภาษาสีสถานะเดิมของ Live Floor */
const LOG_TONE: Record<InspectorLogEntry["kind"], string> = {
  route: "text-[var(--lf-text-muted)]",
  check: "text-[var(--lf-text)]",
  watch: "text-[var(--lf-warning)]",
  alert: "text-[var(--lf-danger)]",
  report: "text-[var(--lf-accent)]",
};

const PHASE_LABELS: Record<InspectorSnapshot["phase"], string> = {
  idle: "พร้อมรับคำสั่ง",
  walking: "กำลังเดินไปจุดตรวจ",
  inspecting: "กำลังอ่านค่าเครื่อง",
  reporting: "กำลังเรียบเรียงรายงาน",
  done: "จบรอบตรวจแล้ว",
};

export interface InspectorPanelProps {
  agent: InspectionAgent;
  snapshot: InspectorSnapshot;
  /** ส่งข้อความไปถาม AI Assistant แบบข้อความล้วน (ผู้เรียกอื่นๆ ที่ไม่ใช่การ์ดรายงานรอบตรวจ) */
  onAskAI?: (prompt: string) => void;
  /**
   * ปุ่ม "ให้ AI สรุป" บนการ์ดรายงานรอบตรวจ — เปิดแชต AI ด้านข้างทันที พร้อม
   * สรุปผล (จำลอง) ของรอบนั้นเป็นคำตอบแรก แทนที่จะเปิดการ์ดสรุปในพาเนลนี้เอง
   * (ดู App.tsx: handleAskAIRoundSummary ที่ seed ข้อความลงแชตโดยตรง)
   */
  onAskAIRoundSummary?: (report: InspectionReport) => void;
  /** true = กล้องกำลังเกาะติดตัวหุ่นอยู่ */
  follow: boolean;
  onToggleFollow: () => void;
  /** ซ่อนพาเนลเฉยๆ (หุ่นยังเดินตรวจต่อเบื้องหลัง) */
  onClose: () => void;
  /** ปิดหุ่นยนต์จริง — สั่งหยุดรอบตรวจและเลิก mount ตัวหุ่นในฉาก */
  onStop: () => void;
}

function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// ---------------------------------------------------------------------------
// การ์ดรายงานหนึ่งฉบับ
// ---------------------------------------------------------------------------

function ReportCard({
  report,
  onAskAI,
  onAskAIRoundSummary,
}: {
  report: InspectionReport;
  onAskAI?: (prompt: string) => void;
  onAskAIRoundSummary?: (report: InspectionReport) => void;
}) {
  const [expanded, setExpanded] = useState(report.alertCount > 0);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      // สรุป AI (จำลอง) เป็น deterministic ตาม report.id เสมอ (ดู
      // buildRoundAiSummaryMock) จึงคำนวณตรงนี้ได้เลยโดยไม่ต้องเก็บ state —
      // ไม่มีการ์ดสรุปแบบ inline ให้ผูก state ไว้อีกต่อไป (ย้ายไปแสดงในแชตแทน)
      const text =
        reportToText(report) + "\n" + roundAiSummaryToText(buildRoundAiSummaryMock(report));
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // คลิปบอร์ดถูกปิดกั้น (บริบทไม่ปลอดภัย/ไม่ได้รับอนุญาต) — ไม่ต้องแจ้ง
      // เป็น error ให้ผู้ใช้ตกใจกลางการนำเสนอ แค่ไม่ขึ้นคำว่า "คัดลอกแล้ว"
      setCopied(false);
    }
  }, [report]);

  // ปุ่ม "ให้ AI สรุป" — เปิดแชต AI ด้านข้างทันทีพร้อมสรุปผลรอบนี้ (preferred:
  // onAskAIRoundSummary ที่ seed ข้อความสรุปลงแชตโดยตรงแบบไม่ผ่าน backend)
  // fallback เป็น onAskAI ทั่วไปถ้าผู้เรียกยังไม่ได้ส่ง callback เฉพาะทางมาให้
  const handleAskAI = useCallback(() => {
    if (onAskAIRoundSummary) onAskAIRoundSummary(report);
    else onAskAI?.(`ช่วยสรุปผล${report.title} ช่วง ${report.periodLabel}ให้หน่อย`);
  }, [report, onAskAI, onAskAIRoundSummary]);

  // คืนป้าย "คัดลอกแล้ว" กลับเป็นปุ่มเดิมหลังผ่านไปสองวินาที
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const tone =
    report.alertCount > 0
      ? "border-[var(--lf-danger-40)] bg-[var(--lf-danger-14)]"
      : report.watchCount > 0
      ? "border-[var(--lf-accent-26)] bg-[var(--lf-box-bg)]"
      : "border-[var(--lf-accent-26)] bg-[var(--lf-accent-14)]";

  return (
    <div className={`rounded-[14px] border p-3 space-y-2.5 ${tone}`}>
      <div className="flex items-start gap-2">
        <PixelAILogo className="w-5 h-5 shrink-0 text-[var(--lf-accent)] mt-0.5" />
        <div className="min-w-0">
          <p className="text-[12px] font-bold leading-tight">{report.title}</p>
          <p className="text-[10.5px] text-[var(--lf-text-muted)] mt-0.5">{report.periodLabel}</p>
        </div>
      </div>

      <p className="text-[12px] font-semibold leading-snug">{report.headline}</p>

      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "ปกติ", value: report.okCount, tone: "text-[var(--lf-accent)]" },
          { label: "เฝ้าระวัง", value: report.watchCount, tone: "text-[var(--lf-warning)]" },
          { label: "ต้องเข้าตรวจ", value: report.alertCount, tone: "text-[var(--lf-danger)]" },
        ].map((tile) => (
          <div
            key={tile.label}
            className="rounded-[10px] bg-[var(--lf-box-bg)] px-2 py-1.5 text-center"
          >
            <p className={`text-[15px] font-bold leading-none ${tile.tone}`}>{tile.value}</p>
            <p className="text-[9.5px] text-[var(--lf-text-muted)] mt-1">{tile.label}</p>
          </div>
        ))}
      </div>

      <p className="text-[10.5px] text-[var(--lf-text-muted)]">
        ตรวจ {report.checked} จุด จากเครื่องจักรทั้งหมด {report.totalMachines} เครื่อง · ใช้เวลาเดินตรวจ{" "}
        {fmtClock(report.durationSec)}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-[11px] font-semibold text-[var(--lf-accent)] hover:text-[var(--lf-accent-hover)]"
      >
        <span>{expanded ? "ย่อรายละเอียด" : "ดูรายละเอียดและข้อเสนอแนะ"}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="space-y-2.5 pt-0.5">
          {report.zones.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10.5px] font-bold text-[var(--lf-text-muted)]">แยกตามโซน</p>
              {report.zones.map((zone) => (
                <div key={zone.label} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate">{zone.label}</span>
                  <span className="shrink-0 text-[var(--lf-text-muted)]">
                    {zone.checked} จุด
                    {zone.watch > 0 && (
                      <span className="text-[var(--lf-warning)]"> · เฝ้าระวัง {zone.watch}</span>
                    )}
                    {zone.alert > 0 && (
                      <span className="text-[var(--lf-danger)]"> · เข้าตรวจ {zone.alert}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {report.findings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10.5px] font-bold text-[var(--lf-text-muted)]">
                รายการที่ไม่ปกติ ({report.findings.length})
              </p>
              {report.findings.map((finding) => (
                <div
                  key={finding.machineId}
                  className="rounded-[10px] bg-[var(--lf-box-bg)] px-2 py-1.5 space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold truncate">{finding.machineCode}</span>
                    <span
                      className={`text-[9.5px] font-bold shrink-0 ${
                        finding.severity === "alert"
                          ? "text-[var(--lf-danger)]"
                          : "text-[var(--lf-warning)]"
                      }`}
                    >
                      {SEVERITY_LABELS[finding.severity]}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--lf-text-muted)]">
                    {finding.zoneLabel} · {finding.tempC.toFixed(1)}°C ·{" "}
                    {finding.vibration.toFixed(2)} mm/s
                  </p>
                  {finding.notes.map((note, i) => (
                    <p key={i} className="text-[10px] leading-snug">
                      · {note}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-[10.5px] font-bold text-[var(--lf-text-muted)]">ข้อเสนอแนะ</p>
            {report.recommendations.map((rec, i) => (
              <p key={i} className="text-[11px] leading-snug">
                · {rec}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1 rounded-[10px] border border-[var(--lf-accent-26)] px-2 py-1.5 text-[10.5px] font-semibold text-[var(--lf-text)] hover:bg-[var(--lf-accent-14)] transition-colors"
        >
          <ClipboardCopy className="w-3 h-3" />
          {copied ? "คัดลอกแล้ว" : "คัดลอกรายงาน"}
        </button>
        <button
          type="button"
          onClick={handleAskAI}
          className="flex-1 flex items-center justify-center gap-1 rounded-[10px] bg-[var(--lf-accent)] px-2 py-1.5 text-[10.5px] font-semibold text-white hover:bg-[var(--lf-accent-hover)] transition-colors"
        >
          <Send className="w-3 h-3" />
          ให้ AI สรุป
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// พาเนลหลัก
// ---------------------------------------------------------------------------

export default function InspectorPanel({
  agent,
  snapshot,
  onAskAI,
  onAskAIRoundSummary,
  follow,
  onToggleFollow,
  onClose,
  onStop,
}: InspectorPanelProps) {
  const [scope, setScope] = useState<InspectionScope>("hourly");
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(2);
  const [autoLoop, setAutoLoop] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  // ตัวคูณความเร็ว/โหมดวนซ้ำเป็นค่าที่อยู่ในตัว agent (ไม่ใช่ React state
  // ของฉาก) จึงต้อง push ลงไปทุกครั้งที่ผู้ใช้เปลี่ยน
  useEffect(() => {
    agent.setSpeedScale(speed);
  }, [agent, speed]);

  useEffect(() => {
    agent.setAutoLoop(autoLoop);
  }, [agent, autoLoop]);

  // เลื่อนแชตตามบรรทัดล่าสุดเสมอ — ผู้ชมการนำเสนอต้องเห็นบรรทัดที่หุ่นเพิ่ง
  // รายงาน ไม่ใช่ต้องลากสกอลล์เอง
  const lastKey = `${snapshot.log.length}|${snapshot.reports.length}`;
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastKey]);

  const running = snapshot.running;
  const progress =
    snapshot.totalStops > 0 ? Math.min(1, snapshot.stopNumber / snapshot.totalStops) : 0;

  // `snapshot.reports` เป็นอาร์เรย์ก้อนเดิมที่ถูก push เข้าไป (agent ไม่ได้
  // สร้างใหม่ทุกครั้งเพื่อไม่ให้ allocate ต่อเฟรม) — memo จึงต้องพึ่ง `length`
  // ไม่ใช่ identity ของอาร์เรย์ ไม่อย่างนั้นค่าจะค้างที่รายงานฉบับแรกตลอด
  const reportCount = snapshot.reports.length;
  const latestReport = useMemo(
    () => (reportCount > 0 ? snapshot.reports[reportCount - 1] : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportCount]
  );

  const handleStart = useCallback(() => {
    agent.start(scope);
  }, [agent, scope]);

  return (
    <div
      className={`absolute right-4 top-[76px] bottom-4 z-40 w-[19.5rem] max-w-[calc(100%-2rem)] flex flex-col ${PANEL_CLASS} pointer-events-auto overflow-hidden`}
    >
      {/* ---- หัวพาเนล ---- */}
      <div className="shrink-0 px-3 pt-3 pb-2.5 border-b border-[var(--lf-panel-border)]">
        <div className="flex items-start gap-2">
          <span className="relative shrink-0 mt-0.5">
            <PixelAILogo className="w-6 h-6 text-[var(--lf-accent)]" />
            {running && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--lf-accent)] animate-pulse" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-bold leading-tight">หุ่นยนต์ตรวจสายการผลิต</p>
            <p className="text-[10.5px] text-[var(--lf-text-muted)] mt-0.5">
              {PHASE_LABELS[snapshot.phase]}
              {snapshot.totalStops > 0 && snapshot.stopNumber > 0 && (
                <> · จุดที่ {snapshot.stopNumber}/{snapshot.totalStops}</>
              )}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={onClose}
              title="ซ่อนแผงนี้ชั่วคราว (หุ่นยนต์ยังทำงานต่อ)"
              aria-label="ซ่อนแผงนี้ชั่วคราว"
              className="min-h-[32px] rounded-[8px] px-3 text-[10.5px] font-semibold text-[var(--lf-text-muted)] bg-[var(--lf-box-bg)] hover:bg-[var(--lf-accent-14)] hover:text-[var(--lf-accent)] transition-colors"
            >
              ซ่อน
            </button>
            <button
              type="button"
              onClick={onStop}
              title="ปิดการทำงานของหุ่นยนต์ตรวจสายการผลิต"
              aria-label="ปิดหุ่นยนต์ตรวจสายการผลิต"
              className="min-h-[32px] rounded-[8px] border border-[var(--lf-danger-40)] bg-[var(--lf-danger-14)] px-3 text-[10.5px] font-bold text-[var(--lf-danger)] hover:bg-[var(--lf-danger-26)] transition-colors"
            >
              ปิดหุ่นยนต์
            </button>
          </div>
        </div>

        {/* กล้องตามหุ่น — ปุ่มเดียวกับที่คลิกตัวหุ่นในฉากแล้วได้ผลเหมือนกัน */}
        <button
          type="button"
          onClick={onToggleFollow}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[10.5px] font-bold transition-colors ${
            follow
              ? "bg-[var(--lf-accent)] text-white"
              : "bg-[var(--lf-box-bg)] text-[var(--lf-text)] hover:bg-[var(--lf-accent-14)]"
          }`}
        >
          {follow ? <Crosshair className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
          {follow ? "กล้องกำลังตามหุ่น — กดเพื่อปล่อย" : "ให้กล้องตามหุ่น"}
        </button>

        {/* แถบความคืบหน้าของรอบที่กำลังเดิน */}
        {snapshot.totalStops > 0 && (
          <div className="mt-2 h-1 rounded-full bg-[var(--lf-box-bg)] overflow-hidden">
            <div
              className="h-full bg-[var(--lf-accent)] transition-[width] duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {snapshot.currentMachine && (
          <p className="mt-1.5 text-[10.5px] text-[var(--lf-text)] truncate">
            กำลังตรวจ:{" "}
            <span className="font-bold">
              {snapshot.currentMachine.code || snapshot.currentMachine.name}
            </span>
          </p>
        )}
      </div>

      {/* ---- แผงสั่งงาน ---- */}
      <div className="shrink-0 px-3 py-2.5 space-y-2 border-b border-[var(--lf-panel-border)]">
        <div>
          <p className="text-[9.5px] font-bold text-[var(--lf-text-muted)] mb-1">ช่วงรายงาน</p>
          <div className="grid grid-cols-3 gap-1">
            {SCOPES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                className={`rounded-[9px] px-1 py-1.5 text-[10.5px] font-semibold transition-colors ${
                  scope === s
                    ? "bg-[var(--lf-accent)] text-white"
                    : "bg-[var(--lf-box-bg)] text-[var(--lf-text)] hover:bg-[var(--lf-accent-14)]"
                }`}
              >
                {SCOPE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {running ? (
            <button
              type="button"
              onClick={() => agent.stop()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] border border-[var(--lf-danger-40)] bg-[var(--lf-danger-14)] px-2 py-2 text-[11px] font-bold text-[var(--lf-danger)] hover:bg-[var(--lf-danger-26)] transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              หยุดรอบตรวจ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] bg-[var(--lf-accent)] px-2 py-2 text-[11px] font-bold text-white hover:bg-[var(--lf-accent-hover)] transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              {snapshot.reports.length > 0 ? "เริ่มรอบใหม่" : "เริ่มเดินตรวจ"}
            </button>
          )}
          <button
            type="button"
            onClick={() => agent.reset()}
            title="ล้างบันทึกและรายงานทั้งหมด"
            className="shrink-0 rounded-[10px] border border-[var(--lf-accent-26)] p-2 text-[var(--lf-text-muted)] hover:bg-[var(--lf-accent-14)] hover:text-[var(--lf-text)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-[9.5px] font-bold text-[var(--lf-text-muted)]">ความเร็ว</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`flex-1 rounded-[8px] px-1 py-1 text-[10px] font-bold transition-colors ${
                  speed === s
                    ? "bg-[var(--lf-accent)] text-white"
                    : "bg-[var(--lf-box-bg)] text-[var(--lf-text)] hover:bg-[var(--lf-accent-14)]"
                }`}
              >
                x{s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAutoLoop((v) => !v)}
            title="จบรอบแล้วเริ่มรอบใหม่เองอัตโนมัติ"
            className={`shrink-0 flex items-center gap-1 rounded-[8px] px-2 py-1 text-[10px] font-bold transition-colors ${
              autoLoop
                ? "bg-[var(--lf-accent)] text-white"
                : "bg-[var(--lf-box-bg)] text-[var(--lf-text-muted)] hover:bg-[var(--lf-accent-14)]"
            }`}
          >
            <Repeat className="w-3 h-3" />
            วนรอบ
          </button>
        </div>
      </div>

      {/* ---- แชตรายงาน ---- */}
      <div
        ref={streamRef}
        className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2.5 space-y-2 ${HIDE_SCROLLBAR_CLASS}`}
      >
        {snapshot.log.length === 0 && snapshot.reports.length === 0 && (
          <div className="rounded-[12px] bg-[var(--lf-box-bg)] p-3 space-y-1.5">
            <p className="text-[11.5px] font-bold">ยังไม่มีรอบตรวจในวันนี้</p>
            <p className="text-[10.5px] text-[var(--lf-text-muted)] leading-relaxed">
              กด “เริ่มเดินตรวจ” แล้วหุ่นยนต์จะเดินไล่ตรวจเครื่องจักรทีละโซนตามผังจริง
              อ่านค่าอุณหภูมิและความสั่นที่หน้าเครื่อง แล้วสรุปเป็นรายงานให้ที่นี่
            </p>
          </div>
        )}

        {/* บันทึกสด: บรรทัดต่อบรรทัดตามที่หุ่นเดินไป */}
        {snapshot.log.map((entry) => (
          <div key={entry.id} className="flex items-start gap-1.5">
            <span className="shrink-0 text-[9.5px] font-mono text-[var(--lf-text-muted)] pt-0.5">
              {fmtClock(entry.at)}
            </span>
            <p className={`text-[11px] leading-snug ${LOG_TONE[entry.kind]}`}>{entry.text}</p>
          </div>
        ))}

        {/* การ์ดรายงาน: ใหม่สุดอยู่ล่างสุดเหมือนแชต */}
        {snapshot.reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onAskAI={onAskAI}
            onAskAIRoundSummary={onAskAIRoundSummary}
          />
        ))}
      </div>

      {/* ---- แถบท้าย: สรุปหนึ่งบรรทัดของรายงานล่าสุด ---- */}
      {latestReport && (
        <div className="shrink-0 px-3 py-2 border-t border-[var(--lf-panel-border)]">
          <p className="text-[10px] text-[var(--lf-text-muted)] truncate">
            รายงานล่าสุด: {latestReport.periodLabel} · เดินไปแล้ว{" "}
            {Math.round(snapshot.distance)} เมตร
          </p>
        </div>
      )}
    </div>
  );
}
