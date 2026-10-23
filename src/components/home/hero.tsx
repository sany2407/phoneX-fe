import Link from "next/link";
import { ArrowRight, Crown, Layers, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneOrbit } from "@/components/home/phone-orbit";

/** Local hero asset path — real files under public/images/devices. */
function localDeviceImage(brandSlug: string, modelSlug: string, file = "hero.png") {
  return `/images/devices/${brandSlug}/${modelSlug}/${file}`;
}

/**
 * Orbit slot 0 is the front phone, 1 the right, 2 the left — so this order
 * reproduces the mock's trio: light/red centre, light ink on the right, the
 * dark red design on the left.
 */
const SLIDES: [
  { src: string; alt: string },
  { src: string; alt: string },
  { src: string; alt: string }
] = [
  {
    src: localDeviceImage("apple", "iphone-17-pro"),
    alt: "iPhone 17 Pro skin with red ink samurai artwork",
  },
  { src: localDeviceImage("apple", "iphone-17-pro", "17-pro-2.png"), alt: "" },
  { src: localDeviceImage("apple", "iphone-17-pro", "iphone-17-pro-3.png"), alt: "" },
];

/** Stat icons, in the order `fetchCounts` returns its figures. */
const STAT_ICONS = [Crown, Smartphone, Layers];

async function fetchCounts(): Promise<{ label: string; value: string }[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const [brandsRes, typesRes, catsRes] = await Promise.all([
      fetch(`${base}/devices/brands`, { next: { revalidate: 600 } }),
      fetch(`${base}/devices/types`, { next: { revalidate: 600 } }),
      fetch(`${base}/categories`, { next: { revalidate: 600 } }),
    ]);
    const brands: { slug: string }[] = (await brandsRes.json().catch(() => null))?.data ?? [];
    const types: { slug: string; _count?: { models: number } }[] =
      (await typesRes.json().catch(() => null))?.data ?? [];
    const cats: unknown[] = (await catsRes.json().catch(() => null))?.data ?? [];
    const models = types.reduce((n, t) => n + (t._count?.models ?? 0), 0);
    return [
      { value: `${brands.length}`, label: "device brands" },
      { value: `${models}`, label: "models supported" },
      { value: `${cats.length}`, label: "collections" },
    ];
  } catch {
    return [];
  }
}

/**
 * Decorative rock ledge the phones stand on.
 *
 * There is no rock photograph in the repo, so this is a drawn silhouette —
 * two jagged ridges with a faint red rim light. It sits above the phones so
 * their bottom edges disappear behind the ledge.
 */
function Rocks() {
  const farRidge =
    "M0 150 L60 128 L128 146 L196 108 L262 138 L330 96 L398 124 L466 86 L536 118 L604 94 L672 126 L742 98 L812 132 L880 104 L948 136 L1018 112 L1088 144 L1150 122 L1200 146";
  const nearRidge =
    "M0 196 L80 176 L168 200 L250 172 L338 194 L420 170 L510 198 L596 176 L684 202 L772 178 L860 204 L946 182 L1034 206 L1120 186 L1200 200";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 240"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-[-4%] bottom-0 z-20 h-[40%] min-h-[110px] w-[108%] blur-[1.5px]"
    >
      <defs>
        <linearGradient id="heroRockFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2825" />
          <stop offset="48%" stopColor="#131110" />
          <stop offset="92%" stopColor="#0d0d0e" />
          <stop offset="100%" stopColor="#0a0a0c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="heroRockNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141210" />
          <stop offset="90%" stopColor="#0b0b0c" />
          <stop offset="100%" stopColor="#0a0a0c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* far ridge */}
      <path d={`${farRidge} L1200 240 L0 240 Z`} fill="url(#heroRockFar)" />
      <path d={farRidge} fill="none" stroke="rgba(240,86,79,0.22)" strokeWidth="1.5" />

      {/* near ridge */}
      <path d={`${nearRidge} L1200 240 L0 240 Z`} fill="url(#heroRockNear)" />
    </svg>
  );
}

export async function Hero() {
  const stats = await fetchCounts();

  return (
    <section className="relative overflow-hidden bg-[#0a0a0c] text-white">
      {/* ── Grid texture, faded toward the corners ── */}
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />

      {/* ── Red ambient bloom ── */}
      <div aria-hidden="true" className="hero-bloom pointer-events-none absolute inset-0" />

      <div className="container-x relative z-10 grid min-w-0 items-center gap-10 py-14 sm:gap-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 lg:pb-12 lg:pt-24">
        {/* ── Left: copy ── */}
        <div className="min-w-0">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2b3652] bg-[#141a2a]/70 px-4 py-1.5 text-[11px] font-medium tracking-wide text-[#b9c6dd] backdrop-blur-sm sm:text-xs">
              <Sparkles className="size-3.5 text-[#9db4ff]" aria-hidden="true" />
              {stats[2]?.value ? `${stats[2].value} collections` : "Premium device skins"} · Custom studio built in
            </span>
          </div>

          <h1 className="mt-6 font-heading">
            <span className="animate-fade-up block text-hero-display text-white [animation-delay:80ms]">
              Your Device.
            </span>
            <span className="animate-fade-up block text-hero-display text-[#f0564f] [animation-delay:160ms]">
              Your Style.
            </span>
          </h1>

          <p className="animate-fade-up mt-6 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-white/60 [animation-delay:240ms] sm:text-lg">
            Premium skins for phones, tablets &amp; laptops — cut to the millimetre
            for your exact model. Choose a design or build your own.
          </p>

          <div className="animate-fade-up mt-9 flex flex-col gap-3 [animation-delay:320ms] sm:flex-row sm:flex-wrap sm:gap-8">
            <Button
              size="lg"
              className="h-14 w-full gap-3 rounded-[10px] bg-white px-10 text-base font-semibold text-[#0a0a0c] transition-colors hover:bg-white/90 sm:w-auto"
              asChild
            >
              <Link href="#find-device">
                Find My Device <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full rounded-[10px] border-white/35 bg-transparent px-10 text-base font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5 hover:text-white sm:w-auto"
              asChild
            >
              <Link href="/customize">Create Custom Skin</Link>
            </Button>
          </div>

          {/* ── Live catalogue stats ── */}
          {stats.length > 0 && (
            <dl className="animate-fade-up mt-12 flex flex-wrap items-center gap-x-6 gap-y-6 [animation-delay:400ms] sm:gap-x-8">
              {stats.map(({ value, label }, i) => {
                const Icon = STAT_ICONS[i] ?? Layers;
                return (
                  <div key={label} className="flex items-center gap-3 sm:gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/70">
                      <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col-reverse gap-1">
                      <dt className="text-[11px] tracking-wide text-white/50 sm:text-[13px]">
                        {label}
                      </dt>
                      <dd className="font-heading text-[28px] font-semibold leading-none tracking-tight text-white">
                        {value}
                      </dd>
                    </div>
                    {i < stats.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="ml-2 hidden h-11 w-px bg-white/12 sm:block"
                      />
                    )}
                  </div>
                );
              })}
            </dl>
          )}
        </div>

        {/* ── Right: phone showcase ── */}
        <div className="order-[-1] lg:order-none">
          <div className="hero-stage relative mx-auto w-full max-w-[560px] lg:max-w-none">
            <span aria-hidden="true" className="hero-arc" />
            <span aria-hidden="true" className="hero-underglow" />

            <div className="relative z-10 animate-hero-phone [animation-delay:160ms]">
              <PhoneOrbit slides={SLIDES} />
            </div>

            <Rocks />
          </div>
        </div>
      </div>
    </section>
  );
}
