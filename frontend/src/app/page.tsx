"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Code,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  Send,
  Zap,
  CheckCircle2,
  Users,
  Target,
  ExternalLink,
  ChevronDown,
  Lock,
  GitBranch,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"recruiters" | "talent">("recruiters");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  return (
    <div className="flex flex-col items-center w-full bg-tech-grid">
      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-violet-500/10 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 dark:border-cyan-500/30 bg-blue-500/10 dark:bg-cyan-950/40 text-blue-600 dark:text-cyan-400 text-xs font-semibold tracking-wide">
            <Sparkles size={13} className="animate-pulse" />
            <span>AI-POWERED RECRUITMENT & TALENT DISCOVERY</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Where Technical Talent Meets the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 dark:from-blue-400 dark:via-cyan-300 dark:to-teal-300">
              Right Opportunity.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            NEXORA uses intelligent technology to connect developers, student teams, and companies through
            skills-based recruitment and meaningful technical collaboration.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
            <Link
              href="/talent/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Explore Opportunities
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/recruiter/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white glass-panel hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-slate-300 dark:border-white/10 flex items-center justify-center gap-2"
            >
              <Briefcase size={16} className="text-blue-500 dark:text-cyan-400" />
              Hire Technical Talent
            </Link>
          </div>

          {/* Public Demo Indicator Notice */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Deterministic 5-pillar skill matching • Strict eligibility gates • Provider independent</span>
          </p>
        </div>

        {/* HERO INTERACTIVE MATCHING PREVIEW VISUAL */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-3xl glass-panel p-4 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-white/10 relative">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-500 ml-2">NEXORA Intelligent Matching Engine v1.0</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Pipeline Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Left Card: Recruiter Opportunity Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  Job Requirement
                </span>
                <span className="text-xs text-slate-500">Apex Cloud</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Senior Python Backend Engineer
              </h3>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Mandatory Skills:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">Python, FastAPI, Postgres</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Preferred:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">Docker, Redis</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Experience:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">3-6 Years</span>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  FastAPI
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  PostgreSQL
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                  Docker
                </span>
              </div>
            </div>

            {/* Middle: The AI Engine Evaluation */}
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 p-5 space-y-4 flex flex-col justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <Zap size={22} />
              </div>
              <div>
                <span className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                  98.0%
                </span>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ✓ Strict Eligibility Satisfied
                </p>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 text-left px-2">
                <div className="flex justify-between">
                  <span>Mandatory Skills (40%):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">40.0 / 40</span>
                </div>
                <div className="flex justify-between">
                  <span>Preferred Skills (20%):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">20.0 / 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Relevant Projects (20%):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">19.0 / 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience Alignment (10%):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">10.0 / 10</span>
                </div>
                <div className="flex justify-between">
                  <span>Availability Match (10%):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">9.0 / 10</span>
                </div>
              </div>
            </div>

            {/* Right Card: Candidate Profile Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
                  Matched Candidate
                </span>
                <span className="text-xs text-slate-500">Seattle, WA</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Alex Chen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Senior Python & Distributed Systems Engineer (4.5 yrs)
              </p>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Project Proof:</div>
                NEXUS Ingestion Engine (FastAPI, Redis, PostgreSQL) handling 25k events/sec.
              </div>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ● Notification Dispatched
                </span>
                <Link
                  href="/recruiter/login"
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Inspect Profile <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM INTRODUCTION & PROBLEM STATEMENT */}
      <section className="w-full border-y border-slate-200 dark:border-white/10 bg-slate-100/40 dark:bg-slate-900/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-600 dark:text-cyan-400">
              Why NEXORA
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Traditional Recruitment Misses Relevant Technical Talent
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Resumes filled with buzzwords fail to reflect genuine coding execution. Keyword search tools
              create spam inboxes for developers and endless low-quality pipelines for engineering leaders.
              NEXORA replaces guesswork with grounded, deterministic technical alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Skills & Portfolio Grounded
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We differentiate between self-declared terms and demonstrated project capabilities. A candidate
                with production code evidence ranks on merit.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Strict Mandatory Gates
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If a position strictly requires FastAPI, candidates lacking it are not promoted by hallucinated
                semantic scores. Clear eligibility eliminates irrelevant noise.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Targeted Notifications Only
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When a recruiter publishes a role, only verified candidates meeting or exceeding the threshold
                receive notification alerts. No blast emails or spam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-600 dark:text-cyan-400">
            Workflows
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How NEXORA Connects Talent and Companies
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select your perspective to view the dedicated recruitment workflow.
          </p>

          {/* Workflow Toggle */}
          <div className="inline-flex p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 mt-4">
            <button
              onClick={() => setActiveTab("recruiters")}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "recruiters"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              For Recruiters & Companies
            </button>
            <button
              onClick={() => setActiveTab("talent")}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "talent"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              For Developers & Student Teams
            </button>
          </div>
        </div>

        {activeTab === "recruiters" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="text-xs font-mono text-blue-500 font-bold">STEP 01</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upload or Draft Job Requirements
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload your existing job description as PDF, PNG, or text. Our AI extracts structured mandatory
                skills, preferred skills, and experience criteria.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="text-xs font-mono text-blue-500 font-bold">STEP 02</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Review & Publish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You retain complete control to review extracted criteria before publishing. No job posting is ever
                published automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="text-xs font-mono text-blue-500 font-bold">STEP 03</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Targeted Match & Invitations
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Discover pre-ranked candidates with grounded explainable scores. Send 1-click recruitment
                invitations directly to high-fit talent.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="text-xs font-mono text-cyan-500 font-bold">STEP 01</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Build Technical Portfolio
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Register as an individual developer, student, or development team. Showcase categorized skills,
                GitHub repositories, and project architectures.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="text-xs font-mono text-cyan-500 font-bold">STEP 02</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Intelligent Opportunity Inbox
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Receive notification alerts only for jobs that match your genuine stack. Inspect why the AI
                matched you and what skills gave you the edge.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3">
              <div className="text-xs font-mono text-cyan-500 font-bold">STEP 03</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Apply & Track Pipeline
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Apply with one click or accept direct recruiter invitations. Track your status from Under Review
                through Interview to Offer.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* AI MATCHING ENGINE DEEP DIVE */}
      <section id="ai-matching" className="w-full border-t border-slate-200 dark:border-white/10 bg-slate-100/30 dark:bg-slate-950/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-600 dark:text-cyan-400">
                Deterministic + AI Hybrid Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Explainable Matching Math, Not Black-Box Guesswork
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Scores on NEXORA are calculated deterministically by platform business logic based on 5
                structured pillars. AI is utilized for document parsing and profile understanding, while ranking
                math remains fully auditable.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Mandatory Skill Alignment (40% Weight) — Acts as a strict eligibility gate
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Preferred Skill Alignment (20% Weight) — Bonus points for nice-to-have tools
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Demonstrated Project Evidence (20% Weight) — Concrete repo and problem-solving proof
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Experience Range Compatibility (10% Weight) — Normalized years of mastery
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Availability & Work Preference (10% Weight) — Remote, Hybrid, or On-site alignment
                  </span>
                </div>
              </div>
            </div>

            {/* Provider Independence Box */}
            <div className="p-8 rounded-3xl glass-panel space-y-6 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Provider Independence Architecture
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-mono">
                  Multi-LLM Gateway
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Configure either Google Gemini or xAI Grok with a single environment key. Our centralized
                adapter automatically harmonizes request schemas, timeouts, and error handling.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Google Gemini</div>
                  <div className="text-[11px] text-slate-500 font-mono">gemini-1.5-pro / flash</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    ✓ Structured JSON Output
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">xAI Grok</div>
                  <div className="text-[11px] text-slate-500 font-mono">grok-beta / grok-2</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                    ✓ REST OpenAI Standard
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-700 dark:text-amber-300">
                <strong>Offline Graceful Heuristic Fallback:</strong> If no external API key is entered, the
                platform operates seamlessly using our deterministic ontology extraction engine.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC DEMONSTRATION METRICS */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-200 dark:border-white/10">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Demonstration Platform Metrics
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Engineered for Precision Matching
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                98.4%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Skill Alignment Accuracy</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                75%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Default Match Threshold</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-300 font-mono">
                &lt; 500ms
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Average Matching Latency</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                100%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Explainable Scoring Audit</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-600 dark:text-cyan-400">
            Common Questions
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Can I upload a PDF or image job description directly?",
              a: "Yes. Recruiters can drag and drop PDF, PNG, or JPEG recruitment documents. Our Document Intelligence engine extracts text with PyMuPDF/OCR and parses requirements into an editable structured draft for review before publishing.",
            },
            {
              q: "Can development teams register as a single entity?",
              a: "Yes. NEXORA fully supports Development Teams. A team lead can register, invite authorized members, define roles, showcase combined projects, and apply to team-based opportunities together.",
            },
            {
              q: "Does the AI automatically publish jobs without my approval?",
              a: "Never. Recruiters must review and approve all extracted job requirements, skills, and compensation parameters before any job is published or candidate matching is initiated.",
            },
            {
              q: "How does the platform prevent candidate spam?",
              a: "Only candidates who pass strict mandatory skill gates and achieve an overall match score at or above the configured threshold (default 75%) receive recruitment notifications.",
            },
            {
              q: "Which AI providers are supported?",
              a: "NEXORA has built-in native support for Google Gemini and xAI Grok, alongside an automatic offline heuristic fallback engine when external credentials are not supplied.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-panel border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    faqOpen === idx ? "rotate-180 text-blue-600 dark:text-cyan-400" : ""
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* DUAL CTA SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recruiter CTA Card */}
          <div className="p-8 rounded-3xl glass-panel border border-blue-500/20 bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 dark:from-blue-950/20 dark:via-slate-900 dark:to-indigo-950/20 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Briefcase size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Hiring Engineering Talent?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Post your technical roles, upload descriptions in PDF or image format, and discover pre-screened
              developers and student collectives based on verified skills.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/recruiter/register"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
              >
                Create Recruiter Account
              </Link>
              <Link
                href="/recruiter/login"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Talent CTA Card */}
          <div className="p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-br from-cyan-50/50 via-slate-50 to-teal-50/30 dark:from-cyan-950/20 dark:via-slate-900 dark:to-teal-950/20 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Code size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Are You a Developer or Student Team?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Build your technical portfolio, connect project evidence, and receive targeted recruitment
              invitations that respect your engineering abilities.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/talent/register"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition-all"
              >
                Join as Talent / Team
              </Link>
              <Link
                href="/talent/login"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
