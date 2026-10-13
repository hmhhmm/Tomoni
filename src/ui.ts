import { create } from 'zustand'

/** Transient UI state (not persisted). */
interface UI {
  toast: string | null
  demoOpen: boolean
  say: (m: string) => void
  setDemoOpen: (v: boolean) => void
}

let timer: ReturnType<typeof setTimeout> | undefined
export const useUI = create<UI>((set) => ({
  toast: null,
  demoOpen: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1',
  say: (toast) => {
    set({ toast })
    clearTimeout(timer)
    timer = setTimeout(() => set({ toast: null }), 3200)
  },
  setDemoOpen: (demoOpen) => set({ demoOpen }),
}))
