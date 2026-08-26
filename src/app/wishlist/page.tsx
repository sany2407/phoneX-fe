"use client";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState } from "@/components/shop/empty-state";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { getSkinBySlug } from "@/lib/api";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);

  const skins = slugs
    .map((slug) => getSkinBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Wishlist</h1>
      <p className="mt-1 text-muted-foreground" aria-live="polite">
        {skins.length} saved {skins.length === 1 ? "design" : "designs"}
      </p>

      {!hydrated ? (
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : skins.length === 0 ? (
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
          {skins.map((skin) => (
            <ProductCard key={skin.id} skin={skin} />
          ))}
        </div>
      )}
    </div>
  );
}
