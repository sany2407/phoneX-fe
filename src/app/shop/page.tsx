import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { SortSelect, TypeTabs } from "@/components/shop/catalog-controls";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shop/empty-state";
import { parseCatalogQuery, PAGE_SIZE } from "@/lib/catalog-query";
import { getSkins } from "@/lib/api";

export const metadata: Metadata = {
  title: "Shop All Skins — Phone & Laptop Skins",
  description:
    "Browse hundreds of precision-cut phone and laptop skins. Filter by design category, material, finish, price and rating.",
  alternates: { canonical: "/shop" },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = parseCatalogQuery(sp);
  const all = getSkins({
    deviceType: query.type,
    categoryIds: query.categories,
    materials: query.materials,
    finishes: query.finishes,
    maxPrice: query.maxPrice,
    minRating: query.rating,
    inStockOnly: query.stock,
    sort: query.sort,
  });
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const skins = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            {all.length} {all.length === 1 ? "design" : "designs"}
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
            <FilterSidebar deviceType={query.type} />
          </Suspense>
        </aside>

        <section aria-label="Products">
          {skins.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No skins match these filters"
              description="Try removing a filter or two — or design exactly what you want in the studio."
              actionLabel="Open Custom Studio"
              actionHref="/customize"
            />
          ) : (
            <>
              <ProductGrid skins={skins} deviceType={query.type} />
              {pages > 1 && (
                <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={qs({ page: String(page - 1) })}
                      rel="prev"
                      className="press rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Previous
                    </Link>
                  )}
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {page} of {pages}
                  </span>
                  {page < pages && (
                    <Link
                      href={qs({ page: String(page + 1) })}
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
