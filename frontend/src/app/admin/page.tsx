"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  Shield,
  Cpu,
  Users,
  Briefcase,
  Sparkles,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Power,
  Sliders,
  Play,
  Pause,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"ai" | "users" | "jobs" | "audit">("ai");
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Connection Test State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchAdminData = async () => {
    try {
      const [analyticsData, aiData, usersData, jobsData, auditData] = await Promise.all([
        apiRequest<any>("/admin/analytics"),
        apiRequest<any>("/ai/status"),
        apiRequest<any[]>("/admin/users"),
        apiRequest<any[]>("/admin/jobs"),
        apiRequest<any[]>("/admin/audit-logs"),
      ]);
      setAnalytics(analyticsData);
      setAiStatus(aiData);
      setUsers(usersData);
      setJobs(jobsData);
      setAuditLogs(auditData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await apiRequest("/ai/test-connection");
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ status: "error", message: e.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleToggleUser = async (userId: number) => {
    try {
      await apiRequest(`/admin/users/${userId}/toggle-status`, { method: "PUT" });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (e: any) {
      alert(e.message || "Failed to update user status.");
    }
  };

  const handleModerateJob = async (jobId: number, status: string) => {
    try {
      await apiRequest(`/admin/jobs/${jobId}/moderate`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status } : j))
      );
    } catch (e: any) {
      alert(e.message || "Failed to moderate job.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/20 bg-gradient-to-r from-purple-50/50 via-slate-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:via-slate-900/40 dark:to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Platform Administration & AI Operations
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time monitoring of AI request latencies, deterministic ontology health, and user moderation.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 glass-panel hover:bg-slate-100 flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Refresh Metrics
        </button>
      </div>

      {/* Top Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {analytics?.total_users ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">
            {analytics?.total_recruiters ?? 0} Recruiters • {analytics?.total_talents ?? 0} Talent
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Opportunities</span>
            <Briefcase size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {analytics?.total_jobs ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">{analytics?.published_jobs ?? 0} published & active</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Matches Generated</span>
            <Sparkles size={16} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
            {analytics?.total_matches_generated ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">5-pillar hybrid scoring</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">AI Gateway Requests</span>
            <Activity size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {analytics?.ai_requests_count ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">{analytics?.ai_success_rate ?? 100}% success rate</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "ai"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          AI Administration & Gateway
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "users"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          User Accounts Moderation
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "jobs"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Job Postings Moderation
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "audit"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* TAB 1: AI ADMINISTRATION & MONITORING */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Provider Card */}
            <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Configured Gateway
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold uppercase">
                  {aiStatus?.selected_provider}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Model: {aiStatus?.selected_model}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Provider abstraction: {aiStatus?.selected_provider === "gemini" ? "Google Gemini REST JSON" : "xAI Grok REST"}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Activity size={14} />
                  {testingConnection ? "Pinging Provider API..." : "Test Connection & Latency"}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.status === "connected"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-500/20"
                  }`}
                >
                  {testResult.status === "connected" ? (
                    <CheckCircle size={15} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {testResult.status === "connected" ? "Connection Successful" : "Connection Notice"}
                    </div>
                    <div className="text-[11px] opacity-90">{testResult.message}</div>
                    {testResult.latency_ms > 0 && (
                      <div className="text-[10px] font-mono mt-1 font-bold">
                        Roundtrip Latency: {testResult.latency_ms}ms
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Matching Weights Configuration */}
            <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-200 dark:border-white/10 md:col-span-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders size={16} className="text-purple-500" />
                  Deterministic Matching Configuration
                </h3>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                  Threshold: {aiStatus?.match_threshold}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] text-slate-500">Mandatory</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">40%</div>
                  <div className="text-[9px] text-emerald-600 mt-1 font-semibold">Strict Gate</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] text-slate-500">Preferred</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">20%</div>
                  <div className="text-[9px] text-slate-400 mt-1">Bonus stack</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] text-slate-500">Projects</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">20%</div>
                  <div className="text-[9px] text-slate-400 mt-1">Repo evidence</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] text-slate-500">Experience</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">10%</div>
                  <div className="text-[9px] text-slate-400 mt-1">Normalized yrs</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5">
                  <div className="text-[10px] text-slate-500">Availability</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">10%</div>
                  <div className="text-[9px] text-slate-400 mt-1">Work mode</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 leading-relaxed">
                NEXORA enforces strict deterministic scoring: candidates lacking mandatory competencies are
                prevented from receiving recruitment match notifications, regardless of their semantic similarity score.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Details / Company</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-4 text-slate-500 font-mono">{u.email}</td>
                    <td className="p-4 uppercase font-mono font-bold text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{u.details}</td>
                    <td className="p-4">
                      {u.is_active ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-500">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                          u.is_active
                            ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200"
                            : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                        }`}
                      >
                        {u.is_active ? "Suspend" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JOB MODERATION */}
      {activeTab === "jobs" && (
        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Recruiter</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{j.title}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{j.company_name}</td>
                    <td className="p-4 text-slate-500">{j.recruiter_name}</td>
                    <td className="p-4 font-mono">{j.employment_type}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {j.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {j.status !== "published" && (
                        <button
                          onClick={() => handleModerateJob(j.id, "published")}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-600 text-white"
                        >
                          Publish
                        </button>
                      )}
                      {j.status === "published" && (
                        <button
                          onClick={() => handleModerateJob(j.id, "paused")}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-600 text-white"
                        >
                          Pause
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4 font-bold text-purple-600 dark:text-purple-400">
                      {log.action}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{log.target_type || "—"}</td>
                    <td className="p-4 text-slate-500">{log.target_id || "—"}</td>
                    <td className="p-4 text-slate-400">{log.created_at ? log.created_at.split("T")[0] : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
