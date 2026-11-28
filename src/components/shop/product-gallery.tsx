"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { DevicePhoto } from "@/components/device/device-photo";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  // Guard against an out-of-range index when the image set changes.
  const safeActive = active < images.length ? active : 0;
  const current = images[safeActive];

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl border bg-secondary/60">
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <ImageOff className="size-10" aria-hidden="true" />
          <span className="max-w-[200px] text-center text-sm">
            Photos coming soon for {name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl glass shadow-glass bg-secondary/60">
        <div className="relative aspect-square">
          <DevicePhoto
            key={current}
            src={current}
            alt={`${name} skin`}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="p-6"
          />
        </div>
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2.5">
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View photo ${i + 1}`}
                aria-pressed={safeActive === i}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border bg-secondary/60",
                  safeActive === i
                    ? "border-transparent ring-2 ring-primary"
                    : "hover:border-transparent hover:shadow-card-hover"
                )}
              >
                <DevicePhoto src={src} alt="" sizes="20vw" className="p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
