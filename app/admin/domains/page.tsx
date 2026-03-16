"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Shield,
  Check,
  X,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  DollarSign,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import toast from "react-hot-toast";

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"domains" | "approvals">("approvals");
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: domainData }, { data: approvalData }] = await Promise.all([
      supabase.from("domains").select("*, sites(name, slug)").order("created_at", { ascending: false }),
      supabase.from("domain_approvals").select("*, profiles(email, full_name), sites(name, slug)").order("created_at", { ascending: false }),
    ]);

    setDomains(domainData || []);
    setApprovals(approvalData || []);
    setLoading(false);
  }

  async function handleApproval(approvalId: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("domain_approvals")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", approvalId);

    if (!error) {
      toast.success(`Domain ${status}`);
      loadData();
    } else {
      toast.error("Failed to update approval");
    }
  }

  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const activeDomains = domains.filter((d) => d.status === "active").length;
  const pendingDomains = domains.filter((d) => d.status === "dns_pending").length;
  const totalSpend = domains.reduce((sum, d) => sum + (d.cost_cents || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Domains</h1>
        <p className="text-sm text-gray-500">Domain registrations and approval queue</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Domains" value={domains.length} icon={Globe} iconColor="text-blue-400" iconBg="bg-blue-500/20" loading={loading} />
        <StatCard title="Active" value={activeDomains} icon={Check} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" loading={loading} />
        <StatCard title="Pending DNS" value={pendingDomains} icon={Clock} iconColor="text-amber-400" iconBg="bg-amber-500/20" loading={loading} />
        <StatCard title="Awaiting Approval" value={pendingApprovals.length} icon={AlertTriangle} iconColor="text-red-400" iconBg="bg-red-500/20" loading={loading} />
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold text-amber-300">
              {pendingApprovals.length} Domain{pendingApprovals.length > 1 ? "s" : ""} Awaiting Approval
            </h3>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{approval.domain}</p>
                  <p className="text-xs text-gray-500">
                    by {approval.profiles?.full_name || approval.profiles?.email} •
                    ${((approval.cost_cents || 0) / 100).toFixed(2)}/yr
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproval(approval.id, "approved")}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, "rejected")}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1 w-fit">
        {(["approvals", "domains"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
              tab === t ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t} {t === "approvals" && pendingApprovals.length > 0 ? `(${pendingApprovals.length})` : ""}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "domains" ? (
        <DataTable
          columns={[
            {
              key: "domain",
              label: "Domain",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-brand-400" />
                  <div>
                    <p className="font-medium text-gray-200">{row.domain}</p>
                    <p className="text-xs text-gray-500">{row.sites?.name || "—"}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "registrar",
              label: "Registrar",
              render: (row) => (
                <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-bold text-brand-400 capitalize">
                  {row.registrar}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => {
                const colors: Record<string, string> = {
                  active: "bg-emerald-500/20 text-emerald-400",
                  dns_pending: "bg-amber-500/20 text-amber-400",
                  registered: "bg-blue-500/20 text-blue-400",
                  error: "bg-red-500/20 text-red-400",
                  checking: "bg-gray-800 text-gray-500",
                };
                return (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[row.status] || colors.checking}`}>
                    {row.status?.toUpperCase().replace("_", " ")}
                  </span>
                );
              },
            },
            {
              key: "auto_renew",
              label: "Auto Renew",
              render: (row) => (
                <span className={`text-xs ${row.auto_renew ? "text-emerald-400" : "text-gray-500"}`}>
                  {row.auto_renew ? "Yes" : "No"}
                </span>
              ),
            },
            {
              key: "expires_at",
              label: "Expires",
              render: (row) => (
                <span className="text-xs text-gray-500">
                  {row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "—"}
                </span>
              ),
            },
          ]}
          data={domains}
          loading={loading}
          searchKeys={["domain"]}
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "domain",
              label: "Domain",
              render: (row) => (
                <div>
                  <p className="font-medium text-gray-200">{row.domain}</p>
                  <p className="text-xs text-gray-500">{row.sites?.name || "—"}</p>
                </div>
              ),
            },
            {
              key: "profiles",
              label: "Requested By",
              render: (row) => (
                <div>
                  <p className="text-xs text-gray-300">{row.profiles?.full_name || "—"}</p>
                  <p className="text-xs text-gray-500">{row.profiles?.email}</p>
                </div>
              ),
            },
            {
              key: "cost_cents",
              label: "Cost",
              render: (row) => (
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                  <DollarSign className="h-3 w-3" />
                  {((row.cost_cents || 0) / 100).toFixed(2)}/yr
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => {
                const colors: Record<string, string> = {
                  pending: "bg-amber-500/20 text-amber-400",
                  approved: "bg-emerald-500/20 text-emerald-400",
                  rejected: "bg-red-500/20 text-red-400",
                };
                return (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[row.status] || ""}`}>
                    {row.status?.toUpperCase()}
                  </span>
                );
              },
            },
            {
              key: "created_at",
              label: "Requested",
              render: (row) => (
                <span className="text-xs text-gray-500">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              ),
            },
          ]}
          data={approvals}
          loading={loading}
          searchKeys={["domain"]}
          actions={(row) =>
            row.status === "pending" ? (
              <>
                <button
                  onClick={() => handleApproval(row.id, "approved")}
                  className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-500 transition"
                  title="Approve"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleApproval(row.id, "rejected")}
                  className="rounded-lg bg-red-600/30 p-1.5 text-red-400 hover:bg-red-600/40 transition"
                  title="Reject"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null
          }
        />
      )}
    </div>
  );
}
