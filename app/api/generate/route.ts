import { NextRequest, NextResponse } from "next/server";
import { generateWebsiteContent } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, niche, tone = "professional" } = body;

    if (!niche) {
      return NextResponse.json(
        { error: "Please describe your business" },
        { status: 400 }
      );
    }

    const content = await generateWebsiteContent(niche, businessName || niche, tone);

    return NextResponse.json(content);
  } catch (error: unknown) {
    console.error("Generate API error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
