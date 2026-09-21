"use client";

import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, TrendingUp, Users } from "lucide-react";
import { adminService } from "@/lib/services/admin.service";
import type { SalesDataPoint, CustomerSignupDataPoint, TopProduct } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Sales bar chart ──────────────────────────────────────────────────────────

function SalesChart({ data, loading }: { data: SalesDataPoint[]; loading: boolean }) {
  const max = data.length ? Math.max(...data.map((d) => d.revenue), 1) : 1;
  const total = data.reduce((s, d) => s + d.revenue, 0);
  const orders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Sales (last 14 days)</h2>
          {!loading && <p className="mt-0.5 text-sm text-muted-foreground">{formatINR(total)} · {orders} orders</p>}
        </div>
        <TrendingUp className="size-5 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="flex h-40 items-end gap-1 mt-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${20 + Math.random() * 80}%` }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No sales data yet.</p>
      ) : (
        <>
          <div className="flex h-40 items-end gap-1 mt-4" role="img" aria-label="Daily revenue bar chart">
            {data.map((d) => {
              const pct = Math.max(4, (d.revenue / max) * 100);
              const label = new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
              return (
                <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div className="w-full rounded-t-sm bg-primary/70 transition-all duration-300 group-hover:bg-primary" style={{ height: `${pct}%` }} />
                  <div className="pointer-events-none absolute bottom-full mb-1.5 hidden rounded-md border bg-popover px-2 py-1 text-xs shadow-pop group-hover:block z-10 whitespace-nowrap">
                    <p className="font-medium">{label}</p>
                    <p className="text-muted-foreground">{formatINR(d.revenue)}</p>
                    <p className="text-muted-foreground">{d.orders} orders</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{new Date(data[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <span>{new Date(data[data.length - 1].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Customer signups chart ───────────────────────────────────────────────────

function CustomerChart({ data, loading }: { data: CustomerSignupDataPoint[]; loading: boolean }) {
  const max = data.length ? Math.max(...data.map((d) => d.count), 1) : 1;
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">New customers</h2>
          {!loading && <p className="mt-0.5 text-sm text-muted-foreground">{total} signups in period</p>}
        </div>
        <Users className="size-5 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="flex h-32 items-end gap-1 mt-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${20 + Math.random() * 80}%` }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No signup data yet.</p>
      ) : (
        <div className="flex h-32 items-end gap-1 mt-4" role="img" aria-label="Daily signups bar chart">
          {data.map((d) => {
            const pct = Math.max(4, (d.count / max) * 100);
            const label = new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            return (
              <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
                <div className="w-full rounded-t-sm bg-violet-400/70 transition-all duration-300 group-hover:bg-violet-500" style={{ height: `${pct}%` }} />
                <div className="pointer-events-none absolute bottom-full mb-1.5 hidden rounded-md border bg-popover px-2 py-1 text-xs shadow-pop group-hover:block z-10 whitespace-nowrap">
                  <p className="font-medium">{label}</p>
                  <p className="text-muted-foreground">{d.count} signups</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Top products ─────────────────────────────────────────────────────────────

function TopProductsCard({ data, loading }: { data: TopProduct[]; loading: boolean }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="font-semibold">Top products</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">By units sold</p>
        </div>
        <BarChart3 className="size-5 text-muted-foreground" />
      </div>
      <Separator />
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
        </div>
      ) : data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul>
          {data.map((p, i) => (
            <li key={p.productId} className="flex items-center gap-3 px-5 py-3 text-sm even:bg-muted/30">
              <span className="w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{p.productName}</span>
              <span className="tabular-nums text-muted-foreground text-xs">{p.totalSold} sold</span>
              <span className="tabular-nums font-semibold">{formatINR(p.revenue)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [sales,       setSales]     = useState<SalesDataPoint[]>([]);
  const [customers,   setCustomers] = useState<CustomerSignupDataPoint[]>([]);
  const [topProducts, setTop]       = useState<TopProduct[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [error,       setError]     = useState<string | null>(null);
  const [refreshKey,  setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    Promise.all([
      adminService.getSalesAnalytics(),
      adminService.getCustomerAnalytics(),
      adminService.getTopProducts(),
    ])
      .then(([s, c, t]) => {
        if (cancelled) return;
        setSales(s ?? []);
        setCustomers(c ?? []);
        setTop(t ?? []);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BarChart3 className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load analytics</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Sales, signups and top performers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={sales} loading={loading} />
        <CustomerChart data={customers} loading={loading} />
      </div>

      <TopProductsCard data={topProducts} loading={loading} />
    </div>
  );
}
