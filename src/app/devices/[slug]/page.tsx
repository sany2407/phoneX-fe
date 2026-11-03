import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeviceCollectionGrid, type DeviceLineupItem } from "@/components/device/device-collection-grid";
import { BrandLogo } from "@/components/device/brand-logo";
import { devicesService } from "@/lib/services/devices.service";
import type {
  ApiAvailableCategory,
  ApiBrand,
  ApiDeviceModel,
  ApiDeviceType,
} from "@/lib/api-types";
import { ApiError } from "@/lib/api-client";

type Props = { params: Promise<{ slug: string }> };

// Legacy category slugs + raw device-type slugs
const CATEGORY_TO_TYPE: Record<string, string> = {
  phones: "smartphone",
  tablets: "tablet",
  laptops: "laptop",
};

type Resolution =
  | { kind: "category"; typeSlug: string; typeName: string; models: ApiDeviceModel[] }
  | { kind: "brand"; brand: ApiBrand; models: ApiDeviceModel[] }
  | { kind: "failed" };

/**
 * Resolve a segment to a page. `null` means the segment genuinely does not
 * exist (404); "failed" means the catalogue could not be reached, which must
 * never be shown as "no models" or turned into a 404.
 */
async function resolveSegment(slug: string): Promise<Resolution | null> {
  if (CATEGORY_TO_TYPE[slug]) {
    const typeSlug = CATEGORY_TO_TYPE[slug];
    try {
      const [types, models] = await Promise.all([
        devicesService.getDeviceTypes(),
        devicesService.getModelsByType(typeSlug),
      ]);
      const typeName = types.find((t) => t.slug === typeSlug)?.name ?? typeSlug;
      return { kind: "category", typeSlug, typeName, models };
    } catch {
      return { kind: "failed" };
    }
  }

  let types: ApiDeviceType[];
  try {
    types = await devicesService.getDeviceTypes();
  } catch {
    return { kind: "failed" };
  }

  // Raw device-type slug (e.g. /devices/earbuds)
  if (types.some((t) => t.slug === slug)) {
    const typeName = types.find((t) => t.slug === slug)?.name ?? slug;
    try {
      const models = await devicesService.getModelsByType(slug);
      return { kind: "category", typeSlug: slug, typeName, models };
    } catch {
      return { kind: "failed" };
    }
  }

  // Brand slug
  try {
    const [brand, models] = await Promise.all([
      devicesService.getBrandBySlug(slug),
      devicesService.getModelsForBrand(slug),
    ]);
    return { kind: "brand", brand, models };
  } catch (err) {
    return err instanceof ApiError && err.isNotFound ? null : { kind: "failed" };
  }
}

/**
 * Collections are fetched separately from the device lineup, so a failure
 * there must not read as "this brand has no collections".
 */
function CollectionSection({
  categories,
  items,
}: {
  categories: ApiAvailableCategory[] | null;
  items: DeviceLineupItem[];
}) {
  if (categories === null) {
    return (
      <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
        We couldn&apos;t load the skin collections just now. Please refresh in a
        moment.
      </div>
    );
  }
  return <DeviceCollectionGrid categories={categories} items={items} />;
}

/**
 * Rendered on demand rather than prerendered — same reason as
 * `devices/[slug]/[model]/page.tsx`. Prerendering every brand and type page
 * costs ~130 API calls per build against a shared 200 req / 15 min backend
 * quota, so a rebuild or two in the same window exhausted it and later pages
 * were generated from rate-limited responses.
 */
export async function generateStaticParams() {
  return [];
}

/** On-demand renders are cached for ten minutes. */
export const revalidate = 600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveSegment(slug);
  if (!resolved || resolved.kind === "failed") return {};
  if (resolved.kind === "category") {
    return {
      title: `${resolved.typeName} Skins — Shop by Collection`,
      description: `Browse precision-cut ${resolved.typeName.toLowerCase()} skin collections, filtered by brand. Find a design you love for your exact device.`,
      alternates: { canonical: `/devices/${slug}` },
    };
  }
  return {
    title: `${resolved.brand.name} Skins & Wraps — Collections`,
    description: `Shop ${resolved.brand.name} skin collections cut to the millimetre for every supported ${resolved.brand.name} model.`,
    alternates: { canonical: `/devices/${slug}` },
  };
}

export default async function DeviceSegmentPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveSegment(slug);
  if (!resolved) notFound();

  if (resolved.kind === "failed") {
    return (
      <div className="container-x py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex gap-1.5">
            <li><Link href="/devices" className="hover:text-foreground">Devices</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium capitalize text-foreground">{slug}</li>
          </ol>
        </nav>
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
          We couldn&apos;t load this device catalogue just now. Please refresh in a moment.
        </div>
      </div>
    );
  }

  if (resolved.kind === "category") {
    const { typeName, models } = resolved;
    const [brands, categories] = await Promise.all([
      devicesService.getBrands().catch(() => []),
      devicesService
        .getAvailableCategories({ type: resolved.typeSlug }, { revalidate: 600 })
        .catch(() => null),
    ]);
    const brandById = new Map(brands.map((b) => [b.id, b]));
    return (
      <div className="container-x py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex gap-1.5">
            <li><Link href="/devices" className="hover:text-foreground">Devices</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium capitalize text-foreground">{typeName}s</li>
          </ol>
        </nav>
        <header className="mt-4">
          <h1 className="text-headline-lg">{typeName} Skins &amp; Wraps</h1>
          <p className="mt-2 text-muted-foreground">
            Cut for {models.length} {models.length === 1 ? "model" : "models"}
            {categories !== null && categories.length > 0 && (
              <>
                {" "}· {categories.length}{" "}
                {categories.length === 1 ? "skin collection" : "skin collections"}
              </>
            )}
            .
          </p>
        </header>

        <CollectionSection
          categories={categories}
          items={models.flatMap((model) => {
            const brand = model.brand ?? brandById.get(model.brandId);
            return brand ? [{ model, brand }] : [];
          })}
        />
      </div>
    );
  }

  const { brand, models } = resolved;
  const categories = await devicesService
    .getAvailableCategories({ brand: brand.slug }, { revalidate: 600 })
    .catch(() => null);

  return (
    <div className="container-x py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex gap-1.5">
          <li><Link href="/devices" className="hover:text-foreground">Devices</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">{brand.name}</li>
        </ol>
      </nav>

      <header className="mt-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          {brand.logoUrl && (
            <BrandLogo
              name={brand.name}
              src={brand.logoUrl}
              className="size-14 rounded-2xl bg-white ring-1 ring-black/5"
              imageClassName="p-2"
            />
          )}
          <div>
            <h1 className="text-headline-lg">{brand.name} Skins &amp; Wraps</h1>
            <p className="mt-2 text-muted-foreground">
              Cut for {models.length} {models.length === 1 ? "model" : "models"}
              {categories !== null && categories.length > 0 && (
                <>
                  {" "}· {categories.length}{" "}
                  {categories.length === 1 ? "skin collection" : "skin collections"}
                </>
              )}
              .
            </p>
          </div>
        </div>
      </header>

      <CollectionSection
        categories={categories}
        items={models.map((model) => ({ model, brand: model.brand ?? brand }))}
      />
    </div>
  );
}
