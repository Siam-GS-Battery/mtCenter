import React, { useEffect, useState } from "react";
import {
  QrCode,
  Thermometer,
  Activity,
  Gauge,
  Clock,
  ArrowRight,
  Sparkles,
  CameraOff,
  CheckCircle2,
  Package,
  AlertOctagon,
  AlertTriangle,
  Zap,
  X,
  Volume2,
  VolumeX,
  Sun,
  Cpu,
  Info,
  Wrench,
  History,
  Radio,
  ArrowUp,
  LayoutDashboard,
  FilePlus,
  CalendarClock,
  Loader2,
  RefreshCw,
  SwitchCamera,
} from "lucide-react";
import { Machine, WorkOrder } from "../../types";
import { MachineSelect } from "../MachineSelect";
import {
  orDash,
  formatDate,
  formatDecimal,
  isOverdueDate,
  overdueLabel,
  daysSinceLabel,
  NO_DATA,
  NO_DATA_TH,
  NO_REPAIR_HISTORY_TH,
} from "../../lib/format";
import { getWorkOrders, toUserMessage } from "../../services/apiService";
import { Pagination } from "../ui/Pagination";
import { SkeletonList } from "../ui/Skeleton";
import { GloveFriendlyCTA } from "../GloveFriendlyCTA";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { useQrScanner } from "../../hooks/useQrScanner";
import { resolveMachineFromQr } from "../../lib/qrPayload";
import {
  machineStatusLabel,
  machineStatusDotClass,
  machineStatusTextClass,
  woStatusLabel,
  woStatusPillClass,
  priorityLabel,
  priorityPillClass,
} from "../../lib/pillStyles";
import { workOrderDisplayDate, workOrderFinishTime } from "../../lib/workOrderStatus";
import {
  SPINDLE_TEMP_WARNING,
  SPINDLE_TEMP_ERROR,
  VIBRATION_WARNING,
  VIBRATION_ERROR,
  HEALTH_SCORE_WARNING,
  HEALTH_SCORE_ERROR,
  spindleTempLevel,
  vibrationLevel,
  healthScoreLevel,
  readingAvailability,
  evaluateMachine,
} from "../../lib/thresholds";

/**
 * Rows of repair history fetched per machine.
 *
 * Two machines in the plant exceed this (GR-918 has 117 work orders, AS-986 has
 * 115); every other machine loads complete in one request. Those two are not cut
 * silently — the list ends with a line stating how many of the `meta.total` rows
 * are not shown and where to read the rest.
 */
const MACHINE_HISTORY_LIMIT = 100;

/**
 * Column counts for the condition grid. The number of cards varies with how many
 * readings the machine actually reports, and Tailwind needs whole class names, so
 * the widths come from this table rather than a template literal.
 */
const DETAIL_GRID_COLS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-3 xl:grid-cols-5",
};

interface ScanMachineViewProps {
  machines?: Machine[];
  activeMachine: Machine;
  // No `workOrders` prop: the repair history is fetched per machine by code now,
  // because the shared list is both paginated and keyed on a machineId that every
  // imported work order leaves null.
  onSelectMachine?: (machine: Machine) => void;
  onAskAI: (initialPrompt?: string) => void;
  onViewWorkOrders: () => void;
  onViewSpareParts: () => void;
  onOpenCreateWorkOrder?: (prefilled?: any) => void;
}

export const ScanMachineView: React.FC<ScanMachineViewProps> = ({
  machines = [],
  activeMachine,
  onSelectMachine,
  onAskAI,
  onViewWorkOrders,
  onViewSpareParts,
  onOpenCreateWorkOrder,
}) => {
  // State for Floating QR Scanner Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [flashLight, setFlashLight] = useState(false);
  const [soundBeep, setSoundBeep] = useState(true);
  // Distinct-failure copy for "not-found": replaced on each new mismatched
  // code, never appended, so repeated mis-scans don't spam the modal.
  const [scanNotFoundText, setScanNotFoundText] = useState<string | null>(null);
  const [customPromptText, setCustomPromptText] = useState("");

  // Manual code-entry fallback — lets a technician type รหัสเครื่องจักร by hand when
  // the camera scan itself won't cooperate (bad focus/lighting, damaged label, or the
  // camera can't even start). Funnels through handleQrDecode below so a typed code
  // and a scanned code end up in the exact same success/not-found path.
  const [manualEntryOpen, setManualEntryOpen] = useState(false);
  const [manualCodeText, setManualCodeText] = useState("");
  const [manualEmptyError, setManualEmptyError] = useState(false);

  // Play a short beep via WebAudio — no audio asset file to ship or load.
  const playBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
      oscillator.onended = () => ctx.close();
    } catch {
      // Some browsers block audio without a prior user gesture — a missing
      // beep is not worth failing the scan over.
    }
  };

  // Timer id for the success → onSelectMachine hand-off below. Tracked in a ref
  // so it can be cancelled if the modal is closed (or the component unmounts)
  // during the 600ms window — otherwise onSelectMachine/setIsQrModalOpen(true)
  // could fire after the user already dismissed the scanner.
  const scanSuccessTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scanSuccessTimeoutRef.current) {
        clearTimeout(scanSuccessTimeoutRef.current);
        scanSuccessTimeoutRef.current = null;
      }
    };
  }, []);

  // Real camera QR decode → machine match. Only runs while the modal is open,
  // so the camera never stays on in the background.
  const handleQrDecode = (text: string) => {
    if (scanSuccess) return; // already matched — ignore further frames until modal closes
    const { machine, normalized } = resolveMachineFromQr(text, machines);
    if (!machine) {
      setScanNotFoundText(normalized);
      return;
    }
    setScanNotFoundText(null);
    setManualEntryOpen(false);
    setManualCodeText("");
    setScanSuccess(true);
    if (soundBeep) playBeep();
    navigator.vibrate?.(80);
    if (scanSuccessTimeoutRef.current) clearTimeout(scanSuccessTimeoutRef.current);
    scanSuccessTimeoutRef.current = setTimeout(() => {
      scanSuccessTimeoutRef.current = null;
      onSelectMachine?.(machine);
      setScanSuccess(false);
      setIsQrModalOpen(false);
    }, 600);
  };

  const {
    videoRef,
    status: scanStatus,
    error: scanError,
    torchSupported,
    cameras,
    activeCameraId,
    selectCamera,
    retry: retryScan,
  } = useQrScanner({
    // Manual entry takes over the camera slot entirely — stop the stream while
    // it's open instead of leaving the camera running behind the form.
    enabled: isQrModalOpen && !scanSuccess && !manualEntryOpen,
    onDecode: handleQrDecode,
    torch: flashLight,
  });

  // Close the scanner modal from a user action (X button, footer button, or the
  // Modal's own onClose). Also cancels any pending success hand-off timer so a
  // scan matched just before closing never fires onSelectMachine afterwards.
  const closeQrModal = () => {
    if (scanSuccessTimeoutRef.current) {
      clearTimeout(scanSuccessTimeoutRef.current);
      scanSuccessTimeoutRef.current = null;
    }
    setIsQrModalOpen(false);
    setManualEntryOpen(false);
    setManualCodeText("");
    setManualEmptyError(false);
  };

  // Whenever the camera itself fails for any reason (permission denied, no
  // camera found, camera busy, or plain unsupported/insecure), surface the
  // typed-code fallback automatically instead of leaving the technician stuck
  // on a dead camera screen.
  useEffect(() => {
    if (scanStatus === "error") setManualEntryOpen(true);
  }, [scanStatus]);

  // Manual code submit: same validation-then-lookup path a scanned code takes,
  // just triggered from the form instead of a decoded frame.
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualCodeText.trim().toUpperCase();
    if (!trimmed) {
      setManualEmptyError(true);
      return;
    }
    setManualEmptyError(false);
    handleQrDecode(trimmed);
  };

  // In-page tab: overview (identity, alerts, actions) vs sensors & timeline
  const [activeTab, setActiveTab] = useState<"overview" | "detail">("overview");

  // Real maintenance history for the active machine.
  //
  // This used to filter the already-loaded `workOrders` on
  // `wo.machineId === activeMachine.id` and showed 0 ใบงาน for every machine in
  // the plant: all 8,589 imported work orders have `machine_id = null` (the
  // import never resolved the FK — see types.ts), they only carry `machineCode`.
  // On top of that, `workOrders` is a shared, paginated slice of ~100 rows, so
  // even a correct key could only ever have matched a sliver of the table.
  //
  // Fetch by machine code instead, exactly as SupervisorDashboardView does. Three
  // of the 973 machines have no code at all — for those there is nothing to query
  // with, so skip the request entirely rather than sending `machineCode=null` and
  // matching arbitrary rows.
  const machineCode = activeMachine.code;
  const [machineHistory, setMachineHistory] = useState<WorkOrder[]>([]);
  const [machineHistoryTotal, setMachineHistoryTotal] = useState(0);
  const [machineHistoryOffset, setMachineHistoryOffset] = useState(0);
  const [machineHistoryLoading, setMachineHistoryLoading] = useState(false);
  const [machineHistoryError, setMachineHistoryError] = useState<string | null>(null);

  // สแกน/เลือกเครื่องใหม่ -> กลับไปหน้าแรกของประวัติซ่อมเสมอ
  useEffect(() => {
    setMachineHistoryOffset(0);
  }, [machineCode]);

  useEffect(() => {
    if (!machineCode) {
      // No code on record: nothing to look the history up by. Render the honest
      // empty state, never a spinner that would hang forever.
      setMachineHistory([]);
      setMachineHistoryTotal(0);
      setMachineHistoryLoading(false);
      setMachineHistoryError(null);
      return;
    }

    let cancelled = false;
    setMachineHistoryLoading(true);
    setMachineHistoryError(null);

    getWorkOrders({ machineCode, limit: MACHINE_HISTORY_LIMIT, offset: machineHistoryOffset })
      .then((res) => {
        if (cancelled) return;
        // The server already returns newest-first (ordered by assigned_date, see
        // backend/src/routes/workOrders.ts) — re-sorting here would only fight it.
        setMachineHistory(res.data);
        setMachineHistoryTotal(res.meta?.total ?? res.data.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setMachineHistory([]);
        setMachineHistoryTotal(0);
        setMachineHistoryError(toUserMessage(err, "ไม่สามารถโหลดประวัติการซ่อมได้"));
      })
      .finally(() => {
        if (!cancelled) setMachineHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [machineCode, machineHistoryOffset]);

  // Real machines may have no code on record (3/973) — never render the
  // literal "null" for it; every interpolation below reuses this one label.
  const machineCodeLabel = orDash(activeMachine.code);

  // Helper check for abnormal telemetry values — single source of truth in lib/thresholds
  const spindleLevel = spindleTempLevel(activeMachine.spindleTemp);
  const vibrationLevelValue = vibrationLevel(activeMachine.vibrationMms);
  const isSpindleTempHigh = spindleLevel !== "normal";
  const isVibrationHigh = vibrationLevelValue !== "normal";
  const evaluation = evaluateMachine(activeMachine);
  const isMachineAbnormal = evaluation.status !== "normal";

  // Which readings this machine actually reports. The plant has no IoT sensors
  // wired up (spindle temperature, vibration and operating hours have no source
  // column at all — see lib/thresholds.ts), so those cards would be boxes of
  // dashes on a screen a technician acts on. Hide them while the data is absent;
  // every one returns by itself the moment a real value arrives.
  const readings = readingAvailability([activeMachine]);
  const isPmOverdue = isOverdueDate(activeMachine.nextMaintenance);

  // Cards actually rendered in the condition grid on the "เซนเซอร์และไทม์ไลน์" tab:
  // the condition index and the PM-dates card always, each sensor card only when
  // it has a reading that is not already shown in the alert ribbon above.
  const detailCardCount =
    2 +
    (readings.spindleTemp && !isSpindleTempHigh ? 1 : 0) +
    (readings.vibrationMms && !isVibrationHigh ? 1 : 0) +
    (readings.operatingHours ? 1 : 0);

  // Severity vocabulary for the alert card below — reuses the same rose/amber/blue
  // ramp as the machine-status pills elsewhere in the app, so "ผิดปกติ" always means
  // the same color everywhere. A scheduled maintenance window is informational
  // (blue), not an emergency, and must not read as an urgent red alarm.
  const alertSeverity =
    evaluation.status === "error"
      ? {
          icon: AlertOctagon,
          label: "ต้องหยุดเครื่องตรวจสอบ",
          sectionHeading: "พบสภาวะผิดปกติที่ต้องแก้ไขด่วน",
          surface: "bg-rose-50 border-rose-200",
          iconWrap: "bg-rose-600 text-white",
          badge: "bg-rose-600 text-white",
          codeBadge: "bg-white text-rose-700 border border-rose-200",
          heading: "text-rose-950",
          accent: "text-rose-600",
          hint: "ขั้นตอนถัดไป: กดปุ่มด้านล่างเพื่อเปิดใบงานซ่อมด่วนและแจ้งช่างเข้าตรวจสอบทันที",
          // Work-order copy/priority must agree with the section's own urgency —
          // an "error" reading is the only case that justifies an urgent ticket.
          workOrderTitlePrefix: "ซ่อมด่วน",
          workOrderPriority: "high" as WorkOrder["priority"],
          ctaSubtitleFallback: `แจ้งซ่อมด่วนเครื่อง ${machineCodeLabel} พร้อมระบุอาการและอะไหล่ที่ต้องใช้`,
          ctaLabel: "เปิดใบงานด่วน",
        }
      : evaluation.status === "warning"
      ? {
          icon: AlertTriangle,
          label: "ควรเฝ้าระวังใกล้ชิด",
          sectionHeading: "พบค่าพารามิเตอร์ที่ควรเฝ้าระวัง",
          surface: "bg-amber-50 border-amber-200",
          iconWrap: "bg-amber-500 text-white",
          badge: "bg-amber-500 text-white",
          codeBadge: "bg-white text-amber-800 border border-amber-200",
          heading: "text-amber-950",
          accent: "text-amber-700",
          hint: "ขั้นตอนถัดไป: เฝ้าติดตามค่าอย่างใกล้ชิด หรือเปิดใบงานให้ช่างเข้าตรวจสอบก่อนเครื่องหยุดทำงาน",
          workOrderTitlePrefix: "ตรวจสอบ",
          workOrderPriority: "medium" as WorkOrder["priority"],
          ctaSubtitleFallback: `แจ้งช่างเข้าตรวจสอบเครื่อง ${machineCodeLabel} ก่อนเครื่องหยุดทำงาน`,
          ctaLabel: "เปิดใบงานตรวจสอบ",
        }
      : {
          icon: Wrench,
          label: "ตามแผนซ่อมบำรุง",
          sectionHeading: "เครื่องอยู่ระหว่างการซ่อมบำรุงตามแผน",
          surface: "bg-blue-50 border-blue-200",
          iconWrap: "bg-blue-500 text-white",
          badge: "bg-blue-500 text-white",
          codeBadge: "bg-white text-blue-800 border border-blue-200",
          heading: "text-blue-950",
          accent: "text-blue-700",
          hint: "",
          workOrderTitlePrefix: "งานซ่อมบำรุงตามแผน",
          workOrderPriority: "low" as WorkOrder["priority"],
          ctaSubtitleFallback: `เปิดใบงานซ่อมบำรุงตามแผนสำหรับเครื่อง ${machineCodeLabel}`,
          ctaLabel: "เปิดใบงานซ่อมบำรุง",
        };
  const SeverityIcon = alertSeverity.icon;

  // Headline text for the alert card — falls back to the first evaluation reason
  // when there's no explicit error description. The reasons list below must not
  // repeat whichever sentence ends up as the headline (see visibleReasons).
  const headlineText =
    activeMachine.activeErrorDesc ||
    evaluation.reasons[0] ||
    "พบค่าพารามิเตอร์ผิดปกติเกินเกณฑ์ความปลอดภัย";
  const usedReasonZeroAsHeadline =
    !activeMachine.activeErrorDesc && Boolean(evaluation.reasons[0]);
  const visibleReasons = (
    usedReasonZeroAsHeadline ? evaluation.reasons.slice(1) : evaluation.reasons
  ).filter((reason) => reason !== headlineText);

  // One fallback prompt for the AI input — Enter and the send button must never
  // send different questions for the same empty field.
  //
  // The prompt lists only readings that exist. "อุณหภูมิ Spindle —°C" gave the
  // model a dangling unit around a dash and invited it to fill the number back in;
  // with no sensors at all, the machine's repair history is the real subject.
  const machineFacts = (): string[] => {
    const facts: string[] = [];
    if (activeMachine.spindleTemp != null)
      facts.push(`อุณหภูมิ Spindle ${activeMachine.spindleTemp}°C`);
    if (activeMachine.vibrationMms != null)
      facts.push(`ค่าสั่นสะเทือน ${activeMachine.vibrationMms} mm/s`);
    if (activeMachine.healthScore != null)
      facts.push(`ดัชนีสุขภาพเครื่อง ${activeMachine.healthScore}%`);
    if (isPmOverdue)
      facts.push(`PM ${overdueLabel(activeMachine.nextMaintenance)} (กำหนด ${activeMachine.nextMaintenance})`);
    return facts;
  };

  const sendAiPrompt = () => {
    const facts = machineFacts();
    const fallback =
      facts.length > 0
        ? `วิเคราะห์สภาพล่าสุดของเครื่อง ${machineCodeLabel}: ${facts.join(", ")}`
        : `วิเคราะห์สภาพเครื่อง ${machineCodeLabel} (${activeMachine.name}) จากประวัติการซ่อมที่ผ่านมา — เครื่องนี้ยังไม่มีค่าจากเซนเซอร์`;
    onAskAI(customPromptText.trim() || fallback);
    setCustomPromptText("");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative pb-28">
      {/* 1. TOP HEADER & MACHINE SWITCHER BANNER */}
      <div className="bg-white rounded-[18px] border border-hairline p-5 md:p-6 flex flex-col space-y-4">
        <div className="border-b border-divider pb-4 space-y-2.5">
          <div className="max-w-md">
            <MachineSelect
              machines={machines}
              activeMachine={activeMachine}
              onSelectMachine={(m) => onSelectMachine?.(m)}
            />
          </div>
        </div>

        {/* Machine Identity Info Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="bg-divider p-3.5 rounded-[18px] border border-divider">
            <span className="text-xs font-semibold text-ink-faint block">
              รหัสและชื่อเครื่องจักร
            </span>
            <div className="font-semibold text-ink text-sm md:text-base mt-0.5 truncate">
              {machineCodeLabel}: {activeMachine.name}
            </div>
            <span className="text-xs text-ink-faint block truncate">
              {orDash(activeMachine.model)}
            </span>
          </div>

          <div className="bg-divider p-3.5 rounded-[18px] border border-divider">
            <span className="text-xs font-semibold text-ink-faint block">
              ตำแหน่งติดตั้ง
            </span>
            <div className="font-semibold text-ink-muted text-xs md:text-sm mt-1 truncate">
              {orDash(activeMachine.location)}
            </div>
            {/* An overdue PM must not look like any other date on the card —
                106 of the 587 scheduled dates are already in the past. */}
            <span
              className={`text-xs block mt-0.5 ${
                isPmOverdue ? "font-semibold text-amber-700" : "text-ink-faint"
              }`}
            >
              รอบ PM ถัดไป: {formatDate(activeMachine.nextMaintenance)}
              {isPmOverdue ? ` · ${overdueLabel(activeMachine.nextMaintenance)}` : ""}
            </span>
          </div>

          <div className="bg-divider p-3.5 rounded-[18px] border border-divider">
            <span className="text-xs font-semibold text-ink-faint block">
              สถานะการทำงานปัจจุบัน
            </span>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={machineStatusDotClass(activeMachine.status)} />
              <span
                className={`text-sm font-semibold ${machineStatusTextClass(activeMachine.status)}`}
              >
                {machineStatusLabel(activeMachine.status)}
              </span>
            </div>
          </div>

          {/* Fourth identity slot. Operating hours have no source column at all,
              so rather than leave a card reading "— ชม." (which a technician can
              read as "the counter is at zero"), the slot carries the last-repair
              date — real, derived from this machine's own work orders. The hours
              card comes back on its own if a runtime counter is ever wired up. */}
          {readings.operatingHours ? (
            <div className="bg-divider p-3.5 rounded-[18px] border border-divider flex flex-col justify-between">
              <span className="text-xs font-semibold text-ink-faint block">
                ชั่วโมงสะสมเครื่อง
              </span>
              <div className="font-semibold text-ink text-base md:text-lg">
                {activeMachine.operatingHours!.toLocaleString("th-TH")}{" "}
                <span className="text-xs font-normal text-ink-faint">ชม.</span>
              </div>
              <span className="text-xs text-ink-faint block">
                ซ่อมบำรุงล่าสุด: {formatDate(activeMachine.lastMaintenance)}
              </span>
            </div>
          ) : (
            <div className="bg-divider p-3.5 rounded-[18px] border border-divider flex flex-col justify-between">
              <span className="text-xs font-semibold text-ink-faint block">
                ซ่อมบำรุงล่าสุด
              </span>
              <div className="font-semibold text-ink text-base md:text-lg">
                {formatDate(activeMachine.lastMaintenance)}
              </div>
              {/* Deliberately NOT machineHistory.length: imported work orders carry
                  no machine_id, so that count reads 0 for machines that plainly do
                  have a repair date. Say how long ago instead — same source field,
                  no derived number that can contradict the date above it. */}
              <span className="text-xs text-ink-faint block">
                {daysSinceLabel(activeMachine.lastMaintenance) ?? "ยังไม่มีบันทึกการซ่อมบำรุง"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. ABNORMALITIES & ALERTS — always visible, most prominent when abnormal.
          Severity (error / warning / maintenance) drives color and copy so a
          scheduled PM window never reads as an urgent red emergency, and the
          fix-it action stays the one clearly dominant thing on screen. */}
      {isMachineAbnormal && (
        <div className="space-y-4">
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-hairline pb-2"
          >
            <div className="flex items-center gap-2">
              <SeverityIcon className={`w-5 h-5 ${alertSeverity.accent}`} />
              <h2 className="text-lg font-semibold text-ink-muted">
                {alertSeverity.sectionHeading}
              </h2>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${alertSeverity.badge}`}
            >
              {alertSeverity.label}
            </span>
          </div>

          <div
            className={`rounded-[18px] border p-5 md:p-6 space-y-5 animate-in fade-in duration-300 ${alertSeverity.surface}`}
          >
            {/* What's wrong, in plain Thai — error code + headline stay scannable
                at a glance, full reasons list underneath for anyone who wants detail.
                role="alert" here (not on the whole card) so a screen reader announces
                only the problem statement, not the CTAs and sensor cards below. */}
            <div role="alert" className="flex items-start gap-3.5">
              <div className={`p-3 rounded-full shrink-0 ${alertSeverity.iconWrap}`}>
                <SeverityIcon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                {activeMachine.activeErrorCode && (
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${alertSeverity.codeBadge}`}
                  >
                    {activeMachine.activeErrorCode}
                  </span>
                )}
                <h3 className={`font-semibold text-base md:text-lg leading-snug ${alertSeverity.heading}`}>
                  {headlineText}
                </h3>
                {visibleReasons.length > 0 && (
                  <ul className="text-xs md:text-sm text-ink-muted font-normal space-y-0.5 list-disc list-inside">
                    {visibleReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                )}
                {alertSeverity.hint && (
                  <p className={`text-xs font-semibold pt-0.5 ${alertSeverity.accent}`}>
                    {alertSeverity.hint}
                  </p>
                )}
              </div>
            </div>

            {/* Primary action: the ticket that fixes this must be the most prominent thing on screen */}
            <GloveFriendlyCTA
              machineName={`${machineCodeLabel} ${activeMachine.name}`}
              label={alertSeverity.ctaLabel}
              subtitle={
                activeMachine.activeErrorDesc ||
                evaluation.reasons[0] ||
                alertSeverity.ctaSubtitleFallback
              }
              onClick={() =>
                onOpenCreateWorkOrder &&
                onOpenCreateWorkOrder({
                  machineId: activeMachine.id,
                  title: `${alertSeverity.workOrderTitlePrefix}: ${activeMachine.activeErrorCode || "ความผิดปกติ"} เครื่อง ${machineCodeLabel}`,
                  description: `พบสภาวะผิดปกติประจำเครื่อง ${activeMachine.name} (${machineCodeLabel})\n${activeMachine.activeErrorDesc || evaluation.reasons.join("\n")}`,
                  priority: alertSeverity.workOrderPriority,
                })
              }
            />

            {/* Secondary action — visibly lighter than the primary CTA so the two
                never compete for the same attention */}
            <div className="flex justify-center">
              <button
                onClick={() =>
                  onAskAI(
                    `วิเคราะห์สาเหตุและวิธีแก้อาการ${
                      activeMachine.activeErrorCode
                        ? ` ${activeMachine.activeErrorCode}:`
                        : ""
                    } ${activeMachine.activeErrorDesc || evaluation.reasons[0] || "ความผิดปกติ"} ของเครื่อง ${machineCodeLabel}`
                  )
                }
                className="min-h-11 px-4 rounded-full text-xs font-semibold text-ink-muted hover:text-primary hover:bg-white/60 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>ถาม MT Center AI เกี่ยวกับอาการนี้</span>
              </button>
            </div>

            {/* Abnormal parameter detail — one flattened card per breached sensor,
                colored by its own level so a "warning" reading isn't shown as red */}
            {(isSpindleTempHigh || isVibrationHigh) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spindle Temp Card if abnormal */}
                {isSpindleTempHigh && (
                  <div
                    className={`bg-white rounded-[18px] border p-5 flex flex-col justify-between space-y-3 ${
                      spindleLevel === "error" ? "border-rose-300" : "border-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full ${
                            spindleLevel === "error"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <Thermometer className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-ink-muted text-sm">
                          อุณหภูมิ Spindle
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          spindleLevel === "error"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {spindleLevel === "error" ? "ผิดปกติ" : "เฝ้าระวัง"} (+
                        {(
                          // spindleTempLevel(null) always returns "normal", so this
                          // branch (isSpindleTempHigh) only ever renders when the
                          // reading is a real number — see lib/thresholds.ts.
                          activeMachine.spindleTemp! -
                          (spindleLevel === "error"
                            ? SPINDLE_TEMP_ERROR
                            : SPINDLE_TEMP_WARNING)
                        ).toFixed(1)}
                        °C)
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-xs text-ink-faint block font-normal">
                          ค่าปัจจุบัน
                        </span>
                        <div
                          className={`text-3xl md:text-4xl font-semibold tracking-[-0.02em] ${
                            spindleLevel === "error" ? "text-rose-600" : "text-amber-600"
                          }`}
                        >
                          {formatDecimal(activeMachine.spindleTemp)} <span className="text-lg">°C</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-ink-faint block font-normal">
                          เกณฑ์เฝ้าระวัง
                        </span>
                        <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block mt-0.5">
                          ≥ {SPINDLE_TEMP_WARNING} °C
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-ink-muted font-normal pt-2 border-t border-divider">
                      <Info
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          spindleLevel === "error" ? "text-rose-600" : "text-amber-700"
                        }`}
                      />
                      <span>ความเสี่ยง: ลูกปืน Spindle เสียดสีสูง เสี่ยงติดขัดชำรุด</span>
                    </div>
                  </div>
                )}

                {/* Vibration Card if abnormal */}
                {isVibrationHigh && (
                  <div
                    className={`bg-white rounded-[18px] border p-5 flex flex-col justify-between space-y-3 ${
                      vibrationLevelValue === "error" ? "border-rose-300" : "border-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full ${
                            vibrationLevelValue === "error"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <Activity className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-ink-muted text-sm">
                          ระดับการสั่นสะเทือน
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          vibrationLevelValue === "error"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {vibrationLevelValue === "error" ? "ผิดปกติ" : "เฝ้าระวัง"} (+
                        {(
                          // vibrationLevel(null) always returns "normal", so this
                          // branch (isVibrationHigh) only ever renders when the
                          // reading is a real number — see lib/thresholds.ts.
                          activeMachine.vibrationMms! -
                          (vibrationLevelValue === "error"
                            ? VIBRATION_ERROR
                            : VIBRATION_WARNING)
                        ).toFixed(1)}{" "}
                        mm/s)
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-xs text-ink-faint block font-normal">
                          ค่าปัจจุบัน
                        </span>
                        <div
                          className={`text-3xl md:text-4xl font-semibold tracking-[-0.02em] ${
                            vibrationLevelValue === "error" ? "text-rose-600" : "text-amber-600"
                          }`}
                        >
                          {formatDecimal(activeMachine.vibrationMms)} <span className="text-lg">mm/s</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-ink-faint block font-normal">
                          เกณฑ์เฝ้าระวัง
                        </span>
                        <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block mt-0.5">
                          ≥ {VIBRATION_WARNING} mm/s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-ink-muted font-normal pt-2 border-t border-divider">
                      <Info
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          vibrationLevelValue === "error" ? "text-rose-600" : "text-amber-700"
                        }`}
                      />
                      <span>ความเสี่ยง: พบการสั่นสะเทือนผิดปกติในชุดเฟืองขับเคลื่อน</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. IN-PAGE TABS: overview vs sensors & timeline */}
      <div
        role="tablist"
        aria-label="มุมมองข้อมูลเครื่องจักร"
        className="flex items-center gap-1.5 bg-divider p-1 rounded-full self-start w-fit"
      >
        <button
          role="tab"
          aria-selected={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 min-h-11 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "overview"
              ? "bg-white text-primary"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>ภาพรวม</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "detail"}
          onClick={() => setActiveTab("detail")}
          className={`px-4 py-2 min-h-11 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "detail"
              ? "bg-white text-primary"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{readings.anySensor ? "เซนเซอร์และไทม์ไลน์" : "สภาพเครื่องและประวัติซ่อม"}</span>
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* 4. TECHNICIAN QUICK ACTIONS + EMERGENCY WORK ORDER */}
          <div className="bg-white rounded-[18px] border border-hairline p-6 space-y-4">
            <h3 className="text-base font-semibold text-ink flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>ทางลัดสำหรับช่างซ่อมบำรุง</span>
            </h3>

            {/* When the machine is abnormal the alert ribbon above already carries
                the full-size CTA. Two 200px primary buttons on one screen would
                cancel each other out, so this one steps down to a compact action. */}
            {isMachineAbnormal ? (
              <button
                onClick={() =>
                  onOpenCreateWorkOrder &&
                  onOpenCreateWorkOrder({
                    machineId: activeMachine.id,
                    priority: "high",
                  })
                }
                className="w-full min-h-11 px-4 py-2.5 rounded-full border border-hairline bg-white hover:border-primary hover:bg-primary/5 text-ink-muted hover:text-primary font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
              >
                <FilePlus className="w-4 h-4 text-primary" />
                <span>เปิดใบงานซ่อมเครื่อง {machineCodeLabel}</span>
              </button>
            ) : (
              <GloveFriendlyCTA
                machineName={`${machineCodeLabel} ${activeMachine.name}`}
                onClick={() =>
                  onOpenCreateWorkOrder &&
                  onOpenCreateWorkOrder({
                    machineId: activeMachine.id,
                    priority: "high",
                  })
                }
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={onViewWorkOrders}
                className="p-5 rounded-[18px] border border-hairline hover:border-primary hover:bg-primary/5 transition-all text-left flex items-start justify-between group cursor-pointer active:scale-95"
              >
                <div>
                  <div className="font-semibold text-ink text-base">
                    ตรวจสอบใบงานของฉัน
                  </div>
                  <p className="text-xs text-ink-faint mt-1">
                    เปิดรายการใบงานของฉันทั้งหมด (ยังไม่กรองเฉพาะเครื่องนี้)
                  </p>
                </div>
                <div className="p-2.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={onViewSpareParts}
                className="p-5 rounded-[18px] border border-hairline hover:border-primary hover:bg-primary/5 transition-all text-left flex items-start justify-between group cursor-pointer active:scale-95"
              >
                <div>
                  <div className="font-semibold text-ink text-base flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" />
                    <span>เช็คสต็อกอะไหล่ / ตำแหน่งตู้เก็บ</span>
                  </div>
                  <p className="text-xs text-ink-faint mt-1">
                    เปิดคลังอะไหล่ทั้งโรงงาน แล้วค้นหาอะไหล่ที่ต้องใช้เอง
                  </p>
                </div>
                <div className="p-2.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* 5. ASK AI SECTION */}
          <div className="bg-white border border-hairline rounded-[18px] p-5 md:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-full bg-primary text-white shrink-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base md:text-lg font-semibold text-ink">
                      ผู้ช่วย AI ถามตอบปัญหาเครื่องจักรและคู่มือซ่อมบำรุง
                    </h2>
                    <span className="rounded-full bg-primary/10 border border-hairline text-xs text-ink-muted px-2.5 py-1 font-mono">
                      เครื่อง: {machineCodeLabel} ({activeMachine.name})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-ink-faint">
                      MT Center AI พร้อมใช้งาน
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full text-xs px-2.5 py-1 border ${
                    isMachineAbnormal
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isMachineAbnormal ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                  {isMachineAbnormal ? "พบอาการผิดปกติ" : "เครื่องสภาวะปกติ"}
                </span>
              </div>
            </div>

            {/* Quick Suggestion Prompt Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-faint block">
                คำถามที่ใช้บ่อย:
              </span>
              <div className="flex flex-wrap gap-2">
                {isMachineAbnormal && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskAI(
                        [
                          `วิเคราะห์อาการผิดปกติของเครื่อง ${machineCodeLabel} (${activeMachine.name})`,
                          machineFacts().join(", "),
                          "ขอขั้นตอนแก้ไขและอะไหล่ที่ต้องใช้",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      )
                    }
                    className="rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-xs text-rose-600 px-3.5 py-2.5 min-h-11 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>วิเคราะห์สาเหตุความผิดปกติของ {machineCodeLabel}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onAskAI(
                      `ขอขั้นตอนการตรวจสอบและซ่อมบำรุง Spindle เครื่อง ${machineCodeLabel} (${activeMachine.name}) พร้อมคู่มือความปลอดภัย LOTO`
                    )
                  }
                  className="rounded-full border border-hairline bg-white hover:border-primary/40 hover:bg-primary/5 text-xs text-ink-muted px-3.5 py-2.5 min-h-11 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-primary" />
                  <span>เช็กลิสต์ซ่อมบำรุง Spindle และความปลอดภัย LOTO</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskAI(
                      `ค้นหารายการอะไหล่สำรองและเบอร์ Spindle Bearing สำหรับเครื่อง ${machineCodeLabel} ในคลัง`
                    )
                  }
                  className="rounded-full border border-hairline bg-white hover:border-primary/40 hover:bg-primary/5 text-xs text-ink-muted px-3.5 py-2.5 min-h-11 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <span>เช็ครายการอะไหล่และตู้เก็บ</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAskAI(
                      `ขอข้อมูลสเปค Controller และค่ามาตรฐานพารามิเตอร์ของเครื่อง ${machineCodeLabel}`
                    )
                  }
                  className="rounded-full border border-hairline bg-white hover:border-primary/40 hover:bg-primary/5 text-xs text-ink-muted px-3.5 py-2.5 min-h-11 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span>สเปก Controller และค่าพารามิเตอร์มาตรฐาน</span>
                </button>
              </div>
            </div>

            {/* Interactive Query Input Bar */}
            <div className="pt-1">
              <div className="flex items-center gap-2 rounded-full border border-hairline bg-white focus-within:ring-2 focus-within:ring-primary-focus/40 px-4 py-2 w-full">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <input
                  type="text"
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder={`พิมพ์คำถามเรื่องการซ่อมบำรุง รหัสข้อผิดพลาด หรือคู่มือเครื่อง ${machineCodeLabel}...`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendAiPrompt();
                  }}
                  className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-faint"
                />

                <button
                  type="button"
                  onClick={sendAiPrompt}
                  className="shrink-0 h-10 w-10 rounded-full bg-primary hover:bg-primary-focus text-white flex items-center justify-center active:scale-95 transition-all"
                  aria-label="ถาม MT Center AI"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "detail" && (
        <>
          {/* 6. TELEMETRY METRICS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-600" />
                {/* Don't promise "พารามิเตอร์" when no parameter is being measured —
                    an orphaned heading over two derived cards reads as data lost. */}
                <h2 className="text-lg font-semibold text-ink-muted">
                  {readings.anySensor
                    ? "พารามิเตอร์และดัชนีการทำงาน"
                    : "ดัชนีสภาพเครื่องและรอบซ่อมบำรุง"}
                </h2>
              </div>
            </div>

            {/* Sensor cards join this grid only when the machine reports a real
                reading; the condition index and the PM-dates card always render,
                so the row is never empty and the column count always matches the
                number of cards (no trailing gaps). */}
            <div className={`grid grid-cols-2 gap-4 ${DETAIL_GRID_COLS[detailCardCount]}`}>
              {/* Spindle Temp (If Normal) */}
              {readings.spindleTemp && !isSpindleTempHigh && (
                <div className="bg-white p-5 rounded-[18px] border border-hairline flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-faint">
                      อุณหภูมิ Spindle
                    </span>
                    <Thermometer className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl md:text-3xl font-semibold text-ink">
                    {formatDecimal(activeMachine.spindleTemp)} <span className="text-sm font-normal text-ink-faint">°C</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-divider">
                    <span className="text-ink-faint">เกณฑ์เฝ้าระวัง: ≥ {SPINDLE_TEMP_WARNING} °C</span>
                    {/* This card renders whenever the reading is NOT high — which
                        includes "there is no reading at all", since
                        spindleTempLevel(null) is "normal". A green ปกติ badge next
                        to a "—" would claim the sensor was checked and passed, so
                        say plainly that nothing was measured. */}
                    {activeMachine.spindleTemp == null ? (
                      <span className="text-ink-faint font-semibold bg-divider px-2 py-0.5 rounded">
                        {NO_DATA_TH}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        ปกติ
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Vibration (If Normal) */}
              {readings.vibrationMms && !isVibrationHigh && (
                <div className="bg-white p-5 rounded-[18px] border border-hairline flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-faint">
                      ค่าสั่นสะเทือน
                    </span>
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl md:text-3xl font-semibold text-ink">
                    {formatDecimal(activeMachine.vibrationMms)} <span className="text-sm font-normal text-ink-faint">mm/s</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-divider">
                    <span className="text-ink-faint">เกณฑ์เฝ้าระวัง: ≥ {VIBRATION_WARNING} mm/s</span>
                    {/* Same reasoning as the spindle card above: no reading is not
                        a passing reading. */}
                    {activeMachine.vibrationMms == null ? (
                      <span className="text-ink-faint font-semibold bg-divider px-2 py-0.5 rounded">
                        {NO_DATA_TH}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        ปกติ
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Machine Health Score */}
              <div className="bg-white p-5 rounded-[18px] border border-hairline flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-faint">
                    ดัชนีสุขภาพเครื่อง
                  </span>
                  <Gauge className="w-4 h-4 text-primary" />
                </div>

                <div className="flex items-baseline gap-2">
                  {/* A missing score means "never repaired", which is why it must
                      not render as 0% and must not borrow the critical colour. */}
                  <div
                    className={`text-2xl md:text-3xl font-semibold ${
                      activeMachine.healthScore == null ? "text-ink-faint" : "text-ink"
                    }`}
                  >
                    {activeMachine.healthScore != null ? `${activeMachine.healthScore}%` : NO_DATA}
                  </div>
                  <span className="text-xs text-ink-faint font-normal">
                    {activeMachine.healthScore == null
                      ? NO_REPAIR_HISTORY_TH
                      : healthScoreLevel(activeMachine.healthScore) === "normal"
                      ? `อยู่ในเกณฑ์ปกติ (≥ ${HEALTH_SCORE_WARNING}%)`
                      : healthScoreLevel(activeMachine.healthScore) === "warning"
                      ? `ต่ำกว่าเกณฑ์เฝ้าระวัง ${HEALTH_SCORE_WARNING}%`
                      : `ต่ำกว่าเกณฑ์หยุดเครื่อง ${HEALTH_SCORE_ERROR}%`}
                  </span>
                </div>

                {/* With no score there is no bar to draw — a 0%-wide fill on an
                    empty track would read as "the bar bottomed out". */}
                {activeMachine.healthScore == null ? (
                  <div className="text-xs text-ink-faint pt-1 border-t border-divider">
                    ดัชนีนี้คำนวณจากประวัติซ่อมของเครื่อง — เครื่องนี้ยังไม่เคยมีใบงานซ่อม
                  </div>
                ) : (
                  <div
                    className="w-full bg-divider rounded-full h-2 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={activeMachine.healthScore}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="ดัชนีสุขภาพเครื่อง"
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        healthScoreLevel(activeMachine.healthScore) === "normal"
                          ? "bg-emerald-500"
                          : healthScoreLevel(activeMachine.healthScore) === "warning"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${activeMachine.healthScore}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Operating Hours — only when a runtime counter actually reports */}
              {readings.operatingHours && (
                <div className="bg-white p-5 rounded-[18px] border border-hairline flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-faint">
                      ชั่วโมงทำงานสะสม
                    </span>
                    <Clock className="w-4 h-4 text-ink-faint" />
                  </div>
                  <div className="text-2xl md:text-3xl font-semibold text-ink">
                    {activeMachine.operatingHours!.toLocaleString("th-TH")}{" "}
                    <span className="text-sm font-normal text-ink-faint">ชม.</span>
                  </div>
                </div>
              )}

              {/* PM dates — real, derived from repair history, and the card that
                  keeps this row meaningful now that the sensor cards are gone. */}
              <div
                className={`p-5 rounded-[18px] border flex flex-col justify-between space-y-2 ${
                  isPmOverdue ? "bg-amber-50 border-amber-200" : "bg-white border-hairline"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-faint">รอบซ่อมบำรุง (PM)</span>
                  <CalendarClock
                    className={`w-4 h-4 ${isPmOverdue ? "text-amber-700" : "text-ink-faint"}`}
                  />
                </div>
                <div
                  className={`text-2xl md:text-3xl font-semibold ${
                    isPmOverdue ? "text-amber-800" : "text-ink"
                  }`}
                >
                  {formatDate(activeMachine.nextMaintenance)}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-divider">
                  <span className="text-ink-faint">
                    PM ล่าสุด: {formatDate(activeMachine.lastMaintenance)}
                  </span>
                  {isPmOverdue && (
                    <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
                      {overdueLabel(activeMachine.nextMaintenance)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 7. MAINTENANCE HISTORY — derived from this machine's real work orders */}
          <div className="bg-white rounded-[18px] border border-hairline p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-divider pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-full bg-primary/10 text-primary border border-hairline">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    ประวัติงานซ่อมบำรุงของเครื่อง {machineCodeLabel}
                  </h3>
                  <p className="text-xs text-ink-faint mt-0.5">
                    PM ล่าสุด {formatDate(activeMachine.lastMaintenance)} · PM ถัดไป {formatDate(activeMachine.nextMaintenance)}
                  </p>
                </div>
              </div>

              {/* The count is the server's `meta.total`, not the number of rows on
                  screen — those differ as soon as a machine outgrows one page. */}
              <span className="text-xs font-semibold text-ink-muted bg-divider border border-divider px-3 py-1.5 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                {machineHistoryLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                )}
                {machineHistoryLoading ? "กำลังโหลด…" : `${machineHistoryTotal} ใบงาน`}
              </span>
            </div>

            {machineHistoryError && (
              <div
                role="alert"
                className="p-3.5 rounded-[11px] bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{machineHistoryError}</span>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto pr-1 sm:pr-2 space-y-3 relative">
              {machineHistoryLoading && machineHistory.length === 0 && !machineHistoryError ? (
                <SkeletonList count={5} />
              ) : machineHistory.length === 0 ? (
                // 229 machines genuinely have no work order on record, and 3 have no
                // code to look one up by. Both are a finished answer, not a failure —
                // say so plainly instead of leaving a spinner or a blank panel.
                !machineHistoryError && (
                  <div className="text-center py-10 space-y-2">
                    <Info className="w-6 h-6 text-ink-faint mx-auto" />
                    <p className="text-sm font-semibold text-ink">
                      ยังไม่มีประวัติซ่อมของเครื่องนี้ในระบบ
                    </p>
                    <p className="text-xs text-ink-faint">
                      {machineCode
                        ? `เมื่อมีการเปิดใบงานกับเครื่อง ${machineCodeLabel} ประวัติจะแสดงที่นี่`
                        : "เครื่องนี้ไม่มีรหัสเครื่องในระบบ จึงยังค้นประวัติซ่อมย้อนหลังให้ไม่ได้"}
                    </p>
                  </div>
                )
              ) : (
                machineHistory.map((wo) => (
                  <div
                    key={wo.id}
                    className="relative pl-7 sm:pl-9 before:absolute before:left-3 sm:before:left-4 before:top-8 before:bottom-0 before:w-0.5 before:bg-divider last:before:hidden"
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white ring-4 ring-white ${
                        wo.status === "completed"
                          ? "bg-emerald-600"
                          : wo.priority === "high"
                          ? "bg-rose-600"
                          : "bg-primary"
                      }`}
                    >
                      {wo.status === "completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-[18px] border border-divider bg-divider">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs sm:text-sm font-semibold text-primary">
                            {wo.code}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-ink">
                            {wo.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                          <Clock className="w-3.5 h-3.5 text-ink-faint" />
                          {/* The date the repair happened, not the row's import
                              timestamp — `updatedAt` is identical on all 8,589
                              imported rows and collapsed this whole timeline onto
                              one day. See workOrderDisplayDate. */}
                          <span className="tabular-nums">
                            {orDash(workOrderDisplayDate(wo))}
                          </span>
                          {workOrderFinishTime(wo) && (
                            <span className="tabular-nums font-normal text-ink-faint">
                              เสร็จ {workOrderFinishTime(wo)} น.
                            </span>
                          )}
                        </div>
                      </div>

                      {wo.description && (
                        <p className="text-xs text-ink-muted font-normal leading-relaxed mb-2">
                          {wo.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={woStatusPillClass(wo.status)}>
                          {woStatusLabel(wo.status)}
                        </span>
                        <span className={priorityPillClass(wo.priority)}>
                          {priorityLabel(wo.priority)}
                        </span>
                        {wo.technicianName && (
                          <span className="text-xs text-ink-muted">
                            ช่างผู้รับผิดชอบ: {wo.technicianName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

            </div>

            {/* แบ่งหน้าประวัติซ่อมของเครื่องนี้ — ใช้ total จริงจาก server แทนการตัด
                รายการทิ้งเงียบๆ เหมือนก่อนหน้านี้ (ดู SupervisorDashboardView) */}
            {machineHistoryTotal > 0 && (
              <Pagination
                offset={machineHistoryOffset}
                limit={MACHINE_HISTORY_LIMIT}
                total={machineHistoryTotal}
                onOffsetChange={setMachineHistoryOffset}
                isLoading={machineHistoryLoading}
                itemLabel="รายการ"
              />
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 8. FLOATING QR CODE SCANNER FAB BUTTON */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
        {/* Floating Scanner Button */}
        <button
          onClick={() => {
            setManualEntryOpen(false);
            setManualCodeText("");
            setManualEmptyError(false);
            setIsQrModalOpen(true);
          }}
          id="floating-qr-scan-button"
          aria-label="สแกน QR เครื่องจักร"
          className="group relative bg-primary hover:bg-primary-focus text-white px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 cursor-pointer transition-all active:scale-95"
        >
          <div className="relative p-1.5 sm:p-2 rounded-full bg-white/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <div className="relative text-left pr-1">
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              สแกน QR เครื่องจักร
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 9. MODAL / OVERLAY FOR QR CODE SCANNER / MACHINE PICKER */}
      {/* ========================================================================= */}
      {isQrModalOpen && (
        <Modal
          size="md"
          onClose={closeQrModal}
          panelClassName="bg-white text-ink border-hairline"
        >
          {/* Scan-beam sweep keyframes for the live viewfinder overlay */}
          <style>{`
            @keyframes qr-beam-sweep {
              0% { top: 8%; }
              50% { top: 88%; }
              100% { top: 8%; }
            }
          `}</style>

          {/* Modal Header */}
          <ModalHeader className="bg-divider border-hairline">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-primary text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-ink">
                    สแกน QR Code ประจำเครื่อง
                  </h3>
                  <p className="text-xs text-ink-faint">
                    วางป้าย QR Code บนตัวเครื่องให้อยู่ในกรอบกล้อง
                  </p>
                </div>
              </div>

              <button
                onClick={closeQrModal}
                aria-label="ปิดหน้าต่าง"
                className="p-2 rounded-full text-ink-faint hover:text-ink-muted hover:bg-primary/5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </ModalHeader>

          <ModalBody className="flex flex-col items-center space-y-5">
            {!manualEntryOpen && (
              <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[340px] rounded-2xl overflow-hidden bg-black border-2 border-hairline">
                {/* Live camera feed — only mounted while the modal is open (enabled
                    in useQrScanner), so the camera never runs in the background. */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Scan-beam sweep overlay while actively scanning */}
                {scanStatus === "scanning" && !scanSuccess && (
                  <div
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                    style={{ animation: "qr-beam-sweep 2s ease-in-out infinite" }}
                  />
                )}

                {/* Success overlay */}
                {scanSuccess && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-2 text-emerald-400 bg-black/60 animate-in zoom-in-95">
                    <CheckCircle2 className="w-14 h-14" />
                    <span className="text-sm font-semibold text-white">สแกนสำเร็จ</span>
                  </div>
                )}

                {/* Helper copy while scanning normally (no error, no success yet) */}
                {scanStatus === "scanning" && !scanSuccess && (
                  <div className="absolute bottom-3 left-0 right-0 z-10 text-center px-4">
                    <span className="text-xs font-semibold text-white/90 bg-black/40 rounded-full px-3 py-1">
                      วางป้าย QR Code ให้อยู่ในกรอบ
                    </span>
                  </div>
                )}

                {/* Starting state */}
                {scanStatus === "starting" && !scanSuccess && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-white/80 bg-black/40">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-semibold">กำลังเปิดกล้อง...</span>
                  </div>
                )}

                {/* Error state — distinct Thai copy per error.code, plus retry.
                    manualEntryOpen is set automatically on any camera error, so in
                    practice this screen is only seen briefly before the manual
                    code-entry form below takes over. */}
                {scanStatus === "error" && scanError && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center px-5 bg-black/85">
                    <CameraOff className="w-9 h-9 text-white/70" />
                    <p className="text-xs text-white/90 leading-relaxed">
                      {scanError.message}
                    </p>
                    <button
                      onClick={retryScan}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 min-h-9 cursor-pointer active:scale-95 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>ลองอีกครั้ง</span>
                    </button>
                  </div>
                )}

                {/* Inline not-found message — replaced on each new distinct mismatch,
                    scanning keeps running underneath */}
                {scanNotFoundText && scanStatus === "scanning" && !scanSuccess && (
                  <div className="absolute top-3 left-3 right-3 z-10 rounded-xl bg-rose-600/90 text-white text-xs font-semibold px-3 py-2 flex items-center justify-between gap-2">
                    <span>ไม่พบเครื่องจักรที่ตรงกับรหัส {scanNotFoundText}</span>
                    <button
                      onClick={() => setScanNotFoundText(null)}
                      aria-label="สแกนอีกครั้ง"
                      className="shrink-0 rounded-full p-1 hover:bg-white/20 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Viewfinder Target Corner Brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary-on-dark rounded-tl pointer-events-none" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary-on-dark rounded-tr pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary-on-dark rounded-bl pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary-on-dark rounded-br pointer-events-none" />
              </div>
            )}

            {/* Toggle into manual code entry — always available, not just when the
                camera has already failed. */}
            {!manualEntryOpen && (
              <button
                type="button"
                onClick={() => {
                  setManualEmptyError(false);
                  setManualEntryOpen(true);
                }}
                className="text-xs font-semibold text-primary hover:text-primary-focus underline decoration-primary/40 hover:decoration-primary cursor-pointer"
              >
                สแกนไม่ติด? กรอกรหัสเครื่องจักรเอง
              </button>
            )}

            {/* Manual code-entry form — funnels through handleQrDecode so a typed
                code lands on exactly the same success/not-found path as a real scan. */}
            {manualEntryOpen && (
              <form
                onSubmit={handleManualCodeSubmit}
                className="w-full rounded-[18px] bg-divider border border-hairline p-4 space-y-3"
              >
                <div>
                  <span className="text-xs font-semibold text-ink block mb-1.5">
                    กรอกรหัสเครื่องจักร (รหัสเครื่องจักร)
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={manualCodeText}
                    onChange={(e) => {
                      setManualCodeText(e.target.value.toUpperCase());
                      setManualEmptyError(false);
                      if (scanNotFoundText) setScanNotFoundText(null);
                    }}
                    placeholder="เช่น GR-1141"
                    className="w-full min-h-11 rounded-full border border-hairline bg-white px-3.5 text-sm text-ink placeholder:text-ink-faint uppercase"
                  />
                  {manualEmptyError && (
                    <p className="text-xs text-rose-600 font-semibold mt-1.5">
                      กรุณากรอกรหัสเครื่องจักรก่อนค้นหา
                    </p>
                  )}
                  {!manualEmptyError && scanNotFoundText && (
                    <p className="text-xs text-rose-600 font-semibold mt-1.5">
                      ไม่พบเครื่องจักรที่ตรงกับรหัส {scanNotFoundText}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualEntryOpen(false);
                      setManualCodeText("");
                      setManualEmptyError(false);
                      setScanNotFoundText(null);
                    }}
                    className="flex-1 py-2.5 rounded-full border border-hairline bg-white hover:bg-primary/5 text-ink-muted font-semibold text-xs cursor-pointer active:scale-95 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all"
                  >
                    ค้นหา
                  </button>
                </div>
              </form>
            )}

            {/* Camera controls: torch (only when supported), sound toggle, and
                camera switch (only when more than one camera is available) */}
            <div className="w-full flex items-center justify-between text-xs text-ink-faint px-1">
              <span>{scanStatus === "scanning" ? "กำลังสแกน..." : "ตัวควบคุมกล้อง"}</span>
              <div className="flex items-center gap-2">
                {torchSupported && (
                  <button
                    onClick={() => setFlashLight(!flashLight)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      flashLight
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-white text-ink-faint border-hairline"
                    }`}
                    title="เปิด/ปิด แฟลช"
                    aria-label="เปิดหรือปิดแฟลช"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                )}

                {cameras.length > 1 && (
                  <button
                    onClick={() => {
                      const idx = cameras.findIndex((c) => c.deviceId === activeCameraId);
                      const next = cameras[(idx + 1) % cameras.length];
                      selectCamera(next.deviceId);
                    }}
                    className="p-1.5 rounded-lg border border-hairline bg-white text-ink-faint hover:text-ink-muted transition-colors cursor-pointer"
                    title="สลับกล้อง"
                    aria-label="สลับกล้อง"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSoundBeep(!soundBeep)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    soundBeep
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white text-ink-faint border-hairline"
                  }`}
                  title="เปิด/ปิด เสียง"
                  aria-label="เปิดหรือปิดเสียง"
                >
                  {soundBeep ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-divider">
            <button
              onClick={closeQrModal}
              className="w-full py-3.5 rounded-full border border-hairline bg-white hover:bg-primary/5 text-ink-muted font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
              <span>ปิดหน้าต่าง</span>
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};
