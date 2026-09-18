import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * phoneX brand mark.
 *
 * Mark: a pill/squircle containing a stylised "X" built from two crossing
 * strokes — references the product (device skins cut to shape) and the brand
 * name simultaneously.
 *
 * Wordmark: "phone" in regular weight + "X" in bold primary, separated by
 * a faint slash that echoes the precision-cut motif.
 */
export function Logo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="phoneX home"
      className={cn(
        "group inline-flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className
      )}
    >
      {/* ── Mark ── */}
      <span
        aria-hidden="true"
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center rounded-[10px] transition-transform duration-200 ease-out",
          "group-hover:scale-[1.07]",
          invert
            ? "bg-white/15 ring-1 ring-white/20"
            : "bg-primary shadow-[0_2px_8px_rgba(0,65,200,0.35)]"
        )}
      >
        {/* X glyph via SVG — two crossing strokes */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="size-4.5"
          aria-hidden="true"
        >
          <path
            d="M5 5 L15 15 M15 5 L5 15"
            stroke={invert ? "white" : "white"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        {/* subtle top-edge highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-[10px] ring-inset ring-1 ring-white/20" />
      </span>

      {/* ── Wordmark ── */}
      <span
        className={cn(
          "font-heading text-[17px] font-semibold tracking-[-0.03em] leading-none",
          invert ? "text-white" : "text-foreground"
        )}
      >
        phone
        {/* slash motif — thin, muted */}
        <span
          aria-hidden="true"
          className={cn(
            "mx-[1px] font-light",
            invert ? "text-white/30" : "text-foreground/20"
          )}
        >
          /
        </span>
        <span
          className={cn(
            "font-bold",
            invert ? "text-white" : "text-primary"
          )}
        >
          X
        </span>
      </span>
    </Link>
  );
}
