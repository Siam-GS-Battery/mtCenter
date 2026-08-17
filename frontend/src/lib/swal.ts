// Thin wrapper around SweetAlert2 giving the app one shared set of notification
// helpers — toasts, blocking modals, and confirm dialogs — all in Thai and
// styled to match the rest of the UI (rounded-[18px] dialogs, rounded-full
// buttons, min-h-11 glove-friendly touch targets). Dependency-free apart from
// sweetalert2 itself; no React import, so it is callable from plain handlers.
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const CONFIRM_BTN =
  "bg-primary hover:bg-primary-focus text-white font-semibold rounded-full px-5 py-2.5 text-xs min-h-11";
const CONFIRM_BTN_DANGER =
  "bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full px-5 py-2.5 text-xs min-h-11";
const CANCEL_BTN =
  "bg-pearl text-ink-muted border border-divider rounded-full px-5 py-2.5 text-xs min-h-11";

const modalCustomClass = {
  popup: "rounded-[18px]",
  confirmButton: CONFIRM_BTN,
  cancelButton: CANCEL_BTN,
  actions: "gap-3",
};

const toastMixin = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  showClass: { popup: "" },
  hideClass: { popup: "" },
  didOpen: (el) => {
    el.addEventListener("mouseenter", Swal.stopTimer);
    el.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

/** Persistent toast with a spinner. Stays until dismissSaving() or another notify* call. Default title "กำลังบันทึก..." */
export function notifySaving(title: string = "กำลังบันทึก..."): void {
  toastMixin.fire({
    title,
    icon: undefined,
    timer: undefined,
    timerProgressBar: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: (el) => {
      Swal.showLoading();
      el.addEventListener("mouseenter", Swal.stopTimer);
      el.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
}

/** Closes any open saving toast/loading dialog. Safe to call when nothing is open.
 *  Caveat: this closes whatever SweetAlert2 dialog currently happens to be open, not
 *  specifically the saving toast — Swal.close() has no notion of "which" popup. That's
 *  fine as long as every call site invokes this BEFORE showing the next dialog (the
 *  existing convention). Never call it from a `finally` block, since a `finally` can run
 *  after notifyFailed() has shown an error modal, and this would close that modal before
 *  the user has read it. */
export function dismissSaving(): void {
  if (Swal.isVisible()) {
    Swal.close();
  }
}

/** Auto-dismissing success toast, top-end, ~2s. Default title "บันทึกสำเร็จ" */
export function notifySaved(title: string = "บันทึกสำเร็จ"): void {
  toastMixin.fire({
    title,
    icon: "success",
    timer: 2000,
    timerProgressBar: true,
  });
}

/** Blocking error modal with an OK button. Must be awaited-able. */
export function notifyFailed(title: string, text?: string): Promise<void> {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "ตกลง",
    buttonsStyling: false,
    customClass: modalCustomClass,
  }).then(() => undefined);
}

/** Blocking success modal with an OK button — for important outcomes like อนุมัติแล้ว / ปฏิเสธแล้ว. */
export function notifyDone(title: string, text?: string): Promise<void> {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "ตกลง",
    buttonsStyling: false,
    customClass: modalCustomClass,
  }).then(() => undefined);
}

/** Confirm dialog. Resolves true if the user confirmed. */
export function confirmAction(opts: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}): Promise<boolean> {
  const { title, text, confirmText = "ยืนยัน", cancelText = "ยกเลิก", danger = false } = opts;
  return Swal.fire({
    icon: danger ? "warning" : "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
      ...modalCustomClass,
      confirmButton: danger ? CONFIRM_BTN_DANGER : CONFIRM_BTN,
    },
  }).then((result) => result.isConfirmed);
}

/** Generic toast used by the app's existing showToast(msg, type) — keeps that call signature working. */
export function notifyToast(message: string, type: "success" | "error" = "success"): void {
  toastMixin.fire({
    title: message,
    icon: type,
    timer: 4000,
    timerProgressBar: true,
  });
}
