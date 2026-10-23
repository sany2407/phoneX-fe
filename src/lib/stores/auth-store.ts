"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokenStore } from "@/lib/api-client";
import { authService } from "@/lib/services/auth.service";
import type { ApiUser, RegisterPayload, LoginPayload } from "@/lib/api-types";

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

  // --- Auth actions (async — call real API) ---
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;

  // --- Profile (local cache only; no profile endpoint in the spec) ---
  updateProfile: (patch: Partial<Omit<User, "id" | "role">>) => void;

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
    (set) => ({
      user: null,

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
        set({ user: null });
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
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),

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
        set({ user: null });
      },
    }),
    {
      name: "phonex-auth-v1",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
