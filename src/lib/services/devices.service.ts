import { api } from "@/lib/api-client";
import type { ApiBrand, ApiDeviceModel, ApiVariant } from "@/lib/api-types";

export const devicesService = {
  /** GET /devices/brands */
  getBrands(): Promise<ApiBrand[]> {
    return api.get<ApiBrand[]>("/devices/brands", { public: true });
  },

  /** GET /devices/brands/:brandSlug */
  getBrandBySlug(brandSlug: string): Promise<ApiBrand> {
    return api.get<ApiBrand>(`/devices/brands/${brandSlug}`, { public: true });
  },

  /** GET /devices/brands/:brandSlug/models */
  getModelsForBrand(brandSlug: string): Promise<ApiDeviceModel[]> {
    return api.get<ApiDeviceModel[]>(`/devices/brands/${brandSlug}/models`, {
      public: true,
    });
  },

  /** GET /devices/brands/:brandSlug/models/:modelSlug */
  getModel(brandSlug: string, modelSlug: string): Promise<ApiDeviceModel> {
    return api.get<ApiDeviceModel>(
      `/devices/brands/${brandSlug}/models/${modelSlug}`,
      { public: true }
    );
  },

  /** GET /devices/brands/:brandSlug/models/:modelSlug/skins */
  getSkinsForModel(
    brandSlug: string,
    modelSlug: string
  ): Promise<ApiVariant[]> {
    return api.get<ApiVariant[]>(
      `/devices/brands/${brandSlug}/models/${modelSlug}/skins`,
      { public: true }
    );
  },

  /**
   * Fetch all models across all brands in one shot.
   * Calls GET /devices/brands (with models included) or falls back to
   * fetching each brand's models individually.
   */
  async getAllModels(): Promise<ApiDeviceModel[]> {
    const brands = await api.get<ApiBrand[]>("/devices/brands", { public: true });
    const results = await Promise.all(
      brands.map((b) =>
        api
          .get<ApiDeviceModel[]>(`/devices/brands/${b.slug}/models`, { public: true })
          .catch(() => [] as ApiDeviceModel[])
      )
    );
    return results.flat();
  },
};
