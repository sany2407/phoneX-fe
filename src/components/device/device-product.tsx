"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { DevicePhoto } from "@/components/device/device-photo";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/lib/stores/cart-store";
import { finishLabel } from "@/lib/taxonomy";
import { cn, formatINR } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkinCategory = { id: string; name: string; slug: string };

export type DeviceSkinOption = {
  variantId: string;
  productId: string;
  productSlug: string;
  name: string;
  /** Every image we have for this skin — the mockup for this device first. */
  images: string[];
  price: number;
  original?: number;
  inStock: boolean;
  material: string;
  finish: string;
  rating: number;
  reviewCount: number;
  category: SkinCategory | null;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  items: DeviceSkinOption[];
};

/**
 * Browse tabs — Variants lists every skin for the model, By Category groups
 * the same skins under their real category.
 */
const TABS = [
  { id: "variants", label: "Variants", icon: ShoppingBag },
  { id: "category", label: "By Category", icon: Tag },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Width of one tab segment, as a percentage of the tab strip. */
const TAB_SEGMENT = 100 / TABS.length;

// ─── Horizontal scroll row ────────────────────────────────────────────────────

function ScrollRow({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    // Smooth scrolling is motion — respect the user's preference.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * Math.max(260, el.clientWidth * 0.8),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={ref}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-[42%] hidden size-8 -translate-y-1/2 place-items-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted lg:grid"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute -right-3 top-[42%] hidden size-8 -translate-y-1/2 place-items-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted lg:grid"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function SkinCard({
  skin,
  active,
  onSelect,
}: {
  skin: DeviceSkinOption;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="shrink-0 snap-start">
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        className={cn(
          "press group block w-[124px] rounded-[12px] border bg-card p-2 text-left",
          active
            ? "border-transparent outline-2 outline-offset-[-2px] outline-primary"
            : "hover:border-transparent hover:shadow-card-hover"
        )}
      >
        <span className="relative block aspect-square overflow-hidden rounded-[8px] bg-secondary/60">
          {skin.images[0] ? (
            <DevicePhoto
              src={skin.images[0]}
              alt=""
              sizes="124px"
              className="p-1.5 transition-transform duration-300 ease-snappy group-hover:scale-[1.06]"
            />
          ) : (
            <span className="grid size-full place-items-center text-muted-foreground/40">
              <ImageOff className="size-5" aria-hidden="true" />
            </span>
          )}
          {!skin.inStock && (
            <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-0.5 text-center text-[10px] font-semibold text-background">
              Sold out
            </span>
          )}
        </span>
        <span className="mt-2 block truncate text-xs font-semibold">{skin.name}</span>
        <span className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold tabular-nums">{formatINR(skin.price)}</span>
          {skin.original && skin.original > skin.price && (
            <s className="text-[11px] text-muted-foreground/70">{formatINR(skin.original)}</s>
          )}
        </span>
      </button>
    </li>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DeviceProduct({
  modelName,
  brandName,
  brandSlug,
  skins,
  heroSrc,
}: {
  modelId: string;
  modelName: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  skins: DeviceSkinOption[];
  heroSrc?: string;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [selectedId, setSelectedId] = useState(skins[0]?.variantId ?? "");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabId>("category");

  const selected = skins.find((s) => s.variantId === selectedId) ?? skins[0];

  // Real categories: the design categories present among this model's skins.
  const categories = useMemo<Collection[]>(() => {
    const map = new Map<string, Collection>();
    for (const s of skins) {
      const id = s.category?.id ?? "__other";
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: s.category?.name ?? "Other",
          slug: s.category?.slug ?? "",
          image: s.images[0],
          items: [],
        });
      }
      map.get(id)!.items.push(s);
    }
    return [...map.values()];
  }, [skins]);

  const mainSrc = selected?.images[0] ?? heroSrc;

  const discount =
    selected && selected.original && selected.original > selected.price
      ? Math.round((1 - selected.price / selected.original) * 100)
      : null;

  const selectSkin = (variantId: string) => {
    setSelectedId(variantId);
  };

  const addToCart = () => {
    if (!selected) return;
    add({
      key: `skin:${selected.variantId}`,
      kind: "skin",
      title: selected.name,
      subtitle: modelName,
      deviceId: brandSlug,
      deviceName: `${brandName} ${modelName}`,
      unitPrice: selected.price,
      qty,
      thumb: selected.images[0],
      refId: selected.variantId,
    });
    toast.success("Added to cart", {
      description: `${selected.name} · ${modelName}`,
    });
  };

  const buyNow = () => {
    if (!selected) return;
    addToCart();
    router.push("/checkout");
  };

  const activeTabIdx = Math.max(0, TABS.findIndex((t) => t.id === tab));

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* ── Visual ─────────────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        {/* Main preview */}
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl glass shadow-glass bg-secondary/60">
          {mainSrc ? (
            <DevicePhoto
              key={mainSrc}
              src={mainSrc}
              alt={`${brandName} ${modelName} skins and wraps`}
              sizes="(max-width: 1024px) 100vw, 44vw"
              priority
              className="animate-fade-in p-8"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <ImageOff className="size-10" aria-hidden="true" />
              <span className="text-sm">No photos yet for this model</span>
            </div>
          )}
          {selected && (
            <WishlistButton
              slug={selected.productSlug}
              name={selected.name}
              className="absolute right-4 top-4"
            />
          )}
        </div>
      </div>

      {/* ── Details ────────────────────────────────────────────────────── */}
      <div className="min-w-0">
        <Link
          href={`/devices/${brandSlug}`}
          className="text-label-sm text-primary hover:underline"
        >
          {brandName}
        </Link>

        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="font-heading text-headline-lg tracking-tight">
            Skins for {modelName}
          </h1>
          {selected && (
            <div className="shrink-0 text-right">
              <p className="font-heading text-3xl font-bold tabular-nums tracking-tight">
                {formatINR(selected.price)}
              </p>
              {discount != null && (
                <>
                  <s className="mt-0.5 block text-sm text-muted-foreground/70">
                    {formatINR(selected.original!)}
                  </s>
                  <span className="mt-1 inline-block rounded-full bg-sale-soft px-2.5 py-0.5 text-xs font-semibold text-sale">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <p className="mt-1.5 text-sm text-muted-foreground">
          Protect. Personalize. Make it yours.
        </p>

        {skins.length === 0 ? (
          <p className="mt-6 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No ready-made skins cut for this model yet — be the first to wrap it
            with a custom design.
          </p>
        ) : (
          <>
            {/* Browse tabs — the active pill slides between segments. The blue
                is wiped in with a clip-path overlay instead of swapping
                classes, so text never flashes white-on-light mid-transition. */}
            <div className="relative mt-6 rounded-xl border bg-muted/40 p-1">
              <div className="flex">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className="press flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active segment — colour only, clipped to the active third. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-1 flex transition-[clip-path] duration-200 ease-snappy"
                style={{
                  clipPath: `inset(0 ${
                    100 - TAB_SEGMENT * (activeTabIdx + 1)
                  }% 0 ${TAB_SEGMENT * activeTabIdx}%)`,
                }}
              >
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-primary px-2 py-2 text-sm font-medium text-primary-foreground"
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              {tab === "variants" && (
                <div>
                  <h2 className="font-heading text-lg font-bold tracking-tight">
                    All skins ({skins.length})
                  </h2>
                  <ScrollRow label="All skins" className="mt-3">
                    {skins.map((s) => (
                      <SkinCard
                        key={s.variantId}
                        skin={s}
                        active={s.variantId === selected?.variantId}
                        onSelect={() => selectSkin(s.variantId)}
                      />
                    ))}
                  </ScrollRow>
                </div>
              )}

              {tab === "category" && (
                <div className="space-y-6">
                  {categories.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-heading text-base font-bold tracking-tight">
                          {c.name}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            ({c.items.length})
                          </span>
                        </h2>
                        {c.slug && (
                          <Link
                            href={`/designs/${c.slug}`}
                            className="shrink-0 text-sm font-medium text-primary hover:underline"
                          >
                            View all
                          </Link>
                        )}
                      </div>
                      <ScrollRow label={c.name} className="mt-2.5">
                        {c.items.map((s) => (
                          <SkinCard
                            key={s.variantId}
                            skin={s}
                            active={s.variantId === selected?.variantId}
                            onSelect={() => selectSkin(s.variantId)}
                          />
                        ))}
                      </ScrollRow>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity + total */}
            <div className="mt-7 flex items-center gap-3">
              <div
                className="flex items-center rounded-lg border"
                role="group"
                aria-label="Quantity"
              >
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
              {selected && (
                <p className="ml-auto font-heading text-2xl font-bold tabular-nums tracking-tight">
                  {formatINR(selected.price * qty)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-[1.7fr_1fr] gap-3">
              <Button
                size="lg"
                className="h-12 text-base"
                onClick={addToCart}
                disabled={!selected?.inStock}
              >
                <ShoppingBag /> Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 text-base"
                onClick={buyNow}
                disabled={!selected?.inStock}
              >
                <Zap /> Buy Now
              </Button>
            </div>
            {selected && !selected.inStock && (
              <p className="mt-2 text-sm text-destructive">
                This option is out of stock right now.
              </p>
            )}
          </>
        )}

        {/* Details */}
        <Accordion type="single" collapsible defaultValue="map" className="mt-7 border-t pt-1">
          <AccordionItem value="map">
            <AccordionTrigger className="font-medium">
              <span className="flex items-center gap-2">
                <Tag className="size-4 text-primary" aria-hidden="true" />
                Map to your category (Optional)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {selected?.category ? (
                <span>
                  This skin belongs to:{" "}
                  <Link
                    href={`/designs/${selected.category.slug}`}
                    className="font-medium text-foreground"
                  >
                    {selected.category.name}
                  </Link>
                  {" › "}
                  <span className="font-medium text-foreground">
                    {finishLabel(selected.finish)}
                  </span>
                </span>
              ) : (
                "This skin isn’t mapped to a collection yet."
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="install">
            <AccordionTrigger className="font-medium">
              <span className="flex items-center gap-2">
                <Download className="size-4 text-primary" aria-hidden="true" />
                Installation
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>Clean the surface with the included wipes.</li>
                <li>Align the skin using the cutouts as guides.</li>
                <li>Peel &amp; stick from one edge, pressing out bubbles.</li>
                <li>Warm slightly with a dryer for curved edges.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping">
            <AccordionTrigger className="font-medium">
              <span className="flex items-center gap-2">
                <Truck className="size-4 text-primary" aria-hidden="true" />
                Shipping &amp; returns
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Free shipping over ₹499 (₹49 below). Dispatched within 24 hours,
              delivered in 3–5 days across India. 7-day no-questions returns on
              unapplied skins.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Truck className="size-4 text-primary" aria-hidden="true" />
            Free shipping over ₹499 · dispatch in 24h
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Precision cut — residue-free removal, 1-year warranty
          </li>
        </ul>

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/customize">Or design your own</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
