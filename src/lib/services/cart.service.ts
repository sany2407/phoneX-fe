import { api } from "@/lib/api-client";
import type {
  ApiCart,
  AddToCartPayload,
  UpdateCartItemPayload,
} from "@/lib/api-types";

export const cartService = {
  /** GET /cart */
  get(): Promise<ApiCart> {
    return api.get<ApiCart>("/cart");
  },

  /** POST /cart/items */
  addItem(payload: AddToCartPayload): Promise<ApiCart> {
    return api.post<ApiCart>("/cart/items", payload);
  },

  /** PUT /cart/items/:itemId */
  updateItem(itemId: string, payload: UpdateCartItemPayload): Promise<ApiCart> {
    return api.put<ApiCart>(`/cart/items/${itemId}`, payload);
  },

  /** DELETE /cart/items/:itemId */
  removeItem(itemId: string): Promise<ApiCart> {
    return api.delete<ApiCart>(`/cart/items/${itemId}`);
  },

  /** DELETE /cart */
  clear(): Promise<void> {
    return api.delete<void>("/cart");
  },
};
