"use client";

import React, { useState, useRef } from "react";
import { apiRequest, getBackendBaseUrl } from "@/lib/api";
import { Camera, Trash2, Upload, Crop, ShieldCheck, CheckCircle2, Image as ImageIcon, X } from "lucide-react";

interface AvatarEditorProps {
  avatarUrl?: string | null;
  coverUrl?: string | null;
  name: string;
  isVerified?: boolean;
  onAvatarUpdated?: (newUrl: string | null) => void;
  onCoverUpdated?: (newUrl: string | null) => void;
  apiUrlPrefix?: string; // default "/talent/profile"
}

export default function AvatarEditor({
  avatarUrl,
  coverUrl,
  name,
  isVerified = false,
  onAvatarUpdated,
  onCoverUpdated,
  apiUrlPrefix = "/talent/profile",
}: AvatarEditorProps) {
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(avatarUrl || null);
  const [currentCover, setCurrentCover] = useState<string | null>(coverUrl || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [previewModal, setPreviewModal] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Compute initials fallback
  const getInitials = (n: string) => {
    if (!n) return "NX";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTempFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewModal(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAvatarUpload = async () => {
    if (!tempFile) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", tempFile);

    try {
      const data = await apiRequest(`${apiUrlPrefix}/avatar`, {
        method: "POST",
        body: formData,
      });

      const updatedUrl = data.avatar_url;
      setCurrentAvatar(updatedUrl);
      if (onAvatarUpdated) onAvatarUpdated(updatedUrl);
      setPreviewModal(null);
      setTempFile(null);
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    setUploadingAvatar(true);
    try {
      await apiRequest(`${apiUrlPrefix}/avatar`, {
        method: "DELETE",
      });

      setCurrentAvatar(null);
      if (onAvatarUpdated) onAvatarUpdated(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiRequest(`${apiUrlPrefix}/cover`, {
        method: "POST",
        body: formData,
      });

      setCurrentCover(data.cover_image_url);
      if (onCoverUpdated) onCoverUpdated(data.cover_image_url);
    } catch (err: any) {
      alert(err.message || "Failed to upload cover");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!confirm("Remove cover banner?")) return;
    setUploadingCover(true);
    try {
      await apiRequest(`${apiUrlPrefix}/cover`, {
        method: "DELETE",
      });

      setCurrentCover(null);
      if (onCoverUpdated) onCoverUpdated(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove cover banner");
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0D1017] overflow-hidden mb-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarSelect}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverSelect}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Profile Cover Banner */}
      <div className="relative h-40 sm:h-48 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-200/70 dark:border-white/[0.06] overflow-hidden group">
        {currentCover ? (
          <img
            src={currentCover.startsWith("http") ? currentCover : `${getBackendBaseUrl()}${currentCover}`}
            alt="Profile Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        {/* Cover Action Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur border border-white/20 text-white text-[11px] font-mono tracking-wider transition"
          >
            <ImageIcon size={13} />
            <span>{uploadingCover ? "UPLOADING..." : currentCover ? "REPLACE BANNER" : "ADD BANNER"}</span>
          </button>
          {currentCover && (
            <button
              type="button"
              onClick={handleRemoveCover}
              disabled={uploadingCover}
              className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white transition"
              title="Remove Banner"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Avatar & Identity Bar */}
      <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14">
        <div className="flex items-end gap-4">
          {/* Avatar Container */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white dark:ring-[#0D1017] shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center relative">
              {currentAvatar ? (
                <img
                  src={currentAvatar.startsWith("http") ? currentAvatar : `${getBackendBaseUrl()}${currentAvatar}`}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-white tracking-widest font-mono">
                  {getInitials(name)}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono font-bold tracking-wider"
              >
                <Camera size={18} className="mb-1" />
                <span>CHANGE</span>
              </button>
            </div>

            {/* Verified Trust Shield Badge */}
            {isVerified && (
              <div
                className="absolute -bottom-1 -right-1 bg-cyan-500 text-white rounded-full p-1 ring-2 ring-white dark:ring-[#0D1017] shadow-lg"
                title="Verified Talent Identity"
              >
                <ShieldCheck size={16} />
              </div>
            )}
          </div>

          {/* User Name & Metadata */}
          <div className="pt-2 sm:pt-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name || "Talent Member"}</h3>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <ShieldCheck size={11} /> VERIFIED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Formats: PNG, JPG, WebP • Auto-optimized to 256x256 WebP
            </p>
          </div>
        </div>

        {/* Avatar Actions */}
        <div className="flex items-center gap-2 self-start sm:self-end">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 bg-slate-50 dark:bg-white/[0.03] text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            <Upload size={13} />
            <span>{uploadingAvatar ? "PROCESSING..." : "UPLOAD PHOTO"}</span>
          </button>
          {currentAvatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={uploadingAvatar}
              className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Remove profile photo"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Crop & Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0E131F] rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Crop size={14} className="text-cyan-500" />
                <span>ADJUST & OPTIMIZE AVATAR</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewModal(null);
                  setTempFile(null);
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Circular Preview Area */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-44 h-44 rounded-full overflow-hidden ring-4 ring-cyan-500/30 shadow-2xl relative bg-black flex items-center justify-center">
                <img
                  src={previewModal}
                  alt="Crop preview"
                  className="w-full h-full object-cover transition-transform duration-100"
                  style={{ transform: `scale(${cropZoom})` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-3">1:1 Square Thumbnail (256x256 WebP)</span>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>ZOOM / SCALE</span>
                <span>{cropZoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-200 dark:bg-white/10 rounded-lg h-1.5"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setPreviewModal(null);
                  setTempFile(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-700 dark:hover:text-white transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmAvatarUpload}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold tracking-wider transition shadow-lg shadow-cyan-600/20"
              >
                <CheckCircle2 size={14} />
                <span>{uploadingAvatar ? "PROCESSING..." : "CONFIRM & SAVE"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
