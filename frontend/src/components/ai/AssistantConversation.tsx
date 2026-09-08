// The one assistant. Both the full-page assistant (AIChatView) and the
// side drawer (AIAssistantDrawer) render this component over the same
// `useAssistantChat` state, so a technician reaching the assistant from the
// sidebar, the drawer, or a per-card sparkle gets identical behavior, copy,
// preset questions and confirmation panel. Only layout density varies.

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  ArrowUp,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Wrench,
  RefreshCw,
  Copy,
  Check,
  ClipboardList,
  Thermometer,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Plus,
  X,
} from "lucide-react";
import { Machine, UserRole, ChatMessage } from "../../types";
import PixelAILogo from "../PixelAILogo";
import { MicDictationButton } from "../MicDictationButton";
import { MachineAttachMenu } from "./MachineAttachMenu";
import { aiChat, aiFeedback, type AiMode } from "../../services/apiService";
import {
  hasWorkOrderAction,
  buildWorkOrderPrefill,
  buildWelcomeMessage,
  buildPresetQuestions,
  formatChatMarkdown,
  WorkOrderPrefill,
} from "../../lib/aiActions";
import { priorityLabel } from "../../lib/pillStyles";
// กฎกำหนดเสร็จเริ่มต้นอยู่ที่เดียวกับที่ App ใช้บันทึกจริง แผงยืนยันจึงไม่มีทางบอกไม่ตรงกัน
import { DEFAULT_DUE_DAYS, defaultDueDate } from "../../lib/workOrderStatus";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  technician: "ช่างเทคนิค",
  engineer: "วิศวกร",
  supervisor: "หัวหน้างาน",
};

export function userRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] ?? role;
}

const AI_ERROR_TEXT =
  "เชื่อมต่อผู้ช่วย AI ไม่สำเร็จ คำถามยังไม่ถูกส่ง ตรวจสอบสัญญาณเครือข่ายแล้วกดลองอีกครั้ง";

// คำตอบสำรองแบบออฟไลน์ (ทุกโมเดล AI เรียกไม่สำเร็จ) — เตือนให้ตรวจสอบก่อนเชื่อ ไม่ใช่คำตอบจาก AI จริง
const AI_FALLBACK_NOTICE =
  "⚠️ ระบบ AI ไม่พร้อมใช้งานชั่วคราว — นี่เป็นคำตอบทั่วไปแบบออฟไลน์ ไม่ได้อ้างอิงข้อมูลเครื่องจักรจริง";

// เก็บ fallback ต่อข้อความ (ไม่ใช่ flag รวมของทั้งบทสนทนา) เพราะบางคำถามอาจตอบได้จริง บางคำถามอาจตกไปใช้คำตอบสำรอง
// mode/logId เก็บต่อข้อความเช่นเดียวกับ fallback: logId ใช้ผูกปุ่มให้ผลตอบรับกับคำตอบ
// ข้อนั้น ๆ (Frame 4 ของ UX Storyboard) และ mode ใช้บอกผู้ใช้ว่าคำตอบนี้มาจากกฎ
// (โหมดสาธิต) หรือจากโมเดลภาษาจริง
type ChatMessageWithFallback = ChatMessage & {
  fallback?: boolean;
  mode?: AiMode;
  logId?: number | null;
};

const chatMarkdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  h1: ({ children }) => <p className="font-semibold text-ink mb-2">{children}</p>,
  h2: ({ children }) => <p className="font-semibold text-ink mb-2">{children}</p>,
  h3: ({ children }) => <p className="font-semibold text-ink mb-2">{children}</p>,
  code: ({ children }) => (
    <code className="bg-divider text-primary rounded px-1 py-0.5 text-[0.85em] font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto bg-divider text-ink-muted rounded-[11px] p-3 text-xs mb-2">
      {children}
    </pre>
  ),
};

const nowTime = () =>
  new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

const today = () => new Date().toISOString().slice(0, 10);

export interface AssistantChat {
  messages: ChatMessageWithFallback[];
  isLoading: boolean;
  /** prompt ที่ส่งไม่สำเร็จ อ้างอิงด้วย id ของข้อความแจ้งข้อผิดพลาด */
  failedPrompts: Record<string, string>;
  send: (prompt: string) => void;
  retry: (errorMessageId: string) => void;
  reset: () => void;
  /**
   * โหลดข้อความของ session อื่นเข้ามาแทนของปัจจุบัน โดยไม่ให้ effect ที่คอย
   * reset ตอนเปลี่ยนเครื่องจักรมาทับ — ใช้เมื่อผู้เรียกกำลังสลับ session
   * (ซึ่งมักเปลี่ยนเครื่องจักรที่เลือกไปพร้อมกันด้วย) ต้องเรียกในรอบ event
   * เดียวกันกับที่เปลี่ยน activeMachine (ตัวแปรที่ส่งเข้า useAssistantChat)
   * เพื่อให้ React batch ทั้งสองการเปลี่ยนแปลงเข้าด้วยกัน
   */
  hydrate: (messages: ChatMessageWithFallback[]) => void;
  /**
   * เรียกก่อนเปลี่ยน activeMachine (ในรอบ event เดียวกัน) เมื่อต้องการแค่เปลี่ยน
   * บริบทเครื่องจักรที่จะส่งไปกับคำถามถัดไป โดยไม่ล้างบทสนทนาปัจจุบัน — ต่างจาก
   * hydrate ตรงที่ไม่แตะ messages/failedPrompts เลย
   */
  suppressNextMachineReset: () => void;
}

/**
 * Conversation state + the network call. Lives in the parent so the drawer
 * keeps its history while it is closed.
 */
export interface UseAssistantChatOptions {
  /** ข้อความเริ่มต้น — ใช้ตอน hydrate จาก session ที่บันทึกไว้ */
  initialMessages?: ChatMessageWithFallback[];
  /** เรียกทุกครั้งที่ messages เปลี่ยน — ใช้ mirror เข้า session storage */
  onMessagesChange?: (messages: ChatMessageWithFallback[]) => void;
}

export function useAssistantChat(
  activeMachine: Machine | null,
  currentUserRole: UserRole,
  options?: UseAssistantChatOptions
): AssistantChat {
  const welcome = (): ChatMessageWithFallback => ({
    id: `welcome-${Date.now()}`,
    sender: "assistant",
    text: buildWelcomeMessage(activeMachine),
    timestamp: "เมื่อสักครู่",
  });

  const [messages, setMessages] = useState<ChatMessageWithFallback[]>(
    () => options?.initialMessages && options.initialMessages.length > 0
      ? options.initialMessages
      : [welcome()]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [failedPrompts, setFailedPrompts] = useState<Record<string, string>>({});

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const failedRef = useRef(failedPrompts);
  failedRef.current = failedPrompts;

  const onMessagesChangeRef = useRef(options?.onMessagesChange);
  onMessagesChangeRef.current = options?.onMessagesChange;

  useEffect(() => {
    onMessagesChangeRef.current?.(messages);
  }, [messages]);

  // เปลี่ยนเครื่องจักร = บริบทใหม่ ทักทายด้วยค่าจริงของเครื่องนั้น (หรือทักทายแบบภาพรวม
  // ทั้งฟลีตถ้าไม่มีเครื่องจักรเลือกอยู่ — activeMachine เป็น null ได้)
  //
  // ข้อยกเว้น: ถ้าผู้เรียก (เช่นตอนสลับ session ในหน้าแชตเต็มหน้า) กำลังโหลด
  // ข้อความของ session อื่นเข้ามาพร้อม ๆ กับเปลี่ยนเครื่องจักร ไม่ควรให้ effect นี้
  // ทับด้วยข้อความทักทายใหม่ — ผู้เรียกส่ง skipNextResetRef.current = true ก่อน
  // เปลี่ยนทั้ง activeMachine และ messages ในรอบเดียวกันได้
  const machineIdRef = useRef(activeMachine?.id ?? null);
  const skipNextResetRef = useRef(false);
  useEffect(() => {
    const currentId = activeMachine?.id ?? null;
    if (machineIdRef.current === currentId) return;
    machineIdRef.current = currentId;
    if (skipNextResetRef.current) {
      skipNextResetRef.current = false;
      return;
    }
    setFailedPrompts({});
    setMessages([welcome()]);
  }, [activeMachine?.id]);

  const send = async (prompt: string) => {
    const textToSend = prompt.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: nowTime(),
    };

    // ข้อความแจ้งข้อผิดพลาดไม่ใช่คำตอบของผู้ช่วย จึงไม่ส่งกลับไปเป็นบริบท
    const history = messagesRef.current
      .filter((m) => !failedRef.current[m.id])
      .map((m) => ({ role: m.sender, content: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // apiService.ts types AiChatPayload.machineContext as a non-null `Machine`
      // (that file is out of scope for this change — other agents own it), but
      // aiChat() itself only JSON.stringifies the payload and never dereferences
      // machineContext, and the backend already treats a null/omitted
      // machineContext as a fleet-wide question. Only this field is cast; the
      // rest of the payload keeps full type-checking. The null value flows
      // through unchanged at runtime.
      const data = await aiChat({
        prompt: textToSend,
        machineContext: activeMachine as Machine,
        role: currentUserRole,
        history,
      });

      if (!data.success || !data.reply) throw new Error("ai_unavailable");

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: data.reply as string,
          timestamp: nowTime(),
          // ธงนี้เป็นของข้อความนี้เท่านั้น คำถามอื่นในบทสนทนาเดียวกันอาจได้คำตอบจริงตามปกติ
          fallback: data.fallback === true,
          mode: data.mode,
          logId: data.logId ?? null,
        },
      ]);
    } catch {
      const errorId = `err-${Date.now()}`;
      setFailedPrompts((prev) => ({ ...prev, [errorId]: textToSend }));
      setMessages((prev) => [
        ...prev,
        {
          id: errorId,
          sender: "assistant",
          text: AI_ERROR_TEXT,
          timestamp: nowTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const retry = (errorMessageId: string) => {
    const prompt = failedPrompts[errorMessageId];
    if (!prompt) return;

    setFailedPrompts((prev) => {
      const next = { ...prev };
      delete next[errorMessageId];
      return next;
    });

    // ลบข้อความแจ้งข้อผิดพลาดและคำถามเดิม แล้วถามใหม่ให้เหมือนถามครั้งแรก
    setMessages((prev) => {
      const withoutError = prev.filter((m) => m.id !== errorMessageId);
      const lastUser = [...withoutError].reverse().find((m) => m.sender === "user");
      return lastUser && lastUser.text === prompt
        ? withoutError.filter((m) => m.id !== lastUser.id)
        : withoutError;
    });

    send(prompt);
  };

  const reset = () => {
    setFailedPrompts({});
    setMessages([welcome()]);
  };

  const hydrate = (nextMessages: ChatMessageWithFallback[]) => {
    skipNextResetRef.current = true;
    setFailedPrompts({});
    setMessages(nextMessages.length > 0 ? nextMessages : [welcome()]);
  };

  const suppressNextMachineReset = () => {
    skipNextResetRef.current = true;
  };

  return {
    messages,
    isLoading,
    failedPrompts,
    send,
    retry,
    reset,
    hydrate,
    suppressNextMachineReset,
  };
}

interface AssistantConversationProps {
  chat: AssistantChat;
  /** null = ไม่มีเครื่องจักรเลือกอยู่ — ยังคุยได้ (ตอบแบบภาพรวมทั้งฟลีต) แต่เปิดใบงานซ่อมไม่ได้ */
  activeMachine: Machine | null;
  /** ชื่อผู้ใช้ปัจจุบัน — แสดงในแผงยืนยันว่าใบงานจะถูกบันทึกในชื่อใคร */
  currentUserName?: string;
  /** ความหนาแน่นของเลย์เอาต์เท่านั้น พฤติกรรมและข้อความเหมือนกันทุกช่องทาง */
  variant?: "page" | "drawer";
  onAutoCreateWorkOrder?: (prefilled: WorkOrderPrefill) => void;
  onOpenCreateWorkOrderModal?: (prefilled: WorkOrderPrefill) => void;
  /** เรียกหลังผู้ใช้สั่งสร้างใบงาน/เปิดฟอร์ม — drawer ใช้ปิดตัวเองไม่ให้บังใบงาน */
  onAfterAction?: () => void;
  /**
   * รายชื่อเครื่องจักรทั้งหมด — ใช้กับปุ่ม "+" แนบเครื่องจักรในคอมโพสเซอร์
   * (แสดงเฉพาะ variant="page" เท่านั้น — drawer มีบริบทเครื่องจักรอยู่แล้วที่อื่น)
   */
  machines?: Machine[];
  /** เลือกเครื่องจักรจากตัวเลือก "+" แนบเครื่องจักร */
  onSelectMachineForChat?: (machine: Machine | null) => void;
}

export const AssistantConversation: React.FC<AssistantConversationProps> = ({
  chat,
  activeMachine,
  currentUserName,
  variant = "page",
  onAutoCreateWorkOrder,
  onOpenCreateWorkOrderModal,
  onAfterAction,
  machines,
  onSelectMachineForChat,
}) => {
  const isPage = variant === "page";
  const { messages, isLoading, failedPrompts, send, retry } = chat;

  const [inputPrompt, setInputPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmingActionId, setConfirmingActionId] = useState<string | null>(null);
  // ผลตอบรับที่ผู้ใช้ให้ไว้ ต่อ id ของข้อความ (Frame 4) — เก็บในหน่วยความจำของหน้าจอ
  // ค่าจริงถูกบันทึกที่เซิร์ฟเวอร์แล้ว ที่นี่เก็บไว้เพื่อแสดงสถานะปุ่มเท่านั้น
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 1 | -1>>({});
  const [feedbackPending, setFeedbackPending] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<Record<string, string>>({});

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const machinePickerRef = useRef<HTMLDivElement>(null);
  const [isMachinePickerOpen, setIsMachinePickerOpen] = useState(false);

  // ปิด popover แนบเครื่องจักรเมื่อคลิกนอกกล่อง หรือกด Escape
  useEffect(() => {
    if (!isMachinePickerOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        machinePickerRef.current &&
        !machinePickerRef.current.contains(event.target as Node)
      ) {
        setIsMachinePickerOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMachinePickerOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMachinePickerOpen]);

  const presetQuestions = buildPresetQuestions(activeMachine);
  const presetIcons = [Thermometer, Wrench, ClipboardList, ShieldCheck];
  const hasUserMessage = messages.some((m) => m.sender === "user");

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [inputPrompt]);

  const handleSubmit = () => {
    if (!inputPrompt.trim() || isLoading) return;
    send(inputPrompt);
    setInputPrompt("");
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * ส่งผลตอบรับของคำตอบหนึ่งข้อ (Frame 4 ของ UX Storyboard)
   *
   * อัปเดตหน้าจอ "หลัง" เซิร์ฟเวอร์ตอบสำเร็จเท่านั้น ไม่ทำ optimistic update เพราะ
   * ปุ่มที่ติดค้างเป็น "บันทึกแล้ว" ทั้งที่บันทึกไม่สำเร็จ ทำให้ผู้ใช้เชื่อว่าความเห็น
   * ของตัวเองถูกเก็บไปแล้ว ซึ่งแย่กว่าการเห็นว่ากดไม่ติดแล้วกดใหม่
   */
  const handleFeedback = async (msgId: string, logId: number, value: 1 | -1) => {
    if (feedbackPending === msgId) return;
    setFeedbackPending(msgId);
    try {
      await aiFeedback(logId, value);
      setFeedbackGiven((prev) => ({ ...prev, [msgId]: value }));
      setFeedbackError((prev) => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
    } catch (error) {
      setFeedbackError((prev) => ({
        ...prev,
        [msgId]: error instanceof Error ? error.message : "บันทึกผลตอบรับไม่สำเร็จ",
      }));
    } finally {
      setFeedbackPending(null);
    }
  };

  const runAction = (fn?: (p: WorkOrderPrefill) => void, prefill?: WorkOrderPrefill) => {
    if (fn && prefill) fn(prefill);
    setConfirmingActionId(null);
    onAfterAction?.();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Conversation */}
      <div
        className={`flex-1 overflow-y-auto ${isPage ? "" : "bg-divider px-4 py-4"}`}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {!hasUserMessage ? (
          // เดิมใช้ h-full + justify-center บนคอนเทนเนอร์ที่ overflow-y-auto ได้ — เมื่อคำถาม
          // แนะนำล้นสูงกว่าพื้นที่ (เพิ่มจาก 3-4 เป็น 6-7 ข้อ) จะเจอบั๊ก flex-centering-overflow
          // คลาสสิก: เนื้อหาที่ล้นจากการจัดกึ่งกลางถูก "หนีบ" เท่า ๆ กันทั้งบนล่าง จนเลื่อนไปสุดปุ่มบนๆ
          // ไม่ได้ (เห็น/กดได้แค่ 2 ปุ่มแรก) — เอา justify-center ออก ให้ไหลจากบนลงล่างตามปกติ
          // แทน เนื้อหาสั้นยังดูกึ่งกลางได้ด้วย min-h-full + py
          <div className={`min-h-full flex flex-col items-center justify-center text-center px-2 py-8 ${isPage ? "mx-auto w-full max-w-3xl" : ""}`}>
            <div
              className={`rounded-full bg-primary/10 flex items-center justify-center mb-3 ${isPage ? "w-14 h-14" : "w-12 h-12"}`}
            >
              <PixelAILogo className={isPage ? "w-8 h-8 text-primary" : "w-6 h-6 text-primary"} />
            </div>
            <h3 className={`font-semibold text-ink ${isPage ? "text-2xl" : "text-base"}`}>
              สวัสดีครับ
            </h3>
            <p className="text-sm text-ink-muted mt-1 mb-5">
              มีอะไรให้ช่วยเรื่องงานซ่อมบำรุงไหมครับ
            </p>

            <div
              className={`w-full ${isPage ? "grid grid-cols-1 lg:grid-cols-2 gap-2" : "flex flex-col gap-2"}`}
            >
              {presetQuestions.map((q, idx) => {
                const Icon = presetIcons[idx % presetIcons.length] ?? Sparkles;
                return (
                  <button
                    key={idx}
                    onClick={() => send(q)}
                    disabled={isLoading}
                    className="min-h-11 rounded-xl border border-hairline/60 bg-white hover:border-hairline hover:bg-ink/[0.03] px-3.5 py-2.5 text-left flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                  >
                    <Icon className="w-4 h-4 text-ink-muted shrink-0" />
                    <span className="text-sm text-ink">{q}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`${isPage ? "mx-auto w-full max-w-3xl space-y-6 py-2 pb-4" : "space-y-5"}`}>
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="rounded-2xl bg-primary/10 text-ink px-4 py-2.5 max-w-[85%] ml-auto text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const showActionCard = hasWorkOrderAction(msg.text);
              // เปิดใบงานซ่อมต้องมีเครื่องจักรจริงเสมอ (buildWorkOrderPrefill ต้องการ
              // Machine ไม่ใช่ null) — ถ้ายังไม่มีเครื่องจักรเลือกอยู่ ให้แสดงคำแนะนำ
              // ให้เลือก/สแกนเครื่องก่อน แทนปุ่มสร้างใบงาน
              const prefill =
                showActionCard && activeMachine
                  ? buildWorkOrderPrefill(activeMachine, msg.text)
                  : null;
              const retryPrompt = failedPrompts[msg.id];

              return (
                <div key={msg.id} className="group flex items-start gap-3">
                  <div
                    className={`rounded-full bg-primary text-white flex items-center justify-center shrink-0 ${isPage ? "w-8 h-8" : "w-7 h-7"}`}
                  >
                    <PixelAILogo className={isPage ? "w-5 h-5" : "w-4 h-4"} />
                  </div>

                  <div className="min-w-0 flex-1">
                    {msg.text.includes("ข้อควรระวังความปลอดภัย") && (
                      <div className="mb-2 p-2.5 rounded-[18px] bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>โปรดใช้อุปกรณ์เซฟตี้ (PPE) และ Lockout-Tagout ก่อนเริ่มงาน</span>
                      </div>
                    )}

                    {/* AI เรียกไม่สำเร็จทุกโมเดล — คำตอบนี้เป็นข้อความสำรอง ต้องเตือนให้เห็นชัดแต่ไม่ตกใจ */}
                    {msg.fallback && (
                      <div className="mb-2 px-2.5 py-1.5 rounded-[18px] bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{AI_FALLBACK_NOTICE}</span>
                      </div>
                    )}

                    <div
                      className={`text-sm text-ink leading-relaxed break-words`}
                    >
                      <ReactMarkdown components={chatMarkdownComponents} remarkPlugins={[remarkGfm]}>
                        {formatChatMarkdown(msg.text)}
                      </ReactMarkdown>
                    </div>

                    {/* Retry — a failed question is not a dead end */}
                    {retryPrompt && (
                      <button
                        onClick={() => retry(msg.id)}
                        disabled={isLoading}
                        className="mt-2 min-h-11 px-4 py-2 rounded-full bg-white border border-hairline text-ink-muted hover:border-primary/40 hover:text-ink text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        <RefreshCw className="w-4 h-4 text-primary" />
                        <span>ลองอีกครั้ง</span>
                      </button>
                    )}

                    {/* ไม่มีเครื่องจักรเลือกอยู่ — บอกให้เลือก/สแกนเครื่องก่อน แทนปุ่มสร้างใบงาน */}
                    {showActionCard && !activeMachine && (
                      <div className="mt-3 rounded-[18px] border border-hairline bg-divider p-3 text-xs text-ink-muted">
                        กรุณาเลือกหรือสแกนเครื่องจักรก่อนเพื่อเปิดใบงานซ่อม
                      </div>
                    )}

                    {/* Work order action card */}
                    {showActionCard && prefill && activeMachine && (
                      <div className="mt-3 rounded-[18px] border border-primary/30 bg-primary/10 p-4 space-y-2.5 text-ink">
                        <div className="flex items-center gap-2 text-[13px] font-semibold">
                          <Wrench className="w-4 h-4 text-primary shrink-0" />
                          {/* ข้อความต้องตรงกับสิ่งที่ตัดสินใจจริง: ในโหมดสาธิตผู้เสนอคือ
                              กฎเกณฑ์ตามค่าตรวจวัด ไม่ใช่โมเดล AI การเขียนว่า "AI แนะนำ"
                              ทั้งที่เป็นกฎ คือการให้เครดิตผิดที่และทำให้คนดูเข้าใจระบบผิด */}
                          <span>
                            {msg.mode === "mock"
                              ? `ระบบประเมินตามเกณฑ์แล้วแนะนำให้เปิดใบงานซ่อมบำรุงสำหรับเครื่อง ${activeMachine.code}`
                              : `AI แนะนำให้เปิดใบงานซ่อมบำรุงสำหรับเครื่อง ${activeMachine.code}`}
                          </span>
                        </div>

                        {confirmingActionId === msg.id ? (
                          <div className="space-y-2.5 pt-1">
                            {/* ทุกอย่างที่จะถูกบันทึกจริง ไม่มีอะไรซ่อนไว้ */}
                            <dl className="rounded-[11px] bg-white/80 border border-primary/20 p-3 text-[13px] text-ink-muted space-y-1.5">
                              <div className="flex gap-2">
                                <dt className="font-semibold text-ink shrink-0">เครื่อง</dt>
                                <dd>
                                  {activeMachine.code} ({activeMachine.name})
                                </dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="font-semibold text-ink shrink-0">หัวข้อใบงาน</dt>
                                <dd>{prefill.title}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="font-semibold text-ink shrink-0">รายละเอียด</dt>
                                <dd className="line-clamp-4">{prefill.description}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="font-semibold text-ink shrink-0">ความสำคัญ</dt>
                                <dd>{priorityLabel(prefill.priority)}</dd>
                              </div>
                              {currentUserName && (
                                <div className="flex gap-2">
                                  <dt className="font-semibold text-ink shrink-0">ผู้รับผิดชอบ</dt>
                                  <dd>{currentUserName} (ผู้แจ้งและผู้ยืนยัน)</dd>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <dt className="font-semibold text-ink shrink-0">วันที่มอบหมาย</dt>
                                <dd className="tabular-nums">{today()}</dd>
                              </div>
                              <div className="flex gap-2">
                                <dt className="font-semibold text-ink shrink-0">กำหนดเสร็จ</dt>
                                <dd className="tabular-nums">
                                  {defaultDueDate()} (ค่าเริ่มต้นของระบบ {DEFAULT_DUE_DAYS} วัน)
                                </dd>
                              </div>
                            </dl>

                            <p className="text-xs text-ink-muted">
                              ใบงานนี้จะยังไม่มีขั้นตอนปฏิบัติงานและรายการอะไหล่ ช่างเพิ่มได้เองในหน้ารายละเอียดใบงาน
                            </p>

                            <div
                              className={`gap-2 ${isPage ? "flex flex-wrap items-center" : "flex flex-col"}`}
                            >
                              <button
                                onClick={() => runAction(onAutoCreateWorkOrder, prefill)}
                                className="min-h-11 px-4 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                              >
                                <Check className="w-4 h-4" />
                                <span>ยืนยันสร้างใบงาน</span>
                              </button>
                              <button
                                onClick={() => setConfirmingActionId(null)}
                                className="min-h-11 px-4 py-2.5 rounded-[11px] bg-pearl hover:bg-primary/5 text-ink-muted font-semibold text-[13px] border border-divider flex items-center justify-center cursor-pointer active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`gap-2 pt-1 ${isPage ? "flex flex-wrap items-center" : "flex flex-col"}`}
                          >
                            <button
                              onClick={() => setConfirmingActionId(msg.id)}
                              className="min-h-11 px-4 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                            >
                              <Wrench className="w-4 h-4" />
                              <span>สร้างใบงานจากคำแนะนำนี้</span>
                            </button>

                            <button
                              onClick={() => runAction(onOpenCreateWorkOrderModal, prefill)}
                              className="min-h-11 px-4 py-2.5 rounded-[11px] bg-pearl hover:bg-primary/5 text-ink-muted font-semibold text-[13px] border border-divider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                            >
                              <ClipboardList className="w-4 h-4" />
                              <span>เปิดแบบฟอร์มตรวจสอบก่อนส่ง</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-xs text-ink-muted">{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        aria-label="คัดลอกคำตอบของผู้ช่วย AI"
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition text-xs text-ink-muted hover:text-ink cursor-pointer flex items-center gap-1 rounded px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === msg.id ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                      </button>

                      {/* ผลตอบรับ (Frame 4) — แสดงเฉพาะคำตอบที่บันทึก log สำเร็จ
                          (มี logId) และไม่ใช่ข้อความแจ้งข้อผิดพลาด เพราะการให้ผู้ใช้กด
                          ประเมินคำตอบที่ระบบไม่ได้ผูกกับ log ใด ๆ คือปุ่มที่ไม่ทำอะไรเลย */}
                      {typeof msg.logId === "number" && !retryPrompt && (
                        <div className="flex items-center gap-1">
                          {feedbackGiven[msg.id] !== undefined ? (
                            <span className="text-xs text-ink-muted inline-flex items-center gap-1">
                              {feedbackGiven[msg.id] === 1 ? (
                                <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <ThumbsDown className="w-3.5 h-3.5 text-ink-muted" />
                              )}
                              <span>ขอบคุณสำหรับผลตอบรับ</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleFeedback(msg.id, msg.logId as number, 1)}
                                disabled={feedbackPending === msg.id}
                                aria-label="คำตอบนี้มีประโยชน์"
                                title="คำตอบนี้มีประโยชน์"
                                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition text-ink-muted hover:text-emerald-700 cursor-pointer rounded px-1 py-1 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(msg.id, msg.logId as number, -1)}
                                disabled={feedbackPending === msg.id}
                                aria-label="คำตอบนี้ไม่ตรงคำถาม"
                                title="คำตอบนี้ไม่ตรงคำถาม"
                                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition text-ink-muted hover:text-rose-700 cursor-pointer rounded px-1 py-1 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {feedbackError[msg.id] && (
                      <p className="mt-1 text-xs text-rose-700">{feedbackError[msg.id]}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full bg-primary text-white flex items-center justify-center shrink-0 ${isPage ? "w-8 h-8" : "w-7 h-7"}`}
                >
                  <PixelAILogo className={isPage ? "w-5 h-5" : "w-4 h-4"} />
                </div>
                <div className="flex items-center gap-2 text-ink-muted text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse" />
                  </span>
                  <span>กำลังคิด…</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Composer */}
      <div
        className={`shrink-0 ${isPage ? "pb-4 pt-2 bg-parchment" : "bg-white border-t border-hairline p-3"}`}
      >
        <div className={isPage ? "mx-auto w-full max-w-3xl" : ""}>
          {hasUserMessage && !isPage && (
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden -mx-4 px-4 pb-2 scrollbar-none">
              {presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => send(q)}
                  disabled={isLoading}
                  className="min-h-11 px-4 py-2 rounded-full border border-hairline bg-white hover:border-primary/40 hover:text-primary text-[13px] text-ink-muted transition-colors cursor-pointer active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 whitespace-nowrap shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative rounded-2xl border border-hairline bg-white shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 px-3 pt-2.5 pb-2 transition-all"
          >
            {isPage && activeMachine && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-xs text-ink">
                  <span className="font-semibold">{activeMachine.code}</span>
                  <span className="truncate max-w-[10rem]">{activeMachine.name}</span>
                  <button
                    type="button"
                    onClick={() => onSelectMachineForChat?.(null)}
                    aria-label="ยกเลิกการแนบเครื่องจักร"
                    className="ml-0.5 text-ink-muted hover:text-ink cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              aria-label="พิมพ์คำถามถึงผู้ช่วย AI"
              placeholder="พิมพ์คำถาม เช่น วิธีถอดประกอบ Spindle Bearing, รหัสข้อผิดพลาด Err-E304..."
              className="w-full resize-none bg-transparent outline-none border-0 focus:outline-none focus:ring-0 focus-visible:outline-none text-sm text-ink placeholder:text-ink-muted max-h-30 leading-6"
            />

            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1">
                {isPage && machines && (
                  <div className="relative" ref={machinePickerRef}>
                    <button
                      type="button"
                      onClick={() => setIsMachinePickerOpen((v) => !v)}
                      aria-label="แนบเครื่องจักร"
                      title="แนบเครื่องจักร"
                      className="rounded-full h-8 w-8 text-ink-muted hover:bg-ink/5 flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {isMachinePickerOpen && (
                      <div className="absolute bottom-full mb-2 left-0 z-30">
                        <MachineAttachMenu
                          machines={machines}
                          activeMachineId={activeMachine?.id ?? null}
                          onSelect={(m) => onSelectMachineForChat?.(m)}
                          onClose={() => setIsMachinePickerOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <MicDictationButton
                  currentValue={inputPrompt}
                  onTranscript={(text) => setInputPrompt((prev) => `${prev}${text}`)}
                  className="flex-row! items-center!"
                />
              </div>

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                aria-label="ส่งคำถาม"
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary-focus text-white disabled:opacity-40 disabled:bg-primary flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-xs text-ink-muted text-center mt-2">
            AI อาจให้ข้อมูลคลาดเคลื่อน โปรดตรวจสอบก่อนปฏิบัติงานจริง
          </p>
        </div>
      </div>
    </div>
  );
};
