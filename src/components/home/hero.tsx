import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneOrbit } from "@/components/home/phone-orbit";
import { localDeviceImage } from "@/lib/data/device-images";

const SLIDES: [
  { src: string; alt: string },
  { src: string; alt: string },
  { src: string; alt: string }
] = [
  { src: localDeviceImage("apple", "iphone-17-pro", "iphone-17-pro-3.png"), alt: "iPhone 17 Pro skins and wraps" },
  { src: localDeviceImage("apple", "iphone-17-pro"),                        alt: "" },
  { src: localDeviceImage("apple", "iphone-17-pro", "17-pro-2.png"),        alt: "" },
];

const STATS = [
  { value: "1M+",  label: "skins shipped" },
  { value: "50+",  label: "devices" },
  { value: "4.8★", label: "avg rating" },
];

export function Hero() {
  return (
    <section className="relative overflow-x-clip bg-foreground text-background">
      {/* ── Gradient orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-orb absolute -left-32 -top-32 size-[500px] rounded-full bg-electric/25 blur-[120px]" />
        <div className="animate-orb-slow absolute -bottom-40 -right-40 size-[600px] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* ── Grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 container-x grid min-w-0 items-center gap-10 py-16 sm:gap-14 sm:py-20 lg:grid-cols-2 lg:py-24">

        {/* Left — copy */}
        <div className="min-w-0">
          {/* Eyebrow */}
          <div className="animate-fade-up [animation-delay:0ms]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70 backdrop-blur-sm">
              <Sparkles className="size-3 text-electric" aria-hidden="true" />
              500+ designs · Custom studio built in
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-5 overflow-hidden">
            <span className="block animate-word-up text-display-xl text-white [animation-delay:80ms]">
              Your Device.
            </span>
            <span className="block animate-word-up text-display-xl [animation-delay:160ms]">
              <span className="text-white">Your </span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #4d8eff 0%, #a78bfa 50%, #60a5fa 100%)",
                }}
              >
                Style.
              </span>
            </span>
          </h1>

          {/* Body */}
          <p className="animate-fade-up mt-5 max-w-md text-pretty text-base leading-relaxed text-white/55 sm:text-body-lg [animation-delay:240ms]">
            Premium skins for phones, tablets &amp; laptops — cut to the millimetre
            for your exact model. Choose a design or build your own.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap [animation-delay:320ms]">
            <Button
              size="lg"
              className="h-12 w-full gap-2 px-7 text-base sm:w-auto bg-white text-foreground hover:bg-white/90 shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
              asChild
            >
              <Link href="#find-device">
                Find My Device <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full px-7 text-base sm:w-auto border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/customize">Create Custom Skin</Link>
            </Button>
          </div>

          {/* Stats */}
          <dl className="animate-fade-up mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-8 [animation-delay:400ms]">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dd className="font-heading text-2xl font-bold tracking-tight text-white">
                  {value}
                </dd>
                <dt className="mt-0.5 text-xs text-white/40 uppercase tracking-[0.06em]">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — orbital phone carousel */}
        <div className="hero-phone-scroll relative z-10 animate-hero-phone [animation-delay:160ms]">
          {/* Desktop orbital carousel — hidden on mobile */}
          <div className="hidden sm:block">
            <PhoneOrbit slides={SLIDES} />
          </div>

          {/* Mobile — single static front phone */}
          <div className="mx-auto w-[200px] sm:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SLIDES[0].src}
              alt={SLIDES[0].alt}
              className="h-auto w-full object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Floating glass badges — pinned relative to this wrapper */}
          <span className="animate-hero-phone absolute left-[-16px] top-[48%] z-30 hidden rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white shadow-pop backdrop-blur-md sm:block [animation-delay:220ms]">
            🖐 Matte texture you can feel
          </span>
          <span className="animate-hero-phone absolute bottom-[8%] right-[-16px] z-30 hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white shadow-pop backdrop-blur-md sm:flex [animation-delay:260ms]">
            <ShieldCheck className="size-3.5 text-electric" aria-hidden="true" />
            Bubble-free fit
          </span>
          <span className="animate-hero-phone absolute right-[10%] top-[-12px] z-30 hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white shadow-pop backdrop-blur-md sm:flex [animation-delay:180ms]">
            <Truck className="size-3.5 text-electric" aria-hidden="true" />
            Ships in 24h
          </span>
        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"
      />
    </section>
  );
}
