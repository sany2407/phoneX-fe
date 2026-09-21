import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SkinArt } from "@/components/artwork/skin-art";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getCategories, getSkins } from "@/lib/api";
import type { ApiCategory } from "@/lib/api-types";

// ─── fetch from API ───────────────────────────────────────────────────────────

async function fetchApiCategories(): Promise<ApiCategory[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const res  = await fetch(`${base}/categories`, {
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: ApiCategory[] = json.data ?? json;
    return Array.isArray(items) ? items.filter((c) => c.isActive) : [];
  } catch {
    return [];
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export async function CategoryStrip() {
  // Fetch API categories; fall back to static ones if the API is unavailable
  const apiCategories = await fetchApiCategories();

  // Static categories are used for SkinArt fallback colours/patterns and count
  const staticCategories = getCategories();

  // Merge: use API data for name/slug/imageUrl, static data for pattern/colors
  const categories = (
    apiCategories.length > 0 ? apiCategories : staticCategories.map((c) => ({
      id:       c.id,
      name:     c.name,
      slug:     c.slug,
      imageUrl: undefined,
      image:    undefined,
      isActive: true,
      createdAt: "",
      description: c.blurb,
    } satisfies ApiCategory))
  ).slice(0, 10);

  return (
    <section className="container-x section-pad" aria-labelledby="designs-heading">
      {/* Header */}
      <ScrollReveal className="reveal flex items-end justify-between gap-4">
        <div>
          <p className="text-label-sm text-primary">Collections</p>
          <h2 id="designs-heading" className="mt-1.5 text-headline-lg">
            Browse by design
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {categories.length} collections, one that&apos;s yours.
          </p>
        </div>
        <Link
          href="/designs"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          All designs <ArrowRight className="size-4" />
        </Link>
      </ScrollReveal>

      {/* Grid */}
      <ScrollReveal threshold={0.05}>
        <ul className="mt-8 grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, i) => {
            // Local skin count (from static data, matched by slug)
            const staticCat = staticCategories.find((s) => s.slug === cat.slug);
            const count = staticCat
              ? getSkins({ categoryIds: [staticCat.id] }).length
              : 0;

            // Image: prefer API imageUrl, then image, then generated SkinArt
            const imgSrc = cat.imageUrl ?? cat.image;

            return (
              <li
                key={cat.id}
                className="reveal min-w-0"
                style={{ "--reveal-delay": `${i * 40}ms` } as React.CSSProperties}
              >
                <Link
                  href={`/designs/${cat.slug}`}
                  className="group block overflow-hidden rounded-xl border bg-card transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,65,200,0.10)]"
                >
                  {/* artwork */}
                  <div className="aspect-4/3 overflow-hidden">
                    <div className="h-full w-full transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.06]">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={cat.name}
                          width={400}
                          height={300}
                          className="h-full w-full object-cover"
                        />
                      ) : staticCat ? (
                        <SkinArt
                          pattern={staticCat.pattern}
                          colors={staticCat.colors}
                        />
                      ) : (
                        // ultimate fallback: solid muted bg
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>
                  </div>

                  {/* label */}
                  <div className="flex items-center justify-between p-3.5">
                    <div>
                      <h3 className="text-sm font-semibold leading-tight tracking-[-0.01em]">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {count > 0 ? `${count} designs` : cat.description ?? ""}
                      </p>
                    </div>
                    <ArrowRight
                      className="size-3.5 shrink-0 translate-x-1 text-primary opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollReveal>
    </section>
  );
}
