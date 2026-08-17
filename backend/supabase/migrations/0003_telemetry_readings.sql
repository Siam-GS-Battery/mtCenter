-- 0003_telemetry_readings.sql
-- ตาราง telemetry_readings เก็บข้อมูล time-series ของเซนเซอร์เครื่องจักร
-- (spindle_temp, vibration_mms, health_score) เพื่อใช้แสดงกราฟแนวโน้ม (trend chart)
-- บน dashboard. Row Level Security เปิดใช้งานแบบไม่มี policy ใด ๆ
-- ตามรูปแบบเดียวกับตารางอื่นใน 0001_init.sql เนื่องจาก backend เข้าถึงฐานข้อมูล
-- ด้วย service-role key เท่านั้น (bypass RLS) การเปิด RLS ไว้เป็นเพียงมาตรการ
-- fail-closed หากมีการใช้ key อื่น (เช่น anon key) โดยไม่ได้ตั้งใจ
--
-- หมายเหตุ: machines.id ในสคีมาปัจจุบัน (0001_init.sql) เป็นชนิด `text`
-- (ไม่ใช่ uuid) ดังนั้น machine_id ในตารางนี้จึงต้องเป็น `text` เช่นกัน
-- เพื่อให้ foreign key อ้างอิงได้ถูกต้อง

create table if not exists telemetry_readings (
  id text primary key default gen_random_uuid()::text,
  machine_id text not null references machines(id) on delete cascade,
  metric text not null check (metric in ('spindle_temp', 'vibration_mms', 'health_score')),
  value numeric not null,
  source text not null default 'manual' check (source in ('iot', 'manual', 'seed')),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_telemetry_readings_trend
  on telemetry_readings(machine_id, metric, recorded_at desc);

alter table telemetry_readings enable row level security;
