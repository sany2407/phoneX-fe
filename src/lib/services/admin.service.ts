import { api } from "@/lib/api-client";import type {
  ApiOrder,
  ApiOrderStatus,
  ApiProduct,
  ApiVariant,
  ApiBrand,
  ApiDeviceModel,
  ApiCategory,
  ApiCoupon,
  ApiReview,
  DashboardStats,
  OrderStatusBreakdown,
  TopProduct,
  SalesDataPoint,
  CustomerSignupDataPoint,
  InventoryItem,
  UpdateInventoryPayload,
  AdminUserListItem,
  AdminUserDetail,
  PaginatedResponse,
} from "@/lib/api-types";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface CreateProductPayload {
  name: string;
  description?: string;
  categoryId: string;
  material: string;
  finish: string;
  basePrice: number;
  discountPct?: number;
  isFeatured?: boolean;
  tags?: string[];
}

export interface AddProductImagesPayload {
  images: { url: string; alt?: string; isPrimary?: boolean }[];
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export interface CreateVariantPayload {
  productId: string;
  deviceModelId: string;
  sku: string;
  price: number;
  stock: number;
}

export interface UpdateVariantPayload {
  sku?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export interface CreateBrandPayload {
  name: string;
  slug: string;
  logo?: string;
}

export interface UpdateBrandPayload extends Partial<CreateBrandPayload> {}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export interface CreateDeviceModelPayload {
  brandId: string;
  name: string;
  slug: string;
  type: "PHONE" | "LAPTOP" | "TABLET";
  year: number;
  isPopular?: boolean;
}

export interface UpdateDeviceModelPayload {
  name?: string;
  slug?: string;
  type?: "PHONE" | "LAPTOP" | "TABLET";
  year?: number;
  isPopular?: boolean;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface CreateCouponPayload {
  code: string;
  discountType: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  validFrom: string;       // ISO datetime string
  validUntil: string;      // ISO datetime string
  usageLimit?: number | null;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface UpdateUserRolePayload {
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const adminService = {

  // ── Dashboard ──────────────────────────────────────────────────────────────

  /** GET /admin/dashboard */
  getDashboard(): Promise<DashboardStats> {
    return api.get<DashboardStats>("/admin/dashboard");
  },

  // ── Analytics ──────────────────────────────────────────────────────────────

  /** GET /admin/analytics/orders */
  getOrderAnalytics(): Promise<OrderStatusBreakdown[]> {
    return api.get<OrderStatusBreakdown[]>("/admin/analytics/orders");
  },

  /** GET /admin/analytics/products */
  getTopProducts(): Promise<TopProduct[]> {
    return api.get<TopProduct[]>("/admin/analytics/products");
  },

  /** GET /admin/analytics/sales */
  getSalesAnalytics(params?: { from?: string; to?: string }): Promise<SalesDataPoint[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to)   qs.set("to",   params.to);
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<SalesDataPoint[]>(`/admin/analytics/sales${q}`);
  },

  /** GET /admin/analytics/customers */
  getCustomerAnalytics(params?: { from?: string; to?: string }): Promise<CustomerSignupDataPoint[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to)   qs.set("to",   params.to);
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<CustomerSignupDataPoint[]>(`/admin/analytics/customers${q}`);
  },

  // ── Orders ─────────────────────────────────────────────────────────────────

  /** GET /admin/orders */
  getOrders(params?: { page?: number; limit?: number; status?: ApiOrderStatus }): Promise<PaginatedResponse<ApiOrder>> {
    const qs = new URLSearchParams();
    if (params?.page)   qs.set("page",   String(params.page));
    if (params?.limit)  qs.set("limit",  String(params.limit));
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<PaginatedResponse<ApiOrder>>(`/admin/orders${q}`);
  },

  /** GET /admin/orders/:id */
  getOrderById(id: string): Promise<ApiOrder> {
    return api.get<ApiOrder>(`/admin/orders/${id}`);
  },

  /** PATCH /admin/orders/:id/status */
  updateOrderStatus(id: string, status: ApiOrderStatus): Promise<ApiOrder> {
    return api.patch<ApiOrder>(`/admin/orders/${id}/status`, { status });
  },

  // ── Products ───────────────────────────────────────────────────────────────

  /** POST /admin/products */
  createProduct(payload: CreateProductPayload): Promise<ApiProduct> {
    return api.post<ApiProduct>("/admin/products", payload);
  },

  /** PUT /admin/products/:id */
  updateProduct(id: string, payload: Partial<CreateProductPayload>): Promise<ApiProduct> {
    return api.put<ApiProduct>(`/admin/products/${id}`, payload);
  },

  /** DELETE /admin/products/:id */
  deleteProduct(id: string): Promise<void> {
    return api.delete<void>(`/admin/products/${id}`);
  },

  /** POST /admin/products/:id/images */
  addProductImages(id: string, payload: AddProductImagesPayload): Promise<ApiProduct> {
    return api.post<ApiProduct>(`/admin/products/${id}/images`, payload);
  },

  // ── Variants ───────────────────────────────────────────────────────────────

  /** POST /admin/variants */
  createVariant(payload: CreateVariantPayload): Promise<ApiVariant> {
    return api.post<ApiVariant>("/admin/variants", payload);
  },

  /** PUT /admin/variants/:id */
  updateVariant(id: string, payload: UpdateVariantPayload): Promise<ApiVariant> {
    return api.put<ApiVariant>(`/admin/variants/${id}`, payload);
  },

  // ── Inventory ──────────────────────────────────────────────────────────────

  /** GET /admin/inventory */
  getInventory(): Promise<InventoryItem[]> {
    return api.get<InventoryItem[]>("/admin/inventory");
  },

  /** PATCH /admin/inventory/:variantId */
  updateStock(variantId: string, payload: UpdateInventoryPayload): Promise<InventoryItem> {
    return api.patch<InventoryItem>(`/admin/inventory/${variantId}`, payload);
  },

  // ── Device brands ──────────────────────────────────────────────────────────

  /** GET /devices/brands (public) */
  listBrands(): Promise<ApiBrand[]> {
    return api.get<ApiBrand[]>("/devices/brands", { public: true });
  },

  /** GET /devices/brands/:slug (public) */
  getBrand(slug: string): Promise<ApiBrand> {
    return api.get<ApiBrand>(`/devices/brands/${slug}`, { public: true });
  },

  /** POST /admin/devices/brands */
  createBrand(payload: CreateBrandPayload): Promise<ApiBrand> {
    return api.post<ApiBrand>("/admin/devices/brands", payload);
  },

  /** PUT /admin/devices/brands/:id */
  updateBrand(id: string, payload: UpdateBrandPayload): Promise<ApiBrand> {
    return api.put<ApiBrand>(`/admin/devices/brands/${id}`, payload);
  },

  /** DELETE /admin/devices/brands/:id */
  deactivateBrand(id: string): Promise<void> {
    return api.delete<void>(`/admin/devices/brands/${id}`);
  },

  // ── Device models ──────────────────────────────────────────────────────────

  /** GET /devices/brands/:slug/models (public) */
  listModels(brandSlug: string): Promise<ApiDeviceModel[]> {
    return api.get<ApiDeviceModel[]>(`/devices/brands/${brandSlug}/models`, { public: true });
  },

  /** POST /admin/devices/models */
  createDeviceModel(payload: CreateDeviceModelPayload): Promise<ApiDeviceModel> {
    return api.post<ApiDeviceModel>("/admin/devices/models", payload);
  },

  /** PUT /admin/devices/models/:id */
  updateDeviceModel(id: string, payload: UpdateDeviceModelPayload): Promise<ApiDeviceModel> {
    return api.put<ApiDeviceModel>(`/admin/devices/models/${id}`, payload);
  },

  /** DELETE /admin/devices/models/:id */
  deleteDeviceModel(id: string): Promise<void> {
    return api.delete<void>(`/admin/devices/models/${id}`);
  },

  // ── Categories ─────────────────────────────────────────────────────────────

  /** GET /categories (public) */
  listCategories(): Promise<ApiCategory[]> {
    return api.get<ApiCategory[]>("/categories", { public: true });
  },

  /** POST /admin/categories */
  createCategory(payload: CreateCategoryPayload): Promise<ApiCategory> {
    return api.post<ApiCategory>("/admin/categories", payload);
  },

  /** PUT /admin/categories/:id */
  updateCategory(id: string, payload: UpdateCategoryPayload): Promise<ApiCategory> {
    return api.put<ApiCategory>(`/admin/categories/${id}`, payload);
  },

  /** DELETE /admin/categories/:id */
  deleteCategory(id: string): Promise<void> {
    return api.delete<void>(`/admin/categories/${id}`);
  },

  // ── Coupons ────────────────────────────────────────────────────────────────

  /** GET /admin/coupons */
  getCoupons(): Promise<ApiCoupon[]> {
    return api.get<ApiCoupon[]>("/admin/coupons");
  },

  /** POST /admin/coupons */
  createCoupon(payload: CreateCouponPayload): Promise<ApiCoupon> {
    return api.post<ApiCoupon>("/admin/coupons", payload);
  },

  /** PUT /admin/coupons/:id */
  updateCoupon(id: string, payload: Partial<CreateCouponPayload>): Promise<ApiCoupon> {
    return api.put<ApiCoupon>(`/admin/coupons/${id}`, payload);
  },

  /** DELETE /admin/coupons/:id */
  deleteCoupon(id: string): Promise<void> {
    return api.delete<void>(`/admin/coupons/${id}`);
  },

  // ── Reviews ────────────────────────────────────────────────────────────────

  /** GET /admin/reviews/pending */
  getPendingReviews(): Promise<ApiReview[]> {
    return api.get<ApiReview[]>("/admin/reviews/pending");
  },

  /** PATCH /admin/reviews/:id/approve */
  approveReview(id: string): Promise<ApiReview> {
    return api.patch<ApiReview>(`/admin/reviews/${id}/approve`);
  },

  /** PATCH /admin/reviews/:id/reject */
  rejectReview(id: string): Promise<ApiReview> {
    return api.patch<ApiReview>(`/admin/reviews/${id}/reject`);
  },

  // ── Users ──────────────────────────────────────────────────────────────────

  /** GET /admin/users — backend returns { data: [...], pagination: {...} } */
  async getUsers(params?: { page?: number; limit?: number }): Promise<{ items: AdminUserListItem[]; total: number; page: number; totalPages: number }> {
    const qs = new URLSearchParams();
    if (params?.page)  qs.set("page",  String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString() ? `?${qs}` : "";

    // The api-client unwraps { success, data } → returns data (the array).
    // But pagination sits alongside data in the envelope, so we fetch raw.
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const { tokenStore } = await import("@/lib/api-client");
    const res = await fetch(`${BASE_URL}/admin/users${q}`, {
      headers: {
        "Content-Type": "application/json",
        ...(tokenStore.getAccess() ? { Authorization: `Bearer ${tokenStore.getAccess()}` } : {}),
      },
    });
    const json = await res.json();
    const items: AdminUserListItem[] = json.data ?? [];
    const pag = json.pagination ?? {};
    return {
      items,
      total:      pag.total      ?? items.length,
      page:       pag.page       ?? 1,
      totalPages: pag.totalPages ?? 1,
    };
  },

  /** GET /admin/users/:id */
  getUserById(id: string): Promise<AdminUserDetail> {
    return api.get<AdminUserDetail>(`/admin/users/${id}`);
  },

  /** PATCH /admin/users/:id/status */
  updateUserStatus(id: string, payload: UpdateUserStatusPayload): Promise<AdminUserListItem> {
    return api.patch<AdminUserListItem>(`/admin/users/${id}/status`, payload);
  },

  /** PATCH /admin/users/:id/role */
  updateUserRole(id: string, payload: UpdateUserRolePayload): Promise<AdminUserListItem> {
    return api.patch<AdminUserListItem>(`/admin/users/${id}/role`, payload);
  },
};
