"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";
import { LogOut, User } from "lucide-react";

interface UserNavProps {
  user: { name: string; email: string; role: string } | null;
}

export default function UserNav({ user }: UserNavProps) {
  const { logout } = useAuthContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="font-medium text-foreground">{user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground">{user?.role || ""}</p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-border bg-background shadow-lg animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
