import { api } from "@/lib/api-client";
import type {
  RazorpayOrderResponse,
  VerifyPaymentPayload,
  ApiPayment,
} from "@/lib/api-types";

export const paymentsService = {
  /** POST /payments/create — creates a Razorpay order for an existing phonex order */
  create(orderId: string): Promise<RazorpayOrderResponse> {
    return api.post<RazorpayOrderResponse>("/payments/create", { orderId });
  },

  /**
   * POST /payments/verify — verifies the Razorpay signature after the
   * in-browser payment SDK completes.
   */
  verify(payload: VerifyPaymentPayload): Promise<ApiPayment> {
    return api.post<ApiPayment>("/payments/verify", payload);
  },

  /** GET /payments/order/:orderId */
  getForOrder(orderId: string): Promise<ApiPayment> {
    return api.get<ApiPayment>(`/payments/order/${orderId}`);
  },
};
