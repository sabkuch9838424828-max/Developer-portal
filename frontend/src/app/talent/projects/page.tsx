"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  GitBranch,
  CheckCircle,
  Terminal,
  Activity,
} from "lucide-react";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  problem_statement?: string;
  features?: string;
  developer_contribution?: string;
  github_url?: string;
  demo_url?: string;
  status: string;
  technologies: string[];
}

export default function TalentProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [features, setFeatures] = useState("");
  const [contribution, setContribution] = useState("");
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest<ProjectItem[]>("/talent/projects");
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const techs = techInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await apiRequest("/talent/projects", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          problem_statement: problemStatement,
          features,
          developer_contribution: contribution,
          technologies: techs,
          github_url: githubUrl || undefined,
          demo_url: demoUrl || undefined,
          status: "Completed",
        }),
      });

      setTitle("");
      setDescription("");
      setProblemStatement("");
      setFeatures("");
      setContribution("");
      setTechInput("");
      setGithubUrl("");
      setDemoUrl("");
      setShowAddForm(false);
      fetchProjects();
    } catch (e: any) {
      alert(e.message || "Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await apiRequest(`/talent/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete project.");
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
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
            <span className="status-pip bg-cyan-500" />
            <span>CODE-BACKED EVIDENCE // 20% SCORING WEIGHT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Demonstrated Project Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Real code repositories, architecture case studies, and demonstrated throughput achievements.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus size={14} /> <span>{showAddForm ? "CLOSE FORM" : "ADD REPOSITORY"}</span>
        </button>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-white dark:bg-[#0D1017] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Register Portfolio Architecture
            </h2>
            <span className="text-[10px] font-mono text-cyan-500">NEW_RECORD</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Asynchronous Ingestion Engine"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              System Architecture & Mission *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of platform architecture, throughput, design decisions, and latency bottlenecks..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Problem Statement Solved
              </label>
              <input
                type="text"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="High latency during edge node ingestion"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Specific Engineering Contribution
              </label>
              <input
                type="text"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="Designed FastAPI ingest endpoints & Redis batch queue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Technologies (Comma separated)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Python, FastAPI, Redis, Docker, PostgreSQL"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Production Deployment URL
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://project.preview.io"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm"
            >
              {isSubmitting ? "COMMITTING..." : "SAVE ARCHITECTURE"}
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs font-mono">
            No projects registered. Click &ldquo;Add Repository&rdquo; to add code-backed evidence to your talent profile.
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-3 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    {proj.title}
                  </h3>
                  {proj.problem_statement && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono text-[11px]">
                      <strong>Problem Solved:</strong> {proj.problem_statement}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteProject(proj.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                  title="Delete project"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {proj.description}
              </p>

              {proj.developer_contribution && (
                <div className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-[#121722] font-mono text-[11px] border border-slate-100 dark:border-white/[0.04]">
                  <strong>Execution Proof:</strong> {proj.developer_contribution}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {proj.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-4 text-xs font-mono">
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 dark:text-slate-300 hover:text-cyan-500 flex items-center gap-1.5 transition-colors"
                  >
                    <GitBranch size={13} /> <span>Code Repository</span>
                  </a>
                )}
                {proj.demo_url && (
                  <a
                    href={proj.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 dark:text-slate-300 hover:text-cyan-500 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={13} /> <span>Live Deployment</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
