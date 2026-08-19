import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatMessage } from "../types";

export interface AiChatSession {
  id: string;
  title: string; // auto-derived from first user message, fallback "แชตใหม่"
  messages: ChatMessage[];
  machineId: string | null; // machine selected for this session
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface AiChatSessionsApi {
  sessions: AiChatSession[]; // sorted newest updatedAt first
  activeSessionId: string | null;
  activeSession: AiChatSession | null;
  createSession: (machineId?: string | null) => AiChatSession;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  updateActiveSession: (patch: { messages?: ChatMessage[]; machineId?: string | null }) => void;
  /** เหมือน updateActiveSession แต่ระบุ sessionId ตรง ๆ — ใช้ตอนเพิ่งสร้าง session
   * ใหม่ในรอบ callback เดียวกัน ซึ่ง activeSessionId ที่ปิดอยู่ (closure) ยังเป็นค่าเก่า */
  updateSession: (
    sessionId: string,
    patch: { messages?: ChatMessage[]; machineId?: string | null }
  ) => void;
  clearAllSessions: () => void;
}

const STORAGE_KEY = "mtcenter.aiChatSessions";
const DEFAULT_TITLE = "แชตใหม่";
const MAX_SESSIONS = 30;
const MAX_MESSAGES_PER_SESSION = 200;
const TITLE_MAX_LEN = 40;

let fallbackIdCounter = 0;

/** สร้าง id แบบไม่พึ่ง dependency เพิ่ม */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  fallbackIdCounter += 1;
  return `id-${Date.now()}-${fallbackIdCounter}`;
}

interface StoredShape {
  sessions: AiChatSession[];
  activeSessionId: string | null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    (v.sender === "user" || v.sender === "assistant") &&
    typeof v.text === "string" &&
    typeof v.timestamp === "string"
  );
}

function isAiChatSession(value: unknown): value is AiChatSession {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    Array.isArray(v.messages) &&
    v.messages.every(isChatMessage) &&
    (typeof v.machineId === "string" || v.machineId === null) &&
    typeof v.createdAt === "string" &&
    typeof v.updatedAt === "string"
  );
}

/** อ่าน + ตรวจสอบข้อมูลจาก localStorage — ถ้ารูปแบบผิดพลาดให้คืนค่าเปล่าเสมอ */
function readStorage(): StoredShape {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [], activeSessionId: null };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return { sessions: [], activeSessionId: null };
    }
    const obj = parsed as Record<string, unknown>;
    const sessions = Array.isArray(obj.sessions) ? obj.sessions.filter(isAiChatSession) : [];
    const activeSessionId = typeof obj.activeSessionId === "string" ? obj.activeSessionId : null;
    return { sessions, activeSessionId };
  } catch {
    return { sessions: [], activeSessionId: null };
  }
}

/** ตัด session/message ให้ไม่เกินขีดจำกัดก่อนบันทึกลง localStorage */
function trimForStorage(shape: StoredShape): StoredShape {
  const sortedByUpdated = [...shape.sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const cappedSessions = sortedByUpdated.slice(0, MAX_SESSIONS).map((session) => ({
    ...session,
    messages:
      session.messages.length > MAX_MESSAGES_PER_SESSION
        ? session.messages.slice(session.messages.length - MAX_MESSAGES_PER_SESSION)
        : session.messages,
  }));
  const keptIds = new Set(cappedSessions.map((s) => s.id));
  const activeSessionId = shape.activeSessionId && keptIds.has(shape.activeSessionId)
    ? shape.activeSessionId
    : null;
  return { sessions: cappedSessions, activeSessionId };
}

function deriveTitle(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return DEFAULT_TITLE;
  if (trimmed.length <= TITLE_MAX_LEN) return trimmed;
  return `${trimmed.slice(0, TITLE_MAX_LEN)}…`;
}

export function useAiChatSessions(): AiChatSessionsApi {
  // โหลดจาก localStorage แบบ synchronous ตั้งแต่ render แรก (lazy initializer) —
  // เดิมโหลดผ่าน useEffect ซึ่งทำงาน "หลัง" ค่า state เริ่มต้น ([]/null) ถูก render
  // ไปแล้ว ทำให้ effect บันทึกข้อมูล (ด้านล่าง) ที่รันในรอบ mount เดียวกันเขียนค่า
  // เปล่าทับข้อมูลจริงใน localStorage ก่อนที่ค่าที่โหลดได้จะถูก set กลับเข้ามา และ
  // ที่ร้ายกว่านั้นคือ useAssistantChat (ผู้ใช้ค่า activeSession) อ่าน activeSession
  // ไปตั้งเป็น initial state ของบทสนทนาตั้งแต่ render แรกด้วย ถ้าโหลดช้ากว่านั้นแม้แค่
  // เฟรมเดียว บทสนทนาที่ restore มาก็จะไม่ถูก hydrate เข้าจอเลย
  const [sessions, setSessions] = useState<AiChatSession[]>(() => readStorage().sessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => readStorage().activeSessionId
  );

  // บันทึกทุกครั้งที่มีการเปลี่ยนแปลง (รวมถึงครั้งแรกหลัง mount เพื่อเขียนค่าที่ trim
  // แล้วกลับไป แต่เนื่องจาก state เริ่มต้นเป็นค่าที่โหลดมาจริงแล้ว การเขียนครั้งแรกนี้
  // จึงเป็นการเขียนข้อมูลเดิมกลับไป ไม่ใช่การเขียนค่าเปล่าทับ)
  useEffect(() => {
    try {
      const trimmed = trimForStorage({ sessions, activeSessionId });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // เต็มโควตาหรือ localStorage ใช้ไม่ได้ — ข้ามอย่างเงียบ ๆ
    }
  }, [sessions, activeSessionId]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [sessions]
  );

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const createSession = useCallback((machineId?: string | null): AiChatSession => {
    const now = new Date().toISOString();
    const newSession: AiChatSession = {
      id: generateId(),
      title: DEFAULT_TITLE,
      messages: [],
      machineId: machineId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    return newSession;
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      setActiveSessionId((currentActiveId) => {
        if (currentActiveId !== sessionId) return currentActiveId;
        if (remaining.length === 0) return null;
        const newest = [...remaining].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        return newest.id;
      });
      return remaining;
    });
  }, []);

  const renameSession = useCallback((sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  const applySessionPatch = useCallback(
    (sessionId: string, patch: { messages?: ChatMessage[]; machineId?: string | null }) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const nextMessages = patch.messages ?? s.messages;
          let nextTitle = s.title;
          if (s.title === DEFAULT_TITLE) {
            const firstUserMessage = nextMessages.find((m) => m.sender === "user");
            if (firstUserMessage) {
              nextTitle = deriveTitle(firstUserMessage.text);
            }
          }
          return {
            ...s,
            messages: nextMessages,
            machineId: patch.machineId !== undefined ? patch.machineId : s.machineId,
            title: nextTitle,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const updateActiveSession = useCallback(
    (patch: { messages?: ChatMessage[]; machineId?: string | null }) => {
      if (!activeSessionId) return;
      applySessionPatch(activeSessionId, patch);
    },
    [activeSessionId, applySessionPatch]
  );

  const updateSession = useCallback(
    (sessionId: string, patch: { messages?: ChatMessage[]; machineId?: string | null }) => {
      applySessionPatch(sessionId, patch);
    },
    [applySessionPatch]
  );

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  return {
    sessions: sortedSessions,
    activeSessionId,
    activeSession,
    createSession,
    selectSession,
    deleteSession,
    renameSession,
    updateActiveSession,
    updateSession,
    clearAllSessions,
  };
}
