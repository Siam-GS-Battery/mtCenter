import React, { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toUserMessage } from "../services/apiService";
import { notifyFailed } from "../lib/swal";

/** Trailing eye/eye-off toggle shared by the three password fields below.
 *  Each caller owns its own `visible` state so the three fields never share
 *  a single show/hide flag. */
const PasswordVisibilityToggle: React.FC<{
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ visible, onToggle, disabled }) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
    aria-pressed={visible}
    tabIndex={0}
    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-ink-faint hover:text-ink-muted hover:bg-hairline/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
  >
    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  </button>
);

export const ChangePasswordScreen: React.FC = () => {
  const { changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!currentPassword) {
      const msg = "กรุณากรอกรหัสผ่านปัจจุบัน";
      setError(msg);
      notifyFailed(msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร";
      setError(msg);
      notifyFailed(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน";
      setError(msg);
      notifyFailed(msg);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      const msg = toUserMessage(err, "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-ink tracking-[-0.02em]">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-sm text-ink-faint text-center">
            เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านใหม่ก่อนเข้าใช้งานระบบ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-[13px] font-semibold text-ink-muted block">
              รหัสผ่านปัจจุบัน
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 pl-3.5 pr-10 rounded-[11px] border border-hairline bg-parchment text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60"
              />
              <PasswordVisibilityToggle
                visible={showCurrentPassword}
                onToggle={() => setShowCurrentPassword((v) => !v)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-[13px] font-semibold text-ink-muted block">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 pl-3.5 pr-10 rounded-[11px] border border-hairline bg-parchment text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60"
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
              <PasswordVisibilityToggle
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((v) => !v)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[13px] font-semibold text-ink-muted block">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-11 pl-3.5 pr-10 rounded-[11px] border border-hairline bg-parchment text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60"
              />
              <PasswordVisibilityToggle
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
                disabled={isSubmitting}
              />
            </div>
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
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-[12px] text-ink-faint hover:text-ink-muted cursor-pointer transition-colors"
          >
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
};
