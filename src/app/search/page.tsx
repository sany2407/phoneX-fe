"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { DeviceCard } from "@/components/device/device-card";
import { EmptyState } from "@/components/shop/empty-state";
import { productsService } from "@/lib/services/products.service";
import { useDeviceCatalog } from "@/lib/stores/device-catalog-store";
import { categoriesService } from "@/lib/services/categories.service";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);

  const brands = useDeviceCatalog((s) => s.brands);
  const models = useDeviceCatalog((s) => s.models);
  const loadCatalog = useDeviceCatalog((s) => s.load);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [skins, setSkins] = useState<ApiProduct[] | null>(null);

  useEffect(() => {
    loadCatalog();
    categoriesService
      .getAll()
      .then((items) => setCategories(items.filter((c) => c.isActive !== false)))
      .catch(() => {
        /* groups render empty below */
      });
  }, [loadCatalog]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setSkins([]); return; }
    let cancelled = false;
    setSkins(null);
    productsService
      .search(query, { limit: 12 })
      .then((res) => { if (!cancelled) setSkins(res.items); })
      .catch(() => { if (!cancelled) setSkins([]); });
    return () => { cancelled = true; };
  }, [q]);

  const query = q.trim().toLowerCase();
  const matchedModels = useMemo(() => {
    if (query.length < 2) return [];
    return models
      .filter((m) => m.name.toLowerCase().includes(query) || m.brandName.toLowerCase().includes(query))
      .slice(0, 6);
  }, [models, query]);
  const matchedBrands = useMemo(
    () => (query.length < 2 ? [] : brands.filter((b) => b.name.toLowerCase().includes(query))),
    [brands, query]
  );
  const matchedCategories = useMemo(
    () => (query.length < 2 ? [] : categories.filter((c) => c.name.toLowerCase().includes(query))),
    [categories, query]
  );

  const total =
    matchedModels.length + matchedBrands.length + matchedCategories.length + (skins?.length ?? 0);

  return (
    <>
      <form
        className="relative mt-8 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(input.trim())}`);
        }}
        role="search"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search devices, skins, brands…"
          className="h-12 pl-4 text-[15px]"
          aria-label="Search phoneX"
          autoFocus
        />
      </form>

      {!q ? (
        <p className="mt-10 text-muted-foreground">
          Type something to search — try “iPhone 15” or “anime”.
        </p>
      ) : total === 0 && skins !== null ? (
        <div className="mt-10">
          <EmptyState
            icon={SearchX}
            title={`No results for “${q}”`}
            description="Check the spelling or browse the catalogue — we probably have something close."
            actionLabel="Browse designs"
            actionHref="/designs"
          />
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          <Group title="Devices" count={matchedModels.length} hidden={matchedModels.length === 0}>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {matchedModels.map((m) => {
                const brand = brands.find((b) => b.id === m.brandId);
                if (!brand) return null;
                return (
                  <li key={m.id}>
                    <DeviceCard
                      brand={brand}
                      model={{
                        id: m.id,
                        brandId: m.brandId,
                        name: m.name,
                        slug: m.slug,
                        imageUrl: m.imageUrl,
                        isActive: true,
                        createdAt: "",
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </Group>

          <Group title="Skins" count={skins?.length ?? 0} hidden={!skins || skins.length === 0}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {(skins ?? []).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Group>

          <Group
            title="Brands & designs"
            count={matchedBrands.length + matchedCategories.length}
            hidden={matchedBrands.length + matchedCategories.length === 0}
          >
            <ul className="flex flex-wrap gap-2.5">
              {matchedBrands.map((b) => (
                <li key={b.id}>
                  <Button variant="outline" asChild>
                    <Link href={`/devices/${b.slug}`}>{b.name}</Link>
                  </Button>
                </li>
              ))}
              {matchedCategories.map((c) => (
                <li key={c.id}>
                  <Button variant="outline" asChild>
                    <Link href={`/designs/${c.slug}`}>{c.name}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </Group>
        </div>
      )}
    </>
  );
}

function Group({
  title,
  count,
  hidden,
  children,
}: {
  title: string;
  count: number;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  if (hidden) return null;
  return (
    <section aria-label={`${title} results`}>
      <h2 className="text-lg font-semibold tracking-tight">
        {title} <span className="ml-1 text-sm font-normal text-muted-foreground">{count}</span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Search</h1>
      <Suspense fallback={<div className="mt-8 h-12 max-w-xl animate-pulse rounded-lg bg-muted" />}>
        <Results />
      </Suspense>
    </div>
  );
}
