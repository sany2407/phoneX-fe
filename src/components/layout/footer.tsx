import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

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
          <div className="space-y-2 text-sm text-background/70">
            <a
              href="mailto:support@phonex.in"
              className="flex items-center gap-2 hover:text-white"
            >
              <Mail className="size-4" aria-hidden="true" /> support@phonex.in
            </a>
            <a href="tel:+918000000000" className="flex items-center gap-2 hover:text-white">
              <Phone className="size-4" aria-hidden="true" /> 1800-000-000 (Mon–Sat, 10am–7pm)
            </a>
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
    </footer>
  );
}
