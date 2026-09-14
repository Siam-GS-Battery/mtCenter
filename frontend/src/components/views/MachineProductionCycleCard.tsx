import React, { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { Machine } from "../../types";
import { ProductionCycleMetrics } from "../../lib/machineMetricsMock";

/** จัดรูปแบบ ISO string ให้เป็นเวลาท้องถิ่น HH:mm */
function formatTimeHHmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * การ์ด "รอบการผลิต" (mock/demo) — แสดงเป้าหมายกะ, ผลิตแล้ว, คงเหลือ และ
 * ความคืบหน้าของรอบปัจจุบันแบบ live (นับต่อเนื่องด้วย wall-clock เมื่อเครื่องกำลังทำงาน)
 */
export function MachineProductionCycleCard({
  machine,
  metrics,
}: {
  machine: Machine;
  metrics: ProductionCycleMetrics;
}) {
  // seed จาก metrics เริ่มต้น แล้วเดินต่อด้วยเวลาจริงฝั่ง client เพื่อให้ดูมีชีวิต
  const [elapsedSec, setElapsedSec] = useState(metrics.currentCycleElapsedSec);

  useEffect(() => {
    // seed ใหม่ทุกครั้งที่เปลี่ยนเครื่อง หรือสถานะทำงาน/หยุดเปลี่ยน
    setElapsedSec(metrics.currentCycleElapsedSec);

    if (!metrics.isRunning) {
      return;
    }

    const startedAt = Date.now();
    const baseElapsed = metrics.currentCycleElapsedSec;
    const intervalId = setInterval(() => {
      const deltaSec = (Date.now() - startedAt) / 1000;
      setElapsedSec((baseElapsed + deltaSec) % metrics.avgCycleTimeSec);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [machine.id, metrics.isRunning, metrics.currentCycleElapsedSec, metrics.avgCycleTimeSec]);

  const currentProgress = metrics.isRunning
    ? Math.min(0.999, elapsedSec / metrics.avgCycleTimeSec)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-divider pb-2">
        <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-primary" />
          <span>รอบการผลิต</span>
        </h4>
        <span className="text-[10px] text-ink-faint font-medium">ข้อมูลตัวอย่าง</span>
      </div>

      {/* ความคืบหน้าเป้าหมายกะ */}
      <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-ink-faint">ความคืบหน้าเป้าหมายกะ</span>
          <span className="text-xs font-semibold text-ink">{metrics.completionPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/60 mt-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, metrics.completionPct))}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-1">เป้าหมายกะ</span>
          <span className="text-lg font-semibold text-ink">{metrics.shiftTarget} ชิ้น</span>
        </div>
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-1">ผลิตแล้ว</span>
          <span className="text-lg font-semibold text-ink">{metrics.produced} ชิ้น</span>
        </div>
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-1">คงเหลือ</span>
          <span className="text-lg font-semibold text-ink">{metrics.remaining} ชิ้น</span>
        </div>
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-1">รอบที่เสร็จวันนี้</span>
          <span className="text-lg font-semibold text-ink">{metrics.cyclesCompletedToday}</span>
        </div>
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-1">เวลาเฉลี่ยต่อรอบ</span>
          <span className="text-lg font-semibold text-ink">{metrics.avgCycleTimeSec} วิ</span>
        </div>
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-1">เวลาเริ่มกะ</span>
          <span className="text-lg font-semibold text-ink">{formatTimeHHmm(metrics.shiftStartedAt)}</span>
        </div>
        <div className="p-3.5 rounded-[18px] bg-divider border border-hairline sm:col-span-2 col-span-2">
          <span className="text-xs font-semibold text-ink-faint block mb-1">เวลาที่คาดว่าจะเสร็จเป้าหมาย</span>
          <span className="text-lg font-semibold text-ink">{formatTimeHHmm(metrics.estimatedFinishAt)}</span>
        </div>
      </div>

      {/* รอบปัจจุบัน — นับต่อเนื่องแบบ live เมื่อเครื่องทำงานอยู่ */}
      <div className="p-3.5 rounded-[18px] bg-divider border border-hairline">
        <span className="text-xs font-semibold text-ink-faint block mb-1">รอบปัจจุบัน</span>
        {metrics.isRunning ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-ink">{Math.round(currentProgress * 100)}%</span>
              <span className="text-xs text-ink-faint">
                {Math.round(elapsedSec)} / {metrics.avgCycleTimeSec} วิ
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/60 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, currentProgress * 100))}%` }}
              />
            </div>
          </>
        ) : (
          <span className="text-sm font-semibold text-ink-faint">เครื่องหยุดทำงาน</span>
        )}
      </div>
    </div>
  );
}
