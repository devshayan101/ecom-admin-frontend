"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, parseJwt, getUserPermissions } from "@/lib/auth";
import { AdminUser } from "@/lib/types";

interface AuthContextType {
  user: AdminUser | null;
  role: string | null;
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
