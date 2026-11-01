"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Briefcase,
  Users,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "recruiter" && user.role !== "admin"))) {
      router.push("/recruiter/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/recruiter", icon: LayoutDashboard },
    { label: "Create Recruitment", href: "/recruiter/jobs/create", icon: PlusCircle, badge: "AI" },
    { label: "My Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Applications", href: "/recruiter/applications", icon: FileText },
    { label: "Company Profile", href: "/recruiter/company", icon: Building },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Building size={20} />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.company_name || "Apex Cloud Systems"}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{user?.name || "Sarah Jenkins"}</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* AI Engine Status Widget */}
        <div className="p-4 rounded-2xl glass-panel border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Sparkles size={14} />
            <span>AI Matching Active</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Multi-pillar deterministic candidate scoring running at 75% threshold.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
