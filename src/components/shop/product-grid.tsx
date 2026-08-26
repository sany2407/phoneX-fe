import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import type { DeviceType, Skin } from "@/lib/types";

export function ProductGrid({
  skins,
  deviceType,
  columns = 4,
}: {
  skins: Skin[];
  deviceType?: DeviceType;
  columns?: 3 | 4 | 5;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-6",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "md:grid-cols-3 lg:grid-cols-4",
        columns === 5 && "md:grid-cols-3 lg:grid-cols-5"
      )}
    >
      {skins.map((skin) => (
        <ProductCard key={skin.id} skin={skin} deviceType={deviceType} />
      ))}
    </div>
  );
}
