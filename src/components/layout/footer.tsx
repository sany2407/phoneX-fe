import Link from "next/link";
import { Globe, Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const PINTEREST_URL  = "https://pin.it/2sAC14o8d";
const INSTAGRAM_URL  = "https://www.instagram.com/phonex.net.in?exln=eWU0am84djk1eWdl";
const FACEBOOK_URL   = "https://www.facebook.com/61580947894373/";
const WHATSAPP_URL   = "https://wa.me/918807574880";
const WEBSITE_URL    = "https://www.phonex.net.in";
const EMAIL          = "phonex.net.in@gmail.com";
const STORE_ADDRESS  = "AMD complex, 4th street, Gandhipuram, Coimbatore, TN 641012";

// ─── Social icons (custom SVG) ────────────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 20.5 12 8.5" />
      <path d="M10.6 8.2c-2.1.7-3.1 2.2-2.7 4.1.3 1.4 1.4 2.3 2.7 2.2 1-.1 1.8-.8 2-1.8.3-1.2-.4-2.6-1.6-3-.9-.3-1.9 0-2.4.9" />
      <path d="M12 8.5c.5-1 1.5-1.6 2.6-1.4 1.5.2 2.5 1.5 2.3 3.1-.2 1.7-1.3 3.4-2.7 4.2-.6.4-1.3.6-1.9.6" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram",  href: INSTAGRAM_URL, Icon: InstagramIcon },
  { label: "Facebook",   href: FACEBOOK_URL,  Icon: FacebookIcon  },
  { label: "Pinterest",  href: PINTEREST_URL, Icon: PinterestIcon },
];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop",             label: "All skins"    },
      { href: "/devices/phones",   label: "Phone skins"  },
      { href: "/devices/tablets",  label: "Tablet skins" },
      { href: "/devices/laptops",  label: "Laptop skins" },
      { href: "/designs",          label: "Designs"      },
      { href: "/offers",           label: "Offers"       },
    ],
  },
  {
    title: "Create",
    links: [
      { href: "/customize",        label: "Custom studio" },
      { href: "/account/designs",  label: "Saved designs" },
      { href: "/wishlist",         label: "Wishlist"      },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/orders", label: "Track order" },
      { href: "/cart",   label: "Cart"        },
    ],
  },
];

export function Footer() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "phoneX",
    url: WEBSITE_URL,
    sameAs: [INSTAGRAM_URL, FACEBOOK_URL, PINTEREST_URL],
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
    <footer className="relative overflow-hidden bg-foreground text-background">
      {/* Same subtle ambient gradient as the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 100%, rgba(10,63,214,0.12) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 100% 0%, rgba(100,80,200,0.07) 0%, transparent 55%)",
        }}
      />

      {/* ── Main grid ── */}
      <div className="relative z-10 container-x py-10 lg:py-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-[1fr_auto_auto_auto] md:gap-x-12 lg:gap-x-16">

          {/* ── Brand column ── */}
          <div className="col-span-2 space-y-4 md:col-span-1">
            <Logo invert />
            <p className="max-w-[22rem] text-sm leading-relaxed text-background/55">
              Precision-cut skins for phones, tablets &amp; laptops — pick a design
              or build your own, shipped across India.
            </p>

            {/* Newsletter */}
            <NewsletterForm />

            {/* Contact */}
            <ul className="space-y-1.5 text-sm text-background/60">
              <li>
                <a href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-white">
                  <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white">
                  <MessageCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  +91 88075 74880 (WhatsApp)
                </a>
              </li>
              <li>
                <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-white">
                  <Globe className="size-3.5 shrink-0" aria-hidden="true" />
                  www.phonex.net.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>{STORE_ADDRESS}</span>
              </li>
            </ul>

            {/* Socials */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-background/35">
                Follow us
              </p>
              <div className="flex items-center gap-1.5">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`phoneX on ${label}`}
                    title={label}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-background/15 text-background/60 transition-colors hover:border-background/35 hover:text-white"
                  >
                    <Icon className="size-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Nav columns ── */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="min-w-[100px]">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-background/35">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-background/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {col.title === "Support" && (
                  <li className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-background/35">
                      We accept
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {["UPI", "Visa", "Mastercard", "Razorpay"].map((p) => (
                        <span
                          key={p}
                          className="rounded bg-background/10 px-1.5 py-0.5 text-xs font-medium text-background/70"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 border-t border-background/10">
        <div className="container-x flex flex-col items-center justify-between gap-1 py-4 text-xs text-background/35 sm:flex-row">
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
