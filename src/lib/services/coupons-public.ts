/**
 * Shared public coupon fetch — used by both the offers page (server) and the
 * CouponMarquee (client). No auth required.
 *
 * The backend only ever returns the canonical shape (see `ApiCoupon`):
 * `{ code, discountType, discountValue, minOrderValue, maxDiscount, validUntil }`.
 */
import type { ApiCoupon } from "@/lib/api-types";

/** Human-readable one-liner for a coupon, e.g. "10% off — use code PHONE10". */
export function couponLabel(c: ApiCoupon): string {
  const value = Number(c.discountValue);

  if (c.discountType === "PERCENTAGE") {
    return `${value}% off — use code ${c.code}`;
  }
  if (c.discountType === "FLAT") {
    return `₹${value} off — use code ${c.code}`;
  }
  if (c.discountType === "FREE_SHIPPING") {
    const min = c.minOrderValue != null ? Number(c.minOrderValue) : 0;
    return `Free shipping${min ? ` over ₹${min}` : ""} — use code ${c.code}`;
  }
  return `Use code ${c.code}`;
}

/** Longer sentence for coupon cards, e.g. "10% off on orders above ₹499." */
export function couponDescription(c: ApiCoupon): string {
  const value = Number(c.discountValue);
  const min = c.minOrderValue != null ? Number(c.minOrderValue) : 0;

  if (c.discountType === "PERCENTAGE") {
    return `${value}% off${min ? ` on orders above ₹${min}` : " on all orders"}.`;
  }
  if (c.discountType === "FLAT") {
    return `₹${value} off${min ? ` on orders above ₹${min}` : ""}.`;
  }
  if (c.discountType === "FREE_SHIPPING") {
    return `Free shipping${min ? ` on orders above ₹${min}` : ""}.`;
  }
  return `Use code ${c.code}.`;
}

export async function fetchPublicCoupons(): Promise<ApiCoupon[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const res = await fetch(`${base}/coupons`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: ApiCoupon[] = json.data ?? json;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}
