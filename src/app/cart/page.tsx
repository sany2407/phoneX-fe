"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shop/empty-state";
import { DeviceFrame } from "@/components/artwork/device-frame";
import { cartTotals, useCart } from "@/lib/stores/cart-store";
import { getModelById, getSkinById, brandOf } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import type { CartItem } from "@/lib/types";
import { useHydrated } from "@/lib/hooks/use-hydrated";

function Thumb({ item }: { item: CartItem }) {
  const skin = item.kind === "skin" && item.refId ? getSkinById(item.refId) : undefined;
  if (skin) {
    const model = getModelById(item.deviceId);
    return (
      <div className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border bg-secondary">
        <DeviceFrame
          type={model?.type ?? "phone"}
          colors={skin.colors}
          pattern={skin.pattern}
          brand={model ? brandOf(model).id : undefined}
          className="h-[88%]"
        />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.thumb}
      alt={`Artwork for ${item.title}`}
      className="h-20 w-16 shrink-0 rounded-lg border object-cover"
    />
  );
}

function CartRow({ item }: { item: CartItem }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const saveForLater = useCart((s) => s.saveForLater);
  return (
    <li className="flex gap-4 py-5">
      <Thumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {item.kind === "custom" ? "Custom design · " : ""}
              {item.subtitle}
            </p>
          </div>
          <p className="font-semibold tabular-nums">
            {formatINR(item.unitPrice * item.qty)}
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{item.deviceName}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border" role="group" aria-label={`Quantity for ${item.title}`}>
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty(item.key, item.qty - 1)}
              className="press grid size-8 place-items-center hover:bg-muted"
            >
              <Minus className="size-3.5" />
            </button>
            <span aria-live="polite" className="w-7 text-center text-sm font-semibold">{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty(item.key, item.qty + 1)}
              className="press grid size-8 place-items-center hover:bg-muted"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => saveForLater(item.key)}>
            <Bookmark /> Save for later
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(item.key)}>
            <Trash2 /> Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const saved = useCart((s) => s.saved);
  const moveToCart = useCart((s) => s.moveToCart);
  const removeSaved = useCart((s) => s.removeSaved);
  const totals = cartTotals(items);
  const toFreeShipping = Math.max(0, 499 - totals.subtotal);

  if (!hydrated) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Your Cart</h1>
      <p className="mt-1 text-muted-foreground" aria-live="polite">
        {totals.count} {totals.count === 1 ? "item" : "items"}
      </p>

      {items.length === 0 && saved.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Find a design made for your device, or create one that's entirely yours."
            actionLabel="Shop skins"
            actionHref="/shop"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <section aria-label="Cart items">
            {items.length > 0 && (
              <>
                {toFreeShipping > 0 ? (
                  <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    Add <strong className="text-foreground">{formatINR(toFreeShipping)}</strong> more for free shipping.
                  </p>
                ) : (
                  <p className="rounded-lg bg-electric-soft px-4 py-3 text-sm font-medium text-primary">
                    You&apos;ve unlocked free shipping 🎉
                  </p>
                )}
                <ul className="divide-y">
                  {items.map((item) => (
                    <CartRow key={item.key} item={item} />
                  ))}
                </ul>
              </>
            )}

            {saved.length > 0 && (
              <section aria-labelledby="saved-heading" className="mt-10">
                <h2 id="saved-heading" className="text-lg font-semibold">Saved for later</h2>
                <ul className="divide-y">
                  {saved.map((item) => (
                    <li key={item.key} className="flex items-center gap-4 py-4">
                      <Thumb item={item} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{formatINR(item.unitPrice)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => moveToCart(item.key)}>
                          Move to cart
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="Remove saved item" onClick={() => removeSaved(item.key)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>

          {/* Summary */}
          <aside aria-label="Order summary" className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-heading font-semibold">Summary</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">
                    {totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}
                  </dd>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatINR(totals.total)}</dd>
                </div>
              </dl>
              <Button size="lg" className="mt-6 h-12 w-full text-base" asChild>
                <Link href="/checkout" aria-disabled={items.length === 0}>
                  Proceed to Checkout <ArrowRight />
                </Link>
              </Button>
              <Link
                href="/shop"
                className="mt-3 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
              >
                <Heart className="size-3.5" /> or keep browsing
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
