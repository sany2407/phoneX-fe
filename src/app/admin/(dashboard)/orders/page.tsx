"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/admin.service";
import type { ApiOrder, ApiOrderStatus, PaginatedResponse } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatINR, formatDate, orderNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES: ApiOrderStatus[] = [
  "PENDING_PAYMENT","CONFIRMED","DESIGNING","PRINTING",
  "PACKED","SHIPPED","DELIVERED","CANCELLED",
];

const STATUS_BADGE: Record<ApiOrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED:       "bg-blue-100 text-blue-800",
  DESIGNING:       "bg-violet-100 text-violet-800",
  PRINTING:        "bg-cyan-100 text-cyan-800",
  PACKED:          "bg-teal-100 text-teal-800",
  SHIPPED:         "bg-indigo-100 text-indigo-800",
  DELIVERED:       "bg-emerald-100 text-emerald-800",
  CANCELLED:       "bg-red-100 text-red-800",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status modal ─────────────────────────────────────────────────────────────

function StatusModal({
  order, onUpdated, onClose,
}: { order: ApiOrder; onUpdated: (o: ApiOrder) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<ApiOrderStatus>(order.status);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function save() {
    if (selected === order.status) { onClose(); return; }
    setBusy(true);
    try {
      const updated = await adminService.updateOrderStatus(order.id, selected);
      toast.success("Order status updated.");
      onUpdated(updated);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading font-semibold">Update status</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">Order <span className="font-mono font-semibold text-foreground">{orderNumber(order.id)}</span></p>
        <div className="grid gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelected(s)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                selected === s ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/60"
              )}
            >
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_BADGE[s])}>
                {statusLabel(s)}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Update"}</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [data,       setData]       = useState<PaginatedResponse<ApiOrder> | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [statusFilt, setStatusFilt] = useState<ApiOrderStatus | "">("");
  const [editOrder,  setEditOrder]  = useState<ApiOrder | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    adminService.getOrders({ page, limit: 20, status: statusFilt || undefined })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, statusFilt, refreshKey]);

  function handleUpdated(updated: ApiOrder) {
    setData((prev) => prev ? {
      ...prev,
      items: prev.items.map((o) => o.id === updated.id ? updated : o),
    } : prev);
  }

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingCart className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load orders</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  const orders = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data ? `${data.total} total orders` : "Loading…"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilt(""); setPage(1); }}
          className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-all",
            statusFilt === "" ? "bg-foreground text-background border-foreground" : "hover:bg-muted")}
        >All</button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilt(s); setPage(1); }}
            className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-all",
              statusFilt === s
                ? cn(STATUS_BADGE[s], "border-transparent")
                : "hover:bg-muted")}
          >{statusLabel(s)}</button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ShoppingCart className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-5 pr-3">Order</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pl-3 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-5 pr-3">
                      <span className="font-mono text-xs font-semibold text-primary">{orderNumber(o.id)}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(new Date(o.createdAt).getTime())}
                    </td>
                    <td className="py-3 px-3 max-w-[140px] truncate text-xs">
                      {o.shippingAddress?.fullName ?? "—"}
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">
                      {o.items.length}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {formatINR(o.total ?? 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        o.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" :
                        o.paymentStatus === "FAILED" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {o.paymentStatus ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        STATUS_BADGE[o.status] ?? "bg-muted text-muted-foreground"
                      )}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditOrder(o)}>
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <p className="text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {editOrder && (
        <StatusModal order={editOrder} onUpdated={handleUpdated} onClose={() => setEditOrder(null)} />
      )}
    </div>
  );
}
