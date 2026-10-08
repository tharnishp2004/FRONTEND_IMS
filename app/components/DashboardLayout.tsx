"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Truck,
  AlertTriangle,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { Badge } from "@/app/components/ui/Badge";

interface UserProfile {
  id?: number | string;
  name: string;
  username: string;
  role: "admin" | "staff" | "viewer" | string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string | number;
  badgeColor?: "amber" | "sage";
}

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "admin" | "staff" | "viewer";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState<number>(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("inventory_user") || localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      const userRole = (parsedUser.role || "").toLowerCase();

      // Role hierarchy: Admin (3) > Staff (2) > Viewer (1)
      const roleHierarchy: Record<string, number> = {
        admin: 3,
        staff: 2,
        viewer: 1,
      };

      const userLevel = roleHierarchy[userRole] ?? 0;
      const targetLevel = roleHierarchy[role.toLowerCase()] ?? 1;

      // Higher roles can access other folders:
      // - Admin can access /admin, /staff, and /viewer
      // - Staff can access /staff and /viewer
      // - Viewer can access /viewer
      if (userLevel < targetLevel) {
        // Insufficient permission: redirect to user's highest authorized dashboard instead of /login
        if (userLevel >= 2) {
          router.push("/staff");
        } else if (userLevel >= 1) {
          router.push("/viewer");
        } else {
          router.push("/login");
        }
        return;
      }

      setUser({ ...parsedUser, role: userRole });
    } catch {
      router.push("/login");
    }
  }, [role, router]);

  // Fetch alert count for sidebar badge
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const [prodRes, alertsRes] = await Promise.all([
          fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/alerts`).then((r) => r.json()).catch(() => []),
        ]);
        const lowStock = Array.isArray(prodRes)
          ? prodRes.filter((p: any) => p.quantity <= 5).length
          : 0;
        const dbAlerts = Array.isArray(alertsRes)
          ? alertsRes.filter((a: any) => a.status !== "RESOLVED").length
          : 0;
        setAlertsCount(Math.max(lowStock, dbAlerts));
      } catch {
        // silently fallback
      }
    };
    checkAlerts();
  }, []);

  // Close sidebar on path change in mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("inventory_user");
    localStorage.removeItem("user");
    localStorage.removeItem("inventory_token");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navLinks: NavItem[] = useMemo(() => {
    const baseNav: Record<"admin" | "staff" | "viewer", NavItem[]> = {
      admin: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Inventory", href: "/admin/inventory", icon: Boxes },
        { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
        { name: "Purchases", href: "/admin/purchases", icon: Truck },
        {
          name: "Alerts",
          href: "/admin/alerts",
          icon: AlertTriangle,
          badge: alertsCount > 0 ? alertsCount : undefined,
          badgeColor: "amber",
        },
        { name: "Reports", href: "/admin/reports", icon: BarChart3 },
        { name: "User Management", href: "/admin/users", icon: Users },
      ],
      staff: [
        { name: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { name: "Inventory", href: "/staff/inventory", icon: Boxes },
        { name: "Orders", href: "/staff/orders", icon: ShoppingCart },
        { name: "Purchases", href: "/staff/purchases", icon: Truck },
        { name: "Operations", href: "/staff/operations", icon: SlidersHorizontal },
        {
          name: "Alerts",
          href: "/staff/alerts",
          icon: AlertTriangle,
          badge: alertsCount > 0 ? alertsCount : undefined,
          badgeColor: "amber",
        },
        { name: "Reports", href: "/staff/reports", icon: BarChart3 },
      ],
      viewer: [
        { name: "Dashboard", href: "/viewer", icon: LayoutDashboard },
        { name: "Inventory", href: "/viewer/inventory", icon: Boxes },
        { name: "Reports", href: "/viewer/reports", icon: BarChart3 },
      ],
    };

    return baseNav[role] || baseNav.viewer;
  }, [role, alertsCount]);

  // Portals available to this user based on their login privileges
  const availablePortals = useMemo(() => {
    if (!user) return [];
    const userRole = (user.role || "").toLowerCase();
    if (userRole === "admin") {
      return [
        { id: "admin", label: "Admin", href: "/admin", icon: ShieldCheck },
        { id: "staff", label: "Staff", href: "/staff", icon: UserCheck },
        { id: "viewer", label: "Viewer", href: "/viewer", icon: Eye },
      ];
    }
    if (userRole === "staff") {
      return [
        { id: "staff", label: "Staff", href: "/staff", icon: UserCheck },
        { id: "viewer", label: "Viewer", href: "/viewer", icon: Eye },
      ];
    }
    return [{ id: "viewer", label: "Viewer", href: "/viewer", icon: Eye }];
  }, [user]);

  if (!user) return null;

  const roleBadgeConfig = {
    admin: { label: "Administrator", variant: "admin" as const, icon: ShieldCheck },
    staff: { label: "Operations Staff", variant: "staff" as const, icon: UserCheck },
    viewer: { label: "Read-Only Viewer", variant: "viewer" as const, icon: Eye },
  }[user.role.toLowerCase()] || { label: user.role, variant: "neutral" as const, icon: Eye };

  const currentItem = navLinks.find(
    (item) =>
      pathname === item.href ||
      (item.href !== `/${role}` && pathname.startsWith(item.href))
  );
  const pageTitle = currentItem ? currentItem.name : "System";

  return (
    <div className="min-h-screen bg-[#f4f6f4] text-[#1c211e] flex font-sans antialiased selection:bg-[#466e50] selection:text-white">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#141715]/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation (Concrete Slate Dark Shell) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#191d1b] text-[#c7d0c9] flex flex-col border-r border-[#272d29] shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#272d29] bg-[#161a18]">
          <Link href={`/${role}`} className="flex items-center gap-3 group">
            {/* Logo combining Sage Green & Burnt Amber */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3e6648] via-[#4d7557] to-[#c65922] flex items-center justify-center text-white shadow-md shadow-[#3e6648]/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white">
                IMS
              </span>
              <span className="text-[11px] font-semibold text-[#8c9790] tracking-wide">
                Inventory Management System
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#8c9790] hover:text-white hover:bg-[#252b27]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Portal Switcher (Allows Admin & Staff to switch folders seamlessly) */}
        {availablePortals.length > 1 && (
          <div className="px-4 pt-4 pb-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#727d76]">
                Folder Portal
              </span>
              <span className="text-[10px] text-[#466e50] font-semibold uppercase">
                /{role}
              </span>
            </div>
            <div className={`grid ${availablePortals.length === 3 ? "grid-cols-3" : "grid-cols-2"} gap-1 bg-[#141715] p-1 rounded-xl border border-[#272d29]`}>
              {availablePortals.map((p) => {
                const isCurrent = role === p.id;
                return (
                  <Link
                    key={p.id}
                    href={p.href}
                    className={`text-center py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-[#3e6648] text-white shadow-sm"
                        : "text-[#8c9790] hover:text-white hover:bg-[#202622]"
                    }`}
                    title={`Open ${p.label} Folder`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#727d76]">
            System Architecture
          </div>
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href)) ||
              (item.name === "Orders" && pathname.includes("/sales"));

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-[#3f6549] text-white shadow-sm shadow-[#3f6549]/30"
                    : "text-[#9da7a0] hover:text-[#f2f6f3] hover:bg-[#232925]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-white" : "text-[#838e87] group-hover:text-[#cbdbce]"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      item.badgeColor === "amber"
                        ? "bg-[#c65922] text-white shadow-xs"
                        : "bg-[#3e6648] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 border-t border-[#272d29] bg-[#161a18]">
          <div className="p-3 rounded-2xl bg-[#212723] border border-[#2e3631] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2f4a36] to-[#4c7355] text-white font-bold flex items-center justify-center shrink-0 border border-[#3e6047] shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <span className="text-[10px] font-semibold text-[#8b968f] uppercase tracking-wider block">
                  {roleBadgeConfig.label}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[#8b968f] hover:text-[#e47640] hover:bg-[#c65922]/15 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navbar Header (Concrete White with Crisp Border) */}
        <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-[#dce2de] flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Left Header: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#4a544d] hover:text-[#1a1f1c] hover:bg-[#edf0ee] transition-colors cursor-pointer"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center text-xs font-semibold text-[#7b867f] gap-1.5 uppercase tracking-wider">
                <span>Inventory Core</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#1a1f1c] tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right Header: Status, Notification, Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell (Burnt Amber Badge) */}
            <Link
              href={role === "viewer" ? "/viewer" : `/${role}/alerts`}
              className="relative p-2.5 rounded-xl border border-[#dce2de] bg-white text-[#4a544d] hover:text-[#3e6648] hover:border-[#bfd6c5] transition-colors cursor-pointer"
              title="View Alerts"
            >
              <Bell className="w-4 h-4" />
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c65922] text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  {alertsCount > 9 ? "9+" : alertsCount}
                </span>
              )}
            </Link>

            {/* Role Badge & Portal Status */}
            <div className="flex items-center gap-2">
              <Badge variant={roleBadgeConfig.variant} dot>
                {roleBadgeConfig.label}
              </Badge>
              {user.role.toLowerCase() !== role && (
                <span className="hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#eaf1ec] text-[#2e5239] border border-[#bfd6c5]">
                  /{role}
                </span>
              )}
            </div>

            {/* Quick Logout Header Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#545f57] hover:text-[#b4511c] hover:bg-[#faeee6] transition-colors cursor-pointer border border-[#dce2de]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
