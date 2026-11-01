"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle visual theme"
      className="p-2 rounded-xl transition-all duration-200 border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-cyan-400 hover:border-blue-400 dark:hover:border-cyan-500 shadow-sm"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
