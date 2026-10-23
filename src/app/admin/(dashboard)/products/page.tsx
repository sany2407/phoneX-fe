"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Box, ChevronDown, ChevronRight, Image as ImageIcon, Loader2,
  Package, Pencil, Plus, RefreshCw, Search, Trash2, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/admin.service";
import { productsService } from "@/lib/services/products.service";
import { devicesService } from "@/lib/services/devices.service";
import { uploadMultiple } from "@/lib/services/upload.service";
import type { ApiCategory, ApiDeviceModel } from "@/lib/api-types";
import { primaryImage } from "@/lib/product-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── local types matching actual backend schema ───────────────────────────────

interface ProductVariant {
  id: string;
  sku: string;
  price: string | number;
  comparePrice?: string | number | null;
  stock: number;
  images?: string[];
  isActive?: boolean;
  deviceModel?: {
    id: string;
    name: string;
    slug: string;
    brand?: { id: string; name: string; slug: string };
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  categoryId?: string;
  variants?: ProductVariant[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getBrandNames(p: Product): string[] {
  const names = (p.variants ?? [])
    .map((v) => v.deviceModel?.brand?.name)
    .filter((n): n is string => Boolean(n));
  return [...new Set(names)];
}

function lowestPrice(p: Product): string {
  const prices = (p.variants ?? [])
    .map((v) => Number(v.price))
    .filter((n) => n > 0);
  if (!prices.length) return "—";
  const min = Math.min(...prices);
  return `₹${min.toFixed(0)}`;
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

  // Portaled to document.body: callers render <Modal> inside table rows,
  // and a <div> under <tbody> is invalid HTML (hydration error).
  return createPortal(
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
    </div>,
    document.body
  );
}

// ─── Draft variant (create-with-variants) ─────────────────────────────────────

type ModelWithBrand = ApiDeviceModel & { brand?: { id: string; name: string; slug: string } };

/** A variant row being composed in the create form, before it hits the API. */
interface DraftVariant {
  key: string;
  modelId: string;
  modelLabel: string;
  price: string;
  comparePrice: string;
  stock: string;
  images: string[];
  uploading: boolean;
}

function newDraft(): DraftVariant {
  return {
    key: Math.random().toString(36).slice(2),
    modelId: "",
    modelLabel: "",
    price: "",
    comparePrice: "",
    stock: "50",
    images: [],
    uploading: false,
  };
}

/**
 * Searchable device-model picker. `exclude` hides models that a sibling
 * variant row already claimed, so the same model can't be added twice.
 */
function ModelPicker({ allModels, value, label, onChange, exclude = [], placeholder }: {
  allModels: ApiDeviceModel[];
  value: string;
  label: string;
  onChange: (id: string, label: string) => void;
  exclude?: string[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState(label);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = (allModels as ModelWithBrand[]).filter(
      (m) => m.id === value || !exclude.includes(m.id)
    );
    if (!q) return pool.slice(0, 30);
    return pool
      .filter((m) => m.name.toLowerCase().includes(q) || m.brand?.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [allModels, query, exclude, value]);

  const selected = (allModels as ModelWithBrand[]).find((m) => m.id === value);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange("", ""); }}
          placeholder={placeholder ?? "Search iPhone 16, Galaxy S26…"}
          className="pl-8"
        />
      </div>

      {query.trim().length > 0 && !value && (
        <ul className="max-h-48 overflow-y-auto rounded-xl border bg-card shadow-md">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No models found</li>
          ) : results.map((m) => {
            const full = `${m.brand?.name ?? ""} ${m.name}`.trim();
            return (
              <li key={m.id}>
                <button type="button"
                  onClick={() => { setQuery(full); onChange(m.id, full); }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-primary/5">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.brand?.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <p className="text-xs font-medium text-primary">
          ✓ {selected.brand?.name} {selected.name}
        </p>
      )}
    </div>
  );
}

/** One variant row inside the create form: model, pricing, per-model mockups. */
function DraftVariantCard({ index, draft, allModels, exclude, onChange, onRemove }: {
  index: number;
  draft: DraftVariant;
  allModels: ApiDeviceModel[];
  exclude: string[];
  onChange: (patch: Partial<DraftVariant>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onChange({ uploading: true });
    try {
      const urls = await uploadMultiple(Array.from(files).slice(0, 10), "variants");
      onChange({ images: [...draft.images, ...urls] });
      toast.success(`${urls.length} mockup${urls.length > 1 ? "s" : ""} uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      onChange({ uploading: false });
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Variant {index + 1}
        </span>
        <button type="button" onClick={onRemove}
          aria-label={`Remove variant ${index + 1}`}
          className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <ModelPicker
        allModels={allModels}
        value={draft.modelId}
        label={draft.modelLabel}
        exclude={exclude}
        onChange={(id, modelLabel) => onChange({ modelId: id, modelLabel })}
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Price (₹) *</Label>
          <Input type="number" min="0" value={draft.price}
            onChange={(e) => onChange({ price: e.target.value })} placeholder="499" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Compare at (₹)</Label>
          <Input type="number" min="0" value={draft.comparePrice}
            onChange={(e) => onChange({ comparePrice: e.target.value })} placeholder="599" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Stock</Label>
          <Input type="number" min="0" value={draft.stock}
            onChange={(e) => onChange({ stock: e.target.value })} placeholder="50" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Mockups for this model</Label>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple
          className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Button type="button" variant="outline" size="sm"
          className="w-full gap-2 border-dashed"
          onClick={() => fileRef.current?.click()} disabled={draft.uploading}>
          {draft.uploading
            ? <><Loader2 className="size-3.5 animate-spin" /> Uploading…</>
            : <><Upload className="size-3.5" /> Upload mockups</>}
        </Button>
        {draft.images.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {draft.images.map((url, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-11 rounded-md border object-cover" />
                <button type="button"
                  onClick={() => onChange({ images: draft.images.filter((_, j) => j !== i) })}
                  className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="size-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product form ─────────────────────────────────────────────────────────────
// Create: name, description, categoryId, images, isFeatured + optional variants
// Edit:   same minus variants (those are added from the expanded product row)

function ProductForm({ initial, categories, allModels, onSave, onClose }: {
  initial?: Product;
  categories: ApiCategory[];
  allModels: ApiDeviceModel[];
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [name,       setName]      = useState(initial?.name ?? "");
  const [desc,       setDesc]      = useState(initial?.description ?? "");
  const [categoryId, setCat]       = useState(
    initial?.categoryId ?? initial?.category?.id ?? ""
  );
  const [imageInput, setImageInput] = useState("");
  const [images,     setImages]    = useState<string[]>(initial?.images ?? []);
  const [isFeatured, setFeatured]  = useState(initial?.isFeatured ?? false);
  const [busy,       setBusy]      = useState(false);

  // Variants are composed on create only; edits add them from the product row.
  const [variants, setVariants] = useState<DraftVariant[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function addVariant() {
    setVariants((prev) => [...prev, newDraft()]);
  }

  function patchVariant(key: string, patch: Partial<DraftVariant>) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadMultiple(Array.from(files), "products");
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageInput("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      toast.error("Name and category are required.");
      return;
    }

    if (!initial && variants.length > 0) {
      if (variants.some((v) => !v.modelId)) {
        toast.error("Pick a device model for every variant.");
        return;
      }
      const picked = variants.map((v) => v.modelId);
      if (new Set(picked).size !== picked.length) {
        toast.error("Each variant must use a different device model.");
        return;
      }
      if (variants.some((v) => !v.price || Number(v.price) <= 0)) {
        toast.error("Every variant needs a price greater than 0.");
        return;
      }
    }

    setBusy(true);
    try {
      // Shared part of both product payloads
      const base = {
        name: name.trim(),
        description: desc.trim() || undefined,
        categoryId,
        images,
        isFeatured,
      };

      const result = initial
        ? await adminService.updateProduct(initial.id, base)
        : variants.length > 0
          ? // One transaction: product + every variant, or nothing at all.
            await adminService.createProductWithVariants({
              ...base,
              variants: variants.map((v) => ({
                deviceModelId: v.modelId,
                price: Number(v.price),
                comparePrice: v.comparePrice ? Number(v.comparePrice) : undefined,
                stock: Number(v.stock) || 0,
                images: v.images,
              })),
            })
          : await adminService.createProduct(base);

      toast.success(
        initial
          ? "Product updated."
          : variants.length > 0
            ? `Design created with ${variants.length} variant${variants.length > 1 ? "s" : ""}.`
            : "Product created."
      );
      onSave(result as unknown as Product);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label>Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Neon City" required />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Input value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Short description of the design…" />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <select value={categoryId} onChange={(e) => setCat(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required>
          <option value="">Select category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Design images */}
      <div className="space-y-1.5">
        <Label>Design images</Label>

        {/* Upload from device */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-dashed h-11"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="size-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="size-4" /> Upload images (up to 10)</>
          )}
        </Button>

        {/* Or paste a URL */}
        <div className="flex gap-2">
          <Input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Or paste a URL and press Add"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          />
          <Button type="button" variant="outline" onClick={addImage} className="shrink-0">
            Add
          </Button>
        </div>

        {/* Thumbnails */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-16 rounded-lg border object-cover" />
                {i === 0 && (
                  <span className="absolute -bottom-1 left-0 right-0 text-center text-[9px] font-bold text-primary">
                    PRIMARY
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Files go to Cloudinary. First image is the primary.
        </p>
      </div>

      {/* Variants — create only: committed with the product in one transaction */}
      {!initial && (
        <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label>Device variants</Label>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Cut this design for specific phone models. The product and every variant
                are created in one request — if one fails, nothing is saved.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline"
              className="shrink-0 gap-1.5" onClick={addVariant}>
              <Plus className="size-3.5" /> Add model
            </Button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              No variants — you can also add them later by expanding the product row.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <DraftVariantCard
                  key={v.key}
                  index={i}
                  draft={v}
                  allModels={allModels}
                  exclude={variants
                    .filter((x) => x.key !== v.key)
                    .map((x) => x.modelId)
                    .filter(Boolean)}
                  onChange={(patch) => patchVariant(v.key, patch)}
                  onRemove={() => setVariants((prev) => prev.filter((x) => x.key !== v.key))}
                />
              ))}
              <p className="text-xs text-muted-foreground">
                SKUs are generated automatically from the design name and phone model.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Featured */}
      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setFeatured(e.target.checked)}
          className="rounded" />
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
// Fields: productId, deviceModelId, sku, price, comparePrice, stock, images[]

function VariantForm({ productId, allModels, variant, onSave, onClose }: {
  productId: string;
  allModels: ApiDeviceModel[];
  /** Present → edit mode (device model + SKU are fixed). */
  variant?: ProductVariant;
  onSave: (v: ProductVariant) => void;
  onClose: () => void;
}) {
  const isEdit = Boolean(variant);
  const [modelId,      setModelId]     = useState(variant?.deviceModel?.id ?? "");
  const [sku,          setSku]         = useState(variant?.sku ?? "");
  const [price,        setPrice]       = useState(variant ? String(Number(variant.price)) : "");
  const [comparePrice, setCompare]     = useState(
    variant?.comparePrice != null ? String(Number(variant.comparePrice)) : ""
  );
  const [stock,        setStock]       = useState(String(variant?.stock ?? 0));
  const [images,       setImages]      = useState<string[]>(variant?.images ?? []);
  const [imageInput,   setImageInput]  = useState("");
  const [uploading,    setUploading]   = useState(false);
  const [isActive,     setIsActive]    = useState(variant?.isActive ?? true);
  const [busy,         setBusy]        = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only used to suggest a SKU — the picker renders the selection itself.
  const selectedModel = (allModels as ModelWithBrand[]).find((m) => m.id === modelId);

  // Auto-generate SKU suggestion (new variants only)
  useEffect(() => {
    if (!isEdit && selectedModel && !sku) {
      const abbr = selectedModel.slug.toUpperCase().replace(/-/g, "").slice(0, 8);
      setSku(`SKU-${abbr}`);
    }
  }, [isEdit, selectedModel, sku]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadMultiple(Array.from(files).slice(0, 10), "variants");
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageInput("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim() || !price) {
      toast.error("SKU and price are required.");
      return;
    }
    if (!isEdit && !modelId) {
      toast.error("Pick a device model.");
      return;
    }
    setBusy(true);
    try {
      if (isEdit && variant) {
        const updated = await adminService.updateVariant(variant.id, {
          price: Number(price),
          comparePrice: comparePrice ? Number(comparePrice) : null,
          stock: Number(stock) || 0,
          images,
          isActive,
        });
        toast.success("Variant updated.");
        onSave(updated as unknown as ProductVariant);
      } else {
        const created = await adminService.createVariant({
          productId,
          deviceModelId: modelId,
          sku: sku.trim(),
          price: Number(price),
          comparePrice: comparePrice ? Number(comparePrice) : undefined,
          stock: Number(stock) || 0,
          images,
        });
        toast.success("Variant added.");
        onSave(created as unknown as ProductVariant);
      }
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "add"} variant.`
      );
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Device model — picked at creation, fixed afterwards */}
      <div className="space-y-1.5">
        <Label>Device model *</Label>
        {isEdit ? (
          <p className="rounded-md border border-input bg-muted/40 px-3 py-2.5 text-sm">
            {variant?.deviceModel
              ? `${variant.deviceModel.brand?.name ?? ""} ${variant.deviceModel.name}`.trim()
              : "—"}
          </p>
        ) : (
          <ModelPicker
            allModels={allModels}
            value={modelId}
            label=""
            onChange={(id) => setModelId(id)}
          />
        )}
      </div>

      {/* SKU */}
      <div className="space-y-1.5">
        <Label>SKU *</Label>
        <Input value={sku} onChange={(e) => setSku(e.target.value)}
          placeholder="e.g. NEON-CITY-IP16" className="font-mono" required
          disabled={isEdit} />
        {isEdit && (
          <p className="text-[10px] text-muted-foreground">
            SKU can&apos;t be changed after creation.
          </p>
        )}
      </div>

      {/* Price + Compare + Stock */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Price (₹) *</Label>
          <Input type="number" min="0" value={price}
            onChange={(e) => setPrice(e.target.value)} placeholder="499" required />
        </div>
        <div className="space-y-1.5">
          <Label>Compare at (₹)</Label>
          <Input type="number" min="0" value={comparePrice}
            onChange={(e) => setCompare(e.target.value)} placeholder="599" />
          <p className="text-[10px] text-muted-foreground">Shown as strikethrough</p>
        </div>
        <div className="space-y-1.5">
          <Label>Stock</Label>
          <Input type="number" min="0" value={stock}
            onChange={(e) => setStock(e.target.value)} placeholder="50" />
        </div>
      </div>

      {/* Variant mockups — the design shown on THIS device model */}
      <div className="space-y-1.5">
        <Label>Variant images (mockups)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-dashed h-11"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="size-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="size-4" /> Upload mockups (up to 10)</>
          )}
        </Button>
        <div className="flex gap-2">
          <Input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Or paste a URL and press Add"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          />
          <Button type="button" variant="outline" onClick={addImage} className="shrink-0">
            Add
          </Button>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-16 rounded-lg border object-cover" />
                {i === 0 && (
                  <span className="absolute -bottom-1 left-0 right-0 text-center text-[9px] font-bold text-primary">
                    PRIMARY
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Shown on the product page once the customer selects this phone model. First image is primary.
        </p>
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-input"
          />
          Active (visible in the store)
        </label>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy || (!isEdit && !modelId)}>
          {busy
            ? (isEdit ? "Saving…" : "Adding…")
            : (isEdit ? "Save changes" : "Add variant")}
        </Button>
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

// ─── Variant sub-table (inline expansion) ────────────────────────────────────

function VariantRows({ product, allModels, onVariantAdded, onVariantUpdated }: {
  product: Product;
  allModels: ApiDeviceModel[];
  onVariantAdded: (productId: string, v: ProductVariant) => void;
  onVariantUpdated: (productId: string, v: ProductVariant) => void;
}) {
  const [addOpen,    setAddOpen]    = useState(false);
  const [editTarget, setEditTarget] = useState<ProductVariant | null>(null);
  const variants = product.variants ?? [];

  return (
    <>
      <tr className="bg-muted/20">
        <td colSpan={7} className="px-5 pb-3 pt-2">
          <div className="rounded-xl border bg-background overflow-hidden">
            {variants.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground italic">
                No variants yet. Add one to make this skin available for a device.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pl-4 pr-3">Device model</th>
                    <th className="py-2 px-3">Brand</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Mockups</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Compare</th>
                    <th className="py-2 px-3 text-right">Stock</th>
                    <th className="py-2 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 pl-4 pr-3 font-medium">
                        {v.deviceModel?.name ?? "—"}
                        {v.isActive === false && (
                          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{v.deviceModel?.brand?.name ?? "—"}</td>
                      <td className="py-2 px-3 font-mono text-muted-foreground">{v.sku}</td>
                      <td className="py-2 px-3">
                        {v.images && v.images.length > 0 ? (
                          <div className="flex -space-x-2">
                            {v.images.slice(0, 3).map((url, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={url} alt=""
                                className="size-6 rounded border bg-card object-cover ring-1 ring-background" />
                            ))}
                            {v.images.length > 3 && (
                              <span className="grid size-6 place-items-center rounded border bg-muted text-[9px] font-semibold text-muted-foreground ring-1 ring-background">
                                +{v.images.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold">
                        ₹{Number(v.price).toFixed(0)}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                        {v.comparePrice ? `₹${Number(v.comparePrice).toFixed(0)}` : "—"}
                      </td>
                      <td className={cn(
                        "py-2 px-3 text-right tabular-nums font-semibold",
                        v.stock === 0
                          ? "text-destructive"
                          : v.stock <= 5
                            ? "text-amber-600"
                            : "text-emerald-700"
                      )}>
                        {v.stock}
                      </td>
                      <td className="py-2 pl-3 pr-4 text-right">
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"
                          onClick={() => setEditTarget(v)}>
                          <Pencil className="size-3" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

      {editTarget && (
        <Modal title={`Edit variant — ${product.name}`} wide onClose={() => setEditTarget(null)}>
          <VariantForm
            productId={product.id}
            allModels={allModels}
            variant={editTarget}
            onSave={(v) => { onVariantUpdated(product.id, v); setEditTarget(null); }}
            onClose={() => setEditTarget(null)}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ product, allModels, onEdit, onDelete, onVariantAdded, onVariantUpdated }: {
  product: Product;
  allModels: ApiDeviceModel[];
  onEdit: () => void;
  onDelete: () => void;
  onVariantAdded: (productId: string, v: ProductVariant) => void;
  onVariantUpdated: (productId: string, v: ProductVariant) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const brands   = getBrandNames(product);
  const varCount = product.variants?.length ?? 0;
  const firstImg = primaryImage(product);

  return (
    <>
      <tr className="group border-b hover:bg-muted/20 transition-colors">
        {/* Expand + image + name */}
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2">
            <button type="button"
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={expanded ? "Collapse" : "Expand variants"}>
              {expanded
                ? <ChevronDown className="size-3.5" />
                : <ChevronRight className="size-3.5" />}
            </button>
            {firstImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firstImg} alt="" className="size-9 rounded-lg border object-cover shrink-0" />
            ) : (
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                <ImageIcon className="size-4 text-muted-foreground" />
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
        <td className="py-3 px-3 text-xs text-muted-foreground">
          {product.category?.name ?? "—"}
        </td>

        {/* Brands (derived from variants) */}
        <td className="py-3 px-3">
          <div className="flex flex-wrap gap-1">
            {brands.length > 0
              ? brands.map((b) => (
                <span key={b} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{b}</span>
              ))
              : <span className="text-xs text-muted-foreground/40">—</span>}
          </div>
        </td>

        {/* Price range (from variants) */}
        <td className="py-3 px-3 text-right tabular-nums font-medium text-sm">
          {lowestPrice(product)}
          {varCount > 1 && <span className="ml-1 text-[11px] text-muted-foreground">+</span>}
        </td>

        {/* Status */}
        <td className="py-3 px-3">
          <div className="flex flex-wrap gap-1">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
              product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
            {product.isFeatured && (
              <span className="rounded-full bg-electric-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                Featured
              </span>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 pl-3 pr-4">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Edit product">
              <Pencil className="size-3.5" />
            </button>
            <button onClick={onDelete}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Delete product">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <VariantRows
          product={product}
          allModels={allModels}
          onVariantAdded={onVariantAdded}
          onVariantUpdated={onVariantUpdated}
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    Promise.all([
      // Products — paginated list via the shared service
      productsService.list({ page, limit: 20 }),
      // Categories for the product form
      adminService.listCategories(),
      // All device models for the variant form (type-based sweep, ~4 requests).
      // Never fetch one request per brand — that trips the API rate limiter.
      devicesService.getAllModels(),
    ])
      .then(([res, cats, models]) => {
        if (cancelled) return;
        setProducts(res.items as unknown as Product[]);
        setTotalPages(res.pagination.totalPages ?? 1);
        setTotal(res.pagination.total ?? res.items.length);
        setCategories(Array.isArray(cats) ? cats : []);
        setAllModels(Array.isArray(models) ? models : []);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q) ||
      getBrandNames(p).some((b) => b.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleVariantAdded = useCallback((productId: string, v: ProductVariant) => {
    setProducts((prev) => prev.map((p) =>
      p.id === productId ? { ...p, variants: [...(p.variants ?? []), v] } : p
    ));
  }, []);

  const handleVariantUpdated = useCallback((productId: string, v: ProductVariant) => {
    setProducts((prev) => prev.map((p) =>
      p.id === productId
        ? { ...p, variants: (p.variants ?? []).map((x) => (x.id === v.id ? v : x)) }
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
            {loading ? "Loading…" : `${total} skin designs · expand a row to manage variants`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add product
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => setRefreshKey((k) => k + 1)} disabled={loading} className="gap-1.5">
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

      {/* Explainer */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-electric-soft/40 px-4 py-3 text-sm">
        <Package className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground leading-relaxed">
          <strong className="font-semibold text-foreground">Product</strong> = the skin design artwork (e.g. &ldquo;Neon City&rdquo;).{" "}
          <strong className="font-semibold text-foreground">Variant</strong> = that design cut for a specific phone model, with its own SKU, price and stock.
          Click the <ChevronRight className="inline size-3.5 align-middle" /> to expand variants.
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
            {!search && (
              <p className="mt-1 text-sm text-muted-foreground">Add your first skin design to get started.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-4 pr-3">Product / Design</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brands</th>
                  <th className="py-3 px-3 text-right">From</th>
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
                    onVariantUpdated={handleVariantUpdated}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <>
            <Separator />
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <p className="text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {addOpen && (
        <Modal title="Add skin design" wide onClose={() => setAddOpen(false)}>
          <ProductForm
            categories={categories}
            allModels={allModels}
            onSave={(p) => { setProducts((prev) => [p, ...prev]); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit product" wide onClose={() => setEditTarget(null)}>
          <ProductForm
            initial={editTarget}
            categories={categories}
            allModels={allModels}
            onSave={(p) => {
              setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, ...p } : x));
              setEditTarget(null);
            }}
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
              toast.success(`"${delTarget.name}" deactivated.`);
              setProducts((prev) => prev.filter((p) => p.id !== delTarget.id));
              setDelTarget(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
