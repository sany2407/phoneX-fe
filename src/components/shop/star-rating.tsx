import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  reviews,
  size = "sm",
  className,
}: {
  rating: number;
  reviews?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "md" ? "size-4" : "size-3.5";
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <p className={cn("flex items-center gap-1.5", className)}>
      <span
        className="flex text-amber-500"
        role="img"
        aria-label={`Rated ${rating} out of 5`}
      >
        {Array.from({ length: 5 }, (_, i) =>
          i < full ? (
            <Star key={i} className={cn(px, "fill-current")} />
          ) : i === full && half ? (
            <StarHalf key={i} className={cn(px, "fill-current")} />
          ) : (
            <Star key={i} className={cn(px, "text-muted-foreground/40 fill-transparent")} />
          )
        )}
      </span>
      <span className={cn("font-medium", size === "md" ? "text-sm" : "text-xs")}>
        {rating.toFixed(1)}
      </span>
      {reviews != null && (
        <span className="text-xs text-muted-foreground">({reviews.toLocaleString("en-IN")})</span>
      )}
    </p>
  );
}
