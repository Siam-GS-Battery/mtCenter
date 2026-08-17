import React, { useEffect } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Machine, UserRole } from "../../types";
import {
  AssistantConversation,
  useAssistantChat,
} from "../ai/AssistantConversation";
import type { WorkOrderPrefill } from "../../lib/aiActions";

interface AIChatViewProps {
  activeMachine: Machine;
  currentUserRole: UserRole;
  /** ชื่อผู้ใช้ปัจจุบัน — แสดงในแผงยืนยันก่อนสร้างใบงาน */
  currentUserName?: string;
  initialPrompt?: string;
  onAutoCreateWorkOrder?: (prefilled: WorkOrderPrefill) => void;
  onOpenCreateWorkOrderModal?: (prefilled: WorkOrderPrefill) => void;
}

/**
 * Full-page assistant. The page owns only its header — the conversation
 * itself is the shared AssistantConversation, identical to the drawer.
 */
export const AIChatView: React.FC<AIChatViewProps> = ({
  activeMachine,
  currentUserRole,
  currentUserName,
  initialPrompt = "",
  onAutoCreateWorkOrder,
  onOpenCreateWorkOrderModal,
}) => {
  const chat = useAssistantChat(activeMachine, currentUserRole);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== "") {
      chat.send(initialPrompt);
    }
    // ส่งคำถามตั้งต้นเมื่อมีคำถามใหม่ส่งเข้ามาจากหน้าอื่นเท่านั้น
  }, [initialPrompt]);

  return (
    <div className="bg-parchment h-[calc(100vh-5rem)] flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full px-4 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-ink text-sm truncate">MT Center AI</h2>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>พร้อมใช้งาน</span>
                <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold truncate">
                  {activeMachine.code} · {activeMachine.name}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={chat.reset}
            aria-label="เริ่มการสนทนาใหม่"
            title="เริ่มการสนทนาใหม่"
            className="w-11 h-11 rounded-full text-ink-muted hover:text-ink hover:bg-white transition-colors cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <AssistantConversation
          chat={chat}
          activeMachine={activeMachine}
          currentUserName={currentUserName}
          variant="page"
          onAutoCreateWorkOrder={onAutoCreateWorkOrder}
          onOpenCreateWorkOrderModal={onOpenCreateWorkOrderModal}
        />
      </div>
    </div>
  );
};
