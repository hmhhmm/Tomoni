/**
 * Design tokens: single source of truth for colour, radius, shadow, type and product rules.
 * tailwind.config.ts imports this file, so utilities and TypeScript always agree.
 *
 * Structure follows Airbnb's restraint: near-black text on white, hairline borders,
 * ONE accent used sparingly (primary action, search button, saved heart, active tab).
 * Accent: Airbnb-style red (see `brand`). Earlier versions used the pitch deck's purple #B9A2FF / #7050F8 for text and
 * buttons (5.0:1 on white); teal #3CD0BD deepened to #0B7A6B for text (5.2:1).
 */
export const colors = {
  bg: '#FFFFFF',
  surface: '#FAFAF8',
  card: '#FFFFFF',
  ink: '#222222',
  muted: '#6A6A6A',
  line: '#DDDDDD',
  /** Outline of form controls: 3.45:1 on white (WCAG 1.4.11 needs 3:1). `line` stays for card hairlines. */
  field: '#8A8A8A',
  soft: '#EBEBEB',
  teal: {
    50: '#EAF8F5',
    100: '#CDF2EC',
    300: '#3CD0BD',
    500: '#14A592',
    700: '#0B7A6B',
  },
  amber: { 50: '#FFF6E5', 200: '#F6D58E', 700: '#8A5300' },
  rose: { 50: '#FFF0F0', 200: '#F5B5B5', 700: '#B3261E' },
  /**
   * Brand red, after Airbnb's "Rausch". It replaced the original purple accent.
   * 500 is the logo red, fills only (white text on it is 3.5:1). 600 and 700 pass AA as text on white
   * and with white text (4.6:1 and 5.1:1); buttons use the 400 -> 600 -> 700 gradient.
   */
  brand: { 50: '#FFF0F3', 100: '#FFE1E7', 200: '#FFB3C1', 400: '#E61E4D', 500: '#FF385C', 600: '#E31C5F', 700: '#D70466' },
} as const

export const radius = { chip: '999px', card: '16px', sheet: '20px', input: '12px', btn: '10px' } as const

export const shadow = {
  soft: '0 1px 2px rgba(0,0,0,.08)',
  lift: '0 6px 16px rgba(0,0,0,.12)',
  pop: '0 8px 28px rgba(0,0,0,.16)',
} as const

export const fonts = {
  heading: ['Poppins', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
  body: ['"DM Sans"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
} as const

/** Illustration hue for Mrs Sato's home and avatar: warm and neutral, so it never competes with the brand red. */
export const SATO_HUE = 32

/** Rules of the product, shared by UI and logic. */
export const RULES = {
  weeklyHourCap: 10,
  /** Check-in photos and voice notes are deleted after this many days unless kept as evidence. */
  mediaDays: 30,
  studentWeeklyLimit: 28,
  membershipYen: 8000,
  weeksPerMonth: 52 / 12,
  /** Root font sizes per persona for text-size levels A / A+ / A++ */
  rootPx: { host: [18, 20, 22], family: [17, 19, 21], tenant: [16, 18, 20], none: [16, 17, 18] },
} as const
