"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { ApiCoupon } from "@/lib/api-types";

function couponDescription(c: ApiCoupon): string {
  const type  = c.discountType  ?? c.type;
  const value = c.discountValue ?? c.value;

  if (type === "PERCENTAGE" && value != null) {
    const min = c.minOrderValue ?? c.minOrderAmount;
    return `${value}% off${min ? ` on orders above ₹${min}` : " on all orders"}.`;
  }
  if (type === "FLAT" && value != null) {
    const min = c.minOrderValue ?? c.minOrderAmount;
    return `₹${value} off${min ? ` on orders above ₹${min}` : ""}.`;
  }
  if (type === "FREE_SHIPPING") {
    const min = c.minOrderValue ?? c.minOrderAmount;
    return `Free shipping${min ? ` on orders above ₹${min}` : ""}.`;
  }
  // legacy label/description fallback
  return c.label ?? c.description ?? "";
}

export function CouponCard({ coupon }: { coupon: ApiCoupon }) {
  const [copied, setCopied] = useState(false);
  const desc = couponDescription(coupon);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed bg-card px-5 py-4">
      <div className="min-w-0">
        <p className="font-mono text-sm font-bold tracking-widest">{coupon.code}</p>
        {desc && (
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        )}
      </div>
      <button
        type="button"
        aria-label={`Copy code ${coupon.code}`}
        onClick={async () => {
          await navigator.clipboard.writeText(coupon.code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="press grid size-9 shrink-0 place-items-center rounded-lg border hover:bg-muted"
      >
        {copied ? (
          <Check className="size-4 text-primary" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
