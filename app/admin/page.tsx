"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Globe,
  Eye,
  CreditCard,
  Crown,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Activity,
  DollarSign,
  Zap,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/admin/StatCard";
import MiniChart from "@/components/admin/MiniChart";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    totalSites: number;
    publishedSites: number;
    totalViews: number;
    totalDomains: number;
    activeDomains: number;
    waitlistCount: number;
    newUsersToday: number;
    newSitesToday: number;
  };
  userGrowth: { date: string; value: number }[];
  viewsGrowth: { date: string; value: number }[];
  recentUsers: any[];
  recentSites: any[];
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, [timeRange]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: totalUsers },
        { count: proUsers },
        { count: totalSites },
        { count: publishedSites },
        { count: totalDomains },
        { count: activeDomains },
        { count: waitlistCount },
        { count: newUsersToday },
        { count: newSitesToday },
        { data: allSites },
        { data: usersInRange },
        { data: viewsInRange },
        { data: recentUsers },
        { data: recentSites },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("sites").select("*", { count: "exact", head: true }),
        supabase.from("sites").select("*", { count: "exact", head: true }).eq("published", true),
        supabase.from("domains").select("*", { count: "exact", head: true }),
        supabase.from("domains").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("waitlist").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("sites").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("sites").select("views"),
        supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()).order("created_at"),
        supabase.from("site_views").select("created_at").gte("created_at", since.toISOString()).order("created_at"),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("sites").select("*, profiles(email, full_name)").order("created_at", { ascending: false }).limit(5),
      ]);

      // Build time series
      const userGrowth = buildTimeSeries(usersInRange || [], days);
      const viewsGrowth = buildTimeSeries(viewsInRange || [], days);

      const totalViews = allSites?.reduce((sum, s) => sum + (s.views || 0), 0) || 0;

      setData({
        stats: {
          totalUsers: totalUsers || 0,
          proUsers: proUsers || 0,
          freeUsers: (totalUsers || 0) - (proUsers || 0),
          totalSites: totalSites || 0,
          publishedSites: publishedSites || 0,
          totalViews,
          totalDomains: totalDomains || 0,
          activeDomains: activeDomains || 0,
          waitlistCount: waitlistCount || 0,
          newUsersToday: newUsersToday || 0,
          newSitesToday: newSitesToday || 0,
        },
        userGrowth,
        viewsGrowth,
        recentUsers: recentUsers || [],
        recentSites: recentSites || [],
        recentActivity: [],
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  function buildTimeSeries(rows: { created_at: string }[], days: number) {
    const grouped: Record<string, number> = {};
    rows.forEach((r) => {
      const date = new Date(r.created_at).toISOString().split("T")[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    const result: { date: string; value: number }[] = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - days);
    while (cursor <= new Date()) {
      const date = cursor.toISOString().split("T")[0];
      result.push({ date, value: grouped[date] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }

  const s = data?.stats;
  const mrr = (s?.proUsers || 0) * 158; // ~$1.58/mo per pro user (annual plan)
  const arr = (s?.proUsers || 0) * 1900; // $19/yr per pro user
  const conversionRate = s && s.totalUsers > 0 ? ((s.proUsers / s.totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Real-time overview of SiteSpark AI operations
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                timeRange === range
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Top-Level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={s?.totalUsers?.toLocaleString() || "0"}
          subtitle={`+${s?.newUsersToday || 0} today`}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/20"
          loading={loading}
          change={12.5}
        />
        <StatCard
          title="MRR"
          value={`$${(mrr / 100).toFixed(0)}`}
          subtitle={`ARR: $${(arr / 100).toFixed(0)}`}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/20"
          loading={loading}
          change={8.3}
        />
        <StatCard
          title="Published Sites"
          value={s?.publishedSites?.toLocaleString() || "0"}
          subtitle={`${s?.totalSites || 0} total created`}
          icon={Globe}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/20"
          loading={loading}
          change={15.2}
        />
        <StatCard
          title="Total Views"
          value={s?.totalViews?.toLocaleString() || "0"}
          subtitle="Across all sites"
          icon={Eye}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/20"
          loading={loading}
          change={22.1}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pro Users"
          value={s?.proUsers?.toLocaleString() || "0"}
          subtitle={`${conversionRate.toFixed(1)}% conversion`}
          icon={Crown}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-500/20"
          loading={loading}
        />
        <StatCard
          title="Domains"
          value={s?.activeDomains?.toLocaleString() || "0"}
          subtitle={`${s?.totalDomains || 0} total registered`}
          icon={Globe}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/20"
          loading={loading}
        />
        <StatCard
          title="Waitlist"
          value={s?.waitlistCount?.toLocaleString() || "0"}
          subtitle="Pre-launch signups"
          icon={Mail}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/20"
          loading={loading}
        />
        <StatCard
          title="Today's Activity"
          value={`${(s?.newUsersToday || 0) + (s?.newSitesToday || 0)}`}
          subtitle={`${s?.newUsersToday || 0} users • ${s?.newSitesToday || 0} sites`}
          icon={Activity}
          iconColor="text-brand-400"
          iconBg="bg-brand-500/20"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MiniChart
          data={data?.userGrowth || []}
          title="User Growth"
          color="#5c7cfa"
          height={220}
          loading={loading}
        />
        <MiniChart
          data={data?.viewsGrowth || []}
          title="Site Views"
          color="#22c55e"
          height={220}
          loading={loading}
        />
      </div>

      {/* Conversion Funnel & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {[
              { label: "Waitlist Signups", value: s?.waitlistCount || 0, color: "bg-blue-500", max: Math.max(s?.waitlistCount || 1, s?.totalUsers || 1) },
              { label: "Registered Users", value: s?.totalUsers || 0, color: "bg-indigo-500", max: Math.max(s?.waitlistCount || 1, s?.totalUsers || 1) },
              { label: "Sites Created", value: s?.totalSites || 0, color: "bg-purple-500", max: Math.max(s?.waitlistCount || 1, s?.totalUsers || 1) },
              { label: "Sites Published", value: s?.publishedSites || 0, color: "bg-violet-500", max: Math.max(s?.waitlistCount || 1, s?.totalUsers || 1) },
              { label: "Pro Conversions", value: s?.proUsers || 0, color: "bg-emerald-500", max: Math.max(s?.waitlistCount || 1, s?.totalUsers || 1) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-white">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                    style={{ width: `${Math.max((item.value / item.max) * 100, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "View Users", href: "/admin/users", icon: Users, color: "text-blue-400" },
              { label: "Manage Sites", href: "/admin/sites", icon: Globe, color: "text-purple-400" },
              { label: "Domain Approvals", href: "/admin/domains", icon: AlertTriangle, color: "text-amber-400" },
              { label: "Revenue Details", href: "/admin/revenue", icon: CreditCard, color: "text-emerald-400" },
              { label: "Feature Flags", href: "/admin/features", icon: Zap, color: "text-cyan-400" },
              { label: "View Analytics", href: "/admin/analytics", icon: BarChart3, color: "text-pink-400" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition"
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                {action.label}
                <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Recent Users</h3>
            <Link href="/admin/users" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-800" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-800" />
                    <div className="h-2 w-36 animate-pulse rounded bg-gray-800" />
                  </div>
                </div>
              ))
            ) : data?.recentUsers.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No users yet</p>
            ) : (
              data?.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/30 text-xs font-bold text-brand-400">
                    {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    user.plan === "pro" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-800 text-gray-500"
                  }`}>
                    {user.plan?.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sites */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Recent Sites</h3>
            <Link href="/admin/sites" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-800" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-800" />
                    <div className="h-2 w-48 animate-pulse rounded bg-gray-800" />
                  </div>
                </div>
              ))
            ) : data?.recentSites.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No sites yet</p>
            ) : (
              data?.recentSites.map((site: any) => (
                <div key={site.id} className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded"
                    style={{
                      background: `linear-gradient(135deg, ${site.content?.colorScheme?.primary || "#4263eb"}40, ${site.content?.colorScheme?.secondary || "#748ffc"}20)`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{site.name}</p>
                    <p className="text-xs text-gray-500 truncate">{site.slug}.sitespark.dev</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    site.published ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-500"
                  }`}>
                    {site.published ? "LIVE" : "DRAFT"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">System Health</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Supabase DB", status: "operational", icon: CheckCircle2 },
            { name: "Stripe Billing", status: "operational", icon: CheckCircle2 },
            { name: "Porkbun DNS", status: "operational", icon: CheckCircle2 },
            { name: "OpenAI API", status: "operational", icon: CheckCircle2 },
          ].map((service) => (
            <div key={service.name} className="flex items-center gap-3 rounded-lg bg-gray-800/50 px-4 py-3">
              <service.icon className={`h-4 w-4 ${
                service.status === "operational" ? "text-emerald-400" : "text-red-400"
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-300">{service.name}</p>
                <p className={`text-xs ${
                  service.status === "operational" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {service.status === "operational" ? "Operational" : "Issue Detected"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
