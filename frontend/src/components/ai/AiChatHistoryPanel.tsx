import React from "react";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { AiChatSession } from "../../hooks/useAiChatSessions";

export interface AiChatHistoryPanelProps {
  sessions: AiChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  /** optional label resolver สำหรับแสดงชื่อเครื่องจักรของแต่ละแชต */
  machineLabelById?: (machineId: string | null) => string | null;
  className?: string;
}

/** แปลง ISO timestamp เป็นข้อความไทยแบบสั้น เช่น "วันนี้ 14:32" / "19 ส.ค. 14:32" */
function formatSessionTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timePart = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  if (isToday) {
    return `วันนี้ ${timePart}`;
  }

  const datePart = date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  return `${datePart} ${timePart}`;
}

export function AiChatHistoryPanel({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  machineLabelById,
  className,
}: AiChatHistoryPanelProps) {
  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[13px] font-semibold text-ink">ประวัติการแชต</span>
        <button
          type="button"
          onClick={onNewChat}
          className="min-h-11 px-4 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
        >
          <Plus size={16} />
          แชตใหม่
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-[18px] border border-hairline bg-white p-3.5 text-center">
          <p className="text-[13px] text-ink-muted">ยังไม่มีประวัติการแชต</p>
          <p className="text-[12px] text-ink-muted mt-1">กดปุ่ม “แชตใหม่” เพื่อเริ่มการสนทนา</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] pr-0.5">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const machineLabel = machineLabelById?.(session.machineId) ?? null;
            const meta = [machineLabel, formatSessionTimestamp(session.updatedAt)]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={session.id}>
                <div
                  className={`w-full rounded-[18px] border p-3.5 flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? "border-primary/40 bg-divider"
                      : "border-hairline bg-white hover:bg-pearl"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 rounded-[11px]"
                  >
                    <MessageSquare size={16} className="flex-shrink-0 text-ink-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{session.title}</p>
                      {meta && (
                        <p className="text-[12px] text-ink-muted truncate">{meta}</p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="ลบประวัติการแชตนี้"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="flex-shrink-0 rounded-[11px] p-2 text-ink-muted hover:text-red-600 hover:bg-pearl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AiChatHistoryPanel;
