import type { DeviceType, SortKey } from "@/lib/types";

export interface CatalogQuery {
  type?: DeviceType;
  categories: string[];
  materials: string[];
  finishes: string[];
  maxPrice?: number;
  rating?: number;
  stock: boolean;
  sort: SortKey;
  page: number;
  q?: string;
}

export const PAGE_SIZE = 16;

/** Next 16 searchParams is a Promise<Record<string, string | string[] | undefined>> */
export function parseCatalogQuery(
  sp: Record<string, string | string[] | undefined>
): CatalogQuery {
  const one = (key: string): string | undefined => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const many = (key: string): string[] => {
    const v = sp[key];
    if (!v) return [];
    return Array.isArray(v)
      ? v.flatMap((x) => x.split(","))
      : v.split(",").filter(Boolean);
  };
  const type = one("type");
  const sort = one("sort") as SortKey | undefined;
  const maxPriceRaw = Number(one("maxPrice"));
  const ratingRaw = Number(one("rating"));
  return {
    type:
      type === "phone" || type === "laptop" || type === "tablet" ? (type as DeviceType) : undefined,
    categories: many("category"),
    materials: many("material"),
    finishes: many("finish"),
    maxPrice: maxPriceRaw > 0 && isFinite(maxPriceRaw) ? maxPriceRaw : undefined,
    rating: ratingRaw > 0 && isFinite(ratingRaw) ? ratingRaw : undefined,
    stock: one("stock") === "1",
    sort: (["featured", "newest", "popular", "price-asc", "price-desc", "rating"] as SortKey[]).includes(sort as SortKey)
      ? sort!
      : "featured",
    page: Math.max(1, Number(one("page")) || 1),
    q: one("q"),
  };
}

export function buildCatalogHref(
  base: string,
  current: URLSearchParams,
  patch: Record<string, string | null>
): string {
  const params = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v == null || v === "") params.delete(k);
    else params.set(k, v);
  }
  if (!("page" in patch)) params.delete("page");
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}
