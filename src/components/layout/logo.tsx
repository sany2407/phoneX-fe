import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * phoneX brand mark — real logo artwork.
 * Light ink version on light surfaces, white version on dark (`invert`).
 * Source: `public/PHONEXLOGOWHITE.jpg`, trimmed to transparent PNGs.
 */
export function Logo({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="phoneX home"
      className={cn(
        "group inline-flex select-none rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary",
        className
      )}
    >
      <Image
        src={invert ? "/phonex-logo-white.png" : "/phonex-logo.png"}
        alt="phoneX"
        width={182}
        height={30}
        priority
        className="h-7 w-auto transition-transform duration-200 ease-out group-hover:scale-[1.03] sm:h-8"
      />
    </Link>
  );
}
