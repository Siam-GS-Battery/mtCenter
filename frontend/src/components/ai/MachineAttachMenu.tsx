// เมนูแนบเครื่องจักรแบบกะทัดรัดสำหรับปุ่ม "+" ในคอมโพสเซอร์ผู้ช่วย AI — ต่างจาก
// MachineSelect ที่เป็น dropdown เต็มรูปแบบ (มีกล่องเครื่องจักรที่เลือกอยู่ ช่องค้นหา
// ใหญ่ ชิปกรองสถานะ 5 ปุ่ม และรายการแถวสองบรรทัด) เมนูนี้ตั้งใจให้เล็กและแบน
// คล้ายเมนู "+" ของ Claude: ช่องค้นหาบาง ๆ + รายการแถวเดียวจบ ไม่มีชิปกรองสถานะ
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { Machine } from "../../types";

const MAX_ROWS = 50;

export interface MachineAttachMenuProps {
  machines: Machine[];
  activeMachineId: string | null;
  onSelect: (machine: Machine | null) => void;
  onClose: () => void;
}

export const MachineAttachMenu: React.FC<MachineAttachMenuProps> = ({
  machines,
  activeMachineId,
  onSelect,
  onClose,
}) => {
  const [term, setTerm] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return machines;
    return machines.filter((m) => {
      const code = (m.code ?? "").toLowerCase();
      const name = (m.name ?? "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [machines, term]);

  const visible = filtered.slice(0, MAX_ROWS);
  const extraCount = filtered.length - visible.length;

  useEffect(() => {
    setHighlight(0);
  }, [term]);

  const selectMachine = (machine: Machine) => {
    onSelect(machine);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, visible.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const machine = visible[highlight];
      if (machine) selectMachine(machine);
    }
  };

  return (
    <div className="w-72 rounded-xl border border-hairline bg-white shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 border-b border-hairline px-3 py-2">
        <Search className="w-3.5 h-3.5 text-ink-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหารหัส / ชื่อเครื่องจักร"
          aria-label="ค้นหารหัส / ชื่อเครื่องจักร"
          className="w-full bg-transparent outline-none border-0 focus-visible:outline-none text-sm text-ink placeholder:text-ink-muted"
        />
      </div>

      <div className="max-h-64 overflow-y-auto" role="listbox" aria-label="เลือกเครื่องจักร">
        {visible.length === 0 ? (
          <p className="px-3 py-4 text-sm text-ink-muted text-center">ไม่พบเครื่องจักร</p>
        ) : (
          <>
            {visible.map((machine, idx) => {
              const isActive = machine.id === activeMachineId;
              return (
                <button
                  key={machine.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => selectMachine(machine)}
                  onMouseEnter={() => setHighlight(idx)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-ink/5 flex items-center gap-2 cursor-pointer ${
                    highlight === idx ? "bg-ink/5" : ""
                  }`}
                >
                  <span className="font-medium text-ink shrink-0">{machine.code ?? "-"}</span>
                  <span className="text-ink-muted truncate">{machine.name}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />}
                </button>
              );
            })}
            {extraCount > 0 && (
              <p className="text-xs text-ink-muted px-3 py-2">
                พบอีก {extraCount} รายการ พิมพ์เพื่อค้นหาให้แคบลง
              </p>
            )}
          </>
        )}
      </div>

      {activeMachineId && (
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm text-ink-muted hover:bg-ink/5 border-t border-hairline cursor-pointer"
        >
          ยกเลิกการแนบเครื่องจักร
        </button>
      )}
    </div>
  );
};
