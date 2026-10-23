import { CUSTOM_BASE_PRICE, SKIN_TYPES } from "@/lib/taxonomy";
import type { MaterialId } from "@/lib/types";
import type { DeviceKind } from "@/lib/live-devices";
import { formatINR } from "@/lib/utils";

const MULTIPLIER: Record<MaterialId, number> = {
  matte: 1,
  glossy: 1,
  transparent: 0.9,
  textured: 1.2,
  "carbon-fiber": 1.4,
  leather: 1.5,
};

/** Studio pricing by device family — operational pricing config. */
export function customPrice(kind: DeviceKind, skinType: MaterialId): number {
  const base = CUSTOM_BASE_PRICE[kind === "other" ? "phone" : kind] * MULTIPLIER[skinType];
  return Math.round(base / 10) * 10;
}

export function customPriceLabel(kind: DeviceKind, skinType: MaterialId): string {
  return formatINR(customPrice(kind, skinType));
}

export { SKIN_TYPES };
