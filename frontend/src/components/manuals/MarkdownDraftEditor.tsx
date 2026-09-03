import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AlertCircle, CheckCircle2, Eye, FileEdit, Loader2 } from "lucide-react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useMarkdownDraftEditor } from "../../hooks/useMarkdownDraftEditor";
import { markdownComponents } from "../views/ManualsView";

interface MarkdownDraftEditorProps {
  manualId: string;
  initialMarkdown: string;
  markdownApproved: boolean;
  /** เรียกทุกครั้งที่สถานะ "มีการแก้ไขที่ยังไม่บันทึก" เปลี่ยน — ให้ผู้เรียกที่มีปุ่มปิดแผงของตัวเอง
   * (เช่น ManualContentPanel) ใช้ยืนยันกับผู้ใช้ก่อนปิดตราบใดที่ยังไม่บันทึก */
  onDirtyChange?: (dirty: boolean) => void;
}

type MobileView = "source" | "preview";

/**
 * ตัวแก้ไขฉบับร่าง Markdown ที่ OCR แปลงมาจาก PDF — ต้นฉบับ (textarea) ด้านซ้าย
 * ตัวอย่างที่เรนเดอร์แล้ว (ใช้ตัวเรนเดอร์เดียวกับหน้าต่างอ่านคู่มือใน ManualsView) ด้านขวา
 * อัปเดตตัวอย่างแบบ debounce ~200ms เพื่อไม่ให้เรนเดอร์ทุกตัวอักษรที่พิมพ์
 */
export const MarkdownDraftEditor: React.FC<MarkdownDraftEditorProps> = ({
  manualId,
  initialMarkdown,
  markdownApproved,
  onDirtyChange,
}) => {
  const {
    markdown,
    setMarkdown,
    dirty,
    saving,
    saveError,
    saveSuccess,
    markdownApproved: currentApproved,
    save,
  } = useMarkdownDraftEditor(manualId, initialMarkdown, markdownApproved, onDirtyChange);

  const debouncedMarkdown = useDebouncedValue(markdown, 200);
  const [mobileView, setMobileView] = useState<MobileView>("source");

  return (
    <div className="flex flex-col h-full min-h-0">
      <DraftEditorToolbar
        dirty={dirty}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        markdownApproved={currentApproved}
        charCount={markdown.length}
        onSave={() => save(true)}
        onSaveDraft={() => save(false)}
      />

      {/* สลับต้นฉบับ/ตัวอย่างบนหน้าจอแคบ — เลย์เอาต์แบบแยกซ้าย-ขวาไม่พอที่จะอ่านทั้งสองฝั่งพร้อมกัน */}
      <div className="md:hidden flex border-b border-hairline shrink-0">
        <button
          type="button"
          onClick={() => setMobileView("source")}
          className={`flex-1 min-h-10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileView === "source" ? "text-primary border-b-2 border-primary" : "text-ink-muted"
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>ต้นฉบับ Markdown</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 min-h-10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileView === "preview" ? "text-primary border-b-2 border-primary" : "text-ink-muted"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>ตัวอย่าง</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        <div
          className={`md:w-1/2 md:border-r border-hairline min-h-0 ${
            mobileView === "source" ? "flex" : "hidden md:flex"
          } flex-col`}
        >
          <label htmlFor={`manual-draft-source-${manualId}`} className="sr-only">
            ต้นฉบับ Markdown ของคู่มือ
          </label>
          <textarea
            id={`manual-draft-source-${manualId}`}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full resize-none p-3 text-xs font-mono leading-relaxed text-ink bg-white focus:outline-none overflow-auto min-h-[240px]"
            placeholder="เนื้อหา Markdown ของคู่มือ..."
          />
        </div>

        <div
          className={`md:w-1/2 min-h-0 overflow-auto p-4 bg-parchment/40 ${
            mobileView === "preview" ? "flex" : "hidden md:flex"
          } flex-col`}
        >
          {!currentApproved && (
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-[11px] shrink-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>ฉบับร่างจาก AI — ตรวจสอบก่อนบันทึก</span>
            </div>
          )}
          <div className="text-xs sm:text-sm leading-relaxed text-ink-muted">
            <ReactMarkdown components={markdownComponents}>{debouncedMarkdown}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DraftEditorToolbarProps {
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  markdownApproved: boolean;
  charCount: number;
  onSave: () => void;
  onSaveDraft: () => void;
}

const DraftEditorToolbar: React.FC<DraftEditorToolbarProps> = ({
  dirty,
  saving,
  saveError,
  saveSuccess,
  markdownApproved,
  charCount,
  onSave,
  onSaveDraft,
}) => (
  <div className="border-b border-hairline p-3 space-y-2 shrink-0">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 min-h-9 py-1.5 rounded-full bg-primary hover:bg-primary-focus text-white text-xs font-semibold cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกคู่มือ"}
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="px-3.5 min-h-9 py-1.5 rounded-full bg-white border border-hairline text-ink-muted text-xs font-semibold hover:bg-parchment cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          บันทึกฉบับร่าง
        </button>
        {saving && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
      </div>
      <span className="text-xs text-ink-faint tabular-nums shrink-0">
        {charCount.toLocaleString()} ตัวอักษร
      </span>
    </div>

    <div className="flex items-center gap-2 flex-wrap text-xs">
      {dirty && !saving && (
        <span className="font-semibold text-amber-700">มีการแก้ไขที่ยังไม่บันทึก</span>
      )}
      {saveSuccess && !dirty && (
        <span className="flex items-center gap-1 font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {saveSuccess}
        </span>
      )}
      {saveError && (
        <span className="flex items-center gap-1 font-semibold text-rose-700">
          <AlertCircle className="w-3.5 h-3.5" />
          {saveError}
        </span>
      )}
      {!markdownApproved && !dirty && !saveSuccess && (
        <span className="text-ink-faint">ฉบับร่างจาก AI — ตรวจสอบก่อนบันทึก</span>
      )}
    </div>
  </div>
);
