-- 0001_init.sql
-- Schema for mtCenter (Maintenance Center).
-- Row Level Security (RLS) is enabled on every table below WITHOUT any policies.
-- This is intentional: this application has no direct client (browser) access to
-- Postgres. All access goes exclusively through the backend server, which uses the
-- Supabase service-role key. The service-role key bypasses RLS entirely, so no
-- policies are required. Enabling RLS here simply ensures that if a non-service-role
-- key (e.g. anon/public) were ever used against this database, it would be denied
-- access by default (fail closed) rather than exposed.

create table if not exists profiles (
  id text primary key,
  employee_id text unique not null,
  name text not null,
  initials text,
  role text not null check (role in ('technician','engineer','supervisor')),
  department text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists machines (
  id text primary key,
  code text unique not null,
  name text not null,
  model text,
  location text,
  status text not null default 'normal' check (status in ('normal','warning','error','maintenance')),
  last_maintenance text,
  next_maintenance text,
  health_score int,
  spindle_temp numeric,
  vibration_mms numeric,
  operating_hours int,
  qr_code_url text,
  image_url text,
  active_error_code text,
  active_error_desc text,
  created_at timestamptz not null default now()
);

create table if not exists work_orders (
  id text primary key,
  code text unique not null,
  title text not null,
  machine_id text references machines(id),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  status text not null default 'pending' check (status in ('pending','in_progress','review','completed')),
  technician_name text,
  engineer_reviewer text,
  assigned_date text,
  due_date text,
  description text,
  symptoms text[],
  steps_completed int,
  total_steps int,
  ai_verification_score int,
  requested_by text,
  assigned_to text,
  estimated_hours numeric,
  action_plan text[],
  parts_requested text[],
  solution_steps text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists work_order_parts (
  id text primary key default gen_random_uuid()::text,
  work_order_id text not null references work_orders(id) on delete cascade,
  part_id text,
  part_code text,
  part_name text,
  quantity int not null default 1,
  status text default 'requested'
);

create table if not exists spare_parts (
  id text primary key,
  code text unique not null,
  name text not null,
  category text,
  compatible_machines text[],
  stock_quantity int not null default 0,
  unit text,
  min_threshold int default 0,
  location_rack text,
  unit_price_thb numeric,
  status text not null default 'in_stock' check (status in ('in_stock','low_stock','out_of_stock')),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists manuals (
  id text primary key,
  title text not null,
  machine_model text,
  category text,
  upload_date text,
  uploaded_by text,
  file_size text,
  pages_count int,
  ai_indexed boolean default false,
  tags text[],
  markdown_content text,
  created_at timestamptz not null default now()
);

create index if not exists idx_work_orders_status on work_orders(status);
create index if not exists idx_work_orders_machine_id on work_orders(machine_id);
create index if not exists idx_work_order_parts_work_order_id on work_order_parts(work_order_id);
create index if not exists idx_spare_parts_status on spare_parts(status);

alter table profiles enable row level security;
alter table machines enable row level security;
alter table work_orders enable row level security;
alter table work_order_parts enable row level security;
alter table spare_parts enable row level security;
alter table manuals enable row level security;
