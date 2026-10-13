/** Abstract illustrated room scenes standing in for photos. */
export function RoomArt({ hue = 262, scene = 'room', className = '' }: { hue?: number; scene?: 'room' | 'window' | 'kitchen' | 'garden'; className?: string }) {
  const wall = `hsl(${hue} 60% 94%)`
  const floor = `hsl(${(hue + 40) % 360} 35% 82%)`
  const accent = `hsl(${hue} 55% 62%)`
  const teal = '#3CD0BD'
  return (
    <svg viewBox="0 0 320 200" className={`block h-full w-full ${className}`} role="img" aria-label={`Illustration: ${scene}`} preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill={wall} />
      <rect y="140" width="320" height="60" fill={floor} />
      {scene === 'room' && (
        <>
          <rect x="30" y="40" width="80" height="70" rx="8" fill="#fff" stroke={accent} strokeWidth="3" />
          <path d="M70 40v70M30 75h80" stroke={accent} strokeWidth="2" />
          <rect x="150" y="96" width="140" height="48" rx="10" fill={accent} />
          <rect x="150" y="80" width="46" height="26" rx="8" fill="#fff" />
          <circle cx="262" cy="70" r="26" fill={teal} opacity=".35" />
          <rect x="120" y="150" width="8" height="28" fill="#8a7a6a" />
          <ellipse cx="124" cy="148" rx="16" ry="10" fill={teal} />
        </>
      )}
      {scene === 'window' && (
        <>
          <rect x="60" y="24" width="200" height="124" rx="14" fill={`hsl(${(hue + 90) % 360} 70% 88%)`} stroke={accent} strokeWidth="4" />
          <circle cx="210" cy="64" r="16" fill="#FFE29A" />
          <path d="M60 148c30-40 70-40 100-10s70 20 100-20v30z" fill={teal} opacity=".5" />
          <path d="M160 24v124" stroke={accent} strokeWidth="3" />
        </>
      )}
      {scene === 'kitchen' && (
        <>
          <rect x="20" y="90" width="280" height="56" rx="6" fill="#fff" stroke={accent} strokeWidth="3" />
          <rect x="40" y="30" width="90" height="44" rx="8" fill={accent} opacity=".7" />
          <circle cx="210" cy="118" r="18" fill={teal} opacity=".5" />
          <rect x="240" y="104" width="32" height="30" rx="6" fill={accent} opacity=".5" />
        </>
      )}
      {scene === 'garden' && (
        <>
          <rect y="120" width="320" height="80" fill="#BFE8DC" />
          <circle cx="80" cy="100" r="34" fill={teal} opacity=".7" />
          <rect x="76" y="110" width="8" height="40" fill="#8a7a6a" />
          <circle cx="220" cy="90" r="26" fill={accent} opacity=".6" />
          <rect x="216" y="100" width="8" height="50" fill="#8a7a6a" />
        </>
      )}
    </svg>
  )
}
