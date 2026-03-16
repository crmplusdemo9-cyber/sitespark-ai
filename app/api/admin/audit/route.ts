import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

// Log an admin action
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, entity_type, entity_id, details } = await request.json();

    const serviceSupabase = await createServiceSupabase();
    await serviceSupabase.from("admin_audit_log").insert({
      admin_id: user.id,
      action,
      entity_type,
      entity_id,
      details,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to log action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get audit log
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const entityType = url.searchParams.get("entity_type");

    const serviceSupabase = await createServiceSupabase();
    let query = serviceSupabase
      .from("admin_audit_log")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
