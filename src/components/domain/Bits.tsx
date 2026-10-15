import type { ReactNode } from 'react'
import { ShieldCheck, ShieldQuestion } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Chip } from '../ui/Chip'

export function FictionalTag({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-line ${className}`}>
      {t('common.fictional')}
    </span>
  )
}

export function VerifiedBadge({ verified = true }: { verified?: boolean }) {
  const { t } = useTranslation()
  return verified ? (
    <Chip tone="teal" icon={<ShieldCheck size={14} aria-hidden />}>
      {t('common.verified')}
    </Chip>
  ) : (
    <Chip tone="amber" icon={<ShieldQuestion size={14} aria-hidden />}>
      {t('common.pendingId')}
    </Chip>
  )
}

export function Notice({
  tone = 'brand',
  icon,
  title,
  children,
  live,
}: {
  tone?: 'brand' | 'amber' | 'rose' | 'teal' | 'neutral'
  icon?: ReactNode
  title?: string
  children?: ReactNode
  live?: boolean
}) {
  const tones = {
    brand: 'bg-brand-50 border-brand-100',
    amber: 'bg-amber-50 border-amber-200',
    rose: 'bg-rose-50 border-rose-200',
    teal: 'bg-teal-50 border-teal-100',
    neutral: 'bg-surface border-soft',
  }
  return (
    <div role={live ? 'status' : undefined} aria-live={live ? 'polite' : undefined} className={`flex gap-3 rounded-card border p-4 ${tones[tone]}`}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-base">{children}</div>}
      </div>
    </div>
  )
}

/** `align="left"` sits at the start of a wide page (the Stay tabs), instead of centred in a narrow one. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  align = 'center',
}: {
  icon: ReactNode
  title: string
  body?: string
  action?: ReactNode
  align?: 'center' | 'left'
}) {
  return (
    <div
      className={`flex max-w-md flex-col rounded-card border border-dashed border-line px-6 py-12 ${align === 'left' ? 'items-start text-left' : 'mx-auto items-center text-center'}`}
    >
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-surface text-muted">{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {body && <p className="mt-1 text-base text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Page container used by every screen. */
export function Page({ children, narrow = false, className = '' }: { children: ReactNode; narrow?: boolean; className?: string }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 ${narrow ? 'max-w-3xl' : 'max-w-[1440px]'} ${className}`}>{children}</div>
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[1.375rem] font-semibold leading-snug">{children}</h2>
      {sub && <p className="mt-1 text-base text-muted">{sub}</p>}
    </div>
  )
}
