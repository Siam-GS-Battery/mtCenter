import React, { useState, useEffect, useMemo } from "react";
import {
  UserRole,
  UserProfile,
  Machine,
  WorkOrder,
  SparePart,
  ManualDoc,
  MachineStats,
  SparePartStats,
  WorkOrderStats,
} from "./types";
// Knowledge Base has no backend table/source (no kb_articles table exists and
// no Excel workbook feeds it) — MOCK_KB_ARTICLES is the one deliberate
// exception that keeps using fixture data. See data/mockData.ts.
import { MOCK_KB_ARTICLES, KnowledgeArticle } from "./data/mockData";
import { truncateText } from "./lib/format";
import {
  getUsers,
  getMachines,
  getMachineStats,
  getWorkOrders,
  getWorkOrderStats,
  getSpareParts,
  getSparePartStats,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  approveWorkOrder,
  toUserMessage,
  setCurrentUserId,
} from "./services/apiService";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { ChangePasswordScreen } from "./components/ChangePasswordScreen";
import { Sidebar, getRoleNavItems, getRoleDefaultTab } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ScanMachineView } from "./components/views/ScanMachineView";
import { AIChatView } from "./components/views/AIChatView";
import { MyWorkOrdersView } from "./components/views/MyWorkOrdersView";
import { SparePartsView } from "./components/views/SparePartsView";
import { ManualsView } from "./components/views/ManualsView";
import { PendingReviewView } from "./components/views/PendingReviewView";
import { KnowledgeReviewView } from "./components/views/KnowledgeReviewView";
import { KnowledgeOverviewPanel } from "./components/views/KnowledgeOverviewPanel";
import { UploadManualView } from "./components/views/UploadManualView";
import { KnowledgeBaseView } from "./components/views/KnowledgeBaseView";
import { AllWorkOrdersView } from "./components/views/AllWorkOrdersView";
import { SupervisorDashboardView } from "./components/views/SupervisorDashboardView";
import { SupervisorReportsView } from "./components/views/SupervisorReportsView";
import { CreateWorkOrderView } from "./components/views/CreateWorkOrderView";
import SparePartsAdminView from "./components/views/SparePartsAdminView";
import MachineAdminView from "./components/views/MachineAdminView";
import { SettingsModal } from "./components/SettingsModal";
import { HelpModal } from "./components/HelpModal";
import { AIAssistantDrawer } from "./components/AIAssistantDrawer";
import AIAssistantToggleButton from "./components/AIAssistantToggleButton";
import { CreateWorkOrderModal, PrefilledWorkOrderData } from "./components/CreateWorkOrderModal";
import type { NotificationTarget } from "./components/TopBar";
import { defaultDueDate } from "./lib/workOrderStatus";
import { AlertCircle, Menu } from "lucide-react";
import { notifyToast, notifySaving, dismissSaving, notifySaved, notifyFailed } from "./lib/swal";

export default function App() {
  // 1. Auth state — identity now comes from the auth context, not a
  // hardcoded role default or a role->profile map built from GET /api/users.
  const { user: currentUser, isLoading: isAuthLoading, mustChangePassword, logout } = useAuth();
  const currentRole: UserRole | undefined = currentUser?.role;
  // Full technician roster (id + name) for WorkOrderForm's assignee select.
  const [technicians, setTechnicians] = useState<Pick<UserProfile, "id" | "name">[]>([]);
  // Single source of truth for the "assignee" identity used to scope
  // "ใบงานของฉัน" (my work orders) — both the stats badge count and the
  // list (MyWorkOrdersView) must filter on this exact same value.
  // work_orders.assigned_to stores profiles.id (`usr-...`), not a display
  // name — 8,589/8,606 real rows already use that id; only 17 legacy rows
  // hold a Thai name from before this fix. Filtering by display name here
  // would silently match almost nothing, so this must stay the user's id.
  const currentAssigneeKey: string | undefined = currentUser?.id;

  // 2. Active View Tab State
  const [activeTab, setActiveTab] = useState<string>("scan");

  // 3. Sidebar Responsive State
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // 4. Data States — real empty state, no MOCK_* fallback. Populated from the
  // backend on mount (see the data-loading effect below); left empty if that
  // fetch fails, with the failure surfaced through loadError/toast, never
  // silently papered over with fixture data.
  const [machines, setMachines] = useState<Machine[]>([]);
  const [activeMachine, setActiveMachine] = useState<Machine | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  // Aggregate counts from the /stats endpoints — dashboards/KPI tiles must
  // read these instead of reducing over `machines`/`workOrders`/`spareParts`,
  // since those arrays are now paginated and no longer guaranteed to hold
  // the full table (973 machines / 8,589 work orders / 8,588 spare parts).
  const [machineStats, setMachineStats] = useState<MachineStats | null>(null);
  const [workOrderStats, setWorkOrderStats] = useState<WorkOrderStats | null>(null);
  const [sparePartStats, setSparePartStats] = useState<SparePartStats | null>(null);
  // Scoped to the current user (assignedTo=currentAssigneeKey) — used only for
  // the "ใบงานของฉัน" sidebar badge. `workOrderStats` above stays factory-wide
  // (it also feeds SupervisorDashboardView's KPIs) so it must not be scoped.
  const [myWorkOrderStats, setMyWorkOrderStats] = useState<WorkOrderStats | null>(null);
  // Knowledge base has no backend table/Excel source — see the import note
  // at the top of this file. This is the one deliberate mock exception.
  const [kbArticles] = useState<KnowledgeArticle[]>(MOCK_KB_ARTICLES);

  // 4b. Initial load state — a real loading state and a real error state,
  // no silent fallback to fake data if the backend can't be reached.
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // 5. Initial AI Chat & Side Drawer Prompt passing state
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>("");
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiDrawerPrompt, setAiDrawerPrompt] = useState<string>("");

  // 6. Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCreateWOModalOpen, setIsCreateWOModalOpen] = useState(false);
  const [prefilledWOData, setPrefilledWOData] = useState<PrefilledWorkOrderData | null>(null);

  // 7. Toast Notification — delegates to SweetAlert2 (see lib/swal.ts). Signature
  // kept as-is since ~20 call sites across this file depend on it.
  const showToast = (msg: string, type: "success" | "error" = "success") => notifyToast(msg, type);

  // Auto handle window resize for sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keep apiService's module-level actor id in sync with the resolved
  // current user, so createWorkOrder/updateWorkOrder/aiChat/aiDiagnose send
  // a valid x-user-id header instead of an empty one.
  useEffect(() => {
    setCurrentUserId(currentUser?.id ?? null);
  }, [currentUser?.id]);

  // รีเซ็ตหน้าจอเมื่อสลับผู้ใช้หรือ role เพราะ App ไม่ถูก unmount ตอน logout
  // (AuthProvider แค่ re-render) ทำให้ activeTab/activeMachine/modal ต่างๆ
  // ที่ผูกกับผู้ใช้เดิมค้างอยู่ ต้องรีเซ็ตกลับค่าเริ่มต้นทุกครั้งที่ user หรือ role เปลี่ยน
  const userSessionKey = currentUser ? `${currentUser.id}:${currentUser.role}` : null;
  useEffect(() => {
    setActiveTab(currentRole ? getRoleDefaultTab(currentRole) : "scan");
    setActiveMachine(null);
    setIsSettingsOpen(false);
    setIsHelpOpen(false);
    setIsCreateWOModalOpen(false);
    setIsAiDrawerOpen(false);
    setPrefilledWOData(null);
  }, [userSessionKey]);

  // กันหน้าค้าง: ถ้า activeTab ปัจจุบันไม่ได้อยู่ในสิทธิ์ของ role ปัจจุบัน
  // (เช่นสลับ role แล้ว effect ด้านบนยังไม่ทันรีเซ็ต หรือกรณีอื่นที่ทำให้ activeTab
  // เพี้ยนไปจากสิทธิ์) ให้ตกกลับไปหน้าเริ่มต้นของ role นั้นแทน
  useEffect(() => {
    if (!currentRole) return;
    const allowedTabIds = getRoleNavItems(currentRole).map((item) => item.id);
    if (!allowedTabIds.includes(activeTab)) {
      setActiveTab(getRoleDefaultTab(currentRole));
    }
  }, [currentRole, activeTab]);

  // Load live data from the backend on mount. No mock fallback of any kind:
  // `users` and `machines` are the two things the rest of the app cannot
  // render sensibly without (currentUser / activeMachine), so they gate a
  // real loading state and a real error state (see the guard right before
  // the main return). Work orders / spare parts / manuals / stats are
  // supplementary — a failure in any one of those degrades just that slice
  // (surfaced via toast) without blocking the rest of the app from loading.
  useEffect(() => {
    // Wait for a signed-in user (and a completed password change) before
    // hitting any authenticated endpoint — otherwise this fires on the
    // login/change-password screens too and every call 401s.
    if (!currentUser || mustChangePassword) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    // 973 machines total (per docs/data-import-spec.md) fits comfortably
    // under the backend's max page size of 1000, so this one call covers
    // the whole table. Work orders (8,589) and spare parts (8,588) never fit
    // in one page at any limit, so this is deliberately a small window (100
    // rows) — just enough for the views still built around an in-memory
    // slice (MyWorkOrdersView, PendingReviewView, the WorkOrderForm part
    // picker, etc.), not an attempt at "the whole table". The views that
    // actually need to search/browse the full 8,000+ rows (AllWorkOrdersView,
    // SparePartsView, SparePartsAdminView) fetch their own paginated,
    // server-filtered slice directly and ignore this one — see those
    // components. Asking for 1000 rows here also used to risk an overlong
    // query string on the work-orders endpoint (backend defect); 100 avoids
    // that too. Dashboards/KPIs never read this array — they read /stats.
    Promise.all([getUsers(), getMachines({ limit: 1000 })])
      .then(([usersRes, machinesRes]) => {
        if (cancelled) return;

        setTechnicians(
          usersRes
            .filter((u) => u.role === "technician")
            .map((u) => ({ id: u.id, name: u.name }))
        );

        setMachines(machinesRes.data);
        if (machinesRes.data.length > 0) {
          setActiveMachine(machinesRes.data[0]);
        }

        setIsLoading(false);

        Promise.allSettled([
          getWorkOrders({ limit: 100 }),
          getSpareParts({ limit: 100 }),
          getMachineStats(),
          getWorkOrderStats(),
          getSparePartStats(),
        ]).then(
          ([
            workOrdersRes,
            sparePartsRes,
            machineStatsRes,
            workOrderStatsRes,
            sparePartStatsRes,
          ]) => {
            if (cancelled) return;

            if (workOrdersRes.status === "fulfilled") {
              setWorkOrders(workOrdersRes.value.data);
            } else {
              showToast(
                `ไม่สามารถโหลดใบงานซ่อมบำรุงได้: ${toUserMessage(workOrdersRes.reason)}`,
                "error"
              );
            }

            if (sparePartsRes.status === "fulfilled") {
              setSpareParts(sparePartsRes.value.data);
            } else {
              showToast(
                `ไม่สามารถโหลดคลังอะไหล่ได้: ${toUserMessage(sparePartsRes.reason)}`,
                "error"
              );
            }

            if (machineStatsRes.status === "fulfilled") setMachineStats(machineStatsRes.value);
            if (workOrderStatsRes.status === "fulfilled") setWorkOrderStats(workOrderStatsRes.value);
            if (sparePartStatsRes.status === "fulfilled") setSparePartStats(sparePartStatsRes.value);
          }
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(toUserMessage(err, "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง"));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, currentUser, mustChangePassword]);

  // Refetch the current user's own work-order stats whenever the assignee
  // identity changes (initial load once users/currentUser resolve, or a role
  // switch afterwards) — keeps the "ใบงานของฉัน" badge scoped to this user
  // instead of the factory-wide count from `workOrderStats`.
  useEffect(() => {
    if (!currentAssigneeKey) {
      setMyWorkOrderStats(null);
      return;
    }
    let cancelled = false;
    getWorkOrderStats({ assignedTo: currentAssigneeKey })
      .then((stats) => {
        if (!cancelled) setMyWorkOrderStats(stats);
      })
      .catch(() => {
        /* stale/no scoped stats is fine for a background badge fetch */
      });
    return () => {
      cancelled = true;
    };
  }, [currentAssigneeKey, reloadToken]);

  // Jump from a TopBar notification to the page that answers it, switching the
  // active machine first when the alert is about a specific one.
  // target.machineId only ever comes from a machine-status alert (TopBar derives
  // it from a real Machine.id, never from WorkOrder.machineId, which is null for
  // every imported work order) — the `if (machine)` guard already degrades
  // gracefully (keeps the current active machine, still switches tabs) on a miss.
  const handleNotificationNavigate = (target: NotificationTarget) => {
    if (target.machineId) {
      const machine = machines.find((m) => m.id === target.machineId);
      if (machine) setActiveMachine(machine);
    }
    setActiveTab(target.tab);
  };

  // Helper to open Side AI Assistant Drawer without switching pages
  const handleAskAIWithPrompt = (prompt?: string) => {
    if (prompt) {
      setAiDrawerPrompt(prompt);
      setChatInitialPrompt(prompt);
    }
    setIsAiDrawerOpen(true);
  };

  // Work Order Creation Handlers
  const handleOpenCreateWorkOrderModal = (prefilled?: PrefilledWorkOrderData) => {
    setPrefilledWOData(prefilled || null);
    setIsCreateWOModalOpen(true);
  };

  const handleCreateWorkOrderSubmit = async (newWOData: Partial<WorkOrder>) => {
    // Unreachable in practice — the form that calls this only renders once
    // currentUser/activeMachine are loaded (see the guard before the main
    // return) — but kept as a real runtime check rather than a type assertion.
    if (!currentUser || !activeMachine) {
      showToast("ยังไม่พร้อมสร้างใบงานซ่อม กรุณาลองใหม่อีกครั้ง", "error");
      return;
    }

    const payload: Partial<WorkOrder> = {
      title: newWOData.title || `ใบงานซ่อมบำรุงประจำเครื่อง ${activeMachine.code}`,
      description: newWOData.description || "ไม่ระบุรายละเอียดเพิ่มเติม",
      machineId: newWOData.machineId || activeMachine.id,
      // Machine.code is null for 3/973 real machines — WorkOrder.machineCode is
      // optional (string | undefined), so a missing code is simply omitted.
      machineCode: newWOData.machineCode ?? activeMachine.code ?? undefined,
      machineName: newWOData.machineName ?? activeMachine.name,
      priority: newWOData.priority || "high",
      // A report states that something is wrong, not that someone is already
      // fixing it. A new work order waits for a technician to pick it up.
      status: newWOData.status || "pending",
      // A work order records only what the form collected. No parts and no
      // repair steps are invented on the user's behalf — an empty plan is a
      // truthful empty plan, and the technician fills it in on the job.
      technicianName: newWOData.technicianName || currentUser.name,
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: defaultDueDate(),
      requestedBy: currentUser.name,
      // assigned_to stores profiles.id (`usr-...`), not a display name — see
      // currentAssigneeKey above. newWOData.assignedTo may already carry a
      // name typed into the form's free-text assignee field (no id lookup
      // exists for it there); fall back to the current user's id, never name.
      assignedTo: newWOData.assignedTo || currentUser.id,
      updatedAt: new Date().toISOString().slice(0, 10),
      estimatedHours: newWOData.estimatedHours,
      requestedParts: newWOData.requestedParts,
      solutionSteps: newWOData.solutionSteps,
      actionPlan: newWOData.actionPlan,
    };

    notifySaving("กำลังบันทึกใบงาน...");
    try {
      const newWorkOrder = await createWorkOrder(payload);
      setWorkOrders((prev) => [newWorkOrder, ...prev]);
      refreshWorkOrderStats();
      setIsCreateWOModalOpen(false);
      dismissSaving();
      notifySaved("บันทึกใบงานสำเร็จ");
      setActiveTab("my_work_orders");
    } catch (err) {
      dismissSaving();
      await notifyFailed("บันทึกใบงานไม่สำเร็จ", toUserMessage(err, "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"));
      throw err;
    }
  };

  const handleAutoCreateWorkOrder = async (prefilled: PrefilledWorkOrderData) => {
    // Same as handleCreateWorkOrderSubmit above — practically unreachable,
    // real runtime check instead of a type assertion.
    if (!currentUser || !activeMachine) {
      showToast("ยังไม่พร้อมสร้างใบงานซ่อม กรุณาลองใหม่อีกครั้ง", "error");
      return;
    }

    // prefilled.machineId comes from a real Machine.id (assistant prefill/alert),
    // never from WorkOrder.machineId — but the fallback to activeMachine already
    // makes a miss harmless (no crash, no undefined machine) either way.
    const targetMachine = machines.find((m) => m.id === prefilled.machineId) || activeMachine;

    // Steps come from the plan the assistant showed and the person confirmed —
    // nothing else. Suggested parts are kept as names only (partsRequested),
    // because the assistant does not know real stock codes.
    const confirmedSteps = (prefilled.actionPlan || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const suggestedPartNames = (prefilled.suggestedParts || [])
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const payload: Partial<WorkOrder> = {
      title: prefilled.title || `ใบงานซ่อมด่วน: ${targetMachine.code}`,
      description:
        prefilled.description ||
        `เปิดใบงานจากคำแนะนำของผู้ช่วย MT Center AI สำหรับเครื่อง ${targetMachine.name}`,
      machineId: targetMachine.id,
      // Same as handleCreateWorkOrderSubmit above — machineCode is optional, so
      // a missing Machine.code is omitted rather than coerced to null.
      machineCode: targetMachine.code ?? undefined,
      machineName: targetMachine.name,
      priority: prefilled.priority || "high",
      // The assistant proposes; a person confirms. The person is what we record.
      technicianName: currentUser.name,
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: defaultDueDate(),
      requestedBy: `${currentUser.name} (ยืนยันจากคำแนะนำของผู้ช่วย AI)`,
      // assigned_to stores profiles.id (`usr-...`), not a display name — see
      // currentAssigneeKey above.
      assignedTo: currentUser.id,
      updatedAt: new Date().toISOString().slice(0, 10),
      partsRequested: suggestedPartNames.length > 0 ? suggestedPartNames : undefined,
      actionPlan: confirmedSteps.length > 0 ? confirmedSteps : undefined,
    };

    notifySaving("กำลังบันทึกใบงาน...");
    try {
      const autoWO = await createWorkOrder(payload);
      setWorkOrders((prev) => [autoWO, ...prev]);
      refreshWorkOrderStats();
      dismissSaving();
      notifySaved("บันทึกใบงานสำเร็จ");
      setIsAiDrawerOpen(false); // Close slide-over AI Assistant drawer immediately
      setActiveTab("my_work_orders");
    } catch (err) {
      dismissSaving();
      await notifyFailed("บันทึกใบงานไม่สำเร็จ", toUserMessage(err, "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"));
    }
  };

  // A status change can shift the /stats counts (e.g. review -> completed) —
  // refresh them in the background so KPI tiles/badges that read from
  // workOrderStats don't go stale after an edit. Best-effort: a failure here
  // just means the numbers stay as they were, not a user-facing error.
  const refreshWorkOrderStats = () => {
    getWorkOrderStats()
      .then(setWorkOrderStats)
      .catch(() => {
        /* stale stats are better than a surprise toast for a background refresh */
      });
    if (currentAssigneeKey) {
      getWorkOrderStats({ assignedTo: currentAssigneeKey })
        .then(setMyWorkOrderStats)
        .catch(() => {
          /* stale scoped stats are better than a surprise toast for a background refresh */
        });
    }
  };

  const handleUpdateWorkOrder = async (updatedWO: WorkOrder) => {
    try {
      const saved = await updateWorkOrder(updatedWO.id, updatedWO);
      setWorkOrders((prev) => prev.map((wo) => (wo.id === saved.id ? saved : wo)));
      refreshWorkOrderStats();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      await deleteWorkOrder(id, currentUser?.id);
      setWorkOrders((prev) => prev.filter((wo) => wo.id !== id));
      refreshWorkOrderStats();
    } catch (err) {
      throw err;
    }
  };

  const handleApproveWorkOrder = async (woId: string) => {
    try {
      const approved = await approveWorkOrder(woId, undefined, currentUser?.id);
      setWorkOrders((prev) => prev.map((wo) => (wo.id === approved.id ? approved : wo)));
      refreshWorkOrderStats();
    } catch (err) {
      throw err;
    }
  };

  // Compute pending badges count from /api/work-orders/stats (byStatus) —
  // `workOrders` is now a smaller page (see the data-loading effect above)
  // and would silently under-count once the real table exceeds that page.
  const pendingBadges: Record<string, number> = {
    // Scoped to the current user (myWorkOrderStats), not the factory-wide
    // workOrderStats, so this badge matches what MyWorkOrdersView actually
    // lists (?assignedTo=currentAssigneeKey).
    my_work_orders: myWorkOrderStats
      ? (myWorkOrderStats.byStatus?.in_progress ?? 0) + (myWorkOrderStats.byStatus?.pending ?? 0)
      : workOrders.filter(
          (wo) =>
            wo.assignedTo === currentAssigneeKey &&
            (wo.status === "in_progress" || wo.status === "pending")
        ).length,
    review: workOrderStats?.byStatus?.review ?? workOrders.filter((wo) => wo.status === "review").length,
  };

  // Authoritative page names. The TopBar renders these as the page's only H1 —
  // views must not repeat their own heading, or a page ends up with two names.
  const PAGE_TITLES: Record<string, string> = {
    scan: "หน้าหลักช่างซ่อมบำรุง",
    create_work_order: "แจ้งงานซ่อมบำรุง",
    chat: "ผู้ช่วย MT Center AI",
    my_work_orders: "ใบงานของฉัน",
    parts: "คลังอะไหล่โรงงาน",
    manuals: "คู่มือเครื่องจักร",
    review: "ใบงานรอตรวจสอบอนุมัติ",
    upload_manual: "อัปโหลดคู่มือเครื่องจักร",
    knowledge_base: "คลังความรู้และวิธีแก้ไขปัญหา",
    knowledge_review: "รีวิวใบงานเพื่อเก็บเป็นความรู้",
    all_work_orders: "ใบงานซ่อมบำรุงทั้งหมด",
    dashboard: "ภาพรวมการซ่อมบำรุงโรงงาน",
    reports: "รายงานสรุปการซ่อมบำรุงประจำเดือน",
    parts_admin: "จัดการคลังอะไหล่",
    machine_admin: "จัดการเครื่องจักร",
  };

  const getPageTitle = (tabId: string) => PAGE_TITLES[tabId] ?? "MT Center";

  // Deduplicated, sorted list of machine models for the upload form's dropdown.
  // Machine.model is null for every one of the 973 real machines — filter those
  // out (a type guard, not just `.filter(Boolean)`, so the result is genuinely
  // `string[]`) rather than surface a dropdown option list containing null. An
  // empty list is the truthful result today, not a bug.
  const machineModels = useMemo(
    () =>
      Array.from(new Set(machines.map((m) => m.model))).filter(
        (model): model is string => model != null
      ).sort(),
    [machines]
  );

  // ManualsView ดึงคู่มือของตัวเอง (server-side pagination/search) จึงไม่ต้องรีเฟรช
  // รายการคู่มือระดับ App อีกต่อไป — แค่แจ้งผลด้วย toast เท่านั้น
  const handleManualUploaded = (manual: ManualDoc) => {
    showToast(`อัปโหลดคู่มือ "${truncateText(manual.title)}" เรียบร้อยแล้ว`);
  };

  // A create/update/delete/stock-adjust can shift the /stats numbers (total,
  // low-stock count, inventory value...) — refresh in the background so the
  // KPI tiles that read from sparePartStats don't go stale. Best-effort, same
  // as refreshWorkOrderStats above.
  const refreshSparePartStats = () => {
    getSparePartStats()
      .then(setSparePartStats)
      .catch(() => {
        /* stale stats are better than a surprise toast for a background refresh */
      });
  };

  const handleSparePartCreated = (part: SparePart) => {
    setSpareParts((prev) => [part, ...prev]);
    refreshSparePartStats();
    showToast(`เพิ่มอะไหล่ ${part.code} เข้าคลังแล้ว`);
  };

  const handleSparePartUpdated = (part: SparePart) => {
    setSpareParts((prev) => prev.map((p) => (p.id === part.id ? part : p)));
    refreshSparePartStats();
    showToast(`อัปเดตข้อมูลอะไหล่ ${part.code} แล้ว`);
  };

  const handleSparePartDeleted = (id: string) => {
    setSpareParts((prev) => prev.filter((p) => p.id !== id));
    refreshSparePartStats();
    showToast(`ลบอะไหล่ออกจากคลังแล้ว`);
  };

  // เครื่องจักรถูกเพิ่ม/แก้ไข/ลบ อาจทำให้ตัวเลขใน /machines/stats (ยอดรวม,
  // สัดส่วนตามสถานะ) เปลี่ยนไป — รีเฟรชเบื้องหลังเพื่อไม่ให้ KPI บนแดชบอร์ด
  // ค้างข้อมูลเก่า เช่นเดียวกับ refreshSparePartStats ด้านบน
  const refreshMachineStats = () => {
    getMachineStats()
      .then(setMachineStats)
      .catch(() => {
        /* stale stats are better than a surprise toast for a background refresh */
      });
  };

  const handleMachineCreated = (machine: Machine) => {
    setMachines((prev) => [...prev, machine]);
    refreshMachineStats();
    showToast("เพิ่มเครื่องจักรสำเร็จ");
  };

  const handleMachineUpdated = (machine: Machine) => {
    setMachines((prev) => prev.map((m) => (m.id === machine.id ? machine : m)));
    if (activeMachine?.id === machine.id) setActiveMachine(machine);
    refreshMachineStats();
    showToast("แก้ไขข้อมูลเครื่องจักรสำเร็จ");
  };

  const handleMachineDeleted = (machineId: string) => {
    const remaining = machines.filter((m) => m.id !== machineId);
    setMachines(remaining);
    // ถ้าเครื่องจักรที่ถูกลบคือเครื่องจักรที่กำลังเลือกอยู่ ให้เปลี่ยนไปเครื่องแรกที่เหลือ
    // (หรือ null ถ้าไม่เหลือเครื่องจักรใดเลย) เพื่อไม่ให้แอปยังคงชี้ไปที่เครื่องจักรที่ถูกลบไปแล้ว
    if (activeMachine?.id === machineId) {
      setActiveMachine(remaining[0] ?? null);
    }
    refreshMachineStats();
    showToast("ลบเครื่องจักรสำเร็จ");
  };

  // --- Auth gate -----------------------------------------------------------
  // Identity now comes entirely from AuthContext: no signed-in user -> only
  // the login screen renders; signed in but must change the (default =
  // employee id) password -> only that screen renders, blocking the rest of
  // the app until it's done.
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-parchment">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-ink-faint">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  if (mustChangePassword) {
    return <ChangePasswordScreen />;
  }

  // --- Loading / error gate ---------------------------------------------
  // The rest of the app assumes a signed-in profile and at least one machine
  // to show. Rather than fake either with mock data, show a real loading
  // screen while the initial fetch is in flight and a real, actionable error
  // screen if it fails — never a silent fallback to fixture data.
  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center bg-parchment px-4">
        <div className="max-w-md w-full bg-white rounded-[18px] border border-hairline p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-base font-semibold text-ink">ไม่สามารถโหลดข้อมูลได้</h1>
          <p className="text-sm text-ink-faint">{loadError}</p>
          <button
            onClick={() => setReloadToken((n) => n + 1)}
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-parchment">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-ink-faint">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-ink font-sans antialiased overflow-hidden">
      {/* 1. PERSISTENT SIDEBAR */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
        pendingBadges={pendingBadges}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onLogout={logout}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-parchment">
        {/* Top Header Bar — TopBar ต้องมี activeMachine จริงเสมอ (ใช้ .code/.name/.status
            แสดงชิปเครื่องจักรที่กำลังตรวจสอบ) จึงแสดงแถบสำรองแทนเมื่อยังไม่มีเครื่องจักรในระบบ */}
        {activeMachine ? (
          <TopBar
            pageTitle={getPageTitle(activeTab)}
            activeMachine={activeMachine}
            allMachines={machines}
            onSelectMachine={(m) => setActiveMachine(m)}
            onOpenMobileSidebar={() => setIsMobileDrawerOpen(true)}
            workOrders={workOrders}
            onNavigate={handleNotificationNavigate}
          />
        ) : (
          <header className="h-14 bg-parchment/80 backdrop-blur-xl border-b border-hairline flex items-center justify-between px-2.5 sm:px-4 md:px-6 shrink-0 sticky top-0 z-30 select-none w-full max-w-full">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden min-w-11 min-h-11 -ml-1.5 flex items-center justify-center rounded-lg text-ink-muted hover:bg-primary/5 active:scale-95 transition-all cursor-pointer shrink-0"
                title="เปิดเมนูด้านข้าง"
                id="mobile-hamburger-btn"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-ink tracking-[-0.01em] truncate">
                {getPageTitle(activeTab)}
              </h1>
            </div>
            <span className="text-xs text-ink-faint shrink-0">ไม่พบเครื่องจักรในระบบ</span>
          </header>
        )}

        {/* Scrollable Content Views Container */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Technician / Create Work Order Views */}
          {/* ScanMachineView ต้องมีเครื่องจักรจริงเสมอ (แสดงรายละเอียด/สถานะของเครื่องเดียว)
              จึงแสดงข้อความว่างสำรองแทนเมื่อยังไม่มีเครื่องจักรในระบบ */}
          {activeTab === "scan" && (activeMachine ? (
            <ScanMachineView
              machines={machines}
              activeMachine={activeMachine}
              onSelectMachine={(machine) => setActiveMachine(machine)}
              onAskAI={handleAskAIWithPrompt}
              onViewWorkOrders={() => setActiveTab("my_work_orders")}
              onViewSpareParts={() => setActiveTab("parts")}
              onOpenCreateWorkOrder={handleOpenCreateWorkOrderModal}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-ink-faint">
              ไม่พบเครื่องจักรในระบบ
            </div>
          ))}

          {/* CreateWorkOrderView ต้องมีเครื่องจักรจริงเสมอเช่นกัน (ใบงานต้องผูกกับเครื่องจักร) */}
          {activeTab === "create_work_order" && (activeMachine ? (
            <CreateWorkOrderView
              machines={machines}
              activeMachine={activeMachine}
              currentUser={currentUser}
              spareParts={spareParts}
              technicians={technicians}
              onCreateWorkOrder={async (newWO) => {
                notifySaving("กำลังบันทึกใบงาน...");
                try {
                  const payload: Partial<WorkOrder> = {
                    ...newWO,
                    title: newWO.title?.trim() || `ใบงานซ่อมบำรุงประจำเครื่อง ${newWO.machineCode ?? activeMachine.code}`,
                    description: newWO.description?.trim() || "ไม่ระบุรายละเอียดเพิ่มเติม",
                  };
                  const created = await createWorkOrder(payload);
                  setWorkOrders((prev) => [created, ...prev]);
                  dismissSaving();
                  notifySaved("บันทึกใบงานสำเร็จ");
                  setActiveTab("my_work_orders");
                } catch (err) {
                  dismissSaving();
                  await notifyFailed("บันทึกใบงานไม่สำเร็จ", toUserMessage(err, "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์"));
                  throw err;
                }
              }}
              onAskAI={handleAskAIWithPrompt}
              onNavigateToMyOrders={() => setActiveTab("my_work_orders")}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-ink-faint">
              ไม่พบเครื่องจักรในระบบ
            </div>
          ))}

          {/* AIChatView รองรับ activeMachine เป็น null อยู่แล้ว (ถามภาพรวมทั้งฟลีตได้แม้ไม่มี
              เครื่องจักรเลือกอยู่) — ไม่ guard ตรงนี้เหมือนแท็บอื่น */}
          {activeTab === "chat" && (
            <AIChatView
              activeMachine={activeMachine}
              machines={machines}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              initialPrompt={chatInitialPrompt}
              onAutoCreateWorkOrder={handleAutoCreateWorkOrder}
              onOpenCreateWorkOrderModal={handleOpenCreateWorkOrderModal}
            />
          )}

          {activeTab === "my_work_orders" && (
            // Fetches only this technician's own work orders directly from the
            // server (?assignedTo=) now — see the component.
            <MyWorkOrdersView
              currentUserRole={currentUser.role}
              currentAssigneeKey={currentAssigneeKey}
              currentUserName={currentUser.name}
              activeMachine={activeMachine ?? undefined}
              machines={machines}
              onSelectMachine={(m) => setActiveMachine(m)}
              myWorkOrderStats={myWorkOrderStats}
              onUpdateWorkOrder={handleUpdateWorkOrder}
              onDeleteWorkOrder={handleDeleteWorkOrder}
              onAskAI={handleAskAIWithPrompt}
              spareParts={spareParts}
              technicians={technicians}
              currentUser={currentUser}
              onStockChanged={() => setReloadToken((t) => t + 1)}
            />
          )}

          {activeTab === "parts" && (
            // SparePartsView fetches/searches/paginates its own data straight from
            // the API now (8,588 rows won't fit in the shared `spareParts` slice
            // below, which WorkOrderForm/CreateWorkOrderModal still use) — see the
            // component for why.
            <SparePartsView activeMachine={activeMachine ?? undefined} onAskAI={handleAskAIWithPrompt} />
          )}

          {activeTab === "manuals" && (
            <ManualsView
              activeMachine={activeMachine ?? undefined}
              onAskAI={handleAskAIWithPrompt}
              // เฉพาะวิศวกร/หัวหน้างานที่มีสิทธิ์อัปโหลดคู่มือ (มีเมนู "อัปโหลดคู่มือ" ในแถบด้านข้าง) เท่านั้นที่เห็น
              // ปุ่มพาไปหน้าอัปโหลด — ช่างเทคนิคยังไม่มีเมนูนี้ในแถบด้านข้าง จึงไม่ควรมีทางเดียวที่ไม่มีทางกลับ
              onGoToUpload={
                currentRole === "engineer" || currentRole === "supervisor"
                  ? () => setActiveTab("upload_manual")
                  : undefined
              }
              machineModels={machineModels}
              // แก้ไข/ลบคู่มือเป็นการกระทำทำลาย (destructive) — เฉพาะวิศวกรและหัวหน้างานเท่านั้นที่มีสิทธิ์
              // ช่างเทคนิคใช้คู่มือร่วมกันทั้งทีม จึงไม่ควรแก้ไขหรือลบคู่มือของทีมได้
              canManage={currentRole === "engineer" || currentRole === "supervisor"}
            />
          )}

          {/* Engineer Views */}
          {activeTab === "review" && (
            // Fetches its own ?status=review page directly now — see the component.
            <PendingReviewView
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onApproveWorkOrder={handleApproveWorkOrder}
              onUpdateWorkOrder={handleUpdateWorkOrder}
              onAskAI={handleAskAIWithPrompt}
              onStockChanged={() => setReloadToken((t) => t + 1)}
            />
          )}

          {activeTab === "upload_manual" && (
            <UploadManualView
              onGoToManuals={() => setActiveTab("manuals")}
              machineModels={machineModels}
              uploadedBy={currentUser.name}
              onUploaded={handleManualUploaded}
            />
          )}

          {activeTab === "knowledge_review" && (
            <KnowledgeReviewView currentUserName={currentUser?.name} />
          )}

          {activeTab === "knowledge_base" && (
            <div className="p-4 md:p-6 space-y-6">
              <KnowledgeOverviewPanel />
            </div>
          )}

          {activeTab === "knowledge_base" && (
            <KnowledgeBaseView articles={kbArticles} onAskAI={handleAskAIWithPrompt} />
          )}

          {/* Shared / Supervisor Views */}
          {activeTab === "all_work_orders" && (
            // Same reasoning as SparePartsView/SparePartsAdminView — 8,589 work
            // orders don't fit in the shared `workOrders` slice below, so this
            // view fetches/filters/paginates its own copy straight from the API.
            <AllWorkOrdersView
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onUpdateWorkOrder={handleUpdateWorkOrder}
              onApproveWorkOrder={handleApproveWorkOrder}
              onAskAI={handleAskAIWithPrompt}
              onStockChanged={() => setReloadToken((t) => t + 1)}
            />
          )}

          {activeTab === "dashboard" && (
            <SupervisorDashboardView
              machines={machines}
              workOrders={workOrders}
              machineStats={machineStats}
              workOrderStats={workOrderStats}
              onAskAI={handleAskAIWithPrompt}
              onDeleteWorkOrder={handleDeleteWorkOrder}
              currentUser={currentUser}
            />
          )}

          {activeTab === "reports" && (
            <SupervisorReportsView machines={machines} />
          )}

          {activeTab === "parts_admin" && currentRole === "supervisor" && (
            // Same reasoning as SparePartsView above — this view now fetches its
            // own search/filter/paginated slice directly.
            <SparePartsAdminView
              stats={sparePartStats}
              actorId={currentUser.id}
              onCreated={handleSparePartCreated}
              onUpdated={handleSparePartUpdated}
              onDeleted={handleSparePartDeleted}
            />
          )}

          {activeTab === "machine_admin" && (currentRole === "supervisor" || currentRole === "engineer") && (
            // MachineAdminView ดึงและแบ่งหน้ารายการเครื่องจักรของตัวเองจาก API โดยตรง
            <MachineAdminView
              actorId={currentUser.id}
              onCreated={handleMachineCreated}
              onUpdated={handleMachineUpdated}
              onDeleted={handleMachineDeleted}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Work Order Creation Modal */}
      <CreateWorkOrderModal
        isOpen={isCreateWOModalOpen}
        onClose={() => setIsCreateWOModalOpen(false)}
        machines={machines}
        activeMachine={activeMachine ?? undefined}
        spareParts={spareParts}
        currentUser={currentUser}
        technicians={technicians}
        prefilledData={prefilledWOData}
        onCreateWorkOrder={handleCreateWorkOrderSubmit}
      />

      {/* Slide-Over AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        activeMachine={activeMachine}
        currentUserRole={currentUser.role}
        currentUserName={currentUser.name}
        initialPrompt={aiDrawerPrompt}
        onOpenFullChatPage={() => {
          setIsAiDrawerOpen(false);
          setActiveTab("chat");
        }}
        onAutoCreateWorkOrder={handleAutoCreateWorkOrder}
        onOpenCreateWorkOrderModal={handleOpenCreateWorkOrderModal}
      />

      {activeTab !== "chat" && (
        <AIAssistantToggleButton
          isOpen={isAiDrawerOpen}
          onToggle={() => setIsAiDrawerOpen((prev) => !prev)}
        />
      )}
    </div>
  );
}
