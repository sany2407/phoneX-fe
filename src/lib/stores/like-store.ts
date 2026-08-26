"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LikeState {
  liked: boolean;
  count: number;
  toggle: () => void;
}

export const useLike = create<LikeState>()(
  persist(
    (set) => ({
      liked: false,
      count: 0,
      toggle: () =>
        set((s) =>
          s.liked
            ? { liked: false, count: Math.max(0, s.count - 1) }
            : { liked: true, count: s.count + 1 }
        ),
    }),
    { name: "phonex-site-like-v1" }
  )
);
