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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Action Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-blue-500/20 bg-gradient-to-r from-blue-50/50 via-slate-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:via-slate-900/40 dark:to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recruiter Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish requirements, review AI-parsed candidates, and manage your engineering pipeline.
          </p>
        </div>

        <Link
          href="/recruiter/jobs/create"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={16} />
          Create Recruitment
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Jobs</span>
            <Briefcase size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {stats?.active_jobs ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Published opportunities</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Matched Profiles</span>
            <Sparkles size={16} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
            {stats?.total_matched_profiles ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">&ge; 75% match threshold</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Applications</span>
            <Users size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {stats?.applications_received ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">{stats?.pending_responses ?? 0} awaiting review</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Shortlisted</span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats?.shortlisted_candidates ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">In interview pipeline</p>
        </div>
      </div>

      {/* Active Jobs & Matched Talent Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Active Job Opportunities
          </h2>
          <Link href="/recruiter/jobs" className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
            View all ({jobs.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 4).map((job) => (
            <div key={job.id} className="p-5 rounded-2xl glass-panel space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-cyan-400 font-bold">
                    {job.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {job.title}
                  </h3>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
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
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  {job.match_count} matched • {job.application_count} applied
                </span>
                <Link
                  href={`/recruiter/jobs/${job.id}/matches`}
                  className="font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  View Matches <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Applications
          </h2>
          <Link href="/recruiter/applications" className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
            Manage pipeline
          </Link>
        </div>

        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Match Score</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No applications received yet.
                    </td>
                  </tr>
                ) : (
                  applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {app.candidate_name}
                        </div>
                        <div className="text-[11px] text-slate-500">{app.headline}</div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {app.job_title}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {app.match_score ? `${app.match_score}%` : "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/recruiter/jobs/${app.job_id}/matches`}
                          className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                        >
                          Review Profile
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
