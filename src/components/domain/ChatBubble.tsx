import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Message, Side } from '../../data/types'

/** One message: leads with the viewer's language, shows the other language beneath with the AI label. */
export function ChatBubble({ msg, viewer }: { msg: Message; viewer: Side }) {
  const { t } = useTranslation()
  const mine = msg.from === viewer
  const lang = viewer === 'host' ? 'ja' : 'en'
  const other = lang === 'ja' ? 'en' : 'ja'
  const lead = msg[lang]
  const trail = msg[other]
  const leadIsOriginal = msg.origLang === lang
  const same = msg.untranslated || lead === trail
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-surface text-ink ring-1 ring-soft'}`}
      >
        <p lang={lead === msg.ja ? 'ja' : 'en'} className="text-base">
          {lead}
        </p>
        {same ? (
          <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${mine ? 'text-white/80' : 'text-muted'}`}>
            <Languages size={13} aria-hidden /> {t('chat.noTranslation')}
          </p>
        ) : (
          <div className={`mt-2 border-t pt-2 ${mine ? 'border-white/25' : 'border-line'}`}>
            <p lang={other} className={`text-sm ${mine ? 'text-white/90' : 'text-ink/80'}`}>
              {trail}
            </p>
            <p className={`mt-1 flex flex-wrap items-center gap-x-1.5 text-xs ${mine ? 'text-white/80' : 'text-muted'}`}>
              <Languages size={13} aria-hidden />
              {leadIsOriginal ? t('chat.sentAs', { lang: t(`lang.${other}`) }) : t('chat.originalIn', { lang: t(`lang.${other}`) })}
              <span aria-hidden>·</span>
              {t('chat.aiLabel')}
            </p>
          </div>
        )}
        <p className={`mt-1 text-right text-xs ${mine ? 'text-white/70' : 'text-muted'}`}>{msg.when}</p>
      </div>
    </div>
  )
}
