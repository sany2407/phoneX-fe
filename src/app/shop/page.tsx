import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { SortSelect, TypeTabs } from "@/components/shop/catalog-controls";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shop/empty-state";
import { parseCatalogQuery, PAGE_SIZE } from "@/lib/catalog-query";
import { productsService } from "@/lib/services/products.service";
import { categoriesService } from "@/lib/services/categories.service";
import type { ApiCategory } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Shop All Skins — Phone & Laptop Skins",
  description:
    "Browse precision-cut phone and laptop skins. Filter by design category, material, finish, price and rating.",
  alternates: { canonical: "/shop" },
};

const DEVICE_TYPE_SLUG: Record<string, string> = {
  phone: "smartphone",
  laptop: "laptop",
  tablet: "tablet",
};

async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const items = await categoriesService.getAll({ revalidate: 300 });
    return Array.isArray(items) ? items.filter((c) => c.isActive) : [];
  } catch {
    return [];
  }
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = parseCatalogQuery(sp);

  const [categories, facets] = await Promise.all([
    fetchCategories(),
    productsService.getFacets({ revalidate: 300 }).catch(() => ({ materials: [], finishes: [] })),
  ]);

  // URL carries category slugs — the API needs IDs
  const categoryIds = query.categories
    .map((slug) => categories.find((c) => c.slug === slug)?.id)
    .filter((id): id is string => Boolean(id));

  // If the user picked categories that don't exist, the result is honestly empty
  const unknownCategory = query.categories.length > 0 && categoryIds.length === 0;

  const { items: products, pagination } = unknownCategory
    ? { items: [], pagination: { items: [], total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 } }
    : await productsService
        .list(
          {
            page: query.page,
            limit: PAGE_SIZE,
            categoryId: categoryIds.join(",") || undefined,
            material: query.materials.join(",") || undefined,
            finish: query.finishes.join(",") || undefined,
            maxPrice: query.maxPrice,
            minRating: query.rating,
            inStock: query.stock || undefined,
            deviceType: query.type ? DEVICE_TYPE_SLUG[query.type] : undefined,
            sort: query.sort,
          },
          { revalidate: 60 }
        )
        .catch(() => ({
          items: [],
          pagination: { items: [], total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 },
        }));

  const visible = products;

  const qs = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string") params.set(k, v);
    }
    for (const [k, v] of Object.entries(patch)) params.set(k, v);
    return `/shop?${params.toString()}`;
  };

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex gap-1.5">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">Shop</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg">All Skins</h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            {pagination.total} {pagination.total === 1 ? "design" : "designs"}
            {query.type ? ` · ${query.type}s` : ""}
            {query.q ? ` · “${query.q}”` : ""}
          </p>
        </div>
        <Suspense fallback={null}>
          <div className="flex flex-wrap items-center gap-3">
            <TypeTabs value={query.type} />
            <SortSelect value={query.sort} />
          </div>
        </Suspense>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
            <FilterSidebar
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              materials={facets.materials}
              finishes={facets.finishes}
            />
          </Suspense>
        </aside>

        <section aria-label="Products">
          {visible.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={pagination.total === 0 ? "No skins yet" : "No skins match these filters"}
              description={
                pagination.total === 0
                  ? "New designs are on the way — check back soon or design your own in the studio."
                  : "Try removing a filter or two — or design exactly what you want in the studio."
              }
              actionLabel="Open Custom Studio"
              actionHref="/customize"
            />
          ) : (
            <>
              <ProductGrid products={visible} />
              {pagination.totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                  {pagination.page > 1 && (
                    <Link
                      href={qs({ page: String(pagination.page - 1) })}
                      rel="prev"
                      className="press rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  {pagination.page < pagination.totalPages && (
                    <Link
                      href={qs({ page: String(pagination.page + 1) })}
                      rel="next"
                      className="press rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Next
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
