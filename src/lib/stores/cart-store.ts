"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
  saved: CartItem[];
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      saved: [],
      add: (item) => {
        const { qty = 1, ...rest } = item;
        set((s) => {
          const existing = s.items.find((i) => i.key === rest.key);
          if (existing) {
            return {
              ...s,
              items: s.items.map((i) =>
                i.key === rest.key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { ...s, items: [...s.items, { ...rest, qty }] };
        });
      },
      remove: (key) =>
        set((s) => ({ ...s, items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          ...s,
          items: s.items.map((i) =>
            i.key === key ? { ...i, qty: Math.max(1, Math.min(9, qty)) } : i
          ),
        })),
      saveForLater: (key) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return;
        set((s) => ({
          items: s.items.filter((i) => i.key !== key),
          saved: [item, ...s.saved.filter((i) => i.key !== key)],
        }));
      },
      moveToCart: (key) => {
        const item = get().saved.find((i) => i.key === key);
        if (!item) return;
        set((s) => ({
          saved: s.saved.filter((i) => i.key !== key),
          items: s.items.some((i) => i.key === key)
            ? s.items
            : [...s.items, item],
        }));
      },
      removeSaved: (key) =>
        set((s) => ({ ...s, saved: s.saved.filter((i) => i.key !== key) })),
      clear: () => set((s) => ({ ...s, items: [] })),
    }),
    { name: "phonex-cart-v1" }
  )
);

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  return { subtotal, count, shipping, total: subtotal + shipping };
}
