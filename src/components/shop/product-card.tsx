import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { ApiProduct } from "@/lib/api-types";
import { priceView, primaryImage } from "@/lib/product-utils";
import { DevicePhoto } from "@/components/device/device-photo";
import { Price } from "@/components/shop/price";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
}: {
  product: ApiProduct;
  className?: string;
}) {
  const photo = primaryImage(product);
  const { price, original, discountPct } = priceView(product);
  const categoryName = product.category?.name;

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        aria-label={`${product.name} skin`}
      >
        {/* ── Image panel ── */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "glass shadow-glass transition-all duration-300 ease-out",
            "group-hover:shadow-glass-hover group-hover:-translate-y-1",
            "bg-secondary/60"
          )}
        >
          {/* top highlight edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
          />

          {/* badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {discountPct != null && discountPct > 0 && (
              <span className="rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                −{discountPct}%
              </span>
            )}
            {product.isNew && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                New
              </span>
            )}
          </div>

          {photo ? (
            <div className="relative aspect-square">
              <DevicePhoto
                src={photo}
                alt={`${product.name} skin`}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="p-4 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <div className="grid aspect-square place-items-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                <ImageOff className="size-8" aria-hidden="true" />
                <span className="max-w-[140px] text-center text-xs">
                  {product.name}
                </span>
              </div>
            </div>
          )}

          {/* category chip — slides up on hover */}
          {categoryName && (
            <span
              className={cn(
                "absolute bottom-3 left-3 z-10",
                "rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-foreground/80",
                "backdrop-blur-sm shadow-sm",
                "translate-y-1 opacity-0 transition-all duration-200 ease-out",
                "group-hover:translate-y-0 group-hover:opacity-100"
              )}
            >
              {categoryName}
            </span>
          )}
        </div>

        {/* ── Text ── */}
        <div className="pt-3.5">
          {categoryName && (
            <p className="text-label-sm text-muted-foreground/80">
              {categoryName}
            </p>
          )}
          <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] group-hover:text-primary transition-colors duration-150">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground/70">
            {product.material.replace("-", " ")} · {product.finish}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            {price != null ? (
              <Price price={price} original={original} />
            ) : (
              <span className="text-xs text-muted-foreground">See details</span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist — sibling of link so it intercepts the click */}
      <WishlistButton
        slug={product.slug}
        name={product.name}
        className="absolute right-3 top-3 z-10"
      />
    </article>
  );
}
