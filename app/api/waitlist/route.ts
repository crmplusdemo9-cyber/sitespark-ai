import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceSupabase();

    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, source: "website" }, { onConflict: "email" });

    if (error) {
      console.error("Waitlist error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json({ success: true }); // Don't block on errors
  }
}
