import { api } from "@/lib/api-client";
import type {
  ApiOrder,
  ApiOrderStatus,
  ApiProduct,
  ApiVariant,
  ApiBrand,
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
  type: "PHONE" | "LAPTOP";
  year: number;
  isPopular?: boolean;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface CreateCouponPayload {
  code: string;
  label: string;
  description?: string;
  type: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
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
  // ---- Dashboard ----

  /** GET /admin/dashboard */
  getDashboard(): Promise<DashboardStats> {
    return api.get<DashboardStats>("/admin/dashboard");
  },

  // ---- Analytics ----

  /** GET /admin/analytics/orders */
  getOrderAnalytics(): Promise<OrderStatusBreakdown[]> {
    return api.get<OrderStatusBreakdown[]>("/admin/analytics/orders");
  },

  /** GET /admin/analytics/products */
  getTopProducts(): Promise<TopProduct[]> {
    return api.get<TopProduct[]>("/admin/analytics/products");
  },

  /** GET /admin/analytics/sales */
  getSalesAnalytics(params?: {
    from?: string;
    to?: string;
  }): Promise<SalesDataPoint[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<SalesDataPoint[]>(`/admin/analytics/sales${q}`);
  },

  /** GET /admin/analytics/customers */
  getCustomerAnalytics(params?: {
    from?: string;
    to?: string;
  }): Promise<CustomerSignupDataPoint[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<CustomerSignupDataPoint[]>(`/admin/analytics/customers${q}`);
  },

  // ---- Orders ----

  /** GET /admin/orders */
  getOrders(params?: {
    page?: number;
    limit?: number;
    status?: ApiOrderStatus;
  }): Promise<PaginatedResponse<ApiOrder>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<PaginatedResponse<ApiOrder>>(`/admin/orders${q}`);
  },

  /** PATCH /admin/orders/:id/status */
  updateOrderStatus(
    id: string,
    status: ApiOrderStatus
  ): Promise<ApiOrder> {
    return api.patch<ApiOrder>(`/admin/orders/${id}/status`, { status });
  },

  // ---- Products ----

  /** POST /admin/products */
  createProduct(payload: CreateProductPayload): Promise<ApiProduct> {
    return api.post<ApiProduct>("/admin/products", payload);
  },

  /** POST /admin/products/:id/images */
  addProductImages(
    id: string,
    payload: AddProductImagesPayload
  ): Promise<ApiProduct> {
    return api.post<ApiProduct>(`/admin/products/${id}/images`, payload);
  },

  // ---- Variants ----

  /** POST /admin/variants */
  createVariant(payload: CreateVariantPayload): Promise<ApiVariant> {
    return api.post<ApiVariant>("/admin/variants", payload);
  },

  // ---- Inventory ----

  /** GET /admin/inventory */
  getInventory(): Promise<InventoryItem[]> {
    return api.get<InventoryItem[]>("/admin/inventory");
  },

  /** PATCH /admin/inventory/:variantId */
  updateStock(
    variantId: string,
    payload: UpdateInventoryPayload
  ): Promise<InventoryItem> {
    return api.patch<InventoryItem>(
      `/admin/inventory/${variantId}`,
      payload
    );
  },

  // ---- Brands ----

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

  // ---- Device models ----

  /** POST /admin/devices/models */
  createDeviceModel(
    payload: CreateDeviceModelPayload
  ): Promise<import("@/lib/api-types").ApiDeviceModel> {
    return api.post("/admin/devices/models", payload);
  },

  // ---- Categories ----

  /** POST /admin/categories */
  createCategory(payload: CreateCategoryPayload): Promise<ApiCategory> {
    return api.post<ApiCategory>("/admin/categories", payload);
  },

  // ---- Coupons ----

  /** GET /admin/coupons */
  getCoupons(): Promise<ApiCoupon[]> {
    return api.get<ApiCoupon[]>("/admin/coupons");
  },

  /** POST /admin/coupons */
  createCoupon(payload: CreateCouponPayload): Promise<ApiCoupon> {
    return api.post<ApiCoupon>("/admin/coupons", payload);
  },

  // ---- Reviews ----

  /** GET /admin/reviews/pending */
  getPendingReviews(): Promise<ApiReview[]> {
    return api.get<ApiReview[]>("/admin/reviews/pending");
  },

  // ---- Users ----

  /** GET /admin/users */
  getUsers(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminUserListItem>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<PaginatedResponse<AdminUserListItem>>(`/admin/users${q}`);
  },

  /** GET /admin/users/:id */
  getUserById(id: string): Promise<AdminUserDetail> {
    return api.get<AdminUserDetail>(`/admin/users/${id}`);
  },

  /** PATCH /admin/users/:id/status */
  updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload
  ): Promise<AdminUserListItem> {
    return api.patch<AdminUserListItem>(`/admin/users/${id}/status`, payload);
  },

  /** PATCH /admin/users/:id/role */
  updateUserRole(
    id: string,
    payload: UpdateUserRolePayload
  ): Promise<AdminUserListItem> {
    return api.patch<AdminUserListItem>(`/admin/users/${id}/role`, payload);
  },
};
