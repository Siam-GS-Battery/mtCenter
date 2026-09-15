// แผงแสดงขั้นตอนที่ผู้ช่วย AI กำลังทำระหว่างสตรีมคำตอบ (อ่านค่าเครื่องจักร,
// ดึงประวัติใบงาน, ค้นคู่มือ, ฯลฯ) — แยกออกมาจาก AssistantConversation เพื่อไม่ให้
// คอมโพเนนต์นั้นบวมเกินไป ใช้ label/detail ที่ backend ส่งมาตรง ๆ ไม่ hardcode
// ข้อความเอง เพื่อไม่ให้สองฝั่งเพี้ยนไปจากกัน

import React from "react";
import { ChevronDown, ChevronRight, Loader2, Check } from "lucide-react";
import type { AiChatStreamStepEvent } from "../../services/apiService";

export interface ThinkingStepsProps {
  steps: AiChatStreamStepEvent[];
  /** true ระหว่างกำลังสตรีมคำตอบนี้อยู่ — บังคับกางแผงเสมอ ไม่ว่า expanded จะเป็นอะไร */
  streaming: boolean;
  /** พับ/กางแผง มีผลเฉพาะตอน !streaming (ระหว่างสตรีมจะกางเสมอให้เห็นความคืบหน้า) */
  expanded: boolean;
  onToggleExpanded: () => void;
}

export const ThinkingSteps: React.FC<ThinkingStepsProps> = ({
  steps,
  streaming,
  expanded,
  onToggleExpanded,
}) => {
  if (steps.length === 0) return null;

  // เสร็จแล้วและผู้ใช้ยังไม่กด "ดูขั้นตอน" — ยุบเหลือบรรทัดเดียว
  if (!streaming && !expanded) {
    return (
      <button
        type="button"
        onClick={onToggleExpanded}
        className="mb-2 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink cursor-pointer rounded px-1 py-0.5 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
      >
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span>ดูขั้นตอนการค้นหา ({steps.length} ขั้นตอน)</span>
      </button>
    );
  }

  return (
    <div
      aria-live="polite"
      className="mb-2 rounded-[14px] border border-hairline/60 bg-divider/60 px-3 py-2 space-y-1.5"
    >
      {!streaming && (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink cursor-pointer -mx-1 -mt-0.5 mb-1 px-1 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
        >
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          <span>ซ่อนขั้นตอนการค้นหา</span>
        </button>
      )}

      {steps.map((step) => (
        <div key={step.id} className="flex items-start gap-2 text-xs">
          {step.status === "start" ? (
            <Loader2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5 animate-spin motion-reduce:animate-none" />
          ) : step.status === "done" ? (
            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <span className="w-3.5 h-3.5 shrink-0 mt-0.5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/50" />
            </span>
          )}
          <span className={step.status === "skip" ? "text-ink-muted/70" : "text-ink-muted"}>
            {step.label}
            {step.detail && <span className="text-ink-muted/80"> — {step.detail}</span>}
          </span>
        </div>
      ))}
    </div>
  );
};
