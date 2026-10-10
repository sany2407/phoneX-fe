import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to track orders and open your saved designs.",
};

const BENEFITS = [
  "Track orders and delivery in real time",
  "Saved designs, cart and wishlist on every device",
  "Faster checkout with saved addresses",
];

// Carbon-fibre twill drawn in CSS, so no image is needed.
const CARBON = {
  backgroundColor: "#23272d",
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 5px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 5px)",
} as const;

export default function LoginPage() {
  return (
    <main className="container-x grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-14">
      {/* Brand panel */}
      <section
        aria-label="About your account"
        className="relative hidden min-h-[600px] overflow-hidden rounded-lg border bg-muted p-12 lg:block"
      >
        <p className="max-w-sm font-heading text-display-lg">
          Pick up where you left off.
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

        {/* One memorable element: a skinned phone, cropped off the corner */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-12 h-[430px] w-[210px] rotate-[8deg] rounded-[2.25rem] border border-black/30 shadow-card-hover"
          style={CARBON}
        >
          <div className="absolute left-3.5 top-3.5 grid h-[88px] w-[88px] grid-cols-2 place-items-center gap-1 rounded-[1.5rem] bg-black/55 p-2.5">
            <span className="size-8 rounded-full border-2 border-white/15 bg-black" />
            <span className="size-8 rounded-full border-2 border-white/15 bg-black" />
            <span className="size-8 rounded-full border-2 border-white/15 bg-black" />
            <span className="size-3 rounded-full bg-white/20" />
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-pop sm:p-10">
          <h1 className="font-heading text-headline-xl">Sign in</h1>
          <p className="mt-2 text-body-md text-muted-foreground">
            Track orders and open your saved designs.
          </p>
          <div className="mt-8">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to phoneX?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
