"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/admin/StatCard";
import MiniChart from "@/components/admin/MiniChart";
import DataTable from "@/components/admin/DataTable";

export default function AdminAnalyticsPage() {
  const [views, setViews] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [timeRange]);

  async function loadData() {
    setLoading(true);
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [{ data: viewsData }, { data: sitesData }] = await Promise.all([
      supabase.from("site_views").select("*").gte("created_at", since.toISOString()).order("created_at", { ascending: false }),
      supabase.from("sites").select("id, name, slug, views, published, niche, content").eq("published", true).order("views", { ascending: false }),
    ]);

    setViews(viewsData || []);
    setSites(sitesData || []);
    setLoading(false);
  }

  // Time series
  const viewsTimeSeries = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const grouped: Record<string, number> = {};

    views.forEach((v) => {
      const date = new Date(v.created_at).toISOString().split("T")[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    const result: { date: string; value: number }[] = [];
    const cursor = new Date(since);
    while (cursor <= new Date()) {
      const date = cursor.toISOString().split("T")[0];
      result.push({ date, value: grouped[date] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [views, timeRange]);

  // Device breakdown
  const deviceBreakdown = useMemo(() => {
    const counts = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    views.forEach((v) => {
      const device = v.device || "unknown";
      counts[device as keyof typeof counts] = (counts[device as keyof typeof counts] || 0) + 1;
    });
    return counts;
  }, [views]);

  // Top referrers
  const topReferrers = useMemo(() => {
    const counts: Record<string, number> = {};
    views.forEach((v) => {
      const ref = v.referrer || "Direct";
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }));
  }, [views]);

  // Top countries
  const topCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    views.forEach((v) => {
      const country = v.country || "Unknown";
      counts[country] = (counts[country] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  }, [views]);

  const totalViews = views.length;
  const uniqueVisitors = new Set(views.map((v) => v.visitor_id).filter(Boolean)).size;
  const avgViewsPerDay = viewsTimeSeries.length > 0
    ? Math.round(totalViews / viewsTimeSeries.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500">Traffic, engagement, and usage insights</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                timeRange === range ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} iconColor="text-blue-400" iconBg="bg-blue-500/20" loading={loading} />
        <StatCard title="Unique Visitors" value={uniqueVisitors.toLocaleString()} icon={BarChart3} iconColor="text-purple-400" iconBg="bg-purple-500/20" loading={loading} />
        <StatCard title="Avg/Day" value={avgViewsPerDay.toLocaleString()} icon={TrendingUp} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" loading={loading} />
        <StatCard title="Published Sites" value={sites.length.toLocaleString()} icon={Globe} iconColor="text-amber-400" iconBg="bg-amber-500/20" loading={loading} />
      </div>

      {/* Views Chart */}
      <MiniChart
        data={viewsTimeSeries}
        title="Page Views"
        color="#5c7cfa"
        height={260}
        loading={loading}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Device Breakdown */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Desktop", value: deviceBreakdown.desktop, icon: Monitor, color: "bg-blue-500" },
              { label: "Mobile", value: deviceBreakdown.mobile, icon: Smartphone, color: "bg-purple-500" },
              { label: "Tablet", value: deviceBreakdown.tablet, icon: Tablet, color: "bg-emerald-500" },
            ].map((device) => {
              const total = totalViews || 1;
              const pct = ((device.value / total) * 100).toFixed(1);
              return (
                <div key={device.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <device.icon className="h-4 w-4" />
                      {device.label}
                    </div>
                    <span className="text-white font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className={`h-2 rounded-full ${device.color} transition-all`}
                      style={{ width: `${Math.max(Number(pct), 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Referrers</h3>
          <div className="space-y-2">
            {topReferrers.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No referrer data</p>
            ) : (
              topReferrers.slice(0, 8).map((ref, i) => (
                <div key={ref.referrer} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                    <span className="text-sm text-gray-300 truncate max-w-[180px]">{ref.referrer}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{ref.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Countries */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Countries</h3>
          <div className="space-y-2">
            {topCountries.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No location data</p>
            ) : (
              topCountries.slice(0, 8).map((item, i) => (
                <div key={item.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                    <MapPin className="h-3 w-3 text-gray-600" />
                    <span className="text-sm text-gray-300">{item.country}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Sites */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Sites by Views</h3>
        <DataTable
          columns={[
            {
              key: "name",
              label: "Site",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg shrink-0"
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
              key: "niche",
              label: "Niche",
              render: (row) => <span className="text-xs text-gray-500">{row.niche || "—"}</span>,
            },
            {
              key: "views",
              label: "Views",
              render: (row) => (
                <span className="font-medium text-white">{(row.views || 0).toLocaleString()}</span>
              ),
            },
          ]}
          data={sites.slice(0, 20)}
          loading={loading}
          searchable={false}
          pageSize={10}
        />
      </div>
    </div>
  );
}
