import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { localDeviceImage } from "@/lib/data/device-images";
import { cn } from "@/lib/utils";

const IPHONE_HERO = localDeviceImage("apple", "iphone-17-pro");
const IPHONE_SKIN = localDeviceImage("apple", "iphone-17-pro", "17-pro-2.png");
const IPHONE_SKIN_2 = localDeviceImage("apple", "iphone-17-pro", "iphone-17-pro-3.png");

const PHONE_ASPECT = 674 / 370;

/**
 * `width` is the widest CSS size the phone is ever drawn at, so next/image can
 * cap the srcset there instead of falling back to the largest device size.
 */
function HeroPhone({
  src,
  alt,
  width,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={Math.round(width * PHONE_ASPECT)}
      loading="eager"
      priority={priority}
      className={cn(
        "h-auto w-full object-contain drop-shadow-[0_24px_48px_rgba(25,27,37,0.28)]",
        className
      )}
    />
  );
}

export function Hero() {
  return (
    <section className="relative overflow-x-hidden bg-secondary/50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 z-0 hidden size-80 rounded-full bg-electric-soft blur-3xl lg:block lg:-right-40 lg:-top-40 lg:size-[480px]"
      />
      <div className="relative z-10 container-x grid min-w-0 items-center gap-10 py-10 sm:gap-14 sm:py-16 lg:grid-cols-2 lg:py-12">
        <div className="min-w-0">
          <p className="animate-hero-copy inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border bg-background px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs">
            <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="text-pretty">500+ designs · Custom studio built in</span>
          </p>
          <h1 className="animate-hero-copy mt-4 text-[2rem] leading-[1.15] font-bold tracking-tight text-pretty break-words sm:mt-5 sm:text-display-lg [animation-delay:60ms]">
            Your <span className="text-foreground/55">Device.</span>
            <br />
            Your <span className="text-foreground/55">Style.</span>
          </h1>
          <p className="animate-hero-copy mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-body-lg [animation-delay:120ms]">
            Premium skins for phones and laptops. Choose a design or create
            your own — cut to the millimetre for your exact model.
          </p>
          <div className="animate-hero-copy mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap [animation-delay:180ms]">
            <Button size="lg" className="h-12 w-full px-7 text-base sm:w-auto" asChild>
              <Link href="#find-device">
                Find My Device <ArrowRight />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full px-7 text-base sm:w-auto"
              asChild
            >
              <Link href="/customize">Create Custom Skin</Link>
            </Button>
          </div>
          <dl className="animate-hero-copy mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-4 [animation-delay:240ms]">
            {[
              ["1M+", "skins shipped"],
              ["50+", "devices supported"],
              ["4.8★", "average rating"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-heading text-lg font-bold tracking-tight sm:text-xl">{stat}</dd>
                <dd className="text-[11px] capitalize text-muted-foreground sm:text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-52.5 min-[420px]:max-w-60 sm:max-w-lg">
          <div className="absolute right-0 top-[6%] hidden w-40 rotate-[8deg] transition-transform duration-200 ease-out sm:block lg:w-48 [@media(hover:hover)_and_(pointer:fine)]:hover:rotate-[5deg]">
            <div className="animate-hero-phone [animation-delay:40ms]">
              <HeroPhone src={IPHONE_SKIN} alt="" width={192} />
            </div>
          </div>
          <div className="absolute left-0 top-[3%] hidden w-40 rotate-[-7deg] transition-transform duration-200 ease-out sm:block lg:w-48 [@media(hover:hover)_and_(pointer:fine)]:hover:rotate-[-4deg]">
            <div className="animate-hero-phone [animation-delay:100ms]">
              <HeroPhone src={IPHONE_HERO} alt="" width={192} />
            </div>
          </div>
          <div className="relative z-10 mx-auto w-full sm:w-70 lg:w-77.5">
            <div className="hero-phone-lead animate-hero-phone [animation-delay:160ms]">
              <HeroPhone
                src={IPHONE_SKIN_2}
                alt="iPhone 17 Pro skins and wraps"
                width={370}
                priority
              />
            </div>
          </div>
          <span className="animate-hero-phone absolute left-0 top-[52%] z-20 hidden rounded-full border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-pop backdrop-blur sm:block [animation-delay:220ms]">
            🖐 Matte texture you can feel
          </span>
          <span className="animate-hero-phone absolute bottom-4 right-0 z-20 hidden items-center gap-1.5 rounded-full border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-pop backdrop-blur sm:flex [animation-delay:260ms]">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" /> Bubble-free fit
          </span>
          <span className="animate-hero-phone absolute right-8 top-0 z-20 hidden items-center gap-1.5 rounded-full border bg-background/90 px-3 py-1.5 text-xs font-semibold shadow-pop backdrop-blur sm:flex [animation-delay:180ms]">
            <Truck className="size-3.5 text-primary" aria-hidden="true" /> Ships in 24h
          </span>
        </div>
      </div>
    </section>
  );
}
