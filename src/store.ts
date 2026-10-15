import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Application,
  Applicant,
  CaseRow,
  CheckinEntry,
  CheckinStatus,
  CoordMessage,
  ReferralKind,
  SafeguardKey,
  Flag,
  HelpId,
  Helps,
  Lang,
  UiLang,
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
  SEED_COORD_THREAD,
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
import { LADDER } from './data/journey'

interface Match {
  applicantId: string | null
  stage: Stage
  meetSlot: string | null
  /** The housemate confirmed the booked meet-up from the chat. */
  meetConfirmed?: boolean
  trialWeeks: number
  trialStart: string | null // ISO date
}

interface Data {
  lang: UiLang
  persona: Persona
  textLevel: 0 | 1 | 2
  draft: ListingDraft
  helps: Helps
  applicants: Applicant[]
  match: Match
  /** The agreement's own copy of the tasks, so later listing edits never change what was signed. */
  pactHelps: Helps
  /** Tasks the housemate marked "can't do"; they are left out of the agreement. */
  declined: HelpId[]
  pactSigned: { host: boolean; tenant: boolean }
  /** A coordinator reviews the signed agreement before the stay starts. */
  pactApproved: boolean
  checkins: CheckinEntry[]
  /** Cases where the coordinator keeps check-in media as evidence (no 30-day deletion). */
  keepMedia: Record<string, boolean>
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
  /** Escalation ladder step per case: 0 none, 1-6 = ladder.s1-s6. */
  caseStep: Record<string, number>
  /** Coordinator minutes spent per case. */
  caseMinutes: Record<string, number>
  /** Private housemate ↔ coordinator chat for the live case; the host never sees it. */
  coordThread: CoordMessage[]
  /** Unread private messages for each side of that chat. */
  coordUnread: { tenant: number; coord: number }
  /** Who the coordinator informed or referred the case to, and when. */
  referrals: Record<string, { kind: ReferralKind; when: string }[]>
  /** Safeguarding checklist per case (IDEA.md §3.3). */
  safeguards: Record<string, Partial<Record<SafeguardKey, boolean>>>
  /** Cases paused by the coordinator, e.g. a concern about the host's capacity. */
  paused: Record<string, boolean>
}

interface Actions {
  setLang: (l: UiLang) => void
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
  confirmMeet: () => void
  startTrial: (weeks: number) => void
  endTrial: () => void
  resumeTrial: () => void
  goPact: () => void
  setPactHelp: (id: HelpId, v: { h: number; slot: string } | null) => boolean
  toggleDeclined: (id: HelpId) => void
  sign: (who: Side) => void
  approvePact: () => void
  submitCheckin: (status: 'good' | 'notgood', media?: { voiceSecs?: number; photoData?: string; shareFamily?: boolean }) => void
  setKeepMedia: (caseId: string, keep: boolean) => void
  /** Deletes check-in photos and voice notes older than RULES.mediaDays, unless kept as evidence. */
  pruneMedia: () => void
  logTask: (help: HelpId, hours: number) => 'ok' | 'cap' | 'student' | 'paused'
  confirmTask: (id: string) => void
  patchTenant: (p: Partial<TenantProfile>) => void
  setFamilyConsent: (v: boolean) => void
  setPulse: (a: Record<string, string>) => void
  addFlag: (f: Omit<Flag, 'id' | 'when'>) => void
  resolveFlag: (id: string) => void
  setCaseStep: (id: string, step: number) => void
  addCaseMinutes: (id: string, minutes: number) => void
  sendCoord: (from: 'tenant' | 'coord', text: string) => void
  markCoordRead: (side: 'tenant' | 'coord') => void
  addReferral: (caseId: string, kind: ReferralKind) => void
  toggleSafeguard: (caseId: string, key: SafeguardKey) => void
  setPaused: (caseId: string, paused: boolean) => void
  markMissed: (caseId: string) => void
  setCaseNote: (id: string, note: string) => void
  loadScenario: (kind: 'start' | 'living') => void
}

export type State = Data & Actions

/** Tasks both sides agreed to: the agreement's tasks minus any the housemate declined. */
export const agreedHelps = (s: Pick<Data, 'pactHelps' | 'declined'>): Helps =>
  Object.fromEntries(Object.entries(s.pactHelps).filter(([id]) => !s.declined.includes(id as HelpId))) as Helps

/** Rooms with tasks need a status that allows the activity; students also need work permission. */
export const companionOnly = (t: Pick<TenantProfile, 'residence' | 'workPermit'>) =>
  t.residence === 'limited' || (t.residence === 'student' && !t.workPermit)

/** Only the Sato thread (a1) belongs to a live case; other threads are before any match. */
const caseOf = (threadKey: string) => (threadKey === 'a1' ? 'c1' : null)

export const SAFEGUARD_KEYS: SafeguardKey[] = ['metAlone', 'refs', 'homeCheck']
/** All safeguarding checks ticked for a case. */
export const safeguardsDone = (g: Partial<Record<SafeguardKey, boolean>> | undefined) => SAFEGUARD_KEYS.every((k) => g?.[k])

const UNSIGNED = { pactSigned: { host: false, tenant: false }, pactApproved: false }

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
  pactHelps: JSON.parse(JSON.stringify(SATO_HELPS)),
  declined: [],
  pactSigned: { host: false, tenant: false },
  pactApproved: false,
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
  flags: SEED_FLAGS(),
  cases: SEED_CASES.map((c) => ({ ...c, checkins: [...c.checkins] })),
  caseNotes: {},
  caseStep: { c2: 2, c4: 1 },
  caseMinutes: Object.fromEntries(SEED_CASES.map((c) => [c.id, c.coordMinutes])),
  coordThread: SEED_COORD_THREAD.map((m) => ({ ...m })),
  coordUnread: { tenant: 1, coord: 0 },
  referrals: { c2: [{ kind: 'family', when: 'Mon 10:20' }] },
  // Established matches have finished their checks; the new Sato match has not.
  safeguards: Object.fromEntries(SEED_CASES.filter((c) => c.id !== 'c1').map((c) => [c.id, { metAlone: true, refs: true, homeCheck: true }])),
  paused: {},
  keepMedia: {},
})

const living = (): Partial<Data> => ({
  match: { applicantId: 'a1', stage: 'living', meetSlot: 'sat14', trialWeeks: 3, trialStart: daysAgo(17) },
  pactSigned: { host: true, tenant: true },
  pactApproved: true,
  safeguards: {
    ...Object.fromEntries(SEED_CASES.map((c) => [c.id, { metAlone: true, refs: true, homeCheck: true }])),
  },
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
        if (flag) get().addFlag({ caseId: caseOf(key), kind: flag, text: tr.en })
        // First host reply on a new thread moves the applicant to "chatting".
        if (from === 'host') get().setApplicantStatus(key, 'chatting')
        return m
      },

      startMeeting: (applicantId) =>
        set((s) => {
          if (s.match.stage !== 'none' && s.match.applicantId === applicantId) return {}
          // A new match starts a fresh agreement from the listing's current tasks.
          return {
            match: { applicantId, stage: 'meet', meetSlot: null, trialWeeks: 3, trialStart: null },
            pactHelps: JSON.parse(JSON.stringify(s.helps)),
            declined: [],
            ...UNSIGNED,
          }
        }),
      // Booking a meet-up also posts a notice into the chat so both sides see it.
      bookMeet: (meetSlot) =>
        set((s) => {
          const key = s.match.applicantId
          if (!key) return { match: { ...s.match, meetSlot, meetConfirmed: false } }
          const notice: Message = { id: id('m'), from: 'host', origLang: 'ja', ja: '', en: '', when: nowLabel(), event: 'meet', meetSlot }
          return {
            match: { ...s.match, meetSlot, meetConfirmed: false },
            threads: { ...s.threads, [key]: [...(s.threads[key] ?? []), notice] },
            unread: { ...s.unread, tenant: { ...s.unread.tenant, [key]: (s.unread.tenant[key] ?? 0) + 1 } },
          }
        }),
      clearMeet: () => set((s) => ({ match: { ...s.match, meetSlot: null, meetConfirmed: false } })),
      // The housemate confirms from the chat notice; the host sees it in the chat and on Stay.
      confirmMeet: () =>
        set((s) => {
          const key = s.match.applicantId
          if (!key || !s.match.meetSlot || s.match.meetConfirmed) return {}
          const notice: Message = {
            id: id('m'),
            from: 'tenant',
            origLang: 'en',
            ja: '',
            en: '',
            when: nowLabel(),
            event: 'meetConfirmed',
            meetSlot: s.match.meetSlot,
          }
          return {
            match: { ...s.match, meetConfirmed: true },
            threads: { ...s.threads, [key]: [...(s.threads[key] ?? []), notice] },
            unread: { ...s.unread, host: { ...s.unread.host, [key]: (s.unread.host[key] ?? 0) + 1 } },
          }
        }),
      startTrial: (trialWeeks) => set((s) => ({ match: { ...s.match, stage: 'trial', trialWeeks, trialStart: daysAgo(0) } })),
      endTrial: () => set((s) => ({ match: { ...s.match, stage: 'ended' } })),
      resumeTrial: () => set((s) => ({ match: { ...s.match, stage: 'trial' } })),
      goPact: () => set((s) => ({ match: { ...s.match, stage: 'pact' } })),

      // Any change to the tasks clears both signatures, so nobody is held to tasks they did not see.
      setPactHelp: (hid, v) => {
        const s = get()
        if (s.pactApproved) return false
        const next: Helps = { ...s.pactHelps }
        if (!v || v.h <= 0) delete next[hid]
        else next[hid] = { h: v.h, slot: v.slot as never }
        if (hoursOf(agreedHelps({ pactHelps: next, declined: s.declined })) > RULES.weeklyHourCap) return false
        set({ pactHelps: next, declined: s.declined.filter((d) => next[d]), ...UNSIGNED })
        return true
      },
      toggleDeclined: (hid) =>
        set((s) => {
          if (s.pactApproved) return {}
          const declined = s.declined.includes(hid) ? s.declined.filter((d) => d !== hid) : [...s.declined, hid]
          if (hoursOf(agreedHelps({ pactHelps: s.pactHelps, declined })) > RULES.weeklyHourCap) return {}
          return { declined, ...UNSIGNED }
        }),

      sign: (who) => set((s) => (s.match.stage === 'pact' ? { pactSigned: { ...s.pactSigned, [who]: true } } : {})),

      approvePact: () =>
        set((s) =>
          s.match.stage === 'pact' && s.pactSigned.host && s.pactSigned.tenant && safeguardsDone(s.safeguards.c1)
            ? {
                pactApproved: true,
                match: { ...s.match, stage: 'living' },
                checkins: s.checkins.length === 0 ? [{ week: 1, status: 'pending' }] : s.checkins,
              }
            : {},
        ),

      submitCheckin: (status, media = {}) => {
        set((s) => {
          const list = s.checkins.map((c) => ({ ...c }))
          const i = list.findIndex((c) => c.status === 'pending')
          const hasMedia = !!media.voiceSecs || !!media.photoData
          if (i >= 0)
            list[i] = {
              ...list[i],
              status,
              voiceSecs: media.voiceSecs,
              photoData: media.photoData,
              shareFamily: hasMedia && !!media.shareFamily && s.familyConsent,
              at: new Date().toISOString(),
            }
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
        if (s.paused.c1) return 'paused'
        if (inWeek + hours > RULES.weeklyHourCap) return 'cap'
        // Help counts toward a student's 28h/week limit, so block rather than only warn.
        if (s.tenant.residence === 'student' && s.tenant.otherHours + inWeek + hours > RULES.studentWeeklyLimit) return 'student'
        set({ tasks: [...s.tasks, { id: id('t'), help, hours, date: daysAgo(0), status: 'pending' }] })
        return 'ok'
      },
      confirmTask: (tid) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === tid ? { ...t, status: 'confirmed' } : t)) })),
      patchTenant: (p) => set((s) => ({ tenant: { ...s.tenant, ...p } })),
      setFamilyConsent: (familyConsent) => set({ familyConsent }),
      // Pulse answers stay anonymous: a "Not great" raises an alert with no case and no name.
      setPulse: (pulse) => {
        set({ pulse })
        const low = Object.entries(pulse)
          .filter(([, v]) => v === 'notgreat')
          .map(([q]) => q)
        if (low.length) get().addFlag({ caseId: null, kind: 'pulse', text: low.join(',') })
      },
      addFlag: (f) => set((s) => ({ flags: [{ ...f, id: id('f'), when: nowLabel(), at: new Date().toISOString() }, ...s.flags] })),
      resolveFlag: (fid) => set((s) => ({ flags: s.flags.map((f) => (f.id === fid ? { ...f, resolved: true } : f)) })),
      setCaseStep: (cid, step) => set((s) => ({ caseStep: { ...s.caseStep, [cid]: Math.max(0, Math.min(LADDER.length, step)) } })),
      addCaseMinutes: (cid, m) => set((s) => ({ caseMinutes: { ...s.caseMinutes, [cid]: (s.caseMinutes[cid] ?? 0) + m } })),

      // Private channel: a housemate's message is a 24 h item on the desk; the host is never told.
      sendCoord: (from, text) => {
        const v = text.trim()
        if (!v) return
        set((s) => ({
          coordThread: [...s.coordThread, { id: id('cm'), from, text: v, when: nowLabel() }],
          coordUnread:
            from === 'tenant' ? { ...s.coordUnread, coord: s.coordUnread.coord + 1 } : { ...s.coordUnread, tenant: s.coordUnread.tenant + 1 },
        }))
        const live = get().match.applicantId === 'a1' && get().match.stage !== 'none'
        if (from === 'tenant') get().addFlag({ caseId: live ? 'c1' : null, kind: 'private', text: v })
      },
      markCoordRead: (side) => set((s) => (s.coordUnread[side] ? { coordUnread: { ...s.coordUnread, [side]: 0 } } : {})),
      addReferral: (cid, kind) => set((s) => ({ referrals: { ...s.referrals, [cid]: [...(s.referrals[cid] ?? []), { kind, when: nowLabel() }] } })),
      toggleSafeguard: (cid, key) =>
        set((s) => ({ safeguards: { ...s.safeguards, [cid]: { ...s.safeguards[cid], [key]: !s.safeguards[cid]?.[key] } } })),
      setPaused: (cid, p) => set((s) => ({ paused: { ...s.paused, [cid]: p } })),
      setKeepMedia: (cid, keep) => set((s) => ({ keepMedia: { ...s.keepMedia, [cid]: keep } })),
      pruneMedia: () =>
        set((s) => {
          if (s.keepMedia.c1) return {}
          const cutoff = Date.now() - RULES.mediaDays * 86400000
          let changed = false
          const checkins = s.checkins.map((c) => {
            if (!c.at || new Date(c.at).getTime() > cutoff || (!c.photoData && !c.voiceSecs)) return c
            changed = true
            return { ...c, photoData: undefined, voiceSecs: undefined, mediaDeleted: true }
          })
          return changed ? { checkins } : {}
        }),

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
      version: 3,
      // v3 added tenant.workPermit and tenant.idConsent; existing profiles keep their previous behaviour.
      migrate: (persisted) => {
        const p = persisted as Partial<Data>
        if (p.tenant) p.tenant = { ...p.tenant, workPermit: p.tenant.workPermit ?? true, idConsent: p.tenant.idConsent ?? true }
        return p as State
      },
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
