"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("pustaklm-theme") as "dark" | "light") || "dark";
    setTheme(saved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(next);
    localStorage.setItem("pustaklm-theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative h-8 w-16 rounded-full border border-white/10 bg-white/5 transition-colors"
    >
      <span
        className="absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-saffron-500 text-xs
          transition-all duration-300 ease-out"
        style={{ left: theme === "dark" ? "4px" : "calc(100% - 28px)" }}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
