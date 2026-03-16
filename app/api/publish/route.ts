import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugify, generateSiteId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      businessName,
      niche,
      headline,
      subheadline,
      about,
      services,
      testimonial,
      cta,
      colorScheme,
      template = "glassmorphism-portfolio",
    } = body;

    // Generate unique slug
    const baseSlug = slugify(businessName || niche || "my-site");
    const slug = `${baseSlug}-${generateSiteId()}`;

    const siteData = {
      user_id: user?.id || null,
      name: businessName || niche || "My Site",
      slug,
      niche: niche || "",
      template_id: template,
      content: {
        headline,
        subheadline,
        about,
        services,
        testimonial,
        cta,
        colorScheme,
      },
      published: true,
      published_at: new Date().toISOString(),
    };

    if (user) {
      // Authenticated user — save to database
      const { data: site, error } = await supabase
        .from("sites")
        .insert(siteData)
        .select()
        .single();

      if (error) throw error;

      const sitesDomain = process.env.NEXT_PUBLIC_SITES_DOMAIN || "sitespark.dev";
      return NextResponse.json({
        success: true,
        siteId: site.id,
        slug: site.slug,
        url: `https://${site.slug}.${sitesDomain}`,
        previewUrl: `/sites/${site.slug}`,
      });
    }

    // Anonymous user — return preview URL only
    return NextResponse.json({
      success: true,
      slug,
      url: `/sites/${slug}`,
      previewUrl: `/sites/${slug}`,
      message: "Sign up to keep your site live permanently!",
    });
  } catch (error: unknown) {
    console.error("Publish error:", error);
    const message = error instanceof Error ? error.message : "Publishing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
