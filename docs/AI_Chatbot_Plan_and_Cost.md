# แผนพัฒนา AI Chatbot ให้ถามตอบได้ทั้งระบบ + วิเคราะห์ต้นทุน

> จัดทำ: 2026-08-20

## 1. สถานะปัจจุบันของระบบ

ระบบมีของพร้อมอยู่แล้วหลายส่วน:

- [../backend/src/routes/ai.ts](../backend/src/routes/ai.ts) — Gemini (`@google/genai`), 2 โหมด `mock` / `live`, non-streaming
- **RAG คู่มือมีจริงแล้ว** — [../backend/src/lib/embeddings.ts](../backend/src/lib/embeddings.ts) (`gemini-embedding-001`, 768 มิติ) + [../backend/src/lib/manualRetrieval.ts](../backend/src/lib/manualRetrieval.ts) hybrid search (vector + keyword) บน pgvector
- Context ป้อนโมเดลผ่าน [../backend/src/lib/aiContext.ts](../backend/src/lib/aiContext.ts) — แต่เป็น **context แบบ hardcode/ยัดล่วงหน้า** (ภาพรวมโรงงาน + เครื่องผิดปกติ + เครื่องที่ถูกพูดถึง)
- Action เป็นแค่ text token `[ACTION:CREATE_WORK_ORDER]` ที่ frontend มา parse เอง — **ไม่ใช่ function calling จริง**

**คอขวดหลัก:** AI ตอบได้เฉพาะเรื่องที่ `aiContext.ts` เผอิญยัดมาให้ ถามอะไรนอกนั้น (อะไหล่ / PM / การเบิก / คลังความรู้ / สถิติ) ตอบไม่ได้ หรือมั่ว

---

## 2. สิ่งที่ต้องสร้างเพิ่ม

### 2.1 Tool Layer / Function Calling — สำคัญที่สุด

เปลี่ยนจาก "ยัด context ล่วงหน้า" เป็น "ให้ AI เลือกดึงเอง" ด้วย Gemini function declarations

สร้าง `backend/src/lib/aiTools/` ประกาศ tool ครอบ API ที่ **มีอยู่แล้ว**:

| Tool | ครอบโดเมน |
|---|---|
| `search_machines`, `get_machine_detail`, `get_telemetry_trend` | เครื่องจักร |
| `search_work_orders`, `get_work_order`, `get_wo_stats` | ใบงาน |
| `search_spare_parts`, `get_part_stock`, `get_withdrawal_history` | อะไหล่ |
| `get_pm_plans`, `get_pm_summary` | แผน PM |
| `search_manuals` (ต่อของเดิม), `search_knowledge` | คู่มือ/ความรู้ |
| `create_work_order` (write — ต้อง confirm) | เขียน |

**หัวใจ:** tool ทุกตัวต้องรับ `actorRole` แล้วบังคับ permission ซ้ำในชั้น tool — ห้ามให้ AI bypass `requireRole` ที่มีอยู่ (เช่น technician ถาม "ต้นทุนอะไหล่ทั้งโรงงาน" ต้องถูกปฏิเสธ)

### 2.2 Text-to-SQL แบบจำกัดขอบ (สำหรับคำถามสถิติ)

คำถามอย่าง "เดือนนี้เครื่องไหนเสียบ่อยสุด" / "MTTR เฉลี่ยไลน์ A" tool แบบ fix param ตอบไม่ไหว

→ ทำ read-only view + SQL role ที่ `SELECT` ได้อย่างเดียว, whitelist ตาราง, บังคับ `LIMIT`, timeout — แล้วให้ AI generate SQL ลงในกรอบนั้น **อย่าเปิดกว้าง**

### 2.3 ขยาย RAG ให้เกินคู่มือ

ตอนนี้ embed แค่ `manual_chunks` → เพิ่ม embedding ให้ **knowledge_articles** และ **ประวัติ work_orders ที่ปิดแล้ว** (`cause` + `repair_action`) ใช้ pipeline เดิมได้เลย

นี่คือ "ประสบการณ์ช่าง" ที่มีค่าที่สุดในระบบ และตอนนี้ AI มองไม่เห็น

### 2.4 Streaming (SSE)

tool calling จะทำให้ latency พุ่งเป็น 5–15 วินาที ผู้ใช้จะรู้สึกว่าค้าง → ต้องเปลี่ยน `/api/ai/chat` เป็น SSE และแสดงสถานะ "กำลังค้นคลังอะไหล่..." ระหว่างเรียก tool

### 2.5 Eval Set + Guardrail

ระบบมี `ai_interaction_logs` + feedback อยู่แล้ว — ต่อยอดเป็นชุดคำถามทดสอบ 50–100 ข้อ ครอบทุกโดเมน ไว้รันทุกครั้งที่แก้ prompt/เปลี่ยนโมเดล ไม่งั้นแก้ตรงหนึ่งพังอีกตรง

---

## 3. การเลือกโมเดล

แนะนำ **แยกโมเดลตามงาน** ไม่ใช่ใช้ตัวเดียวทั้งระบบ:

| งาน | แนะนำ | เหตุผล |
|---|---|---|
| **Router / คำถามง่าย** | Flash-lite tier | ~70% ของคำถามคือ "เครื่อง X สถานะไง" — ไม่ต้องใช้โมเดลใหญ่ |
| **Tool calling + วิเคราะห์** | Pro tier | tool calling หลายชั้น + reasoning ต้องการโมเดลแม่น ไม่งั้นเรียก tool ผิด/มั่วพารามิเตอร์ |
| **วิเคราะห์ภาพ (`/diagnose`)** | Pro tier (vision) | รูปเครื่องเสียต้องการความละเอียด |
| **Embedding** | `gemini-embedding-001` (ของเดิม) | ทำงานดีแล้ว ไม่ต้องเปลี่ยน |

**ข้อควรระวัง:**

1. รายชื่อ fallback ใน [../backend/src/routes/ai.ts](../backend/src/routes/ai.ts) ควรย้ายไปเป็น env var แทน hardcode
2. **อย่าผูกติด Gemini แข็ง** — ทำ abstraction layer บาง ๆ (`LLMProvider` interface) เพราะ tool calling schema ของ Gemini / Claude / OpenAI ต่างกันเล็กน้อย ถ้าวันหนึ่งอยากเทียบราคา/คุณภาพจะเปลี่ยนได้ใน 1 วัน แทนที่จะรื้อทั้งระบบ

---

## 4. ลำดับการพัฒนาที่แนะนำ

| Phase | งาน | เหตุผล |
|---|---|---|
| 1 | Tool layer + permission guard | ได้ผลเยอะสุด ใช้ API เดิมทั้งหมด |
| 2 | SSE streaming | UX — ป้องกันความรู้สึกว่าระบบค้าง |
| 3 | ขยาย RAG ไป knowledge + ประวัติซ่อม | ปลดล็อกความรู้ที่มีอยู่แล้ว |
| 4 | Text-to-SQL แบบจำกัดขอบ | รองรับคำถามสถิติ |
| 5 | Eval set + model routing แยก tier | คุมคุณภาพ + คุมต้นทุน |

---

## 5. วิเคราะห์ต้นทุน

### 5.1 สมมติฐานที่ใช้คำนวณ

| รายการ | ค่า | ที่มา |
|---|---|---|
| ผู้ใช้ในระบบ | 43 คน | `backend/backups/manual-profiles-before-demo-rename.json` |
| ผู้ใช้ active | ~30 คน × 5 คำถาม/วัน × 22 วัน | **≈ 3,300 คำถาม/เดือน** |
| Token/คำถาม (ปัจจุบัน) | in ~7,000 / out ~800 | `MAX_CONTEXT_CHARS = 14000` ใน [../backend/src/lib/aiContext.ts](../backend/src/lib/aiContext.ts) + system prompt |
| Token/คำถาม (หลังมี tool calling) | in ~21,000 / out ~1,500 | tool calling วน 2–3 รอบ context สะสม |
| อัตราแลกเปลี่ยน | 36 บาท/USD | — |

### 5.2 ราคา Gemini

อ้างอิง ai.google.dev/gemini-api/docs/pricing — อัปเดต 13 ส.ค. 2026

| Model | Input $/1M | Output $/1M |
|---|---|---|
| gemini-2.5-flash-lite | 0.10 | 0.40 |
| gemini-2.5-flash | 0.30 | 2.50 |
| gemini-3.1-flash-lite | 0.25 | 1.50 |
| gemini-3.5-flash-lite | 0.30 | 2.50 |
| **gemini-3.5-flash** ← ที่ใช้อยู่ | **1.50** | **9.00** |
| gemini-2.5-pro | 1.25 | 10.00 |
| gemini-3.1-pro-preview | 2.00 | 12.00 |
| gemini-embedding-001 | 0.15 | — |

### 5.3 ประเด็นสำคัญ — ประหยัดได้ทันทีโดยไม่ต้องเขียนโค้ดใหม่

**โมเดลตัวแรกใน fallback list ปัจจุบัน (`gemini-3.5-flash` = $1.50/$9.00) แพงกว่า `gemini-2.5-flash` ($0.30/$2.50) ถึง 5 เท่า (input) และ 3.6 เท่า (output)** โดยที่งานถาม-ตอบระดับนี้แทบไม่ต่างกัน

แค่สลับลำดับ fallback ใน [../backend/src/routes/ai.ts](../backend/src/routes/ai.ts) ก็ประหยัดได้ทันที ~75%

### 5.4 ค่า API รายเดือน @ 3,300 คำถาม (หลังทำ tool calling ครบ)

| โมเดลที่เลือก | ต่อคำถาม | ต่อเดือน | ต่อปี |
|---|---|---|---|
| 2.5-flash-lite (ถูกสุด) | $0.0027 | ≈ 320 บาท | 3,800 บาท |
| 3.1-flash-lite | $0.0075 | ≈ 890 บาท | 10,700 บาท |
| 2.5-flash | $0.010 | ≈ 1,190 บาท | 14,300 บาท |
| **Hybrid (แนะนำ)** — 80% flash + 20% pro | **$0.0162** | **≈ 1,930 บาท** | **≈ 23,000 บาท** |
| 2.5-pro ล้วน | $0.041 | ≈ 4,900 บาท | 59,000 บาท |
| **3.5-flash (ปัจจุบัน) ล้วน** | $0.045 | ≈ 5,350 บาท | 64,000 บาท |
| 3.1-pro-preview ล้วน | $0.060 | ≈ 7,130 บาท | 86,000 บาท |

### 5.5 ค่า Embedding

| รายการ | ค่าใช้จ่าย |
|---|---|
| คู่มือ 23 ไฟล์ index ครั้งแรก | < 20 บาท (one-time) |
| เพิ่ม knowledge_articles + ประวัติ work_orders | < 30 บาท (one-time) |
| Query embedding รายเดือน | < 10 บาท |

→ แทบไม่ต้องนำมาคิด

### 5.6 เทียบกับ Cost_Benefit_Analysis.md

เอกสาร [Cost_Benefit_Analysis.md](./Cost_Benefit_Analysis.md) ตั้ง OpEx ไว้ **1,600,000 บาท/ปี** (Scenario A — Cloud)

ค่า LLM ที่คำนวณได้ ≈ **23,000 บาท/ปี = 1.4% ของ OpEx**

**แปลว่าค่า API ไม่ใช่ต้นทุนที่ต้องกังวล** — ตัวที่กินเงินจริงคือค่าพัฒนา:

| Phase | แรงคน | ประมาณ |
|---|---|---|
| 1. Tool layer + permission | 15–20 คน-วัน | 90,000–160,000 บาท |
| 2. SSE streaming | 4–6 คน-วัน | 25,000–48,000 บาท |
| 3. ขยาย RAG | 6–8 คน-วัน | 36,000–64,000 บาท |
| 4. Text-to-SQL | 8–12 คน-วัน | 48,000–96,000 บาท |
| 5. Eval + routing | 5–8 คน-วัน | 30,000–64,000 บาท |
| **รวม** | **38–54 คน-วัน** | **230,000–430,000 บาท** |

ตัวเลขนี้อยู่ในกรอบ CapEx 3.6M ที่ตั้งไว้แล้ว

---

## 6. ความเสี่ยงด้านต้นทุนที่ต้องแก้ก่อนเปิด live

1. **ไม่ได้ตั้ง `maxOutputTokens`** — [../backend/src/routes/ai.ts](../backend/src/routes/ai.ts) ส่งแค่ `temperature: 0.3` ถ้าโมเดลตอบยาวผิดปกติ ค่าใช้จ่ายพุ่งได้ไม่จำกัด → ควรตั้ง cap (เช่น 2,048) และเพิ่ม rate limit ต่อผู้ใช้
2. **`index-manuals-report.json` แสดง error 429 (quota)** — index ได้แค่ 6/24 คู่มือ แปลว่ายังอยู่ free tier → ต้องเปิด billing ก่อน ไม่งั้น RAG ไม่ครบ

---

## 7. หมายเหตุความน่าเชื่อถือของข้อมูล

- ราคาทั้งหมดมาจาก ai.google.dev หน้าเดียว (cross-check กับผลค้นเว็บอิสระแล้วตรงกัน) — หน้า Vertex AI pricing ดึงไม่สำเร็จ **ถ้าจะ deploy ผ่าน Vertex ควรเช็กราคาซ้ำ** เพราะโครงสร้างราคาอาจต่างกัน
- ราคา `gemini-3.7-flash` / `gemini-3.6-flash` ($0.75/$3.75) เป็นราคาโปรโมชันถึง 31 ธ.ค. 2026 หลังจากนั้นขึ้นเป็น 2 เท่า — ไม่ได้นำมาคำนวณในตารางข้างต้น
- จำนวน manual chunks รวมทั้งระบบยังไม่มีตัวเลขยืนยันแน่นอน (ประมาณหลักพัน chunks)
