-- 0023_maintenance_analytics.sql
-- Layer 2 analytics: VIEW/RPC ที่ให้ AI assistant วิเคราะห์งานซ่อมบำรุงจริง
-- (MTBF/MTTR, downtime, ของซ้ำ, ความเสี่ยงอะไหล่หมด, compliance ของ PM, เทรนด์
-- เซนเซอร์, ต้นทุนดิบ) แทนที่จะดึงแถวดิบมาให้โมเดลนับเอง
--
-- หมายเหตุสำคัญเรื่อง schema จริง (ต่างจากร่างเดิมใน AI_Assistant_Agentic_Design.md):
--   1. work_orders.status ยอมรับค่า ('pending','in_progress','review','completed')
--      เท่านั้น (0001_init.sql) ไม่มีค่า 'closed' ตามที่ร่างเดิมเขียน — งานที่ปิดแล้ว
--      ในไฟล์นี้ทั้งหมดจึงกรองด้วย status = 'completed'
--   2. work_orders.machine_id เป็น text ที่ยอม NULL (0011_alter_work_orders.sql ลบ FK
--      ออกไปแล้วเพราะ ~31 แถวจาก import ไม่มี QR code) แถว "งานซ่อมจริง" ส่วนใหญ่ที่
--      import เข้ามาจึง "ไม่มี" machine_id แต่มี machine_code (ข้อความ, ไม่ unique)
--      แทน — VIEW/RPC ด้านล่างจึงใช้ machine_code เป็นตัวระบุเครื่องหลัก ไม่ใช่
--      machine_id ตามร่างเดิม แล้ว LEFT JOIN เข้า machines(code) เพื่อดึงชื่อ/ที่ตั้ง
--      การ join นี้ "lossy" ได้ — machines.code ไม่ unique (0009_alter_machines.sql
--      ลบ unique constraint ทิ้งเพราะมี QR ซ้ำจริงในข้อมูล) จึงอาจจับคู่ผิดเครื่องได้
--      ในบางเคสที่ QR ซ้ำ
--   3. work_orders.assigned_date / due_date เป็น "text" ไม่ใช่ date จึงใช้
--      finish_datetime (timestamptz, 0011) เป็นตัวกรองช่วงวันที่แทนตลอดทั้งไฟล์
--   4. part_withdrawals.code_no ไม่มี FK ไป spare_parts.code (0008/0010) — ทั้งสองฝั่ง
--      มีรหัสซ้ำได้จริงตามที่ comment ของ migration ต้นทางระบุไว้ ผลรวมการเบิกต่อ
--      spare_part หนึ่งตัวจึงอาจปนกับของรุ่น/ล็อตอื่นที่ใช้รหัสเดียวกัน

-- ============================================================================
-- 1) mv_machine_failure_intervals — ช่วงเวลาระหว่างงานซ่อมที่ปิดแล้วของเครื่องเดียวกัน
--    ตอบคำถาม: "เครื่องนี้เสียถี่แค่ไหน" (เตรียมข้อมูลดิบให้ mv_machine_reliability
--    คำนวณ MTBF ต่อ)
-- ============================================================================
create or replace view mv_machine_failure_intervals
with (security_invoker = true) as
select
  w.machine_code,
  w.id as work_order_id,
  w.repair_category,
  w.finish_datetime,
  w.mtloss_min,
  w.repair_duration_min,
  w.finish_datetime - lag(w.finish_datetime) over (
    partition by w.machine_code order by w.finish_datetime
  ) as interval_since_prev_failure
from work_orders w
where w.status = 'completed'
  and w.machine_code is not null
  and w.finish_datetime is not null;

-- ============================================================================
-- 2) mv_machine_reliability — MTBF/MTTR/downtime สรุปต่อเครื่อง
--    ตอบคำถาม: "เครื่องไหนเสียบ่อย/ซ่อมนานสุด/downtime รวมเท่าไหร่"
-- ============================================================================
create or replace view mv_machine_reliability
with (security_invoker = true) as
with agg as (
  select
    machine_code,
    count(*) as failure_count,
    sum(mtloss_min) as total_downtime_min,
    avg(repair_duration_min) as mttr_min
  from work_orders
  where status = 'completed'
    and machine_code is not null
  group by machine_code
),
intervals as (
  select
    machine_code,
    avg(extract(epoch from interval_since_prev_failure) / 60.0) as mtbf_min
  from mv_machine_failure_intervals
  where interval_since_prev_failure is not null
  group by machine_code
)
select
  m.id as machine_id,
  m.code as machine_code_ref,
  agg.machine_code,
  m.model,
  m.location,
  m.factory_group,
  m.section,
  agg.failure_count,
  agg.total_downtime_min,
  agg.mttr_min,
  intervals.mtbf_min
from agg
-- lossy: machines.code ไม่ unique (ดู comment หัวไฟล์ข้อ 2) เลือกแถว machines
-- แถวแรกที่รหัสตรงกันเท่านั้น ถ้าต้องการความแม่นยำระดับ QR ซ้ำ ต้องดูที่ machines
-- โดยตรงเพิ่มเติม
left join machines m on m.code = agg.machine_code
left join intervals on intervals.machine_code = agg.machine_code;

-- ============================================================================
-- 3) mv_reliability_by_category — reliability aggregate แยกตามหมวดซ่อม (repair_category)
--    ตอบคำถาม: "ปัญหาประเภทไหนเกิดกับเครื่องนี้/โรงงานบ่อยสุด"
-- ============================================================================
create or replace view mv_reliability_by_category
with (security_invoker = true) as
select
  machine_id,          -- passthrough จาก work_orders — มักเป็น NULL สำหรับแถว import (ดู comment หัวไฟล์ข้อ 2)
  machine_code,
  repair_category,
  count(*) as failure_count,
  sum(mtloss_min) as total_downtime_min,
  avg(repair_duration_min) as mttr_min
from work_orders
where status = 'completed'
  and machine_code is not null
  and repair_category is not null
group by machine_id, machine_code, repair_category;

-- ============================================================================
-- 4) rpc_downtime_by_machine — จัดอันดับ downtime รวมต่อเครื่องในช่วงวันที่ที่ระบุ
--    ตอบคำถาม: "ช่วงเดือนนี้เครื่องไหน downtime เยอะสุด"
-- ============================================================================
create or replace function rpc_downtime_by_machine(
  period_start date,
  period_end date,
  limit_count int default 20
)
returns table (
  machine_code text,
  machine_name text,
  factory_group text,
  section text,
  failure_count bigint,
  total_downtime_min numeric,
  avg_downtime_min numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    w.machine_code,
    m.name as machine_name,
    m.factory_group,
    m.section,
    count(*) as failure_count,
    sum(w.mtloss_min) as total_downtime_min,
    avg(w.mtloss_min) as avg_downtime_min
  from work_orders w
  left join machines m on m.code = w.machine_code
  where w.status = 'completed'
    and w.machine_code is not null
    and w.finish_datetime is not null
    and w.finish_datetime::date >= period_start
    and w.finish_datetime::date <= period_end
  group by w.machine_code, m.name, m.factory_group, m.section
  order by total_downtime_min desc nulls last
  limit greatest(limit_count, 1);
$$;

-- ============================================================================
-- 5) rpc_downtime_by_section — เหมือนข้อ 4 แต่รวมระดับ section
--    ตั้งใจแยกเป็นฟังก์ชันของตัวเอง "ไม่" ทำเป็น dynamic group-by ที่รับชื่อคอลัมน์
--    มาจากพารามิเตอร์ (เช่น group_by text) เพราะการเอาชื่อคอลัมน์ที่ผู้ใช้ส่งมา
--    ไปต่อเป็น SQL ตรง ๆ (แม้จะ whitelisted ก็เสี่ยงพลาด) เป็นช่องโหว่ SQL injection
--    คลาสสิก — แยกฟังก์ชันต่อ dimension ปลอดภัยกว่าและ query planner optimize ได้ตรงกว่า
--    ตอบคำถาม: "แผนก/section ไหน downtime รวมเยอะสุดในช่วงนี้"
-- ============================================================================
create or replace function rpc_downtime_by_section(
  period_start date,
  period_end date
)
returns table (
  section text,
  factory_group text,
  failure_count bigint,
  total_downtime_min numeric,
  avg_downtime_min numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.section,
    m.factory_group,
    count(*) as failure_count,
    sum(w.mtloss_min) as total_downtime_min,
    avg(w.mtloss_min) as avg_downtime_min
  from work_orders w
  left join machines m on m.code = w.machine_code
  where w.status = 'completed'
    and w.machine_code is not null
    and w.finish_datetime is not null
    and w.finish_datetime::date >= period_start
    and w.finish_datetime::date <= period_end
  group by m.section, m.factory_group
  order by total_downtime_min desc nulls last;
$$;

-- ============================================================================
-- 6) rpc_repeat_failures — เครื่องเดิม + หมวดซ่อมเดิม เสียซ้ำ ๆ ติดกันภายใน days_window วัน
--    ใช้ lag() ตรวจ "ช่วงห่างระหว่างครั้งที่ติดกัน" จริง (gaps-and-islands) ไม่ใช่แค่
--    นับจำนวนแถวใน trailing window เฉย ๆ — ถ้าทำแบบหลังจะ "over-report" เพราะจะนับ
--    เครื่องที่เสีย 2 ครั้งห่างกัน 29 วันในหมวดเดียวกัน แต่กระจายอยู่คนละหัวคนละท้าย
--    ของ trailing window 90 วันว่าเป็น "ซ้ำ" ทั้งที่จริงไม่ได้เกิดใกล้กันเลย วิธีที่ใช้
--    ที่นี่จับเฉพาะ "episode" ที่ทุกคู่ติดกันห่างกัน <= days_window วันจริง ๆ เท่านั้น
--    ตอบคำถาม: "เครื่องไหนเสียซ้ำเรื่องเดิมถี่ผิดปกติ (บ่งชี้ว่าซ่อมไม่ถึงต้นเหตุ)"
-- ============================================================================
create or replace function rpc_repeat_failures(
  days_window int default 30,
  min_occurrences int default 2
)
returns table (
  machine_code text,
  repair_category text,
  repeat_count bigint,
  first_occurrence timestamptz,
  last_occurrence timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with ordered as (
    select
      machine_code,
      repair_category,
      finish_datetime,
      lag(finish_datetime) over (
        partition by machine_code, repair_category order by finish_datetime
      ) as prev_finish
    from work_orders
    where status = 'completed'
      and machine_code is not null
      and repair_category is not null
      and finish_datetime is not null
  ),
  flagged as (
    select
      *,
      case
        when prev_finish is not null
          and finish_datetime - prev_finish <= (days_window || ' days')::interval
        then 0 else 1
      end as starts_new_episode
    from ordered
  ),
  islands as (
    select
      *,
      sum(starts_new_episode) over (
        partition by machine_code, repair_category order by finish_datetime
      ) as episode_id
    from flagged
  )
  select
    machine_code,
    repair_category,
    count(*) as repeat_count,
    min(finish_datetime) as first_occurrence,
    max(finish_datetime) as last_occurrence
  from islands
  group by machine_code, repair_category, episode_id
  having count(*) >= min_occurrences
  order by repeat_count desc, last_occurrence desc;
$$;

-- ============================================================================
-- 7) rpc_reorder_risk — ประเมินความเสี่ยงอะไหล่จะหมดจากอัตราการเบิกจริงย้อนหลัง
--    ตอบคำถาม: "อะไหล่ตัวไหนใกล้หมด/ต้องสั่งเพิ่มด่วน"
--    ทุกการหารด้านล่าง guard ด้วย nullif เพื่อไม่ให้อะไหล่ที่ไม่มีการเบิกเลยในช่วงที่
--    ดู (avg_daily_qty = 0) ทำให้เกิด division-by-zero error — กรณีนั้นถือว่า
--    risk_level = 'ok' (ไม่มีการใช้ ไม่มีความเสี่ยงจะหมดในเร็ว ๆ นี้)
-- ============================================================================
create or replace function rpc_reorder_risk(
  lookback_days int default 90
)
returns table (
  spare_part_id text,
  code text,
  name text,
  stock_quantity int,
  unit text,
  reorder_point int,
  safety_stock_quantity int,
  total_qty_withdrawn numeric,
  avg_daily_qty numeric,
  days_of_cover numeric,
  risk_level text
)
language sql
stable
security definer
set search_path = public
as $$
  with consumption as (
    -- lossy join note: part_withdrawals.code_no <-> spare_parts.code ไม่มี FK และทั้ง
    -- สองฝั่งมีรหัสซ้ำได้จริง (0008/0010) ผลรวมนี้จึงอาจปนของรุ่น/ล็อตอื่นที่ใช้รหัส
    -- เดียวกันได้ในบางกรณี
    select code_no, sum(qty) as total_qty
    from part_withdrawals
    where code_no is not null
      and withdraw_date is not null
      and withdraw_date >= current_date - lookback_days
    group by code_no
  ),
  base as (
    select
      sp.id as spare_part_id,
      sp.code,
      sp.name,
      sp.stock_quantity,
      sp.unit,
      sp.reorder_point,
      sp.safety_stock_quantity,
      coalesce(c.total_qty, 0) as total_qty_withdrawn,
      coalesce(c.total_qty, 0) / nullif(lookback_days, 0) as avg_daily_qty
    from spare_parts sp
    left join consumption c on c.code_no = sp.code
  )
  select
    spare_part_id,
    code,
    name,
    stock_quantity,
    unit,
    reorder_point,
    safety_stock_quantity,
    total_qty_withdrawn,
    avg_daily_qty,
    stock_quantity / nullif(avg_daily_qty, 0) as days_of_cover,
    case
      when avg_daily_qty is null or avg_daily_qty = 0 then 'ok'
      when safety_stock_quantity is not null and stock_quantity <= safety_stock_quantity then 'critical'
      when stock_quantity / nullif(avg_daily_qty, 0) <= 7 then 'critical'
      when reorder_point is not null and stock_quantity <= reorder_point then 'reorder'
      when stock_quantity / nullif(avg_daily_qty, 0) <= 14 then 'reorder'
      when stock_quantity / nullif(avg_daily_qty, 0) <= 30 then 'watch'
      else 'ok'
    end as risk_level
  from base
  order by days_of_cover asc nulls last;
$$;

-- ============================================================================
-- 8) mv_pm_compliance / v_pm_overdue_list — อัตราทำ PM สำเร็จ/เลยกำหนด ต่อเครื่อง+ประเภท PM
--    ตอบคำถาม: "PM ของเครื่องนี้ทำตามแผนไหม" / "PM อะไรเลยกำหนดอยู่ตอนนี้บ้าง"
-- ============================================================================
create or replace view mv_pm_compliance
with (security_invoker = true) as
select
  machine_code,
  pm_type,
  count(*) as total_plans,
  count(*) filter (where actual_date is not null) as completed_count,
  count(*) filter (where is_overdue) as overdue_count,
  round(
    100.0 * count(*) filter (where actual_date is not null) / nullif(count(*), 0),
    1
  ) as completion_pct
from pm_plans
where machine_code is not null
group by machine_code, pm_type;

create or replace view v_pm_overdue_list
with (security_invoker = true) as
select
  id,
  machine_code,
  machine_base_name,
  pm_type,
  item_description,
  part_name,
  responsible,
  planner,
  plan_date,
  last_pm_date,
  next_pm_date
from pm_plans
where is_overdue = true
order by next_pm_date asc nulls last;

-- ============================================================================
-- 9) rpc_telemetry_trend — rolling average/stddev/z-score ของค่าเซนเซอร์ย้อนหลัง
--    ตอบคำถาม: "ค่า spindle_temp/vibration ของเครื่องนี้ผิดปกติไหมในช่วงที่ผ่านมา"
--    guard การหาร z-score ด้วย nullif เพราะ 20 แถวแรกของแต่ละเครื่อง/metric มักมี
--    ค่า stddev เป็น 0 หรือ null (ตัวอย่างไม่พอ)
-- ============================================================================
create or replace function rpc_telemetry_trend(
  p_machine_id text,
  p_metric text,
  window_hours int default 24
)
returns table (
  recorded_at timestamptz,
  value numeric,
  rolling_avg numeric,
  rolling_stddev numeric,
  z_score numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with windowed as (
    select
      recorded_at,
      value,
      avg(value) over (
        order by recorded_at rows between 20 preceding and current row
      ) as rolling_avg,
      stddev(value) over (
        order by recorded_at rows between 20 preceding and current row
      ) as rolling_stddev
    from telemetry_readings
    where machine_id = p_machine_id
      and metric = p_metric
      and recorded_at >= now() - (window_hours || ' hours')::interval
  )
  select
    recorded_at,
    value,
    rolling_avg,
    rolling_stddev,
    (value - rolling_avg) / nullif(rolling_stddev, 0) as z_score
  from windowed
  order by recorded_at;
$$;

-- ============================================================================
-- 10) rpc_cost_rollup_by_machine — รวมต้นทุนดิบต่อเครื่องในช่วงวันที่ (parts + PM + downtime)
--     ตอบคำถาม: "เครื่องนี้ต้นทุนซ่อมบำรุงรวมเท่าไหร่ในช่วงนี้"
--     "ไม่" คูณ downtime_min ด้วยค่าคงที่ บาท/นาที ใด ๆ ในนี้ — อัตรา downtime คิดเป็น
--     เงินเท่าไหร่ต่อนาทีเปลี่ยนไปตามไลน์/ช่วงเวลา/สมมติฐานธุรกิจ (opportunity cost,
--     ค่าแรงจอด ฯลฯ) ไม่ใช่ค่าคงที่ทางฟิสิกส์ ให้ผู้เรียก (backend/AI) เอา downtime_min
--     ดิบไปคูณอัตราที่กำหนดเองแทน เพื่อไม่ให้ migration ผูกมัดตัวเลขธุรกิจไว้ตายตัว
-- ============================================================================
create or replace function rpc_cost_rollup_by_machine(
  period_start date,
  period_end date
)
returns table (
  machine_code text,
  parts_cost numeric,
  pm_cost numeric,
  downtime_min numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with codes as (
    select distinct machine_code from work_orders
      where machine_code is not null
        and status = 'completed'
        and finish_datetime::date >= period_start
        and finish_datetime::date <= period_end
    union
    select distinct machine_code from part_withdrawals
      where machine_code is not null
        and withdraw_date >= period_start
        and withdraw_date <= period_end
    union
    select distinct machine_code from pm_plans
      where machine_code is not null
        and actual_date >= period_start
        and actual_date <= period_end
  ),
  parts as (
    select machine_code, sum(total_value) as parts_cost
    from part_withdrawals
    where machine_code is not null
      and withdraw_date >= period_start
      and withdraw_date <= period_end
    group by machine_code
  ),
  pm as (
    select machine_code, sum(cost) as pm_cost
    from pm_plans
    where machine_code is not null
      and actual_date >= period_start
      and actual_date <= period_end
    group by machine_code
  ),
  downtime as (
    select machine_code, sum(mtloss_min) as downtime_min
    from work_orders
    where machine_code is not null
      and status = 'completed'
      and finish_datetime::date >= period_start
      and finish_datetime::date <= period_end
    group by machine_code
  )
  select
    codes.machine_code,
    coalesce(parts.parts_cost, 0) as parts_cost,
    coalesce(pm.pm_cost, 0) as pm_cost,
    coalesce(downtime.downtime_min, 0) as downtime_min
  from codes
  left join parts on parts.machine_code = codes.machine_code
  left join pm on pm.machine_code = codes.machine_code
  left join downtime on downtime.machine_code = codes.machine_code
  order by codes.machine_code;
$$;

-- ============================================================================
-- 11) Index สำหรับ query แบบวิเคราะห์ด้านบน — เช็กแล้วว่าตัวไหนมีอยู่แล้วจาก
--     migration ก่อนหน้า (idx_work_orders_status, idx_work_orders_machine_id
--     (0001), idx_work_orders_machine_code, idx_work_orders_fy,
--     idx_work_orders_finish_datetime (0011), idx_part_withdrawals_code_no,
--     idx_part_withdrawals_withdraw_date (0008), idx_pm_plans_next_pm_date
--     (0007), idx_telemetry_readings_trend on (machine_id, metric,
--     recorded_at desc) (0003) — ตัวสุดท้ายนี้ตรงกับที่โจทย์ข้อ 11 ขอพอดี
--     จึงไม่สร้างซ้ำ) เหลือแค่ composite/partial index ที่ยังไม่มีจริง ๆ ด้านล่าง
-- ============================================================================
create index if not exists idx_work_orders_machine_status_finish
  on work_orders(machine_id, status, finish_datetime);

create index if not exists idx_work_orders_machine_category_assigned
  on work_orders(machine_id, repair_category, assigned_date);

create index if not exists idx_work_orders_assigned_date
  on work_orders(assigned_date);

create index if not exists idx_part_withdrawals_code_date
  on part_withdrawals(code_no, withdraw_date);

-- partial index: เฉพาะแถวที่เลยกำหนดจริง (is_overdue = true) เพราะ v_pm_overdue_list
-- และ dashboard เตือน PM ค้นเฉพาะกลุ่มนี้เป็นหลัก ไม่ต้องรวมแถวที่ on schedule
create index if not exists idx_pm_plans_is_overdue
  on pm_plans(is_overdue) where is_overdue = true;

-- ============================================================================
-- Security: RPC ทุกตัวเป็น security definer และอ่านตารางที่เปิด RLS ไว้ (0001/0003/
-- 0007/0008/0009) จึงต้องเพิกถอนสิทธิ์ execute จาก role สาธารณะทั้งหมด เหลือเฉพาะ
-- service_role ที่ backend ใช้ — รูปแบบเดียวกับ 0015_manual_chunks.sql
-- ============================================================================
revoke all on function rpc_downtime_by_machine(date, date, int) from public, anon, authenticated;
revoke all on function rpc_downtime_by_section(date, date) from public, anon, authenticated;
revoke all on function rpc_repeat_failures(int, int) from public, anon, authenticated;
revoke all on function rpc_reorder_risk(int) from public, anon, authenticated;
revoke all on function rpc_telemetry_trend(text, text, int) from public, anon, authenticated;
revoke all on function rpc_cost_rollup_by_machine(date, date) from public, anon, authenticated;

grant execute on function rpc_downtime_by_machine(date, date, int) to service_role;
grant execute on function rpc_downtime_by_section(date, date) to service_role;
grant execute on function rpc_repeat_failures(int, int) to service_role;
grant execute on function rpc_reorder_risk(int) to service_role;
grant execute on function rpc_telemetry_trend(text, text, int) to service_role;
grant execute on function rpc_cost_rollup_by_machine(date, date) to service_role;

-- ============================================================================
-- Security (follow-up, security_invoker): view ทั้ง 5 ตัวข้างบนถูก Supabase security
-- advisor รายงานเป็น ERROR security_definer_view — Postgres สร้าง view โดย default
-- ด้วย security definer semantics (รันด้วยสิทธิ์ owner ของ view ไม่ใช่ผู้เรียก) ทำให้
-- ถ้า anon/authenticated มีสิทธิ์ SELECT อยู่ (Supabase ให้ ALL บน objectใหม่ผ่าน
-- default privileges) จะ "ทะลุ" RLS ของ work_orders/machines/pm_plans ที่เปิดไว้แบบ
-- ไม่มี policy ไปอ่านข้อมูลทั้งหมดได้โดยไม่ต้อง auth เลย — แก้โดยบังคับ
-- security_invoker = true (รันด้วยสิทธิ์ผู้เรียกจริง เคารพ RLS ปกติ) แล้ว revoke
-- สิทธิ์ทั้งหมดจาก public/anon/authenticated เหลือเฉพาะ service_role เหมือน RPC
-- ด้านบน อัน ALTER VIEW ด้านล่างซ้ำกับ WITH (security_invoker = true) ที่ตั้งไว้แล้ว
-- ตอนสร้าง view แต่ละตัว (create or replace view ... with (security_invoker = true))
-- — ใส่ไว้ซ้ำเพื่อความ idempotent/re-runnable แน่นอน 100% แม้ในอนาคตจะมีใคร
-- create or replace view ตัวใดตัวหนึ่งทับโดยไม่ได้ตั้ง option นี้ไว้
-- ============================================================================
alter view mv_machine_failure_intervals set (security_invoker = true);
alter view mv_machine_reliability set (security_invoker = true);
alter view mv_reliability_by_category set (security_invoker = true);
alter view mv_pm_compliance set (security_invoker = true);
alter view v_pm_overdue_list set (security_invoker = true);

revoke all on mv_machine_failure_intervals from public, anon, authenticated;
revoke all on mv_machine_reliability from public, anon, authenticated;
revoke all on mv_reliability_by_category from public, anon, authenticated;
revoke all on mv_pm_compliance from public, anon, authenticated;
revoke all on v_pm_overdue_list from public, anon, authenticated;

grant select on mv_machine_failure_intervals to service_role;
grant select on mv_machine_reliability to service_role;
grant select on mv_reliability_by_category to service_role;
grant select on mv_pm_compliance to service_role;
grant select on v_pm_overdue_list to service_role;
