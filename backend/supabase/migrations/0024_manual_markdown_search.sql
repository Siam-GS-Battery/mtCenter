-- 0024_manual_markdown_search.sql
-- คู่มือ 26 เล่มมี markdown_content จริง (รวม 13.4 ล้านตัวอักษร) แต่มีแค่ 4 เล่มที่ถูก
-- index เป็น manual_chunks (363 chunks ครอบคลุม 5 เล่ม) เพราะโควตา embedding ฟรีของ
-- Gemini โดน 429 ระหว่าง index — เส้นทาง semantic search (0015) จึงตอบคำถามคู่มือ
-- ส่วนใหญ่ไม่ได้ในทางปฏิบัติ
--
-- วิธีแก้ชั่วคราวจนกว่าจะ index embedding ครบ: ค้นแบบ keyword ตรงบน
-- manuals.markdown_content เอง (ILIKE) แล้วคืน "snippet" รอบตำแหน่งที่เจอ ไม่ใช่ทั้ง
-- เล่ม — กันไม่ให้ยัดเนื้อหาหลักแสน/ล้านตัวอักษรเข้า prompt
--
-- หมายเหตุขนาด: ดัชนี trigram (GIN) บนคอลัมน์ markdown_content ทั้งตาราง (~13MB
-- ข้อความ) ใช้พื้นที่และเวลาสร้างมากกว่าดัชนี manual_chunks.content เดิมพอสมควร
-- (คอลัมน์นี้ใหญ่กว่าเป็นสิบเท่า) แต่จำเป็นเพื่อไม่ให้ ILIKE '%...%' เป็น full-table
-- sequential scan ที่ช้าลงเรื่อย ๆ เมื่อคู่มือเพิ่มขึ้น

create extension if not exists pg_trgm with schema extensions;

create index if not exists manuals_markdown_content_trgm_idx
  on manuals using gin (markdown_content extensions.gin_trgm_ops);

-- ค้นหาคำ/รหัสแบบ keyword ตรงบนเนื้อหาคู่มือเต็มเล่ม แล้วคืนเฉพาะ "snippet" รอบตำแหน่ง
-- ที่พบคำนั้น (ไม่คืนทั้งเล่ม)
--
-- แนวทางการทำงาน:
--   1) unnest search_terms ทีละคำ ค้นหาตำแหน่ง (position ของคำที่ lower แล้ว บน
--      markdown_content ที่ lower แล้ว) ต่อคู่มือ
--   2) ถ้าเจอ ตัด substring ความกว้าง snippet_chars โดยให้ตำแหน่งที่เจอค่อนไปทางกลาง
--      หน้าต่างนั้น (ไม่ใช่จุดเริ่มต้น)
--   3) หา page_label โดยมองหาหัวข้อ "## หน้า N" ที่อยู่ก่อนตำแหน่งที่เจอล่าสุด (ใน
--      ข้อความก่อนตำแหน่งนั้น) ด้วย regexp — คืน null ถ้าหาไม่ได้ (เช่น match อยู่ใน
--      ส่วนหัวเล่มก่อนหน้าแรก)
--   4) จำกัดจำนวน match ต่อคู่มือด้วย max_hits_per_manual และจำกัดรวมทั้งหมดแบบ hard
--      cap ที่ 12 แถว กันคำกว้าง ๆ (เช่นคำสั้นที่เจอทุกหน้า) ทำให้ผลลัพธ์บวมเกินไป
--
-- ต้นทุน: position()/substring() ต่อคำต่อคู่มือคือการสแกนข้อความเชิงเส้น (ดัชนี
-- trigram ช่วยเฉพาะขั้นกรองแถวที่ "มีคำนั้นอยู่" ผ่าน ILIKE ไม่ได้ช่วยหาตำแหน่ง)
-- จึงกรองด้วย ILIKE ก่อน (ใช้ดัชนี trigram ได้) แล้วค่อย position()/substring() เฉพาะ
-- แถวที่ผ่านตัวกรองแล้วเท่านั้น
create or replace function search_manual_markdown(
  search_terms text[],
  filter_machine_models text[] default null,
  max_hits_per_manual int default 2,
  snippet_chars int default 2500
)
returns table (
  manual_id text,
  title text,
  machine_model text,
  page_label text,
  snippet text,
  match_term text
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  term text;
  hard_cap constant int := 12;
begin
  if search_terms is null or array_length(search_terms, 1) is null then
    return;
  end if;

  return query
  with candidates as (
    select
      m.id as manual_id,
      m.title,
      m.machine_model,
      m.markdown_content,
      lower(m.markdown_content) as lc_content,
      t as term,
      lower(t) as lc_term
    from manuals m
    cross join unnest(search_terms) as t
    where m.markdown_content is not null
      and length(t) > 0
      and m.markdown_content ilike '%' || t || '%'
      and (filter_machine_models is null or m.machine_model = any (filter_machine_models))
  ),
  positioned as (
    select
      c.manual_id,
      c.title,
      c.machine_model,
      c.markdown_content,
      c.term,
      -- ตำแหน่งที่พบคำนี้ครั้งแรก (1-indexed, ตำแหน่งของอักขระตัวแรกของคำที่เจอ)
      strpos(c.lc_content, c.lc_term) as pos,
      length(c.term) as term_len
    from candidates c
  ),
  windowed as (
    select
      p.manual_id,
      p.title,
      p.machine_model,
      p.term,
      -- จุดเริ่มหน้าต่าง snippet: ให้ตำแหน่งที่เจอค่อนไปทางกลางหน้าต่าง ไม่ต่ำกว่า 1
      greatest(1, p.pos - (snippet_chars / 2)) as win_start,
      p.pos,
      p.markdown_content
    from positioned p
    where p.pos > 0
  ),
  snippets as (
    select
      w.manual_id,
      w.title,
      w.machine_model,
      w.term,
      substring(w.markdown_content from w.win_start for snippet_chars) as snippet,
      -- หา "## หน้า N" ตัวสุดท้ายที่อยู่ก่อนตำแหน่งที่เจอ จากเนื้อหาทั้งหมดก่อนหน้านั้น
      -- ใช้ regexp_matches แบบ 'g' พร้อม with ordinality เพื่อเรียงตามลำดับที่เจอจริง
      -- ในข้อความ แล้วหยิบตัวสุดท้าย (ordinality มากสุด) — คืน null ถ้าไม่มี (เช่น
      -- match อยู่ในส่วนหัวเล่มก่อนหัวข้อหน้าแรก)
      (
        select 'หน้า ' || (arr.m)[1]
        from regexp_matches(
          substring(w.markdown_content from 1 for w.pos - 1),
          '##\s*หน้า\s*(\d+)',
          'g'
        ) with ordinality as arr(m, ord)
        order by arr.ord desc
        limit 1
      ) as page_label
    from windowed w
  ),
  ranked as (
    select
      s.*,
      -- จำกัดจำนวนแถวต่อคู่มือ: อย่างมาก max_hits_per_manual แถวต่อเล่ม แม้จะมีหลาย
      -- คำที่ match ในเล่มเดียวกันก็ตาม กันเล่มเดียวครองผลลัพธ์ทั้งหมด
      row_number() over (partition by s.manual_id order by s.term) as rn
    from snippets s
    where s.snippet is not null and length(trim(s.snippet)) > 0
  )
  select
    r.manual_id,
    r.title,
    r.machine_model,
    r.page_label,
    r.snippet,
    r.term as match_term
  from ranked r
  where r.rn <= greatest(max_hits_per_manual, 1)
  order by r.manual_id, r.term
  -- เพดานรวมทั้งหมด: กันคำกว้าง ๆ ที่ match หลายเล่มพร้อมกันดันจำนวนแถวรวมบวมเกินไป
  limit hard_cap;
end;
$$;

revoke all on function search_manual_markdown(text[], text[], int, int) from public, anon, authenticated;
grant execute on function search_manual_markdown(text[], text[], int, int) to service_role;
