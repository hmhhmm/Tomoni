import type { ReactNode } from 'react'

const tones = {
  neutral: 'border-line bg-white text-ink',
  brand: 'border-brand-100 bg-brand-50 text-brand-700',
  teal: 'border-teal-100 bg-teal-50 text-teal-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  ink: 'border-ink bg-ink text-white',
}

export function Chip({
  children,
  tone = 'neutral',
  icon,
  className = '',
}: {
  children: ReactNode
  tone?: keyof typeof tones
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium ${tones[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  )
}

/** Selectable pill (filters, options). */
export function Pill({
  selected,
  onClick,
  children,
  className = '',
  icon,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-base font-medium transition-colors duration-150 ${
        selected ? 'border-ink bg-ink text-white' : 'border-field bg-white text-ink hover:border-ink'
      } ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}
