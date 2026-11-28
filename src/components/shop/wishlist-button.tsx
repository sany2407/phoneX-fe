"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { cn } from "@/lib/utils";

export function WishlistButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const active = useWishlist((s) => s.slugs.includes(slug));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        "press grid size-9 place-items-center rounded-full border bg-background/85 backdrop-blur transition-colors hover:bg-background",
        active
          ? "border-rose-500/40 text-rose-600"
          : "text-foreground/70 hover:text-rose-600",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
        toast.success(
          active ? `${name} removed from wishlist` : `${name} saved to wishlist`
        );
      }}
    >
      <Heart
        className={cn("size-4 transition-colors", active && "heart-pop fill-current")}
      />
    </button>
  );
}
