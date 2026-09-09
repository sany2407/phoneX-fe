"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { adminService } from "@/lib/services/admin.service";
import type {
  DashboardStats,
  OrderStatusBreakdown,
  SalesDataPoint,
  TopProduct,
} from "@/lib/api-types";
import { formatINR, formatDate, orderNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

function StatCard({ label, value, sub, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-32" />
          ) : (
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
              {value}
            </p>
          )}
          {sub && !loading && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {sub}
            </p>
          )}
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini bar chart (pure CSS — no external charting lib)
// ---------------------------------------------------------------------------

function SalesChart({
  data,
  loading,
}: {
  data: SalesDataPoint[];
  loading: boolean;
}) {
  const max = data.length ? Math.max(...data.map((d) => d.revenue), 1) : 1;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Revenue (last 14 days)</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Daily sales in ₹
          </p>
        </div>
        <TrendingUp className="size-5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex h-36 items-end gap-1">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No sales data yet.
        </p>
      ) : (
        <div
          className="flex h-36 items-end gap-1"
          role="img"
          aria-label="Daily revenue bar chart"
        >
          {data.map((d) => {
            const pct = Math.max(4, (d.revenue / max) * 100);
            const date = new Date(d.date);
            const label = date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });
            return (
              <div
                key={d.date}
                className="group relative flex flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-full rounded-t-sm bg-primary/70 transition-all duration-300 group-hover:bg-primary"
                  style={{ height: `${pct}%` }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-1.5 hidden rounded-md border bg-popover px-2 py-1 text-xs shadow-pop group-hover:block">
                  <p className="font-medium">{label}</p>
                  <p className="text-muted-foreground">{formatINR(d.revenue)}</p>
                  <p className="text-muted-foreground">{d.orders} orders</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* X-axis labels: first and last */}
      {!loading && data.length > 0 && (
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>
            {new Date(data[0].date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <span>
            {new Date(data[data.length - 1].date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order status donut (pure CSS conic-gradient)
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "#f59e0b",
  CONFIRMED:       "#3b82f6",
  DESIGNING:       "#8b5cf6",
  PRINTING:        "#06b6d4",
  PACKED:          "#10b981",
  SHIPPED:         "#6366f1",
  DELIVERED:       "#22c55e",
  CANCELLED:       "#ef4444",
};

function OrderStatusChart({
  data,
  loading,
}: {
  data: OrderStatusBreakdown[];
  loading: boolean;
}) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  // Build conic-gradient stops
  let cumulative = 0;
  const stops = data.map((d) => {
    const start = (cumulative / total) * 360;
    cumulative += d.count;
    const end = (cumulative / total) * 360;
    const color = STATUS_COLORS[d.status] ?? "#94a3b8";
    return `${color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
  });

  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Order status</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All-time breakdown
          </p>
        </div>
        <ShoppingCart className="size-5 text-muted-foreground" />
      </div>

      {loading ? (
        <div className="flex items-center gap-6">
          <Skeleton className="size-28 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          {/* Donut */}
          <div
            className="relative size-28 shrink-0 rounded-full"
            style={{ background: gradient }}
            role="img"
            aria-label="Order status donut chart"
          >
            {/* Inner cutout */}
            <div className="absolute inset-[14%] rounded-full bg-card" />
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold tabular-nums">
                {total}
              </span>
              <span className="text-[9px] text-muted-foreground">total</span>
            </div>
          </div>

          {/* Legend */}
          <ul className="min-w-0 flex-1 space-y-1.5">
            {data.map((d) => {
              const color = STATUS_COLORS[d.status] ?? "#94a3b8";
              const label = d.status
                .replace("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const pct = ((d.count / total) * 100).toFixed(0);
              return (
                <li key={d.status} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="flex-1 truncate text-muted-foreground">
                    {label}
                  </span>
                  <span className="tabular-nums font-medium">{d.count}</span>
                  <span className="w-8 text-right text-xs text-muted-foreground">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top products table
// ---------------------------------------------------------------------------

function TopProductsTable({
  data,
  loading,
}: {
  data: TopProduct[];
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="font-semibold">Top products</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">By units sold</p>
        </div>
        <Package className="size-5 text-muted-foreground" />
      </div>
      <Separator />
      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No sales data yet.
        </p>
      ) : (
        <ul>
          {data.map((p, i) => (
            <li
              key={p.productId}
              className="flex items-center gap-3 px-5 py-3 text-sm even:bg-muted/30"
            >
              <span className="w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {p.productName}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {p.totalSold} sold
              </span>
              <span className="tabular-nums font-semibold">
                {formatINR(p.revenue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent orders table
// ---------------------------------------------------------------------------

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED:       "bg-blue-100 text-blue-800",
  DESIGNING:       "bg-violet-100 text-violet-800",
  PRINTING:        "bg-cyan-100 text-cyan-800",
  PACKED:          "bg-teal-100 text-teal-800",
  SHIPPED:         "bg-indigo-100 text-indigo-800",
  DELIVERED:       "bg-emerald-100 text-emerald-800",
  CANCELLED:       "bg-red-100 text-red-800",
};

function RecentOrdersTable({
  orders,
  loading,
}: {
  orders: DashboardStats["recentOrders"];
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="font-semibold">Recent orders</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Latest activity</p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowUpRight className="size-3" />
        </Link>
      </div>
      <Separator />

      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const badgeCls =
                  ORDER_STATUS_BADGE[o.status] ??
                  "bg-muted text-muted-foreground";
                return (
                  <tr
                    key={o.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs font-semibold tracking-wide text-primary hover:underline"
                      >
                        {orderNumber(o.id)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(new Date(o.createdAt).getTime())}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {formatINR(o.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          badgeCls
                        )}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Low stock alert strip
// ---------------------------------------------------------------------------

function LowStockStrip({
  variants,
  loading,
}: {
  variants: DashboardStats["lowStockVariants"];
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-14 w-full rounded-xl" />;
  if (!variants.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950/20">
      <Package className="size-4 shrink-0 text-amber-600" />
      <span className="font-semibold text-amber-800 dark:text-amber-400">
        {variants.length} variant{variants.length !== 1 ? "s" : ""} low on stock
      </span>
      <Link
        href="/admin/inventory"
        className="ml-auto text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
      >
        Manage inventory →
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [statusData, setStatus] = useState<OrderStatusBreakdown[]>([]);
  const [salesData, setSales]   = useState<SalesDataPoint[]>([]);
  const [topProducts, setTop]   = useState<TopProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, status, sales, top] = await Promise.all([
          adminService.getDashboard(),
          adminService.getOrderAnalytics(),
          adminService.getSalesAnalytics(),
          adminService.getTopProducts(),
        ]);
        if (cancelled) return;
        setStats(dashboard);
        setStatus(status);
        setSales(sales);
        setTop(top);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ClipboardList className="mb-3 size-10 text-muted-foreground" />
        <p className="font-semibold">Failed to load dashboard</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Overview of your store's performance
        </p>
      </div>

      {/* Low stock alert */}
      <LowStockStrip
        variants={stats?.lowStockVariants ?? []}
        loading={loading}
      />

      {/* KPI stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={stats ? formatINR(stats.totalRevenue) : "—"}
          icon={DollarSign}
          trend="up"
          loading={loading}
        />
        <StatCard
          label="Total orders"
          value={stats ? stats.totalOrders.toLocaleString() : "—"}
          icon={ShoppingCart}
          loading={loading}
        />
        <StatCard
          label="Customers"
          value={stats ? stats.totalCustomers.toLocaleString() : "—"}
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Products"
          value={stats ? stats.totalProducts.toLocaleString() : "—"}
          icon={Package}
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <SalesChart data={salesData} loading={loading} />
        <div className="lg:w-80">
          <OrderStatusChart data={statusData} loading={loading} />
        </div>
      </div>

      {/* Tables row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersTable
          orders={stats?.recentOrders ?? []}
          loading={loading}
        />
        <TopProductsTable data={topProducts} loading={loading} />
      </div>
    </div>
  );
}
