"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  BarChart3,
  Settings,
  Flag,
  Bell,
  Mail,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  Menu,
  X,
  ToggleLeft,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Admin Context ─────────────────────────────────────────────

interface AdminContextType {
  user: any;
  notifications: number;
  pendingApprovals: number;
  refreshNotifications: () => void;
}

const AdminContext = createContext<AdminContextType>({
  user: null,
  notifications: 0,
  pendingApprovals: 0,
  refreshNotifications: () => {},
});

export const useAdmin = () => useContext(AdminContext);

// ─── Navigation ────────────────────────────────────────────────

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sites", label: "Sites", icon: Globe },
  { href: "/admin/domains", label: "Domains", icon: Shield },
  { href: "/admin/revenue", label: "Revenue", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/waitlist", label: "Waitlist", icon: Mail },
  { href: "/admin/moderation", label: "Moderation", icon: Flag },
  { href: "/admin/features", label: "Feature Flags", icon: ToggleLeft },
  { href: "/admin/audit", label: "Audit Log", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// ─── Admin Layout ──────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/auth/login?redirect=/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
        router.push("/dashboard?error=not_admin");
        return;
      }

      setUser(profile);
      setLoading(false);
      refreshNotifications();
    }

    checkAdmin();
  }, []);

  async function refreshNotifications() {
    try {
      const { count: notifCount } = await supabase
        .from("admin_notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);

      const { count: approvalCount } = await supabase
        .from("domain_approvals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setNotifications(notifCount || 0);
      setPendingApprovals(approvalCount || 0);
    } catch {
      // Tables may not exist yet
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
          <p className="mt-3 text-sm text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user, notifications, pendingApprovals, refreshNotifications }}>
      <div className="flex h-screen bg-gray-950 text-gray-100">
        {/* Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold">SiteSpark</span>
                  <span className="ml-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                    ADMIN
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const badge =
                item.href === "/admin/domains" ? pendingApprovals :
                item.href === "/admin/moderation" ? 0 : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                  {!sidebarCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {badge > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-800 p-3">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.full_name || "Admin"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400 transition"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-800 hover:text-red-400 transition"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-gray-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute top-14 left-0 right-0 bg-gray-900 border-b border-gray-800 p-3 max-h-[calc(100vh-3.5rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    pathname === item.href ? "bg-brand-600/20 text-brand-400" : "text-gray-400"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:pt-0 pt-14">
          {/* Top Bar */}
          <header className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl px-6">
            <div>
              <h1 className="text-lg font-bold capitalize">
                {navItems.find((n) => n.href === pathname)?.label || "Admin"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <Link
                href="/admin/notifications"
                className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {notifications}
                  </span>
                )}
              </Link>

              {/* Pending Approvals */}
              {pendingApprovals > 0 && (
                <Link
                  href="/admin/domains"
                  className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {pendingApprovals} pending approval{pendingApprovals > 1 ? "s" : ""}
                </Link>
              )}

              {/* Visit Site */}
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition"
              >
                View Site →
              </a>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
