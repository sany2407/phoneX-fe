"use client";

import { useState } from "react";
import { DeviceFrame, LaptopFrame, PhoneFrame } from "@/components/artwork/device-frame";
import { DevicePhoto } from "@/components/device/device-photo";
import type { DeviceType, PatternId } from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "front" | "detail" | "flat";

export function ProductGallery({
  colors,
  pattern,
  deviceType,
  brand,
  photoSrc,
}: {
  colors: [string, string];
  pattern: PatternId;
  deviceType: DeviceType;
  brand: string;
  photoSrc?: string;
}) {
  const [view, setView] = useState<View>("front");
  const VIEWS: [View, string][] = [
    ["front", "On device"],
    ["detail", "Close-up"],
    ["flat", "Artwork"],
  ];

  return (
    <div>
      <div
        className={cn(
          "relative grid aspect-[4/5] place-items-center overflow-hidden rounded-xl border p-8",
          photoSrc && view === "front" ? "bg-[#f6e8e8] p-0" : "bg-secondary/70"
        )}
      >
        {view === "front" && photoSrc ? (
          <DevicePhoto
            src={photoSrc}
            alt=""
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="p-8"
          />
        ) : view === "front" ? (
          <DeviceFrame type={deviceType} colors={colors} pattern={pattern} brand={brand} className="h-full" />
        ) : null}
        {view === "detail" && (
          <div className="h-full w-full overflow-hidden rounded-lg border border-zinc-700/40 shadow-inner">
            <div className="h-[200%] w-[200%] -translate-x-[30%] -translate-y-[25%]">
              <DeviceFrame type={deviceType === "phone" ? "phone" : "laptop"} colors={colors} pattern={pattern} brand={brand} />
            </div>
          </div>
        )}
        {view === "flat" && (
          <div className="h-full w-full overflow-hidden rounded-lg shadow-card-hover [&_svg]:rounded-lg">
            <DeviceFrame
              type={deviceType}
              colors={colors}
              pattern={pattern}
              brand={brand}
              className={cn("mx-auto", deviceType === "laptop" ? "w-full max-w-md" : "h-full")}
            />
          </div>
        )}
      </div>

      <div role="tablist" aria-label="Product views" className="mt-4 flex justify-center gap-2">
        {VIEWS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={cn(
              "press rounded-lg border px-4 py-2 text-sm font-medium",
              view === key
                ? "border-transparent ring-2 ring-primary"
                : "hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// re-export for potential direct frame use in this feature
export { PhoneFrame, LaptopFrame };
