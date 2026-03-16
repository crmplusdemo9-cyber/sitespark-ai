/**
 * Admin utilities — authentication, authorization, and data aggregation
 */

import { createServiceSupabase, createServerSupabase } from "@/lib/supabase/server";

// Admin email whitelist — add your email(s) here
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createServiceSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", userId)
    .single();

  if (!data) return false;

  return data.role === "admin" || ADMIN_EMAILS.includes(data.email.toLowerCase());
}

export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const admin = await isAdmin(user.id);
  if (!admin) throw new Error("Forbidden: Admin access required");

  return user;
}

// ─── Dashboard Aggregation ─────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalSites: number;
  publishedSites: number;
  totalViews: number;
  totalDomains: number;
  activeDomains: number;
  waitlistCount: number;
  mrr: number; // Monthly recurring revenue in cents
  newUsersToday: number;
  newSitesToday: number;
  conversionRate: number; // free → pro %
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServiceSupabase();
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
    { data: viewsData },
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
  ]);

  const totalViews = viewsData?.reduce((sum, s) => sum + (s.views || 0), 0) || 0;
  const total = totalUsers || 0;
  const pro = proUsers || 0;
  const conversionRate = total > 0 ? (pro / total) * 100 : 0;
  const mrr = pro * 1900; // $19/yr ÷ 12 ≈ $1.58/mo, but we track annual as MRR for simplicity

  return {
    totalUsers: total,
    proUsers: pro,
    freeUsers: total - pro,
    totalSites: totalSites || 0,
    publishedSites: publishedSites || 0,
    totalViews,
    totalDomains: totalDomains || 0,
    activeDomains: activeDomains || 0,
    waitlistCount: waitlistCount || 0,
    mrr,
    newUsersToday: newUsersToday || 0,
    newSitesToday: newSitesToday || 0,
    conversionRate,
  };
}

// ─── Time Series Data ──────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export async function getUserGrowth(days: number = 30): Promise<TimeSeriesPoint[]> {
  const supabase = await createServiceSupabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  // Fill gaps
  const result: TimeSeriesPoint[] = [];
  const cursor = new Date(since);
  while (cursor <= new Date()) {
    const date = cursor.toISOString().split("T")[0];
    result.push({ date, value: grouped[date] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export async function getViewsTimeSeries(days: number = 30): Promise<TimeSeriesPoint[]> {
  const supabase = await createServiceSupabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("site_views")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const result: TimeSeriesPoint[] = [];
  const cursor = new Date(since);
  while (cursor <= new Date()) {
    const date = cursor.toISOString().split("T")[0];
    result.push({ date, value: grouped[date] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export async function getRevenueTimeSeries(days: number = 30): Promise<TimeSeriesPoint[]> {
  const supabase = await createServiceSupabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Revenue comes from Pro upgrades — track profile upgrade dates
  const { data } = await supabase
    .from("profiles")
    .select("updated_at")
    .eq("plan", "pro")
    .gte("updated_at", since.toISOString())
    .order("updated_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const date = new Date(row.updated_at).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1900; // $19.00 per upgrade
  });

  const result: TimeSeriesPoint[] = [];
  const cursor = new Date(since);
  while (cursor <= new Date()) {
    const date = cursor.toISOString().split("T")[0];
    result.push({ date, value: grouped[date] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}
