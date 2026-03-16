import { NextRequest, NextResponse } from "next/server";
import { setupDomainForSite } from "@/lib/porkbun";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user has Pro plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan !== "pro") {
      return NextResponse.json(
        { error: "Custom domains require Pro plan ($19/yr)" },
        { status: 403 }
      );
    }

    const { domain, siteId } = await request.json();

    if (!domain || !siteId) {
      return NextResponse.json(
        { error: "Domain and siteId required" },
        { status: 400 }
      );
    }

    // Register and setup DNS
    const result = await setupDomainForSite(domain);

    if (result.success) {
      // Save domain record
      await supabase.from("domains").insert({
        site_id: siteId,
        domain,
        registrar: "porkbun",
        status: "dns_pending",
      });

      // Update site with custom domain
      await supabase
        .from("sites")
        .update({
          custom_domain: domain,
          domain_status: "pending",
        })
        .eq("id", siteId)
        .eq("user_id", user.id);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Domain registration error:", error);
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
