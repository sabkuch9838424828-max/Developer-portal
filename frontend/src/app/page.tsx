"use client";

import React, { useState } from "react";
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
  Download,
  Mail,
  MapPin,
  Clock,
  Award,
  Check,
  ExternalLink,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function LandingPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<"recruiter" | "developer">("recruiter");
  const [activeCategory, setActiveCategory] = useState<string>("ai_ml");
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>("all");
  const [activeSimulatorThreshold, setActiveSimulatorThreshold] = useState<number>(80);
  const [hasMandatoryRequirement, setHasMandatoryRequirement] = useState<boolean>(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("Hire Developer / Team");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    // Front-end validation
    if (!contactName.trim() || contactName.trim().length < 2) {
      setContactError("Please provide your full name (at least 2 characters).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setContactError("Please provide a valid work or personal email address.");
      return;
    }
    if (!contactMessage.trim() || contactMessage.trim().length < 10) {
      setContactError("Please describe your project, hiring requirements, or inquiry (at least 10 characters).");
      return;
    }

    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 800);
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

  // At least 6 technologies with animated progress indicators
  const featuredSkillMetrics = [
    { name: "Python / FastAPI", category: "Backend", proficiency: 96, years: "4.5y", proof: "NEXUS Core Engine" },
    { name: "PyTorch & Transformers", category: "AI / ML", proficiency: 92, years: "3.5y", proof: "Fast-RAG Evaluator" },
    { name: "Next.js 16 & TypeScript", category: "Frontend", proficiency: 94, years: "4.0y", proof: "NEXORA Dashboard OS" },
    { name: "PostgreSQL & pgvector", category: "Databases", proficiency: 90, years: "4.0y", proof: "Ontology Index" },
    { name: "Redis / Valkey Caching", category: "Backend", proficiency: 92, years: "3.5y", proof: "25k req/s Pipeline" },
    { name: "Docker & Kubernetes", category: "DevOps", proficiency: 88, years: "3.0y", proof: "Cluster Manifests" },
    { name: "Rust / Tokio", category: "Systems", proficiency: 85, years: "2.5y", proof: "Telemetry Daemon" },
    { name: "LangChain / LLM Gateway", category: "AI / ML", proficiency: 90, years: "2.5y", proof: "Multi-LLM Adapter" },
  ];

  // At least 3 detailed projects with thumbnails & working links
  const portfolioProjects = [
    {
      id: "proj-1",
      title: "NEXORA Multimodal Ingestion Core",
      category: "ai",
      categoryLabel: "AI & Document Intelligence",
      description: "High-throughput OCR and multi-LLM document intelligence engine that ingests unstructured PDF, JPEG, and PNG recruitment briefs, parses technical criteria, and maps them to centralized skill ontologies.",
      problemSolved: "Eliminates manual recruiter job posting and hallucinated criteria via structured vision extraction.",
      technologies: ["Python", "FastAPI", "PyMuPDF", "Gemini Flash", "Redis", "Docker"],
      githubUrl: "https://github.com/alexchen/nexora-multimodal-ingestion",
      demoUrl: "/recruiter/jobs/create",
      stats: "Sub-2.4s OCR Parsing • 100% Schema Validation",
      thumbnailBg: "from-violet-900/40 via-purple-900/20 to-[#0d1017]",
      accentColor: "border-violet-500/40 text-violet-400",
    },
    {
      id: "proj-2",
      title: "Deterministic 5-Pillar Candidate Radar",
      category: "backend",
      categoryLabel: "Distributed Systems & Algorithms",
      description: "Mathematical candidate-to-vacancy ranking engine that computes auditable alignment scores across Mandatory Gates (40%), Preferred Stack (20%), Code Evidence (20%), Experience (10%), and Availability (10%).",
      problemSolved: "Replaces biased keyword counting with auditable mathematical scoring and strict binary prerequisite gates.",
      technologies: ["Python", "FastAPI", "PostgreSQL", "pgvector", "AsyncIO", "NumPy"],
      githubUrl: "https://github.com/alexchen/nexora-matching-radar",
      demoUrl: "/talent/opportunities",
      stats: "< 380ms Latency • 0% Spam Dispatched",
      thumbnailBg: "from-cyan-900/40 via-blue-900/20 to-[#0d1017]",
      accentColor: "border-cyan-500/40 text-cyan-400",
    },
    {
      id: "proj-3",
      title: "Collective Team Skill Aggregation Matrix",
      category: "fullstack",
      categoryLabel: "Full-Stack Collaboration OS",
      description: "Collaborative software team workspace enabling developers and student cohorts to assemble profiles, aggregate 12 technical skill categories, analyze shared versus unique expertise, and apply to team recruitment mandates.",
      problemSolved: "Enables engineering hiring managers to evaluate and recruit high-performing squads as a cohesive unit.",
      technologies: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Zustand", "SQLite"],
      githubUrl: "https://github.com/alexchen/nexora-team-matrix",
      demoUrl: "/talent/teams",
      stats: "12-Category Mapping • Real-Time Attribution",
      thumbnailBg: "from-indigo-900/40 via-violet-900/20 to-[#0d1017]",
      accentColor: "border-indigo-500/40 text-indigo-400",
    },
    {
      id: "proj-4",
      title: "Distributed Low-Latency Event Ingestion Queue",
      category: "backend",
      categoryLabel: "Cloud & Infrastructure",
      description: "Microservice message streaming pipeline designed to process high-velocity telemetry logs and candidate verification signals under intense concurrency.",
      problemSolved: "Benchmarked at 25,000 req/sec with zero packet loss and p99 latency below 8ms.",
      technologies: ["Python", "Redis Streams", "Apache Kafka", "Docker", "Prometheus"],
      githubUrl: "https://github.com/alexchen/distributed-telemetry-queue",
      demoUrl: "/talent/projects",
      stats: "25k Events/sec • <8ms Latency SLA",
      thumbnailBg: "from-emerald-900/40 via-teal-900/20 to-[#0d1017]",
      accentColor: "border-emerald-500/40 text-emerald-400",
    },
  ];

  const filteredProjects = portfolioProjects.filter((p) => {
    if (activeProjectFilter === "all") return true;
    return p.category === activeProjectFilter;
  });

  // At least 3 team member profiles with names, roles, avatars
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Lead Distributed Systems Architect",
      location: "Seattle, WA",
      avatarInitials: "AC",
      avatarGradient: "from-violet-600 to-indigo-600",
      bio: "Specializing in high-throughput Python/FastAPI backends, Redis caching topologies, and deterministic ranking algorithms. 4.5+ years building cloud-native infrastructure.",
      skills: ["Python", "FastAPI", "Redis", "Distributed Systems", "PostgreSQL"],
      github: "https://github.com/alexchen",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Sophia Martinez",
      role: "Full-Stack AI & Interface Engineer",
      location: "Austin, TX",
      avatarInitials: "SM",
      avatarGradient: "from-cyan-500 to-blue-600",
      bio: "Crafting reactive developer tooling and multi-LLM gateways using Next.js 16, TypeScript, PyTorch, and Tailwind CSS. Obsessed with micro-interactions and low latency.",
      skills: ["Next.js 16", "TypeScript", "PyTorch", "Tailwind CSS", "Zustand"],
      github: "https://github.com/sophiamartinez",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Marcus Vance",
      role: "Cloud DevOps & Platform Security Lead",
      location: "New York, NY",
      avatarInitials: "MV",
      avatarGradient: "from-emerald-600 to-teal-600",
      bio: "Architecting zero-trust microservice clusters, automated CI/CD pipelines, Docker containerization, and AWS cloud security. 5.0+ years in platform engineering.",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Cybersecurity"],
      github: "https://github.com/marcusvance",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Elena Rostova",
      role: "Senior Machine Learning Engineer",
      location: "Boston, MA",
      avatarInitials: "ER",
      avatarGradient: "from-purple-600 to-rose-600",
      bio: "Focusing on dense vector embeddings, PyTorch model optimization, RAG retrieval pipelines, and semantic ontology matching. Master's in Computer Science.",
      skills: ["PyTorch", "Transformers", "pgvector", "CUDA", "Fast-RAG"],
      github: "https://github.com/elenarostova",
      linkedin: "https://linkedin.com",
    },
  ];

  // At least 2 achievements / certifications / milestones (labeled sample content)
  const achievements = [
    {
      title: "AWS Certified Solutions Architect – Professional",
      category: "CERTIFICATION (OFFICIAL SAMPLE)",
      date: "September 2025",
      issuer: "Amazon Web Services (AWS)",
      verificationId: "AWS-SAP-984210-VERIFIED",
      description: "Demonstrated comprehensive technical knowledge in architecting fault-tolerant, scalable, multi-tier distributed applications with high security and 99.99% availability SLAs.",
      icon: Award,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      title: "25,000 req/sec High-Throughput Ingestion Benchmark",
      category: "PERFORMANCE BENCHMARK (SAMPLE RESULT)",
      date: "January 2026",
      issuer: "Distributed Systems Lab Benchmark",
      verificationId: "BENCHMARK-RUN-#402",
      description: "Sustained 25,000 concurrent event requests per second at p99 latency under 8 milliseconds using asynchronous non-blocking I/O workers and Redis batch pipelining.",
      icon: Activity,
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "NeurIPS Open-Source Fast-RAG Benchmark Finalist",
      category: "RESEARCH & LEARNING OUTCOME (SAMPLE)",
      date: "December 2025",
      issuer: "Open Source AI Evaluation Forum",
      verificationId: "RAG-EVAL-TOP-1%",
      description: "Developed and published an open-source retrieval augmented generation evaluation framework that ranked in the top 1% for semantic precision across 100k+ engineering docs.",
      icon: Sparkles,
      badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#F8FAFC] dark:bg-[#08090E] text-slate-900 dark:text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Asymmetric Editorial Layout + Team Hero Visual)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-20 overflow-hidden">
        {/* Ambient illumination beams */}
        <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[550px] h-[350px] bg-violet-600/10 dark:bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[420px] h-[320px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Team Identity, Headline, Intro & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* System Status Pill & Team Identity */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-mono tracking-tight">
              <span className="status-pip bg-violet-500" />
              <span>NEXORA ENGINEERING COLLECTIVE &bull; TALENT OS 2.4</span>
            </div>

            {/* Asymmetric Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Talent, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 dark:from-violet-400 dark:via-cyan-300 dark:to-teal-300">
                Connected by Intelligence.
              </span>
            </h1>

            {/* Concise Introduction */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              We are a collective of senior software engineers and architects building auditable, 5-pillar skill intelligence. 
              Grounded candidate portfolios, code-backed repository verification, and intact team hiring for high-performance engineering organizations.
            </p>

            {/* Primary Action Buttons + Download CV CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              <Link
                href="/recruiter/register"
                className="px-6 py-3.5 rounded-xl text-xs font-semibold tracking-wide uppercase text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <Briefcase size={15} />
                <span>Hire Engineering Talent</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/talent/register"
                className="px-6 py-3.5 rounded-xl text-xs font-semibold tracking-wide uppercase text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/10 hover:border-cyan-500/50 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md transition-all flex items-center justify-center gap-2 group"
              >
                <Code2 size={15} className="text-cyan-500" />
                <span>Join As Developer / Team</span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </Link>

              {/* Download CV Button (Bonus feature) */}
              <a
                href="/team-sample-cv.pdf"
                download="NEXORA-Team-Portfolio-CV.pdf"
                className="px-4 py-3.5 rounded-xl text-xs font-mono font-semibold text-violet-700 dark:text-violet-300 border border-violet-500/30 hover:bg-violet-500/10 transition-all flex items-center gap-1.5"
                title="Download Team Sample CV / Portfolio PDF"
              >
                <Download size={14} />
                <span>Download CV</span>
              </a>
            </div>

            {/* Hero Team Visual Asset (Avatars & Telemetry Row) */}
            <div className="pt-4 flex items-center gap-4 border-t border-slate-200/80 dark:border-white/[0.08] w-full max-w-lg">
              <div className="flex -space-x-2.5 overflow-hidden">
                {teamMembers.map((m, idx) => (
                  <div
                    key={idx}
                    className={`inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#08090E] bg-gradient-to-tr ${m.avatarGradient} text-white flex items-center justify-center font-bold text-[11px] shadow-sm`}
                    title={`${m.name} - ${m.role}`}
                  >
                    {m.avatarInitials}
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>NEXORA Core Collective</span>
                  <span className="status-pip bg-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  4 Core Architects &bull; Available for Enterprise Requisitions
                </div>
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
                      Target Requisition
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
                        <div className="text-[10px] text-slate-500 font-mono">Distributed Systems &bull; 4.5 Yrs</div>
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
          2. ABOUT SECTION (Background, Interests & Core Focus)
          ───────────────────────────────────────────────────────────── */}
      <section id="about" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-100/40 dark:bg-[#0A0D14] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
                <span className="status-pip bg-violet-500" />
                <span>ABOUT NEXORA COLLECTIVE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Engineering Grounded in Verified Execution, Not Buzzwords.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Founded by senior systems engineers, NEXORA bridges the gap between high-performing software talent 
                and forward-thinking engineering enterprises. Traditional hiring is broken by keyword stuffing and spam inboxes; 
                we replace it with deterministic 5-pillar mathematical alignment.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Our core interests span <strong>distributed event streaming</strong>, <strong>high-concurrency Python/FastAPI microservices</strong>, 
                <strong>dense vector ontology search</strong>, and <strong>low-latency reactive interfaces</strong>. Every claim in our portfolio 
                is backed by open source commits, architecture diagrams, and benchmarked metrics.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0D1017]">
                  <div className="text-2xl font-mono font-bold text-violet-600 dark:text-violet-400">17+ Yrs</div>
                  <div className="text-[11px] text-slate-500 font-mono uppercase mt-0.5">Combined Mastery</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0D1017]">
                  <div className="text-2xl font-mono font-bold text-cyan-600 dark:text-cyan-400">25k req/s</div>
                  <div className="text-[11px] text-slate-500 font-mono uppercase mt-0.5">Tested Ingestion</div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0D1017]">
                  <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-500 font-mono uppercase mt-0.5">Auditable Math</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="text-xs font-mono font-bold uppercase text-slate-500">Core Engineering Focus</span>
                  <span className="text-[10px] font-mono text-emerald-500 font-semibold">&bull; PRODUCTION_DEPLOYED</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121722] space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Server size={14} className="text-violet-500" />
                      <span>Distributed Microservices & Event Streams</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Asynchronous ingestion workers built on FastAPI, Tokio, Kafka, and Redis queues with sub-10ms latency.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121722] space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu size={14} className="text-cyan-500" />
                      <span>AI Document Intelligence & RAG Retrieval</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Vision OCR scanning, PyMuPDF extraction, and dense pgvector semantic embedding matching.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121722] space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Code2 size={14} className="text-indigo-500" />
                      <span>Reactive Frontend Architecture</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Next.js 16 App Router, TypeScript, and Tailwind CSS delivering instantaneous dashboard telemetry.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Modality: Remote, Hybrid, or On-Site</span>
                  <Link href="/#contact" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                    Inquire Availability &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          3. SKILLS & TECHNOLOGIES (6+ Technologies & Animated Progress)
          ───────────────────────────────────────────────────────────── */}
      <section id="skills" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#08090E] py-20 relative">
        <span id="skill-taxonomy" className="scroll-mt-24 absolute -top-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
              <span className="status-pip bg-cyan-500" />
              <span>CORE TECHNICAL COMPETENCIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Demonstrated Technologies & Proficiencies
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              At least 6 core software disciplines with verified project proof and proficiency scorecards.
            </p>
          </div>

          {/* Animated Skill Progress Bars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {featuredSkillMetrics.map((skill, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] hover:border-cyan-500/40 transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-semibold">
                    {skill.category}
                  </span>
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {skill.years}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {skill.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                    Proof: {skill.proof}
                  </div>
                </div>

                {/* Animated Skill Progress Indicator */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Proficiency Level</span>
                    <span className="text-slate-900 dark:text-white font-bold">{skill.proficiency}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-cyan-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Taxonomy Ontology Browser */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                12-Category Relational Ontology
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Skills in our inventory track relational intelligence, synonym mapping, and proficiency weights.
              </p>
              <div className="space-y-2">
                {skillCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-violet-500/50 bg-violet-500/10 text-slate-900 dark:text-white"
                          : "border-slate-200/80 dark:border-white/[0.06] bg-white/40 dark:bg-[#0D1017] text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isSelected ? "text-violet-500" : "text-slate-400"} />
                        <span className="text-xs font-semibold">{cat.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="text-xs font-mono font-bold uppercase text-slate-500">
                    {skillCategories.find((c) => c.id === activeCategory)?.label}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-500 font-bold">VERIFIED_ONTOLOGY</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {skillCategories
                    .find((c) => c.id === activeCategory)
                    ?.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-slate-50/60 dark:bg-[#121722]"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {skill}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-500 pt-1.5 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Expert Proof
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          4. FEATURED PROJECTS (3+ Cards, Thumbnails, Tech Filtering & Links)
          ───────────────────────────────────────────────────────────── */}
      <section id="projects" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-100/30 dark:bg-[#0A0D14] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
                <span className="status-pip bg-violet-500" />
                <span>CODE-BACKED PORTFOLIO</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Engineering Deliverables
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                Real codebases and architecture case studies with problem statements, technology tags, and repository links.
              </p>
            </div>

            {/* Project Category Filter Tabs (Bonus feature) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] self-start sm:self-auto overflow-x-auto">
              {[
                { id: "all", label: "All Projects" },
                { id: "ai", label: "AI / ML" },
                { id: "backend", label: "Distributed" },
                { id: "fullstack", label: "Full-Stack" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProjectFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeProjectFilter === tab.id
                      ? "bg-violet-600 text-white font-bold shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] overflow-hidden hover:border-violet-500/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Architecture Visual Preview */}
                  <div className={`w-full h-44 bg-gradient-to-br ${proj.thumbnailBg} p-5 flex flex-col justify-between border-b border-slate-100 dark:border-white/[0.06] relative overflow-hidden`}>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-md border border-white/10">
                        {proj.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        &check; PRODUCTION PROOF
                      </span>
                    </div>

                    {/* Schematic Wireframe Graphics */}
                    <div className="space-y-1 relative z-10 font-mono text-xs">
                      <div className="text-white font-bold text-sm truncate">{proj.title}</div>
                      <div className="text-[11px] text-slate-300 font-mono">{proj.stats}</div>
                    </div>

                    <div className="absolute right-3 bottom-2 opacity-15 text-white pointer-events-none">
                      <Layers size={90} />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121722] border border-slate-200/60 dark:border-white/[0.04] text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      <span className="text-slate-900 dark:text-white font-bold">Problem Solved: </span>
                      {proj.problemSolved}
                    </div>

                    {/* Technology tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="p-5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-violet-500 transition-colors font-semibold"
                  >
                    <GitBranch size={13} />
                    <span>Inspect Codebase</span>
                  </a>

                  <Link
                    href={proj.demoUrl}
                    className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline font-bold"
                  >
                    <span>Interactive Preview</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          5. TEAM MEMBERS SECTION (3+ Member Profiles with Avatars & Roles)
          ───────────────────────────────────────────────────────────── */}
      <section id="team" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#08090E] py-20 relative">
        <span id="team-collective" className="scroll-mt-24 absolute -top-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
              <span className="status-pip bg-cyan-500" />
              <span>COLLECTIVE TEAM ROSTER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Meet the Core Engineers & Architects
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              4 senior individual contributors operating as an intact, verified high-performance software team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] hover:border-cyan-500/30 transition-all space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Avatar & Status */}
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${member.avatarGradient} text-white flex items-center justify-center font-bold text-lg shadow-md`}>
                      {member.avatarInitials}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                      VERIFIED CORE
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </h3>
                    <div className="text-xs text-violet-600 dark:text-violet-400 font-mono font-semibold mt-0.5">
                      {member.role}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {member.location}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {member.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-cyan-500 flex items-center gap-1 transition-colors"
                  >
                    <GitBranch size={12} />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-cyan-500 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={12} />
                    <span>Profile</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          6. ACHIEVEMENTS & MILESTONES (2+ Labeled Sample Content)
          ───────────────────────────────────────────────────────────── */}
      <section id="achievements" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-100/40 dark:bg-[#0A0D14] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              <span className="status-pip bg-violet-500" />
              <span>VERIFIED MILESTONES & CERTIFICATIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Certifications & Engineering Milestones
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Validated credentials, benchmarks, and research milestones (fictional sample credentials labeled).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] hover:border-violet-500/40 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${item.badgeColor}`}>
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <div className="text-xs font-mono text-slate-500 mt-1">
                      {item.issuer} &bull; {item.date}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>ID: {item.verificationId}</span>
                    <span className="text-emerald-500 font-bold">&check; Validated</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          7. AI MATCHING ENGINE DEEP DIVE (Deterministic 5-Pillars)
          ───────────────────────────────────────────────────────────── */}
      <section id="matching-engine" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#08090E] py-20 relative">
        <span id="ai-discovery" className="scroll-mt-24 absolute -top-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400">
              AUDITABLE MATCHING ALGORITHM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Deterministic 5-Pillar Candidate Math
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every score on NEXORA is calculated deterministically with exact weight contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-violet-500">PILLAR 01</span>
                <span className="text-[10px] font-mono bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded">40% WEIGHT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mandatory Skill Gate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Binary gate. Missing any mandatory requirement immediately disqualifies profile from notification dispatch.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-cyan-500">PILLAR 02</span>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded">20% WEIGHT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Code-Backed Project Proof</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Concrete repository code, architectural case studies, and demonstrated problem statement execution.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-indigo-500">PILLAR 03</span>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">20% WEIGHT</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Preferred Technology Stack</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fractional bonus credit for nice-to-have secondary tooling and specialized cloud frameworks.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          8. CTA / CONTACT SECTION (Hire Us / Collaborate + Validated Form)
          ───────────────────────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-100/30 dark:bg-[#0A0D14] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              <span className="status-pip bg-emerald-500" />
              <span>COLLABORATE, CONTACT OR HIRE US</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Start an Engineering Engagement
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Looking to hire our intact development collective, recruit specialized individual architects, or explore technical collaboration? Send us a brief.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Direct Contact Methods & Info */}
            <div className="lg:col-span-5 p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-5">
              <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Direct Contact Channels
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Corporate Email</div>
                    <a
                      href="mailto:contact@nexora.ai"
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-violet-500 transition-colors font-mono"
                    >
                      contact@nexora.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Primary Hubs</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Seattle, WA &bull; Austin, TX &bull; Global Remote
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Response SLA</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Guaranteed within 24 Hours
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Team Sample Portfolio PDF</div>
                <a
                  href="/team-sample-cv.pdf"
                  download="NEXORA-Team-Portfolio-CV.pdf"
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-violet-500 text-xs font-mono font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Download size={14} />
                  <span>Download Team Profile CV</span>
                </a>
              </div>
            </div>

            {/* Interactive Demo Contact Form with Front-End Validation */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Engagement & Inquiry Form
                </h3>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">&bull; FRONTEND_VALIDATED</span>
              </div>

              {contactSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">INQUIRY DISPATCHED SUCCESSFULLY!</div>
                    <div className="text-[11px] mt-0.5">
                      Thank you! Your message has been routed to NEXORA Engineering Collective. Our team lead will reply within 24 hours.
                    </div>
                  </div>
                </div>
              )}

              {contactError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Engagement Scope / Role of Interest
                  </label>
                  <select
                    value={contactTopic}
                    onChange={(e) => setContactTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Hire Developer / Team">Hire Our Development Team / Collective</option>
                    <option value="Individual Architect Placement">Recruit Individual Architect / Developer</option>
                    <option value="Enterprise Platform Partnership">Enterprise Platform Partnership</option>
                    <option value="General Technical Inquiry">General Technical Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Message / Project Parameters *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Briefly outline your architecture timeline, required stack, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-3 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{contactSubmitting ? "TRANSMITTING..." : "DISPATCH INQUIRY"}</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────
          9. FAQ SECTION (Platform Architecture & Integrity)
          ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-24 w-full border-t border-slate-200/80 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#08090E] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-violet-600 dark:text-violet-400">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Platform Architecture & Integrity
            </h2>
          </div>

          <div className="space-y-3">
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
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      faqOpen === idx ? "rotate-180 text-violet-600 dark:text-cyan-400" : "text-slate-400"
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-2.5">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
