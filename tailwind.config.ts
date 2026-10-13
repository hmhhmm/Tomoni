import type { Config } from 'tailwindcss'
import { colors, fonts, radius, shadow } from './src/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...colors },
      fontFamily: { heading: [...fonts.heading], body: [...fonts.body] },
      borderRadius: { card: radius.card, sheet: radius.sheet, input: radius.input, btn: radius.btn },
      boxShadow: { soft: shadow.soft, lift: shadow.lift, pop: shadow.pop },
      fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } },
      },
      animation: { shake: 'shake .3s ease-in-out', pop: 'pop .18s ease-out' },
    },
  },
  plugins: [],
} satisfies Config
