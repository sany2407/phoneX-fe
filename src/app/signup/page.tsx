import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create a phoneX account to save designs, track orders and check out faster.",
};

const BENEFITS = [
  "Save and revisit your custom studio designs",
  "Wishlist across phones and laptops",
  "Coupons and drops, first in line",
];

export default function SignupPage() {
  return (
    <main className="container-x grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-14">
      {/* Brand panel */}
      <section
        aria-label="About your account"
        className="relative hidden min-h-[600px] overflow-hidden rounded-lg border bg-muted p-12 lg:block"
      >
        <p className="max-w-sm font-heading text-display-lg">
          Make it yours.
        </p>
        <ul className="mt-8 max-w-sm space-y-3">
          {BENEFITS.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-body-md text-muted-foreground"
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Phone image — cropped off the bottom-right corner */}
        <div
          aria-hidden="true"
          className="absolute -bottom-16 right-8 h-[430px] w-[210px] rotate-[8deg] drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
        >
          <Image
            src="/iphone-register.png"
            alt=""
            fill
            sizes="210px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-pop sm:p-10">
          <h1 className="font-heading text-headline-xl">Create account</h1>
          <p className="mt-2 text-body-md text-muted-foreground">
            Save designs, track orders and check out faster.
          </p>
          <div className="mt-8">
            <SignupForm />
          </div>
        </div>
      </section>
    </main>
  );
}
