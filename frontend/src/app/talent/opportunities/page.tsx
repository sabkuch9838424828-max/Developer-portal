"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  Send,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
} from "lucide-react";

interface OpportunityItem {
  job_id: number;
  job_title: string;
  company_name: string;
  company_logo?: string;
  employment_type: string;
  work_mode: string;
  location?: string;
  compensation_range?: string;
  match_score: number;
  eligibility: string;
  matched_mandatory_skills: string[];
  missing_mandatory_skills: string[];
  matched_preferred_skills: string[];
  missing_preferred_skills: string[];
  score_breakdown: Record<string, number>;
  explanation: string;
  deadline?: string;
  has_applied: boolean;
  application_status?: string;
  is_invited: boolean;
}

export default function TalentOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Apply Modal State
  const [applyModalJob, setApplyModalJob] = useState<OpportunityItem | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccessNotice, setAppliedSuccessNotice] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      const data = await apiRequest<OpportunityItem[]>("/talent/opportunities");
      setOpportunities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleApply = async () => {
    if (!applyModalJob) return;
    setIsApplying(true);
    try {
      await apiRequest(`/talent/opportunities/${applyModalJob.job_id}/apply`, {
        method: "POST",
        body: JSON.stringify({ cover_note: coverNote }),
      });

      setAppliedSuccessNotice(`Successfully applied to ${applyModalJob.job_title} at ${applyModalJob.company_name}!`);
      setApplyModalJob(null);
      setCoverNote("");
      fetchOpportunities();
    } catch (e: any) {
      alert(e.message || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Intelligent Opportunity Inbox
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Only roles where you pass the strict eligibility gates and meet the 75% match threshold appear here.
        </p>
      </div>

      {appliedSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{appliedSuccessNotice}</span>
          <button onClick={() => setAppliedSuccessNotice(null)} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
            <Sparkles size={36} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching roles currently active
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add more verified skills and portfolio projects to expand your automated matching eligibility.
            </p>
          </div>
        ) : (
          opportunities.map((opp) => {
            const isExpanded = expandedId === opp.job_id;

            return (
              <div
                key={opp.job_id}
                className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-slate-500">
                        {opp.company_name}
                      </span>
                      {opp.is_invited && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
                          Direct Recruiter Invitation
                        </span>
                      )}
                      {opp.has_applied && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                          Application Submitted ({opp.application_status})
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {opp.job_title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
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
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-baseline gap-1 self-start sm:self-auto">
                    <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                      {opp.match_score.toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Match</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                    Your Verified Skills:
                  </span>
                  {opp.matched_mandatory_skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      <CheckCircle2 size={11} /> {s}
                    </span>
                  ))}
                  {opp.matched_preferred_skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      +{s}
                    </span>
                  ))}
                </div>

                {/* Grounded Explanation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                    <Sparkles size={13} className="text-cyan-500" />
                    <span>Why You Match This Opportunity</span>
                  </div>
                  {opp.explanation}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3 animate-in fade-in duration-150">
                    <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">
                      Deterministic Compatibility Breakdown:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] text-slate-500">Mandatory (40%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.mandatory ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] text-slate-500">Preferred (20%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.preferred ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] text-slate-500">Projects (20%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.projects ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] text-slate-500">Experience (10%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.experience ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] text-slate-500">Availability (10%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.availability ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : opp.job_id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        Less Details <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        View Scoring Breakdown <ChevronDown size={14} />
                      </>
                    )}
                  </button>

                  <div>
                    {opp.has_applied ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        <Check size={14} /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setApplyModalJob(opp)}
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 flex items-center gap-1.5"
                      >
                        <Send size={13} /> 1-Click Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* APPLY MODAL */}
      {applyModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Application
              </h3>
              <button onClick={() => setApplyModalJob(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 text-xs text-cyan-800 dark:text-cyan-300">
              Applying for <strong>{applyModalJob.job_title}</strong> at <strong>{applyModalJob.company_name}</strong> (Match: {applyModalJob.match_score.toFixed(0)}%).
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Optional Cover Note or Relevant Highlights
              </label>
              <textarea
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Briefly highlight why your background fits this role..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setApplyModalJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 glass-panel"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md flex items-center gap-1.5"
              >
                {isApplying ? "Submitting..." : "Confirm & Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
