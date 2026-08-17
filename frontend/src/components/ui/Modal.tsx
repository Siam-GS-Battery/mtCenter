import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClassMap: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl lg:max-w-4xl",
  xl: "max-w-3xl lg:max-w-5xl xl:max-w-[1280px]",
};

/**
 * Lets ModalHeader label the dialog without every call site passing an id.
 * The header takes the generated id and tells the Modal it exists, so the
 * dialog only points aria-labelledby at a node that is actually rendered.
 */
const ModalLabelContext = createContext<{
  headerId: string;
  registerHeader: () => void;
} | null>(null);

/**
 * Open dialogs, innermost last. Only the top one reacts to Escape and Tab, so a
 * confirmation stacked over a detail dialog closes alone instead of taking the
 * dialog underneath with it.
 */
const modalStack: symbol[] = [];

/**
 * Body scroll lock, shared across however many modals are stacked.
 *
 * Every call site passes an inline `onClose` arrow, so it is a new function
 * every render; an effect keyed on `[onClose]` therefore re-runs on every
 * render, not just mount/unmount. With one modal that's just wasted work, but
 * with two stacked modals (e.g. a confirm dialog over a reader) a re-render of
 * either one — `setDeleteLoading(true)` guarantees one — reruns both effects'
 * cleanup-then-setup in some order, and the inner modal's "restore" can save
 * the outer modal's already-"hidden" value as the value to restore to. The
 * body is then stuck at `overflow: hidden` forever after both close.
 *
 * Fixing this needs the lock itself to be counted once per mount, not once
 * per render: a module-level counter plus a single saved value, touched only
 * when the count transitions 0<->1, in an effect with an empty dependency
 * array (so it runs exactly once per modal instance, regardless of how many
 * times that instance re-renders).
 */
let bodyScrollLockCount = 0;
let savedBodyOverflow: string | null = null;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Modal(props: {
  onClose: () => void;
  size?: ModalSize;
  children: ReactNode;
  panelClassName?: string;
  closeOnBackdrop?: boolean;
  labelledBy?: string;
}) {
  const { onClose, size = "md", children, panelClassName, closeOnBackdrop = true, labelledBy } = props;

  const generatedHeaderId = useId();
  const [hasHeader, setHasHeader] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelContextRef = useRef({
    headerId: generatedHeaderId,
    registerHeader: () => setHasHeader(true),
  });

  const stackIdRef = useRef(Symbol("modal"));

  // Move focus into the dialog on open and hand it back to whatever opened it.
  useEffect(() => {
    const stackId = stackIdRef.current;
    modalStack.push(stackId);

    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    return () => {
      const index = modalStack.indexOf(stackId);
      if (index !== -1) modalStack.splice(index, 1);
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack[modalStack.length - 1] !== stackIdRef.current) return;

      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || active === panel || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Body scroll lock — see the comment on bodyScrollLockCount above for why
  // this needs its own effect with an empty deps array instead of living
  // alongside the (necessarily re-runs-on-every-render) keydown effect above.
  useEffect(() => {
    if (bodyScrollLockCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    bodyScrollLockCount++;

    return () => {
      bodyScrollLockCount--;
      if (bodyScrollLockCount === 0) {
        document.body.style.overflow = savedBodyOverflow ?? "";
        savedBodyOverflow = null;
      }
    };
  }, []);

  const sizeClasses = sizeClassMap[size];
  const ariaLabelledBy = labelledBy ?? (hasHeader ? generatedHeaderId : undefined);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs">
      <div
        className="flex min-h-full items-center justify-center p-3 sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && closeOnBackdrop) {
            onClose();
          }
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          tabIndex={-1}
          className={
            "relative flex w-full flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] rounded-[18px] bg-white shadow-2xl border border-hairline overflow-hidden focus:outline-none " +
            sizeClasses +
            (panelClassName ? " " + panelClassName : "")
          }
        >
          <ModalLabelContext.Provider value={labelContextRef.current}>
            {children}
          </ModalLabelContext.Provider>
        </div>
      </div>
    </div>
  );
}

export function ModalHeader(props: { children: ReactNode; onClose?: () => void; className?: string }) {
  const { children, onClose, className } = props;
  const labelContext = useContext(ModalLabelContext);
  const registerHeader = labelContext?.registerHeader;

  useEffect(() => {
    registerHeader?.();
  }, [registerHeader]);

  return (
    <div className={"shrink-0 flex items-start justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5 border-b border-divider " + (className ?? "")}>
      <div id={labelContext?.headerId} className="min-w-0 flex-1">
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="ปิด"
          onClick={onClose}
          className="shrink-0 min-h-11 min-w-11 p-2 rounded-full bg-chip-translucent/60 hover:bg-chip-translucent text-ink active:scale-95 transition-all flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function ModalBody(props: { children: ReactNode; className?: string }) {
  const { children, className } = props;

  return <div className={"flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 " + (className ?? "")}>{children}</div>;
}

export function ModalFooter(props: { children: ReactNode; className?: string }) {
  const { children, className } = props;

  return (
    <div className={"shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 px-5 py-4 sm:px-6 sm:py-5 border-t border-divider " + (className ?? "")}>
      {children}
    </div>
  );
}
