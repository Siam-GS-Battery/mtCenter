-- 0018_work_order_attachments.sql
-- เก็บไฟล์เอกสารแนบของใบงานซ่อม เพื่อประกอบการปิดงาน
-- Adds a table to track work order attachment metadata (file name, path, size,
-- content type, uploader, note) and a private Supabase Storage bucket to hold
-- the actual files. Additive only, idempotent.

create table if not exists work_order_attachments (
  id text primary key default gen_random_uuid()::text,
  work_order_id text not null references work_orders(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  content_type text,
  note text,
  uploaded_by text,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_work_order_attachments_work_order_id
  on work_order_attachments(work_order_id);

-- Row Level Security เปิดไว้แบบไม่มี policy ใด ๆ (ตามธรรมเนียมของ repo นี้) เพราะ
-- backend เข้าถึงฐานข้อมูลด้วย service-role key ซึ่ง bypass RLS อยู่แล้ว
alter table work_order_attachments enable row level security;

-- สร้าง storage bucket ชื่อ "work-order-attachments" แบบ private (public = false)
-- จำกัดขนาดไฟล์ไม่เกิน 50MB และอนุญาตเฉพาะไฟล์ประเภทเอกสาร/รูปภาพที่ใช้ประกอบการปิดงาน
-- ใช้ on conflict...do update เพื่อให้ migration นี้ idempotent
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-order-attachments',
  'work-order-attachments',
  false,
  52428800,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- หมายเหตุ: ไม่ต้องสร้าง storage RLS policy ใด ๆ สำหรับ bucket นี้ เพราะ backend
-- (Express) เข้าถึง Supabase Storage ด้วย service-role key ซึ่ง bypass RLS อยู่แล้ว
-- ไม่มี client ใดเข้าถึง Storage ด้วย anon role ตรง ๆ จึงไม่จำเป็นต้องมี policy
