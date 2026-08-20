import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Cog,
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Machine, MachineInput, MachineStatus } from "../../types";
import { createMachine, updateMachine, deleteMachine, getMachines, toUserMessage } from "../../services/apiService";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Pagination } from "../ui/Pagination";
import { MACHINE_STATUS_LABELS, machineStatusLabel, machineStatusBadgeClass } from "../../lib/pillStyles";
import { NO_DATA } from "../../lib/format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { SkeletonTable, SkeletonCardGrid } from "../ui/Skeleton";

// จำนวนรายการต่อหน้าของตาราง/การ์ดจัดการเครื่องจักร
const PAGE_SIZE = 50;

interface MachineAdminViewProps {
  /** id ของโปรไฟล์ผู้ใช้ปัจจุบัน — ส่งเป็น x-user-id ไปกับทุกคำขอแก้ไขข้อมูล */
  actorId: string;
  onCreated?: (machine: Machine) => void;
  onUpdated?: (machine: Machine) => void;
  onDeleted?: (machineId: string) => void;
}

const STATUS_FILTER_OPTIONS: { value: "" | MachineStatus; label: string }[] = [
  { value: "", label: "ทุกสถานะ" },
  ...(Object.entries(MACHINE_STATUS_LABELS) as [MachineStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const STATUS_FORM_OPTIONS = Object.entries(MACHINE_STATUS_LABELS) as [MachineStatus, string][];

type FormMode = "add" | "edit";

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
// (พื้นที่แตะยังผ่านเกณฑ์) แต่ลดความกว้างเพื่อให้ปุ่มสองปุ่มพอดีกับคอลัมน์ที่แคบลง
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

/** ค่าว่าง ("") ให้เป็น null เสมอ — ไม่ส่ง "" ไปเป็นค่าฟิลด์ที่แก้ไขได้ */
function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** แปลงเครื่องจักรที่มีอยู่เดิมเป็นรูปแบบ MachineInput เพื่อใช้เทียบหาส่วนต่าง (diff) ตอนแก้ไข */
function toOriginalMachineInput(machine: Machine): MachineInput {
  return {
    code: machine.code,
    name: machine.name,
    model: machine.model,
    location: machine.location,
    status: machine.status,
    factoryGroup: machine.factoryGroup ?? null,
    departmentCode: machine.departmentCode ?? null,
    section: machine.section ?? null,
    category: machine.category ?? null,
    costCenter: machine.costCenter ?? null,
    productionName: machine.productionName ?? null,
    responsibleGroup: machine.responsibleGroup ?? null,
    lifecycleStatus: machine.lifecycleStatus ?? null,
    healthScore: machine.healthScore,
    lastMaintenance: machine.lastMaintenance,
    nextMaintenance: machine.nextMaintenance,
    operatingHours: machine.operatingHours,
    qrCodeUrl: machine.qrCodeUrl ?? null,
    imageUrl: machine.imageUrl ?? null,
  };
}

export default function MachineAdminView({ actorId, onCreated, onUpdated, onDeleted }: MachineAdminViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // ยิงค้นหาไป server หลังพิมพ์หยุด ~300ms กันยิงถี่ทุกตัวอักษร
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<"" | MachineStatus>("");

  // --- ค้นหา/กรองสถานะ/แบ่งหน้าที่ server เสมอ (ไม่โหลดทั้งก้อนมากรองในเครื่อง) ---
  const [offset, setOffset] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [pageTotal, setPageTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // เปลี่ยนคำค้นหา/สถานะ -> กลับไปหน้าแรกเสมอ (ผลลัพธ์ชุดใหม่ไม่ใช่หน้าเดิม)
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch, statusFilter]);

  // คำขอ getMachines อาจซ้อนกัน (บันทึกฟอร์มเสร็จแล้วรีเฟตช์ พร้อมๆ กับพิมพ์ค้นหาต่อ)
  // และตอบกลับมาไม่เรียงลำดับ ใช้เลขลำดับ (sequence) ที่เพิ่มขึ้นทุกครั้งที่เรียก
  // เพื่อให้ผลลัพธ์เก่ากว่าที่ตอบช้ากว่า ไม่มาทับสถานะที่คำขอใหม่กว่าตั้งไว้แล้ว
  const fetchSeqRef = useRef(0);

  const fetchPage = useCallback(() => {
    const seq = ++fetchSeqRef.current;
    setIsLoading(true);
    setLoadError(null);

    getMachines({
      search: debouncedSearch.trim() || undefined,
      status: statusFilter || undefined,
      limit: PAGE_SIZE,
      offset,
    })
      .then((res) => {
        if (seq !== fetchSeqRef.current) return;
        setMachines(res.data);
        setPageTotal(res.meta?.total ?? res.data.length);
        setIsLoading(false);
      })
      .catch((err) => {
        if (seq !== fetchSeqRef.current) return;
        setLoadError(toUserMessage(err, "ไม่สามารถโหลดรายการเครื่องจักรได้"));
        setIsLoading(false);
      });
  }, [debouncedSearch, statusFilter, offset]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // --- แบบฟอร์มเพิ่ม/แก้ไขเครื่องจักร ---
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [machineToEdit, setMachineToEdit] = useState<Machine | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formFactoryGroup, setFormFactoryGroup] = useState("");
  const [formDepartmentCode, setFormDepartmentCode] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formCostCenter, setFormCostCenter] = useState("");
  const [formProductionName, setFormProductionName] = useState("");
  const [formResponsibleGroup, setFormResponsibleGroup] = useState("");
  const [formLifecycleStatus, setFormLifecycleStatus] = useState("");
  const [formStatus, setFormStatus] = useState<MachineStatus>("normal");
  const [formHealthScore, setFormHealthScore] = useState("");
  const [formOperatingHours, setFormOperatingHours] = useState("");
  const [formLastMaintenance, setFormLastMaintenance] = useState("");
  const [formNextMaintenance, setFormNextMaintenance] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formQrCodeUrl, setFormQrCodeUrl] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // --- หน้าต่างยืนยันลบ ---
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  /* ---------------------------------------------------------------- */
  /* Add / edit form modal                                             */
  /* ---------------------------------------------------------------- */

  const resetFormFields = () => {
    setFormCode("");
    setFormName("");
    setFormModel("");
    setFormLocation("");
    setFormFactoryGroup("");
    setFormDepartmentCode("");
    setFormSection("");
    setFormCategory("");
    setFormCostCenter("");
    setFormProductionName("");
    setFormResponsibleGroup("");
    setFormLifecycleStatus("");
    setFormStatus("normal");
    setFormHealthScore("");
    setFormOperatingHours("");
    setFormLastMaintenance("");
    setFormNextMaintenance("");
    setFormImageUrl("");
    setFormQrCodeUrl("");
  };

  const openAddModal = () => {
    setFormMode("add");
    setMachineToEdit(null);
    resetFormFields();
    setFormError(null);
    setFormOpen(true);
  };

  const openEditModal = (machine: Machine) => {
    setFormMode("edit");
    setMachineToEdit(machine);
    setFormCode(machine.code ?? "");
    setFormName(machine.name);
    setFormModel(machine.model ?? "");
    setFormLocation(machine.location ?? "");
    setFormFactoryGroup(machine.factoryGroup ?? "");
    setFormDepartmentCode(machine.departmentCode ?? "");
    setFormSection(machine.section ?? "");
    setFormCategory(machine.category ?? "");
    setFormCostCenter(machine.costCenter ?? "");
    setFormProductionName(machine.productionName ?? "");
    setFormResponsibleGroup(machine.responsibleGroup ?? "");
    setFormLifecycleStatus(machine.lifecycleStatus ?? "");
    setFormStatus(machine.status);
    setFormHealthScore(machine.healthScore != null ? String(machine.healthScore) : "");
    setFormOperatingHours(machine.operatingHours != null ? String(machine.operatingHours) : "");
    setFormLastMaintenance(machine.lastMaintenance ? machine.lastMaintenance.slice(0, 10) : "");
    setFormNextMaintenance(machine.nextMaintenance ? machine.nextMaintenance.slice(0, 10) : "");
    setFormImageUrl(machine.imageUrl ?? "");
    setFormQrCodeUrl(machine.qrCodeUrl ?? "");
    setFormError(null);
    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (formLoading) return;
    setFormOpen(false);
    setMachineToEdit(null);
    setFormError(null);
  };

  const validateForm = (): string | null => {
    if (formName.trim() === "") return "กรุณาระบุชื่อเครื่องจักร";

    if (formHealthScore.trim() !== "") {
      const healthScore = Number(formHealthScore);
      if (
        !Number.isFinite(healthScore) ||
        !Number.isInteger(healthScore) ||
        healthScore < 0 ||
        healthScore > 100
      ) {
        return "คะแนนสุขภาพต้องเป็นตัวเลข 0-100";
      }
    }

    if (formOperatingHours.trim() !== "") {
      const operatingHours = Number(formOperatingHours);
      if (!Number.isFinite(operatingHours) || !Number.isInteger(operatingHours) || operatingHours < 0) {
        return "ชั่วโมงการทำงานต้องเป็นจำนวนเต็มไม่ติดลบ";
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

    const nextInput: MachineInput = {
      code: toNullable(formCode),
      name: formName.trim(),
      model: toNullable(formModel),
      location: toNullable(formLocation),
      status: formStatus,
      factoryGroup: toNullable(formFactoryGroup),
      departmentCode: toNullable(formDepartmentCode),
      section: toNullable(formSection),
      category: toNullable(formCategory),
      costCenter: toNullable(formCostCenter),
      productionName: toNullable(formProductionName),
      responsibleGroup: toNullable(formResponsibleGroup),
      lifecycleStatus: toNullable(formLifecycleStatus),
      healthScore: formHealthScore.trim() === "" ? null : Number(formHealthScore),
      lastMaintenance: toNullable(formLastMaintenance),
      nextMaintenance: toNullable(formNextMaintenance),
      operatingHours: formOperatingHours.trim() === "" ? null : Number(formOperatingHours),
      qrCodeUrl: toNullable(formQrCodeUrl),
      imageUrl: toNullable(formImageUrl),
    };

    setFormLoading(true);
    setFormError(null);
    try {
      if (formMode === "add") {
        const created = await createMachine(nextInput, actorId);
        onCreated?.(created);
        fetchPage();
      } else if (machineToEdit) {
        const original = toOriginalMachineInput(machineToEdit);
        const diff: Partial<MachineInput> = {};
        (Object.keys(nextInput) as (keyof MachineInput)[]).forEach((key) => {
          if (nextInput[key] !== original[key]) {
            (diff as Record<string, unknown>)[key] = nextInput[key];
          }
        });

        if (Object.keys(diff).length === 0) {
          // ไม่มีอะไรเปลี่ยน -> ปิดหน้าต่างเฉยๆ ไม่ต้องยิง API
          setFormOpen(false);
          setMachineToEdit(null);
          return;
        }

        const updated = await updateMachine(machineToEdit.id, diff, actorId);
        onUpdated?.(updated);
        fetchPage();
      } else {
        setFormError("ไม่พบเครื่องจักรที่ต้องการแก้ไข");
        return;
      }
      setFormOpen(false);
      setMachineToEdit(null);
    } catch (err) {
      setFormError(
        toUserMessage(
          err,
          formMode === "add"
            ? "ไม่สามารถเพิ่มเครื่องจักรได้"
            : `ไม่สามารถบันทึกการแก้ไขเครื่องจักร "${formName}" ได้`
        )
      );
    } finally {
      setFormLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Delete confirm modal                                              */
  /* ---------------------------------------------------------------- */

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setMachineToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!machineToDelete) return;
    const machine = machineToDelete;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteMachine(machine.id, actorId);
      onDeleted?.(machine.id);
      setMachineToDelete(null);
      // ลบแถวสุดท้ายของหน้าที่ไม่ใช่หน้าแรก -> ถอยกลับหนึ่งหน้า (การเปลี่ยน offset
      // ทำให้ effect ด้านบน refetch ให้เองอยู่แล้ว) ไม่งั้นแค่โหลดหน้าเดิมซ้ำเพื่อรีเฟรช
      if (offset > 0 && machines.length === 1) {
        setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
      } else {
        fetchPage();
      }
    } catch (err) {
      // ไม่ปิดกลืนข้อผิดพลาด — โดยเฉพาะ HTTP 409 เมื่อยังมีใบงานอ้างอิงเครื่องนี้อยู่
      setDeleteError(toUserMessage(err, `ไม่สามารถลบเครื่องจักร "${machine.name}" ได้`));
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 md:items-center">
        <div className="relative flex-1 min-w-55">
          <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-3.5" aria-hidden="true" />
          <label htmlFor="machine-admin-search" className="sr-only">
            ค้นหาเครื่องจักร
          </label>
          <input
            id="machine-admin-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อหรือรหัสเครื่องจักร..."
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
          <label htmlFor="machine-admin-status-filter" className="sr-only">
            สถานะ
          </label>
          <div className="relative min-w-40">
            <select
              id="machine-admin-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | MachineStatus)}
              className="w-full appearance-none bg-white border border-hairline rounded-full pl-3.5 pr-10 min-h-11 py-2 text-[13px] text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary-focus/40 cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
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

        <button
          type="button"
          onClick={openAddModal}
          className={primaryBtnClass + " inline-flex items-center gap-1.5 shrink-0"}
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเครื่องจักร</span>
        </button>
      </div>

      {/* Error banner — table below keeps showing whatever page was last loaded successfully */}
      {loadError && <InlineError message={loadError} />}

      {/* Empty state */}
      {isLoading && machines.length === 0 && !loadError ? (
        <>
          {/* Desktop table skeleton */}
          <SkeletonTable rows={8} cols={7} className="hidden md:block" />
          {/* Mobile card skeleton */}
          <SkeletonCardGrid count={4} className="md:hidden grid-cols-1" />
        </>
      ) : machines.length === 0 && !loadError ? (
        <div className="bg-white rounded-[18px] border border-hairline p-10 text-center space-y-2">
          <Cog className="w-10 h-10 text-ink-faint mx-auto" />
          {pageTotal === 0 && !hasActiveFilters ? (
            <p className="text-sm font-semibold text-ink">ยังไม่มีเครื่องจักรในระบบ</p>
          ) : (
            <p className="text-sm font-semibold text-ink">ไม่พบเครื่องจักรที่ตรงกับเงื่อนไข</p>
          )}
          <p className="text-[13px] text-ink-muted">
            {pageTotal === 0 && !hasActiveFilters
              ? "กดปุ่ม “เพิ่มเครื่องจักร” เพื่อเริ่มบันทึกรายการแรก"
              : "ลองเปลี่ยนคำค้นหาหรือปรับตัวกรองด้านบน"}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className={secondaryBtnClass + " mt-1"}>
              ล้างตัวกรอง
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-[18px] border border-hairline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-215 text-left border-collapse table-fixed">
                <caption className="sr-only">รายการเครื่องจักรทั้งหมด</caption>
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[22%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="bg-parchment border-b border-hairline text-xs font-semibold text-ink-muted">
                    <th className="px-3 py-2.5 whitespace-nowrap">รหัส</th>
                    <th className="px-3 py-2.5">ชื่อเครื่องจักร</th>
                    <th className="px-3 py-2.5">รุ่น</th>
                    <th className="px-3 py-2.5">ตำแหน่ง</th>
                    <th className="px-3 py-2.5">หน่วยงาน</th>
                    <th className="px-3 py-2.5 whitespace-nowrap">สถานะ</th>
                    <th className="px-3 py-2.5 whitespace-nowrap text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider text-[13px]">
                  {machines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-parchment transition-colors">
                      <td className="px-3 py-2.5 font-mono text-ink-muted truncate" title={machine.code ?? undefined}>
                        {machine.code ?? NO_DATA}
                      </td>
                      <td className="px-3 py-2.5 text-ink font-semibold line-clamp-2" title={machine.name}>
                        {machine.name}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted truncate" title={machine.model ?? undefined}>
                        {machine.model ?? NO_DATA}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted truncate" title={machine.location ?? undefined}>
                        {machine.location ?? NO_DATA}
                      </td>
                      <td className="px-3 py-2.5 text-ink-muted truncate" title={machine.departmentCode ?? undefined}>
                        {machine.departmentCode ?? NO_DATA}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={machineStatusBadgeClass(machine.status)}>
                          {machineStatusLabel(machine.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditModal(machine)}
                            aria-label={`แก้ไขเครื่องจักร ${machine.name}`}
                            title="แก้ไข"
                            className={tableIconBtnClass}
                          >
                            <Pencil className="w-4 h-4 text-ink-muted" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMachineToDelete(machine)}
                            aria-label={`ลบเครื่องจักร ${machine.name}`}
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
            {machines.map((machine) => (
              <div key={machine.id} className="bg-white rounded-[18px] border border-hairline p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-ink-muted">{machine.code ?? NO_DATA}</span>
                    <h3 className="font-semibold text-ink text-sm leading-snug">{machine.name}</h3>
                    <span className="text-xs text-ink-muted">{machine.model ?? NO_DATA}</span>
                  </div>
                  <span className={machineStatusBadgeClass(machine.status)}>
                    {machineStatusLabel(machine.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div className="p-2.5 rounded-[11px] bg-parchment border border-hairline">
                    <span className="text-xs text-ink-muted block">ตำแหน่ง</span>
                    <span className="text-ink truncate block">{machine.location ?? NO_DATA}</span>
                  </div>
                  <div className="p-2.5 rounded-[11px] bg-parchment border border-hairline">
                    <span className="text-xs text-ink-muted block">หน่วยงาน</span>
                    <span className="text-ink truncate block">{machine.departmentCode ?? NO_DATA}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(machine)}
                    aria-label={`แก้ไขเครื่องจักร ${machine.name}`}
                    title="แก้ไข"
                    className={iconBtnClass + " flex-1"}
                  >
                    <Pencil className="w-4 h-4 text-ink-muted" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMachineToDelete(machine)}
                    aria-label={`ลบเครื่องจักร ${machine.name}`}
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
      )}

      {/* แบ่งหน้า — ใช้ pageTotal ของทั้งรายการตามตัวกรองปัจจุบัน (จาก meta) ไม่ใช่แค่หน้านี้ */}
      {pageTotal > 0 && (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={pageTotal}
          onOffsetChange={setOffset}
          isLoading={isLoading}
          itemLabel="เครื่องจักร"
        />
      )}

      {/* Add / edit modal */}
      {formOpen && (
        <Modal size="lg" onClose={closeFormModal}>
          <ModalHeader onClose={closeFormModal}>
            <h3 className="text-base sm:text-lg font-semibold text-ink">
              {formMode === "add" ? "เพิ่มเครื่องจักร" : "แก้ไขเครื่องจักร"}
            </h3>
          </ModalHeader>

          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mach-form-name" className={labelClass}>
                  ชื่อเครื่องจักร <span className="text-rose-600">*</span>
                </label>
                <input
                  id="mach-form-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-code" className={labelClass}>
                  รหัสเครื่องจักร
                </label>
                <input
                  id="mach-form-code"
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="เช่น CNC-01"
                />
              </div>

              <div>
                <label htmlFor="mach-form-model" className={labelClass}>
                  รุ่น
                </label>
                <input
                  id="mach-form-model"
                  type="text"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-location" className={labelClass}>
                  ตำแหน่ง
                </label>
                <input
                  id="mach-form-location"
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-factory-group" className={labelClass}>
                  กลุ่มโรงงาน
                </label>
                <input
                  id="mach-form-factory-group"
                  type="text"
                  value={formFactoryGroup}
                  onChange={(e) => setFormFactoryGroup(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-department-code" className={labelClass}>
                  รหัสหน่วยงาน
                </label>
                <input
                  id="mach-form-department-code"
                  type="text"
                  value={formDepartmentCode}
                  onChange={(e) => setFormDepartmentCode(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-section" className={labelClass}>
                  ส่วนงาน
                </label>
                <input
                  id="mach-form-section"
                  type="text"
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-category" className={labelClass}>
                  หมวดหมู่
                </label>
                <input
                  id="mach-form-category"
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-cost-center" className={labelClass}>
                  ศูนย์ต้นทุน
                </label>
                <input
                  id="mach-form-cost-center"
                  type="text"
                  value={formCostCenter}
                  onChange={(e) => setFormCostCenter(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-production-name" className={labelClass}>
                  ชื่อสายการผลิต
                </label>
                <input
                  id="mach-form-production-name"
                  type="text"
                  value={formProductionName}
                  onChange={(e) => setFormProductionName(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-responsible-group" className={labelClass}>
                  กลุ่มผู้รับผิดชอบ
                </label>
                <input
                  id="mach-form-responsible-group"
                  type="text"
                  value={formResponsibleGroup}
                  onChange={(e) => setFormResponsibleGroup(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-lifecycle-status" className={labelClass}>
                  สถานะทะเบียน
                </label>
                <input
                  id="mach-form-lifecycle-status"
                  type="text"
                  value={formLifecycleStatus}
                  onChange={(e) => setFormLifecycleStatus(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-status" className={labelClass}>
                  สถานะ
                </label>
                <div className="relative">
                  <select
                    id="mach-form-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as MachineStatus)}
                    disabled={formLoading}
                    className={selectFieldClass}
                  >
                    {STATUS_FORM_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
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
                <label htmlFor="mach-form-health-score" className={labelClass}>
                  คะแนนสุขภาพ
                </label>
                <input
                  id="mach-form-health-score"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={formHealthScore}
                  onChange={(e) => setFormHealthScore(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="0-100"
                />
              </div>

              <div>
                <label htmlFor="mach-form-operating-hours" className={labelClass}>
                  ชั่วโมงการทำงาน
                </label>
                <input
                  id="mach-form-operating-hours"
                  type="number"
                  min={0}
                  step={1}
                  value={formOperatingHours}
                  onChange={(e) => setFormOperatingHours(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-last-maintenance" className={labelClass}>
                  ซ่อมบำรุงล่าสุด
                </label>
                <input
                  id="mach-form-last-maintenance"
                  type="date"
                  value={formLastMaintenance}
                  onChange={(e) => setFormLastMaintenance(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-next-maintenance" className={labelClass}>
                  ซ่อมบำรุงครั้งถัดไป
                </label>
                <input
                  id="mach-form-next-maintenance"
                  type="date"
                  value={formNextMaintenance}
                  onChange={(e) => setFormNextMaintenance(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="mach-form-image-url" className={labelClass}>
                  URL รูปภาพ
                </label>
                <input
                  id="mach-form-image-url"
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  disabled={formLoading}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="mach-form-qr-code-url" className={labelClass}>
                  URL QR Code
                </label>
                <input
                  id="mach-form-qr-code-url"
                  type="text"
                  value={formQrCodeUrl}
                  onChange={(e) => setFormQrCodeUrl(e.target.value)}
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

      {/* Delete confirm modal */}
      {machineToDelete && (
        <Modal size="sm" onClose={closeDeleteModal}>
          <ModalHeader onClose={closeDeleteModal}>
            <h3 className="text-base font-semibold text-ink">ยืนยันการลบเครื่องจักร</h3>
          </ModalHeader>

          <ModalBody>
            <p className="text-sm text-ink leading-relaxed">
              ยืนยันลบเครื่องจักร «{machineToDelete.code ?? machineToDelete.id} — {machineToDelete.name}»?
            </p>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">
              การลบนี้ไม่สามารถกู้คืนได้ ข้อมูลเครื่องจักรนี้จะถูกลบออกจากระบบถาวร
            </p>

            {deleteError && (
              <div className="mt-3">
                <InlineError message={deleteError} />
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <button type="button" onClick={closeDeleteModal} disabled={deleteLoading} className={secondaryBtnClass}>
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              aria-busy={deleteLoading}
              className={destructiveBtnClass}
            >
              {deleteLoading ? "กำลังลบ..." : "ลบ"}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
