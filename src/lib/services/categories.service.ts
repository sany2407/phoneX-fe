import { api } from "@/lib/api-client";
import type { ApiCategory } from "@/lib/api-types";

export const categoriesService = {
  /** GET /categories */
  getAll(): Promise<ApiCategory[]> {
    return api.get<ApiCategory[]>("/categories", { public: true });
  },

  /** GET /categories/:slug  — takes a slug (e.g. "abstract"), not a UUID */
  getBySlug(slug: string): Promise<ApiCategory> {
    return api.get<ApiCategory>(`/categories/${slug}`, { public: true });
  },

  /** POST /categories/admin */
  create(payload: { name: string; slug: string; description?: string; imageUrl?: string }): Promise<ApiCategory> {
    return api.post<ApiCategory>("/categories/admin", payload);
  },

  /** PUT /categories/admin/:id */
  update(id: string, payload: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean }>): Promise<ApiCategory> {
    return api.put<ApiCategory>(`/categories/admin/${id}`, payload);
  },

  /** DELETE /categories/admin/:id */
  delete(id: string): Promise<void> {
    return api.delete<void>(`/categories/admin/${id}`);
  },
};
