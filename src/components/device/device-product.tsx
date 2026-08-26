"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brush,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { DeviceFrame } from "@/components/artwork/device-frame";
import { DevicePhoto } from "@/components/device/device-photo";
import { SkinArt } from "@/components/artwork/skin-art";
import { Price } from "@/components/shop/price";
import { StarRating } from "@/components/shop/star-rating";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/lib/stores/cart-store";
import { materialLabel } from "@/lib/api";
import { cn, formatINR } from "@/lib/utils";
import type { DeviceType, PatternId } from "@/lib/types";
import { useState } from "react";

export type DeviceSkinOption = {
  id: string;
  name: string;
  slug: string;
  colors: [string, string];
  pattern: PatternId;
  price: number;
  original?: number;
  inStock: boolean;
  material: string;
  finish: string;
  rating: number;
  reviews: number;
};

export function DeviceProduct({
  modelId,
  modelName,
  modelType,
  brandId,
  brandName,
  brandSlug,
  skins,
  heroSrc,
  gallerySrcs = [],
  designImages = {},
}: {
  modelId: string;
  modelName: string;
  modelType: DeviceType;
  brandId: string;
  brandName: string;
  brandSlug: string;
  skins: DeviceSkinOption[];
  heroSrc?: string;
  gallerySrcs?: string[];
  designImages?: Record<string, string>;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [selectedId, setSelectedId] = useState(skins[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [shotSrc, setShotSrc] = useState<string | undefined>(undefined);

  const selected = skins.find((s) => s.id === selectedId) ?? skins[0];
  const empty = skins.length === 0;
  const designSrc = selected ? designImages[selected.id] : undefined;
  const extraShots = gallerySrcs.filter((src) => src !== heroSrc);
  const mainSrc = designSrc ?? shotSrc ?? heroSrc;
  const galleryAlt = `${brandName} ${modelName} skins and wraps`;

  const addToCart = () => {
    if (!selected) return;
    add({
      key: `skin:${selected.id}:${modelId}`,
      kind: "skin",
      title: selected.name,
      subtitle: modelName,
      deviceId: modelId,
      deviceName: modelName,
      unitPrice: selected.price,
      refId: selected.id,
      qty,
    });
    toast.success("Added to cart", {
      description: `${selected.name} · ${modelName}`,
    });
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  return (
    <div className="mt-6 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div
          className={cn(
            "relative grid place-items-center overflow-hidden rounded-xl border bg-[#f6e8e8]",
            mainSrc
              ? "aspect-square"
              : modelType === "phone"
                ? "aspect-square p-10 sm:p-14"
                : "aspect-4/3 p-8 sm:p-12"
          )}
        >
          {mainSrc ? (
            <>
              {heroSrc ? (
                <DevicePhoto
                  src={heroSrc}
                  alt={galleryAlt}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={cn(
                    "p-6 sm:p-10 transition-opacity duration-200",
                    mainSrc === heroSrc ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                  priority
                />
              ) : null}
              {Object.values(designImages)
                .filter((src, i, all) => src !== heroSrc && all.indexOf(src) === i)
                .map((src) => (
                  <DevicePhoto
                    key={src}
                    src={src}
                    alt={galleryAlt}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={cn(
                      "p-6 sm:p-10 transition-opacity duration-200",
                      mainSrc === src ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                    priority
                  />
                ))}
              {shotSrc && shotSrc !== heroSrc && shotSrc !== designSrc ? (
                <DevicePhoto
                  src={shotSrc}
                  alt={galleryAlt}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="p-6 sm:p-10"
                  priority
                />
              ) : null}
            </>
          ) : selected ? (
            <DeviceFrame
              type={modelType}
              colors={selected.colors}
              pattern={selected.pattern}
              brand={brandId}
              className={modelType === "phone" ? "h-full max-h-105" : "w-full max-w-md"}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Artwork coming soon</p>
          )}
        </div>
        {extraShots.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="More photos">
            {heroSrc ? (
              <button
                type="button"
                onClick={() => setShotSrc(undefined)}
                className={cn(
                  "press relative size-16 overflow-hidden rounded-md border bg-[#f6e8e8]",
                  !shotSrc && !designSrc ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-border"
                )}
                aria-label="Main photo"
              >
                <DevicePhoto src={heroSrc} alt="" sizes="64px" className="p-1" />
              </button>
            ) : null}
            {extraShots.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setShotSrc(src)}
                className={cn(
                  "press relative size-16 overflow-hidden rounded-md border bg-[#f6e8e8]",
                  shotSrc === src && !designSrc
                    ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "border-border"
                )}
                aria-label="Product photo"
              >
                <DevicePhoto src={src} alt="" sizes="64px" className="p-1" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <Link
          href={`/devices/${brandSlug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {brandName}
        </Link>
        <h1 className="mt-1.5 font-heading text-headline-lg tracking-tight">
          {modelName} Skins &amp; Wraps
        </h1>

        {empty ? (
          <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Skins for this model are being cut right now. Design your own in the meantime.
            </p>
            <Button size="lg" className="mt-5 h-12" asChild>
              <Link href={`/customize?device=${modelId}`}>
                <Brush /> Customize Your Own
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <fieldset className="mt-8">
              <legend className="text-sm">
                <span className="font-semibold">Design</span>
                {selected ? (
                  <span className="text-muted-foreground"> — {selected.name}</span>
                ) : null}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a design">
                {skins.map((skin) => {
                  const isSelected = skin.id === selected?.id;
                  const photo = designImages[skin.id];
                  return (
                    <button
                      key={skin.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={skin.name}
                      title={skin.name}
                      onClick={() => {
                        setSelectedId(skin.id);
                        setShotSrc(undefined);
                      }}
                      className={cn(
                        "press relative block size-16 overflow-hidden rounded-md border sm:size-18",
                        photo && "bg-[#f6e8e8]",
                        isSelected
                          ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "border-border hover:border-foreground/40"
                      )}
                    >
                      {photo ? (
                        <DevicePhoto src={photo} alt="" sizes="72px" className="p-0.5" />
                      ) : (
                        <SkinArt pattern={skin.pattern} colors={skin.colors} />
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {selected ? (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {selected.inStock ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      <Check className="size-4" aria-hidden="true" />
                      In stock
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-destructive">Out of stock</p>
                  )}
                  <StarRating rating={selected.rating} reviews={selected.reviews} />
                </div>

                <div className="mt-5">
                  <Price price={selected.price} original={selected.original} size="lg" />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shipping calculated at checkout
                  </p>
                </div>

                <p className="mt-4 text-sm capitalize text-muted-foreground">
                  {materialLabel(selected.material)} · {selected.finish} finish · precision-cut for{" "}
                  {modelName}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border" role="group" aria-label="Quantity">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="press grid size-11 place-items-center hover:bg-muted"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span aria-live="polite" className="w-9 text-center text-sm font-semibold">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty((q) => Math.min(9, q + 1))}
                      className="press grid size-11 place-items-center hover:bg-muted"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <p className="ml-auto text-right text-sm font-semibold tabular-nums">
                    {formatINR(selected.price * qty)}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 text-base"
                    onClick={addToCart}
                    disabled={!selected.inStock}
                  >
                    <ShoppingBag /> Add to cart
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 text-base"
                    onClick={buyNow}
                    disabled={!selected.inStock}
                  >
                    <Zap /> Buy it now
                  </Button>
                  <WishlistButton
                    slug={selected.slug}
                    name={selected.name}
                    className="size-12 justify-self-stretch sm:justify-self-auto"
                  />
                </div>

                <p className="mt-4">
                  <Link
                    href={`/products/${selected.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View full design details
                  </Link>
                </p>
              </>
            ) : null}

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-primary" aria-hidden="true" />
                Free shipping over ₹499 · dispatch in 24h
              </li>
            </ul>

            <Button variant="ghost" className="mt-3 h-auto px-0 text-primary" asChild>
              <Link href={`/customize?device=${modelId}`}>
                <Brush /> Customize your own
              </Link>
            </Button>
          </>
        )}

        <Accordion type="single" collapsible className="mt-8 border-t pt-2">
          <AccordionItem value="shipping">
            <AccordionTrigger className="font-medium">Shipping</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Free shipping over ₹499 (₹49 below). Dispatched within 24 hours, delivered in 3–5
              days across India. Shipping is calculated at checkout.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger className="font-medium">Returns &amp; replacements</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              7-day no-questions returns on unapplied skins. If a cut is off or a sheet arrives
              damaged, we replace it — just send a photo of the issue.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
