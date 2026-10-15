import type { Flag } from '../data/types'

/**
 * Response deadlines from IDEA.md §3.3: safety issues within 24 hours, anything else within
 * 5 working days. Working days skip Saturday and Sunday (public holidays are not counted here).
 */
// A private message to the coordinator may be about exploitation, so it is treated as safety.
const SAFETY: Flag['kind'][] = ['money', 'care', 'romance', 'report', 'notgood', 'private']

export const isSafety = (kind: Flag['kind']) => SAFETY.includes(kind)

export function dueAt(f: Pick<Flag, 'kind' | 'at'>): Date | null {
  if (!f.at) return null
  const d = new Date(f.at)
  if (isSafety(f.kind)) return new Date(d.getTime() + 24 * 3600_000)
  let left = 5
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) left--
  }
  return d
}

/** Hours until due (negative when overdue), rounded toward the more urgent side. */
export function hoursLeft(f: Pick<Flag, 'kind' | 'at'>, now = Date.now()): number | null {
  const due = dueAt(f)
  return due ? Math.floor((due.getTime() - now) / 3600_000) : null
}
