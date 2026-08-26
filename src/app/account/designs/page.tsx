"use client";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import Link from "next/link";
import { Pencil, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shop/empty-state";
import { useDesigns } from "@/lib/stores/designs-store";
import { useCart } from "@/lib/stores/cart-store";
import { useAuth } from "@/lib/stores/auth-store";
import { getModelById, materialLabel } from "@/lib/api";
import { customPrice } from "@/lib/custom-pricing";
import { formatDate, formatINR } from "@/lib/utils";

export default function SavedDesignsPage() {
  const hydrated = useHydrated();
  const designs = useDesigns((s) => s.designs);
  const remove = useDesigns((s) => s.remove);
  const user = useAuth((s) => s.user);

  if (!hydrated) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg">Saved Designs</h1>
          <p className="mt-1 text-muted-foreground" aria-live="polite">
            {designs.length} {designs.length === 1 ? "design" : "designs"} · stored on this device
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/customize">New design</Link>
        </Button>
      </header>

      {designs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Pencil}
            title="No saved designs yet"
            description="Upload artwork in the studio and save it — your design will wait for you here."
            actionLabel="Open the studio"
            actionHref="/customize"
          />
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((d) => {
            const model = getModelById(d.deviceId);
            return (
              <li key={d.id} className="overflow-hidden rounded-xl border bg-card transition-shadow duration-300 ease-out hover:shadow-card-hover">
                <Link href={`/customize?design=${d.id}`} className="block bg-secondary/60 p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.imageSrc}
                    alt={`Custom ${d.skinType} skin for ${d.deviceName}`}
                    className="mx-auto aspect-[4/3] w-full rounded-lg border object-cover"
                  />
                </Link>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{d.deviceName}</p>
                    <p className="mt-0.5 font-medium">{materialLabel(d.skinType)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Updated {formatDate(d.updatedAt)}
                      {!user && " · sign in to sync"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!model) {
                          toast.error("This device is no longer available.");
                          return;
                        }
                        useCart.getState().add({
                          key: `custom:${d.id}:${d.deviceId}:${d.skinType}`,
                          kind: "custom",
                          title: "Custom skin",
                          subtitle: `${materialLabel(d.skinType)} · ${d.deviceName}`,
                          deviceId: d.deviceId,
                          deviceName: d.deviceName,
                          unitPrice: customPrice(model, d.skinType),
                          thumb: d.imageSrc,
                          designId: d.id,
                        });
                        toast.success("Added to cart");
                      }}
                    >
                      <ShoppingBag /> Add to cart
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/customize?design=${d.id}`}>
                        <Pencil /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete design"
                      className="ml-auto hover:text-destructive"
                      onClick={() => {
                        remove(d.id);
                        toast.success("Design deleted");
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {model ? `From ${formatINR(customPrice(model, d.skinType))}` : "Device unavailable"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
