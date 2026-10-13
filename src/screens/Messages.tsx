import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Check, HeartHandshake, MessageCircle, Send, ShieldAlert } from 'lucide-react'
import { useStore, tenantKey } from '../store'
import { ChatBubble } from '../components/domain/ChatBubble'
import { Avatar } from '../components/ui/Avatar'
import { Button, LinkButton } from '../components/ui/Button'
import { FictionalTag, VerifiedBadge, EmptyState } from '../components/domain/Bits'
import { Page } from '../components/domain/Bits'
import { PHRASES } from '../lib/guardrails'
import { LISTINGS, APPLICANTS } from '../data/seed'
import { useL } from '../lib/hooks'
import { useUI } from '../ui'
import type { Message, Side } from '../data/types'

const phrasesFor = (...ja: string[]) => ja.map((j) => PHRASES.find((p) => p.ja === j)!)
const QUICK_REPLIES = {
  host: phrasesFor('こんにちは！', 'ありがとうございます。', '日曜日の夕食を一緒に作りましょう。', '今週の土曜日は空いていますか？'),
  tenant: phrasesFor('ありがとうございます。', '日曜日の夕食、私が作ります！', '庭のお手伝いもできます。', '土曜日の午後なら大丈夫です。'),
}

function CareCard() {
  const { t } = useTranslation()
  const say = useUI((s) => s.say)
  const [done, setDone] = useState(false)
  return (
    <div role="status" className="mx-auto w-full max-w-lg rounded-card border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-2 font-semibold text-amber-700">
        <HeartHandshake size={20} aria-hidden /> {t('guard.careTitle')}
      </p>
      <p className="mt-1 text-base">{t('guard.care')}</p>
      <Button
        className="mt-3"
        variant={done ? 'secondary' : 'dark'}
        disabled={done}
        icon={done ? <Check size={18} aria-hidden /> : undefined}
        onClick={() => {
          setDone(true)
          say(t('guard.careToast'))
        }}
      >
        {done ? t('guard.careDone') : t('guard.careBtn')}
      </Button>
    </div>
  )
}

function MoneyCard() {
  const { t } = useTranslation()
  const nav = useNavigate()
  return (
    <div role="alert" className="mx-auto w-full max-w-lg rounded-card border border-rose-200 bg-rose-50 p-4">
      <p className="flex items-center gap-2 font-semibold text-rose-700">
        <ShieldAlert size={20} aria-hidden /> {t('guard.moneyTitle')}
      </p>
      <p className="mt-1 text-base">{t('guard.money')}</p>
      <p className="mt-2 text-sm text-muted">{t('guard.moneyFlag')}</p>
      <Button className="mt-3" variant="secondary" onClick={() => nav('/safety')}>
        {t('guard.talk')}
      </Button>
    </div>
  )
}

export function Messages() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { id } = useParams()
  const { persona, threads, unread, applicants, applications, markRead, sendMessage } = useStore()
  const side: Side = persona === 'host' ? 'host' : 'tenant'

  // Conversations for this persona: [threadKey, routeId, name, hue, verified, last message]
  const convos = useMemo(() => {
    if (side === 'host') {
      return applicants
        .filter((a) => a.status !== 'declined' || (threads[a.id]?.length ?? 0) > 1)
        .map((a) => ({
          key: a.id,
          route: a.id,
          name: a.name,
          sub: text(a.occupation),
          hue: a.hue,
          verified: a.verified,
          last: threads[a.id]?.[threads[a.id].length - 1],
        }))
    }
    return LISTINGS.filter((l) => applications[l.id] && applications[l.id].status !== 'withdrawn').map((l) => ({
      key: tenantKey(l.id),
      route: l.id,
      name: text(l.hostName),
      sub: text(l.area),
      hue: l.hue,
      verified: true,
      last: threads[tenantKey(l.id)]?.[threads[tenantKey(l.id)].length - 1],
    }))
  }, [side, applicants, applications, threads, text])

  const activeRoute = id ?? convos[0]?.route
  const active = convos.find((c) => c.route === activeRoute)
  const key = active?.key ?? ''

  useEffect(() => {
    if (key) markRead(side, key)
  }, [key, side, markRead, threads[key]?.length])

  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const thread: Message[] = threads[key] ?? []
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [thread.length, key])

  const viewerLang = side === 'host' ? 'ja' : 'en'
  const chips = QUICK_REPLIES[side]

  const send = () => {
    if (!draft.trim() || !key) return
    sendMessage(side, key, draft)
    setDraft('')
  }

  if (persona === 'family') {
    return (
      <Page className="py-10">
        <EmptyState icon={<ShieldAlert size={26} aria-hidden />} title={t('chat.familyTitle')} body={t('chat.familyBody')} />
      </Page>
    )
  }
  if (convos.length === 0) {
    return (
      <Page className="py-10">
        <EmptyState
          icon={<MessageCircle size={26} aria-hidden />}
          title={t('chat.emptyTitle')}
          body={t('chat.emptyBody')}
          action={
            <LinkButton to={side === 'host' ? '/host/people' : '/explore'} variant="dark">
              {side === 'host' ? t('nav.people') : t('nav.explore')}
            </LinkButton>
          }
        />
      </Page>
    )
  }

  const showList = !id // on small screens: list first, then thread
  const applicant = applicants.find((a) => a.id === key) ?? APPLICANTS[0]

  return (
    <div className="mx-auto grid h-[calc(100dvh-5rem)] max-w-[1440px] grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10 xl:px-20">
      {/* Conversation list */}
      <aside
        className={`${showList ? 'block' : 'hidden'} min-h-0 min-w-0 overflow-y-auto border-r border-soft lg:block`}
        aria-label={t('chat.inbox')}
      >
        <h1 className="px-5 pb-3 pt-6 text-[1.5rem] font-semibold">{t('nav.messages')}</h1>
        <ul>
          {convos.map((c) => {
            const n = unread[side][c.key] ?? 0
            const on = c.route === activeRoute
            return (
              <li key={c.route}>
                <Link
                  to={`/messages/${c.route}`}
                  aria-current={on ? 'true' : undefined}
                  className={`flex items-center gap-3 border-b border-soft px-5 py-4 hover:bg-surface ${on ? 'bg-surface' : ''}`}
                >
                  <Avatar hue={c.hue} size={48} label={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{c.name}</p>
                      <span className="shrink-0 text-xs text-muted">{c.last?.when}</span>
                    </div>
                    <p className={`truncate text-sm ${n ? 'font-semibold text-ink' : 'text-muted'}`}>
                      {c.last ? c.last[viewerLang] : t('chat.noMessages')}
                    </p>
                  </div>
                  {n > 0 && (
                    <span
                      className="grid h-5 min-w-5 place-items-center rounded-full bg-purple-600 px-1.5 text-xs font-bold text-white"
                      aria-label={t('nav.unread', { n })}
                    >
                      {n}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Thread */}
      <section className={`${showList ? 'hidden' : 'flex'} min-h-0 min-w-0 flex-col lg:flex`} aria-label={t('chat.thread')}>
        {active && (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-soft px-4 py-3 lg:px-6">
              <Link
                to="/messages"
                aria-label={t('common.back')}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface lg:hidden"
              >
                <ArrowLeft size={20} aria-hidden />
              </Link>
              <Avatar hue={active.hue} size={44} label={active.name} />
              <div className="min-w-0 flex-1 basis-40">
                <h2 className="truncate text-base font-semibold leading-tight">{active.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <FictionalTag />
                  {side === 'host' && <VerifiedBadge verified={applicant.verified} />}
                </div>
              </div>
              {side === 'host' && key !== '' && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Calendar size={16} aria-hidden />}
                  onClick={() => {
                    useStore.getState().startMeeting(key)
                    nav('/stay')
                  }}
                >
                  {t('chat.schedule')}
                </Button>
              )}
              {side === 'tenant' && key === 'a1' && (
                <LinkButton to="/stay" size="sm" variant="secondary" icon={<Calendar size={16} aria-hidden />}>
                  {t('chat.viewStay')}
                </LinkButton>
              )}
            </div>
            <p className="bg-purple-50 px-4 py-2 text-sm text-purple-700 lg:px-6">
              {t('chat.banner', { you: t(`lang.${viewerLang}`), them: t(`lang.${viewerLang === 'ja' ? 'en' : 'ja'}`) })}
            </p>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 lg:px-6" aria-live="polite">
              {thread.map((m) => (
                <div key={m.id} className="space-y-3">
                  <ChatBubble msg={m} viewer={side} />
                  {m.flag === 'care' && <CareCard />}
                  {m.flag === 'money' && <MoneyCard />}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="border-t border-soft bg-white px-4 py-3 lg:px-6">
              <div className="scroll-hide -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
                {chips.map((c) => (
                  <button
                    key={c.ja}
                    type="button"
                    onClick={() => setDraft(side === 'host' ? c.ja : c.en)}
                    className="h-10 shrink-0 whitespace-nowrap rounded-full border border-line px-4 text-sm font-medium hover:border-ink"
                  >
                    {side === 'host' ? c.ja : c.en}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex items-center gap-2"
              >
                <label className="sr-only" htmlFor="composer">
                  {t('chat.write')}
                </label>
                <input
                  id="composer"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  lang={viewerLang}
                  autoComplete="off"
                  placeholder={side === 'host' ? t('chat.placeholderHost') : t('chat.placeholderTenant')}
                  className="h-12 min-w-0 flex-1 rounded-full border border-line px-5 text-base outline-none hover:border-ink focus:border-ink focus:ring-1 focus:ring-ink"
                />
                <Button type="submit" variant="dark" disabled={!draft.trim()} icon={<Send size={18} aria-hidden />}>
                  {t('chat.send')}
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted">{t('chat.safetyNote')}</p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
