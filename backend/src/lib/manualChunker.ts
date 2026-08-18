// ตัดเนื้อหาคู่มือ (Markdown) เป็นชิ้นย่อยสำหรับสร้าง embedding
//
// ไฟล์ต้นทางทุกเล่มถูกแปลงจาก PDF มาด้วยโครงสร้างเดียวกัน (ดู docs/Manual_MD/** และ
// backend/scripts/import-manuals-md.ts):
//   # <ชื่อคู่มือ>
//   - **ไฟล์ต้นฉบับ:** ...      <- หัวตารางเมทาดาทาที่ถูกแปลงเป็น bullet ตอน import
//   ---
//   ## หน้า 1
//   <เนื้อหาหน้า 1>
//   ## หน้า 2
//   ...
// "หน้า" จึงเป็นขอบเขตการตัดที่เป็นธรรมชาติที่สุด และยังให้สิ่งที่มีค่ากับผู้ใช้หน้างาน
// ด้วย นั่นคืออ้างอิงกลับได้ว่าคำตอบมาจากคู่มือเล่มไหน "หน้าที่เท่าไร"
//
// กติกาการตัด (ตามลำดับ):
//   1) หน้าที่ยาวเกิน MAX_CHUNK_CHARS -> ซอยต่อตามย่อหน้า (บรรทัดว่าง) และพก
//      ท้ายของชิ้นก่อนหน้าไปด้วย OVERLAP_CHARS ตัวอักษร กันประโยคที่คร่อมรอยตัด
//      หายไปจากทั้งสองชิ้น
//   2) หน้าสั้น ๆ ติดกัน (เช่นหน้าที่มีแต่รูป) -> ยุบรวมเป็นชิ้นเดียวจนกว่าจะถึงขนาด
//      ที่พอมีความหมาย แล้วบันทึกป้ายหน้าเป็นช่วง เช่น "หน้า 3-5"
//   3) หน้าที่ยาวกำลังดี -> เป็นหนึ่งชิ้นตามเดิม

// ~1,800 ตัวอักษรต่อชิ้น: ใหญ่พอให้ตารางรหัส alarm หนึ่งบล็อกอยู่ครบในชิ้นเดียว
// แต่ยังเล็กพอที่จะหยิบมาใส่ prompt ได้หลายชิ้นภายในงบตัวอักษรของบล็อกข้อมูลจริง
// (ดู MAX_MANUAL_CONTEXT_CHARS ใน aiContext.ts) และไม่เกินขีดจำกัด token ของ
// โมเดล embedding
const MAX_CHUNK_CHARS = 1800;
const OVERLAP_CHARS = 200;
// ชิ้นที่สั้นกว่านี้แทบไม่มีข้อมูลพอให้ embedding แยกแยะได้ จึงยุบรวมกับหน้าถัดไป
const MIN_CHUNK_CHARS = 400;
// กันขยะ: หน้าที่เหลือข้อความน้อยกว่านี้หลังตัดช่องว่าง (เช่นหน้าที่มีแต่รูปภาพ)
// ไม่คุ้มค่าที่จะสร้าง embedding และมีแต่จะทำให้ผลค้นหาเจือจาง
const MIN_KEEP_CHARS = 40;

const PAGE_HEADING_RE = /^##\s*หน้า\s*(\d+)\s*$/;
const OTHER_HEADING_RE = /^(#{1,6})\s+(.*\S)\s*$/;

export interface ManualChunk {
  chunkIndex: number;
  /** หัวข้อ Markdown ที่ครอบชิ้นนี้อยู่ (มักเป็นชื่อคู่มือสำหรับเอกสารชุดนี้) */
  heading: string | null;
  /** ป้ายหน้าอ้างอิง เช่น "หน้า 142" หรือ "หน้า 3-5" — null ถ้าเป็นส่วนหัวก่อนหน้าแรก */
  pageLabel: string | null;
  content: string;
  charCount: number;
}

interface PageSection {
  pageStart: number | null;
  pageEnd: number | null;
  heading: string | null;
  text: string;
}

function pageLabelOf(start: number | null, end: number | null): string | null {
  if (start === null) return null;
  if (end === null || end === start) return `หน้า ${start}`;
  return `หน้า ${start}-${end}`;
}

// แยกเนื้อหาทั้งเล่มออกเป็นส่วน ๆ ตามหัวข้อ "## หน้า N"
// ข้อความก่อนหัวข้อหน้าแรก (ชื่อเรื่อง + เมทาดาทา) ถูกเก็บเป็นส่วนที่ไม่มีเลขหน้า
function splitByPage(markdown: string): PageSection[] {
  const lines = markdown.split(/\r\n|\r|\n/);
  const sections: PageSection[] = [];

  let currentPage: number | null = null;
  let currentHeading: string | null = null;
  let buffer: string[] = [];

  const flush = (): void => {
    const text = buffer.join("\n").trim();
    buffer = [];
    if (text.length === 0) return;
    sections.push({ pageStart: currentPage, pageEnd: currentPage, heading: currentHeading, text });
  };

  for (const line of lines) {
    const pageMatch = line.match(PAGE_HEADING_RE);
    if (pageMatch) {
      flush();
      currentPage = Number.parseInt(pageMatch[1], 10);
      continue;
    }
    // จำหัวข้ออื่นที่ไม่ใช่หัวข้อหน้าไว้เป็น breadcrumb ให้ชิ้นถัด ๆ ไป เอกสารชุดนี้
    // ส่วนใหญ่มีแค่ "# <ชื่อคู่มือ>" บรรทัดเดียว แต่รองรับไว้เผื่อคู่มือที่อัปโหลด
    // เข้ามาใหม่มีโครงสร้างหัวข้อจริง
    const headingMatch = line.match(OTHER_HEADING_RE);
    if (headingMatch) {
      currentHeading = headingMatch[2];
    }
    buffer.push(line);
  }
  flush();

  return sections;
}

// ซอยข้อความยาวตามขอบเขตย่อหน้า โดยไม่ให้ชิ้นไหนเกิน MAX_CHUNK_CHARS
// ย่อหน้าเดี่ยวที่ยาวเกิน MAX_CHUNK_CHARS อยู่แล้ว (เช่นตารางยาว ๆ ที่ไม่มีบรรทัดว่าง)
// จะถูกตัดตามความยาวตรง ๆ เป็นทางเลือกสุดท้าย
function splitLongText(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text];

  const paragraphs = text.split(/\n{2,}/);
  const pieces: string[] = [];
  let current = "";

  const push = (): void => {
    const trimmed = current.trim();
    if (trimmed.length > 0) pieces.push(trimmed);
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK_CHARS) {
      push();
      for (let i = 0; i < paragraph.length; i += MAX_CHUNK_CHARS) {
        pieces.push(paragraph.slice(i, i + MAX_CHUNK_CHARS).trim());
      }
      continue;
    }
    if (current.length + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      push();
    }
    current = current.length === 0 ? paragraph : `${current}\n\n${paragraph}`;
  }
  push();

  // ใส่ overlap: พกท้ายของชิ้นก่อนหน้าไปเป็นหัวของชิ้นถัดไป กันข้อความที่คร่อมรอยตัด
  // หายไปจากทั้งสองชิ้น (ชิ้นแรกไม่ต้องมีเพราะไม่มีอะไรอยู่ก่อนหน้า)
  return pieces.map((piece, i) => {
    if (i === 0) return piece;
    const previous = pieces[i - 1];
    const tail = previous.slice(Math.max(0, previous.length - OVERLAP_CHARS));
    return `${tail}\n\n${piece}`;
  });
}

/**
 * ตัดเนื้อหาคู่มือทั้งเล่มเป็นชิ้นพร้อมสร้าง embedding
 * คืนอาร์เรย์ว่างถ้าเนื้อหาว่าง/สั้นเกินกว่าจะมีความหมาย
 */
export function chunkManualMarkdown(markdown: string): ManualChunk[] {
  if (typeof markdown !== "string" || markdown.trim().length === 0) return [];

  const sections = splitByPage(markdown);
  const chunks: ManualChunk[] = [];

  // บัฟเฟอร์สำหรับยุบรวมหน้าสั้น ๆ ที่อยู่ติดกัน
  let pendingText = "";
  let pendingPageStart: number | null = null;
  let pendingPageEnd: number | null = null;
  let pendingHeading: string | null = null;

  const emit = (heading: string | null, pageStart: number | null, pageEnd: number | null, content: string): void => {
    const trimmed = content.trim();
    if (trimmed.length < MIN_KEEP_CHARS) return;
    chunks.push({
      chunkIndex: chunks.length,
      heading,
      pageLabel: pageLabelOf(pageStart, pageEnd),
      content: trimmed,
      charCount: trimmed.length,
    });
  };

  const flushPending = (): void => {
    if (pendingText.trim().length === 0) {
      pendingText = "";
      return;
    }
    emit(pendingHeading, pendingPageStart, pendingPageEnd, pendingText);
    pendingText = "";
    pendingPageStart = null;
    pendingPageEnd = null;
  };

  for (const section of sections) {
    if (section.text.length < MIN_CHUNK_CHARS) {
      // หน้าสั้น: สะสมไว้ก่อน รอรวมกับหน้าถัดไป
      if (pendingText.length === 0) {
        pendingPageStart = section.pageStart;
        pendingHeading = section.heading;
      }
      pendingPageEnd = section.pageEnd;
      pendingText = pendingText.length === 0 ? section.text : `${pendingText}\n\n${section.text}`;
      if (pendingText.length >= MAX_CHUNK_CHARS) flushPending();
      continue;
    }

    // เจอหน้าขนาดปกติ: ปล่อยของที่ค้างอยู่ก่อน แล้วค่อยจัดการหน้านี้
    flushPending();
    for (const piece of splitLongText(section.text)) {
      emit(section.heading, section.pageStart, section.pageEnd, piece);
    }
  }
  flushPending();

  return chunks;
}

/**
 * ข้อความที่ส่งไปสร้าง embedding จริง — เติมชื่อคู่มือ/รุ่นเครื่อง/หน้า นำหน้าเนื้อหา
 * เพราะเนื้อหาในชิ้นเดียวมักไม่ได้บอกว่าตัวเองเป็นของเครื่องรุ่นไหน (เช่นตารางรหัส
 * alarm ที่มีแต่รหัสกับคำอธิบาย) การไม่เติมบริบทนี้ทำให้คำถามอย่าง "MR-J5 alarm 32
 * คืออะไร" ไปเจอตารางของ MR-J4 ที่หน้าตาเหมือนกันได้
 * ตัวค้นหา (manualRetrieval.ts) ต้องสร้างคำค้นด้วยรูปแบบเดียวกันนี้ในใจ
 */
export function buildEmbeddingText(params: {
  manualTitle: string;
  machineModel: string | null;
  chunk: ManualChunk;
}): string {
  const { manualTitle, machineModel, chunk } = params;
  const header = [
    `คู่มือ: ${manualTitle}`,
    machineModel ? `รุ่นเครื่อง: ${machineModel}` : null,
    chunk.pageLabel,
    chunk.heading && chunk.heading !== manualTitle ? `หัวข้อ: ${chunk.heading}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
  return `${header}\n\n${chunk.content}`;
}
