"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { DeviceCard } from "@/components/device/device-card";
import { Input } from "@/components/ui/input";
import type {
  ApiAvailableCategory,
  ApiBrand,
  ApiDeviceModel,
} from "@/lib/api-types";
import { cn } from "@/lib/utils";

/** A model paired with the brand it belongs to (resolved on the server). */
export type DeviceModelItem = { model: ApiDeviceModel; brand: ApiBrand };

/** Models per page. */
export const MODELS_PER_PAGE = 20;

type Props = {
  items: DeviceModelItem[];
  /** Categories that have skins on these devices; omit to hide the row. */
  categories?: ApiAvailableCategory[];
  /** Brand pages group by device type; category pages are already one type. */
  groupByType?: boolean;
};

const chipBase = "press inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
const chipIdle = cn(chipBase, "bg-card hover:bg-muted/60");
const chipActive = cn(
  chipBase,
  "border-transparent bg-primary text-primary-foreground"
);
const chipDisabled = cn(chipBase, "cursor-not-allowed bg-card text-muted-foreground opacity-50");

type Chip = { key: string; label: string; count: number; active: boolean };

function ChipRow({
  label,
  chips,
  onSelect,
  onClear,
}: {
  label: string;
  chips: Chip[];
  onSelect: (key: string) => void;
  onClear?: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <li key={c.key}>
            {c.count === 0 && !c.active ? (
              <span className={chipDisabled}>{c.label}</span>
            ) : (
              <button
                type="button"
                aria-pressed={c.active}
                onClick={() => (c.active ? onClear?.() : onSelect(c.key))}
                className={c.active ? chipActive : chipIdle}
              >
                {c.label}
                <span
                  className={cn(
                    "text-xs",
                    c.active ? "opacity-70" : "text-muted-foreground"
                  )}
                >
                  {c.count}
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Grid({ items }: { items: DeviceModelItem[] }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ model, brand }) => (
        <li key={model.id}>
          <DeviceCard brand={brand} model={model} />
        </li>
      ))}
    </ul>
  );
}

export function DeviceModelGrid({
  items,
  categories,
  groupByType = false,
}: Props) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const matchesQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (item: DeviceModelItem) =>
      !q ||
      item.model.name.toLowerCase().includes(q) ||
      item.brand.name.toLowerCase().includes(q);
  }, [query]);

  // O(1) "does this category cover this model" lookups.
  const coverage = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, new Set(c.modelIds)])),
    [categories]
  );

  /** Chip scopes exclude the chip's own dimension, so counts stay truthful. */
  const brandScoped = useMemo(
    () => items.filter((i) => !brandSlug || i.brand.slug === brandSlug),
    [items, brandSlug]
  );
  const queryScoped = useMemo(
    () => brandScoped.filter(matchesQuery),
    [brandScoped, matchesQuery]
  );

  const activeCategorySet = categoryId ? coverage.get(categoryId) : undefined;

  const categoryChips = useMemo(
    () =>
      (categories ?? []).map<Chip>((c) => {
        const set = coverage.get(c.id) ?? new Set<string>();
        let count = 0;
        for (const i of queryScoped) if (set.has(i.model.id)) count++;
        return { key: c.id, label: c.name, count, active: c.id === categoryId };
      }),
    [categories, coverage, queryScoped, categoryId]
  );

  const brandOptions = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const i of items) {
      const entry = map.get(i.brand.slug) ?? { name: i.brand.name, count: 0 };
      if (!map.has(i.brand.slug)) map.set(i.brand.slug, entry);
      if (!activeCategorySet || activeCategorySet.has(i.model.id)) {
        if (matchesQuery(i)) entry.count++;
      }
    }
    return [...map.entries()]
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map<Chip>(([slug, { name, count }]) => ({
        key: slug,
        label: name,
        count,
        active: slug === brandSlug,
      }));
  }, [items, activeCategorySet, matchesQuery, brandSlug]);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (brandSlug && i.brand.slug !== brandSlug) return false;
        if (!matchesQuery(i)) return false;
        if (categoryId && !(activeCategorySet?.has(i.model.id) ?? false)) return false;
        return true;
      }),
    [items, brandSlug, matchesQuery, categoryId, activeCategorySet]
  );

  const anyFilter = Boolean(categoryId) || Boolean(brandSlug) || query.trim() !== "";
  const clearFilters = () => {
    setCategoryId(null);
    setBrandSlug(null);
    setQuery("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / MODELS_PER_PAGE));
  // Clamp so changing a filter can never point past the last page.
  const current = Math.min(page, totalPages);
  const start = (current - 1) * MODELS_PER_PAGE;
  const visible = filtered.slice(start, start + MODELS_PER_PAGE);

  const goTo = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group the visible slice only — a device type can continue onto the next
  // page, which keeps the grouping honest rather than repeating headings.
  const groupsList = new Map<string, DeviceModelItem[]>();
  if (groupByType) {
    for (const i of visible) {
      const key = i.model.deviceType?.name ?? "Other";
      const list = groupsList.get(key) ?? [];
      list.push(i);
      groupsList.set(key, list);
    }
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="mt-8 space-y-4 rounded-xl border bg-card p-4 sm:p-5">
          {categories && categories.length > 0 && (
            <ChipRow
              label="Design category"
              chips={categoryChips}
              onSelect={(key) => {
                setCategoryId(key);
                setPage(1);
              }}
              onClear={() => {
                setCategoryId(null);
                setPage(1);
              }}
            />
          )}

          {brandOptions.length > 1 && (
            <ChipRow
              label="Brand"
              chips={brandOptions}
              onSelect={(key) => {
                setBrandSlug(key);
                setPage(1);
              }}
              onClear={() => {
                setBrandSlug(null);
                setPage(1);
              }}
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search models — e.g. iPhone 15 Pro"
                aria-label="Search models"
                className="h-10 rounded-lg border bg-background pl-9 text-sm"
              />
            </div>

            {anyFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="press inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-card px-4 py-6 sm:px-6">
          <p className="text-sm text-muted-foreground">
            No models match these filters.
          </p>
          {anyFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="press mt-2 text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : groupByType ? (
        [...groupsList.entries()].map(([typeName, list]) => (
          <section key={typeName} aria-label={typeName} className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">{typeName}s</h2>
            <Grid items={list} />
          </section>
        ))
      ) : (
        <Grid items={visible} />
      )}

      {filtered.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-12 flex flex-col items-center gap-3"
        >
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {start + 1}–{Math.min(start + MODELS_PER_PAGE, filtered.length)}
            </span>{" "}
            of {filtered.length} models
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current === 1}
              className={cn(
                "press inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium",
                current === 1 ? "cursor-not-allowed opacity-40" : "hover:bg-muted"
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </button>

            <span className="px-2 text-sm text-muted-foreground">
              Page {current} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goTo(current + 1)}
              disabled={current === totalPages}
              className={cn(
                "press inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium",
                current === totalPages
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-muted"
              )}
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
