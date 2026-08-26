import { CUSTOM_BASE_PRICE, SKIN_TYPES } from "@/lib/data/catalog";
import type { DeviceModel, MaterialId } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const MULTIPLIER: Record<MaterialId, number> = {
  matte: 1,
  glossy: 1,
  transparent: 0.9,
  textured: 1.2,
  "carbon-fiber": 1.4,
  leather: 1.5,
};

export function customPrice(model: DeviceModel, skinType: MaterialId): number {
  const base = CUSTOM_BASE_PRICE[model.type] * MULTIPLIER[skinType];
  return Math.round(base / 10) * 10;
}

export function customPriceLabel(model: DeviceModel, skinType: MaterialId): string {
  return formatINR(customPrice(model, skinType));
}

export { SKIN_TYPES };
