"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── types ────────────────────────────────────────────────────────────────

export type OrbitSlide = { src: string; alt: string };

// ─── orbit slot definitions ───────────────────────────────────────────────
//
// All phones are rendered at the same base width (BASE_W).
// Position + size are driven entirely through CSS `transform: translate + scale`
// so every interpolated frame is handled on the GPU compositor thread —
// no layout, no paint, no jank.
//
// Slot 0 → Front   (centred, full scale)
// Slot 1 → Right   (right + down, scaled down)
// Slot 2 → Left    (left  + down, scaled down)
//
// Clockwise rotation: slot 2 (left) → slot 0 (front) → slot 1 (right) → slot 2

const SLOTS = [
  // front
  { tx: 0,    ty: 0,  scale: 1.00, opacity: 1.00, shadow: "0 40px 80px rgba(0,0,0,0.60)" },
  // right
  { tx: 150,  ty: 28, scale: 0.58, opacity: 0.60, shadow: "0 16px 32px rgba(0,0,0,0.30)" },
  // left
  { tx: -150, ty: 28, scale: 0.58, opacity: 0.60, shadow: "0 16px 32px rgba(0,0,0,0.30)" },
] as const;

// Transition — long enough to feel luxurious, spring-like cubic-bezier.
// Using a single `transition` string on ALL animated properties means they all
// start and end at exactly the same moment — no staggered snapping.
const DUR_MS = 800;
const EASE   = "cubic-bezier(0.34, 1.10, 0.64, 1)"; // slight overshoot = organic
const TRANSITION = `transform ${DUR_MS}ms ${EASE}, opacity ${DUR_MS}ms ${EASE}, filter ${DUR_MS}ms ${EASE}`;

// z-index switches at the midpoint so the front phone is always "on top" before
// the transition ends, but doesn't snap at the very start.
const Z_DELAY_MS = DUR_MS / 2;

const INTERVAL_MS  = 3800; // pause between rotations
const BASE_W       = 220;  // px — fixed for all phones
const PHONE_ASPECT = 674 / 370;
const BASE_H       = Math.round(BASE_W * PHONE_ASPECT);

// ─── slot z-index (applied after half the transition) ─────────────────────
const SLOT_Z = [20, 10, 10] as const;

// ─── component ───────────────────────────────────────────────────────────

export function PhoneOrbit({
  slides,
}: {
  slides: [OrbitSlide, OrbitSlide, OrbitSlide];
}) {
  // `positions[phoneIdx]` = current slot index for that phone
  const [positions, setPositions] = useState<[number, number, number]>([0, 1, 2]);
  // z-index lags behind by Z_DELAY_MS
  const [zPositions, setZPositions] = useState<[number, number, number]>([0, 1, 2]);

  const reducedRef = useRef(false);
  const mobileRef  = useRef(false);

  // listen for media-query changes
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile  = window.matchMedia("(max-width: 639px)");

    const sync = () => {
      reducedRef.current = reduced.matches;
      mobileRef.current  = mobile.matches;
    };
    sync();
    reduced.addEventListener("change", sync);
    mobile.addEventListener("change",  sync);
    return () => {
      reduced.removeEventListener("change", sync);
      mobile.removeEventListener("change",  sync);
    };
  }, []);

  // rotation interval
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden || reducedRef.current || mobileRef.current) return;

      // advance every phone one slot clockwise
      setPositions((prev) => [
        ((prev[0] + 1) % 3) as 0 | 1 | 2,
        ((prev[1] + 1) % 3) as 0 | 1 | 2,
        ((prev[2] + 1) % 3) as 0 | 1 | 2,
      ]);

      // z-index follows after half the transition
      setTimeout(() => {
        setZPositions((prev) => [
          ((prev[0] + 1) % 3) as 0 | 1 | 2,
          ((prev[1] + 1) % 3) as 0 | 1 | 2,
          ((prev[2] + 1) % 3) as 0 | 1 | 2,
        ]);
      }, Z_DELAY_MS);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        // container height accommodates the front phone + a little breathing room
        height: `${BASE_H + 40}px`,
      }}
    >
      {slides.map((slide, phoneIdx) => {
        const slotIdx  = positions[phoneIdx];
        const zSlotIdx = zPositions[phoneIdx];
        const slot     = SLOTS[slotIdx];

        return (
          <div
            key={slide.src}
            style={{
              // All phones share the same fixed dimensions.
              // Position, scale, and depth are ALL driven through transform — 
              // the compositor can animate this without touching layout or paint.
              position:  "absolute",
              width:     `${BASE_W}px`,
              height:    `${BASE_H}px`,
              // Anchor to container centre
              left:      `calc(50% - ${BASE_W / 2}px)`,
              top:       `calc(50% - ${BASE_H / 2}px)`,
              // Single transform property: translate → scale
              // Translating before scaling means tx/ty are in "pre-scale" space,
              // which gives predictable pixel offsets regardless of scale value.
              transform: `translate(${slot.tx}px, ${slot.ty}px) scale(${slot.scale})`,
              opacity:   slot.opacity,
              // filter (drop-shadow) is animated too — it fades between the two
              // values rather than snapping, which removes the shadow-class jank.
              filter:    `drop-shadow(${slot.shadow})`,
              zIndex:    SLOT_Z[zSlotIdx],
              transition: TRANSITION,
              transformOrigin: "center center",
              // Hint to the browser: promote to its own compositing layer.
              willChange: "transform, opacity, filter",
            }}
          >
            <Image
              src={slide.src}
              alt={slotIdx === 0 ? slide.alt : ""}
              width={BASE_W}
              height={BASE_H}
              loading="eager"
              priority={phoneIdx === 0}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        );
      })}
    </div>
  );
}
