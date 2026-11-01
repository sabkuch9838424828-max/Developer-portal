"use client";

import { useState, useEffect } from "react";

export function FormattedDate({ date, format = "date" }: { date: string | Date | undefined; format?: "date" | "time" | "year" | "datetime" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !date) return <span>{format === "year" ? "2026" : "—"}</span>;

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return <span>—</span>;

  if (format === "year") {
    return <span>{d.getFullYear()}</span>;
  }
  if (format === "datetime") {
    return <span>{d.toLocaleString()}</span>;
  }
  return <span>{d.toLocaleDateString()}</span>;
}
