# ชุดทดสอบคุณภาพคำตอบ AI (eval:ai)

แก้ปัญหา: ก่อนหน้านี้ทุกการเปลี่ยนแปลงของ AI Assistant ถูกตรวจด้วยการ curl คำถามไม่กี่ข้อด้วยมือ
ช้า ไม่คงเส้นคงวา และลืมเช็กง่าย — บั๊กที่ทำให้ "คุณภาพคำตอบ" แย่ลง (ไม่ใช่ error ที่ระบบจับได้เอง)
จึงไม่มีทางถูกจับได้จนกว่าจะมีคนมาถามเจอเอง

## วิธีรัน

1. ตั้งค่า `backend/.env` ให้พร้อม (`AI_MODE=live`, `AI_PROVIDER=claude`, มี `ANTHROPIC_API_KEY` จริง)
2. รัน backend ที่พอร์ตใดพอร์ตหนึ่ง เช่น `npm run dev` (ค่าเริ่มต้น `http://localhost:4000`)
3. อีกเทอร์มินัลหนึ่ง จากโฟลเดอร์ `backend/`:

```bash
npm run eval:ai                                  # รันทั้งชุด
npm run eval:ai -- --base-url=http://localhost:5000
npm run eval:ai -- --only=q10-regression-all000-pm-2char
npm run eval:ai -- --category=manual_lookup
npm run eval:ai -- --concurrency=4               # ค่าเริ่มต้น 2 (สุภาพกับโควตาโมเดล)
```

Exit code เป็น `0` เมื่อผ่านทุกเคส, ไม่ใช่ `0` เมื่อมีเคสไม่ผ่าน — เอาไปต่อ CI gate ได้ในอนาคต

สคริปต์จะสร้าง JWT เองด้วย `JWT_SECRET` แทนบัญชี `EMP-8042` (technician, must_change_password=false)
โดยไม่ต้อง login ผ่าน `/api/auth/login` — ไม่แตะฐานข้อมูล ไม่เขียนอะไรเลย มีแต่การอ่าน profile
เพื่อออก token และเรียก HTTP API ของ backend ที่รันอยู่แล้วเท่านั้น

ผลลัพธ์เต็มถูกเขียนไปที่ `backend/scripts/eval-ai-report.json` ทุกครั้งที่รัน (ทับของเดิม)

## ชุดคำถาม

อยู่ที่ `backend/tests/fixtures/ai-eval-set.json` — คำถามภาษาไทยจริง อ้างอิงรหัสเครื่องจักร/
ใบงาน/คู่มือที่มีอยู่จริงในฐานข้อมูล (query สดจาก Supabase ตอนสร้างไฟล์นี้ ไม่ใช่ข้อมูลสมมติ)

แต่ละเคสมีโครง:

```json
{
  "id": "...",
  "question": "...",
  "category": "machine_status | repair_history | spare_parts | pm_due | manual_lookup | analytics | multi_turn | out_of_scope | diagnose",
  "manualId": "... (optional — ทดสอบการเลือกคู่มือเจาะจงจากหน้าจอ)",
  "history": "[...] (optional — สำหรับเคส multi_turn)",
  "target": "chat (ค่าเริ่มต้น) หรือ diagnose",
  "diagnose": "{ machineCode, errorText } (จำเป็นเมื่อ target=diagnose)",
  "regression": "true (optional — เคสที่ผูกกับบั๊กที่เคยพบจริง)",
  "regressionNote": "อธิบายว่าเป็นบั๊กอะไร",
  "expect": { ... assertion ... }
}
```

### ความหมายของ assertion แต่ละตัว (ใน `expect`)

| ฟิลด์ | ความหมาย |
|---|---|
| `mustNotFallback: true` | ต้องไม่ใช้คำตอบสำรอง (`fallback` ต้องเป็น `false`) — การเรียกโมเดลจริงต้องสำเร็จ |
| `mustCiteManual: true/false` | คำตอบต้อง/ต้องไม่มีแท็ก `(อ้างอิง: ชื่อคู่มือ, หน้า)` |
| `mustCiteOnlyManualTitle: "ชื่อคู่มือ"` | ถ้ามีการอ้างอิง ต้องเป็นคู่มือเล่มนี้เท่านั้น (ทดสอบ `manualId` scoping) |
| `mustMentionAny: ["..."]` | คำตอบต้องมีอย่างน้อยหนึ่งข้อความในลิสต์นี้ (เช่น รหัสเครื่อง, เลขที่ใบงาน) |
| `mustNotFabricateCitation: true` | ต้องไม่มีแท็ก `(อ้างอิง: ...)` เลย — ใช้กับคำถามที่ไม่ควรมีข้อมูลคู่มือมารองรับ (out-of-scope หรือช่องว่างของข้อมูลที่ทราบอยู่แล้ว) |
| `mustReturnParseableJson: true` | สำหรับ `target: "diagnose"` เท่านั้น — ผลลัพธ์ต้อง parse เป็น JSON ได้ ไม่ใช่ 502 |
| `maxLatencyMs` | เวลาตอบต้องไม่เกินนี้ (มิลลิวินาที) |

## วิธีเพิ่มเคสใหม่

1. หาโค้ด/ใบงาน/คู่มือจริงในระบบ (อย่าใช้ข้อมูลสมมติ — คำถามที่อ้างรหัสที่ไม่มีจริงตรวจสอบไม่ได้ว่า
   คำตอบถูกจริงหรือ AI บังเอิญตอบถูกโดยไม่มีข้อมูลรองรับ)
2. เพิ่ม object ใหม่ใน `cases` array ของ `backend/tests/fixtures/ai-eval-set.json`
3. ตั้ง `category` ให้ตรงหมวดที่มีอยู่ (หรือเพิ่มหมวดใหม่ถ้าจำเป็นจริง ๆ)
4. ถ้าเป็นเคสที่ผูกกับบั๊กที่เพิ่งพบ ให้ใส่ `"regression": true` และ `"regressionNote"` อธิบายบั๊กสั้น ๆ
5. รันด้วย `--only=<id>` ก่อนเพื่อเช็กว่า assertion ที่ตั้งไว้สมเหตุสมผลจริง — **ห้ามปรับ assertion
   ให้ผ่านง่ายขึ้นเพียงเพื่อให้เขียว** ถ้าคำตอบผิดจริง ให้ปล่อยเคสนั้นแดงไว้แล้วรายงานเป็นบั๊กจริง —
   นั่นคือหน้าที่ของชุดทดสอบนี้
