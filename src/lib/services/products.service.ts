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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export interface ProductFacets {
  materials: string[];
  finishes: string[];
}

export const productsService = {
  /**
   * GET /products — returns items + full pagination meta.
   * Uses a raw fetch because the shared client unwraps `data` and would
   * drop the sibling `pagination` envelope.
   */
  async list(
    params?: ProductListParams,
    init?: { revalidate?: number }
  ): Promise<{ items: ApiProduct[]; pagination: PaginatedResponse<ApiProduct> }> {
    const q = buildQuery((params ?? {}) as Record<string, unknown>);
    const res = await fetch(`${API_BASE}/products${q}`, {
      ...(init?.revalidate != null ? { next: { revalidate: init.revalidate } } : {}),
    });
    if (!res.ok) throw new Error(`Product list failed (${res.status})`);
    const json = await res.json();
    const items: ApiProduct[] = Array.isArray(json.data) ? json.data : [];
    const p = json.pagination ?? {};
    return {
      items,
      pagination: {
        items,
        total: Number(p.total ?? items.length),
        page: Number(p.page ?? params?.page ?? 1),
        limit: Number(p.limit ?? params?.limit ?? items.length),
        totalPages: Number(p.totalPages ?? 1),
      },
    };
  },

  /** GET /products/featured */
  getFeatured(): Promise<ApiProduct[]> {
    return api.get<ApiProduct[]>("/products/featured", { public: true });
  },

  /** GET /products/facets — distinct materials + finishes in stock */
  async getFacets(init?: { revalidate?: number }): Promise<ProductFacets> {
    const res = await fetch(`${API_BASE}/products/facets`, {
      ...(init?.revalidate != null ? { next: { revalidate: init.revalidate } } : {}),
    });
    if (!res.ok) return { materials: [], finishes: [] };
    const json = await res.json();
    return {
      materials: Array.isArray(json.data?.materials) ? json.data.materials : [],
      finishes: Array.isArray(json.data?.finishes) ? json.data.finishes : [],
    };
  },

  /** GET /products/search?q=... — returns the matching products array */
  async search(
    query: string,
    params?: Omit<ProductListParams, "sort">
  ): Promise<{ items: ApiProduct[] }> {
    const q = buildQuery({ q: query, ...(params ?? {}) } as Record<
      string,
      unknown
    >);
    const res = await fetch(`${API_BASE}/products/search${q}`);
    if (!res.ok) return { items: [] };
    const json = await res.json();
    const data = json.data ?? json;
    return { items: Array.isArray(data) ? data : [] };
  },

  /** GET /products/:slug */
  getBySlug(slug: string): Promise<ApiProduct> {
    return api.get<ApiProduct>(`/products/${slug}`, { public: true });
  },

  /** GET /variants/by-product/:productId */
  async getVariants(productId: string): Promise<ApiVariant[]> {
    const res = await api.get<ApiVariant[] | { variants: ApiVariant[] }>(
      `/variants/by-product/${productId}`,
      { public: true }
    );
    return Array.isArray(res) ? res : (res.variants ?? []);
  },
};
