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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
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
    { label: "Profile Settings", href: "/talent/profile", icon: User },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <User size={20} />
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
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
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
                          : "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold"
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
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-cyan-50/20 dark:bg-cyan-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-800 dark:text-cyan-300">
            <span>Portfolio Strength</span>
            <span className="font-mono">85%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: "85%" }} />
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Project code evidence active. Verified skills receive 40% matching weight.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
