import type { DeviceType, Skin } from "@/lib/types";

let seq = 0;
const s = (
  name: string,
  categoryId: string,
  material: Skin["material"],
  finish: Skin["finish"],
  price: number,
  colors: [string, string],
  pattern: Skin["pattern"],
  deviceTypes: DeviceType[],
  opts: Partial<Skin> = {}
): Skin => {
  seq += 1;
  return {
    id: `sk-${String(seq).padStart(3, "0")}`,
    name,
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(seq).padStart(3, "0")}`,
    categoryId,
    material,
    finish,
    price,
    discountPct: 0,
    rating: 4.5,
    reviews: 120,
    isNew: false,
    featured: false,
    popularity: 50,
    inStock: true,
    colors,
    pattern,
    deviceTypes,
    brands: ["*"],
    ...opts,
  };
};

const P: DeviceType[] = ["phone"];
const L: DeviceType[] = ["laptop"];
const T: DeviceType[] = ["tablet"];
const B: DeviceType[] = ["phone", "laptop", "tablet"];
const PT: DeviceType[] = ["phone", "tablet"];

export const SKINS: Skin[] = [
  // Anime
  s("Shibuya Neon", "anime", "glossy", "gloss", 499, ["#ff9ecb", "#7c3aed"], "petals", B, { rating: 4.8, reviews: 342, popularity: 96, featured: true }),
  s("Sakura Drift", "anime", "matte", "satin", 549, ["#fda4af", "#fef3c7"], "gradient", P, { rating: 4.7, reviews: 289, popularity: 91, isNew: true, featured: true }),
  s("Sensei Mode", "anime", "textured", "frosted", 479, ["#93c5fd", "#1e1b4b"], "rays", PT, { popularity: 78 }),
  // Gaming
  s("Headshot", "gaming", "matte", "satin", 499, ["#22d3ee", "#7c3aed"], "neon-grid", B, { rating: 4.6, reviews: 411, popularity: 94, featured: true }),
  s("Respawn", "gaming", "carbon-fiber", "satin", 649, ["#10b981", "#0f172a"], "circuit", PT, { popularity: 85 }),
  s("Clutch Frame", "gaming", "textured", "satin", 459, ["#f43f5e", "#111114"], "stripes", PT, { discountPct: 15, popularity: 72 }),
  // Cyberpunk
  s("Night City Pulse", "cyberpunk", "glossy", "gloss", 599, ["#f0abfc", "#0ea5e9"], "circuit", B, { rating: 4.9, reviews: 502, popularity: 98, featured: true }),
  s("Chrome Ghost", "cyberpunk", "glossy", "metallic", 699, ["#94a3b8", "#0f172a"], "topo", PT, { isNew: true, popularity: 88 }),
  s("Edgerunner 2077", "cyberpunk", "matte", "satin", 549, ["#facc15", "#111114"], "neon-grid", PT, { popularity: 82 }),
  // Cars
  s("Apex GT", "cars", "carbon-fiber", "satin", 699, ["#ef4444", "#18181b"], "stripes", B, { rating: 4.8, reviews: 377, popularity: 93, featured: true }),
  s("Nürburgring", "cars", "matte", "satin", 529, ["#e5e7eb", "#171717"], "topo", PT, { popularity: 80 }),
  s("Circuit Days", "cars", "glossy", "gloss", 489, ["#38bdf8", "#0c0a09"], "waves", L, { discountPct: 20 }),
  // Minimal
  s("Blank Slate", "minimal", "matte", "satin", 399, ["#f4f4f5", "#d4d4d8"], "solid", B, { rating: 4.9, reviews: 654, popularity: 97, featured: true }),
  s("Off White", "minimal", "transparent", "frosted", 449, ["#ffffff", "#e4e4e7"], "solid", PT, { reviews: 430, popularity: 89 }),
  s("Graphite Line", "minimal", "textured", "satin", 429, ["#3f3f46", "#18181b"], "stripes", L, { isNew: true, popularity: 74 }),
  s("Quiet Hours", "minimal", "leather", "satin", 649, ["#d6d3d1", "#78716c"], "leather", B, { popularity: 70 }),
  // Abstract
  s("Fluid Study 04", "abstract", "glossy", "gloss", 499, ["#60a5fa", "#f472b6"], "blobs", B, { rating: 4.6, reviews: 233, popularity: 84, featured: true }),
  s("Bauhaus Echo", "abstract", "matte", "satin", 469, ["#fbbf24", "#2563eb"], "checker", L, { popularity: 76 }),
  s("Soft Machine", "abstract", "textured", "frosted", 489, ["#a5b4fc", "#f0abfc"], "gradient", PT, { isNew: true }),
  // Nature
  s("Fern Valley", "nature", "matte", "satin", 479, ["#34d399", "#065f46"], "mountains", B, { rating: 4.7, reviews: 310, popularity: 87 }),
  s("Tide Lines", "nature", "glossy", "gloss", 499, ["#67e8f9", "#0369a1"], "waves", B, { popularity: 81 }),
  s("Monsoon Greens", "nature", "textured", "satin", 459, ["#4ade80", "#14532d"], "blobs", PT, { discountPct: 10 }),
  // Marble
  s("Carrara Nero", "marble", "glossy", "gloss", 599, ["#f5f5f4", "#1c1917"], "marble", B, { rating: 4.8, reviews: 289, popularity: 92, featured: true }),
  s("Rosso Vein", "marble", "matte", "satin", 569, ["#fecaca", "#7f1d1d"], "marble", PT, { isNew: true, popularity: 83 }),
  s("Verde Alpi", "marble", "glossy", "gloss", 589, ["#a7f3d0", "#064e3b"], "marble", L, { popularity: 77 }),
  // Space
  s("Deep Field", "space", "glossy", "gloss", 549, ["#312e81", "#0ea5e9"], "stars", B, { rating: 4.9, reviews: 468, popularity: 95, featured: true }),
  s("Lunar Surface", "space", "textured", "frosted", 529, ["#d4d4d8", "#52525b"], "topo", PT, { popularity: 79 }),
  s("Event Horizon", "space", "matte", "satin", 569, ["#1e1b4b", "#be185d"], "stars", L, { isNew: true }),
  // Typography
  s("Mono Statement", "typography", "matte", "satin", 429, ["#faf8ff", "#191b25"], "checker", B, { rating: 4.6, reviews: 198, popularity: 75 }),
  s("Serif No. 9", "typography", "leather", "satin", 649, ["#f5f5f4", "#292524"], "solid", L, {}),
  s("Loud Type", "typography", "glossy", "gloss", 439, ["#fde047", "#111114"], "stripes", PT, { discountPct: 12 }),
  // Music
  s("Bassline", "music", "matte", "satin", 479, ["#f59e0b", "#18181b"], "waves", B, { rating: 4.5, reviews: 176, popularity: 73 }),
  s("Vinyl Hours", "music", "textured", "satin", 499, ["#fca5a5", "#450a0a"], "checker", PT, { popularity: 68 }),
  // Sports
  s("Court Vision", "sports", "matte", "satin", 469, ["#fb923c", "#1d4ed8"], "rays", PT, { rating: 4.4, reviews: 143, popularity: 66 }),
  s("Final Lap", "sports", "carbon-fiber", "satin", 649, ["#22d3ee", "#0c0a09"], "neon-grid", B, { isNew: true }),
  // Art
  s("Brushstroke Blue", "art", "glossy", "gloss", 519, ["#38bdf8", "#fbbf24"], "blobs", B, { rating: 4.7, reviews: 221, popularity: 86 }),
  s("Gouache Garden", "art", "textured", "frosted", 509, ["#f9a8d4", "#a3e635"], "petals", PT, { popularity: 71 }),
  s("Rising Ronin", "art", "matte", "satin", 549, ["#f5f5f4", "#b91c1c"], "solid", P, {
    id: "sk-rising-ronin",
    slug: "rising-ronin",
    brands: ["apple"],
    models: ["iphone-17-pro"],
    featured: true,
    isNew: true,
    popularity: 98,
    rating: 4.8,
    reviews: 91,
  }),
  s("Kasa Ronin", "art", "matte", "satin", 549, ["#f5f5f4", "#111111"], "solid", P, {
    id: "sk-kasa-ronin",
    slug: "kasa-ronin",
    brands: ["apple"],
    models: ["iphone-17-pro"],
    featured: true,
    isNew: true,
    popularity: 97,
    rating: 4.8,
    reviews: 86,
  }),
  s("No Excuses", "typography", "matte", "satin", 549, ["#ef4444", "#111111"], "solid", P, {
    id: "sk-no-excuses",
    slug: "no-excuses",
    brands: ["apple"],
    models: ["iphone-17-pro"],
    featured: true,
    isNew: true,
    popularity: 96,
    rating: 4.8,
    reviews: 64,
  }),
  s("Night 911", "cars", "matte", "satin", 549, ["#d4d4d8", "#111111"], "solid", P, {
    id: "sk-night-911",
    slug: "night-911",
    brands: ["apple"],
    models: ["iphone-17-pro"],
    featured: true,
    isNew: true,
    popularity: 95,
    rating: 4.8,
    reviews: 52,
  }),
  // Luxury
  s("Gilded Monogram", "luxury", "leather", "metallic", 799, ["#d4af37", "#111114"], "topo", B, { rating: 4.9, reviews: 154, popularity: 90, featured: true }),
  s("Onyx Crest", "luxury", "carbon-fiber", "metallic", 849, ["#27272a", "#000000"], "carbon", B, { popularity: 88 }),
  // Retro
  s("VHS Summer", "retro", "glossy", "gloss", 489, ["#fb7185", "#fcd34d"], "waves", B, { rating: 4.6, reviews: 264, popularity: 85, featured: true }),
  s("Cassette Gold", "retro", "matte", "satin", 469, ["#fbbf24", "#78350f"], "stripes", PT, { popularity: 69 }),
  // Dark
  s("Eclipse", "dark", "matte", "satin", 449, ["#27272a", "#09090b"], "gradient", B, { rating: 4.8, reviews: 512, popularity: 96, featured: true }),
  s("Void Carbon", "dark", "carbon-fiber", "satin", 699, ["#18181b", "#000000"], "carbon", B, { reviews: 388, popularity: 92 }),
  s("Midnight Oil", "dark", "textured", "satin", 479, ["#1e293b", "#020617"], "topo", L, { isNew: true }),
  // Cute
  s("Peach Club", "cute", "glossy", "gloss", 459, ["#fda4af", "#fef3c7"], "gradient", B, { rating: 4.7, reviews: 356, popularity: 89, featured: true }),
  s("Mochi Gang", "cute", "matte", "satin", 449, ["#fbcfe8", "#ddd6fe"], "blobs", PT, { isNew: true, popularity: 80 }),
  // Laptop-first utility
  s("Frosted Clear", "minimal", "transparent", "frosted", 999, ["#ffffff", "#e4e4e7"], "solid", L, { popularity: 64 }),
  // Tablet-first
  s("Canvas Pro", "minimal", "matte", "satin", 699, ["#f0f0f5", "#c7c7d4"], "solid", T, { rating: 4.7, reviews: 88, popularity: 76, isNew: true }),
  s("Nebula Pad", "space", "glossy", "gloss", 749, ["#4f46e5", "#0ea5e9"], "stars", T, { rating: 4.8, reviews: 64, popularity: 80, featured: true }),
  s("Inkblot Study", "abstract", "matte", "satin", 679, ["#a78bfa", "#f472b6"], "blobs", T, { popularity: 70, isNew: true }),
];

