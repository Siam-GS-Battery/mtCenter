import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Loader2,
  Package,
  Plus,
  Trash2,
  UserCheck,
  Wrench,
} from "lucide-react";
import { Machine, SparePart, UserProfile, WorkOrder, WorkOrderStep } from "../types";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import { MachineSelect } from "./MachineSelect";
import { MicDictationButton } from "./MicDictationButton";
import {
  PRIORITY_LABELS,
  machineStatusBadgeClass,
  machineStatusLabel,
  priorityChoiceClass,
  sparePartStatusPillClass,
} from "../lib/pillStyles";
import {
  evaluateMachine,
  spindleTempLevel,
  vibrationLevel,
  healthScoreLevel,
} from "../lib/thresholds";
import {
  getSpareParts,
  getSparePartsForMachine,
  toUserMessage,
} from "../services/apiService";
import { MachineSparePart } from "../types";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatWithUnit } from "../lib/format";

// จำนวนผลลัพธ์ที่แสดงต่อการค้นหาหนึ่งครั้ง — พอสำหรับเลือกอะไหล่ ไม่ใช่โหลดทั้งคลัง
const PART_SEARCH_RESULT_LIMIT = 20;

/**
 * The one work-order reporting form.
 *
 * The page (CreateWorkOrderView) and the dialog (CreateWorkOrderModal) are two
 * ways to reach the same task, so they render this component and differ only in
 * their shell. One field set, one validation rule, one resulting status.
 *
 * A newly reported job is `pending`: nobody has picked up a tool yet. The
 * technician moves it to `in_progress` when work actually starts, which is the
 * only moment that claim is true.
 */

export type WorkOrderPriority = "high" | "medium" | "low";

/** Data an alert or the assistant can hand the form to start it part-filled. */
export interface WorkOrderFormPrefill {
  machineId?: string;
  title?: string;
  description?: string;
  priority?: WorkOrderPriority;
  /** Matched against spare-part code OR name — kept for the assistant's suggestion flow. */
  suggestedParts?: string[];
  /**
   * Exact parts already on the order (edit flow). Takes priority over
   * `suggestedParts` when present, and preserves quantities.
   */
  requestedParts?: Array<{
    partId: string | null;
    partCode: string | null;
    partName: string | null;
    quantity: number;
  }>;
  /** Free-text plan, one step per line. */
  actionPlan?: string;
  dueDate?: string;
  symptoms?: string[];
}

interface SelectedPart {
  id: string;
  code: string;
  name: string;
  qty: number;
  /** Stock info — populated when picked from search / AI suggestion; absent on drafts saved before this field existed. */
  stockQuantity?: number;
  unit?: string | null;
  status?: SparePart["status"];
}

interface DraftSnapshot {
  machineId: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  symptoms: string[];
  assignee: string;
  dueDate: string;
  parts: SelectedPart[];
  steps: string[];
}

type Shell = React.ComponentType<{ children: React.ReactNode; className?: string }>;

interface WorkOrderFormProps {
  machines: Machine[];
  activeMachine?: Machine;
  spareParts: SparePart[];
  /** The person filling the form in. Used for ผู้แจ้ง and the default assignee. */
  currentUser?: UserProfile;
  /**
   * Real technicians to choose from (id + display name — `assignedTo` stores
   * `profiles.id`, never a name). Omit it and the assignee falls back to a
   * plain text field that can only ever back `technicianName` — with no
   * roster to resolve a typed name to an id, `assignedTo` is sent as `null`
   * rather than guessed.
   */
  technicians?: Pick<UserProfile, "id" | "name">[];
  prefill?: WorkOrderFormPrefill | null;
  /** Change this to re-initialise the form (the dialog bumps it on open). */
  resetKey?: string | number;
  /** localStorage key for draft persistence. Omit to keep the form in memory. */
  draftStorageKey?: string;
  variant?: "page" | "modal";
  /**
   * Implementations must surface their own errors to the user (SweetAlert2
   * today) AND reject on failure — the rejection is how this form knows to
   * preserve the draft and the unsaved-changes baseline for a retry, instead
   * of clearing them as if the save had succeeded.
   */
  onSubmit: (draft: Partial<WorkOrder>) => void | Promise<void>;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  Body?: Shell;
  Footer?: Shell;
  /** Submit button label. Defaults to the create-flow copy. */
  submitLabel?: string;
  /**
   * "create" (default) submits a brand-new work order with its initial
   * lifecycle fields. "edit" submits only the fields this form actually
   * lets the user change — it must never re-send status/progress/ownership
   * fields the backend would otherwise overwrite on an in-progress order.
   */
  mode?: "create" | "edit";
  /**
   * The id of the work order being edited. Only meaningful when `mode ===
   * "edit"` — passed through to `getSparePartsForMachine` so it can weigh
   * this work order's own history. Omitted in create mode since no work
   * order exists yet.
   */
  workOrderId?: string;
}

const COMMON_SYMPTOMS = [
  "มีเสียงดังผิดปกติที่ชุด Spindle",
  "อุณหภูมิความร้อนสูงเกินกำหนด",
  "แรงสั่นสะเทือน (Vibration) เกินมาตรฐาน",
  "มีคราบน้ำมันหล่อเย็นรั่วซึม",
  "มอเตอร์หยุดทำงานชั่วคราว (Trip)",
  "แรงดันลม/ระบบไฮดรอลิกตก",
];

const STANDARD_STEPS = [
  "สับ Breaker ปลดล็อกระบบไฟฟ้าและติดป้าย Safety LOTO",
  "ถอดครอบคลุมและตรวจสอบตลับลูกปืน Spindle / มอเตอร์",
  "ทำความสะอาดกรองหล่อเย็นและเปลี่ยนชิ้นส่วนอะไหล่ใหม่",
  "ทดสอบเดินเครื่องแบบ No-load 15 นาที และบันทึกค่ามอนิเตอร์",
];

const ROLE_LABELS: Record<UserProfile["role"], string> = {
  technician: "ช่างเทคนิค",
  engineer: "วิศวกร",
  supervisor: "หัวหน้างาน",
};

const SENSOR_TEXT: Record<"normal" | "warning" | "error", string> = {
  normal: "text-ink",
  warning: "text-amber-700",
  error: "text-rose-700",
};

/** Minimum comfortable tap target on a phone. */
const TAP = "min-h-11";

const today = () => new Date().toISOString().slice(0, 10);
const inTwoDays = () => new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);

function buildInitialDraft(
  machines: Machine[],
  activeMachine: Machine | undefined,
  spareParts: SparePart[],
  currentUser: UserProfile | undefined,
  prefill: WorkOrderFormPrefill | null | undefined,
  technicians: Pick<UserProfile, "id" | "name">[] | undefined
): DraftSnapshot {
  const fallbackMachineId = activeMachine?.id || machines[0]?.id || "";

  const parts: SelectedPart[] = prefill?.requestedParts?.length
    ? prefill.requestedParts
        .filter((p) => p.partId || p.partCode || p.partName)
        .map((p) => ({
          id: p.partId || p.partCode || p.partName || "",
          code: p.partCode || "",
          name: p.partName || p.partCode || "",
          qty: p.quantity > 0 ? p.quantity : 1,
        }))
    : (prefill?.suggestedParts || [])
        .map((needle) =>
          spareParts.find(
            (p) =>
              p.code.toLowerCase() === needle.toLowerCase() ||
              p.name.toLowerCase().includes(needle.toLowerCase())
          )
        )
        .filter((p): p is SparePart => Boolean(p))
        .map((p) => ({ id: p.id, code: p.code, name: p.name, qty: 1 }));

  const steps = (prefill?.actionPlan || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // prefill?.machineId is this form's own optional field (WorkOrderFormPrefill),
  // not WorkOrder.machineId — a missing/unrecognised id here already falls back
  // to fallbackMachineId / activeMachine below, so it never silently picks the
  // wrong machine or crashes.
  const machineForPriority =
    machines.find((m) => m.id === (prefill?.machineId || fallbackMachineId)) || activeMachine;

  return {
    machineId: prefill?.machineId || fallbackMachineId,
    title: prefill?.title || "",
    description: prefill?.description || "",
    priority:
      prefill?.priority || (machineForPriority?.status === "error" ? "high" : "medium"),
    symptoms: prefill?.symptoms || [],
    // In roster (select) mode, `assignee` holds a technician id — default to
    // the current user only when they are themselves a technician on the
    // roster. In fallback text mode (no roster available), it holds a plain
    // display name instead.
    assignee:
      technicians && technicians.length > 0
        ? currentUser?.role === "technician" &&
          technicians.some((t) => t.id === currentUser.id)
          ? currentUser.id
          : ""
        : currentUser?.name || "",
    dueDate: prefill?.dueDate || inTwoDays(),
    parts,
    steps,
  };
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  machines,
  activeMachine,
  spareParts,
  currentUser,
  technicians,
  prefill,
  resetKey,
  draftStorageKey,
  variant = "page",
  onSubmit,
  onCancel,
  onDirtyChange,
  Body,
  Footer,
  submitLabel = "ส่งใบงานแจ้งซ่อม",
  mode = "create",
  workOrderId,
}) => {
  const initial = useMemo(
    () => buildInitialDraft(machines, activeMachine, spareParts, currentUser, prefill, technicians),
    // Rebuilt only when the surface asks for a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey]
  );

  const [machineId, setMachineId] = useState(initial.machineId);
  const [title, setTitle] = useState(initial.title);
  const [titleError, setTitleError] = useState("");
  const [machineError, setMachineError] = useState("");
  const [description, setDescription] = useState(initial.description);
  const [priority, setPriority] = useState<WorkOrderPriority>(initial.priority);
  const [symptoms, setSymptoms] = useState<string[]>(initial.symptoms);
  const [assignee, setAssignee] = useState(initial.assignee);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [parts, setParts] = useState<SelectedPart[]>(initial.parts);
  const [steps, setSteps] = useState<string[]>(initial.steps);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [partSearch, setPartSearch] = useState("");
  // ยิงค้นหาไป server หลังพิมพ์หยุด ~300ms กันยิงถี่ทุกตัวอักษร
  const debouncedPartSearch = useDebouncedValue(partSearch, 300);
  const [newStep, setNewStep] = useState("");
  // Parts are the primary way to pick spare parts (not a secondary, collapsed
  // area) — expanded by default rather than gated on whether any are picked.
  const [showParts, setShowParts] = useState(true);
  const [showSteps, setShowSteps] = useState(initial.steps.length > 0);
  const [restoredDraft, setRestoredDraft] = useState(false);

  // คลังอะไหล่มี 8,588 รายการ — ห้ามโหลดทั้งหมดมาไว้ใน memory เพื่อกรองในเครื่อง
  // (นั่นคือปัญหาเดิม: `spareParts` prop เป็นแค่หน้าตัวอย่าง ~100 แถวที่ App โหลด
  // มาแชร์กับหน้าอื่น) จึงยิงค้นหาไป server ทีละคำค้นแทน และเก็บผลลัพธ์ไว้แค่
  // ชั่วคราวในสถานะนี้เท่านั้น
  const [partSearchResults, setPartSearchResults] = useState<SparePart[]>([]);
  const [isSearchingParts, setIsSearchingParts] = useState(false);
  const [partSearchError, setPartSearchError] = useState<string | null>(null);

  useEffect(() => {
    const query = debouncedPartSearch.trim();
    if (!showParts || query === "") {
      setPartSearchResults([]);
      setIsSearchingParts(false);
      setPartSearchError(null);
      return;
    }
    let cancelled = false;
    setIsSearchingParts(true);
    setPartSearchError(null);
    getSpareParts({ search: query, limit: PART_SEARCH_RESULT_LIMIT })
      .then((res) => {
        if (cancelled) return;
        setPartSearchResults(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setPartSearchError(toUserMessage(err, "ค้นหาอะไหล่ไม่สำเร็จ"));
      })
      .finally(() => {
        if (!cancelled) setIsSearchingParts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedPartSearch, showParts]);

  // อะไหล่ที่เคยใช้/รองรับกับเครื่องจักรที่เลือก — วิธีหลักในการเลือกอะไหล่เบิก
  const [machineParts, setMachineParts] = useState<MachineSparePart[]>([]);
  const [isLoadingMachineParts, setIsLoadingMachineParts] = useState(false);
  const [machinePartsError, setMachinePartsError] = useState<string | null>(null);
  const selectedMachineCode = machines.find((m) => m.id === machineId)?.code ?? activeMachine?.code;

  useEffect(() => {
    if (!selectedMachineCode) {
      setMachineParts([]);
      setIsLoadingMachineParts(false);
      setMachinePartsError(null);
      return;
    }
    let cancelled = false;
    setIsLoadingMachineParts(true);
    setMachinePartsError(null);
    getSparePartsForMachine({ machineCode: selectedMachineCode, workOrderId, limit: 30 })
      .then((res) => {
        if (cancelled) return;
        setMachineParts(res.items);
      })
      .catch((err) => {
        if (cancelled) return;
        setMachinePartsError(toUserMessage(err, "โหลดรายการอะไหล่ของเครื่องจักรนี้ไม่สำเร็จ"));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMachineParts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedMachineCode, workOrderId]);

  const baselineRef = useRef<DraftSnapshot>(initial);

  const snapshot: DraftSnapshot = useMemo(
    () => ({ machineId, title, description, priority, symptoms, assignee, dueDate, parts, steps }),
    [machineId, title, description, priority, symptoms, assignee, dueDate, parts, steps]
  );

  const isDirty = useMemo(
    () => JSON.stringify(snapshot) !== JSON.stringify(baselineRef.current),
    [snapshot]
  );

  const applySnapshot = (next: DraftSnapshot) => {
    setMachineId(next.machineId);
    setTitle(next.title);
    setDescription(next.description);
    setPriority(next.priority);
    setSymptoms(next.symptoms);
    setAssignee(next.assignee);
    setDueDate(next.dueDate);
    setParts(next.parts);
    setSteps(next.steps);
    setShowParts(true);
    setShowSteps(next.steps.length > 0);
  };

  // Re-initialise when the surface bumps resetKey (the dialog does this on open).
  const firstRunRef = useRef(true);
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    baselineRef.current = initial;
    setTitleError("");
    setMachineError("");
    setPartSearch("");
    setNewStep("");
    setRestoredDraft(false);
    applySnapshot(initial);
  }, [initial]);

  // Restore a saved draft once, on mount.
  useEffect(() => {
    if (!draftStorageKey) return;
    try {
      const raw = window.localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as DraftSnapshot;
      if (!saved || typeof saved.title !== "string") return;
      applySnapshot({ ...initial, ...saved });
      setRestoredDraft(true);
    } catch {
      // A draft we cannot read is a draft we do not have.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftStorageKey]);

  // Keep the saved draft current while the form is dirty.
  useEffect(() => {
    if (!draftStorageKey) return;
    try {
      if (isDirty) {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(snapshot));
      } else {
        window.localStorage.removeItem(draftStorageKey);
      }
    } catch {
      // Storage full or blocked — the in-memory form still works.
    }
  }, [draftStorageKey, isDirty, snapshot]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Guard a reload or a closed tab while there is unsaved input.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const clearDraft = () => {
    if (!draftStorageKey) return;
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {
      // Nothing to clean up.
    }
  };

  const machine = machines.find((m) => m.id === machineId) || activeMachine || machines[0];
  const evaluation = machine ? evaluateMachine(machine) : null;

  // Whether a real technician roster backs the assignee select — see the
  // `technicians` prop doc. `assignee` holds a technician id in this mode,
  // a plain typed name otherwise.
  const hasRoster = Boolean(technicians && technicians.length > 0);
  const selectedTechnician = hasRoster ? technicians!.find((t) => t.id === assignee) : undefined;

  const toggleSymptom = (symptom: string) =>
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );

  const togglePart = (part: SparePart) =>
    setParts((prev) =>
      prev.some((p) => p.id === part.id)
        ? prev.filter((p) => p.id !== part.id)
        : [
            ...prev,
            {
              id: part.id,
              code: part.code,
              name: part.name,
              qty: 1,
              stockQuantity: part.stockQuantity,
              unit: part.unit,
              status: part.status,
            },
          ]
    );

  const changeQty = (partId: string, delta: number) =>
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
    );

  // เพิ่มอะไหล่จากรายการของเครื่องจักร — คลิกแรกเพิ่มเข้ารายการ (จำนวนเริ่มต้นตาม
  // suggestedQuantity), คลิกซ้ำเพิ่มทีละ 1 โดยใช้ตรรกะเดิมของ togglePart/changeQty
  const addMachinePart = (part: MachineSparePart) => {
    const already = parts.some((p) => p.id === part.id);
    if (!already) {
      setParts((prev) => [
        ...prev,
        {
          id: part.id,
          code: part.code,
          name: part.name,
          qty: part.suggestedQuantity > 0 ? part.suggestedQuantity : 1,
          stockQuantity: part.stockQuantity,
          unit: part.unit,
          status: part.status,
        },
      ]);
    } else {
      changeQty(part.id, 1);
    }
  };

  const decrementOrRemovePart = (partId: string) =>
    setParts((prev) => {
      const found = prev.find((p) => p.id === partId);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((p) => p.id !== partId);
      return prev.map((p) => (p.id === partId ? { ...p, qty: p.qty - 1 } : p));
    });

  const addStep = (text: string) => {
    const value = text.trim();
    if (!value || steps.includes(value)) return;
    setSteps((prev) => [...prev, value]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!title.trim()) {
      setTitleError("กรุณากรอกหัวข้อใบงานแจ้งซ่อม");
      return;
    }
    if (!machine) {
      setMachineError("กรุณาเลือกเครื่องจักรที่แจ้งซ่อม");
      return;
    }

    const now = new Date();
    const stamp = `${today()} ${now.toTimeString().slice(0, 5)}`;
    const planSteps: WorkOrderStep[] = steps.map((text) => ({
      text,
      addedBy: currentUser?.name,
      addedAt: today(),
    }));

    const requestedParts = parts.map((p) => ({
      partId: p.id,
      partCode: p.code,
      partName: p.name,
      quantity: p.qty,
      status: "pending",
    }));

    const draft: Partial<WorkOrder> =
      mode === "edit"
        ? {
            // Edit mode only ever changes the fields this form exposes.
            // It must never re-send create-time lifecycle/ownership fields
            // (status, stepsCompleted, assignedDate, requestedBy, createdAt,
            // assignedTo, aiVerificationScore, code) — those are whitelisted
            // by the backend PATCH and would clobber real progress on an
            // in-progress order.
            title: title.trim(),
            description: description.trim() || "ไม่ระบุรายละเอียดเพิ่มเติม",
            machineId: machine.id,
            machineCode: machine.code ?? undefined,
            machineName: machine.name,
            priority,
            dueDate: dueDate || inTwoDays(),
            symptoms: symptoms.length > 0 ? symptoms : undefined,
            requestedParts,
            actionPlan: steps,
            actionPlanSteps: planSteps.length > 0 ? planSteps : undefined,
            totalSteps: steps.length,
          }
        : {
            title: title.trim(),
            description: description.trim() || "ไม่ระบุรายละเอียดเพิ่มเติม",
            machineId: machine.id,
            // Machine.code is null for 3/973 real machines — machineCode is optional
            // on WorkOrder, so a missing code is omitted rather than coerced to null.
            machineCode: machine.code ?? undefined,
            machineName: machine.name,
            priority,
            // A job nobody has started is waiting, not in progress.
            status: "pending",
            // `assigned_to` stores profiles.id (`usr-...`), never a display name —
            // never render assignedTo directly, always resolve it to a name first.
            // In roster (select) mode, `assignee` already holds that id; a blank
            // selection means genuinely unassigned, so it is left `undefined`
            // (backend/src/routes/workOrders.ts coerces that to `null` on write)
            // rather than silently falling back to whoever is submitting the form.
            technicianName:
              selectedTechnician?.name ||
              (hasRoster ? "" : assignee.trim()) ||
              currentUser?.name ||
              "",
            assignedTo: hasRoster ? assignee || undefined : undefined,
            requestedBy: currentUser
              ? `${currentUser.name} (${ROLE_LABELS[currentUser.role]})`
              : undefined,
            assignedDate: today(),
            dueDate: dueDate || inTwoDays(),
            symptoms: symptoms.length > 0 ? symptoms : undefined,
            createdAt: stamp,
            updatedAt: today(),
            requestedParts,
            actionPlan: steps,
            actionPlanSteps: planSteps.length > 0 ? planSteps : undefined,
            totalSteps: steps.length,
            stepsCompleted: 0,
          };

    setMachineError("");
    setSubmitError("");

    setIsSubmitting(true);
    try {
      await onSubmit(draft);
      clearDraft();
      baselineRef.current = snapshot;
    } catch (err) {
      if (mode === "edit") {
        // Keep the form open with the entered data and surface the failure
        // inline instead of silently looking like it saved.
        setSubmitError(
          err instanceof Error && err.message
            ? err.message
            : "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่"
        );
      }
      // Otherwise onSubmit already surfaced the failure to the user (SweetAlert2).
      // Swallow it here so the draft and the unsaved-changes baseline are
      // preserved for a retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  // ผลค้นหาจาก server ครอบคลุมอะไหล่ทั้งคลัง (8,588 รายการ) แทนที่การกรอง
  // `spareParts` prop ในเครื่อง ซึ่งเป็นแค่หน้าตัวอย่าง ~100 แถวที่ App โหลดมา
  // แชร์กับหน้าอื่น — เห็นแค่ 1% ของคลังจริงถ้ายังกรองแบบเดิม
  const availableParts = partSearchResults;

  const BodyShell = Body ?? DefaultBody;
  const FooterShell = Footer ?? DefaultFooter;

  const sectionClass =
    variant === "page"
      ? "bg-white rounded-[18px] p-5 sm:p-6 border border-hairline space-y-4"
      : "space-y-4 pt-5 first:pt-0 border-t first:border-t-0 border-divider";

  const inputClass =
    "w-full bg-white border border-hairline rounded-full px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-focus/40 transition-shadow";
  const areaClass =
    "w-full bg-white border border-hairline rounded-[18px] p-3.5 text-sm text-ink placeholder:text-ink-faint leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-focus/40 transition-shadow";
  const labelClass = "block text-xs font-semibold text-ink-muted mb-2";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
      <BodyShell className={variant === "page" ? "space-y-5" : "space-y-6"}>
        {submitError && (
          <div
            role="alert"
            className="flex items-center gap-2 p-3.5 rounded-[14px] bg-rose-50 text-rose-700 text-xs font-semibold"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {restoredDraft && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-[14px] bg-amber-50 text-amber-900 text-xs">
            <span>กู้คืนข้อมูลจากแบบร่างที่บันทึกไว้ในเครื่องนี้แล้ว</span>
            <button
              type="button"
              onClick={() => {
                clearDraft();
                applySnapshot(initial);
                setRestoredDraft(false);
              }}
              className={`px-4 rounded-full bg-white text-amber-900 font-semibold hover:bg-amber-100 active:scale-95 transition-all cursor-pointer ${TAP}`}
            >
              เริ่มกรอกใหม่
            </button>
          </div>
        )}

        {/* Machine + what is wrong */}
        <section className={sectionClass}>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary shrink-0" />
            <span>เครื่องจักรและอาการที่พบ</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <MachineSelect
                machines={machines}
                activeMachine={machines.find((m) => m.id === machineId) ?? null}
                onSelectMachine={(m) => {
                  setMachineId(m.id);
                  if (machineError) setMachineError("");
                }}
                label="เครื่องจักรที่แจ้งซ่อม"
                placeholder="เลือกเครื่องจักร"
                required
              />
              {machineError && (
                <p className="text-[11px] mt-1.5 text-rose-700" role="alert">
                  {machineError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="wo-title" className={labelClass}>
                หัวข้อแจ้งซ่อม <span className="text-rose-600">*</span>
              </label>
              <input
                id="wo-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError("");
                }}
                placeholder="เช่น เปลี่ยนลูกปืน Spindle เนื่องจากความร้อนสะสม"
                aria-invalid={!!titleError}
                aria-describedby="wo-title-help"
                className={
                  titleError
                    ? inputClass.replace("border-hairline", "border-rose-400")
                    : inputClass
                }
              />
              <p
                id="wo-title-help"
                className={`text-[11px] mt-1.5 ${titleError ? "text-rose-700" : "text-ink-faint"}`}
                role={titleError ? "alert" : undefined}
              >
                {titleError || "ระบุสั้นๆ ให้ค้นหาเจอในภายหลัง"}
              </p>
            </div>
          </div>

          {/* Machine condition — all four states, with the readings behind them */}
          {machine && evaluation && (
            <div className="rounded-[14px] bg-divider p-3.5 space-y-2">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
                <span className={machineStatusBadgeClass(machine.status)}>
                  {machineStatusLabel(machine.status)}
                </span>
                {/* Readings only when the machine reports them — no sensors are
                    installed, and a label followed by a dash suggests an
                    instrument that failed rather than one that never existed. */}
                {machine.spindleTemp != null && (
                  <span>
                    อุณหภูมิ Spindle{" "}
                    <strong className={SENSOR_TEXT[spindleTempLevel(machine.spindleTemp)]}>
                      {formatWithUnit(machine.spindleTemp, "°C", 1)}
                    </strong>
                  </span>
                )}
                {machine.vibrationMms != null && (
                  <span>
                    แรงสั่นสะเทือน{" "}
                    <strong className={SENSOR_TEXT[vibrationLevel(machine.vibrationMms)]}>
                      {formatWithUnit(machine.vibrationMms, "mm/s", 2)}
                    </strong>
                  </span>
                )}
                {machine.healthScore != null && (
                  <span>
                    ดัชนีสุขภาพเครื่อง{" "}
                    <strong className={SENSOR_TEXT[healthScoreLevel(machine.healthScore)]}>
                      {machine.healthScore}%
                    </strong>
                  </span>
                )}
              </div>
              <ul className="space-y-1 text-[11px] text-ink-muted leading-relaxed">
                {evaluation.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5">
                    <AlertTriangle
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        evaluation.status === "normal" ? "text-ink-faint" : "text-amber-700"
                      }`}
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <fieldset>
            <legend className={labelClass}>อาการผิดปกติที่ตรวจพบ</legend>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((symptom) => {
                const selected = symptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3.5 rounded-full border text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${TAP} ${
                      selected
                        ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                        : "bg-white text-ink-muted border-hairline hover:bg-primary/5"
                    }`}
                  >
                    {selected ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="text-left">{symptom}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="wo-description" className={labelClass}>
              รายละเอียดเพิ่มเติม
            </label>
            <div className="relative">
              <textarea
                id="wo-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น เสียงดังบริเวณ Spindle เมื่อหมุนเกิน 8,000 RPM และความร้อนขึ้นเร็วหลังเปิดเครื่อง"
                className={`${areaClass} pr-14 pb-14`}
              />
              <MicDictationButton
                currentValue={description}
                onTranscript={(text) => setDescription((prev) => prev + text)}
                className="absolute right-2.5 bottom-2.5"
              />
            </div>
          </div>
        </section>

        {/* Urgency, owner, due date */}
        <section className={sectionClass}>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary shrink-0" />
            <span>ความเร่งด่วนและผู้รับผิดชอบ</span>
          </h2>

          <fieldset>
            <legend className={labelClass}>ระดับความสำคัญ</legend>
            <div className="grid grid-cols-3 gap-2">
              {(["high", "medium", "low"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={priority === key}
                  onClick={() => setPriority(key)}
                  className={`rounded-full border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${TAP} ${priorityChoiceClass(
                    key,
                    priority === key
                  )}`}
                >
                  {PRIORITY_LABELS[key]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wo-assignee" className={labelClass}>
                ช่างผู้รับผิดชอบ
              </label>
              {technicians && technicians.length > 0 ? (
                <div className="relative">
                  <select
                    id="wo-assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className={`${inputClass} appearance-none pr-11 cursor-pointer`}
                  >
                    <option value="">ยังไม่มอบหมาย</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-ink-faint absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <input
                  id="wo-assignee"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="พิมพ์ชื่อช่างที่รับงาน"
                  className={inputClass}
                />
              )}
              <p className="text-[11px] text-ink-faint mt-1.5">
                เว้นว่างได้ ระบบจะบันทึกชื่อผู้แจ้งไว้จนกว่าจะมอบหมายใหม่
              </p>
            </div>

            <div>
              <label htmlFor="wo-due" className={labelClass}>
                กำหนดเสร็จ
              </label>
              <input
                id="wo-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Optional detail — collapsed, because most reports never need it */}
        <section className={sectionClass}>
          <DisclosureHeader
            icon={<Package className="w-4 h-4 text-primary shrink-0" />}
            label="อะไหล่ที่คาดว่าต้องเบิก"
            hint={parts.length > 0 ? `เลือกแล้ว ${parts.length} รายการ` : "ไม่บังคับ"}
            expanded={showParts}
            onToggle={() => setShowParts((v) => !v)}
            panelId="wo-parts-panel"
          />

          {showParts && (
            <div className="space-y-2">
              <p className={labelClass}>อะไหล่ที่เคยใช้กับเครื่องนี้</p>
              {isLoadingMachineParts ? (
                <p className="text-xs text-ink-faint py-2 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                  <span>กำลังโหลดรายการอะไหล่ของเครื่องจักรนี้...</span>
                </p>
              ) : machinePartsError ? (
                <p className="text-xs text-rose-700 font-semibold py-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{machinePartsError}</span>
                </p>
              ) : machineParts.length === 0 ? (
                <p className="text-xs text-ink-faint py-2">
                  ยังไม่มีประวัติการใช้อะไหล่ของเครื่องจักรนี้ — ค้นหาจากคลังด้านล่าง
                </p>
              ) : (
                <ul className="rounded-[14px] overflow-hidden divide-y divide-divider border border-hairline">
                  {machineParts.map((part) => {
                    const selectedPart = parts.find((p) => p.id === part.id);
                    const outOfStock = part.stockQuantity <= 0;
                    const usageHint =
                      part.matchReason === "compatible" && !part.usageCount
                        ? "อะไหล่ที่รองรับเครื่องนี้"
                        : [
                            part.usageCount ? `เคยใช้ ${part.usageCount} ครั้ง` : null,
                            part.lastUsedDate ? `ล่าสุด ${part.lastUsedDate}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ");
                    return (
                      <li
                        key={part.id}
                        className="p-3 flex items-center justify-between gap-3 bg-white"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] text-primary font-semibold block">
                            {part.code}
                          </span>
                          <span className="text-xs font-semibold text-ink-muted truncate block">
                            {part.name}
                          </span>
                          <span className={sparePartStatusPillClass(part.status) + " mt-1"}>
                            คงเหลือ {part.stockQuantity} {part.unit ?? ""}
                          </span>
                          {usageHint && (
                            <span className="text-[11px] text-ink-faint block mt-0.5">
                              {usageHint}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {selectedPart && (
                            <div className="flex items-center rounded-full border border-hairline overflow-hidden">
                              <button
                                type="button"
                                onClick={() => decrementOrRemovePart(part.id)}
                                aria-label={`ลดจำนวน ${part.name}`}
                                className="w-11 h-11 text-ink-muted hover:bg-primary/5 font-semibold cursor-pointer flex items-center justify-center"
                              >
                                −
                              </button>
                              <span className="px-3 text-xs font-semibold text-ink tabular-nums">
                                {selectedPart.qty}
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => addMachinePart(part)}
                            title={
                              outOfStock
                                ? "อะไหล่หมดสต็อก แต่ยังเลือกเบิกได้ (เบิกได้เมื่อมีของเข้า)"
                                : undefined
                            }
                            aria-label={`เพิ่ม ${part.name} เข้ารายการเบิก`}
                            className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all ${TAP} ${
                              outOfStock
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {showParts && (
            <div id="wo-parts-panel" className="space-y-3">
              {parts.length > 0 && (
                <ul className="rounded-[14px] overflow-hidden divide-y divide-divider border border-hairline">
                  {parts.map((item) => {
                    const overStock =
                      typeof item.stockQuantity === "number" && item.qty > item.stockQuantity;
                    return (
                    <li
                      key={item.id}
                      className="p-3 flex items-center justify-between gap-3 bg-white"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] text-primary font-semibold block">
                          {item.code}
                        </span>
                        <span className="text-xs font-semibold text-ink-muted truncate block">
                          {item.name}
                        </span>
                        {typeof item.stockQuantity === "number" && (
                          <span
                            className={
                              item.status
                                ? sparePartStatusPillClass(item.status) + " mt-1"
                                : "text-[10px] text-ink-faint mt-1 inline-block"
                            }
                          >
                            คงเหลือ {item.stockQuantity} {item.unit ?? ""}
                          </span>
                        )}
                        {overStock && (
                          <span className="text-[11px] text-rose-700 font-semibold block mt-0.5">
                            จำนวนที่เบิกเกินยอดคงเหลือ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center rounded-full border border-hairline overflow-hidden">
                          <button
                            type="button"
                            onClick={() => changeQty(item.id, -1)}
                            aria-label={`ลดจำนวน ${item.name}`}
                            className="w-11 h-11 text-ink-muted hover:bg-primary/5 font-semibold cursor-pointer flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="px-3 text-xs font-semibold text-ink tabular-nums">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQty(item.id, 1)}
                            aria-label={`เพิ่มจำนวน ${item.name}`}
                            className="w-11 h-11 text-ink-muted hover:bg-primary/5 font-semibold cursor-pointer flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setParts(parts.filter((p) => p.id !== item.id))}
                          aria-label={`นำ ${item.name} ออกจากรายการ`}
                          className="w-11 h-11 rounded-full text-ink-faint hover:text-rose-700 hover:bg-rose-50 cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              )}

              <div>
                <label htmlFor="wo-part-search" className={labelClass}>
                  ค้นหาอะไหล่จากคลัง (ทั้งหมด 8,588 รายการ)
                </label>
                <div className="relative">
                  <input
                    id="wo-part-search"
                    type="text"
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    placeholder="พิมพ์รหัสหรือชื่ออะไหล่"
                    className={`${inputClass} pr-11`}
                  />
                  {isSearchingParts && (
                    <Loader2
                      className="w-4 h-4 text-ink-faint absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>

              {partSearchError ? (
                <p className="text-xs text-rose-700 font-semibold py-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{partSearchError}</span>
                </p>
              ) : partSearch.trim() === "" ? (
                <p className="text-xs text-ink-faint py-2">
                  พิมพ์อย่างน้อย 1 ตัวอักษรเพื่อค้นหาอะไหล่จากคลังทั้งหมด
                </p>
              ) : availableParts.length === 0 && !isSearchingParts ? (
                <p className="text-xs text-ink-faint py-2">
                  ไม่พบอะไหล่ที่ตรงกับคำค้นนี้ในคลัง
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableParts.map((part) => {
                    const selected = parts.some((p) => p.id === part.id);
                    const outOfStock = part.stockQuantity <= 0;
                    return (
                      <button
                        key={part.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => togglePart(part)}
                        title={outOfStock ? "อะไหล่หมดสต็อก แต่ยังเลือกเบิกได้ (เบิกได้เมื่อมีของเข้า)" : undefined}
                        className={`p-3 rounded-[14px] border text-left flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-[0.98] ${TAP} ${
                          selected
                            ? "bg-primary/10 border-primary text-primary"
                            : outOfStock
                            ? "bg-white border-rose-200 text-ink-muted hover:bg-rose-50"
                            : "bg-white border-hairline text-ink-muted hover:bg-primary/5"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="font-mono text-[10px] font-semibold opacity-80 block">
                            {part.code}
                          </span>
                          <span className="text-xs font-semibold truncate block">
                            {part.name}
                          </span>
                          <span className={sparePartStatusPillClass(part.status) + " mt-1"}>
                            คงเหลือ {part.stockQuantity} {part.unit}
                          </span>
                        </span>
                        <span className="text-[10px] font-semibold shrink-0">
                          {selected ? "เลือกแล้ว" : outOfStock ? "หมด" : "เบิก"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <section className={sectionClass}>
          <DisclosureHeader
            icon={<CheckSquare className="w-4 h-4 text-primary shrink-0" />}
            label="ขั้นตอนงานที่วางไว้"
            hint={steps.length > 0 ? `${steps.length} ขั้นตอน` : "ไม่บังคับ"}
            expanded={showSteps}
            onToggle={() => setShowSteps((v) => !v)}
            panelId="wo-steps-panel"
          />

          {showSteps && (
            <div id="wo-steps-panel" className="space-y-3">
              {steps.length > 0 && (
                <ol className="space-y-2">
                  {steps.map((step, idx) => (
                    <li
                      key={step}
                      className="flex items-center justify-between gap-2 p-3 rounded-[14px] bg-divider text-xs text-ink-muted"
                    >
                      <span className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-white text-primary font-semibold flex items-center justify-center text-[11px] shrink-0 tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                        aria-label={`ลบขั้นตอนที่ ${idx + 1}`}
                        className="w-11 h-11 rounded-full text-ink-faint hover:text-rose-700 hover:bg-rose-50 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}

              <div className="flex flex-wrap gap-2">
                {STANDARD_STEPS.map((step) => {
                  const added = steps.includes(step);
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => addStep(step)}
                      disabled={added}
                      className={`px-3.5 rounded-full border text-xs flex items-center gap-1.5 transition-all ${TAP} ${
                        added
                          ? "bg-divider text-ink-faint border-hairline cursor-default"
                          : "bg-white text-ink-muted border-hairline hover:bg-primary/5 cursor-pointer active:scale-95"
                      }`}
                    >
                      {added ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="text-left">{step}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStep(newStep);
                      setNewStep("");
                    }
                  }}
                  placeholder="เพิ่มขั้นตอนของคุณเอง"
                  aria-label="เพิ่มขั้นตอนปฏิบัติงาน"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => {
                    addStep(newStep);
                    setNewStep("");
                  }}
                  className={`px-5 rounded-full bg-divider hover:bg-primary/5 text-ink font-semibold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0 ${TAP}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่ม</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </BodyShell>

      <FooterShell>
        <button
          type="button"
          onClick={onCancel}
          className={`w-full sm:w-auto px-6 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-primary/5 font-semibold text-sm cursor-pointer active:scale-95 transition-all ${TAP}`}
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-6 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${TAP}`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{isSubmitting ? "กำลังบันทึก..." : submitLabel}</span>
        </button>
      </FooterShell>
    </form>
  );
};

/* ---------------------------------------------------------------- */
/* Pieces                                                           */
/* ---------------------------------------------------------------- */

const DefaultBody: Shell = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const DefaultFooter: Shell = ({ children, className }) => (
  <div
    className={
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 " + (className ?? "")
    }
  >
    {children}
  </div>
);

function DisclosureHeader(props: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  expanded: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  const { icon, label, hint, expanded, onToggle, panelId } = props;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={panelId}
      className={`w-full flex items-center justify-between gap-3 text-left cursor-pointer group ${TAP}`}
    >
      <span className="text-sm font-semibold text-ink flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      <span className="flex items-center gap-2 text-xs text-ink-faint shrink-0">
        <span>{hint}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </span>
    </button>
  );
}

/**
 * Shared "you have unsaved input" guard. Both surfaces route every way out of
 * the form through it, so a stray tap never silently discards a report.
 */
export function DiscardChangesDialog(props: {
  onKeepEditing: () => void;
  onDiscard: () => void;
  draftIsSaved?: boolean;
}) {
  const { onKeepEditing, onDiscard, draftIsSaved } = props;
  return (
    <Modal size="sm" onClose={onKeepEditing}>
      <ModalHeader onClose={onKeepEditing}>
        <h3 className="text-base font-semibold text-ink">ออกจากแบบฟอร์มโดยยังไม่ส่ง</h3>
      </ModalHeader>
      <ModalBody>
        <p className="text-sm text-ink-muted leading-relaxed">
          {draftIsSaved
            ? "ข้อมูลที่กรอกไว้ถูกเก็บเป็นแบบร่างในเครื่องนี้ และจะกลับมาให้กรอกต่อเมื่อเปิดหน้านี้อีกครั้ง"
            : "ข้อมูลที่กรอกไว้จะหายไปทั้งหมด ต้องการออกจากแบบฟอร์มหรือไม่"}
        </p>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={onKeepEditing}
          className="w-full sm:w-auto px-6 min-h-11 rounded-full bg-pearl text-ink-muted border border-divider hover:bg-primary/5 font-semibold text-sm cursor-pointer active:scale-95 transition-all"
        >
          กรอกต่อ
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="w-full sm:w-auto px-6 min-h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm cursor-pointer active:scale-95 transition-all"
        >
          ออกจากแบบฟอร์ม
        </button>
      </ModalFooter>
    </Modal>
  );
}
