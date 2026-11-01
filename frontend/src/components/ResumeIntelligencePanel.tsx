"use client";

import React, { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/api";
import {
  FileText,
  Upload,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  Check,
  ChevronRight,
  Layers,
  Code2,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Lock,
  Globe,
  Sliders
} from "lucide-react";

interface ResumeMetadata {
  id: number;
  filename: string;
  file_size: number;
  mime_type: string;
  version: number;
  is_active: boolean;
  visibility: string;
  status: string;
  ocr_applied: boolean;
  ai_provider_used?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  extraction_id?: number;
  review_status?: string;
  confidence_score?: number;
  skills_extracted_count: number;
  projects_extracted_count: number;
}

interface ExtractionDraft {
  extraction_id: number;
  resume_id: number;
  filename: string;
  confidence_score: number;
  review_status: string;
  raw_text?: string;
  basic_info: any;
  education: any[];
  skills: any[];
  projects: any[];
  experience: any[];
  additional: any;
  conflicts: any;
  current_profile_snapshot: any;
}

interface Props {
  onProfileUpdated?: () => void;
}

export default function ResumeIntelligencePanel({ onProfileUpdated }: Props) {
  const [resumeData, setResumeData] = useState<{ active_resume: ResumeMetadata | null; resumes: ResumeMetadata[] }>({
    active_resume: null,
    resumes: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Review Modal State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draft, setDraft] = useState<ExtractionDraft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // Editable fields in review modal
  const [headlineChoice, setHeadlineChoice] = useState<"keep" | "accept" | "edit">("accept");
  const [customHeadline, setCustomHeadline] = useState("");
  const [bioChoice, setBioChoice] = useState<"keep" | "accept" | "edit">("accept");
  const [customBio, setCustomBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Record<string, boolean>>({});
  const [selectedProjects, setSelectedProjects] = useState<Record<string, boolean>>({});
  const [evidenceFilter, setEvidenceFilter] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    try {
      const data = await apiRequest("/talent/resume");
      setResumeData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext || "")) {
      alert("Unsupported file type. Please upload a PDF or DOCX resume.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds maximum limit of 15MB.");
      return;
    }

    setUploading(true);
    setNotice(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("visibility", "verified_recruiters");
    formData.append("auto_process", "true");

    try {
      const res = await apiRequest("/talent/resume", {
        method: "POST",
        body: formData,
      });

      setNotice(`Resume '${file.name}' successfully parsed with AI intelligence!`);
      await fetchResumes();

      // Open review modal immediately if extraction is ready
      if (res.resume_id) {
        openReviewModal(res.resume_id);
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload and parse resume.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReprocess = async (resumeId: number) => {
    setReprocessing(true);
    try {
      await apiRequest(`/talent/resume/${resumeId}/process`, { method: "POST" });
      setNotice("Resume reprocessed with latest AI models and normalized taxonomy.");
      await fetchResumes();
      openReviewModal(resumeId);
    } catch (e: any) {
      alert(e.message || "Reprocessing failed.");
    } finally {
      setReprocessing(false);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm("Are you sure you want to delete this resume? This cannot be undone.")) return;
    try {
      await apiRequest(`/talent/resume/${resumeId}`, { method: "DELETE" });
      setNotice("Resume removed from storage.");
      fetchResumes();
    } catch (e: any) {
      alert(e.message || "Failed to delete resume.");
    }
  };

  const handleVisibilityChange = async (resumeId: number, newVisibility: string) => {
    try {
      await apiRequest(`/talent/resume/${resumeId}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ visibility: newVisibility })
      });
      fetchResumes();
      setNotice(`Resume access updated to: ${newVisibility.replace("_", " ")}`);
    } catch (e: any) {
      alert(e.message || "Failed to update visibility.");
    }
  };

  const openReviewModal = async (resumeId: number) => {
    setLoadingDraft(true);
    setReviewOpen(true);
    try {
      const data: ExtractionDraft = await apiRequest(`/talent/resume/${resumeId}/extraction`);
      setDraft(data);

      setCustomHeadline(data.basic_info?.headline || "");
      setCustomBio(data.basic_info?.summary || "");

      // Default select all high confidence skills & projects
      const skillInit: Record<string, boolean> = {};
      data.skills?.forEach((s) => {
        skillInit[s.canonical_name] = true;
      });
      setSelectedSkills(skillInit);

      const projInit: Record<string, boolean> = {};
      data.projects?.forEach((p) => {
        projInit[p.title] = true;
      });
      setSelectedProjects(projInit);

    } catch (e: any) {
      alert(e.message || "Could not load extraction draft.");
      setReviewOpen(false);
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleConfirmAutofill = async () => {
    if (!draft) return;
    setConfirming(true);

    const payload = {
      basic_info: {
        apply_headline: headlineChoice !== "keep",
        headline: headlineChoice === "edit" ? customHeadline : draft.basic_info?.headline,
        apply_bio: bioChoice !== "keep",
        summary: bioChoice === "edit" ? customBio : draft.basic_info?.summary,
        apply_location: true,
        location: draft.basic_info?.location,
        github_url: draft.basic_info?.github_url,
        linkedin_url: draft.basic_info?.linkedin_url,
        portfolio_url: draft.basic_info?.portfolio_url
      },
      education: draft.education,
      skills: (draft.skills || []).map((s) => ({
        ...s,
        accepted: !!selectedSkills[s.canonical_name]
      })),
      projects: (draft.projects || []).map((p) => ({
        ...p,
        accepted: !!selectedProjects[p.title]
      }))
    };

    try {
      const res = await apiRequest(`/talent/resume/${draft.resume_id}/confirm`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setNotice(`Profile successfully updated! Added ${res.skills_added} skills and ${res.projects_added} verified projects.`);
      setReviewOpen(false);
      fetchResumes();
      if (onProfileUpdated) onProfileUpdated();
    } catch (e: any) {
      alert(e.message || "Failed to commit autofill confirmation.");
    } finally {
      setConfirming(false);
    }
  };

  const active = resumeData.active_resume;

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] animate-pulse">
        <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded mb-3" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-6 relative overflow-hidden">
      
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-violet-600/10 via-cyan-500/5 to-transparent pointer-events-none rounded-tr-2xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
            <Sparkles size={13} className="text-violet-500 animate-pulse" />
            <span>AI RESUME & CV INTELLIGENCE ENGINE</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Resume Parsing, Profile Autofill & Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Upload your PDF or DOCX resume. NEXORA extracts canonical skills, architecture projects, and citations with zero manual data entry.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-mono text-xs font-bold transition-all shadow-md shadow-violet-600/20 disabled:opacity-60 cursor-pointer"
          >
            {uploading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>EXTRACTING INTELLIGENCE...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>{active ? "REPLACE / UPLOAD CV" : "UPLOAD RESUME (PDF/DOCX)"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Active Resume Card */}
      {active ? (
        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {active.filename}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    ACTIVE V{active.version}
                  </span>
                  {active.ocr_applied && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-500 uppercase">
                      OCR ENHANCED
                    </span>
                  )}
                  {active.status === "review_required" && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-500 uppercase">
                      REVIEW REQUIRED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span>{(active.file_size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Uploaded {new Date(active.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-violet-500 dark:text-violet-400 font-semibold">
                    {active.skills_extracted_count} Skills Citations
                  </span>
                  <span>•</span>
                  <span>{active.projects_extracted_count} Project Architectures</span>
                </div>
              </div>
            </div>

            {/* Recruiter Visibility Selector */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121620] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                {active.visibility === "verified_recruiters" && <Shield size={13} className="text-cyan-500" />}
                {active.visibility === "public" && <Globe size={13} className="text-emerald-500" />}
                {active.visibility === "private" && <Lock size={13} className="text-slate-400" />}
                
                <select
                  value={active.visibility}
                  onChange={(e) => handleVisibilityChange(active.id, e.target.value)}
                  className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="verified_recruiters">Verified Recruiters</option>
                  <option value="public">Public Portfolio</option>
                  <option value="private">Private (Application Only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/[0.04] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => openReviewModal(active.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 transition cursor-pointer"
              >
                <Eye size={13} />
                <span>REVIEW EXTRACTED INTELLIGENCE & AUTOFILL</span>
              </button>

              <button
                onClick={() => handleReprocess(active.id)}
                disabled={reprocessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-xs font-mono text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <RefreshCw size={13} className={reprocessing ? "animate-spin" : ""} />
                <span>REPROCESS</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`http://localhost:8000/api/v1/talent/resume/${active.id}/download`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-xs font-mono text-slate-700 dark:text-slate-300 transition"
              >
                <Download size={13} />
                <span>DOWNLOAD ORIGINAL</span>
              </a>

              <button
                onClick={() => handleDelete(active.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                title="Delete Resume"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center mx-auto">
            <Upload size={22} />
          </div>
          <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            NO RESUME ON FILE
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Upload your technical resume or CV (PDF / DOCX up to 15MB) to automatically unlock AI profile autofill and high-accuracy recruiter job matching.
          </p>
        </div>
      )}

      {/* ====================================================================== */}
      {/* FULL-FEATURED REVIEW & PROFILE AUTOFILL SPLIT MODAL                   */}
      {/* ====================================================================== */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0B0E14] border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0E121B] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    Resume Intelligence Review & Profile Autofill
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Document: {draft?.filename} • Extraction Confidence: {((draft?.confidence_score || 0.95) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDraft ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={26} className="animate-spin text-cyan-500" />
                <span className="text-xs font-mono text-slate-400">LOADING_STRUCTURED_EXTRACTIONS...</span>
              </div>
            ) : draft ? (
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                
                {/* ============================================================== */}
                {/* LEFT PANEL: RESUME DOCUMENT & EXTRACTED EVIDENCE               */}
                {/* ============================================================== */}
                <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto max-h-[72vh] bg-[#0A0D13]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} /> Document Text & Evidence Quotes
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Ground-Truth Proof</span>
                  </div>

                  {/* Filter search for evidence */}
                  <input
                    type="text"
                    placeholder="Search extracted evidence quotes..."
                    value={evidenceFilter}
                    onChange={(e) => setEvidenceFilter(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  />

                  {/* Evidence chips */}
                  <div className="space-y-2.5">
                    {draft.skills
                      ?.filter((s) => !evidenceFilter || s.canonical_name.toLowerCase().includes(evidenceFilter.toLowerCase()) || s.evidence.toLowerCase().includes(evidenceFilter.toLowerCase()))
                      .map((sk, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-violet-400">{sk.canonical_name}</span>
                            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                              {sk.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic font-mono bg-black/30 p-2 rounded border border-white/[0.03]">
                            "{sk.evidence}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                            <span>Confidence: {((sk.confidence || 0.95) * 100).toFixed(0)}%</span>
                            {sk.proficiency && <span className="text-emerald-400">Proficiency: {sk.proficiency}</span>}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Raw Text Drawer */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <details className="group">
                      <summary className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer select-none">
                        ▶ View Raw Parsed Text Dump
                      </summary>
                      <pre className="mt-2 p-3 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {draft.raw_text || "No raw text available."}
                      </pre>
                    </details>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* RIGHT PANEL: STRUCTURED PROFILE AUTOFILL & CONFIRMATION       */}
                {/* ============================================================== */}
                <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto max-h-[72vh] bg-[#0E121B]">
                  
                  {/* Notice banner */}
                  <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-mono text-violet-300 flex items-start gap-2">
                    <Shield size={16} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>Deterministic Zero-Overwrite Rule:</strong> Review and select which extracted fields you wish to accept. Unselected items will not modify your current verified profile.
                    </span>
                  </div>

                  {/* 1. Headline Autofill & Conflict */}
                  <div className="space-y-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        Professional Headline
                      </span>
                      {draft.conflicts?.headline?.status === "different" && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                          DIFFERENT VALUE DETECTED
                        </span>
                      )}
                    </div>

                    {draft.conflicts?.headline && (
                      <div className="text-[11px] font-mono text-slate-400 bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                        <div>Current Profile: <span className="text-white">{draft.conflicts.headline.current_value || "Empty"}</span></div>
                        <div>Extracted from CV: <span className="text-cyan-400">{draft.conflicts.headline.extracted_value}</span></div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setHeadlineChoice("accept")}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${headlineChoice === "accept" ? "bg-violet-600 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        Accept CV Value
                      </button>
                      <button
                        onClick={() => setHeadlineChoice("keep")}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${headlineChoice === "keep" ? "bg-slate-700 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        Keep Current
                      </button>
                      <button
                        onClick={() => setHeadlineChoice("edit")}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${headlineChoice === "edit" ? "bg-cyan-600 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        Edit
                      </button>
                    </div>

                    {headlineChoice === "edit" && (
                      <input
                        type="text"
                        value={customHeadline}
                        onChange={(e) => setCustomHeadline(e.target.value)}
                        className="w-full mt-2 px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500 text-xs font-mono text-white focus:outline-none"
                      />
                    )}
                  </div>

                  {/* 2. Professional Bio / Summary */}
                  <div className="space-y-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        Bio & Technical Summary
                      </span>
                    </div>

                    {draft.conflicts?.bio && (
                      <div className="text-[11px] font-mono text-slate-400 bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1">
                        <div>Current Profile: <span className="text-white line-clamp-1">{draft.conflicts.bio.current_value || "Empty"}</span></div>
                        <div>Extracted from CV: <span className="text-cyan-400 line-clamp-2">{draft.conflicts.bio.extracted_value}</span></div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setBioChoice("accept")}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${bioChoice === "accept" ? "bg-violet-600 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        Accept CV Summary
                      </button>
                      <button
                        onClick={() => setBioChoice("keep")}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${bioChoice === "keep" ? "bg-slate-700 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        Keep Current Bio
                      </button>
                      <button
                        onClick={() => setBioChoice("edit")}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${bioChoice === "edit" ? "bg-cyan-600 text-white font-bold" : "bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        Edit
                      </button>
                    </div>

                    {bioChoice === "edit" && (
                      <textarea
                        rows={3}
                        value={customBio}
                        onChange={(e) => setCustomBio(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-black/40 border border-cyan-500 text-xs font-mono text-white focus:outline-none"
                      />
                    )}
                  </div>

                  {/* 3. Extracted Skills Selection */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        Extracted Canonical Skills ({draft.skills?.length || 0})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const all: Record<string, boolean> = {};
                            draft.skills?.forEach((s) => (all[s.canonical_name] = true));
                            setSelectedSkills(all);
                          }}
                          className="text-[10px] font-mono text-cyan-400 hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => setSelectedSkills({})}
                          className="text-[10px] font-mono text-slate-400 hover:underline"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {draft.skills?.map((sk, idx) => (
                        <label
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition ${
                            selectedSkills[sk.canonical_name]
                              ? "bg-violet-600/15 border-violet-500/40 text-white"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!selectedSkills[sk.canonical_name]}
                              onChange={(e) =>
                                setSelectedSkills((prev) => ({
                                  ...prev,
                                  [sk.canonical_name]: e.target.checked
                                }))
                              }
                              className="accent-violet-500"
                            />
                            <span className="font-bold">{sk.canonical_name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-black/40">
                            {sk.category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 4. Extracted Projects */}
                  <div className="space-y-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        Extracted Projects ({draft.projects?.length || 0})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {draft.projects?.map((prj, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-white/[0.06] bg-black/30 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!selectedProjects[prj.title]}
                                onChange={(e) =>
                                  setSelectedProjects((prev) => ({
                                    ...prev,
                                    [prj.title]: e.target.checked
                                  }))
                                }
                                className="accent-violet-500"
                              />
                              <span className="text-xs font-bold font-mono text-white">{prj.title}</span>
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono pl-6">
                            {prj.description}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap pl-6 pt-1">
                            {prj.technologies?.map((tech: string, tIdx: number) => (
                              <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-cyan-400">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Education Preview */}
                  {draft.education && draft.education.length > 0 && (
                    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                      <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        Academic Credentials
                      </span>
                      <p className="text-xs font-mono text-slate-300">
                        {draft.education[0].degree} in {draft.education[0].specialization} — {draft.education[0].institution} ({draft.education[0].graduation_year})
                      </p>
                    </div>
                  )}

                </div>
              </div>
            ) : null}

            {/* Modal Footer / Commit Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0E121B] shrink-0">
              <button
                onClick={() => setReviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition cursor-pointer"
              >
                Discard & Close
              </button>

              <button
                onClick={handleConfirmAutofill}
                disabled={confirming}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-mono text-xs font-bold transition shadow-lg shadow-violet-600/30 disabled:opacity-60 cursor-pointer"
              >
                {confirming ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>APPLYING CONFIRMATIONS TO PROFILE...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>CONFIRM SELECTED & UPDATE PROFILE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
