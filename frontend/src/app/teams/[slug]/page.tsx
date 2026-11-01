"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
  Users,
  Shield,
  Sparkles,
  Zap,
  Globe,
  GitBranch,
  Lock,
  ExternalLink,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2,
  FolderGit2
} from "lucide-react";

export default function PublicTeamProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [team, setTeam] = useState<any | null>(null);
  const [skillsData, setSkillsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicTeam = async () => {
      try {
        const teamRes = await apiRequest(`/teams/${slug}`);
        setTeam(teamRes);
        const skillsRes = await apiRequest(`/teams/${teamRes.id}/skills`);
        setSkillsData(skillsRes);
      } catch (err: any) {
        setError(err.message || "Failed to load team profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTeam();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Lock size={26} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Team Profile Unavailable
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || "This team profile is either private or does not exist."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
        >
          Return to NEXORA Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-cyan-500/20 bg-gradient-to-r from-cyan-50/40 via-slate-50/50 to-blue-50/40 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-blue-950/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-cyan-500/25">
              {team.name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {team.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                  {team.domain}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified Engineering Collective • {team.members.length} Core Members • {team.availability}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/recruiter/login"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Briefcase size={14} /> Hire This Team
            </Link>
          </div>
        </div>

        {team.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {team.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-3 border-t border-slate-200 dark:border-white/10">
          {team.website && (
            <a
              href={team.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
            >
              <Globe size={14} /> Official Website
            </a>
          )}
          {team.github_url && (
            <a
              href={team.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium hover:underline"
            >
              <GitBranch size={14} /> GitHub Repositories
            </a>
          )}
        </div>
      </div>

      {/* Team Scorecard Stats */}
      {skillsData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
              Total Unique Skills
            </span>
            <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {skillsData.total_unique_skills}
            </div>
            <p className="text-[10px] text-slate-400">Aggregated technologies</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
              Roster Redundancy
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {skillsData.scorecard.redundancy_ratio}%
            </div>
            <p className="text-[10px] text-slate-400">Skills held by multiple members</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
              Skill Depth Score
            </span>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {skillsData.scorecard.skill_depth_score}/100
            </div>
            <p className="text-[10px] text-slate-400">Composite technical weight</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
              Anchor Domain
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
              {skillsData.scorecard.dominant_domain}
            </div>
            <p className="text-[10px] text-slate-400">Primary engineering focus</p>
          </div>
        </div>
      )}

      {/* Seeking / Open Positions */}
      {team.required_skills && team.required_skills.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <Sparkles size={16} />
            <span>Open Positions & Sought Competencies</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This team is actively recruiting talent proficient in:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {team.required_skills.map((rs: string) => (
              <span
                key={rs}
                className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-white dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200"
              >
                + {rs}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Team Roster Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users size={18} className="text-cyan-500" />
          Engineering Roster
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.members.map((m: any) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-base">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h3>
                    <p className="text-[11px] text-slate-500">{m.title || "Engineer"}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300">
                  {m.role}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.skills.map((sk: any) => (
                  <span
                    key={sk.name}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combined Skill Inventory */}
      {skillsData && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            Combined Technical Skill Inventory
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {skillsData.skills_inventory.map((item: any) => (
              <div
                key={item.skill}
                className="p-3 rounded-xl glass-panel border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">{item.skill}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.category}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                    {item.count}
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">{item.max_proficiency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivered Projects */}
      {team.projects && team.projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderGit2 size={18} className="text-indigo-500" />
            Delivered Team Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.projects.map((proj: any) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 space-y-2"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.technologies.map((t: string) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
