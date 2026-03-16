"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Crown,
  Users,
  ArrowUpRight,
  Calendar,
  Receipt,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatCard from "@/components/admin/StatCard";
import MiniChart from "@/components/admin/MiniChart";
import DataTable from "@/components/admin/DataTable";

export default function AdminRevenuePage() {
  const [proUsers, setProUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "365d">("30d");
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: proData }, { data: allData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("plan", "pro").order("updated_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);

    setProUsers(proData || []);
    setAllUsers(allData || []);
    setLoading(false);
  }

  // Revenue calculations
  const PRICE_ANNUAL = 1900; // $19.00/yr
  const PRICE_MONTHLY_EQUIV = 158; // ~$1.58/mo
  const totalProUsers = proUsers.length;
  const mrr = totalProUsers * PRICE_MONTHLY_EQUIV;
  const arr = totalProUsers * PRICE_ANNUAL;
  const totalRevenue = arr; // All revenue is annual subscriptions
  const conversionRate = allUsers.length > 0 ? (totalProUsers / allUsers.length) * 100 : 0;
  const avgRevenuePerUser = allUsers.length > 0 ? totalRevenue / allUsers.length : 0;

  // Revenue time series (mock based on pro user upgrade dates)
  const days = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
  const revenueTimeSeries = (() => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const grouped: Record<string, number> = {};

    proUsers.forEach((u) => {
      const date = new Date(u.updated_at).toISOString().split("T")[0];
      if (new Date(date) >= since) {
        grouped[date] = (grouped[date] || 0) + PRICE_ANNUAL;
      }
    });

    const result: { date: string; value: number }[] = [];
    const cursor = new Date(since);
    while (cursor <= new Date()) {
      const date = cursor.toISOString().split("T")[0];
      result.push({ date, value: grouped[date] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  })();

  // Cumulative MRR chart
  const mrrTimeSeries = (() => {
    const sorted = [...proUsers].sort((a, b) =>
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    );
    let cumulative = 0;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const grouped: Record<string, number> = {};

    sorted.forEach((u) => {
      cumulative += PRICE_MONTHLY_EQUIV;
      const date = new Date(u.updated_at).toISOString().split("T")[0];
      grouped[date] = cumulative;
    });

    const result: { date: string; value: number }[] = [];
    const cursor = new Date(since);
    let lastVal = 0;
    while (cursor <= new Date()) {
      const date = cursor.toISOString().split("T")[0];
      if (grouped[date]) lastVal = grouped[date];
      result.push({ date, value: lastVal });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue</h1>
          <p className="text-sm text-gray-500">Financial overview and billing analytics</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
          {(["30d", "90d", "365d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                timeRange === range ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="MRR"
          value={`$${(mrr / 100).toFixed(2)}`}
          subtitle="Monthly Recurring Revenue"
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/20"
          loading={loading}
          change={8.5}
        />
        <StatCard
          title="ARR"
          value={`$${(arr / 100).toFixed(2)}`}
          subtitle="Annual Recurring Revenue"
          icon={TrendingUp}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/20"
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          subtitle={`${totalProUsers} of ${allUsers.length} users`}
          icon={Crown}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-500/20"
          loading={loading}
        />
        <StatCard
          title="ARPU"
          value={`$${(avgRevenuePerUser / 100).toFixed(2)}`}
          subtitle="Avg Revenue Per User (annual)"
          icon={Users}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/20"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MiniChart
          data={mrrTimeSeries}
          title="MRR Growth (Cumulative)"
          color="#22c55e"
          height={240}
          valuePrefix="$"
          loading={loading}
        />
        <MiniChart
          data={revenueTimeSeries}
          title="New Revenue (Daily)"
          color="#5c7cfa"
          height={240}
          valuePrefix="$"
          loading={loading}
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Revenue Breakdown</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-800/50 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Subscriptions</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">${(arr / 100).toFixed(2)}</p>
            <p className="text-xs text-gray-500">{totalProUsers} × $19.00/yr</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Domains (est.)</p>
            <p className="mt-1 text-xl font-bold text-blue-400">$0.00</p>
            <p className="text-xs text-gray-500">Passed through to Porkbun</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Net Revenue</p>
            <p className="mt-1 text-xl font-bold text-white">${(arr / 100).toFixed(2)}</p>
            <p className="text-xs text-gray-500">After Stripe fees (~2.9%): ${((arr * 0.971) / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Pro Users List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Pro Subscribers</h3>
        <DataTable
          columns={[
            {
              key: "email",
              label: "User",
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400">
                    {row.full_name?.[0] || row.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{row.full_name || "—"}</p>
                    <p className="text-xs text-gray-500">{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "stripe_subscription_id",
              label: "Subscription",
              render: (row) => (
                <span className="text-xs text-gray-500 font-mono">{row.stripe_subscription_id || "—"}</span>
              ),
            },
            {
              key: "sites_count",
              label: "Sites",
              render: (row) => <span className="text-gray-400">{row.sites_count || 0}</span>,
            },
            {
              key: "updated_at",
              label: "Upgraded",
              render: (row) => (
                <span className="text-xs text-gray-500">
                  {new Date(row.updated_at).toLocaleDateString()}
                </span>
              ),
            },
          ]}
          data={proUsers}
          loading={loading}
          searchKeys={["email", "full_name"]}
          emptyMessage="No pro subscribers yet"
        />
      </div>
    </div>
  );
}
