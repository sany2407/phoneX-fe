import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SkinArt } from "@/components/artwork/skin-art";
import { getCategories, getSkins } from "@/lib/api";

export function CategoryStrip() {
  const categories = getCategories().slice(0, 10);
  return (
    <section className="container-x section-pad" aria-labelledby="designs-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="designs-heading" className="text-headline-lg">
            Browse by design
          </h2>
          <p className="mt-1.5 text-muted-foreground">
            Seventeen collections, one that&apos;s yours.
          </p>
        </div>
        <Link
          href="/designs"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          All designs <ArrowRight className="size-4" />
        </Link>
      </div>

      <ul className="-mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
        {categories.map((cat) => {
          const count = getSkins({ categoryIds: [cat.id] }).length;
          return (
            <li key={cat.id} className="w-[150px] shrink-0 snap-start md:w-auto">
              <Link
                href={`/designs/${cat.slug}`}
                className="group block overflow-hidden rounded-xl border transition-shadow duration-300 ease-out hover:shadow-card-hover"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                    <SkinArt pattern={cat.pattern} colors={cat.colors} />
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-semibold">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{count} designs</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
