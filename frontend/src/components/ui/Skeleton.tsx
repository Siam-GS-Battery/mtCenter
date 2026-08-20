import React from "react";

/**
 * ชุด component พื้นฐานสำหรับแสดงสถานะ "กำลังโหลด" (skeleton loading)
 * ใช้ token สีจาก frontend/src/index.css (bg-divider/bg-pearl ฯลฯ)
 * เพื่อให้กลมกลืนกับดีไซน์เดิมของแอป — ทุกตัวรองรับ className เพิ่มเติม
 */

interface SkeletonProps {
  className?: string;
  /** class สำหรับความโค้งมุม เช่น "rounded-md" (ค่าเริ่มต้น) หรือ "rounded-full" */
  rounded?: string;
  style?: React.CSSProperties;
}

/** บล็อกพื้นฐานของ skeleton — ใช้ประกอบเป็นรูปแบบอื่น ๆ ต่อได้ */
export const Skeleton: React.FC<SkeletonProps> = ({ className = "", rounded = "rounded-md", style }) => (
  <div
    role="status"
    aria-hidden="true"
    style={style}
    className={`animate-pulse bg-divider ${rounded} ${className}`}
  />
);

interface SkeletonTextProps {
  /** จำนวนบรรทัดข้อความ */
  lines?: number;
  className?: string;
}

/** แถบข้อความหลายบรรทัด — บรรทัดสุดท้ายสั้นกว่าเพื่อให้ดูเป็นธรรมชาติ */
export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className = "" }) => (
  <div role="status" aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-3 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
      />
    ))}
  </div>
);

interface SkeletonTableRowsProps {
  rows?: number;
  cols?: number;
  className?: string;
}

/** แถวของตาราง (tr/td) ที่ใส่ skeleton ในแต่ละเซลล์ — ใช้ภายใน tbody ที่มีอยู่แล้ว */
export const SkeletonTableRows: React.FC<SkeletonTableRowsProps> = ({
  rows = 5,
  cols = 4,
  className = "",
}) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} role="status" aria-hidden="true" className={className}>
        {Array.from({ length: cols }).map((_, c) => (
          <td key={c} className="px-4 py-3">
            <Skeleton className="h-3 w-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  className?: string;
}

/** ตาราง skeleton แบบสมบูรณ์ในตัวเอง (มีการ์ด + หัวตาราง) สำหรับหน้าที่ยังไม่มี table element จริง */
export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  cols = 4,
  showHeader = true,
  className = "",
}) => (
  <div
    role="status"
    aria-hidden="true"
    className={`rounded-2xl border border-divider bg-canvas overflow-hidden ${className}`}
  >
    <table className="w-full">
      {showHeader && (
        <thead>
          <tr className="border-b border-divider">
            {Array.from({ length: cols }).map((_, c) => (
              <th key={c} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-divider">
        <SkeletonTableRows rows={rows} cols={cols} />
      </tbody>
    </table>
  </div>
);

interface SkeletonCardProps {
  className?: string;
}

/** การ์ด skeleton: แถบหัวเรื่อง + ข้อความ 3 บรรทัด */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = "" }) => (
  <div
    role="status"
    aria-hidden="true"
    className={`rounded-2xl border border-divider bg-canvas p-4 flex flex-col gap-3 ${className}`}
  >
    <Skeleton className="h-4 w-1/2" />
    <SkeletonText lines={3} />
  </div>
);

interface SkeletonCardGridProps {
  count?: number;
  className?: string;
}

/** กริดของ SkeletonCard ที่ responsive ตามความกว้างหน้าจอ */
export const SkeletonCardGrid: React.FC<SkeletonCardGridProps> = ({ count = 6, className = "" }) => (
  <div
    role="status"
    aria-hidden="true"
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

interface SkeletonListProps {
  count?: number;
  className?: string;
}

/** รายการแนวตั้ง แต่ละแถวมีสี่เหลี่ยมคล้าย avatar + ข้อความ 2 บรรทัด */
export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 5, className = "" }) => (
  <div role="status" aria-hidden="true" className={`flex flex-col gap-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-lg" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

interface SkeletonStatCardsProps {
  count?: number;
}

/** แถวการ์ด KPI สำหรับหน้า dashboard */
export const SkeletonStatCards: React.FC<SkeletonStatCardsProps> = ({ count = 4 }) => (
  <div role="status" aria-hidden="true" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-divider bg-canvas p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    ))}
  </div>
);

interface SkeletonChartProps {
  className?: string;
  height?: string;
}

/** พื้นที่กราฟ skeleton พร้อมแท่งความสูงสลับกันให้ดูเหมือนกราฟจริง */
export const SkeletonChart: React.FC<SkeletonChartProps> = ({ className = "", height = "h-64" }) => {
  const bars = [40, 65, 50, 80, 55, 70, 45, 60];
  return (
    <div
      role="status"
      aria-hidden="true"
      className={`rounded-2xl border border-divider bg-canvas p-4 flex items-end gap-2 ${height} ${className}`}
    >
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end h-full">
          <Skeleton className="w-full" rounded="rounded-t-md" style={{ height: `${h}%` }} />
        </div>
      ))}
    </div>
  );
};
