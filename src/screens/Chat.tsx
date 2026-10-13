import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HeartHandshake, Send, ShieldAlert, Calendar, Check } from 'lucide-react'
import { useStore } from '../store'
import { ChatBubble } from '../components/ChatBubble'
import { ViewAs } from '../components/ViewAs'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { FictionalTag, VerifiedBadge, ConceptFooter } from '../components/Misc'
import { ChoiceChip } from '../components/Chip'
import { PHRASES } from '../lib/guardrails'
import { useUI } from '../ui'
import { APPLICANTS } from '../data/seed'
import type { Message } from '../data/types'

const HOST_CHIPS = ['こんにちは！', '日曜日の夕食を一緒に作りましょう。', '今週の土曜日は空いていますか？']
const TENANT_CHIPS = ['Thank you.', 'I will cook Sunday dinner!', 'I can help with the garden too.']

function CareCard() {
  const { t } = useTranslation()
  const say = useUI((s) => s.say)
  const [done, setDone] = useState(false)
  return (
    <div role="status" className="mx-auto w-full rounded-card border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-2 font-heading text-base font-semibold text-amber-700"><HeartHandshake size={20} aria-hidden /> {t('guard.careTitle')}</p>
      <p className="mt-1 text-base">{t('guard.care')}</p>
      <Button className="mt-3" variant={done ? 'secondary' : 'primary'} disabled={done} icon={done ? <Check size={18} aria-hidden /> : undefined}
        onClick={() => { setDone(true); say(t('guard.careToast')) }}>
        {done ? t('guard.careDone') : t('guard.careBtn')}
      </Button>
    </div>
  )
}

function MoneyCard() {
  const { t } = useTranslation()
  const nav = useNavigate()
  return (
    <div role="alert" className="mx-auto w-full rounded-card border border-rose-200 bg-rose-50 p-4">
      <p className="flex items-center gap-2 font-heading text-base font-semibold text-rose-700"><ShieldAlert size={20} aria-hidden /> {t('guard.moneyTitle')}</p>
      <p className="mt-1 text-base">{t('guard.money')}</p>
      <p className="mt-2 text-sm text-muted">{t('guard.moneyFlag')}</p>
      <Button className="mt-3" variant="secondary" onClick={() => nav('/safety')}>{t('guard.talk')}</Button>
    </div>
  )
}

export function Chat() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { role, lang, activeApplicant, applicants, messages, sendMessage, setActive, stage, setStage } = useStore()
  const viewer: 'host' | 'tenant' = role === 'tenant' ? 'tenant' : 'host'
  const key = viewer === 'tenant' ? 'a1' : activeApplicant
  const applicant = applicants.find((a) => a.id === key) ?? applicants[0]
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (viewer === 'tenant' && activeApplicant !== 'a1') setActive('a1') }, [viewer, activeApplicant, setActive])

  useEffect(() => {
    const say = params.get('say')
    if (say === 'care') setText(lang === 'ja' ? 'お風呂を手伝ってくれますか？' : 'Can you help me bathe?')
    if (say === 'money') setText(lang === 'ja' ? '銀行のカードと暗証番号を預かってください。誰にも内緒でお願いします。' : "Please keep my bank card and PIN. Don't tell anyone.")
  }, [params, lang])

  const thread: Message[] = useMemo(() => {
    const m = messages[key]
    if (m) return m
    const a = APPLICANTS.find((x) => x.id === key)!
    return [{ id: 'intro', from: 'tenant', origLang: 'en', ja: a.intro.ja, en: a.intro.en, when: '—' }]
  }, [messages, key])

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [thread.length])

  const send = () => {
    const v = text.trim()
    if (!v) return
    sendMessage(viewer, v)
    setText('')
  }

  const chips = viewer === 'host' ? HOST_CHIPS : TENANT_CHIPS
  const care = PHRASES.find((p) => p.ja.startsWith('お風呂'))!
  const money = PHRASES.find((p) => p.ja.startsWith('銀行'))!
  const sayLang = viewer === 'host' ? 'ja' : 'en'
  const otherName = viewer === 'host' ? applicant.name : t('names.sato')
  const otherHue = viewer === 'host' ? applicant.hue : 262

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-3 border-b border-line bg-white px-4 pb-3 pt-3">
        <ViewAs />
        <div className="flex items-center gap-3">
          <Avatar hue={otherHue} size={52} label={otherName} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-xl font-semibold leading-tight">{otherName}</h1>
            <div className="mt-1 flex flex-wrap gap-1.5"><FictionalTag />{viewer === 'host' && <VerifiedBadge verified={applicant.verified} />}</div>
          </div>
        </div>
        <p className="rounded-2xl bg-purple-50 px-3 py-2 text-sm text-purple-700">{t('chat.banner', { you: viewer === 'host' ? t('lang.ja') : t('lang.en'), them: viewer === 'host' ? t('lang.en') : t('lang.ja') })}</p>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4" aria-live="polite" aria-label={t('chat.thread')}>
        {thread.map((m) => (
          <div key={m.id} className="space-y-3">
            <ChatBubble msg={m} viewer={viewer} />
            {m.flag === 'care' && <CareCard />}
            {m.flag === 'money' && <MoneyCard />}
          </div>
        ))}
        {viewer === 'host' && thread.some((m) => m.from === 'host') && stage === 'meet' && (
          <Button variant="soft" icon={<Calendar size={20} aria-hidden />} onClick={() => nav('/trial')}>{t('chat.schedule')}</Button>
        )}
        {viewer === 'tenant' && stage === 'meet' && thread.length > 3 && (
          <Button variant="soft" icon={<Calendar size={20} aria-hidden />} onClick={() => { setStage('meet'); nav('/trial') }}>{t('chat.schedule')}</Button>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 border-t border-line bg-white px-4 pb-3 pt-3">
                <div className="scroll-hide -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
          {chips.map((c) => (
            <ChoiceChip key={c} selected={false} onClick={() => setText(c)} className="shrink-0 whitespace-nowrap">{c}</ChoiceChip>
          ))}
          <ChoiceChip selected={false} onClick={() => setText(care[sayLang === 'ja' && lang === 'ja' ? 'ja' : 'en'])} className="shrink-0 whitespace-nowrap !border-amber-200 !bg-amber-50 !text-amber-700">{t('chat.tryCare')}</ChoiceChip>
          <ChoiceChip selected={false} onClick={() => setText(money[lang === 'ja' ? 'ja' : 'en'])} className="shrink-0 whitespace-nowrap !border-rose-200 !bg-rose-50 !text-rose-700">{t('chat.tryMoney')}</ChoiceChip>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-end gap-2">
          <label className="sr-only" htmlFor="composer">{t('chat.write')}</label>
          <input
            id="composer" value={text} onChange={(e) => setText(e.target.value)} lang={sayLang}
            placeholder={viewer === 'host' ? t('chat.placeholderHost') : t('chat.placeholderTenant')}
            className="min-h-12 w-full min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-base outline-none focus:border-purple-600"
          />
          <Button type="submit" block={false} icon={<Send size={20} aria-hidden />} aria-label={t('chat.send')}>{t('chat.send')}</Button>
        </form>
      </div>
      <div className="px-4 pb-4"><ConceptFooter /></div>
    </div>
  )
}
