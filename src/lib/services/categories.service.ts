import { api } from "@/lib/api-client";
import type { ApiCategory } from "@/lib/api-types";

export const categoriesService = {
  /** GET /categories */
  getAll(): Promise<ApiCategory[]> {
    return api.get<ApiCategory[]>("/categories", { public: true });
  },

  /** GET /categories/:slug */
  getBySlug(slug: string): Promise<ApiCategory> {
    return api.get<ApiCategory>(`/categories/${slug}`, { public: true });
  },
};
