import { Minus, Plus } from 'lucide-react'

/** Large +/- number control with visible text label (no hidden gestures). */
export function Stepper({ value, onChange, min = 0, max = 99, step = 1, label, format, decLabel, incLabel }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; label: string
  format?: (n: number) => string; decLabel: string; incLabel: string
}) {
  const btn = 'grid min-h-12 min-w-12 place-items-center rounded-full border border-line bg-white text-ink transition active:scale-95 disabled:opacity-40'
  return (
    <div className="flex items-center justify-between gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} aria-label={decLabel} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        <Minus size={22} aria-hidden />
      </button>
      <output aria-live="polite" className="min-w-[6rem] text-center font-heading text-xl font-semibold">{format ? format(value) : value}</output>
      <button type="button" className={btn} aria-label={incLabel} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>
        <Plus size={22} aria-hidden />
      </button>
    </div>
  )
}

export function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-card border border-line bg-white p-4 shadow-soft">
      <legend className="px-1 font-heading text-lg font-semibold">{legend}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  )
}
