import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Heart, Truck, Zap } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to track orders and open your saved designs.",
};

const BENEFITS = [
  { text: "Track orders and delivery in real time", Icon: Truck },
  { text: "Saved designs, cart and wishlist on every device", Icon: Heart },
  { text: "Faster checkout with saved addresses", Icon: Zap },
];

export default function LoginPage() {
  return (
    <main className="container-x grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:py-14">
      {/* Brand panel */}
      <section
        aria-label="About your account"
        className="relative hidden min-h-[620px] overflow-hidden rounded-[1.75rem] bg-muted p-12 lg:block"
      >
        {/* Soft backdrop blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -right-24 top-16 size-[380px] rounded-full bg-accent/70" />
          <div className="absolute -left-28 bottom-[-120px] size-[420px] rounded-full bg-accent/50" />
          <div className="absolute -bottom-10 left-40 h-24 w-[420px] rotate-[-6deg] rounded-full bg-accent/60" />
        </div>

        <div className="relative">
          <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground">
            WELCOME BACK
          </p>
          <p className="mt-4 max-w-md font-heading text-display-lg">
            Pick up where you left off.
          </p>
          <ul className="mt-10 max-w-md space-y-6">
            {BENEFITS.map(({ text, Icon }) => (
              <li key={text} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-body-md font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phone visual — cropped off the bottom-right corner */}
        <div
          aria-hidden="true"
          className="absolute -bottom-20 right-2 h-[500px] w-[250px] rotate-[8deg] drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
        >
          {/* Motion ticks */}
          <span className="absolute -left-7 top-2 h-5 w-1 rotate-[24deg] rounded-full bg-foreground/70" />
          <span className="absolute -left-3 top-6 h-3 w-1 rotate-[24deg] rounded-full bg-foreground/50" />
          <Image
            src="/samsung-login.png"
            alt=""
            fill
            sizes="250px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-[1.75rem] border bg-card p-8 shadow-pop sm:p-10">
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
