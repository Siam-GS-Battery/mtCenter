-- 0009_alter_machines.sql
-- Extend machines for Machine_Database.xlsx / Machine_Clean import.

-- Real data has non-unique QR codes (Dup_QR_Count column proves this is expected,
-- not a data error) and rows with no QR code at all (Machine_Clean has 3 rows with a
-- blank/sentinel QR code — Excel raw row 837 = "." (a documented sentinel), and raw
-- rows 966/972 = blank). Relax BOTH the existing unique constraint AND the not-null
-- constraint on machines.code; keep a plain index for lookup speed instead.
-- (`drop not null` is naturally idempotent — dropping it again on a column that's
-- already nullable is a no-op, not an error.)
alter table machines drop constraint if exists machines_code_key;
alter table machines alter column code drop not null;
create index if not exists idx_machines_code on machines(code);

alter table machines
  add column if not exists qr_prefix text,
  add column if not exists dup_qr_count int,
  add column if not exists source_no text,             -- No_Clean, original sequence no. from source system
  add column if not exists factory_group text,
  add column if not exists department_code text,       -- Department_Clean
  add column if not exists dept_prefix text,
  add column if not exists section text,                -- Section_Clean
  add column if not exists responsible_group text,
  add column if not exists cost_center text,             -- Cost_Center_Clean
  add column if not exists category text,                -- Category_Clean
  add column if not exists production_name text,         -- Production_Name_Clean
  add column if not exists related_qr_code text,         -- Related_QR_Ref
  add column if not exists lifecycle_status text,        -- Status_Clean (NOT the operational `status` column)
  add column if not exists quality_flags text[],         -- Quality_Flag split on ';'
  add column if not exists info_notes text[];            -- Info_Note split on ';'

create index if not exists idx_machines_factory_group on machines(factory_group);
create index if not exists idx_machines_section on machines(section);
create index if not exists idx_machines_category on machines(category);
