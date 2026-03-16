import { NextResponse } from "next/server";
import { requireAdmin, getDashboardStats, getUserGrowth, getViewsTimeSeries, getRevenueTimeSeries } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "30");

    const [stats, userGrowth, viewsGrowth, revenueGrowth] = await Promise.all([
      getDashboardStats(),
      getUserGrowth(days),
      getViewsTimeSeries(days),
      getRevenueTimeSeries(days),
    ]);

    return NextResponse.json({
      stats,
      charts: {
        userGrowth,
        viewsGrowth,
        revenueGrowth,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load stats";
    const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
