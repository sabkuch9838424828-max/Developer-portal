"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Briefcase, Clock, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ApplicationRecord {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  employment_type: string;
  work_mode: string;
  location?: string;
  status: string;
  applied_at: string;
  interview_date?: string;
}

export default function TalentApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await apiRequest<ApplicationRecord[]>("/talent/applications");
        setApplications(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500/20";
      case "interview":
        return "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-500/20";
      case "selected":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case "rejected":
        return "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Application Tracking Pipeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your application lifecycle across Applied, Under Review, Shortlist, and Interview stages.
        </p>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
            <Briefcase size={36} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No applications submitted yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse AI-matched opportunities and apply to roles with high compatibility scores.
            </p>
            <Link
              href="/talent/opportunities"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500"
            >
              Browse Matched Roles <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                    {app.company_name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {app.job_title}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    {app.employment_type} • {app.work_mode}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {app.interview_date && (
                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 text-xs text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
                  <Calendar size={15} />
                  <span>
                    Interview Scheduled for:{" "}
                    <strong>{app.interview_date.split("T")[0]}</strong>
                  </span>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                Applied on {app.applied_at ? app.applied_at.split("T")[0] : "Recently"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
