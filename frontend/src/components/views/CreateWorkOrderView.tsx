import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Machine, WorkOrder, SparePart, UserProfile } from "../../types";
import { WorkOrderForm, DiscardChangesDialog } from "../WorkOrderForm";

interface CreateWorkOrderViewProps {
  machines: Machine[];
  activeMachine: Machine;
  currentUser: UserProfile;
  spareParts: SparePart[];
  /** Real technician names to assign to. Omitted: the field is free text. */
  technicians?: string[];
  onCreateWorkOrder: (newWorkOrder: Partial<WorkOrder>) => void | Promise<void>;
  onAskAI: (prompt: string) => void;
  onNavigateToMyOrders: () => void;
}

const DRAFT_KEY = "mtcenter.workOrderDraft";

/**
 * Full-page surface for reporting a repair job. The dialog
 * (CreateWorkOrderModal) is the same task in a smaller room — both render
 * WorkOrderForm, so the fields, the validation, and the resulting status can
 * only ever be one thing. TopBar renders the page heading.
 */
export const CreateWorkOrderView: React.FC<CreateWorkOrderViewProps> = ({
  machines,
  activeMachine,
  currentUser,
  spareParts,
  technicians,
  onCreateWorkOrder,
  onAskAI,
  onNavigateToMyOrders,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const requestLeave = () => {
    if (isDirty) {
      setConfirmingLeave(true);
      return;
    }
    onNavigateToMyOrders();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <p className="text-sm text-ink-muted leading-relaxed max-w-prose">
          แจ้งอาการผิดปกติที่พบหน้างาน ใบงานจะถูกบันทึกเป็นสถานะรอดำเนินการ
          และจะเปลี่ยนเป็นกำลังซ่อมเมื่อช่างเริ่มลงมือจริง
        </p>

        <button
          type="button"
          onClick={() =>
            onAskAI(
              `ช่วยแนะนำการกรอกใบงานแจ้งซ่อมสำหรับเครื่อง ${activeMachine.code} (${activeMachine.name}) รวมถึงอาการที่พบบ่อยและอะไหล่ที่ควรเตรียม`
            )
          }
          className="shrink-0 self-start px-5 min-h-11 rounded-full bg-white hover:bg-parchment text-ink-muted border border-hairline text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>ให้ AI ช่วยยกร่าง</span>
        </button>
      </div>

      <WorkOrderForm
        variant="page"
        machines={machines}
        activeMachine={activeMachine}
        spareParts={spareParts}
        currentUser={currentUser}
        technicians={technicians}
        draftStorageKey={DRAFT_KEY}
        onDirtyChange={setIsDirty}
        onSubmit={async (draft) => {
          await onCreateWorkOrder(draft);
          setIsDirty(false);
        }}
        onCancel={requestLeave}
      />

      {confirmingLeave && (
        <DiscardChangesDialog
          draftIsSaved
          onKeepEditing={() => setConfirmingLeave(false)}
          onDiscard={() => {
            setConfirmingLeave(false);
            onNavigateToMyOrders();
          }}
        />
      )}
    </div>
  );
};
