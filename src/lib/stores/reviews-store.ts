"use client";

/**
 * Product reviews store (Zustand).
 *
 * Caches approved reviews per product (the public `GET
 * /products/:productId/reviews` response) and exposes the authenticated
 * create / update / delete mutations.
 *
 * Note: new reviews are created with `isApproved = false` and only appear in
 * this list after an admin approves them — mirror that in the UI.
 */

import { create } from "zustand";
import { reviewsService } from "@/lib/services/reviews.service";
import type {
  ApiReview,
  CreateReviewPayload,
  UpdateReviewPayload,
} from "@/lib/api-types";

interface ProductReviews {
  reviews: ApiReview[];
  average: number;
  total: number;
  loading: boolean;
  loaded: boolean;
}

const EMPTY: ProductReviews = {
  reviews: [],
  average: 0,
  total: 0,
  loading: false,
  loaded: false,
};

interface ReviewsState {
  byProduct: Record<string, ProductReviews>;
  loadForProduct: (productId: string, opts?: { force?: boolean }) => Promise<void>;
  create: (productId: string, payload: CreateReviewPayload) => Promise<ApiReview>;
  update: (productId: string, reviewId: string, payload: UpdateReviewPayload) => Promise<ApiReview>;
  remove: (productId: string, reviewId: string) => Promise<void>;
}

export const useReviews = create<ReviewsState>()((set, get) => ({
  byProduct: {},

  loadForProduct: async (productId, opts) => {
    const current = get().byProduct[productId] ?? EMPTY;
    if (current.loading) return;
    if (current.loaded && !opts?.force) return;

    set((s) => ({
      byProduct: {
        ...s.byProduct,
        [productId]: { ...current, loading: true },
      },
    }));

    try {
      const res = await reviewsService.getForProduct(productId, { limit: 50 });
      set((s) => ({
        byProduct: {
          ...s.byProduct,
          [productId]: {
            reviews: res.reviews ?? [],
            average: Number(res.ratingSummary?.average ?? 0),
            total: Number(res.ratingSummary?.total ?? res.reviews?.length ?? 0),
            loading: false,
            loaded: true,
          },
        },
      }));
    } catch {
      set((s) => ({
        byProduct: {
          ...s.byProduct,
          [productId]: { ...current, loading: false, loaded: true },
        },
      }));
    }
  },

  create: async (productId, payload) => {
    const review = await reviewsService.create(productId, payload);
    // Not shown publicly until approved — don't inject into the list.
    return review;
  },

  update: async (productId, reviewId, payload) => {
    const updated = await reviewsService.update(reviewId, payload);
    set((s) => {
      const bucket = s.byProduct[productId];
      if (!bucket) return s;
      return {
        byProduct: {
          ...s.byProduct,
          [productId]: {
            ...bucket,
            reviews: bucket.reviews.map((r) => (r.id === reviewId ? updated : r)),
          },
        },
      };
    });
    return updated;
  },

  remove: async (productId, reviewId) => {
    await reviewsService.delete(reviewId);
    set((s) => {
      const bucket = s.byProduct[productId];
      if (!bucket) return s;
      const reviews = bucket.reviews.filter((r) => r.id !== reviewId);
      return {
        byProduct: {
          ...s.byProduct,
          [productId]: {
            ...bucket,
            reviews,
            total: Math.max(0, bucket.total - 1),
          },
        },
      };
    });
  },
}));
