import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PixelAILogo from "./PixelAILogo";

// ปุ่มลอยมุมขวาล่าง (เหนือปุ่มสแกน QR) สำหรับเปิดลิ้นชักผู้ช่วย AI
// เมื่อปิดอยู่จะโชว์โลโก้ AI พร้อมจุดกะพริบบอกว่าใช้งานได้
// เมื่อลิ้นชักเปิดอยู่ ปุ่มนี้จะไม่เรนเดอร์เลย (return null) เพราะจะไปทับกล่องพิมพ์ข้อความด้านล่างของลิ้นชัก
// และลิ้นชักมีปุ่มปิด (กากบาท) ของตัวเองอยู่แล้วที่ header
// เรนเดอร์ผ่าน portal ไปที่ document.body และใช้ inline style ล้วนสำหรับ layout/ตำแหน่ง/สี
// เพื่อไม่ให้พึ่งพา Tailwind JIT content scan และไม่ให้ ancestor ที่มี transform มากระทบตำแหน่ง

interface AIAssistantToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistantToggleButton: React.FC<AIAssistantToggleButtonProps> = ({ isOpen, onToggle }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const label = "เปิดผู้ช่วย AI";

  // ป้องกันปุ่ม AI ทับปุ่มสแกน QR โดยคำนวณระยะห่างจากตำแหน่งจริงของปุ่มสแกน QR
  // ที่ต่างกันระหว่างมือถือ (bottom-4/right-4, py-2.5) กับจอ sm+ (bottom-6/right-6, py-3.5)
  // แล้วบวกช่องว่างเพิ่มอีก QR_PILL_GAP เพื่อไม่ให้ปุ่มสองอันชิดกันเกินไป
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isOpen) return null;

  // ตำแหน่ง (offset) และความสูงของปุ่มสแกน QR ต่อ breakpoint บวกช่องว่างที่ต้องการ
  const QR_PILL_GAP = 24;
  const QR_PILL_OFFSET = isDesktop ? 24 : 16;
  const QR_PILL_HEIGHT = isDesktop ? 56 : 44;

  const buttonStyle: React.CSSProperties = {
    position: "fixed",
    bottom: QR_PILL_OFFSET + QR_PILL_HEIGHT + QR_PILL_GAP,
    right: isDesktop ? 24 : 16,
    zIndex: 60,
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
    transition: "transform 150ms ease",
    transform: isHovered ? "scale(1.06)" : "scale(1)",
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

  const button = (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-expanded={isOpen}
      aria-label={label}
      title={label}
      style={buttonStyle}
    >
      <PixelAILogo className="w-7 h-7" />
      <span style={dotStyle} />
    </button>
  );

  return createPortal(button, document.body);
};

export default AIAssistantToggleButton;
