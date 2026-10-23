import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { DeviceFinder } from "@/components/device/device-finder";
import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { CustomBanner } from "@/components/home/custom-banner";
import { ProductGrid } from "@/components/shop/product-grid";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { productsService } from "@/lib/services/products.service";
import { devicesService } from "@/lib/services/devices.service";
import { Button } from "@/components/ui/button";
import { DeviceCard } from "@/components/device/device-card";

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
  id,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-label-sm text-primary">{eyebrow}</p>
        )}
        <h2 id={id} className="mt-1.5 text-headline-lg">{title}</h2>
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

export default async function HomePage() {
  const [featured, fresh, sale, liveModels] = await Promise.all([
    productsService.list({ sort: "featured", limit: 8 }, { revalidate: 120 }).then((r) => r.items).catch(() => []),
    productsService.list({ sort: "newest", limit: 4 }, { revalidate: 120 }).then((r) => r.items).catch(() => []),
    productsService.list({ onSale: true, limit: 4, sort: "popular" }, { revalidate: 120 }).then((r) => r.items).catch(() => []),
    devicesService.getModelsByType("smartphone").then((m) => m.slice(0, 3)).catch(() => []),
  ]);

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
          {featured.length > 0 ? (
            <ProductGrid products={featured} />
          ) : (
            <p className="text-sm text-muted-foreground">
              New drops are on the way — meanwhile, design your own in the studio.
            </p>
          )}
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
          {liveModels.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {liveModels.map((model, i) => {
                const brand = model.brand;
                if (!brand) return null;
                return (
                  <div
                    key={model.id}
                    className="reveal"
                    style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
                  >
                    <DeviceCard brand={brand} model={model} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Devices are being added — browse all models instead.
            </p>
          )}
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
          {fresh.length > 0 ? (
            <ProductGrid products={fresh} columns={4} />
          ) : (
            <p className="text-sm text-muted-foreground">Fresh drops landing soon.</p>
          )}
        </ScrollReveal>
      </section>

      {/* ── On sale ── */}
      <section className="container-x section-pad pt-0" aria-labelledby="offers-heading">
        <ScrollReveal className="reveal" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
          <SectionHeader
            eyebrow="Limited time"
            title="On sale"
            href="/offers"
            linkLabel="All offers"
            id="offers-heading"
          />
        </ScrollReveal>
        <ScrollReveal className="reveal mt-8" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
          {sale.length > 0 ? (
            <ProductGrid products={sale} columns={4} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No sale items right now — <Link href="/shop" className="font-medium text-primary hover:underline">browse everything</Link> instead.
            </p>
          )}
        </ScrollReveal>
      </section>
    </>
  );
}
