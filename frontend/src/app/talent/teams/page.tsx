"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Users,
  Plus,
  Shield,
  Globe,
  GitBranch,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Lock,
  Eye,
  CheckCircle2,
  X,
  ArrowRight,
  UserPlus,
  Briefcase
} from "lucide-react";

interface TeamItem {
  id: number;
  name: string;
  slug: string;
  domain: string;
  description?: string;
  logo_url?: string;
  project_goals?: string;
  required_skills?: string[];
  visibility: string;
  availability: string;
  website?: string;
  github_url?: string;
  member_count: number;
  unique_skills_count: number;
  top_skills: string[];
  is_owner: boolean;
  is_admin: boolean;
  is_member: boolean;
  user_role?: string;
  created_at: string;
}

export default function TalentTeamsPage() {
  const [activeTab, setActiveTab] = useState<"mine" | "explore">("mine");
  const [myTeams, setMyTeams] = useState<TeamItem[]>([]);
  const [exploreTeams, setExploreTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");

  // Create Form State
  const [teamName, setTeamName] = useState("");
  const [domain, setDomain] = useState("Full-Stack Web");
  const [description, setDescription] = useState("");
  const [projectGoals, setProjectGoals] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [availability, setAvailability] = useState("Available for projects");
  const [website, setWebsite] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTeamsData = async () => {
    setLoading(true);
    try {
      const [mineData, allData] = await Promise.all([
        apiRequest<TeamItem[]>("/teams?mine=true"),
        apiRequest<TeamItem[]>("/teams?mine=false"),
      ]);
      setMyTeams(mineData);
      setExploreTeams(allData);
    } catch (e) {
      console.error("Failed to load teams:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const handleAddSkillTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !requiredSkills.includes(val)) {
        setRequiredSkills([...requiredSkills, val]);
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkillTag = (tag: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== tag));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await apiRequest("/teams", {
        method: "POST",
        body: JSON.stringify({
          name: teamName.trim(),
          domain,
          description,
          project_goals: projectGoals,
          required_skills: requiredSkills,
          visibility,
          availability,
          website: website || undefined,
          github_url: githubUrl || undefined,
        }),
      });

      // Reset
      setTeamName("");
      setDescription("");
      setProjectGoals("");
      setRequiredSkills([]);
      setWebsite("");
      setGithubUrl("");
      setShowCreateModal(false);
      setActiveTab("mine");
      await fetchTeamsData();
    } catch (err: any) {
      setFormError(err.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedTeams = (activeTab === "mine" ? myTeams : exploreTeams).filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === "all" || t.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-50/50 via-slate-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-bold">
            Team Collaboration & Skill Aggregation
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Engineering Teams & Collectives
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Create software teams, invite registered NEXORA talent, inspect real-time combined skills inventory, and get matched to high-ticket team recruitment opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/talent/members"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 shrink-0"
          >
            <UserPlus size={15} className="text-cyan-500" />
            Discover Members
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            Create Team
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("mine")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "mine"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            My Teams ({myTeams.length})
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "explore"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Explore Public Teams ({exploreTeams.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Domains</option>
            <option value="Full-Stack Web">Full-Stack Web</option>
            <option value="AI / Machine Learning">AI / Machine Learning</option>
            <option value="Cloud & Distributed Systems">Cloud & Distributed</option>
            <option value="Mobile Engineering">Mobile Engineering</option>
            <option value="Embedded Systems & IoT">Embedded & IoT</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
        </div>
      ) : displayedTeams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel space-y-3">
          <Users size={36} className="mx-auto text-slate-400 opacity-60" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {activeTab === "mine" ? "You haven't joined or created any teams yet" : "No teams matched your query"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "mine"
              ? "Form a new development team with fellow developers or check your received invitations."
              : "Try adjusting your search query or domain filter."}
          </p>
          {activeTab === "mine" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all inline-flex items-center gap-1.5 mt-2"
            >
              <Plus size={14} /> Create Your First Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTeams.map((team) => (
            <div
              key={team.id}
              className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-cyan-500/20">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {team.name}
                        </h3>
                        {team.visibility === "private" ? (
                          <span title="Private Team" className="text-amber-500">
                            <Lock size={13} />
                          </span>
                        ) : (
                          <span title="Public Profile" className="text-emerald-500">
                            <Eye size={13} />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                        {team.domain}
                      </span>
                    </div>
                  </div>

                  {/* Role badge if member */}
                  {team.user_role && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                      {team.user_role}
                    </span>
                  )}
                </div>

                {/* Description */}
                {team.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {team.description}
                  </p>
                )}

                {/* Project Goals */}
                {team.project_goals && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    <span className="font-semibold text-slate-900 dark:text-white">Goals: </span>
                    {team.project_goals}
                  </div>
                )}

                {/* Skill Aggregation Preview */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    <span>Combined Skills ({team.unique_skills_count})</span>
                    <span>{team.member_count} Members</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {team.top_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {team.unique_skills_count > team.top_skills.length && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 font-mono">
                        +{team.unique_skills_count - team.top_skills.length} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Looking for Members / Required Skills */}
                {team.required_skills && team.required_skills.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                      Seeking:
                    </span>
                    {team.required_skills.map((rs) => (
                      <span
                        key={rs}
                        className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 font-medium"
                      >
                        + {rs}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {team.availability}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/teams/${team.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    title="View Public Shareable Profile"
                  >
                    <ExternalLink size={14} />
                  </Link>

                  <Link
                    href={`/talent/teams/${team.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm shadow-cyan-500/20 transition-all flex items-center gap-1"
                  >
                    Team Dashboard & Skills Matrix <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-cyan-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Register New Engineering Team
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Distributed Core Collective"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Technical Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Full-Stack Web">Full-Stack Web</option>
                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                    <option value="Cloud & Distributed Systems">Cloud & Distributed Systems</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Embedded Systems & IoT">Embedded Systems & IoT</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Data Science & Pipelines">Data Science & Pipelines</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Team Overview & Architecture Strengths
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your collective engineering expertise, delivered microservices, and stack proficiencies..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Project Goals / Roadmap
                </label>
                <textarea
                  rows={2}
                  value={projectGoals}
                  onChange={(e) => setProjectGoals(e.target.value)}
                  placeholder="e.g. Architecting a low-latency vector retrieval pipeline and Next.js design system..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              {/* Required Skills Tag Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Open Positions / Seeking Skills (Press Enter to add tag)
                </label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkillTag}
                  placeholder="e.g. Rust, PyTorch, Kubernetes, GraphQL..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      {s}
                      <button type="button" onClick={() => handleRemoveSkillTag(s)} className="hover:text-rose-500">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Profile Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="public">Public (Searchable & Shareable)</option>
                    <option value="discoverable">Discoverable by Recruiter AI Matching</option>
                    <option value="private">Private (Team Members Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Team Availability
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="Available for 3-6 month projects"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://team.dev"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    GitHub Org URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {isSubmitting ? "Creating..." : "Save Team Entity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
