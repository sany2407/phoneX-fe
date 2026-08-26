import type { Metadata } from "next";
import Link from "next/link";
import { SkinArt } from "@/components/artwork/skin-art";
import { getCategories, getSkins } from "@/lib/api";

export const metadata: Metadata = {
  title: "Design Categories — Anime, Gaming, Cyberpunk & More",
  description:
    "Discover phone and laptop skins by design category: anime, gaming, cyberpunk, cars, minimal, abstract, nature, marble, space, typography and more.",
  alternates: { canonical: "/designs" },
};

export default function DesignsPage() {
  const categories = getCategories();
  return (
    <div className="container-x py-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="text-label-sm text-primary">Design discovery</p>
        <h1 className="mt-2 text-headline-lg">Designs</h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          Every collection is drawn in-house and cut for your exact device.
          Find a mood, then make it yours.
        </p>
      </header>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => {
          const count = getSkins({ categoryIds: [cat.id] }).length;
          return (
            <li key={cat.id}>
              <Link
                href={`/designs/${cat.slug}`}
                className="group block overflow-hidden rounded-xl border bg-card transition-shadow duration-300 ease-out hover:border-transparent hover:shadow-card-hover"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                    <SkinArt pattern={cat.pattern} colors={cat.colors} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                    <h2 className="font-heading text-lg font-bold tracking-tight">
                      {cat.name}
                    </h2>
                    <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                      {count}
                    </span>
                  </div>
                </div>
                <p className="px-4 py-3.5 text-sm text-muted-foreground">{cat.blurb}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
