// ตรวจจับหน้า "สารบัญ" (table of contents) ในคู่มือที่ตัดเป็นก้อนต่อหน้าแล้ว (## หน้า N)
// เพื่อให้หน้าต่างอ่านคู่มือซ่อนหน้าเหล่านี้ไว้เป็นค่าเริ่มต้น ไม่ให้ผู้ใช้ต้องเลื่อนผ่านตอนเปิดอ่าน
//
// เป็น pure function ล้วน ๆ ไม่พึ่ง React และไม่แก้ไขเนื้อหาต้นฉบับ — ใช้แค่ตัดสินว่า "จะแสดง/ซ่อน" หน้าไหน
// เกณฑ์ทั้งหมดมาจากการวิเคราะห์คู่มือจริง 23 เล่มในคลัง (docs/Manual_MD) ห้ามปรับแก้ตามความรู้สึก
// โดยไม่ตรวจกับไฟล์จริงก่อน — ดู PR/task ต้นทางสำหรับรายละเอียดการวิเคราะห์

// --- Leader-line patterns: เส้นประ/จุด/ขีดที่คั่นระหว่างชื่อหัวข้อกับเลขหน้าในสารบัญ ---
export const LEADER_PATTERNS: RegExp[] = [
  /\.{4,}/, // จุดต่อกันแบบทึบ (solid dot leaders) เช่น "บทที่ 1....... 5" — MR-J3 Manual.md
  /(?:\.\s){3,}\./, // จุดเว้นวรรค (spaced dot leaders) — SGD7S.md, MR-J5 Hardware.md ได้คะแนน 0 จากแพทเทิร์นข้างบน
  // จึงต้องมีแพทเทิร์นนี้แยกไว้ ไม่เช่นนั้นสารบัญของคู่มือทั้งสองเล่มนี้จะตรวจไม่พบเลย
  /…{2,}/, // อักขระ ellipsis ต่อกัน (…) เช่น LP-RF200P_NAVI_Smart_Basic_TH.md
  /(?:-\s){3,}-/, // ขีดเว้นวรรคต่อกัน (dash leaders) เช่น back INDEX ของ SGD7S.md
];

// ห้ามเพิ่มกฎที่อิงเลขหน้าท้ายบรรทัด (เช่น /\d+-\d+\s*$/ หรือ /\s\d{1,4}\s*$/) แม้จะดูเหมือนช่วยแยกสารบัญได้ดีขึ้น —
// หน้า wiring diagram และ dimension จะได้คะแนนสูงลิบ (150+) เพราะทุก callout label ลงท้ายด้วยเลข
// การเพิ่มกฎแบบนี้จะบังหน้าที่มีค่าที่สุดในคู่มือทั้งคลังไปโดยไม่ตั้งใจ

/** นับจำนวนบรรทัดในหน้าที่เข้าเกณฑ์ "leader line" อย่างน้อยหนึ่งแพทเทิร์น */
export function countLeaderLines(pageText: string): number {
  const lines = pageText.split(/\r?\n/);
  let count = 0;
  for (const line of lines) {
    if (LEADER_PATTERNS.some((re) => re.test(line))) count++;
  }
  return count;
}

// --- Keyword anchor: บรรทัดที่ "เกือบจะเป็นแค่" คำสำคัญของสารบัญ ---
// รวมการสะกดผิดจาก OCR จริงที่พบใน MD-X_TH.md ("เนือ้หา" สลับตำแหน่งไม้เอก) ไว้ด้วย
const TOC_KEYWORDS: string[] = [
  "TABLE OF CONTENTS",
  "CONTENTS",
  "สารบัญ",
  "เนื้อหา",
  "เนือ้หา",
  "目次",
  "INDEX",
];

// เพดานความยาวของสิ่งที่เหลืออยู่ในบรรทัด หลังตัดคำสำคัญและอักขระที่ไม่ใช่ตัวอักษร/ตัวเลขออกหมด —
// เกณฑ์นี้คือตัวกันไม่ให้ running header บนหน้าเนื้อหาจริง (เช่น "...บทที่ 3 การซ่อมบำรุง — INDEX — หน้า 45")
// ถูกจับเป็นจุดยึดสารบัญไปด้วย
//
// ค่านี้เดิมตั้งไว้ที่ 24 แต่พบว่าหลวมเกินไป: หัวตาราง (table column header) และคำบรรยายรูป (figure caption)
// อย่าง "Index (ดัชนี) 3" หรือ "INDEX Chapter 5" ก็สั้นพอที่จะผ่านเพดาน 24 ได้เช่นกัน ทั้งที่ไม่ใช่หน้าสารบัญ
// จึงลดเหลือ 4 — ให้แคบพอสำหรับ noise เล็กน้อยจริง ๆ (เช่นเลขบทหลักเดียว) แต่ไม่หลวมพอจะรับหัวตาราง/คำบรรยายรูป
export const ANCHOR_MAX_REMAINDER = 4;

// เพดาน leaderCount / ความยาวข้อความ สำหรับตัดสินว่าหน้าที่เป็น anchor นับเป็นหน้าสารบัญจริงหรือไม่
export const TOC_MIN_LEADER_COUNT = 6;
export const TOC_MAX_TEXT_LENGTH = 2000;

// เพดาน leaderCount สำหรับการขยายไปหน้าถัดไปต่อจากหน้าสารบัญที่ตรวจพบแล้ว
// สารบัญจริงมักมี 30-55 leader lines ต่อหน้า ส่วน checklist ภาษาญี่ปุ่นบางเล่มได้แค่ 8 — เพดานนี้แยกสองกรณีได้พอดี
export const TOC_EXTEND_MIN_LEADER_COUNT = 15;

/**
 * ตรวจหาคำสำคัญสารบัญ (TOC_KEYWORDS) ในบรรทัดเดียว — คืนความยาวของสิ่งที่ "เหลืออยู่" หลังตัดคำสำคัญและ
 * อักขระที่ไม่ใช่ตัวอักษร/ตัวเลขออกหมด (จำนวนน้อยที่สุดถ้าบรรทัดมีคำสำคัญมากกว่าหนึ่งคำ) หรือ null ถ้าไม่พบคำสำคัญเลย
 * คืนตัวเลขแทนบูลีน เพื่อให้ผู้เรียกตัดสินใจแยกกันได้ว่าจะยอมรับ remainder แค่ไหนในแต่ละเกณฑ์ (ดู detectTocPages)
 */
function isAnchorLine(line: string): number | null {
  const upperLine = line.toUpperCase();
  let best: number | null = null;
  for (const keyword of TOC_KEYWORDS) {
    const idx = upperLine.indexOf(keyword.toUpperCase());
    if (idx === -1) continue;
    const withoutKeyword = line.slice(0, idx) + line.slice(idx + keyword.length);
    const remainder = withoutKeyword.replace(/[^\p{L}\p{N}]/gu, "");
    if (best === null || remainder.length < best) best = remainder.length;
  }
  return best;
}

/** เช่นเดียวกับ isAnchorLine แต่ไล่ดูทุกบรรทัดในหน้า แล้วคืนค่า remainder ที่น้อยที่สุดที่พบในหน้านั้น (หรือ null) */
function pageAnchorRemainder(pageText: string): number | null {
  let best: number | null = null;
  for (const line of pageText.split(/\r?\n/)) {
    const remainder = isAnchorLine(line);
    if (remainder === null) continue;
    if (best === null || remainder < best) best = remainder;
  }
  return best;
}

export interface TocDetectionResult {
  /** ดัชนี (0-based) ในอาร์เรย์ page chunks ที่ถูกจัดว่าเป็นหน้าสารบัญ */
  tocIndices: Set<number>;
  /** จำนวนหน้าที่ถูกจัดว่าเป็นสารบัญ (เท่ากับ tocIndices.size ไว้เผื่อเรียกใช้แบบไม่ต้องแตะ Set) */
  count: number;
}

/**
 * รับอาร์เรย์ก้อนเนื้อหาต่อหน้า (แต่ละสมาชิกคือเนื้อหาของหนึ่งหน้า "## หน้า N" — ไม่รวมส่วนนำก่อนหน้าแรก)
 * แล้วคืนดัชนีของหน้าที่จัดว่าเป็นสารบัญ ตามเกณฑ์:
 *   1. หน้าใดที่เป็น "anchor" (มีบรรทัดที่เกือบจะเป็นแค่คำสำคัญสารบัญ ดู pageAnchorRemainder) และเข้าเงื่อนไข
 *      ข้อใดข้อหนึ่ง:
 *        ก) remainder <= ANCHOR_MAX_REMAINDER (4) และ leaderCount >= 6 — สารบัญจริงที่มี leader line เพียบ
 *           ยอมให้มี noise เล็กน้อยรอบคำสำคัญได้ เพราะ leader line จำนวนมากยืนยันอยู่แล้วว่าไม่ใช่หัวตาราง/คำบรรยายรูป
 *        ข) remainder === 0 (ต้องเป็นคำสำคัญ "เปล่า ๆ" ล้วน ๆ ไม่มีอักขระอื่นเจือปนเลย) และความยาว < 2000 ตัวอักษร
 *           — ต้องเข้มกว่าข้อ ก) เพราะหน้าสั้นไม่มี leader line มายืนยัน ถ้าให้ remainder <= 4 เหมือนกันจะดัน
 *           หัวตาราง/คำบรรยายรูปที่สั้นโดยธรรมชาติ (เช่น "Index 3", "รูปที่ 5 Contents") ให้ผ่านไปด้วย
 *           ความยาวเพดานเดียวแยกไม่ออกระหว่างหัวตาราง/คำบรรยายรูปกับหัวข้อสารบัญจริง ต้องบังคับว่าเป็นคำเปล่าเท่านั้น
 *   2. จากหน้าสารบัญที่พบแต่ละหน้า ให้ขยายไปหน้าถัดไปต่อเนื่องไปเรื่อย ๆ ตราบใดที่ leaderCount ของหน้านั้น >= 15
 *      หยุดขยายทันทีที่พบหน้าที่ต่ำกว่าเพดาน (ไม่มีการขยายย้อนกลับ ไม่มีกฎ "N หน้าแรก" ใด ๆ)
 *
 * ทำงานแบบ single-pass ต่อหน้า (คำนวณ leaderCount/anchor ของแต่ละหน้าครั้งเดียว) เหมาะกับคู่มือที่มีได้ถึง
 * ~700 หน้า/2.6MB โดยไม่ต้อง reparse ซ้ำ
 */
export function detectTocPages(pageChunks: string[]): TocDetectionResult {
  const tocIndices = new Set<number>();
  const leaderCounts: number[] = new Array(pageChunks.length);

  for (let i = 0; i < pageChunks.length; i++) {
    const text = pageChunks[i];
    const leaderCount = countLeaderLines(text);
    leaderCounts[i] = leaderCount;
    const remainder = pageAnchorRemainder(text);
    const anchorForLeaders = remainder !== null && remainder <= ANCHOR_MAX_REMAINDER;
    const anchorBareKeyword = remainder === 0;
    if (
      (anchorForLeaders && leaderCount >= TOC_MIN_LEADER_COUNT) ||
      (anchorBareKeyword && text.length < TOC_MAX_TEXT_LENGTH)
    ) {
      tocIndices.add(i);
    }
  }

  // ขยายไปข้างหน้า: ใช้ snapshot ของหน้าที่ตรวจพบเป็น anchor ก่อนขยาย (seeds) แล้วเดินหน้าทีละหน้าจากแต่ละ seed
  const seeds = Array.from(tocIndices);
  for (const seed of seeds) {
    let next = seed + 1;
    while (next < pageChunks.length && leaderCounts[next] >= TOC_EXTEND_MIN_LEADER_COUNT) {
      tocIndices.add(next);
      next++;
    }
  }

  return { tocIndices, count: tocIndices.size };
}
