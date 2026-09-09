import { api } from "@/lib/api-client";
import type {
  ApiOrder,
  CheckoutPayload,
  PaginatedResponse,
} from "@/lib/api-types";

export const ordersService = {
  /** POST /orders/checkout — creates an order from the server cart */
  checkout(payload: CheckoutPayload): Promise<ApiOrder> {
    return api.post<ApiOrder>("/orders/checkout", payload);
  },

  /** GET /orders */
  getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ApiOrder>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<PaginatedResponse<ApiOrder>>(`/orders${q}`);
  },

  /** GET /orders/:id */
  getById(id: string): Promise<ApiOrder> {
    return api.get<ApiOrder>(`/orders/${id}`);
  },

  /** POST /orders/:id/cancel */
  cancel(id: string): Promise<ApiOrder> {
    return api.post<ApiOrder>(`/orders/${id}/cancel`);
  },
};
