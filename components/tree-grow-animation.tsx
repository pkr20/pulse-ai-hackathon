"use client"

import type { TreeType } from "@/lib/store"

interface TreeGrowAnimationProps {
  treeType: TreeType
  label?: string
  sublabel?: string
}

export default function TreeGrowAnimation({
  treeType,
  label = "Tree planted",
  sublabel,
}: TreeGrowAnimationProps) {
  const tree = TREES[treeType]

  return (
    <div className="flex flex-col items-center gap-3 animate-in fade-in duration-500">
      <div className="relative h-48 w-48">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {/* Ground shadow */}
          <ellipse
            cx="100"
            cy="178"
            rx="45"
            ry="5"
            fill={tree.groundColor}
            style={{ animation: "tga-ground 0.4s ease-out 0.1s both" }}
          />

          {/* Trunk */}
          {tree.trunk}

          {/* Foliage layers */}
          {tree.foliage}

          {/* Checkmark badge */}
          <g style={{ animation: "tga-check-pop 0.4s ease-out 1.6s both" }}>
            <circle cx="160" cy="40" r="16" fill="oklch(0.55 0.17 145)" />
            <path
              d="M151 40l5 5 9-10"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="20"
              style={{ animation: "tga-draw-check 0.4s ease-out 1.8s both" }}
            />
          </g>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-primary">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
      </div>

      <style jsx>{`
        @keyframes tga-ground {
          from { opacity: 0; transform: scaleX(0); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes tga-trunk {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes tga-foliage {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes tga-check-pop {
          from { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes tga-draw-check {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes tga-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes tga-blossom {
          from { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Unique SVG pieces per tree species                                 */
/* ------------------------------------------------------------------ */

const TREES: Record<
  TreeType,
  {
    groundColor: string
    trunk: React.ReactNode
    foliage: React.ReactNode
  }
> = {
  /* OAK - wide, strong, rounded canopy */
  oak: {
    groundColor: "oklch(0.40 0.10 152 / 0.12)",
    trunk: (
      <g>
        <rect
          x="90" y="110" width="20" height="65" rx="4"
          fill="oklch(0.38 0.06 55)"
          style={{ transformOrigin: "100px 175px", animation: "tga-trunk 0.6s ease-out 0.2s both" }}
        />
        {/* Branch stubs */}
        <rect
          x="78" y="120" width="16" height="6" rx="3"
          fill="oklch(0.38 0.06 55)"
          style={{ transformOrigin: "90px 123px", animation: "tga-foliage 0.3s ease-out 0.5s both" }}
        />
        <rect
          x="106" y="130" width="14" height="5" rx="3"
          fill="oklch(0.38 0.06 55)"
          style={{ transformOrigin: "110px 132px", animation: "tga-foliage 0.3s ease-out 0.55s both" }}
        />
      </g>
    ),
    foliage: (
      <g>
        <ellipse cx="100" cy="80" rx="48" ry="38"
          fill="oklch(0.42 0.12 148)"
          style={{ transformOrigin: "100px 95px", animation: "tga-foliage 0.5s ease-out 0.7s both" }}
        />
        <ellipse cx="78" cy="72" rx="28" ry="25"
          fill="oklch(0.46 0.13 150)"
          style={{ transformOrigin: "78px 85px", animation: "tga-foliage 0.5s ease-out 0.9s both" }}
        />
        <ellipse cx="122" cy="72" rx="28" ry="25"
          fill="oklch(0.46 0.13 150)"
          style={{ transformOrigin: "122px 85px", animation: "tga-foliage 0.5s ease-out 0.95s both" }}
        />
        <ellipse cx="100" cy="58" rx="30" ry="24"
          fill="oklch(0.50 0.14 152)"
          style={{ transformOrigin: "100px 70px", animation: "tga-foliage 0.5s ease-out 1.15s both" }}
        />
      </g>
    ),
  },

  /* PINE - classic triangular evergreen */
  pine: {
    groundColor: "oklch(0.40 0.10 152 / 0.12)",
    trunk: (
      <rect
        x="94" y="120" width="12" height="55" rx="3"
        fill="oklch(0.35 0.06 50)"
        style={{ transformOrigin: "100px 175px", animation: "tga-trunk 0.6s ease-out 0.2s both" }}
      />
    ),
    foliage: (
      <g>
        <polygon points="100,28 145,120 55,120"
          fill="oklch(0.35 0.14 155)"
          style={{ transformOrigin: "100px 120px", animation: "tga-foliage 0.5s ease-out 0.7s both" }}
        />
        <polygon points="100,18 138,95 62,95"
          fill="oklch(0.40 0.15 155)"
          style={{ transformOrigin: "100px 95px", animation: "tga-foliage 0.5s ease-out 0.95s both" }}
        />
        <polygon points="100,8 130,68 70,68"
          fill="oklch(0.45 0.16 155)"
          style={{ transformOrigin: "100px 68px", animation: "tga-foliage 0.5s ease-out 1.2s both" }}
        />
      </g>
    ),
  },

  /* CHERRY - delicate trunk with pink blossoms */
  cherry: {
    groundColor: "oklch(0.65 0.12 350 / 0.10)",
    trunk: (
      <g>
        <path
          d="M100 175 Q95 145 90 125 Q88 115 92 108"
          fill="none" stroke="oklch(0.40 0.05 45)" strokeWidth="8" strokeLinecap="round"
          style={{ transformOrigin: "95px 175px", animation: "tga-trunk 0.6s ease-out 0.2s both" }}
        />
        {/* Branch left */}
        <path
          d="M93 125 Q78 110 65 100"
          fill="none" stroke="oklch(0.40 0.05 45)" strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: "93px 125px", animation: "tga-foliage 0.4s ease-out 0.5s both" }}
        />
        {/* Branch right */}
        <path
          d="M95 115 Q110 100 128 95"
          fill="none" stroke="oklch(0.40 0.05 45)" strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: "95px 115px", animation: "tga-foliage 0.4s ease-out 0.55s both" }}
        />
      </g>
    ),
    foliage: (
      <g>
        {/* Blossom clusters */}
        {[
          { cx: 65, cy: 92, r: 18, d: 0.7 },
          { cx: 55, cy: 80, r: 14, d: 0.85 },
          { cx: 128, cy: 88, r: 18, d: 0.8 },
          { cx: 140, cy: 78, r: 13, d: 0.9 },
          { cx: 92, cy: 100, r: 16, d: 0.75 },
          { cx: 100, cy: 80, r: 20, d: 0.95 },
          { cx: 85, cy: 68, r: 16, d: 1.0 },
          { cx: 115, cy: 70, r: 17, d: 1.05 },
          { cx: 100, cy: 55, r: 15, d: 1.15 },
        ].map((b, i) => (
          <circle
            key={i}
            cx={b.cx} cy={b.cy} r={b.r}
            fill={i % 2 === 0 ? "oklch(0.80 0.10 350)" : "oklch(0.85 0.12 355)"}
            style={{
              transformOrigin: `${b.cx}px ${b.cy}px`,
              animation: `tga-blossom 0.4s ease-out ${b.d}s both`,
            }}
          />
        ))}
      </g>
    ),
  },

  /* BIRCH - thin white trunk with light green leaves */
  birch: {
    groundColor: "oklch(0.45 0.10 150 / 0.10)",
    trunk: (
      <g style={{ transformOrigin: "100px 175px", animation: "tga-trunk 0.6s ease-out 0.2s both" }}>
        <rect x="95" y="85" width="10" height="90" rx="3" fill="oklch(0.92 0.01 90)" />
        {/* Birch marks */}
        {[95, 110, 125, 140, 155].map((y, i) => (
          <rect key={i} x="96" y={y} width="8" height="2" rx="1" fill="oklch(0.35 0.02 90)" opacity="0.5" />
        ))}
      </g>
    ),
    foliage: (
      <g>
        <ellipse cx="100" cy="72" rx="32" ry="30"
          fill="oklch(0.60 0.14 138)"
          style={{ transformOrigin: "100px 90px", animation: "tga-foliage 0.5s ease-out 0.7s both" }}
        />
        <ellipse cx="82" cy="62" rx="22" ry="20"
          fill="oklch(0.65 0.15 140)"
          style={{ transformOrigin: "82px 75px", animation: "tga-foliage 0.5s ease-out 0.9s both" }}
        />
        <ellipse cx="118" cy="62" rx="22" ry="20"
          fill="oklch(0.65 0.15 140)"
          style={{ transformOrigin: "118px 75px", animation: "tga-foliage 0.5s ease-out 0.95s both" }}
        />
        <ellipse cx="100" cy="48" rx="22" ry="18"
          fill="oklch(0.70 0.16 142)"
          style={{ transformOrigin: "100px 60px", animation: "tga-foliage 0.5s ease-out 1.15s both" }}
        />
      </g>
    ),
  },

  /* WILLOW - drooping, flowing branches */
  willow: {
    groundColor: "oklch(0.42 0.10 152 / 0.10)",
    trunk: (
      <g>
        <path
          d="M100 175 Q98 145 100 110 Q101 100 100 90"
          fill="none" stroke="oklch(0.40 0.05 65)" strokeWidth="12" strokeLinecap="round"
          style={{ transformOrigin: "100px 175px", animation: "tga-trunk 0.6s ease-out 0.2s both" }}
        />
      </g>
    ),
    foliage: (
      <g>
        {/* Crown */}
        <ellipse cx="100" cy="75" rx="30" ry="22"
          fill="oklch(0.48 0.12 148)"
          style={{ transformOrigin: "100px 75px", animation: "tga-foliage 0.5s ease-out 0.65s both" }}
        />
        {/* Drooping branches */}
        {[
          "M72 78 Q55 110 50 150",
          "M80 82 Q68 115 62 145",
          "M88 85 Q80 118 78 148",
          "M112 85 Q120 118 122 148",
          "M120 82 Q132 115 138 145",
          "M128 78 Q145 110 150 150",
        ].map((d, i) => (
          <path
            key={i} d={d}
            fill="none"
            stroke={i % 2 === 0 ? "oklch(0.48 0.13 148)" : "oklch(0.52 0.14 150)"}
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              transformOrigin: `${i < 3 ? "80" : "120"}px 80px`,
              animation: `tga-foliage 0.5s ease-out ${0.8 + i * 0.08}s both`,
            }}
          />
        ))}
      </g>
    ),
  },

  /* MAPLE - broad, round canopy with warm autumn tones */
  maple: {
    groundColor: "oklch(0.55 0.12 55 / 0.10)",
    trunk: (
      <g>
        <rect
          x="92" y="108" width="16" height="67" rx="4"
          fill="oklch(0.38 0.06 50)"
          style={{ transformOrigin: "100px 175px", animation: "tga-trunk 0.6s ease-out 0.2s both" }}
        />
        <rect
          x="76" y="125" width="18" height="6" rx="3"
          fill="oklch(0.38 0.06 50)"
          style={{ transformOrigin: "92px 128px", animation: "tga-foliage 0.3s ease-out 0.5s both" }}
        />
        <rect
          x="106" y="118" width="16" height="5" rx="3"
          fill="oklch(0.38 0.06 50)"
          style={{ transformOrigin: "108px 120px", animation: "tga-foliage 0.3s ease-out 0.55s both" }}
        />
      </g>
    ),
    foliage: (
      <g>
        <ellipse cx="100" cy="78" rx="46" ry="36"
          fill="oklch(0.58 0.16 45)"
          style={{ transformOrigin: "100px 95px", animation: "tga-foliage 0.5s ease-out 0.7s both" }}
        />
        <ellipse cx="75" cy="68" rx="26" ry="22"
          fill="oklch(0.62 0.18 38)"
          style={{ transformOrigin: "75px 80px", animation: "tga-foliage 0.5s ease-out 0.9s both" }}
        />
        <ellipse cx="125" cy="68" rx="26" ry="22"
          fill="oklch(0.60 0.17 42)"
          style={{ transformOrigin: "125px 80px", animation: "tga-foliage 0.5s ease-out 0.95s both" }}
        />
        <ellipse cx="100" cy="52" rx="28" ry="22"
          fill="oklch(0.65 0.19 35)"
          style={{ transformOrigin: "100px 65px", animation: "tga-foliage 0.5s ease-out 1.15s both" }}
        />
      </g>
    ),
  },
}
