import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shop/empty-state";
import { productsService } from "@/lib/services/products.service";
import { categoriesService } from "@/lib/services/categories.service";
import type { ApiCategory } from "@/lib/api-types";

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchCategories(): Promise<ApiCategory[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const res = await fetch(`${base}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items: ApiCategory[] = json.data ?? json;
    return Array.isArray(items) ? items.filter((c) => c.isActive) : [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await fetchCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} Skins — Phone & Laptop Skins`,
    description: `Browse ${cat.name.toLowerCase()} phone and laptop skins. ${cat.description ?? ""}`,
    alternates: { canonical: `/designs/${slug}` },
  };
}

export default async function DesignCategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await fetchCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  let products: Awaited<ReturnType<typeof productsService.list>>["items"] = [];
  try {
    const res = await productsService.list({ categoryId: cat.id, limit: 48, sort: "popular" });
    products = res.items;
  } catch {
    products = [];
  }

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
            {products.length} {products.length === 1 ? "design" : "designs"}
            {cat.description ? ` · ${cat.description}` : ""}
          </p>
        </div>
        <Button variant="outline" size="lg" className="h-12" asChild>
          <Link href={`/customize?category=${cat.slug}`}>
            <Brush /> Customize in this style
          </Link>
        </Button>
      </header>

      <div className="mt-10">
        {products.length ? (
          <ProductGrid products={products} />
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
