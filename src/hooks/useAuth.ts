"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiGet } from "@/lib/api-client";
import { setToken, getToken, removeToken, parseJwt, getUserPermissions } from "@/lib/auth";
import { AuthResponse, AdminUser } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiPost<AuthResponse>("/auth/login", { email, password });
      setToken(data.accessToken);
      const payload = parseJwt(data.accessToken);
      if (payload) {
        setRole(payload.role);
        setPermissions(getUserPermissions(payload.role));
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } finally {
      removeToken();
      setUser(null);
      setRole(null);
      setPermissions([]);
      router.push("/login");
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return false;
    }
    try {
      const payload = parseJwt(token);
      if (!payload) {
        removeToken();
        setLoading(false);
        return false;
      }
      setRole(payload.role);
      setPermissions(getUserPermissions(payload.role));
      try {
        const userData = await apiGet<AdminUser>("/users/" + payload.userId);
        setUser(userData);
      } catch {
        // If can't fetch user, still set role
      }
      setLoading(false);
      return true;
    } catch {
      removeToken();
      setLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    role,
    permissions,
    loading,
    isAuthenticated: !!getToken(),
    login,
    logout,
    checkAuth,
    hasPermission: (perm: string) => {
      if (role === "superadmin") return true;
      return permissions.includes(perm);
    },
  };
}
