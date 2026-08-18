import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

/**
 * useQrScanner
 * ----------------------------------------------------------------------------
 * Hook สแกน QR code จากกล้องจริงของอุปกรณ์ (มือถือ/แท็บเล็ต/โน้ตบุ๊ก) แบบ reusable
 * ให้ความสำคัญกับ "ความเสถียร" เป็นอันดับแรก: ไม่รั่ว stream, ไม่รั่ว loop,
 * ปลอดภัยกับ React 19 StrictMode (effect ถูกเรียก 2 รอบตอน dev)
 *
 * กลยุทธ์ decode:
 * - ถ้าเบราว์เซอร์รองรับ BarcodeDetector (Chrome/Android) ใช้ตัวนี้ก่อน เพราะเร็วกว่ามาก
 * - ถ้าไม่รองรับ fallback ไปใช้ jsQR ถอดรหัสจาก canvas
 * - จำกัดอัตราสแกนที่ ~8-12 ครั้ง/วินาที ด้วย requestAnimationFrame + เช็ค timestamp
 *   เพื่อไม่ให้กินแบตเตอรี่จากการ decode ทุกเฟรม (มักจะ 60fps)
 */

export type QrScannerStatus = 'idle' | 'starting' | 'scanning' | 'error';

export interface QrScannerError {
  code:
    | 'insecure-context'
    | 'unsupported'
    | 'permission-denied'
    | 'no-camera'
    | 'camera-busy'
    | 'unknown';
  message: string;
}

export interface UseQrScannerOptions {
  enabled: boolean;
  onDecode: (text: string) => void;
  torch?: boolean;
}

export interface UseQrScannerResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: QrScannerStatus;
  error: QrScannerError | null;
  torchSupported: boolean;
  cameras: { deviceId: string; label: string }[];
  activeCameraId: string | null;
  selectCamera: (deviceId: string) => void;
  retry: () => void;
}

// ประมาณ 10 ครั้ง/วินาที คือจุดสมดุลระหว่างความไวในการสแกนกับการประหยัดแบต
const SCAN_INTERVAL_MS = 100;
// กันไม่ให้ QR เดิมยิง onDecode ซ้ำถี่ ๆ ภายในช่วงเวลานี้
const DUPLICATE_DEBOUNCE_MS = 1500;
// ย่อภาพลงก่อน decode เพื่อลดภาระ CPU (ด้านยาวสุดไม่เกินค่านี้)
const MAX_CANVAS_EDGE = 640;

// รองรับ BarcodeDetector แบบไม่ประกาศ type เต็ม (บาง lib.dom.d.ts รุ่นเก่ายังไม่มี)
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
}
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike;

function getThaiMessage(code: QrScannerError['code']): string {
  switch (code) {
    case 'insecure-context':
      return 'ต้องเปิดผ่าน HTTPS หรือ localhost เท่านั้น กล้องจึงจะทำงานได้';
    case 'unsupported':
      return 'อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง';
    case 'permission-denied':
      return 'ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตสิทธิ์กล้องแล้วลองใหม่';
    case 'no-camera':
      return 'ไม่พบกล้องบนอุปกรณ์นี้';
    case 'camera-busy':
      return 'กล้องถูกใช้งานโดยแอปอื่นอยู่ กรุณาปิดแอปอื่นแล้วลองใหม่';
    case 'unknown':
    default:
      return 'เกิดข้อผิดพลาดในการเปิดกล้อง กรุณาลองใหม่อีกครั้ง';
  }
}

function mapGetUserMediaError(err: unknown): QrScannerError {
  const name = err instanceof DOMException ? err.name : '';
  let code: QrScannerError['code'] = 'unknown';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    code = 'permission-denied';
  } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    code = 'no-camera';
  } else if (name === 'NotReadableError' || name === 'TrackStartError') {
    code = 'camera-busy';
  }
  return { code, message: getThaiMessage(code) };
}

export function useQrScanner(options: UseQrScannerOptions): UseQrScannerResult {
  const { enabled, torch } = options;

  // เก็บ onDecode ไว้ใน ref เพื่อไม่ให้ identity ของ callback ที่เปลี่ยนบ่อย
  // ทำให้ effect รีสตาร์ทกล้องโดยไม่จำเป็น
  const onDecodeRef = useRef(options.onDecode);
  onDecodeRef.current = options.onDecode;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanAtRef = useRef(0);
  const lastResultRef = useRef<{ text: string; at: number } | null>(null);
  const barcodeDetectorRef = useRef<BarcodeDetectorLike | null>(null);

  const [status, setStatus] = useState<QrScannerStatus>('idle');
  const [error, setError] = useState<QrScannerError | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [cameras, setCameras] = useState<{ deviceId: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  // เพิ่มค่านี้ทุกครั้งที่ต้องการสั่งให้ effect เริ่มลำดับใหม่ (retry / selectCamera)
  const [generation, setGeneration] = useState(0);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    stopLoop();
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopLoop]);

  const selectCamera = useCallback((deviceId: string) => {
    setActiveCameraId(deviceId);
    setGeneration((g) => g + 1);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setGeneration((g) => g + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopStream();
      setStatus('idle');
      return;
    }

    // guard สำหรับ React 19 StrictMode: effect นี้จะถูกเรียก mount -> cleanup -> mount
    // อีกครั้งใน dev mode ถ้า promise ของรอบเก่ายัง resolve ช้าอยู่ ต้องเช็ค cancelled
    // ก่อน assign stream/สถานะ ไม่งั้นจะได้ stream ค้าง (leak) จาก effect ที่ถูก teardown ไปแล้ว
    let cancelled = false;
    let localStream: MediaStream | null = null;

    async function start() {
      setStatus('starting');
      setError(null);

      // Preflight: ต้องเป็น secure context (HTTPS) ยกเว้น localhost/127.0.0.1
      const host = window.location.hostname;
      const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
      if (window.isSecureContext === false && !isLocalhost) {
        const e: QrScannerError = { code: 'insecure-context', message: getThaiMessage('insecure-context') };
        if (!cancelled) {
          setError(e);
          setStatus('error');
        }
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        const e: QrScannerError = { code: 'unsupported', message: getThaiMessage('unsupported') };
        if (!cancelled) {
          setError(e);
          setStatus('error');
        }
        return;
      }

      const videoConstraints: MediaTrackConstraints = activeCameraId
        ? { deviceId: { exact: activeCameraId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      } catch (err) {
        // ถ้า constraint เข้มเกินไปจนอุปกรณ์รับไม่ได้ ลองใหม่แบบง่ายที่สุดครั้งเดียว
        if (err instanceof DOMException && err.name === 'OverconstrainedError') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } catch (err2) {
            if (!cancelled) {
              const e = mapGetUserMediaError(err2);
              setError(e);
              setStatus('error');
            }
            return;
          }
        } else {
          if (!cancelled) {
            const e = mapGetUserMediaError(err);
            setError(e);
            setStatus('error');
          }
          return;
        }
      }

      if (cancelled) {
        // effect ถูก teardown ไปแล้วระหว่างรอ getUserMedia (เช่น StrictMode double-invoke
        // หรือผู้ใช้ปิดสแกนเนอร์ไปแล้ว) ต้องปิด stream ที่เพิ่งเปิดได้มาทันที ไม่ให้รั่ว
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      localStream = stream;
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }

      video.srcObject = stream;
      // ตั้งค่าเชิง defensive ไว้ด้วย แม้ consumer จะตั้ง attr ใน JSX แล้วก็ตาม
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;

      try {
        await video.play();
      } catch {
        // iOS Safari บางเคส play() ถูก reject (autoplay policy) — ปล่อยผ่าน
        // ผู้ใช้สามารถแตะหน้าจอเพื่อเล่นเองได้ ไม่ถือเป็น error ร้ายแรง
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }

      // enumerate กล้องได้ label ที่แท้จริงหลังได้รับสิทธิ์แล้วเท่านั้น
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          const videoInputs = devices
            .filter((d) => d.kind === 'videoinput')
            .map((d, idx) => ({ deviceId: d.deviceId, label: d.label || `กล้อง ${idx + 1}` }));
          setCameras(videoInputs);
        }
      } catch {
        // ไม่ critical หาก enumerate ไม่สำเร็จ ยังสแกนต่อได้
      }

      // ตรวจว่ากล้องรองรับไฟฉาย (torch) หรือไม่
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.();
        const supportsTorch = !!(capabilities && 'torch' in capabilities);
        if (!cancelled) setTorchSupported(supportsTorch);
      }

      // เตรียม BarcodeDetector ของเบราว์เซอร์ถ้ามี (เร็วกว่า jsQR มากบน Android/Chrome)
      const win = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
      if ('BarcodeDetector' in window && win.BarcodeDetector) {
        try {
          barcodeDetectorRef.current = new win.BarcodeDetector({ formats: ['qr_code'] });
        } catch {
          barcodeDetectorRef.current = null;
        }
      } else {
        barcodeDetectorRef.current = null;
      }

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      if (!cancelled) {
        setStatus('scanning');
        lastScanAtRef.current = 0;
        scheduleLoop();
      }
    }

    function scheduleLoop() {
      const loop = async (timestamp: number) => {
        if (cancelled) return;
        // หยุดสแกนตอนแท็บถูกซ่อน (visibilitychange handler ด้านล่างจะ resume ให้เอง)
        if (document.hidden) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        // throttle ~8-12 ครั้ง/วินาที แทนการ decode ทุกเฟรม เพื่อประหยัดแบต
        if (timestamp - lastScanAtRef.current >= SCAN_INTERVAL_MS) {
          lastScanAtRef.current = timestamp;
          await tryDecode();
        }

        if (!cancelled) {
          rafRef.current = requestAnimationFrame(loop);
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    async function tryDecode() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState < video.HAVE_ENOUGH_DATA) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // ย่อภาพลงก่อน decode ลดภาระ CPU/battery
      const scale = Math.min(1, MAX_CANVAS_EDGE / Math.max(vw, vh));
      const cw = Math.max(1, Math.round(vw * scale));
      const ch = Math.max(1, Math.round(vh * scale));
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, cw, ch);

      let text: string | null = null;

      if (barcodeDetectorRef.current) {
        try {
          const results = await barcodeDetectorRef.current.detect(canvas);
          if (results.length > 0) {
            text = results[0].rawValue;
          }
        } catch {
          // ถ้า native detector ล้มเหลวกลางคัน fallback ไป jsQR รอบถัดไปโดยอัตโนมัติ
          barcodeDetectorRef.current = null;
        }
      } else {
        const imageData = ctx.getImageData(0, 0, cw, ch);
        const result = jsQR(imageData.data, cw, ch);
        if (result) {
          text = result.data;
        }
      }

      if (text) {
        const now = Date.now();
        const last = lastResultRef.current;
        if (last && last.text === text && now - last.at < DUPLICATE_DEBOUNCE_MS) {
          return; // กันยิงซ้ำจาก QR เดิมที่ยังอยู่ในเฟรม
        }
        lastResultRef.current = { text, at: now };
        onDecodeRef.current(text);
      }
    }

    start();

    return () => {
      cancelled = true;
      stopLoop();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (streamRef.current === localStream) {
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, activeCameraId, generation, stopLoop, stopStream]);

  // ปรับไฟฉาย (torch) แยกจาก effect เปิดกล้อง เพื่อไม่ให้ toggle torch ทำให้กล้องรีสตาร์ท
  useEffect(() => {
    const stream = streamRef.current;
    if (!stream || status !== 'scanning') return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    (async () => {
      try {
        await track.applyConstraints({ advanced: [{ torch: !!torch } as MediaTrackConstraintSet] });
      } catch {
        // อุปกรณ์บางรุ่นไม่รองรับ torch constraint จริง ๆ แม้ capabilities จะบอกว่ามี
        // ไม่ควรทำให้การสแกนพังเพราะเรื่องนี้
      }
    })();
  }, [torch, status]);

  // หมายเหตุ: การหยุด/พักตอนแท็บถูกซ่อนถูกจัดการอยู่แล้วภายใน loop หลัก (เช็ค document.hidden
  // ทุกเฟรมแล้วข้ามการ decode) จึงไม่ต้องมี rAF loop แยกอีกชุดสำหรับ visibilitychange

  return {
    videoRef,
    status,
    error,
    torchSupported,
    cameras,
    activeCameraId,
    selectCamera,
    retry,
  };
}
