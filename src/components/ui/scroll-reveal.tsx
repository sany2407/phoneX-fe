"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Thin scroll-reveal wrapper.
 *
 * Adds `data-visible="true"` to each direct child with class `.reveal`
 * once it enters the viewport (fires once, no re-animation on scroll back).
 *
 * Usage:
 *   <ScrollReveal>
 *     <div className="reveal" style={{ "--reveal-delay": "0ms" }}>…</div>
 *     <div className="reveal" style={{ "--reveal-delay": "80ms" }}>…</div>
 *   </ScrollReveal>
 *
 * Or wrap the container itself:
 *   <ScrollReveal className="reveal">…</ScrollReveal>
 */
export function ScrollReveal({
  children,
  className,
  style,
  as: Tag = "div",
  threshold = 0.12,
  rootMargin = "0px 0px -60px 0px",
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Observe the wrapper itself OR its .reveal children
    const targets = el.classList.contains("reveal")
      ? [el]
      : Array.from(el.querySelectorAll<HTMLElement>(".reveal"));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Tag ref={ref} className={cn(className)} style={style}>
      {children}
    </Tag>
  );
}
