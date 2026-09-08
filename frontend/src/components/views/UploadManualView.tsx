import React, { useRef, useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  XCircle,
  FileSearch,
} from "lucide-react";
import { ManualDoc } from "../../types";
import {
  requestManualUploadUrl,
  uploadManualFile,
  createManual,
  retryManualOcr,
  toUserMessage,
} from "../../services/apiService";
import { MANUAL_CATEGORIES, CUSTOM_MODEL_OPTION } from "../../lib/manualCategories";
import { useManualOcrStatus } from "../../hooks/useManualOcrStatus";
import { OcrProgressBar } from "../manuals/OcrProgressBar";

type ManualOcrStatusHookResult = ReturnType<typeof useManualOcrStatus>;
import { ManualContentPanel } from "../manuals/ManualContentPanel";

interface UploadManualViewProps {
  onGoToManuals?: () => void;
  /** รุ่นเครื่องจักรที่มีอยู่จริงในระบบ — ถ้ามีจะแสดงเป็น select แทนช่องกรอกข้อความ */
  machineModels?: string[];
  /** ชื่อผู้อัปโหลด — ไม่ส่งถ้าไม่มีค่า เพื่อให้ backend ใช้ค่าเริ่มต้น "system" */
  uploadedBy?: string;
  /** เรียกหลังบันทึกคู่มือสำเร็จ เพื่อให้หน้าจอหลักรีเฟรชรายการคู่มือ */
  onUploaded?: (manual: ManualDoc) => void;
}

/** ขีดจำกัดขนาดไฟล์ที่ประกาศไว้หน้าจอนี้ — บังคับใช้จริงตอนเลือกไฟล์ */
const MAX_FILE_BYTES = 50 * 1024 * 1024;

const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

const stripPdfExtension = (fileName: string) =>
  fileName.toLowerCase().endsWith(".pdf")
    ? fileName.slice(0, fileName.length - 4)
    : fileName;

type UploadStatus =
  | "idle"
  | "requesting"
  | "uploading"
  | "saving"
  | "done"
  | "error";

// "done"/"error" ไม่มี entry เพราะสถานะเหล่านี้ไม่ทำให้ isSubmitting เป็น true
// จึงไม่มีจุดไหนในหน้านี้ที่นำ label ของสถานะเหล่านี้ไปแสดงผล
const STATUS_LABELS: Record<Exclude<UploadStatus, "done" | "error">, string | null> = {
  idle: null,
  requesting: "กำลังขอสิทธิ์อัปโหลดไฟล์...",
  uploading: "กำลังส่งไฟล์ขึ้นคลัง...",
  saving: "กำลังบันทึกข้อมูลคู่มือ...",
};

/** ป้ายสถานะ + ปุ่มลองใหม่สำหรับการแปลง PDF → Markdown ด้วย AI ที่รันเป็น background
 * job หลังบันทึกคู่มือสำเร็จ — poll ผ่าน useManualOcrStatus จนกว่าจะจบสถานะ */
const OcrProgressPanel: React.FC<{
  manualId: string;
  ocrStatusResult: ManualOcrStatusHookResult;
}> = ({ manualId, ocrStatusResult }) => {
  const { status, error, timedOut, resumePolling } = ocrStatusResult;
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      // ไม่ส่ง actorId — retryManualOcr() ใช้ currentUserId ที่ AuthContext set ไว้อยู่แล้ว
      // เหมือนกับ createManual()/updateManual() ด้านบนในไฟล์นี้
      await retryManualOcr(manualId);
      resumePolling();
    } catch (err) {
      setRetryError(toUserMessage(err, "สั่งลองแปลงใหม่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"));
    } finally {
      setRetrying(false);
    }
  };

  const ocrStatus = status?.ocrStatus ?? null;

  if (!ocrStatus && !error) {
    // ยังไม่มีข้อมูลสถานะแรก (กำลังเรียกครั้งแรก) หรือคู่มือนี้ไม่มี job OCR เลย (skipped/null)
    return null;
  }

  return (
    <div className="border-t border-emerald-200 pt-4 mt-1 space-y-2">
      {(ocrStatus === "pending" || ocrStatus === "processing") && !timedOut && (
        <OcrProgressBar
          ocrStatus={ocrStatus}
          ocrStartedAt={status?.ocrStartedAt ?? null}
          variant="compact"
        />
      )}

      {timedOut && (ocrStatus === "pending" || ocrStatus === "processing") && (
        <div className="flex items-center gap-2 text-[13px] font-semibold text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>ใช้เวลานานกว่าปกติ กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง</span>
        </div>
      )}

      {ocrStatus === "done" && (
        <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-900">
          <FileSearch className="w-4 h-4 text-emerald-700" />
          <span>
            แปลงเป็น Markdown สำเร็จ
            {status?.ocrPages ? ` (${status.ocrPages} หน้า)` : ""}
          </span>
        </div>
      )}

      {ocrStatus === "skipped" && (
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-muted">
          <FileSearch className="w-4 h-4 text-ink-muted" />
          <span>ข้ามการแปลง</span>
        </div>
      )}

      {ocrStatus === "failed" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-[13px] font-semibold text-rose-900">
            <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <p>แปลงไม่สำเร็จ</p>
              {status?.ocrError && (
                <p className="text-xs text-rose-800 font-normal mt-0.5">{status.ocrError}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="px-3.5 min-h-9 py-1.5 rounded-full bg-white border border-rose-200 text-rose-800 text-xs font-semibold hover:bg-rose-50 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {retrying ? "กำลังสั่งลองใหม่..." : "ลองแปลงอีกครั้ง"}
          </button>
          {retryError && <p className="text-xs text-rose-800">{retryError}</p>}
        </div>
      )}

      {error && (
        <p className="text-xs text-amber-800">ไม่สามารถตรวจสอบสถานะการแปลงไฟล์ได้: {error}</p>
      )}
    </div>
  );
};

export const UploadManualView: React.FC<UploadManualViewProps> = ({
  onGoToManuals,
  machineModels,
  uploadedBy,
  onUploaded,
}) => {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [machineModel, setMachineModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [savedManual, setSavedManual] = useState<ManualDoc | null>(null);
  // แผงตรวจสอบเนื้อหา Markdown ทางขวา — ผู้ใช้ปิดได้เอง (ดู ManualContentPanel) รีเซ็ตเป็นเปิดใหม่
  // ทุกครั้งที่อัปโหลดไฟล์รอบใหม่ (ดู handleFile/handleReset ด้านล่าง)
  const [contentPanelOpen, setContentPanelOpen] = useState(true);

  const isSubmitting =
    status === "requesting" || status === "uploading" || status === "saving";

  // Guard เพิ่มเติมสำหรับกันกดส่งซ้ำ (double-submit) แบบซิงโครนัส เพราะ isSubmitting
  // (ที่มาจาก status) จะยังไม่เปลี่ยนจนกว่าจะผ่านการอ่าน magic number ของไฟล์ (await) ไปแล้ว
  // ทำให้มีช่วงเวลาที่แท็ปซ้ำครั้งที่สองผ่าน `if (isSubmitting) return;` ไปได้
  const submittingRef = useRef(false);

  const handleFile = (file: File | undefined | null) => {
    if (!file) {
      setErrorMessage("ไม่พบไฟล์ที่เลือก กรุณาลองเลือกไฟล์อีกครั้ง");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage(
        `รองรับเฉพาะไฟล์ PDF เท่านั้น ไฟล์ที่เลือกคือ ${file.name} กรุณาแปลงเป็น PDF ก่อน`
      );
      setStagedFile(null);
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      setErrorMessage(
        `ไฟล์ ${file.name} ไม่ใช่ไฟล์ PDF ที่ถูกต้อง กรุณาเลือกไฟล์ PDF ที่แท้จริง`
      );
      setStagedFile(null);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage(
        `ไฟล์ ${file.name} มีขนาด ${formatMB(file.size)} MB เกินขีดจำกัด 50 MB กรุณาบีบอัดไฟล์หรือแยกออกเป็นหลายเล่มก่อน`
      );
      setStagedFile(null);
      return;
    }

    setErrorMessage(null);
    setStagedFile(file);
    setTitle(stripPdfExtension(file.name));
    setMachineModel("");
    setIsCustomModel(false);
    setCategory("General");
    setTagsInput("");
    setStatus("idle");
    setProgress(0);
    setSavedManual(null);
    setContentPanelOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleReset = () => {
    setStagedFile(null);
    setErrorMessage(null);
    setTitle("");
    setMachineModel("");
    setIsCustomModel(false);
    setCategory("General");
    setTagsInput("");
    setStatus("idle");
    setProgress(0);
    setSavedManual(null);
    setContentPanelOpen(true);
  };

  // ปุ่มส่งไฟล์เปิดใช้งานได้ทันทีที่มีไฟล์ค้างอยู่และไม่ได้กำลังส่งอยู่แล้ว
  // ส่วนการตรวจสอบชื่อคู่มือ/รุ่นเครื่องจักรทำตอนกดส่ง (ดู handleSubmit)
  // เพื่อให้ผู้ใช้เห็นข้อความอธิบายภาษาไทยว่าขาดอะไร แทนปุ่มที่จางแบบไม่มีคำอธิบาย
  const canSubmit = !!stagedFile && !isSubmitting;

  const handleSubmit = async () => {
    // ป้องกันกดส่งซ้ำ (double-submit) เช่น จากปุ่ม synthetic/คีย์บอร์ดที่ยิงซ้ำ หรือแท็ปซ้ำ
    // บนแท็บเล็ต ใช้ ref แทน isSubmitting (ที่มาจาก status) เพราะ ref เป็นซิงโครนัสจริง
    // ในขณะที่ status ยังไม่เปลี่ยนจนกว่าจะผ่านการอ่าน magic number ของไฟล์ (await) ไปแล้ว
    // ซึ่งถ้าใช้ isSubmitting เพียงอย่างเดียว แท็ปซ้ำครั้งที่สองระหว่างช่วงนั้นจะหลุดผ่านไปได้
    // และสร้างตั๋วอัปโหลด ไฟล์ในคลัง และแถวข้อมูลซ้ำสองชุด
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      if (isSubmitting) return;
      if (!stagedFile) return;
      if (title.trim() === "" || machineModel.trim() === "") {
        setErrorMessage("กรุณากรอกชื่อคู่มือและรุ่นเครื่องจักรให้ครบก่อนส่งไฟล์");
        return;
      }

      setErrorMessage(null);
      setProgress(0);

      // ตรวจ magic number ของไฟล์จริง เพราะ Content-Type ที่ฝั่งเราส่งไปตอนอัปโหลด
      // ถูก hardcode เป็น application/pdf เสมอ ทำให้ Storage validate ผ่านแม้ไฟล์ไม่ใช่ PDF จริง
      // (แค่ถูกเปลี่ยนนามสกุลเป็น .pdf) จึงต้องเช็กที่นี่ก่อนขอตั๋วอัปโหลด
      // ครอบด้วย try/catch เพราะไฟล์ที่เลือกไว้อาจอ่านไม่ได้อีกแล้วตอนกดส่ง เช่นไฟล์จาก
      // content:// ที่สิทธิ์ถูกถอน, SD card/เครือข่ายที่หลุดการเชื่อมต่อ ทำให้ arrayBuffer()
      // reject ด้วย DOMException — ถ้าไม่ดักไว้ ปุ่มจะไม่มีปฏิกิริยาใด ๆ เลย
      let head: Uint8Array;
      try {
        head = new Uint8Array(await stagedFile.slice(0, 5).arrayBuffer());
      } catch {
        setErrorMessage("ไม่สามารถอ่านไฟล์ที่เลือกได้ กรุณาเลือกไฟล์ใหม่อีกครั้ง");
        return;
      }
      if (String.fromCharCode(...head) !== "%PDF-") {
        setErrorMessage(
          `ไฟล์ ${stagedFile.name} ไม่ใช่ไฟล์ PDF ที่ถูกต้อง (เนื้อไฟล์ไม่ตรงกับนามสกุล .pdf) กรุณาตรวจสอบไฟล์อีกครั้ง`
        );
        return;
      }

      let created: ManualDoc;

      try {
        setStatus("requesting");
        const ticket = await requestManualUploadUrl({
          fileName: stagedFile.name,
          fileSize: stagedFile.size,
        });

        setStatus("uploading");
        await uploadManualFile(ticket.signedUrl, stagedFile, setProgress);

        setStatus("saving");
        const tags = tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "");

        created = await createManual({
          title: title.trim(),
          machineModel: machineModel.trim(),
          category,
          tags,
          filePath: ticket.path,
          fileSize: `${formatMB(stagedFile.size)} MB`,
          ...(uploadedBy ? { uploadedBy } : {}),
        });

        setSavedManual(created);
        setStatus("done");
      } catch (err) {
        setStatus("error");
        setErrorMessage(toUserMessage(err, "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุระหว่างส่งไฟล์ กรุณาลองใหม่อีกครั้ง"));
        return;
      }

      // เรียก callback หลังบันทึกสำเร็จเท่านั้น และอยู่นอก try/catch ด้านบน
      // เพื่อไม่ให้ error ที่เกิดจาก callback ของหน้าจอหลัก (parent) ทำให้คู่มือที่บันทึกสำเร็จแล้ว
      // ถูกเปลี่ยนเป็นสถานะ "error" — มิเช่นนั้นผู้ใช้จะอัปโหลดซ้ำจนเกิดคู่มือและไฟล์ซ้ำในคลัง
      onUploaded?.(created);
    } finally {
      // เคลียร์ ref ทุกทางออกจากฟังก์ชันนี้เสมอ (รวมถึง early-return ทุกจุดด้านบน)
      // ไม่เช่นนั้นปุ่มส่งไฟล์จะกดไม่ได้อีกเลยตลอดไป
      submittingRef.current = false;
    }
  };

  // แสดงแผงตรวจสอบเนื้อหาด้านขวาตั้งแต่บันทึกคู่มือสำเร็จ (savedManual มีค่า) แม้ OCR ยังไม่เสร็จ
  // เพื่อให้ผู้ใช้เห็นล่วงหน้าว่าผลลัพธ์จะไปโผล่ที่ไหน — จนกว่าจะปิดแผงเอง (contentPanelOpen)
  const showContentPanel = !!savedManual && contentPanelOpen;

  // เจ้าเดียวที่ poll สถานะ OCR ของคู่มือเล่มนี้ — ยกขึ้นมาไว้ที่ parent ร่วมนี้เพื่อไม่ให้
  // OcrProgressPanel และ ManualContentPanel poll ซ้ำกันสองรอบพร้อมกัน (เดิมแต่ละฝั่งเรียก
  // useManualOcrStatus เอง) ส่ง null เมื่อยังไม่มี savedManual เพื่อปิดการ poll
  const ocrStatusResult = useManualOcrStatus(savedManual?.id ?? null);

  return (
    <div className={showContentPanel ? "p-4 md:p-8 max-w-[1600px] mx-auto" : "p-4 md:p-8 max-w-7xl mx-auto"}>
      <div className={showContentPanel ? "flex flex-col gap-6" : "max-w-4xl mx-auto space-y-6"}>
        <div className="space-y-6">
          {savedManual && !contentPanelOpen && (
            <button
              type="button"
              onClick={() => setContentPanelOpen(true)}
              className="min-h-9 px-4 py-1.5 rounded-full bg-white border border-divider text-ink-muted text-xs font-semibold hover:bg-primary/5 cursor-pointer active:scale-95"
            >
              แสดงแผงตรวจสอบเนื้อหา Markdown
            </button>
          )}
      {/* Upload Dropzone Card */}
      {!stagedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-white rounded-[18px] border-2 border-dashed p-8 md:p-12 text-center transition-all space-y-4 ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-hairline hover:border-primary"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">
              {isDragging
                ? "วางไฟล์ที่นี่เพื่อตรวจสอบ"
                : "ลากและวางไฟล์คู่มือ PDF หรือคลิกเพื่อเลือกไฟล์"}
            </h3>
            <p className="text-[13px] text-ink-muted mt-1">
              รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 50 MB (คู่มือภาษาไทยและอังกฤษ)
            </p>
          </div>

          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleInputChange}
            className="hidden"
            id="manual-file-upload-input"
          />

          <label
            htmlFor="manual-file-upload-input"
            className="inline-flex items-center gap-2 px-6 min-h-11 py-3 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-sm cursor-pointer active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>เลือกไฟล์คู่มือจากเครื่อง</span>
          </label>
        </div>
      )}

      {/* Error state — แสดงที่ด้านบนเฉพาะตอนยังไม่มีไฟล์ที่ค้างอยู่ (เช่น ไฟล์ผิดรูปแบบตอนเลือก)
          เพราะจุดนี้อยู่ใกล้ dropzone ที่ผู้ใช้กำลังมองอยู่ ส่วนตอนกรอกข้อมูล/ส่งไฟล์
          ข้อผิดพลาดจะแสดงซ้ำใกล้ปุ่มส่งไฟล์แทน (ดูด้านล่าง) */}
      {errorMessage && !stagedFile && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 p-4 rounded-[18px] flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Success state */}
      {status === "done" && savedManual && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-[18px] space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-white text-emerald-600 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-emerald-900 text-sm">
                เพิ่มคู่มือเข้าคลังเรียบร้อยแล้ว
              </h4>
              <p className="text-[13px] text-emerald-800 mt-0.5 wrap-break-word">
                {savedManual.title}
              </p>
            </div>
          </div>

          <OcrProgressPanel manualId={savedManual.id} ocrStatusResult={ocrStatusResult} />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 min-h-11 py-2.5 rounded-[11px] bg-white border border-emerald-200 text-emerald-800 text-[13px] font-semibold hover:bg-emerald-100/60 cursor-pointer active:scale-95"
            >
              อัปโหลดไฟล์อื่นต่อ
            </button>
            {onGoToManuals && (
              <button
                type="button"
                onClick={onGoToManuals}
                className="px-4 min-h-11 py-2.5 rounded-[11px] bg-white border border-divider text-ink-muted text-[13px] font-semibold hover:bg-primary/5 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>ดูคู่มือที่มีอยู่แล้วในคลัง</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ไฟล์ผ่านการตรวจสอบแล้ว — กรอกข้อมูลคู่มือก่อนส่งเข้าคลัง */}
      {stagedFile && status !== "done" && (
        <div className="bg-white border border-hairline p-5 rounded-[18px] space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-divider text-primary border border-divider shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-ink text-sm">
                ไฟล์ผ่านการตรวจสอบรูปแบบและขนาดแล้ว
              </h4>
              <p className="text-[13px] text-ink-muted mt-0.5 wrap-break-word">
                {stagedFile.name} · {formatMB(stagedFile.size)} MB
              </p>
            </div>
          </div>

          {/* Metadata form */}
          <div className="border-t border-divider pt-4 space-y-4">
            <div>
              <label
                htmlFor="manual-title-input"
                className="block text-[13px] font-semibold text-ink mb-1.5"
              >
                ชื่อคู่มือ <span className="text-rose-600">*</span>
              </label>
              <input
                id="manual-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                placeholder="เช่น คู่มือซ่อมบำรุง CNC Milling"
              />
            </div>

            <div>
              <label
                htmlFor="manual-machine-model-input"
                className="block text-[13px] font-semibold text-ink mb-1.5"
              >
                รุ่นเครื่องจักร <span className="text-rose-600">*</span>
              </label>
              {machineModels && machineModels.length > 0 ? (
                <div className="space-y-2">
                  <select
                    id="manual-machine-model-input"
                    value={isCustomModel ? CUSTOM_MODEL_OPTION : machineModel}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === CUSTOM_MODEL_OPTION) {
                        setIsCustomModel(true);
                        setMachineModel("");
                      } else {
                        setIsCustomModel(false);
                        setMachineModel(value);
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                  >
                    <option value="">— เลือกรุ่นเครื่องจักร —</option>
                    {machineModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                    <option value={CUSTOM_MODEL_OPTION}>อื่น ๆ (ระบุเอง)</option>
                  </select>
                  {isCustomModel && (
                    <input
                      id="manual-machine-model-custom-input"
                      type="text"
                      value={machineModel}
                      onChange={(e) => setMachineModel(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                      placeholder="พิมพ์รุ่นเครื่องจักรที่ไม่มีในรายการ เช่น MTC SpeedMill-500X"
                    />
                  )}
                </div>
              ) : (
                <input
                  id="manual-machine-model-input"
                  type="text"
                  value={machineModel}
                  onChange={(e) => setMachineModel(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                  placeholder="เช่น MTC SpeedMill-500X"
                />
              )}
            </div>

            <div>
              <label
                htmlFor="manual-category-input"
                className="block text-[13px] font-semibold text-ink mb-1.5"
              >
                หมวดหมู่
              </label>
              <select
                id="manual-category-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
              >
                {MANUAL_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="manual-tags-input"
                className="block text-[13px] font-semibold text-ink mb-1.5"
              >
                แท็ก
              </label>
              <input
                id="manual-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                placeholder="เช่น CNC, Spindle, Lubrication"
              />
              <p className="text-xs text-ink-faint mt-1">
                คั่นแท็กหลายรายการด้วยเครื่องหมายจุลภาค (,)
              </p>
            </div>
          </div>

          {/* Progress / status line */}
          {isSubmitting && (
            <div className="border-t border-divider pt-4 space-y-2">
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 text-[13px] font-semibold text-ink"
              >
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span>{STATUS_LABELS[status as Exclude<UploadStatus, "done" | "error">]}</span>
              </div>
              {status === "uploading" && (
                <div className="space-y-1">
                  <div
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="w-full h-2 rounded-full bg-divider overflow-hidden"
                  >
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-muted tabular-nums">{progress}%</p>
                </div>
              )}
            </div>
          )}

          {/* แสดงข้อผิดพลาดซ้ำใกล้ปุ่มส่งไฟล์ เพราะผู้ใช้เลื่อนมาอยู่ตรงนี้แล้วตอนกดส่ง
              (การ์ดข้อผิดพลาดที่ด้านบนของหน้าอาจอยู่นอกจอ) */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 p-4 rounded-[18px] flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-divider pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-busy={isSubmitting}
              className="px-5 min-h-11 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-[13px] font-semibold cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              ส่งไฟล์เข้าคลังคู่มือ
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-4 min-h-11 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-primary/5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ตรวจสอบไฟล์อื่น
            </button>
            {onGoToManuals && (
              <button
                type="button"
                onClick={onGoToManuals}
                disabled={isSubmitting}
                className="px-4 min-h-11 py-2.5 rounded-[11px] bg-white border border-divider text-ink-muted text-[13px] font-semibold hover:bg-primary/5 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookOpen className="w-4 h-4" />
                <span>ดูคู่มือที่มีอยู่แล้วในคลัง</span>
              </button>
            )}
          </div>
        </div>
      )}
        </div>

        {showContentPanel && savedManual && (
          <ManualContentPanel
            manualId={savedManual.id}
            title={savedManual.title}
            onClose={() => setContentPanelOpen(false)}
            ocrStatus={ocrStatusResult.status}
          />
        )}
      </div>
    </div>
  );
};
