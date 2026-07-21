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
  Settings,
  Percent,
  MessageSquare,
  Truck,
  CreditCard,
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
  { href: "/reviews", label: "Reviews", icon: <MessageSquare className="h-5 w-5" />, permission: "reviews:read" },
  { href: "/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
  { href: "/audit-logs", label: "Audit Logs", icon: <FileText className="h-5 w-5" /> },
  { href: "/users", label: "Users", icon: <UserCog className="h-5 w-5" />, superadminOnly: true },
  { href: "/settings/general", label: "General Settings", icon: <Settings className="h-5 w-5" />, permission: "settings:read" },
  { href: "/settings/taxes", label: "Tax Settings", icon: <Percent className="h-5 w-5" />, permission: "settings:read" },
  { href: "/settings/shipping", label: "Shipping Settings", icon: <Truck className="h-5 w-5" />, permission: "settings:read" },
  { href: "/settings/payments", label: "Payment Settings", icon: <CreditCard className="h-5 w-5" />, permission: "settings:read" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role, hasPermission } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col border-r border-border bg-background transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && <span className="text-lg font-bold text-foreground">Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 hover:bg-accent cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-5 w-5 text-muted-foreground" /> : <ChevronLeft className="h-5 w-5 text-muted-foreground" />}
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
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all
                ${isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"}
                ${collapsed ? "justify-center" : ""}`}
            >
              <span className={`${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
