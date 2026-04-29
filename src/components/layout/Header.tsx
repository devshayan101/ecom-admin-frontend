"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import UserNav from "@/components/layout/UserNav";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthContext();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <UserNav user={user} />
    </header>
  );
}
