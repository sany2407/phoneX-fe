"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "@/lib/services/wishlist.service";
import { tokenStore } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishlistState {
  /**
   * Set of variant IDs when the user is logged in (server-backed),
   * or product slugs when the user is a guest (local-only).
   */
  slugs: string[];

  // Mutations
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  has: (id: string) => boolean;

  // Server-sync
  syncFromServer: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isAuthenticated = () => Boolean(tokenStore.getAccess());

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],

      // ----------------------------------------------------------------
      // Toggle — add if absent, remove if present
      // ----------------------------------------------------------------

      toggle: async (id) => {
        const already = get().slugs.includes(id);

        // Optimistic update
        set((s) => ({
          slugs: already
            ? s.slugs.filter((x) => x !== id)
            : [id, ...s.slugs],
        }));

        if (!isAuthenticated()) return;

        try {
          if (already) {
            await wishlistService.remove(id);
          } else {
            await wishlistService.add(id);
          }
        } catch {
          // Revert on failure
          set((s) => ({
            slugs: already
              ? [id, ...s.slugs]
              : s.slugs.filter((x) => x !== id),
          }));
        }
      },

      // ----------------------------------------------------------------
      // Remove
      // ----------------------------------------------------------------

      remove: async (id) => {
        set((s) => ({ slugs: s.slugs.filter((x) => x !== id) }));

        if (!isAuthenticated()) return;

        try {
          await wishlistService.remove(id);
        } catch {
          // Best-effort — local state already updated
        }
      },

      has: (id) => get().slugs.includes(id),

      // ----------------------------------------------------------------
      // Full sync from server (call after login)
      // ----------------------------------------------------------------

      syncFromServer: async () => {
        if (!isAuthenticated()) return;
        try {
          const wishlist = await wishlistService.get();
          const ids = wishlist.items.map((item) => item.variantId);
          set({ slugs: ids });
        } catch {
          // Non-fatal — keep local slugs
        }
      },
    }),
    { name: "phonex-wishlist-v1" }
  )
);
