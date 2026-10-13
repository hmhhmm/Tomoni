export type Lang = 'en' | 'ja'
export type Pair = { en: string; ja: string }
export type Role = 'host' | 'tenant' | 'family' | 'coordinator' | null

export type HelpId = 'groceries' | 'garden' | 'cooking' | 'company' | 'walks' | 'parcels'
export type Residence = 'student' | 'resident' | 'limited'
export type CheckinStatus = 'good' | 'notgood' | 'missed' | 'pending'
export type Stage = 'meet' | 'trial' | 'pact' | 'living' | 'ended'

export interface Listing {
  id: string
  hostName: Pair
  hostAge: number
  area: Pair
  areaId: string
  station: Pair
  standardRent: number
  homeshareRent: number
  tier: 'standard' | 'companionship'
  helps: Partial<Record<HelpId, number>>
  languages: string[]
  gender: 'any' | 'women' | 'men'
  pets: boolean
  hue: number
  sizeJo: number
  bio: Pair
}

export interface Applicant {
  id: string
  name: string
  age: number
  country: Pair
  languages: Pair
  occupation: Pair
  verified: boolean
  skills: Pair[]
  availability: Pair
  reasons: Pair[]
  hue: number
  intro: Pair
  residence: Residence
  status: 'new' | 'meeting' | 'declined'
}

export interface Message {
  id: string
  from: 'host' | 'tenant'
  ja: string
  en: string
  origLang: Lang
  when: string
  flag?: 'care' | 'money'
}

export interface Flag {
  id: string
  caseId: string
  kind: 'money' | 'care' | 'report' | 'notgood'
  text: string
  when: string
}

export interface CaseRow {
  id: string
  household: Pair
  tenant: string
  area: Pair
  status: 'healthy' | 'trial' | 'attention' | 'alert'
  week: number
  avgHours: number
  checkins: CheckinStatus[]
  notes: string
}

export interface TaskEntry {
  id: string
  help: HelpId
  hours: number
  day: Pair
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
}
