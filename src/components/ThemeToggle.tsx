"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 h-9 w-9 rounded-md border border-border bg-background" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 h-9 w-9 rounded-md hover:bg-accent border border-border bg-background transition-all flex items-center justify-center cursor-pointer group"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-400 transition-all group-hover:scale-110" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-all group-hover:scale-110" />
      )}
    </button>
  );
}
