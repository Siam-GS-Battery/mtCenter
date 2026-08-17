import React from "react";
import { Bot } from "lucide-react";
import { UserProfile, UserRole } from "../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRoleChange,
}) => {
  if (!isOpen) return null;

  return (
    <Modal size="md" onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <h3 className="text-lg font-semibold text-ink tracking-[-0.02em]">
          ตั้งค่าระบบ
        </h3>
      </ModalHeader>

      <ModalBody className="space-y-5">
        {/* User Card Info */}
        <div className="p-4 bg-parchment rounded-[11px] border-0 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/15 text-primary font-semibold text-base flex items-center justify-center">
            {currentUser.initials}
          </div>
          <div>
            <div className="font-semibold text-ink text-sm">{currentUser.name}</div>
            <div className="text-[13px] text-ink-muted">
              รหัสพนักงาน: {currentUser.employeeId} · {currentUser.department}
            </div>
          </div>
        </div>

        {/* Role Selector — โหมดพัฒนาเท่านั้น เช่นเดียวกับแถบสลับบทบาทในเมนูข้าง */}
        {import.meta.env.DEV && (
          <div className="space-y-2">
            <span className="text-[13px] font-semibold text-ink-muted block">
              สลับบทบาทผู้ใช้งาน (โหมดพัฒนา)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "technician", label: "ช่างเทคนิค", sub: "ปฏิบัติงานซ่อมหน้าเครื่อง" },
                { id: "engineer", label: "วิศวกร", sub: "ตรวจสอบและอนุมัติใบงาน" },
                { id: "supervisor", label: "หัวหน้างาน", sub: "ติดตามภาพรวมและรายงาน" },
              ].map((r) => {
                const isSelected = currentUser.role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onRoleChange(r.id as UserRole)}
                    aria-pressed={isSelected}
                    className={`p-3 min-h-11 rounded-[11px] border text-left transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "bg-white border-hairline text-ink-muted hover:bg-parchment"
                    }`}
                  >
                    <div className="text-[13px]">{r.label}</div>
                    <div className="text-xs text-ink-muted font-normal">{r.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* AI Engine Status */}
        <div className="p-3 bg-emerald-50 rounded-[11px] border-0 text-xs text-emerald-900 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">ผู้ช่วย MT Center AI</span>
          </div>
          <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
            พร้อมใช้งาน
          </span>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          onClick={onClose}
          className="w-full min-h-11 py-3 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] cursor-pointer active:scale-95 transition-all"
        >
          ตกลงและปิด
        </button>
      </ModalFooter>
    </Modal>
  );
};
