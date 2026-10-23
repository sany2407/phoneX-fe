"use client";

/**
 * Addresses store (Zustand) — the single source of truth for the signed-in
 * customer's saved addresses. Backed by `/addresses` (see api-docs.json).
 */

import { create } from "zustand";
import { addressesService } from "@/lib/services/addresses.service";
import { tokenStore } from "@/lib/api-client";
import type { AddressPayload, ApiAddress } from "@/lib/api-types";

function sortAddresses(list: ApiAddress[]): ApiAddress[] {
  return [...list].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

interface AddressesState {
  items: ApiAddress[];
  loading: boolean;
  error: string | null;
  loaded: boolean;

  fetchAll: (opts?: { force?: boolean }) => Promise<void>;
  create: (payload: AddressPayload) => Promise<ApiAddress>;
  update: (id: string, payload: Partial<AddressPayload>) => Promise<ApiAddress>;
  remove: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAddresses = create<AddressesState>()((set, get) => ({
  items: [],
  loading: false,
  error: null,
  loaded: false,

  fetchAll: async (opts) => {
    if (!tokenStore.getAccess()) {
      set({ items: [], loaded: true });
      return;
    }
    if (get().loaded && !opts?.force) return;

    set({ loading: true, error: null });
    try {
      const items = await addressesService.getAll();
      set({ items: sortAddresses(items), loading: false, loaded: true });
    } catch (err) {
      set({
        loading: false,
        loaded: true,
        error: err instanceof Error ? err.message : "Failed to load addresses",
      });
    }
  },

  create: async (payload) => {
    const created = await addressesService.create(payload);
    set((s) => ({ items: sortAddresses([created, ...s.items]) }));
    return created;
  },

  update: async (id, payload) => {
    const updated = await addressesService.update(id, payload);
    set((s) => ({
      items: sortAddresses(s.items.map((a) => (a.id === id ? updated : a))),
    }));
    return updated;
  },

  remove: async (id) => {
    const prev = get().items;
    set((s) => ({ items: s.items.filter((a) => a.id !== id) }));
    try {
      await addressesService.delete(id);
    } catch (err) {
      set({ items: prev }); // revert on failure
      throw err;
    }
  },

  setDefault: async (id) => {
    const updated = await addressesService.setDefault(id);
    set((s) => ({
      items: sortAddresses(
        s.items.map((a) => (a.id === id ? updated : { ...a, isDefault: false }))
      ),
    }));
  },

  reset: () => set({ items: [], loaded: false, error: null }),
}));
