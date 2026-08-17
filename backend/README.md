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
