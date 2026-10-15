import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { RULES } from '../../tokens'

/**
 * Weekly hour meter. `bar` shows one segment per hour; `ring` is compact.
 * Always exposed as role="meter" with text value (never colour alone).
 */
export function HourMeter({
  value,
  max = RULES.weeklyHourCap,
  variant = 'bar',
  size = 112,
  label,
  compact = false,
  shake = false,
}: {
  value: number
  max?: number
  variant?: 'bar' | 'ring'
  size?: number
  label?: string
  compact?: boolean
  shake?: boolean
}) {
  const { t } = useTranslation()
  const full = value >= max
  const text = t('meter.of', { x: value, max })
  const aria = label ?? t('meter.label')

  if (variant === 'ring') {
    const r = size / 2 - 9
    const c = 2 * Math.PI * r
    const pct = Math.min(1, value / max)
    return (
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={aria}
        aria-valuetext={text}
        className="relative inline-grid place-items-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EBEBEB" strokeWidth="10" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={full ? '#0B7A6B' : '#E31C5F'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={false}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.4 }}
          />
        </svg>
        <div className="absolute text-center leading-tight">
          <div className="font-heading text-2xl font-semibold tabular-nums">{value}</div>
          <div className="text-xs text-muted">{t('meter.ofShort', { max })}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={shake ? 'animate-shake' : ''}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{aria}</span>
        <span className={`text-base font-semibold tabular-nums ${full ? 'text-teal-700' : 'text-ink'}`}>{text}</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={aria}
        aria-valuetext={text}
        className={`flex gap-1 ${compact ? 'h-2' : 'h-3'}`}
      >
        {Array.from({ length: max }).map((_, i) => (
          <motion.div
            key={i}
            className="h-full flex-1 rounded-full"
            initial={false}
            animate={{ backgroundColor: i < value ? (full ? '#14A592' : '#E31C5F') : '#EBEBEB' }}
            transition={{ duration: 0.2, delay: i < value ? i * 0.015 : 0 }}
          />
        ))}
      </div>
    </div>
  )
}
