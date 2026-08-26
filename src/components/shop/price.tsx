import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({
  price,
  original,
  size = "md",
  className,
}: {
  price: number;
  original?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-semibold tracking-tight",
          size === "lg" ? "text-price-point" : "text-[15px]"
        )}
      >
        {formatINR(price)}
      </span>
      {original != null && original > price && (
        <>
          <s className="text-xs font-medium text-muted-foreground/70">
            {formatINR(original)}
          </s>
          <span className="text-xs font-semibold text-sale">
            {Math.round(((original - price) / original) * 100)}% off
          </span>
        </>
      )}
    </p>
  );
}
