import type { MetadataRoute } from "next";
import {
  getBrands,
  getCategories,
  getModels,
  SKINS_ALL,
} from "@/lib/api";

const BASE = "https://phonex.in";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const products = SKINS_ALL().map((s) => ({
    url: `${BASE}/products/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categories = getCategories().map((c) => ({
    url: `${BASE}/designs/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const deviceSegments = ["phones", "laptops", ...getBrands().map((b) => b.slug)].map(
    (slug) => ({
      url: `${BASE}/devices/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  );

  const models = getModels().flatMap((m) => {
    const brand = getBrands().find((b) => b.id === m.brandId)!;
    return [
      {
        url: `${BASE}/devices/${brand.slug}/${m.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ];
  });

  return [...staticRoutes, ...products, ...categories, ...deviceSegments, ...models];
}
