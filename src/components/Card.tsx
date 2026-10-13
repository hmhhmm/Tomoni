import type { ReactNode, HTMLAttributes } from 'react'

export function Card({ children, className = '', tone = 'white', ...rest }: { children: ReactNode; className?: string; tone?: 'white' | 'purple' | 'teal' | 'amber' | 'rose' } & HTMLAttributes<HTMLDivElement>) {
  const tones = {
    white: 'bg-card border-line',
    purple: 'bg-purple-50 border-purple-100',
    teal: 'bg-teal-50 border-teal-100',
    amber: 'bg-amber-50 border-amber-200',
    rose: 'bg-rose-50 border-rose-200',
  }
  return (
    <div className={`rounded-card border p-4 shadow-soft ${tones[tone]} ${className}`} {...rest}>
      {children}
    </div>
  )
}
