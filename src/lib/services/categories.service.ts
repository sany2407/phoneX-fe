import { api } from "@/lib/api-client";
import type { ApiCategory } from "@/lib/api-types";

export const categoriesService = {
  /** GET /categories */
  getAll(opts?: { revalidate?: number }): Promise<ApiCategory[]> {
    return api.get<ApiCategory[]>("/categories", {
      public: true,
      ...(opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : {}),
    });
  },

  /** GET /categories/:slug  — takes a slug (e.g. "abstract"), not a UUID */
  getBySlug(slug: string): Promise<ApiCategory> {
    return api.get<ApiCategory>(`/categories/${slug}`, { public: true });
  },

  /** POST /admin/categories */
  create(payload: { name: string; slug: string; description?: string; imageUrl?: string }): Promise<ApiCategory> {
    return api.post<ApiCategory>("/admin/categories", payload);
  },

  /** PUT /admin/categories/:id */
  update(id: string, payload: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean }>): Promise<ApiCategory> {
    return api.put<ApiCategory>(`/admin/categories/${id}`, payload);
  },

  /** DELETE /admin/categories/:id */
  delete(id: string): Promise<void> {
    return api.delete<void>(`/admin/categories/${id}`);
  },
};
