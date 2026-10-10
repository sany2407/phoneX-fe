import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyToken } from "./copy-token";

export const metadata: Metadata = {
  title: "Design System",
  description:
    "phoneX brand tokens: color, typography, spacing, shape and the components used across the store.",
  alternates: { canonical: "/design" },
};

// ─── Color groups ─────────────────────────────────────────────────────────────

type Swatch = { token: string; hex: string; dark: string; name: string; usage: string };

const COLOR_GROUPS: { id: string; title: string; note: string; items: Swatch[] }[] = [
  {
    id: "surfaces",
    title: "Surfaces",
    note: "Warm neutrals. Product photos sit on these — they stay quiet.",
    items: [
      { token: "--background", hex: "#f5f3ef", dark: "#14120f", name: "Background", usage: "Page canvas" },
      { token: "--card",       hex: "#fffdfa", dark: "#1c1a16", name: "Card",       usage: "Cards, popovers, inputs" },
      { token: "--muted",      hex: "#ece8e1", dark: "#26231e", name: "Muted",      usage: "Wells, skeletons" },
      { token: "--accent",     hex: "#e4dfd5", dark: "#302c26", name: "Accent",     usage: "Hover fills, chips" },
      { token: "--border",     hex: "#e2ddd3", dark: "#2f2b25", name: "Border",     usage: "Dividers, outlines" },
    ],
  },
  {
    id: "text",
    title: "Text",
    note: "Warm near-black for reading. One softer step for supporting copy.",
    items: [
      { token: "--foreground",       hex: "#1c1a17", dark: "#f3efe8", name: "Foreground",       usage: "Headings, body" },
      { token: "--muted-foreground", hex: "#655f55", dark: "#a8a196", name: "Muted foreground", usage: "Captions, helper text" },
    ],
  },
  {
    id: "brand",
    title: "Brand",
    note: "One blue. It marks things you can act on or that are selected.",
    items: [
      { token: "--primary",      hex: "#0a3fd6", dark: "#8ea8ff", name: "Primary",      usage: "Buttons, links, selected" },
      { token: "--primary-soft", hex: "#e3e9fc", dark: "#1a2547", name: "Primary soft", usage: "Selected backgrounds" },
      { token: "--ring",         hex: "#0a3fd6", dark: "#8ea8ff", name: "Ring",         usage: "Keyboard focus" },
    ],
  },
  {
    id: "semantic",
    title: "Semantic",
    note: "Only for offers and errors.",
    items: [
      { token: "--sale",        hex: "#9c2a0b", dark: "#ffb59e", name: "Sale",         usage: "Discounts, offer text" },
      { token: "--sale-soft",   hex: "#fbe6dd", dark: "#3a1409", name: "Sale soft",    usage: "Offer backgrounds" },
      { token: "--destructive", hex: "#c42b2b", dark: "#ff9d96", name: "Destructive",  usage: "Errors, remove actions" },
    ],
  },
];

// ─── Type scale ───────────────────────────────────────────────────────────────

const TYPE_SCALE = [
  { cls: "text-display-xl",   name: "Display XL",    spec: "clamp(44–76px), 600, −0.03em",  sample: "Skins that fit like they were made for it." },
  { cls: "text-display-lg",   name: "Display LG",    spec: "clamp(36–56px), 600, −0.028em", sample: "Wrap it your way." },
  { cls: "text-headline-xl",  name: "Headline XL",   spec: "32px, 600, −0.02em",            sample: "Cut to your exact model." },
  { cls: "text-headline-lg",  name: "Headline LG",   spec: "24–32px, 600, −0.015em",        sample: "Pick a design or build your own." },
  { cls: "text-product-title",name: "Product title", spec: "18px, 500, −0.005em",           sample: "Matte black for iPhone 16." },
  { cls: "text-price-point",  name: "Price",         spec: "17px, 600, tabular numerals",   sample: "₹499" },
  { cls: "text-body-lg",      name: "Body LG",       spec: "18px, 400, 1.65",               sample: "Ships across India in 48 hours with a bubble-free install kit." },
  { cls: "text-body-md",      name: "Body MD",       spec: "16px, 400, 1.6",                sample: "Every skin is cut to 0.2 mm tolerance for your exact model." },
  { cls: "text-label-sm",     name: "Label",         spec: "13px, 500, sentence case",      sample: "Free shipping over ₹999" },
];

// ─── Spacing ──────────────────────────────────────────────────────────────────

const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96];

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV = [
  ["Color",          "#color"],
  ["Typography",     "#type"],
  ["Spacing",        "#spacing"],
  ["Shape & depth",  "#shape"],
  ["Components",     "#components"],
  ["Motion",         "#motion"],
] as const;

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ id, title, desc, children }: {
  id: string; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t pt-12 first:border-t-0 first:pt-0">
      <h2 id={`${id}-h`} className="font-heading text-headline-xl">{title}</h2>
      <p className="mt-2 max-w-xl text-body-md text-muted-foreground">{desc}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <header className="max-w-2xl">
        <h1 className="font-heading text-display-lg">Design system</h1>
        <p className="mt-3 text-body-lg text-muted-foreground">
          The tokens and components behind phoneX. The interface stays quiet so
          the skins carry the color. Blue appears only where someone can act.
        </p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[180px_1fr]">
        {/* Sticky side nav */}
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 text-sm">
            {NAV.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-16">

          {/* ── Color ── */}
          <Section id="color" title="Color" desc="Light is the default. Dark values sit beside each swatch. Click a hex to copy it.">
            <div className="space-y-10">
              {COLOR_GROUPS.map((g) => (
                <div key={g.id}>
                  <h3 className="font-heading text-headline-lg">{g.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.note}</p>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {g.items.map((c) => (
                      <li key={c.token} className="overflow-hidden rounded-lg border bg-card shadow-pop">
                        <div className="grid h-20 grid-cols-[2fr_1fr]">
                          <div style={{ backgroundColor: c.hex }} />
                          <div style={{ backgroundColor: c.dark }} />
                        </div>
                        <div className="p-4">
                          <p className="font-medium">{c.name}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{c.usage}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-1">
                            <CopyToken value={c.hex} label={`${c.name} light`} />
                            <CopyToken value={c.dark} label={`${c.name} dark`} />
                          </div>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{c.token}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Typography ── */}
          <Section id="type" title="Typography" desc="Nohemi for headings. Geist Sans for interface and body. Geist Mono only for code and token names.">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="font-heading">Nohemi</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-heading text-4xl font-semibold tracking-tight">Aa Xx 01</p>
                  <p className="mt-2 text-sm text-muted-foreground">Headings, product titles</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Geist Sans</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-sans text-4xl font-medium tracking-tight">Aa Xx 01</p>
                  <p className="mt-2 text-sm text-muted-foreground">Body, buttons, prices</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-mono">Geist Mono</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-mono text-4xl">Aa Xx 01</p>
                  <p className="mt-2 text-sm text-muted-foreground">Code, token names</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border bg-card">
              {TYPE_SCALE.map((t, i) => (
                <div
                  key={t.cls}
                  className={`grid gap-2 p-5 md:grid-cols-[200px_1fr] md:items-baseline ${i > 0 ? "border-t" : ""}`}
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-primary">.{t.cls}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.spec}</p>
                  </div>
                  <p className={`${t.cls} ${["text-label-sm","text-body-lg","text-body-md","text-price-point"].includes(t.cls) ? "" : "font-heading"} max-w-[60ch] break-words`}>
                    {t.sample}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Spacing ── */}
          <Section id="spacing" title="Spacing" desc="4px base. Tight inside components (8–16px), generous between sections (64–96px).">
            <ul className="space-y-3">
              {SPACING.map((s) => (
                <li key={s} className="flex items-center gap-4">
                  <span className="w-10 font-mono text-xs text-muted-foreground">{s}px</span>
                  <span className="h-3 rounded-sm bg-primary/70" style={{ width: s * 2 }} aria-hidden="true" />
                </li>
              ))}
            </ul>
          </Section>

          {/* ── Shape & depth ── */}
          <Section id="shape" title="Shape & depth" desc="Three radii, each with one job. Shadows are warm and layered — borders do most of the separating.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Radius</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ["8px",  "rounded-md",   "Buttons, inputs, badges"],
                    ["16px", "rounded-lg",   "Cards, media, popovers"],
                    ["Full", "rounded-full", "Pills, swatches, avatars"],
                  ].map(([v, cls, use]) => (
                    <div key={v as string} className="flex items-center gap-4">
                      <span className={`size-12 shrink-0 border-2 border-primary bg-primary-soft ${cls as string}`} aria-hidden="true" />
                      <div>
                        <p className="font-medium">{v as string}</p>
                        <p className="text-sm text-muted-foreground">{use as string}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Elevation</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border bg-card p-4 shadow-pop">
                    <p className="font-medium">Resting</p>
                    <p className="text-sm text-muted-foreground">Cards, popovers</p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 shadow-card-hover">
                    <p className="font-medium">Raised</p>
                    <p className="text-sm text-muted-foreground">Product cards on hover</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Glass effect is used on the sticky header only.</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Components ── */}
          <Section id="components" title="Components" desc="Live instances of primitives, then phoneX-specific pieces.">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Buttons */}
              <Card>
                <CardHeader><CardTitle>Buttons</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button>Add to cart</Button>
                    <Button variant="secondary">Save</Button>
                    <Button variant="outline">Preview</Button>
                    <Button variant="ghost">Cancel</Button>
                    <Button variant="destructive">Remove</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <Badge>New drop</Badge>
                  <Badge variant="secondary">Bestseller</Badge>
                  <Badge variant="outline">20% off</Badge>
                  <Badge variant="destructive">Low stock</Badge>
                </CardContent>
              </Card>

              {/* Inputs */}
              <Card>
                <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="you@example.com" aria-label="Email" />
                  <div className="flex gap-2">
                    <Input defaultValue="WELCOME10" aria-label="Coupon code" />
                    <Button variant="outline">Apply</Button>
                  </div>
                  <Input aria-invalid="true" defaultValue="98765" aria-label="Pincode with error" />
                  <p className="text-sm text-destructive">Enter a 6-digit pincode.</p>
                </CardContent>
              </Card>

              {/* Finish selector */}
              <Card>
                <CardHeader><CardTitle>Finish selector</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-label-sm text-muted-foreground">Finish: Carbon fibre</p>
                  <div className="mt-3 flex items-center gap-3" role="radiogroup" aria-label="Finish">
                    {[
                      ["Matte black",   "#1d1d1f", false],
                      ["Carbon fibre",  "#2b2f36", true],
                      ["Sand leather",  "#b79c78", false],
                      ["Forest",        "#34493d", false],
                    ].map(([name, color, on]) => (
                      <button
                        key={name as string}
                        type="button"
                        role="radio"
                        aria-checked={on as boolean}
                        aria-label={name as string}
                        className={`press size-9 rounded-full border border-black/10 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary ${on ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                        style={{ backgroundColor: color as string }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product card + shipping progress */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Product card and shipping progress</CardTitle></CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border bg-card p-3 shadow-pop transition-shadow hover:shadow-card-hover">
                    <div className="aspect-[4/3] rounded-md bg-muted" aria-hidden="true" />
                    <div className="mt-4 px-1 pb-1">
                      <p className="text-label-sm text-muted-foreground">Laptop 15 inch</p>
                      <p className="mt-0.5 font-heading text-product-title">Carbon fibre</p>
                      <p className="mt-1 text-price-point">
                        ₹599{" "}
                        <span className="font-normal text-muted-foreground line-through">₹899</span>
                        <span className="ml-2 text-sm font-medium text-sale">Save ₹300</span>
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm">Add to cart</Button>
                        <Button size="sm" variant="outline">Preview</Button>
                      </div>
                    </div>
                  </div>
                  <div className="self-center">
                    <p className="text-body-md">You are ₹300 away from free shipping.</p>
                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={999}
                      aria-valuenow={699}
                      aria-label="Progress to free shipping"
                    >
                      <div className="h-full w-[70%] rounded-full bg-primary" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">₹699 of ₹999</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Motion ── */}
          <Section id="motion" title="Motion" desc="Motion confirms an action. Nothing moves on its own.">
            <ul className="max-w-xl space-y-3 text-body-md">
              <li><code className="font-mono text-sm">.press</code> — scales to 0.97 for 150ms on tap. Every interactive element.</li>
              <li><code className="font-mono text-sm">.animate-fade-up</code> — single entrance, 400ms. Use once per page.</li>
              <li><code className="font-mono text-sm">.reveal</code> — scroll reveal via IntersectionObserver.</li>
              <li className="text-muted-foreground">All motion is disabled under reduced-motion settings.</li>
            </ul>
          </Section>

        </div>
      </div>
    </div>
  );
}
