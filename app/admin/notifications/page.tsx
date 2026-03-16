"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Shield,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success" | "approval";
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  read: boolean;
  dismissed: boolean;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("dismissed", false)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All marked as read");
  }

  async function dismiss(id: string) {
    await supabase.from("admin_notifications").update({ dismissed: true }).eq("id", id);
    setNotifications(notifications.filter((n) => n.id !== id));
  }

  const icons: Record<string, React.ElementType> = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle2,
    approval: Shield,
  };

  const colors: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400" },
    error: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-400" },
    success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400" },
    approval: { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "text-purple-400" },
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-800" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-gray-700" />
          <p className="mt-3 text-sm text-gray-500">No notifications</p>
          <p className="text-xs text-gray-600">System events will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = icons[notif.type] || Info;
            const color = colors[notif.type] || colors.info;

            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-4 transition-colors ${
                  notif.read ? "border-gray-800 bg-gray-900" : `${color.bg} ${color.border}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${notif.read ? "text-gray-600" : color.icon}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${notif.read ? "text-gray-400" : "text-white"}`}>
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{notif.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] text-gray-600">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                      {notif.action_url && (
                        <a
                          href={notif.action_url}
                          className="flex items-center gap-1 text-[10px] font-medium text-brand-400 hover:text-brand-300"
                        >
                          {notif.action_label || "View"} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition"
                        title="Mark read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition"
                      title="Dismiss"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
