import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

/** `progress`: slim bar for wizards. `stepper`: labelled dots for the journey (Meet → Trial → Pact → Living). */
export function StepBar({ steps, current, variant = 'stepper' }: { steps: string[]; current: number; variant?: 'stepper' | 'progress' }) {
  if (variant === 'progress') {
    return (
      <div role="progressbar" aria-label={steps.join(" / ")} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current + 1} aria-valuetext={steps[current]}>
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="h-2.5 flex-1 overflow-hidden rounded-full bg-purple-100">
              <motion.div className="h-full bg-purple-600" initial={false} animate={{ width: i <= current ? '100%' : '0%' }} transition={{ duration: 0.25 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <ol className="flex items-start justify-between" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            {i > 0 && <span aria-hidden className={`absolute left-[-50%] top-5 h-0.5 w-full ${i <= current ? 'bg-purple-600' : 'bg-line'}`} />}
            <span
              className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-base font-semibold ${
                done ? 'border-teal-700 bg-teal-700 text-white' : active ? 'border-purple-600 bg-purple-600 text-white' : 'border-line bg-white text-muted'
              }`}
            >
              {done ? <Check size={20} aria-hidden /> : i + 1}
            </span>
            <span className={`mt-1.5 text-sm leading-tight ${active ? 'font-semibold text-ink' : 'text-muted'}`}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}
