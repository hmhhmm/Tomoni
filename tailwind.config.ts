import type { Config } from 'tailwindcss'
import { colors, fonts, radius, shadow } from './src/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...colors },
      fontFamily: { heading: [...fonts.heading], body: [...fonts.body] },
      borderRadius: { card: radius.card, sheet: radius.sheet, input: radius.input },
      boxShadow: { soft: shadow.soft, lift: shadow.lift, phone: shadow.phone },
      fontSize: { xs: '0.85rem', sm: '0.95rem' },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
      },
      animation: { shake: 'shake .3s ease-in-out' },
    },
  },
  plugins: [],
} satisfies Config
