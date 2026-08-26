import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { CouponCard } from "@/components/home/coupon-card";
import { getCoupons, offerSkins } from "@/lib/api";

export const metadata: Metadata = {
  title: "Offers — Discounts on Phone & Laptop Skins",
  description:
    "Live deals on premium device skins plus working coupon codes you can apply at checkout.",
  alternates: { canonical: "/offers" },
};

export default function OffersPage() {
  const offers = offerSkins(12);
  return (
    <div className="container-x py-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="text-label-sm text-primary">Limited time</p>
        <h1 className="mt-2 text-headline-lg">Offers</h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          Real discounts on real skins — no inflated MRPs. Codes work at checkout.
        </p>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {getCoupons().map((c) => (
          <li key={c.code}>
            <CouponCard coupon={c} />
          </li>
        ))}
      </ul>

      <section aria-labelledby="deals-heading" className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 id="deals-heading" className="text-headline-lg">On sale now</h2>
          <Button variant="ghost" asChild>
            <Link href="/shop">
              Shop all <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <ProductGrid skins={offers} columns={4} />
        </div>
      </section>
    </div>
  );
}
