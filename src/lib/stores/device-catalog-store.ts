"use client";

/**
 * Device-catalog store (Zustand).
 *
 * Centralises the live brand/model catalog used by the picker, finder, search
 * and studio. It fetches once, caches the result, and de-duplicates concurrent
 * loaders.
 *
 * Requests are made **per device type** (`GET /devices/types/:slug/models`,
 * which returns every model for a type *with its brand*), not per brand. With
 * ~25 brands the old per-brand strategy fired 26 requests per load and blew the
 * API rate limit (200 req / 15 min); the type strategy fires ~4.
 */

import { create } from "zustand";
import { devicesService } from "@/lib/services/devices.service";
import {
  toPickerModel,
  type DeviceKind,
  type PickerModel,
} from "@/lib/live-devices";
import type { ApiBrand } from "@/lib/api-types";

type CatalogStatus = "idle" | "loading" | "ready" | "error";

interface DeviceCatalogState {
  brands: ApiBrand[];
  models: PickerModel[];
  status: CatalogStatus;
  error: string | null;
  loadedAt: number | null;

  /** Fetch the catalog once. Pass `{ force: true }` to refetch. */
  load: (opts?: { force?: boolean }) => Promise<void>;

  // ---- derived selectors -------------------------------------------------
  modelsByKind: (kind: DeviceKind) => PickerModel[];
  brandsForKind: (kind: DeviceKind) => ApiBrand[];
  getModel: (id: string) => PickerModel | undefined;
  findModel: (brandSlug: string, modelSlug: string) => PickerModel | undefined;
  searchModels: (query: string, limit?: number) => PickerModel[];
  countByKind: () => Record<string, number>;
}

// Single in-flight promise shared across all callers so we never fire more
// than one catalog fetch at a time.
let inFlight: Promise<void> | null = null;

export const useDeviceCatalog = create<DeviceCatalogState>()((set, get) => ({
  brands: [],
  models: [],
  status: "idle",
  error: null,
  loadedAt: null,

  load: async (opts) => {
    const { status } = get();
    if (!opts?.force) {
      if (inFlight) return inFlight;
      if (status === "ready") return;
    }

    set({ status: "loading", error: null });

    inFlight = (async () => {
      try {
        // Type-based sweep: ~4 requests total (never one request per brand).
        const rawModels = (await devicesService.getAllModels()).filter(
          (m) => m.isActive !== false
        );

        // Derive the brand list from the models (each model includes its brand),
        // so we don't need a separate /devices/brands request.
        const brandMap = new Map<string, ApiBrand>();
        const models: PickerModel[] = [];
        for (const m of rawModels) {
          if (!m.brand) continue;
          if (!brandMap.has(m.brand.id)) brandMap.set(m.brand.id, m.brand);
          models.push(toPickerModel(m.brand, m));
        }

        const brands = [...brandMap.values()].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        set({ brands, models, status: "ready", loadedAt: Date.now(), error: null });
      } catch (err) {
        // Never let a failed fetch masquerade as an empty catalog: callers
        // branch on `status` so they can offer a retry instead of claiming
        // there are no devices.
        set({
          status: get().models.length > 0 ? "ready" : "error",
          error: err instanceof Error ? err.message : "Failed to load devices",
        });
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  },

  modelsByKind: (kind) => get().models.filter((m) => m.kind === kind),

  brandsForKind: (kind) => {
    const { brands, models } = get();
    return brands.filter((b) => models.some((m) => m.brandId === b.id && m.kind === kind));
  },

  getModel: (id) => get().models.find((m) => m.id === id),

  findModel: (brandSlug, modelSlug) =>
    get().models.find((m) => m.brandSlug === brandSlug && m.slug === modelSlug),

  searchModels: (query, limit = 8) => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return get()
      .models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.brandName.toLowerCase().includes(q)
      )
      .slice(0, limit);
  },

  countByKind: () => {
    const map: Record<string, number> = {};
    for (const m of get().models) map[m.kind] = (map[m.kind] ?? 0) + 1;
    return map;
  },
}));
