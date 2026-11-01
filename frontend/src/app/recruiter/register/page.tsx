"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Building, Mail, Lock, User, Globe, AlertCircle, ArrowRight, Terminal } from "lucide-react";

export default function RecruiterRegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    work_email: "",
    password: "",
    company_name: "",
    designation: "Technical Recruiter",
    company_website: "",
    company_size: "11-50",
    company_description: "",
    industry: "Software & Technology",
    location: "Remote / Hybrid",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerRecruiter } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerRecruiter(formData);
      router.push("/recruiter");
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
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto border border-violet-500/20">
            <Building size={22} />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-widest font-bold">
            <span className="status-pip bg-emerald-500" />
            <span>ORGANIZATION_ONBOARDING</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register Company & Recruiter
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your enterprise workspace to deploy 5-pillar candidate matching
          </p>
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
                Full Name
              </label>
              <input
                type="text"
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Company Name
              </label>
              <input
                type="text"
                required
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Apex Cloud Systems"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Corporate Email
              </label>
              <input
                type="email"
                required
                name="work_email"
                value={formData.work_email}
                onChange={handleChange}
                placeholder="recruiter@apexcloud.io"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Role Title
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Head of Talent"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Company Website
              </label>
              <input
                type="url"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="https://company.io"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Company Mission & Domain
            </label>
            <textarea
              rows={3}
              name="company_description"
              value={formData.company_description}
              onChange={handleChange}
              placeholder="Building scalable real-time analytics for infrastructure..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? "REGISTERING WORKSPACE..." : "CREATE RECRUITER TENANT"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 text-center text-xs font-mono text-slate-500">
          Already registered?{" "}
          <Link href="/recruiter/login" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
