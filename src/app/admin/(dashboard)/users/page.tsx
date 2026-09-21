"use client";

import { useEffect, useState, useMemo } from "react";
import { RefreshCw, Search, Shield, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/admin.service";
import type { AdminUserListItem } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ROLE_CHIP: Record<string, string> = {
  CUSTOMER:    "bg-muted text-muted-foreground",
  ADMIN:       "bg-blue-100 text-blue-700",
  SUPER_ADMIN: "bg-violet-100 text-violet-700",
};

export default function AdminUsersPage() {
  const [data,       setData]       = useState<{ items: AdminUserListItem[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [busy,       setBusy]       = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    adminService.getUsers({ page, limit: 20 })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, refreshKey]);

  async function toggleActive(user: AdminUserListItem) {
    setBusy(user.id);
    try {
      const updated = await adminService.updateUserStatus(user.id, { isActive: !user.isActive });
      toast.success(`User ${updated.isActive ? "activated" : "deactivated"}.`);
      setData((prev) => prev ? {
        ...prev,
        items: prev.items.map((u) => u.id === updated.id ? updated : u),
      } : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed.");
    } finally { setBusy(null); }
  }

  const users = data?.items ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Users className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load users</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data ? `${data.total} total users` : "Loading…"}
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
          placeholder="Search name or email…" className="h-10 pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">{search ? `No results for "${search}"` : "No users found"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-5 pr-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-right">Orders</th>
                  <th className="py-3 px-3 text-right">Spent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pl-3 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10">
                          {u.role !== "CUSTOMER"
                            ? <Shield className="size-3.5 text-primary" />
                            : <UserRound className="size-3.5 text-muted-foreground" />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[160px]">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        ROLE_CHIP[u.role] ?? "bg-muted text-muted-foreground")}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                      {u.orderCount ?? 0}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">
                      {formatINR(u.totalSpend ?? 0)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        disabled={busy === u.id}
                        onClick={() => toggleActive(u)}>
                        {busy === u.id ? "…" : u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <p className="text-muted-foreground">Page {data.page} of {data.totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
