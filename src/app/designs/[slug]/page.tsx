import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shop/empty-state";
import { getCategories, getCategoryBySlug, getSkins } from "@/lib/api";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  return {
    title: `${cat.name} Skins — Phone & Laptop Skins`,
    description: `Browse ${cat.name.toLowerCase()} phone and laptop skins. ${cat.blurb}.`,
    alternates: { canonical: `/designs/${slug}` },
  };
}

export default async function DesignCategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();
  const skins = getSkins({ categoryIds: [cat.id], sort: "popular" });

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex gap-1.5">
          <li><Link href="/designs" className="hover:text-foreground">Designs</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">{cat.name}</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-headline-lg">{cat.name} Skins</h1>
          <p className="mt-1.5 text-muted-foreground" aria-live="polite">
            {skins.length} {skins.length === 1 ? "design" : "designs"} · {cat.blurb}
          </p>
        </div>
        <Button variant="outline" size="lg" className="h-12" asChild>
          <Link href={`/customize?category=${cat.slug}`}>
            <Brush /> Customize in this style
          </Link>
        </Button>
      </header>

      <div className="mt-10">
        {skins.length ? (
          <ProductGrid skins={skins} />
        ) : (
          <EmptyState
            icon={Brush}
            title={`No ${cat.name.toLowerCase()} skins yet`}
            description="This collection is being curated. In the meantime, create your own take on it."
            actionLabel="Design your own"
            actionHref="/customize"
          />
        )}
      </div>
    </div>
  );
}
