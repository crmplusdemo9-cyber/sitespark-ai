"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Download,
  Trash2,
  Send,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import toast from "react-hot-toast";

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadWaitlist();
  }, []);

  async function loadWaitlist() {
    setLoading(true);
    const { data } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    setEntries(data || []);
    setLoading(false);
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (!error) {
      setEntries(entries.filter((e) => e.id !== id));
      toast.success("Entry removed");
    }
  }

  function exportCSV() {
    const csv = [
      "Email,Source,Signed Up",
      ...entries.map((e) => `${e.email},${e.source || "website"},${e.created_at}`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitespark-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Waitlist exported to CSV");
  }

  function copyEmails() {
    const emails = entries.map((e) => e.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success(`${entries.length} emails copied to clipboard`);
  }

  const todayEntries = entries.filter((e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(e.created_at) >= today;
  }).length;

  const thisWeekEntries = entries.filter((e) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(e.created_at) >= weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Waitlist</h1>
          <p className="text-sm text-gray-500">Pre-launch email signups</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyEmails}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            <Send className="h-4 w-4" />
            Copy Emails
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-500 transition"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Signups" value={entries.length} icon={Mail} iconColor="text-blue-400" iconBg="bg-blue-500/20" loading={loading} />
        <StatCard title="Today" value={todayEntries} icon={Calendar} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" loading={loading} />
        <StatCard title="This Week" value={thisWeekEntries} icon={Clock} iconColor="text-purple-400" iconBg="bg-purple-500/20" loading={loading} />
        <StatCard title="Growth Rate" value={`${thisWeekEntries > 0 ? "+"+thisWeekEntries : "0"}/wk`} icon={Users} iconColor="text-amber-400" iconBg="bg-amber-500/20" loading={loading} />
      </div>

      {/* Waitlist Table */}
      <DataTable
        columns={[
          {
            key: "email",
            label: "Email",
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  {row.email?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-gray-200">{row.email}</span>
              </div>
            ),
          },
          {
            key: "source",
            label: "Source",
            render: (row) => (
              <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400 capitalize">
                {row.source || "website"}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Signed Up",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {new Date(row.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ),
          },
        ]}
        data={entries}
        loading={loading}
        searchKeys={["email", "source"]}
        actions={(row) => (
          <button
            onClick={() => deleteEntry(row.id)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      />
    </div>
  );
}
