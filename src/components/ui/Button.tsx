import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600',
  dark: 'bg-ink text-white hover:bg-black',
  secondary: 'border border-ink bg-white text-ink hover:bg-surface',
  soft: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
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
