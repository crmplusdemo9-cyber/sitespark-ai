"use client";

import { useState } from "react";
import {
  Globe,
  Search,
  Check,
  X,
  Loader2,
  ExternalLink,
  Shield,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

interface DomainResult {
  domain: string;
  available: boolean;
  price: string | null;
}

interface DomainManagerProps {
  siteId: string;
  currentDomain?: string | null;
  isPro: boolean;
  onDomainSet?: (domain: string) => void;
}

export default function DomainManager({
  siteId,
  currentDomain,
  isPro,
  onDomainSet,
}: DomainManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch("/api/domains/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: searchQuery,
          domain: searchQuery.includes(".") ? searchQuery : undefined,
        }),
      });

      const data = await res.json();

      if (data.suggestions) {
        setResults(data.suggestions);
      } else if (data.domain) {
        setResults([data]);
      }
    } catch {
      toast.error("Domain search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handleRegister(domain: string) {
    if (!isPro) {
      toast.error("Custom domains require Pro plan ($19/yr)");
      return;
    }

    setRegistering(domain);
    try {
      const res = await fetch("/api/domains/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, siteId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${domain} registered! DNS propagating...`);
        onDomainSet?.(domain);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Registration failed");
    } finally {
      setRegistering(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <Globe className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold">Custom Domain</h3>
          <p className="text-xs text-gray-500">
            Powered by Porkbun • Free WHOIS privacy included
          </p>
        </div>
      </div>

      {/* Current Domain */}
      {currentDomain && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {currentDomain}
          </span>
          <a
            href={`https://${currentDomain}`}
            target="_blank"
            rel="noopener"
            className="ml-auto"
          >
            <ExternalLink className="h-4 w-4 text-green-600" />
          </a>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search domain or business name..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-50"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result) => (
            <div
              key={result.domain}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                result.available
                  ? "border-green-200 bg-green-50/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {result.available ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    result.available ? "text-green-800" : "text-gray-400"
                  }`}
                >
                  {result.domain}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {result.available && result.price && (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-700">
                    <DollarSign className="h-3 w-3" />
                    {result.price}/yr
                  </span>
                )}
                {result.available && (
                  <button
                    onClick={() => handleRegister(result.domain)}
                    disabled={registering === result.domain || !isPro}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {registering === result.domain ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Globe className="h-3 w-3" />
                    )}
                    Register
                  </button>
                )}
                {!result.available && (
                  <span className="text-xs text-gray-400">Taken</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-medium">Porkbun domains include:</p>
          <p className="mt-1 opacity-70">
            Free WHOIS privacy • Auto-renewal • DNS management • SSL certificate •
            .com from $8.56/yr
          </p>
        </div>
      </div>

      {!isPro && (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Pro plan required</span> for custom
            domains.{" "}
            <a href="/api/billing/checkout" className="font-bold underline">
              Upgrade for $19/yr →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
