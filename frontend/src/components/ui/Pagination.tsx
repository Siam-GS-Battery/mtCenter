import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** จำนวนแถวที่ข้ามไป (offset) ของหน้าปัจจุบัน */
  offset: number;
  /** จำนวนแถวต่อหน้า */
  limit: number;
  /** จำนวนแถวทั้งหมดที่ตรงกับตัวกรองปัจจุบัน (จาก meta.total ของ backend) */
  total: number;
  onOffsetChange: (offset: number) => void;
  /** ยังโหลดหน้าถัดไปอยู่ — ปิดปุ่มไว้กันกดซ้ำ ไม่ใช่กันทั้งหน้าจอ */
  isLoading?: boolean;
  /** หน่วยนับของรายการ เช่น "รายการ" / "ใบงาน" — ใช้ในข้อความ "แสดง 1-50 จาก 8,588 รายการ" */
  itemLabel?: string;
  className?: string;
}

const th = (n: number) => n.toLocaleString("th-TH");

/**
 * ตัวควบคุมแบ่งหน้าแบบ offset/limit ที่ใช้ร่วมกันได้ทุกหน้ารายการยาว
 * (คลังอะไหล่ / ใบงานซ่อม ฯลฯ) — แสดง "แสดง X-Y จาก Z รายการ" พร้อมปุ่ม
 * ก่อนหน้า/ถัดไป ไม่มีเลขหน้าแบบสุ่มเข้าเพราะ backend เป็น offset/limit ล้วน
 */
export const Pagination: React.FC<PaginationProps> = ({
  offset,
  limit,
  total,
  onOffsetChange,
  isLoading = false,
  itemLabel = "รายการ",
  className = "",
}) => {
  if (total <= 0) return null;

  const from = Math.min(offset + 1, total);
  const to = Math.min(offset + limit, total);
  const canPrev = offset > 0 && !isLoading;
  const canNext = offset + limit < total && !isLoading;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
      role="navigation"
      aria-label="แบ่งหน้ารายการ"
    >
      <span className="text-[13px] text-ink-muted">
        แสดง{" "}
        <span className="font-semibold text-ink">
          {th(from)}-{th(to)}
        </span>{" "}
        จาก <span className="font-semibold text-ink">{th(total)}</span> {itemLabel}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={!canPrev}
          aria-label="หน้าก่อนหน้า"
          className="min-h-11 px-4 inline-flex items-center justify-center gap-1 rounded-full bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-parchment cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">ก่อนหน้า</span>
        </button>
        <button
          type="button"
          onClick={() => onOffsetChange(offset + limit)}
          disabled={!canNext}
          aria-label="หน้าถัดไป"
          className="min-h-11 px-4 inline-flex items-center justify-center gap-1 rounded-full bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-parchment cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span className="hidden sm:inline">ถัดไป</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
