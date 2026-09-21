"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  ChevronDown, ChevronRight, Cpu, Laptop,
  Pencil, Plus, RefreshCw, Search, Smartphone, Tablet, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminService,
  type CreateBrandPayload,
  type UpdateBrandPayload,
  type CreateDeviceModelPayload,
  type UpdateDeviceModelPayload,
} from "@/lib/services/admin.service";
import type { ApiBrand, ApiDeviceModel } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── constants ───────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ElementType> = {
  PHONE: Smartphone, TABLET: Tablet, LAPTOP: Laptop,
};
const TYPE_CHIP: Record<string, string> = {
  PHONE:  "bg-primary/10 text-primary",
  TABLET: "bg-violet-100 text-violet-700",
  LAPTOP: "bg-amber-100 text-amber-700",
};
const MODEL_TYPES = ["PHONE", "TABLET", "LAPTOP"] as const;

function typeLabel(t: string | undefined) {
  if (!t) return "Unknown";
  return t.charAt(0) + t.slice(1).toLowerCase();
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function Modal({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  // close on Escape
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

// ─── Brand form ───────────────────────────────────────────────────────────────

function BrandForm({
  initial, onSave, onClose,
}: {
  initial?: ApiBrand;
  onSave: (b: ApiBrand) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(initial?.name ?? "");
  const [slug, setSlug]   = useState(initial?.slug ?? "");
  const [logo, setLogo]   = useState(initial?.logo ?? "");
  const [busy, setBusy]   = useState(false);

  // Auto-generate slug from name
  function handleName(v: string) {
    setName(v);
    if (!initial) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { toast.error("Name and slug are required."); return; }
    setBusy(true);
    try {
      let result: ApiBrand;
      if (initial) {
        const payload: UpdateBrandPayload = { name: name.trim(), slug: slug.trim(), logo: logo.trim() || undefined };
        result = await adminService.updateBrand(initial.id, payload);
        toast.success("Brand updated.");
      } else {
        const payload: CreateBrandPayload = { name: name.trim(), slug: slug.trim(), logo: logo.trim() || undefined };
        result = await adminService.createBrand(payload);
        toast.success("Brand created.");
      }
      onSave(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save brand.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="b-name">Brand name</Label>
        <Input id="b-name" value={name} onChange={(e) => handleName(e.target.value)} placeholder="e.g. Apple" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-slug">Slug</Label>
        <Input id="b-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. apple" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-logo">Logo URL (optional)</Label>
        <Input id="b-logo" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://…" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Model form ───────────────────────────────────────────────────────────────

function ModelForm({
  brandId, initial, onSave, onClose,
}: {
  brandId: string;
  initial?: ApiDeviceModel;
  onSave: (m: ApiDeviceModel) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(initial?.name ?? "");
  const [slug, setSlug]   = useState(initial?.slug ?? "");
  const [type, setType]   = useState<typeof MODEL_TYPES[number]>(
    (initial?.type as typeof MODEL_TYPES[number]) ?? "PHONE"
  );
  const [busy, setBusy]   = useState(false);

  function handleName(v: string) {
    setName(v);
    if (!initial) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { toast.error("Name and slug are required."); return; }
    setBusy(true);
    try {
      let result: ApiDeviceModel;
      if (initial) {
        const payload: UpdateDeviceModelPayload = { name: name.trim(), slug: slug.trim(), type };
        result = await adminService.updateDeviceModel(initial.id, payload);
        toast.success("Model updated.");
      } else {
        const payload: CreateDeviceModelPayload = {
          brandId, name: name.trim(), slug: slug.trim(), type, year: new Date().getFullYear(),
        };
        result = await adminService.createDeviceModel(payload);
        toast.success("Model created.");
      }
      onSave(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save model.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="m-name">Model name</Label>
        <Input id="m-name" value={name} onChange={(e) => handleName(e.target.value)} placeholder="e.g. iPhone 17 Pro" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-slug">Slug</Label>
        <Input id="m-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. iphone-17-pro" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-type">Type</Label>
        <select
          id="m-type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof MODEL_TYPES[number])}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {MODEL_TYPES.map((t) => (
            <option key={t} value={t}>{typeLabel(t)}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Confirm delete dialog ────────────────────────────────────────────────────

function ConfirmDelete({
  label, onConfirm, onClose,
}: { label: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          variant="destructive"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm().finally(() => setBusy(false));
          }}
        >
          {busy ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

// ─── ModelRow ─────────────────────────────────────────────────────────────────

function ModelRow({
  model, onEdit, onDelete,
}: {
  model: ApiDeviceModel;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon    = TYPE_ICON[model.type ?? ""] ?? Cpu;
  const chipCls = TYPE_CHIP[model.type ?? ""] ?? "bg-muted text-muted-foreground";

  return (
    <tr className="group border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-3 pl-4 pr-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", chipCls)}>
          <Icon className="size-3" aria-hidden="true" />
          {typeLabel(model.type)}
        </span>
      </td>
      <td className="py-3 px-3 font-medium text-sm">{model.name}</td>
      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{model.slug}</td>
      <td className="py-3 pl-3 pr-4">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
          model.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
        )}>
          {model.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Edit model"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Delete model"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── BrandCard ────────────────────────────────────────────────────────────────

function BrandCard({
  brand, models, loading, defaultOpen,
  onBrandEdit, onBrandDelete,
  onModelCreated, onModelUpdated, onModelDeleted,
}: {
  brand: ApiBrand;
  models: ApiDeviceModel[];
  loading: boolean;
  defaultOpen: boolean;
  onBrandEdit: () => void;
  onBrandDelete: () => void;
  onModelCreated: (m: ApiDeviceModel) => void;
  onModelUpdated: (m: ApiDeviceModel) => void;
  onModelDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // modal state
  const [addModel,    setAddModel]    = useState(false);
  const [editModel,   setEditModel]   = useState<ApiDeviceModel | null>(null);
  const [deleteModel, setDeleteModel] = useState<ApiDeviceModel | null>(null);

  const phones  = models.filter((m) => m.type === "PHONE");
  const tablets = models.filter((m) => m.type === "TABLET");
  const laptops = models.filter((m) => m.type === "LAPTOP");

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Brand header */}
        <div className="flex w-full items-center gap-3 px-5 py-4">
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-1 items-center gap-3 text-left"
            aria-expanded={open}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-heading text-sm font-bold text-primary">
              {brand.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold tracking-tight">{brand.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{brand.slug}</p>
            </div>
            {/* Type counts */}
            <div className="flex items-center gap-1.5 shrink-0">
              {phones.length > 0 && (
                <span className={cn("hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", TYPE_CHIP.PHONE)}>
                  <Smartphone className="size-3" />{phones.length}
                </span>
              )}
              {tablets.length > 0 && (
                <span className={cn("hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", TYPE_CHIP.TABLET)}>
                  <Tablet className="size-3" />{tablets.length}
                </span>
              )}
              {laptops.length > 0 && (
                <span className={cn("hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", TYPE_CHIP.LAPTOP)}>
                  <Laptop className="size-3" />{laptops.length}
                </span>
              )}
              <span className="text-xs text-muted-foreground tabular-nums">
                {loading ? "…" : `${models.length} model${models.length !== 1 ? "s" : ""}`}
              </span>
              {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
            </div>
          </button>

          {/* Brand actions */}
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
              brand.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
            )}>
              {brand.isActive ? "Active" : "Inactive"}
            </span>
            <button
              onClick={onBrandEdit}
              className="ml-1 rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Edit brand"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={onBrandDelete}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Delete brand"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Models table */}
        {open && (
          <div className="border-t">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pl-4 pr-3">Type</th>
                        <th className="py-2 px-3">Model</th>
                        <th className="py-2 px-3">Slug</th>
                        <th className="py-2 pl-3 pr-4">Status</th>
                        <th className="py-2 pl-2 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-4 text-sm text-muted-foreground italic">No models yet.</td></tr>
                      ) : (
                        models.map((m) => (
                          <ModelRow
                            key={m.id}
                            model={m}
                            onEdit={() => setEditModel(m)}
                            onDelete={() => setDeleteModel(m)}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Add model button */}
                <div className="border-t px-4 py-3">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddModel(true)}>
                    <Plus className="size-3.5" /> Add model
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {addModel && (
        <Modal title={`Add model to ${brand.name}`} onClose={() => setAddModel(false)}>
          <ModelForm
            brandId={brand.id}
            onSave={(m) => { onModelCreated(m); setAddModel(false); }}
            onClose={() => setAddModel(false)}
          />
        </Modal>
      )}
      {editModel && (
        <Modal title="Edit model" onClose={() => setEditModel(null)}>
          <ModelForm
            brandId={brand.id}
            initial={editModel}
            onSave={(m) => { onModelUpdated(m); setEditModel(null); }}
            onClose={() => setEditModel(null)}
          />
        </Modal>
      )}
      {deleteModel && (
        <Modal title="Delete model" onClose={() => setDeleteModel(null)}>
          <ConfirmDelete
            label={deleteModel.name}
            onClose={() => setDeleteModel(null)}
            onConfirm={async () => {
              await adminService.deleteDeviceModel(deleteModel.id);
              toast.success(`${deleteModel.name} deleted.`);
              onModelDeleted(deleteModel.id);
              setDeleteModel(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDevicesPage() {
  const [brands,        setBrands]        = useState<ApiBrand[]>([]);
  const [modelMap,      setModelMap]      = useState<Record<string, ApiDeviceModel[]>>({});
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});
  const [error,         setError]         = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [refreshKey,    setRefreshKey]    = useState(0);

  // Brand modal state
  const [addBrand,    setAddBrand]    = useState(false);
  const [editBrand,   setEditBrand]   = useState<ApiBrand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<ApiBrand | null>(null);

  // Load brands + all their models
  useEffect(() => {
    let cancelled = false;
    setLoadingBrands(true);
    setError(null);

    adminService.listBrands()
      .then((data) => {
        if (cancelled) return;
        setBrands(data);
        const pending: Record<string, boolean> = {};
        data.forEach((b) => { pending[b.slug] = true; });
        setLoadingModels(pending);

        Promise.all(
          data.map((b) =>
            adminService.listModels(b.slug)
              .then((models) => ({ slug: b.slug, models }))
              .catch(() => ({ slug: b.slug, models: [] as ApiDeviceModel[] }))
          )
        ).then((results) => {
          if (cancelled) return;
          const map: Record<string, ApiDeviceModel[]> = {};
          const done: Record<string, boolean> = {};
          results.forEach(({ slug, models }) => { map[slug] = models; done[slug] = false; });
          setModelMap(map);
          setLoadingModels(done);
        });
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load brands."); })
      .finally(() => { if (!cancelled) setLoadingBrands(false); });

    return () => { cancelled = true; };
  }, [refreshKey]);

  // Search filter
  const q = search.trim().toLowerCase();
  const filteredBrands = useMemo(() => {
    if (!q) return brands;
    return brands.filter((b) => {
      if (b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)) return true;
      return (modelMap[b.slug] ?? []).some(
        (m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q)
      );
    });
  }, [brands, modelMap, q]);

  const totalModels = useMemo(
    () => Object.values(modelMap).reduce((n, arr) => n + arr.length, 0),
    [modelMap]
  );

  // ── model mutation helpers ──
  function handleModelCreated(brandSlug: string, m: ApiDeviceModel) {
    setModelMap((prev) => ({ ...prev, [brandSlug]: [m, ...(prev[brandSlug] ?? [])] }));
  }
  function handleModelUpdated(brandSlug: string, m: ApiDeviceModel) {
    setModelMap((prev) => ({
      ...prev,
      [brandSlug]: (prev[brandSlug] ?? []).map((x) => (x.id === m.id ? m : x)),
    }));
  }
  function handleModelDeleted(brandSlug: string, id: string) {
    setModelMap((prev) => ({
      ...prev,
      [brandSlug]: (prev[brandSlug] ?? []).filter((x) => x.id !== id),
    }));
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Cpu className="mb-3 size-10 text-muted-foreground" />
        <p className="font-semibold">Failed to load devices</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Devices</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loadingBrands ? "Loading…" : `${brands.length} brands · ${totalModels} models`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddBrand(true)}>
            <Plus className="size-3.5" /> Add brand
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)} disabled={loadingBrands} className="gap-1.5">
            <RefreshCw className={cn("size-3.5", loadingBrands && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands or models…" className="h-10 pl-9" />
      </div>

      {/* List */}
      {loadingBrands ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center">
          <Cpu className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-semibold">No results for &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBrands.map((brand, i) => {
            const models = modelMap[brand.slug] ?? [];
            const displayModels = q
              ? models.filter((m) =>
                  m.name.toLowerCase().includes(q) ||
                  m.slug.toLowerCase().includes(q) ||
                  brand.name.toLowerCase().includes(q)
                )
              : models;

            return (
              <BrandCard
                key={brand.id}
                brand={brand}
                models={displayModels}
                loading={loadingModels[brand.slug] ?? false}
                defaultOpen={i === 0}
                onBrandEdit={() => setEditBrand(brand)}
                onBrandDelete={() => setDeleteBrand(brand)}
                onModelCreated={(m) => handleModelCreated(brand.slug, m)}
                onModelUpdated={(m) => handleModelUpdated(brand.slug, m)}
                onModelDeleted={(id) => handleModelDeleted(brand.slug, id)}
              />
            );
          })}
        </div>
      )}

      {/* ── Brand modals ── */}
      {addBrand && (
        <Modal title="Add brand" onClose={() => setAddBrand(false)}>
          <BrandForm
            onSave={(b) => { setBrands((prev) => [b, ...prev]); setAddBrand(false); }}
            onClose={() => setAddBrand(false)}
          />
        </Modal>
      )}
      {editBrand && (
        <Modal title="Edit brand" onClose={() => setEditBrand(null)}>
          <BrandForm
            initial={editBrand}
            onSave={(b) => { setBrands((prev) => prev.map((x) => (x.id === b.id ? b : x))); setEditBrand(null); }}
            onClose={() => setEditBrand(null)}
          />
        </Modal>
      )}
      {deleteBrand && (
        <Modal title="Delete brand" onClose={() => setDeleteBrand(null)}>
          <ConfirmDelete
            label={deleteBrand.name}
            onClose={() => setDeleteBrand(null)}
            onConfirm={async () => {
              await adminService.deactivateBrand(deleteBrand.id);
              toast.success(`${deleteBrand.name} removed.`);
              setBrands((prev) => prev.filter((b) => b.id !== deleteBrand.id));
              setDeleteBrand(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
