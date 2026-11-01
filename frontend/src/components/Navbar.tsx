"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Briefcase,
  Code,
  Shield,
  Sparkles,
  Terminal,
  Activity,
  ArrowUpRight,
  Layers,
  Users
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardUrl = () => {
    if (!user) return "/";
    if (user.role === "recruiter") return "/recruiter";
    if (user.role === "admin") return "/admin";
    return "/talent";
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-[#08090e]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-sm dark:shadow-2xl"
          : "bg-white/70 dark:bg-[#08090e]/60 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Telemetry */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Precision Geometric Hexagon Node */}
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/35 transition-all">
                <div className="w-full h-full bg-[#0d1017] dark:bg-[#08090e] rounded-[10px] flex items-center justify-center">
                  <div className="w-4 h-4 relative flex items-center justify-center">
                    <div className="absolute inset-0 border border-violet-400 rotate-45 rounded-[2px]" />
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-wider text-slate-900 dark:text-white font-mono uppercase">
                    NEXORA
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold">
                    v2.4
                  </span>
                </div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                  TALENT INTELLIGENCE CORE
                </span>
              </div>
            </Link>

            {/* Live Operational Telemetry Pill */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/[0.06] bg-slate-100/60 dark:bg-white/[0.02] text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="status-pip" />
              <span>SYS_OK</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-700 dark:text-slate-300">5-PILLAR AI ENGINE</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-full border border-slate-200/80 dark:border-white/[0.07] bg-slate-100/40 dark:bg-white/[0.02]">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname === "/"
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Intelligence
            </Link>
            <Link
              href="/#matching-engine"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1"
            >
              <Sparkles size={12} className="text-cyan-500" />
              AI Matching
            </Link>
            <Link
              href="/#skill-taxonomy"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Taxonomy
            </Link>
            <Link
              href="/#team-collective"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Teams
            </Link>
            <Link
              href="/#recruiter-workflow"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Recruiters
            </Link>
          </div>

          {/* Action Area & Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-3 ml-1">
                <Link
                  href={getDashboardUrl()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/25 transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard size={14} />
                  <span>Command Center</span>
                </Link>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-rose-500 hover:border-rose-300 transition-all"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="relative flex items-center gap-2">
                {/* Unified Access Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition-colors font-mono"
                  >
                    ACCESS PORTAL <ChevronDown size={13} />
                  </button>

                  {loginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl surface-elevated p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Select Gateway
                      </div>
                      <Link
                        href="/recruiter/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                          <Briefcase size={15} />
                        </div>
                        <div>
                          <div>Recruiter Workspace</div>
                          <div className="text-[10px] font-normal text-slate-500">Multimodal job ingestion & discovery</div>
                        </div>
                      </Link>

                      <Link
                        href="/talent/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                          <Code size={15} />
                        </div>
                        <div>
                          <div>Developer & Teams</div>
                          <div className="text-[10px] font-normal text-slate-500">Verified portfolio & skill matrix</div>
                        </div>
                      </Link>

                      <Link
                        href="/admin"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors border-t border-slate-100 dark:border-white/5 mt-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                          <Shield size={15} />
                        </div>
                        <div>
                          <div>AI Engine Ops</div>
                          <div className="text-[10px] font-normal text-slate-500">Models, latency & audit logs</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/talent/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-md shadow-violet-500/25 transition-all hover:scale-[1.02]"
                >
                  Join Ecosystem
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden surface-elevated border-t border-slate-200 dark:border-white/10 px-5 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            Platform Intelligence
          </Link>
          <Link
            href="/#matching-engine"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            5-Pillar Matching Engine
          </Link>
          <Link
            href="/#skill-taxonomy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Skill Taxonomy
          </Link>
          <Link
            href="/#team-collective"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Team Collaboration Matrix
          </Link>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-violet-600 text-white"
                >
                  Open Command Center
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs text-rose-500 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/recruiter/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl"
                >
                  Recruiter Sign In
                </Link>
                <Link
                  href="/talent/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl"
                >
                  Developer Sign In
                </Link>
                <Link
                  href="/talent/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                >
                  Join Ecosystem Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
