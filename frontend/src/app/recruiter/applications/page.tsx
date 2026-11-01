"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ApplicationItem {
  id: number;
  job_id: number;
  job_title: string;
  talent_profile_id: number;
  candidate_name: string;
  headline?: string;
  specialization?: string;
  talent_type: string;
  experience_years: number;
  status: string;
  cover_note?: string;
  recruiter_notes?: string;
  interview_date?: string;
  match_score?: number;
  applied_at: string;
}

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState("under_review");
  const [notes, setNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApps = async () => {
    try {
      const data = await apiRequest<ApplicationItem[]>("/recruiter/applications");
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const openStatusModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setNotes(app.recruiter_notes || "");
    setInterviewDate(app.interview_date ? app.interview_date.split("T")[0] : "");
  };

  const handleUpdatePipeline = async () => {
    if (!selectedApp) return;
    setIsUpdating(true);
    try {
      await apiRequest(`/recruiter/applications/${selectedApp.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          recruiter_notes: notes,
          interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
        }),
      });
      setSelectedApp(null);
      fetchApps();
    } catch (e: any) {
      alert(e.message || "Failed to update pipeline status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const pipelineStages = [
    { label: "All Applications", filter: "all" },
    { label: "Applied", filter: "applied" },
    { label: "Under Review", filter: "under_review" },
    { label: "Shortlisted", filter: "shortlisted" },
    { label: "Interview Scheduled", filter: "interview" },
    { label: "Selected", filter: "selected" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Recruitment Pipeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track candidates through Applied, Under Review, Shortlist, Interview, and Selection.
        </p>
      </div>

      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Candidate & Headline</th>
                <th className="p-4">Opportunity</th>
                <th className="p-4">Match %</th>
                <th className="p-4">Pipeline Status</th>
                <th className="p-4">Cover Note</th>
                <th className="p-4 text-right">Advance Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No applications currently in the pipeline.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {app.candidate_name}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{app.headline}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
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
                    <td className="p-4 max-w-xs truncate text-slate-500">
                      {app.cover_note || "None provided"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openStatusModal(app)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Advance Candidate Pipeline
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              Candidate: <strong>{selectedApp.candidate_name}</strong> for <strong>{selectedApp.job_title}</strong>.
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pipeline Stage
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              >
                <option value="applied">Applied</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview Scheduled</option>
                <option value="selected">Selected / Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {newStatus === "interview" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recruiter Internal Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Evaluation notes, feedback, or interview observations..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 glass-panel"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePipeline}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
              >
                {isUpdating ? "Saving..." : "Save Pipeline Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
