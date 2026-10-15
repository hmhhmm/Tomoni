import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { createElement } from 'react'
import { useStore } from '../store'
import type { Persona } from '../data/types'

/** Every housemate (Aisyah) page lives under /aisha/... */
export const AISHA = '/aisha'

/** Pages both host and housemate use; the housemate's copy sits under /aisha. */
const SHARED = ['/messages', '/stay', '/agreement']
const TENANT_ONLY = ['/explore', '/rooms', '/log', '/account', '/pulse']

const matches = (path: string, roots: string[]) => roots.some((r) => path === r || path.startsWith(`${r}/`) || path.startsWith(`${r}?`))

/** The URL for `path` as seen by this persona: the housemate gets /aisha/..., everyone else the plain path. */
export function pathFor(persona: Persona, path: string) {
  if (persona === 'tenant' && matches(path, [...SHARED, ...TENANT_ONLY])) return `${AISHA}${path}`
  return path
}

/** Hook form of pathFor for the current persona. */
export function usePath() {
  const persona = useStore((s) => s.persona)
  return (path: string) => pathFor(persona, path)
}

/** Layout for /aisha/*: opening any of these URLs puts the app in Aisyah's view. */
export function AishaScope() {
  const persona = useStore((s) => s.persona)
  const setPersona = useStore((s) => s.setPersona)
  useEffect(() => {
    if (persona !== 'tenant') setPersona('tenant')
  }, [persona, setPersona])
  return createElement(Outlet)
}

/** Old housemate URLs (/explore, /log, ...) forward to /aisha/..., keeping params and query. */
export function ToAisha() {
  const { pathname, search } = useLocation()
  return createElement(Navigate, { to: `${AISHA}${pathname}${search}`, replace: true })
}
