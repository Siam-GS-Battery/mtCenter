import React from "react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "../hooks/useSpeechToText";

interface MicDictationButtonProps {
  /** Current field value — used to decide whether a leading space is needed. */
  currentValue: string;
  /** Called with the text to append whenever a phrase is finalised. */
  onTranscript: (text: string) => void;
  className?: string;
}

/**
 * Voice-dictation toggle for a text field — lets a technician speak instead
 * of type when hands are dirty or gloved. Meant to sit absolutely positioned
 * inside a `relative` wrapper around the field, bottom-right, so it never
 * covers the text being typed/spoken.
 */
export const MicDictationButton: React.FC<MicDictationButtonProps> = ({
  currentValue,
  onTranscript,
  className,
}) => {
  const { supported, listening, interimText, toggle, error } = useSpeechToText((text) => {
    if (!text) return;
    onTranscript(currentValue.trim().length > 0 ? ` ${text}` : text);
  });

  return (
    <div className={`flex flex-col items-end gap-1.5 ${className ?? ""}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={!supported}
        aria-label={listening ? "หยุดบันทึกเสียง" : "พูดเพื่อกรอกข้อความ"}
        aria-pressed={listening}
        title={supported ? undefined : "เบราว์เซอร์นี้ไม่รองรับการพูดเพื่อกรอกข้อความ"}
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95 shadow-sm ${
          !supported
            ? "bg-parchment text-ink-faint cursor-not-allowed opacity-60"
            : listening
            ? "bg-rose-600 text-white animate-pulse"
            : "bg-white text-ink-muted border border-hairline hover:bg-parchment"
        }`}
      >
        {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
      {listening && interimText && (
        <span className="max-w-[220px] text-[11px] text-ink-faint italic text-right leading-snug">
          {interimText}
        </span>
      )}
      {error && <span className="max-w-[220px] text-[11px] text-rose-700 text-right">{error}</span>}
    </div>
  );
};
