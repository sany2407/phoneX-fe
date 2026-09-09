import { api } from "@/lib/api-client";
import type { ValidateCouponPayload, ValidateCouponResponse } from "@/lib/api-types";

export const couponsService = {
  /** POST /coupons/validate */
  validate(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
    return api.post<ValidateCouponResponse>("/coupons/validate", payload);
  },
};
