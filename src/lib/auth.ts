import Cookies from "js-cookie";
import { AuthPayload } from "./types";

const TOKEN_KEY = "access_token";

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // matches refresh token / session duration
      secure: window.location.protocol === "https:",
      sameSite: "strict"
    });
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY) || Cookies.get(TOKEN_KEY) || null;
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove(TOKEN_KEY);
  }
}

export function parseJwt(payload: string): AuthPayload | null {
  try {
    const base64 = payload.split(".")[1];
    const json = atob(base64);
    return JSON.parse(json) as AuthPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload) return true;
  const exp = (payload as any).exp;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

export function hasPermission(
  userRole: string,
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (userRole === "superadmin") return true;
  return userPermissions.includes(requiredPermission);
}

export function getUserPermissions(role: string): string[] {
  if (role === "superadmin") return ["*"];
  if (role === "manager") {
    return [
      "products:read", "products:write",
      "categories:read", "categories:write",
      "inventory:read", "inventory:write",
      "orders:read", "orders:write",
      "customers:read", "customers:write",
      "dashboard:read", "reports:read",
      "audit_logs:read",
    ];
  }
  return [
    "products:read", "categories:read", "inventory:read",
    "orders:read", "customers:read", "dashboard:read",
    "reports:read", "audit_logs:read",
  ];
}
