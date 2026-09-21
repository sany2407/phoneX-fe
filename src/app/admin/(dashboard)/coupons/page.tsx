"use client";

import { useEffect, useState, useMemo } from "react";
import { Percent, Plus, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { adminService, type CreateCouponPayload } from "@/lib/services/admin.service";
import type { ApiCoupon } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  PERCENTAGE:    "% Off",
  FLAT:          "Flat Off",
  FREE_SHIPPING: "Free Shipping",
};

const TYPE_CHIP: Record<string, string> = {
  PERCENTAGE:    "bg-blue-100 text-blue-700",
  FLAT:          "bg-violet-100 text-violet-700",
  FREE_SHIPPING: "bg-emerald-100 text-emerald-700",
};

/** Today's date as a default for validFrom */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** One year from today as a default for validUntil */
function nextYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/** Convert a date-only string "YYYY-MM-DD" to ISO datetime */
function toISO(date: string) {
  return `${date}T00:00:00.000Z`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Coupon form ──────────────────────────────────────────────────────────────

function CouponForm({ onSave, onClose }: {
  onSave: (c: ApiCoupon) => void;
  onClose: () => void;
}) {
  const [code,         setCode]        = useState("");
  const [discountType, setType]        = useState<CreateCouponPayload["discountType"]>("PERCENTAGE");
  const [discountValue,setValue]       = useState("");
  const [minOrderValue,setMinOrder]    = useState("");
  const [maxDiscount,  setMaxDiscount] = useState("");
  const [validFrom,    setFrom]        = useState(today());
  const [validUntil,   setUntil]       = useState(nextYear());
  const [usageLimit,   setLimit]       = useState("");
  const [busy,         setBusy]        = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(discountValue);
    if (!code.trim()) { toast.error("Code is required."); return; }
    if (!v)           { toast.error("Discount value is required."); return; }
    if (!validFrom)   { toast.error("Valid from date is required."); return; }
    if (!validUntil)  { toast.error("Valid until date is required."); return; }

    setBusy(true);
    try {
      const payload: CreateCouponPayload = {
        code:          code.trim().toUpperCase(),
        discountType,
        discountValue: v,
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscount:   maxDiscount   ? Number(maxDiscount)   : null,
        validFrom:     toISO(validFrom),
        validUntil:    toISO(validUntil),
        usageLimit:    usageLimit    ? Number(usageLimit)    : null,
      };
      const result = await adminService.createCoupon(payload);
      toast.success("Coupon created.");
      onSave(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create coupon.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Code + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cp-code">Code *</Label>
          <Input id="cp-code" value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10" className="uppercase font-mono" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-type">Discount type *</Label>
          <select id="cp-type" value={discountType}
            onChange={(e) => setType(e.target.value as CreateCouponPayload["discountType"])}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="PERCENTAGE">% Percentage</option>
            <option value="FLAT">₹ Flat amount</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </div>
      </div>

      {/* Discount value */}
      <div className="space-y-1.5">
        <Label htmlFor="cp-val">
          Discount value * {discountType === "PERCENTAGE" ? "(percent)" : discountType === "FLAT" ? "(₹)" : "(any number)"}
        </Label>
        <Input id="cp-val" type="number" min="0" step="0.01"
          value={discountValue} onChange={(e) => setValue(e.target.value)}
          placeholder={discountType === "PERCENTAGE" ? "10" : "100"} required />
      </div>

      {/* Min order + Max discount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cp-min">Min order value (₹)</Label>
          <Input id="cp-min" type="number" min="0"
            value={minOrderValue} onChange={(e) => setMinOrder(e.target.value)}
            placeholder="499" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-max-disc">Max discount (₹)</Label>
          <Input id="cp-max-disc" type="number" min="0"
            value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="500" />
        </div>
      </div>

      {/* Valid from + Valid until */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cp-from">Valid from *</Label>
          <Input id="cp-from" type="date"
            value={validFrom} onChange={(e) => setFrom(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp-until">Valid until *</Label>
          <Input id="cp-until" type="date"
            value={validUntil} onChange={(e) => setUntil(e.target.value)} required />
        </div>
      </div>

      {/* Usage limit */}
      <div className="space-y-1.5">
        <Label htmlFor="cp-limit">Usage limit (blank = unlimited)</Label>
        <Input id="cp-limit" type="number" min="0"
          value={usageLimit} onChange={(e) => setLimit(e.target.value)}
          placeholder="100" />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const [coupons,    setCoupons]    = useState<ApiCoupon[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [addOpen,    setAddOpen]    = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    adminService.getCoupons()
      .then((d) => { if (!cancelled) setCoupons(Array.isArray(d) ? d : []); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(q));
  }, [coupons, search]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Percent className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load coupons</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${coupons.length} coupons`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add coupon
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code…" className="h-10 pl-9" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Percent className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">
              {search ? `No results for "${search}"` : "No coupons yet"}
            </p>
            {!search && (
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first coupon to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-5 pr-3">Code</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Value</th>
                  <th className="py-3 px-3 text-right">Min Order</th>
                  <th className="py-3 px-3 text-right">Max Disc.</th>
                  <th className="py-3 px-3 text-right">Uses</th>
                  <th className="py-3 px-3">Valid</th>
                  <th className="py-3 pl-3 pr-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    {/* Code */}
                    <td className="py-3 pl-5 pr-3">
                      <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-bold tracking-wider">
                        {c.code}
                      </span>
                    </td>

                    {/* Type chip */}
                    <td className="py-3 px-3">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        TYPE_CHIP[c.discountType] ?? "bg-muted text-muted-foreground"
                      )}>
                        {TYPE_LABEL[c.discountType] ?? c.discountType}
                      </span>
                    </td>

                    {/* Discount value */}
                    <td className="py-3 px-3 text-right tabular-nums font-medium">
                      {c.discountType === "PERCENTAGE"
                        ? `${c.discountValue}%`
                        : c.discountType === "FLAT"
                          ? formatINR(c.discountValue)
                          : "—"}
                    </td>

                    {/* Min order */}
                    <td className="py-3 px-3 text-right tabular-nums text-xs text-muted-foreground">
                      {c.minOrderValue ? formatINR(c.minOrderValue) : "—"}
                    </td>

                    {/* Max discount */}
                    <td className="py-3 px-3 text-right tabular-nums text-xs text-muted-foreground">
                      {c.maxDiscount ? formatINR(c.maxDiscount) : "—"}
                    </td>

                    {/* Usage */}
                    <td className="py-3 px-3 text-right tabular-nums text-xs text-muted-foreground">
                      {c.usedCount ?? 0}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </td>

                    {/* Valid period */}
                    <td className="py-3 px-3 text-xs text-muted-foreground whitespace-nowrap">
                      {c.validFrom ? fmtDate(c.validFrom) : "—"}
                      {" → "}
                      {c.validUntil ? fmtDate(c.validUntil) : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3 pl-3 pr-5">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        c.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <Separator />
            <p className="px-5 py-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {coupons.length} coupons
            </p>
          </>
        )}
      </div>

      {addOpen && (
        <Modal title="Add coupon" onClose={() => setAddOpen(false)}>
          <CouponForm
            onSave={(c) => setCoupons((prev) => [c, ...prev])}
            onClose={() => setAddOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
