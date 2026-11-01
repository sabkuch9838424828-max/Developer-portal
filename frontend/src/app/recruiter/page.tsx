"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Briefcase,
  Users,
  FileCheck,
  Clock,
  ArrowRight,
  PlusCircle,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Activity,
  Terminal,
} from "lucide-react";

interface DashboardStats {
  active_jobs: number;
  total_matched_profiles: number;
  applications_received: number;
  shortlisted_candidates: number;
  pending_responses: number;
  closed_opportunities: number;
}

export default function RecruiterDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, jobsData, appsData] = await Promise.all([
          apiRequest<DashboardStats>("/recruiter/dashboard"),
          apiRequest<any[]>("/recruiter/jobs"),
          apiRequest<any[]>("/recruiter/applications"),
        ]);
        setStats(statsData);
        setJobs(jobsData);
        setApplications(appsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Recruiter Command Center Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-[11px] font-mono text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">
            <span className="status-pip bg-emerald-500" />
            <span>OPERATIONAL // PIPELINE READY</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruiter Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Ingest multimodal specifications, review deterministic 5-pillar candidate matches, and orchestrate engineering hiring.
          </p>
        </div>

        <Link
          href="/recruiter/jobs/create"
          className="px-5 py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all flex items-center gap-2 shrink-0 relative z-10"
        >
          <PlusCircle size={15} />
          <span>Create Recruitment</span>
        </Link>
      </div>

      {/* High-Precision Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Requisitions</span>
            <Briefcase size={15} className="text-violet-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {stats?.active_jobs ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Published opportunities</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">AI Matched Profiles</span>
            <Sparkles size={15} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
            {stats?.total_matched_profiles ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">&ge; 75% match threshold</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Direct Applications</span>
            <Users size={15} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            {stats?.applications_received ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">{stats?.pending_responses ?? 0} awaiting review</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Shortlisted</span>
            <CheckCircle size={15} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats?.shortlisted_candidates ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">In interview pipeline</p>
        </div>

      </div>

      {/* Active Jobs & Candidate Matching Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Active Job Requisitions
            </h2>
            <span className="text-[10px] font-mono text-slate-400">({jobs.length})</span>
          </div>
          <Link href="/recruiter/jobs" className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs">
              No active job requisitions published. Click &ldquo;Create Recruitment&rdquo; to ingest your first role specification.
            </div>
          ) : (
            jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] hover:border-violet-500/30 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold">
                      {job.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {job.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      job.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {job.mandatory_skills.map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {job.match_count} matched &bull; {job.application_count} applied
                  </span>
                  <Link
                    href={`/recruiter/jobs/${job.id}/matches`}
                    className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Radar</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Applicant Telemetry Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Pipeline Candidate Stream
            </h2>
          </div>
          <Link href="/recruiter/applications" className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Manage pipeline &rarr;
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-[#121722] text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">Candidate Profile</th>
                  <th className="p-4">Applied Role</th>
                  <th className="p-4">Match Fit</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500 font-mono text-xs">
                      No candidate applications currently in review pipeline.
                    </td>
                  </tr>
                ) : (
                  applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {app.candidate_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{app.headline}</div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {app.job_title}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {app.match_score ? `${app.match_score}%` : "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/recruiter/jobs/${app.job_id}/matches`}
                          className="text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          View Radar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
