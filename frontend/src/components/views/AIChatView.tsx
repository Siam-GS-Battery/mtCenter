import React, { useEffect, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { Machine, UserRole } from "../../types";
import { getAiMode } from "../../services/apiService";
import {
  AssistantConversation,
  useAssistantChat,
} from "../ai/AssistantConversation";
import type { WorkOrderPrefill } from "../../lib/aiActions";

interface AIChatViewProps {
  /** null = ไม่มีเครื่องจักรเลือกอยู่ — แชทจะตอบแบบภาพรวมทั้งฟลีตแทน */
  activeMachine: Machine | null;
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

  // โหมดที่เซิร์ฟเวอร์ตั้งไว้ ใช้แสดงป้ายบอกผู้ใช้ว่ากำลังคุยกับอะไร
  // null = ยังไม่รู้ (กำลังโหลด หรือถามเซิร์ฟเวอร์ไม่ได้) — กรณีนั้นไม่แสดงป้ายเลย
  // ดีกว่าเดาแล้วแสดงผิด
  const [aiMode, setAiMode] = useState<"mock" | "live" | null>(null);
  useEffect(() => {
    let cancelled = false;
    getAiMode()
      .then(({ mode }) => {
        if (!cancelled) setAiMode(mode);
      })
      .catch(() => {
        // เงียบได้: ป้ายบอกโหมดเป็นข้อมูลประกอบ ไม่ควรขึ้น error รบกวนการใช้งานแชต
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
                {/* บอกตรง ๆ ว่าโหมดสาธิตตอบด้วยกฎ ไม่ใช่โมเดลภาษา — ผู้ชมการสาธิต
                    ต้องรู้ว่ากำลังดูอะไร ไม่ใช่เข้าใจว่าเป็น AI แล้วประเมินผลผิด */}
                {aiMode === "mock" && (
                  <span
                    title="ตอบจากกฎเกณฑ์และข้อมูลจริงในฐานข้อมูล ไม่ได้เรียกโมเดลภาษา"
                    className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold shrink-0"
                  >
                    โหมดสาธิต (กฎ + ข้อมูลจริง)
                  </span>
                )}
                <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold truncate">
                  {activeMachine ? `${activeMachine.code} · ${activeMachine.name}` : "ภาพรวมเครื่องจักรทั้งหมด"}
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
