-- 0026_ai_quality_metrics.sql
-- ทำให้ "คุณภาพคำตอบ AI" สังเกตได้ (observable) — วันนี้เจอ silent failure 5 เคสในวันเดียว
-- (AI_MODE ตกไปเป็น mock โดยไม่มีใครรู้, /diagnose กลืน 400, บริบทคู่มือถูกตัดทิ้งเพราะ
-- budget, manualId ถูกทิ้งใน route, "PM" ถูกกรองออกจากคำค้น) ไม่มีเคสไหน error เลยสักครั้ง
-- ระบบแค่ตอบแย่ลงเงียบ ๆ — คอลัมน์/วิวชุดนี้ทำให้เห็นสัญญาณเหล่านี้ได้จาก SQL ธรรมดา
--
-- หมายเหตุ manual_citations: คอลัมน์นี้เป็น "integer" (จำนวนคู่มือที่อ้างอิง ดู
-- 0017_ai_interaction_logs.sql บรรทัด manual_citations integer not null default 0)
-- ไม่ใช่ jsonb/array — ดังนั้น "มีการอ้างอิงคู่มือหรือไม่" checks ตรง ๆ ด้วย > 0

-- ============================================================================
-- 1) คอลัมน์ใหม่บน ai_interaction_logs — สำหรับสังเกต provider/token/latency/fallback
--    ทั้งหมด nullable เพราะแถวเก่าไม่มีข้อมูลนี้ (ต้องยังคง valid)
-- ============================================================================
alter table ai_interaction_logs add column if not exists provider text;
alter table ai_interaction_logs add column if not exists model_used text;
alter table ai_interaction_logs add column if not exists input_tokens int;
alter table ai_interaction_logs add column if not exists output_tokens int;
alter table ai_interaction_logs add column if not exists cache_read_tokens int;
alter table ai_interaction_logs add column if not exists latency_ms int;
alter table ai_interaction_logs add column if not exists manual_hit_count int;
alter table ai_interaction_logs add column if not exists fallback boolean;

-- threshold ที่ถือว่า latency "ผิดปกติ" — ใช้ร่วมกันทั้ง view สรุปและ view ความล้มเหลว
-- (ตั้งเป็นค่าคงที่ในทั้งสองที่แทน function เพื่อให้ query planner ใช้ index ได้ตรง ๆ
-- และเห็นค่าตรง ๆ ตอนอ่าน SQL โดยไม่ต้องเปิดไฟล์อื่น)
-- ค่า: 15000 ms (15 วินาที) — เกินกว่านี้ถือว่าผู้ใช้รอนานผิดปกติสำหรับ chat/diagnose

-- ============================================================================
-- 2) v_ai_answer_quality — สรุปรายวัน x mode: อัตราต่าง ๆ ที่บอกว่าคำตอบ "แย่ลง" ไหม
-- ============================================================================
create or replace view v_ai_answer_quality
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as day,
  mode,
  count(*) as total_turns,
  count(*) filter (where feedback = 1) as thumbs_up,
  count(*) filter (where feedback = -1) as thumbs_down,
  round(
    100.0 * count(*) filter (where feedback = 1)
      / nullif(count(*) filter (where feedback is not null), 0),
    1
  ) as satisfaction_pct,
  count(*) filter (where fallback = true) as fallback_count,
  round(100.0 * count(*) filter (where fallback = true) / nullif(count(*), 0), 1) as fallback_rate_pct,
  count(*) filter (where mode = 'live' and coalesce(manual_citations, 0) = 0) as live_no_citation_count,
  round(
    100.0 * count(*) filter (where mode = 'live' and coalesce(manual_citations, 0) = 0)
      / nullif(count(*) filter (where mode = 'live'), 0),
    1
  ) as live_no_citation_pct,
  round(avg(manual_hit_count), 2) as avg_manual_hit_count,
  round(avg(latency_ms)) as avg_latency_ms,
  count(*) filter (where cache_read_tokens > 0) as cache_hit_count,
  round(
    100.0 * count(*) filter (where cache_read_tokens > 0)
      / nullif(count(*) filter (where cache_read_tokens is not null), 0),
    1
  ) as cache_hit_rate_pct
from ai_interaction_logs
group by date_trunc('day', created_at), mode
order by day desc, mode;

-- ============================================================================
-- 3) v_ai_recent_failures — เทิร์นล่าสุดที่ "ดูน่าสงสัย" (ไม่จำเป็นต้อง error จริง)
--    เกณฑ์: fallback = true, หรือ mode='live' ที่ไม่มีคู่มืออ้างอิงเลย, หรือ latency สูงผิดปกติ
--    จำกัดจำนวนแถวและตัด prompt ให้สั้น เพราะ view นี้จะถูกอ่านผ่าน API โดยตรง
-- ============================================================================
create or replace view v_ai_recent_failures
with (security_invoker = true) as
select
  id,
  created_at,
  mode,
  provider,
  model_used,
  left(prompt, 200) as prompt_excerpt,
  fallback,
  coalesce(manual_citations, 0) as manual_citations,
  latency_ms,
  case
    when fallback = true then 'fallback'
    when mode = 'live' and coalesce(manual_citations, 0) = 0 then 'live_no_citation'
    when latency_ms > 15000 then 'high_latency'
    else 'other'
  end as failure_reason
from ai_interaction_logs
where fallback = true
   or (mode = 'live' and coalesce(manual_citations, 0) = 0)
   or (latency_ms is not null and latency_ms > 15000)
order by created_at desc
limit 200;

-- ============================================================================
-- Security: ai_interaction_logs เก็บ prompt ของผู้ใช้จริง ถือเป็นข้อมูลอ่อนไหว
-- ตามรูปแบบเดียวกับ 0023_maintenance_analytics.sql — view ต้อง security_invoker = true
-- (ไม่ใช่ security definer semantics ที่ Postgres ตั้งเป็นค่าเริ่มต้น) และต้อง revoke
-- สิทธิ์ทั้งหมดจาก public/anon/authenticated เหลือเฉพาะ service_role ที่ backend ใช้
-- ============================================================================
alter view v_ai_answer_quality set (security_invoker = true);
alter view v_ai_recent_failures set (security_invoker = true);

revoke all on v_ai_answer_quality from public, anon, authenticated;
revoke all on v_ai_recent_failures from public, anon, authenticated;

grant select on v_ai_answer_quality to service_role;
grant select on v_ai_recent_failures to service_role;
