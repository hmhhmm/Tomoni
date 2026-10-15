import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { createElement } from 'react'
import { useStore } from '../store'
import type { Persona } from '../data/types'

/** Every housemate (Aisyah) page lives under /aisha/..., every host (Mrs Sato) page under /saito/... */
export const AISHA = '/aisha'
export const SAITO = '/saito'

/** Pages both host and housemate use; each persona's copy sits under its own prefix. */
const SHARED = ['/messages', '/stay', '/agreement']
const TENANT_ONLY = ['/explore', '/rooms', '/log', '/account', '/pulse']

const matches = (path: string, roots: string[]) => roots.some((r) => path === r || path.startsWith(`${r}/`) || path.startsWith(`${r}?`))

/** The URL for `path` as seen by this persona. */
export function pathFor(persona: Persona, path: string) {
  if (persona === 'tenant' && matches(path, [...SHARED, ...TENANT_ONLY])) return `${AISHA}${path}`
  if (persona === 'host' && matches(path, SHARED)) return `${SAITO}${path}`
  return path
}

/** Hook form of pathFor for the current persona. */
export function usePath() {
  const persona = useStore((s) => s.persona)
  return (path: string) => pathFor(persona, path)
}

/** Layout for /aisha/* and /saito/*: opening any of these URLs puts the app in that persona's view. */
export function PersonaScope({ persona }: { persona: 'tenant' | 'host' }) {
  const current = useStore((s) => s.persona)
  const setPersona = useStore((s) => s.setPersona)
  useEffect(() => {
    if (current !== persona) setPersona(persona)
  }, [current, persona, setPersona])
  return createElement(Outlet)
}

/** /aisha: her stay when she lives there (trial onward), otherwise Explore. */
export function AishaHome() {
  const lives = useStore((s) => s.match.applicantId === 'a1' && ['trial', 'pact', 'living'].includes(s.match.stage))
  return createElement(Navigate, { to: lives ? `${AISHA}/stay` : `${AISHA}/explore`, replace: true })
}

/** Old URLs forward to the persona prefix, keeping params and query: /explore -> /aisha/explore, /host/x -> /saito/x. */
export function Forward({ to }: { to: 'aisha' | 'saito' }) {
  const { pathname, search } = useLocation()
  const next = to === 'aisha' ? `${AISHA}${pathname}` : pathname.replace(/^\/host/, SAITO)
  return createElement(Navigate, { to: `${next}${search}`, replace: true })
}
