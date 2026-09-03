import { useEffect, useRef, useState } from "react";
import { getManualOcrStatus, ManualOcrStatus } from "../services/apiService";

const POLL_INTERVAL_MS = 3000;
/** เพดานเวลารอ — ถ้า OCR ยังไม่เสร็จภายในนี้ ให้เลิก poll และแจ้งผู้ใช้ว่าช้ากว่าปกติ
 * แทนที่จะ poll ทิ้งไว้ตลอดไป */
const HARD_CAP_MS = 10 * 60 * 1000;

const isInFlightStatus = (status: ManualOcrStatus["ocrStatus"]) =>
  status === "pending" || status === "processing";

/**
 * Poll สถานะการแปลง PDF → Markdown ของคู่มือเล่มหนึ่งทุก 3 วินาที ตราบใดที่ยังอยู่
 * ระหว่างทำงาน (pending/processing) — หยุด poll เองเมื่อสถานะจบ (done/failed/skipped/null)
 * หรือเมื่อเกินเพดานเวลา `HARD_CAP_MS` ผู้เรียกเรียก `retry()` เพื่อสั่งแปลงใหม่แล้ว
 * hook นี้จะกลับมา poll ต่อให้เอง
 *
 * ส่ง `manualId` เป็น `null` เพื่อปิดการ poll ทั้งหมด (เช่นตอนผู้ใช้เริ่มอัปโหลดไฟล์ใหม่)
 */
export function useManualOcrStatus(manualId: string | null) {
  const [status, setStatus] = useState<ManualOcrStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  // Guard ค่า setState หลัง unmount/หลังเปลี่ยน manualId ระหว่างที่ fetch ยังไม่กลับมา
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    setStatus(null);
    setError(null);
    setTimedOut(false);

    if (!manualId) {
      return () => {
        aliveRef.current = false;
      };
    }

    let intervalHandle: ReturnType<typeof setInterval> | null = null;
    let capHandle: ReturnType<typeof setTimeout> | null = null;

    const stopPolling = () => {
      if (intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
      }
      if (capHandle) {
        clearTimeout(capHandle);
        capHandle = null;
      }
    };

    const poll = async () => {
      try {
        const result = await getManualOcrStatus(manualId);
        if (!aliveRef.current) return;
        setStatus(result);
        setError(null);
        if (!isInFlightStatus(result.ocrStatus)) {
          stopPolling();
        }
      } catch (err) {
        if (!aliveRef.current) return;
        setError(err instanceof Error ? err.message : "ไม่สามารถตรวจสอบสถานะการแปลงไฟล์ได้");
      }
    };

    poll();
    intervalHandle = setInterval(poll, POLL_INTERVAL_MS);
    capHandle = setTimeout(() => {
      if (!aliveRef.current) return;
      stopPolling();
      setTimedOut(true);
    }, HARD_CAP_MS);

    return () => {
      aliveRef.current = false;
      stopPolling();
    };
  }, [manualId, retryNonce]);

  /** เรียกหลังสั่งแปลงใหม่สำเร็จ (retryManualOcr) เพื่อให้ hook เริ่ม poll ต่อจาก "pending" */
  const resumePolling = () => {
    setTimedOut(false);
    setRetryNonce((n) => n + 1);
  };

  return { status, error, timedOut, resumePolling };
}
