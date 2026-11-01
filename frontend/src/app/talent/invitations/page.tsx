"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Mail,
  Check,
  X,
  ArrowRight,
  Users,
  Briefcase,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface TeamInvitationItem {
  id: number;
  team_id: number;
  team_name: string;
  team_slug: string;
  team_domain: string;
  team_logo_url?: string;
  team_description?: string;
  inviter_name: string;
  role: string;
  title?: string;
  message?: string;
  status: string;
  expires_at?: string;
  created_at: string;
}

interface RecruiterInvitationItem {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  recruiter_name: string;
  message?: string;
  status: string;
  created_at: string;
}

export default function TalentInvitationsPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "recruiters">("teams");
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitationItem[]>([]);
  const [recruiterInvitations, setRecruiterInvitations] = useState<RecruiterInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAllInvitations = async () => {
    try {
      const [teamInvs, recruiterInvs] = await Promise.all([
        apiRequest<TeamInvitationItem[]>("/talent/team-invitations").catch(() => []),
        apiRequest<RecruiterInvitationItem[]>("/talent/invitations").catch(() => []),
      ]);
      setTeamInvitations(teamInvs);
      setRecruiterInvitations(recruiterInvs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInvitations();
  }, []);

  // Respond to Team Invitation
  const handleRespondTeamInvite = async (invitationId: number, action: "accept" | "decline") => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await apiRequest(`/invitations/${invitationId}/${action}`, {
        method: "POST",
      });
      setActionSuccess(res.message || `Invitation ${action}ed.`);
      setTimeout(() => setActionSuccess(null), 3500);
      fetchAllInvitations();
    } catch (err: any) {
      setActionError(err.message || `Failed to ${action} invitation.`);
    }
  };

  // Respond to Recruiter Invitation
  const handleRespondRecruiterInvite = async (invitationId: number, action: "accept" | "decline") => {
    try {
      await apiRequest(`/talent/invitations/${invitationId}/respond`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      });
      fetchAllInvitations();
    } catch (err: any) {
      alert(err.message || "Failed to respond to invitation.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  const pendingTeamCount = teamInvitations.filter((i) => i.status === "pending").length;
  const pendingRecruiterCount = recruiterInvitations.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-50/50 via-slate-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
            Invitations & Collaboration Inbox
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Incoming Invitations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Review invitations from development teams seeking your technical skills, or direct job interview requests from hiring companies.
          </p>
        </div>

        <Link
          href="/talent/teams"
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Users size={15} /> My Teams
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("teams")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "teams"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users size={15} />
          Team Invitations
          {pendingTeamCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-900 font-bold">
              {pendingTeamCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("recruiters")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "recruiters"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Briefcase size={15} />
          Recruiter Job Invites
          {pendingRecruiterCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-400 text-slate-900 font-bold">
              {pendingRecruiterCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TEAM INVITATIONS */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          {teamInvitations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
              <Users size={36} className="mx-auto text-slate-400 opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No team collaboration invitations
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When team owners or admins discover your profile and invite you to collaborate, their invitations will appear here.
              </p>
            </div>
          ) : (
            teamInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {inv.team_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          {inv.team_name}
                        </h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 font-bold">
                          {inv.team_domain}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Invited by <span className="font-semibold text-slate-700 dark:text-slate-300">{inv.inviter_name}</span> to join as <span className="font-semibold text-cyan-600 dark:text-cyan-400">{inv.role}</span>
                        {inv.title && ` (${inv.title})`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`text-[10px] px-3 py-1 rounded-full font-mono font-bold uppercase ${
                        inv.status === "accepted"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : inv.status === "declined"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>

                {inv.team_description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {inv.team_description}
                  </p>
                )}

                {inv.message && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 italic">
                    "{inv.message}"
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock size={13} />
                    Expires in 14 days • Sent {new Date(inv.created_at).toLocaleDateString()}
                  </span>

                  {inv.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondTeamInvite(inv.id, "accept")}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <Check size={14} /> Accept & Join Team
                      </button>
                      <button
                        onClick={() => handleRespondTeamInvite(inv.id, "decline")}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:text-rose-500 transition-all flex items-center gap-1.5"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  ) : inv.status === "accepted" ? (
                    <Link
                      href={`/talent/teams/${inv.team_id}`}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-1.5"
                    >
                      Open Team Dashboard <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono italic">
                      Declined on {new Date(inv.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: RECRUITER INVITATIONS */}
      {activeTab === "recruiters" && (
        <div className="space-y-4">
          {recruiterInvitations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
              <Mail size={36} className="mx-auto text-slate-400 opacity-60" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No recruiter invitations
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When tech companies inspect your matched skills and invite you for an interview, it will appear here.
              </p>
            </div>
          ) : (
            recruiterInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                      {inv.company_name} • Recruiter: {inv.recruiter_name}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {inv.job_title}
                    </h2>
                  </div>

                  <div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        inv.status === "accepted"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : inv.status === "declined"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>

                {inv.message && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-300">
                    "{inv.message}"
                  </div>
                )}

                {inv.status === "pending" && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleRespondRecruiterInvite(inv.id, "accept")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm"
                    >
                      <Check size={14} /> Accept & Submit Profile
                    </button>
                    <button
                      onClick={() => handleRespondRecruiterInvite(inv.id, "decline")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:text-rose-500 flex items-center gap-1.5"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
