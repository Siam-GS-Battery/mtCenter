-- 0025_search_manual_markdown_by_id.sql
-- เพิ่มพารามิเตอร์ optional ตัวใหม่ "filter_manual_ids" ให้ search_manual_markdown
-- (เดิมนิยามใน 0024_manual_markdown_search.sql) เพื่อรองรับกรณีผู้ใช้เลือกคู่มือเล่ม
-- ใดเล่มหนึ่งเจาะจงในหน้าจอ (manualId ใน POST /api/ai/chat) แล้วต้องการค้นหาแบบ
-- keyword ให้จำกัดอยู่เฉพาะคู่มือเล่มนั้นเท่านั้น (เช่น กรณีเล่มยาวเกินงบใส่ทั้งเล่ม
-- แล้วต้องใช้การค้นแบบ keyword ครอบคลุมกว้างขึ้นแทน — ดู aiContext.ts)
--
-- เป็นพารามิเตอร์ต่อท้ายพร้อมค่า default null จึงเรียกใช้แบบเดิม (ไม่ส่งพารามิเตอร์นี้)
-- ได้พฤติกรรมเหมือนเดิมทุกประการ ไม่กระทบผู้เรียกเดิมใน manualMarkdownSearch.ts เลย
--
-- ห้ามแก้ 0024 ตรง ๆ ตามข้อกำหนดงานนี้ จึง drop ฟังก์ชัน signature เดิม (4 พารามิเตอร์)
-- แล้ว create ใหม่ด้วย signature 5 พารามิเตอร์แทน — ถ้าใช้ "create or replace" เฉย ๆ
-- โดยไม่ drop ก่อน Postgres จะมองว่าเป็นฟังก์ชันคนละตัว (ผูก overload ด้วยจำนวน/ชนิด
-- พารามิเตอร์ ไม่ใช่ชื่อ) ทำให้มีสองฟังก์ชันซ้อนกันอยู่ในระบบ และเมื่อเรียกด้วย 4
-- อาร์กิวเมนต์ (ตามโค้ดเดิมใน manualMarkdownSearch.ts) Postgres จะตีความว่ากำกวม
-- (ambiguous function call) เพราะทั้งฟังก์ชัน 4 พารามิเตอร์ และฟังก์ชัน 5 พารามิเตอร์
-- ที่มีค่า default ให้พารามิเตอร์ตัวที่ 5 ต่างก็รับ 4 อาร์กิวเมนต์ได้ทั้งคู่
drop function if exists search_manual_markdown(text[], text[], int, int);

create function search_manual_markdown(
  search_terms text[],
  filter_machine_models text[] default null,
  max_hits_per_manual int default 2,
  snippet_chars int default 2500,
  filter_manual_ids text[] default null
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
      and (filter_manual_ids is null or m.id = any (filter_manual_ids))
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

-- ต้อง revoke/grant ใหม่ทั้งสอง signature: overload เดิม (4 พารามิเตอร์ ไม่มีอีกแล้ว
-- เพราะ create or replace เปลี่ยน signature ของฟังก์ชันเดิมไปเป็น 5 พารามิเตอร์ในตัว
-- เดียวกัน — Postgres ผูก signature ด้วยจำนวน/ชนิดพารามิเตอร์ ไม่ใช่ชื่อฟังก์ชันเฉย ๆ)
revoke all on function search_manual_markdown(text[], text[], int, int, text[]) from public, anon, authenticated;
grant execute on function search_manual_markdown(text[], text[], int, int, text[]) to service_role;
