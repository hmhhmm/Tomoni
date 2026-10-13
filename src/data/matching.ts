import type { Helps, HelpId, LangCode, LangLevel, Slot, SpokenLang } from './types'

export const SLOTS: Slot[] = ['wd-am', 'wd-pm', 'wd-eve', 'we-am', 'we-pm', 'we-eve']

export const LEVEL_WEIGHT: Record<LangLevel, number> = { native: 1, fluent: 1, conversational: 0.85, basic: 0.5 }

interface Candidate {
  skills: HelpId[]
  availability: Slot[]
  langs: SpokenLang[]
  verified: boolean
}
interface Home {
  helps: Helps
  languages: LangCode[]
}

export interface Fit {
  score: number
  skills: { covered: number; total: number }
  slots: { covered: number; total: number }
  hours: { covered: number; total: number }
  language: { best: SpokenLang | null; shared: boolean; weight: number }
  verified: boolean
}

/**
 * Transparent matching score (0-100) between a candidate and a home.
 *   40  tasks the candidate can do, weighted by weekly hours
 *   25  help time-slots the candidate is free for, weighted by weekly hours
 *   20  ability to talk with the host (shared language, or Japanese level; translation covers gaps)
 *   15  ID verified
 * The host always decides; the score only orders the list.
 */
export function fit(c: Candidate, home: Home): Fit {
  const entries = Object.entries(home.helps) as [HelpId, { h: number; slot: Slot }][]
  const totalH = entries.reduce((a, [, v]) => a + v.h, 0)
  const skillH = entries.filter(([id]) => c.skills.includes(id)).reduce((a, [, v]) => a + v.h, 0)
  const slotH = entries.filter(([, v]) => c.availability.includes(v.slot)).reduce((a, [, v]) => a + v.h, 0)

  const hostCodes = home.languages
  const shared = c.langs.filter((l) => hostCodes.includes(l.code))
  const best = shared.sort((a, b) => LEVEL_WEIGHT[b.level] - LEVEL_WEIGHT[a.level])[0] ?? null
  const langWeight = best ? LEVEL_WEIGHT[best.level] : 0.3

  const skillScore = totalH ? skillH / totalH : 1
  const slotScore = totalH ? slotH / totalH : 1
  const score = Math.round(40 * skillScore + 25 * slotScore + 20 * langWeight + 15 * (c.verified ? 1 : 0.4))

  return {
    score,
    skills: { covered: entries.filter(([id]) => c.skills.includes(id)).length, total: entries.length },
    slots: { covered: entries.filter(([, v]) => c.availability.includes(v.slot)).length, total: entries.length },
    hours: { covered: slotH, total: totalH },
    language: { best, shared: !!best, weight: langWeight },
    verified: c.verified,
  }
}
