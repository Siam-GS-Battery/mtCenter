// UX Storyboard Scenario C — Frame 1 + Frame 2
//
//   Frame 1 "เข้าวันถัดมา"        → หน้าจอ: รายการใบงานรอรีวิว
//   Frame 2 "รีวิวและเติมความรู้"  → หน้าจอ: รีวิวใบงานซ่อม
//
// หน้านี้แยกจาก PendingReviewView โดยเจตนา: PendingReviewView คือการ "อนุมัติใบงาน"
// ซึ่งเป็นงานที่มีอยู่แล้วและมีกฎของตัวเอง ส่วนหน้านี้คือการ "สกัดความรู้จากใบงานที่ปิดแล้ว"
// เป้าหมายต่างกัน (อนุมัติ = ตรวจว่างานถูกทำถูก / สกัดความรู้ = ทำให้ครั้งหน้าไม่ต้องถามซ้ำ)
// การยัดสองงานลงหน้าจอเดียวจะทำให้ผู้ใช้ไม่รู้ว่าปุ่มไหนทำอะไร
//
// สองสิ่งที่หน้านี้ต้องซื่อสัตย์เสมอ:
// 1) ลำดับความสำคัญต้องอธิบายได้ — Frame 1 ระบุเหตุผลไว้ว่า "ต้องอธิบายได้กับผู้จัดการ"
//    จึงแสดง rankReasons ทุกข้อให้เห็น ไม่ใช่แค่เรียงลำดับแล้วเงียบ
// 2) ต้องชัดว่าร่างยังไม่เข้าคลัง — Frame 2 ระบุว่า "ห้าม AI เขียนความรู้เข้าคลังเอง"
//    จึงต้องไม่มีจุดใดในหน้านี้ที่ทำให้เข้าใจว่าบันทึกไปแล้วก่อนกดยืนยัน

import React, { useCallback, useEffect, useState } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Loader2,
  Clock,
  Info,
  FileText,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  getReviewQueue,
  getKnowledgeDraft,
  confirmKnowledge,
  toUserMessage,
  type ReviewQueueItem,
  type KnowledgeDraft,
} from "../../services/apiService";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { notifySaving, dismissSaving, notifyDone, notifyFailed } from "../../lib/swal";

// จำนวนใบงานต่อหน้าในคิวรีวิว — ต้องตรงกับ default limit ของ backend
// (backend/src/routes/knowledge.ts REVIEW_QUEUE_PAGING_DEFAULTS)
const REVIEW_QUEUE_PAGE_SIZE = 20;

interface KnowledgeReviewViewProps {
  /** ชื่อผู้ใช้ปัจจุบัน — บันทึกไว้กับความรู้ที่เขายืนยัน */
  currentUserName?: string;
}

const LEVEL_BADGE: Record<string, { label: string; className: string; Icon: typeof AlertTriangle }> = {
  critical: { label: "วิกฤต", className: "bg-rose-100 text-rose-800", Icon: AlertOctagon },
  warning: { label: "เฝ้าระวัง", className: "bg-amber-100 text-amber-800", Icon: AlertTriangle },
  normal: { label: "ปกติ", className: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 },
};

function formatDowntime(minutes: number | null): string {
  if (minutes === null) return "ไม่มีข้อมูล";
  if (minutes < 60) return `${minutes} นาที`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} ชม.` : `${h} ชม. ${m} นาที`;
}

export const KnowledgeReviewView: React.FC<KnowledgeReviewViewProps> = ({ currentUserName }) => {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Frame 2 state — ร่างที่กำลังตรวจอยู่
  const [activeItem, setActiveItem] = useState<ReviewQueueItem | null>(null);
  const [draft, setDraft] = useState<KnowledgeDraft | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  // ฉบับที่ Engineer แก้ — เก็บแยกจาก draft.content เพื่อให้ส่ง "ร่างเดิม" ไปเทียบได้
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const load = useCallback(async (pageOffset: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getReviewQueue({ limit: REVIEW_QUEUE_PAGE_SIZE, offset: pageOffset });
      // งานถูกอนุมัติ/ลบออกจากคิวระหว่างที่ผู้ใช้อยู่หน้าท้าย ๆ อาจทำให้หน้านี้ว่างเปล่า
      // ทั้งที่ยังมีงานค้างอยู่หน้าก่อนหน้า — ถอยกลับไปหน้าสุดท้ายที่มีข้อมูลจริงแทนที่จะ
      // ค้างแสดงหน้าว่างเปล่า
      if (data.data.length === 0 && pageOffset > 0 && data.meta && data.meta.total > 0) {
        const lastOffset = Math.max(0, Math.floor((data.meta.total - 1) / REVIEW_QUEUE_PAGE_SIZE) * REVIEW_QUEUE_PAGE_SIZE);
        if (lastOffset !== pageOffset) {
          setOffset(lastOffset);
          return;
        }
      }
      setItems(data.data);
      setPendingCount(data.pendingCount);
      setTotal(data.meta?.total ?? data.totalCount);
    } catch (err) {
      // ไม่กลืนเป็นลิสต์ว่าง: "ไม่มีงานค้าง" กับ "อ่านข้อมูลไม่ได้" ต่างกันคนละเรื่อง
      setLoadError(toUserMessage(err, "ดึงรายการใบงานรอรีวิวไม่สำเร็จ"));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(offset);
  }, [load, offset]);

  const openDraft = async (item: ReviewQueueItem) => {
    setActiveItem(item);
    setDraft(null);
    setDraftError(null);
    setIsDrafting(true);
    try {
      const { draft: d } = await getKnowledgeDraft(item.workOrderId);
      setDraft(d);
      setEditedTitle(d.title);
      setEditedContent(d.content);
    } catch (err) {
      setDraftError(toUserMessage(err, "สร้างร่างองค์ความรู้ไม่สำเร็จ"));
    } finally {
      setIsDrafting(false);
    }
  };

  const closeDraft = () => {
    setActiveItem(null);
    setDraft(null);
    setDraftError(null);
  };

  const handleConfirm = async () => {
    if (!activeItem || !draft || isConfirming) return;
    setIsConfirming(true);
    notifySaving("กำลังบันทึกความรู้เข้าคลัง");
    try {
      await confirmKnowledge({
        workOrderId: activeItem.workOrderId,
        title: editedTitle,
        category: draft.category,
        machineModel: draft.machineModel,
        machineCode: draft.machineCode,
        tags: draft.tags,
        summary: draft.summary,
        content: editedContent,
        // ส่งร่างเดิมไปด้วย ให้ระบบรู้ว่า Engineer แก้อะไร (ใช้ปรับปรุงตัวร่างรอบถัดไป)
        draftContent: draft.content,
        confirmedByName: currentUserName,
      });
      dismissSaving();
      notifyDone("บันทึกความรู้เข้าคลังแล้ว");
      closeDraft();
      await load(offset);
    } catch (err) {
      dismissSaving();
      notifyFailed(toUserMessage(err, "บันทึกความรู้เข้าคลังไม่สำเร็จ"));
    } finally {
      setIsConfirming(false);
    }
  };

  const contentChanged = draft !== null && editedContent.trim() !== draft.content.trim();

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* หัวข้อ + ป้ายจำนวนงานค้าง (Frame 1: "มีป้ายจำนวนงานค้างอยู่") */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">ใบงานรอรีวิวเพื่อเก็บเป็นความรู้</h2>
            <p className="text-xs text-ink-muted">
              ใบงานที่ช่างปิดแล้วและรอวิศวกรตรวจ ก่อนนำเข้าคลังความรู้
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
              ค้าง {pendingCount} ใบ
            </span>
          )}
          <button
            onClick={() => void load(offset)}
            disabled={isLoading}
            className="min-h-11 px-3 rounded-full border border-hairline text-ink-muted hover:text-ink hover:border-primary/40 text-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* อธิบายเกณฑ์การจัดลำดับ — Frame 1 บังคับว่าต้องอธิบายได้กับผู้จัดการ */}
      <div className="rounded-[18px] border border-hairline bg-parchment p-3 text-xs text-ink-muted flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
        <span>
          เรียงลำดับด้วยกฎที่ตรวจสอบได้ ไม่ใช่การจัดอันดับด้วย AI — คิดจากสภาพเครื่องตามเกณฑ์
          ความสำคัญของใบงาน เวลาสูญเสียการผลิต และจำนวนวันที่ค้างรอ แต่ละใบแสดงเหตุผลของคะแนนไว้ครบ
        </span>
      </div>

      {loadError && (
        <div className="rounded-[18px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{loadError}</p>
            <p className="text-xs mt-1">
              นี่ไม่ได้หมายความว่าไม่มีงานค้าง — ระบบยังอ่านข้อมูลไม่ได้ กดรีเฟรชเพื่อลองอีกครั้ง
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-ink-muted py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>กำลังโหลดรายการ...</span>
        </div>
      )}

      {!isLoading && !loadError && items.length === 0 && (
        <div className="rounded-[18px] border border-hairline bg-white p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-semibold text-ink">ไม่มีใบงานรอรีวิว</p>
          <p className="text-sm text-ink-muted mt-1">
            ใบงานที่ช่างปิดและส่งมาให้ตรวจจะปรากฏที่นี่
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const badge = item.machineLevel ? LEVEL_BADGE[item.machineLevel] : null;
          return (
            <div
              key={item.workOrderId}
              className={`rounded-[18px] border p-4 bg-white ${
                item.hasKnowledge ? "border-hairline opacity-70" : "border-hairline"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-ink-muted">#{index + 1}</span>
                    <span className="font-semibold text-ink">{item.workOrderCode}</span>
                    {badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${badge.className}`}>
                        <badge.Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    )}
                    {item.hasKnowledge && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        เข้าคลังความรู้แล้ว
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink mt-1">{item.title}</p>
                  <p className="text-xs text-ink-muted mt-1">
                    {item.machineCode ?? "ไม่ระบุเครื่อง"}
                    {item.machineName ? ` · ${item.machineName}` : ""}
                    {item.technicianName ? ` · ช่าง: ${item.technicianName}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-ink-muted mt-2">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      เวลาสูญเสีย: {formatDowntime(item.downtimeMinutes)}
                    </span>
                    {item.daysWaiting !== null && <span>ค้างรอ {item.daysWaiting} วัน</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-ink-muted">คะแนนความสำคัญ</div>
                  <div className="text-xl font-semibold text-ink">{item.rankScore}</div>
                </div>
              </div>

              {/* เหตุผลของคะแนน — เปิดให้เห็นตลอด ไม่ซ่อนไว้ใน tooltip */}
              <ul className="mt-3 space-y-0.5 text-xs text-ink-muted border-t border-hairline pt-2">
                {item.rankReasons.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>

              <div className="mt-3">
                <button
                  onClick={() => void openDraft(item)}
                  disabled={item.hasKnowledge}
                  className="min-h-11 px-4 rounded-full bg-primary text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{item.hasKnowledge ? "รีวิวแล้ว" : "รีวิวและเติมความรู้"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {total > 0 && (
        <Pagination
          offset={offset}
          limit={REVIEW_QUEUE_PAGE_SIZE}
          total={total}
          onOffsetChange={setOffset}
          isLoading={isLoading}
          itemLabel="ใบ"
        />
      )}

      {/* ---------- Frame 2: รีวิวใบงานซ่อม ---------- */}
      {activeItem !== null && (
      <Modal onClose={closeDraft} size="xl">
        <ModalHeader onClose={closeDraft}>
          รีวิวใบงาน {activeItem?.workOrderCode} — เติมความรู้ก่อนเข้าคลัง
        </ModalHeader>
        <ModalBody>
          {isDrafting && (
            <div className="flex items-center gap-2 text-sm text-ink-muted py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>กำลังจัดร่างจากบันทึกของช่าง...</span>
            </div>
          )}

          {draftError && (
            <div className="rounded-[11px] border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {draftError}
            </div>
          )}

          {draft && (
            <div className="space-y-4">
              {/* คำเตือนสำคัญ: ร่างนี้ยังไม่เข้าคลัง */}
              <div className="rounded-[11px] border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  ร่างนี้ <strong>ยังไม่ถูกบันทึกเข้าคลังความรู้</strong> ระบบเรียบเรียงจากสิ่งที่ช่าง
                  บันทึกไว้เท่านั้น ไม่ได้เพิ่มเนื้อหาใหม่ ความรู้จะเข้าคลังเมื่อคุณกดยืนยันด้านล่าง
                </span>
              </div>

              {/* สิ่งที่ช่างเล่าไว้ (Frame 2: "หน้าจอแสดงสิ่งที่ช่างเล่าไว้") */}
              <section>
                <h4 className="text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  สิ่งที่ช่างบันทึกไว้
                </h4>
                <dl className="rounded-[11px] bg-parchment border border-hairline p-3 text-[13px] space-y-2">
                  <div>
                    <dt className="font-semibold text-ink">อาการ</dt>
                    <dd className="text-ink-muted whitespace-pre-line">{draft.technicianReport.symptoms}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">สาเหตุ</dt>
                    <dd className="text-ink-muted whitespace-pre-line">{draft.technicianReport.cause}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">วิธีแก้ไข</dt>
                    <dd className="text-ink-muted whitespace-pre-line">{draft.technicianReport.repairAction}</dd>
                  </div>
                  {draft.technicianReport.solutionSteps && (
                    <div>
                      <dt className="font-semibold text-ink">ขั้นตอนที่บันทึกไว้</dt>
                      <dd className="text-ink-muted whitespace-pre-line">{draft.technicianReport.solutionSteps}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* ช่องว่างที่ต้องเติม */}
              {draft.gaps.length > 0 && (
                <section>
                  <h4 className="text-sm font-semibold text-ink mb-2">จุดที่ควรตรวจ/เติมก่อนยืนยัน</h4>
                  <ul className="rounded-[11px] border border-hairline bg-white p-3 text-[13px] text-ink-muted space-y-1">
                    {draft.gaps.map((gap, i) => (
                      <li key={i}>• {gap}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ช่องแก้ไข (Frame 2: "มีช่องให้ Engineer เขียนความเห็นหรือความรู้ที่ถูกต้อง") */}
              <section className="space-y-2">
                <label className="block">
                  <span className="text-sm font-semibold text-ink">หัวเรื่องความรู้</span>
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="mt-1 w-full min-h-11 px-3 rounded-[11px] border border-hairline bg-white text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-ink">
                    เนื้อหาความรู้ (แก้ไข/เติมได้ — นี่คือฉบับที่จะเข้าคลัง)
                  </span>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={14}
                    className="mt-1 w-full px-3 py-2 rounded-[11px] border border-hairline bg-white text-[13px] text-ink font-mono leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                  />
                </label>
                <p className="text-xs text-ink-muted">
                  {contentChanged
                    ? "คุณได้แก้ไขร่างแล้ว — ระบบจะเก็บทั้งร่างเดิมและฉบับที่คุณยืนยันไว้เทียบกัน"
                    : "ยังไม่ได้แก้ไขร่าง หากร่างครบถ้วนแล้วกดยืนยันได้เลย"}
                </p>
              </section>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            onClick={closeDraft}
            className="min-h-11 px-4 rounded-[11px] bg-pearl hover:bg-parchment text-ink-muted font-semibold text-sm border border-divider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => void handleConfirm()}
            disabled={!draft || isConfirming || editedTitle.trim() === "" || editedContent.trim() === ""}
            className="min-h-11 px-4 rounded-[11px] bg-primary text-white font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
          >
            {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>ยืนยันเข้าคลังความรู้</span>
          </button>
        </ModalFooter>
      </Modal>
      )}
    </div>
  );
};
