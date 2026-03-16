"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  User,
  Globe,
  Shield,
  Settings,
  Clock,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    const { data } = await supabase
      .from("admin_audit_log")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(200);

    setLogs(data || []);
    setLoading(false);
  }

  const filteredLogs = entityFilter === "all"
    ? logs
    : logs.filter((l) => l.entity_type === entityFilter);

  const entityTypes = [...new Set(logs.map((l) => l.entity_type))];

  const entityIcons: Record<string, React.ElementType> = {
    user: User,
    site: Globe,
    domain: Shield,
    setting: Settings,
  };

  const actionColors: Record<string, string> = {
    create: "bg-emerald-500/20 text-emerald-400",
    update: "bg-blue-500/20 text-blue-400",
    delete: "bg-red-500/20 text-red-400",
    approve: "bg-emerald-500/20 text-emerald-400",
    reject: "bg-red-500/20 text-red-400",
    flag: "bg-amber-500/20 text-amber-400",
    login: "bg-gray-800 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-gray-500">
          Track all admin actions and system events
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
          <button
            onClick={() => setEntityFilter("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              entityFilter === "all" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All
          </button>
          {entityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                entityFilter === type ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <DataTable
        columns={[
          {
            key: "created_at",
            label: "Time",
            width: "160px",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs text-gray-400">
                  {new Date(row.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ),
          },
          {
            key: "profiles",
            label: "Admin",
            render: (row) => (
              <span className="text-xs text-gray-300">
                {row.profiles?.full_name || row.profiles?.email || "System"}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            render: (row) => {
              const color = Object.entries(actionColors).find(([k]) => row.action?.includes(k))?.[1] || "bg-gray-800 text-gray-500";
              return (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
                  {row.action}
                </span>
              );
            },
          },
          {
            key: "entity_type",
            label: "Entity",
            render: (row) => {
              const Icon = entityIcons[row.entity_type] || FileText;
              return (
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-400 capitalize">{row.entity_type}</span>
                  {row.entity_id && (
                    <code className="text-[10px] text-gray-600 font-mono">{row.entity_id.slice(0, 8)}...</code>
                  )}
                </div>
              );
            },
          },
          {
            key: "details",
            label: "Details",
            render: (row) => (
              <span className="text-xs text-gray-500 truncate block max-w-[200px]">
                {row.details ? JSON.stringify(row.details) : "—"}
              </span>
            ),
          },
        ]}
        data={filteredLogs}
        loading={loading}
        searchKeys={["action", "entity_type"]}
        emptyMessage="No audit log entries yet. Actions will appear as you manage the platform."
        pageSize={20}
      />
    </div>
  );
}
