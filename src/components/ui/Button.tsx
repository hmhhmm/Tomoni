import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

const variants = {
  // Airbnb-style red. Gradient stops all keep white text at 4.5:1 or better.
  primary: 'bg-gradient-to-r from-brand-400 via-brand-600 to-brand-700 text-white hover:brightness-95',
  dark: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-ink bg-white text-ink hover:bg-surface',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-ink underline-offset-4 hover:underline',
  danger: 'bg-rose-700 text-white hover:opacity-90',
  teal: 'bg-teal-700 text-white hover:opacity-90',
}
const sizes = { sm: 'min-h-10 px-4 py-1.5 text-sm', md: 'min-h-12 px-5 py-2 text-base', lg: 'min-h-14 px-7 py-2.5 text-base' }

type Common = {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  icon?: ReactNode
  block?: boolean
  children?: ReactNode
  className?: string
}

const cls = (c: Common) =>
  `inline-flex max-w-full select-none items-center justify-center gap-2 rounded-btn text-center font-semibold leading-snug transition duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${variants[c.variant ?? 'primary']} ${sizes[c.size ?? 'md']} ${c.block ? 'w-full' : ''} ${c.className ?? ''}`

export function Button({ variant, size, icon, block, children, className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest} className={cls({ variant, size, block, className })}>
      {icon}
      {children}
    </button>
  )
}

export function LinkButton({ variant, size, icon, block, children, className, ...rest }: Common & LinkProps) {
  return (
    <Link {...rest} className={cls({ variant, size, block, className })}>
      {icon}
      {children}
    </Link>
  )
}
