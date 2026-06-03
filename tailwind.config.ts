import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noble: {
          gold: '#C9A84C',
          dark: '#1a1a2e',
          cream: '#f5f0e8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
