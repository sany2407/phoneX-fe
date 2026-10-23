import type { MetadataRoute } from "next";

const BASE = "https://phonex.in";
const API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function get<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data ?? json;
    return Array.isArray(items) ? (items as T[]) : [];
  } catch {
    return [];
  }
}

type SlugRow = { slug: string };
type BrandRow = { id: string; slug: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/shop",
    "/designs",
    "/devices",
    "/customize",
    "/offers",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const [products, categories, brands, types] = await Promise.all([
    get<SlugRow>("/products?limit=100"),
    get<SlugRow>("/categories"),
    get<BrandRow>("/devices/brands"),
    get<{ slug: string }>("/devices/types"),
  ]);

  // Product + brand slugs for model URLs
  const modelsByBrand = await Promise.all(
    brands.map(async (b) => ({
      brand: b,
      models: await get<SlugRow>(`/devices/brands/${b.slug}/models`),
    }))
  );

  const productUrls = products.map((s) => ({
    url: `${BASE}/products/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${BASE}/designs/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const deviceSegments = [
    "phones",
    "tablets",
    "laptops",
    ...types.map((t) => t.slug),
    ...brands.map((b) => b.slug),
  ].map((slug) => ({
    url: `${BASE}/devices/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const modelUrls = modelsByBrand.flatMap(({ brand, models }) =>
    models.map((m) => ({
      url: `${BASE}/devices/${brand.slug}/${m.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [...staticRoutes, ...productUrls, ...categoryUrls, ...deviceSegments, ...modelUrls];
}
