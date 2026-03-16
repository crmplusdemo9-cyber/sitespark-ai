import { NextRequest, NextResponse } from "next/server";
import { checkDomainAvailability, suggestDomains } from "@/lib/porkbun";

export async function POST(request: NextRequest) {
  try {
    const { domain, businessName } = await request.json();

    if (domain) {
      // Check specific domain
      const result = await checkDomainAvailability(domain);
      return NextResponse.json({
        domain,
        ...result,
      });
    }

    if (businessName) {
      // Generate suggestions and check availability
      const suggestions = suggestDomains(businessName);
      const results = await Promise.allSettled(
        suggestions.slice(0, 5).map(async (d) => {
          const check = await checkDomainAvailability(d);
          return { domain: d, ...check };
        })
      );

      const available = results
        .filter(
          (r): r is PromiseFulfilledResult<{ domain: string; available: boolean; price: string | null }> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value);

      return NextResponse.json({ suggestions: available });
    }

    return NextResponse.json(
      { error: "Provide domain or businessName" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Domain check error:", error);
    const message = error instanceof Error ? error.message : "Domain check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
