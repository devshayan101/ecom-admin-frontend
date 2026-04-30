import { useAuthContext } from "@/providers/AuthProvider";
import UserNav from "@/components/layout/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthContext();

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}
