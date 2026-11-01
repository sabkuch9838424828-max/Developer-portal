"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  Send,
  FolderGit2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Mail,
  User,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
} from "lucide-react";

interface CandidateMatch {
  match_id: number;
  talent_profile_id: number;
  user_id: number;
  name: string;
  headline?: string;
  specialization?: string;
  talent_type: string;
  experience_years: number;
  location?: string;
  match_score: number;
  eligibility: string;
  matched_mandatory_skills: string[];
  missing_mandatory_skills: string[];
  matched_preferred_skills: string[];
  missing_preferred_skills: string[];
  relevant_projects: any[];
  score_breakdown: Record<string, number>;
  explanation: string;
  skills: string[];
  has_applied: boolean;
  has_invitation: boolean;
  application_status?: string;
}

export default function CandidateMatchesPage() {
  const params = useParams();
  const jobId = params?.id;

  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Invitation Modal State
  const [inviteModalCandidate, setInviteModalCandidate] = useState<CandidateMatch | null>(null);
  const [inviteMessage, setInviteMessage] = useState(
    "We reviewed your technical background and portfolio projects, and would love to invite you to discuss this role."
  );
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccessNotice, setInviteSuccessNotice] = useState<string | null>(null);

  const fetchMatches = async () => {
    if (!jobId) return;
    try {
      const [jobData, matchesData] = await Promise.all([
        apiRequest<any>(`/recruiter/jobs/${jobId}`),
        apiRequest<CandidateMatch[]>(`/recruiter/jobs/${jobId}/matches`),
      ]);
      setJob(jobData);
      setMatches(matchesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [jobId]);

  const handleSendInvite = async () => {
    if (!inviteModalCandidate || !jobId) return;
    setSendingInvite(true);
    try {
      await apiRequest("/recruiter/invitations", {
        method: "POST",
        body: JSON.stringify({
          job_id: parseInt(jobId as string),
          talent_profile_id: inviteModalCandidate.talent_profile_id,
          message: inviteMessage,
        }),
      });

      setInviteSuccessNotice(`Invitation successfully dispatched to ${inviteModalCandidate.name}!`);
      setInviteModalCandidate(null);
      fetchMatches();
    } catch (e: any) {
      alert(e.message || "Failed to dispatch invitation.");
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb & Job Header */}
      <div className="space-y-2">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-violet-500 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Active Requisitions
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-violet-600 dark:text-violet-400 font-bold">
              <span className="status-pip bg-emerald-500" />
              <span>RADAR_TELEMETRY // ID #{jobId}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Candidate Alignment: {job?.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Deterministic 5-pillar scoring • Mandatory gate compliance • Auditable math
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold border border-violet-500/20">
              {matches.filter((m) => m.eligibility === "eligible").length} ELIGIBLE MATCHES
            </span>
          </div>
        </div>
      </div>

      {inviteSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span>{inviteSuccessNotice}</span>
          <button onClick={() => setInviteSuccessNotice(null)} className="font-bold hover:underline">
            DISMISS
          </button>
        </div>
      )}

      {/* Candidate Matches List */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-3">
            <Sparkles size={32} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching profiles found
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Our 5-pillar matching engine evaluated registered profiles. Try broadening the mandatory criteria.
            </p>
          </div>
        ) : (
          matches.map((m) => {
            const isEligible = m.eligibility === "eligible";
            const isExpanded = expandedId === m.match_id;

            return (
              <div
                key={m.match_id}
                className={`p-6 rounded-2xl border transition-all ${
                  isEligible
                    ? "border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] hover:border-violet-500/30 shadow-sm"
                    : "border-slate-200/40 dark:border-white/[0.04] bg-slate-50/50 dark:bg-[#0D1017]/60 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Candidate Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 uppercase font-semibold">
                        {m.talent_type}
                      </span>
                      {m.has_applied && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          APPLIED
                        </span>
                      )}
                      {m.has_invitation && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold border border-violet-500/20">
                          INVITED
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {m.headline || m.specialization}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span>{m.experience_years} Yrs Exp</span>
                      <span>&bull;</span>
                      <span>{m.location || "Remote"}</span>
                    </div>
                  </div>

                  {/* Match Score & Eligibility Badge */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-extrabold text-violet-600 dark:text-cyan-400">
                        {m.match_score.toFixed(0)}%
                      </span>
                      <span className="text-xs text-slate-400 font-mono">FIT</span>
                    </div>

                    {isEligible ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <ShieldCheck size={11} /> GATE_PASSED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <ShieldAlert size={11} /> GATE_BLOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills Breakdown Tags */}
                <div className="space-y-2 pt-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                      Mandatory Gate:
                    </span>
                    {m.matched_mandatory_skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        <CheckCircle2 size={10} /> {s}
                      </span>
                    ))}
                    {m.missing_mandatory_skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                      >
                        <XCircle size={10} /> Missing: {s}
                      </span>
                    ))}
                  </div>

                  {m.matched_preferred_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                        Preferred Stack:
                      </span>
                      {m.matched_preferred_skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                        >
                          +{s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explainability Rationale */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#121722] border border-slate-200/60 dark:border-white/[0.04] text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-violet-600 dark:text-violet-400 mb-1">
                    <Terminal size={12} />
                    <span>DETERMINISTIC_EXPLAINABILITY_LOG</span>
                  </div>
                  {m.explanation}
                </div>

                {/* Expanded Details: 5-Pillar Score Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase mb-2">
                        5-Pillar Mathematical Allocation:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                          <div className="text-[10px] font-mono text-slate-500">Mandatory (40%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.mandatory ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                          <div className="text-[10px] font-mono text-slate-500">Preferred (20%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.preferred ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                          <div className="text-[10px] font-mono text-slate-500">Projects (20%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.projects ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                          <div className="text-[10px] font-mono text-slate-500">Experience (10%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.experience ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50 dark:bg-[#121722]">
                          <div className="text-[10px] font-mono text-slate-500">Availability (10%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.availability ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Relevant Projects */}
                    {m.relevant_projects.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase">
                          Demonstrated Code Evidence:
                        </div>
                        <div className="space-y-2">
                          {m.relevant_projects.map((proj, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.04] bg-slate-50 dark:bg-[#121722] text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <FolderGit2 size={15} className="text-violet-500" />
                                <span className="font-semibold text-slate-900 dark:text-white font-mono text-[11px]">
                                  {proj.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                {proj.relevance}% Stack Overlap
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : m.match_id)}
                    className="text-xs font-mono font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        COLLAPSE AUDIT <ChevronUp size={13} />
                      </>
                    ) : (
                      <>
                        DEEP AUDIT LOG <ChevronDown size={13} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInviteModalCandidate(m)}
                      disabled={m.has_invitation}
                      className="px-4 py-1.5 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={12} />
                      {m.has_invitation ? "INVITATION DISPATCHED" : "DISPATCH INVITATION"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SEND INVITATION MODAL */}
      {inviteModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Dispatch Targeted Invitation
              </h3>
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-700 dark:text-violet-300 font-mono">
              Inviting <strong>{inviteModalCandidate.name}</strong> ({inviteModalCandidate.match_score.toFixed(0)}% match) to review and apply for <strong>{job?.title}</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Recruiter Direct Message
              </label>
              <textarea
                rows={4}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={sendingInvite}
                className="px-5 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md flex items-center gap-1.5"
              >
                {sendingInvite ? "DISPATCHING..." : "CONFIRM DISPATCH"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
