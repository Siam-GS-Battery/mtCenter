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

// Token lives in localStorage (survives browser close) when the user checked
// "จดจำการเข้าใช้งาน", or in sessionStorage (cleared when the browser closes)
// otherwise. These helpers keep that choice in one place.
type StoredToken = { token: string; rememberMe: boolean } | null;

function readStoredToken(): StoredToken {
  const local = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (local) {
    return { token: local, rememberMe: true };
  }
  const session = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (session) {
    return { token: session, rememberMe: false };
  }
  return null;
}

function storeToken(token: string, rememberMe: boolean): void {
  if (rememberMe) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface AuthContextValue {
  token: string | null;
  user: UserProfile | null;
  mustChangePassword: boolean;
  isLoading: boolean;
  login: (employeeId: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Tracks the user's current "remember me" choice so changePassword() can
  // re-store the refreshed token in the same place without silently
  // downgrading a remembered session to a session-only one.
  const rememberMeRef = React.useRef(false);

  const logout = useCallback(() => {
    clearStoredToken();
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
    const stored = readStoredToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    rememberMeRef.current = stored.rememberMe;
    setAuthToken(stored.token);
    setToken(stored.token);
    getMe()
      .then((res) => {
        setUser(res.user);
        setMustChangePassword(res.mustChangePassword);
      })
      .catch(() => {
        clearStoredToken();
        setAuthToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (employeeId: string, password: string, rememberMe = false) => {
    const res = await apiLogin(employeeId, password, rememberMe);
    rememberMeRef.current = rememberMe;
    storeToken(res.token, rememberMe);
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
    storeToken(res.token, rememberMeRef.current);
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
