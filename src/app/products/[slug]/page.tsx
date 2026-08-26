import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download, Droplets, Scissors } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductBuyPanel } from "@/components/shop/product-buy-panel";
import { ProductGrid } from "@/components/shop/product-grid";
import { StarRating } from "@/components/shop/star-rating";
import {
  alsoBought,
  brandOf,
  categoryById,
  compatibleModels,
  discountedPrice,
  finishLabel,
  getSkinBySlug,
  getSkinDesignImage,
  materialLabel,
  relatedSkins,
  SKINS_ALL,
} from "@/lib/api";
import { formatINR } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SKINS_ALL().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skin = getSkinBySlug(slug);
  if (!skin) return {};
  const cat = categoryById(skin.categoryId);
  const title = `${skin.name} — ${cat?.name} Skin`;
  return {
    title: `${title} · ${formatINR(discountedPrice(skin))}`,
    description: `${skin.name} ${cat?.name.toLowerCase()} skin for phones & laptops. ${materialLabel(skin.material)}, ${finishLabel(skin.finish)} finish. Precision cut with camera and port cutouts.`,
    alternates: { canonical: `/products/${slug}` },
    openGraph: { title, type: "website" },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const skin = getSkinBySlug(slug);
  if (!skin) notFound();

  const cat = categoryById(skin.categoryId)!;
  const deviceType = skin.deviceTypes.length === 1 ? skin.deviceTypes[0] : "phone";
  const brand = brandOf(compatibleModels(skin)[0]);
  const similar = relatedSkins(skin);
  const bought = alsoBought(4).filter((s) => s.id !== skin.id);

  const compatPhones = compatibleModels(skin).filter((m) => m.type === "phone");
  const compatLaptops = compatibleModels(skin).filter((m) => m.type === "laptop");

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li><Link href={`/designs/${cat.slug}`} className="hover:text-foreground">{cat.name}</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li aria-current="page" className="font-medium text-foreground">{skin.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ProductGallery
            colors={skin.colors}
            pattern={skin.pattern}
            deviceType={deviceType}
            brand={brand.id}
            photoSrc={getSkinDesignImage(skin)}
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{cat.name}</Badge>
            <Badge variant="outline" className="capitalize">{materialLabel(skin.material)}</Badge>
            <Badge variant="outline">{finishLabel(skin.finish)} finish</Badge>
            {skin.discountPct > 0 && (
              <Badge className="bg-sale text-white">Save {skin.discountPct}%</Badge>
            )}
          </div>

          <h1 className="mt-4 font-heading text-headline-lg tracking-tight">{skin.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <StarRating rating={skin.rating} reviews={skin.reviews} size="md" />
            <span className={`text-sm font-semibold ${skin.inStock ? "text-primary" : "text-destructive"}`}>
              {skin.inStock ? "In stock — ships in 24h" : "Out of stock"}
            </span>
          </div>

          <p className="mt-4 max-w-lg text-body-md text-muted-foreground">
            A precision-cut vinyl skin in {materialLabel(skin.material).toLowerCase()}
            {" "}with a {finishLabel(skin.finish).toLowerCase()} finish. Wraps your device
            edge-to-edge with zero residue on removal.
          </p>

          <div className="mt-8">
            <ProductBuyPanel skin={skin} deviceType={deviceType} />
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
            <AccordionItem value="shipping">
              <AccordionTrigger className="font-medium">
                <span className="flex items-center gap-2"><Download className="size-4 text-primary" /> Shipping & returns</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Free shipping over ₹499 (₹49 below). Dispatched within 24
                hours, delivered in 3–5 days across India. 7-day no-questions
                returns on unapplied skins.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Compatible devices */}
      <section className="mt-20" aria-labelledby="compat-heading">
        <h2 id="compat-heading" className="text-headline-lg">Compatible devices</h2>
        <p className="mt-1.5 text-muted-foreground">
          This skin is cut for {compatPhones.length + compatLaptops.length} models.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...compatPhones.slice(0, 6), ...compatLaptops.slice(0, 3)].map((m) => (
            <Link
              key={m.id}
              href={`/devices/${brandOf(m).slug}/${m.slug}`}
              className="press flex items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-sm hover:border-transparent hover:shadow-card-hover"
            >
              <span>
                <span className="block font-medium capitalize">{brandOf(m).name}</span>
                <span className="text-muted-foreground">{m.name}</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-20" aria-labelledby="similar-heading">
        <h2 id="similar-heading" className="text-headline-lg">Similar designs</h2>
        <div className="mt-8"><ProductGrid skins={similar} /></div>
      </section>

      <section className="mt-20" aria-labelledby="bought-heading">
        <h2 id="bought-heading" className="text-headline-lg">Customers also bought</h2>
        <div className="mt-8"><ProductGrid skins={bought} /></div>
      </section>
    </div>
  );
}
