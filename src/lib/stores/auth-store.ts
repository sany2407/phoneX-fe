"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "@/lib/types";

export interface User {
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  addresses: Address[];
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<User>) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      addresses: [],
      signIn: (email, name) =>
        set((s) => ({
          user: {
            email,
            name: name?.trim() || email.split("@")[0].replace(/[._]/g, " "),
            phone: s.user?.phone,
          },
        })),
      signOut: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      addAddress: (address) =>
        set((s) => ({
          addresses: [
            { ...address, id: uid(), isDefault: s.addresses.length === 0 },
            ...(s.addresses.length === 0 ? [] : s.addresses),
          ],
        })),
      removeAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
        })),
      setDefaultAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),
    }),
    { name: "phonex-auth-v1" }
  )
);

export const uid32 = uid;
