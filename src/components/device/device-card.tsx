import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ApiBrand, ApiDeviceModel } from "@/lib/api-types";
import { DevicePhoto } from "@/components/device/device-photo";
import { cn } from "@/lib/utils";

/** Two letters that identify a brand without needing artwork. */
function monogram(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * Device entry for catalogue grids.
 *
 * Most device models have no photo, so the card leads with a brand monogram
 * instead of an empty image panel. Models that do have a photo keep a compact
 * thumbnail in its place.
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
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg sm:size-10",
            "bg-primary/[0.06] text-[11px] font-semibold tracking-wide text-primary sm:text-[13px]",
            "ring-1 ring-primary/10 ring-inset"
          )}
        >
          {model.imageUrl ? (
            <DevicePhoto
              src={model.imageUrl}
              alt=""
              sizes="(min-width: 640px) 40px, 32px"
              className="size-full object-cover"
            />
          ) : (
            monogram(brand.name)
          )}
        </span>

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
