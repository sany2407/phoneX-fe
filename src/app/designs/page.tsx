import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
import { productsService } from "@/lib/services/products.service";
import { categoriesService } from "@/lib/services/categories.service";
import type { ApiCategory } from "@/lib/api-types";

export const metadata: Metadata = {
  title: "Design Categories",
  description:
    "Discover phone and laptop skins by design category. New collections land as creators publish them.",
  alternates: { canonical: "/designs" },
};

async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const items = await categoriesService.getAll({ revalidate: 300 });
    return Array.isArray(items) ? items.filter((c) => c.isActive) : [];
  } catch {
    return [];
  }
}

export default async function DesignsPage() {
  const categories = await fetchCategories();
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

      {categories.length === 0 ? (
        <p className="mt-10 rounded-xl border bg-card p-8 text-center text-muted-foreground">
          Collections are being curated — check back soon, or design your own
          in the studio.
        </p>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => {
            const count = cat._count?.products ?? 0;
            return (
              <li key={cat.id}>
                <Link
                  href={`/designs/${cat.slug}`}
                  className="group block overflow-hidden rounded-xl border bg-card transition-shadow duration-300 ease-out hover:border-transparent hover:shadow-card-hover"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-secondary/60">
                    {cat.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-muted-foreground/40">
                        <Layers className="size-10" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                      <h2 className="font-heading text-lg font-bold tracking-tight">
                        {cat.name}
                      </h2>
                      <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                        {count}
                      </span>
                    </div>
                  </div>
                  {cat.description && (
                    <p className="px-4 py-3.5 text-sm text-muted-foreground">{cat.description}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
