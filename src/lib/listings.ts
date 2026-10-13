import { useMemo } from 'react'
import { AREAS, LISTINGS } from '../data/seed'
import { useStore } from '../store'
import type { Listing } from '../data/types'

/** All listings with the host's own (l1) reflecting the editor state. Unpublished listings are hidden. */
export function useListings(): Listing[] {
  const helps = useStore((s) => s.helps)
  const d = useStore((s) => s.draft)
  return useMemo(
    () =>
      LISTINGS.filter((l) => l.id !== 'l1' || d.published).map((l) =>
        l.id === 'l1'
          ? {
              ...l,
              helps,
              standardRent: d.standardRent,
              homeshareRent: d.homeshareRent,
              sizeJo: d.sizeJo,
              areaId: d.areaId,
              area: AREAS.find((a) => a.id === d.areaId) ?? l.area,
              bathroom: d.bathroom,
              furnished: d.furnished,
              pets: d.pets,
              gender: d.gender,
            }
          : l,
      ),
    [helps, d],
  )
}
