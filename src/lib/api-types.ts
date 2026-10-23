/**
 * API response types for the phonex backend.
 *
 * These mirror the backend's JSON shapes. All list endpoints return the
 * data directly from the unwrapped `data` key (the api-client strips the
 * outer { success, data, message } envelope).
 */

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Sibling `pagination` object returned alongside list payloads. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/** The raw `{ success, message, data, pagination }` envelope. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  models?: ApiDeviceModel[];
}

export interface ApiDeviceModel {
  id: string;
  brandId: string;
  brand?: ApiBrand;
  deviceTypeId?: string | null;
  deviceType?: ApiDeviceType | null;
  name: string;
  slug: string;
  imageUrl?: string | null;
  /** Legacy — the API no longer sends this; use deviceType instead. */
  type?: "PHONE" | "LAPTOP" | "TABLET";
  year?: number;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ApiDeviceType {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count?: { models: number };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;      // legacy field name (may still appear)
  imageUrl?: string;   // actual field name the backend sends
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: ApiCategory;
  material: string;
  finish: string;
  tags?: string[];
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  images: string[];
  variants?: ApiVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  material?: string;
  finish?: string;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  deviceType?: string;
  onSale?: boolean;
  search?: string;
  sort?: "featured" | "newest" | "popular" | "price-asc" | "price-desc" | "rating" | "name_asc" | "name_desc";
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export interface ApiVariant {
  id: string;
  productId: string;
  product?: ApiProduct;
  deviceModelId: string;
  deviceModel?: ApiDeviceModel;
  sku: string;
  price: number | string;
  comparePrice?: number | string | null;
  stock: number;
  isActive: boolean;
  images?: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface ApiCartItem {
  id: string;
  variantId: string;
  variant: ApiVariant & {
    product: ApiProduct;
    deviceModel: ApiDeviceModel;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApiCart {
  id: string;
  userId: string;
  items: ApiCartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export interface ApiWishlistItem {
  id: string;
  variantId: string;
  variant: ApiVariant & {
    product: ApiProduct;
    deviceModel: ApiDeviceModel;
  };
  addedAt: string;
}

export interface ApiWishlist {
  items: ApiWishlistItem[];
  total: number;
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

/**
 * Address as returned by the backend (`/addresses`).
 * Mirrors the Prisma `Address` model — see `phoneX-be/src/modules/addresses`.
 */
export interface ApiAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body accepted by `POST /addresses` and `PUT /addresses/:id`. */
export interface AddressPayload {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface ApiCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  discountValue: number | string;
  minOrderValue?: number | string | null;
  maxDiscount?: number | string | null;
  validFrom?: string;
  validUntil: string;
  usageLimit?: number | null;
  usedCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ValidateCouponPayload {
  code: string;
  /** Order subtotal in rupees — the backend field is `subtotal`. */
  subtotal: number;
}

export interface ValidateCouponResponse {
  coupon: ApiCoupon;
  discountAmount: number;
  discountType: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  discountValue: number | string;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type ApiOrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "DESIGNING"
  | "PRINTING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface ApiOrderItem {
  id: string;
  variantId: string;
  variant: ApiVariant & {
    product: ApiProduct;
    deviceModel: ApiDeviceModel;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  userId: string;
  items: ApiOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: ApiOrderStatus;
  statusHistory: { status: ApiOrderStatus; note?: string; createdAt: string }[];
  shippingAddress: ApiAddress;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutPayload {
  addressId: string;
  couponCode?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface CreatePaymentPayload {
  orderId: string;
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;        // in paise
  currency: string;
  orderId: string;       // phonex order id
  keyId: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface ApiPayment {
  id: string;
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface ApiReview {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  user?: { id?: string; name?: string; email?: string };
  rating: number;
  title?: string | null;
  body?: string | null;
  isApproved?: boolean;
  isVerifiedPurchase?: boolean;
  product?: { name?: string };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewPayload {
  /** Order id that delivered this product — required by the backend. */
  orderId: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  body?: string;
}

/** Distribution of approved reviews for a product. */
export interface ReviewRatingSummary {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  average: number;
  total: number;
}

/** Payload of `GET /products/:productId/reviews`. */
export interface ProductReviewsResponse {
  reviews: ApiReview[];
  ratingSummary: ReviewRatingSummary;
}

// ---------------------------------------------------------------------------
// Admin — Dashboard & Analytics
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: ApiOrder[];
  lowStockVariants: ApiVariant[];
}

export interface OrderStatusBreakdown {
  status: ApiOrderStatus;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface SalesDataPoint {
  date: string;       // ISO date string
  revenue: number;
  orders: number;
}

export interface CustomerSignupDataPoint {
  date: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Admin — Inventory
// ---------------------------------------------------------------------------

export interface InventoryItem {
  variantId: string;
  sku: string;
  product: Pick<ApiProduct, "id" | "name" | "slug">;
  deviceModel: Pick<ApiDeviceModel, "id" | "name" | "slug">;
  stock: number;
  price: number;
}

export interface UpdateInventoryPayload {
  stock: number;
}

// ---------------------------------------------------------------------------
// Admin — Users
// ---------------------------------------------------------------------------

export interface AdminUserListItem extends ApiUser {
  orderCount: number;
  totalSpend: number;
}

export interface AdminUserDetail extends AdminUserListItem {
  orders: ApiOrder[];
}
