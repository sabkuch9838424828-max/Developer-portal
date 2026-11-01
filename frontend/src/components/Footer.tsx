"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, Globe, Share2, ShieldCheck, Sparkles, Terminal, Activity, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-white/[0.08] bg-slate-100/40 dark:bg-[#06080c] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/[0.08]">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-[1px]">
                <div className="w-full h-full bg-[#08090e] rounded-[11px] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 border border-violet-400 rotate-45 rounded-[2px]" />
                </div>
              </div>
              <span className="text-lg font-black tracking-wider font-mono text-slate-900 dark:text-white uppercase">
                NEXORA
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 font-semibold">
                SaaS Core
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              AI-driven talent intelligence, deterministic skill verification, and autonomous candidate-to-vacancy matching engine for modern engineering organizations.
            </p>

            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:text-violet-500 hover:border-violet-400 transition-all">
                <GitBranch size={15} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:text-cyan-500 hover:border-cyan-400 transition-all">
                <Share2 size={15} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:text-blue-500 hover:border-blue-400 transition-all">
                <Globe size={15} />
              </a>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 pt-1">
              <span className="status-pip" />
              <span>PRODUCTION API: OPERATIONAL (100% UPTIME)</span>
            </div>
          </div>

          {/* Recruiters Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white">
              Talent Acquisition
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/recruiter/register" className="hover:text-violet-500 transition-colors flex items-center justify-between">
                  <span>Deploy Job Vacancy</span>
                  <ArrowUpRight size={12} className="opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/recruiter/jobs/create" className="hover:text-violet-500 transition-colors">
                  Multimodal PDF Ingestion
                </Link>
              </li>
              <li>
                <Link href="/recruiter/jobs" className="hover:text-violet-500 transition-colors">
                  Deterministic Match Radar
                </Link>
              </li>
              <li>
                <Link href="/recruiter/login" className="hover:text-violet-500 transition-colors">
                  Recruiter Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers & Teams Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white">
              Engineering Roster
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/talent/register" className="hover:text-cyan-500 transition-colors flex items-center justify-between">
                  <span>Create Developer Identity</span>
                  <ArrowUpRight size={12} className="opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/talent/teams" className="hover:text-cyan-500 transition-colors">
                  Team Collective Matrix
                </Link>
              </li>
              <li>
                <Link href="/talent/members" className="hover:text-cyan-500 transition-colors">
                  Discover Engineers Directory
                </Link>
              </li>
              <li>
                <Link href="/talent/opportunities" className="hover:text-cyan-500 transition-colors">
                  Verified Matches Inbox
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Intelligence Architecture */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-900 dark:text-white">
              Platform Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5 font-mono text-[11px]">
                <Sparkles size={12} className="text-violet-500 shrink-0" />
                <span>Deterministic 5-Pillar Engine</span>
              </li>
              <li className="flex items-center gap-1.5 font-mono text-[11px]">
                <Terminal size={12} className="text-cyan-500 shrink-0" />
                <span>FastAPI + PyMuPDF Extraction</span>
              </li>
              <li className="flex items-center gap-1.5 font-mono text-[11px]">
                <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                <span>Strict Eligibility Gating</span>
              </li>
              <li>
                <Link href="/admin" className="text-slate-500 hover:text-purple-400 transition-colors text-[11px] font-mono">
                  AI Ops & Latency Metrics →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p className="font-mono text-[11px]">
            © 2026 NEXORA SYSTEMS INC. ENGINEERING TALENT INTELLIGENCE.
          </p>
          <div className="flex items-center gap-6 text-[11px] font-mono">
            <span>SHA-256 VERIFIED</span>
            <span>REST API v1</span>
            <span>GEMINI & GROK ORCHESTRATION</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
