-- 0007_pm_plans.sql
-- New table for PM PLAN (แผนการทำ PM).xlsx / Clean_PM_Plan sheet.
-- No strict FKs on machine_code / ref_work_order_no / spare_id — see the data-import
-- spec (docs/data-import-spec.md, Section 2 design rule): machine codes are not unique,
-- ref work order numbers don't consistently match the WOxxxx format, and spare ids have
-- no clean unique target either. Plain text columns + btree indexes instead.
-- RLS enabled with no policies, matching the existing pattern in 0001_init.sql /
-- 0003_telemetry_readings.sql — the backend only ever talks to Postgres with the
-- service-role key, which bypasses RLS entirely.

create table if not exists pm_plans (
  id text primary key,                         -- Clean_PM_Plan.ID (numeric source, cast to text)
  ref_work_order_no text,                       -- Ref_ID_Work01 — NOT a strict FK, see design rule above
  machine_code text,                            -- QRCODE_Clean, normalized
  machine_base_name text,
  machine_code_in_name text,
  line_location text,
  position_name text,                           -- PositionName_Clean (PositionName_Raw dropped)
  pm_type text,
  pm_type_code text,
  status_th text,                               -- StatusItems_Raw (Thai status label, kept for display)
  status_code text,                              -- Status_EN
  work_type text,                                -- TypeWork
  action text,
  priority text,
  item_description text,                        -- Items_Clean (Items_Raw dropped)
  part_name text,
  part_model text,                              -- Model_Clean
  spare_id text,                                 -- Spare_ID — NOT a strict FK to spare_parts
  qty numeric(14,4),                            -- Qty_Clean (Qty_Raw dropped)
  cost numeric(14,4),
  period_days int,
  plan_date date,
  actual_date date,
  last_pm_date date,
  next_pm_date date,
  remark1 text,
  remark2 text,
  responsible_email text,
  planner text,
  responsible text,
  cdb_before_value numeric(14,4),
  cdb_before_unit text,
  cdb_after_value numeric(14,4),
  cdb_after_unit text,
  plan_year int,
  plan_year_month text,                         -- kept as "YYYY-MM" label text, matches source
  is_overdue boolean,                           -- OVERDUE -> true, ON_SCHEDULE -> false, blank -> null
  quality_flags text[],                         -- Data_Quality_Flag split on ';'
  has_cost boolean,                             -- YES/NO -> true/false
  created_at timestamptz not null default now()
);

create index if not exists idx_pm_plans_machine_code on pm_plans(machine_code);
create index if not exists idx_pm_plans_ref_work_order_no on pm_plans(ref_work_order_no);
create index if not exists idx_pm_plans_spare_id on pm_plans(spare_id);
create index if not exists idx_pm_plans_status_code on pm_plans(status_code);
create index if not exists idx_pm_plans_next_pm_date on pm_plans(next_pm_date);
create index if not exists idx_pm_plans_plan_year_month on pm_plans(plan_year_month);

alter table pm_plans enable row level security;
