import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  const topSkin   = getSkinsForModel(model, { sort: "featured", limit: 1 })[0];
  const brand     = brandOf(model);
  const fromPrice = fromPriceForModel(model);
  const hero      = getDeviceHero(brand.slug, model.slug);

  return (
    <Link
      href={`/devices/${brand.slug}/${model.slug}`}
      aria-label={`${brand.name} ${model.name} skins and wraps`}
      className={cn("group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring", className)}
    >
      {/* ── Image panel ── */}
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden rounded-2xl",
          "glass shadow-glass transition-all duration-300 ease-out",
          "group-hover:shadow-glass-hover group-hover:-translate-y-1",
          hero
            ? "aspect-square"
            : model.type === "phone"
              ? "aspect-square p-8"
              : "aspect-4/3 p-6"
        )}
      >
        {/* subtle top-edge highlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />

        {hero ? (
          <DevicePhoto
            src={hero.src}
            alt={`${brand.name} ${model.name}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : topSkin ? (
          <DeviceFrame
            type={model.type}
            colors={topSkin.colors}
            pattern={topSkin.pattern}
            brand={brand.id}
            className={cn(
              "transition-transform duration-500 ease-out group-hover:scale-[1.04]",
              model.type === "phone" ? "h-[88%]" : "w-full"
            )}
          />
        ) : null}

        {/* hover CTA chip */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0",
            "flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5",
            "text-[11px] font-semibold text-white shadow-md",
            "transition-all duration-200 ease-out",
            "group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          Browse Skins <ArrowRight className="size-3" />
        </span>
      </div>

      {/* ── Text ── */}
      <div className="mt-3 px-0.5">
        <p className="text-label-sm text-muted-foreground/80">{brand.name}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground group-hover:text-primary transition-colors duration-150">
          {model.name}
        </h3>
        {fromPrice > 0 ? (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            From{" "}
            <span className="font-semibold text-foreground">{formatINR(fromPrice)}</span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
        )}
      </div>
    </Link>
  );
}
