import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, ScanLine, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Custom Skin Studio — Design Your Own",
  description:
    "Upload your own artwork and get a precision-cut skin made for your exact device. Preview before you order.",
  alternates: { canonical: "/customize" },
};

// ─── data ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: "Mobile skin",
    desc: "Your artwork printed and cut to fit every camera, port and button on your exact phone.",
    from: 399,
    was: null,
    href: "/customize/phone-skin",
  },
  {
    name: "Laptop skin",
    desc: "A full-lid wrap with a clean edge, cut precisely for your model.",
    from: 599,
    was: null,
    href: "/customize/laptop-skin",
  },
  {
    name: "Photo case",
    desc: "Your photo printed on a slim protective case.",
    from: 799,
    was: 999,
    href: "/customize/photo-case",
  },
  {
    name: "Printed metal case",
    desc: "A hard metal back with your artwork printed on it.",
    from: 500,
    was: 999,
    href: "/customize/metal-case",
  },
];

const STEPS = [
  {
    icon: ScanLine,
    title: "Choose your device",
    body: "Pick brand and model so the cut matches every port, camera and edge precisely.",
  },
  {
    icon: Upload,
    title: "Upload your artwork",
    body: "Add a photo or design file, then move and scale it until it sits exactly right.",
  },
  {
    icon: Layers,
    title: "Preview and order",
    body: "Check it on a live render of your device, then we print, cut and ship it to you.",
  },
];

const TIPS = [
  "Use the highest resolution file you have — sharp originals print sharp.",
  "Keep faces and important text away from the camera cutout area.",
  "Photos with a clear subject and some empty space around it crop best.",
];

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ─── CSS-only device artwork (no images needed) ───────────────────────────────

const CARBON_STYLE = {
  backgroundColor: "#1c1a17",
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 5px)," +
    "repeating-linear-gradient(-45deg, rgba(0,0,0,0.20) 0 2px, transparent 2px 5px)",
} as const;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function CustomizePage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className="container-x grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">

        {/* Copy */}
        <div className="max-w-xl animate-fade-up">
          <p className="text-label-sm text-primary">phoneX Studio</p>
          <h1 className="mt-2 font-heading text-display-xl">
            Your artwork,<br />cut to fit.
          </h1>
          <p className="mt-5 text-body-lg text-muted-foreground">
            Upload a photo or design and we turn it into a precision-cut skin
            made for your exact device. Preview it before you order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="press h-11 px-6">
              <Link href="/customize/phone-skin">
                Start with a phone <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="press h-11 px-6">
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-8">
            {[
              "Cut to 0.2 mm tolerance",
              "Bubble-free install kit included",
              "Ships in 24–48 hours",
            ].map((t) => (
              <span key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CSS device artwork */}
        <div aria-hidden="true" className="relative mx-auto h-[420px] w-full max-w-[340px] overflow-hidden rounded-2xl border bg-muted shadow-pop lg:h-[480px]">
          {/* Phone body */}
          <div
            className="absolute left-1/2 top-8 h-[380px] w-[185px] -translate-x-1/2 rotate-[-5deg] rounded-[2.5rem] border border-foreground/20 shadow-card-hover"
            style={CARBON_STYLE}
          >
            {/* Artwork layer — abstract warm shapes */}
            <div className="absolute inset-2.5 overflow-hidden rounded-[2rem] bg-[#f5f3ef]">
              {/* primary circle */}
              <span className="absolute -bottom-16 -left-10 size-56 rounded-full bg-primary/80" />
              {/* warm accent */}
              <span className="absolute -top-8 right-4 size-36 rounded-full bg-sale/60" />
              {/* dark shape */}
              <span className="absolute bottom-12 right-0 size-40 rounded-full bg-foreground/70" />
            </div>
            {/* Camera cluster */}
            <div className="absolute left-3.5 top-3.5 grid size-[72px] grid-cols-2 items-center justify-items-center gap-1 rounded-[1.25rem] bg-black/60 p-2">
              <span className="size-6 rounded-full border-2 border-white/10 bg-black" />
              <span className="size-6 rounded-full border-2 border-white/10 bg-black" />
              <span className="size-6 rounded-full border-2 border-white/10 bg-black" />
              <span className="size-2 rounded-full bg-white/20" />
            </div>
          </div>
          {/* "Your design" badge */}
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-pop">
            Your design here
          </span>
        </div>
      </section>

      {/* ── Product list ── */}
      <section aria-labelledby="products-h" className="container-x pb-16 lg:pb-24">
        <h2 id="products-h" className="font-heading text-headline-xl">What are you customizing?</h2>
        <p className="mt-2 text-body-md text-muted-foreground">
          Every product ships with a bubble-free install kit and a lint cloth.
        </p>
        <ul className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-pop">
          {PRODUCTS.map((p, i) => (
            <li key={p.name} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={p.href}
                className="group grid items-center gap-x-6 gap-y-1 p-6 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-heading text-headline-lg">{p.name}</p>
                  <p className="mt-1 text-body-md text-muted-foreground">{p.desc}</p>
                </div>
                <p className="mt-2 text-price-point sm:mt-0 sm:text-right">
                  <span className="font-normal text-muted-foreground">From </span>
                  {rupee(p.from)}
                  {p.was && (
                    <span className="ml-2 font-normal text-muted-foreground line-through">
                      {rupee(p.was)}
                    </span>
                  )}
                </p>
                <span
                  aria-hidden="true"
                  className="hidden size-9 place-items-center rounded-full border border-border transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:grid"
                >
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        aria-labelledby="how-h"
        className="scroll-mt-20 border-y bg-card"
      >
        <div className="container-x py-14 lg:py-20">
          <h2 id="how-h" className="font-heading text-headline-xl">How it works</h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            Three steps from your photo to your door.
          </p>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="flex gap-4">
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-heading text-4xl font-semibold leading-none text-primary/20" aria-hidden="true">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading text-product-title font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-body-md text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Tips + model request ── */}
      <section
        aria-labelledby="tips-h"
        className="container-x grid gap-8 py-14 lg:grid-cols-2 lg:gap-12 lg:py-20"
      >
        <div>
          <h2 id="tips-h" className="font-heading text-headline-xl">Tips for a sharp result</h2>
          <ul className="mt-6 space-y-3">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-3 text-body-md text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Model request card */}
        <div className="self-start rounded-2xl border bg-card p-7 shadow-pop">
          <p className="text-label-sm text-primary">Not listed?</p>
          <h2 className="mt-1.5 font-heading text-headline-lg">
            Can&apos;t find your device?
          </h2>
          <p className="mt-2 text-body-md text-muted-foreground">
            Tell us the brand and model and we&apos;ll add it to the catalogue —
            usually within a few days.
          </p>
          <Button
            asChild
            variant="outline"
            className="press mt-6 h-11 gap-2"
          >
            <Link href="/request-model">
              Request your model <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

    </main>
  );
}
