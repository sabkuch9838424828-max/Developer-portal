"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";
import {
  Cpu,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Briefcase,
  Code,
  Shield,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getDashboardUrl = () => {
    if (!user) return "/";
    if (user.role === "recruiter") return "/recruiter";
    if (user.role === "admin") return "/admin";
    return "/talent";
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Cpu size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-white dark:via-blue-400 dark:to-cyan-300 font-mono">
                NEXORA
              </span>
              <span className="text-[9px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-medium">
                AI Talent Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-cyan-400 ${
                pathname === "/"
                  ? "text-blue-600 dark:text-cyan-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-cyan-400"
            >
              How It Works
            </Link>
            <Link
              href="/#ai-matching"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-blue-500 dark:text-cyan-400" />
              AI Matching
            </Link>
            <Link
              href="/#for-recruiters"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-cyan-400"
            >
              For Recruiters
            </Link>
            <Link
              href="/#for-developers"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-cyan-400"
            >
              For Talent
            </Link>
          </div>

          {/* Action Area & Controls */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  href={getDashboardUrl()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-300 transition-all"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="relative flex items-center gap-2">
                {/* Login Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 rounded-xl transition-colors"
                  >
                    Log In <ChevronDown size={14} />
                  </button>

                  {loginDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl p-2 z-50 border border-slate-200 dark:border-white/10">
                      <Link
                        href="/recruiter/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                        <div>
                          <div>Recruiter Portal</div>
                          <div className="text-[10px] font-normal text-slate-500">Hire top engineering talent</div>
                        </div>
                      </Link>

                      <Link
                        href="/talent/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                      >
                        <Code size={16} className="text-cyan-600 dark:text-cyan-400" />
                        <div>
                          <div>Talent & Teams</div>
                          <div className="text-[10px] font-normal text-slate-500">Developers & student teams</div>
                        </div>
                      </Link>

                      <Link
                        href="/admin"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors border-t border-slate-100 dark:border-white/5 mt-1"
                      >
                        <Shield size={16} className="text-purple-600 dark:text-purple-400" />
                        <div>
                          <div>Admin & AI Ops</div>
                          <div className="text-[10px] font-normal text-slate-500">Platform operations</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/talent/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
                >
                  Get Started
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
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-white/10 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Home
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            How It Works
          </Link>
          <Link
            href="/#ai-matching"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            AI Matching
          </Link>
          <Link
            href="/#for-recruiters"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            For Recruiters
          </Link>
          <Link
            href="/#for-developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            For Talent
          </Link>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm text-rose-500 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/recruiter/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl"
                >
                  Recruiter Sign In
                </Link>
                <Link
                  href="/talent/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl"
                >
                  Talent Sign In
                </Link>
                <Link
                  href="/talent/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
