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
import { toast } from "sonner";
import type { DeviceModel, DeviceType, Skin } from "@/lib/types";
import {
  compatibleModels,
  discountedPrice,
  finalPrice,
  materialLabel,
} from "@/lib/api";
import { formatINR } from "@/lib/utils";

export function ProductBuyPanel({
  skin,
  deviceType,
}: {
  skin: Skin;
  deviceType: DeviceType;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const models = useMemo(() => compatibleModels(skin).filter((m) => m.type === deviceType), [skin, deviceType]);
  const [deviceId, setDeviceId] = useState(models[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const model: DeviceModel | undefined = models.find((m) => m.id === deviceId);
  const brands = [...new Set(models.map((m) => m.brandId))];
  const price = discountedPrice(skin, deviceType);
  const original = skin.discountPct > 0 ? finalPrice(skin, deviceType) : undefined;

  const addToCart = () => {
    if (!model) return;
    add({
      key: `skin:${skin.id}:${model.id}`,
      kind: "skin",
      title: `${skin.name}`,
      subtitle: model.name,
      deviceId: model.id,
      deviceName: model.name,
      unitPrice: price,
      refId: skin.id,
    });
    toast.success("Added to cart", {
      description: `${skin.name} · ${model.name}`,
    });
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Device selector */}
      <fieldset>
        <legend className="text-sm font-semibold">
          Select your device <span className="text-muted-foreground font-normal">— only compatible models are listed</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Brand">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={(model ? model.brandId : brands[0]) === b}
              onClick={() => {
                const first = models.find((m) => m.brandId === b);
                if (first) setDeviceId(first.id);
              }}
              className={`press rounded-lg border px-3.5 py-2 text-sm font-medium capitalize ${
                (model ? model.brandId : brands[0]) === b
                  ? "border-transparent bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              {b.replace(/(^|\s)\S/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
        <Select
          value={deviceId}
          onValueChange={(v) => {
            setDeviceId(v);
            const m = models.find((x) => x.id === v);
            if (m) toast.message(`${m.name} selected`, { description: "Prices and fit update for this device." });
          }}
        >
          <SelectTrigger className="mt-3 h-12 w-full text-[15px]" aria-label="Device model">
            <SelectValue placeholder="Choose model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {model && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="polite">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Precision cut for {model.name} — camera & port cutouts included.
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
        <p className="ml-auto text-right">
          <span className="block text-price-point">{formatINR(price * qty)}</span>
          {original && (
            <s className="text-xs text-muted-foreground/70">{formatINR(original * qty)}</s>
          )}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-2">
        <Button size="lg" className="h-12 text-base" onClick={addToCart}>
          <ShoppingBag /> Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 text-base"
          onClick={buyNow}
        >
          <Zap /> Buy Now
        </Button>
        <WishlistButton slug={skin.slug} name={skin.name} className="col-span-full size-12 w-full justify-self-stretch sm:hidden" />
      </div>

      <ul className="space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Truck className="size-4 text-primary" aria-hidden="true" />
          Free shipping over ₹499 · dispatch in 24h
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          {materialLabel(skin.material)} — residue-free removal, 1-year warranty
        </li>
      </ul>
    </div>
  );
}
