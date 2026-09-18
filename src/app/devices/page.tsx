import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Laptop, Smartphone, Tablet } from "lucide-react";
import { DeviceCard } from "@/components/device/device-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getBrands, getModels } from "@/lib/api";
import type { DeviceType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Device Catalog — Skins & Wraps by Phone, Tablet & Laptop",
  description:
    "Find skins and wraps for your exact device. Browse phones, tablets and laptops by brand — Apple, Samsung, OnePlus, Google, Dell, HP, Lenovo, ASUS and more.",
  alternates: { canonical: "/devices" },
};

const SECTIONS: {
  type: DeviceType;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  {
    type: "phone",
    title: "Phone Skins & Wraps",
    href: "/devices/phones",
    icon: Smartphone,
    accent: "bg-primary/10 text-primary",
  },
  {
    type: "tablet",
    title: "Tablet Skins & Wraps",
    href: "/devices/tablets",
    icon: Tablet,
    accent: "bg-violet-100 text-violet-700",
  },
  {
    type: "laptop",
    title: "Laptop Skins & Wraps",
    href: "/devices/laptops",
    icon: Laptop,
    accent: "bg-amber-100 text-amber-700",
  },
];

export default function DevicesPage() {
  const allBrands = getBrands();

  return (
    <div className="container-x py-10 lg:py-14">

      {/* ── Page header ── */}
      <header className="max-w-2xl">
        <p className="text-label-sm text-primary">Shop by device</p>
        <h1 className="mt-2 text-headline-lg">Skins &amp; Wraps</h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          Pick your exact model — every skin is precision-cut to fit.
        </p>
      </header>

      {/* ── Brand filter pills ── */}
      <ScrollReveal className="reveal mt-8" style={{ "--reveal-delay": "0ms" } as React.CSSProperties}>
        <p className="mb-3 text-label-sm text-muted-foreground">Browse by brand</p>
        <ul className="flex flex-wrap gap-2">
          {allBrands.map((b) => (
            <li key={b.id}>
              <Link
                href={`/devices/${b.slug}`}
                className={[
                  "press inline-flex items-center rounded-xl px-4 py-2",
                  "glass-sm shadow-glass text-sm font-medium",
                  "transition-all duration-200 hover:shadow-glass-hover hover:-translate-y-0.5",
                  "hover:border-primary/30 hover:text-primary",
                ].join(" ")}
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollReveal>

      {/* ── Device type sections ── */}
      {SECTIONS.map(({ type, title, href, icon: Icon, accent }, sectionIdx) => {
        const models = getModels({ type });
        if (models.length === 0) return null;

        return (
          <section
            key={type}
            aria-labelledby={`${type}-heading`}
            className="mt-16"
          >
            {/* Section header */}
            <ScrollReveal
              className="reveal flex items-center justify-between gap-4"
              style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
            >
              <h2
                id={`${type}-heading`}
                className="flex items-center gap-3 text-headline-lg"
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${accent}`}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </span>
                {title}
              </h2>
              <Link
                href={href}
                className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
              >
                All {type} models <ArrowRight className="size-4" />
              </Link>
            </ScrollReveal>

            {/* Cards grid */}
            <ScrollReveal threshold={0.05}>
              <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {models.map((model, i) => (
                  <li
                    key={model.id}
                    className="reveal"
                    style={{
                      "--reveal-delay": `${Math.min(i, 7) * 50}ms`,
                    } as React.CSSProperties}
                  >
                    <DeviceCard model={model} />
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* Mobile "view all" link */}
            <div className="mt-6 sm:hidden">
              <Link
                href={href}
                className="flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-semibold text-primary glass-sm"
              >
                All {type} models <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
}
