import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Accessible modal on the native <dialog> element (focus trap and Esc come free). */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size]
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-labelledby="modal-title"
      className="m-auto w-full p-0 backdrop:bg-black/50 max-sm:m-0 max-sm:mt-auto max-sm:max-w-none"
    >
      <div className={`mx-auto flex max-h-[90dvh] w-full ${w} flex-col overflow-hidden rounded-sheet bg-white shadow-pop max-sm:rounded-b-none`}>
        <div className="flex items-center justify-between gap-3 border-b border-soft px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface"
          >
            <X size={20} aria-hidden />
          </button>
          <h2 id="modal-title" className="flex-1 text-center text-base font-semibold">
            {title}
          </h2>
          <span className="w-10" aria-hidden />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-between gap-3 border-t border-soft px-5 py-3">{footer}</div>}
      </div>
    </dialog>
  )
}
