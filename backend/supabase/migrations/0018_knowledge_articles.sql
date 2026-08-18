-- 0018_knowledge_articles.sql
-- คลังความรู้ที่ "คนยืนยันแล้ว" — แกนกลางของ UX Storyboard Scenario C
-- (ดูแลคลังความรู้หลังปิดงาน | Persona: Engineer แผนก MT)
--
-- ที่มา: Scenario A Frame 6 ระบุว่าเมื่อช่างปิดงานและเล่าขั้นตอนที่ใช้แก้จริง
-- "ผลลัพธ์ส่งต่อให้ Engineer รีวิวในชีต 2 ไม่เข้าคลังความรู้ทันที"
-- และ Scenario C Frame 2 ระบุเหตุผลไว้ตรง ๆ ว่า "ห้าม AI เขียนความรู้เข้าคลังเอง"
-- ความรู้จะเข้าคลังต่อเมื่อคนกดยืนยันเท่านั้น
--
-- ข้อบังคับนั้นถูกเข้ารหัสไว้ที่ระดับ schema ไม่ใช่แค่ในโค้ดหรือ UI:
-- confirmed_by เป็น NOT NULL จึงไม่มีทางสร้างแถวในตารางนี้ได้โดยไม่มีคนรับผิดชอบ
-- ต่อให้โค้ดฝั่งแอปมีบั๊ก หรือมีสคริปต์อื่นเขียนเข้ามาตรง ๆ ก็ยังถูกฐานข้อมูลปฏิเสธ
-- (การพึ่ง if-check ในโค้ดอย่างเดียวคือรอวันที่มีเส้นทางที่สองเขียนข้ามไป)

create table if not exists knowledge_articles (
  -- text primary key ตามแบบเดียวกับ manuals.id / work_orders.id ในโปรเจกต์นี้
  id text primary key,
  title text not null,
  category text,
  -- รุ่น/รหัสเครื่องที่ความรู้นี้ใช้ได้ ใช้จับคู่ตอนค้นให้ช่าง
  machine_model text,
  machine_code text,
  tags text[] not null default '{}',
  summary text,
  content text not null,

  -- ต้นทาง: ใบงานที่ความรู้นี้ถูกสกัดออกมา (null ได้ ถ้าเป็นความรู้ที่เขียนขึ้นเอง)
  -- ไม่ใช้ foreign key เพราะ work_orders ที่ถูกลบไม่ควรลบความรู้ที่ยืนยันแล้วตามไปด้วย
  -- (ความรู้มีค่าในตัวเองหลังถูกรีวิวแล้ว ไม่ผูกชะตากับใบงานต้นทางอีก)
  source_work_order_id text,
  source_work_order_code text,

  -- ร่างที่ระบบสร้างจากสิ่งที่ช่างเล่า เก็บคู่กับฉบับที่คนแก้แล้ว
  -- ทำไมต้องเก็บ: ส่วนต่างระหว่าง draft_content กับ content คือ "สิ่งที่ตัวร่างพลาด"
  -- ซึ่งเป็นข้อมูลตรงที่สุดสำหรับปรับปรุงตัวสร้างร่างในรอบถัดไป (และเป็นหลักฐานว่า
  -- คนได้ตรวจจริง ไม่ได้กดยืนยันผ่าน ๆ)
  draft_content text,

  -- ผู้ยืนยัน — NOT NULL คือหัวใจของข้อบังคับใน Frame 2 (ดูหมายเหตุหัวไฟล์)
  confirmed_by text not null,
  confirmed_by_name text,
  confirmed_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ใบงานหนึ่งใบให้มีความรู้ที่ยืนยันแล้วได้หนึ่งเรื่อง กันการกดยืนยันซ้ำจากการกดปุ่มสองครั้ง
-- ใช้ unique index แบบมีเงื่อนไข เพราะ source_work_order_id เป็น null ได้ (ความรู้ที่ไม่มี
-- ใบงานต้นทาง) และค่า null หลายแถวไม่ควรชนกันเอง
create unique index if not exists knowledge_articles_source_wo_key
  on knowledge_articles (source_work_order_id)
  where source_work_order_id is not null;

create index if not exists knowledge_articles_machine_model_idx on knowledge_articles (machine_model);
create index if not exists knowledge_articles_confirmed_at_idx on knowledge_articles (confirmed_at desc);
-- ค้นด้วยคำต่อคำในเนื้อหา (pg_trgm ถูกเปิดไว้แล้วใน 0015_manual_chunks.sql)
create index if not exists knowledge_articles_content_trgm_idx
  on knowledge_articles using gin (content extensions.gin_trgm_ops);

alter table knowledge_articles enable row level security;

-- Frame 4 ("เห็นว่าถูกใช้จริง") ต้องนับ "จำนวนครั้งที่ความรู้ถูกอ้างอิง" ต่อเรื่อง
-- จึงต้องบันทึกว่าคำตอบแต่ละครั้งอ้างอิงความรู้เรื่องใดไปบ้าง
-- เก็บเป็นอาร์เรย์ของ id ไม่ใช่ตารางเชื่อม เพราะหนึ่งคำตอบอ้างอิงได้ไม่กี่เรื่อง และ
-- คิวรีที่ต้องใช้จริงคือ "นับต่อเรื่อง" ซึ่ง unnest ทำได้ตรง ๆ
alter table ai_interaction_logs
  add column if not exists knowledge_article_ids text[] not null default '{}';

create index if not exists ai_interaction_logs_knowledge_ids_idx
  on ai_interaction_logs using gin (knowledge_article_ids);
