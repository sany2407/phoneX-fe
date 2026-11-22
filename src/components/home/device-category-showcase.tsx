import Link from "next/link";
import type { ElementType } from "react";
import {
  ArrowRightIcon as ArrowRight,
  CubeIcon as Cpu,
  FrameIcon as Tablet,
  LaptopIcon as Laptop,
  MagicWandIcon as Sparkles,
  MobileIcon as Phone,
  SpeakerLoudIcon as Earbuds,
  StopwatchIcon as Watch,
} from "@radix-ui/react-icons";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { devicesService } from "@/lib/services/devices.service";
import type { ApiDeviceType } from "@/lib/api-types";
import { cn } from "@/lib/utils";

type Tone = {
  /** Plural label shown on the card. */
  label: string;
  /** One-line description of the devices in this category. */
  blurb: string;
  icon: ElementType;
  /** Card background gradient. */
  surface: string;
  /** Soft colour bloom behind the icon. */
  glow: string;
  /** Concentric ring around the icon. */
  ring: string;
  /** Icon tile text colour. */
  iconColor: string;
};

const TONES: Record<string, Tone> = {
  smartphone: {
    label: "Phones",
    blurb: "iPhone, Samsung, Pixel & more",
    icon: Phone,
    surface: "from-[#e7edff] via-[#f2f6ff] to-[#fffdfa]",
    glow: "bg-[#8ea8ff]/45",
    ring: "border-primary/15",
    iconColor: "text-primary",
  },
  tablet: {
    label: "Tablets",
    blurb: "iPad, Galaxy Tab & Android",
    icon: Tablet,
    surface: "from-[#efe9fc] via-[#f7f3ff] to-[#fffdfa]",
    glow: "bg-[#b79cff]/40",
    ring: "border-violet-500/15",
    iconColor: "text-violet-600",
  },
  laptop: {
    label: "Laptops",
    blurb: "MacBook, Windows & gaming",
    icon: Laptop,
    surface: "from-[#fbf0df] via-[#fdf7ee] to-[#fffdfa]",
    glow: "bg-[#f0bd6a]/40",
    ring: "border-amber-500/15",
    iconColor: "text-amber-700",
  },
  earbuds: {
    label: "Earbuds",
    blurb: "Cases, pods & charging boxes",
    icon: Earbuds,
    surface: "from-[#e5f5ec] via-[#f2fbf6] to-[#fffdfa]",
    glow: "bg-[#74d3a2]/40",
    ring: "border-emerald-500/15",
    iconColor: "text-emerald-700",
  },
  smartwatch: {
    label: "Smartwatches",
    blurb: "Watch bodies, straps & bands",
    icon: Watch,
    surface: "from-[#fbe8e6] via-[#fdf3f1] to-[#fffdfa]",
    glow: "bg-[#f09a92]/40",
    ring: "border-rose-500/15",
    iconColor: "text-rose-600",
  },
};

/** Preferred order — anything else the API adds lands after these. */
const TYPE_ORDER = ["smartphone", "tablet", "laptop", "earbuds", "smartwatch"];

/**
 * Rendered when the catalogue request fails, so the section still gives
 * shoppers a way into every device category instead of silently vanishing.
 * Counts are omitted in that state — we never invent a "0 models" figure.
 */
const CORE_TYPES: ApiDeviceType[] = TYPE_ORDER.map((slug) => ({
  id: slug,
  name: TONES[slug]?.label ?? slug,
  slug,
  isActive: true,
  createdAt: "",
}));

function toneFor(type: ApiDeviceType): Tone {
  return (
    TONES[type.slug] ?? {
      label: type.name,
      blurb: `Skins & wraps for ${type.name.toLowerCase()}`,
      icon: Cpu,
      surface: "from-[#ece8e1] via-[#f6f3ee] to-[#fffdfa]",
      glow: "bg-foreground/10",
      ring: "border-foreground/10",
      iconColor: "text-muted-foreground",
    }
  );
}

function modelCount(type: ApiDeviceType): number | null {
  return type._count ? type._count.models ?? 0 : null;
}

function orderIndex(slug: string): number {
  const i = TYPE_ORDER.indexOf(slug);
  return i === -1 ? TYPE_ORDER.length : i;
}

async function loadTypes(): Promise<{ types: ApiDeviceType[]; live: boolean }> {
  try {
    const types = (await devicesService.getDeviceTypes({ revalidate: 300 })).filter(
      (type) => type.isActive
    );
    if (types.length === 0) return { types: CORE_TYPES, live: false };
    return {
      types: [...types].sort(
        (a, b) => orderIndex(a.slug) - orderIndex(b.slug) || a.name.localeCompare(b.name)
      ),
      live: true,
    };
  } catch {
    return { types: CORE_TYPES, live: false };
  }
}

function DeviceCategoryCard({
  type,
  badge,
  count,
  delay,
}: {
  type: ApiDeviceType;
  badge?: string;
  count: number | null;
  delay: number;
}) {
  const tone = toneFor(type);
  const Icon = tone.icon;
  const subline =
    count === null ? tone.blurb : count > 0 ? `${count} models` : "Launching soon";

  return (
    <ScrollReveal
      className="reveal h-full"
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      <Card
        className={cn(
          "group relative h-full gap-0 overflow-hidden py-0 ring-1 ring-black/[0.04]",
          "bg-gradient-to-br",
          "transition-[transform,box-shadow] duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-card-hover",
          tone.surface
        )}
      >
        <Link
          href={`/devices/${type.slug}`}
          className="flex h-full flex-col p-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          aria-label={`Shop ${tone.label} skins${count !== null ? ` — ${count} models` : ""}`}
        >
          <div className="flex items-start justify-between gap-2">
            {badge ? (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.08em]",
                  badge === "Bestseller"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/70 text-muted-foreground ring-1 ring-black/5 backdrop-blur-sm"
                )}
              >
                {badge}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}

            <ArrowRight
              aria-hidden="true"
              className="size-4 -translate-x-1 text-foreground/45 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>

          {/* Device icon, floating on a soft halo */}
          <div className="relative flex flex-1 items-center justify-center py-5">
            <span
              aria-hidden="true"
              className={cn("absolute size-24 rounded-full blur-2xl", tone.glow)}
            />
            <span
              aria-hidden="true"
              className={cn(
                "absolute size-[5.25rem] rounded-full border",
                tone.ring
              )}
            />
            <span
              className={cn(
                "relative grid size-16 place-items-center rounded-2xl bg-white/75 shadow-[0_2px_10px_rgba(28,26,23,0.06)] ring-1 ring-black/[0.04] backdrop-blur-sm",
                tone.iconColor
              )}
            >
              <Icon className="size-8" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-auto">
            <h3 className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
              {tone.label}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{subline}</p>
          </div>
        </Link>
      </Card>
    </ScrollReveal>
  );
}

/**
 * "Shop by device" — the entry point for every device category the catalogue
 * supports, placed directly under the hero.
 *
 * Device types come from the live API, including the ones with no models yet
 * (they get an honest "Launching soon" badge rather than being hidden). A
 * failed request falls back to the core categories with no counts.
 */
export async function DeviceCategoryShowcase() {
  const { types, live } = await loadTypes();

  const counts = types.map(modelCount);
  const topCount = live ? Math.max(...counts.map((c) => c ?? 0)) : 0;
  // Exactly one "Bestseller" badge, on the category with the most models.
  const bestId =
    topCount > 0 ? types[counts.findIndex((count) => count === topCount)]?.id : undefined;

  return (
    <section
      className="container-x section-pad"
      aria-labelledby="device-categories-heading"
    >
      <ScrollReveal className="reveal flex items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-label-sm text-primary">Device categories</p>
          <h2 id="device-categories-heading" className="mt-1.5 text-headline-lg">
            Shop by device
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Phones, tablets, laptops and more — every skin is precision-cut for
            your exact model.
          </p>
        </div>
        <Link
          href="/devices"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          All devices <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </ScrollReveal>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {types.map((type, i) => {
          const count = counts[i];
          const badge =
            count === 0
              ? "Coming soon"
              : type.id === bestId
                ? "Bestseller"
                : undefined;

          return (
            <li key={type.id} className="min-w-0">
              <DeviceCategoryCard
                type={type}
                badge={badge}
                count={count}
                delay={Math.min(i, 5) * 50}
              />
            </li>
          );
        })}

        {/* Custom studio — the "build your own" category */}
        <li className="min-w-0">
          <ScrollReveal
            className="reveal h-full"
            style={{ "--reveal-delay": "300ms" } as React.CSSProperties}
          >
            <Card className="group relative h-full gap-0 overflow-hidden bg-[#1c1a17] py-0 text-white ring-1 ring-black/10 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-primary/30 blur-3xl"
              />
              <Link
                href="/customize"
                className="relative flex h-full flex-col p-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
                aria-label="Create a custom skin in the studio"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.08em] text-[#1c1a17]">
                    Custom
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 -translate-x-1 text-white/50 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>

                <div className="relative flex flex-1 items-center justify-center py-5">
                  <span
                    aria-hidden="true"
                    className="absolute size-24 rounded-full bg-white/10 blur-2xl"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute size-[5.25rem] rounded-full border border-white/15"
                  />
                  <span className="relative grid size-16 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm">
                    <Sparkles className="size-8" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-auto">
                  <h3 className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
                    Custom skins
                  </h3>
                  <p className="mt-1 text-xs text-white/55">
                    Upload art, build your own
                  </p>
                </div>
              </Link>
            </Card>
          </ScrollReveal>
        </li>
      </ul>

      <div className="mt-6 sm:hidden">
        <Link
          href="/devices"
          className="flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-semibold text-primary glass-sm"
        >
          All devices <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
