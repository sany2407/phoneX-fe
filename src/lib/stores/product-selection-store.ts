"use client";

/**
 * Product-page variant selection (Zustand).
 *
 * The product gallery and the buy panel are sibling components rendered by the
 * (server) product page. This store lets the buy panel publish the device model
 * the shopper picked so the gallery can swap the flat artwork for that
 * variant's phone mockup (`Variant.images`).
 */

import { create } from "zustand";

interface ProductSelectionState {
  /** productId → selected variantId */
  byProduct: Record<string, string>;
  select: (productId: string, variantId: string) => void;
}

export const useProductSelection = create<ProductSelectionState>()((set) => ({
  byProduct: {},
  select: (productId, variantId) =>
    set((s) => ({ byProduct: { ...s.byProduct, [productId]: variantId } })),
}));
