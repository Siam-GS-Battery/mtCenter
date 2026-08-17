import React from "react";
import {
  Zap,
  QrCode,
  Bot,
  FileText,
  FilePlus,
  Package,
  BookOpen,
  ClipboardCheck,
  Upload,
  BookMarked,
  BarChart3,
  FileBarChart,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Factory,
} from "lucide-react";
import { UserProfile, UserRole } from "../types";

const ROLE_LABELS: Record<UserRole, string> = {
  technician: "ช่างเทคนิค",
  engineer: "วิศวกร",
  supervisor: "หัวหน้างาน",
};

interface SidebarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  onRoleChange: (newRole: UserRole) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  pendingBadges: Record<string, number>;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onRoleChange,
  isCollapsed,
  setIsCollapsed,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  pendingBadges,
  onOpenSettings,
  onOpenHelp,
}) => {
  // Define nav items for each role
  const getRoleNavItems = (role: UserRole) => {
    switch (role) {
      case "technician":
        return [
          { id: "scan", label: "หน้าหลัก", icon: QrCode, badgeKey: "" },
          { id: "create_work_order", label: "แจ้งงานซ่อม", icon: FilePlus, badgeKey: "" },
          { id: "chat", label: "ผู้ช่วย AI", icon: Bot, badgeKey: "" },
          { id: "my_work_orders", label: "ใบงานของฉัน", icon: FileText, badgeKey: "my_work_orders" },
          { id: "parts", label: "อะไหล่", icon: Package, badgeKey: "" },
          { id: "manuals", label: "คู่มือ", icon: BookOpen, badgeKey: "" },
        ];
      case "engineer":
        return [
          { id: "review", label: "รอตรวจสอบ", icon: ClipboardCheck, badgeKey: "review" },
          { id: "create_work_order", label: "แจ้งงานซ่อม", icon: FilePlus, badgeKey: "" },
          { id: "chat", label: "ผู้ช่วย AI", icon: Bot, badgeKey: "" },
          { id: "manuals", label: "คู่มือ", icon: BookOpen, badgeKey: "" },
          { id: "upload_manual", label: "อัปโหลดคู่มือ", icon: Upload, badgeKey: "" },
          { id: "knowledge_base", label: "คลังความรู้", icon: BookMarked, badgeKey: "" },
          { id: "all_work_orders", label: "ใบงานทั้งหมด", icon: FileText, badgeKey: "" },
          { id: "machine_admin", label: "จัดการเครื่องจักร", icon: Factory, badgeKey: "" },
        ];
      case "supervisor":
        return [
          { id: "dashboard", label: "ภาพรวมโรงงาน", icon: BarChart3, badgeKey: "" },
          { id: "create_work_order", label: "แจ้งงานซ่อม", icon: FilePlus, badgeKey: "" },
          { id: "parts_admin", label: "คลังอะไหล่", icon: Package, badgeKey: "" },
          { id: "machine_admin", label: "จัดการเครื่องจักร", icon: Factory, badgeKey: "" },
          { id: "chat", label: "ผู้ช่วย AI", icon: Bot, badgeKey: "" },
          { id: "manuals", label: "คู่มือ", icon: BookOpen, badgeKey: "" },
          { id: "all_work_orders", label: "ใบงานทั้งหมด", icon: FileText, badgeKey: "" },
          { id: "reports", label: "รายงาน", icon: FileBarChart, badgeKey: "" },
        ];
      default:
        return [];
    }
  };

  const primaryNavItems = getRoleNavItems(currentUser.role);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-label="ปิดเมนู"
          id="mobile-sidebar-overlay"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          bg-nav-black border-r border-white/10
          flex flex-col h-full transition-all duration-300 ease-in-out select-none
          ${isCollapsed ? "w-[72px]" : "w-[260px]"}
          ${
            isMobileDrawerOpen
              ? "translate-x-0 w-[260px]"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* 1. Brand block — bolt icon + "MT Center" */}
        <div className="h-14 flex items-center px-5 border-b border-white/10 shrink-0 bg-nav-black">
          <div className="flex items-center gap-2 overflow-hidden">
            <Zap className="w-5 h-5 text-white shrink-0 fill-white" />
            {(!isCollapsed || isMobileDrawerOpen) && (
              <span className="text-[15px] font-semibold text-white tracking-tight whitespace-nowrap">
                MT Center
              </span>
            )}
          </div>
        </div>

        {/* 2. User card */}
        <div className="p-4 border-b border-white/10 bg-nav-black shrink-0">
          <div className="flex items-center space-x-3">
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white font-semibold text-sm shrink-0">
              {currentUser.initials}
            </div>

            {(!isCollapsed || isMobileDrawerOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold text-white truncate">
                  {currentUser.name}
                </span>
                <span className="text-xs text-white/70 truncate">
                  {ROLE_LABELS[currentUser.role]} · รหัส {currentUser.employeeId}
                </span>
              </div>
            )}
          </div>

          {/* Quick Role Toggle Bar — development preview only */}
          {import.meta.env.DEV && (!isCollapsed || isMobileDrawerOpen) && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-white/50">
                <UserCheck className="w-3 h-3 text-primary-on-dark" /> บทบาท:
              </span>
              <div className="flex gap-1 bg-white/10 p-0.5 rounded-full border-0">
                {(["technician", "engineer", "supervisor"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    aria-pressed={currentUser.role === r}
                    className={`px-3 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      currentUser.role === r
                        ? "bg-white text-ink"
                        : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {r === "technician" ? "ช่าง" : r === "engineer" ? "วิศวกร" : "หัวหน้า"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Primary Nav */}
        <nav className="mt-2 flex-1 px-3 space-y-1 overflow-y-auto">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount = item.badgeKey ? pendingBadges[item.badgeKey] || 0 : 0;

            const isIconOnly = isCollapsed && !isMobileDrawerOpen;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isIconOnly ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  badgeCount > 0
                    ? `${item.label} (ค้างอยู่ ${badgeCount} รายการ)`
                    : item.label
                }
                className={`
                  relative w-full flex items-center justify-between px-3 min-h-11 rounded-lg text-[13px] transition-all cursor-pointer group
                  ${
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }
                  ${isIconOnly ? "justify-center px-0" : ""}
                `}
              >
                <div className="flex items-center">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${isIconOnly ? "" : "mr-3"} ${
                      isActive ? "text-white" : "text-white/50 group-hover:text-white"
                    }`}
                  />
                  {!isIconOnly && (
                    <span className="text-[13px] truncate">{item.label}</span>
                  )}
                </div>

                {/* Badge if pending count exists — ย่อเป็นจุดเมื่อเมนูหุบ */}
                {badgeCount > 0 && (
                  <span
                    aria-hidden="true"
                    className={
                      isIconOnly
                        ? "absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-primary"
                        : "bg-primary text-white text-xs px-2 py-0.5 rounded-full font-semibold"
                    }
                  >
                    {isIconOnly ? "" : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 4. Secondary Nav & Collapse */}
        <div className="mt-auto border-t border-white/10 px-3 py-4 space-y-1 shrink-0">
          <button
            onClick={onOpenSettings}
            aria-label="ตั้งค่า"
            className={`
              w-full flex items-center px-3 min-h-11 text-white/60 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer transition-colors
              ${isCollapsed && !isMobileDrawerOpen ? "justify-center px-0" : ""}
            `}
            title={isCollapsed && !isMobileDrawerOpen ? "ตั้งค่า" : undefined}
          >
            <Settings
              className={`w-[18px] h-[18px] shrink-0 text-white/50 ${
                isCollapsed && !isMobileDrawerOpen ? "" : "mr-3"
              }`}
            />
            {(!isCollapsed || isMobileDrawerOpen) && (
              <span className="text-[13px]">ตั้งค่า</span>
            )}
          </button>

          <button
            onClick={onOpenHelp}
            aria-label="ช่วยเหลือ"
            className={`
              w-full flex items-center px-3 min-h-11 text-white/60 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer transition-colors
              ${isCollapsed && !isMobileDrawerOpen ? "justify-center px-0" : ""}
            `}
            title={isCollapsed && !isMobileDrawerOpen ? "ช่วยเหลือ" : undefined}
          >
            <HelpCircle
              className={`w-[18px] h-[18px] shrink-0 text-white/50 ${
                isCollapsed && !isMobileDrawerOpen ? "" : "mr-3"
              }`}
            />
            {(!isCollapsed || isMobileDrawerOpen) && (
              <span className="text-[13px]">ช่วยเหลือ</span>
            )}
          </button>

          {/* ไม่มีเมนู "ออกจากระบบ" เพราะแอปนี้ยังไม่มีระบบเข้าสู่ระบบหรือ session ให้ล้าง */}

          <div className="pt-2 justify-center text-white/50 hidden md:flex">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-white/50 hover:text-white"
              aria-label={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
              title={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
