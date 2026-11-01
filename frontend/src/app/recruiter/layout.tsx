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
  Sparkles,
  Layers,
  Activity,
  Terminal,
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
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] dark:bg-[#08090E]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/recruiter", icon: LayoutDashboard },
    { label: "Create Recruitment", href: "/recruiter/jobs/create", icon: PlusCircle, badge: "AI" },
    { label: "Active Requisitions", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Applicant Pipeline", href: "/recruiter/applications", icon: FileText },
    { label: "Company Profile", href: "/recruiter/company", icon: Building },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#08090E] text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Recruiter Command Center Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-5">
          
          {/* Identity Widget */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                <Building size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.company_name || "Enterprise Recruiter"}
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{user?.name || "Talent Director"}</div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
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

          {/* Telemetry Status Panel */}
          <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-violet-700 dark:text-violet-400">
              <div className="flex items-center gap-2">
                <span className="status-pip bg-emerald-500" />
                <span>AI MATCH ENGINE</span>
              </div>
              <span className="text-[10px] text-slate-400">v2.4</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              5-pillar deterministic candidate scoring running at 75% threshold with strict gate enforcement.
            </p>
          </div>

        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0">{children}</main>

      </div>
    </div>
  );
}
