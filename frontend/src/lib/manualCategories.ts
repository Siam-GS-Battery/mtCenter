// Single source of truth for the manual (คู่มือ) category list and the
// "custom machine model" sentinel used by the upload/edit forms.
//
// UploadManualView and ManualsView both render a category <select> against
// this same list. If a category were ever added to only one of them, an
// existing manual's category value would fall out of the other view's
// dropdown — the <select value={...}> would match no <option>, and the
// dialog would silently display the wrong category while still holding the
// real value, making a save look like a no-op. Keeping one shared list
// keeps that impossible by construction.

/**
 * หมวดหมู่คู่มือที่ใช้อยู่จริงในคลังคู่มือของระบบนี้
 * value คือค่าที่บันทึกลงฐานข้อมูล (คงไว้ตามเดิมเพราะข้อมูลเก่าอ้างอิงค่านี้)
 * label คือข้อความภาษาไทยที่แสดงให้ผู้ใช้เห็น
 */
export interface ManualCategoryOption {
  value: string;
  label: string;
}

export const MANUAL_CATEGORIES: ManualCategoryOption[] = [
  { value: "General", label: "ทั่วไป" },
  { value: "คู่มือซ่อมบำรุงและแก้ไขปัญหา", label: "คู่มือซ่อมบำรุงและแก้ไขปัญหา" },
  { value: "ไดอะแกรมไฟฟ้าและไฮดรอลิก", label: "ไดอะแกรมไฟฟ้าและไฮดรอลิก" },
  {
    value: "ขั้นตอนการเปลี่ยนอะไหล่และตั้งศูนย์",
    label: "ขั้นตอนการเปลี่ยนอะไหล่และตั้งศูนย์",
  },
];

/** ค่าพิเศษของ select รุ่นเครื่องจักรที่บอกว่าผู้ใช้ต้องการพิมพ์รุ่นเอง */
export const CUSTOM_MODEL_OPTION = "__custom__";
