import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Eye,
  Circle,
  Loader2,
  Paperclip,
} from "lucide-react";
import { WorkOrder, UserRole, WorkOrderStep, WorkOrderAttachment } from "../../types";
import { WorkOrderDetailModal } from "../WorkOrderDetailModal";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { SkeletonList } from "../ui/Skeleton";
import {
  getWorkOrders,
  getWorkOrderAttachments,
  getCurrentUserId,
  toUserMessage,
} from "../../services/apiService";
import { notifySaving, dismissSaving, notifyDone, notifyFailed } from "../../lib/swal";

interface PendingReviewViewProps {
  currentUserRole?: UserRole;
  /** Name of the signed-in engineer, recorded against what they approve. */
  currentUserName?: string;
  onApproveWorkOrder: (woId: string) => Promise<void>;
  onUpdateWorkOrder?: (updatedWO: WorkOrder) => Promise<void>;
  onAskAI: (prompt: string) => void;
  /** เรียกเมื่อมีการเบิกอะไหล่จริงสำเร็จในใบงาน — ให้ App.tsx รีเฟรช spareParts */
  onStockChanged?: () => void;
}

// จำนวนใบงานรอตรวจสอบต่อหน้า
const PAGE_SIZE = 100;

/**
 * Steps a work order actually carries, with the same completion rule the detail
 * dialog uses (the first `stepsCompleted` entries are done). Nothing is
 * invented — an order without a plan shows no checklist.
 */
function planSteps(wo: WorkOrder): WorkOrderStep[] {
  if (wo.actionPlanSteps?.length) return wo.actionPlanSteps;
  if (wo.actionPlan?.length) return wo.actionPlan.map((text) => ({ text }));
  if (wo.solutionSteps?.length) return wo.solutionSteps.map((text) => ({ text }));
  return [];
}

export const PendingReviewView: React.FC<PendingReviewViewProps> = ({
  currentUserRole = "engineer",
  currentUserName,
  onApproveWorkOrder,
  onUpdateWorkOrder,
  onAskAI,
  onStockChanged,
}) => {
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approveWO, setApproveWO] = useState<WorkOrder | null>(null);
  const [reviseWO, setReviseWO] = useState<WorkOrder | null>(null);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionError, setRevisionError] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [approveAttachments, setApproveAttachments] = useState<WorkOrderAttachment[]>([]);
  const [approveAttachmentsLoading, setApproveAttachmentsLoading] = useState(false);

  // ใบงานที่ import จาก Excel มี 8,589 แถว การกรอง status==="review" ในเครื่อง
  // จากอาเรย์ที่แชร์กับหน้าอื่น (จำกัดแค่ ~100 แถว) จะพลาดใบงานรอตรวจสอบที่ไม่ได้
  // อยู่ในหน้าแรก จึงดึงเฉพาะใบงานสถานะ "review" จาก server ด้วย ?status=review
  const [offset, setOffset] = useState(0);
  const [pendingReviews, setPendingReviews] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchPage = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getWorkOrders({ status: "review", limit: PAGE_SIZE, offset })
      .then((res) => {
        if (cancelled) return;
        setPendingReviews(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(toUserMessage(err, "ไม่สามารถโหลดใบงานรอตรวจสอบได้"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [offset]);

  useEffect(() => fetchPage(), [fetchPage]);

  // Read-only summary for the approve dialog — attaching is optional, this
  // never blocks approval, it just tells the engineer what's already there.
  useEffect(() => {
    if (!approveWO) {
      setApproveAttachments([]);
      return;
    }
    let cancelled = false;
    setApproveAttachmentsLoading(true);
    getWorkOrderAttachments(approveWO.id)
      .then((list) => {
        if (!cancelled) setApproveAttachments(list);
      })
      .catch(() => {
        if (!cancelled) setApproveAttachments([]);
      })
      .finally(() => {
        if (!cancelled) setApproveAttachmentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [approveWO]);

  const handleOpenDetailModal = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setIsModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveWO) return;
    setIsApproving(true);
    notifySaving("กำลังอนุมัติ...");
    try {
      await onApproveWorkOrder(approveWO.id);
      dismissSaving();
      await notifyDone("อนุมัติแล้ว", `ปิดใบงาน ${approveWO.code} เรียบร้อย`);
      setApproveWO(null);
      // ใบงานนี้เปลี่ยนสถานะออกจากคิว "รอตรวจสอบ" แล้ว โหลดหน้านี้ใหม่ให้หายไปจริง
      fetchPage();
    } catch (err) {
      dismissSaving();
      await notifyFailed("อนุมัติไม่สำเร็จ", toUserMessage(err, "ไม่สามารถอนุมัติปิดใบงานนี้ได้"));
    } finally {
      setIsApproving(false);
    }
  };

  const handleOpenRevise = (wo: WorkOrder) => {
    setRevisionReason("");
    setRevisionError(false);
    setReviseWO(wo);
  };

  const handleConfirmRevise = async () => {
    if (!reviseWO) return;
    const reason = revisionReason.trim();
    if (!reason) {
      setRevisionError(true);
      return;
    }
    setIsRevising(true);
    notifySaving("กำลังส่งกลับแก้ไข...");
    try {
      await onUpdateWorkOrder?.({
        ...reviseWO,
        status: "in_progress",
        revisionNote: reason,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      dismissSaving();
      await notifyDone("ส่งกลับแก้ไขแล้ว", `ใบงาน ${reviseWO.code} ถูกส่งกลับให้ช่างแก้ไข`);
      setReviseWO(null);
      fetchPage();
    } catch (err) {
      dismissSaving();
      await notifyFailed("ส่งกลับแก้ไขไม่สำเร็จ", toUserMessage(err, "ไม่สามารถส่งใบงานนี้กลับให้ช่างแก้ไขได้"));
    } finally {
      setIsRevising(false);
    }
  };

  // เมื่ออนุมัติ/ส่งกลับแก้ไขจากในโมดัลรายละเอียดโดยตรง (ไม่ผ่านปุ่มในการ์ด)
  // ก็ต้องโหลดหน้านี้ใหม่เช่นกัน เพื่อไม่ให้ใบงานที่เปลี่ยนสถานะแล้วค้างอยู่ในคิว
  const handleModalApprove = async (woId: string) => {
    await onApproveWorkOrder(woId);
    fetchPage();
  };
  const handleModalUpdate = async (updatedWO: WorkOrder) => {
    await onUpdateWorkOrder?.(updatedWO);
    fetchPage();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 rounded-[18px] p-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">{loadError}</p>
        </div>
      )}

      {isLoading && pendingReviews.length === 0 && !loadError ? (
        <SkeletonList count={5} />
      ) : pendingReviews.length === 0 && !loadError ? (
        <div className="bg-white rounded-[18px] border border-hairline p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-semibold text-ink">
            ไม่มีใบงานค้างรอการตรวจสอบในขณะนี้
          </h2>
          <p className="text-sm text-ink-muted">
            งานซ่อมบำรุงทั้งหมดได้รับการตรวจสอบอนุมัติเรียบร้อยแล้ว
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingReviews.map((wo) => (
            <ReviewCard
              key={wo.id}
              workOrder={wo}
              onAskAI={onAskAI}
              onOpenDetail={() => handleOpenDetailModal(wo)}
              onRevise={() => handleOpenRevise(wo)}
              onApprove={() => setApproveWO(wo)}
            />
          ))}
        </div>
      )}

      {/* แบ่งหน้า — คิวรอตรวจสอบมักไม่ใหญ่เท่าใบงานทั้งหมด แต่ก็อาจเกินหน้าเดียวได้ */}
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

      {/* Approve confirmation — the same evidence the card shows, restated so
          the decision and the summary can never disagree. */}
      {approveWO && (
        <Modal size="md" onClose={() => setApproveWO(null)}>
          <ModalHeader onClose={() => setApproveWO(null)}>
            <h2 className="text-base font-semibold text-ink">ยืนยันการอนุมัติปิดใบงาน</h2>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {approveWO.code} — {approveWO.title}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                {approveWO.machineName} · ช่างผู้ปฏิบัติงาน {approveWO.technicianName}
              </p>
            </div>

            <Evidence workOrder={approveWO} />

            <section className="space-y-1.5">
              <h3 className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-ink-faint" />
                <span>เอกสารแนบ</span>
              </h3>
              {approveAttachmentsLoading ? (
                <p className="text-xs text-ink-faint">กำลังโหลด...</p>
              ) : approveAttachments.length === 0 ? (
                <p className="text-xs text-ink-faint">
                  ยังไม่มีเอกสารแนบ — สามารถแนบเพิ่มได้ที่ "ดูรายละเอียด → เอกสารแนบ"
                </p>
              ) : (
                <p className="text-xs text-ink-muted leading-relaxed">
                  แนบไว้ {approveAttachments.length} ไฟล์:{" "}
                  {approveAttachments.map((a) => a.fileName).join(", ")}
                </p>
              )}
            </section>

            {typeof approveWO.aiVerificationScore !== "number" && (
              <div className="p-3.5 rounded-[14px] bg-amber-50 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  ใบงานนี้ยังไม่ผ่านการประเมินโดย AI โปรดตรวจหลักฐานด้านบนด้วยตนเองก่อนอนุมัติ
                </span>
              </div>
            )}

            <p className="text-xs text-ink-muted leading-relaxed">
              {currentUserName
                ? `เมื่ออนุมัติแล้ว ใบงานจะถูกปิดในชื่อ ${currentUserName} และเครื่องจักรจะกลับเข้าสายการผลิตตามปกติ`
                : "เมื่ออนุมัติแล้ว ใบงานจะถูกปิดและเครื่องจักรจะกลับเข้าสายการผลิตตามปกติ"}
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setApproveWO(null)}
              disabled={isApproving}
              className="w-full sm:w-auto px-6 min-h-11 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-parchment font-semibold text-sm cursor-pointer active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmApprove}
              disabled={isApproving}
              className="w-full sm:w-auto px-6 min-h-11 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>ยืนยันอนุมัติปิดงาน</span>
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Return-for-revision reason */}
      {reviseWO && (
        <Modal size="sm" onClose={() => setReviseWO(null)}>
          <ModalHeader onClose={() => setReviseWO(null)}>
            <h2 className="text-base font-semibold text-ink">ส่งใบงานกลับให้ช่างแก้ไข</h2>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-sm text-ink-muted leading-relaxed">
              ใบงาน{" "}
              <span className="font-semibold text-ink">
                {reviseWO.code} — {reviseWO.title}
              </span>{" "}
              จะกลับไปเป็นสถานะกำลังซ่อม พร้อมเหตุผลที่ระบุไว้
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink" htmlFor="pending-revision-reason">
                เหตุผลที่ต้องแก้ไข <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="pending-revision-reason"
                rows={3}
                value={revisionReason}
                onChange={(e) => {
                  setRevisionReason(e.target.value);
                  if (revisionError && e.target.value.trim()) setRevisionError(false);
                }}
                placeholder="เช่น กรุณาวัดค่าความสั่นสะเทือนหลังเปลี่ยนลูกปืนอีกครั้ง"
                aria-invalid={revisionError}
                aria-describedby="pending-revision-error"
                className={`w-full bg-white border rounded-[14px] p-3.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-focus/40 ${
                  revisionError ? "border-rose-400" : "border-hairline"
                }`}
              />
              {revisionError && (
                <p id="pending-revision-error" role="alert" className="text-xs text-rose-700 font-semibold">
                  กรุณาระบุเหตุผลก่อนส่งกลับ ช่างต้องรู้ว่าต้องแก้อะไร
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setReviseWO(null)}
              disabled={isRevising}
              className="w-full sm:w-auto px-6 min-h-11 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-parchment font-semibold text-sm cursor-pointer active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmRevise}
              disabled={isRevising}
              className="w-full sm:w-auto px-6 min-h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5 shrink-0" />
              <span>ยืนยันส่งกลับแก้ไข</span>
            </button>
          </ModalFooter>
        </Modal>
      )}

      <WorkOrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workOrder={selectedWO}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        currentUserId={getCurrentUserId() ?? undefined}
        onApproveWorkOrder={handleModalApprove}
        onUpdateWorkOrder={handleModalUpdate}
        onAskAI={onAskAI}
        onStockChanged={onStockChanged}
      />
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Card                                                             */
/* ---------------------------------------------------------------- */

function ReviewCard(props: {
  workOrder: WorkOrder;
  onAskAI: (prompt: string) => void;
  onOpenDetail: () => void;
  onRevise: () => void;
  onApprove: () => void;
}) {
  const { workOrder: wo, onAskAI, onOpenDetail, onRevise, onApprove } = props;

  return (
    <article className="bg-white rounded-[18px] border border-hairline p-5 sm:p-6 space-y-4">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[11px] font-mono font-semibold text-primary">{wo.code}</span>
          {typeof wo.aiVerificationScore === "number" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              ตรวจโดย AI {wo.aiVerificationScore}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              ยังไม่ผ่านการประเมินโดย AI
            </span>
          )}
          {typeof wo.attachments?.length === "number" && wo.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-faint">
              <Paperclip className="w-3.5 h-3.5 shrink-0" />
              เอกสารแนบ {wo.attachments.length}
            </span>
          )}
        </div>
        <h2 className="text-base font-semibold text-ink tracking-[-0.01em]">{wo.title}</h2>
        <p className="text-xs text-ink-muted">
          {wo.machineName} · ช่างผู้ปฏิบัติงาน{" "}
          <span className="font-semibold text-ink">{wo.technicianName}</span>
        </p>
      </header>

      <Evidence workOrder={wo} />

      {/* Approve is the one prominent action; detail is its quieter neighbour;
          sending the job back is destructive and sits apart, on the far side. */}
      <div className="pt-1 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
        <button
          onClick={onRevise}
          className="sm:mr-auto px-4 min-h-11 rounded-full text-rose-700 hover:bg-rose-50 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span>ส่งกลับแก้ไข</span>
        </button>

        <button
          onClick={() =>
            onAskAI(
              `ช่วยตรวจสอบความถูกต้องตามมาตรฐานวิศวกรรมของงาน ${wo.title} (เครื่อง ${wo.machineName})`
            )
          }
          aria-label={`ให้ AI ช่วยตรวจสอบใบงาน ${wo.code}`}
          className="px-3 min-h-11 rounded-full text-ink-faint hover:text-primary hover:bg-primary/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>ให้ AI ช่วยตรวจ</span>
        </button>

        <button
          onClick={onOpenDetail}
          className="px-5 min-h-11 rounded-full bg-pearl hover:bg-parchment text-ink-muted border border-divider text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4 shrink-0 text-primary" />
          <span>ดูรายละเอียด</span>
        </button>

        <button
          onClick={onApprove}
          className="px-6 min-h-12 rounded-full bg-primary hover:bg-primary-focus text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>อนุมัติปิดงาน</span>
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- */
/* Evidence — what the engineer is actually approving                */
/* ---------------------------------------------------------------- */

function Evidence({ workOrder: wo }: { workOrder: WorkOrder }) {
  const steps = planSteps(wo);
  // All 8,589 imported work orders have steps_completed = total_steps = null:
  // the Excel source has no step tracking at all. Coercing that to 0 rendered
  // an amber "ทำสำเร็จ 0 จาก 0 ขั้นตอน" — a progress warning about work that was
  // never tracked in the first place. No step data means "unknown", so say so
  // in a neutral tone instead of reporting zero progress.
  const hasStepData = wo.stepsCompleted != null || wo.totalSteps != null || steps.length > 0;
  const completedCount = wo.stepsCompleted ?? 0;
  const totalCount = wo.totalSteps ?? steps.length;
  const allDone = hasStepData && totalCount > 0 && completedCount >= totalCount;
  const parts = wo.requestedParts ?? [];

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-ink flex flex-wrap items-baseline gap-x-2">
          <span>รายการตรวจสอบ</span>
          <span
            className={`text-[11px] font-semibold ${
              !hasStepData ? "text-ink-faint" : allDone ? "text-emerald-700" : "text-amber-800"
            }`}
          >
            {hasStepData
              ? `ทำสำเร็จ ${completedCount} จาก ${totalCount} ขั้นตอน`
              : "ไม่มีข้อมูลขั้นตอน"}
          </span>
        </h3>

        {steps.length === 0 ? (
          <p className="text-xs text-ink-faint">
            ใบงานนี้ไม่มีรายการขั้นตอนบันทึกไว้ — เปิดรายละเอียดเพื่อตรวจสอบก่อนอนุมัติ
          </p>
        ) : (
          <ul className="space-y-1.5">
            {steps.map((step, idx) => {
              const done = idx < completedCount;
              return (
                <li
                  key={`${idx}-${step.text}`}
                  className="flex items-start gap-2 text-xs leading-relaxed"
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 shrink-0 mt-0.5 text-ink-faint" />
                  )}
                  <span className={done ? "text-ink-muted" : "text-ink-faint"}>
                    {step.text}
                    {step.addedBy && (
                      <span className="text-ink-faint"> · เพิ่มโดย {step.addedBy}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-semibold text-ink">บันทึกจากช่าง</h3>
        {wo.technicianNote?.trim() ? (
          <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-line">
            {wo.technicianNote}
          </p>
        ) : (
          <p className="text-xs text-ink-faint">ช่างไม่ได้บันทึกข้อสังเกตเพิ่มเติม</p>
        )}
        <p className="text-xs text-ink-muted leading-relaxed">{wo.description}</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-semibold text-ink">อะไหล่ที่เบิกใช้</h3>
        {parts.length === 0 ? (
          <p className="text-xs text-ink-faint">ไม่มีการเบิกอะไหล่ในใบงานนี้</p>
        ) : (
          <ul className="space-y-1">
            {parts.map((part) => (
              <li
                key={part.partId}
                className="flex items-baseline justify-between gap-3 text-xs text-ink-muted"
              >
                <span className="min-w-0">
                  <span className="font-mono text-[11px] text-ink-faint">{part.partCode}</span>{" "}
                  {part.partName}
                </span>
                <span className="font-semibold text-ink tabular-nums shrink-0">
                  {part.quantity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {wo.revisionNote && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-semibold text-ink">เคยส่งกลับแก้ไขด้วยเหตุผล</h3>
          <p className="text-xs text-ink-muted leading-relaxed">{wo.revisionNote}</p>
        </section>
      )}
    </div>
  );
}
