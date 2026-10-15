"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown, ChevronRight, Cpu, Headphones, Laptop,
  Pencil, Plus, RefreshCw, Search, Smartphone, Tablet, Trash2, Watch, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminService,
  type CreateBrandPayload,
  type UpdateBrandPayload,
  type CreateDeviceModelPayload,
  type UpdateDeviceModelPayload,
} from "@/lib/services/admin.service";
import { devicesService } from "@/lib/services/devices.service";
import type { ApiBrand, ApiDeviceModel, ApiDeviceType } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── constants ───────────────────────────────────────────────────────────────

// Device types come from GET /devices/types (smartphone, laptop, tablet…).
// Icon + chip styling is keyed by type slug, with a neutral fallback.
const TYPE_ICON: Record<string, React.ElementType> = {
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  earbuds: Headphones,
  smartwatch: Watch,
};
const TYPE_CHIP: Record<string, string> = {
  smartphone: "bg-primary/10 text-primary",
  tablet: "bg-violet-100 text-violet-700",
  laptop: "bg-amber-100 text-amber-700",
  earbuds: "bg-emerald-100 text-emerald-700",
  smartwatch: "bg-sky-100 text-sky-700",
};

// Legacy rows (pre-deviceTypeId) carry a PHONE/TABLET/LAPTOP string.
const LEGACY_TYPE_SLUG: Record<string, string> = {
  PHONE: "smartphone", TABLET: "tablet", LAPTOP: "laptop",
};

function modelTypeSlug(m: ApiDeviceModel): string | undefined {
  return m.deviceType?.slug ?? (m.type ? LEGACY_TYPE_SLUG[m.type] : undefined);
}

function modelTypeName(m: ApiDeviceModel): string {
  return m.deviceType?.name ?? (m.type ? m.type.charAt(0) + m.type.slice(1).toLowerCase() : "Unknown");
}

function typeIcon(slug: string | undefined): React.ElementType {
  return (slug && TYPE_ICON[slug]) || Cpu;
}

function typeChip(slug: string | undefined): string {
  return (slug && TYPE_CHIP[slug]) ?? "bg-muted text-muted-foreground";
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
  brandId, deviceTypes, initial, onSave, onClose,
}: {
  brandId: string;
  deviceTypes: ApiDeviceType[];
  initial?: ApiDeviceModel;
  onSave: (m: ApiDeviceModel) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(initial?.name ?? "");
  const [deviceTypeId, setDeviceTypeId] = useState(
    initial?.deviceTypeId ?? initial?.deviceType?.id ?? deviceTypes[0]?.id ?? ""
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [busy, setBusy]   = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Model name is required."); return; }
    if (!deviceTypeId) { toast.error("Pick a device type."); return; }
    setBusy(true);
    try {
      let result: ApiDeviceModel;
      if (initial) {
        const payload: UpdateDeviceModelPayload = {
          name: name.trim(),
          deviceTypeId,
          imageUrl: imageUrl.trim() || undefined,
        };
        result = await adminService.updateDeviceModel(initial.id, payload);
        toast.success("Model updated.");
      } else {
        const payload: CreateDeviceModelPayload = {
          brandId,
          deviceTypeId,
          name: name.trim(),
          imageUrl: imageUrl.trim() || undefined,
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
        <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. iPhone 19" required />
        <p className="text-xs text-muted-foreground">The URL slug is auto-generated from the name.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-type">Device type</Label>
        <select
          id="m-type"
          value={deviceTypeId}
          onChange={(e) => setDeviceTypeId(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          required
        >
          <option value="" disabled>Select a type…</option>
          {deviceTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-image">Image URL (optional)</Label>
        <Input id="m-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Device type form ─────────────────────────────────────────────────────────

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
  const slug = modelTypeSlug(model);
  const Icon    = typeIcon(slug);
  const chipCls = typeChip(slug);

  return (
    <tr className="group border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-3 pl-4 pr-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", chipCls)}>
          <Icon className="size-3" aria-hidden="true" />
          {modelTypeName(model)}
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
  brand, models, loading, defaultOpen, deviceTypes,
  onBrandEdit, onBrandDelete,
  onModelCreated, onModelUpdated, onModelDeleted,
}: {
  brand: ApiBrand;
  models: ApiDeviceModel[];
  loading: boolean;
  defaultOpen: boolean;
  deviceTypes: ApiDeviceType[];
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

  // Per-type counts, driven by the live device types
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    models.forEach((m) => {
      const slug = modelTypeSlug(m);
      if (slug) map[slug] = (map[slug] ?? 0) + 1;
    });
    return map;
  }, [models]);

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
              {deviceTypes.map((t) => {
                const n = counts[t.slug] ?? 0;
                if (n === 0) return null;
                const Icon = typeIcon(t.slug);
                return (
                  <span key={t.id} className={cn("hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", typeChip(t.slug))}>
                    <Icon className="size-3" aria-hidden="true" />{n}
                  </span>
                );
              })}
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
                {/* Scrolls past 5 rows (~5 × 45px); header sticks */}
                <div className="max-h-60 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
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
            deviceTypes={deviceTypes}
            onSave={(m) => { onModelCreated(m); setAddModel(false); }}
            onClose={() => setAddModel(false)}
          />
        </Modal>
      )}
      {editModel && (
        <Modal title="Edit model" onClose={() => setEditModel(null)}>
          <ModelForm
            brandId={brand.id}
            deviceTypes={deviceTypes}
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

const PAGE_SIZE = 8;

export default function AdminDevicesPage() {
  const [brands,        setBrands]        = useState<ApiBrand[]>([]);
  const [modelMap,      setModelMap]      = useState<Record<string, ApiDeviceModel[]>>({});
  const [deviceTypes,   setDeviceTypes]   = useState<ApiDeviceType[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});
  const [error,         setError]         = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState<string>("ALL");
  const [page,          setPage]          = useState(1);
  const [refreshKey,    setRefreshKey]    = useState(0);

  // Brand modal state
  const [addBrand,    setAddBrand]    = useState(false);
  const [editBrand,   setEditBrand]   = useState<ApiBrand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<ApiBrand | null>(null);

  // Device type modal state
  const [addType, setAddType] = useState(false);

  // Load device types + brands + all their models
  useEffect(() => {
    let cancelled = false;
    setLoadingBrands(true);
    setError(null);

    devicesService.getDeviceTypes()
      .then((types) => { if (!cancelled) setDeviceTypes(types.filter((t) => t.isActive)); })
      .catch(() => { if (!cancelled) setDeviceTypes([]); });

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

  // Reset to page 1 when search or type filter changes
  useEffect(() => { setPage(1); }, [search, typeFilter]);

  const q = search.trim().toLowerCase();

  // 1. Filter brands by search + type filter
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const models = modelMap[b.slug] ?? [];

      // Type filter: brand must have at least one model of the selected type
      if (typeFilter !== "ALL") {
        const hasType = models.some((m) => modelTypeSlug(m) === typeFilter);
        if (!hasType) return false;
      }

      // Search filter
      if (!q) return true;
      if (b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q)) return true;
      return models.some((m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
    });
  }, [brands, modelMap, q, typeFilter]);

  // 2. Paginate
  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const pagedBrands = filteredBrands.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const TYPE_FILTERS = [
    { value: "ALL", label: "All types", chip: undefined as string | undefined },
    ...deviceTypes.map((t) => ({ value: t.slug, label: t.name + "s", chip: typeChip(t.slug) })),
  ];

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
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddType(true)}>
            <Plus className="size-3.5" /> Add type
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setAddBrand(true)}>
            <Plus className="size-3.5" /> Add brand
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)} disabled={loadingBrands} className="gap-1.5">
            <RefreshCw className={cn("size-3.5", loadingBrands && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Search + type filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands or models…" className="h-10 pl-9" />
        </div>

        {/* Type filter chips */}
        <div className="flex items-center gap-1.5">
          {TYPE_FILTERS.map(({ value, label, chip }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                typeFilter === value
                  ? value === "ALL"
                    ? "bg-foreground text-background border-foreground"
                    : cn(chip, "border-transparent")
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {value !== "ALL" && (() => {
                const Icon = typeIcon(value);
                return <Icon className="mr-1 inline-block size-3 align-middle" aria-hidden="true" />;
              })()}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand list */}
      {loadingBrands ? (
        <div className="space-y-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : pagedBrands.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center">
          <Cpu className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-semibold">
            {search || typeFilter !== "ALL" ? "No results found" : "No brands yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagedBrands.map((brand, i) => {
            const allModels = modelMap[brand.slug] ?? [];

            // Filter displayed models by type + search
            const displayModels = allModels.filter((m) => {
              const matchesType = typeFilter === "ALL" || modelTypeSlug(m) === typeFilter;
              const matchesQ = !q || m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q) || brand.name.toLowerCase().includes(q);
              return matchesType && matchesQ;
            });

            return (
              <BrandCard
                key={brand.id}
                brand={brand}
                models={displayModels}
                loading={loadingModels[brand.slug] ?? false}
                defaultOpen={i === 0 && page === 1}
                deviceTypes={deviceTypes}
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

      {/* Pagination */}
      {!loadingBrands && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4 text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredBrands.length)} of {filteredBrands.length} brands
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            {/* Page number pills */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "grid size-8 place-items-center rounded-md text-xs font-medium transition-colors",
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── Brand modals ── */}
      {addType && (
        <Modal title="Add device type" onClose={() => setAddType(false)}>
          <DeviceTypeForm
            onSave={(t) => {
              setDeviceTypes((prev) =>
                [...prev.filter((x) => x.id !== t.id), t].sort((a, b) => a.name.localeCompare(b.name))
              );
              setAddType(false);
            }}
            onClose={() => setAddType(false)}
          />
        </Modal>
      )}
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
