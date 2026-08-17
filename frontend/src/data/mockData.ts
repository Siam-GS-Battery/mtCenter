// This file used to hold fixture data for every entity in the app (users,
// machines, work orders, spare parts, manuals). That data has been replaced
// end-to-end by the real Excel-import-backed Supabase tables — see
// docs/data-import-spec.md. App.tsx no longer imports any of those slices
// and no longer falls back to them if the backend is unreachable.
//
// MOCK_KB_ARTICLES is the one deliberate exception: there is no `kb_articles`
// table in the database and no Excel workbook feeding a knowledge base, so
// KnowledgeBaseView (frontend/src/components/views/KnowledgeBaseView.tsx)
// keeps rendering this fixture data until a real backend for it exists.

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  updated: string;
  summary: string;
  tags: string[];
  content: string;
}

export const MOCK_KB_ARTICLES: KnowledgeArticle[] = [
  {
    id: "kb-01",
    title: "วิธีแก้ปัญหาความร้อนและแรงสั่นสะเทือนผิดปกติใน Spindle",
    category: "วิเคราะห์สาเหตุเชิงลึก",
    author: "สมหมาย เชี่ยวชาญ",
    updated: "2026-08-01",
    summary:
      "อาการส่วนใหญ่มักเกิดจากการเสื่อมสภาพของจารบีหล่อลื่นลูกปืน NSK Bearing แนะนำให้ล้างคราบเก่าและปรับแรงปั๊มน้ำมันระบายความร้อนที่ 1.5 bar",
    tags: ["CNC", "Spindle", "Bearing", "Lubrication"],
    content: `## อาการที่พบ

- อุณหภูมิ Spindle สูงเกิน 80°C ระหว่างเดินงานต่อเนื่อง
- ค่าแรงสั่นสะเทือนเพิ่มขึ้นเกิน 4.5 mm/s ที่รอบหมุนสูง
- มีเสียงครางผิดปกติจากชุดหัว Spindle

## สาเหตุที่พบบ่อย

1. จารบีหล่อลื่นลูกปืนเสื่อมสภาพหรือแห้ง
2. กรองน้ำมันระบายความร้อนอุดตัน ทำให้อัตราการไหลต่ำ
3. ลูกปืนสึกหรอจากการใช้งานเกินรอบอายุ

## แนวทางแก้ไข

1. หยุดเครื่องและทำ Lockout-Tagout ก่อนเปิดฝาครอบ Spindle
2. ตรวจสอบและล้างกรองน้ำมันระบายความร้อนแบบ Inline
3. ปรับแรงดันปั๊มน้ำมันระบายความร้อนให้อยู่ที่ 1.5 bar ตามสเปกเครื่อง
4. ล้างคราบจารบีเก่าและอัดจารบีใหม่ตามปริมาณที่คู่มือเครื่องกำหนด
5. หากค่าแรงสั่นสะเทือนยังไม่ลดลง ให้วางแผนเปลี่ยนลูกปืน NSK 7014CTYN

> ตรวจวัดค่าแรงสั่นสะเทือนซ้ำหลังเดินเครื่อง 30 นาที และบันทึกผลลงใบงานทุกครั้ง`,
  },
  {
    id: "kb-02",
    title: "มาตรฐานขั้นตอนความปลอดภัย Lockout-Tagout (LOTO) สำหรับตู้ควบคุมไฟ 380V",
    category: "มาตรฐานความปลอดภัย",
    author: "แผนกวิศวกรรมความปลอดภัย",
    updated: "2026-07-25",
    summary:
      "ก่อนเริ่มงานซ่อมบำรุงตู้ไฟทุกครั้ง ต้องทำการวัดแรงดันไฟฟ้าด้วย Multimeter ให้ได้ 0V และคล้องกุญแจส่วนบุคคล LOTO ทุกครั้ง",
    tags: ["Safety", "LOTO", "Electrical", "380V"],
    content: `## ขอบเขต

ใช้กับงานซ่อมบำรุงตู้ควบคุมไฟฟ้าแรงดัน 380V ทุกตู้ในโรงงาน ทั้งงานตามแผนและงานซ่อมฉุกเฉิน

## ขั้นตอนบังคับก่อนเริ่มงาน

1. แจ้งหัวหน้ากะและผู้ควบคุมสายการผลิตก่อนตัดไฟทุกครั้ง
2. สับเบรกเกอร์หลักของตู้ลงตำแหน่ง OFF และคล้องกุญแจส่วนบุคคล (กุญแจ 1 ดอกต่อผู้ปฏิบัติงาน 1 คน)
3. แขวนป้ายเตือน "ห้ามสับไฟ - มีผู้ปฏิบัติงาน" พร้อมระบุชื่อและเวลาเริ่มงาน
4. วัดแรงดันไฟฟ้าด้วย Multimeter ทั้ง 3 เฟส ต้องอ่านค่าได้ 0V ก่อนสัมผัสอุปกรณ์
5. ตรวจสอบว่าตัวเก็บประจุในตู้คายประจุครบตามเวลาที่คู่มือเครื่องกำหนด

## ข้อห้าม

- ห้ามใช้กุญแจร่วมกันหรือฝากผู้อื่นปลดกุญแจแทน
- ห้ามเริ่มงานหากวัดแรงดันแล้วไม่ได้ 0V ให้แจ้งวิศวกรไฟฟ้าทันที

> ผู้ปฏิบัติงานต้องผ่านการอบรม LOTO ประจำปี และบันทึกการคล้อง-ปลดกุญแจลงทะเบียนทุกครั้ง`,
  },
  {
    id: "kb-03",
    title: "เทคนิคการตั้งค่า Zero-Point Calibration สำหรับหุ่นยนต์แขนกล 6-Axis",
    category: "การปรับตั้งและสอบเทียบ",
    author: "สมหมาย เชี่ยวชาญ",
    updated: "2026-07-15",
    summary:
      "ขั้นตอนการปรับแต่งศูนย์ Robot Arm หลังเปลี่ยนมอเตอร์ AC Servo Axis 3-4 เพื่อป้องกันการคลาดเคลื่อนเกิน 0.02 mm",
    tags: ["RobotArm", "Servo", "Calibration"],
    content: `## เมื่อไหร่ต้องทำ Zero-Point Calibration

- หลังเปลี่ยนมอเตอร์ Servo หรือชุดเกียร์ Harmonic Drive
- หลังการชนหรือหยุดฉุกเฉินขณะแขนกลเคลื่อนที่ด้วยความเร็วสูง
- เมื่อพบตำแหน่งชิ้นงานคลาดเคลื่อนเกิน 0.02 mm จากจุดสอน

## ขั้นตอนการสอบเทียบ

1. เคลื่อนแขนกลไปตำแหน่ง Home Zero (ทุกแกน 0°) ด้วยโหมด Manual ความเร็วต่ำ
2. ใส่สลักล็อกแขนกล PIN-ROB-6R ก่อนถอดหรือขันชิ้นส่วนใด ๆ
3. ตรวจแนวขีด Alignment Mark ของแต่ละแกนให้ตรงกันทุกจุด
4. เข้าเมนู Teach Pendant: [MENU] -> [SETUP] -> [MASTER/CAL] แล้วเลือกแกนที่ต้องการตั้งศูนย์
5. บันทึกค่า Encoder Offset ใหม่ และทดสอบเดินโปรแกรมตรวจสอบตำแหน่งอ้างอิง 3 จุด

## เกณฑ์ผ่าน

| รายการตรวจ | เกณฑ์ |
| :--- | :--- |
| ความคลาดเคลื่อนตำแหน่งซ้ำ | ไม่เกิน 0.02 mm |
| แนวขีด Alignment ทุกแกน | ตรงกันทุกจุด |
| เสียง/ความร้อนมอเตอร์หลังทดสอบ 15 นาที | ปกติ |

> บันทึกค่า Offset ก่อนและหลังการสอบเทียบลงใบงานทุกครั้ง เพื่อใช้เทียบเมื่อเกิดปัญหาซ้ำ`,
  },
];
