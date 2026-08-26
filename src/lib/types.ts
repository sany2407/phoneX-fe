export type DeviceType = "phone" | "laptop";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  types: DeviceType[];
}

export interface DeviceModel {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  type: DeviceType;
  year: number;
  popular?: boolean;
}

export type PatternId =
  | "gradient"
  | "waves"
  | "neon-grid"
  | "marble"
  | "mountains"
  | "stars"
  | "blobs"
  | "stripes"
  | "carbon"
  | "leather"
  | "solid"
  | "topo"
  | "circuit"
  | "petals"
  | "rays"
  | "checker";

export interface DesignCategory {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  colors: [string, string];
  pattern: PatternId;
}

export type MaterialId =
  | "matte"
  | "glossy"
  | "carbon-fiber"
  | "leather"
  | "transparent"
  | "textured";

export type FinishId = "satin" | "gloss" | "metallic" | "frosted";

export interface Material {
  id: MaterialId;
  label: string;
  description: string;
}

export interface Finish {
  id: FinishId;
  label: string;
}

export interface Skin {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  material: MaterialId;
  finish: FinishId;
  /** Base price in INR for phones; laptops use price * LAPTOP_PRICE_FACTOR */
  price: number;
  discountPct: number;
  rating: number;
  reviews: number;
  isNew: boolean;
  featured: boolean;
  popularity: number;
  inStock: boolean;
  colors: [string, string];
  pattern: PatternId;
  deviceTypes: DeviceType[];
  /** Brand ids this skin is made for, or ["*"] for every brand */
  brands: string[];
  /** When set, this skin is only cut for these device slugs */
  models?: string[];
}

export type SortKey =
  | "featured"
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "rating";

/* ---------- Custom design ---------- */

export type SkinTypeId = MaterialId;

export interface SavedDesign {
  id: string;
  deviceId: string;
  deviceName: string;
  skinType: SkinTypeId;
  /** Uploaded artwork as a data URL */
  imageSrc: string;
  updatedAt: number;
}

/* ---------- Cart / checkout / orders ---------- */

export interface CartItem {
  key: string;
  kind: "skin" | "custom";
  title: string;
  subtitle: string;
  deviceId: string;
  deviceName: string;
  unitPrice: number;
  qty: number;
  thumb?: string;
  refId?: string;
  designId?: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Designing",
  "Printing",
  "Packed",
  "Shipped",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | "Cancelled";

export interface OrderItem {
  title: string;
  subtitle: string;
  deviceName: string;
  unitPrice: number;
  qty: number;
  thumb?: string;
}

export interface Order {
  id: string;
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: number }[];
  customer: {
    fullName: string;
    email: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface Coupon {
  code: string;
  label: string;
  description: string;
  pct?: number;
  flatOff?: number;
  freeShippingOver?: number;
}
