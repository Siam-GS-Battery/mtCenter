import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { UserProfile } from "../types";
import {
  login as apiLogin,
  getMe,
  changePassword as apiChangePassword,
  setAuthToken,
  setUnauthorizedHandler,
  setPasswordChangeRequiredHandler,
} from "../services/apiService";

const TOKEN_STORAGE_KEY = "mtcenter.token";

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  mustChangePassword: boolean;
  isLoading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
  }, []);

  // Register the global 401 handler once — any request that comes back
  // unauthorized (expired/invalid token) drops the app back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Register the global 403/PASSWORD_CHANGE_REQUIRED handler once — the
  // session is still valid, so this must route to the change-password
  // screen rather than logging out.
  useEffect(() => {
    setPasswordChangeRequiredHandler(() => setMustChangePassword(true));
    return () => setPasswordChangeRequiredHandler(null);
  }, []);

  // Rehydrate from a stored token on mount.
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setAuthToken(stored);
    setToken(stored);
    getMe()
      .then((res) => {
        setUser(res.user);
        setMustChangePassword(res.mustChangePassword);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (employeeId: string, password: string) => {
    const res = await apiLogin(employeeId, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setMustChangePassword(res.mustChangePassword);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const res = await apiChangePassword(currentPassword, newPassword);
    // Changing the password invalidates the token the user was holding
    // (backend derives a `pv` claim from password_updated_at and checks it
    // on every request) — store the fresh token BEFORE clearing the flag,
    // otherwise the next request 401s and logs the user right back out.
    if (!res.token) {
      // Defensive: no usable token in the response — fall back to a clean
      // re-login rather than leaving a half-authenticated session around.
      logout();
      return;
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    setAuthToken(res.token);
    setToken(res.token);
    setMustChangePassword(false);
  }, [logout]);

  const value = useMemo(
    () => ({ token, user, mustChangePassword, isLoading, login, logout, changePassword }),
    [token, user, mustChangePassword, isLoading, login, logout, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
