import Link from "next/link";
import type { DeviceType, Skin } from "@/lib/types";
import {
  categoryById,
  discountedPrice,
  finalPrice,
  getModel,
  getSkinDesignImage,
} from "@/lib/api";
import { DeviceFrame } from "@/components/artwork/device-frame";
import { DevicePhoto } from "@/components/device/device-photo";
import { Price } from "@/components/shop/price";
import { StarRating } from "@/components/shop/star-rating";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { cn } from "@/lib/utils";

export function ProductCard({
  skin,
  deviceType,
  className,
}: {
  skin: Skin;
  deviceType?: DeviceType;
  className?: string;
}) {
  const type: DeviceType =
    deviceType ?? (skin.deviceTypes.length === 1 ? skin.deviceTypes[0] : "phone");
  const cat      = categoryById(skin.categoryId);
  const photo    = getSkinDesignImage(skin);
  const modelSlug  = skin.models?.[0];
  const brandSlug  = skin.brands[0];
  const model =
    modelSlug && brandSlug && brandSlug !== "*"
      ? getModel(brandSlug, modelSlug)
      : undefined;
  const href =
    model && brandSlug
      ? `/devices/${brandSlug}/${model.slug}`
      : `/products/${skin.slug}`;

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={href}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        aria-label={`${skin.name} — ${cat?.name} skin`}
      >
        {/* ── Image panel ── */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "glass shadow-glass transition-all duration-300 ease-out",
            "group-hover:shadow-glass-hover group-hover:-translate-y-1",
            photo ? "bg-[#f6e8e8]/80" : "bg-secondary/60"
          )}
        >
          {/* top highlight edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
          />

          {/* badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {skin.discountPct > 0 && (
              <span className="rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                −{skin.discountPct}%
              </span>
            )}
            {skin.isNew && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                New
              </span>
            )}
          </div>

          {photo ? (
            <div className="relative aspect-square">
              <DevicePhoto
                src={photo}
                alt={`${skin.name} skin`}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="p-4 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
          ) : (
            <div
              className={cn(
                "grid place-items-center p-6",
                "transition-transform duration-500 ease-out group-hover:scale-[1.04]",
                type === "phone" ? "aspect-[4/5]" : "aspect-[4/3]"
              )}
            >
              <DeviceFrame
                type={type}
                colors={skin.colors}
                pattern={skin.pattern}
                className={type === "phone" ? "h-[92%]" : "w-full"}
              />
            </div>
          )}

          {/* category chip — slides up on hover */}
          <span
            className={cn(
              "absolute bottom-3 left-3 z-10",
              "rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-foreground/80",
              "backdrop-blur-sm shadow-sm",
              "translate-y-1 opacity-0 transition-all duration-200 ease-out",
              "group-hover:translate-y-0 group-hover:opacity-100"
            )}
          >
            {cat?.name}
          </span>
        </div>

        {/* ── Text ── */}
        <div className="pt-3.5">
          <p className="text-label-sm text-muted-foreground/80">
            {model ? `${model.name} · ${cat?.name}` : cat?.name}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] group-hover:text-primary transition-colors duration-150">
            {skin.name}
          </h3>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground/70">
            {skin.material.replace("-", " ")} · {skin.finish}
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <Price
              price={discountedPrice(skin, type)}
              original={skin.discountPct > 0 ? finalPrice(skin, type) : undefined}
            />
            <StarRating rating={skin.rating} />
          </div>
        </div>
      </Link>

      {/* Wishlist — sibling of link so it intercepts the click */}
      <WishlistButton
        slug={skin.slug}
        name={skin.name}
        className="absolute right-3 top-3 z-10"
      />
    </article>
  );
}
