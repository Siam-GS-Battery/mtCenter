-- 0015_manual_chunks.sql
-- คลังความรู้คู่มือแบบค้นหาด้วยความหมาย (semantic search / RAG) สำหรับ AI Assistant
--
-- ปัญหาเดิม: ตาราง manuals เก็บเนื้อหาคู่มือเต็มเล่มไว้ในคอลัมน์ markdown_content
-- (23 เล่ม รวมประมาณ 18.8 ล้านตัวอักษร เล่มใหญ่สุด 2.6 ล้านตัวอักษร) แต่ตัวประกอบ
-- system prompt ของ AI (backend/src/lib/aiContext.ts) ไม่เคยอ่านตารางนี้เลย และต่อให้
-- อ่านก็ยัดลง prompt ไม่ได้ เพราะงบตัวอักษรของบล็อกข้อมูลจริงมีแค่หลักพัน AI จึงตอบ
-- คำถามเกี่ยวกับคู่มือไม่ได้ทั้งที่ข้อมูลมีอยู่จริง
--
-- วิธีแก้: ตัดเนื้อหาคู่มือเป็นชิ้นเล็ก (chunk) ระดับ "หน้า/หัวข้อ" เก็บพร้อม embedding
-- แล้วตอนตอบคำถามค่อยดึงเฉพาะ chunk ที่ใกล้เคียงคำถามที่สุดไม่กี่ชิ้นเข้ามาใน prompt
--
-- หมายเหตุเรื่อง embedding: ระบบใช้โมเดล gemini-embedding-001 ที่ outputDimensionality
-- = 768 (ดู backend/src/lib/embeddings.ts) ค่าที่ Google คืนกลับมาที่มิติ != 3072 นั้น
-- "ไม่ได้" ถูก normalize มาให้ (วัดจริงได้ norm ประมาณ 0.58) ฝั่งแอปจึงต้อง L2-normalize
-- เองก่อนบันทึกและก่อนค้นหาทุกครั้ง ค่าที่เก็บในตารางนี้จึงเป็นเวกเตอร์หน่วยเสมอ
-- ถ้าจะเปลี่ยนโมเดล/มิติในอนาคต ต้อง migrate คอลัมน์ embedding และ re-index ใหม่ทั้งหมด
-- (ค่ามิติถูก assert ไว้ที่ EMBEDDING_DIMENSIONS ในโค้ดฝั่ง TypeScript ด้วย)

create extension if not exists vector with schema extensions;
-- pg_trgm ใช้กับดัชนี GIN ด้านล่างเพื่อให้การค้นหาแบบคำต่อคำ (ILIKE '%...%') เร็วพอ
-- ใช้งานจริง จำเป็นเพราะคำถามหน้างานจำนวนมากเป็น "รหัส alarm/error" เป๊ะ ๆ เช่น
-- "AL. 32" ซึ่ง semantic search มักหาไม่เจอ แต่ keyword search หาเจอทันที
create extension if not exists pg_trgm with schema extensions;

create table if not exists manual_chunks (
  id bigint generated always as identity primary key,
  -- on delete cascade: ลบคู่มือแล้ว chunk ต้องหายตามทันที ไม่งั้นดัชนีจะชี้ไปยัง
  -- เนื้อหาที่ถูกลบไปแล้วและ AI จะอ้างอิงคู่มือที่ไม่มีอยู่จริง
  manual_id text not null references manuals(id) on delete cascade,
  -- ลำดับของ chunk ภายในคู่มือเล่มเดียวกัน (เริ่มที่ 0) ใช้เรียงคืนตามลำดับเนื้อหาเดิม
  chunk_index integer not null,
  -- หัวข้อ Markdown ที่ครอบ chunk นี้อยู่ (เช่น "3.2 การเปลี่ยนตลับลูกปืน")
  heading text,
  -- ป้ายหน้าที่มาจากหัวข้อ "## หน้า N" ในไฟล์ Markdown ต้นทาง (เช่น "หน้า 142")
  -- ใช้อ้างอิงกลับให้ผู้ใช้เปิดคู่มือหน้านั้นได้จริง
  page_label text,
  content text not null,
  char_count integer not null,
  embedding extensions.vector(768) not null,
  created_at timestamptz not null default now(),
  -- กัน chunk ซ้ำเวลา re-index ซ้อนกัน (ตัว indexer ลบของเก่าก่อน insert อยู่แล้ว
  -- แต่ constraint นี้ทำให้ความผิดพลาดดังกล่าวล้มเหลวเสียงดังแทนที่จะเงียบ)
  constraint manual_chunks_manual_id_chunk_index_key unique (manual_id, chunk_index)
);

create index if not exists manual_chunks_manual_id_idx on manual_chunks (manual_id);

-- HNSW + vector_cosine_ops: เนื่องจากเวกเตอร์ถูก normalize เป็นเวกเตอร์หน่วยแล้ว
-- cosine distance กับ inner product จึงให้ลำดับเดียวกัน เลือก cosine เพราะปลอดภัย
-- กว่าหากมีเวกเตอร์ที่ไม่ได้ normalize หลุดเข้ามาในอนาคต
create index if not exists manual_chunks_embedding_idx
  on manual_chunks using hnsw (embedding extensions.vector_cosine_ops);

create index if not exists manual_chunks_content_trgm_idx
  on manual_chunks using gin (content extensions.gin_trgm_ops);

-- ข้อมูลสถานะการ index ของคู่มือแต่ละเล่ม
-- indexed_content_hash เก็บ hash ของ markdown_content ตอนที่ index สำเร็จ ทำให้ตัว
-- indexer ข้ามคู่มือที่เนื้อหาไม่เปลี่ยนได้ (re-index ทั้งคลังราคาแพงทั้งเวลาและโควตา API)
alter table manuals add column if not exists indexed_at timestamptz;
alter table manuals add column if not exists indexed_content_hash text;
alter table manuals add column if not exists chunk_count integer;

alter table manual_chunks enable row level security;

-- ค้นหาแบบความหมาย (semantic): คืน chunk ที่ใกล้เคียงคำถามที่สุด
--
-- โครงสร้างเป็น subquery ซ้อน: ชั้นในเรียงตามระยะห่างแล้ว limit ก่อน (รูปแบบที่ดัชนี
-- HNSW ใช้ได้จริง) ชั้นนอกค่อยตัดตัวที่คะแนนต่ำกว่าเกณฑ์ทิ้ง ถ้าเอา min_similarity ไป
-- ไว้ใน where ชั้นเดียวกับ order by ตัววางแผนคำสั่งจะเลือกสแกนทั้งตารางแทนการใช้ดัชนี
create or replace function match_manual_chunks(
  query_embedding extensions.vector(768),
  match_count integer default 8,
  min_similarity double precision default 0.3,
  filter_machine_models text[] default null,
  filter_manual_ids text[] default null
)
returns table (
  chunk_id bigint,
  manual_id text,
  manual_title text,
  machine_model text,
  category text,
  heading text,
  page_label text,
  chunk_index integer,
  content text,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select *
  from (
    select
      c.id as chunk_id,
      c.manual_id,
      m.title as manual_title,
      m.machine_model,
      m.category,
      c.heading,
      c.page_label,
      c.chunk_index,
      c.content,
      1 - (c.embedding <=> query_embedding) as similarity
    from manual_chunks c
    join manuals m on m.id = c.manual_id
    where (filter_manual_ids is null or c.manual_id = any (filter_manual_ids))
      and (filter_machine_models is null or m.machine_model = any (filter_machine_models))
    order by c.embedding <=> query_embedding
    limit greatest(match_count, 1)
  ) ranked
  where ranked.similarity >= min_similarity;
$$;

-- ค้นหาแบบคำต่อคำ (keyword): ใช้คู่กับ match_manual_chunks สำหรับคำถามที่มีรหัส
-- alarm/error/พารามิเตอร์เป๊ะ ๆ ซึ่ง embedding มักจับไม่ติดเพราะรหัสสั้นและไม่มี
-- ความหมายเชิงภาษา ผลลัพธ์เรียงตามจำนวนตัวอักษรของ chunk จากน้อยไปมาก เพื่อให้
-- แถวในตารางรหัส alarm (ซึ่งสั้นและตรงประเด็น) มาก่อนย่อหน้าอธิบายยาว ๆ ที่บังเอิญ
-- มีรหัสนั้นโผล่อยู่
create or replace function keyword_manual_chunks(
  search_term text,
  match_count integer default 4,
  filter_machine_models text[] default null
)
returns table (
  chunk_id bigint,
  manual_id text,
  manual_title text,
  machine_model text,
  category text,
  heading text,
  page_label text,
  chunk_index integer,
  content text
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    c.id as chunk_id,
    c.manual_id,
    m.title as manual_title,
    m.machine_model,
    m.category,
    c.heading,
    c.page_label,
    c.chunk_index,
    c.content
  from manual_chunks c
  join manuals m on m.id = c.manual_id
  where c.content ilike '%' || search_term || '%'
    and (filter_machine_models is null or m.machine_model = any (filter_machine_models))
  order by c.char_count asc, c.manual_id, c.chunk_index
  limit greatest(match_count, 1);
$$;

-- ฟังก์ชันทั้งสองเป็น security definer และเข้าถึงตารางที่เปิด RLS ไว้ จึงต้องเพิกถอน
-- สิทธิ์ execute จาก role สาธารณะให้หมด เหลือเฉพาะ service_role ที่ backend ใช้
-- (แนวทางเดียวกับหมายเหตุเรื่อง RLS ใน 0001_init.sql: ทุกการเข้าถึงผ่าน backend เท่านั้น)
revoke all on function match_manual_chunks(extensions.vector(768), integer, double precision, text[], text[]) from public, anon, authenticated;
revoke all on function keyword_manual_chunks(text, integer, text[]) from public, anon, authenticated;
grant execute on function match_manual_chunks(extensions.vector(768), integer, double precision, text[], text[]) to service_role;
grant execute on function keyword_manual_chunks(text, integer, text[]) to service_role;
