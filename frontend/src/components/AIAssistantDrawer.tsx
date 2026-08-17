import React, { useEffect } from "react";
import { Sparkles, RotateCcw, X, Maximize2, Cpu } from "lucide-react";
import { Machine, UserRole } from "../types";
import {
  AssistantConversation,
  useAssistantChat,
  userRoleLabel,
} from "./ai/AssistantConversation";
import type { WorkOrderPrefill } from "../lib/aiActions";
import { formatWithUnit, orDash } from "../lib/format";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeMachine: Machine;
  currentUserRole: UserRole;
  /** ชื่อผู้ใช้ปัจจุบัน — แสดงในแผงยืนยันก่อนสร้างใบงาน */
  currentUserName?: string;
  initialPrompt?: string;
  onOpenFullChatPage?: () => void;
  onAutoCreateWorkOrder?: (prefilled: WorkOrderPrefill) => void;
  onOpenCreateWorkOrderModal?: (prefilled: WorkOrderPrefill) => void;
}

/**
 * Side-drawer assistant. The drawer owns only its shell — the conversation
 * itself is the shared AssistantConversation, identical to the full page.
 * Conversation state lives here so history survives closing the drawer.
 */
export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeMachine,
  currentUserRole,
  currentUserName,
  initialPrompt = "",
  onOpenFullChatPage,
  onAutoCreateWorkOrder,
  onOpenCreateWorkOrderModal,
}) => {
  const chat = useAssistantChat(activeMachine, currentUserRole);

  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim() !== "") {
      chat.send(initialPrompt);
    }
    // ส่งคำถามตั้งต้นเมื่อเปิดผู้ช่วยพร้อมคำถามจากหน้าจออื่น
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดผู้ช่วย AI"
        className="fixed inset-0 bg-nav-black/40 backdrop-blur-xs transition-opacity cursor-default"
      />

      {/* Side Panel Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ผู้ช่วย MT Center AI"
        className="relative w-full max-w-full sm:w-[480px] lg:w-[520px] xl:w-[600px] bg-white h-dvh shadow-2xl border-l border-hairline flex flex-col z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="px-4 py-3 bg-white border-b border-hairline flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink truncate">MT Center AI</h3>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>พร้อมใช้งาน</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenFullChatPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullChatPage();
                }}
                title="ขยายเต็มหน้าจอ"
                aria-label="เปิดผู้ช่วย AI แบบเต็มหน้าจอ"
                className="h-11 w-11 rounded-full hover:bg-parchment text-ink-muted flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={chat.reset}
              title="เริ่มการสนทนาใหม่"
              aria-label="เริ่มการสนทนาใหม่"
              className="h-11 w-11 rounded-full hover:bg-parchment text-ink-muted flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              title="ปิดผู้ช่วยด้านข้าง"
              aria-label="ปิดผู้ช่วยด้านข้าง"
              className="h-11 w-11 rounded-full hover:bg-parchment text-ink-muted flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Machine Context Banner */}
        <div className="mx-3 mt-2 rounded-[11px] bg-primary/10 border border-primary/20 text-xs text-ink-muted px-3 py-2 flex items-center justify-between gap-2 shrink-0">
          <span className="flex items-center gap-1.5 truncate">
            <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
            {/* Sensor readings are appended only when they exist. With none
                installed this banner read "Spindle — · แรงสั่นสะเทือน —", which is
                two dangling labels claiming instruments that aren't there. */}
            <span className="truncate">
              เครื่อง: {orDash(activeMachine.code)} ({activeMachine.name})
              {activeMachine.spindleTemp != null
                ? ` · Spindle ${formatWithUnit(activeMachine.spindleTemp, "°C", 1)}`
                : ""}
              {activeMachine.vibrationMms != null
                ? ` · แรงสั่นสะเทือน ${formatWithUnit(activeMachine.vibrationMms, "mm/s", 2)}`
                : ""}
            </span>
          </span>
          <span className="text-xs font-semibold text-primary bg-white px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
            {userRoleLabel(currentUserRole)}
          </span>
        </div>

        <AssistantConversation
          chat={chat}
          activeMachine={activeMachine}
          currentUserName={currentUserName}
          variant="drawer"
          onAutoCreateWorkOrder={onAutoCreateWorkOrder}
          onOpenCreateWorkOrderModal={onOpenCreateWorkOrderModal}
          onAfterAction={onClose}
        />
      </div>
    </div>
  );
};
