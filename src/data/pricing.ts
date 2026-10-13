import { RULES } from '../tokens'
import type { Helps } from './types'

export const hoursOf = (helps: Helps) => Object.values(helps).reduce((a, v) => a + (v?.h ?? 0), 0)

/** All money maths in one place. Rent figures come from the listing; membership is the platform fee. */
export function costs(standardRent: number, homeshareRent: number, helps: Helps) {
  const weekly = hoursOf(helps)
  const monthlyAllIn = homeshareRent + RULES.membershipYen
  return {
    weeklyHours: weekly,
    monthlyHours: Math.round(weekly * RULES.weeksPerMonth * 10) / 10,
    rentSaving: standardRent - homeshareRent,
    monthlyAllIn,
    netSaving: standardRent - monthlyAllIn,
    yearlyNetSaving: (standardRent - monthlyAllIn) * 12,
    discountPct: Math.round(((standardRent - homeshareRent) / standardRent) * 100),
  }
}

/** Suggested homeshare rent band as a share of the area's standard rent (product rule used by the listing editor). */
export const SUGGESTED_BAND = { min: 0.4, max: 0.65 }
export const suggestedRange = (standard: number) => ({
  min: Math.round((standard * SUGGESTED_BAND.min) / 1000) * 1000,
  max: Math.round((standard * SUGGESTED_BAND.max) / 1000) * 1000,
})
