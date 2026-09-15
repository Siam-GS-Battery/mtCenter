// เมนูแนบเครื่องจักรแบบกะทัดรัดสำหรับปุ่ม "+" ในคอมโพสเซอร์ผู้ช่วย AI — ต่างจาก
// MachineSelect ที่เป็น dropdown เต็มรูปแบบ (มีกล่องเครื่องจักรที่เลือกอยู่ ช่องค้นหา
// ใหญ่ ชิปกรองสถานะ 5 ปุ่ม และรายการแถวสองบรรทัด) เมนูนี้ตั้งใจให้เล็กและแบน
// คล้ายเมนู "+" ของ Claude: ช่องค้นหาบาง ๆ + รายการแถวเดียวจบ ไม่มีชิปกรองสถานะ
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { Machine } from "../../types";
import { machineStatusDotClass, machineStatusLabel } from "../../lib/pillStyles";

const MAX_ROWS = 50;

// ใช้ localStorage key เดียวกับ MachineSelect.tsx (frontend/src/components/MachineSelect.tsx:32)
// เพื่อให้รายการ "ล่าสุด" ใช้ร่วมกันระหว่างสองที่ — ไม่แก้ MachineSelect.tsx ตามคำสั่ง
// จึงคัดลอก helper สั้น ๆ มาไว้ที่นี่แทนแยกเป็นโมดูลกลาง
const RECENTS_KEY = "mtcenter.recentMachineIds";
const MAX_RECENTS = 5;

function readRecentIds(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(parsed.filter((id): id is string => typeof id === "string"))
    ).slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

function pushRecentId(id: string): string[] {
  const current = readRecentIds().filter((existing) => existing !== id);
  const next = [id, ...current].slice(0, MAX_RECENTS);
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // localStorage อาจใช้ไม่ได้ (โหมดส่วนตัว) — ยอมรับได้ ไม่บันทึกก็เพียงแค่ไม่มีลัดล่าสุด
  }
  return next;
}

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
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    inputRef.current?.focus();
    setRecentIds(readRecentIds());
  }, []);

  const isFiltering = term.trim().length > 0;

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

  // เมื่อไม่ได้ค้นหา แสดงกลุ่ม "ล่าสุด" ก่อน — เก็บเครื่องจักรที่อยู่ในเครื่องปัจจุบันไว้ด้วย
  // (ไม่ตัดออก) เพื่อให้พฤติกรรมเหมือน MachineSelect.tsx และเห็นเครื่องหมายถูกได้ตรงจุด
  const recentMachines = useMemo(() => {
    if (isFiltering) return [];
    const byId = new Map(machines.map((m) => [m.id, m]));
    return recentIds.map((id) => byId.get(id)).filter((m): m is Machine => Boolean(m));
  }, [machines, recentIds, isFiltering]);

  // ลำดับแถวจริงตามที่แสดงบนจอ (ล่าสุด + ทั้งหมด เมื่อไม่ค้นหา, หรือแค่ผลค้นหาเมื่อค้นหา)
  // ใช้ลำดับนี้เป็น index เดียวสำหรับ keyboard nav ไม่ให้ label กลุ่มมาขวาง
  const flatRows: Machine[] = isFiltering ? visible : [...recentMachines, ...visible];

  useEffect(() => {
    setHighlight(0);
  }, [term]);

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, flatRows.length);
  }, [flatRows.length]);

  useEffect(() => {
    const el = rowRefs.current[highlight];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const selectMachine = (machine: Machine) => {
    setRecentIds(pushRecentId(machine.id));
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
      setHighlight((h) => Math.min(h + 1, flatRows.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const machine = flatRows[highlight];
      if (machine) selectMachine(machine);
    }
  };

  const renderRow = (machine: Machine, idx: number) => {
    const isActive = machine.id === activeMachineId;
    return (
      <button
        key={machine.id}
        ref={(el) => {
          rowRefs.current[idx] = el;
        }}
        type="button"
        role="option"
        aria-selected={isActive}
        aria-label={`${machine.code ?? "-"} ${machine.name} สถานะ ${machineStatusLabel(machine.status)}`}
        onClick={() => selectMachine(machine)}
        onMouseEnter={() => setHighlight(idx)}
        className={`w-full px-3 py-2 text-left text-sm hover:bg-ink/5 flex items-center gap-2 cursor-pointer ${
          highlight === idx ? "bg-ink/5" : ""
        }`}
      >
        <span className={machineStatusDotClass(machine.status)} />
        <span className="sr-only">{machineStatusLabel(machine.status)}</span>
        <span className="font-medium text-ink shrink-0">{machine.code ?? "-"}</span>
        <span className="text-ink-muted truncate">{machine.name}</span>
        {isActive && <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />}
      </button>
    );
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
        {flatRows.length === 0 ? (
          <p className="px-3 py-4 text-sm text-ink-muted text-center">ไม่พบเครื่องจักร</p>
        ) : (
          <>
            {!isFiltering && recentMachines.length > 0 && (
              <div role="group" aria-label="ล่าสุด">
                <p
                  role="presentation"
                  className="text-xs uppercase tracking-wide text-ink-muted px-3 py-1.5"
                >
                  ล่าสุด
                </p>
                {recentMachines.map((machine, i) => renderRow(machine, i))}
              </div>
            )}
            {!isFiltering && (
              <p
                role="presentation"
                className="text-xs uppercase tracking-wide text-ink-muted px-3 py-1.5"
              >
                ทั้งหมด
              </p>
            )}
            <div role={isFiltering ? undefined : "group"} aria-label={isFiltering ? undefined : "ทั้งหมด"}>
              {visible.map((machine, i) =>
                renderRow(machine, isFiltering ? i : recentMachines.length + i)
              )}
            </div>
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
