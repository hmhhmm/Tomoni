import { create } from 'zustand'

/** Transient UI state (not persisted). */
interface UI {
  toast: string | null
  say: (m: string) => void
}

let timer: ReturnType<typeof setTimeout> | undefined
export const useUI = create<UI>((set) => ({
  toast: null,
  say: (toast) => {
    set({ toast })
    clearTimeout(timer)
    timer = setTimeout(() => set({ toast: null }), 3200)
  },
}))
