import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SkinArt } from "@/components/artwork/skin-art";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getCategories, getSkins } from "@/lib/api";

export function CategoryStrip() {
  const categories = getCategories().slice(0, 10);

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
            Seventeen collections, one that&apos;s yours.
          </p>
        </div>
        <Link
          href="/designs"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          All designs <ArrowRight className="size-4" />
        </Link>
      </ScrollReveal>

      {/* Grid — each card gets its own reveal with stagger */}
      <ScrollReveal threshold={0.05}>
        <ul className="mt-8 grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, i) => {
            const count = getSkins({ categoryIds: [cat.id] }).length;
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
                      <SkinArt pattern={cat.pattern} colors={cat.colors} />
                    </div>
                  </div>

                  {/* label */}
                  <div className="flex items-center justify-between p-3.5">
                    <div>
                      <h3 className="text-sm font-semibold leading-tight tracking-[-0.01em]">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {count} designs
                      </p>
                    </div>
                    {/* chevron — slides in on hover */}
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
