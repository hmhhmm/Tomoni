export type Lang = 'en' | 'ja'
export type Pair = { en: string; ja: string }
export type Persona = 'host' | 'tenant' | 'family' | null

export type HelpId = 'groceries' | 'garden' | 'cooking' | 'company' | 'walks' | 'parcels'
export type Slot = 'wd-am' | 'wd-pm' | 'wd-eve' | 'we-am' | 'we-pm' | 'we-eve'
export type Help = { h: number; slot: Slot }
export type Helps = Partial<Record<HelpId, Help>>

export type Residence = 'student' | 'resident' | 'limited'
export type LangCode = 'ja' | 'en' | 'ms' | 'vi' | 'tl' | 'hi' | 'zh'
export type LangLevel = 'native' | 'fluent' | 'conversational' | 'basic'
export type SpokenLang = { code: LangCode; level: LangLevel }

export type CheckinStatus = 'good' | 'notgood' | 'missed' | 'pending'
export type Stage = 'none' | 'meet' | 'trial' | 'pact' | 'living' | 'ended'
export type Side = 'host' | 'tenant'

export interface Listing {
  id: string
  hostName: Pair
  hostAge: number
  area: Pair
  areaId: string
  station: Pair
  walkMin: number
  lat: number
  lng: number
  standardRent: number
  homeshareRent: number
  tier: 'standard' | 'companionship'
  helps: Helps
  languages: LangCode[]
  gender: 'any' | 'women' | 'men'
  pets: boolean
  hue: number
  sizeJo: number
  bathroom: 'shared' | 'private'
  furnished: boolean
  availableFrom: string // YYYY-MM
  bio: Pair
  since: number // years living in the house
}

export interface Applicant {
  id: string
  name: string
  age: number
  country: Pair
  occupation: Pair
  residence: Residence
  verified: boolean
  langs: SpokenLang[]
  skills: HelpId[]
  availability: Slot[]
  hue: number
  intro: Pair
  status: 'new' | 'chatting' | 'declined'
  appliedAt: string
}

export interface Message {
  id: string
  from: 'host' | 'tenant'
  ja: string
  en: string
  origLang: Lang
  when: string
  flag?: 'care' | 'money' | 'romance'
  untranslated?: boolean
  /** A system notice in the thread instead of a person's message (rendered from `meetSlot`). */
  event?: 'meet' | 'meetConfirmed'
  meetSlot?: string
}

export interface Flag {
  id: string
  /** null when the flag comes from a conversation before any match. */
  caseId: string | null
  kind: 'money' | 'care' | 'romance' | 'report' | 'notgood'
  text: string
  when: string
  resolved?: boolean
}

export interface CaseRow {
  id: string
  household: Pair
  tenant: string
  area: Pair
  status: 'healthy' | 'trial' | 'review' | 'attention' | 'alert'
  week: number
  avgHours: number
  checkins: CheckinStatus[]
  notes: string
  /** Coordinator time spent on the case so far (illustrative for seeded cases). */
  coordMinutes: number
}

export interface TaskEntry {
  id: string
  help: HelpId
  hours: number
  date: string // ISO date
  status: 'pending' | 'confirmed'
}

export interface ListingDraft {
  photos: string[]
  areaId: string
  sizeJo: number
  bathroom: 'shared' | 'private'
  furnished: boolean
  standardRent: number
  homeshareRent: number
  smoking: 'no' | 'outside'
  pets: boolean
  quiet: string
  guests: 'ask' | 'sometimes' | 'no'
  gender: 'any' | 'women' | 'men'
  published: boolean
}

export interface TenantProfile {
  name: string
  age: number
  langs: SpokenLang[]
  residence: Residence
  skills: HelpId[]
  availability: Slot[]
  otherHours: number
  /** Students only: holds permission to engage in activity outside their status (資格外活動許可). */
  workPermit: boolean
  /** Agreed to the ID check and its data handling. */
  idConsent: boolean
  verifyStep: number // 0 profile, 1 residence, 2 ID, 3 references, 4 done
  idDone: boolean
  refs: string[]
}

export interface Application {
  status: 'sent' | 'chatting' | 'declined' | 'withdrawn'
  sentAt: string
  message: string
}
