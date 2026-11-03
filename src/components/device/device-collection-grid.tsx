"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Cross2Icon as X,
  LayersIcon as Layers,
  MagnifyingGlassIcon as Search,
} from "@radix-ui/react-icons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  ApiAvailableCategory,
  ApiBrand,
  ApiDeviceModel,
} from "@/lib/api-types";
import { cn } from "@/lib/utils";

/** A device model paired with the brand it belongs to (resolved on the server). */
export type DeviceLineupItem = { model: ApiDeviceModel; brand: ApiBrand };

type Props = {
  /** Every model in the current scope (a device type or a single brand). */
  items: DeviceLineupItem[];
  /** Collections that have skins on those models. `null` is not passed here —
   *  a failed fetch is rendered by the page, never as an empty collection. */
  categories: ApiAvailableCategory[];
};

const chipBase =
  "press inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
const chipIdle = cn(chipBase, "bg-card hover:bg-muted/60");
const chipActive = cn(chipBase, "border-transparent bg-primary text-primary-foreground");
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

function CollectionCard({
  category,
  modelCount,
}: {
  category: ApiAvailableCategory;
  modelCount: number;
}) {
  const countLabel = `${modelCount} ${modelCount === 1 ? "model" : "models"}`;

  return (
    <Card className="gap-0 py-0 text-base transition-shadow duration-300 ease-out hover:shadow-card-hover">
      <Link
        href={`/designs/${category.slug}`}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        aria-label={`${category.name} collection — ${countLabel}`}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary/60">
          {category.imageUrl ? (
            // Cloudinary URLs are remote — plain <img> avoids next.config allowlists.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.imageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted-foreground/40">
              <Layers className="size-10" aria-hidden="true" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
            <h3 className="font-heading text-lg font-bold tracking-tight">
              {category.name}
            </h3>
            <span className="shrink-0 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
              {modelCount} {modelCount === 1 ? "model" : "models"}
            </span>
          </div>
        </div>

        {category.description && (
          <p className="line-clamp-2 px-4 py-3 text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
      </Link>
    </Card>
  );
}

/**
 * Collection browser for the device pages.
 *
 * Skins are sold per design collection rather than per handset, so instead of
 * listing device models this shows the collections that are actually cut for
 * the current scope. Brand chips re-scope the collections to one brand, and a
 * collection only appears for a brand when it covers at least one of that
 * brand's models.
 */
export function DeviceCollectionGrid({ items, categories }: Props) {
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  /** Model → brand lookup for the current page scope, plus brand names. */
  const scope = useMemo(() => {
    const modelBrand = new Map<string, string>();
    const brands = new Map<string, string>();
    for (const { model, brand } of items) {
      modelBrand.set(model.id, brand.slug);
      brands.set(brand.slug, brand.name);
    }
    return { modelBrand, brands };
  }, [items]);

  /** Attach the brands (and in-scope model count) each collection covers. */
  const entries = useMemo(
    () =>
      categories.map((category) => {
        const brandSlugs = new Set<string>();
        let modelCount = 0;
        for (const modelId of category.modelIds) {
          const slug = scope.modelBrand.get(modelId);
          if (!slug) continue;
          brandSlugs.add(slug);
          modelCount++;
        }
        return { category, brandSlugs, modelCount };
      }),
    [categories, scope]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = useMemo(
    () => (category: ApiAvailableCategory) =>
      !normalizedQuery || category.name.toLowerCase().includes(normalizedQuery),
    [normalizedQuery]
  );

  const brandOptions = useMemo(
    () =>
      [...scope.brands.entries()]
        .sort(([, a], [, b]) => a.localeCompare(b))
        .map<Chip>(([slug, name]) => ({
          key: slug,
          label: name,
          // Scoped by search only — the brand chip's own filter is excluded so
          // every count describes what selecting that chip would show.
          count: entries.filter(
            (e) => matchesQuery(e.category) && e.brandSlugs.has(slug)
          ).length,
          active: slug === brandSlug,
        })),
    [scope.brands, entries, matchesQuery, brandSlug]
  );

  const visible = useMemo(
    () =>
      entries
        .filter(
          (e) =>
            matchesQuery(e.category) &&
            (!brandSlug || e.brandSlugs.has(brandSlug))
        )
        // Badge counts the models compatible with the active brand, not the
        // whole device type, so the number means something after filtering.
        .map((e) => ({
          ...e,
          scopedModelCount: brandSlug
            ? e.category.modelIds.reduce(
                (n, id) => n + (scope.modelBrand.get(id) === brandSlug ? 1 : 0),
                0
              )
            : e.modelCount,
        })),
    [entries, matchesQuery, brandSlug, scope.modelBrand]
  );

  const anyFilter = Boolean(brandSlug) || normalizedQuery !== "";
  const clearFilters = () => {
    setBrandSlug(null);
    setQuery("");
  };

  // Nothing to filter when the catalogue has no skins for this scope at all.
  if (entries.length === 0) {
    return (
      <Card className="mt-8 gap-0 px-4 py-6 text-base sm:px-6">
        <p className="text-sm text-muted-foreground">
          No skin collections are available for these devices yet. New
          collections land regularly — check back soon, or design your own in
          the studio.
        </p>
      </Card>
    );
  }

  const selectedBrandName = brandSlug ? scope.brands.get(brandSlug) : null;

  return (
    <div>
      <Card className="mt-8 gap-0 space-y-4 p-4 text-base sm:p-5">
        {brandOptions.length > 1 && (
          <ChipRow
            label="Brand"
            chips={brandOptions}
            onSelect={setBrandSlug}
            onClear={() => setBrandSlug(null)}
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections — e.g. Abstract"
              aria-label="Search collections"
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
      </Card>

      {visible.length === 0 ? (
        <Card className="mt-8 gap-0 px-4 py-6 text-base sm:px-6">
          <p className="text-sm text-muted-foreground">
            No collections match {selectedBrandName ? `${selectedBrandName} and ` : ""}
            this search.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="press mt-2 self-start text-sm font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        </Card>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {selectedBrandName ? `${selectedBrandName} collections` : "Skin collections"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} {visible.length === 1 ? "collection" : "collections"}
            </p>
          </div>

          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map(({ category, scopedModelCount }) => (
              <li key={category.id}>
                <CollectionCard category={category} modelCount={scopedModelCount} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
