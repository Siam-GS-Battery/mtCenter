import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  SearchX,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { WorkOrder, UserRole } from "../../types";
import { WorkOrderDetailModal } from "../WorkOrderDetailModal";
import {
  WO_STATUS_LABELS,
  PRIORITY_LABELS,
  woStatusLabel,
  woStatusPillClass,
  priorityLabel,
  priorityPillClass,
} from "../../lib/pillStyles";
import {
  compareByUrgency,
  countOverdue,
  dueLabel,
  duePillClass,
  dueState,
  isOverdue,
} from "../../lib/workOrderStatus";
import { getWorkOrders, getCurrentUserId, toUserMessage } from "../../services/apiService";
import { Pagination } from "../ui/Pagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

interface AllWorkOrdersViewProps {
  currentUserRole?: UserRole;
  /** ชื่อผู้ใช้ปัจจุบัน — ใช้ประทับชื่อผู้เพิ่มขั้นตอนในใบงาน */
  currentUserName?: string;
  onUpdateWorkOrder?: (updatedWO: WorkOrder) => Promise<void>;
  onApproveWorkOrder?: (woId: string) => Promise<void>;
  onAskAI: (prompt: string) => void;
  /** เรียกเมื่อมีการเบิกอะไหล่จริงสำเร็จในใบงาน — ให้ App.tsx รีเฟรช spareParts */
  onStockChanged?: () => void;
}

// จำนวนใบงานต่อหน้าของตาราง
const PAGE_SIZE = 50;

type SortKey = "due" | "assigned" | "priority" | "status";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortKey, string> = {
  due: "กำหนดเสร็จ",
  assigned: "วันที่มอบหมาย",
  priority: "ความสำคัญ",
  status: "สถานะ",
};

/** ด่วนก่อน แล้วปกติ แล้วตามแผน */
const PRIORITY_ORDER: Record<WorkOrder["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** เรียงตามลำดับการทำงานจริง: รอดำเนินการ → กำลังซ่อม → รอตรวจสอบ → ปิดงาน */
const STATUS_ORDER: Record<WorkOrder["status"], number> = {
  pending: 0,
  in_progress: 1,
  review: 2,
  completed: 3,
};

export const AllWorkOrdersView: React.FC<AllWorkOrdersViewProps> = ({
  currentUserRole = "supervisor",
  currentUserName,
  onUpdateWorkOrder,
  onApproveWorkOrder,
  onAskAI,
  onStockChanged,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // ยิงค้นหาไป server หลังพิมพ์หยุด ~300ms กันยิงถี่ทุกตัวอักษร
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | WorkOrder["priority"]>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // ค่าเริ่มต้น: เรียงตามกำหนดเสร็จ ใบงานที่เลยกำหนดขึ้นก่อน
  const [sortKey, setSortKey] = useState<SortKey>("due");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ใบงานซ่อมทั้งหมดตอนนี้มี 8,589 รายการ เกินขนาดหน้าสูงสุดของ backend
  // (1,000) ไปมาก จึงค้นหา/กรองสถานะ/ความสำคัญ/ช่วงวันที่และแบ่งหน้าที่ server
  // แทน — คำค้นหาครอบคลุม id/code/title/description/machine_code/
  // machine_name_std (ดู backend/src/routes/workOrders.ts) แต่ "ไม่ครอบคลุม"
  // ชื่อช่างผู้ดูแล (technician_name ไม่มีอยู่ใน ilike clause นั้น) — ค้นหาด้วย
  // ชื่อช่างจึงยังหาไม่เจอถ้าช่างคนนั้นไม่ได้อยู่ในหน้าที่โหลดมาแล้ว เป็นข้อจำกัด
  // ของ endpoint ปัจจุบัน ไม่ใช่สิ่งที่แก้ได้จากฝั่ง frontend ---
  const [offset, setOffset] = useState(0);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch, statusFilter, priorityFilter, dateFrom, dateTo]);

  const fetchPage = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getWorkOrders({
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      limit: PAGE_SIZE,
      offset,
    })
      .then((res) => {
        if (cancelled) return;
        setWorkOrders(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(toUserMessage(err, "ไม่สามารถโหลดใบงานซ่อมบำรุงได้"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, priorityFilter, dateFrom, dateTo, offset]);

  useEffect(() => fetchPage(), [fetchPage]);

  // ใบงานที่ได้รับการอนุมัติ/แก้ไขจากในโมดัลไม่ได้คืนค่าใบงานที่อัปเดตกลับมาให้
  // ที่นี่โดยตรง (props เดิมคืน void) — รอให้ App บันทึกเสร็จก่อน แล้วโหลดหน้า
  // นี้ใหม่อีกครั้งเพื่อให้ตารางตรงกับข้อมูลจริงบนเซิร์ฟเวอร์เสมอ
  const handleModalUpdate = async (updatedWO: WorkOrder) => {
    await onUpdateWorkOrder?.(updatedWO);
    fetchPage();
  };
  const handleModalApprove = async (woId: string) => {
    await onApproveWorkOrder?.(woId);
    fetchPage();
  };

  const handleOpenWO = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setIsModalOpen(true);
  };

  const handleAskAI = (wo: WorkOrder) => {
    onAskAI(
      `ช่วยวิเคราะห์เชิงวิศวกรรมสำหรับใบงาน ${wo.code}: ${wo.title} (เครื่อง ${wo.machineName} ช่างผู้ดูแล ${wo.technicianName})`
    );
  };

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // เลยกำหนด — นับเฉพาะภายในหน้า/ตัวกรองปัจจุบันที่โหลดมาแล้ว ไม่ใช่ยอดรวมทั้ง
  // ระบบ เพราะ /api/work-orders/stats ยังไม่มีตัวเลข "เลยกำหนด" ให้ดึงมาแทน
  const overdueCount = useMemo(() => countOverdue(workOrders), [workOrders]);

  // ค้นหา/สถานะ/ความสำคัญ/ช่วงวันที่กรองที่ server หมดแล้ว (ดู fetchPage
  // ด้านบน) — เหลือแค่การเรียงลำดับ ซึ่งเรียงเฉพาะภายในหน้าที่โหลดมาแล้ว
  // (ธรรมชาติของการแบ่งหน้าแบบ offset/limit ไม่ใช่ข้อจำกัดใหม่จากรอบนี้)
  // "assigned" sorts on a real date string and needs missing dates pinned to
  // the end regardless of direction (an un-dated row must never read as the
  // newest or the oldest real work), so it handles sortDir itself instead of
  // going through the generic negation below.
  const compareAssigned = useCallback(
    (a: WorkOrder, b: WorkOrder): number => {
      const aMissing = !a.assignedDate;
      const bMissing = !b.assignedDate;
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      const cmp = (a.assignedDate as string).localeCompare(b.assignedDate as string);
      return sortDir === "asc" ? cmp : -cmp;
    },
    [sortDir]
  );

  const filteredOrders = useMemo(() => {
    const compare = (a: WorkOrder, b: WorkOrder) => {
      switch (sortKey) {
        case "due":
          return compareByUrgency(a, b);
        case "priority": {
          const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          return diff !== 0 ? diff : compareByUrgency(a, b);
        }
        case "status": {
          const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          return diff !== 0 ? diff : compareByUrgency(a, b);
        }
        default:
          return 0;
      }
    };

    return workOrders
      .slice()
      .sort((a, b) =>
        sortKey === "assigned"
          ? compareAssigned(a, b)
          : sortDir === "asc"
            ? compare(a, b)
            : -compare(a, b)
      );
  }, [workOrders, sortKey, sortDir, compareAssigned]);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";
  // ระบบไม่มีใบงานเลยจริง ๆ (ไม่ใช่แค่ตัวกรองปัจจุบันไม่เจอ)
  const hasNoWorkOrdersAtAll = total === 0 && !hasActiveFilters;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const ariaSortFor = (key: SortKey): "ascending" | "descending" | "none" =>
    sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none";

  const SortButton: React.FC<{ sortId: SortKey }> = ({ sortId }) => {
    const isActive = sortKey === sortId;
    const Icon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        onClick={() => toggleSort(sortId)}
        className={`inline-flex items-center gap-1 font-semibold cursor-pointer rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 ${
          isActive ? "text-ink" : "text-ink-muted hover:text-ink"
        }`}
      >
        <span>{SORT_LABELS[sortId]}</span>
        <Icon className="w-3.5 h-3.5" />
      </button>
    );
  };

  // ระหว่างโหลดครั้งแรก (ยังไม่เคยได้ผลลัพธ์จาก server เลยสักครั้ง) ต้องแสดง
  // สถานะกำลังโหลด ไม่ใช่ "ไม่มีใบงาน" ซึ่งเป็นข้อสรุปที่ยังพิสูจน์ไม่ได้
  const emptyState =
    isLoading && workOrders.length === 0 && total === 0 && !loadError ? (
      <div className="p-10 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
        <p className="text-[13px] text-ink-muted">กำลังโหลดใบงานซ่อมบำรุง...</p>
      </div>
    ) : hasNoWorkOrdersAtAll ? (
      <div className="p-10 text-center space-y-3">
        <FileText className="w-10 h-10 text-ink-muted mx-auto" />
        <p className="text-sm font-semibold text-ink">ยังไม่มีใบงานในระบบ</p>
        <p className="text-xs text-ink-muted">
          ใบงานจะแสดงที่นี่เมื่อมีการเปิดงานซ่อมบำรุงจากหน้าเครื่องจักร
        </p>
      </div>
    ) : (
      <div className="p-10 text-center space-y-3">
        <SearchX className="w-10 h-10 text-ink-muted mx-auto" />
        <p className="text-sm font-semibold text-ink">ไม่พบใบงานที่ตรงกับเงื่อนไขที่เลือก</p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="min-h-11 px-4 py-2 rounded-full bg-pearl hover:bg-parchment text-ink-muted border border-divider text-[13px] font-semibold cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
          >
            ล้างคำค้นและตัวกรอง
          </button>
        )}
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Summary — the page title itself lives in the top bar */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-hairline">
        <div className="text-[13px] text-ink-muted bg-parchment px-3.5 py-1.5 rounded-full">
          รวมทั้งสิ้น <span className="font-semibold text-ink">{total.toLocaleString("th-TH")} ใบงาน</span>
        </div>
        {overdueCount > 0 && (
          <div className="text-[13px] text-rose-900 bg-rose-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>เลยกำหนด {overdueCount} ใบงาน (ในหน้านี้)</span>
          </div>
        )}
        {isLoading && (
          <Loader2 className="w-4 h-4 text-ink-muted animate-spin" aria-label="กำลังโหลด" />
        )}
      </div>

      {loadError && (
        <div className="bg-rose-50 border border-rose-200 rounded-[18px] p-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">{loadError}</p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-55">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="ค้นหาใบงาน"
            placeholder="ค้นหาชื่อใบงาน รหัสใบงาน หรือชื่อเครื่อง (ทั้งหมด 8,589 ใบงาน)"
            className="w-full bg-white border border-hairline rounded-full pl-10 pr-10 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
          />
          {isLoading && (
            <Loader2
              className="w-4 h-4 text-ink-muted absolute right-3.5 top-3 animate-spin"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="กรองตามสถานะใบงาน"
            className="w-full sm:w-auto appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-10 py-2.5 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
          >
            <option value="all">สถานะทั้งหมด</option>
            {Object.entries(WO_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as "all" | WorkOrder["priority"])}
            aria-label="กรองตามความสำคัญ"
            className="w-full sm:w-auto appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-10 py-2.5 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
          >
            <option value="all">ความสำคัญทั้งหมด</option>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="all-wo-date-from" className="sr-only">
            วันที่มอบหมายตั้งแต่
          </label>
          <input
            id="all-wo-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="วันที่มอบหมายตั้งแต่"
            className="bg-white border border-hairline rounded-full px-3.5 py-2.5 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
          />
          <span className="text-[13px] text-ink-muted">ถึง</span>
          <label htmlFor="all-wo-date-to" className="sr-only">
            วันที่มอบหมายถึง
          </label>
          <input
            id="all-wo-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="วันที่มอบหมายถึง"
            className="bg-white border border-hairline rounded-full px-3.5 py-2.5 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
          />
        </div>

        {/* Sort control — mirrors the sortable table headers for small screens */}
        <div className="relative md:hidden">
          <select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(":") as [SortKey, SortDir];
              setSortKey(key);
              setSortDir(dir);
            }}
            aria-label="เรียงลำดับใบงาน"
            className="w-full appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-10 py-2.5 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
          >
            <option value="due:asc">กำหนดเสร็จ: เลยกำหนดก่อน</option>
            <option value="due:desc">กำหนดเสร็จ: ไกลที่สุดก่อน</option>
            <option value="priority:asc">ความสำคัญ: ด่วนก่อน</option>
            <option value="priority:desc">ความสำคัญ: ตามแผนก่อน</option>
            <option value="status:asc">สถานะ: รอดำเนินการก่อน</option>
            <option value="status:desc">สถานะ: ปิดงานก่อน</option>
            <option value="assigned:desc">วันที่มอบหมาย: ใหม่ไปเก่า</option>
            <option value="assigned:asc">วันที่มอบหมาย: เก่าไปใหม่</option>
          </select>
          <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-[18px] border border-hairline overflow-hidden">
        {/* Table for desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">
              รายการใบงานซ่อมบำรุงทั้งหมด เรียงตาม{SORT_LABELS[sortKey]}
            </caption>
            <thead>
              <tr className="bg-parchment border-b border-hairline text-xs font-semibold text-ink-muted">
                <th className="px-3 py-3">รหัสใบงาน</th>
                <th className="px-3 py-3">ชื่องานซ่อม</th>
                <th className="px-3 py-3">เครื่องจักร</th>
                <th className="px-3 py-3">ช่างผู้ดูแล</th>
                <th className="px-3 py-3" aria-sort={ariaSortFor("due")}>
                  <SortButton sortId="due" />
                </th>
                <th className="px-3 py-3" aria-sort={ariaSortFor("assigned")}>
                  <SortButton sortId="assigned" />
                </th>
                <th className="px-3 py-3" aria-sort={ariaSortFor("priority")}>
                  <SortButton sortId="priority" />
                </th>
                <th className="px-3 py-3" aria-sort={ariaSortFor("status")}>
                  <SortButton sortId="status" />
                </th>
                <th className="px-3 py-3 text-right">ผู้ช่วย AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider text-[13px]">
              {filteredOrders.map((wo) => {
                const due = dueState(wo);
                const late = isOverdue(wo);

                return (
                  <tr
                    key={wo.id}
                    className={`transition-colors ${late ? "bg-rose-50/60 hover:bg-rose-50" : "hover:bg-parchment"}`}
                  >
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleOpenWO(wo)}
                        aria-label={`เปิดรายละเอียดใบงาน ${wo.code}: ${wo.title}`}
                        className="font-mono font-semibold text-primary hover:underline cursor-pointer rounded px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        {wo.code}
                      </button>
                    </td>
                    <td className="px-3 py-3 font-semibold text-ink max-w-md truncate">
                      {wo.title}
                    </td>
                    <td className="px-3 py-3 text-ink-muted">{wo.machineName}</td>
                    <td className="px-3 py-3 text-ink-muted">{wo.technicianName}</td>
                    <td className="px-3 py-3">
                      <span className={duePillClass(due)}>{dueLabel(wo)}</span>
                    </td>
                    <td className="px-3 py-3 font-mono text-ink-muted tabular-nums">
                      {wo.assignedDate || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span className={priorityPillClass(wo.priority)}>
                        {priorityLabel(wo.priority)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={woStatusPillClass(wo.status)}>
                        {woStatusLabel(wo.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => handleAskAI(wo)}
                        aria-label={`ถามผู้ช่วย AI เกี่ยวกับใบงาน ${wo.code}`}
                        title="ถามผู้ช่วย AI เกี่ยวกับใบงานนี้"
                        className="w-11 h-11 inline-flex items-center justify-center rounded-full text-ink-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && emptyState}
        </div>

        {/* Card list for mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-parchment">
            <span className="text-xs font-semibold text-ink-muted">
              {filteredOrders.length} ใบงาน
            </span>
            <span className="text-xs text-ink-muted">
              เรียงตาม{SORT_LABELS[sortKey]}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            emptyState
          ) : (
            <ul className="divide-y divide-divider">
              {filteredOrders.map((wo) => {
                const due = dueState(wo);
                const late = isOverdue(wo);

                return (
                  <li
                    key={wo.id}
                    className={`p-4 space-y-2.5 ${late ? "bg-rose-50/60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => handleOpenWO(wo)}
                        aria-label={`เปิดรายละเอียดใบงาน ${wo.code}: ${wo.title}`}
                        className="min-w-0 text-left cursor-pointer rounded-[11px] px-0.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        <span className="font-mono text-[13px] font-semibold text-primary block">
                          {wo.code}
                        </span>
                        <span className="font-semibold text-sm text-ink leading-snug block">
                          {wo.title}
                        </span>
                      </button>

                      <button
                        onClick={() => handleAskAI(wo)}
                        aria-label={`ถามผู้ช่วย AI เกี่ยวกับใบงาน ${wo.code}`}
                        className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-full text-ink-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={duePillClass(due)}>{dueLabel(wo)}</span>
                      <span className={priorityPillClass(wo.priority)}>
                        {priorityLabel(wo.priority)}
                      </span>
                      <span className={woStatusPillClass(wo.status)}>
                        {woStatusLabel(wo.status)}
                      </span>
                    </div>

                    <div className="text-[13px] text-ink-muted space-y-0.5">
                      <div>เครื่อง: {wo.machineName}</div>
                      <div>ช่าง: {wo.technicianName}</div>
                      <div className="font-mono tabular-nums">
                        มอบหมาย: {wo.assignedDate || "—"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* แบ่งหน้า — ใช้ total ของทั้งระบบตามตัวกรองสถานะ/ความสำคัญ/ช่วงวันที่
          ปัจจุบัน (จาก meta) ไม่ใช่แค่จำนวนที่โหลดมาในหน้านี้ */}
      {total > 0 && (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={total}
          onOffsetChange={setOffset}
          isLoading={isLoading}
          itemLabel="ใบงาน"
        />
      )}

      {/* WORK ORDER FULL DETAIL MODAL */}
      <WorkOrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workOrder={selectedWO}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        currentUserId={getCurrentUserId() ?? undefined}
        onUpdateWorkOrder={handleModalUpdate}
        onApproveWorkOrder={handleModalApprove}
        onAskAI={onAskAI}
        onStockChanged={onStockChanged}
      />
    </div>
  );
};
