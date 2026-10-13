import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Applicant, CaseRow, CheckinStatus, Flag, HelpId, Lang, ListingDraft, Message, Role, Stage, TaskEntry,
} from './data/types'
import {
  APPLICANTS, HELP_DEFAULT_HOURS, SEED_CASES, SEED_CHECKINS, SEED_DRAFT, SEED_FLAGS, SEED_MESSAGES, SEED_TASKS,
  SEED_TENANT, STORY_HELPS, TenantProfile,
} from './data/seed'
import { detectGuardrail, translate } from './lib/guardrails'
import { RULES } from './tokens'

export type TextScale = 1 | 1.15 | 1.3

interface Data {
  lang: Lang
  role: Role
  textScale: TextScale
  draft: ListingDraft
  draftStep: number
  helps: Partial<Record<HelpId, number>>
  applicants: Applicant[]
  activeApplicant: string
  applied: boolean
  messages: Record<string, Message[]>
  stage: Stage
  meetSlot: string | null
  trialWeeks: number
  trialDay: number
  pactSigned: { host: boolean; tenant: boolean }
  checkins: { week: number; status: CheckinStatus; note?: string; voice?: boolean }[]
  tasks: TaskEntry[]
  tenant: TenantProfile
  familyConsent: boolean
  pulseDone: boolean
  flags: Flag[]
  cases: CaseRow[]
  caseNotes: Record<string, string>
}

interface Actions {
  setLang: (l: Lang) => void
  setRole: (r: Role) => void
  setTextScale: (s: TextScale) => void
  patchDraft: (p: Partial<ListingDraft>) => void
  setDraftStep: (n: number) => void
  setHelp: (id: HelpId, hours: number | null) => boolean // false if blocked by cap
  setApplicantStatus: (id: string, s: Applicant['status']) => void
  setActive: (id: string) => void
  apply: (intro?: string) => void
  sendMessage: (from: 'host' | 'tenant', text: string) => Message
  setStage: (s: Stage) => void
  setMeetSlot: (s: string | null) => void
  startTrial: (weeks: number) => void
  endTrial: () => void
  sign: (who: 'host' | 'tenant', v?: boolean) => void
  submitCheckin: (status: 'good' | 'notgood', voice: boolean) => void
  logTask: (help: HelpId, hours: number) => void
  confirmTask: (id: string) => void
  patchTenant: (p: Partial<TenantProfile>) => void
  setFamilyConsent: (v: boolean) => void
  setPulseDone: () => void
  addFlag: (f: Omit<Flag, 'id' | 'when'>) => void
  simulateMissed: (caseId: string) => void
  setCaseNote: (id: string, note: string) => void
  resetDemo: () => void
}

export type State = Data & Actions

const nowLabel = () => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
let uid = 0
const id = (p: string) => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`

const seed = (): Data => ({
  lang: 'en',
  role: null,
  textScale: 1,
  draft: { ...SEED_DRAFT },
  draftStep: 0,
  helps: { ...STORY_HELPS },
  applicants: APPLICANTS.map((a) => ({ ...a })),
  activeApplicant: 'a1',
  applied: false,
  messages: JSON.parse(JSON.stringify(SEED_MESSAGES)),
  stage: 'meet',
  meetSlot: null,
  trialWeeks: 3,
  trialDay: 0,
  pactSigned: { host: false, tenant: false },
  checkins: SEED_CHECKINS.map((c) => ({ ...c })),
  tasks: SEED_TASKS.map((t) => ({ ...t })),
  tenant: { ...SEED_TENANT, refs: [...SEED_TENANT.refs] },
  familyConsent: false,
  pulseDone: false,
  flags: [...SEED_FLAGS],
  cases: SEED_CASES.map((c) => ({ ...c, checkins: [...c.checkins] })),
  caseNotes: {},
})

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...seed(),
      setLang: (lang) => set({ lang }),
      setRole: (role) => set({ role }),
      setTextScale: (textScale) => set({ textScale }),
      patchDraft: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
      setDraftStep: (draftStep) => set({ draftStep }),
      setHelp: (hid, hours) => {
        const { helps } = get()
        const next = { ...helps }
        if (hours === null || hours <= 0) delete next[hid]
        else next[hid] = hours
        const total = Object.values(next).reduce((a, b) => a + (b ?? 0), 0)
        if (total > RULES.weeklyHourCap) return false
        set({ helps: next })
        return true
      },
      setApplicantStatus: (aid, status) =>
        set((s) => ({ applicants: s.applicants.map((a) => (a.id === aid ? { ...a, status } : a)) })),
      setActive: (activeApplicant) => set({ activeApplicant }),
      apply: (intro) => {
        const s = get()
        if (s.applied) return
        if ((s.messages.a1 ?? []).some((m) => m.from === 'tenant')) { set({ applied: true }); return }
        const a = APPLICANTS[0]
        const text = intro?.trim()
        const pair = !text || text === a.intro.en ? a.intro : translate(text, 'en')
        const first: Message = { id: id('m'), from: 'tenant', origLang: 'en', en: pair.en, ja: pair.ja, when: nowLabel() }
        set({ applied: true, messages: { ...s.messages, a1: [...(s.messages.a1 ?? []), first] } })
      },
      sendMessage: (from, text) => {
        // Detect the script actually typed, so a host can also write English in the demo.
        const lang: Lang = /[\u3040-\u30ff\u4e00-\u9fff]/.test(text) ? 'ja' : 'en'
        const tr = translate(text, lang)
        const flag = detectGuardrail(text) ?? undefined
        const m: Message = { id: id('m'), from, origLang: lang, ja: tr.ja, en: tr.en, when: nowLabel(), flag }
        const s = get()
        const key = s.activeApplicant
        const a = APPLICANTS.find((x) => x.id === key)!
        const base = s.messages[key] ?? [{ id: id('m'), from: 'tenant' as const, origLang: 'en' as const, ja: a.intro.ja, en: a.intro.en, when: 'Tue 09:05' }]
        set({ messages: { ...s.messages, [key]: [...base, m] } })
        if (flag) get().addFlag({ caseId: 'c1', kind: flag, text: tr.en })
        return m
      },
      setStage: (stage) => set({ stage }),
      setMeetSlot: (meetSlot) => set({ meetSlot }),
      startTrial: (trialWeeks) => set({ stage: 'trial', trialWeeks, trialDay: 3 }),
      endTrial: () => set({ stage: 'ended' }),
      sign: (who, v = true) =>
        set((s) => {
          const pactSigned = { ...s.pactSigned, [who]: v }
          return { pactSigned, stage: pactSigned.host && pactSigned.tenant ? 'living' : s.stage === 'living' ? 'pact' : s.stage }
        }),
      submitCheckin: (status, voice) => {
        set((s) => {
          const list = s.checkins.map((c) => ({ ...c }))
          const i = list.findIndex((c) => c.status === 'pending')
          if (i >= 0) list[i] = { ...list[i], status, voice }
          else list.push({ week: list.length + 1, status, voice })
          return { checkins: list }
        })
        if (status === 'notgood') get().addFlag({ caseId: 'c1', kind: 'notgood', text: 'Weekly check-in: "Something is not right"' })
      },
      logTask: (help, hours) =>
        set((s) => ({
          tasks: [...s.tasks, { id: id('t'), help, hours, day: { en: 'Today', ja: '今日' }, status: 'pending' }],
        })),
      confirmTask: (tid) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === tid ? { ...t, status: 'confirmed' } : t)) })),
      patchTenant: (p) => set((s) => ({ tenant: { ...s.tenant, ...p } })),
      setFamilyConsent: (familyConsent) => set({ familyConsent }),
      setPulseDone: () => set({ pulseDone: true }),
      addFlag: (f) =>
        set((s) => ({ flags: [{ ...f, id: id('f'), when: nowLabel() }, ...s.flags] })),
      simulateMissed: (caseId) => {
        if (caseId === 'c1') {
          set((s) => {
            const list = s.checkins.map((c) => ({ ...c }))
            const pend = list.findIndex((c) => c.status === 'pending')
            if (pend >= 0) list[pend].status = 'missed'
            else list.push({ week: list.length + 1, status: 'missed' })
            return { checkins: list }
          })
        } else {
          set((s) => ({
            cases: s.cases.map((c) => (c.id === caseId ? { ...c, checkins: [...c.checkins, 'missed'] } : c)),
          }))
        }
      },
      setCaseNote: (cid, note) => set((s) => ({ caseNotes: { ...s.caseNotes, [cid]: note } })),
      resetDemo: () => {
        const { lang, role, textScale } = get()
        set({ ...seed(), lang, role, textScale })
      },
    }),
    {
      name: 'tomoni-prototype-v1',
      version: 1,
      partialize: (s) => {
        const { setLang, setRole, setTextScale, patchDraft, setDraftStep, setHelp, setApplicantStatus, setActive, apply, sendMessage, setStage, setMeetSlot, startTrial, endTrial, sign, submitCheckin, logTask, confirmTask, patchTenant, setFamilyConsent, setPulseDone, addFlag, simulateMissed, setCaseNote, resetDemo, ...data } = s
        return data
      },
    },
  ),
)

/** Derived helpers */
export const totalHours = (helps: Partial<Record<HelpId, number>>) =>
  Object.values(helps).reduce((a, b) => a + (b ?? 0), 0)

export const confirmedHours = (tasks: TaskEntry[]) =>
  tasks.filter((t) => t.status === 'confirmed').reduce((a, t) => a + t.hours, 0)

export const missedRun = (list: CheckinStatus[]) => {
  let n = 0
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i] === 'missed') n++
    else if (list[i] === 'pending') continue
    else break
  }
  return n
}

export { HELP_DEFAULT_HOURS }
