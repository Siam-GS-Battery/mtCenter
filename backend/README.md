# mtcenter-backend

Backend API สำหรับระบบ MT Center (Node.js + Express + TypeScript + Supabase)

## วิธีติดตั้งและรันโปรเจกต์

1. ติดตั้งแพ็กเกจ

   ```
   npm install
   ```

2. คัดลอกไฟล์ตัวอย่าง environment แล้วกรอกค่าให้ครบ

   ```
   copy .env.example .env
   ```

   จากนั้นแก้ไขค่าต่อไปนี้ใน `.env`:
   - `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` (จากโปรเจกต์ Supabase)
   - `GEMINI_API_KEY` (สำหรับฟีเจอร์ AI Assistant)
   - `CORS_ORIGIN` (โดเมนของ frontend ที่อนุญาต, คั่นด้วยจุลภาคได้หลายค่า)

3. รันเซิร์ฟเวอร์ในโหมดพัฒนา (auto-reload)

   ```
   npm run dev
   ```

4. Build สำหรับ production

   ```
   npm run build
   npm start
   ```

Server จะรันที่ `http://localhost:4000` (หรือค่าที่กำหนดใน `PORT`) โดยมี endpoint ทดสอบที่ `GET /api/health`

## โหมดผู้ช่วย AI (AI_MODE)

ผู้ช่วยมีสองโหมด สลับด้วย env `AI_MODE` และตรวจโหมดปัจจุบันได้ที่ `GET /api/ai/mode`

| โหมด | พฤติกรรม | เหมาะกับ |
| --- | --- | --- |
| `mock` (ค่าเริ่มต้น) | ตอบด้วยกฎ + ข้อมูลจริงจากตาราง `machines` / `work_orders` และเกณฑ์ใน `src/lib/thresholds.ts` **ไม่เรียกโมเดลภาษาเลย** | สาธิต POC — คำตอบคงที่ ตรวจสอบย้อนกลับได้ทุกตัวเลข ไม่ผูกกับ API key/โควตาภายนอก |
| `live` | เรียก Gemini จริง พร้อมบล็อกข้อมูลเครื่องจักรและเนื้อหาคู่มือ | เมื่อพร้อมใช้โมเดลจริง (ต้องมี `GEMINI_API_KEY`) |

โหมด `mock` อยู่ที่ [`src/lib/mockAssistant.ts`](src/lib/mockAssistant.ts) และครอบ UX Storyboard
(Scenario C) ครบทั้งลูป:

- **Frame 1** — ดูสถานะเครื่องปกติ/ผิดปกติจากข้อมูลจริง (storyboard ระบุเองว่า Frame นี้
  "ยังไม่ใช้ AI — query DB + rule") เรียงลำดับความรุนแรงตามเกณฑ์และดัชนีสุขภาพ
- **Frame 2** — ถามตอบ แล้วเสนอเปิดใบงานซ่อมเมื่อพบสภาวะผิดปกติ โดยผู้ใช้ต้องกดยืนยันก่อน
  (human-in-the-loop) ผ่านโทเคน `[ACTION:CREATE_WORK_ORDER]` ใน [`src/lib/aiActionTokens.ts`](src/lib/aiActionTokens.ts)
- **Frame 3** — แนบคู่มืออ้างอิงประกอบคำตอบ เฉพาะกรณีที่ค้น "รหัส alarm/error ตรงตัว"
  เจอในคลังคู่มือ (ใช้ keyword search ไม่ใช้โควตา embedding)
- **Frame 4** — บันทึกทุกคำถามลง `ai_interaction_logs` พร้อมปุ่มให้ผลตอบรับนิ้วขึ้น/นิ้วลง
  (`POST /api/ai/feedback`)

### ขอบเขตที่จำกัดไว้โดยเจตนา

ตอบเฉพาะเรื่องเครื่องจักรและงานซ่อมบำรุง คำถามที่ตีความเจตนาไม่ได้จะ **ไม่ถูกเดาคำตอบ**
แต่จะบอกตรง ๆ ว่าตอบไม่ได้แล้วเสนอเมนูคำถามที่ตอบได้ (intent = `unknown` ซึ่งถูกนับไว้ใน
log เพื่อใช้เป็นรายการสิ่งที่ต้องเพิ่มในรอบถัดไป)

เจตนาที่รองรับ: `machine_status`, `sensor_readings`, `error_code`, `repair_history`,
`abnormal_fleet`, `fleet_overview`, `urgent_repair`, `pm_checklist`, `safety_loto`,
`part_replacement`

### ตรวจว่าคำถามสำเร็จรูปทุกข้อยังตอบได้

```bash
npm run check:intents
```

ปุ่มคำถามสำเร็จรูปที่หน้าจอเสนอ (`buildPresetQuestions` ใน `frontend/src/lib/aiActions.ts`)
**ทุกข้อ** ต้องถูกตีความเจตนาได้ ไม่งั้นผู้ใช้กดปุ่มที่ระบบเสนอเองแล้วได้คำตอบว่า "ยังตอบ
ไม่ได้" สคริปต์นี้จับกรณีนั้น และจะล้มเหลวถ้ารายการ preset ฝั่งหน้าจอถูกแก้โดยไม่อัปเดตสคริปต์
**ต้องรันทุกครั้งที่แก้ preset หรือแก้คำสำคัญของ intent**

### รายงานการใช้งาน (Frame 4)

```sql
-- คำถามที่ระบบยังตอบไม่ได้ = รายการสิ่งที่ต้องเพิ่มในรอบถัดไป
select prompt, count(*) from ai_interaction_logs
where intent = 'unknown' group by prompt order by count(*) desc;

-- คุณภาพคำตอบแยกตามเจตนา
select intent, count(*) as ครั้ง, count(feedback) as มีผลตอบรับ,
       sum(case when feedback = 1 then 1 else 0 end) as พอใจ
from ai_interaction_logs group by intent order by ครั้ง desc;
```

## คลังความรู้คู่มือสำหรับ AI (Manual Knowledge Index)

AI Assistant ตอบคำถามเกี่ยวกับคู่มือเครื่องจักรได้ก็ต่อเมื่อคู่มือถูก **index** แล้วเท่านั้น
การอัปโหลดคู่มือเข้าตาราง `manuals` เพียงอย่างเดียว **ไม่พอ** เพราะเนื้อหาเต็มเล่ม (คลังปัจจุบัน
รวมประมาณ 18.8 ล้านตัวอักษร) ใหญ่เกินกว่าจะใส่ลง prompt ได้ ระบบจึงตัดเนื้อหาเป็นชิ้นย่อยระดับ
"หน้า" เก็บพร้อมเวกเตอร์ความหมาย (embedding) ไว้ในตาราง `manual_chunks` แล้วตอนตอบคำถาม
ค่อยดึงเฉพาะชิ้นที่เกี่ยวข้องที่สุดเข้ามาไม่กี่ชิ้น

องค์ประกอบ:

| ไฟล์ | หน้าที่ |
| --- | --- |
| `supabase/migrations/0015_manual_chunks.sql` | ตาราง `manual_chunks`, ดัชนี HNSW/trigram และฟังก์ชันค้นหา `match_manual_chunks` / `keyword_manual_chunks` |
| `src/lib/manualChunker.ts` | ตัด Markdown เป็นชิ้นตามหัวข้อ `## หน้า N` |
| `src/lib/embeddings.ts` | เรียก `gemini-embedding-001` (768 มิติ) + L2-normalize |
| `src/lib/manualIndexer.ts` | แกนกลางการ index (ใช้ร่วมกันระหว่าง CLI กับ endpoint) |
| `src/lib/manualRetrieval.ts` | ค้นแบบผสม semantic + keyword ตอนตอบคำถาม |
| `src/lib/aiContext.ts` | นำผลค้นหาไปประกอบเป็นส่วน `[เนื้อหาจากคู่มือเครื่องจักรในระบบ]` ใน system prompt |

### รัน index

```
npm run index:manuals -- --dry-run      # ตัด chunk + รายงาน ไม่เรียก API ไม่เขียน DB
npm run index:manuals                   # รันจริงทั้งคลัง
npm run index:manuals -- --only=MR-J5   # เฉพาะคู่มือที่ชื่อมีคำนี้
npm run index:manuals -- --category="คู่มือซ่อมบำรุงและแก้ไขปัญหา"   # เฉพาะหมวดนี้ (ไล่ทีละหมวดตามความสำคัญ)
npm run index:manuals -- --force        # index ใหม่แม้เนื้อหาไม่เปลี่ยน
```

**โควตา:** Gemini free tier จำกัด embedding ที่ **100 ชิ้นข้อความต่อนาที** (ยืนยันด้วยการทดลอง: batch
ที่มี 100 รายการใช้โควตาหมดทั้งนาที — นับเป็นรายชิ้น ไม่ใช่ต่อคำขอ) การ index ทั้งคลัง ~15,700 chunk
จึงใช้เวลาอย่างน้อย ~2 ชม. 40 นาที ตัวสคริปต์เดินให้พอดีโควตาเองผ่าน rate limiter ใน
`src/lib/embeddings.ts` (ปรับเพดานได้ด้วย env `GEMINI_EMBED_RPM` หากอัปเกรดเป็น paid tier)

**ทำต่อจากที่ค้างได้:** ถ้ารอบก่อนหยุดกลางทาง (เน็ตหลุด/โควตาหมด/กด Ctrl+C) รันคำสั่งเดิมซ้ำได้เลย
ระบบจะทำต่อจาก chunk ถัดไปของเล่มที่ค้าง ไม่เริ่มใหม่จากศูนย์ (ดู `indexing_content_hash` ใน
migration 0016)

รันซ้ำได้ปลอดภัย: คู่มือที่เนื้อหาไม่เปลี่ยน (เทียบด้วย hash) จะถูกข้าม และเมื่อ index เล่มใดใหม่
จะลบ chunk เดิมของเล่มนั้นทิ้งก่อนเสมอ ผลลัพธ์แต่ละรอบเขียนไว้ที่ `scripts/index-manuals-report.json`

### index คู่มือทีละเล่มผ่าน API

```
POST /api/manuals/:id/index
Header: x-manual-admin-secret: <MANUAL_ADMIN_SECRET>
Body (ไม่บังคับ): { "force": true }
```

**หลังอัปโหลดคู่มือเล่มใหม่ทุกครั้งต้อง index ก่อน** ไม่เช่นนั้น AI จะยังหาเนื้อหาเล่มนั้นไม่เจอ
คอลัมน์ `manuals.ai_indexed` จะเป็น `true` ก็ต่อเมื่อ index สำเร็จจริงเท่านั้น (พร้อม `indexed_at`
และ `chunk_count`) — ห้ามตั้งค่านี้ด้วยมือ

### หมายเหตุเรื่องโมเดล embedding

`gemini-embedding-001` ที่ `outputDimensionality = 768` คืนเวกเตอร์ที่ **ยังไม่ normalize**
(วัดจริงได้ norm ประมาณ 0.58) โค้ดใน `src/lib/embeddings.ts` จึง L2-normalize ให้เองทั้งตอน
index และตอนค้นหา หากเปลี่ยนโมเดลหรือจำนวนมิติ ต้องแก้ `EMBEDDING_DIMENSIONS`, migrate คอลัมน์
`manual_chunks.embedding` และ re-index ใหม่ทั้งคลังพร้อมกัน มิฉะนั้นเวกเตอร์คำถามกับเวกเตอร์ใน
ฐานข้อมูลจะอยู่คนละปริภูมิและผลค้นหาจะผิดโดยไม่มี error ใด ๆ ปรากฏ

## การจัดการ Secret และขั้นตอน Rotate Key

- `.env` เก็บค่าจริง (API key, service role key) และต้องอยู่บนเครื่อง/เซิร์ฟเวอร์ของตัวเองเท่านั้น **ห้าม commit หรือส่งให้ผู้อื่นทาง chat/email** — มีแค่ `.env.example` (ค่าว่าง) เท่านั้นที่แชร์และ commit ขึ้น git ได้
- `SUPABASE_SERVICE_ROLE_KEY` เป็นคีย์ที่ **bypass Row Level Security (RLS) ทั้งหมด** ของ Supabase ต้องใช้ในฝั่ง backend (server-side) เท่านั้น ห้ามส่งไปยัง frontend, ห้าม prefix ด้วย `VITE_`, และห้ามฝังใน bundle ที่รันในเบราว์เซอร์เด็ดขาด เพราะใครก็ตามที่เห็นค่านี้จะอ่าน/เขียน/ลบข้อมูลในฐานข้อมูลได้ทั้งหมดโดยไม่ผ่านสิทธิ์ผู้ใช้
- หากสงสัยว่า key หลุด (เช่น ถูก commit ขึ้น git, หลุดไปอยู่ใน log, หรือแชร์ไฟล์ผิดที่) ให้ rotate ทันที:
  1. **Gemini API Key**: เข้า Google AI Studio → จัดการ/สร้าง API key ใหม่ → ลบ (revoke) key เดิม → นำ key ใหม่มาแทนที่ `GEMINI_API_KEY` ใน `.env`
  2. **Supabase Service Role Key**: เข้า Supabase Dashboard → เลือกโปรเจกต์ → Project Settings → API → หาส่วน service role key แล้วกด rotate/regenerate → นำค่าใหม่มาแทนที่ `SUPABASE_SERVICE_ROLE_KEY` ใน `.env` (key เดิมจะใช้ไม่ได้ทันที)
  3. Restart backend server หลัง rotate เพื่อให้โหลดค่าใหม่จาก `.env`
- ตรวจสอบเป็นระยะว่าไม่มีค่าจริงหลุดไปอยู่ในไฟล์ที่ไม่ได้ถูก ignore เช่น `dist/`, `backups/`, หรือไฟล์ log ก่อน commit หรือ deploy ทุกครั้ง
