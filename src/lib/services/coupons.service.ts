import { api } from "@/lib/api-client";
import type {
  ApiCoupon,
  ValidateCouponPayload,
  ValidateCouponResponse,
} from "@/lib/api-types";

export const couponsService = {
  /** GET /coupons — active, in-window coupons (public). */
  getAll(): Promise<ApiCoupon[]> {
    return api.get<ApiCoupon[]>("/coupons", { public: true });
  },

  /** POST /coupons/validate — requires auth; body is `{ code, subtotal }`. */
  validate(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
    return api.post<ValidateCouponResponse>("/coupons/validate", payload);
  },
};
