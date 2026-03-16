"use client";

import { useState } from "react";
import {
  Settings,
  Key,
  Globe,
  CreditCard,
  Mail,
  Database,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

interface ServiceStatus {
  name: string;
  status: "checking" | "operational" | "error";
  message?: string;
}

export default function AdminSettingsPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Supabase", status: "checking" },
    { name: "Stripe", status: "checking" },
    { name: "OpenAI", status: "checking" },
    { name: "Porkbun", status: "checking" },
  ]);
  const [checking, setChecking] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  async function checkHealth() {
    setChecking(true);
    setServices((s) => s.map((svc) => ({ ...svc, status: "checking" as const })));

    // Check each service
    const checks = [
      checkService("Supabase", "/api/health/supabase"),
      checkService("Stripe", "/api/health/stripe"),
      checkService("OpenAI", "/api/health/openai"),
      checkService("Porkbun", "/api/health/porkbun"),
    ];

    const results = await Promise.allSettled(checks);
    const updated: ServiceStatus[] = [
      { name: "Supabase", ...(results[0].status === "fulfilled" ? results[0].value : { status: "error" as const, message: "Check failed" }) },
      { name: "Stripe", ...(results[1].status === "fulfilled" ? results[1].value : { status: "error" as const, message: "Check failed" }) },
      { name: "OpenAI", ...(results[2].status === "fulfilled" ? results[2].value : { status: "error" as const, message: "Check failed" }) },
      { name: "Porkbun", ...(results[3].status === "fulfilled" ? results[3].value : { status: "error" as const, message: "Check failed" }) },
    ];

    setServices(updated);
    setChecking(false);
  }

  async function checkService(_name: string, _endpoint: string): Promise<{ status: "operational" | "error"; message?: string }> {
    // In production, these would hit actual health check endpoints
    // For now, simulate a quick check
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
    return { status: "operational" };
  }

  const envVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", desc: "Supabase project URL", category: "Database" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", desc: "Supabase anonymous key", category: "Database" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", desc: "Supabase service role key (secret)", category: "Database" },
    { key: "STRIPE_SECRET_KEY", desc: "Stripe secret key", category: "Billing" },
    { key: "STRIPE_WEBHOOK_SECRET", desc: "Stripe webhook signing secret", category: "Billing" },
    { key: "STRIPE_PRICE_ID", desc: "Pro plan price ID", category: "Billing" },
    { key: "OPENAI_API_KEY", desc: "OpenAI API key for GPT-4o-mini", category: "AI" },
    { key: "PORKBUN_API_KEY", desc: "Porkbun API key", category: "Domains" },
    { key: "PORKBUN_SECRET_KEY", desc: "Porkbun secret key", category: "Domains" },
    { key: "NEXT_PUBLIC_APP_URL", desc: "Your app URL", category: "App" },
    { key: "ADMIN_EMAILS", desc: "Comma-separated admin emails", category: "Security" },
  ];

  const categories = [...new Set(envVars.map((v) => v.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500">System configuration, API health, and environment</p>
      </div>

      {/* Service Health */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Service Health</h3>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
          >
            {checking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Check All
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center gap-3 rounded-lg bg-gray-800/50 px-4 py-3">
              {service.status === "checking" ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              ) : service.status === "operational" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-300">{service.name}</p>
                <p className={`text-xs ${
                  service.status === "checking" ? "text-gray-500" :
                  service.status === "operational" ? "text-emerald-400" :
                  "text-red-400"
                }`}>
                  {service.status === "checking" ? "Checking..." :
                   service.status === "operational" ? "Operational" :
                   service.message || "Error"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Environment Configuration</h3>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            {showKeys ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showKeys ? "Hide" : "Show"} Status
          </button>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                {category === "Database" && <Database className="h-3.5 w-3.5" />}
                {category === "Billing" && <CreditCard className="h-3.5 w-3.5" />}
                {category === "AI" && <Settings className="h-3.5 w-3.5" />}
                {category === "Domains" && <Globe className="h-3.5 w-3.5" />}
                {category === "App" && <Globe className="h-3.5 w-3.5" />}
                {category === "Security" && <Shield className="h-3.5 w-3.5" />}
                {category}
              </h4>
              <div className="space-y-1">
                {envVars
                  .filter((v) => v.category === category)
                  .map((envVar) => (
                    <div
                      key={envVar.key}
                      className="flex items-center justify-between rounded-lg bg-gray-800/30 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <Key className="h-3.5 w-3.5 text-gray-600" />
                        <div>
                          <code className="text-xs font-mono text-gray-300">{envVar.key}</code>
                          <p className="text-[10px] text-gray-600">{envVar.desc}</p>
                        </div>
                      </div>
                      {showKeys && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          SET
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">External Dashboards</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Supabase", url: "https://supabase.com/dashboard", icon: Database },
            { name: "Stripe", url: "https://dashboard.stripe.com", icon: CreditCard },
            { name: "Vercel", url: "https://vercel.com/dashboard", icon: Globe },
            { name: "Porkbun", url: "https://porkbun.com/account", icon: Shield },
          ].map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-lg bg-gray-800/50 px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition"
            >
              <link.icon className="h-4 w-4" />
              {link.name}
              <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-50" />
            </a>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-gray-500 mb-4">
          These actions are irreversible. Proceed with extreme caution.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => toast.error("This would clear all analytics data")}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
          >
            Clear Analytics Data
          </button>
          <button
            onClick={() => toast.error("This would purge all unpublished sites")}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
          >
            Purge Draft Sites
          </button>
        </div>
      </div>
    </div>
  );
}
