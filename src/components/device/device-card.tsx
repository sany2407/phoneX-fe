import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ApiBrand, ApiDeviceModel } from "@/lib/api-types";
import { DevicePhoto } from "@/components/device/device-photo";
import { BrandLogo } from "@/components/device/brand-logo";
import { cn } from "@/lib/utils";

/**
 * Device entry for catalogue grids.
 *
 * Leads with the brand logo (or its monogram when no logo has been uploaded)
 * instead of an empty image panel, since device models rarely have photos.
 * Models that do have a photo show a small thumbnail in its place.
 */
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
      className={cn(
        "group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 sm:gap-3 sm:px-3.5 sm:py-3",
          "transition-all duration-200 ease-out",
          "group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:shadow-card-hover"
        )}
      >
        {brand.logoUrl ? (
          <BrandLogo
            name={brand.name}
            src={brand.logoUrl}
            className="size-8 rounded-lg bg-white ring-1 ring-black/5 sm:size-10"
            imageClassName="p-1"
          />
        ) : model.imageUrl ? (
          <span
            aria-hidden="true"
            className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-muted/40 ring-1 ring-black/5 sm:size-10"
          >
            <DevicePhoto
              src={model.imageUrl}
              alt=""
              sizes="(min-width: 640px) 40px, 32px"
              className="p-1"
            />
          </span>
        ) : (
          <BrandLogo
            name={brand.name}
            className="size-8 rounded-lg bg-primary/[0.06] text-[11px] font-semibold tracking-wide text-primary ring-1 ring-primary/10 ring-inset sm:size-10 sm:text-[13px]"
          />
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {brand.name}
            {typeName && (
              <span className="hidden sm:inline"> · {typeName}</span>
            )}
          </span>
          <span
            title={model.name}
            className="mt-0.5 block truncate text-[13px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary sm:text-sm"
          >
            {model.name}
          </span>
        </span>

        <ArrowRightIcon
          aria-hidden="true"
          className="hidden size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
        />
      </div>
    </Link>
  );
}
