"use client";

import { useEffect, useState, useMemo } from "react";
import { MessageSquare, RefreshCw, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/admin.service";
import type { ApiReview } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("size-3", i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews,    setReviews]    = useState<ApiReview[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [busy,       setBusy]       = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    adminService.getPendingReviews()
      .then((d) => { if (!cancelled) setReviews(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setBusy(id);
    try {
      if (status === "APPROVED") {
        await adminService.approveReview(id);
      } else {
        await adminService.rejectReview(id);
      }
      toast.success(`Review ${status.toLowerCase()}.`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    } finally { setBusy(null); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) =>
      r.body.toLowerCase().includes(q) ||
      r.title?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <MessageSquare className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load reviews</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Reviews</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${reviews.length} awaiting moderation`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading} className="gap-1.5">
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reviews…" className="h-10 pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <MessageSquare className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">{search ? `No results for "${search}"` : "No pending reviews"}</p>
            {!search && <p className="mt-1 text-sm text-muted-foreground">All caught up!</p>}
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((r) => (
              <li key={r.id} className="p-5 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <StarRow rating={r.rating} />
                      {r.title && <span className="font-semibold text-sm">{r.title}</span>}
                      <span className="text-xs text-muted-foreground">
                        by {r.user?.name ?? "Anonymous"} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{r.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                      disabled={busy === r.id}
                      onClick={() => updateStatus(r.id, "APPROVED")}>
                      {busy === r.id ? "…" : "Approve"}
                    </Button>
                    <Button size="sm" variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      disabled={busy === r.id}
                      onClick={() => updateStatus(r.id, "REJECTED")}>
                      Reject
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && filtered.length > 0 && (
          <>
            <Separator />
            <p className="px-5 py-3 text-xs text-muted-foreground">
              {filtered.length} pending review{filtered.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
