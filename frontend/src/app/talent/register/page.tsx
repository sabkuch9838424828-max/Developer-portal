"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Code, Users, GraduationCap, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Terminal } from "lucide-react";

export default function TalentRegisterPage() {
  const [accountType, setAccountType] = useState<"developer" | "student" | "team">("developer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("Full-Stack Development");
  const [headline, setHeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerTalent } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerTalent({
        name,
        email,
        password,
        account_type: accountType,
        primary_specialization: specialization,
        headline: headline || undefined,
      });
      router.push("/talent");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16 bg-[#F8FAFC] dark:bg-[#08090E]">
      <div className="w-full max-w-xl p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <Code size={22} />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-bold">
            <span className="status-pip bg-cyan-500" />
            <span>DEVELOPER_NETWORK_JOIN</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Join the NEXORA Talent Network
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connect verified code repositories and receive precision recruitment matches
          </p>
        </div>

        {/* Account Category Selector */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setAccountType("developer")}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              accountType === "developer"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-sm"
                : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <Code size={18} />
            <span className="text-xs font-mono font-semibold">Developer</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("student")}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              accountType === "student"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-sm"
                : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <GraduationCap size={18} />
            <span className="text-xs font-mono font-semibold">Student</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("team")}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              accountType === "team"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-sm"
                : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
            }`}
          >
            <Users size={18} />
            <span className="text-xs font-mono font-semibold">Dev Team</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name / Team Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@domain.io"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Primary Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Full-Stack Development">Full-Stack Development</option>
                <option value="Backend Engineering">Backend Engineering</option>
                <option value="Frontend Architecture">Frontend Architecture</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="Embedded Systems">Embedded Systems</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Distributed Systems Engineer & Rust Enthusiast"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "INITIALIZING IDENTITY..." : "CREATE TALENT IDENTITY"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs font-mono text-slate-500">
          Already registered?{" "}
          <Link href="/talent/login" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
