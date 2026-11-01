"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Save,
  Send,
  Sliders,
  ShieldCheck,
} from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();

  // Document upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Software Engineering",
    description: "",
    mandatory_skills: [] as string[],
    preferred_skills: [] as string[],
    experience_min: 2,
    experience_max: 5,
    employment_type: "Full-time",
    work_mode: "Remote",
    location: "Remote",
    compensation_range: "$120,000 - $150,000",
    openings: 1,
    responsibilities: "",
    additional_requirements: "",
    strict_eligibility: true,
  });

  const [mandatoryInput, setMandatoryInput] = useState("");
  const [preferredInput, setPreferredInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle Document Upload & AI Extraction
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setExtractedNotice(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("doc_type", "job_description");

      const response = await apiRequest<any>("/documents/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response && response.extracted_data) {
        const ed = response.extracted_data;
        setFormData((prev) => ({
          ...prev,
          title: ed.job_title || prev.title,
          category: ed.job_category || prev.category,
          description: ed.job_description || prev.description,
          mandatory_skills: ed.mandatory_skills?.length ? ed.mandatory_skills : prev.mandatory_skills,
          preferred_skills: ed.preferred_skills?.length ? ed.preferred_skills : prev.preferred_skills,
          experience_min: ed.experience_min !== undefined ? ed.experience_min : prev.experience_min,
          experience_max: ed.experience_max !== undefined ? ed.experience_max : prev.experience_max,
          employment_type: ed.employment_type || prev.employment_type,
          work_mode: ed.work_mode || prev.work_mode,
          compensation_range: ed.compensation || prev.compensation_range,
          responsibilities: Array.isArray(ed.responsibilities)
            ? ed.responsibilities.join("\n")
            : prev.responsibilities,
        }));

        setExtractedNotice(
          `AI analyzed "${file.name}" with ${(ed.confidence * 100).toFixed(0)}% confidence. Review extracted requirements below.`
        );
      }
    } catch (err: any) {
      setUploadError(err.message || "Document processing failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Skill Chip Adders
  const addMandatorySkill = () => {
    if (mandatoryInput.trim() && !formData.mandatory_skills.includes(mandatoryInput.trim())) {
      setFormData({
        ...formData,
        mandatory_skills: [...formData.mandatory_skills, mandatoryInput.trim()],
      });
      setMandatoryInput("");
    }
  };

  const removeMandatorySkill = (skill: string) => {
    setFormData({
      ...formData,
      mandatory_skills: formData.mandatory_skills.filter((s) => s !== skill),
    });
  };

  const addPreferredSkill = () => {
    if (preferredInput.trim() && !formData.preferred_skills.includes(preferredInput.trim())) {
      setFormData({
        ...formData,
        preferred_skills: [...formData.preferred_skills, preferredInput.trim()],
      });
      setPreferredInput("");
    }
  };

  const removePreferredSkill = (skill: string) => {
    setFormData({
      ...formData,
      preferred_skills: formData.preferred_skills.filter((s) => s !== skill),
    });
  };

  // Submit Job
  const handleSaveJob = async (publishImmediately: boolean) => {
    if (!formData.title || !formData.description) {
      setSubmitError("Job title and description are required.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        ...formData,
        publish_immediately: publishImmediately,
      };

      const result = await apiRequest("/recruiter/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push(`/recruiter/jobs/${result.id}/matches`);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save job posting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create Recruitment Opportunity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload a job description document (PDF/PNG/JPG) for instant AI extraction, or build the requirements manually.
        </p>
      </div>

      {/* AI DOCUMENT INTELLIGENCE DROPZONE */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-3xl border-2 border-dashed border-blue-400/40 dark:border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-center cursor-pointer space-y-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          {isUploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {isUploading ? "Extracting Requirements with Document Intelligence..." : "Upload Job Description File"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Drag & drop PDF, PNG, or JPG recruitment briefs (Max 15MB)
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {extractedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <Sparkles size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">AI Requirement Extraction Complete</div>
            <div>{extractedNotice}</div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STRUCTURED JOB SPECIFICATION FORM */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6 border border-slate-200 dark:border-white/10">
        <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3">
          Opportunity Parameters & Requirements
        </h2>

        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Distributed Systems Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="AI & Data">AI & Data</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              <option value="Frontend Architecture">Frontend Architecture</option>
              <option value="Embedded & Systems">Embedded & Systems</option>
            </select>
          </div>
        </div>

        {/* Overview Description */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Role Overview & Mission *
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the architectural mission and team responsibilities..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* MANDATORY SKILLS (Strict Gates) */}
        <div className="space-y-2 p-5 rounded-2xl border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Mandatory Technical Skills (40% Weight)
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Non-negotiable skills. Candidates lacking these are disqualified by the eligibility gate.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={mandatoryInput}
              onChange={(e) => setMandatoryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMandatorySkill())}
              placeholder="e.g. Python, FastAPI, PostgreSQL"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addMandatorySkill}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.mandatory_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeMandatorySkill(skill)}
                  className="hover:text-rose-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* PREFERRED SKILLS */}
        <div className="space-y-2 p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white">
              Preferred Skills (20% Weight)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Nice-to-have bonus competencies. Candidates are scored higher for possessing them.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={preferredInput}
              onChange={(e) => setPreferredInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredSkill())}
              placeholder="e.g. Docker, Redis, Kubernetes"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addPreferredSkill}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-white glass-panel hover:bg-slate-100"
            >
              Add Preferred
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.preferred_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removePreferredSkill(skill)}
                  className="hover:text-rose-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Mode, Employment, Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Work Mode
            </label>
            <select
              value={formData.work_mode}
              onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            >
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Compensation Range
            </label>
            <input
              type="text"
              value={formData.compensation_range}
              onChange={(e) => setFormData({ ...formData, compensation_range: e.target.value })}
              placeholder="$120,000 - $150,000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Experience Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Min Experience: {formData.experience_min} Years
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={formData.experience_min}
              onChange={(e) => setFormData({ ...formData, experience_min: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Max Experience: {formData.experience_max} Years
            </label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={formData.experience_max}
              onChange={(e) => setFormData({ ...formData, experience_max: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Strict Eligibility Gate Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-blue-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Strict Eligibility Gate
              </div>
              <div className="text-[11px] text-slate-500">
                Disqualify candidates who do not possess 100% of the mandatory skills.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.strict_eligibility}
            onChange={(e) => setFormData({ ...formData, strict_eligibility: e.target.checked })}
            className="h-5 w-5 rounded accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveJob(false)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 glass-panel hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2"
          >
            <Save size={15} />
            Save as Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveJob(true)}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 flex items-center gap-2"
          >
            <Send size={15} />
            {isSubmitting ? "Publishing & Matching..." : "Review & Publish Opportunity"}
          </button>
        </div>
      </div>
    </div>
  );
}
