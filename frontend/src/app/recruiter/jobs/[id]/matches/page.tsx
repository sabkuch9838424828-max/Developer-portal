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
  FileText,
  Download,
  Eye,
  SlidersHorizontal,
  X,
  Check,
  Lock,
  Globe
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
  has_resume?: boolean;
  resume_id?: number;
  resume_visibility?: string;
  resume_filename?: string;
  evidence_count?: number;
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

  // Comparison State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Evidence Drilldown State
  const [evidenceCandidate, setEvidenceCandidate] = useState<CandidateMatch | null>(null);
  const [evidenceData, setEvidenceData] = useState<any | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const toggleSelectCandidate = (candId: number) => {
    setSelectedIds((prev) =>
      prev.includes(candId) ? prev.filter((id) => id !== candId) : [...prev, candId]
    );
  };

  const handleOpenComparison = async () => {
    if (selectedIds.length < 2) {
      alert("Please select at least 2 candidates to compare.");
      return;
    }
    setLoadingComparison(true);
    setComparisonModalOpen(true);
    try {
      const data = await apiRequest("/recruiter/candidates/compare", {
        method: "POST",
        body: JSON.stringify({
          job_id: parseInt(jobId as string),
          candidate_ids: selectedIds,
        }),
      });
      setComparisonData(data);
    } catch (e: any) {
      alert(e.message || "Failed to compare candidates.");
      setComparisonModalOpen(false);
    } finally {
      setLoadingComparison(false);
    }
  };

  const handleOpenEvidence = async (candidate: CandidateMatch) => {
    setEvidenceCandidate(candidate);
    setLoadingEvidence(true);
    try {
      const data = await apiRequest(
        `/recruiter/jobs/${jobId}/candidate-matches/${candidate.talent_profile_id}/evidence`
      );
      setEvidenceData(data);
    } catch (e: any) {
      alert(e.message || "Failed to fetch candidate match evidence.");
    } finally {
      setLoadingEvidence(false);
    }
  };

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

          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.length >= 2 && (
              <button
                onClick={handleOpenComparison}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
              >
                <SlidersHorizontal size={13} />
                <span>COMPARE SELECTED ({selectedIds.length})</span>
              </button>
            )}
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
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.talent_profile_id)}
                        onChange={() => toggleSelectCandidate(m.talent_profile_id)}
                        className="h-4 w-4 rounded accent-violet-600 cursor-pointer"
                        title="Select for side-by-side comparison"
                      />
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 uppercase font-semibold">
                        {m.talent_type}
                      </span>
                      {m.has_resume && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20 flex items-center gap-1">
                          <FileText size={10} /> CV VERIFIED ({m.evidence_count || 0})
                        </span>
                      )}
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

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenEvidence(m)}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>EVIDENCE CITATIONS</span>
                    </button>

                    {m.has_resume && (
                      <a
                        href={`http://localhost:8000/api/v1/recruiter/candidates/${m.talent_profile_id}/resume`}
                        download
                        className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] flex items-center gap-1.5 transition"
                      >
                        <Download size={12} />
                        <span>CV FILE</span>
                      </a>
                    )}

                    <button
                      onClick={() => setInviteModalCandidate(m)}
                      disabled={m.has_invitation}
                      className="px-4 py-1.5 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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

      {/* ====================================================================== */}
      {/* SIDE-BY-SIDE CANDIDATE COMPARISON MODAL                               */}
      {/* ====================================================================== */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0B0E14] border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E121B] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Candidate Comparison Matrix: {job?.title}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Comparing {comparisonData?.candidate_count || selectedIds.length} candidate profiles side-by-side grounded in verified evidence.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setComparisonModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            {/* Non-discrimination compliance note */}
            <div className="px-6 py-2.5 bg-violet-950/30 border-b border-violet-500/10 text-[11px] font-mono text-violet-300 flex items-center gap-2 shrink-0">
              <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
              <span>
                <strong>Zero Demographic Bias:</strong> Ranking and compatibility metrics are calculated deterministically strictly from verified skills, code projects, and documented engineering experience. Protected demographic characteristics are never captured or evaluated.
              </span>
            </div>

            {loadingComparison ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Activity size={24} className="animate-spin text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">CALCULATING_SIDE_BY_SIDE_MATRIX...</span>
              </div>
            ) : comparisonData ? (
              <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
                <div className="grid grid-flow-col auto-cols-[320px] gap-4 min-w-full">
                  {comparisonData.candidates?.map((cand: any) => (
                    <div
                      key={cand.candidate_id}
                      className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between space-y-4"
                    >
                      {/* Identity & Score */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-white font-mono">{cand.name}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{cand.headline || cand.specialization}</p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-1">
                              <span>{cand.experience_years} Yrs Exp</span>
                              <span>•</span>
                              <span>{cand.location || "Remote"}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-mono font-extrabold text-cyan-400">
                              {cand.match_score.toFixed(0)}%
                            </span>
                            <div>
                              {cand.eligibility === "eligible" ? (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                  GATE PASSED
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                                  GATE BLOCKED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mandatory Coverage Meter */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Mandatory Alignment</span>
                            <span className="text-emerald-400 font-bold">{cand.mandatory_coverage_percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${cand.mandatory_coverage_percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Preferred Coverage Meter */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Preferred Alignment</span>
                            <span className="text-violet-400 font-bold">{cand.preferred_coverage_percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${cand.preferred_coverage_percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Matched Mandatory Skills */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-slate-500">Verified Mandatory:</span>
                          <div className="flex flex-wrap gap-1">
                            {cand.matched_mandatory?.map((s: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                                ✓ {s}
                              </span>
                            ))}
                            {cand.missing_mandatory?.map((s: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono">
                                ✗ {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Resume Verified Skills */}
                        {cand.resume_verified_skills?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase text-cyan-400">Resume-Documented:</span>
                            <div className="flex flex-wrap gap-1">
                              {cand.resume_verified_skills.map((s: string, idx: number) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-mono">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects Proof */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-slate-500">Demonstrated Projects:</span>
                          <div className="space-y-1">
                            {cand.relevant_projects?.slice(0, 2).map((p: any, idx: number) => (
                              <div key={idx} className="p-2 rounded bg-black/40 text-[10px] font-mono text-slate-300 border border-white/5">
                                <div className="font-bold text-white">{p.title}</div>
                                <div className="text-slate-400 line-clamp-1">{p.matched_technologies?.join(", ")}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Download CV with Privacy Check */}
                      <div className="pt-3 border-t border-white/10 space-y-1">
                        {cand.has_resume ? (
                          cand.can_view_resume ? (
                            <a
                              href={`http://localhost:8000/api/v1/recruiter/candidates/${cand.candidate_id}/resume`}
                              download
                              className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Download size={12} />
                              <span>DOWNLOAD CANDIDATE CV</span>
                            </a>
                          ) : (
                            <div className="p-2 rounded bg-white/5 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                              <Lock size={12} className="text-amber-400" />
                              <span>{cand.resume_access_note}</span>
                            </div>
                          )
                        ) : (
                          <div className="text-[10px] font-mono text-slate-500 text-center py-1">
                            No resume uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#0E121B] flex justify-end shrink-0">
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* INDIVIDUAL CANDIDATE EVIDENCE DRILLDOWN MODAL                         */}
      {/* ====================================================================== */}
      {evidenceCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0E14] border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E121B] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Eye size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Evidence Citations: {evidenceCandidate.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Compatibility Score: {evidenceCandidate.match_score.toFixed(0)}% • {evidenceCandidate.eligibility.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEvidenceCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            {loadingEvidence ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Activity size={24} className="animate-spin text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">RETRIEVING_GROUND_TRUTH_CITATIONS...</span>
              </div>
            ) : evidenceData ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Rationale Quote */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Algorithmic Matching Rationale
                  </span>
                  <p className="text-xs font-mono text-slate-300">
                    {evidenceData.explanation}
                  </p>
                </div>

                {/* Mandatory Skills Grounded Proof */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Mandatory Requirements Evidence Citations
                  </span>
                  <div className="space-y-2">
                    {evidenceData.mandatory_evidence?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border border-white/5 bg-black/40 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white">{item.skill}</span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {item.is_resume_verified ? "CV CITATION" : "PROFILE VERIFIED"}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-300 italic bg-white/[0.02] p-2 rounded border border-white/[0.04]">
                          "{item.evidence}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills Evidence */}
                {evidenceData.preferred_evidence?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} /> Preferred Qualifications Citations
                    </span>
                    <div className="space-y-2">
                      {evidenceData.preferred_evidence.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-white/5 bg-black/40 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-white">{item.skill}</span>
                            <span className="text-[10px] font-mono text-violet-400">PREFERRED</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-300 italic bg-white/[0.02] p-2 rounded">
                            "{item.evidence}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score Breakdown Bars */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Deterministic Weight Contribution
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded bg-black/30">
                      <div className="text-[10px] text-slate-500">Mandatory (40%)</div>
                      <div className="text-emerald-400 font-bold">{evidenceData.score_breakdown?.mandatory ?? 0}</div>
                    </div>
                    <div className="p-2 rounded bg-black/30">
                      <div className="text-[10px] text-slate-500">Preferred (20%)</div>
                      <div className="text-violet-400 font-bold">{evidenceData.score_breakdown?.preferred ?? 0}</div>
                    </div>
                    <div className="p-2 rounded bg-black/30">
                      <div className="text-[10px] text-slate-500">Projects (20%)</div>
                      <div className="text-cyan-400 font-bold">{evidenceData.score_breakdown?.projects ?? 0}</div>
                    </div>
                    <div className="p-2 rounded bg-black/30">
                      <div className="text-[10px] text-slate-500">Exp (10%)</div>
                      <div className="text-white font-bold">{evidenceData.score_breakdown?.experience ?? 0}</div>
                    </div>
                    <div className="p-2 rounded bg-black/30">
                      <div className="text-[10px] text-slate-500">Avail (10%)</div>
                      <div className="text-white font-bold">{evidenceData.score_breakdown?.availability ?? 0}</div>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#0E121B] flex items-center justify-between shrink-0">
              {evidenceData?.can_download_resume ? (
                <a
                  href={`http://localhost:8000/api/v1/recruiter/candidates/${evidenceCandidate.talent_profile_id}/resume`}
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                >
                  <Download size={13} />
                  <span>DOWNLOAD ORIGINAL CV</span>
                </a>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {evidenceData?.resume_access_reason || "CV Download Protected"}
                </span>
              )}

              <button
                onClick={() => setEvidenceCandidate(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
