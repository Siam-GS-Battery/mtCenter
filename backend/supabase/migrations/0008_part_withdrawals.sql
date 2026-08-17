-- 0008_part_withdrawals.sql
-- New table for ประวัติการเบิกอะไหล่ (SparePart).xlsx / Data_Clean sheet (grain: one row
-- per withdrawal transaction, not one row per part).
-- No strict FK on code_no / machine_code — see docs/data-import-spec.md Section 2 design
-- rule: spare part codes have duplicate values and machine codes are not guaranteed
-- unique/present. Plain text columns + btree indexes instead.
-- RLS enabled with no policies, matching the existing pattern (service-role key bypasses
-- RLS; this is a fail-closed safety net only).

create table if not exists part_withdrawals (
  id text primary key,                          -- Data_Clean.Row_ID (numeric source, cast to text)
  withdraw_date date,                           -- Withdraw_Date
  withdraw_month text,                          -- Withdraw_Month, "YYYY-MM" label, kept as-is
  code_no text,                                 -- CodeNO_Clean — NOT a strict FK, see design rule above
  code_no_raw text,                             -- CodeNO_Raw, kept for audit trail against CODE_CASE_FIXED flag
  part_name text,                               -- Part_Name_Clean
  part_number text,                             -- Part_Number_Clean (raw + QSub/QFix helper cols dropped)
  pack_info text,
  condition_status text,
  movement_status text,
  shelf_number text,                            -- Shelf_Number_Clean
  shelf_type text,
  brand text,                                   -- Brand_Clean
  brand_note text,
  qty numeric(14,4),
  price_per_unit numeric(14,4),
  total_value numeric(14,4),
  group_line_location text,                     -- Group_Line_Location_Clean
  line_location text,                           -- Line_Location_Clean
  factory text,                                 -- Location_List_Clean (values are FACTORY1/2/3)
  machine_code text,                            -- Number_Machine_Clean — NOT a strict FK
  machine_note_raw text,
  machine_code_alt text,                        -- Machine_No_Alt
  process_detail text,
  machine_name text,                            -- Name_Machine_Clean
  user_name text,                                -- User_Name_Clean
  department text,                              -- Department_Clean
  is_aggregate boolean,                         -- TRUE/FALSE text -> boolean
  quality_flags text[],                         -- Quality_Flag split on ';'
  created_at timestamptz not null default now()
);

create index if not exists idx_part_withdrawals_code_no on part_withdrawals(code_no);
create index if not exists idx_part_withdrawals_machine_code on part_withdrawals(machine_code);
create index if not exists idx_part_withdrawals_withdraw_date on part_withdrawals(withdraw_date);
create index if not exists idx_part_withdrawals_part_number on part_withdrawals(part_number);
create index if not exists idx_part_withdrawals_department on part_withdrawals(department);

alter table part_withdrawals enable row level security;
