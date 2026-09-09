import { api } from "@/lib/api-client";
import type { ApiAddress, AddressPayload } from "@/lib/api-types";

export const addressesService = {
  /** GET /addresses */
  getAll(): Promise<ApiAddress[]> {
    return api.get<ApiAddress[]>("/addresses");
  },

  /** POST /addresses */
  create(payload: AddressPayload): Promise<ApiAddress> {
    return api.post<ApiAddress>("/addresses", payload);
  },

  /** GET /addresses/:id */
  getById(id: string): Promise<ApiAddress> {
    return api.get<ApiAddress>(`/addresses/${id}`);
  },

  /** PUT /addresses/:id */
  update(id: string, payload: Partial<AddressPayload>): Promise<ApiAddress> {
    return api.put<ApiAddress>(`/addresses/${id}`, payload);
  },

  /** DELETE /addresses/:id */
  delete(id: string): Promise<void> {
    return api.delete<void>(`/addresses/${id}`);
  },

  /** PATCH /addresses/:id/default */
  setDefault(id: string): Promise<ApiAddress> {
    return api.patch<ApiAddress>(`/addresses/${id}/default`);
  },
};
