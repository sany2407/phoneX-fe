import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { ApiBrand, ApiDeviceModel } from "@/lib/api-types";
import { DevicePhoto } from "@/components/device/device-photo";
import { cn } from "@/lib/utils";

export function DeviceCard({
  brand,
  model,
  className,
}: {
  brand: ApiBrand;
  model: ApiDeviceModel;
  className?: string;
}) {
  const typeName = model.deviceType?.name;

  return (
    <Link
      href={`/devices/${brand.slug}/${model.slug}`}
      aria-label={`${brand.name} ${model.name} skins and wraps`}
      className={cn("group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring", className)}
    >
      {/* ── Image panel ── */}
      <div
        className={cn(
          "relative grid aspect-square place-items-center overflow-hidden rounded-2xl",
          "glass shadow-glass transition-all duration-300 ease-out",
          "group-hover:shadow-glass-hover group-hover:-translate-y-1"
        )}
      >
        {/* subtle top-edge highlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />

        {model.imageUrl ? (
          <DevicePhoto
            src={model.imageUrl}
            alt={`${brand.name} ${model.name}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="p-5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground/50">
            <ImageOff className="size-8" aria-hidden="true" />
            <span className="text-xs font-medium">
              {brand.name} {model.name}
            </span>
          </div>
        )}

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
          Browse Skins
        </span>
      </div>

      {/* ── Text ── */}
      <div className="mt-3 px-0.5">
        <p className="text-label-sm text-muted-foreground/80">{brand.name}</p>
        <h3 className="mt-0.5 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground group-hover:text-primary transition-colors duration-150">
          {model.name}
        </h3>
        {typeName ? (
          <p className="mt-1 text-xs text-muted-foreground">{typeName}</p>
        ) : null}
      </div>
    </Link>
  );
}
