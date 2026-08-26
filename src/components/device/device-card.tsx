import Link from "next/link";
import { fromPriceForModel, getDeviceHero, getSkinsForModel, brandOf } from "@/lib/api";
import type { DeviceModel } from "@/lib/types";
import { DeviceFrame } from "@/components/artwork/device-frame";
import { DevicePhoto } from "@/components/device/device-photo";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DeviceCard({
  model,
  className,
}: {
  model: DeviceModel;
  className?: string;
}) {
  const topSkin = getSkinsForModel(model, { sort: "featured", limit: 1 })[0];
  const brand = brandOf(model);
  const fromPrice = fromPriceForModel(model);
  const hero = getDeviceHero(brand.slug, model.slug);

  return (
    <Link
      href={`/devices/${brand.slug}/${model.slug}`}
      aria-label={`${brand.name} ${model.name} skins and wraps`}
      className={cn("group block", className)}
    >
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden rounded-xl border bg-card",
          "transition-shadow duration-300 ease-out group-hover:shadow-card-hover",
          hero
            ? "aspect-square"
            : model.type === "phone"
              ? "aspect-square p-8"
              : "aspect-4/3 p-6"
        )}
      >
        {hero ? (
          <DevicePhoto
            src={hero.src}
            alt={`${brand.name} ${model.name} skins and wraps`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="p-5"
          />
        ) : topSkin ? (
          <DeviceFrame
            type={model.type}
            colors={topSkin.colors}
            pattern={topSkin.pattern}
            brand={brand.id}
            className={model.type === "phone" ? "h-[88%]" : "w-full"}
          />
        ) : null}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{brand.name}</p>
      <h3 className="mt-0.5 font-medium tracking-tight group-hover:underline">
        {model.name} Skins &amp; Wraps
      </h3>
      {fromPrice > 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">
          From {formatINR(fromPrice)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
      )}
    </Link>
  );
}
