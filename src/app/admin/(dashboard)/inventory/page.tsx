"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, RefreshCw, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/admin.service";
import type { InventoryItem } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

function StockCell({ item }: { item: InventoryItem }) {
  const [value, setValue] = useState(String(item.stock));
  const [busy,  setBusy]  = useState(false);
  const dirty = value !== String(item.stock);

  async function save() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) { toast.error("Enter a valid stock number."); return; }
    setBusy(true);
    try {
      await adminService.updateStock(item.variantId, { stock: n });
      item.stock = n;               // mutate local copy so dirty resets
      toast.success(`Stock updated to ${n}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update stock.");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && dirty && save()}
        className="h-7 w-20 text-center text-sm tabular-nums"
        inputMode="numeric"
      />
      {dirty && (
        <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" disabled={busy} onClick={save}>
          <Save className="size-3" />{busy ? "…" : "Save"}
        </Button>
      )}
    </div>
  );
}

export default function AdminInventoryPage() {
  const [items,      setItems]      = useState<InventoryItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    adminService.getInventory()
      .then((d) => { if (!cancelled) setItems(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      i.product.name.toLowerCase().includes(q) ||
      i.deviceModel.name.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q)
    );
  }, [items, search]);

  const lowStock = items.filter((i) => i.stock <= 5).length;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Package className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load inventory</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} variants · `}
            {!loading && lowStock > 0 && (
              <span className="font-semibold text-amber-600">{lowStock} low stock</span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, device, SKU…" className="h-10 pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">No variants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-5 pr-3">Product</th>
                  <th className="py-3 px-3">Device</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 pl-3 pr-5">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.variantId} className={cn(
                    "border-b last:border-0 hover:bg-muted/30 transition-colors",
                    item.stock === 0 && "bg-red-50/40",
                    item.stock > 0 && item.stock <= 5 && "bg-amber-50/40"
                  )}>
                    <td className="py-3 pl-5 pr-3 font-medium max-w-[200px] truncate">{item.product.name}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground max-w-[160px] truncate">{item.deviceModel.name}</td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">{formatINR(item.price)}</td>
                    <td className="py-3 pl-3 pr-5"><StockCell item={item} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <>
            <Separator />
            <p className="px-5 py-3 text-xs text-muted-foreground">Showing {filtered.length} of {items.length} variants</p>
          </>
        )}
      </div>
    </div>
  );
}
