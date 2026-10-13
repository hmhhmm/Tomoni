import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Application,
  Applicant,
  CaseRow,
  CheckinStatus,
  Flag,
  HelpId,
  Helps,
  Lang,
  ListingDraft,
  Message,
  Persona,
  Side,
  Stage,
  TaskEntry,
  TenantProfile,
} from './data/types'
import {
  APPLICANTS,
  HOST_REPLIES,
  SATO_HELPS,
  SEED_CASES,
  SEED_DRAFT,
  SEED_FLAGS,
  SEED_MESSAGES,
  SEED_TENANT,
  daysAgo,
  livingCheckins,
  livingTasks,
} from './data/seed'
import { detectGuardrail, translate } from './lib/guardrails'
import { hoursOf } from './data/pricing'
import { RULES } from './tokens'

interface Match {
  applicantId: string | null
  stage: Stage
  meetSlot: string | null
  trialWeeks: number
  trialStart: string | null // ISO date
}

interface Data {
  lang: Lang
  persona: Persona
  textLevel: 0 | 1 | 2
  draft: ListingDraft
  helps: Helps
  applicants: Applicant[]
  match: Match
  pactSigned: { host: boolean; tenant: boolean }
  checkins: { week: number; status: CheckinStatus; voice?: boolean }[]
  tasks: TaskEntry[]
  tenant: TenantProfile
  saved: string[]
  applications: Record<string, Application>
  threads: Record<string, Message[]>
  unread: { host: Record<string, number>; tenant: Record<string, number> }
  familyConsent: boolean
  pulse: Record<string, string> | null
  flags: Flag[]
  cases: CaseRow[]
  caseNotes: Record<string, string>
}

interface Actions {
  setLang: (l: Lang) => void
  setPersona: (p: Persona) => void
  setTextLevel: (n: 0 | 1 | 2) => void
  patchDraft: (p: Partial<ListingDraft>) => void
  setHelp: (id: HelpId, v: { h: number; slot: string } | null) => boolean
  toggleSaved: (id: string) => void
  apply: (listingId: string, message: string) => void
  withdraw: (listingId: string) => void
  setApplicantStatus: (id: string, s: Applicant['status']) => void
  markRead: (side: Side, key: string) => void
  sendMessage: (from: Side, key: string, text: string) => Message | null
  startMeeting: (applicantId: string) => void
  bookMeet: (slot: string) => void
  clearMeet: () => void
  startTrial: (weeks: number) => void
  endTrial: () => void
  resumeTrial: () => void
  goPact: () => void
  sign: (who: Side) => void
  submitCheckin: (status: 'good' | 'notgood', voice: boolean) => void
  logTask: (help: HelpId, hours: number) => boolean
  confirmTask: (id: string) => void
  patchTenant: (p: Partial<TenantProfile>) => void
  setFamilyConsent: (v: boolean) => void
  setPulse: (a: Record<string, string>) => void
  addFlag: (f: Omit<Flag, 'id' | 'when'>) => void
  markMissed: (caseId: string) => void
  setCaseNote: (id: string, note: string) => void
  loadScenario: (kind: 'start' | 'living') => void
}

export type State = Data & Actions

const nowLabel = () => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
let uid = 0
const id = (p: string) => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`

/** Thread keys: host side uses the applicant id; tenant side uses the listing id (l1 is the same thread as a1). */
export const tenantKey = (listingId: string) => (listingId === 'l1' ? 'a1' : listingId)

const base = (): Data => ({
  lang: 'en',
  persona: null,
  textLevel: 0,
  draft: { ...SEED_DRAFT, photos: [...SEED_DRAFT.photos] },
  helps: JSON.parse(JSON.stringify(SATO_HELPS)),
  applicants: APPLICANTS.map((a) => ({ ...a })),
  match: { applicantId: null, stage: 'none', meetSlot: null, trialWeeks: 3, trialStart: null },
  pactSigned: { host: false, tenant: false },
  checkins: [],
  tasks: [],
  tenant: {
    ...SEED_TENANT,
    langs: [...SEED_TENANT.langs],
    skills: [...SEED_TENANT.skills],
    availability: [...SEED_TENANT.availability],
    refs: [...SEED_TENANT.refs],
  },
  saved: ['l3'],
  applications: { l1: { status: 'chatting', sentAt: daysAgo(8), message: APPLICANTS[0].intro.en } },
  threads: JSON.parse(JSON.stringify(SEED_MESSAGES)),
  unread: { host: { a2: 1, a3: 1, a4: 1, a5: 1 }, tenant: {} },
  familyConsent: false,
  pulse: null,
  flags: [...SEED_FLAGS],
  cases: SEED_CASES.map((c) => ({ ...c, checkins: [...c.checkins] })),
  caseNotes: {},
})

const living = (): Partial<Data> => ({
  match: { applicantId: 'a1', stage: 'living', meetSlot: 'sat14', trialWeeks: 3, trialStart: daysAgo(17) },
  pactSigned: { host: true, tenant: true },
  checkins: livingCheckins(),
  tasks: livingTasks(),
  familyConsent: true,
})

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...base(),
      setLang: (lang) => set({ lang }),
      setPersona: (persona) => set({ persona }),
      setTextLevel: (textLevel) => set({ textLevel }),
      patchDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),

      setHelp: (hid, v) => {
        const next: Helps = { ...get().helps }
        if (!v || v.h <= 0) delete next[hid]
        else next[hid] = { h: v.h, slot: v.slot as never }
        if (hoursOf(next) > RULES.weeklyHourCap) return false
        set({ helps: next })
        return true
      },

      toggleSaved: (lid) => set((s) => ({ saved: s.saved.includes(lid) ? s.saved.filter((x) => x !== lid) : [...s.saved, lid] })),

      apply: (listingId, message) => {
        const s = get()
        if (s.applications[listingId] && s.applications[listingId].status !== 'withdrawn') return
        const key = tenantKey(listingId)
        const tr = translate(message, 'en')
        const first: Message = {
          id: id('m'),
          from: 'tenant',
          origLang: 'en',
          en: tr.en,
          ja: tr.exact ? tr.ja : tr.en,
          when: nowLabel(),
          untranslated: !tr.exact,
        }
        // For the Sato listing the intro text is the applicant's own prepared intro; keep both languages.
        if (listingId === 'l1' && message.trim() === APPLICANTS[0].intro.en) {
          first.ja = APPLICANTS[0].intro.ja
          first.untranslated = false
        }
        set({
          applications: { ...s.applications, [listingId]: { status: 'sent', sentAt: daysAgo(0), message } },
          threads: { ...s.threads, [key]: [...(s.threads[key] ?? []), first] },
          unread: listingId === 'l1' ? { ...s.unread, host: { ...s.unread.host, a1: (s.unread.host.a1 ?? 0) + 1 } } : s.unread,
          applicants: listingId === 'l1' ? s.applicants.map((a) => (a.id === 'a1' ? { ...a, status: 'new' as const } : a)) : s.applicants,
        })
        if (listingId !== 'l1') {
          const reply = HOST_REPLIES[Math.floor(Math.random() * HOST_REPLIES.length)]
          setTimeout(() => {
            const cur = get()
            const m: Message = { id: id('m'), from: 'host', origLang: 'ja', ja: reply.ja, en: reply.en, when: nowLabel() }
            set({
              threads: { ...cur.threads, [key]: [...(cur.threads[key] ?? []), m] },
              unread: { ...cur.unread, tenant: { ...cur.unread.tenant, [key]: (cur.unread.tenant[key] ?? 0) + 1 } },
              applications: { ...cur.applications, [listingId]: { ...cur.applications[listingId], status: 'chatting' } },
            })
          }, 2600)
        }
      },

      withdraw: (listingId) =>
        set((s) => ({ applications: { ...s.applications, [listingId]: { ...s.applications[listingId], status: 'withdrawn' } } })),

      setApplicantStatus: (aid, status) =>
        set((s) => ({
          applicants: s.applicants.map((a) => (a.id === aid ? { ...a, status } : a)),
          applications:
            aid === 'a1' && s.applications.l1
              ? {
                  ...s.applications,
                  l1: {
                    ...s.applications.l1,
                    status: status === 'declined' ? 'declined' : status === 'chatting' ? 'chatting' : s.applications.l1.status,
                  },
                }
              : s.applications,
        })),

      markRead: (side, key) => set((s) => (s.unread[side][key] ? { unread: { ...s.unread, [side]: { ...s.unread[side], [key]: 0 } } } : {})),

      sendMessage: (from, key, text) => {
        const v = text.trim()
        if (!v) return null
        const lang: Lang = /[぀-ヿ一-鿿]/.test(v) ? 'ja' : 'en'
        const tr = translate(v, lang)
        const flag = detectGuardrail(v) ?? undefined
        const m: Message = { id: id('m'), from, origLang: lang, ja: tr.ja, en: tr.en, when: nowLabel(), flag, untranslated: !tr.exact }
        const s = get()
        const other: Side = from === 'host' ? 'tenant' : 'host'
        set({
          threads: { ...s.threads, [key]: [...(s.threads[key] ?? []), m] },
          unread: { ...s.unread, [other]: { ...s.unread[other], [key]: (s.unread[other][key] ?? 0) + 1 } },
        })
        if (flag) get().addFlag({ caseId: 'c1', kind: flag, text: tr.en })
        // First host reply on a new thread moves the applicant to "chatting".
        if (from === 'host') get().setApplicantStatus(key, 'chatting')
        return m
      },

      startMeeting: (applicantId) =>
        set((s) => ({
          match:
            s.match.stage === 'none' || s.match.applicantId !== applicantId
              ? { applicantId, stage: 'meet', meetSlot: null, trialWeeks: 3, trialStart: null }
              : s.match,
        })),
      bookMeet: (meetSlot) => set((s) => ({ match: { ...s.match, meetSlot } })),
      clearMeet: () => set((s) => ({ match: { ...s.match, meetSlot: null } })),
      startTrial: (trialWeeks) => set((s) => ({ match: { ...s.match, stage: 'trial', trialWeeks, trialStart: daysAgo(0) } })),
      endTrial: () => set((s) => ({ match: { ...s.match, stage: 'ended' } })),
      resumeTrial: () => set((s) => ({ match: { ...s.match, stage: 'trial' } })),
      goPact: () => set((s) => ({ match: { ...s.match, stage: 'pact' } })),

      sign: (who) =>
        set((s) => {
          const pactSigned = { ...s.pactSigned, [who]: true }
          const both = pactSigned.host && pactSigned.tenant
          return {
            pactSigned,
            match: both ? { ...s.match, stage: 'living' } : s.match,
            checkins: both && s.checkins.length === 0 ? [{ week: 1, status: 'pending' }] : s.checkins,
          }
        }),

      submitCheckin: (status, voice) => {
        set((s) => {
          const list = s.checkins.map((c) => ({ ...c }))
          const i = list.findIndex((c) => c.status === 'pending')
          if (i >= 0) list[i] = { ...list[i], status, voice }
          return { checkins: list }
        })
        if (status === 'notgood') get().addFlag({ caseId: 'c1', kind: 'notgood', text: 'Weekly check-in: something is not right' })
      },

      logTask: (help, hours) => {
        const s = get()
        const weekStart = new Date()
        weekStart.setHours(0, 0, 0, 0)
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
        const inWeek = s.tasks.filter((t) => new Date(t.date) >= weekStart).reduce((a, t) => a + t.hours, 0)
        if (inWeek + hours > RULES.weeklyHourCap) return false
        set({ tasks: [...s.tasks, { id: id('t'), help, hours, date: daysAgo(0), status: 'pending' }] })
        return true
      },
      confirmTask: (tid) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === tid ? { ...t, status: 'confirmed' } : t)) })),
      patchTenant: (p) => set((s) => ({ tenant: { ...s.tenant, ...p } })),
      setFamilyConsent: (familyConsent) => set({ familyConsent }),
      setPulse: (pulse) => set({ pulse }),
      addFlag: (f) => set((s) => ({ flags: [{ ...f, id: id('f'), when: nowLabel() }, ...s.flags] })),

      markMissed: (caseId) => {
        if (caseId === 'c1') {
          set((s) => {
            const list = s.checkins.map((c) => ({ ...c }))
            const pend = list.findIndex((c) => c.status === 'pending')
            if (pend >= 0) list[pend].status = 'missed'
            else list.push({ week: list.length + 1, status: 'missed' })
            return { checkins: list }
          })
        } else {
          set((s) => ({ cases: s.cases.map((c) => (c.id === caseId ? { ...c, checkins: [...c.checkins, 'missed' as CheckinStatus] } : c)) }))
        }
      },
      setCaseNote: (cid, note) => set((s) => ({ caseNotes: { ...s.caseNotes, [cid]: note } })),

      loadScenario: (kind) => {
        const { lang, persona, textLevel } = get()
        set({ ...base(), ...(kind === 'living' ? living() : {}), lang, persona, textLevel })
      },
    }),
    {
      name: 'tomoni-v2',
      version: 2,
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) as never,
    },
  ),
)

/** Derived helpers */
export const startOfWeek = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}
export const weekHours = (tasks: TaskEntry[], confirmedOnly = true) =>
  tasks.filter((t) => new Date(t.date) >= startOfWeek() && (!confirmedOnly || t.status === 'confirmed')).reduce((a, t) => a + t.hours, 0)

export const missedRun = (list: CheckinStatus[]) => {
  let n = 0
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i] === 'missed') n++
    else if (list[i] === 'pending') continue
    else break
  }
  return n
}

export const trialDay = (m: Match) =>
  m.trialStart ? Math.min(m.trialWeeks * 7, Math.floor((Date.now() - new Date(m.trialStart).getTime()) / 86400000) + 1) : 0
