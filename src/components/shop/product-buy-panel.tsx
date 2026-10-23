"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { useCart } from "@/lib/stores/cart-store";
import { useProductSelection } from "@/lib/stores/product-selection-store";
import { toast } from "sonner";
import type { ApiProduct, ApiVariant } from "@/lib/api-types";
import { primaryImage } from "@/lib/product-utils";
import { formatINR } from "@/lib/utils";

export function ProductBuyPanel({ product }: { product: ApiProduct }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const selectVariant = useProductSelection((s) => s.select);

  const variants = useMemo(
    () => (product.variants ?? []).filter((v) => v.isActive),
    [product]
  );
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const variant: ApiVariant | undefined =
    variants.find((v) => v.id === variantId) ?? variants[0];

  const price = variant ? Number(variant.price) : NaN;
  const compare =
    variant?.comparePrice != null ? Number(variant.comparePrice) : NaN;
  const original = Number.isFinite(compare) && compare > price ? compare : undefined;
  const inStock = (variant?.stock ?? 0) > 0;
  const modelName = variant?.deviceModel
    ? `${variant.deviceModel.brand?.name ?? ""} ${variant.deviceModel.name}`.trim()
    : "";

  const addToCart = () => {
    if (!variant || !Number.isFinite(price)) return;
    add({
      key: `skin:${variant.id}`,
      kind: "skin",
      title: product.name,
      subtitle: modelName,
      deviceId: variant.deviceModelId,
      deviceName: modelName,
      unitPrice: price,
      thumb: variant.images?.[0] ?? primaryImage(product),
      refId: variant.id,
    });
    toast.success("Added to cart", {
      description: `${product.name} · ${modelName}`,
    });
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  if (variants.length === 0) {
    return (
      <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
        This design isn&apos;t cut for any device yet — check back soon or
        create a custom version in the studio.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Variant selector */}
      <fieldset>
        <legend className="text-sm font-semibold">
          Select your device{" "}
          <span className="text-muted-foreground font-normal">
            — {variants.length} cut{variants.length === 1 ? "" : "s"} available
          </span>
        </legend>
        <Select
          value={variant?.id}
          onValueChange={(v) => {
            setVariantId(v);
            selectVariant(product.id, v);
            const m = variants.find((x) => x.id === v);
            if (m) toast.message("Device updated", { description: "Price and fit follow this cut." });
          }}
        >
          <SelectTrigger className="mt-3 h-12 w-full text-[15px]" aria-label="Device model">
            <SelectValue placeholder="Choose model" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((v) => {
              const label = v.deviceModel
                ? `${v.deviceModel.brand?.name ?? ""} ${v.deviceModel.name}`.trim()
                : v.sku;
              return (
                <SelectItem key={v.id} value={v.id}>
                  {label} — {formatINR(Number(v.price))}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {variant && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Precision cut
            {modelName ? ` for ${modelName}` : ""} — camera &amp; port cutouts included.
          </p>
        )}
      </fieldset>

      <hr className="border-border" />

      {/* Qty + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border" role="group" aria-label="Quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="press grid size-11 place-items-center hover:bg-muted"
          >
            <Minus className="size-4" />
          </button>
          <span aria-live="polite" className="w-9 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            className="press grid size-11 place-items-center hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {Number.isFinite(price) && (
          <p className="ml-auto text-right">
            <span className="block text-price-point">{formatINR(price * qty)}</span>
            {original && (
              <s className="text-xs text-muted-foreground/70">{formatINR(original * qty)}</s>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-2">
        <Button size="lg" className="h-12 text-base" onClick={addToCart} disabled={!inStock}>
          <ShoppingBag /> Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 text-base"
          onClick={buyNow}
          disabled={!inStock}
        >
          <Zap /> Buy Now
        </Button>
        <WishlistButton slug={product.slug} name={product.name} className="col-span-full size-12 w-full justify-self-stretch sm:hidden" />
      </div>
      {!inStock && variant && (
        <p className="text-sm text-destructive">Out of stock for this device right now.</p>
      )}

      <ul className="space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Truck className="size-4 text-primary" aria-hidden="true" />
          Free shipping over ₹499 · dispatch in 24h
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <span className="capitalize">{product.material.replace("-", " ")}</span>
          &nbsp;— residue-free removal, 1-year warranty
        </li>
      </ul>
    </div>
  );
}
