import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { Machine } from "../types";
import {
  machineStatusBadgeClass,
  machineStatusDotClass,
  machineStatusLabel,
} from "../lib/pillStyles";
import { NO_DATA } from "../lib/format";

export interface MachineSelectProps {
  machines: Machine[];
  /** null/undefined when no machine is selected yet — shows `placeholder` instead */
  activeMachine?: Machine | null;
  onSelectMachine: (machine: Machine) => void;
  /** optional wrapper className */
  className?: string;
  /** visible field label; default "เครื่องจักรที่กำลังตรวจสอบ" */
  label?: string;
  /** trigger text shown when activeMachine is null/undefined; default "เลือกเครื่องจักร" */
  placeholder?: string;
  /** show a red required-field asterisk after the label; default false */
  required?: boolean;
}

const RECENTS_KEY = "mtcenter.recentMachineIds";
const MAX_RECENTS = 5;
const MAX_ROWS = 80;

type StatusFilter = "all" | Machine["status"];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "error", label: "ผิดปกติ" },
  { value: "warning", label: "เฝ้าระวัง" },
  { value: "normal", label: "ปกติ" },
  { value: "maintenance", label: "ซ่อมบำรุง" },
];

/** อ่านรายการเครื่องจักรล่าสุดจาก localStorage — ปลอดภัยแม้อยู่ในโหมดส่วนตัว */
function readRecentIds(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // ข้อมูลใน localStorage แก้ไขจากภายนอกได้ — กันซ้ำและตัดจำนวนตอนอ่านด้วย
    // ไม่ใช่แค่ตอนเขียน (id ซ้ำจะทำให้ React key ในรายการ "ล่าสุด" ซ้ำกัน)
    return Array.from(
      new Set(parsed.filter((id): id is string => typeof id === "string"))
    ).slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

/** บันทึกเครื่องจักรที่เพิ่งเลือกไว้บนสุด สูงสุด MAX_RECENTS รายการ */
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

/** บรรทัดที่สองแบบมิวต์ — รวม factoryGroup / section / location ที่มีค่าเท่านั้น */
function subtitleOf(m: Machine): string | null {
  const parts = [m.factoryGroup, m.section, m.location].filter(
    (v): v is string => Boolean(v && v.trim())
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

function matchesQuery(m: Machine, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [m.code, m.name, m.location, m.section, m.productionName, m.factoryGroup];
  return fields.some((f) => f != null && f.toLowerCase().includes(q));
}

export const MachineSelect: React.FC<MachineSelectProps> = ({
  machines,
  activeMachine,
  onSelectMachine,
  className,
  label = "เครื่องจักรที่กำลังตรวจสอบ",
  placeholder,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Close on outside click or Escape — same pattern as TopBar's machine dropdown.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRecentIds(readRecentIds());
      setHighlightedIndex(0);
      // autofocus search input on open
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    setQuery("");
    setStatusFilter("all");
  }, [isOpen]);

  const isFiltering = query.trim().length > 0 || statusFilter !== "all";

  const filtered = useMemo(() => {
    const q = query.trim();
    return machines.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      return matchesQuery(m, q);
    });
  }, [machines, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: machines.length,
      normal: 0,
      warning: 0,
      error: 0,
      maintenance: 0,
    };
    machines.forEach((m) => {
      counts[m.status] = (counts[m.status] ?? 0) + 1;
    });
    return counts;
  }, [machines]);

  const recentMachines = useMemo(() => {
    if (isFiltering) return [];
    const byId = new Map(machines.map((m) => [m.id, m]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((m): m is Machine => Boolean(m));
  }, [machines, recentIds, isFiltering]);

  const visibleRows = filtered.slice(0, MAX_ROWS);
  const truncatedCount = filtered.length - visibleRows.length;

  // Flat list of rows actually rendered, in order — recent (when shown) then all —
  // used for keyboard navigation indices.
  const flatRows: Machine[] = isFiltering
    ? visibleRows
    : [...recentMachines, ...visibleRows];

  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, flatRows.length);
  }, [flatRows.length]);

  useEffect(() => {
    const el = rowRefs.current[highlightedIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const handleSelect = (machine: Machine) => {
    onSelectMachine(machine);
    setRecentIds(pushRecentId(machine.id));
    setQuery("");
    setIsOpen(false);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, flatRows.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const m = flatRows[highlightedIndex];
      if (m) handleSelect(m);
    }
  };

  const activeSubtitle = activeMachine ? subtitleOf(activeMachine) : null;

  const renderRow = (m: Machine, index: number) => {
    const isSelected = activeMachine ? m.id === activeMachine.id : false;
    const isHighlighted = index === highlightedIndex;
    const subtitle = subtitleOf(m);
    return (
      <button
        key={m.id}
        ref={(el) => {
          rowRefs.current[index] = el;
        }}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => handleSelect(m)}
        onMouseEnter={() => setHighlightedIndex(index)}
        className={`w-full text-left px-3 py-2.5 min-h-[52px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
          isHighlighted ? "bg-primary/10" : isSelected ? "bg-primary/5" : ""
        }`}
      >
        <div className="flex items-start gap-2 min-w-0">
          <span className={`${machineStatusDotClass(m.status)} mt-1.5`} />
          <div className="min-w-0">
            <div className="text-sm text-ink truncate">
              <span className="font-semibold">{m.code ?? NO_DATA}</span>
              <span className="text-ink-muted"> · {m.name}</span>
            </div>
            {subtitle && (
              <div className="text-xs text-ink-muted truncate max-w-[220px]">{subtitle}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={machineStatusBadgeClass(m.status)}>
            {machineStatusLabel(m.status)}
          </span>
          {isSelected && <Check className="w-4 h-4 text-primary" />}
        </div>
      </button>
    );
  };

  return (
    <div className={`relative ${className ?? ""}`} ref={containerRef}>
      <div className="text-xs font-medium text-ink-muted mb-1">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={
          activeMachine
            ? `${label} (เครื่องปัจจุบัน ${activeMachine.code ?? NO_DATA})`
            : label
        }
        className="w-full min-h-[56px] flex items-center justify-between gap-2 px-3 py-2 rounded-[11px] border border-hairline bg-white hover:bg-parchment transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeMachine ? (
            <>
              <span className={`${machineStatusDotClass(activeMachine.status)} shrink-0`} />
              <div className="min-w-0 text-left">
                <div className="text-sm text-ink truncate">
                  <span className="font-semibold">{activeMachine.code ?? NO_DATA}</span>
                  <span className="text-ink-muted"> · {activeMachine.name}</span>
                </div>
                {activeSubtitle && (
                  <div className="text-xs text-ink-muted truncate">{activeSubtitle}</div>
                )}
              </div>
            </>
          ) : (
            <div className="min-w-0 text-left">
              <div className="text-sm text-ink-muted truncate">
                {placeholder ?? "เลือกเครื่องจักร"}
              </div>
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-ink-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-45 w-full mt-1.5 bg-parchment rounded-[11px] shadow-2xl border border-hairline overflow-hidden"
        >
          <div className="p-2 border-b border-hairline bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-faint absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="ค้นหารหัส / ชื่อ / ตำแหน่ง"
                className="w-full pl-8 pr-2 py-2 text-sm rounded-lg border border-hairline bg-parchment text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(f.value);
                    setHighlightedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === f.value
                      ? "bg-primary text-white"
                      : "bg-parchment text-ink-muted hover:bg-chip-translucent border border-hairline"
                  }`}
                >
                  {f.label} ({statusCounts[f.value]})
                </button>
              ))}
            </div>
          </div>

          {/* role="listbox" ต้องอยู่บนกล่องรายการเท่านั้น — ไม่ครอบช่องค้นหา
              (listbox ห้ามมี textbox เป็นลูก) */}
          <div
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="max-h-[320px] overflow-y-auto bg-white"
          >
            {recentMachines.length > 0 && (
              <div role="group" aria-label="ล่าสุด">
                <div
                  aria-hidden="true"
                  className="sticky top-0 z-10 px-3 py-1 text-[11px] font-semibold text-ink-faint bg-parchment uppercase tracking-wide"
                >
                  ล่าสุด
                </div>
                {recentMachines.map((m, i) => renderRow(m, i))}
              </div>
            )}

            {visibleRows.length > 0 && (
              <div role="group" aria-label={`ทั้งหมด (${filtered.length})`}>
                <div
                  aria-hidden="true"
                  className="sticky top-0 z-10 px-3 py-1 text-[11px] font-semibold text-ink-faint bg-parchment uppercase tracking-wide"
                >
                  ทั้งหมด ({filtered.length})
                </div>
                {visibleRows.map((m, i) =>
                  renderRow(m, isFiltering ? i : recentMachines.length + i)
                )}
              </div>
            )}

            {visibleRows.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-ink-muted">
                ไม่พบเครื่องจักรที่ตรงกับการค้นหา
              </div>
            )}
          </div>

          {truncatedCount > 0 && (
            <div className="px-3 py-1.5 text-[11px] text-ink-faint bg-white border-t border-hairline">
              แสดง {MAX_ROWS} จาก {filtered.length} รายการ — พิมพ์เพื่อค้นหาเพิ่มเติม
            </div>
          )}
        </div>
      )}
    </div>
  );
};
