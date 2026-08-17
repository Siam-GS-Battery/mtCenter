-- 0011_alter_work_orders.sql
-- Extend work_orders + work_order_parts for Machine Repaire History.xlsx / Clean_Data
-- import.

-- QR_Code has 31 blank rows in real data — an FK from work_orders.machine_id to
-- machines(id) would reject those rows. Drop it; keep machine_id as a plain nullable
-- column (unused by imported rows) and add a new plain-text machine_code column with
-- an index instead.
alter table work_orders drop constraint if exists work_orders_machine_id_fkey;
alter table work_orders alter column machine_id drop not null;

alter table work_orders
  add column if not exists machine_code text,           -- QR_Code, normalized — NOT a strict FK
  add column if not exists fy int,
  add column if not exists shift text,
  add column if not exists section_response text,
  add column if not exists line_location text,          -- Line_Location_Clean (Line_Location_Raw dropped)
  add column if not exists machine_name_raw text,
  add column if not exists machine_name_std text,       -- Machine_Name_Std (Machine_Name_Base dropped, intermediate)
  add column if not exists machine_variant text,
  add column if not exists repair_category text,
  add column if not exists damage_source text,
  add column if not exists pd_nickname text,
  add column if not exists technicians text[],          -- Technician_List split on ' | ' (Technician_1..4 individual cols dropped)
  add column if not exists technician_count int,
  add column if not exists cause text,
  add column if not exists repair_action text,          -- Action (renamed to avoid clashing with app's action_plan concept)
  add column if not exists mt_leader_name text,
  add column if not exists finish_datetime timestamptz,
  add column if not exists time_ref_production timestamptz,
  add column if not exists mtloss_min numeric(14,4),
  add column if not exists repair_duration_min numeric(14,4),
  add column if not exists mtloss_diff_min numeric(14,4),
  add column if not exists data_quality_flags text[];   -- Data_Quality_Flag split on ';'

create index if not exists idx_work_orders_machine_code on work_orders(machine_code);
create index if not exists idx_work_orders_fy on work_orders(fy);
create index if not exists idx_work_orders_finish_datetime on work_orders(finish_datetime);

-- work_order_parts: Part1/Part2 columns from Clean_Data become individual child rows
-- here instead of denormalized part1_*/part2_* columns on work_orders — this table
-- already exists for exactly this purpose.
alter table work_order_parts
  add column if not exists part_position text,          -- Part1_Position / Part2_Position
  add column if not exists part_model_raw text,          -- Part1_Model_Raw / Part2_Model_Raw, audit trail
  add column if not exists source text default 'manual'; -- 'manual' | 'import', mirrors telemetry_readings.source pattern
