import React, { useEffect, useState } from "react";
import { AlertCircle, FileSearch, Loader2, X } from "lucide-react";
import { ManualOcrStatus, getManualContentDetail, ManualContentDetail, toUserMessage } from "../../services/apiService";
import { MarkdownDraftEditor } from "./MarkdownDraftEditor";

interface ManualContentPanelProps {
  manualId: string;
  title: string;
  onClose: () => void;
  /** สถานะ OCR ล่าสุด — ส่งมาจาก parent (UploadManualView) ซึ่งเป็นเจ้าเดียวที่ poll
   * useManualOcrStatus เพื่อไม่ให้ poll ซ้ำกับ OcrProgressPanel ในการ์ดด้านซ้าย */
  ocrStatus: ManualOcrStatus | null;
}

/**
 * แผงด้านขวาของหน้าอัปโหลดคู่มือ — แสดงความคืบหน้าการแปลง PDF → Markdown ด้วย AI
 * (สถานะรับมาจาก parent แล้ว ไม่ poll เอง) แล้วเปิดตัวแก้ไข
 * ฉบับร่าง (MarkdownDraftEditor) ให้ทันทีที่แปลงเสร็จ เพื่อให้ผู้ใช้ตรวจสอบ/แก้ไขก่อนบันทึกจริง
 */
export const ManualContentPanel: React.FC<ManualContentPanelProps> = ({
  manualId,
  title,
  onClose,
  ocrStatus: ocrStatusResult,
}) => {
  const ocrStatus = ocrStatusResult?.ocrStatus ?? null;

  const [detail, setDetail] = useState<ManualContentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchNonce, setFetchNonce] = useState(0);
  const [editorDirty, setEditorDirty] = useState(false);

  useEffect(() => {
    if (ocrStatus !== "done") return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getManualContentDetail(manualId)
      .then((res) => {
        if (cancelled) return;
        setDetail(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(toUserMessage(err, "ไม่สามารถโหลดเนื้อหาคู่มือสำหรับตรวจสอบได้"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [manualId, ocrStatus, fetchNonce]);

  const handleClose = () => {
    // มีการแก้ไขที่ยังไม่บันทึก — ยืนยันกับผู้ใช้ก่อนปิดแผง ไม่ให้เนื้อหาที่แก้ไว้หายไปเงียบ ๆ
    if (editorDirty && !window.confirm("มีการแก้ไขที่ยังไม่บันทึก ต้องการปิดแผงนี้หรือไม่?")) {
      return;
    }
    onClose();
  };

  return (
    <div className="bg-white border border-hairline rounded-[18px] flex flex-col h-[70vh] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-4 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-hairline shrink-0">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-ink truncate">ตรวจสอบเนื้อหา Markdown</h4>
          <p className="text-xs text-ink-muted truncate">{title}</p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 rounded-full hover:bg-primary/5 text-ink-muted cursor-pointer shrink-0"
          aria-label="ปิดแผงตรวจสอบเนื้อหา"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {ocrStatus !== "done" ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-2 max-w-xs">
              {ocrStatus === "failed" ? (
                <>
                  <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="text-sm font-semibold text-rose-800">แปลงไม่สำเร็จ</p>
                  <p className="text-xs text-ink-muted">
                    ลองแปลงใหม่ในการ์ดด้านซ้าย เนื้อหาจะแสดงที่นี่หลังแปลงสำเร็จ
                  </p>
                </>
              ) : ocrStatus === "skipped" ? (
                <>
                  <FileSearch className="w-8 h-8 text-ink-muted mx-auto" />
                  <p className="text-sm font-semibold text-ink">ข้ามการแปลงคู่มือเล่มนี้</p>
                </>
              ) : (
                <>
                  <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                  <p className="text-sm font-semibold text-ink">
                    {ocrStatus === "processing"
                      ? "กำลังอ่านไฟล์ PDF ด้วย AI…"
                      : "รอแปลงเป็น Markdown…"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    ตัวแก้ไขฉบับร่างจะเปิดขึ้นที่นี่โดยอัตโนมัติเมื่อแปลงเสร็จ
                  </p>
                </>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-sm font-semibold text-rose-800">{loadError}</p>
              <button
                type="button"
                onClick={() => setFetchNonce((n) => n + 1)}
                className="min-h-9 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer active:scale-95"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        ) : detail ? (
          <MarkdownDraftEditor
            manualId={manualId}
            initialMarkdown={detail.markdownContent ?? ""}
            markdownApproved={detail.markdownApproved}
            onDirtyChange={setEditorDirty}
          />
        ) : null}
      </div>
    </div>
  );
};
