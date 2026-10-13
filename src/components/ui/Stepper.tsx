import { Minus, Plus } from 'lucide-react'

/** +/- number control with visible value; buttons are 40px circles with labels for screen readers. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  format,
  decLabel,
  incLabel,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number
  label: string
  format?: (n: number) => string
  decLabel: string
  incLabel: string
}) {
  const btn =
    'grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-ink active:scale-95 disabled:opacity-30 disabled:hover:border-line'
  return (
    <div className="inline-flex items-center gap-4" role="group" aria-label={label}>
      <button type="button" className={btn} aria-label={decLabel} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        <Minus size={18} aria-hidden />
      </button>
      <output aria-live="polite" className="min-w-[4.5rem] text-center text-base font-semibold tabular-nums">
        {format ? format(value) : value}
      </output>
      <button type="button" className={btn} aria-label={incLabel} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>
        <Plus size={18} aria-hidden />
      </button>
    </div>
  )
}
