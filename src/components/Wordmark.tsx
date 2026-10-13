export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const big = size === 'lg'
  return (
    <span className="inline-flex items-center gap-[8px]" aria-label="Tomoni">
      <svg width={big ? 44 : 26} height={big ? 44 : 26} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="10" fill="#7050F8" />
        <circle cx="12" cy="13" r="4" fill="#fff" />
        <circle cx="21.500" cy="15" r="3.200" fill="#3CD0BD" />
        <path d="M5.500 26c1-5.500 5.500-7.500 8.500-7.500s6.500 2 7.500 7.500z" fill="#fff" />
        <path d="M17 26c.600-3 2.500-4.500 4.500-4.500S25.500 23 26 26z" fill="#3CD0BD" />
      </svg>
      <span className={`font-heading font-semibold tracking-tight ${big ? 'text-4xl' : 'text-[20px]'}`}>Tomoni</span>
    </span>
  )
}
