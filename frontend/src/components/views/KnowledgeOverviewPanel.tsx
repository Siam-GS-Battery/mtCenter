// UX Storyboard Scenario C — Frame 4 ("เห็นว่าถูกใช้จริง" / หน้าจอ: ภาพรวมคลังความรู้)
//
// สเปกระบุว่าต้องแสดง "จำนวนครั้งที่ความรู้ถูกอ้างอิง + คะแนน feedback จากช่าง"
// และ User Goal คือ "มั่นใจว่าความรู้ของตัวเองถูกส่งต่อได้จริง"
//
// สิ่งที่ตั้งใจให้เด่นคือ "เรื่องที่ยังไม่เคยถูกอ้างอิงเลย" ไม่ใช่ยอดรวมสวย ๆ เพราะเรื่อง
// เหล่านั้นคือความรู้ที่ Engineer ลงแรงรีวิวแล้วแต่ retrieval ยังหาไม่เจอ — เป็นรายการ
// ที่ต้องลงมือแก้ ตรงกับเหตุผลใน storyboard ว่าข้อมูลชุดนี้ "คือ input หลักที่ใช้ปรับ
// retrieval ให้แม่นขึ้นในรอบถัดไป" ไม่ใช่แค่รายงานให้ดูสวย

import React, { useCallback, useEffect, useState } from "react";
import {
  BookMarked,
  ThumbsUp,
  ThumbsDown,
  Quote,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ClipboardCheck,
  PencilLine,
} from "lucide-react";
import { getKnowledgeOverview, toUserMessage, type KnowledgeOverview } from "../../services/apiService";
import { Pagination } from "../ui/Pagination";
import { SkeletonStatCards } from "../ui/Skeleton";

// จำนวนเรื่องความรู้ต่อหน้าในตาราง Frame 4 — ต้องตรงกับ default limit ของ backend
// (backend/src/routes/knowledge.ts KNOWLEDGE_OVERVIEW_PAGING_DEFAULTS)
const OVERVIEW_PAGE_SIZE = 20;

function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  Icon,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "neutral" | "warn" | "good";
  Icon: typeof BookMarked;
}) {
  const toneClass =
    tone === "warn" ? "text-amber-800 bg-amber-50 border-amber-200"
    : tone === "good" ? "text-emerald-800 bg-emerald-50 border-emerald-200"
    : "text-ink bg-white border-hairline";
  return (
    <div className={`rounded-[18px] border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2 text-xs font-semibold opacity-80">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold mt-1">{value.toLocaleString()}</div>
      {hint && <div className="text-xs opacity-75 mt-0.5">{hint}</div>}
    </div>
  );
}

export const KnowledgeOverviewPanel: React.FC = () => {
  const [data, setData] = useState<KnowledgeOverview | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageOffset: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { overview, meta } = await getKnowledgeOverview({ limit: OVERVIEW_PAGE_SIZE, offset: pageOffset });
      setData(overview);
      setTotal(meta?.total ?? overview.articles.length);
    } catch (err) {
      // ไม่แสดงเลข 0 เมื่ออ่านข้อมูลไม่ได้ — หน้านี้มีหน้าที่ยืนยันว่าความรู้ถูกใช้จริง
      // การโชว์ 0 ตอนระบบล่มจะสื่อผิดว่าไม่มีใครใช้ ซึ่งตรงข้ามกับความจริง
      setError(toUserMessage(err, "ดึงภาพรวมคลังความรู้ไม่สำเร็จ"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(offset);
  }, [load, offset]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <BookMarked className="w-4.5 h-4.5 text-primary" />
          ภาพรวมคลังความรู้ที่ยืนยันแล้ว
        </h3>
        <button
          onClick={() => void load(offset)}
          disabled={isLoading}
          className="min-h-11 px-3 rounded-full border border-hairline text-ink-muted hover:text-ink hover:border-primary/40 text-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {isLoading && !data && <SkeletonStatCards count={5} />}

      {isLoading && data && (
        <div className="flex items-center gap-2 text-sm text-ink-muted py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>กำลังโหลดสถิติ...</span>
        </div>
      )}

      {error && (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-semibold">{error}</p>
          <p className="text-xs mt-1">ตัวเลขด้านล่างจึงยังไม่แสดง — ไม่ได้หมายความว่าเป็นศูนย์</p>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatTile label="ความรู้ในคลัง" value={data.totalArticles} Icon={BookMarked} hint="ที่คนยืนยันแล้ว" />
            <StatTile label="ถูกอ้างอิงตอบช่าง" value={data.totalCitations} Icon={Quote} hint="รวมทุกเรื่อง" tone="good" />
            <StatTile label="ช่างกดพอใจ" value={data.totalHelpful} Icon={ThumbsUp} tone="good" />
            <StatTile label="ช่างกดไม่พอใจ" value={data.totalNotHelpful} Icon={ThumbsDown} />
            <StatTile
              label="ยังไม่เคยถูกใช้"
              value={data.neverCitedCount}
              Icon={AlertTriangle}
              tone={data.neverCitedCount > 0 ? "warn" : "good"}
              hint="ต้องปรับการค้นหา"
            />
          </div>

          {data.pendingReviewCount > 0 && (
            <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span>
                ยังมีใบงาน <strong>{data.pendingReviewCount}</strong> ใบรอรีวิว — ความรู้จากใบงานเหล่านั้น
                ยังไม่เข้าคลัง ไปที่เมนู "รีวิวความรู้" เพื่อดำเนินการ
              </span>
            </div>
          )}

          {data.articles.length === 0 ? (
            <div className="rounded-[18px] border border-hairline bg-white p-8 text-center">
              <BookMarked className="w-8 h-8 text-ink-muted mx-auto mb-2" />
              <p className="font-semibold text-ink">คลังความรู้ยังว่าง</p>
              <p className="text-sm text-ink-muted mt-1">
                ความรู้จะปรากฏที่นี่เมื่อวิศวกรรีวิวใบงานและกดยืนยันเข้าคลัง
              </p>
            </div>
          ) : (
            <div className="rounded-[18px] border border-hairline bg-white overflow-hidden">
              {/* ตารางเลื่อนในกล่องของตัวเอง ไม่ให้หน้าเลื่อนแนวนอนทั้งหน้า */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-divider text-ink-muted text-xs">
                    <tr>
                      <th className="text-left font-semibold px-3 py-2">ความรู้</th>
                      <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">ใบงานต้นทาง</th>
                      <th className="text-left font-semibold px-3 py-2 whitespace-nowrap">ผู้ยืนยัน</th>
                      <th className="text-right font-semibold px-3 py-2 whitespace-nowrap">ถูกอ้างอิง</th>
                      <th className="text-right font-semibold px-3 py-2 whitespace-nowrap">พอใจ / ไม่พอใจ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.articles.map((a) => (
                      <tr key={a.id} className="border-t border-hairline align-top">
                        <td className="px-3 py-2">
                          <div className="font-medium text-ink">{a.title}</div>
                          <div className="text-xs text-ink-muted flex flex-wrap items-center gap-2 mt-0.5">
                            {a.machineCode && <span>{a.machineCode}</span>}
                            {a.category && <span>· {a.category}</span>}
                            {/* บอกว่า Engineer แก้ร่างจริง — เป็นหลักฐานว่ามีคนตรวจ ไม่ใช่กดผ่าน */}
                            {a.editedFromDraft && (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <PencilLine className="w-3 h-3" />
                                วิศวกรแก้ร่าง
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-ink-muted whitespace-nowrap">
                          {a.sourceWorkOrderCode ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-ink-muted whitespace-nowrap">
                          {a.confirmedByName ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          {a.citedCount === 0 ? (
                            <span className="text-amber-800 font-semibold">ยังไม่เคย</span>
                          ) : (
                            <span className="text-ink font-semibold">{a.citedCount} ครั้ง</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-ink-muted whitespace-nowrap">
                          {a.helpfulCount} / {a.notHelpfulCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {total > 0 && (
            <Pagination
              offset={offset}
              limit={OVERVIEW_PAGE_SIZE}
              total={total}
              onOffsetChange={setOffset}
              isLoading={isLoading}
              itemLabel="เรื่อง"
            />
          )}
        </>
      )}
    </section>
  );
};
