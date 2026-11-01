"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getBaseUrl, getBackendBaseUrl } from "@/lib/api";
import {
  Users,
  Shield,
  Sparkles,
  Zap,
  Globe,
  GitBranch,
  ExternalLink,
  Lock,
  Eye,
  Plus,
  UserPlus,
  Mail,
  Send,
  Trash2,
  CheckCircle2,
  X,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  BarChart3,
  Grid3X3,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Briefcase,
  Award,
  Camera,
  Image as ImageIcon
} from "lucide-react";

interface TeamDetail {
  id: number;
  name: string;
  slug: string;
  domain: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  project_goals?: string;
  required_skills?: string[];
  visibility: string;
  availability: string;
  website?: string;
  github_url?: string;
  owner_user_id: number;
  is_owner: boolean;
  is_admin: boolean;
  is_member: boolean;
  user_role?: string;
  members: {
    id: number;
    talent_profile_id: number;
    user_id: number;
    name: string;
    email?: string;
    role: string;
    title?: string;
    specialization?: string;
    location?: string;
    skills: {
      name: string;
      category?: string;
      proficiency: string;
      experience_years: number;
    }[];
    joined_at: string;
  }[];
  projects: any[];
}

interface TeamSkillsData {
  team_id: number;
  team_name: string;
  total_members: number;
  total_unique_skills: number;
  skills_inventory: {
    skill: string;
    category: string;
    count: number;
    members: {
      name: string;
      user_id: number;
      role: string;
      title: string;
      proficiency: string;
      experience_years: number;
    }[];
    max_proficiency: string;
    proficiency_breakdown: Record<string, number>;
  }[];
  shared_skills: any[];
  unique_skills: any[];
  categories: {
    category: string;
    count: number;
    total_coverage: number;
    skills: string[];
  }[];
  scorecard: {
    total_members: number;
    total_unique_skills: number;
    shared_skills_count: number;
    unique_skills_count: number;
    redundancy_ratio: number;
    dominant_domain: string;
    skill_depth_score: number;
    critical_single_points: number;
  };
}

interface SkillMatrixData {
  team_id: number;
  team_name: string;
  members: {
    member_id: number;
    user_id: number;
    name: string;
    role: string;
    title: string;
    experience_years: number;
    skills_count: number;
  }[];
  skills: string[];
  matrix: {
    member: any;
    skills: Record<string, { proficiency: string; experience_years: number } | null>;
  }[];
  scorecard: any;
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;
  const router = useRouter();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [skillsData, setSkillsData] = useState<TeamSkillsData | null>(null);
  const [matrixData, setMatrixData] = useState<SkillMatrixData | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: "skills" | "matrix" | "members" | "overview" | "invitations" | "matching"
  const [activeTab, setActiveTab] = useState<"skills" | "matrix" | "members" | "overview" | "invitations" | "matching" | "achievements">("skills");
  const [teamAchievements, setTeamAchievements] = useState<any[]>([]);
  const [showAddTeamAchModal, setShowAddTeamAchModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState<any | null>(null);
  const [selectedMemberForAttr, setSelectedMemberForAttr] = useState<number | null>(null);
  const [attrRoleInput, setAttrRoleInput] = useState("Core Contributor");
  const [teamAchForm, setTeamAchForm] = useState({ title: "", category: "Hackathons", issuer: "", description: "", date_awarded: "", credential_url: "" });
  const [brandingUploading, setBrandingUploading] = useState(false);

  // Skills filter
  const [skillFilterType, setSkillFilterType] = useState<"all" | "shared" | "unique">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Team Matching State
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // UI state
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadTeamData = async () => {
    try {
      const [teamRes, skillsRes, matrixRes] = await Promise.all([
        apiRequest<TeamDetail>(`/teams/${teamId}`),
        apiRequest<TeamSkillsData>(`/teams/${teamId}/skills`),
        apiRequest<SkillMatrixData>(`/teams/${teamId}/skill-matrix`),
      ]);
      setTeam(teamRes);
      setSkillsData(skillsRes);
      setMatrixData(matrixRes);

      // If user is owner or admin, also load team invitation history
      if (teamRes.is_owner || teamRes.is_admin) {
        try {
          const invs = await apiRequest<any[]>(`/teams/${teamRes.id}/invitations`);
          setInvitations(invs);
        } catch {
          // ignore if non-admin
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      try {
        const achData = await apiRequest<any[]>(`/teams/${teamId}/achievements`);
        setTeamAchievements(achData || []);
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  // Load jobs when matching tab opened
  useEffect(() => {
    if (activeTab === "matching" && availableJobs.length === 0) {
      const loadJobs = async () => {
        try {
          const jobs = await apiRequest<any[]>("/recruiter/jobs/public").catch(() => []);
          // Fallback to talent opportunities if public jobs endpoint
          if (!jobs || jobs.length === 0) {
            const opps = await apiRequest<any[]>("/talent/opportunities").catch(() => []);
            const mapped = opps.map((o: any) => ({
              id: o.job_id,
              title: o.job_title,
              company_name: o.company_name,
            }));
            setAvailableJobs(mapped);
            if (mapped.length > 0) setSelectedJobId(mapped[0].id);
          } else {
            setAvailableJobs(jobs);
            if (jobs.length > 0) setSelectedJobId(jobs[0].id);
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadJobs();
    }
  }, [activeTab]);

  const handleRunMatch = async () => {
    if (!selectedJobId || !team) return;
    setIsMatching(true);
    try {
      const res = await apiRequest(`/teams/${team.id}/match/${selectedJobId}`, {
        method: "POST",
      });
      setMatchResult(res);
    } catch (err: any) {
      alert(err.message || "Failed to calculate team match.");
    } finally {
      setIsMatching(false);
    }
  };

  // Candidate Search for Invite Modal
  useEffect(() => {
    if (showInviteModal) {
      const searchUsers = async () => {
        try {
          const q = inviteSearch.trim();
          const data = await apiRequest<any[]>(
            `/members/search?team_id=${team?.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`
          );
          setCandidates(data.filter((c) => !c.is_already_member && !c.has_pending_invitation));
        } catch (e) {
          console.error(e);
        }
      };
      const t = setTimeout(searchUsers, 300);
      return () => clearTimeout(t);
    }
  }, [showInviteModal, inviteSearch, team?.id]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !team) return;
    setIsSendingInvite(true);
    try {
      await apiRequest(`/teams/${team.id}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          invitee_user_id: selectedCandidate.user_id,
          role: inviteRole,
          title: inviteTitle || undefined,
          message: inviteMessage || undefined,
        }),
      });
      setShowInviteModal(false);
      setSelectedCandidate(null);
      setStatusMessage(`Invitation dispatched to ${selectedCandidate.name}!`);
      setTimeout(() => setStatusMessage(null), 3000);
      loadTeamData();
    } catch (err: any) {
      alert(err.message || "Failed to send invitation.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRemoveMember = async (memberId: number, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this team?`)) return;
    try {
      await apiRequest(`/teams/${team?.id}/members/${memberId}`, { method: "DELETE" });
      setStatusMessage(`${name} has been removed from the team.`);
      setTimeout(() => setStatusMessage(null), 3000);
      loadTeamData();
    } catch (err: any) {
      alert(err.message || "Failed to remove member.");
    }
  };

  const handleRoleChange = async (memberId: number, newRole: string) => {
    try {
      await apiRequest(`/teams/${team?.id}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      setStatusMessage("Member role updated successfully.");
      setTimeout(() => setStatusMessage(null), 2500);
      loadTeamData();
    } catch (err: any) {
      alert(err.message || "Failed to update role.");
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    try {
      await apiRequest(`/invitations/${inviteId}`, { method: "DELETE" });
      setInvitations(invitations.filter((i) => i.id !== inviteId));
      setStatusMessage("Invitation cancelled.");
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to cancel invitation.");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && team) {
      const url = `${window.location.origin}/teams/${team.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading || !team) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  // Filter skills
  const filteredSkills = (skillsData?.skills_inventory || []).filter((s) => {
    if (skillFilterType === "shared" && s.count < 2) return false;
    if (skillFilterType === "unique" && s.count !== 1) return false;
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (skillSearchQuery && !s.skill.toLowerCase().includes(skillSearchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl glass-panel border border-cyan-500/20 bg-white dark:bg-[#0D1017] overflow-hidden space-y-4">
        {/* Team Cover Banner */}
        <div className="h-32 sm:h-40 w-full relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-200/60 dark:border-white/[0.06] flex items-end p-4">
          {team.cover_image_url && (
            <img src={team.cover_image_url.startsWith("http") ? team.cover_image_url : `${getBackendBaseUrl()}${team.cover_image_url}`} alt="Team Cover" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {(team.is_owner || team.is_admin) && (
            <label className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur border border-white/20 text-white text-[11px] font-mono cursor-pointer flex items-center gap-1.5 z-10">
              <ImageIcon size={13} />
              <span>{brandingUploading ? "SAVING..." : "EDIT BANNER"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                setBrandingUploading(true);
                const fd = new FormData();
                fd.append("file", e.target.files[0]);
                const token = localStorage.getItem("token");
                await fetch(`${getBaseUrl()}/teams/${team.id}/cover`, {
                  method: "POST",
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                  body: fd
                });
                setBrandingUploading(false);
                loadTeamData();
              }} />
            </label>
          )}
        </div>

        <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-10 sm:-mt-12 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-white dark:ring-[#0D1017] bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl overflow-hidden relative group shrink-0">
              {team.logo_url ? (
                <img src={team.logo_url.startsWith("http") ? team.logo_url : `${getBackendBaseUrl()}${team.logo_url}`} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                team.name.charAt(0)
              )}
              {(team.is_owner || team.is_admin) && (
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono cursor-pointer">
                  <Camera size={16} />
                  <span>LOGO</span>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setBrandingUploading(true);
                    const fd = new FormData();
                    fd.append("file", e.target.files[0]);
                    const token = localStorage.getItem("token");
                    await fetch(`${getBaseUrl()}/teams/${team.id}/logo`, {
                      method: "POST",
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                      body: fd
                    });
                    setBrandingUploading(false);
                    loadTeamData();
                  }} />
                </label>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {team.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                  {team.domain}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  {team.visibility === "private" ? (
                    <>
                      <Lock size={12} className="text-amber-500" /> Private
                    </>
                  ) : (
                    <>
                      <Eye size={12} className="text-emerald-500" /> Public
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {team.members.length} Authorized Members • {skillsData?.total_unique_skills || 0} Aggregated Skills • {team.availability}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 shadow-sm"
              title="Copy shareable team profile URL"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copiedLink ? "Link Copied!" : "Share Profile"}
            </button>

            {(team.is_owner || team.is_admin) && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center gap-1.5"
              >
                <UserPlus size={15} />
                Invite Candidate
              </button>
            )}
          </div>
        </div>

        {/* Links & Sub-meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-white/5">
          {team.website && (
            <a
              href={team.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <Globe size={13} /> {team.website.replace("https://", "")}
            </a>
          )}
          {team.github_url && (
            <a
              href={team.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:underline"
            >
              <GitBranch size={13} /> GitHub Organization
            </a>
          )}
          <span className="font-mono text-[11px] text-slate-400">
            Shareable URL: /teams/{team.slug}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "skills"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 size={15} />
          Skills Dashboard ({skillsData?.total_unique_skills || 0})
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "matrix"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Grid3X3 size={15} />
          Member Skill Matrix
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "members"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users size={15} />
          Team Members ({team.members.length})
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "overview"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers size={15} />
          Goals & Projects
        </button>

        {(team.is_owner || team.is_admin) && (
          <button
            onClick={() => setActiveTab("invitations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === "invitations"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Mail size={15} />
            Invitations Log ({invitations.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "achievements"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Award size={15} />
          Achievements & Honors ({teamAchievements.length})
        </button>

        <button
          onClick={() => setActiveTab("matching")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === "matching"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sparkles size={15} className="text-cyan-400" />
          Recruitment Matcher
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: VISUAL SKILLS DASHBOARD                            */}
      {/* ========================================================= */}
      {activeTab === "skills" && skillsData && (
        <div className="space-y-6">
          {/* Team Expertise Scorecard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                Combined Skills
              </span>
              <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {skillsData.total_unique_skills}
              </div>
              <p className="text-[10px] text-slate-400">Unique technologies</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                Skill Redundancy
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {skillsData.scorecard.redundancy_ratio}%
              </div>
              <p className="text-[10px] text-slate-400">
                {skillsData.scorecard.shared_skills_count} skills held by 2+ members
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                Skill Depth Index
              </span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {skillsData.scorecard.skill_depth_score}/100
              </div>
              <p className="text-[10px] text-slate-400">Weighted proficiency score</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                Key Anchor Domain
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">
                {skillsData.scorecard.dominant_domain}
              </div>
              <p className="text-[10px] text-slate-400">
                {skillsData.scorecard.critical_single_points} unique specialist skills
              </p>
            </div>
          </div>

          {/* 12 Category Summary Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
              Technology Category Distribution ({skillsData.categories.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillsData.categories.map((cat) => (
                <div
                  key={cat.category}
                  onClick={() => setCategoryFilter(categoryFilter === cat.category ? "all" : cat.category)}
                  className={`p-4 rounded-2xl glass-panel border cursor-pointer transition-all ${
                    categoryFilter === cat.category
                      ? "border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/40"
                      : "border-slate-200 dark:border-white/10 hover:border-cyan-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat.category}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {cat.skills.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Toggle: All vs Shared vs Unique */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-semibold">
              <button
                onClick={() => setSkillFilterType("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  skillFilterType === "all" ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500"
                }`}
              >
                All Skills ({skillsData.total_unique_skills})
              </button>
              <button
                onClick={() => setSkillFilterType("shared")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  skillFilterType === "shared" ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500"
                }`}
              >
                Shared Skills ({skillsData.shared_skills.length})
              </button>
              <button
                onClick={() => setSkillFilterType("unique")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  skillFilterType === "unique" ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500"
                }`}
              >
                Unique to Member ({skillsData.unique_skills.length})
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                placeholder="Filter skill inventory..."
                className="px-3 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-44"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Categories</option>
                {skillsData.categories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category} ({c.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Inventory Bars / Grid */}
          <div className="space-y-2.5">
            {filteredSkills.length === 0 ? (
              <div className="p-8 text-center rounded-2xl glass-panel text-xs text-slate-500">
                No skills matched the active filters.
              </div>
            ) : (
              filteredSkills.map((item) => {
                const maxProfColor =
                  item.max_proficiency === "Expert"
                    ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-500/30"
                    : item.max_proficiency === "Advanced"
                    ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500/30"
                    : "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-500/30";

                return (
                  <div
                    key={item.skill}
                    className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.skill}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${maxProfColor}`}>
                          Max: {item.max_proficiency}
                        </span>
                      </div>

                      {/* Members who hold this skill */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-mono text-slate-400">Held by:</span>
                        {item.members.map((m) => (
                          <span
                            key={m.name}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 font-mono"
                          >
                            <span className="font-semibold">{m.name}</span> ({m.proficiency}, {m.experience_years}y)
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Frequency Count Meter */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (item.count / team.members.length) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {item.count} / {team.members.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INTERACTIVE MEMBER-WISE SKILL MATRIX TABLE        */}
      {/* ========================================================= */}
      {activeTab === "matrix" && matrixData && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Member-Wise Skill Matrix Grid
              </h2>
              <p className="text-xs text-slate-500">
                Interactive cross-tabulation mapping every team member to their demonstrated technical proficiencies.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              {matrixData.skills.length} Technical Dimensions
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-3.5 min-w-[200px] sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">
                    Team Member / Role
                  </th>
                  {matrixData.skills.map((skillName) => (
                    <th key={skillName} className="p-3.5 min-w-[120px] whitespace-nowrap text-center">
                      {skillName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                {matrixData.matrix.map((row) => (
                  <tr key={row.member.member_id} className="hover:bg-cyan-50/20 dark:hover:bg-cyan-950/10 transition-colors">
                    <td className="p-3.5 sticky left-0 bg-white/95 dark:bg-slate-950/95 z-10 shadow-sm border-r border-slate-200 dark:border-white/10">
                      <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                        {row.member.name}
                      </div>
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400">
                        {row.member.role} • {row.member.title}
                      </div>
                      <div className="text-[9px] text-slate-400 font-sans">
                        {row.member.skills_count} skills declared
                      </div>
                    </td>

                    {matrixData.skills.map((s) => {
                      const skillObj = row.skills[s];
                      if (!skillObj) {
                        return (
                          <td key={s} className="p-3 text-center text-slate-300 dark:text-slate-700">
                            —
                          </td>
                        );
                      }

                      const prof = skillObj.proficiency;
                      const badgeClass =
                        prof === "Expert"
                          ? "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-500/40"
                          : prof === "Advanced"
                          ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-500/40"
                          : "bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-500/40";

                      return (
                        <td key={s} className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>
                            {prof}
                          </span>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {skillObj.experience_years}y
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TEAM MEMBERS MANAGEMENT                           */}
      {/* ========================================================= */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Team Roster ({team.members.length})
            </h2>

            {(team.is_owner || team.is_admin) && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-1.5"
              >
                <UserPlus size={14} /> Invite New Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </h3>
                        {member.role === "Owner" && (
                          <span className="text-amber-500" title="Team Creator & Owner">
                            <Shield size={14} />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{member.title || "Software Engineer"}</p>
                    </div>
                  </div>

                  {/* Role Selector or Display */}
                  {(team.is_owner || team.is_admin) && member.role !== "Owner" ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Member">Member</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300">
                      {member.role}
                    </span>
                  )}
                </div>

                {/* Individual Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Individual Skills ({member.skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.slice(0, 6).map((sk) => (
                      <span
                        key={sk.name}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {sk.name} <span className="opacity-60 text-[9px]">({sk.proficiency.charAt(0)})</span>
                      </span>
                    ))}
                    {member.skills.length > 6 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        +{member.skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Joined: {new Date(member.joined_at).toLocaleDateString()}</span>

                  {((team.is_owner && member.role !== "Owner") ||
                    (team.is_admin && member.role === "Member")) && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      className="text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: GOALS & PROJECTS                                   */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Team Overview & Engineering Model
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {team.description || "No overview provided."}
            </p>

            {team.project_goals && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Active Project Roadmap & Goals
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {team.project_goals}
                </p>
              </div>
            )}

            {team.required_skills && team.required_skills.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Open Positions / Required Skill Competencies
                </span>
                <div className="flex flex-wrap gap-2">
                  {team.required_skills.map((rs) => (
                    <span
                      key={rs}
                      className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300"
                    >
                      Seeking: {rs}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: INVITATIONS LOG                                    */}
      {/* ========================================================= */}
      {activeTab === "invitations" && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Member Invitations History
              </h2>
              <p className="text-xs text-slate-500">
                Audit trail of invitations sent to talent candidates.
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center gap-1.5"
            >
              <UserPlus size={14} /> New Invite
            </button>
          </div>

          {invitations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No invitations have been dispatched yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {inv.invitee_name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Role: {inv.role}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          inv.status === "accepted"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                            : inv.status === "declined"
                            ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                            : inv.status === "cancelled"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                    {inv.message && (
                      <p className="text-[11px] text-slate-500 italic">"{inv.message}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === "pending" && (
                      <button
                        onClick={() => handleCancelInvite(inv.id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        Cancel Invitation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: TEAM-BASED RECRUITMENT MATCHING                    */}
      {/* ========================================================= */}
      {activeTab === "matching" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
              AI Team Recruitment Intelligence
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Team-to-Job Skill Coverage Analyzer
            </h2>
            <p className="text-xs text-slate-500">
              Evaluate how your collective engineering roster satisfies complex job requirements with transparent member-level skill attribution.
            </p>
          </div>

          {/* Job Picker & Run Match */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Published Job Role
              </label>
              <select
                value={selectedJobId || ""}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company_name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunMatch}
              disabled={isMatching || !selectedJobId}
              className="w-full sm:w-auto mt-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isMatching ? "Analyzing..." : "Calculate Team Match"}
            </button>
          </div>

          {/* Match Score Results Card */}
          {matchResult && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-white/10 animate-in fade-in">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-blue-500/10 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Composite Team Compatibility
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {matchResult.job_title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Hiring Company: {matchResult.company_name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                      {matchResult.team_match_score}%
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                        matchResult.eligibility === "eligible"
                          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {matchResult.eligibility}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coverage Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl glass-panel space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Mandatory Skill Coverage
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
                    {matchResult.mandatory_coverage_pct}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${matchResult.mandatory_coverage_pct}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl glass-panel space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Preferred Skill Coverage
                  </span>
                  <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {matchResult.preferred_coverage_pct}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${matchResult.preferred_coverage_pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Skill Attribution Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-400">
                  Skill Attribution & Provider Mapping:
                </h4>
                <div className="space-y-2">
                  {matchResult.mandatory_skills_status.map((item: any) => (
                    <div
                      key={item.skill}
                      className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {item.is_covered ? (
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.skill}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">(Mandatory)</span>
                      </div>

                      <div>
                        {item.is_covered ? (
                          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">
                            Provided by:{" "}
                            {item.provided_by.map((p: any) => `${p.member_name} (${p.proficiency})`).join(", ")}
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-500 font-mono font-semibold">
                            Missing from Team Roster
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative Explanation */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans border border-slate-200 dark:border-white/5">
                <span className="font-bold">Explainable AI Analysis: </span>
                {matchResult.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      
      {/* ========================================================= */}
      {/* TAB 7: TEAM ACHIEVEMENTS & ATTRIBUTED HONORS              */}
      {/* ========================================================= */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017]">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
                <span className="status-pip bg-cyan-500" />
                <span>TEAM HONORS & MILESTONES</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Team Achievement Portfolio ({teamAchievements.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Competitive hackathon wins, research papers, and technical product milestones attributed to this team.
              </p>
            </div>

            {(team.is_owner || team.is_admin) && (
              <button
                onClick={() => setShowAddTeamAchModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold tracking-wider transition shadow-md shadow-cyan-600/20 self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>RECORD TEAM AWARD</span>
              </button>
            )}
          </div>

          {teamAchievements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/40 dark:bg-[#0D1017]/40 space-y-3">
              <Award size={36} className="mx-auto text-slate-400 stroke-1" />
              <h3 className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">NO TEAM ACHIEVEMENTS RECORDED</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Record hackathons, open source awards, or research demonstrations accomplished by this team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamAchievements.map((ach) => (
                <div key={ach.id} className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.05] text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        {ach.category}
                      </span>
                      {ach.date_awarded && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {ach.date_awarded.split("T")[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{ach.title}</h3>
                    <div className="text-xs font-mono text-slate-500">Issuer: {ach.issuer}</div>
                    {ach.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ach.description}
                      </p>
                    )}
                  </div>

                  {/* Attributed Contributors */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>ATTRIBUTED CONTRIBUTORS ({ach.contributors?.length || 0})</span>
                      {(team.is_owner || team.is_admin) && (
                        <button
                          onClick={() => {
                            setShowAttributeModal(ach);
                            setSelectedMemberForAttr(team.members[0]?.talent_profile_id || null);
                          }}
                          className="text-cyan-500 hover:underline flex items-center gap-1"
                        >
                          <Plus size={11} /> Attribute Member
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {ach.contributors && ach.contributors.length > 0 ? (
                        ach.contributors.map((c: any) => (
                          <div key={c.contributor_id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white">{c.talent_name}</span>
                            <span className="text-[10px] font-mono text-slate-500">({c.role_in_project})</span>
                            <span className={`text-[9px] font-mono px-1 rounded ${c.attribution_status === 'accepted' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                              {c.attribution_status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-mono italic">No specific members attributed yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record Team Award Modal */}
      {showAddTeamAchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Award size={15} className="text-cyan-500" />
                <span>RECORD TEAM ACHIEVEMENT</span>
              </div>
              <button onClick={() => setShowAddTeamAchModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const token = localStorage.getItem("token");
                await fetch(`${getBaseUrl()}/teams/${team.id}/achievements`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                  body: JSON.stringify(teamAchForm)
                });
                setShowAddTeamAchModal(false);
                const achData = await apiRequest<any[]>(`/teams/${team.id}/achievements`);
                setTeamAchievements(achData || []);
              } catch (err: any) {
                alert("Error recording achievement");
              }
            }} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">ACHIEVEMENT TITLE *</label>
                <input required placeholder="e.g. NeurIPS Best Demonstration Award" value={teamAchForm.title} onChange={(e) => setTeamAchForm({ ...teamAchForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CATEGORY</label>
                  <select value={teamAchForm.category} onChange={(e) => setTeamAchForm({ ...teamAchForm, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white outline-none">
                    <option value="Hackathons">Hackathons</option>
                    <option value="Technical competitions">Technical competitions</option>
                    <option value="Awards and recognitions">Awards and recognitions</option>
                    <option value="Research and publications">Research & publications</option>
                    <option value="Open-source contributions">Open-source</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ORGANIZER / ISSUER *</label>
                  <input required placeholder="e.g. NeurIPS Foundation" value={teamAchForm.issuer} onChange={(e) => setTeamAchForm({ ...teamAchForm, issuer: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">DESCRIPTION</label>
                <textarea rows={2} placeholder="Summary of this accomplishment..." value={teamAchForm.description} onChange={(e) => setTeamAchForm({ ...teamAchForm, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <button type="button" onClick={() => setShowAddTeamAchModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">CANCEL</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">SAVE AWARD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attribute Member Modal */}
      {showAttributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Users size={15} className="text-cyan-500" />
                <span>ATTRIBUTE CONTRIBUTOR</span>
              </div>
              <button onClick={() => setShowAttributeModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedMemberForAttr) return;
              try {
                const token = localStorage.getItem("token");
                await fetch(`${getBaseUrl()}/teams/${team.id}/achievements/${showAttributeModal.id}/attribute`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                  body: JSON.stringify({ talent_profile_id: selectedMemberForAttr, role_in_project: attrRoleInput })
                });
                setShowAttributeModal(null);
                const achData = await apiRequest<any[]>(`/teams/${team.id}/achievements`);
                setTeamAchievements(achData || []);
              } catch (err) {
                alert("Error attributing contributor");
              }
            }} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">SELECT TEAM MEMBER</label>
                <select value={selectedMemberForAttr || ""} onChange={(e) => setSelectedMemberForAttr(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white outline-none">
                  {team.members.map((m: any) => (
                    <option key={m.talent_profile_id} value={m.talent_profile_id}>
                      {m.name} ({m.role || "Member"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ROLE IN THIS ACHIEVEMENT</label>
                <input required placeholder="e.g. Lead Distributed Architect" value={attrRoleInput} onChange={(e) => setAttrRoleInput(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white outline-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <button type="button" onClick={() => setShowAttributeModal(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">CANCEL</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">SEND ATTRIBUTION</button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={18} className="text-cyan-500" />
                Invite Candidate to {team.name}
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              {/* Candidate Search / Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Search Registered NEXORA Members
                </label>
                <input
                  type="text"
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  placeholder="Type name, skill, or email..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
                  {candidates.map((cand) => (
                    <div
                      key={cand.user_id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        selectedCandidate?.user_id === cand.user_id
                          ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 font-semibold"
                          : "border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold">{cand.name}</div>
                        <div className="text-[10px] text-slate-400">{cand.headline || cand.specialization}</div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                        {cand.skills.length} skills
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCandidate && (
                <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-500/20 text-xs space-y-1">
                  <div className="font-semibold text-cyan-800 dark:text-cyan-300">
                    Selected: {selectedCandidate.name} ({selectedCandidate.email})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Specialization: {selectedCandidate.specialization} • {selectedCandidate.experience_years}y exp
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role in Team
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Invitation Note
                </label>
                <textarea
                  rows={3}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personalized message explaining why you'd like to collaborate..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite || !selectedCandidate}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} />
                  {isSendingInvite ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
