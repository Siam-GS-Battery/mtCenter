import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PixelAILogo from "./PixelAILogo";

// ปุ่มลอยมุมขวาล่างสำหรับเปิดลิ้นชักผู้ช่วย AI — แสดงได้ทุกหน้า (ยกเว้นหน้าแชตเต็มจอ)
// เมื่อปิดอยู่จะโชว์โลโก้ AI พร้อมจุดกะพริบบอกว่าใช้งานได้
// เมื่อลิ้นชักเปิดอยู่ ปุ่มนี้จะไม่เรนเดอร์เลย (return null) เพราะจะไปทับกล่องพิมพ์ข้อความด้านล่างของลิ้นชัก
// และลิ้นชักมีปุ่มปิด (กากบาท) ของตัวเองอยู่แล้วที่ header
// เรนเดอร์ผ่าน portal ไปที่ document.body และใช้ inline style ล้วนสำหรับ layout/ตำแหน่ง/สี
// เพื่อไม่ให้พึ่งพา Tailwind JIT content scan และไม่ให้ ancestor ที่มี transform มากระทบตำแหน่ง
//
// ผู้ใช้พับปุ่มนี้เก็บเป็นแถบบางชิดขอบขวาได้ และสถานะพับ/กางจะจำถาวรใน localStorage

const COLLAPSED_KEY = "mtcenter.ai-launcher.collapsed";

/** อ่านสถานะพับปุ่ม AI จาก localStorage — ปลอดภัยแม้อยู่ในโหมดส่วนตัว */
function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** บันทึกสถานะพับ/กางปุ่ม AI ไว้ถาวร */
function writeCollapsed(collapsed: boolean): void {
  try {
    if (collapsed) {
      window.localStorage.setItem(COLLAPSED_KEY, "1");
    } else {
      window.localStorage.removeItem(COLLAPSED_KEY);
    }
  } catch {
    // localStorage อาจใช้ไม่ได้ (โหมดส่วนตัว) — ยอมรับได้ แค่จำสถานะไม่ได้ข้ามเซสชัน
  }
}

interface AIAssistantToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  /** true เฉพาะหน้าสแกน QR — เว้นระยะเหนือปุ่มสแกน; หน้าอื่นใช้ offset ปกติมุมขวาล่าง */
  avoidQrPill?: boolean;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TRANSITION_MS = 200;

const AIAssistantToggleButton: React.FC<AIAssistantToggleButtonProps> = ({
  isOpen,
  onToggle,
  avoidQrPill = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isMainFocused, setIsMainFocused] = useState<boolean>(false);
  const [isDismissFocused, setIsDismissFocused] = useState<boolean>(false);
  const [isHandleFocused, setIsHandleFocused] = useState<boolean>(false);
  const [isHandleHovered, setIsHandleHovered] = useState<boolean>(false);
  const label = "เปิดผู้ช่วย AI";
  const dismissLabel = "ซ่อนปุ่มผู้ช่วย AI";
  const showLabel = "แสดงปุ่มผู้ช่วย AI";

  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());
  const handleButtonRef = useRef<HTMLButtonElement>(null);
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const didMountRef = useRef(false);

  // ป้องกันปุ่ม AI ทับปุ่มสแกน QR โดยคำนวณระยะห่างจากตำแหน่งจริงของปุ่มสแกน QR
  // ที่ต่างกันระหว่างมือถือ (bottom-4/right-4, py-2.5) กับจอ sm+ (bottom-6/right-6, py-3.5)
  // แล้วบวกช่องว่างเพิ่มอีก QR_PILL_GAP เพื่อไม่ให้ปุ่มสองอันชิดกันเกินไป
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : false
  );

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // สลับระหว่างพับ/กาง เรนเดอร์ DOM คนละต้น จึงจำลองการ "เลื่อนเข้า/ออกจากขอบ" ด้วยการ
  // เริ่มต้นทุกครั้งที่สลับสถานะด้วย transform/opacity ที่ยังไม่เข้าที่ แล้วเข้าเฟรมถัดไปค่อย
  // เปลี่ยนเป็นค่าสุดท้ายเพื่อให้ transition เล่น (แทน CSS animation เพราะไฟล์นี้ไม่มี stylesheet)
  // ใช้ useLayoutEffect (ไม่ใช่ useEffect) เพื่อรีเซ็ต entered=false ให้ทันก่อนเบราว์เซอร์วาดเฟรมแรก
  // ของสถานะใหม่ — ไม่งั้นจะเห็นค่าเก่า entered=true โผล่มาแวบหนึ่งก่อนถูกรีเซ็ต (double-flash)
  const [entered, setEntered] = useState<boolean>(true);
  const prevCollapsedRef = useRef(collapsed);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (prevCollapsedRef.current === collapsed) return;
    prevCollapsedRef.current = collapsed;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (prefersReducedMotion) {
      setEntered(true);
      return;
    }
    setEntered(false);
    rafRef.current = requestAnimationFrame(() => {
      setEntered(true);
      rafRef.current = null;
    });
  }, [collapsed, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ย้าย focus ไปยังปุ่มที่เพิ่งเรนเดอร์ใหม่หลังสลับพับ/กาง (ปุ่มเดิมถูก unmount ทำให้ focus
  // หลุดไปที่ <body>) — ข้ามการโฟกัสตอน mount ครั้งแรกเพราะไม่ใช่ผลจากการกดของผู้ใช้
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (collapsed) {
      handleButtonRef.current?.focus();
    } else {
      mainButtonRef.current?.focus();
    }
  }, [collapsed]);

  if (isOpen) return null;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(next);
      return next;
    });
  };

  // ตำแหน่ง (offset) และความสูงของปุ่มสแกน QR ต่อ breakpoint บวกช่องว่างที่ต้องการ
  // ใช้เฉพาะหน้าสแกน (avoidQrPill) — หน้าอื่นใช้ offset ปกติมุมขวาล่าง
  const QR_PILL_GAP = 24;
  const QR_PILL_OFFSET = isDesktop ? 24 : 16;
  const QR_PILL_HEIGHT = isDesktop ? 56 : 44;
  const BASE_BOTTOM_OFFSET = isDesktop ? 24 : 16;
  const bottomOffset = avoidQrPill
    ? QR_PILL_OFFSET + QR_PILL_HEIGHT + QR_PILL_GAP
    : BASE_BOTTOM_OFFSET;
  const bottomWithSafeArea = `calc(${bottomOffset}px + env(safe-area-inset-bottom))`;

  const transition = prefersReducedMotion
    ? "none"
    : `transform ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}`;

  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    bottom: bottomWithSafeArea,
    right: collapsed ? 0 : isDesktop ? 24 : 16,
    zIndex: 60,
    display: "flex",
    alignItems: "flex-start",
  };

  const dotStyle: React.CSSProperties = {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: "9999px",
    backgroundColor: "#34d399",
    border: "2px solid #ffffff",
  };

  if (collapsed) {
    // แถบพับชิดขอบขวา — บอกว่ายังเรียกใช้ผู้ช่วย AI ได้ แต่ไม่รบกวนพื้นที่ทำงาน
    const handleVisibleWidth = 20;
    const handleHitPadding = 24; // ขยาย hit area ให้กว้าง >= 44px รวม (20 + 24) โดยพื้นที่ทาสียังบางอยู่
    const handleStyle: React.CSSProperties = {
      position: "relative",
      width: handleVisibleWidth + handleHitPadding,
      height: 56,
      padding: 0,
      paddingLeft: handleHitPadding,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      transform: prefersReducedMotion
        ? "none"
        : isHandleHovered
          ? "translateX(-2px)"
          : "translateX(0)",
      transition,
      outline: "none",
    };
    const handlePaintedStyle: React.CSSProperties = {
      width: handleVisibleWidth,
      height: 56,
      borderRadius: "10px 0 0 10px",
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      boxShadow:
        "inset 1px 0 0 rgba(255,255,255,0.22), -2px 4px 12px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      outline: isHandleFocused ? "2px solid #38bdf8" : "none",
      outlineOffset: 1,
    };
    const sparkStyle: React.CSSProperties = {
      width: 6,
      height: 6,
      borderRadius: "9999px",
      backgroundColor: "#a7f3d0",
      boxShadow: "0 0 4px 1px rgba(167,243,208,0.8)",
    };

    const handleEntranceStyle: React.CSSProperties = {
      ...wrapperStyle,
      transform: entered ? "translateX(0)" : "translateX(16px)",
      opacity: entered ? 1 : 0,
      transition,
    };

    const handle = (
      <div style={handleEntranceStyle}>
        <button
          ref={handleButtonRef}
          type="button"
          onClick={toggleCollapsed}
          onMouseEnter={() => setIsHandleHovered(true)}
          onMouseLeave={() => setIsHandleHovered(false)}
          onFocus={() => setIsHandleFocused(true)}
          onBlur={() => setIsHandleFocused(false)}
          aria-label={showLabel}
          style={handleStyle}
        >
          <span style={handlePaintedStyle}>
            <span style={sparkStyle} />
          </span>
        </button>
      </div>
    );

    return createPortal(handle, document.body);
  }

  const buttonStyle: React.CSSProperties = {
    position: "relative",
    width: 56,
    height: 56,
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    transition: prefersReducedMotion ? "none" : `transform 150ms ease, ${transition}`,
    transform: isHovered ? "scale(1.06)" : "scale(1)",
    outline: isMainFocused ? "2px solid #38bdf8" : "none",
    outlineOffset: 2,
  };

  const dismissChipSize = 22;
  const dismissHitPadding = 11; // hit area = 22 + 11*2 = 44px
  const dismissButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: -10,
    right: -10,
    width: dismissChipSize + dismissHitPadding * 2,
    height: dismissChipSize + dismissHitPadding * 2,
    padding: dismissHitPadding,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: isHovered || isMainFocused || isDismissFocused ? 1 : 0.55,
    transition: prefersReducedMotion ? "none" : `opacity 180ms ${EASE}`,
    outline: "none",
  };
  const dismissChipStyle: React.CSSProperties = {
    width: dismissChipSize,
    height: dismissChipSize,
    borderRadius: "9999px",
    backgroundColor: "#334155",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 400,
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    outline: isDismissFocused ? "2px solid #38bdf8" : "none",
    outlineOffset: 1,
  };

  const pillEntranceStyle: React.CSSProperties = {
    ...wrapperStyle,
    transform: entered ? "translateX(0)" : "translateX(24px)",
    opacity: entered ? 1 : 0,
    transition,
  };

  const pill = (
    <div
      style={pillEntranceStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: "relative" }}>
        <button
          ref={mainButtonRef}
          type="button"
          onClick={onToggle}
          onFocus={() => setIsMainFocused(true)}
          onBlur={() => setIsMainFocused(false)}
          aria-expanded={isOpen}
          aria-label={label}
          style={buttonStyle}
        >
          <PixelAILogo className="w-7 h-7" />
          <span style={dotStyle} />
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          onFocus={() => setIsDismissFocused(true)}
          onBlur={() => setIsDismissFocused(false)}
          aria-label={dismissLabel}
          style={dismissButtonStyle}
        >
          <span style={dismissChipStyle}>×</span>
        </button>
      </div>
    </div>
  );

  return createPortal(pill, document.body);
};

export default AIAssistantToggleButton;
