-- 0020_part_withdrawals_withdrawn_by.sql
-- เพิ่มคอลัมน์ withdrawn_by เก็บ profile id ของผู้เบิกจริง (ไอดี ไม่ใช่ชื่อ)
-- แยกจาก user_name ซึ่งเก็บ "ชื่อ" ผู้เบิกไว้แสดงผลและใช้กรุ๊ปรายงานตามข้อมูลเดิม

alter table part_withdrawals add column if not exists withdrawn_by text;
