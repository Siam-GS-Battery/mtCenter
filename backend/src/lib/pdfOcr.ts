// OCR คู่มือเครื่องจักร: แปลงไฟล์ PDF ที่อัปโหลดไว้ใน Supabase Storage bucket "manuals"
// เป็น Markdown ด้วย Claude แล้วอัปโหลดไฟล์ .md กลับเข้า bucket เดียวกัน พร้อมอัปเดต
// สถานะ/ผลลัพธ์ในตาราง manuals (คอลัมน์ ocr_status/ocr_error/ocr_started_at/
// ocr_completed_at/ocr_pages/markdown_path)
//
// เหมือน manualIndexer.ts ในแง่ที่เป็นงานพื้นหลังยาว ๆ ต่อคู่มือหนึ่งเล่ม แต่ต่างกันที่
// runManualOcr "ไม่โยน error ออกไป" — ผลลัพธ์ทุกกรณี (สำเร็จ/ข้าม/ล้ม) รายงานผ่าน
// OcrResult และบันทึกไว้ในแถวเสมอ เพราะฝั่ง route จะ poll สถานะจากตาราง ไม่ใช่รอ promise นี้

import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "./supabase.js";

export type OcrStatus = "pending" | "processing" | "done" | "failed" | "skipped";

export interface OcrResult {
  status: OcrStatus;
  markdownPath?: string;
  pages?: number;
  error?: string;
}

interface ManualOcrRow {
  id: string;
  title: string;
  machine_model: string | null;
  file_path: string | null;
  ocr_status: OcrStatus | null;
}

// Claude API รับไฟล์ในคำขอเดียวได้สูงสุด 32MB (รวม base64 encoding ที่ขยายขนาดขึ้น
// ~33%) กันไว้ที่ 30MB ของไฟล์ต้นฉบับเพื่อเผื่อ overhead ของ prompt/JSON และไม่ให้ชน
// เพดานจริงพอดี
const MAX_OCR_BYTES = 30 * 1024 * 1024;

// เพดานจำนวนหน้าของ PDF ที่ Claude รองรับต่อคำขอ
const MAX_OCR_PAGES = 600;

const MIN_MARKDOWN_LENGTH = 50;

const CLAUDE_OCR_MODEL = "claude-sonnet-5";

function buildOcrPrompt(title: string, machineModel: string | null): string {
  return `
คุณคือระบบแปลงเอกสาร (OCR) คู่มือเครื่องจักรอุตสาหกรรมให้เป็น Markdown

ข้อมูลบริบทของเอกสาร:
- ชื่อคู่มือ: ${title}
- รุ่นเครื่องจักร: ${machineModel || "ไม่ระบุ"}

โปรดถอดความเนื้อหาทั้งหมดในเอกสาร PDF นี้ให้ครบทุกหน้า ห้ามสรุปย่อ ห้ามตัดทอน ห้ามข้ามส่วนใดส่วนหนึ่งไป
โดยแปลงออกมาเป็น GitHub-flavored Markdown ตามกฎดังนี้:

1. โครงสร้างหัวข้อ: ใช้ "#" สำหรับหัวข้อหลัก, "##" สำหรับหัวข้อรอง, "###" สำหรับหัวข้อย่อย ตามลำดับชั้นจริงในเอกสาร
2. ตาราง: แปลงเป็น Markdown table ให้ครบทุกแถว/คอลัมน์
3. ขั้นตอนการทำงาน: ใช้ list แบบเรียงลำดับ (1. 2. 3.) หรือ bullet ("-") ตามลักษณะต้นฉบับ
4. คำเตือน/ข้อควรระวัง (Warning/Caution/Danger): ใส่เป็น blockquote ("> ...")
5. ข้อความภาษาไทยในต้นฉบับ ให้คงไว้ตามเดิมทุกตัวอักษร ห้ามแปลเป็นภาษาอื่น
6. รูปภาพ/แผนภาพ/ไดอะแกรม: ไม่ต้องพยายามวาดใหม่ ให้บรรยายสั้น ๆ ในรูปแบบตัวเอียงในวงเล็บเหลี่ยม เช่น "_[รูป: แผนภาพวงจรไฟฟ้าของสปินเดิล]_"
7. ห้ามสรุป ห้ามย่อ ห้ามตัดเนื้อหาส่วนใดออกโดยเด็ดขาด ต้องถอดความให้ครบทุกหน้าของเอกสาร
8. ตอบกลับด้วย Markdown เนื้อหาอย่างเดียวเท่านั้น ห้ามครอบด้วย code fence (เช่น \`\`\`markdown) และห้ามมีคำอธิบายอื่นใดนอกเหนือจากเนื้อหา Markdown ของเอกสาร
`.trim();
}

function stripMarkdownFence(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i.exec(trimmed);
  return (fenceMatch ? fenceMatch[1] : trimmed).trim();
}

// นับหน้าคร่าว ๆ จากจำนวนที่พบ object "/Type /Page" ที่ไม่ตามด้วย "s" (กัน "/Pages")
// ใน buffer ดิบของ PDF — เป็นการประมาณแบบเบา ไม่ parse โครงสร้าง PDF จริง จึงอาจไม่แม่นยำ
// 100% กับไฟล์ที่มีโครงสร้างซับซ้อน (เช่นบาง object ถูกบีบอัดใน object stream)
function estimatePageCount(buffer: Buffer): number | null {
  const raw = buffer.toString("latin1");
  const matches = raw.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
  if (!matches || matches.length === 0) return null;
  return matches.length;
}

function buildFrontmatter(params: {
  title: string;
  machineModel: string | null;
  sourcePath: string;
  generatedAt: string;
}): string {
  const { title, machineModel, sourcePath, generatedAt } = params;
  const escape = (value: string) => value.replace(/"/g, '\\"');
  return [
    "---",
    `title: "${escape(title)}"`,
    `machine_model: "${escape(machineModel || "")}"`,
    `source_pdf: "${escape(sourcePath)}"`,
    "generated_by: claude-ocr",
    `generated_at: "${generatedAt}"`,
    "---",
    "",
  ].join("\n");
}

function toMarkdownPath(pdfPath: string): string {
  return pdfPath.replace(/\.pdf$/i, ".md");
}

function truncateError(message: string): string {
  return message.slice(0, 500);
}

async function markFailed(manualId: string, error: string): Promise<OcrResult> {
  const message = truncateError(error);
  const { error: updateError } = await supabase
    .from("manuals")
    .update({ ocr_status: "failed", ocr_error: message })
    .eq("id", manualId);
  if (updateError) {
    console.error("pdfOcr: failed to record ocr_status='failed':", updateError);
  }
  return { status: "failed", error: message };
}

async function downloadPdfAsBuffer(filePath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from("manuals").download(filePath);
  if (error || !data) {
    throw new Error(`ดาวน์โหลดไฟล์ PDF ไม่สำเร็จ: ${error?.message ?? "ไม่พบไฟล์"}`);
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateMarkdownFromPdf(
  pdfBase64: string,
  title: string,
  machineModel: string | null
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ไม่พบค่า ANTHROPIC_API_KEY ในระบบ จึงไม่สามารถเรียก Claude เพื่อ OCR เอกสารได้");
  }

  const anthropic = new Anthropic();
  const prompt = buildOcrPrompt(title, machineModel);

  let message: Anthropic.Message;
  try {
    const stream = anthropic.messages.stream({
      model: CLAUDE_OCR_MODEL,
      max_tokens: 64000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    message = await stream.finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      throw new Error("เรียกใช้งาน Claude เกินอัตราที่กำหนด (rate limit) กรุณาลองใหม่อีกครั้งในอีกสักครู่");
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new Error("ยืนยันตัวตนกับ Claude API ไม่สำเร็จ กรุณาตรวจสอบค่า ANTHROPIC_API_KEY");
    }
    if (err instanceof Anthropic.APIError) {
      throw new Error(`เรียก Claude API เพื่อ OCR เอกสารไม่สำเร็จ: ${err.message}`);
    }
    throw err;
  }

  if (message.stop_reason === "max_tokens") {
    throw new Error(
      "คู่มือเล่มนี้มีเนื้อหายาวเกินกว่าที่ Claude จะถอดความให้ครบในครั้งเดียว (ชนขีดจำกัดจำนวนโทเค็นผลลัพธ์) " +
        "กรุณาแบ่งไฟล์ PDF เป็นหลายส่วนแล้วทำ OCR แยกทีละส่วน"
    );
  }

  if (message.stop_reason === "refusal") {
    const explanation = message.stop_details?.explanation ?? "ไม่ระบุสาเหตุ";
    throw new Error(`Claude ปฏิเสธการประมวลผลเอกสารนี้: ${explanation}`);
  }

  const resultText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  if (!resultText) {
    throw new Error("ไม่สามารถเรียก Claude เพื่อ OCR เอกสารได้ (ไม่ได้รับเนื้อหาข้อความจากโมเดล)");
  }

  return resultText;
}

/** Runs OCR for one manual synchronously (awaits completion). */
export async function runManualOcr(manualId: string): Promise<OcrResult> {
  try {
    const { data, error } = await supabase
      .from("manuals")
      .select("id,title,machine_model,file_path,ocr_status")
      .eq("id", manualId)
      .maybeSingle();

    if (error) {
      return await markFailed(manualId, `อ่านข้อมูลคู่มือไม่สำเร็จ: ${error.message}`);
    }
    if (!data) {
      return { status: "failed", error: "ไม่พบคู่มือเล่มนี้ในระบบ" };
    }

    const manual = data as ManualOcrRow;

    // กันไม่ให้เริ่มซ้ำถ้ามีงานอื่นกำลังรันอยู่แล้ว (ป้องกันแบบง่าย ไม่ใช่ distributed lock)
    if (manual.ocr_status === "processing") {
      return { status: "processing" };
    }

    if (!manual.file_path) {
      const skipError = "คู่มือเล่มนี้ไม่มีไฟล์ PDF แนบอยู่ จึงไม่สามารถทำ OCR อัตโนมัติได้";
      const { error: updateError } = await supabase
        .from("manuals")
        .update({ ocr_status: "skipped", ocr_error: skipError })
        .eq("id", manualId);
      if (updateError) console.error("pdfOcr: failed to record ocr_status='skipped':", updateError);
      return { status: "skipped", error: skipError };
    }

    const startedAt = new Date().toISOString();
    const { error: startError } = await supabase
      .from("manuals")
      .update({ ocr_status: "processing", ocr_started_at: startedAt, ocr_error: null })
      .eq("id", manualId);
    if (startError) {
      return await markFailed(manualId, `ตั้งสถานะเริ่ม OCR ไม่สำเร็จ: ${startError.message}`);
    }

    const pdfBuffer = await downloadPdfAsBuffer(manual.file_path);

    if (pdfBuffer.byteLength > MAX_OCR_BYTES) {
      const sizeMb = (pdfBuffer.byteLength / (1024 * 1024)).toFixed(1);
      return await markFailed(
        manualId,
        `ไฟล์ PDF มีขนาด ${sizeMb}MB ซึ่งใหญ่เกินกว่าที่ระบบ OCR อัตโนมัติจะประมวลผลได้ (จำกัดไว้ที่ 30MB) ` +
          `กรุณาแบ่งไฟล์เป็นหลายส่วนแล้วอัปโหลด/ทำ OCR แยกทีละส่วน`
      );
    }

    const estimatedPages = estimatePageCount(pdfBuffer);
    if (estimatedPages !== null && estimatedPages > MAX_OCR_PAGES) {
      return await markFailed(
        manualId,
        `ไฟล์ PDF มีจำนวนหน้าประมาณ ${estimatedPages} หน้า ซึ่งเกินกว่าที่ระบบ OCR อัตโนมัติจะประมวลผลได้ต่อครั้ง ` +
          `(จำกัดไว้ที่ ${MAX_OCR_PAGES} หน้า) กรุณาแบ่งไฟล์เป็นหลายส่วนแล้วอัปโหลด/ทำ OCR แยกทีละส่วน`
      );
    }

    const pdfBase64 = pdfBuffer.toString("base64");

    let rawMarkdown: string;
    try {
      rawMarkdown = await generateMarkdownFromPdf(pdfBase64, manual.title, manual.machine_model);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return await markFailed(manualId, message);
    }

    const bodyMarkdown = stripMarkdownFence(rawMarkdown);
    if (bodyMarkdown.length < MIN_MARKDOWN_LENGTH) {
      return await markFailed(
        manualId,
        "ผลลัพธ์ OCR สั้นเกินไปหรือไม่มีเนื้อหา (อาจเป็นเพราะโมเดลอ่านไฟล์ไม่สำเร็จ) กรุณาลองใหม่อีกครั้ง"
      );
    }

    const generatedAt = new Date().toISOString();
    const frontmatter = buildFrontmatter({
      title: manual.title,
      machineModel: manual.machine_model,
      sourcePath: manual.file_path,
      generatedAt,
    });
    const fullMarkdown = `${frontmatter}\n${bodyMarkdown}\n`;

    const mdPath = toMarkdownPath(manual.file_path);
    const { error: uploadError } = await supabase.storage
      .from("manuals")
      .upload(mdPath, Buffer.from(fullMarkdown, "utf8"), {
        contentType: "text/markdown",
        upsert: true,
      });
    if (uploadError) {
      return await markFailed(manualId, `อัปโหลดไฟล์ Markdown ไม่สำเร็จ: ${uploadError.message}`);
    }

    const pageCount = estimatePageCount(pdfBuffer);
    const completedAt = new Date().toISOString();

    // อัปเดตคอลัมน์ pages_count เฉพาะเมื่อประมาณจำนวนหน้าได้จริงเท่านั้น — ถ้าไม่แน่ใจ
    // (นับไม่ได้) ให้คงค่าเดิมไว้ ไม่เขียนทับด้วยค่าที่ไม่น่าเชื่อถือ
    //
    // หมายเหตุ: ผลลัพธ์ OCR ที่ได้ตรงนี้เป็นแค่ "draft" ที่ยังไม่ผ่านการตรวจจากผู้ใช้
    // ตั้งใจไม่แก้ markdown_approved ในนี้เลย (คงค่า default false ของคอลัมน์ไว้) ผู้ใช้
    // ต้องตรวจ/แก้ไขใน editor แบบ side-by-side แล้ว save/approve ผ่าน PUT /:id/content
    // เองเท่านั้น จึงจะกลายเป็นทางการ
    const updatePayload: Record<string, unknown> = {
      markdown_content: bodyMarkdown,
      markdown_path: mdPath,
      ocr_status: "done",
      ocr_completed_at: completedAt,
      ocr_pages: pageCount,
    };
    if (pageCount !== null) {
      updatePayload.pages_count = pageCount;
    }

    const { error: finalUpdateError } = await supabase.from("manuals").update(updatePayload).eq("id", manualId);
    if (finalUpdateError) {
      return await markFailed(manualId, `อัปเดตสถานะคู่มือหลัง OCR ไม่สำเร็จ: ${finalUpdateError.message}`);
    }

    return {
      status: "done",
      markdownPath: mdPath,
      pages: pageCount ?? undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("pdfOcr: unexpected error while running OCR:", err);
    return await markFailed(manualId, message);
  }
}

/**
 * Fire-and-forget: ตั้งสถานะ 'pending' ก่อน แล้วรัน runManualOcr ในพื้นหลัง
 * ไม่โยน error/ไม่ reject ออกไปเด็ดขาด (ฝั่งเรียกไม่ await) — ล็อกความล้มเหลวไว้ใน console
 * และในคอลัมน์ ocr_error ของแถวนั้นเอง
 */
export function queueManualOcr(manualId: string): void {
  Promise.resolve(
    supabase
      .from("manuals")
      .update({ ocr_status: "pending", ocr_error: null })
      .eq("id", manualId)
  )
    .then(({ error }) => {
      if (error) {
        console.error("pdfOcr: failed to mark ocr_status='pending':", error);
      }
      runManualOcr(manualId).catch((err) => {
        console.error("pdfOcr: runManualOcr rejected unexpectedly:", err);
      });
    })
    .catch((err: unknown) => {
      console.error("pdfOcr: failed to queue OCR job:", err);
    });
}
