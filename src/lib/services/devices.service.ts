import { api } from "@/lib/api-client";
import type { ApiBrand, ApiDeviceModel, ApiDeviceType, ApiVariant } from "@/lib/api-types";

export const devicesService = {
  /** GET /devices/types — Smartphone, Laptop, Tablet… */
  getDeviceTypes(opts?: { revalidate?: number }): Promise<ApiDeviceType[]> {
    return api.get<ApiDeviceType[]>("/devices/types", {
      public: true,
      ...(opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : {}),
    });
  },

  /** GET /devices/types/:typeSlug/models — all models of a type, cross-brand */
  getModelsByType(typeSlug: string): Promise<ApiDeviceModel[]> {
    return api.get<ApiDeviceModel[]>(`/devices/types/${typeSlug}/models`, {
      public: true,
    });
  },

  /** GET /devices/brands */
  getBrands(opts?: { revalidate?: number }): Promise<ApiBrand[]> {
    return api.get<ApiBrand[]>("/devices/brands", {
      public: true,
      ...(opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : {}),
    });
  },

  /** GET /devices/brands/:brandSlug */
  getBrandBySlug(brandSlug: string): Promise<ApiBrand> {
    return api.get<ApiBrand>(`/devices/brands/${brandSlug}`, { public: true });
  },

  /** GET /devices/brands/:brandSlug/models — optionally filtered by device type slug */
  getModelsForBrand(brandSlug: string, typeSlug?: string): Promise<ApiDeviceModel[]> {
    const url =
      `/devices/brands/${brandSlug}/models` +
      (typeSlug ? `?type=${encodeURIComponent(typeSlug)}` : "");
    return api.get<ApiDeviceModel[]>(url, { public: true });
  },

  /** GET /devices/brands/:brandSlug/models/:modelSlug */
  getModel(brandSlug: string, modelSlug: string): Promise<ApiDeviceModel> {
    return api.get<ApiDeviceModel>(
      `/devices/brands/${brandSlug}/models/${modelSlug}`,
      { public: true }
    );
  },

  /**
   * GET /variants/skins/:brandSlug/:modelSlug
   * Skins for a model live under /variants, not /devices.
   */
  async getSkinsForModel(
    brandSlug: string,
    modelSlug: string
  ): Promise<ApiVariant[]> {
    const res = await api.get<ApiVariant[] | { variants: ApiVariant[] }>(
      `/variants/skins/${brandSlug}/${modelSlug}`,
      { public: true }
    );
    return Array.isArray(res) ? res : (res.variants ?? []);
  },

  /**
   * Fetch every active model across all brands, each with its brand included.
   *
   * Strategy: `GET /devices/types` (each type carries its model count) followed
   * by one `GET /devices/types/:slug/models` per non-empty type — currently ~4
   * requests total.
   *
   * Do NOT fan out one request per brand: with ~25 brands that is 26 requests
   * per call and trips the API rate limiter (200 req / 15 min).
   *
   * Failures propagate. This used to `catch` and return `[]`, which made a
   * rate-limited or unreachable API indistinguishable from an empty catalog —
   * the store reported "ready" with no models and the UI confidently rendered
   * "No models found".
   */
  async getAllModels(): Promise<ApiDeviceModel[]> {
    const types = await devicesService.getDeviceTypes();
    const relevant = types.filter(
      (t) => !t._count || (t._count.models ?? 0) > 0
    );
    const lists = await Promise.all(
      relevant.map((t) => devicesService.getModelsByType(t.slug))
    );
    return lists.flat();
  },
};
