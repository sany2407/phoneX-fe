import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localDeviceImage } from "@/lib/data/device-images";
import { cn } from "@/lib/utils";

const IPHONE_HERO = localDeviceImage("apple", "iphone-17-pro");
const IPHONE_SKIN = localDeviceImage("apple", "iphone-17-pro", "17-pro-2.png");
const IPHONE_SKIN_2 = localDeviceImage("apple", "iphone-17-pro", "iphone-17-pro-3.png");

function HeroPhone({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-370/674 w-full", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading="eager"
        fetchPriority={priority ? "high" : "auto"}
        priority={priority}
        className="object-contain object-center drop-shadow-[0_24px_48px_rgba(25,27,37,0.28)]"
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary/50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[480px] rounded-full bg-electric-soft blur-3xl"
      />
      <div className="container-x grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-12">
        <div>
          <p className="animate-hero-copy inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            500+ designs · Custom studio built in
          </p>
          <h1 className="animate-hero-copy mt-5 text-display-lg [animation-delay:60ms]">
            Your Device.
            <br />
            Your Style.
          </h1>
          <p className="animate-hero-copy mt-4 max-w-md text-body-lg text-muted-foreground [animation-delay:120ms]">
            Premium skins for phones and laptops. Choose a design or create
            your own — cut to the millimetre for your exact model.
          </p>
          <div className="animate-hero-copy mt-8 flex flex-wrap gap-3 [animation-delay:180ms]">
            <Button size="lg" className="h-12 px-7 text-base" asChild>
              <Link href="#find-device">
                Find My Device <ArrowRight />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-7 text-base"
              asChild
            >
              <Link href="/customize">Create Custom Skin</Link>
            </Button>
          </div>
          <dl className="animate-hero-copy mt-10 flex flex-wrap gap-x-10 gap-y-4 [animation-delay:240ms]">
            {[
              ["1M+", "skins shipped"],
              ["50+", "devices supported"],
              ["4.8★", "average rating"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-heading text-xl font-bold tracking-tight">{stat}</dd>
                <dd className="text-sm capitalize text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto hidden h-[560px] w-full max-w-lg sm:block lg:h-[640px]">
          <div className="absolute right-0 top-20 w-40 rotate-[8deg] transition-transform duration-200 ease-out lg:top-24 lg:w-48 [@media(hover:hover)_and_(pointer:fine)]:hover:rotate-[5deg]">
            <div className="animate-hero-phone [animation-delay:40ms]">
              <HeroPhone src={IPHONE_SKIN} alt="" sizes="(max-width: 1024px) 160px, 192px" priority />
            </div>
          </div>
          <div className="absolute left-0 top-16 w-40 -rotate-[7deg] transition-transform duration-200 ease-out lg:top-20 lg:w-48 [@media(hover:hover)_and_(pointer:fine)]:hover:rotate-[-4deg]">
            <div className="animate-hero-phone [animation-delay:100ms]">
              <HeroPhone src={IPHONE_HERO} alt="" sizes="(max-width: 1024px) 160px, 192px" priority />
            </div>
          </div>
          <div className="absolute top-12 left-1/2 w-[280px] max-w-none -translate-x-1/2 lg:top-14 lg:w-[310px]">
            <div className="hero-phone-lead animate-hero-phone [animation-delay:160ms]">
              <HeroPhone
                src={IPHONE_SKIN_2}
                alt="iPhone 17 Pro skins and wraps"
                sizes="(max-width: 1024px) 280px, 310px"
                priority
              />
            </div>
          </div>
          <span className="animate-hero-phone absolute left-2 top-[52%] rounded-full border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-pop backdrop-blur [animation-delay:220ms]">
            🖐 Matte texture you can feel
          </span>
          <span className="animate-hero-phone absolute bottom-8 right-2 flex items-center gap-1.5 rounded-full border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-pop backdrop-blur [animation-delay:260ms]">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" /> Bubble-free fit
          </span>
          <span className="animate-hero-phone absolute right-10 top-4 flex items-center gap-1.5 rounded-full border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-pop backdrop-blur [animation-delay:180ms]">
            <Truck className="size-3.5 text-primary" aria-hidden="true" /> Ships in 24h
          </span>
        </div>

        <div className="flex items-end justify-center gap-4 sm:hidden">
          <div className="animate-hero-phone w-28 [animation-delay:40ms]">
            <HeroPhone src={IPHONE_SKIN} alt="" sizes="112px" />
          </div>
          <div className="hero-phone-lead animate-hero-phone w-32 pb-6 [animation-delay:120ms]">
            <HeroPhone
              src={IPHONE_SKIN_2}
              alt="iPhone 17 Pro skins and wraps"
              sizes="128px"
              priority
            />
          </div>
          <div className="animate-hero-phone w-28 [animation-delay:80ms]">
            <HeroPhone src={IPHONE_HERO} alt="" sizes="112px" />
          </div>
        </div>
      </div>
    </section>
  );
}
