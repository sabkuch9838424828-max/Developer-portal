"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Info,
  Key,
  Eye,
  EyeOff,
  Terminal,
  Activity,
  FileCheck2,
} from "lucide-react";

export default function IdentityVerificationCenterPage() {
  const [identityData, setIdentityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("digilocker_sandbox");
  const [selectedMethod, setSelectedMethod] = useState("government_photo_id");
  const [showConsentTerms, setShowConsentTerms] = useState(false);

  const fetchIdentityStatus = async () => {
    try {
      const data = await apiRequest("/talent/identity/status");
      setIdentityData(data);
    } catch (e) {
      console.error("Failed to load identity status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentityStatus();
  }, []);

  const handleGrantConsent = async () => {
    setActionLoading(true);
    try {
      await apiRequest("/talent/identity/consent", {
        method: "POST",
        body: JSON.stringify({ consent_type: "government_identity_verification" }),
      });
      await fetchIdentityStatus();
    } catch (e: any) {
      alert(e.message || "Failed to record consent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    if (!confirm("Withdrawing consent will clear your verified badge and identity credentials. Proceed?")) return;
    setActionLoading(true);
    try {
      await apiRequest("/talent/identity/consent/withdraw", {
        method: "POST",
      });
      await fetchIdentityStatus();
    } catch (e: any) {
      alert(e.message || "Failed to withdraw consent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitiateSession = async () => {
    setActionLoading(true);
    try {
      await apiRequest("/talent/identity/session", {
        method: "POST",
        body: JSON.stringify({
          provider: selectedProvider,
          verification_method: selectedMethod,
        }),
      });
      await fetchIdentityStatus();
    } catch (e: any) {
      alert(e.message || "Failed to initiate verification session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateDecision = async (decision: "verified" | "failed", reason?: string) => {
    setActionLoading(true);
    try {
      await apiRequest("/talent/identity/simulate", {
        method: "POST",
        body: JSON.stringify({ decision, reason }),
      });
      await fetchIdentityStatus();
    } catch (e: any) {
      alert(e.message || "Failed to simulate verification");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDisclosure = async (newVal: boolean) => {
    try {
      await apiRequest("/talent/identity/disclosure", {
        method: "POST",
        body: JSON.stringify({ disclosed: newVal }),
      });
      setIdentityData((prev: any) => ({ ...prev, disclosed_to_recruiters: newVal }));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const isVerified = identityData?.status === "verified";
  const isPending = identityData?.status === "pending";
  const isFailed = identityData?.status === "failed";
  const hasConsent = identityData?.has_active_consent;

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
          <span className="status-pip bg-cyan-500" />
          <span>CRYPTOGRAPHIC TALENT ATTESTATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Government Identity Verification Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Establish authentic verified developer credentials with privacy-preserving zero-knowledge attestations.
          No raw Aadhaar numbers or government document scans are permanently stored.
        </p>
      </div>

      {/* Privacy Architecture Notice */}
      <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] flex items-start gap-3">
        <Lock size={18} className="text-cyan-500 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed space-y-1">
          <div className="font-bold text-cyan-600 dark:text-cyan-400 font-mono text-[11px] uppercase tracking-wider">
            Zero-Knowledge Privacy Preservation Guarantee
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            NEXORA complies with strict Indian digital personal data protection mandates. Verification is mediated via
            authorized gateways (DigiLocker / HyperVerge). We only store signed cryptographic reference tokens and
            timestamp validity. Your biometric data and raw identity scans are never retained on our servers.
          </p>
        </div>
      </div>

      {/* Status Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Status Avatar Shield */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
                isVerified
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : isPending
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse"
                  : isFailed
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  : "bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-400"
              }`}
            >
              {isVerified ? (
                <ShieldCheck size={32} />
              ) : isPending ? (
                <Clock size={32} />
              ) : isFailed ? (
                <ShieldAlert size={32} />
              ) : (
                <Key size={30} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isVerified
                    ? "Government Identity Verified"
                    : isPending
                    ? "Identity Verification In Progress"
                    : isFailed
                    ? "Verification Attempt Unsuccessful"
                    : "Identity Verification Not Started"}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${
                    isVerified
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : isPending
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : isFailed
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 border-slate-200 dark:border-white/10"
                  }`}
                >
                  {identityData?.status || "NOT_STARTED"}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {isVerified && identityData.verified_at && (
                  <span>Verified On: {new Date(identityData.verified_at).toLocaleDateString()} • Expires in 365 days</span>
                )}
                {isPending && <span>Active session established. Awaiting trust partner confirmation callback.</span>}
                {isFailed && <span>Reason: {identityData.failure_reason || "Document mismatch or blurry photo."}</span>}
                {!isVerified && !isPending && !isFailed && (
                  <span>Verify once to unlock the Verified Talent Trust badge across all recruiter searches.</span>
                )}
              </p>
            </div>
          </div>

          {/* Top Hero Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isVerified && (
              <button
                onClick={handleWithdrawConsent}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-mono text-xs font-semibold transition"
              >
                WITHDRAW CONSENT
              </button>
            )}
            {!isVerified && !hasConsent && (
              <button
                onClick={handleGrantConsent}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider transition shadow-lg shadow-cyan-600/20"
              >
                {actionLoading ? "RECORDING..." : "GRANT CONSENT & BEGIN"}
              </button>
            )}
          </div>
        </div>

        {/* Recruiter Trust Disclosure Bar */}
        {isVerified && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {identityData.disclosed_to_recruiters ? (
                <Eye size={16} className="text-emerald-500" />
              ) : (
                <EyeOff size={16} className="text-slate-400" />
              )}
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white">Recruiter Trust Visibility</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {identityData.disclosed_to_recruiters
                    ? "Verified badge is visible on your profile and candidate search cards."
                    : "Verified badge is hidden from recruiters and company searches."}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleToggleDisclosure(!identityData.disclosed_to_recruiters)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              {identityData.disclosed_to_recruiters ? "HIDE FROM RECRUITERS" : "SHOW TO RECRUITERS"}
            </button>
          </div>
        )}
      </div>

      {/* Verification Launch & Workflow Configuration */}
      {!isVerified && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-6">
          <div className="border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Verification Pipeline Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select authorized credential verification method and identity trust gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gateway Selector */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                TRUST PARTNER / VERIFICATION GATEWAY
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07090E] text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              >
                <option value="digilocker_sandbox">DigiLocker Sandbox (Govt of India)</option>
                <option value="hyperverge_gateway">HyperVerge AI Trust Gateway</option>
                <option value="persona_id">Persona Global Identity Verification</option>
              </select>
            </div>

            {/* Method Selector */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                VERIFICATION METHOD
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#07090E] text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              >
                <option value="government_photo_id">Government Photo ID + Liveness Check</option>
                <option value="digilocker_credential">DigiLocker Digital Credential Direct</option>
                <option value="enterprise_sso">Enterprise Organization SSO Attestation</option>
              </select>
            </div>
          </div>

          {/* Consent Status Check */}
          {!hasConsent ? (
            <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                <AlertTriangle size={15} /> <span>USER CONSENT REQUIRED TO PROCEED</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                You must grant explicit consent before NEXORA can initiate an identity verification check with third-party
                trust gateways.
              </p>
              <button
                onClick={handleGrantConsent}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition shadow-md shadow-cyan-600/20"
              >
                {actionLoading ? "RECORDING..." : "GRANT EXPLICIT CONSENT"}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} /> <span>CONSENT ACTIVE (VERSION {identityData.consent_version || "v1.0"})</span>
              </div>
              <button
                onClick={handleWithdrawConsent}
                className="text-xs font-mono text-rose-400 hover:underline"
              >
                Withdraw
              </button>
            </div>
          )}

          {/* Launch Session Button */}
          {hasConsent && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleInitiateSession}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider transition shadow-lg shadow-cyan-600/20"
              >
                <ExternalLink size={14} />
                <span>{actionLoading ? "INITIALIZING..." : "LAUNCH SECURE VERIFICATION SESSION"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Developer Sandbox Simulation Controls */}
      <div className="p-6 rounded-3xl border border-dashed border-cyan-500/30 bg-cyan-500/[0.02] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            <Terminal size={15} />
            <span>DEVELOPER SANDBOX SIMULATION (ZERO API COST)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">DEMO MODE ACTIVE</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Simulate verified or failed identity checks instantly in local developer mode to verify real-time trust badge
          display, recruiter filter eligibility, and notification dispatch.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => handleSimulateDecision("verified")}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-md shadow-emerald-600/20"
          >
            <ShieldCheck size={14} />
            <span>SIMULATE SUCCESSFUL VERIFICATION</span>
          </button>
          <button
            onClick={() => handleSimulateDecision("failed", "Simulated document blurriness or mismatch")}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition shadow-md shadow-rose-600/20"
          >
            <ShieldAlert size={14} />
            <span>SIMULATE FAILED VERIFICATION</span>
          </button>
          <button
            onClick={handleWithdrawConsent}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-400 text-slate-400 hover:text-white font-mono text-xs font-bold transition"
          >
            <RotateCcw size={13} />
            <span>RESET TO NOT STARTED</span>
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      {identityData?.events && identityData.events.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-cyan-500" />
              <span>Identity Verification Audit Trail</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">IMMUTABLE LOGS</span>
          </div>

          <div className="space-y-3">
            {identityData.events.map((ev: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="mt-1 h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
                <div className="flex-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {ev.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Status: {ev.provider_status || "OK"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
