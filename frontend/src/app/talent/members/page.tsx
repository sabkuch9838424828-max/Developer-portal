"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Search,
  Users,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  Mail,
  Send,
  X,
  Code,
  Shield,
  Layers,
  ArrowRight,
  UserPlus
} from "lucide-react";

interface MemberItem {
  user_id: number;
  profile_id: number;
  name: string;
  email: string;
  headline?: string;
  specialization?: string;
  location?: string;
  experience_years: number;
  skills: { name: string; proficiency: string; category?: string }[];
  projects_count: number;
  availability: string;
  is_already_member: boolean;
  has_pending_invitation: boolean;
}

interface UserTeam {
  id: number;
  name: string;
  slug: string;
  domain: string;
  is_admin: boolean;
  is_owner: boolean;
}

export default function DiscoverMembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");

  // Invite Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<MemberItem | null>(null);
  const [targetTeamId, setTargetTeamId] = useState<number | null>(null);
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch user's managed teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teams = await apiRequest<UserTeam[]>("/teams?mine=true");
        // Only teams where user is Owner or Admin can send invites
        const manageable = teams.filter((t: any) => t.is_owner || t.is_admin);
        setUserTeams(manageable);
        if (manageable.length > 0) {
          setTargetTeamId(manageable[0].id);
        }
      } catch (err) {
        console.error("Failed to load user teams:", err);
      }
    };
    fetchTeams();
  }, []);

  // Fetch searchable members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("q", searchTerm.trim());
      if (selectedSpecialization !== "all") params.append("specialization", selectedSpecialization);
      if (selectedAvailability !== "all") params.append("availability", selectedAvailability);
      if (targetTeamId) params.append("team_id", targetTeamId.toString());

      const data = await apiRequest<MemberItem[]>(`/members/search?${params.toString()}`);
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedSpecialization, selectedAvailability, targetTeamId]);

  const handleOpenInvite = (candidate: MemberItem) => {
    setSelectedCandidate(candidate);
    setInviteTitle(candidate.headline || "Engineering Specialist");
    setInviteMessage(
      `Hi ${candidate.name}, we've been impressed by your technical portfolio and would love for you to collaborate with our engineering team!`
    );
    setActionSuccess(null);
    setActionError(null);
    setIsInviteModalOpen(true);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeamId || !selectedCandidate) return;

    setIsSendingInvite(true);
    setActionError(null);
    try {
      await apiRequest(`/teams/${targetTeamId}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          invitee_user_id: selectedCandidate.user_id,
          role: inviteRole,
          title: inviteTitle,
          message: inviteMessage,
        }),
      });

      setActionSuccess(`Invitation dispatched successfully to ${selectedCandidate.name}!`);
      // Update local candidate state
      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === selectedCandidate.user_id
            ? { ...m, has_pending_invitation: true }
            : m
        )
      );
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setActionSuccess(null);
      }, 1500);
    } catch (err: any) {
      setActionError(err.message || "Failed to send invitation.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-50/50 via-slate-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
            Team Collaboration Ecosystem
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Discover & Invite Engineers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Search vetted software engineers, college talents, and technical specialists across NEXORA. Inspect their verified skills and invite them to your team.
          </p>
        </div>

        <Link
          href="/talent/teams"
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700/50 transition-all flex items-center gap-2 shrink-0 shadow-sm"
        >
          <Users size={15} />
          View My Teams
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by candidate name, skill (Python, React...), email, or bio..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Specializations</option>
              <option value="Backend Engineering">Backend Engineering</option>
              <option value="Frontend Development">Frontend Development</option>
              <option value="Full-Stack Development">Full-Stack Development</option>
              <option value="AI / Machine Learning">AI / Machine Learning</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Systems & Automation">Systems & Automation</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Any Availability</option>
              <option value="Immediately">Available Immediately</option>
              <option value="2 weeks">Within 2 Weeks</option>
              <option value="1 month">Within 1 Month</option>
            </select>
          </div>
        </div>

        {/* Active team context indicator */}
        {userTeams.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500">
            <span>
              Inviting as admin of:{" "}
              <select
                value={targetTeamId || ""}
                onChange={(e) => setTargetTeamId(Number(e.target.value))}
                className="font-semibold text-cyan-600 dark:text-cyan-400 bg-transparent border-b border-cyan-500/30 focus:outline-none cursor-pointer"
              >
                {userTeams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.domain})
                  </option>
                ))}
              </select>
            </span>
            <span>{members.length} discoverable talent profiles found</span>
          </div>
        )}
      </div>

      {/* Member Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <Users size={36} className="mx-auto text-slate-400 opacity-60" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No members matched your query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, specialization, or clearing filters to discover more engineering talent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((cand) => (
            <div
              key={cand.user_id}
              className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-cyan-500/20">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {cand.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cand.headline || "Technical Talent"}
                      </p>
                    </div>
                  </div>

                  {/* Specialization Badge */}
                  {cand.specialization && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 shrink-0">
                      {cand.specialization}
                    </span>
                  )}
                </div>

                {/* Sub-meta tags */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  {cand.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {cand.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {cand.experience_years} years exp
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    {cand.availability}
                  </span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Technical Expertise ({cand.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cand.skills.slice(0, 7).map((s) => (
                    <span
                      key={s.name}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {s.name} <span className="opacity-60 text-[9px]">({s.proficiency.charAt(0)})</span>
                    </span>
                  ))}
                  {cand.skills.length > 7 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 font-mono">
                      +{cand.skills.length - 7} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions & Status */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {cand.projects_count} verified projects
                </span>

                {cand.is_already_member ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} /> Active Team Member
                  </span>
                ) : cand.has_pending_invitation ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">
                    <Mail size={13} /> Invitation Pending
                  </span>
                ) : userTeams.length === 0 ? (
                  <Link
                    href="/talent/teams"
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Create a Team to Invite <ArrowRight size={12} />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleOpenInvite(cand)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <UserPlus size={14} />
                    Invite to Team
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite to Team Modal */}
      {isInviteModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-cyan-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Invite {selectedCandidate.name} to Team
                </h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                {actionSuccess}
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSendInvitation} className="space-y-4">
              {/* Target Team Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Team
                </label>
                <select
                  required
                  value={targetTeamId || ""}
                  onChange={(e) => setTargetTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {userTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.domain})
                    </option>
                  ))}
                </select>
              </div>

              {/* Proposed Role & Title */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Designated Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Proposed Title
                  </label>
                  <input
                    type="text"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    placeholder="e.g. Lead Frontend Architect"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Personal Invitation Message */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Personal Invitation Message
                </label>
                <textarea
                  rows={4}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Explain why you want to collaborate and what project or role you envision..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} />
                  {isSendingInvite ? "Sending..." : "Dispatch Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
