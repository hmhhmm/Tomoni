export type Scene = 'room' | 'window' | 'kitchen' | 'garden' | 'entry'
export const SCENES: Scene[] = ['room', 'window', 'kitchen', 'entry', 'garden']

/** Illustrated room scenes standing in for photographs. Soft light, no real people. */
export function Photo({ hue = 262, scene = 'room', className = '' }: { hue?: number; scene?: Scene; className?: string }) {
  const wall = `hsl(${hue} 55% 94%)`
  const wall2 = `hsl(${hue} 50% 89%)`
  const floor = `hsl(${(hue + 35) % 360} 30% 80%)`
  const floor2 = `hsl(${(hue + 35) % 360} 28% 72%)`
  const accent = `hsl(${hue} 52% 60%)`
  const accent2 = `hsl(${hue} 45% 74%)`
  const id = `g${hue}${scene}`
  return (
    <svg
      viewBox="0 0 400 300"
      className={`block h-full w-full ${className}`}
      role="img"
      aria-label={`Illustration: ${scene}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}w`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={wall} />
          <stop offset="1" stopColor={wall2} />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={floor} />
          <stop offset="1" stopColor={floor2} />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}w)`} />
      <rect y="205" width="400" height="95" fill={`url(#${id}f)`} />
      <rect y="203" width="400" height="4" fill="#000" opacity=".05" />
      {scene === 'room' && (
        <>
          <rect x="95" y="52" width="100" height="92" rx="8" fill="#fff" stroke={accent2} strokeWidth="5" />
          <path d="M145 52v92M95 98h100" stroke={accent2} strokeWidth="3" />
          <polygon points="105,56 165,56 120,144 105,144" fill={`url(#${id}l)`} />
          <rect x="205" y="140" width="150" height="66" rx="14" fill={accent} />
          <rect x="205" y="118" width="150" height="34" rx="14" fill={accent2} />
          <rect x="217" y="124" width="56" height="28" rx="10" fill="#fff" />
          <ellipse cx="280" cy="214" rx="85" ry="9" fill="#000" opacity=".07" />
          <rect x="68" y="190" width="9" height="32" fill="#8a7a6a" />
          <ellipse cx="72" cy="186" rx="19" ry="13" fill="#3CD0BD" />
          <circle cx="300" cy="74" r="26" fill="#3CD0BD" opacity=".25" />
        </>
      )}
      {scene === 'window' && (
        <>
          <rect x="70" y="30" width="260" height="170" rx="16" fill={`hsl(${(hue + 90) % 360} 70% 90%)`} stroke={accent2} strokeWidth="6" />
          <circle cx="270" cy="82" r="22" fill="#FFE29A" />
          <path d="M70 200c40-60 90-60 130-20s90 30 130-30v50z" fill="#3CD0BD" opacity=".45" />
          <path d="M200 30v170M70 115h260" stroke={accent2} strokeWidth="4" />
          <polygon points="80,36 170,36 110,196 80,196" fill={`url(#${id}l)`} />
        </>
      )}
      {scene === 'kitchen' && (
        <>
          <rect x="30" y="120" width="340" height="84" rx="8" fill="#fff" stroke={accent2} strokeWidth="4" />
          <rect x="30" y="120" width="340" height="14" fill={accent2} opacity=".6" />
          <rect x="50" y="36" width="120" height="58" rx="10" fill={accent} opacity=".75" />
          <rect x="190" y="36" width="120" height="58" rx="10" fill={accent2} />
          <circle cx="110" cy="164" r="20" fill="#3CD0BD" opacity=".5" />
          <rect x="240" y="146" width="60" height="38" rx="8" fill={accent} opacity=".5" />
        </>
      )}
      {scene === 'garden' && (
        <>
          <rect width="400" height="300" fill="#EAF8F2" />
          <rect y="170" width="400" height="130" fill="#BFE8DC" />
          <circle cx="100" cy="130" r="48" fill="#3CD0BD" opacity=".7" />
          <rect x="94" y="140" width="12" height="70" fill="#8a7a6a" />
          <circle cx="290" cy="110" r="38" fill={accent} opacity=".6" />
          <rect x="284" y="120" width="12" height="90" fill="#8a7a6a" />
          <circle cx="340" cy="52" r="20" fill="#FFE29A" />
        </>
      )}
      {scene === 'entry' && (
        <>
          <rect x="130" y="40" width="140" height="170" rx="10" fill="#fff" stroke={accent2} strokeWidth="5" />
          <circle cx="250" cy="130" r="7" fill={accent} />
          <rect x="60" y="188" width="70" height="22" rx="6" fill={accent2} />
          <rect x="290" y="150" width="60" height="60" rx="8" fill={accent} opacity=".6" />
        </>
      )}
    </svg>
  )
}
