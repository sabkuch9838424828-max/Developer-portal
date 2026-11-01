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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Project Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Demonstrated project evidence accounts for 20% of your matching compatibility score.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md flex items-center gap-1.5"
        >
          <Plus size={15} /> Add Project
        </button>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <form onSubmit={handleCreateProject} className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            New Portfolio Project
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Asynchronous Ingestion Pipeline"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Architecture & Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed summary of the platform architecture, technologies, and purpose..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Problem Statement Solved
              </label>
              <input
                type="text"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="High latency during edge node ingestion"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Specific Contribution
              </label>
              <input
                type="text"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="Designed the FastAPI endpoints and Redis batch queue"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Technologies (comma separated)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Python, FastAPI, Redis, Docker, PostgreSQL"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Live Demo / Deployment URL
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.demo.io"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 glass-panel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md"
            >
              {isSubmitting ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {proj.title}
                </h3>
                {proj.problem_statement && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <strong>Problem:</strong> {proj.problem_statement}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteProject(proj.id)}
                className="text-slate-400 hover:text-rose-500 p-1"
                title="Delete project"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {proj.description}
            </p>

            {proj.developer_contribution && (
              <div className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <strong>Your Contribution:</strong> {proj.developer_contribution}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {proj.technologies.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-cyan-100 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center gap-4 text-xs">
              {proj.github_url && (
                <a
                  href={proj.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 dark:text-slate-300 hover:text-cyan-500 flex items-center gap-1.5 font-medium"
                >
                  <GitBranch size={14} /> Repository
                </a>
              )}
              {proj.demo_url && (
                <a
                  href={proj.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 dark:text-slate-300 hover:text-cyan-500 flex items-center gap-1.5 font-medium"
                >
                  <ExternalLink size={14} /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
