// Frame 4 extension: ทำให้คุณภาพคำตอบ AI "สังเกตได้" (observable)
//
// ที่มา: ระบบเจอ silent failure 5 เคสในวันเดียว (AI_MODE ตกไปเป็น mock, /diagnose
// กลืน 400, บริบทคู่มือถูกตัด, manualId ถูกทิ้งใน route, "PM" ถูกกรองออกจากคำค้น)
// ไม่มีเคสไหน error เลย — ระบบแค่ตอบแย่ลงเงียบ ๆ endpoint นี้อ่านสถิติจาก
// v_ai_answer_quality / v_ai_recent_failures (0026_ai_quality_metrics.sql) เพื่อให้
// เห็นสัญญาณเหล่านี้ผ่าน API แทนที่จะต้องเข้า DB มือเปล่า
//
// prompt เป็นข้อมูลผู้ใช้ที่อ่อนไหว จึงจำกัดเฉพาะ supervisor (requireSupervisor)
// เหมือนกับ endpoint คลังอะไหล่อื่น ๆ ไม่ใช่ทุก role เข้าได้เหมือน AI chat ปกติ

import { Router } from "express";
import { asyncHandler, sendSuccess } from "../middleware/errorHandler.js";
import { requireSupervisor } from "../middleware/requireSupervisor.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

export interface AiAnswerQualityRow {
  day: string;
  mode: string;
  totalTurns: number;
  thumbsUp: number;
  thumbsDown: number;
  satisfactionPct: number | null;
  fallbackCount: number;
  fallbackRatePct: number | null;
  liveNoCitationCount: number;
  liveNoCitationPct: number | null;
  avgManualHitCount: number | null;
  avgLatencyMs: number | null;
  cacheHitCount: number;
  cacheHitRatePct: number | null;
}

export interface AiRecentFailureRow {
  id: number;
  createdAt: string;
  mode: string;
  provider: string | null;
  modelUsed: string | null;
  promptExcerpt: string;
  fallback: boolean | null;
  manualCitations: number;
  latencyMs: number | null;
  failureReason: string;
}

// แถวดิบจาก Supabase (snake_case) ก่อนแปลงเป็น camelCase ที่ response ใช้จริง
interface RawAnswerQualityRow {
  day: string;
  mode: string;
  total_turns: number;
  thumbs_up: number;
  thumbs_down: number;
  satisfaction_pct: number | null;
  fallback_count: number;
  fallback_rate_pct: number | null;
  live_no_citation_count: number;
  live_no_citation_pct: number | null;
  avg_manual_hit_count: number | null;
  avg_latency_ms: number | null;
  cache_hit_count: number;
  cache_hit_rate_pct: number | null;
}

interface RawRecentFailureRow {
  id: number;
  created_at: string;
  mode: string;
  provider: string | null;
  model_used: string | null;
  prompt_excerpt: string;
  fallback: boolean | null;
  manual_citations: number;
  latency_ms: number | null;
  failure_reason: string;
}

const DEFAULT_SUMMARY_DAYS = 7;
const MAX_SUMMARY_DAYS = 90;
const DEFAULT_FAILURES_LIMIT = 50;
const MAX_FAILURES_LIMIT = 200;

function parseBoundedInt(raw: unknown, fallback: number, max: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(Math.floor(value), max);
}

// GET /api/ai-health/summary?days=7 — อ่านจาก v_ai_answer_quality ย้อนหลัง N วัน
router.get(
  "/summary",
  requireSupervisor,
  asyncHandler(async (req, res) => {
    const days = parseBoundedInt(req.query.days, DEFAULT_SUMMARY_DAYS, MAX_SUMMARY_DAYS);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("v_ai_answer_quality")
      .select("*")
      .gte("day", since)
      .order("day", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as RawAnswerQualityRow[];
    const result: AiAnswerQualityRow[] = rows.map((r) => ({
      day: r.day,
      mode: r.mode,
      totalTurns: r.total_turns,
      thumbsUp: r.thumbs_up,
      thumbsDown: r.thumbs_down,
      satisfactionPct: r.satisfaction_pct,
      fallbackCount: r.fallback_count,
      fallbackRatePct: r.fallback_rate_pct,
      liveNoCitationCount: r.live_no_citation_count,
      liveNoCitationPct: r.live_no_citation_pct,
      avgManualHitCount: r.avg_manual_hit_count,
      avgLatencyMs: r.avg_latency_ms,
      cacheHitCount: r.cache_hit_count,
      cacheHitRatePct: r.cache_hit_rate_pct,
    }));

    sendSuccess(res, { days, rows: result });
  })
);

// GET /api/ai-health/failures?limit=50 — อ่านจาก v_ai_recent_failures
router.get(
  "/failures",
  requireSupervisor,
  asyncHandler(async (req, res) => {
    const limit = parseBoundedInt(req.query.limit, DEFAULT_FAILURES_LIMIT, MAX_FAILURES_LIMIT);

    const { data, error } = await supabase
      .from("v_ai_recent_failures")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as RawRecentFailureRow[];
    const result: AiRecentFailureRow[] = rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      mode: r.mode,
      provider: r.provider,
      modelUsed: r.model_used,
      promptExcerpt: r.prompt_excerpt,
      fallback: r.fallback,
      manualCitations: r.manual_citations,
      latencyMs: r.latency_ms,
      failureReason: r.failure_reason,
    }));

    sendSuccess(res, { limit, rows: result });
  })
);

export default router;
