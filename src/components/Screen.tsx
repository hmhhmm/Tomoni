import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ConceptFooter } from './Misc'

/** Standard screen body: one H1, optional lede, content, optional concept footer. */
export function Screen({ title, lede, children, footer = false, action }: { title: string; lede?: string; children: ReactNode; footer?: boolean; action?: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="px-4 pb-8 pt-4">
      <h1 className="text-[1.6rem] font-semibold leading-tight">{title}</h1>
      {lede && <p className="mt-1.5 text-base text-muted">{lede}</p>}
      <div className="mt-5 space-y-4">{children}</div>
      {action && <div className="mt-6">{action}</div>}
      {footer && <ConceptFooter />}
    </motion.section>
  )
}
