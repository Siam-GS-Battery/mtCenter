import React, { useMemo, useState } from "react";
import {
  FileBarChart,
  Download,
  Calendar,
  Search,
  Wrench,
  UserCheck,
  Inbox,
} from "lucide-react";
import { WorkOrder, Machine } from "../../types";
import {
  woStatusLabel,
  woStatusPillClass,
  priorityLabel,
  priorityPillClass,
  machineStatusLabel,
  machineStatusBadgeClass,
} from "../../lib/pillStyles";

interface SupervisorReportsViewProps {
  workOrders?: WorkOrder[];
  machines?: Machine[];
}

type ReportType = "summary" | "priority" | "tech";

const REPORT_TYPES: Array<{ id: ReportType; title: string; desc: string }> = [
  {
    id: "summary",
    title: "รายงานสรุปใบงานซ่อม",
    desc: "รายละเอียดใบงานทั้งหมดในเดือนที่เลือก",
  },
  {
    id: "priority",
    title: "รายงานตามระดับความสำคัญ",
    desc: "สัดส่วนใบงานตามระดับความสำคัญและจำนวนที่ปิดงานแล้ว",
  },
  {
    id: "tech",
    title: "รายงานผลงานช่างเทคนิค",
    desc: "จำนวนงานและคะแนนตรวจสอบ AI เฉลี่ยรายช่าง",
  },
];

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function monthKeyOf(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})/.exec(dateStr);
  return m ? `${m[1]}-${m[2]}` : null;
}

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${THAI_MONTHS[idx] ?? m} ${y}`;
}

interface PriorityRow {
  priority: WorkOrder["priority"];
  jobs: number;
  completed: number;
  sharePct: number;
}

interface TechRow {
  technician: string;
  jobs: number;
  completed: number;
  avgAiScore: number | null;
}

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  // UTF-8 BOM so Excel opens Thai text correctly
  const csv = String.fromCharCode(0xfeff) + rows.map((r) => r.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const SupervisorReportsView: React.FC<SupervisorReportsViewProps> = ({
  workOrders = [],
  machines = [],
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>("summary");
  const [searchTable, setSearchTable] = useState("");

  const machinesById = useMemo(() => {
    const map = new Map<string, Machine>();
    for (const m of machines) map.set(m.id, m);
    return map;
  }, [machines]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const wo of workOrders) {
      const k = monthKeyOf(wo.assignedDate);
      if (k) set.add(k);
    }
    return [...set].sort().reverse();
  }, [workOrders]);

  const effectiveMonth =
    selectedMonth && monthOptions.includes(selectedMonth) ? selectedMonth : monthOptions[0] ?? null;

  const monthOrders = useMemo(
    () => (effectiveMonth ? workOrders.filter((wo) => monthKeyOf(wo.assignedDate) === effectiveMonth) : []),
    [workOrders, effectiveMonth]
  );

  const filteredOrders = useMemo(() => {
    const q = searchTable.trim().toLowerCase();
    if (!q) return monthOrders;
    return monthOrders.filter(
      (wo) =>
        wo.code.toLowerCase().includes(q) ||
        wo.title.toLowerCase().includes(q) ||
        wo.machineName.toLowerCase().includes(q) ||
        (wo.machineCode ?? "").toLowerCase().includes(q) ||
        wo.technicianName.toLowerCase().includes(q)
    );
  }, [monthOrders, searchTable]);

  // KPI figures — computed only from the work orders assigned in the selected month
  const completedCount = monthOrders.filter((wo) => wo.status === "completed").length;
  const successRate = monthOrders.length > 0 ? Math.round((completedCount / monthOrders.length) * 100) : null;

  const scoredOrders = monthOrders.filter((wo) => typeof wo.aiVerificationScore === "number");
  const avgAiScore =
    scoredOrders.length > 0
      ? Math.round(
          scoredOrders.reduce((sum, wo) => sum + (wo.aiVerificationScore ?? 0), 0) / scoredOrders.length
        )
      : null;

  const topMachine = useMemo(() => {
    // machineId is null on every imported work order (the import never
    // resolved the FK), so grouping by it would bucket all 8,589 rows under
    // one null key. Group by machineCode instead, falling back to machineId
    // only when a row somehow lacks a code; rows with neither are excluded
    // rather than silently merged together.
    const counts = new Map<
      string,
      { machineCode?: string; machineId: string | null; machineName: string; count: number }
    >();
    for (const wo of monthOrders) {
      const key = wo.machineCode ?? wo.machineId;
      if (!key) continue;
      const entry = counts.get(key) || {
        machineCode: wo.machineCode,
        machineId: wo.machineId,
        machineName: wo.machineName,
        count: 0,
      };
      entry.count += 1;
      counts.set(key, entry);
    }
    return [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
  }, [monthOrders]);

  const machinesByCode = useMemo(() => {
    const map = new Map<string, Machine>();
    for (const m of machines) if (m.code) map.set(m.code, m);
    return map;
  }, [machines]);

  const topMachineRecord = topMachine
    ? (topMachine.machineCode ? machinesByCode.get(topMachine.machineCode) : undefined) ??
      (topMachine.machineId ? machinesById.get(topMachine.machineId) : undefined)
    : undefined;

  const priorityRows: PriorityRow[] = useMemo(() => {
    const levels: Array<WorkOrder["priority"]> = ["high", "medium", "low"];
    const total = filteredOrders.length;
    return levels
      .map((p) => {
        const rows = filteredOrders.filter((wo) => wo.priority === p);
        return {
          priority: p,
          jobs: rows.length,
          completed: rows.filter((wo) => wo.status === "completed").length,
          sharePct: total > 0 ? Math.round((rows.length / total) * 100) : 0,
        };
      })
      .filter((r) => r.jobs > 0);
  }, [filteredOrders]);

  const techRows: TechRow[] = useMemo(() => {
    const map = new Map<string, { jobs: number; completed: number; scoreSum: number; scoreCount: number }>();
    for (const wo of filteredOrders) {
      const entry = map.get(wo.technicianName) || { jobs: 0, completed: 0, scoreSum: 0, scoreCount: 0 };
      entry.jobs += 1;
      if (wo.status === "completed") entry.completed += 1;
      if (typeof wo.aiVerificationScore === "number") {
        entry.scoreSum += wo.aiVerificationScore;
        entry.scoreCount += 1;
      }
      map.set(wo.technicianName, entry);
    }
    return [...map.entries()]
      .map(([technician, e]) => ({
        technician,
        jobs: e.jobs,
        completed: e.completed,
        avgAiScore: e.scoreCount > 0 ? Math.round(e.scoreSum / e.scoreCount) : null,
      }))
      .sort((a, b) => b.jobs - a.jobs);
  }, [filteredOrders]);

  const machineLabelOf = (wo: WorkOrder) => {
    const code = wo.machineCode ?? (wo.machineId ? machinesById.get(wo.machineId)?.code : undefined);
    return code ? `${code} · ${wo.machineName}` : wo.machineName;
  };

  const handleExport = () => {
    if (!effectiveMonth) return;
    let rows: Array<Array<string | number>>;
    if (selectedReportType === "priority") {
      rows = [
        ["ระดับความสำคัญ", "จำนวนงาน", "สัดส่วน (%)", "ปิดงานแล้ว"],
        ...priorityRows.map((r) => [priorityLabel(r.priority), r.jobs, r.sharePct, r.completed]),
      ];
    } else if (selectedReportType === "tech") {
      rows = [
        ["ช่างเทคนิค", "จำนวนงาน", "ปิดงานแล้ว", "คะแนนตรวจสอบ AI เฉลี่ย (%)"],
        ...techRows.map((t) => [t.technician, t.jobs, t.completed, t.avgAiScore ?? "—"]),
      ];
    } else {
      rows = [
        [
          "วันที่มอบหมาย",
          "รหัสใบงาน",
          "เครื่องจักร",
          "ชื่องาน",
          "ความสำคัญ",
          "สถานะ",
          "ช่างผู้รับผิดชอบ",
          "คะแนนตรวจสอบ AI (%)",
        ],
        ...filteredOrders.map((wo) => [
          wo.assignedDate || "—",
          wo.code,
          machineLabelOf(wo),
          wo.title,
          priorityLabel(wo.priority),
          woStatusLabel(wo.status),
          wo.technicianName,
          typeof wo.aiVerificationScore === "number" ? wo.aiVerificationScore : "—",
        ]),
      ];
    }
    downloadCsv(`mtcenter-report-${selectedReportType}-${effectiveMonth}.csv`, rows);
  };

  // No work orders at all — a real empty state, nothing fabricated to show
  if (workOrders.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-3">
          <Inbox className="w-10 h-10 text-ink-faint mx-auto" />
          <p className="text-sm font-semibold text-ink">ยังไม่มีข้อมูลใบงานสำหรับสร้างรายงาน</p>
          <p className="text-xs text-ink-faint">เมื่อมีการมอบหมายใบงานในระบบ รายงานจะแสดงที่นี่โดยอัตโนมัติ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Date Filter & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pb-2 border-b border-hairline">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-hairline min-h-[44px]">
            <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
            <label htmlFor="report-month-select" className="text-xs font-medium text-ink-faint">
              เดือน
            </label>
            <select
              id="report-month-select"
              value={effectiveMonth ?? ""}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-semibold text-ink focus:outline-none cursor-pointer"
            >
              {monthOptions.map((key) => (
                <option key={key} value={key}>
                  {monthLabel(key)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={!effectiveMonth}
            className="px-4 py-2 min-h-[44px] rounded-full bg-primary hover:bg-primary-focus disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>ส่งออกเป็นไฟล์ CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Selected Month — computed only from the work orders in that month */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[18px] border border-hairline">
          <span className="text-xs font-normal text-ink-faint block mb-1">ใบงานในเดือนนี้</span>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {monthOrders.length} <span className="text-xs font-normal">งาน</span>
          </div>
          <span className="text-xs text-ink-faint mt-1 block">
            {effectiveMonth ? monthLabel(effectiveMonth) : "—"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-[18px] border border-hairline">
          <span className="text-xs font-normal text-ink-faint block mb-1">อัตรางานปิดสำเร็จ</span>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-emerald-600">
            {successRate !== null ? `${successRate}%` : "—"}
          </div>
          <span className="text-xs text-ink-faint mt-1 block">
            ปิดแล้ว {completedCount} จาก {monthOrders.length} งาน
          </span>
        </div>

        <div className="bg-white p-4 rounded-[18px] border border-hairline">
          <span className="text-xs font-normal text-ink-faint block mb-1">คะแนนตรวจสอบ AI เฉลี่ย</span>
          <div className="text-2xl font-semibold tracking-[-0.02em] text-ink">
            {avgAiScore !== null ? `${avgAiScore}%` : "—"}
          </div>
          <span className="text-xs text-ink-faint mt-1 block">
            {scoredOrders.length > 0 ? `จาก ${scoredOrders.length} ใบงานที่มีคะแนน` : "ยังไม่มีใบงานที่มีคะแนน"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-[18px] border border-hairline">
          <span className="text-xs font-normal text-ink-faint block mb-1">เครื่องที่ซ่อมบ่อยที่สุด</span>
          <div className="text-sm font-semibold tracking-[-0.02em] text-ink leading-snug">
            {topMachine ? topMachine.machineName : "—"}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-ink-faint">
              {topMachine ? `${topMachine.count} งานในเดือนนี้` : "ไม่มีข้อมูล"}
            </span>
            {topMachineRecord && (
              <span className={machineStatusBadgeClass(topMachineRecord.status)}>
                {machineStatusLabel(topMachineRecord.status)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Report Category Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="tablist" aria-label="ประเภทรายงาน">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            id={`report-tab-${r.id}`}
            role="tab"
            aria-selected={selectedReportType === r.id}
            aria-controls="report-table-panel"
            onClick={() => setSelectedReportType(r.id)}
            className={`p-4 min-h-[44px] rounded-[18px] border text-left transition-all cursor-pointer ${
              selectedReportType === r.id
                ? "bg-primary/10 border-primary"
                : "bg-white border-hairline hover:border-primary/40"
            }`}
          >
            <FileBarChart
              className={`w-5 h-5 mb-2 ${selectedReportType === r.id ? "text-primary" : "text-ink-faint"}`}
              aria-hidden="true"
            />
            <h3 className="font-semibold text-ink text-sm">{r.title}</h3>
            <p className="text-xs text-ink-faint mt-1">{r.desc}</p>
          </button>
        ))}
      </div>

      {/* REPORT TABLE SECTION */}
      <div
        id="report-table-panel"
        role="tabpanel"
        aria-labelledby={`report-tab-${selectedReportType}`}
        className="bg-white rounded-[18px] border border-hairline p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-divider pb-3">
          <div>
            <h3 className="font-semibold text-base text-ink">
              {REPORT_TYPES.find((r) => r.id === selectedReportType)?.title} ·{" "}
              {effectiveMonth ? monthLabel(effectiveMonth) : "—"}
            </h3>
            <p className="text-xs text-ink-faint">
              {selectedReportType === "tech"
                ? "สรุปผลงานรายช่างจากใบงานในเดือนที่เลือก"
                : selectedReportType === "priority"
                ? "สัดส่วนใบงานตามระดับความสำคัญในเดือนที่เลือก"
                : "ข้อมูลจากใบงานซ่อมบำรุงในเดือนที่เลือก"}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-3" aria-hidden="true" />
            <label htmlFor="report-search" className="sr-only">
              ค้นหาในตารางรายงาน
            </label>
            <input
              id="report-search"
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="ค้นหาในตาราง"
              aria-label="ค้นหาในตารางรายงาน"
              className="w-full bg-parchment border border-hairline rounded-full pl-9 pr-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-[44px]"
            />
          </div>
        </div>

        {selectedReportType === "summary" && (
          <>
            {/* Table for desktop */}
            <div className="hidden md:block overflow-x-auto rounded-[11px] border border-hairline">
              <table className="w-full text-left text-xs">
                <thead className="bg-parchment text-ink-faint font-semibold border-b border-hairline">
                  <tr>
                    <th className="p-3">วันที่มอบหมาย</th>
                    <th className="p-3">รหัสใบงาน</th>
                    <th className="p-3">เครื่องจักร</th>
                    <th className="p-3">ชื่องาน / ความสำคัญ</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3">ช่างผู้รับผิดชอบ</th>
                    <th className="p-3 text-center">คะแนนตรวจสอบ AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-parchment/80 transition-colors">
                        <td className="p-3 font-mono text-ink-muted">{wo.assignedDate || "—"}</td>
                        <td className="p-3 font-mono font-semibold text-primary">{wo.code}</td>
                        <td className="p-3 font-semibold text-ink">{machineLabelOf(wo)}</td>
                        <td className="p-3 text-ink-muted max-w-md">
                          <span className="font-semibold text-ink block">{wo.title}</span>
                          <span className={priorityPillClass(wo.priority)}>{priorityLabel(wo.priority)}</span>
                        </td>
                        <td className="p-3">
                          <span className={woStatusPillClass(wo.status)}>{woStatusLabel(wo.status)}</span>
                        </td>
                        <td className="p-3 text-ink-muted font-normal">{wo.technicianName}</td>
                        <td className="p-3 text-center font-semibold text-emerald-700">
                          {typeof wo.aiVerificationScore === "number" ? `${wo.aiVerificationScore}%` : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-ink-faint">
                        ไม่พบใบงานตามคำค้นหาในเดือนที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Card list for mobile */}
            <div className="md:hidden rounded-[11px] border border-hairline overflow-hidden">
              {filteredOrders.length > 0 ? (
                <div className="divide-y divide-divider">
                  {filteredOrders.map((wo) => (
                    <div key={wo.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-xs font-semibold text-primary block">{wo.code}</span>
                          <span className="font-semibold text-sm text-ink leading-snug block">{wo.title}</span>
                        </div>
                      </div>

                      <div className="text-xs text-ink-muted space-y-0.5">
                        <div>เครื่อง: {machineLabelOf(wo)}</div>
                        <div>ช่าง: {wo.technicianName}</div>
                        <div className="font-mono tabular-nums text-ink-faint">
                          มอบหมาย: {wo.assignedDate || "—"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={priorityPillClass(wo.priority)}>{priorityLabel(wo.priority)}</span>
                        <span className={woStatusPillClass(wo.status)}>{woStatusLabel(wo.status)}</span>
                        <span className="text-xs font-semibold text-emerald-700">
                          คะแนนตรวจสอบ AI:{" "}
                          {typeof wo.aiVerificationScore === "number" ? `${wo.aiVerificationScore}%` : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-ink-faint text-xs">
                  ไม่พบใบงานตามคำค้นหาในเดือนที่เลือก
                </div>
              )}
            </div>
          </>
        )}

        {selectedReportType === "priority" && (
          <div className="overflow-x-auto rounded-[11px] border border-hairline">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment text-ink-faint font-semibold border-b border-hairline">
                <tr>
                  <th className="p-3">ระดับความสำคัญ</th>
                  <th className="p-3 text-center">จำนวนงาน</th>
                  <th className="p-3 text-center">สัดส่วน</th>
                  <th className="p-3 text-center">ปิดงานแล้ว</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {priorityRows.length > 0 ? (
                  priorityRows.map((r) => (
                    <tr key={r.priority} className="hover:bg-parchment/80 transition-colors">
                      <td className="p-3">
                        <span className={priorityPillClass(r.priority)}>{priorityLabel(r.priority)}</span>
                      </td>
                      <td className="p-3 text-center font-semibold text-ink">{r.jobs} งาน</td>
                      <td className="p-3 text-center">
                        <div
                          className="w-full bg-parchment rounded-full h-2 relative"
                          role="progressbar"
                          aria-valuenow={r.sharePct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`สัดส่วนใบงานความสำคัญ${priorityLabel(r.priority)}`}
                        >
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${r.sharePct}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-faint">{r.sharePct}%</span>
                      </td>
                      <td className="p-3 text-center font-semibold text-emerald-700">{r.completed} งาน</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-ink-faint">
                      ไม่พบใบงานตามคำค้นหาในเดือนที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === "tech" && (
          <div className="overflow-x-auto rounded-[11px] border border-hairline">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment text-ink-faint font-semibold border-b border-hairline">
                <tr>
                  <th className="p-3">ช่างเทคนิค</th>
                  <th className="p-3 text-center">จำนวนงาน</th>
                  <th className="p-3 text-center">ปิดงานแล้ว</th>
                  <th className="p-3 text-center">คะแนนตรวจสอบ AI เฉลี่ย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {techRows.length > 0 ? (
                  techRows.map((t) => (
                    <tr key={t.technician} className="hover:bg-parchment/80 transition-colors">
                      <td className="p-3 font-semibold text-ink">
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                          <span>{t.technician}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-ink">
                        <span className="flex items-center justify-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-ink-faint" aria-hidden="true" />
                          <span>{t.jobs} งาน</span>
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold text-ink">{t.completed} งาน</td>
                      <td className="p-3 text-center font-semibold text-emerald-700">
                        {t.avgAiScore !== null ? `${t.avgAiScore}%` : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-ink-faint">
                      ไม่พบข้อมูลช่างตามคำค้นหาในเดือนที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
