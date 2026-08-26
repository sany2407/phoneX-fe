import type { Metadata } from "next";
import Link from "next/link";
import { Laptop, Smartphone } from "lucide-react";
import { DeviceCard } from "@/components/device/device-card";
import { getBrands, getModels } from "@/lib/api";
import type { DeviceType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Device Catalog — Skins & Wraps by Phone & Laptop",
  description:
    "Find skins and wraps for your exact device. Browse phones and laptops by brand — Apple, Samsung, OnePlus, Google, Dell, HP, Lenovo, ASUS and more.",
  alternates: { canonical: "/devices" },
};

export default function DevicesPage() {
  const phoneModels = getModels({ type: "phone" });
  const laptopModels = getModels({ type: "laptop" });
  const brands = getBrands();

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="text-label-sm text-primary">Shop by device</p>
        <h1 className="mt-2 text-headline-lg">Skins &amp; Wraps</h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          Pick your model — every skin is precision-cut for that exact phone or laptop.
        </p>
      </header>

      <ul className="mt-8 flex flex-wrap gap-2">
        {brands.map((b) => (
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

      <ModelCollection
        type="phone"
        models={phoneModels}
        title="Phone Skins & Wraps"
        href="/devices/phones"
      />
      <ModelCollection
        type="laptop"
        models={laptopModels}
        title="Laptop Skins & Wraps"
        href="/devices/laptops"
      />
    </div>
  );
}

function ModelCollection({
  type,
  models,
  title,
  href,
}: {
  type: DeviceType;
  models: ReturnType<typeof getModels>;
  title: string;
  href: string;
}) {
  const Icon = type === "phone" ? Smartphone : Laptop;
  return (
    <section aria-labelledby={`${type}s-heading`} className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <h2 id={`${type}s-heading`} className="flex items-center gap-2.5 text-headline-lg">
          <Icon className="size-6 text-primary" />
          {title}
        </h2>
        <Link
          href={href}
          className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          All {type} models
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {models.map((model) => (
          <li key={model.id}>
            <DeviceCard model={model} />
          </li>
        ))}
      </ul>
    </section>
  );
}
