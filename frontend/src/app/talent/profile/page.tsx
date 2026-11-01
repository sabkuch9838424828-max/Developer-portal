"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { User, Save, CheckCircle, ShieldCheck, Terminal, Activity } from "lucide-react";

export default function TalentProfileEditorPage() {
  const [profile, setProfile] = useState<any>({
    name: "",
    headline: "",
    bio: "",
    specialization: "",
    location: "",
    education: "",
    experience_years: 2.0,
    availability: "Immediately",
    preferred_employment_type: "Full-time",
    remote_preference: "Remote",
    compensation_expectation: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest<any>("/talent/profile");
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(false);
    try {
      await apiRequest("/talent/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setNotice(true);
      setTimeout(() => setNotice(false), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
          <span className="status-pip bg-cyan-500" />
          <span>IDENTITY PARAMETERS & ATTRIBUTES</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Technical Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          Keep your professional headline, primary discipline, and compensation expectations calibrated for algorithmic matching.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle size={15} /> <span>PROFILE_PARAMETERS_COMMITTED_SUCCESSFULLY</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
          <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Identity Configuration
          </h2>
          <span className="text-[10px] font-mono text-cyan-500">SYS_AUTH_VERIFIED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Legal / Engineering Name
            </label>
            <input
              type="text"
              required
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Primary Engineering Discipline
            </label>
            <select
              value={profile.specialization || "Full-Stack Development"}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="Full-Stack Development">Full-Stack Development</option>
              <option value="Backend Engineering">Backend Engineering</option>
              <option value="Frontend Architecture">Frontend Architecture</option>
              <option value="AI / Machine Learning">AI / Machine Learning</option>
              <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
              <option value="Embedded Systems">Embedded Systems</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Professional Headline
          </label>
          <input
            type="text"
            value={profile.headline || ""}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            placeholder="Senior Python & Distributed Systems Architect"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Technical Bio & Domain Narrative
          </label>
          <textarea
            rows={4}
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Summarize your engineering background, core design principles, and favorite architectures..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Experience Length ({profile.experience_years}y)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={profile.experience_years || 0}
              onChange={(e) => setProfile({ ...profile, experience_years: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Availability Window
            </label>
            <select
              value={profile.availability || "Immediately"}
              onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value="Immediately">Immediately</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Work Modality
            </label>
            <select
              value={profile.remote_preference || "Remote"}
              onChange={(e) => setProfile({ ...profile, remote_preference: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
              <option value="Any">Any</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Primary Location
            </label>
            <input
              type="text"
              value={profile.location || ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="e.g. Seattle, WA / Remote"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target Compensation Benchmark
            </label>
            <input
              type="text"
              value={profile.compensation_expectation || ""}
              onChange={(e) => setProfile({ ...profile, compensation_expectation: e.target.value })}
              placeholder="e.g. $130,000 - $160,000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm flex items-center gap-2"
          >
            <Save size={14} />
            <span>{saving ? "COMMITTING..." : "SAVE PROFILE"}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
