import type { ApiProduct, ApiVariant } from "@/lib/api-types";

/** Variants are priced individually — the product price is the cheapest option. */
export function activeVariants(p: ApiProduct): ApiVariant[] {
  return (p.variants ?? []).filter((v) => v.isActive);
}

export function minVariantPrice(p: ApiProduct): number | null {
  const prices = activeVariants(p)
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
}

export interface PriceView {
  price: number | null;
  original?: number;
  discountPct?: number;
}

/** Price + compare-at + discount % derived from the cheapest variant. */
export function priceView(p: ApiProduct): PriceView {
  const act = activeVariants(p);
  if (act.length === 0) return { price: null };
  let best = act[0];
  for (const v of act) {
    if (Number(v.price) < Number(best.price)) best = v;
  }
  const price = Number(best.price);
  const compare = best.comparePrice != null ? Number(best.comparePrice) : NaN;
  if (Number.isFinite(compare) && compare > price) {
    return {
      price,
      original: compare,
      discountPct: Math.round((1 - price / compare) * 100),
    };
  }
  return { price };
}

/** Minimal shape needed to pick a listing image (storefront or admin row). */
export interface ImageSource {
  images?: string[] | null;
  variants?: { isActive?: boolean; images?: string[] | null }[] | null;
}

/**
 * Best available image for listing surfaces.
 *
 * `Product.images` holds the flat listing artwork, so it wins when present.
 * A product can legitimately exist with artwork only on its variants though
 * (each variant carries its own per-device mockup), and reading the product
 * array alone rendered a "no image" placeholder for products that do have
 * artwork — so fall back to the first active variant image.
 */
export function primaryImage(p: ImageSource): string | undefined {
  if (p.images?.[0]) return p.images[0];
  for (const v of p.variants ?? []) {
    if (v.isActive === false) continue;
    const img = v.images?.[0];
    if (img) return img;
  }
  return undefined;
}
