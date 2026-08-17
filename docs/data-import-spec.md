# mtCenter — Excel → Supabase Data Import Spec

Status: DRAFT for team execution. This is the single source of truth for the 4 teammates
working in parallel on this import. Do not diverge from the column names, types, or table
names below without flagging it back — everyone else is building against this document,
not against each other's code.

Project context (already confirmed, do not re-derive):
- Backend: Express + TypeScript (ESM) + Supabase (Postgres), `@supabase/supabase-js`
  query builder directly, no ORM.
- Entry `backend/src/index.ts`, config `backend/src/config.ts`, client
  `backend/src/lib/supabase.ts`, row mappers (snake_case DB ↔ camelCase API)
  `backend/src/lib/mappers.ts`.
- Migrations so far: `backend/supabase/migrations/0001_init.sql` (profiles, machines,
  work_orders, work_order_parts, spare_parts, manuals), `0002_seed.sql` (mock seed — being
  wiped), `0003_telemetry_readings.sql`, `0004_seed_telemetry.sql` (mock seed — being
  wiped), `0005_manual_files.sql` (adds `manuals.file_path` + storage bucket).
- Routes today: `/api/health`, `/api/users`, `/api/machines`, `/api/work-orders`,
  `/api/spare-parts`, `/api/manuals`, `/api/ai`. Success responses are always
  `{ success: true, data: ... }` via `sendSuccess()` in
  `backend/src/middleware/errorHandler.ts` (except `/api/ai`). Errors are
  `{ success: false, error: { message } }`.
- Frontend: React 19 + Vite + TS. `frontend/src/services/apiService.ts` calls the backend.
  Mock data lives at `frontend/src/data/mockData.ts` (being replaced by real data, but the
  mock **file** itself is not required to be deleted as part of this spec — only the DB
  seed rows 0002/0004 are being wiped).
- Confirmed decisions: wipe all existing seed data (0002 + 0004) except `profiles` (kept,
  because Excel has no user/employee data); import all 5 Excel files; Supabase credentials
  already set in `backend/.env`.

Source Excel files live in `backend/data/`:
1. `Machine_Database.xlsx`
2. `Machine Repaire History.xlsx`
3. `Inventory_Spare_Items.xlsx`
4. `ประวัติการเบิกอะไหล่ (SparePart).xlsx`
5. `PM PLAN (แผนการทำ PM).xlsx`

All 5 workbooks share the same internal shape: one **raw** sheet (mirrors an original
SharePoint list export, has `Item Type`/`Path` columns), one **`*Clean*`** sheet (formula-
derived row-by-row from the raw sheet, has more columns, standardized codes, a
`Search_Text` embedding field, and a `Data_Quality_Flag`/`Quality_Flag` column), a
`Data_Readiness` sheet (Thai/English QA narrative — its stated column count describes the
**raw** sheet, not the Clean sheet, don't use it for schema sizing), and a `Cleaning_Rules`
sheet (lookup tables the Clean sheet's formulas depend on). **Always import from the
`*Clean*` sheet, never the raw sheet** — the raw sheet is pre-cleaning and has known
formatting inconsistencies (see Section 4).

Important fragility to be aware of (does not block this import, but explains why we don't
build strict FKs on these codes — see Section 2): every Clean sheet's formulas reference
the raw sheet **row-for-row** (row 2 ↔ row 2, etc.). If someone edits the raw sheet later
without dragging formulas down, the Clean sheet silently desyncs. Treat the current
snapshot of each `.xlsx` file as the thing being imported "as of now" — this is a one-time
batch import, not a live sync.

---

## Section 1 — Source of truth

| # | File | Sheet to import from | Expected data rows (excl. header) | Row key |
|---|---|---|---|---|
| 1 | `Machine_Database.xlsx` | `Machine_Clean` | 973 | `Row_Key` (text, format `QRCODE#seq`, e.g. `AS-955#0001`) — guaranteed unique. **`QR_Code_Clean` is NOT unique** (see `Dup_QR_Count` column; also blank for the sentinel row `NO_QR#0971`). |
| 2 | `Machine Repaire History.xlsx` | `Clean_Data` | 8,589 | `Work_Order_No` (text, e.g. `WO1000`) — confirmed 100% unique per the file's own `Data_Readiness` sheet. Use as primary key. |
| 3 | `Inventory_Spare_Items.xlsx` | `Data_Clean` | 8,588 | `ID` (numeric, cast to text) — confirmed 100% unique, primary key. `Code_Number` (e.g. `MTEE-0001`) is the **business** spare-part code but has ~7 duplicate values (8,581 unique of 8,588 rows per Data_Readiness) — do not make it a DB-unique/PK column. |
| 4 | `ประวัติการเบิกอะไหล่ (SparePart).xlsx` | `Data_Clean` | 9,764 | `Row_ID` (numeric, cast to text) — one row per withdrawal transaction, unique. `CodeNO_Clean` intentionally repeats (2,088 distinct values across 9,764 rows) — grain is "1 row = 1 withdrawal", not "1 row per part". |
| 5 | `PM PLAN (แผนการทำ PM).xlsx` | `Clean_PM_Plan` | 2,820 | `ID` (numeric, cast to text) — confirmed 100% unique, primary key. `QRCODE_Clean` repeats by design (a machine has many PM plan line items). |

Sheet column counts confirmed by direct inspection (this is what Section 3 maps in full):
`Machine_Clean` = 25 cols, `Clean_Data` (repair history) = 49 cols, `Data_Clean`
(inventory) = 29 cols, `Data_Clean` (withdrawal history) = 34 cols, `Clean_PM_Plan` = 43
cols.

---

## Section 2 — Target schema (DDL)

### Design rule (applies to everything below)

**No strict foreign keys between the machine-code / spare-part-code text fields.** Reasons,
confirmed from the data:
- Repair history has 31 rows with a **blank** `QR_Code` — an FK to `machines` would reject
  those rows outright.
- Machine codes are **not unique** in `Machine_Database` itself (`Dup_QR_Count` column
  documents intentional duplicates) — can't be an FK target anyway without first fixing the
  source data, which is out of scope for this import.
- `PM PLAN.Ref_ID_Work01` does not consistently follow the `WOxxxx` format used by
  `work_orders.id`/`code` — an FK there would reject valid rows too.
- Spare part `Code_Number` also has ~7 duplicate values (Section 1) — same problem if used
  as an FK target.

Instead: store these as plain `text` columns and add a plain (non-unique) **btree index**
for lookup performance. Application code does the "join" at query time; do not add a
`references` clause on any of: `machines.code`, `spare_parts.code`, `work_orders.id`,
`pm_plans.machine_code`, `pm_plans.ref_work_order_no`, `pm_plans.spare_id`,
`part_withdrawals.code_no`, `part_withdrawals.machine_code`.

This also means the **existing** `machines.code` unique constraint and `spare_parts.code`
unique constraint must be relaxed (they were fine for hand-entered mock data, but the real
data has legitimate duplicates). See the `ALTER TABLE` blocks below — both constraints are
dropped and replaced with plain indexes.

Every new table gets `ENABLE ROW LEVEL SECURITY` with **no policies**, matching the
existing pattern in `0001_init.sql` and `0003_telemetry_readings.sql`: the backend only
ever talks to Postgres with the Supabase **service-role key**, which bypasses RLS entirely.
Enabling RLS with zero policies is a fail-closed safety net in case an anon/public key is
ever used against this database by mistake — it is not meant to do any real access control
by itself.

Put all of the SQL below into new migration files, in this order (see Section 6 for full
import ordering):

- `0006_wipe_seed.sql`
- `0007_pm_plans.sql`
- `0008_part_withdrawals.sql`
- `0009_alter_machines.sql`
- `0010_alter_spare_parts.sql`
- `0011_alter_work_orders.sql`

(Numbers are suggestions — coordinate with whoever grabs the next free migration number
first, to avoid two teammates both writing `0006_...`.)

#### `0006_wipe_seed.sql`

```sql
-- Wipe all mock seed data. profiles is intentionally NOT truncated — Excel has no
-- user/employee data, so the existing user records are the only real data we have
-- for that table and must be preserved.
truncate table telemetry_readings restart identity cascade;
truncate table work_order_parts restart identity cascade;
truncate table work_orders restart identity cascade;
truncate table spare_parts restart identity cascade;
truncate table machines restart identity cascade;
truncate table manuals restart identity cascade;
-- profiles: left untouched on purpose.
```

#### `0007_pm_plans.sql` — new table, from `PM PLAN (แผนการทำ PM).xlsx` / `Clean_PM_Plan`

```sql
create table if not exists pm_plans (
  id text primary key,                         -- Clean_PM_Plan.ID (numeric source, cast to text)
  ref_work_order_no text,                       -- Ref_ID_Work01 — NOT a strict FK, see Section 2 design rule
  machine_code text,                            -- QRCODE_Clean, normalized (see Section 4)
  machine_base_name text,
  machine_code_in_name text,
  line_location text,
  position_name text,                           -- PositionName_Clean (PositionName_Raw dropped, see Section 3)
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
```

Note: source columns `PlanMonth` and `ActualMonth` are named "month" but contain full
dates (e.g. `9/2/25`) in every sample row inspected — mapped to `plan_date`/`actual_date`
(DATE), not to a year-month type. If a future export shows them actually truncated to
month-only, revisit.

#### `0008_part_withdrawals.sql` — new table, from `ประวัติการเบิกอะไหล่ (SparePart).xlsx` / `Data_Clean`

```sql
create table if not exists part_withdrawals (
  id text primary key,                          -- Data_Clean.Row_ID (numeric source, cast to text)
  withdraw_date date,                           -- Withdraw_Date
  withdraw_month text,                          -- Withdraw_Month, "YYYY-MM" label, kept as-is
  code_no text,                                 -- CodeNO_Clean — NOT a strict FK, see Section 2 design rule
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
```

#### `0009_alter_machines.sql` — from `Machine_Database.xlsx` / `Machine_Clean`

```sql
-- Real data has non-unique QR codes (Dup_QR_Count column proves this is expected,
-- not a data error) and rows with no QR code at all. Relax the existing unique
-- constraint on machines.code; keep a plain index for lookup speed instead.
alter table machines drop constraint if exists machines_code_key;
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
  add column if not exists lifecycle_status text,        -- Status_Clean (NOT the operational `status` column, see Section 4)
  add column if not exists quality_flags text[],         -- Quality_Flag split on ';'
  add column if not exists info_notes text[];            -- Info_Note split on ';'

create index if not exists idx_machines_factory_group on machines(factory_group);
create index if not exists idx_machines_section on machines(section);
create index if not exists idx_machines_category on machines(category);
```

**`id` for imported machine rows: use `Row_Key`** (e.g. `AS-955#0001`), not `QR_Code_Clean`
— it's the only guaranteed-unique key in this sheet. The existing operational `status`
column (`normal`/`warning`/`error`/`maintenance`, CHECK-constrained) is **not** populated
from Excel — Excel's `Status_Clean` is a record-lifecycle flag (only ever `NEW` or
`NOT_SPECIFIED` in the observed data, both of which are sentinel values that normalize to
NULL per Section 4), unrelated to live operating condition. Leave `status` at its table
default (`'normal'`) for imported rows; it's meant to be updated later by the
telemetry/PATCH flow, not by this one-time import.

#### `0010_alter_spare_parts.sql` — from `Inventory_Spare_Items.xlsx` / `Data_Clean`

```sql
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
  add column if not exists safety_lead_time_days numeric(10,2), -- blank stays NULL, never defaulted to 0 (see Section 4)
  add column if not exists lifecycle_status text,               -- Status_Life_Cycle_Clean
  add column if not exists extra_description text,               -- Original_Description
  add column if not exists area_code text,
  add column if not exists source_modified_date date,           -- Modified
  add column if not exists stock_status_label text,             -- Stock_Status (Excel's own label, NOT the app's `status` enum, see Section 4)
  add column if not exists quality_flags text[];                -- Data_Quality_Flag split on ';'

create index if not exists idx_spare_parts_part_number on spare_parts(part_number);
create index if not exists idx_spare_parts_group_code on spare_parts(group_code);
create index if not exists idx_spare_parts_brand on spare_parts(brand);
```

`min_threshold` (existing column) is populated from `Reorder_Point` on import — it's the
closest semantic match to "trigger low-stock at this quantity", and it's what
`computeStatus()` in `backend/src/routes/spareParts.ts` already uses to derive the app's
`status` enum (`in_stock`/`low_stock`/`out_of_stock`). **Run `computeStatus(stock_quantity,
min_threshold)` for every imported row and store the result in `status`** — do not import
Excel's own `Stock_Status` value into that column, its categories don't match
(`NORMAL`/`ABOVE MAX`/`OUT OF STOCK` vs. the app's 3-state enum); it's preserved separately
in the new `stock_status_label` column for reference only.

`compatible_machines` (existing `text[]`) and `unit` (existing) have **no source column**
in this sheet — leave them NULL/empty on import, not a data-loss bug.

#### `0011_alter_work_orders.sql` — from `Machine Repaire History.xlsx` / `Clean_Data`

```sql
-- QR_Code has 31 blank rows in real data — an FK from work_orders.machine_id to
-- machines(id) would reject those rows. Drop it; keep machine_id as a plain nullable
-- column (unused by imported rows — see below) and add a new plain-text machine_code
-- column with an index instead.
alter table work_orders drop constraint if exists work_orders_machine_id_fkey;
alter table work_orders alter column machine_id drop not null;

alter table work_orders
  add column if not exists machine_code text,           -- QR_Code, normalized (see Section 4) — NOT a strict FK
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
```

`id`/`code` for imported work orders: use `Work_Order_No` directly for both (it's already
unique, and `code` is already the column the rest of the app displays). `title` has no
direct Excel equivalent — set `title = Symptom` (truncate/store in full; `description`
column already exists for longer text, see Section 3). `status` (existing
pending/in_progress/review/completed enum) is derived: `'completed'` if `Finish_DateTime`
is non-blank, else `'pending'` — **flagged as an assumption for lead sign-off**, see
Section 7. `priority` (existing high/medium/low enum) is derived from `Urgency` — see the
mapping table in Section 4/7; also flagged for sign-off since it's a business judgment call,
not a mechanical transform.

---

## Section 3 — Column mapping tables (verbatim, every column, all 5 sheets)

Legend for the **Transform** column: `direct` = copy as-is (after whitespace trim);
`parse-date` / `parse-datetime` = see Section 4 date rule; `split-;` = split on `"; "` into
`text[]`; `split-pipe` = split on `" | "` into `text[]`; `sentinel-null` = apply the
sentinel→NULL table in Section 4 first, then copy; `yesno-bool` = `YES→true`/`NO→false`;
`truefalse-bool` = `TRUE→true`/`FALSE→false`; `code-normalize` = trim + collapse spaces
around `-` + uppercase (Section 4); `round-numeric` = cast to `numeric(14,4)`, rounding
away long float artifacts like `61866.66667`.

### 3.1 `Machine_Database.xlsx` → `Machine_Clean` (25 columns) → `machines`

| Excel column (verbatim) | DB column | Postgres type | Transform |
|---|---|---|---|
| `Row_Key` | `id` | `text` | direct (this is the import PK) |
| `QR_Code_Clean` | `code` | `text` | code-normalize |
| `QR_Code_Raw` | — | — | **not imported** — identical to `QR_Code_Clean` in every sampled row; pre-cleaning artifact only |
| `QR_Prefix` | `qr_prefix` | `text` | direct |
| `Dup_QR_Count` | `dup_qr_count` | `int` | direct (cast to int; blank → NULL) |
| `No_Clean` | `source_no` | `text` | direct |
| `Location_Clean` | `location` | `text` | sentinel-null |
| `Location_Raw` | — | — | **not imported** — identical to `Location_Clean` in every sampled row |
| `Factory_Group` | `factory_group` | `text` | sentinel-null |
| `Department_Clean` | `department_code` | `text` | sentinel-null |
| `Department_Raw` | — | — | **not imported** — identical to `Department_Clean` in every sampled row |
| `Dept_Prefix` | `dept_prefix` | `text` | direct |
| `Section_Clean` | `section` | `text` | sentinel-null |
| `Section_Source` | — | — | **not imported** — internal cleaning-audit flag (`SOURCE`/`DERIVED`) describing how `Section_Clean` was computed; no business value once merged |
| `Responsible_Group` | `responsible_group` | `text` | sentinel-null |
| `Cost_Center_Clean` | `cost_center` | `text` | sentinel-null |
| `Category_Clean` | `category` | `text` | sentinel-null |
| `Machine_Desc_Clean` | `name` | `text` | direct |
| `Machine_Desc_Raw` | — | — | **not imported** — case-only difference from `Machine_Desc_Clean` |
| `Production_Name_Clean` | `production_name` | `text` | direct (NOT mapped to existing `model` column — semantically different, see note below) |
| `Related_QR_Ref` | `related_qr_code` | `text` | code-normalize |
| `Status_Clean` | `lifecycle_status` | `text` | sentinel-null (only `NEW`/`NOT_SPECIFIED` observed — both are sentinels, so this column will be all-NULL for this dataset; kept for future non-sentinel values) |
| `Search_Text` | — | — | **not imported** — embedding/concat helper text, fully reconstructable from the other columns, not needed in relational storage |
| `Quality_Flag` | `quality_flags` | `text[]` | split-; |
| `Info_Note` | `info_notes` | `text[]` | split-; |

Existing `machines` columns with **no Excel source** (leave at table default / NULL on
import, not a bug): `model` (no true model-number data exists in Excel — do not conflate
with `production_name`, which is a production-line name, not an equipment model),
`last_maintenance`, `next_maintenance`, `health_score`, `spindle_temp`, `vibration_mms`,
`operating_hours`, `qr_code_url`, `image_url`, `active_error_code`, `active_error_desc`,
`status` (see Section 2 note).

### 3.2 `Machine Repaire History.xlsx` → `Clean_Data` (49 columns) → `work_orders` + `work_order_parts`

| Excel column (verbatim) | DB column | Postgres type | Transform |
|---|---|---|---|
| `Work_Order_No` | `work_orders.id`, `work_orders.code` | `text` | direct (import PK, also existing unique `code`) |
| `Report_DateTime` | `work_orders.assigned_date` | `text` (existing column type, unchanged) | parse-date → store as ISO `YYYY-MM-DD` string (see Section 4 — existing text-typed date columns keep their `text` type, just get a normalized string) |
| `FY` | `fy` | `int` | direct |
| `Shift` | `shift` | `text` | direct |
| `Section_Response` | `section_response` | `text` | direct |
| `Line_Location_Raw` | — | — | **not imported** — pre-cleaning duplicate of `Line_Location_Clean` |
| `Line_Location_Clean` | `line_location` | `text` | direct |
| `QR_Code` | `machine_code` | `text` | code-normalize; blank stays blank (31 rows have no QR code — expected, not an error) |
| `Machine_Name_Raw` | `machine_name_raw` | `text` | direct |
| `Machine_Name_Base` | — | — | **not imported** — intermediate cleaning step between raw and `Machine_Name_Std`, superseded by the latter |
| `Machine_Name_Std` | `machine_name_std` | `text` | direct |
| `Machine_Variant` | `machine_variant` | `text` | direct |
| `Repair_Category` | `repair_category` | `text` | direct |
| `Damage_Source` | `damage_source` | `text` | direct |
| `Work_Type` | (feeds `priority` derivation) | — | see Section 4/7 — Thai free text (`ไม่ระบุ`, `งานซ่อมทั่วไป`, `ซ่อมตามการวางแผน`), not stored verbatim as its own column, folded into the derived `priority` |
| `Urgency` | (feeds `priority` derivation) | — | see Section 4/7 |
| `Reporter_Name` | `requested_by` (existing column) | `text` | direct |
| `PD_Responsible_Name` | `engineer_reviewer` (existing column) | `text` | direct |
| `PD_Nickname` | `pd_nickname` | `text` | direct |
| `Technician_1` | `technician_name` (existing column), also folded into `technicians` | `text` | direct |
| `Technician_2` | folded into `technicians` | — | see `Technician_List` row below |
| `Technician_3` | folded into `technicians` | — | see `Technician_List` row below |
| `Technician_4` | folded into `technicians` | — | see `Technician_List` row below |
| `Technician_Count` | `technician_count` | `int` | direct |
| `Technician_List` | `technicians` | `text[]` | split-pipe (supersedes storing `Technician_1..4` as separate columns) |
| `Symptom` | `title` (existing), `description` (existing) | `text` | direct — `title` and `description` both get `Symptom` (no separate short-title field exists in Excel; see Section 7 for why this is flagged) |
| `Cause` | `cause` | `text` | direct |
| `Action` | `repair_action` | `text` | direct |
| `MT_Leader_Name` | `mt_leader_name` | `text` | direct |
| `Finish_DateTime` | `finish_datetime`, also feeds `due_date` (existing, `text` type) | `timestamptz` / `text` | parse-datetime; `due_date` gets the same value as an ISO `YYYY-MM-DD` string (see Section 7 — repurposing `due_date` as "date actually fixed" for historical rows is an assumption) |
| `TimeRef_Production` | `time_ref_production` | `timestamptz` | parse-datetime |
| `MTLoss_Min` | `mtloss_min` | `numeric(14,4)` | round-numeric |
| `Repair_Duration_Min` | `repair_duration_min` | `numeric(14,4)` | round-numeric |
| `MTLoss_Diff_Min` | `mtloss_diff_min` | `numeric(14,4)` | round-numeric |
| `Part1_Position` | `work_order_parts.part_position` (row 1) | `text` | direct |
| `Part1_Name` | `work_order_parts.part_name` (row 1) | `text` | direct |
| `Part1_Model_Raw` | `work_order_parts.part_model_raw` (row 1) | `text` | direct |
| `Part1_Status` | `work_order_parts.status` (row 1, existing column) | `text` | direct |
| `Part1_Model_Clean` | `work_order_parts.part_code` (row 1, existing column) | `text` | direct |
| `Part1_Qty` | `work_order_parts.quantity` (row 1, existing column) | `int` | direct; blank/0 → `0` (existing column is `not null default 1`, this import writes `0` explicitly when source says 0, not the column default) |
| `Part2_Position` | `work_order_parts.part_position` (row 2) | `text` | direct |
| `Part2_Name` | `work_order_parts.part_name` (row 2) | `text` | direct |
| `Part2_Model_Raw` | `work_order_parts.part_model_raw` (row 2) | `text` | direct |
| `Part2_Status` | `work_order_parts.status` (row 2) | `text` | direct |
| `Part2_Model_Clean` | `work_order_parts.part_code` (row 2) | `text` | direct |
| `Part2_Qty` | `work_order_parts.quantity` (row 2) | `int` | direct |
| `Parts_Count` | — | — | **not imported** — derivable as `count(*)` of that work order's `work_order_parts` rows, don't duplicate |
| `Search_Text` | — | — | **not imported** — embedding/concat helper, reconstructable |
| `Data_Quality_Flag` | `data_quality_flags` | `text[]` | split-; |

Rule for `work_order_parts`: only create a Part-1 row if `Part1_Name` (or `Part1_Model_Clean`)
is non-blank; only create a Part-2 row if `Part2_Name`/`Part2_Model_Clean` is non-blank. A
repair with no parts used produces zero `work_order_parts` rows. `work_order_parts.part_id`
and `.source` (new): `part_id` stays NULL (no direct link to `spare_parts.id` exists in this
sheet), `.source = 'import'`.

Existing `work_orders` columns with **no Excel source**: `steps_completed`, `total_steps`,
`ai_verification_score`, `action_plan`, `parts_requested`, `solution_steps`,
`ai_verification_score`, `estimated_hours`, `assigned_to` (all left NULL — this repair-log
data has no step-tracking workflow, it's a flat historical record).

### 3.3 `Inventory_Spare_Items.xlsx` → `Data_Clean` (29 columns) → `spare_parts`

| Excel column (verbatim) | DB column | Postgres type | Transform |
|---|---|---|---|
| `ID` | `id` | `text` | direct (cast numeric → text; import PK) |
| `Code_Number` | `code` | `text` | direct (uppercase not applied — these are already consistently formatted `MTxx-####`) |
| `Part_Number_Raw` | — | — | **not imported** — pre-cleaning duplicate of `Part_Number_Clean` |
| `Part_Number_Clean` | `part_number` | `text` | direct |
| `Has_Valid_PartNumber` | `has_valid_part_number` | `boolean` | yesno-bool |
| `Movement_Status` | `movement_status` | `text` | sentinel-null (e.g. `NOT FLAGGED` → NULL) |
| `Aging_Bucket` | `aging_bucket` | `text` | sentinel-null (`UNKNOWN` → NULL) |
| `Part_Name` | `name` | `text` | direct |
| `Band_Name_Raw` | — | — | **not imported** — duplicate of `Band_Name_Clean` (source header "Band" is a typo for "Brand") |
| `Band_Name_Clean` | `brand` | `text` | direct |
| `Group_Code` | `group_code` | `text` | direct |
| `Product_Group_Code` | `category` (existing column) | `text` | direct |
| `Shelf_Number` | `location_rack` (existing column) | `text` | direct |
| `Inventory` | `stock_quantity` (existing column) | `int` | direct |
| `Unit_Cost` | `unit_price_thb` (existing column) | `numeric(14,4)` | round-numeric (fixes float artifacts like `61866.66667`) |
| `Inventory_Value` | `inventory_value` | `numeric(14,4)` | round-numeric — kept for audit; should equal `stock_quantity * unit_price_thb` |
| `Maximum_Inventory` | `max_inventory` | `int` | direct |
| `Reorder_Point` | `reorder_point`, also `min_threshold` (existing column) | `int` | direct; **also copied into `min_threshold`**, see note below |
| `Safety_Stock_Quantity` | `safety_stock_quantity` | `int` | direct |
| `Safety_Lead_Time_Days` | `safety_lead_time_days` | `numeric(10,2)` | direct; blank stays NULL, never defaulted to 0 |
| `Status_Life_Cycle_Clean` | `lifecycle_status` | `text` | sentinel-null (`UNKNOWN`, `Discountinued`/`Discontinued` typo variants — normalize both spellings to `Discontinued`) |
| `Search_Description` | — | — | **not imported** — blank in the overwhelming majority of rows, embedding helper |
| `Original_Description` | `extra_description` | `text` | direct |
| `AAT_Raw` | — | — | **not imported** — pre-cleaning aging annotation, fully superseded by `Aging_Bucket` |
| `Area_Code` | `area_code` | `text` | direct |
| `Modified` | `source_modified_date` | `date` | parse-date |
| `Search_Text` | — | — | **not imported** — embedding/concat helper |
| `Stock_Status` | `stock_status_label` | `text` | direct — **do not** write this into the existing `status` column, see note below |
| `Data_Quality_Flag` | `quality_flags` | `text[]` | split-; |

Notes:
- `min_threshold` (existing column, used by `computeStatus()` in
  `backend/src/routes/spareParts.ts`) is set to `Reorder_Point`'s value at import time.
  After all rows are inserted, **recompute `status` for every row using the existing
  `computeStatus(stock_quantity, min_threshold)` logic** — do not import Excel's own
  `Stock_Status` (`NORMAL`/`ABOVE MAX`/`OUT OF STOCK`) into the app's `status`
  (`in_stock`/`low_stock`/`out_of_stock`) column; the category sets don't line up
  (`ABOVE MAX` has no equivalent in the app enum). Excel's label is preserved separately
  as `stock_status_label` for reference/audit only.
- Existing columns with no Excel source: `compatible_machines`, `unit`, `image_url` — left
  NULL/empty on import.

### 3.4 `ประวัติการเบิกอะไหล่ (SparePart).xlsx` → `Data_Clean` (34 columns) → `part_withdrawals`

| Excel column (verbatim) | DB column | Postgres type | Transform |
|---|---|---|---|
| `Row_ID` | `id` | `text` | direct (cast numeric → text; import PK) |
| `Withdraw_DateTime` | — | — | **not imported** — identical to `Withdraw_Date` in every sampled row (both `6/26/26`); no additional time-of-day precision observed in the source |
| `Withdraw_Date` | `withdraw_date` | `date` | parse-date |
| `Withdraw_Month` | `withdraw_month` | `text` | direct (kept as `"YYYY-MM"` label, e.g. `2026-06`) |
| `CodeNO_Raw` | `code_no_raw` | `text` | direct — kept for audit trail (Cleaning_Rules tracks `CODE_CASE_FIXED` on 335 rows) |
| `CodeNO_Clean` | `code_no` | `text` | direct |
| `Part_Name_Clean` | `part_name` | `text` | direct |
| `Part_Number_Raw` | — | — | **not imported** — pre-cleaning, superseded by `Part_Number_Clean` |
| `Part_Number_Clean` | `part_number` | `text` | direct |
| `Pack_Info` | `pack_info` | `text` | sentinel-null |
| `Condition_Status` | `condition_status` | `text` | sentinel-null |
| `Movement_Status` | `movement_status` | `text` | sentinel-null |
| `Shelf_Number_Clean` | `shelf_number` | `text` | direct |
| `Shelf_Type` | `shelf_type` | `text` | direct |
| `Brand_Clean` | `brand` | `text` | sentinel-null (also treat literal `'-'` as NULL here — seen in sample data, e.g. brand `'-`) |
| `Qty` | `qty` | `numeric(14,4)` | round-numeric |
| `Price_Per_Unit` | `price_per_unit` | `numeric(14,4)` | round-numeric; blank stays NULL (do not default to 0 — `MISSING_PRICE` is a tracked quality flag, defaulting would hide it) |
| `Total_Value` | `total_value` | `numeric(14,4)` | round-numeric; blank stays NULL |
| `Group_Line_Location_Clean` | `group_line_location` | `text` | direct |
| `Line_Location_Clean` | `line_location` | `text` | direct |
| `Location_List_Clean` | `factory` | `text` | direct |
| `Number_Machine_Clean` | `machine_code` | `text` | code-normalize |
| `Machine_Note_Raw` | `machine_note_raw` | `text` | direct |
| `Machine_No_Alt` | `machine_code_alt` | `text` | code-normalize |
| `Process_Detail` | `process_detail` | `text` | direct |
| `Name_Machine_Clean` | `machine_name` | `text` | direct |
| `User_Name_Clean` | `user_name` | `text` | direct |
| `Department_Clean` | `department` | `text` | direct |
| `Is_Aggregate` | `is_aggregate` | `boolean` | truefalse-bool |
| `Search_Text` | — | — | **not imported** — embedding/concat helper |
| `Quality_Flag` | `quality_flags` | `text[]` | split-; |
| `Brand_Note` | `brand_note` | `text` | direct |
| `Part_Number_QSub` | — | — | **not imported** — intermediate CSV-quote-fix helper column, already folded into `Part_Number_Clean` |
| `Part_Number_QFix` | — | — | **not imported** — same reason as `Part_Number_QSub` |

### 3.5 `PM PLAN (แผนการทำ PM).xlsx` → `Clean_PM_Plan` (43 columns) → `pm_plans`

| Excel column (verbatim) | DB column | Postgres type | Transform |
|---|---|---|---|
| `ID` | `id` | `text` | direct (cast numeric → text; import PK) |
| `Ref_ID_Work01` | `ref_work_order_no` | `text` | direct (kept even though format doesn't consistently match `WOxxxx` — informational only, not a strict FK) |
| `QRCODE_Clean` | `machine_code` | `text` | code-normalize |
| `Machine_Base_Name` | `machine_base_name` | `text` | direct |
| `Machine_Code_In_Name` | `machine_code_in_name` | `text` | direct |
| `LineLocation_Clean` | `line_location` | `text` | direct |
| `PositionName_Raw` | — | — | **not imported** — pre-cleaning duplicate of `PositionName_Clean` |
| `PositionName_Clean` | `position_name` | `text` | direct |
| `PM_Type` | `pm_type` | `text` | direct |
| `PM_Type_Code` | `pm_type_code` | `text` | direct |
| `StatusItems_Raw` | `status_th` | `text` | direct (Thai label, kept for UI display) |
| `Status_EN` | `status_code` | `text` | direct |
| `TypeWork` | `work_type` | `text` | direct |
| `Action` | `action` | `text` | direct |
| `Priority` | `priority` | `text` | direct |
| `Items_Raw` | — | — | **not imported** — pre-cleaning duplicate of `Items_Clean` |
| `Items_Clean` | `item_description` | `text` | direct |
| `PartName_Clean` | `part_name` | `text` | direct |
| `Model_Clean` | `part_model` | `text` | direct |
| `Spare_ID` | `spare_id` | `text` | direct (NOT a strict FK, see Section 2) |
| `Qty_Raw` | — | — | **not imported** — pre-cleaning duplicate of `Qty_Clean` |
| `Qty_Clean` | `qty` | `numeric(14,4)` | round-numeric |
| `Cost` | `cost` | `numeric(14,4)` | round-numeric; blank stays NULL |
| `PeriodDay` | `period_days` | `int` | direct |
| `PlanMonth` | `plan_date` | `date` | parse-date (see Section 2 note — this "month" column contains full dates) |
| `ActualMonth` | `actual_date` | `date` | parse-date |
| `LastPMDate` | `last_pm_date` | `date` | parse-date |
| `NextPMDate` | `next_pm_date` | `date` | parse-date |
| `Remark1_Clean` | `remark1` | `text` | direct |
| `Remark2_Clean` | `remark2` | `text` | direct |
| `Responsible_Email` | `responsible_email` | `text` | direct |
| `Planner` | `planner` | `text` | direct |
| `Responsible` | `responsible` | `text` | direct |
| `CdB_Before_Value` | `cdb_before_value` | `numeric(14,4)` | round-numeric; blank stays NULL |
| `CdB_Before_Unit` | `cdb_before_unit` | `text` | direct |
| `CdB_After_Value` | `cdb_after_value` | `numeric(14,4)` | round-numeric; blank stays NULL |
| `CdB_After_Unit` | `cdb_after_unit` | `text` | direct |
| `Plan_Year` | `plan_year` | `int` | direct |
| `Plan_Year_Month` | `plan_year_month` | `text` | direct (kept as `"YYYY-MM"` label) |
| `Is_Overdue` | `is_overdue` | `boolean` | `OVERDUE` → `true`, `ON_SCHEDULE` → `false`, blank → `NULL` |
| `Search_Text` | — | — | **not imported** — embedding/concat helper |
| `Data_Quality_Flag` | `quality_flags` | `text[]` | split-; |
| `Has_Cost` | `has_cost` | `boolean` | yesno-bool |

---

## Section 4 — Normalization rules (implement exactly this way)

**Dates.** All source date/datetime values are **text**, in `M/D/YY` or `M/D/YYYY` format
(no zero-padding, e.g. `8/24/23`, `1/14/25`, `9/2/25`). Two-digit years are **always**
`20xx` — confirmed by cross-referencing `6/26/26` = June 2026 against the withdrawal
sheet's own `Withdraw_Month` column (`2026-06`), and `1/14/25` = January **2024** per
`Machine Repaire History.Clean_Data.FY` = `2024` for that same row (FY appears to follow a
fiscal-year convention offset from the calendar date — do not assume `FY` = calendar year
of the date column; import both independently and let the app reconcile them if needed).
Parse with an explicit `M/D/YYYY` pattern after prefixing `20` to 2-digit years — do not use
a locale-dependent/loose date parser, since `M/D` (US-style) is easily misread as `D/M` by
some libraries. Any value that fails to parse under `M/D/YY[YY]` → store `NULL` and log the
raw string, row id, and column name to a rejects log (see Section 6) — do not throw and
abort the whole batch.

**Sentinel → NULL.** Before any other transform, if a cell's trimmed value
**case-insensitively equals** one of: `UNKNOWN`, `NOT_SPECIFIED`, `NOT FLAGGED`, `NEW`,
`""` (empty string), `DELETE***` → treat it as `NULL`. Also apply this to the literal value
`-` (bare dash) and `.` (bare period) — these appear in `Cleaning_Rules` sheets across
multiple files as explicitly-documented "not real data" placeholders (see e.g.
`Machine_Database.xlsx` → `Cleaning_Rules` rule 1, "Invalid_Placeholders": `.`, `-`, `N/A`).
Add `N/A` (any casing) to the sentinel list too, for the same reason.

**Numeric float artifacts.** Several currency/quantity columns are Excel-formula-derived
and carry repeating-decimal artifacts (e.g. `Inventory_Spare_Items.Unit_Cost` =
`61866.66667`). Cast all money/quantity columns to `numeric(14,4)` (4 decimal places) on
insert — this rounds away the artifact precision without losing any meaningful currency
detail (Thai Baht amounts here don't need more than 2–4 decimal places).

**Machine/QR code normalization.** Trim whitespace, collapse any spaces around a `-`
(`"GR - 309"` → `"GR-309"`), uppercase the result. Apply this identically everywhere a
machine code is stored: `machines.code`, `machines.related_qr_code`,
`work_orders.machine_code`, `pm_plans.machine_code`, `part_withdrawals.machine_code`,
`part_withdrawals.machine_code_alt` — so that a join/lookup across tables actually matches.
Do **not** apply this to `spare_parts.code`/`part_withdrawals.code_no` (those are already
consistently formatted `MTxx-####` in the source, no spacing issues observed).

**Flag columns → `text[]`.** `Quality_Flag`/`Data_Quality_Flag`/`Info_Note` values are
`"; "`-joined free text (e.g. `"MISSING_BRAND"`, `"CBM_NO_MEASUREMENT; INVALID_PERIOD"`).
Split on the literal string `"; "` (semicolon + space), trim each resulting token, drop any
empty tokens, and store as `text[]`. An empty/blank source cell becomes an empty array
`{}`, not `NULL` (so `array_length(quality_flags, 1) is null` reliably means "no flags" in
queries).

**Boolean-ish columns.** Case-insensitive exact match: `YES` → `true`, `NO` → `false`
(`Has_Valid_PartNumber`, `Has_Cost`); `TRUE` → `true`, `FALSE` → `false` (`Is_Aggregate`);
`OVERDUE` → `true`, `ON_SCHEDULE` → `false`, blank/other → `NULL` (`Is_Overdue`). Any value
that doesn't match one of the two expected tokens for its column → `NULL` + log to the
rejects log, don't guess.

**Technician/part lists.** `Technician_List` and similar `" | "`-joined columns split on the
literal string `" | "` into `text[]`, same trim/drop-empty rule as flag columns.

---

## Section 5 — API contract

All responses keep the existing convention: `{ success: true, data: ... }` on success (via
`sendSuccess()`), `{ success: false, error: { message } }` on error, camelCase field names
in JSON matching the pattern already used in `backend/src/lib/mappers.ts`. Row mappers for
the two new tables should be added to that same file (`mapPmPlan`, `mapPartWithdrawal`) so
teammates building the mappers and the routes agree on field names without needing to
re-derive them.

### New: `GET /api/pm-plans`

Query params:
- `limit` (int, default `100`, max `500`)
- `offset` (int, default `0`)
- `machineCode` (string, exact match against normalized `machine_code`)
- `statusCode` (string, exact match against `status_code`)
- `planYear` (int, exact match against `plan_year`)
- `isOverdue` (`"true"` | `"false"`)
- `q` (string, `ilike` search across `item_description`, `part_name`, `machine_base_name`)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "2",
      "refWorkOrderNo": "",
      "machineCode": "GR-721",
      "machineBaseName": "OUTER RING RACEWAY GRINDING MACHINE.",
      "machineCodeInName": "",
      "lineLocation": "MCB3",
      "positionName": "WORK HEAD",
      "pmType": "Condition-based Maintenance",
      "pmTypeCode": "CBM",
      "statusTh": "แก้ไขแผน",
      "statusCode": "PLAN_REVISED",
      "workType": "Mechanical",
      "action": "Measure",
      "priority": "Urgent",
      "itemDescription": "High Velocity Vibration of Work head unit 5.00 mm/s",
      "partName": null,
      "partModel": null,
      "spareId": null,
      "qty": null,
      "cost": null,
      "periodDays": 0,
      "planDate": "2025-09-02",
      "actualDate": null,
      "lastPmDate": "2025-09-02",
      "nextPmDate": null,
      "remark1": null,
      "remark2": null,
      "responsibleEmail": null,
      "planner": null,
      "responsible": "เจษฎา ผิวบาง",
      "cdbBeforeValue": null,
      "cdbBeforeUnit": null,
      "cdbAfterValue": null,
      "cdbAfterUnit": null,
      "planYear": 2025,
      "planYearMonth": "2025-09",
      "isOverdue": null,
      "qualityFlags": ["CBM_NO_MEASUREMENT", "INVALID_PERIOD"],
      "hasCost": false
    }
  ],
  "meta": { "limit": 100, "offset": 0, "total": 2820 }
}
```

### New: `GET /api/pm-plans/:id`
Single record, same shape as one array element, no `meta`. 404 (`{success:false,...}`) if
not found.

### New: `GET /api/part-withdrawals`

Query params:
- `limit` (int, default `100`, max `500`)
- `offset` (int, default `0`)
- `codeNo` (string, exact match against `code_no`)
- `machineCode` (string, exact match against normalized `machine_code`)
- `department` (string, exact match)
- `dateFrom` / `dateTo` (`YYYY-MM-DD`, inclusive range filter on `withdraw_date`)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "withdrawDate": "2026-06-26",
      "withdrawMonth": "2026-06",
      "codeNo": "MTMC-2303",
      "codeNoRaw": "MTMC-2303",
      "partName": "OSCILLATION HEAD",
      "partNumber": "TSH12",
      "packInfo": null,
      "conditionStatus": null,
      "movementStatus": null,
      "shelfNumber": "BG5",
      "shelfType": "SHELF",
      "brand": null,
      "brandNote": null,
      "qty": 1,
      "pricePerUnit": 724010.35,
      "totalValue": 724010.35,
      "groupLineLocation": "WP",
      "lineLocation": "WP GRINDING1",
      "factory": "FACTORY2",
      "machineCode": "GR-240",
      "machineNoteRaw": null,
      "machineCodeAlt": null,
      "processDetail": null,
      "machineName": "SHAFT RACEWAY SUPER FINISH GRINDING M/C",
      "userName": "บุญเลิศ ปะติตังโข",
      "department": "WP PD Support",
      "isAggregate": false,
      "qualityFlags": ["MISSING_BRAND"]
    }
  ],
  "meta": { "limit": 100, "offset": 0, "total": 9764 }
}
```

### New fields on existing endpoints (all camelCase, added alongside current fields)

`GET /api/machines` (and `/:id`): `qrPrefix`, `dupQrCount`, `sourceNo`, `factoryGroup`,
`departmentCode`, `deptPrefix`, `section`, `responsibleGroup`, `costCenter`, `category`,
`productionName`, `relatedQrCode`, `lifecycleStatus`, `qualityFlags`, `infoNotes`.

`GET /api/spare-parts`: `partNumber`, `hasValidPartNumber`, `movementStatus`, `agingBucket`,
`brand`, `groupCode`, `inventoryValue`, `maxInventory`, `reorderPoint`,
`safetyStockQuantity`, `safetyLeadTimeDays`, `lifecycleStatus`, `extraDescription`,
`areaCode`, `sourceModifiedDate`, `stockStatusLabel`, `qualityFlags`.

`GET /api/work-orders`: `machineCode`, `fy`, `shift`, `sectionResponse`, `lineLocation`,
`machineNameRaw`, `machineNameStd`, `machineVariant`, `repairCategory`, `damageSource`,
`pdNickname`, `technicians`, `technicianCount`, `cause`, `repairAction`, `mtLeaderName`,
`finishDatetime`, `timeRefProduction`, `mtlossMin`, `repairDurationMin`, `mtlossDiffMin`,
`dataQualityFlags`. Its nested `requestedParts` items (from `work_order_parts`, mapped by
`mapWorkOrderPart`) gain: `partPosition`, `partModelRaw`.

**Open risk, flagged for lead (Section 7): `/api/machines`, `/api/spare-parts`, and
`/api/work-orders` currently have no pagination at all** (`select("*")` with no `.range()`),
which was fine for a few dozen mock rows. After this import: `machines` → 973 rows,
`spare_parts` → 8,588 rows, `work_orders` → 8,589 rows. Returning all of those in one
unpaginated response on every page load is a real perf/payload problem, but adding
pagination to these 3 **existing** endpoints changes their response contract for whatever
frontend code already calls them unpaginated (`frontend/src/services/apiService.ts`) — that
needs frontend coordination, which is outside what a column-mapping spec can decide alone.
Recommendation if the lead wants it in scope now: add the same `?limit=&offset=` pattern
(default limit `200`, max `1000`) to all three, additive (`meta` only appears when `limit`
is actually passed, to avoid a silent breaking change for existing callers) — but this is a
judgment call on API stability, not a mechanical data-mapping decision, hence flagged rather
than just done.

---

## Section 6 — Import strategy

**Order** (respects the "no strict FK" design but still keeps things logically layered):
1. `machines` (from `Machine_Database.xlsx`)
2. `spare_parts` (from `Inventory_Spare_Items.xlsx`)
3. `work_orders` + `work_order_parts` (from `Machine Repaire History.xlsx`) — one work order
   row, then 0–2 child `work_order_parts` rows, per source row
4. `pm_plans` (from `PM PLAN (แผนการทำ PM).xlsx`)
5. `part_withdrawals` (from `ประวัติการเบิกอะไหล่ (SparePart).xlsx`)

Nothing here technically depends on another table completing first (no FKs to violate), so
these 5 could run in parallel too — the ordering above is just the natural
"master data → transactional history" reading order for anyone debugging later.

**Batch size:** insert in batches of **500 rows** per `supabase.from(table).upsert(...)`
call (Supabase/PostgREST has practical payload limits well above this, but 500 keeps each
request comfortably fast and makes partial-failure retries cheap to reason about). For the
largest sheet (`part_withdrawals`, 9,764 rows) that's ~20 batches.

**Idempotency — upsert, not insert:** every import script must be safely re-runnable. Use
`supabase.from(table).upsert(rows, { onConflict: "id" })` for all 5 tables/imports (the
import PK for each is documented in Section 1/3 — `Row_Key` for machines,
`Work_Order_No` for work_orders, `ID` for spare_parts/pm_plans, `Row_ID` for
part_withdrawals). For `work_order_parts` (no natural key from the source — Part1/Part2
don't have their own id), **delete-then-insert per work order** instead: before inserting a
work order's part rows, `delete from work_order_parts where work_order_id = :id`, then
insert the 0–2 rows fresh. This avoids duplicate part rows piling up on re-run without
needing a synthetic natural key.

**Row rejection / logging:** any row that fails a required transform (unparseable date in a
`not null`-adjacent business sense, unparseable boolean-ish value, etc.) should still be
inserted with the offending field(s) set to `NULL` — **do not drop the whole row** (these
Excel-derived business records are the whole point of the import; losing a row silently is
worse than one bad column). Instead, write one line per rejected field to a plain log file
(e.g. `backend/scripts/import-logs/rejects.jsonl`, one JSON object per line: `{table, id,
column, rawValue, reason}`), and print a final summary count per table
(`rows processed / rows with ≥1 rejected field`) at the end of each import script run.

**Where the import scripts should live:** `backend/scripts/import-*.ts` (one script per
source file, run via `tsx backend/scripts/import-machines.ts` etc., matching the existing
`tsx watch src/index.ts` dev pattern already in `backend/package.json`). Each script reads
its `.xlsx` from `backend/data/`, transforms per Section 3/4, and upserts per this section.
Do not add a runtime `xlsx`/`exceljs` dependency to `backend/package.json`'s production
`dependencies` — put it under `devDependencies` (these import scripts are a one-time/rerun-
as-needed tool, not something the running server needs).

---

## Section 7 — Open questions for the lead (not fully decided, need sign-off)

These have a working default baked into the spec above so no teammate is blocked, but they
are judgment calls, not mechanical data-mapping facts, and should get an explicit yes/no:

1. **`work_orders.priority` derivation from `Urgency`/`Work_Type` Thai free text.** No
   documented mapping exists in the source workbook's own `Cleaning_Rules` sheet for this
   (unlike `PM PLAN`'s `StatusItems→Status_EN` block, which *is* documented). Proposed:
   `ด่วน` → `high`, `งานซ่อมทั่วไป` → `medium`, `ซ่อมตามการวางแผน` → `low`, `ไม่ระบุ`/blank →
   `medium`. Needs business confirmation, not just a data-quality call.
2. **`work_orders.status` derivation** (`'completed'` if `Finish_DateTime` present, else
   `'pending'`) — reasonable for a closed historical log, but means **no imported repair
   record will ever show as `in_progress` or `review`**, which may look odd next to
   newly-created work orders that do use those statuses. Confirm this is acceptable, or
   provide an alternative rule.
3. **`title` = `Symptom`, `description` = `Symptom`** (both get the same text, since Excel
   has no separate short-title field). Acceptable, or should `title` be truncated/derived
   differently (e.g. `machine_name_std` + first N chars of `Symptom`)?
4. **Pagination on the 3 existing endpoints** (`/api/machines`, `/api/spare-parts`,
   `/api/work-orders`) — see Section 5's flagged risk. Needs a decision plus frontend
   coordination before implementation, since it's a contract change to endpoints other code
   already calls.
5. **`FY` vs. calendar year mismatch** in repair history (Section 4) — confirm whether `FY`
   should be trusted as authoritative for fiscal-year reporting, or whether it's itself a
   data-quality artifact that needs its own cleaning pass later (out of scope for this
   import either way, but worth flagging since two "year" signals disagree in the same
   row).
6. **Migration file numbers** (`0006`–`0011` suggested in Section 2) — first teammate to
   start should claim numbers and update this doc / tell the others, to avoid collisions.
