import type { ApiBrand, ApiDeviceModel } from "@/lib/api-types";

/** Device family for preview/layout decisions. */
export type DeviceKind = "phone" | "tablet" | "laptop" | "other";

const SLUG_KIND: Record<string, DeviceKind> = {
  smartphone: "phone",
  phone: "phone",
  tablet: "tablet",
  laptop: "laptop",
  earbuds: "other",
  smartwatch: "other",
};

export function deviceKindOf(m: ApiDeviceModel): DeviceKind {
  const slug = m.deviceType?.slug?.toLowerCase() ?? "";
  return SLUG_KIND[slug] ?? "other";
}

/** Flattened model used by the finder / picker / studio. */
export interface PickerModel {
  id: string;
  slug: string;
  name: string;
  kind: DeviceKind;
  typeSlug?: string;
  brandId: string;
  brandSlug: string;
  brandName: string;
  imageUrl?: string | null;
}

export function toPickerModel(brand: ApiBrand, m: ApiDeviceModel): PickerModel {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    kind: deviceKindOf(m),
    typeSlug: m.deviceType?.slug,
    brandId: brand.id,
    brandSlug: brand.slug,
    brandName: brand.name,
    imageUrl: m.imageUrl,
  };
}
