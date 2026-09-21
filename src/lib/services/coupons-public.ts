/**
 * Shared public coupon fetch — used by both the homepage/offers page (server)
 * and the CouponMarquee (client). No auth required.
 */
import type { ApiCoupon } from "@/lib/api-types";

export function couponLabel(c: ApiCoupon): string {
  const type  = c.discountType  ?? c.type;
  const value = c.discountValue ?? c.value;

  if (!type || value == null) return `Use code ${c.code}`;
  if (type === "PERCENTAGE")    return `${value}% off — use code ${c.code}`;
  if (type === "FLAT")          return `₹${value} off — use code ${c.code}`;
  if (type === "FREE_SHIPPING") {
    const min = c.minOrderValue ?? c.minOrderAmount;
    return `Free shipping${min ? ` over ₹${min}` : ""} — use code ${c.code}`;
  }
  return `Use code ${c.code}`;
}

export async function fetchPublicCoupons(): Promise<ApiCoupon[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const res  = await fetch(`${base}/coupons`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: ApiCoupon[] = json.data ?? json;
    return Array.isArray(items) ? items.filter((c) => c.isActive) : [];
  } catch {
    return [];
  }
}
