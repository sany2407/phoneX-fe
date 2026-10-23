import type { DeviceType, Finish, Material } from "@/lib/types";

/**
 * Fixed shop taxonomy — material/finish vocabularies and studio pricing.
 * These are business configuration (like sort options), not catalogue data:
 * every value shown from here is validated against live backend data
 * (facets endpoint) before it reaches the UI.
 */
export const MATERIALS: Material[] = [
  { id: "matte", label: "Matte Vinyl", description: "Soft-touch, anti-fingerprint, zero glare." },
  { id: "glossy", label: "Glossy Vinyl", description: "High-shine finish that makes colours pop." },
  { id: "carbon-fiber", label: "Carbon Fiber", description: "Woven 3D texture with a technical feel." },
  { id: "leather", label: "Leather Grain", description: "Embossed grain, ages like the real thing." },
  { id: "transparent", label: "Transparent", description: "Crystal-clear film to show off your device." },
  { id: "textured", label: "Textured", description: "Tactile sandstone grip with a premium hand feel." },
];

export const FINISHES: Finish[] = [
  { id: "satin", label: "Satin" },
  { id: "gloss", label: "Gloss" },
  { id: "metallic", label: "Metallic" },
  { id: "frosted", label: "Frosted" },
];

export const SKIN_TYPES: Material[] = MATERIALS;

/** Custom skin pricing by device type */
export const CUSTOM_BASE_PRICE: Record<DeviceType, number> = {
  phone: 599,
  laptop: 1199,
  tablet: 899,
};

export function materialLabel(id: string): string {
  return MATERIALS.find((mt) => mt.id === id)?.label ?? id;
}

export function finishLabel(id: string): string {
  return FINISHES.find((f) => f.id === id)?.label ?? id;
}
