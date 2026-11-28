"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import type { DeviceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * CustomDevicePreview — self-contained artwork compositor POC.
 *
 * Phone: uses /customize-case.png (back-of-case mockup, derived from
 * /customize.png: trimmed, squared to 1:1, white panel flood-filled to
 * transparent so the artwork layer shows through).
 * The user's artwork is composited into the printable panel using a
 * precisely-positioned absolutely-placed layer BEHIND the mockup image.
 *
 * Transparent interior bounds (measured from the processed asset):
 *   top:    1.9%
 *   left:   27.2%
 *   width:  45.9%
 *   height: 96.4%
 *
 * The component owns its own file picker + artwork state, so it works
 * standalone. `imageSrc` seeds the state (studio deep-links) and stays
 * in sync when the parent drives it; `onArtworkChange` notifies the
 * parent of uploads/removals so save-to-designs / add-to-cart keep
 * working in the studio.
 */
export function CustomDevicePreview({
  deviceType,
  brand,
  imageSrc,
  onArtworkChange,
  className,
}: {
  deviceType: DeviceType;
  brand: string;
  imageSrc?: string;
  onArtworkChange?: (src: string | undefined) => void;
  className?: string;
}) {
  const [artwork, setArtwork] = useState<string | undefined>(imageSrc);
  const [prevProp, setPrevProp] = useState<string | undefined>(imageSrc);
  const [imgLoaded, setImgLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stay in sync when the parent drives imageSrc (studio controls).
  // Same render-adjust pattern used across the studio.
  if (imageSrc !== prevProp) {
    setPrevProp(imageSrc);
    setArtwork(imageSrc);
    setImgLoaded(false);
  }

  function commit(src: string | undefined) {
    // Set prevProp too: onArtworkChange echoes the same value back
    // through the parent, and we must not treat that echo as external.
    setPrevProp(src);
    setArtwork(src);
    setImgLoaded(false);
    onArtworkChange?.(src);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same file twice still fires onChange.
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl =
        typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) {
        toast.error("Couldn't read that file. Try another image.");
        return;
      }
      commit(dataUrl);
      toast.success("Artwork uploaded", {
        description: "Showing on your case preview.",
      });
    };
    reader.onerror = () => {
      toast.error("Couldn't read that file. Try another image.");
    };
    reader.readAsDataURL(file);
  }

  // ── Laptop ────────────────────────────────────────────────────────────────
  if (deviceType === "laptop") {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative aspect-[16/10.4] overflow-hidden rounded-[1.1rem] border border-zinc-700/60 bg-zinc-900 p-[2.5%] shadow-[0_24px_48px_-16px_rgba(25,27,37,0.35)]">
          <div className="relative h-full w-full overflow-hidden rounded-[0.55rem] bg-muted">
            {artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={artwork}
                src={artwork}
                alt="Your custom skin design"
                onLoad={() => setImgLoaded(true)}
                className={cn(
                  "h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-300",
                  imgLoaded ? "opacity-100" : "opacity-0"
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="px-6 text-center text-sm text-muted-foreground">
                  Upload your artwork to preview it here
                </p>
              </div>
            )}
            {brand === "apple" && (
              <span className="absolute left-1/2 top-1/2 size-[12%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/20 backdrop-blur-[1px]" />
            )}
          </div>
        </div>
        <div className="mx-auto h-[4.5%] min-h-[7px] w-[112%] -translate-y-px rounded-b-xl border border-t-0 border-zinc-700/60 bg-gradient-to-b from-zinc-800 to-zinc-900" />
        <ArtworkControls
          hasArtwork={!!artwork}
          onPick={() => inputRef.current?.click()}
          onRemove={() => commit(undefined)}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          aria-label="Upload artwork file"
          onChange={handleFile}
        />
      </div>
    );
  }

  // ── Phone / Tablet — customize.png mockup ─────────────────────────────────
  // The mockup is a 1:1 square PNG showing the back of a phone case.
  // We stack two layers:
  //   1. Artwork (behind) — absolutely positioned to fill the white panel
  //   2. Mockup PNG (front) — fills the whole square, pointer-events none
  //
  // The phone case frame + camera island in the PNG naturally masks the edges
  // of the artwork, creating a realistic composite.

  return (
    <div className={cn("relative mx-auto w-full max-w-[320px]", className)}>
      {/* Square container matching the 1:1 PNG */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>

        {/* ── Layer 1: User artwork (behind mockup) ── */}
        <div
          className="absolute z-0 overflow-hidden"
          style={{
            // Transparent interior bounds of /customize-case.png, bled
            // ~1–2.5% outward on every side so the artwork tucks UNDER the
            // opaque frame. The frame masks the seam — no hairline fringe.
            // (Frame insets: top ~12px, left ~22px, right ~19px, bottom ~11px
            //  at 639px; bleed stays >=6px inside the outer edge.)
            top:    "1%",
            left:   "24.7%",
            width:  "50.2%",
            height: "97.8%",
            // Elliptical corner rounding (≈34px at asset scale) pulls the
            // bled square corners inside the frame's rounded outer edge.
            // Straight edges still bleed under the frame — no fringe.
            borderRadius: "11% / 6%",
          }}
        >
          {artwork ? (
            // Inline <img>: artwork is a data URL, next/image can't handle it.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={artwork}
              src={artwork}
              alt="Your artwork on the skin"
              onLoad={() => setImgLoaded(true)}
              className={cn(
                "h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-500",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
            />
          ) : (
            /* White placeholder matching the panel */
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-7 text-zinc-300"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <p className="px-4 text-center text-[10px] leading-tight text-zinc-400">
                Your image<br />appears here
              </p>
            </div>
          )}
        </div>

        {/* ── Layer 2: Mockup PNG on top ── */}
        <Image
          src="/customize-case.png"
          alt="Phone case mockup"
          fill
          sizes="320px"
          className="pointer-events-none relative z-10 object-contain"
          priority
        />
      </div>

      {artwork && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Preview — print matches your uploaded artwork
        </p>
      )}

      {/* ── Upload controls (same component: fully self-contained POC) ── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-label="Upload artwork file"
        onChange={handleFile}
      />
      <ArtworkControls
        hasArtwork={!!artwork}
        onPick={() => inputRef.current?.click()}
        onRemove={() => commit(undefined)}
      />
    </div>
  );
}

function ArtworkControls({
  hasArtwork,
  onPick,
  onRemove,
}: {
  hasArtwork: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" onClick={onPick}>
        <Upload /> {hasArtwork ? "Replace image" : "Upload your artwork"}
      </Button>
      {hasArtwork && (
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 /> Remove
        </Button>
      )}
    </div>
  );
}
