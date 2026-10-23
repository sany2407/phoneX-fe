import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DeviceCard } from "@/components/device/device-card";
import { DeviceProduct, type DeviceSkinOption } from "@/components/device/device-product";
import { devicesService } from "@/lib/services/devices.service";
import { variantsService } from "@/lib/services/variants.service";

type Props = { params: Promise<{ slug: string; model: string }> };

/**
 * Device-model pages render on demand, not prerendered.
 *
 * Prerendering the whole catalog (~200 models) cost roughly 500 API calls per
 * build — two per page plus `getModelsForBrand` — against a backend limit of
 * 200 requests / 15 minutes. The build exhausted its own quota, so later pages
 * were generated from rate-limited responses and cached as empty. Rendering on
 * demand with `revalidate` keeps them cached without the build-time burst;
 * `dynamicParams` is true by default, so every model still resolves.
 */
export async function generateStaticParams() {
  return [];
}

/** On-demand renders are cached for ten minutes. */
export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, model: modelSlug } = await params;
  try {
    const { model, variants } = await variantsService.getSkinsForModel(slug, modelSlug);
    const brandName = model.brand?.name ?? slug;
    return {
      title: `${model.name} Skins & Wraps — ${variants.length} Options`,
      description: `${variants.length} precision-cut skins and wraps for ${brandName} ${model.name}. Free shipping over ₹499.`,
      alternates: { canonical: `/devices/${slug}/${modelSlug}` },
      openGraph: { title: `${model.name} Skins & Wraps | phoneX` },
    };
  } catch {
    return {};
  }
}

export default async function DeviceModelPage({ params }: Props) {
  const { slug, model: modelSlug } = await params;
  let data;
  try {
    data = await variantsService.getSkinsForModel(slug, modelSlug);
  } catch {
    notFound();
  }
  const { model, variants } = data;
  const brand = model.brand;
  if (!brand) notFound();

  const skins: DeviceSkinOption[] = variants
    .map((v) => {
      const price = Number(v.price);
      const compare = v.comparePrice != null ? Number(v.comparePrice) : NaN;
      // Prefer this variant's own phone mockups, then the product's flat artwork.
      const images = [...(v.images ?? []), ...(v.product?.images ?? [])].filter(Boolean);
      return {
        variantId: v.id,
        productId: v.product?.id ?? "",
        productSlug: v.product?.slug ?? "",
        name: v.product?.name ?? v.sku,
        images: [...new Set(images)],
        price: Number.isFinite(price) ? price : 0,
        original: Number.isFinite(compare) && compare > price ? compare : undefined,
        inStock: v.stock > 0,
        material: v.product?.material ?? "",
        finish: v.product?.finish ?? "",
        rating: v.product?.rating ?? 0,
        reviewCount: v.product?.reviewCount ?? 0,
        category: v.product?.category ?? null,
      };
    })
    .filter((s) => s.productId);

  const sameBrand = await devicesService.getModelsForBrand(slug).catch(() => []);
  const related = sameBrand.filter((m) => m.id !== model.id).slice(0, 4);

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

      <div className="mt-6">
        <DeviceProduct
          key={model.id}
          modelId={model.id}
          modelName={model.name}
          brandId={brand.id}
          brandName={brand.name}
          brandSlug={brand.slug}
          skins={skins}
          heroSrc={model.imageUrl ?? undefined}
        />
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-devices-heading" className="mt-20">
          <h2 id="related-devices-heading" className="text-headline-lg">
            You may also like
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((m) => {
              const rb = m.brand ?? (m.brandId === brand.id ? brand : undefined);
              if (!rb) return null;
              return (
                <li key={m.id}>
                  <DeviceCard brand={rb} model={m} />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
