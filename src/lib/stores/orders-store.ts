"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

interface OrdersState {
  orders: Order[];
  place: (order: Order) => void;
  advanceStatus: (id: string) => void;
  cancel: (id: string) => void;
}

function nextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "Cancelled" || status === "Delivered") return null;
  const idx = ORDER_STATUSES.indexOf(status as (typeof ORDER_STATUSES)[number]);
  return idx < 0 ? null : ORDER_STATUSES[idx + 1] ?? null;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      place: (order) => set((s) => ({ orders: [order, ...s.orders] })),
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
