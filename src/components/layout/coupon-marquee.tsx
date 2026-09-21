"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import type { ApiCoupon } from "@/lib/api-types";
import { fetchPublicCoupons, couponLabel } from "@/lib/services/coupons-public";

const FALLBACK = "Free shipping over ₹499 · Extra 10% off with code PHONE10";

export function CouponMarquee() {
  const [items,  setItems]  = useState<ApiCoupon[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPublicCoupons().then((data) => {
      setItems(data);
      setLoaded(true);
    });
  }, []);

  const labels: string[] = loaded && items.length > 0
    ? items.map(couponLabel)
    : [FALLBACK];

  const scrollItems = [...labels, ...labels];

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
          animation: `marquee-scroll ${Math.max(labels.length * 8, 20)}s linear infinite`,
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
