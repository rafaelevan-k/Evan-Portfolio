"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-9 h-9 rounded-full", className)} />;
  }

  return (
    <button
      onClick={() => {
        const nextTheme = theme === "light" ? "dark" : "light";
        if (!document.startViewTransition) {
          setTheme(nextTheme);
        } else {
          document.startViewTransition(() => {
            flushSync(() => {
              setTheme(nextTheme);
            });
          });
        }
      }}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-surface-soft",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-ink" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-ink" />
    </button>
  );
}
