import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Message } from '../data/types'

/**
 * One message showing the original text and its AI translation.
 * `viewer` decides which side is "mine" and which language leads.
 */
export function ChatBubble({ msg, viewer }: { msg: Message; viewer: 'host' | 'tenant' }) {
  const { t } = useTranslation()
  const mine = msg.from === viewer
  const lang = viewer === 'host' ? 'ja' : 'en'
  const other = lang === 'ja' ? 'en' : 'ja'
  const lead = msg[lang]
  const trail = msg[other]
  // For my own messages I wrote the original; for theirs, the original is in the other language.
  const leadIsOriginal = msg.origLang === lang
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-soft ${
          mine ? 'rounded-br-lg bg-purple-600 text-white' : 'rounded-bl-lg border border-line bg-white text-ink'
        }`}
      >
        <p lang={lang} className="text-base font-medium">{lead}</p>
        <div className={`mt-2 border-t pt-2 ${mine ? 'border-white/40' : 'border-line'}`}>
          <p lang={other} className={`text-sm ${mine ? 'text-white' : 'text-ink'}`}>{trail}</p>
          <p className={`mt-1 flex items-center gap-1.5 text-xs ${mine ? 'text-white' : 'text-muted'}`}>
            <Languages size={14} aria-hidden />
            {leadIsOriginal ? t('chat.sentAs', { lang: t(`lang.${other}`) }) : t('chat.originalIn', { lang: t(`lang.${other}`) })}
            {' · '}{t('chat.aiLabel')}
          </p>
        </div>
        <p className={`mt-1 text-right text-xs ${mine ? 'text-white' : 'text-muted'}`}>{msg.when}</p>
      </div>
    </div>
  )
}
