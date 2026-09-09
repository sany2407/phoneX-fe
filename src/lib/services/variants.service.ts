import { api } from "@/lib/api-client";
import type { ApiVariant } from "@/lib/api-types";

export const variantsService = {
  /** GET /variants/:id */
  getById(id: string): Promise<ApiVariant> {
    return api.get<ApiVariant>(`/variants/${id}`, { public: true });
  },
};
