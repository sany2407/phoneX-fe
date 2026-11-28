"use client";

import { useEffect } from "react";
import { Tag } from "lucide-react";
import { useCoupons } from "@/lib/stores/coupons-store";
import { couponLabel } from "@/lib/services/coupons-public";

/**
 * Scrolling promo strip. Only renders when the backend actually has active
 * coupons — no hardcoded fallback text.
 */
export function CouponMarquee() {
  const items = useCoupons((s) => s.publicCoupons);
  const loaded = useCoupons((s) => s.loaded);
  const load = useCoupons((s) => s.loadPublic);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded || items.length === 0) return null;

  const labels = items.map(couponLabel);
  const scrollItems = [...labels, ...labels];
  const duration = Math.max(labels.length * 8, 20);

  return (
    <div
      className="relative overflow-hidden bg-foreground py-2"
      aria-label="Promotions and offers"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
          animation: "shimmer 6s linear infinite",
        }}
      />
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {scrollItems.map((label, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-8 text-xs font-medium tracking-wide text-background/80"
          >
            <Tag className="size-3 shrink-0 text-electric/70" aria-hidden="true" />
            {label}
            <span aria-hidden="true" className="ml-8 text-background/30">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
