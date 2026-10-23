"use client";

/**
 * Product media that reacts to the device the shopper selects.
 *
 * - Before a model is chosen: shows the product's flat artwork
 *   (`Product.images`) — the same image used on listing pages — or, when the
 *   product has no flat artwork, the first active variant mockup.
 * - After a model is chosen: shows that variant's mockup
 *   (`Variant.images`) when present, so the shopper sees the design on their
 *   actual phone.
 */

import { ProductGallery } from "@/components/shop/product-gallery";
import { useProductSelection } from "@/lib/stores/product-selection-store";
import { primaryImage } from "@/lib/product-utils";
import type { ApiProduct } from "@/lib/api-types";

export function ProductMedia({ product }: { product: ApiProduct }) {
  const selectedVariantId = useProductSelection((s) => s.byProduct[product.id]);
  const variant = (product.variants ?? []).find((v) => v.id === selectedVariantId);

  const mockups = variant?.images?.filter(Boolean) ?? [];
  const fallbackImage = primaryImage(product);
  const images =
    mockups.length > 0
      ? mockups
      : product.images?.length
        ? product.images
        : fallbackImage
          ? [fallbackImage]
          : [];

  return (
    <div>
      {/* Remount when the device changes so the active thumbnail resets. */}
      <ProductGallery
        key={selectedVariantId ?? "artwork"}
        images={images}
        name={product.name}
      />
      {mockups.length > 0 && variant?.deviceModel && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Shown on{" "}
          {`${variant.deviceModel.brand?.name ?? ""} ${variant.deviceModel.name}`.trim()}
        </p>
      )}
    </div>
  );
}
