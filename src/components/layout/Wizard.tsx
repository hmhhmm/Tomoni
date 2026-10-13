import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'

/** Airbnb-style focused flow: big question, content, then a fixed footer with progress segments, Back and Next. */
export function Wizard({
  step,
  total,
  title,
  lede,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  exitTo = '/host',
}: {
  step: number
  total: number
  title: string
  lede?: string
  children: ReactNode
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  exitTo?: string
}) {
  const { t } = useTranslation()
  const nav = useNavigate()
  return (
    <div className="pb-28">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted">{t('wizard.step', { n: step + 1, total })}</p>
          <button
            type="button"
            onClick={() => nav(exitTo)}
            className="rounded-full px-4 py-2 text-sm font-semibold underline-offset-4 hover:bg-surface hover:underline"
          >
            {t('wizard.exit')}
          </button>
        </div>
        <h1 className="text-[1.75rem] font-semibold leading-tight sm:text-[2rem]">{title}</h1>
        {lede && <p className="mt-2 text-base text-muted">{lede}</p>}
        <div className="mt-8 space-y-6">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-soft bg-white lg:bottom-0">
        <div
          className="flex gap-1 px-0"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
          aria-label={t('wizard.progress')}
        >
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1 flex-1 ${i <= step ? 'bg-ink' : 'bg-soft'}`} />
          ))}
        </div>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {onBack ? (
            <Button variant="ghost" onClick={onBack} className="-ml-2 underline">
              {t('common.back')}
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="dark"
            size="lg"
            disabled={nextDisabled}
            onClick={onNext}
            icon={<ArrowRight size={18} aria-hidden />}
            className="min-w-0 flex-row-reverse"
          >
            {nextLabel ?? t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-line p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-base text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
