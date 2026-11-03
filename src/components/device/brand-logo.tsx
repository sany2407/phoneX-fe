"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Two letters that identify a brand without needing artwork. */
export function brandMonogram(name: string) {
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
 * Brand logo with a monogram fallback.
 *
 * Logos are Cloudinary URLs that may be missing, misconfigured or deleted, so
 * a failed load falls back to the brand initials instead of a broken image.
 */
export function BrandLogo({
  name,
  src,
  className,
  imageClassName,
}: {
  name: string;
  src?: string | null;
  className?: string;
  imageClassName?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showLogo = Boolean(src) && failedSrc !== src;

  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center overflow-hidden", className)}
    >
      {src && showLogo ? (
        // Cloudinary URLs are remote — plain <img> avoids next.config allowlists.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className={cn("size-full object-contain", imageClassName)}
        />
      ) : (
        brandMonogram(name)
      )}
    </span>
  );
}
