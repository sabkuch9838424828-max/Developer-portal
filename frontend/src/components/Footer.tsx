"use client";

import React from "react";
import Link from "next/link";
import { Cpu, GitBranch, Globe, Share2, ShieldCheck, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Cpu size={20} />
              </div>
              <span className="text-xl font-bold tracking-wider font-mono text-slate-900 dark:text-white">
                NEXORA
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              "Where Technical Talent Meets the Right Opportunity."
              Engineering Skills. Intelligent Connections.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500 dark:text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                <GitBranch size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                <Share2 size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Recruiters column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-white font-mono">
              For Recruiters
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/recruiter/register" className="hover:text-blue-500 transition-colors">
                  Hire Technical Talent
                </Link>
              </li>
              <li>
                <Link href="/recruiter/jobs/create" className="hover:text-blue-500 transition-colors">
                  AI Job Requirement Parsing
                </Link>
              </li>
              <li>
                <Link href="/recruiter/jobs" className="hover:text-blue-500 transition-colors">
                  Candidate Match Breakdown
                </Link>
              </li>
              <li>
                <Link href="/recruiter/login" className="hover:text-blue-500 transition-colors">
                  Recruiter Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Talent column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-white font-mono">
              For Developers & Teams
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/talent/register" className="hover:text-blue-500 transition-colors">
                  Build Developer Portfolio
                </Link>
              </li>
              <li>
                <Link href="/talent/register" className="hover:text-blue-500 transition-colors">
                  Register Development Team
                </Link>
              </li>
              <li>
                <Link href="/talent/opportunities" className="hover:text-blue-500 transition-colors">
                  AI Opportunity Inbox
                </Link>
              </li>
              <li>
                <Link href="/talent/login" className="hover:text-blue-500 transition-colors">
                  Talent Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Architecture column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-900 dark:text-white font-mono">
              Intelligent Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-500" />
                <span>Deterministic Skill Ontology</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Strict Eligibility Gates</span>
              </li>
              <li>
                <Link href="/admin" className="text-slate-500 hover:text-purple-400 transition-colors">
                  AI Operations & Monitoring
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 NEXORA Platform. Engineered for Technical Talent.</p>
          <div className="flex items-center gap-6">
            <span>Production v1.0.0</span>
            <span>FastAPI + Next.js + Gemini / Grok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
