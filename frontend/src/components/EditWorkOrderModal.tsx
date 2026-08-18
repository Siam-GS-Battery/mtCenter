import React, { useEffect, useRef, useState } from "react";
import { Wrench } from "lucide-react";
import { Machine, WorkOrder, SparePart, UserProfile } from "../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import { WorkOrderForm, DiscardChangesDialog } from "./WorkOrderForm";
import type { WorkOrderFormPrefill } from "./WorkOrderForm";

interface EditWorkOrderModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, draft: Partial<WorkOrder>) => Promise<void>;
  machines: Machine[];
  spareParts: SparePart[];
  technicians?: Pick<UserProfile, "id" | "name">[];
  currentUser: UserProfile | null;
}

/** Maps an existing work order onto the same prefill shape the create dialog uses. */
function toPrefill(workOrder: WorkOrder): WorkOrderFormPrefill {
  return {
    machineId: workOrder.machineId ?? undefined,
    title: workOrder.title,
    description: workOrder.description,
    priority: workOrder.priority,
    actionPlan: workOrder.actionPlan?.length ? workOrder.actionPlan.join("\n") : undefined,
    dueDate: workOrder.dueDate ?? undefined,
    symptoms: workOrder.symptoms?.length ? workOrder.symptoms : undefined,
    // Preserve exact parts + quantities — matching by name alone (the old
    // `suggestedParts` string list) missed everything and silently wiped
    // work_order_parts on every edit.
    requestedParts: workOrder.requestedParts?.length ? workOrder.requestedParts : undefined,
  };
}

/**
 * Dialog surface for editing an existing work order — same WorkOrderForm as
 * CreateWorkOrderModal, just pre-loaded from the current record and posting
 * back through an id-scoped update instead of a create.
 */
export const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({
  workOrder,
  isOpen,
  onClose,
  onSubmit,
  machines,
  spareParts,
  technicians,
  currentUser,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bumped on every open so the form re-initialises from the current work order.
  const [openCount, setOpenCount] = useState(0);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setOpenCount((n) => n + 1);
      setIsDirty(false);
      setConfirmingClose(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  const requestClose = () => {
    if (isSubmitting) return;
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  };

  const activeMachine = machines.find((m) => m.id === workOrder.machineId);

  return (
    <>
      <Modal size="xl" onClose={requestClose} closeOnBackdrop={false}>
        <ModalHeader onClose={requestClose}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-base sm:text-lg text-ink tracking-[-0.02em]">
                แก้ไขใบงานซ่อมบำรุง
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                ใบงาน {workOrder.code} — {workOrder.title}
              </p>
            </div>
          </div>
        </ModalHeader>

        <WorkOrderForm
          variant="modal"
          resetKey={`${workOrder.id}-${openCount}`}
          machines={machines}
          activeMachine={activeMachine}
          spareParts={spareParts}
          currentUser={currentUser ?? undefined}
          technicians={technicians}
          prefill={toPrefill(workOrder)}
          workOrderId={workOrder.id}
          draftStorageKey={`edit-work-order-${workOrder.id}`}
          onDirtyChange={setIsDirty}
          onSubmit={async (draft) => {
            setIsSubmitting(true);
            try {
              await onSubmit(workOrder.id, draft);
              setIsDirty(false);
              onClose();
            } catch (err) {
              // Re-throw so WorkOrderForm (mode="edit") keeps the dialog open,
              // preserves the entered data, and shows the Thai error inline
              // instead of this modal appearing to have saved and closing.
              throw err;
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCancel={requestClose}
          Body={ModalBody}
          Footer={ModalFooter}
          submitLabel="บันทึกการแก้ไข"
          mode="edit"
        />
      </Modal>

      {confirmingClose && (
        <DiscardChangesDialog
          onKeepEditing={() => setConfirmingClose(false)}
          onDiscard={() => {
            setConfirmingClose(false);
            setIsDirty(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default EditWorkOrderModal;
