// โทเคนที่ผู้ช่วยแนบท้ายคำตอบเพื่อสั่งให้ฝั่งหน้าจอแสดงแผงยืนยันเปิดใบงานซ่อม
// (Frame 2 ของ UX Storyboard: human-in-the-loop — AI เสนอ ผู้ใช้ยืนยัน)
//
// ต้องตรงกับ WORK_ORDER_ACTION_TOKEN ใน frontend/src/lib/aiActions.ts เป๊ะ ๆ
// ฝั่งหน้าจอใช้ hasWorkOrderAction() ตรวจสตริงนี้ตรง ๆ ถ้าสองฝั่งไม่ตรงกัน ปุ่มยืนยัน
// จะไม่ขึ้นเลยโดยไม่มี error ใด ๆ ให้เห็น
//
// แยกออกมาเป็นไฟล์ของตัวเองเพราะมีผู้ใช้สองที่แล้ว (routes/ai.ts และ lib/mockAssistant.ts)
// การปล่อยให้เป็นสตริงดิบซ้ำสองที่คือรอวันที่แก้ที่เดียวแล้วลืมอีกที่
export const WORK_ORDER_ACTION_TOKEN = "[ACTION:CREATE_WORK_ORDER]";
