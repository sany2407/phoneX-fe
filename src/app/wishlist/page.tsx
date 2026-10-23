"use client";

import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState } from "@/components/shop/empty-state";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { productsService } from "@/lib/services/products.service";
import type { ApiProduct } from "@/lib/api-types";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  const [products, setProducts] = useState<ApiProduct[] | null>(null);

  // Resolve saved slugs against the live catalogue — removed products
  // simply disappear instead of showing stale mock cards.
  useEffect(() => {
    if (!hydrated) return;
    if (slugs.length === 0) { setProducts([]); return; }
    let cancelled = false;
    setProducts(null);
    Promise.all(
      slugs.map((slug) =>
        productsService.getBySlug(slug).catch(() => null)
      )
    ).then((res) => {
      if (cancelled) return;
      setProducts(res.filter((p): p is ApiProduct => p !== null));
    });
    return () => { cancelled = true; };
  }, [hydrated, slugs.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Wishlist</h1>
      <p className="mt-1 text-muted-foreground" aria-live="polite">
        {products ? (
          <>{products.length} saved {products.length === 1 ? "design" : "designs"}</>
        ) : (
          "Loading saved designs…"
        )}
      </p>

      {!hydrated || products === null ? (
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any design to keep it here for later."
            actionLabel="Discover designs"
            actionHref="/designs"
          />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
