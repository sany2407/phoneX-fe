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
  name: string;
  slug: string;
  type: "PHONE" | "LAPTOP";
  year: number;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
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
  basePrice: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  images: ApiProductImage[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  material?: string;
  finish?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: "featured" | "newest" | "popular" | "price-asc" | "price-desc" | "rating";
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
  price: number;
  stock: number;
  isActive: boolean;
  images?: ApiProductImage[];
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

export interface ApiAddress {
  id: string;
  userId: string;
  name: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressPayload {
  name: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export interface ApiCoupon {
  id: string;
  code: string;
  label: string;
  description?: string;
  type: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface ValidateCouponPayload {
  code: string;
  orderAmount: number;
}

export interface ValidateCouponResponse {
  coupon: ApiCoupon;
  discount: number;
  freeShipping: boolean;
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
  user?: Pick<ApiUser, "id" | "name">;
  rating: number;
  title?: string;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  title?: string;
  body: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  body?: string;
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
