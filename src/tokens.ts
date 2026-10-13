/**
 * Design tokens: single source of truth for colour, radius, shadow, type and product rules.
 * tailwind.config.ts imports this file, so utilities and TypeScript always agree.
 *
 * Structure follows Airbnb's restraint: near-black text on white, hairline borders,
 * ONE accent used sparingly (primary action, search button, saved heart, active tab).
 * Brand continuity with the pitch deck: purple #B9A2FF deepened to #7050F8 for text and
 * buttons (5.0:1 on white); teal #3CD0BD deepened to #0B7A6B for text (5.2:1).
 */
export const colors = {
  bg: '#FFFFFF',
  surface: '#FAFAF8',
  card: '#FFFFFF',
  ink: '#222222',
  muted: '#6A6A6A',
  line: '#DDDDDD',
  soft: '#EBEBEB',
  purple: {
    50: '#F6F3FF',
    100: '#ECE6FF',
    200: '#B9A2FF',
    500: '#7C5CFF',
    600: '#7050F8',
    700: '#5A3CE0',
  },
  teal: {
    50: '#EAF8F5',
    100: '#CDF2EC',
    300: '#3CD0BD',
    500: '#14A592',
    700: '#0B7A6B',
  },
  amber: { 50: '#FFF6E5', 200: '#F6D58E', 700: '#8A5300' },
  rose: { 50: '#FFF0F0', 200: '#F5B5B5', 700: '#B3261E' },
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

/** Rules of the product, shared by UI and logic. */
export const RULES = {
  weeklyHourCap: 10,
  studentWeeklyLimit: 28,
  membershipYen: 8000,
  weeksPerMonth: 52 / 12,
  /** Root font sizes per persona for text-size levels A / A+ / A++ */
  rootPx: { host: [18, 20, 22], family: [17, 19, 21], tenant: [16, 18, 20], none: [16, 17, 18] },
} as const
