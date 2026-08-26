import {
  BRANDS,
  COUPONS,
  DESIGN_CATEGORIES,
  DEVICES,
  FINISHES,
  MATERIALS,
} from "@/lib/data/catalog";
import {
  DEVICE_IMAGES,
  type DeviceImageSet,
} from "@/lib/data/device-images";
import { SKINS } from "@/lib/data/skins";
import type {
  Brand,
  Coupon,
  DesignCategory,
  DeviceModel,
  DeviceType,
  Finish,
  Material,
  Skin,
  SortKey,
} from "@/lib/types";

/** Laptop skins cost more than phone skins */
export const LAPTOP_PRICE_FACTOR = 2.1;

export function finalPrice(skin: Skin, type: DeviceType = "phone"): number {
  const base = type === "laptop" ? skin.price * LAPTOP_PRICE_FACTOR : skin.price;
  return Math.round(base / 10) * 10;
}

export function discountedPrice(skin: Skin, type: DeviceType = "phone"): number {
  const base = finalPrice(skin, type);
  return Math.round((base - (base * skin.discountPct) / 100) / 10) * 10;
}

/* ---------------- Brands & devices ---------------- */

export function getBrands(type?: DeviceType): Brand[] {
  return type ? BRANDS.filter((b) => b.types.includes(type)) : BRANDS;
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function getModels(
  filter: { type?: DeviceType; brandId?: string } = {}
): DeviceModel[] {
  return DEVICES.filter(
    (d) =>
      (!filter.type || d.type === filter.type) &&
      (!filter.brandId || d.brandId === filter.brandId)
  );
}

/** /devices/[slug] — slug may be a category ("phones"/"laptops") or a brand slug */
export function resolveDeviceSegment(
  slug: string
):
  | { kind: "category"; type: DeviceType }
  | { kind: "brand"; brand: Brand }
  | null {
  if (slug === "phones") return { kind: "category", type: "phone" };
  if (slug === "laptops") return { kind: "category", type: "laptop" };
  const brand = getBrandBySlug(slug);
  return brand ? { kind: "brand", brand } : null;
}

export function getModel(
  brandSlug: string,
  modelSlug: string
): DeviceModel | undefined {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return undefined;
  return DEVICES.find((d) => d.brandId === brand.id && d.slug === modelSlug);
}

export function getModelById(id: string): DeviceModel | undefined {
  return DEVICES.find((d) => d.id === id);
}

export function brandOf(model: DeviceModel): Brand {
  const brand = BRANDS.find((b) => b.id === model.brandId);
  if (!brand) throw new Error(`Unknown brand ${model.brandId}`);
  return brand;
}

export function getDeviceImageSet(
  brandSlug: string,
  modelSlug: string
): DeviceImageSet | undefined {
  const set = DEVICE_IMAGES[brandSlug]?.[modelSlug];
  if (!set) return undefined;
  if (!set.hero && !set.gallery?.length && !set.designs) return undefined;
  return set;
}

export function getDeviceHero(
  brandSlug: string,
  modelSlug: string
): { src: string; alt: string } | undefined {
  const set = getDeviceImageSet(brandSlug, modelSlug);
  const src = set?.hero ?? set?.gallery?.[0];
  if (!src) return undefined;
  return { src, alt: `${modelSlug} skins and wraps` };
}

/** Design mockups for this brand + device, keyed by skin id. */
export function getDesignImagesForModel(
  brandSlug: string,
  modelSlug: string,
  skins: { id: string; slug: string; name: string }[]
): Record<string, string> {
  const designs = getDeviceImageSet(brandSlug, modelSlug)?.designs;
  if (!designs) return {};
  const out: Record<string, string> = {};
  for (const skin of skins) {
    const src =
      designs[skin.slug] ?? designs[skin.id] ?? designs[skin.name];
    if (src) out[skin.id] = src;
  }
  return out;
}

/** First photographed mockup for a skin, if one exists. */
export function getSkinDesignImage(skin: {
  id: string;
  slug: string;
  name: string;
}): string | undefined {
  for (const models of Object.values(DEVICE_IMAGES)) {
    for (const set of Object.values(models)) {
      const src =
        set.designs?.[skin.slug] ?? set.designs?.[skin.id] ?? set.designs?.[skin.name];
      if (src) return src;
    }
  }
  return undefined;
}

/* ---------------- Categories, materials, finishes ---------------- */

export const getCategories = (): DesignCategory[] => DESIGN_CATEGORIES;

export function getCategoryBySlug(slug: string): DesignCategory | undefined {
  return DESIGN_CATEGORIES.find((c) => c.slug === slug);
}

export function categoryById(id: string): DesignCategory | undefined {
  return DESIGN_CATEGORIES.find((c) => c.id === id);
}

export const getMaterials = (): Material[] => MATERIALS;
export const getFinishes = (): Finish[] => FINISHES;

export function materialLabel(id: string): string {
  return MATERIALS.find((mt) => mt.id === id)?.label ?? id;
}

export function finishLabel(id: string): string {
  return FINISHES.find((f) => f.id === id)?.label ?? id;
}

/* ---------------- Skins ---------------- */

export interface SkinFilters {
  categoryIds?: string[];
  materials?: string[];
  finishes?: string[];
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  deviceType?: DeviceType;
  sort?: SortKey;
  limit?: number;
}

const EXCLUSIVE_MODEL_SLUGS = new Set(
  SKINS.flatMap((s) => s.models ?? [])
);

function matchesModel(skin: Skin, model: DeviceModel): boolean {
  if (!skin.deviceTypes.includes(model.type)) return false;
  if (skin.models?.length) return skin.models.includes(model.slug);
  if (EXCLUSIVE_MODEL_SLUGS.has(model.slug)) return false;
  return skin.brands.includes("*") || skin.brands.includes(model.brandId);
}

function sortSkins(list: Skin[], sort: SortKey = "featured", type: DeviceType): Skin[] {
  const byPrice = (a: Skin, b: Skin) =>
    discountedPrice(a, type) - discountedPrice(b, type);
  switch (sort) {
    case "newest":
      return [...list].sort(
        (a, b) =>
          Number(b.isNew) - Number(a.isNew) ||
          Number(b.featured) - Number(a.featured) ||
          b.popularity - a.popularity
      );
    case "popular":
      return [...list].sort((a, b) => b.popularity - a.popularity);
    case "price-asc":
      return [...list].sort(byPrice);
    case "price-desc":
      return [...list].sort((a, b) => byPrice(b, a));
    case "rating":
      return [...list].sort(
        (a, b) => b.rating - a.rating || b.reviews - a.reviews
      );
    default:
      return [...list].sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || b.popularity - a.popularity
      );
  }
}

export function getSkins(filters: SkinFilters = {}): Skin[] {
  const type = filters.deviceType ?? "phone";
  const list = SKINS.filter(
    (s) =>
      (!filters.deviceType || s.deviceTypes.includes(filters.deviceType)) &&
      (!filters.categoryIds?.length ||
        filters.categoryIds.includes(s.categoryId)) &&
      (!filters.materials?.length || filters.materials.includes(s.material)) &&
      (!filters.finishes?.length || filters.finishes.includes(s.finish)) &&
      (filters.maxPrice == null || discountedPrice(s, type) <= filters.maxPrice) &&
      (filters.minRating == null || s.rating >= filters.minRating) &&
      (!filters.inStockOnly || s.inStock)
  );
  const sorted = sortSkins(list, filters.sort, type);
  return filters.limit ? sorted.slice(0, filters.limit) : sorted;
}

export function getSkinsForModel(
  model: DeviceModel,
  filters: Omit<SkinFilters, "deviceType"> = {}
): Skin[] {
  return getSkins({ ...filters, deviceType: model.type }).filter((s) =>
    matchesModel(s, model)
  );
}

export function countForModel(model: DeviceModel): number {
  return SKINS.filter((s) => matchesModel(s, model)).length;
}

/** Lowest discounted price among skins cut for this model. */
export function fromPriceForModel(model: DeviceModel): number {
  const skins = getSkinsForModel(model);
  if (skins.length === 0) return 0;
  const type = model.type;
  let min = discountedPrice(skins[0], type);
  for (let i = 1; i < skins.length; i++) {
    const price = discountedPrice(skins[i], type);
    if (price < min) min = price;
  }
  return min;
}

export function getSkinBySlug(slug: string): Skin | undefined {
  return SKINS.find((s) => s.slug === slug);
}

export function getSkinById(id: string): Skin | undefined {
  return SKINS.find((s) => s.id === id);
}

/** All skins — used for static generation of product routes */
export const SKINS_ALL = (): Skin[] => SKINS;

/** Devices a given skin is available for */
export function compatibleModels(skin: Skin): DeviceModel[] {
  return DEVICES.filter((d) => matchesModel(skin, d));
}

export function relatedSkins(skin: Skin, limit = 4): Skin[] {
  const sameCat = SKINS.filter(
    (s) => s.id !== skin.id && s.categoryId === skin.categoryId
  );
  const samePattern = SKINS.filter(
    (s) =>
      s.id !== skin.id &&
      s.categoryId !== skin.categoryId &&
      s.pattern === skin.pattern
  );
  const fallback = [...SKINS]
    .filter((s) => s.id !== skin.id)
    .sort((a, b) => b.popularity - a.popularity);
  return [...sameCat, ...samePattern, ...fallback].slice(0, limit);
}

export function alsoBought(limit = 4): Skin[] {
  return [...SKINS].sort((a, b) => b.reviews - a.reviews).slice(0, limit);
}

export function featuredSkins(limit = 8): Skin[] {
  return getSkins({ sort: "featured", limit });
}

export function newArrivals(limit = 8): Skin[] {
  const fresh = getSkins({ sort: "newest" });
  return fresh.slice(0, limit);
}

export function offerSkins(limit = 8): Skin[] {
  return SKINS.filter((s) => s.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, limit);
}

export const getCoupons = (): Coupon[] => COUPONS;

/* ---------------- Global search ---------------- */

export interface SearchResults {
  devices: DeviceModel[];
  brands: Brand[];
  categories: DesignCategory[];
  skins: Skin[];
}

export function search(qRaw: string): SearchResults {
  const q = qRaw.trim().toLowerCase();
  if (!q) return { devices: [], brands: [], categories: [], skins: [] };
  return {
    devices: DEVICES.filter((d) =>
      `${brandOf(d).name} ${d.name}`.toLowerCase().includes(q)
    ).slice(0, 6),
    brands: BRANDS.filter((b) => b.name.toLowerCase().includes(q)),
    categories: DESIGN_CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(q)
    ),
    skins: SKINS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6),
  };
}
