/** Original abstract industrial graphics — CSS/SVG only, no third-party assets. */

export function IndustrialMesh({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 blueprint-grid opacity-40" />
      <div
        className="absolute -top-1/4 left-1/2 h-[80%] w-[90%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(200 255 0 / 0.08) 0%, transparent 60%)",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ind-hex" width="48" height="42" patternUnits="userSpaceOnUse">
            <path
              d="M24 2 L44 14 L44 36 L24 48 L4 36 L4 14 Z"
              fill="none"
              stroke="#f2f0eb"
              strokeWidth="0.5"
              transform="scale(0.85)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ind-hex)" />
      </svg>
      {/* Geometric megastructure silhouettes */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2">
        <svg viewBox="0 0 1200 400" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
          <g fill="none" stroke="#f2f0eb" strokeWidth="1" opacity="0.18">
            <rect x="80" y="120" width="160" height="280" />
            <rect x="100" y="80" width="40" height="40" />
            <line x1="80" y1="200" x2="240" y2="200" />
            <rect x="280" y="60" width="90" height="340" />
            <circle cx="325" cy="40" r="28" stroke="#c8ff00" strokeWidth="1.5" opacity="0.9" />
            <line x1="325" y1="68" x2="325" y2="120" stroke="#c8ff00" opacity="0.5" />
            <polygon points="420,400 520,80 620,400" />
            <rect x="680" y="160" width="200" height="240" />
            <line x1="680" y1="220" x2="880" y2="220" />
            <line x1="680" y1="280" x2="880" y2="280" />
            <rect x="940" y="40" width="120" height="360" />
            <path d="M1060 400 L1120 200 L1180 400" />
          </g>
          <g fill="#c8ff00" opacity="0.35">
            <rect x="100" y="300" width="8" height="8" />
            <rect x="300" y="180" width="6" height="6" />
            <rect x="720" y="200" width="8" height="8" />
            <rect x="980" y="100" width="6" height="6" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />
    </div>
  );
}

export function ModuleVisual({
  code,
  accent = "#c8ff00",
  label,
}: {
  code: string;
  accent?: string;
  label: string;
}) {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-[rgb(242_240_235_/_0.1)] bg-[#0c0c0c]">
      <div className="absolute inset-0 blueprint-grid opacity-50" />
      <div className="absolute inset-0 diagonal-stripe opacity-40" />
      <svg viewBox="0 0 200 150" className="relative z-10 h-[70%] w-[70%] opacity-80">
        <rect x="20" y="30" width="160" height="90" fill="none" stroke="#f2f0eb" strokeWidth="1" opacity="0.35" />
        <rect x="40" y="50" width="120" height="50" fill="none" stroke={accent} strokeWidth="1.5" />
        <circle cx="100" cy="75" r="18" fill="none" stroke={accent} strokeWidth="1.2" />
        <circle cx="100" cy="75" r="6" fill={accent} opacity="0.8" />
        <line x1="20" y1="30" x2="40" y2="50" stroke="#f2f0eb" strokeWidth="0.75" opacity="0.3" />
        <line x1="180" y1="30" x2="160" y2="50" stroke="#f2f0eb" strokeWidth="0.75" opacity="0.3" />
        <line x1="20" y1="120" x2="40" y2="100" stroke="#f2f0eb" strokeWidth="0.75" opacity="0.3" />
        <line x1="180" y1="120" x2="160" y2="100" stroke="#f2f0eb" strokeWidth="0.75" opacity="0.3" />
        <text
          x="100"
          y="140"
          textAnchor="middle"
          fill="#f2f0eb"
          opacity="0.4"
          fontSize="8"
          fontFamily="monospace"
        >
          {code}
        </text>
      </svg>
      <span className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-[rgb(242_240_235_/_0.4)] uppercase">
        {label}
      </span>
      <span
        className="absolute top-3 right-3 size-2 animate-accent-pulse"
        style={{ background: accent }}
      />
    </div>
  );
}

export function SpecChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-[rgb(242_240_235_/_0.1)] bg-[#0c0c0c] px-3 py-2">
      <p className="tech-label mb-1">{label}</p>
      <p
        className={`font-mono text-xs tracking-wide ${accent ? "text-primary" : "text-[rgb(242_240_235_/_0.85)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
