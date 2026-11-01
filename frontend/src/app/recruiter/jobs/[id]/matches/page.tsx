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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Job Header */}
      <div className="space-y-2">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft size={14} /> Back to My Jobs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              AI-Matched Talent: {job?.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deterministic ranking based on mandatory skills, preferred tools, and verified project code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full font-mono bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 font-bold">
              {matches.filter((m) => m.eligibility === "eligible").length} Eligible Candidates
            </span>
          </div>
        </div>
      </div>

      {inviteSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>{inviteSuccessNotice}</span>
          <button onClick={() => setInviteSuccessNotice(null)} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Candidate Matches List */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
            <Sparkles size={36} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching profiles found yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our matching engine evaluates active developer and team profiles. Try adjusting mandatory requirements.
            </p>
          </div>
        ) : (
          matches.map((m) => {
            const isEligible = m.eligibility === "eligible";
            const isExpanded = expandedId === m.match_id;

            return (
              <div
                key={m.match_id}
                className={`p-6 rounded-3xl glass-panel border transition-all ${
                  isEligible
                    ? "border-slate-200 dark:border-white/10 hover:border-blue-400/50"
                    : "border-slate-200/50 dark:border-white/5 opacity-70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Candidate Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                        {m.talent_type}
                      </span>
                      {m.has_applied && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Applied
                        </span>
                      )}
                      {m.has_invitation && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                          Invited
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {m.headline || m.specialization}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>{m.experience_years} Years Exp</span>
                      <span>•</span>
                      <span>{m.location || "Remote"}</span>
                    </div>
                  </div>

                  {/* Match Score & Eligibility Badge */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                        {m.match_score.toFixed(0)}%
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Match</span>
                    </div>

                    {isEligible ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={12} /> Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        <ShieldAlert size={12} /> Strict Gate Blocked
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills Breakdown Tags */}
                <div className="space-y-2 pt-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                      Matched Mandatory:
                    </span>
                    {m.matched_mandatory_skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        <CheckCircle2 size={11} /> {s}
                      </span>
                    ))}
                    {m.missing_mandatory_skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-500/20"
                      >
                        <XCircle size={11} /> Missing: {s}
                      </span>
                    ))}
                  </div>

                  {m.matched_preferred_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                        Preferred:
                      </span>
                      {m.matched_preferred_skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          +{s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grounded AI Rationale Snippet */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                    <Sparkles size={13} className="text-blue-500 dark:text-cyan-400" />
                    <span>Technical Match Rationale</span>
                  </div>
                  {m.explanation}
                </div>

                {/* Expanded Details: 5-Pillar Score Breakdown & Portfolio Evidence */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-4 animate-in fade-in duration-150">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono mb-2">
                        Deterministic 5-Pillar Breakdown:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] text-slate-500">Mandatory (40%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.mandatory ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] text-slate-500">Preferred (20%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.preferred ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] text-slate-500">Projects (20%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.projects ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] text-slate-500">Experience (10%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.experience ?? 0}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                          <div className="text-[10px] text-slate-500">Availability (10%)</div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                            {m.score_breakdown?.availability ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Relevant Projects */}
                    {m.relevant_projects.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">
                          Demonstrated Portfolio Projects:
                        </div>
                        <div className="space-y-2">
                          {m.relevant_projects.map((proj, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <FolderGit2 size={16} className="text-blue-500" />
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {proj.title}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                {proj.relevance}% Stack Overlap
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : m.match_id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        Less Details <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        Deep Score Audit <ChevronDown size={14} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInviteModalCandidate(m)}
                      disabled={m.has_invitation}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={12} />
                      {m.has_invitation ? "Invitation Dispatched" : "Send Invitation"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dispatch Recruitment Invitation
              </h3>
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300">
              Inviting <strong>{inviteModalCandidate.name}</strong> ({inviteModalCandidate.match_score.toFixed(0)}% match) to apply for <strong>{job?.title}</strong>.
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Personalized Recruiter Message
              </label>
              <textarea
                rows={4}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 glass-panel"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={sendingInvite}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md flex items-center gap-1.5"
              >
                {sendingInvite ? "Dispatching..." : "Send Targeted Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
