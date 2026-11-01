"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Code, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function TalentLoginPage() {
  const [email, setEmail] = useState("alex.chen@nexora.ai");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSelectDemo = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword("Password123!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const u = await login(email, password);
      if (u.role === "talent") {
        router.push("/talent");
      } else if (u.role === "recruiter") {
        router.push("/recruiter");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-tech-grid">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/25">
            <Code size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Talent & Team Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your technical portfolio and AI-matched opportunities
          </p>
        </div>

        {/* Demo Account Quick Pickers */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500">Quick Test Accounts:</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectDemo("alex.chen@nexora.ai")}
              className={`p-2 rounded-xl border text-left transition-colors ${
                email === "alex.chen@nexora.ai"
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-semibold"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <div>Alex Chen</div>
              <div className="text-[10px] opacity-75">Senior Backend (4.5y)</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo("sophia.martinez@nexora.ai")}
              className={`p-2 rounded-xl border text-left transition-colors ${
                email === "sophia.martinez@nexora.ai"
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-semibold"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <div>Sophia Martinez</div>
              <div className="text-[10px] opacity-75">Full-Stack (3.2y)</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In to Developer Hub"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Need an account?{" "}
          <Link href="/talent/register" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
            Register as Developer, Student, or Team
          </Link>
        </div>
      </div>
    </div>
  );
}
