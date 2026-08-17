import React, { useEffect, useRef, useState } from "react";
import { Wrench } from "lucide-react";
import { Machine, WorkOrder, SparePart, UserProfile } from "../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import { WorkOrderForm, DiscardChangesDialog } from "./WorkOrderForm";
import type { WorkOrderFormPrefill } from "./WorkOrderForm";

/** Kept as the public name for prefill data handed in by alerts and the assistant. */
export type PrefilledWorkOrderData = WorkOrderFormPrefill;

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  activeMachine?: Machine;
  spareParts: SparePart[];
  /** The person filling the form in. Without it the caller supplies ผู้แจ้ง. */
  currentUser?: UserProfile;
  /** Real technician names to assign to. Omitted: the field is free text. */
  technicians?: string[];
  onCreateWorkOrder: (newWorkOrder: Partial<WorkOrder>) => void | Promise<void>;
  prefilledData?: PrefilledWorkOrderData | null;
}

/**
 * Dialog surface for reporting a repair job — the same WorkOrderForm the full
 * page renders, so neither surface can drift into collecting different fields
 * or writing a different status.
 */
export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  machines,
  activeMachine,
  spareParts,
  currentUser,
  technicians,
  onCreateWorkOrder,
  prefilledData,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  // Bumped on every open so the form re-initialises from the current prefill.
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
    if (isDirty) {
      setConfirmingClose(true);
      return;
    }
    onClose();
  };

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
                แจ้งงานซ่อมบำรุง
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                ใบงานจะถูกบันทึกเป็นสถานะรอดำเนินการจนกว่าช่างจะเริ่มลงมือ
              </p>
            </div>
          </div>
        </ModalHeader>

        <WorkOrderForm
          variant="modal"
          resetKey={openCount}
          machines={machines}
          activeMachine={activeMachine}
          spareParts={spareParts}
          currentUser={currentUser}
          technicians={technicians}
          prefill={prefilledData}
          onDirtyChange={setIsDirty}
          onSubmit={async (draft) => {
            await onCreateWorkOrder(draft);
            setIsDirty(false);
          }}
          onCancel={requestClose}
          Body={ModalBody}
          Footer={ModalFooter}
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
