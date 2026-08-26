/**
 * Device photography, grouped by brand slug → model slug.
 *
 * Folder convention (local files):
 *   public/images/devices/{brand}/{model}/hero.png
 *
 * Remote links work the same way — paste the URL under that brand + model:
 *
 *   google: {
 *     "pixel-10-pro": {
 *       hero: "https://cdn.example.com/google/pixel-10-pro/hero.webp",
 *       gallery: ["https://cdn.example.com/google/pixel-10-pro/angle.webp"],
 *       designs: {
 *         "night-city-pulse-007": "https://cdn.example.com/google/pixel-10-pro/night-city-pulse.webp",
 *       },
 *     },
 *   },
 *
 * `designs` keys are skin slug, skin id, or skin name.
 */
export type DeviceImageSet = {
  hero?: string;
  gallery?: string[];
  designs?: Record<string, string>;
};

/** `/images/devices/{brand}/{model}/{file}` — keep files in that folder. */
export function localDeviceImage(
  brandSlug: string,
  modelSlug: string,
  file = "hero.png"
) {
  return `/images/devices/${brandSlug}/${modelSlug}/${file}`;
}

export const DEVICE_IMAGES: Record<string, Record<string, DeviceImageSet>> = {
  apple: {
    "iphone-17-pro": {
      hero: localDeviceImage("apple", "iphone-17-pro"),
      designs: {
        "rising-ronin": localDeviceImage("apple", "iphone-17-pro"),
        "kasa-ronin": localDeviceImage("apple", "iphone-17-pro", "17-pro-2.png"),
        "no-excuses": localDeviceImage("apple", "iphone-17-pro", "iphone-17-pro-3.png"),
        "night-911": localDeviceImage("apple", "iphone-17-pro", "iphone-17-pro-4.png"),
      },
    },
  },
  samsung: {},
  oneplus: {},
  google: {},
  nothing: {},
  xiaomi: {},
  redmi: {},
  realme: {},
  vivo: {},
  oppo: {},
  asus: {},
  lenovo: {},
  hp: {},
  dell: {},
  acer: {},
  msi: {},
};
