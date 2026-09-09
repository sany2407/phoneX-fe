"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  ChevronLeft,
  ClipboardList,
  Cpu,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Percent,
  ShieldCheck,
  Tag,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",              label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/admin/orders",       label: "Orders",     icon: ClipboardList },
  { href: "/admin/products",     label: "Products",   icon: Box },
  { href: "/admin/inventory",    label: "Inventory",  icon: Package },
  { href: "/admin/devices",      label: "Devices",    icon: Cpu },
  { href: "/admin/categories",   label: "Categories", icon: Tag },
  { href: "/admin/coupons",      label: "Coupons",    icon: Percent },
  { href: "/admin/reviews",      label: "Reviews",    icon: MessageSquare },
  { href: "/admin/users",        label: "Users",      icon: Users },
  { href: "/admin/analytics",    label: "Analytics",  icon: BarChart3 },
];

// ---------------------------------------------------------------------------
// Sidebar link
// ---------------------------------------------------------------------------

function SidebarLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar content
// ---------------------------------------------------------------------------

function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const user   = useAuth((s) => s.user);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Signed out");
      router.push("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 px-4",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">phoneX Admin</p>
            <p className="truncate text-[10px] text-muted-foreground capitalize">
              {user?.role?.toLowerCase().replace("_", " ") ?? "administrator"}
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} collapsed={collapsed} onClick={onClose} />
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      {/* User + logout */}
      <div className={cn("p-2", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-2 rounded-lg p-2">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user?.name ?? "Admin"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      {/* ---- Desktop sidebar ---- */}
      <aside
        className={cn(
          "relative hidden flex-col border-r bg-sidebar transition-all duration-200 lg:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 z-10 grid size-6 place-items-center rounded-full border bg-background shadow-sm hover:bg-muted"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "size-3.5 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </aside>

      {/* ---- Mobile sidebar (overlay) ---- */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar lg:hidden">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </aside>
        </>
      )}

      {/* ---- Main content area ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>

          <Breadcrumb />

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              View store ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breadcrumb (reads pathname)
// ---------------------------------------------------------------------------

function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link href="/admin" className="font-medium hover:text-foreground">
            Admin
          </Link>
        </li>
        {segments.map((seg, i) => {
          const href = "/admin/" + segments.slice(0, i + 1).join("/");
          const label = seg.charAt(0).toUpperCase() + seg.slice(1);
          return (
            <li key={href} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              <Link href={href} className="capitalize hover:text-foreground">
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
