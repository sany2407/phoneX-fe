"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ordersService } from "@/lib/services/orders.service";
import { tokenStore } from "@/lib/api-client";
import type { ApiOrder, ApiOrderStatus } from "@/lib/api-types";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Adapter: map API order status → frontend OrderStatus
// ---------------------------------------------------------------------------

const STATUS_MAP: Record<ApiOrderStatus, OrderStatus> = {
  PENDING_PAYMENT: "Pending",
  CONFIRMED: "Confirmed",
  DESIGNING: "Designing",
  PRINTING: "Printing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function toFrontendOrder(apiOrder: ApiOrder): Order {
  const status = STATUS_MAP[apiOrder.status] ?? "Pending";
  const addr = apiOrder.shippingAddress;

  return {
    id: apiOrder.id,
    createdAt: new Date(apiOrder.createdAt).getTime(),
    items: apiOrder.items.map((item) => ({
      title: item.variant.product.name,
      subtitle: item.variant.deviceModel.name,
      deviceName: item.variant.deviceModel.name,
      unitPrice: item.unitPrice,
      qty: item.quantity,
      thumb: item.variant.product.images.find((img) => img.isPrimary)?.url,
    })),
    subtotal: apiOrder.subtotal,
    discount: apiOrder.discount,
    shipping: apiOrder.shipping,
    total: apiOrder.total,
    couponCode: apiOrder.couponCode,
    status,
    history: apiOrder.statusHistory.map((h) => ({
      status: STATUS_MAP[h.status] ?? "Pending",
      at: new Date(h.createdAt).getTime(),
    })),
    customer: {
      fullName: addr.fullName,
      email: apiOrder.userId, // email not in shipping addr; use userId as fallback
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    },
  };
}

// ---------------------------------------------------------------------------
// Status helpers (kept for compatibility with order-detail page)
// ---------------------------------------------------------------------------

function nextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "Cancelled" || status === "Delivered") return null;
  const idx = ORDER_STATUSES.indexOf(status as (typeof ORDER_STATUSES)[number]);
  return idx < 0 ? null : ORDER_STATUSES[idx + 1] ?? null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;

  // Actions
  place: (order: Order) => void;             // local-only fallback (checkout page uses directly)
  fetchOrders: () => Promise<void>;           // load from server
  cancelOrder: (id: string) => Promise<void>; // server cancel
  advanceStatus: (id: string) => void;        // local demo only
  cancel: (id: string) => void;              // local-only fallback
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,

      // ----------------------------------------------------------------
      // Local fallback — used when the checkout page places an order
      // directly (e.g. before the API response arrives)
      // ----------------------------------------------------------------

      place: (order) =>
        set((s) => ({ orders: [order, ...s.orders] })),

      // ----------------------------------------------------------------
      // Fetch all orders from the server
      // ----------------------------------------------------------------

      fetchOrders: async () => {
        if (!tokenStore.getAccess()) return;

        set({ loading: true, error: null });
        try {
          const paginated = await ordersService.getAll({ limit: 50 });
          const orders = paginated.items.map(toFrontendOrder);
          set({ orders, loading: false });
        } catch (err) {
          set({
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load orders",
          });
        }
      },

      // ----------------------------------------------------------------
      // Cancel an order via API
      // ----------------------------------------------------------------

      cancelOrder: async (id) => {
        // Optimistic update
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: "Cancelled" as OrderStatus,
                  history: [
                    ...o.history,
                    { status: "Cancelled" as OrderStatus, at: Date.now() },
                  ],
                }
              : o
          ),
        }));

        try {
          const updated = await ordersService.cancel(id);
          const frontendOrder = toFrontendOrder(updated);
          set((s) => ({
            orders: s.orders.map((o) =>
              o.id === id ? frontendOrder : o
            ),
          }));
        } catch (err) {
          // Revert optimistic update on failure
          await get().fetchOrders();
          throw err;
        }
      },

      // ----------------------------------------------------------------
      // Local-only demo helpers (kept for backwards compat)
      // ----------------------------------------------------------------

      advanceStatus: (id) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            const next = nextStatus(o.status);
            if (!next) return o;
            return {
              ...o,
              status: next,
              history: [...o.history, { status: next, at: Date.now() }],
            };
          }),
        })),

      cancel: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id && o.status !== "Delivered"
              ? {
                  ...o,
                  status: "Cancelled",
                  history: [
                    ...o.history,
                    { status: "Cancelled" as OrderStatus, at: Date.now() },
                  ],
                }
              : o
          ),
        })),
    }),
    { name: "phonex-orders-v1" }
  )
);
