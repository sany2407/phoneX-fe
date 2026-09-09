import { api } from "@/lib/api-client";
import type { ApiWishlist } from "@/lib/api-types";

export const wishlistService = {
  /** GET /wishlist */
  get(): Promise<ApiWishlist> {
    return api.get<ApiWishlist>("/wishlist");
  },

  /** POST /wishlist/:variantId */
  add(variantId: string): Promise<void> {
    return api.post<void>(`/wishlist/${variantId}`);
  },

  /** DELETE /wishlist/:variantId */
  remove(variantId: string): Promise<void> {
    return api.delete<void>(`/wishlist/${variantId}`);
  },
};
