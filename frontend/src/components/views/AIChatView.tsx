import React, { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, History, X } from "lucide-react";
import PixelAILogo from "../PixelAILogo";
import { Machine, UserRole } from "../../types";
import { getAiMode } from "../../services/apiService";
import {
  AssistantConversation,
  useAssistantChat,
} from "../ai/AssistantConversation";
import type { WorkOrderPrefill } from "../../lib/aiActions";
import { useAiChatSessions } from "../../hooks/useAiChatSessions";
import { AiChatHistoryPanel } from "../ai/AiChatHistoryPanel";

interface AIChatViewProps {
  /** null = ไม่มีเครื่องจักรเลือกอยู่ — แชทจะตอบแบบภาพรวมทั้งฟลีตแทน */
  activeMachine: Machine | null;
  /** รายชื่อเครื่องจักรทั้งหมดที่แอปโหลดไว้แล้ว — แหล่งเดียวกับหน้าภาพรวม/หน้าช่างเทคนิค */
  machines: Machine[];
  currentUserRole: UserRole;
  /** ชื่อผู้ใช้ปัจจุบัน — แสดงในแผงยืนยันก่อนสร้างใบงาน */
  currentUserName?: string;
  initialPrompt?: string;
  /**
   * เรียกกลับทันทีหลังจาก initialPrompt ถูกส่งไปถามแล้ว — ผู้เรียก (App.tsx)
   * ควรเคลียร์ prompt เป็น "" ทันที เพราะ AIChatView นี้ถูก mount/unmount
   * ตามแท็บ ("chat" tab เท่านั้น) ถ้าไม่เคลียร์ ครั้งถัดไปที่ผู้ใช้ออกจากแท็บ
   * แชตแล้วกลับเข้ามาใหม่ (remount) จะเจอ initialPrompt เดิมค้างอยู่และยิงถามซ้ำ
   */
  onInitialPromptConsumed?: () => void;
  onAutoCreateWorkOrder?: (prefilled: WorkOrderPrefill) => void;
  onOpenCreateWorkOrderModal?: (prefilled: WorkOrderPrefill) => void;
}

/**
 * Full-page assistant. Two-pane on desktop (ประวัติแชต + บทสนทนา), stacked
 * with a toggle on mobile. Conversations persist as sessions in localStorage
 * via useAiChatSessions; useAssistantChat stays the single source of chat
 * behavior shared with the drawer.
 */
export const AIChatView: React.FC<AIChatViewProps> = ({
  activeMachine,
  machines,
  currentUserRole,
  currentUserName,
  initialPrompt = "",
  onInitialPromptConsumed,
  onAutoCreateWorkOrder,
  onOpenCreateWorkOrderModal,
}) => {
  const sessionsApi = useAiChatSessions();
  const { sessions, activeSessionId, activeSession } = sessionsApi;

  // เครื่องจักรที่เลือกไว้ "ในหน้านี้เท่านั้น" — ไม่ผูกกับ activeMachine ของแอปทั้งหมด
  // เพื่อไม่ให้การเลือกเครื่องจักรตอนถาม AI ไปเปลี่ยนหน้าอื่น (เริ่มจาก activeMachine ที่ส่งมา)
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(activeMachine);
  const [historyOpenMobile, setHistoryOpenMobile] = useState(false);

  // กันไม่ให้ effect โหลด session แรกทับ session ที่ผู้ใช้กำลังสลับไปเอง
  const didInitRef = useRef(false);

  const chat = useAssistantChat(selectedMachine, currentUserRole, {
    initialMessages: activeSession?.messages,
    onMessagesChange: (messages) => {
      // ยังไม่มี session ที่กำลังใช้งาน (เพิ่งเข้าหน้านี้ + ยังไม่เคยเปิดแชตมาก่อน) —
      // สร้าง session ใหม่ก่อนบันทึก ไม่ให้บทสนทนาแรกของผู้ใช้หายไปเงียบ ๆ
      if (!activeSessionId) {
        // ข้อความต้อนรับเดี่ยว ๆ (ยังไม่มีคำถามจากผู้ใช้) ไม่จำเป็นต้องสร้าง session เปล่า
        if (messages.length <= 1) return;
        // createSession คืนค่า session ใหม่กลับมาทันที — เขียนลง session นั้นด้วย id
        // ตรง ๆ แทนที่จะพึ่ง activeSessionId ที่ปิดอยู่ (closure) ของ callback นี้ ซึ่ง
        // ยังเป็นค่าเก่า (null) จนกว่า re-render รอบถัดไป มิเช่นนั้น updateActiveSession
        // จะ no-op และข้อความแรกของผู้ใช้จะไม่ถูกบันทึกจนกว่าจะมีการเปลี่ยนแปลงครั้งถัดไป
        const newSession = sessionsApi.createSession(selectedMachine?.id ?? null);
        sessionsApi.updateSession(newSession.id, { messages });
        return;
      }
      sessionsApi.updateActiveSession({ messages });
    },
  });

  // เข้าหน้านี้ครั้งแรก: ถ้ามี session ล่าสุดอยู่แล้วให้เลือกเครื่องจักรตาม session นั้น
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (activeSession) {
      const machine = machines.find((m) => m.id === activeSession.machineId) ?? null;
      setSelectedMachine(machine);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const machineLabelById = useMemo(() => {
    const byId = new Map(machines.map((m) => [m.id, m]));
    return (machineId: string | null): string | null => {
      if (!machineId) return null;
      const m = byId.get(machineId);
      return m ? `${m.code ?? ""} ${m.name}`.trim() : null;
    };
  }, [machines]);

  const handleNewChat = () => {
    sessionsApi.createSession(selectedMachine?.id ?? null);
    chat.hydrate([]);
    setHistoryOpenMobile(false);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    sessionsApi.selectSession(sessionId);
    const machine = machines.find((m) => m.id === session.machineId) ?? null;
    setSelectedMachine(machine);
    chat.hydrate(session.messages);
    setHistoryOpenMobile(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    const wasActive = sessionId === activeSessionId;
    sessionsApi.deleteSession(sessionId);
    if (!wasActive) return;
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      setSelectedMachine(activeMachine);
      chat.hydrate([]);
      return;
    }
    const newest = [...remaining].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    sessionsApi.selectSession(newest.id);
    const machine = machines.find((m) => m.id === newest.machineId) ?? null;
    setSelectedMachine(machine);
    chat.hydrate(newest.messages);
  };

  const handleSelectMachineForChat = (machine: Machine | null) => {
    // แค่เปลี่ยนบริบทเครื่องจักรที่จะส่งไปกับคำถามถัดไป — ไม่ล้างบทสนทนาปัจจุบัน
    // ต้องเรียกก่อน setSelectedMachine ในรอบ event เดียวกัน เพื่อกัน effect
    // เปลี่ยนเครื่องจักรใน useAssistantChat ที่จะ reset ข้อความทิ้ง
    chat.suppressNextMachineReset();
    setSelectedMachine(machine);
    if (activeSessionId) {
      sessionsApi.updateActiveSession({ machineId: machine?.id ?? null });
    }
  };

  const handleClearMachineForChat = () => handleSelectMachineForChat(null);

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

  // ลายเซ็นของ prompt ล่าสุดที่ส่งไปแล้ว — กันยิงซ้ำสองครั้งจาก React 19
  // StrictMode (dev mode เรียก effect เดิมซ้ำด้วย props ชุดเดิม) เคลียร์เป็น
  // null ทุกครั้งที่ prompt ว่าง เพื่อให้ถามคำถามเดิมซ้ำได้จริงถ้าตั้งใจกดถามอีกครั้ง
  const consumedPromptRef = useRef<string | null>(null);
  useEffect(() => {
    if (!initialPrompt || initialPrompt.trim() === "") {
      consumedPromptRef.current = null;
      return;
    }
    if (consumedPromptRef.current === initialPrompt) return;
    consumedPromptRef.current = initialPrompt;
    chat.send(initialPrompt);
    // ใช้ prompt นี้ไปแล้ว — บอกผู้เรียกให้เคลียร์ทันที (one-shot consume) ไม่งั้น
    // ออกจากแท็บแชตแล้วกลับเข้ามาใหม่ (component นี้ mount/unmount ตามแท็บ) จะเจอ
    // initialPrompt เดิมค้างอยู่ตอน mount รอบใหม่ และยิงถามซ้ำ
    onInitialPromptConsumed?.();
    // ส่งคำถามตั้งต้นเมื่อมีคำถามใหม่ส่งเข้ามาจากหน้าอื่นเท่านั้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  return (
    <div className="bg-parchment h-[calc(100vh-5rem)] flex">
      {/* Desktop history sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col border-r border-hairline overflow-y-auto">
        <AiChatHistoryPanel
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          machineLabelById={machineLabelById}
          className="p-3"
        />
      </div>

      {/* Mobile history panel — overlay behind a toggle */}
      {historyOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setHistoryOpenMobile(false)}
          />
          <div className="relative bg-parchment w-[85%] max-w-xs h-full overflow-y-auto p-4 shadow-2xl">
            <button
              onClick={() => setHistoryOpenMobile(false)}
              aria-label="ปิดประวัติการแชต"
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-ink-muted hover:bg-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <AiChatHistoryPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              machineLabelById={machineLabelById}
              className="pt-8"
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <PixelAILogo className="w-4 h-4" />
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
                    className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold shrink-0"
                  >
                    โหมดสาธิต
                  </span>
                )}
                <span className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 rounded-full bg-ink/5 text-ink-muted text-xs truncate">
                  {selectedMachine ? `${selectedMachine.code} · ${selectedMachine.name}` : "ภาพรวมเครื่องจักรทั้งหมด"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setHistoryOpenMobile((v) => !v)}
              aria-label="ประวัติการแชต"
              title="ประวัติการแชต"
              className="lg:hidden w-9 h-9 rounded-full text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewChat}
              aria-label="เริ่มการสนทนาใหม่"
              title="เริ่มการสนทนาใหม่"
              className="w-9 h-9 rounded-full text-ink-muted hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 flex-1 min-h-0 flex flex-col">
            <AssistantConversation
              chat={chat}
              activeMachine={selectedMachine}
              currentUserName={currentUserName}
              variant="page"
              onAutoCreateWorkOrder={onAutoCreateWorkOrder}
              onOpenCreateWorkOrderModal={onOpenCreateWorkOrderModal}
              machines={machines}
              onSelectMachineForChat={(machine) =>
                machine ? handleSelectMachineForChat(machine) : handleClearMachineForChat()
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
