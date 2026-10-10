import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const PINTEREST_URL = "https://pin.it/2sAC14o8d";
const WEBSITE_URL = "https://www.phonex.net.in";
const STORE_ADDRESS =
  "1st floor, AMD complex, 4th street, crosscut road, Gandhipuram, Coimbatore, Tamil Nadu 641012, IN";

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 20.5 12 8.5" />
      <path d="M10.6 8.2c-2.1.7-3.1 2.2-2.7 4.1.3 1.4 1.4 2.3 2.7 2.2 1-.1 1.8-.8 2-1.8.3-1.2-.4-2.6-1.6-3-.9-.3-1.9 0-2.4.9" />
      <path d="M12 8.5c.5-1 1.5-1.6 2.6-1.4 1.5.2 2.5 1.5 2.3 3.1-.2 1.7-1.3 3.4-2.7 4.2-.6.4-1.3.6-1.9.6" />
    </svg>
  );
}

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All skins" },
      { href: "/devices/phones", label: "Phone skins" },
      { href: "/devices/laptops", label: "Laptop skins" },
      { href: "/designs", label: "Designs" },
      { href: "/offers", label: "Offers" },
    ],
  },
  {
    title: "Create",
    links: [
      { href: "/customize", label: "Custom skin studio" },
      { href: "/account/designs", label: "Saved designs" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/orders", label: "Track your order" },
      { href: "/cart", label: "Cart" },
    ],
  },
];

export function Footer() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "phoneX",
    url: WEBSITE_URL,
    sameAs: [PINTEREST_URL],
    address: {
      "@type": "PostalAddress",
      streetAddress: "1st floor, AMD complex, 4th street, crosscut road",
      addressLocality: "Gandhipuram, Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641012",
      addressCountry: "IN",
    },
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:py-20">
        <div className="space-y-6">
          <Logo invert />
          <p className="max-w-xs text-sm leading-6 text-background/60">
            Precision-cut skins for phones and laptops. Pick a design or build
            your own — shipped across India.
          </p>
          <NewsletterForm />
          <div className="space-y-2.5 text-sm text-background/70">
            <a
              href="mailto:support@phonex.in"
              className="flex items-center gap-2 hover:text-white"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" /> support@phonex.in
            </a>
            <a href="tel:+918000000000" className="flex items-center gap-2 hover:text-white">
              <Phone className="size-4 shrink-0" aria-hidden="true" /> 1800-000-000 (Mon–Sat, 10am–7pm)
            </a>
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <Globe className="size-4 shrink-0" aria-hidden="true" /> www.phonex.net.in
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{STORE_ADDRESS}</span>
            </p>
          </div>
          <div>
            <p className="text-label-sm text-background/50">Follow us</p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={PINTEREST_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="phoneX on Pinterest"
                title="phoneX on Pinterest"
                className="inline-flex size-9 items-center justify-center rounded-full border border-background/15 text-background/70 transition-colors hover:border-background/40 hover:text-white"
              >
                <PinterestIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-label-sm text-background/50">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-background/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {col.title === "Support" && (
              <div className="mt-6 rounded-lg border border-background/15 p-4">
                <p className="text-label-sm text-background/40">We accept</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["UPI", "Visa", "Mastercard", "Razorpay"].map((p) => (
                    <span
                      key={p}
                      className="rounded-md bg-background/10 px-2 py-1 text-xs font-medium text-background/80"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </nav>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-background/45 sm:flex-row">
          <p>© {new Date().getFullYear()} phoneX Designs Pvt. Ltd. All rights reserved.</p>
          <p>Made in India, for every device you own.</p>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </footer>
  );
}
