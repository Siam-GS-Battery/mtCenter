import { useCallback, useEffect, useState } from "react";
import { saveManualContent, SaveManualContentResult, toUserMessage } from "../services/apiService";

export interface UseMarkdownDraftEditorResult {
  markdown: string;
  setMarkdown: (value: string) => void;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  markdownApproved: boolean;
  save: (approve: boolean) => Promise<void>;
}

/**
 * จัดการสถานะแก้ไข/บันทึกฉบับร่าง Markdown ของคู่มือหนึ่งเล่ม (ใช้โดย MarkdownDraftEditor)
 * - "dirty" คือมีการแก้ไขที่ยังไม่บันทึกเทียบกับ baseline ล่าสุดที่บันทึกสำเร็จ
 * - เตือนผู้ใช้ก่อนปิดแท็บ/รีโหลดหน้า (beforeunload) ตราบใดที่ยัง dirty อยู่ — เคลียร์ listener
 *   ให้เองเมื่อ dirty เปลี่ยนเป็น false หรือเมื่อ unmount
 * - แจ้ง `onDirtyChange` (ถ้ามี) ทุกครั้งที่ dirty เปลี่ยน เพื่อให้ผู้เรียกที่มีปุ่ม "ปิด" ของตัวเอง
 *   (เช่นแผงด้านขวาใน UploadManualView) ยืนยันกับผู้ใช้ก่อนปิดได้
 */
export function useMarkdownDraftEditor(
  manualId: string,
  initialMarkdown: string,
  initialApproved: boolean,
  onDirtyChange?: (dirty: boolean) => void
): UseMarkdownDraftEditorResult {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [baseline, setBaseline] = useState(initialMarkdown);
  const [markdownApproved, setMarkdownApproved] = useState(initialApproved);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const dirty = markdown !== baseline;

  useEffect(() => {
    onDirtyChange?.(dirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const save = useCallback(
    async (approve: boolean) => {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);
      try {
        const result: SaveManualContentResult = await saveManualContent(manualId, markdown, approve);
        setBaseline(markdown);
        setMarkdownApproved(result.markdownApproved);
        setSaveSuccess(
          result.warning
            ? `บันทึกสำเร็จ (${result.warning})`
            : approve
            ? "บันทึกคู่มือสำเร็จ"
            : "บันทึกฉบับร่างสำเร็จ"
        );
      } catch (err) {
        setSaveError(toUserMessage(err, "บันทึกเนื้อหาคู่มือไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"));
      } finally {
        setSaving(false);
      }
    },
    [manualId, markdown]
  );

  return { markdown, setMarkdown, dirty, saving, saveError, saveSuccess, markdownApproved, save };
}
