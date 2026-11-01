"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Users,
  Search,
  Filter,
  Check,
  X,
  UploadCloud,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Hackathons",
  "Technical competitions",
  "Robotics competitions",
  "Awards and recognitions",
  "Certifications",
  "Academic achievements",
  "Research and publications",
  "Open-source contributions",
  "Projects and product launches",
  "Internships and professional milestones",
  "Leadership and volunteering",
  "Other achievements",
];

export default function TalentAchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [attributions, setAttributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState<any | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Hackathons",
    description: "",
    issuer: "",
    event_name: "",
    position_award: "",
    date_awarded: "",
    credential_url: "",
    is_public: true,
  });

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [achRes, attrRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/talent/achievements", { headers }),
        fetch("http://localhost:8000/api/v1/talent/attributions", { headers }),
      ]);

      if (achRes.ok) {
        const achs = await achRes.json();
        setAchievements(achs);
      }
      if (attrRes.ok) {
        const attrs = await attrRes.json();
        setAttributions(attrs);
      }
    } catch (e) {
      console.error("Failed to load achievements", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      category: "Hackathons",
      description: "",
      issuer: "",
      event_name: "",
      position_award: "",
      date_awarded: "",
      credential_url: "",
      is_public: true,
    });
    setEvidenceFile(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category || "Hackathons",
      description: item.description || "",
      issuer: item.issuer || "",
      event_name: item.event_name || "",
      position_award: item.position_award || "",
      date_awarded: item.date_awarded ? item.date_awarded.split("T")[0] : "",
      credential_url: item.credential_url || "",
      is_public: item.is_public ?? true,
    });
    setEvidenceFile(null);
    setShowAddModal(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const url = editingItem
        ? `http://localhost:8000/api/v1/talent/achievements/${editingItem.id}`
        : "http://localhost:8000/api/v1/talent/achievements";

      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save achievement");
      }

      const resData = await res.json();
      const savedAch = resData.achievement;

      // If user provided a certificate file, upload it as evidence
      if (evidenceFile && savedAch?.id) {
        const evForm = new FormData();
        evForm.append("file", evidenceFile);
        evForm.append("title", `${formData.title} Certificate`);
        evForm.append("evidence_type", "certificate");

        await fetch(`http://localhost:8000/api/v1/talent/achievements/${savedAch.id}/evidence`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: evForm,
        });
      }

      setShowAddModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to commit achievement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this achievement record?")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:8000/api/v1/talent/achievements/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      alert("Error deleting achievement");
    }
  };

  const handleRequestVerification = async () => {
    if (!showVerifyModal) return;
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(
        `http://localhost:8000/api/v1/talent/achievements/${showVerifyModal.id}/request-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ evidence_notes: verifyNotes }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Request failed");
      }
      setShowVerifyModal(null);
      setVerifyNotes("");
      fetchData();
    } catch (e: any) {
      alert(e.message || "Could not submit verification request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttributionResponse = async (contributorId: number, statusChoice: "accepted" | "declined") => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:8000/api/v1/talent/attributions/${contributorId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: statusChoice }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      alert("Failed to respond to team attribution");
    }
  };

  // Filtered list
  const filteredAchievements = achievements.filter((a) => {
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.issuer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const verifiedCount = achievements.filter((a) => a.verification_status === "verified").length;
  const pendingCount = achievements.filter((a) => a.verification_status === "pending_review").length;
  const pendingAttributions = attributions.filter((attr) => attr.attribution_status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
            <span className="status-pip bg-cyan-500" />
            <span>HONORS & CREDENTIAL REGISTRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trust & Achievement Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Document verified competitive honors, certifications, research publications, and attributed team milestones.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider transition shadow-lg shadow-cyan-600/20 self-start md:self-auto"
        >
          <Plus size={15} />
          <span>RECORD ACHIEVEMENT</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">TOTAL ACHIEVEMENTS</span>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white mt-1">
            {achievements.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              VERIFIED TRUST
            </span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {verifiedCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
              PENDING AUDIT
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold">
              TEAM ATTRIBUTIONS
            </span>
            <Users size={16} className="text-violet-500" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-violet-600 dark:text-violet-400 mt-1">
            {attributions.length}
          </div>
        </div>
      </div>

      {/* Pending Team Attributions Banner */}
      {pendingAttributions.length > 0 && (
        <div className="p-5 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/20 to-indigo-950/20 backdrop-blur space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              <h3 className="text-xs font-mono font-bold text-violet-300 uppercase tracking-wider">
                Pending Team Achievement Attributions ({pendingAttributions.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
              ACTION REQUIRED
            </span>
          </div>
          <p className="text-xs text-slate-300">
            A team owner or admin attributed you as a contributor. Accept to add this milestone to your verified public portfolio.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingAttributions.map((attr) => (
              <div
                key={attr.contributor_id}
                className="p-3.5 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{attr.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Team: {attr.team_name} • Role: {attr.role_in_project}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAttributionResponse(attr.contributor_id, "accepted")}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 transition text-xs font-mono"
                    title="Accept Attribution"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleAttributionResponse(attr.contributor_id, "declined")}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition text-xs font-mono"
                    title="Decline Attribution"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, issuing organization, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D1017] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <span className="text-xs font-mono text-slate-400 self-center">
            Showing {filteredAchievements.length} of {achievements.length} records
          </span>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Cards Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0D1017]/50 space-y-3">
          <Award size={36} className="mx-auto text-slate-400 stroke-1" />
          <h3 className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">NO ACHIEVEMENTS FOUND</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "All"
              ? "No achievement matches current filters. Try resetting the filter."
              : "Start building your verified record. Add competitive awards, certificates, or open-source milestones."}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition"
          >
            <Plus size={13} /> <span>RECORD FIRST ACHIEVEMENT</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((item) => {
            const isVerified = item.verification_status === "verified";
            const isPending = item.verification_status === "pending_review";
            const isRejected = item.verification_status === "rejected";

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] hover:border-slate-300 dark:hover:border-white/20 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      {item.category}
                    </span>

                    {/* Status Pill */}
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck size={12} /> VERIFIED
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                        <Clock size={12} /> PENDING AUDIT
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertCircle size={12} /> REJECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-500 border border-slate-200 dark:border-white/10">
                        UNVERIFIED
                      </span>
                    )}
                  </div>

                  {/* Title & Issuer */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                      <span>{item.issuer}</span>
                      {item.event_name && <span>• {item.event_name}</span>}
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Date & Award Badge */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
                    {item.date_awarded && <span>Awarded: {item.date_awarded.split("T")[0]}</span>}
                    {item.position_award && (
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                        {item.position_award}
                      </span>
                    )}
                  </div>

                  {/* Evidence links */}
                  {item.credential_url && (
                    <div className="pt-1">
                      <a
                        href={item.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-cyan-500 hover:underline"
                      >
                        <ExternalLink size={12} />
                        <span>External Credential Link</span>
                      </a>
                    </div>
                  )}

                  {/* Rejection notice if present */}
                  {isRejected && item.verification_reason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300">
                      Feedback: {item.verification_reason}
                    </div>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div>
                    {!isVerified && !isPending && (
                      <button
                        onClick={() => setShowVerifyModal(item)}
                        className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                      >
                        <ShieldCheck size={13} />
                        <span>REQUEST VERIFICATION</span>
                      </button>
                    )}
                    {isVerified && (
                      <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified Credential
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-mono text-amber-400">Under Administrative Review</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 text-slate-400 hover:text-white transition"
                      title="Edit Achievement"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Delete Achievement"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Achievement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Award size={15} className="text-cyan-500" />
                <span>{editingItem ? "EDIT ACHIEVEMENT" : "RECORD NEW ACHIEVEMENT"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">TITLE / ACHIEVEMENT CLAIM *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Place - Smart India Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CATEGORY *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">ISSUING ENTITY / ORGANIZER *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ministry of Education / Google"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">EVENT / CONFERENCE / ORG</label>
                  <input
                    type="text"
                    placeholder="e.g. National Finals 2025"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">POSITION / AWARD TITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. Winner / Top 1% / Gold"
                    value={formData.position_award}
                    onChange={(e) => setFormData({ ...formData, position_award: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Outline the significance, project details, or competition metrics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">DATE AWARDED</label>
                  <input
                    type="date"
                    value={formData.date_awarded}
                    onChange={(e) => setFormData({ ...formData, date_awarded: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">VERIFICATION URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.credential_url}
                    onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-slate-900 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Certificate File Attachment */}
              <div>
                <label className="block text-slate-400 mb-1">UPLOAD CERTIFICATE EVIDENCE (PDF / PNG / JPG)</label>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setEvidenceFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="accent-cyan-500 rounded"
                />
                <label htmlFor="is_public" className="text-slate-300 cursor-pointer">
                  Publicly visible on verified portfolio & recruiter discovery
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-600/20"
                >
                  {submitting ? "SAVING..." : "COMMIT RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Request Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <ShieldCheck size={15} className="text-cyan-500" />
                <span>REQUEST ADMINISTRATIVE AUDIT</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifyModal(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Submitting for verification for: <strong className="text-white">{showVerifyModal.title}</strong>. NEXORA
              auditors will review the attached certificate document or credential registry link.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                SUPPORTING NOTES / REGISTRY IDENTIFIERS
              </label>
              <textarea
                rows={3}
                placeholder="Include certificate ID, registry verification instructions, or press release URL..."
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07090E] text-xs font-mono text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowVerifyModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-cyan-600/20"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT AUDIT REQUEST"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
