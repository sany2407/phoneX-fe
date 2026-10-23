"use client";

/**
 * Coupons store (Zustand).
 *
 * Holds the public coupon list (`GET /coupons`) and the result of the most
 * recent code validation (`POST /coupons/validate`), so the checkout page and
 * the offers/marquee surfaces share one cache.
 */

import { create } from "zustand";
import { couponsService } from "@/lib/services/coupons.service";
import type { ApiCoupon, ValidateCouponResponse } from "@/lib/api-types";

interface CouponsState {
  publicCoupons: ApiCoupon[];
  loading: boolean;
  loaded: boolean;

  /** Result of the last successful validation (checkout). */
  applied: ValidateCouponResponse | null;
  applying: boolean;

  loadPublic: (opts?: { force?: boolean }) => Promise<void>;
  apply: (code: string, subtotal: number) => Promise<ValidateCouponResponse>;
  clearApplied: () => void;
}

export const useCoupons = create<CouponsState>()((set, get) => ({
  publicCoupons: [],
  loading: false,
  loaded: false,
  applied: null,
  applying: false,

  loadPublic: async (opts) => {
    if (get().loading) return;
    if (get().loaded && !opts?.force) return;
    set({ loading: true });
    try {
      const items = await couponsService.getAll();
      set({ publicCoupons: items, loading: false, loaded: true });
    } catch {
      set({ loading: false, loaded: true });
    }
  },

  apply: async (code, subtotal) => {
    set({ applying: true });
    try {
      const result = await couponsService.validate({ code: code.trim().toUpperCase(), subtotal });
      set({ applied: result, applying: false });
      return result;
    } catch (err) {
      set({ applying: false });
      throw err;
    }
  },

  clearApplied: () => set({ applied: null }),
}));
