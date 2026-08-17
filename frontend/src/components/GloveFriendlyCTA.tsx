import React from "react";
import { Plus } from "lucide-react";

interface GloveFriendlyCTAProps {
  onClick: () => void;
  machineName: string;
  subtitle?: string;
  /** Optional override for the big action label. Defaults to "เปิดใบงานด่วน". */
  label?: string;
  /** Optional aria-label override for assistive tech. Defaults to a label that includes the machine name. */
  ariaLabel?: string;
}

export const GloveFriendlyCTA: React.FC<GloveFriendlyCTAProps> = ({
  onClick,
  machineName,
  subtitle,
  label = "เปิดใบงานด่วน",
  ariaLabel,
}) => {
  return (
    <div className="w-full my-4 flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        type="button"
        id="glove-friendly-create-wo-button"
        aria-label={ariaLabel ?? `${label} สำหรับเครื่อง ${machineName}`}
        className="group relative flex items-center justify-center bg-primary hover:bg-primary-focus active:bg-[#00509e] text-white w-16 h-16 rounded-full cursor-pointer select-none transition-[background-color,transform] duration-150 ease-out shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)] active:scale-[0.92] active:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-focus/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      <span className="text-xs text-ink-faint text-center max-w-40">
        {label}
      </span>
    </div>
  );
};
