-- 0019_link_part_withdrawals_to_work_orders.sql
-- ผูกการเบิกอะไหล่ (part_withdrawals) เข้ากับใบงานแจ้งซ่อม (work_orders) และอะไหล่
-- (spare_parts) เพื่อรองรับ endpoint สร้างการเบิกอะไหล่ใหม่ (POST /api/part-withdrawals)
-- ที่ตัดสต๊อกจริงและอ้างอิงกลับไปยังใบงานได้
-- work_order_id มี FK จริง (ตั้ง on delete set null เพื่อไม่ลบประวัติการเบิกเมื่อใบงานถูกลบ)
-- spare_part_id ไม่มี FK ตามแบบเดียวกับ code_no/machine_code เดิม (ดู 0008) เพราะข้อมูล
-- historical import อาจมี id ไม่ตรงกับ spare_parts ปัจจุบัน — เก็บเป็น plain text column

alter table part_withdrawals
  add column if not exists work_order_id text references work_orders(id) on delete set null;

alter table part_withdrawals
  add column if not exists spare_part_id text;

alter table part_withdrawals
  add column if not exists note text;

create index if not exists idx_part_withdrawals_work_order_id on part_withdrawals(work_order_id);
