import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
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
        {Array.from({ length: 5 }, (_, i) => {
          if (i < full) {
            return <StarFilledIcon key={i} className={px} aria-hidden="true" />;
          }
          // Radix has no half-star glyph: clip a full star to its left half.
          if (i === full && half) {
            return (
              <span key={i} className="relative inline-flex" aria-hidden="true">
                <StarIcon className={cn(px, "text-muted-foreground/40")} />
                <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                  <StarFilledIcon className={px} />
                </span>
              </span>
            );
          }
          return (
            <StarIcon
              key={i}
              className={cn(px, "text-muted-foreground/40")}
              aria-hidden="true"
            />
          );
        })}
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
