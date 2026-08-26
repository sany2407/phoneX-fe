import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DeviceCard } from "@/components/device/device-card";
import { DeviceProduct } from "@/components/device/device-product";
import {
  brandOf,
  countForModel,
  discountedPrice,
  finalPrice,
  getDesignImagesForModel,
  getDeviceHero,
  getDeviceImageSet,
  getBrands,
  getModel,
  getModels,
  getSkinsForModel,
} from "@/lib/api";

type Props = { params: Promise<{ slug: string; model: string }> };

export function generateStaticParams() {
  const out: { slug: string; model: string }[] = [];
  for (const b of getBrands()) {
    for (const m of getModels({ brandId: b.id })) {
      out.push({ slug: b.slug, model: m.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, model: modelSlug } = await params;
  const model = getModel(slug, modelSlug);
  if (!model) return {};
  const count = countForModel(model);
  const brand = brandOf(model);
  return {
    title: `${model.name} Skins & Wraps — ${count} Designs`,
    description: `${count} precision-cut skins and wraps for ${brand.name} ${model.name}. Matte, carbon fiber, leather and more — free shipping over ₹499.`,
    alternates: { canonical: `/devices/${slug}/${modelSlug}` },
    openGraph: { title: `${model.name} Skins & Wraps | phoneX` },
  };
}

export default async function DeviceModelPage({ params }: Props) {
  const { slug, model: modelSlug } = await params;
  const model = getModel(slug, modelSlug);
  if (!model) notFound();

  const brand = brandOf(model);
  const imageSet = getDeviceImageSet(brand.slug, model.slug);
  const hero = getDeviceHero(brand.slug, model.slug);
  const skins = getSkinsForModel(model, { sort: "featured" });
  const designImages = getDesignImagesForModel(brand.slug, model.slug, skins);
  const options = skins.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    colors: s.colors,
    pattern: s.pattern,
    price: discountedPrice(s, model.type),
    original: s.discountPct > 0 ? finalPrice(s, model.type) : undefined,
    inStock: s.inStock,
    material: s.material,
    finish: s.finish,
    rating: s.rating,
    reviews: s.reviews,
  }));

  const sameBrand = getModels({ brandId: brand.id }).filter((m) => m.id !== model.id);
  const others = getModels({ type: model.type }).filter(
    (m) => m.id !== model.id && m.brandId !== brand.id
  );
  const related = [...sameBrand, ...others].slice(0, 4);

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li><Link href="/devices" className="hover:text-foreground">Devices</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li><Link href={`/devices/${slug}`} className="hover:text-foreground">{brand.name}</Link></li>
          <li aria-hidden="true"><ChevronRight className="inline size-3" /></li>
          <li aria-current="page" className="font-medium text-foreground">{model.name}</li>
        </ol>
      </nav>

      <DeviceProduct
        key={model.id}
        modelId={model.id}
        modelName={model.name}
        modelType={model.type}
        brandId={brand.id}
        brandName={brand.name}
        brandSlug={brand.slug}
        skins={options}
        heroSrc={hero?.src}
        gallerySrcs={imageSet?.gallery}
        designImages={designImages}
      />

      {related.length > 0 ? (
        <section aria-labelledby="related-devices-heading" className="mt-20">
          <h2 id="related-devices-heading" className="text-headline-lg">
            You may also like
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((m) => (
              <li key={m.id}>
                <DeviceCard model={m} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
