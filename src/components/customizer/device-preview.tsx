"use client";

import { useState } from "react";
import type { DeviceType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Renders the customer's uploaded artwork on the back panel of their device.
 * Camera islands / punch-holes are drawn on top so the preview matches how
 * the printed skin will actually look.
 */
export function CustomDevicePreview({
  deviceType,
  brand,
  imageSrc,
  className,
}: {
  deviceType: DeviceType;
  brand: string;
  imageSrc?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const apple = brand === "apple";

  if (deviceType === "laptop") {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative aspect-[16/10.4] overflow-hidden rounded-[1.1rem] border border-zinc-700/60 bg-zinc-900 p-[2.5%] shadow-[0_24px_48px_-16px_rgba(25,27,37,0.35)]">
          <div className="relative h-full w-full overflow-hidden rounded-[0.55rem] bg-secondary">
            {imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Your custom skin design"
                onLoad={() => setLoaded(true)}
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-300",
                  loaded ? "opacity-100" : "opacity-0"
                )}
              />
            )}
            {apple && (
              <span className="absolute left-1/2 top-1/2 size-[12%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/20 backdrop-blur-[1px]" />
            )}
          </div>
        </div>
        <div className="mx-auto h-[4.5%] min-h-[7px] w-[112%] -translate-y-px rounded-b-xl border border-t-0 border-zinc-700/60 bg-gradient-to-b from-zinc-800 to-zinc-900" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-[9/19] w-full overflow-hidden rounded-[2rem] border border-zinc-700/60 bg-zinc-900 shadow-[0_24px_48px_-16px_rgba(25,27,37,0.35)]",
        className
      )}
    >
      {/* side buttons */}
      <div className="absolute -left-px top-[18%] h-[6%] w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -left-px top-[27%] h-[9%] w-[3px] rounded-l bg-zinc-700" />
      <div className="absolute -right-px top-[22%] h-[10%] w-[3px] rounded-r bg-zinc-700" />

      {/* back panel = uploaded artwork */}
      <div className="absolute inset-[5%] overflow-hidden rounded-[1.7rem] bg-secondary">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt="Your custom skin design"
            onLoad={() => setLoaded(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : null}
      </div>

      {/* camera cutouts */}
      {apple ? (
        <div className="absolute left-[8.5%] top-[4.5%] grid aspect-square w-[26%] grid-cols-2 place-items-center gap-[12%] rounded-[28%] bg-zinc-900/90 p-[7%]">
          <span className="block aspect-square w-full rounded-full bg-zinc-800 ring-2 ring-zinc-600" />
          <span className="block aspect-square w-full rounded-full bg-zinc-800 ring-2 ring-zinc-600" />
          <span className="block aspect-square w-full rounded-full bg-zinc-800 ring-2 ring-zinc-600" />
        </div>
      ) : (
        <div className="absolute left-1/2 top-[4%] aspect-square w-[9%] -translate-x-1/2 rounded-full bg-black/85 ring-2 ring-zinc-600" />
      )}
    </div>
  );
}
