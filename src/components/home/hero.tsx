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
      {/* ── Subtle ambient gradient — no floating blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(10,63,214,0.18) 0%, transparent 65%)," +
            "radial-gradient(ellipse 60% 50% at 80% 100%, rgba(100,80,200,0.10) 0%, transparent 60%)",
        }}
      />

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 container-x grid min-w-0 items-center gap-10 py-16 sm:gap-14 sm:py-20 lg:grid-cols-2 lg:py-24">

        {/* Left — copy */}
        <div className="min-w-0">

          {/* Eyebrow */}
          <div className="animate-fade-up [animation-delay:0ms]">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-white/60 backdrop-blur-sm">
              <Sparkles className="size-3 text-primary" aria-hidden="true" />
              500+ designs · Custom studio built in
            </span>
          </div>

          {/* Headline — fade-up, no gradient text */}
          <h1 className="mt-5">
            <span className="block animate-fade-up text-display-xl text-white [animation-delay:80ms]">
              Your Device.
            </span>
            <span className="block animate-fade-up text-display-xl text-white [animation-delay:160ms]">
              Your Style.
            </span>
          </h1>

          {/* Body */}
          <p className="animate-fade-up mt-5 max-w-md text-pretty text-base leading-relaxed text-white/50 sm:text-body-lg [animation-delay:240ms]">
            Premium skins for phones, tablets &amp; laptops — cut to the millimetre
            for your exact model. Choose a design or build your own.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap [animation-delay:320ms]">
            <Button
              size="lg"
              className="h-12 w-full gap-2 px-7 text-base sm:w-auto bg-white text-foreground hover:bg-white/92"
              asChild
            >
              <Link href="#find-device">
                Find My Device <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full px-7 text-base sm:w-auto border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
              asChild
            >
              <Link href="/customize">Create Custom Skin</Link>
            </Button>
          </div>

          {/* Stats */}
          <dl className="animate-fade-up mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-8 [animation-delay:400ms]">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dd className="font-heading text-2xl font-semibold tracking-tight text-white">
                  {value}
                </dd>
                <dt className="mt-0.5 text-xs text-white/35 tracking-wide">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Right — orbital phone carousel */}
        <div className="hero-phone-scroll relative z-10 animate-hero-phone [animation-delay:160ms]">
          {/* Desktop orbital carousel */}
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

          {/* Floating glass badges */}
          <span className="animate-hero-phone absolute left-[-16px] top-[48%] z-30 hidden rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md sm:block [animation-delay:220ms]">
            🖐 Matte texture you can feel
          </span>
          <span className="animate-hero-phone absolute bottom-[8%] right-[-16px] z-30 hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md sm:flex [animation-delay:260ms]">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
            Bubble-free fit
          </span>
          <span className="animate-hero-phone absolute right-[10%] top-[-12px] z-30 hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md sm:flex [animation-delay:180ms]">
            <Truck className="size-3.5 text-primary" aria-hidden="true" />
            Ships in 24h
          </span>
        </div>
      </div>

      {/* ── Bottom fade into page ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"
      />
    </section>
  );
}
