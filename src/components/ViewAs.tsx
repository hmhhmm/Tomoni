import { useTranslation } from 'react-i18next'
import { useStore } from '../store'

/** Demo helper: look at the same chat or pact from the other person's phone. */
export function ViewAs() {
  const { t } = useTranslation()
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)
  const options: { id: 'host' | 'tenant'; label: string }[] = [
    { id: 'host', label: t('viewAs.host') },
    { id: 'tenant', label: t('viewAs.tenant') },
  ]
  return (
    <div role="group" aria-label={t('viewAs.label')} className="flex rounded-full bg-purple-50 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={role === o.id}
          onClick={() => setRole(o.id)}
          className={`min-h-12 flex-1 rounded-full px-3 text-base font-semibold transition-colors ${role === o.id ? 'bg-purple-600 text-white shadow-soft' : 'text-purple-700'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
