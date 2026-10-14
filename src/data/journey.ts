import type { Stage } from './types'

/** Escalation ladder steps (ladder.s1-s6). "Switch to standard rent" is left out pending a labour lawyer's view. */
export const LADDER = [1, 2, 3, 4, 5, 6] as const

/** Position of each stage in the Meet → Trial → Agreement → Living stepper. */
export const stageIndex = (stage: Stage): number => ({ none: 0, meet: 0, trial: 1, pact: 2, living: 3, ended: 0 })[stage]

function nextWeekday(dow: number, hour: number) {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7 || 7))
  return d
}

/** Meet-up options are always the next real Saturday / Sunday. */
export const MEET_SLOTS = [
  { id: 'sat14', date: () => nextWeekday(6, 14), place: 'house' },
  { id: 'sat15', date: () => nextWeekday(6, 15), place: 'cafe' },
  { id: 'sun11', date: () => nextWeekday(0, 11), place: 'house' },
] as const
