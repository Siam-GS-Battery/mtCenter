import React, { useEffect, useState } from "react";
import {
  Package,
  Search,
  MapPin,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  Cog,
  CircleDashed,
  Droplets,
  Cpu,
  SearchX,
  ClipboardList,
  Trash2,
  Wrench,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Machine, SparePart } from "../../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { getSpareParts, toUserMessage } from "../../services/apiService";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { isMissing, orDash } from "../../lib/format";
import { SkeletonCardGrid } from "../ui/Skeleton";

interface SparePartsViewProps {
  onAskAI: (prompt: string) => void;
  /** เครื่องจักรที่กำลังทำงานอยู่ ใช้กรอง "อะไหล่ที่ใช้กับเครื่องนี้" (App ต้องส่งมา) */
  activeMachine?: Machine;
}

// จำนวนรายการต่อหน้า — เหมาะกับกริด 1/2/3 คอลัมน์ (พอดี 6 หรือ 8 แถวเต็ม)
const PAGE_SIZE = 24;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ลูกปืนและแบริ่ง": Cog,
  "ซีลและปะเก็น": CircleDashed,
  "น้ำมันและสารหล่อลื่น": Droplets,
  "มอเตอร์และอิเล็กทรอนิกส์": Cpu,
};

const CATEGORIES = [
  "all",
  "ลูกปืนและแบริ่ง",
  "ซีลและปะเก็น",
  "น้ำมันและสารหล่อลื่น",
  "มอเตอร์และอิเล็กทรอนิกส์",
];

type RequestStep = "form" | "confirm" | "done";

/**
 * ใบขอเบิกฉบับร่าง — เก็บอยู่ในหน้าจอนี้เท่านั้น ไม่ถูกส่งเข้าระบบคลัง
 * และไม่ตัดสต็อก จึงต้องสื่อสารสถานะนี้ตรง ๆ ในทุกจุดที่แสดงผล
 */
interface RequisitionDraft {
  id: string;
  partId: string;
  partCode: string;
  partName: string;
  qty: number;
  // null when the requested part has no price on file — must render as "—",
  // never as ฿0 (see requestTotal below).
  totalTHB: number | null;
  locationRack: string | null;
  createdAt: string;
}

// unitPriceTHB is typed as a plain `number` in SparePart, but real imported
// rows can genuinely have no price on file (no Excel source / missing data
// quality flag) and come back as `null` from the API — guard against that
// instead of crashing the whole view on `null.toLocaleString()`.
const baht = (value: number | null | undefined) =>
  value == null || Number.isNaN(value) ? "—" : `฿${value.toLocaleString("th-TH")}`;

const fitsMachine = (part: SparePart, machine: Machine) => {
  const name = machine.name.toLowerCase();
  const code = (machine.code ?? "").toLowerCase();
  return part.compatibleMachines.some((m) => {
    const entry = m.toLowerCase();
    return entry === name || entry.includes(code) || name.includes(entry);
  });
};

export const SparePartsView: React.FC<SparePartsViewProps> = ({
  onAskAI,
  activeMachine,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // ยิงค้นหาไป server หลังพิมพ์หยุด ~300ms กันยิงถี่ทุกตัวอักษร
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyForActiveMachine, setOnlyForActiveMachine] = useState(false);
  const [requestedPart, setRequestedPart] = useState<SparePart | null>(null);
  const [requestQty, setRequestQty] = useState(1);
  const [requestStep, setRequestStep] = useState<RequestStep>("form");
  const [drafts, setDrafts] = useState<RequisitionDraft[]>([]);

  // ---- คลังอะไหล่ตอนนี้มี 8,588 รายการ เกินขนาดหน้าสูงสุดของ backend (1,000)
  // ไปมาก จึงค้นหา/แบ่งหน้าที่ server แทนการโหลดทั้งก้อนมากรองในเครื่อง ----
  const [offset, setOffset] = useState(0);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // เปลี่ยนคำค้นหา -> กลับไปหน้าแรกเสมอ (ผลลัพธ์ชุดใหม่ไม่ใช่หน้าเดิม)
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    getSpareParts({ search: debouncedSearch.trim() || undefined, limit: PAGE_SIZE, offset })
      .then((res) => {
        if (cancelled) return;
        setParts(res.data);
        setTotal(res.meta?.total ?? res.data.length);
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
  }, [debouncedSearch, offset]);

  // หมวดหมู่และ "เฉพาะเครื่องที่ใช้งานอยู่" ไม่มี query param รองรับที่ backend
  // (คนละคอลัมน์กับ groupCode ที่ backend กรองได้) จึงยังกรองในเครื่องเฉพาะ
  // ภายในหน้าที่โหลดมาแล้วเท่านั้น — ไม่ใช่ทั้งคลัง ต่างจากคำค้นหาด้านบนที่
  // ยิงไป server และครอบคลุมอะไหล่ทั้ง 8,588 รายการ
  const filteredParts = parts.filter((part) => {
    const matchesCategory =
      selectedCategory === "all" || part.category === selectedCategory;
    const matchesMachine =
      !onlyForActiveMachine || !activeMachine || fitsMachine(part, activeMachine);
    return matchesCategory && matchesMachine;
  });

  const openRequestModal = (part: SparePart) => {
    setRequestedPart(part);
    setRequestQty(1);
    setRequestStep("form");
  };

  const closeRequestModal = () => {
    setRequestedPart(null);
    setRequestQty(1);
    setRequestStep("form");
  };

  const stockAfter = requestedPart
    ? requestedPart.stockQuantity - requestQty
    : 0;
  const qtyValid =
    requestedPart !== null &&
    requestQty >= 1 &&
    requestQty <= requestedPart.stockQuantity;
  const belowThreshold =
    requestedPart !== null && stockAfter < requestedPart.minThreshold;
  // A part with no price on file must not price out a requisition at ฿0 —
  // that would read as "free" instead of "unknown". Total is null (renders
  // via `baht` as "—") whenever the price itself is unknown.
  const requestTotal =
    requestedPart && !isMissing(requestedPart.unitPriceTHB)
      ? (requestedPart.unitPriceTHB as number) * Math.max(requestQty, 0)
      : null;

  const saveDraft = () => {
    if (!requestedPart || !qtyValid) return;
    setDrafts((prev) => [
      {
        id: `${requestedPart.id}-${Date.now()}`,
        partId: requestedPart.id,
        partCode: requestedPart.code,
        partName: requestedPart.name,
        qty: requestQty,
        totalTHB: requestTotal,
        locationRack: requestedPart.locationRack,
        createdAt: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
    setRequestStep("done");
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const draftQtyFor = (partId: string) =>
    drafts
      .filter((d) => d.partId === partId)
      .reduce((sum, d) => sum + d.qty, 0);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="ค้นหาอะไหล่"
              placeholder="ค้นหาชื่ออะไหล่, รหัส PART-NSK-7014, หรือรุ่นเครื่องจักร..."
              className="w-full bg-white border border-hairline rounded-full pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
            />
            {/* บอกว่ากำลังค้นหาที่ server อยู่ โดยไม่ล้างผลลัพธ์เดิมออกจนกระพริบ */}
            {isLoading && (
              <Loader2
                className="w-4 h-4 text-ink-faint absolute right-3.5 top-3.5 animate-spin"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="parts-category-filter"
              className="text-[13px] text-ink-muted font-semibold shrink-0"
            >
              หมวดหมู่
            </label>
            <select
              id="parts-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-hairline rounded-full px-3 min-h-11 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "ทุกหมวดหมู่" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeMachine && (
            <button
              onClick={() => setOnlyForActiveMachine((v) => !v)}
              aria-pressed={onlyForActiveMachine}
              className={`inline-flex items-center gap-2 px-4 min-h-11 rounded-full text-[13px] font-semibold border transition-colors cursor-pointer active:scale-95 ${
                onlyForActiveMachine
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink-muted border-hairline hover:bg-primary/5"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>เฉพาะอะไหล่ที่ใช้กับ {activeMachine.code}</span>
            </button>
          )}

          <span className="text-[13px] text-ink-muted">
            แสดง{" "}
            <span className="font-semibold text-ink">
              {filteredParts.length}
            </span>{" "}
            จาก {parts.length} รายการในหน้านี้ · ทั้งหมด{" "}
            <span className="font-semibold text-ink">{total.toLocaleString("th-TH")}</span> รายการ
          </span>
        </div>
      </div>

      {loadError && (
        <div className="bg-rose-50 border border-rose-200 rounded-[18px] p-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] font-semibold text-rose-900 leading-relaxed">{loadError}</p>
        </div>
      )}

      {/* ใบขอเบิกฉบับร่าง — ยังไม่ถูกส่งเข้าระบบคลัง */}
      {drafts.length > 0 && (
        <div className="bg-white border border-hairline rounded-[18px] p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-divider text-ink-muted border border-divider shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="text-[13px] text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink block">
                ใบขอเบิกฉบับร่างในเครื่องนี้ ({drafts.length} รายการ)
              </span>
              ยังไม่ได้ส่งเข้าระบบคลัง สต็อกในระบบยังไม่ถูกตัด
              และร่างทั้งหมดจะหายเมื่อปิดหรือรีเฟรชหน้าจอ
            </div>
          </div>

          <ul className="divide-y divide-divider border-t border-divider">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {draft.partName}
                  </p>
                  <p className="text-xs text-ink-muted font-mono">
                    {draft.partCode} · {draft.qty} ชิ้น · {baht(draft.totalTHB)} ·{" "}
                    {draft.createdAt} น.
                  </p>
                </div>
                <button
                  onClick={() => removeDraft(draft.id)}
                  aria-label={`ลบร่างขอเบิก ${draft.partName}`}
                  className="p-2.5 min-h-11 min-w-11 flex items-center justify-center rounded-[11px] bg-pearl border border-divider text-ink-muted hover:bg-primary/5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Spare Parts Grid */}
      {isLoading && parts.length === 0 && !loadError ? (
        <SkeletonCardGrid count={6} />
      ) : filteredParts.length === 0 && !loadError ? (
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-2">
          <SearchX className="w-10 h-10 text-ink-faint mx-auto" />
          <p className="text-sm font-semibold text-ink">ไม่พบอะไหล่ที่ตรงกับเงื่อนไข</p>
          <p className="text-[13px] text-ink-muted">
            ลองเปลี่ยนคำค้นหา เลือกหมวดหมู่อื่น หรือปิดตัวกรองเครื่องจักร
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setOnlyForActiveMachine(false);
              setOffset(0);
            }}
            className="mt-1 px-4 min-h-11 rounded-full bg-pearl border border-divider text-ink-muted text-[13px] font-semibold hover:bg-primary/5 cursor-pointer active:scale-95"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => {
            const isOutOfStock = part.status === "out_of_stock";
            const isLowStock = part.status === "low_stock";
            const CategoryIcon = CATEGORY_ICONS[part.category ?? ""] || Package;
            const draftedQty = draftQtyFor(part.id);

            return (
              <div
                key={part.id}
                className="bg-white rounded-[18px] border border-hairline hover:border-primary/40 transition-all flex flex-col justify-between p-4 space-y-3"
              >
                <div className="space-y-3">
                  {/* รหัสอะไหล่ + สถานะสต็อก */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-pearl text-ink-muted border border-divider">
                      {part.code}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isOutOfStock
                          ? "bg-rose-600 text-white"
                          : isLowStock
                          ? "bg-amber-500 text-ink"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isOutOfStock
                        ? "หมดสต็อก"
                        : isLowStock
                        ? "เหลือน้อย"
                        : "มีพร้อมส่ง"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-primary font-semibold inline-flex items-center gap-1.5">
                      <CategoryIcon className="w-3.5 h-3.5" />
                      {orDash(part.category)}
                    </span>
                    <h3 className="font-semibold text-ink text-sm leading-snug mt-0.5">
                      {part.name}
                    </h3>
                  </div>

                  {/* สต็อก + ราคาต่อหน่วย */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-[11px] bg-divider border border-hairline">
                      <span className="text-xs text-ink-muted block">
                        จำนวนคงเหลือ
                      </span>
                      <span className="text-lg font-semibold text-ink">
                        {part.stockQuantity}{" "}
                        <span className="text-xs font-normal">
                          {part.unit || "ชิ้น"}
                        </span>
                      </span>
                    </div>
                    <div className="p-2.5 rounded-[11px] bg-divider border border-hairline">
                      <span className="text-xs text-ink-muted block">
                        ราคาต่อหน่วย
                      </span>
                      <span className="text-lg font-semibold text-ink">
                        {baht(part.unitPriceTHB)}
                      </span>
                    </div>
                  </div>

                  {/* ตำแหน่งจัดเก็บ */}
                  <div className="text-[13px] text-ink-muted flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">
                      ตำแหน่งตู้:{" "}
                      <strong className="text-ink">{orDash(part.locationRack)}</strong>
                    </span>
                  </div>

                  {/* เครื่องจักรที่รองรับ */}
                  <div className="text-xs text-ink-muted">
                    <span className="font-semibold text-ink-muted block mb-1">
                      เครื่องจักรที่รองรับ:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {part.compatibleMachines.map((m, i) => {
                        const isActiveMachine =
                          !!activeMachine &&
                          fitsMachine(
                            { ...part, compatibleMachines: [m] },
                            activeMachine
                          );
                        return (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              isActiveMachine
                                ? "bg-primary text-white font-semibold"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {m}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {draftedQty > 0 && (
                    <p className="text-xs text-ink-muted flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                      มีร่างขอเบิกในเครื่องนี้แล้ว {draftedQty} ชิ้น (ยังไม่ส่งเข้าคลัง)
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-divider flex items-center justify-end gap-2">
                  <button
                    onClick={() =>
                      onAskAI(
                        `ขอคู่มือและขั้นตอนการเปลี่ยนอะไหล่ ${part.name} (${part.code})`
                      )
                    }
                    aria-label={`ถาม AI วิธีเปลี่ยนอะไหล่ ${part.name}`}
                    className="p-2.5 min-h-11 min-w-11 flex items-center justify-center rounded-[11px] bg-pearl border border-divider hover:bg-primary/5 cursor-pointer transition-colors active:scale-95"
                    title="ถาม AI วิธีเปลี่ยนอะไหล่นี้"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </button>

                  <button
                    onClick={() => openRequestModal(part)}
                    disabled={isOutOfStock}
                    className="px-4 min-h-11 rounded-full bg-primary hover:bg-primary-focus text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isOutOfStock ? "สินค้าหมด" : "เบิกอะไหล่"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* แบ่งหน้า — ใช้ total ของทั้งคลัง (จาก meta) ไม่ใช่แค่จำนวนในหน้านี้ */}
      {total > 0 && (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={total}
          onOffsetChange={setOffset}
          isLoading={isLoading}
          itemLabel="รายการ"
        />
      )}

      {/* Part Request Dialog */}
      {requestedPart && (
        <Modal size="sm" onClose={closeRequestModal}>
          <ModalHeader onClose={closeRequestModal}>
            <h3 className="text-lg font-semibold text-ink">
              {requestStep === "done"
                ? "บันทึกร่างขอเบิกแล้ว"
                : requestStep === "confirm"
                ? "ตรวจสอบคำขอเบิกอะไหล่"
                : "ขอเบิกอะไหล่"}
            </h3>
          </ModalHeader>

          {requestStep === "form" && (
            <>
              <ModalBody className="space-y-4">
                <div className="p-3 bg-divider rounded-[11px] text-[13px] space-y-1">
                  <div className="font-semibold text-ink">{requestedPart.name}</div>
                  <div className="text-ink-muted font-mono">{requestedPart.code}</div>
                  <div className="text-primary">ตำแหน่ง: {orDash(requestedPart.locationRack)}</div>
                  <div className="text-ink-muted">
                    คงเหลือในคลัง: {requestedPart.stockQuantity} ชิ้น · ราคาต่อหน่วย{" "}
                    {baht(requestedPart.unitPriceTHB)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="part-request-qty"
                    className="text-[13px] font-semibold text-ink-muted"
                  >
                    จำนวนที่ต้องการเบิก (ชิ้น):
                  </label>
                  <input
                    id="part-request-qty"
                    type="number"
                    value={requestQty}
                    onChange={(e) => setRequestQty(Number(e.target.value))}
                    min={1}
                    max={requestedPart.stockQuantity}
                    className="w-full bg-divider border border-hairline rounded-full px-4 min-h-11 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary-focus/40"
                  />
                  {!qtyValid ? (
                    <p className="text-xs text-rose-700 font-semibold">
                      กรุณาระบุจำนวนระหว่าง 1 ถึง {requestedPart.stockQuantity} ชิ้น
                    </p>
                  ) : (
                    <p className="text-xs text-ink-muted">
                      มูลค่ารวม {baht(requestTotal)}
                    </p>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <button
                  onClick={closeRequestModal}
                  className="w-full sm:w-auto min-h-11 px-4 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-[13px] hover:bg-primary/5 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => qtyValid && setRequestStep("confirm")}
                  disabled={!qtyValid}
                  className="w-full sm:w-auto min-h-11 px-4 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] active:scale-95 transition-all disabled:opacity-40"
                >
                  ตรวจสอบคำขอ
                </button>
              </ModalFooter>
            </>
          )}

          {requestStep === "confirm" && (
            <>
              <ModalBody className="space-y-4">
                <div className="p-3 bg-divider rounded-[11px] text-[13px] space-y-2">
                  <div className="font-semibold text-ink">{requestedPart.name}</div>
                  <div className="text-ink-muted font-mono">{requestedPart.code}</div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-divider text-center">
                    <div>
                      <span className="block text-xs text-ink-muted">จำนวนที่เบิก</span>
                      <span className="text-base font-semibold text-ink">{requestQty}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-ink-muted">คงเหลือปัจจุบัน</span>
                      <span className="text-base font-semibold text-ink">
                        {requestedPart.stockQuantity}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-ink-muted">คงเหลือหลังเบิก</span>
                      <span
                        className={`text-base font-semibold ${
                          belowThreshold ? "text-amber-700" : "text-ink"
                        }`}
                      >
                        {stockAfter}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-divider">
                    <span className="text-ink-muted">
                      มูลค่ารวม ({requestQty} × {baht(requestedPart.unitPriceTHB)})
                    </span>
                    <span className="text-base font-semibold text-ink">
                      {baht(requestTotal)}
                    </span>
                  </div>
                </div>

                {belowThreshold && (
                  <div className="flex items-start gap-2 p-3 rounded-[11px] bg-amber-50 border border-amber-200 text-[13px] text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      หลังเบิกแล้วสต็อกจะต่ำกว่าจุดสั่งซื้อ (ขั้นต่ำ {requestedPart.minThreshold} ชิ้น)
                      โปรดแจ้งหัวหน้าคลังเพื่อวางแผนสั่งซื้อเพิ่ม
                    </span>
                  </div>
                )}

                <p className="text-xs text-ink-muted leading-relaxed">
                  ระบบยังไม่ได้เชื่อมกับระบบคลังอะไหล่
                  การยืนยันจะบันทึกรายการนี้เป็นร่างไว้ในหน้าจอนี้เท่านั้น
                </p>
              </ModalBody>

              <ModalFooter>
                <button
                  onClick={() => setRequestStep("form")}
                  className="w-full sm:w-auto min-h-11 px-4 rounded-[11px] bg-pearl border border-divider text-ink-muted font-semibold text-[13px] hover:bg-primary/5 active:scale-95"
                >
                  กลับไปแก้ไข
                </button>
                <button
                  onClick={saveDraft}
                  className="w-full sm:w-auto min-h-11 px-4 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] active:scale-95 transition-all"
                >
                  บันทึกเป็นร่าง
                </button>
              </ModalFooter>
            </>
          )}

          {requestStep === "done" && (
            <>
              <ModalBody className="space-y-3 py-6">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-full bg-divider text-ink-muted border border-divider shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="text-[13px] text-ink-muted leading-relaxed">
                    <span className="text-sm font-semibold text-ink block mb-1">
                      บันทึกร่างขอเบิก {requestedPart.name} จำนวน {requestQty} ชิ้น
                      ({baht(requestTotal)}) ไว้ในหน้าจอนี้แล้ว
                    </span>
                    ยังไม่ได้ส่งเข้าระบบคลัง สต็อกในระบบยังคงเป็น{" "}
                    {requestedPart.stockQuantity} ชิ้นเท่าเดิม
                    และร่างนี้จะหายเมื่อปิดหรือรีเฟรชหน้าจอ
                  </div>
                </div>

                <div className="p-3 rounded-[11px] bg-divider border border-hairline text-[13px] text-ink-muted leading-relaxed">
                  <span className="font-semibold text-ink block mb-0.5">
                    ขั้นตอนถัดไป
                  </span>
                  แจ้งเจ้าหน้าที่คลังด้วยรหัส{" "}
                  <strong className="text-ink font-mono">{requestedPart.code}</strong>{" "}
                  จำนวน {requestQty} ชิ้น ที่ตำแหน่ง{" "}
                  <strong className="text-ink">{orDash(requestedPart.locationRack)}</strong>{" "}
                  เพื่อเบิกของจริงและตัดสต็อกในระบบคลัง
                </div>
              </ModalBody>

              <ModalFooter>
                <button
                  onClick={closeRequestModal}
                  className="w-full sm:w-auto min-h-11 px-5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] active:scale-95 transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </ModalFooter>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};
