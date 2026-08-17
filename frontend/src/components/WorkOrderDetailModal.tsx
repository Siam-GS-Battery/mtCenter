import React, { useState, useEffect, useId, useMemo } from "react";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Package,
  ListOrdered,
  FileText,
  AlertTriangle,
  Send,
  XCircle,
  Square,
  CheckSquare,
  Plus,
  Info,
} from "lucide-react";
import { WorkOrder, UserRole, WorkOrderStep } from "../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import {
  woStatusLabel,
  woStatusPillClass,
  priorityLabel,
  priorityPillClass,
} from "../lib/pillStyles";
import { orDash, NO_DATA_TH } from "../lib/format";
import { workOrderDisplayDate, workOrderFinishTime } from "../lib/workOrderStatus";
import {
  notifySaving,
  dismissSaving,
  notifySaved,
  notifyFailed,
  notifyDone,
  confirmAction as confirmDialog,
} from "../lib/swal";
import { toUserMessage } from "../services/apiService";

interface WorkOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  currentUserRole?: UserRole;
  /** ชื่อผู้ใช้งานปัจจุบัน — ใช้บันทึกว่าใครเป็นผู้เพิ่มขั้นตอนปฏิบัติงาน */
  currentUserName?: string;
  onUpdateWorkOrder?: (updatedWO: WorkOrder) => Promise<void>;
  onApproveWorkOrder?: (woId: string) => Promise<void>;
  onReturnForRevision?: (woId: string, reason?: string) => void;
  onAskAI?: (prompt: string) => void;
}

const TAB_IDS = ["overview", "checklist", "parts", "engineering"] as const;
type TabId = (typeof TAB_IDS)[number];

/** A part counts as issued only when the store actually released it. */
const ISSUED_PART_STATUSES = new Set(["issued", "approved", "delivered"]);
const PENDING_PART_STATUSES = new Set(["pending", "requested"]);

function isPartIssued(status: string | null | undefined): boolean {
  return status != null && ISSUED_PART_STATUSES.has(status);
}

// A missing status (null in 5,390 of 5,553 real rows) is unknown, not "still
// pending" — showing "รออนุมัติเบิก" for it would fabricate a request state
// nobody recorded, so it gets its own neutral label instead.
function partStatusLabel(status: string | null | undefined): string {
  if (status == null) return NO_DATA_TH;
  if (isPartIssued(status)) return "จ่ายของแล้ว";
  if (PENDING_PART_STATUSES.has(status)) return "รออนุมัติเบิก";
  return status;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  currentUserRole = "technician",
  currentUserName,
  onUpdateWorkOrder,
  onApproveWorkOrder,
  onReturnForRevision,
  onAskAI,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [technicianNote, setTechnicianNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "revise" | null>(null);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionError, setRevisionError] = useState(false);
  const [newStepText, setNewStepText] = useState("");
  const [newStepError, setNewStepError] = useState(false);

  const idBase = useId();
  const tabId = (tab: TabId) => `${idBase}-tab-${tab}`;
  const panelId = (tab: TabId) => `${idBase}-panel-${tab}`;
  const submitHintId = `${idBase}-submit-hint`;
  const newStepFieldId = `${idBase}-new-step`;

  // The plan a work order actually carries. No invented steps stand in for a
  // missing plan — a checklist is evidence of work performed, so every line on
  // it has to be one a person wrote.
  const planSteps = useMemo<WorkOrderStep[]>(() => {
    if (workOrder?.actionPlanSteps && workOrder.actionPlanSteps.length > 0) {
      return workOrder.actionPlanSteps;
    }
    if (workOrder?.actionPlan && workOrder.actionPlan.length > 0) {
      return workOrder.actionPlan.map((text) => ({ text }));
    }
    if (workOrder?.solutionSteps && workOrder.solutionSteps.length > 0) {
      return workOrder.solutionSteps.map((text) => ({ text }));
    }
    return [];
  }, [workOrder]);

  const [steps, setSteps] = useState<WorkOrderStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  const workOrderId = workOrder?.id;

  // Reset the editing surface only when a different work order is opened —
  // saving keeps the confirmation banner on screen instead of wiping it.
  useEffect(() => {
    setTechnicianNote("");
    setConfirmAction(null);
    setRevisionReason("");
    setRevisionError(false);
    setNewStepText("");
    setNewStepError(false);
    setActiveTab("overview");
  }, [workOrderId]);

  useEffect(() => {
    setTechnicianNote((current) => current || (workOrder?.technicianNote ?? ""));
  }, [workOrder?.technicianNote]);

  useEffect(() => {
    const completedCount = workOrder?.stepsCompleted || 0;
    setSteps(planSteps);
    setCompletedSteps(planSteps.map((_, idx) => idx < completedCount));
  }, [planSteps, workOrder?.stepsCompleted]);

  if (!isOpen || !workOrder) return null;

  const totalStepsCount = steps.length;
  const currentCompletedCount = completedSteps.filter(Boolean).length;
  const allStepsDone = totalStepsCount > 0 && currentCompletedCount === totalStepsCount;
  const progressPercent =
    totalStepsCount > 0 ? Math.round((currentCompletedCount / totalStepsCount) * 100) : 0;

  const isEngineerOrSupervisor = currentUserRole === "engineer" || currentUserRole === "supervisor";
  const canEditSteps = !isEngineerOrSupervisor;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  const handleAddStep = () => {
    const text = newStepText.trim();
    if (!text) {
      setNewStepError(true);
      return;
    }

    setSteps((prev) => [
      ...prev,
      { text, addedBy: currentUserName, addedAt: new Date().toISOString().slice(0, 10) },
    ]);
    setCompletedSteps((prev) => [...prev, false]);
    setNewStepText("");
    setNewStepError(false);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const offset =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next = TAB_IDS[(index + offset + TAB_IDS.length) % TAB_IDS.length];
    setActiveTab(next);
    document.getElementById(tabId(next))?.focus();
  };

  const trimmedNote = technicianNote.trim();

  const submitBlockedReason =
    totalStepsCount === 0
      ? "ต้องเพิ่มขั้นตอนปฏิบัติงานอย่างน้อย 1 ขั้นตอน แล้วทำเครื่องหมายว่าเสร็จ ก่อนส่งให้วิศวกรตรวจสอบ"
      : !allStepsDone
        ? `เหลืออีก ${totalStepsCount - currentCompletedCount} ขั้นตอนที่ยังไม่ทำเครื่องหมายว่าเสร็จ`
        : null;

  const tabLabels: Record<TabId, string> = {
    overview: "ภาพรวมและอาการ",
    checklist: `ขั้นตอนซ่อม (${currentCompletedCount}/${totalStepsCount})`,
    parts: `เบิกอะไหล่ (${workOrder.requestedParts?.length || 0})`,
    engineering: "ผลตรวจสอบและ AI",
  };

  const tabIcons: Record<TabId, React.ReactNode> = {
    overview: <FileText className="w-3.5 h-3.5" />,
    checklist: <ListOrdered className="w-3.5 h-3.5" />,
    parts: <Package className="w-3.5 h-3.5" />,
    engineering: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
  };

  const handleSaveProgress = async () => {
    if (!onUpdateWorkOrder) return;
    setIsSubmitting(true);
    notifySaving("กำลังบันทึกความคืบหน้า...");

    const updatedWO: WorkOrder = {
      ...workOrder,
      actionPlanSteps: steps,
      actionPlan: steps.map((step) => step.text),
      stepsCompleted: currentCompletedCount,
      totalSteps: totalStepsCount,
      technicianNote: trimmedNote || workOrder.technicianNote,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    try {
      await onUpdateWorkOrder(updatedWO);
      dismissSaving();
      notifySaved("บันทึกความคืบหน้าสำเร็จ");
    } catch (err) {
      dismissSaving();
      await notifyFailed(
        "บันทึกไม่สำเร็จ",
        toUserMessage(err, "บันทึกความคืบหน้าไม่สำเร็จ กรุณาลองอีกครั้ง")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!onUpdateWorkOrder || !allStepsDone) return;

    const ok = await confirmDialog({
      title: "ยืนยันส่งให้วิศวกรตรวจสอบ?",
      text: "เมื่อส่งแล้วจะไม่สามารถแก้ไขความคืบหน้าได้จนกว่าวิศวกรจะตรวจสอบ",
      confirmText: "ส่งตรวจสอบ",
    });
    if (!ok) return;

    setIsSubmitting(true);
    notifySaving("กำลังส่งใบงาน...");

    const updatedWO: WorkOrder = {
      ...workOrder,
      actionPlanSteps: steps,
      actionPlan: steps.map((step) => step.text),
      stepsCompleted: totalStepsCount,
      totalSteps: totalStepsCount,
      status: "review",
      technicianNote: trimmedNote || workOrder.technicianNote,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    try {
      await onUpdateWorkOrder(updatedWO);
      dismissSaving();
      await notifyDone("ส่งให้วิศวกรตรวจสอบแล้ว", `ใบงาน ${workOrder.code} รอการตรวจสอบ`);
    } catch (err) {
      dismissSaving();
      await notifyFailed(
        "ส่งใบงานไม่สำเร็จ",
        toUserMessage(err, "ส่งใบงานให้วิศวกรตรวจสอบไม่สำเร็จ กรุณาลองอีกครั้ง")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmApprove = async () => {
    setIsSubmitting(true);
    notifySaving("กำลังอนุมัติ...");

    try {
      if (onApproveWorkOrder) {
        await onApproveWorkOrder(workOrder.id);
      } else if (onUpdateWorkOrder) {
        await onUpdateWorkOrder({
          ...workOrder,
          status: "completed",
          updatedAt: new Date().toISOString().slice(0, 10),
        });
      }
      dismissSaving();
      setConfirmAction(null);
      await notifyDone("อนุมัติแล้ว", `ปิดใบงาน ${workOrder.code} เรียบร้อย`);
    } catch (err) {
      dismissSaving();
      await notifyFailed(
        "อนุมัติไม่สำเร็จ",
        toUserMessage(err, "อนุมัติปิดใบงานไม่สำเร็จ กรุณาลองอีกครั้ง")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRevision = async () => {
    const reason = revisionReason.trim();
    if (!reason) {
      setRevisionError(true);
      return;
    }

    setIsSubmitting(true);
    notifySaving("กำลังส่งกลับแก้ไข...");

    try {
      if (onReturnForRevision) {
        await onReturnForRevision(workOrder.id, reason);
      } else if (onUpdateWorkOrder) {
        await onUpdateWorkOrder({
          ...workOrder,
          status: "in_progress",
          revisionNote: reason,
          updatedAt: new Date().toISOString().slice(0, 10),
        });
      }
      dismissSaving();
      setConfirmAction(null);
      await notifyDone("ส่งกลับแก้ไขแล้ว", `ใบงาน ${workOrder.code} ถูกส่งกลับให้ช่างแก้ไข`);
    } catch (err) {
      dismissSaving();
      await notifyFailed(
        "ส่งกลับแก้ไขไม่สำเร็จ",
        toUserMessage(err, "ส่งใบงานกลับแก้ไขไม่สำเร็จ กรุณาลองอีกครั้ง")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal size="xl" onClose={onClose}>
        <ModalHeader onClose={onClose}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border-0 shrink-0">
                {workOrder.code}
              </span>

              <span className={priorityPillClass(workOrder.priority)}>
                {priorityLabel(workOrder.priority)}
              </span>

              <span className={woStatusPillClass(workOrder.status)}>
                {woStatusLabel(workOrder.status)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-ink leading-snug tracking-[-0.02em]">
              {workOrder.title}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {workOrder.revisionNote && (
            <div className="p-3 rounded-[11px] bg-amber-50 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">วิศวกรส่งกลับให้แก้ไข</span>
                <span className="leading-relaxed">{workOrder.revisionNote}</span>
              </div>
            </div>
          )}

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-parchment p-4 rounded-[11px] border-0 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-ink-faint block mb-0.5">
                เครื่องจักร
              </span>
              <span className="font-semibold text-ink block truncate">
                {workOrder.machineName} ({orDash(workOrder.machineCode ?? workOrder.machineId)})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-ink-faint block mb-0.5">
                ช่างผู้ปฏิบัติงาน
              </span>
              <span className="font-semibold text-ink block truncate">
                {workOrder.technicianName || workOrder.assignedTo || "ยังไม่ระบุ"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-ink-faint block mb-0.5">
                วิศวกรผู้ตรวจสอบ
              </span>
              <span className="font-semibold text-ink block truncate">
                {workOrder.engineerReviewer || "ยังไม่ระบุ"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-ink-faint block mb-0.5">
                กำหนดเสร็จ
              </span>
              <span className={`font-semibold block ${workOrder.dueDate ? "text-rose-600" : "text-ink-faint"}`}>
                {workOrder.dueDate || "—"}
              </span>
            </div>

            {/* When the repair actually finished. Present on all 8,589 imported
                work orders and shown nowhere else in the app — the modal used to
                offer only the due date, so a closed ticket never said when the
                job landed. Nothing sorts on this, so the UTC→local conversion in
                workOrderFinishTime cannot reorder anything. */}
            {workOrder.finishDatetime && (
              <div>
                <span className="text-[10px] font-semibold text-ink-faint block mb-0.5">
                  ซ่อมเสร็จเมื่อ
                </span>
                <span className="font-semibold text-emerald-700 block">
                  {workOrderDisplayDate(workOrder)}
                  {workOrderFinishTime(workOrder) ? ` · ${workOrderFinishTime(workOrder)} น.` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Tab Switcher */}
          <div
            role="tablist"
            aria-label="ส่วนต่าง ๆ ของใบงาน"
            className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-parchment p-1 rounded-[11px]"
          >
            {TAB_IDS.map((tab, index) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={tabId(tab)}
                aria-selected={activeTab === tab}
                aria-controls={panelId(tab)}
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`py-2 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center active:scale-95 ${
                  activeTab === tab ? "bg-white text-primary" : "text-ink-muted hover:text-ink"
                }`}
              >
                {tabIcons[tab]}
                <span>{tabLabels[tab]}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div
              role="tabpanel"
              id={panelId("overview")}
              aria-labelledby={tabId("overview")}
              tabIndex={0}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-ink-faint">
                  รายละเอียดใบงานและสภาพปัญหาที่พบ
                </h4>
                <p className="text-xs text-ink bg-parchment p-4 rounded-[11px] border-0 leading-relaxed font-normal">
                  {workOrder.description}
                </p>
              </div>

              {/* Symptoms Tags */}
              {workOrder.symptoms && workOrder.symptoms.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-ink-faint">
                    สภาวะผิดปกติที่บันทึกไว้
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {workOrder.symptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>{sym}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technician note (persisted) */}
              {workOrder.technicianNote && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-ink-faint">
                    บันทึกข้อสังเกตจากช่าง
                  </h4>
                  <p className="text-xs text-ink bg-parchment p-4 rounded-[11px] border-0 leading-relaxed font-normal">
                    {workOrder.technicianNote}
                  </p>
                </div>
              )}

              {/* Progress Overview Bar */}
              <div className="p-4 rounded-[11px] bg-parchment border-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-muted" id={`${idBase}-progress-label`}>
                    ความคืบหน้าการปฏิบัติงาน
                  </span>
                  <span className="font-semibold text-primary">
                    {totalStepsCount > 0
                      ? `${currentCompletedCount} / ${totalStepsCount} ขั้นตอน (${progressPercent}%)`
                      : "ยังไม่มีขั้นตอนปฏิบัติงาน"}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-labelledby={`${idBase}-progress-label`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  aria-valuetext={
                    totalStepsCount > 0
                      ? `ทำเสร็จแล้ว ${currentCompletedCount} จาก ${totalStepsCount} ขั้นตอน`
                      : "ยังไม่มีขั้นตอนปฏิบัติงาน"
                  }
                  className="w-full bg-hairline rounded-full h-2.5 overflow-hidden"
                >
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Checklist */}
          {activeTab === "checklist" && (
            <div
              role="tabpanel"
              id={panelId("checklist")}
              aria-labelledby={tabId("checklist")}
              tabIndex={0}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-ink-faint">
                  รายการขั้นตอนปฏิบัติงาน
                </h4>
                {totalStepsCount > 0 && (
                  <span className="text-xs font-semibold text-ink-faint">
                    ทำเครื่องหมายเมื่อเสร็จแต่ละขั้นตอน
                  </span>
                )}
              </div>

              {totalStepsCount === 0 ? (
                <div className="p-5 bg-parchment rounded-[11px] space-y-2 text-xs">
                  <p className="font-semibold text-ink">ใบงานนี้ยังไม่มีขั้นตอนปฏิบัติงาน</p>
                  <p className="text-ink-muted leading-relaxed">
                    เพิ่มขั้นตอนที่จะลงมือทำจริงด้านล่าง ระบบจะบันทึกชื่อผู้เพิ่มไว้กับทุกขั้นตอน
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5 list-none">
                  {steps.map((step, idx) => {
                    const isChecked = Boolean(completedSteps[idx]);
                    return (
                      <li key={`${step.text}-${idx}`}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() => toggleStep(idx)}
                          className={`w-full text-left p-3.5 rounded-[11px] border flex items-center justify-between gap-3 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 ${
                            isChecked
                              ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                              : "bg-parchment border-hairline text-ink-muted hover:bg-divider"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block text-xs leading-relaxed font-normal">
                              {idx + 1}. {step.text}
                            </span>
                            {step.addedBy && (
                              <span className="block text-[11px] text-ink-faint mt-1 font-normal">
                                เพิ่มโดย {step.addedBy}
                                {step.addedAt ? ` · ${step.addedAt}` : ""}
                              </span>
                            )}
                          </span>
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-ink-faint shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Add a real step — recorded against the person who wrote it */}
              {canEditSteps && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink" htmlFor={newStepFieldId}>
                    เพิ่มขั้นตอนปฏิบัติงาน
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id={newStepFieldId}
                      type="text"
                      value={newStepText}
                      onChange={(e) => {
                        setNewStepText(e.target.value);
                        if (newStepError && e.target.value.trim()) setNewStepError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddStep();
                        }
                      }}
                      aria-describedby={newStepError ? `${newStepFieldId}-error` : undefined}
                      placeholder="เช่น ตัดไฟและติดป้าย Lockout-Tagout ที่ตู้ควบคุม"
                      className={`flex-1 bg-white border rounded-[18px] px-4 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus/40 ${
                        newStepError ? "border-rose-400" : "border-hairline"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="px-4 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มขั้นตอน</span>
                    </button>
                  </div>
                  {newStepError && (
                    <p id={`${newStepFieldId}-error`} className="text-[11px] text-rose-600 font-semibold">
                      กรุณาพิมพ์ขั้นตอนก่อนกดเพิ่ม
                    </p>
                  )}
                </div>
              )}

              {/* Note input for technician */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-ink" htmlFor="technician-note">
                  บันทึกข้อสังเกตเพิ่มเติม / หมายเหตุของช่าง
                </label>
                <textarea
                  id="technician-note"
                  rows={2}
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  placeholder="เช่น ค่าความร้อน Spindle หลังทดสอบ 15 นาทีอยู่ที่ 42°C ไม่มีเสียงสั่นสะเทือน"
                  className="w-full bg-white border border-hairline rounded-[18px] p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
                />
                <p className="text-[11px] text-ink-faint">
                  บันทึกนี้จะถูกเก็บไว้กับใบงานเมื่อกด "บันทึกความคืบหน้า" หรือ "ส่งให้วิศวกรตรวจสอบ"
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Requested Parts */}
          {activeTab === "parts" && (
            <div
              role="tabpanel"
              id={panelId("parts")}
              aria-labelledby={tabId("parts")}
              tabIndex={0}
              className="space-y-4"
            >
              <h4 className="text-xs font-semibold text-ink-faint">
                รายการอะไหล่ที่เบิกสำหรับงานนี้
              </h4>

              {workOrder.requestedParts && workOrder.requestedParts.length > 0 ? (
                <div className="bg-parchment rounded-[11px] border-0 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-divider border-b border-hairline text-[10px] font-semibold text-ink-faint">
                        <th className="p-3">รหัสอะไหล่</th>
                        <th className="p-3">ชื่ออะไหล่</th>
                        <th className="p-3 text-center">จำนวน</th>
                        <th className="p-3 text-right">สถานะเบิก</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider font-normal">
                      {workOrder.requestedParts.map((part, idx) => (
                        <tr key={idx} className="hover:bg-divider/60">
                          <td className="p-3 font-mono font-semibold text-primary">
                            {orDash(part.partCode)}
                          </td>
                          <td className="p-3 font-semibold text-ink-muted">{orDash(part.partName)}</td>
                          <td className="p-3 text-center font-semibold text-ink">
                            {part.quantity}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isPartIssued(part.status)
                                  ? "bg-emerald-100 text-emerald-800"
                                  : part.status == null
                                    ? "bg-parchment text-ink-faint"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {partStatusLabel(part.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-parchment rounded-[11px] border-0 text-center text-xs text-ink-faint">
                  ไม่มีการเบิกชิ้นส่วนอะไหล่เพิ่มเติมในใบงานนี้
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Engineering Analysis & AI */}
          {activeTab === "engineering" && (
            <div
              role="tabpanel"
              id={panelId("engineering")}
              aria-labelledby={tabId("engineering")}
              tabIndex={0}
              className="space-y-4"
            >
              {typeof workOrder.aiVerificationScore === "number" ? (
                <div className="p-4 rounded-[11px] bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 block">
                      คะแนนตรวจสอบความถูกต้องและความปลอดภัยโดย AI
                    </span>
                    <span className="text-xl font-semibold text-emerald-800 tracking-[-0.02em]">
                      {workOrder.aiVerificationScore}%
                    </span>
                  </div>
                  <ShieldCheck className="w-9 h-9 text-emerald-600 shrink-0" />
                </div>
              ) : (
                <div className="p-4 rounded-[11px] bg-parchment border border-hairline flex items-center justify-between text-ink-muted">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-ink-faint block">
                      คะแนนตรวจสอบความถูกต้องและความปลอดภัยโดย AI
                    </span>
                    <span className="text-xl font-semibold text-ink-faint tracking-[-0.02em]">
                      ยังไม่ประเมิน
                    </span>
                  </div>
                  <ShieldCheck className="w-9 h-9 text-ink-faint shrink-0" />
                </div>
              )}

              {workOrder.engineeringAnalysis ? (
                <div className="bg-parchment p-4 rounded-[11px] border-0 space-y-2 text-xs">
                  <h5 className="font-semibold text-ink flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span>บทวิเคราะห์เชิงวิศวกรรมของใบงานนี้</span>
                  </h5>
                  <p className="text-ink-muted leading-relaxed">{workOrder.engineeringAnalysis}</p>
                </div>
              ) : (
                <p className="text-xs text-ink-faint">
                  ยังไม่มีบทวิเคราะห์เชิงวิศวกรรมสำหรับใบงานนี้
                </p>
              )}
            </div>
          )}

          {/* AI Assistant Quick Query Banner — only where asking about the repair
              itself makes sense, not over the parts table or the review result. */}
          {(activeTab === "overview" || activeTab === "checklist") && (
          <div className="p-4 rounded-[11px] bg-primary/10 border-0 text-ink flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-xs font-semibold text-primary">MT Center AI</div>
                <div className="text-[11px] text-ink-muted">
                  สอบถามขั้นตอนซ่อมหรือวิเคราะห์พารามิเตอร์ของเครื่อง {workOrder.machineName} ได้ที่นี่
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onAskAI) {
                  const promptMsg = isEngineerOrSupervisor
                    ? `ช่วยวิเคราะห์สาเหตุของปัญหาในใบงาน ${workOrder.code}: ${workOrder.title} (เครื่อง ${workOrder.machineName})`
                    : `ขอขั้นตอนและข้อควรระวังด้านความปลอดภัยในการแก้ปัญหา ${workOrder.title} (เครื่อง ${workOrder.machineName})`;
                  onAskAI(promptMsg);
                  onClose();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer whitespace-nowrap transition-all active:scale-95"
            >
              ถามผู้ช่วย AI
            </button>
          </div>
          )}
        </ModalBody>

        <ModalFooter>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-divider font-semibold text-xs transition-all cursor-pointer active:scale-95"
          >
            ปิดหน้าต่าง
          </button>

          {/* Engineer / Supervisor Actions */}
          {isEngineerOrSupervisor ? (
            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setRevisionReason("");
                  setRevisionError(false);
                  setConfirmAction("revise");
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>ส่งกลับแก้ไข</span>
              </button>

              <button
                onClick={() => setConfirmAction("approve")}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>อนุมัติปิดใบงาน</span>
              </button>
            </div>
          ) : (
            /* Technician Actions */
            <div className="w-full sm:w-auto space-y-2">
              {submitBlockedReason && (
                <p id={submitHintId} className="text-[11px] font-semibold text-amber-700 sm:text-right">
                  {submitBlockedReason}
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveProgress}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-divider font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <span>บันทึกความคืบหน้า</span>
                </button>

                <button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || !allStepsDone}
                  aria-describedby={submitBlockedReason ? submitHintId : undefined}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งให้วิศวกรตรวจสอบ</span>
                </button>
              </div>
            </div>
          )}
        </ModalFooter>
      </Modal>

      {/* Approve confirmation */}
      {confirmAction === "approve" && (
        <Modal size="sm" onClose={() => setConfirmAction(null)}>
          <ModalHeader onClose={() => setConfirmAction(null)}>
            <h3 className="text-base font-semibold text-ink">ยืนยันการอนุมัติปิดใบงาน</h3>
          </ModalHeader>
          <ModalBody className="space-y-3 text-xs">
            <div className="bg-parchment p-4 rounded-[11px] space-y-1.5">
              <div>
                <span className="text-ink-faint">ใบงาน: </span>
                <span className="font-semibold text-ink">{workOrder.code} — {workOrder.title}</span>
              </div>
              <div>
                <span className="text-ink-faint">เครื่องจักร: </span>
                <span className="font-semibold text-ink">{workOrder.machineName}</span>
              </div>
              <div>
                <span className="text-ink-faint">คะแนนตรวจสอบโดย AI: </span>
                <span className="font-semibold text-ink">
                  {typeof workOrder.aiVerificationScore === "number"
                    ? `${workOrder.aiVerificationScore}%`
                    : "ยังไม่ประเมิน"}
                </span>
              </div>
            </div>
            {typeof workOrder.aiVerificationScore !== "number" && (
              <div className="p-3 rounded-[11px] bg-amber-50 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>ใบงานนี้ยังไม่ผ่านการประเมินโดย AI โปรดตรวจสอบรายละเอียดด้วยตนเองก่อนอนุมัติ</span>
              </div>
            )}
            <p className="text-ink-muted">
              เมื่ออนุมัติแล้ว ใบงานจะถูกปิดและสถานะเครื่องจะกลับสู่การใช้งานปกติ
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setConfirmAction(null)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-divider font-semibold text-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmApprove}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันอนุมัติปิดงาน</span>
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Return-for-revision reason */}
      {confirmAction === "revise" && (
        <Modal size="sm" onClose={() => setConfirmAction(null)}>
          <ModalHeader onClose={() => setConfirmAction(null)}>
            <h3 className="text-base font-semibold text-ink">ส่งใบงานกลับให้ช่างแก้ไข</h3>
          </ModalHeader>
          <ModalBody className="space-y-3 text-xs">
            <p className="text-ink-muted">
              ใบงาน <span className="font-semibold text-ink">{workOrder.code}</span> จะถูกเปลี่ยนสถานะกลับเป็น "กำลังซ่อม" พร้อมเหตุผลที่ระบุ
            </p>
            <div className="space-y-1.5">
              <label className="font-semibold text-ink" htmlFor="revision-reason">
                เหตุผลที่ต้องแก้ไข (จำเป็น)
              </label>
              <textarea
                id="revision-reason"
                rows={3}
                value={revisionReason}
                onChange={(e) => {
                  setRevisionReason(e.target.value);
                  if (revisionError && e.target.value.trim()) setRevisionError(false);
                }}
                placeholder="เช่น กรุณาวัดค่าความสั่นสะเทือนหลังเปลี่ยนลูกปืนอีกครั้ง"
                className={`w-full bg-white border rounded-[11px] p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus/40 ${
                  revisionError ? "border-rose-400" : "border-hairline"
                }`}
              />
              {revisionError && (
                <p className="text-rose-600 font-semibold">กรุณาระบุเหตุผลก่อนส่งกลับ</p>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setConfirmAction(null)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-divider font-semibold text-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmRevision}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              <span>ยืนยันส่งกลับแก้ไข</span>
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};
