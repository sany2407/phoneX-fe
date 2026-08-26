"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedDesign } from "@/lib/types";

interface DesignsState {
  designs: SavedDesign[];
  upsert: (design: SavedDesign) => void;
  remove: (id: string) => void;
}

export const useDesigns = create<DesignsState>()(
  persist(
    (set) => ({
      designs: [],
      upsert: (design) =>
        set((s) => ({
          designs: [design, ...s.designs.filter((d) => d.id !== design.id)],
        })),
      remove: (id) =>
        set((s) => ({ designs: s.designs.filter((d) => d.id !== id) })),
    }),
    { name: "phonex-designs-v1" }
  )
);
