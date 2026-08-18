-- 0017_ai_interaction_logs.sql
-- Frame 4 ของ UX Storyboard (Scenario C): "บันทึกการใช้งาน + feedback"
--
-- storyboard ระบุว่า Frame 4 ยังไม่ใช้ AI — เป็น Analytics/Telemetry ที่เก็บ log การใช้
-- งานเพื่อนำไปปรับปรุงคุณภาพการค้นคืน (retrieval) ต่อไป ตารางนี้คือที่เก็บนั้น
--
-- เก็บอะไร: คำถามที่ถาม, เจตนาที่ระบบตีความได้ (intent), โหมดที่ตอบ (mock/live),
-- เครื่องจักรที่เป็นบริบท และผลตอบรับของผู้ใช้ (นิ้วขึ้น/นิ้วลง)
--
-- ทำไมต้องเก็บ intent ไม่ใช่แค่ prompt: ข้อมูลที่ใช้ปรับปรุงระบบจริงคือ "คำถามแบบไหน
-- ที่ตีความไม่ออก" (intent = unknown) และ "คำถามแบบไหนที่ตอบแล้วผู้ใช้กดไม่พอใจ"
-- การมีคอลัมน์ intent แยกทำให้นับสองอย่างนี้ได้ด้วย SQL ธรรมดา ไม่ต้องมาไล่อ่าน prompt

create table if not exists ai_interaction_logs (
  id bigint generated always as identity primary key,
  -- ไม่ใช้ foreign key ไปที่ profiles โดยเจตนา: log ต้องบันทึกได้เสมอแม้ผู้ใช้จะถูกลบ
  -- ทีหลัง การเสีย log วิเคราะห์ไปเพราะลบผู้ใช้หนึ่งคนไม่คุ้มกับความสมบูรณ์ของ FK
  actor_id text,
  machine_id text,
  machine_code text,
  role text,
  prompt text not null,
  -- เจตนาที่ตัว rule engine ตีความได้ (ดู INTENTS ใน src/lib/mockAssistant.ts)
  -- ค่า "unknown" มีความหมายสำคัญ: คือคำถามที่ระบบยังตอบไม่ได้ ใช้เป็น input
  -- สำหรับเพิ่มชุดคำถาม/กฎในรอบถัดไป
  intent text not null,
  -- "mock" = ตอบด้วย rule engine, "live" = ตอบด้วยโมเดลจริง, "fallback" = โมเดลล้ม
  -- แล้วตกไปใช้คำตอบสำรอง
  mode text not null,
  reply_chars integer,
  -- จำนวนคู่มือที่ถูกอ้างอิงประกอบคำตอบ (Frame 3) — 0 = ตอบโดยไม่มีคู่มือรองรับ
  manual_citations integer not null default 0,
  -- 1 = พอใจ (นิ้วขึ้น), -1 = ไม่พอใจ (นิ้วลง), null = ยังไม่ให้ผลตอบรับ
  feedback smallint,
  feedback_at timestamptz,
  created_at timestamptz not null default now(),
  constraint ai_interaction_logs_feedback_check check (feedback is null or feedback in (-1, 1))
);

-- ดัชนีตามเวลาสำหรับรายงานย้อนหลัง (คำถามล่าสุด, สรุปรายวัน)
create index if not exists ai_interaction_logs_created_at_idx on ai_interaction_logs (created_at desc);
-- ดัชนีบางส่วน (partial) เฉพาะแถวที่ตีความเจตนาไม่ได้ — คิวรีที่ใช้ตอนปรับปรุงระบบ
-- จะถามหาแถวเหล่านี้เป็นหลัก และมันเป็นสัดส่วนน้อยของตาราง
create index if not exists ai_interaction_logs_unknown_intent_idx
  on ai_interaction_logs (created_at desc)
  where intent = 'unknown';

alter table ai_interaction_logs enable row level security;
