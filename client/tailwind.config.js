/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces & borders (light). Names kept for continuity; values are now
        // the warm-ivory / white / hairline scale used on a light background.
        ink: {
          DEFAULT: '#faf8f3',
          900: '#faf8f3', // page background — warm ivory
          800: '#ffffff', // cards & raised surfaces
          700: '#ece9e2', // hairline borders / subtle fills
          600: '#dbd6cb', // stronger borders
        },
        // Text ramp: 100 = darkest (headings) → 600 = faintest (labels).
        silver: {
          DEFAULT: '#6b6456',
          100: '#1a1813', // headings — warm near-black
          200: '#2f2c24', // strong body
          300: '#413c31', // body emphasis
          400: '#6b6456', // muted body
          500: '#8a8474', // faint
          600: '#a8a191', // faintest / labels
        },
        // Brand accent.
        gold: {
          DEFAULT: '#a9822b',
          light: '#c1953a',
          dark: '#7d5f16',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        brand: '0.35em',
      },
      boxShadow: {
        glow: '0 24px 60px -30px rgba(169,130,43,0.35)',
        card: '0 1px 2px rgba(26,24,19,0.04), 0 8px 24px -16px rgba(26,24,19,0.18)',
      },
    },
  },
  plugins: [],
};
