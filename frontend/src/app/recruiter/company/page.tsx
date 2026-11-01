"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Building, Save, Globe, MapPin, Users, CheckCircle } from "lucide-react";

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<any>({
    name: "",
    website: "",
    size: "11-50",
    industry: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await apiRequest("/recruiter/company");
        setCompany(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      const updated = await apiRequest("/recruiter/company", {
        method: "PUT",
        body: JSON.stringify(company),
      });
      setCompany(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to update company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Company Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Maintain your organization's engineering branding and public company details.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle size={15} /> Company profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl glass-panel space-y-5 border border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Company Name
            </label>
            <input
              type="text"
              required
              value={company.name || ""}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Website
            </label>
            <input
              type="url"
              value={company.website || ""}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Industry
            </label>
            <input
              type="text"
              value={company.industry || ""}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Company Size
            </label>
            <select
              value={company.size || "11-50"}
              onChange={(e) => setCompany({ ...company, size: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            >
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Location
            </label>
            <input
              type="text"
              value={company.location || ""}
              onChange={(e) => setCompany({ ...company, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            About the Company & Engineering Culture
          </label>
          <textarea
            rows={4}
            value={company.description || ""}
            onChange={(e) => setCompany({ ...company, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md flex items-center gap-2"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
