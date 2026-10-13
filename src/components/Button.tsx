import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-soft',
  teal: 'bg-teal-700 text-white hover:bg-teal-700/90 shadow-soft',
  secondary: 'bg-white text-ink border border-line hover:border-purple-200',
  soft: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  ghost: 'bg-transparent text-purple-700 hover:bg-purple-50',
  danger: 'bg-rose-700 text-white hover:bg-rose-700/90',
}

export function Button({
  variant = 'primary', icon, children, block = true, className = '', ...rest
}: { variant?: keyof typeof variants; icon?: ReactNode; block?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-2 text-base font-semibold transition duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${block ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}
