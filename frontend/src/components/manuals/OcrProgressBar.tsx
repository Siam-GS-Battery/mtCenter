import React, { useEffect, useState } from "react";
import { OcrStatus } from "../../services/apiService";

interface OcrProgressBarProps {
  ocrStatus: OcrStatus | null;
  ocrStartedAt: string | null;
  /** "compact" = การ์ดสีเขียวฝั่งซ้าย (emerald), "large" = แผงขาวฝั่งขวา (primary) */
  variant?: "compact" | "large";
}

/** ระยะเวลาที่คาดว่าจะใช้แปลง PDF → Markdown ด้วย AI (โดยประมาณ) — ใช้แค่ประมาณ % แสดงผล
 * ไม่ใช่ค่าจริงจาก backend เพราะ backend ไม่มี field pagesDone/percent ให้ */
const EXPECTED_DURATION_MS = 50_000;
const MAX_PROCESSING_PERCENT = 92;

const phaseLabel = (ocrStatus: OcrStatus | null): string => {
  if (ocrStatus === "pending") return "รอแปลงเป็น Markdown…";
  if (ocrStatus === "processing") return "กำลังอ่านไฟล์ PDF ด้วย AI…";
  return "";
};

/** ประมาณ % ความคืบหน้าจากเวลาที่ผ่านไป ด้วยเส้นโค้ง ease-out ที่เข้าใกล้แต่ไม่ถึง 100%
 * ระหว่างที่ยังไม่เสร็จ (ไม่มีข้อมูลความคืบหน้าจริงจาก backend) */
const estimatePercent = (elapsedMs: number): number => {
  const t = Math.max(0, elapsedMs) / EXPECTED_DURATION_MS;
  const eased = 1 - Math.exp(-t * 1.8);
  return Math.min(MAX_PROCESSING_PERCENT, eased * MAX_PROCESSING_PERCENT);
};

export const OcrProgressBar: React.FC<OcrProgressBarProps> = ({
  ocrStatus,
  ocrStartedAt,
  variant = "compact",
}) => {
  const [mountedAt] = useState(() => Date.now());
  const startedAtMs = ocrStartedAt ? new Date(ocrStartedAt).getTime() : NaN;
  const baseStart = Number.isFinite(startedAtMs) ? startedAtMs : mountedAt;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (ocrStatus === "done") return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [ocrStatus]);

  const percent = ocrStatus === "done" ? 100 : estimatePercent(now - baseStart);
  const roundedPercent = Math.round(percent);
  const label = phaseLabel(ocrStatus);

  const isCompact = variant === "compact";

  const trackClass = isCompact
    ? "h-1.5 rounded-full bg-emerald-200/70 overflow-hidden"
    : "h-2.5 rounded-full bg-divider overflow-hidden";
  const barClass = isCompact
    ? "h-full rounded-full bg-emerald-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
    : "h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none";

  return (
    <div className={isCompact ? "space-y-1 w-full" : "space-y-2 w-full max-w-xs mx-auto"}>
      <div
        className={
          isCompact
            ? "flex items-center justify-between gap-2 text-[13px] font-semibold text-emerald-900"
            : "flex items-center justify-between gap-2 text-sm font-semibold text-ink"
        }
      >
        <span>{label}</span>
        <span className={isCompact ? "text-emerald-700 text-xs font-semibold" : "text-ink-muted text-xs font-semibold"}>
          {roundedPercent}%
        </span>
      </div>
      <div
        className={trackClass}
        role="progressbar"
        aria-valuenow={roundedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "กำลังแปลงคู่มือ"}
      >
        <div className={barClass} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
