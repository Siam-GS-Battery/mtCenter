-- 0013_manual_has_markdown.sql
-- ก่อนหน้านี้ GET /api/manuals ใช้ .select("*") ซึ่งดึงคอลัมน์ markdown_content
-- (ข้อความ Markdown เต็มของคู่มือ) มาด้วยเสมอ แม้ตอนแสดงรายการจะไม่ได้ใช้เนื้อหานี้เลย
-- กำลังจะ import คู่มือจริง ~20MB รวม 26 แถว เข้าตารางนี้ ถ้ายังคง .select("*") ไว้
-- payload ของ list endpoint จะบวมขึ้นหลายสิบเท่าโดยไม่จำเป็น จึงต้องมีคอลัมน์แยกต่างหาก
-- ให้ route บอกได้ว่าแถวนี้ "มี" เนื้อหา Markdown หรือไม่ โดยไม่ต้อง select
-- markdown_content เข้ามาเลย ส่วนเนื้อหาจริงย้ายไปให้ client ดึงแยกผ่าน
-- GET /api/manuals/:id/content แทน
--
-- ใช้ generated column แบบ stored เพื่อให้ค่านี้อัปเดตอัตโนมัติเสมอเมื่อ
-- markdown_content เปลี่ยน (insert/update) โดยไม่ต้องพึ่ง trigger หรือให้ backend
-- คำนวณเอง ใช้ coalesce(length(...), 0) > 0 แทน <> '' เพราะ length() เป็น
-- immutable function ซึ่ง Postgres ยอมรับใน generated column ได้แน่นอน ในขณะที่
-- นิพจน์เปรียบเทียบ string บางรูปแบบอาจถูก Postgres ปฏิเสธว่าไม่ immutable
alter table manuals
  add column if not exists has_markdown boolean
  generated always as (coalesce(length(markdown_content), 0) > 0) stored;
