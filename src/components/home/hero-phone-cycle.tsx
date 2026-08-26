"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const CYCLE_MS = 4000;
const MOBILE_QUERY = "(max-width: 639px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export type HeroSlide = { src: string; alt: string };

/**
 * Mobile shows a single phone instead of the desktop collage, so it cycles
 * through the designs. The extra designs only mount once cycling is on, which
 * keeps them off the wire on desktop where they'd never be seen.
 */
export function HeroPhoneCycle({ slides }: { slides: HeroSlide[] }) {
  const [cycling, setCycling] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;

    const mobile = window.matchMedia(MOBILE_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);

    const sync = () => {
      const on = mobile.matches && !reduced.matches;
      setCycling(on);
      if (!on) setIndex(0);
    };

    sync();
    mobile.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      mobile.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [slides.length]);

  useEffect(() => {
    if (!cycling) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((curr) => (curr + 1) % slides.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [cycling, slides.length]);

  const shown = cycling ? slides : slides.slice(0, 1);

  return (
    <div className="relative aspect-370/674 w-full">
      {shown.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={i === 0 ? slide.alt : ""}
          width={370}
          height={674}
          loading="eager"
          priority={i === 0}
          className={cn(
            "absolute inset-0 h-full w-full object-contain drop-shadow-[0_24px_48px_rgba(25,27,37,0.28)]",
            "transition-[opacity,transform] duration-700 ease-out",
            i === index ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        />
      ))}
    </div>
  );
}
