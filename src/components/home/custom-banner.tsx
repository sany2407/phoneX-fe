import Link from "next/link";
import { ArrowRight, Brush, Layers, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const FEATURES = [
  { Icon: Brush,    label: "Upload & draw" },
  { Icon: Layers,   label: "Layers & templates" },
  { Icon: ScanLine, label: "True-to-device preview" },
] as const;

export function CustomBanner() {
  return (
    <section className="container-x pb-4">
      <ScrollReveal className="reveal">
        <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-background sm:px-12 lg:px-16 lg:py-20">

          {/* ── Ambient orbs ── */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* top-left */}
            <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-electric/35 blur-[100px] animate-orb" />
            {/* bottom-right */}
            <div className="absolute -bottom-32 right-10 size-80 rounded-full bg-violet-500/25 blur-[80px] animate-orb-slow" />
            {/* centre accent */}
            <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[80px]" />
          </div>

          {/* ── Subtle grid texture ── */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* ── Content ── */}
          <div className="relative max-w-xl">
            <p className="text-label-sm tracking-[0.08em] text-electric">phoneX studio</p>

            <h2 className="mt-3 font-heading text-headline-lg text-white">
              Can&apos;t find it?{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #60a5fa 0%, #a78bfa 60%, #f472b6 100%)",
                }}
              >
                Design it.
              </span>
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/65">
              Upload a photo, add text and stickers, and preview your design on
              your exact device before you order.
            </p>

            <ul className="mt-6 grid gap-2.5 text-sm text-background/75 sm:grid-cols-3">
              {FEATURES.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-3.5 text-electric" aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="group mt-8 h-12 gap-2 bg-white px-7 text-base text-zinc-900 shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:bg-white/92 transition-all duration-200"
              asChild
            >
              <Link href="/customize">
                Open the Studio
                <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
