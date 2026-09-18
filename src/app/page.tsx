import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { DeviceFinder } from "@/components/device/device-finder";
import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { CustomBanner } from "@/components/home/custom-banner";
import { ProductGrid } from "@/components/shop/product-grid";
import { CouponCard } from "@/components/home/coupon-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  featuredSkins,
  getCoupons,
  getModels,
  newArrivals,
  offerSkins,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DeviceCard } from "@/components/device/device-card";

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-label-sm text-primary">{eyebrow}</p>
        )}
        <h2 className="mt-1.5 text-headline-lg">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const featured = featuredSkins(8);
  const fresh = newArrivals(4);

  return (
    <>
      <Hero />

      {/* ── Device finder ── */}
      <section id="find-device" className="container-x scroll-mt-28 section-pad">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal className="reveal text-center" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
            <p className="text-label-sm text-primary">Device finder</p>
            <h2 className="mt-2 text-headline-lg">Find Your Device</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Three quick steps. We&apos;ll only show skins made for your model.
            </p>
          </ScrollReveal>
          <ScrollReveal className="reveal mt-10" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
            <DeviceFinder />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Categories ── */}
      <CategoryStrip />

      {/* ── Popular right now ── */}
      <section className="container-x section-pad" aria-labelledby="popular-heading">
        <ScrollReveal className="reveal" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
          <SectionHeader
            eyebrow="Most wanted"
            title="Popular right now"
            href="/shop"
            linkLabel="Shop all skins"
          />
        </ScrollReveal>
        <ScrollReveal className="reveal mt-8" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
          <ProductGrid skins={featured} />
        </ScrollReveal>
        <Button variant="outline" size="lg" className="mt-10 w-full sm:hidden" asChild>
          <Link href="/shop">
            Shop all skins <ArrowRight />
          </Link>
        </Button>
      </section>

      {/* ── Custom banner ── */}
      <CustomBanner />

      {/* ── Popular devices ── */}
      <section className="container-x section-pad" aria-labelledby="devices-heading">
        <ScrollReveal className="reveal" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
          <SectionHeader
            title="Popular devices"
            href="/devices"
            linkLabel="All devices"
          />
        </ScrollReveal>

        <ScrollReveal threshold={0.08}>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
            {[
              "apple-iphone-17-pro",
              "samsung-galaxy-s26-ultra",
              "apple-macbook-air-13-m4",
            ]
              .map((id) => getModels().find((m) => m.id === id))
              .filter((m): m is NonNullable<typeof m> => Boolean(m))
              .map((model, i) => (
                <div
                  key={model.id}
                  className="reveal"
                  style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
                >
                  <DeviceCard model={model} />
                </div>
              ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="reveal mt-6" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
          <p className="flex items-start gap-2 rounded-lg bg-secondary px-4 py-3 text-sm text-pretty text-muted-foreground">
            <Search className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Can&apos;t see your device? Use the{" "}
              <Link href="#find-device" className="font-semibold text-primary hover:underline">
                device finder
              </Link>{" "}
              — we add new models every month.
            </span>
          </p>
        </ScrollReveal>
      </section>

      {/* ── New arrivals ── */}
      <section className="container-x section-pad" aria-labelledby="new-heading">
        <ScrollReveal className="reveal" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
          <SectionHeader
            eyebrow="Just landed"
            title="New Arrivals"
            href="/shop?sort=newest"
          />
        </ScrollReveal>
        <ScrollReveal className="reveal mt-8" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
          <ProductGrid skins={fresh} columns={4} />
        </ScrollReveal>
      </section>

      {/* ── Offers + Coupons ── */}
      <section className="container-x section-pad pt-0" aria-labelledby="offers-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <ScrollReveal className="reveal" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
              <SectionHeader
                eyebrow="Limited time"
                title="On sale"
                href="/offers"
                linkLabel="All offers"
              />
            </ScrollReveal>
            <ScrollReveal className="reveal mt-8" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
              <ProductGrid skins={offerSkins(4)} columns={4} />
            </ScrollReveal>
          </div>
          <aside>
            <ScrollReveal className="reveal" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
              <h2 id="offers-heading" className="text-headline-lg">Coupons</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Apply at checkout.</p>
              <div className="mt-6 space-y-3">
                {getCoupons().map((c) => (
                  <CouponCard key={c.code} coupon={c} />
                ))}
              </div>
            </ScrollReveal>
          </aside>
        </div>
      </section>
    </>
  );
}
