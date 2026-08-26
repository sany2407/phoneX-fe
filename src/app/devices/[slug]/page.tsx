import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeviceCard } from "@/components/device/device-card";
import {
  countForModel,
  getBrands,
  getModels,
  resolveDeviceSegment,
} from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const segments = ["phones", "laptops"];
  for (const b of getBrands()) segments.push(b.slug);
  return segments.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveDeviceSegment(slug);
  if (!resolved) return {};
  if (resolved.kind === "category") {
    const t = resolved.type;
    return {
      title: `${t === "phone" ? "Phone" : "Laptop"} Skins — Skins by Model`,
      description: `Browse precision-cut ${t} skins by brand and model. Find your exact device.`,
      alternates: { canonical: `/devices/${slug}` },
    };
  }
  return {
    title: `${resolved.brand.name} Skins — Phones & Laptops`,
    description: `${resolved.brand.name} skins cut to the millimetre. Browse every supported ${resolved.brand.name} model.`,
    alternates: { canonical: `/devices/${slug}` },
  };
}

export default async function DeviceSegmentPage({ params }: Props) {
  const { slug } = await params;
  const resolved = resolveDeviceSegment(slug);
  if (!resolved) notFound();

  if (resolved.kind === "category") {
    const type = resolved.type;
    const models = getModels({ type });
    return (
      <div className="container-x py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex gap-1.5">
            <li><Link href="/devices" className="hover:text-foreground">Devices</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium capitalize text-foreground">{type}s</li>
          </ol>
        </nav>
        <header className="mt-4">
          <h1 className="text-headline-lg">{type === "phone" ? "Phone" : "Laptop"} Skins &amp; Wraps</h1>
          <p className="mt-2 text-muted-foreground">
            {models.length} models · pick yours to see only compatible skins.
          </p>
        </header>

        {/* brand shortcuts */}
        <ul className="mt-8 flex flex-wrap gap-2">
          {getBrands(type).map((b) => (
            <li key={b.id}>
              <Link
                href={`/devices/${b.slug}`}
                className="press inline-flex rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:border-transparent hover:shadow-card-hover"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {models.map((model) => (
            <li key={model.id}>
              <DeviceCard model={model} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const brand = resolved.brand;
  const models = getModels({ brandId: brand.id });
  const phones = models.filter((m) => m.type === "phone");
  const laptops = models.filter((m) => m.type === "laptop");

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
        <div>
          <h1 className="text-headline-lg">{brand.name} Skins &amp; Wraps</h1>
          <p className="mt-2 text-muted-foreground">
            {models.length} {models.length === 1 ? "model" : "models"} ·{" "}
            {models.reduce((n, m) => n + countForModel(m), 0)} skins available
          </p>
        </div>
      </header>

      {phones.length > 0 && (
        <section aria-labelledby="brand-phones-heading" className="mt-10">
          <h2 id="brand-phones-heading" className="text-xl font-semibold tracking-tight">Phones</h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {phones.map((model) => (
              <li key={model.id}><DeviceCard model={model} /></li>
            ))}
          </ul>
        </section>
      )}

      {laptops.length > 0 && (
        <section aria-labelledby="brand-laptops-heading" className="mt-12">
          <h2 id="brand-laptops-heading" className="text-xl font-semibold tracking-tight">Laptops</h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {laptops.map((model) => (
              <li key={model.id}><DeviceCard model={model} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
