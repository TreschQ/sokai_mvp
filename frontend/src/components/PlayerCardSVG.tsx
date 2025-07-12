// PlayerCardSVG.tsx
type PlayerCardSVGProps = {
  name?: string;
  xp?: number;
  trainingTime?: number;
  drills?: number;
  series?: number;
};

export default function PlayerCardSVG({ name, xp, trainingTime, drills, series }: PlayerCardSVGProps) {
  return (
    <svg
      viewBox="0 0 320 480"
      width="320"
      height="480"
      style={{ display: "block" }}
      className="drop-shadow-lg"
    >
      {/* Bouclier */}
      <defs>
        <linearGradient id="shield-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6fff0" />
          <stop offset="60%" stopColor="#176a2f" />
          <stop offset="100%" stopColor="#082315" />
        </linearGradient>
      </defs>
      <path
        d="M10 40 Q20 15 50 10 Q110 0 160 0 Q210 0 270 10 Q300 15 310 40 Q320 90 320 220 Q320 320 260 400 Q210 460 160 480 Q110 460 60 400 Q0 320 0 220 Q0 90 10 40 Z"
        fill="url(#shield-gradient)"
        stroke="#154e23"
        strokeWidth="6"
      />

      {/* Texte Position (ex: MOC) */}
      <text x="30" y="70" fontSize="18" fill="#fff" fontWeight="bold" letterSpacing="2">
        MOC
      </text>

      {/* Header joueur + XP */}
      <text
        x="30"
        y="120"
        fontSize="22"
        fill="#fff"
        fontStyle="italic"
        fontWeight="bold"
      >
        {name || "MBAPPE JR"}
      </text>
      <rect x="220" y="97" width="70" height="30" rx="12" fill="#202d1a" />
      <text
        x="255"
        y="117"
        fontSize="20"
        fill="#c8fa81"
        fontWeight="bold"
        textAnchor="middle"
      >
        {xp || 50} XP
      </text>

      {/* Ligne verte */}
      <rect x="22" y="140" width="276" height="22" rx="6" fill="#a4ef41" />

      {/* Tableau Stats */}
      <g fontSize="20" fontWeight="500">
        <rect x="22" y="166" width="276" height="46" fill="#dbffbe" />
        <text x="40" y="195" fill="#253717">Training time</text>
        <text x="262" y="195" fill="#253717" textAnchor="end">{trainingTime || 121}</text>

        <rect x="22" y="212" width="276" height="46" fill="#eafbd8" />
        <text x="40" y="242" fill="#253717">Drills</text>
        <text x="262" y="242" fill="#253717" textAnchor="end">{drills || 46}</text>

        <rect x="22" y="258" width="276" height="46" fill="#eafbd8" />
        <text x="40" y="288" fill="#253717">Series</text>
        <text x="262" y="288" fill="#253717" textAnchor="end">{series || 1}</text>
      </g>
    </svg>
  )
}
