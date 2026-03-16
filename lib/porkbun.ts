/**
 * Porkbun Domain API Integration
 * Docs: https://porkbun.com/api/json/v3/documentation
 *
 * Pricing: .com $8.56/yr, .dev $12.16/yr, .io $32/yr
 * All include free WHOIS privacy
 */

const PORKBUN_API_BASE = "https://porkbun.com/api/json/v3";

interface PorkbunCredentials {
  apikey: string;
  secretapikey: string;
}

function getCredentials(): PorkbunCredentials {
  return {
    apikey: process.env.PORKBUN_API_KEY!,
    secretapikey: process.env.PORKBUN_SECRET_KEY!,
  };
}

async function porkbunRequest(endpoint: string, body: Record<string, unknown> = {}) {
  const response = await fetch(`${PORKBUN_API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...getCredentials(),
      ...body,
    }),
  });

  const data = await response.json();

  if (data.status !== "SUCCESS") {
    throw new Error(`Porkbun API Error: ${data.message || "Unknown error"}`);
  }

  return data;
}

// ─── Domain Availability & Pricing ─────────────────────────────

export async function checkDomainAvailability(domain: string): Promise<{
  available: boolean;
  price: string | null;
  currency: string;
}> {
  try {
    const data = await porkbunRequest("/domain/checkDomain", { domain });
    // Porkbun returns avail: "yes" or "no"
    // If not available, we get an error, so if we reach here it's likely available
    return {
      available: true,
      price: data.pricing?.[domain.split(".").pop() || "com"]?.registration || null,
      currency: "USD",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Domain not available or API error
    if (message.includes("not available") || message.includes("taken")) {
      return { available: false, price: null, currency: "USD" };
    }
    throw error;
  }
}

export async function getDomainPricing(): Promise<
  Record<string, { registration: string; renewal: string }>
> {
  const data = await porkbunRequest("/pricing/get");
  return data.pricing;
}

// ─── Domain Registration ───────────────────────────────────────

export interface DomainRegistrationOptions {
  domain: string;
  years?: number;
  nameservers?: string[];
  autoRenew?: boolean;
}

export async function registerDomain(options: DomainRegistrationOptions): Promise<{
  success: boolean;
  domain: string;
  expiresAt: string;
}> {
  const { domain, years = 1 } = options;

  // Safety check: Don't auto-purchase domains over $50
  const pricing = await checkDomainAvailability(domain);
  if (pricing.price && parseFloat(pricing.price) > 50) {
    throw new Error(
      `Domain ${domain} costs $${pricing.price}/yr. Manual approval required for domains over $50.`
    );
  }

  const data = await porkbunRequest("/domain/register", {
    domain,
    years: years.toString(),
    autoRenew: "1",
    whoisPrivacy: "1", // Free with Porkbun!
  });

  return {
    success: true,
    domain,
    expiresAt: data.expiresAt || new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ─── DNS Management ────────────────────────────────────────────

export interface DnsRecord {
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  name: string; // subdomain or @ for root
  content: string;
  ttl?: number;
  prio?: number;
}

export async function addDnsRecord(domain: string, record: DnsRecord) {
  return porkbunRequest(`/dns/create/${domain}`, {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: (record.ttl || 600).toString(),
    prio: record.prio?.toString(),
  });
}

export async function getDnsRecords(domain: string) {
  const data = await porkbunRequest(`/dns/retrieve/${domain}`);
  return data.records || [];
}

export async function deleteDnsRecord(domain: string, recordId: string) {
  return porkbunRequest(`/dns/delete/${domain}/${recordId}`);
}

// ─── Auto-Setup for Published Sites ───────────────────────────

/**
 * Complete domain setup for a SiteSpark published site.
 * 1. Register domain (if not already owned)
 * 2. Set DNS records pointing to Vercel
 * 3. Return verification status
 */
export async function setupDomainForSite(
  domain: string,
  vercelProjectId?: string
): Promise<{
  success: boolean;
  domain: string;
  dnsConfigured: boolean;
  steps: string[];
}> {
  const steps: string[] = [];

  try {
    // Step 1: Check if we need to register
    const availability = await checkDomainAvailability(domain);

    if (availability.available) {
      await registerDomain({ domain, years: 1 });
      steps.push(`✅ Registered ${domain} ($${availability.price}/yr)`);
    } else {
      steps.push(`ℹ️ Domain ${domain} already registered — configuring DNS`);
    }

    // Step 2: Clear existing A/CNAME records
    const existingRecords = await getDnsRecords(domain);
    for (const record of existingRecords) {
      if (record.type === "A" || record.type === "CNAME") {
        await deleteDnsRecord(domain, record.id);
      }
    }
    steps.push("✅ Cleared existing DNS records");

    // Step 3: Point to Vercel
    // Vercel requires: A record → 76.76.21.21 and CNAME www → cname.vercel-dns.com
    await addDnsRecord(domain, {
      type: "A",
      name: "",
      content: "76.76.21.21",
      ttl: 600,
    });

    await addDnsRecord(domain, {
      type: "CNAME",
      name: "www",
      content: "cname.vercel-dns.com",
      ttl: 600,
    });

    steps.push("✅ DNS configured → Vercel");
    steps.push("⏳ SSL certificate auto-provisioning (5-10 min)");

    return {
      success: true,
      domain,
      dnsConfigured: true,
      steps,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    steps.push(`❌ Error: ${message}`);
    return {
      success: false,
      domain,
      dnsConfigured: false,
      steps,
    };
  }
}

// ─── Domain Search Suggestions ─────────────────────────────────

export function suggestDomains(businessName: string): string[] {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  return [
    `${slug}.com`,
    `${slug}.dev`,
    `${slug}.io`,
    `${slug}.co`,
    `${slug}.site`,
    `${slug}.app`,
    `get${slug}.com`,
    `${slug}hq.com`,
    `my${slug}.com`,
    `${slug}.online`,
  ];
}
