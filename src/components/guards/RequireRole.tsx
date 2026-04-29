"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { ROLE_HIERARCHY } from "@/lib/constants";

interface RequireRoleProps {
  role: "superadmin" | "manager" | "viewer";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function RequireRole({ role, fallback = null, children }: RequireRoleProps) {
  const { role: userRole } = useAuthContext();
  const requiredLevel = ROLE_HIERARCHY[role];
  const userLevel = userRole ? ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0 : 0;

  if (userLevel < requiredLevel) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
