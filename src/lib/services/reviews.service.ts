import { api } from "@/lib/api-client";
import type {
  ApiReview,
  CreateReviewPayload,
  UpdateReviewPayload,
  ProductReviewsResponse,
} from "@/lib/api-types";

export const reviewsService = {
  /**
   * GET /products/:productId/reviews
   * Backend returns `{ reviews, ratingSummary }` (only approved reviews).
   */
  getForProduct(
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ProductReviewsResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString() ? `?${qs}` : "";
    return api.get<ProductReviewsResponse>(
      `/products/${productId}/reviews${q}`,
      { public: true }
    );
  },

  /** POST /products/:productId/reviews */
  create(productId: string, payload: CreateReviewPayload): Promise<ApiReview> {
    return api.post<ApiReview>(`/products/${productId}/reviews`, payload);
  },

  /** PUT /reviews/:id */
  update(id: string, payload: UpdateReviewPayload): Promise<ApiReview> {
    return api.put<ApiReview>(`/reviews/${id}`, payload);
  },

  /** DELETE /reviews/:id */
  delete(id: string): Promise<void> {
    return api.delete<void>(`/reviews/${id}`);
  },
};
