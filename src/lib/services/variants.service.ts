import { api } from "@/lib/api-client";
import type { ApiDeviceModel, ApiVariant } from "@/lib/api-types";

export interface SkinsForModel {
  model: ApiDeviceModel & { brand?: { id: string; name: string; slug: string } };
  variants: (ApiVariant & {
    product?: {
      id: string;
      name: string;
      slug: string;
      material: string;
      finish: string;
      rating: number;
      reviewCount: number;
      images: string[];
      category?: { id: string; name: string; slug: string } | null;
    } | null;
  })[];
}

export const variantsService = {
  /** GET /variants/:id */
  getById(id: string): Promise<ApiVariant> {
    return api.get<ApiVariant>(`/variants/${id}`, { public: true });
  },

  /** GET /variants/skins/:brandSlug/:modelSlug — variants + products for a model */
  getSkinsForModel(brandSlug: string, modelSlug: string): Promise<SkinsForModel> {
    return api.get<SkinsForModel>(`/variants/skins/${brandSlug}/${modelSlug}`, {
      public: true,
    });
  },
};
