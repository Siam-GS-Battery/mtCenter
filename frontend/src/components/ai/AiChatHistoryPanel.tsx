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
      <button
        type="button"
        onClick={onNewChat}
        className="w-full mb-3 px-3 py-2 rounded-lg border border-hairline text-ink text-[13px] font-medium flex items-center justify-center gap-1.5 cursor-pointer hover:bg-ink/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
      >
        <Plus size={16} />
        แชตใหม่
      </button>

      <span className="text-xs uppercase tracking-wide text-ink-muted mb-2 px-1">
        ประวัติการแชต
      </span>

      {sessions.length === 0 ? (
        <p className="text-[13px] text-ink-muted text-center mt-4">ยังไม่มีประวัติการแชต</p>
      ) : (
        <ul className="flex flex-col gap-0.5 overflow-y-auto max-h-[60vh] pr-0.5">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const machineLabel = machineLabelById?.(session.machineId) ?? null;
            const timestamp = formatSessionTimestamp(session.updatedAt);

            return (
              <li key={session.id}>
                <div
                  className={`group w-full rounded-lg p-2.5 flex items-center gap-2 transition-colors ${
                    isActive ? "bg-ink/5" : "hover:bg-ink/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 rounded-lg"
                  >
                    <MessageSquare size={15} className="flex-shrink-0 text-ink-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">{session.title}</p>
                      {(machineLabel || timestamp) && (
                        <p className="text-xs text-ink-muted truncate">
                          {machineLabel && timestamp
                            ? `${machineLabel} · ${timestamp}`
                            : machineLabel ?? timestamp}
                        </p>
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
                    className="flex-shrink-0 rounded-lg p-1.5 text-ink-muted hover:text-red-600 hover:bg-pearl transition-colors cursor-pointer opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                  >
                    <Trash2 size={14} />
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
