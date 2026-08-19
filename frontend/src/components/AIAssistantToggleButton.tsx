import React, { useState } from "react";
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

  if (isOpen) return null;

  const buttonStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 88,
    right: 20,
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
