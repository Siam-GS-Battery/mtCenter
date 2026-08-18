import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal typings for the non-standard Web Speech API — not in lib.dom.d.ts,
 * and Chrome/Edge only ship it prefixed as `webkitSpeechRecognition`.
 */
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function getRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export interface UseSpeechToTextResult {
  /** Whether this browser supports the Web Speech API at all. */
  supported: boolean;
  listening: boolean;
  /** Live, not-yet-final transcript — a hint while the user keeps talking. */
  interimText: string;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  error: string | null;
}

/**
 * Thin wrapper around the browser's speech-to-text so a form field can be
 * filled by voice instead of typing — meant for technicians whose hands are
 * dirty/gloved and shouldn't have to touch a keyboard.
 *
 * `onFinalText` fires once per finalised phrase (a natural pause in speech),
 * not per keystroke — the caller decides how to merge it into the field.
 */
export function useSpeechToText(onFinalText: (text: string) => void): UseSpeechToTextResult {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalTextRef = useRef(onFinalText);
  onFinalTextRef.current = onFinalText;

  const Ctor = getRecognitionCtor();
  const supported = Boolean(Ctor);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!Ctor || recognitionRef.current) return;
    setError(null);
    const recognition = new Ctor();
    recognition.lang = "th-TH";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          onFinalTextRef.current(transcript.trim());
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      setError(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "กรุณาอนุญาตให้ใช้ไมโครโฟน"
          : "การรับเสียงพูดขัดข้อง กรุณาลองใหม่"
      );
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [Ctor]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return { supported, listening, interimText, start, stop, toggle, error };
}
