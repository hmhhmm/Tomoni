export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const big = size === 'lg'
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={big ? 40 : 30} height={big ? 40 : 30} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#FF385C" />
        <circle cx="12" cy="13" r="4" fill="#fff" />
        <circle cx="21.5" cy="15" r="3.2" fill="#3CD0BD" />
        <path d="M5.5 26c1-5.5 5.5-7.5 8.5-7.5s6.5 2 7.5 7.5z" fill="#fff" />
        <path d="M17 26c.6-3 2.5-4.5 4.5-4.5S25.5 23 26 26z" fill="#3CD0BD" />
      </svg>
      <span className={`font-heading font-semibold tracking-tight text-brand-600 ${big ? 'text-3xl' : 'hidden text-[22px] sm:inline'}`}>Tomoni</span>
    </span>
  )
}
