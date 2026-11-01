"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function RecruiterLoginPage() {
  const [email, setEmail] = useState("recruiter@nexora.ai");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const u = await login(email, password);
      if (u.role === "recruiter" || u.role === "admin") {
        router.push("/recruiter");
      } else {
        router.push("/talent");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-tech-grid">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <Briefcase size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recruiter Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your recruitment pipeline and AI candidate matches
          </p>
        </div>

        {/* Demo Quick Fill Helper */}
        <div 
          onClick={() => { setEmail("recruiter@nexora.ai"); setPassword("Password123!"); }}
          className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          title="Click to auto-fill demo recruiter credentials"
        >
          <div>
            <span className="font-semibold">Demo Recruiter:</span> recruiter@nexora.ai
          </div>
          <span className="font-mono font-bold bg-white/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">Password123!</span>
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
              Work Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In as Recruiter"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          New to NEXORA?{" "}
          <Link href="/recruiter/register" className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">
            Register your company
          </Link>
        </div>
      </div>
    </div>
  );
}
