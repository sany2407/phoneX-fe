"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, ChevronDown, ChevronRight, Package,
  Pencil, Plus, RefreshCw, Search, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminService,
  type CreateProductPayload,
  type CreateVariantPayload,
} from "@/lib/services/admin.service";
import type { ApiProduct, ApiCategory, ApiDeviceModel } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── types ────────────────────────────────────────────────────────────────────

interface Variant {
  id: string;
  sku: string;
  price: string | number;
  comparePrice?: string | number | null;
  stock: number;
  deviceModel?: {
    id: string;
    name: string;
    slug: string;
    brand?: { id: string; name: string; slug: string };
  };
}

interface Product extends ApiProduct {
  variants?: Variant[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getBrandNames(p: Product): string[] {
  const names = (p.variants ?? [])
    .map((v) => v.deviceModel?.brand?.name)
    .filter((n): n is string => Boolean(n));
  return [...new Set(names)];
}

function imgSrc(p: Product): string | null {
  const first = p.images?.[0];
  if (!first) return null;
  if (typeof first === "string") return first;
  return (first as { url?: string }).url ?? null;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, wide = false, onClose, children }: {
  title: string; wide?: boolean; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-10 rounded-2xl border bg-card p-6 shadow-xl overflow-y-auto max-h-[90vh] w-full",
        wide ? "max-w-2xl" : "max-w-lg"
      )}>
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

// ─── Product form ─────────────────────────────────────────────────────────────

function ProductForm({ initial, categories, onSave, onClose }: {
  initial?: Product;
  categories: ApiCategory[];
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [name,       setName]      = useState(initial?.name ?? "");
  const [desc,       setDesc]      = useState(initial?.description ?? "");
  const [categoryId, setCat]       = useState(initial?.categoryId ?? "");
  const [material,   setMaterial]  = useState(initial?.material ?? "");
  const [finish,     setFinish]    = useState(initial?.finish ?? "");
  const [basePrice,  setPrice]     = useState(String(initial?.basePrice ?? ""));
  const [discountPct,setDiscount]  = useState(String(initial?.discountPct ?? "0"));
  const [isFeatured, setFeatured]  = useState(initial?.isFeatured ?? false);
  const [busy,       setBusy]      = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId || !material.trim() || !finish.trim() || !basePrice) {
      toast.error("Name, category, material, finish and price are required.");
      return;
    }
    setBusy(true);
    try {
      const payload: CreateProductPayload = {
        name: name.trim(), description: desc.trim() || undefined,
        categoryId, material: material.trim(), finish: finish.trim(),
        basePrice: Number(basePrice), discountPct: Number(discountPct) || 0, isFeatured,
      };
      const result = initial
        ? await adminService.updateProduct(initial.id, payload)
        : await adminService.createProduct(payload);
      toast.success(initial ? "Product updated." : "Product created.");
      onSave(result as Product);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cyberpunk City" required />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description…" />
      </div>
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <select value={categoryId} onChange={(e) => setCat(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
          <option value="">Select category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Material *</Label>
          <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="matte" required />
        </div>
        <div className="space-y-1.5">
          <Label>Finish *</Label>
          <Input value={finish} onChange={(e) => setFinish(e.target.value)} placeholder="satin" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Base price (₹) *</Label>
          <Input type="number" min="0" value={basePrice} onChange={(e) => setPrice(e.target.value)} placeholder="499" required />
        </div>
        <div className="space-y-1.5">
          <Label>Discount %</Label>
          <Input type="number" min="0" max="100" value={discountPct} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
        Featured product
      </label>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}

// ─── Variant form ─────────────────────────────────────────────────────────────

function VariantForm({ productId, allModels, onSave, onClose }: {
  productId: string;
  allModels: ApiDeviceModel[];
  onSave: (v: Variant) => void;
  onClose: () => void;
}) {
  const [modelSearch,  setModelSearch]  = useState("");
  const [modelId,      setModelId]      = useState("");
  const [sku,          setSku]          = useState("");
  const [price,        setPrice]        = useState("");
  const [comparePrice, setCompare]      = useState("");
  const [stock,        setStock]        = useState("0");
  const [busy,         setBusy]         = useState(false);

  const filteredModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    if (!q) return allModels.slice(0, 30);
    return allModels
      .filter((m) => {
        const brandName = (m as ApiDeviceModel & { brand?: { name?: string } }).brand?.name ?? "";
        return m.name.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [allModels, modelSearch]);

  const selectedModel = allModels.find((m) => m.id === modelId);

  // Auto-generate SKU from product + model
  useEffect(() => {
    if (selectedModel && !sku) {
      const model = selectedModel.slug.toUpperCase().replace(/-/g, "").slice(0, 8);
      setSku(`SKU-${model}`);
    }
  }, [selectedModel, sku]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!modelId || !sku.trim() || !price) {
      toast.error("Device model, SKU and price are required.");
      return;
    }
    setBusy(true);
    try {
      const payload: CreateVariantPayload = {
        productId,
        deviceModelId: modelId,
        sku: sku.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
      };
      const result = await adminService.createVariant(payload);
      toast.success("Variant added.");
      onSave(result as unknown as Variant);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add variant.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Device model picker */}
      <div className="space-y-1.5">
        <Label>Device model *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={modelSearch}
            onChange={(e) => { setModelSearch(e.target.value); setModelId(""); }}
            placeholder="Search iPhone 16, Galaxy S26…"
            className="pl-8"
          />
        </div>
        {modelSearch && !modelId && (
          <ul className="max-h-48 overflow-y-auto rounded-xl border bg-card shadow-md">
            {filteredModels.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">No models found</li>
            ) : filteredModels.map((m) => {
              const brand = (m as ApiDeviceModel & { brand?: { name?: string } }).brand?.name ?? "";
              return (
                <li key={m.id}>
                  <button type="button"
                    onClick={() => { setModelId(m.id); setModelSearch(`${brand} ${m.name}`); }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-primary/5">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{brand}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {selectedModel && (
          <p className="text-xs font-medium text-primary">
            ✓ {(selectedModel as ApiDeviceModel & { brand?: { name?: string } }).brand?.name} {selectedModel.name}
          </p>
        )}
      </div>

      {/* SKU */}
      <div className="space-y-1.5">
        <Label>SKU *</Label>
        <Input value={sku} onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. CP-CITY-IP16" className="font-mono" required />
      </div>

      {/* Price + Compare price + Stock */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Price (₹) *</Label>
          <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" required />
        </div>
        <div className="space-y-1.5">
          <Label>Compare price</Label>
          <Input type="number" min="0" value={comparePrice} onChange={(e) => setCompare(e.target.value)} placeholder="599" />
        </div>
        <div className="space-y-1.5">
          <Label>Stock</Label>
          <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="50" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy || !modelId}>{busy ? "Adding…" : "Add variant"}</Button>
      </div>
    </form>
  );
}

// ─── Confirm delete ───────────────────────────────────────────────────────────

function ConfirmDelete({ label, onConfirm, onClose }: {
  label: string; onConfirm: () => Promise<void>; onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" disabled={busy} onClick={async () => {
          setBusy(true);
          await onConfirm().finally(() => setBusy(false));
        }}>
          {busy ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </div>
  );
}

// ─── Variant rows (inline expansion) ─────────────────────────────────────────

function VariantRows({ product, allModels, onVariantAdded }: {
  product: Product;
  allModels: ApiDeviceModel[];
  onVariantAdded: (productId: string, v: Variant) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const variants = product.variants ?? [];

  return (
    <>
      {/* Variant table */}
      <tr className="bg-muted/20">
        <td colSpan={7} className="px-5 pb-3 pt-2">
          <div className="rounded-xl border bg-background overflow-hidden">
            {variants.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground italic">
                No variants yet — add one to make this skin available for a device.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pl-4 pr-3">Device model</th>
                    <th className="py-2 px-3">Brand</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Compare</th>
                    <th className="py-2 pl-3 pr-4 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pl-4 pr-3 font-medium">{v.deviceModel?.name ?? "—"}</td>
                      <td className="py-2 px-3 text-muted-foreground">{v.deviceModel?.brand?.name ?? "—"}</td>
                      <td className="py-2 px-3 font-mono text-muted-foreground">{v.sku}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold">
                        ₹{Number(v.price).toFixed(0)}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                        {v.comparePrice ? `₹${Number(v.comparePrice).toFixed(0)}` : "—"}
                      </td>
                      <td className={cn("py-2 pl-3 pr-4 text-right tabular-nums font-semibold",
                        v.stock === 0 ? "text-destructive" : v.stock <= 5 ? "text-amber-600" : "text-emerald-700"
                      )}>
                        {v.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Add variant button */}
            <div className="border-t px-4 py-2.5">
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs"
                onClick={() => setAddOpen(true)}>
                <Plus className="size-3" /> Add variant
              </Button>
            </div>
          </div>
        </td>
      </tr>

      {addOpen && (
        <Modal title={`Add variant — ${product.name}`} wide onClose={() => setAddOpen(false)}>
          <VariantForm
            productId={product.id}
            allModels={allModels}
            onSave={(v) => { onVariantAdded(product.id, v); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ product, allModels, onEdit, onDelete, onVariantAdded }: {
  product: Product;
  allModels: ApiDeviceModel[];
  onEdit: () => void;
  onDelete: () => void;
  onVariantAdded: (productId: string, v: Variant) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const brands   = getBrandNames(product);
  const varCount = product.variants?.length ?? 0;
  const img      = imgSrc(product);

  return (
    <>
      <tr className="group border-b hover:bg-muted/20 transition-colors">
        {/* Expand toggle + product */}
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={expanded ? "Collapse variants" : "Expand variants"}
            >
              {expanded
                ? <ChevronDown className="size-3.5" />
                : <ChevronRight className="size-3.5" />}
            </button>
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" className="size-9 rounded-lg border object-cover shrink-0" />
            ) : (
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                <Box className="size-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm leading-tight max-w-[160px] truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                <Package className="mr-0.5 inline size-3" />
                {varCount} variant{varCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="py-3 px-3 text-xs text-muted-foreground">{product.category?.name ?? "—"}</td>

        {/* Brands (from variants) */}
        <td className="py-3 px-3">
          <div className="flex flex-wrap gap-1">
            {brands.length > 0 ? brands.map((b) => (
              <span key={b} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{b}</span>
            )) : <span className="text-xs text-muted-foreground/40">—</span>}
          </div>
        </td>

        {/* Material */}
        <td className="py-3 px-3 text-xs text-muted-foreground capitalize">{product.material} · {product.finish}</td>

        {/* Price */}
        <td className="py-3 px-3 text-right tabular-nums font-medium text-sm">
          {formatINR(product.basePrice)}
          {product.discountPct > 0 && (
            <span className="ml-1 text-[11px] font-semibold text-sale">−{product.discountPct}%</span>
          )}
        </td>

        {/* Status */}
        <td className="py-3 px-3">
          <div className="flex flex-wrap gap-1">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
              product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
            {product.isFeatured && (
              <span className="rounded-full bg-electric-soft px-2 py-0.5 text-[11px] font-semibold text-primary">Featured</span>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 pl-3 pr-4">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Edit">
              <Pencil className="size-3.5" />
            </button>
            <button onClick={onDelete}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Delete">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded variant rows */}
      {expanded && (
        <VariantRows
          product={product}
          allModels={allModels}
          onVariantAdded={onVariantAdded}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [allModels,  setAllModels]  = useState<ApiDeviceModel[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [addOpen,    setAddOpen]    = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [delTarget,  setDelTarget]  = useState<Product | null>(null);

  // Load products + categories + all device models (for variant form)
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const qs   = new URLSearchParams({ page: String(page), limit: "20" });

    Promise.all([
      fetch(`${base}/products?${qs}`, { headers: { "Content-Type": "application/json" } }).then((r) => r.json()),
      adminService.listCategories(),
      adminService.listBrands()
        .then((brands) => Promise.all(brands.map((b) => adminService.listModels(b.slug).catch(() => []))))
        .then((nested) => nested.flat()),
    ])
      .then(([json, cats, models]) => {
        if (cancelled) return;
        const inner = json?.data ?? json;
        const items: Product[] = inner?.products ?? inner?.items ?? (Array.isArray(inner) ? inner : []);
        const pag   = inner?.pagination ?? {};
        setProducts(items);
        setTotalPages(pag.totalPages ?? 1);
        setTotal(pag.total ?? items.length);
        setCategories(Array.isArray(cats) ? cats : []);
        setAllModels(Array.isArray(models) ? models : []);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      getBrandNames(p).some((b) => b.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleVariantAdded = useCallback((productId: string, v: Variant) => {
    setProducts((prev) => prev.map((p) =>
      p.id === productId
        ? { ...p, variants: [...(p.variants ?? []), v] }
        : p
    ));
  }, []);

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Box className="mb-3 size-10 text-muted-foreground" />
      <p className="font-semibold">Failed to load products</p>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${total} skin designs · click a row to manage variants`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add product
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading} className="gap-1.5">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category, brand…" className="h-10 pl-9" />
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-electric-soft/40 px-4 py-3 text-sm">
        <Package className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Product</span> = the skin design (e.g. "Cyberpunk City").{" "}
          <span className="font-semibold text-foreground">Variant</span> = that design cut for a specific device model.
          Expand any product to view and add variants.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Box className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">{search ? `No results for "${search}"` : "No products yet"}</p>
            {!search && <p className="mt-1 text-sm text-muted-foreground">Add your first skin design to get started.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-4 pr-3">Product / Design</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brands</th>
                  <th className="py-3 px-3">Material</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    allModels={allModels}
                    onEdit={() => setEditTarget(p)}
                    onDelete={() => setDelTarget(p)}
                    onVariantAdded={handleVariantAdded}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <p className="text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {addOpen && (
        <Modal title="Add skin design" onClose={() => setAddOpen(false)}>
          <ProductForm
            categories={categories}
            onSave={(p) => { setProducts((prev) => [p, ...prev]); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit product" onClose={() => setEditTarget(null)}>
          <ProductForm
            initial={editTarget}
            categories={categories}
            onSave={(p) => { setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, ...p } : x)); setEditTarget(null); }}
            onClose={() => setEditTarget(null)}
          />
        </Modal>
      )}
      {delTarget && (
        <Modal title="Delete product" onClose={() => setDelTarget(null)}>
          <ConfirmDelete
            label={delTarget.name}
            onClose={() => setDelTarget(null)}
            onConfirm={async () => {
              await adminService.deleteProduct(delTarget.id);
              toast.success(`"${delTarget.name}" deleted.`);
              setProducts((prev) => prev.filter((p) => p.id !== delTarget.id));
              setDelTarget(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
