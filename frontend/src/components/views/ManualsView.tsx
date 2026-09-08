import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  Search,
  Sparkles,
  Eye,
  Tag,
  FileCode,
  FileText,
  Copy,
  Check,
  BadgeCheck,
  Cpu,
  X,
  AlertCircle,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Machine, ManualDoc } from "../../types";
import {
  getManuals,
  getManualFileUrl,
  getManualContent,
  toUserMessage,
  deleteManual,
  updateManual,
} from "../../services/apiService";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { SkeletonCardGrid } from "../ui/Skeleton";
import { MANUAL_CATEGORIES, CUSTOM_MODEL_OPTION } from "../../lib/manualCategories";
import { detectTocPages } from "../../lib/manualToc";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { Components } from "react-markdown";

/** ป้ายสถานะการแปลง PDF → Markdown ด้วย OCR — แสดงเฉพาะตอนกำลังทำงาน/ล้มเหลว
 * เพราะ "done"/null ไม่มีอะไรต้องเตือนผู้ใช้ */
const OcrStatusBadge: React.FC<{ ocrStatus: ManualDoc["ocrStatus"] }> = ({ ocrStatus }) => {
  if (ocrStatus === "pending" || ocrStatus === "processing") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" />
        กำลังแปลง…
      </span>
    );
  }
  if (ocrStatus === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" />
        แปลงไม่สำเร็จ
      </span>
    );
  }
  return null;
};

/** ป้าย "ฉบับร่าง รอตรวจ" — คู่มือที่แปลงเสร็จแล้ว (ocrStatus === "done") แต่ผู้ใช้ยังไม่ได้ตรวจ/บันทึก
 * เนื้อหา Markdown ที่แก้ไข (markdownApproved === false) ใช้สไตล์ pill เดียวกับ OcrStatusBadge ด้านบน */
const DraftApprovalBadge: React.FC<{ ocrStatus: ManualDoc["ocrStatus"]; markdownApproved?: boolean }> = ({
  ocrStatus,
  markdownApproved,
}) => {
  if (ocrStatus !== "done" || markdownApproved !== false) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" />
      ฉบับร่าง รอตรวจ
    </span>
  );
};

interface ManualsViewProps {
  /** เครื่องจักรที่กำลังทำงานอยู่ (จาก TopBar) — เปิดใช้ตัวกรองคู่มือเฉพาะรุ่นของเครื่องนี้ */
  activeMachine?: Machine;
  onAskAI: (prompt: string) => void;
  /** เมื่อระบุ จะแสดงปุ่มพาไปหน้าอัปโหลดคู่มือในแบนเนอร์ด้านบน */
  onGoToUpload?: () => void;
  /** เมื่อเป็น true จะแสดงปุ่ม "แก้ไข" และ "ลบ" บนคู่มือแต่ละเล่ม (สิทธิ์วิศวกร/หัวหน้างาน) */
  canManage?: boolean;
  /** รุ่นเครื่องจักรที่มีอยู่จริงในระบบ — ใช้กับฟอร์มแก้ไขคู่มือ (เหมือนหน้าอัปโหลด) */
  machineModels?: string[];
  /** เรียกหลังลบคู่มือสำเร็จ (แค่แจ้ง toast — คอมโพเนนต์นี้อัปเดตรายการของตัวเองแล้ว) */
  onDeleted?: (id: string, title: string) => void;
  /** เรียกหลังบันทึกการแก้ไขคู่มือสำเร็จ (แค่แจ้ง toast — คอมโพเนนต์นี้อัปเดตรายการของตัวเองแล้ว) */
  onUpdated?: (manual: ManualDoc) => void;
}

/** ตัวปรับแต่งการเรนเดอร์ Markdown ที่ใช้ทั้งหน้าต่างอ่านคู่มือ (ด้านล่าง) และตัวแก้ไขฉบับร่าง
 * (MarkdownDraftEditor) — export ไว้ให้ที่อื่น import ไปใช้ซ้ำ แทนการเขียนสไตล์ซ้ำหรือเพิ่มไลบรารีใหม่ */
export const markdownComponents: Components = {
  // TopBar renders the page's only <h1>. A heading inside a manual is a
  // section of that page's content, so it starts at <h2> however the document
  // was written.
  h1: ({ children }) => (
    <h2 className="text-xl font-semibold text-ink mt-6 mb-3">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-ink mt-6 mb-2 pb-1 border-b border-hairline">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-ink mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-ink-muted leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 text-sm text-ink-muted space-y-1 mb-3">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 text-sm text-ink-muted space-y-1 mb-3">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary underline hover:text-primary-focus"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-amber-300/70 bg-amber-50/70 text-amber-900 text-sm px-4 py-2 rounded-r-lg mb-3">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3 rounded-[11px] border border-hairline">
      <table className="min-w-[480px] w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-hairline bg-divider px-2.5 py-2 text-left font-semibold text-ink-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-hairline px-2.5 py-2 text-ink-muted">{children}</td>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto bg-divider text-ink-muted rounded-[11px] p-4 text-xs mb-3">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    if (className) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="bg-divider text-primary rounded px-1 py-0.5 text-[0.85em] font-mono">
        {children}
      </code>
    );
  },
};

// คู่มือที่นำเข้าจากสคริปต์ import มีโครงสร้างสม่ำเสมอ: หัวเรื่อง/สารบัญสั้น ๆ ตามด้วยส่วนย่อยต่อหน้า
// ที่ขึ้นต้นด้วย "## หน้า N" เรียงลำดับ — ใช้ตัดเนื้อหาเป็นก้อนต่อหน้าเพื่อเรนเดอร์ทีละส่วน
const PAGE_HEADING_REGEX = /^## หน้า \d+/gm;
// จำนวนการ์ดคู่มือต่อหน้าในกริดรายการ (แยกจาก DEFAULT_VISIBLE_PAGES ด้านล่าง ซึ่งเป็นคนละ
// "หน้า" — อันนั้นคือหน้าเนื้อหาในหน้าต่างอ่านคู่มือหนึ่งเล่ม อันนี้คือหน้าของกริดรายการ)
// ค่านี้ยังใช้เป็น `limit` ของ getManuals({ ... }) ด้วย — แบ่งหน้าที่ server จริง ๆ
// (ไม่ใช่แบ่งบนก้อนที่โหลดมาครั้งเดียวเหมือนเดิม) คลังคู่มือจึงไม่ถูกจำกัดที่ 100 เล่มแรกอีกต่อไป
const MANUALS_PAGE_SIZE = 12;
// จำนวนหน้าที่แสดงเริ่มต้น / ต่อการกดโหลดเพิ่มหนึ่งครั้ง
const DEFAULT_VISIBLE_PAGES = 15;
// เพดานความยาวของเนื้อหา fallback (คู่มือที่ไม่มีโครงสร้าง "## หน้า N") ที่จะเรนเดอร์ตั้งแต่แรก
const FALLBACK_CHAR_LIMIT = 200_000;

export const ManualsView: React.FC<ManualsViewProps> = ({
  activeMachine,
  onAskAI,
  onGoToUpload,
  canManage = false,
  machineModels,
  onDeleted,
  onUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // ยิงค้นหาไป server หลังพิมพ์หยุด ~300ms กันยิงถี่ทุกตัวอักษร (เหมือน SparePartsView)
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [selectedDoc, setSelectedDoc] = useState<ManualDoc | null>(null);
  const [copied, setCopied] = useState(false);
  // ข้อผิดพลาดของการคัดลอกเนื้อหาในหน้าต่างอ่านคู่มือ (แยกจาก error ของการเปิดไฟล์)
  const [copyError, setCopyError] = useState<string | null>(null);
  // แคชเนื้อหาคู่มือที่ดึงมาแล้ว (key = manual id) เพื่อไม่ต้องโหลดซ้ำเมื่อเปิดคู่มือเดิมอีกครั้ง
  // เนื้อหาไม่ถูกส่งมากับรายการคู่มือแล้ว (อาจใหญ่ถึง 2.5MB/เล่ม) จึงต้องโหลดแยกตอนเปิดหน้าต่างอ่าน
  const [contentCache, setContentCache] = useState<Record<string, string>>({});
  // เก็บสถานะกำลังโหลด/error ของเนื้อหาแยกเป็นต่อ id (เหมือนแพทเทิร์น loadingFileIds/fileErrorMessages
  // ด้านล่าง) เพื่อไม่ให้สถานะของคู่มือเล่มหนึ่งไปเปื้อนอีกเล่มหนึ่งเมื่อสลับเปิดหลายเล่ม
  const [contentLoadingIds, setContentLoadingIds] = useState<Set<string>>(new Set());
  const [contentErrorMessages, setContentErrorMessages] = useState<Record<string, string>>({});
  // เพิ่มขึ้นทุกครั้งที่ต้องดึงเนื้อหาใหม่ (เปิดคู่มือใหม่ หรือกด "ลองอีกครั้ง") เพื่อสั่ง effect ให้ทำงานอีกรอบ
  const [contentFetchNonce, setContentFetchNonce] = useState(0);
  // จำนวน "หน้า" (## หน้า N) ที่แสดงอยู่ในหน้าต่างอ่าน — คู่มือที่นำเข้าใหม่บางเล่มยาวถึง 40,000+ บรรทัด
  // จึงต้องแสดงทีละส่วนแล้วให้กดโหลดเพิ่ม ไม่เช่นนั้น ReactMarkdown เรนเดอร์ทั้งก้อนจะทำให้แท็บเล็ตค้าง
  const [visiblePageCount, setVisiblePageCount] = useState(DEFAULT_VISIBLE_PAGES);
  // สำหรับคู่มือที่ไม่มีโครงสร้าง "## หน้า N" (fallback) — เริ่มแสดงแค่ช่วงแรกถ้าเนื้อหายาวมาก
  // แล้วให้ผู้ใช้กด "แสดงทั้งหมด" เพื่อดูส่วนที่เหลือ แทนที่จะตัดทิ้งแบบไม่มีทางย้อนดู
  const [showFullFallback, setShowFullFallback] = useState(false);
  // สลับแสดง/ซ่อนหน้าสารบัญที่ตรวจพบด้วย detectTocPages — ค่าเริ่มต้นซ่อนไว้เสมอ (ดู reset effect ด้านล่าง)
  // เพราะฮิวริสติกอาจพลาด จึงต้องมีทางกู้คืนให้ผู้ใช้กดดูต้นฉบับทั้งหมดได้เสมอ
  const [showToc, setShowToc] = useState(false);
  const [onlyActiveMachine, setOnlyActiveMachine] = useState(false);
  // แบ่งหน้ากริดรายการคู่มือ — แบ่งหน้า/ค้นหาที่ server จริง (เหมือน SparePartsView) แทนการ
  // โหลดก้อนเดียวจาก App.tsx (เดิมสูงสุด 100 เล่มตาม getManuals({ limit: 100 }) ซึ่งคู่มือ
  // เล่มที่ 101 ขึ้นไปจะมองไม่เห็นเลย) ไฟล์นี้ดึงคู่มือของตัวเองแล้ว
  const [manualsOffset, setManualsOffset] = useState(0);
  const [manuals, setManuals] = useState<ManualDoc[]>([]);
  const [manualsTotal, setManualsTotal] = useState(0);
  const [manualsLoading, setManualsLoading] = useState(true);
  const [manualsLoadError, setManualsLoadError] = useState<string | null>(null);
  // เก็บสถานะกำลังโหลดแยกเป็นชุด (Set) เพื่อให้การ์ดหลายใบที่กดพร้อมกันไม่ทับสถานะกัน
  const [loadingFileIds, setLoadingFileIds] = useState<Set<string>>(new Set());
  // ผูกข้อความ error กับ id ของคู่มือ เพื่อให้ error แสดงในการ์ดที่ถูกต้อง
  const [fileErrorMessages, setFileErrorMessages] = useState<Record<string, string>>({});

  // เปลี่ยนคำค้นหา/ตัวกรองเครื่องจักร -> กลับไปหน้าแรกของกริดเสมอ (ผลลัพธ์ชุดใหม่ไม่ใช่หน้าเดิม)
  useEffect(() => {
    setManualsOffset(0);
  }, [debouncedSearch, onlyActiveMachine]);

  useEffect(() => {
    let cancelled = false;
    setManualsLoading(true);
    setManualsLoadError(null);

    getManuals({
      search: debouncedSearch.trim() || undefined,
      machineModel: onlyActiveMachine && activeMachine ? activeMachine.model ?? undefined : undefined,
      limit: MANUALS_PAGE_SIZE,
      offset: manualsOffset,
    })
      .then((res) => {
        if (cancelled) return;
        setManuals(res.data);
        setManualsTotal(res.meta?.total ?? res.data.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setManualsLoadError(toUserMessage(err, "ไม่สามารถโหลดคลังคู่มือได้"));
      })
      .finally(() => {
        if (!cancelled) setManualsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, onlyActiveMachine, activeMachine, manualsOffset]);

  // คู่มือที่กำลังจะลบ (เปิดหน้าต่างยืนยัน) — null คือไม่มีหน้าต่างยืนยันเปิดอยู่
  const [manualToDelete, setManualToDelete] = useState<ManualDoc | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // คู่มือที่กำลังแก้ไข (เปิดหน้าต่างแบบฟอร์ม) — null คือไม่มีหน้าต่างแก้ไขเปิดอยู่
  const [manualToEdit, setManualToEdit] = useState<ManualDoc | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMachineModel, setEditMachineModel] = useState("");
  const [editIsCustomModel, setEditIsCustomModel] = useState(false);
  const [editCategory, setEditCategory] = useState("General");
  const [editTagsInput, setEditTagsInput] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // เมื่อปิดหน้าต่างอ่านคู่มือ หรือเปลี่ยนคู่มือที่เลือก ให้ล้าง error ของคู่มือเดิมทิ้ง
  // มิฉะนั้น error ของครั้งก่อนจะค้างอยู่ในการ์ดจนกว่าจะลองเปิดไฟล์อีกครั้ง
  useEffect(() => {
    if (!selectedDoc) return;
    const docId = selectedDoc.id;
    return () => {
      setFileErrorMessages((prev) => {
        if (!(docId in prev)) return prev;
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      setCopyError(null);
      setCopied(false);
    };
  }, [selectedDoc]);

  // โหลดเนื้อหาคู่มือแบบ lazy เมื่อเปิดหน้าต่างอ่าน — ไม่โหลดถ้ามีในแคชแล้ว หรือคู่มือไม่มีเนื้อหาข้อความ
  // สถานะโหลด/error ผูกกับ docId เสมอ (เหมือน loadingFileIds/fileErrorMessages) เพื่อไม่ให้เล่มอื่นที่
  // กำลังแสดงอยู่ตอนนี้ถูกรบกวนจากการดึงข้อมูลของเล่มก่อนหน้าที่ยังค้างอยู่เบื้องหลัง
  useEffect(() => {
    if (!selectedDoc) return;
    const docId = selectedDoc.id;
    // มองโลกในแง่ดี: backend รุ่นเก่าอาจไม่ส่ง hasMarkdown มาเลย (undefined) — ต้องยังลองโหลดอยู่ดี
    // มีแต่กรณีที่ backend ยืนยันชัดเจนว่าไม่มี (false) เท่านั้นที่ข้ามการโหลด
    if (selectedDoc.hasMarkdown === false) return;
    if (docId in contentCache) return;

    let cancelled = false;
    setContentLoadingIds((prev) => new Set(prev).add(docId));
    setContentErrorMessages((prev) => {
      if (!(docId in prev)) return prev;
      const next = { ...prev };
      delete next[docId];
      return next;
    });

    getManualContent(docId)
      .then((content) => {
        // เขียนแคชนี้เสมอแม้หน้าต่างจะถูกปิด/สลับคู่มือไปแล้ว (cancelled === true) — เนื้อหาที่โหลดมาสำเร็จ
        // ผูกกับ docId เดียวเท่านั้น ไม่กระทบคู่มือเล่มอื่น การทิ้งไปจะทำให้เปิดคู่มือเล่มนี้ซ้ำต้องโหลดใหม่ทั้งหมด
        // แคชเป็นสตริงว่างด้วยถ้าไม่มีเนื้อหา เพื่อให้เงื่อนไข "docId in contentCache" ด้านบนกันการโหลดซ้ำไม่รู้จบ
        setContentCache((prev) => ({ ...prev, [docId]: content ?? "" }));
      })
      .catch((err) => {
        if (cancelled) return;
        setContentErrorMessages((prev) => ({
          ...prev,
          [docId]: toUserMessage(err, "ไม่สามารถโหลดเนื้อหาคู่มือได้"),
        }));
      })
      .finally(() => {
        if (cancelled) return;
        setContentLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      });

    return () => {
      cancelled = true;
      // ปิดหน้าต่าง/สลับไปคู่มือเล่มอื่นระหว่างที่ยังโหลดอยู่ — ต้องเคลียร์สถานะ "กำลังโหลด" ของเล่มนี้
      // ทันที ไม่งั้นสปินเนอร์จะค้าง true ตลอดไปเพราะ .finally() ข้างบนถูกข้ามไปแล้ว (cancelled = true)
      setContentLoadingIds((prev) => {
        if (!prev.has(docId)) return prev;
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoc?.id, selectedDoc?.hasMarkdown, contentFetchNonce]);

  // รีเซ็ตจำนวนหน้าที่แสดง (และสถานะ "แสดงทั้งหมด" ของ fallback) ทุกครั้งที่เปลี่ยนคู่มือที่เลือก
  // ไม่เช่นนั้นเปิดคู่มือเล่มใหม่แล้วจะโผล่มาพร้อมจำนวนหน้าที่ค้างมาจากเล่มก่อนหน้า
  useEffect(() => {
    setVisiblePageCount(DEFAULT_VISIBLE_PAGES);
    setShowFullFallback(false);
    setShowToc(false);
  }, [selectedDoc?.id]);

  // เนื้อหาที่จะใช้แสดงจริง — เอาจากแคชก่อน (โหลดแยกมา) แล้วจึงย้อนกลับไปใช้
  // markdownContent เดิมถ้ามีมากับตัว doc อยู่แล้ว (เช่นเพิ่งสร้างคู่มือใหม่ในเซสชันนี้)
  const activeContent = selectedDoc
    ? contentCache[selectedDoc.id] ?? selectedDoc.markdownContent ?? null
    : null;

  // สถานะโหลด/error ของ "คู่มือที่เลือกอยู่ตอนนี้" เท่านั้น — อ่านจากแมพที่ผูกกับ id ด้านบน
  // เพื่อให้ UI ของหน้าต่างอ่านสะท้อนเฉพาะเล่มที่เปิดอยู่จริง ไม่ปนกับเล่มอื่น
  const isContentLoading = selectedDoc ? contentLoadingIds.has(selectedDoc.id) : false;
  const activeContentError = selectedDoc ? contentErrorMessages[selectedDoc.id] ?? null : null;

  // ตัดเนื้อหาเป็นก้อนต่อหน้าตามหัวข้อ "## หน้า N" (คงส่วนนำก่อนหน้าแรก ถ้ามี ไว้เป็นก้อนที่ 0)
  // memo ไว้ตาม string ของเนื้อหา เพื่อให้ตัดครั้งเดียวต่อคู่มือหนึ่งเล่ม ไม่ใช่ทุกครั้งที่ re-render
  const pageSplit = useMemo(() => {
    if (!activeContent) return null;
    const indices: number[] = [];
    const regex = new RegExp(PAGE_HEADING_REGEX);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(activeContent)) !== null) {
      indices.push(match.index);
    }
    if (indices.length === 0) return null;

    const chunks: string[] = [];
    if (indices[0] > 0) {
      chunks.push(activeContent.slice(0, indices[0]));
    }
    const preambleCount = chunks.length;
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i];
      const end = i + 1 < indices.length ? indices[i + 1] : activeContent.length;
      chunks.push(activeContent.slice(start, end));
    }
    return { chunks, pageCount: indices.length, preambleCount };
  }, [activeContent]);

  // ตรวจหน้าสารบัญ (สารบัญ/目次/INDEX ฯลฯ) จากก้อนเนื้อหาต่อหน้า — คำนวณครั้งเดียวต่อคู่มือหนึ่งเล่ม (memo
  // ตาม pageSplit) ไม่ใช่ทุกครั้งที่ re-render เพราะคู่มือบางเล่มมีได้ถึง 722 หน้า/2.6MB
  // เป็น display-side เท่านั้น ไม่แก้เนื้อหาต้นฉบับ/ฐานข้อมูลใด ๆ
  const tocDetection = useMemo(() => {
    if (!pageSplit) return null;
    const pageChunks = pageSplit.chunks.slice(pageSplit.preambleCount);
    const result = detectTocPages(pageChunks);
    // Safety valve #1: ถ้าฮิวริสติกจะซ่อนทุกหน้าจนไม่เหลือให้อ่าน ให้ถือว่าไม่พบสารบัญเลย ดีกว่าปล่อยให้
    // หน้าต่างอ่านคู่มือว่างเปล่า
    if (pageSplit.pageCount > 0 && result.count >= pageSplit.pageCount) {
      return { tocIndices: new Set<number>(), count: 0 };
    }
    // Safety valve #2: สารบัญจริงในคลังคู่มือทั้งหมด (23 เล่ม) ไม่เคยเกิน ~6% ของจำนวนหน้าในเล่มเดียวกัน
    // ถ้าฮิวริสติกตรวจพบเกิน 25% ของหน้าทั้งหมด (มีระยะเผื่อกว้างจากเคสแย่สุดที่เจอจริง) แปลว่าน่าจะตรวจพลาด
    // กับเอกสารที่มีโครงสร้างแปลกไปจากคลังที่ใช้วิเคราะห์ — ปิดการซ่อนไปเลยดีกว่าเสี่ยงบังเนื้อหาจริง
    if (pageSplit.pageCount > 0 && result.count / pageSplit.pageCount > 0.25) {
      return { tocIndices: new Set<number>(), count: 0 };
    }
    return result;
  }, [pageSplit]);

  // ดัชนี (0-based ตามลำดับหน้าจริง ไม่รวมส่วนนำ) ของหน้าที่ไม่ใช่สารบัญ — ใช้เป็นค่าเริ่มต้น (ซ่อนสารบัญ)
  const nonTocPageIndices = useMemo(() => {
    if (!pageSplit) return null;
    const indices: number[] = [];
    for (let i = 0; i < pageSplit.pageCount; i++) {
      if (!tocDetection || !tocDetection.tocIndices.has(i)) indices.push(i);
    }
    return indices;
  }, [pageSplit, tocDetection]);

  // รายการดัชนีหน้าที่จะแสดงจริงตอนนี้ — สลับตามปุ่ม "แสดงสารบัญ/ซ่อนสารบัญ" (showToc)
  // ค่านี้คือแหล่งเดียวที่ใช้คำนวณทั้ง visibleMarkdown, ป้าย "แสดงหน้า 1-N จาก M" และปุ่ม "โหลดเพิ่ม"
  // เพื่อให้ตัวเลขที่แสดงตรงกับเนื้อหาที่อยู่บนจอเสมอ
  const displayedPageIndices = useMemo(() => {
    if (!pageSplit) return null;
    if (showToc || !tocDetection || tocDetection.count === 0) {
      return Array.from({ length: pageSplit.pageCount }, (_, i) => i);
    }
    return nonTocPageIndices ?? [];
  }, [pageSplit, showToc, tocDetection, nonTocPageIndices]);

  // เนื้อหาที่จะป้อนให้ ReactMarkdown แสดงจริง (ตัดตามหน้าที่มองเห็นอยู่ หรือ fallback ตามเพดานความยาว)
  // memo ไว้เพื่อไม่ให้ต้องต่อสตริง/ตัดสตริงใหม่ทุกครั้งที่ re-render จากเหตุอื่น (เช่นปุ่มคัดลอกกด setCopied)
  // ซึ่งคู่มือที่โหลดครบ 632 หน้าจะมีเนื้อหาราว 2.6MB — reparse ซ้ำโดยไม่จำเป็นจะทำให้แท็บเล็ตหน่วง
  const visibleMarkdown = useMemo(() => {
    if (!activeContent) return null;
    if (pageSplit) {
      const preamble = pageSplit.chunks.slice(0, pageSplit.preambleCount);
      const indices = (displayedPageIndices ?? []).slice(0, visiblePageCount);
      const pageTexts = indices.map((i) => pageSplit.chunks[pageSplit.preambleCount + i]);
      return [...preamble, ...pageTexts].join("\n\n");
    }
    if (activeContent.length > FALLBACK_CHAR_LIMIT && !showFullFallback) {
      return activeContent.slice(0, FALLBACK_CHAR_LIMIT);
    }
    return activeContent;
  }, [activeContent, pageSplit, displayedPageIndices, visiblePageCount, showFullFallback]);

  // จำนวนหน้าที่ "มองเห็นได้จริงตอนนี้" (หลังกรองสารบัญ/สลับ showToc) — ใช้แทน pageSplit.pageCount
  // ในป้ายข้อความและปุ่มโหลดเพิ่ม เพื่อให้ตัวเลขตรงกับเนื้อหาที่แสดงบนจอเสมอ
  const effectivePageCount = displayedPageIndices?.length ?? pageSplit?.pageCount ?? 0;

  const handleCopyMarkdown = (text?: string) => {
    if (!text) return;
    // บนเครือข่ายโรงงานที่ใช้ http ธรรมดา (non-secure context) navigator.clipboard
    // จะเป็น undefined — ต้องกันไว้ก่อนเรียกใช้ ไม่ให้ทั้งฟังก์ชันโยน error แบบไม่มีข้อความ
    if (!navigator.clipboard) {
      setCopyError("อุปกรณ์นี้ไม่รองรับการคัดลอกเนื้อหาอัตโนมัติ กรุณาคัดลอกด้วยตนเอง");
      return;
    }
    setCopyError(null);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopyError("คัดลอกเนื้อหาไม่สำเร็จ กรุณาลองอีกครั้ง");
      });
  };

  const handleOpenFile = async (doc: ManualDoc) => {
    setFileErrorMessages((prev) => {
      const next = { ...prev };
      delete next[doc.id];
      return next;
    });
    setLoadingFileIds((prev) => new Set(prev).add(doc.id));

    // เปิดแท็บใหม่ทันทีในระหว่าง gesture ของผู้ใช้ (ก่อน await) มิฉะนั้นเบราว์เซอร์บนแท็บเล็ต
    // (iPad Safari / Android Chrome) จะมองว่าไม่ใช่การเปิดจากการกดของผู้ใช้แล้วบล็อกป็อปอัป
    const win = window.open("", "_blank");
    if (!win) {
      setFileErrorMessages((prev) => ({
        ...prev,
        [doc.id]: "เบราว์เซอร์บล็อกการเปิดแท็บใหม่ กรุณาอนุญาต pop-up แล้วลองอีกครั้ง",
      }));
      setLoadingFileIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
      return;
    }

    try {
      const { url } = await getManualFileUrl(doc.id);
      win.opener = null;
      win.location.replace(url);
    } catch (err) {
      win.close();
      setFileErrorMessages((prev) => ({
        ...prev,
        [doc.id]: toUserMessage(err, `ไม่สามารถเปิดไฟล์ PDF ของคู่มือ "${doc.title}" ได้`),
      }));
    } finally {
      setLoadingFileIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!manualToDelete) return;
    const doc = manualToDelete;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteManual(doc.id);
      // อัปเดตรายการในหน้านี้เอง (view ดึงข้อมูลเอง ไม่มี App.tsx คอยรีเฟรชให้แล้ว)
      setManuals((prev) => {
        const next = prev.filter((m) => m.id !== doc.id);
        // ลบเล่มสุดท้ายของหน้านี้ (เช่นอยู่หน้าท้ายสุดที่มีเล่มเดียว) แล้วต้องไม่ค้างแสดง
        // หน้าว่างเปล่า — ถอยกลับไปหน้าก่อนหน้าแทน (useEffect ด้านบนจะดึงใหม่ตาม offset นี้)
        if (next.length === 0 && manualsOffset > 0) {
          setManualsOffset((prevOffset) => Math.max(0, prevOffset - MANUALS_PAGE_SIZE));
        }
        return next;
      });
      setManualsTotal((prev) => Math.max(0, prev - 1));
      onDeleted?.(doc.id, doc.title);
      // ปิดหน้าต่างอ่านคู่มือถ้ากำลังเปิดคู่มือเล่มที่ถูกลบอยู่ ไม่เช่นนั้นจะค้างแสดงคู่มือที่ไม่มีอยู่แล้ว
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
      setManualToDelete(null);
    } catch (err) {
      setDeleteError(toUserMessage(err, `ไม่สามารถลบคู่มือ "${doc.title}" ได้`));
    } finally {
      setDeleteLoading(false);
    }
  };

  // แปลงค่า category ที่เก็บในฐานข้อมูล (อังกฤษ เช่น "General") เป็นป้ายภาษาไทยที่ผู้ใช้เห็น
  // ค่าที่ไม่รู้จัก (ไม่อยู่ใน MANUAL_CATEGORIES) จะแสดงค่าดิบแทน ไม่ให้ล้มทั้งหน้า
  const getCategoryLabel = (category: string): string =>
    MANUAL_CATEGORIES.find((c) => c.value === category)?.label ?? category;

  const openEditModal = (doc: ManualDoc) => {
    setManualToEdit(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditTagsInput(doc.tags.join(", "));
    const knownModels = machineModels ?? [];
    setEditIsCustomModel(knownModels.length > 0 && !knownModels.includes(doc.machineModel));
    setEditMachineModel(doc.machineModel);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!manualToEdit) return;
    const trimmedTitle = editTitle.trim();
    const trimmedModel = editMachineModel.trim();
    if (trimmedTitle === "" || trimmedModel === "") {
      setEditError("กรุณากรอกชื่อคู่มือและรุ่นเครื่องจักรให้ครบก่อนบันทึก");
      return;
    }
    const tags = editTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await updateManual(manualToEdit.id, {
        title: trimmedTitle,
        machineModel: trimmedModel,
        category: editCategory,
        tags,
      });
      setManuals((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      onUpdated?.(updated);
      if (selectedDoc?.id === updated.id) {
        setSelectedDoc(updated);
      }
      setManualToEdit(null);
    } catch (err) {
      setEditError(toUserMessage(err, `ไม่สามารถบันทึกคู่มือ "${manualToEdit.title}" ได้`));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Upload benefit banner */}
      <div className="bg-primary/5 text-ink rounded-[18px] p-5 border border-primary/20 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm sm:text-base text-ink">
            ค้นหาคู่มือได้จากชื่อคู่มือ รุ่นเครื่อง และแท็ก
          </h3>
          <p className="text-xs text-ink-muted">
            เพิ่มคู่มือเครื่องจักรเข้าคลัง เพื่อให้ทีมช่างค้นหาคู่มือที่ต้องการได้เร็วขึ้นจากทุกหน้าจอ
          </p>
        </div>
        {onGoToUpload && (
          <button
            onClick={onGoToUpload}
            className="min-h-11 px-4 py-2 rounded-full bg-primary hover:bg-primary-focus text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
          >
            อัปโหลดคู่มือ PDF
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" aria-hidden="true" />
        <label htmlFor="manuals-search" className="sr-only">
          ค้นหาคู่มือเครื่องจักร
        </label>
        <input
          id="manuals-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อคู่มือ รุ่นเครื่อง หรือคำค้น เช่น Wiring, Spindle"
          aria-label="ค้นหาชื่อคู่มือ รุ่นเครื่อง หรือคำค้น"
          className="w-full bg-white border border-hairline rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
        />
        {/* บอกว่ากำลังค้นหาที่ server อยู่ โดยไม่ล้างผลลัพธ์เดิมออกจนกระพริบ */}
        {manualsLoading && (
          <Loader2
            className="w-4 h-4 text-ink-faint absolute right-3.5 top-3 animate-spin"
            aria-hidden="true"
          />
        )}
      </div>

      {manualsLoadError && (
        <div className="bg-rose-50 border border-rose-200 rounded-[18px] p-4 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">{manualsLoadError}</p>
        </div>
      )}

      {/* Machine-context filter — off by default so nothing is hidden by surprise */}
      {activeMachine && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={onlyActiveMachine}
            onClick={() => setOnlyActiveMachine((v) => !v)}
            className={`min-h-11 px-4 py-2 rounded-full text-[13px] font-semibold inline-flex items-center gap-2 border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60 ${
              onlyActiveMachine
                ? "bg-primary/10 border-primary/30 text-ink"
                : "bg-white border-hairline text-ink-muted hover:border-primary/40"
            }`}
          >
            <Cpu className="w-4 h-4 text-primary shrink-0" />
            <span>
              เฉพาะคู่มือของเครื่อง {activeMachine.code} ({activeMachine.model})
            </span>
            {onlyActiveMachine && <X className="w-4 h-4 shrink-0" />}
          </button>
        </div>
      )}

      {/* Manuals List Cards */}
      {manualsLoading && manuals.length === 0 && !manualsLoadError ? (
        <SkeletonCardGrid count={6} />
      ) : manualsTotal === 0 && !manualsLoadError ? (
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-ink-muted mx-auto" />
          {searchQuery.trim() === "" && !onlyActiveMachine ? (
            <>
              <p className="text-sm font-semibold text-ink">ยังไม่มีคู่มือในคลัง</p>
              <p className="text-xs text-ink-muted">
                อัปโหลดคู่มือ PDF เข้าคลังเพื่อให้ทีมช่างค้นหาเนื้อหาได้จากทุกหน้าจอ
              </p>
            </>
          ) : onlyActiveMachine && activeMachine && searchQuery.trim() === "" ? (
            <>
              <p className="text-sm font-semibold text-ink">
                ยังไม่มีคู่มือของรุ่น {activeMachine.model} ในคลัง
              </p>
              <p className="text-xs text-ink-muted">
                ปิดตัวกรองเฉพาะเครื่องเพื่อดูคู่มือทั้งหมด
              </p>
              <button
                onClick={() => setOnlyActiveMachine(false)}
                className="mt-1 min-h-11 px-4 py-2.5 rounded-full bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-primary/5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
              >
                ปิดตัวกรองเฉพาะเครื่อง
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink">ไม่พบคู่มือที่ตรงกับคำค้นหา</p>
              <p className="text-xs text-ink-muted">ลองใช้ชื่อรุ่นเครื่องหรือคำค้นหาอื่น</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-1 min-h-11 px-4 py-2.5 rounded-full bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-primary/5 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
              >
                ล้างคำค้นหา
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manuals.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-[18px] border border-hairline p-5 hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {getCategoryLabel(doc.category)}
                  </span>
                  <span className="text-[13px] text-ink-muted font-normal tabular-nums">
                    {doc.fileSize}
                    {doc.pagesCount > 0 ? ` · ${doc.pagesCount} หน้า` : ""}
                  </span>
                </div>

                <OcrStatusBadge ocrStatus={doc.ocrStatus} />
                <DraftApprovalBadge ocrStatus={doc.ocrStatus} markdownApproved={doc.markdownApproved} />

                <h3 className="font-semibold text-ink text-sm leading-snug">
                  {doc.title}
                </h3>

                <div className="text-[13px] text-ink-muted">
                  รุ่นเครื่อง: <span className="font-semibold text-ink">{doc.machineModel}</span>
                </div>

                {/* Provenance — in a maintenance library, who uploaded a manual and when is part of the document */}
                <div className="text-[13px] text-ink-muted">
                  อัปโหลดโดย {doc.uploadedBy} ·{" "}
                  <span className="tabular-nums">{doc.uploadDate}</span>
                </div>

                {doc.aiIndexed && (
                  <div className="inline-flex items-center gap-1 text-[13px] text-primary font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>ค้นหาด้วย AI ได้</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 pt-1">
                  {doc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-divider text-ink-muted px-2 py-0.5 rounded-full font-normal"
                    >
                      <Tag className="w-2.5 h-2.5 text-ink-muted" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-divider flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-3 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-primary/5 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer flex-1 justify-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>อ่านคู่มือ</span>
                </button>

                {doc.filePath && (
                  <button
                    onClick={() => handleOpenFile(doc)}
                    disabled={loadingFileIds.has(doc.id)}
                    className="px-3 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-primary/5 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer flex-1 justify-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{loadingFileIds.has(doc.id) ? "กำลังเปิดไฟล์..." : "เปิดไฟล์ PDF"}</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    onAskAI(
                      `ช่วยสรุปขั้นตอนสำคัญและตารางวิเคราะห์ปัญหาจากคู่มือ "${doc.title}" สำหรับเครื่องรุ่น ${doc.machineModel}`
                    )
                  }
                  className="px-3 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
                  title="ถาม AI จากคู่มือนี้"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ถาม AI</span>
                </button>
              </div>

              {canManage && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => openEditModal(doc)}
                    className="px-3 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-primary/5 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
                  >
                    <Pencil className="w-3.5 h-3.5 text-ink-muted" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    onClick={() => setManualToDelete(doc)}
                    className="px-3 py-2.5 rounded-[11px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400/40 min-h-11"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                    <span>ลบ</span>
                  </button>
                </div>
              )}

              {/* File-open error for this specific card — rendered next to the button that triggered it */}
              {fileErrorMessages[doc.id] && (
                <div
                  role="alert"
                  className="bg-rose-50 border border-rose-200 p-3 rounded-[11px] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-900 leading-relaxed">
                    {fileErrorMessages[doc.id]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {manualsTotal > 0 && (
        <Pagination
          offset={manualsOffset}
          limit={MANUALS_PAGE_SIZE}
          total={manualsTotal}
          onOffsetChange={setManualsOffset}
          isLoading={manualsLoading}
          itemLabel="เล่ม"
        />
      )}

      {/* Manual reader modal */}
      {selectedDoc && (
        <Modal size="xl" onClose={() => setSelectedDoc(null)}>
          <ModalHeader onClose={() => setSelectedDoc(null)}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                {getCategoryLabel(selectedDoc.category)}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-ink leading-snug">
                {selectedDoc.title}
              </h3>
              <div className="flex items-center gap-3 flex-wrap text-[13px] text-ink-muted font-normal">
                <span>รุ่นเครื่อง: <strong className="text-ink">{selectedDoc.machineModel}</strong></span>
                <span>·</span>
                <span className="tabular-nums">
                  ขนาดไฟล์: {selectedDoc.fileSize}
                  {selectedDoc.pagesCount > 0 ? ` (${selectedDoc.pagesCount} หน้า)` : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-[13px] text-ink-muted font-normal">
                <span>
                  อัปโหลดโดย {selectedDoc.uploadedBy} ·{" "}
                  <span className="tabular-nums">{selectedDoc.uploadDate}</span>
                </span>
                {selectedDoc.aiIndexed && (
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    ค้นหาด้วย AI ได้
                  </span>
                )}
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            {isContentLoading ? (
              <div className="bg-divider text-ink-muted p-8 rounded-[18px] text-center space-y-3 my-4 border border-hairline">
                <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                <p className="text-sm text-ink-muted">กำลังโหลดเนื้อหาคู่มือ…</p>
              </div>
            ) : activeContentError ? (
              <div className="bg-rose-50 border border-rose-200 p-8 rounded-[18px] text-center space-y-3 my-4">
                <AlertCircle className="w-10 h-10 text-rose-700 mx-auto" />
                <p className="text-sm font-semibold text-rose-900">{activeContentError}</p>
                <button
                  onClick={() => setContentFetchNonce((n) => n + 1)}
                  className="min-h-11 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            ) : activeContent ? (
              pageSplit ? (
                <div className="text-xs sm:text-sm leading-relaxed text-ink-muted">
                  {/* หน้าสารบัญที่ตรวจพบจะถูกซ่อนไว้เป็นค่าเริ่มต้น (ดู manualToc.ts) — ฮิวริสติกอาจพลาด
                      จึงต้องมีทางกู้คืนให้ผู้ใช้กดดูต้นฉบับทั้งหมดได้เสมอ ไม่ปิดกั้นถาวร */}
                  {tocDetection && tocDetection.count > 0 && (
                    <div className="flex items-center justify-between gap-2 bg-amber-50/70 border border-amber-200 rounded-[11px] px-3 py-2 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-amber-900">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        {showToc
                          ? `กำลังแสดงหน้าสารบัญ ${tocDetection.count} หน้า`
                          : `ซ่อนสารบัญ ${tocDetection.count} หน้า`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const tocCount = tocDetection?.count ?? 0;
                          const next = !showToc;
                          // สลับ showToc เปลี่ยนความหมายของ "visiblePageCount หน้าแรก" ทันที — ตอนซ่อนสารบัญ
                          // มันนับเฉพาะหน้าที่ไม่ใช่สารบัญ แต่พอเปิดสารบัญ หน้าสารบัญจะแทรกเข้ามาปนในลิสต์เดียวกัน
                          // ถ้าไม่ปรับตัวเลข เนื้อหาเดิมที่เห็นอยู่จะถูกหน้าสารบัญที่แทรกเข้ามาดันหลุดออกจากมุมมอง
                          // จึงต้องบวก/ลบ tocCount ตามทิศทางที่สลับ แล้ว clamp ไว้ไม่ให้ต่ำกว่าค่าเริ่มต้น
                          // หรือเกินจำนวนหน้าที่มีจริงในมุมมองใหม่ (กันค่าค้างเป็น "เพดานลอย" หลังสลับ ปิด-เปิด ซ้ำ ๆ)
                          setVisiblePageCount((n) => {
                            const bumped = next ? n + tocCount : n - tocCount;
                            const targetMax = next
                              ? pageSplit?.pageCount ?? bumped
                              : nonTocPageIndices?.length ?? bumped;
                            return Math.min(Math.max(bumped, DEFAULT_VISIBLE_PAGES), targetMax);
                          });
                          setShowToc(next);
                        }}
                        className="min-h-8 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-[13px] font-semibold hover:bg-amber-100 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 shrink-0"
                      >
                        {showToc ? "ซ่อนสารบัญ" : "แสดงสารบัญ"}
                      </button>
                    </div>
                  )}
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {visibleMarkdown ?? ""}
                  </ReactMarkdown>
                  <div className="text-center pt-3 pb-1 mt-3 border-t border-hairline space-y-2">
                    <p className="text-xs text-ink-muted tabular-nums">
                      {/* เดิมเขียนว่า "แสดงหน้า 1-N จาก M" ซึ่งเป็นช่วงเท็จ — เมื่อกรองหน้าสารบัญออกแล้ว
                          หน้าที่แสดงจริงอาจเป็น 1, 2, 4...16 (ไม่ต่อเนื่อง) ไม่ใช่ช่วง 1-N จึงเปลี่ยนเป็นบอก
                          "จำนวน" แทน "ช่วง" ให้ตรงกับข้อความปุ่ม "เหลืออีก X หน้า" ด้านล่าง */}
                      แสดง {Math.min(visiblePageCount, effectivePageCount)} จาก {effectivePageCount} หน้า
                    </p>
                    {visiblePageCount < effectivePageCount && (
                      <button
                        onClick={() =>
                          setVisiblePageCount((n) =>
                            Math.min(n + DEFAULT_VISIBLE_PAGES, effectivePageCount)
                          )
                        }
                        className="min-h-11 px-4 py-2 rounded-full bg-pearl border border-divider text-ink-muted hover:bg-primary/5 text-[13px] font-semibold cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                      >
                        โหลดเพิ่ม (เหลืออีก {effectivePageCount - visiblePageCount} หน้า)
                      </button>
                    )}
                  </div>
                </div>
              ) : activeContent.length > FALLBACK_CHAR_LIMIT && !showFullFallback ? (
                <div className="text-xs sm:text-sm leading-relaxed text-ink-muted">
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {visibleMarkdown ?? ""}
                  </ReactMarkdown>
                  <div className="text-center pt-3 pb-1 mt-3 border-t border-hairline">
                    <button
                      onClick={() => setShowFullFallback(true)}
                      className="min-h-11 px-4 py-2 rounded-full bg-pearl border border-divider text-ink-muted hover:bg-primary/5 text-[13px] font-semibold cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/60"
                    >
                      แสดงทั้งหมด
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm leading-relaxed text-ink-muted">
                  <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {visibleMarkdown ?? ""}
                  </ReactMarkdown>
                </div>
              )
            ) : (
              <div className="bg-divider text-ink-muted p-8 rounded-[18px] text-center space-y-3 my-4 border border-hairline">
                <BookOpen className="w-12 h-12 text-primary mx-auto" />
                <div className="text-sm font-semibold text-ink">
                  คู่มือนี้ยังไม่มีเนื้อหาข้อความสำหรับแสดงผล
                </div>
                {selectedDoc.filePath ? (
                  <p className="text-xs text-ink-muted max-w-md mx-auto">
                    ต้นฉบับเป็นไฟล์ PDF
                    {selectedDoc.pagesCount > 0 ? ` จำนวน ${selectedDoc.pagesCount} หน้า` : ""}{" "}
                    สามารถเปิดไฟล์ต้นฉบับ หรือให้ AI ช่วยสรุปประเด็นจากคู่มือนี้ได้
                  </p>
                ) : (
                  <p className="text-xs text-ink-muted max-w-md mx-auto">
                    คู่มือนี้ยังไม่มีไฟล์ต้นฉบับหรือเนื้อหาข้อความในระบบ
                    ลองให้ AI ช่วยสรุปประเด็นจากคู่มือนี้ หรือติดต่อผู้ดูแลคลังคู่มือ
                  </p>
                )}
              </div>
            )}

            {/* File-open error for the doc shown in this modal */}
            {fileErrorMessages[selectedDoc.id] && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 p-3 rounded-[11px] flex items-start gap-2.5 mt-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-900 leading-relaxed">
                  {fileErrorMessages[selectedDoc.id]}
                </p>
              </div>
            )}

            {/* Copy-to-clipboard error for the reader modal */}
            {copyError && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 p-3 rounded-[11px] flex items-start gap-2.5 mt-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-900 leading-relaxed">{copyError}</p>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="sm:justify-between">
            <button
              onClick={() => handleCopyMarkdown(activeContent ?? undefined)}
              disabled={isContentLoading || !activeContent}
              className="w-full sm:w-auto px-4 py-2.5 rounded-[11px] bg-pearl border border-divider hover:bg-primary/5 text-ink-muted font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-ink-muted" />}
              <span>{copied ? "คัดลอกแล้ว" : "คัดลอกเนื้อหา"}</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-xs hover:bg-primary/5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
              >
                ปิดหน้าต่าง
              </button>
              {canManage && (
                <button
                  onClick={() => openEditModal(selectedDoc)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-xs hover:bg-primary/5 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
                >
                  <Pencil className="w-4 h-4 text-ink-muted" />
                  <span>แก้ไข</span>
                </button>
              )}
              {canManage && (
                <button
                  onClick={() => setManualToDelete(selectedDoc)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-100 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400/40 min-h-11"
                >
                  <Trash2 className="w-4 h-4 text-rose-700" />
                  <span>ลบ</span>
                </button>
              )}
              {selectedDoc.filePath && (
                <button
                  onClick={() => handleOpenFile(selectedDoc)}
                  disabled={loadingFileIds.has(selectedDoc.id)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-xs hover:bg-primary/5 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span>{loadingFileIds.has(selectedDoc.id) ? "กำลังเปิดไฟล์..." : "เปิดไฟล์ PDF"}</span>
                </button>
              )}
              <button
                onClick={() => {
                  onAskAI(`ขอขั้นตอนซ่อมและวิเคราะห์ปัญหาจากคู่มือ ${selectedDoc.title}`);
                  setSelectedDoc(null);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11"
              >
                <Sparkles className="w-4 h-4" />
                <span>ให้ AI ช่วยวิเคราะห์คู่มือนี้</span>
              </button>
            </div>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete confirmation modal — reuses the repo's Modal instead of window.confirm,
          which is jarring and inconsistent on a gloved-hand tablet workflow */}
      {manualToDelete && (
        <Modal
          size="sm"
          onClose={() => {
            if (deleteLoading) return;
            setManualToDelete(null);
            setDeleteError(null);
          }}
        >
          <ModalHeader
            onClose={() => {
              if (deleteLoading) return;
              setManualToDelete(null);
              setDeleteError(null);
            }}
          >
            <h3 className="text-base font-semibold text-ink">ยืนยันลบคู่มือ</h3>
          </ModalHeader>

          <ModalBody>
            <p className="text-sm text-ink leading-relaxed">
              ยืนยันลบคู่มือ «{manualToDelete.title}»?
            </p>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">
              ไฟล์ PDF ของคู่มือนี้จะถูกลบออกจากคลังไปด้วย และไม่สามารถกู้คืนได้
            </p>

            {deleteError && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 p-3 rounded-[11px] flex items-start gap-2.5 mt-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-900 leading-relaxed">{deleteError}</p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <button
              onClick={() => {
                setManualToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteLoading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-xs hover:bg-primary/5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              aria-busy={deleteLoading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleteLoading ? "กำลังลบ..." : "ลบคู่มือ"}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Edit manual metadata modal */}
      {manualToEdit && (
        <Modal
          size="md"
          onClose={() => {
            if (editLoading) return;
            setManualToEdit(null);
            setEditError(null);
          }}
        >
          <ModalHeader
            onClose={() => {
              if (editLoading) return;
              setManualToEdit(null);
              setEditError(null);
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-ink">แก้ไขข้อมูลคู่มือ</h3>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-manual-title-input"
                  className="block text-[13px] font-semibold text-ink mb-1.5"
                >
                  ชื่อคู่มือ <span className="text-rose-600">*</span>
                </label>
                <input
                  id="edit-manual-title-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={editLoading}
                  className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-manual-machine-model-input"
                  className="block text-[13px] font-semibold text-ink mb-1.5"
                >
                  รุ่นเครื่องจักร <span className="text-rose-600">*</span>
                </label>
                {machineModels && machineModels.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      id="edit-manual-machine-model-input"
                      value={editIsCustomModel ? CUSTOM_MODEL_OPTION : editMachineModel}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === CUSTOM_MODEL_OPTION) {
                          setEditIsCustomModel(true);
                          setEditMachineModel("");
                        } else {
                          setEditIsCustomModel(false);
                          setEditMachineModel(value);
                        }
                      }}
                      disabled={editLoading}
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
                    {editIsCustomModel && (
                      <input
                        id="edit-manual-machine-model-custom-input"
                        type="text"
                        value={editMachineModel}
                        onChange={(e) => setEditMachineModel(e.target.value)}
                        disabled={editLoading}
                        className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                        placeholder="พิมพ์รุ่นเครื่องจักรที่ไม่มีในรายการ เช่น MTC SpeedMill-500X"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    id="edit-manual-machine-model-input"
                    type="text"
                    value={editMachineModel}
                    onChange={(e) => setEditMachineModel(e.target.value)}
                    disabled={editLoading}
                    className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                    placeholder="เช่น MTC SpeedMill-500X"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-manual-category-input"
                  className="block text-[13px] font-semibold text-ink mb-1.5"
                >
                  หมวดหมู่
                </label>
                <select
                  id="edit-manual-category-input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  disabled={editLoading}
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
                  htmlFor="edit-manual-tags-input"
                  className="block text-[13px] font-semibold text-ink mb-1.5"
                >
                  แท็ก
                </label>
                <input
                  id="edit-manual-tags-input"
                  type="text"
                  value={editTagsInput}
                  onChange={(e) => setEditTagsInput(e.target.value)}
                  disabled={editLoading}
                  className="w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60"
                  placeholder="เช่น CNC, Spindle, Lubrication"
                />
                <p className="text-xs text-ink-faint mt-1">
                  คั่นแท็กหลายรายการด้วยเครื่องหมายจุลภาค (,)
                </p>
              </div>

              {editError && (
                <div
                  role="alert"
                  className="bg-rose-50 border border-rose-200 p-3 rounded-[11px] flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-rose-900 leading-relaxed">{editError}</p>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              onClick={() => {
                setManualToEdit(null);
                setEditError(null);
              }}
              disabled={editLoading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-xs hover:bg-primary/5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={editLoading}
              aria-busy={editLoading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-focus/40 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {editLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};
