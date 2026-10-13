import { Check } from 'lucide-react'

/** Labelled journey stepper: Meet → Trial stay → Agreement → Living together. */
export function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start" aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            {i > 0 && <span aria-hidden className={`absolute left-[-50%] top-[15px] h-0.5 w-full ${i <= current ? 'bg-ink' : 'bg-soft'}`} />}
            <span
              className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-semibold ${
                done ? 'border-ink bg-ink text-white' : active ? 'border-ink bg-white text-ink' : 'border-soft bg-white text-muted'
              }`}
            >
              {done ? <Check size={16} aria-hidden /> : i + 1}
            </span>
            <span className={`mt-2 text-sm leading-tight ${active ? 'font-semibold' : 'text-muted'}`}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}
