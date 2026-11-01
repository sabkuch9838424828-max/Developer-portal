"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Zap, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";

interface SkillItem {
  id: number;
  name: string;
  category: string;
  proficiency: string;
  experience_years: number;
  is_verified: boolean;
  source: string;
  evidence_url?: string;
}

export default function TalentSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Backend");
  const [newSkillProficiency, setNewSkillProficiency] = useState("Intermediate");
  const [newSkillYears, setNewSkillYears] = useState(2);
  const [isAdding, setIsAdding] = useState(false);

  const fetchSkills = async () => {
    try {
      const data = await apiRequest<SkillItem[]>("/talent/skills");
      setSkills(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setIsAdding(true);
    try {
      await apiRequest("/talent/skills", {
        method: "POST",
        body: JSON.stringify({
          name: newSkillName.trim(),
          category: newSkillCategory,
          proficiency: newSkillProficiency,
          experience_years: newSkillYears,
        }),
      });
      setNewSkillName("");
      fetchSkills();
    } catch (e: any) {
      alert(e.message || "Failed to add skill.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await apiRequest(`/talent/skills/${id}`, { method: "DELETE" });
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete skill.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  const categories = ["Frontend", "Backend", "Database", "AI", "Tools", "Embedded", "Other"];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Categorized Skills & Competencies
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Skills are mapped to our centralized ontology with aliases and relational intelligence.
        </p>
      </div>

      {/* Add Skill Box */}
      <form onSubmit={handleAddSkill} className="p-6 rounded-3xl glass-panel border border-slate-200 dark:border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Add Technical Skill
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. PyTorch, Docker"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> {isAdding ? "Adding..." : "Add to Profile"}
            </button>
          </div>
        </div>
      </form>

      {/* Skills Grouped by Category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catSkills = skills.filter((s) => s.category.toLowerCase() === cat.toLowerCase());
          if (catSkills.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {cat} ({catSkills.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {catSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-2xl glass-panel border border-slate-200 dark:border-white/5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {skill.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {skill.proficiency} • {skill.experience_years}y exp
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Remove skill"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
