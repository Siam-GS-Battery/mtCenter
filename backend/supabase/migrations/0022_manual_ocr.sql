-- 0022_manual_ocr.sql
-- เพิ่มการรองรับ OCR สำหรับคู่มือเครื่องจักร (manuals) ที่เป็นไฟล์ PDF สแกน/รูปภาพ
-- ซึ่งไม่มีข้อความให้ดึงตรง ๆ ต้องผ่านขั้นตอน OCR เพื่อแปลงเป็น Markdown ก่อน
-- คอลัมน์เหล่านี้ใช้ติดตามสถานะของงาน OCR แต่ละคู่มือ และเก็บ path ของไฟล์
-- Markdown (.md) ที่ OCR สร้างขึ้นไว้ใน storage bucket "manuals" เดิม

alter table manuals add column if not exists ocr_status text;
alter table manuals add column if not exists ocr_error text;
alter table manuals add column if not exists ocr_started_at timestamptz;
alter table manuals add column if not exists ocr_completed_at timestamptz;
alter table manuals add column if not exists ocr_pages int;
alter table manuals add column if not exists markdown_path text;

-- ocr_status เป็น null หมายถึง "ยังไม่เคยถูกเข้าคิว OCR" ส่วนค่าที่เหลือคือสถานะ
-- ของงาน OCR ที่เข้าคิวแล้ว ใช้ do $$ ... $$ ตรวจสอบ pg_constraint ก่อนเพื่อให้
-- migration นี้ idempotent (alter table add constraint ไม่มี if not exists ให้ใช้)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'manuals_ocr_status_check'
  ) then
    alter table manuals
      add constraint manuals_ocr_status_check
      check (ocr_status is null or ocr_status in ('pending', 'processing', 'done', 'failed', 'skipped'));
  end if;
end $$;

create index if not exists idx_manuals_ocr_status on manuals(ocr_status);

-- markdown_approved: OCR ที่รันจบจะได้ "draft" เท่านั้น (ยังไม่ approve) ผู้ใช้ต้อง
-- ตรวจ/แก้ไขในตัวแก้ไขแบบ side-by-side แล้วกด save/approve ผ่าน PUT /:id/content ก่อน
-- ถึงจะถือว่าเป็นทางการ ค่า default เป็น false เพื่อให้ OCR ที่รันจบใหม่ ๆ ไม่ approve ทันที
alter table manuals add column if not exists markdown_approved boolean not null default false;

-- backfill: เนื้อหาเดิมที่มีอยู่ก่อนฟีเจอร์ draft/approve นี้ (seed ข้อมูลเดิม, เนื้อหาที่
-- ผู้ใช้กรอกตรงตอน POST /) ถือว่า approve ไปแล้วโดยปริยาย เพื่อไม่ให้กลายเป็น draft
-- ที่ต้องรอ review ย้อนหลังทั้งหมดหลัง migrate
update manuals set markdown_approved = true where markdown_content is not null and length(markdown_content) > 0;

-- อัปเดต storage bucket "manuals" ให้อนุญาตไฟล์ text/markdown เพิ่มจาก application/pdf
-- เดิม เพื่อให้ backend อัปโหลดไฟล์ .md ที่ OCR สร้างขึ้นเข้า bucket นี้ได้
update storage.buckets
set allowed_mime_types = array['application/pdf', 'text/markdown']
where id = 'manuals';
