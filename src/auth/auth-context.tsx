import * as React from "react";

import { login as loginApi, me } from "@/api/paras";
import type { LoginRequest, MeResponse } from "@/api/types";

const TOKEN_STORAGE_KEY = "paras_token";
const USER_STORAGE_KEY = "paras_user";

type AuthContextValue = {
  token: string | null;
  user: MeResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): MeResponse | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MeResponse;
    if (!parsed || !parsed.userId || !parsed.nrp || !Array.isArray(parsed.roles)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<MeResponse | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const [loadingMe, setLoadingMe] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) setToken(storedToken);
      setUser(readStoredUser());
    } finally {
      setHydrated(true);
    }
  }, []);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);

    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const login = React.useCallback(async (payload: LoginRequest) => {
    const res = await loginApi(payload);
    const nextUser: MeResponse = {
      userId: res.userId,
      nrp: res.nrp,
      fullName: res.fullName,
      roles: res.roles ?? [],
    };

    setToken(res.accessToken);
    setUser(nextUser);

    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // ignore storage errors
    }
  }, []);

  React.useEffect(() => {
    // Hindari call /auth/me ketika user profile sudah ada (setelah login sukses).
    // Ini mencegah auto-logout jika endpoint /auth/me backend sedang bermasalah.
    if (!hydrated || !token || user) return;

    let cancelled = false;
    setLoadingMe(true);

    me()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {
        if (cancelled) return;
        logout();
      })
      .finally(() => {
        if (!cancelled) setLoadingMe(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, user, logout]);

  const hasRole = React.useCallback(
    (role: string) => {
      if (!user) return false;
      return user.roles.some((r) => r.toLowerCase() === role.toLowerCase());
    },
    [user]
  );

  const isBootstrapping = !hydrated || (!!token && !user && loadingMe);
  const value = React.useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      isAdmin: hasRole("Admin"),
      isBootstrapping,
      login,
      logout,
      hasRole,
    }),
    [token, user, hasRole, isBootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  }
  return ctx;
}
