import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#e8c96b',
          DEFAULT: '#c89b3c',
          dark: '#9c7a1f',
        },
        obsidian: {
          light: '#1e2a45',
          DEFAULT: '#16213e',
          dark: '#0d0d1a',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      animation: {
        'pulse-gold': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
