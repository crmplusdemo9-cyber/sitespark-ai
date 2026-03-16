"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Flag,
  MoreVertical,
  Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import toast from "react-hot-toast";

export default function AdminSitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "flagged">("all");
  const supabase = createClient();

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    setLoading(true);
    const { data } = await supabase
      .from("sites")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false });

    setSites(data || []);
    setLoading(false);
  }

  async function togglePublish(siteId: string, published: boolean) {
    const { error } = await supabase
      .from("sites")
      .update({ published: !published })
      .eq("id", siteId);

    if (!error) {
      toast.success(published ? "Site unpublished" : "Site published");
      loadSites();
    }
    setActionMenu(null);
  }

  async function flagSite(siteId: string, reason: string) {
    const { error } = await supabase
      .from("sites")
      .update({
        flagged: true,
        flag_reason: reason,
        flagged_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (!error) {
      toast.success("Site flagged for review");
      loadSites();
    }
    setActionMenu(null);
  }

  async function deleteSite(siteId: string) {
    if (!confirm("Permanently delete this site? This cannot be undone.")) return;

    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("id", siteId);

    if (!error) {
      toast.success("Site deleted");
      loadSites();
    }
    setActionMenu(null);
  }

  const filteredSites = sites.filter((s) => {
    if (filter === "published") return s.published;
    if (filter === "draft") return !s.published;
    if (filter === "flagged") return s.flagged;
    return true;
  });

  const published = sites.filter((s) => s.published).length;
  const flagged = sites.filter((s) => s.flagged).length;
  const totalViews = sites.reduce((sum, s) => sum + (s.views || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sites</h1>
          <p className="text-sm text-gray-500">All user-created websites</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Sites" value={sites.length} icon={Globe} iconColor="text-blue-400" iconBg="bg-blue-500/20" loading={loading} />
        <StatCard title="Published" value={published} icon={Eye} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" loading={loading} />
        <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} iconColor="text-amber-400" iconBg="bg-amber-500/20" loading={loading} />
        <StatCard title="Flagged" value={flagged} icon={Flag} iconColor="text-red-400" iconBg="bg-red-500/20" loading={loading} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1 w-fit">
        {(["all", "published", "draft", "flagged"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
              filter === f ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {f} {f === "flagged" && flagged > 0 ? `(${flagged})` : ""}
          </button>
        ))}
      </div>

      {/* Sites Table */}
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
                  <p className="text-xs text-gray-500">
                    {row.custom_domain || `${row.slug}.sitespark.dev`}
                  </p>
                </div>
                {row.flagged && (
                  <Flag className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
            ),
          },
          {
            key: "profiles",
            label: "Owner",
            render: (row) => (
              <div>
                <p className="text-xs text-gray-300">{row.profiles?.full_name || "—"}</p>
                <p className="text-xs text-gray-500">{row.profiles?.email}</p>
              </div>
            ),
          },
          {
            key: "published",
            label: "Status",
            render: (row) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                row.flagged ? "bg-red-500/20 text-red-400" :
                row.published ? "bg-emerald-500/20 text-emerald-400" :
                "bg-gray-800 text-gray-500"
              }`}>
                {row.flagged ? "FLAGGED" : row.published ? "LIVE" : "DRAFT"}
              </span>
            ),
          },
          {
            key: "views",
            label: "Views",
            render: (row) => <span className="text-gray-400">{(row.views || 0).toLocaleString()}</span>,
          },
          {
            key: "niche",
            label: "Niche",
            render: (row) => <span className="text-gray-500 text-xs truncate max-w-[120px] block">{row.niche || "—"}</span>,
          },
          {
            key: "created_at",
            label: "Created",
            render: (row) => (
              <span className="text-gray-500 text-xs">
                {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            ),
          },
        ]}
        data={filteredSites}
        loading={loading}
        searchKeys={["name", "slug", "niche"]}
        actions={(row) => (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === row.id ? null : row.id); }}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {actionMenu === row.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                  <a
                    href={`/sites/${row.slug}`}
                    target="_blank"
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Site
                  </a>
                  <button
                    onClick={() => togglePublish(row.id, row.published)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    {row.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {row.published ? "Unpublish" : "Publish"}
                  </button>
                  {!row.flagged && (
                    <button
                      onClick={() => flagSite(row.id, "Manual admin review")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-gray-700"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Flag for Review
                    </button>
                  )}
                  <button
                    onClick={() => deleteSite(row.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-gray-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}
