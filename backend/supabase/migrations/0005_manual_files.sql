-- 0005_manual_files.sql
-- เพิ่มการรองรับไฟล์ (PDF) จริงสำหรับคู่มือเครื่องจักร (manuals) โดยเก็บไฟล์ไว้ใน
-- Supabase Storage และเก็บ path ของไฟล์ไว้ในตาราง manuals ผ่านคอลัมน์ file_path

alter table manuals add column if not exists file_path text;

-- สร้าง storage bucket ชื่อ "manuals" แบบ private (public = false) จำกัดขนาดไฟล์
-- ไม่เกิน 50MB และอนุญาตเฉพาะไฟล์ประเภท PDF เท่านั้น
-- ใช้ on conflict...do update เพื่อให้ migration นี้ idempotent และปรับปรุงค่า limit/mime
-- type ให้ตรงกับที่กำหนดไว้ล่าสุดได้แม้ bucket มีอยู่แล้ว
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('manuals', 'manuals', false, 52428800, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- หมายเหตุ: ไม่ต้องสร้าง storage RLS policy ใด ๆ สำหรับ bucket นี้
-- เพราะ backend (Express) เข้าถึง Supabase Storage ด้วย service-role key ซึ่ง bypass
-- RLS อยู่แล้ว ส่วนฝั่ง browser จะอัปโหลดไฟล์ผ่าน short-lived signed upload URL ที่ backend
-- เป็นผู้ออกให้เท่านั้น ไม่มี client ใดเข้าถึง Storage ด้วย anon role ตรง ๆ จึงไม่จำเป็นต้องมี
-- policy สำหรับ anon role เลย
