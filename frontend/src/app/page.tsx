"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Code2,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  Send,
  Zap,
  CheckCircle2,
  Users,
  Target,
  ChevronDown,
  Lock,
  GitBranch,
  Terminal,
  Search,
  Database,
  Server,
  Activity,
  Sliders,
  FileText,
  Workflow,
} from "lucide-react";

export default function LandingPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<"recruiter" | "developer">("recruiter");
  const [activeCategory, setActiveCategory] = useState<string>("ai_ml");
  const [activeSimulatorThreshold, setActiveSimulatorThreshold] = useState<number>(80);
  const [hasMandatoryRequirement, setHasMandatoryRequirement] = useState<boolean>(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Simulated live matching telemetry calculation
  const mandatoryScore = hasMandatoryRequirement ? 40 : 0;
  const preferredScore = 18.5;
  const projectScore = 19.0;
  const expScore = 9.5;
  const availScore = 9.0;
  const totalScore = mandatoryScore + preferredScore + projectScore + expScore + availScore;
  const isEligible = totalScore >= activeSimulatorThreshold && hasMandatoryRequirement;

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  const skillCategories = [
    {
      id: "ai_ml",
      label: "AI & Machine Learning",
      count: "48 Skills",
      icon: Cpu,
      skills: ["PyTorch", "TensorFlow", "HuggingFace Transformers", "LangChain", "vLLM", "CUDA", "Vector Embeddings", "RAG Systems"],
    },
    {
      id: "backend",
      label: "Distributed & Backend",
      count: "64 Skills",
      icon: Server,
      skills: ["Python / FastAPI", "Rust / Tokio", "Go / gRPC", "Node.js / Bun", "PostgreSQL", "Redis / Valkey", "Apache Kafka", "Docker & K8s"],
    },
    {
      id: "frontend",
      label: "Modern Web & UI",
      count: "42 Skills",
      icon: Code2,
      skills: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "WebSockets", "WebAssembly", "WebGL / Three.js", "Zustand"],
    },
    {
      id: "database",
      label: "Databases & Storage",
      count: "36 Skills",
      icon: Database,
      skills: ["pgvector", "PostgreSQL", "ClickHouse", "MongoDB", "Cassandra", "Milvus / Pinecone", "Elasticsearch", "DuckDB"],
    },
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#F8FAFC] dark:bg-[#08090E] text-slate-900 dark:text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Asymmetric Editorial Layout)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 overflow-hidden">
        {/* Ambient illumination beams */}
        <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-violet-600/10 dark:bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[420px] h-[320px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Editorial Headline & Dual Portals */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-mono tracking-tight">
              <span className="status-pip bg-violet-500" />
              <span>NEXORA TALENT INTELLIGENCE OS 2.0</span>
            </div>

            {/* Asymmetric Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Talent, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 dark:from-violet-400 dark:via-cyan-300 dark:to-teal-300">
                Connected by Intelligence.
              </span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              NEXORA replaces opaque resume keyword matching with an auditable, 5-pillar skill intelligence engine. 
              Grounded candidate portfolios, multimodal document parsing, and collective team hiring for high-performance engineering organizations.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 w-full sm:w-auto">
              <Link
                href="/recruiter/register"
                className="px-6 py-3.5 rounded-xl text-xs font-semibold tracking-wide uppercase text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <Briefcase size={15} />
                <span>Recruiter Command Center</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/talent/register"
                className="px-6 py-3.5 rounded-xl text-xs font-semibold tracking-wide uppercase text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/10 hover:border-cyan-500/50 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md transition-all flex items-center justify-center gap-2 group"
              >
                <Code2 size={15} className="text-cyan-500" />
                <span>Developer & Team Hub</span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </Link>
            </div>

            {/* Telemetry specs row */}
            <div className="pt-4 grid grid-cols-3 gap-6 border-t border-slate-200/80 dark:border-white/[0.08] w-full max-w-lg">
              <div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">5-Pillar</div>
                <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Deterministic Engine</div>
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-violet-600 dark:text-violet-400">&lt; 380ms</div>
                <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Evaluation Latency</div>
              </div>
              <div>
                <div className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400">0% Spam</div>
                <div className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Strict Eligibility Gate</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live AI Talent Network & Matching Radar Simulation */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0D1017]/90 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-2">
                    RADAR_SIMULATOR // PIPELINE_ACTIVE
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  REAL-TIME
                </span>
              </div>

              {/* Dynamic Candidate Match Visualizer */}
              <div className="py-4 space-y-4">
                
                {/* Simulated Target Position */}
                <div className="flex items-start justify-between bg-slate-50 dark:bg-[#121722] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/[0.05]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 tracking-wider">
                      Target Role
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Principal Distributed Systems Architect
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Req: Python, FastAPI, Redis, Distributed Systems
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    ID: #REQ-904
                  </span>
                </div>

                {/* Candidate Result Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#08090E] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        AC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Alex Chen</div>
                        <div className="text-[10px] text-slate-500 font-mono">Distributed Systems • 4.5 Yrs</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xl font-mono font-extrabold ${isEligible ? "text-cyan-500" : "text-amber-500"}`}>
                        {totalScore.toFixed(1)}%
                      </div>
                      <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                        {isEligible ? "GATE_PASSED" : "DISQUALIFIED"}
                      </div>
                    </div>
                  </div>

                  {/* 5-Pillar Live Meter */}
                  <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Mandatory Skills (40%):</span>
                      <span className={hasMandatoryRequirement ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                        {hasMandatoryRequirement ? "40.0 / 40.0 (FastAPI, Redis)" : "0.0 / 40.0 (Missing Gate)"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${hasMandatoryRequirement ? "bg-emerald-500 w-full" : "bg-rose-500 w-0"}`}
                      />
                    </div>

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1">
                      <span>Project Proof (20%):</span>
                      <span className="text-slate-900 dark:text-white font-semibold">19.0 / 20.0 (High Repo Fit)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[95%]" />
                    </div>

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1">
                      <span>Preferred & Experience (40%):</span>
                      <span className="text-slate-900 dark:text-white font-semibold">37.0 / 40.0 (Near Optimal)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full w-[92%]" />
                    </div>
                  </div>

                  {/* Interactive Controls inside simulator */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => setHasMandatoryRequirement(!hasMandatoryRequirement)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors border ${
                        hasMandatoryRequirement
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {hasMandatoryRequirement ? "Mandatory Gate: Met" : "Mandatory Gate: Failed"}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">Threshold:</span>
                      <button
                        onClick={() => setActiveSimulatorThreshold(activeSimulatorThreshold === 80 ? 70 : 80)}
                        className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                      >
                        {activeSimulatorThreshold}%
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dispatch Status */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#121722] text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="status-pip bg-emerald-500" />
                    <span>TARGETED_DISPATCH_READY</span>
                  </div>
                  <span>{isEligible ? "Notification: ALLOWED" : "Notification: BLOCKED"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          2. SECTION 1: AI TALENT DISCOVERY RADAR (5-Pillar Architecture)
          ───────────────────────────────────────────────────────────── */}
      <section id="ai-discovery" className="w-full border-y border-slate-200/80 dark:border-white/[0.08] bg-slate-100/40 dark:bg-[#0D1017]/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              AUDITABLE TALENT INTELLIGENCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Traditional Keyword Filters Fail. <br />
              <span className="text-slate-500 dark:text-slate-400">NEXORA Computes Semantic Fit.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard ATS parsers scan for buzzword repetitions. NEXORA analyzes actual software engineering architecture, 
              differentiating between surface familiarity and verified production implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121722] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-mono font-bold text-sm">
                  01
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold">
                  40% WEIGHT
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mandatory Skill Gate
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Acts as a strict binary gate. If a position requires PostgreSQL and distributed caching, 
                candidates lacking core prerequisites are never surfaced by cosmetic semantic tricks.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121722] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
                  02
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                  20% WEIGHT
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Code-Backed Project Evidence
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Evaluates demonstrated architectural deliverables. Candidates provide problem statements, 
                architectural blueprints, and GitHub repositories with concrete commits.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121722] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
                  03
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                  20% WEIGHT
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Preferred Technology Stack
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Awards fractional bonus credit for secondary frameworks, specialized tooling, 
                and peripheral domain fluency that enhances candidate velocity.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121722] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
                  04
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  10% WEIGHT
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Experience Curve Alignment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Applies normalized sigmoid curves to career length, avoiding penalization of 
                high-velocity junior architects or over-valuing passive tenure.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121722] space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
                  05
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                  10% WEIGHT
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Availability & Modality Fit
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Factors location coordinates, remote readiness, immediate notice periods, 
                and working cadence to guarantee real-world hiring feasibility.
              </p>
            </div>

            {/* Explainability Engine */}
            <div className="p-6 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-mono text-xs font-bold uppercase">
                  <Terminal size={14} />
                  <span>Explainability Guarantee</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  100% Deterministic Math
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every score is broken down into an exact point contribution audit log. 
                  Candidates and hiring directors inspect exactly why an alignment score was assigned.
                </p>
              </div>
              <Link
                href="/recruiter/register"
                className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1.5 pt-2"
              >
                <span>Read Algorithm Spec</span>
                <ArrowRight size={13} />
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          3. SECTION 2: SKILL INTELLIGENCE & TAXONOMY ONTOLOGY
          ───────────────────────────────────────────────────────────── */}
      <section id="skill-intelligence" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
              DEEP SKILL ONTOLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              12 Engineering Domains. <br />
              Zero Buzzword Ambiguity.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              NEXORA categorizes technical skills into structured ontologies spanning AI/ML, Cloud Infrastructure, 
              Embedded IoT, Distributed Databases, and Security. Each skill tracks four discrete proficiency tiers with proof links.
            </p>

            <div className="space-y-2">
              {skillCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-violet-500/50 bg-violet-500/10 text-slate-900 dark:text-white"
                        : "border-slate-200/80 dark:border-white/[0.06] bg-white/40 dark:bg-[#0D1017] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{cat.label}</div>
                        <div className="text-[10px] font-mono text-slate-500">{cat.count} Indexed</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-violet-500 font-bold">
                      {isSelected ? "ACTIVE" : "EXPLORE"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Dynamic Category Preview */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] p-6 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                    Taxonomy Cluster
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {skillCategories.find((c) => c.id === activeCategory)?.label}
                  </h3>
                </div>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                  ONTOLOGY_LEVEL_4
                </span>
              </div>

              {/* Skill Matrix Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {skillCategories
                  .find((c) => c.id === activeCategory)
                  ?.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#121722] hover:border-violet-500/40 transition-colors"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {skill}
                      </div>
                      <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-slate-500">
                        <span>P-{idx % 2 === 0 ? "Expert" : "Adv"}</span>
                        <span className="text-emerald-500">✓ Proof</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Technical Attribution Note */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/40 dark:bg-[#08090E] text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-mono">
                <span>Multi-Dimensional Cross-Stack Graph Mapping</span>
                <span className="text-violet-500 font-bold">100% Granular</span>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. SECTION 3: DEVELOPER IDENTITY SHOWCASE
          ───────────────────────────────────────────────────────────── */}
      <section id="developer-identity" className="w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-100/30 dark:bg-[#0A0D14] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              ENGINEER-FIRST PROFILES
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Portfolio Built on Real Code, <br />
              <span className="text-slate-500 dark:text-slate-400">Not Stylized Resumes.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Showcase architecture diagrams, live GitHub repository links, performance benchmarks, 
              and verified technology proficiencies. Let your software speak directly to engineering leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Identity Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <GitBranch size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">GitHub Code Verification</h3>
                  <div className="text-[11px] font-mono text-slate-500">Repository Level Proof</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect your real repositories. NEXORA pairs claimed frameworks with committed codebase references, 
                so hiring managers can review real commits, PRs, and system architectures.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#121722] font-mono text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.04]">
                $ git verify --profile alexchen/distributed-cache
              </div>
            </div>

            {/* Identity Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Architectural Case Studies</h3>
                  <div className="text-[11px] font-mono text-slate-500">Problem & Solution Proof</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Document real software design decisions: throughput bottlenecks solved, 
                cache invalidation strategies, database indexing trade-offs, and microservice decoupling.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#121722] font-mono text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.04]">
                Latency reduced from 140ms to 8ms under 25k req/s
              </div>
            </div>

            {/* Identity Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Strict Privacy & Zero Spam</h3>
                  <div className="text-[11px] font-mono text-slate-500">Only High-Fit Inquiries</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                You will never receive bulk recruiter blasts or unsolicited cold messages. 
                Inboxes only receive opportunities where your profile objectively satisfied the requirement threshold.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#121722] font-mono text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-white/[0.04]">
                Protected by Deterministic Candidate Shield
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          5. SECTION 4: TEAM COLLABORATION & COLLECTIVE MATRIX
          ───────────────────────────────────────────────────────────── */}
      <section id="teams" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              COLLECTIVE TALENT RECRUITMENT
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hire Complete High-Performing Teams.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Modern engineering is collaborative. NEXORA enables student cohorts, open-source collectives, 
              and agency teams to assemble profiles, invite colleagues, and aggregate shared technical capabilities into a single hiring unit.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-violet-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-semibold">12-Category Aggregation:</strong> Individual member proficiencies automatically combine into an exhaustive team skill directory.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-violet-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-semibold">Shared vs Unique Skills:</strong> Identify specialized outliers alongside core overlapping competencies.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-violet-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white font-semibold">Explicit Acceptance Invitations:</strong> Team members are only enrolled upon explicit in-app confirmation.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/talent/teams"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <span>Explore Team Collaboration Workspace</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Team Skill Matrix Graphic Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] p-6 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nexus Distributed Core</h3>
                    <div className="text-[10px] font-mono text-slate-500">4 Active Contributors • Full-Stack AI</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  VERIFIED TEAM
                </span>
              </div>

              {/* Aggregated Skills Breakdown */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                  Aggregated Skill Inventory
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                      <span>Python & Distributed Backends</span>
                      <span className="font-mono text-violet-500 font-bold">3 Members</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-600 h-full w-[75%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                      <span>PyTorch & LLM Fine-Tuning</span>
                      <span className="font-mono text-cyan-500 font-bold">2 Members</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full w-[50%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1">
                      <span>Next.js 16 & TypeScript Architecture</span>
                      <span className="font-mono text-indigo-500 font-bold">2 Members</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[50%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Preview */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Roster: Sarah J. (Lead), Alex C., Elena R., Marcus V.</span>
                <span className="text-violet-500 font-bold">96.8% Fit</span>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          6. SECTION 5: RECRUITMENT INTELLIGENCE WORKFLOW
          ───────────────────────────────────────────────────────────── */}
      <section id="workflow" className="w-full border-y border-slate-200/80 dark:border-white/[0.08] bg-slate-100/40 dark:bg-[#08090E] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
              END-TO-END PIPELINE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recruitment Intelligence Workflow
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              From multimodal document uploads to targeted candidate notifications in seconds.
            </p>

            {/* Workflow Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121722] mt-4">
              <button
                onClick={() => setActiveWorkflow("recruiter")}
                className={`px-5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeWorkflow === "recruiter"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Recruiter Execution
              </button>
              <button
                onClick={() => setActiveWorkflow("developer")}
                className={`px-5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeWorkflow === "developer"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Developer Execution
              </button>
            </div>
          </div>

          {activeWorkflow === "recruiter" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="text-xs font-mono text-violet-500 font-bold">STEP 01</div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Multimodal Ingestion
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Upload an existing job description in PDF, JPEG, or PNG format. Our OCR and document pipeline 
                  converts unstructured imagery into clean technical text.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="text-xs font-mono text-violet-500 font-bold">STEP 02</div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Sliders size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mandatory vs Preferred Review
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  The AI categorizes skills into mandatory gates and preferred bonuses. You review and adjust 
                  criteria before publishing. Zero automatic unverified postings.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="text-xs font-mono text-violet-500 font-bold">STEP 03</div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Send size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Precision Notification
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  The matching engine scores registered individual profiles and teams. Targeted notifications 
                  reach eligible talent instantly with 1-click invitation triggers.
                </p>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="text-xs font-mono text-cyan-500 font-bold">STEP 01</div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Code2 size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Index Engineering Stack
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Register as an individual developer or collective team. Add categorized skills with verified proficiency 
                  and link real architecture projects.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="text-xs font-mono text-cyan-500 font-bold">STEP 02</div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Grounded Opportunity Inbox
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Receive notifications exclusively when a role matches your genuine skills. Inspect the exact 
                  mathematical score breakdown and why the position was recommended.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="text-xs font-mono text-cyan-500 font-bold">STEP 03</div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Send size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Direct Recruiter Interaction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Accept formal recruiter invitations or apply with 1-click. Track application states across 
                  Submitted, Under Review, Interviewing, and Offered in real time.
                </p>
              </div>

            </div>
          )}
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          7. SECTION 6: PLATFORM ECOSYSTEM OVERVIEW
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
            ENTERPRISE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Multi-LLM Gateway & Platform Ecosystem
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            NEXORA delivers provider independence with native support for Google Gemini and xAI Grok, 
            backed by deterministic local heuristic ontologies for 100% offline uptime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
            <div className="text-xs font-mono text-violet-500 font-bold uppercase">Google Gemini</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Gemini 1.5 Pro / Flash</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multimodal document parsing, vision OCR understanding, and structured JSON requirement extraction.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
            <div className="text-xs font-mono text-cyan-500 font-bold uppercase">xAI Grok</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Grok Beta / Grok 2</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              REST standard integration for code reasoning, technical requirement decomposition, and portfolio evaluation.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
            <div className="text-xs font-mono text-emerald-500 font-bold uppercase">Offline Fallback</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Heuristic Engine</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero hard dependency. When external APIs are unreachable, NEXORA falls back to local ontological matching.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
            <div className="text-xs font-mono text-amber-500 font-bold uppercase">Security & RBAC</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Role-Based Guards</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Strict cryptographic token authentication, audit logs, and separated tenant workspaces.
            </p>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          8. SECTION 7: TRUST, SECURITY & FAQ
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-100/30 dark:bg-[#0A0D14] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Platform Architecture & Integrity
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does NEXORA guarantee zero hallucinated candidate matches?",
                a: "NEXORA uses an auditable 5-pillar mathematical engine. AI is strictly leveraged for text parsing and document understanding, while candidate ranking is evaluated using deterministic scoring code with strict mandatory skill gates. If a mandatory skill is missing, candidate promotion is disallowed.",
              },
              {
                q: "Can recruiters upload arbitrary PDF and image job descriptions?",
                a: "Yes. Recruiters can drag and drop PDF, PNG, or JPG job specs. The platform runs automated OCR and AI requirement extraction, outputting structured mandatory skills, preferred tools, and experience limits for recruiter verification before publishing.",
              },
              {
                q: "How does Team Collaboration and collective skill aggregation work?",
                a: "Any registered talent member can create a team and invite colleagues. The platform aggregates individual proficiencies across 12 engineering categories, generating a unified team skill scorecard, shared vs unique skill breakdowns, and team-based recruitment matching.",
              },
              {
                q: "Are candidates protected from recruiter spam?",
                a: "Completely. Targeted notification alerts are only dispatched to developers or teams that meet or exceed the job's configured threshold (default 75%) and satisfy all mandatory prerequisites. Cold blast messaging is architecturally prohibited.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      faqOpen === idx ? "rotate-180 text-violet-600 dark:text-cyan-400" : "text-slate-400"
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          9. SECTION 8: HIGH-IMPACT DUAL CALL-TO-ACTION PORTAL
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Recruiter CTA */}
          <div className="p-8 sm:p-10 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 via-transparent to-transparent space-y-5 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Briefcase size={22} />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400 font-bold">
                ENTERPRISE HIRING
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Deploy Recruiter Command Center
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Post technical openings, parse PDF requirements, and access pre-screened individual architects 
                and collective engineering teams.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/recruiter/register"
                className="px-6 py-3 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md transition-all flex items-center gap-2"
              >
                <span>Launch Recruiter Workspace</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/recruiter/login"
                className="px-4 py-3 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Developer CTA */}
          <div className="p-8 sm:p-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent space-y-5 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Code2 size={22} />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
                TALENT ECOSYSTEM
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Build Developer Identity
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect your GitHub repositories, showcase architecture case studies, assemble development teams, 
                and receive precision recruitment notifications.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/talent/register"
                className="px-6 py-3 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition-all flex items-center gap-2"
              >
                <span>Join as Developer / Team</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/talent/login"
                className="px-4 py-3 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 transition-colors"
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
