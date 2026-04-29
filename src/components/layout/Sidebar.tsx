"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROLE_HIERARCHY } from "@/lib/constants";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  superadminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/products", label: "Products", icon: <Package className="h-5 w-5" /> },
  { href: "/categories", label: "Categories", icon: <Tags className="h-5 w-5" /> },
  { href: "/inventory", label: "Inventory", icon: <Boxes className="h-5 w-5" /> },
  { href: "/orders", label: "Orders", icon: <ShoppingCart className="h-5 w-5" /> },
  { href: "/customers", label: "Customers", icon: <Users className="h-5 w-5" /> },
  { href: "/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
  { href: "/audit-logs", label: "Audit Logs", icon: <FileText className="h-5 w-5" /> },
  { href: "/users", label: "Users", icon: <UserCog className="h-5 w-5" />, superadminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role, hasPermission } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col border-r border-gray-200 bg-white transition-width duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        {!collapsed && <span className="text-lg font-bold text-gray-900">Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          if (item.superadminOnly && role !== "superadmin") return null;
          if (item.permission && !hasPermission(item.permission)) return null;

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}
                ${collapsed ? "justify-center" : ""}`}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
