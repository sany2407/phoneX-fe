import type { DeviceType, PatternId } from "@/lib/types";
import { SkinArt } from "@/components/artwork/skin-art";
import { cn } from "@/lib/utils";

/** Phone silhouette with the skin artwork as its "back panel". */
export function PhoneFrame({
  colors,
  pattern,
  brand = "apple",
  className,
  showCamera = true,
}: {
  colors: [string, string];
  pattern: PatternId;
  brand?: string;
  className?: string;
  showCamera?: boolean;
}) {
  const apple = brand === "apple";
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
      {/* screen/back panel */}
      <div className="absolute inset-[5%] overflow-hidden rounded-[1.7rem]">
        <SkinArt pattern={pattern} colors={colors} />
      </div>
      {showCamera &&
        (apple ? (
          <div className="absolute left-[8.5%] top-[4.5%] grid aspect-square w-[26%] grid-cols-2 place-items-center gap-[12%] rounded-[28%] bg-zinc-900/90 p-[7%]">
            <span className="block aspect-square w-full rounded-full bg-zinc-800 ring-2 ring-zinc-600" />
            <span className="block aspect-square w-full rounded-full bg-zinc-800 ring-2 ring-zinc-600" />
            <span className="block aspect-square w-full rounded-full bg-zinc-800 ring-2 ring-zinc-600" />
          </div>
        ) : (
          <div className="absolute left-1/2 top-[4%] aspect-square w-[9%] -translate-x-1/2 rounded-full bg-black/85 ring-2 ring-zinc-600" />
        ))}
    </div>
  );
}

/** Laptop lid with skin artwork + hint of the base. */
export function LaptopFrame({
  colors,
  pattern,
  brand = "apple",
  className,
}: {
  colors: [string, string];
  pattern: PatternId;
  brand?: string;
  className?: string;
}) {
  const apple = brand === "apple";
  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative aspect-[16/10.4] overflow-hidden rounded-[1.1rem] border border-zinc-700/60 bg-zinc-900 p-[2.5%] shadow-[0_24px_48px_-16px_rgba(25,27,37,0.35)]">
        <div className="h-full w-full overflow-hidden rounded-[0.55rem]">
          <SkinArt pattern={pattern} colors={colors} />
        </div>
        {apple && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="block size-[13%] rounded-full bg-white/25 backdrop-blur-[2px]" />
          </div>
        )}
      </div>
      {/* base */}
      <div className="mx-auto h-[4.5%] min-h-[7px] w-[112%] -translate-y-px rounded-b-xl border border-t-0 border-zinc-700/60 bg-gradient-to-b from-zinc-800 to-zinc-900">
        <div className={cn("mx-auto h-[3px] w-[14%] rounded-b bg-zinc-700/80", apple && "bg-zinc-600/70")} />
      </div>
    </div>
  );
}

/** Picks the right frame for a device type. */
export function DeviceFrame({
  type,
  colors,
  pattern,
  brand,
  className,
}: {
  type: DeviceType;
  colors: [string, string];
  pattern: PatternId;
  brand?: string;
  className?: string;
}) {
  return type === "phone" ? (
    <PhoneFrame colors={colors} pattern={pattern} brand={brand} className={className} />
  ) : (
    <LaptopFrame colors={colors} pattern={pattern} brand={brand} className={className} />
  );
}
