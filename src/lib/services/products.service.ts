import { api } from "@/lib/api-client";
import type {
  ApiProduct,
  ApiVariant,
  PaginatedResponse,
  ProductListParams,
} from "@/lib/api-types";

function buildQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const productsService = {
  /** GET /products */
  list(params?: ProductListParams): Promise<PaginatedResponse<ApiProduct>> {
    const q = buildQuery((params ?? {}) as Record<string, unknown>);
    return api.get<PaginatedResponse<ApiProduct>>(`/products${q}`, {
      public: true,
    });
  },

  /** GET /products/featured */
  getFeatured(): Promise<ApiProduct[]> {
    return api.get<ApiProduct[]>("/products/featured", { public: true });
  },

  /** GET /products/search?q=... */
  search(
    query: string,
    params?: Omit<ProductListParams, "sort">
  ): Promise<PaginatedResponse<ApiProduct>> {
    const q = buildQuery({ q: query, ...(params ?? {}) } as Record<
      string,
      unknown
    >);
    return api.get<PaginatedResponse<ApiProduct>>(`/products/search${q}`, {
      public: true,
    });
  },

  /** GET /products/:slug */
  getBySlug(slug: string): Promise<ApiProduct> {
    return api.get<ApiProduct>(`/products/${slug}`, { public: true });
  },

  /** GET /products/:productId/variants */
  getVariants(productId: string): Promise<ApiVariant[]> {
    return api.get<ApiVariant[]>(`/products/${productId}/variants`, {
      public: true,
    });
  },
};
