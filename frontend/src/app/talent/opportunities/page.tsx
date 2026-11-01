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
  Terminal,
  Activity,
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
  supporting_evidence?: { skill: string; evidence: string; source: string }[];
  has_active_resume?: boolean;
  active_resume_filename?: string;
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
      let data: OpportunityItem[];
      try {
        data = await apiRequest<OpportunityItem[]>("/talent/opportunities/matches");
      } catch {
        data = await apiRequest<OpportunityItem[]>("/talent/opportunities");
      }
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
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
          <span className="status-pip bg-cyan-500" />
          <span>STRICT MATCH INBOX // THRESHOLD &ge; 75%</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Intelligent Opportunity Inbox
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          Only positions where your profile passed all mandatory gates and exceeded the compatibility threshold are surfaced here.
        </p>
      </div>

      {appliedSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span>{appliedSuccessNotice}</span>
          <button onClick={() => setAppliedSuccessNotice(null)} className="font-bold hover:underline">
            DISMISS
          </button>
        </div>
      )}

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-3">
            <Sparkles size={32} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching roles currently active
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Add more verified skills and portfolio code to expand your automated matching eligibility.
            </p>
          </div>
        ) : (
          opportunities.map((opp) => {
            const isExpanded = expandedId === opp.job_id;

            return (
              <div
                key={opp.job_id}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4 hover:border-cyan-500/30 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-slate-500">
                        {opp.company_name}
                      </span>
                      {opp.is_invited && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold border border-violet-500/20">
                          DIRECT INVITATION
                        </span>
                      )}
                      {opp.has_applied && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          APPLIED ({opp.application_status})
                        </span>
                      )}
                      {opp.has_active_resume && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20 flex items-center gap-1">
                          <Sparkles size={10} /> CV ENRICHED
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {opp.job_title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono text-[11px]">
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
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-baseline gap-1 self-start sm:self-auto">
                    <span className="text-3xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                      {opp.match_score.toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">FIT</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                    Verified Competencies:
                  </span>
                  {opp.matched_mandatory_skills.map((s, idx) => (
                    <span
                      key={`mand-${s}-${idx}`}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      <CheckCircle2 size={10} /> {s}
                    </span>
                  ))}
                  {opp.matched_preferred_skills.map((s, idx) => (
                    <span
                      key={`pref-${s}-${idx}`}
                      className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                    >
                      +{s}
                    </span>
                  ))}
                </div>

                {/* Grounded Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121722] border border-slate-200/60 dark:border-white/[0.04] text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                    <Terminal size={12} />
                    <span>DETERMINISTIC_MATCH_RATIONALE</span>
                  </div>
                  {opp.explanation}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                    <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase">
                      5-Pillar Score Distribution:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                        <div className="text-[10px] font-mono text-slate-500">Mandatory (40%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.mandatory ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                        <div className="text-[10px] font-mono text-slate-500">Preferred (20%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.preferred ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                        <div className="text-[10px] font-mono text-slate-500">Projects (20%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.projects ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                        <div className="text-[10px] font-mono text-slate-500">Experience (10%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.experience ?? 0}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                        <div className="text-[10px] font-mono text-slate-500">Availability (10%)</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {opp.score_breakdown?.availability ?? 0}
                        </div>
                      </div>
                    </div>

                    {/* Verified Resume Evidence */}
                    {opp.supporting_evidence && opp.supporting_evidence.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1.5">
                          <Sparkles size={12} /> Supporting Evidence from Verified Resume:
                        </div>
                        <div className="space-y-1.5">
                          {opp.supporting_evidence.map((ev, eIdx) => (
                            <div
                              key={eIdx}
                              className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50 dark:bg-[#121722] text-[11px] font-mono text-slate-700 dark:text-slate-300"
                            >
                              <span className="font-bold text-violet-600 dark:text-violet-400 mr-2">{ev.skill}:</span>
                              <span className="italic">"{ev.evidence}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : opp.job_id)}
                    className="text-xs font-mono font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        COLLAPSE AUDIT <ChevronUp size={13} />
                      </>
                    ) : (
                      <>
                        SCORE AUDIT LOG <ChevronDown size={13} />
                      </>
                    )}
                  </button>

                  <div>
                    {opp.has_applied ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Check size={13} /> APPLICATION FILED
                      </span>
                    ) : (
                      <button
                        onClick={() => setApplyModalJob(opp)}
                        className="px-5 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm flex items-center gap-1.5"
                      >
                        <Send size={12} /> 1-CLICK APPLY
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Submit Engineering Application
              </h3>
              <button onClick={() => setApplyModalJob(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-700 dark:text-cyan-300">
              Applying for <strong>{applyModalJob.job_title}</strong> at <strong>{applyModalJob.company_name}</strong> (Match: {applyModalJob.match_score.toFixed(0)}%).
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Optional Architecture Note or Context
              </label>
              <textarea
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Highlight your relevant repository architectures and problem solving..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setApplyModalJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-6 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md flex items-center gap-1.5"
              >
                {isApplying ? "SUBMITTING..." : "CONFIRM APPLICATION"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
