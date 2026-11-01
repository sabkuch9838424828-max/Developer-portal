"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user || !token) return;
    try {
      const data = await apiRequest<NotificationItem[]>("/notifications");
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!user || !token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user, token]);

  const markAsRead = async (id: number) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!user || !token) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all duration-200 border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-cyan-400 shadow-sm"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 py-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    !n.is_read
                      ? "bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-500"
                      : "hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {n.title}
                    </span>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-cyan-400 hover:underline mt-2 font-medium"
                    >
                      View details <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
