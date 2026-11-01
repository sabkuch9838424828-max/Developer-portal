"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Sparkles,
  Briefcase,
  Mail,
  Zap,
  FolderGit2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";

interface TalentStats {
  matched_opportunities: number;
  applications_submitted: number;
  active_invitations: number;
  profile_completion_percentage: number;
  skills_count: number;
  projects_count: number;
}

export default function TalentOverviewPage() {
  const [stats, setStats] = useState<TalentStats | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [statsData, oppsData, projsData] = await Promise.all([
          apiRequest<TalentStats>("/talent/dashboard"),
          apiRequest<any[]>("/talent/opportunities"),
          apiRequest<any[]>("/talent/projects"),
        ]);
        setStats(statsData);
        setOpportunities(oppsData);
        setProjects(projsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
            <span className="status-pip bg-cyan-500" />
            <span>DEVELOPER_TALENT_OS // ACTIVE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Developer Talent Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Precision recruitment opportunities matched strictly to your verified skills, project code, and team proficiencies.
          </p>
        </div>

        <Link
          href="/talent/opportunities"
          className="px-5 py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/25 transition-all flex items-center gap-2 shrink-0 relative z-10"
        >
          <Sparkles size={15} />
          <span>Matched Roles ({stats?.matched_opportunities ?? 0})</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Matched Roles</span>
            <Sparkles size={15} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
            {stats?.matched_opportunities ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">&ge; 75% compatibility</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Applications</span>
            <Briefcase size={15} className="text-violet-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {stats?.applications_submitted ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Submitted & tracked</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Recruiter Invites</span>
            <Mail size={15} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats?.active_invitations ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Targeted invitations</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Skills / Code</span>
            <FolderGit2 size={15} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats?.skills_count ?? 0} / {stats?.projects_count ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Demonstrated assets</p>
        </div>

      </div>

      {/* Top AI Matched Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Top Compatible Positions
            </h2>
            <span className="text-[10px] font-mono text-slate-400">({opportunities.length})</span>
          </div>
          <Link
            href="/talent/opportunities"
            className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.length === 0 ? (
            <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs font-mono">
              No matching positions at or above the 75% threshold yet. Expand your verified skills to surface more opportunities.
            </div>
          ) : (
            opportunities.slice(0, 4).map((opp) => (
              <div
                key={opp.job_id}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-3 hover:border-cyan-500/30 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                      {opp.company_name}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {opp.job_title}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                      {opp.match_score.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">FIT</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono text-[11px]">
                  <span>{opp.employment_type}</span>
                  <span>&bull;</span>
                  <span>{opp.work_mode}</span>
                  {opp.compensation_range && (
                    <>
                      <span>&bull;</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        {opp.compensation_range}
                      </span>
                    </>
                  )}
                </div>

                {/* Matched skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.matched_mandatory_skills.map((s: string, idx: number) => (
                    <span
                      key={`${s}-${idx}`}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-semibold"
                    >
                      &check; {s}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 pt-1 font-mono text-[11px]">
                  {opp.explanation}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    &check; Mandatory Gate Passed
                  </span>
                  <Link
                    href="/talent/opportunities"
                    className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect & Apply</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Projects Showcase Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Demonstrated Code Proof
            </h2>
            <span className="text-[10px] font-mono text-slate-400">({projects.length})</span>
          </div>
          <Link
            href="/talent/projects"
            className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline"
          >
            Manage repositories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs font-mono">
              No code projects registered yet. Link your GitHub repositories to boost project alignment scores.
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-2 hover:border-violet-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {proj.title}
                  </h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    {proj.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.technologies.map((t: string, idx: number) => (
                    <span
                      key={`${t}-${idx}`}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
