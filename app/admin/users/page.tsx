"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Crown,
  Ban,
  Mail,
  ExternalLink,
  MoreVertical,
  UserCheck,
  Download,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";
import StatCard from "@/components/admin/StatCard";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(data || []);
    setLoading(false);
  }

  async function updateUserPlan(userId: string, plan: "free" | "pro") {
    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update user plan");
    } else {
      toast.success(`User plan updated to ${plan}`);
      loadUsers();
    }
    setActionMenu(null);
  }

  async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update user role");
    } else {
      toast.success(`User role updated to ${role}`);
      loadUsers();
    }
    setActionMenu(null);
  }

  async function exportUsers() {
    const csv = [
      "Email,Name,Plan,Role,Sites,Created",
      ...users.map(u =>
        `${u.email},"${u.full_name || ""}",${u.plan},${u.role || "user"},${u.sites_count},${u.created_at}`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sitespark-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Users exported to CSV");
  }

  const proUsers = users.filter((u) => u.plan === "pro").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const todayUsers = users.filter((u) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(u.created_at) >= today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500">Manage all registered users</p>
        </div>
        <button
          onClick={exportUsers}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Users" value={users.length} icon={Users} iconColor="text-blue-400" iconBg="bg-blue-500/20" loading={loading} />
        <StatCard title="Pro Users" value={proUsers} icon={Crown} iconColor="text-yellow-400" iconBg="bg-yellow-500/20" loading={loading} />
        <StatCard title="Admins" value={admins} icon={Shield} iconColor="text-red-400" iconBg="bg-red-500/20" loading={loading} />
        <StatCard title="Today" value={todayUsers} icon={UserCheck} iconColor="text-emerald-400" iconBg="bg-emerald-500/20" loading={loading} />
      </div>

      {/* Users Table */}
      <DataTable
        columns={[
          {
            key: "email",
            label: "User",
            render: (row) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/30 text-xs font-bold text-brand-400">
                  {row.full_name?.[0] || row.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-200">{row.full_name || "—"}</p>
                  <p className="text-xs text-gray-500">{row.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "plan",
            label: "Plan",
            render: (row) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                row.plan === "pro" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-800 text-gray-500"
              }`}>
                {row.plan?.toUpperCase()}
              </span>
            ),
          },
          {
            key: "role",
            label: "Role",
            render: (row) => (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                row.role === "admin" ? "bg-red-500/20 text-red-400" :
                row.role === "moderator" ? "bg-purple-500/20 text-purple-400" :
                "bg-gray-800 text-gray-500"
              }`}>
                {(row.role || "user").toUpperCase()}
              </span>
            ),
          },
          {
            key: "sites_count",
            label: "Sites",
            render: (row) => <span className="text-gray-400">{row.sites_count || 0}</span>,
          },
          {
            key: "created_at",
            label: "Joined",
            render: (row) => (
              <span className="text-gray-500 text-xs">
                {new Date(row.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric"
                })}
              </span>
            ),
          },
        ]}
        data={users}
        loading={loading}
        searchKeys={["email", "full_name"]}
        actions={(row) => (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === row.id ? null : row.id); }}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {actionMenu === row.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                  <button
                    onClick={() => updateUserPlan(row.id, row.plan === "pro" ? "free" : "pro")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    {row.plan === "pro" ? "Downgrade to Free" : "Upgrade to Pro"}
                  </button>
                  {(row.role || "user") !== "admin" && (
                    <button
                      onClick={() => updateUserRole(row.id, "admin")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Make Admin
                    </button>
                  )}
                  {(row.role || "user") !== "moderator" && (
                    <button
                      onClick={() => updateUserRole(row.id, "moderator")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Make Moderator
                    </button>
                  )}
                  {row.role !== "user" && (
                    <button
                      onClick={() => updateUserRole(row.id, "user")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Remove Role
                    </button>
                  )}
                  <a
                    href={`mailto:${row.email}`}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Send Email
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}
