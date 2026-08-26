import { cn } from "@/lib/utils";
import type { PatternId } from "@/lib/types";

/**
 * Procedural skin artwork. Every design is generated as inline SVG from its
 * palette + pattern, so the catalogue ships without binary assets and stays
 * crisp at any size. Swap `src` images in later without touching consumers.
 */
export function SkinArt({
  pattern,
  colors,
  className,
}: {
  pattern: PatternId;
  colors: [string, string];
  className?: string;
}) {
  const [c1, c2] = colors;
  const gid = `g-${pattern}-${c1.replace("#", "")}${c2.replace("#", "")}`;
  const clip = `${gid}-clip`;

  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`${gid}-r`} cx="0.3" cy="0.2" r="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        <clipPath id={clip}>
          <rect width="400" height="400" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>{renderPattern(pattern, c1, c2, gid)}</g>
    </svg>
  );
}

function renderPattern(p: PatternId, c1: string, c2: string, gid: string) {
  switch (p) {
    case "gradient":
      return (
        <>
          <rect width="400" height="400" fill={`url(#${gid})`} />
          <circle cx="320" cy="80" r="140" fill="#ffffff" opacity="0.14" />
          <circle cx="60" cy="340" r="110" fill={c2} opacity="0.25" />
        </>
      );
    case "solid":
      return (
        <>
          <rect width="400" height="400" fill={c1} />
          <rect y="300" width="400" height="100" fill={c2} opacity="0.12" />
        </>
      );
    case "waves":
      return (
        <>
          <rect width="400" height="400" fill={`url(#${gid})`} />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M-20 ${150 + i * 62} C 90 ${100 + i * 62}, 180 ${210 + i * 46}, 420 ${130 + i * 58}`}
              stroke="#ffffff"
              strokeOpacity={0.35 - i * 0.06}
              strokeWidth={14 - i * 2}
              fill="none"
            />
          ))}
        </>
      );
    case "neon-grid":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          <rect width="400" height="400" fill={`url(#${gid}-r)`} opacity="0.55" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke={c1} strokeWidth="1.5" opacity="0.6" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke={c1} strokeWidth="1.5" opacity="0.6" />
          ))}
          <circle cx="200" cy="200" r="90" fill={c1} opacity="0.22" />
          <circle cx="200" cy="200" r="46" fill="#fff" opacity="0.85" />
        </>
      );
    case "marble":
      return (
        <>
          <rect width="400" height="400" fill={c1} />
          <path d="M-20 90 C 120 40, 190 160, 300 120 S 430 60, 440 90" stroke={c2} strokeWidth="7" fill="none" opacity="0.75" />
          <path d="M-20 200 C 140 150, 220 260, 330 210 S 440 170, 450 200" stroke={c2} strokeWidth="10" fill="none" opacity="0.55" />
          <path d="M-20 320 C 100 280, 240 380, 420 300" stroke={c2} strokeWidth="5" fill="none" opacity="0.65" />
          <path d="M40 -20 C 90 120, 30 260, 110 420" stroke={c2} strokeWidth="4" fill="none" opacity="0.4" />
        </>
      );
    case "mountains":
      return (
        <>
          <rect width="400" height="400" fill={c1} />
          <polygon points="0,400 140,180 260,400" fill={c2} opacity="0.8" />
          <polygon points="150,400 290,140 400,320 400,400" fill={c2} />
          <polygon points="-40,400 80,250 190,400" fill={c2} opacity="0.55" />
          <circle cx="310" cy="80" r="44" fill="#ffffff" opacity="0.9" />
        </>
      );
    case "stars":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          <ellipse cx="200" cy="230" rx="230" ry="160" fill={`url(#${gid}-r)`} opacity="0.5" />
          {[[40, 60], [120, 140], [210, 40], [300, 110], [360, 200], [80, 260], [170, 320], [330, 330], [260, 260]].map(
            ([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 2.5} fill="#ffffff" opacity={0.5 + (i % 3) * 0.2} />
            )
          )}
          <circle cx="200" cy="230" r="34" fill="#ffffff" opacity="0.95" />
        </>
      );
    case "blobs":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          <path d="M60 120 q 70 -90 150 -20 t 140 60 q 30 90 -60 120 t -160 -10 q -100 -30 -70 -150" fill={c1} opacity="0.9" />
          <circle cx="300" cy="300" r="70" fill={c1} opacity="0.65" />
          <circle cx="90" cy="320" r="46" fill="#ffffff" opacity="0.25" />
        </>
      );
    case "stripes":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={-200 + i * 110} y="-100" width="46" height="600" fill={i % 2 ? c1 : "#ffffff"} transform="rotate(18 200 200)" opacity={i % 2 ? 1 : 0.16} />
          ))}
        </>
      );
    case "carbon":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 50}
                y={r * 50}
                width="50"
                height="50"
                fill={c1}
                opacity={(r + c) % 2 ? 0.5 : 0.28}
              />
            ))
          )}
        </>
      );
    case "leather":
      return (
        <>
          <rect width="400" height="400" fill={c1} />
          {Array.from({ length: 14 }, (_, r) =>
            Array.from({ length: 14 }, (_, c) => (
              <circle key={`${r}-${c}`} cx={c * 30 + (r % 2) * 15} cy={r * 30} r="3" fill={c2} opacity="0.35" />
            ))
          )}
        </>
      );
    case "topo":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          {[40, 80, 120, 160, 200].map((r, i) => (
            <ellipse key={r} cx="200" cy="200" rx={r + 40} ry={r} fill="none" stroke={c1} strokeWidth="3" opacity={0.85 - i * 0.13} />
          ))}
          <ellipse cx="200" cy="200" rx="52" ry="26" fill={c1} opacity="0.9" />
        </>
      );
    case "circuit":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          {[
            "M0 80 H140 V160 H260",
            "M400 120 H300 V240 H180 V340",
            "M0 300 H90 V220 H200",
            "M400 40 H320 V100",
            "M60 400 V300",
          ].map((d, i) => (
            <path key={i} d={d} stroke={c1} strokeWidth="4" fill="none" opacity="0.85" />
          ))}
          {[[140, 160], [260, 160], [180, 240], [200, 340], [90, 300], [320, 100], [60, 400]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="7" fill={c1} />
          ))}
        </>
      );
    case "petals":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          {[
            [80, 90, 0.9], [220, 60, 0.6], [330, 150, 0.8], [140, 220, 0.7],
            [300, 300, 0.85], [60, 320, 0.6], [230, 370, 0.75], [380, 250, 0.5],
          ].map(([x, y, o], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 47})`} opacity={o}>
              <ellipse rx="34" ry="16" fill={c1} />
              <ellipse rx="34" ry="16" fill="#ffffff" opacity="0.18" cx="6" cy="-6" />
            </g>
          ))}
        </>
      );
    case "rays":
      return (
        <>
          <rect width="400" height="400" fill={c2} />
          {Array.from({ length: 12 }, (_, i) => (
            <polygon
              key={i}
              points="0,0 480,-40 480,40"
              fill={i % 2 ? c1 : "#ffffff"}
              opacity={i % 2 ? 0.75 : 0.14}
              transform={`rotate(${i * 30} 0 0)`}
            />
          ))}
          <circle cx="0" cy="0" r="60" fill={c1} />
        </>
      );
    case "checker":
      return (
        <>
          <rect width="400" height="400" fill={c1} />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) =>
              (r + c) % 2 ? (
                <text
                  key={`${r}-${c}`}
                  x={c * 100 + 50}
                  y={r * 100 + 66}
                  textAnchor="middle"
                  fontSize="72"
                  fontWeight="800"
                  fontFamily="Inter, sans-serif"
                  fill={c2}
                  opacity="0.9"
                >
                  Aa
                </text>
              ) : null
            )
          )}
        </>
      );
  }
}
