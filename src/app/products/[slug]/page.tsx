import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Droplets, Scissors } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ProductMedia } from "@/components/shop/product-media";
import { ProductBuyPanel } from "@/components/shop/product-buy-panel";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductReviews } from "@/components/shop/product-reviews";
import { productsService } from "@/lib/services/products.service";
import { priceView } from "@/lib/product-utils";
import type { ApiProduct } from "@/lib/api-types";
import { formatINR } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const { items } = await productsService.list({ limit: 100 });
    return items.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productsService.getBySlug(slug);
    const title = `${product.name} Skin`;
    const { price } = priceView(product);
    return {
      title: price != null ? `${title} · ${formatINR(price)}` : title,
      description: `${product.name} ${product.category?.name?.toLowerCase() ?? ""} skin for phones & laptops. ${product.material}, ${product.finish} finish. Precision cut with camera and port cutouts.`,
      alternates: { canonical: `/products/${slug}` },
      openGraph: { title, type: "website" },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await productsService.getBySlug(slug);
  } catch {
    notFound();
  }

  const { discountPct } = priceView(product);
  const inStock = (product.variants ?? []).some((v) => v.isActive && v.stock > 0);

  // Compatible devices come straight from the variants
  const compat: { key: string; brandSlug?: string; brandName?: string; modelSlug: string; modelName: string }[] = [];
  const seen = new Set<string>();
  for (const v of product.variants ?? []) {
    const dm = v.deviceModel;
    if (!dm || seen.has(dm.id)) continue;
    seen.add(dm.id);
    compat.push({
      key: dm.id,
      brandSlug: dm.brand?.slug,
      brandName: dm.brand?.name,
      modelSlug: dm.slug,
      modelName: dm.name,
    });
  }

  // Similar: same live category, excluding self
  let similar: ApiProduct[] = [];
  try {
    const res = await productsService.list({ categoryId: product.categoryId, limit: 9 });
    similar = res.items.filter((p) => p.id !== product.id).slice(0, 4);
  } catch {
    similar = [];
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          {product.category && (
            <>
              <li><Link href={`/designs/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link></li>
              <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
            </>
          )}
          <li aria-current="page" className="font-medium text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ProductMedia product={product} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
            <Badge variant="outline" className="capitalize">{product.material.replace("-", " ")}</Badge>
            <Badge variant="outline">{product.finish} finish</Badge>
            {discountPct != null && discountPct > 0 && (
              <Badge className="bg-sale text-white">Save {discountPct}%</Badge>
            )}
          </div>

          <h1 className="mt-4 font-heading text-headline-lg tracking-tight">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className={`text-sm font-semibold ${inStock ? "text-primary" : "text-destructive"}`}>
              {inStock ? "In stock — ships in 24h" : "Out of stock"}
            </span>
          </div>

          {product.description && (
            <p className="mt-4 max-w-lg text-body-md text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <ProductBuyPanel product={product} />
          </div>

          {/* Install + shipping info */}
          <Accordion type="single" collapsible className="mt-10 border-t pt-2">
            <AccordionItem value="install">
              <AccordionTrigger className="font-medium">
                <span className="flex items-center gap-2"><Scissors className="size-4 text-primary" /> Installation</span>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                  <li>Clean the surface with the included wipes.</li>
                  <li>Align the skin using the cutouts as guides.</li>
                  <li>Peel &amp; stick from one edge, pressing out bubbles.</li>
                  <li>Warm slightly with a dryer for curved edges.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="font-medium">
                <span className="flex items-center gap-2"><Droplets className="size-4 text-primary" /> Care & durability</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Water-resistant and scratch-rated for daily use. Wipe with a
                damp cloth; avoid solvents. Rated for 2+ years of daily carry
                without fading or peeling.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Compatible devices */}
      {compat.length > 0 && (
        <section className="mt-20" aria-labelledby="compat-heading">
          <h2 id="compat-heading" className="text-headline-lg">Compatible devices</h2>
          <p className="mt-1.5 text-muted-foreground">
            This skin is cut for {compat.length} model{compat.length === 1 ? "" : "s"}.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {compat.slice(0, 9).map((m) => (
              <Link
                key={m.key}
                href={m.brandSlug ? `/devices/${m.brandSlug}/${m.modelSlug}` : "/devices"}
                className="press flex items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-sm hover:border-transparent hover:shadow-card-hover"
              >
                <span>
                  <span className="block font-medium capitalize">{m.brandName}</span>
                  <span className="text-muted-foreground">{m.modelName}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-20" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-headline-lg">Reviews</h2>
        <div className="mt-4">
          <ProductReviews productId={product.id} />
        </div>
      </section>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-20" aria-labelledby="similar-heading">
          <h2 id="similar-heading" className="text-headline-lg">Similar designs</h2>
          <div className="mt-8"><ProductGrid products={similar} /></div>
        </section>
      )}
    </div>
  );
}
