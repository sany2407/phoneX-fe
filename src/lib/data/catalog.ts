import type {
  Brand,
  Coupon,
  DesignCategory,
  DeviceModel,
  DeviceType,
  Finish,
  Material,
} from "@/lib/types";

export const BRANDS: Brand[] = [
  { id: "apple", name: "Apple", slug: "apple", types: ["phone", "laptop", "tablet"] },
  { id: "samsung", name: "Samsung", slug: "samsung", types: ["phone", "tablet"] },
  { id: "oneplus", name: "OnePlus", slug: "oneplus", types: ["phone", "tablet"] },
  { id: "google", name: "Google", slug: "google", types: ["phone", "tablet"] },
  { id: "nothing", name: "Nothing", slug: "nothing", types: ["phone"] },
  { id: "xiaomi", name: "Xiaomi", slug: "xiaomi", types: ["phone", "tablet"] },
  { id: "redmi", name: "Redmi", slug: "redmi", types: ["phone"] },
  { id: "realme", name: "Realme", slug: "realme", types: ["phone"] },
  { id: "vivo", name: "Vivo", slug: "vivo", types: ["phone"] },
  { id: "oppo", name: "Oppo", slug: "oppo", types: ["phone"] },
  { id: "asus", name: "ASUS", slug: "asus", types: ["phone", "laptop", "tablet"] },
  { id: "lenovo", name: "Lenovo", slug: "lenovo", types: ["laptop", "tablet"] },
  { id: "hp", name: "HP", slug: "hp", types: ["laptop"] },
  { id: "dell", name: "Dell", slug: "dell", types: ["laptop"] },
  { id: "acer", name: "Acer", slug: "acer", types: ["laptop"] },
  { id: "msi", name: "MSI", slug: "msi", types: ["laptop"] },
];

const m = (
  brandId: string,
  name: string,
  type: DeviceType,
  year: number,
  popular = false
): DeviceModel => ({
  id: `${brandId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  brandId,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  type,
  year,
  popular,
});

export const DEVICES: DeviceModel[] = [
  // Phones — Apple
  m("apple", "iPhone 17", "phone", 2025, true),
  m("apple", "iPhone 17 Pro", "phone", 2025, true),
  m("apple", "iPhone 17 Pro Max", "phone", 2025, true),
  m("apple", "iPhone 16", "phone", 2024),
  m("apple", "iPhone 16 Pro", "phone", 2024),
  m("apple", "iPhone 15", "phone", 2023),
  // Phones — Samsung
  m("samsung", "Galaxy S26", "phone", 2026, true),
  m("samsung", "Galaxy S26 Ultra", "phone", 2026, true),
  m("samsung", "Galaxy Z Flip 7", "phone", 2025),
  // Phones — OnePlus
  m("oneplus", "OnePlus 15", "phone", 2025, true),
  m("oneplus", "OnePlus 13R", "phone", 2025),
  // Phones — Google
  m("google", "Pixel 10 Pro", "phone", 2025, true),
  m("google", "Pixel 10", "phone", 2025),
  // Phones — Nothing
  m("nothing", "Nothing Phone (3)", "phone", 2025, true),
  m("nothing", "Nothing Phone (2)", "phone", 2023),
  // Phones — Xiaomi family
  m("xiaomi", "Xiaomi 15 Ultra", "phone", 2025),
  m("redmi", "Redmi Note 14 Pro+", "phone", 2025),
  m("realme", "Realme GT 7 Pro", "phone", 2025),
  m("vivo", "Vivo X300 Pro", "phone", 2025),
  m("oppo", "Oppo Find X9 Pro", "phone", 2025),
  // Laptops — Apple
  m("apple", "MacBook Air 13 M4", "laptop", 2025, true),
  m("apple", "MacBook Air 15 M4", "laptop", 2025),
  m("apple", "MacBook Pro 14 M4", "laptop", 2024, true),
  m("apple", "MacBook Pro 16 M4", "laptop", 2024),
  // Laptops — Dell
  m("dell", "XPS 13", "laptop", 2025, true),
  m("dell", "XPS 14", "laptop", 2025),
  // Laptops — HP
  m("hp", "Spectre x360 14", "laptop", 2025, true),
  m("hp", "OMEN 16", "laptop", 2024),
  // Laptops — Lenovo
  m("lenovo", "Yoga Slim 7i", "laptop", 2025, true),
  m("lenovo", "ThinkPad X1 Carbon", "laptop", 2025),
  // Laptops — ASUS
  m("asus", "ROG Zephyrus G14", "laptop", 2025, true),
  m("asus", "Zenbook 14 OLED", "laptop", 2025),
  // Laptops — Acer / MSI
  m("acer", "Swift X 14", "laptop", 2024),
  m("msi", "Raider 18 HX", "laptop", 2025),
  // Tablets — Apple
  m("apple", "iPad Pro 13 M4", "tablet", 2024, true),
  m("apple", "iPad Pro 11 M4", "tablet", 2024, true),
  m("apple", "iPad Air 13 M2", "tablet", 2024),
  m("apple", "iPad Air 11 M2", "tablet", 2024),
  m("apple", "iPad mini 7", "tablet", 2024),
  m("apple", "iPad 10th Gen", "tablet", 2022),
  // Tablets — Samsung
  m("samsung", "Galaxy Tab S10 Ultra", "tablet", 2024, true),
  m("samsung", "Galaxy Tab S10+", "tablet", 2024, true),
  m("samsung", "Galaxy Tab S10 FE", "tablet", 2025),
  m("samsung", "Galaxy Tab A9+", "tablet", 2023),
  // Tablets — Xiaomi
  m("xiaomi", "Pad 7 Pro", "tablet", 2025, true),
  m("xiaomi", "Pad 6s Pro", "tablet", 2024),
  // Tablets — OnePlus
  m("oneplus", "OnePlus Pad 2", "tablet", 2024, true),
  // Tablets — Google
  m("google", "Pixel Tablet 2", "tablet", 2025, true),
  // Tablets — ASUS
  m("asus", "ROG Flow Z13", "tablet", 2024, true),
  m("asus", "Zenpad 11", "tablet", 2024),
  // Tablets — Lenovo
  m("lenovo", "Tab P12 Pro", "tablet", 2024, true),
  m("lenovo", "Tab M11", "tablet", 2024),
];

export const DESIGN_CATEGORIES: DesignCategory[] = [
  { id: "anime", slug: "anime", name: "Anime", blurb: "Shonen energy, sakura tones", colors: ["#ff9ecb", "#7c3aed"], pattern: "petals" },
  { id: "gaming", slug: "gaming", name: "Gaming", blurb: "RGB-fueled loadouts", colors: ["#22d3ee", "#7c3aed"], pattern: "neon-grid" },
  { id: "cyberpunk", slug: "cyberpunk", name: "Cyberpunk", blurb: "Neon-soaked night cities", colors: ["#f0abfc", "#0ea5e9"], pattern: "circuit" },
  { id: "cars", slug: "cars", name: "Cars", blurb: "Apex curves & racing lines", colors: ["#ef4444", "#18181b"], pattern: "stripes" },
  { id: "minimal", slug: "minimal", name: "Minimal", blurb: "Less, but better", colors: ["#e7e7f5", "#8b8fa3"], pattern: "solid" },
  { id: "abstract", slug: "abstract", name: "Abstract", blurb: "Shape studies in motion", colors: ["#60a5fa", "#f472b6"], pattern: "blobs" },
  { id: "nature", slug: "nature", name: "Nature", blurb: "Forests, tides and trails", colors: ["#34d399", "#065f46"], pattern: "mountains" },
  { id: "marble", slug: "marble", name: "Marble", blurb: "Quarried stone veining", colors: ["#f5f5f4", "#a8a29e"], pattern: "marble" },
  { id: "space", slug: "space", name: "Space", blurb: "Deep field nebulae", colors: ["#312e81", "#0ea5e9"], pattern: "stars" },
  { id: "typography", slug: "typography", name: "Typography", blurb: "Type as the artwork", colors: ["#faf8ff", "#191b25"], pattern: "checker" },
  { id: "music", slug: "music", name: "Music", blurb: "Basslines you can hold", colors: ["#f59e0b", "#18181b"], pattern: "waves" },
  { id: "sports", slug: "sports", name: "Sports", blurb: "Court-side energy", colors: ["#fb923c", "#1d4ed8"], pattern: "rays" },
  { id: "art", slug: "art", name: "Art", blurb: "Gallery-grade brushwork", colors: ["#38bdf8", "#fbbf24"], pattern: "blobs" },
  { id: "luxury", slug: "luxury", name: "Luxury", blurb: "Gilded, understated", colors: ["#d4af37", "#111114"], pattern: "topo" },
  { id: "retro", slug: "retro", name: "Retro", blurb: "VHS summers, tape decks", colors: ["#fb7185", "#fcd34d"], pattern: "waves" },
  { id: "dark", slug: "dark", name: "Dark", blurb: "Stealth mode always on", colors: ["#27272a", "#09090b"], pattern: "carbon" },
  { id: "cute", slug: "cute", name: "Cute", blurb: "Soft round friends", colors: ["#fda4af", "#fef3c7"], pattern: "gradient" },
];

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

export const COUPONS: Coupon[] = [
  { code: "PHONE10", label: "10% off sitewide", description: "10% off on all skins, no minimum order.", pct: 10 },
  { code: "CUSTOM15", label: "15% off custom skins", description: "15% off your first custom design.", pct: 15 },
  { code: "FREESHIP", label: "Free shipping", description: "Free shipping on orders above ₹499.", freeShippingOver: 499 },
];
