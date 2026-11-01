"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle, Terminal, Activity } from "lucide-react";

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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#F8FAFC] dark:bg-[#08090E]">
      <div className="w-full max-w-md p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto border border-violet-500/20">
            <Briefcase size={22} />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-widest font-bold">
            <span className="status-pip bg-emerald-500" />
            <span>ENTERPRISE_IDENTITY_PORTAL</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruiter Command Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticate to orchestrate requisitions and review AI candidate radar
          </p>
        </div>

        {/* Demo Quick Fill Helper */}
        <div 
          onClick={() => { setEmail("recruiter@nexora.ai"); setPassword("Password123!"); }}
          className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] text-[11px] font-mono text-violet-700 dark:text-violet-300 flex items-center justify-between cursor-pointer hover:bg-violet-500/[0.08] transition-colors"
          title="Click to auto-fill demo recruiter credentials"
        >
          <div>
            <span className="font-bold">DEMO_KEY:</span> recruiter@nexora.ai
          </div>
          <span className="bg-violet-500/10 px-1.5 py-0.5 rounded text-[10px] border border-violet-500/20">Password123!</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Corporate Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "AUTHENTICATING..." : "AUTHORIZE SESSION"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs font-mono text-slate-500">
          New hiring organization?{" "}
          <Link href="/recruiter/register" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
            Register company &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
