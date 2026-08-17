-- 0010_alter_spare_parts.sql
-- Extend spare_parts for Inventory_Spare_Items.xlsx / Data_Clean import.

-- Same issue as machines.code: ~7 duplicate Code_Number values exist in real data
-- (8,581 unique of 8,588 rows per the file's own Data_Readiness sheet).
alter table spare_parts drop constraint if exists spare_parts_code_key;
create index if not exists idx_spare_parts_code on spare_parts(code);

alter table spare_parts
  add column if not exists part_number text,                    -- Part_Number_Clean
  add column if not exists has_valid_part_number boolean,       -- Has_Valid_PartNumber YES/NO
  add column if not exists movement_status text,
  add column if not exists aging_bucket text,
  add column if not exists brand text,                          -- Band_Name_Clean (source header is a typo for "Brand")
  add column if not exists group_code text,
  add column if not exists inventory_value numeric(14,4),       -- Inventory_Value, kept for audit vs. stock_quantity*unit_price_thb
  add column if not exists max_inventory int,                   -- Maximum_Inventory
  add column if not exists reorder_point int,
  add column if not exists safety_stock_quantity int,
  add column if not exists safety_lead_time_days numeric(10,2), -- blank stays NULL, never defaulted to 0
  add column if not exists lifecycle_status text,               -- Status_Life_Cycle_Clean
  add column if not exists extra_description text,               -- Original_Description
  add column if not exists area_code text,
  add column if not exists source_modified_date date,           -- Modified
  add column if not exists stock_status_label text,             -- Stock_Status (Excel's own label, NOT the app's `status` enum)
  add column if not exists quality_flags text[];                -- Data_Quality_Flag split on ';'

create index if not exists idx_spare_parts_part_number on spare_parts(part_number);
create index if not exists idx_spare_parts_group_code on spare_parts(group_code);
create index if not exists idx_spare_parts_brand on spare_parts(brand);
