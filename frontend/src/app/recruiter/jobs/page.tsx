"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Briefcase,
  PlusCircle,
  Sparkles,
  Users,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function RecruiterJobsListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const data = await apiRequest<any[]>("/recruiter/jobs");
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePublish = async (jobId: number) => {
    try {
      await apiRequest(`/recruiter/jobs/${jobId}/publish`, { method: "POST" });
      fetchJobs();
    } catch (e) {
      alert("Failed to publish job.");
    }
  };

  const handlePause = async (jobId: number) => {
    try {
      await apiRequest(`/recruiter/jobs/${jobId}/pause`, { method: "POST" });
      fetchJobs();
    } catch (e) {
      alert("Failed to pause job.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Job Opportunities Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your published opportunities, inspect AI candidate matches, and monitor applications.
          </p>
        </div>

        <Link
          href="/recruiter/jobs/create"
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Post New Role
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
            <Briefcase size={36} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No recruitment postings yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first job posting manually or upload a PDF job description for instant extraction.
            </p>
            <Link
              href="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
            >
              <PlusCircle size={15} /> Create Recruitment
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 hover:border-blue-400/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-cyan-400 font-bold">
                      {job.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-500">{job.employment_type}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-500">{job.work_mode}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      job.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : job.status === "paused"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Mandatory:</span>
                {job.mandatory_skills.map((s: string, idx: number) => (
                  <span
                    key={`job-mand-${s}-${idx}`}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Footer Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-bold">
                    <Sparkles size={14} />
                    {job.match_count} Matched Candidates
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {job.application_count} Applications
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === "draft" && (
                    <button
                      onClick={() => handlePublish(job.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1"
                    >
                      <Play size={13} /> Publish Now
                    </button>
                  )}

                  {job.status === "published" && (
                    <button
                      onClick={() => handlePause(job.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1"
                    >
                      <Pause size={13} /> Pause
                    </button>
                  )}

                  <Link
                    href={`/recruiter/jobs/${job.id}/matches`}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm flex items-center gap-1"
                  >
                    Review Matches <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
