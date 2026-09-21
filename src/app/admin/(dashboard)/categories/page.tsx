"use client";

import { useEffect, useState, useMemo } from "react";
import { Layers, Pencil, Plus, RefreshCw, Search, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminService,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "@/lib/services/admin.service";
import type { ApiCategory } from "@/lib/api-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
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
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Category form ────────────────────────────────────────────────────────────

function CategoryForm({
  initial, onSave, onClose,
}: {
  initial?: ApiCategory;
  onSave: (c: ApiCategory) => void;
  onClose: () => void;
}) {
  const [name,        setName]        = useState(initial?.name ?? "");
  const [slug,        setSlug]        = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image,       setImage]       = useState(initial?.imageUrl ?? initial?.image ?? "");
  const [busy,        setBusy]        = useState(false);

  function handleName(v: string) {
    setName(v);
    if (!initial)
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    setBusy(true);
    try {
      let result: ApiCategory;
      if (initial) {
        const payload: UpdateCategoryPayload = {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          imageUrl: image.trim() || undefined,
        };
        result = await adminService.updateCategory(initial.id, payload);
        toast.success("Category updated.");
      } else {
        const payload: CreateCategoryPayload = {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          imageUrl: image.trim() || undefined,
        };
        result = await adminService.createCategory(payload);
        toast.success("Category created.");
      }
      onSave(result);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => handleName(e.target.value)}
          placeholder="e.g. Gaming"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. gaming"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-desc">Description (optional)</Label>
        <Input
          id="cat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description…"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-img">Image URL (optional)</Label>
        <Input
          id="cat-img"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://…"
        />
        {/* Live preview */}
        {image.trim() && (
          <div className="mt-2 flex items-center gap-3 rounded-xl border bg-muted/40 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.trim()}
              alt="Preview"
              className="size-14 rounded-lg border object-cover shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <p className="text-xs text-muted-foreground break-all line-clamp-2">{image.trim()}</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : initial ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

// ─── Confirm delete ───────────────────────────────────────────────────────────

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

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow({
  category, onEdit, onDelete,
}: {
  category: ApiCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group border-b last:border-0 hover:bg-muted/30 transition-colors">
      {/* Icon + name */}
      <td className="py-3 pl-5 pr-3">
        <div className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10">
            <Tag className="size-3.5 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-sm leading-tight">{category.name}</p>
            {category.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Slug */}
      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
        {category.slug}
      </td>

      {/* Image */}
      <td className="py-3 px-3">
        {(category.imageUrl ?? category.image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.imageUrl ?? category.image}
            alt={category.name}
            className="size-10 rounded-lg object-cover border shadow-sm"
          />
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 px-3">
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
          category.isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-muted text-muted-foreground"
        )}>
          {category.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 pl-2 pr-5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            aria-label="Edit category"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Delete category"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [addOpen,    setAddOpen]    = useState(false);
  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null);
  const [delTarget,  setDelTarget]  = useState<ApiCategory | null>(null);

  // Load categories from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminService.listCategories()
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load categories."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshKey]);

  // Search filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, search]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Layers className="mb-3 size-10 text-muted-foreground" />
        <p className="font-semibold">Failed to load categories</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => setRefreshKey((k) => k + 1)} className="mt-4" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${categories.length} categories`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" /> Add category
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="h-10 pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Layers className="mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">
              {search ? `No results for "${search}"` : "No categories yet"}
            </p>
            {!search && (
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first category to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 pl-5 pr-3">Category</th>
                  <th className="py-3 px-3">Slug</th>
                  <th className="py-3 px-3">Image</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 pl-2 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    onEdit={() => setEditTarget(cat)}
                    onDelete={() => setDelTarget(cat)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <>
            <Separator />
            <p className="px-5 py-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {categories.length} categories
            </p>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {addOpen && (
        <Modal title="Add category" onClose={() => setAddOpen(false)}>
          <CategoryForm
            onSave={(c) => { setCategories((prev) => [c, ...prev]); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit category" onClose={() => setEditTarget(null)}>
          <CategoryForm
            initial={editTarget}
            onSave={(c) => {
              setCategories((prev) => prev.map((x) => (x.id === c.id ? c : x)));
              setEditTarget(null);
            }}
            onClose={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {delTarget && (
        <Modal title="Delete category" onClose={() => setDelTarget(null)}>
          <ConfirmDelete
            label={delTarget.name}
            onClose={() => setDelTarget(null)}
            onConfirm={async () => {
              await adminService.deleteCategory(delTarget.id);
              toast.success(`"${delTarget.name}" deleted.`);
              setCategories((prev) => prev.filter((c) => c.id !== delTarget.id));
              setDelTarget(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
