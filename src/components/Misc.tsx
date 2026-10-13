import { ShieldCheck, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Chip } from './Chip'
import type { ReactNode } from 'react'

export function FictionalTag() {
  const { t } = useTranslation()
  return <Chip tone="amber" className="!py-0.5 !text-xs">{t('common.fictional')}</Chip>
}

export function VerifiedBadge({ verified = true }: { verified?: boolean }) {
  const { t } = useTranslation()
  return verified ? (
    <Chip tone="teal" icon={<ShieldCheck size={16} aria-hidden />}>{t('common.verified')}</Chip>
  ) : (
    <Chip tone="amber" icon={<Info size={16} aria-hidden />}>{t('common.pendingId')}</Chip>
  )
}

export function ConceptFooter() {
  const { t } = useTranslation()
  return <p className="mt-6 rounded-2xl bg-white/70 px-4 py-3 text-center text-sm text-muted">{t('common.concept')}</p>
}

export function Notice({ tone = 'purple', icon, title, children, live }: { tone?: 'purple' | 'amber' | 'rose' | 'teal'; icon?: ReactNode; title?: string; children?: ReactNode; live?: boolean }) {
  const tones = {
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-200',
    rose: 'bg-rose-50 border-rose-200',
    teal: 'bg-teal-50 border-teal-100',
  }
  return (
    <div role={live ? 'status' : undefined} aria-live={live ? 'polite' : undefined} className={`flex gap-3 rounded-card border p-4 ${tones[tone]}`}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div>
        {title && <p className="font-heading font-semibold">{title}</p>}
        {children && <div className="text-base">{children}</div>}
      </div>
    </div>
  )
}
