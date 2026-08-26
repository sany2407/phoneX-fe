"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { Coupon } from "@/lib/types";

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed bg-card px-5 py-4">
      <div>
        <p className="font-mono text-sm font-bold tracking-widest">{coupon.code}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{coupon.description}</p>
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
