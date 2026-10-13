/** Abstract illustrated avatar: no real photos. Hue drives a calm two-tone palette. */
export function Avatar({ hue, size = 48, label }: { hue: number; size?: number; label?: string }) {
  const bg = `hsl(${hue} 70% 90%)`
  const skin = `hsl(${(hue + 30) % 360} 45% 72%)`
  const body = `hsl(${hue} 55% 52%)`
  const hair = `hsl(${(hue + 200) % 360} 25% 28%)`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label ?? 'Illustrated avatar'} className="shrink-0 rounded-full">
      <rect width="64" height="64" fill={bg} />
      <path d="M8 64c2-14 12-20 24-20s22 6 24 20z" fill={body} />
      <circle cx="32" cy="27" r="11" fill={skin} />
      <path d="M20.5 26c0-8 5-13 11.5-13s11.5 5 11.5 13c-3-4-7-6-11.5-6s-8.5 2-11.5 6z" fill={hair} />
    </svg>
  )
}
