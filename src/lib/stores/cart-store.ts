"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "@/lib/services/cart.service";
import { tokenStore } from "@/lib/api-client";
import type { ApiCart, ApiCartItem } from "@/lib/api-types";
import type { CartItem } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartState {
  /** Server-cart items — populated when the user is signed in */
  items: CartItem[];
  /** "Save for later" list — always local */
  saved: CartItem[];
  /** True while any cart API call is in-flight */
  syncing: boolean;
  /** Last server error message, if any */
  error: string | null;

  // Mutations
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => Promise<void>;
  remove: (key: string) => Promise<void>;
  setQty: (key: string, qty: number) => Promise<void>;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  clear: () => Promise<void>;

  // Server-sync helpers
  syncFromServer: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
}

// ---------------------------------------------------------------------------
// Adapter: API cart item → frontend CartItem
// ---------------------------------------------------------------------------

function toCartItem(apiItem: ApiCartItem): CartItem {
  const { product, deviceModel } = apiItem.variant;
  return {
    // Use the server-side cart item id as the key so mutations can reference it
    key: apiItem.id,
    kind: "skin",
    title: product.name,
    subtitle: deviceModel.name,
    deviceId: deviceModel.id,
    deviceName: deviceModel.name,
    unitPrice: apiItem.unitPrice,
    qty: apiItem.quantity,
    thumb: product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url,
    refId: apiItem.variantId,
  };
}

function apiCartToItems(apiCart: ApiCart): CartItem[] {
  return apiCart.items.map(toCartItem);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isAuthenticated = () => Boolean(tokenStore.getAccess());

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      saved: [],
      syncing: false,
      error: null,

      // ----------------------------------------------------------------
      // Add — optimistic local update, then sync to server
      // ----------------------------------------------------------------

      add: async (item) => {
        const { qty = 1, ...rest } = item;

        // Optimistic update
        set((s) => {
          const existing = s.items.find((i) => i.key === rest.key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === rest.key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...s.items, { ...rest, qty }] };
        });

        if (!isAuthenticated() || !item.refId) return;

        set({ syncing: true, error: null });
        try {
          const cart = await cartService.addItem({
            variantId: item.refId,
            quantity: qty,
          });
          set({ items: apiCartToItems(cart), syncing: false });
        } catch (err) {
          set({
            syncing: false,
            error: err instanceof Error ? err.message : "Failed to update cart",
          });
        }
      },

      // ----------------------------------------------------------------
      // Remove
      // ----------------------------------------------------------------

      remove: async (key) => {
        // Optimistic
        set((s) => ({ items: s.items.filter((i) => i.key !== key) }));

        if (!isAuthenticated()) return;

        set({ syncing: true, error: null });
        try {
          const cart = await cartService.removeItem(key);
          set({ items: apiCartToItems(cart), syncing: false });
        } catch (err) {
          set({
            syncing: false,
            error: err instanceof Error ? err.message : "Failed to remove item",
          });
        }
      },

      // ----------------------------------------------------------------
      // Set quantity
      // ----------------------------------------------------------------

      setQty: async (key, qty) => {
        const clamped = Math.max(1, Math.min(9, qty));

        // Optimistic
        set((s) => ({
          items: s.items.map((i) =>
            i.key === key ? { ...i, qty: clamped } : i
          ),
        }));

        if (!isAuthenticated()) return;

        set({ syncing: true, error: null });
        try {
          const cart = await cartService.updateItem(key, {
            quantity: clamped,
          });
          set({ items: apiCartToItems(cart), syncing: false });
        } catch (err) {
          set({
            syncing: false,
            error: err instanceof Error ? err.message : "Failed to update quantity",
          });
        }
      },

      // ----------------------------------------------------------------
      // Save for later / move to cart — always local
      // ----------------------------------------------------------------

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
        set((s) => ({ saved: s.saved.filter((i) => i.key !== key) })),

      // ----------------------------------------------------------------
      // Clear entire cart
      // ----------------------------------------------------------------

      clear: async () => {
        set({ items: [] });

        if (!isAuthenticated()) return;

        set({ syncing: true, error: null });
        try {
          await cartService.clear();
          set({ syncing: false });
        } catch (err) {
          set({
            syncing: false,
            error: err instanceof Error ? err.message : "Failed to clear cart",
          });
        }
      },

      // ----------------------------------------------------------------
      // Full sync from server (call on page load / after login)
      // ----------------------------------------------------------------

      syncFromServer: async () => {
        if (!isAuthenticated()) return;

        set({ syncing: true, error: null });
        try {
          const cart = await cartService.get();
          set({ items: apiCartToItems(cart), syncing: false });
        } catch {
          // Non-fatal — keep local items
          set({ syncing: false });
        }
      },

      setItems: (items) => set({ items }),
    }),
    { name: "phonex-cart-v1" }
  )
);

// ---------------------------------------------------------------------------
// Pure totals helper (unchanged API — used by checkout page)
// ---------------------------------------------------------------------------

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
  return { subtotal, count, shipping, total: subtotal + shipping };
}
