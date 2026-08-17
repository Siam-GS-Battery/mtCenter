import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  PackagePlus,
  AlertCircle,
  Boxes,
  AlertTriangle,
  PackageX,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  MapPin,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { SparePart, SparePartInput, SparePartStats } from "../../types";
import {
  createSparePart,
  updateSparePart,
  adjustSparePartStock,
  deleteSparePart,
  getSpareParts,
  toUserMessage,
} from "../../services/apiService";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { sparePartStatusPillClass } from "../../lib/pillStyles";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

// จำนวนรายการต่อหน้าของตาราง/การ์ดจัดการอะไหล่
const PAGE_SIZE = 50;

interface SparePartsAdminViewProps {
  /**
   * Aggregate counts/value from GET /api/spare-parts/stats. The inventory
   * table below is now a server-side search/filter/paginated view (8,588 rows
   * total, well past any single page), so the KPI tiles read from here
   * instead of reducing over whatever page happens to be loaded.
   */
  stats: SparePartStats | null;
  /** id ของโปรไฟล์ผู้ใช้ปัจจุบัน — ส่งเป็น x-user-id ไปกับทุกคำขอแก้ไขข้อมูล */
  actorId: string;
  onCreated: (part: SparePart) => void;
  onUpdated: (part: SparePart) => void;
  onDeleted: (id: string) => void;
}

const STATUS_FILTER_OPTIONS: { value: "all" | SparePart["status"]; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "in_stock", label: "มีพร้อมใช้" },
  { value: "low_stock", label: "เหลือน้อย" },
  { value: "out_of_stock", label: "หมดสต็อก" },
];

const STATUS_LABELS: Record<SparePart["status"], string> = {
  in_stock: "มีพร้อมใช้",
  low_stock: "เหลือน้อย",
  out_of_stock: "หมดสต็อก",
};

// See the identical comment in SparePartsView.tsx — unitPriceTHB can be null
// on real imported rows even though the type says `number`.
const baht = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "—" : `฿${value.toLocaleString("th-TH")}`;

// หน่วยนับอะไหล่ที่พบบ่อย — ใช้เป็นตัวเลือกตั้งต้นในดรอปดาวน์ "หน่วย" ของฟอร์มเพิ่ม/แก้ไข
// จากนั้นจะรวมกับหน่วยจริงที่มีอยู่ในฐานข้อมูล (ดู unitOptions) เพื่อไม่ให้หน่วยเดิมของอะไหล่
// บางรายการที่ไม่อยู่ในรายการนี้หายไปจากตัวเลือก
const COMMON_UNIT_OPTIONS = [
  "ชิ้น",
  "ตัว",
  "ชุด",
  "อัน",
  "เส้น",
  "ม้วน",
  "กล่อง",
  "แพ็ค",
  "ลิตร",
  "แกลลอน",
  "กิโลกรัม",
  "เมตร",
  "ตลับ",
  "หลอด",
];

type FormMode = "add" | "edit";
type StockDirection = "in" | "out";

// SparePartInput ปฏิเสธ null สำหรับฟิลด์ที่แก้ไขได้ (unit/imageUrl/category/locationRack เป็น
// string | undefined เท่านั้น) แต่แบ็กเอนด์ยอมรับ null จริง ๆ เพื่อ "ล้างค่า" ฟิลด์เหล่านี้ตอนแก้ไข
// จึงต้องมี type ท้องถิ่นที่กว้างกว่าไว้ใช้เฉพาะตอนส่ง PATCH แล้ว cast ตรงจุดเรียกใช้งานเท่านั้น
type SparePartEditPayload = {
  code: string;
  name: string;
  category: string | null;
  compatibleMachines: string[];
  unit: string | null;
  minThreshold: number;
  locationRack: string | null;
  unitPriceTHB: number;
  imageUrl: string | null;
};

const inputClass =
  "w-full min-h-11 bg-white border border-hairline rounded-[11px] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60";
const selectFieldClass =
  "w-full appearance-none min-h-11 bg-white border border-hairline rounded-[11px] pl-3.5 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60 cursor-pointer";
const labelClass = "block text-[13px] font-semibold text-ink mb-1.5";
const primaryBtnClass =
  "min-h-11 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60 disabled:cursor-not-allowed";
const secondaryBtnClass =
  "min-h-11 px-5 py-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-parchment font-semibold text-xs cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary-focus/40 disabled:opacity-60 disabled:cursor-not-allowed";
const destructiveBtnClass =
  "min-h-11 px-5 py-2.5 rounded-[11px] bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-rose-400/40 disabled:opacity-60 disabled:cursor-not-allowed";
const iconBtnClass =
  "min-h-11 min-w-11 p-2.5 rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-parchment cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-focus/40";
// เวอร์ชันแคบกว่าของ iconBtnClass สำหรับคอลัมน์ "จัดการ" ในตารางเดสก์ท็อป — คงความสูง 44px
// (พื้นที่แตะยังผ่านเกณฑ์) แต่ลดความกว้างเพื่อให้ปุ่มสามทั้งชุดพอดีกับคอลัมน์ ~12% ที่แคบลง
const tableIconBtnClass =
  "h-11 w-9 shrink-0 rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-parchment cursor-pointer active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-focus/40";

function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="bg-rose-50 border border-rose-200 rounded-[11px] p-3 flex items-start gap-2.5"
    >
      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
      <p className="text-xs font-semibold text-rose-900 leading-relaxed">{message}</p>
    </div>
  );
}

export default function SparePartsAdminView(props: SparePartsAdminViewProps) {
  const { stats, actorId, onCreated, onUpdated, onDeleted } = props;

  const [searchQuery, setSearchQuery] = useState("");
  // ยิงค้นหาไป server หลังพิมพ์หยุด ~300ms กันยิงถี่ทุกตัวอักษร
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SparePart["status"]>("all");

  // --- คลังอะไหล่ตอนนี้มี 8,588 รายการ เกินขนาดหน้าสูงสุดของ backend (1,000)
  // ไปมาก จึงค้นหา/กรองสถานะ/แบ่งหน้าที่ server แทนการโหลดทั้งก้อนมากรองในเครื่อง ----
  const [offset, setOffset] = useState(0);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // สะสมหมวดหมู่/หน่วยที่เคยเห็นจากทุกหน้าที่โหลดมาแล้วในเซสชันนี้ (ไม่ใช่แค่หน้าปัจจุบัน)
  // เพื่อให้ตัวเลือกในฟอร์ม/ตัวกรองครอบคลุมมากกว่าจะรีเซ็ตทุกครั้งที่เปลี่ยนหน้า —
  // ยังไม่ครบทั้งคลังจนกว่าจะเคยเห็นผ่านการค้นหา/แบ่งหน้ามาก่อน (ไม่มี endpoint แยกสำหรับดึง
  // ค่าที่ไม่ซ้ำกันทั้งหมด จึงไม่ควรประดิษฐ์ endpoint ใหม่)
  const [seenCategories, setSeenCategories] = useState<Set<string>>(new Set());
  const [seenUnits, setSeenUnits] = useState<Set<string>>(new Set());

  // เปลี่ยนคำค้นหา/สถานะ -> กลับไปหน้าแรกเสมอ (ผลลัพธ์ชุดใหม่ไม่ใช่หน้าเดิม)
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch, statusFilter]);

  const fetchPage = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getSpareParts({
      search: debouncedSearch.trim() || undefined,
      stockStatus: statusFilter !== "all" ? statusFilter : undefined,
      limit: PAGE_SIZE,
      offset,
    })
      .then((res) => {
        if (cancelled) return;
        setSpareParts(res.data);
        setPageTotal(res.meta?.total ?? res.data.length);
        setSeenCategories((prev) => {
          const next = new Set(prev);
          res.data.forEach((p) => {
            if (p.category) next.add(p.category);
          });
          return next;
        });
        setSeenUnits((prev) => {
          const next = new Set(prev);
          res.data.forEach((p) => {
            if (p.unit) next.add(p.unit);
          });
          return next;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(toUserMessage(err, "ไม่สามารถโหลดคลังอะไหล่ได้"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, offset]);

  useEffect(() => fetchPage(), [fetchPage]);

  // --- แบบฟอร์มเพิ่ม/แก้ไขอะไหล่ ---
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [partToEdit, setPartToEdit] = useState<SparePart | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formStockQuantity, setFormStockQuantity] = useState("0");
  const [formUnit, setFormUnit] = useState("ชิ้น");
  const [formMinThreshold, setFormMinThreshold] = useState("0");
  const [formLocationRack, setFormLocationRack] = useState("");
  const [formUnitPrice, setFormUnitPrice] = useState("0");
  const [formMachinesInput, setFormMachinesInput] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // --- หน้าต่างรับเข้า/เบิกออกสต็อก ---
  const [stockPart, setStockPart] = useState<SparePart | null>(null);
  const [stockDirection, setStockDirection] = useState<StockDirection>("in");
  const [stockQtyInput, setStockQtyInput] = useState("1");
  const [stockNote, setStockNote] = useState("");
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // --- หน้าต่างยืนยันลบ ---
  const [partToDelete, setPartToDelete] = useState<SparePart | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // หมวดหมู่จริงในฐานข้อมูลอาจมีคำต่อท้าย เช่น "ลูกปืนและแบริ่ง (Bearings)" จึงต้องดึงรายการ
  // จากข้อมูลจริงเสมอ ห้ามใช้ค่าคงที่ตายตัวที่อาจไม่ตรงกับข้อมูลในคลัง — ไม่มี endpoint
  // แยกสำหรับ "หมวดหมู่ที่ไม่ซ้ำกันทั้งหมด" จึงสะสมจากทุกหน้าที่เคยโหลดมาแล้ว (seenCategories)
  // แทนที่จะมาจากหน้าปัจจุบันอย่างเดียว ซึ่งจะรีเซ็ตทุกครั้งที่เปลี่ยนหน้า/ค้นหาใหม่
  const categoryOptions = useMemo(() => Array.from(seenCategories).sort(), [seenCategories]);

  // รายการหน่วยตั้งต้น (COMMON_UNIT_OPTIONS) รวมกับหน่วยจริงที่เคยเห็นแล้วในคลัง (สะสมข้ามหน้า
  // เช่นเดียวกับ categoryOptions) เพื่อให้อะไหล่ที่ใช้หน่วยแปลก ๆ ยังมีตัวเลือกตรงกับค่าปัจจุบันเสมอ
  const unitOptions = useMemo(() => {
    const extras = Array.from(seenUnits).filter((u) => !COMMON_UNIT_OPTIONS.includes(u));
    return [...COMMON_UNIT_OPTIONS, ...extras.sort()];
  }, [seenUnits]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all";

  // ค้นหา (search) และสถานะ (stockStatus) กรองที่ server แล้ว (ดู fetchPage ด้านบน) —
  // เหลือแค่หมวดหมู่ที่ยังไม่มี query param รองรับที่ backend (คนละคอลัมน์กับ groupCode)
  // จึงกรองในเครื่องเฉพาะภายในหน้าที่โหลดมาแล้วเท่านั้น
  const filteredParts = spareParts.filter(
    (part) => categoryFilter === "all" || (part.category ?? "") === categoryFilter
  );

  // Prefer /api/spare-parts/stats for these KPI tiles — spareParts is now a
  // paginated list (max 1000 of 8,588 rows), so reducing over it directly
  // would silently under-report once the real inventory exceeds a page. Fall
  // back to the local array only while stats haven't loaded yet (or failed).
  const totalCount = stats?.total ?? spareParts.length;
  const lowStockCount =
    stats?.byStockStatus?.low_stock ?? spareParts.filter((p) => p.status === "low_stock").length;
  const outOfStockCount =
    stats?.outOfStock ?? spareParts.filter((p) => p.status === "out_of_stock").length;
  // A null unitPriceTHB means "price unknown", not "free" — that row is
  // skipped entirely rather than folded in as 0, so this total only covers
  // parts with a known price (fallback path only; /stats normally covers this).
  const totalValue =
    stats?.totalInventoryValue ??
    spareParts.reduce(
      (sum, p) => (p.unitPriceTHB == null ? sum : sum + p.stockQuantity * p.unitPriceTHB),
      0
    );

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const stockTextClass = (part: SparePart) => {
    if (part.stockQuantity <= 0) return "text-rose-700 font-semibold";
    if (part.stockQuantity <= part.minThreshold) return "text-amber-700 font-semibold";
    return "text-ink font-semibold";
  };

  /* ---------------------------------------------------------------- */
  /* Add / edit form modal                                             */
  /* ---------------------------------------------------------------- */

  const openAddModal = () => {
    setFormMode("add");
    setPartToEdit(null);
    setFormCode("");
    setFormName("");
    setFormCategory("");
    setFormStockQuantity("0");
    setFormUnit("ชิ้น");
    setFormMinThreshold("0");
    setFormLocationRack("");
    setFormUnitPrice("0");
    setFormMachinesInput("");
    setFormImageUrl("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEditModal = (part: SparePart) => {
    setFormMode("edit");
    setPartToEdit(part);
    setFormCode(part.code);
    setFormName(part.name);
    setFormCategory(part.category ?? "");
    setFormStockQuantity(String(part.stockQuantity));
    setFormUnit(part.unit || "ชิ้น");
    setFormMinThreshold(String(part.minThreshold));
    setFormLocationRack(part.locationRack ?? "");
    // Real rows can have no price on file (null) — start the input empty,
    // never with the literal text "null".
    setFormUnitPrice(part.unitPriceTHB != null ? String(part.unitPriceTHB) : "");
    setFormMachinesInput(part.compatibleMachines.join(", "));
    setFormImageUrl(part.imageUrl || "");
    setFormError(null);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setFormOpen(false);
    setPartToEdit(null);
    setFormError(null);
  };

  const validateForm = (): string | null => {
    if (formCode.trim() === "") return "กรุณากรอกรหัสอะไหล่";
    if (formName.trim() === "") return "กรุณากรอกชื่ออะไหล่";
    const minThreshold = Number(formMinThreshold);
    if (!Number.isFinite(minThreshold) || !Number.isInteger(minThreshold) || minThreshold < 0) {
      return "จุดสั่งซื้อขั้นต่ำต้องเป็นจำนวนเต็มไม่ติดลบ";
    }
    const unitPrice = Number(formUnitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return "ราคาต่อหน่วยต้องเป็นตัวเลขไม่ติดลบ";
    }
    if (formMode === "add") {
      const stockQuantity = Number(formStockQuantity);
      if (!Number.isFinite(stockQuantity) || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
        return "จำนวนคงเหลือต้องเป็นจำนวนเต็มไม่ติดลบ";
      }
    }
    return null;
  };

  const handleSubmitForm = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const compatibleMachines = formMachinesInput
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    setFormLoading(true);
    setFormError(null);
    try {
      if (formMode === "add") {
        const payload: SparePartInput = {
          code: formCode.trim(),
          name: formName.trim(),
          category: formCategory,
          compatibleMachines,
          stockQuantity: Number(formStockQuantity),
          unit: formUnit.trim() || undefined,
          minThreshold: Number(formMinThreshold),
          locationRack: formLocationRack.trim(),
          unitPriceTHB: Number(formUnitPrice),
          imageUrl: formImageUrl.trim() || undefined,
        };
        const created = await createSparePart(payload, actorId);
        onCreated(created);
        fetchPage();
      } else if (partToEdit) {
        const payload: SparePartEditPayload = {
          code: formCode.trim(),
          name: formName.trim(),
          category: formCategory.trim() || null,
          compatibleMachines,
          unit: formUnit.trim() || null,
          minThreshold: Number(formMinThreshold),
          locationRack: formLocationRack.trim() || null,
          unitPriceTHB: Number(formUnitPrice),
          imageUrl: formImageUrl.trim() || null,
        };
        const updated = await updateSparePart(
          partToEdit.id,
          payload as unknown as Partial<SparePartInput>,
          actorId
        );
        onUpdated(updated);
        fetchPage();
      } else {
        setFormError("ไม่พบอะไหล่ที่ต้องการแก้ไข");
        return;
      }
      setFormOpen(false);
      setPartToEdit(null);
    } catch (err) {
      setFormError(
        toUserMessage(
          err,
          formMode === "add" ? "ไม่สามารถเพิ่มอะไหล่ได้" : `ไม่สามารถบันทึกการแก้ไขอะไหล่ "${formName}" ได้`
        )
      );
    } finally {
      setFormLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Stock in/out modal                                                */
  /* ---------------------------------------------------------------- */

  const openStockModal = (part: SparePart) => {
    setStockPart(part);
    setStockDirection("in");
    setStockQtyInput("1");
    setStockNote("");
    setStockError(null);
  };

  const closeStockModal = () => {
    if (stockLoading) return;
    setStockPart(null);
    setStockError(null);
  };

  const stockQty = Number(stockQtyInput);
  const stockQtyValid = Number.isFinite(stockQty) && Number.isInteger(stockQty) && stockQty >= 1;
  const stockAfter = stockPart
    ? stockDirection === "in"
      ? stockPart.stockQuantity + (stockQtyValid ? stockQty : 0)
      : stockPart.stockQuantity - (stockQtyValid ? stockQty : 0)
    : 0;
  const stockWouldGoNegative = stockDirection === "out" && stockAfter < 0;

  const handleSubmitStock = async () => {
    if (!stockPart) return;
    if (!stockQtyValid) {
      setStockError("กรุณาระบุจำนวนเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป");
      return;
    }
    if (stockWouldGoNegative) {
      setStockError("จำนวนที่เบิกออกมากกว่าจำนวนคงเหลือในคลัง");
      return;
    }
    setStockLoading(true);
    setStockError(null);
    try {
      const delta = stockDirection === "in" ? stockQty : -stockQty;
      const updated = await adjustSparePartStock(
        stockPart.id,
        delta,
        actorId,
        stockNote.trim() || undefined
      );
      onUpdated(updated);
      fetchPage();
      setStockPart(null);
    } catch (err) {
      setStockError(toUserMessage(err, `ไม่สามารถทำรายการสต็อกของ "${stockPart.name}" ได้`));
    } finally {
      setStockLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Delete confirm modal                                               */
  /* ---------------------------------------------------------------- */

  const handleConfirmDelete = async () => {
    if (!partToDelete) return;
    const part = partToDelete;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteSparePart(part.id, actorId);
      onDeleted(part.id);
      setPartToDelete(null);
      // ลบแถวสุดท้ายของหน้าที่ไม่ใช่หน้าแรก -> ถอยกลับหนึ่งหน้า (การเปลี่ยน offset
      // ทำให้ effect ด้านบน refetch ให้เองอยู่แล้ว) ไม่งั้นแค่โหลดหน้าเดิมซ้ำเพื่อรีเฟรช
      if (offset > 0 && spareParts.length === 1) {
        setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
      } else {
        fetchPage();
      }
    } catch (err) {
      setDeleteError(toUserMessage(err, `ไม่สามารถลบอะไหล่ "${part.name}" ได้`));
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-[18px] border border-hairline p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">รายการอะไหล่ทั้งหมด</p>
            <p className="text-lg font-semibold text-ink tabular-nums">{totalCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-[18px] border border-hairline p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">เหลือน้อย</p>
            <p className="text-lg font-semibold text-ink tabular-nums">{lowStockCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-[18px] border border-hairline p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
            <PackageX className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">หมดสต็อก</p>
            <p className="text-lg font-semibold text-ink tabular-nums">{outOfStockCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-[18px] border border-hairline p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-ink-muted">มูลค่ารวมในคลัง</p>
            <p className="text-lg font-semibold text-ink tabular-nums">{baht(totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 md:items-center">
        <div className="relative flex-1 min-w-55">
          <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-3.5" aria-hidden="true" />
          <label htmlFor="spare-parts-admin-search" className="sr-only">
            ค้นหาอะไหล่
          </label>
          <input
            id="spare-parts-admin-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัส ชื่ออะไหล่ หมวดหมู่ หรือรุ่นเครื่องจักร..."
            className="w-full bg-white border border-hairline rounded-full pl-10 pr-10 min-h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
          />
          {/* บอกว่ากำลังค้นหาที่ server อยู่ โดยไม่ล้างตารางเดิมออกจนกระพริบ */}
          {isLoading && (
            <Loader2
              className="w-4 h-4 text-ink-faint absolute right-3.5 top-3.5 animate-spin"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="spare-parts-admin-category-filter" className="sr-only">
            หมวดหมู่
          </label>
          <div className="relative">
            <select
              id="spare-parts-admin-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-10 min-h-11 py-2 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="spare-parts-admin-status-filter" className="sr-only">
            สถานะ
          </label>
          <div className="relative min-w-40">
            <select
              id="spare-parts-admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | SparePart["status"])}
              className="w-full appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-10 min-h-11 py-2 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint"
              aria-hidden="true"
            />
          </div>
        </div>

        <button type="button" onClick={openAddModal} className={primaryBtnClass + " inline-flex items-center gap-1.5 shrink-0"}>
          <Plus className="w-4 h-4" />
          <span>เพิ่มอะไหล่</span>
        </button>
      </div>

      {/* Error banner — table below keeps showing whatever page was last loaded successfully */}
      {loadError && <InlineError message={loadError} />}

      {/* Empty state */}
      {isLoading && spareParts.length === 0 && !loadError ? (
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-[13px] text-ink-muted">กำลังโหลดคลังอะไหล่...</p>
        </div>
      ) : filteredParts.length === 0 && !loadError ? (
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-2">
          <Package className="w-10 h-10 text-ink-faint mx-auto" />
          {pageTotal === 0 && !hasActiveFilters ? (
            <p className="text-sm font-semibold text-ink">ยังไม่มีอะไหล่ในคลัง</p>
          ) : (
            <p className="text-sm font-semibold text-ink">ไม่พบอะไหล่ที่ตรงกับเงื่อนไข</p>
          )}
          <p className="text-[13px] text-ink-muted">
            {pageTotal === 0 && !hasActiveFilters
              ? "กดปุ่ม “เพิ่มอะไหล่” เพื่อเริ่มบันทึกรายการแรก"
              : "ลองเปลี่ยนคำค้นหาหรือปรับตัวกรองด้านบน"}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className={secondaryBtnClass + " mt-1"}>
              ล้างตัวกรอง
            </button>
          )}
        </div>
      ) : filteredParts.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-[18px] border border-hairline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left border-collapse table-fixed">
                <caption className="sr-only">รายการอะไหล่ในคลังทั้งหมด</caption>
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[23%]" />
                  <col className="w-[15%]" />
                  <col className="w-[9%]" />
                  <col className="w-[13%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="bg-parchment border-b border-hairline text-xs font-semibold text-ink-muted">
                    <th className="px-3 py-2.5 whitespace-nowrap">รหัส</th>
                    <th className="px-3 py-2.5">ชื่ออะไหล่</th>
                    <th className="px-3 py-2.5">หมวดหมู่</th>
                    <th className="px-3 py-2.5 whitespace-nowrap text-right">คงเหลือ</th>
                    <th className="px-3 py-2.5">ตำแหน่งจัดเก็บ</th>
                    <th className="px-3 py-2.5 whitespace-nowrap text-right">ราคา/หน่วย</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">สถานะ</th>
                    <th className="px-3 py-2.5 whitespace-nowrap text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider text-[13px]">
                  {filteredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-parchment transition-colors">
                      <td className="px-3 py-2.5 font-mono text-ink-muted truncate" title={part.code}>{part.code}</td>
                      <td className="px-3 py-2.5 text-ink font-semibold line-clamp-2" title={part.name}>
                        {part.name}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted truncate" title={part.category || undefined}>
                        {part.category || <span className="text-ink-faint">-</span>}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right">
                        <div className={"tabular-nums " + stockTextClass(part)}>
                          {part.stockQuantity} {part.unit || "ชิ้น"}
                        </div>
                        <div className="text-[11px] text-ink-faint">จุดสั่งซื้อ {part.minThreshold}</div>
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted truncate" title={part.locationRack || undefined}>
                        {part.locationRack || <span className="text-ink-faint">-</span>}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted tabular-nums whitespace-nowrap text-right">
                        {baht(part.unitPriceTHB)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={sparePartStatusPillClass(part.status)}>
                          {STATUS_LABELS[part.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openStockModal(part)}
                            aria-label={`รับเข้า/เบิกออกอะไหล่ ${part.name}`}
                            title="รับเข้า/เบิกออก"
                            className={tableIconBtnClass}
                          >
                            <PackagePlus className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(part)}
                            aria-label={`แก้ไขอะไหล่ ${part.name}`}
                            title="แก้ไข"
                            className={tableIconBtnClass}
                          >
                            <Pencil className="w-4 h-4 text-ink-muted" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartToDelete(part)}
                            aria-label={`ลบอะไหล่ ${part.name}`}
                            title="ลบ"
                            className={tableIconBtnClass}
                          >
                            <Trash2 className="w-4 h-4 text-rose-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredParts.map((part) => (
              <div key={part.id} className="bg-white rounded-[18px] border border-hairline p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-ink-muted">{part.code}</span>
                    <h3 className="font-semibold text-ink text-sm leading-snug">{part.name}</h3>
                    <span className="text-xs text-ink-muted">
                      {part.category || <span className="text-ink-faint">-</span>}
                    </span>
                  </div>
                  <span className={sparePartStatusPillClass(part.status)}>
                    {STATUS_LABELS[part.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div className="p-2.5 rounded-[11px] bg-parchment border border-hairline">
                    <span className="text-xs text-ink-muted block">คงเหลือ</span>
                    <span className={"tabular-nums " + stockTextClass(part)}>
                      {part.stockQuantity} {part.unit || "ชิ้น"}
                    </span>
                    <span className="block text-[11px] text-ink-faint">จุดสั่งซื้อ {part.minThreshold}</span>
                  </div>
                  <div className="p-2.5 rounded-[11px] bg-parchment border border-hairline">
                    <span className="text-xs text-ink-muted block">ราคา/หน่วย</span>
                    <span className="text-ink tabular-nums">{baht(part.unitPriceTHB)}</span>
                  </div>
                  <div className="p-2.5 rounded-[11px] bg-parchment border border-hairline flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-ink truncate">
                      {part.locationRack || <span className="text-ink-faint">-</span>}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openStockModal(part)}
                    aria-label={`รับเข้า/เบิกออกอะไหล่ ${part.name}`}
                    title="รับเข้า/เบิกออก"
                    className={iconBtnClass + " flex-1"}
                  >
                    <PackagePlus className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(part)}
                    aria-label={`แก้ไขอะไหล่ ${part.name}`}
                    title="แก้ไข"
                    className={iconBtnClass + " flex-1"}
                  >
                    <Pencil className="w-4 h-4 text-ink-muted" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartToDelete(part)}
                    aria-label={`ลบอะไหล่ ${part.name}`}
                    title="ลบ"
                    className={iconBtnClass + " flex-1"}
                  >
                    <Trash2 className="w-4 h-4 text-rose-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* แบ่งหน้า — ใช้ pageTotal ของทั้งคลังตามตัวกรองปัจจุบัน (จาก meta) ไม่ใช่แค่หน้านี้ */}
      {pageTotal > 0 && (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={pageTotal}
          onOffsetChange={setOffset}
          isLoading={isLoading}
          itemLabel="รายการ"
        />
      )}

      {/* Add / edit modal */}
      {formOpen && (
        <Modal size="lg" onClose={closeFormModal}>
          <ModalHeader onClose={closeFormModal}>
            <h3 className="text-base sm:text-lg font-semibold text-ink">
              {formMode === "add" ? "เพิ่มอะไหล่ใหม่" : "แก้ไขข้อมูลอะไหล่"}
            </h3>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sp-form-code" className={labelClass}>
                  รหัสอะไหล่ <span className="text-rose-600">*</span>
                </label>
                <input
                  id="sp-form-code"
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="เช่น PART-NSK-7014"
                />
              </div>

              <div>
                <label htmlFor="sp-form-name" className={labelClass}>
                  ชื่ออะไหล่ <span className="text-rose-600">*</span>
                </label>
                <input
                  id="sp-form-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="sp-form-category" className={labelClass}>
                  หมวดหมู่
                </label>
                <input
                  id="sp-form-category"
                  type="text"
                  list="sp-form-category-options"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="เลือกจากรายการ หรือพิมพ์หมวดหมู่ใหม่"
                />
                <datalist id="sp-form-category-options">
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {formMode === "add" && (
                <div>
                  <label htmlFor="sp-form-stock" className={labelClass}>
                    จำนวนคงเหลือ
                  </label>
                  <input
                    id="sp-form-stock"
                    type="number"
                    min={0}
                    step={1}
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(e.target.value)}
                    disabled={formLoading}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label htmlFor="sp-form-unit" className={labelClass}>
                  หน่วย
                </label>
                <div className="relative">
                  <select
                    id="sp-form-unit"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    disabled={formLoading}
                    className={selectFieldClass}
                  >
                    <option value="">— เลือกหน่วย —</option>
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sp-form-min-threshold" className={labelClass}>
                  จุดสั่งซื้อขั้นต่ำ
                </label>
                <input
                  id="sp-form-min-threshold"
                  type="number"
                  min={0}
                  step={1}
                  value={formMinThreshold}
                  onChange={(e) => setFormMinThreshold(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="sp-form-location" className={labelClass}>
                  ตำแหน่งจัดเก็บ
                </label>
                <input
                  id="sp-form-location"
                  type="text"
                  value={formLocationRack}
                  onChange={(e) => setFormLocationRack(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="เช่น ตู้ A3 ชั้น 2"
                />
              </div>

              <div>
                <label htmlFor="sp-form-price" className={labelClass}>
                  ราคาต่อหน่วย (บาท)
                </label>
                <input
                  id="sp-form-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formUnitPrice}
                  onChange={(e) => setFormUnitPrice(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="sp-form-machines" className={labelClass}>
                  เครื่องจักรที่ใช้ร่วมกันได้
                </label>
                <input
                  id="sp-form-machines"
                  type="text"
                  value={formMachinesInput}
                  onChange={(e) => setFormMachinesInput(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="คั่นด้วยจุลภาค เช่น CNC-01, CNC-02"
                />
                <p className="text-xs text-ink-faint mt-1">คั่นรายการหลายรุ่นด้วยเครื่องหมายจุลภาค (,)</p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="sp-form-image" className={labelClass}>
                  ลิงก์รูปภาพ (ถ้ามี)
                </label>
                <input
                  id="sp-form-image"
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>

            {formError && (
              <div className="mt-4">
                <InlineError message={formError} />
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={closeFormModal} disabled={formLoading} className={secondaryBtnClass}>
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={formLoading}
              aria-busy={formLoading}
              className={primaryBtnClass}
            >
              {formLoading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Stock in/out modal */}
      {stockPart && (
        <Modal size="sm" onClose={closeStockModal}>
          <ModalHeader onClose={closeStockModal}>
            <h3 className="text-base font-semibold text-ink">รับเข้า/เบิกออกอะไหล่</h3>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <div className="p-3 bg-parchment rounded-[11px] text-[13px] space-y-1">
              <div className="font-semibold text-ink">{stockPart.name}</div>
              <div className="text-ink-muted font-mono">{stockPart.code}</div>
              <div className="text-ink-muted">
                คงเหลือปัจจุบัน: {stockPart.stockQuantity} {stockPart.unit || "ชิ้น"}
              </div>
            </div>

            <div className="flex items-center gap-2" role="group" aria-label="เลือกประเภทรายการสต็อก">
              <button
                type="button"
                onClick={() => setStockDirection("in")}
                aria-pressed={stockDirection === "in"}
                disabled={stockLoading}
                className={`flex-1 min-h-11 px-3 rounded-[11px] border font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-60 ${
                  stockDirection === "in"
                    ? "bg-emerald-600 border-emerald-700 text-white"
                    : "bg-white border-hairline text-ink-muted hover:bg-parchment"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>รับเข้า</span>
              </button>
              <button
                type="button"
                onClick={() => setStockDirection("out")}
                aria-pressed={stockDirection === "out"}
                disabled={stockLoading}
                className={`flex-1 min-h-11 px-3 rounded-[11px] border font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-60 ${
                  stockDirection === "out"
                    ? "bg-rose-600 border-rose-700 text-white"
                    : "bg-white border-hairline text-ink-muted hover:bg-parchment"
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>เบิกออก</span>
              </button>
            </div>

            <div>
              <label htmlFor="sp-stock-qty" className={labelClass}>
                จำนวน
              </label>
              <input
                id="sp-stock-qty"
                type="number"
                min={1}
                step={1}
                value={stockQtyInput}
                onChange={(e) => setStockQtyInput(e.target.value)}
                disabled={stockLoading}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="sp-stock-note" className={labelClass}>
                หมายเหตุ (ยังไม่บันทึกลงระบบ)
              </label>
              <input
                id="sp-stock-note"
                type="text"
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
                disabled={stockLoading}
                className={inputClass}
                placeholder="เช่น เบิกใช้กับใบงาน WO-1024"
              />
            </div>

            <p
              className={`text-[13px] font-semibold ${
                stockWouldGoNegative ? "text-rose-700" : "text-ink"
              }`}
            >
              คงเหลือหลังทำรายการ: {stockAfter} {stockPart.unit || "ชิ้น"}
            </p>

            {stockError && <InlineError message={stockError} />}
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={closeStockModal} disabled={stockLoading} className={secondaryBtnClass}>
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmitStock}
              disabled={stockLoading}
              aria-busy={stockLoading}
              className={primaryBtnClass}
            >
              {stockLoading ? "กำลังบันทึก..." : "บันทึกรายการ"}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {partToDelete && (
        <Modal
          size="sm"
          onClose={() => {
            if (deleteLoading) return;
            setPartToDelete(null);
            setDeleteError(null);
          }}
        >
          <ModalHeader
            onClose={() => {
              if (deleteLoading) return;
              setPartToDelete(null);
              setDeleteError(null);
            }}
          >
            <h3 className="text-base font-semibold text-ink">ยืนยันลบอะไหล่</h3>
          </ModalHeader>

          <ModalBody>
            <p className="text-sm text-ink leading-relaxed">
              ยืนยันลบอะไหล่ «{partToDelete.code} — {partToDelete.name}»?
            </p>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">
              การลบนี้ไม่สามารถกู้คืนได้ ข้อมูลอะไหล่นี้จะถูกลบออกจากคลังถาวร
            </p>

            {deleteError && (
              <div className="mt-3">
                <InlineError message={deleteError} />
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => {
                setPartToDelete(null);
                setDeleteError(null);
              }}
              disabled={deleteLoading}
              className={secondaryBtnClass}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              aria-busy={deleteLoading}
              className={destructiveBtnClass}
            >
              {deleteLoading ? "กำลังลบ..." : "ลบอะไหล่"}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
