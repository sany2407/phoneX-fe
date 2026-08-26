import Link from "next/link";
import type { DeviceType, Skin } from "@/lib/types";
import { categoryById, discountedPrice, finalPrice, getModel, getSkinDesignImage } from "@/lib/api";
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
  const cat = categoryById(skin.categoryId);
  const photo = getSkinDesignImage(skin);
  const modelSlug = skin.models?.[0];
  const brandSlug = skin.brands[0];
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
        className="block focus-visible:outline-2 focus-visible:outline-offset-4"
        aria-label={`${skin.name} — ${cat?.name} skin`}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border",
            photo ? "bg-[#f6e8e8]" : "bg-secondary/60",
            "transition-shadow duration-300 ease-out group-hover:shadow-card-hover"
          )}
        >
          {/* badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {skin.discountPct > 0 && (
              <span className="rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white">
                −{skin.discountPct}%
              </span>
            )}
            {skin.isNew && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                New
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute right-3 top-3 z-10">
            <WishlistButton slug={skin.slug} name={skin.name} />
          </div>

          {photo ? (
            <div className="relative aspect-square transition-transform duration-300 ease-out group-hover:scale-[1.02]">
              <DevicePhoto
                src={photo}
                alt={`${skin.name} skin`}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="p-4"
              />
            </div>
          ) : (
            <div
              className={cn(
                "grid place-items-center p-6 transition-transform duration-300 ease-out group-hover:scale-[1.02]",
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
        </div>

        <div className="pt-4">
          <p className="text-label-sm text-muted-foreground">
            {model ? `${model.name} · ${cat?.name}` : cat?.name}
          </p>
          <h3 className="mt-1 truncate font-medium tracking-tight">{skin.name}</h3>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {skin.material.replace("-", " ")} · {skin.finish}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Price
              price={discountedPrice(skin, type)}
              original={
                skin.discountPct > 0 ? finalPrice(skin, type) : undefined
              }
            />
            <StarRating rating={skin.rating} />
          </div>
        </div>
      </Link>
    </article>
  );
}
