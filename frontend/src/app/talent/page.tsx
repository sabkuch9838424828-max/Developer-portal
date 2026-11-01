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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-50/50 via-slate-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Developer Talent Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Precision recruitment opportunities matched to your verified skills and portfolio code.
          </p>
        </div>

        <Link
          href="/talent/opportunities"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles size={16} />
          View Matched Roles ({stats?.matched_opportunities ?? 0})
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Matched Roles</span>
            <Sparkles size={16} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
            {stats?.matched_opportunities ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">&ge; 75% compatibility</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Applications</span>
            <Briefcase size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {stats?.applications_submitted ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Submitted & tracked</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Invitations</span>
            <Mail size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {stats?.active_invitations ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Direct recruiter invites</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Skills & Projects</span>
            <FolderGit2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats?.skills_count ?? 0} / {stats?.projects_count ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Verified portfolio evidence</p>
        </div>
      </div>

      {/* Top AI Matched Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-500" />
            Top Matching Opportunities
          </h2>
          <Link
            href="/talent/opportunities"
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Explore all ({opportunities.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.slice(0, 4).map((opp) => (
            <div
              key={opp.job_id}
              className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-3 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    {opp.company_name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {opp.job_title}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                    {opp.match_score.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Match</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>{opp.employment_type}</span>
                <span>•</span>
                <span>{opp.work_mode}</span>
                {opp.compensation_range && (
                  <>
                    <span>•</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {opp.compensation_range}
                    </span>
                  </>
                )}
              </div>

              {/* Matched skills tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {opp.matched_mandatory_skills.map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-semibold"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 pt-1">
                {opp.explanation}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Strict Eligibility Gate Passed
                </span>
                <Link
                  href="/talent/opportunities"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Review & Apply <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Showcase Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderGit2 size={16} className="text-blue-500" />
            Your Project Portfolio
          </h2>
          <Link
            href="/talent/projects"
            className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            Manage projects ({projects.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-5 rounded-2xl glass-panel space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {proj.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {proj.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {proj.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {proj.technologies.map((t: string) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
