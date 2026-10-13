import type { ReactNode } from 'react'

const tones = {
  neutral: 'bg-white border-line text-ink',
  purple: 'bg-purple-50 border-purple-100 text-purple-700',
  teal: 'bg-teal-50 border-teal-100 text-teal-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
}

export function Chip({ children, tone = 'neutral', icon, className = '' }: { children: ReactNode; tone?: keyof typeof tones; icon?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${tones[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  )
}

/** Selectable pill (filters, options). */
export function ChoiceChip({ selected, onClick, children, className = '' }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-12 rounded-full border px-4 text-base font-medium transition-colors duration-150 ${
        selected ? 'border-purple-600 bg-purple-600 text-white' : 'border-line bg-white text-ink hover:border-purple-200'
      } ${className}`}
    >
      {children}
    </button>
  )
}
