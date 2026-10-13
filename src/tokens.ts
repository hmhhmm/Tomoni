/**
 * Design tokens: the single source of truth for colour, radius, shadow and type.
 * tailwind.config.ts imports this file, so utilities (bg-purple-600, rounded-card...)
 * and TypeScript code (e.g. SVG strokes) always agree.
 *
 * Brand continuity with the pitch deck:
 *   accent purple  #B9A2FF  -> deepened to #7050F8 for text/buttons on white (5.0:1)
 *   accent teal    #3CD0BD  -> deepened to #0B7A6B for text on white (5.2:1)
 */
export const colors = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  ink: '#151517',
  muted: '#6B6B70',
  line: '#E7E5E0',
  purple: {
    50: '#F4F1FF',
    100: '#E9E2FF',
    200: '#B9A2FF', // brand accent (decorative / fills)
    500: '#7C5CFF',
    600: '#7050F8', // text + buttons on white, AA
    700: '#5A3CE0',
  },
  teal: {
    50: '#E9F9F6',
    100: '#CDF2EC',
    300: '#3CD0BD', // brand accent (decorative / fills)
    500: '#14A592',
    700: '#0B7A6B', // text on white, AA
  },
  amber: { 50: '#FFF6E5', 200: '#F6D58E', 700: '#8A5300' },
  rose: { 50: '#FFF0F0', 200: '#F5B5B5', 700: '#B3261E' },
} as const

export const radius = { chip: '999px', card: '24px', sheet: '28px', input: '16px' } as const

export const shadow = {
  soft: '0 1px 2px rgba(21,21,23,.04), 0 4px 12px rgba(21,21,23,.05)',
  lift: '0 2px 4px rgba(21,21,23,.05), 0 12px 32px rgba(21,21,23,.10)',
  phone: '0 30px 80px rgba(60,40,140,.22), 0 8px 24px rgba(21,21,23,.12)',
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
} as const
