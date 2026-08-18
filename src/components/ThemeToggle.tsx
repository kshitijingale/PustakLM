"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Migrate legacy theme key so existing users keep their preference.
    const saved =
      (localStorage.getItem("learnforge-theme") as "dark" | "light") ||
      (localStorage.getItem("pustaklm-theme") as "dark" | "light") ||
      "dark";
    setTheme(saved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(next);
    localStorage.setItem("learnforge-theme", next);
    setTheme(next);
  }

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={cn(
          "relative h-9 w-16 rounded-full border border-border bg-surface-elevated",
          className
        )}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "relative h-9 w-16 rounded-full border border-border bg-surface-elevated transition-colors hover:bg-surface-highlight",
        className
      )}
    >
      <motion.span
        initial={false}
        animate={{ x: theme === "dark" ? 4 : 34 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-sm"
      >
        {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </motion.span>
    </button>
  );
}
