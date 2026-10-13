import { Link } from 'react-router-dom'
import { useL, yen } from '../../lib/hooks'
import type { Listing } from '../../data/types'

// Bounding box around the 6 sample wards (Tokyo).
const B = { latMin: 35.655, latMax: 35.795, lngMin: 139.57, lngMax: 139.9 }
const proj = (lat: number, lng: number) => ({
  x: ((lng - B.lngMin) / (B.lngMax - B.lngMin)) * 100,
  y: (1 - (lat - B.latMin) / (B.latMax - B.latMin)) * 100,
})

/** Stylised map with real station coordinates. Price pins link to the listing. */
export function MapView({ items, className = '', selected }: { items: Listing[]; className?: string; selected?: string }) {
  const text = useL()
  return (
    <div className={`relative overflow-hidden rounded-card bg-[#EAF3EE] ${className}`} role="group" aria-label="Map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="100" height="100" fill="#EEF2EC" />
        <path d="M0 78C18 70 30 86 52 74S84 62 100 70V100H0Z" fill="#DCEFF3" />
        <path d="M0 30C25 22 40 40 62 28S88 14 100 22" stroke="#C7E5EC" strokeWidth="2.4" fill="none" />
        <g stroke="#fff" strokeWidth="1.2" fill="none">
          <path d="M8 0 28 100M42 0 56 100M72 0 90 100M0 20 100 12M0 52 100 46M0 84 100 78" />
        </g>
        <g stroke="#D8D8D0" strokeWidth=".5" strokeDasharray="1.5 1.5" fill="none">
          <path d="M0 40 100 34M20 0 30 100" />
        </g>
      </svg>
      {items.map((l) => {
        const p = proj(l.lat, l.lng)
        const on = selected === l.id
        return (
          <Link
            key={l.id}
            to={`/rooms/${l.id}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={`${text(l.area)} ${yen(l.homeshareRent)}`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold shadow-lift transition hover:z-10 hover:scale-105 ${on ? 'z-10 bg-ink text-white' : 'bg-white text-ink'}`}
          >
            {yen(l.homeshareRent)}
          </Link>
        )
      })}
    </div>
  )
}
