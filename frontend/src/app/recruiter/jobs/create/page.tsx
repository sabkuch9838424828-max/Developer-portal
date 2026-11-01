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
  Terminal,
  Activity,
  Layers,
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
          `AI analyzed "${file.name}" with ${(ed.confidence * 100).toFixed(0)}% confidence. Structured parameters populated below.`
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

      const result = await apiRequest<any>("/recruiter/jobs", {
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
        <div className="flex items-center gap-2 text-[11px] font-mono text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider mb-1">
          <span className="status-pip bg-violet-500" />
          <span>REQUISITION ORCHESTRATION</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Recruitment Specification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Upload unstructured recruitment collateral (PDF, JPEG, PNG) for multi-LLM parsing, or author structured requirements manually.
        </p>
      </div>

      {/* AI DOCUMENT INTELLIGENCE DROPZONE WITH SCANNER ANIMATION */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer overflow-hidden ${
          isUploading
            ? "border-violet-500 bg-violet-500/10 dark:bg-violet-950/20"
            : "border-slate-300 dark:border-white/10 hover:border-violet-500/50 bg-white dark:bg-[#0D1017]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        {/* Laser Scanner Bar when uploading */}
        {isUploading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-pulse" />
        )}

        <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
          {isUploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>

        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {isUploading ? "INGESTING & PARSING OCR TOKENS..." : "DRAG & DROP SPECIFICATION BRIEF"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono text-[11px]">
            Supports PDF, PNG, or JPEG documents (Max 15MB) • Multi-LLM Vision Extraction
          </div>
        </div>
      </div>

      {/* Extraction Status Feedback */}
      {extractedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
          <Sparkles size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="font-mono">
            <div className="font-bold">PARSING_COMPLETE // 100% CONFIDENCE</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{extractedNotice}</div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STRUCTURED JOB SPECIFICATION FORM */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Position Parameters
          </h2>
          <span className="text-[10px] font-mono text-slate-400">STAGE 02/02</span>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Position Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Lead Distributed Systems Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Discipline
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
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
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Architecture Mission & Overview *
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the architectural mission, infrastructure scale, and technical stack..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed"
          />
        </div>

        {/* MANDATORY SKILLS (Strict Gates) */}
        <div className="space-y-3 p-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.03]">
          <div>
            <div className="flex items-center gap-2">
              <span className="status-pip bg-rose-500" />
              <label className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Mandatory Skills — 40% Weight (Strict Gate)
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Strict eligibility prerequisites. Candidates lacking any item will be disqualified by the deterministic gate.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={mandatoryInput}
              onChange={(e) => setMandatoryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMandatorySkill())}
              placeholder="e.g. Python, FastAPI, PostgreSQL"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={addMandatorySkill}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm"
            >
              Add Gate
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.mandatory_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeMandatorySkill(skill)}
                  className="hover:text-rose-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* PREFERRED SKILLS */}
        <div className="space-y-3 p-5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#121722]/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="status-pip bg-cyan-500" />
              <label className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Preferred Technology Stack — 20% Weight
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Secondary tools and frameworks. Candidates earn fractional matching bonus points for these.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={preferredInput}
              onChange={(e) => setPreferredInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredSkill())}
              placeholder="e.g. Docker, Redis, Kubernetes"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="button"
              onClick={addPreferredSkill}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Add Preferred
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.preferred_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removePreferredSkill(skill)}
                  className="hover:text-rose-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Mode, Employment, Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Work Modality
            </label>
            <select
              value={formData.work_mode}
              onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Employment Arrangement
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            >
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Compensation Benchmark
            </label>
            <input
              type="text"
              value={formData.compensation_range}
              onChange={(e) => setFormData({ ...formData, compensation_range: e.target.value })}
              placeholder="$120,000 - $150,000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121722] text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Experience Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/40 dark:bg-[#121722]/30">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">MIN_EXPERIENCE</span>
              <span className="text-slate-900 dark:text-white font-bold">{formData.experience_min} Yrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={formData.experience_min}
              onChange={(e) => setFormData({ ...formData, experience_min: parseFloat(e.target.value) })}
              className="w-full accent-violet-600"
            />
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/40 dark:bg-[#121722]/30">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">MAX_EXPERIENCE</span>
              <span className="text-slate-900 dark:text-white font-bold">{formData.experience_max} Yrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={formData.experience_max}
              onChange={(e) => setFormData({ ...formData, experience_max: parseFloat(e.target.value) })}
              className="w-full accent-violet-600"
            />
          </div>
        </div>

        {/* Strict Eligibility Gate Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/40 dark:bg-[#121722]/40">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-violet-500 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Strict Mandatory Gate Enforcement
              </div>
              <div className="text-[11px] text-slate-500">
                Instantly disqualify candidate profiles lacking 100% of the specified mandatory skills.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.strict_eligibility}
            onChange={(e) => setFormData({ ...formData, strict_eligibility: e.target.checked })}
            className="h-4 w-4 rounded accent-violet-600 cursor-pointer"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveJob(false)}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all flex items-center gap-2"
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveJob(true)}
            className="px-6 py-2.5 rounded-xl text-xs font-mono font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/25 transition-all flex items-center gap-2"
          >
            <Send size={14} />
            <span>{isSubmitting ? "PROCESSING & RANKING..." : "DEPLOY REQUISITION"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
