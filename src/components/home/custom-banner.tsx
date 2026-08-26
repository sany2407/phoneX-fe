import Link from "next/link";
import { Brush, Layers, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomBanner() {
  return (
    <section className="container-x pb-4">
      <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-background sm:px-12 lg:px-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-electric/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-10 size-80 rounded-full bg-electric/20 blur-3xl"
        />
        <div className="relative max-w-xl animate-rise">
          <p className="text-label-sm text-electric">phoneX studio</p>
          <h2 className="mt-3 font-heading text-headline-lg text-white">
            Can&apos;t find it? Design it.
          </h2>
          <p className="mt-3 text-background/70">
            Upload a photo, add text and stickers, and preview your design on
            your exact device before you order.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-background/80 sm:grid-cols-3">
            {[
              [Brush, "Upload & draw"],
              [Layers, "Layers & templates"],
              [ScanLine, "True-to-device preview"],
            ].map(([Icon, label]) => {
              const I = Icon as React.ComponentType<{ className?: string }>;
              return (
                <li key={label as string} className="flex items-center gap-2">
                  <I className="size-4 text-electric" aria-hidden="true" /> {label as string}
                </li>
              );
            })}
          </ul>
          <Button size="lg" className="mt-8 h-12 bg-white px-7 text-base text-zinc-900 hover:bg-white/90" asChild>
            <Link href="/customize">Open the Studio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
