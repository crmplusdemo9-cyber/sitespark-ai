"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Globe,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Crown,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Site, User } from "@/lib/types";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = "/auth/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const { data: userSites } = await supabase
        .from("sites")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      setUser(profile as User);
      setSites((userSites as Site[]) || []);
      setLoading(false);
    }

    loadData();
  }, [supabase]);

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm("Are you sure? This will unpublish your site.")) return;

    const { error } = await supabase.from("sites").delete().eq("id", siteId);

    if (!error) {
      setSites(sites.filter((s) => s.id !== siteId));
      toast.success("Site deleted");
    }
  };

  const handleUpgrade = async () => {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Sparkles className="h-8 w-8 animate-pulse text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {user?.plan === "free" && (
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </button>
            )}
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 capitalize">
              {user?.plan} Plan
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Total Sites", value: sites.length, icon: Globe },
            {
              label: "Published",
              value: sites.filter((s) => s.published).length,
              icon: Eye,
            },
            {
              label: "Total Views",
              value: sites.reduce((sum, s) => sum + (s.views || 0), 0),
              icon: BarChart3,
            },
            { label: "Plan", value: user?.plan?.toUpperCase() || "FREE", icon: Crown },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Sites List */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Your Sites</h2>
          <a
            href="/builder"
            className="btn-glow flex items-center gap-2 !py-2 !px-4 text-sm"
          >
            <Plus className="h-4 w-4" />
            New Site
          </a>
        </div>

        {sites.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold">No sites yet</h3>
            <p className="mt-2 text-gray-500">
              Create your first AI-powered website in 30 seconds.
            </p>
            <a
              href="/builder"
              className="btn-glow mt-6 inline-flex items-center gap-2 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Create Your First Site
            </a>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site, i) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-100 bg-white overflow-hidden card-hover"
              >
                {/* Site preview thumbnail */}
                <div
                  className="aspect-[16/10] p-4"
                  style={{
                    background: `linear-gradient(135deg, ${
                      (site.content as any)?.colorScheme?.primary || "#4263eb"
                    }20, ${
                      (site.content as any)?.colorScheme?.secondary || "#748ffc"
                    }10)`,
                  }}
                >
                  <div className="flex h-full items-center justify-center">
                    <p className="text-lg font-bold opacity-50">{site.name}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{site.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        site.published
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {site.published ? "Live" : "Draft"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {site.custom_domain || `${site.slug}.sitespark.dev`}
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {site.views || 0} views
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <a
                      href={`/builder?edit=${site.id}`}
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </a>
                    {site.published && (
                      <a
                        href={`/sites/${site.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 transition"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteSite(site.id)}
                      className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
