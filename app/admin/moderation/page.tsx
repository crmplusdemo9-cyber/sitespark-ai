"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  Eye,
  Check,
  X,
  ExternalLink,
  Shield,
  AlertTriangle,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import toast from "react-hot-toast";

export default function AdminModerationPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"flagged" | "all" | "reviewed">("flagged");
  const supabase = createClient();

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setLoading(true);
    const { data } = await supabase
      .from("sites")
      .select("*, profiles(email, full_name)")
      .order("flagged_at", { ascending: false });

    setSites(data || []);
    setLoading(false);
  }

  async function approveSite(siteId: string) {
    const { error } = await supabase
      .from("sites")
      .update({
        flagged: false,
        flag_reason: null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (!error) {
      toast.success("Site approved");
      loadSites();
    }
  }

  async function rejectSite(siteId: string) {
    const { error } = await supabase
      .from("sites")
      .update({
        flagged: true,
        published: false,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (!error) {
      toast.success("Site rejected and unpublished");
      loadSites();
    }
  }

  const flaggedSites = sites.filter((s) => s.flagged);
  const reviewedSites = sites.filter((s) => s.reviewed_at);

  const filteredSites =
    filter === "flagged" ? flaggedSites :
    filter === "reviewed" ? reviewedSites :
    sites;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
        <p className="text-sm text-gray-500">Review flagged sites and manage content policies</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Flagged Sites" value={flaggedSites.length} icon={Flag} iconColor="text-red-400" iconBg="bg-red-500/20" loading={loading} />
        <StatCard title="Reviewed" value={reviewedSites.length} icon={Shield} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" loading={loading} />
        <StatCard title="Total Published" value={sites.filter(s => s.published).length} icon={Eye} iconColor="text-blue-400" iconBg="bg-blue-500/20" loading={loading} />
      </div>

      {/* Alert */}
      {flaggedSites.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">
              {flaggedSites.length} site{flaggedSites.length > 1 ? "s" : ""} flagged for review
            </p>
            <p className="text-xs text-red-400/70 mt-0.5">
              Review content below and approve or reject
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1 w-fit">
        {(["flagged", "all", "reviewed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
              filter === f ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {f} {f === "flagged" ? `(${flaggedSites.length})` : ""}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            label: "Site",
            render: (row) => (
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${row.content?.colorScheme?.primary || "#4263eb"}50, ${row.content?.colorScheme?.secondary || "#748ffc"}30)`,
                  }}
                />
                <div>
                  <p className="font-medium text-gray-200">{row.name}</p>
                  <p className="text-xs text-gray-500">{row.slug}.sitespark.dev</p>
                </div>
              </div>
            ),
          },
          {
            key: "profiles",
            label: "Owner",
            render: (row) => (
              <span className="text-xs text-gray-400">{row.profiles?.email || "—"}</span>
            ),
          },
          {
            key: "flag_reason",
            label: "Reason",
            render: (row) => (
              <span className="text-xs text-amber-400">{row.flag_reason || "—"}</span>
            ),
          },
          {
            key: "flagged",
            label: "Status",
            render: (row) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                row.flagged ? "bg-red-500/20 text-red-400" :
                row.reviewed_at ? "bg-emerald-500/20 text-emerald-400" :
                "bg-gray-800 text-gray-500"
              }`}>
                {row.flagged ? "FLAGGED" : row.reviewed_at ? "APPROVED" : "OK"}
              </span>
            ),
          },
          {
            key: "flagged_at",
            label: "Flagged",
            render: (row) => (
              <span className="text-xs text-gray-500">
                {row.flagged_at ? new Date(row.flagged_at).toLocaleDateString() : "—"}
              </span>
            ),
          },
        ]}
        data={filteredSites}
        loading={loading}
        searchKeys={["name", "slug", "flag_reason"]}
        emptyMessage={filter === "flagged" ? "No flagged sites — all clear! 🎉" : "No sites found"}
        actions={(row) =>
          row.flagged ? (
            <>
              <a
                href={`/sites/${row.slug}`}
                target="_blank"
                className="rounded-lg bg-gray-800 p-1.5 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition"
                title="Preview"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => approveSite(row.id)}
                className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-500 transition"
                title="Approve"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => rejectSite(row.id)}
                className="rounded-lg bg-red-600/30 p-1.5 text-red-400 hover:bg-red-600/40 transition"
                title="Reject & Unpublish"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <a
              href={`/sites/${row.slug}`}
              target="_blank"
              className="rounded-lg bg-gray-800 p-1.5 text-gray-400 hover:bg-gray-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )
        }
      />
    </div>
  );
}
