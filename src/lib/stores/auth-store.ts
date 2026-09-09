"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenStore } from "@/lib/api-client";
import { authService } from "@/lib/services/auth.service";
import type { ApiUser, RegisterPayload, LoginPayload } from "@/lib/api-types";
import type { Address } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Subset of ApiUser kept in client state */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: ApiUser["role"];
}

interface AuthState {
  user: User | null;
  addresses: Address[];

  // --- Auth actions (async — call real API) ---
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;

  // --- Profile helpers (still local; profile update endpoint not in spec) ---
  updateProfile: (patch: Partial<Omit<User, "id" | "role">>) => void;

  // --- Address helpers (delegate to addressesService in components) ---
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Omit<Address, "id"> | Address) => void;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  setDefaultAddress: (id: string) => void;

  // --- Internal ---
  signIn: (email: string, name?: string) => void; // kept for backwards compat
  signOut: () => void;
}

// ---------------------------------------------------------------------------
// Helper: map ApiUser → User
// ---------------------------------------------------------------------------

function toUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role: apiUser.role,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],

      // ----------------------------------------------------------------
      // Auth — real API
      // ----------------------------------------------------------------

      register: async (payload) => {
        const data = await authService.register(payload);
        tokenStore.setRole(data.user.role);
        set({ user: toUser(data.user) });
      },

      login: async (payload) => {
        const data = await authService.login(payload);
        tokenStore.setRole(data.user.role);
        set({ user: toUser(data.user) });
      },

      logout: async () => {
        await authService.logout();
        set({ user: null, addresses: [] });
      },

      fetchMe: async () => {
        const apiUser = await authService.me();
        set({ user: toUser(apiUser) });
      },

      forgotPassword: async (email) => {
        await authService.forgotPassword({ email });
      },

      resetPassword: async (token, password) => {
        await authService.resetPassword({ token, password });
      },

      // ----------------------------------------------------------------
      // Profile
      // ----------------------------------------------------------------

      updateProfile: (patch) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...patch } } : s
        ),

      // ----------------------------------------------------------------
      // Addresses (managed via addressesService; store is the cache)
      // ----------------------------------------------------------------

      setAddresses: (addresses) => set({ addresses }),

      addAddress: (address) =>
        set((s) => ({
          addresses: [
            { id: uid32(), ...address } as Address,
            ...s.addresses,
          ],
        })),

      removeAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
        })),

      updateAddress: (id, patch) =>
        set((s) => ({
          addresses: s.addresses.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        })),

      setDefaultAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

      // ----------------------------------------------------------------
      // Backwards-compat shims (used by existing non-migrated pages)
      // ----------------------------------------------------------------

      /** @deprecated  Use login() instead */
      signIn: (email, name) =>
        set((s) => ({
          user: s.user
            ? { ...s.user, email, name: name ?? s.user.name }
            : {
                id: "",
                email,
                name:
                  name?.trim() ||
                  email.split("@")[0].replace(/[._]/g, " "),
                role: "CUSTOMER" as const,
              },
        })),

      /** @deprecated  Use logout() instead */
      signOut: () => {
        tokenStore.clear();
        set({ user: null, addresses: [] });
      },
    }),
    {
      name: "phonex-auth-v1",
      // Don't persist the whole address list — re-fetch from API on mount
      partialize: (state) => ({
        user: state.user,
        addresses: state.addresses,
      }),
    }
  )
);

// Re-export uid for the handful of files that still import it from here
export function uid32(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
