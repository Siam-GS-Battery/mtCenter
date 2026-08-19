import React, { useState } from "react";
import { Zap, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toUserMessage } from "../services/apiService";
import { notifyFailed } from "../lib/swal";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!employeeId.trim() || !password) {
      const msg = "กรุณากรอกรหัสพนักงานและรหัสผ่าน";
      setError(msg);
      notifyFailed(msg);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(employeeId.trim(), password, rememberMe);
    } catch (err) {
      const msg = toUserMessage(err, "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setError(msg);
      notifyFailed(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-parchment px-4">
      <div className="max-w-md w-full bg-white rounded-[18px] border border-hairline p-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-nav-black flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-lg font-semibold text-ink tracking-[-0.02em]">MT Center</h1>
          <p className="text-sm text-ink-faint">เข้าสู่ระบบเพื่อใช้งานศูนย์ซ่อมบำรุง</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="employeeId" className="text-[13px] font-semibold text-ink-muted block">
              รหัสพนักงาน
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="employeeId"
                type="text"
                autoComplete="username"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 pl-10 pr-3.5 rounded-[11px] border border-hairline bg-parchment text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60"
                placeholder="เช่น 12345"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[13px] font-semibold text-ink-muted block">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 pl-10 pr-10 rounded-[11px] border border-hairline bg-parchment text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60"
                placeholder="รหัสผ่าน"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isSubmitting}
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                aria-pressed={showPassword}
                tabIndex={0}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-ink-faint hover:text-ink-muted hover:bg-hairline/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 rounded border-hairline text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-[13px] text-ink-muted select-none cursor-pointer">
              จดจำการเข้าใช้งาน 7 วัน
            </label>
          </div>

          {error && (
            <div className="text-[13px] text-rose-600 bg-rose-50 rounded-[11px] px-3.5 py-2.5 border-0">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-11 py-3 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13px] cursor-pointer active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
};
