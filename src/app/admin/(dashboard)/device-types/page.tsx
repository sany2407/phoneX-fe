"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Cpu, Headphones, Laptop, Pencil, Plus, RefreshCw,
  RotateCcw, Search, Shapes, Smartphone, Tablet, Trash2, Watch, X,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/admin.service";
import type { ApiDeviceType } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, React.ElementType> = {
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  earbuds: Headphones,
  smartwatch: Watch,
};

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
      <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Type form ────────────────────────────────────────────────────────────────

function DeviceTypeForm({
  initial, onSave, onClose,
}: {
  initial?: ApiDeviceType;
  onSave: (t: ApiDeviceType) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Type name is required."); return; }
    setBusy(true);
    try {
      const result = initial
        ? await adminService.updateDeviceType(initial.id, { name: name.trim() })
        : await adminService.createDeviceType({ name: name.trim() });
      toast.success(initial ? "Device type updated." : "Device type created.");
      onSave(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save device type.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="t-name">Type name</Label>
        <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smartwatch" required />
        <p className="text-xs text-muted-foreground">The URL slug is auto-generated from the name.</p>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDeviceTypesPage() {
  const [types, setTypes]       = useState<ApiDeviceType[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [addOpen, setAddOpen]       = useState(false);
  const [editType, setEditType]     = useState<ApiDeviceType | null>(null);
  const [deleteType, setDeleteType] = useState<ApiDeviceType | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    adminService.listAllDeviceTypes()
      .then((d) => { if (!cancelled) setTypes(d); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load device types."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return types;
    return types.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [types, q]);

  function upsert(t: ApiDeviceType) {
    setTypes((prev) =>
      [...prev.filter((x) => x.id !== t.id), t].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  async function deactivate(t: ApiDeviceType) {
    try {
      await adminService.deactivateDeviceType(t.id);
      setTypes((prev) => prev.map((x) => (x.id === t.id ? { ...x, isActive: false } : x)));
      toast.success(`"${t.name}" deactivated.`);
      setDeleteType(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate.");
    }
  }

  async function reactivate(t: ApiDeviceType) {
    try {
      const updated = await adminService.updateDeviceType(t.id, { isActive: true });
      upsert(updated);
      toast.success(`"${t.name}" reactivated.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reactivate.");
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shapes className="mb-3 size-10 text-muted-foreground" />
        <p className="font-semibold">Failed to load device types</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Device Types</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${types.length} type${types.length !== 1 ? "s" : ""} · used when creating models`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add type
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search types…" className="h-10 pl-9" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Shapes className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">No device types found</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first type to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-5 pr-3">Type</th>
                  <th className="py-3 px-3">Slug</th>
                  <th className="py-3 px-3 text-right">Models</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pl-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const Icon = TYPE_ICON[t.slug] ?? Cpu;
                  return (
                    <tr key={t.id} className="group border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pl-5 pr-3">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-3.5" aria-hidden="true" />
                          </span>
                          {t.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{t.slug}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{t._count?.models ?? "—"}</td>
                      <td className="py-3 px-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          t.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                        )}>
                          {t.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditType(t)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            aria-label={`Edit ${t.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          {t.isActive ? (
                            <button
                              onClick={() => setDeleteType(t)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              aria-label={`Deactivate ${t.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivate(t)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                              aria-label={`Reactivate ${t.name}`}
                            >
                              <RotateCcw className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <>
            <Separator />
            <p className="px-5 py-3 text-xs text-muted-foreground">Showing {filtered.length} of {types.length} types</p>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {addOpen && (
        <Modal title="Add device type" onClose={() => setAddOpen(false)}>
          <DeviceTypeForm
            onSave={(t) => { upsert(t); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        </Modal>
      )}
      {editType && (
        <Modal title="Edit device type" onClose={() => setEditType(null)}>
          <DeviceTypeForm
            initial={editType}
            onSave={(t) => { upsert(t); setEditType(null); }}
            onClose={() => setEditType(null)}
          />
        </Modal>
      )}
      {deleteType && (
        <Modal title="Deactivate device type" onClose={() => setDeleteType(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deactivate <strong>{deleteType.name}</strong>? Existing models keep
              their type, but it won&apos;t be offered for new models. You can
              reactivate it anytime.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteType(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deactivate(deleteType)}>Deactivate</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
