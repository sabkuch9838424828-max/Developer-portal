"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  User,
  Sparkles,
  FolderGit2,
  Users,
  UserPlus,
  Briefcase,
  FileText,
  Mail,
  Zap,
  Terminal,
  Award,
  ShieldCheck,
} from "lucide-react";

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "talent" && user.role !== "admin"))) {
      router.push("/talent/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8FAFC] dark:bg-[#08090E]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/talent", icon: LayoutDashboard },
    { label: "AI Opportunities", href: "/talent/opportunities", icon: Sparkles, badge: "Match" },
    { label: "My Applications", href: "/talent/applications", icon: Briefcase },
    { label: "Invitations & Inbox", href: "/talent/invitations", icon: Mail },
    { label: "My Teams", href: "/talent/teams", icon: Users },
    { label: "Discover Members", href: "/talent/members", icon: UserPlus },
    { label: "Skills Portfolio", href: "/talent/skills", icon: Zap },
    { label: "Projects Showcase", href: "/talent/projects", icon: FolderGit2 },
    { label: "Achievements & Honors", href: "/talent/achievements", icon: Award },
    { label: "Identity Center", href: "/talent/identity", icon: ShieldCheck, badge: "Trust" },
    { label: "Profile Settings", href: "/talent/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#08090E] text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Developer Command Center Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-5">
          
          {/* Identity Widget */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <User size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || "Alex Chen"}
                </div>
                <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
                  {user?.talent_type || "developer"}
                </div>
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
                        ? "bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-600/20"
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
                            : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
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

          {/* Verification & Strength Badge */}
          <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">
              <div className="flex items-center gap-1.5">
                <span className="status-pip bg-cyan-500" />
                <span>PORTFOLIO STRENGTH</span>
              </div>
              <span>92%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: "92%" }} />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
              Verified code repositories connected. Strict mandatory matching gates active.
            </p>
          </div>

        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0">{children}</main>

      </div>
    </div>
  );
}
