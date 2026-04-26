interface PlantDividerProps {
  mounted: boolean;
}

export function PlantDivider({ mounted }: PlantDividerProps) {
  return (
    <div
      className={`flex items-center justify-center w-[60px] h-[327px] mt-[28px] -ml-3 -mr-3 transition-all duration-[1200ms] ease-out delay-[400ms]
        ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      <svg
        viewBox="0 0 60 320"
        width="60"
        height="320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Main stem */}
        <path
          d="M30 320 L30 45"
          stroke="url(#stemGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{
            strokeDasharray: 280,
            strokeDashoffset: mounted ? 0 : 280,
            transition: "stroke-dashoffset 1.4s ease-out 0.5s",
          }}
        />

        {/* Secondary thin stem - left */}
        <path
          d="M26 320 Q26 200 28 120"
          stroke="url(#stemGrad2)"
          strokeWidth="0.8"
          strokeLinecap="round"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: mounted ? 0 : 200,
            transition: "stroke-dashoffset 1.2s ease-out 0.7s",
          }}
        />

        {/* Secondary thin stem - right */}
        <path
          d="M34 320 Q34 210 31 130"
          stroke="url(#stemGrad2)"
          strokeWidth="0.8"
          strokeLinecap="round"
          style={{
            strokeDasharray: 190,
            strokeDashoffset: mounted ? 0 : 190,
            transition: "stroke-dashoffset 1.2s ease-out 0.8s",
          }}
        />

        {/* Leaf pair 1 - bottom */}
        <path
          d="M30 260 Q15 240 8 255 Q15 248 30 255"
          fill="url(#leafGrad)"
          style={{
            opacity: mounted ? 0.7 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 258px",
            transition: "opacity 0.5s ease-out 1s, transform 0.6s ease-out 1s",
          }}
        />
        <path
          d="M30 255 Q45 235 52 250 Q45 243 30 250"
          fill="url(#leafGrad)"
          style={{
            opacity: mounted ? 0.65 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 252px",
            transition: "opacity 0.5s ease-out 1.1s, transform 0.6s ease-out 1.1s",
          }}
        />

        {/* Leaf pair 2 - mid-low */}
        <path
          d="M30 210 Q12 190 5 208 Q14 198 30 205"
          fill="url(#leafGrad2)"
          style={{
            opacity: mounted ? 0.75 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 207px",
            transition: "opacity 0.5s ease-out 1.2s, transform 0.6s ease-out 1.2s",
          }}
        />
        <path
          d="M30 205 Q48 185 55 203 Q46 193 30 200"
          fill="url(#leafGrad2)"
          style={{
            opacity: mounted ? 0.7 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 202px",
            transition: "opacity 0.5s ease-out 1.3s, transform 0.6s ease-out 1.3s",
          }}
        />

        {/* Leaf pair 3 - middle */}
        <path
          d="M30 160 Q10 138 4 158 Q12 146 30 155"
          fill="url(#leafGrad)"
          style={{
            opacity: mounted ? 0.8 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 157px",
            transition: "opacity 0.5s ease-out 1.4s, transform 0.6s ease-out 1.4s",
          }}
        />
        <path
          d="M30 155 Q50 133 56 153 Q48 141 30 150"
          fill="url(#leafGrad2)"
          style={{
            opacity: mounted ? 0.75 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 152px",
            transition: "opacity 0.5s ease-out 1.5s, transform 0.6s ease-out 1.5s",
          }}
        />

        {/* Leaf pair 4 - upper */}
        <path
          d="M30 115 Q14 98 7 113 Q15 104 30 110"
          fill="url(#leafGrad2)"
          style={{
            opacity: mounted ? 0.7 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 112px",
            transition: "opacity 0.5s ease-out 1.6s, transform 0.6s ease-out 1.6s",
          }}
        />
        <path
          d="M30 110 Q46 93 53 108 Q45 99 30 105"
          fill="url(#leafGrad)"
          style={{
            opacity: mounted ? 0.65 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "30px 107px",
            transition: "opacity 0.5s ease-out 1.7s, transform 0.6s ease-out 1.7s",
          }}
        />

        {/* Top grain/rice head */}
        <path
          d="M30 50 Q28 35 22 25 Q20 20 22 18"
          stroke="url(#grainGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          style={{ opacity: mounted ? 0.9 : 0, transition: "opacity 0.6s ease-out 1.8s" }}
        />
        {[
          { cx: 22, cy: 18, r: 2.5 },
          { cx: 24, cy: 24, r: 2.2 },
          { cx: 26, cy: 30, r: 2 },
          { cx: 28, cy: 36, r: 1.8 },
        ].map((grain, i) => (
          <ellipse
            key={`grain-l-${i}`}
            cx={grain.cx}
            cy={grain.cy}
            rx={grain.r}
            ry={grain.r * 1.4}
            fill="url(#grainGrad)"
            style={{
              opacity: mounted ? 0.85 : 0,
              transform: mounted ? "scale(1)" : "scale(0)",
              transformOrigin: `${grain.cx}px ${grain.cy}px`,
              transition: `opacity 0.4s ease-out ${1.8 + i * 0.1}s, transform 0.5s ease-out ${1.8 + i * 0.1}s`,
            }}
          />
        ))}

        {/* Right panicle */}
        <path
          d="M30 55 Q33 40 38 30 Q40 25 38 22"
          stroke="url(#grainGrad)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          style={{ opacity: mounted ? 0.8 : 0, transition: "opacity 0.6s ease-out 1.9s" }}
        />
        {[
          { cx: 38, cy: 22, r: 2.2 },
          { cx: 37, cy: 28, r: 2 },
          { cx: 35, cy: 34, r: 1.8 },
        ].map((grain, i) => (
          <ellipse
            key={`grain-r-${i}`}
            cx={grain.cx}
            cy={grain.cy}
            rx={grain.r}
            ry={grain.r * 1.4}
            fill="url(#grainGrad)"
            style={{
              opacity: mounted ? 0.8 : 0,
              transform: mounted ? "scale(1)" : "scale(0)",
              transformOrigin: `${grain.cx}px ${grain.cy}px`,
              transition: `opacity 0.4s ease-out ${1.9 + i * 0.1}s, transform 0.5s ease-out ${1.9 + i * 0.1}s`,
            }}
          />
        ))}

        {/* Decorative dots */}
        {[180, 230, 280].map((y, i) => (
          <circle
            key={`dot-${i}`}
            cx={30}
            cy={y}
            r={1.5}
            fill="#FFD700"
            style={{ opacity: mounted ? 0.4 : 0, transition: `opacity 0.4s ease-out ${1.2 + i * 0.15}s` }}
          />
        ))}

        <defs>
          <linearGradient id="stemGrad" x1="30" y1="320" x2="30" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B8A835" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#C9B940" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D4C557" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="stemGrad2" x1="30" y1="320" x2="30" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A89830" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C9B940" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9ACD32" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#BFFF00" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A8C844" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#CDDC39" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="grainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFC700" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
